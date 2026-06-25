// =========================================================================
//  PROZESSKETTE — Funnel + Lieferketten/Wertschöpfungs-Split (Backlog #7).
// =========================================================================
import React, { useState } from 'react'
import { funnel, lieferkette, wertschoepfung, gesamtKonversion } from '../../core/prozesskette.js'

const card = { background: 'var(--panel)', border: '1px solid var(--line)', borderRadius: 'var(--radius)', boxShadow: 'var(--shadow)' }
const cap  = { fontSize: 11, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '.03em', fontWeight: 700 }
const eur  = (v) => (v / 1000000).toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' Mio €'
const pct  = (v) => `${v} %`

function FunnelStufe({ s, start, istLetzt }) {
  const breite = Math.max(20, s.wert / start * 100)
  return (
    <div>
      <div style={{ flex: 1, textAlign: 'center' }}>
        <div style={{
          width: `${breite}%`, minWidth: 140, margin: '0 auto',
          background: s.code === 'AEB' ? '#1d4ed8' : istLetzt ? 'var(--amp-g)' : 'var(--accent)',
          color: '#fff', borderRadius: 8, padding: '10px 14px', transition: 'width .2s',
          display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8 }}>
          <span style={{ fontWeight: 700, fontSize: 13 }}>
            <span style={{ opacity: .75, marginRight: 6, fontFamily: 'monospace' }}>{s.code}</span>{s.name}
          </span>
          <span style={{ fontWeight: 700, whiteSpace: 'nowrap', fontFamily: 'monospace' }}>{eur(s.wert)}</span>
        </div>
        <div style={{ textAlign: 'center', fontSize: 10.5, color: 'var(--muted)', marginTop: 3 }}>
          {pct(s.anteilStart)} vom Angebot{s.anteilStart < 100 ? ` · ${pct(s.stufenKonversion)} der Vorstufe` : ''}
          {s.kette && <span style={{ color: 'var(--accent)', fontWeight: 600 }}> · {s.kette}</span>}
        </div>
      </div>
      {!istLetzt && (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', margin: '4px 0' }}>
          {(s.abgaenge || []).map((a) => (
            <div key={a.name} style={{ fontSize: 11.5, color: 'var(--amp-r)' }}>
              ↘ − {eur(a.wert)} <span style={{ color: 'var(--muted)' }}>{a.name}</span>
            </div>
          ))}
          <div style={{ color: 'var(--muted)', fontSize: 14 }}>▼</div>
        </div>
      )}
    </div>
  )
}

function KetteStufe({ s, start, istLetzt, farbe }) {
  const breite = Math.max(20, s.wert / start * 100)
  return (
    <div>
      <div style={{ flex: 1, textAlign: 'center' }}>
        <div style={{
          width: `${breite}%`, minWidth: 100, margin: '0 auto', background: farbe,
          color: '#fff', borderRadius: 6, padding: '8px 12px', transition: 'width .2s',
          display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 6 }}>
          <span style={{ fontWeight: 600, fontSize: 12 }}>
            <span style={{ opacity: .7, marginRight: 5, fontFamily: 'monospace' }}>{s.code}</span>{s.name}
          </span>
          <span style={{ fontWeight: 700, whiteSpace: 'nowrap', fontSize: 12, fontFamily: 'monospace' }}>{eur(s.wert)}</span>
        </div>
        <div style={{ textAlign: 'center', fontSize: 10, color: 'var(--muted)', marginTop: 2 }}>
          {pct(s.anteilStart)} vom AEB{s.stufenKonversion < 100 ? ` · ${pct(s.stufenKonversion)} der Vorstufe` : ''}
        </div>
      </div>
      {!istLetzt && (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', margin: '4px 0' }}>
          {(s.abgaenge || []).filter((a) => a.wert).map((a) => (
            <div key={a.name} style={{ fontSize: 11, color: 'var(--amp-r)' }}>
              ↘ − {eur(a.wert)} <span style={{ color: 'var(--muted)' }}>{a.name}</span>
            </div>
          ))}
          <div style={{ color: 'var(--muted)', fontSize: 13 }}>▼</div>
        </div>
      )}
    </div>
  )
}

function Kpi({ label, wert, sub, farbe }) {
  return (
    <div style={{ ...card, padding: '10px 14px', flex: 1, minWidth: 150 }}>
      <div style={cap}>{label}</div>
      <div style={{ fontSize: 20, fontWeight: 700, color: farbe || 'var(--ink)' }}>{wert}</div>
      {sub && <div style={{ fontSize: 11, color: 'var(--muted)' }}>{sub}</div>}
    </div>
  )
}

export default function Prozesskette({ onGeh }) {
  const [ansicht, setAnsicht] = useState('split')
  const f   = funnel()
  const lk  = lieferkette()
  const wk  = wertschoepfung()
  const start = f[0].wert
  const aebWert = f.find((s) => s.code === 'AEB')?.wert || 0

  return (
    <div style={{ maxWidth: '100%', margin: '0 auto' }}>
      <div style={{ marginBottom: 14, display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap' }}>
        <div>
          <h2 style={{ margin: '0 0 4px' }}>Prozesskette: Angebot → Umsatz</h2>
          <div style={{ color: 'var(--muted)', fontSize: 13, maxWidth: 820 }}>
            Vom Angebotseingang bis zu den Umsatzerlösen. Ab dem <b>bereinigten Auftragseingang (AEB)</b> teilt sich der Prozess in{' '}
            <b>Lieferkette</b> (physischer Fluss) und <b>Wertschöpfungskette</b> (Geld-/Wertfluss).
          </div>
        </div>
        <div style={{ display: 'flex', border: '1px solid var(--line)', borderRadius: 'var(--radius-sm)', overflow: 'hidden' }}>
          {[['funnel', '▽ Funnel'], ['split', '⑃ Split']].map(([id, label]) => (
            <button key={id} onClick={() => setAnsicht(id)} style={{
              padding: '6px 14px', border: 'none', fontSize: 12.5, fontWeight: 600, cursor: 'pointer',
              background: ansicht === id ? 'var(--accent)' : 'var(--panel)',
              color: ansicht === id ? '#fff' : 'var(--muted)' }}>{label}</button>
          ))}
        </div>
      </div>

      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 18 }}>
        <Kpi label="Angebotseingang"    wert={eur(start)} />
        <Kpi label="AE bereinigt (AEB)" wert={eur(aebWert)} sub={`${Math.round(aebWert/start*100)} % vom Angebot`} farbe="var(--accent)" />
        <Kpi label="Umsatzerlöse"       wert={eur(wk[wk.length - 1].wert)} farbe="var(--amp-g)" />
        <Kpi label="Gesamtkonversion"   wert={`${gesamtKonversion()} %`} sub="Angebot → Umsatz" farbe="var(--accent)" />
      </div>

      {ansicht === 'funnel' && (
        <div style={{ ...card, padding: '20px 24px', marginBottom: 16 }}>
          <div style={{ ...cap, marginBottom: 14 }}>Linearer Funnel</div>
          {f.map((s, i) => <FunnelStufe key={s.code} s={s} start={start} istLetzt={i === f.length - 1} />)}
        </div>
      )}

      {ansicht === 'split' && (
        <>
          <div style={{ ...card, padding: '20px 24px', marginBottom: 0,
            borderBottomLeftRadius: 0, borderBottomRightRadius: 0, borderBottom: 'none' }}>
            <div style={{ ...cap, marginBottom: 14 }}>Phase 1 — Angebot bis bereinigter Auftragseingang</div>
            {f.map((s) => <FunnelStufe key={s.code} s={s} start={start} istLetzt={false} />)}
          </div>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center',
            padding: '8px 0', background: 'var(--bg)', border: '1px solid var(--line)', borderTop: 'none', borderBottom: 'none' }}>
            <span style={{ fontSize: 11, color: 'var(--muted)', fontWeight: 600, letterSpacing: '.04em', textTransform: 'uppercase' }}>
              Ab AEB: zwei parallele Ketten
            </span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 0,
            border: '1px solid var(--line)', borderTop: 'none',
            borderBottomLeftRadius: 'var(--radius)', borderBottomRightRadius: 'var(--radius)', overflow: 'hidden' }}>
            <div style={{ padding: '18px 20px', background: 'var(--panel)', borderRight: '1px solid var(--line)' }}>
              <div style={{ ...cap, marginBottom: 12, color: '#0369a1' }}>🔧 Lieferkette — physischer Fluss</div>
              <div style={{ fontSize: 11.5, color: 'var(--muted)', marginBottom: 12 }}>
                Wann ist das Produkt produziert, gelagert und versandt?
              </div>
              {lk.map((s, i) => <KetteStufe key={`lk-${i}`} s={s} start={lk[0].wert} istLetzt={i === lk.length - 1} farbe="#0369a1" />)}
            </div>
            <div style={{ padding: '18px 20px', background: 'var(--panel)' }}>
              <div style={{ ...cap, marginBottom: 12, color: 'var(--amp-g)' }}>💰 Wertschöpfungskette — Geld-/Wertfluss</div>
              <div style={{ fontSize: 11.5, color: 'var(--muted)', marginBottom: 12 }}>
                Wann wird fakturiert, und wann entsteht der Umsatz?
              </div>
              {wk.map((s, i) => <KetteStufe key={`wk-${i}`} s={s} start={wk[0].wert} istLetzt={i === wk.length - 1} farbe="var(--amp-g)" />)}
            </div>
          </div>

          <div style={{ fontSize: 12, color: 'var(--muted)', marginTop: 10 }}>
            <b>Lieferkette:</b> Produktionsauftrag → Fertigware → Versand. |{' '}
            <b>Wertschöpfung:</b> Fakturierter AE → Umsatzerlöse.
            {onGeh && <> Definitionen: <a style={{ color: 'var(--accent)', cursor: 'pointer' }} onClick={() => onGeh('vertriebkpi')}>Vertriebskennzahlen</a>.</>}
          </div>
        </>
      )}
    </div>
  )
}
