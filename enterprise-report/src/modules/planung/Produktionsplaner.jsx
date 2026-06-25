// =========================================================================
//  PRODUKTIONSPLANER — Belegungsplan (Linien × Zeit), Material-Ampel je
//  Auftrag, Reihenfolge nach Liefertermin oder Deckungsbeitrag, Termin-
//  Gefährdung. Mit Empfehlung der besseren Reihenfolge.
// =========================================================================
import React, { useState } from 'react'
import { plane, empfehlung, SORTIERUNGEN } from '../../core/produktionsplaner.js'
import { fmtDatum, diffTage, HEUTE } from '../../core/beschaffung.js'
import { AmpelPunkt } from '../../components/ui.jsx'

const card = { background: 'var(--panel)', border: '1px solid var(--line)', borderRadius: 'var(--radius)', boxShadow: 'var(--shadow)' }
const cap = { fontSize: 11, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '.04em', fontWeight: 700 }
const AMP = { g: 'var(--amp-g)', a: 'var(--amp-a)', r: 'var(--amp-r)' }
const eur = (n) => Math.round(n).toLocaleString('de-DE') + ' €'

function Gantt({ p }) {
  const total = Math.max(1, diffTage(p.ende, HEUTE))
  const pct = (d) => `${Math.max(0, (d / total) * 100)}%`
  return (
    <div style={{ ...card, padding: 14 }}>
      <div style={{ ...cap, marginBottom: 10 }}>Belegungsplan (heute → {fmtDatum(p.ende)}) · Material-Vorlauf hell, Produktion kräftig</div>
      <div style={{ display: 'grid', gap: 10 }}>
        {p.linien.map((l) => (
          <div key={l.id} style={{ display: 'grid', gridTemplateColumns: '120px 1fr', gap: 8, alignItems: 'center' }}>
            <div style={{ fontSize: 12, textAlign: 'right', color: 'var(--slate)', fontWeight: 600 }}>{l.name}</div>
            <div style={{ position: 'relative', height: 26, background: 'var(--bg)', borderRadius: 4 }}>
              {p.auftraege.filter((a) => a.linie === l.id).map((a) => {
                const vorlaufStart = diffTage(HEUTE, HEUTE), startD = diffTage(a.start, HEUTE), endeD = diffTage(a.ende, HEUTE)
                const farbe = a.status === 'gefaehrdet' ? 'var(--amp-r)' : '#7c3aed'
                return (
                  <React.Fragment key={a.id}>
                    {startD > 0 && <div style={{ position: 'absolute', left: pct(vorlaufStart), width: pct(startD), height: '100%', background: 'var(--accent-soft)', borderRadius: 4 }} title={`Material-Vorlauf bis ${fmtDatum(a.start)}`} />}
                    <div style={{ position: 'absolute', left: pct(startD), width: pct(endeD - startD), height: '100%', background: farbe, borderRadius: 4, minWidth: 3, color: '#fff', fontSize: 10, fontWeight: 700, display: 'flex', alignItems: 'center', paddingLeft: 5, overflow: 'hidden' }} title={`${a.id} · ${fmtDatum(a.start)}–${fmtDatum(a.ende)}`}>{a.id}</div>
                  </React.Fragment>
                )
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default function Produktionsplaner() {
  const [sortBy, setSortBy] = useState('termin')
  const p = plane(sortBy)
  const emp = empfehlung()

  return (
    <div style={{ display: 'grid', gap: 14 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 10 }}>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <span style={cap}>Reihenfolge:</span>
          <div style={{ display: 'flex', border: '1px solid var(--line)', borderRadius: 'var(--radius-sm)', overflow: 'hidden' }}>
            {SORTIERUNGEN.map((s) => (
              <button key={s.id} onClick={() => setSortBy(s.id)} style={{ padding: '6px 13px', border: 'none', fontSize: 12.5, fontWeight: 600, cursor: 'pointer', background: sortBy === s.id ? 'var(--accent)' : 'var(--panel)', color: sortBy === s.id ? '#fff' : 'var(--muted)' }}>{s.name}</button>
            ))}
          </div>
        </div>
        <div style={{ fontSize: 12.5, color: 'var(--muted)' }}>Empfehlung: nach <b>{emp.besser === 'db' ? 'Deckungsbeitrag' : 'Liefertermin'}</b> sortieren (pünktlicher DB {eur(emp.besser === 'db' ? emp.db.dbPuenktlich : emp.termin.dbPuenktlich)})</div>
      </div>

      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
        {[['Aufträge', p.auftraege.length, 'var(--accent)'], ['Räder gesamt', p.raederGesamt, 'var(--accent)'], ['Termin gefährdet', p.gefaehrdet, p.gefaehrdet ? 'var(--amp-r)' : 'var(--amp-g)'], ['DB gesamt', eur(p.dbGesamt), 'var(--amp-g)'], ['DB pünktlich', eur(p.dbPuenktlich), p.dbPuenktlich < p.dbGesamt ? 'var(--amp-a)' : 'var(--amp-g)']].map(([l, v, c]) => (
          <div key={l} style={{ ...card, padding: '11px 13px', flex: 1, minWidth: 130, borderTop: `3px solid ${c}` }}>
            <div style={{ ...cap, marginBottom: 3 }}>{l}</div><div className="mono" style={{ fontSize: 17, fontWeight: 800, color: c }}>{v}</div>
          </div>
        ))}
      </div>

      <Gantt p={p} />

      <div style={{ ...card, overflow: 'auto' }}>
        <div style={{ ...cap, padding: '10px 12px 0' }}>Produktionsaufträge</div>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12.5, marginTop: 8 }}>
          <thead><tr>{['Auftrag', 'Rad', 'Menge', 'Liefertermin', 'Material', 'Linie', 'Start', 'Fertig', 'Puffer z. Termin', 'DB-Beitrag'].map((h, i) => <th key={i} style={{ textAlign: i < 2 || i === 5 ? 'left' : 'right', padding: '6px 9px', borderBottom: '2px solid var(--line)', fontSize: 10, color: 'var(--muted)', textTransform: 'uppercase', whiteSpace: 'nowrap' }}>{h}</th>)}</tr></thead>
          <tbody>
            {p.auftraege.map((a) => (
              <tr key={a.id} style={{ background: a.status === 'gefaehrdet' ? 'var(--amp-r-soft, #fee2e2)' : 'transparent' }}>
                <td style={{ padding: '6px 9px', borderBottom: '1px solid var(--line)', fontWeight: 700 }}>{a.id}</td>
                <td style={{ padding: '6px 9px', borderBottom: '1px solid var(--line)' }}>{a.name}</td>
                <td style={{ padding: '6px 9px', borderBottom: '1px solid var(--line)', textAlign: 'right' }} className="mono">{a.menge}</td>
                <td style={{ padding: '6px 9px', borderBottom: '1px solid var(--line)', textAlign: 'right' }} className="mono">{fmtDatum(a.liefertermin)}</td>
                <td style={{ padding: '6px 9px', borderBottom: '1px solid var(--line)', textAlign: 'right' }}><span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, justifyContent: 'flex-end', color: AMP[a.material] }}><AmpelPunkt status={a.material} size={12} /> {a.material === 'g' ? 'auf Lager' : a.material === 'a' ? 'beschaffen' : 'knapp'}</span></td>
                <td style={{ padding: '6px 9px', borderBottom: '1px solid var(--line)' }}>{a.linieName}</td>
                <td style={{ padding: '6px 9px', borderBottom: '1px solid var(--line)', textAlign: 'right' }} className="mono">{fmtDatum(a.start)}</td>
                <td style={{ padding: '6px 9px', borderBottom: '1px solid var(--line)', textAlign: 'right', fontWeight: 700 }} className="mono">{fmtDatum(a.ende)}</td>
                <td style={{ padding: '6px 9px', borderBottom: '1px solid var(--line)', textAlign: 'right', color: a.puenktlich ? 'var(--amp-g)' : 'var(--amp-r)' }} className="mono">{a.tageZumTermin >= 0 ? '+' + a.tageZumTermin : a.tageZumTermin} Tg</td>
                <td style={{ padding: '6px 9px', borderBottom: '1px solid var(--line)', textAlign: 'right' }} className="mono">{eur(a.dbBeitrag)}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <div style={{ fontSize: 11.5, color: 'var(--muted)', padding: '6px 12px 10px' }}>„Puffer z. Termin" negativ = Fertigstellung nach Liefertermin (gefährdet). Material-Vorlauf aus der Stücklisten-Beschaffung; Produktion mit Linienkapazität.</div>
      </div>
    </div>
  )
}
