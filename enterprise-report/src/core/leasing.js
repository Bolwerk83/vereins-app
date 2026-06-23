// =========================================================================
//  LEASING-COCKPIT — vier Sichten:
//   1) Leasingnehmer: gezahlte Leasinggebühren je Vertrag/Objekt, Laufzeit,
//      Restlaufzeit, Restwert, Fälligkeiten.
//   2) Leasing vs. Kauf: Vorteilhaftigkeitsvergleich über die Laufzeit.
//   3) IFRS 16: Right-of-Use-Asset & Leasingverbindlichkeit, HGB↔IFRS-Effekt.
//   4) Dienstrad-Leasing: wir als Anbieter (Portfolio, Erlöse, Restwerte, Risiko).
//
//  Stichtag HEUTE = 2026-06. Beträge in € sofern nicht anders angegeben.
// =========================================================================
export const HEUTE = '2026-06'
const monatsDiff = (von, bis) => {
  const [jv, mv] = von.split('-').map(Number), [jb, mb] = bis.split('-').map(Number)
  return (jb - jv) * 12 + (mb - mv)
}
const plusMonate = (periode, n) => {
  const [j, m] = periode.split('-').map(Number)
  const t = j * 12 + (m - 1) + n
  return `${Math.floor(t / 12)}-${String(t % 12 + 1).padStart(2, '0')}`
}

// --- 1) Leasingnehmer-Verträge --------------------------------------------
const VERTRAEGE_ROH = [
  { id: 'l-transporter', objekt: 'Lieferfahrzeuge (6×)', kategorie: 'Fuhrpark', geber: 'AutoLease GmbH', beginn: '2023-09', laufzeit: 48, rate: 4200, kaufpreis: 210000, restwert: 38000 },
  { id: 'l-dienstwagen', objekt: 'Dienstwagen GF/Vertrieb (4×)', kategorie: 'Fuhrpark', geber: 'MobilFlex', beginn: '2024-01', laufzeit: 36, rate: 2600, kaufpreis: 132000, restwert: 41000 },
  { id: 'l-stapler', objekt: 'Gabelstapler / Intralogistik (3×)', kategorie: 'Maschinen', geber: 'IndustrieLease', beginn: '2022-06', laufzeit: 60, rate: 1900, kaufpreis: 98000, restwert: 12000 },
  { id: 'l-anlage', objekt: 'Produktionsanlage Rahmenschweißen', kategorie: 'Maschinen', geber: 'MaschinenFinanz', beginn: '2023-03', laufzeit: 72, rate: 6800, kaufpreis: 420000, restwert: 90000 },
  { id: 'l-it', objekt: 'IT-Hardware (Laptops/Server)', kategorie: 'IT', geber: 'TechRent', beginn: '2024-04', laufzeit: 36, rate: 3100, kaufpreis: 98000, restwert: 8000 },
  { id: 'l-pos', objekt: 'POS-/Kassensysteme Filialen', kategorie: 'IT', geber: 'TechRent', beginn: '2023-11', laufzeit: 48, rate: 1400, kaufpreis: 58000, restwert: 5000 },
  { id: 'l-immo', objekt: 'Logistikfläche (Teilfläche)', kategorie: 'Immobilie', geber: 'ImmoLease', beginn: '2021-01', laufzeit: 120, rate: 18500, kaufpreis: 1800000, restwert: 1500000 },
  { id: 'l-cargo', objekt: 'E-Lastenräder Werksverkehr (5×)', kategorie: 'Fuhrpark', geber: 'VeloLease', beginn: '2024-02', laufzeit: 36, rate: 650, kaufpreis: 22000, restwert: 3000 }
]

export function vertraege() {
  return VERTRAEGE_ROH.map((v) => {
    const verstrichen = Math.min(monatsDiff(v.beginn, HEUTE), v.laufzeit)
    const restlaufzeit = Math.max(0, v.laufzeit - verstrichen)
    return {
      ...v,
      jahresgebuehr: v.rate * 12,
      gesamtkosten: v.rate * v.laufzeit,
      bisherGezahlt: verstrichen * v.rate,
      restzahlung: restlaufzeit * v.rate,
      verstrichen, restlaufzeit,
      ende: plusMonate(v.beginn, v.laufzeit),
      laeuftAus: restlaufzeit > 0 && restlaufzeit <= 12
    }
  })
}

export const LEASING_KATEGORIEN = ['Fuhrpark', 'Maschinen', 'IT', 'Immobilie']

// faktor = Profit-Center-Umlageschlüssel (Anteil der Leasingkosten, die diesem
// PC zugerechnet werden). Skaliert die Kosten-Aggregate; Anzahl/Laufzeiten und
// die Vertragsliste selbst bleiben unverändert (Faktenbasis).
export function leasingKennzahlen(faktor = 1) {
  const v = vertraege()
  const s = (x) => Math.round(x * faktor)
  return {
    anzahl: v.length,
    jahresgebuehr: s(v.reduce((n, x) => n + x.jahresgebuehr, 0)),
    monatsrate: s(v.reduce((n, x) => n + x.rate, 0)),
    bisherGezahlt: s(v.reduce((n, x) => n + x.bisherGezahlt, 0)),
    restzahlung: s(v.reduce((n, x) => n + x.restzahlung, 0)),
    restwerte: s(v.reduce((n, x) => n + x.restwert, 0)),
    oRestlaufzeit: Math.round(v.reduce((n, x) => n + x.restlaufzeit, 0) / v.length),
    laufenAus: v.filter((x) => x.laeuftAus).length
  }
}

export function kategorieVerteilung(faktor = 1) {
  const v = vertraege()
  return LEASING_KATEGORIEN.map((kat) => {
    const grp = v.filter((x) => x.kategorie === kat)
    return { kategorie: kat, anzahl: grp.length, jahresgebuehr: Math.round(grp.reduce((n, x) => n + x.jahresgebuehr, 0) * faktor) }
  }).filter((g) => g.anzahl > 0)
}

// --- 2) Leasing vs. Kauf ---------------------------------------------------
const ZINS = 0.06 // kalkulatorischer Finanzierungszins p. a.
export function leasingVsKauf() {
  return vertraege().map((v) => {
    const leasing = v.gesamtkosten // Σ Raten über die Laufzeit
    // Kauf: Anschaffung + kalk. Zinsen auf das durchschnittlich gebundene Kapital − Restwerterlös
    const zinsen = Math.round(v.kaufpreis * ZINS * (v.laufzeit / 12) / 2)
    const kauf = v.kaufpreis + zinsen - v.restwert
    const vorteilLeasing = kauf - leasing // > 0 ⇒ Leasing günstiger
    return { id: v.id, objekt: v.objekt, kategorie: v.kategorie, leasing, kauf, zinsen, vorteilLeasing, empfehlung: vorteilLeasing >= 0 ? 'Leasing' : 'Kauf' }
  })
}

// --- 3) IFRS 16 (vereinfacht) ---------------------------------------------
export function ifrs16(faktor = 1) {
  const v = vertraege()
  const s = (x) => Math.round(x * faktor)
  // Leasingverbindlichkeit ≈ Barwert der Restraten (vereinfacht mit Faktor)
  const verbindlichkeit = s(Math.round(v.reduce((n, x) => n + x.restzahlung, 0) * 0.95))
  // Right-of-Use-Asset ≈ linear abgeschriebener Anfangswert
  const rouAsset = s(Math.round(v.reduce((n, x) => n + x.gesamtkosten * (x.restlaufzeit / x.laufzeit), 0)))
  const jahresgebuehr = s(v.reduce((n, x) => n + x.jahresgebuehr, 0))     // HGB: Aufwand p. a.
  const zinsaufwand = s(Math.round(Math.round(v.reduce((n, x) => n + x.restzahlung, 0) * 0.95) * ZINS)) // IFRS: Zinsanteil
  const abschreibung = s(Math.round(v.reduce((n, x) => n + x.gesamtkosten / x.laufzeit * 12, 0))) // IFRS: RoU-AfA p. a.
  const kurzfristig = s(Math.round(v.reduce((n, x) => n + Math.min(12, x.restlaufzeit) * x.rate, 0) * 0.97))
  return {
    rouAsset, verbindlichkeit, kurzfristig, langfristig: verbindlichkeit - kurzfristig,
    hgbAufwand: jahresgebuehr, ifrsAbschreibung: abschreibung, ifrsZins: zinsaufwand,
    ebitdaEffekt: jahresgebuehr // unter IFRS 16 fällt der Leasingaufwand aus dem EBITDA (→ EBITDA steigt)
  }
}

// --- 4) Dienstrad-Leasing (wir als Anbieter) ------------------------------
export const DIENSTRAD = {
  aktiveVertraege: 1240,
  oRate: 62,
  laufzeitMonate: 36,
  neugeschaeft12M: 320,
  ausfallquote: 1.8,
  portfolioRestwert: 3120000,   // Buchwert der verleasten Räder
  ruecklaeuferMarge: 18,        // % Marge auf Refurbishment/Resale
  segmente: [
    { name: 'Großunternehmen', anteil: 46 },
    { name: 'Mittelstand', anteil: 34 },
    { name: 'Öffentlicher Dienst', anteil: 14 },
    { name: 'Kleinbetriebe', anteil: 6 }
  ]
}
export function dienstradKennzahlen() {
  const d = DIENSTRAD
  const monatserloes = d.aktiveVertraege * d.oRate
  return {
    ...d,
    monatserloes,
    jahreserloes: monatserloes * 12,
    ausfallVertraege: Math.round(d.aktiveVertraege * d.ausfallquote / 100)
  }
}
