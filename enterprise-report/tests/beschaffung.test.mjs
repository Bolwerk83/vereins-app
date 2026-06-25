import './_setup.mjs'
import test from 'node:test'
import assert from 'node:assert/strict'
import { rueckwaerts, stuecklisteTerminierung, diffTage, addTage, anfrageVorlage } from '../src/core/beschaffung.js'

test('Rückwärts: spätester Bestelltermin liegt vor dem Bedarf', () => {
  const t = rueckwaerts('ebike-city', '2027-04-01')
  assert.ok(diffTage('2027-04-01', t.spaetester) > 0)
  assert.ok(diffTage(t.spaetester, t.optimal) >= 0) // spätester ist NACH dem optimalen
  assert.ok(t.lieferzeit.n > 0)
})

test('Worst-Case-Lieferzeit (max) enthält Lieferverzug des Lieferanten', () => {
  const t = rueckwaerts('akku', '2027-04-01') // Lieferant parts: Verzug 21
  assert.ok(t.lieferzeit.max >= 130 + 21)
})

test('Fehlende Werte werden gemeldet (Lastenrad ohne Lieferzeit)', () => {
  const t = rueckwaerts('lastenrad', '2027-04-01')
  assert.ok(t.fehlendeWerte.includes('lieferzeitMin') || t.fehlendeWerte.includes('lieferzeitMax'))
})

test('Stückliste: kritischer Pfad = frühester Muss-Bestelltermin', () => {
  const b = stuecklisteTerminierung('ebike-city', '2027-04-01')
  assert.ok(b.positionen.length >= 5)
  // kritisch ist die erste (sortiert nach spätester aufsteigend)
  for (const p of b.positionen) assert.ok(b.kritisch.term.spaetester <= p.term.spaetester)
  // Montagestart = spätester des kritischen Teils
  assert.equal(b.montagestart, b.kritisch.term.spaetester)
})

test('Komponenten-Bedarf liegt um die Montagezeit vor dem Bedarf', () => {
  const b = stuecklisteTerminierung('ebike-city', '2027-04-01')
  assert.equal(b.komponentenBedarf, addTage('2027-04-01', -b.montage))
})

test('Anfragevorlage enthält Artikel, Bedarf und spätesten Termin', () => {
  const t = rueckwaerts('ebike-city', '2027-04-01')
  const v = anfrageVorlage(t, 50)
  assert.ok(v.includes('E-Bike City') && v.includes('50'))
  assert.ok(/sp(ä|ae)testens/.test(v))
})
