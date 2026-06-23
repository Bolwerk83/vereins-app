// =========================================================================
//  GLOBALER FILTER-KONTEXT — Zeitraum & Profit-Center werden EINMAL oben
//  gesetzt und gelten für alle Berichte, die sie auswerten. So muss man die
//  Sicht (z. B. „Q2 · Online-Handel") nicht in jedem Bericht neu einstellen.
//  Die berichtsspezifische Zeitdimension (Bestell-/Beleg-/Lieferdatum …)
//  bleibt bewusst lokal, da sie je Fachbereich unterschiedlich ist.
//  Auswahl wird in localStorage gemerkt.
// =========================================================================
import React, { createContext, useContext, useState, useCallback } from 'react'
import { ZEITRAEUME, pcBaum, filterLabel } from './statistikFilter.js'

const KEY = 'er_globalfilter'
const DEF = { zeitraum: 'jahr', pc: 'alle' }
function lade() {
  try { const r = localStorage.getItem(KEY); return r == null ? DEF : { ...DEF, ...JSON.parse(r) } } catch { return DEF }
}

const Ctx = createContext(null)

export function FilterProvider({ children }) {
  const [filter, setFilter] = useState(lade)
  const update = useCallback((teil) => setFilter((f) => {
    const n = { ...f, ...teil }
    try { localStorage.setItem(KEY, JSON.stringify(n)) } catch {}
    return n
  }), [])
  const val = {
    zeitraum: filter.zeitraum, pc: filter.pc,
    setZeitraum: (z) => update({ zeitraum: z }),
    setPc: (p) => update({ pc: p }),
    set: update
  }
  return <Ctx.Provider value={val}>{children}</Ctx.Provider>
}

export function useGlobalFilter() {
  const c = useContext(Ctx)
  return c || { zeitraum: 'jahr', pc: 'alle', setZeitraum: () => {}, setPc: () => {}, set: () => {} }
}

// ---- Globale Filter-Leiste (Topbar-nah) ----------------------------------
const cap = { fontSize: 10, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '.04em', fontWeight: 700 }
const sel = { padding: '5px 8px', border: '1px solid var(--line)', borderRadius: 'var(--radius-sm)', background: 'var(--panel)', color: 'var(--ink)', fontSize: 13, fontWeight: 600, cursor: 'pointer' }

export function GlobalFilterLeiste() {
  const g = useGlobalFilter()
  return (
    <div className="no-print" style={{ display: 'flex', gap: 18, flexWrap: 'wrap', alignItems: 'flex-end', marginBottom: 14,
      background: 'var(--accent-soft)', border: '1px solid var(--line)', borderRadius: 'var(--radius)', padding: '9px 14px' }}>
      <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--accent)', alignSelf: 'center', display: 'flex', alignItems: 'center', gap: 5 }}>🎯 Globale Sicht</span>
      <label style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
        <span style={cap}>Zeitraum</span>
        <select style={sel} value={g.zeitraum} onChange={(e) => g.setZeitraum(e.target.value)}>
          {ZEITRAEUME.map((z) => <option key={z.id} value={z.id}>{z.name}</option>)}
        </select>
      </label>
      <label style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
        <span style={cap}>Profit-Center (inkl. Kanal)</span>
        <select style={sel} value={g.pc} onChange={(e) => g.setPc(e.target.value)}>
          <option value="alle">Gesamtunternehmen</option>
          {pcBaum().map((gr) => (
            <optgroup key={gr.id} label={gr.name}>
              {gr.knoten.map((k) => <option key={k.id} value={k.id}>{k.name}</option>)}
            </optgroup>
          ))}
        </select>
      </label>
      <span style={{ fontSize: 11, color: 'var(--muted)', marginLeft: 'auto', alignSelf: 'center', maxWidth: 300, lineHeight: 1.4 }}>
        Gilt für alle Statistik-Berichte: <b>{filterLabel(g.zeitraum, g.pc)}</b>. Die Zeitdimension stellst du je Bericht ein.
      </span>
    </div>
  )
}
