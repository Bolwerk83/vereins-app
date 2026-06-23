// =========================================================================
//  STATISTIK-FILTER — gemeinsamer Zeitraum- & Profit-Center-Filter für die
//  Statistik-Berichte (Verkauf, Fahrrad, Einkauf, Produktion), analog zum
//  Quartalsbericht. Zeitraum wirkt über Saison-Monatsgewichte als Anteil am
//  Jahr; Profit-Center als Anteilsfaktor. Absolute Werte (€, Stück) werden
//  skaliert; Verhältnis-/Durchschnittskennzahlen bleiben unverändert.
// =========================================================================
export const MONATE = ['Jan', 'Feb', 'Mär', 'Apr', 'Mai', 'Jun', 'Jul', 'Aug', 'Sep', 'Okt', 'Nov', 'Dez']

// Saisongewichte des Fahrradgeschäfts (Frühjahr/Sommer stark), Summe = 1.
const GEWICHT = [0.05, 0.05, 0.07, 0.09, 0.11, 0.12, 0.11, 0.09, 0.08, 0.07, 0.09, 0.07]

export const ZEITRAEUME = [
  { id: 'jahr', name: 'Gesamtjahr', kurz: 'Jahr', monate: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11] },
  { id: 'h1', name: '1. Halbjahr', kurz: 'H1', monate: [0, 1, 2, 3, 4, 5] },
  { id: 'h2', name: '2. Halbjahr', kurz: 'H2', monate: [6, 7, 8, 9, 10, 11] },
  { id: 'q1', name: 'Q1 (Jan–Mär)', kurz: 'Q1', monate: [0, 1, 2] },
  { id: 'q2', name: 'Q2 (Apr–Jun)', kurz: 'Q2', monate: [3, 4, 5] },
  { id: 'q3', name: 'Q3 (Jul–Sep)', kurz: 'Q3', monate: [6, 7, 8] },
  { id: 'q4', name: 'Q4 (Okt–Dez)', kurz: 'Q4', monate: [9, 10, 11] }
]
export const zeitraumVon = (id) => ZEITRAEUME.find((z) => z.id === id) || ZEITRAEUME[0]
export const monateVon = (id) => zeitraumVon(id).monate

const clamp = (i, lo, hi) => Math.max(lo, Math.min(hi, i))
/** Saisongewichte, um `shift` Monate verschoben (verschiedene Zeitdimensionen
 *  buchen denselben Vorgang in andere Monate), wieder auf Summe 1 normiert. */
function gewichteShift(shift = 0) {
  const w = GEWICHT.map((_, i) => GEWICHT[clamp(i - shift, 0, 11)])
  const s = w.reduce((a, b) => a + b, 0) || 1
  return w.map((x) => x / s)
}
/** Anteil des Zeitraums am Jahr (Summe der ggf. verschobenen Saisongewichte). */
export function zeitraumAnteil(id, shift = 0) {
  const w = gewichteShift(shift)
  return Math.round(monateVon(id).reduce((n, i) => n + (w[i] || 0), 0) * 1000) / 1000
}

// --- Zeitdimension (Datumsart): wonach wird die Periode gefiltert? ----------
// shift = Monatsverschiebung der Buchung, mag = Mengen-/Wertfaktor (z. B. noch
// nicht gelieferte Bestellungen fallen beim Lieferdatum heraus).
export const DATUMSARTEN = {
  verkauf: [
    { id: 'bestell', name: 'Bestelldatum', shift: -1, mag: 1.015 },
    { id: 'beleg', name: 'Rechnungs-/Belegdatum', shift: 0, mag: 1 },
    { id: 'liefer', name: 'Lieferdatum', shift: 1, mag: 0.985 }
  ],
  einkauf: [
    { id: 'bestell', name: 'Bestelldatum', shift: -1, mag: 1.02 },
    { id: 'wareneingang', name: 'Wareneingang (Lieferdatum)', shift: 0, mag: 1 },
    { id: 'rechnung', name: 'Rechnungs-/Belegdatum', shift: 1, mag: 0.99 }
  ],
  produktion: [
    { id: 'start', name: 'Produktionsstart', shift: -1, mag: 1.006 },
    { id: 'fertig', name: 'Fertigstellung', shift: 0, mag: 1 },
    { id: 'buchung', name: 'Buchungsdatum', shift: 1, mag: 0.994 }
  ]
}
export const datumsartenFuer = (bereich) => DATUMSARTEN[bereich] || DATUMSARTEN.verkauf
export function datumsartInfo(bereich, id) {
  const liste = datumsartenFuer(bereich)
  return liste.find((d) => d.id === id) || liste.find((d) => d.shift === 0) || liste[0]
}

// Profit-Center als Anteilsfaktor (wie Quartalsbericht).
export const PROFITCENTER = [
  { id: 'alle', name: 'Gesamtunternehmen', faktor: 1 },
  { id: 'pc-bike', name: 'PC Fahrräder', faktor: 0.69 },
  { id: 'pc-tbz', name: 'PC Teile/Zubehör', faktor: 0.31 },
  { id: 'pc-ecom', name: 'PC E-Commerce', faktor: 0.586 },
  { id: 'pc-store', name: 'PC Stationär', faktor: 0.414 }
]
export const pcFaktor = (id) => (PROFITCENTER.find((p) => p.id === id) || PROFITCENTER[0]).faktor

/** Gesamt-Skalierungsfaktor für absolute Werte (Zeitraum × Profit-Center ×
 *  Zeitdimension-Magnitude). `dat` ist ein Datumsart-Objekt {shift, mag}. */
export function faktor(zeitraumId = 'jahr', pcId = 'alle', dat = null) {
  return zeitraumAnteil(zeitraumId, dat?.shift || 0) * pcFaktor(pcId) * (dat?.mag || 1)
}
export function filterLabel(zeitraumId, pcId) {
  const z = zeitraumVon(zeitraumId); const p = PROFITCENTER.find((x) => x.id === pcId) || PROFITCENTER[0]
  return p.id === 'alle' ? z.name : `${z.name} · ${p.name}`
}
