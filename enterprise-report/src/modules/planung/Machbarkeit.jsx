// =========================================================================
//  MACHBARKEIT / DURCHLAUFZEIT — „menge Räder bauen, wie lange?" Verfügbarer
//  Bestand (− Reservierung), Fehlmengen, deren Beschaffungszeit, kritischer
//  Pfad + Produktionszeit + Puffer = Gesamtdurchlaufzeit. Mit Timeline.
// =========================================================================
import React, { useState } from 'react'
import { ARTIKEL_BASIS, STUECKLISTE, machbarkeit, fmtDatum, REAKTION_STD, HEUTE } from '../../core/beschaffung.js'

const card = { background: 'var(--panel)', border: '1px solid var(--line)', borderRadius: 'var(--radius)', boxShadow: 'var(--shadow)' }
const cap = { fontSize: 11, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '.04em', fontWeight: 700 }
const feld = { padding: '6px 8px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--line)', font: 'inherit', fontSize: 13, background: 'var(--panel)', color: 'var(--ink)' }

function Timeline({ m }) {
  const total = Math.max(1, m.gesamtTage)
  const pct = (tage) => `${(tage / total) * 100}%`
  const balken = m.positionen.filter((p) => p.fehl > 0).map((p) => ({ label: p.komponente?.name || p.id, von: 0, bis: p.beschaffungTage, farbe: p.id === m.kritKomponente?.id ? 'var(--amp-r)' : 'var(--accent)' }))
  balken.push({ label: `Produktion (${m.menge} Räder)`, von: m.kritBeschaffungTage, bis: m.kritBeschaffungTage + m.produktionsTage, farbe: '#7c3aed' })
  balken.push({ label: 'Puffer', von: m.gesamtTage - m.puffer, bis: m.gesamtTage, farbe: 'var(--amp-a)' })
  return (
    <div style={{ ...card, padding: 14 }}>
      <div style={{ ...cap, marginBottom: 10 }}>Ablauf (heute → fertig) — kritischer Pfad rot, Produktion violett</div>
      <div style={{ display: 'grid', gap: 6 }}>
        {balken.map((b, i) => (
          <div key={i} style={{ display: 'grid', gridTemplateColumns: '180px 1fr', gap: 8, alignItems: 'center' }}>
            <div style={{ fontSize: 12, textAlign: 'right', color: 'var(--slate)' }}>{b.label}</div>
            <div style={{ position: 'relative', height: 18, background: 'var(--bg)', borderRadius: 4 }}>
              <div style={{ position: 'absolute', left: pct(b.von), width: pct(b.bis - b.von), height: '100%', background: b.farbe, borderRadius: 4, minWidth: 2 }} title={`${b.bis - b.von} Tage`} />
            </div>
          </div>
        ))}
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: 'var(--muted)', marginTop: 6, paddingLeft: 188 }}>
        <span>heute · {fmtDatum(HEUTE)}</span><span>fertig · {fmtDatum(m.fertigDatum)} ({m.gesamtTage} Tage)</span>
      </div>
    </div>
  )
}

export default function Machbarkeit() {
  const raeder = ARTIKEL_BASIS.filter((a) => STUECKLISTE[a.id])
  const [bikeId, setBikeId] = useState(raeder[0]?.id || 'ebike-city')
  const [menge, setMenge] = useState(50)
  const [puffer, setPuffer] = useState(7)
  const [reaktion, setReaktion] = useState(REAKTION_STD)
  const m = machbarkeit(bikeId, Number(menge) || 0, { puffer: Number(puffer) || 0, reaktion: Number(reaktion) || 0 })
  if (!m) return <div style={{ padding: 16 }}>Für diesen Artikel ist keine Stückliste hinterlegt.</div>

  return (
    <div style={{ display: 'grid', gap: 14 }}>
      <div style={{ ...card, padding: 14, display: 'flex', gap: 14, flexWrap: 'wrap', alignItems: 'flex-end' }}>
        <label style={{ fontSize: 12, color: 'var(--muted)' }}>Rad<br /><select value={bikeId} onChange={(e) => setBikeId(e.target.value)} style={{ ...feld, marginTop: 3, minWidth: 180 }}>{raeder.map((a) => <option key={a.id} value={a.id}>{a.name}</option>)}</select></label>
        <label style={{ fontSize: 12, color: 'var(--muted)' }}>Menge (Stück)<br /><input type="number" value={menge} onChange={(e) => setMenge(e.target.value)} style={{ ...feld, marginTop: 3, width: 100 }} /></label>
        <label style={{ fontSize: 12, color: 'var(--muted)' }}>Puffer (Tg)<br /><input type="number" value={puffer} onChange={(e) => setPuffer(e.target.value)} style={{ ...feld, marginTop: 3, width: 80 }} /></label>
        <label style={{ fontSize: 12, color: 'var(--muted)' }}>Reaktion (Tg)<br /><input type="number" value={reaktion} onChange={(e) => setReaktion(e.target.value)} style={{ ...feld, marginTop: 3, width: 80 }} /></label>
        <div style={{ fontSize: 11.5, color: 'var(--muted)', flex: 1, minWidth: 150 }}>Montagekapazität {m.kapazitaetProTag} Räder/Tag + {m.ruest} Tg Rüsten</div>
      </div>

      {/* Ergebnis-Banner */}
      <div style={{ ...card, padding: '14px 16px', borderLeft: `5px solid ${m.fehlteile ? 'var(--amp-a)' : 'var(--amp-g)'}` }}>
        <div style={{ fontSize: 16, fontWeight: 700 }}>{m.menge} × {m.bike.name} fertig in <span style={{ color: 'var(--accent)' }}>{m.gesamtTage} Tagen</span> — am {fmtDatum(m.fertigDatum)}</div>
        <div style={{ fontSize: 13, color: 'var(--slate)', marginTop: 4 }}>
          {m.kritBeschaffungTage > 0
            ? <>Kritisch: <b>{m.kritKomponente?.komponente?.name}</b> ({m.kritBeschaffungTage} Tg Beschaffung) → Produktion {m.produktionsTage} Tg → Puffer {m.puffer} Tg. <b>{m.fehlteile}</b> Komponenten müssen beschafft werden.</>
            : <>Alle Komponenten auf Lager — nur Produktion {m.produktionsTage} Tg + Puffer {m.puffer} Tg.</>}
        </div>
      </div>

      <Timeline m={m} />

      {/* Verfügbarkeit je Komponente */}
      <div style={{ ...card, overflow: 'auto' }}>
        <div style={{ ...cap, padding: '10px 12px 0' }}>Komponenten-Verfügbarkeit (Bestand − reserviert)</div>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12.5, marginTop: 8 }}>
          <thead><tr>{['Komponente', 'Fach', 'Benötigt', 'Bestand', 'Reserviert', 'Verfügbar', 'Fehlmenge', 'Lieferzeit', 'Beschaffung'].map((h, i) => <th key={i} style={{ textAlign: i === 0 ? 'left' : 'right', padding: '6px 9px', borderBottom: '2px solid var(--line)', fontSize: 10, color: 'var(--muted)', textTransform: 'uppercase' }}>{h}</th>)}</tr></thead>
          <tbody>
            {m.positionen.map((p) => {
              const krit = p.id === m.kritKomponente?.id
              return (
                <tr key={p.id} style={{ background: krit ? 'var(--accent-soft)' : 'transparent' }}>
                  <td style={{ padding: '6px 9px', borderBottom: '1px solid var(--line)', fontWeight: krit ? 700 : 500 }}>{krit ? '🔴 ' : ''}{p.komponente?.name || p.id}</td>
                  <td style={{ padding: '6px 9px', borderBottom: '1px solid var(--line)', textAlign: 'right' }} className="mono">{p.fach}</td>
                  <td style={{ padding: '6px 9px', borderBottom: '1px solid var(--line)', textAlign: 'right' }} className="mono">{p.benoetigt}</td>
                  <td style={{ padding: '6px 9px', borderBottom: '1px solid var(--line)', textAlign: 'right' }} className="mono">{p.bestand}</td>
                  <td style={{ padding: '6px 9px', borderBottom: '1px solid var(--line)', textAlign: 'right', color: 'var(--muted)' }} className="mono">−{p.reserviert}</td>
                  <td style={{ padding: '6px 9px', borderBottom: '1px solid var(--line)', textAlign: 'right', fontWeight: 700 }} className="mono">{p.verfuegbar}</td>
                  <td style={{ padding: '6px 9px', borderBottom: '1px solid var(--line)', textAlign: 'right', color: p.fehl > 0 ? 'var(--amp-r)' : 'var(--amp-g)', fontWeight: 700 }} className="mono">{p.fehl > 0 ? p.fehl : '✓ 0'}</td>
                  <td style={{ padding: '6px 9px', borderBottom: '1px solid var(--line)', textAlign: 'right' }} className="mono">{p.lieferzeit} Tg</td>
                  <td style={{ padding: '6px 9px', borderBottom: '1px solid var(--line)', textAlign: 'right' }} className="mono">{p.beschaffungTage > 0 ? p.beschaffungTage + ' Tg' : 'aus Lager'}</td>
                </tr>
              )
            })}
          </tbody>
        </table>
        <div style={{ fontSize: 11.5, color: 'var(--muted)', padding: '6px 12px 10px' }}>Reservierte Mengen sind für andere Aufträge gebunden und zählen nicht zur Verfügbarkeit. Der <b>kritische Pfad</b> (🔴) bestimmt die Gesamtbeschaffungszeit.</div>
      </div>
    </div>
  )
}
