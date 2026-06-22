import './_setup.mjs'
import test from 'node:test'
import assert from 'node:assert/strict'
import { bab, wirtschaftlichkeit, VORSTELLEN } from '../src/core/kostenstellen.js'

test('Gesamt-GK je Endstelle = Primär + Umlage', () => {
  for (const r of bab().rows) assert.equal(r.gesamt, +(r.primaer + r.umlage).toFixed(2))
})

test('Umlage verteilt die Vorkostenstellen vollständig', () => {
  const summeUmlage = bab().rows.reduce((n, r) => n + r.umlage, 0)
  const summeVor = VORSTELLEN.reduce((n, v) => n + v.primaerIst, 0)
  assert.ok(Math.abs(summeUmlage - summeVor) <= 0.05, `Umlage ${summeUmlage} vs Vor ${summeVor}`)
})

test('Zuschlagssatz = Gesamt-GK / Bezugsbasis', () => {
  for (const r of bab().rows) assert.equal(r.zuschlag, +(r.gesamt / r.bezugWert * 100).toFixed(1))
})

test('Wirtschaftlichkeit: Abweichung = Ist − Plan', () => {
  for (const s of wirtschaftlichkeit()) assert.equal(s.abw, +(s.ist - s.plan).toFixed(2))
})
