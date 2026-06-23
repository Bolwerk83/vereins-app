// =========================================================================
//  PROZESSKETTE Angebot → Umsatz — Flussgrafik (Funnel) mit Abgängen je Stufe.
// =========================================================================
import React from 'react'
import { funnel, gesamtKonversion } from '../../core/prozesskette.js'

const card = { background: 'var(--panel)', border: '1px solid var(--line)', borderRadius: 'var(--radius)', boxShadow: 'var(--shadow)' }
const cap = { fontSize: 11, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '.03em', fontWeight: 700 }
const eur = (v) => (v / 1000000).toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' Mio €'

export default function Prozesskette({ onGeh }) {
  const f = funnel()
  const start = f[0].wert

  return (
    <div style={{ maxWidth: '100%', margin: '0 auto' }}>
      <div style={{ marginBottom: 14 }}>
        <h2 style={{ margin: '0 0 4px' }}>Prozesskette: Angebot → Umsatz</h2>
        <div style={{ color: 'var(--muted)', fontSize: 13, maxWidth: 820 }}>
          Wie aus dem Angebotseingang über mehrere Stufen die Umsatzerlöse werden — mit den Abgängen je Stufe
          (verlorene/offene Angebote, Stornos, noch nicht fakturiert). Ab dem <b>bereinigten Auftragseingang</b> wird die
          Lieferkette angestoßen; die Wertschöpfung läuft bis zu den Umsatzerlösen.
        </div>
      </div>

      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 14 }}>
        <Kpi label="Angebotseingang" wert={eur(start)} />
        <Kpi label="Umsatzerlöse" wert={eur(f[f.length - 1].wert)} farbe="var(--amp-g)" />
        <Kpi label="Gesamtkonversion" wert={`${gesamtKonversion()} %`} sub="Angebot → Umsatz" farbe="var(--accent)" />
      </div>

      <div style={{ ...card, padding: '20px 24px' }}>
        {f.map((s, i) => {
          const breite = Math.max(14, s.wert / start * 100)
          const letzte = i === f.length - 1
          return (
            <div key={s.code}>
              {/* Funnel-Balken */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                <div style={{ flex: 1 }}>
                  <div title={`${s.anteilStart} % vom Angebotseingang`} style={{
                    width: `${breite}%`, minWidth: 120, margin: '0 auto', background: letzte ? 'var(--amp-g)' : 'var(--accent)',
                    color: '#fff', borderRadius: 8, padding: '10px 14px', transition: 'width .2s',
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 10, boxShadow: 'var(--shadow)' }}>
                    <span style={{ fontWeight: 700, fontSize: 13 }}><span className="mono" style={{ opacity: .8, marginRight: 6 }}>{s.code}</span>{s.name}</span>
                    <span className="mono" style={{ fontWeight: 700, whiteSpace: 'nowrap' }}>{eur(s.wert)}</span>
                  </div>
                  <div style={{ textAlign: 'center', fontSize: 10.5, color: 'var(--muted)', marginTop: 3 }}>
                    {s.anteilStart} % vom Angebot{i > 0 ? ` · ${s.stufenKonversion} % der Vorstufe` : ''}
                    {s.kette && <span style={{ color: 'var(--accent)', fontWeight: 600 }}> · {s.kette}</span>}
                  </div>
                </div>
              </div>
              {/* Abgänge zur nächsten Stufe */}
              {!letzte && (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', margin: '6px 0' }}>
                  {(s.abgaenge || []).map((a) => (
                    <div key={a.name} style={{ fontSize: 11.5, color: 'var(--amp-r)' }}>
                      ↘ − {eur(a.wert)} <span style={{ color: 'var(--muted)' }}>{a.name}</span>
                    </div>
                  ))}
                  <div style={{ color: 'var(--muted)', fontSize: 14, lineHeight: 1 }}>▼</div>
                </div>
              )}
            </div>
          )
        })}
      </div>
      <div style={{ fontSize: 12, color: 'var(--muted)', marginTop: 10 }}>
        Lesehilfe: Die Balkenbreite entspricht dem Anteil am Angebotseingang. Jeder rote Abgang reduziert die Stufe zur
        nächsten. {onGeh && <>Codes & Definitionen unter <a style={{ color: 'var(--accent)', cursor: 'pointer' }} onClick={() => onGeh('vertriebkpi')}>Vertriebskennzahlen</a>.</>}
      </div>
    </div>
  )
}

function Kpi({ label, wert, sub, farbe }) {
  return <div style={{ ...card, padding: '10px 13px', flex: 1, minWidth: 150 }}>
    <div style={cap}>{label}</div>
    <div style={{ fontSize: 20, fontWeight: 700, color: farbe || 'var(--ink)' }}>{wert}</div>
    {sub && <div style={{ fontSize: 11, color: 'var(--muted)' }}>{sub}</div>}
  </div>
}
