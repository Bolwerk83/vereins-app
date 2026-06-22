import './_setup.mjs'
import test from 'node:test'
import assert from 'node:assert/strict'
import { empfohleneJoins, ladeBeziehungen, beziehung, toggleBeziehung, loescheBeziehung, modellHealth, setzeZurueck, dimKey } from '../src/core/beziehungen.js'

test('Empfohlene Joins aus Spaltennamen abgeleitet', () => {
  const e = empfohleneJoins()
  assert.ok(e.some((j) => j.fact === 'FactUmsatz' && j.dim === 'DimArtikel' && j.factKey === 'ArtikelID'))
  assert.ok(e.some((j) => j.fact === 'FactKosten' && j.dim === 'DimKonto' && j.dimKey === 'KontoNr'))
  assert.equal(dimKey('DimPeriode'), 'PeriodenID')
})

test('Seed verbindet alle empfohlenen Joins → Modell ok', () => {
  setzeZurueck()
  const h = modellHealth()
  assert.equal(h.ok, true)
  assert.equal(h.aktivAnzahl, h.empfohlenAnzahl)
  assert.ok(beziehung('FactUmsatz', 'DimKunde').aktiv)
})

test('Beziehung abschalten macht Modell unvollständig, wieder an = ok', () => {
  setzeZurueck()
  toggleBeziehung('FactUmsatz', 'DimKunde') // aus
  let h = modellHealth()
  assert.equal(h.ok, false)
  assert.ok(h.facts.find((f) => f.fact === 'FactUmsatz').fehlend.includes('DimKunde'))
  toggleBeziehung('FactUmsatz', 'DimKunde') // wieder an
  assert.equal(modellHealth().ok, true)
})

test('Neue (nicht empfohlene) Beziehung lässt sich anlegen und löschen', () => {
  setzeZurueck()
  toggleBeziehung('FactVersand', 'DimArtikel') // kein gemeinsamer Schlüssel → neu
  assert.ok(beziehung('FactVersand', 'DimArtikel').aktiv)
  loescheBeziehung('FactVersand', 'DimArtikel')
  assert.equal(beziehung('FactVersand', 'DimArtikel'), null)
})
