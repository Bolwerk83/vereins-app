import './_setup.mjs'
import test from 'node:test'
import assert from 'node:assert/strict'
import { TEILGEBIETE, teilgebiet } from '../src/core/controllingStruktur.js'
import { KPI } from '../src/core/kpiRegistry.js'

test('Teilgebiete haben eindeutige IDs und beide Gliederungen sind vertreten', () => {
  const ids = TEILGEBIETE.map((t) => t.id)
  assert.equal(new Set(ids).size, ids.length)
  assert.ok(TEILGEBIETE.some((t) => t.gliederung === 'funktional'))
  assert.ok(TEILGEBIETE.some((t) => t.gliederung === 'faktor'))
  assert.ok(teilgebiet('produktion'))
})

test('alle zugeordneten Kennzahlen existieren in der Registry', () => {
  for (const t of TEILGEBIETE) {
    for (const id of t.kpis) assert.ok(KPI[id], `${t.id}: unbekannte KPI ${id}`)
    assert.ok(t.kpis.length > 0, `${t.id} ohne Kennzahlen`)
    assert.ok(t.instrumente.operativ.length && t.instrumente.strategisch.length, `${t.id} ohne Instrumente`)
  }
})
