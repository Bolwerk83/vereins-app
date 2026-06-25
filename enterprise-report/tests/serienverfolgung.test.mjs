import './_setup.mjs'
import test from 'node:test'
import assert from 'node:assert/strict'
import { suche, bikeVon, chargeVerbleib, alleChargen, journalFuer, CHARGEN, ORTE } from '../src/core/serienverfolgung.js'

test('Suche findet Rad über BikeID, Seriennummer, Auftrag und Kunde', () => {
  assert.equal(suche('BK-100231').length, 1)
  assert.equal(suche('RA-0041-007')[0]?.bikeId, 'BK-100231') // Rahmennummer
  assert.equal(suche('MO-0052-014')[0]?.bikeId, 'BK-100231') // Motornummer
  assert.equal(suche('SO-88245')[0]?.bikeId, 'BK-100244')    // Auftrag
  assert.ok(suche('müller').length >= 1)                      // Kunde (case-insensitive)
  assert.equal(suche('').length, 0)
})

test('Bike-360: Seriennummern vollständig je Rad', () => {
  const b = bikeVon('BK-100231')
  assert.ok(b.serien.rahmen && b.serien.gabel && b.serien.motor && b.serien.akku)
})

test('Zoll-Mengenverbleib summiert exakt auf die Eingangsmenge', () => {
  const v = chargeVerbleib('ZL-2026-0041')
  assert.equal(v.summe, v.charge.menge) // 100 Rahmen vollständig nachgewiesen
  assert.ok(v.vollstaendig)
  // jeder Ort ist eine bekannte Kategorie
  for (const o of Object.keys(v.verteilung)) assert.ok(ORTE.includes(o))
})

test('Verbleib enthält verschrottet (Transportschaden) und Kunde', () => {
  const v = chargeVerbleib('ZL-2026-0041')
  assert.ok(v.verteilung.verschrottet >= 1)
  assert.ok(v.verteilung.Kunde >= 2)
})

test('alleChargen liefert je Charge die Verteilung', () => {
  const cs = alleChargen()
  assert.equal(cs.length, CHARGEN.length)
  assert.ok(cs.every((c) => c.verteilung && typeof c.summe === 'number'))
})

test('Journal je Rad ist chronologisch', () => {
  const j = journalFuer((x) => x.bikeId === 'BK-100231')
  assert.ok(j.length >= 3)
  for (let i = 1; i < j.length; i++) assert.ok(j[i - 1].datum <= j[i].datum)
})
