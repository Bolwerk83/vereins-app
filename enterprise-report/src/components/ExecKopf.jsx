// =========================================================================
//  EXEC-KOPF (gemeinsam) — einheitlicher Management-Kopf für jeden Bericht.
//  Zeigt auf einen Blick: optionale Kernzahl, Ampel (Auf Kurs/Beobachten/
//  Handeln), eine Kernaussage und eine optionale Empfehlung. Jeder Bericht
//  leitet status/kernaussage/empfehlung aus SEINEN echten Zahlen ab und
//  reicht sie als Props herein — so wird jeder Bericht präsentationsreif.
//  Bewusst druckbar (Teil des PDF), daher KEIN no-print.
//
//  ampelVon(): kleiner Helfer, der aus einer Kennzahl + Schwellen eine
//  Ampel ('g'|'a'|'r') ableitet — spart Wiederholung in den Berichten.
//
//  DRILL_ZIELE: Backlog #17 — je Ansicht vorkonfigurierte Sprungziele in
//  Detailberichte, KPI-Baum oder Strukturbericht. Automatisch sichtbar.
// =========================================================================
import React from 'react'
import Kommentar from './Kommentar.jsx'
import { useNav } from './NavContext.jsx'

const AMP = {
  g: { f: 'var(--amp-g)', label: 'Auf Kurs' },
  a: { f: 'var(--amp-a)', label: 'Beobachten' },
  r: { f: 'var(--amp-r)', label: 'Handeln' },
}

// Wert >= gut -> grün; Wert <= schlecht -> rot; dazwischen -> gelb.
// Bei invert=true dreht sich die Logik (kleiner ist besser, z. B. Kosten).
export function ampelVon(wert, { gut, schlecht, invert = false } = {}) {
  if (wert == null || Number.isNaN(wert)) return 'a'
  if (invert) return wert <= gut ? 'g' : wert >= schlecht ? 'r' : 'a'
  return wert >= gut ? 'g' : wert <= schlecht ? 'r' : 'a'
}

// Sprungziele je Ansicht (Backlog #17): Jede Zeile ist {label, fn(nav)}.
// fn bekommt das nav-Objekt und ruft imBaum / details / struktur auf.
const DRILL_ZIELE = {
  verkaufsstatistik:    [{ l: 'Details VK',         f: (n) => n.details('VK') },  { l: 'Im Baum: Umsatz',       f: (n) => n.imBaum('umsatz') }],
  fahrradstatistik:     [{ l: 'Details VK',         f: (n) => n.details('VK') },  { l: 'Im Baum: Absatz',       f: (n) => n.imBaum('absatz') }],
  einkaufsstatistik:    [{ l: 'Details EK',         f: (n) => n.details('EK') },  { l: 'Im Baum: Einkauf',      f: (n) => n.imBaum('einkaufvolumen') }],
  produktionsstatistik: [{ l: 'Details PR',         f: (n) => n.details('PR') },  { l: 'Im Baum: OEE',          f: (n) => n.imBaum('oee') }],
  marketing:            [{ l: 'Details MKT',        f: (n) => n.details('MKT') }, { l: 'Im Baum: ROAS',         f: (n) => n.imBaum('roas') }],
  marketingkarte:       [{ l: 'Details MKT',        f: (n) => n.details('MKT') }],
  lager:                [{ l: 'Details Lager',       f: (n) => n.details('LOG') }, { l: 'Im Baum: Bestand',      f: (n) => n.imBaum('bestand') }],
  bestandsentwicklung:  [{ l: 'Details Lager',       f: (n) => n.details('SCC') }],
  ergebnis:             [{ l: 'Details FIN',         f: (n) => n.details('FIN') }, { l: 'Im Baum: EBIT',         f: (n) => n.imBaum('ebit') }],
  deckungsbeitrag:      [{ l: 'Details VK',          f: (n) => n.details('VK') },  { l: 'Im Baum: DB',           f: (n) => n.imBaum('db') }],
  profitcenter:         [{ l: 'Im Baum: EBIT',       f: (n) => n.imBaum('ebit') }, { l: 'Struktur',              f: (n) => n.struktur() }],
  pckostenstellen:      [{ l: 'Struktur',             f: (n) => n.struktur() },     { l: 'Im Baum: GK',           f: (n) => n.imBaum('gk') }],
  kostenstellen:        [{ l: 'Details KLR',          f: (n) => n.details('KLR') }, { l: 'Im Baum: GK',           f: (n) => n.imBaum('gk') }],
  bab:                  [{ l: 'Details KLR',          f: (n) => n.details('KLR') }],
  kalkulation:          [{ l: 'Im Baum: DB',          f: (n) => n.imBaum('db') }],
  vertriebkpi:          [{ l: 'Details VK',           f: (n) => n.details('VK') },  { l: 'Im Baum: Umsatz',       f: (n) => n.imBaum('umsatz') }],
  auftrag:              [{ l: 'Details Aufträge',     f: (n) => n.details('VK') },  { l: 'Im Baum: AET',          f: (n) => n.imBaum('aet') }],
  lieferant:            [{ l: 'Details EK',           f: (n) => n.details('EK') }],
  forderungen:          [{ l: 'Details FIN',          f: (n) => n.details('RIS') }],
  gutschriften:         [{ l: 'Details Retouren',     f: (n) => n.details('SVC') }],
  produktion:           [{ l: 'Details PR',           f: (n) => n.details('PR') },  { l: 'Im Baum: OEE',          f: (n) => n.imBaum('oee') }],
  mitarbeiter:          [{ l: 'Im Baum: Fluktuation', f: (n) => n.imBaum('fluktuation') }],
  lebenszyklus:         [{ l: 'Im Baum: DB',          f: (n) => n.imBaum('db') }],
  artikelkarte:         [{ l: 'Details Artikel',      f: (n) => n.details('SCC') }, { l: 'Im Baum: Umsatz',       f: (n) => n.imBaum('umsatz') }],
  abweichung:           [{ l: 'Im Baum: EBIT',        f: (n) => n.imBaum('ebit') }, { l: 'Details FIN',           f: (n) => n.details('FIN') }],
}

export default function ExecKopf({ status = 'a', kernaussage, kennzahl, kennzahlLabel, empfehlung, statusLabel, kommentar }) {
  const amp = AMP[status] || AMP.a
  const nav = useNav()
  const komId = kommentar || nav?.ansicht || null
  const drills = nav?.ansicht ? (DRILL_ZIELE[nav.ansicht] || []) : []
  return (
    <div style={{ marginBottom: 14, background: 'var(--panel)', border: '1px solid var(--line)', borderLeft: `5px solid ${amp.f}`,
      borderRadius: 'var(--radius)', boxShadow: 'var(--shadow)', padding: '13px 16px' }}>
    <div style={{ display: 'flex', alignItems: 'stretch', gap: 14, flexWrap: 'wrap' }}>
      {kennzahl != null && (
        <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', paddingRight: 14,
          borderRight: '1px solid var(--line)', minWidth: 120 }}>
          <div style={{ fontSize: 10.5, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '.04em', fontWeight: 700 }}>{kennzahlLabel || 'Kernzahl'}</div>
          <div className="mono" style={{ fontSize: 22, fontWeight: 800, color: 'var(--ink)', lineHeight: 1.1 }}>{kennzahl}</div>
        </div>
      )}
      <div style={{ flex: 1, minWidth: 240, display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 5 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '2px 9px', borderRadius: 999,
            background: amp.f, color: '#fff', fontSize: 11, fontWeight: 700, letterSpacing: '.02em' }}>● {statusLabel || amp.label}</span>
          <span style={{ fontSize: 10.5, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '.05em', fontWeight: 700 }}>Kernaussage</span>
          <span title="Diese Aussage entsteht regelbasiert aus den echten Zahlen — ohne KI, ohne Datenweitergabe." style={{ fontSize: 10, color: '#166534', fontWeight: 700, background: '#dcfce7', border: '1px solid #86efac', borderRadius: 999, padding: '1px 7px' }}>🔒 ohne KI</span>
        </div>
        <div style={{ fontSize: 15, fontWeight: 600, lineHeight: 1.4, color: 'var(--ink)' }}>{kernaussage}</div>
        {empfehlung && (
          <div style={{ fontSize: 12.5, color: 'var(--slate)', lineHeight: 1.45 }}><b style={{ color: 'var(--ink)' }}>✓ Empfehlung:</b> {empfehlung}</div>
        )}
        {drills.length > 0 && (
          <div className="no-print" style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginTop: 4 }}>
            <span style={{ fontSize: 10.5, color: 'var(--muted)', alignSelf: 'center' }}>Öffnen in:</span>
            {drills.map((d) => (
              <button key={d.l} onClick={() => d.f(nav)} style={{
                fontSize: 11, padding: '2px 9px', borderRadius: 999, cursor: 'pointer', fontWeight: 600,
                border: '1px solid var(--line)', background: 'var(--bg)', color: 'var(--muted)'
              }}>{d.l}</button>
            ))}
          </div>
        )}
      </div>
    </div>
    {komId && <Kommentar typ="bericht" id={komId} />}
    </div>
  )
}
