// =========================================================================
//  LIEFERANTEN-LEBENSZYKLUS — Beziehungsphasen im Einkauf mit Empfehlung;
//  Risiko/Auslauf direkt in eine Maßnahme überführbar.
// =========================================================================
import React, { useState } from 'react'
import { PHASEN, phaseInfo, lieferanten, phaseVerteilung } from '../../core/lieferantenLebenszyklus.js'
import { addMassnahme, ladeMassnahmen } from '../../core/massnahmen.js'

const card = { background: 'var(--panel)', border: '1px solid var(--line)', borderRadius: 'var(--radius)', boxShadow: 'var(--shadow)' }
const cap = { fontSize: 11, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '.03em', fontWeight: 700 }
const th = (al) => ({ textAlign: al, padding: '6px 9px', borderBottom: '1px solid var(--line)', fontSize: 10.5, color: 'var(--muted)', textTransform: 'uppercase' })
const td = (al, bold) => ({ textAlign: al, padding: '6px 9px', borderBottom: '1px solid var(--line)', fontWeight: bold ? 700 : 400 })

export default function LieferantenLebenszyklus() {
  const [, setTick] = useState(0)
  const liste = lieferanten()
  const vert = phaseVerteilung()
  const massn = ladeMassnahmen()
  const hat = (id) => massn.some((m) => m.lieferantId === id)
  const badge = (id) => { const p = phaseInfo(id); return { fontSize: 11, fontWeight: 700, color: '#fff', background: p.farbe, padding: '1px 8px', borderRadius: 999 } }

  function massnahme(l) {
    const p = phaseInfo(l.phase)
    addMassnahme({ titel: `${p.name}: ${l.name} — ${p.empfehlung}`, owner: 'Einkauf', quelle: 'lieferant-lebenszyklus', lieferantId: l.id, bereich: 'EK', hebel: 'Lieferantenmanagement',
      relevanz: `Lieferant in Phase „${p.name}" (Volumen ${l.volumen} Mio €, Liefertreue ${l.liefertreue} %, Risiko ${l.risiko}).` })
    setTick((t) => t + 1)
  }

  return (
    <div style={{ maxWidth: '100%', margin: '0 auto' }}>
      <div style={{ marginBottom: 14 }}>
        <h2 style={{ margin: '0 0 4px' }}>Lieferanten-Lebenszyklus</h2>
        <div style={{ color: 'var(--muted)', fontSize: 13, maxWidth: 740 }}>
          Der Einkaufs-Spiegel zum Kunden-Lebenszyklus: von der Qualifizierung über den Stammlieferanten bis zu Risiko
          und Auslauf — je Phase mit Handlungsempfehlung.
        </div>
      </div>

      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 14 }}>
        {vert.map((p) => (
          <div key={p.id} style={{ ...card, padding: '10px 13px', flex: 1, minWidth: 140, borderTop: `3px solid ${p.farbe}` }}>
            <div style={{ fontWeight: 700, fontSize: 13 }}>{p.name}</div>
            <div style={{ fontSize: 18, fontWeight: 700 }}>{p.volumen} Mio €</div>
            <div style={{ fontSize: 11, color: 'var(--muted)' }}>{p.anzahl} · {p.anteil} %</div>
          </div>
        ))}
      </div>

      <div style={{ ...card, padding: 16, overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13, minWidth: 820 }}>
          <thead><tr>{['Lieferant', 'Volumen', 'Liefertreue', 'Qualität', 'Risiko', 'Wachstum', 'Phase', 'Empfehlung', ''].map((h, i) => <th key={i} style={th(i >= 1 && i <= 5 ? 'right' : 'left')}>{h}</th>)}</tr></thead>
          <tbody>
            {liste.map((l) => {
              const p = phaseInfo(l.phase); const kritisch = l.phase === 'risiko' || l.phase === 'phaseout'
              return (
                <tr key={l.id}>
                  <td style={td('left', true)}>{l.name}</td>
                  <td className="mono" style={td('right')}>{l.volumen.toFixed(1)}</td>
                  <td className="mono" style={{ ...td('right'), color: l.liefertreue < 90 ? 'var(--amp-a)' : 'var(--ink)' }}>{l.liefertreue} %</td>
                  <td className="mono" style={td('right')}>{l.qualitaet} %</td>
                  <td style={{ ...td('right'), color: l.risiko === 'hoch' ? 'var(--amp-r)' : l.risiko === 'mittel' ? 'var(--amp-a)' : 'var(--muted)' }}>{l.risiko}</td>
                  <td className="mono" style={{ ...td('right'), color: l.volumenWachstum < 0 ? 'var(--amp-r)' : l.volumenWachstum >= 15 ? 'var(--amp-g)' : 'var(--ink)' }}>{l.volumenWachstum > 0 ? '+' : ''}{l.volumenWachstum} %</td>
                  <td style={td('left')}><span style={badge(l.phase)}>{p.name}</span></td>
                  <td style={{ ...td('left'), fontSize: 12, color: 'var(--slate)' }}>{p.empfehlung}</td>
                  <td style={td('right')}>{kritisch && (hat(l.id) ? <span style={{ fontSize: 12, color: 'var(--amp-g)' }}>✓ Maßnahme</span>
                    : <button onClick={() => massnahme(l)} style={{ fontSize: 12, cursor: 'pointer', border: '1px solid var(--accent)', color: 'var(--accent)', background: 'var(--panel)', borderRadius: 999, padding: '3px 10px' }}>→ Maßnahme</button>)}</td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
