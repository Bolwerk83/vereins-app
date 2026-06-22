// =========================================================================
//  GUTSCHRIFTEN- & RETOUREN-COCKPIT (je Kunde)
//  Alle Belege je Kunde verknüpft; Retouren- vs. Wertgutschriften in EUR & %
//  zum tatsächlichen Auftrag (AET). „Sind wir beim Kunden sauber?"
// =========================================================================
import React, { useState } from 'react'
import { kundenUebersicht, gesamt, belegeVon, RETOURE_SCHWELLE } from '../../core/gutschriften.js'

const card = { background: 'var(--panel)', border: '1px solid var(--line)', borderRadius: 'var(--radius)', boxShadow: 'var(--shadow)' }
const cap = { fontSize: 11, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '.03em', fontWeight: 700 }
const eur0 = (v) => Math.round(v).toLocaleString('de-DE')
const th = (al) => ({ textAlign: al, padding: '6px 9px', borderBottom: '2px solid var(--line)', fontSize: 10, color: 'var(--muted)', textTransform: 'uppercase' })
const td = (al, bold) => ({ textAlign: al, padding: '7px 9px', borderBottom: '1px solid var(--line)', fontWeight: bold ? 700 : 400 })
const STATUS = { auffaellig: { farbe: 'var(--amp-r)', label: 'auffällig' }, beobachten: { farbe: 'var(--amp-a)', label: 'beobachten' }, sauber: { farbe: 'var(--amp-g)', label: 'sauber' } }

export default function Gutschriften() {
  const [offen, setOffen] = useState(null)
  const rows = kundenUebersicht()
  const g = gesamt()

  return (
    <div style={{ maxWidth: '100%', margin: '0 auto' }}>
      <div style={{ marginBottom: 14 }}>
        <h2 style={{ margin: '0 0 4px' }}>Gutschriften & Retouren — je Kunde</h2>
        <div style={{ color: 'var(--muted)', fontSize: 13, maxWidth: 820 }}>
          Alle Gutschriften/Retouren je Kunde <b>verknüpft</b> — auch über mehrere Versendungen hinweg. Getrennt nach
          <b> Retourengutschriften</b> (mit Absatzänderung) und <b>Wertgutschriften</b> (ohne Absatzänderung), jeweils in
          EUR und % zum tatsächlichen Auftrag. So sieht man, ob wir beim Kunden „sauber" sind.
        </div>
      </div>

      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 14 }}>
        <Kpi label="Tatsächl. Auftrag (AET)" wert={`${eur0(g.aet)} €`} />
        <Kpi label="Retourengutschriften" wert={`${eur0(g.retoureGut)} €`} sub={`${g.retoureQuote} % vom AET`} farbe="var(--amp-a)" />
        <Kpi label="Wertgutschriften (o. Absatz)" wert={`${eur0(g.wertGut)} €`} sub={`${g.wertQuote} % vom AET`} farbe="var(--accent)" />
        <Kpi label="Gutschriften gesamt" wert={`${eur0(g.gesamtGut)} €`} sub={`${g.gesamtQuote} % vom AET`} />
        <Kpi label={`Kunden > ${RETOURE_SCHWELLE}% Retoure`} wert={`${g.auffaellige}`} farbe={g.auffaellige ? 'var(--amp-r)' : 'var(--amp-g)'} />
      </div>

      <div style={{ ...card, padding: 16, overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12.5, minWidth: 920 }}>
          <thead><tr>{['', 'Kunde', 'Tatsächl. Auftrag', 'Retouregutschr. €', 'Retoure %', 'Wertgutschr. €', 'Wert %', 'Gesamt %', 'Status'].map((h, i) => <th key={i} style={th(i <= 1 ? 'left' : i === 8 ? 'left' : 'right')}>{h}</th>)}</tr></thead>
          <tbody>
            {rows.map((r) => {
              const auf = offen === r.id
              const st = STATUS[r.status]
              return (
                <React.Fragment key={r.id}>
                  <tr onClick={() => setOffen(auf ? null : r.id)} style={{ cursor: 'pointer', background: auf ? 'var(--accent-soft)' : r.auffaellig ? 'var(--amp-r-soft)' : undefined }}>
                    <td style={{ ...td('center'), color: 'var(--muted)' }}><span style={{ display: 'inline-block', transform: auf ? 'rotate(90deg)' : 'none', transition: 'transform .12s' }}>▶</span></td>
                    <td style={td('left', true)}>{r.name}<div style={{ fontWeight: 400, fontSize: 11, color: 'var(--muted)' }}>{r.belegeN} Belege verknüpft</div></td>
                    <td className="mono" style={td('right')}>{eur0(r.aet)} €</td>
                    <td className="mono" style={td('right')}>{eur0(r.retoureGut)} €</td>
                    <td className="mono" style={{ ...td('right', true), color: r.retoureQuote > RETOURE_SCHWELLE ? 'var(--amp-r)' : 'var(--ink)' }}>{r.retoureQuote} %</td>
                    <td className="mono" style={td('right')}>{eur0(r.wertGut)} €</td>
                    <td className="mono" style={{ ...td('right'), color: r.wertQuote > 10 ? 'var(--amp-a)' : 'var(--ink)' }}>{r.wertQuote} %</td>
                    <td className="mono" style={td('right')}>{r.gesamtQuote} %</td>
                    <td style={td('left')}><span style={{ fontSize: 11, fontWeight: 700, color: st.farbe, border: `1px solid ${st.farbe}`, borderRadius: 999, padding: '1px 8px' }}>{st.label}</span></td>
                  </tr>
                  {auf && (
                    <tr><td colSpan={9} style={{ padding: 0, background: 'var(--bg)', borderBottom: '1px solid var(--line)' }}>
                      <div style={{ padding: '10px 18px' }}>
                        <div style={{ ...cap, marginBottom: 6 }}>Verknüpfte Belege — {r.name}</div>
                        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
                          <thead><tr>{['Beleg', 'Datum', 'Auftrag', 'Art', 'Grund', 'Menge', 'Wert €'].map((h, i) => <th key={i} style={{ ...th(i >= 5 ? 'right' : 'left'), borderBottom: '1px solid var(--line)' }}>{h}</th>)}</tr></thead>
                          <tbody>
                            {belegeVon(r.id).map((b) => (
                              <tr key={b.beleg}>
                                <td className="mono" style={td('left')}>{b.beleg}</td>
                                <td className="mono" style={td('left')}>{b.datum}</td>
                                <td className="mono" style={td('left')}>{b.auftrag}</td>
                                <td style={td('left')}><span style={{ fontSize: 11, fontWeight: 700, color: b.typ === 'retoure' ? 'var(--amp-a)' : 'var(--accent)' }}>{b.typ === 'retoure' ? 'Retourengutschrift' : 'Wertgutschrift'}</span></td>
                                <td style={td('left')}>{b.grund}</td>
                                <td className="mono" style={td('right')}>{b.menge || '—'}</td>
                                <td className="mono" style={td('right', true)}>{eur0(b.wert)} €</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </td></tr>
                  )}
                </React.Fragment>
              )
            })}
          </tbody>
        </table>
        <div style={{ fontSize: 12, color: 'var(--muted)', marginTop: 10 }}>
          Klick auf einen Kunden zeigt alle verknüpften Belege (über mehrere Versendungen). <b>Retourengutschriften</b> ändern
          den Absatz, <b>Wertgutschriften</b> nicht. Rote Retourenquote &gt; {RETOURE_SCHWELLE} % = genauer prüfen.
        </div>
      </div>
    </div>
  )
}

function Kpi({ label, wert, sub, farbe }) {
  return <div style={{ ...card, padding: '10px 13px', flex: 1, minWidth: 150 }}>
    <div style={cap}>{label}</div>
    <div style={{ fontSize: 19, fontWeight: 700, color: farbe || 'var(--ink)' }}>{wert}</div>
    {sub && <div style={{ fontSize: 11, color: 'var(--muted)' }}>{sub}</div>}
  </div>
}
