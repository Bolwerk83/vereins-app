// =========================================================================
//  LEASING-COCKPIT — Leasingnehmer (gezahlte Gebühren), Leasing vs. Kauf,
//  IFRS 16 (Right-of-Use & Verbindlichkeit) und Dienstrad-Leasing (Anbieter).
// =========================================================================
import React, { useState } from 'react'
import {
  vertraege, leasingKennzahlen, kategorieVerteilung, leasingVsKauf, ifrs16, dienstradKennzahlen, DIENSTRAD, HEUTE
} from '../../core/leasing.js'

const card = { background: 'var(--panel)', border: '1px solid var(--line)', borderRadius: 'var(--radius)', boxShadow: 'var(--shadow)' }
const cap = { fontSize: 11, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '.04em', fontWeight: 700 }
const chip = (a) => ({ padding: '6px 13px', borderRadius: 999, fontSize: 13, cursor: 'pointer', fontWeight: 600,
  border: `1px solid ${a ? 'var(--accent)' : 'var(--line)'}`, background: a ? 'var(--accent)' : 'var(--panel)', color: a ? '#fff' : 'var(--ink)' })
const eur = (n) => Math.round(n).toLocaleString('de-DE') + ' €'
const teur = (n) => Math.round(n / 1000).toLocaleString('de-DE') + ' T€'
const KATFARBE = { Fuhrpark: '#2563eb', Maschinen: '#f59e0b', IT: '#7c3aed', Immobilie: '#10b981' }

function Tile({ label, value, sub, color }) {
  return (
    <div style={{ ...card, padding: '12px 14px', flex: 1, minWidth: 150, borderTop: `3px solid ${color || 'var(--accent)'}` }}>
      <div style={{ ...cap, marginBottom: 3 }}>{label}</div>
      <div className="mono" style={{ fontSize: 20, fontWeight: 700 }}>{value}</div>
      {sub && <div style={{ fontSize: 12, color: 'var(--muted)', marginTop: 2 }}>{sub}</div>}
    </div>
  )
}

function Gebuehren() {
  const k = leasingKennzahlen()
  const v = vertraege()
  const kat = kategorieVerteilung()
  const maxKat = Math.max(...kat.map((x) => x.jahresgebuehr), 1)
  return (
    <>
      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 14 }}>
        <Tile label="Leasinggebühren p. a." value={eur(k.jahresgebuehr)} sub={`${eur(k.monatsrate)} / Monat`} />
        <Tile label="Verträge" value={k.anzahl} sub={`Ø Restlaufzeit ${k.oRestlaufzeit} Mon.`} />
        <Tile label="Bisher gezahlt (kum.)" value={teur(k.bisherGezahlt)} />
        <Tile label="Offene Restzahlung" value={teur(k.restzahlung)} color="#f59e0b" />
        <Tile label="Summe Restwerte" value={teur(k.restwerte)} />
        <Tile label="Laufen < 12 Mon. aus" value={k.laufenAus} sub="Anschlussbeschaffung planen" color={k.laufenAus ? '#ef4444' : 'var(--amp-g)'} />
      </div>

      <div style={{ ...card, padding: 16, marginBottom: 14 }}>
        <div style={{ ...cap, marginBottom: 8 }}>Leasinggebühren p. a. nach Kategorie</div>
        <div style={{ display: 'grid', gap: 7 }}>
          {kat.map((x) => (
            <div key={x.kategorie} style={{ display: 'grid', gridTemplateColumns: '120px 1fr 92px', alignItems: 'center', gap: 8 }}>
              <span style={{ fontSize: 12.5, fontWeight: 600 }}>{x.kategorie} <span style={{ color: 'var(--muted)', fontWeight: 400 }}>({x.anzahl})</span></span>
              <div style={{ background: 'var(--bg)', borderRadius: 4, height: 16, border: '1px solid var(--line)', overflow: 'hidden' }}>
                <div style={{ width: `${x.jahresgebuehr / maxKat * 100}%`, height: '100%', background: KATFARBE[x.kategorie] }} />
              </div>
              <span className="mono" style={{ fontSize: 12, textAlign: 'right', color: 'var(--muted)' }}>{eur(x.jahresgebuehr)}</span>
            </div>
          ))}
        </div>
      </div>

      <div style={{ ...card, padding: 16, overflowX: 'auto' }}>
        <div style={{ ...cap, marginBottom: 8 }}>Verträge (Stichtag {HEUTE})</div>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
          <thead><tr>{['Objekt', 'Kat.', 'Leasinggeber', 'Beginn', 'Ende', 'Rate/Mon.', 'Restlaufz.', 'Restwert', 'gezahlt'].map((h, i) => (
            <th key={i} style={{ textAlign: i >= 5 ? 'right' : 'left', padding: '6px 8px', borderBottom: '2px solid var(--line)', fontSize: 10, color: 'var(--muted)', textTransform: 'uppercase', whiteSpace: 'nowrap' }}>{h}</th>
          ))}</tr></thead>
          <tbody>
            {v.map((x) => (
              <tr key={x.id} style={{ background: x.laeuftAus ? 'var(--amp-a-soft)' : undefined }}>
                <td style={{ padding: '5px 8px', borderBottom: '1px solid var(--line)', fontWeight: 600 }}>{x.objekt}</td>
                <td style={{ padding: '5px 8px', borderBottom: '1px solid var(--line)' }}><span style={{ fontSize: 10.5, color: '#fff', background: KATFARBE[x.kategorie], padding: '1px 7px', borderRadius: 999 }}>{x.kategorie}</span></td>
                <td style={{ padding: '5px 8px', borderBottom: '1px solid var(--line)', color: 'var(--muted)' }}>{x.geber}</td>
                <td className="mono" style={{ padding: '5px 8px', borderBottom: '1px solid var(--line)' }}>{x.beginn}</td>
                <td className="mono" style={{ padding: '5px 8px', borderBottom: '1px solid var(--line)' }}>{x.ende}</td>
                <td className="mono" style={{ padding: '5px 8px', borderBottom: '1px solid var(--line)', textAlign: 'right' }}>{eur(x.rate)}</td>
                <td className="mono" style={{ padding: '5px 8px', borderBottom: '1px solid var(--line)', textAlign: 'right', color: x.laeuftAus ? 'var(--amp-a)' : 'var(--ink)', fontWeight: x.laeuftAus ? 700 : 400 }}>{x.restlaufzeit} Mon.</td>
                <td className="mono" style={{ padding: '5px 8px', borderBottom: '1px solid var(--line)', textAlign: 'right' }}>{eur(x.restwert)}</td>
                <td className="mono" style={{ padding: '5px 8px', borderBottom: '1px solid var(--line)', textAlign: 'right', color: 'var(--muted)' }}>{teur(x.bisherGezahlt)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  )
}

function Vergleich() {
  const rows = leasingVsKauf()
  const summeVorteil = rows.reduce((n, r) => n + r.vorteilLeasing, 0)
  return (
    <>
      <div style={{ ...card, padding: 16, marginBottom: 14, borderLeft: '3px solid var(--accent)' }}>
        <div style={{ fontSize: 13.5, lineHeight: 1.5 }}>
          Vorteilhaftigkeitsvergleich je Objekt über die Laufzeit: <b>Leasing</b> (Σ Raten) gegen <b>Kauf</b>
          (Anschaffung + kalk. Zinsen − Restwerterlös). Positiver Vorteil = Leasing günstiger.
          Über alle Objekte ist <b style={{ color: summeVorteil >= 0 ? 'var(--amp-g)' : 'var(--amp-r)' }}>{summeVorteil >= 0 ? 'Leasing' : 'Kauf'}</b> in Summe um {teur(Math.abs(summeVorteil))} vorteilhafter.
        </div>
      </div>
      <div style={{ ...card, padding: 16, overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12.5 }}>
          <thead><tr>{['Objekt', 'Leasing gesamt', 'Kauf gesamt', 'davon Zinsen', 'Vorteil Leasing', 'Empfehlung'].map((h, i) => (
            <th key={i} style={{ textAlign: i >= 1 && i <= 4 ? 'right' : 'left', padding: '6px 8px', borderBottom: '2px solid var(--line)', fontSize: 10, color: 'var(--muted)', textTransform: 'uppercase' }}>{h}</th>
          ))}</tr></thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.id}>
                <td style={{ padding: '5px 8px', borderBottom: '1px solid var(--line)', fontWeight: 600 }}>{r.objekt}</td>
                <td className="mono" style={{ padding: '5px 8px', borderBottom: '1px solid var(--line)', textAlign: 'right' }}>{teur(r.leasing)}</td>
                <td className="mono" style={{ padding: '5px 8px', borderBottom: '1px solid var(--line)', textAlign: 'right' }}>{teur(r.kauf)}</td>
                <td className="mono" style={{ padding: '5px 8px', borderBottom: '1px solid var(--line)', textAlign: 'right', color: 'var(--muted)' }}>{teur(r.zinsen)}</td>
                <td className="mono" style={{ padding: '5px 8px', borderBottom: '1px solid var(--line)', textAlign: 'right', fontWeight: 700, color: r.vorteilLeasing >= 0 ? 'var(--amp-g)' : 'var(--amp-r)' }}>{r.vorteilLeasing >= 0 ? '+' : '−'}{teur(Math.abs(r.vorteilLeasing))}</td>
                <td style={{ padding: '5px 8px', borderBottom: '1px solid var(--line)' }}><span style={{ fontSize: 11, fontWeight: 700, color: '#fff', background: r.empfehlung === 'Leasing' ? 'var(--amp-g)' : 'var(--amp-a)', padding: '1px 8px', borderRadius: 999 }}>{r.empfehlung}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
        <div style={{ fontSize: 11, color: 'var(--muted)', marginTop: 8 }}>Vereinfachte Nominalrechnung (ohne Steuer-/Barwerteffekte); kalk. Zins 6 % auf das durchschnittlich gebundene Kapital.</div>
      </div>
    </>
  )
}

function Ifrs() {
  const f = ifrs16()
  return (
    <>
      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 14 }}>
        <Tile label="Right-of-Use-Asset" value={teur(f.rouAsset)} sub="aktivierte Nutzungsrechte" />
        <Tile label="Leasingverbindlichkeit" value={teur(f.verbindlichkeit)} color="#f59e0b" />
        <Tile label="davon kurzfristig" value={teur(f.kurzfristig)} sub="fällig < 12 Mon." />
        <Tile label="davon langfristig" value={teur(f.langfristig)} />
      </div>
      <div style={{ ...card, padding: 16, marginBottom: 14 }}>
        <div style={{ ...cap, marginBottom: 8 }}>GuV-Effekt p. a.: HGB ↔ IFRS 16</div>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
          <tbody>
            <tr><td style={{ padding: '6px 8px', borderBottom: '1px solid var(--line)' }}>HGB: Leasingaufwand (sonstiger betr. Aufwand)</td><td className="mono" style={{ padding: '6px 8px', borderBottom: '1px solid var(--line)', textAlign: 'right' }}>{teur(f.hgbAufwand)}</td></tr>
            <tr><td style={{ padding: '6px 8px', borderBottom: '1px solid var(--line)' }}>IFRS 16: Abschreibung Right-of-Use</td><td className="mono" style={{ padding: '6px 8px', borderBottom: '1px solid var(--line)', textAlign: 'right' }}>{teur(f.ifrsAbschreibung)}</td></tr>
            <tr><td style={{ padding: '6px 8px', borderBottom: '1px solid var(--line)' }}>IFRS 16: Zinsaufwand Leasingverbindlichkeit</td><td className="mono" style={{ padding: '6px 8px', borderBottom: '1px solid var(--line)', textAlign: 'right' }}>{teur(f.ifrsZins)}</td></tr>
            <tr><td style={{ padding: '6px 8px', fontWeight: 700, color: 'var(--amp-g)' }}>→ EBITDA-Effekt (Aufwand verlässt das EBITDA)</td><td className="mono" style={{ padding: '6px 8px', textAlign: 'right', fontWeight: 700, color: 'var(--amp-g)' }}>+{teur(f.ebitdaEffekt)}</td></tr>
          </tbody>
        </table>
      </div>
      <div style={{ ...card, padding: 16, borderLeft: '3px solid var(--accent)', fontSize: 12.5, color: 'var(--slate)', lineHeight: 1.5 }}>
        Nach <b>HGB</b> bleiben Operating-Leasingverhältnisse off-balance (nur Aufwand). Nach <b>IFRS 16</b> werden
        nahezu alle Leasingverhältnisse bilanziert: ein <b>Right-of-Use-Asset</b> und eine <b>Leasingverbindlichkeit</b>;
        der Aufwand verschiebt sich von „sonstiger Aufwand" zu <b>Abschreibung + Zins</b> — das hebt EBITDA und Bilanzsumme
        (Leverage-Kennzahlen beachten). Werte hier vereinfacht (linear, Faktor-Barwert).
      </div>
    </>
  )
}

function Dienstrad() {
  const d = dienstradKennzahlen()
  const maxSeg = Math.max(...d.segmente.map((s) => s.anteil), 1)
  return (
    <>
      <div style={{ ...card, padding: 14, marginBottom: 14, borderLeft: '3px solid #10b981' }}>
        <div style={{ fontSize: 13.5, lineHeight: 1.5 }}>
          Wir als <b>Leasinggeber</b>: Dienstrad-Leasing als eigener Ertrags- und Servicekanal. Portfolio aus aktiven
          Verträgen, wiederkehrenden Leasingerlösen und Restwert-Geschäft (Refurbishment/Resale der Rückläufer).
        </div>
      </div>
      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 14 }}>
        <Tile label="Aktive Verträge" value={d.aktiveVertraege.toLocaleString('de-DE')} sub={`Ø ${d.oRate} €/Monat · ${d.laufzeitMonate} Mon.`} color="#10b981" />
        <Tile label="Leasingerlöse p. a." value={eur(d.jahreserloes)} sub={`${eur(d.monatserloes)} / Monat`} color="#10b981" />
        <Tile label="Neugeschäft (12 Mon.)" value={`+${d.neugeschaeft12M}`} sub="neue Verträge" />
        <Tile label="Portfolio-Restwert" value={teur(d.portfolioRestwert)} sub={`Refurb.-Marge ${d.ruecklaeuferMarge} %`} />
        <Tile label="Ausfallquote" value={`${d.ausfallquote} %`} sub={`${d.ausfallVertraege} Verträge`} color={d.ausfallquote > 2 ? '#ef4444' : 'var(--amp-g)'} />
      </div>
      <div style={{ ...card, padding: 16 }}>
        <div style={{ ...cap, marginBottom: 8 }}>Portfolio nach Arbeitgeber-Segment</div>
        <div style={{ display: 'grid', gap: 7 }}>
          {d.segmente.map((s) => (
            <div key={s.name} style={{ display: 'grid', gridTemplateColumns: '160px 1fr 46px', alignItems: 'center', gap: 8 }}>
              <span style={{ fontSize: 12.5, fontWeight: 600 }}>{s.name}</span>
              <div style={{ background: 'var(--bg)', borderRadius: 4, height: 16, border: '1px solid var(--line)', overflow: 'hidden' }}>
                <div style={{ width: `${s.anteil / maxSeg * 100}%`, height: '100%', background: '#10b981' }} />
              </div>
              <span className="mono" style={{ fontSize: 12, textAlign: 'right' }}>{s.anteil} %</span>
            </div>
          ))}
        </div>
      </div>
    </>
  )
}

const VIEWS = [
  { id: 'gebuehren', name: 'Leasinggebühren (Nehmer)' },
  { id: 'vergleich', name: 'Leasing vs. Kauf' },
  { id: 'ifrs', name: 'IFRS 16' },
  { id: 'dienstrad', name: 'Dienstrad-Leasing (Geber)' }
]

export default function Leasing() {
  const [view, setView] = useState('gebuehren')
  return (
    <div style={{ maxWidth: 1080, margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', gap: 12, flexWrap: 'wrap', marginBottom: 12 }}>
        <div>
          <div style={cap}>Leasing-Controlling</div>
          <h2 style={{ margin: '4px 0 0' }}>Leasing-Cockpit</h2>
        </div>
        <button className="no-print" onClick={() => window.print()} style={{ padding: '7px 13px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--line)', background: 'var(--panel)', cursor: 'pointer', fontSize: 13, fontWeight: 600 }}>🖨 Drucken / PDF</button>
      </div>
      <div style={{ display: 'flex', gap: 8, marginBottom: 14, flexWrap: 'wrap' }}>
        {VIEWS.map((v) => <button key={v.id} style={chip(view === v.id)} onClick={() => setView(v.id)}>{v.name}</button>)}
      </div>
      {view === 'gebuehren' && <Gebuehren />}
      {view === 'vergleich' && <Vergleich />}
      {view === 'ifrs' && <Ifrs />}
      {view === 'dienstrad' && <Dienstrad />}
      <div style={{ fontSize: 11, color: 'var(--muted)', textAlign: 'center', padding: '14px 0 20px' }}>Demo-Daten (Mock) · Stichtag {HEUTE}.</div>
    </div>
  )
}
