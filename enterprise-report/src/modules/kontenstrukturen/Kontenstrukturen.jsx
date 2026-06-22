// =========================================================================
//  SACHKONTO-STRUKTUREN — mehrere parallele Kontenbäume über denselben
//  Kontenstamm (GuV, ROI/DuPont, Kostenarten). Ein Konto kann in mehreren
//  Bäumen vorkommen ("auch in …"). Werte rollen je Baum hoch.
// =========================================================================
import React, { useState } from 'react'
import { BAEUME, baum, kontoInfo, kontoVorkommen } from '../../core/kontenstrukturen.js'

const card = { background: 'var(--panel)', border: '1px solid var(--line)', borderRadius: 'var(--radius)', boxShadow: 'var(--shadow)' }
const cap = { fontSize: 11, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '.04em', fontWeight: 700 }
const chip = (aktiv) => ({ padding: '6px 13px', borderRadius: 999, fontSize: 13, cursor: 'pointer', fontWeight: 600,
  border: `1px solid ${aktiv ? 'var(--accent)' : 'var(--line)'}`, background: aktiv ? 'var(--accent)' : 'var(--panel)', color: aktiv ? '#fff' : 'var(--ink)' })

const fmt = (w, e) => e === '%' ? w.toLocaleString('de-DE', { minimumFractionDigits: 1, maximumFractionDigits: 1 }) + ' %'
  : e === '×' ? w.toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + '×'
  : Math.round(w).toLocaleString('de-DE') + ' T€'

function KontenListe({ node, baumKurz }) {
  return (
    <div style={{ margin: '2px 0 4px 0', borderLeft: '2px solid var(--line)' }}>
      {node.konten.map((nr) => {
        const k = kontoInfo(nr)
        const auch = kontoVorkommen(nr).filter((b) => b !== baumKurz)
        return (
          <div key={nr} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '3px 8px 3px 14px', fontSize: 12 }}>
            <span className="mono" style={{ color: 'var(--muted)', width: 42 }}>{nr}</span>
            <span style={{ flex: 1 }}>{k?.name}</span>
            {auch.length > 0 && <span title={`Dasselbe Konto auch in: ${auch.join(', ')}`} style={{ fontSize: 9.5, color: 'var(--accent)', border: '1px solid var(--accent)', borderRadius: 999, padding: '0 6px' }}>auch in {auch.join(', ')}</span>}
            <span className="mono" style={{ color: 'var(--muted)' }}>{Math.round(k?.betrag || 0).toLocaleString('de-DE')} T€</span>
          </div>
        )
      })}
    </div>
  )
}

function Knoten({ node, ebene, baumKurz, auf, setAuf }) {
  const istKonten = !!node.konten
  const istFormel = !!node.berechne
  const istKennzahl = !!node.einheit && node.einheit !== 'T€'
  const vorzeichen = node.sign === -1 ? -1 : 1
  const v = istKennzahl ? node.wert : vorzeichen * node.wert
  const anzeige = istKennzahl ? fmt(node.wert, node.einheit) : (v < 0 ? '−' : '') + fmt(Math.abs(v), 'T€')
  const farbe = !istKennzahl && v < 0 ? 'var(--amp-r)' : 'var(--ink)'
  const key = baumKurz + ':' + ebene + ':' + node.name + ':' + (node.key || '')
  const offen = auf[key] !== false // default offen
  const kinderAuf = node.kinder && node.kinder.length > 0
  return (
    <div>
      <div onClick={() => (kinderAuf || istKonten) && setAuf((a) => ({ ...a, [key]: !offen }))}
        style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '6px 8px', paddingLeft: 8 + ebene * 20,
          borderBottom: '1px solid var(--line)', cursor: (kinderAuf || istKonten) ? 'pointer' : 'default',
          background: ebene === 0 ? 'var(--bg)' : undefined, fontWeight: ebene === 0 ? 700 : istFormel ? 600 : 500 }}>
        <span style={{ width: 12, color: 'var(--muted)', fontSize: 11 }}>{(kinderAuf || istKonten) ? (offen ? '▾' : '▸') : ''}</span>
        <span style={{ flex: 1, fontSize: ebene === 0 ? 14 : 13 }}>
          {node.sign === -1 && <span style={{ color: 'var(--muted)' }}>− </span>}
          {node.sign === 1 && ebene > 0 && <span style={{ color: 'var(--muted)' }}>+ </span>}
          {node.name}
          {istFormel && node.kinder && <span style={{ fontSize: 11, color: 'var(--muted)', fontWeight: 400 }}> = {node.kinder.map((k) => k.name).join(node.name === 'ROI' || node.einheit === '×' ? ' × ' : ' ÷ ')}</span>}
        </span>
        <span className="mono" style={{ fontWeight: 700, color: farbe }}>{anzeige}</span>
      </div>
      {offen && istKonten && <KontenListe node={node} baumKurz={baumKurz} />}
      {offen && node.kinder && node.kinder.map((k, i) => (
        <Knoten key={i} node={k} ebene={ebene + 1} baumKurz={baumKurz} auf={auf} setAuf={setAuf} />
      ))}
    </div>
  )
}

export default function Kontenstrukturen() {
  const [id, setId] = useState('guv')
  const [auf, setAuf] = useState({})
  const b = baum(id)
  return (
    <div style={{ maxWidth: 920, margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', gap: 12, flexWrap: 'wrap', marginBottom: 12 }}>
        <div>
          <div style={cap}>Sachkonto-Dimension · mehrere Hierarchien</div>
          <h2 style={{ margin: '4px 0 0' }}>Sachkonto-Strukturen</h2>
        </div>
        <button className="no-print" onClick={() => window.print()} style={{ padding: '7px 13px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--line)', background: 'var(--panel)', cursor: 'pointer', fontSize: 13, fontWeight: 600 }}>🖨 Drucken / PDF</button>
      </div>

      <div style={{ fontSize: 13, color: 'var(--muted)', marginBottom: 12, maxWidth: 760 }}>
        Dieselben Sachkonten, mehrere logische <b>Bäume</b>. Ein Konto kann in mehreren Strukturen vorkommen
        (z. B. die Umsatzerlöse in GuV, ROI <i>und</i> DB-Schema) — als „auch in …" markiert.
      </div>

      <div style={{ display: 'flex', gap: 8, marginBottom: 12, flexWrap: 'wrap' }}>
        {BAEUME.map((x) => (
          <button key={x.id} style={chip(id === x.id)} onClick={() => { setId(x.id); setAuf({}) }}>{x.name}</button>
        ))}
      </div>

      <div style={{ ...card, padding: 14, marginBottom: 12 }}>
        <div style={{ fontSize: 12.5, color: 'var(--slate)', marginBottom: 8 }}>{b.beschreibung}</div>
        <div style={{ border: '1px solid var(--line)', borderRadius: 'var(--radius-sm)', overflow: 'hidden' }}>
          <Knoten node={b.wurzel} ebene={0} baumKurz={b.kurz} auf={auf} setAuf={setAuf} />
        </div>
      </div>

      <div style={{ fontSize: 11, color: 'var(--muted)', textAlign: 'center', padding: '0 0 20px' }}>
        Beträge in T€ · Bäume rollen aus dem Kontenstamm hoch · Demo-Daten (Mock).
      </div>
    </div>
  )
}
