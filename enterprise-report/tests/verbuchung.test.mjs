import './_setup.mjs'
import test from 'node:test'
import assert from 'node:assert/strict'
import { ueberleitung } from '../src/core/verbuchung.js'

test('Überleitung: kalk. Ergebnis = bilanziell − Anderskosten-Mehrbetrag − Zusatzkosten', () => {
  const u = ueberleitung('ist')
  assert.equal(u.kalkErgebnis, +(u.bilanziellesErgebnis - u.summeAnders - u.zusatz).toFixed(2))
})

test('Anderskosten-Mehrbetrag = kalk − bilanziell je Position', () => {
  const u = ueberleitung('ist')
  for (const a of u.anders) assert.equal(a.mehrbetrag, +(a.kalk - a.bilanz).toFixed(2))
  assert.equal(u.summeAnders, +u.anders.reduce((n, a) => n + a.mehrbetrag, 0).toFixed(2))
})
