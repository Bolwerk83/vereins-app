import './_setup.mjs'
import test from 'node:test'
import assert from 'node:assert/strict'
import { KPI, berechneAlle } from '../src/core/kpiRegistry.js'
import { MOCK } from '../src/data/mock.js'

test('berechneAlle leitet db1 = nettoumsatz − wareneinsatz ab', () => {
  const w = berechneAlle(MOCK.roheWerte['2025'])
  assert.ok(w.nettoumsatz != null && w.wareneinsatz != null)
  assert.equal(+w.db1.toFixed(4), +(w.nettoumsatz - w.wareneinsatz).toFixed(4))
})

test('berechneAlle übernimmt rohe Werte unverändert', () => {
  const roh = MOCK.roheWerte['2025']
  const w = berechneAlle(roh)
  assert.equal(w.nettoumsatz, roh.nettoumsatz)
})

test('jede abgeleitete KPI hat berechne() und Abhängigkeiten', () => {
  for (const k of Object.values(KPI)) {
    if (typeof k.berechne === 'function') assert.ok(Array.isArray(k.abhaengig) && k.abhaengig.length > 0, `${k.id} ohne abhaengig`)
  }
})

test('berechneAlle löst alle abgeleiteten KPIs auf (keine offenen)', () => {
  const w = berechneAlle(MOCK.roheWerte['2025'])
  const offen = Object.values(KPI).filter((k) => typeof k.berechne === 'function' && w[k.id] == null)
  assert.equal(offen.length, 0, 'ungelöst: ' + offen.map((k) => k.id).join(', '))
})
