// =========================================================================
//  DATENARCHITEKTUR — Konzeptseite: Schichten (Quelle→Browser), Sternschema,
//  Profit-Center-Baum als Dimension, RLS/OLS-Pushdown, ELT externer Daten.
// =========================================================================
import React from 'react'
import { SCHICHTEN, STERN, PRINZIPIEN, RICHTWERTE } from '../../core/datenarchitektur.js'

const card = { background: 'var(--panel)', border: '1px solid var(--line)', borderRadius: 'var(--radius)', boxShadow: 'var(--shadow)' }
const cap = { fontSize: 11, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '.04em', fontWeight: 700 }

function Stern() {
  const dims = STERN.dimensionen
  return (
    <div style={{ ...card, padding: 18 }}>
      <div style={{ ...cap, marginBottom: 12 }}>Sternschema · schlanke Fakten, conformte Dimensionen</div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 10, marginBottom: 12 }}>
        {dims.slice(0, 3).map((d) => <DimBox key={d.id} d={d} />)}
      </div>
      <div style={{ display: 'flex', justifyContent: 'center', gap: 10, flexWrap: 'wrap', margin: '4px 0 12px' }}>
        {STERN.fakten.map((f) => (
          <div key={f.id} style={{ background: 'var(--accent)', color: '#fff', borderRadius: 'var(--radius)', padding: '12px 18px', textAlign: 'center', minWidth: 170, boxShadow: 'var(--shadow)' }}>
            <div style={{ fontWeight: 800, fontSize: 14 }}>✳️ {f.name}</div>
            <div style={{ fontSize: 11.5, opacity: 0.9, marginTop: 2 }}>{f.measures}</div>
          </div>
        ))}
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 10 }}>
        {dims.slice(3).map((d) => <DimBox key={d.id} d={d} />)}
      </div>
      <div style={{ fontSize: 11.5, color: 'var(--muted)', marginTop: 12, lineHeight: 1.5 }}>
        Faktentabellen enthalten nur Schlüssel + Kennzahlen → Columnstore komprimiert stark, Joins gehen gegen wenige
        Dim-Zeilen. <b>DimProfitCenter</b> ist derselbe Baum wie im PC-Filter (Geschäftsbereich/Kanal/Land) — Roll-up
        über die Hierarchie. Snowflake nur für tiefe Hierarchien (Outrigger, z. B. Artikel → Warengruppe → Sortiment).
      </div>
    </div>
  )
}
function DimBox({ d }) {
  return (
    <div style={{ border: '1px solid var(--line)', borderRadius: 'var(--radius-sm)', padding: '9px 11px', background: 'var(--bg)' }}>
      <div style={{ fontWeight: 700, fontSize: 12.5 }}>{d.name}</div>
      <div style={{ fontSize: 11, color: 'var(--muted)', marginTop: 2 }}>{d.hierarchie}</div>
    </div>
  )
}

export default function Datenarchitektur() {
  return (
    <div style={{ maxWidth: 1080, margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', gap: 12, flexWrap: 'wrap', marginBottom: 12 }}>
        <div>
          <div style={cap}>Konzept · Daten- & Performance-Architektur</div>
          <h2 style={{ margin: '4px 0 0' }}>Datenarchitektur</h2>
          <div style={{ fontSize: 12.5, color: 'var(--muted)', marginTop: 4, maxWidth: 760 }}>
            Wie das Reporting über Millionen Datensätze und Jahre schnell, konsistent und sicher bleibt — ohne die
            Granularität wegzuaggregieren. Ausführlich in <code>PERFORMANCE.md</code>.
          </div>
        </div>
        <button className="no-print" onClick={() => window.print()} style={{ padding: '7px 13px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--line)', background: 'var(--panel)', cursor: 'pointer', fontSize: 13, fontWeight: 600 }}>🖨 Drucken / PDF</button>
      </div>

      {/* Pipeline */}
      <div style={{ ...card, padding: 16, marginBottom: 14 }}>
        <div style={{ ...cap, marginBottom: 12 }}>Schichten — von der Quelle bis zum Browser</div>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'stretch' }}>
          {SCHICHTEN.map((s, i) => (
            <React.Fragment key={s.id}>
              <div style={{ flex: '1 1 180px', minWidth: 160, border: '1px solid var(--line)', borderRadius: 'var(--radius-sm)', padding: '10px 12px', background: 'var(--bg)' }}>
                <div style={{ fontWeight: 700, fontSize: 13 }}>{s.icon} {s.name}</div>
                <div style={{ fontSize: 11.5, color: 'var(--muted)', marginTop: 4, lineHeight: 1.45 }}>{s.text}</div>
              </div>
              {i < SCHICHTEN.length - 1 && <div className="no-print" style={{ alignSelf: 'center', color: 'var(--muted)', fontWeight: 700 }}>→</div>}
            </React.Fragment>
          ))}
        </div>
      </div>

      {/* Sternschema */}
      <div style={{ marginBottom: 14 }}><Stern /></div>

      {/* Prinzipien + Sicherheit */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 12, marginBottom: 14 }}>
        {PRINZIPIEN.map((p) => (
          <div key={p.titel} style={{ ...card, padding: 14, borderLeft: '3px solid var(--accent)' }}>
            <div style={{ fontWeight: 700, fontSize: 13.5 }}>{p.titel}</div>
            <div style={{ fontSize: 12.5, color: 'var(--slate)', marginTop: 4, lineHeight: 1.5 }}>{p.text}</div>
          </div>
        ))}
      </div>

      {/* Richtwerte */}
      <div style={{ ...card, padding: 16 }}>
        <div style={{ ...cap, marginBottom: 8 }}>Richtwerte</div>
        <ul style={{ margin: 0, paddingLeft: 18, fontSize: 12.5, color: 'var(--slate)', lineHeight: 1.7 }}>
          {RICHTWERTE.map((r, i) => <li key={i}>{r}</li>)}
        </ul>
      </div>
      <div style={{ fontSize: 11, color: 'var(--muted)', textAlign: 'center', padding: '14px 0 20px' }}>
        Architektur-Leitlinie. Greift, sobald die Listen an echte Quellen (MSSQL/WaWi) angebunden werden — die UI bleibt gleich.
      </div>
    </div>
  )
}
