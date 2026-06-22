// =========================================================================
//  ABSTIMMBRÜCKEN — Reporting-Ist ↔ Buchhaltung je Position abstimmen.
//  Differenz (abs/%), Toleranz-Ampel, Status setzen, Kommentar erfassen.
//  Persistiert je Periode; speist die Abschluss-Freigabe.
// =========================================================================
import React, { useState, useEffect } from 'react'
import { bruecken, setNotiz, STATUS, statusInfo, abstimmZusammenfassung, ladeHauptbuch, FRISCH_TAGE } from '../../core/abstimmung.js'
import { addMassnahme, ladeMassnahmen } from '../../core/massnahmen.js'
import { formatWert } from '../../design/theme.js'
import { AMPEL_FARBE } from '../../design/theme.js'

const card = { background: 'var(--panel)', border: '1px solid var(--line)', borderRadius: 'var(--radius)', boxShadow: 'var(--shadow)' }
const inp = { padding: '6px 8px', border: '1px solid var(--line)', borderRadius: 'var(--radius-sm)', font: 'inherit', fontSize: 12 }
const mio = (v) => v == null ? '–' : formatWert(v, 'eur_mio')

export default function Abstimmung({ werte, periode }) {
  const [tick, setTick] = useState(0)
  const [hb, setHb] = useState(null)   // { quelle, werte } vom Backend
  const refresh = () => setTick((t) => t + 1)
  useEffect(() => { let aktiv = true; ladeHauptbuch(periode).then((h) => aktiv && setHb(h)); return () => { aktiv = false } }, [periode])

  // Filter: Status-Auswahl, Textsuche und „Erledigte (länger abgestimmt) anzeigen".
  const [statusFilter, setStatusFilter] = useState(() => new Set(STATUS.map((s) => s.id)))
  const [suche, setSuche] = useState('')
  const [zeigeErledigt, setZeigeErledigt] = useState(false)
  const toggleStatus = (id) => setStatusFilter((s) => { const n = new Set(s); n.has(id) ? n.delete(id) : n.add(id); return n.size ? n : s })

  const hbWerte = hb?.werte && Object.keys(hb.werte).length ? hb.werte : null
  const alle = bruecken(werte, periode, hbWerte)
  const q = suche.trim().toLowerCase()
  const erledigteN = alle.filter((r) => r.erledigt).length
  const zeilen = alle.filter((r) =>
    statusFilter.has(r.status) &&
    (zeigeErledigt || !r.erledigt) &&
    (!q || r.name.toLowerCase().includes(q) || r.konto.toLowerCase().includes(q))
  )
  const z = abstimmZusammenfassung(werte, periode, hbWerte)
  const quelleText = !hb ? 'lokal simuliert (kein Backend)' : hb.quelle === 'fibu' ? 'FiBu (MSSQL)' : hbWerte ? 'Hauptbuch-Mock (Backend)' : 'lokal simuliert'

  const set = (posId, patch) => { setNotiz(periode, posId, patch); refresh() }

  const [mnId, setMnId] = useState(null)            // Position mit offenem Maßnahmen-Formular
  const [mnForm, setMnForm] = useState({ owner: '', frist: '' })
  const massnahmen = ladeMassnahmen()
  const hatMassnahme = (posId) => massnahmen.some((m) => m.positionId === posId && m.periode === periode)

  function legeMassnahmeAn(r) {
    addMassnahme({
      titel: `Abstimmdifferenz „${r.name}" klären (${r.diff > 0 ? '+' : ''}${r.diff} Mio €)`,
      owner: mnForm.owner, faelligkeit: mnForm.frist || null, frist: mnForm.frist || 'offen',
      quelle: 'abstimmung', positionId: r.id, periode,
      kpi: r.kpiId, bereich: 'FIN', hebel: 'Datenqualität',
      relevanz: `Reporting ↔ Buchhaltung (${r.konto}) — Voraussetzung für die Abschluss-Freigabe.`,
      erreichbarkeit: 'Ursache je Konto prüfen (Abgrenzung/Buchung/Bewertung), korrigieren, erneut abstimmen.'
    })
    setNotiz(periode, r.id, { status: 'klaerung' })
    setMnId(null); setMnForm({ owner: '', frist: '' }); refresh()
  }

  return (
    <div style={{ maxWidth: '100%', margin: '0 auto', display: 'grid', gap: 16 }}>
      <div style={{ ...card, padding: 16 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 10 }}>
          <div>
            <h2 style={{ margin: 0, fontSize: 18 }}>Abstimmbrücken — Reporting ↔ Buchhaltung <span className="mono" style={{ fontSize: 12, color: 'var(--muted)' }}>· {periode}</span></h2>
            <p style={{ color: 'var(--muted)', fontSize: 13, margin: '6px 0 0', maxWidth: 720 }}>
              Reporting-Ist gegen das Hauptbuch je Position abstimmen. Differenzen über Toleranz brauchen Klärung;
              abgestimmte Positionen sind die Grundlage für die <b>Abschluss-Freigabe</b>.
            </p>
            <div className="mono" style={{ fontSize: 11, color: 'var(--muted)', marginTop: 4 }}>Buchhaltungsquelle: {quelleText}</div>
          </div>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            <span style={{ ...badge('g') }}>{z.abgestimmt} abgestimmt</span>
            <span style={{ ...badge('a') }}>{z.offen} offen</span>
            <span style={{ ...badge('n') }}>Σ Differenz {mio(z.diffSumme)}</span>
          </div>
        </div>
      </div>

      {/* Filterleiste: Suche, Status, erledigte ein-/ausblenden */}
      <div style={{ ...card, padding: 12, display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
        <input value={suche} onChange={(e) => setSuche(e.target.value)} placeholder="🔎 Position / Konto …" style={{ ...inp, minWidth: 200, flex: 1, fontSize: 13 }} />
        <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
          <span style={{ fontSize: 11, color: 'var(--muted)' }}>Status:</span>
          {STATUS.map((s) => {
            const an = statusFilter.has(s.id)
            return (
              <button key={s.id} onClick={() => toggleStatus(s.id)} style={{ fontSize: 12, padding: '4px 10px', borderRadius: 999, cursor: 'pointer', fontWeight: 600,
                border: `1px solid ${an ? AMPEL_FARBE[s.ampel] : 'var(--line)'}`, background: an ? 'var(--panel)' : 'transparent', color: an ? AMPEL_FARBE[s.ampel] : 'var(--muted)' }}>
                {an ? '✓ ' : ''}{s.name}
              </button>
            )
          })}
        </div>
        <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12.5, cursor: 'pointer', color: erledigteN ? 'var(--ink)' : 'var(--muted)' }}>
          <input type="checkbox" checked={zeigeErledigt} onChange={(e) => setZeigeErledigt(e.target.checked)} />
          Erledigte anzeigen{erledigteN ? ` (${erledigteN})` : ''}
        </label>
      </div>

      <div style={{ ...card, overflow: 'hidden' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr 1fr 1fr 150px 1.4fr', gap: 10, padding: '10px 16px',
          borderBottom: '1px solid var(--line)', fontSize: 11, color: 'var(--muted)', textTransform: 'uppercase' }} className="mono">
          <span>Position / Konto</span><span style={{ textAlign: 'right' }}>Reporting-Ist</span><span style={{ textAlign: 'right' }}>Buchhaltung</span>
          <span style={{ textAlign: 'right' }}>Differenz</span><span>Status</span><span>Kommentar</span>
        </div>
        {zeilen.length === 0 && (
          <div style={{ padding: 20, textAlign: 'center', color: 'var(--muted)', fontSize: 13 }}>
            Keine Positionen in dieser Ansicht.{!zeigeErledigt && erledigteN > 0 && <> {erledigteN} erledigte ausgeblendet — <button onClick={() => setZeigeErledigt(true)} style={{ border: 'none', background: 'none', color: 'var(--accent)', cursor: 'pointer', fontWeight: 600, padding: 0 }}>anzeigen</button>.</>}
          </div>
        )}
        {zeilen.map((r, i) => {
          const si = statusInfo(r.status)
          const diffFarbe = r.diff == null ? 'var(--muted)' : r.imRahmen ? 'var(--amp-g)' : 'var(--amp-r)'
          const offen = !r.imRahmen
          const hat = hatMassnahme(r.id)
          return (
            <div key={r.id} style={{ borderTop: i ? '1px solid var(--line)' : 'none', background: r.imRahmen ? 'transparent' : 'var(--amp-r-soft)', opacity: r.erledigt ? 0.6 : 1 }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr 1fr 1fr 150px 1.4fr', gap: 10, padding: '11px 16px', alignItems: 'center' }}>
                <div>
                  <div style={{ fontWeight: 600, fontSize: 14, display: 'flex', alignItems: 'center', gap: 6 }}>{r.name}
                    {r.erledigt && <span title={r.am ? `abgestimmt am ${r.am}` : 'automatisch im Rahmen'} style={{ fontSize: 9.5, fontWeight: 700, color: 'var(--amp-g)', border: '1px solid var(--amp-g)', borderRadius: 999, padding: '0 6px' }}>erledigt</span>}
                    {r.frisch && <span title={`abgestimmt am ${r.am}`} style={{ fontSize: 9.5, fontWeight: 700, color: 'var(--amp-g)', background: 'var(--amp-g-soft)', borderRadius: 999, padding: '0 6px' }}>neu abgestimmt</span>}
                  </div>
                  <div className="mono" style={{ fontSize: 11, color: 'var(--muted)' }}>{r.konto} · Toleranz {mio(r.toleranz)}</div>
                </div>
                <span className="mono" style={{ textAlign: 'right' }}>{mio(r.ist)}</span>
                <span className="mono" style={{ textAlign: 'right' }}>{mio(r.buchhaltung)}</span>
                <span className="mono" style={{ textAlign: 'right', color: diffFarbe, fontWeight: 600 }}>
                  {r.diff == null ? '–' : `${r.diff > 0 ? '+' : ''}${mio(r.diff)}`}
                  {r.diffPct != null && Math.abs(r.diff) > 0 ? <span style={{ fontSize: 11, opacity: .8 }}> ({r.diffPct > 0 ? '+' : ''}{r.diffPct.toFixed(1)} %)</span> : null}
                </span>
                <select value={r.status} onChange={(e) => set(r.id, { status: e.target.value })} style={{ ...inp,
                  borderColor: AMPEL_FARBE[si.ampel], color: AMPEL_FARBE[si.ampel], fontWeight: 600 }}>
                  {STATUS.map((s) => <option key={s.id} value={s.id} style={{ color: 'var(--ink)' }}>{s.name}{!r.gesetzt && s.id === r.status ? ' (auto)' : ''}</option>)}
                </select>
                <input value={r.kommentar} onChange={(e) => set(r.id, { kommentar: e.target.value })} style={inp}
                  placeholder={r.imRahmen ? 'im Rahmen' : 'Ursache/Maßnahme …'} />
              </div>
              {offen && (
                <div style={{ padding: '0 16px 10px', display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
                  {hat ? <span style={{ fontSize: 12, color: 'var(--amp-g)', fontWeight: 600 }}>✓ Maßnahme angelegt</span>
                  : mnId === r.id ? (
                    <>
                      <input style={{ ...inp, width: 150 }} value={mnForm.owner} onChange={(e) => setMnForm({ ...mnForm, owner: e.target.value })} placeholder="Verantwortlich" />
                      <input style={{ ...inp, width: 140 }} type="date" value={mnForm.frist} onChange={(e) => setMnForm({ ...mnForm, frist: e.target.value })} />
                      <button onClick={() => legeMassnahmeAn(r)} style={{ ...inp, cursor: 'pointer', background: 'var(--accent)', color: '#fff', border: 'none', fontWeight: 600 }}>Maßnahme anlegen</button>
                      <button onClick={() => setMnId(null)} style={{ ...inp, cursor: 'pointer' }}>Abbrechen</button>
                    </>
                  ) : (
                    <button onClick={() => { setMnId(r.id); setMnForm({ owner: '', frist: '' }) }} style={{ ...inp, cursor: 'pointer', color: 'var(--accent)', borderColor: 'var(--accent)', fontWeight: 600 }}>→ Maßnahme aus Differenz</button>
                  )}
                </div>
              )}
            </div>
          )
        })}
      </div>
      <div style={{ fontSize: 12, color: 'var(--muted)' }}>
        Status „Abgestimmt" wird bei Differenzen innerhalb der Toleranz automatisch vorgeschlagen; manuelle Auswahl überschreibt.
        Abgestimmte Positionen werden nach {FRISCH_TAGE} Tagen als <b>erledigt</b> ausgeblendet — bei Rückfragen über „Erledigte anzeigen" wieder einblenden.
      </div>
    </div>
  )
}

function badge(ampel) {
  return { display: 'inline-flex', alignItems: 'center', gap: 6, padding: '4px 11px', borderRadius: 999, fontSize: 12, fontWeight: 600,
    border: `1px solid ${AMPEL_FARBE[ampel]}`, color: AMPEL_FARBE[ampel], background: 'var(--panel)' }
}
