// =========================================================================
//  NUTZUNGS-STATISTIK (Admin) — wie oft werden Berichte geöffnet? Ranking,
//  Tagesverlauf und Summen. Nur für den Admin sichtbar und auswertbar.
// =========================================================================
import React, { useState, useEffect } from 'react'
import { auswertung, verlauf, reset, aufraeumen, alsCsv } from '../../core/nutzung.js'
import { aktiveListe, aktiveNutzer, aktiveProTag, aktiveZeitraum, FENSTER_MIN } from '../../core/praesenz.js'
import { NAV_ZIELE } from '../../core/suche.js'
import { useT } from '../../core/i18n.jsx'

const card = { background: 'var(--panel)', border: '1px solid var(--line)', borderRadius: 'var(--radius)', boxShadow: 'var(--shadow)' }
const cap = { fontSize: 11, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '.03em', fontWeight: 700 }
const th = (al) => ({ textAlign: al, padding: '6px 10px', borderBottom: '2px solid var(--line)', fontSize: 10, color: 'var(--muted)', textTransform: 'uppercase' })
const td = (al, bold) => ({ textAlign: al, padding: '7px 10px', borderBottom: '1px solid var(--line)', fontWeight: bold ? 700 : 400 })

export default function Nutzung({ istAdmin = false }) {
  const { t } = useT()
  const [tick, setTick] = useState(0)
  // Live-Ansicht alle 20 s aktualisieren.
  useEffect(() => { const id = setInterval(() => setTick((x) => x + 1), 20000); return () => clearInterval(id) }, [])

  if (!istAdmin) {
    return (
      <div style={{ ...card, maxWidth: 560, margin: '0 auto', padding: 24, textAlign: 'center', color: 'var(--muted)' }}>
        <div style={{ fontSize: 30, marginBottom: 8 }}>🔒</div>
        Die Nutzungs-Statistik ist dem <b>Admin</b> vorbehalten.
      </div>
    )
  }

  const a = auswertung()
  const v = verlauf(14)
  const auf = aufraeumen(NAV_ZIELE.map((z) => z.ziel))
  const live = aktiveListe(FENSTER_MIN)
  const aktivProTag = aktiveProTag(14)
  const maxAktiv = Math.max(...aktivProTag.map((x) => x.anzahl), 1)
  const zr = aktiveZeitraum()
  const maxV = Math.max(...v.map((x) => x.count), 1)
  const maxC = Math.max(...a.rows.map((r) => r.count), 1)
  // View-ID → lesbares Label.
  const label = (id) => {
    const z = NAV_ZIELE.find((x) => x.ziel === id)
    if (z) return t(z.schluessel)
    return ({ report: 'Management-Report', baum: 'Berichtsbaum', rechte: 'Rollen & Rechte', nutzung: 'Nutzungs-Statistik' }[id]) || id
  }
  const wann = (iso) => iso ? new Date(iso).toLocaleString('de-DE', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' }) : '—'

  function exportCsv() {
    const csv = '﻿' + alsCsv(label) // BOM für Excel-Umlaute
    const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' }))
    const a2 = document.createElement('a')
    a2.href = url; a2.download = `nutzung_${new Date().toISOString().slice(0, 10)}.csv`
    document.body.appendChild(a2); a2.click(); a2.remove(); URL.revokeObjectURL(url)
  }

  return (
    <div style={{ maxWidth: '100%', margin: '0 auto' }} key={tick}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12, flexWrap: 'wrap', marginBottom: 14 }}>
        <div>
          <h2 style={{ margin: '0 0 4px' }}>Nutzungs-Statistik</h2>
          <div style={{ color: 'var(--muted)', fontSize: 13, maxWidth: 680 }}>
            Wie oft werden welche Berichte geöffnet? Lokale Aufrufzähler — hilft, die gefragtesten und die kaum
            genutzten Berichte zu erkennen.
          </div>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button onClick={exportCsv} disabled={a.rows.length === 0}
            style={{ padding: '8px 13px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--line)', background: 'var(--panel)', cursor: a.rows.length ? 'pointer' : 'not-allowed', fontSize: 13, opacity: a.rows.length ? 1 : 0.5 }}>
            ⭳ CSV-Export
          </button>
          <button onClick={() => { if (confirm('Nutzungs-Statistik wirklich zurücksetzen?')) { reset(); setTick((x) => x + 1) } }}
            style={{ padding: '8px 13px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--line)', background: 'var(--panel)', color: 'var(--muted)', cursor: 'pointer', fontSize: 13 }}>
            Zurücksetzen
          </button>
        </div>
      </div>

      {/* Live: gerade aktive Nutzer */}
      <div style={{ ...card, padding: 16, marginBottom: 14, borderLeft: '4px solid var(--amp-g)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ width: 10, height: 10, borderRadius: '50%', background: 'var(--amp-g)', boxShadow: '0 0 0 4px color-mix(in srgb, var(--amp-g) 25%, transparent)' }} />
            <div>
              <div style={{ fontSize: 30, fontWeight: 800, lineHeight: 1 }}>{live.length}</div>
              <div style={{ ...cap, marginTop: 2 }}>Jetzt aktiv (≤ {FENSTER_MIN} Min.)</div>
            </div>
          </div>
          <div style={{ flex: 1, minWidth: 200, display: 'flex', flexWrap: 'wrap', gap: 6 }}>
            {live.length === 0 && <span style={{ fontSize: 13, color: 'var(--muted)' }}>Niemand aktiv.</span>}
            {live.map((u) => (
              <span key={u.uid} title={`zuletzt vor ${u.minutenHer} Min.`}
                style={{ fontSize: 12, padding: '4px 10px', borderRadius: 999, border: '1px solid var(--line)', background: 'var(--bg)' }}>
                <span style={{ color: 'var(--amp-g)' }}>●</span> {u.name} · {u.minutenHer === 0 ? 'gerade eben' : `vor ${u.minutenHer} Min.`}
              </span>
            ))}
          </div>
          <div style={{ fontSize: 11, color: 'var(--muted)', textAlign: 'right' }}>aktualisiert automatisch</div>
        </div>
      </div>

      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 14 }}>
        <Kpi label="Eindeutige User heute" wert={a.userHeuteGesamt} farbe="var(--accent)" />
        <Kpi label="Eindeutige User 7 Tage" wert={zr.woche} />
        <Kpi label="Eindeutige User 30 Tage" wert={zr.monat} />
        <Kpi label="Aufrufe gesamt" wert={a.gesamt} />
        <Kpi label="Genutzte Berichte" wert={a.aktiveBerichte} />
      </div>

      {/* Eindeutige aktive Nutzer je Tag */}
      <div style={{ ...card, padding: 16, marginBottom: 14 }}>
        <div style={{ ...cap, marginBottom: 10 }}>Eindeutige Nutzer — letzte 14 Tage</div>
        <div style={{ display: 'flex', alignItems: 'flex-end', gap: 4, height: 90 }}>
          {aktivProTag.map((x) => (
            <div key={x.tag} title={`${x.tag}: ${x.anzahl} User`} style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', alignItems: 'center', gap: 3 }}>
              <div style={{ fontSize: 9, color: 'var(--muted)' }}>{x.anzahl || ''}</div>
              <div style={{ width: '100%', height: `${x.anzahl / maxAktiv * 60}px`, minHeight: x.anzahl ? 3 : 0, background: 'var(--amp-g)', borderRadius: '3px 3px 0 0' }} />
              <div style={{ fontSize: 9, color: 'var(--muted)' }}>{x.tag.slice(8)}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Tagesverlauf */}
      <div style={{ ...card, padding: 16, marginBottom: 14 }}>
        <div style={{ ...cap, marginBottom: 10 }}>Aufrufe — letzte 14 Tage</div>
        <div style={{ display: 'flex', alignItems: 'flex-end', gap: 4, height: 90 }}>
          {v.map((x) => (
            <div key={x.tag} title={`${x.tag}: ${x.count}`} style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', alignItems: 'center', gap: 3 }}>
              <div style={{ width: '100%', height: `${x.count / maxV * 70}px`, minHeight: x.count ? 3 : 0, background: 'var(--accent)', borderRadius: '3px 3px 0 0' }} />
              <div style={{ fontSize: 9, color: 'var(--muted)' }}>{x.tag.slice(8)}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Ranking */}
      <div style={{ ...card, padding: 16, overflowX: 'auto' }}>
        <div style={{ ...cap, marginBottom: 10 }}>Ranking der Berichte</div>
        {a.rows.length === 0 && <div style={{ fontSize: 13, color: 'var(--muted)' }}>Noch keine Aufrufe erfasst.</div>}
        {a.rows.length > 0 && (
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13, minWidth: 600 }}>
            <thead><tr>{['#', 'Bericht', 'Aufrufe', '', 'User heute', 'User 7T', 'Aufr. heute', 'Zuletzt'].map((h, i) => <th key={i} style={th(i <= 1 ? 'left' : 'right')}>{h}</th>)}</tr></thead>
            <tbody>
              {a.rows.map((r, i) => (
                <tr key={r.id}>
                  <td style={{ ...td('left'), color: 'var(--muted)' }}>{i + 1}</td>
                  <td style={td('left', true)}>{label(r.id)} <span style={{ fontSize: 10, color: 'var(--muted)' }}>{r.id}</span></td>
                  <td className="mono" style={td('right', true)}>{r.count}</td>
                  <td style={{ padding: '7px 10px', borderBottom: '1px solid var(--line)', width: 110 }}>
                    <div style={{ height: 8, background: 'var(--bg)', borderRadius: 4, overflow: 'hidden' }}><div style={{ width: `${r.count / maxC * 100}%`, height: '100%', background: 'var(--accent)' }} /></div>
                  </td>
                  <td className="mono" style={{ ...td('right', true), color: r.userHeute ? 'var(--accent)' : 'var(--muted)' }}>{r.userHeute}</td>
                  <td className="mono" style={td('right')}>{r.userWoche}</td>
                  <td className="mono" style={{ ...td('right'), color: 'var(--muted)' }}>{r.heute}</td>
                  <td className="mono" style={{ ...td('right'), color: 'var(--muted)', fontSize: 11.5 }}>{wann(r.last)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Aufräum-Sicht */}
      <div style={{ ...card, padding: 16, marginTop: 14 }}>
        <div style={{ ...cap, marginBottom: 8 }}>Aufräum-Kandidaten</div>
        <div style={{ fontSize: 12.5, color: 'var(--muted)', marginBottom: 10 }}>
          Berichte, die kaum oder nie geöffnet werden — Kandidaten zum Verschlanken des Menüs.
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
          <div>
            <div style={{ fontSize: 12, fontWeight: 700, marginBottom: 6 }}>Nie geöffnet ({auf.nie.length})</div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5 }}>
              {auf.nie.length === 0 && <span style={{ fontSize: 12.5, color: 'var(--muted)' }}>Alle bekannten Berichte wurden mindestens einmal geöffnet. 👍</span>}
              {auf.nie.map((id) => <span key={id} style={{ fontSize: 12, padding: '3px 8px', borderRadius: 999, border: '1px solid var(--line)', background: 'var(--bg)' }}>{label(id)}</span>)}
            </div>
          </div>
          <div>
            <div style={{ fontSize: 12, fontWeight: 700, marginBottom: 6 }}>Kaum genutzt (1–2 Aufrufe)</div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5 }}>
              {auf.kaum.length === 0 && <span style={{ fontSize: 12.5, color: 'var(--muted)' }}>—</span>}
              {auf.kaum.map((k) => <span key={k.id} style={{ fontSize: 12, padding: '3px 8px', borderRadius: 999, border: '1px solid var(--amp-a)', color: 'var(--amp-a)' }}>{label(k.id)} · {k.count}×</span>)}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function Kpi({ label, wert, farbe }) {
  return <div style={{ ...card, padding: '10px 13px', flex: 1, minWidth: 130 }}>
    <div style={cap}>{label}</div>
    <div style={{ fontSize: 22, fontWeight: 700, color: farbe || 'var(--ink)' }}>{wert}</div>
  </div>
}
