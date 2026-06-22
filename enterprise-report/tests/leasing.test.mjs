import './_setup.mjs'
import test from 'node:test'
import assert from 'node:assert/strict'
import { vertraege, leasingKennzahlen, kategorieVerteilung, leasingVsKauf, ifrs16, dienstradKennzahlen } from '../src/core/leasing.js'

test('Verträge: Restlaufzeit + verstrichen = Laufzeit; Ende korrekt', () => {
  for (const v of vertraege()) {
    assert.equal(v.verstrichen + v.restlaufzeit, v.laufzeit)
    assert.ok(v.bisherGezahlt + v.restzahlung === v.gesamtkosten)
    assert.match(v.ende, /^\d{4}-\d{2}$/)
  }
  // Beispiel: Lieferfahrzeuge 2023-09 + 48 Mon. = 2027-09
  const t = vertraege().find((v) => v.id === 'l-transporter')
  assert.equal(t.ende, '2027-09')
})

test('Leasing-Kennzahlen summieren konsistent', () => {
  const k = leasingKennzahlen(), v = vertraege()
  assert.equal(k.anzahl, v.length)
  assert.equal(k.jahresgebuehr, v.reduce((n, x) => n + x.rate * 12, 0))
  assert.equal(k.monatsrate, v.reduce((n, x) => n + x.rate, 0))
  assert.ok(k.laufenAus >= 1)
})

test('Kategorieverteilung deckt alle Verträge ab', () => {
  const kat = kategorieVerteilung()
  assert.equal(kat.reduce((n, x) => n + x.anzahl, 0), vertraege().length)
})

test('Leasing vs. Kauf liefert Vorteil + Empfehlung je Objekt', () => {
  const rows = leasingVsKauf()
  assert.equal(rows.length, vertraege().length)
  for (const r of rows) {
    assert.equal(r.vorteilLeasing, r.kauf - r.leasing)
    assert.equal(r.empfehlung, r.vorteilLeasing >= 0 ? 'Leasing' : 'Kauf')
  }
})

test('IFRS 16: Verbindlichkeit = kurz + lang; EBITDA-Effekt = HGB-Aufwand', () => {
  const f = ifrs16()
  assert.equal(f.verbindlichkeit, f.kurzfristig + f.langfristig)
  assert.ok(f.rouAsset > 0 && f.verbindlichkeit > 0)
  assert.equal(f.ebitdaEffekt, f.hgbAufwand)
})

test('Dienstrad: Jahreserlös = aktive × Rate × 12', () => {
  const d = dienstradKennzahlen()
  assert.equal(d.jahreserloes, d.aktiveVertraege * d.oRate * 12)
  assert.ok(d.ausfallVertraege >= 1)
})
