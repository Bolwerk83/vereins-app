import './_setup.mjs'
import test from 'node:test'
import assert from 'node:assert/strict'
import { auswertung, PROJEKTE, REIFEGRADE, reifegradInfo } from '../src/core/technologie.js'

test('Restbudget = Budget − Ausgegeben', () => {
  const a = auswertung([{ id: 'x', name: 'X', reifegrad: 'pilot', budget: 3, ausgegeben: 2, ttm: 5, erfolg: 50, marktpotenzial: 10 }])
  assert.equal(a.rows[0].restbudget, 1)
})

test('Erwarteter Wert = Marktpotenzial × Erfolg%', () => {
  const a = auswertung([{ id: 'x', name: 'X', reifegrad: 'markt', budget: 1, ausgegeben: 0, ttm: 1, erfolg: 50, marktpotenzial: 10 }])
  assert.equal(a.rows[0].erwarteterWert, 5)
})

test('Pipeline-Wert summiert erwartete Werte', () => {
  const a = auswertung(PROJEKTE)
  const erwartet = a.rows.reduce((n, p) => n + p.erwarteterWert, 0)
  assert.equal(a.pipelineWert, Math.round(erwartet * 10) / 10)
})

test('Verteilung deckt alle Reifegrade ab', () => {
  const a = auswertung(PROJEKTE)
  assert.equal(a.verteilung.length, REIFEGRADE.length)
  assert.equal(a.verteilung.reduce((n, v) => n + v.anzahl, 0), PROJEKTE.length)
})

test('Sortierung: höchste Stufe zuerst', () => {
  const a = auswertung(PROJEKTE)
  for (let i = 1; i < a.rows.length; i++) assert.ok(a.rows[i - 1].stufe >= a.rows[i].stufe)
})

test('reifegradInfo fällt auf Idee zurück', () => {
  assert.equal(reifegradInfo('gibtsnicht').id, 'idee')
})
