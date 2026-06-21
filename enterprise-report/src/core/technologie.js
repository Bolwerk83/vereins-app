// =========================================================================
//  TECHNOLOGIE-REIFEGRAD & F&E-PORTFOLIO — Forschungs-/Entwicklungsprojekte
//  über ihren Reifegrad (angelehnt an Technology-Readiness-Level) steuern:
//  Budget/Ausgaben, Time-to-Market, Erfolgswahrscheinlichkeit und der
//  erwartete Wert (Pipeline). Welche Projekte sind nah am Markt, wo droht
//  Substitution? Beträge in Mio €.
// =========================================================================

// Reifegrade von der Idee bis zum Auslauf (vereinfachte S-Kurve/TRL).
export const REIFEGRADE = [
  { id: 'idee',        stufe: 1, name: 'Idee/Konzept',     farbe: '#94a3b8', laie: 'Erste Idee, noch ungeprüft.' },
  { id: 'forschung',   stufe: 2, name: 'Forschung',        farbe: '#6366f1', laie: 'Machbarkeit wird untersucht.' },
  { id: 'entwicklung', stufe: 3, name: 'Entwicklung',      farbe: '#2563eb', laie: 'Prototyp/Produkt wird gebaut.' },
  { id: 'pilot',       stufe: 4, name: 'Pilot/Test',       farbe: '#0891b2', laie: 'Erprobung unter Realbedingungen.' },
  { id: 'markt',       stufe: 5, name: 'Markteinführung',  farbe: '#16a34a', laie: 'Am Markt, im Hochlauf.' },
  { id: 'reife',       stufe: 6, name: 'Reife',            farbe: '#65a30d', laie: 'Etabliert, stabiler Beitrag.' },
  { id: 'substitution', stufe: 7, name: 'Substitution',   farbe: '#dc2626', laie: 'Wird durch Neueres verdrängt.' }
]
export const reifegradInfo = (id) => REIFEGRADE.find((r) => r.id === id) || REIFEGRADE[0]

// F&E-Projekte (Mio €). erfolg = Erfolgswahrscheinlichkeit %, ttm = Time-to-Market (Monate).
export const PROJEKTE = [
  { id: 'akku',     name: 'Akku-Schnellladung 800 V', reifegrad: 'entwicklung', budget: 2.4, ausgegeben: 1.3, ttm: 14, erfolg: 60, marktpotenzial: 9.0 },
  { id: 'antrieb',  name: 'Mittelmotor Gen-4',        reifegrad: 'pilot',       budget: 3.1, ausgegeben: 2.6, ttm: 7,  erfolg: 75, marktpotenzial: 14.0 },
  { id: 'connect',  name: 'Connected-Bike-Plattform', reifegrad: 'markt',       budget: 1.8, ausgegeben: 1.7, ttm: 2,  erfolg: 85, marktpotenzial: 6.5 },
  { id: 'rahmen',   name: 'Recycling-Aluminiumrahmen', reifegrad: 'forschung',  budget: 1.2, ausgegeben: 0.4, ttm: 22, erfolg: 45, marktpotenzial: 5.0 },
  { id: 'leasing',  name: 'KI-Leasing-Scoring',       reifegrad: 'idee',        budget: 0.6, ausgegeben: 0.1, ttm: 18, erfolg: 40, marktpotenzial: 3.5 },
  { id: 'naben',    name: 'Nabenschaltung 14-Gang',   reifegrad: 'reife',       budget: 2.0, ausgegeben: 2.0, ttm: 0,  erfolg: 95, marktpotenzial: 4.0 },
  { id: 'blei',     name: 'Blei-Akku-Linie',          reifegrad: 'substitution', budget: 0.3, ausgegeben: 0.3, ttm: 0, erfolg: 20, marktpotenzial: 0.8 }
]

const r1 = (x) => Math.round(x * 10) / 10
const r2 = (x) => Math.round(x * 100) / 100

/**
 * Portfolio-Auswertung: erwarteter Wert (Marktpotenzial × Erfolg), Restbudget,
 * Verteilung über die Reifegrade. „Nah am Markt" = Stufe ≥ Pilot.
 */
export function auswertung(projekte = PROJEKTE) {
  const rows = projekte.map((p) => {
    const info = reifegradInfo(p.reifegrad)
    const restbudget = r2(p.budget - p.ausgegeben)
    const erwarteterWert = r2(p.marktpotenzial * p.erfolg / 100) // risikogewichtetes Potenzial
    return { ...p, stufe: info.stufe, reifegradName: info.name, farbe: info.farbe, restbudget, erwarteterWert }
  })
  const budget = r1(rows.reduce((n, p) => n + p.budget, 0))
  const ausgegeben = r1(rows.reduce((n, p) => n + p.ausgegeben, 0))
  const pipelineWert = r1(rows.reduce((n, p) => n + p.erwarteterWert, 0))
  const nahAmMarkt = rows.filter((p) => p.stufe >= 4 && p.stufe <= 6).length
  const verteilung = REIFEGRADE.map((r) => ({
    ...r, anzahl: rows.filter((p) => p.reifegrad === r.id).length,
    budget: r1(rows.filter((p) => p.reifegrad === r.id).reduce((n, p) => n + p.budget, 0))
  }))
  return {
    rows: rows.sort((a, b) => b.stufe - a.stufe || b.erwarteterWert - a.erwarteterWert),
    budget, ausgegeben, restbudget: r1(budget - ausgegeben), pipelineWert, nahAmMarkt, verteilung
  }
}
