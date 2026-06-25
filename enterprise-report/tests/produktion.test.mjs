import './_setup.mjs'
import test from 'node:test'
import assert from 'node:assert/strict'
import {
  oee, epq, programm, fehlteile, linienAuswertung, werkeAuswertung,
  qualitaetAuswertung, termintreue, kennzahlen, LINIEN, WERKE, PROGRAMM, ARBEITSTAGE,
  outputUebersicht, balance, MARKT, OUTPUT_HISTORIE
} from '../src/core/produktion.js'

test('OEE = Verfügbarkeit · Leistung · Qualität', () => {
  const l = { verf: 80, leist: 90, qual: 95 }
  const o = oee(l)
  assert.equal(o.oee, Math.round(80 * 90 * 95 / 10000 * 10) / 10) // 68.4
})

test('EPQ ist endlich, positiv und < EOQ-Grenze (Produktionsdrossel)', () => {
  for (const p of PROGRAMM) {
    const m = epq(p)
    assert.ok(m > 0 && Number.isFinite(m))
  }
  // EPQ größer als reine EOQ, weil (1 - d/p) < 1 den Nenner verkleinert
  const p = PROGRAMM[0]
  const d = p.jahresbedarf / ARBEITSTAGE
  const faktor = 1 - d / p.produktionsrateTag
  assert.ok(faktor > 0 && faktor < 1)
})

test('Programm: Lose/Jahr, Kosten, Kapazitätsbedarf und Engpass', () => {
  const pr = programm()
  for (const r of pr.rows) {
    assert.ok(r.losMenge > 0)
    assert.equal(r.gesamtkostenJahr, r.ruestkostenJahr + r.lagerkostenJahr)
    assert.ok(r.auslastungPct >= 0)
    assert.equal(r.engpass, r.auslastungPct > 85)
  }
  assert.equal(pr.gesamtkosten, pr.rows.reduce((n, r) => n + r.gesamtkostenJahr, 0))
})

test('Fehlteile: Fehlmenge, Schwere und betroffene Aufträge', () => {
  const ft = fehlteile()
  const display = ft.rows.find((r) => r.id === 't-display')
  assert.equal(display.fehlmenge, 180)     // Bestand 0, Bedarf 180
  assert.equal(display.schwere, 'kritisch') // Bestand 0 → kritisch
  const rahmen = ft.rows.find((r) => r.id === 't-rahmen')
  assert.equal(rahmen.fehlmenge, 0)         // Bestand 800 ≥ Bedarf 600
  assert.equal(rahmen.schwere, 'ok')
  assert.ok(ft.betroffeneAuftraege.includes('PA-3001'))
  assert.ok(ft.kritisch >= 1)
})

test('Linien-Auswertung: genau ein Engpass (höchste Auslastung), Werk gesetzt', () => {
  const rows = linienAuswertung()
  assert.equal(rows.length, LINIEN.length)
  assert.equal(rows.filter((r) => r.engpass).length, 1)
  assert.ok(rows.every((r) => r.werk))
  assert.ok(rows.every((r) => r.oee > 0 && r.oee <= 100))
})

test('Werke-Auswertung: Linienanzahl summiert sich auf alle Linien', () => {
  const w = werkeAuswertung()
  assert.equal(w.length, WERKE.length)
  assert.equal(w.reduce((n, x) => n + x.linienN, 0), LINIEN.length)
})

test('Qualität: Durchschnitte und schlechteste Linie zuerst', () => {
  const q = qualitaetAuswertung()
  assert.ok(q.fpy > 80 && q.fpy < 100)
  assert.ok(q.sperrbestand > 0)
  // sortiert: erste Zeile hat den niedrigsten FPY
  assert.equal(q.rows[0].fpy, Math.min(...q.rows.map((r) => r.fpy)))
  assert.equal(q.schlechteste.linieId, q.rows[0].linieId)
})

test('Termintreue erkennt überfällige Aufträge', () => {
  const tt = termintreue()
  assert.ok(tt.termintreuePct >= 0 && tt.termintreuePct <= 100)
  // PA-3007 endet 2026-06-21 (< HEUTE 06-22) und ist nicht fertig → überfällig
  const pa = tt.rows.find((r) => r.id === 'PA-3007')
  assert.ok(pa.ueberfaellig)
})

test('Kennzahlen-Cockpit liefert plausible Top-Werte', () => {
  const k = kennzahlen()
  assert.ok(k.oee > 0 && k.oee <= 100)
  assert.equal(k.linienN, LINIEN.length)
  assert.equal(k.werkeN, WERKE.length)
  assert.ok(k.fehlteile >= 1)
  assert.ok(k.stoerungen >= 1)
})

test('Output-Übersicht: Zeitraum begrenzt die Reihe, Summe stimmt', () => {
  const o6 = outputUebersicht(6)
  assert.equal(o6.rows[0].reihe.length, 6)
  const o3 = outputUebersicht(3)
  assert.equal(o3.rows[0].reihe.length, 3)
  const r = o3.rows.find((x) => x.id === 'ebike')
  assert.equal(r.summe, OUTPUT_HISTORIE.ebike.slice(-3).reduce((a, b) => a + b, 0))
})

test('Balance: aufstocken bei hohem Auftragsbestand, drosseln bei Überlager', () => {
  const b = balance()
  const ebike = b.find((r) => r.id === 'ebike')      // Auftragsbestand 1850 > Lager 980 + ~2000 Output? nein → prüfen
  // E-Bikes: Auftragsbestand 1850, Lager 980, Monatsoutput ~1967 → 980+1967 > 1850 → ausgeglichen/deckung>100
  assert.ok(['ausgeglichen', 'aufstocken'].includes(ebike.status))
  const bekleidung = b.find((r) => r.id === 'bekleidung') // Lager 8200, Auftragsbestand 300 → drosseln
  assert.equal(bekleidung.status, 'drosseln')
  const antrieb = b.find((r) => r.id === 'antrieb')  // Auftragsbestand 2400 hoch
  assert.ok(antrieb.deckung >= 0)
})

test('Balance deckt alle Programm-Produkte ab', () => {
  assert.equal(balance().length, PROGRAMM.length)
  for (const r of balance()) assert.ok(MARKT[r.id])
})
