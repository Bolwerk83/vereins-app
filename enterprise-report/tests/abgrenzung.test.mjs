import './_setup.mjs'
import test from 'node:test'
import assert from 'node:assert/strict'
import { abgrenzung } from '../src/core/abgrenzung.js'

test('Identität: Unternehmensergebnis = neutrales Ergebnis + Zweckergebnis', () => {
  const a = abgrenzung('ist')
  assert.equal(a.unternehmensergebnis, +(a.neutralesErgebnis + a.zweckergebnis).toFixed(2))
})

test('Identität: Betriebsergebnis = Zweckergebnis + Verrechnungsdifferenz', () => {
  const a = abgrenzung('ist')
  assert.equal(a.betriebsergebnis, +(a.zweckergebnis + a.verrechnungsdifferenz).toFixed(2))
})

test('Kosten = Grundkosten + Summe kalkulatorische Kosten', () => {
  const a = abgrenzung('ist')
  assert.equal(a.kosten, +(a.grundkosten + a.summeKalk).toFixed(2))
})

test('Leistungen = Summe Zweckerträge; Betriebsergebnis = Leistungen − Kosten', () => {
  const a = abgrenzung('ist')
  assert.equal(a.leistungen, a.summeZweckertrag)
  assert.equal(a.betriebsergebnis, +(a.leistungen - a.kosten).toFixed(2))
})

test('Zweckaufwand je Position = GuV − neutral', () => {
  const a = abgrenzung('ist')
  for (const p of a.aufwendungen) assert.equal(p.zweck, +Math.max(p.guv - p.neutral, 0).toFixed(2))
})

test('Verrechnungsdifferenz = −(Anderskosten-Mehrbetrag + Zusatzkosten)', () => {
  const a = abgrenzung('ist')
  assert.equal(a.verrechnungsdifferenz, +(-(a.summeAnders + a.summeZusatz)).toFixed(2))
})
