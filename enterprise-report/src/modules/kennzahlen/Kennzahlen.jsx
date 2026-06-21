// =========================================================================
//  KENNZAHLEN-GLOSSAR — alle Definitionen an einem Ort, nach Bereich sortiert.
//  Respektiert Rechte: vertrauliche Kennzahlen ohne Berechtigung sind als
//  gesperrt markiert. ⓘ öffnet den vollständigen Steckbruck (Definition).
// =========================================================================
import React, { useState } from 'react'
import { KPI } from '../../core/kpiRegistry.js'
import { darfKpi } from '../../core/rbac.js'
import { istAdmin } from '../../core/gruppen.js'
import { formatWert } from '../../design/theme.js'
import { useKpiDef } from './KpiDefContext.jsx'
import { EINHEITEN, RICHTUNGEN, setKpiOverride, resetKpiOverride, istUeberschrieben, kpiFelder } from '../../core/kpiOverrides.js'

export default function Kennzahlen({ rolle, werte = {} }) {
  const def = useKpiDef()
  const [suche, setSuche] = useState('')
  const [editId, setEditId] = useState(null)
  const [form, setForm] = useState(null)
  const [, setTick] = useState(0)
  const darfEditieren = istAdmin(rolle)
  const s = suche.trim().toLowerCase()

  function starteEdit(id) { setEditId(id); setForm(kpiFelder(id)) }
  function speichereEdit() {
    setKpiOverride(editId, {
      name: form.name, einheit: form.einheit, richtung: form.richtung,
      beschreibung: form.beschreibung, ziel: form.ziel === '' ? null : Number(form.ziel)
    })
    setEditId(null); setTick((t) => t + 1)
  }
  function zuruecksetzen(id) { resetKpiOverride(id); setEditId(null); setTick((t) => t + 1) }

  const liste = Object.values(KPI).filter((k) => !s || k.name.toLowerCase().includes(s) || (k.beschreibung || '').toLowerCase().includes(s))
  const bereiche = [...new Set(liste.map((k) => k.bereich))]

  const card = { background: 'var(--panel)', border: '1px solid var(--line)', borderRadius: 'var(--radius)', boxShadow: 'var(--shadow)' }
  const lbl = { fontSize: 11, color: 'var(--muted)' }
  const fInp = { padding: '6px 8px', border: '1px solid var(--line)', borderRadius: 'var(--radius-sm)', font: 'inherit', fontSize: 13, marginTop: 2 }

  return (
    <div>
      <div style={{ marginBottom: 14 }}>
        <h2 style={{ margin: '0 0 4px' }}>Kennzahlen-Definitionen</h2>
        <div style={{ color: 'var(--muted)', fontSize: 13 }}>
          Nachschlagewerk aller Kennzahlen: Bedeutung, Formel, Ziel- und Ampel-Logik, Datenquelle.
          Über das <b>ⓘ</b> (auch direkt an jeder Kennzahl im Bericht) öffnest du den vollständigen Steckbrief.
        </div>
        <input value={suche} onChange={(e) => setSuche(e.target.value)} placeholder="Kennzahl suchen …"
          style={{ marginTop: 10, padding: '8px 11px', border: '1px solid var(--line)', borderRadius: 'var(--radius-sm)', font: 'inherit', width: 280 }} />
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        {bereiche.map((b) => (
          <div key={b} style={{ ...card, padding: 14 }}>
            <div className="mono" style={{ fontSize: 11, color: 'var(--muted)', textTransform: 'uppercase', marginBottom: 8 }}>{b}</div>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              {liste.filter((k) => k.bereich === b).map((k) => {
                const darf = darfKpi(rolle, k)
                const ueb = istUeberschrieben(k.id)
                return (
                  <div key={k.id} style={{ padding: '8px 0', borderBottom: '1px solid var(--line)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <button onClick={() => def?.oeffne(k.id)} title="Definition öffnen"
                        style={{ border: 'none', background: 'none', cursor: 'pointer', color: 'var(--accent)', fontSize: 15, fontWeight: 700 }}>ⓘ</button>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: 600, fontSize: 14 }}>{k.name} {k.security && <span title="vertraulich" style={{ fontSize: 11 }}>🔒</span>}
                          {ueb && <span title="angepasst (Override)" style={{ marginLeft: 6, fontSize: 10, fontWeight: 700, color: 'var(--accent)', background: 'var(--accent-soft)', padding: '1px 6px', borderRadius: 999 }}>angepasst</span>}</div>
                        <div style={{ fontSize: 12, color: 'var(--muted)' }}>{k.beschreibung}</div>
                      </div>
                      {darfEditieren && <button onClick={() => editId === k.id ? setEditId(null) : starteEdit(k.id)} title="Definition bearbeiten"
                        style={{ border: 'none', background: 'none', cursor: 'pointer', color: 'var(--muted)', fontSize: 14 }}>✎</button>}
                      <div className="mono" style={{ fontSize: 14, fontWeight: 600, minWidth: 90, textAlign: 'right' }}>
                        {darf ? formatWert(werte[k.id], k.einheit) : '🔒'}
                      </div>
                    </div>
                    {editId === k.id && form && (
                      <div style={{ marginTop: 8, padding: 12, background: 'var(--bg)', border: '1px solid var(--line)', borderRadius: 'var(--radius-sm)', display: 'flex', flexWrap: 'wrap', gap: 10, alignItems: 'flex-end' }}>
                        <label style={lbl}>Name<br /><input style={fInp} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></label>
                        <label style={lbl}>Ziel<br /><input style={{ ...fInp, width: 90 }} value={form.ziel} onChange={(e) => setForm({ ...form, ziel: e.target.value })} placeholder="—" /></label>
                        <label style={lbl}>Einheit<br /><select style={fInp} value={form.einheit} onChange={(e) => setForm({ ...form, einheit: e.target.value })}>{EINHEITEN.map((u) => <option key={u.id} value={u.id}>{u.name}</option>)}</select></label>
                        <label style={lbl}>Richtung<br /><select style={fInp} value={form.richtung} onChange={(e) => setForm({ ...form, richtung: e.target.value })}>{RICHTUNGEN.map((rr) => <option key={rr.id} value={rr.id}>{rr.name}</option>)}</select></label>
                        <label style={{ ...lbl, flex: 1, minWidth: 220 }}>Beschreibung<br /><input style={{ ...fInp, width: '100%' }} value={form.beschreibung} onChange={(e) => setForm({ ...form, beschreibung: e.target.value })} /></label>
                        <button onClick={speichereEdit} style={{ ...fInp, cursor: 'pointer', background: 'var(--accent)', color: '#fff', border: 'none', fontWeight: 600 }}>Speichern</button>
                        {ueb && <button onClick={() => zuruecksetzen(k.id)} style={{ ...fInp, cursor: 'pointer', color: 'var(--amp-r)', borderColor: 'var(--amp-r)' }}>Zurücksetzen</button>}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
