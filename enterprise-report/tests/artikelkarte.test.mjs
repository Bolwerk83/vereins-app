import './_setup.mjs'
import test from 'node:test'
import assert from 'node:assert/strict'
import { KATALOG, katalog, artikelStamm, artikelKarte } from '../src/core/artikelkarte.js'

test('Katalog liefert alle Artikel mit Pflichtfeldern', () => {
  const ks = katalog()
  assert.equal(ks.length, KATALOG.length)
  for (const a of ks) { assert.ok(a.nr && a.name && a.gruppe && a.lebenszyklus) }
})

test('artikelKarte liefert null bei unbekannter Nr', () => {
  assert.equal(artikelKarte('99999'), null)
})

test('Absatz-Monatsreihe ist summenerhaltend (== Jahresmenge)', () => {
  for (const a of KATALOG) {
    const k = artikelKarte(a.nr)
    const summe = k.absatz.reduce((s, m) => s + m.menge, 0)
    assert.equal(summe, a.kennzahlen.menge, `Absatzsumme ${a.nr}`)
  }
})

test('Umsatz-Monatsreihe ist summenerhaltend', () => {
  const k = artikelKarte('10042')
  const summe = k.absatz.reduce((s, m) => s + m.umsatz, 0)
  assert.equal(summe, 3348000)
})

test('Deterministisch: zwei Aufrufe liefern identische Reihen', () => {
  const a = artikelKarte('10088'), b = artikelKarte('10088')
  assert.deepEqual(a.absatz, b.absatz)
  assert.deepEqual(a.preisentwicklung, b.preisentwicklung)
})

test('KPIs konsistent: DB-absolut = Umsatz·DB%, Gutmenge ≤ Menge', () => {
  const k = artikelKarte('10042')
  assert.equal(k.kpis.dbAbsolut, Math.round(k.kpis.umsatz * k.kpis.dbProzent / 100))
  assert.ok(k.produktion.gutmenge <= k.produktion.menge)
})

test('Geschäftsarten summieren auf 100 %', () => {
  for (const a of KATALOG) {
    const g = artikelKarte(a.nr).geschaeftsarten
    assert.equal(g.sponsoring + g.leasing + g.normal, 100)
  }
})

test('Verkaufsorte: Anteile summieren ~100 %, Umsatz verteilt', () => {
  const k = artikelKarte('20155')
  const anteil = k.verkaufsorte.reduce((s, o) => s + o.anteil, 0)
  assert.equal(anteil, 100)
  assert.ok(k.verkaufsorte.every((o) => o.umsatz > 0))
})

test('Folgeartikel werden aufgelöst (Nachfolger/Ersatz)', () => {
  const k = artikelKarte('20155')
  assert.equal(k.folgeartikel.nachfolger?.nr, '20180')
  const e = artikelKarte('10042')
  assert.equal(e.folgeartikel.ersatz?.nr, '10088')
})

test('Journey ist chronologisch sortiert und nicht leer', () => {
  const k = artikelKarte('20155')
  assert.ok(k.journey.length >= 2)
  for (let i = 1; i < k.journey.length; i++) assert.ok(k.journey[i - 1].datum <= k.journey[i].datum)
})

test('Bewertungs-Sterne summieren zur Bewertungsanzahl', () => {
  for (const a of KATALOG) {
    const b = artikelKarte(a.nr).bewertungen
    assert.equal(b.sterne.reduce((s, x) => s + x, 0), b.anzahl)
  }
})
