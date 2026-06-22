import './_setup.mjs'
import test from 'node:test'
import assert from 'node:assert/strict'
import { segmente, aggregiere, summe, ueberblick } from '../src/core/versand.js'

test('Segment-Werte = Anzahl × Satz; Deckung = Erlös − Kosten', () => {
  for (const s of segmente()) {
    assert.equal(s.erloes, s.anzahl * s.erloesProSdg)
    assert.equal(s.kosten, s.anzahl * s.kostenProSdg)
    assert.equal(s.deckung, s.erloes - s.kosten)
  }
})

test('Aggregat erhält Gesamtsummen (Partition über Carrier)', () => {
  const g = summe()
  const carrier = aggregiere('carrier')
  assert.ok(Math.abs(carrier.reduce((n, x) => n + x.erloes, 0) - g.erloes) < 1)
  assert.ok(Math.abs(carrier.reduce((n, x) => n + x.kosten, 0) - g.kosten) < 1)
  assert.equal(carrier.reduce((n, x) => n + x.anzahl, 0), g.anzahl)
})

test('Versand ist unterdeckt; Netto enthält Retouren', () => {
  const u = ueberblick()
  assert.ok(u.versand.deckung < 0, 'Versand unterdeckt')
  assert.ok(u.versand.deckungsquote < 100)
  // Netto-Kosten = Versand + Retouren
  assert.equal(u.netto.kosten, u.versand.kosten + u.retoure.kosten)
  assert.ok(u.netto.deckung < u.versand.deckung) // Retouren verschlechtern weiter
})

test('Gratis-Bike-Versand verursacht hohe Kosten ohne Erlös', () => {
  const u = ueberblick()
  assert.ok(u.gratisVersandKosten > 100000)
})

test('Retouren tragen keinen Erlös, nur Kosten', () => {
  const r = summe('Retoure')
  assert.equal(r.erloes, 0)
  assert.ok(r.kosten > 0)
})
