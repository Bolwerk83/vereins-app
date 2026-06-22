// =========================================================================
//  WISSENS-CHECK — kleine Quizfragen zur aktuellen Lektion. Auswahl, sofortiges
//  Feedback mit Erklärung; alles richtig → Check bestanden (gespeichert).
// =========================================================================
import React, { useState, useEffect } from 'react'
import { quizVon, quizErgebnis, markiereQuiz, quizBestanden } from '../../core/quiz.js'

const cap = { fontSize: 11, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '.03em', fontWeight: 700 }

export default function WissensCheck({ lektionId, onChange }) {
  const fragen = quizVon(lektionId)
  const [antworten, setAntworten] = useState({})

  // Bei Lektionswechsel zurücksetzen.
  useEffect(() => { setAntworten({}) }, [lektionId])

  if (!fragen.length) return null

  const erg = quizErgebnis(lektionId, fragen.map((_, i) => antworten[i]))
  const alleBeantwortet = fragen.every((_, i) => antworten[i] != null)

  function waehle(qi, oi) {
    if (antworten[qi] != null) return // schon beantwortet
    const next = { ...antworten, [qi]: oi }
    setAntworten(next)
    const fertig = fragen.every((_, i) => next[i] != null)
    if (fertig) {
      const bestanden = fragen.every((f, i) => next[i] === f.richtig)
      if (bestanden && !quizBestanden(lektionId)) { markiereQuiz(lektionId); onChange?.() }
    }
  }

  return (
    <div style={{ marginTop: 18, paddingTop: 16, borderTop: '1px dashed var(--line)' }}>
      <div style={{ ...cap, marginBottom: 10, display: 'flex', alignItems: 'center', gap: 8 }}>
        Wissens-Check
        {quizBestanden(lektionId) && <span style={{ color: 'var(--amp-g)', fontWeight: 700 }}>✓ bestanden</span>}
      </div>

      {fragen.map((f, qi) => {
        const gewaehlt = antworten[qi]
        const beantwortet = gewaehlt != null
        return (
          <div key={qi} style={{ marginBottom: 14 }}>
            <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 8 }}>{f.frage}</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {f.optionen.map((opt, oi) => {
                const richtig = oi === f.richtig
                const dieseGewaehlt = gewaehlt === oi
                let bg = 'var(--panel)', bc = 'var(--line)', col = 'var(--ink)'
                if (beantwortet && richtig) { bg = 'var(--amp-g-soft)'; bc = 'var(--amp-g)'; col = 'var(--amp-g)' }
                else if (beantwortet && dieseGewaehlt && !richtig) { bg = 'var(--amp-r-soft)'; bc = 'var(--amp-r)'; col = 'var(--amp-r)' }
                return (
                  <button key={oi} onClick={() => waehle(qi, oi)} disabled={beantwortet}
                    style={{ textAlign: 'left', padding: '9px 12px', borderRadius: 'var(--radius-sm)', border: `1px solid ${bc}`,
                      background: bg, color: col, cursor: beantwortet ? 'default' : 'pointer', fontSize: 13.5, fontWeight: dieseGewaehlt ? 600 : 400 }}>
                    {beantwortet && richtig ? '✓ ' : beantwortet && dieseGewaehlt ? '✗ ' : ''}{opt}
                  </button>
                )
              })}
            </div>
            {beantwortet && (
              <div style={{ marginTop: 8, fontSize: 13, color: 'var(--muted)' }}>
                {gewaehlt === f.richtig ? 'Richtig! ' : 'Nicht ganz. '}{f.erklaerung}
              </div>
            )}
          </div>
        )
      })}

      {alleBeantwortet && (
        <div style={{ marginTop: 6, padding: '9px 12px', borderRadius: 'var(--radius-sm)', fontSize: 13.5, fontWeight: 600,
          background: erg.bestanden ? 'var(--amp-g-soft)' : 'var(--bg)', color: erg.bestanden ? 'var(--amp-g)' : 'var(--ink)' }}>
          {erg.bestanden ? '🎉 Wissens-Check bestanden!' : `${erg.richtig} von ${erg.gesamt} richtig — schau dir die Erklärung an und wiederhole die Lektion.`}
          {!erg.bestanden && <button onClick={() => setAntworten({})} style={{ marginLeft: 10, padding: '4px 10px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--line)', background: 'var(--panel)', cursor: 'pointer', fontSize: 12 }}>Nochmal</button>}
        </div>
      )}
    </div>
  )
}
