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

export default function DatenmodellAdmin({ istAdmin }) {
  const [, setTick] = useState(0)
  const [reportId, setReportId] = useState('quartalsbericht')
  const [offen, setOffen] = useState(() => Object.fromEntries(QUELLEN.map((q) => [q.id, q.typ === 'fact'])))
  const refresh = () => setTick((t) => t + 1)
  if (!istAdmin) return <div style={{ padding: 24, color: 'var(--muted)' }}>Nur für Administratoren.</div>

  const def = REPORT_FELDER[reportId]
  const val = validierung(reportId)
  const bereit = bereiteReports()

  return (
    <div style={{ maxWidth: 1100, margin: '0 auto' }}>
      <div style={{ marginBottom: 12 }}>
        <div style={cap}>Administration · Datenmodell &amp; Feld-Mapping</div>
        <h2 style={{ margin: '4px 0 0' }}>Datenquellen zuweisen</h2>
      </div>
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
    </div>
  )
}
