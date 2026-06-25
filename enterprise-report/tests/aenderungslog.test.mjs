import './_setup.mjs'
import test from 'node:test'
import assert from 'node:assert/strict'
import { ladeAenderungen, protokolliere, aenderungsStatistik, typInfo, AENDERUNGS_TYPEN, SEED_AENDERUNGEN } from '../src/core/aenderungslog.js'

test('Seed-Ereignisse werden geladen, neueste zuerst', () => {
  localStorage.removeItem('er_aenderungslog')
  const a = ladeAenderungen()
  assert.ok(a.length >= SEED_AENDERUNGEN.length)
  for (let i = 1; i < a.length; i++) assert.ok(String(a[i - 1].ts) >= String(a[i].ts)) // absteigend
})

test('protokolliere fügt vorn ein und persistiert', () => {
  localStorage.removeItem('er_aenderungslog')
  protokolliere({ typ: 'neu', titel: 'Test-Bericht', wo: 'kennzahlen', wer: 'Anna' }, '2099-01-01 10:00')
  const a = ladeAenderungen()
  assert.equal(a[0].titel, 'Test-Bericht')   // neuester Zeitstempel ganz oben
  assert.equal(a[0].ts, '2099-01-01 10:00')
  assert.equal(a[0].wer, 'Anna')
})

test('Ereignis ohne Typ wird ignoriert', () => {
  localStorage.removeItem('er_aenderungslog')
  const vorher = ladeAenderungen().length
  protokolliere({ titel: 'kein typ' }, '2099-01-01 11:00')
  assert.equal(ladeAenderungen().length, vorher)
})

test('limit begrenzt die Trefferzahl', () => {
  localStorage.removeItem('er_aenderungslog')
  assert.equal(ladeAenderungen({ limit: 3 }).length, 3)
})

test('Filter nach Typ', () => {
  localStorage.removeItem('er_aenderungslog')
  const nur = ladeAenderungen({ typ: 'neu' })
  assert.ok(nur.length >= 1)
  assert.ok(nur.every((e) => e.typ === 'neu'))
})

test('aenderungsStatistik zählt Kategorien', () => {
  localStorage.removeItem('er_aenderungslog')
  const s = aenderungsStatistik()
  assert.ok(s.gesamt >= 1)
  assert.ok(s.neu >= 0 && s.entfernt >= 0 && s.geaendert >= 0)
})

test('typInfo liefert Symbol/Label, Fallback robust', () => {
  assert.equal(typInfo('neu').label, AENDERUNGS_TYPEN.neu.label)
  assert.equal(typInfo('gibtsnicht').label, 'gibtsnicht')
})
