// Gemeinsame UI-Bausteine — von ALLEN Modulen genutzt -> einheitliches Design.
import React, { useState, useEffect } from 'react'
import { KPI } from '../core/kpiRegistry.js'
import { ampelStatus, trendAusHistorie } from '../core/ampel.js'
import { AMPEL_FARBE, AMPEL_SOFT, AMPEL_LABEL, formatWert, TREND_ICON } from '../design/theme.js'
import { useKpiDef } from '../modules/kennzahlen/KpiDefContext.jsx'
import { useFenster } from '../core/useFenster.js'
import { ladeBookmarks, addBookmark, loescheBookmark, ladeLetzte, merkeLetzte } from '../core/bookmarks.js'

export function AmpelPunkt({ status, size = 10 }) {
  return <span style={{ display: 'inline-block', width: size, height: size, borderRadius: '50%',
    background: AMPEL_FARBE[status] || AMPEL_FARBE.n }} />
}

export function Badge({ children, status = 'n' }) {
  return <span className="mono" style={{ fontSize: 11, padding: '2px 7px', borderRadius: 999,
    color: AMPEL_FARBE[status], background: AMPEL_SOFT[status], border: `1px solid ${AMPEL_FARBE[status]}22` }}>{children}</span>
}

/** KPI-Kachel: Wert + Ziel + Ampel + Trend. Berechnet Status zentral. */
export function KpiCard({ kpiId, wert, historie, onClick }) {
  const k = KPI[kpiId]
  const def = useKpiDef()
  if (!k) return null
  const status = ampelStatus({ wert, ziel: k.ziel, richtung: k.richtung, warn: k.warn })
  const t = historie ? trendAusHistorie(historie.map((h) => h.wert), k.richtung) : null
  return (
    <button onClick={onClick} style={{ textAlign: 'left', background: 'var(--panel)', border: '1px solid var(--line)',
      borderLeft: `3px solid ${AMPEL_FARBE[status]}`, borderRadius: 'var(--radius)', padding: 14, minWidth: 150,
      flex: '1 1 0', boxShadow: 'var(--shadow)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 6 }}>
        <span className="mono" style={{ fontSize: 11, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '.04em' }}>{k.name}</span>
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
          {def && <span role="button" title="Kennzahlen-Definition öffnen"
            onClick={(e) => { e.stopPropagation(); def.oeffne(kpiId) }}
            style={{ cursor: 'pointer', color: 'var(--muted)', fontSize: 13, fontWeight: 700, lineHeight: 1 }}>ⓘ</span>}
          <AmpelPunkt status={status} />
        </span>
      </div>
      <div className="mono" style={{ fontSize: 24, fontWeight: 600, marginTop: 6 }}>{formatWert(wert, k.einheit)}</div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 4 }}>
        <span style={{ fontSize: 11, color: 'var(--muted)' }}>{k.ziel != null ? `Ziel ${formatWert(k.ziel, k.einheit)}` : '—'}</span>
        {t && <span className="mono" style={{ fontSize: 11, color: t.istGut ? 'var(--amp-g)' : 'var(--amp-r)' }}>
          {TREND_ICON[t.trend]} {t.deltaPct >= 0 ? '+' : ''}{t.deltaPct.toFixed(1)} %</span>}
      </div>
    </button>
  )
}

/** Geschützte KPI (Object-Level-Security greift). */
export function KpiGesperrt({ kpiId }) {
  const k = KPI[kpiId]
  return (
    <div style={{ background: 'var(--panel)', border: '1px dashed var(--line)', borderRadius: 'var(--radius)',
      padding: 14, minWidth: 150, flex: '1 1 0', color: 'var(--muted)' }}>
      <div className="mono" style={{ fontSize: 11, textTransform: 'uppercase' }}>{k?.name}</div>
      <div style={{ fontSize: 13, marginTop: 10 }}>🔒 Keine Berechtigung</div>
      <div style={{ fontSize: 11, marginTop: 4 }}>nur {k?.security?.join(' / ')}</div>
    </div>
  )
}

export function DetailTabelle({ daten, onZeileKlick, spaltenWahl = false }) {
  const alle = daten?.spalten || []
  const key = 'tree:' + (daten?.titel || 'tabelle')
  const [sichtbar, setSichtbar] = useState(() => {
    const g = ladeLetzte(key), gv = g && g.filter((l) => alle.includes(l))
    return new Set(gv && gv.length ? gv : alle)
  })
  const [panelAuf, setPanelAuf] = useState(false)
  const [, setBmTick] = useState(0)
  useEffect(() => { if (spaltenWahl) merkeLetzte(key, [...sichtbar]) }, [key, sichtbar, spaltenWahl])
  const zeilen = daten?.zeilen || []
  // Virtualisierung greift erst ab vielen Zeilen; kleine Tabellen bleiben unverändert.
  const f = useFenster({ anzahl: zeilen.length })
  if (!daten) return <div style={{ color: 'var(--muted)' }}>Keine Detaildaten.</div>

  // Sichtbare Spalten als Original-Indizes (Reihenfolge/Ausrichtung bleiben erhalten).
  const aktiv = spaltenWahl ? alle.map((l, i) => i).filter((i) => sichtbar.has(alle[i])) : alle.map((l, i) => i)
  const spaltenZahl = aktiv.length

  const zeile = (z, ri) => (
    <tr key={ri} onClick={onZeileKlick ? () => onZeileKlick(ri) : undefined}
      style={onZeileKlick ? { cursor: 'pointer' } : undefined}
      onMouseEnter={onZeileKlick ? (e) => e.currentTarget.style.background = 'var(--accent-soft)' : undefined}
      onMouseLeave={onZeileKlick ? (e) => e.currentTarget.style.background = 'transparent' : undefined}>
      {aktiv.map((oi, di) => (
        <td key={di} className={oi === 0 ? '' : 'mono'} style={{ textAlign: oi === 0 ? 'left' : 'right',
          padding: '8px 14px', borderBottom: '1px solid var(--line)',
          ...(f.aktiv ? { height: f.zeilenHoehe, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: 320 } : null) }}>{z[oi]}</td>
      ))}</tr>
  )

  const kopf = (
    <thead><tr>{aktiv.map((oi, di) => (
      <th key={di} style={{ textAlign: oi === 0 ? 'left' : 'right', padding: '8px 14px', color: 'var(--muted)',
        fontWeight: 500, fontSize: 11, textTransform: 'uppercase', borderBottom: '1px solid var(--line)',
        ...(f.aktiv ? { position: 'sticky', top: 0, background: 'var(--panel)', zIndex: 1 } : null) }}>{alle[oi]}</th>))}</tr></thead>
  )

  // Spalten-/Bookmark-Steuerung (nur wenn spaltenWahl aktiv und mehr als eine Spalte).
  const wahlAn = spaltenWahl && alle.length > 1
  const bookmarks = [{ id: 'voll', name: 'Vollansicht', sichtbar: alle, system: true }, ...ladeBookmarks(key)]
  const gleich = (arr) => arr.length === sichtbar.size && arr.every((l) => sichtbar.has(l))
  const toggleSp = (l) => setSichtbar((s) => { const n = new Set(s); n.has(l) ? n.delete(l) : n.add(l); if (n.size === 0) n.add(l); return n })
  const chip = { fontSize: 12, padding: '4px 9px', borderRadius: 999, cursor: 'pointer' }
  const werkzeug = wahlAn ? (
    <button onClick={() => setPanelAuf((v) => !v)} title="Spalten ein-/ausblenden & Ansichten"
      style={{ border: `1px solid ${panelAuf ? 'var(--accent)' : 'var(--line)'}`, background: 'var(--panel)', color: panelAuf ? 'var(--accent)' : 'var(--ink)', borderRadius: 'var(--radius-sm)', padding: '4px 10px', cursor: 'pointer', fontSize: 12, fontWeight: 600 }}>
      🔖 Spalten ({spaltenZahl}/{alle.length})
    </button>
  ) : null
  const panel = wahlAn && panelAuf ? (
    <div className="no-print" style={{ padding: '10px 14px', borderBottom: '1px solid var(--line)', background: 'var(--bg)' }}>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 8 }}>
        {bookmarks.map((b) => {
          const an = gleich(b.sichtbar)
          return (
            <span key={b.id} style={{ ...chip, display: 'inline-flex', alignItems: 'center', gap: 5, paddingRight: b.system ? 9 : 5, border: `1px solid ${an ? 'var(--accent)' : 'var(--line)'}`, background: an ? 'var(--accent-soft)' : 'var(--panel)', color: an ? 'var(--accent)' : 'var(--ink)' }}>
              <span onClick={() => setSichtbar(new Set(b.sichtbar.filter((l) => alle.includes(l))))}>{b.system ? '' : '🔖 '}{b.name}</span>
              {!b.system && <button onClick={() => { loescheBookmark(key, b.id); setBmTick((t) => t + 1) }} style={{ border: 'none', background: 'none', cursor: 'pointer', color: 'var(--muted)' }}>×</button>}
            </span>
          )
        })}
        <button onClick={() => { const n = prompt('Name für diese Ansicht (Bookmark):'); if (n && n.trim()) { addBookmark(key, n, [...sichtbar]); setBmTick((t) => t + 1) } }}
          style={{ ...chip, border: '1px dashed var(--line)', background: 'var(--panel)' }}>＋ Ansicht speichern</button>
      </div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
        {alle.map((l) => { const an = sichtbar.has(l); return (
          <button key={l} onClick={() => toggleSp(l)} style={{ ...chip, border: `1px solid ${an ? 'var(--accent)' : 'var(--line)'}`, background: an ? 'var(--accent-soft)' : 'var(--panel)', color: an ? 'var(--accent)' : 'var(--muted)' }}>{an ? '✓ ' : '＋ '}{l}</button>
        ) })}
      </div>
    </div>
  ) : null

  // Kleine Tabelle: unverändertes Verhalten (volle Liste, frei wachsend).
  if (!f.aktiv) {
    return (
      <div className="tabelle-scroll" style={{ background: 'var(--panel)', border: '1px solid var(--line)', borderRadius: 'var(--radius)', overflow: 'auto' }}>
        <div style={{ padding: '10px 14px', borderBottom: panel ? 'none' : '1px solid var(--line)', fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
          <span>{daten.titel}</span>{werkzeug}
        </div>
        {panel}
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13, minWidth: 480 }}>
          {kopf}<tbody>{zeilen.map(zeile)}</tbody>
        </table>
      </div>
    )
  }

  // Große Tabelle: nur sichtbare Zeilen rendern, Höhe über Platzhalterzeilen halten.
  return (
    <div style={{ background: 'var(--panel)', border: '1px solid var(--line)', borderRadius: 'var(--radius)' }}>
      <div style={{ padding: '10px 14px', borderBottom: panel ? 'none' : '1px solid var(--line)', fontWeight: 600, display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12 }}>
        <span>{daten.titel}</span>
        <span style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          {werkzeug}
          <span className="mono" style={{ fontSize: 11, color: 'var(--muted)' }}>{zeilen.length.toLocaleString('de-DE')} Zeilen · virtualisiert</span>
        </span>
      </div>
      {panel}
      <div ref={f.refContainer} onScroll={f.onScroll} style={{ maxHeight: f.hoehe, overflow: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13, minWidth: 480 }}>
          {kopf}
          <tbody>
            {f.vorHoehe > 0 && <tr style={{ height: f.vorHoehe }}><td colSpan={spaltenZahl} style={{ padding: 0, border: 'none' }} /></tr>}
            {zeilen.slice(f.start, f.ende).map((z, i) => zeile(z, f.start + i))}
            {f.nachHoehe > 0 && <tr style={{ height: f.nachHoehe }}><td colSpan={spaltenZahl} style={{ padding: 0, border: 'none' }} /></tr>}
          </tbody>
        </table>
      </div>
    </div>
  )
}

/** Mini-Sparkline für die Historisierung (Ebene 5). */
export function Sparkline({ reihe, richtung = 'hoch_gut', w = 220, h = 56 }) {
  const werte = reihe.map((r) => r.wert).filter((v) => v != null)
  if (werte.length < 2) return <div style={{ color: 'var(--muted)' }}>Zu wenig Historie.</div>
  const min = Math.min(...werte), max = Math.max(...werte), span = max - min || 1
  const pts = reihe.map((r, i) => {
    const x = (i / (reihe.length - 1)) * (w - 8) + 4
    const y = h - 4 - ((r.wert - min) / span) * (h - 12)
    return [x, y]
  })
  const d = pts.map((p, i) => (i ? 'L' : 'M') + p[0].toFixed(1) + ' ' + p[1].toFixed(1)).join(' ')
  const t = trendAusHistorie(werte, richtung)
  const farbe = t.istGut ? 'var(--amp-g)' : 'var(--amp-r)'
  return (
    <svg width={w} height={h} style={{ overflow: 'visible' }}>
      <path d={d} fill="none" stroke={farbe} strokeWidth="2" />
      {pts.map((p, i) => <circle key={i} cx={p[0]} cy={p[1]} r="2.5" fill={farbe} />)}
    </svg>
  )
}
