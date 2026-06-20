// =========================================================================
//  REPORTING-BACKEND — bedient den dataProvider-Vertrag (mssql) und das BI.
//
//  Start:  cd server && npm install && npm start        (Port 3001)
//  Test:   npm run test:db                              (Verbindung prüfen)
//  Konfig: server/.env  (siehe .env.example)
//
//  Endpunkte:
//    GET  /api/health           -> Verbindungsstatus (SELECT 1)
//    GET  /api/kpi?periode=2025  -> { kpiId: wert, ... }   (vorhandene SQL-Dateien)
//    GET  /api/kpi/:id/historie  -> [ { periode, wert }, ... ]
//    GET  /api/detail/:key       -> { titel, spalten[], zeilen[][] }
//    POST /api/bi                -> Self-Service-BI-Bericht (Claude)
// =========================================================================
import express from 'express'
import { readFileSync, existsSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'
import { getPool, pingDb, configBeschreibung, sql } from './db.js'
import { beiratAuswertung } from './biAgents.js'

const __dirname = dirname(fileURLToPath(import.meta.url))
const SQL_DIR = join(__dirname, '..', 'sql')

// sqlRef -> kpiId (spiegelt src/core/kpiRegistry.js, Feld sqlRef).
const ROHE_KPIS = {
  nettoumsatz: 'nettoumsatz', bruttoumsatz: 'bruttoumsatz', erloesschmaelerung: 'erloesschmaelerung',
  wareneinsatz: 'wareneinsatz', ebitda: 'ebitda', ebit: 'ebit',
  online_anteil: 'onlineAnteil', retourenquote: 'retourenquote',
  einkaufsvolumen: 'einkaufsvolumen', liefertreue: 'liefertreue',
  ausschuss: 'ausschuss', auslastung: 'auslastung',
  lagerbestand: 'lagerbestand', reichweite: 'reichweite',
  personalkosten: 'personalkosten', fluktuation: 'fluktuation',
  shop_verfuegbarkeit: 'shopVerfuegbarkeit', cash_conversion: 'cashConversion',
  // Kosten- & Leistungsrechnung
  produktionsmenge: 'produktionsmenge', herstellkosten: 'herstellkosten',
  gemeinkosten: 'gemeinkosten', gesamtkosten: 'gesamtkosten',
  // Absatz- & Umsatzprognose
  absatzprognose: 'absatzprognose', umsatzprognose: 'umsatzprognose',
  forecast_genauigkeit: 'forecastGenauigkeit', auftragsbestand: 'auftragsbestand',
  // Umsatz-, Kosten- & Erfolgsplanung
  umsatzplan: 'umsatzplan', kostenplan: 'kostenplan', ebit_plan: 'ebitPlan',
  // Produktionsplanung
  produktionsplan: 'produktionsplan', kapazitaet: 'kapazitaet',
  schichtauslastung: 'schichtauslastung', liefertermintreue: 'liefertermintreue',
  // Bestands- & Supply-Chain-Controlling
  lieferfaehigkeit: 'lieferfaehigkeit', ueberbestand: 'ueberbestand',
  // Finanzbuchhaltung & Abschluss
  abschlussdauer: 'abschlussdauer', rueckstellungen: 'rueckstellungen',
  bilanzsumme: 'bilanzsumme', eigenkapital: 'eigenkapital',
  handelsrechtliches_ergebnis: 'handelsrechtlichesErgebnis', neutrales_ergebnis: 'neutralesErgebnis'
}

const sqlPfad = (ref) => join(SQL_DIR, `${ref}.kpi.sql`)
const hatSql = (ref) => existsSync(sqlPfad(ref))

async function runKpi(ref, periode) {
  const r = await (await getPool()).request()
    .input('periode', sql.NVarChar, periode ?? null)
    .query(readFileSync(sqlPfad(ref), 'utf8'))
  return r.recordset // [{ periode, wert, dimension? }]
}

const app = express()
app.use(express.json())

// --- Health / Verbindungstest -------------------------------------------
app.get('/api/health', async (_req, res) => {
  const cfg = configBeschreibung()
  try {
    const info = await pingDb()
    const fehlend = Object.keys(ROHE_KPIS).filter((ref) => !hatSql(ref))
    res.json({ status: 'ok', verbindung: cfg, server: info,
      sql_vorhanden: Object.keys(ROHE_KPIS).length - fehlend.length,
      sql_fehlend: fehlend })
  } catch (e) {
    res.status(503).json({ status: 'fehler', verbindung: cfg, fehler: String(e.message || e) })
  }
})

// --- Self-Service BI (Claude) -------------------------------------------
app.post('/api/bi', async (req, res) => {
  try {
    const { anforderung, werte } = req.body || {}
    if (!anforderung) return res.status(400).json({ error: 'anforderung fehlt' })
    res.json(await beiratAuswertung(anforderung, werte || {}))
  } catch (e) { res.status(500).json({ error: String(e) }) }
})

// --- Rohe KPI-Werte einer Periode (überspringt fehlende SQL-Dateien) -----
app.get('/api/kpi', async (req, res) => {
  try {
    const out = {}, fehlend = []
    for (const [ref, kpiId] of Object.entries(ROHE_KPIS)) {
      if (!hatSql(ref)) { fehlend.push(ref); continue }
      const rows = await runKpi(ref, req.query.periode)
      out[kpiId] = rows.reduce((s, x) => s + Number(x.wert), 0) // dimension-Zeilen aggregieren
    }
    res.set('X-KPI-Fehlend', fehlend.join(','))
    res.json(out)
  } catch (e) { res.status(500).json({ error: String(e) }) }
})

// --- Historie einer KPI (Ebene 5) ---------------------------------------
app.get('/api/kpi/:id/historie', async (req, res) => {
  try {
    const ref = Object.entries(ROHE_KPIS).find(([, id]) => id === req.params.id)?.[0]
    if (!ref) return res.status(404).json({ error: 'unbekannte KPI' })
    if (!hatSql(ref)) return res.status(404).json({ error: `SQL fehlt: ${ref}.kpi.sql` })
    res.json(await runKpi(ref, null))
  } catch (e) { res.status(500).json({ error: String(e) }) }
})

// --- Detailbericht (Ebene 4) --------------------------------------------
app.get('/api/detail/:key', async (req, res) => {
  try {
    const p = join(SQL_DIR, `detail_${req.params.key}.sql`)
    if (!existsSync(p)) return res.status(404).json({ error: `SQL fehlt: detail_${req.params.key}.sql` })
    const r = await (await getPool()).request().query(readFileSync(p, 'utf8'))
    const spalten = Object.keys(r.recordset[0] ?? {})
    res.json({ titel: req.params.key, spalten, zeilen: r.recordset.map((row) => spalten.map((c) => row[c])) })
  } catch (e) { res.status(500).json({ error: String(e) }) }
})

const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
  const c = configBeschreibung()
  console.log(`Reporting-Backend auf :${PORT}`)
  console.log(`MSSQL: ${c.konfiguriert ? `${c.server}/${c.datenbank} (auth=${c.auth}, encrypt=${c.encrypt})` : 'NICHT konfiguriert — server/.env ausfüllen'}`)
  console.log(`Health-Check:  http://localhost:${PORT}/api/health`)
})
