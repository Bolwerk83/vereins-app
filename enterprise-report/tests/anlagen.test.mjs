import './_setup.mjs'
import test from 'node:test'
import assert from 'node:assert/strict'
import { phaseVon, auswertung } from '../src/core/anlagen.js'

test('Phase aus Alter/Nutzungsdauer', () => {
  assert.equal(phaseVon(1, 9), 'beschaffung')
  assert.equal(phaseVon(3, 8), 'nutzung')
  assert.equal(phaseVon(7, 10), 'instandhaltung')
  assert.equal(phaseVon(6, 6), 'ersatz')
})

test('Kalk. Abschreibung = Wiederbeschaffungswert / ND > bilanziell', () => {
  for (const r of auswertung().rows) {
    assert.equal(r.kalkAbschr, +(r.wbw / r.nd).toFixed(2))
    assert.ok(r.kalkAbschr >= r.bilanzAbschr)
    assert.ok(r.restbuchwert >= 0)
  }
})

test('Ersatz-fällig wird gezählt', () => {
  const a = auswertung()
  assert.equal(a.ersatzFaellig, a.rows.filter((r) => r.phase === 'ersatz').length)
})
