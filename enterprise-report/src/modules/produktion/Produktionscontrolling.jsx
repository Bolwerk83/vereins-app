// =========================================================================
//  PRODUKTIONSCONTROLLING — strategisch & operativ.
//  Cockpit · Werke & Linien (Live-Status, OEE) · Produktionsprogramm (EPQ) ·
//  Fehlteile (Material) · Qualität (FPY/Ausschuss/Sperrbestand).
// =========================================================================
import React, { useState } from 'react'
import {
  kennzahlen, werkeAuswertung, linienAuswertung, programm, fehlteile,
  qualitaetAuswertung, termintreue, STATUS_LABEL, oee,
  outputUebersicht, balance, BALANCE_STATUS, MONATE
} from '../../core/produktion.js'

const card = { background: 'var(--panel)', border: '1px solid var(--line)', borderRadius: 'var(--radius)', boxShadow: 'var(--shadow)' }
const cap = { fontSize: 11, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '.03em', fontWeight: 700 }
const n0 = (v) => Math.round(v).toLocaleString('de-DE')
const eur0 = (v) => Math.round(v).toLocaleString('de-DE')
const th = (al) => ({ textAlign: al, padding: '6px 9px', borderBottom: '2px solid var(--line)', fontSize: 10, color: 'var(--muted)', textTransform: 'uppercase' })
const td = (al, bold) => ({ textAlign: al, padding: '7px 9px', borderBottom: '1px solid var(--line)', fontWeight: bold ? 700 : 400 })
const oeeFarbe = (v) => (v >= 85 ? 'var(--amp-g)' : v >= 70 ? 'var(--amp-a)' : 'var(--amp-r)')

export default function Produktionscontrolling({ onGeh, onDetail }) {
  const [tab, setTab] = useState('cockpit')
  const [zeitraum, setZeitraum] = useState(6) // Monate für Output
  const k = kennzahlen()
  const werke = werkeAuswertung()
  const linien = linienAuswertung()
  const prog = programm()
  const ft = fehlteile()
  const q = qualitaetAuswertung()
  const tt = termintreue()
  const out = outputUebersicht(zeitraum)
  const bal = balance()
  const maxOut = Math.max(1, ...out.rows.flatMap((r) => r.reihe))

  return (
    <div style={{ maxWidth: '100%', margin: '0 auto' }}>
      <div style={{ marginBottom: 14 }}>
        <h2 style={{ margin: '0 0 4px' }}>Produktionscontrolling</h2>
        <div style={{ color: 'var(--muted)', fontSize: 13, maxWidth: 820 }}>
          Strategisch <i>und</i> operativ: optimale Losgrößen, Auslastung & Engpässe (OEE), fehlende Teile mit
          betroffenen Aufträgen und die Qualität (First-Pass-Yield, Ausschuss, Sperrbestand) — alle wichtigen
          Fragen der Kolleg:innen an einem Ort.
        </div>
      </div>

      {/* Operativer Alarm: Störungen / Fehlteile */}
      {(k.stoerungen > 0 || ft.kritisch > 0) && (
        <div style={{ ...card, borderLeft: '4px solid var(--amp-r)', background: 'var(--amp-r-soft)', padding: 12, marginBottom: 14, fontSize: 13 }}>
          <b style={{ color: 'var(--amp-r)' }}>⚠ Operativ jetzt:</b> {k.stoerungen} Linie(n) in Störung · {ft.kritisch} kritische Fehlteile blockieren {k.blockierteAuftraege} Auftrag/Aufträge.
          <button onClick={() => setTab('fehlteile')} style={{ ...btn, marginLeft: 10, padding: '3px 10px', fontSize: 12 }}>Fehlteile ansehen →</button>
        </div>
      )}

      {/* Cockpit-KPIs */}
      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 14 }}>
        <Kpi label="OEE (Ø)" wert={`${k.oee} %`} sub="Verf · Leist · Qual" farbe={oeeFarbe(k.oee)} />
        <Kpi label="Auslastung" wert={`${k.auslastung} %`} farbe={k.auslastung > 90 ? 'var(--amp-r)' : 'var(--amp-g)'} />
        <Kpi label="First-Pass-Yield" wert={`${k.fpy} %`} sub={`Ausschuss ${k.ausschussPct} %`} farbe={oeeFarbe(k.fpy)} />
        <Kpi label="Termintreue" wert={`${k.termintreue} %`} sub={`${k.ueberfaellig} überfällig`} farbe={k.ueberfaellig ? 'var(--amp-a)' : 'var(--amp-g)'} />
        <Kpi label="Fehlteile" wert={`${k.fehlteile}`} sub={`${k.blockierteAuftraege} Aufträge blockiert`} farbe={k.fehlteile ? 'var(--amp-r)' : 'var(--amp-g)'} />
        <Kpi label="Werke / Linien" wert={`${k.werkeN} / ${k.linienN}`} sub={`${k.engpaesse} Engpass-Linien`} />
        <Kpi label="Sperrbestand" wert={`${n0(k.sperrbestand)} Stk`} farbe="var(--amp-a)" />
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 6, marginBottom: 12, flexWrap: 'wrap' }}>
        {[['cockpit', 'Cockpit'], ['werke', 'Werke & Linien (live)'], ['output', 'Output & Markt-Abgleich'], ['programm', 'Produktionsprogramm'], ['fehlteile', `Fehlteile${ft.fehlteileN ? ` (${ft.fehlteileN})` : ''}`], ['qualitaet', 'Qualität']].map(([id, n]) => (
          <button key={id} onClick={() => setTab(id)} style={{ padding: '7px 13px', borderRadius: 'var(--radius-sm)', cursor: 'pointer', fontSize: 13, fontWeight: 600,
            border: `1px solid ${tab === id ? 'var(--accent)' : 'var(--line)'}`, background: tab === id ? 'var(--accent)' : 'var(--panel)', color: tab === id ? '#fff' : 'var(--ink)' }}>{n}</button>
        ))}
      </div>

      {tab === 'cockpit' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 12 }}>
          <div style={{ ...card, padding: 16 }}>
            <div style={{ ...cap, marginBottom: 10 }}>Werke im Überblick</div>
            {werke.map((w) => (
              <div key={w.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', borderBottom: '1px solid var(--line)' }}>
                <div>
                  <div style={{ fontWeight: 600, fontSize: 13.5 }}>{w.name}</div>
                  <div style={{ fontSize: 11.5, color: 'var(--muted)' }}>{w.ort} · {w.linienN} Linien · {w.schichten} Schichten{w.stoerungen ? ` · ${w.stoerungen} Störung` : ''}</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div className="mono" style={{ fontWeight: 700, color: oeeFarbe(w.oee) }}>{w.oee} % OEE</div>
                  <div style={{ fontSize: 11, color: 'var(--muted)' }}>Auslastung {w.auslastung} %</div>
                </div>
              </div>
            ))}
          </div>
          <div style={{ ...card, padding: 16 }}>
            <div style={{ ...cap, marginBottom: 10 }}>Was sticht heraus?</div>
            <ul style={{ margin: 0, paddingLeft: 18, fontSize: 13, lineHeight: 1.7 }}>
              <li><b>Engpass:</b> {prog.rows.filter((r) => r.engpass).map((r) => r.name).join(', ') || 'keiner'} — höchste Auslastung, hier zuerst Kapazität sichern.</li>
              <li><b>Qualität schwächste Linie:</b> {q.schlechteste.linie} (FPY {q.schlechteste.fpy} %, {q.schlechteste.hauptgrund}).</li>
              <li><b>Fehlteile:</b> {ft.fehlteileN} offen, {ft.kritisch} kritisch — blockiert {ft.betroffeneAuftraege.length} Aufträge.</li>
              <li><b>Termine:</b> {tt.ueberfaellig} überfällige Aufträge ({k.termintreue} % Termintreue).</li>
              <li><b>Sparpotenzial Losgrößen:</b> optimierte EPQ senken Rüst-/Lagerkosten auf {eur0(prog.gesamtkosten)} €/Jahr.</li>
            </ul>
          </div>
        </div>
      )}

      {tab === 'werke' && (
        <div style={{ ...card, padding: 16, overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12.5, minWidth: 880 }}>
            <thead><tr>{['Werk', 'Linie', 'Produkt', 'Status', 'Auftrag', 'Auslastung', 'Verf.', 'Leist.', 'Qual.', 'OEE'].map((h, i) => <th key={i} style={th(i <= 4 ? 'left' : 'right')}>{h}</th>)}</tr></thead>
            <tbody>
              {linien.map((l) => (
                <tr key={l.id} style={{ background: l.engpass ? 'var(--amp-a-soft)' : undefined }}>
                  <td style={{ ...td('left'), color: 'var(--muted)', fontSize: 12 }}>{l.werk}</td>
                  <td style={td('left', true)}>{l.name}{l.engpass && <span title="Engpass" style={{ marginLeft: 5 }}>⛰️</span>}{l.weltklasse && <span title="OEE Weltklasse ≥ 85 %" style={{ marginLeft: 4 }}>⭐</span>}</td>
                  <td style={td('left')}>{l.produkt}</td>
                  <td style={td('left')}><span style={{ fontSize: 11, fontWeight: 700, color: STATUS_LABEL[l.status].farbe }}>● {STATUS_LABEL[l.status].label}</span>{l.stoerungGrund && <div style={{ fontSize: 10.5, color: 'var(--amp-r)' }}>{l.stoerungGrund}</div>}</td>
                  <td className="mono" style={{ ...td('left'), fontSize: 12 }}>{l.auftrag || '—'}</td>
                  <td className="mono" style={{ ...td('right'), color: l.auslastungPct > 90 ? 'var(--amp-r)' : undefined }}>{l.auslastungPct} %</td>
                  <td className="mono" style={td('right')}>{l.verf} %</td>
                  <td className="mono" style={td('right')}>{l.leist} %</td>
                  <td className="mono" style={td('right')}>{l.qual} %</td>
                  <td className="mono" style={{ ...td('right', true), color: oeeFarbe(l.oee) }}>{l.oee} %</td>
                </tr>
              ))}
            </tbody>
          </table>
          <div style={{ fontSize: 12, color: 'var(--muted)', marginTop: 10 }}>
            <b>OEE</b> = Verfügbarkeit · Leistung · Qualität (Weltklasse ≥ 85 % ⭐). <b>⛰️ Engpass</b> = höchste Auslastung — bestimmt den möglichen Gesamt-Output.
          </div>
        </div>
      )}

      {tab === 'output' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {/* Output über Zeitraum */}
          <div style={{ ...card, padding: 16, overflowX: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 8, marginBottom: 10 }}>
              <div style={cap}>Output je Produkt — letzte {zeitraum} Monate (gesamt {n0(out.gesamt)} Stk)</div>
              <div style={{ display: 'flex', gap: 4 }}>
                {[1, 3, 6].map((mn) => (
                  <button key={mn} onClick={() => setZeitraum(mn)} style={{ padding: '4px 11px', borderRadius: 'var(--radius-sm)', cursor: 'pointer', fontSize: 12, fontWeight: 600,
                    border: `1px solid ${zeitraum === mn ? 'var(--accent)' : 'var(--line)'}`, background: zeitraum === mn ? 'var(--accent)' : 'var(--panel)', color: zeitraum === mn ? '#fff' : 'var(--ink)' }}>{mn === 1 ? 'letzter Monat' : `${mn} Monate`}</button>
                ))}
              </div>
            </div>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12.5, minWidth: 760 }}>
              <thead><tr>{['Produkt', 'Verlauf', 'Ø/Monat', 'Summe Zeitraum'].map((h, i) => <th key={i} style={th(i === 0 ? 'left' : i === 1 ? 'left' : 'right')}>{h}</th>)}</tr></thead>
              <tbody>
                {out.rows.map((r) => (
                  <tr key={r.id}>
                    <td style={td('left', true)}>{r.name}</td>
                    <td style={{ ...td('left'), minWidth: 200 }}>
                      <div style={{ display: 'flex', alignItems: 'flex-end', gap: 3, height: 30 }}>
                        {r.reihe.map((v, i) => (
                          <span key={i} title={`${MONATE[MONATE.length - r.reihe.length + i] || ''}: ${n0(v)}`}
                            style={{ width: 14, height: `${Math.max(3, v / maxOut * 30)}px`, background: 'var(--accent)', borderRadius: 2, opacity: 0.45 + 0.55 * (i + 1) / r.reihe.length }} />
                        ))}
                      </div>
                    </td>
                    <td className="mono" style={td('right')}>{n0(r.schnitt)}</td>
                    <td className="mono" style={td('right', true)}>{n0(r.summe)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Produktion ↔ Lager ↔ Auftragsbestand */}
          <div style={{ ...card, padding: 16, overflowX: 'auto' }}>
            <div style={{ ...cap, marginBottom: 10 }}>Produktion ↔ Lagerbestand ↔ offener Auftragsbestand — wo optimieren?</div>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12.5, minWidth: 880 }}>
              <thead><tr>{['Produkt', 'Output/Monat', 'Lagerbestand', 'Reichweite', 'Auftragsbestand', 'Deckung', 'Empfehlung'].map((h, i) => <th key={i} style={th(i === 0 || i === 6 ? 'left' : 'right')}>{h}</th>)}</tr></thead>
              <tbody>
                {bal.map((r) => {
                  const st = BALANCE_STATUS[r.status]
                  return (
                    <tr key={r.id} style={{ background: r.status === 'aufstocken' ? 'var(--amp-r-soft)' : r.status === 'drosseln' ? 'var(--amp-a-soft)' : undefined }}>
                      <td style={td('left', true)}>{r.name}</td>
                      <td className="mono" style={td('right')}>{n0(r.monatsOutput)}</td>
                      <td className="mono" style={td('right')}>{n0(r.lager)}</td>
                      <td className="mono" style={td('right')}>{r.reichweiteMon} Mon</td>
                      <td className="mono" style={td('right')}>{n0(r.auftragsbestand)}</td>
                      <td className="mono" style={{ ...td('right'), color: st.farbe }}>{r.deckung >= 999 ? '—' : r.deckung + ' %'}</td>
                      <td style={td('left')}><span style={{ fontSize: 11, fontWeight: 700, color: st.farbe, border: `1px solid ${st.farbe}`, borderRadius: 999, padding: '1px 8px', whiteSpace: 'nowrap' }}>{st.label}</span></td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginTop: 12 }}>
              {bal.filter((r) => r.status !== 'ausgeglichen').map((r) => (
                <div key={r.id} style={{ fontSize: 12.5, borderLeft: `3px solid ${BALANCE_STATUS[r.status].farbe}`, paddingLeft: 10 }}>
                  <b>{r.name}:</b> {r.text}
                </div>
              ))}
            </div>
            <div style={{ fontSize: 12, color: 'var(--muted)', marginTop: 10 }}>
              <b>Deckung</b> = (Lager + 1 Monat Output) ÷ Auftragsbestand. &lt; 100 % → Rückstand droht (<b>aufstocken</b>).
              Viel Lager bei wenig Auftragsbestand → <b>drosseln</b> und Kapital freisetzen.
              {onGeh && <> Siehe auch <a style={{ color: 'var(--accent)', cursor: 'pointer' }} onClick={() => onGeh('lager')}>Lagerverwaltung</a> und <a style={{ color: 'var(--accent)', cursor: 'pointer' }} onClick={() => onGeh('auftrag')}>Auftrags-Lebenszyklus</a>.</>}
            </div>
          </div>
        </div>
      )}

      {tab === 'programm' && (
        <div style={{ ...card, padding: 16, overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12.5, minWidth: 860 }}>
            <thead><tr>{['Produkt', 'Jahresbedarf', 'Opt. Losgröße (EPQ)', 'Lose/J', 'Rüstkosten/J', 'Lagerkosten/J', 'Kap.-Tage', 'Auslastung'].map((h, i) => <th key={i} style={th(i === 0 ? 'left' : 'right')}>{h}</th>)}</tr></thead>
            <tbody>
              {prog.rows.map((r) => (
                <tr key={r.id} style={{ background: r.engpass ? 'var(--amp-a-soft)' : undefined }}>
                  <td style={td('left', true)}>{r.name}{r.engpass && <span title="Engpass" style={{ marginLeft: 5 }}>⛰️</span>}</td>
                  <td className="mono" style={td('right')}>{n0(r.jahresbedarf)}</td>
                  <td className="mono" style={td('right', true)}>{n0(r.losMenge)}</td>
                  <td className="mono" style={td('right')}>{r.loseProJahr}×</td>
                  <td className="mono" style={td('right')}>{eur0(r.ruestkostenJahr)} €</td>
                  <td className="mono" style={td('right')}>{eur0(r.lagerkostenJahr)} €</td>
                  <td className="mono" style={td('right')}>{r.kapTageBedarf}</td>
                  <td className="mono" style={{ ...td('right'), color: r.auslastungPct > 85 ? 'var(--amp-r)' : 'var(--amp-g)' }}>{r.auslastungPct} %</td>
                </tr>
              ))}
              <tr style={{ background: 'var(--bg)' }}>
                <td style={td('left', true)}>Summe</td>
                <td colSpan={3} />
                <td className="mono" style={td('right', true)} colSpan={2}>{eur0(prog.gesamtkosten)} € Rüst+Lager/Jahr</td>
                <td colSpan={2} />
              </tr>
            </tbody>
          </table>
          <div style={{ fontSize: 12, color: 'var(--muted)', marginTop: 10 }}>
            <b>EPQ (Economic Production Quantity):</b> wirtschaftlichste Losgröße bei eigener Fertigung — berücksichtigt, dass
            während der Produktion schon verbraucht wird (1 − Bedarf/Produktionsrate). <b>Kap.-Tage</b> = nötige Produktionstage/Jahr.
          </div>
        </div>
      )}

      {tab === 'fehlteile' && (
        <div style={{ ...card, padding: 16, overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12.5, minWidth: 880 }}>
            <thead><tr>{['Teil', 'Bestand', 'Bedarf', 'Fehlmenge', 'Deckung', 'Lieferant', 'Lieferung', 'Blockierte Aufträge'].map((h, i) => <th key={i} style={th(i === 0 || i >= 5 ? 'left' : 'right')}>{h}</th>)}</tr></thead>
            <tbody>
              {ft.rows.map((r) => {
                const farbe = r.schwere === 'kritisch' ? 'var(--amp-r)' : r.schwere === 'warnung' ? 'var(--amp-a)' : 'var(--amp-g)'
                return (
                  <tr key={r.id} style={{ background: r.schwere === 'kritisch' ? 'var(--amp-r-soft)' : undefined }}>
                    <td style={td('left', true)}>{r.name}</td>
                    <td className="mono" style={td('right')}>{n0(r.bestand)}</td>
                    <td className="mono" style={td('right')}>{n0(r.bedarf)}</td>
                    <td className="mono" style={{ ...td('right', true), color: farbe }}>{r.fehlmenge > 0 ? n0(r.fehlmenge) : '—'}</td>
                    <td className="mono" style={{ ...td('right'), color: farbe }}>{r.deckung} %</td>
                    <td style={{ ...td('left'), color: 'var(--muted)', fontSize: 12 }}>{r.lieferant}</td>
                    <td className="mono" style={td('left')}>{r.fehlmenge > 0 ? `${r.lieferAb} (${r.lieferInTagen >= 0 ? 'in ' + r.lieferInTagen + ' Tg' : Math.abs(r.lieferInTagen) + ' Tg überf.'})` : 'gedeckt'}</td>
                    <td className="mono" style={{ ...td('left'), fontSize: 12 }}>{r.fehlmenge > 0 ? r.auftraege.join(', ') : '—'}</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
          <div style={{ fontSize: 12, color: 'var(--muted)', marginTop: 10 }}>
            <b>Fehlmenge</b> = Bedarf − Bestand. <b>Deckung &lt; 50 %</b> oder Bestand 0 → kritisch (Linie steht).
            {ft.betroffeneAuftraege.length > 0 && <> Betroffene Aufträge insgesamt: <b>{ft.betroffeneAuftraege.join(', ')}</b>.</>}
          </div>
        </div>
      )}

      {tab === 'qualitaet' && (
        <div style={{ ...card, padding: 16, overflowX: 'auto' }}>
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 12 }}>
            <Kpi label="First-Pass-Yield (Ø)" wert={`${q.fpy} %`} farbe={oeeFarbe(q.fpy)} />
            <Kpi label="Nacharbeit (Ø)" wert={`${q.nacharbeitPct} %`} farbe="var(--amp-a)" />
            <Kpi label="Ausschuss (Ø)" wert={`${q.ausschussPct} %`} farbe="var(--amp-r)" />
            <Kpi label="Sperrbestand" wert={`${n0(q.sperrbestand)} Stk`} farbe="var(--amp-a)" />
          </div>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12.5, minWidth: 720 }}>
            <thead><tr>{['Linie', 'First-Pass-Yield', 'Nacharbeit', 'Ausschuss', 'Sperrbestand', 'Hauptfehler'].map((h, i) => <th key={i} style={th(i === 0 || i === 5 ? 'left' : 'right')}>{h}</th>)}</tr></thead>
            <tbody>
              {q.rows.map((r) => (
                <tr key={r.linieId}>
                  <td style={td('left', true)}>{r.linie}</td>
                  <td className="mono" style={{ ...td('right'), color: oeeFarbe(r.fpy) }}>{r.fpy} %</td>
                  <td className="mono" style={td('right')}>{r.nacharbeitPct} %</td>
                  <td className="mono" style={{ ...td('right'), color: r.ausschussPct > 3 ? 'var(--amp-r)' : undefined }}>{r.ausschussPct} %</td>
                  <td className="mono" style={td('right')}>{n0(r.sperrbestand)}</td>
                  <td style={{ ...td('left'), color: 'var(--muted)' }}>{r.hauptgrund}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <div style={{ fontSize: 12, color: 'var(--muted)', marginTop: 10 }}>
            <b>First-Pass-Yield</b> = Anteil ohne Nacharbeit/Ausschuss in einem Durchlauf. Linien mit niedrigem FPY und hohem
            Ausschuss zuerst angehen — sie treiben Kosten <i>und</i> senken die OEE.
          </div>
        </div>
      )}
    </div>
  )
}

const btn = { padding: '7px 13px', borderRadius: 'var(--radius-sm)', cursor: 'pointer', fontSize: 12.5, fontWeight: 600, border: '1px solid var(--accent)', background: 'var(--accent)', color: '#fff' }

function Kpi({ label, wert, sub, farbe }) {
  return <div style={{ ...card, padding: '10px 13px', flex: 1, minWidth: 150 }}>
    <div style={cap}>{label}</div>
    <div style={{ fontSize: 20, fontWeight: 700, color: farbe || 'var(--ink)' }}>{wert}</div>
    {sub && <div style={{ fontSize: 11, color: 'var(--muted)' }}>{sub}</div>}
  </div>
}
