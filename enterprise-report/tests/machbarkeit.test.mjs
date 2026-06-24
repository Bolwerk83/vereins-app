import './_setup.mjs'
import test from 'node:test'
import assert from 'node:assert/strict'
import { machbarkeit, KOMPONENTEN_BESTAND, diffTage, HEUTE } from '../src/core/beschaffung.js'

test('50 Räder: Verfügbarkeit = Bestand − reserviert, Fehlmenge korrekt', () => {
  const m = machbarkeit('ebike-city', 50)
  const rahmen = m.positionen.find((p) => p.id === 'rahmen-alu')
  const lager = KOMPONENTEN_BESTAND['rahmen-alu']
  assert.equal(rahmen.verfuegbar, lager.bestand - lager.reserviert)
  assert.equal(rahmen.benoetigt, 50)
  assert.equal(rahmen.fehl, Math.max(0, 50 - rahmen.verfuegbar))
})

test('Gesamtdurchlauf = kritische Beschaffung + Produktion + Puffer', () => {
  const m = machbarkeit('ebike-city', 50, { puffer: 7 })
  assert.equal(m.gesamtTage, m.kritBeschaffungTage + m.produktionsTage + m.puffer)
  assert.equal(diffTage(m.fertigDatum, HEUTE), m.gesamtTage)
})

test('Kritischer Pfad = Komponente mit längster Beschaffungszeit', () => {
  const m = machbarkeit('ebike-city', 50)
  for (const p of m.positionen) assert.ok(m.kritBeschaffungTage >= p.beschaffungTage)
})

test('Kleine Menge ganz aus Lager → keine Beschaffung, nur Produktion+Puffer', () => {
  const m = machbarkeit('ebike-city', 1, { puffer: 5 })
  assert.equal(m.fehlteile, 0)
  assert.equal(m.kritBeschaffungTage, 0)
  assert.equal(m.gesamtTage, m.produktionsTage + 5)
})

test('Mehr Räder → mehr Produktionstage (Kapazität)', () => {
  const klein = machbarkeit('ebike-city', 10)
  const gross = machbarkeit('ebike-city', 120)
  assert.ok(gross.produktionsTage > klein.produktionsTage)
})
