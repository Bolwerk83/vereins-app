import './_setup.mjs'
import test from 'node:test'
import assert from 'node:assert/strict'
import { segmentbericht } from '../src/core/segment.js'

test('Konzernumsatz = Summe − Intercompany', () => {
  const s = segmentbericht()
  assert.equal(s.konzernUmsatz, +(s.summeUmsatz - s.summeIc).toFixed(2))
})

test('EBIT-Marge je Segment = EBIT/Umsatz', () => {
  for (const r of segmentbericht().rows) assert.equal(r.marge, Math.round(r.ebit / r.umsatz * 1000) / 10)
})

test('Konzern-EBIT = Summe der Segment-EBITs', () => {
  const s = segmentbericht()
  assert.equal(s.konzernEbit, +s.rows.reduce((n, r) => n + r.ebit, 0).toFixed(2))
})
