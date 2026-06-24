// =========================================================================
//  SQL-SETUP & ANBINDUNG — Quelle wählen (Demo/MSSQL/Vercel), Schema ansehen,
//  Setup-/Seed-/Delta-Skripte erzeugen, kopieren/herunterladen. Simuliert den
//  Ablauf „Verbindung prüfen → keine Tabellen → Installations-Setup starten".
// =========================================================================
import React, { useState } from 'react'
import { QUELLEN, skriptPaket, existenzPruefung, fehlendeTabellen } from '../../core/sqlGenerator.js'
import { DIMENSIONEN, FAKTEN, TABELLEN, SCHEMA_VERSION } from '../../core/datenschema.js'

const card = { background: 'var(--panel)', border: '1px solid var(--line)', borderRadius: 'var(--radius)', boxShadow: 'var(--shadow)' }
const cap = { fontSize: 11, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '.04em', fontWeight: 700 }
const QKEY = 'er_data_source'

function ladeQuelle() { try { return localStorage.getItem(QKEY) || 'demo' } catch { return 'demo' } }

function CodeBlock({ titel, code }) {
  const [kopiert, setKopiert] = useState(false)
  const copy = () => { try { navigator.clipboard?.writeText(code); setKopiert(true); setTimeout(() => setKopiert(false), 1500) } catch {} }
  const download = () => {
    try {
      const blob = new Blob([code], { type: 'text/sql' })
      const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = titel; a.click(); URL.revokeObjectURL(a.href)
    } catch {}
  }
  return (
    <div style={{ ...card, overflow: 'hidden' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 12px', borderBottom: '1px solid var(--line)' }}>
        <span className="mono" style={{ fontSize: 12, color: 'var(--muted)' }}>{titel}</span>
        <span style={{ display: 'flex', gap: 6 }}>
          <button onClick={copy} style={{ fontSize: 11.5, padding: '4px 9px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--line)', background: 'var(--panel)', cursor: 'pointer' }}>{kopiert ? '✓ kopiert' : '⧉ Kopieren'}</button>
          <button onClick={download} style={{ fontSize: 11.5, padding: '4px 9px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--line)', background: 'var(--panel)', cursor: 'pointer' }}>⬇ .sql</button>
        </span>
      </div>
      <pre className="mono" style={{ margin: 0, padding: 12, fontSize: 11, lineHeight: 1.5, overflow: 'auto', maxHeight: 360, color: 'var(--ink)' }}>{code}</pre>
    </div>
  )
}

export default function SqlSetup() {
  const [quelleId, setQuelleId] = useState(ladeQuelle)
  const [pruefung, setPruefung] = useState(null) // null | { gefunden, fehlend }
  const [skriptTab, setSkriptTab] = useState('setup')
  const quelle = QUELLEN.find((q) => q.id === quelleId) || QUELLEN[0]
  const dialekt = quelle.dialekt
  const setQuelle = (id) => { setQuelleId(id); setPruefung(null); try { localStorage.setItem(QKEY, id) } catch {} }
  const paket = dialekt ? skriptPaket(dialekt) : null

  // Verbindung prüfen (simuliert: leere DB → Setup nötig). Real liefert das
  // Backend die existierenden Tabellen via existenzPruefung()-Query.
  const pruefen = () => {
    const fehlend = fehlendeTabellen([], dialekt)
    setPruefung({ gefunden: TABELLEN.length - fehlend.length, fehlend })
  }

  return (
    <div style={{ display: 'grid', gap: 14 }}>
      {/* Quelle wählen */}
      <div style={{ ...card, padding: 14 }}>
        <div style={{ ...cap, marginBottom: 8 }}>Datenquelle wählen</div>
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          {QUELLEN.map((q) => (
            <button key={q.id} onClick={() => setQuelle(q.id)} style={{ flex: '1 1 220px', textAlign: 'left', padding: '12px 14px', borderRadius: 'var(--radius)', cursor: 'pointer',
              border: `2px solid ${quelleId === q.id ? 'var(--accent)' : 'var(--line)'}`, background: quelleId === q.id ? 'var(--accent-soft)' : 'var(--panel)' }}>
              <div style={{ fontWeight: 700, fontSize: 14, color: quelleId === q.id ? 'var(--accent)' : 'var(--ink)' }}>{q.name}</div>
              <div style={{ fontSize: 12, color: 'var(--muted)', marginTop: 3 }}>{q.hinweis}</div>
            </button>
          ))}
        </div>
        <div style={{ fontSize: 11.5, color: 'var(--muted)', marginTop: 8 }}>Aktive Quelle wird gemerkt (entspricht <code>VITE_DATA_SOURCE</code>). Schema-Version {SCHEMA_VERSION}.</div>
      </div>

      {dialekt && (
        <div style={{ ...card, padding: 14 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 8 }}>
            <div style={{ ...cap }}>Verbindung & Installation</div>
            <button onClick={pruefen} style={{ padding: '7px 14px', borderRadius: 'var(--radius-sm)', border: 'none', background: 'var(--accent)', color: '#fff', fontWeight: 600, cursor: 'pointer', fontSize: 13 }}>Verbindung prüfen</button>
          </div>
          {pruefung && (
            <div style={{ marginTop: 10 }}>
              {pruefung.fehlend.length === 0
                ? <div style={{ color: 'var(--amp-g)', fontWeight: 600 }}>✓ Alle {TABELLEN.length} Tabellen vorhanden — kein Setup nötig.</div>
                : (
                  <div style={{ background: 'var(--amp-a-soft, #fef3c7)', border: '1px solid #fbbf24', borderRadius: 'var(--radius-sm)', padding: 12 }}>
                    <div style={{ fontWeight: 700, color: '#92400e' }}>⚠ {pruefung.gefunden} von {TABELLEN.length} Tabellen gefunden — Installations-Setup nötig.</div>
                    <ol style={{ margin: '8px 0 0 18px', fontSize: 12.5, color: 'var(--slate)', lineHeight: 1.7 }}>
                      <li><b>Setup-Skript</b> ausführen (Tabellen + Beziehungen + Indizes anlegen).</li>
                      <li><b>Seed</b> einspielen (Stamm-Dimensionen) oder direkt aus Quellsystemen laden.</li>
                      <li><b>Delta-Job</b> einrichten (inkrementell über Wasserzeichen <code>AktualisiertAm</code>).</li>
                    </ol>
                    <div className="mono" style={{ fontSize: 11, color: 'var(--muted)', marginTop: 8 }}>Prüf-Query: {existenzPruefung(dialekt)}</div>
                  </div>
                )}
            </div>
          )}
          {!pruefung && <div style={{ fontSize: 12.5, color: 'var(--muted)', marginTop: 8 }}>Beim Start prüft die App die Verbindung; fehlen Tabellen, startet dieser Setup-Assistent automatisch.</div>}
        </div>
      )}

      {dialekt && (
        <>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {[['setup', 'Setup-Skript (DDL)'], ['seed', 'Seed-Inserts'], ['delta', 'Delta-Beladung'], ['schema', 'Schema-Übersicht']].map(([id, n]) => (
              <button key={id} onClick={() => setSkriptTab(id)} style={{ padding: '6px 12px', borderRadius: 999, fontSize: 12.5, cursor: 'pointer', fontWeight: 600, border: `1px solid ${skriptTab === id ? 'var(--accent)' : 'var(--line)'}`, background: skriptTab === id ? 'var(--accent)' : 'var(--panel)', color: skriptTab === id ? '#fff' : 'var(--ink)' }}>{n}</button>
            ))}
          </div>
          {skriptTab === 'setup' && <CodeBlock titel={`${dialekt}_setup.sql`} code={paket.setup} />}
          {skriptTab === 'seed' && <CodeBlock titel={`${dialekt}_seed.sql`} code={paket.seed} />}
          {skriptTab === 'delta' && <CodeBlock titel={`${dialekt}_delta.sql`} code={paket.delta} />}
          {skriptTab === 'schema' && <SchemaViewer dialekt={dialekt} />}
        </>
      )}

      {!dialekt && (
        <div style={{ ...card, padding: 16, fontSize: 13, color: 'var(--slate)' }}>
          <b>Demo-Modus aktiv</b> — das Reporting läuft mit eingebauten Beispieldaten, keine Datenbank nötig.
          Wähle <b>MSSQL</b> oder <b>Vercel</b>, um die Tabellenstruktur, Seed- und Delta-Skripte für deinen Server zu erzeugen.
        </div>
      )}
    </div>
  )
}

function SchemaViewer({ dialekt }) {
  const [offen, setOffen] = useState(null)
  const Block = ({ titel, tabellen, farbe }) => (
    <div style={{ ...card, overflow: 'hidden' }}>
      <div style={{ ...cap, padding: '10px 12px', borderBottom: '1px solid var(--line)' }}>{titel} ({tabellen.length})</div>
      {tabellen.map((t) => (
        <div key={t.name} style={{ borderBottom: '1px solid var(--line)' }}>
          <button onClick={() => setOffen(offen === t.name ? null : t.name)} style={{ width: '100%', textAlign: 'left', padding: '8px 12px', border: 'none', background: 'none', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span><span style={{ fontWeight: 700, color: farbe }}>{t.name}</span> <span style={{ fontSize: 12, color: 'var(--muted)' }}>— {t.beschreibung}</span></span>
            <span style={{ color: 'var(--muted)' }}>{offen === t.name ? '▾' : '▸'}</span>
          </button>
          {offen === t.name && (
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12, marginBottom: 6 }}>
              <tbody>
                {t.spalten.map((c) => (
                  <tr key={c.n}>
                    <td style={{ padding: '3px 12px', fontWeight: c.pk ? 700 : 400 }}>{c.pk ? '🔑 ' : c.fk ? '🔗 ' : c.biz ? '• ' : ''}{c.n}</td>
                    <td className="mono" style={{ padding: '3px 12px', color: 'var(--muted)' }}>{dialekt === 'postgres' ? c.t.replace(/nvarchar/, 'varchar').replace(/^bit$/, 'boolean').replace(/datetime2/, 'timestamptz').replace(/tinyint/, 'smallint').replace(/decimal/, 'numeric') : c.t}</td>
                    <td style={{ padding: '3px 12px', color: 'var(--muted)', fontSize: 11 }}>{c.fk ? `→ ${c.fk}` : c.null ? 'NULL' : ''}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      ))}
    </div>
  )
  return (
    <div style={{ display: 'grid', gap: 12 }}>
      <Block titel="Dimensionen" tabellen={DIMENSIONEN} farbe="var(--accent)" />
      <Block titel="Faktentabellen" tabellen={FAKTEN} farbe="#7c3aed" />
    </div>
  )
}
