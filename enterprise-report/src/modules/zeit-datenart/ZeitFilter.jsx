// =========================================================================
//  ZEIT-FILTER (kompakt) — EIN Dropdown für Datumsart (Belegdatum/Bestell-/
//  Lieferdatum …) und Kalender-Hierarchie (Jahr→Monat→Tag KJ/WJ, Jahr→KW→Tag,
//  Jahr→Quartal→Monat→Tag). Spart Platz: ein Knopf, Auswahl im Popover, mit
//  Mini-Vorschau des gewählten Hierarchiebaums.
// =========================================================================
import React, { useState, useRef, useEffect } from 'react'
import { DATUMSSICHTEN, setDatumssicht, setKalender, STEUERJAHR } from '../../core/periodenmodell.js'
import { KALENDER_VARIANTEN, variante, baueZeitbaum } from '../../core/zeitDimension.js'

const feld = { width: '100%', padding: '6px 9px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--line)', font: 'inherit', fontSize: 12.5, background: 'var(--panel)', color: 'var(--ink)' }
const cap = { fontSize: 10, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '.04em', fontWeight: 700 }
const kurz = (id) => ({ belegdatum: 'Beleg', bestelldatum: 'Bestell', lieferdatum: 'Liefer', zahldatum: 'Zahl' }[id] || id)

export default function ZeitFilter({ modell, onChange }) {
  const [auf, setAuf] = useState(false)
  const ref = useRef(null)
  useEffect(() => {
    const onClick = (e) => { if (ref.current && !ref.current.contains(e.target)) setAuf(false) }
    document.addEventListener('mousedown', onClick); return () => document.removeEventListener('mousedown', onClick)
  }, [])

  const ds = modell?.datumssicht || 'belegdatum'
  const kal = modell?.kalender || 'kj-monat'
  const v = variante(kal)
  const jahr = STEUERJAHR
  // Mini-Vorschau: Wurzel + erste beiden Ebenen.
  const baum = baueZeitbaum(kal, jahr)
  const jahrK = baum.kinder[0]
  const vorschau = jahrK ? jahrK.kinder.slice(0, 6).map((k) => k.name) : []

  const setDs = (id) => { setDatumssicht(id); onChange?.() }
  const setKal = (id) => { setKalender(id); onChange?.() }

  return (
    <div ref={ref} style={{ position: 'relative' }}>
      <button onClick={() => setAuf((a) => !a)} title="Zeit-Hierarchie & Datumsart wählen"
        style={{ display: 'inline-flex', alignItems: 'center', gap: 7, padding: '5px 10px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--line)', background: 'var(--panel)', cursor: 'pointer', fontSize: 12 }}>
        <span>📅</span>
        <span style={{ fontWeight: 600 }}>{kurz(ds)}</span>
        <span style={{ color: 'var(--muted)' }}>· {v.ebenen.join('→')} {v.jahr === 'wj' ? '(WJ)' : '(KJ)'}</span>
        <span style={{ color: 'var(--muted)', fontSize: 10 }}>▾</span>
      </button>

      {auf && (
        <div style={{ position: 'absolute', top: 'calc(100% + 6px)', right: 0, width: 300, maxWidth: '90vw', background: 'var(--panel)', border: '1px solid var(--line)', borderRadius: 'var(--radius)', boxShadow: 'var(--shadow)', zIndex: 60, padding: 12, display: 'grid', gap: 11 }}>
          <div>
            <div style={{ ...cap, marginBottom: 4 }}>Datumsart</div>
            <select value={ds} onChange={(e) => setDs(e.target.value)} style={feld}>
              {DATUMSSICHTEN.map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}
            </select>
            <div style={{ fontSize: 10.5, color: 'var(--muted)', marginTop: 3 }}>{DATUMSSICHTEN.find((d) => d.id === ds)?.hinweis}</div>
          </div>
          <div>
            <div style={{ ...cap, marginBottom: 4 }}>Kalender-Hierarchie</div>
            <select value={kal} onChange={(e) => setKal(e.target.value)} style={feld}>
              {KALENDER_VARIANTEN.map((vr) => <option key={vr.id} value={vr.id}>{vr.name}</option>)}
            </select>
          </div>
          <div>
            <div style={{ ...cap, marginBottom: 4 }}>Baum · {jahrK?.name || jahr}</div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
              {vorschau.map((n) => <span key={n} style={{ fontSize: 11, padding: '1px 7px', borderRadius: 999, background: 'var(--bg)', border: '1px solid var(--line)' }}>{n}</span>)}
              {jahrK && jahrK.kinder.length > 6 && <span style={{ fontSize: 11, color: 'var(--muted)' }}>+{jahrK.kinder.length - 6}</span>}
            </div>
            <div style={{ fontSize: 10.5, color: 'var(--muted)', marginTop: 4 }}>Ebenen: {v.ebenen.join(' → ')} · darunter je Tag. Berichte zeigen die Periode nach <b>{kurz(ds)}datum</b>.</div>
          </div>
        </div>
      )}
    </div>
  )
}
