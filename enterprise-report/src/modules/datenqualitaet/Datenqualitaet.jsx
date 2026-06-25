// =========================================================================
//  MODUL: Datenqualität & Querchecks
//  Führt die Validierungsregeln (core/validierung.js) gegen die aktuellen
//  Werte aus und zeigt Abstimmfehler/Plausibilitätswarnungen — die
//  Vertrauensbasis für das digitale Controlling.
// =========================================================================
import React from 'react'
import { pruefeAlle } from '../../core/validierung.js'
import { konsistenzReport, ZIEL_UMSATZ } from '../../core/berichtskonsistenz.js'
import { Badge, AmpelPunkt } from '../../components/ui.jsx'

const FARBE = { ok: 'var(--amp-g)', warnung: 'var(--amp-a)', fehler: 'var(--amp-r)', na: 'var(--muted)' }
const LABEL = { ok: 'OK', warnung: 'Plausibilität', fehler: 'Abstimmfehler', na: 'keine Daten' }
// Validierungs-Status auf die gemeinsame Ampel-Kodierung (g/a/r/n) abbilden.
const AMP = { ok: 'g', warnung: 'a', fehler: 'r', na: 'n' }
const mio = (n) => (n / 1e6).toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' Mio €'

// Berichtsuebergreifender Quercheck: derselbe Jahresumsatz in jedem Bericht?
function KonsistenzPanel() {
  const r = konsistenzReport()
  const kopf = r.gesamt === 'ok' ? '✓ Zahlen berichtsübergreifend stimmig' : r.gesamt === 'warnung' ? '⚠ Leichte Streuung zwischen Berichten' : '✗ Berichte weichen voneinander ab'
  return (
    <div style={{ background: 'var(--panel)', border: `1px solid ${FARBE[r.gesamt]}`, borderRadius: 'var(--radius)', overflow: 'hidden', boxShadow: 'var(--shadow)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, flexWrap: 'wrap', padding: '14px 16px', borderBottom: '1px solid var(--line)', background: r.gesamt === 'ok' ? 'var(--amp-g-soft)' : r.gesamt === 'warnung' ? 'var(--amp-a-soft)' : 'var(--amp-r-soft)' }}>
        <div>
          <div style={{ fontWeight: 700, fontSize: 15, color: FARBE[r.gesamt] }}>{kopf}</div>
          <div style={{ fontSize: 12.5, color: 'var(--slate)', marginTop: 2 }}>
            Jahresumsatz aus jedem Bericht unabhängig berechnet vs. gemeinsame Basis <b>{mio(ZIEL_UMSATZ)}</b> · max. Abweichung <b>{r.maxAbwPct.toLocaleString('de-DE')} %</b> · Spannweite <b>{r.spannePct.toLocaleString('de-DE')} %</b>
          </div>
        </div>
        <span style={{ fontSize: 11, fontWeight: 700, color: FARBE[r.gesamt], border: `1px solid ${FARBE[r.gesamt]}`, borderRadius: 999, padding: '3px 10px', whiteSpace: 'nowrap' }}>
          {r.rows.filter((x) => x.status === 'ok').length}/{r.rows.length} im Ziel
        </span>
      </div>
      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
        <thead><tr>{['Bericht', 'Basis der Berechnung', 'Jahresumsatz', 'Δ zur Basis', ''].map((h, i) => (
          <th key={i} style={{ textAlign: i >= 2 && i < 4 ? 'right' : 'left', padding: '8px 16px', borderBottom: '1px solid var(--line)', fontSize: 10.5, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '.03em' }}>{h}</th>
        ))}</tr></thead>
        <tbody>
          {r.rows.map((x) => (
            <tr key={x.id}>
              <td style={{ padding: '9px 16px', borderTop: '1px solid var(--line)', fontWeight: 600 }}>{x.bericht}</td>
              <td style={{ padding: '9px 16px', borderTop: '1px solid var(--line)', color: 'var(--muted)', fontSize: 12 }}>{x.basis}</td>
              <td className="mono" style={{ padding: '9px 16px', borderTop: '1px solid var(--line)', textAlign: 'right' }}>{mio(x.wert)}</td>
              <td className="mono" style={{ padding: '9px 16px', borderTop: '1px solid var(--line)', textAlign: 'right', fontWeight: 600, color: FARBE[x.status] }}>{x.abwPct >= 0 ? '+' : ''}{x.abwPct.toLocaleString('de-DE')} %</td>
              <td style={{ padding: '9px 16px', borderTop: '1px solid var(--line)' }}><AmpelPunkt status={AMP[x.status]} size={13} /></td>
            </tr>
          ))}
        </tbody>
      </table>
      <div style={{ fontSize: 11, color: 'var(--muted)', padding: '8px 16px' }}>
        Toleranz: bis 2 % = im Ziel, 2–5 % = beobachten, &gt; 5 % = Abstimmfehler. Rundung & Plan-vs-Ist erklären kleine Differenzen.
      </div>
    </div>
  )
}

export default function Datenqualitaet({ werte, periode }) {
  const ergebnisse = pruefeAlle(werte)
  const z = {
    ok: ergebnisse.filter((e) => e.status === 'ok').length,
    warnung: ergebnisse.filter((e) => e.status === 'warnung').length,
    fehler: ergebnisse.filter((e) => e.status === 'fehler').length
  }
  return (
    <div style={{ maxWidth: '100%', margin: '0 auto', display: 'grid', gap: 16 }}>
      <div style={{ background: 'var(--panel)', border: '1px solid var(--line)', borderRadius: 'var(--radius)', padding: 16, boxShadow: 'var(--shadow)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2 style={{ fontSize: 18 }}>Datenqualität & Querchecks <span className="mono" style={{ fontSize: 12, color: 'var(--muted)' }}>· {periode}</span></h2>
          <div style={{ display: 'flex', gap: 8 }}>
            <Badge status="g">{z.ok} OK</Badge>
            <Badge status="a">{z.warnung} Plausibilität</Badge>
            <Badge status="r">{z.fehler} Abstimmfehler</Badge>
          </div>
        </div>
        <p style={{ color: 'var(--muted)', fontSize: 13, marginTop: 6 }}>
          Bereichsübergreifende Abstimmung: Stimmen die Zahlen untereinander? Wo muss ich hinschauen?
        </p>
      </div>

      <KonsistenzPanel />

      <div style={{ background: 'var(--panel)', border: '1px solid var(--line)', borderRadius: 'var(--radius)', overflow: 'hidden' }}>
        {ergebnisse.map((e, i) => (
          <div key={e.id} style={{ display: 'grid', gridTemplateColumns: '14px 1fr 220px 130px', gap: 12, alignItems: 'center',
            padding: '12px 16px', borderTop: i ? '1px solid var(--line)' : 'none' }}>
            <AmpelPunkt status={AMP[e.status]} size={14} />
            <div>
              <div style={{ fontWeight: 600, fontSize: 14 }}>{e.titel}</div>
              <div style={{ fontSize: 12, color: 'var(--muted)' }}>{e.hinweis} · Bereich {e.bereich} · {e.schwere}</div>
            </div>
            <div className="mono" style={{ fontSize: 12, color: 'var(--slate)' }}>
              Ist {e.ist} · Soll {e.soll}
            </div>
            <span style={{ justifySelf: 'end', fontSize: 12, fontWeight: 600, color: FARBE[e.status] }}>{LABEL[e.status]}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
