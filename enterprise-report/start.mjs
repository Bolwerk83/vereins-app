#!/usr/bin/env node
/* =========================================================================
   STARTER  —  node start.mjs   (oder Doppelklick auf Start.cmd)

   Startet das Tool. Im Demo-Modus nur die Oberfläche; mit echter Datenbank
   zusätzlich das Backend. Öffnet danach automatisch den Browser.
   Beenden: dieses Fenster schließen oder Strg+C.
   ========================================================================= */
import { spawn } from 'node:child_process'
import { readFileSync, existsSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'
import { platform } from 'node:os'

const ROOT = dirname(fileURLToPath(import.meta.url))
const SERVER = join(ROOT, 'server')
const URL = 'http://localhost:5180'

const c = { reset: '\x1b[0m', bold: '\x1b[1m', dim: '\x1b[2m', green: '\x1b[32m', cyan: '\x1b[36m', yellow: '\x1b[33m' }

// Datenquelle aus .env lesen (vom Setup geschrieben).
function datenquelle() {
  try {
    const env = readFileSync(join(ROOT, '.env'), 'utf8')
    const m = env.match(/VITE_DATA_SOURCE\s*=\s*(\w+)/)
    return m ? m[1] : 'mock'
  } catch { return 'mock' }
}

const kinder = []
function starte(name, cmd, args, cwd) {
  const p = spawn(cmd, args, { cwd, stdio: 'inherit', shell: true })
  p.on('exit', (code) => { if (code) console.log(`${c.yellow}[${name}] beendet (Code ${code}).${c.reset}`) })
  kinder.push(p)
  return p
}

function browserAuf(url) {
  const cmd = platform() === 'win32' ? `start "" "${url}"`
    : platform() === 'darwin' ? `open "${url}"` : `xdg-open "${url}"`
  spawn(cmd, { shell: true, stdio: 'ignore', detached: true }).unref()
}

const quelle = datenquelle()
console.log(`${c.bold}${c.cyan}Enterprise Reporting wird gestartet …${c.reset}`)
console.log(`${c.dim}Modus: ${quelle === 'mssql' ? 'Echte Datenbank' : 'Demo'}  ·  Adresse: ${URL}${c.reset}\n`)

if (quelle === 'mssql') {
  if (existsSync(join(SERVER, 'node_modules'))) {
    console.log(`${c.dim}→ Backend (Datenbank) startet …${c.reset}`)
    starte('backend', 'npm', ['start'], SERVER)
  } else {
    console.log(`${c.yellow}! Backend nicht installiert — bitte einmal „node setup.mjs" ausführen.${c.reset}`)
  }
}

console.log(`${c.dim}→ Oberfläche startet …${c.reset}`)
starte('frontend', 'npm', ['run', 'dev'], ROOT)

// Browser nach kurzer Wartezeit öffnen.
setTimeout(() => {
  console.log(`\n${c.green}${c.bold}Bereit!${c.reset} Falls sich nichts öffnet: ${c.cyan}${URL}${c.reset} im Browser aufrufen.`)
  browserAuf(URL)
}, 3500)

// Sauber beenden.
function stop() { kinder.forEach((p) => { try { p.kill() } catch {} }); process.exit(0) }
process.on('SIGINT', stop)
process.on('SIGTERM', stop)
