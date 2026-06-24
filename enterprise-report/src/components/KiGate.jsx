// =========================================================================
//  KI-GATE (gemeinsam) — macht die KI-Nutzung SICHTBAR und KONTROLLIERBAR.
//
//   • KI_AKTIV        : true nur wenn die Engine bewusst auf 'claude' steht.
//   • KiLogo          : kleines SVG-„Funken"-Logo, kennzeichnet KI-Stellen.
//   • KiStatusBadge   : sichtbares Abzeichen — grün „Ohne KI · Daten bleiben
//                       lokal" (Standard) bzw. gelb „KI aktiv".
//   • useKiGate()     : Hook mit fordere(anforderung) -> Promise<boolean>.
//                       Offline: sofort true. Bei aktiver KI: blendet einen
//                       Bestätigungs-Dialog ein; erst nach „An KI senden"
//                       wird true aufgelöst — sonst false (Abbruch).
//
//  So geht ohne ausdrückliche Bestätigung NIE etwas an eine externe KI.
// =========================================================================
import React, { useCallback, useState } from 'react'
import { BI_QUELLE } from '../core/biProvider.js'

export const KI_AKTIV = BI_QUELLE === 'claude'

// Kleines „KI-Funken"-Logo (Sparkle) — universell als KI-Symbol lesbar.
export function KiLogo({ size = 16 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true" style={{ flex: 'none' }}>
      <rect x="2" y="2" width="20" height="20" rx="5" fill="currentColor" opacity=".15" />
      <path d="M12 5.2l1.7 3.9 3.9 1.7-3.9 1.7L12 16.4l-1.7-3.9L6.4 10.8l3.9-1.7L12 5.2z" fill="currentColor" />
      <circle cx="17.6" cy="6.4" r="1.5" fill="currentColor" />
    </svg>
  )
}

// Sichtbares Statusabzeichen — sagt jedem Anwender/Prüfer sofort, ob eine
// externe KI im Spiel ist. Standard ist die grüne „Ohne KI"-Plakette.
export function KiStatusBadge({ kompakt = false }) {
  if (KI_AKTIV) {
    return (
      <span title="Externe KI ist aktiviert. Vor JEDEM Aufruf wird um Bestätigung gebeten; dabei werden Kennzahlenwerte an die KI gesendet."
        style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '3px 9px', borderRadius: 999,
          background: '#fef3c7', color: '#92400e', border: '1px solid #fbbf24', fontSize: 11.5, fontWeight: 700 }}>
        <KiLogo size={14} /> KI aktiv{kompakt ? '' : ' · Bestätigung nötig'}
      </span>
    )
  }
  return (
    <span title="Alle Auswertungen entstehen regelbasiert im Haus. Keine KI, keine Kosten, keine Datenweitergabe."
      style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '3px 9px', borderRadius: 999,
        background: '#dcfce7', color: '#166534', border: '1px solid #86efac', fontSize: 11.5, fontWeight: 700 }}>
      🔒 Ohne KI{kompakt ? '' : ' · Daten bleiben lokal'}
    </span>
  )
}

// Bestätigungs-Dialog vor jedem KI-Aufruf.
export function KiBestaetigung({ offen, anforderung, onBestaetigen, onAbbrechen }) {
  if (!offen) return null
  const btn = { padding: '9px 16px', borderRadius: 'var(--radius-sm)', fontWeight: 600, fontSize: 13, cursor: 'pointer' }
  return (
    <div onClick={onAbbrechen} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.45)', zIndex: 300, display: 'grid', placeItems: 'center', padding: 16 }}>
      <div onClick={(e) => e.stopPropagation()} role="dialog" aria-modal="true"
        style={{ background: 'var(--panel)', border: '1px solid var(--line)', borderRadius: 'var(--radius)', boxShadow: 'var(--shadow)', maxWidth: 460, width: '100%', padding: 22 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 11, marginBottom: 12 }}>
          <span style={{ color: '#b45309' }}><KiLogo size={28} /></span>
          <h3 style={{ margin: 0, fontSize: 16.5 }}>Externe KI aufrufen?</h3>
        </div>
        <p style={{ fontSize: 13.5, lineHeight: 1.55, color: 'var(--slate)', margin: '0 0 10px' }}>
          Für diese Auswertung werden die <b>für deine Rolle sichtbaren Kennzahlenwerte</b> an die externe KI übermittelt.
          Damit <b>verlassen sie das Haus</b> und es können <b>Kosten</b> entstehen.
        </p>
        {anforderung && (
          <div style={{ fontSize: 12.5, background: 'var(--bg)', border: '1px dashed var(--line)', borderRadius: 'var(--radius-sm)', padding: '8px 10px', marginBottom: 12 }}>
            <b>Anfrage:</b> {anforderung}
          </div>
        )}
        <p style={{ fontSize: 12, color: 'var(--muted)', margin: '0 0 16px' }}>
          🔒 Alternativ liefert die <b>regelbasierte Auswertung</b> dasselbe Ergebnis lokal — ohne Datenweitergabe und ohne Kosten.
        </p>
        <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
          <button onClick={onAbbrechen} style={{ ...btn, border: '1px solid var(--line)', background: 'var(--panel)', color: 'var(--ink)' }}>Abbrechen (lokal bleiben)</button>
          <button onClick={onBestaetigen} style={{ ...btn, border: 'none', background: '#b45309', color: '#fff', display: 'inline-flex', alignItems: 'center', gap: 7 }}><KiLogo size={15} /> An KI senden</button>
        </div>
      </div>
    </div>
  )
}

// Hook: gate vor jeden KI-Aufruf hängen. fordere() liefert ein Promise,
// das true (fortfahren) oder false (abgebrochen) auflöst. Offline -> true.
export function useKiGate() {
  const [pending, setPending] = useState(null) // { anforderung, resolve } | null
  const fordere = useCallback((anforderung) => {
    if (!KI_AKTIV) return Promise.resolve(true)
    return new Promise((resolve) => setPending({ anforderung, resolve }))
  }, [])
  const schliesse = (ergebnis) => { pending?.resolve(ergebnis); setPending(null) }
  const modal = (
    <KiBestaetigung offen={!!pending} anforderung={pending?.anforderung}
      onBestaetigen={() => schliesse(true)} onAbbrechen={() => schliesse(false)} />
  )
  return { fordere, modal }
}
