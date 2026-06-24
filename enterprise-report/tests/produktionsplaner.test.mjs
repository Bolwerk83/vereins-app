import './_setup.mjs'
import test from 'node:test'
import assert from 'node:assert/strict'
import { plane, empfehlung, AUFTRAEGE } from '../src/core/produktionsplaner.js'
import { diffTage } from '../src/core/beschaffung.js'

test('Plant alle Aufträge mit Start/Ende und Linie', () => {
  const p = plane('termin')
  assert.equal(p.auftraege.length, AUFTRAEGE.length)
  for (const a of p.auftraege) {
    assert.ok(a.linie && a.start && a.ende)
    assert.ok(diffTage(a.ende, a.start) >= 0)
  }
})

test('Ende = Start + Produktionstage (Kapazität)', () => {
  const p = plane('termin')
  for (const a of p.auftraege) assert.equal(diffTage(a.ende, a.start), a.prodTage)
})

test('Sortierung nach DB stellt den höchsten DB-Beitrag nach vorne', () => {
  const p = plane('db')
  for (let i = 1; i < p.auftraege.length; i++) assert.ok(p.auftraege[i - 1].dbBeitrag >= p.auftraege[i].dbBeitrag)
})

test('Termin-Gefährdung: Ende nach Liefertermin → status gefaehrdet', () => {
  const p = plane('termin')
  for (const a of p.auftraege) assert.equal(a.status === 'gefaehrdet', a.ende > a.liefertermin)
})

test('Empfehlung vergleicht beide Reihenfolgen', () => {
  const e = empfehlung()
  assert.ok(['termin', 'db'].includes(e.besser))
  assert.ok(e.termin && e.db)
})

test('Aufträge nutzen beide Linien (Parallelisierung)', () => {
  const p = plane('termin')
  const linien = new Set(p.auftraege.map((a) => a.linie))
  assert.ok(linien.size >= 2)
})
