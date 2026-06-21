// =========================================================================
//  LERNPFAD — geführter Lernweg: Kapitel/Lektionen links, Inhalt rechts,
//  Fortschritt, „im Tool ausprobieren" und „verstanden". Beliebig wiederholbar.
// =========================================================================
import React, { useState } from 'react'
import { KAPITEL, LEKTIONEN, lektionenVon, istAbgeschlossen, markiere, fortschritt } from '../../core/lernpfad.js'
import { quizFortschritt, quizBestanden, hatQuiz } from '../../core/quiz.js'
import WissensCheck from './WissensCheck.jsx'
import Zertifikat from './Zertifikat.jsx'

const card = { background: 'var(--panel)', border: '1px solid var(--line)', borderRadius: 'var(--radius)', boxShadow: 'var(--shadow)' }
const cap = { fontSize: 11, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '.03em', fontWeight: 700 }

export default function Lernpfad({ onGeh }) {
  const [aktivId, setAktivId] = useState(LEKTIONEN[0].id)
  const [, setTick] = useState(0)
  const refresh = () => setTick((t) => t + 1)
  const l = LEKTIONEN.find((x) => x.id === aktivId)
  const idx = LEKTIONEN.findIndex((x) => x.id === aktivId)
  const fp = fortschritt()
  const qfp = quizFortschritt()

  function toggle(id) { markiere(id, !istAbgeschlossen(id)); refresh() }
  function weiter() { if (idx < LEKTIONEN.length - 1) setAktivId(LEKTIONEN[idx + 1].id) }
  function zurueck() { if (idx > 0) setAktivId(LEKTIONEN[idx - 1].id) }

  return (
    <div>
      <div style={{ marginBottom: 14 }}>
        <h2 style={{ margin: '0 0 4px' }}>Lernpfad — Controlling &amp; Kostenrechnung verstehen</h2>
        <div style={{ color: 'var(--muted)', fontSize: 13, maxWidth: 760 }}>
          Schritt für Schritt: Logiken, Abläufe und Zusammenhänge. Jede Lektion erklärt ein Thema, verlinkt zum
          Ausprobieren und lässt sich beliebig wiederholen.
        </div>
        <div style={{ marginTop: 10, display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ flex: 1, maxWidth: 360, height: 8, background: 'var(--bg)', borderRadius: 4, overflow: 'hidden' }}>
            <div style={{ width: `${fp.prozent}%`, height: '100%', background: 'var(--amp-g)' }} />
          </div>
          <span style={{ fontSize: 12, color: 'var(--muted)' }}>{fp.fertig} / {fp.gesamt} Lektionen ({fp.prozent} %)</span>
          <span style={{ fontSize: 12, color: 'var(--muted)', marginLeft: 6 }}>· 🧠 {qfp.fertig} / {qfp.gesamt} Wissens-Checks</span>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '290px 1fr', gap: 16, alignItems: 'start' }} className="raster-2">
        {/* Inhaltsverzeichnis */}
        <div style={{ ...card, padding: 12, position: 'sticky', top: 16 }}>
          {KAPITEL.map((k) => (
            <div key={k.id} style={{ marginBottom: 10 }}>
              <div style={{ ...cap, marginBottom: 6 }}>{k.name}</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                {lektionenVon(k.id).map((le) => {
                  const fertig = istAbgeschlossen(le.id); const aktiv = le.id === aktivId
                  return (
                    <button key={le.id} onClick={() => setAktivId(le.id)} style={{ textAlign: 'left', display: 'flex', alignItems: 'center', gap: 8, padding: '6px 9px', borderRadius: 'var(--radius-sm)', cursor: 'pointer',
                      border: `1px solid ${aktiv ? 'var(--accent)' : 'transparent'}`, background: aktiv ? 'var(--accent-soft)' : 'transparent', fontSize: 13 }}>
                      <span style={{ width: 16, color: fertig ? 'var(--amp-g)' : 'var(--line)' }}>{fertig ? '✓' : '○'}</span>
                      <span style={{ flex: 1, color: aktiv ? 'var(--accent)' : 'var(--ink)', fontWeight: aktiv ? 600 : 400 }}>{le.titel}</span>
                      {hatQuiz(le.id) && <span title="Wissens-Check" style={{ fontSize: 10, color: quizBestanden(le.id) ? 'var(--amp-g)' : 'var(--muted)' }}>🧠</span>}
                      <span style={{ fontSize: 10, color: 'var(--muted)' }}>{le.dauer}′</span>
                    </button>
                  )
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Lektion */}
        <div style={{ ...card, padding: 20 }}>
          <div className="mono" style={{ fontSize: 11, color: 'var(--muted)' }}>Lektion {idx + 1} von {LEKTIONEN.length} · {l.dauer} Min</div>
          <h3 style={{ margin: '4px 0 10px', fontSize: 20 }}>{l.titel}</h3>
          <p style={{ fontSize: 14.5, lineHeight: 1.6, color: 'var(--slate)' }}>{l.intro}</p>

          <div style={{ ...cap, margin: '14px 0 6px' }}>Kernpunkte</div>
          <ul style={{ margin: 0, paddingLeft: 20, fontSize: 14, lineHeight: 1.7 }}>
            {l.punkte.map((p) => <li key={p}>{p}</li>)}
          </ul>

          <div style={{ marginTop: 14, padding: '10px 13px', background: 'var(--accent-soft)', borderRadius: 'var(--radius-sm)', fontSize: 14 }}>
            <b>Merksatz:</b> {l.merksatz}
          </div>

          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 16, alignItems: 'center' }}>
            {l.ziel && <button onClick={() => onGeh?.(l.ziel.view)} style={{ padding: '8px 14px', border: 'none', borderRadius: 'var(--radius-sm)', background: 'var(--accent)', color: '#fff', fontWeight: 600, cursor: 'pointer' }}>▷ {l.ziel.label}</button>}
            <button onClick={() => toggle(l.id)} style={{ padding: '8px 14px', borderRadius: 'var(--radius-sm)', cursor: 'pointer', fontWeight: 600,
              border: `1px solid ${istAbgeschlossen(l.id) ? 'var(--amp-g)' : 'var(--line)'}`, background: istAbgeschlossen(l.id) ? 'var(--amp-g-soft)' : 'var(--panel)', color: istAbgeschlossen(l.id) ? 'var(--amp-g)' : 'var(--ink)' }}>
              {istAbgeschlossen(l.id) ? '✓ verstanden' : 'Als verstanden markieren'}
            </button>
            <div style={{ marginLeft: 'auto', display: 'flex', gap: 8 }}>
              <button onClick={zurueck} disabled={idx === 0} style={{ padding: '8px 12px', border: '1px solid var(--line)', borderRadius: 'var(--radius-sm)', background: 'var(--panel)', cursor: idx === 0 ? 'default' : 'pointer', opacity: idx === 0 ? .5 : 1 }}>← Zurück</button>
              <button onClick={weiter} disabled={idx === LEKTIONEN.length - 1} style={{ padding: '8px 12px', border: '1px solid var(--line)', borderRadius: 'var(--radius-sm)', background: 'var(--panel)', cursor: idx === LEKTIONEN.length - 1 ? 'default' : 'pointer', opacity: idx === LEKTIONEN.length - 1 ? .5 : 1 }}>Weiter →</button>
            </div>
          </div>

          <WissensCheck lektionId={l.id} onChange={refresh} />
        </div>
      </div>

      <Zertifikat />
    </div>
  )
}
