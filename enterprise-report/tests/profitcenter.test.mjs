import './_setup.mjs'
import test from 'node:test'
import assert from 'node:assert/strict'
import { auswertung, auswertungNach, DIMENSIONEN } from '../src/core/profitcenter.js'
import { gesamt as pcGesamt } from '../src/core/pcKostenstellen.js'

test('Ergebnis = Umsatz − variable Kosten − Fixkosten; DB korrekt', () => {
  for (const r of auswertung().rows) {
    assert.equal(r.db, +(r.umsatz - r.varKosten).toFixed(2))
    assert.equal(r.ergebnis, +(r.db - r.fixKosten).toFixed(2))
  }
})

test('Gesamtergebnis = Summe der Center-Ergebnisse; Beiträge ~100 %', () => {
  const a = auswertung()
  assert.equal(a.gesamt, +a.rows.reduce((n, r) => n + r.ergebnis, 0).toFixed(2))
  const beitrag = a.rows.reduce((n, r) => n + r.beitrag, 0)
  assert.ok(Math.abs(beitrag - 100) <= 2, 'Beitrag ' + beitrag)
})

test('ROCE nur bei Investment Centern', () => {
  for (const r of auswertung().rows) {
    if (r.typ === 'investment') assert.ok(r.roce != null)
    else assert.equal(r.roce, null)
  }
})

test('DIMENSIONEN = Strukturen des PC-Baums (Geschäftsbereich/Kanal/Land)', () => {
  assert.deepEqual(DIMENSIONEN.map((d) => d.key), ['geschaeftsbereich', 'kanal', 'land'])
})

test('Umsatz ist über alle Gruppierungen konstant (dieselbe Datenbasis)', () => {
  const gb = auswertungNach('geschaeftsbereich')
  const kanal = auswertungNach('kanal')
  const land = auswertungNach('land')
  assert.ok(Math.abs(gb.umsatz - kanal.umsatz) < 0.05)
  assert.ok(Math.abs(gb.umsatz - land.umsatz) < 0.05)
  assert.ok(Math.abs(gb.gesamt - kanal.gesamt) < 0.05)
})

test('Einheitliche PC-Wahrheit: Summen = pcKostenstellen-Aggregat (Mio €)', () => {
  const a = auswertung()
  const g = pcGesamt()
  assert.ok(Math.abs(a.umsatz - g.erloes / 1000) < 0.05)
  assert.ok(Math.abs(a.gesamt - (g.erloes - g.kosten) / 1000) < 0.05)
})

test('Vertriebskanal-Gruppierung enthält Online & Filiale als Center', () => {
  const ids = auswertungNach('kanal').rows.map((r) => r.id)
  assert.ok(ids.includes('online') && ids.includes('filiale'))
})
