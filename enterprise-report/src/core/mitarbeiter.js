// =========================================================================
//  MITARBEITER-LEBENSZYKLUS (HR) — Recruiting → Onboarding → Entwicklung →
//  Bindung → Austritt. Plus Personalkennzahlen je Bereich (Personalcontrolling).
// =========================================================================

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
export const BEREICHE = [
  { id: 'filiale', name: 'Filialverkauf',   fte: 176, fluktuation: 12.4, krankenstand: 5.2, zugehoerigkeit: 4.2, offen: 9 },
  { id: 'werkstatt', name: 'Werkstatt/Service', fte: 58, fluktuation: 8.1, krankenstand: 4.1, zugehoerigkeit: 6.1, offen: 3 },
  { id: 'produktion', name: 'Produktion',   fte: 96,  fluktuation: 6.5, krankenstand: 5.6, zugehoerigkeit: 8.4, offen: 2 },
  { id: 'verwaltung', name: 'Verwaltung/IT', fte: 42, fluktuation: 4.2, krankenstand: 3.2, zugehoerigkeit: 9.8, offen: 0 }
]

const r1 = (x) => Math.round(x * 10) / 10

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
