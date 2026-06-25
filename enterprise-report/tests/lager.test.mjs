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
    assert.equal(r.hoechstbestand, r.meldebestand + r.eoqMenge)
    assert.ok(r.hoechstbestand >= r.meldebestand) // Korridor nie invertiert
    assert.equal(r.gesamtkostenJahr, r.bestellkostenJahr + r.lagerkostenJahr)
  }
})

import { optimierung as opt2, lieferantenSignale, artikelEmpfehlungen, signale, politikKosten, eoq as eoq2, lagerhaltungskostensatz as satz2, ARTIKEL } from '../src/core/lager.js'
import { kommentiere, kommentarVon, offeneEskalationen, istEinkaufsleitung, signaleMitStatus } from '../src/core/lagerSignale.js'

test('Optimierung: angereicherte Felder (Status, Reichweite, Einsparpotenzial)', () => {
  const rows = opt2().rows
  for (const r of rows) {
    assert.ok(['unterdeckung', 'korridor', 'ueberbestand'].includes(r.status))
    assert.ok(r.reichweiteTage >= 0)
    assert.ok(r.einsparpotenzial >= 0)
    assert.ok(r.kapitalGebunden >= 0)
    assert.ok(r.lieferant && r.lieferant.name)
  }
  // EOQ minimiert die Politikkosten gegenüber der aktuellen Losgröße
  const a = ARTIKEL[0]
  const e = Math.round(eoq2(a.jahresbedarf, a.bestellkostenJe, a.einstandspreis, satz2()))
  assert.ok(politikKosten(e, a, satz2()) <= politikKosten(a.aktBestellmenge, a, satz2()) + 1)
})

test('Zubehör ist Überbestand mit gebundenem Kapital', () => {
  const z = opt2().rows.find((r) => r.id === 'zubehoer')
  assert.equal(z.status, 'ueberbestand')
  assert.ok(z.ueberbestandWert > 0)
})

test('KI erkennt schleichendes Lieferproblem (lf-power)', () => {
  const sig = lieferantenSignale()
  const power = sig.find((s) => s.lieferantId === 'lf-power')
  assert.ok(power, 'lf-power muss ein Signal erzeugen')
  assert.equal(power.schwere, 'kritisch')
  assert.ok(power.treueDelta <= -10 || power.wbzDelta >= 10)
  assert.ok(power.artikel.length >= 1)
  // stabiler Lieferant erzeugt KEIN Signal
  assert.ok(!sig.find((s) => s.lieferantId === 'lf-bike'))
})

test('artikelEmpfehlungen liefert mind. eine Empfehlung, sortiert nach Schwere', () => {
  const z = opt2().rows.find((r) => r.id === 'zubehoer')
  const emp = artikelEmpfehlungen(z)
  assert.ok(emp.length >= 1)
  assert.ok(emp.some((x) => x.titel === 'Überbestand abbauen'))
})

test('signale() bündelt Lieferanten- und Artikel-Signale, kritisch zuerst', () => {
  const s = signale()
  assert.ok(s.length >= 2)
  assert.ok(s[0].schwere === 'kritisch' || s.every((x) => x.schwere !== 'kritisch'))
})

test('Eskalation: unkommentierte wichtige Signale ploppen auf, kommentierte nicht', () => {
  localStorage.removeItem('er_lager_kommentar')
  const vorher = offeneEskalationen()
  assert.ok(vorher.length > 0)
  const ziel = vorher[0]
  kommentiere(ziel.id, 'Mit Lieferant geklärt, Liefertermin bestätigt.', 'Tarek Aydın')
  assert.ok(kommentarVon(ziel.id))
  const nachher = offeneEskalationen()
  assert.ok(nachher.length === vorher.length - 1)
  assert.ok(!nachher.find((s) => s.id === ziel.id))
  // leeres Kommentar entfernt den Status wieder
  kommentiere(ziel.id, '')
  assert.equal(kommentarVon(ziel.id), null)
})

test('istEinkaufsleitung erkennt EK-Verantwortung', () => {
  assert.ok(istEinkaufsleitung({ bereiche: '*' }))
  assert.ok(istEinkaufsleitung({ bereiche: ['EK', 'PR'] }))
  assert.ok(!istEinkaufsleitung({ bereiche: ['VK'] }))
  assert.ok(!istEinkaufsleitung(null))
})
