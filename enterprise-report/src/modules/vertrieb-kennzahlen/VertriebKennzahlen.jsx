// =========================================================================
//  VERTRIEBSKENNZAHLEN — Taxonomie in sechs Phasen (Angebot → Umsatz).
//  Σ wertbasiert · ◊ mengenbezogen · % Verhältnis · Ø Schnitt.
// =========================================================================
import React from 'react'
import { phasen, ART_SYMBOL, ART_LEGENDE } from '../../core/vertriebKennzahlen.js'
import ExecKopf, { ampelVon } from '../../components/ExecKopf.jsx'

const card = { background: 'var(--panel)', border: '1px solid var(--line)', borderRadius: 'var(--radius)', boxShadow: 'var(--shadow)' }
const cap = { fontSize: 11, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '.03em', fontWeight: 700 }

const fmt = (k) => {
  if (k.art === 'pct') return `${k.wert.toLocaleString('de-DE')} %`
  if (k.art === 'stk') return `${k.wert.toLocaleString('de-DE')} Stk`
  return `${k.wert.toLocaleString('de-DE')} €`
}

export default function VertriebKennzahlen() {
  const ph = phasen()
  // Exec-Kopf: Lage aus der Auftragsstorno-Quote (kleiner ist besser);
  // wichtigste KPIs (Umsatz, Ø Auftragswert) + schwächste Verlust-KPI.
  const alleKpi = (ph || []).flatMap((p) => p.kpis || [])
  const kpi = (code) => alleKpi.find((k) => k.code === code)
  const ums = kpi('UMS'), umsAuft = kpi('UMSAUFTØ')
  const verluste = ['AUFSTORNO%', 'STORNO%', 'ANGVERL%'].map(kpi).filter(Boolean)
  const schwaechste = verluste.length ? verluste.reduce((a, b) => (b.wert > a.wert ? b : a)) : null
  const aufStorno = kpi('AUFSTORNO%')
  const execStatus = ampelVon(aufStorno ? aufStorno.wert : null, { gut: 4, schlecht: 8, invert: true })
  const execAussage = `Umsatzerlöse ${ums ? fmt(ums) : '—'} bei ${umsAuft ? fmt(umsAuft) : '—'} Ø pro Auftrag${aufStorno ? ` · Auftragsstorno ${fmt(aufStorno)}` : ''}.`
  const execEmpf = schwaechste
    ? `Schwächste Vertriebs-KPI: ${schwaechste.name} mit ${fmt(schwaechste)}${schwaechste.formel ? ` (${schwaechste.formel})` : ''} — Ursachen analysieren und Verluste reduzieren.`
    : 'Verlust- und Stornoquoten in Phase „Vertriebsqualität & Verluste" prüfen.'
  return (
    <div style={{ maxWidth: '100%', margin: '0 auto' }}>
      <div style={{ marginBottom: 14 }}>
        <h2 style={{ margin: '0 0 4px' }}>Vertriebskennzahlen</h2>
        <div style={{ color: 'var(--muted)', fontSize: 13, maxWidth: 820 }}>
          Die Vertriebslogik in sechs Phasen — vom Angebot bis zum Umsatz. <b>AEW (Auftragseingang wirksam) entfällt</b>;
          <b> Offene Aufträge (OAU) = Auftragsbestand</b>.
        </div>
      </div>

      {/* Symbol-Legende */}
      <div style={{ ...card, padding: 12, marginBottom: 14, display: 'flex', gap: 18, flexWrap: 'wrap' }}>
        {ART_LEGENDE.map(([sym, txt]) => (
          <span key={sym} style={{ fontSize: 12.5 }}><b className="mono" style={{ color: 'var(--accent)' }}>{sym}</b> <span style={{ color: 'var(--muted)' }}>{txt}</span></span>
        ))}
      </div>

      <ExecKopf status={execStatus} kennzahl={ums ? fmt(ums) : undefined} kennzahlLabel="Umsatzerlöse" kernaussage={execAussage} empfehlung={execEmpf} />

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: 12 }}>
        {ph.map((p, i) => (
          <div key={p.id} style={{ ...card, padding: 16 }}>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginBottom: 2 }}>
              <span style={{ fontSize: 16 }}>{p.icon}</span>
              <h3 style={{ margin: 0, fontSize: 15 }}>{i + 1}. {p.name}</h3>
            </div>
            <div style={{ fontSize: 12, color: 'var(--muted)', fontStyle: 'italic', marginBottom: 8 }}>{p.hinweis}</div>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12.5 }}>
              <tbody>
                {p.kpis.map((k) => (
                  <tr key={k.code} title={k.formel ? `Formel: ${k.formel}` : undefined}>
                    <td style={{ padding: '5px 4px', borderBottom: '1px solid var(--line)', width: 18, color: 'var(--accent)', fontWeight: 700 }} className="mono">{ART_SYMBOL[k.art]}</td>
                    <td style={{ padding: '5px 4px', borderBottom: '1px solid var(--line)' }}>{k.name}<span className="mono" style={{ color: 'var(--muted)', marginLeft: 6, fontSize: 11 }}>{k.code.replace(/[◊Ø%]$/, '')}</span>{k.formel && <span style={{ color: 'var(--muted)', fontSize: 10.5 }}> · {k.formel}</span>}</td>
                    <td className="mono" style={{ padding: '5px 4px', borderBottom: '1px solid var(--line)', textAlign: 'right', fontWeight: 600, whiteSpace: 'nowrap' }}>{fmt(k)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ))}
      </div>
    </div>
  )
}
