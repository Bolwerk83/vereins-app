import './_setup.mjs'
import test from 'node:test'
import assert from 'node:assert/strict'
import { ddl, seed, deltaAlle, existenzPruefung, fehlendeTabellen, skriptPaket, QUELLEN } from '../src/core/sqlGenerator.js'
import { TABELLEN, DIMENSIONEN, FAKTEN } from '../src/core/datenschema.js'

test('Drei Quellen: Demo, MSSQL, Vercel', () => {
  assert.deepEqual(QUELLEN.map((q) => q.id), ['demo', 'mssql', 'vercel'])
})

test('DDL enthält jede Tabelle (MSSQL)', () => {
  const s = ddl('mssql')
  for (const t of TABELLEN) assert.ok(s.includes(t.name), `${t.name} fehlt`)
  assert.ok((s.match(/PRIMARY KEY/g) || []).length >= TABELLEN.length)
})

test('Postgres-DDL nutzt Postgres-Typen', () => {
  const s = ddl('postgres')
  assert.ok(/boolean/.test(s) && /numeric/.test(s) && /timestamptz/.test(s) && /varchar/.test(s))
  assert.ok(!/nvarchar/.test(s) && !/datetime2/.test(s))
})

test('Fremdschlüssel & Geschäftsschlüssel-Indizes werden erzeugt', () => {
  const s = ddl('mssql')
  assert.ok(/FOREIGN KEY/.test(s))
  assert.ok(/CREATE UNIQUE INDEX/.test(s))
})

test('Leere DB → alle Tabellen fehlen (Setup nötig)', () => {
  assert.equal(fehlendeTabellen([], 'mssql').length, TABELLEN.length)
  assert.equal(fehlendeTabellen(TABELLEN.map((t) => t.name), 'mssql').length, 0)
})

test('Existenzprüfung je Dialekt', () => {
  assert.ok(/sys\.tables/.test(existenzPruefung('mssql')))
  assert.ok(/information_schema\.tables/.test(existenzPruefung('postgres')))
})

test('Delta: MSSQL MERGE, Postgres ON CONFLICT', () => {
  assert.ok(/MERGE/.test(deltaAlle('mssql')))
  assert.ok(/ON CONFLICT/.test(deltaAlle('postgres')))
})

test('Seed befüllt Schlüssel-Dimensionen (Sponsoring-Konditionsart enthalten)', () => {
  const s = seed('mssql')
  assert.ok(/DimKonditionsart/.test(s))
  assert.ok(/sponsoring/i.test(s))
})

test('skriptPaket liefert alle Teile', () => {
  const p = skriptPaket('postgres')
  assert.ok(p.setup && p.seed && p.delta && p.existenz)
})

test('Faktentabellen haben Audit-Spalten für Delta (AktualisiertAm)', () => {
  for (const f of FAKTEN) assert.ok(f.spalten.some((c) => c.n === 'AktualisiertAm'), `${f.name} ohne Wasserzeichen`)
})

test('Alle Tabellen haben Versions-/Bearbeitungsspalten (optimistisches Sperren)', () => {
  for (const t of TABELLEN) for (const sp of ['RowVersion', 'GeaendertVon', 'GeaendertAm'])
    assert.ok(t.spalten.some((c) => c.n === sp), `${t.name} ohne ${sp}`)
})

test('Bug2: Postgres-Seed rendert Boolean als TRUE/FALSE, MSSQL als 0/1', () => {
  const pg = seed('postgres'), ms = seed('mssql')
  // DimKonditionsart.IstSonderfall ist boolean — Postgres castet 0/1 NICHT zu boolean.
  assert.ok(/'Normalverkauf', FALSE/.test(pg) && /'Sponsoring \(100%\)', TRUE/.test(pg), 'Postgres-Boolean nicht TRUE/FALSE')
  assert.ok(/'Sponsoring \(100%\)', 1,/.test(ms), 'MSSQL-bit muss 0/1 bleiben')
})

test('Bug1: nullbarer Geschäftsschlüssel wird NULL-sicher gemergt', () => {
  // FactKPIWert.Dimension ist biz + nullable.
  const ms = deltaAlle('mssql'), pg = ddl('postgres')
  assert.ok(/T\.Dimension IS NULL AND S\.Dimension IS NULL/.test(ms), 'MSSQL-MERGE nicht NULL-sicher')
  assert.ok(/ux_factkpiwert_biz[^;]*NULLS NOT DISTINCT/.test(pg), 'Postgres-Index ohne NULLS NOT DISTINCT')
})
