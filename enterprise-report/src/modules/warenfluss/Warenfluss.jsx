// =========================================================================
//  WARENFLUSS & VORSCHAU — Bestandsfortschreibung (Anfang + Eingang − Ausgang
//  = Ende) je Tag/Woche/Monat/Quartal über Ist (Vergangenheit) und Plan
//  (Zukunft), für Lager, Auftragsbestand und Liquidität. Plus Stichtags-
//  Hochrechnung (Landepunkt zum 31.10.) für Plan-Kennzahlen (Umsatz, EBIT).
// =========================================================================
import React, { useState } from 'react'
import { FLOWS, GRANULARITAETEN, fortschreibung, flussLandung, STICHTAG_KPIS, STICHTAG_LABEL, stichtagHochrechnung } from '../../core/warenfluss.js'
import { formatWert } from '../../design/theme.js'

const card = { background: 'var(--panel)', border: '1px solid var(--line)', borderRadius: 'var(--radius)', boxShadow: 'var(--shadow)' }
const cap = { fontSize: 11, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '.04em', fontWeight: 700 }
const th = (al) => ({ textAlign: al, padding: '6px 9px', borderBottom: '2px solid var(--line)', fontSize: 10.5, color: 'var(--muted)', textTransform: 'uppercase', whiteSpace: 'nowrap' })
const td = (al, bold) => ({ textAlign: al, padding: '6px 9px', borderBottom: '1px solid var(--line)', fontWeight: bold ? 700 : 400, whiteSpace: 'nowrap' })
const chip = (aktiv) => ({ padding: '5px 11px', borderRadius: 999, fontSize: 12.5, cursor: 'pointer', fontWeight: 600, border: `1px solid ${aktiv ? 'var(--accent)' : 'var(--line)'}`, background: aktiv ? 'var(--accent)' : 'var(--panel)', color: aktiv ? '#fff' : 'var(--ink)' })
const AMP = { g: 'var(--amp-g)', a: 'var(--amp-a)', r: 'var(--amp-r)' }

// Bestands-Verlauf: Ist solide, Plan gestrichelt, Stichtag-Markierung.
function FlussChart({ zeilen, einheit, stichtagIdx }) {
  const W = 720, H = 150, pad = 8
  const werte = zeilen.map((z) => z.ende)
  const min = Math.min(...werte, 0), max = Math.max(...werte)
  const sp = max - min || 1
  const x = (i) => pad + i / Math.max(1, zeilen.length - 1) * (W - 2 * pad)
  const y = (v) => H - pad - (v - min) / sp * (H - 2 * pad)
  const istPunkte = zeilen.map((z, i) => ({ i, z })).filter(({ z }) => z.status !== 'plan')
  const planAb = zeilen.findIndex((z) => z.status === 'plan')
  const pfad = (pts) => pts.map((p, k) => `${k ? 'L' : 'M'}${x(p.i).toFixed(1)},${y(p.z.ende).toFixed(1)}`).join(' ')
  const istLinie = pfad(istPunkte)
  const planLinie = planAb >= 0 ? pfad(zeilen.map((z, i) => ({ i, z })).slice(Math.max(0, planAb - 1))) : ''
  const stichtagBucket = zeilen.findIndex((z) => z.von <= stichtagIdx && z.bis >= stichtagIdx)
  return (
    <svg viewBox={`0 0 ${W} ${H}`} style={{ width: '100%', height: H }}>
      <line x1={pad} y1={y(0)} x2={W - pad} y2={y(0)} stroke="var(--line)" strokeDasharray="2 3" />
      {planAb > 0 && <line x1={x(planAb - 0.5)} y1={pad} x2={x(planAb - 0.5)} y2={H - pad} stroke="var(--accent)" strokeWidth="1" strokeDasharray="3 3" opacity=".6" />}
      {planAb > 0 && <text x={x(planAb - 0.5) + 3} y={pad + 9} style={{ fontSize: 9, fill: 'var(--accent)' }}>heute</text>}
      {stichtagBucket >= 0 && <line x1={x(stichtagBucket)} y1={pad} x2={x(stichtagBucket)} y2={H - pad} stroke="var(--amp-a)" strokeWidth="1.5" />}
      {stichtagBucket >= 0 && <text x={x(stichtagBucket) - 2} y={pad + 9} textAnchor="end" style={{ fontSize: 9, fill: 'var(--amp-a)', fontWeight: 700 }}>{STICHTAG_LABEL}</text>}
      <path d={istLinie} fill="none" stroke="var(--accent)" strokeWidth="2.2" />
      {planLinie && <path d={planLinie} fill="none" stroke="var(--accent)" strokeWidth="2" strokeDasharray="5 4" opacity=".8" />}
      {stichtagBucket >= 0 && <circle cx={x(stichtagBucket)} cy={y(zeilen[stichtagBucket].ende)} r="3.5" fill="var(--amp-a)" />}
    </svg>
  )
}

function FlussTab() {
  const [flowId, setFlowId] = useState('lager')
  const [gran, setGran] = useState('monat')
  const f = fortschreibung(flowId, gran)
  const l = flussLandung(flowId)
  const fmt = (v) => formatWert(v, f.einheit)
  const flow = f.flow
  return (
    <div style={{ display: 'grid', gap: 14 }}>
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
        {Object.values(FLOWS).map((fl) => <button key={fl.id} style={chip(flowId === fl.id)} onClick={() => setFlowId(fl.id)}>{fl.name}</button>)}
        <span style={{ flex: 1 }} />
        <span style={{ ...cap, marginRight: 2 }}>Raster:</span>
        <div style={{ display: 'flex', border: '1px solid var(--line)', borderRadius: 'var(--radius-sm)', overflow: 'hidden' }}>
          {GRANULARITAETEN.map(([id, n]) => (
            <button key={id} onClick={() => setGran(id)} style={{ padding: '5px 11px', border: 'none', fontSize: 12.5, fontWeight: 600, cursor: 'pointer', background: gran === id ? 'var(--accent)' : 'var(--panel)', color: gran === id ? '#fff' : 'var(--muted)' }}>{n}</button>
          ))}
        </div>
      </div>

      <div style={{ ...card, padding: 14 }}>
        <div style={{ ...cap, marginBottom: 6 }}>{flow.bestandLabel} — Verlauf (Ist solide · Plan gestrichelt)</div>
        <FlussChart zeilen={f.zeilen} einheit={f.einheit} stichtagIdx={f.stichtagIdx} />
      </div>

      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
        {[['Heute', l.heute, 'var(--ink)'], [`Voraussichtlich ${STICHTAG_LABEL}`, l.stichtag, 'var(--accent)'], ['Veränderung bis Stichtag', l.delta, l.delta >= 0 ? 'var(--amp-g)' : 'var(--amp-r)']].map(([t, v, c]) => (
          <div key={t} style={{ ...card, padding: '12px 14px', flex: 1, minWidth: 170, borderTop: `3px solid ${c}` }}>
            <div style={{ ...cap, marginBottom: 3 }}>{t}</div>
            <div className="mono" style={{ fontSize: 19, fontWeight: 800, color: c }}>{v >= 0 || t.startsWith('Ver') ? (t.startsWith('Ver') && v >= 0 ? '+' : '') : ''}{fmt(v)}</div>
          </div>
        ))}
      </div>

      <div style={{ ...card, overflow: 'auto' }}>
        <div style={{ ...cap, padding: '10px 12px 0' }}>Fortschreibung: Anfang + Eingang − Ausgang = Ende</div>
        <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: 8, fontSize: 12.5 }}>
          <thead><tr>
            <th style={th('left')}>Periode</th><th style={th('left')}>Status</th><th style={th('right')}>Anfang</th>
            <th style={th('right')}>+ {flow.einLabel}</th><th style={th('right')}>− {flow.ausLabel}</th><th style={th('right')}>= Ende</th>
          </tr></thead>
          <tbody>
            {f.zeilen.map((z, i) => (
              <tr key={i} style={{ background: z.status === 'laufend' ? 'var(--accent-soft)' : 'transparent' }}>
                <td style={td('left', true)}>{z.label}</td>
                <td style={td('left')}>
                  <span style={{ fontSize: 10.5, fontWeight: 700, padding: '1px 7px', borderRadius: 999,
                    background: z.status === 'ist' ? '#e0e7ff' : z.status === 'plan' ? '#fef3c7' : 'var(--accent-soft)',
                    color: z.status === 'ist' ? '#3730a3' : z.status === 'plan' ? '#92400e' : 'var(--accent)' }}>
                    {z.status === 'ist' ? 'Ist' : z.status === 'plan' ? 'Plan' : 'heute'}
                  </span>
                </td>
                <td style={td('right')} className="mono">{fmt(z.anfang)}</td>
                <td style={{ ...td('right'), color: 'var(--amp-g)' }} className="mono">+{fmt(z.ein)}</td>
                <td style={{ ...td('right'), color: 'var(--amp-r)' }} className="mono">−{fmt(z.aus)}</td>
                <td style={td('right', true)} className="mono">{fmt(z.ende)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

// Stichtags-Hochrechnung der Plan-Kennzahlen (Landepunkt zum 31.10.).
function StichtagKpis() {
  const [methode, setMethode] = useState('runrate')
  const reihen = STICHTAG_KPIS.map((k) => ({ meta: k, h: stichtagHochrechnung(k.id, { methode }) }))
  const fmt = (v, e) => formatWert(v, e)
  return (
    <div style={{ display: 'grid', gap: 12 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 8 }}>
        <div style={{ fontSize: 13, color: 'var(--slate)', maxWidth: 720 }}>
          Wo landen wir <b>zum {STICHTAG_LABEL}</b>? YTD-Ist plus hochgerechnetes Restjahr bis zum Stichtag — für jede Plan-Kennzahl.
        </div>
        <div style={{ display: 'flex', border: '1px solid var(--line)', borderRadius: 'var(--radius-sm)', overflow: 'hidden' }}>
          {[['runrate', 'Run-Rate'], ['plantreu', 'Plan-treu']].map(([id, n]) => (
            <button key={id} onClick={() => setMethode(id)} style={{ padding: '5px 11px', border: 'none', fontSize: 12, fontWeight: 600, cursor: 'pointer', background: methode === id ? 'var(--accent)' : 'var(--panel)', color: methode === id ? '#fff' : 'var(--muted)' }}>{n}</button>
          ))}
        </div>
      </div>
      <div style={{ ...card, overflow: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
          <thead><tr>
            {['Kennzahl', `YTD-Ist (bis ${reihen[0]?.h.letzterIstName})`, 'Restjahr (hochgerechnet)', `Landepunkt ${STICHTAG_LABEL}`, `Plan ${STICHTAG_LABEL}`, 'Abweichung'].map((h, i) => (
              <th key={i} style={th(i === 0 ? 'left' : 'right')}>{h}</th>
            ))}
          </tr></thead>
          <tbody>
            {reihen.map(({ meta, h }) => (
              <tr key={meta.id}>
                <td style={td('left', true)}>{h.name}</td>
                <td style={td('right')} className="mono">{fmt(h.ytdIst, h.einheit)}</td>
                <td style={td('right')} className="mono">+{fmt(h.restFc, h.einheit)}</td>
                <td style={td('right', true)} className="mono">{fmt(h.landung, h.einheit)}</td>
                <td style={td('right')} className="mono">{fmt(h.planStichtag, h.einheit)}</td>
                <td style={{ ...td('right', true), color: AMP[h.status] }} className="mono">{h.abw >= 0 ? '+' : ''}{fmt(h.abw, h.einheit)} ({h.abwPct >= 0 ? '+' : ''}{h.abwPct} %)</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div style={{ fontSize: 11.5, color: 'var(--muted)' }}>
        Run-Rate schreibt das Restjahr mit der bisherigen Plan-Erreichung fort; Plan-treu unterstellt, dass das Restjahr den Plan trifft.
        Erweiterbar auf alle Plan-Kennzahlen (eigene Monatsserie je KPI).
      </div>
    </div>
  )
}

export default function Warenfluss() {
  const [tab, setTab] = useState('fluss')
  return (
    <div style={{ display: 'grid', gap: 14 }}>
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        {[['fluss', 'Fluss & Vorschau'], ['stichtag', `Stichtags-Hochrechnung (${STICHTAG_LABEL})`]].map(([id, n]) => (
          <button key={id} style={chip(tab === id)} onClick={() => setTab(id)}>{n}</button>
        ))}
      </div>
      {tab === 'fluss' ? <FlussTab /> : <StichtagKpis />}
    </div>
  )
}
