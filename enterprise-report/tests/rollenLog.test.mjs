import './_setup.mjs'
import test from 'node:test'
import assert from 'node:assert/strict'
import { protokolliere, ladeLog, leereLog, anzahlLog } from '../src/core/rollenLog.js'

test('Eintrag schreiben (neueste zuerst)', () => {
  leereLog()
  protokolliere({ aktion: 'bereich.add', ziel: 'Gruppe A', detail: 'RIS hinzugefügt', akteur: 'admin' })
  protokolliere({ aktion: 'mitglied.add', ziel: 'Gruppe A', detail: 'anna', akteur: 'admin' })
  const log = ladeLog()
  assert.equal(log.length, 2)
  assert.equal(log[0].aktion, 'mitglied.add') // neuester zuerst
  assert.equal(log[1].detail, 'RIS hinzugefügt')
  assert.ok(log[0].zeit)
})

test('Aktion ohne Kennung wird ignoriert', () => {
  leereLog()
  protokolliere({ detail: 'ohne aktion' })
  assert.equal(anzahlLog(), 0)
})

test('Log lässt sich leeren', () => {
  protokolliere({ aktion: 'x', akteur: 'admin' })
  leereLog()
  assert.equal(anzahlLog(), 0)
})

test('Akteur-Default ist System', () => {
  leereLog()
  protokolliere({ aktion: 'test' })
  assert.equal(ladeLog()[0].akteur, 'System')
})
