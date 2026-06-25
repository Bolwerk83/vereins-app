import './_setup.mjs'
import test from 'node:test'
import assert from 'node:assert/strict'
import { protokolliere, leereLog, statistik, topFragen, quoteJeRolle, topKpis, wissensluecken, markanteWoerter } from '../src/core/assistentLog.js'

function reset() { leereLog() }

test('protokolliere zählt Treffer vs. offene Lücken', () => {
  reset()
  protokolliere({ frage: 'Wie hoch ist der Umsatz?', intent: 'wert', kpis: ['nettoumsatz'], rolle: 'controller' })
  protokolliere({ frage: 'Was ist gerade rot?', intent: 'listeRot', kpis: [], rolle: 'controller' })
  protokolliere({ frage: 'Wie ist die Mitarbeiterstimmung im Lager?', intent: 'unbekannt', kpis: [], rolle: 'bl_log' })
  const s = statistik()
  assert.equal(s.fachfragen, 3)
  assert.equal(s.treffer, 2)
  assert.equal(s.offen, 1)
  assert.ok(Math.abs(s.trefferquote - 2 / 3) < 1e-9)
})

test('Meta-Intents (Begrüßung/Hilfe) zählen nicht in die Quote', () => {
  reset()
  protokolliere({ frage: 'Hallo', intent: 'begruessung' })
  protokolliere({ frage: 'Was kannst du?', intent: 'hilfe' })
  protokolliere({ frage: 'Wie hoch ist das EBIT?', intent: 'wert', kpis: ['ebit'] })
  const s = statistik()
  assert.equal(s.gesamt, 3)
  assert.equal(s.fachfragen, 1)
  assert.equal(s.trefferquote, 1)
})

test('topFragen clustert nach normalisiertem Wortlaut', () => {
  reset()
  protokolliere({ frage: 'Wie hoch ist der Umsatz?', intent: 'wert', kpis: ['nettoumsatz'] })
  protokolliere({ frage: 'wie hoch ist der umsatz', intent: 'wert', kpis: ['nettoumsatz'] })
  protokolliere({ frage: 'Was ist das EBIT?', intent: 'definition', kpis: ['ebit'] })
  const top = topFragen(5)
  assert.equal(top[0].anzahl, 2) // beide Umsatz-Fragen zusammengefasst
  assert.equal(top[0].frage, 'wie hoch ist der umsatz')
})

test('quoteJeRolle trennt nach Rolle', () => {
  reset()
  protokolliere({ frage: 'Umsatz?', intent: 'wert', kpis: ['nettoumsatz'], rolle: 'vertrieb' })
  protokolliere({ frage: 'Footfall?', intent: 'unbekannt', rolle: 'vertrieb' })
  protokolliere({ frage: 'EBIT?', intent: 'wert', kpis: ['ebit'], rolle: 'gf' })
  const r = quoteJeRolle()
  const vertrieb = r.find((x) => x.rolle === 'vertrieb')
  const gf = r.find((x) => x.rolle === 'gf')
  assert.equal(vertrieb.quote, 0.5)
  assert.equal(gf.quote, 1)
})

test('topKpis zählt die getroffenen Kennzahlen', () => {
  reset()
  protokolliere({ frage: 'Umsatz?', intent: 'wert', kpis: ['nettoumsatz'] })
  protokolliere({ frage: 'Umsatz Trend?', intent: 'trend', kpis: ['nettoumsatz'] })
  protokolliere({ frage: 'EBIT?', intent: 'wert', kpis: ['ebit'] })
  const k = topKpis(5)
  assert.equal(k[0].id, 'nettoumsatz')
  assert.equal(k[0].anzahl, 2)
})

test('wissensluecken liefert offene Fragen mit Synonym-Vorschlag', () => {
  reset()
  // „Spanne" ist kein Synonym, sollte aber via KPI-Namen-Token db-/Marge nahe kommen
  protokolliere({ frage: 'Wie hoch ist die Handelsspanne pro Rad?', intent: 'unbekannt' })
  protokolliere({ frage: 'Wie hoch ist die Handelsspanne pro Rad?', intent: 'unbekannt' })
  const l = wissensluecken(5)
  assert.equal(l[0].anzahl, 2)
  assert.ok(l[0].woerter.includes('handelsspanne'))
  assert.ok('vorschlagKpiId' in l[0]) // Vorschlag-Feld vorhanden (kann null sein)
})

test('markanteWoerter filtert Stoppwörter und kurze Wörter', () => {
  const w = markanteWoerter('Wie hoch ist der Lagerumschlag bei uns?')
  assert.ok(w.includes('lagerumschlag'))
  assert.ok(!w.includes('wie') && !w.includes('ist') && !w.includes('der'))
})

test('leereLog setzt die Statistik zurück', () => {
  protokolliere({ frage: 'Test?', intent: 'wert', kpis: ['ebit'] })
  leereLog()
  assert.equal(statistik().gesamt, 0)
})
