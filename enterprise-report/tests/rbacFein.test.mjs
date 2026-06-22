import './_setup.mjs'
import test from 'node:test'
import assert from 'node:assert/strict'
import { darfKpi, darfDimension } from '../src/core/rbac.js'

const ungeschuetzt = { id: 'nettoumsatz' }
const geschuetzt = { id: 'personalkosten', security: ['GF', 'HR', 'FIN'] }

test('Ungeschützte KPI ist sichtbar – außer explizit gesperrt', () => {
  const rolle = { bereiche: '*', kontext: [] }
  assert.equal(darfKpi(rolle, ungeschuetzt), true)
  assert.equal(darfKpi({ ...rolle, kpiGesperrt: ['nettoumsatz'] }, ungeschuetzt), false)
})

test('Geschützte KPI: ohne Kontext gesperrt, mit Einzelfreigabe sichtbar', () => {
  const vertrieb = { bereiche: ['VK'], kontext: [] }
  assert.equal(darfKpi(vertrieb, geschuetzt), false)
  assert.equal(darfKpi({ ...vertrieb, kpiFrei: ['personalkosten'] }, geschuetzt), true)
})

test('Einzelsperre hat Vorrang vor Freigabe', () => {
  const rolle = { bereiche: '*', kontext: ['HR'], kpiGesperrt: ['personalkosten'], kpiFrei: ['personalkosten'] }
  assert.equal(darfKpi(rolle, geschuetzt), false)
})

test('darfDimension respektiert dimGesperrt', () => {
  assert.equal(darfDimension({ dimGesperrt: ['funktion'] }, 'funktion'), false)
  assert.equal(darfDimension({ dimGesperrt: ['funktion'] }, 'art'), true)
  assert.equal(darfDimension({}, 'art'), true)
})

test('Kontext-Rolle (HR) sieht geschützte KPI weiterhin', () => {
  assert.equal(darfKpi({ bereiche: ['HR', 'PC'], kontext: ['HR'] }, geschuetzt), true)
})
