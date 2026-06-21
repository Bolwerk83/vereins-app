// =========================================================================
//  SEGMENT-/KONZERNBERICHT — Ergebnis je Gesellschaft/Segment und
//  Konsolidierung (Eliminierung der Intercompany-Umsätze).
// =========================================================================

// Gesellschaften (Mio €): Umsatz, EBIT, davon Intercompany-Umsatz (IC).
export const SEGMENTE = [
  { id: 'de',      name: 'VeloWerk DE GmbH',        umsatz: 38.0, ebit: 1.6, ic: 2.0 },
  { id: 'ch',      name: 'VeloWerk Schweiz AG',     umsatz: 8.5,  ebit: 0.5, ic: 0.8 },
  { id: 'nl',      name: 'VeloWerk NL B.V.',        umsatz: 6.5,  ebit: 0.2, ic: 0.5 },
  { id: 'service', name: 'Service & Leasing GmbH',  umsatz: 4.0,  ebit: 0.3, ic: 1.2 }
]

const r1 = (x) => Math.round(x * 10) / 10
const r2 = (x) => Math.round(x * 100) / 100

export function segmentbericht(segmente = SEGMENTE) {
  const rows = segmente.map((s) => ({ ...s, marge: s.umsatz ? r1(s.ebit / s.umsatz * 100) : 0 }))
  const summeUmsatz = r2(rows.reduce((n, s) => n + s.umsatz, 0))
  const summeIc = r2(rows.reduce((n, s) => n + s.ic, 0))
  const konzernUmsatz = r2(summeUmsatz - summeIc) // konsolidiert
  const konzernEbit = r2(rows.reduce((n, s) => n + s.ebit, 0))
  return {
    rows, summeUmsatz, summeIc, konzernUmsatz, konzernEbit,
    konzernMarge: konzernUmsatz ? r1(konzernEbit / konzernUmsatz * 100) : 0
  }
}
