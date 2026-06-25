import './_setup.mjs'
import test from 'node:test'
import assert from 'node:assert/strict'
import { phasen, alleKennzahlen, ART_SYMBOL } from '../src/core/vertriebKennzahlen.js'
import { LEGENDE } from '../src/core/detailberichte.js'

test('Sechs Vertriebsphasen vorhanden', () => {
  const ids = phasen().map((p) => p.id)
  assert.deepEqual(ids, ['ange', 'ae', 'aer', 'au', 'q', 'um'])
})

test('AEW gibt es nicht mehr (weder Taxonomie noch Legende)', () => {
  assert.ok(!alleKennzahlen().some((k) => k.code === 'AEW'))
  assert.ok(!LEGENDE.some(([code]) => code === 'AEW'))
})

test('OAU ist als Auftragsbestand gekennzeichnet', () => {
  const oau = alleKennzahlen().find((k) => k.code === 'OAU')
  assert.ok(oau)
  assert.match(oau.name, /Auftragsbestand/)
})

test('AEB = AE − STORAE (abgeleitet, konsistent)', () => {
  const k = alleKennzahlen()
  const ae = k.find((x) => x.code === 'AE').wert
  const stor = k.find((x) => x.code === 'STORAE').wert
  const aeb = k.find((x) => x.code === 'AEB').wert
  assert.equal(aeb, ae - stor)
})

test('Storno % = STORAE/AE, Angebotsverlust % = VANGE/ANGE', () => {
  const k = alleKennzahlen()
  const ae = k.find((x) => x.code === 'AE').wert
  const stor = k.find((x) => x.code === 'STORAE').wert
  const storPct = k.find((x) => x.code === 'STORNO%').wert
  assert.equal(storPct, Math.round(stor / ae * 100 * 10) / 10)
})

test('Jede KPI hat einen bekannten Wertetyp (Σ/◊/%/Ø)', () => {
  for (const k of alleKennzahlen()) assert.ok(ART_SYMBOL[k.art], `unbekannter art: ${k.art}`)
})
