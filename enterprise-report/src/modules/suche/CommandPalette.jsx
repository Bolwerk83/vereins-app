// =========================================================================
//  COMMAND-PALETTE (⌘K / Strg+K) — zentrales „Springe zu …" über alle
//  Berichte und Kennzahlen. Bei 89 Sichten der schnellste Weg ans Ziel.
//  Nutzt denselben Such-Index wie die globale Suche (core/suche.js) inkl.
//  RBAC-Filterung. Tastatur: ↑/↓ wählen, ⏎ öffnen, Esc schließen.
// =========================================================================
import React, { useState, useMemo, useRef, useEffect } from 'react'
import { useT } from '../../core/i18n.jsx'
import { KPI } from '../../core/kpiRegistry.js'
import { baueIndex, suchen } from '../../core/suche.js'
import { darfBereich } from '../../core/rbac.js'
import { bereichVon, istAdminView } from '../../core/navMeta.js'

const GRUPPE_FARBE = { Berichte: 'var(--accent)', Analyse: '#7c3aed', Steuerung: '#0891b2', KPI: '#16a34a', Visual: '#db2777' }

export default function CommandPalette({ onGeh, onKpi, rolle, istAdmin = false }) {
  const { t } = useT()
  const [offen, setOffen] = useState(false)
  const [q, setQ] = useState('')
  const [aktiv, setAktiv] = useState(0)
  const inputRef = useRef(null)

  const index = useMemo(() => baueIndex(t, KPI), [t])
  const treffer = useMemo(() => suchen(index, q, 12), [index, q])

  const erlaubt = (e) => {
    if (e.typ !== 'kpi' && istAdminView(e.ziel) && !istAdmin) return false
    return e.typ === 'kpi'
      ? (!rolle || rolle.bereiche === '*' || (KPI[e.ziel] && rolle.bereiche.includes(KPI[e.ziel].bereich)))
      : (!rolle || darfBereich(rolle, bereichVon(e.ziel)))
  }
  // Empty-State: Kern-Einstiege + rollennahe Sichten zuerst.
  const empfohlen = useMemo(() => {
    const bereichOf = (e) => (e.typ === 'kpi' ? KPI[e.ziel]?.bereich : bereichVon(e.ziel))
    const score = (e) => {
      const ber = bereichOf(e)
      if (e.typ === 'bericht' && ['baum', 'kennzahlen', 'startseite', 'onepager'].includes(e.ziel)) return 3
      if (rolle && rolle.bereiche !== '*' && ber && rolle.bereiche.includes(ber)) return 2
      return e.typ === 'kpi' ? 0.5 : 1
    }
    return index.filter(erlaubt).sort((a, b) => score(b) - score(a)).slice(0, 8)
  }, [index, rolle]) // eslint-disable-line
  const liste = q ? treffer.filter(erlaubt) : empfohlen

  // Globaler Hotkey: ⌘K / Strg+K öffnet/schließt die Palette.
  useEffect(() => {
    const onKey = (e) => {
      if ((e.metaKey || e.ctrlKey) && (e.key === 'k' || e.key === 'K')) { e.preventDefault(); setOffen((o) => !o) }
      else if (e.key === 'Escape') setOffen(false)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  useEffect(() => { if (offen) { setQ(''); setAktiv(0); setTimeout(() => inputRef.current?.focus(), 20) } }, [offen])
  useEffect(() => { setAktiv(0) }, [q])

  function springe(tr) {
    if (!tr) return
    setOffen(false)
    if (tr.typ === 'kpi') onKpi?.(tr.ziel); else onGeh?.(tr.ziel)
  }
  function onKeyDown(e) {
    if (e.key === 'ArrowDown') { e.preventDefault(); setAktiv((i) => Math.min(i + 1, liste.length - 1)) }
    else if (e.key === 'ArrowUp') { e.preventDefault(); setAktiv((i) => Math.max(i - 1, 0)) }
    else if (e.key === 'Enter') { e.preventDefault(); springe(liste[aktiv]) }
  }

  if (!offen) return null
  return (
    <div onMouseDown={() => setOffen(false)} role="presentation"
      style={{ position: 'fixed', inset: 0, background: 'rgba(15,23,42,.45)', zIndex: 2000, display: 'flex', justifyContent: 'center', alignItems: 'flex-start', paddingTop: '12vh' }}>
      <div onMouseDown={(e) => e.stopPropagation()} role="dialog" aria-label="Befehle und Sprünge"
        style={{ width: 600, maxWidth: '92vw', background: 'var(--panel)', border: '1px solid var(--line)', borderRadius: 'var(--radius)', boxShadow: '0 24px 64px rgba(0,0,0,.35)', overflow: 'hidden' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 9, padding: '12px 15px', borderBottom: '1px solid var(--line)' }}>
          <span style={{ fontSize: 16, color: 'var(--muted)' }}>🔎</span>
          <input ref={inputRef} value={q} onChange={(e) => setQ(e.target.value)} onKeyDown={onKeyDown}
            placeholder="Springe zu Bericht oder Kennzahl …" aria-label="Suche"
            style={{ flex: 1, border: 'none', outline: 'none', background: 'transparent', font: 'inherit', fontSize: 15, color: 'var(--ink)' }} />
          <kbd style={{ fontSize: 10.5, color: 'var(--muted)', border: '1px solid var(--line)', borderRadius: 4, padding: '1px 6px' }}>Esc</kbd>
        </div>

        <div role="listbox" style={{ maxHeight: '52vh', overflowY: 'auto' }}>
          {!q && <div style={{ padding: '7px 15px', fontSize: 10.5, fontWeight: 700, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '.04em', background: 'var(--bg)' }}>Empfohlen{rolle?.name ? ` · ${rolle.name}` : ''}</div>}
          {q && liste.length === 0 && <div style={{ padding: '16px 15px', color: 'var(--muted)', fontSize: 13.5 }}>Kein Treffer für „{q}".</div>}
          {liste.map((tr, i) => {
            const gesperrt = tr.typ === 'bericht' && rolle && !darfBereich(rolle, bereichVon(tr.ziel))
            return (
              <div key={tr.typ + tr.ziel} role="option" aria-selected={i === aktiv}
                onMouseEnter={() => setAktiv(i)} onMouseDown={() => springe(tr)}
                style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 15px', cursor: 'pointer',
                  background: i === aktiv ? 'var(--bg)' : 'transparent', borderLeft: `3px solid ${i === aktiv ? (GRUPPE_FARBE[tr.gruppe] || 'var(--accent)') : 'transparent'}` }}>
                <span style={{ width: 8, height: 8, borderRadius: '50%', background: GRUPPE_FARBE[tr.gruppe] || 'var(--muted)', flex: '0 0 auto' }} />
                <span style={{ flex: 1, fontSize: 14, color: gesperrt ? 'var(--muted)' : 'var(--ink)' }}>{gesperrt ? '🔒 ' : ''}{tr.label}</span>
                <span style={{ fontSize: 10, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '.03em' }}>{tr.typ === 'kpi' ? 'KPI' : tr.gruppe}</span>
                {i === aktiv && <kbd style={{ fontSize: 10.5, color: 'var(--muted)', border: '1px solid var(--line)', borderRadius: 4, padding: '1px 6px' }}>⏎</kbd>}
              </div>
            )
          })}
        </div>
        <div style={{ padding: '7px 15px', fontSize: 10.5, color: 'var(--muted)', background: 'var(--bg)', borderTop: '1px solid var(--line)', display: 'flex', gap: 14 }}>
          <span>↑↓ wählen</span><span>⏎ öffnen</span><span>Esc schließen</span><span style={{ marginLeft: 'auto' }}>⌘K / Strg K</span>
        </div>
      </div>
    </div>
  )
}
