import './_setup.mjs'
import test from 'node:test'
import assert from 'node:assert/strict'
import { BILANZ, GUV, CASHFLOW, TAGE, kennzahlen, kennzahlenGruppe, ampelKennzahl, risikoBild, GRUPPEN, basis } from '../src/core/finanzkennzahlen.js'

test('Bilanz ist ausgeglichen (Aktiva = Passiva)', () => {
  const passiva = BILANZ.eigenkapital + BILANZ.langfristFK + BILANZ.kurzfristFK
  assert.ok(Math.abs(BILANZ.summe - passiva) < 0.01)
  assert.ok(Math.abs(BILANZ.umlaufvermoegen - (BILANZ.vorraete + BILANZ.forderungen + BILANZ.sonstigesUV + BILANZ.liquideMittel)) < 0.01)
})

test('GuV rechnet konsistent durch bis Jahresüberschuss', () => {
  assert.equal(GUV.ebit, +(GUV.umsatz - GUV.materialaufwand - GUV.personalaufwand - GUV.abschreibungen - GUV.sonstigerAufwand).toFixed(2))
  assert.equal(GUV.ebitda, +(GUV.ebit + GUV.abschreibungen).toFixed(2))
  assert.ok(GUV.jahresueberschuss > 0 && GUV.jahresueberschuss < GUV.ebit)
})

test('Cash Conversion Cycle = DIO + DSO − DPO', () => {
  assert.equal(TAGE.ccc, TAGE.dio + TAGE.dso - TAGE.dpo)
})

test('Eigenkapitalquote ~35 % und grün', () => {
  const ekq = kennzahlen().find((k) => k.name === 'Eigenkapitalquote')
  assert.ok(Math.abs(ekq.wert - 35) < 1)
  assert.equal(ampelKennzahl(ekq), 'g')
})

test('Ampel respektiert Richtung (hoch/tief)', () => {
  const hoch = { wert: 40, ziel: { gut: 30, ok: 20 }, richtung: 'hoch' }
  const tief = { wert: 40, ziel: { gut: 30, ok: 20 }, richtung: 'tief' }
  assert.equal(ampelKennzahl(hoch), 'g')
  assert.equal(ampelKennzahl(tief), 'r')
})

test('jede Gruppe hat Kennzahlen; jede Kennzahl Formel + Standard', () => {
  for (const g of GRUPPEN) assert.ok(kennzahlenGruppe(g.id).length >= 3, `${g.id} hat Kennzahlen`)
  for (const k of kennzahlen()) {
    assert.ok(k.formel && k.formel.length > 3)
    assert.ok(k.standard && k.deutung)
    assert.ok(['g', 'a', 'r'].includes(ampelKennzahl(k)))
  }
})

test('Risikobild summiert auf Kennzahlanzahl', () => {
  const rb = risikoBild()
  assert.equal(rb.g + rb.a + rb.r, rb.total)
  assert.equal(rb.total, kennzahlen().length)
})

test('Segmentsicht: absolute Basis skaliert, Strukturquoten invariant', () => {
  const b1 = basis(1), b2 = basis(0.5)
  assert.ok(Math.abs(b2.BILANZ.summe - b1.BILANZ.summe * 0.5) < 0.05)
  assert.ok(Math.abs(b2.GUV.ebit - b1.GUV.ebit * 0.5) < 0.05)
  // Eigenkapitalquote (Quote) bleibt gleich
  const ekq = (k) => k.find((x) => x.name === 'Eigenkapitalquote').wert
  assert.equal(ekq(kennzahlen(1)), ekq(kennzahlen(0.5)))
  // Working Capital (absolut, kein Quotient) skaliert mit der Segmentgröße
  const wc = (k) => k.find((x) => x.name === 'Working Capital').wert
  assert.ok(Math.abs(wc(kennzahlen(0.5)) - wc(kennzahlen(1)) * 0.5) < 0.1)
  // Anzahl der Kennzahlen bleibt gleich (Ampeln absoluter Kennzahlen dürfen kippen)
  assert.equal(risikoBild(0.5).total, risikoBild(1).total)
})
