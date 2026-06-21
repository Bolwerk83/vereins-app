// =========================================================================
//  MODUL: Report-Designer — eigene Management-Reports zusammenbauen.
//  Links Editor (KPIs/Text/Maßnahmen, sortierbar), rechts Live-Vorschau.
//  Vorschau ist druckbar (PDF) und als CSV exportierbar.
// =========================================================================
import React, { useState, useEffect } from 'react'
import { KPI } from '../../core/kpiRegistry.js'
import { darfKpi } from '../../core/rbac.js'
import { clusterFuer } from '../../core/bereiche.js'
import { kpiInsight, knotenBewertung } from '../../core/insights.js'
import { ladeMassnahmen } from '../../core/massnahmen.js'
import { ladeReports, saveReport, removeReport, neuerReport } from '../../core/designer.js'
import { seedBeispielReports } from '../../core/designerSeed.js'
import { datensatzKatalog, datensatzInfo, ladeDatensatz, tabellenSicht, distinktWerte } from '../../core/datensaetze.js'
import { formatWert, AMPEL_FARBE } from '../../design/theme.js'
import { exportReportPdf, exportReportExcel } from '../../core/reportExport.js'
import { Badge, AmpelPunkt, DetailTabelle } from '../../components/ui.jsx'

export default function ReportDesigner({ rolle, werte, startId }) {
  const [reports, setReports] = useState(ladeReports())
  const [r, setR] = useState(() => ladeReports()[0] || neuerReport())
  const set = (patch) => setR((x) => ({ ...x, ...patch }))
  const refresh = () => setReports(ladeReports())
  // aus dem Katalog geöffneten Report laden
  useEffect(() => { if (startId) { const x = ladeReports().find((y) => y.id === startId); if (x) setR(x) } }, [startId])

  // KPI-Auswahl gruppiert (rechtegeprüft)
  const kpiGruppen = {}
  Object.values(KPI).filter((k) => darfKpi(rolle, k)).forEach((k) => {
    const c = clusterFuer(k.bereich)?.name || 'Weitere'
    ;(kpiGruppen[c] ||= []).push(k)
  })

  const addBlock = (b) => set({ bloecke: [...r.bloecke, b] })
  const move = (i, d) => { const a = [...r.bloecke]; const j = i + d; if (j < 0 || j >= a.length) return;[a[i], a[j]] = [a[j], a[i]]; set({ bloecke: a }) }
  const del = (i) => set({ bloecke: r.bloecke.filter((_, x) => x !== i) })
  const editBlock = (i, patch) => set({ bloecke: r.bloecke.map((b, x) => x === i ? { ...b, ...patch } : b) })

  function speichern() { saveReport(r); refresh() }
  function neu() { const x = neuerReport(); setR(x) }
  function beispieleLaden() {
    if (!confirm('20 Beispiel-Berichte aus dem Berichtsbaum anlegen? (vorhandene Beispiele werden aktualisiert)')) return
    const { erstellt } = seedBeispielReports()
    const rest = ladeReports(); setReports(rest); setR(rest[0] || neuerReport())
    alert(`${erstellt} Berichte angelegt. Jetzt im Katalog und im Transport auswählbar.`)
  }
  function laden(id) { setR(ladeReports().find((x) => x.id === id) || neuerReport()) }
  function loeschen() { removeReport(r.id); const rest = ladeReports(); setReports(rest); setR(rest[0] || neuerReport()) }

  const card ={ background: 'var(--panel)', border: '1px solid var(--line)', borderRadius: 'var(--radius)', padding: 16, boxShadow: 'var(--shadow)' }
  const inp = { width: '100%', padding: '8px 10px', border: '1px solid var(--line)', borderRadius: 'var(--radius-sm)', font: 'inherit' }
  const btn = { padding: '8px 12px', border: '1px solid var(--line)', borderRadius: 'var(--radius-sm)', background: 'var(--panel)', fontSize: 13 }

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '380px 1fr', gap: 20, alignItems: 'start' }}>
      {/* Editor */}
      <div className="no-print" style={{ ...card, display: 'grid', gap: 12, position: 'sticky', top: 16 }}>
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          <select style={{ ...inp, flex: 1 }} value={r.id} onChange={(e) => laden(e.target.value)}>
            {!reports.find((x) => x.id === r.id) && <option value={r.id}>{r.titel} (ungespeichert)</option>}
            {reports.map((x) => <option key={x.id} value={x.id}>{x.titel}</option>)}
          </select>
          <button style={btn} onClick={neu}>+ Neu</button>
          <button style={{ ...btn, whiteSpace: 'nowrap' }} title="20 Berichte aus dem Berichtsbaum anlegen" onClick={beispieleLaden}>✨ 20 Beispiele</button>
        </div>

        <div><input style={inp} value={r.titel} onChange={(e) => set({ titel: e.target.value })} placeholder="Berichtstitel" /></div>
        <div><input style={inp} value={r.beschreibung} onChange={(e) => set({ beschreibung: e.target.value })} placeholder="Untertitel / Kernaussage" /></div>

        {/* Block hinzufügen */}
        <div style={{ borderTop: '1px solid var(--line)', paddingTop: 12, display: 'grid', gap: 8 }}>
          <div className="mono" style={{ fontSize: 11, color: 'var(--muted)', textTransform: 'uppercase' }}>Bausteine hinzufügen</div>
          <select style={inp} value="" onChange={(e) => { if (e.target.value) addBlock({ typ: 'kpi', kpiId: e.target.value }) }}>
            <option value="">+ Kennzahl wählen …</option>
            {Object.entries(kpiGruppen).map(([g, ks]) => (
              <optgroup key={g} label={g}>{ks.map((k) => <option key={k.id} value={k.id}>{k.name} ({k.bereich})</option>)}</optgroup>
            ))}
          </select>
          <select style={inp} value="" onChange={(e) => { if (e.target.value) { const [kind, key] = e.target.value.split('::'); const d = datensatzInfo(kind, key); addBlock({ typ: 'tabelle', kind, key, titel: d?.titel || key }) } }}>
            <option value="">+ Tabelle (Detail-/Perspektivdatensatz) …</option>
            {datensatzKatalog().map((d) => <option key={d.kind + d.key} value={`${d.kind}::${d.key}`}>{d.titel} ({d.zeilen} Zeilen)</option>)}
          </select>
          <div style={{ display: 'flex', gap: 8 }}>
            <button style={{ ...btn, flex: 1 }} onClick={() => addBlock({ typ: 'text', titel: 'Überschrift', text: 'Analysetext …' })}>+ Textblock</button>
            <button style={{ ...btn, flex: 1 }} onClick={() => addBlock({ typ: 'massnahmen' })}>+ Maßnahmen</button>
          </div>
        </div>

        {/* Blockliste */}
        <div style={{ borderTop: '1px solid var(--line)', paddingTop: 12, display: 'grid', gap: 6 }}>
          {r.bloecke.map((b, i) => (
            <div key={i} style={{ border: '1px solid var(--line)', borderRadius: 'var(--radius-sm)', padding: 8 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <Badge status="n">{b.typ === 'kpi' ? 'KPI' : b.typ === 'text' ? 'Text' : b.typ === 'tabelle' ? 'Tabelle' : 'Maßnahmen'}</Badge>
                <span style={{ flex: 1, fontSize: 12.5 }}>{b.typ === 'kpi' ? KPI[b.kpiId]?.name : b.typ === 'text' ? b.titel : b.typ === 'tabelle' ? b.titel : 'Offene Maßnahmen'}</span>
                <button style={{ ...btn, padding: '2px 7px' }} onClick={() => move(i, -1)}>↑</button>
                <button style={{ ...btn, padding: '2px 7px' }} onClick={() => move(i, 1)}>↓</button>
                <button style={{ ...btn, padding: '2px 7px', color: 'var(--amp-r)' }} onClick={() => del(i)}>✕</button>
              </div>
              {b.typ === 'text' && (
                <div style={{ marginTop: 6, display: 'grid', gap: 4 }}>
                  <input style={{ ...inp, fontSize: 12 }} value={b.titel} onChange={(e) => editBlock(i, { titel: e.target.value })} />
                  <textarea style={{ ...inp, fontSize: 12 }} rows={2} value={b.text} onChange={(e) => editBlock(i, { text: e.target.value })} />
                </div>
              )}
            </div>
          ))}
          {!r.bloecke.length && <div style={{ color: 'var(--muted)', fontSize: 13 }}>Noch leer — oben Bausteine hinzufügen.</div>}
        </div>

        <div style={{ display: 'flex', gap: 8, borderTop: '1px solid var(--line)', paddingTop: 12 }}>
          <button onClick={speichern} style={{ ...btn, background: 'var(--accent)', color: '#fff', border: 'none', fontWeight: 600, flex: 1 }}>Speichern</button>
          <button onClick={() => exportReportExcel(r, werte)} style={btn} title="Bericht inkl. Tabellen als Excel">⤓ Excel</button>
          <button onClick={() => exportReportPdf(r, werte)} style={btn} title="Bericht sauber als PDF (Druckfenster)">🖨 PDF</button>
          {reports.find((x) => x.id === r.id) && <button onClick={loeschen} style={{ ...btn, color: 'var(--amp-r)' }}>Löschen</button>}
        </div>
      </div>

      {/* Vorschau */}
      <Vorschau r={r} werte={werte} rolle={rolle} onEditBlock={editBlock} />
    </div>
  )
}

// Tabellen-Block: lädt den Datensatz quellenrein und rendert ihn mit
// Steuerung (Suche · Spaltenfilter · Sortierung · Top-N). Die Einstellungen
// werden über onCfg im Block gespeichert (persistiert mit dem Bericht und
// gelten so auch im Export). DetailTabelle virtualisiert große Tabellen.
const TOPN = [10, 25, 100, 0]
function TabellenBlock({ block, onCfg }) {
  const [daten, setDaten] = useState(null)
  const [fehler, setFehler] = useState(false)
  useEffect(() => { let aktiv = true
    ladeDatensatz(block.kind, block.key).then((d) => aktiv && setDaten(d)).catch(() => aktiv && setFehler(true))
    return () => { aktiv = false }
  }, [block.kind, block.key])

  const view = { feld: block.feld || {}, suche: block.suche || '', sortIdx: block.sortIdx ?? null, sortDir: block.sortDir || 'asc', top: block.top ?? 25 }
  const setView = (patch) => onCfg && onCfg(patch)
  const sicht = daten ? tabellenSicht(daten, view) : null
  const inp = { padding: '5px 8px', border: '1px solid var(--line)', borderRadius: 'var(--radius-sm)', font: 'inherit', fontSize: 12 }

  return (
    <div>
      <div className="mono" style={{ fontSize: 11, color: 'var(--muted)', textTransform: 'uppercase', marginBottom: 6 }}>{block.titel}</div>
      {fehler ? <div style={{ color: 'var(--muted)', fontSize: 13 }}>Datensatz nicht verfügbar.</div>
      : !daten ? <div style={{ color: 'var(--muted)', fontSize: 13 }}>Lädt …</div>
      : (
        <>
          <div className="no-print" style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center', marginBottom: 8 }}>
            <input style={{ ...inp, flex: 1, minWidth: 140 }} value={view.suche} onChange={(e) => setView({ suche: e.target.value })} placeholder="Suche in der Tabelle …" />
            {(daten.filterSpalten || []).map((idx) => (
              <select key={idx} style={inp} value={view.feld[idx] || ''} onChange={(e) => setView({ feld: { ...view.feld, [idx]: e.target.value } })}>
                <option value="">{daten.spalten[idx]}: alle</option>
                {distinktWerte(daten, idx).map((w) => <option key={w} value={w}>{w}</option>)}
              </select>
            ))}
            <select style={inp} value={view.sortIdx ?? ''} onChange={(e) => setView({ sortIdx: e.target.value === '' ? null : Number(e.target.value) })}>
              <option value="">Sortierung …</option>
              {daten.spalten.map((s, i) => <option key={i} value={i}>{s}</option>)}
            </select>
            {view.sortIdx != null && <button style={{ ...inp, cursor: 'pointer' }} onClick={() => setView({ sortDir: view.sortDir === 'asc' ? 'desc' : 'asc' })}>{view.sortDir === 'asc' ? '↑' : '↓'}</button>}
            <select style={inp} value={view.top} onChange={(e) => setView({ top: Number(e.target.value) })}>
              {TOPN.map((n) => <option key={n} value={n}>{n ? `Top ${n}` : 'Alle'}</option>)}
            </select>
          </div>
          <DetailTabelle daten={sicht} />
          <div className="mono" style={{ fontSize: 11, color: 'var(--muted)', marginTop: 4 }}>
            {sicht.zeilen.length} von {sicht._gesamt} Zeile(n){view.top ? ` · Top ${view.top}` : ''}{view.sortIdx != null ? ` · sortiert nach ${daten.spalten[view.sortIdx]}` : ''}
          </div>
        </>
      )}
    </div>
  )
}

function Vorschau({ r, werte, rolle, onEditBlock }) {
  const kpiBloecke = r.bloecke.filter((b) => b.typ === 'kpi' && KPI[b.kpiId] && darfKpi(rolle, KPI[b.kpiId]))
  const bw = knotenBewertung(kpiBloecke.map((b) => kpiInsight(b.kpiId, werte[b.kpiId])))
  const v = bw.verteilung, total = Math.max(1, v.g + v.a + v.r + v.n)
  const massnahmen = ladeMassnahmen().filter((m) => m.status === 'offen' || m.status === 'in_arbeit')

  return (
    <div style={{ maxWidth: 820, background: 'var(--panel)', border: '1px solid var(--line)', borderRadius: 'var(--radius)', boxShadow: 'var(--shadow)', overflow: 'hidden' }}>
      <div style={{ padding: '18px 24px', borderBottom: '2px solid var(--accent)' }}>
        <div className="mono" style={{ fontSize: 11, color: 'var(--muted)', textTransform: 'uppercase' }}>Management Report · eigener Bericht</div>
        <h1 style={{ fontSize: 22, marginTop: 2 }}>{r.titel}</h1>
        {r.beschreibung && <div style={{ color: 'var(--accent)', fontWeight: 600, marginTop: 6, borderLeft: '3px solid var(--accent)', paddingLeft: 10 }}>{r.beschreibung}</div>}
      </div>
      <div style={{ padding: 24, display: 'grid', gap: 18 }}>
        {kpiBloecke.length > 0 && (
          <div style={{ border: '1px solid var(--line)', borderRadius: 'var(--radius)', padding: 12, background: 'var(--bg)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span className="mono" style={{ fontSize: 10.5, color: 'var(--muted)', textTransform: 'uppercase' }}>Lagebewertung</span>
              <div style={{ display: 'flex', width: 150, height: 8, borderRadius: 4, overflow: 'hidden', border: '1px solid var(--line)' }}>
                {['g', 'a', 'r', 'n'].map((s) => v[s] ? <div key={s} style={{ width: `${(v[s] / total) * 100}%`, background: AMPEL_FARBE[s] }} /> : null)}
              </div>
            </div>
            <div style={{ fontSize: 13.5, fontWeight: 600, marginTop: 4, color: v.r ? 'var(--amp-r)' : v.a ? 'var(--amp-a)' : 'var(--amp-g)' }}>{bw.kernaussage}</div>
          </div>
        )}

        {r.bloecke.map((b, i) => {
          if (b.typ === 'kpi') {
            const k = KPI[b.kpiId]; if (!k) return null
            if (!darfKpi(rolle, k)) return <div key={i} style={{ color: 'var(--muted)', fontSize: 13 }}>🔒 {k.name} — keine Berechtigung</div>
            const ins = kpiInsight(b.kpiId, werte[b.kpiId])
            return (
              <div key={i} style={{ display: 'flex', gap: 12, alignItems: 'center', border: '1px solid var(--line)', borderLeft: `3px solid ${AMPEL_FARBE[ins.status]}`, borderRadius: 'var(--radius)', padding: 12 }}>
                <AmpelPunkt status={ins.status} />
                <span style={{ flex: 1, fontWeight: 600 }}>{k.name}</span>
                <span className="mono" style={{ fontSize: 18, fontWeight: 700 }}>{formatWert(werte[b.kpiId], k.einheit)}</span>
                <span style={{ fontSize: 12, color: 'var(--muted)', width: 220 }}>{ins.aussage}</span>
              </div>
            )
          }
          if (b.typ === 'text') return (
            <div key={i}>
              <div className="mono" style={{ fontSize: 11, color: 'var(--accent)', textTransform: 'uppercase', marginBottom: 4 }}>{b.titel}</div>
              <p style={{ margin: 0, color: 'var(--slate)', fontSize: 14, lineHeight: 1.5, whiteSpace: 'pre-wrap' }}>{b.text}</p>
            </div>
          )
          if (b.typ === 'tabelle') return <TabellenBlock key={i} block={b} onCfg={onEditBlock ? (patch) => onEditBlock(i, patch) : null} />
          if (b.typ === 'massnahmen') return (
            <div key={i}>
              <div className="mono" style={{ fontSize: 11, color: 'var(--muted)', textTransform: 'uppercase', marginBottom: 6 }}>Maßnahmen (offen / in Arbeit)</div>
              {massnahmen.length ? massnahmen.map((m) => (
                <div key={m.id} style={{ display: 'flex', gap: 8, fontSize: 13, padding: '4px 0', borderTop: '1px solid var(--line)' }}>
                  <span style={{ flex: 1 }}>{m.titel}</span>
                  <span style={{ color: 'var(--muted)', fontSize: 12 }}>{m.owner || '—'} · {m.frist || m.faelligkeit || '—'} · {m.status}</span>
                </div>
              )) : <div style={{ color: 'var(--muted)', fontSize: 13 }}>Keine offenen Maßnahmen.</div>}
            </div>
          )
          return null
        })}
        {!r.bloecke.length && <div style={{ color: 'var(--muted)' }}>Vorschau — links Bausteine hinzufügen.</div>}
      </div>
    </div>
  )
}
