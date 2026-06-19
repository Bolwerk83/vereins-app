// =========================================================================
//  SQL-RUNNER —  npm run apply:sql -- <datei.sql> [weitere.sql ...]
//
//  Führt eine oder mehrere .sql-Dateien gegen den MSSQL-Server aus
//  (Verbindung aus server/.env, siehe db.js). Trennt korrekt an GO-Batches
//  (GO ist eine SSMS-Direktive, kein T-SQL — der Treiber kennt es nicht).
//
//  Beispiele:
//    npm run apply:sql -- ../sql/_setup_readonly_login.sql
//    npm run apply:sql -- ../sql/views/*.sql
//
//  Hinweis: Der Login-Setup (CREATE LOGIN/USER) braucht ADMIN-Rechte —
//  dafür kurzzeitig ein Admin-Login in .env eintragen; KPI-Views ebenso.
//  Reine SELECT-KPIs (sql/*.kpi.sql) müssen NICHT "ausgeführt"/installiert
//  werden — die führt das Backend zur Laufzeit aus.
// =========================================================================
import { readFileSync } from 'node:fs'
import { getPool, configBeschreibung } from './db.js'

// Datei in Batches an Zeilen zerlegen, die nur aus "GO" bestehen.
function splitBatches(text) {
  return text
    .split(/^\s*GO\s*(?:\d+)?\s*$/im)   // an reinen GO-Zeilen trennen
    .map((b) => b.trim())
    .filter((b) => b.replace(/\s+/g, '').length > 0)  // leere Batches verwerfen
}

async function run(files) {
  const cfg = configBeschreibung()
  if (!cfg.konfiguriert) {
    console.error('✗ MSSQL nicht konfiguriert — MSSQL_SERVER/MSSQL_DATABASE in server/.env setzen.')
    process.exit(1)
  }
  console.log(`Ziel: ${cfg.server}/${cfg.datenbank} (auth=${cfg.auth})\n`)
  const pool = await getPool()

  for (const file of files) {
    const sqlText = readFileSync(file, 'utf8')
    const batches = splitBatches(sqlText)
    console.log(`▶ ${file}  (${batches.length} Batch${batches.length === 1 ? '' : 'es'})`)
    for (let i = 0; i < batches.length; i++) {
      try {
        const r = await pool.request().batch(batches[i])
        const rows = r.recordset?.length
        console.log(`   ✓ Batch ${i + 1}/${batches.length}${rows != null ? ` — ${rows} Zeile(n)` : ''}`)
        if (rows) console.table(r.recordset.slice(0, 20))
      } catch (e) {
        console.error(`   ✗ Batch ${i + 1}/${batches.length} fehlgeschlagen: ${e.message}`)
        console.error('     Abbruch. Vorherige Batches sind ggf. bereits ausgeführt.')
        process.exit(1)
      }
    }
    console.log('')
  }
  console.log('✓ Fertig.')
  process.exit(0)
}

const files = process.argv.slice(2)
if (!files.length) {
  console.error('Aufruf: npm run apply:sql -- <datei.sql> [weitere.sql ...]')
  process.exit(1)
}
run(files).catch((e) => { console.error('✗', e.message); process.exit(1) })
