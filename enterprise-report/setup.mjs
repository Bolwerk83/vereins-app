#!/usr/bin/env node
/* =========================================================================
   GEFÜHRTES SETUP  —  node setup.mjs   (oder Doppelklick auf Setup.cmd)

   Richtet das Enterprise-Reporting auf diesem Rechner ein. Führt Schritt
   für Schritt durch alles, erklärt jeden Schritt in einfacher Sprache und
   funktioniert auch ohne Datenbank (Demo-Modus). Mehrfach ausführbar.
   ========================================================================= */
import { spawnSync } from 'node:child_process'
import { readFileSync, writeFileSync, existsSync } from 'node:fs'
import { createInterface } from 'node:readline/promises'
import { stdin as input, stdout as output } from 'node:process'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const ROOT = dirname(fileURLToPath(import.meta.url))
const SERVER = join(ROOT, 'server')
const rl = createInterface({ input, output })

// ---- kleine Helfer für eine freundliche Ausgabe -------------------------
const c = {
  reset: '\x1b[0m', bold: '\x1b[1m', dim: '\x1b[2m',
  blue: '\x1b[34m', green: '\x1b[32m', yellow: '\x1b[33m', red: '\x1b[31m', cyan: '\x1b[36m'
}
const sag = (s = '') => console.log(s)
const titel = (s) => sag(`\n${c.bold}${c.blue}${s}${c.reset}`)
const ok = (s) => sag(`  ${c.green}✓${c.reset} ${s}`)
const info = (s) => sag(`  ${c.dim}${s}${c.reset}`)
const warn = (s) => sag(`  ${c.yellow}!${c.reset} ${s}`)
const fehler = (s) => sag(`  ${c.red}✗${c.reset} ${s}`)

async function frage(text, vorgabe = '') {
  const a = (await rl.question(`${c.cyan}?${c.reset} ${text}${vorgabe ? ` ${c.dim}[${vorgabe}]${c.reset}` : ''} `)).trim()
  return a || vorgabe
}
async function jaNein(text, vorgabeJa = true) {
  const a = (await frage(`${text} (j/n)`, vorgabeJa ? 'j' : 'n')).toLowerCase()
  return a.startsWith('j') || a.startsWith('y')
}
function npm(args, cwd) {
  const r = spawnSync('npm', args, { cwd, stdio: 'inherit', shell: true })
  return r.status === 0
}

// =========================================================================
async function main() {
  console.clear?.()
  sag(`${c.bold}${c.blue}╔════════════════════════════════════════════════════════════╗${c.reset}`)
  sag(`${c.bold}${c.blue}║   Enterprise Reporting · Einrichtung auf diesem Rechner     ║${c.reset}`)
  sag(`${c.bold}${c.blue}╚════════════════════════════════════════════════════════════╝${c.reset}`)
  sag()
  sag('Dieser Assistent richtet alles ein. Du kannst bei jeder Frage einfach')
  sag(`${c.bold}Enter${c.reset} drücken, um die empfohlene Vorgabe zu übernehmen.`)
  sag(`Nichts kann kaputtgehen — du kannst das Setup jederzeit erneut starten.`)

  // ---- Schritt 1: Voraussetzungen ---------------------------------------
  titel('Schritt 1 von 5 · Voraussetzungen prüfen')
  const major = Number(process.versions.node.split('.')[0])
  if (major < 18) {
    fehler(`Node.js ${process.versions.node} ist zu alt. Bitte Node 18 oder neuer installieren: https://nodejs.org`)
    return ende(1)
  }
  ok(`Node.js ${process.versions.node} gefunden — passt.`)

  // ---- Schritt 2: Pakete installieren -----------------------------------
  titel('Schritt 2 von 5 · Programmteile installieren')
  info('Das lädt einmalig die benötigten Bausteine aus dem Internet (kann ein paar Minuten dauern).')
  if (await jaNein('Jetzt installieren?', true)) {
    sag(`\n${c.dim}→ Oberfläche (Frontend) …${c.reset}`)
    if (!npm(['install'], ROOT)) { fehler('Installation der Oberfläche fehlgeschlagen.'); return ende(1) }
    ok('Oberfläche installiert.')
    sag(`\n${c.dim}→ Backend (für die Datenbank-Anbindung) …${c.reset}`)
    if (!npm(['install'], SERVER)) { warn('Backend-Installation hatte Probleme — für den Demo-Modus ist das egal.') }
    else ok('Backend installiert.')
  } else {
    warn('Übersprungen. Du kannst es später mit „npm install" nachholen.')
  }

  // ---- Schritt 3: Datenquelle wählen ------------------------------------
  titel('Schritt 3 von 5 · Womit möchtest du starten?')
  sag(`  ${c.bold}1)${c.reset} Demo-Modus ${c.green}(empfohlen für den ersten Start)${c.reset}`)
  sag(`     Sofort startklar mit Beispielzahlen — ${c.bold}keine Datenbank nötig${c.reset}.`)
  sag(`  ${c.bold}2)${c.reset} Echte Datenbank (Microsoft SQL Server)`)
  sag(`     Verbindet sich mit deinem SQL Server / LocalDB.`)
  const wahl = await frage('Deine Wahl (1 oder 2)', '1')
  const mssql = wahl.trim() === '2'

  // Frontend-Quelle in .env schreiben
  writeFileSync(join(ROOT, '.env'), `# Automatisch erzeugt vom Setup. 'mock' = Demo, 'mssql' = echte Datenbank.\nVITE_DATA_SOURCE=${mssql ? 'mssql' : 'mock'}\n`)
  ok(`Startmodus gespeichert: ${c.bold}${mssql ? 'Echte Datenbank' : 'Demo-Modus'}${c.reset}`)

  if (mssql) {
    titel('   Datenbank-Verbindung einrichten')
    info('Diese Angaben bekommst du ggf. von deiner IT. Beispiele stehen jeweils dabei.')
    const server = await frage('SQL-Server (z. B. (localdb)\\MSSQLLocalDB  oder  SQLPROD01\\REPORTING)', '(localdb)\\MSSQLLocalDB')
    const datenbank = await frage('Datenbank-Name', 'ERP_DWH')
    sag(`\n  Anmeldeart:`)
    sag(`    ${c.bold}1)${c.reset} Windows-Anmeldung ${c.dim}(für LocalDB / lokalen Server — empfohlen)${c.reset}`)
    sag(`    ${c.bold}2)${c.reset} SQL-Login (Benutzer + Passwort)`)
    const authWahl = await frage('Deine Wahl (1 oder 2)', '1')
    const windows = authWahl.trim() !== '2'

    let user = '', pass = ''
    if (!windows) {
      user = await frage('SQL-Benutzername', 'report_reader')
      pass = await frage('SQL-Passwort', '')
    } else {
      info('Windows-Anmeldung: Es wird dein angemeldeter Windows-Benutzer verwendet — kein Passwort nötig.')
      info('Voraussetzung einmalig im Ordner server/:  npm install msnodesqlv8  (+ ODBC Driver 17/18).')
    }
    const key = await frage('Anthropic API-Key für die KI-Auswertung (optional, leer lassen geht)', '')

    const env = [
      '# Automatisch erzeugt vom Setup (setup.mjs). Werte bei Bedarf anpassen.',
      `MSSQL_SERVER=${server}`,
      `MSSQL_DATABASE=${datenbank}`,
      `MSSQL_AUTH=${windows ? 'windows' : 'sql'}`,
      ...(windows ? ['# MSSQL_ODBC_DRIVER=ODBC Driver 17 for SQL Server'] : [`MSSQL_USER=${user}`, `MSSQL_PASSWORD=${pass}`]),
      'MSSQL_ENCRYPT=true',
      'MSSQL_TRUST_CERT=true',
      'PORT=3001',
      `ANTHROPIC_API_KEY=${key}`,
      ''
    ].join('\n')
    writeFileSync(join(SERVER, '.env'), env)
    ok('Verbindungsdaten in server/.env gespeichert.')

    // ---- Schritt 4: Verbindung testen -----------------------------------
    titel('Schritt 4 von 5 · Verbindung testen')
    if (await jaNein('Verbindung jetzt prüfen?', true)) {
      const r = spawnSync('npm', ['run', 'test:db'], { cwd: SERVER, stdio: 'inherit', shell: true })
      if (r.status === 0) ok('Verbindung steht!')
      else { warn('Verbindung hat noch nicht geklappt — das Setup läuft trotzdem weiter.'); info('Tipp: Angaben in server/.env prüfen, dann „npm run test:db" im Ordner server erneut ausführen.') }
    }

    // ---- SQL einspielen -------------------------------------------------
    if (await jaNein('Rollen-/Rechte-Tabellen jetzt in der Datenbank anlegen?', true)) {
      const skript = join(ROOT, 'sql', '_rollen_rechte.sql')
      const r = spawnSync('npm', ['run', 'apply:sql', '--', skript], { cwd: SERVER, stdio: 'inherit', shell: true })
      if (r.status === 0) ok('Tabellen angelegt (Schema sec).')
      else warn('Konnte nicht eingespielt werden — du kannst sql/_rollen_rechte.sql später im SSMS ausführen.')
    }
  } else {
    sag(`\n${c.dim}Schritt 4 entfällt im Demo-Modus — es wird keine Datenbank gebraucht.${c.reset}`)
  }

  // ---- Schritt 5: Fertig ------------------------------------------------
  titel(`${mssql ? 'Schritt 5 von 5' : 'Schritt 4 von 4'} · Fertig 🎉`)
  ok('Die Einrichtung ist abgeschlossen.')
  sag()
  sag(`So startest du das Tool ab jetzt:`)
  sag(`  ${c.bold}• Windows:${c.reset} Doppelklick auf  ${c.bold}Start.cmd${c.reset}`)
  sag(`  ${c.bold}• Oder im Terminal:${c.reset}  ${c.bold}npm run start:local${c.reset}`)
  sag()
  sag(`Das Tool öffnet sich dann im Browser unter  ${c.cyan}http://localhost:5180${c.reset}`)
  if (!mssql) info('Du bist im Demo-Modus. Später jederzeit „node setup.mjs" erneut starten und „Echte Datenbank" wählen.')
  sag()
  if (await jaNein('Möchtest du das Tool jetzt gleich starten?', true)) {
    rl.close()
    spawnSync('node', [join(ROOT, 'start.mjs')], { cwd: ROOT, stdio: 'inherit', shell: false })
    return
  }
  ende(0)
}

function ende(code) { rl.close(); process.exit(code) }
main().catch((e) => { fehler(String(e?.message || e)); ende(1) })
