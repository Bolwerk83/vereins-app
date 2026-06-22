import './_setup.mjs'
import test from 'node:test'
import assert from 'node:assert/strict'
import { phaseVerteilung, kennzahlen, BEREICHE } from '../src/core/mitarbeiter.js'

test('Phasenverteilung liefert Köpfe und Anteile', () => {
  const v = phaseVerteilung()
  assert.equal(v.length, 5)
  assert.ok(v.every((p) => p.koepfe >= 0 && p.anteil >= 0))
})

test('FTE = Summe der Bereiche; Kennzahlen FTE-gewichtet plausibel', () => {
  const k = kennzahlen()
  assert.equal(k.fte, BEREICHE.reduce((n, b) => n + b.fte, 0))
  assert.ok(k.fluktuation > 0 && k.fluktuation < 20)
  assert.equal(k.offen, BEREICHE.reduce((n, b) => n + b.offen, 0))
})
