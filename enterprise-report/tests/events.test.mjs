import './_setup.mjs'
import test from 'node:test'
import assert from 'node:assert/strict'
import { wirksamkeit, alleWirksamkeit, EVENTS_SEED, addEvent, ladeEvents, speichereEvents, mechanikName } from '../src/core/events.js'

test('Mehrumsatz = Ist − Base, Uplift in %', () => {
  const w = wirksamkeit({ name: 'X', kosten: 100, produkte: [{ name: 'P', baseUmsatz: 1000, istUmsatz: 1500, dbMarge: 40 }] })
  assert.equal(w.mehrumsatz, 500)
  assert.equal(w.upliftPct, 50)
})

test('Zusatz-DB und ROI', () => {
  // Mehrumsatz 500 × 40 % = 200 DB; Kosten 100 → Ergebnis 100; ROI 100 %
  const w = wirksamkeit({ name: 'X', kosten: 100, produkte: [{ name: 'P', baseUmsatz: 1000, istUmsatz: 1500, dbMarge: 40 }] })
  assert.equal(w.zusatzDB, 200)
  assert.equal(w.ergebnisEffekt, 100)
  assert.equal(w.roi, 100)
  assert.equal(w.erfolg, true)
})

test('Ladenhüter-Abbau nur für markierte Produkte', () => {
  const w = wirksamkeit({ name: 'X', kosten: 0, produkte: [
    { name: 'normal', baseUmsatz: 100, istUmsatz: 200, dbMarge: 30 },
    { name: 'alt', baseUmsatz: 10, istUmsatz: 60, dbMarge: 10, ladenhueter: true, bestandVorher: 500, bestandNachher: 300 }
  ] })
  assert.equal(w.ladenhueterAbbau, 200)
})

test('Negative Aktion: Kosten > Zusatz-DB → kein Erfolg', () => {
  const w = wirksamkeit({ name: 'X', kosten: 1000, produkte: [{ name: 'P', baseUmsatz: 1000, istUmsatz: 1100, dbMarge: 20 }] })
  assert.equal(w.erfolg, false)
  assert.ok(w.ergebnisEffekt < 0)
})

test('alleWirksamkeit summiert über Aktionen', () => {
  const a = alleWirksamkeit(EVENTS_SEED)
  assert.equal(a.rows.length, EVENTS_SEED.length)
  const erwarteterMehrumsatz = a.rows.reduce((n, r) => n + r.mehrumsatz, 0)
  assert.equal(a.summe.mehrumsatz, Math.round(erwarteterMehrumsatz * 100) / 100)
})

test('Event anlegen wird persistiert', () => {
  localStorage.removeItem('er_events')
  speichereEvents([])
  addEvent({ name: 'Test', kosten: 0, produkte: [] })
  assert.equal(ladeEvents().length, 1)
  assert.equal(ladeEvents()[0].name, 'Test')
})

test('mechanikName liefert lesbaren Namen', () => {
  assert.equal(mechanikName('rabatt'), 'Preisnachlass (%)')
})
