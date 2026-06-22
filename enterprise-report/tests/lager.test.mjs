import './_setup.mjs'
import test from 'node:test'
import assert from 'node:assert/strict'
import { kennzahlen, standorteAuswertung, eoq, optimierung, lagerhaltungskostensatz, KOSTENSATZ, STANDORTE, WARENEINSATZ_MIO } from '../src/core/lager.js'

test('Lagerhaltungskostensatz = Summe der Komponenten', () => {
  const erwartet = Math.round(KOSTENSATZ.reduce((n, k) => n + k.satz, 0) * 10) / 10
  assert.equal(lagerhaltungskostensatz(), erwartet)
})

test('Kennzahlen: Bestandswert, Umschlag, Reichweite', () => {
  const k = kennzahlen()
  const bw = Math.round(STANDORTE.reduce((n, s) => n + s.bestandswert, 0) * 100) / 100
  assert.equal(k.bestandswert, bw)
  assert.equal(k.umschlag, Math.round(WARENEINSATZ_MIO / bw * 10) / 10)
  assert.equal(k.reichweite, Math.round(365 / k.umschlag))
  assert.equal(k.lagerhaltungskosten, Math.round(bw * k.satz / 100 * 100) / 100)
})

test('EOQ (Andler) – bekannte Größenordnung', () => {
  const m = eoq(24000, 140, 980, 14)
  // √(2·24000·140 / (980·0.14)) = √(6.72e6 / 137.2) ≈ 221
  assert.ok(m > 210 && m < 235)
  assert.equal(eoq(100, 10, 0, 14), 0) // kein Preis -> 0
})

test('Standort-Auswertung: Auslastung und Kosten/m²', () => {
  const s = standorteAuswertung()[0]
  assert.equal(s.auslastung, Math.round(STANDORTE[0].belegtPlaetze / STANDORTE[0].kapazitaetPlaetze * 1000) / 10)
  assert.ok(s.kostenJeM2 > 0)
})

test('Optimierung: Meldebestand ≥ Sicherheitsbestand, Höchst = Sicherheit + EOQ', () => {
  for (const r of optimierung().rows) {
    assert.ok(r.meldebestand >= r.sicherheitsbestand)
    assert.equal(r.hoechstbestand, r.sicherheitsbestand + r.eoqMenge)
    assert.equal(r.gesamtkostenJahr, r.bestellkostenJahr + r.lagerkostenJahr)
  }
})
