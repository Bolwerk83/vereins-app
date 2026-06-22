import './_setup.mjs'
import test from 'node:test'
import assert from 'node:assert/strict'
import {
  SERIEN, SERIEN_IDS, letzterIstMonat, kennzahlen, kennzahlenMonate, quartalKennzahlen,
  headline, ampel, perioden, arbeitstage, ARBEITSTAGE, pcFaktor, kanalSplit, inlandAusland, MARKT, avgWertProBike
} from '../src/core/quartalsbericht.js'

test('Gesamt = Fahrräder + TBZ je Monat', () => {
  for (let i = 0; i < 12; i++) {
    assert.equal(SERIEN.gesamt.ist[i], SERIEN.fahrraeder.ist[i] + SERIEN.tbz.ist[i])
    assert.equal(SERIEN.gesamt.plan[i], SERIEN.fahrraeder.plan[i] + SERIEN.tbz.plan[i])
  }
})

test('YTD-Abweichung Gesamt ist negativ und Kernaussage passt', () => {
  const k = kennzahlen('gesamt')
  assert.ok(k.abw < 0)
  assert.ok(/Mio € unter Plan/.test(headline('gesamt')))
  // Fahrräder + TBZ Abweichung ≈ Gesamt
  const f = kennzahlen('fahrraeder').abw, t = kennzahlen('tbz').abw
  assert.ok(Math.abs(f + t - k.abw) < 1)
})

test('letzter Ist-Monat = April (Index 5)', () => {
  assert.equal(letzterIstMonat('gesamt'), 5)
})

test('Berichtstypen liefern Monats-, Quartals- und Jahresperioden', () => {
  assert.equal(perioden('monat').length, 12)
  assert.equal(perioden('quartal').length, 4)
  assert.equal(perioden('jahr').length, 1)
  assert.equal(perioden('jahr')[0].monate.length, 12)
})

test('kennzahlenMonate: Profit-Center-Faktor und Arbeitstag-Normierung', () => {
  const voll = kennzahlenMonate('gesamt', [3, 4, 5])
  const halb = kennzahlenMonate('gesamt', [3, 4, 5], { faktor: 0.5 })
  assert.ok(Math.abs(halb.ist - voll.ist * 0.5) < 1)
  // je Arbeitstag = Summe / Arbeitstage der Ist-Monate
  const at = arbeitstage([3, 4, 5])
  const proTag = kennzahlenMonate('gesamt', [3, 4, 5], { jeArbeitstag: true })
  assert.ok(Math.abs(proTag.ist - voll.ist / at) < 1)
  assert.equal(proTag.arbeitstage, at)
})

test('quartalKennzahlen nutzt nur Quartalsmonate', () => {
  const q2 = quartalKennzahlen('gesamt', 'Q2')
  const ref = kennzahlenMonate('gesamt', [3, 4, 5])
  assert.equal(q2.ist, ref.ist)
})

test('Arbeitstage je Monat plausibel (12 Werte, 16–24)', () => {
  assert.equal(ARBEITSTAGE.length, 12)
  assert.ok(ARBEITSTAGE.every((d) => d >= 16 && d <= 24))
})

test('Kanal-Split: Anteile ~100 %, Online über Plan, Stationär darunter', () => {
  const s = kanalSplit()
  assert.ok(Math.abs(s.reduce((n, k) => n + k.anteil, 0) - 100) <= 0.5)
  const online = s.find((k) => k.id === 'online'), store = s.find((k) => k.id === 'stationaer')
  assert.ok(online.abwPct > 0 && store.abwPct < 0)
})

test('Inland/Ausland: Anteile ~100 %, Ausland wächst stärker', () => {
  const ia = inlandAusland()
  assert.ok(Math.abs(ia.inland.anteil + ia.ausland.anteil - 100) <= 0.5)
  assert.ok(ia.ausland.wachstum > ia.inland.wachstum)
})

test('Benchmark + Marktanteile vollständig', () => {
  assert.ok(MARKT.marktanteil.some((m) => m.eigen))
  assert.ok(Math.abs(MARKT.marktanteil.reduce((n, m) => n + m.pct, 0) - 100) <= 0.5)
  assert.ok(MARKT.benchmark.length >= 4)
  assert.ok(avgWertProBike() > 1000)
})

test('Ampel-Schwellen', () => {
  assert.equal(ampel(2), 'g')
  assert.equal(ampel(-3), 'a')
  assert.equal(ampel(-9), 'r')
})
