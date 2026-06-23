// =========================================================================
//  DATENQUELLEN — erweiterbare Linksammlung für externe Markt-/Geodaten.
//  Filter nach Kategorie, Suche, Hinzufügen/Bearbeiten/Löschen.
// =========================================================================
import React, { useState } from 'react'
import { KATEGORIEN, kategorieInfo, KOSTEN, ladeQuellen, speichereQuelle, loescheQuelle, neueQuelle, setzeZurueck } from '../../core/datenquellen.js'

const card = { background: 'var(--panel)', border: '1px solid var(--line)', borderRadius: 'var(--radius)', boxShadow: 'var(--shadow)' }
const cap = { fontSize: 11, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '.04em', fontWeight: 700 }
const inp = { font: 'inherit', fontSize: 13, padding: '6px 9px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--line)' }

function Editor({ q, onSave, onCancel }) {
  const [e, setE] = useState({ ...q, tags: (q.tags || []).join(', ') })
  const speichern = () => onSave({ ...e, tags: e.tags.split(',').map((t) => t.trim()).filter(Boolean) })
  return (
    <div style={{ ...card, padding: 14, marginBottom: 12, borderLeft: '3px solid var(--accent)' }}>
      <div style={{ display: 'grid', gap: 8 }}>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <input value={e.name} onChange={(x) => setE({ ...e, name: x.target.value })} placeholder="Name der Quelle" style={{ ...inp, flex: 2, minWidth: 180 }} />
          <select value={e.kategorie} onChange={(x) => setE({ ...e, kategorie: x.target.value })} style={inp}>{KATEGORIEN.map((k) => <option key={k.id} value={k.id}>{k.name}</option>)}</select>
          <select value={e.kosten} onChange={(x) => setE({ ...e, kosten: x.target.value })} style={inp}>{Object.entries(KOSTEN).map(([id, k]) => <option key={id} value={id}>{k.name}</option>)}</select>
        </div>
        <input value={e.url} onChange={(x) => setE({ ...e, url: x.target.value })} placeholder="https://…" className="mono" style={inp} />
        <input value={e.beschreibung} onChange={(x) => setE({ ...e, beschreibung: x.target.value })} placeholder="Was bekommt man dort?" style={inp} />
        <input value={e.tags} onChange={(x) => setE({ ...e, tags: x.target.value })} placeholder="Tags, kommagetrennt (z. B. PLZ, Einwohner)" style={inp} />
        <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
          <button onClick={onCancel} style={{ ...inp, cursor: 'pointer', background: 'var(--panel)' }}>Abbrechen</button>
          <button onClick={speichern} disabled={!e.name.trim()} style={{ ...inp, cursor: e.name.trim() ? 'pointer' : 'not-allowed', border: 'none', background: e.name.trim() ? 'var(--accent)' : 'var(--line)', color: '#fff', fontWeight: 600 }}>Speichern</button>
        </div>
      </div>
    </div>
  )
}

function Karte({ q, onEdit, onDelete }) {
  const k = KOSTEN[q.kosten] || KOSTEN.kostenlos
  return (
    <div style={{ ...card, padding: 13 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8 }}>
        <a href={q.url} target="_blank" rel="noreferrer" style={{ fontSize: 14, fontWeight: 700, color: 'var(--accent)', textDecoration: 'none' }}>{q.name} ↗</a>
        <span style={{ fontSize: 10, fontWeight: 700, color: '#fff', background: k.farbe, borderRadius: 999, padding: '1px 8px', whiteSpace: 'nowrap' }}>{k.name}</span>
      </div>
      <div className="mono" style={{ fontSize: 11, color: 'var(--muted)', margin: '2px 0 6px', wordBreak: 'break-all' }}>{q.url}</div>
      <div style={{ fontSize: 12.5, color: 'var(--slate)', lineHeight: 1.45 }}>{q.beschreibung}</div>
      <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap', marginTop: 8, alignItems: 'center' }}>
        {(q.tags || []).map((t) => <span key={t} style={{ fontSize: 10.5, color: 'var(--muted)', border: '1px solid var(--line)', borderRadius: 999, padding: '0 7px' }}>{t}</span>)}
        <span style={{ marginLeft: 'auto', display: 'flex', gap: 6 }}>
          <button onClick={onEdit} title="bearbeiten" style={{ border: 'none', background: 'none', cursor: 'pointer', color: 'var(--muted)' }}>✏️</button>
          <button onClick={onDelete} title="löschen" style={{ border: 'none', background: 'none', cursor: 'pointer', color: 'var(--muted)' }}>🗑</button>
        </span>
      </div>
    </div>
  )
}

export default function Datenquellen() {
  const [, setTick] = useState(0)
  const refresh = () => setTick((t) => t + 1)
  const [kat, setKat] = useState('alle')
  const [q, setQ] = useState('')
  const [edit, setEdit] = useState(null) // Quelle in Bearbeitung oder neue
  const quellen = ladeQuellen()
  const gefiltert = quellen.filter((x) => (kat === 'alle' || x.kategorie === kat) &&
    (x.name + ' ' + x.beschreibung + ' ' + (x.tags || []).join(' ')).toLowerCase().includes(q.toLowerCase()))
  const save = (e) => { speichereQuelle(e); setEdit(null); refresh() }

  return (
    <div style={{ maxWidth: '100%', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', gap: 12, flexWrap: 'wrap', marginBottom: 12 }}>
        <div>
          <div style={cap}>Wissen · Externe Datenquellen</div>
          <h2 style={{ margin: '4px 0 0' }}>Datenquellen &amp; Linksammlung</h2>
          <div style={{ fontSize: 12.5, color: 'var(--muted)', marginTop: 2 }}>Marktanteile, PLZ/Einwohner/Fläche, Bike-Statistiken (Gravel/Rennrad/MTB/E-Bike), Wettbewerbs-Benchmark — erweiterbar.</div>
        </div>
        <div className="no-print" style={{ display: 'flex', gap: 8 }}>
          <button onClick={() => setEdit(neueQuelle())} style={{ padding: '7px 13px', borderRadius: 'var(--radius-sm)', border: 'none', background: 'var(--accent)', color: '#fff', cursor: 'pointer', fontSize: 13, fontWeight: 600 }}>＋ Quelle hinzufügen</button>
          <button onClick={() => { setzeZurueck(); refresh() }} title="auf Seed zurücksetzen" style={{ padding: '7px 12px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--line)', background: 'var(--panel)', cursor: 'pointer', fontSize: 13, color: 'var(--muted)' }}>↺</button>
        </div>
      </div>

      <div className="no-print" style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap', marginBottom: 14 }}>
        {[{ id: 'alle', name: 'Alle', icon: '📚' }, ...KATEGORIEN].map((k) => (
          <button key={k.id} onClick={() => setKat(k.id)} style={{ padding: '5px 11px', borderRadius: 999, fontSize: 12.5, fontWeight: 600, cursor: 'pointer',
            border: `1px solid ${kat === k.id ? 'var(--accent)' : 'var(--line)'}`, background: kat === k.id ? 'var(--accent)' : 'var(--panel)', color: kat === k.id ? '#fff' : 'var(--ink)' }}>{k.icon} {k.name}</button>
        ))}
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Suche (Name, Tag, …)" style={{ ...inp, marginLeft: 'auto', minWidth: 200 }} />
      </div>

      {edit && <Editor q={edit} onSave={save} onCancel={() => setEdit(null)} />}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 12 }}>
        {gefiltert.map((x) => (
          <Karte key={x.id} q={x} onEdit={() => setEdit(x)} onDelete={() => { loescheQuelle(x.id); refresh() }} />
        ))}
      </div>
      {gefiltert.length === 0 && <div style={{ fontSize: 13, color: 'var(--muted)', padding: 12 }}>Keine Treffer. „＋ Quelle hinzufügen" oben.</div>}

      <div style={{ fontSize: 11, color: 'var(--muted)', textAlign: 'center', padding: '16px 0 20px' }}>
        {quellen.length} Quellen · Links öffnen extern · Hinweis: bei externer Datennutzung Lizenz/Quellangabe & DSGVO (Drittland) beachten.
      </div>
    </div>
  )
}
