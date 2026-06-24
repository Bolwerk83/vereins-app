import './_setup.mjs'
import test from 'node:test'
import assert from 'node:assert/strict'
import { MOCK } from '../src/data/mock.js'
import { simuliereSzenario, effekte, stellhebel, STELLHEBEL } from '../src/core/szenarioEngine.js'

const roh = MOCK.roheWerte['2025']

test('Stellhebel liefert Basiswerte', () => {
  const lev = stellhebel(roh)
  assert.ok(lev.length >= 8)
  assert.ok(lev.every((l) => typeof l.basis === 'number'))
})

test('Mehrere Overrides wirken gemeinsam (Umsatz +, Wareneinsatz −)', () => {
  const { basis, sim } = simuliereSzenario(roh, {
    nettoumsatz: { modus: 'pct', wert: 10 },
    wareneinsatz: { modus: 'pct', wert: -5 },
  })
  assert.ok(sim.ebit > basis.ebit, 'EBIT muss steigen')
  assert.ok(sim.db1 > basis.db1, 'DB I muss steigen')
})

test('effekte sind nach Bedeutung sortiert und erklärt', () => {
  const { basis, sim, fixiert } = simuliereSzenario(roh, { retourenquote: { modus: 'abs', wert: 7 } })
  const eff = effekte(basis, sim, { fixiert })
  assert.ok(eff.length > 0)
  assert.ok(eff.some((e) => e.id === 'ebit')) // Kausalkette bis EBIT
  // Ampel-Wechsel werden vorne einsortiert
  const ersterFlip = eff.findIndex((e) => e.flip)
  const ersterNonFlip = eff.findIndex((e) => !e.flip)
  if (ersterFlip >= 0 && ersterNonFlip >= 0) assert.ok(ersterFlip <= ersterNonFlip)
})

test('Kein Override → keine Effekte', () => {
  const { basis, sim, fixiert } = simuliereSzenario(roh, {})
  assert.equal(effekte(basis, sim, { fixiert }).length, 0)
})

test('Stabilität: jeder einzelne Stellhebel ±20 % bleibt endlich', () => {
  for (const id of STELLHEBEL) {
    for (const w of [-20, 20]) {
      const { sim } = simuliereSzenario(roh, { [id]: { modus: 'pct', wert: w } })
      for (const k of Object.keys(sim)) assert.ok(Number.isFinite(sim[k]), `${id} ${w}% → ${k} nicht endlich`)
    }
  }
})
