// =========================================================================
//  ABLAUFDIAGRAMM — klickbare Prozessgrafik der KLR-Zusammenhänge.
//  Knoten = Bausteine (mit Live-Wert), Pfeile = Kostenfluss. Klick öffnet
//  den jeweiligen Baustein. Vermittelt die Zusammenhänge auf einen Blick.
// =========================================================================
import React from 'react'
import { strukturKennzahlen } from '../../core/kostenarten.js'
import { gesamt as kalkGesamt } from '../../core/kalkulatorik.js'
import { bab } from '../../core/babVoll.js'
import { zuschlagKalkulation } from '../../core/kalkulation.js'
import { ergebnis } from '../../core/ergebnis.js'
import { direktCosting } from '../../core/deckungsbeitrag.js'

const mio = (v) => v.toLocaleString('de-DE', { minimumFractionDigits: 1, maximumFractionDigits: 1 }) + ' Mio €'

export default function Ablaufdiagramm({ onGeh }) {
  const ka = strukturKennzahlen()
  const kalk = kalkGesamt()
  const b = bab('ist')
  const kt = zuschlagKalkulation('ist')
  const erg = ergebnis('ist')
  const dc = direktCosting()
  const oMarge = Math.round(kt.reduce((n, p) => n + p.marge, 0) / kt.length)

  // Knoten: x/y = linke obere Ecke; w/h fix.
  const W = 210, H = 58
  const N = {
    abgrenzung:   { x: 130, y: 24,  label: 'Aufwand → Kosten', wert: 'Abgrenzung', view: 'klr', farbe: '#64748b' },
    kalkulatorik: { x: 560, y: 24,  label: 'Kalkulatorische Kosten', wert: mio(kalk.summe), view: 'kalkulatorik', farbe: '#7c3aed' },
    kostenarten:  { x: 345, y: 126, label: '1 · Kostenartenrechnung', wert: 'Gesamt ' + mio(ka.gesamt), view: 'kostenarten', farbe: '#2563eb' },
    bab:          { x: 345, y: 220, label: '2 · Kostenstellen / BAB', wert: 'Zuschlag Fert. ' + b.zuschlag.fertigung + ' %', view: 'bab', farbe: '#2563eb' },
    kostentraeger: { x: 345, y: 314, label: '3 · Kostenträger / Kalkulation', wert: 'Ø Marge ' + oMarge + ' %', view: 'kalkulation', farbe: '#2563eb' },
    ergebnis:     { x: 175, y: 422, label: 'Ergebnis (GKV)', wert: mio(erg.betriebsergebnis), view: 'ergebnis', farbe: '#0f766e' },
    db:           { x: 525, y: 422, label: 'Deckungsbeitrag', wert: mio(dc.db1) + ' DB I', view: 'deckungsbeitrag', farbe: '#0f766e' },
    steuerung:    { x: 345, y: 524, label: 'Steuerung & Lebenszyklen', wert: 'Maßnahmen', view: 'lebenszyklus', farbe: '#b45309' }
  }
  const cx = (n) => n.x + W / 2
  const edges = [
    ['abgrenzung', 'kostenarten'], ['kalkulatorik', 'kostenarten'],
    ['kostenarten', 'bab'], ['bab', 'kostentraeger'],
    ['kostentraeger', 'ergebnis'], ['kostentraeger', 'db'],
    ['ergebnis', 'steuerung'], ['db', 'steuerung']
  ]

  return (
    <div style={{ maxWidth: '100%', margin: '0 auto' }}>
      <div style={{ marginBottom: 12 }}>
        <h2 style={{ margin: '0 0 4px' }}>Ablaufdiagramm — wie alles zusammenhängt</h2>
        <div style={{ color: 'var(--muted)', fontSize: 13, maxWidth: 720 }}>
          Der Kostenfluss von links/oben nach unten: Aufwand wird zu Kosten, diese werden auf Arten, Stellen und Träger
          verrechnet und münden im Ergebnis. <b>Knoten anklicken</b> öffnet den Baustein.
        </div>
      </div>

      <div style={{ background: 'var(--panel)', border: '1px solid var(--line)', borderRadius: 'var(--radius)', boxShadow: 'var(--shadow)', padding: 8 }}>
        <svg viewBox="0 0 900 600" style={{ width: '100%', height: 'auto' }}>
          <defs>
            <marker id="pfeil" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
              <path d="M0,0 L10,5 L0,10 z" fill="var(--muted)" />
            </marker>
          </defs>
          {/* Kanten */}
          {edges.map(([a, c], i) => {
            const A = N[a], C = N[c]
            const x1 = cx(A), y1 = A.y + H, x2 = cx(C), y2 = C.y
            return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2 - 4} stroke="var(--muted)" strokeWidth="1.5" markerEnd="url(#pfeil)" opacity="0.7" />
          })}
          {/* Knoten */}
          {Object.values(N).map((n) => (
            <g key={n.view + n.label} style={{ cursor: 'pointer' }} onClick={() => onGeh?.(n.view)}>
              <rect x={n.x} y={n.y} width={W} height={H} rx="10" fill="var(--panel)" stroke={n.farbe} strokeWidth="2" />
              <rect x={n.x} y={n.y} width="6" height={H} rx="3" fill={n.farbe} />
              <text x={n.x + 16} y={n.y + 23} fontSize="13" fontWeight="700" fill="var(--ink)">{n.label}</text>
              <text x={n.x + 16} y={n.y + 42} fontSize="12" fill="var(--muted)" style={{ fontFamily: 'ui-monospace, monospace' }}>{n.wert}</text>
            </g>
          ))}
        </svg>
      </div>
      <div style={{ fontSize: 12, color: 'var(--muted)', marginTop: 8, textAlign: 'center' }}>
        Werte sind live aus den Bausteinen · entspricht dem Lernpfad-Kapitel „Kostenarten → -stellen → -träger → Ergebnis".
      </div>
    </div>
  )
}
