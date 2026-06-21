// =========================================================================
//  DATENART-BADGE — verankert die Datenherkunft sichtbar im Reporting.
//  Zeigt für den laufenden Monat die Datenart (Ist/Tagesreporting/Plan/FC)
//  und den Year-to-date-Mix. Klick öffnet die Steuerung „Zeit & Datenart".
// =========================================================================
import React from 'react'
import { ladeModell, datenart, AKTUELLER_MONAT, mixBeschreibung } from '../../core/periodenmodell.js'
import { AMPEL_FARBE, AMPEL_SOFT } from '../../design/theme.js'

export default function DatenartBadge({ modell, onClick }) {
  const m = modell || ladeModell()
  const art = datenart(m.eintraege[AKTUELLER_MONAT]) || datenart('tagesreporting')
  const farbe = AMPEL_FARBE[art.status]
  return (
    <button onClick={onClick} title={`Datenherkunft je Periode steuern · Mix: ${mixBeschreibung(m)}`}
      style={{ display: 'inline-flex', alignItems: 'center', gap: 7, padding: '5px 10px', borderRadius: 999, cursor: 'pointer',
        border: `1px solid ${farbe}`, background: AMPEL_SOFT[art.status] || 'var(--panel)' }}>
      <span style={{ width: 8, height: 8, borderRadius: '50%', background: farbe }} />
      <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--ink)' }}>🗓 {AKTUELLER_MONAT}</span>
      <span className="mono" style={{ fontSize: 11, color: farbe, fontWeight: 700 }}>{art.kurz}</span>
    </button>
  )
}
