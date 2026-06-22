// =========================================================================
//  KPI-EDITOR — eigene, abgeleitete KPIs aus Formeln über bestehende KPIs
//  anlegen (z. B. „db1 / nettoumsatz * 100"). Live-Vorschau & Validierung;
//  gespeicherte KPIs stehen in der ganzen App zur Verfügung.
// =========================================================================
import React, { useState, useMemo } from 'react'
import { KPI, registerCustomKpis } from '../../core/kpiRegistry.js'
import { ladeCustomKpis, speichereCustomKpi, entferneCustomKpi, validiere, evaluate, slug } from '../../core/kpiFormel.js'
import { formatWert } from '../../design/theme.js'

const card = { background: 'var(--panel)', border: '1px solid var(--line)', borderRadius: 'var(--radius)', boxShadow: 'var(--shadow)' }
const cap = { fontSize: 11, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '.03em', fontWeight: 700 }
const inp = { padding: '8px 10px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--line)', font: 'inherit', fontSize: 13, width: '100%' }
const EINHEITEN = [['faktor', 'Faktor (×)'], ['percent', 'Prozent (%)'], ['eur_mio', 'Mio €'], ['eur', '€'], ['days', 'Tage'], ['count', 'Anzahl']]

const LEER = { id: null, name: '', formel: '', einheit: 'percent', richtung: 'hoch_gut', ziel: '', beschreibung: '' }

export default function KpiEditor({ werte = {}, onChange }) {
  const [form, setForm] = useState(LEER)
  const [tick, setTick] = useState(0)
  const [filter, setFilter] = useState('')
  const custom = ladeCustomKpis()

  // Gültige Bezeichner = Basis-KPIs (nicht-custom) + andere Custom-IDs.
  const basisIds = useMemo(() => Object.values(KPI).filter((k) => !k.custom).map((k) => k.id), [tick])
  const vorhandeneIds = useMemo(() => new Set([...basisIds, ...custom.map((c) => c.id).filter((id) => id !== form.id)]), [basisIds, custom, form.id])

  const val = validiere({ ...form, id: form.id || slug(form.name) }, vorhandeneIds)
  let preview = null, previewFehler = null
  if (form.formel && val.ok) { try { preview = evaluate(form.formel, werte) } catch (e) { previewFehler = e.message } }

  function neu() { setForm(LEER) }
  function bearbeite(d) { setForm({ ...d, ziel: d.ziel ?? '' }) }
  function speichern() {
    const id = form.id || eindeutig(slug(form.name), custom.map((c) => c.id))
    const def = { id, name: form.name.trim(), formel: form.formel.trim(), einheit: form.einheit, richtung: form.richtung,
      ziel: form.ziel === '' ? null : Number(form.ziel), beschreibung: form.beschreibung.trim() }
    speichereCustomKpi(def); registerCustomKpis(); onChange?.(); setForm(LEER); setTick((t) => t + 1)
  }
  function loeschen(id) { entferneCustomKpi(id); registerCustomKpis(); onChange?.(); if (form.id === id) setForm(LEER); setTick((t) => t + 1) }
  function insert(id) { setForm((f) => ({ ...f, formel: (f.formel + (f.formel && !/[\s(]$/.test(f.formel) ? ' ' : '') + id) })) }

  const gefilterteIds = basisIds.filter((id) => !filter || id.toLowerCase().includes(filter.toLowerCase()) || (KPI[id]?.name || '').toLowerCase().includes(filter.toLowerCase())).slice(0, 40)

  return (
    <div style={{ maxWidth: '100%', margin: '0 auto' }} key={tick}>
      <div style={{ marginBottom: 14 }}>
        <h2 style={{ margin: '0 0 4px' }}>KPI-Editor — eigene Kennzahlen</h2>
        <div style={{ color: 'var(--muted)', fontSize: 13, maxWidth: 720 }}>
          Definiere abgeleitete KPIs aus einer Formel über bestehende Kennzahlen (z. B. <code>db1 / nettoumsatz * 100</code>).
          Gespeicherte KPIs werden sofort mitberechnet und stehen ohne Neuladen in allen Berichten zur Verfügung.
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: 16, alignItems: 'start' }}>
        {/* Formular */}
        <div style={{ ...card, padding: 16 }}>
          <div style={{ ...cap, marginBottom: 10 }}>{form.id ? 'KPI bearbeiten' : 'Neue KPI'}</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            <label style={{ gridColumn: '1 / -1', fontSize: 11, color: 'var(--muted)' }}>Name<input style={inp} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="z. B. Marketing-Effizienz" /></label>
            <label style={{ gridColumn: '1 / -1', fontSize: 11, color: 'var(--muted)' }}>Formel
              <input style={{ ...inp, fontFamily: 'ui-monospace, monospace' }} value={form.formel} onChange={(e) => setForm({ ...form, formel: e.target.value })} placeholder="db1 / nettoumsatz * 100" />
            </label>
            <label style={{ fontSize: 11, color: 'var(--muted)' }}>Einheit
              <select style={inp} value={form.einheit} onChange={(e) => setForm({ ...form, einheit: e.target.value })}>{EINHEITEN.map(([v, l]) => <option key={v} value={v}>{l}</option>)}</select>
            </label>
            <label style={{ fontSize: 11, color: 'var(--muted)' }}>Richtung
              <select style={inp} value={form.richtung} onChange={(e) => setForm({ ...form, richtung: e.target.value })}>
                <option value="hoch_gut">hoch = gut</option><option value="tief_gut">tief = gut</option>
              </select>
            </label>
            <label style={{ fontSize: 11, color: 'var(--muted)' }}>Zielwert (optional)<input style={inp} type="number" value={form.ziel} onChange={(e) => setForm({ ...form, ziel: e.target.value })} /></label>
            <label style={{ fontSize: 11, color: 'var(--muted)' }}>Beschreibung<input style={inp} value={form.beschreibung} onChange={(e) => setForm({ ...form, beschreibung: e.target.value })} /></label>
          </div>

          {/* Vorschau / Validierung */}
          <div style={{ marginTop: 12, padding: '10px 12px', borderRadius: 'var(--radius-sm)', background: 'var(--bg)' }}>
            {!form.formel && <span style={{ fontSize: 13, color: 'var(--muted)' }}>Formel eingeben für die Vorschau …</span>}
            {form.formel && !val.ok && <span style={{ fontSize: 13, color: 'var(--amp-r)' }}>⚠ {val.fehler.join(' ')}</span>}
            {form.formel && val.ok && previewFehler && <span style={{ fontSize: 13, color: 'var(--amp-r)' }}>⚠ {previewFehler}</span>}
            {form.formel && val.ok && preview != null && (
              <span style={{ fontSize: 13 }}>Vorschau (aktuelle Periode): <b style={{ fontSize: 16 }}>{formatWert(preview, form.einheit)}</b>
                <span style={{ color: 'var(--muted)' }}> · nutzt {val.ids.join(', ')}</span></span>
            )}
          </div>

          <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
            <button onClick={speichern} disabled={!val.ok || preview == null}
              style={{ padding: '8px 16px', borderRadius: 'var(--radius-sm)', border: 'none', cursor: val.ok && preview != null ? 'pointer' : 'not-allowed',
                background: val.ok && preview != null ? 'var(--accent)' : 'var(--line)', color: '#fff', fontSize: 13, fontWeight: 600 }}>
              {form.id ? 'Änderungen speichern' : 'KPI anlegen'}
            </button>
            {form.id && <button onClick={neu} style={{ padding: '8px 14px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--line)', background: 'var(--panel)', cursor: 'pointer', fontSize: 13 }}>Abbrechen</button>}
          </div>

          {/* Bestehende Custom-KPIs */}
          <div style={{ ...cap, margin: '18px 0 8px' }}>Eigene KPIs ({custom.length})</div>
          {custom.length === 0 && <div style={{ fontSize: 13, color: 'var(--muted)' }}>Noch keine eigene KPI angelegt.</div>}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {custom.map((d) => {
              let w = null; try { w = evaluate(d.formel, werte) } catch {}
              return (
                <div key={d.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 10px', border: '1px solid var(--line)', borderRadius: 'var(--radius-sm)' }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 600, fontSize: 13 }}>{d.name} {w != null && <span style={{ color: 'var(--accent)' }}>= {formatWert(w, d.einheit)}</span>}</div>
                    <div className="mono" style={{ fontSize: 11.5, color: 'var(--muted)' }}>{d.formel}</div>
                  </div>
                  <button onClick={() => bearbeite(d)} style={{ border: '1px solid var(--line)', background: 'var(--panel)', borderRadius: 'var(--radius-sm)', cursor: 'pointer', padding: '4px 9px', fontSize: 12 }}>Bearbeiten</button>
                  <button onClick={() => loeschen(d.id)} style={{ border: '1px solid var(--line)', background: 'var(--panel)', color: 'var(--muted)', borderRadius: 'var(--radius-sm)', cursor: 'pointer', padding: '4px 9px', fontSize: 12 }}>Löschen</button>
                </div>
              )
            })}
          </div>
        </div>

        {/* KPI-Bausteine zum Einsetzen */}
        <div style={{ ...card, padding: 14, position: 'sticky', top: 70 }}>
          <div style={{ ...cap, marginBottom: 8 }}>Bausteine (klicken zum Einsetzen)</div>
          <input value={filter} onChange={(e) => setFilter(e.target.value)} placeholder="🔎 KPI suchen …" style={{ ...inp, marginBottom: 8 }} />
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5, maxHeight: 360, overflowY: 'auto' }}>
            {gefilterteIds.map((id) => (
              <button key={id} onClick={() => insert(id)} title={KPI[id]?.name}
                style={{ fontFamily: 'ui-monospace, monospace', fontSize: 11, padding: '3px 7px', borderRadius: 6, border: '1px solid var(--line)', background: 'var(--bg)', cursor: 'pointer' }}>
                {id}
              </button>
            ))}
          </div>
          <div style={{ fontSize: 11, color: 'var(--muted)', marginTop: 10 }}>Operatoren: + − * / und Klammern ( ). Beispiel: <code>(ebit / nettoumsatz) * 100</code></div>
        </div>
      </div>
    </div>
  )
}

function eindeutig(basis, vorhandene) {
  let id = basis, i = 2
  while (vorhandene.includes(id)) id = basis + '_' + i++
  return id
}
