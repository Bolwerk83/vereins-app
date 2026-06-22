import './_setup.mjs'
import test from 'node:test'
import assert from 'node:assert/strict'
import { gruppiere, sinnvolleDimensionen } from '../src/core/pivot.js'
import { gruppiereNach, EINHEITEN, DIMENSIONEN } from '../src/core/mitarbeiter.js'

const recs = [
  { bereich: 'A', region: 'Nord', fte: 100, rate: 10 },
  { bereich: 'A', region: 'Süd',  fte: 100, rate: 20 },
  { bereich: 'B', region: 'Nord', fte: 50,  rate: 8 }
]

test('gruppiere: Summen und FTE-gewichtete Mittel', () => {
  const g = gruppiere(recs, 'bereich', { sumKeys: ['fte'], avgKeys: ['rate'], gewichtKey: 'fte' })
  const a = g.find((r) => r.dimension === 'A')
  assert.equal(a.fte, 200)
  assert.equal(a.rate, 15) // (10*100 + 20*100)/200
  assert.equal(a.n, 2)
})

test('gruppiere: Wechsel der Dimension ändert die Gruppen', () => {
  const nachRegion = gruppiere(recs, 'region', { sumKeys: ['fte'] })
  assert.equal(nachRegion.find((r) => r.dimension === 'Nord').fte, 150)
})

test('sinnvolleDimensionen: nur Dimensionen mit ≥ 2 Werten', () => {
  const recs2 = [{ a: 'x', b: 'k' }, { a: 'y', b: 'k' }]
  const d = sinnvolleDimensionen(recs2, [{ key: 'a' }, { key: 'b' }])
  assert.ok(d.find((x) => x.key === 'a'))
  assert.ok(!d.find((x) => x.key === 'b')) // b hat nur einen Wert
})

test('Personal: gruppiereNach summiert FTE konstant über alle Dimensionen', () => {
  const total = EINHEITEN.reduce((n, e) => n + e.fte, 0)
  for (const d of DIMENSIONEN) {
    const summe = gruppiereNach(d.key).reduce((n, r) => n + r.fte, 0)
    assert.equal(summe, total)
  }
})
