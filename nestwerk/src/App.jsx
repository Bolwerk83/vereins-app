import React, { useEffect, useRef, useState } from 'react'
import { loadState, saveState, storageWorks } from './store.js'
import { fetchVereinData, mapTeamEvents } from './verein.js'
import { loadSyncMeta, saveSyncMeta, newSyncCode, esCreate, esPull, esPush, stripLocal, mergeDb } from './sync.js'
import { WD, WD_LONG, MONTHS, COLORS, iso, fromIso, wdIdx, fmtDate, fmtShort, addDays, mins, uid, gebInfo, parseIcs, mapsLink } from './util.js'
import { Icon, RowIcon, LogoMark } from './icons.jsx'
import { PTYPES, MODULES, hasMod, VORLAGEN, fillVorlage } from './domain.js'
import { useToast, QuickAdd } from './ui.jsx'
import { Onboarding, demoData, ProfilePicker } from './onboarding.jsx'
import { Merkzeug, PersonAvatar } from './palace.jsx'
import { EventSheet, MemberSheet, CareSheet, KlientSheet, PTerminSheet, VorlageSheet, VereinSheet, BlitzSheet, BlitzListe, GebForm, WaTemplateRow, SerieWizard, IstWizard, SportPlanForm, ImportRow, WA_DEFAULT } from './sheets.jsx'

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
        <button className="kpi accent" onClick={() => {
          const d = fromIso(today)
          setSelDate(today); setCalCursor({ y: d.getFullYear(), m: d.getMonth() }); setCalQ(''); setNav('kalender')
        }} aria-label="Zum heutigen Tag im Kalender">
          <div className="num">{db.events.filter((e) => e.on_date === today && e.status === 'fix').length}</div>
          <div className="cap">Termine heute ›</div>
        </button>
        <button className={'kpi' + (invites.length ? ' alert' : '')} onClick={() => {
          if (invites.length) document.getElementById('anfragen-karte')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
          else toast('Keine offenen Anfragen – alles beantwortet 🎉')
        }} aria-label="Zu deinen Anfragen">
          <div className="num">{invites.length}</div>
          <div className="cap">Anfragen an dich ›</div>
        </button>
        <button className="kpi" onClick={() => setNav('listen')} aria-label="Zu den Familienlisten">
          <div className="num">{db.items.filter((i) => !i.done).length}</div>
          <div className="cap">Offene Listenpunkte ›</div>
        </button>
        {hasMod(me, 'sport') && (
          <button className={'kpi' + (mySportWeek.filter((e) => e.done).length >= sportGoal ? ' accent' : '')} onClick={() => {
            setNav('profil')
            setTimeout(() => document.getElementById('sport-bereich')?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 120)
          }} aria-label="Zu deinem Sport-Bereich">
            <div className="num">{mySportWeek.filter((e) => e.done).length}/{sportGoal}</div>
            <div className="cap">🏃 Sport diese Woche ›</div>
          </button>
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
          <p className="label" id="anfragen-karte">📩 Anfragen an dich</p>
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
              <p className="label" id="sport-bereich">🏃 Sport · dein Ausgleich, fest eingeplant</p>
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
