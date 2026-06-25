import './_setup.mjs'
import test from 'node:test'
import assert from 'node:assert/strict'
import { managementSummary, summaryNachVorlage, analyse, SUMMARY_VORLAGEN } from '../src/core/managementSummary.js'
import { zeitraumVon } from '../src/core/statistikFilter.js'

const monate = zeitraumVon('jahr').monate

test('managementSummary: Struktur, Status und Fliesstext aus echten Zahlen', () => {
  const s = managementSummary(monate, { periodeName: 'Gesamtjahr', faktor: 1 })
  assert.ok(['g', 'a', 'r'].includes(s.status))
  assert.ok(s.lage.includes('Mio €') && s.lage.includes('Plan'))
  assert.ok(s.punkte.length >= 2 && s.punkte.every((p) => p.kopf && p.text))
  assert.ok(s.empfehlung.length > 10)
  // Fliesstext enthaelt Lage und Empfehlung (kein offener Platzhalter)
  assert.ok(s.fliesstext.includes('Empfehlung:'))
  assert.ok(!/\bundefined\b|NaN/.test(s.fliesstext))
})

test('Alle Vorlagen liefern Text ohne Platzhalter/NaN', () => {
  assert.ok(SUMMARY_VORLAGEN.length >= 4)
  for (const v of SUMMARY_VORLAGEN) {
    const txt = summaryNachVorlage(monate, { periodeName: 'Gesamtjahr' }, v.id)
    assert.ok(txt.length > 20, `${v.id} zu kurz`)
    assert.ok(!/undefined|NaN/.test(txt), `${v.id} enthält Platzhalter`)
  }
  // Unterschiedliche Vorlagen ergeben unterschiedliche Texte
  const komp = summaryNachVorlage(monate, {}, 'kompakt')
  const ausf = summaryNachVorlage(monate, {}, 'ausfuehrlich')
  assert.notEqual(komp, ausf)
  assert.ok(ausf.length > komp.length) // ausfuehrlich ist laenger
})

test('Vorlagen reagieren auf die Ergebnislage (Richtung Plan)', () => {
  const a = analyse(monate, { periodeName: 'Gesamtjahr' })
  // Demo-Daten liegen unter Plan -> "verfehlt den Plan" und Gegensteuer-Empfehlung
  assert.ok(['übertrifft den Plan', 'verfehlt den Plan', 'liegt im Plan'].includes(a.richtung))
  const komp = summaryNachVorlage(monate, { periodeName: 'Gesamtjahr' }, 'kompakt')
  assert.ok(komp.includes(a.richtung))
})

test('Profit-Center-Sicht erscheint im Text', () => {
  const txt = summaryNachVorlage(monate, { periodeName: 'Q2', pcLabel: 'Online' }, 'ausfuehrlich')
  assert.ok(txt.includes('Online'))
})
