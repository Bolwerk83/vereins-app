import './_setup.mjs'
import test from 'node:test'
import assert from 'node:assert/strict'
import { KAPITEL, LEKTIONEN, lektionenVon, markiere, istAbgeschlossen, fortschritt } from '../src/core/lernpfad.js'

test('Jede Lektion gehört zu einem bekannten Kapitel und hat Inhalt', () => {
  const kap = new Set(KAPITEL.map((k) => k.id))
  for (const l of LEKTIONEN) {
    assert.ok(kap.has(l.kapitel), l.id + ' unbekanntes Kapitel')
    assert.ok(l.intro && l.punkte.length && l.merksatz)
  }
  assert.ok(KAPITEL.every((k) => lektionenVon(k.id).length > 0))
})

test('Fortschritt zählt abgeschlossene Lektionen', () => {
  const start = fortschritt().fertig
  markiere(LEKTIONEN[0].id, true)
  assert.ok(istAbgeschlossen(LEKTIONEN[0].id))
  assert.equal(fortschritt().fertig, start + 1)
  markiere(LEKTIONEN[0].id, false)
  assert.ok(!istAbgeschlossen(LEKTIONEN[0].id))
})
