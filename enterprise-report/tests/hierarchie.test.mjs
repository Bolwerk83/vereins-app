import './_setup.mjs'
import test from 'node:test'
import assert from 'node:assert/strict'
import { STRUKTUR, aggregiere, flach, alleIds } from '../src/core/hierarchie.js'

test('Aggregation: Eltern = Summe der Kinder', () => {
  const root = aggregiere(STRUKTUR)
  const gravel = root.kinder[0].kinder[0] // Fahrräder → Gravel
  assert.equal(gravel.umsatz, 4200000 + 6100000)
  assert.equal(gravel.db, 1180000 + 2010000)
  // Gesamt = Summe aller Blätter
  const summeBlatt = 4200000 + 6100000 + 5200000 + 3100000 + 9800000 + 7400000 + 5600000 + 1200000 + 2300000 + 3900000
  assert.equal(root.umsatz, summeBlatt)
})

test('flach: nur geöffnete Knoten werden ausgeklappt', () => {
  const root = aggregiere(STRUKTUR)
  const nurWurzel = flach(root, new Set(['gesamt']))
  assert.equal(nurWurzel[0].id, 'gesamt')
  assert.equal(nurWurzel.length, 1 + root.kinder.length) // Gesamt + 3 Bereiche
  assert.ok(nurWurzel[1].hatKinder && !nurWurzel[1].offen)
  // Bereich zusätzlich öffnen -> dessen Gruppen erscheinen
  const mitFahrrad = flach(root, new Set(['gesamt', 'b-fahrrad']))
  assert.ok(mitFahrrad.some((r) => r.id === 'g-gravel' && r.tiefe === 2))
})

test('flach: DB% und Anteil werden berechnet', () => {
  const root = aggregiere(STRUKTUR)
  const z = flach(root, new Set(['gesamt']))
  const fahrrad = z.find((r) => r.id === 'b-fahrrad')
  assert.equal(fahrrad.dbProzent, Math.round(fahrrad.db / fahrrad.umsatz * 1000) / 10)
  assert.ok(fahrrad.anteil > 0 && fahrrad.anteil <= 100)
})

test('alleIds enthält verschachtelte Knoten', () => {
  const ids = alleIds(STRUKTUR)
  assert.ok(ids.includes('a-gravel-carbon'))
  assert.ok(ids.length > 10)
})
