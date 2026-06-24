// =========================================================================
//  KENNZAHLEN-DEFINITION (Steckbrief) — Modal.
//  Zeigt Bedeutung, Formel/Abhängigkeiten, Ziel-/Ampel-Logik, Datenquelle
//  und "wo ist die Kennzahl eingebaut" (mit Sprunglink dorthin).
//  Transparenz für alle: die DEFINITION (Bedeutung, Formel, Quelle, Ziel) ist
//  immer einsehbar; nur der aktuelle WERT ist bei vertraulichen Kennzahlen
//  rollenabhängig (Governance: Definitionen öffentlich, Werte zugriffsgeschützt).
// =========================================================================
import React from 'react'
import { KPI } from '../../core/kpiRegistry.js'
import { darfKpi, darfBereich } from '../../core/rbac.js'
import { kpiVerwendung } from '../../core/reportTree.js'
import { ampelStatus } from '../../core/ampel.js'
import { formatWert, AMPEL_FARBE, AMPEL_LABEL } from '../../design/theme.js'
import { horizontInfo, artInfo } from '../../core/klassifikation.js'
import { AmpelPunkt } from '../../components/ui.jsx'

const RICHTUNG = { hoch_gut: 'höher ist besser', tief_gut: 'niedriger ist besser' }
const klassTag = (farbe) => ({ fontSize: 11, fontWeight: 700, color: farbe || 'var(--muted)', border: `1px solid ${farbe || 'var(--line)'}`, padding: '1px 8px', borderRadius: 999 })

function Zeile({ label, children }) {
  return (
    <div style={{ display: 'flex', gap: 12, padding: '9px 0', borderBottom: '1px solid var(--line)' }}>
      <div style={{ width: 150, flexShrink: 0, fontSize: 12, color: 'var(--muted)' }}>{label}</div>
      <div style={{ fontSize: 13 }}>{children}</div>
    </div>
  )
}

export default function KpiDefinitionPanel({ kpiId, rolle, werte = {}, onClose, onSpringe, onOeffneKpi }) {
  if (!kpiId) return null
  const k = KPI[kpiId]
  if (!k) return null
  const darf = darfKpi(rolle, k)

  const wert = werte[kpiId]
  const status = darf ? ampelStatus({ wert, ziel: k.ziel, richtung: k.richtung, warn: k.warn }) : 'n'
  const abgeleitet = !k.sqlRef && (k.abhaengig || []).length > 0
  const verwendung = (kpiVerwendung(kpiId) || []).filter((v) => darfBereich(rolle, v.bereich))

  return (
    <div onClick={onClose} style={{ position: 'fixed', inset: 0, zIndex: 60, background: 'rgba(15,23,42,.45)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
      <div onClick={(e) => e.stopPropagation()} style={{ background: 'var(--panel)', borderRadius: 'var(--radius)',
        boxShadow: '0 20px 60px rgba(0,0,0,.3)', maxWidth: 600, width: '100%', maxHeight: '85vh', overflow: 'auto' }}>
        {/* Kopf */}
        <div style={{ padding: '18px 22px', borderBottom: '1px solid var(--line)', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12 }}>
          <div>
            <div className="mono" style={{ fontSize: 11, color: 'var(--muted)', textTransform: 'uppercase' }}>Kennzahlen-Definition · {k.bereich}</div>
            <div style={{ fontSize: 20, fontWeight: 700, marginTop: 2 }}>{k.name}</div>
          </div>
          <button onClick={onClose} title="Schließen" style={{ border: 'none', background: 'none', fontSize: 22, lineHeight: 1, cursor: 'pointer', color: 'var(--muted)' }}>×</button>
        </div>

        {(
          <div style={{ padding: '6px 22px 18px' }}>
            {/* Transparenz-Hinweis: Definition für alle, Wert ggf. rollenabhängig */}
            <div style={{ margin: '10px 0 4px', fontSize: 12, color: 'var(--slate)', background: 'var(--bg)', border: '1px solid var(--line)', borderRadius: 'var(--radius-sm)', padding: '8px 11px' }}>
              🔎 <b>Transparenz:</b> Bedeutung, Formel und Datenquelle sind für <b>alle</b> einsehbar.
              {k.security ? <> Der aktuelle <b>Wert</b> ist vertraulich (nur <b>{k.security.join(' / ')}</b>).</> : <> Der aktuelle Wert ist für deine Rolle sichtbar.</>}
            </div>
            <Zeile label="Aktueller Wert">
              {darf ? (
                <>
                  <span className="mono" style={{ fontSize: 18, fontWeight: 600 }}>{formatWert(wert, k.einheit)}</span>
                  {k.ziel != null && <span style={{ marginLeft: 10, display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 12, color: 'var(--muted)' }}>
                    <AmpelPunkt status={status} /> {AMPEL_LABEL?.[status] || ''}</span>}
                </>
              ) : (
                <span style={{ color: 'var(--muted)' }}>🔒 vertraulich — Wert nur für <b>{k.security?.join(' / ') || '—'}</b> sichtbar</span>
              )}
            </Zeile>
            <Zeile label="Bedeutung">{k.beschreibung}</Zeile>
            <Zeile label="Ermittlung">
              {abgeleitet ? (
                <span>Abgeleitet (berechnet) aus:{' '}
                  {k.abhaengig.map((d, i) => (
                    <React.Fragment key={d}>
                      {i > 0 && ', '}
                      <a onClick={() => onOeffneKpi && onOeffneKpi(d)} style={{ color: 'var(--accent)', cursor: 'pointer', textDecoration: 'underline' }}>{KPI[d]?.name || d}</a>
                    </React.Fragment>
                  ))}
                </span>
              ) : (
                <span>Direkt gemessen · Datenquelle: <span className="mono">sql/{k.sqlRef}.kpi.sql</span></span>
              )}
            </Zeile>
            <Zeile label="Zielwert">{k.ziel != null ? formatWert(k.ziel, k.einheit) : '— (kein fixes Ziel)'}</Zeile>
            <Zeile label="Bewertung">
              {RICHTUNG[k.richtung] || k.richtung}
              {k.ziel != null && <span style={{ color: 'var(--muted)' }}> · Ampel: ab Ziel grün, ab {Math.round((k.warn ?? 0.95) * 100)} % Zielerreichung gelb, darunter rot</span>}
            </Zeile>
            <Zeile label="Einheit">{k.einheit}</Zeile>
            <Zeile label="Klassifikation">
              <span style={klassTag(horizontInfo(k)?.farbe)}>{horizontInfo(k)?.name}</span>
              <span style={{ ...klassTag(artInfo(k)?.farbe), marginLeft: 6 }}>{artInfo(k)?.name}</span>
            </Zeile>
            {k.security && <Zeile label="Vertraulichkeit">🔒 nur {k.security.join(' / ')}</Zeile>}

            {/* Verwendet in — Sprung dorthin, wo die Kennzahl eingebaut ist */}
            <div style={{ paddingTop: 14 }}>
              <div style={{ fontSize: 12, color: 'var(--muted)', marginBottom: 6 }}>Eingebaut in {verwendung.length} Bericht(en) — direkt aufrufen:</div>
              {verwendung.length === 0 && <div style={{ fontSize: 13, color: 'var(--muted)' }}>In deinen sichtbaren Berichten nicht direkt eingebaut.</div>}
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                {verwendung.map((v) => (
                  <button key={v.id} onClick={() => onSpringe && onSpringe(v.id)}
                    style={{ display: 'inline-flex', alignItems: 'center', gap: 7, padding: '6px 11px', borderRadius: 999, cursor: 'pointer',
                      border: '1px solid var(--accent)', background: 'var(--accent-soft)', color: 'var(--accent)', fontSize: 13, fontWeight: 500 }}>
                    <span className="mono" style={{ fontSize: 11 }}>{v.nummer}</span> {v.titel} ↗
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
