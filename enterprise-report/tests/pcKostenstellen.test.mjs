import './_setup.mjs'
import test from 'node:test'
import assert from 'node:assert/strict'
import {
  PROFITCENTER, pcMitKostenstellen, gesamt, verschiebe, setzeZurueck, pcVon, istVerschoben, anzahlVerschoben, kostenstellen
} from '../src/core/pcKostenstellen.js'

function reset() { setzeZurueck() }

test('PC-Aggregat = Σ seiner Kostenstellen', () => {
  reset()
  for (const pc of pcMitKostenstellen()) {
    const e = pc.kostenstellen.reduce((n, k) => n + k.erloes, 0)
    const k = pc.kostenstellen.reduce((n, x) => n + x.kosten, 0)
    assert.equal(pc.erloes, e)
    assert.equal(pc.kosten, k)
    assert.equal(pc.ergebnis, e - k)
  }
})

test('Jede Kostenstelle gehört zu genau einem PC; Summe konstant', () => {
  reset()
  const pcs = pcMitKostenstellen()
  const anzahl = pcs.reduce((n, p) => n + p.anzahl, 0)
  assert.equal(anzahl, kostenstellen().length)
  const ges = gesamt()
  assert.equal(pcs.reduce((n, p) => n + p.erloes, 0), ges.erloes)
  assert.equal(pcs.reduce((n, p) => n + p.kosten, 0), ges.kosten)
})

test('Verschieben ändert nur die Verteilung, nicht das Gesamtergebnis', () => {
  reset()
  const vorher = gesamt()
  // Performance Marketing von E-Commerce in die Zentrale verschieben
  verschiebe('ks-perfmkt', 'pc-zentral')
  assert.equal(pcVon('ks-perfmkt'), 'pc-zentral')
  assert.ok(istVerschoben('ks-perfmkt'))
  assert.equal(anzahlVerschoben(), 1)
  const nachher = gesamt()
  assert.equal(vorher.erloes, nachher.erloes)
  assert.equal(vorher.kosten, nachher.kosten)
  assert.equal(vorher.ergebnis, nachher.ergebnis)
  // E-Commerce besser (Kosten weg), Zentrale schlechter
  const ecom = pcMitKostenstellen().find((p) => p.id === 'pc-ecom')
  assert.ok(!ecom.kostenstellen.some((k) => k.id === 'ks-perfmkt'))
  reset()
})

test('Zurück auf Default = kein Override mehr', () => {
  reset()
  verschiebe('ks-perfmkt', 'pc-zentral')
  verschiebe('ks-perfmkt', 'pc-ecom') // = Default
  assert.equal(istVerschoben('ks-perfmkt'), false)
  assert.equal(anzahlVerschoben(), 0)
})

test('setzeZurueck entfernt alle Overrides', () => {
  verschiebe('ks-it', 'pc-bike')
  verschiebe('ks-hr', 'pc-store')
  assert.ok(anzahlVerschoben() >= 2)
  setzeZurueck()
  assert.equal(anzahlVerschoben(), 0)
})
