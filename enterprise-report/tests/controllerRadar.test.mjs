import './_setup.mjs'
import test from 'node:test'
import assert from 'node:assert/strict'
import { radar } from '../src/core/controllerRadar.js'

test('Radar bündelt Detailbefunde, kritisch zuerst und sortiert', () => {
  const r = radar({})
  assert.ok(r.kritisch.length + r.weitere.length > 5)
  assert.ok(r.kritisch.every((x) => x.schwere === 'fehler'))
  // nach Priorität absteigend
  for (let i = 1; i < r.kritisch.length; i++) assert.ok(r.kritisch[i - 1].prio >= r.kritisch[i].prio)
  assert.ok(typeof r.zusammenfassung === 'string' && r.zusammenfassung.includes('KI-Analyse'))
})

test('Folgefehler über KPI-Abhängigkeiten: nur die Ursache wird gemeldet', () => {
  // Wareneinsatz rot (tief_gut, Ist 50 > Ziel) und DB-Quote rot (abgeleitet).
  const r = radar({ nettoumsatz: 52, wareneinsatz: 50, dbQuote: 1 })
  const alle = [...r.kritisch, ...r.weitere]
  const wein = alle.find((x) => x.key === 'kpi:wareneinsatz')
  assert.ok(wein, 'Wareneinsatz (Ursache) muss gemeldet werden')
  assert.ok(!alle.find((x) => x.key === 'kpi:dbQuote'), 'DB-Quote (Folgefehler) wird ausgeblendet')
  assert.ok(r.statistik.unterdrueckt >= 1)
  assert.ok(wein.wirktAuf.includes('DB-Quote'), 'Ursache verweist auf die Folge-Kennzahl')
})

test('Statistik je Bereich vorhanden', () => {
  const r = radar({})
  assert.ok(Object.keys(r.statistik.jeBereich).length > 0)
  assert.equal(r.statistik.gesamt, r.statistik.kritisch + r.statistik.weitere)
})
