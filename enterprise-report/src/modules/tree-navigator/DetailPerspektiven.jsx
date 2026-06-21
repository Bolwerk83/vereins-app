// =========================================================================
//  Detail-Perspektiven (Ebene-4-Sprungpunkte) mit vorgelagerter Filtermaske.
//  Der Knoten bietet nur die fachlich sinnvollen Auswertungsobjekte an.
//  Geladen wird erst nach "Anzeigen" — die Filtermaske hält das Laden klein.
// =========================================================================
import React, { useState } from 'react'
import { DRILL } from '../../core/drilldowns.js'
import { ladePerspektive, PERIODEN, AKTUELLE_PERIODE } from '../../core/dataProvider.js'
import { DetailTabelle } from '../../components/ui.jsx'

const TOPN = [10, 25, 100, 0]

export default function DetailPerspektiven({ bereich, perspektiven = [] }) {
  const [aktiv, setAktiv] = useState(null)         // gewählte Perspektive
  const [daten, setDaten] = useState(null)
  const [laedt, setLaedt] = useState(false)
  const [von, setVon] = useState(PERIODEN[0])
  const [bis, setBis] = useState(AKTUELLE_PERIODE)
  const [suche, setSuche] = useState('')
  const [top, setTop] = useState(25)

  function waehle(p) { setAktiv(p); setDaten(null) }

  async function anzeigen() {
    if (!aktiv) return
    setLaedt(true)
    const key = `${bereich.toLowerCase()}_${aktiv}`
    const roh = await ladePerspektive(key)
    // Filter clientseitig (Demo): Volltext + Top-N
    let zeilen = roh?.zeilen || []
    const s = suche.trim().toLowerCase()
    if (s) zeilen = zeilen.filter((z) => z.some((c) => String(c).toLowerCase().includes(s)))
    if (top) zeilen = zeilen.slice(0, top)
    setDaten(roh ? { ...roh, zeilen } : null)
    setLaedt(false)
  }

  const inp = { padding: '7px 9px', border: '1px solid var(--line)', borderRadius: 'var(--radius-sm)', font: 'inherit' }

  return (
    <div style={{ background: 'var(--panel)', border: '1px solid var(--line)', borderRadius: 'var(--radius)', padding: 14, boxShadow: 'var(--shadow)' }}>
      <div className="mono" style={{ fontSize: 11, color: 'var(--muted)', textTransform: 'uppercase', marginBottom: 8 }}>Detail-Sprungpunkte (Ebene 4) — Auswertung nach …</div>
      {/* Perspektiven-Auswahl */}
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        {perspektiven.map((p) => (
          <button key={p} onClick={() => waehle(p)} style={{ padding: '7px 12px', borderRadius: 999, fontSize: 13,
            border: `1px solid ${aktiv === p ? 'var(--accent)' : 'var(--line)'}`,
            background: aktiv === p ? 'var(--accent-soft)' : 'var(--panel)', color: aktiv === p ? 'var(--accent)' : 'var(--ink)', fontWeight: 500 }}>
            {DRILL[p]?.icon} {DRILL[p]?.name || p}
          </button>
        ))}
      </div>

      {/* Filtermaske + Laden */}
      {aktiv && (
        <div style={{ marginTop: 12, borderTop: '1px solid var(--line)', paddingTop: 12 }}>
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'flex-end' }}>
            <label style={{ fontSize: 11, color: 'var(--muted)' }}>Von<br />
              <select style={{ ...inp, marginTop: 2 }} value={von} onChange={(e) => setVon(e.target.value)}>{PERIODEN.map((p) => <option key={p}>{p}</option>)}</select></label>
            <label style={{ fontSize: 11, color: 'var(--muted)' }}>Bis<br />
              <select style={{ ...inp, marginTop: 2 }} value={bis} onChange={(e) => setBis(e.target.value)}>{PERIODEN.map((p) => <option key={p}>{p}</option>)}</select></label>
            <label style={{ fontSize: 11, color: 'var(--muted)', flex: 1, minWidth: 160 }}>Suche (Nr./Name)<br />
              <input style={{ ...inp, marginTop: 2, width: '100%' }} value={suche} onChange={(e) => setSuche(e.target.value)} placeholder="filtern …" /></label>
            <label style={{ fontSize: 11, color: 'var(--muted)' }}>Anzeige<br />
              <select style={{ ...inp, marginTop: 2 }} value={top} onChange={(e) => setTop(Number(e.target.value))}>
                {TOPN.map((n) => <option key={n} value={n}>{n ? `Top ${n}` : 'Alle'}</option>)}</select></label>
            <button onClick={anzeigen} disabled={laedt} style={{ padding: '9px 16px', border: 'none', borderRadius: 'var(--radius-sm)', background: 'var(--accent)', color: '#fff', fontWeight: 600, opacity: laedt ? .6 : 1 }}>
              {laedt ? 'Lädt …' : 'Anzeigen'}</button>
          </div>
          {!daten && !laedt && <div style={{ fontSize: 12, color: 'var(--muted)', marginTop: 8 }}>Filter setzen und „Anzeigen" — so bleibt das Laden schnell.</div>}
          {daten && <div style={{ marginTop: 12 }}><DetailTabelle daten={daten} /></div>}
        </div>
      )}
    </div>
  )
}
