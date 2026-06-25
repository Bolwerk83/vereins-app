import './_setup.mjs'
import test from 'node:test'
import assert from 'node:assert/strict'
import { SCHICHTEN, STERN, PRINZIPIEN, RICHTWERTE, uebersicht } from '../src/core/datenarchitektur.js'

test('Pipeline-Schichten vollständig und in Reihenfolge Quelle → Browser', () => {
  const ids = SCHICHTEN.map((s) => s.id)
  assert.ok(ids[0] === 'quellen' && ids[ids.length - 1] === 'browser')
  for (const id of ['elt', 'star', 'preagg', 'security', 'api']) assert.ok(ids.includes(id), id)
  for (const s of SCHICHTEN) assert.ok(s.name && s.text && s.icon)
})

test('Sternschema enthält Fakten und die Profit-Center-Dimension', () => {
  assert.ok(STERN.fakten.length >= 1)
  const pc = STERN.dimensionen.find((d) => d.id === 'pc')
  assert.ok(pc && /Geschäftsbereich|Kanal|Land/.test(pc.hierarchie))
})

test('Prinzipien & Richtwerte vorhanden', () => {
  assert.ok(PRINZIPIEN.length >= 4 && PRINZIPIEN.every((p) => p.titel && p.text))
  assert.ok(RICHTWERTE.length >= 3)
  const u = uebersicht()
  assert.equal(u.schichten.length, SCHICHTEN.length)
})
