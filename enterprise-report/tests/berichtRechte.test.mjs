import './_setup.mjs'
import test from 'node:test'
import assert from 'node:assert/strict'
import { rolleToggle, rolleViews, rolleSetzeOrdner, userToggle, hatFreigabe, hatFreigabeFuerName, berichtsOrdner } from '../src/core/berichtRechte.js'
import { nutzerId } from '../src/core/identitaet.js'

test('Rolle: einzelner Bericht freigeben wirkt', () => {
  rolleToggle('g-leser', 'forderungen')
  assert.ok(rolleViews('g-leser').has('forderungen'))
  assert.equal(hatFreigabe('g-leser', null, 'forderungen'), true)
  assert.equal(hatFreigabe('g-leser', null, 'anlagen'), false)
  rolleToggle('g-leser', 'forderungen') // wieder weg
  assert.equal(hatFreigabe('g-leser', null, 'forderungen'), false)
})

test('Rolle: ganzer Ordner freigeben/entziehen', () => {
  const o = berichtsOrdner()[0]
  const views = o.berichte.map((b) => b.view)
  rolleSetzeOrdner('g-leser', views, true)
  assert.ok(views.every((v) => hatFreigabe('g-leser', null, v)))
  rolleSetzeOrdner('g-leser', views, false)
  assert.ok(views.every((v) => !hatFreigabe('g-leser', null, v)))
})

test('Kollege: persönliche Freigabe wirkt unabhängig von Rolle', () => {
  const uid = nutzerId('Maria Vogel')
  userToggle(uid, 'leasing')
  assert.equal(hatFreigabe(null, uid, 'leasing'), true)
  assert.equal(hatFreigabeFuerName(null, 'Maria Vogel', 'leasing'), true)
  assert.equal(hatFreigabeFuerName(null, 'Anderer Name', 'leasing'), false)
})

test('berichtsOrdner liefert nicht-leere Ordner mit Berichten', () => {
  const o = berichtsOrdner()
  assert.ok(o.length >= 3)
  assert.ok(o.every((x) => x.name && x.berichte.length > 0))
})
