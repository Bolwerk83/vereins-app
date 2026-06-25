// =========================================================================
//  AUTO-SUMMARY (gemeinsam) — regelbasierte Management-Summary OHNE KI.
//  Leitet Lage, groessten Treiber, Chance, Risiko und Empfehlung aus den
//  echten Zahlen ab; mehrere Vorlagen formulieren je nach Ergebnislage.
//  Wird im Quartalsbericht und im Cockpit/Tagesreporting genutzt.
//  Optionales onUebernehmen blendet den Uebernehmen-Button ein.
// =========================================================================
import React, { useState } from 'react'
import { managementSummary, summaryNachVorlage, SUMMARY_VORLAGEN } from '../core/managementSummary.js'

const card = { background: 'var(--panel)', border: '1px solid var(--line)', borderRadius: 'var(--radius)', boxShadow: 'var(--shadow)' }
const cap = { fontSize: 11, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '.04em', fontWeight: 700 }
const AMP = { g: 'var(--amp-g)', a: 'var(--amp-a)', r: 'var(--amp-r)' }
const TYP = { treiber: { i: '🎯', f: 'var(--accent)' }, chance: { i: '↗', f: 'var(--amp-g)' }, risiko: { i: '⚠', f: 'var(--amp-a)' } }

export default function AutoSummary({ monate, faktor = 1, periodeName = 'Berichtszeitraum', pcLabel = '', onUebernehmen, titelZusatz }) {
  const [vorlage, setVorlage] = useState('ausfuehrlich')
  const opts = { faktor, periodeName, pcLabel }
  const s = managementSummary(monate, opts)
  const text = summaryNachVorlage(monate, opts, vorlage)
  const sel = { padding: '5px 8px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--line)', background: 'var(--panel)', font: 'inherit', fontSize: 12, cursor: 'pointer' }
  return (
    <div className="no-print" style={{ ...card, padding: 14, marginBottom: 12, borderLeft: `4px solid ${AMP[s.status]}` }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 10, flexWrap: 'wrap', marginBottom: 8 }}>
        <span style={{ ...cap, color: 'var(--accent)' }}>✨ Auto-Summary <span style={{ color: 'var(--muted)', fontWeight: 400, textTransform: 'none' }}>· aus den Zahlen abgeleitet, ohne KI{titelZusatz ? ` · ${titelZusatz}` : ''}</span></span>
        <span style={{ display: 'inline-flex', gap: 6, alignItems: 'center' }}>
          <select value={vorlage} onChange={(e) => setVorlage(e.target.value)} style={sel} title="Vorlage wählen">
            {SUMMARY_VORLAGEN.map((v) => <option key={v.id} value={v.id}>{v.name}</option>)}
          </select>
          {onUebernehmen && <button onClick={() => onUebernehmen(text)} style={{ ...sel, border: 'none', background: 'var(--accent)', color: '#fff', fontWeight: 600 }}>In Summary übernehmen ↓</button>}
        </span>
      </div>
      <div style={{ fontSize: 13, lineHeight: 1.5, marginBottom: 10 }}>{s.lage}</div>
      <div style={{ display: 'grid', gap: 6 }}>
        {s.punkte.map((p, i) => (
          <div key={i} style={{ display: 'flex', gap: 8, alignItems: 'baseline', fontSize: 12.5 }}>
            <span style={{ color: TYP[p.typ].f, fontWeight: 700, minWidth: 96 }}>{TYP[p.typ].i} {p.kopf}</span>
            <span style={{ color: 'var(--slate)' }}>{p.text}</span>
          </div>
        ))}
        <div style={{ display: 'flex', gap: 8, alignItems: 'baseline', fontSize: 12.5 }}>
          <span style={{ color: 'var(--ink)', fontWeight: 700, minWidth: 96 }}>✓ Empfehlung</span>
          <span style={{ color: 'var(--slate)' }}>{s.empfehlung}</span>
        </div>
      </div>
      <div style={{ marginTop: 8, padding: '8px 10px', borderRadius: 'var(--radius-sm)', background: 'var(--bg)', border: '1px dashed var(--line)' }}>
        <div className="mono" style={{ fontSize: 10, color: 'var(--muted)', textTransform: 'uppercase', marginBottom: 3 }}>Vorschau · Vorlage „{SUMMARY_VORLAGEN.find((v) => v.id === vorlage)?.name}"</div>
        <div style={{ fontSize: 12.5, lineHeight: 1.5 }}>{text}</div>
      </div>
    </div>
  )
}
