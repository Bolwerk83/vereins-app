import './_setup.mjs'
import test from 'node:test'
import assert from 'node:assert/strict'
import { speichere, pruefe, feldDiff, memoryStore } from '../src/core/versionierung.js'

const T = '2026-06-24T10:00:00.000Z'

test('feldDiff erkennt nur echte Änderungen', () => {
  const d = feldDiff({ a: 1, b: 2 }, { a: 1, b: 3, c: 4 })
  assert.deepEqual(d, { b: { alt: 2, neu: 3 }, c: { alt: null, neu: 4 } })
})

test('Erstes Speichern: Version 1, Audit gesetzt', () => {
  const s = memoryStore()
  const r = speichere(s, 'art-1', { patch: { lieferzeit: 60 }, autor: 'müller', jetzt: T })
  assert.equal(r.status, 'gespeichert')
  assert.equal(r.datensatz.version, 1)
  assert.equal(r.datensatz.geaendertVon, 'müller')
  assert.equal(r.datensatz.werte.lieferzeit, 60)
})

test('Folge-Speichern mit korrekter Basisversion läuft durch', () => {
  const s = memoryStore()
  speichere(s, 'art-1', { patch: { lieferzeit: 60 }, autor: 'a', jetzt: T })
  const r = speichere(s, 'art-1', { basisVersion: 1, patch: { lieferzeit: 70 }, autor: 'a', jetzt: T })
  assert.equal(r.status, 'gespeichert')
  assert.equal(r.datensatz.version, 2)
})

test('Veraltete Basisversion bei GLEICHEM Feld -> Konflikt (nicht mergebar)', () => {
  const s = memoryStore()
  speichere(s, 'art-1', { patch: { lieferzeit: 60 }, autor: 'a', jetzt: T })      // v1
  speichere(s, 'art-1', { basisVersion: 1, patch: { lieferzeit: 80 }, autor: 'müller', jetzt: T }) // v2 (fremd)
  // Kollege B kannte noch v1 und will dasselbe Feld ändern:
  const r = speichere(s, 'art-1', { basisVersion: 1, patch: { lieferzeit: 65 }, autor: 'b', jetzt: T })
  assert.equal(r.status, 'konflikt')
  assert.equal(r.konflikt.mergebar, false)
  assert.deepEqual(r.konflikt.ueberschneidung, ['lieferzeit'])
  // wer/wann/was ist sichtbar:
  assert.equal(r.konflikt.fremdeFelder.lieferzeit.autor, 'müller')
  assert.equal(r.konflikt.fremdeFelder.lieferzeit.neu, 80)
})

test('Veraltete Basis bei DISJUNKTEN Feldern -> mergebar', () => {
  const s = memoryStore()
  speichere(s, 'art-1', { patch: { lieferzeit: 60 }, autor: 'a', jetzt: T })       // v1
  speichere(s, 'art-1', { basisVersion: 1, patch: { lieferzeit: 80 }, autor: 'müller', jetzt: T }) // v2
  const r = speichere(s, 'art-1', { basisVersion: 1, patch: { ersatzartikel: 'X' }, autor: 'b', jetzt: T })
  assert.equal(r.status, 'konflikt')
  assert.equal(r.konflikt.mergebar, true)
})

test('Strategie mergen kombiniert disjunkte Felder', () => {
  const s = memoryStore()
  speichere(s, 'art-1', { patch: { lieferzeit: 60 }, autor: 'a', jetzt: T })
  speichere(s, 'art-1', { basisVersion: 1, patch: { lieferzeit: 80 }, autor: 'müller', jetzt: T })
  const r = speichere(s, 'art-1', { basisVersion: 1, patch: { ersatzartikel: 'X' }, autor: 'b', strategie: 'mergen', jetzt: T })
  assert.equal(r.status, 'gespeichert')
  assert.equal(r.datensatz.werte.lieferzeit, 80)   // fremde Änderung bleibt
  assert.equal(r.datensatz.werte.ersatzartikel, 'X') // eigene kommt dazu
  assert.equal(r.aufgeloest, 'mergen')
})

test('Strategie mergen bei Überschneidung wird verweigert', () => {
  const s = memoryStore()
  speichere(s, 'art-1', { patch: { lieferzeit: 60 }, autor: 'a', jetzt: T })
  speichere(s, 'art-1', { basisVersion: 1, patch: { lieferzeit: 80 }, autor: 'müller', jetzt: T })
  const r = speichere(s, 'art-1', { basisVersion: 1, patch: { lieferzeit: 65 }, autor: 'b', strategie: 'mergen', jetzt: T })
  assert.equal(r.status, 'konflikt') // gleiches Feld -> kein Auto-Merge
})

test('Strategie ueberschreiben erzwingt eigene Werte', () => {
  const s = memoryStore()
  speichere(s, 'art-1', { patch: { lieferzeit: 60 }, autor: 'a', jetzt: T })
  speichere(s, 'art-1', { basisVersion: 1, patch: { lieferzeit: 80 }, autor: 'müller', jetzt: T })
  const r = speichere(s, 'art-1', { basisVersion: 1, patch: { lieferzeit: 65 }, autor: 'b', strategie: 'ueberschreiben', jetzt: T })
  assert.equal(r.status, 'gespeichert')
  assert.equal(r.datensatz.werte.lieferzeit, 65)
  assert.equal(r.datensatz.version, 3)
})

test('Strategie abbrechen schreibt nichts', () => {
  const s = memoryStore()
  speichere(s, 'art-1', { patch: { lieferzeit: 60 }, autor: 'a', jetzt: T })
  speichere(s, 'art-1', { basisVersion: 1, patch: { lieferzeit: 80 }, autor: 'müller', jetzt: T })
  const r = speichere(s, 'art-1', { basisVersion: 1, patch: { lieferzeit: 65 }, autor: 'b', strategie: 'abbrechen', jetzt: T })
  assert.equal(r.status, 'abgebrochen')
  assert.equal(s.lade('art-1').werte.lieferzeit, 80) // unverändert
})

test('Unveränderter Patch wird als unveraendert erkannt', () => {
  const s = memoryStore()
  speichere(s, 'art-1', { patch: { lieferzeit: 60 }, autor: 'a', jetzt: T })
  const r = speichere(s, 'art-1', { basisVersion: 1, patch: { lieferzeit: 60 }, autor: 'b', jetzt: T })
  assert.equal(r.status, 'unveraendert')
})
