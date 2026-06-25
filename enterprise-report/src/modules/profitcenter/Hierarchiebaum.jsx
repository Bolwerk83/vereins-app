// =========================================================================
//  PROFITCENTER-HIERARCHIEBAUM — vollständiger, aufklappbarer Baum bis Ebene 8
//  (Konzern → Geschäftsbereich → Region → Funktion → Kostenstelle → Kostenart
//  → Einzelposten → Beleg). Je Knoten Erlös/Kosten/Ergebnis + Status-Ampel.
// =========================================================================
import React, { useState, useMemo } from 'react'
import { baueBaum, sichtbareZeilen, alleIds, EBENEN, MAX_EBENE } from '../../core/profitcenterBaum.js'
import { AmpelPunkt } from '../../components/ui.jsx'

const card = { background: 'var(--panel)', border: '1px solid var(--line)', borderRadius: 'var(--radius)', boxShadow: 'var(--shadow)' }
const cap = { fontSize: 11, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '.04em', fontWeight: 700 }
const eur = (n) => Math.round(n).toLocaleString('de-DE') + ' T€'
const th = (al) => ({ textAlign: al, padding: '6px 10px', borderBottom: '2px solid var(--line)', fontSize: 10.5, color: 'var(--muted)', textTransform: 'uppercase', whiteSpace: 'nowrap' })
const td = (al) => ({ textAlign: al, padding: '5px 10px', borderBottom: '1px solid var(--line)', whiteSpace: 'nowrap' })

export default function Hierarchiebaum() {
  const root = useMemo(() => baueBaum(), [])
  const [maxEbene, setMaxEbene] = useState(MAX_EBENE)
  // Start: Geschäftsbereiche + Regionen aufgeklappt (Ebene 2 sichtbar, 2 geöffnet).
  const [offen, setOffen] = useState(() => new Set(root.kinder.map((c) => c.id)))

  const zeilen = sichtbareZeilen(root, offen, maxEbene)
  const toggle = (id) => setOffen((s) => { const n = new Set(s); n.has(id) ? n.delete(id) : n.add(id); return n })
  const alleAuf = () => setOffen(new Set(alleIds(root, maxEbene)))
  const alleZu = () => setOffen(new Set())

  return (
    <div style={{ display: 'grid', gap: 14 }}>
      {/* KPI-Kacheln (Konzern-Roll-up) */}
      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
        {[['Umsatz (Konzern)', eur(root.erloes), 'var(--accent)'], ['Kosten', eur(root.kosten), 'var(--slate)'],
          ['Ergebnis', eur(root.ergebnis), root.ergebnis >= 0 ? 'var(--amp-g)' : 'var(--amp-r)'],
          ['Marge', root.marge != null ? (root.marge * 100).toFixed(1) + ' %' : '—', root.ampel === 'g' ? 'var(--amp-g)' : root.ampel === 'a' ? 'var(--amp-a)' : 'var(--amp-r)'],
          ['Ebenen', `${MAX_EBENE}`, 'var(--accent)']].map(([l, v, c]) => (
          <div key={l} style={{ ...card, padding: '11px 14px', flex: 1, minWidth: 130, borderTop: `3px solid ${c}` }}>
            <div style={{ ...cap, marginBottom: 3 }}>{l}</div><div className="mono" style={{ fontSize: 18, fontWeight: 800, color: c }}>{v}</div>
          </div>
        ))}
      </div>

      {/* Steuerung */}
      <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
        <button onClick={alleAuf} style={{ ...card, padding: '6px 12px', cursor: 'pointer', fontSize: 12.5, fontWeight: 600 }}>⊞ Alle aufklappen</button>
        <button onClick={alleZu} style={{ ...card, padding: '6px 12px', cursor: 'pointer', fontSize: 12.5, fontWeight: 600 }}>⊟ Alle zuklappen</button>
        <span style={{ marginLeft: 'auto', fontSize: 12, color: 'var(--muted)' }}>Tiefe bis Ebene:</span>
        <div style={{ display: 'flex', border: '1px solid var(--line)', borderRadius: 'var(--radius-sm)', overflow: 'hidden' }}>
          {EBENEN.map((name, i) => i + 1).filter((e) => e >= 2).map((e) => (
            <button key={e} onClick={() => setMaxEbene(e)} title={EBENEN[e - 1]} style={{ padding: '5px 9px', border: 'none', fontSize: 12, fontWeight: 700, cursor: 'pointer', background: maxEbene === e ? 'var(--accent)' : 'var(--panel)', color: maxEbene === e ? '#fff' : 'var(--muted)' }}>{e}</button>
          ))}
        </div>
      </div>

      {/* Baum-Tabelle */}
      <div style={{ ...card, overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13, minWidth: 760 }}>
          <thead><tr>{['Struktur', 'Ebene', 'Umsatz', 'Kosten', 'Ergebnis', 'Marge', 'Status'].map((h, i) => <th key={i} style={th(i === 0 || i === 1 ? 'left' : i === 6 ? 'center' : 'right')}>{h}</th>)}</tr></thead>
          <tbody>
            {zeilen.map((r) => (
              <tr key={r.id} style={{ background: r.tiefe === 0 ? 'var(--bg)' : 'transparent' }}>
                <td style={{ ...td('left'), paddingLeft: 10 + r.tiefe * 18 }}>
                  {r.hatKinder
                    ? <button onClick={() => toggle(r.id)} style={{ border: 'none', background: 'none', cursor: 'pointer', color: 'var(--muted)', fontSize: 11, marginRight: 6, width: 14 }}>{r.offen ? '▾' : '▸'}</button>
                    : <span style={{ display: 'inline-block', width: 14, marginRight: 6 }} />}
                  <span style={{ fontWeight: r.tiefe <= 1 ? 700 : r.ebene >= 6 ? 400 : 600 }}>{r.name}</span>
                </td>
                <td style={td('left')}><span style={{ fontSize: 10.5, color: 'var(--muted)' }}>E{r.ebene} · {r.ebeneName}</span></td>
                <td style={{ ...td('right') }} className="mono">{r.erloes ? eur(r.erloes) : '—'}</td>
                <td style={{ ...td('right') }} className="mono">{eur(r.kosten)}</td>
                <td style={{ ...td('right'), fontWeight: 700, color: r.ergebnis >= 0 ? 'var(--amp-g)' : 'var(--amp-r)' }} className="mono">{eur(r.ergebnis)}</td>
                <td style={{ ...td('right') }} className="mono">{r.marge != null ? (r.marge * 100).toFixed(1) + ' %' : '—'}</td>
                <td style={{ ...td('center') }}><AmpelPunkt status={r.ampel} size={13} /></td>
              </tr>
            ))}
          </tbody>
        </table>
        <div style={{ fontSize: 11.5, color: 'var(--muted)', padding: '8px 12px' }}>
          Vollständiger Durchgriff Konzern → … → Beleg ({MAX_EBENE} Ebenen). Werte rollen exakt nach oben auf. Status-Ampel (✓/!/✕) nur bei Erlösknoten; reine Kostenknoten sind neutral.
        </div>
      </div>
    </div>
  )
}
