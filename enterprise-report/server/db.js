// =========================================================================
//  MSSQL-Verbindung — zentral, robust, konfigurierbar über server/.env.
//  Unterstützt: SQL-Login (Standard), Azure-AD-Passwort. Windows-Integrated
//  geht von einem Linux-Backend NICHT (NTLM braucht msnodesqlv8/Windows) —
//  dann SQL-Login oder Azure AD nutzen. Siehe .env.example.
// =========================================================================
import sql from 'mssql'
import 'dotenv/config'

// "SQLPROD01\\REPORTING"  oder  "host,1433"  oder  "host"  zerlegen.
function parseServer(raw) {
  if (!raw) return {}
  let server = raw, instanceName, port
  if (server.includes('\\')) { const [s, i] = server.split('\\'); server = s; instanceName = i }
  if (server.includes(',')) { const [s, p] = server.split(','); server = s; port = Number(p) }
  return { server, instanceName, port }
}

const bool = (v, def = false) => v == null ? def : /^(1|true|yes|ja)$/i.test(v)

export function buildConfig() {
  const { server, instanceName, port } = parseServer(process.env.MSSQL_SERVER)
  const auth = (process.env.MSSQL_AUTH || 'sql').toLowerCase()

  const cfg = {
    server,
    database: process.env.MSSQL_DATABASE,
    port: port || (process.env.MSSQL_PORT ? Number(process.env.MSSQL_PORT) : undefined),
    options: {
      encrypt: bool(process.env.MSSQL_ENCRYPT, true),                 // Azure: true
      trustServerCertificate: bool(process.env.MSSQL_TRUST_CERT, true), // self-signed lokal: true
      instanceName,
      enableArithAbort: true
    },
    pool: { max: 5, min: 0, idleTimeoutMillis: 30000 },
    connectionTimeout: 15000,
    requestTimeout: 30000
  }

  if (auth === 'azure-ad' || auth === 'azure') {
    cfg.authentication = {
      type: 'azure-active-directory-password',
      options: { userName: process.env.MSSQL_USER, password: process.env.MSSQL_PASSWORD }
    }
  } else { // 'sql'
    cfg.user = process.env.MSSQL_USER
    cfg.password = process.env.MSSQL_PASSWORD
  }
  return cfg
}

export function configBeschreibung() {
  const c = buildConfig()
  return {
    server: c.server || '(nicht gesetzt)',
    datenbank: c.database || '(nicht gesetzt)',
    port: c.port || (c.options.instanceName ? `instance:${c.options.instanceName}` : 1433),
    auth: process.env.MSSQL_AUTH || 'sql',
    encrypt: c.options.encrypt,
    konfiguriert: Boolean(c.server && c.database)
  }
}

let poolPromise
export async function getPool() {
  if (!poolPromise) {
    const cfg = buildConfig()
    if (!cfg.server || !cfg.database) {
      throw new Error('MSSQL nicht konfiguriert — MSSQL_SERVER und MSSQL_DATABASE in server/.env setzen.')
    }
    poolPromise = new sql.ConnectionPool(cfg).connect()
      .catch((e) => { poolPromise = null; throw e })
  }
  return poolPromise
}

// Verbindungstest: SELECT 1 + Servername/Version.
export async function pingDb() {
  const pool = await getPool()
  const r = await pool.request().query(
    "SELECT 1 AS ok, @@SERVERNAME AS server, DB_NAME() AS db, LEFT(@@VERSION,80) AS version"
  )
  return r.recordset[0]
}

export { sql }
