// =========================================================================
//  BESTANDS-GÄNGIGKEIT — Renner/Penner, ABC/XYZ, Reichweite, Ladenhüter
//  mit Abverkaufs-Maßnahme.
// =========================================================================
import React, { useState } from 'react'
import { auswertung, GAENGIGKEIT, gaengigkeitInfo } from '../../core/bestand.js'
import { addMassnahme, ladeMassnahmen } from '../../core/massnahmen.js'

const card = { background: 'var(--panel)', border: '1px solid var(--line)', borderRadius: 'var(--radius)', boxShadow: 'var(--shadow)' }
const cap = { fontSize: 11, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '.03em', fontWeight: 700 }
const m = (v) => v.toLocaleString('de-DE', { minimumFractionDigits: 1, maximumFractionDigits: 1 })
const th = (al) => ({ textAlign: al, padding: '6px 9px', borderBottom: '1px solid var(--line)', fontSize: 10.5, color: 'var(--muted)', textTransform: 'uppercase' })
const td = (al, bold) => ({ textAlign: al, padding: '6px 9px', borderBottom: '1px solid var(--line)', fontWeight: bold ? 700 : 400 })

export default function Bestand() {
  const [, setTick] = useState(0)
  const a = auswertung()
  const massn = ladeMassnahmen()
  const hat = (id) => massn.some((m) => m.artikelId === id)
  const badge = (id) => { const g = gaengigkeitInfo(id); return { fontSize: 11, fontWeight: 700, color: '#fff', background: g.farbe, padding: '1px 8px', borderRadius: 999 } }

  function massnahme(r) {
    addMassnahme({ titel: `Bestand abbauen: ${r.name} (${gaengigkeitInfo(r.gaengigkeit).name})`, owner: 'Vertrieb/Logistik', quelle: 'bestand', artikelId: r.id, bereich: 'LOG', hebel: 'Bestand (Hebel #2)',
      relevanz: `${gaengigkeitInfo(r.gaengigkeit).name}: Bestand ${m(r.bestand)} Mio €, Reichweite ${r.reichweite} Tg, letzte Bewegung vor ${r.letzteBewegung} Tg.` })
    setTick((t) => t + 1)
  }

  return (
    <div style={{ maxWidth: 1020, margin: '0 auto' }}>
      <div style={{ marginBottom: 14 }}>
        <h2 style={{ margin: '0 0 4px' }}>Bestands-Gängigkeit</h2>
        <div style={{ color: 'var(--muted)', fontSize: 13, maxWidth: 740 }}>
          Welche Artikel drehen (Renner), welche binden Kapital (Langsamdreher/Ladenhüter)? ABC nach Wert, XYZ nach
          Umschlag, Reichweite und Abverkaufs-Hinweise.
        </div>
      </div>

      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 14 }}>
        <div style={{ ...card, padding: '12px 14px', flex: 1, minWidth: 150 }}><div style={cap}>Bestand gesamt</div><div style={{ fontSize: 22, fontWeight: 700 }}>{m(a.gesamt)} Mio €</div></div>
        <div style={{ ...card, padding: '12px 14px', flex: 1, minWidth: 150 }}><div style={cap}>Ø Reichweite</div><div style={{ fontSize: 22, fontWeight: 700 }}>{a.reichweiteSchnitt} Tg</div></div>
        <div style={{ ...card, padding: '12px 14px', flex: 1, minWidth: 150 }}><div style={cap}>Renner-Bestand</div><div style={{ fontSize: 22, fontWeight: 700, color: 'var(--amp-g)' }}>{m(a.rennerWert)} Mio €</div></div>
        <div style={{ ...card, padding: '12px 14px', flex: 1, minWidth: 150 }}><div style={cap}>Ladenhüter</div><div style={{ fontSize: 22, fontWeight: 700, color: a.ladenhueterWert ? 'var(--amp-r)' : 'var(--amp-g)' }}>{m(a.ladenhueterWert)} Mio €</div></div>
      </div>

      <div style={{ ...card, padding: 16, overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13, minWidth: 820 }}>
          <thead><tr>{['Artikel/Warengruppe', 'Bestand', 'Umschlag', 'Reichweite', 'letzte Bew.', 'ABC', 'XYZ', 'Gängigkeit', ''].map((h, i) => <th key={i} style={th(i >= 1 && i <= 4 ? 'right' : 'left')}>{h}</th>)}</tr></thead>
          <tbody>
            {a.rows.map((r) => {
              const kritisch = r.gaengigkeit === 'ladenhueter' || r.gaengigkeit === 'langsamdreher'
              return (
                <tr key={r.id}>
                  <td style={td('left', true)}>{r.name}</td>
                  <td className="mono" style={td('right')}>{m(r.bestand)}</td>
                  <td className="mono" style={{ ...td('right'), color: r.umschlag >= 6 ? 'var(--amp-g)' : r.umschlag < 3 ? 'var(--amp-r)' : 'var(--ink)' }}>{r.umschlag}×</td>
                  <td className="mono" style={{ ...td('right'), color: r.reichweite > 120 ? 'var(--amp-r)' : 'var(--ink)' }}>{r.reichweite} Tg</td>
                  <td className="mono" style={{ ...td('right'), color: r.letzteBewegung > 90 ? 'var(--amp-r)' : 'var(--muted)' }}>{r.letzteBewegung} Tg</td>
                  <td style={td('left')}><b>{r.abc}</b></td>
                  <td style={td('left')}>{r.xyz}</td>
                  <td style={td('left')}><span style={badge(r.gaengigkeit)}>{gaengigkeitInfo(r.gaengigkeit).name}</span></td>
                  <td style={td('right')}>{kritisch && (hat(r.id) ? <span style={{ fontSize: 12, color: 'var(--amp-g)' }}>✓ Maßnahme</span>
                    : <button onClick={() => massnahme(r)} style={{ fontSize: 12, cursor: 'pointer', border: '1px solid var(--accent)', color: 'var(--accent)', background: 'var(--panel)', borderRadius: 999, padding: '3px 10px' }}>→ Abverkauf</button>)}</td>
                </tr>
              )
            })}
          </tbody>
        </table>
        <div style={{ fontSize: 12, color: 'var(--muted)', marginTop: 8 }}>
          ABC = Wertanteil (A=80 %), XYZ = Umschlag (X hoch). Ladenhüter und Langsamdreher binden Kapital — Abverkauf setzt Liquidität frei.
        </div>
      </div>

      <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap', marginTop: 12 }}>
        {GAENGIGKEIT.map((g) => (
          <span key={g.id} style={{ fontSize: 12, display: 'inline-flex', alignItems: 'center', gap: 6 }}>
            <span style={{ width: 10, height: 10, borderRadius: '50%', background: g.farbe }} /><b>{g.name}</b> — <span style={{ color: 'var(--muted)' }}>{g.laie}</span>
          </span>
        ))}
      </div>
    </div>
  )
}
