import './_setup.mjs'
import test from 'node:test'
import assert from 'node:assert/strict'
import { plane, vorschlagEingaben, planwert, TREIBER, rundeStk } from '../src/core/planungEinfach.js'

test('Vorschlag-Eingaben deckt alle Treiber ab', () => {
  const e = vorschlagEingaben()
  assert.ok(TREIBER.every((t) => e[t.id] != null))
})

test('AEB = Auftragseingang × (1 − Storno) (bereinigt)', () => {
  const e = { ...vorschlagEingaben(), auftragseingangMenge: 0, stornoquote: 0 } // AE = basis, Storno = basis
  const p = plane(e)
  const ae = planwert(TREIBER.find((t) => t.id === 'auftragseingangMenge'), 0)
  const storno = planwert(TREIBER.find((t) => t.id === 'stornoquote'), 0)
  assert.ok(Math.abs(p.aebGenau - ae * (1 - storno / 100)) < 0.01)
})

test('Volle Genauigkeit intern, Mengen gerundet bei Ausgabe', () => {
  const p = plane(vorschlagEingaben())
  assert.equal(p.aeb, rundeStk(p.aebGenau))
  assert.ok(Number.isInteger(p.aeb))
  // aebGenau darf Nachkommastellen haben
  assert.ok(p.umsatzPlanMio > 0)
})

test('Treiber-% verändert den Plan (mehr Umsatz bei mehr Auftragseingang)', () => {
  const basis = plane({ ...vorschlagEingaben(), auftragseingangMenge: 0 })
  const mehr = plane({ ...vorschlagEingaben(), auftragseingangMenge: 10 })
  assert.ok(mehr.umsatzPlanMio > basis.umsatzPlanMio)
  assert.ok(mehr.plan.ebit > basis.plan.ebit) // schlägt bis EBIT durch
})

test('Plan leitet alle KPIs ab (EBIT, DB-Quote vorhanden)', () => {
  const p = plane(vorschlagEingaben())
  assert.ok(Number.isFinite(p.plan.ebit))
  assert.ok(Number.isFinite(p.plan.dbQuote))
})
