// =========================================================================
//  ABWEICHUNGSANALYSE — Plan/Ist je Position, aufgespalten in Preis- und
//  Mengenabweichung, mit Bewertung günstig/ungünstig.
// =========================================================================
import React from 'react'
import { analyse } from '../../core/abweichung.js'

const card = { background: 'var(--panel)', border: '1px solid var(--line)', borderRadius: 'var(--radius)', boxShadow: 'var(--shadow)' }
const cap = { fontSize: 11, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '.03em', fontWeight: 700 }
const m = (v) => (v > 0 ? '+' : '') + v.toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
const m0 = (v) => v.toLocaleString('de-DE', { minimumFractionDigits: 1, maximumFractionDigits: 1 })
const th = (al) => ({ textAlign: al, padding: '6px 9px', borderBottom: '1px solid var(--line)', fontSize: 10.5, color: 'var(--muted)', textTransform: 'uppercase' })
const td = (al, bold) => ({ textAlign: al, padding: '6px 9px', borderBottom: '1px solid var(--line)', fontWeight: bold ? 700 : 400 })

export default function Abweichungsanalyse({ onGeh }) {
  const a = analyse()
  const farbe = (r) => r.guenstig ? 'var(--amp-g)' : 'var(--amp-r)'

  const block = (titel, s, istKosten) => (
    <div style={{ ...card, padding: '12px 14px', flex: 1, minWidth: 220 }}>
      <div style={cap}>{titel}</div>
      <div style={{ fontSize: 20, fontWeight: 700, color: (istKosten ? s.gesamt <= 0 : s.gesamt >= 0) ? 'var(--amp-g)' : 'var(--amp-r)' }}>{m(s.gesamt)} Mio €</div>
      <div style={{ fontSize: 11.5, color: 'var(--muted)' }}>Preis {m(s.preis)} · Menge {m(s.menge)}</div>
    </div>
  )

  return (
    <div style={{ maxWidth: '100%', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12, flexWrap: 'wrap', marginBottom: 14 }}>
        <div>
          <h2 style={{ margin: '0 0 4px' }}>Abweichungsanalyse (Plan/Ist)</h2>
          <div style={{ color: 'var(--muted)', fontSize: 13, maxWidth: 740 }}>
            Jede Abweichung wird in <b>Preis-</b> und <b>Mengenabweichung</b> zerlegt (Preis + Menge = Gesamt). So
            siehst du, ob ein Effekt vom Preis oder von der Menge kommt.
          </div>
        </div>
        {onGeh && <button onClick={() => onGeh('vergleich')} style={{ ...card, padding: '7px 12px', cursor: 'pointer', fontSize: 13, fontWeight: 600 }}>Versionsvergleich →</button>}
      </div>

      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 14 }}>
        {block('Erlösabweichung', a.erloes, false)}
        {block('Kostenabweichung', a.kosten, true)}
      </div>

      <div style={{ ...card, padding: 16, overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13, minWidth: 820 }}>
          <thead><tr>{['Position', 'Plan (P×M)', 'Ist (P×M)', 'Gesamtabw.', 'Preisabw.', 'Mengenabw.', 'Bewertung'].map((h, i) => <th key={i} style={th(i === 0 ? 'left' : 'right')}>{h}</th>)}</tr></thead>
          <tbody>
            {a.rows.map((r) => (
              <tr key={r.id}>
                <td style={td('left', true)}>{r.name}<div style={{ fontSize: 10.5, color: 'var(--muted)', fontWeight: 400 }}>{r.art === 'erloes' ? 'Erlös' : 'Kosten'} · Plan {r.planPreis} €/Stk × {r.planMenge.toLocaleString('de-DE')}</div></td>
                <td className="mono" style={td('right')}>{m0(r.planMio)}</td>
                <td className="mono" style={td('right')}>{m0(r.istMio)}</td>
                <td className="mono" style={{ ...td('right', true), color: farbe(r) }}>{m(r.gesamt)}</td>
                <td className="mono" style={td('right')}>{m(r.preisAbw)}</td>
                <td className="mono" style={td('right')}>{m(r.mengenAbw)}</td>
                <td style={{ ...td('right'), color: farbe(r), fontWeight: 600 }}>{r.guenstig ? 'günstig' : 'ungünstig'}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <div style={{ fontSize: 12, color: 'var(--muted)', marginTop: 8 }}>
          Preisabweichung = (Ist-Preis − Plan-Preis) × Ist-Menge · Mengenabweichung = (Ist-Menge − Plan-Menge) × Plan-Preis. Beträge in Mio €.
        </div>
      </div>
    </div>
  )
}
