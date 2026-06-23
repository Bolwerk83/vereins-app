import './_setup.mjs'
import test from 'node:test'
import assert from 'node:assert/strict'
import { ergebnis, tKonto } from '../src/core/ergebnis.js'

test('Betriebsergebnis = Erträge − Aufwendungen', () => {
  const e = ergebnis('ist')
  assert.equal(e.betriebsergebnis, +(e.summeErtrag - e.summeAufwand).toFixed(2))
})

test('T-Konto: Soll- und Habensumme sind gleich (Saldoausgleich)', () => {
  const t = tKonto('ist')
  const soll = t.soll.reduce((n, p) => n + p.wert, 0)
  const haben = t.haben.reduce((n, p) => n + p.wert, 0)
  assert.ok(Math.abs(soll - haben) <= 0.01, `Soll ${soll} vs Haben ${haben}`)
  assert.ok(Math.abs(soll - t.summe) <= 0.01)
})

test('Gewinn steht im Soll', () => {
  const t = tKonto('ist')
  if (t.gewinn) assert.ok(t.soll.some((p) => p.saldo))
  else assert.ok(t.haben.some((p) => p.saldo))
})

test('Datenart wirkt (Plan ≠ Ist)', () => {
  assert.notEqual(ergebnis('plan').summeAufwand, ergebnis('ist').summeAufwand)
})

import { ukv } from '../src/core/ergebnis.js'

test('UKV: Betriebsergebnis = Umsatz − HK(Umsatz) − Verwaltung − Vertrieb', () => {
  const u = ukv('ist')
  assert.equal(u.brutto, +(u.umsatz - u.hku).toFixed(2))
  assert.equal(u.betriebsergebnis, +(u.brutto - u.verwaltung - u.vertrieb).toFixed(2))
})

test('Profit-Center-Segment-GuV: Positionen skalieren, Marge bleibt', () => {
  const voll = ergebnis('ist', 1)
  const teil = ergebnis('ist', 0.4)
  assert.ok(Math.abs(teil.summeErtrag - voll.summeErtrag * 0.4) < 0.05)
  assert.ok(Math.abs(teil.betriebsergebnis - voll.betriebsergebnis * 0.4) < 0.05)
  const margeVoll = voll.betriebsergebnis / voll.summeErtrag
  const margeTeil = teil.betriebsergebnis / teil.summeErtrag
  assert.ok(Math.abs(margeVoll - margeTeil) < 0.005)
})
