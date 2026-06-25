import './_setup.mjs'
import test from 'node:test'
import assert from 'node:assert/strict'
import { adsKampagnen, adsSumme, funnelMitRaten, abgleich, CROSS_SELLING, FUNNEL } from '../src/core/googleDaten.js'

test('Ads: ROAS/CTR/CPC/CPA korrekt berechnet', () => {
  const k = adsKampagnen()[0]
  assert.ok(Math.abs(k.roas - k.conversionWert / k.kosten) < 0.001)
  assert.ok(Math.abs(k.ctr - k.klicks / k.impressionen * 100) < 0.001)
  assert.ok(Math.abs(k.cpc - k.kosten / k.klicks) < 0.001)
  assert.ok(k.echtumsatz < k.conversionWert) // Echtumsatz immer kleiner als Google-Wert
})

test('Ads-Summe und Google-Überzeichnung positiv', () => {
  const s = adsSumme()
  assert.equal(s.kosten, adsKampagnen().reduce((n, x) => n + x.kosten, 0))
  assert.ok(s.ueberzeichnung > 0 && s.ueberzeichnungPct > 0)
  assert.ok(s.conversionWert > s.echtumsatz)
})

test('Funnel monoton fallend, Raten plausibel', () => {
  const f = funnelMitRaten()
  for (let i = 1; i < f.length; i++) assert.ok(f[i].wert <= f[i - 1].wert)
  assert.equal(f[0].anteil, 100)
  assert.ok(f[f.length - 1].anteil < 100)
})

test('Abgleich: Differenz = Google − Echt je Kampagne', () => {
  for (const r of abgleich()) {
    assert.equal(r.differenz, r.google - r.echt)
    assert.ok(r.differenz >= 0)
  }
})

test('Cross-Selling-Empfehlungen vorhanden', () => {
  assert.ok(CROSS_SELLING.length >= 5)
  assert.ok(CROSS_SELLING.every((c) => c.wenn && c.dann && c.quote > 0))
})
