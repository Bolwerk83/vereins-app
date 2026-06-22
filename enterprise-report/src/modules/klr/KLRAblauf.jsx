// =========================================================================
//  KLR-ABLAUF / INHALTSVERZEICHNIS — der rote Faden durch die Kosten- und
//  Leistungsrechnung mit Live-Werten und Sprung in jeden Baustein.
//
//   Aufwand→Kosten ▸ Kostenarten ▸ (Kalkulatorik) ▸ Kostenstellen/BAB ▸
//   Einzel/Gemein ▸ Kostenträger/Kalkulation ▸ Ergebnisrechnung
// =========================================================================
import React from 'react'
import { strukturKennzahlen } from '../../core/kostenarten.js'
import { gesamt as kalkGesamt } from '../../core/kalkulatorik.js'
import { bab } from '../../core/babVoll.js'
import { kalkulation as ekKalkulation } from '../../core/einzelGemein.js'
import { zuschlagKalkulation } from '../../core/kalkulation.js'
import { ergebnis } from '../../core/ergebnis.js'

const card = { background: 'var(--panel)', border: '1px solid var(--line)', borderRadius: 'var(--radius)', boxShadow: 'var(--shadow)' }
const mio = (v) => v.toLocaleString('de-DE', { minimumFractionDigits: 1, maximumFractionDigits: 1 }) + ' Mio €'

export default function KLRAblauf({ onGeh }) {
  const ka = strukturKennzahlen()
  const kalk = kalkGesamt()
  const b = bab('ist')
  const ek = ekKalkulation()
  const kt = zuschlagKalkulation('ist')
  const erg = ergebnis('ist')
  const ktErgebnis = kt.reduce((n, p) => n + p.ergebnis * (p.menge / 1000) / 1000, 0) // grob, nur Hinweis

  const stationen = [
    { nr: 0, icon: '⚖️', titel: 'Aufwand → Kosten (Abgrenzung)', laie: 'Welcher GuV-Aufwand ist „Kosten"? Neutrale Posten raus, kalkulatorische rein.', werte: [['Kalkulatorisch', mio(kalk.summe)]], ziel: 'klr' },
    { nr: 1, icon: '📋', titel: 'Kostenartenrechnung', laie: 'Welche Kosten entstehen? Nach Art, Funktion, fix/variabel.', werte: [['Gesamtkosten', mio(ka.gesamt)], ['Fixquote', ka.fixquote + ' %']], ziel: 'kostenarten' },
    { nr: 2, icon: '🏢', titel: 'Kostenstellenrechnung / BAB', laie: 'Wo entstehen die Kosten? Umlage und Zuschlagssätze.', werte: [['Zuschlag Fertigung', b.zuschlag.fertigung + ' %'], ['Zuschlag Material', b.zuschlag.material + ' %']], ziel: 'bab' },
    { nr: 3, icon: '➗', titel: 'Einzel- & Gemeinkosten', laie: 'Direkt zurechenbar oder über Schlüssel? Basis der Kalkulation.', werte: [['Herstellkosten', mio(ek.hk)], ['Selbstkosten', mio(ek.selbst)]], ziel: 'einzelgemein' },
    { nr: 4, icon: '🎯', titel: 'Kostenträgerrechnung / Kalkulation', laie: 'Wofür? Selbstkosten je Produkt und Produktergebnis.', werte: [['Produkte kalkuliert', String(kt.length)], ['Ø Marge', Math.round(kt.reduce((n, p) => n + p.marge, 0) / kt.length) + ' %']], ziel: 'kalkulation' },
    { nr: 5, icon: '📕', titel: 'Ergebnisrechnung', laie: 'Leistung − Kosten = Betriebsergebnis (Staffel & T-Konto).', werte: [['Betriebsergebnis', mio(erg.betriebsergebnis)]], ziel: 'ergebnis' }
  ]

  return (
    <div style={{ maxWidth: '100%', margin: '0 auto' }}>
      <div style={{ marginBottom: 16 }}>
        <h2 style={{ margin: '0 0 4px' }}>KLR-Ablauf — der rote Faden</h2>
        <div style={{ color: 'var(--muted)', fontSize: 13, maxWidth: 720 }}>
          Von den Kosten bis zum Ergebnis — jede Station mit aktuellem Wert und direktem Sprung. Gleichzeitig dein
          Inhaltsverzeichnis durch die Kosten- und Leistungsrechnung.
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
        {stationen.map((s, i) => (
          <React.Fragment key={s.nr}>
            <div style={{ ...card, padding: 16, display: 'flex', gap: 14, alignItems: 'center' }}>
              <div style={{ width: 44, height: 44, borderRadius: '50%', background: 'var(--accent-soft)', color: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, flex: 'none' }}>{s.icon}</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 700, fontSize: 15.5 }}>{s.nr > 0 ? `${s.nr}. ` : ''}{s.titel}</div>
                <div style={{ fontSize: 12.5, color: 'var(--slate)', marginTop: 2 }}>{s.laie}</div>
                <div style={{ display: 'flex', gap: 16, marginTop: 8, flexWrap: 'wrap' }}>
                  {s.werte.map(([label, wert]) => (
                    <div key={label}>
                      <div style={{ fontSize: 10.5, color: 'var(--muted)', textTransform: 'uppercase' }}>{label}</div>
                      <div className="mono" style={{ fontSize: 16, fontWeight: 700 }}>{wert}</div>
                    </div>
                  ))}
                </div>
              </div>
              <button onClick={() => onGeh?.(s.ziel)} style={{ alignSelf: 'center', whiteSpace: 'nowrap', padding: '8px 14px', border: 'none', borderRadius: 'var(--radius-sm)', background: 'var(--accent)', color: '#fff', fontWeight: 600, cursor: 'pointer' }}>Öffnen →</button>
            </div>
            {i < stationen.length - 1 && <div style={{ textAlign: 'center', color: 'var(--line)', fontSize: 20, lineHeight: '14px', padding: '2px 0' }}>↓</div>}
          </React.Fragment>
        ))}
      </div>
    </div>
  )
}
