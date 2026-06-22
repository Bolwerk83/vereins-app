// =========================================================================
//  ZERTIFIKAT — wird bei 100 % Lektionen UND 100 % Wissens-Checks freigeschaltet.
//  Druckbare Abschluss-Urkunde (Name aus Anmeldung, Datum). Wie im Studium. :)
// =========================================================================
import React from 'react'
import { fortschritt } from '../../core/lernpfad.js'
import { quizFortschritt } from '../../core/quiz.js'

export default function Zertifikat() {
  const fp = fortschritt()
  const qfp = quizFortschritt()
  const komplett = fp.prozent === 100 && qfp.prozent === 100
  const name = (typeof localStorage !== 'undefined' && localStorage.getItem('er_benutzer')) || 'Teilnehmer:in'
  const datum = new Date().toLocaleDateString('de-DE', { day: '2-digit', month: 'long', year: 'numeric' })

  if (!komplett) {
    const rest = (100 - Math.round((fp.prozent + qfp.prozent) / 2))
    return (
      <div style={{ background: 'var(--panel)', border: '1px dashed var(--line)', borderRadius: 'var(--radius)', padding: 16, marginTop: 16, textAlign: 'center', color: 'var(--muted)', fontSize: 13 }}>
        🎓 Zertifikat: schließe alle Lektionen ({fp.fertig}/{fp.gesamt}) und Wissens-Checks ({qfp.fertig}/{qfp.gesamt}) ab, um deine Urkunde freizuschalten. Noch ~{rest} % zu gehen.
      </div>
    )
  }

  return (
    <div style={{ marginTop: 16 }}>
      <div className="no-print" style={{ textAlign: 'right', marginBottom: 8 }}>
        <button onClick={() => window.print()} style={{ padding: '7px 13px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--line)', background: 'var(--accent)', color: '#fff', cursor: 'pointer', fontSize: 13, fontWeight: 600 }}>🖨 Drucken / PDF</button>
      </div>
      <div style={{ border: '3px double var(--accent)', borderRadius: 'var(--radius)', padding: '34px 28px', textAlign: 'center', background: 'var(--panel)' }}>
        <div style={{ fontSize: 12, letterSpacing: '.2em', textTransform: 'uppercase', color: 'var(--muted)' }}>Zertifikat</div>
        <div style={{ fontSize: 26, fontWeight: 800, margin: '10px 0 4px' }}>Controlling &amp; Kostenrechnung</div>
        <div style={{ fontSize: 13, color: 'var(--muted)' }}>Lernpfad erfolgreich abgeschlossen</div>
        <div style={{ height: 1, background: 'var(--line)', margin: '22px auto', width: 160 }} />
        <div style={{ fontSize: 13, color: 'var(--muted)' }}>verliehen an</div>
        <div style={{ fontSize: 22, fontWeight: 700, margin: '4px 0 16px' }}>{name}</div>
        <div style={{ fontSize: 13, color: 'var(--ink)', maxWidth: 460, margin: '0 auto', lineHeight: 1.6 }}>
          hat alle {fp.gesamt} Lektionen und {qfp.gesamt} Wissens-Checks bestanden und die Zusammenhänge von
          Kostenarten-, Kostenstellen- und Kostenträgerrechnung bis zum Betriebsergebnis nachgewiesen.
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginTop: 30, fontSize: 12, color: 'var(--muted)' }}>
          <div>{datum}</div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontFamily: 'cursive', fontSize: 18, color: 'var(--ink)' }}>Business Controller</div>
            <div style={{ borderTop: '1px solid var(--line)', paddingTop: 3 }}>Business Controller</div>
          </div>
        </div>
      </div>
    </div>
  )
}
