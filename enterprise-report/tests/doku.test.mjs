import './_setup.mjs'
import test from 'node:test'
import assert from 'node:assert/strict'
import { DOKU, KATEGORIEN, sucheDoku, dokuNachKategorie } from '../src/core/doku.js'

test('Jeder Doku-Artikel hat Pflichtfelder', () => {
  for (const d of DOKU) {
    assert.ok(d.id && d.titel && d.kurz)
    assert.ok(Array.isArray(d.punkte) && d.punkte.length >= 3)
    assert.ok(KATEGORIEN.some((k) => k.id === d.kat), `Kategorie unbekannt: ${d.kat}`)
  }
})

test('Suche findet Artikel über Stichwort', () => {
  const tr = sucheDoku('ROAS')
  assert.ok(tr.some((d) => d.id === 'marketing'))
})

test('Leere Suche liefert alle Artikel', () => {
  assert.equal(sucheDoku('').length, DOKU.length)
})

test('dokuNachKategorie filtert', () => {
  const k = dokuNachKategorie('kostenrechnung')
  assert.ok(k.length >= 3)
  assert.ok(k.every((d) => d.kat === 'kostenrechnung'))
})
