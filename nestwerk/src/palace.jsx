// Gedächtnispalast: Ende-zu-Ende-verschlüsseltes zweites Gedächtnis
import React, { useEffect, useRef, useState } from 'react'
import { newSalt, deriveKey, encryptJson, decryptJson, encryptBytes, unb64 } from './crypto.js'
import { uid, gebInfo, iso, addDays } from './util.js'
import { Icon, RowIcon } from './icons.jsx'
import { QuickAdd } from './ui.jsx'
import { norm, normMap } from './search.js'
import { Ablage, docTitle, docDate, ordnerName, artName, deDate } from './ablage.jsx'
import { putFile, delFile, filesWork } from './docstore.js'

/* ================= Gedächtnispalast (E2E-verschlüsselt, lokal) ================= */

const GROUPS = ['Familie', 'Freunde', 'Nachbarn', 'Verein', 'Arbeit', 'Schule & Kita', 'Sonstige']


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

// Für die große Suche: nur aufrufbar, solange der Palast entsperrt ist
function palaceSearch(mem, query) {
  const words = norm(query).split(/[^a-z0-9]+/).filter((w) => w.length >= 2)
  if (!words.length) return []
  const hit = (text) => { const n = norm(text); return words.every((w) => n.includes(w)) }
  const hl = (text) => {
    const { text: n, map } = normMap(text)
    const r = []
    for (const w of words) { const i = n.indexOf(w); if (i >= 0) r.push([map[i], map[i + w.length - 1] + 1]) }
    return r.sort((a, b) => a[0] - b[0])
  }
  const out = []
  for (const p of mem.persons || []) {
    const hay = [p.name, p.ctx, p.firma, p.gruppe, p.themen, p.familie, p.faden, p.kennengelernt, (p.notizen || []).join(' ')].join(' ')
    if (hit(hay)) out.push({ key: 'pp:' + p.id, kind: 'palace', icon: 'user', title: p.name || 'Person', hl: { title: hl(p.name || '') }, sub: [p.ctx, p.firma, p.gruppe].filter(Boolean).join(' · ') || 'Person im Gedächtnispalast', act: { type: 'palaceHit', ref: { type: 'person', id: p.id } } })
  }
  for (const s of mem.sections || []) {
    for (const pg of s.pages || []) {
      if (hit((pg.title || '') + ' ' + (pg.text || ''))) out.push({ key: 'pg:' + pg.id, kind: 'palace', icon: 'file', title: pg.title || 'Unbenannte Seite', hl: { title: hl(pg.title || '') }, sub: `Seite in „${s.name}“`, act: { type: 'palaceHit', ref: { type: 'page', sid: s.id, pid: pg.id } } })
    }
  }
  for (const d of mem.docs || []) {
    if (d.deleted || !hit(docHay(d))) continue
    out.push({ key: 'pd:' + d.id, kind: 'palace', icon: 'archive', title: docTitle(d), hl: { title: hl(docTitle(d)) }, sub: docSub(d), act: { type: 'palaceHit', ref: { type: 'doc', id: d.id } } })
  }
  return out.slice(0, 8)
}

// Wonach man ein Dokument findet: Titel, Datei, Ordner, Notiz – und „Steuer 2026“
const docHay = (d) => [docTitle(d), d.name, ordnerName(d.ordner), d.notiz, d.steuer ? `steuer steuerrelevant ${d.steuerJahr} ${artName(d.steuerArt)}` : ''].join(' ')
const docSub = (d) => ['Dokument', ordnerName(d.ordner), deDate(docDate(d)), d.steuer ? `Steuer ${d.steuerJahr}` : null].filter(Boolean).join(' · ')

// Beim Entsperren: alte, im Palast eingebettete Dateien in die Browser-Datenbank
// umziehen (verschlüsselt) und Papierkorb-Einträge nach 30 Tagen endgültig löschen
async function tidyDocs(key, docs) {
  let changed = false
  const limit = addDays(iso(new Date()), -30)
  const out = []
  const idb = docs.some((d) => d.b64) ? await filesWork() : false
  for (const d of docs) {
    if (d.deleted && d.deleted < limit) { changed = true; delFile(d.id).catch(() => {}); continue }
    if (d.b64 && idb) {
      try {
        await putFile(d.id, await encryptBytes(key, unb64(d.b64)))
        const moved = { ...d, stored: 'idb' }
        delete moved.b64
        out.push(moved)
        changed = true
        continue
      } catch { /* bleibt eingebettet, nichts geht verloren */ }
    }
    out.push(d)
  }
  return changed ? out : null
}

function Merkzeug({ blob, onSaveBlob, ownerName, toast, inbox = [], initialQuery, onQueryUsed, onProvider, startSec, onSecUsed }) {
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
  const flushTimer = useRef()
  const pendingMem = useRef(null)
  const [addName, setAddName] = useState('')
  const [addCtx, setAddCtx] = useState('')
  const memRef = useRef(mem)
  memRef.current = mem
  const saveSeq = useRef(0)

  // Suchbegriff aus der großen Suche übernehmen, sobald der Palast offen ist
  useEffect(() => {
    if (state === 'open' && initialQuery) { setQ(initialQuery); if (onQueryUsed) onQueryUsed() }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state, initialQuery])

  // Direkt in einen Bereich springen (z. B. „Dokumente & Steuerordner“ aus der Suche)
  useEffect(() => {
    if (state === 'open' && startSec) { setSel(null); setSec(startSec); setPageId(null); if (onSecUsed) onSecUsed() }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state, startSec])

  // Solange entsperrt, darf die große Suche hier mitsuchen – beim Sperren ist das sofort vorbei
  useEffect(() => {
    if (state !== 'open' || !onProvider) return undefined
    onProvider({
      search: (query) => palaceSearch(memRef.current, query),
      open: (ref) => {
        setQ('')
        if (ref.type === 'person') setSel(ref.id)
        else if (ref.type === 'page') { setSel(null); setSec(ref.sid); setPageId(ref.pid); setPageMode('view') }
        else if (ref.type === 'doc') { setSel(null); setSec('_dokumente'); setDocSel(ref.id) }
      },
    })
    return () => onProvider(null)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state])

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
          const tidied = await tidyDocs(k, merged.docs)
          if (tidied) merged = { ...merged, docs: tidied }
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
          }
          if (inbox.length || tidied) {
            const enc2 = await encryptJson(k, merged)
            onSaveBlob({ salt: blob.salt, ...enc2 }, inbox.length ? { clearInbox: true } : undefined)
            if (inbox.length) toast(`⚡ ${inbox.length} Blitzzettel verschlüsselt in den Eingang übernommen`)
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

  // Nur der neueste Stand wird gespeichert – zwei Verschlüsselungen, die sich
  // überholen, dürfen keinen älteren Stand zurückschreiben
  async function persist(next) {
    setMem(next)
    memRef.current = next
    const seq = ++saveSeq.current
    const enc = await encryptJson(key, next)
    if (seq !== saveSeq.current) return
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
    toast('Gesperrt – ohne Passwort unlesbar')
  }

  // Ablage ändert ihre Dokumentenliste immer über den neuesten Stand –
  // auch wenn gerade noch Tipp-Änderungen auf ihre Speicherung warten
  function changeDocs(fn) {
    const base = pendingMem.current || memRef.current
    pendingMem.current = null
    clearTimeout(flushTimer.current)
    const next = { ...base, docs: fn(base.docs || []) }
    memRef.current = next
    persist(next)
  }

  if (state !== 'open') {
    return (
      <section className="screen">
        <h2 className="screen-title">Gedächtnispalast</h2>
        <p className="screen-sub">{ownerName}s privates Gedächtnis – Ende-zu-Ende-verschlüsselt</p>
        <form className="card lockbox" onSubmit={unlock}>
          <div className="lock-ico"><Icon name="key" size={30} /></div>
          <h3>Nur du hast den Schlüssel</h3>
          <p>Entschlüsselt wird ausschließlich auf diesem Gerät. Es gibt kein „Passwort vergessen“ – das ist der Sinn der Sache.</p>
          {err && <div className="authmsg err" style={{ maxWidth: 320, margin: '0 auto 12px' }}>{err}</div>}
          <div className="pwrow">
            <input type="password" value={pw} onChange={(e) => setPw(e.target.value)} placeholder="Gedächtnis-Passwort" aria-label="Gedächtnis-Passwort" />
            <button className="btn" disabled={state === 'busy'}>{state === 'busy' ? '…' : 'Entsperren'}</button>
          </div>
          <div className="hint">{blob ? 'Gib dein Gedächtnis-Passwort ein.' : 'Beim ersten Mal legst du mit deinem Passwort ein neues Gedächtnis an.'}</div>
          {initialQuery && <div className="hint">Danach suche ich hier nach „{initialQuery}“.</div>}
          {startSec === '_dokumente' && !initialQuery && <div className="hint">Danach geht es direkt zu deinen Dokumenten.</div>}
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
    docs: (mem.docs || []).filter((d) => !d.deleted && norm(docHay(d)).includes(norm(ql))),
  } : null
  const docCount = (mem.docs || []).filter((d) => !d.deleted).length

  return (
    <section className="screen">
      <div className="title-row">
        <div>
          <h2 className="screen-title">Gedächtnispalast</h2>
          <p className="screen-sub">{mem.persons.length} Personen · {sections.reduce((a, s) => a + s.pages.length, 0)} Seiten · {docCount} Dokumente · alles verschlüsselt</p>
        </div>
        <button className="btn ghost sm" onClick={lock}><Icon name="lock" size={15} />Sperren</button>
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
              <RowIcon name={d.steuer ? 'steuer' : 'file'} />
              <div className="row-main"><div className="row-title">{docTitle(d)}</div><div className="row-meta">{docSub(d)}</div></div>
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
            <span className="osec-bar" style={{ background: '#3D7BFF' }} /><Icon name="file" size={15} /> Dokumente<span className="osec-cnt">{docCount}</span>
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
          <Ablage docs={mem.docs || []} cryptoKey={key} onDocsChange={changeDocs} toast={toast} ownerName={ownerName}
            openId={docSel} setOpenId={setDocSel} />
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
    </section>
  )
}

export { Merkzeug, PersonAvatar, GROUPS }
