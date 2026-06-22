import './_setup.mjs'
import test from 'node:test'
import assert from 'node:assert/strict'
import { trackOeffnung, auswertung, verlauf, reset, aufraeumen, alsCsv } from '../src/core/nutzung.js'

test('Öffnungen werden gezählt und sortiert', () => {
  reset()
  trackOeffnung('marketing'); trackOeffnung('marketing'); trackOeffnung('bestand')
  const a = auswertung()
  assert.equal(a.gesamt, 3)
  assert.equal(a.rows[0].id, 'marketing')
  assert.equal(a.rows[0].count, 2)
  assert.equal(a.aktiveBerichte, 2)
})

test('Heute- und Wochenzähler erfassen aktuelle Öffnungen', () => {
  reset()
  trackOeffnung('segment')
  const a = auswertung()
  assert.equal(a.heuteGesamt, 1)
  assert.equal(a.wocheGesamt, 1)
  assert.equal(a.rows[0].heute, 1)
})

test('leere/ungültige ID wird ignoriert', () => {
  reset()
  trackOeffnung(); trackOeffnung('')
  assert.equal(auswertung().gesamt, 0)
})

test('Verlauf liefert n Tage, heutiger Tag enthält die Öffnung', () => {
  reset()
  trackOeffnung('ergebnis')
  const v = verlauf(14)
  assert.equal(v.length, 14)
  assert.equal(v[v.length - 1].count, 1)
})

test('reset leert die Statistik', () => {
  trackOeffnung('x'); reset()
  assert.equal(auswertung().gesamt, 0)
})

test('aufraeumen findet nie und kaum genutzte Berichte', () => {
  reset()
  trackOeffnung('marketing'); trackOeffnung('marketing'); trackOeffnung('marketing') // 3x = genutzt
  trackOeffnung('bestand') // 1x = kaum
  const a = aufraeumen(['marketing', 'bestand', 'segment', 'forderungen'])
  assert.deepEqual(a.nie.sort(), ['forderungen', 'segment'])
  assert.deepEqual(a.kaum, [{ id: 'bestand', count: 1 }])
})

test('alsCsv liefert Kopfzeile und Datenzeilen mit Label', () => {
  reset()
  trackOeffnung('marketing', 'user:anna')
  const csv = alsCsv((id) => id === 'marketing' ? 'Marketing & Analytics' : id)
  const zeilen = csv.split('\n')
  assert.match(zeilen[0], /^Bericht;ID;Aufrufe;Aufrufe heute/)
  assert.match(zeilen[1], /Marketing & Analytics;marketing;1/)
})

test('unique User pro Bericht/Tag werden gezählt (nicht Aufrufe)', () => {
  reset()
  trackOeffnung('marketing', 'user:anna')
  trackOeffnung('marketing', 'user:anna') // gleicher User, 2. Aufruf
  trackOeffnung('marketing', 'user:bob')
  const a = auswertung()
  const m = a.rows.find((r) => r.id === 'marketing')
  assert.equal(m.count, 3)        // 3 Aufrufe
  assert.equal(m.userHeute, 2)    // aber nur 2 unterschiedliche User
  assert.equal(a.userHeuteGesamt, 2)
})

test('userHeuteGesamt zählt User über mehrere Berichte eindeutig', () => {
  reset()
  trackOeffnung('marketing', 'user:anna')
  trackOeffnung('bestand', 'user:anna') // gleicher User, anderer Bericht
  trackOeffnung('bestand', 'user:bob')
  assert.equal(auswertung().userHeuteGesamt, 2)
})
