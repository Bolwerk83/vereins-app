// Verbindung zur Vereins-App (lesend): exakt derselbe Weg, den die
// Vereins-App selbst geht – anonyme Supabase-Anmeldung, Vereinscode
// einlösen, app_data lesen. Kein Passwort nötig; der anon-Key ist
// bauartbedingt öffentlich, der Zugriff wird durch RLS + Vereinscode
// geregelt (siehe vereins-app/src/storage.js).

const BASE = 'https://phpkyzujpvrsypqqptlv.supabase.co'
const KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBocGt5enVqcHZyc3lwcXFwdGx2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODA0MjA2MjAsImV4cCI6MjA5NTk5NjYyMH0.t7wCh6Juzkn9cyshpy78ZfJ_G9ji8pko_v1hoOzui8w'
const JOIN_CODE = 'r3EDDDJf0t4U4Zep8_tTXw'
const SK = 'vereinsapp_v14'
const AUTH_KEY = 'eselsohr-verein-auth'

export const TYPE_LABEL = {
  training: 'Training',
  heimspiel: 'Heimspiel',
  auswarts: 'Auswärtsspiel',
  turnier: 'Turnier',
}

function loadAuth() {
  try { return JSON.parse(localStorage.getItem(AUTH_KEY) || 'null') } catch { return null }
}
function saveAuth(s) {
  try { localStorage.setItem(AUTH_KEY, JSON.stringify(s)) } catch { /* Sitzung ohne Speicher */ }
}

async function getToken() {
  const now = Math.floor(Date.now() / 1000)
  const s = loadAuth()
  if (s?.access_token && s?.expires_at > now + 60) return s.access_token
  if (s?.refresh_token) {
    try {
      const r = await fetch(`${BASE}/auth/v1/token?grant_type=refresh_token`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', apikey: KEY },
        body: JSON.stringify({ refresh_token: s.refresh_token }),
      })
      if (r.ok) {
        const d = await r.json()
        const ns = { access_token: d.access_token, refresh_token: d.refresh_token, expires_at: d.expires_at || now + (d.expires_in || 3600), is_member: s.is_member }
        saveAuth(ns)
        return ns.access_token
      }
    } catch { /* weiter zur Neuanmeldung */ }
  }
  const r = await fetch(`${BASE}/auth/v1/signup`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', apikey: KEY },
    body: '{}',
  })
  if (!r.ok) throw new Error('Vereins-App nicht erreichbar (Anmeldung fehlgeschlagen)')
  const d = await r.json()
  const at = d.access_token || d.session?.access_token
  if (!at) throw new Error('Vereins-App: keine Anmeldung möglich')
  saveAuth({
    access_token: at,
    refresh_token: d.refresh_token || d.session?.refresh_token,
    expires_at: d.expires_at || d.session?.expires_at || now + 3600,
    is_member: false,
  })
  return at
}

async function ensureMember(token) {
  const s = loadAuth()
  if (s?.is_member) return
  const r = await fetch(`${BASE}/rest/v1/rpc/redeem_code`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', apikey: KEY, Authorization: 'Bearer ' + token },
    body: JSON.stringify({ p_code: JOIN_CODE }),
  })
  if (r.ok) saveAuth({ ...(loadAuth() || {}), is_member: true })
}

const dedupe = (arr) => {
  const seen = new Set()
  return (arr || []).filter((x) => {
    const k = x?.id ?? JSON.stringify(x)
    if (seen.has(k)) return false
    seen.add(k)
    return true
  })
}

/** Liest Teams, Termine, Trainer und Spieler aus der Vereins-App. */
export async function fetchVereinData() {
  const token = await getToken()
  await ensureMember(token)
  const H = { apikey: KEY, Authorization: 'Bearer ' + token }
  const [gRes, sRes] = await Promise.all([
    fetch(`${BASE}/rest/v1/app_data?key=eq.${SK}&select=value`, { headers: H }),
    fetch(`${BASE}/rest/v1/app_data?key=like.${SK}__*&select=key,value`, { headers: H }),
  ])
  if (!gRes.ok) throw new Error('Vereins-App: Daten nicht lesbar (' + gRes.status + ')')
  const gRows = await gRes.json()
  const sRows = sRes.ok ? await sRes.json() : []
  const parts = [...gRows.map((r) => r.value), ...sRows.map((r) => r.value)].filter(Boolean)
  if (!parts.length) throw new Error('Vereins-App: keine Daten gefunden')
  const merged = { teams: [], events: [], trainers: [], players: {} }
  for (const p of parts) {
    merged.teams.push(...(p.teams || []))
    merged.events.push(...(p.events || []))
    merged.trainers.push(...(p.trainers || []))
    if (p.players && typeof p.players === 'object' && !Array.isArray(p.players)) Object.assign(merged.players, p.players)
  }
  merged.teams = dedupe(merged.teams)
  merged.events = dedupe(merged.events)
  merged.trainers = dedupe(merged.trainers)
  return merged
}

/** Vereins-Termine eines Teams in Eselsohr-Termine umwandeln. */
export function mapTeamEvents(data, tid, memberId) {
  return (data.events || [])
    .filter((ev) => ev.tid === tid && ev.date && /^\d{4}-\d{2}-\d{2}$/.test(ev.date))
    .map((ev) => ({
      id: 'v_' + ev.id,
      tid,
      member_id: memberId,
      on_date: ev.date,
      at_time: (ev.time || '10:00').slice(0, 5),
      title: ev.title || TYPE_LABEL[ev.type] || 'Vereinstermin',
      meta: [TYPE_LABEL[ev.type], ev.loc, 'Vereins-App ⚽'].filter(Boolean).join(' · '),
      serie: false,
      status: 'fix',
      src: 'verein',
      created_by: null,
    }))
}

/** Infos zu einem Team: Trainer und Spielernamen. */
export function teamInfo(data, tid) {
  const trainers = (data.trainers || []).filter((t) => (t.tids || []).includes(tid)).map((t) => t.name).filter(Boolean)
  const raw = data.players?.[tid]
  const players = (Array.isArray(raw) ? raw : [])
    .map((p) => (typeof p === 'string' ? p : p?.name))
    .filter(Boolean)
  return { trainers, players }
}
