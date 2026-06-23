// =========================================================================
//  DATENSCHUTZ & SICHERHEIT (Admin) — Klassifizierung, Maskierung in dev/test,
//  Object-/Row-Level-Security und DSGVO-Checkliste.
// =========================================================================
import React, { useState } from 'react'
import { QUELLEN } from '../../core/datenmodell.js'
import { ladeMeasures } from '../../core/measures.js'
import {
  KLASSEN, klasseInfo, ROLLEN, UMGEBUNGEN, umgebung, setzeUmgebung, klasseVon, setzeKlasse, istGeschuetzt, maskiere,
  erlaubteRollen, darfMeasure, setzeOls, RLS_REGELN, rlsVon, setzeRls, CHECKLISTE, ladeCheck, toggleCheck, complianceScore
} from '../../core/datenschutz.js'

const card = { background: 'var(--panel)', border: '1px solid var(--line)', borderRadius: 'var(--radius)', boxShadow: 'var(--shadow)' }
const cap = { fontSize: 11, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '.04em', fontWeight: 700 }
const chip = (a) => ({ padding: '6px 12px', borderRadius: 999, fontSize: 12.5, fontWeight: 600, cursor: 'pointer',
  border: `1px solid ${a ? 'var(--accent)' : 'var(--line)'}`, background: a ? 'var(--accent)' : 'var(--panel)', color: a ? '#fff' : 'var(--ink)' })
const sel = { font: 'inherit', fontSize: 12.5, padding: '4px 8px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--line)', background: 'var(--panel)', cursor: 'pointer' }
const KUNDEN_DEMO = ['Anna Schmidt', 'Onlineshop Privat', 'B2B-Händler Berlin GmbH', 'Velo Schweiz AG']

function KlasseBadge({ klasse }) {
  const k = klasseInfo(klasse)
  return <span style={{ fontSize: 10.5, fontWeight: 700, color: '#fff', background: k.farbe, borderRadius: 999, padding: '1px 8px' }}>{k.name}{k.dsgvo ? ' · DSGVO' : ''}</span>
}

function UmgebungTab({ refresh }) {
  const umg = umgebung()
  return (
    <>
      <div style={{ ...card, padding: 16, marginBottom: 14, borderLeft: `4px solid ${umg === 'prod' ? 'var(--amp-r)' : 'var(--amp-g)'}` }}>
        <div style={{ ...cap, marginBottom: 6 }}>Umgebung</div>
        <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
          {UMGEBUNGEN.map((u) => <button key={u} style={chip(umg === u)} onClick={() => { setzeUmgebung(u); refresh() }}>{u.toUpperCase()}</button>)}
        </div>
        <div style={{ fontSize: 13, color: 'var(--slate)', lineHeight: 1.5 }}>
          Grundsatz (Art. 5 DSGVO, Datenminimierung): In <b>dev</b> und <b>test</b> werden personenbezogene und sensible
          Daten <b>pseudonymisiert/maskiert</b> — keine echten Personendaten außerhalb der Produktion.
          {umg === 'prod' && <span style={{ color: 'var(--amp-r)', fontWeight: 700 }}> Achtung: PROD zeigt echte Daten.</span>}
        </div>
      </div>
      <div style={{ ...card, padding: 16 }}>
        <div style={{ ...cap, marginBottom: 8 }}>Maskierung — Vorschau (Feld „DimKunde.Name", personenbezogen)</div>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
          <thead><tr>{['Quelle (prod)', `Anzeige in ${umg.toUpperCase()}`].map((h, i) => <th key={i} style={{ textAlign: 'left', padding: '6px 8px', borderBottom: '2px solid var(--line)', fontSize: 10, color: 'var(--muted)', textTransform: 'uppercase' }}>{h}</th>)}</tr></thead>
          <tbody>
            {KUNDEN_DEMO.map((n) => (
              <tr key={n}>
                <td style={{ padding: '5px 8px', borderBottom: '1px solid var(--line)', color: 'var(--muted)' }}>{n}</td>
                <td className="mono" style={{ padding: '5px 8px', borderBottom: '1px solid var(--line)', fontWeight: 600, color: umg === 'prod' ? 'var(--ink)' : 'var(--accent)' }}>{maskiere(n, 'personenbezogen', umg)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  )
}

function KlassifizierungTab({ refresh }) {
  const [quelle, setQuelle] = useState('DimKunde')
  const q = QUELLEN.find((x) => x.id === quelle)
  return (
    <>
      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 12 }}>
        {QUELLEN.map((x) => <button key={x.id} style={chip(quelle === x.id)} onClick={() => setQuelle(x.id)}>{x.id}</button>)}
      </div>
      <div style={{ ...card, padding: 16 }}>
        <div style={{ ...cap, marginBottom: 8 }}>Felder von {quelle} klassifizieren</div>
        {q.spalten.map((s) => {
          const feld = `${quelle}.${s}`; const k = klasseVon(feld)
          return (
            <div key={s} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '6px 0', borderBottom: '1px solid var(--line)' }}>
              <span style={{ flex: 1, fontSize: 13, fontWeight: 600 }}>{s}{istGeschuetzt(k) && <span title="in dev/test maskiert" style={{ marginLeft: 6 }}>🔒</span>}</span>
              <KlasseBadge klasse={k} />
              <select value={k} onChange={(e) => { setzeKlasse(feld, e.target.value); refresh() }} style={sel}>
                {KLASSEN.map((kk) => <option key={kk.id} value={kk.id}>{kk.name}</option>)}
              </select>
            </div>
          )
        })}
      </div>
    </>
  )
}

function ZugriffTab({ refresh }) {
  const measures = ladeMeasures()
  return (
    <>
      <div style={{ ...card, padding: 16, marginBottom: 14 }}>
        <div style={{ ...cap, marginBottom: 8 }}>Object-Level-Security — Measures je Rolle freigeben</div>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ borderCollapse: 'collapse', fontSize: 12 }}>
            <thead><tr>
              <th style={{ textAlign: 'left', padding: '6px 8px', borderBottom: '2px solid var(--line)', fontSize: 10, color: 'var(--muted)' }}>MEASURE</th>
              {ROLLEN.map((r) => <th key={r} style={{ padding: '6px 6px', borderBottom: '2px solid var(--line)', fontSize: 9.5, color: 'var(--muted)', writingMode: 'vertical-rl', transform: 'rotate(180deg)', height: 84 }}>{r}</th>)}
            </tr></thead>
            <tbody>
              {measures.map((m) => (
                <tr key={m.id}>
                  <td style={{ padding: '5px 8px', borderBottom: '1px solid var(--line)', fontWeight: 600 }}>{m.name}{!erlaubteRollen(m.id) && <span style={{ color: 'var(--muted)', fontSize: 10 }}> (alle)</span>}</td>
                  {ROLLEN.map((r) => (
                    <td key={r} style={{ padding: '4px 6px', borderBottom: '1px solid var(--line)', textAlign: 'center' }}>
                      <input type="checkbox" checked={darfMeasure(m.id, r)} onChange={(e) => { setzeOls(m.id, r, e.target.checked); refresh() }} />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div style={{ fontSize: 11, color: 'var(--muted)', marginTop: 6 }}>Häkchen weg = Rolle sieht die Kennzahl nicht (Feld bleibt leer/ausgeblendet). Durchsetzung serverseitig im dataProvider.</div>
      </div>
      <div style={{ ...card, padding: 16 }}>
        <div style={{ ...cap, marginBottom: 8 }}>Row-Level-Security — Zeilenfilter je Dimension</div>
        {QUELLEN.filter((x) => x.typ === 'dim' && x.rolle !== 'outrigger').map((d) => (
          <div key={d.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '6px 0', borderBottom: '1px solid var(--line)' }}>
            <span style={{ flex: 1, fontSize: 13, fontWeight: 600 }}>{d.id}</span>
            <select value={rlsVon(d.id)} onChange={(e) => { setzeRls(d.id, e.target.value); refresh() }} style={sel}>
              {RLS_REGELN.map((r) => <option key={r.id} value={r.id}>{r.name}</option>)}
            </select>
          </div>
        ))}
      </div>
    </>
  )
}

function ChecklisteTab({ refresh }) {
  const done = ladeCheck(); const sc = complianceScore()
  return (
    <>
      <div style={{ ...card, padding: 16, marginBottom: 14 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
          <div style={cap}>DSGVO-Compliance</div>
          <span style={{ fontWeight: 700, color: sc.prozent === 100 ? 'var(--amp-g)' : 'var(--amp-a)' }}>{sc.erledigt}/{sc.gesamt} · {sc.prozent} %</span>
        </div>
        <div style={{ height: 8, borderRadius: 4, background: 'var(--bg)', overflow: 'hidden' }}><div style={{ width: `${sc.prozent}%`, height: '100%', background: sc.prozent === 100 ? 'var(--amp-g)' : 'var(--amp-a)' }} /></div>
      </div>
      <div style={{ ...card, padding: 16 }}>
        {CHECKLISTE.map((c) => (
          <label key={c.id} style={{ display: 'flex', gap: 10, padding: '8px 0', borderBottom: '1px solid var(--line)', cursor: 'pointer', alignItems: 'flex-start' }}>
            <input type="checkbox" checked={!!done[c.id]} onChange={() => { toggleCheck(c.id); refresh() }} style={{ marginTop: 3 }} />
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 13.5, fontWeight: 600 }}>{c.titel} <span style={{ fontSize: 11, color: 'var(--accent)', fontWeight: 700 }}>· {c.gesetz}</span></div>
              <div style={{ fontSize: 12, color: 'var(--muted)', lineHeight: 1.4 }}>{c.hinweis}</div>
            </div>
          </label>
        ))}
      </div>
    </>
  )
}

const TABS = [
  { id: 'umgebung', name: '🔐 Umgebung & Maskierung' },
  { id: 'klass', name: '🏷 Klassifizierung' },
  { id: 'zugriff', name: '🛡 Zugriffsschutz (OLS/RLS)' },
  { id: 'check', name: '⚖ DSGVO-Checkliste' }
]

export default function DatenschutzAdmin({ istAdmin }) {
  const [, setTick] = useState(0)
  const [tab, setTab] = useState('umgebung')
  const refresh = () => setTick((t) => t + 1)
  if (!istAdmin) return <div style={{ padding: 24, color: 'var(--muted)' }}>Nur für Administratoren.</div>
  return (
    <div style={{ maxWidth: '100%', margin: '0 auto' }}>
      <div style={{ marginBottom: 12 }}>
        <div style={cap}>Administration · Recht &amp; Sicherheit</div>
        <h2 style={{ margin: '4px 0 0' }}>Datenschutz &amp; Sicherheit</h2>
      </div>
      <div style={{ display: 'flex', gap: 8, marginBottom: 14, flexWrap: 'wrap' }}>
        {TABS.map((x) => (
          <button key={x.id} onClick={() => setTab(x.id)} style={{ padding: '7px 13px', borderRadius: 'var(--radius-sm)', fontSize: 12.5, fontWeight: 600, cursor: 'pointer',
            border: `1px solid ${tab === x.id ? 'var(--accent)' : 'var(--line)'}`, background: tab === x.id ? 'var(--accent)' : 'var(--panel)', color: tab === x.id ? '#fff' : 'var(--ink)' }}>{x.name}</button>
        ))}
      </div>
      {tab === 'umgebung' && <UmgebungTab refresh={refresh} />}
      {tab === 'klass' && <KlassifizierungTab refresh={refresh} />}
      {tab === 'zugriff' && <ZugriffTab refresh={refresh} />}
      {tab === 'check' && <ChecklisteTab refresh={refresh} />}
      <div style={{ fontSize: 11, color: 'var(--muted)', textAlign: 'center', padding: '16px 0 20px' }}>
        Hinweis: UI-seitige Verwaltung. Verbindliche Durchsetzung (Maskierung, OLS/RLS) erfolgt serverseitig im dataProvider/Backend.
      </div>
    </div>
  )
}
