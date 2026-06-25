// =========================================================================
//  BERICHT-FREIGABE (Admin) — je Bericht den Status setzen (Aktiv / Test /
//  Deaktiviert) und für „Test" einzelne Testuser freigeben. Deaktivierte
//  Berichte sind für normale Nutzer unsichtbar, Test-Berichte nur für die
//  freigegebenen Testuser (und den Admin).
// =========================================================================
import React, { useState } from 'react'
import { NAV_ZIELE } from '../../core/suche.js'
import { useT } from '../../core/i18n.jsx'
import { ladeGruppen } from '../../core/gruppen.js'
import { nutzerId, nutzerLabel } from '../../core/identitaet.js'
import { STATUS, STATUS_LISTE, statusVon, setzeStatus, testuserVon, testuserToggle } from '../../core/berichtStatus.js'
import { berichtsOrdner, rolleViews, rolleToggle, rolleSetzeOrdner, userViews, userToggle, userSetzeOrdner } from '../../core/berichtRechte.js'

const card = { background: 'var(--panel)', border: '1px solid var(--line)', borderRadius: 'var(--radius)', boxShadow: 'var(--shadow)' }
const cap = { fontSize: 11, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '.04em', fontWeight: 700 }
// System-/Admin-Ansichten, die nicht freigegeben/gesperrt werden sollen.
const AUSNAHME = new Set(['wizard', 'admin', 'nutzung', 'rechte', 'berichtfreigabe', 'transport', 'verteiler', 'abschluss'])

function alleNutzer() {
  const set = new Set()
  try { for (const g of ladeGruppen()) for (const m of (g.mitglieder || [])) set.add(m) } catch {}
  return [...set]
}

function Testuser({ view, onChange }) {
  const [neu, setNeu] = useState('')
  const freigegeben = testuserVon(view) // uids
  const kandidaten = alleNutzer()
  const add = (name) => { const n = name.trim(); if (!n) return; testuserToggle(view, nutzerId(n)); setNeu(''); onChange() }
  return (
    <div style={{ marginTop: 8, padding: 10, border: '1px dashed var(--amp-a)', borderRadius: 'var(--radius-sm)', background: 'var(--amp-a-soft)' }}>
      <div style={{ ...cap, marginBottom: 6 }}>🧪 Freigegebene Testuser ({freigegeben.length})</div>
      {freigegeben.length > 0 && (
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 8 }}>
          {freigegeben.map((uid) => (
            <span key={uid} style={{ fontSize: 12, background: 'var(--panel)', border: '1px solid var(--line)', borderRadius: 999, padding: '2px 4px 2px 10px', display: 'inline-flex', alignItems: 'center', gap: 6 }}>
              {nutzerLabel(uid)}
              <button onClick={() => { testuserToggle(view, uid); onChange() }} title="entfernen" style={{ border: 'none', background: 'none', cursor: 'pointer', color: 'var(--muted)', fontSize: 14, lineHeight: 1 }}>×</button>
            </span>
          ))}
        </div>
      )}
      {kandidaten.length > 0 && (
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 8 }}>
          {kandidaten.filter((n) => !freigegeben.includes(nutzerId(n))).map((n) => (
            <button key={n} onClick={() => add(n)} style={{ fontSize: 11.5, cursor: 'pointer', border: '1px solid var(--line)', background: 'var(--panel)', borderRadius: 999, padding: '2px 9px' }}>+ {n}</button>
          ))}
        </div>
      )}
      <div style={{ display: 'flex', gap: 6 }}>
        <input value={neu} onChange={(e) => setNeu(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && add(neu)} placeholder="Testuser per Name freigeben …"
          style={{ flex: 1, font: 'inherit', fontSize: 12.5, padding: '5px 9px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--line)' }} />
        <button onClick={() => add(neu)} disabled={!neu.trim()} style={{ fontSize: 12.5, padding: '5px 12px', borderRadius: 'var(--radius-sm)', border: 'none', background: neu.trim() ? 'var(--accent)' : 'var(--line)', color: '#fff', cursor: neu.trim() ? 'pointer' : 'not-allowed', fontWeight: 600 }}>Freigeben</button>
      </div>
    </div>
  )
}

// --- Freigabe je Rolle / je Kollege (additiv zur Bereichslogik) -----------
function FreigabePanel({ t }) {
  const [, setTick] = useState(0); const refresh = () => setTick((x) => x + 1)
  const [modus, setModus] = useState('rolle') // 'rolle' | 'kollege'
  const gruppen = ladeGruppen()
  const [rolleId, setRolleId] = useState(gruppen.find((g) => g.id !== 'g-leser')?.id || gruppen[0]?.id)
  const [name, setName] = useState('')
  const ordner = berichtsOrdner()
  const istKollege = modus === 'kollege'
  const uid = istKollege && name.trim() ? nutzerId(name.trim()) : null
  const ziel = istKollege ? (uid ? `Kollege „${name.trim()}"` : null) : (gruppen.find((g) => g.id === rolleId)?.name || '')
  const aktiv = istKollege ? (uid ? userViews(uid) : new Set()) : rolleViews(rolleId)
  const bereit = istKollege ? !!uid : !!rolleId
  const toggleEinzel = (v) => { if (!bereit) return; istKollege ? userToggle(uid, v) : rolleToggle(rolleId, v); refresh() }
  const toggleOrdner = (views, an) => { if (!bereit) return; istKollege ? userSetzeOrdner(uid, views, an) : rolleSetzeOrdner(rolleId, views, an); refresh() }
  const kandidaten = alleNutzer()

  return (
    <div>
      <div style={{ ...card, padding: 14, marginBottom: 14, borderLeft: '3px solid var(--accent)' }}>
        <div style={{ fontSize: 13.5, lineHeight: 1.5, marginBottom: 10 }}>
          <b>Zusätzliche</b> Berichts-Freigabe — erweitert die Sicht über die Rollen-Bereiche hinaus. Ganze <b>Ordner</b> oder <b>einzelne Berichte</b> freigeben, je <b>Rolle</b> oder je <b>Kollege</b>.
        </div>
        <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', border: '1px solid var(--line)', borderRadius: 'var(--radius-sm)', overflow: 'hidden' }}>
            {[['rolle', '👥 Je Rolle'], ['kollege', '👤 Je Kollege']].map(([id, lbl]) => (
              <button key={id} onClick={() => setModus(id)} style={{ padding: '6px 13px', border: 'none', fontSize: 12.5, fontWeight: 600, cursor: 'pointer', background: modus === id ? 'var(--accent)' : 'var(--panel)', color: modus === id ? '#fff' : 'var(--muted)' }}>{lbl}</button>
            ))}
          </div>
          {!istKollege
            ? <select value={rolleId} onChange={(e) => setRolleId(e.target.value)} style={{ font: 'inherit', fontSize: 13, padding: '6px 9px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--line)' }}>{gruppen.map((g) => <option key={g.id} value={g.id}>{g.name}</option>)}</select>
            : <input list="er-kollegen" value={name} onChange={(e) => setName(e.target.value)} placeholder="Kollege (Name) …" style={{ font: 'inherit', fontSize: 13, padding: '6px 9px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--line)', minWidth: 180 }} />}
          {istKollege && <datalist id="er-kollegen">{kandidaten.map((n) => <option key={n} value={n} />)}</datalist>}
          <span style={{ fontSize: 12, color: 'var(--muted)' }}>{bereit ? `${aktiv.size} Berichte zusätzlich frei für ${ziel}` : 'Bitte Kollegen eingeben'}</span>
        </div>
      </div>

      <div style={{ display: 'grid', gap: 12, opacity: bereit ? 1 : 0.5 }}>
        {ordner.map((o) => {
          const views = o.berichte.map((b) => b.view)
          const frei = views.filter((v) => aktiv.has(v)).length
          const alle = frei === views.length
          return (
            <div key={o.id} style={{ ...card, padding: 0, overflow: 'hidden' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '9px 13px', background: 'var(--bg)', borderBottom: '1px solid var(--line)' }}>
                <span style={{ fontWeight: 700, flex: 1 }}>📁 {o.name} <span style={{ fontWeight: 400, color: 'var(--muted)', fontSize: 12 }}>· {frei}/{views.length} frei</span></span>
                <button onClick={() => toggleOrdner(views, !alle)} disabled={!bereit}
                  style={{ padding: '5px 12px', borderRadius: 'var(--radius-sm)', border: `1px solid ${alle ? 'var(--amp-g)' : 'var(--accent)'}`, background: alle ? 'var(--amp-g)' : 'var(--panel)', color: alle ? '#fff' : 'var(--accent)', fontSize: 12, fontWeight: 600, cursor: bereit ? 'pointer' : 'not-allowed' }}>
                  {alle ? '✓ ganzer Ordner frei' : 'ganzen Ordner freigeben'}</button>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(230px, 1fr))', gap: 2, padding: 8 }}>
                {o.berichte.map((b) => {
                  const an = aktiv.has(b.view)
                  return (
                    <label key={b.view} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '5px 8px', borderRadius: 'var(--radius-sm)', cursor: bereit ? 'pointer' : 'not-allowed', background: an ? 'var(--amp-g-soft)' : 'transparent', fontSize: 13 }}>
                      <input type="checkbox" checked={an} disabled={!bereit} onChange={() => toggleEinzel(b.view)} />
                      {t(b.schluessel)}
                    </label>
                  )
                })}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default function Berichtfreigabe({ istAdmin }) {
  const { t } = useT()
  const [, setTick] = useState(0)
  const [q, setQ] = useState('')
  const [tab, setTab] = useState('status') // 'status' | 'freigabe'
  const refresh = () => setTick((x) => x + 1)
  if (!istAdmin) return <div style={{ padding: 24, color: 'var(--muted)' }}>Nur für Administratoren.</div>

  const ziele = NAV_ZIELE.filter((z) => !AUSNAHME.has(z.ziel))
  const gefiltert = ziele.filter((z) => t(z.schluessel).toLowerCase().includes(q.toLowerCase()))
  const gruppen = [...new Set(gefiltert.map((z) => z.gruppe))]
  const zaehlung = STATUS_LISTE.map((s) => ({ ...s, n: ziele.filter((z) => statusVon(z.ziel) === s.id).length }))

  return (
    <div style={{ maxWidth: '100%', margin: '0 auto' }}>
      <div style={{ marginBottom: 12 }}>
        <div style={cap}>Administration · Sichtbarkeit der Berichte</div>
        <h2 style={{ margin: '4px 0 0' }}>Bericht-Freigabe</h2>
      </div>

      <div style={{ display: 'flex', border: '1px solid var(--line)', borderRadius: 'var(--radius-sm)', overflow: 'hidden', width: 'fit-content', marginBottom: 14 }}>
        {[['status', '🧪 Status & Test'], ['freigabe', '🔓 Rollen & Kollegen']].map(([id, lbl]) => (
          <button key={id} onClick={() => setTab(id)} style={{ padding: '7px 15px', border: 'none', fontSize: 13, fontWeight: 600, cursor: 'pointer', background: tab === id ? 'var(--accent)' : 'var(--panel)', color: tab === id ? '#fff' : 'var(--muted)' }}>{lbl}</button>
        ))}
      </div>

      {tab === 'freigabe' && <FreigabePanel t={t} />}
      {tab === 'status' && <>
      <div style={{ ...card, padding: 14, marginBottom: 14, borderLeft: '3px solid var(--accent)' }}>
        <div style={{ fontSize: 13.5, lineHeight: 1.5 }}>
          Je Bericht den Status setzen: <b>Aktiv</b> (für alle sichtbar), <b>Test</b> (nur Admin + freigegebene Testuser)
          oder <b>Deaktiviert</b> (für normale Nutzer ausgeblendet). Änderungen wirken sofort auf Menü & Suche.
        </div>
        <div style={{ display: 'flex', gap: 14, marginTop: 10, flexWrap: 'wrap' }}>
          {zaehlung.map((s) => <span key={s.id} style={{ fontSize: 13, color: s.farbe, fontWeight: 700 }}>{s.icon} {s.n} {s.name}</span>)}
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Bericht suchen …"
            style={{ marginLeft: 'auto', font: 'inherit', fontSize: 12.5, padding: '5px 10px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--line)', minWidth: 180 }} />
        </div>
      </div>

      {gruppen.map((g) => (
        <div key={g} style={{ marginBottom: 16 }}>
          <div style={{ ...cap, marginBottom: 6 }}>{g}</div>
          <div style={{ display: 'grid', gap: 8 }}>
            {gefiltert.filter((z) => z.gruppe === g).map((z) => {
              const st = statusVon(z.ziel)
              return (
                <div key={z.ziel} style={{ ...card, padding: '10px 14px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
                    <span style={{ fontWeight: 600, flex: 1, minWidth: 160 }}>{t(z.schluessel)}</span>
                    <div style={{ display: 'flex', border: '1px solid var(--line)', borderRadius: 'var(--radius-sm)', overflow: 'hidden' }}>
                      {STATUS_LISTE.map((s) => (
                        <button key={s.id} onClick={() => { setzeStatus(z.ziel, s.id); refresh() }}
                          style={{ padding: '5px 11px', border: 'none', fontSize: 12, fontWeight: 600, cursor: 'pointer',
                            background: st === s.id ? s.farbe : 'var(--panel)', color: st === s.id ? '#fff' : 'var(--muted)' }}>{s.icon} {s.name}</button>
                      ))}
                    </div>
                  </div>
                  {st === STATUS.TEST && <Testuser view={z.ziel} onChange={refresh} />}
                </div>
              )
            })}
          </div>
        </div>
      ))}
      </>}
    </div>
  )
}
