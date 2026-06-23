import './_setup.mjs'
import test from 'node:test'
import assert from 'node:assert/strict'
import * as vk from '../src/core/verkaufsstatistik.js'
import * as fr from '../src/core/fahrradstatistik.js'
import * as ek from '../src/core/einkaufsstatistik.js'
import * as ps from '../src/core/produktionsstatistik.js'
import * as sf from '../src/core/statistikFilter.js'

test('Verkaufsstatistik: Summen & Anteile konsistent', () => {
  const wg = vk.warengruppen()
  const k = vk.kennzahlen()
  assert.equal(wg.reduce((n, w) => n + w.umsatz, 0), k.umsatz)
  assert.ok(Math.abs(wg.reduce((n, w) => n + w.anteilPct, 0) - 100) < 0.5)
  // nach Umsatz absteigend
  for (let i = 1; i < wg.length; i++) assert.ok(wg[i - 1].umsatz >= wg[i].umsatz)
  assert.ok(k.wachstumPct !== 0 && k.avgBon > 0)
  // Kanäle: Online-Anteil plausibel
  assert.ok(k.onlineAnteilPct > 0 && k.onlineAnteilPct < 100)
})

test('Fahrradstatistik: E-Bike + Bio = 100 %, Ø-Preis berechnet', () => {
  const a = fr.antrieb()
  assert.ok(Math.abs(a.eBike.anteilPct + a.bio.anteilPct - 100) < 0.5)
  assert.ok(a.eBike.avgPreis > a.bio.avgPreis) // E-Bikes teurer
  const k = fr.kennzahlen()
  assert.equal(k.eBikeAnteilPct, a.eBike.anteilPct)
  const pk = fr.preisklassen()
  assert.ok(Math.abs(pk.reduce((n, p) => n + p.anteilPct, 0) - 100) < 0.6)
  const kat = fr.kategorien()
  assert.ok(kat.every((c) => c.avgPreis > 0))
})

test('Einkaufsstatistik: ABC-Klassen & Volumen stimmen', () => {
  const abc = ek.abcAnalyse()
  const k = ek.kennzahlen()
  const volABC = abc.klassen.reduce((n, c) => n + c.volumen, 0)
  assert.equal(volABC, k.volumen)
  assert.equal(abc.rows.length, ek.lieferanten().length)
  // kumulierter Anteil monoton steigend
  for (let i = 1; i < abc.rows.length; i++) assert.ok(abc.rows[i].kumPct >= abc.rows[i - 1].kumPct)
  assert.ok(['A', 'B', 'C'].includes(abc.rows[0].klasse))
  assert.ok(k.skontoPotenzial > 0 && k.avgBestellwert > 0)
})

test('Einkauf: Warengruppen aggregieren alle Lieferanten', () => {
  const wg = ek.warengruppen()
  const k = ek.kennzahlen()
  assert.equal(wg.reduce((n, g) => n + g.volumen, 0), k.volumen)
  assert.equal(wg.reduce((n, g) => n + g.lieferanten, 0), ek.lieferanten().length)
})

test('Filter: Gesamtjahr = 100 %, Quartale summieren auf, Profit-Center skaliert', () => {
  // Volles Jahr ohne PC/Datumsart-Verschiebung = Faktor 1
  assert.equal(sf.zeitraumAnteil('jahr'), 1)
  const qSum = ['q1', 'q2', 'q3', 'q4'].reduce((n, q) => n + sf.zeitraumAnteil(q), 0)
  assert.ok(Math.abs(qSum - 1) < 0.01)
  assert.ok(Math.abs(sf.zeitraumAnteil('h1') + sf.zeitraumAnteil('h2') - 1) < 0.01)
  // Profit-Center halbiert grob die absoluten Werte
  const voll = vk.kennzahlen(sf.faktor('jahr', 'alle'))
  const ecom = vk.kennzahlen(sf.faktor('jahr', 'pc-ecom'))
  assert.ok(ecom.umsatz < voll.umsatz)
  assert.ok(Math.abs(ecom.umsatz / voll.umsatz - 0.586) < 0.02)
  // Ratios (DB-%) bleiben unter Skalierung gleich
  assert.equal(voll.dbProzent, ecom.dbProzent)
})

test('Zeitdimension: Lieferdatum verschiebt Quartalsanteile & senkt Jahresvolumen', () => {
  const beleg = sf.datumsartInfo('verkauf', 'beleg')
  const liefer = sf.datumsartInfo('verkauf', 'liefer')
  // Volles Jahr: Lieferdatum hat kleinere Magnitude (noch nicht Geliefertes fehlt)
  assert.ok(sf.faktor('jahr', 'alle', liefer) < sf.faktor('jahr', 'alle', beleg))
  // Quartalsanteil verschiebt sich je nach Datumsart
  assert.notEqual(sf.zeitraumAnteil('q1', liefer.shift), sf.zeitraumAnteil('q1', beleg.shift))
  // Bereich-spezifische Datumsarten vorhanden
  assert.equal(sf.datumsartenFuer('einkauf').length, 3)
  assert.ok(sf.datumsartenFuer('produktion').some((d) => d.id === 'fertig'))
})

test('Produktion: Zeitraum grenzt auf vorhandene Monate ein (Q3 ohne Ist-Daten)', () => {
  const q1 = ps.kennzahlen({ monate: sf.monateVon('q1') })
  const q3 = ps.kennzahlen({ monate: sf.monateVon('q3') })
  assert.ok(q1.stueck > 0)         // Jan–Mär vorhanden
  assert.equal(q3.stueck, 0)       // Jul–Sep noch keine Ist-Daten
  assert.equal(q1.monateN, 3)
})

test('Produktionsstatistik: Mengen & Werte konsistent', () => {
  const pr = ps.produkte()
  const k = ps.kennzahlen()
  assert.equal(pr.reduce((n, p) => n + p.summe, 0), k.stueck)
  assert.equal(pr.reduce((n, p) => n + p.produzierterWert, 0), k.wert)
  // nach Wert absteigend
  for (let i = 1; i < pr.length; i++) assert.ok(pr[i - 1].produzierterWert >= pr[i].produzierterWert)
  const mo = ps.monatsOutput()
  assert.equal(mo.reduce((n, m) => n + m.stueck, 0), k.stueck)
  const wk = ps.werke()
  assert.equal(wk.reduce((n, w) => n + w.stueck, 0), k.stueck)
  assert.ok(k.avgStueckkosten > 0 && k.oee > 0)
})
