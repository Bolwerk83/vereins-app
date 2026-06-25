// =========================================================================
//  STARTSEITE — Import-/Ladestatus, Verbindung, Datenstände (Backlog #15).
// =========================================================================
import React from 'react'
import { QUELLEN_STAND, IMPORT_JOBS, IMPORT_FEHLER, gesamtStatus, alleAktuell } from '../../core/datenstand.js'
import { QUELLE } from '../../core/dataProvider.js'

const card  = { background: 'var(--panel)', border: '1px solid var(--line)', borderRadius: 'var(--radius)', boxShadow: 'var(--shadow)' }
const cap   = { fontSize: 11, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '.04em', fontWeight: 700 }
const muted = { color: 'var(--muted)', fontSize: 12 }

const STATUS_FARBE = { ok: 'var(--amp-g)', warnung: 'var(--amp-a)', fehler: 'var(--amp-r)', veraltet: 'var(--amp-a)' }
const STATUS_ICON  = { ok: '✅', warnung: '⚠️', fehler: '🔴', veraltet: '🕐' }
const STATUS_TEXT  = { ok: 'Aktuell', warnung: 'Warnung', fehler: 'Fehler', veraltet: 'Veraltet' }

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

export default function Startseite({ verbindung, onGeh }) {
  const gesamt = gesamtStatus()
  const fehler = IMPORT_FEHLER

  return (
    <div style={{ maxWidth: 1100, margin: '0 auto' }}>
      <h2 style={{ margin: '0 0 6px' }}>Startseite — System & Datenstatus</h2>
      <p style={{ ...muted, marginBottom: 20, maxWidth: 700 }}>
        Übersicht aller Importe, Verbindungen und Datenstände. Nur wenn alle Quellen aktuell
        geladen sind, sind die Berichte vollständig korrekt.
      </p>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 14, marginBottom: 24 }}>
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
        <div style={{ ...card, padding: '14px 18px', marginBottom: 24, borderLeft: '4px solid var(--amp-a)' }}>
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

      <div style={{ ...card, marginBottom: 24 }}>
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

      <div style={{ ...card, marginBottom: 24 }}>
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

      <div style={{ ...card, padding: '14px 18px' }}>
        <div style={{ ...cap, marginBottom: 10 }}>🚀 Schnellzugriff</div>
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          {[['📊 Berichtsbaum', 'baum'], ['🔬 Detailberichte', 'detailberichte'],
            ['✅ Querchecks', 'qc'], ['⚠ Alerts', 'alerts']].map(([label, view]) => (
            <button key={view} onClick={() => onGeh?.(view)}
              style={{ padding: '8px 14px', border: '1px solid var(--accent)', borderRadius: 'var(--radius-sm)',
                background: 'var(--accent-soft)', color: 'var(--accent)', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
              {label}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
