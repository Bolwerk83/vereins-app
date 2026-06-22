// =========================================================================
//  DATENMODELL-ADMINISTRATION — SQL-Quellspalten per Drag & Drop den Report-
//  Feldern zuweisen. Pflichtfelder müssen belegt sein (grün), optionale dürfen
//  leer bleiben (Kennzahl wird dann leer/ausgeblendet). Grüne Berichte lassen
//  sich direkt zum Testen/Aktivieren freigeben.
// =========================================================================
import React, { useState } from 'react'
import {
  QUELLEN, quelleInfo, REPORT_FELDER, REPORT_IDS, ladeMapping, mappingVon, setzeMapping, setzeZurueck, validierung, bereiteReports
} from '../../core/datenmodell.js'
import { statusVon, setzeStatus } from '../../core/berichtStatus.js'
import {
  DIMENSIONEN as dimListeRaw, spaltenVon as dimSpaltenVon, hierarchienVon as dimHierarchienVon,
  neueHierarchie as dimNeu, loescheHierarchie as dimLoesche, benenneHierarchie as dimBenenne,
  addEbene as dimAddEbene, removeEbene as dimRemoveEbene, verschiebeEbene as dimVerschiebe
} from '../../core/dimHierarchie.js'
import { EINHEITEN, RICHTUNGEN, ladeMeasures, speichereMeasure, loescheMeasure as mLoesche, toggleAktiv as mToggle, neueMeasure } from '../../core/measures.js'
const dimListe = () => dimListeRaw

const card = { background: 'var(--panel)', border: '1px solid var(--line)', borderRadius: 'var(--radius)', boxShadow: 'var(--shadow)' }
const cap = { fontSize: 11, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '.04em', fontWeight: 700 }

function QuellSpalte({ quelle, spalte }) {
  const ref = `${quelle}.${spalte}`
  return (
    <div draggable onDragStart={(e) => e.dataTransfer.setData('text/plain', ref)}
      style={{ fontSize: 12, padding: '3px 9px', borderRadius: 999, border: '1px solid var(--line)', background: 'var(--bg)', cursor: 'grab', whiteSpace: 'nowrap' }}>
      {spalte}
    </div>
  )
}

function FeldSlot({ reportId, feld, onChange }) {
  const [ueber, setUeber] = useState(false)
  const wert = mappingVon(reportId, feld.id)
  const fehltPflicht = feld.pflicht && !wert
  const drop = (e) => { e.preventDefault(); setUeber(false); const ref = e.dataTransfer.getData('text/plain'); if (ref) { setzeMapping(reportId, feld.id, ref); onChange() } }
  return (
    <div onDragOver={(e) => { e.preventDefault(); setUeber(true) }} onDragLeave={() => setUeber(false)} onDrop={drop}
      style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '7px 10px', borderRadius: 'var(--radius-sm)',
        border: `1.5px ${ueber ? 'solid' : 'dashed'} ${ueber ? 'var(--accent)' : fehltPflicht ? 'var(--amp-r)' : wert ? 'var(--amp-g)' : 'var(--line)'}`,
        background: ueber ? 'var(--amp-a-soft)' : 'var(--panel)', marginBottom: 6 }}>
      <span style={{ fontSize: 13, fontWeight: 600, minWidth: 140 }}>
        {feld.name}
        {feld.pflicht ? <span style={{ color: 'var(--amp-r)' }}> *</span> : <span style={{ color: 'var(--muted)', fontSize: 11 }}> (optional)</span>}
      </span>
      <div style={{ flex: 1 }}>
        {wert
          ? <span className="mono" style={{ fontSize: 12, background: 'var(--amp-g-soft)', color: 'var(--amp-g)', padding: '2px 8px', borderRadius: 6, fontWeight: 600 }}>{wert}</span>
          : <span style={{ fontSize: 12, color: fehltPflicht ? 'var(--amp-r)' : 'var(--muted)' }}>{fehltPflicht ? 'Pflichtfeld – Spalte hierher ziehen' : feld.hinweis || 'optional – leer = Kennzahl ausgeblendet'}</span>}
      </div>
      {wert && <button onClick={() => { setzeMapping(reportId, feld.id, null); onChange() }} title="Zuordnung entfernen"
        style={{ border: 'none', background: 'none', cursor: 'pointer', color: 'var(--muted)', fontSize: 16, lineHeight: 1 }}>×</button>}
    </div>
  )
}

function MappingTab() {
  const [, setTick] = useState(0)
  const [reportId, setReportId] = useState('quartalsbericht')
  const [offen, setOffen] = useState(() => Object.fromEntries(QUELLEN.map((q) => [q.id, q.typ === 'fact'])))
  const refresh = () => setTick((t) => t + 1)

  const def = REPORT_FELDER[reportId]
  const val = validierung(reportId)
  const bereit = bereiteReports()

  return (
    <>
      <div style={{ ...card, padding: 14, marginBottom: 14, borderLeft: '3px solid var(--accent)' }}>
        <div style={{ fontSize: 13.5, lineHeight: 1.5 }}>
          Spalten aus den Quelltabellen per <b>Drag &amp; Drop</b> auf die Report-Felder ziehen.
          <b style={{ color: 'var(--amp-r)' }}> Pflichtfelder (*)</b> müssen belegt sein, optionale dürfen leer bleiben
          (die Kennzahl wird dann leer/ausgeblendet). Sind alle Pflichtfelder grün, kann der Bericht getestet/aktiviert werden.
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1fr) minmax(0,1.6fr)', gap: 16, alignItems: 'start' }}>
        {/* Quellen */}
        <div style={{ ...card, padding: 14 }}>
          <div style={{ ...cap, marginBottom: 8 }}>Quelltabellen (Spalten ziehen)</div>
          {QUELLEN.map((q) => (
            <div key={q.id} style={{ marginBottom: 8 }}>
              <div onClick={() => setOffen((o) => ({ ...o, [q.id]: !o[q.id] }))} style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, fontWeight: 600 }}>
                <span style={{ color: 'var(--muted)' }}>{offen[q.id] ? '▾' : '▸'}</span>
                <span style={{ fontSize: 10, color: '#fff', background: q.typ === 'fact' ? 'var(--accent)' : 'var(--slate)', borderRadius: 4, padding: '0 6px' }}>{q.typ}</span>
                {q.id}
              </div>
              {offen[q.id] && (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5, marginTop: 6, paddingLeft: 18 }}>
                  {q.spalten.map((s) => <QuellSpalte key={s} quelle={q.id} spalte={s} />)}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Report-Felder */}
        <div>
          <div style={{ display: 'flex', gap: 8, marginBottom: 10, flexWrap: 'wrap' }}>
            {REPORT_IDS.map((id) => {
              const v = validierung(id)
              return (
                <button key={id} onClick={() => setReportId(id)} style={{ padding: '6px 12px', borderRadius: 999, fontSize: 12.5, fontWeight: 600, cursor: 'pointer',
                  border: `1px solid ${reportId === id ? 'var(--accent)' : 'var(--line)'}`, background: reportId === id ? 'var(--accent)' : 'var(--panel)', color: reportId === id ? '#fff' : 'var(--ink)' }}>
                  {v.gruen ? '✓ ' : '● '}{REPORT_FELDER[id].name}
                </button>
              )
            })}
          </div>

          <div style={{ ...card, padding: 16 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10, flexWrap: 'wrap', gap: 8 }}>
              <div style={cap}>{def.name} — Felder</div>
              <span style={{ fontSize: 12.5, fontWeight: 700, color: val.gruen ? 'var(--amp-g)' : 'var(--amp-a)' }}>
                {val.gruen ? '✓ bereit' : `${val.pflichtGemappt}/${val.pflichtGesamt} Pflichtfelder`} · {val.fortschritt} %
              </span>
            </div>
            {def.felder.map((f) => <FeldSlot key={f.id} reportId={reportId} feld={f} onChange={refresh} />)}
            {!val.gruen && <div style={{ fontSize: 12, color: 'var(--amp-r)', marginTop: 6 }}>Es fehlen: {val.fehlend.join(', ')}</div>}
          </div>
        </div>
      </div>

      {/* Bereit zum Ausrollen */}
      <div style={{ ...card, padding: 16, marginTop: 16, borderLeft: `3px solid ${bereit.length ? 'var(--amp-g)' : 'var(--line)'}` }}>
        <div style={{ ...cap, marginBottom: 8 }}>Bereit zum Testen / Aktivieren ({bereit.length})</div>
        {bereit.length === 0 && <div style={{ fontSize: 13, color: 'var(--muted)' }}>Noch kein Bericht vollständig gemappt.</div>}
        {bereit.map((id) => {
          const st = statusVon(id)
          return (
            <div key={id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '7px 0', borderBottom: '1px solid var(--line)' }}>
              <span style={{ color: 'var(--amp-g)' }}>✓</span>
              <span style={{ flex: 1, fontWeight: 600 }}>{REPORT_FELDER[id].name}</span>
              <span style={{ fontSize: 11, color: 'var(--muted)' }}>Status: {st}</span>
              <button onClick={() => { setzeStatus(id, 'test'); refresh() }} style={{ fontSize: 12, cursor: 'pointer', border: '1px solid var(--amp-a)', color: 'var(--amp-a)', background: 'var(--panel)', borderRadius: 999, padding: '3px 11px', fontWeight: 600 }}>🧪 Test</button>
              <button onClick={() => { setzeStatus(id, 'aktiv'); refresh() }} style={{ fontSize: 12, cursor: 'pointer', border: 'none', color: '#fff', background: 'var(--amp-g)', borderRadius: 999, padding: '3px 11px', fontWeight: 600 }}>✓ Aktivieren</button>
            </div>
          )
        })}
      </div>

      <div className="no-print" style={{ marginTop: 14, textAlign: 'right' }}>
        <button onClick={() => { setzeZurueck(); refresh() }} style={{ fontSize: 12.5, padding: '6px 12px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--line)', background: 'var(--panel)', cursor: 'pointer', color: 'var(--muted)' }}>↺ Mapping zurücksetzen</button>
      </div>
    </>
  )
}

// =========================================================================
//  TAB: Dimensionen & Hierarchien
// =========================================================================
function HierarchieKarte({ h, spalten, onChange }) {
  const [ueber, setUeber] = useState(false)
  const drop = (e) => { e.preventDefault(); setUeber(false); const s = e.dataTransfer.getData('text/plain'); if (s) { dimAddEbene(h.id, s); onChange() } }
  return (
    <div style={{ ...card, padding: 12, marginBottom: 10 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
        <input value={h.name} onChange={(e) => { dimBenenne(h.id, e.target.value); onChange() }}
          style={{ font: 'inherit', fontSize: 13.5, fontWeight: 700, border: '1px solid transparent', borderRadius: 6, padding: '2px 6px', background: 'transparent', flex: 1 }} />
        <button onClick={() => { dimLoesche(h.id); onChange() }} title="Hierarchie löschen" style={{ border: 'none', background: 'none', cursor: 'pointer', color: 'var(--muted)' }}>🗑</button>
      </div>
      <div onDragOver={(e) => { e.preventDefault(); setUeber(true) }} onDragLeave={() => setUeber(false)} onDrop={drop}
        style={{ border: `1.5px ${ueber ? 'solid var(--accent)' : 'dashed var(--line)'}`, borderRadius: 'var(--radius-sm)', padding: 8, background: ueber ? 'var(--amp-a-soft)' : 'var(--bg)' }}>
        {h.ebenen.length === 0 && <div style={{ fontSize: 12, color: 'var(--muted)' }}>Spalte hierher ziehen, um eine Ebene anzulegen …</div>}
        {h.ebenen.map((e, i) => (
          <div key={e} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '4px 6px', borderBottom: i < h.ebenen.length - 1 ? '1px solid var(--line)' : 'none' }}>
            <span style={{ width: 16, color: 'var(--muted)', fontSize: 11 }}>{i + 1}.</span>
            <span style={{ flex: 1, fontSize: 13, fontWeight: 600 }}>{e}</span>
            <button onClick={() => { dimVerschiebe(h.id, i, -1); onChange() }} disabled={i === 0} style={{ border: 'none', background: 'none', cursor: i === 0 ? 'default' : 'pointer', color: i === 0 ? 'var(--line)' : 'var(--muted)' }}>▲</button>
            <button onClick={() => { dimVerschiebe(h.id, i, 1); onChange() }} disabled={i === h.ebenen.length - 1} style={{ border: 'none', background: 'none', cursor: i === h.ebenen.length - 1 ? 'default' : 'pointer', color: i === h.ebenen.length - 1 ? 'var(--line)' : 'var(--muted)' }}>▼</button>
            <button onClick={() => { dimRemoveEbene(h.id, i); onChange() }} style={{ border: 'none', background: 'none', cursor: 'pointer', color: 'var(--muted)' }}>×</button>
          </div>
        ))}
      </div>
      {h.ebenen.length > 0 && <div style={{ fontSize: 11, color: 'var(--muted)', marginTop: 6 }}>Drill: {h.ebenen.join(' → ')}</div>}
    </div>
  )
}

function DimensionenTab() {
  const [, setTick] = useState(0)
  const [dimId, setDimId] = useState('DimArtikel')
  const refresh = () => setTick((t) => t + 1)
  const spalten = dimSpaltenVon(dimId)
  const hs = dimHierarchienVon(dimId)
  return (
    <>
      <div style={{ ...card, padding: 14, marginBottom: 14, borderLeft: '3px solid var(--accent)', fontSize: 13.5, lineHeight: 1.5 }}>
        Je Dimension lassen sich <b>mehrere parallele Hierarchien</b> anlegen (z. B. Artikel als Produkthierarchie,
        Profit-Center als Geschäftsbereich / Kanal / Land). Spalten per <b>Drag &amp; Drop</b> als Ebene hinzufügen,
        mit ▲▼ ordnen.
      </div>
      <div style={{ display: 'flex', gap: 8, marginBottom: 10, flexWrap: 'wrap' }}>
        {dimListe().map((d) => (
          <button key={d.id} onClick={() => setDimId(d.id)} style={{ padding: '6px 12px', borderRadius: 999, fontSize: 12.5, fontWeight: 600, cursor: 'pointer',
            border: `1px solid ${dimId === d.id ? 'var(--accent)' : 'var(--line)'}`, background: dimId === d.id ? 'var(--accent)' : 'var(--panel)', color: dimId === d.id ? '#fff' : 'var(--ink)' }}>{d.id}</button>
        ))}
      </div>
      <div style={{ ...card, padding: 12, marginBottom: 14 }}>
        <div style={{ ...cap, marginBottom: 8 }}>Spalten von {dimId} (ziehen)</div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5 }}>
          {spalten.map((s) => (
            <div key={s} draggable onDragStart={(e) => e.dataTransfer.setData('text/plain', s)}
              style={{ fontSize: 12, padding: '3px 9px', borderRadius: 999, border: '1px solid var(--line)', background: 'var(--bg)', cursor: 'grab' }}>{s}</div>
          ))}
        </div>
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
        <div style={cap}>Hierarchien ({hs.length})</div>
        <button onClick={() => { dimNeu(dimId, 'Neue Hierarchie'); refresh() }} style={{ fontSize: 12.5, padding: '5px 12px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--accent)', color: 'var(--accent)', background: 'var(--panel)', cursor: 'pointer', fontWeight: 600 }}>+ Hierarchie</button>
      </div>
      {hs.map((h) => <HierarchieKarte key={h.id} h={h} spalten={spalten} onChange={refresh} />)}
    </>
  )
}

// =========================================================================
//  TAB: Measures
// =========================================================================
function MeasureKarte({ m, onChange }) {
  const upd = (patch) => { speichereMeasure({ ...m, ...patch }); onChange() }
  const inp = { font: 'inherit', fontSize: 12.5, padding: '4px 7px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--line)' }
  return (
    <div style={{ ...card, padding: 12, marginBottom: 10, opacity: m.aktiv ? 1 : 0.55 }}>
      <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 6, flexWrap: 'wrap' }}>
        <input value={m.name} onChange={(e) => upd({ name: e.target.value })} style={{ ...inp, fontWeight: 700, flex: 1, minWidth: 140 }} />
        <select value={m.einheit} onChange={(e) => upd({ einheit: e.target.value })} style={inp}>{EINHEITEN.map((x) => <option key={x}>{x}</option>)}</select>
        <select value={m.richtung} onChange={(e) => upd({ richtung: e.target.value })} style={inp}>{RICHTUNGEN.map((r) => <option key={r.id} value={r.id}>{r.name}</option>)}</select>
        <label style={{ fontSize: 12, display: 'inline-flex', gap: 4, alignItems: 'center', cursor: 'pointer' }}><input type="checkbox" checked={m.aktiv} onChange={() => { mToggle(m.id); onChange() }} />aktiv</label>
        <button onClick={() => { mLoesche(m.id); onChange() }} title="löschen" style={{ border: 'none', background: 'none', cursor: 'pointer', color: 'var(--muted)' }}>🗑</button>
      </div>
      <input value={m.formel} onChange={(e) => upd({ formel: e.target.value })} placeholder="Formel, z. B. EBIT / Capital Employed * 100"
        className="mono" style={{ ...inp, width: '100%', marginBottom: 6 }} />
      <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
        <span style={{ fontSize: 11, color: 'var(--muted)' }}>Zielband:</span>
        <label style={{ fontSize: 12 }}>gut {m.richtung === 'tief' ? '≤' : '≥'} <input type="number" value={m.zielGut} onChange={(e) => upd({ zielGut: +e.target.value })} style={{ ...inp, width: 64 }} /></label>
        <label style={{ fontSize: 12 }}>ok {m.richtung === 'tief' ? '≤' : '≥'} <input type="number" value={m.zielOk} onChange={(e) => upd({ zielOk: +e.target.value })} style={{ ...inp, width: 64 }} /></label>
        <input value={m.beschreibung} onChange={(e) => upd({ beschreibung: e.target.value })} placeholder="Beschreibung" style={{ ...inp, flex: 1, minWidth: 160 }} />
      </div>
    </div>
  )
}

function MeasuresTab() {
  const [, setTick] = useState(0)
  const refresh = () => setTick((t) => t + 1)
  const liste = ladeMeasures()
  return (
    <>
      <div style={{ ...card, padding: 14, marginBottom: 14, borderLeft: '3px solid var(--accent)', fontSize: 13.5, lineHeight: 1.5 }}>
        Zentrale <b>Kennzahlen-Schicht</b>: Measure mit Formel, Format, Richtung und Zielband definieren — einmal
        festgelegt, in allen Berichten wiederverwendbar (Tabular-Prinzip).
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
        <div style={cap}>Measures ({liste.length}, {liste.filter((m) => m.aktiv).length} aktiv)</div>
        <button onClick={() => { speichereMeasure(neueMeasure()); refresh() }} style={{ fontSize: 12.5, padding: '5px 12px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--accent)', color: 'var(--accent)', background: 'var(--panel)', cursor: 'pointer', fontWeight: 600 }}>+ Measure</button>
      </div>
      {liste.map((m) => <MeasureKarte key={m.id} m={m} onChange={refresh} />)}
    </>
  )
}

const TABS = [{ id: 'mapping', name: '🔗 Feld-Mapping' }, { id: 'dim', name: '🌲 Dimensionen & Hierarchien' }, { id: 'measure', name: '📐 Measures' }]

export default function DatenmodellAdmin({ istAdmin }) {
  const [tab, setTab] = useState('mapping')
  if (!istAdmin) return <div style={{ padding: 24, color: 'var(--muted)' }}>Nur für Administratoren.</div>
  return (
    <div style={{ maxWidth: 1100, margin: '0 auto' }}>
      <div style={{ marginBottom: 12 }}>
        <div style={cap}>Administration · Datenmodell (Tabular-Bausteine)</div>
        <h2 style={{ margin: '4px 0 0' }}>Datenmodell &amp; Mapping</h2>
      </div>
      <div style={{ display: 'flex', gap: 8, marginBottom: 14, flexWrap: 'wrap' }}>
        {TABS.map((x) => (
          <button key={x.id} onClick={() => setTab(x.id)} style={{ padding: '7px 14px', borderRadius: 'var(--radius-sm)', fontSize: 13, fontWeight: 600, cursor: 'pointer',
            border: `1px solid ${tab === x.id ? 'var(--accent)' : 'var(--line)'}`, background: tab === x.id ? 'var(--accent)' : 'var(--panel)', color: tab === x.id ? '#fff' : 'var(--ink)' }}>{x.name}</button>
        ))}
      </div>
      {tab === 'mapping' && <MappingTab />}
      {tab === 'dim' && <DimensionenTab />}
      {tab === 'measure' && <MeasuresTab />}
    </div>
  )
}
