import './_setup.mjs'
import test from 'node:test'
import assert from 'node:assert/strict'
import { division, aequivalenz, zuschlagKalkulation } from '../src/core/kalkulation.js'

test('Divisionskalkulation: Kosten / Menge', () => {
  assert.equal(division(480000, 12000), 40)
  assert.equal(division(100, 0), 0)
})

test('Äquivalenzziffern: RE = Ziffer×Menge, Stückkosten = k0×Ziffer', () => {
  const e = aequivalenz([{ id: 'a', name: 'A', aequivalenz: 1.0, menge: 10000 }, { id: 'b', name: 'B', aequivalenz: 2.0, menge: 5000 }], 100000)
  assert.equal(e.summeRE, 20000)          // 10000 + 10000
  assert.equal(e.kostenJeRE, 5)           // 100000 / 20000
  assert.equal(e.rows[0].stueckkosten, 5) // 5 × 1.0
  assert.equal(e.rows[1].stueckkosten, 10) // 5 × 2.0
})

test('Zuschlagskalkulation: Selbstkosten ≥ Herstellkosten, Ergebnis = Preis − Selbstkosten', () => {
  const r = zuschlagKalkulation('ist')
  for (const p of r) {
    assert.ok(p.hk >= p.fm + p.fl)
    assert.ok(p.selbstkosten >= p.hk)
    assert.equal(p.ergebnis, +(p.preis - p.selbstkosten).toFixed(2))
  }
})
