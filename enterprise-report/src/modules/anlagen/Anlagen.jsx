// =========================================================================
//  ANLAGEN-/ASSET-LEBENSZYKLUS — Phasen, Restnutzung/-buchwert, Wieder-
//  beschaffung und kalkulatorische Abschreibung (Brücke zur Kalkulatorik).
// =========================================================================
import React from 'react'
import { auswertung, PHASEN, phaseInfo } from '../../core/anlagen.js'

const card = { background: 'var(--panel)', border: '1px solid var(--line)', borderRadius: 'var(--radius)', boxShadow: 'var(--shadow)' }
const cap = { fontSize: 11, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '.03em', fontWeight: 700 }
const m = (v) => v.toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
const th = (al) => ({ textAlign: al, padding: '6px 9px', borderBottom: '1px solid var(--line)', fontSize: 10.5, color: 'var(--muted)', textTransform: 'uppercase' })
const td = (al, bold) => ({ textAlign: al, padding: '6px 9px', borderBottom: '1px solid var(--line)', fontWeight: bold ? 700 : 400 })

export default function Anlagen({ onGeh }) {
  const a = auswertung()
  const badge = (id) => { const p = phaseInfo(id); return { fontSize: 11, fontWeight: 700, color: '#fff', background: p.farbe, padding: '1px 8px', borderRadius: 999 } }

  return (
    <div style={{ maxWidth: '100%', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12, flexWrap: 'wrap', marginBottom: 14 }}>
        <div>
          <h2 style={{ margin: '0 0 4px' }}>Anlagen-Lebenszyklus</h2>
          <div style={{ color: 'var(--muted)', fontSize: 13, maxWidth: 740 }}>
            Jede Anlage von der Beschaffung bis zum Ersatz — mit Restnutzungsdauer, Restbuchwert, Wiederbeschaffungswert
            und der daraus abgeleiteten <b>kalkulatorischen Abschreibung</b>.
          </div>
        </div>
        {onGeh && <button onClick={() => onGeh('kalkulatorik')} style={{ ...card, padding: '7px 12px', cursor: 'pointer', fontSize: 13, fontWeight: 600 }}>→ Kalkulatorik</button>}
      </div>

      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 14 }}>
        <div style={{ ...card, padding: '12px 14px', flex: 1, minWidth: 170 }}><div style={cap}>Kalk. Abschreibung/Jahr</div><div style={{ fontSize: 22, fontWeight: 700 }}>{m(a.summeKalkAbschr)} Mio €</div><div style={{ fontSize: 11, color: 'var(--muted)' }}>bilanziell {m(a.summeBilanzAbschr)}</div></div>
        <div style={{ ...card, padding: '12px 14px', flex: 1, minWidth: 170 }}><div style={cap}>Instandhaltung/Jahr</div><div style={{ fontSize: 22, fontWeight: 700 }}>{m(a.summeInstand)} Mio €</div></div>
        <div style={{ ...card, padding: '12px 14px', flex: 1, minWidth: 170 }}><div style={cap}>Ersatz fällig</div><div style={{ fontSize: 22, fontWeight: 700, color: a.ersatzFaellig ? 'var(--amp-r)' : 'var(--amp-g)' }}>{a.ersatzFaellig}</div></div>
      </div>

      <div style={{ ...card, padding: 16, overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13, minWidth: 860 }}>
          <thead><tr>{['Anlage', 'Anschaffung', 'ND', 'Alter', 'Restnutzung', 'Restbuchwert', 'WBW', 'kalk. Abschr.', 'Phase'].map((h, i) => <th key={i} style={th(i === 0 ? 'left' : 'right')}>{h}</th>)}</tr></thead>
          <tbody>
            {a.rows.map((r) => (
              <tr key={r.id}>
                <td style={td('left', true)}>{r.name}</td>
                <td className="mono" style={td('right')}>{m(r.anschaffung)}</td>
                <td className="mono" style={td('right')}>{r.nd} J</td>
                <td className="mono" style={td('right')}>{r.alter} J</td>
                <td className="mono" style={{ ...td('right'), color: r.rest <= 1 ? 'var(--amp-r)' : 'var(--ink)' }}>{r.rest} J</td>
                <td className="mono" style={td('right')}>{m(r.restbuchwert)}</td>
                <td className="mono" style={td('right')}>{m(r.wbw)}</td>
                <td className="mono" style={td('right', true)}>{m(r.kalkAbschr)}</td>
                <td style={{ ...td('right') }}><span style={badge(r.phase)}>{phaseInfo(r.phase).name}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
        <div style={{ fontSize: 12, color: 'var(--muted)', marginTop: 8 }}>
          Kalk. Abschreibung = Wiederbeschaffungswert ÷ Nutzungsdauer — höher als die bilanzielle (Anschaffung ÷ ND). Σ {m(a.summeKalkAbschr)} Mio €/Jahr fließt als Anderskosten in die Kalkulatorik.
        </div>
      </div>

      <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap', marginTop: 12 }}>
        {PHASEN.map((p) => (
          <span key={p.id} style={{ fontSize: 12, display: 'inline-flex', alignItems: 'center', gap: 6 }}>
            <span style={{ width: 10, height: 10, borderRadius: '50%', background: p.farbe }} /><b>{p.name}</b> — <span style={{ color: 'var(--muted)' }}>{p.laie}</span>
          </span>
        ))}
      </div>
    </div>
  )
}
