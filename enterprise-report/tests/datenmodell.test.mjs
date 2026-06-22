import './_setup.mjs'
import test from 'node:test'
import assert from 'node:assert/strict'
import {
  REPORT_FELDER, REPORT_IDS, QUELLEN, ladeMapping, mappingVon, setzeMapping, setzeZurueck, validierung, bereiteReports
} from '../src/core/datenmodell.js'

test('Seed: Quartalsbericht ist grün, Finanzcockpit nicht', () => {
  setzeZurueck()
  assert.equal(validierung('quartalsbericht').gruen, true)
  assert.equal(validierung('finanzcockpit').gruen, false)
  assert.ok(bereiteReports().includes('quartalsbericht'))
})

test('Validierung zählt Pflicht-/Optionalfelder und Fortschritt', () => {
  setzeZurueck()
  const v = validierung('versand')
  assert.equal(v.gruen, false)
  assert.ok(v.pflichtGesamt === 3)
  assert.ok(v.fehlend.length >= 1)
  assert.ok(v.fortschritt > 0 && v.fortschritt < 100)
})

test('Mapping setzen/entfernen macht Bericht grün/rot', () => {
  setzeZurueck()
  // Versand fehlende Pflicht: versandkosten
  setzeMapping('versand', 'versandkosten', 'FactVersand.Versandkosten')
  assert.equal(validierung('versand').gruen, true)
  assert.equal(mappingVon('versand', 'versandkosten'), 'FactVersand.Versandkosten')
  // wieder entfernen → rot
  setzeMapping('versand', 'versandkosten', null)
  assert.equal(validierung('versand').gruen, false)
})

test('Optionale Felder sind für „grün" nicht erforderlich', () => {
  setzeZurueck()
  // Quartalsbericht grün, obwohl 'kanal' (optional) nicht gemappt ist
  assert.equal(mappingVon('quartalsbericht', 'kanal'), null)
  assert.equal(validierung('quartalsbericht').gruen, true)
})

test('Quelltabellen vollständig (Dim & Fact, Spalten vorhanden)', () => {
  assert.ok(QUELLEN.some((q) => q.typ === 'dim') && QUELLEN.some((q) => q.typ === 'fact'))
  for (const q of QUELLEN) assert.ok(q.spalten.length >= 3)
  for (const id of REPORT_IDS) assert.ok(REPORT_FELDER[id].felder.some((f) => f.pflicht))
})
