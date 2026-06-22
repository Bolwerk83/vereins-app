import './_setup.mjs'
import test from 'node:test'
import assert from 'node:assert/strict'
import { setzeZurueck, ladeGruppen, mitgliedHinzu, gruppenMitMitglied, kopiereRechte } from '../src/core/gruppen.js'

function seed() {
  const list = setzeZurueck()
  // Bezugsperson in zwei Gruppen aufnehmen.
  const a = list[0].id, b = list[1].id
  mitgliedHinzu(a, 'max.muster')
  mitgliedHinzu(b, 'max.muster')
  return ladeGruppen()
}

test('gruppenMitMitglied findet die Gruppen der Bezugsperson', () => {
  seed()
  const g = gruppenMitMitglied('max.muster')
  assert.equal(g.length, 2)
})

test('kopiereRechte nimmt Ziel-Nutzer in dieselben Gruppen auf', () => {
  seed()
  const res = kopiereRechte('max.muster', 'neu.user')
  assert.equal(res.quelleGefunden, true)
  assert.equal(res.gruppen.length, 2)
  assert.equal(gruppenMitMitglied('neu.user').length, 2)
})

test('Unbekannte Bezugsperson → nichts kopiert', () => {
  seed()
  const res = kopiereRechte('gibtsnicht', 'neu.user')
  assert.equal(res.quelleGefunden, false)
  assert.equal(res.gruppen.length, 0)
})

test('Bereits Mitglied wird nicht doppelt aufgenommen', () => {
  seed()
  mitgliedHinzu(ladeGruppen()[0].id, 'neu.user')
  const res = kopiereRechte('max.muster', 'neu.user')
  // nur die zweite Gruppe ist neu
  assert.equal(res.gruppen.length, 1)
})
