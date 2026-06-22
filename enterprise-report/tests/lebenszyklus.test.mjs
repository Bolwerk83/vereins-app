import './_setup.mjs'
import test from 'node:test'
import assert from 'node:assert/strict'
import { phaseProdukt, phaseKunde, produkte, kinderProdukt, kunden, produktPhaseVerteilung,
  bcgVerteilung, quadrantVon, bcgSchwellen, BCG_QUADRANTEN,
  phasenKurve, PRODUKT_PHASEN, KUNDE_PHASEN } from '../src/core/lebenszyklus.js'

test('Produktphase aus Wachstum, Alter und Margentrend', () => {
  assert.equal(phaseProdukt({ alter: 1, wachstum: 40 }), 'einfuehrung')
  assert.equal(phaseProdukt({ alter: 6, wachstum: 9, dbTrend: 0.8 }), 'wachstum')
  assert.equal(phaseProdukt({ alter: 8, wachstum: 1, dbTrend: 0.3 }), 'reife')
  // Margenverfall zieht trotz leicht positivem Wachstum in den Rückgang:
  assert.equal(phaseProdukt({ alter: 12, wachstum: -2, dbTrend: -1.8 }), 'rueckgang')
})

test('Kundenphase aus Beziehungsalter, Wachstum, letzter Bestellung', () => {
  assert.equal(phaseKunde({ alterMonate: 4, wachstum: 22, letzteBestellungTage: 12 }), 'akquise')
  assert.equal(phaseKunde({ alterMonate: 30, wachstum: 15, letzteBestellungTage: 20 }), 'entwicklung')
  assert.equal(phaseKunde({ alterMonate: 84, wachstum: 2, letzteBestellungTage: 25 }), 'bestand')
  assert.equal(phaseKunde({ alterMonate: 90, wachstum: -3, letzteBestellungTage: 210 }), 'gefaehrdet')
  assert.equal(phaseKunde({ alterMonate: 52, wachstum: -40, letzteBestellungTage: 420 }), 'verloren')
})

test('Produkt-Drilldown und Phasenanteile', () => {
  assert.ok(produkte('produkt').every((o) => o.phase))
  assert.ok(kinderProdukt('ebike').length >= 2)
  const v = produktPhaseVerteilung('produkt')
  assert.ok(Math.abs(v.reduce((n, x) => n + x.anteil, 0) - 100) <= 1.5)
})

test('Kunden tragen eine Beziehungsphase', () => {
  assert.ok(kunden().every((k) => k.phase))
})

test('BCG-Quadranten klassifizieren über Wachstum × DB', () => {
  const s = { wachstum: 0, db: 35 }
  assert.equal(quadrantVon({ wachstum: 12, db: 40 }, s), 'star')
  assert.equal(quadrantVon({ wachstum: -2, db: 40 }, s), 'cashcow')
  assert.equal(quadrantVon({ wachstum: 35, db: 20 }, s), 'question')
  assert.equal(quadrantVon({ wachstum: -6, db: 30 }, s), 'dog')
})

test('BCG-Schwelle nimmt den Median der DB-Werte', () => {
  const s = bcgSchwellen(produkte('produkt'))
  assert.equal(s.wachstum, 0)
  assert.ok(s.db > 0)
})

test('Lebenszyklus-Kurve: jedes Objekt einmal, x normiert, Profil steigt dann fällt', () => {
  const { profil, punkte } = phasenKurve(PRODUKT_PHASEN, produkte('produkt'))
  assert.equal(profil.length, PRODUKT_PHASEN.length)
  // jedes Produkt genau einmal als Punkt
  assert.equal(punkte.length, produkte('produkt').length)
  for (const p of punkte) {
    assert.ok(p.x > 0 && p.x < 1, 'x im Einheitsintervall')
    assert.ok(p.hoehe >= 0 && p.hoehe <= 1, 'Höhe normiert')
    assert.ok(p.farbe && p.phase, 'trägt Phase & Farbe')
  }
  // Profil: erst aufsteigend bis zum Peak, danach abfallend
  const peakIdx = profil.indexOf(Math.max(...profil))
  for (let i = 1; i <= peakIdx; i++) assert.ok(profil[i] >= profil[i - 1], 'Aufstieg bis Peak')
  for (let i = peakIdx + 1; i < profil.length; i++) assert.ok(profil[i] <= profil[i - 1], 'Abfall nach Peak')
})

test('Lebenszyklus-Kurve funktioniert auch für die 5 Kundenphasen', () => {
  const { profil, punkte } = phasenKurve(KUNDE_PHASEN, kunden())
  assert.equal(profil.length, 5)
  assert.equal(punkte.length, kunden().length)
})

test('BCG-Verteilung deckt alle Objekte ab und summiert auf Gesamtumsatz', () => {
  const { schwellen, felder } = bcgVerteilung('produkt')
  assert.equal(felder.length, BCG_QUADRANTEN.length)
  const objekte = produkte('produkt')
  // Jedes Objekt liegt in genau einem Feld → Summe der Anzahlen = Gesamtzahl.
  assert.equal(felder.reduce((n, f) => n + f.anzahl, 0), objekte.length)
  const gesUmsatz = +objekte.reduce((n, o) => n + o.umsatz, 0).toFixed(1)
  assert.ok(Math.abs(felder.reduce((n, f) => n + f.umsatz, 0) - gesUmsatz) <= 0.2)
  // Jedes Feld trägt seine Objekte und einen plausiblen Ø-DB.
  for (const f of felder) {
    assert.equal(f.objekte.length, f.anzahl)
    if (f.anzahl) assert.ok(f.dbSchnitt > 0)
    assert.ok(f.objekte.every((o) => quadrantVon(o, schwellen) === f.id))
  }
})
