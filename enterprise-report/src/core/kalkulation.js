// =========================================================================
//  KOSTENTRÄGERRECHNUNG / KALKULATION — „Wofür entstehen die Kosten?"
//  Selbstkosten je Produkt und Produkt-/Betriebsergebnis.
//
//  Verfahren (Übersicht):
//    Divisionskalkulation     — homogene Massenfertigung: Kosten / Menge
//    Äquivalenzziffernrechnung — Sortenfertigung: Mengen über Ziffern verrechnen
//    Zuschlagskalkulation     — Einzel-/Serienfertigung: GK über Zuschlagssätze
//    Maschinenstundensatz     — FGK über Maschinenstunden statt Lohnzuschlag
//    Kuppelkalkulation        — Kuppelprodukte (Verteilungs-/Restwertmethode)
// =========================================================================
import { bab } from './babVoll.js'

export const VERFAHREN = [
  { id: 'division',   name: 'Divisionskalkulation',     laie: 'Gesamtkosten ÷ Menge. Für gleichartige Massenprodukte (ein Produkt).', eignung: 'Massenfertigung, homogen' },
  { id: 'aequivalenz', name: 'Äquivalenzziffernrechnung', laie: 'Sorten werden über Äquivalenzziffern vergleichbar gemacht und die Kosten verteilt.', eignung: 'Sortenfertigung (ähnliche Produkte)' },
  { id: 'zuschlag',   name: 'Zuschlagskalkulation',     laie: 'Einzelkosten direkt + Gemeinkosten über Zuschlagssätze (aus dem BAB).', eignung: 'Einzel-/Serienfertigung, heterogen' },
  { id: 'maschine',   name: 'Maschinenstundensatz',     laie: 'Fertigungsgemeinkosten über Maschinenstunden statt über den Lohn.', eignung: 'Maschinenintensive Fertigung' },
  { id: 'kuppel',     name: 'Kuppelkalkulation',        laie: 'Mehrere Produkte entstehen zwangsweise zusammen — Kosten werden verteilt.', eignung: 'Kuppelproduktion' }
]

const r2 = (x) => Math.round(x * 100) / 100

// --- Divisionskalkulation -----------------------------------------------
export function division(gesamtkosten, menge) {
  return menge > 0 ? r2(gesamtkosten / menge) : 0
}

// --- Äquivalenzziffernrechnung ------------------------------------------
export const SORTEN_STD = [
  { id: 'a', name: 'Standard 1.5 mm', aequivalenz: 1.0, menge: 10000 },
  { id: 'b', name: 'Premium 2.0 mm',  aequivalenz: 1.3, menge: 5000 },
  { id: 'c', name: 'Leicht 1.0 mm',   aequivalenz: 0.8, menge: 8000 }
]
export const AEQUIVALENZ_GESAMTKOSTEN = 150000 // €

export function aequivalenz(sorten = SORTEN_STD, gesamtkosten = AEQUIVALENZ_GESAMTKOSTEN) {
  const rows = sorten.map((s) => ({ ...s, re: r2(s.aequivalenz * s.menge) }))
  const summeRE = rows.reduce((n, r) => n + r.re, 0) || 1
  const kostenJeRE = r2(gesamtkosten / summeRE)
  return {
    rows: rows.map((r) => ({ ...r, stueckkosten: r2(kostenJeRE * r.aequivalenz), gesamt: r2(kostenJeRE * r.re) })),
    summeRE: r2(summeRE), kostenJeRE, gesamtkosten
  }
}

// --- Zuschlagskalkulation je Produkt (nutzt BAB-Zuschlagssätze) ----------
// Produktdaten je Stück (€): Fertigungsmaterial (fm), Fertigungslohn (fl),
// Menge, Verkaufspreis.
export const PRODUKTE_STD = [
  { id: 'ebike', name: 'E-Bike Urban 500', fm: 620, fl: 95, menge: 14300, preis: 1850 },
  { id: 'city',  name: 'City/Trekking 7',  fm: 240, fl: 60, menge: 7200,  preis: 720 },
  { id: 'cargo', name: 'E-Cargo Family',   fm: 850, fl: 140, menge: 900,  preis: 3200 }
]

/** Zuschlagskalkulation je Stück mit den aktuellen BAB-Zuschlagssätzen. */
export function zuschlagKalkulation(datenart = 'ist', produkte = PRODUKTE_STD) {
  const z = bab(datenart).zuschlag // Prozentsätze: material, fertigung, verwaltung, vertrieb
  return produkte.map((p) => {
    const mgk = r2(p.fm * z.material / 100)
    const fgk = r2(p.fl * z.fertigung / 100)
    const materialkosten = r2(p.fm + mgk)
    const fertigungskosten = r2(p.fl + fgk)
    const hk = r2(materialkosten + fertigungskosten)
    const vwgk = r2(hk * z.verwaltung / 100)
    const vtgk = r2(hk * z.vertrieb / 100)
    const selbstkosten = r2(hk + vwgk + vtgk)
    const ergebnis = r2(p.preis - selbstkosten)
    const marge = p.preis ? r2(ergebnis / p.preis * 100) : 0
    return { ...p, mgk, fgk, materialkosten, fertigungskosten, hk, vwgk, vtgk, selbstkosten, ergebnis, marge }
  })
}

export function zuschlagSaetze(datenart = 'ist') { return bab(datenart).zuschlag }
