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
//    GET  /api/benutzer/:login/rechte -> effektive Rechte (sec.vw_BenutzerRechte)
//    GET  /api/gruppen           -> Gruppen inkl. Bereiche/Kontext/Mitglieder
//    POST /api/bi                -> Self-Service-BI-Bericht (Claude)
// =========================================================================
import express from 'express'
import { readFileSync, existsSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'
import { getPool, pingDb, configBeschreibung, sql } from './db.js'
import { beiratAuswertung, smartMassnahmen } from './biAgents.js'
import { KPI } from '../src/core/kpiRegistry.js'

const __dirname = dirname(fileURLToPath(import.meta.url))
const SQL_DIR = join(__dirname, '..', 'sql')

// sqlRef -> kpiId — SINGLE SOURCE OF TRUTH: direkt aus der KPI-Registry
// abgeleitet (jede gemessene KPI hat ein sqlRef). Keine Doppelpflege mehr.
const ROHE_KPIS = Object.fromEntries(
  Object.values(KPI).filter((k) => k.sqlRef).map((k) => [k.sqlRef, k.id])
)

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

// Controller-Auswertung eines Berichts -> SMART-Maßnahmen (Claude).
app.post('/api/massnahmen', async (req, res) => {
  try {
    const { kontext, werte } = req.body || {}
    res.json(await smartMassnahmen(kontext || 'Bericht', werte || {}))
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

// --- Detail-Perspektive (Ebene-4-Sprungpunkt) ---------------------------
app.get('/api/perspektive/:key', async (req, res) => {
  try {
    const p = join(SQL_DIR, `perspektive_${req.params.key}.sql`)
    if (!existsSync(p)) return res.status(404).json({ error: `SQL fehlt: perspektive_${req.params.key}.sql` })
    const r = await (await getPool()).request().query(readFileSync(p, 'utf8'))
    const spalten = Object.keys(r.recordset[0] ?? {})
    res.json({ titel: req.params.key, spalten, zeilen: r.recordset.map((row) => spalten.map((c) => row[c])) })
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

// --- Rollen & Rechte: effektive Rechte eines Benutzers (sec.vw_BenutzerRechte)
//     Liefert ein rolle-kompatibles Objekt wie effektiveRolleFuerName() im Tool.
app.get('/api/benutzer/:login/rechte', async (req, res) => {
  try {
    const r = await (await getPool()).request()
      .input('login', sql.NVarChar, req.params.login)
      .query('SELECT AlleBereiche, Bereiche, Kontext, Gruppen FROM sec.vw_BenutzerRechte WHERE Login = @login')
    const row = r.recordset[0]
    if (!row) return res.status(404).json({ error: 'kein Mitglied dieses Namens' })
    res.json({
      name: req.params.login,
      bereiche: row.AlleBereiche ? '*' : (row.Bereiche ? row.Bereiche.split(',') : []),
      kontext: row.Kontext ? row.Kontext.split(',') : [],
      gruppen: row.Gruppen ? row.Gruppen.split(' + ') : []
    })
  } catch (e) { res.status(500).json({ error: String(e.message || e) }) }
})

// --- Alle Gruppen inkl. Bereiche/Kontext/Mitglieder (für DB-gestützte Verwaltung)
app.get('/api/gruppen', async (_req, res) => {
  try {
    const pool = await getPool()
    const g = (await pool.request().query('SELECT GruppeId, Code, Name, Beschreibung, AlleBereiche, IstVorlage FROM sec.Gruppe ORDER BY GruppeId')).recordset
    const b = (await pool.request().query('SELECT GruppeId, BereichCode FROM sec.GruppeBereich')).recordset
    const k = (await pool.request().query('SELECT GruppeId, KontextTag FROM sec.GruppeKontext')).recordset
    const m = (await pool.request().query('SELECT GruppeId, Login FROM sec.GruppeMitglied')).recordset
    res.json(g.map((row) => ({
      id: row.Code, name: row.Name, beschreibung: row.Beschreibung, system: !!row.IstVorlage,
      bereiche: row.AlleBereiche ? '*' : b.filter((x) => x.GruppeId === row.GruppeId).map((x) => x.BereichCode),
      kontext: k.filter((x) => x.GruppeId === row.GruppeId).map((x) => x.KontextTag),
      mitglieder: m.filter((x) => x.GruppeId === row.GruppeId).map((x) => x.Login)
    })))
  } catch (e) { res.status(500).json({ error: String(e.message || e) }) }
})

const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
  const c = configBeschreibung()
  console.log(`Reporting-Backend auf :${PORT}`)
  console.log(`MSSQL: ${c.konfiguriert ? `${c.server}/${c.datenbank} (auth=${c.auth}, encrypt=${c.encrypt})` : 'NICHT konfiguriert — server/.env ausfüllen'}`)
  console.log(`Health-Check:  http://localhost:${PORT}/api/health`)
})
