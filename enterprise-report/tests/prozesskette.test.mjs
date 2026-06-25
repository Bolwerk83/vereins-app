import { strict as assert } from 'assert'
import { test } from 'node:test'
import {
  STUFEN, LIEFERKETTE, WERTSCHOEPFUNG,
  funnel, lieferkette, wertschoepfung, gesamtKonversion
} from '../src/core/prozesskette.js'

test('STUFEN: führt bis AEB', () => {
  const codes = STUFEN.map((s) => s.code)
  assert.ok(codes.includes('ANGE'))
  assert.ok(codes.includes('AE'))
  assert.ok(codes.includes('AEB'))
})

test('LIEFERKETTE: beginnt bei AEB, endet mit VERS', () => {
  assert.equal(LIEFERKETTE[0].code, 'AEB')
  assert.equal(LIEFERKETTE[LIEFERKETTE.length - 1].code, 'VERS')
})

test('WERTSCHOEPFUNG: beginnt bei AEB, endet mit UMS', () => {
  assert.equal(WERTSCHOEPFUNG[0].code, 'AEB')
  assert.equal(WERTSCHOEPFUNG[WERTSCHOEPFUNG.length - 1].code, 'UMS')
})

test('funnel: Werte monoton fallend', () => {
  const f = funnel()
  for (let i = 1; i < f.length; i++)
    assert.ok(f[i].wert <= f[i-1].wert, `Stufe ${f[i].code} größer als Vorstufe`)
})

test('lieferkette: anteilStart und stufenKonversion korrekt', () => {
  const lk = lieferkette()
  assert.equal(lk[0].anteilStart, 100)
  assert.equal(lk[0].stufenKonversion, 100)
  for (let i = 1; i < lk.length; i++) {
    assert.ok(lk[i].anteilStart <= 100)
    assert.ok(lk[i].stufenKonversion <= 100)
  }
})

test('wertschoepfung: anteilStart korrekt', () => {
  const wk = wertschoepfung()
  assert.equal(wk[0].anteilStart, 100)
  for (let i = 1; i < wk.length; i++)
    assert.ok(wk[i].anteilStart <= 100)
})

test('gesamtKonversion: zwischen 0 und 100', () => {
  const k = gesamtKonversion()
  assert.ok(k >= 0 && k <= 100, `gesamtKonversion=${k}`)
})
