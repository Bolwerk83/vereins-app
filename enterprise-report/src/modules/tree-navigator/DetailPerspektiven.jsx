// =========================================================================
//  Detail-Perspektiven (Ebene-4-Sprungpunkte) mit vorgelagerter Filtermaske.
//  Der Knoten bietet nur die fachlich sinnvollen Auswertungsobjekte an.
//  Felder-Filter (Status/Segment/Typ …) kommen aus dataset.filterSpalten.
//  Geladen/gerendert wird die Tabelle erst nach "Anzeigen".
// =========================================================================
import React, { useState } from 'react'
import { DRILL } from '../../core/drilldowns.js'
import { ladePerspektive, PERIODEN, AKTUELLE_PERIODE } from '../../core/dataProvider.js'
import { DetailTabelle } from '../../components/ui.jsx'

const TOPN = [10, 25, 100, 0]
const distinct = (zeilen, idx) => [...new Set(zeilen.map((z) => z[idx]))]
// Deutsche Zahl ("1.240" / "38 %" / "−0,3") parsen — sonst NaN.
function parseNum(v) {
  const s = String(v).replace(/[^\d,.\-−]/g, '').replace(/−/g, '-').replace(/\./g, '').replace(',', '.')
  const n = parseFloat(s)
  return Number.isNaN(n) ? null : n
}

export default function DetailPerspektiven({ bereich, perspektiven = [] }) {
  const [aktiv, setAktiv] = useState(null)
  const [roh, setRoh] = useState(null)        // geladener Datensatz (für Filteroptionen)
  const [daten, setDaten] = useState(null)    // gefiltertes Ergebnis (Tabelle)
  const [laedt, setLaedt] = useState(false)
  const [von, setVon] = useState(PERIODEN[0])
  const [bis, setBis] = useState(AKTUELLE_PERIODE)
  const [suche, setSuche] = useState('')
  const [top, setTop] = useState(25)
  const [feld, setFeld] = useState({})        // { spaltenIndex: wert }
  const [sortIdx, setSortIdx] = useState(null)
  const [sortDir, setSortDir] = useState('asc')
  const [sichtbar, setSichtbar] = useState(null) // Set sichtbarer Spaltenindizes
  const [spaltenAuf, setSpaltenAuf] = useState(false)

  async function waehle(p) {
    setAktiv(p); setDaten(null); setFeld({}); setSuche(''); setSortIdx(null); setSpaltenAuf(false)
    setLaedt(true)
    const r = await ladePerspektive(`${bereich.toLowerCase()}_${p}`)
    setRoh(r); setSichtbar(r ? new Set(r.spalten.map((_, i) => i)) : null); setLaedt(false)
  }

  function anzeigen() {
    if (!roh) return
    let zeilen = roh.zeilen || []
    // Feld-Filter (AND)
    for (const [idx, wert] of Object.entries(feld)) {
      if (wert) zeilen = zeilen.filter((z) => String(z[idx]) === wert)
    }
    // Volltext
    const s = suche.trim().toLowerCase()
    if (s) zeilen = zeilen.filter((z) => z.some((c) => String(c).toLowerCase().includes(s)))
    if (top) zeilen = zeilen.slice(0, top)
    setDaten({ ...roh, zeilen })
  }

  // Sicht = gefiltertes Ergebnis + Sortierung + Spaltenauswahl (sofort wirksam)
  let view = null
  if (daten && sichtbar) {
    const cols = daten.spalten.map((_, i) => i).filter((i) => sichtbar.has(i))
    let zeilen = daten.zeilen
    if (sortIdx != null) {
      zeilen = [...zeilen].sort((a, b) => {
        const na = parseNum(a[sortIdx]), nb = parseNum(b[sortIdx])
        const c = (na != null && nb != null) ? na - nb : String(a[sortIdx]).localeCompare(String(b[sortIdx]), 'de')
        return sortDir === 'asc' ? c : -c
      })
    }
    view = { titel: daten.titel, spalten: cols.map((i) => daten.spalten[i]), zeilen: zeilen.map((z) => cols.map((i) => z[i])) }
  }

  const inp = { padding: '7px 9px', border: '1px solid var(--line)', borderRadius: 'var(--radius-sm)', font: 'inherit' }

  return (
    <div style={{ background: 'var(--panel)', border: '1px solid var(--line)', borderRadius: 'var(--radius)', padding: 14, boxShadow: 'var(--shadow)' }}>
      <div className="mono" style={{ fontSize: 11, color: 'var(--muted)', textTransform: 'uppercase', marginBottom: 8 }}>Detail-Sprungpunkte (Ebene 4) — Auswertung nach …</div>
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        {perspektiven.map((p) => (
          <button key={p} onClick={() => waehle(p)} style={{ padding: '7px 12px', borderRadius: 999, fontSize: 13,
            border: `1px solid ${aktiv === p ? 'var(--accent)' : 'var(--line)'}`,
            background: aktiv === p ? 'var(--accent-soft)' : 'var(--panel)', color: aktiv === p ? 'var(--accent)' : 'var(--ink)', fontWeight: 500 }}>
            {DRILL[p]?.icon} {DRILL[p]?.name || p}
          </button>
        ))}
      </div>

      {aktiv && (
        <div style={{ marginTop: 12, borderTop: '1px solid var(--line)', paddingTop: 12 }}>
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'flex-end' }}>
            <label style={{ fontSize: 11, color: 'var(--muted)' }}>Von<br />
              <select style={{ ...inp, marginTop: 2 }} value={von} onChange={(e) => setVon(e.target.value)}>{PERIODEN.map((p) => <option key={p}>{p}</option>)}</select></label>
            <label style={{ fontSize: 11, color: 'var(--muted)' }}>Bis<br />
              <select style={{ ...inp, marginTop: 2 }} value={bis} onChange={(e) => setBis(e.target.value)}>{PERIODEN.map((p) => <option key={p}>{p}</option>)}</select></label>
            {/* Feld-Filter aus filterSpalten */}
            {(roh?.filterSpalten || []).map((idx) => (
              <label key={idx} style={{ fontSize: 11, color: 'var(--muted)' }}>{roh.spalten[idx]}<br />
                <select style={{ ...inp, marginTop: 2 }} value={feld[idx] || ''} onChange={(e) => setFeld((f) => ({ ...f, [idx]: e.target.value }))}>
                  <option value="">Alle</option>
                  {distinct(roh.zeilen, idx).map((w) => <option key={w} value={w}>{w}</option>)}
                </select></label>
            ))}
            <label style={{ fontSize: 11, color: 'var(--muted)', flex: 1, minWidth: 140 }}>Suche<br />
              <input style={{ ...inp, marginTop: 2, width: '100%' }} value={suche} onChange={(e) => setSuche(e.target.value)} placeholder="Nr./Name …" /></label>
            <label style={{ fontSize: 11, color: 'var(--muted)' }}>Anzeige<br />
              <select style={{ ...inp, marginTop: 2 }} value={top} onChange={(e) => setTop(Number(e.target.value))}>
                {TOPN.map((n) => <option key={n} value={n}>{n ? `Top ${n}` : 'Alle'}</option>)}</select></label>
            <button onClick={anzeigen} disabled={laedt || !roh} style={{ padding: '9px 16px', border: 'none', borderRadius: 'var(--radius-sm)', background: 'var(--accent)', color: '#fff', fontWeight: 600, opacity: (laedt || !roh) ? .6 : 1 }}>
              {laedt ? 'Lädt …' : 'Anzeigen'}</button>
          </div>
          {!daten && !laedt && <div style={{ fontSize: 12, color: 'var(--muted)', marginTop: 8 }}>Filter setzen und „Anzeigen" — so bleibt das Laden schnell.</div>}

          {/* Sortierung & Spaltenwahl (sofort wirksam) */}
          {daten && (
            <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap', marginTop: 12 }}>
              <label style={{ fontSize: 11, color: 'var(--muted)' }}>Sortieren nach&nbsp;
                <select style={{ ...inp, padding: '5px 8px' }} value={sortIdx ?? ''} onChange={(e) => setSortIdx(e.target.value === '' ? null : Number(e.target.value))}>
                  <option value="">—</option>
                  {daten.spalten.map((s, i) => <option key={i} value={i}>{s}</option>)}
                </select>
              </label>
              {sortIdx != null && <button style={{ ...inp, padding: '5px 9px' }} onClick={() => setSortDir((d) => d === 'asc' ? 'desc' : 'asc')}>{sortDir === 'asc' ? '↑ aufsteigend' : '↓ absteigend'}</button>}
              <button style={{ ...inp, padding: '5px 9px' }} onClick={() => setSpaltenAuf((v) => !v)}>▦ Spalten ({sichtbar?.size}/{daten.spalten.length})</button>
            </div>
          )}
          {daten && spaltenAuf && (
            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginTop: 8, padding: 10, border: '1px solid var(--line)', borderRadius: 'var(--radius-sm)', background: 'var(--bg)' }}>
              {daten.spalten.map((s, i) => (
                <label key={i} style={{ fontSize: 12, display: 'flex', gap: 5, alignItems: 'center' }}>
                  <input type="checkbox" checked={sichtbar?.has(i)} onChange={() => setSichtbar((prev) => { const n = new Set(prev); n.has(i) ? n.delete(i) : n.add(i); return n.size ? n : prev })} />{s}
                </label>
              ))}
            </div>
          )}

          {view && <div style={{ marginTop: 12 }}>
            <DetailTabelle daten={view} />
            <div className="mono" style={{ fontSize: 11, color: 'var(--muted)', marginTop: 4 }}>{view.zeilen.length} Zeile(n){top ? ` (Top ${top})` : ''}{sortIdx != null ? ` · sortiert nach ${daten.spalten[sortIdx]}` : ''}</div>
          </div>}
        </div>
      )}
    </div>
  )
}
