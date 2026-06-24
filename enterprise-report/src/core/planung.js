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

// Stammdaten der planbaren Produkte (VK/EK-Preis, Zahlungsziele in Tagen,
// wbzTage = Wiederbeschaffungszeit Material/Einkauf, produktionsTage = Fertigung).
export const PLAN_PRODUKTE = [
  { id: 'ebike',      name: 'E-Bikes',     vkPreis: 1499, ekPreis: 980, zahlzielVk: 30, zahlzielEk: 14, wbzTage: 28, produktionsTage: 21 },
  { id: 'akku',       name: 'Akkus 625Wh', vkPreis: 749,  ekPreis: 210, zahlzielVk: 30, zahlzielEk: 14, wbzTage: 28, produktionsTage: 7 },
  { id: 'zubehoer',   name: 'Zubehör',     vkPreis: 49,   ekPreis: 28,  zahlzielVk: 14, zahlzielEk: 21, wbzTage: 21, produktionsTage: 0 },
  { id: 'bekleidung', name: 'Bekleidung',  vkPreis: 79,   ekPreis: 35,  zahlzielVk: 14, zahlzielEk: 30, wbzTage: 30, produktionsTage: 0 }
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

// Verteilungsschlüssel („splashen"): wie ein Jahreswert auf 12 Monate verteilt
// wird. gewichte werden intern normiert (Summe = 1).
export const VERTEILSCHLUESSEL = [
  { id: 'gleich',      name: 'Gleichmäßig',         gewichte: [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1] },
  { id: 'saison_bike', name: 'Saison (Bike-Frühjahr/Sommer)', gewichte: [3, 4, 7, 10, 12, 12, 11, 9, 7, 5, 4, 3] },
  { id: 'quartalsende',name: 'Quartalslastig (Mär/Jun/Sep/Dez)', gewichte: [1, 1, 3, 1, 1, 3, 1, 1, 3, 1, 1, 3] },
  { id: 'wachstum',    name: 'Wachsend (Hochlauf)', gewichte: [5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16] },
  { id: 'jahresende',  name: 'Jahresendlastig (Q4)', gewichte: [4, 4, 5, 5, 6, 6, 7, 8, 10, 13, 16, 16] }
]
export const schluesselVon = (id) => verteilschluesselListe().find((s) => s.id === id) || VERTEILSCHLUESSEL[0]

/** Jahreswert über einen Verteilungsschlüssel auf 12 Monate „splashen". */
export function verteile(jahreswert, schluesselId = 'gleich') {
  const g = schluesselVon(schluesselId).gewichte
  const summe = g.reduce((a, b) => a + b, 0) || 1
  return g.map((w) => jahreswert * w / summe)
}

// =========================================================================
//  VORSCHLAGSWERTE — Planung muss nicht bei null beginnen. Aus dem Vorjahr-Ist
//  je Produkt werden Mengen, Saison (Verteilungsschlüssel) und ein produkt-
//  individueller Trend vorgeschlagen. So entsteht in einem Klick ein
//  realistischer Startplan, den man danach feinjustiert.
//
//  PLAN_VORJAHR: Jahres-Absatzmenge des Vorjahres, „ohne Umsatz"-Stück (Muster/
//  Sponsoring), produktindividueller Trend (%) und die echte Monats-Saison
//  (Jan–Dez, Gewichte werden normiert).
// =========================================================================
export const PLAN_VORJAHR = {
  ebike:      { menge: 21800, ohneUmsatz: 120, wachstum: 9,  monate: [3, 4, 7, 11, 13, 13, 11, 9, 6, 4, 3, 2] },
  akku:       { menge: 28500, ohneUmsatz: 60,  wachstum: 6,  monate: [4, 5, 7, 10, 12, 12, 10, 9, 7, 6, 5, 5] },
  zubehoer:   { menge: 86000, ohneUmsatz: 0,   wachstum: 1,  monate: [6, 6, 7, 8, 9, 9, 9, 8, 8, 8, 11, 11] },
  bekleidung: { menge: 38500, ohneUmsatz: 200, wachstum: -6, monate: [5, 6, 9, 11, 11, 9, 7, 7, 9, 10, 8, 6] }
}

/** Verteilungsschlüssel aus dem Vorjahr: umsatzgewichtete Monats-Saison über
 *  alle Produkte (so dominiert das margen-/umsatzstarke E-Bike-Geschäft). */
export function vorjahrMonatsgewichte() {
  const g = new Array(12).fill(0)
  for (const p of PLAN_PRODUKTE) {
    const vj = PLAN_VORJAHR[p.id]; if (!vj) continue
    const s = vj.monate.reduce((a, b) => a + b, 0) || 1
    const jahresUmsatz = vj.menge * p.vkPreis
    for (let m = 0; m < 12; m++) g[m] += jahresUmsatz * vj.monate[m] / s
  }
  const max = Math.max(...g) || 1
  return g.map((x) => +(x / max * 16).toFixed(1)) // auf handliche Gewichte normiert
}

/** Auswählbare Verteilungsschlüssel inkl. des dynamischen „Aus Vorjahr". */
export function verteilschluesselListe() {
  return [...VERTEILSCHLUESSEL, { id: 'vorjahr', name: 'Aus Vorjahr (echte Saison)', gewichte: vorjahrMonatsgewichte() }]
}

// Vorschlags-Modi: kreativ, aber regelbasiert (kein KI nötig).
export const VORSCHLAG_MODI = [
  { id: 'wachstum',   name: 'Vorjahr + Wachstum',     hinweis: 'Alle Mengen aus dem Vorjahr, gleichmäßig um X % erhöht.' },
  { id: 'markttrend', name: 'Markttrend je Produkt',  hinweis: 'Jedes Produkt mit seinem eigenen Vorjahres-Trend (E-Bikes +, Bekleidung −).' },
  { id: 'flach',      name: 'Vorjahr unverändert',    hinweis: 'Mengen exakt wie im Vorjahr (Nullrunde) — als Diskussionsbasis.' }
]

/** Vorschau der Vorschlagswerte je Produkt (Vorjahr → Vorschlag). */
export function vorschlagDetails({ modus = 'wachstum', wachstumPct = 5 } = {}) {
  return PLAN_PRODUKTE.map((p) => {
    const vj = PLAN_VORJAHR[p.id] || { menge: 0, ohneUmsatz: 0, wachstum: 0 }
    const g = modus === 'markttrend' ? vj.wachstum : (modus === 'flach' ? 0 : Number(wachstumPct) || 0)
    const menge = Math.max(0, r0(vj.menge * (1 + g / 100)))
    return {
      prodId: p.id, name: p.name, vkPreis: p.vkPreis,
      vorjahrMenge: vj.menge, wachstumPct: g, menge, ohneUmsatz: vj.ohneUmsatz || 0,
      vorjahrUmsatz: r0(vj.menge * p.vkPreis), umsatz: r0(menge * p.vkPreis)
    }
  })
}

/** Aus dem Vorjahr einen Startplan vorschlagen (Mengen + Saison-Schlüssel). */
export function planVorschlag(plan, opts = {}) {
  const det = vorschlagDetails(opts)
  const zeilen = {}
  for (const d of det) zeilen[d.prodId] = { menge: d.menge, ohneUmsatz: d.ohneUmsatz }
  return { ...plan, zeilen, schluessel: 'vorjahr' }
}

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
    id: 'plan-basis', name: 'Budget 2026', typ: 'budget', jahr: 2026, schwundPct: 3, schluessel: 'saison_bike',
    zeilen: { ebike: { menge: 24000, ohneUmsatz: 120 }, akku: { menge: 31000, ohneUmsatz: 60 },
      zubehoer: { menge: 90000, ohneUmsatz: 0 }, bekleidung: { menge: 40000, ohneUmsatz: 200 } }
  }]
  return speichereAlle(seed)
}
export function planVon(id) { return ladePlaene().find((p) => p.id === id) || null }

export function neuerPlan(name = 'Neuer Plan', typ = 'budget', jahr = 2026) {
  const plan = { id: 'plan-' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6), name, typ, jahr, schwundPct: 3, schluessel: 'saison_bike', zeilen: leereZeilen() }
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
 * Monatsverteilung („Splash"): Jahres-Plan je Produkt über den gewählten
 * Verteilungsschlüssel auf 12 Monate verteilen. Liefert je Monat die Summen
 * über alle Produkte (Menge, Umsatz, Wareneinsatz, DB).
 */
export function monatsVerteilung(plan) {
  const sId = plan?.schluessel || 'gleich'
  const monate = Array.from({ length: 12 }, (_, m) => ({ monat: m + 1, menge: 0, umsatz: 0, wareneinsatz: 0, db: 0 }))
  for (const p of PLAN_PRODUKTE) {
    const z = rechneZeile(p.id, plan.zeilen?.[p.id], plan.schwundPct || 0)
    const mMenge = verteile(z.menge, sId)
    const mUms = verteile(z.umsatz, sId)
    const mWe = verteile(z.wareneinsatz, sId)
    for (let m = 0; m < 12; m++) {
      monate[m].menge += mMenge[m]; monate[m].umsatz += mUms[m]; monate[m].wareneinsatz += mWe[m]
    }
  }
  return monate.map((x) => ({ monat: x.monat, menge: r0(x.menge), umsatz: r0(x.umsatz), wareneinsatz: r0(x.wareneinsatz), db: r0(x.umsatz - x.wareneinsatz) }))
}

/**
 * Liquiditätsvorschau (12 Monate): Umsatz/Wareneinsatz über den Verteilungs-
 * schlüssel „gesplasht" und um die Zahlungsziele verschoben (Geld kommt/geht
 * später). Liefert je Monat Einzahlung, Auszahlung, Netto und kumuliert.
 */
export function liquiditaet(plan) {
  const sId = plan?.schluessel || 'gleich'
  const ein = new Array(12).fill(0)
  const aus = new Array(12).fill(0)
  for (const p of PLAN_PRODUKTE) {
    const z = rechneZeile(p.id, plan.zeilen?.[p.id], plan.schwundPct || 0)
    const mUms = verteile(z.umsatz, sId)
    const mWe = verteile(z.wareneinsatz, sId)
    const shiftVk = Math.round((p.zahlzielVk || 0) / 30) // Zahlungsziel in Monaten (gerundet)
    const shiftEk = Math.round((p.zahlzielEk || 0) / 30)
    for (let m = 0; m < 12; m++) {
      if (m + shiftVk < 12) ein[m + shiftVk] += mUms[m]
      if (m + shiftEk < 12) aus[m + shiftEk] += mWe[m]
    }
  }
  let kum = 0
  return ein.map((e, m) => {
    const netto = e - aus[m]; kum += netto
    return { monat: m + 1, ein: r0(e), aus: r0(aus[m]), netto: r0(netto), kumuliert: r0(kum) }
  })
}

/** Mehrere Pläne (Szenarien) nebeneinander vergleichen — Kennzahlen + Delta zur Basis. */
export function vergleiche(planIds = []) {
  const plaene = ladePlaene()
  const spalten = planIds.map((id) => plaene.find((p) => p.id === id)).filter(Boolean).map((plan) => {
    const erg = rechnePlan(plan)
    const liq = liquiditaet(plan)
    return {
      id: plan.id, name: plan.name, typ: plan.typ, jahr: plan.jahr,
      umsatz: erg.umsatz, wareneinsatz: erg.wareneinsatz, db: erg.db, dbQuote: erg.dbQuote,
      ae: erg.ae, liqEnde: liq[11]?.kumuliert || 0, liqTief: Math.min(...liq.map((m) => m.kumuliert))
    }
  })
  const basis = spalten[0] || null
  const kennzahlen = [
    { key: 'umsatz', name: 'Umsatzerlöse', einheit: 'eur' },
    { key: 'wareneinsatz', name: 'Wareneinsatz', einheit: 'eur' },
    { key: 'db', name: 'Deckungsbeitrag', einheit: 'eur' },
    { key: 'dbQuote', name: 'DB-Quote', einheit: 'pct' },
    { key: 'ae', name: 'Nötiger Auftragseingang', einheit: 'eur' },
    { key: 'liqEnde', name: 'Liquidität Jahresende', einheit: 'eur' },
    { key: 'liqTief', name: 'Liquiditäts-Tief', einheit: 'eur' }
  ]
  return { spalten, basis, kennzahlen }
}

const MONNAMEN = ['Jan', 'Feb', 'Mär', 'Apr', 'Mai', 'Jun', 'Jul', 'Aug', 'Sep', 'Okt', 'Nov', 'Dez']
const isoMinusTage = (datum, tage) => { const d = new Date(datum); d.setDate(d.getDate() - tage); return d.toISOString().slice(0, 10) }

/**
 * Termin-/Beschaffungssicht: aus der saisonalen Planmenge je Produkt den
 * Bedarfs-Spitzenmonat bestimmen und rückwärts die spätesten Termine rechnen:
 *  - spätester Produktionsstart = Bedarf − (Produktionszeit + Puffer)
 *  - spätester Bestelltermin (Einkauf) = Bedarf − (WBZ + Produktionszeit + Puffer)
 */
export function terminplanung(plan, pufferTage = 30) {
  const sId = plan?.schluessel || 'gleich'
  return PLAN_PRODUKTE.map((p) => {
    const jahresMenge = Math.max(0, plan?.zeilen?.[p.id]?.menge || 0)
    const monatlich = verteile(jahresMenge, sId)
    let peak = 0; for (let i = 1; i < 12; i++) if (monatlich[i] > monatlich[peak]) peak = i
    const peakMenge = r0(monatlich[peak])
    const bedarfDatum = `${plan.jahr}-${String(peak + 1).padStart(2, '0')}-01`
    const vorlaufEinkauf = (p.wbzTage || 0) + (p.produktionsTage || 0) + pufferTage
    const vorlaufProd = (p.produktionsTage || 0) + pufferTage
    return {
      id: p.id, name: p.name, peakMonat: MONNAMEN[peak], peakMenge,
      wbzTage: p.wbzTage || 0, produktionsTage: p.produktionsTage || 0, pufferTage,
      bedarfDatum,
      bestellBis: isoMinusTage(bedarfDatum, vorlaufEinkauf),
      produktionsStart: isoMinusTage(bedarfDatum, vorlaufProd),
      eigenfertigung: (p.produktionsTage || 0) > 0
    }
  })
}
