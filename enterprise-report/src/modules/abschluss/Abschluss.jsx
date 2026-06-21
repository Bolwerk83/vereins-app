// =========================================================================
//  ABSCHLUSS & VERSIONIERUNG — Monatsabschluss revisionssicher einfrieren.
//  Workflow offen → in Abstimmung → freigegeben; Versionshistorie je Periode.
//  Freigabe sperrt die Periode (Datenart Ist) und löst den Verteiler aus.
// =========================================================================
import React, { useState } from 'react'
import { MONATE, AKTUELLER_MONAT, datenart, ladeModell } from '../../core/periodenmodell.js'
import {
  STATUS, statusInfo, periode, setStatus, sichereVersion, freigeben, wiedereroeffnen
} from '../../core/abschluss.js'
import { AMPEL_FARBE, AMPEL_SOFT } from '../../design/theme.js'

const card = { background: 'var(--panel)', border: '1px solid var(--line)', borderRadius: 'var(--radius)', boxShadow: 'var(--shadow)' }
const inp = { padding: '7px 9px', border: '1px solid var(--line)', borderRadius: 'var(--radius-sm)', font: 'inherit' }

export default function Abschluss() {
  const modell = ladeModell()
  const [tick, setTick] = useState(0)
  const refresh = () => setTick((t) => t + 1)
  const [sel, setSel] = useState(MONATE.filter((m) => m < AKTUELLER_MONAT).slice(-1)[0] || MONATE[0])
  const [kommentar, setKommentar] = useState('')
  const [meldung, setMeldung] = useState(null)

  const z = periode(sel)
  const s = statusInfo(z.status)

  async function tuFreigeben() {
    if (!confirm(`Periode ${sel} freigeben? Sie wird auf „Ist" gesperrt und der Verteiler ausgelöst.`)) return
    const { ereignis } = await freigeben(sel, kommentar)
    setKommentar(''); refresh()
    const n = ereignis?.ausgeloest?.length
    setMeldung(n != null
      ? `✓ Freigegeben & gesperrt. ${n > 0 ? `${n} Verteiler ausgelöst.` : 'Kein passender Verteiler aktiv.'}`
      : '✓ Freigegeben & gesperrt. (Kein Backend erreichbar — Versand-Ereignis lokal vorgemerkt.)')
  }

  return (
    <div>
      <div style={{ marginBottom: 14 }}>
        <h2 style={{ margin: '0 0 4px' }}>Abschluss &amp; Versionierung</h2>
        <div style={{ color: 'var(--muted)', fontSize: 13, maxWidth: 740 }}>
          Monatsabschlüsse revisionssicher einfrieren. Workflow <b>offen → in Abstimmung → freigegeben</b>; jede
          Freigabe erzeugt eine unveränderliche <b>Version</b> mit Datenstand-Stempel, sperrt die Periode auf
          <b> Ist</b> und löst den <b>Verteiler</b> aus (Ereignis „Monatsabschluss freigegeben").
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.2fr', gap: 16, alignItems: 'start' }} className="raster-2">
        {/* Monatsraster */}
        <div style={{ ...card, padding: 14 }}>
          <div className="mono" style={{ fontSize: 11, color: 'var(--muted)', textTransform: 'uppercase', marginBottom: 10 }}>Perioden {AKTUELLER_MONAT.slice(0, 4)}</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
            {MONATE.map((m) => {
              const zp = periode(m), si = statusInfo(zp.status), da = datenart(modell.eintraege[m])
              const ist = m === sel
              return (
                <button key={m} onClick={() => { setSel(m); setMeldung(null) }} style={{ textAlign: 'left', padding: '9px 10px', borderRadius: 'var(--radius-sm)', cursor: 'pointer',
                  border: `1px solid ${ist ? 'var(--accent)' : 'var(--line)'}`, background: ist ? 'var(--accent-soft)' : AMPEL_SOFT[si.ampel] }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontWeight: 600, fontSize: 13 }}>{m.slice(5)}/{m.slice(2, 4)}</span>
                    <span style={{ width: 9, height: 9, borderRadius: '50%', background: AMPEL_FARBE[si.ampel] }} title={si.name} />
                  </div>
                  <div style={{ fontSize: 10, color: 'var(--muted)', marginTop: 3 }}>{da?.kurz || '–'}{zp.status === 'freigegeben' ? ' 🔒' : ''}</div>
                </button>
              )
            })}
          </div>
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginTop: 12, fontSize: 11, color: 'var(--muted)' }}>
            {STATUS.map((st) => (
              <span key={st.id} style={{ display: 'inline-flex', alignItems: 'center', gap: 5 }}>
                <span style={{ width: 9, height: 9, borderRadius: '50%', background: AMPEL_FARBE[st.ampel] }} />{st.name}</span>
            ))}
          </div>
        </div>

        {/* Detail / Workflow */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div style={{ ...card, padding: 16 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 8 }}>
              <div>
                <div style={{ fontSize: 18, fontWeight: 700 }}>Periode {sel}</div>
                <div style={{ fontSize: 12, color: 'var(--muted)' }}>Aktuelle Datenart: {datenart(modell.eintraege[sel])?.name || '–'}</div>
              </div>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 7, padding: '5px 12px', borderRadius: 999, background: AMPEL_SOFT[s.ampel], border: `1px solid ${AMPEL_FARBE[s.ampel]}`, fontSize: 13, fontWeight: 600 }}>
                <span style={{ width: 9, height: 9, borderRadius: '50%', background: AMPEL_FARBE[s.ampel] }} />{s.name}</span>
            </div>
            <div style={{ fontSize: 12, color: 'var(--muted)', marginTop: 6 }}>{s.hinweis}</div>

            {z.status !== 'freigegeben' ? (
              <>
                <textarea value={kommentar} onChange={(e) => setKommentar(e.target.value)} placeholder="Kommentar (z. B. Abstimmungsstand, offene Punkte)…"
                  style={{ ...inp, width: '100%', minHeight: 56, marginTop: 12, resize: 'vertical' }} />
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 10 }}>
                  {z.status === 'offen' && (
                    <button onClick={() => { setStatus(sel, 'abstimmung'); refresh() }} style={{ ...inp, cursor: 'pointer' }}>→ In Abstimmung</button>
                  )}
                  <button onClick={() => { sichereVersion(sel, kommentar); setKommentar(''); refresh() }} style={{ ...inp, cursor: 'pointer' }}>⎙ Zwischenstand sichern</button>
                  <button onClick={tuFreigeben} style={{ ...inp, cursor: 'pointer', background: 'var(--amp-g)', color: '#fff', border: 'none', fontWeight: 600 }}>🔒 Freigeben (final)</button>
                </div>
              </>
            ) : (
              <div style={{ marginTop: 12 }}>
                <div style={{ fontSize: 12, color: 'var(--muted)' }}>Freigegeben am {new Date(z.freigabe).toLocaleString('de-DE')} — gesperrt, revisionssicher.</div>
                <button onClick={() => { if (confirm('Freigabe wirklich wiedereröffnen? (Korrekturlauf, wird protokolliert)')) { wiedereroeffnen(sel, 'Korrektur'); refresh() } }}
                  style={{ ...inp, cursor: 'pointer', marginTop: 10, color: 'var(--amp-r)', borderColor: 'var(--amp-r)' }}>↺ Wiedereröffnen (Korrektur)</button>
              </div>
            )}
            {meldung && <div style={{ marginTop: 10, padding: '8px 11px', borderRadius: 'var(--radius-sm)', background: 'var(--accent-soft)', fontSize: 13 }}>{meldung}</div>}
          </div>

          {/* Versionshistorie */}
          <div style={{ ...card, padding: 16 }}>
            <div className="mono" style={{ fontSize: 11, color: 'var(--muted)', textTransform: 'uppercase', marginBottom: 10 }}>Versionshistorie ({z.versionen.length})</div>
            {z.versionen.length === 0 && <div style={{ fontSize: 12, color: 'var(--muted)' }}>Noch keine Version gesichert.</div>}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {[...z.versionen].reverse().map((v) => (
                <div key={v.nr} style={{ padding: '9px 11px', border: '1px solid var(--line)', borderRadius: 'var(--radius-sm)', background: v.final ? 'var(--amp-g-soft)' : 'var(--bg)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8 }}>
                    <span style={{ fontWeight: 600, fontSize: 13 }}>v{v.nr}{v.final ? ' · FINAL 🔒' : ''}</span>
                    <span style={{ fontSize: 11, color: 'var(--muted)' }}>{new Date(v.zeit).toLocaleString('de-DE')} · {v.benutzer}</span>
                  </div>
                  <div className="mono" style={{ fontSize: 11, color: 'var(--muted)', marginTop: 3 }}>{v.stempel}</div>
                  {v.kommentar && <div style={{ fontSize: 12, marginTop: 4 }}>{v.kommentar}</div>}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
