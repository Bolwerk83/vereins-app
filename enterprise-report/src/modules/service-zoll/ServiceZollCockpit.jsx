// =========================================================================
//  SERVICE-/ZOLL-COCKPIT — 360°-Sicht je Rad (BikeID → Seriennummern) für den
//  Telefon-Support und der Zoll-Mengenverbleib je Wareneingangs-/Zollnummer.
// =========================================================================
import React, { useState } from 'react'
import { suche, bikeVon, journalFuer, alleChargen, chargeVon, ORTE, ORT_STATUS } from '../../core/serienverfolgung.js'
import { AmpelPunkt } from '../../components/ui.jsx'

const card = { background: 'var(--panel)', border: '1px solid var(--line)', borderRadius: 'var(--radius)', boxShadow: 'var(--shadow)' }
const cap = { fontSize: 11, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '.04em', fontWeight: 700 }
const td = (al) => ({ textAlign: al, padding: '5px 9px', borderBottom: '1px solid var(--line)', whiteSpace: 'nowrap', fontSize: 12.5 })
const fmtD = (s) => s ? s.split('-').reverse().join('.') : '—'

function Journal({ pred }) {
  const j = journalFuer(pred)
  if (!j.length) return null
  return (
    <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: 6 }}>
      <thead><tr>{['Datum', 'Von', 'Nach', 'Status', 'Ort', 'Beleg'].map((h, i) => <th key={i} style={{ ...td('left'), borderBottom: '2px solid var(--line)', fontSize: 10, color: 'var(--muted)', textTransform: 'uppercase' }}>{h}</th>)}</tr></thead>
      <tbody>{j.map((b, i) => (
        <tr key={i}>
          <td style={td('left')} className="mono">{fmtD(b.datum)}</td>
          <td style={td('left')}>{b.von}</td>
          <td style={td('left')}><span style={{ color: ORT_STATUS[b.nach]?.farbe || 'var(--ink)', fontWeight: 600 }}>{ORT_STATUS[b.nach]?.icon} {b.nach}</span></td>
          <td style={td('left')}>{b.status}</td>
          <td style={td('left')}>{b.ort}</td>
          <td style={td('left')} className="mono">{b.beleg}</td>
        </tr>
      ))}</tbody>
    </table>
  )
}

function Service360() {
  const [q, setQ] = useState('')
  const [sel, setSel] = useState(null)
  const treffer = suche(q)
  const bike = sel ? bikeVon(sel) : (treffer.length === 1 ? treffer[0] : null)

  return (
    <div style={{ display: 'grid', gap: 14 }}>
      <div style={{ ...card, padding: 14 }}>
        <div style={{ ...cap, marginBottom: 6 }}>📞 360°-Suche — BikeID · Rahmen-/Gabel-/Motor-/Akkunummer · Auftrag · Kunde</div>
        <input value={q} onChange={(e) => { setQ(e.target.value); setSel(null) }} placeholder="z. B. BK-100231, RA-0041-007, SO-88245 oder Kundenname …"
          style={{ width: '100%', padding: '9px 12px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--line)', font: 'inherit', fontSize: 14, background: 'var(--panel)', color: 'var(--ink)', boxSizing: 'border-box' }} />
        {q && treffer.length !== 1 && (
          <div style={{ marginTop: 8, display: 'flex', flexWrap: 'wrap', gap: 6 }}>
            {treffer.length === 0 ? <span style={{ fontSize: 13, color: 'var(--muted)' }}>Kein Treffer.</span>
              : treffer.map((b) => <button key={b.bikeId} onClick={() => setSel(b.bikeId)} style={{ ...card, padding: '5px 10px', cursor: 'pointer', fontSize: 12.5 }}>{b.bikeId} · {b.modell}</button>)}
          </div>
        )}
      </div>

      {bike && (() => {
        const ch = chargeVon(bike.charge)
        return (
          <div style={{ ...card, padding: 16 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 8 }}>
              <div>
                <div style={{ fontSize: 18, fontWeight: 800 }}>{bike.modell}</div>
                <div style={{ fontSize: 12.5, color: 'var(--muted)' }}>BikeID <b className="mono">{bike.bikeId}</b> · Kunde {bike.kunde} · gekauft {fmtD(bike.kaufdatum)}</div>
              </div>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 12.5, fontWeight: 700, color: ORT_STATUS[bike.ort]?.farbe, border: `1px solid ${ORT_STATUS[bike.ort]?.farbe}`, borderRadius: 999, padding: '3px 11px' }}>{ORT_STATUS[bike.ort]?.icon} {bike.ort}</span>
            </div>

            <div style={{ ...cap, margin: '14px 0 6px' }}>Seriennummern</div>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {[['Rahmen', bike.serien.rahmen], ['Gabel', bike.serien.gabel], ['Motor', bike.serien.motor], ['Akku', bike.serien.akku]].map(([l, v]) => (
                <div key={l} style={{ ...card, padding: '8px 12px', minWidth: 130 }}><div style={{ ...cap }}>{l}</div><div className="mono" style={{ fontSize: 14, fontWeight: 700 }}>{v || '— (nicht erfasst)'}</div></div>
              ))}
            </div>
            {ch && <div style={{ fontSize: 12, color: 'var(--muted)', marginTop: 8 }}>Rahmen-Charge <b className="mono">{ch.zollNr}</b> · Wareneingang {fmtD(ch.eingang)} · {ch.lieferant} ({ch.land})</div>}

            <div style={{ ...cap, margin: '14px 0 4px' }}>Schnellaktionen</div>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {['↩ Retoure anlegen', '⚠ Reklamation erfassen', '🔧 Serviceauftrag'].map((a) => (
                <button key={a} onClick={() => alert(`${a} für ${bike.bikeId} (Demo)`)} style={{ ...card, padding: '7px 13px', cursor: 'pointer', fontSize: 13, fontWeight: 600 }}>{a}</button>
              ))}
            </div>

            <div style={{ ...cap, margin: '14px 0 0' }}>Bewegungsjournal (Audit-Trail)</div>
            <Journal pred={(x) => x.bikeId === bike.bikeId} />
          </div>
        )
      })()}
    </div>
  )
}

function ZollTraceability() {
  const [sel, setSel] = useState(null)
  const chargen = alleChargen()
  const aktiv = sel ? chargen.find((c) => c.zollNr === sel) : chargen[0]

  return (
    <div style={{ display: 'grid', gap: 14 }}>
      <div style={{ ...card, padding: 14 }}>
        <div style={{ ...cap, marginBottom: 8 }}>🛃 Zoll-/Wareneingangschargen — Mengenverbleib für den Nachweis</div>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {chargen.map((c) => (
            <button key={c.zollNr} onClick={() => setSel(c.zollNr)} style={{ ...card, padding: '8px 12px', cursor: 'pointer', textAlign: 'left', borderColor: aktiv?.zollNr === c.zollNr ? 'var(--accent)' : 'var(--line)' }}>
              <div style={{ fontWeight: 700, fontSize: 13 }} className="mono">{c.zollNr}</div>
              <div style={{ fontSize: 11.5, color: 'var(--muted)' }}>{c.artikel} · {c.menge} Stk</div>
              <div style={{ fontSize: 11, marginTop: 2 }}><AmpelPunkt status={c.vollstaendig ? 'g' : 'r'} size={11} /> {c.vollstaendig ? 'vollständig' : 'Lücke'}</div>
            </button>
          ))}
        </div>
      </div>

      {aktiv && (
        <div style={{ ...card, padding: 16 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8 }}>
            <div><div style={{ fontSize: 16, fontWeight: 800 }} className="mono">{aktiv.zollNr}</div>
              <div style={{ fontSize: 12.5, color: 'var(--muted)' }}>{aktiv.artikel} · {aktiv.menge} Stk · Eingang {fmtD(aktiv.eingang)} · {aktiv.lieferant} ({aktiv.land})</div></div>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 12.5, fontWeight: 700 }}><AmpelPunkt status={aktiv.vollstaendig ? 'g' : 'r'} size={13} /> {aktiv.summe}/{aktiv.menge} nachgewiesen</span>
          </div>

          <div style={{ ...cap, margin: '14px 0 6px' }}>Mengenverbleib</div>
          <div style={{ display: 'flex', height: 26, borderRadius: 6, overflow: 'hidden', border: '1px solid var(--line)' }}>
            {ORTE.filter((o) => aktiv.verteilung[o] > 0).map((o) => (
              <div key={o} title={`${o}: ${aktiv.verteilung[o]}`} style={{ flex: aktiv.verteilung[o], background: ORT_STATUS[o].farbe, color: '#fff', fontSize: 11, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{aktiv.verteilung[o]}</div>
            ))}
          </div>
          <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap', marginTop: 8 }}>
            {ORTE.map((o) => (
              <span key={o} style={{ fontSize: 12.5 }}><span style={{ color: ORT_STATUS[o].farbe }}>{ORT_STATUS[o].icon} {o}</span>: <b>{aktiv.verteilung[o]}</b></span>
            ))}
          </div>

          <div style={{ ...cap, margin: '14px 0 0' }}>Bewegungsjournal der Charge (Audit-Trail)</div>
          <Journal pred={(x) => x.charge === aktiv.zollNr} />
          <div style={{ fontSize: 11.5, color: 'var(--muted)', marginTop: 8 }}>Lückenloser Nachweis Lager → Produktion → Kunde / verschrottet — Grundlage für Zollvergünstigung (aktive Veredelung / Präferenz).</div>
        </div>
      )}
    </div>
  )
}

export default function ServiceZollCockpit() {
  const [tab, setTab] = useState('service')
  return (
    <div style={{ maxWidth: '100%', margin: '0 auto' }}>
      <div style={{ marginBottom: 12 }}>
        <h2 style={{ margin: '0 0 4px' }}>Service- & Zoll-Cockpit</h2>
        <div style={{ color: 'var(--muted)', fontSize: 13, maxWidth: 760 }}>360°-Sicht je Rad für den Support (BikeID → alle Seriennummern) und lückenloser Mengenverbleib je Zollcharge für den Zollnachweis.</div>
      </div>
      <div style={{ display: 'flex', border: '1px solid var(--line)', borderRadius: 'var(--radius-sm)', overflow: 'hidden', width: 'fit-content', marginBottom: 14 }}>
        {[['service', '📞 Service-360'], ['zoll', '🛃 Zoll-Traceability']].map(([id, lbl]) => (
          <button key={id} onClick={() => setTab(id)} style={{ padding: '7px 15px', border: 'none', fontSize: 13, fontWeight: 600, cursor: 'pointer', background: tab === id ? 'var(--accent)' : 'var(--panel)', color: tab === id ? '#fff' : 'var(--muted)' }}>{lbl}</button>
        ))}
      </div>
      {tab === 'service' && <Service360 />}
      {tab === 'zoll' && <ZollTraceability />}
    </div>
  )
}
