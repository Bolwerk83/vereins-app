// =========================================================================
//  MITARBEITER-LEBENSZYKLUS (HR) — Recruiting → Onboarding → Entwicklung →
//  Bindung → Austritt. Plus Personalkennzahlen je Bereich (Personalcontrolling).
// =========================================================================
import { gruppiere } from './pivot.js'

export const PHASEN = [
  { id: 'recruiting',  name: 'Recruiting',  farbe: '#7c3aed', laie: 'Offene Stellen & Bewerber-Pipeline.', empfehlung: 'Time-to-hire senken, Active Sourcing' },
  { id: 'onboarding',  name: 'Onboarding',  farbe: '#2563eb', laie: 'Neu im Haus (< 6 Monate).', empfehlung: 'Strukturierte Einarbeitung, früh binden' },
  { id: 'entwicklung', name: 'Entwicklung', farbe: '#0891b2', laie: 'Aufbauphase (0,5–3 Jahre).', empfehlung: 'Weiterbildung & Perspektiven bieten' },
  { id: 'bindung',     name: 'Bindung',     farbe: '#10b981', laie: 'Stammkräfte (> 3 Jahre).', empfehlung: 'Halten: Wertschätzung, Gesundheit' },
  { id: 'austritt',    name: 'Austritt',    farbe: '#ef4444', laie: 'Kündigungen / Abgänge pro Jahr.', empfehlung: 'Austrittsgründe analysieren, gegensteuern' }
]
export const phaseInfo = (id) => PHASEN.find((p) => p.id === id)

// Köpfe je Phase.
export const PHASE_KOEPFE = { recruiting: 14, onboarding: 22, entwicklung: 96, bindung: 240, austritt: 31 }

// Personalkennzahlen je Bereich: FTE, Fluktuation %, Krankenstand %,
// Ø Zugehörigkeit (Jahre), offene Stellen.
// Organisationseinheiten mit MEHREREN Dimensionen, damit der Bericht die
// Gruppierung wechseln kann (Bereich ↔ Profit-Center ↔ Region).
export const EINHEITEN = [
  { id: 'fil-nord', bereich: 'Filialverkauf', profitcenter: 'Retail', region: 'Nord', fte: 96, fluktuation: 13.1, krankenstand: 5.4, zugehoerigkeit: 3.9, offen: 6 },
  { id: 'fil-sued', bereich: 'Filialverkauf', profitcenter: 'Retail', region: 'Süd',  fte: 80, fluktuation: 11.5, krankenstand: 4.9, zugehoerigkeit: 4.6, offen: 3 },
  { id: 'werk-nord', bereich: 'Werkstatt/Service', profitcenter: 'Service', region: 'Nord', fte: 34, fluktuation: 8.6, krankenstand: 4.3, zugehoerigkeit: 5.7, offen: 2 },
  { id: 'werk-sued', bereich: 'Werkstatt/Service', profitcenter: 'Service', region: 'Süd', fte: 24, fluktuation: 7.4, krankenstand: 3.8, zugehoerigkeit: 6.7, offen: 1 },
  { id: 'prod-zentral', bereich: 'Produktion', profitcenter: 'Operations', region: 'Süd', fte: 96, fluktuation: 6.5, krankenstand: 5.6, zugehoerigkeit: 8.4, offen: 2 },
  { id: 'verw-zentral', bereich: 'Verwaltung/IT', profitcenter: 'Corporate', region: 'Süd', fte: 42, fluktuation: 4.2, krankenstand: 3.2, zugehoerigkeit: 9.8, offen: 0 }
]

// Wählbare Gruppierungs-Dimensionen für den Personalbericht.
export const DIMENSIONEN = [
  { key: 'bereich', name: 'Bereich' },
  { key: 'profitcenter', name: 'Profit-Center' },
  { key: 'region', name: 'Region' }
]

const r1 = (x) => Math.round(x * 10) / 10

/** Personalkennzahlen nach einer wählbaren Dimension gruppiert (FTE-gewichtet). */
export function gruppiereNach(dimKey = 'bereich') {
  return gruppiere(EINHEITEN, dimKey, {
    sumKeys: ['fte', 'offen'], gewichtKey: 'fte',
    avgKeys: ['fluktuation', 'krankenstand', 'zugehoerigkeit']
  })
}

// Rückwärtskompatibel: BEREICHE als Aggregation der Einheiten je Bereich.
export const BEREICHE = gruppiereNach('bereich').map((r) => ({
  id: r.dimension, name: r.dimension, fte: r.fte, fluktuation: r.fluktuation,
  krankenstand: r.krankenstand, zugehoerigkeit: r.zugehoerigkeit, offen: r.offen
}))

export function phaseVerteilung() {
  const ges = Object.values(PHASE_KOEPFE).reduce((n, v) => n + v, 0) || 1
  // Recruiting/Austritt sind Flüsse, kein Bestand -> Anteil auf Bestand (ohne recruiting) beziehen.
  return PHASEN.map((p) => ({ ...p, koepfe: PHASE_KOEPFE[p.id], anteil: r1(PHASE_KOEPFE[p.id] / ges * 100) }))
}

export function kennzahlen() {
  const fte = BEREICHE.reduce((n, b) => n + b.fte, 0)
  const gew = (k) => r1(BEREICHE.reduce((n, b) => n + b[k] * b.fte, 0) / fte) // FTE-gewichtet
  return {
    fte,
    fluktuation: gew('fluktuation'),
    krankenstand: gew('krankenstand'),
    zugehoerigkeit: gew('zugehoerigkeit'),
    offen: BEREICHE.reduce((n, b) => n + b.offen, 0)
  }
}
