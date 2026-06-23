import './_setup.mjs'
import test from 'node:test'
import assert from 'node:assert/strict'
import { warenbereiche, gesamt, prognose, massnahmenFuer, reichweiteStatus } from '../src/core/bestandsentwicklung.js'

test('Reichweite & Status plausibel', () => {
  assert.equal(reichweiteStatus(10), 'r')   // Unterbestand
  assert.equal(reichweiteStatus(45), 'g')
  assert.equal(reichweiteStatus(90), 'a')
  assert.equal(reichweiteStatus(300), 'r')  // Überbestand
  for (const w of warenbereiche()) assert.ok(w.reichweiteTage > 0)
})

test('Bekleidung: Ladenhüter verfehlt die Frist und bekommt KI-Maßnahmen', () => {
  const w = warenbereiche().find((x) => x.id === 'bekleidung')
  assert.equal(w.prognose.typ, 'ueber')
  assert.equal(w.prognose.erreicht, false)
  assert.ok(w.prognose.mehrBedarfPct > 0)
  const ms = massnahmenFuer(w)
  assert.ok(ms.length >= 3)
  assert.ok(ms.some((m) => /Abverkauf/.test(m.titel)))
})

test('Teile: Unterbestand → Nachbestellung', () => {
  const w = warenbereiche().find((x) => x.id === 'teile')
  assert.equal(w.prognose.typ, 'unter')
  assert.ok(massnahmenFuer(w).some((m) => /Nachbestellung/.test(m.titel)))
})

test('Gesamt: Überbestand und kritische Bereiche', () => {
  const g = gesamt()
  assert.ok(g.bestand > 0 && g.ueberbestand > 0)
  assert.ok(g.kritisch >= 1)
})
