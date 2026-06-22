import './_setup.mjs'
import test from 'node:test'
import assert from 'node:assert/strict'
import { DURCHLAUF, gesamtDurchlauf, engpass, zeitAmpel, kennzahlen, vorgangStatus } from '../src/core/auftragsLebenszyklus.js'

test('Gesamt-Durchlauf = Summe der Übergänge', () => {
  const g = gesamtDurchlauf()
  assert.equal(g.ist, DURCHLAUF.reduce((n, d) => n + d.ist, 0))
  assert.equal(g.ziel, DURCHLAUF.reduce((n, d) => n + d.ziel, 0))
})

test('Engpass = größte relative Ziel-Überschreitung (DSO)', () => {
  assert.equal(engpass().id, 'e2f')
})

test('Zeitampel: tief = gut', () => {
  assert.equal(zeitAmpel(5, 7), 'g')
  assert.equal(zeitAmpel(8, 7), 'a')
  assert.equal(zeitAmpel(20, 7), 'r')
})

test('Kennzahlen plausibel', () => {
  const k = kennzahlen()
  assert.ok(k.auftragsquote > 0 && k.auftragsquote <= 100)
  assert.equal(k.dso, 41)
  assert.ok(k.auftragsbestand > 0)
})

test('Vorgangstatus erkennt Verzögerung', () => {
  assert.equal(vorgangStatus({ phase: 'rechnung', alter: 63 }), 'verzögert')
  assert.equal(vorgangStatus({ phase: 'auftrag', alter: 1 }), 'im Plan')
})
