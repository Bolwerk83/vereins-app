// =========================================================================
//  SPALTEN-DESIGNER (Power-User) — Spalten umbenennen, aus-/einblenden,
//  verschieben, berechnete Spalten ergänzen/löschen. Mit Standard-Reset.
// =========================================================================
import React, { useState } from 'react'
import { standardLayout } from '../../core/tabellenLayout.js'

const inp = { padding: '5px 8px', border: '1px solid var(--line)', borderRadius: 'var(--radius-sm)', font: 'inherit', fontSize: 12 }
const ibtn = { ...inp, cursor: 'pointer', minWidth: 26, textAlign: 'center' }

export default function SpaltenDesigner({ spalten, layout, onChange, onReset }) {
  const cols = (layout?.cols) || standardLayout(spalten).cols
  const [formel, setFormel] = useState('')
  const [name, setName] = useState('')

  const setCols = (neu) => onChange({ cols: neu })
  const patch = (i, p) => setCols(cols.map((c, j) => (j === i ? { ...c, ...p } : c)))
  const move = (i, d) => {
    const j = i + d
    if (j < 0 || j >= cols.length) return
    const n = [...cols];[n[i], n[j]] = [n[j], n[i]]; setCols(n)
  }
  const addBerechnet = () => {
    if (!name.trim() || !formel.trim()) return
    setCols([...cols, { src: null, label: name.trim(), formel: formel.trim(), hidden: false }])
    setName(''); setFormel('')
  }
  const del = (i) => setCols(cols.filter((_, j) => j !== i))

  return (
    <div style={{ marginTop: 8, padding: 12, border: '1px solid var(--accent)', borderRadius: 'var(--radius-sm)', background: 'var(--bg)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
        <div style={{ fontWeight: 600, fontSize: 13 }}>🧱 Spalten-Designer</div>
        <button onClick={onReset} style={{ ...inp, cursor: 'pointer', color: 'var(--muted)' }}>↺ Standard wiederherstellen</button>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        {cols.map((c, i) => (
          <div key={i} style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
            <button onClick={() => move(i, -1)} title="nach oben" style={ibtn}>↑</button>
            <button onClick={() => move(i, 1)} title="nach unten" style={ibtn}>↓</button>
            <input value={c.label} onChange={(e) => patch(i, { label: e.target.value })} style={{ ...inp, flex: 1 }} />
            <label style={{ fontSize: 12, display: 'flex', alignItems: 'center', gap: 4, color: 'var(--muted)' }}>
              <input type="checkbox" checked={!c.hidden} onChange={() => patch(i, { hidden: !c.hidden })} /> sichtbar
            </label>
            {c.src == null
              ? <><span className="mono" style={{ fontSize: 10, color: 'var(--accent)' }} title={c.formel}>ƒ berechnet</span>
                  <button onClick={() => del(i)} title="löschen" style={{ ...ibtn, color: 'var(--amp-r)' }}>×</button></>
              : <span className="mono" style={{ fontSize: 10, color: 'var(--muted)' }}>Original</span>}
          </div>
        ))}
      </div>

      {/* Berechnete Spalte hinzufügen */}
      <div style={{ marginTop: 10, paddingTop: 10, borderTop: '1px solid var(--line)' }}>
        <div style={{ fontSize: 12, color: 'var(--muted)', marginBottom: 6 }}>
          Berechnete Spalte (Measure) — Formel mit Spaltennamen in eckigen Klammern, z. B. <span className="mono">[Umsatz €] / [Menge]</span>
        </div>
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Spaltenname" style={{ ...inp, width: 150 }} />
          <input value={formel} onChange={(e) => setFormel(e.target.value)} placeholder="[Spalte A] / [Spalte B] * 100" style={{ ...inp, flex: 1, minWidth: 180 }} />
          <button onClick={addBerechnet} style={{ ...inp, cursor: 'pointer', background: 'var(--accent)', color: '#fff', border: 'none', fontWeight: 600 }}>+ Spalte</button>
        </div>
      </div>
    </div>
  )
}
