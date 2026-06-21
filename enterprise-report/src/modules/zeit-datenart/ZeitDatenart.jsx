// =========================================================================
//  ZEIT & DATENART — Steuerung von Datumssicht, Granularität und der
//  Datenherkunft je Monat (Ist / Tagesreporting / Plan / Forecast).
//  Mit Planauffüllung einzelner Konten und „Standard wiederherstellen".
// =========================================================================
import React, { useState } from 'react'
import {
  DATUMSSICHTEN, GRANULARITAETEN, DATENARTEN, datenart, MONATE, AKTUELLER_MONAT, STEUERJAHR,
  ladeModell, setDatumssicht, setGranularitaet, setDatenart, setPlanKonten, setzeStandard, mixBeschreibung
} from '../../core/periodenmodell.js'
import { AMPEL_FARBE, AMPEL_SOFT } from '../../design/theme.js'

const card = { background: 'var(--panel)', border: '1px solid var(--line)', borderRadius: 'var(--radius)', boxShadow: 'var(--shadow)' }
const inp = { padding: '7px 9px', border: '1px solid var(--line)', borderRadius: 'var(--radius-sm)', font: 'inherit' }

export default function ZeitDatenart({ onChange }) {
  const [m, setM] = useState(ladeModell())
  const [neuKonto, setNeuKonto] = useState('')
  const refresh = (neu) => { setM(neu); onChange && onChange(neu) }

  const radioGruppe = (titel, items, aktiv, onPick, hinweisFn) => (
    <div style={{ ...card, padding: 14 }}>
      <div className="mono" style={{ fontSize: 11, color: 'var(--muted)', textTransform: 'uppercase', marginBottom: 8 }}>{titel}</div>
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        {items.map((it) => (
          <button key={it.id} onClick={() => onPick(it.id)} style={{ padding: '7px 12px', borderRadius: 999, fontSize: 13, cursor: 'pointer',
            border: `1px solid ${aktiv === it.id ? 'var(--accent)' : 'var(--line)'}`,
            background: aktiv === it.id ? 'var(--accent-soft)' : 'var(--panel)', color: aktiv === it.id ? 'var(--accent)' : 'var(--ink)', fontWeight: 500 }}>
            {it.name}
          </button>
        ))}
      </div>
      {hinweisFn && <div style={{ fontSize: 12, color: 'var(--muted)', marginTop: 8 }}>{hinweisFn(aktiv)}</div>}
    </div>
  )

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12, marginBottom: 14, flexWrap: 'wrap' }}>
        <div>
          <h2 style={{ margin: '0 0 4px' }}>Zeit &amp; Datenart</h2>
          <div style={{ color: 'var(--muted)', fontSize: 13, maxWidth: 720 }}>
            Steuere, <b>nach welchem Datum</b> Perioden gebildet werden, in welcher <b>Granularität</b> ausgewertet wird
            und <b>woher die Zahlen je Monat kommen</b> (Ist, Tagesreporting, Plan/Forecast). Das Tagesreporting greift
            tagesaktuell und kumuliert über Tag/Woche/Monat/Quartal/Jahr.
          </div>
        </div>
        <button onClick={() => { if (confirm('Auf den Standard zurücksetzen? (Vormonate = Ist, aktueller Monat = Tagesreporting, Folgemonate = Plan)')) refresh(setzeStandard()) }}
          style={{ ...inp, cursor: 'pointer', color: 'var(--muted)' }}>↺ Standard wiederherstellen</button>
      </div>

      <div style={{ display: 'grid', gap: 14, gridTemplateColumns: '1fr 1fr', marginBottom: 14 }}>
        {radioGruppe('Datumssicht (Periodenbezug)', DATUMSSICHTEN, m.datumssicht, (id) => refresh(setDatumssicht(id)),
          (id) => DATUMSSICHTEN.find((d) => d.id === id)?.hinweis)}
        {radioGruppe('Granularität', GRANULARITAETEN, m.granularitaet, (id) => refresh(setGranularitaet(id)),
          () => 'Aufwärts wird verdichtet, abwärts aufgerissen — serverseitig je Aggregat.')}
      </div>

      {/* Zuweisungstabelle */}
      <div style={{ ...card, padding: 14, marginBottom: 14 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4, flexWrap: 'wrap', gap: 8 }}>
          <div className="mono" style={{ fontSize: 11, color: 'var(--muted)', textTransform: 'uppercase' }}>Datenherkunft je Monat · {STEUERJAHR}</div>
          <div style={{ fontSize: 12, color: 'var(--muted)' }}>Year-to-date-Mix: {mixBeschreibung(m)}</div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: 8, marginTop: 8 }}>
          {MONATE.map((mo) => {
            const art = datenart(m.eintraege[mo])
            const istAktuell = mo === AKTUELLER_MONAT
            return (
              <div key={mo} style={{ border: `1px solid ${istAktuell ? 'var(--accent)' : 'var(--line)'}`, borderRadius: 'var(--radius-sm)', padding: 8,
                background: AMPEL_SOFT[art?.status] || 'var(--panel)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span className="mono" style={{ fontSize: 12, fontWeight: 700 }}>{mo}</span>
                  {istAktuell && <span style={{ fontSize: 9, color: 'var(--accent)', fontWeight: 700 }}>AKTUELL</span>}
                </div>
                <select value={m.eintraege[mo]} onChange={(e) => refresh(setDatenart(mo, e.target.value))}
                  style={{ ...inp, marginTop: 6, width: '100%', padding: '5px 7px', fontSize: 12, borderLeft: `3px solid ${AMPEL_FARBE[art?.status] || 'var(--line)'}` }}>
                  {DATENARTEN.map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}
                </select>
              </div>
            )
          })}
        </div>
        <div style={{ fontSize: 11, color: 'var(--muted)', marginTop: 10, display: 'flex', gap: 14, flexWrap: 'wrap' }}>
          {DATENARTEN.map((d) => (
            <span key={d.id}><span style={{ display: 'inline-block', width: 9, height: 9, borderRadius: 2, background: AMPEL_FARBE[d.status], marginRight: 5 }} />{d.name}: {d.beschreibung}</span>
          ))}
        </div>
      </div>

      {/* Planauffüllung der Konten im Tagesreporting */}
      <div style={{ ...card, padding: 14 }}>
        <div className="mono" style={{ fontSize: 11, color: 'var(--muted)', textTransform: 'uppercase', marginBottom: 4 }}>Planauffüllung im Tagesreporting</div>
        <div style={{ fontSize: 12, color: 'var(--muted)', marginBottom: 10 }}>
          Diese Konten liegen im laufenden Monat noch nicht (vollständig) in den Auftragsdaten und werden mit <b>Plan</b> aufgefüllt
          (z. B. Gemeinkosten, Abschreibungen). So ist das Tagesreporting trotzdem vollständig.
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <input style={{ ...inp, flex: 1 }} value={neuKonto} onChange={(e) => setNeuKonto(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter' && neuKonto.trim()) { refresh(setPlanKonten([...m.planKonten, neuKonto.trim()])); setNeuKonto('') } }}
            placeholder="Konto-Nr + Bezeichnung (z. B. 6200 Personalaufwand)" />
          <button onClick={() => { if (neuKonto.trim()) { refresh(setPlanKonten([...m.planKonten, neuKonto.trim()])); setNeuKonto('') } }}
            style={{ ...inp, cursor: 'pointer', background: 'var(--accent)', color: '#fff', border: 'none', fontWeight: 600 }}>Hinzufügen</button>
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 7, marginTop: 10 }}>
          {m.planKonten.length === 0 && <span style={{ fontSize: 12, color: 'var(--muted)' }}>Keine Konten – das Tagesreporting nutzt nur Auftragsdaten.</span>}
          {m.planKonten.map((k) => (
            <span key={k} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '4px 6px 4px 11px', borderRadius: 999, background: 'var(--bg)', border: '1px solid var(--line)', fontSize: 13 }}>
              {k}
              <button onClick={() => refresh(setPlanKonten(m.planKonten.filter((x) => x !== k)))} title="Entfernen"
                style={{ border: 'none', background: 'none', cursor: 'pointer', color: 'var(--muted)', fontSize: 15, lineHeight: 1 }}>×</button>
            </span>
          ))}
        </div>
      </div>
    </div>
  )
}
