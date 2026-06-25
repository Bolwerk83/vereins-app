// =========================================================================
//  KOMMENTAR (gemeinsam) — wiederverwendbarer Kommentar-/Aufgaben-Thread für
//  JEDEN Bericht. Notiz erfassen, optional einer Person zuweisen, abhaken,
//  löschen. Persistenz via bemerkungen.js (localStorage). Eingeklappt by
//  default; offene Anzahl im Titel. Wird u. a. im Exec-Kopf eingebunden.
// =========================================================================
import React, { useState } from 'react'
import { ladeBemerkungen, addBemerkung, toggleErledigt, loescheBemerkung, PERSONEN } from '../core/bemerkungen.js'

export default function Kommentar({ typ = 'bericht', id, offenStart = false }) {
  const [, setTick] = useState(0)
  const refresh = () => setTick((n) => n + 1)
  const [auf, setAuf] = useState(offenStart)
  const [text, setText] = useState('')
  const [zu, setZu] = useState('')
  if (!id) return null
  const liste = ladeBemerkungen(typ, id)
  const offen = liste.filter((b) => !b.erledigt).length
  const add = () => { if (!text.trim()) return; addBemerkung(typ, id, { text: text.trim(), zuweisung: zu }); setText(''); setZu(''); setAuf(true); refresh() }
  const feld = { padding: '6px 8px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--line)', font: 'inherit', fontSize: 12.5, background: 'var(--panel)', color: 'var(--ink)' }

  return (
    <div className="no-print" style={{ marginTop: 10, borderTop: '1px dashed var(--line)', paddingTop: 8 }}>
      <button onClick={() => setAuf((a) => !a)} style={{ border: 'none', background: 'none', cursor: 'pointer', fontSize: 12, fontWeight: 600, color: 'var(--muted)', padding: 0 }}>
        💬 Kommentare{liste.length ? ` (${liste.length}${offen ? `, ${offen} offen` : ''})` : ''} {auf ? '▾' : '▸'}
      </button>
      {auf && (
        <div style={{ marginTop: 8, display: 'grid', gap: 7 }}>
          {liste.map((b) => (
            <div key={b.nid} style={{ display: 'flex', gap: 8, alignItems: 'flex-start', fontSize: 12.5, opacity: b.erledigt ? 0.55 : 1 }}>
              <input type="checkbox" checked={!!b.erledigt} onChange={() => { toggleErledigt(typ, id, b.nid); refresh() }} title="erledigt" style={{ marginTop: 2 }} />
              <div style={{ flex: 1 }}>
                <span style={{ textDecoration: b.erledigt ? 'line-through' : 'none' }}>{b.text}</span>
                <div style={{ fontSize: 11, color: 'var(--muted)' }}>{b.autor || 'Du'}{b.zuweisung ? <> → <b>{b.zuweisung}</b></> : ''}</div>
              </div>
              <button onClick={() => { loescheBemerkung(typ, id, b.nid); refresh() }} title="löschen" style={{ border: 'none', background: 'none', cursor: 'pointer', color: 'var(--amp-r)', fontSize: 13 }}>✕</button>
            </div>
          ))}
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            <input value={text} onChange={(e) => setText(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter') add() }} placeholder="Kommentar / Aufgabe notieren …" style={{ ...feld, flex: 1, minWidth: 180 }} />
            <select value={zu} onChange={(e) => setZu(e.target.value)} style={feld} title="zuweisen"><option value="">— zuweisen —</option>{PERSONEN.map((p) => <option key={p} value={p}>{p}</option>)}</select>
            <button onClick={add} style={{ ...feld, border: 'none', background: 'var(--accent)', color: '#fff', fontWeight: 600, cursor: 'pointer' }}>Hinzufügen</button>
          </div>
        </div>
      )}
    </div>
  )
}
