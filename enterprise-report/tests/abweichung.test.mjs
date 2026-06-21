import './_setup.mjs'
import test from 'node:test'
import assert from 'node:assert/strict'
import { analyse } from '../src/core/abweichung.js'

test('Preis + Menge = Gesamtabweichung (saubere Aufspaltung)', () => {
  for (const r of analyse().rows) {
    assert.ok(Math.abs(r.preisAbw + r.mengenAbw - r.gesamt) <= 0.005, r.id + ' Aufspaltung')
  }
})

test('Bewertung: Erlös mehr = günstig, Kosten mehr = ungünstig', () => {
  for (const r of analyse().rows) {
    if (r.art === 'erloes') assert.equal(r.guenstig, r.gesamt >= 0)
    else assert.equal(r.guenstig, r.gesamt <= 0)
  }
})

test('Summen je Art vorhanden', () => {
  const a = analyse()
  assert.ok('gesamt' in a.erloes && 'gesamt' in a.kosten)
})
