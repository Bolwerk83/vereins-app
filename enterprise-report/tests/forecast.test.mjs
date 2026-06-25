import './_setup.mjs'
import test from 'node:test'
import assert from 'node:assert/strict'
import { forecast, forecastBruecke, forecastReihe, FORECAST_METHODEN } from '../src/core/forecast.js'

test('forecast: Bruecke summiert sich exakt auf den Forecast', () => {
  const f = forecast('gesamt', {})
  // Jahresplan + YTD-Abweichung + Restjahr-Abweichung = Forecast
  assert.ok(Math.abs((f.jahresplan + f.ytdAbw + f.restAbw) - f.forecast) < 1)
})

test('forecast: Run-Rate schreibt YTD-Schwaeche fort, Plan-treu nicht', () => {
  const rr = forecast('gesamt', { methode: 'runrate' })
  const pt = forecast('gesamt', { methode: 'plantreu' })
  // Demo liegt unter Plan -> Run-Rate prognostiziert weniger als Plan-treu
  assert.ok(rr.forecast < pt.forecast)
  // Plan-treu = YTD-Ist + Restjahr-Plan -> nur die YTD-Abweichung bleibt
  assert.ok(Math.abs(pt.abwForecast - pt.ytdAbw) < 1)
  // Erreichungsgrad konsistent zum Plan
  assert.ok(rr.erreichungPct > 0 && rr.erreichungPct < 100)
})

test('forecast: Profit-Center-Faktor skaliert proportional, Erreichungsgrad invariant', () => {
  const voll = forecast('gesamt', { faktor: 1 })
  const halb = forecast('gesamt', { faktor: 0.5 })
  assert.ok(Math.abs(halb.forecast - voll.forecast * 0.5) < 1)
  assert.equal(halb.erreichungPct, voll.erreichungPct) // Quote unabhaengig vom Faktor
})

test('forecast: Ampel rot bei deutlicher Planunterschreitung', () => {
  const f = forecast('gesamt', { methode: 'runrate' })
  assert.ok(['g', 'a', 'r'].includes(f.status))
  if (f.abwForecastPct <= -5) assert.equal(f.status, 'r')
})

test('forecastReihe: Ist bis aktueller Monat, danach Forecast', () => {
  const reihe = forecastReihe('gesamt', {})
  assert.equal(reihe.length, 12)
  const f = forecast('gesamt', {})
  // Vergangene Monate haben Ist, Zukunft hat Forecast
  assert.ok(reihe[0].ist > 0 && reihe[0].forecast == null)
  assert.ok(reihe[11].ist == null && reihe[11].forecast > 0)
})

test('forecastBruecke: vier Schritte (Basis, 2x Delta, Summe)', () => {
  const b = forecastBruecke('gesamt', {})
  assert.equal(b.schritte.length, 4)
  assert.equal(b.schritte[0].typ, 'basis')
  assert.equal(b.schritte[3].typ, 'summe')
  assert.ok(FORECAST_METHODEN.length === 2)
})
