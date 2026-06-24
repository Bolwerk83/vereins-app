import './_setup.mjs'
import test from 'node:test'
import assert from 'node:assert/strict'
import { dbSichten, direktCosting, SONDERFAELLE, KONDITIONSARTEN } from '../src/core/deckungsbeitrag.js'

test('Brutto-DB entspricht dem unveränderten Direct-Costing-DB', () => {
  const s = dbSichten([], 1, false)
  const dc = direktCosting(undefined, 1)
  assert.equal(s.brutto.db, dc.db1)
  assert.equal(s.brutto.umsatz, dc.umsatz)
  assert.equal(s.effekt, 0) // ohne Ausschluss kein Effekt
})

test('Ausschluss von Sonderfällen hebt den DB (sie sind margenschädlich)', () => {
  const alle = dbSichten(KONDITIONSARTEN.map((k) => k.id), 1, false)
  assert.ok(alle.bereinigt.db > alle.brutto.db, 'bereinigter DB muss höher sein')
  assert.ok(alle.effekt > 0)
  assert.ok(alle.bereinigt.dbQuote > alle.brutto.dbQuote)
})

test('Sponsoring hat negativen DB (voller Wareneinsatz, kein Erlös)', () => {
  const s = dbSichten([], 1, false)
  const sp = s.bruecke.find((b) => b.typ === 'sponsoring')
  assert.ok(sp.umsatz === 0)
  assert.ok(sp.db < 0)
})

test('Ausgeblendet-Hinweis summiert Belege/Umsatz/Wareneinsatz korrekt', () => {
  const s = dbSichten(['sponsoring', 'muster'], 1, false)
  const erwartetBelege = SONDERFAELLE.filter((x) => ['sponsoring', 'muster'].includes(x.typ)).reduce((n, x) => n + x.belege, 0)
  assert.equal(s.ausgeblendet.belege, erwartetBelege)
  assert.ok(s.ausgeblendet.varKosten > 0)
})

test('Sponsoring-Umbuchung ins Marketing wirkt wie Ausschluss + weist Betrag aus', () => {
  const ohne = dbSichten([], 1, false)
  const umbuchung = dbSichten([], 1, true)
  assert.ok(umbuchung.bereinigt.db > ohne.bereinigt.db, 'DB steigt durch Umbuchung')
  assert.ok(umbuchung.marketingUmbuchung > 0)
  const sp = umbuchung.bruecke.find((b) => b.typ === 'sponsoring')
  assert.equal(sp.umgebucht, true)
})

test('Profit-Center-Faktor skaliert die Sonderfälle mit', () => {
  const voll = dbSichten(['sponsoring'], 1, false)
  const halb = dbSichten(['sponsoring'], 0.5, false)
  assert.ok(Math.abs(halb.ausgeblendet.varKosten - voll.ausgeblendet.varKosten / 2) < 0.06)
})
