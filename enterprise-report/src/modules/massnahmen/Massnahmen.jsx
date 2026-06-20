// =========================================================================
//  MODUL: Maßnahmen — KI-Empfehlung (SMART), Eingabe & Verwaltung.
//  "Controller-Auswertung" erzeugt SMART-Maßnahmen; übernommene Maßnahmen
//  werden verwaltet (Owner, Frist, Status). Object-Level-Security greift.
// =========================================================================
import React, { useState, useEffect } from 'react'
import { ladeMassnahmen, addMassnahme, updateMassnahme, removeMassnahme, STATUS, istUeberfaellig, trackingZusammenfassung } from '../../core/massnahmen.js'
import { empfehleMassnahmen, BI_QUELLE } from '../../core/biProvider.js'
import { KPI } from '../../core/kpiRegistry.js'
import { formatWert } from '../../design/theme.js'
import { Badge } from '../../components/ui.jsx'

const AMP = { gering: 'g', mittel: 'a', hoch: 'r' }
const card = { background: 'var(--panel)', border: '1px solid var(--line)', borderRadius: 'var(--radius)', padding: 16, boxShadow: 'var(--shadow)' }
const inp = { width: '100%', padding: '7px 9px', border: '1px solid var(--line)', borderRadius: 'var(--radius-sm)', font: 'inherit', marginTop: 3 }
const lbl = { fontSize: 11, color: 'var(--muted)', fontWeight: 600 }

function SmartZeile({ k, children }) {
  return <div style={{ fontSize: 12.5 }}><b style={{ color: 'var(--accent)' }}>{k}</b> {children}</div>
}

export default function Massnahmen({ werte, rolle, autoKontext, onVerbraucht }) {
  const [liste, setListe] = useState(ladeMassnahmen())
  const [empf, setEmpf] = useState([])
  const [laedt, setLaedt] = useState(false)
  const [fehler, setFehler] = useState(null)
  const [form, setForm] = useState({ titel: '', bereich: '', hebel: '', frist: 'nächstes Quartal', owner: '', aufwand: 'mittel' })
  const aktualisieren = () => setListe(ladeMassnahmen())

  async function empfehlen(kontext) {
    setLaedt(true); setFehler(null)
    try { setEmpf(await empfehleMassnahmen(kontext || 'Gesamtlage', werte, rolle)) }
    catch (e) { setFehler(String(e.message || e)) }
    finally { setLaedt(false) }
  }
  // Auto-Auswertung, wenn aus einem Bericht aufgerufen ("Knopf gedrückt").
  useEffect(() => { if (autoKontext) { empfehlen(autoKontext); onVerbraucht?.() } /* eslint-disable-next-line */ }, [autoKontext])

  function uebernehmen(e) {
    addMassnahme({ titel: e.titel, kpi: e.kpi, zielwert: e.zielwert, einheit: e.einheit, bereich: e.bereich,
      hebel: e.hebel, erreichbarkeit: e.erreichbarkeit, relevanz: e.relevanz, frist: e.frist,
      wirkungErgebnis: e.wirkungErgebnis, wirkungLiquiditaet: e.wirkungLiquiditaet, aufwand: e.aufwand, quelle: 'ki' })
    setEmpf(empf.filter((x) => x !== e)); aktualisieren()
  }
  function neuAnlegen() {
    if (!form.titel.trim()) return
    addMassnahme({ ...form }); setForm({ titel: '', bereich: '', hebel: '', frist: 'nächstes Quartal', owner: '', aufwand: 'mittel' }); aktualisieren()
  }

  return (
    <div style={{ maxWidth: 1100, margin: '0 auto', display: 'grid', gap: 18 }}>
      {/* KI-Empfehlung */}
      <div style={card}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 8 }}>
          <h2 style={{ fontSize: 18 }}>Controller-Auswertung → SMART-Maßnahmen <Badge status={BI_QUELLE === 'claude' ? 'g' : 'n'}>Engine: {BI_QUELLE}</Badge></h2>
          <button onClick={() => empfehlen('Gesamtlage')} disabled={laedt}
            style={{ padding: '9px 16px', border: 'none', borderRadius: 'var(--radius-sm)', background: 'var(--accent)', color: '#fff', fontWeight: 600, opacity: laedt ? .6 : 1 }}>
            {laedt ? 'Auswertung läuft …' : '🎯 Auswerten (wie ein Controller)'}
          </button>
        </div>
        <p style={{ color: 'var(--muted)', fontSize: 13, marginTop: 4 }}>
          Wertet die auffälligen Kennzahlen aus und schlägt Maßnahmen nach <b>SMART</b> vor (spezifisch · messbar · erreichbar · relevant · terminiert).
        </p>
        {fehler && <div style={{ color: 'var(--amp-r)', fontSize: 13, marginTop: 8 }}>{fehler}</div>}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 12, marginTop: 12 }}>
          {empf.map((e, i) => (
            <div key={i} style={{ border: '1px solid var(--line)', borderLeft: `3px solid var(--amp-${e.ampel || 'a'})`, borderRadius: 'var(--radius)', padding: 12 }}>
              <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 6 }}>{e.titel}</div>
              <div style={{ display: 'grid', gap: 3 }}>
                <SmartZeile k="S">{e.titel}</SmartZeile>
                <SmartZeile k="M">{KPI[e.kpi]?.name || e.kpi} → Ziel {formatWert(e.zielwert, e.einheit)}{e.istwert != null ? ` (Ist ${formatWert(e.istwert, e.einheit)})` : ''}</SmartZeile>
                <SmartZeile k="A">{e.erreichbarkeit}</SmartZeile>
                <SmartZeile k="R">{e.relevanz}</SmartZeile>
                <SmartZeile k="T">{e.frist}</SmartZeile>
              </div>
              <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginTop: 8, flexWrap: 'wrap' }}>
                <Badge status={AMP[e.aufwand] || 'a'}>Aufwand {e.aufwand}</Badge>
                <span className="mono" style={{ fontSize: 11, color: 'var(--muted)' }}>{e.wirkungErgebnis} · {e.wirkungLiquiditaet}</span>
                <button onClick={() => uebernehmen(e)} style={{ marginLeft: 'auto', padding: '5px 10px', border: '1px solid var(--accent)', borderRadius: 'var(--radius-sm)', background: 'var(--accent-soft)', color: 'var(--accent)', fontWeight: 600, fontSize: 12 }}>übernehmen →</button>
              </div>
            </div>
          ))}
          {!empf.length && !laedt && <div style={{ color: 'var(--muted)', fontSize: 13 }}>Noch keine Empfehlungen — oben „Auswerten" drücken.</div>}
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '320px 1fr', gap: 18, alignItems: 'start' }}>
        {/* Eingabe */}
        <div style={card}>
          <h3 style={{ fontSize: 15, marginBottom: 8 }}>Maßnahme erfassen</h3>
          <div style={{ display: 'grid', gap: 8 }}>
            <div><span style={lbl}>Titel</span><input style={inp} value={form.titel} onChange={(e) => setForm({ ...form, titel: e.target.value })} /></div>
            <div style={{ display: 'flex', gap: 8 }}>
              <div style={{ flex: 1 }}><span style={lbl}>Bereich</span><input style={inp} value={form.bereich} onChange={(e) => setForm({ ...form, bereich: e.target.value })} /></div>
              <div style={{ flex: 1 }}><span style={lbl}>Hebel</span><input style={inp} value={form.hebel} onChange={(e) => setForm({ ...form, hebel: e.target.value })} /></div>
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <div style={{ flex: 1 }}><span style={lbl}>Owner</span><input style={inp} value={form.owner} onChange={(e) => setForm({ ...form, owner: e.target.value })} /></div>
              <div style={{ flex: 1 }}><span style={lbl}>Frist</span><input style={inp} value={form.frist} onChange={(e) => setForm({ ...form, frist: e.target.value })} /></div>
            </div>
            <div><span style={lbl}>Aufwand</span>
              <select style={inp} value={form.aufwand} onChange={(e) => setForm({ ...form, aufwand: e.target.value })}>
                <option value="gering">gering</option><option value="mittel">mittel</option><option value="hoch">hoch</option></select></div>
            <button onClick={neuAnlegen} style={{ padding: '9px', border: 'none', borderRadius: 'var(--radius-sm)', background: 'var(--ink)', color: '#fff', fontWeight: 600 }}>+ Anlegen</button>
          </div>
        </div>

        {/* Verwaltung + Tracking */}
        <div style={card}>
          {(() => { const z = trackingZusammenfassung(liste); return (
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 8 }}>
              <h3 style={{ fontSize: 15 }}>Maßnahmenverwaltung & Tracking</h3>
              <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                <Badge status="n">{z.offen} offen</Badge><Badge status="a">{z.in_arbeit} in Arbeit</Badge>
                <Badge status="g">{z.erledigt} erledigt</Badge>
                {z.ueberfaellig > 0 && <Badge status="r">{z.ueberfaellig} überfällig</Badge>}
                <span className="mono" style={{ fontSize: 11, color: 'var(--muted)' }}>Ø {z.fortschrittSchnitt}%</span>
              </div>
            </div>
          ) })()}

          {trackingZusammenfassung(liste).ueberfaellig > 0 && (
            <div style={{ background: 'var(--amp-r-soft)', color: 'var(--amp-r)', borderRadius: 'var(--radius-sm)', padding: '8px 10px', fontSize: 12.5, marginTop: 8 }}>
              ⚠ {liste.filter(istUeberfaellig).length} Maßnahme(n) überfällig — Fälligkeit prüfen oder Status aktualisieren.
            </div>
          )}

          <div style={{ marginTop: 8 }}>
            {liste.map((m) => (
              <div key={m.id} style={{ borderTop: '1px solid var(--line)', padding: '10px 0', borderLeft: istUeberfaellig(m) ? '3px solid var(--amp-r)' : 'none', paddingLeft: istUeberfaellig(m) ? 8 : 0 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8, alignItems: 'flex-start' }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 600, fontSize: 13.5 }}>{m.titel}</div>
                    <div style={{ fontSize: 11, color: 'var(--muted)' }}>
                      {m.bereich || '—'} · {m.hebel || '—'} · {m.quelle === 'ki' ? 'KI' : 'manuell'}
                      {m.kpi && KPI[m.kpi] ? ` · ${KPI[m.kpi].name} → ${formatWert(m.zielwert, m.einheit)}` : ''}
                      {m.wirkungErgebnis ? ` · erwartet: ${m.wirkungErgebnis}` : ''}
                    </div>
                  </div>
                  <button title="löschen" onClick={() => { removeMassnahme(m.id); aktualisieren() }} style={{ border: '1px solid var(--line)', borderRadius: 6, background: 'var(--panel)', color: 'var(--amp-r)', width: 26, height: 26 }}>✕</button>
                </div>
                {/* Tracking-Zeile */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 6, marginTop: 6 }}>
                  <label style={{ fontSize: 10, color: 'var(--muted)' }}>Owner
                    <input style={{ ...inp, marginTop: 2 }} value={m.owner || ''} onChange={(e) => { updateMassnahme(m.id, { owner: e.target.value }); aktualisieren() }} /></label>
                  <label style={{ fontSize: 10, color: 'var(--muted)' }}>Fällig bis
                    <input type="date" style={{ ...inp, marginTop: 2 }} value={m.faelligkeit || ''} onChange={(e) => { updateMassnahme(m.id, { faelligkeit: e.target.value }); aktualisieren() }} /></label>
                  <label style={{ fontSize: 10, color: 'var(--muted)' }}>Fortschritt %
                    <input type="number" min="0" max="100" style={{ ...inp, marginTop: 2 }} value={m.fortschritt ?? ''} onChange={(e) => { updateMassnahme(m.id, { fortschritt: e.target.value }); aktualisieren() }} /></label>
                  <label style={{ fontSize: 10, color: 'var(--muted)' }}>Wirkung realisiert
                    <input placeholder="z. B. +0,3 Mio €" style={{ ...inp, marginTop: 2 }} value={m.wirkungRealisiert || ''} onChange={(e) => { updateMassnahme(m.id, { wirkungRealisiert: e.target.value }); aktualisieren() }} /></label>
                  <label style={{ fontSize: 10, color: 'var(--muted)' }}>Status
                    <select style={{ ...inp, marginTop: 2 }} value={m.status} onChange={(e) => { updateMassnahme(m.id, { status: e.target.value }); aktualisieren() }}>
                      {STATUS.map((s) => <option key={s} value={s}>{s}</option>)}</select></label>
                </div>
                <div style={{ height: 6, background: 'var(--bg)', borderRadius: 3, marginTop: 6, overflow: 'hidden' }}>
                  <div style={{ width: `${Math.min(100, Number(m.fortschritt || 0))}%`, height: '100%', background: m.status === 'erledigt' ? 'var(--amp-g)' : 'var(--accent)' }} />
                </div>
              </div>
            ))}
            {!liste.length && <div style={{ color: 'var(--muted)', fontSize: 13, paddingTop: 8 }}>Noch keine Maßnahmen erfasst.</div>}
          </div>
        </div>
      </div>
    </div>
  )
}
