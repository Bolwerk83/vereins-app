import './_setup.mjs'
import test from 'node:test'
import assert from 'node:assert/strict'
import {
  trendDaten,
  AENDERUNGEN,
  anomalien,
  QUALITAET_ERFASSER,
  pivotDaten,
} from '../src/core/detailAnalyse.js'

// ── trendDaten ────────────────────────────────────────────────────────────

test('trendDaten liefert mindestens 10 Artikel', () => {
  const d = trendDaten()
  assert.ok(d.length >= 10)
})

test('jeder Trend-Eintrag hat Pflichtfelder', () => {
  for (const a of trendDaten()) {
    assert.ok(a.id,    `id fehlt bei ${a.name}`)
    assert.ok(a.name,  `name fehlt bei ${a.id}`)
    assert.ok(a.kat,   `kat fehlt bei ${a.id}`)
    assert.ok(typeof a.preis  === 'number', `preis fehlt bei ${a.id}`)
    assert.ok(typeof a.heute  === 'number', `heute fehlt bei ${a.id}`)
    assert.ok(typeof a.gestern === 'number', `gestern fehlt bei ${a.id}`)
    assert.ok(typeof a.delta  === 'number', `delta fehlt bei ${a.id}`)
    assert.ok(typeof a.deltaPct === 'number', `deltaPct fehlt bei ${a.id}`)
    assert.ok(typeof a.bst    === 'number', `bst fehlt bei ${a.id}`)
    assert.ok(typeof a.bstAlarm === 'boolean', `bstAlarm fehlt bei ${a.id}`)
    assert.ok(typeof a.spike  === 'boolean', `spike fehlt bei ${a.id}`)
    assert.ok(Array.isArray(a.reihe), `reihe fehlt bei ${a.id}`)
  }
})

test('delta = heute − gestern', () => {
  for (const a of trendDaten()) {
    assert.equal(a.delta, a.heute - a.gestern)
  }
})

test('deltaPct ist korrekt berechnet', () => {
  for (const a of trendDaten()) {
    if (a.gestern === 0) continue
    const erwartet = Math.round((a.heute - a.gestern) / a.gestern * 100)
    assert.equal(a.deltaPct, erwartet, `deltaPct falsch bei ${a.id}`)
  }
})

test('bstAlarm wenn Bestand < Mindestbestand', () => {
  for (const a of trendDaten()) {
    if (a.bstAlarm) {
      assert.ok(a.bst < a.minBst, `bstAlarm fälschlicherweise bei ${a.id}`)
    }
  }
})

test('Reihe hat 14 Datenpunkte', () => {
  for (const a of trendDaten()) {
    assert.equal(a.reihe.length, 14, `Reihenlänge falsch bei ${a.id}`)
  }
})

test('sortiert nach stärkstem |deltaPct| absteigend', () => {
  const d = trendDaten()
  for (let i = 1; i < d.length; i++) {
    assert.ok(
      Math.abs(d[i - 1].deltaPct) >= Math.abs(d[i].deltaPct),
      `Reihenfolge falsch bei Index ${i}`
    )
  }
})

test('Ergebnis ist deterministisch (gleicher Aufruf, gleiche Daten)', () => {
  const a = trendDaten()
  const b = trendDaten()
  assert.deepEqual(a.map((x) => x.id),    b.map((x) => x.id))
  assert.deepEqual(a.map((x) => x.delta), b.map((x) => x.delta))
})

// ── AENDERUNGEN ──────────────────────────────────────────────────────────

test('AENDERUNGEN ist ein nicht-leeres Array', () => {
  assert.ok(Array.isArray(AENDERUNGEN) && AENDERUNGEN.length > 0)
})

test('jeder Änderungseintrag hat Pflichtfelder', () => {
  for (const a of AENDERUNGEN) {
    assert.ok(a.ts,     `ts fehlt`)
    assert.ok(a.typ,    `typ fehlt`)
    assert.ok(a.obj,    `obj fehlt`)
    assert.ok(a.detail, `detail fehlt`)
    assert.ok(a.erf,    `erf fehlt`)
    assert.ok(['g', 'a', 'r'].includes(a.s), `ungültiger Status: ${a.s}`)
  }
})

// ── anomalien ─────────────────────────────────────────────────────────────

test('anomalien liefert Array', () => {
  assert.ok(Array.isArray(anomalien()))
})

test('jede Anomalie hat Pflichtfelder', () => {
  for (const a of anomalien()) {
    assert.ok(a.art,     `art fehlt`)
    assert.ok(a.schwere, `schwere fehlt`)
    assert.ok(a.text,    `text fehlt`)
    assert.ok(a.aktion,  `aktion fehlt`)
    assert.ok(['hoch', 'mittel', 'gering'].includes(a.schwere), `ungültige Schwere: ${a.schwere}`)
    assert.ok(['g', 'a', 'r', 'n'].includes(a.s), `ungültiger Status: ${a.s}`)
  }
})

test('Bestandsalarme aus trendDaten landen als Anomalien', () => {
  const alarms = trendDaten().filter((a) => a.bstAlarm)
  if (alarms.length === 0) return
  const anom = anomalien()
  const bestandAnom = anom.filter((a) => a.art === 'Bestand-Alarm')
  assert.equal(bestandAnom.length, alarms.length)
})

test('Spikes aus trendDaten landen als Anomalien', () => {
  const spikes = trendDaten().filter((a) => a.spike)
  if (spikes.length === 0) return
  const anom = anomalien()
  const spikeAnom = anom.filter((a) => a.art === 'Umsatz-Spike')
  assert.equal(spikeAnom.length, spikes.length)
})

// ── QUALITAET_ERFASSER ────────────────────────────────────────────────────

test('QUALITAET_ERFASSER ist ein nicht-leeres Array', () => {
  assert.ok(Array.isArray(QUALITAET_ERFASSER) && QUALITAET_ERFASSER.length > 0)
})

test('jeder Erfassereintrag hat Pflichtfelder', () => {
  for (const e of QUALITAET_ERFASSER) {
    assert.ok(e.name,                       `name fehlt`)
    assert.ok(typeof e.eintr === 'number',  `eintr fehlt`)
    assert.ok(typeof e.korr  === 'number',  `korr fehlt`)
    assert.ok(typeof e.fehler === 'number', `fehler fehlt`)
    assert.ok(typeof e.vollst === 'number', `vollst fehlt`)
    assert.ok(typeof e.avgMin === 'number', `avgMin fehlt`)
    assert.ok(e.letzt,                      `letzt fehlt`)
    assert.ok(e.vollst >= 0 && e.vollst <= 100, `vollst außerhalb 0–100: ${e.vollst}`)
    assert.ok(e.korr  <= e.eintr, `Korrekturen (${e.korr}) > Erfassungen (${e.eintr}) bei ${e.name}`)
    assert.ok(e.fehler <= e.eintr, `Fehler > Erfassungen bei ${e.name}`)
  }
})

// ── pivotDaten ────────────────────────────────────────────────────────────

test('pivotDaten(kat, umsatz) liefert Array mit anteilPct-Summe ~100', () => {
  const rows = pivotDaten('kat', 'umsatz')
  assert.ok(rows.length > 0)
  const sum = rows.reduce((s, r) => s + r.anteilPct, 0)
  assert.ok(Math.abs(sum - 100) < 1, `Anteil-Summe: ${sum} (erwartet ~100)`)
})

test('pivotDaten(erf, menge) aggregiert Menge korrekt', () => {
  const byErf = pivotDaten('erf', 'menge')
  const gesamtPivot = byErf.reduce((s, r) => s + r.menge, 0)
  const gesamtTrend = trendDaten().reduce((s, a) => s + a.heute, 0)
  assert.equal(gesamtPivot, gesamtTrend, 'Menge in Pivot stimmt nicht mit trendDaten überein')
})

test('pivotDaten sortiert nach Umsatz absteigend', () => {
  const rows = pivotDaten('kat', 'umsatz')
  for (let i = 1; i < rows.length; i++) {
    assert.ok(rows[i - 1].umsatz >= rows[i].umsatz, `Sortierung falsch bei Index ${i}`)
  }
})

test('pivotDaten hat korrekte Anzahl je Gruppe', () => {
  const rows = pivotDaten('kat', 'umsatz')
  const sumAnzahl = rows.reduce((s, r) => s + r.anzahl, 0)
  assert.equal(sumAnzahl, trendDaten().length, 'Anzahl-Summe stimmt nicht')
})
