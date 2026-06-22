import './_setup.mjs'
import test from 'node:test'
import assert from 'node:assert/strict'
import { KPI } from '../src/core/kpiRegistry.js'
import { setKpiOverride, resetKpiOverride, istUeberschrieben, ladeOverrides } from '../src/core/kpiOverrides.js'

test('setKpiOverride wirkt live und wird persistiert', () => {
  const original = KPI.nettoumsatz.ziel
  setKpiOverride('nettoumsatz', { ziel: 99.9, beschreibung: 'geändert' })
  assert.equal(KPI.nettoumsatz.ziel, 99.9)              // live in der Registry
  assert.equal(KPI.nettoumsatz.beschreibung, 'geändert')
  assert.equal(ladeOverrides().nettoumsatz.ziel, 99.9)  // persistiert
  assert.ok(istUeberschrieben('nettoumsatz'))
  assert.notEqual(99.9, original)
})

test('resetKpiOverride stellt den Originalwert wieder her', () => {
  const original = KPI.wareneinsatz.ziel
  setKpiOverride('wareneinsatz', { ziel: 1.23 })
  assert.equal(KPI.wareneinsatz.ziel, 1.23)
  resetKpiOverride('wareneinsatz')
  assert.equal(KPI.wareneinsatz.ziel, original)         // Code-Original zurück
  assert.ok(!istUeberschrieben('wareneinsatz'))
})
