// =========================================================================
//  VERSAND-COCKPIT — Versanderlöse ↔ tatsächliche Versandkosten:
//  Über-/Unterdeckung gesamt und je Gewichtsklasse, Carrier-Vergleich,
//  Region und Retouren-Versandkosten.
// =========================================================================
import React, { useState } from 'react'
import { segmente, aggregiere, summe, ueberblick } from '../../core/versand.js'
import { pcFaktor } from '../../core/statistikFilter.js'
import PcFilter, { ladePc, speicherePc, pcHinweis } from '../shared/PcFilter.jsx'

const card = { background: 'var(--panel)', border: '1px solid var(--line)', borderRadius: 'var(--radius)', boxShadow: 'var(--shadow)' }
const cap = { fontSize: 11, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '.04em', fontWeight: 700 }
const chip = (a) => ({ padding: '6px 13px', borderRadius: 999, fontSize: 13, cursor: 'pointer', fontWeight: 600,
  border: `1px solid ${a ? 'var(--accent)' : 'var(--line)'}`, background: a ? 'var(--accent)' : 'var(--panel)', color: a ? '#fff' : 'var(--ink)' })
const eur = (n) => Math.round(n).toLocaleString('de-DE') + ' €'
const teur = (n) => Math.round(n / 1000).toLocaleString('de-DE') + ' T€'
const pct = (n) => n.toLocaleString('de-DE', { minimumFractionDigits: 0, maximumFractionDigits: 0 }) + ' %'
const deckColor = (q) => q >= 100 ? 'var(--amp-g)' : q >= 80 ? 'var(--amp-a)' : 'var(--amp-r)'

function Tile({ label, value, sub, color }) {
  return (
    <div style={{ ...card, padding: '12px 14px', flex: 1, minWidth: 150, borderTop: `3px solid ${color || 'var(--accent)'}` }}>
      <div style={{ ...cap, marginBottom: 3 }}>{label}</div>
      <div className="mono" style={{ fontSize: 20, fontWeight: 700, color: color || 'var(--ink)' }}>{value}</div>
      {sub && <div style={{ fontSize: 12, color: 'var(--muted)', marginTop: 2 }}>{sub}</div>}
    </div>
  )
}

// Erlös-vs-Kosten-Balkenpaar je Zeile
function DeckBars({ rows, dimKey }) {
  const max = Math.max(...rows.map((r) => Math.max(r.erloes, r.kosten)), 1)
  return (
    <div style={{ display: 'grid', gap: 12 }}>
      {rows.map((r) => (
        <div key={r[dimKey]}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12.5, marginBottom: 3 }}>
            <span style={{ fontWeight: 600 }}>{r[dimKey]} <span style={{ color: 'var(--muted)', fontWeight: 400 }}>· {r.anzahl.toLocaleString('de-DE')} Sdg.</span></span>
            <span style={{ color: deckColor(r.deckungsquote), fontWeight: 700 }}>Deckung {pct(r.deckungsquote)} · {r.deckung >= 0 ? '+' : '−'}{teur(Math.abs(r.deckung))}</span>
          </div>
          <div style={{ display: 'grid', gap: 3 }}>
            <div title={`Erlös ${eur(r.erloes)}`} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{ width: 44, fontSize: 10, color: 'var(--muted)' }}>Erlös</span>
              <div style={{ flex: 1, background: 'var(--bg)', borderRadius: 3, height: 13, overflow: 'hidden', border: '1px solid var(--line)' }}><div style={{ width: `${r.erloes / max * 100}%`, height: '100%', background: 'var(--accent)' }} /></div>
              <span className="mono" style={{ width: 64, textAlign: 'right', fontSize: 11 }}>{teur(r.erloes)}</span>
            </div>
            <div title={`Kosten ${eur(r.kosten)}`} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{ width: 44, fontSize: 10, color: 'var(--muted)' }}>Kosten</span>
              <div style={{ flex: 1, background: 'var(--bg)', borderRadius: 3, height: 13, overflow: 'hidden', border: '1px solid var(--line)' }}><div style={{ width: `${r.kosten / max * 100}%`, height: '100%', background: '#ef4444' }} /></div>
              <span className="mono" style={{ width: 64, textAlign: 'right', fontSize: 11 }}>{teur(r.kosten)}</span>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

function DeckTabelle({ rows, dimKey, label }) {
  return (
    <div style={{ ...card, padding: 16, overflowX: 'auto' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12.5 }}>
        <thead><tr>{[label, 'Sendungen', 'Ø Kosten/Sdg.', 'Erlöse', 'Kosten', 'Deckung', 'Quote'].map((h, i) => (
          <th key={i} style={{ textAlign: i >= 1 ? 'right' : 'left', padding: '6px 8px', borderBottom: '2px solid var(--line)', fontSize: 10, color: 'var(--muted)', textTransform: 'uppercase' }}>{h}</th>
        ))}</tr></thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r[dimKey]}>
              <td style={{ padding: '5px 8px', borderBottom: '1px solid var(--line)', fontWeight: 600 }}>{r[dimKey]}</td>
              <td className="mono" style={{ padding: '5px 8px', borderBottom: '1px solid var(--line)', textAlign: 'right' }}>{r.anzahl.toLocaleString('de-DE')}</td>
              <td className="mono" style={{ padding: '5px 8px', borderBottom: '1px solid var(--line)', textAlign: 'right', color: 'var(--muted)' }}>{eur(r.kosten / r.anzahl)}</td>
              <td className="mono" style={{ padding: '5px 8px', borderBottom: '1px solid var(--line)', textAlign: 'right' }}>{teur(r.erloes)}</td>
              <td className="mono" style={{ padding: '5px 8px', borderBottom: '1px solid var(--line)', textAlign: 'right' }}>{teur(r.kosten)}</td>
              <td className="mono" style={{ padding: '5px 8px', borderBottom: '1px solid var(--line)', textAlign: 'right', fontWeight: 700, color: deckColor(r.deckungsquote) }}>{r.deckung >= 0 ? '+' : '−'}{teur(Math.abs(r.deckung))}</td>
              <td className="mono" style={{ padding: '5px 8px', borderBottom: '1px solid var(--line)', textAlign: 'right', color: deckColor(r.deckungsquote) }}>{pct(r.deckungsquote)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

function Uebersicht({ fk }) {
  const u = ueberblick(fk)
  const klassen = aggregiere('klasse', 'Versand', fk)
  return (
    <>
      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 14 }}>
        <Tile label="Versanderlöse" value={teur(u.versand.erloes)} sub={`${u.versand.anzahl.toLocaleString('de-DE')} Sendungen`} />
        <Tile label="Versandkosten (Carrier)" value={teur(u.versand.kosten)} color="#ef4444" />
        <Tile label="Deckung Versand" value={`${u.versand.deckung >= 0 ? '+' : '−'}${teur(Math.abs(u.versand.deckung))}`} sub={`Quote ${pct(u.versand.deckungsquote)}`} color={deckColor(u.versand.deckungsquote)} />
        <Tile label="+ Retouren-Versand" value={teur(u.retoure.kosten)} sub={`${u.retoure.anzahl.toLocaleString('de-DE')} Retouren`} color="#f59e0b" />
        <Tile label="Netto-Deckung" value={`${u.netto.deckung >= 0 ? '+' : '−'}${teur(Math.abs(u.netto.deckung))}`} sub={`Quote ${pct(u.netto.deckungsquote)}`} color={deckColor(u.netto.deckungsquote)} />
      </div>

      <div style={{ ...card, padding: 16, marginBottom: 14, borderLeft: '4px solid var(--amp-r)' }}>
        <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 2 }}>Versand ist deutlich unterdeckt — Treiber: Gratis-Bike-Versand & Gratis-Retouren</div>
        <div style={{ fontSize: 13, color: 'var(--slate)', lineHeight: 1.5 }}>
          Allein der kostenlose Bike-Versand verursacht <b>{teur(u.gratisVersandKosten)}</b> Kosten ohne Erlös, dazu
          {' '}<b>{teur(u.retoure.kosten)}</b> Retouren-Versand. Pakete (Teile/Zubehör) sind dagegen leicht überdeckt.
          Hebel: Freigrenze prüfen, Sperrgut-Zuschlag, Carrier nachverhandeln, Retouren-Beteiligung.
        </div>
      </div>

      <div style={{ ...card, padding: 16 }}>
        <div style={{ ...cap, marginBottom: 10 }}>Erlös ↔ Kosten je Gewichtsklasse (Versand)</div>
        <DeckBars rows={klassen} dimKey="klasse" />
      </div>
    </>
  )
}

const VIEWS = [
  { id: 'uebersicht', name: 'Über-/Unterdeckung' },
  { id: 'carrier', name: 'Carrier-Vergleich' },
  { id: 'region', name: 'Region' },
  { id: 'retoure', name: 'Retouren-Versand' }
]

export default function Versand() {
  const [view, setView] = useState('uebersicht')
  const [pc, setPc] = useState(() => ladePc('versand'))
  const aenderePc = (v) => { setPc(v); speicherePc('versand', v) }
  const fk = pcFaktor(pc)
  return (
    <div style={{ maxWidth: '100%', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', gap: 12, flexWrap: 'wrap', marginBottom: 12 }}>
        <div>
          <div style={cap}>Versand-Controlling · Erlöse ↔ tatsächliche Kosten</div>
          <h2 style={{ margin: '4px 0 0' }}>Versand-Cockpit{pcHinweis(pc)}</h2>
        </div>
        <button className="no-print" onClick={() => window.print()} style={{ padding: '7px 13px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--line)', background: 'var(--panel)', cursor: 'pointer', fontSize: 13, fontWeight: 600 }}>🖨 Drucken / PDF</button>
      </div>
      <PcFilter pc={pc} onChange={aenderePc} hinweis="Sendungen/Erlöse/Kosten anteilig je Profit-Center; Deckungsquoten bleiben unverändert." />
      <div style={{ display: 'flex', gap: 8, marginBottom: 14, flexWrap: 'wrap' }}>
        {VIEWS.map((v) => <button key={v.id} style={chip(view === v.id)} onClick={() => setView(v.id)}>{v.name}</button>)}
      </div>

      {view === 'uebersicht' && <Uebersicht fk={fk} />}
      {view === 'carrier' && <DeckTabelle rows={aggregiere('carrier', undefined, fk)} dimKey="carrier" label="Carrier" />}
      {view === 'region' && <DeckTabelle rows={aggregiere('region', undefined, fk)} dimKey="region" label="Region" />}
      {view === 'retoure' && (
        <>
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 14 }}>
            <Tile label="Retouren-Versandkosten" value={teur(summe('Retoure', fk).kosten)} sub={`${summe('Retoure', fk).anzahl.toLocaleString('de-DE')} Retouren`} color="#f59e0b" />
            <Tile label="Ø Kosten je Retoure" value={eur(summe('Retoure', fk).kosten / (summe('Retoure', fk).anzahl || 1))} />
          </div>
          <DeckTabelle rows={aggregiere('carrier', 'Retoure', fk)} dimKey="carrier" label="Carrier (Retoure)" />
        </>
      )}

      <div style={{ fontSize: 11, color: 'var(--muted)', textAlign: 'center', padding: '14px 0 20px' }}>Demo-Daten (Mock) · Versanderlöse = vom Kunden berechnet, Versandkosten = tatsächliche Carrier-Kosten.</div>
    </div>
  )
}
