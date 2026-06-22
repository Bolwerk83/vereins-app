// =========================================================================
//  WMS (operativ) — Tagesgeschäft im Lager: Lagerplätze, Wareneingang
//  (Einlagern), Kommissionierung (Picken), Umlagern und Bewegungsprotokoll.
//  Buchungen wirken sofort auf den Bestand.
// =========================================================================
import React, { useState } from 'react'
import {
  ZONEN, PLAETZE, ARTIKEL, artikelName, platzBelegung, bestandJeArtikel, bewegungen,
  einlagern, picken, umlagern, pickVorschlag, freieKapazitaet, kennzahlen, reset
} from '../../core/wms.js'

const card = { background: 'var(--panel)', border: '1px solid var(--line)', borderRadius: 'var(--radius)', boxShadow: 'var(--shadow)' }
const cap = { fontSize: 11, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '.03em', fontWeight: 700 }
const inp = { padding: '8px 10px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--line)', font: 'inherit', fontSize: 13 }
const btn = { padding: '8px 14px', borderRadius: 'var(--radius-sm)', border: 'none', background: 'var(--accent)', color: '#fff', cursor: 'pointer', fontSize: 13, fontWeight: 600 }
const th = (al) => ({ textAlign: al, padding: '6px 9px', borderBottom: '2px solid var(--line)', fontSize: 10, color: 'var(--muted)', textTransform: 'uppercase' })
const td = (al, bold) => ({ textAlign: al, padding: '6px 9px', borderBottom: '1px solid var(--line)', fontWeight: bold ? 700 : 400 })
const ampel = (a) => (a >= 90 ? 'var(--amp-r)' : a >= 60 ? 'var(--amp-a)' : 'var(--amp-g)')

export default function WMS() {
  const [tab, setTab] = useState('plaetze')
  const [, setTick] = useState(0)
  const [meld, setMeld] = useState(null)
  const refresh = () => setTick((t) => t + 1)
  const zeige = (r, okText) => { setMeld(r.ok ? { ok: true, text: okText } : { ok: false, text: r.fehler }); if (r.ok) refresh(); setTimeout(() => setMeld(null), 3500) }

  const k = kennzahlen()

  return (
    <div style={{ maxWidth: 1040, margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12, flexWrap: 'wrap', marginBottom: 14 }}>
        <div>
          <h2 style={{ margin: '0 0 4px' }}>WMS — operatives Lager</h2>
          <div style={{ color: 'var(--muted)', fontSize: 13, maxWidth: 680 }}>
            Tagesgeschäft: Lagerplätze, Wareneingang, Kommissionierung, Umlagern. Jede Buchung verändert den Bestand
            sofort und landet im Protokoll.
          </div>
        </div>
        <button onClick={() => { if (confirm('Lager auf Ausgangszustand zurücksetzen?')) { reset(); refresh() } }}
          style={{ ...inp, cursor: 'pointer', color: 'var(--muted)' }}>↺ Demo zurücksetzen</button>
      </div>

      {/* KPIs */}
      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 14 }}>
        <Kpi label="Plätze belegt" wert={`${k.belegte}/${k.plaetzeGesamt}`} />
        <Kpi label="Mengen-Auslastung" wert={`${k.auslastung} %`} farbe={ampel(k.auslastung)} />
        <Kpi label="Artikel im Lager" wert={k.artikelImLager} />
        <Kpi label="Stück gesamt" wert={k.mengeGesamt.toLocaleString('de-DE')} />
        <Kpi label="Bewegungen heute" wert={k.bewegungenHeute} farbe="var(--accent)" />
      </div>

      {meld && (
        <div style={{ marginBottom: 12, padding: '9px 12px', borderRadius: 'var(--radius-sm)', fontSize: 13, fontWeight: 600,
          background: meld.ok ? 'var(--amp-g-soft)' : 'var(--amp-r-soft)', color: meld.ok ? 'var(--amp-g)' : 'var(--amp-r)' }}>
          {meld.ok ? '✓ ' : '⚠ '}{meld.text}
        </div>
      )}

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 6, marginBottom: 12, flexWrap: 'wrap' }}>
        {[['plaetze', '🗄 Lagerplätze'], ['eingang', '📥 Wareneingang'], ['picken', '📤 Kommissionierung'], ['umlagern', '🔀 Umlagern'], ['bewegungen', '📜 Bewegungen']].map(([id, n]) => (
          <button key={id} onClick={() => setTab(id)} style={{ padding: '7px 13px', borderRadius: 'var(--radius-sm)', cursor: 'pointer', fontSize: 13, fontWeight: 600,
            border: `1px solid ${tab === id ? 'var(--accent)' : 'var(--line)'}`, background: tab === id ? 'var(--accent)' : 'var(--panel)', color: tab === id ? '#fff' : 'var(--ink)' }}>{n}</button>
        ))}
      </div>

      {tab === 'plaetze' && <Plaetze />}
      {tab === 'eingang' && <Eingang onDone={zeige} />}
      {tab === 'picken' && <Picken onDone={zeige} />}
      {tab === 'umlagern' && <Umlagern onDone={zeige} />}
      {tab === 'bewegungen' && <Bewegungen />}
    </div>
  )
}

function Plaetze() {
  const bel = platzBelegung()
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      {ZONEN.map((z) => (
        <div key={z.z} style={{ ...card, padding: 14 }}>
          <div style={{ ...cap, marginBottom: 10 }}>Zone {z.z} · {z.name} <span style={{ color: 'var(--muted)', fontWeight: 400, textTransform: 'none' }}>· {z.kapazitaet} Stk/Platz</span></div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: 8 }}>
            {bel.filter((p) => p.zone === z.z).map((p) => (
              <div key={p.id} style={{ border: '1px solid var(--line)', borderRadius: 'var(--radius-sm)', padding: '8px 10px', background: p.menge ? 'var(--panel)' : 'var(--bg)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span className="mono" style={{ fontWeight: 700, fontSize: 12.5 }}>{p.id}</span>
                  <span style={{ fontSize: 10.5, color: ampel(p.auslastung) }}>{p.auslastung}%</span>
                </div>
                <div style={{ height: 5, background: 'var(--bg)', borderRadius: 3, overflow: 'hidden', margin: '5px 0' }}>
                  <div style={{ width: `${p.auslastung}%`, height: '100%', background: ampel(p.auslastung) }} />
                </div>
                {p.positionen.length === 0 && <div style={{ fontSize: 11, color: 'var(--muted)' }}>frei</div>}
                {p.positionen.map((x) => (
                  <div key={x.sku} style={{ fontSize: 11.5, display: 'flex', justifyContent: 'space-between' }}>
                    <span>{artikelName(x.sku)}</span><span className="mono">{x.menge}</span>
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}

function ArtikelSelect({ value, onChange }) {
  return <select value={value} onChange={(e) => onChange(e.target.value)} style={inp}>
    {ARTIKEL.map((a) => <option key={a.sku} value={a.sku}>{a.name} ({a.sku})</option>)}
  </select>
}

function Eingang({ onDone }) {
  const [sku, setSku] = useState(ARTIKEL[0].sku)
  const [menge, setMenge] = useState('')
  const [platz, setPlatz] = useState(PLAETZE[0].id)
  return (
    <div style={{ ...card, padding: 16, maxWidth: 560 }}>
      <div style={{ ...cap, marginBottom: 10 }}>Wareneingang buchen (Einlagern)</div>
      <div style={{ display: 'grid', gap: 10 }}>
        <label style={{ fontSize: 12, color: 'var(--muted)' }}>Artikel<br /><ArtikelSelect value={sku} onChange={setSku} /></label>
        <label style={{ fontSize: 12, color: 'var(--muted)' }}>Menge<br /><input style={inp} type="number" value={menge} onChange={(e) => setMenge(e.target.value)} placeholder="Stück" /></label>
        <label style={{ fontSize: 12, color: 'var(--muted)' }}>Ziel-Lagerplatz<br />
          <select value={platz} onChange={(e) => setPlatz(e.target.value)} style={inp}>
            {PLAETZE.map((p) => <option key={p.id} value={p.id}>{p.id} (frei: {freieKapazitaet(p.id)})</option>)}
          </select>
        </label>
        <button style={btn} onClick={() => onDone(einlagern(sku, menge, platz, 'WE', 'WMS'), `${menge} × ${artikelName(sku)} auf ${platz} eingelagert.`)}>📥 Einlagern</button>
      </div>
    </div>
  )
}

function Picken({ onDone }) {
  const [sku, setSku] = useState(ARTIKEL[0].sku)
  const [menge, setMenge] = useState('')
  const v = menge > 0 ? pickVorschlag(sku, Number(menge)) : null
  function ausfuehren() {
    if (!v || !v.machbar) return
    let last = { ok: true }
    for (const p of v.picks) { last = picken(sku, p.menge, p.platz, 'KOM', 'WMS'); if (!last.ok) break }
    onDone(last, `${menge} × ${artikelName(sku)} kommissioniert.`)
    if (last.ok) setMenge('')
  }
  return (
    <div style={{ ...card, padding: 16, maxWidth: 560 }}>
      <div style={{ ...cap, marginBottom: 10 }}>Kommissionieren (Picken) — mit Platzvorschlag</div>
      <div style={{ display: 'grid', gap: 10 }}>
        <label style={{ fontSize: 12, color: 'var(--muted)' }}>Artikel<br /><ArtikelSelect value={sku} onChange={setSku} /></label>
        <label style={{ fontSize: 12, color: 'var(--muted)' }}>Menge<br /><input style={inp} type="number" value={menge} onChange={(e) => setMenge(e.target.value)} placeholder="Stück" /></label>
        {v && (
          <div style={{ border: '1px solid var(--line)', borderRadius: 'var(--radius-sm)', padding: 10, background: 'var(--bg)' }}>
            <div style={{ fontSize: 11, color: 'var(--muted)', marginBottom: 5 }}>Pick-Vorschlag</div>
            {v.picks.map((p) => <div key={p.platz} style={{ fontSize: 13, display: 'flex', justifyContent: 'space-between' }}><span className="mono">{p.platz}</span><span>{p.menge} Stk</span></div>)}
            {!v.machbar && <div style={{ fontSize: 12.5, color: 'var(--amp-r)', marginTop: 5 }}>Nicht genug Bestand — Fehlmenge {v.fehlmenge}.</div>}
          </div>
        )}
        <button style={{ ...btn, opacity: v && v.machbar ? 1 : 0.5, cursor: v && v.machbar ? 'pointer' : 'not-allowed' }} disabled={!v || !v.machbar} onClick={ausfuehren}>📤 Kommissionieren</button>
      </div>
    </div>
  )
}

function Umlagern({ onDone }) {
  const [sku, setSku] = useState(ARTIKEL[0].sku)
  const [menge, setMenge] = useState('')
  const quellen = bestandJeArtikel().find((a) => a.sku === sku)?.plaetze || []
  const [von, setVon] = useState(quellen[0]?.platz || '')
  const [nach, setNach] = useState('')
  // Quelle aktualisieren, wenn Artikel wechselt
  React.useEffect(() => { const q = bestandJeArtikel().find((a) => a.sku === sku)?.plaetze || []; setVon(q[0]?.platz || '') }, [sku])
  return (
    <div style={{ ...card, padding: 16, maxWidth: 560 }}>
      <div style={{ ...cap, marginBottom: 10 }}>Umlagern zwischen Plätzen</div>
      <div style={{ display: 'grid', gap: 10 }}>
        <label style={{ fontSize: 12, color: 'var(--muted)' }}>Artikel<br /><ArtikelSelect value={sku} onChange={setSku} /></label>
        <label style={{ fontSize: 12, color: 'var(--muted)' }}>Von Platz<br />
          <select value={von} onChange={(e) => setVon(e.target.value)} style={inp}>
            {quellen.length === 0 && <option value="">— kein Bestand —</option>}
            {quellen.map((q) => <option key={q.platz} value={q.platz}>{q.platz} (Bestand: {q.menge})</option>)}
          </select>
        </label>
        <label style={{ fontSize: 12, color: 'var(--muted)' }}>Menge<br /><input style={inp} type="number" value={menge} onChange={(e) => setMenge(e.target.value)} /></label>
        <label style={{ fontSize: 12, color: 'var(--muted)' }}>Nach Platz<br />
          <select value={nach} onChange={(e) => setNach(e.target.value)} style={inp}>
            <option value="">— Zielplatz wählen —</option>
            {PLAETZE.filter((p) => p.id !== von).map((p) => <option key={p.id} value={p.id}>{p.id} (frei: {freieKapazitaet(p.id)})</option>)}
          </select>
        </label>
        <button style={btn} onClick={() => onDone(umlagern(sku, menge, von, nach, 'WMS'), `${menge} × ${artikelName(sku)} von ${von} nach ${nach} umgelagert.`)}>🔀 Umlagern</button>
      </div>
    </div>
  )
}

function Bewegungen() {
  const log = bewegungen()
  const farbe = { einlagerung: 'var(--amp-g)', kommissionierung: 'var(--amp-a)', umlagerung: 'var(--accent)' }
  return (
    <div style={{ ...card, padding: 16, overflowX: 'auto' }}>
      <div style={{ ...cap, marginBottom: 10 }}>Bewegungsprotokoll ({log.length})</div>
      {log.length === 0 && <div style={{ fontSize: 13, color: 'var(--muted)' }}>Noch keine Buchungen.</div>}
      {log.length > 0 && (
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12.5, minWidth: 640 }}>
          <thead><tr>{['Zeit', 'Typ', 'Artikel', 'Menge', 'Von', 'Nach', 'Ref'].map((h, i) => <th key={i} style={th(i === 3 ? 'right' : 'left')}>{h}</th>)}</tr></thead>
          <tbody>
            {log.slice(0, 80).map((b) => (
              <tr key={b.id}>
                <td className="mono" style={{ ...td('left'), color: 'var(--muted)', whiteSpace: 'nowrap' }}>{new Date(b.zeit).toLocaleString('de-DE', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })}</td>
                <td style={td('left')}><span style={{ fontSize: 11, fontWeight: 700, color: '#fff', background: farbe[b.typ] || 'var(--muted)', padding: '2px 7px', borderRadius: 999 }}>{b.typ}</span></td>
                <td style={td('left')}>{artikelName(b.sku)}</td>
                <td className="mono" style={td('right', true)}>{b.menge}</td>
                <td className="mono" style={td('left')}>{b.vonPlatz || '—'}</td>
                <td className="mono" style={td('left')}>{b.nachPlatz || '—'}</td>
                <td style={{ ...td('left'), color: 'var(--muted)' }}>{b.ref || ''}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  )
}

function Kpi({ label, wert, farbe }) {
  return <div style={{ ...card, padding: '10px 13px', flex: 1, minWidth: 130 }}>
    <div style={cap}>{label}</div>
    <div style={{ fontSize: 20, fontWeight: 700, color: farbe || 'var(--ink)' }}>{wert}</div>
  </div>
}
