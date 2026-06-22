// =========================================================================
//  DETAILBERICHTE — granulare Listen zum Validieren im Einzelfall.
//  Hub mit allen Listen; Artikel-/Auftragsliste mit Plausibilitätsprüfung:
//  auffällige Werte werden markiert, „nur Auffälligkeiten" filtert, Klick auf
//  eine Zeile öffnet die Befund-Karte (Sprung in die Detailprüfung).
// =========================================================================
import React, { useState } from 'react'
import { LISTEN, LEGENDE, artikelliste, auftragsliste, historie } from '../../core/detailberichte.js'

const card = { background: 'var(--panel)', border: '1px solid var(--line)', borderRadius: 'var(--radius)', boxShadow: 'var(--shadow)' }
const cap = { fontSize: 11, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '.03em', fontWeight: 700 }
const inp = { padding: '8px 10px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--line)', font: 'inherit', fontSize: 13 }
const eur = (v) => v == null ? '' : v.toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
const pct = (v) => v == null ? '' : v.toLocaleString('de-DE', { minimumFractionDigits: 1, maximumFractionDigits: 1 }) + '%'
const datum = (s) => s ? s.split('-').reverse().join('.') : ''
const SCHWERE = { fehler: { farbe: 'var(--amp-r)', soft: 'var(--amp-r-soft)', icon: '🔴' }, warnung: { farbe: 'var(--amp-a)', soft: 'var(--amp-a-soft)', icon: '🟠' }, hinweis: { farbe: 'var(--muted)', soft: 'var(--bg)', icon: '🔵' } }

const ART_COLS = [
  { key: 'sku', label: 'SKU', al: 'left', mono: true },
  { key: 'artikel', label: 'Artikel (Detailliert)', al: 'left' },
  { key: 'status', label: 'Status', al: 'left' },
  { key: 'gruppe', label: 'Gruppe', al: 'left' },
  { key: 'lbEff', label: 'LB Eff', al: 'right' },
  { key: 'gesp', label: 'GESP', al: 'right' },
  { key: 'kom', label: 'KOM', al: 'right' },
  { key: 'lbVerf', label: 'LB Verf', al: 'right' },
  { key: 'ae', label: 'AE', al: 'right' },
  { key: 'fc', label: 'FC', al: 'right' },
  { key: 'vk', label: 'VK €', al: 'right', fmt: eur },
  { key: 'ek', label: 'EK €', al: 'right', fmt: eur },
  { key: 'marge', label: 'Marge €', al: 'right', fmt: eur },
  { key: 'margePct', label: 'Marge %', al: 'right', fmt: pct },
  { key: 'einkaeufer', label: 'Einkäufer', al: 'left' },
  { key: 'aktiv', label: 'Aktiv', al: 'center', fmt: (v) => (v ? 'Ja' : 'Nein') }
]
const ART_SUM = ['lbEff', 'gesp', 'kom', 'lbVerf', 'ae', 'fc']

const AUF_COLS = [
  { key: 'datum', label: 'Bestelldatum', al: 'left', fmt: datum },
  { key: 'kunde', label: 'Kunde', al: 'left' },
  { key: 'auftrag', label: 'Auftrag', al: 'left', mono: true },
  { key: 'status', label: 'Status', al: 'left' },
  { key: 'ab', label: 'Σ AB', al: 'right' },
  { key: 'vk', label: 'Σ VK', al: 'right' },
  { key: 'ae', label: 'Σ AE', al: 'right' },
  { key: 'aeb', label: 'Σ AEB', al: 'right' },
  { key: 'ret', label: 'Σ RET', al: 'right' },
  { key: 'aet', label: 'Σ AET', al: 'right' },
  { key: 'mek', label: 'Σ MEK', al: 'right' },
  { key: 'abs', label: 'ABS', al: 'right' },
  { key: 'ue', label: 'Σ UE', al: 'right', fmt: eur }
]
const AUF_SUM = ['ab', 'vk', 'ae', 'aeb', 'ret', 'aet', 'mek', 'abs', 'ue']

export default function Detailberichte() {
  const [aktiv, setAktiv] = useState(null)
  if (aktiv === 'artikel') return <Liste typ="artikel" titel="Artikelliste" sub="Zeigt die SKU in einer Listen-Übersicht. Klick auf eine Zeile → Befund-Karte (inkl. E5-Historie)." cols={ART_COLS} sumKeys={ART_SUM} lade={artikelliste} onBack={() => setAktiv(null)} idKey="sku" titelKey="artikel" />
  if (aktiv === 'auftrag') return <Liste typ="auftrag" titel="Auftragsliste" sub="Zeigt die Aufträge in einer Listen-Übersicht." cols={AUF_COLS} sumKeys={AUF_SUM} lade={auftragsliste} onBack={() => setAktiv(null)} idKey="auftrag" titelKey="kunde" />

  // Hub
  return (
    <div style={{ maxWidth: 760, margin: '0 auto' }}>
      <div style={{ marginBottom: 14 }}>
        <h2 style={{ margin: '0 0 4px' }}>Detailberichte</h2>
        <div style={{ color: 'var(--muted)', fontSize: 13, maxWidth: 640 }}>
          Granulare Listen für die Einzelfallprüfung — hier suchst du nach Falscheingaben und validierst Datenvorgänge
          (z. B. negativer Verfügbarbestand, negative Marge, gesperrte Bestände).
        </div>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        {LISTEN.map((l) => (
          <button key={l.id} disabled={!l.verfuegbar} onClick={() => l.verfuegbar && setAktiv(l.id)}
            style={{ ...card, padding: '16px 14px', textAlign: 'left', cursor: l.verfuegbar ? 'pointer' : 'not-allowed', opacity: l.verfuegbar ? 1 : 0.5,
              borderColor: l.verfuegbar ? 'var(--accent)' : 'var(--line)' }}>
            <div style={{ fontWeight: 600, fontSize: 15 }}>{l.name}</div>
            <div style={{ fontSize: 11.5, color: 'var(--muted)', marginTop: 3 }}>{l.verfuegbar ? 'Öffnen →' : 'in Vorbereitung'}</div>
          </button>
        ))}
      </div>
    </div>
  )
}

const EBENEN_PFAD = ['E1 · Geschäftsführung', 'E2 · Fachbereich', 'E3 · Themenbereich', 'E4 · Details', 'E5 · Historisierung']

function Liste({ typ, titel, sub, cols, sumKeys, lade, onBack, idKey, titelKey }) {
  const [suche, setSuche] = useState('')
  const [nurAuffaellig, setNurAuffaellig] = useState(false)
  const [legendeAuf, setLegendeAuf] = useState(false)
  const [detail, setDetail] = useState(null)
  const data = lade({ suche, nurAuffaellig })

  const zelle = (row, c) => {
    const befund = row.befunde.find((b) => b.feld === c.key)
    const v = row[c.key]
    const text = c.fmt ? c.fmt(v) : v
    return (
      <td key={c.key} title={befund ? befund.text : undefined}
        className={c.mono || c.al === 'right' ? 'mono' : undefined}
        style={{ padding: '6px 9px', borderBottom: '1px solid var(--line)', textAlign: c.al, whiteSpace: c.key === 'artikel' || c.key === 'kunde' ? 'normal' : 'nowrap',
          maxWidth: c.key === 'artikel' ? 280 : undefined, overflow: 'hidden', textOverflow: 'ellipsis',
          background: befund ? SCHWERE[befund.schwere].soft : undefined, color: befund ? SCHWERE[befund.schwere].farbe : undefined, fontWeight: befund ? 700 : 400 }}>
        {text}{befund ? ' ⚠' : ''}
      </td>
    )
  }

  return (
    <div style={{ maxWidth: 1180, margin: '0 auto' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
        <button onClick={onBack} title="Zurück" style={{ ...inp, cursor: 'pointer', padding: '6px 11px' }}>←</button>
        <div>
          <h2 style={{ margin: 0 }}>Business Report — {titel}</h2>
          <div style={{ color: 'var(--muted)', fontSize: 12.5 }}>{sub}</div>
        </div>
      </div>
      {/* 5-Ebenen-Transparenz: diese Liste ist Ebene 4, E5-Historie je Zeile. */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, margin: '6px 0 2px' }}>
        {EBENEN_PFAD.map((e, i) => (
          <span key={e} style={{ fontSize: 10.5, padding: '2px 8px', borderRadius: 999,
            background: i === 3 ? 'var(--accent)' : i === 4 ? 'var(--accent-soft)' : 'var(--bg)',
            color: i === 3 ? '#fff' : i === 4 ? 'var(--accent)' : 'var(--muted)', border: '1px solid var(--line)' }}>{e}</span>
        ))}
      </div>

      {/* Filterleiste */}
      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center', margin: '12px 0' }}>
        <input value={suche} onChange={(e) => setSuche(e.target.value)} placeholder="🔎 SKU / Artikel / Kunde / Einkäufer …" style={{ ...inp, minWidth: 260, flex: 1 }} />
        <label style={{ display: 'flex', alignItems: 'center', gap: 7, fontSize: 13, cursor: 'pointer', color: data.auffaellig ? 'var(--amp-r)' : 'var(--muted)' }}>
          <input type="checkbox" checked={nurAuffaellig} onChange={(e) => setNurAuffaellig(e.target.checked)} />
          ⚠ nur Auffälligkeiten ({data.auffaellig})
        </label>
        <button onClick={() => setLegendeAuf((v) => !v)} style={{ ...inp, cursor: 'pointer', fontSize: 12 }}>Legende {legendeAuf ? '▴' : '▾'}</button>
      </div>

      {legendeAuf && (
        <div style={{ ...card, padding: 12, marginBottom: 12, display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '2px 16px' }}>
          {LEGENDE.map(([abk, text]) => (
            <div key={abk} style={{ fontSize: 12 }}><b className="mono">{abk}</b> <span style={{ color: 'var(--muted)' }}>= {text}</span></div>
          ))}
        </div>
      )}

      {/* Tabelle */}
      <div style={{ ...card, padding: 0, overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12.5, minWidth: 1000 }}>
          <thead><tr>{cols.map((c) => <th key={c.key} style={{ position: 'sticky', top: 0, background: 'var(--panel)', textAlign: c.al, padding: '8px 9px', borderBottom: '2px solid var(--line)', fontSize: 10, color: 'var(--muted)', textTransform: 'uppercase', whiteSpace: 'nowrap' }}>{c.label}</th>)}<th style={{ padding: '8px 9px', borderBottom: '2px solid var(--line)' }} /></tr></thead>
          <tbody>
            {data.rows.length === 0 && <tr><td colSpan={cols.length + 1} style={{ padding: 20, textAlign: 'center', color: 'var(--muted)' }}>Keine Treffer.</td></tr>}
            {data.rows.map((row, i) => (
              <tr key={row[idKey] + i} onClick={() => setDetail(row)} style={{ cursor: 'pointer',
                borderLeft: `3px solid ${row.schwere ? SCHWERE[row.schwere].farbe : 'transparent'}` }}
                onMouseEnter={(e) => e.currentTarget.style.background = 'var(--accent-soft)'}
                onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}>
                {cols.map((c) => zelle(row, c))}
                <td style={{ padding: '6px 9px', borderBottom: '1px solid var(--line)', textAlign: 'center' }}>{row.schwere ? SCHWERE[row.schwere].icon : ''}</td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr style={{ fontWeight: 700, background: 'var(--bg)' }}>
              {cols.map((c, i) => (
                <td key={c.key} className={c.al === 'right' ? 'mono' : undefined} style={{ padding: '8px 9px', borderTop: '2px solid var(--line)', textAlign: c.al }}>
                  {i === 0 ? 'Gesamt' : sumKeys.includes(c.key) ? (data.summe[c.key]?.toLocaleString('de-DE')) : ''}
                </td>
              ))}<td style={{ borderTop: '2px solid var(--line)' }} />
            </tr>
          </tfoot>
        </table>
      </div>
      <div style={{ fontSize: 11.5, color: 'var(--muted)', marginTop: 8 }}>{data.rows.length} von {data.gesamt} Zeilen · {data.auffaellig} auffällig · Klick auf eine Zeile öffnet die Befund-Karte.</div>

      {detail && <BefundModal typ={typ} row={detail} cols={cols} idKey={idKey} titelKey={titelKey} onClose={() => setDetail(null)} />}
    </div>
  )
}

function BefundModal({ typ, row, cols, idKey, titelKey, onClose }) {
  const hist = historie(typ, row)
  const maxB = typ === 'artikel' ? Math.max(...hist.map((h) => h.bestand), 1) : 0
  return (
    <div onClick={onClose} style={{ position: 'fixed', inset: 0, zIndex: 90, background: 'rgba(15,23,42,.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
      <div onClick={(e) => e.stopPropagation()} style={{ width: 560, maxWidth: '94vw', maxHeight: '88vh', overflowY: 'auto', background: 'var(--panel)', borderRadius: 'var(--radius)', boxShadow: '0 20px 60px rgba(0,0,0,.3)', border: '1px solid var(--line)' }}>
        <div style={{ padding: '16px 18px', borderBottom: '1px solid var(--line)', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12 }}>
          <div>
            <div className="mono" style={{ fontSize: 11, color: 'var(--muted)' }}>{row[idKey]}</div>
            <h3 style={{ margin: '4px 0 0', fontSize: 17 }}>{row[titelKey]}</h3>
          </div>
          <button onClick={onClose} style={{ border: 'none', background: 'none', fontSize: 22, cursor: 'pointer', color: 'var(--muted)' }}>×</button>
        </div>
        <div style={{ padding: 18 }}>
          {row.befunde.length === 0
            ? <div style={{ padding: '10px 12px', borderRadius: 'var(--radius-sm)', background: 'var(--amp-g-soft)', color: 'var(--amp-g)', fontSize: 13, fontWeight: 600 }}>✓ Keine Auffälligkeiten — Daten plausibel.</div>
            : (
              <>
                <div style={{ ...cap, marginBottom: 8 }}>Befunde ({row.befunde.length})</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 7, marginBottom: 14 }}>
                  {row.befunde.map((b, i) => (
                    <div key={i} style={{ display: 'flex', gap: 9, alignItems: 'flex-start', padding: '9px 11px', borderRadius: 'var(--radius-sm)', background: SCHWERE[b.schwere].soft }}>
                      <span>{SCHWERE[b.schwere].icon}</span>
                      <div><div style={{ fontWeight: 600, fontSize: 13, color: SCHWERE[b.schwere].farbe }}>{b.text}</div>
                        <div style={{ fontSize: 11, color: 'var(--muted)' }}>Feld: {b.feld} · {b.schwere}</div></div>
                    </div>
                  ))}
                </div>
              </>
            )}
          {/* Ebene 5 · Historisierung */}
          <div style={{ ...cap, marginBottom: 6, display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ fontSize: 9, background: 'var(--accent-soft)', color: 'var(--accent)', borderRadius: 4, padding: '1px 6px' }}>E5</span> Historisierung
          </div>
          {typ === 'artikel' ? (
            <div style={{ marginBottom: 14 }}>
              <div style={{ display: 'flex', alignItems: 'flex-end', gap: 6, height: 70 }}>
                {hist.map((h) => (
                  <div key={h.label} title={`${h.label}: Bestand ${h.bestand}, AE ${h.ae}`} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-end', gap: 3 }}>
                    <div style={{ fontSize: 9, color: 'var(--muted)' }}>{h.bestand}</div>
                    <div style={{ width: '100%', height: `${h.bestand / maxB * 48}px`, minHeight: 2, background: 'var(--accent)', borderRadius: '3px 3px 0 0' }} />
                    <div style={{ fontSize: 9, color: 'var(--muted)' }}>{h.label}</div>
                  </div>
                ))}
              </div>
              <div style={{ fontSize: 11, color: 'var(--muted)', marginTop: 4 }}>Bestandsverlauf (Stück) · Balken = Lagerbestand, Tooltip mit Auftragseingang.</div>
            </div>
          ) : (
            <div style={{ marginBottom: 14, display: 'flex', flexWrap: 'wrap', gap: 4 }}>
              {hist.map((h, i) => (
                <React.Fragment key={h.label}>
                  <span style={{ fontSize: 12, padding: '4px 10px', borderRadius: 999, background: h.label === 'Retoure' ? 'var(--amp-r-soft)' : 'var(--accent-soft)', color: h.label === 'Retoure' ? 'var(--amp-r)' : 'var(--accent)', fontWeight: 600 }}>
                    {h.label}<span style={{ color: 'var(--muted)', fontWeight: 400 }}> · {datum(h.datum)}</span>
                  </span>
                  {i < hist.length - 1 && <span style={{ alignSelf: 'center', color: 'var(--muted)' }}>→</span>}
                </React.Fragment>
              ))}
            </div>
          )}

          <div style={{ ...cap, marginBottom: 6 }}>Alle Werte (E4)</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2px 14px' }}>
            {cols.map((c) => (
              <div key={c.key} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12.5, padding: '3px 0', borderBottom: '1px solid var(--line)' }}>
                <span style={{ color: 'var(--muted)' }}>{c.label}</span>
                <span className="mono" style={{ fontWeight: row.befunde.some((b) => b.feld === c.key) ? 700 : 400, color: row.befunde.some((b) => b.feld === c.key) ? 'var(--amp-r)' : 'var(--ink)' }}>{c.fmt ? c.fmt(row[c.key]) : String(row[c.key])}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
