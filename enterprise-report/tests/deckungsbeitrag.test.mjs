import './_setup.mjs'
import test from 'node:test'
import assert from 'node:assert/strict'
import { direktCosting, stufenweise, breakEven, breakEvenKurve, warengruppen, artikelListe, KUNDENSEGMENTE } from '../src/core/deckungsbeitrag.js'

test('Direct Costing: DB I = Umsatz − variable Kosten', () => {
  const d = direktCosting()
  for (const p of d.rows) assert.equal(p.db1, +(p.umsatz - p.varKosten).toFixed(2))
  assert.equal(d.db1, +d.rows.reduce((n, p) => n + p.db1, 0).toFixed(2))
})

test('Mehrstufig: DB-Stufen rechnen korrekt durch bis Betriebsergebnis', () => {
  const s = stufenweise()
  for (const b of s.bereiche) {
    for (const p of b.produkte) {
      assert.equal(p.db1, +(p.umsatz - p.varKosten).toFixed(2))
      assert.equal(p.db2, +(p.db1 - p.produktfix).toFixed(2))
    }
    assert.equal(b.db3, +(b.summeDB2 - b.bereichsfix).toFixed(2))
  }
  assert.equal(s.betriebsergebnis, +(s.summeDB3 - s.unternehmensfix).toFixed(2))
})

test('Break-Even: Gesamt — beUmsatz = Fix / DB-Quote, Schnittpunkt stimmt', () => {
  const be = breakEven({})
  assert.ok(be.umsatz > 0 && be.db > 0 && be.fix > 0)
  // beUmsatz = fix / (dbQuote/100)
  const erwartet = +(be.fix / (be.dbQuote / 100)).toFixed(2)
  assert.ok(Math.abs(be.beUmsatz - erwartet) < 0.2)
  // Am Break-even sind Erlös und Gesamtkosten gleich.
  const x = be.beAuslastung
  const erloes = be.umsatz * x
  const kosten = be.fix + be.varKosten * x
  assert.ok(Math.abs(erloes - kosten) < 0.05)
})

test('Break-Even: Ergebnis = DB − Fix; Sicherheitsstrecke konsistent', () => {
  const be = breakEven({})
  assert.equal(be.ergebnis, +(be.db - be.fix).toFixed(2))
  if (be.beUmsatz != null) {
    const s = (be.umsatz - be.beUmsatz) / be.umsatz * 100
    assert.ok(Math.abs(be.sicherheit - s) < 0.1)
  }
})

test('Break-Even: Filter Warengruppe/Artikel grenzen den Umsatz ein', () => {
  const gesamt = breakEven({})
  const wg = warengruppen()[0].id
  const beWg = breakEven({ bereich: wg })
  assert.ok(beWg.umsatz <= gesamt.umsatz)
  const art = artikelListe(wg)[0].id
  const beArt = breakEven({ bereich: wg, produkt: art })
  assert.ok(beArt.umsatz <= beWg.umsatz)
})

test('Break-Even: Kundensegment skaliert den Umsatz nach Anteil', () => {
  const gesamt = breakEven({})
  const seg = KUNDENSEGMENTE[0]
  const beSeg = breakEven({ segment: seg.id })
  // Umsatz ~ Gesamt × Anteil (Segment skaliert proportional).
  assert.ok(Math.abs(beSeg.umsatz - gesamt.umsatz * seg.anteil) < gesamt.umsatz * 0.02)
})

test('breakEvenKurve liefert monotone Stützpunkte inkl. Nullpunkt', () => {
  const be = breakEven({})
  const k = breakEvenKurve(be)
  assert.ok(k.length > 5)
  assert.equal(k[0].erloes, 0)
  assert.equal(k[0].kosten, be.fix)         // bei x=0 nur Fixkosten
  for (let i = 1; i < k.length; i++) assert.ok(k[i].erloes >= k[i - 1].erloes)
})

test('Profit-Center-Faktor skaliert Werte; DB-Quoten invariant', () => {
  const voll = direktCosting(undefined, 1)
  const halb = direktCosting(undefined, 0.5)
  assert.ok(Math.abs(halb.umsatz - voll.umsatz * 0.5) < 0.05)
  assert.equal(halb.db1Quote, voll.db1Quote)
  const sVoll = stufenweise(undefined, undefined, undefined, 1)
  const sHalb = stufenweise(undefined, undefined, undefined, 0.5)
  assert.ok(Math.abs(sHalb.betriebsergebnis - sVoll.betriebsergebnis * 0.5) < 0.1)
  assert.ok(Math.abs(sHalb.unternehmensfix - sVoll.unternehmensfix * 0.5) < 0.05)
})
