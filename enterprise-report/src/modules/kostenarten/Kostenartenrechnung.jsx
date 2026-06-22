// =========================================================================
//  KOSTENARTENRECHNUNG — starke, mehrdimensionale Auswertung der Kosten:
//  nach Art, Funktion, Beschäftigung (fix/variabel), Zurechenbarkeit
//  (Einzel/Gemein) und Herkunft (primär/sekundär) — inkl. Kreuztabelle.
// =========================================================================
import React, { useState } from 'react'
import { DIMENSIONEN, dimension, STAMM, summe, verteilung, kreuztabelle, strukturKennzahlen } from '../../core/kostenarten.js'
import { darfDimension } from '../../core/rbac.js'

const card = { background: 'var(--panel)', border: '1px solid var(--line)', borderRadius: 'var(--radius)', boxShadow: 'var(--shadow)' }
const cap = { fontSize: 11, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '.03em', fontWeight: 700 }
const mio = (v) => v.toLocaleString('de-DE', { minimumFractionDigits: 1, maximumFractionDigits: 1 }) + ' Mio €'
const FARBEN = ['#2563eb', '#0f766e', '#7c3aed', '#f59e0b', '#ef4444', '#0891b2', '#65a30d']

export default function Kostenartenrechnung({ onGeh, rolle }) {
  // Nur Dimensionen, die für die Rolle freigegeben sind (Aufriss-Sperre).
  const sichtDim = DIMENSIONEN.filter((d) => darfDimension(rolle, d.id))
  const erste = sichtDim[0]?.id || 'art'
  const [dim, setDimState] = useState(erste)
  const [spalteDim, setSpalteDimState] = useState(sichtDim.find((d) => d.id !== erste)?.id || erste)
  // Falls die aktive Dimension gesperrt wurde: auf erste sichtbare zurückfallen.
  const setDim = (id) => setDimState(darfDimension(rolle, id) ? id : erste)
  const setSpalteDim = (id) => setSpalteDimState(darfDimension(rolle, id) ? id : erste)
  const aktivDim = darfDimension(rolle, dim) ? dim : erste
  const aktivSpalte = darfDimension(rolle, spalteDim) && spalteDim !== aktivDim ? spalteDim : (sichtDim.find((d) => d.id !== aktivDim)?.id || aktivDim)
  const k = strukturKennzahlen()
  const vert = verteilung(aktivDim)
  const kreuz = kreuztabelle(aktivDim, aktivSpalte)
  const maxA = Math.max(...vert.map((v) => v.anteil), 1)

  const chip = (aktiv) => ({ padding: '6px 12px', borderRadius: 999, fontSize: 13, cursor: 'pointer', fontWeight: 600,
    border: `1px solid ${aktiv ? 'var(--accent)' : 'var(--line)'}`, background: aktiv ? 'var(--accent)' : 'var(--panel)', color: aktiv ? '#fff' : 'var(--ink)' })
  const kachel = (label, wert, hint) => (
    <div style={{ ...card, padding: '12px 14px', flex: 1, minWidth: 150 }}>
      <div style={cap}>{label}</div>
      <div style={{ fontSize: 22, fontWeight: 700, marginTop: 2 }}>{wert}</div>
      {hint && <div style={{ fontSize: 11, color: 'var(--muted)' }}>{hint}</div>}
    </div>
  )

  return (
    <div style={{ maxWidth: '100%', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12, flexWrap: 'wrap', marginBottom: 14 }}>
        <div>
          <h2 style={{ margin: '0 0 4px' }}>Kostenartenrechnung</h2>
          <div style={{ color: 'var(--muted)', fontSize: 13, maxWidth: 720 }}>
            „Welche Kosten entstehen?" — die Kostenstruktur aus jedem Blickwinkel: nach Art, Funktion,
            Beschäftigung (fix/variabel), Zurechenbarkeit und Herkunft.
          </div>
        </div>
        {onGeh && <button onClick={() => onGeh('klr')} style={{ ...chip(false), whiteSpace: 'nowrap' }}>← zur KLR-Übersicht</button>}
      </div>

      {/* Kennzahlen */}
      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 14 }}>
        {kachel('Gesamtkosten', mio(k.gesamt))}
        {kachel('Fixkostenquote', k.fixquote + ' %', 'variabel ' + k.variabelquote + ' %')}
        {kachel('Gemeinkostenquote', k.gemeinquote + ' %', 'Einzel ' + k.einzelquote + ' %')}
        {kachel('Kalkulatorisch', k.kalkquote + ' %', 'sekundäre Kostenarten')}
      </div>

      {/* Verteilung über eine Dimension */}
      <div style={{ ...card, padding: 16, marginBottom: 14 }}>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 12 }}>
          {sichtDim.map((d) => <button key={d.id} title={d.laie} style={chip(aktivDim === d.id)} onClick={() => setDim(d.id)}>{d.name}</button>)}
          {sichtDim.length < DIMENSIONEN.length && <span style={{ fontSize: 11, color: 'var(--muted)', alignSelf: 'center' }}>🔒 {DIMENSIONEN.length - sichtDim.length} Dimension(en) für deine Rolle gesperrt</span>}
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {vert.map((v, i) => (
            <div key={v.key} style={{ display: 'grid', gridTemplateColumns: '200px 1fr 120px', gap: 10, alignItems: 'center' }}>
              <span style={{ fontSize: 13, fontWeight: 600 }}>{v.label}</span>
              <div style={{ background: 'var(--bg)', borderRadius: 6, height: 18, overflow: 'hidden' }}>
                <div style={{ width: `${(v.anteil / maxA) * 100}%`, height: '100%', background: FARBEN[i % FARBEN.length] }} />
              </div>
              <span className="mono" style={{ fontSize: 12.5, textAlign: 'right' }}>{mio(v.betrag)} · {v.anteil} %</span>
            </div>
          ))}
        </div>
      </div>

      {/* Kreuztabelle */}
      <div style={{ ...card, padding: 16, marginBottom: 14 }}>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap', marginBottom: 10 }}>
          <span style={cap}>Kreuztabelle:</span>
          <b style={{ fontSize: 13 }}>{dimension(aktivDim).name}</b><span style={{ color: 'var(--muted)' }}>×</span>
          <select value={aktivSpalte} onChange={(e) => setSpalteDim(e.target.value)} style={{ padding: '5px 8px', border: '1px solid var(--line)', borderRadius: 'var(--radius-sm)', font: 'inherit', fontSize: 13 }}>
            {sichtDim.filter((d) => d.id !== aktivDim).map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}
          </select>
        </div>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
            <thead><tr>
              <th style={{ textAlign: 'left', padding: '6px 10px', borderBottom: '1px solid var(--line)', fontSize: 11, color: 'var(--muted)' }}>{dimension(aktivDim).name}</th>
              {kreuz.spalten.map((s) => <th key={s.key} style={{ textAlign: 'right', padding: '6px 10px', borderBottom: '1px solid var(--line)', fontSize: 11, color: 'var(--muted)' }}>{s.label}</th>)}
              <th style={{ textAlign: 'right', padding: '6px 10px', borderBottom: '1px solid var(--line)', fontSize: 11, color: 'var(--muted)' }}>Σ</th>
            </tr></thead>
            <tbody>
              {kreuz.zeilen.map((z) => (
                <tr key={z.key}>
                  <td style={{ padding: '6px 10px', borderBottom: '1px solid var(--line)', fontWeight: 600 }}>{z.label}</td>
                  {kreuz.spalten.map((s) => <td key={s.key} className="mono" style={{ textAlign: 'right', padding: '6px 10px', borderBottom: '1px solid var(--line)', color: z.zellen[s.key] ? 'var(--ink)' : 'var(--muted)' }}>{z.zellen[s.key] ? z.zellen[s.key].toFixed(1) : '–'}</td>)}
                  <td className="mono" style={{ textAlign: 'right', padding: '6px 10px', borderBottom: '1px solid var(--line)', fontWeight: 700 }}>{z.summe.toFixed(1)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Positionstabelle mit allen Klassifikationen */}
      <div style={{ ...card, padding: 16 }}>
        <div style={{ ...cap, marginBottom: 10 }}>Kostenarten ({STAMM.length})</div>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
            <thead><tr>
              {['Kostenart', 'Mio €', '% ', 'Art', 'Funktion', 'fix/var', 'Zurechnung', 'Herkunft'].map((h, i) => (
                <th key={h} style={{ textAlign: i === 0 ? 'left' : i < 3 ? 'right' : 'left', padding: '6px 10px', borderBottom: '1px solid var(--line)', fontSize: 11, color: 'var(--muted)', textTransform: 'uppercase' }}>{h}</th>
              ))}
            </tr></thead>
            <tbody>
              {STAMM.map((p) => (
                <tr key={p.name}>
                  <td style={{ padding: '6px 10px', borderBottom: '1px solid var(--line)', fontWeight: 600 }}>{p.name}{p.kalk && <span style={{ marginLeft: 6, fontSize: 10, color: 'var(--accent)' }}>kalk.</span>}</td>
                  <td className="mono" style={{ textAlign: 'right', padding: '6px 10px', borderBottom: '1px solid var(--line)' }}>{p.betrag.toFixed(1)}</td>
                  <td className="mono" style={{ textAlign: 'right', padding: '6px 10px', borderBottom: '1px solid var(--line)', color: 'var(--muted)' }}>{(p.betrag / summe() * 100).toFixed(1)}</td>
                  <td style={{ padding: '6px 10px', borderBottom: '1px solid var(--line)' }}>{dimension('art').labels[p.art]}</td>
                  <td style={{ padding: '6px 10px', borderBottom: '1px solid var(--line)' }}>{dimension('funktion').labels[p.funktion]}</td>
                  <td style={{ padding: '6px 10px', borderBottom: '1px solid var(--line)' }}>{dimension('fixvar').labels[p.fixvar]}</td>
                  <td style={{ padding: '6px 10px', borderBottom: '1px solid var(--line)' }}>{dimension('zurechnung').labels[p.zurechnung]}</td>
                  <td style={{ padding: '6px 10px', borderBottom: '1px solid var(--line)' }}>{dimension('herkunft').labels[p.herkunft]}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
