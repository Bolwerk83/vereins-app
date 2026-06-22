import './_setup.mjs'
import test from 'node:test'
import assert from 'node:assert/strict'
import { beispielReports } from '../src/core/designerSeed.js'

test('beispielReports liefert genau 20 Berichte mit stabilen IDs', () => {
  const r = beispielReports()
  assert.equal(r.length, 20)
  assert.ok(r.every((x) => x.id.startsWith('seed-')))
  assert.equal(new Set(r.map((x) => x.id)).size, 20) // keine Duplikate
})

test('jeder Bericht hat KPI- und Tabellen-Blöcke', () => {
  for (const r of beispielReports()) {
    assert.ok(r.bloecke.some((b) => b.typ === 'kpi'), `${r.id} ohne KPI`)
    assert.ok(r.bloecke.some((b) => b.typ === 'tabelle'), `${r.id} ohne Tabelle`)
    assert.ok(r.bloecke.some((b) => b.typ === 'massnahmen'), `${r.id} ohne Maßnahmen`)
  }
})
