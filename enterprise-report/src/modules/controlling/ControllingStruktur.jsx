// =========================================================================
//  CONTROLLING-STRUKTUR — Teilgebiete des Controllings als nachvollziehbare
//  Landkarte: nach Funktion und nach Faktoraspekt, je mit Aufgaben,
//  Instrumenten (operativ/strategisch) und zugeordneten Kennzahlen.
//  Plus Instrumente-Katalog (Abb. 1.9) und Management-Rechnungswesen (1.10).
// =========================================================================
import React, { useState } from 'react'
import { GLIEDERUNGEN, TEILGEBIETE, INSTRUMENTE_KATALOG, RECHNUNGSWESEN } from '../../core/controllingStruktur.js'
import { KPI } from '../../core/kpiRegistry.js'
import { ampelStatus } from '../../core/ampel.js'
import { darfKpi } from '../../core/rbac.js'
import { horizontInfo } from '../../core/klassifikation.js'
import { formatWert, AMPEL_FARBE } from '../../design/theme.js'
import { useKpiDef } from '../kennzahlen/KpiDefContext.jsx'

const card = { background: 'var(--panel)', border: '1px solid var(--line)', borderRadius: 'var(--radius)', boxShadow: 'var(--shadow)' }
const cap = { fontSize: 11, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '.03em', fontWeight: 700 }

function KpiChip({ id, werte, rolle, onOpen }) {
  const k = KPI[id]; if (!k) return null
  const darf = darfKpi(rolle, k)
  const st = darf ? ampelStatus({ wert: werte[id], ziel: k.ziel, richtung: k.richtung, warn: k.warn }) : 'n'
  return (
    <button onClick={() => onOpen?.(id)} title="Definition öffnen"
      style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '4px 10px', borderRadius: 999, cursor: 'pointer',
        border: '1px solid var(--line)', background: 'var(--bg)', fontSize: 12.5 }}>
      <span style={{ width: 8, height: 8, borderRadius: '50%', background: AMPEL_FARBE[st] }} />
      {k.name}
      <span className="mono" style={{ color: 'var(--muted)' }}>{darf ? formatWert(werte[id], k.einheit) : '🔒'}</span>
    </button>
  )
}

export default function ControllingStruktur({ werte = {}, rolle }) {
  const def = useKpiDef()
  const [g, setG] = useState('')   // '' = alle

  const liste = TEILGEBIETE.filter((t) => !g || t.gliederung === g)

  const chip = (aktiv) => ({ padding: '6px 13px', borderRadius: 999, fontSize: 13, cursor: 'pointer', fontWeight: 600,
    border: `1px solid ${aktiv ? 'var(--accent)' : 'var(--line)'}`, background: aktiv ? 'var(--accent)' : 'var(--panel)', color: aktiv ? '#fff' : 'var(--ink)' })

  return (
    <div>
      <div style={{ marginBottom: 14 }}>
        <h2 style={{ margin: '0 0 4px' }}>Controlling-Struktur</h2>
        <div style={{ color: 'var(--muted)', fontSize: 13, maxWidth: 760 }}>
          Die Teilgebiete des Controllings — nach Funktion (Produktion, Marketing/Absatz, Logistik, F&E) und nach
          Faktoraspekt (Personal, Investition/Anlagen, Vorräte). Je Gebiet: Aufgaben, operative und strategische
          Instrumente sowie die zugeordneten Kennzahlen.
        </div>
        <div style={{ display: 'flex', gap: 8, marginTop: 12, flexWrap: 'wrap' }}>
          <button style={chip(g === '')} onClick={() => setG('')}>Alle</button>
          {GLIEDERUNGEN.map((x) => <button key={x.id} title={x.hinweis} style={chip(g === x.id)} onClick={() => setG(g === x.id ? '' : x.id)}>{x.name}</button>)}
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(420px, 1fr))', gap: 14 }} className="raster-2">
        {liste.map((t) => (
          <div key={t.id} style={{ ...card, padding: 16, display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <span style={{ fontSize: 22 }}>{t.icon}</span>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 700, fontSize: 16 }}>{t.name}</div>
                <div style={cap}>{t.gliederung === 'funktional' ? 'nach Funktion' : 'nach Faktoraspekt'} · {t.bereich}</div>
              </div>
            </div>
            <div style={{ fontSize: 13, color: 'var(--slate)' }}>{t.beschreibung}</div>

            <div>
              <div style={{ ...cap, marginBottom: 5 }}>Aufgaben</div>
              <ul style={{ margin: 0, paddingLeft: 18, fontSize: 13, lineHeight: 1.5 }}>
                {t.aufgaben.map((a, i) => <li key={i}>{a}</li>)}
              </ul>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              <div>
                <div style={{ ...cap, color: '#2563eb', marginBottom: 5 }}>Operativ</div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5 }}>
                  {t.instrumente.operativ.map((x) => <span key={x} style={instTag('#2563eb')}>{x}</span>)}
                </div>
              </div>
              <div>
                <div style={{ ...cap, color: '#7c3aed', marginBottom: 5 }}>Strategisch</div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5 }}>
                  {t.instrumente.strategisch.map((x) => <span key={x} style={instTag('#7c3aed')}>{x}</span>)}
                </div>
              </div>
            </div>

            <div>
              <div style={{ ...cap, marginBottom: 5 }}>Kennzahlen ({t.kpis.length})</div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                {t.kpis.map((id) => <KpiChip key={id} id={id} werte={werte} rolle={rolle} onOpen={def?.oeffne} />)}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Instrumente-Katalog (Abb. 1.9) */}
      <div style={{ ...card, padding: 16, marginTop: 18 }}>
        <div style={{ ...cap, marginBottom: 10 }}>Instrumente-Katalog — dispositive Controlling-Einsatztechniken</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 14 }}>
          {INSTRUMENTE_KATALOG.map((grp) => (
            <div key={grp.gruppe}>
              <div style={{ fontWeight: 600, fontSize: 13, marginBottom: 6 }}>{grp.gruppe}</div>
              <ul style={{ margin: 0, paddingLeft: 18, fontSize: 12.5, lineHeight: 1.5, color: 'var(--slate)' }}>
                {grp.items.map((it) => <li key={it}>{it}</li>)}
              </ul>
            </div>
          ))}
        </div>
      </div>

      {/* Management-Rechnungswesen (Abb. 1.10) */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginTop: 14 }} className="raster-2">
        {[RECHNUNGSWESEN.extern, RECHNUNGSWESEN.intern].map((r) => (
          <div key={r.name} style={{ ...card, padding: 16 }}>
            <div style={{ ...cap, marginBottom: 8 }}>{r.name}</div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
              {r.items.map((it) => <span key={it} style={instTag('var(--muted)')}>{it}</span>)}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function instTag(farbe) {
  return { fontSize: 11.5, color: farbe, border: `1px solid ${farbe}`, borderRadius: 6, padding: '2px 7px', background: 'var(--panel)' }
}
