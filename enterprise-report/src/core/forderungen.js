// =========================================================================
//  FORDERUNGS-AGING — Altersstruktur der offenen Forderungen:
//    nicht fällig → 1–30 → 31–60 → 61–90 → >90 Tage
//  je mit Mahnstufe, Wertberichtigungssatz und erwartetem Ausfall. Plus DSO.
// =========================================================================

export const DSO = 41 // Tage (Days Sales Outstanding)

// Buckets (Mio €): wbSatz = Wertberichtigung in %.
export const BUCKETS = [
  { id: 'nf',   name: 'nicht fällig',  betrag: 3.48, wbSatz: 0,  mahnstufe: '—',                  risiko: 'kein' },
  { id: 'b30',  name: '1–30 Tage',     betrag: 0.33, wbSatz: 2,  mahnstufe: 'Zahlungserinnerung', risiko: 'gering' },
  { id: 'b60',  name: '31–60 Tage',    betrag: 0.16, wbSatz: 10, mahnstufe: '1. Mahnung',         risiko: 'mittel' },
  { id: 'b90',  name: '61–90 Tage',    betrag: 0.08, wbSatz: 30, mahnstufe: '2. Mahnung',         risiko: 'hoch' },
  { id: 'b90p', name: '> 90 Tage',     betrag: 0.05, wbSatz: 60, mahnstufe: 'Inkasso / Ausfall',  risiko: 'kritisch' }
]

const r2 = (x) => Math.round(x * 100) / 100
const r1 = (x) => Math.round(x * 10) / 10

export function aging(faktor = 1) {
  // Quoten exakt aus der unskalierten Basis (faktor-invariant); nur die
  // absoluten Beträge werden mit dem Profit-Center-Anteil skaliert.
  const gesamtRoh = BUCKETS.reduce((n, b) => n + b.betrag, 0)
  const ausfallRoh = BUCKETS.reduce((n, b) => n + b.betrag * b.wbSatz / 100, 0)
  const ueberfaelligRoh = BUCKETS.filter((b) => b.id !== 'nf').reduce((n, b) => n + b.betrag, 0)
  const rows = BUCKETS.map((b) => ({
    ...b,
    betrag: r2(b.betrag * faktor),
    anteil: r1(b.betrag / gesamtRoh * 100),
    ausfall: r2(b.betrag * faktor * b.wbSatz / 100)
  }))
  return {
    rows,
    gesamt: r2(gesamtRoh * faktor),
    ueberfaellig: r2(ueberfaelligRoh * faktor),
    ueberfaelligkeitsquote: r1(ueberfaelligRoh / gesamtRoh * 100),
    erwarteterAusfall: r2(ausfallRoh * faktor),
    ausfallquote: r1(ausfallRoh / gesamtRoh * 100),
    dso: DSO
  }
}
