import React, { useRef, useState } from 'react'
import { loadState, saveState, storageWorks } from './store.js'
import { newSalt, deriveKey, encryptJson, decryptJson } from './crypto.js'

/* ================= Helfer ================= */

const WD = ['Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa', 'So']
const WD_LONG = ['Montag', 'Dienstag', 'Mittwoch', 'Donnerstag', 'Freitag', 'Samstag', 'Sonntag']
const MONTHS = ['Januar', 'Februar', 'März', 'April', 'Mai', 'Juni', 'Juli', 'August', 'September', 'Oktober', 'November', 'Dezember']
const COLORS = ['#3E7CB1', '#BC5878', '#D28E2C', '#5B9E63', '#7C6BAF', '#C96A4A', '#4A9FA5', '#8A8F3C']

const iso = (d) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
const fromIso = (s) => new Date(+s.slice(0, 4), +s.slice(5, 7) - 1, +s.slice(8, 10))
const wdIdx = (d) => (d.getDay() + 6) % 7
const fmtDate = (s) => { const d = fromIso(s); return `${WD_LONG[wdIdx(d)]}, ${d.getDate()}. ${MONTHS[d.getMonth()]}` }
const fmtShort = (s) => { const d = fromIso(s); return `${WD[wdIdx(d)]} ${d.getDate()}.${d.getMonth() + 1}.` }
const addDays = (s, n) => { const d = fromIso(s); d.setDate(d.getDate() + n); return iso(d) }
const mins = (t) => +t.slice(0, 2) * 60 + +t.slice(3, 5)
const uid = () => (crypto.randomUUID ? crypto.randomUUID() : String(Math.random()).slice(2))

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

function Onboarding({ onCreate }) {
  const [famName, setFamName] = useState('')
  const [myName, setMyName] = useState('')
  const [color, setColor] = useState(COLORS[0])
  return (
    <div className="auth-wrap">
      <form className="auth-card" onSubmit={(e) => { e.preventDefault(); if (famName.trim() && myName.trim()) onCreate(famName.trim(), myName.trim(), color) }}>
        <h1 className="serif"><span style={{ color: 'var(--brand)' }}>Nest</span>werk</h1>
        <p className="sub">Der Familienkalender mit Gedächtnis. Gründe euer Nest – dauert 20 Sekunden, ganz ohne Konto.</p>
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
        <button className="btn" style={{ width: '100%' }}>Nest gründen 🪺</button>
        <p className="hint">Alles bleibt auf diesem Gerät – keine Datenbank, kein Server. Backup gibt’s unter „Familie“.</p>
      </form>
    </div>
  )
}

/* ================= Profilwahl ================= */

function ProfilePicker({ members, onPick }) {
  return (
    <div className="auth-wrap">
      <div className="auth-card">
        <h1 className="serif">🪺 Wer bist du?</h1>
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
        <p className="hint">Antippen genügt. Das Merkzeug hat zusätzlich sein eigenes Passwort.</p>
      </div>
    </div>
  )
}

/* ================= Termin-Formular ================= */

function EventSheet({ initial, members, me, onSave, onDelete, onClose }) {
  const e = initial.event
  const [title, setTitle] = useState(e ? e.title : '')
  const [memberId, setMemberId] = useState(e ? e.member_id : me.id)
  const [date, setDate] = useState(e ? e.on_date : initial.date)
  const [time, setTime] = useState(e ? e.at_time : '15:00')
  const [meta, setMeta] = useState(e ? e.meta : '')
  const [serie, setSerie] = useState(false)

  return (
    <div className="overlay" onClick={(ev) => { if (ev.target === ev.currentTarget) onClose() }}>
      <form className="sheet" onSubmit={(ev) => {
        ev.preventDefault()
        if (title.trim()) onSave({ title: title.trim(), member_id: memberId, on_date: date, at_time: time, meta: meta.trim(), serie })
      }}>
        <h3>{e ? 'Termin bearbeiten' : 'Neuer Termin'}<button type="button" className="x" onClick={onClose} aria-label="Schließen">✕</button></h3>
        <div className="field">
          <label htmlFor="f-title">Titel</label>
          <input id="f-title" autoFocus required value={title} onChange={(ev) => setTitle(ev.target.value)} placeholder="z. B. Fußballtraining" />
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
            <label htmlFor="f-meta">Bringt / holt (optional)</label>
            <input id="f-meta" value={meta} onChange={(ev) => setMeta(ev.target.value)} placeholder="z. B. Bringt: Papa" />
          </div>
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

/* ================= Merkzeug (E2E-verschlüsselt, lokal) ================= */

const EMPTY_MEMORY = { persons: [] }

function Merkzeug({ blob, onSaveBlob, ownerName, toast }) {
  const [state, setState] = useState('locked')
  const [pw, setPw] = useState('')
  const [err, setErr] = useState(null)
  const [key, setKey] = useState(null)
  const [salt, setSalt] = useState(null)
  const [mem, setMem] = useState(EMPTY_MEMORY)
  const [isNew, setIsNew] = useState(false)
  const [q, setQ] = useState('')
  const [sel, setSel] = useState(null)
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
          setKey(k); setSalt(blob.salt); setMem(obj); setIsNew(false); setState('open')
          toast('Entsperrt – nur auf diesem Gerät lesbar')
        } catch {
          setErr('Falsches Gedächtnis-Passwort.')
          setState('locked')
        }
      } else {
        const s = newSalt()
        const k = await deriveKey(pw, s)
        setKey(k); setSalt(s); setMem(EMPTY_MEMORY); setIsNew(true); setState('open')
        const enc = await encryptJson(k, EMPTY_MEMORY)
        onSaveBlob({ salt: s, ...enc })
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

  function lock() {
    setKey(null); setMem(EMPTY_MEMORY); setSel(null); setState('locked'); setQ('')
    toast('Gesperrt 🔒')
  }

  if (state !== 'open') {
    return (
      <section className="screen">
        <h2 className="screen-title">Merkzeug</h2>
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
    return (
      <section className="screen">
        <button className="btn ghost" style={{ margin: '12px 0 10px' }} onClick={() => setSel(null)}>‹ Zurück</button>
        <h2 className="screen-title serif">{p.name}</h2>
        <p className="screen-sub">{p.ctx || 'Woher kennt ihr euch?'}</p>
        <div className="card">
          {[['familie', 'Familie'], ['themen', 'Themen'], ['faden', 'Offener Faden'], ['geb', 'Geburtstag']].map(([k, label]) => (
            <div className="fact" key={k}>
              <b>{label}</b>
              <input style={{ flex: 1, font: 'inherit', border: 0, background: 'none', color: 'inherit', outline: 'none' }}
                value={p[k] || ''} placeholder="…" onChange={(e) => upd({ [k]: e.target.value })} />
            </div>
          ))}
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
        <p className="hint">
          <button className="btn danger sm" onClick={() => { persist({ ...mem, persons: mem.persons.filter((x) => x.id !== p.id) }); setSel(null) }}>
            Person löschen
          </button>
        </p>
      </section>
    )
  }

  const ql = q.trim().toLowerCase()
  const hits = mem.persons.filter((p) =>
    !ql || [p.name, p.ctx, p.familie, p.themen, p.faden, p.geb, (p.notizen || []).join(' ')].join(' ').toLowerCase().includes(ql))

  return (
    <section className="screen">
      <div className="title-row">
        <div>
          <h2 className="screen-title">Merkzeug</h2>
          <p className="screen-sub">{mem.persons.length} Person{mem.persons.length === 1 ? '' : 'en'} · verschlüsselt gespeichert</p>
        </div>
        <button className="btn ghost sm" onClick={lock}>🔒 Sperren</button>
      </div>
      {isNew && (
        <div className="qcard" style={{ marginBottom: 14 }}>
          <h4>Wichtig</h4>
          <ul>
            <li>Dein Gedächtnis-Passwort lässt sich <b>nicht zurücksetzen</b>. Schreib es auf und leg es sicher ab.</li>
            <li>Leg gleich die erste Person an – z. B. jemanden, dessen Namen du dir nie merken kannst. 😉</li>
          </ul>
        </div>
      )}
      <input className="search" value={q} onChange={(e) => setQ(e.target.value)}
        placeholder="Suchen: Name, Thema, Notiz …" aria-label="Im Gedächtnis suchen" />
      <div className="card">
        {hits.map((p) => (
          <button className="row" key={p.id} onClick={() => setSel(p.id)}>
            <span className="avatar">{(p.name || '?')[0].toUpperCase()}</span>
            <div className="row-main">
              <div className="row-title">{p.name}</div>
              <div className="row-meta">{p.ctx || '—'}</div>
            </div>
            <span className="chev">›</span>
          </button>
        ))}
        {!hits.length && <div className="empty">{q ? `Kein Treffer für „${q}“.` : 'Noch keine Personen – leg unten die erste an.'}</div>}
        <div className="quickadd">
          <input value={addName} onChange={(e) => setAddName(e.target.value)} placeholder="Name" aria-label="Name" style={{ maxWidth: 130 }} />
          <input value={addCtx} onChange={(e) => setAddCtx(e.target.value)} placeholder="Woher? (z. B. Nachbar)" aria-label="Kontext" />
          <button type="button" className="btn sm" onClick={() => {
            if (!addName.trim()) return
            persist({ ...mem, persons: [{ id: uid(), name: addName.trim(), ctx: addCtx.trim(), notizen: [] }, ...mem.persons] })
            setAddName(''); setAddCtx('')
            toast('Person angelegt ✓')
          }}>+</button>
        </div>
      </div>
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
  const today = iso(new Date())

  const persistent = storageWorks()

  function saveAll(next) {
    setDb(next)
    saveState(next)
  }

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
          toast('Familie gegründet 🪺')
        }} />
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
    saveAll({ ...db, events: db.events.filter((e) => e.id !== sheet.event.id) })
    setSheet(null)
    toast('Termin gelöscht')
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

  const addItem = (list, text) => saveAll({ ...db, items: [{ id: uid(), list, text, done: false, created_by: me.id }, ...db.items] })
  const toggleItem = (it) => saveAll({ ...db, items: db.items.map((x) => (x.id === it.id ? { ...x, done: !x.done } : x)) })
  const deleteItem = (it) => saveAll({ ...db, items: db.items.filter((x) => x.id !== it.id) })

  function addMember(name, color, kind) {
    saveAll({ ...db, members: [...db.members, { id: uid(), name, color, kind, is_admin: false, can_direct: false }] })
    toast(`${name} ist dabei 🪺`)
  }
  function toggleDirect(m) {
    saveAll({ ...db, members: db.members.map((x) => (x.id === m.id ? { ...x, can_direct: !x.can_direct } : x)) })
    toast(`${m.name} ${!m.can_direct ? 'darf jetzt direkt eintragen' : 'braucht jetzt Bestätigung'}`)
  }

  async function exportBackup() {
    const json = JSON.stringify(db, null, 2)
    try {
      await navigator.clipboard?.writeText(json)
    } catch { /* Zwischenablage gesperrt */ }
    if (window.claude?.downloads) {
      try {
        await window.claude.downloads.save({ filename: 'nestwerk-backup.json', data: json })
        toast('Backup gespeichert ✓ (und in die Zwischenablage kopiert)')
      } catch (e) {
        toast(e?.code === 'declined' ? 'Speichern abgebrochen – Backup liegt in der Zwischenablage' : 'Backup in Zwischenablage kopiert ✓')
      }
      return
    }
    try {
      const a = document.createElement('a')
      a.href = URL.createObjectURL(new Blob([json], { type: 'application/json' }))
      a.download = 'nestwerk-backup.json'
      a.click()
    } catch { /* Download gesperrt */ }
    toast('Backup als Datei gespeichert und in die Zwischenablage kopiert ✓')
  }

  /* ---------- Bausteine ---------- */

  const EventRow = ({ e }) => (
    <button className="row" onClick={() => setSheet({ event: e })}>
      <span className="time">{e.at_time}</span>
      <span className="dot" style={{ background: mcolor(e.member_id) }} />
      <div className="row-main">
        <div className="row-title">{e.title}{e.serie ? ' ↻' : ''}</div>
        <div className="row-meta">{mname(e.member_id)}{e.meta ? ' · ' + e.meta : ''}</div>
      </div>
      {e.status === 'pending' && <span className="chip honey">📩 Anfrage</span>}
      <span className="chev">›</span>
    </button>
  )

  const dayList = (dateStr) => {
    const list = eventsOn(dateStr)
    return list.length ? list.map((e) => <EventRow key={e.id} e={e} />) : <div className="empty">Keine Termine – freier Tag 🎉</div>
  }

  /* ---------- Bildschirme ---------- */

  const screenHeute = (
    <section className="screen">
      <h2 className="screen-title">Hallo {me.name}! 🪺</h2>
      <p className="screen-sub">{fmtDate(today)} · {db.family.name}</p>
      <div className="kpis">
        <div className="kpi accent"><div className="num">{db.events.filter((e) => e.on_date === today && e.status === 'fix').length}</div><div className="cap">Termine heute</div></div>
        <div className={'kpi' + (invites.length ? ' alert' : '')}><div className="num">{invites.length}</div><div className="cap">Anfragen an dich</div></div>
        <div className="kpi"><div className="num">{db.items.filter((i) => !i.done).length}</div><div className="cap">Offene Listenpunkte</div></div>
      </div>
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
      <p className="label">{fmtDate(selDate)}{selDate === today ? ' · heute' : ''}</p>
      <div className="card">{dayList(selDate)}</div>
      <div className="legend">
        <span className="chip brand">↻ Serie</span>
        <span className="chip honey">📩 Anfrage – wartet auf Zusage</span>
      </div>
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
    </section>
  )

  const screenFamilie = (
    <section className="screen">
      <h2 className="screen-title">{db.family.name}</h2>
      <p className="screen-sub">Mitglieder, Rechte und Sicherung</p>
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
              </div>
            </div>
            {me.is_admin && m.kind !== 'kid' && m.id !== me.id && (
              <button className={'btn sm ' + (m.can_direct ? 'ghost' : '')} onClick={() => toggleDirect(m)}>
                {m.can_direct ? 'direkt ✓' : 'Anfrage'}
              </button>
            )}
          </div>
        ))}
        {me.is_admin && <AddMember onAdd={addMember} />}
      </div>
      <p className="label">Sicherung</p>
      <div className="card">
        <button className="row" onClick={exportBackup}>
          <span style={{ fontSize: 20 }}>⬇️</span>
          <div className="row-main">
            <div className="row-title">Backup exportieren</div>
            <div className="row-meta">Alle Daten als Text (Merkzeug bleibt darin verschlüsselt) – sicher ablegen!</div>
          </div>
          <span className="chev">›</span>
        </button>
        <ImportRow onImport={(json) => {
          try {
            const obj = JSON.parse(json)
            if (!obj.family || !obj.members) throw new Error('Kein Nestwerk-Backup')
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
          <span style={{ fontSize: 20 }}>{persistent ? '💾' : '⚠️'}</span>
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
    ['heute', '🪺', 'Heute', invites.length],
    ['kalender', '📅', 'Kalender', 0],
    ['listen', '🛒', 'Listen', 0],
    ...(!isKid ? [['merkzeug', '🔐', 'Merkzeug', 0], ['familie', '👨‍👩‍👧‍👦', 'Familie', 0]] : []),
  ]

  return (
    <div className="shell">
      <aside className="side">
        <div className="logo serif"><span className="nest">Nest</span>werk</div>
        {NAVS.map(([id, ico, label, cnt]) => (
          <button key={id} className={'navbtn' + (nav === id ? ' active' : '')} onClick={() => setNav(id)}>
            <span className="ico">{ico}</span>{label}
            {cnt > 0 && <span className="cnt">{cnt}</span>}
          </button>
        ))}
        <div className="spacer" />
        <div className="demonote">{db.family.name} · {db.members.length} Mitglieder · Daten nur auf diesem Gerät</div>
      </aside>
      <div className="mainwrap">
        <header className="topbar">
          <h1 className="wordmark serif"><span className="nest">Nest</span>werk</h1>
          <span className="sp" />
          <button className="userchip" onClick={() => saveAll({ ...db, active: null })} aria-label="Profil wechseln">
            <span className="avatar sm member" style={{ background: me.color }}>{me.name[0].toUpperCase()}</span>
            {me.name} ⇄
          </button>
        </header>
        <main>
          {nav === 'heute' && screenHeute}
          {nav === 'kalender' && screenKalender}
          {nav === 'listen' && screenListen}
          {nav === 'merkzeug' && !isKid && (
            <Merkzeug
              blob={db.memories[me.id] || null}
              onSaveBlob={(blob) => saveAll({ ...db, memories: { ...db.memories, [me.id]: blob } })}
              ownerName={me.name}
              toast={toast}
            />
          )}
          {nav === 'familie' && !isKid && screenFamilie}
          <footer className="note">Nestwerk · eure Daten gehören euch · Merkzeug Ende-zu-Ende-verschlüsselt</footer>
        </main>
        <nav className="tabs">
          <div className="inner">
            {NAVS.map(([id, ico, label]) => (
              <button key={id} className={'tab' + (nav === id ? ' active' : '')} onClick={() => setNav(id)}>
                <span className="ico">{ico}</span>{label}
              </button>
            ))}
          </div>
        </nav>
      </div>
      {sheet && (
        <EventSheet initial={sheet} members={db.members} me={me}
          onSave={saveEvent} onDelete={deleteEvent} onClose={() => setSheet(null)} />
      )}
      {toastEl}
    </div>
  )
}

function AddMember({ onAdd }) {
  const [name, setName] = useState('')
  const [color, setColor] = useState(COLORS[3])
  const [kind, setKind] = useState('kid')
  return (
    <div className="quickadd">
      <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Mitglied hinzufügen: Vorname" aria-label="Mitglied hinzufügen" />
      <select value={kind} onChange={(e) => setKind(e.target.value)} aria-label="Art"
        style={{ font: 'inherit', borderRadius: 10, border: '1px solid var(--hairline)', background: 'var(--ground)', color: 'var(--ink)' }}>
        <option value="kid">Kind</option>
        <option value="adult">Erwachsen</option>
      </select>
      <select value={color} onChange={(e) => setColor(e.target.value)} aria-label="Farbe"
        style={{ font: 'inherit', borderRadius: 10, border: '1px solid var(--hairline)', background: color, width: 44 }}>
        {COLORS.map((c) => <option key={c} value={c} style={{ background: c }}>&nbsp;</option>)}
      </select>
      <button type="button" className="btn sm" onClick={() => { if (name.trim()) { onAdd(name.trim(), color, kind); setName('') } }}>+</button>
    </div>
  )
}

function ImportRow({ onImport }) {
  const [open, setOpen] = useState(false)
  const [v, setV] = useState('')
  if (!open) {
    return (
      <button className="row" onClick={() => setOpen(true)}>
        <span style={{ fontSize: 20 }}>⬆️</span>
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
