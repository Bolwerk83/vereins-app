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

export default function Berichtfreigabe({ istAdmin }) {
  const { t } = useT()
  const [, setTick] = useState(0)
  const [q, setQ] = useState('')
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
    </div>
  )
}
