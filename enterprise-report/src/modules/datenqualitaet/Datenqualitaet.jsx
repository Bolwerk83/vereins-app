// =========================================================================
//  MODUL: Datenqualität & Querchecks
//  Führt die Validierungsregeln (core/validierung.js) gegen die aktuellen
//  Werte aus und zeigt Abstimmfehler/Plausibilitätswarnungen — die
//  Vertrauensbasis für das digitale Controlling.
// =========================================================================
import React from 'react'
import { pruefeAlle } from '../../core/validierung.js'
import { Badge } from '../../components/ui.jsx'

const FARBE = { ok: 'var(--amp-g)', warnung: 'var(--amp-a)', fehler: 'var(--amp-r)', na: 'var(--muted)' }
const LABEL = { ok: 'OK', warnung: 'Plausibilität', fehler: 'Abstimmfehler', na: 'keine Daten' }

export default function Datenqualitaet({ werte, periode }) {
  const ergebnisse = pruefeAlle(werte)
  const z = {
    ok: ergebnisse.filter((e) => e.status === 'ok').length,
    warnung: ergebnisse.filter((e) => e.status === 'warnung').length,
    fehler: ergebnisse.filter((e) => e.status === 'fehler').length
  }
  return (
    <div style={{ maxWidth: 980, margin: '0 auto', display: 'grid', gap: 16 }}>
      <div style={{ background: 'var(--panel)', border: '1px solid var(--line)', borderRadius: 'var(--radius)', padding: 16, boxShadow: 'var(--shadow)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2 style={{ fontSize: 18 }}>Datenqualität & Querchecks <span className="mono" style={{ fontSize: 12, color: 'var(--muted)' }}>· {periode}</span></h2>
          <div style={{ display: 'flex', gap: 8 }}>
            <Badge status="g">{z.ok} OK</Badge>
            <Badge status="a">{z.warnung} Plausibilität</Badge>
            <Badge status="r">{z.fehler} Abstimmfehler</Badge>
          </div>
        </div>
        <p style={{ color: 'var(--muted)', fontSize: 13, marginTop: 6 }}>
          Bereichsübergreifende Abstimmung: Stimmen die Zahlen untereinander? Wo muss ich hinschauen?
        </p>
      </div>

      <div style={{ background: 'var(--panel)', border: '1px solid var(--line)', borderRadius: 'var(--radius)', overflow: 'hidden' }}>
        {ergebnisse.map((e, i) => (
          <div key={e.id} style={{ display: 'grid', gridTemplateColumns: '14px 1fr 220px 130px', gap: 12, alignItems: 'center',
            padding: '12px 16px', borderTop: i ? '1px solid var(--line)' : 'none' }}>
            <span style={{ width: 10, height: 10, borderRadius: '50%', background: FARBE[e.status] }} />
            <div>
              <div style={{ fontWeight: 600, fontSize: 14 }}>{e.titel}</div>
              <div style={{ fontSize: 12, color: 'var(--muted)' }}>{e.hinweis} · Bereich {e.bereich} · {e.schwere}</div>
            </div>
            <div className="mono" style={{ fontSize: 12, color: 'var(--slate)' }}>
              Ist {e.ist} · Soll {e.soll}
            </div>
            <span style={{ justifySelf: 'end', fontSize: 12, fontWeight: 600, color: FARBE[e.status] }}>{LABEL[e.status]}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
