// =========================================================================
//  STARTSEITE — persönlicher Einstieg (je nach Login). Bündelt auf der
//  ersten Seite: System-/Datenstatus, Favoriten (anpinnbar), Änderungs-/
//  Audit-Log (was wurde wo gemacht, neue/entfernte/geänderte Berichte),
//  OnePager-Einstieg je Rolle und Import-/Datenstände.
// =========================================================================
import React, { useState } from 'react'
import { QUELLEN_STAND, IMPORT_JOBS, IMPORT_FEHLER, gesamtStatus } from '../../core/datenstand.js'
import { QUELLE } from '../../core/dataProvider.js'
import { ladeFavoriten, entferneFavorit, fuegeFavoritHinzu } from '../../core/favoriten.js'
import { ladeAenderungen, aenderungsStatistik, typInfo } from '../../core/aenderungslog.js'
import { AmpelPunkt } from '../../components/ui.jsx'

const card  = { background: 'var(--panel)', border: '1px solid var(--line)', borderRadius: 'var(--radius)', boxShadow: 'var(--shadow)' }
const cap   = { fontSize: 11, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '.04em', fontWeight: 700 }
const muted = { color: 'var(--muted)', fontSize: 12 }

const STATUS_FARBE = { ok: 'var(--amp-g)', warnung: 'var(--amp-a)', fehler: 'var(--amp-r)', veraltet: 'var(--amp-a)' }
const STATUS_ICON  = { ok: '✅', warnung: '⚠️', fehler: '🔴', veraltet: '🕐' }
const STATUS_TEXT  = { ok: 'Aktuell', warnung: 'Warnung', fehler: 'Fehler', veraltet: 'Veraltet' }
const AMP = { g: 'var(--amp-g)', a: 'var(--amp-a)', r: 'var(--amp-r)', n: 'var(--line)' }

function Ampel({ status }) {
  const farbe = STATUS_FARBE[status] || 'var(--muted)'
  const text  = { ok: 'Alle Importe aktuell', warnung: 'Hinweise vorhanden', fehler: 'Import-Fehler vorhanden' }[status] || status
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
      <div style={{ width: 14, height: 14, borderRadius: '50%', background: farbe, boxShadow: `0 0 8px ${farbe}` }} />
      <span style={{ fontWeight: 700, color: farbe, fontSize: 14 }}>{text}</span>
    </div>
  )
}

function StatusPill({ status }) {
  return (
    <span style={{ fontSize: 11, fontWeight: 700, padding: '2px 8px', borderRadius: 999,
      color: '#fff', background: STATUS_FARBE[status] || 'var(--muted)' }}>
      {STATUS_ICON[status]} {STATUS_TEXT[status] || status}
    </span>
  )
}

// Favoriten-Block — eingeloggt: angepinnte Berichte als Chips + Hinzufügen/Entfernen.
function Favoriten({ user, navIndex, onGeh, onLogin }) {
  const [tick, setTick] = useState(0)
  const favs = ladeFavoriten(user)
  const refresh = () => setTick((t) => t + 1)
  // Auswahlliste aller (für die Rolle sichtbaren) Berichte, alphabetisch.
  const optionen = Object.values(navIndex || {})
    .filter((e) => e.view && e.relevant !== false && !favs.includes(e.view))
    .sort((a, b) => String(a.label).localeCompare(String(b.label)))

  if (!user) {
    return (
      <div style={{ ...card, padding: '14px 18px' }}>
        <div style={{ ...cap, marginBottom: 8 }}>⭐ Favoriten</div>
        <div style={{ ...muted, marginBottom: 10 }}>
          Melde dich an, um deine wichtigsten Berichte anzupinnen — sie erscheinen dann hier und ganz oben im Menü.
        </div>
        {onLogin && (
          <button onClick={onLogin} style={{ padding: '7px 14px', border: 'none', borderRadius: 'var(--radius-sm)', background: 'var(--accent)', color: '#fff', fontWeight: 600, cursor: 'pointer', fontSize: 13 }}>
            Anmelden
          </button>
        )}
      </div>
    )
  }

  return (
    <div style={{ ...card, padding: '14px 18px' }} data-tick={tick}>
      <div style={{ ...cap, marginBottom: 10, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span>⭐ Meine Favoriten</span>
        <span style={{ textTransform: 'none', fontWeight: 400, color: 'var(--muted)' }}>{favs.length} angepinnt</span>
      </div>
      {favs.length === 0
        ? <div style={{ ...muted, marginBottom: 10 }}>Noch keine Favoriten. Unten hinzufügen oder im Menü auf ☆ tippen.</div>
        : (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 12 }}>
            {favs.map((v) => {
              const meta = navIndex?.[v] || { label: v }
              return (
                <span key={v} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '6px 6px 6px 12px', border: '1px solid var(--accent)', borderRadius: 999, background: 'var(--accent-soft)' }}>
                  <button onClick={() => onGeh?.(v)} style={{ border: 'none', background: 'none', cursor: 'pointer', color: 'var(--accent)', fontWeight: 600, fontSize: 13, padding: 0 }}>
                    {meta.icon ? `${meta.icon} ` : ''}{meta.label}
                  </button>
                  <button onClick={() => { entferneFavorit(v, user); refresh() }} aria-label="Favorit entfernen" title="Entfernen"
                    style={{ width: 20, height: 20, lineHeight: 1, border: 'none', background: 'transparent', cursor: 'pointer', color: 'var(--muted)', fontSize: 15 }}>×</button>
                </span>
              )
            })}
          </div>
        )}
      <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
        <select defaultValue="" onChange={(e) => { if (e.target.value) { fuegeFavoritHinzu(e.target.value, user); e.target.value = ''; refresh() } }}
          style={{ font: 'inherit', fontSize: 13, padding: '7px 10px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--line)', background: 'var(--panel)', color: 'var(--ink)', maxWidth: 320 }}>
          <option value="">+ Bericht zu Favoriten hinzufügen …</option>
          {optionen.map((e) => <option key={e.view} value={e.view}>{e.label}{e.pfad ? `  ·  ${e.pfad}` : ''}</option>)}
        </select>
      </div>
    </div>
  )
}

// Änderungs-/Audit-Log — neueste Ereignisse, klickbar zum jeweiligen Bericht.
function AuditLog({ onGeh }) {
  const eintraege = ladeAenderungen({ limit: 8 })
  const stat = aenderungsStatistik()
  return (
    <div style={{ ...card }}>
      <div style={{ padding: '14px 18px', borderBottom: '1px solid var(--line)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 8 }}>
        <span style={{ fontWeight: 700, fontSize: 15 }}>🔄 Was ist neu — Änderungen & Audit</span>
        <span style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <span style={{ fontSize: 11, fontWeight: 700, padding: '2px 9px', borderRadius: 999, background: 'var(--amp-g)', color: '#fff' }}>🆕 {stat.neu} neu</span>
          <span style={{ fontSize: 11, fontWeight: 700, padding: '2px 9px', borderRadius: 999, background: 'var(--amp-a)', color: '#fff' }}>✏️ {stat.geaendert} geändert</span>
          <span style={{ fontSize: 11, fontWeight: 700, padding: '2px 9px', borderRadius: 999, background: 'var(--amp-r)', color: '#fff' }}>🗑 {stat.entfernt} entfernt</span>
        </span>
      </div>
      <div>
        {eintraege.map((e, i) => {
          const ti = typInfo(e.typ)
          const klickbar = !!e.wo
          return (
            <div key={i} style={{ display: 'flex', gap: 12, alignItems: 'flex-start', padding: '11px 18px', borderTop: i > 0 ? '1px solid var(--line)' : 'none' }}>
              <span style={{ fontSize: 16, marginTop: 1 }}>{ti.icon}</span>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                  <AmpelPunkt status={ti.farbe} size={9} />
                  {klickbar
                    ? <button onClick={() => onGeh?.(e.wo)} style={{ border: 'none', background: 'none', padding: 0, cursor: 'pointer', color: 'var(--accent)', fontWeight: 700, fontSize: 13.5 }}>{e.titel}</button>
                    : <span style={{ fontWeight: 700, fontSize: 13.5 }}>{e.titel}</span>}
                </div>
                <div style={{ ...muted, marginTop: 2 }}>{e.detail}</div>
              </div>
              <div style={{ textAlign: 'right', whiteSpace: 'nowrap' }}>
                <div className="mono" style={{ fontSize: 11.5, color: 'var(--muted)' }}>{e.ts}</div>
                <div style={{ fontSize: 11, color: 'var(--muted)' }}>{ti.label} · {e.wer}</div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default function Startseite({ verbindung, onGeh, onKpi, anmeldung, rolle, navIndex, onLogin }) {
  const gesamt = gesamtStatus()
  const fehler = IMPORT_FEHLER
  const name = anmeldung?.name || null
  const rollenName = rolle?.name || 'Standard (Lesezugriff)'

  return (
    <div style={{ maxWidth: 1100, margin: '0 auto' }}>
      {/* Persönlicher Kopf — je nach Login */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', gap: 12, flexWrap: 'wrap', marginBottom: 6 }}>
        <div>
          <h2 style={{ margin: 0 }}>{name ? `Willkommen zurück, ${name}` : 'Willkommen'}</h2>
          <div style={{ ...muted, marginTop: 3 }}>
            Rolle: <b style={{ color: 'var(--ink)' }}>{rollenName}</b> · dein persönlicher Einstieg mit Status, Favoriten und Neuerungen.
          </div>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button onClick={() => onGeh?.('onepager')} style={{ padding: '8px 14px', border: '1px solid var(--accent)', borderRadius: 'var(--radius-sm)', background: 'var(--accent-soft)', color: 'var(--accent)', fontWeight: 600, cursor: 'pointer', fontSize: 13 }}>
            📄 Mein OnePager
          </button>
          {!name && onLogin && (
            <button onClick={onLogin} style={{ padding: '8px 14px', border: 'none', borderRadius: 'var(--radius-sm)', background: 'var(--accent)', color: '#fff', fontWeight: 600, cursor: 'pointer', fontSize: 13 }}>
              Anmelden
            </button>
          )}
        </div>
      </div>
      <p style={{ ...muted, marginBottom: 18, maxWidth: 720 }}>
        Übersicht aller Importe, Verbindungen und Datenstände. Nur wenn alle Quellen aktuell
        geladen sind, sind die Berichte vollständig korrekt.
      </p>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 14, marginBottom: 18 }}>
        <div style={{ ...card, padding: '16px 20px' }}>
          <div style={cap}>Gesamtstatus Importe</div>
          <div style={{ marginTop: 10 }}><Ampel status={gesamt} /></div>
          <div style={{ ...muted, marginTop: 6 }}>{IMPORT_JOBS.length} Datenquellen konfiguriert</div>
        </div>
        <div style={{ ...card, padding: '16px 20px' }}>
          <div style={cap}>Datenbankverbindung</div>
          <div style={{ marginTop: 10, display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ width: 12, height: 12, borderRadius: '50%',
              background: verbindung?.status === 'ok' ? 'var(--amp-g)' : verbindung?.status === 'fehler' ? 'var(--amp-r)' : 'var(--amp-a)',
              boxShadow: `0 0 6px ${verbindung?.status === 'ok' ? 'var(--amp-g)' : verbindung?.status === 'fehler' ? 'var(--amp-r)' : 'var(--amp-a)'}` }} />
            <span style={{ fontWeight: 600, fontSize: 14 }}>
              {verbindung?.status === 'ok' ? `Verbunden (${verbindung.server?.db || 'MSSQL'})` :
               verbindung?.status === 'fehler' ? 'Keine Verbindung' : 'Mock-Daten (Demo)'}
            </span>
          </div>
          <div style={{ ...muted, marginTop: 4 }}>Quelle: {QUELLE.toUpperCase()}</div>
        </div>
        <div style={{ ...card, padding: '16px 20px' }}>
          <div style={cap}>Ältester Datenstand</div>
          <div style={{ marginTop: 10, fontWeight: 700, fontSize: 15 }}>
            {QUELLEN_STAND.map((q) => q.stand).sort()[0]}
          </div>
          <div style={{ ...muted, marginTop: 4 }}>Berichte sind mindestens so alt</div>
        </div>
        <div style={{ ...card, padding: '16px 20px' }}>
          <div style={cap}>Offene Warnungen</div>
          <div style={{ marginTop: 10, fontWeight: 700, fontSize: 22,
            color: fehler.length ? 'var(--amp-a)' : 'var(--amp-g)' }}>
            {fehler.length}
          </div>
          <div style={{ ...muted, marginTop: 2 }}>{fehler.length ? 'Bitte prüfen' : 'Alles in Ordnung'}</div>
        </div>
      </div>

      {fehler.length > 0 && (
        <div style={{ ...card, padding: '14px 18px', marginBottom: 18, borderLeft: '4px solid var(--amp-a)' }}>
          <div style={{ ...cap, marginBottom: 8 }}>⚠ Hinweise & Warnungen</div>
          {fehler.map((f, i) => (
            <div key={i} style={{ display: 'flex', gap: 10, alignItems: 'flex-start', padding: '8px 0',
              borderTop: i > 0 ? '1px solid var(--line)' : 'none' }}>
              <span style={{ color: 'var(--amp-a)', fontSize: 16 }}>{STATUS_ICON[f.typ]}</span>
              <div>
                <span style={{ fontWeight: 600, fontSize: 13 }}>{f.job.toUpperCase()}:</span>{' '}
                <span style={{ fontSize: 13 }}>{f.meldung}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Favoriten + Audit nebeneinander (persönlicher Bereich) */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(330px, 1fr))', gap: 14, marginBottom: 18 }}>
        <Favoriten user={name} navIndex={navIndex} onGeh={onGeh} onLogin={onLogin} />
        <AuditLog onGeh={onGeh} />
      </div>

      <div style={{ ...card, marginBottom: 18 }}>
        <div style={{ padding: '14px 18px', borderBottom: '1px solid var(--line)', fontWeight: 700, fontSize: 15 }}>
          📥 Import-Jobs
        </div>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
            <thead>
              <tr style={{ background: 'var(--bg)' }}>
                {['Datenquelle', 'Status', 'Letzter Lauf', 'Dauer', 'Datensätze', 'Nächster Lauf', 'Zeitplan'].map((h) => (
                  <th key={h} style={{ textAlign: 'left', padding: '10px 14px', ...cap, fontSize: 10 }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {IMPORT_JOBS.map((j, i) => (
                <tr key={j.id} style={{ borderTop: '1px solid var(--line)', background: i % 2 ? 'var(--bg)' : undefined }}>
                  <td style={{ padding: '10px 14px', fontWeight: 600 }}>{j.quelle}</td>
                  <td style={{ padding: '10px 14px' }}><StatusPill status={j.status} /></td>
                  <td style={{ padding: '10px 14px', fontFamily: 'monospace', fontSize: 12 }}>{j.letzterLauf}</td>
                  <td style={{ padding: '10px 14px', color: 'var(--muted)' }}>{j.dauerSek}s</td>
                  <td style={{ padding: '10px 14px', color: 'var(--muted)' }}>{j.datensaetze.toLocaleString('de-DE')}</td>
                  <td style={{ padding: '10px 14px', fontFamily: 'monospace', fontSize: 12 }}>{j.naechsterLauf}</td>
                  <td style={{ padding: '10px 14px', color: 'var(--muted)' }}>{j.zeitplan}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div style={{ ...card }}>
        <div style={{ padding: '14px 18px', borderBottom: '1px solid var(--line)', fontWeight: 700, fontSize: 15 }}>
          📅 Datenstände & Frische
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 0 }}>
          {QUELLEN_STAND.map((q, i) => (
            <div key={q.quelle} style={{ padding: '14px 18px', borderLeft: i > 0 ? '1px solid var(--line)' : undefined }}>
              <div style={cap}>{q.quelle}</div>
              <div style={{ marginTop: 6, fontFamily: 'monospace', fontSize: 13 }}>{q.stand}</div>
              <div style={{ marginTop: 4 }}><StatusPill status={q.status} /></div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
