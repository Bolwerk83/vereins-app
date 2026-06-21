// =========================================================================
//  ABSTIMMBRÜCKEN — Reporting-Ist ↔ Buchhaltung je Position abstimmen.
//  Differenz (abs/%), Toleranz-Ampel, Status setzen, Kommentar erfassen.
//  Persistiert je Periode; speist die Abschluss-Freigabe.
// =========================================================================
import React, { useState, useEffect } from 'react'
import { bruecken, setNotiz, STATUS, statusInfo, abstimmZusammenfassung, ladeHauptbuch } from '../../core/abstimmung.js'
import { formatWert } from '../../design/theme.js'
import { AMPEL_FARBE } from '../../design/theme.js'

const card = { background: 'var(--panel)', border: '1px solid var(--line)', borderRadius: 'var(--radius)', boxShadow: 'var(--shadow)' }
const inp = { padding: '6px 8px', border: '1px solid var(--line)', borderRadius: 'var(--radius-sm)', font: 'inherit', fontSize: 12 }
const mio = (v) => v == null ? '–' : formatWert(v, 'eur_mio')

export default function Abstimmung({ werte, periode }) {
  const [tick, setTick] = useState(0)
  const [hb, setHb] = useState(null)   // { quelle, werte } vom Backend
  const refresh = () => setTick((t) => t + 1)
  useEffect(() => { let aktiv = true; ladeHauptbuch(periode).then((h) => aktiv && setHb(h)); return () => { aktiv = false } }, [periode])

  const hbWerte = hb?.werte && Object.keys(hb.werte).length ? hb.werte : null
  const zeilen = bruecken(werte, periode, hbWerte)
  const z = abstimmZusammenfassung(werte, periode, hbWerte)
  const quelleText = !hb ? 'lokal simuliert (kein Backend)' : hb.quelle === 'fibu' ? 'FiBu (MSSQL)' : hbWerte ? 'Hauptbuch-Mock (Backend)' : 'lokal simuliert'

  const set = (posId, patch) => { setNotiz(periode, posId, patch); refresh() }

  return (
    <div style={{ maxWidth: 1040, margin: '0 auto', display: 'grid', gap: 16 }}>
      <div style={{ ...card, padding: 16 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 10 }}>
          <div>
            <h2 style={{ margin: 0, fontSize: 18 }}>Abstimmbrücken — Reporting ↔ Buchhaltung <span className="mono" style={{ fontSize: 12, color: 'var(--muted)' }}>· {periode}</span></h2>
            <p style={{ color: 'var(--muted)', fontSize: 13, margin: '6px 0 0', maxWidth: 720 }}>
              Reporting-Ist gegen das Hauptbuch je Position abstimmen. Differenzen über Toleranz brauchen Klärung;
              abgestimmte Positionen sind die Grundlage für die <b>Abschluss-Freigabe</b>.
            </p>
            <div className="mono" style={{ fontSize: 11, color: 'var(--muted)', marginTop: 4 }}>Buchhaltungsquelle: {quelleText}</div>
          </div>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            <span style={{ ...badge('g') }}>{z.abgestimmt} abgestimmt</span>
            <span style={{ ...badge('a') }}>{z.offen} offen</span>
            <span style={{ ...badge('n') }}>Σ Differenz {mio(z.diffSumme)}</span>
          </div>
        </div>
      </div>

      <div style={{ ...card, overflow: 'hidden' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr 1fr 1fr 150px 1.4fr', gap: 10, padding: '10px 16px',
          borderBottom: '1px solid var(--line)', fontSize: 11, color: 'var(--muted)', textTransform: 'uppercase' }} className="mono">
          <span>Position / Konto</span><span style={{ textAlign: 'right' }}>Reporting-Ist</span><span style={{ textAlign: 'right' }}>Buchhaltung</span>
          <span style={{ textAlign: 'right' }}>Differenz</span><span>Status</span><span>Kommentar</span>
        </div>
        {zeilen.map((r, i) => {
          const si = statusInfo(r.status)
          const diffFarbe = r.diff == null ? 'var(--muted)' : r.imRahmen ? 'var(--amp-g)' : 'var(--amp-r)'
          return (
            <div key={r.id} style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr 1fr 1fr 150px 1.4fr', gap: 10, padding: '11px 16px',
              borderTop: i ? '1px solid var(--line)' : 'none', alignItems: 'center', background: r.imRahmen ? 'transparent' : 'var(--amp-r-soft)' }}>
              <div>
                <div style={{ fontWeight: 600, fontSize: 14 }}>{r.name}</div>
                <div className="mono" style={{ fontSize: 11, color: 'var(--muted)' }}>{r.konto} · Toleranz {mio(r.toleranz)}</div>
              </div>
              <span className="mono" style={{ textAlign: 'right' }}>{mio(r.ist)}</span>
              <span className="mono" style={{ textAlign: 'right' }}>{mio(r.buchhaltung)}</span>
              <span className="mono" style={{ textAlign: 'right', color: diffFarbe, fontWeight: 600 }}>
                {r.diff == null ? '–' : `${r.diff > 0 ? '+' : ''}${mio(r.diff)}`}
                {r.diffPct != null && Math.abs(r.diff) > 0 ? <span style={{ fontSize: 11, opacity: .8 }}> ({r.diffPct > 0 ? '+' : ''}{r.diffPct.toFixed(1)} %)</span> : null}
              </span>
              <select value={r.status} onChange={(e) => set(r.id, { status: e.target.value })} style={{ ...inp,
                borderColor: AMPEL_FARBE[si.ampel], color: AMPEL_FARBE[si.ampel], fontWeight: 600 }}>
                {STATUS.map((s) => <option key={s.id} value={s.id} style={{ color: 'var(--ink)' }}>{s.name}{!r.gesetzt && s.id === r.status ? ' (auto)' : ''}</option>)}
              </select>
              <input value={r.kommentar} onChange={(e) => set(r.id, { kommentar: e.target.value })} style={inp}
                placeholder={r.imRahmen ? 'im Rahmen' : 'Ursache/Maßnahme …'} />
            </div>
          )
        })}
      </div>
      <div style={{ fontSize: 12, color: 'var(--muted)' }}>
        Status „Abgestimmt" wird bei Differenzen innerhalb der Toleranz automatisch vorgeschlagen; manuelle Auswahl überschreibt.
      </div>
    </div>
  )
}

function badge(ampel) {
  return { display: 'inline-flex', alignItems: 'center', gap: 6, padding: '4px 11px', borderRadius: 999, fontSize: 12, fontWeight: 600,
    border: `1px solid ${AMPEL_FARBE[ampel]}`, color: AMPEL_FARBE[ampel], background: 'var(--panel)' }
}
