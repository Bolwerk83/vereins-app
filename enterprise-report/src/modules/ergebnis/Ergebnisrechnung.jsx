// =========================================================================
//  ERGEBNISRECHNUNG (Gesamtkostenverfahren) — Staffel + Ergebniskonto
//  (T-Konto) mit unseren Werten, dynamisch nach Datenart.
// =========================================================================
import React, { useState } from 'react'
import { DATENARTEN, ergebnis, tKonto } from '../../core/ergebnis.js'

const card = { background: 'var(--panel)', border: '1px solid var(--line)', borderRadius: 'var(--radius)', boxShadow: 'var(--shadow)' }
const cap = { fontSize: 11, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '.03em', fontWeight: 700 }
const m = (v) => v.toLocaleString('de-DE', { minimumFractionDigits: 1, maximumFractionDigits: 1 })

export default function Ergebnisrechnung({ onGeh }) {
  const [da, setDa] = useState('ist')
  const e = ergebnis(da)
  const t = tKonto(da)
  const chip = (aktiv) => ({ padding: '5px 12px', borderRadius: 999, fontSize: 12.5, cursor: 'pointer', fontWeight: 600,
    border: `1px solid ${aktiv ? 'var(--accent)' : 'var(--line)'}`, background: aktiv ? 'var(--accent)' : 'var(--panel)', color: aktiv ? '#fff' : 'var(--ink)' })
  const row = (name, wert, opt = {}) => (
    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid var(--line)', fontWeight: opt.bold ? 700 : 400, color: opt.farbe || 'var(--ink)' }}>
      <span>{opt.prefix || ''}{name}</span><span className="mono">{m(wert)}</span>
    </div>
  )

  return (
    <div style={{ maxWidth: 980, margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12, flexWrap: 'wrap', marginBottom: 14 }}>
        <div>
          <h2 style={{ margin: '0 0 4px' }}>Ergebnisrechnung — Gesamtkostenverfahren</h2>
          <div style={{ color: 'var(--muted)', fontSize: 13, maxWidth: 720 }}>
            Erträge − Aufwendungen = Betriebsergebnis. Einmal als <b>Staffel</b> und einmal als <b>Ergebniskonto</b>
            (T-Konto, Soll/Haben) — kompakt für das Reporting.
          </div>
        </div>
        {onGeh && <button onClick={() => onGeh('klr')} style={{ ...card, padding: '7px 12px', cursor: 'pointer', fontSize: 13, fontWeight: 600 }}>← zur KLR</button>}
      </div>

      <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap', marginBottom: 14 }}>
        <span style={cap}>Datenart:</span>
        {DATENARTEN.map((d) => <button key={d.id} style={chip(da === d.id)} onClick={() => setDa(d.id)}>{d.name}</button>)}
        <span style={{ marginLeft: 'auto', fontSize: 13 }}>Betriebsergebnis: <b style={{ color: t.gewinn ? 'var(--amp-g)' : 'var(--amp-r)', fontSize: 18 }}>{m(e.betriebsergebnis)} Mio €</b></span>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }} className="raster-2">
        {/* Staffel */}
        <div style={{ ...card, padding: 16 }}>
          <div style={{ ...cap, marginBottom: 8 }}>Staffelform (GuV)</div>
          {e.ertraege.map((p) => row(p.name, p.wert))}
          {row('Summe Erträge', e.summeErtrag, { bold: true })}
          <div style={{ height: 8 }} />
          {e.aufwendungen.map((p) => row(p.name, p.wert, { prefix: '− ' }))}
          {row('Summe Aufwendungen', e.summeAufwand, { bold: true, prefix: '− ' })}
          <div style={{ height: 8 }} />
          {row('= Betriebsergebnis', e.betriebsergebnis, { bold: true, farbe: t.gewinn ? 'var(--amp-g)' : 'var(--amp-r)' })}
        </div>

        {/* T-Konto */}
        <div style={{ ...card, padding: 16 }}>
          <div style={{ ...cap, marginBottom: 8 }}>Ergebniskonto (T-Konto)</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', border: '1px solid var(--line)', borderRadius: 'var(--radius-sm)', overflow: 'hidden' }}>
            <div style={{ borderRight: '1px solid var(--line)' }}>
              <div style={{ padding: '6px 10px', background: 'var(--bg)', fontWeight: 700, fontSize: 12, textAlign: 'center', borderBottom: '1px solid var(--line)' }}>SOLL (Aufwand)</div>
              {t.soll.map((p, i) => (
                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 10px', borderBottom: '1px solid var(--line)', fontSize: 12.5, color: p.saldo ? (t.gewinn ? 'var(--amp-g)' : 'var(--ink)') : 'var(--ink)', fontWeight: p.saldo ? 700 : 400 }}>
                  <span>{p.name}</span><span className="mono">{m(p.wert)}</span>
                </div>
              ))}
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 10px', fontWeight: 700, fontSize: 12.5 }}><span>Σ</span><span className="mono">{m(t.summe)}</span></div>
            </div>
            <div>
              <div style={{ padding: '6px 10px', background: 'var(--bg)', fontWeight: 700, fontSize: 12, textAlign: 'center', borderBottom: '1px solid var(--line)' }}>HABEN (Ertrag)</div>
              {t.haben.map((p, i) => (
                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 10px', borderBottom: '1px solid var(--line)', fontSize: 12.5, color: p.saldo ? 'var(--amp-r)' : 'var(--ink)', fontWeight: p.saldo ? 700 : 400 }}>
                  <span>{p.name}</span><span className="mono">{m(p.wert)}</span>
                </div>
              ))}
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 10px', fontWeight: 700, fontSize: 12.5 }}><span>Σ</span><span className="mono">{m(t.summe)}</span></div>
            </div>
          </div>
          <div style={{ fontSize: 12, color: 'var(--muted)', marginTop: 8 }}>
            Der Saldo gleicht beide Seiten aus: ein <b>Gewinn</b> steht im Soll, ein Verlust im Haben. Summen sind identisch.
          </div>
        </div>
      </div>

      <div style={{ fontSize: 12, color: 'var(--muted)', marginTop: 12 }}>
        Gesamtkostenverfahren: alle Aufwendungen der Periode (inkl. Bestandsveränderung auf der Ertragsseite). Das
        Umsatzkostenverfahren stellt stattdessen Umsatz den Selbstkosten der verkauften Produkte gegenüber.
      </div>
    </div>
  )
}
