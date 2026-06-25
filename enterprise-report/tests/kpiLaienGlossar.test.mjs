import './_setup.mjs'
import test from 'node:test'
import assert from 'node:assert/strict'
import { KPI, berechneAlle } from '../src/core/kpiRegistry.js'
import { LAIEN, glossar } from '../src/core/kpiLaienGlossar.js'
import { MOCK } from '../src/data/mock.js'

test('Jede KPI hat eine laienverständliche Definition + Beispiel', () => {
  const fehlend = []
  for (const id of Object.keys(KPI)) {
    const g = LAIEN[id]
    if (!g || !g.definition || !g.beispiel) fehlend.push(id)
  }
  assert.deepEqual(fehlend, [], `Ohne Laien-Glossar: ${fehlend.join(', ')}`)
})

test('Laien-Glossar enthält keine verwaisten Einträge (nur echte KPIs)', () => {
  const verwaist = Object.keys(LAIEN).filter((id) => !KPI[id])
  assert.deepEqual(verwaist, [], `Verwaiste Einträge: ${verwaist.join(', ')}`)
})

test('Neue rechenbare KPIs sind ohne Duplikat angelegt und rechnen korrekt', () => {
  const w = berechneAlle(MOCK.roheWerte['2025'])
  assert.equal(w.fremdkapital, w.bilanzsumme - w.eigenkapital)
  assert.ok(Math.abs(w.fremdkapitalquote - (w.fremdkapital / w.bilanzsumme) * 100) < 0.01)
  assert.ok(Math.abs(w.verschuldungsgrad - (w.fremdkapital / w.eigenkapital) * 100) < 0.01)
  assert.ok(Math.abs(w.kapitalumschlag - w.nettoumsatz / w.bilanzsumme) < 0.01)
  assert.ok(Math.abs(w.umsatzrendite - (w.ebit / w.nettoumsatz) * 100) < 0.01)
  assert.ok(Math.abs(w.ebitdaMarge - (w.ebitda / w.nettoumsatz) * 100) < 0.01)
  assert.ok(Math.abs(w.nopat - w.ebit * 0.7) < 0.01)
  assert.ok(Math.abs(w.investitionsquote - (w.investitionsvolumen / w.nettoumsatz) * 100) < 0.01)
  assert.ok(Math.abs(w.gmroi - (w.nettoumsatz - w.wareneinsatz) / w.lagerbestand) < 0.01)
})

test('Keine doppelten KPI-Namen', () => {
  const namen = Object.values(KPI).map((k) => k.name.toLowerCase())
  const dupes = namen.filter((n, i) => namen.indexOf(n) !== i)
  assert.deepEqual([...new Set(dupes)], [], `Doppelte Namen: ${[...new Set(dupes)].join(', ')}`)
})

test('glossar()-Helfer robust', () => {
  assert.ok(glossar('nettoumsatz').definition)
  assert.equal(glossar('gibtsnicht'), null)
})
