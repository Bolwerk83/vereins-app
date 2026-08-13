import React, { useEffect, useMemo, useRef, useState } from 'react'
import { supabase } from './supabase.js'
import { newSalt, deriveKey, encryptJson, decryptJson } from './crypto.js'

/* ================= Helfer ================= */

const WD = ['Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa', 'So']
const WD_LONG = ['Montag', 'Dienstag', 'Mittwoch', 'Donnerstag', 'Freitag', 'Samstag', 'Sonntag']
const MONTHS = ['Januar', 'Februar', 'März', 'April', 'Mai', 'Juni', 'Juli', 'August', 'September', 'Oktober', 'November', 'Dezember']
const COLORS = ['#3E7CB1', '#BC5878', '#D28E2C', '#5B9E63', '#7C6BAF', '#C96A4A', '#4A9FA5', '#8A8F3C']

const iso = (d) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
const fromIso = (s) => new Date(+s.slice(0, 4), +s.slice(5, 7) - 1, +s.slice(8, 10))
const wdIdx = (d) => (d.getDay() + 6) % 7
const hhmm = (t) => (t || '').slice(0, 5)
const fmtDate = (s) => { const d = fromIso(s); return `${WD_LONG[wdIdx(d)]}, ${d.getDate()}. ${MONTHS[d.getMonth()]}` }
const fmtShort = (s) => { const d = fromIso(s); return `${WD[wdIdx(d)]} ${d.getDate()}.${d.getMonth() + 1}.` }
const addDays = (s, n) => { const d = fromIso(s); d.setDate(d.getDate() + n); return iso(d) }

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

/* ================= Anmeldung ================= */

function AuthScreen({ toast }) {
  const [mode, setMode] = useState('login')
  const [email, setEmail] = useState('')
  const [pw, setPw] = useState('')
  const [msg, setMsg] = useState(null)
  const [busy, setBusy] = useState(false)

  async function submit(e) {
    e.preventDefault()
    setBusy(true)
    setMsg(null)
    try {
      if (mode === 'login') {
        const { error } = await supabase.auth.signInWithPassword({ email, password: pw })
        if (error) throw error
      } else {
        const { data, error } = await supabase.auth.signUp({ email, password: pw })
        if (error) throw error
        if (!data.session) {
          setMsg({ ok: true, text: 'Fast geschafft: Bitte bestätige den Link in deiner E-Mail und melde dich dann an.' })
          setMode('login')
          return
        }
      }
    } catch (err) {
      setMsg({ ok: false, text: err.message === 'Invalid login credentials' ? 'E-Mail oder Passwort stimmt nicht.' : err.message })
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="auth-wrap">
      <form className="auth-card" onSubmit={submit}>
        <h1 className="serif"><span style={{ color: 'var(--brand)' }}>Nest</span>werk</h1>
        <p className="sub">Der Familienkalender mit Gedächtnis. Jede Person hat ihren eigenen Zugang.</p>
        {msg && <div className={'authmsg ' + (msg.ok ? 'ok' : 'err')}>{msg.text}</div>}
        <div className="field">
          <label htmlFor="email">E-Mail</label>
          <input id="email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" />
        </div>
        <div className="field">
          <label htmlFor="pw">Passwort</label>
          <input id="pw" type="password" required minLength={8} value={pw} onChange={(e) => setPw(e.target.value)}
            autoComplete={mode === 'login' ? 'current-password' : 'new-password'} />
        </div>
        <button className="btn" style={{ width: '100%' }} disabled={busy}>
          {busy ? 'Moment …' : mode === 'login' ? 'Anmelden' : 'Konto anlegen'}
        </button>
        <p className="hint" style={{ textAlign: 'center' }}>
          {mode === 'login'
            ? <>Noch kein Konto? <button type="button" className="linkbtn" onClick={() => { setMode('register'); setMsg(null) }}>Registrieren</button></>
            : <>Schon dabei? <button type="button" className="linkbtn" onClick={() => { setMode('login'); setMsg(null) }}>Anmelden</button></>}
        </p>
      </form>
    </div>
  )
}

/* ================= Familie gründen / beitreten ================= */

function Onboarding({ onDone, toast }) {
  const [mode, setMode] = useState('create')
  const [famName, setFamName] = useState('')
  const [code, setCode] = useState('')
  const [myName, setMyName] = useState('')
  const [color, setColor] = useState(COLORS[0])
  const [msg, setMsg] = useState(null)
  const [busy, setBusy] = useState(false)

  async function submit(e) {
    e.preventDefault()
    setBusy(true)
    setMsg(null)
    const fn = mode === 'create' ? 'nw_create_family' : 'nw_join_family'
    const args = mode === 'create'
      ? { family_name: famName, my_name: myName, my_color: color }
      : { code, my_name: myName, my_color: color }
    const { error } = await supabase.rpc(fn, args)
    setBusy(false)
    if (error) { setMsg(error.message); return }
    toast(mode === 'create' ? 'Familie gegründet 🪺' : 'Willkommen in der Familie 🪺')
    onDone()
  }

  return (
    <div className="auth-wrap">
      <form className="auth-card" onSubmit={submit}>
        <h1 className="serif">🪺 Euer Nest</h1>
        <p className="sub">Gründe eure Familie – oder tritt mit einem Einladungscode bei.</p>
        <div className="calbar">
          <button type="button" className={'btn sm ' + (mode === 'create' ? '' : 'ghost')} onClick={() => setMode('create')}>Neu gründen</button>
          <button type="button" className={'btn sm ' + (mode === 'join' ? '' : 'ghost')} onClick={() => setMode('join')}>Mit Code beitreten</button>
        </div>
        {msg && <div className="authmsg err">{msg}</div>}
        {mode === 'create' ? (
          <div className="field">
            <label htmlFor="famname">Familienname</label>
            <input id="famname" required value={famName} onChange={(e) => setFamName(e.target.value)} placeholder="z. B. Familie Bolwerk" />
          </div>
        ) : (
          <div className="field">
            <label htmlFor="code">Einladungscode</label>
            <input id="code" required value={code} onChange={(e) => setCode(e.target.value)} placeholder="z. B. a1b2c3d4e5f6" />
          </div>
        )}
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
        <button className="btn" style={{ width: '100%' }} disabled={busy}>{busy ? 'Moment …' : 'Los geht’s'}</button>
      </form>
    </div>
  )
}

/* ================= Termin-Formular ================= */

function EventSheet({ initial, members, me, onSave, onDelete, onClose }) {
  const e = initial.event
  const [title, setTitle] = useState(e ? e.title : '')
  const [memberId, setMemberId] = useState(e ? e.member_id : me.id)
  const [date, setDate] = useState(e ? e.on_date : initial.date)
  const [time, setTime] = useState(e ? hhmm(e.at_time) : '15:00')
  const [meta, setMeta] = useState(e ? e.meta : '')
  const [serie, setSerie] = useState(e ? e.serie : false)
  const [busy, setBusy] = useState(false)

  async function save(ev) {
    ev.preventDefault()
    if (!title.trim()) return
    setBusy(true)
    await onSave({ title: title.trim(), member_id: memberId, on_date: date, at_time: time, meta: meta.trim(), serie })
    setBusy(false)
  }

  return (
    <div className="overlay" onClick={(ev) => { if (ev.target === ev.currentTarget) onClose() }}>
      <form className="sheet" onSubmit={save}>
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
          <button className="btn" disabled={busy}>{busy ? 'Moment …' : 'Speichern'}</button>
          {e && <button type="button" className="btn danger" onClick={onDelete}>Löschen</button>}
        </div>
      </form>
    </div>
  )
}

/* ================= Merkzeug (E2E-verschlüsselt) ================= */

const EMPTY_MEMORY = { persons: [] }

function Merkzeug({ session, toast }) {
  const [state, setState] = useState('locked') // locked | busy | open
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
      const { data, error } = await supabase.from('nw_memory').select('*').eq('user_id', session.user.id).maybeSingle()
      if (error) throw error
      if (data) {
        const k = await deriveKey(pw, data.salt)
        try {
          const obj = await decryptJson(k, data.iv, data.cipher)
          setKey(k); setSalt(data.salt); setMem(obj); setIsNew(false); setState('open')
          toast('Entsperrt – nur auf diesem Gerät lesbar')
        } catch {
          setErr('Falsches Gedächtnis-Passwort.')
          setState('locked')
        }
      } else {
        const s = newSalt()
        const k = await deriveKey(pw, s)
        setKey(k); setSalt(s); setMem(EMPTY_MEMORY); setIsNew(true); setState('open')
        toast('Neues Gedächtnis angelegt – merk dir dieses Passwort gut!')
      }
      setPw('')
    } catch (e2) {
      setErr(e2.message)
      setState('locked')
    }
  }

  async function persist(next) {
    setMem(next)
    const { iv, cipher } = await encryptJson(key, next)
    const { error } = await supabase.from('nw_memory')
      .upsert({ user_id: session.user.id, salt, iv, cipher, updated_at: new Date().toISOString() })
    if (error) toast('Speichern fehlgeschlagen: ' + error.message)
  }

  function lock() {
    setKey(null); setMem(EMPTY_MEMORY); setSel(null); setState('locked'); setQ('')
    toast('Gesperrt 🔒')
  }

  if (state !== 'open') {
    return (
      <section className="screen">
        <h2 className="screen-title">Merkzeug</h2>
        <p className="screen-sub">Dein privates Gedächtnis – Ende-zu-Ende-verschlüsselt</p>
        <form className="card lockbox" onSubmit={unlock}>
          <div className="lock-ico">🔐</div>
          <h3>Nur du hast den Schlüssel</h3>
          <p>Entschlüsselt wird ausschließlich auf deinem Gerät. Es gibt kein „Passwort vergessen“ – das ist der Sinn der Sache.</p>
          {err && <div className="authmsg err" style={{ maxWidth: 320, margin: '0 auto 12px' }}>{err}</div>}
          <div className="pwrow">
            <input type="password" value={pw} onChange={(e) => setPw(e.target.value)} placeholder="Gedächtnis-Passwort" aria-label="Gedächtnis-Passwort" />
            <button className="btn" disabled={state === 'busy'}>{state === 'busy' ? '…' : 'Entsperren'}</button>
          </div>
          <div className="hint">Beim ersten Mal legst du mit deinem Passwort ein neues Gedächtnis an.</div>
        </form>
      </section>
    )
  }

  if (sel) {
    const p = mem.persons.find((x) => x.id === sel)
    if (!p) { setSel(null); return null }
    const upd = (patch) => {
      const next = { ...mem, persons: mem.persons.map((x) => (x.id === p.id ? { ...x, ...patch } : x)) }
      persist(next)
    }
    return (
      <section className="screen">
        <button className="btn ghost" style={{ margin: '12px 0 10px' }} onClick={() => setSel(null)}>‹ Zurück</button>
        <h2 className="screen-title serif">{p.name}</h2>
        <p className="screen-sub">{p.ctx || 'Woher kennt ihr euch?'}</p>
        <div className="card">
          {[['familie', 'Familie'], ['themen', 'Themen'], ['faden', 'Offener Faden']].map(([k, label]) => (
            <div className="fact" key={k}>
              <b>{label}</b>
              <input style={{ flex: 1, font: 'inherit', border: 0, background: 'none', color: 'inherit', outline: 'none' }}
                value={p[k] || ''} placeholder="…"
                onChange={(e) => upd({ [k]: e.target.value })} />
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
          <button className="btn danger sm" onClick={() => {
            persist({ ...mem, persons: mem.persons.filter((x) => x.id !== p.id) })
            setSel(null)
          }}>Person löschen</button>
        </p>
      </section>
    )
  }

  const ql = q.trim().toLowerCase()
  const hits = mem.persons.filter((p) =>
    !ql || [p.name, p.ctx, p.familie, p.themen, p.faden, (p.notizen || []).join(' ')].join(' ').toLowerCase().includes(ql))

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
            <li>Dein Gedächtnis-Passwort lässt sich <b>nicht zurücksetzen</b>. Schreib es auf und leg es sicher ab (z. B. Tresor).</li>
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
            const next = { ...mem, persons: [{ id: crypto.randomUUID(), name: addName.trim(), ctx: addCtx.trim(), notizen: [] }, ...mem.persons] }
            persist(next)
            setAddName(''); setAddCtx('')
            toast('Person angelegt ✓')
          }}>+</button>
        </div>
      </div>
    </section>
  )
}

function QuickAdd({ placeholder, onAdd }) {
  const [v, setV] = useState('')
  const submit = () => { if (v.trim()) { onAdd(v.trim()); setV('') } }
  return (
    <div className="quickadd">
      <input value={v} onChange={(e) => setV(e.target.value)} placeholder={placeholder}
        onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); submit() } }} />
      <button type="button" className="btn sm" onClick={submit}>+</button>
    </div>
  )
}

/* ================= Haupt-App ================= */

export default function App() {
  const [toast, toastEl] = useToast()
  const [session, setSession] = useState(undefined)
  const [me, setMe] = useState(undefined) // mein nw_members-Eintrag
  const [family, setFamily] = useState(null)
  const [members, setMembers] = useState([])
  const [events, setEvents] = useState([])
  const [items, setItems] = useState([])
  const [nav, setNav] = useState('heute')
  const [sheet, setSheet] = useState(null) // {event?, date}
  const [calCursor, setCalCursor] = useState(() => { const d = new Date(); return { y: d.getFullYear(), m: d.getMonth() } })
  const [selDate, setSelDate] = useState(iso(new Date()))
  const [filterWho, setFilterWho] = useState(null)
  const today = iso(new Date())

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setSession(data.session))
    const { data: sub } = supabase.auth.onAuthStateChange((_e, s) => setSession(s))
    return () => sub.subscription.unsubscribe()
  }, [])

  async function loadAll() {
    const [{ data: m }, { data: fam }, { data: evs }, { data: li }] = await Promise.all([
      supabase.from('nw_members').select('*').order('created_at'),
      supabase.from('nw_families').select('*').maybeSingle(),
      supabase.from('nw_events').select('*').order('on_date').order('at_time'),
      supabase.from('nw_list_items').select('*').order('created_at', { ascending: false }),
    ])
    setMembers(m || [])
    setFamily(fam || null)
    setEvents(evs || [])
    setItems(li || [])
    setMe((m || []).find((x) => x.user_id === session.user.id) || null)
  }

  useEffect(() => {
    if (!session) { setMe(undefined); return }
    loadAll()
  }, [session])

  if (session === undefined || (session && me === undefined)) {
    return <div className="loading">Nestwerk lädt …</div>
  }
  if (!session) return <><AuthScreen toast={toast} />{toastEl}</>
  if (!me) return <><Onboarding toast={toast} onDone={loadAll} />{toastEl}</>

  const byId = Object.fromEntries(members.map((m) => [m.id, m]))
  const mname = (id) => byId[id]?.name || '?'
  const mcolor = (id) => byId[id]?.color || '#888'
  const visible = filterWho ? events.filter((e) => e.member_id === filterWho) : events
  const eventsOn = (dateStr) => visible.filter((e) => e.on_date === dateStr)
  const invites = events.filter((e) => e.status === 'pending' && e.member_id === me.id)

  /* ---------- Aktionen ---------- */

  async function saveEvent(data) {
    if (sheet.event) {
      const { error } = await supabase.from('nw_events')
        .update({ title: data.title, member_id: data.member_id, on_date: data.on_date, at_time: data.at_time, meta: data.meta })
        .eq('id', sheet.event.id)
      if (error) { toast(error.message); return }
      toast('Gespeichert ✓')
    } else {
      const rows = data.serie
        ? Array.from({ length: 8 }, (_, k) => ({ ...data, on_date: addDays(data.on_date, k * 7), member_id: data.member_id }))
        : [data]
      const { data: inserted, error } = await supabase.from('nw_events').insert(
        rows.map((r) => ({ title: r.title, member_id: r.member_id, on_date: r.on_date, at_time: r.at_time, meta: r.meta, serie: data.serie }))
      ).select()
      if (error) { toast(error.message); return }
      const first = inserted?.[0]
      if (first?.status === 'pending') toast(`Anfrage an ${mname(data.member_id)} gesendet 📩 – muss erst zusagen`)
      else if (data.member_id !== me.id) toast(`Direkt eingetragen ✓ für ${mname(data.member_id)}`)
      else toast(data.serie ? 'Serientermin angelegt ↻ (8 Wochen)' : 'Termin angelegt ✓')
    }
    setSheet(null)
    loadAll()
  }

  async function deleteEvent() {
    const { error } = await supabase.from('nw_events').delete().eq('id', sheet.event.id)
    if (error) { toast(error.message); return }
    setSheet(null)
    toast('Termin gelöscht')
    loadAll()
  }

  async function answerInvite(ev, accept) {
    if (accept) {
      const { error } = await supabase.from('nw_events').update({ status: 'fix' }).eq('id', ev.id)
      if (error) { toast(error.message); return }
      toast('Zugesagt ✓ – steht jetzt fest im Familienkalender')
    } else {
      const { error } = await supabase.from('nw_events').delete().eq('id', ev.id)
      if (error) { toast(error.message); return }
      toast(`Abgelehnt – ${mname(ev.created_by)} sieht das im Kalender`)
    }
    loadAll()
  }

  async function addItem(list, text) {
    const { error } = await supabase.from('nw_list_items')
      .insert({ list, text, family_id: me.family_id, created_by: me.id })
    if (error) { toast(error.message); return }
    loadAll()
  }
  async function toggleItem(it) {
    await supabase.from('nw_list_items').update({ done: !it.done }).eq('id', it.id)
    loadAll()
  }
  async function deleteItem(it) {
    await supabase.from('nw_list_items').delete().eq('id', it.id)
    loadAll()
  }

  async function addKid(name, color) {
    const { error } = await supabase.from('nw_members')
      .insert({ family_id: me.family_id, name, color, kind: 'kid' })
    if (error) { toast(error.message); return }
    toast(`${name} ist dabei 🪺`)
    loadAll()
  }
  async function toggleDirect(m) {
    const { error } = await supabase.from('nw_members').update({ can_direct: !m.can_direct }).eq('id', m.id)
    if (error) { toast(error.message); return }
    toast(`${m.name} ${!m.can_direct ? 'darf jetzt direkt eintragen' : 'braucht jetzt Bestätigung'}`)
    loadAll()
  }

  /* ---------- Bausteine ---------- */

  const EventRow = ({ e, onClick }) => (
    <button className="row" onClick={onClick}>
      <span className="time">{hhmm(e.at_time)}</span>
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
    return list.length
      ? list.map((e) => <EventRow key={e.id} e={e} onClick={() => setSheet({ event: e })} />)
      : <div className="empty">Keine Termine – freier Tag 🎉</div>
  }

  /* ---------- Bildschirme ---------- */

  const screenHeute = (
    <section className="screen">
      <h2 className="screen-title">Hallo {me.name}! 🪺</h2>
      <p className="screen-sub">{fmtDate(today)} · {family?.name}</p>
      <div className="kpis">
        <div className="kpi accent"><div className="num">{events.filter((e) => e.on_date === today && e.status === 'fix').length}</div><div className="cap">Termine heute</div></div>
        <div className={'kpi' + (invites.length ? ' alert' : '')}><div className="num">{invites.length}</div><div className="cap">Anfragen an dich</div></div>
        <div className="kpi"><div className="num">{items.filter((i) => !i.done).length}</div><div className="cap">Offene Listenpunkte</div></div>
      </div>
      {invites.length > 0 && (
        <>
          <p className="label">📩 Anfragen an dich</p>
          <div className="card">
            {invites.map((e) => (
              <div className="row" key={e.id}>
                <span className="time">{fmtShort(e.on_date)} {hhmm(e.at_time)}</span>
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
        <button className="btn ghost sm" onClick={() => setCalCursor(({ y, m }) => (m ? { y, m: m - 1 } : { y: y - 1, m: 11 }))}>‹</button>
        <b style={{ minWidth: 140, textAlign: 'center' }}>{MONTHS[cal.m]} {cal.y}</b>
        <button className="btn ghost sm" onClick={() => setCalCursor(({ y, m }) => (m < 11 ? { y, m: m + 1 } : { y: y + 1, m: 0 }))}>›</button>
        <span style={{ flex: 1 }} />
        <div className="legend" style={{ margin: 0 }}>
          {members.map((mm) => (
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
        {items.filter((i) => i.list === list).map((it) => (
          <div className="row" key={it.id}>
            <input type="checkbox" className="check" checked={it.done} onChange={() => toggleItem(it)} aria-label={it.text} />
            <div className="row-main">
              <div className={'row-title' + (it.done ? ' done-text' : '')} style={{ fontWeight: 500 }}>{it.text}</div>
              <div className="row-meta">von {mname(it.created_by)}</div>
            </div>
            <button className="xdel" onClick={() => deleteItem(it)} aria-label="Eintrag löschen">✕</button>
          </div>
        ))}
        {!items.filter((i) => i.list === list).length && <div className="empty">Alles erledigt 🎉</div>}
        <QuickAdd placeholder={ph} onAdd={(v) => addItem(list, v)} />
      </div>
    </div>
  )

  const screenListen = (
    <section className="screen">
      <h2 className="screen-title">Familienlisten</h2>
      <p className="screen-sub">Für alle. Eintippen, fertig.</p>
      <div className="cols two">
        {listCard('einkauf', '🛒 Einkaufen', 'Was fehlt? (Enter)')}
        {listCard('todo', '✅ Zu erledigen', 'Was ist zu tun? (Enter)')}
      </div>
    </section>
  )

  const screenFamilie = (
    <section className="screen">
      <h2 className="screen-title">{family?.name}</h2>
      <p className="screen-sub">Mitglieder, Rechte und Einladung</p>
      <p className="label">Mitglieder</p>
      <div className="card">
        {members.map((m) => (
          <div className="row" key={m.id}>
            <span className="avatar member" style={{ background: m.color }}>{m.name[0].toUpperCase()}</span>
            <div className="row-main">
              <div className="row-title">{m.name}{m.id === me.id ? ' (du)' : ''}</div>
              <div className="row-meta">
                {m.kind === 'kid' ? 'Kind · ohne eigenen Login' : m.is_admin ? 'Erwachsen · Familien-Admin' : 'Erwachsen'}
                {m.kind !== 'kid' && (m.can_direct ? ' · trägt direkt ein' : ' · braucht Bestätigung')}
              </div>
            </div>
            {me.is_admin && m.kind !== 'kid' && (
              <button className={'btn sm ' + (m.can_direct ? 'ghost' : '')} onClick={() => toggleDirect(m)}>
                {m.can_direct ? 'direkt ✓' : 'Anfrage'}
              </button>
            )}
          </div>
        ))}
        {me.is_admin && <AddKid onAdd={addKid} />}
      </div>
      {me.is_admin && family && (
        <>
          <p className="label">Einladung</p>
          <div className="card">
            <div className="row">
              <span style={{ fontSize: 20 }}>✉️</span>
              <div className="row-main">
                <div className="row-title">Einladungscode: <code>{family.invite_code}</code></div>
                <div className="row-meta">Weitergeben an Erwachsene – beim Registrieren „Mit Code beitreten“ wählen.</div>
              </div>
              <button className="btn ghost sm" onClick={() => { navigator.clipboard?.writeText(family.invite_code); toast('Code kopiert ✓') }}>Kopieren</button>
            </div>
          </div>
        </>
      )}
      <p className="label">Konto</p>
      <div className="card">
        <div className="row">
          <span style={{ fontSize: 20 }}>👤</span>
          <div className="row-main">
            <div className="row-title">{session.user.email}</div>
            <div className="row-meta">Dein Login – das Merkzeug hat zusätzlich sein eigenes Passwort.</div>
          </div>
          <button className="btn ghost sm" onClick={() => supabase.auth.signOut()}>Abmelden</button>
        </div>
      </div>
    </section>
  )

  const NAVS = [
    ['heute', '🪺', 'Heute', invites.length],
    ['kalender', '📅', 'Kalender', 0],
    ['listen', '🛒', 'Listen', 0],
    ['merkzeug', '🔐', 'Merkzeug', 0],
    ['familie', '👨‍👩‍👧‍👦', 'Familie', 0],
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
        <div className="demonote">{family?.name} · {members.length} Mitglieder</div>
      </aside>
      <div className="mainwrap">
        <header className="topbar">
          <h1 className="wordmark serif"><span className="nest">Nest</span>werk</h1>
          <span className="sp" />
          <button className="userchip" onClick={() => setNav('familie')}>
            <span className="avatar sm member" style={{ background: me.color }}>{me.name[0].toUpperCase()}</span>
            {me.name}
          </button>
        </header>
        <main>
          {nav === 'heute' && screenHeute}
          {nav === 'kalender' && screenKalender}
          {nav === 'listen' && screenListen}
          {nav === 'merkzeug' && <Merkzeug session={session} toast={toast} />}
          {nav === 'familie' && screenFamilie}
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
        <EventSheet initial={sheet} members={members} me={me}
          onSave={saveEvent} onDelete={deleteEvent} onClose={() => setSheet(null)} />
      )}
      {toastEl}
    </div>
  )
}

function AddKid({ onAdd }) {
  const [name, setName] = useState('')
  const [color, setColor] = useState(COLORS[3])
  return (
    <div className="quickadd">
      <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Kind hinzufügen: Vorname" aria-label="Kind hinzufügen" />
      <select value={color} onChange={(e) => setColor(e.target.value)} aria-label="Farbe" style={{ font: 'inherit', borderRadius: 10, border: '1px solid var(--hairline)', background: color, width: 44 }}>
        {COLORS.map((c) => <option key={c} value={c} style={{ background: c }}>&nbsp;</option>)}
      </select>
      <button type="button" className="btn sm" onClick={() => { if (name.trim()) { onAdd(name.trim(), color); setName('') } }}>+</button>
    </div>
  )
}
