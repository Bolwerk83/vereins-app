import './_setup.mjs'
import test from 'node:test'
import assert from 'node:assert/strict'
import { protokolliereZugriff, logVon, setzeZurueck } from '../src/core/berichtLog.js'
import { gesamtStand, QUELLEN_STAND, datenstandText } from '../src/core/datenstand.js'

test('Ein Nutzer zählt pro Tag nur einmal', () => {
  setzeZurueck()
  protokolliereZugriff('b1', 'user:Max')
  protokolliereZugriff('b1', 'user:Max') // selber Tag, selber User → 1
  protokolliereZugriff('b1', 'user:Erika')
  const l = logVon('b1')
  assert.equal(l.personen, 2)
  assert.equal(l.aufrufeGesamt, 2) // User-Tage
  assert.equal(l.heute, 2)
})

test('Admin-Aufrufe werden nicht gezählt', () => {
  setzeZurueck()
  protokolliereZugriff('b2', 'user:Admin', true) // admin = nicht zählen
  protokolliereZugriff('b2', 'user:Max', false)
  assert.equal(logVon('b2').personen, 1)
})

test('Datenstand vorhanden und sinnvoll (ältester Import)', () => {
  assert.ok(QUELLEN_STAND.length >= 3)
  const min = QUELLEN_STAND.map((q) => q.stand).sort()[0]
  assert.equal(gesamtStand(), min)
  assert.match(datenstandText(), /Datenstand: /)
})
