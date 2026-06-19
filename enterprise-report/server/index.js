// =========================================================================
//  MSSQL-BACKEND (Stub) — führt die SQL-Dateien aus sql/ gegen den
//  Microsoft-SQL-Server aus und liefert das, was der dataProvider erwartet.
//
//  Aktivieren:  npm install   (im Ordner server/)   und  node index.js
//  Verbindung:  über .env  (siehe .env.example)
//
//  Vertrag (vom Frontend genutzt):
//    GET /api/kpi?periode=2025            -> { kpiId: wert, ... }  (rohe KPIs)
//    GET /api/kpi/:id/historie            -> [ { periode, wert }, ... ]
//    GET /api/detail/:key                 -> { titel, spalten[], zeilen[][] }
// =========================================================================
import express from 'express'
import sql from 'mssql'
import { readFileSync, existsSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'
import 'dotenv/config'

const __dirname = dirname(fileURLToPath(import.meta.url))
const SQL_DIR = join(__dirname, '..', 'sql')

// Welche rohen KPIs gibt es? (sqlRef -> kpiId). Spiegelt kpiRegistry.js.
// In einer echten Integration aus einer gemeinsamen Manifest-Datei lesen.
const ROHE_KPIS = {
  nettoumsatz: 'nettoumsatz', bruttoumsatz: 'bruttoumsatz', erloesschmaelerung: 'erloesschmaelerung',
  wareneinsatz: 'wareneinsatz', ebitda: 'ebitda', ebit: 'ebit',
  online_anteil: 'onlineAnteil', retourenquote: 'retourenquote',
  einkaufsvolumen: 'einkaufsvolumen', liefertreue: 'liefertreue',
  ausschuss: 'ausschuss', auslastung: 'auslastung',
  lagerbestand: 'lagerbestand', reichweite: 'reichweite',
  personalkosten: 'personalkosten', fluktuation: 'fluktuation',
  shop_verfuegbarkeit: 'shopVerfuegbarkeit', cash_conversion: 'cashConversion'
}

const dbConfig = {
  server: process.env.MSSQL_SERVER,
  database: process.env.MSSQL_DATABASE,
  user: process.env.MSSQL_USER,
  password: process.env.MSSQL_PASSWORD,
  options: { encrypt: true, trustServerCertificate: true }
}

let pool
async function getPool() { return pool ??= await sql.connect(dbConfig) }

function ladeSql(ref) {
  const p = join(SQL_DIR, `${ref}.kpi.sql`)
  if (!existsSync(p)) throw new Error(`SQL fehlt: ${ref}.kpi.sql`)
  return readFileSync(p, 'utf8')
}

async function runKpi(ref, periode) {
  const r = await (await getPool()).request()
    .input('periode', sql.NVarChar, periode ?? null)
    .query(ladeSql(ref))
  return r.recordset // [{ periode, wert, dimension? }]
}

const app = express()

// Alle rohen KPI-Werte einer Periode (für die KPI-Kacheln/Report).
app.get('/api/kpi', async (req, res) => {
  try {
    const out = {}
    for (const [ref, kpiId] of Object.entries(ROHE_KPIS)) {
      const rows = await runKpi(ref, req.query.periode)
      // dimension-Zeilen zur KPI-Summe aggregieren:
      out[kpiId] = rows.reduce((s, x) => s + Number(x.wert), 0)
    }
    res.json(out)
  } catch (e) { res.status(500).json({ error: String(e) }) }
})

// Historie einer KPI (Ebene 5).
app.get('/api/kpi/:id/historie', async (req, res) => {
  try {
    const ref = Object.entries(ROHE_KPIS).find(([, id]) => id === req.params.id)?.[0]
    if (!ref) return res.status(404).json({ error: 'unbekannte KPI' })
    res.json(await runKpi(ref, null))
  } catch (e) { res.status(500).json({ error: String(e) }) }
})

// Detailbericht (Ebene 4).
app.get('/api/detail/:key', async (req, res) => {
  try {
    const r = await (await getPool()).request().query(ladeSql(`detail_${req.params.key}`))
    const spalten = r.recordset.columns ? Object.keys(r.recordset.columns) : Object.keys(r.recordset[0] ?? {})
    res.json({ titel: req.params.key, spalten, zeilen: r.recordset.map((row) => spalten.map((c) => row[c])) })
  } catch (e) { res.status(500).json({ error: String(e) }) }
})

const PORT = process.env.PORT || 3001
app.listen(PORT, () => console.log(`MSSQL-Backend auf :${PORT} (Quelle: ${dbConfig.server || 'nicht konfiguriert'})`))
