// =========================================================================
//  DECKUNGSBEITRAGSRECHNUNG — einstufig (Direct Costing) und mehrstufig
//  (stufenweise Fixkostendeckung), plus Typologie der Kostenrechnungssysteme.
// =========================================================================
import React, { useState } from 'react'
import { direktCosting, stufenweise, SYSTEME, dbSichten, KONDITIONSARTEN } from '../../core/deckungsbeitrag.js'
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
  const [tab, setTab] = useState('mehrstufig')
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
        {[['mehrstufig', 'Mehrstufig (Fixkostendeckung)'], ['einstufig', 'Einstufig (Direct Costing)'], ['fair', '⚖ Faire DB (Sonderfälle)'], ['systeme', 'Systeme der Kostenrechnung']].map(([id, n]) => (
          <button key={id} style={chip(tab === id)} onClick={() => setTab(id)}>{n}</button>
        ))}
      </div>

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
