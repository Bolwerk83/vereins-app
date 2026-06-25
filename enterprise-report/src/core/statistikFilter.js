// =========================================================================
//  STATISTIK-FILTER — gemeinsamer Zeitraum-, Zeitdimensions- & Profit-Center-
//  Filter für die Statistik-Berichte. Das Profit-Center wird als BAUM aus der
//  echten PC-Struktur (pcKostenstellen) geführt — inkl. des Vertriebskanal-
//  Zweigs; eine separate „Kanäle"-Dimension entfällt, Kanäle sind PC-Knoten.
//  Zeitraum wirkt über Saison-Monatsgewichte; Profit-Center & Zeitdimension
//  als Anteils-/Magnitude-Faktor. Absolute Werte (€, Stück) werden skaliert;
//  Verhältnis-/Durchschnittskennzahlen bleiben unverändert.
// =========================================================================
import { STRUKTUREN, gruppiereNach, gesamt as pcGesamt } from './pcKostenstellen.js'

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

// --- Profit-Center-Baum -----------------------------------------------------
// Statt einer parallelen „Kanäle"-Dimension liefert der PC-Baum die wählbaren
// Knoten direkt aus der PC-Struktur: Geschäftsbereich, Vertriebskanal und
// Land/Region. Anteilsfaktoren werden aus den Erlösen der PC-Struktur
// abgeleitet (gruppiereNach), damit Filter und PC-Baum dieselbe Wahrheit haben.
const FILTER_STRUKTUREN = ['geschaeftsbereich', 'kanal', 'land']
const knotenId = (sid, gid) => (sid === 'geschaeftsbereich' ? gid : `${sid}:${gid}`)

/** PC-Baum als Gruppen (Struktur) mit Knoten {id, name, faktor}. */
export function pcBaum() {
  const ges = pcGesamt().erloes || 1
  return FILTER_STRUKTUREN.map((sid) => {
    const s = STRUKTUREN.find((x) => x.id === sid) || { id: sid, name: sid }
    const knoten = gruppiereNach(sid).filter((g) => g.erloes > 0).map((g) => ({
      id: knotenId(sid, g.id), name: g.name, faktor: Math.round(g.erloes / ges * 1000) / 1000
    }))
    return { id: sid, name: s.name, knoten }
  })
}
function faktorMap() {
  const m = { alle: 1 }
  for (const gr of pcBaum()) for (const k of gr.knoten) m[k.id] = k.faktor
  return m
}
export const pcFaktor = (id) => { const f = faktorMap()[id]; return f == null ? 1 : f }
export function pcName(id) {
  if (id === 'alle' || id == null) return 'Gesamtunternehmen'
  for (const gr of pcBaum()) { const k = gr.knoten.find((x) => x.id === id); if (k) return k.name }
  return id
}

/** Gesamt-Skalierungsfaktor für absolute Werte (Zeitraum × Profit-Center ×
 *  Zeitdimension-Magnitude). `dat` ist ein Datumsart-Objekt {shift, mag}. */
export function faktor(zeitraumId = 'jahr', pcId = 'alle', dat = null) {
  return zeitraumAnteil(zeitraumId, dat?.shift || 0) * pcFaktor(pcId) * (dat?.mag || 1)
}
export function filterLabel(zeitraumId, pcId) {
  const z = zeitraumVon(zeitraumId)
  return !pcId || pcId === 'alle' ? z.name : `${z.name} · ${pcName(pcId)}`
}
