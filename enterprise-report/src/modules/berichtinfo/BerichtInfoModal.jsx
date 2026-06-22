// =========================================================================
//  BERICHT-INFO-PANEL — Schaufenster für einen Bericht: Zweck, Zielgruppe,
//  Mehrwert, Pfad im Menü und Berechtigungsstatus. Berechtigte können öffnen,
//  Nicht-Berechtigte sehen nur die Info (Bericht bleibt gesperrt).
// =========================================================================
import React, { useState } from 'react'
import { infoVon } from '../../core/berichtInfo.js'
import { alleBereiche } from '../../core/gruppen.js'
import { anfrageStellen, anfrageOffen } from '../../core/zugriff.js'

let BEREICH_NAME = null
function bereichName(code) {
  if (!code) return null
  if (!BEREICH_NAME) { BEREICH_NAME = {}; try { for (const b of alleBereiche()) BEREICH_NAME[b.code] = b.name } catch {} }
  return BEREICH_NAME[code] || code
}

export default function BerichtInfoModal({ view, label, icon, pfad, bereich, darf, uid, name, onClose, onOpen }) {
  const [angefragt, setAngefragt] = useState(() => (view ? anfrageOffen(view, uid) : false))
  if (!view) return null
  const info = infoVon(view) || { zweck: '—', zielgruppe: '—', mehrwert: '—' }
  const bName = bereichName(bereich)
  const anfordern = () => { anfrageStellen({ view, bereich, uid, name }); setAngefragt(true) }

  const Feld = ({ titel, text }) => (
    <div style={{ marginBottom: 12 }}>
      <div style={{ fontSize: 11, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '.03em', fontWeight: 700, marginBottom: 3 }}>{titel}</div>
      <div style={{ fontSize: 14, lineHeight: 1.5 }}>{text}</div>
    </div>
  )

  return (
    <div onClick={onClose} className="no-print"
      style={{ position: 'fixed', inset: 0, zIndex: 90, background: 'rgba(15,23,42,.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
      <div onClick={(e) => e.stopPropagation()}
        style={{ width: 520, maxWidth: '94vw', maxHeight: '88vh', overflowY: 'auto', background: 'var(--panel)', borderRadius: 'var(--radius)', boxShadow: '0 20px 60px rgba(0,0,0,.3)', border: '1px solid var(--line)' }}>
        {/* Kopf */}
        <div style={{ padding: '16px 18px', borderBottom: '1px solid var(--line)', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12 }}>
          <div>
            <div style={{ fontSize: 11, color: 'var(--muted)' }}>📍 {pfad || 'Bericht'}</div>
            <h3 style={{ margin: '4px 0 0', fontSize: 19 }}>{icon ? `${icon} ` : ''}{label}</h3>
            <div style={{ marginTop: 6, display: 'flex', gap: 6, flexWrap: 'wrap' }}>
              {bName && <span style={{ fontSize: 11, padding: '2px 9px', borderRadius: 999, background: 'var(--bg)', border: '1px solid var(--line)', color: 'var(--muted)' }}>Bereich: {bName}</span>}
              <span style={{ fontSize: 11, padding: '2px 9px', borderRadius: 999, fontWeight: 700,
                background: darf ? 'var(--amp-g-soft)' : 'var(--amp-a-soft)', color: darf ? 'var(--amp-g)' : 'var(--amp-a)' }}>
                {darf ? '✓ Zugriff' : '🔒 Keine Berechtigung'}
              </span>
            </div>
          </div>
          <button onClick={onClose} title="Schließen" style={{ border: 'none', background: 'none', fontSize: 22, cursor: 'pointer', color: 'var(--muted)', lineHeight: 1 }}>×</button>
        </div>

        {/* Inhalt */}
        <div style={{ padding: 18 }}>
          <Feld titel="Was sagt mir der Bericht?" text={info.zweck} />
          <Feld titel="Für wen ist er gedacht?" text={info.zielgruppe} />
          <Feld titel="Welchen Mehrwert bringt er?" text={info.mehrwert} />

          {!darf && (
            <div style={{ marginTop: 6, padding: '10px 12px', borderRadius: 'var(--radius-sm)', background: 'var(--amp-a-soft)', color: 'var(--amp-a)', fontSize: 13 }}>
              Dir fehlt die Berechtigung für den Bereich <b>{bName || bereich}</b>. Der Bericht ist hier nur als Vorschau sichtbar –
              für den Zugriff wende dich an deinen Administrator (Rollen &amp; Rechte).
            </div>
          )}
        </div>

        {/* Aktionen */}
        <div style={{ padding: '12px 18px', borderTop: '1px solid var(--line)', display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
          <button onClick={onClose} style={{ padding: '8px 14px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--line)', background: 'var(--panel)', cursor: 'pointer', fontSize: 13 }}>Schließen</button>
          {darf
            ? <button onClick={() => { onOpen?.(view); onClose() }} style={{ padding: '8px 16px', borderRadius: 'var(--radius-sm)', border: 'none', background: 'var(--accent)', color: '#fff', cursor: 'pointer', fontSize: 13, fontWeight: 600 }}>Bericht öffnen →</button>
            : angefragt
              ? <button disabled style={{ padding: '8px 16px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--amp-g)', background: 'var(--amp-g-soft)', color: 'var(--amp-g)', fontSize: 13, fontWeight: 600 }}>✓ Zugriff angefragt</button>
              : <button onClick={anfordern} style={{ padding: '8px 16px', borderRadius: 'var(--radius-sm)', border: 'none', background: 'var(--accent)', color: '#fff', cursor: 'pointer', fontSize: 13, fontWeight: 600 }}>Zugriff anfordern</button>}
        </div>
      </div>
    </div>
  )
}
