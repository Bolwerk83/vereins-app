// =========================================================================
//  Verbindungstest:  npm run test:db   (im Ordner server/)
//  Prüft die MSSQL-Verbindung anhand von server/.env und gibt klare
//  Hinweise, falls etwas fehlt.
// =========================================================================
import { pingDb, configBeschreibung } from './db.js'

const cfg = configBeschreibung()
console.log('— MSSQL-Verbindungstest —')
console.log('Server   :', cfg.server)
console.log('Datenbank:', cfg.datenbank)
console.log('Port     :', cfg.port)
console.log('Auth     :', cfg.auth, '| encrypt:', cfg.encrypt)
console.log('')

if (!cfg.konfiguriert) {
  console.error('✗ Nicht konfiguriert. Bitte MSSQL_SERVER und MSSQL_DATABASE in server/.env setzen.')
  process.exit(1)
}

try {
  const t0 = Date.now()
  const info = await pingDb()
  console.log(`✓ Verbunden in ${Date.now() - t0} ms`)
  console.log('  @@SERVERNAME:', info.server)
  console.log('  DB_NAME()   :', info.db)
  console.log('  Version     :', info.version)
  process.exit(0)
} catch (e) {
  console.error('✗ Verbindung fehlgeschlagen:', String(e.message || e))
  console.error('\nHäufige Ursachen:')
  console.error('  • Falsche Zugangsdaten (MSSQL_USER/MSSQL_PASSWORD) oder Auth-Modus (MSSQL_AUTH).')
  console.error('  • TCP/IP im SQL-Server-Konfigurationsmanager nicht aktiviert / Port 1433 dicht (Firewall).')
  console.error('  • Self-signed-Zertifikat: MSSQL_TRUST_CERT=true setzen.')
  console.error('  • Windows-Integrated-Auth geht von einem Linux-Backend nicht — SQL-Login oder Azure AD nutzen.')
  process.exit(1)
}
