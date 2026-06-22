// =========================================================================
//  PIVOT — generische Gruppierung nach einer wählbaren Dimension.
//  Ermöglicht „Dimension wechseln" in Berichten (z. B. Bereich → Profit-Center
//  → Region). Summen für absolute Kennzahlen, (gewichtete) Mittel für Raten.
// =========================================================================

const r1 = (x) => Math.round(x * 10) / 10

/**
 * Records nach dimKey gruppieren.
 *  - sumKeys: werden summiert (z. B. FTE, offene Stellen).
 *  - avgKeys: werden gemittelt; mit gewichtKey FTE-/mengen-gewichtet, sonst arithmetisch.
 * Rückgabe: [{ dimension, n, ...kennzahlen }], absteigend nach erster sumKey (sonst n).
 */
export function gruppiere(records, dimKey, { sumKeys = [], avgKeys = [], gewichtKey = null } = {}) {
  const map = new Map()
  for (const rec of records) {
    const k = rec[dimKey] ?? '—'
    if (!map.has(k)) map.set(k, [])
    map.get(k).push(rec)
  }
  const rows = []
  for (const [dimension, recs] of map) {
    const row = { dimension, n: recs.length }
    for (const s of sumKeys) row[s] = recs.reduce((n, r) => n + (r[s] || 0), 0)
    const gSum = gewichtKey ? recs.reduce((n, r) => n + (r[gewichtKey] || 0), 0) : recs.length
    for (const a of avgKeys) {
      const num = recs.reduce((n, r) => n + (r[a] || 0) * (gewichtKey ? (r[gewichtKey] || 0) : 1), 0)
      row[a] = gSum ? r1(num / gSum) : 0
    }
    rows.push(row)
  }
  const sortKey = sumKeys[0]
  return rows.sort((a, b) => (sortKey ? (b[sortKey] || 0) - (a[sortKey] || 0) : b.n - a.n))
}

/** Verfügbare Dimensionen aus den Records ableiten (die mit ≥ 2 verschiedenen Werten). */
export function sinnvolleDimensionen(records, kandidaten) {
  return kandidaten.filter((d) => new Set(records.map((r) => r[d.key])).size >= 2)
}
