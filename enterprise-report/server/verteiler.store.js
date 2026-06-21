// =========================================================================
//  VERTEILER-SPEICHER (Backend) — einfache JSON-Ablage, vom Scheduler und
//  den /api/verteiler-Endpunkten genutzt. Das Frontend synchronisiert seine
//  Liste hierher (PUT /api/verteiler). Später: DWH-Tabelle.
// =========================================================================
import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const DIR = join(dirname(fileURLToPath(import.meta.url)), 'data')
const FILE = join(DIR, 'verteiler.json')

export function ladeVerteiler() {
  try { return JSON.parse(readFileSync(FILE, 'utf8')) } catch { return [] }
}
export function speichereVerteiler(list) {
  if (!existsSync(DIR)) mkdirSync(DIR, { recursive: true })
  writeFileSync(FILE, JSON.stringify(Array.isArray(list) ? list : [], null, 2))
  return ladeVerteiler()
}
export function protokolliere(id, anlass, ergebnis) {
  const list = ladeVerteiler().map((v) => v.id === id
    ? { ...v, letzterVersand: new Date().toISOString(), letzterAnlass: anlass, letztesErgebnis: ergebnis?.status }
    : v)
  speichereVerteiler(list)
}
