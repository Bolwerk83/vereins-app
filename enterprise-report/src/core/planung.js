// =========================================================================
//  PLANUNG — Budget / Forecast / Szenarien.
//  Ziel: alle haben dieselbe Vorstellung von den Werten. Der Controller steuert
//  zwischen Top-Down (Zielvorgabe von oben) und Bottom-Up (Mengen je Produkt).
//
//  Kern-Mechanik:
//   - Je Produkt wird die ABSATZMENGE geplant → Umsatz = Menge × VK-Preis.
//   - Wareneinsatz = (Absatz × (1 + Schwund) + Produktion ohne Umsatz) × EK-Preis.
//     (Mehrbedarf, weil Teile/Räder kaputtgehen/verschwinden; Sponsoren/Aus-
//      stellung verursachen Kosten ohne Umsatz.)
//   - Eingabe bidirektional: Menge → Betrag ODER Betrag → Menge (über den Preis).
//   - Top-Down: ein Ziel-Umsatz wird über die aktuellen Anteile heruntergebrochen.
//   - Liquidität: Zahlungsziele verschieben Ein-/Auszahlungen (Vorschau).
//
//  Pläne liegen in localStorage; „kopieren von" erzeugt eine Vorlage.
// =========================================================================

const r0 = (x) => Math.round(x)
const r2 = (x) => Math.round(x * 100) / 100

// Stammdaten der planbaren Produkte (VK/EK-Preis, Zahlungsziele in Tagen).
export const PLAN_PRODUKTE = [
  { id: 'ebike',      name: 'E-Bikes',     vkPreis: 1499, ekPreis: 980, zahlzielVk: 30, zahlzielEk: 14 },
  { id: 'akku',       name: 'Akkus 625Wh', vkPreis: 749,  ekPreis: 210, zahlzielVk: 30, zahlzielEk: 14 },
  { id: 'zubehoer',   name: 'Zubehör',     vkPreis: 49,   ekPreis: 28,  zahlzielVk: 14, zahlzielEk: 21 },
  { id: 'bekleidung', name: 'Bekleidung',  vkPreis: 79,   ekPreis: 35,  zahlzielVk: 14, zahlzielEk: 30 }
]
export const produktVon = (id) => PLAN_PRODUKTE.find((p) => p.id === id) || null

export const PLAN_TYPEN = [
  { id: 'budget',   name: 'Budget' },
  { id: 'forecast', name: 'Forecast' },
  { id: 'best',     name: 'Best Case' },
  { id: 'worst',    name: 'Worst Case' }
]

// AE→Umsatz: aus Erfahrung werden ~92 % des Auftragseingangs zu Umsatzerlösen
// (Rest: Stornos, Verschiebungen). Für die Vertriebs-Hochrechnung.
export const AE_UMSATZ_FAKTOR = 0.92

const KEY = 'er_plaene'
function ladeAlle() { try { return JSON.parse(localStorage.getItem(KEY) || '[]') } catch { return [] } }
function speichereAlle(arr) { try { localStorage.setItem(KEY, JSON.stringify(arr)) } catch {}; return arr }

/** Leere Plan-Zeilen (Menge 0) als Startpunkt. */
function leereZeilen() {
  const z = {}
  for (const p of PLAN_PRODUKTE) z[p.id] = { menge: 0, ohneUmsatz: 0 }
  return z
}

export function ladePlaene() {
  const arr = ladeAlle()
  if (arr.length) return arr
  // Seed: ein Beispiel-Budget, damit der Bereich nicht leer startet.
  const seed = [{
    id: 'plan-basis', name: 'Budget 2026', typ: 'budget', jahr: 2026, schwundPct: 3,
    zeilen: { ebike: { menge: 24000, ohneUmsatz: 120 }, akku: { menge: 31000, ohneUmsatz: 60 },
      zubehoer: { menge: 90000, ohneUmsatz: 0 }, bekleidung: { menge: 40000, ohneUmsatz: 200 } }
  }]
  return speichereAlle(seed)
}
export function planVon(id) { return ladePlaene().find((p) => p.id === id) || null }

export function neuerPlan(name = 'Neuer Plan', typ = 'budget', jahr = 2026) {
  const plan = { id: 'plan-' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6), name, typ, jahr, schwundPct: 3, zeilen: leereZeilen() }
  speichereAlle([...ladePlaene(), plan])
  return plan
}
/** „Kopieren von": Plan als Vorlage duplizieren. */
export function kopierePlan(id, name) {
  const q = planVon(id); if (!q) return null
  const plan = { ...JSON.parse(JSON.stringify(q)), id: 'plan-' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6), name: name || `${q.name} (Kopie)` }
  speichereAlle([...ladePlaene(), plan])
  return plan
}
export function speicherePlan(plan) {
  const arr = ladePlaene()
  const i = arr.findIndex((p) => p.id === plan.id)
  if (i >= 0) arr[i] = plan; else arr.push(plan)
  return speichereAlle(arr)
}
export function loeschePlan(id) { return speichereAlle(ladePlaene().filter((p) => p.id !== id)) }

/** Eine Plan-Zeile berechnen (Umsatz, Wareneinsatz inkl. Schwund + ohne-Umsatz, DB). */
export function rechneZeile(prodId, zeile, schwundPct = 0) {
  const p = produktVon(prodId); if (!p) return null
  const menge = Math.max(0, zeile?.menge || 0)
  const ohneUmsatz = Math.max(0, zeile?.ohneUmsatz || 0)
  const umsatz = r0(menge * p.vkPreis)
  // Mehrbedarf: Schwund auf den Absatz + Stück ohne Umsatz müssen ebenfalls beschafft/produziert werden.
  const beschaffungsmenge = r0(menge * (1 + schwundPct / 100) + ohneUmsatz)
  const wareneinsatz = r0(beschaffungsmenge * p.ekPreis)
  const db = umsatz - wareneinsatz
  return { prodId, name: p.name, menge, ohneUmsatz, vkPreis: p.vkPreis, ekPreis: p.ekPreis, umsatz, beschaffungsmenge, wareneinsatz, db }
}

/** Ganzen Plan berechnen (Bottom-Up-Rollup über alle Produkte). */
export function rechnePlan(plan) {
  if (!plan) return { zeilen: [], umsatz: 0, wareneinsatz: 0, db: 0, dbQuote: 0, ae: 0 }
  const zeilen = PLAN_PRODUKTE.map((p) => rechneZeile(p.id, plan.zeilen?.[p.id], plan.schwundPct || 0))
  const umsatz = zeilen.reduce((n, z) => n + z.umsatz, 0)
  const wareneinsatz = zeilen.reduce((n, z) => n + z.wareneinsatz, 0)
  const db = umsatz - wareneinsatz
  return {
    zeilen, umsatz, wareneinsatz, db,
    dbQuote: umsatz ? r2(db / umsatz * 100) : 0,
    // Vertrieb: welcher Auftragseingang ist nötig, damit dieser Umsatz entsteht?
    ae: AE_UMSATZ_FAKTOR ? r0(umsatz / AE_UMSATZ_FAKTOR) : umsatz
  }
}

/**
 * Top-Down: Ziel-Umsatz über die aktuellen Umsatzanteile auf die Mengen
 * herunterbrechen (über den VK-Preis je Produkt). Gibt einen NEUEN Plan zurück.
 */
export function topDownVerteilung(plan, zielUmsatz) {
  const ist = rechnePlan(plan)
  const basis = ist.umsatz || 1
  const zeilen = { ...plan.zeilen }
  for (const p of PLAN_PRODUKTE) {
    const z = ist.zeilen.find((x) => x.prodId === p.id)
    const anteil = z.umsatz / basis
    const neuUmsatz = zielUmsatz * anteil
    zeilen[p.id] = { ...zeilen[p.id], menge: r0(neuUmsatz / p.vkPreis) }
  }
  return { ...plan, zeilen }
}

/** Betrag → Menge: aus einem Umsatzbetrag die Menge über den VK-Preis ableiten. */
export function mengeAusBetrag(prodId, betrag) {
  const p = produktVon(prodId); if (!p || !p.vkPreis) return 0
  return r0(betrag / p.vkPreis)
}

/**
 * Liquiditätsvorschau (12 Monate): Umsatz/Wareneinsatz gleichmäßig über das
 * Jahr verteilt, aber um die Zahlungsziele verschoben (Geld kommt/geht später).
 * Liefert je Monat Einzahlung, Auszahlung, Netto und kumuliert.
 */
export function liquiditaet(plan) {
  const ein = new Array(12).fill(0)
  const aus = new Array(12).fill(0)
  for (const p of PLAN_PRODUKTE) {
    const z = rechneZeile(p.id, plan.zeilen?.[p.id], plan.schwundPct || 0)
    const umMonat = z.umsatz / 12
    const weMonat = z.wareneinsatz / 12
    const shiftVk = Math.round((p.zahlzielVk || 0) / 30) // Zahlungsziel in Monaten (gerundet)
    const shiftEk = Math.round((p.zahlzielEk || 0) / 30)
    for (let m = 0; m < 12; m++) {
      if (m + shiftVk < 12) ein[m + shiftVk] += umMonat
      if (m + shiftEk < 12) aus[m + shiftEk] += weMonat
    }
  }
  let kum = 0
  return ein.map((e, m) => {
    const netto = e - aus[m]; kum += netto
    return { monat: m + 1, ein: r0(e), aus: r0(aus[m]), netto: r0(netto), kumuliert: r0(kum) }
  })
}
