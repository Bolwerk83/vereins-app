import React, { useEffect, useRef, useState } from 'react'
import { loadState, saveState, storageWorks } from './store.js'
import { fetchVereinData, mapTeamEvents } from './verein.js'
import { loadSyncMeta, saveSyncMeta, newSyncCode, esCreate, esPull, esPush, stripLocal, mergeDb } from './sync.js'
import { WD, WD_LONG, MONTHS, COLORS, iso, fromIso, wdIdx, fmtDate, fmtShort, addDays, mins, uid, gebInfo, parseIcs, mapsLink, kw, holidayOn, LAENDER, evDur } from './util.js'
import { Icon, RowIcon, LogoMark } from './icons.jsx'
import { MODULES, hasMod, saveTextFile } from './domain.js'
import { useToast, QuickAdd } from './ui.jsx'
import { Onboarding, demoData, ProfilePicker } from './onboarding.jsx'
import { Merkzeug } from './palace.jsx'
import { EventSheet, MemberSheet, CareSheet, KlientSheet, PTerminSheet, VorlageSheet, VereinSheet, BlitzSheet, BlitzListe, GebForm, WaTemplateRow, SerieWizard, IstWizard, SportPlanForm, ImportRow, WA_DEFAULT } from './sheets.jsx'
import { Suche } from './Suche.jsx'
import { buildIndex, longDate, relDay } from './search.js'
import { Abreiss, Planer, DayBand, NextCard, buildLage, greeting } from './planer.jsx'
import { exportFiles, importFiles, clearFiles } from './docstore.js'

const THEME_KEY = 'eselsohr-theme'
const PLANER_KEY = 'eselsohr-heute-ansicht'
const readPref = (k, d) => { try { return localStorage.getItem(k) || d } catch { return d } }
const writePref = (k, v) => { try { localStorage.setItem(k, v) } catch { /* Speicher gesperrt */ } }
const nowMinutes = () => { const d = new Date(); return d.getHours() * 60 + d.getMinutes() }

// Vorschläge bekommen gezeichnete Symbole statt Emoji
const SUG_ICON = { geb: 'gift', care: 'school', ist: 'heart', serie: 'repeat', sport: 'activity', sext: 'repeat', konflikt: 'alert', backup: 'archive', blitz: 'bolt' }
const sugIcon = (id) => SUG_ICON[Object.keys(SUG_ICON).find((k) => id.startsWith(k))] || 'bulb'

/* Im Suchfeld wechseln Beispiel-Fragen aus den eigenen Daten */
function RotatingExample({ items }) {
  const [i, setI] = useState(0)
  useEffect(() => {
    if (items.length < 2) return undefined
    let still = false
    try { still = window.matchMedia('(prefers-reduced-motion: reduce)').matches } catch { /* egal */ }
    if (still) return undefined
    const t = setInterval(() => setI((x) => (x + 1) % items.length), 4200)
    return () => clearInterval(t)
  }, [items.length])
  return <><span className="sp-lead">Frag einfach: </span><span className="sp-ex" key={i}>„{items[i % items.length]}“</span></>
}

/* Handy-Ansicht: ab dieser Breite zeigt „Heute“ alles auf einen Blick statt Planer-Seite */
const PHONE_Q = '(max-width: 700px)'
const isPhoneNow = () => { try { return window.matchMedia(PHONE_Q).matches } catch { return false } }

/* Klappbereich: zugeklappt steht schon das Wichtigste in der Zusammenfassung, aufgeklappt der ganze Inhalt.
   Der Inhalt entsteht erst beim Aufklappen – die Seite bleibt kurz und schnell. */
function Klapp({ id, icon, title, summary, badge, open, onToggle, extra, children }) {
  return (
    <details className="klapp" id={id} open={open}
      onToggle={(e) => { if (e.currentTarget.open !== open) onToggle(e.currentTarget.open) }}>
      <summary>
        <span className="k-head">
          <span className="rowico"><Icon name={icon} size={17} /></span>
          <span className="k-main">
            <span className="k-title">{title}{badge ? <span className="k-badge">{badge}</span> : null}</span>
            {summary ? <span className="k-sum">{summary}</span> : null}
          </span>
          <span className="k-chev"><Icon name="chevD" size={18} /></span>
        </span>
        {extra}
      </summary>
      {open && <div className="k-body">{children}</div>}
    </details>
  )
}

/* ================= Haupt-App ================= */

export default function App() {
  const [toast, toastEl] = useToast()
  const [db, setDb] = useState(() => loadState())
  const [nav, setNav] = useState('heute')
  const [suche, setSuche] = useState(null) // null | { q }
  const [dayView, setDayView] = useState(() => iso(new Date()))
  const [nowMin, setNowMin] = useState(nowMinutes)
  const [mehr, setMehr] = useState(false)
  const [theme, setThemeState] = useState(() => readPref(THEME_KEY, 'auto'))
  const [heuteAnsicht, setHeuteAnsicht] = useState(() => readPref(PLANER_KEY, typeof window !== 'undefined' && window.innerWidth < 640 ? 'liste' : 'planer'))
  const [palaceProv, setPalaceProv] = useState(null)
  const [palaceQuery, setPalaceQuery] = useState('')
  const [palaceSec, setPalaceSec] = useState(null) // z. B. direkt in die Dokumente springen
  const idxCache = useRef({})
  const [phone, setPhone] = useState(isPhoneNow)
  const [klapp, setKlapp] = useState([]) // aufgeklappte Bereiche auf dem Handy
  const swipeRef = useRef(null)
  const [sheet, setSheet] = useState(null)
  const [calCursor, setCalCursor] = useState(() => { const d = new Date(); return { y: d.getFullYear(), m: d.getMonth() } })
  const [selDate, setSelDate] = useState(iso(new Date()))
  const [filterWho, setFilterWho] = useState([]) // Mehrfachauswahl: leer = alle
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

  // Neuer Bereich oder neues Profil beginnt oben
  useEffect(() => { window.scrollTo(0, 0) }, [nav, db?.active])

  // Die Jetzt-Linie im Planer läuft mit
  useEffect(() => {
    const t = setInterval(() => setNowMin(nowMinutes()), 30000)
    return () => clearInterval(t)
  }, [])

  // Handy oder großer Bildschirm? Folgt auch dem Drehen des Geräts
  useEffect(() => {
    let mq
    try { mq = window.matchMedia(PHONE_Q) } catch { return undefined }
    const on = () => setPhone(mq.matches)
    if (mq.addEventListener) mq.addEventListener('change', on); else mq.addListener(on)
    return () => { if (mq.removeEventListener) mq.removeEventListener('change', on); else mq.removeListener(on) }
  }, [])

  // Erscheinungsbild: automatisch (Gerät) oder fest hell/dunkel
  useEffect(() => {
    const root = document.documentElement
    if (theme === 'light' || theme === 'dark') root.setAttribute('data-theme', theme)
    else root.removeAttribute('data-theme')
  }, [theme])
  function setTheme(t) {
    setThemeState(t)
    writePref(THEME_KEY, t)
    toast(t === 'dark' ? 'Dunkles Erscheinungsbild an' : t === 'light' ? 'Helles Erscheinungsbild an' : 'Erscheinungsbild folgt jetzt deinem Gerät')
  }

  // Suche von überall: ⌘K / Strg+K oder „/“
  useEffect(() => {
    const onKey = (e) => {
      if (!dbRef.current?.active) return
      const tag = (e.target?.tagName || '').toLowerCase()
      const typing = tag === 'input' || tag === 'textarea' || tag === 'select' || e.target?.isContentEditable
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') { e.preventDefault(); setSuche((s) => (s ? null : { q: '' })) }
      else if (e.key === '/' && !typing && !e.metaKey && !e.ctrlKey) { e.preventDefault(); setSuche({ q: '' }) }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
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
  const visible = filterWho.length ? db.events.filter((e) => filterWho.includes(e.member_id)) : db.events
  const toggleWho = (id) => setFilterWho((f) => (f.includes(id) ? f.filter((x) => x !== id) : [...f, id]))
  const eventsOn = (dateStr) => visible.filter((e) => e.on_date === dateStr).sort((a, b) => a.at_time.localeCompare(b.at_time))
  const invites = db.events.filter((e) => e.status === 'pending' && e.member_id === me.id)

  const isFree = (memberId, dateStr, time) =>
    !db.events.some((e) => e.member_id === memberId && e.on_date === dateStr && e.status === 'fix' && Math.abs(mins(e.at_time) - mins(time)) < 60)

  /* ---------- Aktionen ---------- */

  // Neuer Termin nach der Outlook-Regel: eigene und Kinder-Termine gelten sofort,
  // für andere Erwachsene direkt nur mit Recht und freiem Platz – sonst als Anfrage
  function createEvent(data) {
    const target = byId[data.member_id] || me
    let status = 'fix'
    let msg
    if (target.id === me.id || target.kind === 'kid') {
      msg = data.serie ? `${data.title} eingetragen – jede Woche, 8 Wochen` : `${data.title} eingetragen · ${fmtShort(data.on_date)} ${data.at_time}`
    } else if (me.can_direct && isFree(target.id, data.on_date, data.at_time)) {
      msg = `Direkt eingetragen für ${target.name}`
    } else if (me.can_direct) {
      status = 'pending'
      msg = `${target.name} ist da schon belegt – als Anfrage gesendet`
    } else {
      status = 'pending'
      msg = `Anfrage an ${target.name} gesendet – muss erst zusagen`
    }
    const rows = (data.serie ? Array.from({ length: 8 }, (_, k) => addDays(data.on_date, k * 7)) : [data.on_date])
      .map((dateStr) => ({ id: uid(), meta: '', zust: null, ...data, member_id: target.id, on_date: dateStr, status, created_by: me.id }))
    saveAll({ ...db, events: [...db.events, ...rows] })
    toast(msg)
    return rows
  }

  function saveEvent(data) {
    if (sheet.event) {
      saveAll({ ...db, events: db.events.map((e) => (e.id === sheet.event.id ? { ...e, ...data, serie: e.serie } : e)) })
      toast('Gespeichert – die ganze Familie sieht den neuen Stand')
    } else {
      createEvent(data)
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

  async function endDemo() {
    try { localStorage.removeItem('eselsohr-v1') } catch { /* egal */ }
    await clearFiles().catch(() => {}) // in der Demo abgelegte Dokumente gehen mit
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
    // Abgelegte Dokumente kommen mit – weiterhin verschlüsselt, nur als Text verpackt
    const docFiles = await exportFiles()
    const nDocs = Object.keys(docFiles).length
    const json = JSON.stringify(nDocs ? { ...next, docFiles } : next, null, nDocs ? 0 : 2)
    const small = json.length < 900000 // große Backups nicht in die Zwischenablage drücken
    if (small) {
      try { await navigator.clipboard?.writeText(json) } catch { /* Zwischenablage gesperrt */ }
    }
    const extra = (nDocs ? ` · mit ${nDocs} Dokument${nDocs === 1 ? '' : 'en'}` : '') + (small ? ' (auch in der Zwischenablage)' : '')
    if (window.claude?.downloads) {
      try {
        await window.claude.downloads.save({ filename: 'eselsohr-backup.json', data: json })
        toast('Backup gespeichert ✓' + extra)
      } catch (e) {
        toast(e?.code === 'declined' ? 'Speichern abgebrochen' + (small ? ' – Backup liegt in der Zwischenablage' : '') : small ? 'Backup in Zwischenablage kopiert ✓' : 'Speichern hier nicht möglich')
      }
      return
    }
    try {
      const a = document.createElement('a')
      a.href = URL.createObjectURL(new Blob([json], { type: 'application/json' }))
      a.download = 'eselsohr-backup.json'
      a.click()
    } catch { /* Download gesperrt */ }
    toast('Backup als Datei gespeichert ✓' + extra)
  }

  async function importBackup(json) {
    try {
      const obj = JSON.parse(json)
      if (!obj.family || !obj.members) throw new Error('Kein Eselsohr-Backup')
      const { docFiles, ...rest } = obj
      const n = docFiles ? await importFiles(docFiles) : 0
      saveAll(rest)
      toast('Backup eingespielt ✓' + (n ? ` · ${n} Dokument${n === 1 ? '' : 'e'} zurück` : ''))
    } catch (e) {
      toast('Import fehlgeschlagen: ' + e.message)
    }
  }

  /* ---------- Bausteine ---------- */

  // Privatsphäre: fremde Praxis- und Arbeitstermine erscheinen nur als belegter Block
  const viewEvent = (e) => {
    if (e.klid && e.created_by !== me.id) {
      return { ...e, title: 'Praxis · belegt', meta: mname(e.member_id) + ' · Details privat', masked: true, serie: false }
    }
    if (e.src === 'work' && e.member_id !== me.id) {
      const bis = (e.meta || '').split(' · ').find((p) => p.startsWith('bis '))
      return { ...e, title: 'Arbeit', meta: [mname(e.member_id), bis].filter(Boolean).join(' · '), masked: true }
    }
    return e
  }

  /* ---------- Eselsohr knicken: Termine persönlich merken ---------- */

  const pins = me.pins || []
  function togglePin(id) {
    const has = pins.includes(id)
    saveAll({ ...db, members: db.members.map((m) => (m.id === me.id ? { ...m, pins: has ? pins.filter((x) => x !== id) : [...pins, id] } : m)) })
    toast(has ? 'Eselsohr geglättet' : 'Eselsohr geknickt – der Termin steht jetzt unter „Gemerkt“')
  }

  const EventRow = ({ e: raw, withDate, cls, badge, hint }) => {
    const e = viewEvent(raw)
    const pinned = pins.includes(raw.id)
    const kidOpen = !e.masked && !e.zust && e.status === 'fix' && byId[e.member_id]?.kind === 'kid'
    return (
      <div className={'row-wrap' + (cls ? ' ' + cls : '')}>
        <button className="row" onClick={() => setSheet({ event: raw })}>
          <span className="time">{withDate ? fmtShort(e.on_date) + ' ' : ''}{e.at_time}</span>
          <span className="dot" style={{ background: mcolor(e.member_id) }} />
          <div className="row-main">
            <div className="row-title">{e.title}{e.serie ? ' ↻' : ''}{e.src === 'verein' ? ' ⚽' : ''}</div>
            <div className="row-meta">
              {e.masked ? e.meta : mname(e.member_id) + (e.meta ? ' · ' + e.meta : '') + (e.zust ? ' · ✋ ' + mname(e.zust) : '')}
              {hint && kidOpen && <span className="g-open"> · ✋ noch offen</span>}
            </div>
          </div>
          {e.status === 'pending' && <span className="chip honey">Anfrage</span>}
          {badge ? <span className="g-in">{badge}</span> : <span className="chev">›</span>}
        </button>
        <button type="button" className={'dogear' + (pinned ? ' on' : '')} onClick={() => togglePin(raw.id)}
          aria-pressed={pinned} aria-label={pinned ? 'Eselsohr glätten' : 'Eselsohr knicken – Termin merken'}
          title={pinned ? 'Gemerkt – zum Glätten klicken' : 'Ecke knicken: Termin merken'} />
      </div>
    )
  }

  const dayList = (dateStr) => {
    const care = kids
      .filter((k) => !filterWho.length || filterWho.includes(k.id))
      .flatMap((k) => careOn(k, dateStr).map((b) => ({ k, b })))
    const list = eventsOn(dateStr)
    return (
      <>
        {care.map(({ k, b }) => (
          <button className="row" key={'care' + k.id + b.id} onClick={() => !isKid && setCareSheet(k.id)}>
            <span className="time">{b.from}</span>
            <span className="dot" style={{ background: k.color }} />
            <div className="row-main">
              <div className="row-title">{k.name} · {b.label}</div>
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
      actLabel: 'Glückwunsch', act: () => openWa(nextGeb.g),
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
      actLabel: 'Sichern', act: exportBackup,
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

  /* ---------- Suche: Index, Kontext und was Treffer auslösen ---------- */

  const land = db.family.land || 'NW'
  const nowTime = String(Math.floor(nowMin / 60)).padStart(2, '0') + ':' + String(nowMin % 60).padStart(2, '0')
  const navDocs = [
    { id: 'heute', title: 'Heute', sub: 'Abreißkalender, Tageslage und Familienplaner', kw: 'start uebersicht tag planer', to: 'heute' },
    { id: 'kalender', title: 'Kalender', sub: 'Monatsblatt mit Kalenderwochen und Feiertagen', kw: 'monat woche kw kalenderwoche feiertage', to: 'kalender' },
    { id: 'listen', title: 'Listen', sub: 'Einkaufen, Zu erledigen, Geburtstage', kw: 'einkauf einkaufen todo geburtstage liste', to: 'listen' },
    !isKid && { id: 'palast', title: 'Gedächtnispalast', sub: 'Dein verschlüsseltes Gedächtnis', kw: 'palast gedaechtnis notizen personen kontakte', to: 'merkzeug' },
    !isKid && { id: 'ablage', title: 'Dokumente & Steuerordner', sub: 'Papierlos ablegen, steuerrelevant markieren, als ZIP teilen', kw: 'dokumente dokument ablage papierlos scan pdf rechnung beleg belege steuer steuerordner steuererklaerung finanzamt quittung', to: 'merkzeug', doc: true },
    !isKid && hasMod(me, 'praxis') && { id: 'praxis', title: 'Praxis', sub: 'Klientinnen, Soll/Ist-Zeiten, Dokumente', kw: 'praxis klientin hebamme nachsorge abrechnung', to: 'praxis' },
    !isKid && { id: 'familie', title: 'Familie', sub: 'Mitglieder, Sync, Backup, Papierkorb, Feiertage', kw: 'familie mitglieder sync backup papierkorb rechte bundesland', to: 'familie' },
    { id: 'profil', title: 'Mein Profil', sub: 'Farbe, Module, Erscheinungsbild', kw: 'profil farbe module einstellungen sport', to: 'profil' },
    { id: 'new', title: 'Neuer Termin', sub: 'Formular öffnen', kw: 'termin anlegen eintragen neu', cmd: 'new' },
    !isKid && { id: 'blitz', title: 'Blitzzettel schreiben', sub: 'Gedanken festhalten, bevor sie weg sind', kw: 'blitz notiz gedanke merken idee', cmd: 'blitz' },
    !isKid && { id: 'backup', title: 'Backup exportieren', sub: 'Alle Daten sichern', kw: 'backup sicherung export datensicherung', cmd: 'backup' },
    { id: 'theme-dark', title: 'Dunkles Erscheinungsbild', sub: 'Angenehm am Abend', kw: 'dunkel nacht nachtmodus dark', cmd: 'theme-dark' },
    { id: 'theme-light', title: 'Helles Erscheinungsbild', sub: 'Klar bei Tageslicht', kw: 'hell tag light', cmd: 'theme-light' },
    { id: 'theme-auto', title: 'Erscheinungsbild automatisch', sub: 'Folgt deinem Gerät', kw: 'automatisch system auto', cmd: 'theme-auto' },
    { id: 'switch', title: 'Profil wechseln', sub: 'Andere Person auf diesem Gerät', kw: 'wechseln abmelden benutzer profil', cmd: 'switch' },
    pins.length > 0 && { id: 'geknickt', title: 'Gemerkte Termine', sub: `${pins.length} mit Eselsohr markiert`, kw: 'eselsohr knick gemerkt merken', cmd: 'geknickt' },
  ].filter(Boolean)
  const searchCtx = { today, nowMin, nowTime, me, meId: me.id, byId, members: db.members, kids, events: db.events, viewEvent, isFree, praxis: !isKid && hasMod(me, 'praxis'), klienten: praxis.klienten }
  if (idxCache.current.db !== db || idxCache.current.me !== me.id || idxCache.current.today !== today) {
    idxCache.current = { db, me: me.id, today, index: buildIndex(db, { ...searchCtx, navs: navDocs }) }
  }
  const searchIndex = idxCache.current.index

  function openDay(d) {
    const x = fromIso(d)
    setSelDate(d)
    setCalCursor({ y: x.getFullYear(), m: x.getMonth() })
    setCalQ('')
    setNav('kalender')
  }
  const scrollToId = (id) => setTimeout(() => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 140)
  function addBlitz(text) {
    const d = new Date()
    saveAll({ ...db, inbox: [...(db.inbox || []), { id: uid(), member_id: me.id, text, ts: Date.now(), date: `${d.getDate()}.${d.getMonth() + 1}.${d.getFullYear()}` }] })
    toast('Festgehalten – der Blitzzettel ist sicher.')
  }

  // Alles, was Suche, Tageslage und Antworten auslösen können
  function runAct(a) {
    if (!a) return false
    const ev = a.id ? db.events.find((x) => x.id === a.id) : null
    switch (a.type) {
      case 'openEvent': if (ev) setSheet({ event: ev }); break
      case 'claim': if (ev) claimEvent(ev); break
      case 'openWa': { const g = gebs.find((x) => x.id === a.id); if (g) openWa(g); break }
      case 'care': if (!isKid) setCareSheet(a.id); break
      case 'member': setFilterWho([a.id]); openDay(today); break
      case 'klient': setPraxisSel(a.id); setNav('praxis'); break
      case 'item': setNav('listen'); break
      case 'zettel': setBlitzList(true); break
      case 'create':
        createEvent({ title: a.data.title, member_id: a.data.member_id, on_date: a.data.on_date, at_time: a.data.at_time, serie: !!a.data.serie })
        if (nav === 'heute') setDayView(a.data.on_date)
        break
      case 'form': setSheet({ date: a.data.on_date || today, prefill: a.data }); break
      case 'list': addItem(a.list, a.text); toast(`„${a.text}“ steht auf der ${a.list === 'einkauf' ? 'Einkaufsliste' : 'To-do-Liste'}`); break
      case 'blitz': addBlitz(a.text); break
      case 'day': openDay(a.date); break
      case 'invites': setNav('heute'); scrollToId('anfragen-karte'); break
      case 'palace': setPalaceQuery(a.q); setNav('merkzeug'); break
      case 'palaceHit': if (palaceProv) palaceProv.open(a.ref); break
      case 'nav': {
        const n = a.nav || {}
        if (n.to) { setNav(n.to); if (n.doc) setPalaceSec('_dokumente') }
        else if (n.cmd === 'new') setSheet({ date: today })
        else if (n.cmd === 'blitz') setBlitz(true)
        else if (n.cmd === 'backup') exportBackup()
        else if (n.cmd === 'theme-dark') setTheme('dark')
        else if (n.cmd === 'theme-light') setTheme('light')
        else if (n.cmd === 'theme-auto') setTheme('auto')
        else if (n.cmd === 'switch') saveAll({ ...db, active: null })
        else if (n.cmd === 'geknickt') {
          setNav('heute'); setDayView(today)
          setKlapp((k) => (k.includes('gemerkt') ? k : [...k, 'gemerkt'])) // Handy: Bereich aufklappen
          scrollToId('geknickt')
        }
        break
      }
      default: break
    }
    return false
  }

  /* ---------- Bildschirme ---------- */

  const heuteEvs = db.events.filter((e) => e.on_date === dayView).sort((a, b) => a.at_time.localeCompare(b.at_time))
  const nextEv = db.events
    .filter((e) => e.status === 'fix' && (e.on_date > today || (e.on_date === today && mins(e.at_time) + 10 >= nowMin)))
    .sort((a, b) => a.on_date.localeCompare(b.on_date) || a.at_time.localeCompare(b.at_time))[0]
  const lage = buildLage({
    day: dayView, today, nowMin, me, kids, careOn, evs: heuteEvs, viewEvent, byId, invites: invites.length, gebSorted,
    sportToday: hasMod(me, 'sport') ? db.events.find((e) => e.sport && e.member_id === me.id && e.on_date === dayView && e.status === 'fix') : null,
  })
  const pinnedEvs = db.events.filter((e) => pins.includes(e.id) && e.on_date >= today).sort((a, b) => a.on_date.localeCompare(b.on_date) || a.at_time.localeCompare(b.at_time))
  const sportDone = mySportWeek.filter((e) => e.done).length
  const setAnsicht = (v) => { setHeuteAnsicht(v); writePref(PLANER_KEY, v) }
  const maxCare = Math.max(1, ...adults.map((a) => careCount(a.id)))

  const sugRows = (list) => list.map((s) => (
    <div className="row" key={s.id}>
      <span className={'rowico' + (s.id.startsWith('konflikt') ? ' red' : s.id.startsWith('geb') ? ' warn' : '')}><Icon name={sugIcon(s.id)} size={17} /></span>
      <div className="row-main">
        <div className="row-title">{s.title}</div>
        <div className="row-meta">{s.meta}</div>
      </div>
      <button className="btn sm" onClick={s.act}>{s.actLabel}</button>
    </div>
  ))
  const balanceEl = (
    <>
      <div className="balance">
        {adults.map((m) => (
          <div className="bal" key={m.id} style={{ '--c': m.color }}>
            <div className="bal-n">{careCount(m.id)}×</div>
            <div className="bal-bar"><i style={{ width: (careCount(m.id) / maxCare) * 100 + '%' }} /></div>
            <div className="bal-name">{m.name}</div>
          </div>
        ))}
      </div>
      <div className="sug-note">Bringen, holen, betreuen – jedes „Ich übernehme“ zählt sofort mit.</div>
    </>
  )

  const screenHeute = (
    <section className="screen heute">
      <div className="h-top">
        <Abreiss date={dayView} today={today} land={land} onChange={setDayView} />
        <div className="h-hero">
          <p className="eyebrow">{db.family.name}{db.demo ? ' · Demo mit Beispieldaten' : ''}</p>
          <h2 className="hero">{greeting(nowMin)}, {me.name}.</h2>
        </div>
        <p className="lage">
          {lage.map((sentence, si) => (
            <React.Fragment key={si}>
              {si > 0 && ' '}
              {sentence.map((seg, i) => (seg.mark
                ? <button type="button" key={i} className={'mark lage-mark' + (seg.warn ? ' warn' : '')} onClick={() => runAct(seg.act)}>{seg.text}</button>
                : seg.who
                  ? <span key={i} className="who" style={{ color: `color-mix(in oklab, ${seg.who} 72%, var(--ink))` }}>{seg.text}</span>
                  : <React.Fragment key={i}>{seg.text}</React.Fragment>))}
            </React.Fragment>
          ))}
        </p>
        <div className="h-act">
          <button className="btn" onClick={() => setSheet({ date: dayView })}><Icon name="plus" size={17} />Termin</button>
          <button className="btn ghost wide-only" onClick={() => setSuche({ q: '' })}><Icon name="search" size={17} />Fragen</button>
          {!isKid && <button className="btn ghost" onClick={() => setBlitz(true)}><Icon name="bolt" size={17} />Blitzzettel</button>}
        </div>
        <NextCard ev={nextEv} viewEvent={viewEvent} byId={byId} nowMin={nowMin} today={today}
          onOpen={(e) => setSheet({ event: e })} onAdd={() => setSheet({ date: today })} />
      </div>

      <div className="kpis">
        <button className="kpi accent" onClick={() => openDay(today)} aria-label="Zum heutigen Tag im Kalender">
          <span className="num">{db.events.filter((e) => e.on_date === today && e.status === 'fix').length}</span>
          <span className="cap">Termine heute</span>
        </button>
        <button className={'kpi' + (invites.length ? ' alert' : '')} onClick={() => {
          if (invites.length) scrollToId('anfragen-karte')
          else toast('Keine offenen Anfragen – alles beantwortet')
        }} aria-label="Zu deinen Anfragen">
          <span className="num">{invites.length}</span>
          <span className="cap">Anfragen an dich</span>
        </button>
        <button className="kpi" onClick={() => setNav('listen')} aria-label="Zu den Familienlisten">
          <span className="num">{db.items.filter((i) => !i.done).length}</span>
          <span className="cap">Offene Listenpunkte</span>
        </button>
        {hasMod(me, 'sport') && (
          <button className={'kpi' + (sportDone >= sportGoal ? ' accent' : '')} onClick={() => { setNav('profil'); scrollToId('sport-bereich') }} aria-label="Zu deinem Sport-Bereich">
            <span className="num">{sportDone}/{sportGoal}</span>
            <span className="cap">Sport diese Woche</span>
          </button>
        )}
      </div>

      <div className="h-grid">
        <div className="h-main">
          <h3 className="label">
            Familienplaner <span className="sub">{dayView === today ? 'heute' : longDate(dayView)}</span>
            <span className="lact themeseg" role="group" aria-label="Darstellung">
              <button type="button" className={heuteAnsicht === 'planer' ? 'on' : ''} onClick={() => setAnsicht('planer')}>Planer</button>
              <button type="button" className={heuteAnsicht === 'liste' ? 'on' : ''} onClick={() => setAnsicht('liste')}>Liste</button>
            </span>
          </h3>
          {heuteAnsicht === 'planer'
            ? <Planer date={dayView} columns={db.members} events={db.events} viewEvent={viewEvent} careOn={careOn} nowMin={nowMin} today={today} byId={byId} pins={pins}
                onOpen={(e) => setSheet({ event: e })} onCare={(id) => { if (!isKid) setCareSheet(id) }}
                onAdd={(mid, t) => setSheet({ date: dayView, prefill: { member_id: mid, at_time: t } })} />
            : <div className="card">{dayList(dayView)}</div>}
          {pinnedEvs.length > 0 && (
            <>
              <h3 className="label" id="geknickt"><span className="lico"><Icon name="knick" size={18} /></span>Gemerkt <span className="sub">mit Eselsohr markiert</span></h3>
              <div className="card">{pinnedEvs.map((e) => <EventRow key={e.id} e={e} withDate />)}</div>
            </>
          )}
          <h3 className="label">{dayView === today ? 'Morgen schon im Blick' : 'Am Tag danach'} <span className="sub">{fmtDate(addDays(dayView, 1))}</span></h3>
          <div className="card">{dayList(addDays(dayView, 1))}</div>
        </div>

        <aside className="h-side">
          {invites.length > 0 && (
            <>
              <h3 className="label" id="anfragen-karte"><span className="lico"><Icon name="inbox" size={18} /></span>Anfragen an dich</h3>
              <div className="card">
                {invites.map((e) => (
                  <div className="row" key={e.id}>
                    <span className="time">{fmtShort(e.on_date)} {e.at_time}</span>
                    <div className="row-main">
                      <div className="row-title">{e.title}</div>
                      <div className="row-meta">von {mname(e.created_by)}{e.meta ? ' · ' + e.meta : ''}</div>
                    </div>
                    <div className="invite-actions">
                      <button className="btn" onClick={() => answerInvite(e, true)} aria-label="Zusagen"><Icon name="check" size={17} /></button>
                      <button className="btn danger" onClick={() => answerInvite(e, false)} aria-label="Ablehnen"><Icon name="x" size={16} /></button>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}

          {suggestions.length > 0 && (
            <>
              <h3 className="label"><span className="lico"><Icon name="bulb" size={18} /></span>Vorschläge <span className="sub">du entscheidest</span></h3>
              <div className="card sug">
                {sugRows(suggestions)}
                <div className="sug-note">Aus euren eigenen Daten – nichts verlässt das Gerät. Nie mehr als drei auf einmal.</div>
              </div>
            </>
          )}

          {!isKid && kids.length > 0 && (
            <>
              <h3 className="label"><span className="lico"><Icon name="school" size={18} /></span>Wann sind die Kinder in der Betreuung?</h3>
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
                            : 'Antippen und Kita- oder Schulzeiten anlegen'}
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
              <h3 className="label"><span className="lico"><Icon name="hand" size={18} /></span>Wer übernimmt diese Woche</h3>
              <div className="card">
                {balanceEl}
                {unclaimed.map((e) => (
                  <div className="row" key={e.id}>
                    <span className="time" style={{ minWidth: 82 }}>{fmtShort(e.on_date)} {e.at_time}</span>
                    <div className="row-main">
                      <div className="row-title">{e.title}</div>
                      <div className="row-meta">{mname(e.member_id)} · noch niemand eingeteilt</div>
                    </div>
                    <button className="btn sm" onClick={() => claimEvent(e)}><Icon name="hand" size={15} />Ich übernehme</button>
                  </div>
                ))}
              </div>
            </>
          )}
        </aside>
      </div>
    </section>
  )

  /* ---------- Handy: Heute auf einen Blick ----------
     Der erste Bildschirm beantwortet die Fragen des Morgens: Welcher Tag? Wo sind die Kinder?
     Was wartet auf mich? Was steht an – und was ist als Nächstes dran? Alles andere ist
     zugeklappt, verrät aber schon in der Zusammenfassung, was drinsteht. */

  const isTodayView = dayView === today
  const evEnd = (e) => mins(e.at_time) + Math.max(evDur(e), 30)
  const dayN = (d) => Math.round((fromIso(d) - fromIso(today)) / 86400000)
  const pastEvs = isTodayView ? heuteEvs.filter((e) => evEnd(e) <= nowMin) : []
  const restEvs = isTodayView ? heuteEvs.filter((e) => evEnd(e) > nowMin) : heuteEvs
  const nextI = isTodayView ? restEvs.findIndex((e) => e.status === 'fix') : -1
  const inTxt = (e) => {
    const d = mins(e.at_time) - nowMin
    if (d <= 0) return 'läuft'
    if (d < 60) return `in ${d} Min.`
    return `in ${Math.floor(d / 60)}:${String(d % 60).padStart(2, '0')} Std.`
  }
  const isOpen = (k) => klapp.includes(k)
  const setOpen = (k) => (v) => setKlapp((a) => (v ? (a.includes(k) ? a : [...a, k]) : a.filter((x) => x !== k)))

  // Wo ist das Kind gerade – und was kommt als Nächstes? (kurz genug für eine Zeile)
  const kidNow = (k) => {
    const blocks = careOn(k, dayView)
    const evs = heuteEvs.filter((e) => e.member_id === k.id && e.status === 'fix')
    const has = (k.care || []).length > 0
    let line = null
    let nx
    if (isTodayView) {
      const run = evs.find((e) => mins(e.at_time) <= nowMin && nowMin < evEnd(e))
      const cur = blocks.find((b) => mins(b.from) <= nowMin && nowMin < mins(b.to))
      const later = blocks.find((b) => mins(b.from) > nowMin)
      if (run) line = 'jetzt: ' + viewEvent(run).title
      else if (cur) line = `${cur.label} bis ${cur.to}`
      else if (later) line = `ab ${later.from} ${later.label}`
      else if (blocks.length) line = `seit ${blocks[blocks.length - 1].to} zu Hause`
      else if (has) line = 'heute frei'
      nx = evs.find((e) => mins(e.at_time) > nowMin)
    } else {
      if (blocks.length) line = blocks.map((b) => `${b.label} ${b.from}–${b.to}`).join(', ')
      else if (has) line = 'frei'
      nx = evs[0]
    }
    const sub = nx
      ? `${nx.at_time} ${viewEvent(nx).title}`
      : !isTodayView ? 'keine Termine' : evs.length ? 'danach frei' : 'keine Termine heute'
    const who = nx ? '✋ ' + (nx.zust ? mname(nx.zust) : 'offen') : null
    return { line, sub, who, warn: !!nx && !nx.zust, setup: !has && !line && !isKid }
  }

  // Was auf eine Entscheidung wartet: Anfragen, Kindertermine ohne Begleitung, Geburtstage
  const waiting = []
  if (!isKid) {
    invites.forEach((e) => waiting.push({ k: 'inv' + e.id, s: [dayN(e.on_date), 1, e.at_time], type: 'inv', e }))
    db.events
      .filter((e) => e.status === 'fix' && !e.zust && byId[e.member_id]?.kind === 'kid' && e.on_date >= today && e.on_date <= addDays(today, 2) && !(e.on_date === today && evEnd(e) <= nowMin))
      .forEach((e) => waiting.push({ k: 'own' + e.id, s: [dayN(e.on_date), 0, e.at_time], type: 'claim', e }))
  }
  gebSorted.filter((x) => x.info && x.info.days <= 2)
    .forEach(({ g, info }) => waiting.push({ k: 'geb' + g.id, s: [info.days, 2, ''], type: 'geb', g, info }))
  waiting.sort((a, b) => a.s[0] - b.s[0] || a.s[1] - b.s[1] || a.s[2].localeCompare(b.s[2]))

  const relShort = (d) => relDay(today, d).replace(/^am /, '')
  const waitRow = (w) => {
    if (w.type === 'inv') {
      const e = w.e
      return (
        <div className="row" key={w.k}>
          <span className="rowico"><Icon name="inbox" size={16} /></span>
          <div className="row-main">
            <div className="row-title">{e.title}</div>
            <div className="row-meta">von {mname(e.created_by)} · {relShort(e.on_date)} {e.at_time}</div>
          </div>
          <div className="invite-actions">
            <button className="btn" onClick={() => answerInvite(e, true)} aria-label={`${e.title} zusagen`}><Icon name="check" size={17} /></button>
            <button className="btn danger" onClick={() => answerInvite(e, false)} aria-label={`${e.title} ablehnen`}><Icon name="x" size={16} /></button>
          </div>
        </div>
      )
    }
    if (w.type === 'claim') {
      const e = w.e
      return (
        <div className="row" key={w.k}>
          <span className="rowico warn"><Icon name="hand" size={16} /></span>
          <div className="row-main">
            <div className="row-title">{viewEvent(e).title}</div>
            <div className="row-meta">{mname(e.member_id)} · {relShort(e.on_date)} {e.at_time}</div>
          </div>
          <button className="btn sm" onClick={() => claimEvent(e)} aria-label={`${viewEvent(e).title} übernehmen`}>Übernehmen</button>
        </div>
      )
    }
    const { g, info } = w
    const rel = info.days === 0 ? 'heute' : info.days === 1 ? 'morgen' : 'übermorgen'
    return (
      <div className="row" key={w.k}>
        <span className="rowico warn"><Icon name="gift" size={16} /></span>
        <div className="row-main">
          <div className="row-title">{info.age != null ? `${g.name} wird ${info.age}` : `${g.name} hat Geburtstag`}</div>
          <div className="row-meta">{rel}, {g.date.split('.').slice(0, 2).map((x) => +x).join('.')}.</div>
        </div>
        <button className="btn sm ghost" onClick={() => openWa(g)} aria-label={`${g.name} per WhatsApp gratulieren`}><Icon name="message" size={15} />WhatsApp</button>
      </div>
    )
  }

  const fei = holidayOn(dayView, land)
  const dayCount = heuteEvs.filter((e) => e.status === 'fix').length
  const restFix = restEvs.filter((e) => e.status === 'fix').length
  // Ein Satz zum Tag – im Lauf des Tages zählt er mit, was schon geschafft ist
  const lageText = isTodayView && dayCount > 0 && restFix === 0
    ? 'Für heute ist alles geschafft.'
    : isTodayView && restFix < dayCount
      ? `Noch ${restFix} ${restFix === 1 ? 'Termin' : 'Termine'} heute, ${dayCount - restFix} geschafft.`
      : (lage[0] || []).map((s) => s.text).join('')
  const tmrDate = addDays(dayView, 1)
  const tmrEvs = db.events.filter((e) => e.on_date === tmrDate && e.status === 'fix').sort((a, b) => a.at_time.localeCompare(b.at_time))
  const tmrCare = kids.flatMap((k) => careOn(k, tmrDate).slice(0, 1).map((b) => ({ k, b }))).sort((a, b) => a.b.from.localeCompare(b.b.from))[0]
  const tmrSum = [
    tmrEvs.length ? `${tmrEvs.length} Termin${tmrEvs.length > 1 ? 'e' : ''}, ab ${tmrEvs[0].at_time}` : 'keine Termine',
    tmrCare ? `${tmrCare.k.name}: ${tmrCare.b.label} ab ${tmrCare.b.from}` : null,
  ].filter(Boolean).join(' · ')
  const sugPhone = suggestions.filter((s) => !s.id.startsWith('geb')) // Geburtstage stehen schon unter „Wartet auf dich“
  const planOpen = heuteAnsicht === 'planer'

  const screenGlance = (
    <section className="screen glance">
      <div className="g-head"
        onPointerDown={(e) => { swipeRef.current = { x: e.clientX, y: e.clientY } }}
        onPointerUp={(e) => {
          const s = swipeRef.current
          swipeRef.current = null
          if (!s) return
          const dx = e.clientX - s.x
          if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(e.clientY - s.y) * 1.5) setDayView(addDays(dayView, dx < 0 ? 1 : -1))
        }}>
        <Abreiss mini date={dayView} today={today} land={land} onChange={setDayView} />
        <div className="g-hello">
          <h2 className="hero">{greeting(nowMin)}, {me.name}.</h2>
          <p className="g-sum">
            {fei ? <b className="g-fei">{fei}. </b> : null}{lageText}
            {db.demo && <> <span className="chip g-demo">Demo</span></>}
          </p>
          {!isTodayView && (
            <button type="button" className="chip brand g-back" onClick={() => setDayView(today)}><Icon name="today" size={14} />Zurück zu heute</button>
          )}
        </div>
        <div className="g-daynav">
          <button type="button" onClick={() => setDayView(addDays(dayView, -1))} aria-label="Vorheriger Tag"><Icon name="chevL" size={18} /></button>
          <button type="button" onClick={() => setDayView(addDays(dayView, 1))} aria-label="Nächster Tag – Blatt abreißen"><Icon name="chevR" size={18} /></button>
        </div>
      </div>

      {kids.length > 0 && (
        <div className="g-kids" role="group" aria-label="Wo die Kinder sind">
          {kids.map((k) => {
            const { line, sub, who, warn, setup } = kidNow(k)
            return (
              <button type="button" key={k.id} className="g-kid" style={{ '--c': k.color }}
                aria-label={`${k.name}: ${line || 'keine Betreuungszeiten'}. ${sub}${who ? ', ' + who.replace('✋', 'begleitet von') : ''}`}
                onClick={() => { if (setup) setCareSheet(k.id); else { setFilterWho([k.id]); openDay(dayView) } }}>
                <span className="gk-top"><span className="avatar sm member" style={{ background: k.color }}>{k.name[0].toUpperCase()}</span>{k.name}</span>
                <span className={'gk-line' + (setup ? ' setup' : '')}>{line || (setup ? '+ Betreuungszeiten' : 'keine Zeiten')}</span>
                <span className="gk-sub"><span className="gk-ev">{sub}</span>{who && <span className={'gk-who' + (warn ? ' warn' : '')}>{who}</span>}</span>
              </button>
            )
          })}
        </div>
      )}

      <h3 className="label">
        <span className="lico"><Icon name="today" size={17} /></span>
        {isTodayView ? 'Heute' : dayView === addDays(today, 1) ? 'Morgen' : WD_LONG[wdIdx(fromIso(dayView))]}
        <span className="sub">{dayCount ? `${dayCount} Termin${dayCount > 1 ? 'e' : ''}` : 'frei'}</span>
        <button type="button" className="lact btn sm ghost" onClick={() => setSheet({ date: dayView })}><Icon name="plus" size={15} />Termin</button>
      </h3>
      <div className="card g-day">
        {pastEvs.length > 1
          ? (
            <details className="g-fold">
              <summary>{pastEvs.length} Termine schon vorbei</summary>
              {pastEvs.map((e) => <EventRow key={e.id} e={e} cls="past" />)}
            </details>
          )
          : pastEvs.map((e) => <EventRow key={e.id} e={e} cls="past" />)}
        {isTodayView && heuteEvs.length > 0 && <div className="g-now" role="separator" aria-label={'Jetzt, ' + nowTime + ' Uhr'}><span>{nowTime}</span></div>}
        {restEvs.map((e, i) => <EventRow key={e.id} e={e} hint cls={i === nextI ? 'is-next' : ''} badge={i === nextI ? inTxt(e) : null} />)}
        {!heuteEvs.length && <div className="empty">{isTodayView ? 'Heute ist nichts eingetragen – ein freier Tag.' : 'Noch nichts eingetragen.'}</div>}
        {isTodayView && nextI < 0 && nextEv && nextEv.on_date !== today && (
          <button type="button" className="row g-after" onClick={() => setSheet({ event: nextEv })}>
            <span className="time">{nextEv.at_time}</span>
            <span className="dot" style={{ background: mcolor(nextEv.member_id) }} />
            <div className="row-main">
              <div className="row-title">Danach: {viewEvent(nextEv).title}</div>
              <div className="row-meta">{relShort(nextEv.on_date)} · {mname(nextEv.member_id)}</div>
            </div>
            <span className="chev">›</span>
          </button>
        )}
      </div>

      {waiting.length > 0 && (
        <>
          <h3 className="label" id="anfragen-karte"><span className="lico"><Icon name="inbox" size={17} /></span>Wartet auf dich <span className="sub">{waiting.length}</span></h3>
          <div className="card g-wait">
            {waiting.slice(0, 3).map(waitRow)}
            {waiting.length > 3 && (
              <details className="g-fold">
                <summary>{waiting.length - 3} weitere</summary>
                {waiting.slice(3).map(waitRow)}
              </details>
            )}
          </div>
        </>
      )}

      <div className="klapps">
        <Klapp id="planer-klapp" icon="users" title="Familienplaner"
          summary={planOpen ? 'Eine Spalte pro Person' : 'Wer ist wann belegt?'}
          open={planOpen} onToggle={(v) => setAnsicht(v ? 'planer' : 'liste')}
          extra={!planOpen && <DayBand date={dayView} columns={db.members} events={db.events} viewEvent={viewEvent} careOn={careOn} nowMin={nowMin} today={today} />}>
          <Planer compact date={dayView} columns={db.members} events={db.events} viewEvent={viewEvent} careOn={careOn} nowMin={nowMin} today={today} byId={byId} pins={pins} maxH={440} foot={false}
            onOpen={(e) => setSheet({ event: e })} onCare={(id) => { if (!isKid) setCareSheet(id) }}
            onAdd={(mid, t) => setSheet({ date: dayView, prefill: { member_id: mid, at_time: t } })} />
        </Klapp>
        <Klapp id="morgen-klapp" icon="calendar" title={isTodayView ? 'Morgen' : 'Am Tag danach'} summary={tmrSum}
          open={isOpen('morgen')} onToggle={setOpen('morgen')}>
          {dayList(tmrDate)}
        </Klapp>
        {sugPhone.length > 0 && (
          <Klapp id="vorschlaege" icon="bulb" title="Vorschläge" badge={sugPhone.length} summary={sugPhone[0].title}
            open={isOpen('vorschlaege')} onToggle={setOpen('vorschlaege')}>
            <div className="sug">{sugRows(sugPhone)}</div>
            <div className="sug-note">Aus euren eigenen Daten – nichts verlässt das Gerät.</div>
          </Klapp>
        )}
        {pinnedEvs.length > 0 && (
          <Klapp id="geknickt" icon="knick" title="Gemerkt" badge={pinnedEvs.length}
            summary={`Als Nächstes: ${fmtShort(pinnedEvs[0].on_date)} ${viewEvent(pinnedEvs[0]).title}`}
            open={isOpen('gemerkt')} onToggle={setOpen('gemerkt')}>
            {pinnedEvs.map((e) => <EventRow key={e.id} e={e} withDate />)}
          </Klapp>
        )}
        {!isKid && adults.length > 1 && (
          <Klapp id="balance-klapp" icon="hand" title="Wer übernimmt diese Woche"
            summary={adults.map((m) => `${m.name} ${careCount(m.id)}×`).join(' · ')}
            open={isOpen('balance')} onToggle={setOpen('balance')}>
            {balanceEl}
          </Klapp>
        )}
      </div>
    </section>
  )

  const cal = (() => {
    const { y, m } = calCursor
    const first = iso(new Date(y, m, 1))
    const last = iso(new Date(y, m + 1, 0))
    const weeks = []
    let d = addDays(first, -wdIdx(fromIso(first)))
    while (d <= last) {
      const week = []
      for (let i = 0; i < 7; i++) { week.push(d); d = addDays(d, 1) }
      weeks.push(week)
    }
    return { y, m, weeks }
  })()
  const calCols = filterWho.length ? db.members.filter((x) => filterWho.includes(x.id)) : db.members
  const shiftMonth = (n) => setCalCursor(({ y, m }) => { const t = new Date(y, m + n, 1); return { y: t.getFullYear(), m: t.getMonth() } })

  const screenKalender = (
    <section className="screen kal">
      <div className="kal-head">
        <div>
          <p className="eyebrow">Gemeinschaftskalender · KW {kw(cal.weeks[0][0])}–{kw(cal.weeks[cal.weeks.length - 1][0])}</p>
          <h2 className="screen-title">{MONTHS[cal.m]} <span className="yr">{cal.y}</span></h2>
        </div>
        <div className="calbar">
          <div className="seg" role="group" aria-label="Monat wechseln">
            <button type="button" onClick={() => shiftMonth(-1)} aria-label="Voriger Monat"><Icon name="chevL" size={17} /></button>
            <button type="button" onClick={() => { const t = new Date(); setCalCursor({ y: t.getFullYear(), m: t.getMonth() }); setSelDate(today) }}>Heute</button>
            <button type="button" onClick={() => shiftMonth(1)} aria-label="Nächster Monat"><Icon name="chevR" size={17} /></button>
          </div>
          <button className="btn" onClick={() => setSheet({ date: selDate })}><Icon name="plus" size={17} />Termin</button>
        </div>
      </div>
      <div className="kal-tools">
        <div className="legend">
          {!isKid && kids.length > 0 && (() => {
            const fam = [me.id, ...kids.map((k) => k.id)]
            const active = filterWho.length === fam.length && fam.every((id) => filterWho.includes(id))
            return (
              <button className={'chip' + (active ? ' brand' : '')}
                title="Deine Termine und die der Kinder – ohne den Rest"
                onClick={() => setFilterWho(active ? [] : fam)}>
                <Icon name="hand" size={14} />Ich + Kinder
              </button>
            )
          })()}
          {db.members.map((mm) => (
            <button key={mm.id} className={'chip' + (filterWho.length && !filterWho.includes(mm.id) ? ' off' : '')}
              onClick={() => toggleWho(mm.id)}>
              <i className="dot" style={{ background: mm.color }} />{mm.name}
            </button>
          ))}
          {filterWho.length > 0 && (
            <button className="chip" onClick={() => setFilterWho([])}><Icon name="x" size={13} />Alle zeigen</button>
          )}
        </div>
      </div>
      <input className="search" value={calQ} onChange={(e) => setCalQ(e.target.value)}
        placeholder={phone ? 'Termine durchsuchen …' : 'Termine durchsuchen: Name, Typ, Ort … (z. B. „Nachsorge Müller“)'} aria-label="Termine durchsuchen" />
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
                  <span className="time" style={{ minWidth: 82 }}>{fmtShort(e.on_date)} {e.at_time}</span>
                  <span className="dot" style={{ background: mcolor(e.member_id) }} />
                  <div className="row-main">
                    <div className="row-title">{e.title}</div>
                    <div className="row-meta">{e.masked ? e.meta : mname(e.member_id) + (e.meta ? ' · ' + e.meta : '') + (e.ist ? ` · Ist: ${e.ist} Min.` : '')}</div>
                  </div>
                  <span className="chev">›</span>
                </button>
              )
            })}
            {!hits.length && <div className="empty">Kein Termin passt zu „{calQ}“. Die große Suche oben findet auch Geburtstage, Listen und mehr.</div>}
          </div>
        )
      })() : (
      <div className="calgrid">
        <div>
          <div className="month">
            <div className="mh">KW</div>
            {WD.map((n, i) => <div className={'mh' + (i === 6 ? ' so' : '')} key={n}>{n}</div>)}
            {cal.weeks.map((week) => (
              <React.Fragment key={week[0]}>
                <div className="kw">{kw(week[0])}</div>
                {week.map((dateStr) => {
                  const x = fromIso(dateStr)
                  const fei = holidayOn(dateStr, land)
                  const evs = eventsOn(dateStr)
                  const perMember = calCols.map((mm) => ({ mm, n: evs.filter((e) => e.member_id === mm.id).length })).filter((p) => p.n)
                  const cls = ['mday', x.getMonth() !== cal.m ? 'other' : '', wdIdx(x) === 6 ? 'so' : '', fei ? 'fei' : '', dateStr === selDate ? 'sel' : '', dateStr === today ? 'today' : ''].filter(Boolean).join(' ')
                  return (
                    <button key={dateStr} className={cls} onClick={() => setSelDate(dateStr)}
                      aria-label={`${fmtDate(dateStr)}${fei ? ', ' + fei : ''}, ${evs.length} Termine`}>
                      <span className="dnum">{x.getDate()}</span>
                      {fei && <span className="dfei">{fei}</span>}
                      <span className="bars">
                        {perMember.slice(0, 3).map(({ mm, n }) => <i key={mm.id} style={{ '--c': mm.color, width: Math.min(100, 30 + n * 22) + '%' }} />)}
                        {perMember.length > 3 && <em>+{perMember.length - 3}</em>}
                      </span>
                    </button>
                  )
                })}
              </React.Fragment>
            ))}
          </div>
          <div className="legend">
            <span className="chip"><i className="dot" style={{ background: 'var(--red)' }} />Sonn- und Feiertage ({LAENDER[land]})</span>
            <span className="chip honey">Anfrage – wartet auf Zusage</span>
          </div>
        </div>
        <div className="day-panel">
          <h3 className="label">{fmtDate(selDate)}{selDate === today ? ' · heute' : ''}{holidayOn(selDate, land) ? <span className="sub">{holidayOn(selDate, land)}</span> : null}</h3>
          {/* Handy: erst die Liste, der Tagesplaner klappt bei Bedarf auf */}
          {phone && <div className="card">{dayList(selDate)}</div>}
          {calCols.length > 0 && (() => {
            const planer = (
              <Planer compact date={selDate} columns={calCols} events={visible} viewEvent={viewEvent} careOn={careOn} nowMin={nowMin} today={today} byId={byId} pins={pins} maxH={420} foot={false}
                onOpen={(e) => setSheet({ event: e })} onCare={(id) => { if (!isKid) setCareSheet(id) }}
                onAdd={(mid, t) => setSheet({ date: selDate, prefill: { member_id: mid, at_time: t } })} />
            )
            if (!phone) return planer
            return (
              <div className="klapps">
                <Klapp id="kal-planer" icon="users" title="Tagesplaner" summary={`${calCols.length === db.members.length ? 'Alle' : calCols.map((c) => c.name).join(', ')} – eine Spalte pro Person`}
                  open={isOpen('kalplan')} onToggle={setOpen('kalplan')}
                  extra={!isOpen('kalplan') && <DayBand date={selDate} columns={calCols} events={visible} viewEvent={viewEvent} careOn={careOn} nowMin={nowMin} today={today} />}>
                  {planer}
                </Klapp>
              </div>
            )
          })()}
          {!phone && <div className="card">{dayList(selDate)}</div>}
        </div>
      </div>
      )}
    </section>
  )

  const listCard = (list, title, ph, ico) => (
    <div>
      <h3 className="label"><span className="lico"><Icon name={ico} size={18} /></span>{title} <span className="sub">{db.items.filter((i) => i.list === list && !i.done).length} offen</span></h3>
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
        {!db.items.filter((i) => i.list === list).length && <div className="empty">Alles erledigt. Schön.</div>}
        <QuickAdd placeholder={ph} onAdd={(v) => addItem(list, v)} />
      </div>
    </div>
  )

  const screenListen = (
    <section className="screen">
      <h2 className="screen-title">Familienlisten</h2>
      <p className="screen-sub">Für alle – auch die Kinder. Eintippen, fertig.</p>
      <div className="cols two">
        {listCard('einkauf', 'Einkaufen', 'Was fehlt? (Enter)', 'list')}
        {listCard('todo', 'Zu erledigen', 'Was ist zu tun? (Enter)', 'check')}
      </div>
      <h3 className="label"><span className="lico"><Icon name="gift" size={18} /></span>Geburtstage <span className="sub">nie wieder vergessen</span></h3>
      <div className="card">
        {gebSorted.map(({ g, info }) => (
          <div className="row" key={g.id}>
            <span className={'rowico' + (info && info.days <= 3 ? ' warn' : '')}><Icon name="gift" size={17} /></span>
            <div className="row-main">
              <div className="row-title">{g.name}</div>
              <div className="row-meta">
                {g.date}
                {info && ' · ' + (info.days === 0 ? 'heute!' : info.days === 1 ? 'morgen' : `in ${info.days} Tagen`)}
                {info?.age != null && ` · wird ${info.age}`}
              </div>
            </div>
            <button className="btn sm" onClick={() => openWa(g)}><Icon name="message" size={15} />WhatsApp</button>
            {!isKid && <button className="xdel" onClick={() => deleteGeb(g)} aria-label={g.name + ' löschen'}>✕</button>}
          </div>
        ))}
        {!gebs.length && <div className="empty">Noch keine Geburtstage gemerkt – unten eintragen, Eselsohr erinnert rechtzeitig.</div>}
        {!isKid && <GebForm onAdd={addGeb} />}
        {!isKid && <WaTemplateRow key={db.waTemplate || 'std'} value={db.waTemplate || WA_DEFAULT}
          onSave={(v) => { saveAll({ ...db, waTemplate: v }); toast('Vorlage gespeichert') }} />}
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
            {k.adresse && <a className="btn" href={mapsLink(k.adresse)} target="_blank" rel="noreferrer"><Icon name="arrow" size={16} />Anfahrt</a>}
            {k.telefon && <a className="btn ghost" href={'tel:' + k.telefon}>Anrufen</a>}
            <button className="btn ghost" onClick={() => setPTerminSheet({ klid: k.id })}><Icon name="plus" size={16} />Termin</button>
            <button className="btn ghost" onClick={() => setVorlageSheet(k.id)}><Icon name="file" size={16} />Dokument</button>
            <button className="btn ghost" onClick={() => setKlientSheet(k.id)}><Icon name="pencil" size={16} />Bearbeiten</button>
          </div>
          <div className="card">
            <div className="fact"><b>Telefon</b><span>{k.telefon || '—'}</span></div>
            <div className="fact"><b>Adresse</b><span>{k.adresse || '—'}</span></div>
            <div className="fact"><b>Notiz</b><span>{k.notiz || '—'}</span></div>
          </div>
          <h3 className="label">Termin-Historie <span className="sub">Ist-Zeit direkt eintragen</span></h3>
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
            {!kt.length && <div className="empty">Noch keine Termine – oben „Termin“ antippen.</div>}
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
            <h3 className="label">Klientinnen</h3>
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
            <h3 className="label">Nächste Praxistermine</h3>
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

      <h3 className="label">Meine Farbe <span className="sub">färbt deine ganze App</span></h3>
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

      <h3 className="label">Erscheinungsbild <span className="sub">nur auf diesem Gerät</span></h3>
      <div className="themeseg" role="group" aria-label="Erscheinungsbild">
        {[['auto', 'monitor', 'Automatisch'], ['light', 'sun', 'Hell'], ['dark', 'moon', 'Dunkel']].map(([k, ico, l]) => (
          <button type="button" key={k} className={theme === k ? 'on' : ''} onClick={() => setTheme(k)}><Icon name={ico} size={15} />{l}</button>
        ))}
      </div>

      {!isKid && (
        <>
          <h3 className="label">Meine Module <span className="sub">nur du siehst deren Inhalte</span></h3>
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
                  <div className="row-title">{mod.name}</div>
                  <div className="row-meta">{mod.desc}</div>
                </div>
                <span className="chip brand"><Icon name="plus" size={13} />Hinzufügen</span>
              </button>
            ))}
          </div>

          {hasMod(me, 'praxis') && (
            <>
              <h3 className="label">Praxis</h3>
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
              <h3 className="label" id="sport-bereich">Sport <span className="sub">dein Ausgleich, fest eingeplant</span></h3>
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
                          <div className="row-meta">{fmtShort(e.on_date)} {e.at_time} · abhaken, wenn gemacht</div>
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
              <h3 className="label">Vereins-App</h3>
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
              <h3 className="label">Arbeitskalender</h3>
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
              <h3 className="label">Anbindungen <span className="sub">deine Daten in anderen Programmen</span></h3>
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
            <span className="rowico"><Icon name="info" size={17} /></span>
            <div className="row-main">
              <div className="row-title">Demo-Modus</div>
              <div className="row-meta">Alles hier sind Beispieldaten. Profil wechseln lohnt sich: Anne hat das Praxis-Modul, die Kinder sehen nur ihren Teil.</div>
            </div>
            <button className="btn sm danger" onClick={endDemo}>Demo beenden</button>
          </div>
        </div>
      )}
      <h3 className="label"><span className="lico"><Icon name="users" size={18} /></span>Mitglieder</h3>
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
                <Icon name="school" size={14} />Betreuung{(m.care || []).length ? ` · ${m.care.length}` : ''}
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
      <h3 className="label"><span className="lico"><Icon name="cloud" size={18} /></span>Familien-Sync <span className="sub">alle Geräte, ein Stand</span></h3>
      <div className="card">
        {cloud.on ? (
          <>
            <div className="row">
              <span className={'rowico' + (cloud.error ? ' warn' : ' ok')}><Icon name={cloud.error ? 'alert' : 'cloud'} size={17} /></span>
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
            <span className="rowico"><Icon name="cloud" size={17} /></span>
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
          <h3 className="label" id="papierkorb"><span className="lico"><Icon name="trash" size={18} /></span>Papierkorb <span className="sub">30 Tage wiederherstellbar</span><span className="lact"><button className="btn ghost sm" onClick={emptyTrash}>Leeren</button></span></h3>
          <div className="card">
            {(db.trash || []).map((t) => (
              <div className="row" key={t.id}>
                <span className="rowico"><Icon name={{ event: 'calendar', item: 'list', zettel: 'bolt', geb: 'gift' }[t.kind] || 'trash'} size={17} /></span>
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
      <h3 className="label"><span className="lico"><Icon name="today" size={18} /></span>Feiertage <span className="sub">rot im Kalender</span></h3>
      <div className="card">
        <div className="row">
          <div className="row-main">
            <div className="row-title">Bundesland</div>
            <div className="row-meta">Gesetzliche Feiertage erscheinen rot im Abreißkalender und im Monatsblatt.</div>
          </div>
          <select className="search" style={{ width: 'auto', margin: 0, height: 40 }} value={land} aria-label="Bundesland für Feiertage"
            onChange={(e) => { saveAll({ ...db, family: { ...db.family, land: e.target.value } }); toast('Feiertage für ' + LAENDER[e.target.value]) }}>
            {Object.entries(LAENDER).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
          </select>
        </div>
      </div>
      <h3 className="label"><span className="lico"><Icon name="archive" size={18} /></span>Sicherung</h3>
      <div className="card">
        <button className="row" onClick={exportBackup}>
          <RowIcon name="download" />
          <div className="row-main">
            <div className="row-title">Backup exportieren</div>
            <div className="row-meta">Alle Daten als Text (Gedächtnispalast bleibt darin verschlüsselt) – sicher ablegen!</div>
          </div>
          <span className="chev">›</span>
        </button>
        <ImportRow onImport={importBackup} />
      </div>
      <h3 className="label">Hinweis</h3>
      <div className="card">
        <div className="row">
          <RowIcon name={persistent ? 'archive' : 'alert'} />
          <div className="row-main">
            <div className="row-title">{persistent ? 'Daten liegen nur in diesem Browser' : 'Achtung: Speichern in diesem Browser nicht möglich'}</div>
            <div className="row-meta">
              {persistent
                ? (cloud.on ? 'Der Familien-Sync hält alle Geräte auf einem Stand. Ein Backup ab und zu schadet trotzdem nie.' : 'Ohne Familien-Sync bleibt alles auf diesem Gerät. Regelmäßig ein Backup exportieren – oder oben den Sync einschalten.')
                : 'Daten leben nur in dieser Sitzung. Exportiere ein Backup, bevor du die Seite schließt.'}
            </div>
          </div>
        </div>
      </div>
    </section>
  )

  const NAVS = [
    ['heute', 'today', 'Heute', invites.length],
    ['kalender', 'calendar', 'Kalender', 0],
    ['listen', 'list', 'Listen', 0],
    ...(!isKid ? [
      ...(hasMod(me, 'praxis') ? [['praxis', 'heart', 'Praxis', 0]] : []),
      ['merkzeug', 'landmark', 'Gedächtnispalast', 0, 'Palast'],
      ['familie', 'users', 'Familie', 0],
    ] : []),
  ]
  const DOCK = NAVS.filter(([id]) => id === 'heute' || id === 'kalender' || id === 'listen')
  const MORE = NAVS.filter(([id]) => !['heute', 'kalender', 'listen'].includes(id))
  const MORE_SUB = { praxis: 'Klientinnen und Abrechnung', merkzeug: 'Notizen, Kontakte, Dokumente – verschlüsselt', familie: 'Mitglieder, Sync, Backup' }
  const exampleQ = [
    kids[0] && `Wo ist ${kids[0].name} gerade?`,
    'Was ist morgen?',
    gebSorted.find((x) => x.info) && `Wann hat ${gebSorted.find((x) => x.info).g.name} Geburtstag?`,
    kids[0] && `Wer holt ${kids[0].name} heute?`,
    'Milch auf die Liste',
    'Wer hat Samstag Zeit?',
  ].filter(Boolean)
  const goNav = (id) => { setNav(id); if (id === 'heute') setDayView(today) }
  // Rote Zahl = wartet auf dich; graue Zahl = nur zur Info (offene Listenpunkte)
  const softCnt = { listen: db.items.filter((i) => !i.done).length }
  const badgeEl = (id, cnt) => (cnt > 0
    ? <span className="cnt">{cnt}</span>
    : softCnt[id] > 0 ? <span className="cnt soft" aria-label={`${softCnt[id]} offen`}>{softCnt[id]}</span> : null)
  const tab = ([id, ico, label, cnt, short]) => (
    <button key={id} className={'tab' + (nav === id ? ' active' : '')} onClick={() => goNav(id)} aria-current={nav === id ? 'page' : undefined}>
      <span className="ico"><Icon name={ico} size={22} /></span>{short || label}
      {badgeEl(id, cnt)}
    </button>
  )

  return (
    <div className="shell">
      <header className="mast">
        <button type="button" className="brand" onClick={() => { setNav('heute'); setDayView(today) }} aria-label="Eselsohr – zu Heute">
          <LogoMark size={36} /><span className="brand-word">Esels<em>ohr</em></span>
        </button>
        <button type="button" className="searchpill" onClick={() => setSuche({ q: '' })} aria-label="Suchen, fragen oder eintragen (Strg+K)">
          <Icon name="search" size={19} />
          <span className="sp-text"><RotatingExample items={exampleQ} /></span>
          <kbd>⌘K</kbd>
        </button>
        <div className="mast-act">
          {cloud.on && <span className={'syncdot' + (cloud.error ? ' err' : '')} title={cloud.error ? 'Sync gestört – Daten bleiben lokal sicher' : 'Familien-Sync aktiv'} />}
          {!isKid && (
            <button className="iconbtn" aria-label="Blitzzettel – schnell festhalten" title="Blitzzettel" onClick={() => setBlitz(true)}>
              <Icon name="bolt" size={19} />
              {myInbox.length > 0 && <span className="cnt" style={{ position: 'absolute', top: -6, right: -6 }}>{myInbox.length}</span>}
            </button>
          )}
          <button className="userchip" onClick={() => setNav('profil')} aria-label="Mein Profil">
            <span className="avatar sm member" style={{ background: me.color }}>{me.name[0].toUpperCase()}</span>
            <span className="uc-name">{me.name}</span>
          </button>
        </div>
      </header>
      <nav className="register" aria-label="Bereiche">
        {NAVS.map(([id, ico, label, cnt]) => (
          <button key={id} className={'navbtn' + (nav === id ? ' active' : '')} onClick={() => goNav(id)} aria-current={nav === id ? 'page' : undefined}>
            <span className="ico"><Icon name={ico} size={17} /></span>{label}
            {badgeEl(id, cnt)}
          </button>
        ))}
      </nav>
      <main className="blatt">
        <button type="button" className="blatt-ohr" onClick={() => runAct({ type: 'nav', nav: { cmd: 'geknickt' } })}
          title={pins.length ? `${pins.length} gemerkte Termine` : 'Eselsohr: Ecke eines Termins knicken, um ihn zu merken'} aria-label="Gemerkte Termine">
          {pins.length > 0 && <span className="cnt">{pins.length}</span>}
        </button>
        {nav === 'heute' && (phone ? screenGlance : screenHeute)}
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
            initialQuery={palaceQuery}
            onQueryUsed={() => setPalaceQuery('')}
            startSec={palaceSec}
            onSecUsed={() => setPalaceSec(null)}
            onProvider={setPalaceProv}
          />
        )}
        {nav === 'familie' && !isKid && screenFamilie}
      </main>
      <footer className="note">Eselsohr · eure Daten gehören euch · Gedächtnispalast Ende-zu-Ende-verschlüsselt</footer>
      <nav className="dock" aria-label="Bereiche">
        <div className="dock-in">
          {DOCK.slice(0, 2).map(tab)}
          <button className="tab dock-search" onClick={() => setSuche({ q: '' })} aria-label="Suchen, fragen oder eintragen">
            <span className="ico"><Icon name="search" size={24} /></span><span>Suche</span>
          </button>
          {DOCK.slice(2).map(tab)}
          {MORE.length > 0
            ? <button className={'tab' + (MORE.some(([id]) => id === nav) || nav === 'profil' ? ' active' : '')} onClick={() => setMehr(true)}><span className="ico"><Icon name="more" size={22} /></span>Mehr</button>
            : <button className={'tab' + (nav === 'profil' ? ' active' : '')} onClick={() => setNav('profil')}><span className="ico"><Icon name="user" size={22} /></span>Ich</button>}
        </div>
      </nav>
      {mehr && (
        <div className="overlay" onClick={(e) => { if (e.target === e.currentTarget) setMehr(false) }}>
          <div className="sheet">
            <h3>Mehr<button type="button" className="x" onClick={() => setMehr(false)} aria-label="Schließen">✕</button></h3>
            <div className="more-grid">
              {MORE.map(([id, ico, label]) => (
                <button key={id} type="button" className="more-tile" onClick={() => { setNav(id); setMehr(false) }}>
                  <span className="rowico"><Icon name={ico} size={19} /></span>{label}<small>{MORE_SUB[id]}</small>
                </button>
              ))}
              <button type="button" className="more-tile" onClick={() => { setNav('profil'); setMehr(false) }}>
                <span className="rowico"><Icon name="user" size={19} /></span>Mein Profil<small>Farbe, Module, Erscheinungsbild</small>
              </button>
            </div>
          </div>
        </div>
      )}
      {suche && (
        <Suche initial={suche.q} onClose={() => setSuche(null)} db={db} index={searchIndex} ctx={searchCtx}
          api={{ run: runAct }} palace={nav === 'merkzeug' ? palaceProv : null} />
      )}
      {sheet && (
        <EventSheet key={sheet.event ? sheet.event.id : `neu-${sheet.date || ''}-${sheet.prefill?.member_id || ''}-${sheet.prefill?.at_time || ''}`}
          initial={sheet} members={db.members} me={me} stats={titleStats}
          pinned={sheet.event ? pins.includes(sheet.event.id) : false}
          onPin={sheet.event ? () => togglePin(sheet.event.id) : null}
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
