// =========================================================================
//  AUFTRAGS-STATUS-JOURNAL — Statuswechsel als datierte Buchungen, laufende
//  Bestände je Status, Kennzahlen (Auftragseingang, AEB, Auftragsbestand …)
//  und der Status-Verlauf je Auftrag (Datum je Statuswechsel).
// =========================================================================
import React, { useState } from 'react'
import { STATUS, STATUS_NAME, journal, kennzahlen, auftragHistorie, auftragsIds, fmtDatum } from '../../core/auftragsstatus.js'

const card = { background: 'var(--panel)', border: '1px solid var(--line)', borderRadius: 'var(--radius)', boxShadow: 'var(--shadow)' }
const cap = { fontSize: 11, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '.04em', fontWeight: 700 }
const th = (al) => ({ textAlign: al, padding: '6px 9px', borderBottom: '2px solid var(--line)', fontSize: 10, color: 'var(--muted)', textTransform: 'uppercase', whiteSpace: 'nowrap' })
const td = (al, bold) => ({ textAlign: al, padding: '6px 9px', borderBottom: '1px solid var(--line)', fontWeight: bold ? 700 : 400, whiteSpace: 'nowrap' })
const FARBE = Object.fromEntries(STATUS.map((s) => [s.id, s.farbe]))

export default function AuftragsStatus() {
  const [auftrag, setAuftrag] = useState(auftragsIds()[0])
  const j = journal()
  const k = kennzahlen()
  const hist = auftragHistorie(auftrag)
  const stk = (n) => n.toLocaleString('de-DE') + ' Stk'

  return (
    <div style={{ display: 'grid', gap: 14 }}>
      <div style={{ fontSize: 13, color: 'var(--slate)', maxWidth: 820 }}>
        Jeder <b>Statuswechsel ist eine datierte Buchung</b> (Menge wandert von Status zu Status). Daraus ergeben sich laufende Bestände
        je Status und die Kennzahlen — inklusive <b>AEB</b> (Auftragseingang bereinigt: ohne Storno & verlorene Angebote).
      </div>

      {/* Kennzahlen */}
      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
        {[['Auftragseingang', stk(k.auftragseingang), 'var(--accent)'], ['AEB (bereinigt)', stk(k.aeb), 'var(--amp-g)'], ['Auftragsbestand (offen)', stk(k.auftragsbestand), 'var(--accent)'], ['Geliefert', stk(k.geliefert), 'var(--amp-g)'], ['Storniert', stk(k.storniert), 'var(--amp-r)'], ['Bezahlt', stk(k.bezahlt), '#16a34a']].map(([l, v, c]) => (
        <div key={l} style={{ ...card, padding: '11px 13px', flex: 1, minWidth: 140, borderTop: `3px solid ${c}` }}>
          <div style={{ ...cap, marginBottom: 3 }}>{l}</div>
          <div className="mono" style={{ fontSize: 17, fontWeight: 800, color: c }}>{v}</div>
        </div>
        ))}
      </div>
      <div style={{ fontSize: 12, color: 'var(--muted)' }}>Stornoquote {k.stornoquote} % · Angebots-Erfolgsquote {k.angebotsErfolgsquote} % · verlorene Angebote {k.verloren} Stk · Umsatz geliefert {k.geliefertWert.toLocaleString('de-DE')} € · bezahlt {k.bezahltWert.toLocaleString('de-DE')} €</div>

      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(420px, 2fr) minmax(260px, 1fr)', gap: 14 }}>
        {/* Buchungsjournal */}
        <div style={{ ...card, overflow: 'auto' }}>
          <div style={{ ...cap, padding: '10px 12px 0' }}>Buchungsjournal — Statuswechsel mit laufendem Bestand</div>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12, marginTop: 8 }}>
            <thead><tr>
              <th style={th('left')}>Datum</th><th style={th('left')}>Auftrag</th><th style={th('left')}>Bewegung</th><th style={th('right')}>Menge</th>
              {['offen', 'geliefert', 'storniert', 'bezahlt'].map((s) => <th key={s} style={th('right')}>{STATUS_NAME[s]}</th>)}
            </tr></thead>
            <tbody>
              {j.map((b, i) => (
                <tr key={i}>
                  <td style={td('left', true)} className="mono">{fmtDatum(b.datum)}</td>
                  <td style={td('left')}>{b.auftrag}</td>
                  <td style={td('left')}>
                    <span style={{ color: 'var(--muted)' }}>{b.von ? STATUS_NAME[b.von] : '—'} → </span>
                    <span style={{ fontWeight: 600, color: FARBE[b.nach] }}>{STATUS_NAME[b.nach]}</span>
                    <span style={{ color: 'var(--muted)', fontSize: 11 }}> ({b.art})</span>
                  </td>
                  <td style={td('right', true)} className="mono">{b.menge}</td>
                  {['offen', 'geliefert', 'storniert', 'bezahlt'].map((s) => <td key={s} style={td('right')} className="mono">{b.bestand[s] || ''}</td>)}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Status-Verlauf je Auftrag */}
        <div style={{ ...card, padding: 14 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10, gap: 8 }}>
            <div style={cap}>Status-Verlauf (Datum je Wechsel)</div>
            <select value={auftrag} onChange={(e) => setAuftrag(e.target.value)} style={{ padding: '5px 8px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--line)', font: 'inherit', fontSize: 12.5, background: 'var(--panel)', color: 'var(--ink)' }}>
              {auftragsIds().map((id) => <option key={id} value={id}>{id}</option>)}
            </select>
          </div>
          <div style={{ display: 'grid', gap: 0 }}>
            {hist.map((b, i) => (
              <div key={i} style={{ display: 'grid', gridTemplateColumns: '20px 1fr', gap: 10 }}>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                  <span style={{ width: 11, height: 11, borderRadius: '50%', background: FARBE[b.nach], zIndex: 1 }} />
                  {i < hist.length - 1 && <span style={{ flex: 1, width: 2, background: 'var(--line)', minHeight: 16 }} />}
                </div>
                <div style={{ paddingBottom: 12 }}>
                  <div style={{ fontSize: 12.5, fontWeight: 600 }}><span className="mono">{fmtDatum(b.datum)}</span> {STATUS_NAME[b.nach]} <span className="mono" style={{ color: 'var(--muted)' }}>{b.menge} Stk</span></div>
                  <div style={{ fontSize: 11.5, color: 'var(--muted)' }}>{b.art}{b.von ? ` · aus „${STATUS_NAME[b.von]}"` : ''}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
