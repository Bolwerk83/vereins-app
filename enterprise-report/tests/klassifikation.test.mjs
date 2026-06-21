import './_setup.mjs'
import test from 'node:test'
import assert from 'node:assert/strict'
import { istMonetaer, artId, horizontId } from '../src/core/klassifikation.js'

test('monetär folgt der Einheit (eur/eur_mio), sonst nicht-monetär', () => {
  assert.equal(istMonetaer({ einheit: 'eur_mio' }), true)
  assert.equal(istMonetaer({ einheit: 'eur' }), true)
  assert.equal(istMonetaer({ einheit: 'percent' }), false)
  assert.equal(istMonetaer({ einheit: 'days' }), false)
  assert.equal(artId({ einheit: 'eur_mio' }), 'monetaer')
  assert.equal(artId({ einheit: 'count' }), 'nicht_monetaer')
})

test('explizites monetaer-Flag überschreibt die Einheit', () => {
  assert.equal(istMonetaer({ einheit: 'percent', monetaer: true }), true)
  assert.equal(istMonetaer({ einheit: 'eur_mio', monetaer: false }), false)
})

test('Horizont: Default operativ, strategische Liste + Override', () => {
  assert.equal(horizontId({ id: 'nettoumsatz' }), 'operativ')
  assert.equal(horizontId({ id: 'co2ProRad' }), 'strategisch')
  assert.equal(horizontId({ id: 'nettoumsatz', horizont: 'strategisch' }), 'strategisch')
})
