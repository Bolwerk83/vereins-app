import './_setup.mjs'
import test from 'node:test'
import assert from 'node:assert/strict'
import { gaengigkeitVon, xyzVon, auswertung } from '../src/core/bestand.js'

test('Gängigkeit aus Umschlag und letzter Bewegung', () => {
  assert.equal(gaengigkeitVon(8, 3), 'renner')
  assert.equal(gaengigkeitVon(4, 10), 'normal')
  assert.equal(gaengigkeitVon(1, 10), 'langsamdreher')
  assert.equal(gaengigkeitVon(8, 210), 'ladenhueter')
})

test('XYZ aus Umschlag', () => {
  assert.equal(xyzVon(8), 'X'); assert.equal(xyzVon(4), 'Y'); assert.equal(xyzVon(1), 'Z')
})

test('ABC vergibt A/B/C; Summen plausibel', () => {
  const a = auswertung()
  assert.ok(a.rows.every((r) => ['A', 'B', 'C'].includes(r.abc)))
  assert.equal(a.gesamt, +a.rows.reduce((n, r) => n + r.bestand, 0).toFixed(1))
  assert.ok(a.ladenhueterWert > 0)
})
