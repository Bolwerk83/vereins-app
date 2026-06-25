import './_setup.mjs'
import test from 'node:test'
import assert from 'node:assert/strict'
import { kundenUebersicht, gesamt, belegeVon, BELEGE, KUNDEN, RETOURE_SCHWELLE } from '../src/core/gutschriften.js'

test('belegeVon verknüpft alle Belege eines Kunden (mehrere Versendungen)', () => {
  const b2b = belegeVon('k-b2b')
  assert.equal(b2b.length, 3) // GS-7005/7006/7007
  assert.ok(b2b.every((b) => b.kunde === 'k-b2b'))
})

test('Retouren- vs. Wertgutschrift getrennt, EUR und % zum AET', () => {
  const rows = kundenUebersicht()
  const b2b = rows.find((r) => r.id === 'k-b2b')
  assert.equal(b2b.retoureGut, 12000)
  assert.equal(b2b.wertGut, 18500 + 6400)
  // Wertquote = wertGut / AET
  assert.equal(b2b.wertQuote, Math.round((24900 / 145000 * 100) * 10) / 10)
  assert.equal(b2b.gesamtGut, b2b.retoureGut + b2b.wertGut)
})

test('Hotel: Retourengutschriftquote > 55 % wird als auffällig markiert', () => {
  const hotel = kundenUebersicht().find((r) => r.id === 'k-hotel')
  // 51000 / 88000 ≈ 58 % > 55
  assert.ok(hotel.retoureQuote > RETOURE_SCHWELLE)
  assert.equal(hotel.auffaellig, true)
  assert.equal(hotel.status, 'auffaellig')
})

test('Gesamt summiert Retouren-/Wertgutschriften korrekt', () => {
  const g = gesamt()
  const sumRet = BELEGE.filter((b) => b.typ === 'retoure').reduce((n, b) => n + b.wert, 0)
  const sumWert = BELEGE.filter((b) => b.typ === 'wert').reduce((n, b) => n + b.wert, 0)
  assert.equal(g.retoureGut, sumRet)
  assert.equal(g.wertGut, sumWert)
  assert.equal(g.gesamtGut, sumRet + sumWert)
  assert.ok(g.auffaellige >= 1)
})
