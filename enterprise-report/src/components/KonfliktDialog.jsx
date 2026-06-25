// =========================================================================
//  KONFLIKT-DIALOG — erscheint, wenn beim Speichern ein anderer Kollege den
//  Datensatz zwischenzeitlich geändert hat (optimistisches Sperren). Zeigt
//  WER WANN WAS geändert hat (alt→neu) und die eigene Änderung, markiert
//  überschneidende Felder und bietet drei Auswege: Überschreiben, Abbrechen
//  und — falls die Felder disjunkt sind — Zusammenführen (Mergen).
//  Generisch: funktioniert für jede Tabelle/Entität.
// =========================================================================
import React from 'react'

const wrap = { position: 'fixed', inset: 0, background: 'rgba(15,23,42,.55)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: 16 }
const box = { background: 'var(--panel)', border: '1px solid var(--line)', borderRadius: 'var(--radius)', boxShadow: '0 20px 60px rgba(0,0,0,.3)', maxWidth: 620, width: '100%', maxHeight: '88vh', overflow: 'auto' }
const cap = { fontSize: 10.5, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '.04em', fontWeight: 700 }
const btn = (bg, fg = '#fff') => ({ padding: '8px 15px', borderRadius: 'var(--radius-sm)', border: '1px solid transparent', fontSize: 13, fontWeight: 700, cursor: 'pointer', background: bg, color: fg })

const wert = (v) => v == null || v === '' ? '—' : String(v)
const fmtZeit = (iso) => { try { const d = new Date(iso); return d.toLocaleString('de-DE', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' }) } catch { return iso } }

export default function KonfliktDialog({ titel = 'Artikel', konflikt, onUeberschreiben, onMergen, onAbbrechen }) {
  if (!konflikt) return null
  const k = konflikt
  const fremdeFelder = Object.entries(k.fremdeFelder || {})
  const meineFelder = Object.entries(k.diff || {})
  const ueber = new Set(k.ueberschneidung || [])
  // „Wer/wann" prägnant aus dem jüngsten fremden Eintrag.
  const letzte = (k.fremde || [])[k.fremde.length - 1] || {}

  const Zeile = ({ feld, alt, neu, konflikt }) => (
    <tr style={{ background: konflikt ? 'var(--amp-r-soft, #fee2e2)' : 'transparent' }}>
      <td style={{ padding: '5px 9px', borderBottom: '1px solid var(--line)', fontWeight: 600 }}>{konflikt ? '⚠ ' : ''}{feld}</td>
      <td style={{ padding: '5px 9px', borderBottom: '1px solid var(--line)', color: 'var(--muted)' }} className="mono">{wert(alt)}</td>
      <td style={{ padding: '5px 9px', borderBottom: '1px solid var(--line)', fontWeight: 700 }} className="mono">→ {wert(neu)}</td>
    </tr>
  )

  return (
    <div style={wrap} onClick={onAbbrechen}>
      <div style={box} onClick={(e) => e.stopPropagation()}>
        <div style={{ padding: '14px 16px', borderBottom: '1px solid var(--line)', background: 'var(--amp-a)', color: '#fff', borderRadius: 'var(--radius) var(--radius) 0 0' }}>
          <div style={{ fontWeight: 800, fontSize: 15 }}>⚠ Bearbeitungskonflikt — {titel}</div>
          <div style={{ fontSize: 12.5, opacity: .95, marginTop: 2 }}>
            {letzte.autor ? <b>{letzte.autor}</b> : 'Ein Kollege'} hat diesen Datensatz {letzte.am ? `am ${fmtZeit(letzte.am)}` : 'zwischenzeitlich'} geändert (Version {k.aktuell?.version}).
          </div>
        </div>

        <div style={{ padding: 16, display: 'grid', gap: 14 }}>
          <div>
            <div style={{ ...cap, marginBottom: 5 }}>Änderung der/des Kollegin/Kollegen</div>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12.5 }}>
              <thead><tr>{['Feld', 'vorher', 'nachher'].map((h) => <th key={h} style={{ textAlign: 'left', padding: '4px 9px', borderBottom: '2px solid var(--line)', ...cap }}>{h}</th>)}</tr></thead>
              <tbody>{fremdeFelder.map(([f, v]) => <Zeile key={f} feld={f} alt={v.alt} neu={v.neu} konflikt={ueber.has(f)} />)}</tbody>
            </table>
          </div>

          <div>
            <div style={{ ...cap, marginBottom: 5 }}>Deine Änderung</div>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12.5 }}>
              <thead><tr>{['Feld', 'vorher', 'nachher'].map((h) => <th key={h} style={{ textAlign: 'left', padding: '4px 9px', borderBottom: '2px solid var(--line)', ...cap }}>{h}</th>)}</tr></thead>
              <tbody>{meineFelder.map(([f, v]) => <Zeile key={f} feld={f} alt={v.alt} neu={v.neu} konflikt={ueber.has(f)} />)}</tbody>
            </table>
          </div>

          <div style={{ fontSize: 12.5, padding: '9px 11px', borderRadius: 'var(--radius-sm)', background: k.mergebar ? 'var(--amp-g-soft, #dcfce7)' : 'var(--amp-r-soft, #fee2e2)', color: 'var(--ink)' }}>
            {k.mergebar
              ? '✓ Unterschiedliche Felder — die Änderungen lassen sich gefahrlos zusammenführen.'
              : `⚠ Gleiches Feld geändert (${[...ueber].join(', ')}) — Zusammenführen nicht eindeutig. Bitte Überschreiben oder Abbrechen.`}
          </div>
        </div>

        <div style={{ padding: '12px 16px', borderTop: '1px solid var(--line)', display: 'flex', gap: 8, justifyContent: 'flex-end', flexWrap: 'wrap' }}>
          <button onClick={onAbbrechen} style={btn('var(--panel)', 'var(--ink)')}>Abbrechen</button>
          {k.mergebar && <button onClick={onMergen} style={btn('var(--amp-g)')}>Zusammenführen</button>}
          <button onClick={onUeberschreiben} style={btn('var(--amp-r)')}>Überschreiben</button>
        </div>
      </div>
    </div>
  )
}
