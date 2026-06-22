import './_setup.mjs'
import test from 'node:test'
import assert from 'node:assert/strict'
import { STUFEN, funnel, gesamtKonversion } from '../src/core/prozesskette.js'

test('Funnel ist monoton fallend (jede Stufe ≤ Vorstufe)', () => {
  const f = funnel()
  for (let i = 1; i < f.length; i++) assert.ok(f[i].wert <= f[i - 1].wert)
})

test('Stufe − Abgänge = nächste Stufe (konsistent)', () => {
  const f = funnel()
  for (let i = 0; i < f.length - 1; i++) {
    if (f[i].abgangSumme > 0) assert.equal(f[i].wert - f[i].abgangSumme, f[i + 1].wert)
  }
})

test('Konversion: anteilStart fällt, Gesamtkonversion = Ende/Start', () => {
  const f = funnel()
  assert.equal(f[0].anteilStart, 100)
  assert.ok(f[f.length - 1].anteilStart < 100)
  assert.equal(gesamtKonversion(), Math.round(STUFEN[STUFEN.length - 1].wert / STUFEN[0].wert * 100 * 10) / 10)
})

test('AEB stößt die Lieferkette an', () => {
  const aeb = funnel().find((s) => s.code === 'AEB')
  assert.match(aeb.kette, /Lieferkette/)
})
