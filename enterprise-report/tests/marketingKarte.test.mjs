import './_setup.mjs'
import test from 'node:test'
import assert from 'node:assert/strict'
import { REGIONEN, kinderVon, hatKinder, pfadVon, ebeneVon, karte, METRIKEN, EBENEN } from '../src/core/marketingKarte.js'

test('Hierarchie: Welt → Europa → Deutschland → Bayern → PLZ', () => {
  assert.ok(kinderVon('welt').some((r) => r.id === 'europa'))
  assert.ok(kinderVon('europa').some((r) => r.id === 'de'))
  assert.ok(kinderVon('de').some((r) => r.id === 'by'))
  assert.ok(kinderVon('by').some((r) => r.id === 'by_80'))
  assert.ok(!hatKinder('by_80')) // PLZ ist Blatt
})

test('Pfad und Ebene korrekt', () => {
  assert.deepEqual(pfadVon('by_80').map((r) => r.id), ['welt', 'europa', 'de', 'by', 'by_80'])
  assert.equal(ebeneVon('welt'), 0)
  assert.equal(ebeneVon('by_80'), 4)
  assert.equal(EBENEN[ebeneVon('by_80')], 'PLZ-Gebiet')
})

test('karte: Metrikwerte, Intensität 0..1, nach Wert sortiert', () => {
  const k = karte('de', 'umsatz')
  assert.equal(k.length, kinderVon('de').length)
  for (let i = 1; i < k.length; i++) assert.ok(k[i - 1].wert >= k[i].wert)
  assert.ok(k.every((x) => x.intensitaet >= 0 && x.intensitaet <= 1))
  // Bayern hat den höchsten Umsatz in DE
  assert.equal(k[0].id, 'by')
})

test('karte: Umsatzanteile summieren sich ~100 %', () => {
  const k = karte('de', 'marktanteil')
  const summe = k.reduce((n, x) => n + x.umsatzAnteil, 0)
  assert.ok(Math.abs(summe - 100) < 1.5)
})

test('Metriken definiert (Umsatz, Marktanteil, DB, Online)', () => {
  assert.deepEqual(METRIKEN.map((m) => m.key), ['umsatz', 'marktanteil', 'db', 'onlineAnteil'])
})
