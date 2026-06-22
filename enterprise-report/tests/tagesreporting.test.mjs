import './_setup.mjs'
import test from 'node:test'
import assert from 'node:assert/strict'
import { KPIS, tageskennzahlen, tagesHighlights } from '../src/core/tagesreporting.js'

test('Tageskennzahlen: heute/gestern/Delta korrekt', () => {
  const k = tageskennzahlen().find((x) => x.id === 'umsatz')
  const r = KPIS.find((x) => x.id === 'umsatz').reihe
  assert.equal(k.heute, r[r.length - 1])
  assert.equal(k.gestern, r[r.length - 2])
  assert.equal(k.delta, r[r.length - 1] - r[r.length - 2])
})

test('Richtung: bei Retouren ist weniger gut', () => {
  // Retouren heute 13400 > gestern 4200 -> Anstieg -> schlecht
  const ret = tageskennzahlen().find((x) => x.id === 'retouren')
  assert.ok(ret.delta > 0)
  assert.equal(ret.gut, false)
})

test('Umsatz heute über gestern -> gut', () => {
  const u = tageskennzahlen().find((x) => x.id === 'umsatz')
  assert.ok(u.delta > 0)
  assert.equal(u.gut, true)
})

test('Highlights enthalten nur Bewegungen >= 5 %, sortiert nach Betrag', () => {
  const h = tagesHighlights()
  assert.ok(h.every((x) => Math.abs(x.deltaPct) >= 5))
  for (let i = 1; i < h.length; i++) assert.ok(Math.abs(h[i - 1].deltaPct) >= Math.abs(h[i].deltaPct))
})
