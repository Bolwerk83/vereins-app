import './_setup.mjs'
import test from 'node:test'
import assert from 'node:assert/strict'
import { addMassnahme, ladeMassnahmen, updateMassnahme } from '../src/core/massnahmen.js'

test('Maßnahme aus Abstimmung trägt positionId/periode und Quelle', () => {
  addMassnahme({ titel: 'Differenz klären', quelle: 'abstimmung', positionId: 'wareneinsatz', periode: '2025' })
  const m = ladeMassnahmen().find((x) => x.positionId === 'wareneinsatz' && x.periode === '2025')
  assert.ok(m, 'Maßnahme nicht gefunden')
  assert.equal(m.quelle, 'abstimmung')
  assert.equal(m.status, 'offen')        // Default
  assert.ok(m.id && m.erstellt)
})

test('updateMassnahme ändert den Status', () => {
  const [m] = ladeMassnahmen()
  updateMassnahme(m.id, { status: 'in_arbeit' })
  assert.equal(ladeMassnahmen().find((x) => x.id === m.id).status, 'in_arbeit')
})
