import './_setup.mjs'
import test from 'node:test'
import assert from 'node:assert/strict'
import { evaluate, extractIds, pruefeFormel, validiere, slug, speichereCustomKpi, ladeCustomKpis, entferneCustomKpi } from '../src/core/kpiFormel.js'

test('Grundrechenarten und Klammern', () => {
  assert.equal(evaluate('1 + 2 * 3', {}), 7)
  assert.equal(evaluate('(1 + 2) * 3', {}), 9)
  assert.equal(evaluate('-4 + 10', {}), 6)
})

test('Bezeichner werden aus Werten aufgelöst', () => {
  assert.equal(evaluate('db1 / nettoumsatz * 100', { db1: 20, nettoumsatz: 50 }), 40)
})

test('extractIds liefert referenzierte KPIs', () => {
  assert.deepEqual(extractIds('a + b * a').sort(), ['a', 'b'])
  assert.deepEqual(extractIds('1 + 2'), [])
})

test('Division durch 0 und fehlende Werte werfen', () => {
  assert.throws(() => evaluate('1 / 0', {}))
  assert.throws(() => evaluate('x + 1', {}))
})

test('Syntaxfehler werden erkannt', () => {
  assert.throws(() => pruefeFormel('1 +'))
  assert.throws(() => pruefeFormel('(1 + 2'))
  assert.throws(() => pruefeFormel('a $ b'))
})

test('validiere: unbekannte KPI und Selbstreferenz', () => {
  const ok = validiere({ id: 'c_x', name: 'X', formel: 'db1 * 2' }, new Set(['db1']))
  assert.equal(ok.ok, true)
  const self = validiere({ id: 'c_x', name: 'X', formel: 'c_x + 1' }, new Set(['c_x']))
  assert.equal(self.ok, false)
  const unbek = validiere({ id: 'c_y', name: 'Y', formel: 'gibtsnicht' }, new Set(['db1']))
  assert.equal(unbek.ok, false)
})

test('slug erzeugt technische ID', () => {
  assert.equal(slug('Meine Öko-Quote'), 'c_meine_oeko_quote')
})

test('Custom-KPI speichern/laden/entfernen', () => {
  localStorage.removeItem('er_kpi_custom')
  speichereCustomKpi({ id: 'c_test', name: 'Test', formel: 'db1 / nettoumsatz' })
  assert.equal(ladeCustomKpis().length, 1)
  speichereCustomKpi({ id: 'c_test', name: 'Test 2', formel: 'db1' }) // update
  assert.equal(ladeCustomKpis()[0].name, 'Test 2')
  entferneCustomKpi('c_test')
  assert.equal(ladeCustomKpis().length, 0)
})
