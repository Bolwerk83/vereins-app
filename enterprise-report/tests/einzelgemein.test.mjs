import './_setup.mjs'
import test from 'node:test'
import assert from 'node:assert/strict'
import { BLOECKE, kalkulation, schema } from '../src/core/einzelGemein.js'

test('Herstellkosten = Material + Fertigung (EK+GK)', () => {
  const k = kalkulation()
  assert.equal(k.hk, +(k.b.mek + k.b.mgk + k.b.fek + k.b.fgk).toFixed(2))
  assert.equal(k.selbst, +(k.hk + k.b.vwgk + k.b.vtgk).toFixed(2))
})

test('Zuschlagssätze beziehen sich auf die richtige Basis', () => {
  const k = kalkulation()
  assert.equal(k.zuschlag.mgk, +(k.b.mgk / k.b.mek * 100).toFixed(1))
  assert.equal(k.zuschlag.fgk, +(k.b.fgk / k.b.fek * 100).toFixed(1))
  assert.equal(k.zuschlag.vwgk, +(k.b.vwgk / k.hk * 100).toFixed(1))
})

test('Einzel + Gemein = Selbstkosten; Schema endet mit Selbstkosten', () => {
  const k = kalkulation()
  assert.equal(+(k.einzel + k.gemein).toFixed(2), k.selbst)
  const s = schema()
  assert.equal(s[s.length - 1].label, 'Selbstkosten')
  assert.equal(s[s.length - 1].wert, k.selbst)
})
