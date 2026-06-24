// =========================================================================
//  ASSISTENT-INSIGHTS — wertet die protokollierten Fragen aus (KI-frei).
//  Zeigt Trefferquote, Top-Fragen, häufigste Kennzahlen, Quote je Rolle und
//  vor allem die WISSENSLÜCKEN: unbeantwortete Fragen mit Synonym-Vorschlag,
//  damit ein Mensch die Wissensbasis gezielt erweitern kann.
// =========================================================================
import React, { useState } from 'react'
import { statistik, topFragen, topKpis, quoteJeRolle, wissensluecken, ladeLog, leereLog, exportJson } from '../../core/assistentLog.js'
import { KPI } from '../../core/kpiRegistry.js'

const card = { background: 'var(--panel)', border: '1px solid var(--line)', borderRadius: 'var(--radius)', boxShadow: 'var(--shadow)' }
const cap = { fontSize: 11, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '.04em', fontWeight: 700 }
const pct = (x) => (x * 100).toFixed(0) + '%'
const ampel = (q) => (q >= 0.85 ? 'var(--amp-g)' : q >= 0.65 ? 'var(--amp-a)' : 'var(--amp-r)')

export default function AssistentInsights({ onGeh }) {
  const [, setTick] = useState(0)
  const refresh = () => setTick((n) => n + 1)
  const s = statistik()

  if (s.gesamt === 0) {
    return (
      <div style={{ ...card, padding: 24, textAlign: 'center', color: 'var(--muted)' }}>
        <div style={{ fontSize: 30, marginBottom: 8 }}>📊</div>
        <div style={{ fontWeight: 700, color: 'var(--ink)', marginBottom: 4 }}>Noch keine Fragen erfasst</div>
        Sobald im Chat Fragen gestellt werden, lernt der Assistent hier mit: Trefferquote,
        häufige Fragen und Wissenslücken erscheinen automatisch. Alles bleibt lokal im Browser.
      </div>
    )
  }

  const fragen = topFragen(8), kpis = topKpis(8), rollen = quoteJeRolle(), luecken = wissensluecken(12)

  const exportieren = () => {
    try {
      const blob = new Blob([exportJson()], { type: 'application/json' })
      const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = 'assistent-log.json'; a.click()
    } catch {}
  }

  return (
    <div style={{ display: 'grid', gap: 14, overflowY: 'auto', paddingRight: 2 }}>
      {/* Kennzahlen */}
      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
        {[['Fragen gesamt', s.gesamt, 'var(--accent)'], ['Fachfragen', s.fachfragen, 'var(--accent)'],
          ['Trefferquote', pct(s.trefferquote), ampel(s.trefferquote)], ['Offene Lücken', s.offen + s.schwach, (s.offen + s.schwach) ? 'var(--amp-a)' : 'var(--amp-g)']].map(([l, v, c]) => (
          <div key={l} style={{ ...card, padding: '11px 14px', flex: 1, minWidth: 130, borderTop: `3px solid ${c}` }}>
            <div style={{ ...cap, marginBottom: 3 }}>{l}</div>
            <div className="mono" style={{ fontSize: 19, fontWeight: 800, color: c }}>{v}</div>
          </div>
        ))}
      </div>

      {/* Wissenslücken — der eigentliche Lern-Hebel */}
      <div style={{ ...card, padding: 14 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
          <span style={cap}>🧩 Wissenslücken — unbeantwortete Fragen mit Verbesserungsvorschlag</span>
          <span style={{ fontSize: 11.5, color: 'var(--muted)' }}>{luecken.length ? 'Begriffe der jeweils nächstliegenden Kennzahl als Synonym zuordnen' : ''}</span>
        </div>
        {luecken.length === 0
          ? <div style={{ fontSize: 13, color: 'var(--amp-g)' }}>✓ Keine offenen Lücken — alle Fachfragen wurden beantwortet.</div>
          : (
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12.5 }}>
              <thead><tr>{['Frage', 'Anzahl', 'Markante Begriffe', 'Vorschlag: Synonym zu'].map((h, i) => (
                <th key={i} style={{ textAlign: i === 1 ? 'right' : 'left', padding: '5px 9px', borderBottom: '2px solid var(--line)', ...cap }}>{h}</th>))}</tr></thead>
              <tbody>
                {luecken.map((l, i) => (
                  <tr key={i}>
                    <td style={{ padding: '5px 9px', borderBottom: '1px solid var(--line)' }}>{l.schwach ? '◐ ' : '○ '}{l.frage}</td>
                    <td style={{ padding: '5px 9px', borderBottom: '1px solid var(--line)', textAlign: 'right' }} className="mono">{l.anzahl}</td>
                    <td style={{ padding: '5px 9px', borderBottom: '1px solid var(--line)' }}>{l.woerter.map((w) => (
                      <span key={w} style={{ display: 'inline-block', fontSize: 11, padding: '1px 6px', margin: '1px 3px 1px 0', background: 'var(--bg)', borderRadius: 4, border: '1px solid var(--line)' }}>{w}</span>))}</td>
                    <td style={{ padding: '5px 9px', borderBottom: '1px solid var(--line)' }}>
                      {l.vorschlagKpiName
                        ? <span style={{ color: 'var(--accent)', fontWeight: 600 }}>→ {l.vorschlagKpiName}</span>
                        : <span style={{ color: 'var(--muted)' }}>— keine nahe Kennzahl</span>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        <div style={{ fontSize: 11, color: 'var(--muted)', marginTop: 8 }}>○ nicht zugeordnet · ◐ nur Themenliste (schwacher Treffer). Vorschläge sind kuratiert — ein Mensch übernimmt sie bewusst in die Synonyme.</div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 14 }}>
        {/* Top-Fragen */}
        <div style={{ ...card, padding: 14 }}>
          <div style={{ ...cap, marginBottom: 8 }}>🔝 Häufigste Fragen</div>
          {fragen.map((f, i) => (
            <div key={i} style={{ display: 'flex', justifyContent: 'space-between', gap: 8, padding: '4px 0', borderBottom: '1px solid var(--line)', fontSize: 12.5 }}>
              <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{f.treffer === f.anzahl ? '✓ ' : f.treffer === 0 ? '○ ' : '◐ '}{f.frage}</span>
              <span className="mono" style={{ color: 'var(--muted)' }}>{f.anzahl}×</span>
            </div>
          ))}
        </div>

        {/* Quote je Rolle + Top-KPIs */}
        <div style={{ display: 'grid', gap: 14 }}>
          <div style={{ ...card, padding: 14 }}>
            <div style={{ ...cap, marginBottom: 8 }}>👥 Trefferquote je Rolle</div>
            {rollen.map((r) => (
              <div key={r.rolle} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '3px 0', fontSize: 12.5 }}>
                <span style={{ width: 90, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{r.rolle}</span>
                <div style={{ flex: 1, height: 8, background: 'var(--bg)', borderRadius: 4, overflow: 'hidden' }}>
                  <div style={{ width: pct(r.quote), height: '100%', background: ampel(r.quote) }} />
                </div>
                <span className="mono" style={{ width: 60, textAlign: 'right', color: ampel(r.quote) }}>{pct(r.quote)} ({r.anzahl})</span>
              </div>
            ))}
          </div>
          <div style={{ ...card, padding: 14 }}>
            <div style={{ ...cap, marginBottom: 8 }}>📈 Gefragteste Kennzahlen</div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
              {kpis.map((k) => (
                <button key={k.id} onClick={() => onGeh && KPI[k.id] && onGeh('baum')} title={KPI[k.id]?.name || k.id}
                  style={{ fontSize: 11.5, padding: '3px 9px', border: '1px solid var(--line)', borderRadius: 999, background: 'var(--panel)', color: 'var(--ink)', cursor: onGeh ? 'pointer' : 'default' }}>
                  {KPI[k.id]?.name || k.id} <b className="mono" style={{ color: 'var(--muted)' }}>{k.anzahl}</b>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
        <button onClick={exportieren} style={{ padding: '6px 12px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--line)', background: 'var(--panel)', cursor: 'pointer', fontSize: 12.5 }}>⬇ Export JSON</button>
        <button onClick={() => { if (confirm('Alle protokollierten Fragen löschen?')) { leereLog(); refresh() } }} style={{ padding: '6px 12px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--amp-r)', background: 'var(--panel)', color: 'var(--amp-r)', cursor: 'pointer', fontSize: 12.5 }}>🗑 Log leeren</button>
      </div>
      <div style={{ fontSize: 11, color: 'var(--muted)', textAlign: 'center' }}>🔒 {ladeLog().length} Einträge — gespeichert nur lokal im Browser, keine Übertragung.</div>
    </div>
  )
}
