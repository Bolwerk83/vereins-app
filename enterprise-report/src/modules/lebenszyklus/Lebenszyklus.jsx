// =========================================================================
//  LEBENSZYKLUS — zwei getrennte Modelle in zwei Reitern:
//   • Produkte: Portfolio-Matrix (Wachstum × DB), Phasen + Normstrategie,
//     Drill-down Produktgruppe → Artikel.
//   • Kunden: Beziehungsphasen + Empfehlung, „gefährdet/verloren" → Maßnahme.
// =========================================================================
import React, { useState } from 'react'
import {
  PRODUKT_PHASEN, produktPhaseInfo, produkte, kinderProdukt, produktPhaseVerteilung,
  KUNDE_PHASEN, kundePhaseInfo, kunden, kundePhaseVerteilung,
  bcgFelder, quadrantVon, phasenKurve
} from '../../core/lebenszyklus.js'
import { mitLinien, offeneVorschlaege, bestaetigeMatch, loeseMatch, ladeMatches } from '../../core/produktlinie.js'
import { addMassnahme, ladeMassnahmen } from '../../core/massnahmen.js'

const card = { background: 'var(--panel)', border: '1px solid var(--line)', borderRadius: 'var(--radius)', boxShadow: 'var(--shadow)' }
const cap = { fontSize: 11, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '.03em', fontWeight: 700 }

function Portfolio({ objekte, info, onDrill, schwellen, felder, quadrant, onQuadrant }) {
  const W = 720, H = 340, pad = 44
  const xs = objekte.map((o) => o.wachstum), ys = objekte.map((o) => o.db)
  const xMin = Math.min(-10, ...xs), xMax = Math.max(40, ...xs)
  const yMin = Math.min(15, ...ys) - 2, yMax = Math.max(50, ...ys) + 2
  const px = (x) => pad + (x - xMin) / (xMax - xMin) * (W - pad - 14)
  const py = (y) => H - pad - (y - yMin) / (yMax - yMin) * (H - pad - 14)
  const rmax = Math.max(...objekte.map((o) => o.umsatz), 1)
  const rad = (u) => 7 + Math.sqrt(u / rmax) * 26
  const x0 = px(schwellen.wachstum), y0 = py(schwellen.db)
  const li = pad, re = W - 14, ob = 14, un = H - pad
  // Bildschirm-Rechteck je Quadrant (für Tönung + Klickfläche).
  const rect = { star: [x0, ob, re, y0], cashcow: [li, ob, x0, y0], question: [x0, y0, re, un], dog: [li, y0, x0, un] }
  const von = (id) => felder.find((f) => f.id === id) || {}
  return (
    <svg viewBox={`0 0 ${W} ${H}`} style={{ width: '100%', height: 'auto' }}>
      {/* Quadranten-Felder: Tönung + anklickbar als Einstieg/Filter */}
      {Object.entries(rect).map(([id, [a, b, c, d]]) => {
        const f = von(id); const aktiv = quadrant === id
        return (
          <g key={id} onClick={onQuadrant ? () => onQuadrant(aktiv ? null : id) : undefined} style={{ cursor: onQuadrant ? 'pointer' : 'default' }}>
            <title>{`${f.name} — ${f.anzahl} Objekte, ${f.umsatz} Mio €${onQuadrant ? ' (klick: filtern)' : ''}`}</title>
            <rect x={a} y={b} width={c - a} height={d - b} fill={f.farbe} fillOpacity={aktiv ? 0.16 : 0.05} />
            {aktiv && <rect x={a} y={b} width={c - a} height={d - b} fill="none" stroke={f.farbe} strokeWidth="2" />}
            <text x={id === 'cashcow' || id === 'dog' ? a + 6 : c - 6} y={id === 'star' || id === 'cashcow' ? b + 15 : d - 8}
              textAnchor={id === 'cashcow' || id === 'dog' ? 'start' : 'end'} fontSize="11" fontWeight="700" fill={f.farbe} fillOpacity={aktiv ? 1 : 0.7} style={{ pointerEvents: 'none' }}>
              {f.name} ({f.anzahl})
            </text>
          </g>
        )
      })}
      <line x1={pad} y1={H - pad} x2={W - 10} y2={H - pad} stroke="var(--line)" />
      <line x1={pad} y1={14} x2={pad} y2={H - pad} stroke="var(--line)" />
      <line x1={x0} y1={14} x2={x0} y2={H - pad} stroke="var(--line)" strokeDasharray="4 4" />
      <line x1={pad} y1={y0} x2={W - 10} y2={y0} stroke="var(--line)" strokeDasharray="4 4" />
      <text x={x0 + 4} y={H - pad - 4} fontSize="10" fill="var(--muted)">Wachstum {schwellen.wachstum} %</text>
      <text x={pad + 4} y={y0 - 4} fontSize="10" fill="var(--muted)">DB {schwellen.db} %</text>
      <text x={W - 12} y={H - pad + 16} fontSize="10" fill="var(--muted)" textAnchor="end">Wachstum % →</text>
      <text x={pad - 6} y={20} fontSize="10" fill="var(--muted)" textAnchor="end">DB %</text>
      {objekte.map((o) => {
        const imQuad = !quadrant || quadrantVon(o, schwellen) === quadrant
        return (
          <g key={o.id} onClick={onDrill ? () => onDrill(o) : undefined} style={{ cursor: onDrill ? 'pointer' : 'default', opacity: imQuad ? 1 : 0.18 }}>
            <title>{onDrill ? `In die Detailliste springen (gefiltert auf „${o.gruppe || o.name}")` : o.name}</title>
            <circle cx={px(o.wachstum)} cy={py(o.db)} r={rad(o.umsatz)} fill={info(o.phase).farbe} fillOpacity="0.30" stroke={info(o.phase).farbe} />
            <text x={px(o.wachstum)} y={py(o.db) + 3} fontSize="10" textAnchor="middle" fill="var(--ink)" style={{ pointerEvents: 'none' }}>{o.name}</text>
          </g>
        )
      })}
    </svg>
  )
}

function QuadrantKacheln({ felder, quadrant, onQuadrant, onDrill }) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(165px, 1fr))', gap: 10, marginBottom: 14 }}>
      {felder.map((f) => {
        const aktiv = quadrant === f.id
        return (
          <div key={f.id} onClick={() => onQuadrant(aktiv ? null : f.id)} title={f.these}
            style={{ ...card, padding: '10px 12px', cursor: 'pointer', borderTop: `3px solid ${f.farbe}`,
              outline: aktiv ? `2px solid ${f.farbe}` : 'none', background: aktiv ? 'var(--bg)' : 'var(--panel)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: 6 }}>
              <span style={{ fontWeight: 700, fontSize: 13, color: f.farbe }}>{f.name}</span>
              <span style={{ fontSize: 10.5, color: 'var(--muted)' }}>{f.kurz}</span>
            </div>
            <div style={{ fontSize: 17, fontWeight: 700, marginTop: 2 }}>{f.umsatz} Mio €</div>
            <div style={{ fontSize: 11, color: 'var(--muted)' }}>{f.anzahl} Obj. · {f.anteil} % Umsatz · Ø DB {f.dbSchnitt} %</div>
            <div style={{ fontSize: 11, color: 'var(--slate)', marginTop: 4, lineHeight: 1.35 }}>{f.strategie}</div>
            {aktiv && onDrill && f.objekte.length > 0 && (
              <div style={{ marginTop: 6, display: 'flex', gap: 5, flexWrap: 'wrap' }}>
                {f.objekte.map((o) => (
                  <button key={o.id} onClick={(e) => { e.stopPropagation(); onDrill(o) }} title="In die Artikelliste springen (gefiltert)"
                    style={{ fontSize: 11, cursor: 'pointer', border: `1px solid ${f.farbe}`, color: f.farbe, background: 'var(--panel)', borderRadius: 999, padding: '1px 8px' }}>{o.name} →</button>
                ))}
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}

// Lebenszyklus-Kurve: Aufstieg → Peak → Abfall, Objekte als Blasen je Phase.
function PhasenKurve({ phasen, objekte, onDrill }) {
  const { profil, punkte } = phasenKurve(phasen, objekte)
  const n = phasen.length
  const W = 720, H = 300, padL = 40, padB = 48, padT = 18
  const px = (t) => padL + t * (W - padL - 14)
  const py = (h) => padT + (1 - h) * (H - padT - padB)
  const rmax = Math.max(...punkte.map((p) => p.umsatz), 1)
  const rad = (u) => 6 + Math.sqrt(u / rmax) * 22
  // Kurvenpunkte durch die Phasenmitten, an den Rändern leicht angesetzt.
  const stuetz = [[0, profil[0] * 0.55], ...profil.map((h, i) => [(i + 0.5) / n, h]), [1, profil[n - 1] * 0.8]]
  const pfad = stuetz.map(([t, h], i) => `${i ? 'L' : 'M'}${px(t).toFixed(1)},${py(h).toFixed(1)}`).join(' ')
  const flaeche = `${pfad} L${px(1).toFixed(1)},${py(0)} L${px(0).toFixed(1)},${py(0)} Z`
  return (
    <svg viewBox={`0 0 ${W} ${H}`} style={{ width: '100%', height: 'auto' }}>
      <line x1={padL} y1={py(0)} x2={W - 10} y2={py(0)} stroke="var(--line)" />
      {/* Phasenbänder + Beschriftung */}
      {phasen.map((p, i) => (
        <g key={p.id}>
          {i > 0 && <line x1={px(i / n)} y1={padT} x2={px(i / n)} y2={py(0)} stroke="var(--line)" strokeDasharray="3 4" />}
          <rect x={px(i / n)} y={padT} width={px((i + 1) / n) - px(i / n)} height={py(0) - padT} fill={p.farbe} fillOpacity="0.05" />
          <text x={px((i + 0.5) / n)} y={H - padB + 18} textAnchor="middle" fontSize="11" fontWeight="700" fill={p.farbe}>{p.name}</text>
        </g>
      ))}
      {/* Hüllkurve */}
      <path d={flaeche} fill="var(--accent)" fillOpacity="0.05" />
      <path d={pfad} fill="none" stroke="var(--accent)" strokeWidth="2" />
      {/* Objekte als Blasen */}
      {punkte.map((p) => (
        <g key={p.id} onClick={onDrill ? () => onDrill(p) : undefined} style={{ cursor: onDrill ? 'pointer' : 'default' }}>
          <title>{p.name} · {p.umsatz} Mio €{onDrill ? ' — in die Artikelliste springen' : ''}</title>
          <circle cx={px(p.x)} cy={py(p.hoehe)} r={rad(p.umsatz)} fill={p.farbe} fillOpacity="0.32" stroke={p.farbe} />
          <text x={px(p.x)} y={py(p.hoehe) - rad(p.umsatz) - 3} textAnchor="middle" fontSize="9.5" fill="var(--slate)" style={{ pointerEvents: 'none' }}>{p.name}</text>
        </g>
      ))}
      <text x={padL - 4} y={padT + 4} textAnchor="end" fontSize="10" fill="var(--muted)">Niveau</text>
      <text x={px((n - 0.5) / n)} y={H - padB + 30} textAnchor="middle" fontSize="9" fill="var(--muted)">Zeit →</text>
    </svg>
  )
}

const chipStyle = (aktiv) => ({ padding: '6px 13px', borderRadius: 999, fontSize: 13, cursor: 'pointer', fontWeight: 600,
  border: `1px solid ${aktiv ? 'var(--accent)' : 'var(--line)'}`, background: aktiv ? 'var(--accent)' : 'var(--panel)', color: aktiv ? '#fff' : 'var(--ink)' })
const badge = (farbe) => ({ fontSize: 11, fontWeight: 700, color: '#fff', background: farbe, padding: '1px 8px', borderRadius: 999 })

function PhasenKacheln({ vert }) {
  return (
    <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 14 }}>
      {vert.map((p) => (
        <div key={p.id} style={{ ...card, padding: '10px 13px', flex: 1, minWidth: 150, borderTop: `3px solid ${p.farbe}` }}>
          <div style={{ fontWeight: 700, fontSize: 13 }}>{p.name}</div>
          <div style={{ fontSize: 18, fontWeight: 700 }}>{p.umsatz} Mio €</div>
          <div style={{ fontSize: 11, color: 'var(--muted)' }}>{p.anzahl} · {p.anteil} % Umsatz</div>
        </div>
      ))}
    </div>
  )
}

// Nachfolger-Verkettung: validierte Matches verwalten + Vorschläge bestätigen.
function ProduktlinienPanel({ onChange }) {
  const [auf, setAuf] = useState(false)
  const namen = Object.fromEntries(produkte('artikel').map((a) => [a.id, a.name]))
  const matches = ladeMatches()
  const offen = offeneVorschlaege()
  const aendern = (fn) => { fn(); onChange() }
  return (
    <div style={{ ...card, padding: 14, marginBottom: 14, borderLeft: '3px solid var(--accent)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8, cursor: 'pointer' }} onClick={() => setAuf((v) => !v)}>
        <div style={cap}>⛓ Produktlinien & Nachfolger — {matches.length} validiert{offen.length ? `, ${offen.length} Vorschlag${offen.length > 1 ? '·e' : ''} offen` : ''}</div>
        <span style={{ color: 'var(--muted)' }}>{auf ? '▾' : '▸'}</span>
      </div>
      {auf && (
        <div style={{ marginTop: 10, display: 'grid', gap: 10 }}>
          <div style={{ fontSize: 12.5, color: 'var(--slate)', lineHeight: 1.5 }}>
            Bei einem Modellwechsel bekommt das Nachfolgemodell eine neue Artikelnummer. Einmal als Nachfolger
            <b> validiert</b>, bleibt die Zuordnung dauerhaft bestehen und beide Generationen werden zu einer
            durchgängigen Produktlinie kombiniert (Umsatz summiert, Lebenszyklus-Position des aktuellen Modells).
          </div>
          {matches.length > 0 && (
            <div>
              <div style={{ fontSize: 11, color: 'var(--muted)', textTransform: 'uppercase', fontWeight: 700, marginBottom: 4 }}>Validierte Linien</div>
              {matches.map((m) => (
                <div key={m.id} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '5px 0', borderBottom: '1px solid var(--line)', fontSize: 13 }}>
                  <span style={{ color: 'var(--amp-g)' }}>✓</span>
                  <span style={{ flex: 1 }}><b>{namen[m.vorgaenger] || m.vorgaenger}</b> → <b>{namen[m.nachfolger] || m.nachfolger}</b>
                    <span style={{ color: 'var(--muted)', fontSize: 11 }}> · {m.von}, {m.am}</span></span>
                  <button onClick={() => aendern(() => loeseMatch(m.id))} title="Validierung aufheben"
                    style={{ fontSize: 11, cursor: 'pointer', border: '1px solid var(--line)', background: 'var(--panel)', borderRadius: 999, padding: '1px 9px', color: 'var(--muted)' }}>aufheben</button>
                </div>
              ))}
            </div>
          )}
          {offen.length > 0 && (
            <div>
              <div style={{ fontSize: 11, color: 'var(--muted)', textTransform: 'uppercase', fontWeight: 700, marginBottom: 4 }}>Vorschläge (aus Stammdaten)</div>
              {offen.map((k) => (
                <div key={k.vorgaenger + k.nachfolger} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '5px 0', borderBottom: '1px solid var(--line)', fontSize: 13 }}>
                  <span style={{ color: 'var(--amp-a)' }}>?</span>
                  <span style={{ flex: 1 }}><b>{k.vName}</b> → <b>{k.nName}</b></span>
                  <button onClick={() => aendern(() => bestaetigeMatch({ vorgaenger: k.vorgaenger, nachfolger: k.nachfolger, von: 'Controller' }))}
                    style={{ fontSize: 11, cursor: 'pointer', border: '1px solid var(--accent)', background: 'var(--accent)', color: '#fff', borderRadius: 999, padding: '2px 10px', fontWeight: 600 }}>✓ als Nachfolger validieren</button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

function Produkte({ onDrill }) {
  const [ebene, setEbene] = useState('produkt')
  const [auf, setAuf] = useState({})
  const [quadrant, setQuadrant] = useState(null) // BCG-Feld als Filter/Einstieg
  const [sicht, setSicht] = useState('matrix')    // 'matrix' (BCG) | 'kurve' (Lebenszyklus)
  const [linienAn, setLinienAn] = useState(true)  // Nachfolger zu Produktlinien kombinieren
  const [, setMatchTick] = useState(0)            // Re-Render nach Match-Änderung
  const istArtikel = ebene === 'artikel'
  const alle = istArtikel && linienAn ? mitLinien() : produkte(ebene)
  const { schwellen, felder } = bcgFelder(alle)
  const objekte = quadrant ? alle.filter((o) => quadrantVon(o, schwellen) === quadrant) : alle
  const quadName = quadrant ? felder.find((f) => f.id === quadrant)?.name : null
  return (
    <>
      <div style={{ display: 'flex', gap: 8, marginBottom: 12, alignItems: 'center', flexWrap: 'wrap' }}>
        {[['produkt', 'Produktgruppe'], ['artikel', 'Artikel']].map(([id, n]) => (
          <button key={id} style={chipStyle(ebene === id)} onClick={() => { setEbene(id); setAuf({}); setQuadrant(null) }}>{n}</button>
        ))}
        {istArtikel && (
          <label title="Vorgänger-/Nachfolgemodelle (Modellwechsel) zu einer durchgängigen Produktlinie zusammenfassen"
            style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 13, cursor: 'pointer', marginLeft: 4 }}>
            <input type="checkbox" checked={linienAn} onChange={(e) => { setLinienAn(e.target.checked); setQuadrant(null) }} />
            ⛓ Nachfolger kombinieren
          </label>
        )}
      </div>
      {istArtikel && <ProduktlinienPanel onChange={() => { setMatchTick((t) => t + 1); setQuadrant(null) }} />}
      <PhasenKacheln vert={produktPhaseVerteilung(ebene)} />
      <div style={{ ...card, padding: 16, marginBottom: 14 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: 8, flexWrap: 'wrap', marginBottom: 8 }}>
          <div style={cap}>{sicht === 'matrix' ? 'Portfolio (BCG) — Wachstum × Deckungsbeitrag (Blasengröße = Umsatz)' : 'Lebenszyklus-Kurve — Einführung → Wachstum → Reife → Rückgang (Blasengröße = Umsatz)'}</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            {sicht === 'matrix' && quadrant && <button onClick={() => setQuadrant(null)} style={{ fontSize: 12, cursor: 'pointer', border: '1px solid var(--line)', background: 'var(--panel)', borderRadius: 999, padding: '2px 10px', color: 'var(--muted)' }}>Filter „{quadName}" ✕</button>}
            <div style={{ display: 'flex', border: '1px solid var(--line)', borderRadius: 'var(--radius-sm)', overflow: 'hidden' }}>
              {[['matrix', '▦ Matrix'], ['kurve', '◠ Kurve']].map(([id, lbl]) => (
                <button key={id} onClick={() => setSicht(id)} style={{ padding: '4px 10px', border: 'none', fontSize: 12, fontWeight: 600, cursor: 'pointer',
                  background: sicht === id ? 'var(--accent)' : 'var(--panel)', color: sicht === id ? '#fff' : 'var(--muted)' }}>{lbl}</button>
              ))}
            </div>
          </div>
        </div>
        {sicht === 'matrix' ? (
          <>
            <QuadrantKacheln felder={felder} quadrant={quadrant} onQuadrant={setQuadrant} onDrill={onDrill} />
            <Portfolio objekte={alle} info={produktPhaseInfo} onDrill={onDrill} schwellen={schwellen} felder={felder} quadrant={quadrant} onQuadrant={setQuadrant} />
            <div style={{ fontSize: 12, color: 'var(--accent)', marginTop: 6 }}>
              ↳ Quadrant anklicken: Portfolio + Liste auf das Feld (Stars / Cash Cows / Question Marks / Poor Dogs) eingrenzen.{onDrill ? ' Blase/Objekt anklicken: in die Artikelliste springen (gefiltert).' : ''}
            </div>
          </>
        ) : (
          <>
            <PhasenKurve phasen={PRODUKT_PHASEN} objekte={alle} onDrill={onDrill} />
            <div style={{ fontSize: 12, color: 'var(--accent)', marginTop: 6 }}>
              ↳ Klassische Lebenszyklus-Kurve: jedes Produkt sitzt in seiner Phase auf der Kurve (Größe = Umsatz).{onDrill ? ' Blase anklicken: in die Artikelliste springen.' : ''}
            </div>
          </>
        )}
        <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap', marginTop: 8 }}>
          {PRODUKT_PHASEN.map((p) => (
            <span key={p.id} style={{ fontSize: 12, display: 'inline-flex', alignItems: 'center', gap: 6 }}>
              <span style={{ width: 10, height: 10, borderRadius: '50%', background: p.farbe }} /><b>{p.name}</b> → {p.strategie}
            </span>
          ))}
        </div>
      </div>
      <div style={{ ...card, padding: 16 }}>
        <div style={{ ...cap, marginBottom: 10 }}>{ebene === 'produkt' ? 'Produktgruppen' : 'Artikel'} ({objekte.length}){quadName ? ` · Feld „${quadName}"` : ''}</div>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
          <thead><tr>{['', 'Name', 'Umsatz', 'DB %', 'Wachstum', 'Margentrend', 'Phase', 'Normstrategie'].map((h, i) => (
            <th key={i} style={{ textAlign: i >= 2 && i <= 5 ? 'right' : 'left', padding: '6px 10px', borderBottom: '1px solid var(--line)', fontSize: 11, color: 'var(--muted)', textTransform: 'uppercase' }}>{h}</th>
          ))}</tr></thead>
          <tbody>
            {objekte.map((o) => {
              const drill = ebene === 'produkt'; const offen = !!auf[o.id]
              const kids = drill && offen ? kinderProdukt(o.id) : []
              const zeile = (x, sub) => (
                <tr key={x.id} style={sub ? { background: 'var(--bg)' } : { cursor: drill ? 'pointer' : 'default' }} onClick={!sub && drill ? () => setAuf((a) => ({ ...a, [o.id]: !a[o.id] })) : undefined}>
                  <td style={{ padding: '5px 10px', borderBottom: '1px solid var(--line)', color: 'var(--muted)', width: 18 }}>{sub ? '' : drill ? (offen ? '▾' : '▸') : ''}</td>
                  <td style={{ padding: sub ? '5px 10px 5px 24px' : '6px 10px', borderBottom: '1px solid var(--line)', fontWeight: sub ? 400 : 600, fontSize: sub ? 12.5 : 13 }}>{sub ? '↳ ' : ''}{x.name}
                    {x.kombiniert && <span title={`Produktlinie aus ${x.members.length} Generationen: ${x.members.map((m) => m.name).join(' → ')}`}
                      style={{ marginLeft: 6, fontSize: 11, color: 'var(--accent)', border: '1px solid var(--accent)', borderRadius: 999, padding: '0 7px', fontWeight: 600, whiteSpace: 'nowrap' }}>⛓ {x.members.length} Gen.</span>}
                  </td>
                  <td className="mono" style={{ textAlign: 'right', padding: '5px 10px', borderBottom: '1px solid var(--line)' }}>{x.umsatz.toFixed(1)}</td>
                  <td className="mono" style={{ textAlign: 'right', padding: '5px 10px', borderBottom: '1px solid var(--line)' }}>{x.db}</td>
                  <td className="mono" style={{ textAlign: 'right', padding: '5px 10px', borderBottom: '1px solid var(--line)', color: x.wachstum < 0 ? 'var(--amp-r)' : x.wachstum >= 6 ? 'var(--amp-g)' : 'var(--ink)' }}>{x.wachstum > 0 ? '+' : ''}{x.wachstum} %</td>
                  <td className="mono" style={{ textAlign: 'right', padding: '5px 10px', borderBottom: '1px solid var(--line)', color: x.dbTrend < 0 ? 'var(--amp-r)' : 'var(--muted)' }}>{x.dbTrend > 0 ? '+' : ''}{x.dbTrend}</td>
                  <td style={{ padding: '5px 10px', borderBottom: '1px solid var(--line)' }}><span style={badge(produktPhaseInfo(x.phase).farbe)}>{produktPhaseInfo(x.phase).name}</span></td>
                  <td style={{ padding: '5px 10px', borderBottom: '1px solid var(--line)', fontSize: 12, color: 'var(--slate)' }}>
                    {produktPhaseInfo(x.phase).strategie}
                    {onDrill && <button onClick={(e) => { e.stopPropagation(); onDrill(sub ? { name: x.name } : x) }} title="In die Artikelliste springen (gefiltert)"
                      style={{ marginLeft: 8, fontSize: 11, cursor: 'pointer', border: '1px solid var(--accent)', color: 'var(--accent)', background: 'var(--panel)', borderRadius: 999, padding: '1px 8px', whiteSpace: 'nowrap' }}>→ Details</button>}
                  </td>
                </tr>
              )
              return <React.Fragment key={o.id}>{zeile(o, false)}{kids.map((k) => zeile(k, true))}</React.Fragment>
            })}
          </tbody>
        </table>
        {ebene === 'produkt' && <div style={{ fontSize: 12, color: 'var(--muted)', marginTop: 8 }}>Zeile anklicken: Artikel der Produktgruppe aufklappen.</div>}
      </div>
    </>
  )
}

function Kunden() {
  const [, setTick] = useState(0)
  const liste = kunden()
  const massn = ladeMassnahmen()
  const hat = (id) => massn.some((m) => m.kundeId === id)
  function massnahme(k) {
    const p = kundePhaseInfo(k.phase)
    addMassnahme({ titel: `${p.name}: ${k.name} — ${p.empfehlung}`, owner: 'Vertrieb', quelle: 'kunde-lebenszyklus', kundeId: k.id, bereich: 'VK', hebel: 'Kundenbindung',
      relevanz: `Kunde in Phase „${p.name}" (Umsatz ${k.umsatz} Mio €, Wachstum ${k.wachstum} %).` })
    setTick((t) => t + 1)
  }
  return (
    <>
      <PhasenKacheln vert={kundePhaseVerteilung()} />
      <div style={{ ...card, padding: 16, marginBottom: 14 }}>
        <div style={{ ...cap, marginBottom: 8 }}>Beziehungs-Lebenszyklus — Akquise → Entwicklung → Bestand → Gefährdet → Verloren (Blasengröße = Umsatz)</div>
        <PhasenKurve phasen={KUNDE_PHASEN} objekte={liste} />
        <div style={{ fontSize: 12, color: 'var(--muted)', marginTop: 6 }}>Jeder Kunde sitzt in seiner Beziehungsphase auf der Kurve — Spätphasen (gefährdet/verloren) brauchen Rückgewinnung.</div>
      </div>
      <div style={{ ...card, padding: 16 }}>
        <div style={{ ...cap, marginBottom: 10 }}>Kunden ({liste.length}) — Beziehungsphasen</div>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
          <thead><tr>{['Kunde', 'Umsatz', 'DB %', 'Wachstum', 'Letzte Best.', 'Phase', 'Empfehlung', ''].map((h, i) => (
            <th key={i} style={{ textAlign: i >= 1 && i <= 4 ? 'right' : 'left', padding: '6px 10px', borderBottom: '1px solid var(--line)', fontSize: 11, color: 'var(--muted)', textTransform: 'uppercase' }}>{h}</th>
          ))}</tr></thead>
          <tbody>
            {liste.map((k) => {
              const p = kundePhaseInfo(k.phase); const risiko = k.phase === 'gefaehrdet' || k.phase === 'verloren'
              return (
                <tr key={k.id}>
                  <td style={{ padding: '6px 10px', borderBottom: '1px solid var(--line)', fontWeight: 600 }}>{k.name}</td>
                  <td className="mono" style={{ textAlign: 'right', padding: '6px 10px', borderBottom: '1px solid var(--line)' }}>{k.umsatz.toFixed(1)}</td>
                  <td className="mono" style={{ textAlign: 'right', padding: '6px 10px', borderBottom: '1px solid var(--line)' }}>{k.db}</td>
                  <td className="mono" style={{ textAlign: 'right', padding: '6px 10px', borderBottom: '1px solid var(--line)', color: k.wachstum < 0 ? 'var(--amp-r)' : k.wachstum >= 10 ? 'var(--amp-g)' : 'var(--ink)' }}>{k.wachstum > 0 ? '+' : ''}{k.wachstum} %</td>
                  <td className="mono" style={{ textAlign: 'right', padding: '6px 10px', borderBottom: '1px solid var(--line)', color: k.letzteBestellungTage > 180 ? 'var(--amp-r)' : 'var(--muted)' }}>{k.letzteBestellungTage} Tg</td>
                  <td style={{ padding: '6px 10px', borderBottom: '1px solid var(--line)' }}><span style={badge(p.farbe)}>{p.name}</span></td>
                  <td style={{ padding: '6px 10px', borderBottom: '1px solid var(--line)', fontSize: 12, color: 'var(--slate)' }}>{p.empfehlung}</td>
                  <td style={{ padding: '6px 10px', borderBottom: '1px solid var(--line)', textAlign: 'right' }}>
                    {risiko && (hat(k.id)
                      ? <span style={{ fontSize: 12, color: 'var(--amp-g)' }}>✓ Maßnahme</span>
                      : <button onClick={() => massnahme(k)} style={{ fontSize: 12, cursor: 'pointer', border: '1px solid var(--accent)', color: 'var(--accent)', background: 'var(--panel)', borderRadius: 999, padding: '3px 10px' }}>→ Maßnahme</button>)}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </>
  )
}

export default function Lebenszyklus({ onDrill }) {
  const [tab, setTab] = useState('produkt')
  return (
    <div style={{ maxWidth: '100%', margin: '0 auto' }}>
      <div style={{ marginBottom: 14 }}>
        <h2 style={{ margin: '0 0 4px' }}>Lebenszyklus &amp; Portfolio</h2>
        <div style={{ color: 'var(--muted)', fontSize: 13, maxWidth: 760 }}>
          Zwei getrennte Sichten: der <b>Produkt-Lebenszyklus</b> (Einführung→Wachstum→Reife→Rückgang mit Normstrategie)
          und der <b>Kunden-Lebenszyklus</b> (Akquise→Entwicklung→Bestand→gefährdet→verloren). Ein Kunde durchläuft
          bewusst keinen Produkt-Lebenszyklus.
        </div>
        <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
          <button style={chipStyle(tab === 'produkt')} onClick={() => setTab('produkt')}>Produkte</button>
          <button style={chipStyle(tab === 'kunde')} onClick={() => setTab('kunde')}>Kunden</button>
        </div>
      </div>
      {tab === 'produkt' ? <Produkte onDrill={onDrill} /> : <Kunden />}
    </div>
  )
}
