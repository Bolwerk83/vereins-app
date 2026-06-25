// =========================================================================
//  SPALTEN-DESIGNER (Power-User) — Spalten per Drag&Drop ordnen, umbenennen,
//  aus-/einblenden, löschen. Felder/Measures aus dem Datensatz direkt
//  hinzufügen (nicht nur Formeln). Berechnete Spalten über Feld-Chips bauen.
// =========================================================================
import React, { useState } from 'react'
import { standardLayout } from '../../core/tabellenLayout.js'

const inp = { padding: '5px 8px', border: '1px solid var(--line)', borderRadius: 'var(--radius-sm)', font: 'inherit', fontSize: 12 }
const ibtn = { ...inp, cursor: 'pointer', minWidth: 26, textAlign: 'center' }
const chip = { fontSize: 11, padding: '3px 9px', borderRadius: 999, border: '1px solid var(--line)', background: 'var(--panel)', cursor: 'pointer', color: 'var(--ink)', fontWeight: 600 }

export default function SpaltenDesigner({ spalten, layout, onChange, onReset }) {
  const cols = (layout?.cols) || standardLayout(spalten).cols
  const [formel, setFormel] = useState('')
  const [name, setName] = useState('')
  const [drag, setDrag] = useState(null)
  const [over, setOver] = useState(null)

  const setCols = (neu) => onChange({ cols: neu })
  const patch = (i, p) => setCols(cols.map((c, j) => (j === i ? { ...c, ...p } : c)))
  const move = (i, d) => {
    const j = i + d
    if (j < 0 || j >= cols.length) return
    const n = [...cols];[n[i], n[j]] = [n[j], n[i]]; setCols(n)
  }
  const dropAuf = (ziel) => {
    if (drag == null || drag === ziel) { setDrag(null); setOver(null); return }
    const n = [...cols]; const [m] = n.splice(drag, 1); n.splice(ziel, 0, m)
    setCols(n); setDrag(null); setOver(null)
  }
  const addBerechnet = () => {
    if (!name.trim() || !formel.trim()) return
    setCols([...cols, { src: null, label: name.trim(), formel: formel.trim(), hidden: false }])
    setName(''); setFormel('')
  }
  const addFeld = (idx) => { if (idx === '' || idx == null) return; setCols([...cols, { src: Number(idx), label: spalten[Number(idx)], hidden: false }]) }
  const del = (i) => setCols(cols.filter((_, j) => j !== i))

  return (
    <div style={{ marginTop: 8, padding: 12, border: '1px solid var(--accent)', borderRadius: 'var(--radius-sm)', background: 'var(--bg)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
        <div style={{ fontWeight: 600, fontSize: 13 }}>🧱 Spalten-Designer</div>
        <button onClick={onReset} style={{ ...inp, cursor: 'pointer', color: 'var(--muted)' }}>↺ Standard wiederherstellen</button>
      </div>
      <div style={{ fontSize: 11, color: 'var(--muted)', marginBottom: 8 }}>Zum Sortieren am Griff <span className="mono">⠿</span> ziehen (oder Griff fokussieren und ↑/↓ drücken).</div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        {cols.map((c, i) => (
          <div key={i}
            onDragOver={(e) => { e.preventDefault(); if (over !== i) setOver(i) }}
            onDrop={() => dropAuf(i)}
            style={{ display: 'flex', gap: 6, alignItems: 'center', borderRadius: 'var(--radius-sm)',
              outline: over === i && drag != null && drag !== i ? '2px dashed var(--accent)' : 'none',
              opacity: drag === i ? 0.45 : 1, background: drag === i ? 'var(--accent-soft)' : 'transparent' }}>
            <span
              draggable
              onDragStart={() => setDrag(i)}
              onDragEnd={() => { setDrag(null); setOver(null) }}
              tabIndex={0}
              role="button"
              aria-label={`Spalte ${c.label} verschieben — ziehen oder Pfeiltasten`}
              onKeyDown={(e) => { if (e.key === 'ArrowUp') { e.preventDefault(); move(i, -1) } else if (e.key === 'ArrowDown') { e.preventDefault(); move(i, 1) } }}
              title="Ziehen zum Sortieren (oder ↑/↓)"
              style={{ cursor: 'grab', color: 'var(--muted)', fontSize: 16, lineHeight: 1, padding: '2px 4px', userSelect: 'none' }}>⠿</span>
            <input value={c.label} onChange={(e) => patch(i, { label: e.target.value })} aria-label="Spaltenname" style={{ ...inp, flex: 1 }} />
            <label style={{ fontSize: 12, display: 'flex', alignItems: 'center', gap: 4, color: 'var(--muted)' }}>
              <input type="checkbox" checked={!c.hidden} onChange={() => patch(i, { hidden: !c.hidden })} /> sichtbar
            </label>
            <span className="mono" style={{ fontSize: 10, color: c.src == null ? 'var(--accent)' : 'var(--muted)', minWidth: 56, textAlign: 'right' }} title={c.formel || ''}>
              {c.src == null ? 'ƒ berechnet' : 'Feld'}
            </span>
            <button onClick={() => del(i)} title="Spalte entfernen" aria-label="Spalte entfernen" style={{ ...ibtn, color: 'var(--amp-r)' }}>×</button>
          </div>
        ))}
      </div>

      {/* Feld / Measure direkt hinzufügen */}
      <div style={{ marginTop: 10, paddingTop: 10, borderTop: '1px solid var(--line)', display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
        <span style={{ fontSize: 12, color: 'var(--muted)' }}>Feld / Measure hinzufügen:</span>
        <select defaultValue="" onChange={(e) => { addFeld(e.target.value); e.target.value = '' }} style={{ ...inp, cursor: 'pointer', minWidth: 200 }} aria-label="Feld oder Measure hinzufügen">
          <option value="">+ aus Datensatz wählen …</option>
          {spalten.map((s, idx) => <option key={idx} value={idx}>{s}</option>)}
        </select>
      </div>

      {/* Berechnete Spalte über Feld-Chips bauen */}
      <div style={{ marginTop: 10, paddingTop: 10, borderTop: '1px solid var(--line)' }}>
        <div style={{ fontSize: 12, color: 'var(--muted)', marginBottom: 6 }}>
          Berechnete Spalte (Measure) — Felder anklicken zum Einfügen, z. B. <span className="mono">[Umsatz €] / [Menge]</span>
        </div>
        <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap', marginBottom: 8 }}>
          {spalten.map((s, idx) => <button key={idx} type="button" onClick={() => setFormel((f) => (f + (f && !f.endsWith(' ') ? ' ' : '') + `[${s}]`))} style={chip} title={`[${s}] einfügen`}>{s}</button>)}
          {['+', '−', '×', '/', '* 100'].map((op) => <button key={op} type="button" onClick={() => setFormel((f) => f + ` ${op === '×' ? '*' : op === '−' ? '-' : op} `)} style={{ ...chip, color: 'var(--muted)' }}>{op}</button>)}
        </div>
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Spaltenname" style={{ ...inp, width: 150 }} />
          <input value={formel} onChange={(e) => setFormel(e.target.value)} placeholder="[Umsatz €] / [Menge] * 100" style={{ ...inp, flex: 1, minWidth: 180 }} />
          <button onClick={addBerechnet} disabled={!name.trim() || !formel.trim()} style={{ ...inp, cursor: name.trim() && formel.trim() ? 'pointer' : 'not-allowed', background: 'var(--accent)', color: '#fff', border: 'none', fontWeight: 600, opacity: name.trim() && formel.trim() ? 1 : 0.5 }}>+ Spalte</button>
        </div>
      </div>
    </div>
  )
}
