import './_setup.mjs'
import test from 'node:test'
import assert from 'node:assert/strict'
import { treiber, abgeleitet, simuliere } from '../src/core/whatif.js'
import { MOCK } from '../src/data/mock.js'

const roh = MOCK.roheWerte['2025']

test('Treiber sind Rohwerte, Abgeleitete haben Formeln', () => {
  assert.ok(treiber(roh).some((t) => t.id === 'nettoumsatz'))
  assert.ok(abgeleitet().some((k) => k.id === 'dbQuote'))
  // Keine Überschneidung
  const tids = new Set(treiber(roh).map((t) => t.id))
  assert.ok(!abgeleitet().some((k) => tids.has(k.id)))
})

test('Simulation: +10 % Nettoumsatz hebt abgeleitete KPIs', () => {
  const { wirkung } = simuliere(roh, { nettoumsatz: { modus: 'pct', wert: 10 } })
  const db = wirkung.find((w) => w.id === 'dbQuote')
  assert.ok(db.geaendert)
  assert.ok(db.nach > db.vor) // höhere Marge bei mehr Umsatz, konstanten Kosten
})

test('Ohne Overrides keine Änderung', () => {
  const { wirkung } = simuliere(roh, {})
  assert.ok(wirkung.every((w) => !w.geaendert))
})

test('Absoluter Override setzt den Wert direkt', () => {
  const { sim } = simuliere(roh, { wareneinsatz: { modus: 'abs', wert: 0 } })
  assert.equal(sim.wareneinsatz, 0)
})
