// =========================================================================
//  CHARTS — gemeinsame, theme-fähige Diagramm-Bausteine für alle Berichte.
//  Einheitlicher Stil: Gitterlinien, Verlaufs-Balken, hervorgehobener Spitzen-
//  wert, abgerundete Ecken. Farben kommen aus den CSS-Tokens (--accent, --line,
//  --bg …), funktionieren also automatisch in Hell- und Dunkelmodus.
// =========================================================================
import React from 'react'
export { Sparkline } from './ui.jsx'

const BAR = 'linear-gradient(180deg, var(--accent), color-mix(in srgb, var(--accent) 42%, transparent))'
const BAR_PEAK = 'linear-gradient(180deg, color-mix(in srgb, var(--accent) 80%, #000), var(--accent))'
const farbBar = (c) => `linear-gradient(180deg, ${c}, color-mix(in srgb, ${c} 42%, transparent))`
const GRID = [0.25, 0.5, 0.75]

/** Anteils-Zelle: Balken + Prozent (umbruchsicher) — für Tabellen. */
export function AnteilZelle({ pct, w = 56, farbe }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, justifyContent: 'flex-end' }}>
      <div style={{ width: w, height: 8, background: 'var(--bg)', border: '1px solid var(--line)', borderRadius: 999, overflow: 'hidden' }}
        role="img" aria-label={`Anteil ${pct} Prozent`}>
        <div style={{ width: Math.min(100, Math.max(0, pct)) + '%', height: '100%', background: farbe ? farbBar(farbe) : BAR, borderRadius: 999 }} />
      </div>
      <span className="mono" style={{ minWidth: 46, textAlign: 'right', whiteSpace: 'nowrap' }}>{pct} %</span>
    </div>
  )
}

function Gitter({ H }) {
  return (
    <div style={{ position: 'absolute', left: 0, right: 0, top: 0, height: H, pointerEvents: 'none' }} aria-hidden="true">
      {GRID.map((g) => <div key={g} style={{ position: 'absolute', left: 0, right: 0, bottom: g * H, borderTop: '1px dashed var(--line)', opacity: 0.6 }} />)}
    </div>
  )
}

/** Verlaufs-Chart: Ist-Balken (Verlauf) + Vorjahres-Balken (hell), mit Gitter,
 *  hervorgehobenem Spitzenmonat (+ Wert) und Max-Label.
 *  daten: [{ label, ist, vorjahr }]. */
export function VerlaufChart({ daten, fmt = (n) => String(n), fmtKurz, H = 132, vergleichLabel = 'Vorjahr' }) {
  const kurz = fmtKurz || fmt
  const max = Math.max(...daten.flatMap((d) => [d.ist, d.vorjahr || 0]), 1)
  const peak = Math.max(...daten.map((d) => d.ist))
  return (
    <div style={{ position: 'relative', paddingLeft: 4 }}>
      <div className="mono" style={{ fontSize: 10, color: 'var(--muted)', marginBottom: 2 }}>max {fmt(max)}</div>
      <div style={{ position: 'relative' }}>
        <Gitter H={H} />
        <div style={{ position: 'relative', display: 'flex', alignItems: 'flex-end', gap: 8, height: H, borderBottom: '1px solid var(--line)' }}>
          {daten.map((d) => {
            const istH = Math.max(2, d.ist / max * H)
            const vjH = Math.max(2, (d.vorjahr || 0) / max * H)
            const isPeak = d.ist === peak && d.ist > 0
            return (
              <div key={d.label} style={{ flex: 1, display: 'flex', alignItems: 'flex-end', justifyContent: 'center', gap: 3, height: H, minWidth: 0 }}>
                {d.vorjahr != null && <div title={`${vergleichLabel} ${fmt(d.vorjahr)}`} style={{ width: '38%', maxWidth: 13, height: vjH, background: 'var(--bg)', border: '1px solid var(--line)', borderRadius: '3px 3px 0 0' }} />}
                <div title={`Ist ${fmt(d.ist)}`} style={{ position: 'relative', width: '38%', maxWidth: 13, height: istH, borderRadius: '3px 3px 0 0', background: isPeak ? BAR_PEAK : BAR, boxShadow: isPeak ? '0 0 0 1.5px color-mix(in srgb, var(--accent) 35%, transparent)' : 'none' }}>
                  {isPeak && <span className="mono" style={{ position: 'absolute', bottom: '100%', left: '50%', transform: 'translateX(-50%)', marginBottom: 3, fontSize: 9.5, fontWeight: 700, color: 'var(--accent)', whiteSpace: 'nowrap' }}>{kurz(d.ist)}</span>}
                </div>
              </div>
            )
          })}
        </div>
      </div>
      <div style={{ display: 'flex', gap: 8, marginTop: 5 }}>
        {daten.map((d) => <div key={d.label} style={{ flex: 1, textAlign: 'center', fontSize: 9.5, color: 'var(--muted)' }}>{d.label}</div>)}
      </div>
    </div>
  )
}

/** Einfacher Balken-Chart (eine Reihe) mit Gitter, Wert-Label und Spitzen-
 *  Hervorhebung. daten: [{ label, wert, sub? }]. */
export function BalkenChart({ daten, fmt = (n) => String(n), farbe, H = 120, zeigeWert = true }) {
  const max = Math.max(...daten.map((d) => d.wert), 1)
  const peak = Math.max(...daten.map((d) => d.wert))
  const bar = farbe ? farbBar(farbe) : BAR
  const barPeak = farbe ? `linear-gradient(180deg, color-mix(in srgb, ${farbe} 80%, #000), ${farbe})` : BAR_PEAK
  return (
    <div style={{ position: 'relative', paddingLeft: 4 }}>
      <div className="mono" style={{ fontSize: 10, color: 'var(--muted)', marginBottom: 2 }}>max {fmt(max)}</div>
      <div style={{ position: 'relative' }}>
        <Gitter H={H} />
        <div style={{ position: 'relative', display: 'flex', alignItems: 'flex-end', gap: 10, height: H, borderBottom: '1px solid var(--line)' }}>
          {daten.map((d) => {
            const h = Math.max(2, d.wert / max * H)
            const isPeak = d.wert === peak && d.wert > 0
            return (
              <div key={d.label} style={{ flex: 1, display: 'flex', alignItems: 'flex-end', justifyContent: 'center', height: H, minWidth: 0 }}>
                <div title={`${d.label}: ${fmt(d.wert)}`} style={{ position: 'relative', width: '60%', maxWidth: 56, height: h, borderRadius: '4px 4px 0 0', background: isPeak ? barPeak : bar, boxShadow: isPeak ? `0 0 0 1.5px color-mix(in srgb, ${farbe || 'var(--accent)'} 35%, transparent)` : 'none' }}>
                  {zeigeWert && <span className="mono" style={{ position: 'absolute', bottom: '100%', left: '50%', transform: 'translateX(-50%)', marginBottom: 3, fontSize: 9.5, fontWeight: 700, color: isPeak ? (farbe || 'var(--accent)') : 'var(--muted)', whiteSpace: 'nowrap' }}>{fmt(d.wert)}</span>}
                </div>
              </div>
            )
          })}
        </div>
      </div>
      <div style={{ display: 'flex', gap: 10, marginTop: 5 }}>
        {daten.map((d) => (
          <div key={d.label} style={{ flex: 1, textAlign: 'center', fontSize: 10, color: 'var(--muted)', minWidth: 0 }}>
            {d.label}{d.sub != null && <div className="mono" style={{ fontSize: 9.5 }}>{d.sub}</div>}
          </div>
        ))}
      </div>
    </div>
  )
}
