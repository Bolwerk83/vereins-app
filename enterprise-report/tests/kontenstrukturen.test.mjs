import './_setup.mjs'
import test from 'node:test'
import assert from 'node:assert/strict'
import { BAEUME, baum, werteBaum, kontoVorkommen } from '../src/core/kontenstrukturen.js'

test('GuV-Struktur rollt auf Ergebnis vor Steuern (7.800 T€)', () => {
  const g = baum('guv')
  assert.ok(Math.abs(g.wurzel.wert - 7800) < 1)
  // Umsatzerlöse-Kind = 205.000, Materialaufwand = 120.000
  const umsatz = g.wurzel.kinder.find((k) => k.name === 'Umsatzerlöse')
  const material = g.wurzel.kinder.find((k) => k.name === 'Materialaufwand')
  assert.equal(umsatz.wert, 205000)
  assert.equal(material.wert, 120000)
})

test('Kostenarten-Baum: Betriebsergebnis 11.000, DB 85.000', () => {
  const k = baum('kostenarten')
  assert.ok(Math.abs(k.wurzel.wert - 11000) < 1)
  const db = k.wurzel.kinder.find((x) => x.name === 'Deckungsbeitrag')
  assert.equal(db.wert, 85000)
})

test('ROI-Baum: ROI = Umsatzrendite × Kapitalumschlag ≈ 6,47 %', () => {
  const r = baum('roi')
  assert.ok(Math.abs(r.wurzel.wert - 6.47) < 0.1)
  const ur = r.wurzel.kinder.find((k) => k.key === 'umsatzrendite')
  const ku = r.wurzel.kinder.find((k) => k.key === 'kapitalumschlag')
  assert.ok(Math.abs(ur.wert - 5.37) < 0.1)
  assert.ok(Math.abs(ku.wert - 1.206) < 0.01)
})

test('Umsatzerlöse kommen in mehreren Bäumen vor', () => {
  const v = kontoVorkommen('8400')
  assert.ok(v.length >= 3, 'Umsatz in GuV, ROI und DB-Schema')
  // Konto, das nur im ROI-Baum vorkommt (Aktiva)
  assert.deepEqual(kontoVorkommen('1140'), ['ROI'])
})

test('werteBaum ist konsistent (Konten-Knoten = Summe der Beträge)', () => {
  const node = werteBaum({ name: 't', konten: ['8400', '8410'] })
  assert.equal(node.wert, 205000)
})
