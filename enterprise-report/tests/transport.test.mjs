import './_setup.mjs'
import test from 'node:test'
import assert from 'node:assert/strict'
import { bundleErstellen, bundleAnwenden } from '../src/core/transport.js'

test('Bundle: Verteiler + Layouts round-trip über die Stores', () => {
  // Quellstand setzen
  localStorage.setItem('er_verteiler', JSON.stringify([{ id: 'v1', name: 'Monatsreport' }, { id: 'v2', name: 'Wochenmail' }]))
  localStorage.setItem('er_tabellenlayout', JSON.stringify({ 'vk_kunde': { spalten: ['a'] }, 'ek_lieferant': { spalten: ['b'] } }))

  const bundle = bundleErstellen(
    { verteiler: ['v1'], layouts: ['vk_kunde'] },
    { von: 'dev', nach: 'test', modus: 'direkt', autor: 'tester' }
  )
  assert.equal(bundle.anzahl, 2)
  assert.equal(bundle.von, 'dev')
  assert.ok(bundle.id.startsWith('TR-'))

  // Zielstand leeren und Bundle anwenden
  localStorage.setItem('er_verteiler', '[]')
  localStorage.setItem('er_tabellenlayout', '{}')
  const bericht = bundleAnwenden(bundle)

  const verteiler = JSON.parse(localStorage.getItem('er_verteiler'))
  const layouts = JSON.parse(localStorage.getItem('er_tabellenlayout'))
  assert.deepEqual(verteiler.map((v) => v.id), ['v1'])
  assert.ok(layouts.vk_kunde)
  assert.ok(!layouts.ek_lieferant)
  assert.ok(bericht.length >= 2)
})

test('Bundle ohne Auswahl ist leer', () => {
  const b = bundleErstellen({}, { von: 'dev', nach: 'test', modus: 'direkt' })
  assert.equal(b.anzahl, 0)
  assert.deepEqual(b.artefakte, {})
})
