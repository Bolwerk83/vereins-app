import './_setup.mjs'
import test from 'node:test'
import assert from 'node:assert/strict'
import { aging } from '../src/core/forderungen.js'

test('Gesamt = Summe der Buckets; überfällig ohne „nicht fällig"', () => {
  const a = aging()
  assert.equal(a.gesamt, +a.rows.reduce((n, r) => n + r.betrag, 0).toFixed(2))
  const uf = a.rows.filter((r) => r.id !== 'nf').reduce((n, r) => n + r.betrag, 0)
  assert.equal(a.ueberfaellig, +uf.toFixed(2))
})

test('Erwarteter Ausfall = Σ Betrag × WB-Satz', () => {
  const a = aging()
  for (const r of a.rows) assert.equal(r.ausfall, +(r.betrag * r.wbSatz / 100).toFixed(2))
  assert.equal(a.erwarteterAusfall, +a.rows.reduce((n, r) => n + r.ausfall, 0).toFixed(2))
})

test('Quoten und DSO vorhanden', () => {
  const a = aging()
  assert.ok(a.ueberfaelligkeitsquote > 0 && a.dso > 0)
})

test('Profit-Center-Faktor skaliert Beträge, Quoten/DSO bleiben', () => {
  const voll = aging(1)
  const teil = aging(0.586)
  assert.ok(Math.abs(teil.gesamt - voll.gesamt * 0.586) < 0.05)
  // Quoten aus unskalierter Basis → exakt invariant
  assert.equal(teil.ueberfaelligkeitsquote, voll.ueberfaelligkeitsquote)
  assert.equal(teil.dso, voll.dso)
  assert.equal(teil.ausfallquote, voll.ausfallquote)
})
