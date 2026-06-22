// =========================================================================
//  PROFIT-CENTER → EINZELKOSTENSTELLEN — Drill von jedem Profit-Center bis
//  auf die Einzelkostenstelle, mit manuellem Verschieben (Reassignment) in
//  ein anderes PC. PC-Ergebnisse aktualisieren sich live.
// =========================================================================
import React, { useState } from 'react'
import {
  PROFITCENTER, pcInfo, pcMitKostenstellen, gesamt, verschiebe, setzeZurueck, anzahlVerschoben
} from '../../core/pcKostenstellen.js'

const card = { background: 'var(--panel)', border: '1px solid var(--line)', borderRadius: 'var(--radius)', boxShadow: 'var(--shadow)' }
const cap = { fontSize: 11, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '.04em', fontWeight: 700 }
const te = (n) => n.toLocaleString('de-DE') + ' T€'
const mio = (n) => (n / 1000).toLocaleString('de-DE', { minimumFractionDigits: 1, maximumFractionDigits: 1 }) + ' Mio €'
const erg = (n) => (n >= 0 ? 'var(--amp-g)' : 'var(--amp-r)')

function PcKarte({ pc, offen, onToggle, onMove, maxErloes }) {
  return (
    <div style={{ ...card, borderTop: `3px solid ${pc.farbe}` }}>
      <div onClick={onToggle} style={{ padding: '12px 14px', cursor: 'pointer' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: 8 }}>
          <span style={{ fontWeight: 700, fontSize: 14 }}>{pc.name}</span>
          <span style={{ color: 'var(--muted)', fontSize: 12 }}>{offen ? '▾' : '▸'} {pc.anzahl} KS</span>
        </div>
        <div style={{ display: 'flex', gap: 14, marginTop: 6, flexWrap: 'wrap' }}>
          <span style={{ fontSize: 12, color: 'var(--muted)' }}>Erlöse <b className="mono" style={{ color: 'var(--ink)' }}>{mio(pc.erloes)}</b></span>
          <span style={{ fontSize: 12, color: 'var(--muted)' }}>Kosten <b className="mono" style={{ color: 'var(--ink)' }}>{mio(pc.kosten)}</b></span>
          <span style={{ fontSize: 12, color: 'var(--muted)' }}>Ergebnis <b className="mono" style={{ color: erg(pc.ergebnis) }}>{mio(pc.ergebnis)}</b></span>
        </div>
        <div style={{ display: 'flex', height: 6, borderRadius: 3, overflow: 'hidden', background: 'var(--bg)', marginTop: 8 }}>
          <div style={{ width: `${Math.min(100, pc.erloes / maxErloes * 100)}%`, background: pc.farbe }} />
        </div>
      </div>
      {offen && (
        <div style={{ borderTop: '1px solid var(--line)', padding: '6px 10px 10px' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
            <thead><tr>{['Kostenstelle', 'Erlös', 'Kosten', 'Ergebnis', 'verschieben →'].map((h, i) => (
              <th key={i} style={{ textAlign: i >= 1 && i <= 3 ? 'right' : 'left', padding: '5px 8px', borderBottom: '1px solid var(--line)', fontSize: 10, color: 'var(--muted)', textTransform: 'uppercase' }}>{h}</th>
            ))}</tr></thead>
            <tbody>
              {pc.kostenstellen.map((k) => (
                <tr key={k.id} style={{ background: k.verschoben ? 'var(--bg)' : undefined }}>
                  <td style={{ padding: '5px 8px', borderBottom: '1px solid var(--line)' }}>
                    {k.verschoben && <span title="manuell verschoben" style={{ color: 'var(--accent)', marginRight: 4 }}>●</span>}
                    <span style={{ fontWeight: 600 }}>{k.name}</span>
                    <span style={{ color: 'var(--muted)', fontSize: 10.5 }}> · {k.gruppe}</span>
                  </td>
                  <td className="mono" style={{ textAlign: 'right', padding: '5px 8px', borderBottom: '1px solid var(--line)', color: k.erloes ? 'var(--ink)' : 'var(--muted)' }}>{k.erloes ? te(k.erloes) : '–'}</td>
                  <td className="mono" style={{ textAlign: 'right', padding: '5px 8px', borderBottom: '1px solid var(--line)' }}>{te(k.kosten)}</td>
                  <td className="mono" style={{ textAlign: 'right', padding: '5px 8px', borderBottom: '1px solid var(--line)', color: erg(k.ergebnis) }}>{te(k.ergebnis)}</td>
                  <td style={{ textAlign: 'right', padding: '4px 8px', borderBottom: '1px solid var(--line)' }}>
                    <select value={k.pc} onChange={(e) => onMove(k.id, e.target.value)}
                      style={{ font: 'inherit', fontSize: 11.5, padding: '3px 6px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--line)', background: 'var(--panel)', cursor: 'pointer', maxWidth: 170 }}>
                      {PROFITCENTER.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

export default function PcKostenstellen() {
  const [, setTick] = useState(0)
  const [offen, setOffen] = useState({ 'pc-bike': true })
  const refresh = () => setTick((t) => t + 1)
  const pcs = pcMitKostenstellen()
  const ges = gesamt()
  const maxErloes = Math.max(...pcs.map((p) => p.erloes), 1)
  const verschoben = anzahlVerschoben()
  const move = (ksId, pcId) => { verschiebe(ksId, pcId); refresh() }

  return (
    <div style={{ maxWidth: 1100, margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', gap: 12, flexWrap: 'wrap', marginBottom: 14 }}>
        <div>
          <div style={cap}>Profit-Center-Rechnung · bis auf Einzelkostenstellen</div>
          <h2 style={{ margin: '4px 0 0' }}>Profit-Center → Kostenstellen</h2>
        </div>
        <div className="no-print" style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          {verschoben > 0 && <span style={{ fontSize: 12, color: 'var(--accent)' }}>● {verschoben} manuell verschoben</span>}
          <button onClick={() => { setzeZurueck(); refresh() }} disabled={!verschoben}
            style={{ padding: '7px 12px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--line)', background: 'var(--panel)', cursor: verschoben ? 'pointer' : 'not-allowed', fontSize: 13, color: verschoben ? 'var(--ink)' : 'var(--muted)' }}>↺ Zurücksetzen</button>
        </div>
      </div>

      <div style={{ ...card, padding: 16, marginBottom: 14, borderLeft: '3px solid var(--accent)' }}>
        <div style={{ fontSize: 13.5, lineHeight: 1.5 }}>
          Jedes Profit-Center ist bis auf die <b>Einzelkostenstelle</b> aufgeklappt. Eine Kostenstelle lässt sich über
          das Auswahlfeld <b>manuell in ein anderes Profit-Center verschieben</b> — die PC-Ergebnisse rechnen sich
          sofort neu. Verschiebungen bleiben erhalten (markiert mit ●) und lassen sich zurücksetzen.
        </div>
        <div style={{ display: 'flex', gap: 16, marginTop: 12, flexWrap: 'wrap' }}>
          <span style={{ fontSize: 13 }}>Σ Erlöse <b className="mono">{mio(ges.erloes)}</b></span>
          <span style={{ fontSize: 13 }}>Σ Kosten <b className="mono">{mio(ges.kosten)}</b></span>
          <span style={{ fontSize: 13 }}>Unternehmensergebnis <b className="mono" style={{ color: erg(ges.ergebnis) }}>{mio(ges.ergebnis)}</b></span>
          <span style={{ fontSize: 12, color: 'var(--muted)' }}>(Σ bleibt beim Verschieben konstant — nur die Verteilung ändert sich)</span>
        </div>
      </div>

      <div style={{ display: 'grid', gap: 12 }}>
        {pcs.map((pc) => (
          <PcKarte key={pc.id} pc={pc} maxErloes={maxErloes} offen={!!offen[pc.id]}
            onToggle={() => setOffen((o) => ({ ...o, [pc.id]: !o[pc.id] }))} onMove={move} />
        ))}
      </div>

      <div style={{ fontSize: 11, color: 'var(--muted)', textAlign: 'center', padding: '14px 0 20px' }}>
        Beträge in T€ p. a. · Demo-Daten (Mock) · Zuordnungen werden lokal gespeichert.
      </div>
    </div>
  )
}
