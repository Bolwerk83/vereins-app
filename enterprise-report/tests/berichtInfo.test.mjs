import './_setup.mjs'
import test from 'node:test'
import assert from 'node:assert/strict'
import { BERICHT_INFO, infoVon } from '../src/core/berichtInfo.js'
import { VIEW_BEREICH } from '../src/core/navMeta.js'

test('Jeder navigierbare Bericht hat eine Info (Zweck/Zielgruppe/Mehrwert)', () => {
  for (const view of Object.keys(VIEW_BEREICH)) {
    // kostenarten/kalkulatorik sind Unteransichten der KLR – dürfen fehlen.
    if (view === 'kostenarten' || view === 'kalkulatorik') continue
    const info = infoVon(view)
    assert.ok(info, `Info fehlt für: ${view}`)
    assert.ok(info.zweck && info.zielgruppe && info.mehrwert, `Feld fehlt bei: ${view}`)
  }
})

test('infoVon liefert null für Unbekanntes', () => {
  assert.equal(infoVon('gibtsnicht'), null)
})

test('Keine verwaisten Info-Einträge ohne View-Zuordnung', () => {
  for (const view of Object.keys(BERICHT_INFO)) {
    assert.ok(view in VIEW_BEREICH, `Info ohne View-Bereich: ${view}`)
  }
})
