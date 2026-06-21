// =========================================================================
//  LEBENSZYKLUS → STRATEGIE & MASSNAHMEN — automatische Empfehlungen je
//  Produkt/Kunde mit Phasen-Bezug; jede Empfehlung lässt sich als Maßnahme
//  übernehmen (landet in der Maßnahmen-Nachverfolgung).
// =========================================================================
import React, { useState } from 'react'
import { empfehlungen, zusammenfassung } from '../../core/lebenszyklusEmpfehlung.js'
import { addMassnahme, ladeMassnahmen } from '../../core/massnahmen.js'

const card = { background: 'var(--panel)', border: '1px solid var(--line)', borderRadius: 'var(--radius)', boxShadow: 'var(--shadow)' }
const cap = { fontSize: 11, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '.03em', fontWeight: 700 }
const m1 = (v) => v.toLocaleString('de-DE', { minimumFractionDigits: 1, maximumFractionDigits: 1 })

const ART = {
  risiko: { label: 'Risiko', farbe: 'var(--amp-r)', icon: '⚠' },
  chance: { label: 'Chance', farbe: 'var(--amp-g)', icon: '↗' },
  halten: { label: 'Halten', farbe: 'var(--muted)', icon: '=' }
}

export default function Empfehlungen({ onGeh }) {
  const [ebene, setEbene] = useState('produkt')
  const [tick, setTick] = useState(0)
  const liste = empfehlungen({ ebene })
  const z = zusammenfassung(liste)

  // Bereits übernommene Maßnahmen (per Titel + quelle) erkennen.
  const vorhanden = new Set(ladeMassnahmen().map((m) => `${m.quelle}|${m.titel}`))

  function uebernehmen(e) {
    addMassnahme({ ...e.massnahme })
    setTick((t) => t + 1)
  }
  function alleRisiken() {
    liste.filter((e) => e.art === 'risiko' && !vorhanden.has(`${e.massnahme.quelle}|${e.massnahme.titel}`))
      .forEach((e) => addMassnahme({ ...e.massnahme }))
    setTick((t) => t + 1)
  }

  return (
    <div style={{ maxWidth: 1000, margin: '0 auto' }} key={tick}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12, flexWrap: 'wrap', marginBottom: 14 }}>
        <div>
          <h2 style={{ margin: '0 0 4px' }}>Lebenszyklus → Strategie &amp; Maßnahmen</h2>
          <div style={{ color: 'var(--muted)', fontSize: 13, maxWidth: 680 }}>
            Aus der Phase jedes Produkts und Kunden werden konkrete Empfehlungen abgeleitet. Übernimm sie als Maßnahme —
            mit Verantwortlichem und Frist nachverfolgbar.
          </div>
        </div>
        <div style={{ display: 'flex', border: '1px solid var(--line)', borderRadius: 'var(--radius-sm)', overflow: 'hidden' }}>
          {[['produkt', 'Produktgruppen'], ['artikel', 'Artikel']].map(([id, lbl]) => (
            <button key={id} onClick={() => setEbene(id)} style={{ padding: '6px 12px', border: 'none', fontSize: 12, fontWeight: 600, cursor: 'pointer',
              background: ebene === id ? 'var(--accent)' : 'var(--panel)', color: ebene === id ? '#fff' : 'var(--muted)' }}>{lbl}</button>
          ))}
        </div>
      </div>

      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 14 }}>
        <Kpi label="Empfehlungen" wert={z.gesamt} />
        <Kpi label="Dringend (Risiko)" wert={z.dringend} farbe="var(--amp-r)" />
        <Kpi label="Risiko-Umsatz" wert={`${m1(z.risikoUmsatz)} Mio €`} farbe="var(--amp-r)" />
        <Kpi label="Chancen" wert={z.chancen} farbe="var(--amp-g)" />
        <Kpi label="Chancen-Umsatz" wert={`${m1(z.chancenUmsatz)} Mio €`} farbe="var(--amp-g)" />
      </div>

      <div style={{ display: 'flex', gap: 8, marginBottom: 12, flexWrap: 'wrap' }}>
        <button onClick={alleRisiken} style={{ padding: '8px 13px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--amp-r)', background: 'var(--panel)', color: 'var(--amp-r)', cursor: 'pointer', fontSize: 13, fontWeight: 600 }}>
          ⚠ Alle Risiko-Maßnahmen übernehmen
        </button>
        {onGeh && <button onClick={() => onGeh('massnahmen')} style={{ padding: '8px 13px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--line)', background: 'var(--panel)', cursor: 'pointer', fontSize: 13 }}>→ Zur Maßnahmen-Nachverfolgung</button>}
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {liste.map((e) => {
          const art = ART[e.art]
          const schonDa = vorhanden.has(`${e.massnahme.quelle}|${e.massnahme.titel}`)
          return (
            <div key={e.id} style={{ ...card, padding: 15, borderLeft: `4px solid ${art.farbe}` }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12, flexWrap: 'wrap' }}>
                <div style={{ flex: 1, minWidth: 260 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                    <span style={{ fontSize: 11, fontWeight: 700, color: '#fff', background: art.farbe, padding: '2px 8px', borderRadius: 999 }}>{art.icon} {art.label}</span>
                    <span style={{ fontSize: 11, fontWeight: 600, color: '#fff', background: e.farbe, padding: '2px 8px', borderRadius: 999 }}>{e.typLabel}: {e.phaseName}</span>
                    <span style={{ fontSize: 12, color: 'var(--muted)' }}>{m1(e.umsatz)} Mio € · DB {e.db} %</span>
                  </div>
                  <div style={{ fontWeight: 700, fontSize: 15, margin: '7px 0 2px' }}>{e.titel}</div>
                  <div style={{ fontSize: 13, color: 'var(--muted)' }}><b>Strategie:</b> {e.strategie}</div>
                  <div style={{ fontSize: 13, color: 'var(--muted)', marginTop: 3 }}>{e.weg}</div>
                  <div style={{ fontSize: 12, color: 'var(--muted)', marginTop: 5 }}>Hebel: {e.hebel} · Frist: {e.frist} · Wirkung: {e.wirkung}</div>
                </div>
                <button onClick={() => uebernehmen(e)} disabled={schonDa}
                  style={{ whiteSpace: 'nowrap', padding: '8px 14px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--line)',
                    background: schonDa ? 'var(--amp-g-soft)' : 'var(--accent)', color: schonDa ? 'var(--amp-g)' : '#fff',
                    cursor: schonDa ? 'default' : 'pointer', fontSize: 13, fontWeight: 600 }}>
                  {schonDa ? '✓ übernommen' : '+ Als Maßnahme'}
                </button>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

function Kpi({ label, wert, farbe }) {
  return <div style={{ ...card, padding: '10px 13px', flex: 1, minWidth: 130 }}>
    <div style={cap}>{label}</div>
    <div style={{ fontSize: 20, fontWeight: 700, color: farbe || 'var(--ink)' }}>{wert}</div>
  </div>
}
