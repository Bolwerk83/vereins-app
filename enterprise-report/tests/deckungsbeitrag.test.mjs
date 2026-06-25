import './_setup.mjs'
import test from 'node:test'
import assert from 'node:assert/strict'
import { direktCosting, stufenweise } from '../src/core/deckungsbeitrag.js'

test('Direct Costing: DB I = Umsatz − variable Kosten', () => {
  const d = direktCosting()
  for (const p of d.rows) assert.equal(p.db1, +(p.umsatz - p.varKosten).toFixed(2))
  assert.equal(d.db1, +d.rows.reduce((n, p) => n + p.db1, 0).toFixed(2))
})

test('Mehrstufig: DB-Stufen rechnen korrekt durch bis Betriebsergebnis', () => {
  const s = stufenweise()
  for (const b of s.bereiche) {
    for (const p of b.produkte) {
      assert.equal(p.db1, +(p.umsatz - p.varKosten).toFixed(2))
      assert.equal(p.db2, +(p.db1 - p.produktfix).toFixed(2))
    }
    assert.equal(b.db3, +(b.summeDB2 - b.bereichsfix).toFixed(2))
  }
  assert.equal(s.betriebsergebnis, +(s.summeDB3 - s.unternehmensfix).toFixed(2))
})

test('Profit-Center-Faktor skaliert Werte; DB-Quoten invariant', () => {
  const voll = direktCosting(undefined, 1)
  const halb = direktCosting(undefined, 0.5)
  assert.ok(Math.abs(halb.umsatz - voll.umsatz * 0.5) < 0.05)
  assert.equal(halb.db1Quote, voll.db1Quote)
  const sVoll = stufenweise(undefined, undefined, undefined, 1)
  const sHalb = stufenweise(undefined, undefined, undefined, 0.5)
  assert.ok(Math.abs(sHalb.betriebsergebnis - sVoll.betriebsergebnis * 0.5) < 0.1)
  assert.ok(Math.abs(sHalb.unternehmensfix - sVoll.unternehmensfix * 0.5) < 0.05)
})
