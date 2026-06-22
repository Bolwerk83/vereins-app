import './_setup.mjs'
import test from 'node:test'
import assert from 'node:assert/strict'
import { phaseProdukt, phaseKunde, produkte, kinderProdukt, kunden, produktPhaseVerteilung } from '../src/core/lebenszyklus.js'

test('Produktphase aus Wachstum, Alter und Margentrend', () => {
  assert.equal(phaseProdukt({ alter: 1, wachstum: 40 }), 'einfuehrung')
  assert.equal(phaseProdukt({ alter: 6, wachstum: 9, dbTrend: 0.8 }), 'wachstum')
  assert.equal(phaseProdukt({ alter: 8, wachstum: 1, dbTrend: 0.3 }), 'reife')
  // Margenverfall zieht trotz leicht positivem Wachstum in den Rückgang:
  assert.equal(phaseProdukt({ alter: 12, wachstum: -2, dbTrend: -1.8 }), 'rueckgang')
})

test('Kundenphase aus Beziehungsalter, Wachstum, letzter Bestellung', () => {
  assert.equal(phaseKunde({ alterMonate: 4, wachstum: 22, letzteBestellungTage: 12 }), 'akquise')
  assert.equal(phaseKunde({ alterMonate: 30, wachstum: 15, letzteBestellungTage: 20 }), 'entwicklung')
  assert.equal(phaseKunde({ alterMonate: 84, wachstum: 2, letzteBestellungTage: 25 }), 'bestand')
  assert.equal(phaseKunde({ alterMonate: 90, wachstum: -3, letzteBestellungTage: 210 }), 'gefaehrdet')
  assert.equal(phaseKunde({ alterMonate: 52, wachstum: -40, letzteBestellungTage: 420 }), 'verloren')
})

test('Produkt-Drilldown und Phasenanteile', () => {
  assert.ok(produkte('produkt').every((o) => o.phase))
  assert.ok(kinderProdukt('ebike').length >= 2)
  const v = produktPhaseVerteilung('produkt')
  assert.ok(Math.abs(v.reduce((n, x) => n + x.anteil, 0) - 100) <= 1.5)
})

test('Kunden tragen eine Beziehungsphase', () => {
  assert.ok(kunden().every((k) => k.phase))
})
