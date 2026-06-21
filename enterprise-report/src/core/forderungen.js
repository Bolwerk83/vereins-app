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

export function aging() {
  const gesamt = r2(BUCKETS.reduce((n, b) => n + b.betrag, 0))
  const rows = BUCKETS.map((b) => ({
    ...b,
    anteil: r1(b.betrag / gesamt * 100),
    ausfall: r2(b.betrag * b.wbSatz / 100)
  }))
  const ueberfaellig = r2(rows.filter((b) => b.id !== 'nf').reduce((n, b) => n + b.betrag, 0))
  const erwarteterAusfall = r2(rows.reduce((n, b) => n + b.ausfall, 0))
  return {
    rows, gesamt, ueberfaellig,
    ueberfaelligkeitsquote: r1(ueberfaellig / gesamt * 100),
    erwarteterAusfall, ausfallquote: r1(erwarteterAusfall / gesamt * 100),
    dso: DSO
  }
}
