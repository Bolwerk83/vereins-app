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

import { auswertungNach, CENTER, DIMENSIONEN } from '../src/core/profitcenter.js'

test('auswertungNach: Gruppierung nach Region summiert Umsatz konstant', () => {
  const proCenter = auswertungNach('name')
  const proRegion = auswertungNach('region')
  const proTyp = auswertungNach('typ')
  const u = (x) => Math.round(x.umsatz * 100) / 100
  assert.equal(u(proRegion), u(proCenter))
  assert.equal(u(proTyp), u(proCenter))
  // Gesamtergebnis bleibt über alle Gruppierungen gleich
  assert.equal(Math.round(proRegion.gesamt * 100) / 100, Math.round(proCenter.gesamt * 100) / 100)
})

test('auswertungNach region: DACH bündelt Filialen + Service', () => {
  const dach = auswertungNach('region').rows.find((r) => r.id === 'DACH')
  assert.ok(dach)
  // Umsatz DACH = Filialen 19.2 + Service 2.6 = 21.8
  assert.equal(Math.round(dach.umsatz * 10) / 10, 21.8)
})

test('DIMENSIONEN bietet Center/Region/Typ', () => {
  assert.deepEqual(DIMENSIONEN.map((d) => d.key), ['name', 'region', 'typ'])
})
