// =========================================================================
//  EXEC-KOPF (gemeinsam) — einheitlicher Management-Kopf für jeden Bericht.
//  Zeigt auf einen Blick: optionale Kernzahl, Ampel (Auf Kurs/Beobachten/
//  Handeln), eine Kernaussage und eine optionale Empfehlung. Jeder Bericht
//  leitet status/kernaussage/empfehlung aus SEINEN echten Zahlen ab und
//  reicht sie als Props herein — so wird jeder Bericht präsentationsreif.
//  Bewusst druckbar (Teil des PDF), daher KEIN no-print.
//
//  ampelVon(): kleiner Helfer, der aus einer Kennzahl + Schwellen eine
//  Ampel ('g'|'a'|'r') ableitet — spart Wiederholung in den Berichten.
// =========================================================================
import React from 'react'
import Kommentar from './Kommentar.jsx'
import { useNav } from './NavContext.jsx'

const AMP = {
  g: { f: 'var(--amp-g)', label: 'Auf Kurs' },
  a: { f: 'var(--amp-a)', label: 'Beobachten' },
  r: { f: 'var(--amp-r)', label: 'Handeln' },
}

// Wert >= gut -> grün; Wert <= schlecht -> rot; dazwischen -> gelb.
// Bei invert=true dreht sich die Logik (kleiner ist besser, z. B. Kosten).
export function ampelVon(wert, { gut, schlecht, invert = false } = {}) {
  if (wert == null || Number.isNaN(wert)) return 'a'
  if (invert) return wert <= gut ? 'g' : wert >= schlecht ? 'r' : 'a'
  return wert >= gut ? 'g' : wert <= schlecht ? 'r' : 'a'
}

export default function ExecKopf({ status = 'a', kernaussage, kennzahl, kennzahlLabel, empfehlung, statusLabel, kommentar }) {
  const amp = AMP[status] || AMP.a
  const nav = useNav()
  const komId = kommentar || nav?.ansicht || null
  return (
    <div style={{ marginBottom: 14, background: 'var(--panel)', border: '1px solid var(--line)', borderLeft: `5px solid ${amp.f}`,
      borderRadius: 'var(--radius)', boxShadow: 'var(--shadow)', padding: '13px 16px' }}>
    <div style={{ display: 'flex', alignItems: 'stretch', gap: 14, flexWrap: 'wrap' }}>
      {kennzahl != null && (
        <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', paddingRight: 14,
          borderRight: '1px solid var(--line)', minWidth: 120 }}>
          <div style={{ fontSize: 10.5, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '.04em', fontWeight: 700 }}>{kennzahlLabel || 'Kernzahl'}</div>
          <div className="mono" style={{ fontSize: 22, fontWeight: 800, color: 'var(--ink)', lineHeight: 1.1 }}>{kennzahl}</div>
        </div>
      )}
      <div style={{ flex: 1, minWidth: 240, display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 5 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '2px 9px', borderRadius: 999,
            background: amp.f, color: '#fff', fontSize: 11, fontWeight: 700, letterSpacing: '.02em' }}>● {statusLabel || amp.label}</span>
          <span style={{ fontSize: 10.5, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '.05em', fontWeight: 700 }}>Kernaussage</span>
          <span title="Diese Aussage entsteht regelbasiert aus den echten Zahlen — ohne KI, ohne Datenweitergabe." style={{ fontSize: 10, color: '#166534', fontWeight: 700, background: '#dcfce7', border: '1px solid #86efac', borderRadius: 999, padding: '1px 7px' }}>🔒 ohne KI</span>
        </div>
        <div style={{ fontSize: 15, fontWeight: 600, lineHeight: 1.4, color: 'var(--ink)' }}>{kernaussage}</div>
        {empfehlung && (
          <div style={{ fontSize: 12.5, color: 'var(--slate)', lineHeight: 1.45 }}><b style={{ color: 'var(--ink)' }}>✓ Empfehlung:</b> {empfehlung}</div>
        )}
      </div>
    </div>
    {komId && <Kommentar typ="bericht" id={komId} />}
    </div>
  )
}
