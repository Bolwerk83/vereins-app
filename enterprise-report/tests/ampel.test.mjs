import './_setup.mjs'
import test from 'node:test'
import assert from 'node:assert/strict'
import { ampelStatus, trendAusHistorie } from '../src/core/ampel.js'

test('ampelStatus hoch_gut: im Ziel = grün', () => {
  assert.equal(ampelStatus({ wert: 100, ziel: 100, richtung: 'hoch_gut' }), 'g')
  assert.equal(ampelStatus({ wert: 120, ziel: 100, richtung: 'hoch_gut' }), 'g')
})

test('ampelStatus hoch_gut: knapp/deutlich darunter = gelb/rot', () => {
  assert.equal(ampelStatus({ wert: 97, ziel: 100, richtung: 'hoch_gut' }), 'a')
  assert.equal(ampelStatus({ wert: 80, ziel: 100, richtung: 'hoch_gut' }), 'r')
})

test('ampelStatus tief_gut: unter Ziel = grün', () => {
  assert.equal(ampelStatus({ wert: 90, ziel: 100, richtung: 'tief_gut' }), 'g')
  assert.equal(ampelStatus({ wert: 130, ziel: 100, richtung: 'tief_gut' }), 'r')
})

test('ampelStatus ohne Ziel = neutral', () => {
  assert.equal(ampelStatus({ wert: 50, ziel: null }), 'n')
})

test('trendAusHistorie erkennt Richtung', () => {
  assert.equal(trendAusHistorie([10, 12], 'hoch_gut').trend, 'up')
  assert.equal(trendAusHistorie([12, 10], 'hoch_gut').trend, 'down')
  assert.equal(trendAusHistorie([10], 'hoch_gut').trend, 'flat')
  assert.equal(trendAusHistorie([10, 12], 'hoch_gut').istGut, true)
  assert.equal(trendAusHistorie([10, 12], 'tief_gut').istGut, false)
})
