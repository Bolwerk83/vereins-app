import './_setup.mjs'
import test from 'node:test'
import assert from 'node:assert/strict'
import { anfrageStellen, ladeAnfragen, anfrageOffen, loescheAnfrage, anzahlAnfragen } from '../src/core/zugriff.js'

test('Anfrage stellen und finden', () => {
  localStorage.removeItem('er_zugriffsanfragen')
  anfrageStellen({ view: 'forderungen', bereich: 'RIS', uid: 'user:anna', name: 'anna' })
  assert.equal(anzahlAnfragen(), 1)
  assert.equal(anfrageOffen('forderungen', 'user:anna'), true)
  assert.equal(anfrageOffen('forderungen', 'user:bob'), false)
})

test('Doppelte Anfrage wird nicht erneut gespeichert', () => {
  localStorage.removeItem('er_zugriffsanfragen')
  anfrageStellen({ view: 'klr', uid: 'user:anna' })
  anfrageStellen({ view: 'klr', uid: 'user:anna' })
  assert.equal(anzahlAnfragen(), 1)
})

test('Verschiedene Nutzer = getrennte Anfragen', () => {
  localStorage.removeItem('er_zugriffsanfragen')
  anfrageStellen({ view: 'klr', uid: 'user:anna' })
  anfrageStellen({ view: 'klr', uid: 'user:bob' })
  assert.equal(anzahlAnfragen(), 2)
})

test('Anfrage löschen (z. B. nach Freigabe)', () => {
  localStorage.removeItem('er_zugriffsanfragen')
  anfrageStellen({ view: 'klr', uid: 'user:anna' })
  loescheAnfrage('klr', 'user:anna')
  assert.equal(anfrageOffen('klr', 'user:anna'), false)
})

test('leere View wird ignoriert', () => {
  localStorage.removeItem('er_zugriffsanfragen')
  anfrageStellen({ view: '', uid: 'user:anna' })
  assert.equal(anzahlAnfragen(), 0)
})
