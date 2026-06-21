// =========================================================================
//  AUFTRAGS-LEBENSZYKLUS (Order-to-Cash) — Pipeline, Durchlaufzeiten,
//  Engpass und offene Vorgänge.
// =========================================================================
import React from 'react'
import { PHASEN, phaseInfo, PIPELINE, DURCHLAUF, VORGAENGE, zeitAmpel, gesamtDurchlauf, engpass, kennzahlen, vorgangStatus } from '../../core/auftragsLebenszyklus.js'
import { AMPEL_FARBE } from '../../design/theme.js'

const card = { background: 'var(--panel)', border: '1px solid var(--line)', borderRadius: 'var(--radius)', boxShadow: 'var(--shadow)' }
const cap = { fontSize: 11, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '.03em', fontWeight: 700 }

export default function AuftragsLebenszyklus() {
  const k = kennzahlen()
  const eng = engpass()
  const maxWert = Math.max(...PIPELINE.map((p) => p.wert), 1)

  const kachel = (label, wert, hint, farbe) => (
    <div style={{ ...card, padding: '12px 14px', flex: 1, minWidth: 150 }}>
      <div style={cap}>{label}</div>
      <div style={{ fontSize: 22, fontWeight: 700, marginTop: 2, color: farbe || 'var(--ink)' }}>{wert}</div>
      {hint && <div style={{ fontSize: 11, color: 'var(--muted)' }}>{hint}</div>}
    </div>
  )

  return (
    <div style={{ maxWidth: 1000, margin: '0 auto' }}>
      <div style={{ marginBottom: 14 }}>
        <h2 style={{ margin: '0 0 4px' }}>Auftrags-Lebenszyklus (Order-to-Cash)</h2>
        <div style={{ color: 'var(--muted)', fontSize: 13, maxWidth: 760 }}>
          Der Weg vom Angebot bis zum Geldeingang: <b>Angebot → Auftrag → Fertigung → Lieferung → Rechnung → Bezahlt</b>.
          Wo steckt wie viel, wie lange dauert jeder Schritt und wo ist der Engpass?
        </div>
      </div>

      {/* Kennzahlen */}
      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 14 }}>
        {kachel('Gesamt-Durchlauf', k.gesamtIst + ' Tg', 'Ziel ' + k.gesamtZiel + ' Tg', zeitAmpel(k.gesamtIst, k.gesamtZiel) === 'g' ? 'var(--amp-g)' : zeitAmpel(k.gesamtIst, k.gesamtZiel) === 'a' ? 'var(--amp-a)' : 'var(--amp-r)')}
        {kachel('Auftragsquote', k.auftragsquote + ' %', 'Angebot → Auftrag')}
        {kachel('DSO', k.dso + ' Tg', 'Rechnung → Zahlung')}
        {kachel('Auftragsbestand', k.auftragsbestand + ' Mio €', 'in Auftrag/Fertigung/Lieferung')}
      </div>

      {/* Pipeline */}
      <div style={{ ...card, padding: 16, marginBottom: 14 }}>
        <div style={{ ...cap, marginBottom: 10 }}>Pipeline — offene Vorgänge je Phase</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {PIPELINE.map((p) => (
            <div key={p.phase} style={{ display: 'grid', gridTemplateColumns: '120px 1fr 150px', gap: 10, alignItems: 'center' }}>
              <span style={{ fontSize: 13, fontWeight: 600 }}>{phaseInfo(p.phase).name}</span>
              <div style={{ background: 'var(--bg)', borderRadius: 6, height: 18, overflow: 'hidden' }}>
                <div style={{ width: `${(p.wert / maxWert) * 100}%`, height: '100%', background: 'var(--accent)' }} />
              </div>
              <span className="mono" style={{ fontSize: 12.5, textAlign: 'right' }}>{p.anzahl} Stk · {p.wert.toFixed(1)} Mio €</span>
            </div>
          ))}
        </div>
      </div>

      {/* Durchlaufzeiten */}
      <div style={{ ...card, padding: 16, marginBottom: 14 }}>
        <div style={{ ...cap, marginBottom: 10 }}>Durchlaufzeiten je Übergang</div>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
          <thead><tr>{['Übergang', 'Ø Ist', 'Ziel', '', 'Hinweis'].map((h, i) => (
            <th key={i} style={{ textAlign: i >= 1 && i <= 2 ? 'right' : 'left', padding: '6px 10px', borderBottom: '1px solid var(--line)', fontSize: 11, color: 'var(--muted)', textTransform: 'uppercase' }}>{h}</th>
          ))}</tr></thead>
          <tbody>
            {DURCHLAUF.map((d) => {
              const st = zeitAmpel(d.ist, d.ziel); const istEng = d.id === eng.id
              return (
                <tr key={d.id} style={{ background: istEng ? 'var(--amp-r-soft)' : 'transparent' }}>
                  <td style={{ padding: '6px 10px', borderBottom: '1px solid var(--line)', fontWeight: 600 }}>{d.von} → {d.nach} {istEng && <span style={{ fontSize: 10, color: 'var(--amp-r)', fontWeight: 700 }}>ENGPASS</span>}</td>
                  <td className="mono" style={{ textAlign: 'right', padding: '6px 10px', borderBottom: '1px solid var(--line)' }}>{d.ist} Tg</td>
                  <td className="mono" style={{ textAlign: 'right', padding: '6px 10px', borderBottom: '1px solid var(--line)', color: 'var(--muted)' }}>{d.ziel} Tg</td>
                  <td style={{ padding: '6px 10px', borderBottom: '1px solid var(--line)' }}><span style={{ width: 10, height: 10, borderRadius: '50%', background: AMPEL_FARBE[st], display: 'inline-block' }} /></td>
                  <td style={{ padding: '6px 10px', borderBottom: '1px solid var(--line)', fontSize: 12, color: 'var(--slate)' }}>{d.hinweis}</td>
                </tr>
              )
            })}
          </tbody>
        </table>
        <div style={{ fontSize: 12, color: 'var(--muted)', marginTop: 8 }}>
          Größter Hebel: <b>{eng.von} → {eng.nach}</b> ({eng.ist} statt {eng.ziel} Tg). Jeder Tag weniger DSO setzt Liquidität frei.
        </div>
      </div>

      {/* Offene Vorgänge */}
      <div style={{ ...card, padding: 16 }}>
        <div style={{ ...cap, marginBottom: 10 }}>Offene Vorgänge</div>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
          <thead><tr>{['Nr', 'Kunde', 'Wert', 'Phase', 'Alter', 'Status'].map((h, i) => (
            <th key={i} style={{ textAlign: i === 2 || i === 4 ? 'right' : 'left', padding: '6px 10px', borderBottom: '1px solid var(--line)', fontSize: 11, color: 'var(--muted)', textTransform: 'uppercase' }}>{h}</th>
          ))}</tr></thead>
          <tbody>
            {VORGAENGE.map((v) => {
              const status = vorgangStatus(v); const verz = status === 'verzögert'
              return (
                <tr key={v.nr}>
                  <td className="mono" style={{ padding: '6px 10px', borderBottom: '1px solid var(--line)' }}>{v.nr}</td>
                  <td style={{ padding: '6px 10px', borderBottom: '1px solid var(--line)', fontWeight: 600 }}>{v.kunde}</td>
                  <td className="mono" style={{ textAlign: 'right', padding: '6px 10px', borderBottom: '1px solid var(--line)' }}>{(v.wert * 1000).toFixed(0)} T€</td>
                  <td style={{ padding: '6px 10px', borderBottom: '1px solid var(--line)' }}><span style={{ fontSize: 11, fontWeight: 700, color: '#fff', background: 'var(--accent)', padding: '1px 8px', borderRadius: 999 }}>{phaseInfo(v.phase).name}</span></td>
                  <td className="mono" style={{ textAlign: 'right', padding: '6px 10px', borderBottom: '1px solid var(--line)' }}>{v.alter} Tg</td>
                  <td style={{ padding: '6px 10px', borderBottom: '1px solid var(--line)', fontWeight: 600, color: verz ? 'var(--amp-r)' : 'var(--amp-g)' }}>{status}</td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
