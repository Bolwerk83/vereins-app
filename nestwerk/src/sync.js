// Familien-Sync (Stufe 2): hält Eselsohr auf allen Geräten der Familie
// aktuell. Eine Familie = eine Zeile in der Datenbank, der unerratbare
// Familien-Code ist der Schlüssel. Der Gedächtnispalast bleibt dabei
// Ende-zu-Ende-verschlüsselt – der Server sieht nur salt/iv/cipher.
//
// Serverseite: supabase/sync.sql (einmalig im SQL-Editor ausführen).

const BASE = 'https://phpkyzujpvrsypqqptlv.supabase.co'
const KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBocGt5enVqcHZyc3lwcXFwdGx2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODA0MjA2MjAsImV4cCI6MjA5NTk5NjYyMH0.t7wCh6Juzkn9cyshpy78ZfJ_G9ji8pko_v1hoOzui8w'

const META_KEY = 'eselsohr-sync-v1'

export function loadSyncMeta() {
  try { return JSON.parse(localStorage.getItem(META_KEY) || 'null') || { on: false } } catch { return { on: false } }
}

export function saveSyncMeta(m) {
  try { localStorage.setItem(META_KEY, JSON.stringify(m)) } catch { /* Sitzung ohne Speicher */ }
}

export function newSyncCode() {
  const abc = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789' // ohne I/L/O/0/1 – vorlesbar
  const buf = new Uint8Array(20)
  crypto.getRandomValues(buf)
  const s = Array.from(buf, (b) => abc[b % abc.length]).join('')
  return `ESEL-${s.slice(0, 5)}-${s.slice(5, 10)}-${s.slice(10, 15)}-${s.slice(15, 20)}`
}

async function rpc(name, args) {
  const r = await fetch(`${BASE}/rest/v1/rpc/${name}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', apikey: KEY, Authorization: `Bearer ${KEY}` },
    body: JSON.stringify(args),
  })
  if (!r.ok) throw new Error('Server antwortet nicht (' + r.status + ')')
  return r.json()
}

export const esCreate = (code, data) => rpc('es_create_family', { p_code: code, p_data: data })
export const esPull = (code) => rpc('es_pull', { p_code: code })
export const esPush = (code, data, version) => rpc('es_push', { p_code: code, p_data: data, p_version: version })

// Gerätespezifisches (wer bin ich auf DIESEM Gerät) wird nicht mitgesynct
export function stripLocal(db) {
  const { active, ...rest } = db
  return rest
}

const byId = (arr) => Object.fromEntries((arr || []).map((x) => [x.id, x]))
// Vereinigung nach id – bei gleicher id gewinnt lokal (das ist die Änderung,
// die dieses Gerät gerade durchsetzen will)
const union = (a, b) => Object.values({ ...byId(b), ...byId(a) })

// Zwei Stände zusammenführen. Löschungen wandern in den Papierkorb (trash)
// und setzen sich dadurch auch gegen die Vereinigung durch.
export function mergeDb(local, remote) {
  if (!remote) return local
  const trash = union(local.trash, remote.trash)
  const gone = new Set(trash.map((t) => t.id))
  const memories = { ...(remote.memories || {}) }
  for (const [k, v] of Object.entries(local.memories || {})) {
    if (!memories[k] || (v?.ts || 0) >= (memories[k]?.ts || 0)) memories[k] = v
  }
  return {
    ...remote,
    ...local,
    family: local.family || remote.family,
    members: union(local.members, remote.members),
    events: union(local.events, remote.events).filter((e) => !gone.has(e.id)),
    items: union(local.items, remote.items).filter((i) => !gone.has(i.id)),
    inbox: union(local.inbox, remote.inbox).filter((i) => !gone.has(i.id)),
    geburtstage: union(local.geburtstage, remote.geburtstage).filter((g) => !gone.has(g.id)),
    trash,
    memories,
    praxis: { klienten: union(local.praxis?.klienten, remote.praxis?.klienten) },
    waTemplate: local.waTemplate || remote.waTemplate,
    verein: local.verein || remote.verein,
    active: local.active,
  }
}
