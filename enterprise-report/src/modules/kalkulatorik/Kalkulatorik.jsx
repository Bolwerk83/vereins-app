// =========================================================================
//  KALKULATORIK — kalkulatorische Kosten aufbauen, mit kollegialen
//  Vorschlägen aus den Unternehmenszahlen. Anders- und Zusatzkosten.
// =========================================================================
import React, { useState } from 'react'
import { BAUSTEINE, baustein, felderVon, setFelder, wertVon, gesamt,
  verfuegbareJahre, kopiereJahr, monatsVerteilung, VERTEILSCHLUESSEL, DEFAULT_JAHR } from '../../core/kalkulatorik.js'
import { ueberleitung } from '../../core/verbuchung.js'

const card = { background: 'var(--panel)', border: '1px solid var(--line)', borderRadius: 'var(--radius)', boxShadow: 'var(--shadow)' }
const cap = { fontSize: 11, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '.03em', fontWeight: 700 }
const mio = (v) => v.toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' Mio €'
const MON = ['Jan', 'Feb', 'Mär', 'Apr', 'Mai', 'Jun', 'Jul', 'Aug', 'Sep', 'Okt', 'Nov', 'Dez']

export default function Kalkulatorik({ werte = {}, onGeh }) {
  const [, setTick] = useState(0)
  const [hinweis, setHinweis] = useState({})   // id -> Vorschlagstext
  const [jahr, setJahr] = useState(DEFAULT_JAHR)
  const [schluessel, setSchluessel] = useState('gleich')
  const refresh = () => setTick((t) => t + 1)
  const g = gesamt(jahr)
  const jahre = verfuegbareJahre()
  const jahrAuswahl = [...new Set([...jahre, jahr, jahr + 1])].sort((a, b) => a - b)

  function aendere(id, key, val) {
    const f = { ...felderVon(id, jahr), [key]: val === '' ? 0 : Number(val) }
    setFelder(id, f, jahr); refresh()
  }
  function vorschlag(id) {
    const v = baustein(id).vorschlag(werte)
    setFelder(id, { ...felderVon(id, jahr), ...v.patch }, jahr)
    setHinweis((h) => ({ ...h, [id]: v.text })); refresh()
  }
  function vorjahrKopieren() {
    if (confirm(`Werte aus ${jahr - 1} in ${jahr} übernehmen (überschreibt ${jahr})?`)) { kopiereJahr(jahr, jahr - 1); refresh() }
  }

  const tag = (farbe) => ({ fontSize: 10.5, fontWeight: 700, color: farbe, border: `1px solid ${farbe}`, padding: '1px 7px', borderRadius: 999 })

  return (
    <div style={{ maxWidth: '100%', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12, flexWrap: 'wrap', marginBottom: 14 }}>
        <div>
          <h2 style={{ margin: '0 0 4px' }}>Kalkulatorische Kosten aufbauen</h2>
          <div style={{ color: 'var(--muted)', fontSize: 13, maxWidth: 740 }}>
            Anderskosten (anders bewertet) und Zusatzkosten (kein Aufwand gegenüber). Trag deine Werte ein — oder hol dir
            je Baustein einen <b>begründeten Vorschlag</b> aus den Unternehmenszahlen.
          </div>
        </div>
        {onGeh && <button onClick={() => onGeh('klr')} style={{ ...inpBtn, whiteSpace: 'nowrap' }}>← zur KLR</button>}
      </div>

      {/* Wirtschaftsjahr + Verteilung */}
      <div style={{ ...card, padding: 12, marginBottom: 14, display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center' }}>
        <label style={{ fontSize: 12, color: 'var(--muted)', display: 'flex', alignItems: 'center', gap: 6 }}>Wirtschaftsjahr
          <select value={jahr} onChange={(e) => setJahr(Number(e.target.value))} style={inpBtn}>
            {jahrAuswahl.map((j) => <option key={j} value={j}>{j}{jahre.includes(j) ? '' : ' (neu)'}</option>)}
          </select>
        </label>
        <button onClick={vorjahrKopieren} style={{ ...inpBtn, cursor: 'pointer' }} title={`Werte aus ${jahr - 1} übernehmen`}>⧉ Vorjahr ({jahr - 1}) kopieren</button>
        <span style={{ width: 1, height: 22, background: 'var(--line)' }} />
        <label style={{ fontSize: 12, color: 'var(--muted)', display: 'flex', alignItems: 'center', gap: 6 }}>Monatsverteilung
          <select value={schluessel} onChange={(e) => setSchluessel(e.target.value)} style={inpBtn}>
            {VERTEILSCHLUESSEL.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
          </select>
        </label>
        <span style={{ fontSize: 11.5, color: 'var(--muted)' }}>Jahreswerte werden je Monat verteilt (Default linear /12).</span>
      </div>

      {/* Summen */}
      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 14 }}>
        {kachel('Anderskosten', mio(g.anders))}
        {kachel('Zusatzkosten', mio(g.zusatz))}
        {kachel('Kalkulatorisch gesamt', mio(g.summe), `Jahr ${jahr} · fließt in Kostenarten/Abgrenzung`)}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(440px, 1fr))', gap: 14 }} className="raster-2">
        {BAUSTEINE.map((b) => {
          const f = felderVon(b.id, jahr)
          const mv = monatsVerteilung(b.id, jahr, schluessel)
          const mvMax = Math.max(...mv, 0.0001)
          return (
            <div key={b.id} style={{ ...card, padding: 16, display: 'flex', flexDirection: 'column', gap: 10 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                <span style={{ fontWeight: 700, fontSize: 15, flex: 1 }}>{b.name}</span>
                <span style={tag(b.typ === 'anders' ? 'var(--accent)' : '#7c3aed')}>{b.typ === 'anders' ? 'Anderskosten' : 'Zusatzkosten'}</span>
              </div>
              <div style={{ fontSize: 12.5, color: 'var(--slate)' }}>{b.laie}</div>

              <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'flex-end' }}>
                {b.felder.map((fe) => (
                  <label key={fe.key} style={{ fontSize: 11, color: 'var(--muted)' }}>{fe.label} <span style={{ opacity: .7 }}>({fe.einheit})</span><br />
                    <input type="number" value={f[fe.key]} onChange={(e) => aendere(b.id, fe.key, e.target.value)}
                      style={{ marginTop: 3, width: 130, padding: '6px 8px', border: '1px solid var(--line)', borderRadius: 'var(--radius-sm)', font: 'inherit', fontSize: 13 }} />
                  </label>
                ))}
                <div style={{ marginLeft: 'auto', textAlign: 'right' }}>
                  <div style={cap}>= Ergebnis {jahr}</div>
                  <div style={{ fontSize: 20, fontWeight: 700 }}>{mio(wertVon(b.id, jahr))}</div>
                </div>
              </div>

              {/* Monatsverteilung (Splash) */}
              <div>
                <div style={{ ...cap, marginBottom: 4 }}>Monatsverteilung</div>
                <div style={{ display: 'flex', alignItems: 'flex-end', gap: 3, height: 30 }}>
                  {mv.map((v, i) => (
                    <div key={i} title={`${MON[i]}: ${(v * 1000).toLocaleString('de-DE', { maximumFractionDigits: 0 })} Tsd €`}
                      style={{ flex: 1, height: `${Math.max(2, v / mvMax * 30)}px`, background: 'var(--accent)', opacity: 0.7, borderRadius: '2px 2px 0 0' }} />
                  ))}
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 9, color: 'var(--muted)', marginTop: 2 }}><span>{MON[0]}</span><span>{MON[11]}</span></div>
              </div>

              <div>
                <button onClick={() => vorschlag(b.id)} style={{ ...inpBtn, cursor: 'pointer', background: 'var(--accent-soft)', color: 'var(--accent)', borderColor: 'var(--accent)', fontWeight: 600 }}>💡 Vorschlag übernehmen</button>
                {hinweis[b.id] && <div style={{ marginTop: 8, fontSize: 12.5, padding: '8px 11px', background: 'var(--bg)', border: '1px solid var(--line)', borderRadius: 'var(--radius-sm)' }}>{hinweis[b.id]}</div>}
              </div>
            </div>
          )
        })}
      </div>

      {/* Verbuchung: Überleitung ins Betriebsergebnis */}
      {(() => {
        const u = ueberleitung('ist')
        const z = (label, wert, opt = {}) => (
          <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid var(--line)', fontWeight: opt.bold ? 700 : 400, color: opt.farbe || 'var(--ink)' }}>
            <span>{opt.prefix || ''}{label}</span><span className="mono">{mio(wert)}</span>
          </div>
        )
        return (
          <div style={{ ...card, padding: 16, marginTop: 14 }}>
            <div style={cap}>Verbuchung — Überleitung zum kalkulatorischen Betriebsergebnis</div>
            <div style={{ fontSize: 12.5, color: 'var(--slate)', margin: '4px 0 10px' }}>
              Die konfigurierten kalkulatorischen Kosten werden ins Ergebnis eingerechnet: Anderskosten nur mit ihrem
              <b> Mehrbetrag</b> gegenüber dem bilanziellen Aufwand, Zusatzkosten voll.
            </div>
            {z('Bilanzielles Betriebsergebnis (GuV)', u.bilanziellesErgebnis, { bold: true })}
            {z('Neutrales Ergebnis (betriebsfremd/periodenfremd/ao)', u.neutralesErgebnis, { prefix: '− ', farbe: 'var(--muted)' })}
            {z('= Zweckergebnis (rein betrieblich)', u.zweckergebnis, { bold: true })}
            <div style={{ height: 6 }} />
            {u.anders.map((a) => z(`${a.name}: kalk. ${mio(a.kalk)} − bilanziell ${mio(a.bilanz)}`, a.mehrbetrag, { prefix: '− ', farbe: 'var(--muted)' }))}
            {z('Σ Anderskosten-Mehrbetrag', u.summeAnders, { prefix: '− ', bold: true })}
            {z('Zusatzkosten (Unternehmerlohn)', u.zusatz, { prefix: '− ', farbe: 'var(--muted)' })}
            <div style={{ height: 6 }} />
            {z('= Kalkulatorisches Betriebsergebnis', u.kalkErgebnis, { bold: true, farbe: u.kalkErgebnis >= 0 ? 'var(--amp-g)' : 'var(--amp-r)' })}
          </div>
        )
      })()}
    </div>
  )
}

const inpBtn = { padding: '7px 12px', border: '1px solid var(--line)', borderRadius: 'var(--radius-sm)', background: 'var(--panel)', font: 'inherit', fontSize: 13 }
function kachel(label, wert, hint) {
  return (
    <div style={{ ...card, padding: '12px 14px', flex: 1, minWidth: 170 }}>
      <div style={cap}>{label}</div>
      <div style={{ fontSize: 22, fontWeight: 700, marginTop: 2 }}>{wert}</div>
      {hint && <div style={{ fontSize: 11, color: 'var(--muted)' }}>{hint}</div>}
    </div>
  )
}
