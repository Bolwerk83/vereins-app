// =========================================================================
//  KALKULATORIK — kalkulatorische Kosten aufbauen, mit kollegialen
//  Vorschlägen aus den Unternehmenszahlen. Anders- und Zusatzkosten.
// =========================================================================
import React, { useState } from 'react'
import { BAUSTEINE, baustein, felderVon, setFelder, wertVon, gesamt } from '../../core/kalkulatorik.js'

const card = { background: 'var(--panel)', border: '1px solid var(--line)', borderRadius: 'var(--radius)', boxShadow: 'var(--shadow)' }
const cap = { fontSize: 11, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '.03em', fontWeight: 700 }
const mio = (v) => v.toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' Mio €'

export default function Kalkulatorik({ werte = {}, onGeh }) {
  const [, setTick] = useState(0)
  const [hinweis, setHinweis] = useState({})   // id -> Vorschlagstext
  const refresh = () => setTick((t) => t + 1)
  const g = gesamt()

  function aendere(id, key, val) {
    const f = { ...felderVon(id), [key]: val === '' ? 0 : Number(val) }
    setFelder(id, f); refresh()
  }
  function vorschlag(id) {
    const v = baustein(id).vorschlag(werte)
    setFelder(id, { ...felderVon(id), ...v.patch })
    setHinweis((h) => ({ ...h, [id]: v.text })); refresh()
  }

  const tag = (farbe) => ({ fontSize: 10.5, fontWeight: 700, color: farbe, border: `1px solid ${farbe}`, padding: '1px 7px', borderRadius: 999 })

  return (
    <div style={{ maxWidth: 1000, margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12, flexWrap: 'wrap', marginBottom: 14 }}>
        <div>
          <h2 style={{ margin: '0 0 4px' }}>Kalkulatorische Kosten aufbauen</h2>
          <div style={{ color: 'var(--muted)', fontSize: 13, maxWidth: 740 }}>
            Anderskosten (anders bewertet) und Zusatzkosten (kein Aufwand gegenüber). Trag deine Werte ein — oder hol dir
            je Baustein einen <b>begründeten Vorschlag</b> aus den Unternehmenszahlen.
          </div>
        </div>
        {onGeh && <button onClick={() => onGeh('klr')} style={{ ...inpBtn, whiteSpace: 'nowrap' }}>← zur KLR</button>}
      </div>

      {/* Summen */}
      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 14 }}>
        {kachel('Anderskosten', mio(g.anders))}
        {kachel('Zusatzkosten', mio(g.zusatz))}
        {kachel('Kalkulatorisch gesamt', mio(g.summe), 'fließt in Kostenarten/Abgrenzung')}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(440px, 1fr))', gap: 14 }} className="raster-2">
        {BAUSTEINE.map((b) => {
          const f = felderVon(b.id)
          return (
            <div key={b.id} style={{ ...card, padding: 16, display: 'flex', flexDirection: 'column', gap: 10 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                <span style={{ fontWeight: 700, fontSize: 15, flex: 1 }}>{b.name}</span>
                <span style={tag(b.typ === 'anders' ? 'var(--accent)' : '#7c3aed')}>{b.typ === 'anders' ? 'Anderskosten' : 'Zusatzkosten'}</span>
              </div>
              <div style={{ fontSize: 12.5, color: 'var(--slate)' }}>{b.laie}</div>

              <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'flex-end' }}>
                {b.felder.map((fe) => (
                  <label key={fe.key} style={{ fontSize: 11, color: 'var(--muted)' }}>{fe.label} <span style={{ opacity: .7 }}>({fe.einheit})</span><br />
                    <input type="number" value={f[fe.key]} onChange={(e) => aendere(b.id, fe.key, e.target.value)}
                      style={{ marginTop: 3, width: 130, padding: '6px 8px', border: '1px solid var(--line)', borderRadius: 'var(--radius-sm)', font: 'inherit', fontSize: 13 }} />
                  </label>
                ))}
                <div style={{ marginLeft: 'auto', textAlign: 'right' }}>
                  <div style={cap}>= Ergebnis</div>
                  <div style={{ fontSize: 20, fontWeight: 700 }}>{mio(wertVon(b.id))}</div>
                </div>
              </div>

              <div>
                <button onClick={() => vorschlag(b.id)} style={{ ...inpBtn, cursor: 'pointer', background: 'var(--accent-soft)', color: 'var(--accent)', borderColor: 'var(--accent)', fontWeight: 600 }}>💡 Vorschlag übernehmen</button>
                {hinweis[b.id] && <div style={{ marginTop: 8, fontSize: 12.5, padding: '8px 11px', background: 'var(--bg)', border: '1px solid var(--line)', borderRadius: 'var(--radius-sm)' }}>{hinweis[b.id]}</div>}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

const inpBtn = { padding: '7px 12px', border: '1px solid var(--line)', borderRadius: 'var(--radius-sm)', background: 'var(--panel)', font: 'inherit', fontSize: 13 }
function kachel(label, wert, hint) {
  return (
    <div style={{ ...card, padding: '12px 14px', flex: 1, minWidth: 170 }}>
      <div style={cap}>{label}</div>
      <div style={{ fontSize: 22, fontWeight: 700, marginTop: 2 }}>{wert}</div>
      {hint && <div style={{ fontSize: 11, color: 'var(--muted)' }}>{hint}</div>}
    </div>
  )
}
