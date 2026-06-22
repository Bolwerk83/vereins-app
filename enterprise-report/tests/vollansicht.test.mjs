import './_setup.mjs'
import test from 'node:test'
import assert from 'node:assert/strict'
import { ladeBemerkungen, addBemerkung, toggleErledigt, loescheBemerkung, aufgaben, aufgabenZaehler } from '../src/core/bemerkungen.js'
import { erkenntnisse } from '../src/core/erkenntnisse.js'
import { preisvergleich } from '../src/core/preisvergleich.js'

test('Bemerkung anlegen, zuweisen, als Aufgabe finden, erledigen', () => {
  localStorage.removeItem('er_bemerkungen')
  addBemerkung('auftrag', 'A-1', { text: 'Bitte Liefertermin prüfen', zuweisung: 'Janne Ditters' })
  const liste = ladeBemerkungen('auftrag', 'A-1')
  assert.equal(liste.length, 1)
  assert.equal(liste[0].zuweisung, 'Janne Ditters')
  // erscheint als Aufgabe der Person
  assert.equal(aufgaben('Janne Ditters').length, 1)
  assert.equal(aufgabenZaehler()['Janne Ditters'], 1)
  // erledigt -> nicht mehr offen
  toggleErledigt('auftrag', 'A-1', liste[0].nid)
  assert.equal(aufgaben('Janne Ditters').length, 0)
})

test('Bemerkung ohne Zuweisung ist keine Aufgabe; löschen entfernt sie', () => {
  localStorage.removeItem('er_bemerkungen')
  addBemerkung('artikel', 'SKU1', { text: 'nur Notiz' })
  assert.equal(aufgaben().length, 0)
  const l = ladeBemerkungen('artikel', 'SKU1')
  loescheBemerkung('artikel', 'SKU1', l[0].nid)
  assert.equal(ladeBemerkungen('artikel', 'SKU1').length, 0)
})

test('Erkenntnisse: Befunde + Heuristiken, nie leer', () => {
  const e1 = erkenntnisse('artikel', { margePct: 45, lbVerf: 5, gesp: 0, befunde: [] })
  assert.ok(e1.some((x) => x.art === 'positiv' && x.text.includes('Marge')))
  const e2 = erkenntnisse('artikel', { margePct: 5, lbVerf: -2, gesp: 3, befunde: [{ schwere: 'fehler', text: 'X' }] })
  assert.ok(e2.some((x) => x.art === 'risiko'))
  const e3 = erkenntnisse('kunde', { kreditlimit: 1000, offeneForderung: 1000, befunde: [] })
  assert.ok(e3.length >= 1)
})

test('Preisvergleich: deterministisch, eigene Position bestimmt', () => {
  const p = preisvergleich({ sku: '1453766', vk: 1499 })
  assert.equal(p.wettbewerber.length, 5)
  assert.equal(p.anzahl, 6)
  assert.ok(p.position >= 1 && p.position <= 6)
  // determinismus
  const p2 = preisvergleich({ sku: '1453766', vk: 1499 })
  assert.deepEqual(p.wettbewerber, p2.wettbewerber)
  // kein VK -> null
  assert.equal(preisvergleich({ sku: 'x', vk: 0 }), null)
})
