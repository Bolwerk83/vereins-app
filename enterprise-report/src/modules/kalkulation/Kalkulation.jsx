// =========================================================================
//  KOSTENTRÄGERRECHNUNG / KALKULATION — Verfahrensübersicht + Zuschlag-,
//  Divisions- und Äquivalenzziffernkalkulation, inkl. Produktergebnis.
// =========================================================================
import React, { useState } from 'react'
import { VERFAHREN, division, aequivalenz, SORTEN_STD, AEQUIVALENZ_GESAMTKOSTEN, zuschlagKalkulation, zuschlagSaetze, PRODUKTE_STD, MASCHINE_STD, maschinenKalkulation, KUPPEL_STD, kuppelVerteilung } from '../../core/kalkulation.js'

const card = { background: 'var(--panel)', border: '1px solid var(--line)', borderRadius: 'var(--radius)', boxShadow: 'var(--shadow)' }
const cap = { fontSize: 11, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '.03em', fontWeight: 700 }
const eur = (v) => v.toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' €'
const th = (al) => ({ textAlign: al, padding: '6px 9px', borderBottom: '1px solid var(--line)', fontSize: 10.5, color: 'var(--muted)', textTransform: 'uppercase' })
const td = (al, bold) => ({ textAlign: al, padding: '6px 9px', borderBottom: '1px solid var(--line)', fontWeight: bold ? 700 : 400 })

export default function Kalkulation({ onGeh }) {
  const [tab, setTab] = useState('uebersicht')
  const chip = (aktiv) => ({ padding: '6px 12px', borderRadius: 999, fontSize: 13, cursor: 'pointer', fontWeight: 600,
    border: `1px solid ${aktiv ? 'var(--accent)' : 'var(--line)'}`, background: aktiv ? 'var(--accent)' : 'var(--panel)', color: aktiv ? '#fff' : 'var(--ink)' })

  return (
    <div style={{ maxWidth: 1040, margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12, flexWrap: 'wrap', marginBottom: 14 }}>
        <div>
          <h2 style={{ margin: '0 0 4px' }}>Kostenträgerrechnung &amp; Kalkulation</h2>
          <div style={{ color: 'var(--muted)', fontSize: 13, maxWidth: 740 }}>
            „Wofür entstehen die Kosten?" — Selbstkosten je Produkt und das Produktergebnis. Mehrere Verfahren je nach
            Fertigungstyp.
          </div>
        </div>
        {onGeh && <button onClick={() => onGeh('bab')} style={{ ...card, padding: '7px 12px', cursor: 'pointer', fontSize: 13, fontWeight: 600 }}>← BAB / Zuschlagssätze</button>}
      </div>

      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 14 }}>
        {[['uebersicht', 'Übersicht'], ['zuschlag', 'Zuschlagskalkulation'], ['division', 'Divisionskalkulation'], ['aequivalenz', 'Äquivalenzziffern'], ['maschine', 'Maschinenstundensatz'], ['kuppel', 'Kuppelkalkulation']].map(([id, n]) => (
          <button key={id} style={chip(tab === id)} onClick={() => setTab(id)}>{n}</button>
        ))}
      </div>

      {tab === 'uebersicht' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 12 }}>
          {VERFAHREN.map((v) => (
            <div key={v.id} style={{ ...card, padding: 14 }}>
              <div style={{ fontWeight: 700, fontSize: 14.5 }}>{v.name}</div>
              <div style={{ fontSize: 12.5, color: 'var(--slate)', margin: '4px 0 8px' }}>{v.laie}</div>
              <div style={cap}>Eignung</div>
              <div style={{ fontSize: 12.5 }}>{v.eignung}</div>
            </div>
          ))}
        </div>
      )}

      {tab === 'zuschlag' && <Zuschlag />}
      {tab === 'division' && <Division />}
      {tab === 'aequivalenz' && <Aequivalenz />}
      {tab === 'maschine' && <Maschine />}
      {tab === 'kuppel' && <Kuppel />}
    </div>
  )
}

function Maschine() {
  const [fgk, setFgk] = useState(MASCHINE_STD.fgkMio)
  const [stunden, setStunden] = useState(MASCHINE_STD.stunden)
  const k = maschinenKalkulation(fgk, stunden)
  const inp = { width: 130, padding: '7px 9px', border: '1px solid var(--line)', borderRadius: 'var(--radius-sm)', font: 'inherit', marginTop: 3 }
  return (
    <div style={{ ...card, padding: 16 }}>
      <div style={{ ...cap, marginBottom: 8 }}>Maschinenstundensatzrechnung</div>
      <div style={{ display: 'flex', gap: 14, alignItems: 'flex-end', flexWrap: 'wrap', marginBottom: 12 }}>
        <label style={{ fontSize: 11, color: 'var(--muted)' }}>Maschinen-FGK (Mio €)<br /><input type="number" step="0.1" style={inp} value={fgk} onChange={(e) => setFgk(Number(e.target.value) || 0)} /></label>
        <label style={{ fontSize: 11, color: 'var(--muted)' }}>Maschinenstunden / Jahr<br /><input type="number" style={inp} value={stunden} onChange={(e) => setStunden(Number(e.target.value) || 0)} /></label>
        <div style={{ marginLeft: 'auto', textAlign: 'right' }}>
          <div style={cap}>Maschinenstundensatz</div>
          <div style={{ fontSize: 24, fontWeight: 700 }}>{eur(k.satz)}/h</div>
        </div>
      </div>
      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
        <thead><tr>{['Produkt', 'Maschinenzeit', 'Maschinenkosten/Stück'].map((h, i) => <th key={i} style={th(i === 0 ? 'left' : 'right')}>{h}</th>)}</tr></thead>
        <tbody>
          {k.rows.map((p) => (
            <tr key={p.id}><td style={td('left', true)}>{p.name}</td>
              <td className="mono" style={td('right')}>{p.zeit} h</td>
              <td className="mono" style={td('right', true)}>{eur(p.maschinenkosten)}</td></tr>
          ))}
        </tbody>
      </table>
      <div style={{ fontSize: 12, color: 'var(--muted)', marginTop: 8 }}>Satz = maschinenabhängige Fertigungsgemeinkosten ÷ Maschinenstunden. Maschinenkosten/Stück = Maschinenzeit × Satz — genauer als ein reiner Lohnzuschlag bei maschinenintensiver Fertigung.</div>
    </div>
  )
}

function Kuppel() {
  const [gk, setGk] = useState(KUPPEL_STD.gesamtkosten)
  const k = kuppelVerteilung(gk)
  return (
    <div style={{ ...card, padding: 16, overflowX: 'auto' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap', marginBottom: 10 }}>
        <div style={cap}>Kuppelkalkulation (Marktwert-/Verteilungsmethode)</div>
        <label style={{ fontSize: 11, color: 'var(--muted)', marginLeft: 'auto' }}>Gesamtkosten (€): <input type="number" style={{ width: 110, padding: '4px 6px', border: '1px solid var(--line)', borderRadius: 'var(--radius-sm)', font: 'inherit' }} value={gk} onChange={(e) => setGk(Number(e.target.value) || 0)} /></label>
      </div>
      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13, minWidth: 620 }}>
        <thead><tr>{['Kuppelprodukt', 'Menge', 'Preis', 'Marktwert', 'Anteil', 'Kostenanteil', 'Stückkosten'].map((h, i) => <th key={i} style={th(i === 0 ? 'left' : 'right')}>{h}</th>)}</tr></thead>
        <tbody>
          {k.rows.map((p) => (
            <tr key={p.id}>
              <td style={td('left', true)}>{p.name}</td>
              <td className="mono" style={td('right')}>{p.menge.toLocaleString('de-DE')}</td>
              <td className="mono" style={td('right')}>{eur(p.preis)}</td>
              <td className="mono" style={td('right')}>{p.marktwert.toLocaleString('de-DE')} €</td>
              <td className="mono" style={td('right')}>{p.anteil} %</td>
              <td className="mono" style={td('right', true)}>{p.kostenanteil.toLocaleString('de-DE')} €</td>
              <td className="mono" style={td('right')}>{eur(p.stueckkosten)}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <div style={{ fontSize: 12, color: 'var(--muted)', marginTop: 8 }}>Die Gesamtkosten der Kuppelproduktion werden nach dem Marktwert (Menge × Preis) auf die zwangsweise zusammen entstehenden Produkte verteilt.</div>
    </div>
  )
}

function Zuschlag() {
  const z = zuschlagSaetze('ist')
  const rows = zuschlagKalkulation('ist')
  return (
    <div style={{ ...card, padding: 16, overflowX: 'auto' }}>
      <div style={{ ...cap, marginBottom: 6 }}>Zuschlagskalkulation je Stück — Selbstkosten &amp; Ergebnis</div>
      <div style={{ fontSize: 12, color: 'var(--muted)', marginBottom: 10 }}>
        Zuschlagssätze aus dem BAB: Material {z.material} % · Fertigung {z.fertigung} % · Verwaltung {z.verwaltung} % · Vertrieb {z.vertrieb} %.
      </div>
      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12.5, minWidth: 720 }}>
        <thead><tr>
          {['Produkt', 'Fert.-Material', '+MGK', 'Fert.-Lohn', '+FGK', '=Herstellk.', '+VwGK', '+VtGK', '=Selbstk.', 'Preis', 'Ergebnis', 'Marge'].map((h, i) => (
            <th key={i} style={th(i === 0 ? 'left' : 'right')}>{h}</th>
          ))}
        </tr></thead>
        <tbody>
          {rows.map((p) => (
            <tr key={p.id}>
              <td style={td('left', true)}>{p.name}</td>
              <td className="mono" style={td('right')}>{eur(p.fm)}</td>
              <td className="mono" style={{ ...td('right'), color: 'var(--muted)' }}>{eur(p.mgk)}</td>
              <td className="mono" style={td('right')}>{eur(p.fl)}</td>
              <td className="mono" style={{ ...td('right'), color: 'var(--muted)' }}>{eur(p.fgk)}</td>
              <td className="mono" style={td('right', true)}>{eur(p.hk)}</td>
              <td className="mono" style={{ ...td('right'), color: 'var(--muted)' }}>{eur(p.vwgk)}</td>
              <td className="mono" style={{ ...td('right'), color: 'var(--muted)' }}>{eur(p.vtgk)}</td>
              <td className="mono" style={td('right', true)}>{eur(p.selbstkosten)}</td>
              <td className="mono" style={td('right')}>{eur(p.preis)}</td>
              <td className="mono" style={{ ...td('right', true), color: p.ergebnis >= 0 ? 'var(--amp-g)' : 'var(--amp-r)' }}>{eur(p.ergebnis)}</td>
              <td className="mono" style={{ ...td('right'), color: p.marge >= 0 ? 'var(--amp-g)' : 'var(--amp-r)' }}>{p.marge} %</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

function Division() {
  const [gk, setGk] = useState(480000)
  const [menge, setMenge] = useState(12000)
  const inp = { width: 140, padding: '7px 9px', border: '1px solid var(--line)', borderRadius: 'var(--radius-sm)', font: 'inherit', marginTop: 3 }
  return (
    <div style={{ ...card, padding: 16 }}>
      <div style={{ ...cap, marginBottom: 8 }}>Divisionskalkulation (einstufig)</div>
      <div style={{ display: 'flex', gap: 14, alignItems: 'flex-end', flexWrap: 'wrap' }}>
        <label style={{ fontSize: 11, color: 'var(--muted)' }}>Gesamtkosten (€)<br /><input type="number" style={inp} value={gk} onChange={(e) => setGk(Number(e.target.value) || 0)} /></label>
        <label style={{ fontSize: 11, color: 'var(--muted)' }}>Menge (Stück)<br /><input type="number" style={inp} value={menge} onChange={(e) => setMenge(Number(e.target.value) || 0)} /></label>
        <div style={{ marginLeft: 'auto', textAlign: 'right' }}>
          <div style={cap}>Stückkosten</div>
          <div style={{ fontSize: 26, fontWeight: 700 }}>{eur(division(gk, menge))}</div>
        </div>
      </div>
      <div style={{ fontSize: 12, color: 'var(--muted)', marginTop: 10 }}>Stückkosten = Gesamtkosten ÷ Menge. Für gleichartige Massenprodukte; bei mehreren Stufen je Stufe rechnen und addieren.</div>
    </div>
  )
}

function Aequivalenz() {
  const [gk, setGk] = useState(AEQUIVALENZ_GESAMTKOSTEN)
  const [sorten, setSorten] = useState(SORTEN_STD)
  const erg = aequivalenz(sorten, gk)
  const setVal = (id, feld, val) => setSorten((s) => s.map((x) => x.id === id ? { ...x, [feld]: Number(val) || 0 } : x))
  const inpS = { width: 80, padding: '4px 6px', border: '1px solid var(--line)', borderRadius: 'var(--radius-sm)', font: 'inherit', fontSize: 12.5 }
  return (
    <div style={{ ...card, padding: 16, overflowX: 'auto' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap', marginBottom: 10 }}>
        <div style={cap}>Äquivalenzziffernrechnung (Sortenfertigung)</div>
        <label style={{ fontSize: 11, color: 'var(--muted)', marginLeft: 'auto' }}>Gesamtkosten (€): <input type="number" style={{ ...inpS, width: 110 }} value={gk} onChange={(e) => setGk(Number(e.target.value) || 0)} /></label>
      </div>
      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13, minWidth: 600 }}>
        <thead><tr>{['Sorte', 'Äquivalenzziffer', 'Menge', 'Recheneinheiten', 'Stückkosten', 'Gesamtkosten'].map((h, i) => (
          <th key={i} style={th(i === 0 ? 'left' : 'right')}>{h}</th>
        ))}</tr></thead>
        <tbody>
          {erg.rows.map((r) => (
            <tr key={r.id}>
              <td style={td('left', true)}>{r.name}</td>
              <td style={td('right')}><input type="number" step="0.1" style={inpS} value={r.aequivalenz} onChange={(e) => setVal(r.id, 'aequivalenz', e.target.value)} /></td>
              <td style={td('right')}><input type="number" style={inpS} value={r.menge} onChange={(e) => setVal(r.id, 'menge', e.target.value)} /></td>
              <td className="mono" style={td('right')}>{r.re.toLocaleString('de-DE')}</td>
              <td className="mono" style={td('right', true)}>{eur(r.stueckkosten)}</td>
              <td className="mono" style={td('right')}>{r.gesamt.toLocaleString('de-DE')} €</td>
            </tr>
          ))}
          <tr style={{ background: 'var(--bg)' }}>
            <td style={td('left', true)}>Summe</td><td /><td />
            <td className="mono" style={td('right', true)}>{erg.summeRE.toLocaleString('de-DE')}</td>
            <td className="mono" style={td('right')}>÷ → {eur(erg.kostenJeRE)}/RE</td>
            <td className="mono" style={td('right', true)}>{erg.gesamtkosten.toLocaleString('de-DE')} €</td>
          </tr>
        </tbody>
      </table>
      <div style={{ fontSize: 12, color: 'var(--muted)', marginTop: 8 }}>Recheneinheiten = Äquivalenzziffer × Menge. Kosten je RE = Gesamtkosten ÷ Σ RE. Stückkosten = Kosten je RE × Äquivalenzziffer.</div>
    </div>
  )
}
