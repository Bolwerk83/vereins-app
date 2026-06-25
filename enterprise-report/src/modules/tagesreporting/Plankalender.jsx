// =========================================================================
//  PLANKALENDER-Viewer — Monats-Planwert taggenau über einen kategorie-
//  spezifischen Kalender (Fixkosten/Filiale/Onlineshop/Werktage) verteilen.
//  Feiertage = 0, kurze Tage = 0,5. Plus Monatshochrechnung aus Tagesfortschritt.
// =========================================================================
import React, { useState } from 'react'
import { KALENDER, MONATSNAME, WOCHENTAGE, verteilePlan, monatsHochrechnung } from '../../core/plankalender.js'

const card = { background: 'var(--panel)', border: '1px solid var(--line)', borderRadius: 'var(--radius)', boxShadow: 'var(--shadow)' }
const cap = { fontSize: 11, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '.04em', fontWeight: 700 }
const eur = (v) => Math.round(v).toLocaleString('de-DE') + ' €'
const eurK = (v) => (Math.abs(v) >= 10000 ? Math.round(v / 1000).toLocaleString('de-DE') + 'k' : Math.round(v).toLocaleString('de-DE'))

export default function Plankalender() {
  const [kalId, setKalId] = useState('fixkosten')
  const [monat, setMonat] = useState(9) // Oktober (Stichtagsmonat)
  const [plan, setPlan] = useState(600000)
  const kal = KALENDER.find((k) => k.id === kalId)
  const v = verteilePlan(kalId, monat, Number(plan) || 0)
  // Beispiel-Hochrechnung: angenommen wir sind am 15. mit anteiligem Ist (95 % vom Plan-Soll bis dahin)
  const bisTag = 15
  const planBis = v.tage.filter((t) => t.tag <= bisTag).reduce((s, t) => s + t.plan, 0)
  const hr = monatsHochrechnung(kalId, monat, bisTag, planBis * 0.95)

  const erster = v.tage[0]?.dow ?? 1
  const offset = (erster + 6) % 7 // Montag-first

  const tagFarbe = (t) => t.gewicht === 0 ? { bg: 'var(--bg)', fg: 'var(--muted)' } : t.gewicht < 1 ? { bg: '#fef3c7', fg: '#92400e' } : { bg: 'var(--panel)', fg: 'var(--ink)' }

  return (
    <div style={{ display: 'grid', gap: 14 }}>
      <div style={{ ...card, padding: 14 }}>
        <div style={{ fontSize: 13, color: 'var(--slate)', marginBottom: 10, maxWidth: 820 }}>
          Unterschiedliche <b>Plankalender</b> je Kategorie verteilen den Monatsplan <b>taggenau</b>: volle Tage = 1, kurze Tage = 0,5,
          Feiertage/Schließtage = 0. So lässt sich später taggenau Ist gegen Plan stellen und der Monat aus dem Tagesfortschritt hochrechnen.
        </div>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
          {KALENDER.map((k) => (
            <button key={k.id} onClick={() => setKalId(k.id)} title={k.beschreibung}
              style={{ padding: '5px 11px', borderRadius: 999, fontSize: 12.5, fontWeight: 600, cursor: 'pointer', border: `1px solid ${kalId === k.id ? 'var(--accent)' : 'var(--line)'}`, background: kalId === k.id ? 'var(--accent)' : 'var(--panel)', color: kalId === k.id ? '#fff' : 'var(--ink)' }}>{k.name}</button>
          ))}
          <span style={{ flex: 1 }} />
          <select value={monat} onChange={(e) => setMonat(Number(e.target.value))} style={{ padding: '6px 8px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--line)', font: 'inherit', fontSize: 13, background: 'var(--panel)', color: 'var(--ink)' }}>
            {MONATSNAME.map((n, i) => <option key={i} value={i}>{n} 2026</option>)}
          </select>
          <label style={{ fontSize: 12.5, color: 'var(--muted)', display: 'flex', alignItems: 'center', gap: 6 }}>Monatsplan
            <input type="number" value={plan} onChange={(e) => setPlan(Number(e.target.value) || 0)} step="10000" style={{ width: 110, padding: '6px 8px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--line)', font: 'inherit', fontSize: 13 }} /> €
          </label>
        </div>
        <div style={{ fontSize: 11.5, color: 'var(--muted)', marginTop: 8 }}>{kal.beschreibung}</div>
      </div>

      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
        {[['Σ Gewichte', v.summeGewicht], ['Plan je Gewicht (voller Tag)', eur(v.planJeGewicht)], ['Volle / halbe / zu', `${v.volleTage} / ${v.halbeTage} / ${v.geschlossen}`], ['Monatsplan', eur(v.monatsPlan)]].map(([l, val]) => (
          <div key={l} style={{ ...card, padding: '12px 14px', flex: 1, minWidth: 150, borderTop: '3px solid var(--accent)' }}>
            <div style={{ ...cap, marginBottom: 3 }}>{l}</div>
            <div className="mono" style={{ fontSize: 17, fontWeight: 800 }}>{val}</div>
          </div>
        ))}
      </div>

      {/* Kalenderraster */}
      <div style={{ ...card, padding: 14 }}>
        <div style={{ ...cap, marginBottom: 8 }}>{MONATSNAME[monat]} 2026 — Tagesplan (Gewicht · €)</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 5 }}>
          {['Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa', 'So'].map((w) => <div key={w} style={{ textAlign: 'center', fontSize: 10.5, fontWeight: 700, color: 'var(--muted)' }}>{w}</div>)}
          {Array.from({ length: offset }).map((_, i) => <div key={'o' + i} />)}
          {v.tage.map((t) => {
            const c = tagFarbe(t)
            return (
              <div key={t.tag} title={t.feiertag ? t.feiertagName : t.kurz ? 'kurzer Tag (0,5)' : ''}
                style={{ background: c.bg, color: c.fg, border: '1px solid var(--line)', borderRadius: 8, padding: '5px 6px', minHeight: 52, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11 }}>
                  <span style={{ fontWeight: 700 }}>{t.tag}</span>
                  <span className="mono" style={{ fontSize: 9.5, fontWeight: 700, color: t.gewicht === 0 ? 'var(--muted)' : t.gewicht < 1 ? '#92400e' : 'var(--accent)' }}>{t.gewicht}</span>
                </div>
                <div className="mono" style={{ fontSize: 11, fontWeight: 700, textAlign: 'right' }}>{t.gewicht ? eurK(t.plan) : (t.feiertag ? '🎉' : '–')}</div>
              </div>
            )
          })}
        </div>
        <div style={{ display: 'flex', gap: 14, marginTop: 10, fontSize: 11, color: 'var(--muted)', flexWrap: 'wrap' }}>
          <span><span style={{ display: 'inline-block', width: 10, height: 10, background: 'var(--panel)', border: '1px solid var(--line)', borderRadius: 2, marginRight: 4 }} />voller Tag (1)</span>
          <span><span style={{ display: 'inline-block', width: 10, height: 10, background: '#fef3c7', border: '1px solid var(--line)', borderRadius: 2, marginRight: 4 }} />kurzer Tag (0,5)</span>
          <span><span style={{ display: 'inline-block', width: 10, height: 10, background: 'var(--bg)', border: '1px solid var(--line)', borderRadius: 2, marginRight: 4 }} />geschlossen (0)</span>
        </div>
      </div>

      {/* Monatshochrechnung */}
      <div style={{ ...card, padding: 14 }}>
        <div style={{ ...cap, marginBottom: 6 }}>Monatshochrechnung aus Tagesfortschritt (Beispiel: Stand 15., Ist = 95 % des Plan-Solls)</div>
        <div style={{ fontSize: 13, color: 'var(--slate)' }}>
          Plan-Fortschritt bis 15.: <b>{hr.fortschrittPct} %</b> der Monatsgewichte · Ist bis dahin <b className="mono">{eur(planBis * 0.95)}</b> →
          Hochrechnung Monat <b className="mono" style={{ color: 'var(--accent)' }}>{eur(hr.hochrechnung)}</b> (Plan {eur(v.monatsPlan)}).
        </div>
        <div style={{ fontSize: 11.5, color: 'var(--muted)', marginTop: 6 }}>
          Formel: Ist-bis-Tag ÷ (Σ Gewicht bis Tag) × Σ Gewicht gesamt. Im Tagesreporting wird daraus das echte Tages-Ist eingespeist.
        </div>
      </div>
    </div>
  )
}
