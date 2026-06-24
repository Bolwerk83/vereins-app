// =========================================================================
//  SQL-GENERATOR — erzeugt aus dem DATENSCHEMA die Skripte für den Zielserver:
//   • DDL (CREATE TABLE + FK + Unique-Index auf Geschäftsschlüssel)
//   • Existenzprüfung (welche Tabellen fehlen → Setup starten)
//   • Seed-Inserts (Demo-Befüllung)
//   • Delta-Beladung (MERGE/Upsert auf Geschäftsschlüssel, Wasserzeichen)
//  Zwei Dialekte: 'mssql' (SQL Server) und 'postgres' (Vercel Postgres/Neon).
// =========================================================================
import { DIMENSIONEN, FAKTEN, TABELLEN, SCHEMA_VERSION } from './datenschema.js'

export const QUELLEN = [
  { id: 'demo', name: 'Demo (Mock)', dialekt: null, hinweis: 'Eingebaute Beispieldaten — keine Verbindung nötig. Ideal zum Ausprobieren.' },
  { id: 'mssql', name: 'MSSQL (SQL Server)', dialekt: 'mssql', hinweis: 'Eigener SQL Server / Azure SQL. Skripte unten ausführen; Reporting liest über den SQL-Vertrag.' },
  { id: 'vercel', name: 'Vercel (Postgres)', dialekt: 'postgres', hinweis: 'Vercel Postgres / Neon. Postgres-Skripte ausführen; Verbindung via Umgebungsvariable.' },
]

// --- Typ-Mapping MSSQL → Postgres ----------------------------------------
function pgTyp(t) {
  const m = t.match(/^(\w+)(\(.*\))?$/)
  const base = m[1].toLowerCase(), arg = m[2] || ''
  const map = { nvarchar: `varchar${arg}`, varchar: `varchar${arg}`, bit: 'boolean', datetime2: 'timestamptz', tinyint: 'smallint', decimal: `numeric${arg}`, int: 'integer', smallint: 'smallint', bigint: 'bigint', date: 'date' }
  return map[base] || t
}
const typ = (t, d) => (d === 'postgres' ? pgTyp(t) : t)
const q = (name, d) => (d === 'postgres' ? name.toLowerCase() : name) // Postgres: kleinschreibung

function spaltenZeile(c, d) {
  return `  ${q(c.n, d)} ${typ(c.t, d)}${c.null ? '' : ' NOT NULL'}`
}

/** CREATE TABLE für eine Tabelle. */
function createTable(tab, d) {
  const pk = tab.spalten.find((c) => c.pk)
  const cols = tab.spalten.map((c) => spaltenZeile(c, d))
  if (pk) cols.push(`  CONSTRAINT ${q('PK_' + tab.name, d)} PRIMARY KEY (${q(pk.n, d)})`)
  const ifnot = d === 'postgres' ? 'CREATE TABLE IF NOT EXISTS' : 'IF OBJECT_ID(N\'' + tab.name + '\') IS NULL\nCREATE TABLE'
  return `${ifnot} ${q(tab.name, d)} (\n${cols.join(',\n')}\n);`
}

/** Fremdschlüssel + Unique-Index auf Geschäftsschlüssel (für Delta-Upsert). */
function constraints(tab, d) {
  const out = []
  for (const c of tab.spalten.filter((x) => x.fk)) {
    const [zt, zc] = c.fk.split('.')
    out.push(`ALTER TABLE ${q(tab.name, d)} ADD CONSTRAINT ${q('FK_' + tab.name + '_' + c.n, d)} FOREIGN KEY (${q(c.n, d)}) REFERENCES ${q(zt, d)}(${q(zc, d)});`)
  }
  const biz = tab.spalten.filter((x) => x.biz).map((x) => q(x.n, d))
  if (biz.length) out.push(`CREATE UNIQUE INDEX ${q('UX_' + tab.name + '_BIZ', d)} ON ${q(tab.name, d)} (${biz.join(', ')});`)
  return out.join('\n')
}

/** Vollständiges Setup-Skript (alle Tabellen + Constraints). */
export function ddl(dialekt = 'mssql') {
  const kopf = `-- ============================================================\n-- Enterprise Report — DWH-Setup (${dialekt}) · Schema ${SCHEMA_VERSION}\n-- Reihenfolge: Dimensionen, dann Fakten, dann Beziehungen.\n-- ============================================================\n`
  const tabellen = TABELLEN.map((t) => `-- ${t.name}: ${t.beschreibung}\n${createTable(t, dialekt)}`).join('\n\n')
  const bez = TABELLEN.map((t) => constraints(t, dialekt)).filter(Boolean).join('\n')
  return `${kopf}\n${tabellen}\n\n-- Beziehungen & Geschäftsschlüssel-Indizes\n${bez}\n`
}

/** Query: welche Tabellen existieren bereits? (App vergleicht mit TABELLEN.) */
export function existenzPruefung(dialekt = 'mssql') {
  return dialekt === 'postgres'
    ? `SELECT table_name AS name FROM information_schema.tables WHERE table_schema = 'public';`
    : `SELECT name FROM sys.tables ORDER BY name;`
}

/** Liefert die fehlenden Tabellen aus einer Liste vorhandener Namen. */
export function fehlendeTabellen(vorhanden = [], dialekt = 'mssql') {
  const set = new Set(vorhanden.map((n) => String(n).toLowerCase()))
  return TABELLEN.filter((t) => !set.has((dialekt === 'postgres' ? t.name.toLowerCase() : t.name).toLowerCase())).map((t) => t.name)
}

// --- Seed (Demo-Befüllung) -----------------------------------------------
const SEED = {
  DimKanal: [
    { KanalKey: 1, KanalId: 'organic', Kanal: 'Organische Suche', Kanalgruppe: 'organic' },
    { KanalKey: 2, KanalId: 'paid', Kanal: 'Google Ads', Kanalgruppe: 'paid' },
    { KanalKey: 3, KanalId: 'social', Kanal: 'Social', Kanalgruppe: 'social' },
    { KanalKey: 4, KanalId: 'direct', Kanal: 'Direkt', Kanalgruppe: 'direct' },
    { KanalKey: 5, KanalId: 'email', Kanal: 'Newsletter', Kanalgruppe: 'email' },
  ],
  DimKonditionsart: [
    { KonditionsartKey: 1, KonditionsartId: 'normal', Bezeichnung: 'Normalverkauf', IstSonderfall: 0, RabattProzent: 0 },
    { KonditionsartKey: 2, KonditionsartId: 'sponsoring', Bezeichnung: 'Sponsoring (100%)', IstSonderfall: 1, RabattProzent: 100 },
    { KonditionsartKey: 3, KonditionsartId: 'aktion', Bezeichnung: 'Aktion/Rabatt (>=50%)', IstSonderfall: 1, RabattProzent: 50 },
    { KonditionsartKey: 4, KonditionsartId: 'muster', Bezeichnung: 'Muster/Freiware & Garantie', IstSonderfall: 1, RabattProzent: 100 },
    { KonditionsartKey: 5, KonditionsartId: 'personal', Bezeichnung: 'Personalkauf & Intern/IC', IstSonderfall: 1, RabattProzent: 30 },
  ],
  DimWarengruppe: [
    { WarengruppeKey: 1, WarengruppeId: 'ebike', Bezeichnung: 'E-Bikes', Bereich: 'raeder' },
    { WarengruppeKey: 2, WarengruppeId: 'city', Bezeichnung: 'City/Trekking', Bereich: 'raeder' },
    { WarengruppeKey: 3, WarengruppeId: 'teile', Bezeichnung: 'Teile & Zubehör', Bereich: 'teile_zub' },
    { WarengruppeKey: 4, WarengruppeId: 'bekleidung', Bezeichnung: 'Bekleidung', Bereich: 'bekleidung' },
  ],
  DimStandort: [
    { StandortKey: 1, StandortId: 'online', Name: 'Onlineshop', Typ: 'Online', Region: 'DE', FlaecheQm: null, OeffnungKalenderId: 'onlineshop' },
    { StandortKey: 2, StandortId: 'fil_koeln', Name: 'Filiale Köln', Typ: 'Filiale', Region: 'West', FlaecheQm: 620, OeffnungKalenderId: 'filiale' },
    { StandortKey: 3, StandortId: 'fil_muc', Name: 'Filiale München', Typ: 'Filiale', Region: 'Süd', FlaecheQm: 540, OeffnungKalenderId: 'filiale' },
  ],
}

const sqlWert = (v) => (v === null || v === undefined ? 'NULL' : typeof v === 'number' ? String(v) : `N'${String(v).replace(/'/g, "''")}'`)
const sqlWertPg = (v) => (v === null || v === undefined ? 'NULL' : typeof v === 'number' ? String(v) : `'${String(v).replace(/'/g, "''")}'`)

/** Seed-Inserts (Demo-Befüllung) für die Schlüssel-Dimensionen. */
export function seed(dialekt = 'mssql') {
  const wf = dialekt === 'postgres' ? sqlWertPg : sqlWert
  const teile = [`-- Seed / Demo-Befüllung (${dialekt}) · Schema ${SCHEMA_VERSION}`]
  for (const [tab, rows] of Object.entries(SEED)) {
    const cols = Object.keys(rows[0])
    const vals = rows.map((r) => `(${cols.map((c) => wf(r[c])).join(', ')})`).join(',\n  ')
    teile.push(`INSERT INTO ${q(tab, dialekt)} (${cols.map((c) => q(c, dialekt)).join(', ')}) VALUES\n  ${vals};`)
  }
  teile.push(`-- DimDatum, DimProdukt, DimKPI und die Faktentabellen werden aus den Quellsystemen\n-- per ETL/Delta-Beladung befüllt (siehe Delta-Skript). DimKPI spiegelt die kpiRegistry.`)
  return teile.join('\n\n') + '\n'
}

// --- Delta-Beladung ------------------------------------------------------
/** Upsert-/Merge-Template für eine Faktentabelle (Wasserzeichen @SeitAktualisiert). */
export function deltaBeladung(faktName, dialekt = 'mssql') {
  const f = FAKTEN.find((x) => x.name === faktName)
  if (!f) return ''
  const biz = f.spalten.filter((c) => c.biz).map((c) => c.n)
  const mess = f.spalten.filter((c) => !c.biz && !c.pk).map((c) => c.n)
  const stg = (dialekt === 'postgres' ? f.name.toLowerCase() : f.name) + '_stg'
  if (!biz.length) return `-- ${f.name}: kein Geschäftsschlüssel definiert — Delta manuell.`
  if (dialekt === 'postgres') {
    const set = mess.map((c) => `${c.toLowerCase()} = EXCLUDED.${c.toLowerCase()}`).join(', ')
    return `-- Delta ${f.name} (Postgres): Staging '${stg}' laden (nur AktualisiertAm > :seit), dann:\nINSERT INTO ${f.name.toLowerCase()} (${f.spalten.map((c) => c.n.toLowerCase()).join(', ')})\nSELECT ${f.spalten.map((c) => c.n.toLowerCase()).join(', ')} FROM ${stg}\nON CONFLICT (${biz.map((c) => c.toLowerCase()).join(', ')}) DO UPDATE SET ${set};`
  }
  const on = biz.map((c) => `T.${c} = S.${c}`).join(' AND ')
  const upd = mess.map((c) => `T.${c} = S.${c}`).join(', ')
  const ins = f.spalten.map((c) => c.n)
  return `-- Delta ${f.name} (MSSQL): Staging '${stg}' laden (nur AktualisiertAm > @SeitAktualisiert), dann MERGE:\nMERGE ${f.name} AS T\nUSING ${stg} AS S ON (${on})\nWHEN MATCHED THEN UPDATE SET ${upd}\nWHEN NOT MATCHED THEN INSERT (${ins.join(', ')}) VALUES (${ins.map((c) => 'S.' + c).join(', ')});`
}

/** Delta-Skript für alle Faktentabellen. */
export function deltaAlle(dialekt = 'mssql') {
  return `-- ============================================================\n-- Delta-Beladung (${dialekt}) — inkrementell über Wasserzeichen 'AktualisiertAm'.\n-- Ablauf je Tabelle: Staging füllen (nur geänderte Zeilen) → MERGE/Upsert.\n-- ============================================================\n\n` +
    FAKTEN.map((f) => deltaBeladung(f.name, dialekt)).join('\n\n') + '\n'
}

/** Komplettpaket für einen Dialekt. */
export function skriptPaket(dialekt = 'mssql') {
  return { setup: ddl(dialekt), seed: seed(dialekt), delta: deltaAlle(dialekt), existenz: existenzPruefung(dialekt) }
}
