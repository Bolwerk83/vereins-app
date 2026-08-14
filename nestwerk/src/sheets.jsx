// Alle Formulare, Sheets und Assistent-Wizards
import React, { useEffect, useRef, useState } from 'react'
import { WD, WD_LONG, MONTHS, COLORS, iso, fromIso, wdIdx, fmtDate, fmtShort, addDays, mins, uid, gebInfo } from './util.js'
import { Icon, RowIcon, LogoMark } from './icons.jsx'
import { PTYPES, MODULES, hasMod, VORLAGEN, fillVorlage } from './domain.js'
import { fetchVereinData, teamInfo } from './verein.js'

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

export { EventSheet, MemberSheet, CareSheet, KlientSheet, PTerminSheet, VorlageSheet, VereinSheet, BlitzSheet, BlitzListe, GebForm, WaTemplateRow, SerieWizard, IstWizard, SportPlanForm, ImportRow, WA_DEFAULT }
