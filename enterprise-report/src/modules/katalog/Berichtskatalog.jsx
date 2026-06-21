// =========================================================================
//  MODUL: Berichtskatalog (Glossar) — alle Berichte mit fester Nummer,
//  durchsuchbar, nach Clustern gruppiert. Klick öffnet den Bericht im Baum.
// =========================================================================
import React, { useState, useMemo } from 'react'
import { berichtIndex, EBENEN } from '../../core/reportTree.js'
import { clusterFuer } from '../../core/bereiche.js'
import { eigeneBerichtsItems } from '../../core/designer.js'
import { Badge } from '../../components/ui.jsx'

export default function Berichtskatalog({ onOpen }) {
  const [q, setQ] = useState('')
  const alle = useMemo(() => [...berichtIndex().filter((b) => b.nummer), ...eigeneBerichtsItems()], [])
  const treffer = alle.filter((b) => {
    const s = q.trim().toLowerCase()
    return !s || b.nummer.toLowerCase().includes(s) || b.titel.toLowerCase().includes(s) || (b.bereich || '').toLowerCase().includes(s)
  })
  // nach Cluster gruppieren
  const gruppen = {}
  treffer.forEach((b) => {
    const c = b.typ === 'designer' ? { id: 'eigene', name: 'Eigene Berichte (Designer)' }
      : b.ebene === 1 ? { id: 'gf', name: 'Konzern / GF' }
      : (clusterFuer(b.bereich) || { id: 'x', name: 'Weitere' })
    ;(gruppen[c.id] ||= { name: c.name, items: [] }).items.push(b)
  })

  return (
    <div style={{ maxWidth: 1000, margin: '0 auto', display: 'grid', gap: 16 }}>
      <div style={{ background: 'var(--panel)', border: '1px solid var(--line)', borderRadius: 'var(--radius)', padding: 16, boxShadow: 'var(--shadow)' }}>
        <h2 style={{ fontSize: 18 }}>Berichtskatalog · Glossar</h2>
        <p style={{ color: 'var(--muted)', fontSize: 13, marginTop: 4 }}>Jeder Bericht hat eine feste Nummer (z. B. <b>VK-111</b>). Such- oder Nummern-Eingabe → öffnen.</p>
        <input autoFocus value={q} onChange={(e) => setQ(e.target.value)} placeholder="Nummer oder Titel suchen … z. B. VK-111, Bestände, Treasury"
          style={{ width: '100%', marginTop: 10, padding: '9px 11px', border: '1px solid var(--line)', borderRadius: 'var(--radius-sm)', font: 'inherit' }} />
        <div className="mono" style={{ fontSize: 11, color: 'var(--muted)', marginTop: 6 }}>{treffer.length} Berichte</div>
      </div>

      {Object.entries(gruppen).map(([id, g]) => (
        <div key={id} style={{ background: 'var(--panel)', border: '1px solid var(--line)', borderRadius: 'var(--radius)', overflow: 'hidden' }}>
          <div style={{ padding: '10px 14px', borderBottom: '1px solid var(--line)', fontWeight: 700, fontSize: 12, textTransform: 'uppercase', color: 'var(--muted)' }}>{g.name}</div>
          {g.items.map((b) => {
            const e = EBENEN.find((x) => x.stufe === b.ebene)
            return (
              <div key={b.id} onClick={() => onOpen(b.id, b.typ)} style={{ display: 'grid', gridTemplateColumns: '90px 1fr 150px', gap: 10, alignItems: 'center',
                padding: '8px 14px', borderTop: '1px solid var(--line)', cursor: 'pointer' }}
                onMouseEnter={(ev) => ev.currentTarget.style.background = 'var(--accent-soft)'}
                onMouseLeave={(ev) => ev.currentTarget.style.background = 'transparent'}>
                <span className="mono" style={{ fontSize: 12, fontWeight: 700, color: 'var(--accent)' }}>{b.nummer}</span>
                <span style={{ fontSize: 13.5, paddingLeft: (Number(b.ebene) > 0 ? (b.ebene - 1) * 12 : 0) }}>{b.titel}</span>
                <Badge status="n">{b.typ === 'designer' ? 'Eigen · Designer' : `E${b.ebene} · ${e?.name}`}</Badge>
              </div>
            )
          })}
        </div>
      ))}
    </div>
  )
}
