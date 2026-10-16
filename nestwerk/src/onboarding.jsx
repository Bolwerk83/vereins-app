import React, { useState } from 'react'
import { COLORS, iso, fromIso, wdIdx, addDays, uid } from './util.js'
import { LogoMark, Icon } from './icons.jsx'

/* Linke Spalte der Startseite: was Eselsohr ist, in vier Sätzen */
function Pitch() {
  return (
    <div className="auth-pitch">
      <div className="brand" style={{ cursor: 'default' }}><LogoMark size={44} /><span className="brand-word" style={{ fontSize: 28 }}>Esels<em>ohr</em></span></div>
      <h1>Der Familienplaner, der mitdenkt.</h1>
      <p>Eine Spalte pro Person, ein Feld für alle Fragen – und ein Gedächtnis, das nur dir gehört.</p>
      <ul className="auth-points">
        <li><span><Icon name="search" size={19} /></span><span>Frag einfach: „Wo ist Emma gerade?“ oder trag ein: „Ben Dienstag 17 Uhr Fußball“.</span></li>
        <li><span><Icon name="hand" size={19} /></span><span>Wer bringt, wer holt? Für alle sichtbar und fair verteilt.</span></li>
        <li><span><Icon name="calendar" size={19} /></span><span>Gemeinsamer Kalender mit Anfragen wie im Büro – Feiertage und Kalenderwochen inklusive.</span></li>
        <li><span><Icon name="lock" size={19} /></span><span>Gedächtnispalast mit eigenem Passwort, Ende-zu-Ende-verschlüsselt.</span></li>
      </ul>
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
      <div className="auth-wrap split">
        <Pitch />
        <form className="auth-card" onSubmit={async (e) => {
          e.preventDefault()
          if (!joinCode.trim() || joinBusy) return
          setJoinBusy(true); setJoinErr(null)
          try { await onJoin(joinCode) } catch (err) { setJoinErr(err.message); setJoinBusy(false) }
        }}>
          <h1>Familie beitreten</h1>
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
    <div className="auth-wrap split">
      <Pitch />
      <form className="auth-card" onSubmit={(e) => { e.preventDefault(); if (famName.trim() && myName.trim()) onCreate(famName.trim(), myName.trim(), color) }}>
        <h1>Loslegen</h1>
        <p className="sub">Startklar in 20 Sekunden – ganz ohne Konto.</p>
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
        <button type="button" className="btn ghost" style={{ width: '100%', marginTop: 8 }} onClick={() => setJoinOpen(true)}><Icon name="cloud" size={16} />Familie beitreten (mit Sync-Code)</button>
        <button type="button" className="btn ghost" style={{ width: '100%', marginTop: 8 }} onClick={onDemo}>Erst mal die Demo ansehen</button>
        <p className="hint">Alles bleibt auf diesem Gerät. Die Demo füllt Eselsohr mit einer Beispielfamilie – beenden geht jederzeit unter „Familie“.</p>
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
        <h1>Wer bist du?</h1>
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

export { Onboarding, demoData, ProfilePicker }
