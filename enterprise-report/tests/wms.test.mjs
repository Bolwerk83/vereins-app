import './_setup.mjs'
import test from 'node:test'
import assert from 'node:assert/strict'
import { reset, einlagern, picken, umlagern, freieKapazitaet, bestandJeArtikel, pickVorschlag, platzBelegung, kennzahlen, bewegungen, PLAETZE } from '../src/core/wms.js'

test('Seed: Plätze und Bestand vorhanden', () => {
  reset()
  assert.equal(PLAETZE.length, 27)
  assert.ok(bestandJeArtikel().some((a) => a.menge > 0))
})

test('Einlagern erhöht Bestand und Belegung + Bewegung', () => {
  reset()
  const vorher = freieKapazitaet('A-02-2')
  const r = einlagern('AKKU-625', 10, 'A-02-2', 'WE-1', 'tester')
  assert.equal(r.ok, true)
  assert.equal(freieKapazitaet('A-02-2'), vorher - 10)
  assert.equal(bewegungen()[0].typ, 'einlagerung')
})

test('Kapazitätsgrenze wird beachtet', () => {
  reset()
  const r = einlagern('AKKU-625', 9999, 'A-02-2')
  assert.equal(r.ok, false)
})

test('Picken reduziert Bestand; zu viel schlägt fehl', () => {
  reset()
  const ok = picken('AKKU-625', 10, 'A-01-1')
  assert.equal(ok.ok, true)
  const fail = picken('AKKU-625', 99999, 'A-01-1')
  assert.equal(fail.ok, false)
})

test('Pick-Vorschlag bündelt über mehrere Plätze', () => {
  reset()
  // EBIKE-500 liegt auf B-01-1 (22) und B-01-2 (30) = 52
  const v = pickVorschlag('EBIKE-500', 40)
  assert.equal(v.machbar, true)
  assert.equal(v.picks.reduce((n, p) => n + p.menge, 0), 40)
  const z = pickVorschlag('EBIKE-500', 999)
  assert.equal(z.machbar, false)
})

test('Umlagern verschiebt Menge zwischen Plätzen', () => {
  reset()
  const r = umlagern('ZUB-HELM', 20, 'A-01-2', 'A-02-3', 'tester')
  assert.equal(r.ok, true)
  const helm = bestandJeArtikel().find((a) => a.sku === 'ZUB-HELM')
  const aufZiel = helm.plaetze.find((p) => p.platz === 'A-02-3')
  assert.equal(aufZiel.menge, 20)
})

test('Kennzahlen plausibel', () => {
  reset()
  const k = kennzahlen()
  assert.equal(k.plaetzeGesamt, 27)
  assert.ok(k.belegte > 0 && k.belegte <= 27)
  assert.ok(k.auslastung >= 0 && k.auslastung <= 100)
})
