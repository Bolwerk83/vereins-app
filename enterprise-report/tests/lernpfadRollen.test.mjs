import './_setup.mjs'
import test from 'node:test'
import assert from 'node:assert/strict'
import { LERN_ROLLEN, fokusLektionen, imFokus, rolleInfo, ladeLernRolle, setzeLernRolle } from '../src/core/lernpfadRollen.js'
import { LEKTIONEN } from '../src/core/lernpfad.js'

test('Jede Rolle referenziert nur existierende Lektionen', () => {
  const ids = new Set(LEKTIONEN.map((l) => l.id))
  for (const r of LERN_ROLLEN) for (const f of r.fokus) assert.ok(ids.has(f), `${r.id}: ${f}`)
})

test('Fokus-Lektionen behalten die Lernpfad-Reihenfolge', () => {
  const fokus = fokusLektionen('produktion')
  const positionen = fokus.map((id) => LEKTIONEN.findIndex((l) => l.id === id))
  for (let i = 1; i < positionen.length; i++) assert.ok(positionen[i - 1] < positionen[i])
})

test('„alle"/Controlling enthalten den kompletten Pfad', () => {
  assert.equal(fokusLektionen('alle').length, LEKTIONEN.length)
  assert.equal(fokusLektionen('controlling').length, LEKTIONEN.length)
})

test('imFokus prüft Zugehörigkeit', () => {
  assert.equal(imFokus('vertrieb', 'l-deckungsbeitrag'), true)
  assert.equal(imFokus('vertrieb', 'l-bab'), false)
})

test('Lernrolle wird gespeichert', () => {
  localStorage.removeItem('er_lernrolle')
  assert.equal(ladeLernRolle(), 'alle')
  setzeLernRolle('gf')
  assert.equal(ladeLernRolle(), 'gf')
})

test('rolleInfo fällt auf „alle" zurück', () => {
  assert.equal(rolleInfo('xxx').id, 'alle')
})
