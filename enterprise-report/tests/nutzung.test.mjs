import './_setup.mjs'
import test from 'node:test'
import assert from 'node:assert/strict'
import { trackOeffnung, auswertung, verlauf, reset } from '../src/core/nutzung.js'

test('Öffnungen werden gezählt und sortiert', () => {
  reset()
  trackOeffnung('marketing'); trackOeffnung('marketing'); trackOeffnung('bestand')
  const a = auswertung()
  assert.equal(a.gesamt, 3)
  assert.equal(a.rows[0].id, 'marketing')
  assert.equal(a.rows[0].count, 2)
  assert.equal(a.aktiveBerichte, 2)
})

test('Heute- und Wochenzähler erfassen aktuelle Öffnungen', () => {
  reset()
  trackOeffnung('segment')
  const a = auswertung()
  assert.equal(a.heuteGesamt, 1)
  assert.equal(a.wocheGesamt, 1)
  assert.equal(a.rows[0].heute, 1)
})

test('leere/ungültige ID wird ignoriert', () => {
  reset()
  trackOeffnung(); trackOeffnung('')
  assert.equal(auswertung().gesamt, 0)
})

test('Verlauf liefert n Tage, heutiger Tag enthält die Öffnung', () => {
  reset()
  trackOeffnung('ergebnis')
  const v = verlauf(14)
  assert.equal(v.length, 14)
  assert.equal(v[v.length - 1].count, 1)
})

test('reset leert die Statistik', () => {
  trackOeffnung('x'); reset()
  assert.equal(auswertung().gesamt, 0)
})
