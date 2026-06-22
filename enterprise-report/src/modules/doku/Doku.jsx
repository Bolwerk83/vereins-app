// =========================================================================
//  ANWENDER-DOKU / WISSEN — Nachschlagewerk. Links Kategorien + Suche,
//  rechts die Artikel mit Erklärung, Stichpunkten und Sprung in den Bericht.
// =========================================================================
import React, { useState, useMemo } from 'react'
import { KATEGORIEN, DOKU, sucheDoku } from '../../core/doku.js'

const card = { background: 'var(--panel)', border: '1px solid var(--line)', borderRadius: 'var(--radius)', boxShadow: 'var(--shadow)' }
const cap = { fontSize: 11, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '.03em', fontWeight: 700 }

export default function Doku({ onGeh }) {
  const [q, setQ] = useState('')
  const [kat, setKat] = useState('alle')

  const treffer = useMemo(() => {
    let list = sucheDoku(q)
    if (kat !== 'alle') list = list.filter((d) => d.kat === kat)
    return list
  }, [q, kat])

  return (
    <div style={{ maxWidth: '100%', margin: '0 auto' }}>
      <div style={{ marginBottom: 14 }}>
        <h2 style={{ margin: '0 0 4px' }}>Wissen &amp; Doku</h2>
        <div style={{ color: 'var(--muted)', fontSize: 13, maxWidth: 720 }}>
          Nachschlagewerk zu allen Themenbereichen — laienverständlich erklärt. Such dir ein Thema, lies die
          Kernpunkte und springe direkt in den passenden Bericht.
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '220px 1fr', gap: 16, alignItems: 'start' }}>
        {/* Sidebar */}
        <div style={{ ...card, padding: 12, position: 'sticky', top: 70 }}>
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="🔎 Doku durchsuchen …"
            style={{ width: '100%', padding: '8px 10px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--line)', font: 'inherit', fontSize: 13, marginBottom: 10 }} />
          <div style={cap}>Kategorien</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 2, marginTop: 6 }}>
            {[{ id: 'alle', name: 'Alle Themen' }, ...KATEGORIEN].map((k) => {
              const aktiv = kat === k.id
              return (
                <button key={k.id} onClick={() => setKat(k.id)}
                  style={{ textAlign: 'left', border: 'none', cursor: 'pointer', borderRadius: 'var(--radius-sm)', padding: '7px 9px', fontSize: 13,
                    background: aktiv ? 'var(--accent-soft)' : 'transparent', color: aktiv ? 'var(--accent)' : 'var(--ink)', fontWeight: aktiv ? 700 : 400 }}>
                  {k.name}
                </button>
              )
            })}
          </div>
        </div>

        {/* Artikel */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {treffer.length === 0 && <div style={{ ...card, padding: 20, color: 'var(--muted)', textAlign: 'center' }}>Keine Artikel gefunden.</div>}
          {treffer.map((d) => (
            <article key={d.id} style={{ ...card, padding: 18 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12 }}>
                <div>
                  <div style={{ fontSize: 10.5, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '.03em' }}>
                    {(KATEGORIEN.find((k) => k.id === d.kat) || {}).name}
                  </div>
                  <h3 style={{ margin: '3px 0 6px', fontSize: 17 }}>{d.titel}</h3>
                </div>
                {d.ziel && onGeh && (
                  <button onClick={() => onGeh(d.ziel)}
                    style={{ whiteSpace: 'nowrap', padding: '6px 12px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--line)', background: 'var(--accent)', color: '#fff', cursor: 'pointer', fontSize: 12, fontWeight: 600 }}>
                    Bericht öffnen →
                  </button>
                )}
              </div>
              <p style={{ margin: '0 0 10px', fontSize: 14, color: 'var(--ink)' }}>{d.kurz}</p>
              <ul style={{ margin: 0, paddingLeft: 18, color: 'var(--muted)', fontSize: 13.5, lineHeight: 1.7 }}>
                {d.punkte.map((p, i) => <li key={i}>{p}</li>)}
              </ul>
            </article>
          ))}
        </div>
      </div>
    </div>
  )
}
