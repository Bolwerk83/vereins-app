// =========================================================================
//  GLOBALE SUCHE (oben rechts) — tippen und direkt in Bericht/KPI springen.
//  Tastatur: ↑/↓ navigieren, Enter öffnet, Esc schließt, "/" fokussiert.
// =========================================================================
import React, { useState, useMemo, useRef, useEffect } from 'react'
import { useT } from '../../core/i18n.jsx'
import { KPI } from '../../core/kpiRegistry.js'
import { baueIndex, suchen } from '../../core/suche.js'
import { darfBereich } from '../../core/rbac.js'
import { bereichVon, istAdminView } from '../../core/navMeta.js'

export default function GlobalSuche({ onGeh, onKpi, onInfo, rolle, istAdmin = false }) {
  const { t } = useT()
  const [q, setQ] = useState('')
  const [offen, setOffen] = useState(false)
  const [aktiv, setAktiv] = useState(0)
  const boxRef = useRef(null)
  const inputRef = useRef(null)

  const index = useMemo(() => baueIndex(t, KPI), [t])
  const treffer = useMemo(() => suchen(index, q, 8), [index, q])

  // Vorauswahl beim Reinklicken (leere Eingabe): die für die Rolle passendsten Einträge.
  const bereichOf = (e) => (e.typ === 'kpi' ? KPI[e.ziel]?.bereich : bereichVon(e.ziel))
  const erlaubt = (e) => {
    if (e.typ !== 'kpi' && istAdminView(e.ziel) && !istAdmin) return false // Admin-Sichten nur für Admins
    return e.typ === 'kpi'
      ? (!rolle || rolle.bereiche === '*' || (KPI[e.ziel] && rolle.bereiche.includes(KPI[e.ziel].bereich)))
      : (!rolle || darfBereich(rolle, bereichVon(e.ziel)))
  }
  const vorauswahl = useMemo(() => {
    const score = (e) => {
      const ber = bereichOf(e)
      if (rolle && rolle.bereiche !== '*' && ber && rolle.bereiche.includes(ber)) return 3 // genau meine Rolle
      if (e.typ === 'bericht' && ['baum', 'kennzahlen', 'katalog'].includes(e.ziel)) return 2 // Kern-Einstiege
      return e.typ === 'kpi' ? 1 : 1.5
    }
    return index.filter(erlaubt).sort((a, b) => score(b) - score(a)).slice(0, 7)
  }, [index, rolle]) // eslint-disable-line
  const liste = q ? treffer : vorauswahl

  // "/" fokussiert die Suche (wenn nicht in einem Eingabefeld).
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === '/' && !/^(INPUT|TEXTAREA|SELECT)$/.test(document.activeElement?.tagName)) {
        e.preventDefault(); inputRef.current?.focus()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  // Klick außerhalb schließt das Dropdown.
  useEffect(() => {
    const onClick = (e) => { if (boxRef.current && !boxRef.current.contains(e.target)) setOffen(false) }
    document.addEventListener('mousedown', onClick)
    return () => document.removeEventListener('mousedown', onClick)
  }, [])

  useEffect(() => { setAktiv(0) }, [q])

  function springe(tr) {
    if (!tr) return
    setOffen(false); setQ('')
    if (tr.typ === 'kpi') onKpi?.(tr.ziel)
    else onGeh?.(tr.ziel)
  }

  function onKeyDown(e) {
    if (!offen && liste.length) setOffen(true)
    if (e.key === 'ArrowDown') { e.preventDefault(); setAktiv((i) => Math.min(i + 1, liste.length - 1)) }
    else if (e.key === 'ArrowUp') { e.preventDefault(); setAktiv((i) => Math.max(i - 1, 0)) }
    else if (e.key === 'Enter') { e.preventDefault(); springe(liste[aktiv]) }
    else if (e.key === 'Escape') { setOffen(false); inputRef.current?.blur() }
  }

  const gruppenFarbe = { Berichte: 'var(--accent)', Analyse: '#7c3aed', Steuerung: '#0891b2', KPI: '#16a34a', Visual: '#db2777' }

  return (
    <div ref={boxRef} style={{ position: 'relative', minWidth: 180 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, border: '1px solid var(--line)', borderRadius: 'var(--radius-sm)',
        padding: '5px 9px', background: 'var(--panel)' }}>
        <span style={{ color: 'var(--muted)', fontSize: 13 }}>🔎</span>
        <input
          ref={inputRef}
          value={q}
          placeholder={t('suche.platzhalter')}
          aria-label={t('suche.platzhalter')}
          role="combobox" aria-expanded={offen} aria-controls="suche-treffer"
          onChange={(e) => { setQ(e.target.value); setOffen(true) }}
          onFocus={() => setOffen(true)}
          onKeyDown={onKeyDown}
          style={{ border: 'none', outline: 'none', background: 'transparent', font: 'inherit', fontSize: 12, width: 150, color: 'var(--ink)' }} />
        {q && <button onClick={() => { setQ(''); inputRef.current?.focus() }} aria-label="Suche leeren"
          style={{ border: 'none', background: 'transparent', cursor: 'pointer', color: 'var(--muted)', fontSize: 13 }}>×</button>}
      </div>

      {offen && (
        <div id="suche-treffer" role="listbox" style={{ position: 'absolute', top: 'calc(100% + 4px)', right: 0, width: 320, maxWidth: '80vw', background: 'var(--panel)',
          border: '1px solid var(--line)', borderRadius: 'var(--radius)', boxShadow: 'var(--shadow)', zIndex: 50, overflow: 'hidden' }}>
          {!q && (
            <div style={{ padding: '8px 12px', fontSize: 10.5, fontWeight: 700, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '.04em', background: 'var(--bg)', borderBottom: '1px solid var(--line)' }}>
              Empfohlen für deine Rolle{rolle?.name ? ` · ${rolle.name}` : ''}
            </div>
          )}
          {q && treffer.length === 0 && (
            <div style={{ padding: '12px 14px', color: 'var(--muted)', fontSize: 13 }}>{t('suche.leer')}</div>
          )}
          {liste.map((tr, i) => {
            const gesperrt = tr.typ === 'bericht' && rolle && !darfBereich(rolle, bereichVon(tr.ziel))
            return (
            <div
              key={tr.typ + tr.ziel}
              onMouseEnter={() => setAktiv(i)}
              onClick={() => springe(tr)}
              style={{ display: 'flex', alignItems: 'center', gap: 8, width: '100%', textAlign: 'left', cursor: 'pointer',
                padding: '9px 12px', background: i === aktiv ? 'var(--bg)' : 'transparent', borderBottom: '1px solid var(--line)' }}>
              <span style={{ width: 8, height: 8, borderRadius: '50%', background: gruppenFarbe[tr.gruppe] || 'var(--muted)', flex: '0 0 auto' }} />
              <span style={{ flex: 1, fontSize: 13, color: gesperrt ? 'var(--muted)' : 'var(--ink)' }}>{gesperrt ? '🔒 ' : ''}{tr.label}</span>
              {tr.typ === 'bericht' && onInfo && (
                <button onClick={(ev) => { ev.stopPropagation(); onInfo(tr.ziel); setOffen(false) }} title="Bericht-Info"
                  style={{ border: 'none', background: 'none', cursor: 'pointer', fontSize: 12, color: 'var(--muted)' }}>ⓘ</button>
              )}
              <span style={{ fontSize: 10, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '.03em' }}>
                {tr.typ === 'kpi' ? 'KPI' : tr.gruppe}
              </span>
            </div>
          )})}
          {liste.length > 0 && (
            <div style={{ padding: '6px 12px', fontSize: 10.5, color: 'var(--muted)', background: 'var(--bg)' }}>
              {q ? '' : 'Tippen zum Suchen · '}↑↓ wählen · ⏎ öffnen · Esc schließen
            </div>
          )}
        </div>
      )}
    </div>
  )
}
