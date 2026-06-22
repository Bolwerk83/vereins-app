// =========================================================================
//  LAGERVERWALTUNG (Controlling-Sicht) — Kapitalbindung, Lagerhaltungskosten,
//  Standortkosten und Bestandsoptimierung (EOQ, Melde-/Sicherheitsbestand).
// =========================================================================
import React, { useState } from 'react'
import { kennzahlen, standorteAuswertung, optimierung, KOSTENSATZ, lagerhaltungskostensatz, KALK_ZINS } from '../../core/lager.js'

const card = { background: 'var(--panel)', border: '1px solid var(--line)', borderRadius: 'var(--radius)', boxShadow: 'var(--shadow)' }
const cap = { fontSize: 11, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '.03em', fontWeight: 700 }
const m1 = (v) => v.toLocaleString('de-DE', { minimumFractionDigits: 1, maximumFractionDigits: 1 })
const eur0 = (v) => Math.round(v).toLocaleString('de-DE')
const th = (al) => ({ textAlign: al, padding: '6px 9px', borderBottom: '2px solid var(--line)', fontSize: 10, color: 'var(--muted)', textTransform: 'uppercase' })
const td = (al, bold) => ({ textAlign: al, padding: '7px 9px', borderBottom: '1px solid var(--line)', fontWeight: bold ? 700 : 400 })

export default function Lagerverwaltung({ onGeh }) {
  const [tab, setTab] = useState('uebersicht')
  const k = kennzahlen()
  const standorte = standorteAuswertung()
  const opt = optimierung()
  const satz = lagerhaltungskostensatz()

  return (
    <div style={{ maxWidth: '100%', margin: '0 auto' }}>
      <div style={{ marginBottom: 14 }}>
        <h2 style={{ margin: '0 0 4px' }}>Lagerverwaltung — Controlling-Sicht</h2>
        <div style={{ color: 'var(--muted)', fontSize: 13, maxWidth: 720 }}>
          Wirtschaftliche Steuerung des Lagers: gebundenes Kapital, Lagerhaltungskosten, Standortkosten und die
          Bestandsoptimierung. Nicht die operative Lagerplatzverwaltung, sondern die Frage „<i>was kostet uns das Lager?</i>".
        </div>
      </div>

      {/* KPIs */}
      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 14 }}>
        <Kpi label="Lagerbestandswert" wert={`${m1(k.bestandswert)} Mio €`} />
        <Kpi label="Kapitalbindung (Zins)" wert={`${m1(k.kapitalbindung)} Mio €`} sub={`${KALK_ZINS} % kalk.`} farbe="var(--amp-a)" />
        <Kpi label="Lagerhaltungskosten/J" wert={`${m1(k.lagerhaltungskosten)} Mio €`} sub={`Satz ${satz} %`} farbe="var(--amp-r)" />
        <Kpi label="Umschlag" wert={`${m1(k.umschlag)}×`} sub={`Reichweite ${k.reichweite} Tage`} />
        <Kpi label="Platz-Auslastung" wert={`${k.auslastung} %`} farbe={k.auslastung > 90 ? 'var(--amp-r)' : 'var(--amp-g)'} />
        <Kpi label="Servicegrad" wert={`${k.servicegrad} %`} farbe="var(--amp-g)" />
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 6, marginBottom: 12, flexWrap: 'wrap' }}>
        {[['uebersicht', 'Kostenstruktur'], ['standorte', 'Standorte'], ['optimierung', 'Bestandsoptimierung']].map(([id, n]) => (
          <button key={id} onClick={() => setTab(id)} style={{ padding: '7px 13px', borderRadius: 'var(--radius-sm)', cursor: 'pointer', fontSize: 13, fontWeight: 600,
            border: `1px solid ${tab === id ? 'var(--accent)' : 'var(--line)'}`, background: tab === id ? 'var(--accent)' : 'var(--panel)', color: tab === id ? '#fff' : 'var(--ink)' }}>{n}</button>
        ))}
      </div>

      {tab === 'uebersicht' && (
        <div style={{ ...card, padding: 16 }}>
          <div style={{ ...cap, marginBottom: 10 }}>Lagerhaltungskostensatz — Zusammensetzung ({satz} % vom Bestandswert)</div>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
            <thead><tr>{['Kostenblock', 'Satz', 'Kosten/Jahr', ''].map((h, i) => <th key={i} style={th(i === 0 ? 'left' : i === 3 ? 'left' : 'right')}>{h}</th>)}</tr></thead>
            <tbody>
              {KOSTENSATZ.map((c) => (
                <tr key={c.id}>
                  <td style={td('left', true)}>{c.name}<div style={{ fontWeight: 400, fontSize: 11.5, color: 'var(--muted)' }}>{c.laie}</div></td>
                  <td className="mono" style={td('right')}>{c.satz} %</td>
                  <td className="mono" style={td('right')}>{m1(k.bestandswert * c.satz / 100)} Mio €</td>
                  <td style={{ padding: '7px 9px', borderBottom: '1px solid var(--line)', width: 120 }}>
                    <div style={{ height: 8, background: 'var(--bg)', borderRadius: 4, overflow: 'hidden' }}><div style={{ width: `${c.satz / satz * 100}%`, height: '100%', background: 'var(--accent)' }} /></div>
                  </td>
                </tr>
              ))}
              <tr style={{ background: 'var(--accent-soft)' }}>
                <td style={td('left', true)}>= Lagerhaltungskostensatz</td>
                <td className="mono" style={td('right', true)}>{satz} %</td>
                <td className="mono" style={td('right', true)}>{m1(k.lagerhaltungskosten)} Mio €</td><td />
              </tr>
            </tbody>
          </table>
          <div style={{ fontSize: 12, color: 'var(--muted)', marginTop: 10 }}>
            Jeder Euro Bestand kostet rund <b>{satz} % pro Jahr</b>. Bestände senken wirkt also doppelt: weniger Kapitalbindung <i>und</i> weniger Lagerkosten.
            {onGeh && <> Siehe <a style={{ color: 'var(--accent)', cursor: 'pointer' }} onClick={() => onGeh('bestand')}>Bestands-Gängigkeit</a> für Ladenhüter-Abbau.</>}
          </div>
        </div>
      )}

      {tab === 'standorte' && (
        <div style={{ ...card, padding: 16, overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13, minWidth: 720 }}>
            <thead><tr>{['Standort', 'Fläche', 'Bestand', 'Auslastung', 'Kosten/J', 'Kosten/m²', '% vom Bestand'].map((h, i) => <th key={i} style={th(i === 0 ? 'left' : 'right')}>{h}</th>)}</tr></thead>
            <tbody>
              {standorte.map((s) => (
                <tr key={s.id}>
                  <td style={td('left', true)}>{s.name}</td>
                  <td className="mono" style={td('right')}>{s.flaeche.toLocaleString('de-DE')} m²</td>
                  <td className="mono" style={td('right')}>{m1(s.bestandswert)} Mio</td>
                  <td className="mono" style={{ ...td('right'), color: s.auslastung > 90 ? 'var(--amp-r)' : s.auslastung < 60 ? 'var(--amp-a)' : 'var(--amp-g)' }}>{s.auslastung} %</td>
                  <td className="mono" style={td('right')}>{eur0(s.kostenTsd)} Tsd €</td>
                  <td className="mono" style={td('right')}>{eur0(s.kostenJeM2)} €</td>
                  <td className="mono" style={td('right')}>{s.kostenQuote} %</td>
                </tr>
              ))}
            </tbody>
          </table>
          <div style={{ fontSize: 12, color: 'var(--muted)', marginTop: 10 }}>
            Das externe 3PL-Läger ist nur zu {standorte.find((s) => s.id === 'extern')?.auslastung} % ausgelastet — Konsolidierung prüfen.
            Hohe „Kosten je m²" und „% vom Bestand" zeigen die teuersten Standorte.
          </div>
        </div>
      )}

      {tab === 'optimierung' && (
        <div style={{ ...card, padding: 16, overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12.5, minWidth: 760 }}>
            <thead><tr>{['Artikel', 'Bedarf/J', 'Opt. Menge (EOQ)', 'Bestell./J', 'Sicherh.', 'Meldebest.', 'Höchstbest.', 'Kosten/J'].map((h, i) => <th key={i} style={th(i === 0 ? 'left' : 'right')}>{h}</th>)}</tr></thead>
            <tbody>
              {opt.rows.map((r) => (
                <tr key={r.id}>
                  <td style={td('left', true)}>{r.name}</td>
                  <td className="mono" style={td('right')}>{r.jahresbedarf.toLocaleString('de-DE')}</td>
                  <td className="mono" style={td('right', true)}>{r.eoqMenge.toLocaleString('de-DE')}</td>
                  <td className="mono" style={td('right')}>{r.bestellungenProJahr}×</td>
                  <td className="mono" style={td('right')}>{r.sicherheitsbestand.toLocaleString('de-DE')}</td>
                  <td className="mono" style={{ ...td('right'), color: 'var(--accent)' }}>{r.meldebestand.toLocaleString('de-DE')}</td>
                  <td className="mono" style={td('right')}>{r.hoechstbestand.toLocaleString('de-DE')}</td>
                  <td className="mono" style={td('right')}>{eur0(r.gesamtkostenJahr)} €</td>
                </tr>
              ))}
              <tr style={{ background: 'var(--bg)' }}>
                <td style={td('left', true)}>Summe (Ø gebundenes Kapital {eur0(opt.gebundenWert)} €)</td>
                <td colSpan={6} />
                <td className="mono" style={td('right', true)}>{eur0(opt.gesamtkosten)} €</td>
              </tr>
            </tbody>
          </table>
          <div style={{ fontSize: 12, color: 'var(--muted)', marginTop: 10 }}>
            <b>Optimale Bestellmenge (Andler):</b> Minimum aus Bestell- und Lagerkosten. <b>Meldebestand</b> = ab hier neu bestellen
            (Tagesbedarf × Wiederbeschaffungszeit + Sicherheitsbestand). <b>Höchstbestand</b> = Sicherheits- + Optimalmenge.
          </div>
        </div>
      )}
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
