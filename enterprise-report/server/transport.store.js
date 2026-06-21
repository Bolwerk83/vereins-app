// =========================================================================
//  TRANSPORT-SPEICHER (Backend) — Transportaufträge als JSON ablegen und
//  auflisten. Quelle/Ziel/Status werden im Bundle mitgeführt.
// =========================================================================
import { readFileSync, writeFileSync, existsSync, mkdirSync, readdirSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const DIR = join(dirname(fileURLToPath(import.meta.url)), 'data', 'transports')

function sicherstellen() { if (!existsSync(DIR)) mkdirSync(DIR, { recursive: true }) }

export function speichereBundle(bundle) {
  sicherstellen()
  writeFileSync(join(DIR, `${bundle.id}.json`), JSON.stringify(bundle, null, 2))
  return bundle
}
export function ladeBundle(id) {
  try { return JSON.parse(readFileSync(join(DIR, `${id}.json`), 'utf8')) } catch { return null }
}
export function ladeAlle() {
  try {
    return readdirSync(DIR).filter((f) => f.endsWith('.json'))
      .map((f) => { try { return JSON.parse(readFileSync(join(DIR, f), 'utf8')) } catch { return null } })
      .filter(Boolean)
      .sort((a, b) => (b.erstellt || '').localeCompare(a.erstellt || ''))
  } catch { return [] }
}
export function setzeStatus(id, patch) {
  const b = ladeBundle(id); if (!b) return null
  return speichereBundle({ ...b, ...patch })
}
export const TRANSPORT_DIR = DIR
