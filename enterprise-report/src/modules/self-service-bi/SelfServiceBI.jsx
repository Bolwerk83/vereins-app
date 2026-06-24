// =========================================================================
//  MODUL: Self-Service BI
//  Der Anwender schreibt seine Anforderung in natürlicher Sprache; der
//  Controller-Lead + Berater-Beirat erzeugen daraus einen Bericht mit
//  Befunden und konkreten, mit Wirkung versehenen Maßnahmen.
// =========================================================================
import React, { useState } from 'react'
import { KPI } from '../../core/kpiRegistry.js'
import { darfKpi } from '../../core/rbac.js'
import { erzeugeBiBericht, BI_QUELLE } from '../../core/biProvider.js'
import { KiStatusBadge, useKiGate } from '../../components/KiGate.jsx'
import { CONTROLLER_LEAD, BERATER, UNTERNEHMENSZIEL } from '../../core/agentBoard.js'
import { KpiCard, KpiGesperrt, Badge, AmpelPunkt } from '../../components/ui.jsx'

const BEISPIELE = [
  'Warum wächst der Umsatz, aber nicht das Ergebnis?',
  'Wo binden wir am meisten Kapital und wie bekommen wir Liquidität frei?',
  'Wie senken wir die Wareneinsatzquote ohne Umsatzverlust?',
  'Was kostet uns die Online-Retourenquote wirklich?'
]

function BeiratPanel() {
  return (
    <div style={{ background: 'var(--panel)', border: '1px solid var(--line)', borderRadius: 'var(--radius)', padding: 14 }}>
      <div className="mono" style={{ fontSize: 11, color: 'var(--muted)', textTransform: 'uppercase', marginBottom: 8 }}>Beratender Beirat</div>
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10, paddingBottom: 10, borderBottom: '1px solid var(--line)' }}>
        <div style={{ width: 30, height: 30, borderRadius: 8, background: 'var(--accent)', color: '#fff', display: 'grid', placeItems: 'center', fontWeight: 700, fontSize: 12 }}>C</div>
        <div><div style={{ fontWeight: 600, fontSize: 13 }}>{CONTROLLER_LEAD.name} <Badge status="g">führt</Badge></div>
          <div style={{ fontSize: 12, color: 'var(--muted)' }}>{CONTROLLER_LEAD.mandat}</div></div>
      </div>
      {BERATER.map((b) => (
        <div key={b.id} style={{ display: 'flex', alignItems: 'flex-start', gap: 10, paddingTop: 10 }}>
          <div style={{ width: 30, height: 30, borderRadius: 8, background: 'var(--accent-soft)', color: 'var(--accent)', display: 'grid', placeItems: 'center', fontWeight: 700, fontSize: 11 }}>{b.bereich}</div>
          <div><div style={{ fontWeight: 600, fontSize: 13 }}>{b.name}</div>
            <div style={{ fontSize: 12, color: 'var(--muted)' }}>{b.mandat}</div></div>
        </div>
      ))}
    </div>
  )
}

export default function SelfServiceBI({ rolle, werte }) {
  const [text, setText] = useState('')
  const [laedt, setLaedt] = useState(false)
  const [bericht, setBericht] = useState(null)
  const [fehler, setFehler] = useState(null)

  const kiGate = useKiGate()
  async function senden(anforderung) {
    const a = (anforderung ?? text).trim()
    if (!a) return
    setText(a)
    if (!(await kiGate.fordere(a))) return // bei aktiver KI erst nach Bestätigung; offline immer true
    setLaedt(true); setFehler(null); setBericht(null)
    try { setBericht(await erzeugeBiBericht(a, werte, rolle)) }
    catch (e) { setFehler(String(e.message || e)) }
    finally { setLaedt(false) }
  }

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: 20, alignItems: 'start' }}>
      {kiGate.modal}
      <div style={{ display: 'grid', gap: 16 }}>
        {/* Eingabe */}
        <div style={{ background: 'var(--panel)', border: '1px solid var(--line)', borderRadius: 'var(--radius)', padding: 16, boxShadow: 'var(--shadow)' }}>
          <h2 style={{ fontSize: 18 }}>Self-Service BI</h2>
          <p style={{ color: 'var(--muted)', fontSize: 13, marginTop: 4 }}>
            Anforderung in eigenen Worten — der Beirat antwortet aus Controller-Sicht mit Befund und Maßnahmen.
          </p>
          <div style={{ marginTop: 6 }}><KiStatusBadge /></div>
          <textarea value={text} onChange={(e) => setText(e.target.value)} rows={3}
            placeholder="z. B. Warum steigt der Umsatz, aber nicht das Ergebnis?"
            style={{ width: '100%', marginTop: 10, padding: 10, border: '1px solid var(--line)', borderRadius: 'var(--radius-sm)', font: 'inherit', resize: 'vertical' }} />
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 8 }}>
            {BEISPIELE.map((b) => (
              <button key={b} onClick={() => senden(b)} style={{ fontSize: 11.5, padding: '5px 10px', border: '1px solid var(--line)', borderRadius: 999, background: 'var(--bg)' }}>{b}</button>
            ))}
          </div>
          <div style={{ marginTop: 10 }}>
            <button onClick={() => senden()} disabled={laedt} style={{ padding: '9px 18px', border: 'none', borderRadius: 'var(--radius-sm)', background: 'var(--accent)', color: '#fff', fontWeight: 600, opacity: laedt ? .6 : 1 }}>
              {laedt ? 'Beirat tagt …' : 'Auswerten →'}
            </button>
          </div>
        </div>

        {fehler && <div style={{ background: 'var(--amp-r-soft)', color: 'var(--amp-r)', padding: 12, borderRadius: 'var(--radius)', fontSize: 13 }}>
          {fehler} — läuft die Engine auf <code>heuristik</code>? Für Claude das Backend starten (siehe docs/08).</div>}

        {bericht && <BerichtAnsicht bericht={bericht} rolle={rolle} werte={werte} />}
      </div>

      <BeiratPanel />
    </div>
  )
}

function BerichtAnsicht({ bericht, rolle, werte }) {
  return (
    <div style={{ display: 'grid', gap: 16 }}>
      <div style={{ background: 'var(--panel)', border: '1px solid var(--line)', borderRadius: 'var(--radius)', padding: 16, boxShadow: 'var(--shadow)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h3 style={{ fontSize: 16 }}>{bericht.titel}</h3>
          <Badge status="n">Quelle: {bericht.quelle || 'claude'}</Badge>
        </div>
        <div style={{ marginTop: 8, fontSize: 14, color: 'var(--accent)', borderLeft: '3px solid var(--accent)', paddingLeft: 10 }}>
          {bericht.controllerSicht}
        </div>
      </div>

      {/* Relevante KPIs */}
      {bericht.relevanteKpis?.length > 0 && (
        <div>
          <div className="mono" style={{ fontSize: 11, color: 'var(--muted)', textTransform: 'uppercase', marginBottom: 8 }}>Relevante Kennzahlen</div>
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
            {bericht.relevanteKpis.filter((r) => KPI[r.id]).map((r) => darfKpi(rolle, KPI[r.id])
              ? <KpiCard key={r.id} kpiId={r.id} wert={werte[r.id]} alleWerte={werte} />
              : <KpiGesperrt key={r.id} kpiId={r.id} />)}
          </div>
        </div>
      )}

      {/* Befunde */}
      {bericht.befunde?.length > 0 && (
        <div style={{ background: 'var(--panel)', border: '1px solid var(--line)', borderRadius: 'var(--radius)', padding: 16 }}>
          <div className="mono" style={{ fontSize: 11, color: 'var(--muted)', textTransform: 'uppercase', marginBottom: 8 }}>Befunde</div>
          {bericht.befunde.map((f, i) => (
            <div key={i} style={{ display: 'flex', gap: 10, alignItems: 'flex-start', padding: '6px 0' }}>
              <span style={{ marginTop: 5 }}><AmpelPunkt status={f.bewertung} /></span>
              <span style={{ fontSize: 13.5 }}>{f.aussage}</span>
            </div>
          ))}
        </div>
      )}

      {/* Maßnahmen */}
      {bericht.massnahmen?.length > 0 && (
        <div>
          <div className="mono" style={{ fontSize: 11, color: 'var(--muted)', textTransform: 'uppercase', marginBottom: 8 }}>Maßnahmen (mit Wirkung)</div>
          <div style={{ border: '1px solid var(--line)', borderRadius: 'var(--radius)', overflow: 'hidden', background: 'var(--panel)' }}>
            {bericht.massnahmen.map((m, i) => (
              <div key={i} style={{ padding: '12px 14px', borderTop: i ? '1px solid var(--line)' : 'none' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', gap: 10, alignItems: 'center' }}>
                  <span style={{ fontWeight: 600, fontSize: 14 }}>{m.titel}</span>
                  <Badge status={m.aufwand === 'gering' ? 'g' : 'a'}>Aufwand {m.aufwand}</Badge>
                </div>
                <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap', marginTop: 6, fontSize: 12, color: 'var(--slate)' }}>
                  <span>Bereich: <b>{m.bereich}</b></span>
                  <span>Hebel: <b>{m.hebel}</b></span>
                  <span className="mono">Ergebnis: {m.ergebnis}</span>
                  <span className="mono">Liquidität: {m.liquiditaet}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Risiken + Beiratsbeiträge */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        {bericht.risiken?.length > 0 && (
          <div style={{ background: 'var(--panel)', border: '1px solid var(--line)', borderRadius: 'var(--radius)', padding: 14 }}>
            <div className="mono" style={{ fontSize: 11, color: 'var(--muted)', textTransform: 'uppercase', marginBottom: 6 }}>Risiken & Annahmen</div>
            <ul style={{ margin: 0, paddingLeft: 18, fontSize: 13, color: 'var(--slate)' }}>
              {bericht.risiken.map((r, i) => <li key={i} style={{ marginBottom: 4 }}>{r}</li>)}
            </ul>
          </div>
        )}
        {bericht.beirat?.length > 0 && (
          <div style={{ background: 'var(--panel)', border: '1px solid var(--line)', borderRadius: 'var(--radius)', padding: 14 }}>
            <div className="mono" style={{ fontSize: 11, color: 'var(--muted)', textTransform: 'uppercase', marginBottom: 6 }}>Stimmen des Beirats</div>
            {bericht.beirat.map((b, i) => (
              <div key={i} style={{ fontSize: 13, marginBottom: 6 }}><b>{b.bot}:</b> <span style={{ color: 'var(--slate)' }}>{b.beitrag}</span></div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
