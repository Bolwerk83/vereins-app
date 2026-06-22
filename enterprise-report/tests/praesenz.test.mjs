import './_setup.mjs'
import test from 'node:test'
import assert from 'node:assert/strict'
import { heartbeat, aktiveNutzer, aktiveListe, aktiveProTag, aktiveZeitraum, reset, FENSTER_MIN } from '../src/core/praesenz.js'
import { nutzerId, nutzerLabel } from '../src/core/identitaet.js'

test('Heartbeat macht Nutzer aktiv (innerhalb Zeitfenster)', () => {
  reset()
  heartbeat('user:anna'); heartbeat('user:bob')
  assert.equal(aktiveNutzer(), 2)
  assert.equal(aktiveListe()[0].minutenHer <= 1, true)
})

test('Gleicher Nutzer mehrfach = einmal aktiv', () => {
  reset()
  heartbeat('user:anna'); heartbeat('user:anna')
  assert.equal(aktiveNutzer(), 1)
})

test('Außerhalb des Zeitfensters nicht mehr aktiv', () => {
  reset()
  // Lebenszeichen vor 2 Stunden manuell setzen.
  const alt = new Date(Date.now() - 120 * 60000).toISOString()
  localStorage.setItem('er_praesenz', JSON.stringify({ 'user:alt': alt }))
  assert.equal(aktiveNutzer(60), 0)
  assert.equal(aktiveNutzer(180), 1) // mit größerem Fenster wieder aktiv
})

test('Eindeutige aktive Nutzer je Tag und Zeitraum', () => {
  reset()
  heartbeat('user:anna'); heartbeat('user:bob'); heartbeat('user:anna')
  const heute = aktiveProTag(14).at(-1)
  assert.equal(heute.anzahl, 2)
  assert.equal(aktiveZeitraum().heute, 2)
})

test('nutzerId und Label', () => {
  assert.equal(nutzerId('anna'), 'user:anna')
  assert.equal(nutzerLabel('user:anna'), 'anna')
  assert.match(nutzerLabel('anon_x1y2'), /^Gast/)
})

test('FENSTER_MIN Standard ist 60', () => assert.equal(FENSTER_MIN, 60))
