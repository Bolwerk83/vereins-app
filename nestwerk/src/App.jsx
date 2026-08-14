import React, { useEffect, useRef, useState } from 'react'
import { loadState, saveState, storageWorks } from './store.js'
import { newSalt, deriveKey, encryptJson, decryptJson } from './crypto.js'
import { fetchVereinData, mapTeamEvents, teamInfo } from './verein.js'
import { loadSyncMeta, saveSyncMeta, newSyncCode, esCreate, esPull, esPush, stripLocal, mergeDb } from './sync.js'

/* ================= Helfer ================= */

const WD = ['Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa', 'So']
const WD_LONG = ['Montag', 'Dienstag', 'Mittwoch', 'Donnerstag', 'Freitag', 'Samstag', 'Sonntag']
const MONTHS = ['Januar', 'Februar', 'März', 'April', 'Mai', 'Juni', 'Juli', 'August', 'September', 'Oktober', 'November', 'Dezember']
const COLORS = ['#3D7BFF', '#FF5D73', '#FFB02E', '#2FBF71', '#8B5CF6', '#FF7A3D', '#00B8C4', '#E5484D']

const iso = (d) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
const fromIso = (s) => new Date(+s.slice(0, 4), +s.slice(5, 7) - 1, +s.slice(8, 10))
const wdIdx = (d) => (d.getDay() + 6) % 7
const fmtDate = (s) => { const d = fromIso(s); return `${WD_LONG[wdIdx(d)]}, ${d.getDate()}. ${MONTHS[d.getMonth()]}` }
const fmtShort = (s) => { const d = fromIso(s); return `${WD[wdIdx(d)]} ${d.getDate()}.${d.getMonth() + 1}.` }
const addDays = (s, n) => { const d = fromIso(s); d.setDate(d.getDate() + n); return iso(d) }
const mins = (t) => +t.slice(0, 2) * 60 + +t.slice(3, 5)
const uid = () => (crypto.randomUUID ? crypto.randomUUID() : String(Math.random()).slice(2))

/* Einheitliches, gezeichnetes Icon-Set (statt geräteabhängiger Emojis) */
const ICON_PATHS = {
  home: <><path d="M3 10.5 12 3l9 7.5" /><path d="M5 9.5V21h14V9.5" /><path d="M9 21v-6h6v6" /></>,
  calendar: <><rect x="3" y="5" width="18" height="16" rx="2" /><path d="M8 3v4M16 3v4M3 11h18" /></>,
  cart: <><circle cx="9" cy="20" r="1.6" /><circle cx="18" cy="20" r="1.6" /><path d="M2 3h3l2.6 12.5a1.8 1.8 0 0 0 1.8 1.5h7.9a1.8 1.8 0 0 0 1.8-1.4L21 8H6" /></>,
  heart: <path d="M12 21C7 16.5 3 13.2 3 8.9A4.9 4.9 0 0 1 7.9 4c1.7 0 3.2.8 4.1 2.1A5 5 0 0 1 16.1 4 4.9 4.9 0 0 1 21 8.9c0 4.3-4 7.6-9 12.1Z" />,
  landmark: <><path d="M3 21h18" /><path d="M5 21v-9M9.5 21v-9M14.5 21v-9M19 21v-9" /><path d="M2.5 9 12 3l9.5 6z" /></>,
  users: <><circle cx="9" cy="8" r="3.5" /><path d="M2.5 20a6.5 6.5 0 0 1 13 0" /><path d="M16 5.2a3.5 3.5 0 0 1 0 5.6" /><path d="M17.5 14.5a6.5 6.5 0 0 1 4 5.5" /></>,
  user: <><circle cx="12" cy="8" r="3.8" /><path d="M5 20.5a7 7 0 0 1 14 0" /></>,
  lock: <><rect x="4.5" y="10.5" width="15" height="10" rx="2" /><path d="M8 10.5V7.5a4 4 0 0 1 8 0v3" /></>,
  briefcase: <><rect x="3" y="8" width="18" height="12" rx="2" /><path d="M9 8V6a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2" /><path d="M3 13h18" /></>,
  trophy: <><path d="M8 21h8M12 17.5V21" /><path d="M7 4h10v5a5 5 0 0 1-10 0Z" /><path d="M7 5H4v1.5A3.5 3.5 0 0 0 7.5 10M17 5h3v1.5A3.5 3.5 0 0 1 16.5 10" /></>,
  link: <><path d="M10 13.5a4 4 0 0 0 6 .5l3-3a4 4 0 0 0-5.7-5.7l-1.6 1.6" /><path d="M14 10.5a4 4 0 0 0-6-.5l-3 3a4 4 0 0 0 5.7 5.7l1.6-1.6" /></>,
  file: <><path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8Z" /><path d="M14 3v5h5" /></>,
  plus: <path d="M12 5v14M5 12h14" />,
  download: <><path d="M12 4v11" /><path d="m7 11 5 5 5-5" /><path d="M4 20h16" /></>,
  upload: <><path d="M12 20V9" /><path d="m7 13 5-5 5 5" /><path d="M4 4h16" /></>,
  table: <><rect x="3" y="4" width="18" height="16" rx="2" /><path d="M3 10h18M3 15h18M9 4v16" /></>,
  archive: <><rect x="3" y="4" width="18" height="5" rx="1" /><path d="M5 9v10a1.5 1.5 0 0 0 1.5 1.5h11A1.5 1.5 0 0 0 19 19V9" /><path d="M10 13h4" /></>,
  alert: <><path d="M12 3 2.5 20h19Z" /><path d="M12 9.5V14M12 17h.01" /></>,
  info: <><circle cx="12" cy="12" r="9" /><path d="M12 11v5M12 7.5h.01" /></>,
  activity: <path d="M3 13h4l3 7 4-16 3 9h4" />,
}
function Icon({ name, size = 19 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth="2.1" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"
      style={{ display: 'block', flex: 'none' }}>
      {ICON_PATHS[name] || null}
    </svg>
  )
}
const RowIcon = ({ name }) => <span style={{ color: 'var(--ink-soft)', flex: 'none', display: 'flex' }}><Icon name={name} size={21} /></span>

/* Das Logo: eine Seite mit umgeknickter Ecke – das Eselsohr, wörtlich */
// Der Eselsohr-Esel: Comic-Esel, dessen rechte Ohrspitze wie eine Buchecke
// nach vorn geknickt ist (Innenseite markergelb – das „Eselsohr“).
const LogoMark = ({ size = 26 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true"
    style={{ flex: 'none', transform: 'rotate(-4deg)' }}>
    <g stroke="var(--ink)" strokeWidth="1.5" strokeLinejoin="round" strokeLinecap="round">
      <path d="M8.3 8.6 C5.9 7.8 4.1 4.9 4.8 1.9 C7.7 2.1 9.9 4.8 10.2 7.8 Z" fill="#BDB6B0" />
      <path d="M8.4 7.1 C7.2 6.5 6.3 5.1 6.2 3.7" fill="none" strokeWidth="1" opacity=".5" />
      <path d="M15.7 8.6 C18.1 7.8 19.9 4.9 19.2 1.9 C16.3 2.1 14.1 4.8 13.8 7.8 Z" fill="#BDB6B0" />
      <path d="M15.7 4.4 L19.3 2.4 C20.9 3.9 21.1 6.6 19.8 8.3 C17.9 7.9 16 6.3 15.7 4.4 Z" fill="var(--marker)" />
      <path d="M15.7 4.4 C16.9 4.2 18.3 3.5 19.3 2.4" fill="none" strokeWidth="1.2" />
      <path d="M12 5.8 C16.6 5.8 19.9 9 19.9 13.3 C19.9 17.9 16.5 21.3 12 21.3 C7.5 21.3 4.1 17.9 4.1 13.3 C4.1 9 7.4 5.8 12 5.8 Z" fill="#CFC9C3" />
      <path d="M9.9 6.6 C10.8 5 13.2 5 14.1 6.6 C12.8 7.6 11.2 7.6 9.9 6.6 Z" fill="var(--ink)" strokeWidth="1.2" />
      <path d="M12 13.2 C15 13.2 17 14.8 17 17 C17 19.2 14.9 20.7 12 20.7 C9.1 20.7 7 19.2 7 17 C7 14.8 9 13.2 12 13.2 Z" fill="var(--surface)" />
      <circle cx="10" cy="16.9" r=".75" fill="var(--ink)" stroke="none" />
      <circle cx="14" cy="16.9" r=".75" fill="var(--ink)" stroke="none" />
      <path d="M10.7 19 C11.6 19.7 12.4 19.7 13.3 19" fill="none" strokeWidth="1.1" />
      <circle cx="8.6" cy="10.9" r="1.05" fill="var(--ink)" stroke="none" />
      <circle cx="15.4" cy="10.9" r="1.05" fill="var(--ink)" stroke="none" />
    </g>
  </svg>
)

const PTYPES = ['Nachsorge', 'Vorsorge', 'Beratung', 'Kursstunde', 'Wochenbettbesuch', 'Sonstiges']

// Module: werden pro Mitglied auf dem eigenen Profil hinzugefügt.
// Grundsatz: nicht mehr Infos als nötig – Details sieht nur, wem das Modul gehört.
const MODULES = [
  {
    id: 'praxis', ico: 'heart', name: 'Praxis',
    desc: 'Klientinnen, Termin-Typen mit Soll/Ist-Zeiten, Dokumente aus Vorlagen.',
    privacy: 'Die Familie sieht nur „Praxis · belegt“ – keine Namen, keine Details.',
  },
  {
    id: 'verein', ico: 'trophy', name: 'Vereins-App',
    desc: 'Trainings, Spiele und Turniere automatisch im Familienkalender – immer aktuell.',
    privacy: 'Ohne Passwort, nur lesend über den Vereinszugang.',
  },
  {
    id: 'arbeit', ico: 'briefcase', name: 'Arbeitskalender',
    desc: 'Arbeitstermine per .ics-Import aus Outlook/Office365.',
    privacy: 'Die Familie sieht nur „Arbeit“ als belegte Zeit – keine Betreffe.',
  },
  {
    id: 'sport', ico: 'activity', name: 'Sport',
    desc: 'Deine Sporteinheiten fest einplanen – Wochenziel, Serien, Wochenüberblick.',
    privacy: 'Dein Ziel und dein Stand gehören dir – die Familie sieht nur die Termine.',
  },
  {
    id: 'connect', ico: 'link', name: 'Anbindungen',
    desc: 'Andere Programme mit deinen Daten verbinden – Outlook, Excel, Kalender-Export.',
    privacy: 'Exporte enthalten nur, was du selbst sehen darfst.',
  },
]
const hasMod = (m, id) => !!(m?.modules && m.modules[id])

const VORLAGEN = [
  {
    id: 'bescheinigung',
    name: 'Bescheinigung über Termine',
    text: 'Bescheinigung\n\nHiermit bestätige ich, dass bei {name}, {adresse}, im Zeitraum vom {von} bis {bis} insgesamt {anzahl} Termine ({typen}) mit einer Gesamtdauer von {gesamt} Minuten stattgefunden haben.\n\n{heute}\n\n____________________\n{ich}',
  },
  {
    id: 'anschreiben',
    name: 'Anschreiben an Klientin',
    text: 'Liebe {vorname},\n\nvielen Dank für dein Vertrauen. Anbei die besprochenen Unterlagen.\n\nUnser nächster Termin: bitte kurz bestätigen.\n\nHerzliche Grüße\n{ich}\n{heute}',
  },
]

function fillVorlage(tpl, klient, termine, meName) {
  const done = termine.filter((t) => t.ist)
  const dates = termine.map((t) => t.on_date).sort()
  const d = new Date()
  const heute = `${d.getDate()}.${d.getMonth() + 1}.${d.getFullYear()}`
  const fmt = (s) => (s ? `${+s.slice(8, 10)}.${+s.slice(5, 7)}.${s.slice(0, 4)}` : '—')
  return tpl.text
    .replaceAll('{name}', klient.name)
    .replaceAll('{vorname}', klient.name.split(' ')[0])
    .replaceAll('{adresse}', klient.adresse || '—')
    .replaceAll('{telefon}', klient.telefon || '—')
    .replaceAll('{anzahl}', String(termine.length))
    .replaceAll('{typen}', [...new Set(termine.map((t) => t.ptype))].join(', ') || '—')
    .replaceAll('{gesamt}', String(done.reduce((a, t) => a + (+t.ist || 0), 0)))
    .replaceAll('{von}', fmt(dates[0]))
    .replaceAll('{bis}', fmt(dates[dates.length - 1]))
    .replaceAll('{heute}', heute)
    .replaceAll('{ich}', meName)
}

// Datei an den Nutzer übergeben (Artifact-Viewer, Browser-Download oder Zwischenablage)
async function saveTextFile(filename, text, toast) {
  try { await navigator.clipboard?.writeText(text) } catch { /* Zwischenablage gesperrt */ }
  if (window.claude?.downloads) {
    try {
      await window.claude.downloads.save({ filename, data: text })
      toast('Gespeichert ✓ (und in die Zwischenablage kopiert)')
      return
    } catch (e) {
      toast(e?.code === 'declined' ? 'Speichern abgebrochen – Text liegt in der Zwischenablage' : 'In die Zwischenablage kopiert ✓')
      return
    }
  }
  try {
    const a = document.createElement('a')
    a.href = URL.createObjectURL(new Blob([text], { type: 'text/plain' }))
    a.download = filename
    a.click()
    toast('Als Datei gespeichert ✓')
  } catch {
    toast('In die Zwischenablage kopiert ✓')
  }
}

// Einfacher ICS-Parser (Outlook/Office365-Export): DTSTART/DTEND/SUMMARY/LOCATION
function parseIcs(text) {
  const unfold = text.replace(/\r/g, '').replace(/\n[ \t]/g, '')
  const out = []
  for (const block of unfold.split('BEGIN:VEVENT').slice(1)) {
    const get = (k) => {
      const m = block.match(new RegExp('(?:^|\\n)' + k + '[^:\\n]*:([^\\n]*)'))
      return m ? m[1].trim().replace(/\\,/g, ',').replace(/\\n/gi, ' · ') : ''
    }
    const ds = get('DTSTART')
    if (!/^\d{8}/.test(ds)) continue
    const toLocal = (v) => {
      if (v.length <= 8) return { d: new Date(+v.slice(0, 4), +v.slice(4, 6) - 1, +v.slice(6, 8)), allday: true }
      const y = +v.slice(0, 4), mo = +v.slice(4, 6) - 1, dd = +v.slice(6, 8), h = +v.slice(9, 11), mi = +v.slice(11, 13)
      return { d: v.endsWith('Z') ? new Date(Date.UTC(y, mo, dd, h, mi)) : new Date(y, mo, dd, h, mi), allday: false }
    }
    const start = toLocal(ds)
    const de = get('DTEND')
    const end = /^\d{8}/.test(de) ? toLocal(de) : null
    const pad = (n) => String(n).padStart(2, '0')
    out.push({
      date: `${start.d.getFullYear()}-${pad(start.d.getMonth() + 1)}-${pad(start.d.getDate())}`,
      time: start.allday ? '09:00' : `${pad(start.d.getHours())}:${pad(start.d.getMinutes())}`,
      end: end && !end.allday ? `${pad(end.d.getHours())}:${pad(end.d.getMinutes())}` : '',
      title: get('SUMMARY') || 'Arbeitstermin',
      loc: get('LOCATION'),
    })
  }
  return out
}

const mapsLink = (adresse) => 'https://www.google.com/maps/search/?api=1&query=' + encodeURIComponent(adresse)

function useToast() {
  const [msg, setMsg] = useState(null)
  const timer = useRef()
  const toast = (m) => {
    setMsg(m)
    clearTimeout(timer.current)
    timer.current = setTimeout(() => setMsg(null), 3000)
  }
  const el = <div className={'toast' + (msg ? ' show' : '')} role="status">{msg}</div>
  return [toast, el]
}

function QuickAdd({ placeholder, onAdd, autoFocus }) {
  const [v, setV] = useState('')
  const submit = () => { if (v.trim()) { onAdd(v.trim()); setV('') } }
  return (
    <div className="quickadd">
      <input value={v} autoFocus={autoFocus} onChange={(e) => setV(e.target.value)} placeholder={placeholder}
        onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); submit() } }} />
      <button type="button" className="btn sm" onClick={submit}>+</button>
    </div>
  )
}

/* ================= Onboarding: Familie gründen ================= */

function Onboarding({ onCreate, onDemo, onJoin }) {
  const [famName, setFamName] = useState('')
  const [myName, setMyName] = useState('')
  const [color, setColor] = useState(COLORS[0])
  const [joinOpen, setJoinOpen] = useState(false)
  const [joinCode, setJoinCode] = useState('')
  const [joinBusy, setJoinBusy] = useState(false)
  const [joinErr, setJoinErr] = useState(null)
  if (joinOpen) {
    return (
      <div className="auth-wrap">
        <form className="auth-card" onSubmit={async (e) => {
          e.preventDefault()
          if (!joinCode.trim() || joinBusy) return
          setJoinBusy(true); setJoinErr(null)
          try { await onJoin(joinCode) } catch (err) { setJoinErr(err.message); setJoinBusy(false) }
        }}>
          <h1 className="serif" style={{ display: 'flex', alignItems: 'center', gap: 10 }}><LogoMark size={36} />Esels<span className="nest">ohr</span></h1>
          <p className="sub">Deine Familie nutzt Eselsohr schon? Dann hol dir hier den gemeinsamen Stand.</p>
          <div className="field">
            <label htmlFor="joincode">Familien-Code</label>
            <input id="joincode" autoFocus required value={joinCode} onChange={(e) => setJoinCode(e.target.value)}
              placeholder="ESEL-XXXXX-XXXXX-XXXXX-XXXXX" autoCapitalize="characters" autoComplete="off" />
          </div>
          {joinErr && <p className="hint" style={{ color: 'var(--danger, #E5484D)' }}>{joinErr}</p>}
          <button className="btn" style={{ width: '100%' }} disabled={joinBusy}>{joinBusy ? 'Lade …' : 'Familie beitreten'}</button>
          <button type="button" className="btn ghost" style={{ width: '100%', marginTop: 8 }} onClick={() => setJoinOpen(false)}>Zurück</button>
          <p className="hint">Den Code findet deine Familie unter „Familie → Familien-Sync“. Danach wählst du nur noch dein Profil.</p>
        </form>
      </div>
    )
  }
  return (
    <div className="auth-wrap">
      <form className="auth-card" onSubmit={(e) => { e.preventDefault(); if (famName.trim() && myName.trim()) onCreate(famName.trim(), myName.trim(), color) }}>
        <h1 className="serif" style={{ display: 'flex', alignItems: 'center', gap: 10 }}><LogoMark size={36} />Esels<span className="nest">ohr</span></h1>
        <p className="sub">Der Familienkalender mit Gedächtnis. Startklar in 20 Sekunden – ganz ohne Konto.</p>
        <div className="field">
          <label htmlFor="famname">Familienname</label>
          <input id="famname" required value={famName} onChange={(e) => setFamName(e.target.value)} placeholder="z. B. Familie Bolwerk" />
        </div>
        <div className="field">
          <label htmlFor="myname">Dein Vorname</label>
          <input id="myname" required value={myName} onChange={(e) => setMyName(e.target.value)} placeholder="z. B. Markus" />
        </div>
        <div className="field">
          <label>Deine Farbe im Kalender</label>
          <div className="colorpick">
            {COLORS.map((c) => (
              <button type="button" key={c} className={color === c ? 'sel' : ''} style={{ background: c }}
                aria-label={'Farbe ' + c} onClick={() => setColor(c)} />
            ))}
          </div>
        </div>
        <button className="btn" style={{ width: '100%' }}>Familie anlegen</button>
        <button type="button" className="btn ghost" style={{ width: '100%', marginTop: 8 }} onClick={() => setJoinOpen(true)}>🔗 Familie beitreten (mit Sync-Code)</button>
        <button type="button" className="btn ghost" style={{ width: '100%', marginTop: 8 }} onClick={onDemo}>🎬 Erst mal die Demo ansehen</button>
        <p className="hint">Alles bleibt auf diesem Gerät – keine Datenbank, kein Server. Backup gibt’s unter „Familie“. Die Demo füllt Eselsohr mit einer Beispielfamilie zum Ausprobieren – Beenden geht jederzeit unter „Familie“.</p>
      </form>
    </div>
  )
}

/* ================= Demo-Familie (Beispieldaten, jederzeit löschbar) ================= */

function demoData() {
  const t = iso(new Date())
  const jan = uid(), anne = uid(), emma = uid(), ben = uid(), julia = uid(), sarah = uid()
  const wd = wdIdx(fromIso(t))
  const nextFr = ((4 - wd + 7) % 7) || 7
  const ev = (o) => ({ id: uid(), status: 'fix', meta: '', created_by: jan, ...o })
  return {
    demo: true,
    family: { name: 'Familie Muster' },
    members: [
      { id: jan, name: 'Jan', color: '#3D7BFF', kind: 'adult', is_admin: true, can_direct: true, modules: { sport: true }, sportGoal: 2 },
      { id: anne, name: 'Anne', color: '#FF5D73', kind: 'adult', is_admin: false, can_direct: true, modules: { praxis: true } },
      { id: emma, name: 'Emma', color: '#8B5CF6', kind: 'kid', care: [{ id: uid(), label: 'Schule', days: [0, 1, 2, 3, 4], from: '07:45', to: '13:15' }] },
      { id: ben, name: 'Ben', color: '#2FBF71', kind: 'kid' },
    ],
    events: [
      ev({ member_id: emma, on_date: addDays(t, -14), at_time: '15:30', title: 'Klavierstunde' }),
      ev({ member_id: emma, on_date: addDays(t, -7), at_time: '15:30', title: 'Klavierstunde' }),
      ev({ member_id: emma, on_date: t, at_time: '15:30', title: 'Klavierstunde', zust: anne }),
      ev({ member_id: anne, created_by: anne, on_date: addDays(t, -1), at_time: '09:00', title: '🩺 Nachsorge Julia M.', klid: julia, ptype: 'Nachsorge', soll: 60 }),
      ev({ member_id: anne, created_by: anne, on_date: addDays(t, 1), at_time: '10:00', title: '🩺 Nachsorge Julia M.', klid: julia, ptype: 'Nachsorge', soll: 60 }),
      ev({ member_id: ben, on_date: addDays(t, 2), at_time: '16:00', title: 'Kinderarzt Vorsorge', meta: 'U-Heft mitnehmen' }),
      ev({ member_id: ben, on_date: addDays(t, nextFr), at_time: '17:00', title: 'Fußballtraining', serie: true }),
      ev({ member_id: ben, on_date: addDays(t, nextFr + 7), at_time: '17:00', title: 'Fußballtraining', serie: true }),
      ev({ member_id: jan, created_by: anne, on_date: addDays(t, 4), at_time: '19:30', title: 'Elternabend Emma', status: 'pending', meta: 'Einer von uns sollte hin' }),
    ],
    items: [
      { id: uid(), list: 'einkauf', text: 'Milch & Brot', done: false, created_by: anne },
      { id: uid(), list: 'einkauf', text: 'Geschenkpapier', done: false, created_by: jan },
      { id: uid(), list: 'todo', text: 'Fahrrad von Emma zur Werkstatt', done: false, created_by: jan },
    ],
    praxis: {
      klienten: [
        { id: julia, name: 'Julia Müller', telefon: '0170 1234567', adresse: 'Gartenweg 12, 48231 Warendorf', notiz: '2. Kind, Geburt 28.7.' },
        { id: sarah, name: 'Sarah Klein', telefon: '0151 7654321', adresse: 'Lindenstr. 4, 48231 Warendorf', notiz: 'ET 12.9.' },
      ],
    },
    inbox: [
      { id: uid(), member_id: jan, text: 'Geschenk für Oma besorgen – Idee: Fotobuch', ts: 1, date: 'gestern' },
      { id: uid(), member_id: jan, text: 'Zoo am Wochenende?', ts: 2, date: 'gestern' },
      { id: uid(), member_id: jan, text: 'Reifenwechsel-Termin machen', ts: 3, date: 'heute' },
    ],
    geburtstage: [
      { id: uid(), name: 'Oma Helga', date: `${+addDays(t, 2).slice(8, 10)}.${+addDays(t, 2).slice(5, 7)}.1949`, tel: '0171 2223344' },
      { id: uid(), name: 'Tante Mia', date: '03.11.1985', tel: '' },
    ],
    memories: {},
    active: jan,
  }
}

/* ================= Profilwahl ================= */

function ProfilePicker({ members, onPick }) {
  return (
    <div className="auth-wrap">
      <div className="auth-card">
        <h1 className="serif">👋 Wer bist du?</h1>
        <p className="sub">Jede Person hat ihr eigenes Profil – und sieht nur, was sie darf.</p>
        <div className="profiles">
          {members.map((m) => (
            <button key={m.id} className="profile" onClick={() => onPick(m.id)}>
              <span className="pav" style={{ background: m.color }}>{m.name[0].toUpperCase()}</span>
              <b>{m.name}</b>
              <span className="role">{m.kind === 'kid' ? 'Kind' : m.is_admin ? 'Familien-Admin' : 'Erwachsen'}</span>
            </button>
          ))}
        </div>
        <p className="hint">Antippen genügt. Der Gedächtnispalast hat zusätzlich sein eigenes Passwort.</p>
      </div>
    </div>
  )
}

/* ================= Termin-Formular ================= */

function EventSheet({ initial, members, me, stats, onSave, onDelete, onClose }) {
  const e = initial.event
  if (e && ((e.klid && e.created_by !== me.id) || (e.src === 'work' && e.member_id !== me.id))) {
    const isPraxis = !!e.klid
    return (
      <div className="overlay" onClick={(ev) => { if (ev.target === ev.currentTarget) onClose() }}>
        <div className="sheet">
          <h3>{isPraxis ? '🩺 Praxis · belegt' : '💼 Arbeit'}<button type="button" className="x" onClick={onClose} aria-label="Schließen">✕</button></h3>
          <div className="card" style={{ marginBottom: 12 }}>
            <div className="fact"><b>Wann</b><span>{fmtDate(e.on_date)} · {e.at_time} Uhr</span></div>
            <div className="fact"><b>Wer</b><span>{members.find((m) => m.id === e.member_id)?.name || '—'}</span></div>
          </div>
          <p className="hint" style={{ marginTop: 0 }}>
            Mehr zeigt Eselsohr hier bewusst nicht: {isPraxis ? 'Praxis-Details (Namen, Inhalte) sieht nur, wem das Praxis-Modul gehört.' : 'Arbeits-Details sieht nur die Person selbst.'} Nicht mehr Infos als nötig.
          </p>
          <button className="btn" style={{ width: '100%' }} onClick={onClose}>Alles klar</button>
        </div>
      </div>
    )
  }
  if (e && e.src === 'verein') {
    return (
      <div className="overlay" onClick={(ev) => { if (ev.target === ev.currentTarget) onClose() }}>
        <div className="sheet">
          <h3>⚽ {e.title}<button type="button" className="x" onClick={onClose} aria-label="Schließen">✕</button></h3>
          <div className="card" style={{ marginBottom: 12 }}>
            <div className="fact"><b>Wann</b><span>{fmtDate(e.on_date)} · {e.at_time} Uhr</span></div>
            <div className="fact"><b>Details</b><span>{e.meta}</span></div>
            <div className="fact"><b>Für</b><span>{members.find((m) => m.id === e.member_id)?.name || '—'}</span></div>
          </div>
          <p className="hint" style={{ marginTop: 0 }}>
            Dieser Termin kommt aus der <b>Vereins-App</b> und wird automatisch aktuell gehalten –
            Verlegungen und Absagen übernimmt Eselsohr beim nächsten Sync von selbst.
            Ändern oder absagen bitte direkt in der Vereins-App.
          </p>
          <button className="btn" style={{ width: '100%' }} onClick={onClose}>Alles klar</button>
        </div>
      </div>
    )
  }
  const [title, setTitle] = useState(e ? e.title : '')
  const [memberId, setMemberId] = useState(e ? e.member_id : me.id)
  const [date, setDate] = useState(e ? e.on_date : initial.date)
  const [time, setTime] = useState(e ? e.at_time : '15:00')
  const [meta, setMeta] = useState(e ? e.meta : '')
  const [zust, setZust] = useState(e?.zust || '')
  const [serie, setSerie] = useState(false)
  const [autoFilled, setAutoFilled] = useState(false)

  const changeTitle = (v) => {
    setTitle(v)
    if (!e && stats) {
      const s = stats[v.trim().toLowerCase()]
      if (s && s.count >= 2) {
        setTime(s.time)
        if (s.member) setMemberId(s.member)
        if (s.zust) setZust(s.zust)
        setAutoFilled(true)
      }
    }
  }

  return (
    <div className="overlay" onClick={(ev) => { if (ev.target === ev.currentTarget) onClose() }}>
      <form className="sheet" onSubmit={(ev) => {
        ev.preventDefault()
        if (title.trim()) onSave({ title: title.trim(), member_id: memberId, on_date: date, at_time: time, meta: meta.trim(), zust: zust || null, serie })
      }}>
        <h3>{e ? 'Termin bearbeiten' : 'Neuer Termin'}<button type="button" className="x" onClick={onClose} aria-label="Schließen">✕</button></h3>
        <div className="field">
          <label htmlFor="f-title">Titel</label>
          <input id="f-title" autoFocus required value={title} onChange={(ev) => changeTitle(ev.target.value)}
            placeholder="z. B. Fußballtraining" list="f-title-suggest" autoComplete="off" />
          <datalist id="f-title-suggest">
            {stats && Object.values(stats).filter((s) => s.count >= 2).sort((a, b) => b.count - a.count).slice(0, 8)
              .map((s) => <option key={s.title} value={s.title} />)}
          </datalist>
          {autoFilled && <p className="hint" style={{ margin: '4px 0 0' }}>✨ Assistent: Uhrzeit & Person aus früheren Terminen vorausgefüllt – anpassen jederzeit möglich.</p>}
        </div>
        <div className="grid2">
          <div className="field">
            <label htmlFor="f-who">Für wen?</label>
            <select id="f-who" value={memberId} onChange={(ev) => setMemberId(ev.target.value)}>
              {members.map((m) => <option key={m.id} value={m.id}>{m.name}</option>)}
            </select>
          </div>
          <div className="field">
            <label htmlFor="f-date">Tag</label>
            <input id="f-date" type="date" required value={date} onChange={(ev) => setDate(ev.target.value)} />
          </div>
        </div>
        <div className="grid2">
          <div className="field">
            <label htmlFor="f-time">Uhrzeit</label>
            <input id="f-time" type="time" required value={time} onChange={(ev) => setTime(ev.target.value)} />
          </div>
          <div className="field">
            <label htmlFor="f-zust">✋ Wer übernimmt? (bringt/holt/betreut)</label>
            <select id="f-zust" value={zust} onChange={(ev) => setZust(ev.target.value)}>
              <option value="">– noch offen –</option>
              {members.filter((m) => m.kind !== 'kid').map((m) => <option key={m.id} value={m.id}>{m.name}</option>)}
            </select>
          </div>
        </div>
        <div className="field">
          <label htmlFor="f-meta">Notiz (optional)</label>
          <input id="f-meta" value={meta} onChange={(ev) => setMeta(ev.target.value)} placeholder="z. B. Sportzeug mitgeben" />
        </div>
        {!e && (
          <div className="field checkline">
            <input type="checkbox" id="f-serie" checked={serie} onChange={(ev) => setSerie(ev.target.checked)} />
            <label htmlFor="f-serie">↻ Serientermin – die nächsten 8 Wochen</label>
          </div>
        )}
        <div className="actions">
          <button className="btn">Speichern</button>
          {e && <button type="button" className="btn danger" onClick={onDelete}>Löschen</button>}
        </div>
      </form>
    </div>
  )
}

/* ================= Gedächtnispalast (E2E-verschlüsselt, lokal) ================= */

const GROUPS = ['Familie', 'Freunde', 'Nachbarn', 'Verein', 'Arbeit', 'Schule & Kita', 'Sonstige']

/* Geburtstag: „16.08.1978“ oder „16.08.“ → Alter und Countdown */
function gebInfo(s) {
  const m = String(s || '').trim().match(/^(\d{1,2})\.(\d{1,2})\.?(\d{4})?$/)
  if (!m) return null
  const now = new Date()
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  let next = new Date(now.getFullYear(), +m[2] - 1, +m[1])
  if (next < today) next = new Date(now.getFullYear() + 1, +m[2] - 1, +m[1])
  const days = Math.round((next - today) / 86400000)
  return { days, age: m[3] ? next.getFullYear() - +m[3] : null }
}

/* Kontaktfoto: auf 128 px quadratisch verkleinern (wird verschlüsselt gespeichert) */
async function shrinkPhoto(file) {
  const url = URL.createObjectURL(file)
  try {
    const img = await new Promise((res, rej) => { const i = new Image(); i.onload = () => res(i); i.onerror = rej; i.src = url })
    const c = document.createElement('canvas')
    c.width = c.height = 128
    const s = Math.min(img.width, img.height)
    c.getContext('2d').drawImage(img, (img.width - s) / 2, (img.height - s) / 2, s, s, 0, 0, 128, 128)
    return c.toDataURL('image/jpeg', 0.82).split(',')[1]
  } finally {
    URL.revokeObjectURL(url)
  }
}

const PersonAvatar = ({ p, size = 38 }) => p.foto
  ? <img className="avatar member" style={{ width: size, height: size, objectFit: 'cover', background: 'none' }} src={'data:image/jpeg;base64,' + p.foto} alt="" />
  : <span className="avatar" style={{ width: size, height: size, fontSize: size * 0.4 }}>{(p.name || '?')[0].toUpperCase()}</span>

/* Professionelles Kontaktformular – Eingaben bleiben einfache Textfelder */
function PersonSheet({ existing, onSave, onClose, toast }) {
  const [f, setF] = useState(() => ({
    name: existing?.name || '', gruppe: existing?.gruppe || 'Sonstige', ctx: existing?.ctx || '',
    firma: existing?.firma || '', telefon: existing?.telefon || '', email: existing?.email || '',
    adresse: existing?.adresse || '', geb: existing?.geb || '', kennengelernt: existing?.kennengelernt || '',
    familie: existing?.familie || '', themen: existing?.themen || '', faden: existing?.faden || '',
    foto: existing?.foto || null,
  }))
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value })
  const fotoInput = useRef()
  const field = (k, label, ph, type) => (
    <div className="field">
      <label htmlFor={'pf-' + k}>{label}</label>
      <input id={'pf-' + k} type={type || 'text'} value={f[k]} onChange={set(k)} placeholder={ph || ''} />
    </div>
  )
  return (
    <div className="overlay" onClick={(e) => { if (e.target === e.currentTarget) onClose() }}>
      <form className="sheet" style={{ maxWidth: 480 }} onSubmit={(e) => {
        e.preventDefault()
        if (f.name.trim()) onSave({ ...f, name: f.name.trim() }, existing?.id)
      }}>
        <h3>{existing ? 'Kontakt bearbeiten' : 'Neuer Kontakt'}<button type="button" className="x" onClick={onClose} aria-label="Schließen">✕</button></h3>
        <div style={{ display: 'flex', gap: 12, alignItems: 'center', marginBottom: 12 }}>
          <PersonAvatar p={f} size={56} />
          <button type="button" className="btn ghost sm" onClick={() => fotoInput.current?.click()}>
            {f.foto ? 'Foto ändern' : '📷 Foto hinzufügen'}
          </button>
          {f.foto && <button type="button" className="btn ghost sm" onClick={() => setF({ ...f, foto: null })}>Entfernen</button>}
          <input ref={fotoInput} type="file" accept="image/*" style={{ display: 'none' }}
            onChange={async (e) => {
              const file = e.target.files?.[0]
              e.target.value = ''
              if (!file) return
              try { setF({ ...f, foto: await shrinkPhoto(file) }) } catch { toast('Foto konnte nicht gelesen werden') }
            }} />
        </div>
        <div className="grid2">
          {field('name', 'Name *', 'z. B. Jürgen Weber')}
          <div className="field">
            <label htmlFor="pf-gruppe">Gruppe</label>
            <select id="pf-gruppe" value={f.gruppe} onChange={set('gruppe')}>
              {GROUPS.map((g) => <option key={g} value={g}>{g}</option>)}
            </select>
          </div>
        </div>
        <div className="grid2">
          {field('ctx', 'Woher / Rolle', 'z. B. Nachbar · seit 2019')}
          {field('firma', 'Firma / Beruf', 'z. B. Schreinerei Weber')}
        </div>
        <div className="grid2">
          {field('telefon', 'Telefon', 'für 📞 Anrufen', 'tel')}
          {field('email', 'E-Mail', 'für ✉️ Schreiben', 'email')}
        </div>
        {field('adresse', 'Adresse', 'für 🚗 Route')}
        <div className="grid2">
          {field('geb', 'Geburtstag', '16.08.1978 oder 16.08.')}
          {field('kennengelernt', 'Kennengelernt', 'z. B. 2019, Straßenfest')}
        </div>
        {field('familie', 'Familie & Umfeld', 'Partner, Kinder (Vornamen!), Haustiere')}
        {field('themen', 'Themen & Hobbys', 'worüber man immer reden kann')}
        {field('faden', 'Offener Faden', 'letztes Gespräch, offene Frage')}
        <button className="btn" style={{ width: '100%' }}>Speichern</button>
      </form>
    </div>
  )
}

/* Startseiten „Ordnung“: nehmen das Anlegen ab – reinschreiben genügt */
const ORDNUNG_PAGES = [
  ['Kopf leeren', 'Alles hier rein, ungefiltert. **Stichworte reichen.**\nNichts auf dieser Seite muss schön oder vollständig sein.\n\n[ ] …\n[ ] …\n[ ] …\n\nWenn der Kopf leer ist, verteile die Zeilen auf:\n[[Diese Woche wirklich wichtig]] · [[Darf warten]] · [[Gehört nicht mir · darf weg]]'],
  ['Diese Woche wirklich wichtig', 'Maximal **drei**. Alles darüber ist keine Priorität, sondern eine Liste.\n\n[ ] …\n[ ] …\n[ ] …'],
  ['Darf warten', 'Bekommt ein Datum – und darf bis dahin raus aus deinem Kopf.\n\n- …'],
  ['Gehört nicht mir · darf weg', '# Gehört nicht mir\nWas du für andere im Kopf trägst. Zurückgeben oder ansprechen.\n- …\n\n# Darf weg\nWas niemand von dir verlangt außer du selbst. Streichen ist erlaubt.\n- …'],
  ['Gut gemacht', '**Perfekt ist nicht das Ziel. Erledigt ist das Ziel.**\nJede Woche mindestens eine Zeile – auch kleine zählen:\n\n- …'],
  ['4 Säulen der Empathie', 'Deine Stärke – und dein größter Energiefresser. So nutzt du sie, ohne dich zu verausgaben:\n\n# 1. Wahrnehmen\nDu merkst sofort, wie es anderen geht. → Nach dem Gespräch **kurz bei der Person notieren** – dann darf dein Kopf loslassen.\n\n# 2. Verstehen\nWarum geht es jemandem so? → Steht im Spickzettel: Familie, Themen, offener Faden.\n\n# 3. Mitfühlen\nMitgefühl ja – **Mittragen nein**. Die Last der anderen ist nicht deine Aufgabe.\n\n# 4. Handeln\nKlein handeln reicht: eine gute Frage stellen, ein Eselsohr setzen, einmal ✋ übernehmen.\n\nMerksatz: **wahrnehmen → notieren → loslassen.** #ordnung'],
]

const EMPTY_MEMORY = { persons: [], docs: [], sections: [] }
const SEC_COLORS = ['#8B5CF6', '#FF5D73', '#FFB02E', '#2FBF71', '#00B8C4', '#FF7A3D']
const TAG_RE = /#[A-Za-z0-9äöüÄÖÜß_-]+/g

/* Lese-Ansicht einer Palast-Seite: [[Links]], #Schlagworte, Aufgaben,
   Überschriften, Listen und **fett** – alles klickbar. */
function PageView({ text, onToggleLine, onLink, onTag }) {
  const lines = String(text || '').split('\n')
  const inline = (str) => {
    return String(str).split(/(\[\[[^\]]+\]\]|#[A-Za-z0-9äöüÄÖÜß_-]+|\*\*[^*]+\*\*)/g).map((p, i) => {
      if (/^\[\[.+\]\]$/.test(p)) {
        const t = p.slice(2, -2).trim()
        return <button key={i} type="button" className="wikilink" onClick={() => onLink(t)}>{t}</button>
      }
      if (/^#[A-Za-z0-9äöüÄÖÜß_-]+$/.test(p)) {
        return <button key={i} type="button" className="tagchip" onClick={() => onTag(p)}>{p}</button>
      }
      if (/^\*\*[^*]+\*\*$/.test(p)) return <b key={i}>{p.slice(2, -2)}</b>
      return p
    })
  }
  return (
    <div className="pageview">
      {lines.map((ln, i) => {
        if (ln.startsWith('## ')) return <h4 key={i}>{inline(ln.slice(3))}</h4>
        if (ln.startsWith('# ')) return <h3 key={i}>{inline(ln.slice(2))}</h3>
        const task = ln.match(/^\[( |x)\] ?(.*)$/)
        if (task) return (
          <label key={i} className="pv-task">
            <input type="checkbox" className="check" checked={task[1] === 'x'} onChange={() => onToggleLine(i)} />
            <span className={task[1] === 'x' ? 'done-text' : ''}>{inline(task[2])}</span>
          </label>
        )
        if (ln.startsWith('- ')) return <div key={i} className="pv-li">•&nbsp; {inline(ln.slice(2))}</div>
        if (!ln.trim()) return <div key={i} style={{ height: 10 }} />
        return <p key={i}>{inline(ln)}</p>
      })}
    </div>
  )
}

function Merkzeug({ blob, onSaveBlob, ownerName, toast, inbox = [], onImportInbox }) {
  const [state, setState] = useState('locked')
  const [pw, setPw] = useState('')
  const [err, setErr] = useState(null)
  const [key, setKey] = useState(null)
  const [salt, setSalt] = useState(null)
  const [mem, setMem] = useState(EMPTY_MEMORY)
  const [isNew, setIsNew] = useState(false)
  const [q, setQ] = useState('')
  const [sel, setSel] = useState(null)
  const [sec, setSec] = useState('_personen')
  const [pageId, setPageId] = useState(null)
  const [pageMode, setPageMode] = useState('view')
  const [addSec, setAddSec] = useState('')
  const [personSheet, setPersonSheet] = useState(null) // 'new' | Personen-ID
  const [gFilter, setGFilter] = useState(null)
  const [docSel, setDocSel] = useState(null)
  const docInput = useRef()
  const flushTimer = useRef()
  const pendingMem = useRef(null)
  const [addName, setAddName] = useState('')
  const [addCtx, setAddCtx] = useState('')

  async function unlock(e) {
    e.preventDefault()
    if (!pw) return
    setState('busy')
    setErr(null)
    try {
      if (blob) {
        const k = await deriveKey(pw, blob.salt)
        try {
          const obj = await decryptJson(k, blob.iv, blob.cipher)
          setKey(k); setSalt(blob.salt)
          let merged = { persons: obj.persons || [], docs: obj.docs || [], sections: obj.sections || [] }
          // Blitzzettel jetzt verschlüsselt in den 📥 Eingang übernehmen
          if (inbox.length) {
            let secs = merged.sections
            let ein = secs.find((x) => x.name === '📥 Eingang')
            if (!ein) { ein = { id: uid(), name: '📥 Eingang', color: '#FFB02E', pages: [] }; secs = [ein, ...secs] }
            const pages = inbox.map((i) => ({
              id: uid(), title: i.text.split('\n')[0].slice(0, 42), text: i.text + '\n\n· Blitzzettel vom ' + i.date,
              updated: i.date, ts: i.ts,
            }))
            merged = { ...merged, sections: secs.map((x) => (x.id === ein.id ? { ...x, pages: [...pages, ...x.pages] } : x)) }
            const enc2 = await encryptJson(k, merged)
            onSaveBlob({ salt: blob.salt, ...enc2 }, { clearInbox: true })
            toast(`⚡ ${inbox.length} Blitzzettel verschlüsselt in den Eingang übernommen`)
          }
          setMem(merged)
          setIsNew(false); setState('open')
          toast('Entsperrt – nur auf diesem Gerät lesbar')
        } catch {
          setErr('Falsches Gedächtnis-Passwort.')
          setState('locked')
        }
      } else {
        const s = newSalt()
        const k = await deriveKey(pw, s)
        let starter = { ...EMPTY_MEMORY, sections: [{ id: uid(), name: 'Notizen', color: SEC_COLORS[0], pages: [] }] }
        if (inbox.length) {
          starter = {
            ...starter,
            sections: [{
              id: uid(), name: '📥 Eingang', color: '#FFB02E',
              pages: inbox.map((i) => ({ id: uid(), title: i.text.split('\n')[0].slice(0, 42), text: i.text + '\n\n· Blitzzettel vom ' + i.date, updated: i.date, ts: i.ts })),
            }, ...starter.sections],
          }
        }
        setKey(k); setSalt(s); setMem(starter); setIsNew(true); setState('open')
        const enc = await encryptJson(k, starter)
        onSaveBlob({ salt: s, ...enc }, { clearInbox: inbox.length > 0 })
        toast('Neues Gedächtnis angelegt – merk dir dieses Passwort gut!')
      }
      setPw('')
    } catch (e2) {
      setErr(String(e2.message || e2))
      setState('locked')
    }
  }

  async function persist(next) {
    setMem(next)
    const enc = await encryptJson(key, next)
    onSaveBlob({ salt, ...enc })
  }

  // Tipp-Änderungen sammeln und gebündelt verschlüsselt speichern
  function schedulePersist(next) {
    setMem(next)
    pendingMem.current = next
    clearTimeout(flushTimer.current)
    flushTimer.current = setTimeout(flushPersist, 600)
  }
  function flushPersist() {
    if (pendingMem.current) {
      persist(pendingMem.current)
      pendingMem.current = null
    }
  }

  function savePerson(data, id) {
    persist(id
      ? { ...mem, persons: mem.persons.map((x) => (x.id === id ? { ...x, ...data } : x)) }
      : { ...mem, persons: [{ id: uid(), notizen: [], ...data }, ...mem.persons] })
    setPersonSheet(null)
    toast(id ? 'Kontakt gespeichert ✓' : data.name + ' angelegt ✓ – verschlüsselt')
  }

  function lock() {
    flushPersist()
    setKey(null); setMem(EMPTY_MEMORY); setSel(null); setDocSel(null); setPageId(null); setState('locked'); setQ('')
    toast('Gesperrt 🔒')
  }

  async function addDoc(file) {
    if (file.size > 1_500_000) {
      toast('Zu groß (max. 1,5 MB) – größere Archive kommen mit der Cloud-Stufe')
      return
    }
    const b64 = await new Promise((res, rej) => {
      const r = new FileReader()
      r.onload = () => res(String(r.result).split(',')[1] || '')
      r.onerror = rej
      r.readAsDataURL(file)
    })
    await persist({
      ...mem,
      docs: [{ id: uid(), name: file.name, mime: file.type || 'application/octet-stream', size: file.size, b64, added: iso(new Date()) }, ...(mem.docs || [])],
    })
    toast('Hochgeladen & verschlüsselt ✓ – ohne Passwort unlesbar')
  }

  async function saveDoc(doc) {
    const bytes = Uint8Array.from(atob(doc.b64), (c) => c.charCodeAt(0))
    if (window.claude?.downloads) {
      try {
        await window.claude.downloads.save({ filename: doc.name, data: bytes })
        toast('Gespeichert ✓')
      } catch (e) {
        toast(e?.code === 'declined' ? 'Speichern abgebrochen' : 'Speichern hier nicht möglich – in der installierten App klappt es')
      }
      return
    }
    try {
      const a = document.createElement('a')
      a.href = URL.createObjectURL(new Blob([bytes], { type: doc.mime }))
      a.download = doc.name
      a.click()
      toast('Gespeichert ✓')
    } catch {
      toast('Speichern fehlgeschlagen')
    }
  }

  if (state !== 'open') {
    return (
      <section className="screen">
        <h2 className="screen-title">Gedächtnispalast</h2>
        <p className="screen-sub">{ownerName}s privates Gedächtnis – Ende-zu-Ende-verschlüsselt</p>
        <form className="card lockbox" onSubmit={unlock}>
          <div className="lock-ico">🔐</div>
          <h3>Nur du hast den Schlüssel</h3>
          <p>Entschlüsselt wird ausschließlich auf diesem Gerät. Es gibt kein „Passwort vergessen“ – das ist der Sinn der Sache.</p>
          {err && <div className="authmsg err" style={{ maxWidth: 320, margin: '0 auto 12px' }}>{err}</div>}
          <div className="pwrow">
            <input type="password" value={pw} onChange={(e) => setPw(e.target.value)} placeholder="Gedächtnis-Passwort" aria-label="Gedächtnis-Passwort" />
            <button className="btn" disabled={state === 'busy'}>{state === 'busy' ? '…' : 'Entsperren'}</button>
          </div>
          <div className="hint">{blob ? 'Gib dein Gedächtnis-Passwort ein.' : 'Beim ersten Mal legst du mit deinem Passwort ein neues Gedächtnis an.'}</div>
        </form>
      </section>
    )
  }

  if (sel) {
    const p = mem.persons.find((x) => x.id === sel)
    if (!p) { setSel(null); return null }
    const upd = (patch) => persist({ ...mem, persons: mem.persons.map((x) => (x.id === p.id ? { ...x, ...patch } : x)) })
    const gi = gebInfo(p.geb)
    return (
      <section className="screen">
        <button className="btn ghost" style={{ margin: '12px 0 10px' }} onClick={() => setSel(null)}>‹ Zurück</button>
        <div style={{ display: 'flex', gap: 14, alignItems: 'center', margin: '4px 2px 8px' }}>
          <PersonAvatar p={p} size={64} />
          <div style={{ minWidth: 0 }}>
            <h2 className="screen-title serif" style={{ margin: 0 }}>{p.name}</h2>
            <p className="screen-sub" style={{ margin: 0 }}>
              {[p.ctx, p.firma].filter(Boolean).join(' · ') || 'Woher kennt ihr euch?'}
            </p>
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginTop: 4 }}>
              {p.gruppe && <span className="chip brand">{p.gruppe}</span>}
              {gi && gi.days <= 14 && <span className="chip honey">🎂 {gi.days === 0 ? 'HEUTE' : 'in ' + gi.days + ' Tag' + (gi.days === 1 ? '' : 'en')}{gi.age ? ' · wird ' + gi.age : ''}</span>}
            </div>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 14 }}>
          {p.telefon && <a className="btn" href={'tel:' + p.telefon}>📞 Anrufen</a>}
          {p.email && <a className="btn ghost" href={'mailto:' + p.email}>✉️ Schreiben</a>}
          {p.adresse && <a className="btn ghost" href={'https://www.google.com/maps/search/?api=1&query=' + encodeURIComponent(p.adresse)} target="_blank" rel="noreferrer">🚗 Route</a>}
          <button className="btn ghost" onClick={() => setPersonSheet(p.id)}>✏️ Bearbeiten</button>
        </div>
        <div className="card">
          {[
            ['Familie', p.familie], ['Themen', p.themen], ['Offener Faden', p.faden],
            ['Geburtstag', p.geb ? p.geb + (gi?.age ? ` · wird ${gi.age}` : '') + (gi ? ` · in ${gi.days} Tagen` : '') : ''],
            ['Kennengelernt', p.kennengelernt], ['Telefon', p.telefon], ['E-Mail', p.email], ['Adresse', p.adresse],
          ].filter(([, v]) => v).map(([label, v]) => (
            <div className="fact" key={label}><b>{label}</b><span>{v}</span></div>
          ))}
          {!p.familie && !p.themen && !p.telefon && (
            <div className="empty">Noch wenig bekannt – „✏️ Bearbeiten“ öffnet das vollständige Kontaktformular.</div>
          )}
        </div>
        {(p.faden || p.themen) && (
          <div className="qcard">
            <h4>💬 Einstiegsfragen</h4>
            <ul>
              {p.faden && <li>Frag nach: {p.faden}</li>}
              {p.themen && <li>Themen, die immer gehen: {p.themen}</li>}
            </ul>
          </div>
        )}
        <p className="label">Notizen</p>
        <div className="card">
          {(p.notizen || []).map((n, i) => <div className="fact" key={i}><span>{n}</span></div>)}
          {!(p.notizen || []).length && <div className="empty">Noch keine Notizen.</div>}
          <QuickAdd placeholder="Nach dem Gespräch: kurz festhalten …" onAdd={(v) => {
            const d = new Date()
            upd({ notizen: [`${d.getDate()}.${d.getMonth() + 1}. – ${v}`, ...(p.notizen || [])] })
            toast('Gemerkt ✓ (verschlüsselt gespeichert)')
          }} />
        </div>
        {(() => {
          const mentions = (mem.sections || []).flatMap((s2) =>
            s2.pages.filter((pg) => (pg.text || '').toLowerCase().includes('[[' + (p.name || '').toLowerCase() + ']]')).map((pg) => ({ s2, pg })))
          return mentions.length > 0 && (
            <>
              <p className="label">↩ Erwähnt auf Seiten</p>
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                {mentions.map(({ s2, pg }) => (
                  <button key={pg.id} type="button" className="wikilink"
                    onClick={() => { setSel(null); setSec(s2.id); setPageId(pg.id); setPageMode('view') }}>
                    {pg.title || 'Unbenannte Seite'}
                  </button>
                ))}
              </div>
            </>
          )
        })()}
        <p className="hint">
          <button className="btn danger sm" onClick={() => { persist({ ...mem, persons: mem.persons.filter((x) => x.id !== p.id) }); setSel(null) }}>
            Kontakt löschen
          </button>
        </p>
        {personSheet !== null && (
          <PersonSheet existing={personSheet === 'new' ? null : mem.persons.find((x) => x.id === personSheet)}
            onSave={savePerson} onClose={() => setPersonSheet(null)} toast={toast} />
        )}
      </section>
    )
  }

  const ql = q.trim().toLowerCase()
  const sections = mem.sections || []
  const curSec = sections.find((s) => s.id === sec)
  const curPage = curSec?.pages.find((p) => p.id === pageId)
  const stamp = () => { const d = new Date(); return `${d.getDate()}.${d.getMonth() + 1}.${d.getFullYear()}` }
  const updSections = (fn) => schedulePersist({ ...mem, sections: fn(sections) })

  const updPage = (patch) => updSections((ss) => ss.map((s) =>
    s.id === curSec.id ? { ...s, pages: s.pages.map((p) => (p.id === pageId ? { ...p, ...patch, updated: stamp(), ts: Date.now() } : p)) } : s))

  const addPage = () => {
    const np = { id: uid(), title: '', text: '', updated: stamp(), ts: Date.now() }
    updSections((ss) => ss.map((s) => (s.id === curSec.id ? { ...s, pages: [np, ...s.pages] } : s)))
    setPageId(np.id)
    setPageMode('edit')
  }

  /* Vernetzung: alle Seiten, Rückverweise, Schlagworte, Link-Navigation */
  const allPages = sections.flatMap((s) => s.pages.map((p) => ({ s, p })))
  const backlinksOf = (title) => title
    ? allPages.filter(({ p }) => p.id !== pageId && (p.text || '').toLowerCase().includes('[[' + title.toLowerCase() + ']]'))
    : []
  const allTags = [...new Set(allPages.flatMap(({ p }) => (p.text || '').match(TAG_RE) || []))].slice(0, 14)

  const openPageRef = (s, p, mode) => { setSel(null); setSec(s.id); setPageId(p.id); setPageMode(mode || (p.text ? 'view' : 'edit')) }

  const followLink = (target) => {
    const t = target.toLowerCase()
    const hitPage = allPages.find(({ p }) => (p.title || '').toLowerCase() === t)
    if (hitPage) { openPageRef(hitPage.s, hitPage.p); return }
    const hitPerson = mem.persons.find((x) => (x.name || '').toLowerCase() === t)
    if (hitPerson) { setSel(hitPerson.id); return }
    // Ziel gibt es noch nicht: Seite im aktuellen Abschnitt anlegen
    if (curSec) {
      const np = { id: uid(), title: target, text: '', updated: stamp(), ts: Date.now() }
      updSections((ss) => ss.map((s) => (s.id === curSec.id ? { ...s, pages: [np, ...s.pages] } : s)))
      setPageId(np.id)
      setPageMode('edit')
      toast(`Neue Seite „${target}“ angelegt – Verknüpfung steht ✓`)
    }
  }

  const toggleTaskLine = (lineIdx) => {
    const lines = String(curPage.text || '').split('\n')
    lines[lineIdx] = lines[lineIdx].startsWith('[x]')
      ? lines[lineIdx].replace('[x]', '[ ]')
      : lines[lineIdx].replace('[ ]', '[x]')
    updPage({ text: lines.join('\n') })
  }

  const addSection = () => {
    const name = addSec.trim()
    if (!name) return
    const ns = { id: uid(), name, color: SEC_COLORS[sections.length % SEC_COLORS.length], pages: [] }
    updSections((ss) => [...ss, ns])
    setSec(ns.id); setPageId(null); setAddSec('')
    toast(`Abschnitt „${name}“ angelegt ✓`)
  }

  const search = ql ? {
    persons: mem.persons.filter((p) => [p.name, p.ctx, p.firma, p.gruppe, p.telefon, p.email, p.adresse, p.kennengelernt, p.familie, p.themen, p.faden, p.geb, (p.notizen || []).join(' ')].join(' ').toLowerCase().includes(ql)),
    pages: sections.flatMap((s) => s.pages.filter((p) => (p.title + ' ' + p.text).toLowerCase().includes(ql)).map((p) => ({ s, p }))),
    docs: (mem.docs || []).filter((d) => d.name.toLowerCase().includes(ql)),
  } : null

  return (
    <section className="screen">
      <div className="title-row">
        <div>
          <h2 className="screen-title">Gedächtnispalast</h2>
          <p className="screen-sub">{mem.persons.length} Personen · {sections.reduce((a, s) => a + s.pages.length, 0)} Seiten · {(mem.docs || []).length} Dokumente · alles verschlüsselt</p>
        </div>
        <button className="btn ghost sm" onClick={lock}>🔒 Sperren</button>
      </div>
      {isNew && (
        <div className="qcard" style={{ marginBottom: 14 }}>
          <h4>Wichtig</h4>
          <ul>
            <li>Dein Gedächtnis-Passwort lässt sich <b>nicht zurücksetzen</b>. Schreib es auf und leg es sicher ab.</li>
            <li>Abschnitte wie in OneNote: 👥 Personen und 📄 Dokumente sind fest – eigene Abschnitte legst du unten links an.</li>
          </ul>
        </div>
      )}
      <input className="search" value={q} onChange={(e) => setQ(e.target.value)}
        placeholder="Alles durchsuchen: Personen, Seiten, Dokumente, #schlagworte …" aria-label="Im Gedächtnis suchen" />
      {!ql && allTags.length > 0 && (
        <div className="legend" style={{ margin: '0 0 12px' }}>
          {allTags.map((t) => <button key={t} type="button" className="tagchip" onClick={() => setQ(t)}>{t}</button>)}
        </div>
      )}
      {ql ? (
        <div className="card">
          {search.persons.map((p) => (
            <button className="row" key={p.id} onClick={() => { setQ(''); setSel(p.id) }}>
              <span className="avatar">{(p.name || '?')[0].toUpperCase()}</span>
              <div className="row-main"><div className="row-title">{p.name}</div><div className="row-meta">Person · {p.ctx || '—'}</div></div>
              <span className="chev">›</span>
            </button>
          ))}
          {search.pages.map(({ s, p }) => (
            <button className="row" key={p.id} onClick={() => { setQ(''); openPageRef(s, p) }}>
              <span className="osec-bar" style={{ background: s.color }} />
              <div className="row-main"><div className="row-title">{p.title || 'Unbenannte Seite'}</div><div className="row-meta">Seite in „{s.name}“ · {p.text.slice(0, 60)}</div></div>
              <span className="chev">›</span>
            </button>
          ))}
          {search.docs.map((d) => (
            <button className="row" key={d.id} onClick={() => { setQ(''); setSec('_dokumente'); setDocSel(d.id) }}>
              <RowIcon name='file' />
              <div className="row-main"><div className="row-title">{d.name}</div><div className="row-meta">Dokument</div></div>
              <span className="chev">›</span>
            </button>
          ))}
          {!search.persons.length && !search.pages.length && !search.docs.length && (
            <div className="empty">Kein Treffer für „{q}“.</div>
          )}
        </div>
      ) : (
      <div className="on-grid">
        <div className="on-rail">
          <button className={'osec' + (sec === '_personen' ? ' active' : '')} onClick={() => { setSec('_personen'); setPageId(null) }}>
            <span className="osec-bar" style={{ background: '#2FBF71' }} /><Icon name="user" size={15} /> Personen<span className="osec-cnt">{mem.persons.length}</span>
          </button>
          <button className={'osec' + (sec === '_dokumente' ? ' active' : '')} onClick={() => { setSec('_dokumente'); setPageId(null) }}>
            <span className="osec-bar" style={{ background: '#3D7BFF' }} /><Icon name="file" size={15} /> Dokumente<span className="osec-cnt">{(mem.docs || []).length}</span>
          </button>
          {sections.map((s) => (
            <button key={s.id} className={'osec' + (sec === s.id ? ' active' : '')}
              onClick={() => { setSec(s.id); const f = s.pages[0]; setPageId(f?.id || null); setPageMode(f?.text ? 'view' : 'edit') }}>
              <span className="osec-bar" style={{ background: s.color }} />{s.name}<span className="osec-cnt">{s.pages.length}</span>
              {sec === s.id && !s.pages.length && (
                <span className="xdel" role="button" aria-label="Abschnitt löschen" onClick={(e) => {
                  e.stopPropagation()
                  updSections((ss) => ss.filter((x) => x.id !== s.id))
                  setSec('_personen')
                  toast('Abschnitt gelöscht')
                }}>✕</span>
              )}
            </button>
          ))}
          <div className="quickadd" style={{ padding: '6px 0 0', borderTop: 0, background: 'transparent' }}>
            <input value={addSec} onChange={(e) => setAddSec(e.target.value)} placeholder="+ Neuer Abschnitt" aria-label="Neuer Abschnitt"
              onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addSection() } }} />
            <button type="button" className="btn sm" onClick={addSection}>+</button>
          </div>
          {!sections.some((x) => x.name.includes('Ordnung')) && (
            <button type="button" className="osec" style={{ borderStyle: 'dashed' }} onClick={() => {
              const ns = {
                id: uid(), name: '🧭 Ordnung', color: '#8B5CF6',
                pages: ORDNUNG_PAGES.map(([title, text], i) => ({ id: uid(), title, text, updated: stamp(), ts: Date.now() - i })),
              }
              updSections((ss) => [ns, ...ss])
              setSec(ns.id)
              setPageId(ns.pages[0].id)
              setPageMode('view')
              toast('🧭 Deine Ordnung steht – fang bei „Kopf leeren“ an. Stichworte reichen.')
            }}>
              <span className="osec-bar" style={{ background: '#8B5CF6' }} />🧭 Ordnung anlegen
            </button>
          )}
        </div>

        {sec === '_personen' && (
          <div className="on-wide">
            {(() => {
              const groups = [...new Set(mem.persons.map((p) => p.gruppe).filter(Boolean))]
              return groups.length > 0 && (
                <div className="legend" style={{ margin: '0 0 10px' }}>
                  {groups.map((g) => (
                    <button key={g} type="button" className={'chip' + (gFilter && gFilter !== g ? ' off' : '')}
                      onClick={() => setGFilter(gFilter === g ? null : g)}>{g}</button>
                  ))}
                </div>
              )
            })()}
            <div className="card">
              {[...mem.persons]
                .filter((p) => !gFilter || p.gruppe === gFilter)
                .sort((a, b) => {
                  const ga = gebInfo(a.geb), gb = gebInfo(b.geb)
                  return ((ga && ga.days <= 14) ? ga.days : 99) - ((gb && gb.days <= 14) ? gb.days : 99) || (a.name || '').localeCompare(b.name || '')
                })
                .map((p) => {
                  const gi = gebInfo(p.geb)
                  return (
                    <button className="row" key={p.id} onClick={() => setSel(p.id)}>
                      <PersonAvatar p={p} />
                      <div className="row-main">
                        <div className="row-title">{p.name}</div>
                        <div className="row-meta">{[p.ctx, p.firma].filter(Boolean).join(' · ') || p.gruppe || '—'}</div>
                      </div>
                      {gi && gi.days <= 14 && <span className="chip honey">🎂 {gi.days === 0 ? 'heute' : gi.days + ' Tg.'}</span>}
                      <span className="chev">›</span>
                    </button>
                  )
                })}
              {!mem.persons.length && <div className="empty">Noch keine Kontakte – leg unten den ersten an.</div>}
              <button className="row" onClick={() => setPersonSheet('new')}>
                <RowIcon name="user" />
                <div className="row-main">
                  <div className="row-title">Vollständigen Kontakt anlegen</div>
                  <div className="row-meta">Mit Foto, Gruppe, Telefon, Geburtstag, Adresse …</div>
                </div>
                <span className="chev">›</span>
              </button>
              <div className="quickadd">
                <input value={addName} onChange={(e) => setAddName(e.target.value)} placeholder="Schnell: Name" aria-label="Name" style={{ maxWidth: 130 }} />
                <input value={addCtx} onChange={(e) => setAddCtx(e.target.value)} placeholder="Woher? (z. B. Nachbar)" aria-label="Kontext" />
                <button type="button" className="btn sm" onClick={() => {
                  if (!addName.trim()) return
                  persist({ ...mem, persons: [{ id: uid(), name: addName.trim(), ctx: addCtx.trim(), gruppe: 'Sonstige', notizen: [] }, ...mem.persons] })
                  setAddName(''); setAddCtx('')
                  toast('Kontakt angelegt ✓ – Details jederzeit per ✏️')
                }}>+</button>
              </div>
            </div>
          </div>
        )}

        {sec === '_dokumente' && (
          <div className="on-wide card">
            {(mem.docs || []).map((d) => (
              <button className="row" key={d.id} onClick={() => setDocSel(d.id)}>
                <RowIcon name='file' />
                <div className="row-main">
                  <div className="row-title">{d.name}</div>
                  <div className="row-meta">{Math.round(d.size / 1024)} KB · {d.added} · 🔒 verschlüsselt gespeichert</div>
                </div>
                <span className="chev">›</span>
              </button>
            ))}
            {!(mem.docs || []).length && <div className="empty">Noch keine Dokumente. Scans und PDFs werden vor dem Speichern verschlüsselt – ohne dein Passwort sind sie unlesbar.</div>}
            <button className="row" onClick={() => docInput.current?.click()}>
              <RowIcon name="upload" />
              <div className="row-main">
                <div className="row-title">Dokument hinzufügen</div>
                <div className="row-meta">Foto, Scan oder PDF (max. 1,5 MB in dieser Stufe)</div>
              </div>
              <span className="chev">›</span>
            </button>
            <input ref={docInput} type="file" accept="image/*,application/pdf" style={{ display: 'none' }}
              onChange={(e) => { const f = e.target.files?.[0]; if (f) addDoc(f); e.target.value = '' }} />
          </div>
        )}

        {curSec && (
          <>
            <div className="on-pages">
              <button className="btn ghost sm" style={{ width: '100%' }} onClick={addPage}>+ Seite</button>
              {[...curSec.pages].sort((a, b) => (b.pin ? 1 : 0) - (a.pin ? 1 : 0) || (b.ts || 0) - (a.ts || 0)).map((p) => (
                <button key={p.id} className={'opage' + (p.id === pageId ? ' active' : '')}
                  onClick={() => { setPageId(p.id); setPageMode(p.text ? 'view' : 'edit') }}>
                  <div className="opage-t">{p.pin ? '📌 ' : ''}{p.title || 'Unbenannte Seite'}</div>
                  <div className="opage-d">{p.updated}{p.text ? ' · ' + p.text.slice(0, 34) : ''}</div>
                </button>
              ))}
              {!curSec.pages.length && <div className="empty" style={{ borderBottom: 0 }}>Noch keine Seiten.</div>}
            </div>
            <div className="on-editor">
              {curPage ? (
                <>
                  <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                    <input className="oe-title" style={{ flex: 1, minWidth: 0 }} value={curPage.title} placeholder="Seitentitel"
                      onChange={(e) => updPage({ title: e.target.value })} aria-label="Seitentitel" />
                    <button className="btn ghost sm" title={curPage.pin ? 'Losheften' : 'Anheften'}
                      onClick={() => { updPage({ pin: !curPage.pin }); toast(curPage.pin ? 'Losgeheftet' : '📌 Angeheftet – steht jetzt oben') }}>
                      {curPage.pin ? '📌' : '📍'}
                    </button>
                    <button className="btn sm" onClick={() => setPageMode(pageMode === 'view' ? 'edit' : 'view')}>
                      {pageMode === 'view' ? '✏️ Bearbeiten' : '✓ Fertig'}
                    </button>
                  </div>
                  <div className="oe-date">zuletzt {curPage.updated} · verschlüsselt gespeichert 🔒</div>
                  {pageMode === 'edit' ? (
                    <>
                      <textarea className="oe-body" value={curPage.text} placeholder="Einfach lostippen – gespeichert wird automatisch …"
                        onChange={(e) => updPage({ text: e.target.value })} aria-label="Seiteninhalt" autoFocus />
                      <div className="oe-hint">Tricks: <code># Überschrift</code> · <code>- Liste</code> · <code>[ ] Aufgabe</code> · <code>[[Verknüpfung]]</code> · <code>#schlagwort</code> · <code>**fett**</code></div>
                    </>
                  ) : (
                    <PageView text={curPage.text} onToggleLine={toggleTaskLine} onLink={followLink} onTag={(t) => setQ(t)} />
                  )}
                  {backlinksOf(curPage.title).length > 0 && (
                    <div className="backlinks">
                      <div className="oe-date" style={{ marginBottom: 4 }}>↩ Hierher verlinkt:</div>
                      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                        {backlinksOf(curPage.title).map(({ s, p }) => (
                          <button key={p.id} type="button" className="wikilink" onClick={() => openPageRef(s, p)}>
                            {p.title || 'Unbenannte Seite'}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                  {pageMode === 'edit' && (
                    <div>
                      <button className="btn danger sm" onClick={() => {
                        updSections((ss) => ss.map((s) => (s.id === curSec.id ? { ...s, pages: s.pages.filter((p) => p.id !== pageId) } : s)))
                        setPageId(null)
                        toast('Seite gelöscht')
                      }}>Seite löschen</button>
                    </div>
                  )}
                </>
              ) : (
                <div className="empty" style={{ borderBottom: 0 }}>Wähle eine Seite – oder leg mit „+ Seite“ eine neue an. Mit <b>[[Name]]</b> verknüpfst du Seiten und Personen.</div>
              )}
            </div>
          </>
        )}
      </div>
      )}
      {personSheet !== null && (
        <PersonSheet existing={personSheet === 'new' ? null : mem.persons.find((x) => x.id === personSheet)}
          onSave={savePerson} onClose={() => setPersonSheet(null)} toast={toast} />
      )}
      {docSel && (() => {
        const d = (mem.docs || []).find((x) => x.id === docSel)
        if (!d) return null
        return (
          <div className="overlay" onClick={(e) => { if (e.target === e.currentTarget) setDocSel(null) }}>
            <div className="sheet">
              <h3>{d.mime.startsWith('image/') ? '🖼️' : '📄'} {d.name}<button type="button" className="x" onClick={() => setDocSel(null)} aria-label="Schließen">✕</button></h3>
              {d.mime.startsWith('image/') && (
                <img src={`data:${d.mime};base64,${d.b64}`} alt={d.name}
                  style={{ maxWidth: '100%', borderRadius: 12, border: '1px solid var(--hairline)', marginBottom: 12 }} />
              )}
              <div style={{ display: 'flex', gap: 8 }}>
                <button className="btn" style={{ flex: 1 }} onClick={() => saveDoc(d)}>Speichern / Öffnen</button>
                <button className="btn danger" style={{ flex: 1 }} onClick={() => {
                  persist({ ...mem, docs: mem.docs.filter((x) => x.id !== d.id) })
                  setDocSel(null)
                  toast('Dokument gelöscht')
                }}>Löschen</button>
              </div>
            </div>
          </div>
        )
      })()}
    </section>
  )
}

/* ================= Haupt-App ================= */

export default function App() {
  const [toast, toastEl] = useToast()
  const [db, setDb] = useState(() => loadState())
  const [nav, setNav] = useState('heute')
  const [sheet, setSheet] = useState(null)
  const [calCursor, setCalCursor] = useState(() => { const d = new Date(); return { y: d.getFullYear(), m: d.getMonth() } })
  const [selDate, setSelDate] = useState(iso(new Date()))
  const [filterWho, setFilterWho] = useState(null)
  const [memberSheet, setMemberSheet] = useState(false)
  const [careSheet, setCareSheet] = useState(null) // member_id des Kindes
  const [blitz, setBlitz] = useState(false)
  const [blitzList, setBlitzList] = useState(false)
  const [wiz, setWiz] = useState(null) // ✨ Assistent-Wizard: {type: 'serie'|'ist'|'sport', ...}
  const [vereinSheet, setVereinSheet] = useState(false)
  const [syncing, setSyncing] = useState(false)
  const [calQ, setCalQ] = useState('')
  const [praxisQ, setPraxisQ] = useState('')
  const [praxisSel, setPraxisSel] = useState(null)
  const [klientSheet, setKlientSheet] = useState(null) // true = neu, id = bearbeiten
  const [pTerminSheet, setPTerminSheet] = useState(null) // { klid? }
  const [vorlageSheet, setVorlageSheet] = useState(null) // klid
  const icsInput = useRef()
  const today = iso(new Date())

  const persistent = storageWorks()

  /* ---------- 🔗 Familien-Sync (Stufe 2): alle Geräte, ein Stand ---------- */

  const [cloud, setCloud] = useState(() => loadSyncMeta())
  const cloudRef = useRef(cloud)
  const dbRef = useRef(db)
  const dirtyRef = useRef(false)
  const syncBusy = useRef(false)
  const pushTimer = useRef(null)
  dbRef.current = db

  function setCloudMeta(m) {
    cloudRef.current = m
    setCloud(m)
    saveSyncMeta(m)
  }

  function saveAll(next) {
    setDb(next)
    saveState(next)
    dbRef.current = next
    if (cloudRef.current.on && !next?.demo) {
      dirtyRef.current = true
      clearTimeout(pushTimer.current)
      pushTimer.current = setTimeout(syncNow, 1200)
    }
  }

  async function syncNow() {
    const meta = cloudRef.current
    if (!meta.on || syncBusy.current || !dbRef.current) return
    syncBusy.current = true
    try {
      if (dirtyRef.current) {
        dirtyRef.current = false
        let res = await esPush(meta.code, stripLocal(dbRef.current), meta.version || 1)
        if (!res.ok && res.error === 'conflict') {
          // Anderes Gerät war schneller: Stände zusammenführen, erneut senden
          const merged = mergeDb(dbRef.current, res.data)
          setDb(merged); saveState(merged); dbRef.current = merged
          res = await esPush(meta.code, stripLocal(merged), res.version)
        }
        if (res.ok) setCloudMeta({ ...meta, version: res.version, last: Date.now(), error: null })
        else { dirtyRef.current = true; setCloudMeta({ ...meta, error: res.error || 'unbekannt' }) }
      } else {
        const res = await esPull(meta.code)
        if (res.ok && res.version !== meta.version) {
          const merged = mergeDb(dbRef.current, res.data)
          setDb(merged); saveState(merged); dbRef.current = merged
          setCloudMeta({ ...meta, version: res.version, last: Date.now(), error: null })
        } else if (res.ok) {
          if (meta.error || Date.now() - (meta.last || 0) > 120000) setCloudMeta({ ...meta, last: Date.now(), error: null })
        } else {
          setCloudMeta({ ...meta, error: res.error })
        }
      }
    } catch (e) {
      setCloudMeta({ ...cloudRef.current, error: e.message })
    } finally {
      syncBusy.current = false
    }
  }

  useEffect(() => {
    if (!cloud.on) return
    syncNow()
    const t = setInterval(syncNow, 30000)
    const onVis = () => { if (!document.hidden) syncNow() }
    document.addEventListener('visibilitychange', onVis)
    return () => { clearInterval(t); document.removeEventListener('visibilitychange', onVis) }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cloud.on])

  async function enableCloud() {
    if (db.demo) { toast('Im Demo-Modus bleibt der Sync aus – erst eine eigene Familie anlegen'); return }
    const code = newSyncCode()
    try {
      const res = await esCreate(code, stripLocal(db))
      if (!res.ok) throw new Error(res.error)
      setCloudMeta({ on: true, code, version: 1, last: Date.now(), error: null })
      toast('🔗 Familien-Sync ist an – teile den Code mit deiner Familie')
    } catch (e) {
      toast('Sync-Start nicht möglich: ' + e.message + '. Läuft die Datenbank? (supabase/sync.sql einmal ausführen)')
    }
  }

  function disableCloud() {
    setCloudMeta({ on: false })
    toast('Sync ist aus – Daten bleiben nur auf diesem Gerät')
  }

  async function joinCloud(code) {
    const res = await esPull(code.trim())
    if (!res.ok) throw new Error(res.error === 'not_found' ? 'Code nicht gefunden – Tippfehler?' : res.error)
    setCloudMeta({ on: true, code: code.trim(), version: res.version, last: Date.now(), error: null })
    saveAll({ ...res.data, active: null })
    toast('🔗 Familie geladen – wer bist du?')
  }

  // Das gesamte Design folgt der Farbe des aktiven Profils
  const activeColor = db?.members?.find((m) => m.id === db?.active)?.color || null
  useEffect(() => {
    const root = document.documentElement
    if (activeColor && /^#[0-9a-fA-F]{6}$/.test(activeColor)) {
      root.style.setProperty('--user', activeColor)
      const r = parseInt(activeColor.slice(1, 3), 16)
      const g = parseInt(activeColor.slice(3, 5), 16)
      const b = parseInt(activeColor.slice(5, 7), 16)
      root.style.setProperty('--user-ink', (r * 299 + g * 587 + b * 114) / 1000 > 160 ? '#191627' : '#FFFFFF')
    } else {
      root.style.removeProperty('--user')
      root.style.removeProperty('--user-ink')
    }
  }, [activeColor])

  // Direktstart mit Profil per Link: ?u=Name oder #u=Name
  useEffect(() => {
    if (!db) return
    try {
      const fromSearch = new URLSearchParams(location.search).get('u')
      const fromHash = location.hash.startsWith('#u=') ? decodeURIComponent(location.hash.slice(3)) : null
      const wanted = fromSearch || fromHash
      if (wanted) {
        const m = db.members.find((x) => x.name.toLowerCase() === wanted.toLowerCase())
        if (m && db.active !== m.id) saveAll({ ...db, active: m.id })
      }
    } catch { /* URL nicht lesbar (Sandbox) */ }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Beim Start automatisch mit der Vereins-App synchronisieren (still; offline unkritisch)
  useEffect(() => {
    if (db?.verein?.links?.length) syncVerein(db.verein.links, db, true)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Nach 30 Tagen räumt der Papierkorb sich selbst auf
  useEffect(() => {
    if (!db?.trash?.length) return
    const limit = addDays(today, -30)
    if (db.trash.some((x) => x.delAt < limit)) {
      saveAll({ ...db, trash: db.trash.filter((x) => x.delAt >= limit) })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  if (!db) {
    return (
      <>
        <Onboarding onCreate={(famName, myName, color) => {
          const meId = uid()
          saveAll({
            family: { name: famName },
            members: [{ id: meId, name: myName, color, kind: 'adult', is_admin: true, can_direct: true }],
            events: [], items: [], memories: {}, active: meId,
          })
          toast('Familie angelegt ✓')
        }} onDemo={() => {
          saveAll(demoData())
          toast('🎬 Demo geladen – du bist Jan. Profilwechsel lohnt sich: Anne hat die Praxis.')
        }} onJoin={joinCloud} />
        {toastEl}
      </>
    )
  }

  const me = db.members.find((m) => m.id === db.active)
  if (!me) {
    return (
      <>
        <ProfilePicker members={db.members} onPick={(id) => { saveAll({ ...db, active: id }); setNav('heute') }} />
        {toastEl}
      </>
    )
  }

  const isKid = me.kind === 'kid'
  const byId = Object.fromEntries(db.members.map((m) => [m.id, m]))
  const mname = (id) => byId[id]?.name || '?'
  const mcolor = (id) => byId[id]?.color || '#888'
  const visible = filterWho ? db.events.filter((e) => e.member_id === filterWho) : db.events
  const eventsOn = (dateStr) => visible.filter((e) => e.on_date === dateStr).sort((a, b) => a.at_time.localeCompare(b.at_time))
  const invites = db.events.filter((e) => e.status === 'pending' && e.member_id === me.id)

  const isFree = (memberId, dateStr, time) =>
    !db.events.some((e) => e.member_id === memberId && e.on_date === dateStr && e.status === 'fix' && Math.abs(mins(e.at_time) - mins(time)) < 60)

  /* ---------- Aktionen ---------- */

  function saveEvent(data) {
    if (sheet.event) {
      saveAll({ ...db, events: db.events.map((e) => (e.id === sheet.event.id ? { ...e, ...data, serie: e.serie } : e)) })
      toast('Gespeichert ✓ – die ganze Familie sieht den neuen Stand')
    } else {
      const target = byId[data.member_id]
      let status = 'fix', msg
      if (data.member_id === me.id || target.kind === 'kid') {
        msg = data.serie ? 'Serientermin angelegt ↻ (8 Wochen)' : 'Termin angelegt ✓'
      } else if (me.can_direct && isFree(data.member_id, data.on_date, data.at_time)) {
        msg = `Direkt eingetragen ✓ für ${target.name}`
      } else if (me.can_direct) {
        status = 'pending'
        msg = `${target.name} ist da schon belegt – als Anfrage gesendet 📩`
      } else {
        status = 'pending'
        msg = `Anfrage an ${target.name} gesendet 📩 – muss erst zusagen`
      }
      const rows = (data.serie ? Array.from({ length: 8 }, (_, k) => addDays(data.on_date, k * 7)) : [data.on_date])
        .map((dateStr) => ({ id: uid(), ...data, on_date: dateStr, status, created_by: me.id }))
      saveAll({ ...db, events: [...db.events, ...rows] })
      toast(msg)
    }
    setSheet(null)
  }

  function deleteEvent() {
    const e = sheet.event
    saveAll({
      ...db,
      events: db.events.filter((x) => x.id !== e.id),
      trash: [{ id: e.id, kind: 'event', delAt: today, row: e }, ...(db.trash || [])],
    })
    setSheet(null)
    toast('🗑️ In den Papierkorb – 30 Tage wiederherstellbar (unter Familie)')
  }

  /* ---------- 🗑️ Papierkorb: nichts geht aus Versehen verloren ---------- */

  function restoreTrash(t) {
    const next = { ...db, trash: (db.trash || []).filter((x) => x.id !== t.id) }
    if (t.kind === 'event') next.events = [...db.events, t.row]
    else if (t.kind === 'item') next.items = [t.row, ...db.items]
    else if (t.kind === 'zettel') next.inbox = [...(db.inbox || []), t.row]
    else if (t.kind === 'geb') next.geburtstage = [...(db.geburtstage || []), t.row]
    saveAll(next)
    toast('Wiederhergestellt ✓')
  }

  function emptyTrash() {
    saveAll({ ...db, trash: [] })
    toast('Papierkorb geleert')
  }


  function answerInvite(ev, accept) {
    if (accept) {
      saveAll({ ...db, events: db.events.map((e) => (e.id === ev.id ? { ...e, status: 'fix' } : e)) })
      toast('Zugesagt ✓ – steht jetzt fest im Familienkalender')
    } else {
      saveAll({ ...db, events: db.events.filter((e) => e.id !== ev.id) })
      toast(`Abgelehnt – ${mname(ev.created_by)} sieht das im Kalender`)
    }
  }

  /* ---------- Praxis: Klientinnen, Termin-Typen, Soll/Ist ---------- */

  const praxis = db.praxis || { klienten: [] }
  const klientById = (id) => praxis.klienten.find((k) => k.id === id)
  const klientTermine = (klid) => db.events.filter((e) => e.klid === klid).sort((a, b) => b.on_date.localeCompare(a.on_date))

  function saveKlient(data, id) {
    const klienten = id
      ? praxis.klienten.map((k) => (k.id === id ? { ...k, ...data } : k))
      : [{ id: uid(), ...data }, ...praxis.klienten]
    saveAll({ ...db, praxis: { ...praxis, klienten } })
    toast(id ? 'Gespeichert ✓' : data.name + ' angelegt ✓')
  }

  function addPraxisTermin(data) {
    const k = klientById(data.klid)
    saveAll({
      ...db,
      events: [...db.events, {
        id: uid(),
        member_id: me.id,
        on_date: data.on_date,
        at_time: data.at_time,
        title: `${data.ptype}: ${k?.name || '—'}`,
        meta: [data.notiz, k?.adresse].filter(Boolean).join(' · ') || data.ptype,
        serie: false,
        status: 'fix',
        created_by: me.id,
        ptype: data.ptype,
        klid: data.klid,
        soll: data.soll,
        ist: null,
      }],
    })
    toast(`${data.ptype} geplant ✓ – steht auch im Familienkalender`)
  }

  function setIst(eventId, min) {
    saveAll({ ...db, events: db.events.map((e) => (e.id === eventId ? { ...e, ist: min ? +min : null } : e)) })
  }

  /* ---------- Arbeitskalender (ICS-Import) ---------- */

  async function importIcs(file) {
    try {
      const parsed = parseIcs(await file.text())
      if (!parsed.length) { toast('Keine Termine in der Datei gefunden'); return }
      const mapped = parsed.map((ev) => ({
        id: uid(),
        member_id: me.id,
        on_date: ev.date,
        at_time: ev.time,
        title: ev.title,
        meta: [ev.end ? 'bis ' + ev.end : '', ev.loc, 'Arbeit 💼'].filter(Boolean).join(' · '),
        serie: false,
        status: 'fix',
        src: 'work',
        created_by: me.id,
      }))
      saveAll({ ...db, events: [...db.events.filter((e) => !(e.src === 'work' && e.member_id === me.id)), ...mapped] })
      toast(`💼 ${mapped.length} Arbeitstermine importiert – erneuter Import aktualisiert alles`)
    } catch (e) {
      toast('Import fehlgeschlagen: ' + e.message)
    }
  }

  function toggleModule(id) {
    const active = hasMod(me, id)
    let next = {
      ...db,
      members: db.members.map((m) => (m.id === me.id ? { ...m, modules: { ...(m.modules || {}), [id]: !active } } : m)),
    }
    if (active && id === 'arbeit') {
      next = { ...next, events: next.events.filter((e) => !(e.src === 'work' && e.member_id === me.id)) }
    }
    if (active && id === 'verein') {
      next = { ...next, events: next.events.filter((e) => e.src !== 'verein'), verein: { links: [] } }
    }
    if (active && id === 'praxis' && nav === 'praxis') setNav('profil')
    saveAll(next)
    if (active) {
      toast(MODULES.find((m) => m.id === id).name + ' entfernt' + (id === 'praxis' ? ' – deine Daten bleiben gespeichert' : ''))
    } else {
      toast(MODULES.find((m) => m.id === id).name + ' hinzugefügt ✓' + (id === 'praxis' ? ' – neuer Bereich 🩺 in der Navigation' : ''))
      if (id === 'praxis') setNav('praxis')
    }
  }

  /* ---------- Sport & Kinderbetreuung (Wochen-Balance) ---------- */

  const weekSpan = (() => {
    const now = new Date()
    const d = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    const mo = new Date(d); mo.setDate(d.getDate() - ((d.getDay() + 6) % 7))
    const su = new Date(mo); su.setDate(mo.getDate() + 6)
    return [iso(mo), iso(su)]
  })()
  const inWeek = (e) => e.on_date >= weekSpan[0] && e.on_date <= weekSpan[1]

  const mySportWeek = db.events.filter((e) => e.sport && e.member_id === me.id && e.status === 'fix' && inWeek(e))
  const sportGoal = me.sportGoal || 2

  function planSport(activity, wd, time) {
    const base = fromIso(today)
    const diff = (wd - ((base.getDay() + 6) % 7) + 7) % 7
    const first = new Date(base); first.setDate(base.getDate() + diff)
    const rows = Array.from({ length: 8 }, (_, k) => {
      const d = new Date(first); d.setDate(first.getDate() + k * 7)
      return { id: uid(), member_id: me.id, on_date: iso(d), at_time: time, title: activity, meta: 'Dein Ausgleich', serie: true, sport: true, status: 'fix', created_by: me.id }
    })
    saveAll({ ...db, events: [...db.events, ...rows] })
    toast(`🏃 ${activity} eingeplant – jede Woche, 8 Wochen. Der Termin gehört dir.`)
  }

  const toggleSportDone = (e) => saveAll({ ...db, events: db.events.map((x) => (x.id === e.id ? { ...x, done: !x.done } : x)) })

  const adults = db.members.filter((m) => m.kind !== 'kid')
  const careCount = (mid) => db.events.filter((e) => e.status === 'fix' && inWeek(e) && e.zust === mid).length
  const unclaimed = db.events
    .filter((e) => e.status === 'fix' && !e.zust && byId[e.member_id]?.kind === 'kid' && e.on_date >= today && e.on_date <= addDays(today, 2))
    .sort((a, b) => a.on_date.localeCompare(b.on_date) || a.at_time.localeCompare(b.at_time))
    .slice(0, 5)
  function claimEvent(e) {
    saveAll({ ...db, events: db.events.map((x) => (x.id === e.id ? { ...x, zust: me.id } : x)) })
    toast('✋ Übernommen – steht für alle sichtbar im Kalender')
  }

  /* ---------- Blitzzettel: ansehen, sortieren, umwandeln ---------- */

  const myInbox = (db.inbox || []).filter((i) => i.member_id === me.id)
  const deleteZettel = (z) => saveAll({
    ...db,
    inbox: (db.inbox || []).filter((x) => x.id !== z.id),
    trash: [{ id: z.id, kind: 'zettel', delAt: today, row: z }, ...(db.trash || [])],
  })
  function zettelToTodo(z) {
    saveAll({
      ...db,
      items: [{ id: uid(), list: 'todo', text: z.text.split('\n')[0], done: false, created_by: me.id }, ...db.items],
      inbox: (db.inbox || []).filter((x) => x.id !== z.id),
    })
    toast('→ Als To-do übernommen ✓')
  }

  function endDemo() {
    try { localStorage.removeItem('eselsohr-v1') } catch { /* egal */ }
    location.reload()
  }

  /* ---------- Betreuungszeiten: Wann sind die Kinder versorgt? ---------- */

  const kids = db.members.filter((m) => m.kind === 'kid')
  const careOn = (m, dateStr) => (m.care || [])
    .filter((b) => b.days.includes(wdIdx(fromIso(dateStr))))
    .sort((a, b) => a.from.localeCompare(b.from))
  const careText = (m, dateStr) => {
    const blocks = careOn(m, dateStr)
    return blocks.length ? blocks.map((b) => `${b.label} ${b.from}–${b.to}`).join(', ') : null
  }

  function saveCare(kidId, blocks) {
    saveAll({ ...db, members: db.members.map((m) => (m.id === kidId ? { ...m, care: blocks } : m)) })
    toast('🏫 Betreuungszeiten gespeichert – für alle sichtbar')
  }

  /* ---------- Anbindungen: Export für Outlook/Google/Excel ---------- */

  const icsEscape = (t) => String(t || '').replace(/\\/g, '\\\\').replace(/[,;]/g, ' ').replace(/\n/g, ' ')

  function exportIcs() {
    const lines = ['BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//Eselsohr//DE', 'CALSCALE:GREGORIAN']
    db.events.filter((e) => e.status === 'fix').forEach((raw) => {
      const e = viewEvent(raw) // Privatsphäre gilt auch im Export
      lines.push(
        'BEGIN:VEVENT',
        'UID:' + e.id + '@eselsohr',
        'DTSTART:' + e.on_date.replaceAll('-', '') + 'T' + e.at_time.replace(':', '') + '00',
        'SUMMARY:' + icsEscape(e.title.replace(/[📩⚽💼🩺↻]/g, '').trim() || 'Termin'),
        'DESCRIPTION:' + icsEscape(mname(e.member_id) + (e.masked || !e.meta ? '' : ' - ' + e.meta)),
        'END:VEVENT'
      )
    })
    lines.push('END:VCALENDAR')
    saveTextFile('eselsohr-kalender.ics', lines.join('\r\n'), toast)
  }

  function exportPraxisCsv() {
    const rows = [['Klientin', 'Datum', 'Uhrzeit', 'Typ', 'Soll (Min)', 'Ist (Min)', 'Notiz']]
    db.events.filter((e) => e.ptype).sort((a, b) => a.on_date.localeCompare(b.on_date)).forEach((e) => {
      rows.push([
        klientById(e.klid)?.name || '—', e.on_date, e.at_time, e.ptype,
        e.soll ?? '', e.ist ?? '', (e.meta || '').replace(/;/g, ','),
      ])
    })
    saveTextFile('praxis-termine.csv', rows.map((r) => r.join(';')).join('\n'), toast)
  }

  const addItem = (list, text) => saveAll({ ...db, items: [{ id: uid(), list, text, done: false, created_by: me.id }, ...db.items] })
  const toggleItem = (it) => saveAll({ ...db, items: db.items.map((x) => (x.id === it.id ? { ...x, done: !x.done } : x)) })
  const deleteItem = (it) => saveAll({
    ...db,
    items: db.items.filter((x) => x.id !== it.id),
    trash: [{ id: it.id, kind: 'item', delAt: today, row: it }, ...(db.trash || [])],
  })

  function addMember(name, color, kind) {
    saveAll({ ...db, members: [...db.members, { id: uid(), name, color, kind, is_admin: false, can_direct: false }] })
    toast(`${name} ist dabei ✓`)
  }

  /* ---------- Vereins-App-Sync ---------- */

  async function syncVerein(links, base, quiet) {
    if (!links.length) return
    setSyncing(true)
    try {
      const data = await fetchVereinData()
      const mapped = links.flatMap((l) => mapTeamEvents(data, l.tid, l.memberId))
      const next = {
        ...base,
        events: [...base.events.filter((e) => e.src !== 'verein'), ...mapped],
        verein: { links, lastSync: new Date().toLocaleString('de-DE', { dateStyle: 'short', timeStyle: 'short' }) },
      }
      saveAll(next)
      if (!quiet) toast(`Synchronisiert ⚽ – ${mapped.length} Vereinstermine übernommen`)
    } catch (e) {
      if (!quiet) toast('Sync nicht möglich: ' + e.message)
    } finally {
      setSyncing(false)
    }
  }

  function addVereinLink(tid, teamName, memberId) {
    const links = [...(db.verein?.links || []).filter((l) => l.tid !== tid), { tid, teamName, memberId }]
    syncVerein(links, { ...db, verein: { ...(db.verein || {}), links } }, false)
  }

  function removeVereinLink(tid) {
    const links = (db.verein?.links || []).filter((l) => l.tid !== tid)
    const keptTids = new Set(links.map((l) => l.tid))
    saveAll({
      ...db,
      events: db.events.filter((e) => e.src !== 'verein' || keptTids.has(e.tid)),
      verein: { ...(db.verein || {}), links },
    })
    toast('Verknüpfung entfernt – Vereinstermine gelöscht')
  }

  function toggleDirect(m) {
    saveAll({ ...db, members: db.members.map((x) => (x.id === m.id ? { ...x, can_direct: !x.can_direct } : x)) })
    toast(`${m.name} ${!m.can_direct ? 'darf jetzt direkt eintragen' : 'braucht jetzt Bestätigung'}`)
  }

  async function exportBackup() {
    const next = { ...db, lastBackup: today }
    saveAll(next)
    const json = JSON.stringify(next, null, 2)
    try {
      await navigator.clipboard?.writeText(json)
    } catch { /* Zwischenablage gesperrt */ }
    if (window.claude?.downloads) {
      try {
        await window.claude.downloads.save({ filename: 'eselsohr-backup.json', data: json })
        toast('Backup gespeichert ✓ (und in die Zwischenablage kopiert)')
      } catch (e) {
        toast(e?.code === 'declined' ? 'Speichern abgebrochen – Backup liegt in der Zwischenablage' : 'Backup in Zwischenablage kopiert ✓')
      }
      return
    }
    try {
      const a = document.createElement('a')
      a.href = URL.createObjectURL(new Blob([json], { type: 'application/json' }))
      a.download = 'eselsohr-backup.json'
      a.click()
    } catch { /* Download gesperrt */ }
    toast('Backup als Datei gespeichert und in die Zwischenablage kopiert ✓')
  }

  /* ---------- Bausteine ---------- */

  // Privatsphäre: fremde Praxis- und Arbeitstermine erscheinen nur als belegter Block
  const viewEvent = (e) => {
    if (e.klid && e.created_by !== me.id) {
      return { ...e, title: '🩺 Praxis · belegt', meta: mname(e.member_id) + ' · Details privat', masked: true, serie: false }
    }
    if (e.src === 'work' && e.member_id !== me.id) {
      const bis = (e.meta || '').split(' · ').find((p) => p.startsWith('bis '))
      return { ...e, title: '💼 Arbeit', meta: [mname(e.member_id), bis].filter(Boolean).join(' · '), masked: true }
    }
    return e
  }

  const EventRow = ({ e: raw }) => {
    const e = viewEvent(raw)
    return (
      <button className="row" onClick={() => setSheet({ event: raw })}>
        <span className="time">{e.at_time}</span>
        <span className="dot" style={{ background: mcolor(e.member_id) }} />
        <div className="row-main">
          <div className="row-title">{e.title}{e.serie ? ' ↻' : ''}{e.src === 'verein' ? ' ⚽' : ''}{e.sport ? ' 🏃' : ''}</div>
          <div className="row-meta">{e.masked ? e.meta : mname(e.member_id) + (e.meta ? ' · ' + e.meta : '') + (e.zust ? ' · ✋ ' + mname(e.zust) : '')}</div>
        </div>
        {e.status === 'pending' && <span className="chip honey">📩 Anfrage</span>}
        <span className="chev">›</span>
      </button>
    )
  }

  const dayList = (dateStr) => {
    const care = kids.flatMap((k) => careOn(k, dateStr).map((b) => ({ k, b })))
    const list = eventsOn(dateStr)
    return (
      <>
        {care.map(({ k, b }) => (
          <button className="row" key={'care' + k.id + b.id} onClick={() => !isKid && setCareSheet(k.id)}>
            <span className="time">{b.from}</span>
            <span className="dot" style={{ background: k.color }} />
            <div className="row-main">
              <div className="row-title">🏫 {k.name} · {b.label}</div>
              <div className="row-meta">in Betreuung bis {b.to}</div>
            </div>
          </button>
        ))}
        {list.length
          ? list.map((e) => <EventRow key={e.id} e={e} />)
          : <div className="empty">{care.length ? 'Sonst keine Termine 🎉' : 'Keine Termine – freier Tag 🎉'}</div>}
      </>
    )
  }

  /* ---------- 🎂 Geburtstage & WhatsApp-Vorlage ---------- */

  const gebs = db.geburtstage || []
  const gebSorted = gebs.map((g) => ({ g, info: gebInfo(g.date) })).sort((a, b) => (a.info?.days ?? 999) - (b.info?.days ?? 999))

  function waMsg(g) {
    const info = gebInfo(g.date)
    return (db.waTemplate || WA_DEFAULT)
      .replaceAll('{name}', g.name)
      .replaceAll('{alter}', info?.age != null ? String(info.age) : '')
      .replaceAll('{familie}', db.family.name)
      .replace(/ {2,}/g, ' ')
  }

  function openWa(g) {
    const digits = (g.tel || '').replace(/\D/g, '').replace(/^0/, '49')
    try { navigator.clipboard?.writeText(waMsg(g)) } catch { /* Zwischenablage gesperrt */ }
    try { window.open('https://wa.me/' + digits + '?text=' + encodeURIComponent(waMsg(g)), '_blank', 'noopener') } catch { /* Popup gesperrt */ }
    toast('💬 WhatsApp öffnet sich – Nachricht ist fertig eingesetzt' + (g.tel ? '' : ' (Kontakt selbst auswählen)'))
  }

  const addGeb = (name, date, tel) => { saveAll({ ...db, geburtstage: [...gebs, { id: uid(), name, date, tel }] }); toast(`🎂 ${name} gemerkt – Eselsohr erinnert rechtzeitig`) }
  const deleteGeb = (g) => saveAll({
    ...db,
    geburtstage: gebs.filter((x) => x.id !== g.id),
    trash: [{ id: g.id, kind: 'geb', delAt: today, row: g }, ...(db.trash || [])],
  })

  /* ---------- ✨ Assistent: Vorschläge & Vervollständigung aus vorhandenen Daten ---------- */

  const titleStats = (() => {
    const map = {}
    db.events.forEach((e) => {
      if (e.status !== 'fix') return
      if (e.klid && e.created_by !== me.id) return // fremde Praxis-Titel bleiben privat
      if (e.src === 'work' && e.member_id !== me.id) return // fremde Arbeits-Titel auch
      const k = e.title.toLowerCase()
      const m = map[k] || (map[k] = { title: e.title, count: 0, time: e.at_time, zust: e.zust, member: e.member_id, last: e.on_date })
      m.count++
      if (e.on_date >= m.last) { m.last = e.on_date; m.time = e.at_time; m.zust = e.zust; m.member = e.member_id }
    })
    return map
  })()

  function extendSerie(last) {
    const rows = Array.from({ length: 8 }, (_, k) => ({ ...last, id: uid(), on_date: addDays(last.on_date, (k + 1) * 7), created_by: me.id }))
    saveAll({ ...db, events: [...db.events, ...rows] })
    toast(`↻ „${last.title}“ um 8 Wochen verlängert – bis ${fmtShort(addDays(last.on_date, 56))}`)
  }

  function continueSerie(base, weeks) {
    const have = new Set(db.events.filter((x) => x.title.toLowerCase() === base.title.toLowerCase() && x.member_id === base.member_id).map((x) => x.on_date))
    const rows = []
    let d = base.on_date
    while (d <= today) d = addDays(d, 7)
    for (let k = 0; k < weeks; k++) {
      if (!have.has(d)) rows.push({ id: uid(), member_id: base.member_id, on_date: d, at_time: base.at_time, title: base.title, meta: base.meta || '', zust: base.zust || null, serie: true, status: 'fix', created_by: me.id })
      d = addDays(d, 7)
    }
    saveAll({ ...db, events: [...db.events, ...rows] })
    toast(`↻ ${rows.length}× „${base.title}“ eingeplant – als Serie`)
  }

  const suggestions = (() => {
    if (isKid) return []
    const out = []
    // Geburtstag steht an – zuerst, weil zeitkritisch
    const nextGeb = gebSorted.filter((x) => x.info && x.info.days <= 3)[0]
    if (nextGeb) out.push({
      id: 'geb' + nextGeb.g.id, ico: '🎂',
      title: `${nextGeb.g.name} hat ${nextGeb.info.days === 0 ? 'heute' : nextGeb.info.days === 1 ? 'morgen' : `in ${nextGeb.info.days} Tagen`} Geburtstag`,
      meta: (nextGeb.info.age != null ? `Wird ${nextGeb.info.age}. ` : '') + 'Deine WhatsApp-Vorlage ist fertig – Name & Familie schon eingesetzt.',
      actLabel: '💬 Glückwunsch', act: () => openWa(nextGeb.g),
    })
    // Betreuungszeiten fehlen
    kids.filter((k) => !(k.care || []).length).forEach((k) => out.push({
      id: 'care' + k.id, ico: '🏫',
      title: `Betreuungszeiten für ${k.name} anlegen`,
      meta: `Dann steht auf der Heute-Karte, wann ${k.name} versorgt ist – und ab wann jemand da sein muss.`,
      actLabel: 'Anlegen', act: () => setCareSheet(k.id),
    }))
    // Praxis: Ist-Zeiten nachtragen
    if (hasMod(me, 'praxis')) {
      const open = db.events.filter((e) => e.klid && e.created_by === me.id && e.status === 'fix' && e.on_date < today && e.ist == null)
      if (open.length) out.push({
        id: 'ist', ico: '🩺',
        title: `${open.length} Praxis-Termin${open.length > 1 ? 'e' : ''} ohne Ist-Zeit`,
        meta: 'Der Assistent geht sie Schritt für Schritt mit dir durch – wichtig für die Abrechnung.',
        actLabel: 'Wizard starten', act: () => setWiz({ type: 'ist', list: open.sort((a, b) => a.on_date.localeCompare(b.on_date)) }),
      })
    }
    // Wiederkehrende Termine → Serie vorschlagen
    const groups = {}
    db.events.filter((e) => e.status === 'fix' && !e.serie && !e.klid && !e.src && !e.sport).forEach((e) => {
      const k = e.member_id + '|' + e.title.toLowerCase()
      ;(groups[k] = groups[k] || []).push(e)
    })
    Object.values(groups).filter((g) => g.length >= 3).forEach((g) => {
      const last = [...g].sort((a, b) => a.on_date.localeCompare(b.on_date))[g.length - 1]
      const covered = db.events.some((e) => e.member_id === last.member_id && e.title.toLowerCase() === last.title.toLowerCase() && e.on_date > addDays(today, 7))
      if (covered) return
      out.push({
        id: 'serie' + last.id, ico: '↻',
        title: `„${last.title}“ wiederholt sich – als Serie fortsetzen?`,
        meta: `${g.length}× erkannt bei ${mname(last.member_id)}, ${WD_LONG[wdIdx(fromIso(last.on_date))]}s um ${last.at_time} Uhr.`,
        actLabel: 'Wizard starten', act: () => setWiz({ type: 'serie', base: last, count: g.length }),
      })
    })
    // Sport unter Wochenziel
    if (hasMod(me, 'sport') && mySportWeek.length < sportGoal) out.push({
      id: 'sport', ico: '🏃',
      title: 'Dein Sport kommt diese Woche zu kurz',
      meta: `${mySportWeek.length} von ${sportGoal} Einheiten geplant. Blocke dir feste Zeit – der Termin gehört dir.`,
      actLabel: 'Einplanen', act: () => setWiz({ type: 'sport' }),
    })
    // Serie läuft bald aus – nichts soll still enden
    const sgroups = {}
    db.events.filter((e) => e.serie && e.status === 'fix' && !e.src).forEach((e) => {
      const k = e.member_id + '|' + e.title.toLowerCase()
      ;(sgroups[k] = sgroups[k] || []).push(e)
    })
    Object.values(sgroups).forEach((g) => {
      const maxD = g.reduce((m, e) => (e.on_date > m ? e.on_date : m), '0000')
      if (maxD >= addDays(today, -7) && maxD <= addDays(today, 14)) {
        const last = g.find((e) => e.on_date === maxD)
        out.push({
          id: 'sext' + last.id, ico: '↻',
          title: `Serie „${last.title}“ endet am ${fmtShort(maxD)}`,
          meta: 'Danach wäre der Kalender dort leer – und niemand merkt es. Verlängern?',
          actLabel: '+ 8 Wochen', act: () => extendSerie(last),
        })
      }
    })
    // Überschneidungen in den nächsten 14 Tagen
    const upcoming = db.events.filter((e) => e.status === 'fix' && e.on_date >= today && e.on_date <= addDays(today, 14))
    outer: for (let i = 0; i < upcoming.length; i++) {
      for (let j = i + 1; j < upcoming.length; j++) {
        const a = upcoming[i], b = upcoming[j]
        if (a.member_id === b.member_id && a.on_date === b.on_date && a.id !== b.id && Math.abs(mins(a.at_time) - mins(b.at_time)) < 60) {
          out.push({
            id: 'konflikt' + a.id, ico: '⚠️',
            title: `Überschneidung bei ${mname(a.member_id)} am ${fmtShort(a.on_date)}`,
            meta: `„${viewEvent(a).title}“ und „${viewEvent(b).title}“ liegen keine Stunde auseinander.`,
            actLabel: 'Ansehen', act: () => setSheet({ event: a }),
          })
          break outer
        }
      }
    }
    // Backup fällig – Daten müssen unkaputtbar sein
    if (!db.demo && db.events.length + db.items.length > 8 && (!db.lastBackup || db.lastBackup < addDays(today, -30))) out.push({
      id: 'backup', ico: '🛟',
      title: db.lastBackup ? 'Deine letzte Sicherung ist über einen Monat her' : 'Noch nie gesichert – ein Klick reicht',
      meta: cloud.on ? 'Der Familien-Sync läuft, aber ein Backup zusätzlich schadet nie.' : 'Eure Daten leben nur in diesem Browser. Ein Backup macht sie unkaputtbar.',
      actLabel: '🛟 Backup', act: exportBackup,
    })
    // Blitzzettel sammeln sich
    if (myInbox.length >= 3) out.push({
      id: 'blitz', ico: '⚡',
      title: `${myInbox.length} Blitzzettel warten auf dich`,
      meta: 'Ansehen, sortieren, als To-do übernehmen – oder liegen lassen, auch okay.',
      actLabel: 'Ansehen', act: () => setBlitzList(true),
    })
    return out.slice(0, 3) // nie mehr als 3 auf einmal – Kopf schonen
  })()

  /* ---------- Bildschirme ---------- */

  const screenHeute = (
    <section className="screen">
      <h2 className="screen-title">Hallo {me.name}! 👋</h2>
      <p className="screen-sub">{fmtDate(today)} · {db.family.name}{db.demo ? ' · 🎬 Demo-Modus (Beispieldaten – Beenden unter „Familie“)' : ''}</p>
      <div className="kpis">
        <div className="kpi accent"><div className="num">{db.events.filter((e) => e.on_date === today && e.status === 'fix').length}</div><div className="cap">Termine heute</div></div>
        <div className={'kpi' + (invites.length ? ' alert' : '')}><div className="num">{invites.length}</div><div className="cap">Anfragen an dich</div></div>
        <div className="kpi"><div className="num">{db.items.filter((i) => !i.done).length}</div><div className="cap">Offene Listenpunkte</div></div>
        {hasMod(me, 'sport') && (
          <div className={'kpi' + (mySportWeek.filter((e) => e.done).length >= sportGoal ? ' accent' : '')}>
            <div className="num">{mySportWeek.filter((e) => e.done).length}/{sportGoal}</div>
            <div className="cap">🏃 Sport diese Woche</div>
          </div>
        )}
      </div>

      {suggestions.length > 0 && (
        <>
          <p className="label">✨ Assistent · schlägt vor, du entscheidest</p>
          <div className="card">
            {suggestions.map((s) => (
              <div className="row" key={s.id}>
                <span style={{ fontSize: 20, width: 28, textAlign: 'center', flexShrink: 0 }}>{s.ico}</span>
                <div className="row-main">
                  <div className="row-title">{s.title}</div>
                  <div className="row-meta">{s.meta}</div>
                </div>
                <button className="btn sm" onClick={s.act}>{s.actLabel}</button>
              </div>
            ))}
            <div className="row"><span className="row-meta">Nutzt nur Daten, die schon in Eselsohr sind – nichts verlässt dein Gerät. Und nie mehr als 3 Vorschläge auf einmal.</span></div>
          </div>
        </>
      )}

      {!isKid && kids.length > 0 && (
        <>
          <p className="label">🏫 Wann sind die Kinder in der Betreuung?</p>
          <div className="card">
            {kids.map((k) => {
              const heute = careText(k, today)
              const morgen = careText(k, addDays(today, 1))
              const letzter = careOn(k, today).slice(-1)[0]
              const angelegt = (k.care || []).length > 0
              return (
                <button className="row" key={k.id} onClick={() => setCareSheet(k.id)}>
                  <span className="avatar member" style={{ background: k.color }}>{k.name[0].toUpperCase()}</span>
                  <div className="row-main">
                    <div className="row-title">{k.name}: {heute || (angelegt ? 'heute keine Betreuung' : 'noch keine Zeiten hinterlegt')}</div>
                    <div className="row-meta">
                      {angelegt
                        ? (heute ? `ab ${letzter.to} zu Hause` : 'heute übernimmt die Familie') + ' · morgen: ' + (morgen || 'keine Betreuung')
                        : 'Antippen und Kita-/Schulzeiten anlegen – dann steht hier die Antwort'}
                    </div>
                  </div>
                  <span className="chev">›</span>
                </button>
              )
            })}
          </div>
        </>
      )}

      {!isKid && (adults.length > 1 || unclaimed.length > 0) && (
        <>
          <p className="label">✋ Kinder & Alltag · wer übernimmt diese Woche</p>
          <div className="card">
            <div className="row" style={{ gap: 8, flexWrap: 'wrap' }}>
              {adults.map((m) => (
                <span key={m.id} className="chip">
                  <i className="dot" style={{ background: m.color, width: 8, height: 8, borderRadius: '50%' }} />
                  {m.name}: {careCount(m.id)}×
                </span>
              ))}
              <span className="row-meta" style={{ flexBasis: '100%' }}>Entlastung sichtbar gemacht – ein „✋ Ich übernehme“ zählt sofort mit.</span>
            </div>
            {unclaimed.map((e) => (
              <div className="row" key={e.id}>
                <span className="time" style={{ minWidth: 76 }}>{fmtShort(e.on_date)} {e.at_time}</span>
                <div className="row-main">
                  <div className="row-title">{e.title}</div>
                  <div className="row-meta">{mname(e.member_id)} · noch niemand eingeteilt</div>
                </div>
                <button className="btn sm" onClick={() => claimEvent(e)}>✋ Ich übernehme</button>
              </div>
            ))}
          </div>
        </>
      )}
      {invites.length > 0 && (
        <>
          <p className="label">📩 Anfragen an dich</p>
          <div className="card">
            {invites.map((e) => (
              <div className="row" key={e.id}>
                <span className="time">{fmtShort(e.on_date)} {e.at_time}</span>
                <div className="row-main">
                  <div className="row-title">{e.title}</div>
                  <div className="row-meta">von {mname(e.created_by)}{e.meta ? ' · ' + e.meta : ''}</div>
                </div>
                <div className="invite-actions">
                  <button className="btn" onClick={() => answerInvite(e, true)} aria-label="Zusagen">✓</button>
                  <button className="btn danger" onClick={() => answerInvite(e, false)} aria-label="Ablehnen">✕</button>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
      <div className="cols two">
        <div>
          <p className="label">Heute <span className="lact"><button className="btn ghost sm" onClick={() => setSheet({ date: today })}>+ Termin</button></span></p>
          <div className="card">{dayList(today)}</div>
        </div>
        <div>
          <p className="label">Morgen schon im Blick</p>
          <div className="card">{dayList(addDays(today, 1))}</div>
        </div>
      </div>
    </section>
  )

  const cal = (() => {
    const { y, m } = calCursor
    const first = new Date(y, m, 1)
    const daysIn = new Date(y, m + 1, 0).getDate()
    const cells = []
    for (let i = 0; i < wdIdx(first); i++) cells.push(null)
    for (let d = 1; d <= daysIn; d++) cells.push(iso(new Date(y, m, d)))
    return { y, m, cells }
  })()

  const screenKalender = (
    <section className="screen">
      <div className="title-row">
        <div>
          <h2 className="screen-title">Gemeinschaftskalender</h2>
          <p className="screen-sub">Termine antippen zum Bearbeiten</p>
        </div>
        <button className="btn" onClick={() => setSheet({ date: selDate })}>+ Termin</button>
      </div>
      <div className="calbar">
        <button className="btn ghost sm" onClick={() => setCalCursor(({ y, m }) => (m ? { y, m: m - 1 } : { y: y - 1, m: 11 }))} aria-label="Voriger Monat">‹</button>
        <b style={{ minWidth: 140, textAlign: 'center' }}>{MONTHS[cal.m]} {cal.y}</b>
        <button className="btn ghost sm" onClick={() => setCalCursor(({ y, m }) => (m < 11 ? { y, m: m + 1 } : { y: y + 1, m: 0 }))} aria-label="Nächster Monat">›</button>
        <span style={{ flex: 1 }} />
        <div className="legend" style={{ margin: 0 }}>
          {db.members.map((mm) => (
            <button key={mm.id} className={'chip' + (filterWho && filterWho !== mm.id ? ' off' : '')}
              onClick={() => setFilterWho(filterWho === mm.id ? null : mm.id)}>
              <i className="dot" style={{ background: mm.color }} />{mm.name}
            </button>
          ))}
        </div>
      </div>
      <input className="search" value={calQ} onChange={(e) => setCalQ(e.target.value)}
        placeholder="Termine durchsuchen: Name, Typ, Ort … (z. B. „Nachsorge Müller“)" aria-label="Termine durchsuchen" />
      {calQ.trim() ? (() => {
        const q = calQ.trim().toLowerCase()
        const hits = db.events
          .filter((e) => {
            const v = viewEvent(e) // Privatsphäre: fremde Praxis-/Arbeitsdetails sind auch nicht durchsuchbar
            return (v.title + ' ' + v.meta + ' ' + (v.masked ? '' : v.ptype || '')).toLowerCase().includes(q)
          })
          .sort((a, b) => a.on_date.localeCompare(b.on_date) || a.at_time.localeCompare(b.at_time))
          .slice(0, 60)
        return (
          <div className="card">
            {hits.map((raw) => {
              const e = viewEvent(raw)
              return (
                <button className="row" key={e.id} onClick={() => setSheet({ event: raw })}>
                  <span className="time" style={{ minWidth: 76 }}>{fmtShort(e.on_date)} {e.at_time}</span>
                  <span className="dot" style={{ background: mcolor(e.member_id) }} />
                  <div className="row-main">
                    <div className="row-title">{e.title}</div>
                    <div className="row-meta">{e.masked ? e.meta : mname(e.member_id) + (e.meta ? ' · ' + e.meta : '') + (e.ist ? ` · Ist: ${e.ist} Min.` : '')}</div>
                  </div>
                  <span className="chev">›</span>
                </button>
              )
            })}
            {!hits.length && <div className="empty">Kein Termin passt zu „{calQ}“.</div>}
          </div>
        )
      })() : (
      <div className="calgrid">
        <div>
          <div className="month">
            {WD.map((n) => <div className="mh" key={n}>{n}</div>)}
            {cal.cells.map((dateStr, i) => dateStr ? (
              <button key={dateStr}
                className={'mday' + (dateStr === selDate ? ' sel' : '') + (dateStr === today ? ' today' : '')}
                onClick={() => setSelDate(dateStr)}>
                <div className="dnum">{+dateStr.slice(8, 10)}</div>
                <div className="dots">{eventsOn(dateStr).slice(0, 4).map((e) => <i key={e.id} style={{ background: mcolor(e.member_id) }} />)}</div>
              </button>
            ) : <div className="mday pad" key={'p' + i} />)}
          </div>
          <div className="legend">
            <span className="chip brand">↻ Serie</span>
            <span className="chip honey">📩 Anfrage – wartet auf Zusage</span>
          </div>
        </div>
        <div>
          <p className="label">{fmtDate(selDate)}{selDate === today ? ' · heute' : ''}</p>
          <div className="card">{dayList(selDate)}</div>
        </div>
      </div>
      )}
    </section>
  )

  const listCard = (list, title, ph) => (
    <div>
      <p className="label">{title}</p>
      <div className="card">
        {db.items.filter((i) => i.list === list).map((it) => (
          <div className="row" key={it.id}>
            <input type="checkbox" className="check" checked={it.done} onChange={() => toggleItem(it)} aria-label={it.text} />
            <div className="row-main">
              <div className={'row-title' + (it.done ? ' done-text' : '')} style={{ fontWeight: 500 }}>{it.text}</div>
              <div className="row-meta">von {mname(it.created_by)}</div>
            </div>
            <button className="xdel" onClick={() => deleteItem(it)} aria-label="Eintrag löschen">✕</button>
          </div>
        ))}
        {!db.items.filter((i) => i.list === list).length && <div className="empty">Alles erledigt 🎉</div>}
        <QuickAdd placeholder={ph} onAdd={(v) => addItem(list, v)} />
      </div>
    </div>
  )

  const screenListen = (
    <section className="screen">
      <h2 className="screen-title">Familienlisten</h2>
      <p className="screen-sub">Für alle – auch die Kinder. Eintippen, fertig.</p>
      <div className="cols two">
        {listCard('einkauf', '🛒 Einkaufen', 'Was fehlt? (Enter)')}
        {listCard('todo', '✅ Zu erledigen', 'Was ist zu tun? (Enter)')}
      </div>
      <p className="label">🎂 Geburtstage · nie wieder vergessen</p>
      <div className="card">
        {gebSorted.map(({ g, info }) => (
          <div className="row" key={g.id}>
            <span style={{ fontSize: 20, width: 28, textAlign: 'center', flexShrink: 0 }}>🎂</span>
            <div className="row-main">
              <div className="row-title">{g.name}</div>
              <div className="row-meta">
                {g.date}
                {info && ' · ' + (info.days === 0 ? 'heute! 🎉' : info.days === 1 ? 'morgen' : `in ${info.days} Tagen`)}
                {info?.age != null && ` · wird ${info.age}`}
              </div>
            </div>
            <button className="btn sm" onClick={() => openWa(g)}>💬 WhatsApp</button>
            {!isKid && <button className="xdel" onClick={() => deleteGeb(g)} aria-label={g.name + ' löschen'}>✕</button>}
          </div>
        ))}
        {!gebs.length && <div className="empty">Noch keine Geburtstage gemerkt – unten eintragen, Eselsohr erinnert rechtzeitig.</div>}
        {!isKid && <GebForm onAdd={addGeb} />}
        {!isKid && <WaTemplateRow key={db.waTemplate || 'std'} value={db.waTemplate || WA_DEFAULT}
          onSave={(v) => { saveAll({ ...db, waTemplate: v }); toast('💬 Vorlage gespeichert ✓') }} />}
      </div>
    </section>
  )

  const screenPraxis = (() => {
    if (praxisSel) {
      const k = klientById(praxisSel)
      if (!k) { setPraxisSel(null); return null }
      const kt = klientTermine(k.id)
      const done = kt.filter((t) => t.ist)
      return (
        <section className="screen">
          <button className="btn ghost" style={{ margin: '12px 0 10px' }} onClick={() => setPraxisSel(null)}>‹ Zurück</button>
          <h2 className="screen-title serif">{k.name}</h2>
          <p className="screen-sub">{kt.length} Termin{kt.length === 1 ? '' : 'e'} · {done.reduce((a, t) => a + (+t.ist || 0), 0)} Min. dokumentiert</p>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 14 }}>
            {k.adresse && <a className="btn" href={mapsLink(k.adresse)} target="_blank" rel="noreferrer">🚗 Anfahrt</a>}
            {k.telefon && <a className="btn ghost" href={'tel:' + k.telefon}>📞 Anrufen</a>}
            <button className="btn ghost" onClick={() => setPTerminSheet({ klid: k.id })}>➕ Termin</button>
            <button className="btn ghost" onClick={() => setVorlageSheet(k.id)}>📄 Dokument</button>
            <button className="btn ghost" onClick={() => setKlientSheet(k.id)}>✏️ Bearbeiten</button>
          </div>
          <div className="card">
            <div className="fact"><b>Telefon</b><span>{k.telefon || '—'}</span></div>
            <div className="fact"><b>Adresse</b><span>{k.adresse || '—'}</span></div>
            <div className="fact"><b>Notiz</b><span>{k.notiz || '—'}</span></div>
          </div>
          <p className="label">Termin-Historie · Ist-Zeit direkt eintragen</p>
          <div className="card">
            {kt.map((t) => (
              <div className="row" key={t.id}>
                <span className="time" style={{ minWidth: 76 }}>{fmtShort(t.on_date)} {t.at_time}</span>
                <div className="row-main">
                  <div className="row-title">{t.ptype}</div>
                  <div className="row-meta">Soll: {t.soll || '—'} Min.</div>
                </div>
                <label style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 13, color: 'var(--ink-soft)' }}>
                  Ist
                  <input type="number" min="0" defaultValue={t.ist || ''} placeholder="–"
                    onBlur={(e) => setIst(t.id, e.target.value)}
                    aria-label="Ist-Dauer in Minuten"
                    style={{ width: 58, font: 'inherit', padding: '5px 8px', borderRadius: 8, border: '1px solid var(--hairline)', background: 'var(--ground)', color: 'var(--ink)', fontVariantNumeric: 'tabular-nums' }} />
                  Min.
                </label>
              </div>
            ))}
            {!kt.length && <div className="empty">Noch keine Termine – oben „➕ Termin“ antippen.</div>}
          </div>
        </section>
      )
    }

    const q = praxisQ.trim().toLowerCase()
    const hits = praxis.klienten.filter((k) => !q || (k.name + ' ' + (k.adresse || '') + ' ' + (k.notiz || '')).toLowerCase().includes(q))
    const upcoming = db.events
      .filter((e) => e.ptype && e.on_date >= today && (!q || e.title.toLowerCase().includes(q)))
      .sort((a, b) => a.on_date.localeCompare(b.on_date) || a.at_time.localeCompare(b.at_time))
      .slice(0, 10)
    return (
      <section className="screen">
        <div className="title-row">
          <div>
            <h2 className="screen-title">Praxis</h2>
            <p className="screen-sub">Klientinnen, Termine mit Soll/Ist-Zeiten und Dokumente</p>
          </div>
          <button className="btn" onClick={() => setPTerminSheet({})}>+ Praxistermin</button>
        </div>
        <input className="search" value={praxisQ} onChange={(e) => setPraxisQ(e.target.value)}
          placeholder="Nach Namen suchen …" aria-label="Klientinnen durchsuchen" />
        <div className="cols two">
          <div>
            <p className="label">Klientinnen</p>
            <div className="card">
              {hits.map((k) => {
                const kt = klientTermine(k.id)
                return (
                  <button className="row" key={k.id} onClick={() => setPraxisSel(k.id)}>
                    <span className="avatar">{k.name[0].toUpperCase()}</span>
                    <div className="row-main">
                      <div className="row-title">{k.name}</div>
                      <div className="row-meta">{kt.length ? `${kt.length} Termin${kt.length === 1 ? '' : 'e'} · zuletzt ${fmtShort(kt[0].on_date)}` : 'noch kein Termin'}</div>
                    </div>
                    <span className="chev">›</span>
                  </button>
                )
              })}
              {!hits.length && <div className="empty">{q ? `Keine Klientin passt zu „${praxisQ}“.` : 'Noch keine Klientinnen.'}</div>}
              <button className="row" onClick={() => setKlientSheet(true)}>
                <RowIcon name="plus" />
                <div className="row-main">
                  <div className="row-title">Neue Klientin</div>
                  <div className="row-meta">Kontaktformular: Name, Telefon, Adresse</div>
                </div>
                <span className="chev">›</span>
              </button>
            </div>
          </div>
          <div>
            <p className="label">Nächste Praxistermine</p>
            <div className="card">
              {upcoming.map((e) => (
                <button className="row" key={e.id} onClick={() => { if (e.klid) setPraxisSel(e.klid) }}>
                  <span className="time" style={{ minWidth: 76 }}>{fmtShort(e.on_date)} {e.at_time}</span>
                  <div className="row-main">
                    <div className="row-title">{e.title}</div>
                    <div className="row-meta">Soll: {e.soll || '—'} Min.{e.klid && klientById(e.klid)?.adresse ? ' · ' + klientById(e.klid).adresse : ''}</div>
                  </div>
                  <span className="chev">›</span>
                </button>
              ))}
              {!upcoming.length && <div className="empty">Nichts geplant.</div>}
            </div>
            <p className="hint">Praxistermine erscheinen automatisch auch im Familienkalender.</p>
          </div>
        </div>
      </section>
    )
  })()

  const screenProfil = (
    <section className="screen">
      <div style={{ display: 'flex', alignItems: 'center', gap: 14, margin: '16px 2px 4px' }}>
        <span className="avatar member" style={{ background: me.color, width: 54, height: 54, fontSize: 22 }}>{me.name[0].toUpperCase()}</span>
        <div>
          <h2 className="screen-title" style={{ margin: 0 }}>{me.name}</h2>
          <p className="screen-sub" style={{ margin: 0 }}>{isKid ? 'Kind' : me.is_admin ? 'Erwachsen · Familien-Admin' : 'Erwachsen'} · {db.family.name}</p>
        </div>
      </div>
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', margin: '12px 0 4px' }}>
        <button className="btn ghost" onClick={() => saveAll({ ...db, active: null })}>⇄ Profil wechseln</button>
      </div>

      <p className="label">Meine Farbe · färbt deine ganze App</p>
      <div className="card">
        <div className="row">
          <div className="colorpick">
            {COLORS.map((c) => (
              <button type="button" key={c} className={me.color === c ? 'sel' : ''} style={{ background: c }}
                aria-label={'Farbe ' + c} onClick={() => {
                  saveAll({ ...db, members: db.members.map((m) => (m.id === me.id ? { ...m, color: c } : m)) })
                  toast('Neue Farbe ✓ – deine App trägt sie jetzt überall')
                }} />
            ))}
          </div>
        </div>
      </div>

      {!isKid && (
        <>
          <p className="label">Meine Module · nur du siehst deren Inhalte</p>
          <div className="card">
            {MODULES.map((mod) => hasMod(me, mod.id) ? (
              <div className="row" key={mod.id}>
                <RowIcon name={mod.ico} />
                <div className="row-main">
                  <div className="row-title">{mod.name} <span className="chip ok" style={{ marginLeft: 4 }}>aktiv</span></div>
                  <div className="row-meta">{mod.privacy}</div>
                </div>
                <button className="btn ghost sm" onClick={() => toggleModule(mod.id)}>Entfernen</button>
              </div>
            ) : (
              <button className="row" key={mod.id} onClick={() => toggleModule(mod.id)}>
                <RowIcon name={mod.ico} />
                <div className="row-main">
                  <div className="row-title">➕ {mod.name}</div>
                  <div className="row-meta">{mod.desc}</div>
                </div>
                <span className="chev">›</span>
              </button>
            ))}
          </div>

          {hasMod(me, 'praxis') && (
            <>
              <p className="label">🩺 Praxis</p>
              <div className="card">
                <button className="row" onClick={() => setNav('praxis')}>
                  <RowIcon name="heart" />
                  <div className="row-main">
                    <div className="row-title">Praxis öffnen</div>
                    <div className="row-meta">{praxis.klienten.length} Klientin{praxis.klienten.length === 1 ? '' : 'nen'} · {db.events.filter((e) => e.ptype).length} Praxistermine</div>
                  </div>
                  <span className="chev">›</span>
                </button>
              </div>
            </>
          )}

          {hasMod(me, 'sport') && (
            <>
              <p className="label">🏃 Sport · dein Ausgleich, fest eingeplant</p>
              <div className="card">
                <div className="row">
                  <RowIcon name="activity" />
                  <div className="row-main">
                    <div className="row-title">Wochenziel</div>
                    <div className="row-meta">Klein anfangen zählt – lieber 2× geschafft als 5× geplant.</div>
                  </div>
                  <select value={sportGoal} aria-label="Wochenziel"
                    onChange={(e) => saveAll({ ...db, members: db.members.map((m) => (m.id === me.id ? { ...m, sportGoal: +e.target.value } : m)) })}
                    style={{ font: 'inherit', fontWeight: 800, padding: '6px 10px', borderRadius: 9, border: '2px solid var(--line)', background: 'var(--ground)', color: 'var(--ink)' }}>
                    {[1, 2, 3, 4, 5].map((n) => <option key={n} value={n}>{n}× / Woche</option>)}
                  </select>
                </div>
                <SportPlanForm onPlan={planSport} />
                {mySportWeek.length > 0 && (
                  <>
                    {mySportWeek.sort((a, b) => a.on_date.localeCompare(b.on_date)).map((e) => (
                      <label className="row" key={e.id} style={{ cursor: 'pointer' }}>
                        <input type="checkbox" className="check" checked={!!e.done} onChange={() => toggleSportDone(e)} aria-label={'Gemacht: ' + e.title} />
                        <div className="row-main">
                          <div className={'row-title' + (e.done ? ' done-text' : '')}>{e.title}</div>
                          <div className="row-meta">{fmtShort(e.on_date)} {e.at_time} · abhaken, wenn gemacht 💪</div>
                        </div>
                      </label>
                    ))}
                  </>
                )}
              </div>
            </>
          )}

          {hasMod(me, 'verein') && (
            <>
              <p className="label">⚽ Vereins-App</p>
              <div className="card">
                {(db.verein?.links || []).map((l) => (
                  <div className="row" key={l.tid}>
                    <RowIcon name="trophy" />
                    <div className="row-main">
                      <div className="row-title">{l.teamName}</div>
                      <div className="row-meta">Termine landen bei {mname(l.memberId)} · letzter Sync: {db.verein?.lastSync || '—'}</div>
                    </div>
                    <button className="xdel" onClick={() => removeVereinLink(l.tid)} aria-label="Verknüpfung entfernen">✕</button>
                  </div>
                ))}
                {(db.verein?.links || []).length > 0 && (
                  <button className="row" disabled={syncing} onClick={() => syncVerein(db.verein.links, db, false)}>
                    <RowIcon name="link" />
                    <div className="row-main">
                      <div className="row-title">{syncing ? 'Synchronisiere …' : 'Jetzt synchronisieren'}</div>
                      <div className="row-meta">Passiert auch automatisch bei jedem App-Start</div>
                    </div>
                    <span className="chev">›</span>
                  </button>
                )}
                <button className="row" onClick={() => setVereinSheet(true)}>
                  <RowIcon name="link" />
                  <div className="row-main">
                    <div className="row-title">{(db.verein?.links || []).length ? 'Weiteres Team verknüpfen' : 'Team verknüpfen'}</div>
                    <div className="row-meta">Trainings, Spiele und Turniere automatisch im Familienkalender</div>
                  </div>
                  <span className="chev">›</span>
                </button>
              </div>
            </>
          )}

          {hasMod(me, 'arbeit') && (
            <>
              <p className="label">Arbeitskalender</p>
              <div className="card">
                <button className="row" onClick={() => icsInput.current?.click()}>
                  <RowIcon name="upload" />
                  <div className="row-main">
                    <div className="row-title">Kalenderdatei importieren (.ics)</div>
                    <div className="row-meta">
                      {db.events.filter((e) => e.src === 'work' && e.member_id === me.id).length
                        ? db.events.filter((e) => e.src === 'work' && e.member_id === me.id).length + ' Arbeitstermine importiert – erneuter Import aktualisiert alles'
                        : 'Aus Outlook/Office365 exportieren – deine Termine erscheinen mit 💼'}
                    </div>
                  </div>
                  <span className="chev">›</span>
                </button>
                <input ref={icsInput} type="file" accept=".ics,text/calendar" style={{ display: 'none' }}
                  onChange={(e) => { const f = e.target.files?.[0]; if (f) importIcs(f); e.target.value = '' }} />
                <div className="row">
                  <RowIcon name="info" />
                  <div className="row-main">
                    <div className="row-meta">Die Datei bleibt auf deinem Gerät. Die Familie sieht nur „Arbeit“ als belegte Zeit – keine Betreffe. Abo-Sync per Link kommt mit der Cloud-Stufe.</div>
                  </div>
                </div>
              </div>
            </>
          )}

          {hasMod(me, 'connect') && (
            <>
              <p className="label">Anbindungen · deine Daten in anderen Programmen</p>
              <div className="card">
                <button className="row" onClick={exportIcs}>
                  <RowIcon name="calendar" />
                  <div className="row-main">
                    <div className="row-title">Kalender exportieren (.ics)</div>
                    <div className="row-meta">Für Outlook, Google oder Apple Kalender – enthält nur, was du sehen darfst</div>
                  </div>
                  <span className="chev">›</span>
                </button>
                {hasMod(me, 'praxis') && (
                  <button className="row" onClick={exportPraxisCsv}>
                    <RowIcon name="table" />
                    <div className="row-main">
                      <div className="row-title">Praxistermine als CSV (Excel)</div>
                      <div className="row-meta">Klientin, Datum, Typ, Soll/Ist-Minuten – fertig für die Abrechnung</div>
                    </div>
                    <span className="chev">›</span>
                  </button>
                )}
                <button className="row" onClick={() => { if (!hasMod(me, 'arbeit')) toggleModule('arbeit'); else icsInput.current?.click() }}>
                  <RowIcon name="briefcase" />
                  <div className="row-main">
                    <div className="row-title">Outlook/Office-Kalender importieren</div>
                    <div className="row-meta">{hasMod(me, 'arbeit') ? 'Modul aktiv – .ics-Datei wählen' : 'Aktiviert das Modul Arbeitskalender'}</div>
                  </div>
                  <span className="chev">›</span>
                </button>
                <button className="row" onClick={() => { if (!hasMod(me, 'verein')) toggleModule('verein'); else setVereinSheet(true) }}>
                  <RowIcon name="trophy" />
                  <div className="row-main">
                    <div className="row-title">Vereins-App verknüpfen</div>
                    <div className="row-meta">{hasMod(me, 'verein') ? 'Modul aktiv – Team verknüpfen' : 'Aktiviert das Modul Vereins-App'}</div>
                  </div>
                  <span className="chev">›</span>
                </button>
                <button className="row" onClick={exportBackup}>
                  <RowIcon name="download" />
                  <div className="row-main">
                    <div className="row-title">Komplett-Backup (JSON)</div>
                    <div className="row-meta">Alle Daten als Datei – der Gedächtnispalast bleibt darin verschlüsselt</div>
                  </div>
                  <span className="chev">›</span>
                </button>
                <div className="row">
                  <RowIcon name="info" />
                  <div className="row-main">
                    <div className="row-meta">Mit der Cloud-Stufe kommen Live-Anbindungen: Abo-Link für Kalender, automatischer Abgleich statt Dateien.</div>
                  </div>
                </div>
              </div>
            </>
          )}
        </>
      )}
    </section>
  )

  const screenFamilie = (
    <section className="screen">
      <h2 className="screen-title">{db.family.name}</h2>
      <p className="screen-sub">Mitglieder, Rechte und Sicherung</p>
      {db.demo && (
        <div className="card" style={{ marginBottom: 4 }}>
          <div className="row">
            <span style={{ fontSize: 20, width: 28, textAlign: 'center', flexShrink: 0 }}>🎬</span>
            <div className="row-main">
              <div className="row-title">Demo-Modus</div>
              <div className="row-meta">Alles hier sind Beispieldaten. Profil wechseln lohnt sich: Anne hat das Praxis-Modul, die Kinder sehen nur ihren Teil.</div>
            </div>
            <button className="btn sm danger" onClick={endDemo}>Demo beenden</button>
          </div>
        </div>
      )}
      <p className="label">Mitglieder</p>
      <div className="card">
        {db.members.map((m) => (
          <div className="row" key={m.id}>
            <span className="avatar member" style={{ background: m.color }}>{m.name[0].toUpperCase()}</span>
            <div className="row-main">
              <div className="row-title">{m.name}{m.id === me.id ? ' (du)' : ''}</div>
              <div className="row-meta">
                {m.kind === 'kid' ? 'Kind' : m.is_admin ? 'Erwachsen · Familien-Admin' : 'Erwachsen'}
                {m.kind !== 'kid' && (m.can_direct ? ' · trägt direkt ein' : ' · braucht Bestätigung')}
                {MODULES.some((x) => hasMod(m, x.id)) && <span style={{ display: 'inline-flex', gap: 4, marginLeft: 6, verticalAlign: '-3px' }}>{MODULES.filter((x) => hasMod(m, x.id)).map((x) => <Icon key={x.id} name={x.ico} size={13} />)}</span>}
              </div>
            </div>
            {me.is_admin && m.kind !== 'kid' && m.id !== me.id && (
              <button className={'btn sm ' + (m.can_direct ? 'ghost' : '')} onClick={() => toggleDirect(m)}>
                {m.can_direct ? 'direkt ✓' : 'Anfrage'}
              </button>
            )}
            {m.kind === 'kid' && (
              <button className="btn sm ghost" onClick={() => setCareSheet(m.id)}>
                🏫 Betreuung{(m.care || []).length ? ` · ${m.care.length}` : ''}
              </button>
            )}
          </div>
        ))}
        {me.is_admin && (
          <button className="row" onClick={() => setMemberSheet(true)}>
            <RowIcon name="plus" />
            <div className="row-main">
              <div className="row-title">Mitglied hinzufügen</div>
              <div className="row-meta">Erwachsen oder Kind – mit Name und Farbe</div>
            </div>
            <span className="chev">›</span>
          </button>
        )}
      </div>
      <p className="label">🔗 Familien-Sync · alle Geräte, ein Stand</p>
      <div className="card">
        {cloud.on ? (
          <>
            <div className="row">
              <span style={{ fontSize: 20, width: 28, textAlign: 'center', flexShrink: 0 }}>{cloud.error ? '⚠️' : '🔗'}</span>
              <div className="row-main">
                <div className="row-title">{cloud.error ? 'Sync gestört – Daten bleiben lokal sicher' : 'Sync läuft'}</div>
                <div className="row-meta">
                  {cloud.error
                    ? String(cloud.error)
                    : 'Änderungen wandern automatisch auf alle Geräte mit diesem Code. Gedächtnispalast bleibt verschlüsselt.'}
                </div>
              </div>
              <button className="btn sm ghost" onClick={disableCloud}>Aus</button>
            </div>
            <div className="row">
              <div className="row-main">
                <div className="row-title" style={{ fontFamily: 'monospace', fontSize: 14, letterSpacing: '0.5px' }}>{cloud.code}</div>
                <div className="row-meta">Diesen Code am anderen Gerät bei „Familie beitreten“ eingeben. Er ist der Schlüssel – nur mündlich oder persönlich teilen.</div>
              </div>
              <button className="btn sm" onClick={async () => {
                try { await navigator.clipboard?.writeText(cloud.code); toast('Code kopiert ✓') } catch { toast('Bitte Code abschreiben – Zwischenablage gesperrt') }
              }}>Kopieren</button>
            </div>
          </>
        ) : (
          <button className="row" onClick={enableCloud}>
            <span style={{ fontSize: 20, width: 28, textAlign: 'center', flexShrink: 0 }}>🔗</span>
            <div className="row-main">
              <div className="row-title">Familien-Sync einschalten</div>
              <div className="row-meta">Damit sehen alle in der Familie denselben Stand – auf jedem Handy. Du bekommst einen Familien-Code zum Teilen.</div>
            </div>
            <span className="chev">›</span>
          </button>
        )}
      </div>
      {(db.trash || []).length > 0 && (
        <>
          <p className="label">🗑️ Papierkorb <span className="lact"><button className="btn ghost sm" onClick={emptyTrash}>Leeren</button></span></p>
          <div className="card">
            {(db.trash || []).map((t) => (
              <div className="row" key={t.id}>
                <span style={{ fontSize: 18, width: 28, textAlign: 'center', flexShrink: 0 }}>{{ event: '📅', item: '✅', zettel: '⚡', geb: '🎂' }[t.kind] || '🗑️'}</span>
                <div className="row-main">
                  <div className="row-title">{t.row.title || t.row.text || t.row.name || '—'}</div>
                  <div className="row-meta">gelöscht am {fmtShort(t.delAt)} · verschwindet nach 30 Tagen endgültig</div>
                </div>
                <button className="btn sm" onClick={() => restoreTrash(t)}>Wiederherstellen</button>
              </div>
            ))}
          </div>
        </>
      )}
      <p className="label">Sicherung</p>
      <div className="card">
        <button className="row" onClick={exportBackup}>
          <RowIcon name="download" />
          <div className="row-main">
            <div className="row-title">Backup exportieren</div>
            <div className="row-meta">Alle Daten als Text (Gedächtnispalast bleibt darin verschlüsselt) – sicher ablegen!</div>
          </div>
          <span className="chev">›</span>
        </button>
        <ImportRow onImport={(json) => {
          try {
            const obj = JSON.parse(json)
            if (!obj.family || !obj.members) throw new Error('Kein Eselsohr-Backup')
            saveAll(obj)
            toast('Backup eingespielt ✓')
          } catch (e) {
            toast('Import fehlgeschlagen: ' + e.message)
          }
        }} />
      </div>
      <p className="label">Hinweis</p>
      <div className="card">
        <div className="row">
          <RowIcon name={persistent ? 'archive' : 'alert'} />
          <div className="row-main">
            <div className="row-title">{persistent ? 'Daten liegen nur in diesem Browser' : 'Achtung: Speichern in diesem Browser nicht möglich'}</div>
            <div className="row-meta">
              {persistent
                ? 'Keine Datenbank, kein Server. Regelmäßig ein Backup exportieren – die Cloud-Synchronisierung kommt in Stufe 2.'
                : 'Daten leben nur in dieser Sitzung. Exportiere ein Backup, bevor du die Seite schließt.'}
            </div>
          </div>
        </div>
      </div>
    </section>
  )

  const NAVS = [
    ['heute', 'home', 'Heute', invites.length],
    ['kalender', 'calendar', 'Kalender', 0],
    ['listen', 'cart', 'Listen', 0],
    ...(!isKid ? [
      ...(hasMod(me, 'praxis') ? [['praxis', 'heart', 'Praxis', 0]] : []),
      ['merkzeug', 'landmark', 'Gedächtnispalast', 0, 'Palast'],
      ['familie', 'users', 'Familie', 0],
    ] : []),
  ]

  return (
    <div className="shell">
      <aside className="side">
        <div className="logo serif"><LogoMark size={28} />Esels<span className="nest">ohr</span></div>
        {NAVS.map(([id, ico, label, cnt]) => (
          <button key={id} className={'navbtn' + (nav === id ? ' active' : '')} onClick={() => setNav(id)}>
            <span className="ico"><Icon name={ico} /></span>{label}
            {cnt > 0 && <span className="cnt">{cnt}</span>}
          </button>
        ))}
        <div className="spacer" />
        <div className="demonote">{db.family.name} · {db.members.length} Mitglieder · Daten nur auf diesem Gerät</div>
      </aside>
      <div className="mainwrap">
        <header className="topbar">
          <h1 className="wordmark serif"><LogoMark size={25} />Esels<span className="nest">ohr</span></h1>
          <span className="sp" />
          {!isKid && (
            <button className="iconbtn" aria-label="Blitzzettel – schnell festhalten" title="Blitzzettel" onClick={() => setBlitz(true)}>⚡</button>
          )}
          <button className="userchip" onClick={() => setNav('profil')} aria-label="Mein Profil">
            <span className="avatar sm member" style={{ background: me.color }}>{me.name[0].toUpperCase()}</span>
            {me.name}
          </button>
        </header>
        <main>
          {nav === 'heute' && screenHeute}
          {nav === 'kalender' && screenKalender}
          {nav === 'listen' && screenListen}
          {nav === 'praxis' && !isKid && hasMod(me, 'praxis') && screenPraxis}
          {nav === 'profil' && screenProfil}
          {nav === 'merkzeug' && !isKid && (
            <Merkzeug
              blob={db.memories[me.id] || null}
              onSaveBlob={(blob, opts) => saveAll({ ...db, memories: { ...db.memories, [me.id]: blob }, ...(opts?.clearInbox ? { inbox: (db.inbox || []).filter((i) => i.member_id !== me.id) } : {}) })}
              ownerName={me.name}
              toast={toast}
              inbox={(db.inbox || []).filter((i) => i.member_id === me.id)}
              onImportInbox={() => saveAll({ ...db, inbox: (db.inbox || []).filter((i) => i.member_id !== me.id) })}
            />
          )}
          {nav === 'familie' && !isKid && screenFamilie}
          <footer className="note">Eselsohr · eure Daten gehören euch · Gedächtnispalast Ende-zu-Ende-verschlüsselt</footer>
        </main>
        <nav className="tabs">
          <div className="inner">
            {NAVS.map(([id, ico, label, , short]) => (
              <button key={id} className={'tab' + (nav === id ? ' active' : '')} onClick={() => setNav(id)}>
                <span className="ico"><Icon name={ico} /></span>{short || label}
              </button>
            ))}
          </div>
        </nav>
      </div>
      {sheet && (
        <EventSheet initial={sheet} members={db.members} me={me} stats={titleStats}
          onSave={saveEvent} onDelete={deleteEvent} onClose={() => setSheet(null)} />
      )}
      {blitz && (
        <BlitzSheet count={myInbox.length} onList={() => { setBlitz(false); setBlitzList(true) }}
          onClose={() => setBlitz(false)} onSave={(text) => {
          const d = new Date()
          saveAll({
            ...db,
            inbox: [...(db.inbox || []), { id: uid(), member_id: me.id, text, ts: Date.now(), date: `${d.getDate()}.${d.getMonth() + 1}.${d.getFullYear()}` }],
          })
          setBlitz(false)
          toast('⚡ Festgehalten – ist sicher. Weiter im Alltag.')
        }} />
      )}
      {blitzList && (
        <BlitzListe items={myInbox} onDelete={deleteZettel} onTodo={zettelToTodo} onClose={() => setBlitzList(false)} />
      )}
      {wiz?.type === 'serie' && (
        <SerieWizard base={wiz.base} count={wiz.count} memberName={mname(wiz.base.member_id)}
          onCreate={(weeks) => { continueSerie(wiz.base, weeks); setWiz(null) }} onClose={() => setWiz(null)} />
      )}
      {wiz?.type === 'ist' && (
        <IstWizard list={wiz.list} klientById={klientById}
          onSaveIst={(id, ist) => saveAll({ ...db, events: db.events.map((e) => (e.id === id ? { ...e, ist } : e)) })}
          onDone={(n) => { setWiz(null); toast(n ? `✓ ${n} Ist-Zeit${n > 1 ? 'en' : ''} nachgetragen` : 'Alles klar – später weitermachen geht immer') }}
          onClose={() => setWiz(null)} />
      )}
      {wiz?.type === 'sport' && (
        <div className="overlay" onClick={(e) => { if (e.target === e.currentTarget) setWiz(null) }}>
          <div className="sheet">
            <h3>🏃 Sport einplanen<button type="button" className="x" onClick={() => setWiz(null)} aria-label="Schließen">✕</button></h3>
            <p className="hint" style={{ marginTop: 0 }}>Fester Wochentermin, 8 Wochen lang – der Termin gehört dir, wie jeder andere auch.</p>
            <SportPlanForm onPlan={(a, w, t) => { planSport(a, w, t); setWiz(null) }} />
          </div>
        </div>
      )}
      {memberSheet && (
        <MemberSheet onAdd={addMember} onClose={() => setMemberSheet(false)}
          usedColors={db.members.map((m) => m.color)} />
      )}
      {careSheet && byId[careSheet] && (
        <CareSheet kid={byId[careSheet]}
          onSave={(blocks) => { saveCare(careSheet, blocks); setCareSheet(null) }}
          onClose={() => setCareSheet(null)} />
      )}
      {vereinSheet && (
        <VereinSheet members={db.members} me={me}
          onLink={(tid, teamName, memberId) => { addVereinLink(tid, teamName, memberId); setVereinSheet(false) }}
          onClose={() => setVereinSheet(false)} />
      )}
      {klientSheet && (
        <KlientSheet existing={klientSheet === true ? null : klientById(klientSheet)}
          onSave={(data, id) => { saveKlient(data, id); setKlientSheet(null) }}
          onClose={() => setKlientSheet(null)} />
      )}
      {pTerminSheet && (
        <PTerminSheet klienten={praxis.klienten} initialKlid={pTerminSheet.klid} today={today}
          onSave={(data) => { addPraxisTermin(data); setPTerminSheet(null) }}
          onClose={() => setPTerminSheet(null)}
          onNeedKlient={() => { setPTerminSheet(null); setKlientSheet(true) }} />
      )}
      {vorlageSheet && (
        <VorlageSheet klient={klientById(vorlageSheet)} termine={klientTermine(vorlageSheet)} meName={me.name}
          toast={toast} onClose={() => setVorlageSheet(null)} />
      )}
      {toastEl}
    </div>
  )
}

function MemberSheet({ onAdd, onClose, usedColors }) {
  const [name, setName] = useState('')
  const [kind, setKind] = useState('kid')
  const [color, setColor] = useState(COLORS.find((c) => !usedColors.includes(c)) || COLORS[3])
  return (
    <div className="overlay" onClick={(e) => { if (e.target === e.currentTarget) onClose() }}>
      <form className="sheet" onSubmit={(e) => {
        e.preventDefault()
        if (name.trim()) { onAdd(name.trim(), color, kind); onClose() }
      }}>
        <h3>Mitglied hinzufügen<button type="button" className="x" onClick={onClose} aria-label="Schließen">✕</button></h3>
        <div className="field">
          <label htmlFor="m-name">Vorname</label>
          <input id="m-name" autoFocus required value={name} onChange={(e) => setName(e.target.value)} placeholder="z. B. Anne-Christin" />
        </div>
        <div className="field">
          <label>Wer ist es?</label>
          <div style={{ display: 'flex', gap: 8 }}>
            <button type="button" className={'btn sm ' + (kind === 'adult' ? '' : 'ghost')} onClick={() => setKind('adult')}>Erwachsen</button>
            <button type="button" className={'btn sm ' + (kind === 'kid' ? '' : 'ghost')} onClick={() => setKind('kid')}>Kind</button>
          </div>
        </div>
        <div className="field">
          <label>Farbe im Kalender</label>
          <div className="colorpick">
            {COLORS.map((c) => (
              <button type="button" key={c} className={color === c ? 'sel' : ''} style={{ background: c }}
                aria-label={'Farbe ' + c} onClick={() => setColor(c)} />
            ))}
          </div>
        </div>
        <button className="btn" style={{ width: '100%' }}>Hinzufügen</button>
        <p className="hint">Kinder sehen nur Heute, Kalender und Listen – ohne Gedächtnispalast und Verwaltung.</p>
      </form>
    </div>
  )
}

const CARE_PRESETS = ['Kita', 'Schule', 'OGS / Hort', 'Tagesmutter', 'Oma & Opa']

function CareSheet({ kid, onSave, onClose }) {
  const [blocks, setBlocks] = useState(kid.care || [])
  const [label, setLabel] = useState(CARE_PRESETS[0])
  const [days, setDays] = useState([0, 1, 2, 3, 4])
  const [from, setFrom] = useState('08:00')
  const [to, setTo] = useState('14:00')
  const addBlock = () => {
    if (!label.trim() || !days.length || !from || !to) return
    setBlocks([...blocks, { id: uid(), label: label.trim(), days: [...days].sort((a, b) => a - b), from, to }])
  }
  return (
    <div className="overlay" onClick={(e) => { if (e.target === e.currentTarget) onClose() }}>
      <form className="sheet" onSubmit={(e) => { e.preventDefault(); onSave(blocks) }}>
        <h3>🏫 Betreuung · {kid.name}<button type="button" className="x" onClick={onClose} aria-label="Schließen">✕</button></h3>
        <p className="hint" style={{ marginTop: 0 }}>
          Feste Zeiten, in denen {kid.name} versorgt ist – Kita, Schule, Hort … Alle sehen dann
          auf einen Blick, wann kein Elternteil einspringen muss.
        </p>
        {blocks.map((b) => (
          <div className="row" key={b.id}>
            <div className="row-main">
              <div className="row-title">{b.label}</div>
              <div className="row-meta">{b.days.map((d) => WD[d]).join(' · ')} · {b.from}–{b.to} Uhr</div>
            </div>
            <button type="button" className="xdel" onClick={() => setBlocks(blocks.filter((x) => x.id !== b.id))} aria-label={b.label + ' entfernen'}>✕</button>
          </div>
        ))}
        {!blocks.length && <div className="empty">Noch keine Betreuungszeiten angelegt.</div>}
        <div className="field">
          <label>Was ist es?</label>
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            {CARE_PRESETS.map((p) => (
              <button type="button" key={p} className={'btn sm ' + (label === p ? '' : 'ghost')} onClick={() => setLabel(p)}>{p}</button>
            ))}
          </div>
          <input value={label} onChange={(e) => setLabel(e.target.value)} placeholder="oder eigener Name" style={{ marginTop: 6 }} aria-label="Name der Betreuung" />
        </div>
        <div className="field">
          <label>An welchen Tagen?</label>
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            {WD.map((n, i) => (
              <button type="button" key={n} className={'btn sm ' + (days.includes(i) ? '' : 'ghost')}
                onClick={() => setDays(days.includes(i) ? days.filter((x) => x !== i) : [...days, i])}>{n}</button>
            ))}
          </div>
        </div>
        <div className="grid2">
          <div className="field"><label htmlFor="c-from">Von</label><input id="c-from" type="time" value={from} onChange={(e) => setFrom(e.target.value)} /></div>
          <div className="field"><label htmlFor="c-to">Bis</label><input id="c-to" type="time" value={to} onChange={(e) => setTo(e.target.value)} /></div>
        </div>
        <button type="button" className="btn ghost" style={{ width: '100%', marginBottom: 8 }} onClick={addBlock}>+ Zeit hinzufügen</button>
        <button className="btn" style={{ width: '100%' }}>Speichern</button>
        <p className="hint">Gilt jede Woche automatisch – Ferien oder Ausnahmen trägst du einfach als Termin ein.</p>
      </form>
    </div>
  )
}

function KlientSheet({ existing, onSave, onClose }) {
  const [name, setName] = useState(existing?.name || '')
  const [telefon, setTelefon] = useState(existing?.telefon || '')
  const [adresse, setAdresse] = useState(existing?.adresse || '')
  const [notiz, setNotiz] = useState(existing?.notiz || '')
  return (
    <div className="overlay" onClick={(e) => { if (e.target === e.currentTarget) onClose() }}>
      <form className="sheet" onSubmit={(e) => {
        e.preventDefault()
        if (name.trim()) onSave({ name: name.trim(), telefon: telefon.trim(), adresse: adresse.trim(), notiz: notiz.trim() }, existing?.id)
      }}>
        <h3>{existing ? 'Klientin bearbeiten' : 'Neue Klientin'}<button type="button" className="x" onClick={onClose} aria-label="Schließen">✕</button></h3>
        <div className="field">
          <label htmlFor="k-name">Name</label>
          <input id="k-name" autoFocus required value={name} onChange={(e) => setName(e.target.value)} placeholder="z. B. Julia Müller" />
        </div>
        <div className="field">
          <label htmlFor="k-tel">Telefon</label>
          <input id="k-tel" type="tel" value={telefon} onChange={(e) => setTelefon(e.target.value)} placeholder="für 📞 Anrufen per Knopfdruck" />
        </div>
        <div className="field">
          <label htmlFor="k-adr">Adresse</label>
          <input id="k-adr" value={adresse} onChange={(e) => setAdresse(e.target.value)} placeholder="für 🚗 Anfahrt per Knopfdruck" />
        </div>
        <div className="field">
          <label htmlFor="k-notiz">Notiz (optional)</label>
          <input id="k-notiz" value={notiz} onChange={(e) => setNotiz(e.target.value)} placeholder="z. B. 2. Kind, Hebammen-Übernahme ab …" />
        </div>
        <button className="btn" style={{ width: '100%' }}>Speichern</button>
      </form>
    </div>
  )
}

function PTerminSheet({ klienten, initialKlid, today, onSave, onClose, onNeedKlient }) {
  const [klid, setKlid] = useState(initialKlid || klienten[0]?.id || '')
  const [ptype, setPtype] = useState('Nachsorge')
  const [date, setDate] = useState(today)
  const [time, setTime] = useState('10:00')
  const [soll, setSoll] = useState(60)
  const [notiz, setNotiz] = useState('')
  if (!klienten.length) {
    return (
      <div className="overlay" onClick={(e) => { if (e.target === e.currentTarget) onClose() }}>
        <div className="sheet">
          <h3>🩺 Praxistermin<button type="button" className="x" onClick={onClose} aria-label="Schließen">✕</button></h3>
          <p style={{ margin: '0 0 14px', fontSize: 14, color: 'var(--ink-soft)' }}>Zuerst brauchst du eine Klientin.</p>
          <button className="btn" style={{ width: '100%' }} onClick={onNeedKlient}>➕ Neue Klientin anlegen</button>
        </div>
      </div>
    )
  }
  return (
    <div className="overlay" onClick={(e) => { if (e.target === e.currentTarget) onClose() }}>
      <form className="sheet" onSubmit={(e) => {
        e.preventDefault()
        if (klid) onSave({ klid, ptype, on_date: date, at_time: time, soll: +soll || null, notiz: notiz.trim() })
      }}>
        <h3>🩺 Praxistermin<button type="button" className="x" onClick={onClose} aria-label="Schließen">✕</button></h3>
        <div className="grid2">
          <div className="field">
            <label htmlFor="p-klient">Klientin</label>
            <select id="p-klient" value={klid} onChange={(e) => setKlid(e.target.value)}>
              {klienten.map((k) => <option key={k.id} value={k.id}>{k.name}</option>)}
            </select>
          </div>
          <div className="field">
            <label htmlFor="p-typ">Typ</label>
            <select id="p-typ" value={ptype} onChange={(e) => setPtype(e.target.value)}>
              {PTYPES.map((t) => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
        </div>
        <div className="grid2">
          <div className="field">
            <label htmlFor="p-date">Tag</label>
            <input id="p-date" type="date" required value={date} onChange={(e) => setDate(e.target.value)} />
          </div>
          <div className="field">
            <label htmlFor="p-time">Uhrzeit</label>
            <input id="p-time" type="time" required value={time} onChange={(e) => setTime(e.target.value)} />
          </div>
        </div>
        <div className="grid2">
          <div className="field">
            <label htmlFor="p-soll">Soll-Dauer (Min.)</label>
            <input id="p-soll" type="number" min="5" step="5" value={soll} onChange={(e) => setSoll(e.target.value)} />
          </div>
          <div className="field">
            <label htmlFor="p-notiz">Notiz (optional)</label>
            <input id="p-notiz" value={notiz} onChange={(e) => setNotiz(e.target.value)} placeholder="z. B. Gewichtskontrolle" />
          </div>
        </div>
        <button className="btn" style={{ width: '100%' }}>Termin planen</button>
        <p className="hint">Die Ist-Zeit trägst du später mit einem Fingertipp in der Historie der Klientin ein.</p>
      </form>
    </div>
  )
}

function VorlageSheet({ klient, termine, meName, toast, onClose }) {
  const [vid, setVid] = useState(VORLAGEN[0].id)
  const tpl = VORLAGEN.find((v) => v.id === vid)
  const [text, setText] = useState(() => fillVorlage(tpl, klient, termine, meName))
  return (
    <div className="overlay" onClick={(e) => { if (e.target === e.currentTarget) onClose() }}>
      <div className="sheet">
        <h3>📄 Dokument aus Vorlage<button type="button" className="x" onClick={onClose} aria-label="Schließen">✕</button></h3>
        <div className="field">
          <label htmlFor="v-vorlage">Vorlage · Name und Daten von {klient.name} sind schon eingesetzt</label>
          <select id="v-vorlage" value={vid} onChange={(e) => {
            setVid(e.target.value)
            setText(fillVorlage(VORLAGEN.find((v) => v.id === e.target.value), klient, termine, meName))
          }}>
            {VORLAGEN.map((v) => <option key={v.id} value={v.id}>{v.name}</option>)}
          </select>
        </div>
        <div className="field">
          <textarea rows={11} value={text} onChange={(e) => setText(e.target.value)} aria-label="Dokumenttext" style={{ fontSize: 13.5 }} />
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button className="btn" style={{ flex: 1 }} onClick={() => saveTextFile(klient.name.replaceAll(' ', '-') + '-dokument.txt', text, toast)}>Speichern</button>
          <button className="btn ghost" style={{ flex: 1 }} onClick={() => { navigator.clipboard?.writeText(text); toast('Kopiert ✓') }}>Kopieren</button>
        </div>
        <p className="hint">Stufe KI: Später liest die KI deine Scans/PDFs aus und füllt Vorlagen automatisch – die Namenszuordnung bleibt so wie hier.</p>
      </div>
    </div>
  )
}

function VereinSheet({ members, me, onLink, onClose }) {
  const [state, setState] = useState('loading') // loading | error | ready
  const [error, setError] = useState(null)
  const [data, setData] = useState(null)
  const [tid, setTid] = useState('')
  const [memberId, setMemberId] = useState(me.id)

  useEffect(() => {
    fetchVereinData()
      .then((d) => {
        setData(d)
        if (d.teams.length === 1) setTid(d.teams[0].id)
        setState('ready')
      })
      .catch((e) => { setError(e.message); setState('error') })
  }, [])

  const info = data && tid ? teamInfo(data, tid) : null
  const evCount = data && tid ? data.events.filter((ev) => ev.tid === tid && ev.date).length : 0

  return (
    <div className="overlay" onClick={(e) => { if (e.target === e.currentTarget) onClose() }}>
      <form className="sheet" onSubmit={(e) => {
        e.preventDefault()
        if (!tid) return
        const team = data.teams.find((t) => t.id === tid)
        onLink(tid, team?.name || 'Team', memberId)
      }}>
        <h3>⚽ Vereins-App verknüpfen<button type="button" className="x" onClick={onClose} aria-label="Schließen">✕</button></h3>
        {state === 'loading' && <div className="empty">Verbinde mit der Vereins-App …</div>}
        {state === 'error' && (
          <>
            <div className="authmsg err">Keine Verbindung zur Vereins-App: {error}</div>
            <p className="hint">Das klappt nur mit Internetverbindung – und nicht in der eingebetteten Vorschau. In der installierten bzw. deployten App funktioniert es.</p>
          </>
        )}
        {state === 'ready' && (
          <>
            <div className="field">
              <label htmlFor="v-team">Mannschaft</label>
              <select id="v-team" value={tid} onChange={(e) => setTid(e.target.value)}>
                <option value="" disabled>Team wählen …</option>
                {data.teams.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
              </select>
            </div>
            {info && (
              <div className="card" style={{ marginBottom: 12 }}>
                <div className="fact"><b>Trainer</b><span>{info.trainers.length ? info.trainers.join(', ') : '—'}</span></div>
                <div className="fact"><b>Spieler</b><span>{info.players.length ? `${info.players.length}: ${info.players.slice(0, 6).join(', ')}${info.players.length > 6 ? ' …' : ''}` : '—'}</span></div>
                <div className="fact"><b>Termine</b><span>{evCount} in der Vereins-App</span></div>
              </div>
            )}
            <div className="field">
              <label htmlFor="v-member">Termine landen im Kalender bei</label>
              <select id="v-member" value={memberId} onChange={(e) => setMemberId(e.target.value)}>
                {members.map((m) => <option key={m.id} value={m.id}>{m.name}</option>)}
              </select>
            </div>
            <button className="btn" style={{ width: '100%' }} disabled={!tid}>Verknüpfen &amp; synchronisieren</button>
            <p className="hint">Ab jetzt hält Eselsohr die Termine automatisch aktuell – Absagen und Verlegungen inklusive. Ganz ohne Passwort.</p>
          </>
        )}
      </form>
    </div>
  )
}

/* Blitzzettel: null Hürde – festhalten, bevor der Gedanke weg ist */
function BlitzSheet({ onSave, onClose, count = 0, onList }) {
  const [text, setText] = useState('')
  return (
    <div className="overlay" onClick={(e) => { if (e.target === e.currentTarget) onClose() }}>
      <form className="sheet" onSubmit={(e) => { e.preventDefault(); if (text.trim()) onSave(text.trim()) }}>
        <h3>⚡ Blitzzettel<button type="button" className="x" onClick={onClose} aria-label="Schließen">✕</button></h3>
        <div className="field">
          <textarea rows={4} autoFocus value={text} onChange={(e) => setText(e.target.value)}
            placeholder="Einfach raus damit – Stichworte reichen. Sortieren kannst du später. Oder nie."
            aria-label="Blitzzettel" />
        </div>
        <button className="btn" style={{ width: '100%' }}>Festhalten</button>
        {count > 0 && (
          <button type="button" className="btn ghost" style={{ width: '100%', marginTop: 8 }} onClick={onList}>
            Deine Zettel ansehen & sortieren ({count})
          </button>
        )}
        <p className="hint">Wandert beim nächsten Entsperren automatisch verschlüsselt in deinen Gedächtnispalast (📥 Eingang). Bis dahin liegt der Zettel unverschlüsselt nur auf diesem Gerät.</p>
      </form>
    </div>
  )
}

function BlitzListe({ items, onDelete, onTodo, onClose }) {
  const [sort, setSort] = useState('neu')
  const sorted = [...items].sort((a, b) =>
    sort === 'neu' ? (b.ts || 0) - (a.ts || 0) : sort === 'alt' ? (a.ts || 0) - (b.ts || 0) : a.text.localeCompare(b.text, 'de'))
  return (
    <div className="overlay" onClick={(e) => { if (e.target === e.currentTarget) onClose() }}>
      <div className="sheet">
        <h3>⚡ Deine Blitzzettel ({items.length})<button type="button" className="x" onClick={onClose} aria-label="Schließen">✕</button></h3>
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 10 }}>
          {[['neu', 'Neueste zuerst'], ['alt', 'Älteste zuerst'], ['az', 'A–Z']].map(([k, l]) => (
            <button type="button" key={k} className={'btn sm ' + (sort === k ? '' : 'ghost')} onClick={() => setSort(k)}>{l}</button>
          ))}
        </div>
        {sorted.map((z) => (
          <div className="row" key={z.id}>
            <div className="row-main">
              <div className="row-title" style={{ fontWeight: 500, whiteSpace: 'pre-wrap' }}>{z.text}</div>
              <div className="row-meta">vom {z.date}</div>
            </div>
            <button type="button" className="btn sm ghost" onClick={() => onTodo(z)} title="In die Familienliste „Zu erledigen“ übernehmen">→ To-do</button>
            <button type="button" className="xdel" onClick={() => onDelete(z)} aria-label="Zettel löschen">✕</button>
          </div>
        ))}
        {!items.length && <div className="empty">Keine Zettel – Kopf frei 🎉</div>}
        <p className="hint">Beim nächsten Entsperren des Gedächtnispalasts wandern alle Zettel automatisch verschlüsselt in den 📥 Eingang. Sortieren ist optional – nie Pflicht.</p>
      </div>
    </div>
  )
}

/* ================= 🎂 Geburtstage ================= */

const WA_DEFAULT = 'Alles Gute zum Geburtstag, {name}! 🎂🎉 Wir wünschen dir von Herzen einen wunderschönen Tag. Liebe Grüße von {familie}'

function GebForm({ onAdd }) {
  const [name, setName] = useState('')
  const [date, setDate] = useState('')
  const [tel, setTel] = useState('')
  const valid = name.trim() && gebInfo(date)
  const submit = () => {
    if (!valid) return
    onAdd(name.trim(), date.trim(), tel.trim())
    setName(''); setDate(''); setTel('')
  }
  return (
    <div className="quickadd" style={{ flexWrap: 'wrap' }}>
      <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Name (z. B. Oma Helga)" aria-label="Name"
        onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); submit() } }} style={{ flex: '2 1 140px' }} />
      <input value={date} onChange={(e) => setDate(e.target.value)} placeholder="16.08. oder 16.08.1949" aria-label="Geburtstag"
        onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); submit() } }} style={{ flex: '1 1 130px' }} />
      <input value={tel} onChange={(e) => setTel(e.target.value)} placeholder="Handy (optional)" aria-label="Handynummer für WhatsApp"
        onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); submit() } }} style={{ flex: '1 1 120px' }} />
      <button type="button" className="btn sm" disabled={!valid} onClick={submit}>Merken</button>
    </div>
  )
}

function WaTemplateRow({ value, onSave }) {
  const [open, setOpen] = useState(false)
  const [v, setV] = useState(value)
  if (!open) {
    return (
      <button className="row" onClick={() => { setV(value); setOpen(true) }}>
        <span style={{ fontSize: 20, width: 28, textAlign: 'center', flexShrink: 0 }}>💬</span>
        <div className="row-main">
          <div className="row-title">WhatsApp-Vorlage bearbeiten</div>
          <div className="row-meta">„{value.length > 64 ? value.slice(0, 64) + '…' : value}“</div>
        </div>
        <span className="chev">›</span>
      </button>
    )
  }
  return (
    <div className="row" style={{ alignItems: 'stretch', flexDirection: 'column', gap: 8 }}>
      <textarea value={v} onChange={(e) => setV(e.target.value)} rows={3} aria-label="WhatsApp-Vorlage"
        style={{ font: 'inherit', fontSize: 13, borderRadius: 10, border: '1px solid var(--hairline)', background: 'var(--ground)', color: 'var(--ink)', padding: 10, width: '100%' }} />
      <p className="hint" style={{ margin: 0 }}>Platzhalter: <b>{'{name}'}</b> = Name, <b>{'{alter}'}</b> = neues Alter, <b>{'{familie}'}</b> = euer Familienname.</p>
      <div style={{ display: 'flex', gap: 8 }}>
        <button className="btn sm" onClick={() => { onSave(v); setOpen(false) }}>Speichern</button>
        <button className="btn ghost sm" onClick={() => setOpen(false)}>Abbrechen</button>
      </div>
    </div>
  )
}

/* ================= ✨ Assistent-Wizards ================= */

function SerieWizard({ base, count, memberName, onCreate, onClose }) {
  const [weeks, setWeeks] = useState(8)
  return (
    <div className="overlay" onClick={(e) => { if (e.target === e.currentTarget) onClose() }}>
      <div className="sheet">
        <h3>↻ Serie anlegen<button type="button" className="x" onClick={onClose} aria-label="Schließen">✕</button></h3>
        <div className="card" style={{ marginBottom: 12 }}>
          <div className="fact"><b>Muster</b><span>„{base.title}“ gab es schon {count}×</span></div>
          <div className="fact"><b>Wann</b><span>{WD_LONG[wdIdx(fromIso(base.on_date))]}s um {base.at_time} Uhr</span></div>
          <div className="fact"><b>Für</b><span>{memberName}</span></div>
        </div>
        <div className="field">
          <label>Wie weit vorausplanen?</label>
          <div style={{ display: 'flex', gap: 6 }}>
            {[4, 8, 12].map((w) => (
              <button type="button" key={w} className={'btn sm ' + (weeks === w ? '' : 'ghost')} onClick={() => setWeeks(w)}>{w} Wochen</button>
            ))}
          </div>
        </div>
        <button className="btn" style={{ width: '100%' }} onClick={() => onCreate(weeks)}>↻ Ab nächster Woche eintragen</button>
        <p className="hint">Bereits vorhandene Termine bleiben unberührt – der Assistent füllt nur die Lücken. Einzelne Ausnahmen löschst du einfach im Kalender.</p>
      </div>
    </div>
  )
}

function IstWizard({ list, klientById, onSaveIst, onDone, onClose }) {
  const [i, setI] = useState(0)
  const [saved, setSaved] = useState(0)
  const [ist, setIst] = useState(() => String(list[0].soll || 60))
  const e = list[i]
  const next = (didSave) => {
    const n = saved + (didSave ? 1 : 0)
    if (i + 1 >= list.length) { onDone(n); return }
    setSaved(n)
    setI(i + 1)
    setIst(String(list[i + 1].soll || 60))
  }
  return (
    <div className="overlay" onClick={(ev) => { if (ev.target === ev.currentTarget) onClose() }}>
      <form className="sheet" onSubmit={(ev) => { ev.preventDefault(); onSaveIst(e.id, +ist || 0); next(true) }}>
        <h3>🩺 Ist-Zeiten · {i + 1} von {list.length}<button type="button" className="x" onClick={onClose} aria-label="Schließen">✕</button></h3>
        <div className="card" style={{ marginBottom: 12 }}>
          <div className="fact"><b>Klientin</b><span>{klientById(e.klid)?.name || '—'}</span></div>
          <div className="fact"><b>Termin</b><span>{fmtDate(e.on_date)} · {e.at_time} Uhr · {e.ptype}</span></div>
          <div className="fact"><b>Soll</b><span>{e.soll ? e.soll + ' Min.' : '—'}</span></div>
        </div>
        <div className="field">
          <label htmlFor="w-ist">Wie lange hat es wirklich gedauert? (Minuten)</label>
          <input id="w-ist" type="number" min="0" step="5" autoFocus value={ist} onChange={(ev) => setIst(ev.target.value)} />
        </div>
        <button className="btn" style={{ width: '100%' }}>Speichern & weiter</button>
        <button type="button" className="btn ghost" style={{ width: '100%', marginTop: 8 }} onClick={() => next(false)}>Überspringen</button>
        <p className="hint">Der Assistent geht alle offenen Termine durch – abbrechen jederzeit mit ✕, nichts geht verloren.</p>
      </form>
    </div>
  )
}

function SportPlanForm({ onPlan }) {
  const [act, setAct] = useState('')
  const [wd, setWd] = useState(2)
  const [time, setTime] = useState('19:00')
  const submit = () => { if (act.trim()) { onPlan(act.trim(), +wd, time); setAct('') } }
  return (
    <div className="quickadd" style={{ flexWrap: 'wrap' }}>
      <input value={act} onChange={(e) => setAct(e.target.value)} placeholder="Was? (z. B. Laufen, Kraftraum)" aria-label="Sportart"
        onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); submit() } }} style={{ flex: '2 1 150px' }} />
      <select value={wd} onChange={(e) => setWd(e.target.value)} aria-label="Wochentag"
        style={{ font: 'inherit', padding: '8px 10px', borderRadius: 9, border: '2px solid var(--line)', background: 'var(--ground)', color: 'var(--ink)' }}>
        {WD.map((n, i) => <option key={n} value={i}>{n}</option>)}
      </select>
      <input type="time" value={time} onChange={(e) => setTime(e.target.value)} aria-label="Uhrzeit"
        style={{ font: 'inherit', padding: '8px 10px', borderRadius: 9, border: '2px solid var(--line)', background: 'var(--ground)', color: 'var(--ink)', width: 100 }} />
      <button type="button" className="btn sm" onClick={submit}>Einplanen</button>
    </div>
  )
}

function ImportRow({ onImport }) {
  const [open, setOpen] = useState(false)
  const [v, setV] = useState('')
  if (!open) {
    return (
      <button className="row" onClick={() => setOpen(true)}>
        <RowIcon name="upload" />
        <div className="row-main">
          <div className="row-title">Backup einspielen</div>
          <div className="row-meta">Gespeicherten Backup-Text einfügen</div>
        </div>
        <span className="chev">›</span>
      </button>
    )
  }
  return (
    <div className="row" style={{ alignItems: 'stretch', flexDirection: 'column', gap: 8 }}>
      <textarea value={v} onChange={(e) => setV(e.target.value)} rows={4} placeholder='Backup-Text hier einfügen ({"family":…})'
        style={{ font: 'inherit', fontSize: 13, borderRadius: 10, border: '1px solid var(--hairline)', background: 'var(--ground)', color: 'var(--ink)', padding: 10, width: '100%' }} />
      <div style={{ display: 'flex', gap: 8 }}>
        <button className="btn sm" onClick={() => { onImport(v); setOpen(false); setV('') }}>Einspielen</button>
        <button className="btn ghost sm" onClick={() => setOpen(false)}>Abbrechen</button>
      </div>
    </div>
  )
}
