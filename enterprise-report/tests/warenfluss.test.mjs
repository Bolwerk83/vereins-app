import './_setup.mjs'
import test from 'node:test'
import assert from 'node:assert/strict'
import { fortschreibung, flussLandung, stichtagHochrechnung, FLOWS, HEUTE_IDX, STICHTAG_IDX } from '../src/core/warenfluss.js'

test('Fortschreibung: Anfang + Eingang − Ausgang = Ende (je Periode)', () => {
  for (const gran of ['tag', 'woche', 'monat', 'quartal']) {
    const f = fortschreibung('lager', gran)
    assert.ok(f.zeilen.length > 0)
    for (const z of f.zeilen) {
      assert.ok(Math.abs(z.anfang + z.ein - z.aus - z.ende) < 0.02, `${gran} ${z.label}: Bilanz stimmt nicht`)
    }
  }
})

test('Endbestand einer Periode = Anfang der nächsten (lückenlose Kette)', () => {
  const f = fortschreibung('auftrag', 'monat')
  for (let i = 1; i < f.zeilen.length; i++) {
    assert.ok(Math.abs(f.zeilen[i - 1].ende - f.zeilen[i].anfang) < 0.02)
  }
})

test('Status: Vergangenheit=Ist, Zukunft=Plan, dazwischen laufend', () => {
  const f = fortschreibung('lager', 'monat')
  assert.ok(f.zeilen.some((z) => z.status === 'ist'))
  assert.ok(f.zeilen.some((z) => z.status === 'plan'))
})

test('Alle drei Flüsse liefern eine Stichtags-Landung', () => {
  for (const id of Object.keys(FLOWS)) {
    const l = flussLandung(id)
    assert.ok(Number.isFinite(l.heute) && Number.isFinite(l.stichtag))
    assert.ok(Math.abs(l.delta - (l.stichtag - l.heute)) < 0.02)
  }
})

test('Stichtags-Hochrechnung: Landepunkt = YTD-Ist + hochgerechnetes Restjahr', () => {
  const h = stichtagHochrechnung('umsatz', { methode: 'runrate' })
  assert.ok(Math.abs(h.landung - (h.ytdIst + h.restFc)) < 1)
  assert.ok(h.landung > h.ytdIst) // Restjahr addiert etwas
})

test('Stichtags-Hochrechnung gibt es auch für EBIT', () => {
  const h = stichtagHochrechnung('ebit', { methode: 'plantreu' })
  assert.equal(h.name, 'EBIT')
  assert.ok(Number.isFinite(h.landung) && Number.isFinite(h.planStichtag))
})

test('Heute liegt vor Stichtag', () => {
  assert.ok(HEUTE_IDX < STICHTAG_IDX)
})
