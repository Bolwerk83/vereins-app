import './_setup.mjs'
import test from 'node:test'
import assert from 'node:assert/strict'
import { nutzerId } from '../src/core/identitaet.js'
import { STATUS, statusVon, setzeStatus, testuserVon, testuserToggle, istSichtbar, istSichtbarFuerName } from '../src/core/berichtStatus.js'

test('Default: alle Berichte aktiv & für jeden sichtbar', () => {
  localStorage.removeItem('er_bericht_status'); localStorage.removeItem('er_bericht_testuser')
  assert.equal(statusVon('quartalsbericht'), 'aktiv')
  assert.equal(istSichtbar('quartalsbericht', { admin: false, uid: 'user:Max' }), true)
})

test('Deaktiviert: für Nutzer unsichtbar, für Admin sichtbar', () => {
  setzeStatus('versand', STATUS.DEAKTIVIERT)
  assert.equal(statusVon('versand'), 'deaktiviert')
  assert.equal(istSichtbar('versand', { admin: false, uid: 'user:Max' }), false)
  assert.equal(istSichtbar('versand', { admin: true, uid: 'user:Max' }), true)
  setzeStatus('versand', STATUS.AKTIV)
  assert.equal(statusVon('versand'), 'aktiv') // aktiv = kein Eintrag
})

test('Test: nur freigegebene Testuser (+ Admin) sehen den Bericht', () => {
  localStorage.removeItem('er_bericht_status'); localStorage.removeItem('er_bericht_testuser')
  setzeStatus('leasing', STATUS.TEST)
  assert.equal(istSichtbar('leasing', { admin: false, uid: 'user:Max' }), false)
  testuserToggle('leasing', nutzerId('Max'))
  assert.deepEqual(testuserVon('leasing'), ['user:Max'])
  assert.equal(istSichtbar('leasing', { admin: false, uid: 'user:Max' }), true)
  assert.equal(istSichtbarFuerName('leasing', { admin: false, name: 'Max' }), true)
  assert.equal(istSichtbar('leasing', { admin: false, uid: 'user:Erika' }), false)
  // wieder entziehen
  testuserToggle('leasing', nutzerId('Max'))
  assert.equal(istSichtbar('leasing', { admin: false, uid: 'user:Max' }), false)
})

test('setzeStatus(aktiv) räumt den Eintrag auf', () => {
  setzeStatus('leasing', STATUS.TEST)
  setzeStatus('leasing', STATUS.AKTIV)
  assert.ok(!('leasing' in JSON.parse(localStorage.getItem('er_bericht_status') || '{}')))
})
