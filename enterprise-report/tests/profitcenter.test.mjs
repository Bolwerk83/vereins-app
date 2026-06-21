import './_setup.mjs'
import test from 'node:test'
import assert from 'node:assert/strict'
import { auswertung } from '../src/core/profitcenter.js'

test('Ergebnis = Umsatz − variable Kosten − Fixkosten; DB korrekt', () => {
  for (const r of auswertung().rows) {
    assert.equal(r.db, +(r.umsatz - r.varKosten).toFixed(2))
    assert.equal(r.ergebnis, +(r.db - r.fixKosten).toFixed(2))
  }
})

test('Gesamtergebnis = Summe der Center-Ergebnisse; Beiträge ~100 %', () => {
  const a = auswertung()
  assert.equal(a.gesamt, +a.rows.reduce((n, r) => n + r.ergebnis, 0).toFixed(2))
  const beitrag = a.rows.reduce((n, r) => n + r.beitrag, 0)
  assert.ok(Math.abs(beitrag - 100) <= 2, 'Beitrag ' + beitrag)
})

test('ROCE nur bei Investment Centern', () => {
  for (const r of auswertung().rows) {
    if (r.typ === 'investment') assert.ok(r.roce != null)
    else assert.equal(r.roce, null)
  }
})
