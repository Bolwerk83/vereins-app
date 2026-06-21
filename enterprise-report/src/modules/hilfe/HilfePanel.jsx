// =========================================================================
//  HILFE / „So funktioniert's"  — freundliche Ersthilfe.
//  Erscheint beim ersten Öffnen automatisch und ist jederzeit über das
//  „?"-Symbol oben rechts wieder aufrufbar. Erklärt in einfacher Sprache,
//  was man wo tut. Bewusst kurz gehalten.
// =========================================================================
import React from 'react'

const PUNKTE = [
  { icon: '🌳', titel: 'Berichtsbaum', text: 'Dein Startpunkt. Links durch die Bereiche klicken, rechts erscheinen Kennzahlen mit Ampeln, Trend und einer kurzen Lagebewertung.' },
  { icon: '🔎', titel: 'Details ansehen', text: 'In einem Bericht eine Sicht wählen (z. B. „nach Kunde"), Filter setzen, „Anzeigen". Auf eine Zeile klicken springt zum passenden Beleg.' },
  { icon: '💬', titel: 'Self-Service BI', text: 'Einfach in Worten beschreiben, was du wissen willst — das Tool baut daraus einen Bericht samt Maßnahmen, aus Controller-Sicht.' },
  { icon: '✅', titel: 'Maßnahmen & Empfehlungen', text: 'Per Knopf wertet das Tool wie ein Controller aus und schlägt konkrete Maßnahmen nach SMART vor. Du verwaltest sie an einem Ort.' },
  { icon: '👥', titel: 'Rollen & Rechte', text: 'Oben rechts legst du fest, wer welche Bereiche sieht, und trägst Namen ein. Jede Person meldet sich dann mit ihrem Namen an.' }
]

export default function HilfePanel({ offen, onSchliessen, erstmalig }) {
  if (!offen) return null
  return (
    <div onClick={onSchliessen}
      style={{ position: 'fixed', inset: 0, zIndex: 50, background: 'rgba(15,23,42,.45)',
        display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
      <div onClick={(e) => e.stopPropagation()}
        style={{ background: 'var(--panel)', borderRadius: 'var(--radius)', boxShadow: '0 20px 60px rgba(0,0,0,.3)',
          maxWidth: 620, width: '100%', maxHeight: '85vh', overflow: 'auto' }}>
        {/* Kopf */}
        <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--line)' }}>
          <div style={{ fontSize: 22, fontWeight: 700 }}>{erstmalig ? 'Willkommen 👋' : 'So funktioniert’s'}</div>
          <div style={{ color: 'var(--muted)', fontSize: 14, marginTop: 4 }}>
            Dein digitales Controlling in einem Werkzeug. Hier eine kurze Orientierung — in einer Minute weißt du, wo was ist.
          </div>
        </div>

        {/* Punkte */}
        <div style={{ padding: '8px 24px' }}>
          {PUNKTE.map((p) => (
            <div key={p.titel} style={{ display: 'flex', gap: 14, padding: '14px 0', borderBottom: '1px solid var(--line)' }}>
              <div style={{ fontSize: 24, lineHeight: 1, width: 30, textAlign: 'center' }}>{p.icon}</div>
              <div>
                <div style={{ fontWeight: 600, fontSize: 15 }}>{p.titel}</div>
                <div style={{ color: 'var(--slate, var(--muted))', fontSize: 13, marginTop: 2 }}>{p.text}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Hinweis + Aktion */}
        <div style={{ padding: '16px 24px 22px' }}>
          <div style={{ background: 'var(--accent-soft)', border: '1px solid var(--accent)', borderRadius: 'var(--radius-sm)',
            padding: '10px 14px', fontSize: 13, color: 'var(--accent)' }}>
            💡 Tipp: Du bist gerade im <b>Demo-Modus</b> mit Beispielzahlen — du kannst alles gefahrlos ausprobieren.
            Diese Hilfe erreichst du jederzeit oben rechts über das <b>?</b>.
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 16 }}>
            <button onClick={onSchliessen}
              style={{ padding: '10px 20px', border: 'none', borderRadius: 'var(--radius-sm)', background: 'var(--accent)', color: '#fff', fontWeight: 600, fontSize: 14, cursor: 'pointer' }}>
              {erstmalig ? 'Los geht’s' : 'Verstanden'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
