// =========================================================================
//  DECKUNGSBEITRAGSRECHNUNG — einstufig (Direct Costing) und mehrstufig
//  (stufenweise Fixkostendeckung), plus Typologie der Kostenrechnungssysteme.
// =========================================================================
import React, { useState } from 'react'
import { direktCosting, stufenweise, SYSTEME, dbSichten, KONDITIONSARTEN, breakEven, warengruppen, artikelListe, KUNDENSEGMENTE } from '../../core/deckungsbeitrag.js'
import { pcFaktor } from '../../core/statistikFilter.js'
import PcFilter, { pcHinweis } from '../shared/PcFilter.jsx'
import { useGlobalFilter } from '../../core/filterKontext.jsx'
import ExecKopf, { ampelVon } from '../../components/ExecKopf.jsx'

const card = { background: 'var(--panel)', border: '1px solid var(--line)', borderRadius: 'var(--radius)', boxShadow: 'var(--shadow)' }
const cap = { fontSize: 11, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '.03em', fontWeight: 700 }
const m = (v) => v.toLocaleString('de-DE', { minimumFractionDigits: 1, maximumFractionDigits: 1 })
const th = (al) => ({ textAlign: al, padding: '6px 9px', borderBottom: '1px solid var(--line)', fontSize: 10.5, color: 'var(--muted)', textTransform: 'uppercase' })
const td = (al, bold) => ({ textAlign: al, padding: '6px 9px', borderBottom: '1px solid var(--line)', fontWeight: bold ? 700 : 400 })

export default function Deckungsbeitrag({ onGeh }) {
  const [tab, setTab] = useState('breakeven')
  const g = useGlobalFilter()
  const pc = g.pc
  const aenderePc = g.setPc
  const fk = pcFaktor(pc)
  // Exec-Kopf: Lage aus Betriebsergebnis (Vorzeichen) & DB-I-Quote, Empfehlung aus schwächstem Bereich.
  const dc = direktCosting(undefined, fk)
  const sw = stufenweise(undefined, undefined, undefined, fk)
  const bereicheNachDB3 = [...sw.bereiche].sort((a, b) => a.db3 - b.db3)
  const schwachB = bereicheNachDB3[0]
  const execStatus = sw.betriebsergebnis > 0 ? ampelVon(dc.db1Quote, { gut: 35, schlecht: 30 }) : 'r'
  const execAussage = `Umsatz ${m(dc.umsatz)} Mio € · DB I ${m(dc.db1)} Mio € (Quote ${dc.db1Quote} %) · Betriebsergebnis ${m(sw.betriebsergebnis)} Mio €.`
  const execEmpf = schwachB
    ? (schwachB.db3 < 0
        ? `Bereich „${schwachB.name}" trägt nach Bereichsfixkosten negativ bei (DB III ${m(schwachB.db3)} Mio €) — Kostenstruktur/Sortiment dort vorrangig prüfen.`
        : `Schwächste Fixkostendeckung im Bereich „${schwachB.name}" (DB III ${m(schwachB.db3)} Mio €) — Margen und variable Kosten dort priorisieren.`)
    : 'Stufenweise Fixkostendeckung je Bereich prüfen.'
  const chip = (aktiv) => ({ padding: '6px 12px', borderRadius: 999, fontSize: 13, cursor: 'pointer', fontWeight: 600,
    border: `1px solid ${aktiv ? 'var(--accent)' : 'var(--line)'}`, background: aktiv ? 'var(--accent)' : 'var(--panel)', color: aktiv ? '#fff' : 'var(--ink)' })

  return (
    <div style={{ maxWidth: '100%', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12, flexWrap: 'wrap', marginBottom: 14 }}>
        <div>
          <h2 style={{ margin: '0 0 4px' }}>Deckungsbeitragsrechnung{pcHinweis(pc)}</h2>
          <div style={{ color: 'var(--muted)', fontSize: 13, maxWidth: 740 }}>
            Teilkostensicht: Was bleibt vom Umsatz nach den variablen Kosten, um die Fixkosten zu decken? Einstufig
            (Direct Costing) und mehrstufig (stufenweise Fixkostendeckung).
          </div>
        </div>
        {onGeh && <button onClick={() => onGeh('ergebnis')} style={{ ...card, padding: '7px 12px', cursor: 'pointer', fontSize: 13, fontWeight: 600 }}>Ergebnisrechnung →</button>}
      </div>

      {tab !== 'systeme' && <PcFilter pc={pc} onChange={aenderePc} hinweis="Umsätze/Kosten/Fixkosten anteilig je Profit-Center; DB-Quoten bleiben unverändert." />}

      {tab !== 'systeme' && <ExecKopf status={execStatus} kennzahl={m(sw.betriebsergebnis) + ' Mio €'} kennzahlLabel="Betriebsergebnis" kernaussage={execAussage} empfehlung={execEmpf} />}

      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 14 }}>
        {[['breakeven', '📈 Break-Even (Gewinnschwelle)'], ['mehrstufig', 'Mehrstufig (Fixkostendeckung)'], ['einstufig', 'Einstufig (Direct Costing)'], ['fair', '⚖ Faire DB (Sonderfälle)'], ['systeme', 'Systeme der Kostenrechnung']].map(([id, n]) => (
          <button key={id} style={chip(tab === id)} onClick={() => setTab(id)}>{n}</button>
        ))}
      </div>

      {tab === 'breakeven' && <BreakEvenTab fk={fk} />}
      {tab === 'einstufig' && <Einstufig fk={fk} />}
      {tab === 'mehrstufig' && <Mehrstufig fk={fk} />}
      {tab === 'fair' && <FaireDB fk={fk} />}
      {tab === 'systeme' && <Systeme />}
    </div>
  )
}

// ⚖ Faire DB: Sonderfälle (Sponsoring/Aktion/Muster/Personal) transparent
// aus dem Durchschnitts-DB herausrechnen — fürs Pricing-Team.
function FaireDB({ fk = 1 }) {
  const [aus, setAus] = useState(['sponsoring', 'aktion', 'muster', 'personal']) // Default: faire Basis (alle raus)
  const [reklass, setReklass] = useState(false)
  const s = dbSichten(aus, fk, reklass)
  const toggle = (id) => setAus((a) => (a.includes(id) ? a.filter((x) => x !== id) : [...a, id]))
  const eur = (v) => m(v) + ' Mio €'
  const tile = (titel, d, hervor, hinweis) => (
    <div style={{ ...card, padding: '12px 14px', flex: 1, minWidth: 190, borderTop: `3px solid ${hervor || 'var(--line)'}` }}>
      <div style={{ ...cap, marginBottom: 3 }}>{titel}</div>
      <div className="mono" style={{ fontSize: 20, fontWeight: 800, color: hervor || 'var(--ink)' }}>{eur(d.db)}</div>
      <div style={{ fontSize: 12, color: 'var(--muted)', marginTop: 2 }}>DB-Quote {d.dbQuote} % · Umsatz {eur(d.umsatz)}</div>
      {hinweis && <div style={{ fontSize: 11.5, color: 'var(--muted)', marginTop: 4 }}>{hinweis}</div>}
    </div>
  )
  return (
    <div style={{ display: 'grid', gap: 14 }}>
      <div style={{ ...card, padding: 14 }}>
        <div style={{ fontSize: 13, color: 'var(--slate)', marginBottom: 10, maxWidth: 820 }}>
          Sponsoring (100 %), starke Aktionen, Muster/Garantie und Personal-/IC-Käufe haben <b>vollen Wareneinsatz, aber kaum Erlös</b> — sie drücken den
          Durchschnitts-DB. Hier rechnest du sie fürs Pricing heraus; die <b>Brücke</b> zeigt transparent, was sie kosten. Nichts wird gelöscht.
        </div>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
          <span style={{ ...cap, marginRight: 2 }}>Ausschließen:</span>
          {KONDITIONSARTEN.map((k) => {
            const an = aus.includes(k.id)
            return (
              <button key={k.id} onClick={() => toggle(k.id)} title={k.hinweis}
                style={{ padding: '5px 11px', borderRadius: 999, fontSize: 12.5, fontWeight: 600, cursor: 'pointer',
                  border: `1px solid ${an ? 'var(--accent)' : 'var(--line)'}`, background: an ? 'var(--accent-soft)' : 'var(--panel)', color: an ? 'var(--accent)' : 'var(--muted)' }}>
                {an ? '☒' : '☐'} {k.kurz}
              </button>
            )
          })}
          <span style={{ flex: 1 }} />
          <button onClick={() => setAus(KONDITIONSARTEN.map((k) => k.id))} style={{ fontSize: 11.5, padding: '5px 9px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--line)', background: 'var(--panel)', cursor: 'pointer', color: 'var(--muted)' }}>alle</button>
          <button onClick={() => setAus([])} style={{ fontSize: 11.5, padding: '5px 9px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--line)', background: 'var(--panel)', cursor: 'pointer', color: 'var(--muted)' }}>keine</button>
        </div>
        <label style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 10, fontSize: 12.5, color: 'var(--slate)', cursor: 'pointer' }}>
          <input type="checkbox" checked={reklass} onChange={(e) => setReklass(e.target.checked)} />
          Sponsoring-Wareneinsatz ins <b>Marketing-/Sponsoringbudget umbuchen</b> (Produkt-DB sauber, Kosten beim Marketing-ROI)
          {s.marketingUmbuchung > 0 && <span style={{ color: 'var(--accent)', fontWeight: 600 }}>· {eur(s.marketingUmbuchung)} → Marketing</span>}
        </label>
      </div>

      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
        {tile('DB brutto (alles inkl.)', s.brutto, 'var(--muted)', 'Ökonomische Wahrheit — Sonderfälle enthalten.')}
        {tile('DB bereinigt (Pricing-Basis)', s.bereinigt, 'var(--amp-g)', 'Faire Kerngeschäfts-Marge ohne Sonderfälle.')}
        <div style={{ ...card, padding: '12px 14px', flex: 1, minWidth: 190, borderTop: '3px solid var(--accent)' }}>
          <div style={{ ...cap, marginBottom: 3 }}>Effekt der Bereinigung</div>
          <div className="mono" style={{ fontSize: 20, fontWeight: 800, color: s.effekt >= 0 ? 'var(--amp-g)' : 'var(--amp-r)' }}>{s.effekt >= 0 ? '+' : ''}{eur(s.effekt)}</div>
          <div style={{ fontSize: 12, color: 'var(--muted)', marginTop: 2 }}>DB-Quote {s.quoteEffekt >= 0 ? '+' : ''}{s.quoteEffekt} Pp</div>
          <div style={{ fontSize: 11.5, color: 'var(--muted)', marginTop: 4 }}>{s.ausgeblendet.belege.toLocaleString('de-DE')} Belege · Umsatz {eur(s.ausgeblendet.umsatz)} · Wareneinsatz {eur(s.ausgeblendet.varKosten)} ausgeblendet</div>
        </div>
      </div>

      <div style={{ ...card, overflow: 'hidden' }}>
        <div style={{ ...cap, padding: '10px 12px 0' }}>Sonderfall-Brücke — was jeder Typ den DB kostet</div>
        <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: 8 }}>
          <thead><tr>
            {['Konditionsart', 'Belege', 'Listenwert', 'Erlös', 'Wareneinsatz', 'DB', 'Status'].map((h, i) => (
              <th key={h} style={th(i === 0 ? 'left' : 'right')}>{h}</th>
            ))}
          </tr></thead>
          <tbody>
            {s.bruecke.map((b) => (
              <tr key={b.typ} style={{ opacity: b.ausgeschlossen ? 0.62 : 1 }}>
                <td style={td('left', true)}>{KONDITIONSARTEN.find((k) => k.id === b.typ)?.kurz || b.typ}</td>
                <td style={td('right')} className="mono">{b.belege.toLocaleString('de-DE')}</td>
                <td style={td('right')} className="mono">{eur(b.listenumsatz)}</td>
                <td style={td('right')} className="mono">{eur(b.umsatz)}</td>
                <td style={td('right')} className="mono">{eur(b.varKosten)}</td>
                <td style={{ ...td('right', true), color: b.db >= 0 ? 'var(--amp-g)' : 'var(--amp-r)' }} className="mono">{b.db >= 0 ? '+' : ''}{eur(b.db)}</td>
                <td style={td('right')}>
                  <span style={{ fontSize: 11, fontWeight: 700, padding: '2px 8px', borderRadius: 999,
                    background: b.umgebucht ? 'var(--accent-soft)' : b.ausgeschlossen ? '#fee2e2' : '#dcfce7',
                    color: b.umgebucht ? 'var(--accent)' : b.ausgeschlossen ? '#991b1b' : '#166534' }}>
                    {b.umgebucht ? '→ Marketing' : b.ausgeschlossen ? 'ausgeschlossen' : 'enthalten'}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div style={{ fontSize: 11.5, color: 'var(--muted)' }}>
        Empfehlung: Pricing-Ziele und Konditions-Freigaben auf den <b>bereinigten DB</b> beziehen; Sponsoring über die Marketing-Umbuchung steuern und gegen ein Budget-Limit führen.
      </div>
    </div>
  )
}

// =========================================================================
//  BREAK-EVEN-TAB — interaktives Gewinnschwellen-Diagramm mit Filtern nach
//  Warengruppe, Artikel und Kundensegment.
// =========================================================================
function BreakEvenTab({ fk = 1 }) {
  const [bereich, setBereich] = useState('*')
  const [produkt, setProdukt] = useState('*')
  const [segment, setSegment] = useState('*')
  // Bei Warengruppenwechsel Artikel zurücksetzen, falls er nicht mehr passt.
  const artikel = artikelListe(bereich)
  const produktGueltig = produkt === '*' || artikel.some((a) => a.id === produkt)
  const be = breakEven({ bereich, produkt: produktGueltig ? produkt : '*', segment }, fk)
  const eur = (v) => (v == null ? '—' : m(v) + ' Mio €')

  const sel = { font: 'inherit', fontSize: 13, padding: '7px 10px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--line)', background: 'var(--panel)', color: 'var(--ink)' }
  const reset = () => { setBereich('*'); setProdukt('*'); setSegment('*') }

  const status = be.ergebnis >= 0 ? 'var(--amp-g)' : 'var(--amp-r)'
  const tile = (titel, wert, sub, farbe) => (
    <div style={{ ...card, padding: '12px 14px', flex: 1, minWidth: 170, borderTop: `3px solid ${farbe || 'var(--line)'}` }}>
      <div style={{ ...cap, marginBottom: 3 }}>{titel}</div>
      <div className="mono" style={{ fontSize: 19, fontWeight: 800, color: farbe || 'var(--ink)' }}>{wert}</div>
      {sub && <div style={{ fontSize: 11.5, color: 'var(--muted)', marginTop: 2 }}>{sub}</div>}
    </div>
  )

  return (
    <div style={{ display: 'grid', gap: 14 }}>
      {/* Filterleiste */}
      <div style={{ ...card, padding: 14, display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'flex-end' }}>
        <label style={{ display: 'grid', gap: 4 }}>
          <span style={cap}>Warengruppe</span>
          <select style={sel} value={bereich} onChange={(e) => { setBereich(e.target.value); setProdukt('*') }}>
            <option value="*">Alle Warengruppen</option>
            {warengruppen().map((w) => <option key={w.id} value={w.id}>{w.name}</option>)}
          </select>
        </label>
        <label style={{ display: 'grid', gap: 4 }}>
          <span style={cap}>Artikel</span>
          <select style={sel} value={produktGueltig ? produkt : '*'} onChange={(e) => setProdukt(e.target.value)}>
            <option value="*">Alle Artikel{bereich !== '*' ? ' der Gruppe' : ''}</option>
            {artikel.map((a) => <option key={a.id} value={a.id}>{a.name}</option>)}
          </select>
        </label>
        <label style={{ display: 'grid', gap: 4 }}>
          <span style={cap}>Kunde / Kanal</span>
          <select style={sel} value={segment} onChange={(e) => setSegment(e.target.value)}>
            <option value="*">Alle Kanäle</option>
            {KUNDENSEGMENTE.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
          </select>
        </label>
        <span style={{ flex: 1 }} />
        <button onClick={reset} style={{ ...sel, cursor: 'pointer', color: 'var(--muted)' }}>Filter zurücksetzen</button>
      </div>

      {/* Kennzahlen */}
      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
        {tile('Break-even-Umsatz', eur(be.beUmsatz), be.beAuslastung != null ? `bei ${(be.beAuslastung * 100).toFixed(0)} % des Ist-Umsatzes` : 'kein positiver DB', 'var(--accent)')}
        {tile('Sicherheitsstrecke', be.sicherheit != null ? `${be.sicherheit} %` : '—', 'Puffer bis zur Verlustzone', be.sicherheit != null && be.sicherheit >= 0 ? 'var(--amp-g)' : 'var(--amp-r)')}
        {tile('DB-Quote', `${be.dbQuote} %`, `DB ${eur(be.db)} · var. Quote ${be.varQuote} %`, 'var(--ink)')}
        {tile('Betriebsergebnis (Ausschnitt)', eur(be.ergebnis), `Umsatz ${eur(be.umsatz)} − Fix ${eur(be.fix)}`, status)}
      </div>

      {/* Diagramm */}
      <div style={{ ...card, padding: '14px 16px' }}>
        <div style={{ ...cap, marginBottom: 4 }}>Break-Even-Diagramm — {be.titel} · {be.segmentName}</div>
        <div style={{ fontSize: 12, color: 'var(--muted)', marginBottom: 8 }}>
          Schnittpunkt von Erlös- und Gesamtkostenkurve = Gewinnschwelle. Links davon Verlust, rechts Gewinn. Der Punkt ◆ markiert die heutige Auslastung (100 %).
        </div>
        <BreakEvenChart be={be} />
      </div>

      {/* Fixkosten-Herkunft */}
      <div style={{ ...card, padding: 14 }}>
        <div style={{ ...cap, marginBottom: 8 }}>Zugeordnete Fixkosten im Ausschnitt</div>
        <div style={{ display: 'flex', gap: 18, flexWrap: 'wrap', fontSize: 13 }}>
          <span>Produktfixkosten: <b className="mono">{eur(be.produktfix)}</b></span>
          <span>Bereichsfixkosten: <b className="mono">{eur(be.bereichsfix)}</b></span>
          <span>Unternehmensfix (anteilig): <b className="mono">{eur(be.unternehmensfix)}</b></span>
          <span>= Fixkosten gesamt: <b className="mono">{eur(be.fix)}</b></span>
        </div>
        <div style={{ fontSize: 11.5, color: 'var(--muted)', marginTop: 8 }}>
          Produktfixkosten direkt, Bereichs-/Unternehmensfixkosten verursachungsnah nach Umsatzanteil zugeordnet. Kundensegmente skalieren Umsatz und Fixkostenblock anteilig.
        </div>
      </div>
    </div>
  )
}

// SVG-Break-Even-Diagramm (Erlös vs. Gesamtkosten über die Auslastung).
function BreakEvenChart({ be }) {
  const W = 680, H = 340, padL = 64, padR = 16, padT = 14, padB = 42
  const xMax = 1.4                              // bis 140 % Auslastung
  const yErloesMax = be.umsatz * xMax
  const yKostenMax = be.fix + be.varKosten * xMax
  const yMax = Math.max(yErloesMax, yKostenMax) * 1.06 || 1
  const px = (x) => padL + (x / xMax) * (W - padL - padR)
  const py = (v) => H - padB - (v / yMax) * (H - padT - padB)
  const erloesAt = (x) => be.umsatz * x
  const kostenAt = (x) => be.fix + be.varKosten * x

  const hatBE = be.beAuslastung != null && be.beAuslastung <= xMax
  const bx = hatBE ? px(be.beAuslastung) : null
  const byVal = hatBE ? erloesAt(be.beAuslastung) : null

  // Achsen-Ticks
  const xticks = [0, 0.25, 0.5, 0.75, 1.0, 1.25].filter((t) => t <= xMax)
  const yStep = niceStep(yMax / 4)
  const yticks = []
  for (let v = 0; v <= yMax; v += yStep) yticks.push(v)

  // Gewinn-/Verlustflächen (Polygone zwischen Erlös und Kosten)
  const verlustPoly = `${px(0)},${py(erloesAt(0))} ${hatBE ? bx : px(xMax)},${py(hatBE ? byVal : erloesAt(xMax))} ${hatBE ? bx : px(xMax)},${py(hatBE ? byVal : kostenAt(xMax))} ${px(0)},${py(kostenAt(0))}`
  const gewinnPoly = hatBE ? `${bx},${py(byVal)} ${px(xMax)},${py(erloesAt(xMax))} ${px(xMax)},${py(kostenAt(xMax))}` : null

  return (
    <div style={{ overflowX: 'auto' }}>
      <svg viewBox={`0 0 ${W} ${H}`} style={{ width: '100%', minWidth: 480, height: 'auto', display: 'block' }} role="img"
        aria-label={`Break-Even-Diagramm. Gewinnschwelle bei ${be.beUmsatz != null ? be.beUmsatz + ' Mio Euro' : 'nicht erreichbar'}.`}>
        {/* Flächen */}
        <polygon points={verlustPoly} fill="var(--amp-r)" opacity="0.10" />
        {gewinnPoly && <polygon points={gewinnPoly} fill="var(--amp-g)" opacity="0.14" />}
        {/* Gitter + Y-Achse */}
        {yticks.map((v, i) => (
          <g key={i}>
            <line x1={padL} y1={py(v)} x2={W - padR} y2={py(v)} stroke="var(--line)" strokeWidth="1" opacity="0.6" />
            <text x={padL - 8} y={py(v) + 4} textAnchor="end" fontSize="10.5" fill="var(--muted)">{m(v)}</text>
          </g>
        ))}
        {/* X-Achse */}
        <line x1={padL} y1={py(0)} x2={W - padR} y2={py(0)} stroke="var(--ink)" strokeWidth="1.3" />
        {xticks.map((t, i) => (
          <g key={i}>
            <line x1={px(t)} y1={py(0)} x2={px(t)} y2={py(0) + 5} stroke="var(--muted)" strokeWidth="1" />
            <text x={px(t)} y={py(0) + 19} textAnchor="middle" fontSize="10.5" fill="var(--muted)">{(t * 100).toFixed(0)} %</text>
          </g>
        ))}
        <text x={(padL + W - padR) / 2} y={H - 6} textAnchor="middle" fontSize="11" fill="var(--muted)">Auslastung / Absatzniveau (100 % = heute)</text>
        <text transform={`translate(15 ${(padT + H - padB) / 2}) rotate(-90)`} textAnchor="middle" fontSize="11" fill="var(--muted)">Mio €</text>
        {/* Fixkostenlinie */}
        <line x1={px(0)} y1={py(be.fix)} x2={px(xMax)} y2={py(be.fix)} stroke="var(--muted)" strokeWidth="1.3" strokeDasharray="5 4" />
        <text x={W - padR} y={py(be.fix) - 5} textAnchor="end" fontSize="10.5" fill="var(--muted)">Fixkosten {m(be.fix)}</text>
        {/* Gesamtkostenkurve */}
        <line x1={px(0)} y1={py(kostenAt(0))} x2={px(xMax)} y2={py(kostenAt(xMax))} stroke="var(--amp-a)" strokeWidth="2.4" />
        <text x={px(xMax) - 4} y={py(kostenAt(xMax)) - 6} textAnchor="end" fontSize="11" fontWeight="700" fill="var(--amp-a)">Gesamtkosten</text>
        {/* Erlöskurve */}
        <line x1={px(0)} y1={py(erloesAt(0))} x2={px(xMax)} y2={py(erloesAt(xMax))} stroke="var(--accent)" strokeWidth="2.4" />
        <text x={px(xMax) - 4} y={py(erloesAt(xMax)) - 6} textAnchor="end" fontSize="11" fontWeight="700" fill="var(--accent)">Erlös</text>
        {/* Break-even-Punkt */}
        {hatBE && (
          <g>
            <line x1={bx} y1={py(0)} x2={bx} y2={py(byVal)} stroke="var(--ink)" strokeWidth="1" strokeDasharray="3 3" opacity="0.7" />
            <circle cx={bx} cy={py(byVal)} r="6" fill="var(--panel)" stroke="var(--ink)" strokeWidth="2" />
            <text x={bx + 9} y={py(byVal) - 8} fontSize="11" fontWeight="700" fill="var(--ink)">Gewinnschwelle</text>
            <text x={bx + 9} y={py(byVal) + 6} fontSize="10.5" fill="var(--muted)">{m(be.beUmsatz)} Mio € · {(be.beAuslastung * 100).toFixed(0)} %</text>
          </g>
        )}
        {/* Heutiger Betriebspunkt (x = 100 %) */}
        <g>
          <rect x={px(1) - 5} y={py(erloesAt(1)) - 5} width="10" height="10" transform={`rotate(45 ${px(1)} ${py(erloesAt(1))})`} fill="var(--accent)" />
          <text x={px(1)} y={py(erloesAt(1)) - 12} textAnchor="middle" fontSize="10.5" fill="var(--accent)">heute</text>
        </g>
      </svg>
      {!hatBE && (
        <div style={{ fontSize: 12.5, color: 'var(--amp-r)', marginTop: 6 }}>
          In diesem Ausschnitt deckt der Deckungsbeitrag die Fixkosten nicht — es gibt keine erreichbare Gewinnschwelle. Margen/Sortiment prüfen.
        </div>
      )}
    </div>
  )
}

// „Schöne" Achsen-Schrittweite (1/2/5 × 10^n).
function niceStep(roh) {
  if (!(roh > 0)) return 1
  const p = Math.pow(10, Math.floor(Math.log10(roh)))
  const r = roh / p
  return (r >= 5 ? 5 : r >= 2 ? 2 : 1) * p
}

function Einstufig({ fk = 1 }) {
  const d = direktCosting(undefined, fk)
  return (
    <div style={{ ...card, padding: 16, overflowX: 'auto' }}>
      <div style={{ ...cap, marginBottom: 10 }}>Direct Costing — DB I je Produkt</div>
      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13, minWidth: 560 }}>
        <thead><tr>{['Produkt', 'Umsatz', 'Variable Kosten', 'DB I', 'DB-Quote'].map((h, i) => <th key={i} style={th(i === 0 ? 'left' : 'right')}>{h}</th>)}</tr></thead>
        <tbody>
          {d.rows.map((p) => (
            <tr key={p.id}>
              <td style={td('left', true)}>{p.name}</td>
              <td className="mono" style={td('right')}>{m(p.umsatz)}</td>
              <td className="mono" style={{ ...td('right'), color: 'var(--muted)' }}>− {m(p.varKosten)}</td>
              <td className="mono" style={td('right', true)}>{m(p.db1)}</td>
              <td className="mono" style={{ ...td('right'), color: p.db1Quote >= 35 ? 'var(--amp-g)' : 'var(--amp-a)' }}>{p.db1Quote} %</td>
            </tr>
          ))}
          <tr style={{ background: 'var(--bg)' }}>
            <td style={td('left', true)}>Gesamt</td>
            <td className="mono" style={td('right', true)}>{m(d.umsatz)}</td><td />
            <td className="mono" style={td('right', true)}>{m(d.db1)}</td>
            <td className="mono" style={td('right', true)}>{d.db1Quote} %</td>
          </tr>
        </tbody>
      </table>
      <div style={{ fontSize: 12, color: 'var(--muted)', marginTop: 8 }}>DB I = Umsatz − variable Kosten. Er muss zuerst alle Fixkosten decken, bevor Gewinn entsteht.</div>
    </div>
  )
}

function Mehrstufig({ fk = 1 }) {
  const s = stufenweise(undefined, undefined, undefined, fk)
  const zeile = (label, wert, opt = {}) => (
    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '5px 0', fontWeight: opt.bold ? 700 : 400, color: opt.farbe || 'var(--ink)', paddingLeft: opt.indent || 0 }}>
      <span>{opt.prefix || ''}{label}</span><span className="mono">{m(wert)}</span>
    </div>
  )
  return (
    <div style={{ ...card, padding: 16 }}>
      <div style={{ ...cap, marginBottom: 10 }}>Stufenweise Fixkostendeckung</div>
      {s.bereiche.map((b) => (
        <div key={b.id} style={{ borderBottom: '1px solid var(--line)', padding: '8px 0' }}>
          <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 4 }}>Bereich: {b.name}</div>
          {b.produkte.map((p) => (
            <div key={p.id} style={{ marginBottom: 6 }}>
              {zeile(p.name + ' — Umsatz', p.umsatz, { indent: 12 })}
              {zeile('variable Kosten', p.varKosten, { indent: 24, prefix: '− ', farbe: 'var(--muted)' })}
              {zeile('= DB I', p.db1, { indent: 24, bold: true })}
              {zeile('Produktfixkosten', p.produktfix, { indent: 24, prefix: '− ', farbe: 'var(--muted)' })}
              {zeile('= DB II', p.db2, { indent: 24, bold: true, farbe: p.db2 >= 0 ? 'var(--amp-g)' : 'var(--amp-r)' })}
            </div>
          ))}
          {zeile('Σ DB II Bereich', b.summeDB2, { indent: 12, bold: true })}
          {zeile('Bereichsfixkosten', b.bereichsfix, { indent: 12, prefix: '− ', farbe: 'var(--muted)' })}
          {zeile('= DB III (Bereich)', b.db3, { indent: 12, bold: true, farbe: b.db3 >= 0 ? 'var(--amp-g)' : 'var(--amp-r)' })}
        </div>
      ))}
      <div style={{ paddingTop: 8 }}>
        {zeile('Σ DB III (alle Bereiche)', s.summeDB3, { bold: true })}
        {zeile('Unternehmensfixkosten', s.unternehmensfix, { prefix: '− ', farbe: 'var(--muted)' })}
        {zeile('= Betriebsergebnis', s.betriebsergebnis, { bold: true, farbe: s.betriebsergebnis >= 0 ? 'var(--amp-g)' : 'var(--amp-r)' })}
      </div>
      <div style={{ fontSize: 12, color: 'var(--muted)', marginTop: 8 }}>
        Jede Stufe deckt „ihre" Fixkosten. So sieht man, welcher Bereich/welches Produkt wirklich zum Ergebnis beiträgt — ohne willkürliche Fixkostenschlüsselung.
      </div>
    </div>
  )
}

function Systeme() {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 14 }}>
      {[SYSTEME.vollkosten, SYSTEME.teilkosten].map((s) => (
        <div key={s.name} style={{ ...card, padding: 16 }}>
          <div style={{ fontWeight: 700, fontSize: 15 }}>{s.name}</div>
          <div style={{ fontSize: 12.5, color: 'var(--slate)', margin: '4px 0 8px' }}>{s.laie}</div>
          <ul style={{ margin: 0, paddingLeft: 18, fontSize: 12.5, lineHeight: 1.6 }}>
            {s.arten.map((a) => <li key={a}>{a}</li>)}
          </ul>
        </div>
      ))}
    </div>
  )
}
