// =========================================================================
//  DECKUNGSBEITRAGSRECHNUNG — einstufig (Direct Costing) und mehrstufig
//  (stufenweise Fixkostendeckung), plus Typologie der Kostenrechnungssysteme.
// =========================================================================
import React, { useState } from 'react'
import { direktCosting, stufenweise, SYSTEME } from '../../core/deckungsbeitrag.js'

const card = { background: 'var(--panel)', border: '1px solid var(--line)', borderRadius: 'var(--radius)', boxShadow: 'var(--shadow)' }
const cap = { fontSize: 11, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '.03em', fontWeight: 700 }
const m = (v) => v.toLocaleString('de-DE', { minimumFractionDigits: 1, maximumFractionDigits: 1 })
const th = (al) => ({ textAlign: al, padding: '6px 9px', borderBottom: '1px solid var(--line)', fontSize: 10.5, color: 'var(--muted)', textTransform: 'uppercase' })
const td = (al, bold) => ({ textAlign: al, padding: '6px 9px', borderBottom: '1px solid var(--line)', fontWeight: bold ? 700 : 400 })

export default function Deckungsbeitrag({ onGeh }) {
  const [tab, setTab] = useState('mehrstufig')
  const chip = (aktiv) => ({ padding: '6px 12px', borderRadius: 999, fontSize: 13, cursor: 'pointer', fontWeight: 600,
    border: `1px solid ${aktiv ? 'var(--accent)' : 'var(--line)'}`, background: aktiv ? 'var(--accent)' : 'var(--panel)', color: aktiv ? '#fff' : 'var(--ink)' })

  return (
    <div style={{ maxWidth: 980, margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12, flexWrap: 'wrap', marginBottom: 14 }}>
        <div>
          <h2 style={{ margin: '0 0 4px' }}>Deckungsbeitragsrechnung</h2>
          <div style={{ color: 'var(--muted)', fontSize: 13, maxWidth: 740 }}>
            Teilkostensicht: Was bleibt vom Umsatz nach den variablen Kosten, um die Fixkosten zu decken? Einstufig
            (Direct Costing) und mehrstufig (stufenweise Fixkostendeckung).
          </div>
        </div>
        {onGeh && <button onClick={() => onGeh('ergebnis')} style={{ ...card, padding: '7px 12px', cursor: 'pointer', fontSize: 13, fontWeight: 600 }}>Ergebnisrechnung →</button>}
      </div>

      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 14 }}>
        {[['mehrstufig', 'Mehrstufig (Fixkostendeckung)'], ['einstufig', 'Einstufig (Direct Costing)'], ['systeme', 'Systeme der Kostenrechnung']].map(([id, n]) => (
          <button key={id} style={chip(tab === id)} onClick={() => setTab(id)}>{n}</button>
        ))}
      </div>

      {tab === 'einstufig' && <Einstufig />}
      {tab === 'mehrstufig' && <Mehrstufig />}
      {tab === 'systeme' && <Systeme />}
    </div>
  )
}

function Einstufig() {
  const d = direktCosting()
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

function Mehrstufig() {
  const s = stufenweise()
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
