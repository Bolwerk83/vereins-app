// =========================================================================
//  FINANZ- & RISIKO-COCKPIT — Bilanz / Liquidität / Rentabilität / Risiko,
//  je Kennzahl mit Wert, Ampel, Zielband, Formel, Standard-Bezug und Deutung.
//  Standards: HGB-Bilanzanalyse, IFRS-KPIs, Working-Capital-Mgmt, Risiko-
//  Frühaufklärung (KonTraG). Druck-/PDF-fähig.
// =========================================================================
import React, { useState } from 'react'
import {
  GRUPPEN, kennzahlenGruppe, ampelKennzahl, risikoBild, TAGE, basis
} from '../../core/finanzkennzahlen.js'
import { pcFaktor } from '../../core/statistikFilter.js'
import PcFilter, { ladePc, speicherePc, pcHinweis } from '../shared/PcFilter.jsx'

const card = { background: 'var(--panel)', border: '1px solid var(--line)', borderRadius: 'var(--radius)', boxShadow: 'var(--shadow)' }
const cap = { fontSize: 11, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '.04em', fontWeight: 700 }
const AMP = { g: 'var(--amp-g)', a: 'var(--amp-a)', r: 'var(--amp-r)' }
const KEY = 'er_finanzcockpit'
const fmt = (w, e) => (e === '%' ? w.toLocaleString('de-DE', { minimumFractionDigits: 1, maximumFractionDigits: 1 }) + ' %'
  : e === '×' ? w.toLocaleString('de-DE', { minimumFractionDigits: 1, maximumFractionDigits: 1 }) + '×'
  : e === 'Tage' ? Math.round(w) + ' Tage'
  : w.toLocaleString('de-DE', { minimumFractionDigits: 1, maximumFractionDigits: 1 }) + ' Mio €')

function KennzahlKarte({ k }) {
  const st = ampelKennzahl(k)
  const zielTxt = k.richtung === 'tief' ? `Ziel ≤ ${k.ziel.gut}` : `Ziel ≥ ${k.ziel.gut}`
  return (
    <div style={{ ...card, padding: 13, borderLeft: `3px solid ${AMP[st]}` }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8 }}>
        <span style={{ fontSize: 13, fontWeight: 700 }}>{k.name}</span>
        <span style={{ fontSize: 10, fontWeight: 700, color: 'var(--muted)', border: '1px solid var(--line)', borderRadius: 999, padding: '1px 7px', whiteSpace: 'nowrap' }}>{k.standard}</span>
      </div>
      <div className="mono" style={{ fontSize: 24, fontWeight: 700, color: AMP[st], marginTop: 4 }}>{fmt(k.wert, k.einheit)}</div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 11, color: 'var(--muted)', marginTop: 2 }}>
        <span>{zielTxt} {k.einheit === 'Mio €' ? 'Mio €' : k.einheit === 'Tage' ? 'Tage' : k.einheit}</span>
        <span className="mono" title="Formel">{k.formel}</span>
      </div>
      <div style={{ fontSize: 11.5, color: 'var(--slate)', marginTop: 6, lineHeight: 1.4 }}>{k.deutung}</div>
    </div>
  )
}

// Aktiva/Passiva als gestapelter Balken (summiert je auf Bilanzsumme).
function StrukturBalken({ titel, posten }) {
  const sum = posten.reduce((n, p) => n + p.wert, 0)
  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
        <span style={{ ...cap }}>{titel}</span>
        <span className="mono" style={{ fontSize: 11, color: 'var(--muted)' }}>{sum.toLocaleString('de-DE', { minimumFractionDigits: 1, maximumFractionDigits: 1 })} Mio €</span>
      </div>
      <div style={{ display: 'flex', height: 26, borderRadius: 6, overflow: 'hidden', border: '1px solid var(--line)' }}>
        {posten.map((p) => (
          <div key={p.name} title={`${p.name}: ${p.wert} Mio € (${(p.wert / sum * 100).toFixed(0)} %)`}
            style={{ width: `${p.wert / sum * 100}%`, background: p.farbe, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <span style={{ fontSize: 9.5, color: '#fff', fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden' }}>{p.wert / sum > 0.12 ? p.kurz : ''}</span>
          </div>
        ))}
      </div>
      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginTop: 6 }}>
        {posten.map((p) => (
          <span key={p.name} style={{ fontSize: 10.5, display: 'inline-flex', alignItems: 'center', gap: 4, color: 'var(--muted)' }}>
            <span style={{ width: 9, height: 9, borderRadius: 2, background: p.farbe }} />{p.name} {(p.wert / sum * 100).toFixed(0)} %
          </span>
        ))}
      </div>
    </div>
  )
}

export default function FinanzCockpit() {
  const [note, setNote] = useState(() => { try { return localStorage.getItem(KEY) || '' } catch { return '' } })
  const [pc, setPc] = useState(() => ladePc('finanzcockpit'))
  const aenderePc = (v) => { setPc(v); speicherePc('finanzcockpit', v) }
  const fk = pcFaktor(pc)
  const { BILANZ, GUV } = basis(fk)
  const rb = risikoBild(fk)
  const aktiva = [
    { name: 'Anlagevermögen', kurz: 'AV', wert: BILANZ.anlagevermoegen, farbe: '#1e3a8a' },
    { name: 'Vorräte', kurz: 'Vorräte', wert: BILANZ.vorraete, farbe: '#2563eb' },
    { name: 'Forderungen + sonst.', kurz: 'Ford.', wert: BILANZ.forderungen + BILANZ.sonstigesUV, farbe: '#60a5fa' },
    { name: 'Liquide Mittel', kurz: 'Liq.', wert: BILANZ.liquideMittel, farbe: '#93c5fd' }
  ]
  const passiva = [
    { name: 'Eigenkapital', kurz: 'EK', wert: BILANZ.eigenkapital, farbe: '#15803d' },
    { name: 'Langfr. Fremdkapital', kurz: 'langfr. FK', wert: BILANZ.langfristFK, farbe: '#f59e0b' },
    { name: 'Kurzfr. Fremdkapital', kurz: 'kurzfr. FK', wert: BILANZ.kurzfristFK, farbe: '#ef4444' }
  ]
  const total = Math.max(1, rb.total)

  return (
    <div style={{ maxWidth: 1100, margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', gap: 12, flexWrap: 'wrap', marginBottom: 14 }}>
        <div>
          <div style={cap}>Finanzcontrolling · Geschäftsjahr · HGB / IFRS</div>
          <h2 style={{ margin: '4px 0 0' }}>Finanz- &amp; Risiko-Cockpit{pcHinweis(pc)}</h2>
        </div>
        <button className="no-print" onClick={() => window.print()} style={{ padding: '7px 13px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--line)', background: 'var(--panel)', cursor: 'pointer', fontSize: 13, fontWeight: 600 }}>🖨 Drucken / PDF</button>
      </div>
      <PcFilter pc={pc} onChange={aenderePc} hinweis="Segmentsicht: skaliert die absolute Bilanz/GuV-Größe je Profit-Center. Strukturkennzahlen (Quoten/Renditen) sind größenunabhängig und bleiben gleich." />

      {/* Überblick: Risikobild + Bilanzstruktur */}
      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1fr) minmax(0,1.4fr)', gap: 14, marginBottom: 16 }}>
        <div style={{ ...card, padding: 16 }}>
          <div style={{ ...cap, marginBottom: 8 }}>Risikobild (alle Kennzahlen)</div>
          <div style={{ display: 'flex', height: 12, borderRadius: 6, overflow: 'hidden', border: '1px solid var(--line)', marginBottom: 8 }}>
            {['g', 'a', 'r'].map((s) => rb[s] ? <div key={s} style={{ width: `${rb[s] / total * 100}%`, background: AMP[s] }} /> : null)}
          </div>
          <div style={{ display: 'flex', gap: 14, fontSize: 13 }}>
            <span style={{ color: AMP.g, fontWeight: 700 }}>{rb.g} grün</span>
            <span style={{ color: AMP.a, fontWeight: 700 }}>{rb.a} gelb</span>
            <span style={{ color: AMP.r, fontWeight: 700 }}>{rb.r} rot</span>
            <span style={{ color: 'var(--muted)', marginLeft: 'auto' }}>{rb.total} Kennzahlen</span>
          </div>
          <div style={{ fontSize: 11.5, color: 'var(--slate)', marginTop: 10, lineHeight: 1.45 }}>
            Solide Eigenkapitalbasis, aber <b>angespannte Liquidität 2. Grades</b> und <b>hohe Kapitalbindung</b>
            (Cash Conversion Cycle {TAGE.ccc} Tage). Rentabilität unter Zielniveau.
          </div>
        </div>
        <div style={{ ...card, padding: 16, display: 'grid', gap: 14, alignContent: 'center' }}>
          <StrukturBalken titel="Aktiva (Mittelverwendung)" posten={aktiva} />
          <StrukturBalken titel="Passiva (Mittelherkunft)" posten={passiva} />
        </div>
      </div>

      {/* Kennzahlengruppen */}
      {GRUPPEN.map((g) => (
        <section key={g.id} style={{ marginBottom: 18 }}>
          <h3 style={{ margin: '0 0 10px', fontSize: 16 }}>{g.icon} {g.name}</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 12 }}>
            {kennzahlenGruppe(g.id, fk).map((k) => <KennzahlKarte key={k.name} k={k} />)}
          </div>
        </section>
      ))}

      {/* Standards-Hinweis + Bemerkung */}
      <div style={{ ...card, padding: 16, marginBottom: 16, borderLeft: '3px solid var(--accent)' }}>
        <div style={{ ...cap, marginBottom: 6 }}>Standards & Methodik</div>
        <div style={{ fontSize: 12.5, color: 'var(--slate)', lineHeight: 1.5 }}>
          Alle Kennzahlen sind aus <b>einer konsistenten Datenbasis</b> (Bilanz, GuV, Cashflow) abgeleitet und
          an gängigen Standards ausgerichtet: <b>HGB-Bilanzanalyse</b> (Kapital-/Vermögensstruktur, Liquiditätsgrade,
          goldene Bilanzregel), <b>IFRS</b>-Kennzahlen (EBIT/EBITDA-Marge, ROCE, Cashflow nach IAS 7) sowie
          <b> Working-Capital-Management</b> (DSO/DIO/DPO, Cash Conversion Cycle) und Risiko-Frühaufklärung
          (Zins-/Covenant-Kennzahlen i. S. d. KonTraG / § 91 AktG). Erweiterbar um DRS 20 (Lagebericht) und CSRD/ESRS.
        </div>
        <div style={{ marginTop: 12 }}>
          <div style={cap}>✍ Kommentar des Controllings</div>
          <textarea value={note} onChange={(e) => { setNote(e.target.value); try { localStorage.setItem(KEY, e.target.value) } catch {} }} rows={2}
            placeholder="Einordnung, Maßnahmen (z. B. Working Capital senken, Liquidität stärken) …"
            style={{ width: '100%', marginTop: 5, padding: '9px 11px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--line)', font: 'inherit', fontSize: 13, lineHeight: 1.5, resize: 'vertical', background: 'var(--bg)' }} />
        </div>
      </div>

      <div style={{ fontSize: 11, color: 'var(--muted)', textAlign: 'center', padding: '0 0 20px' }}>
        Basis: Bilanzsumme {BILANZ.summe.toLocaleString('de-DE')} Mio €, Umsatz {GUV.umsatz.toLocaleString('de-DE')} Mio €, EBIT {GUV.ebit.toLocaleString('de-DE')} Mio €, Jahresüberschuss {GUV.jahresueberschuss.toLocaleString('de-DE')} Mio € · Demo-Daten (Mock).
      </div>
    </div>
  )
}
