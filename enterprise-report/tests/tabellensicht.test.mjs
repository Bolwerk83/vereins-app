import './_setup.mjs'
import test from 'node:test'
import assert from 'node:assert/strict'
import { tabellenSicht, distinktWerte } from '../src/core/datensaetze.js'

const ds = {
  titel: 'Test', spalten: ['Name', 'Betrag', 'Status'], filterSpalten: [2],
  zeilen: [
    ['Alpha', '1.200', 'offen'],
    ['Beta', '300', 'bezahlt'],
    ['Gamma', '2.500', 'offen'],
    ['Delta', '900', 'bezahlt']
  ]
}

test('Top-N begrenzt, _gesamt bleibt erhalten', () => {
  const r = tabellenSicht(ds, { top: 2 })
  assert.equal(r.zeilen.length, 2)
  assert.equal(r._gesamt, 4)
})

test('Schnellsuche filtert über alle Spalten', () => {
  const r = tabellenSicht(ds, { suche: 'bezahlt' })
  assert.equal(r.zeilen.length, 2)
})

test('Spaltenfilter (feld) grenzt exakt ein', () => {
  const r = tabellenSicht(ds, { feld: { 2: 'offen' } })
  assert.equal(r.zeilen.length, 2)
  assert.ok(r.zeilen.every((z) => z[2] === 'offen'))
})

test('Sortierung erkennt deutsche Zahlen', () => {
  const asc = tabellenSicht(ds, { sortIdx: 1, sortDir: 'asc' })
  assert.deepEqual(asc.zeilen.map((z) => z[0]), ['Beta', 'Delta', 'Alpha', 'Gamma'])
  const desc = tabellenSicht(ds, { sortIdx: 1, sortDir: 'desc' })
  assert.equal(desc.zeilen[0][0], 'Gamma')
})

test('distinktWerte liefert eindeutige Spaltenwerte', () => {
  assert.deepEqual(distinktWerte(ds, 2).sort(), ['bezahlt', 'offen'])
})
