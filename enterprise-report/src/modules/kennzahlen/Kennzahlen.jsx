// =========================================================================
//  KENNZAHLEN-GLOSSAR — alle Definitionen an einem Ort, nach Bereich sortiert.
//  Respektiert Rechte: vertrauliche Kennzahlen ohne Berechtigung sind als
//  gesperrt markiert. ⓘ öffnet den vollständigen Steckbruck (Definition).
// =========================================================================
import React, { useState } from 'react'
import { KPI } from '../../core/kpiRegistry.js'
import { darfKpi } from '../../core/rbac.js'
import { istAdmin } from '../../core/gruppen.js'
import { formatWert } from '../../design/theme.js'
import { FreigabeChip } from '../../components/ui.jsx'
import { kpiAnzeige, statusVon, darfFreigeben, NICHT_VERFUEGBAR } from '../../core/kpiFreigabe.js'
import { useKpiDef } from './KpiDefContext.jsx'
import { EINHEITEN, RICHTUNGEN, setKpiOverride, resetKpiOverride, istUeberschrieben, kpiFelder } from '../../core/kpiOverrides.js'
import { HORIZONTE, ARTEN, horizontId, horizontInfo, artId, artInfo } from '../../core/klassifikation.js'
import { ampelStatus } from '../../core/ampel.js'
import ExecKopf, { ampelVon } from '../../components/ExecKopf.jsx'

export default function Kennzahlen({ rolle, werte = {} }) {
  const def = useKpiDef()
  const [suche, setSuche] = useState('')
  const [fHorizont, setFHorizont] = useState('')   // '' = alle
  const [fArt, setFArt] = useState('')
  const [editId, setEditId] = useState(null)
  const [form, setForm] = useState(null)
  const [, setTick] = useState(0)
  const darfEditieren = istAdmin(rolle)
  const darfSteuern = darfFreigeben(rolle)
  def?.freigabeTick // Re-Render bei Freigabe-Änderung
  const s = suche.trim().toLowerCase()

  function starteEdit(id) { setEditId(id); setForm(kpiFelder(id)) }
  function speichereEdit() {
    setKpiOverride(editId, {
      name: form.name, einheit: form.einheit, richtung: form.richtung,
      beschreibung: form.beschreibung, ziel: form.ziel === '' ? null : Number(form.ziel),
      horizont: form.horizont, monetaer: form.monetaer === 'ja'
    })
    setEditId(null); setTick((t) => t + 1)
  }
  function zuruecksetzen(id) { resetKpiOverride(id); setEditId(null); setTick((t) => t + 1) }

  const liste = Object.values(KPI).filter((k) =>
    (!s || k.name.toLowerCase().includes(s) || (k.beschreibung || '').toLowerCase().includes(s)) &&
    (!fHorizont || horizontId(k) === fHorizont) &&
    (!fArt || artId(k) === fArt) &&
    // Freigabe: noch nicht freigegebene KPIs für unbefugte Rollen ausblenden
    kpiAnzeige(k.id, rolle).modus !== 'versteckt')
  const bereiche = [...new Set(liste.map((k) => k.bereich))]

  // Exec-Kopf: Lage aus dem Anteil grüner Ampeln im sichtbaren KPI-Set
  // (nur bewertbare KPIs mit Wert + Ziel); Empfehlung aus den roten KPIs.
  const bewertet = (liste || [])
    .map((k) => ({ k, amp: ampelStatus({ wert: werte[k.id], ziel: k.ziel, richtung: k.richtung, warn: k.warn }) }))
    .filter((x) => x.amp === 'g' || x.amp === 'a' || x.amp === 'r')
  const gruen = bewertet.filter((x) => x.amp === 'g').length
  const rot = bewertet.filter((x) => x.amp === 'r')
  const gruenAnteil = bewertet.length ? Math.round(gruen / bewertet.length * 100) : null
  const execStatus = ampelVon(gruenAnteil, { gut: 70, schlecht: 40 })
  const execAussage = bewertet.length
    ? `${bewertet.length} bewertete Kennzahlen im aktuellen Set: ${gruen} grün · ${bewertet.filter((x) => x.amp === 'a').length} gelb · ${rot.length} rot (${gruenAnteil} % auf Ziel).`
    : `${liste.length} Kennzahlen-Definitionen — derzeit keine zielbewerteten Werte im Set.`
  const execEmpf = rot.length
    ? `Handlungsbedarf bei ${rot.length} roten Kennzahlen: ${rot.slice(0, 3).map((x) => x.k.name).join(', ')}${rot.length > 3 ? ' u. a.' : ''} — Ursachen prüfen und gegensteuern.`
    : 'Keine roten Kennzahlen im aktuellen Set — Zielwerte und Freigaben aktuell halten.'

  const card = { background: 'var(--panel)', border: '1px solid var(--line)', borderRadius: 'var(--radius)', boxShadow: 'var(--shadow)' }
  const lbl = { fontSize: 11, color: 'var(--muted)' }
  const fInp = { padding: '6px 8px', border: '1px solid var(--line)', borderRadius: 'var(--radius-sm)', font: 'inherit', fontSize: 13, marginTop: 2 }

  const klassBadge = (farbe) => ({ fontSize: 10, fontWeight: 700, color: farbe || 'var(--muted)', border: `1px solid ${farbe || 'var(--line)'}`, padding: '0 6px', borderRadius: 999, lineHeight: '15px' })
  const chip = (aktiv, farbe) => ({ padding: '4px 11px', borderRadius: 999, fontSize: 12, cursor: 'pointer', fontWeight: 600,
    border: `1px solid ${aktiv ? (farbe || 'var(--accent)') : 'var(--line)'}`, background: aktiv ? (farbe || 'var(--accent)') : 'var(--panel)', color: aktiv ? '#fff' : 'var(--ink)' })
  const chipGruppe = (titel, opts, wert, setter) => (
    <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
      <span style={{ fontSize: 11, color: 'var(--muted)' }}>{titel}:</span>
      <button style={chip(wert === '')} onClick={() => setter('')}>alle</button>
      {opts.map((o) => <button key={o.id} title={o.hinweis} style={chip(wert === o.id, o.farbe)} onClick={() => setter(wert === o.id ? '' : o.id)}>{o.name}</button>)}
    </div>
  )

  return (
    <div>
      <div style={{ marginBottom: 14 }}>
        <h2 style={{ margin: '0 0 4px' }}>Kennzahlen-Definitionen</h2>
        <div style={{ color: 'var(--muted)', fontSize: 13 }}>
          Nachschlagewerk aller Kennzahlen: Bedeutung, Formel, Ziel- und Ampel-Logik, Datenquelle.
          Über das <b>ⓘ</b> (auch direkt an jeder Kennzahl im Bericht) öffnest du den vollständigen Steckbrief.
          <br /><span style={{ color: 'var(--slate)' }}>🔎 <b>Transparenz für alle:</b> jede Definition ist hier einsehbar — auch zu vertraulichen Kennzahlen. Nur der aktuelle <b>Wert</b> ist bei vertraulichen Kennzahlen (🔒) rollenabhängig.</span>
        </div>
        <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap', alignItems: 'center', marginTop: 10 }}>
          <input value={suche} onChange={(e) => setSuche(e.target.value)} placeholder="Kennzahl suchen …"
            style={{ padding: '8px 11px', border: '1px solid var(--line)', borderRadius: 'var(--radius-sm)', font: 'inherit', width: 240 }} />
          {chipGruppe('Horizont', HORIZONTE, fHorizont, setFHorizont)}
          {chipGruppe('Art', ARTEN, fArt, setFArt)}
        </div>
      </div>

      <ExecKopf status={execStatus} kennzahl={gruenAnteil != null ? `${gruenAnteil} %` : undefined} kennzahlLabel="Auf Ziel (grün)" kernaussage={execAussage} empfehlung={execEmpf} />

      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        {bereiche.map((b) => (
          <div key={b} style={{ ...card, padding: 14 }}>
            <div className="mono" style={{ fontSize: 11, color: 'var(--muted)', textTransform: 'uppercase', marginBottom: 8 }}>{b}</div>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              {liste.filter((k) => k.bereich === b).map((k) => {
                const darf = darfKpi(rolle, k)
                const ueb = istUeberschrieben(k.id)
                const az = kpiAnzeige(k.id, rolle)
                return (
                  <div key={k.id} style={{ padding: '8px 0', borderBottom: '1px solid var(--line)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <button onClick={() => def?.oeffne(k.id)} title="Definition öffnen"
                        style={{ border: 'none', background: 'none', cursor: 'pointer', color: 'var(--accent)', fontSize: 15, fontWeight: 700 }}>ⓘ</button>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: 600, fontSize: 14, display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>{k.name} {k.security && <span title="vertraulich" style={{ fontSize: 11 }}>🔒</span>}
                          <span title={horizontInfo(k)?.hinweis} style={klassBadge(horizontInfo(k)?.farbe)}>{horizontInfo(k)?.name}</span>
                          <span title={artInfo(k)?.hinweis} style={klassBadge(artInfo(k)?.farbe)}>{artInfo(k)?.name}</span>
                          {ueb && <span title="angepasst (Override)" style={{ fontSize: 10, fontWeight: 700, color: 'var(--accent)', background: 'var(--accent-soft)', padding: '1px 6px', borderRadius: 999 }}>angepasst</span>}
                          {darfSteuern && az.modus === 'entwurf' && <span title="noch nicht freigegeben" style={{ fontSize: 10, fontWeight: 700, color: 'var(--amp-a)', border: '1px solid var(--amp-a)', padding: '0 6px', borderRadius: 999 }}>✎ Entwurf</span>}
                          {darfSteuern && az.status === 'deaktiviert' && <span title="abgeschaltet" style={{ fontSize: 10, fontWeight: 700, color: 'var(--amp-r)', border: '1px solid var(--amp-r)', padding: '0 6px', borderRadius: 999 }}>⊘ deaktiviert</span>}</div>
                        <div style={{ fontSize: 12, color: 'var(--muted)' }}>{k.beschreibung}</div>
                      </div>
                      {darfSteuern && def && <FreigabeChip kpiId={k.id} def={def} />}
                      {darfEditieren && <button onClick={() => editId === k.id ? setEditId(null) : starteEdit(k.id)} title="Definition bearbeiten"
                        style={{ border: 'none', background: 'none', cursor: 'pointer', color: 'var(--muted)', fontSize: 14 }}>✎</button>}
                      <div className="mono" style={{ fontSize: 13, fontWeight: 600, minWidth: 140, textAlign: 'right', color: az.modus === 'nichtVerfuegbar' ? 'var(--muted)' : undefined }}>
                        {az.modus === 'nichtVerfuegbar' ? NICHT_VERFUEGBAR : darf ? formatWert(werte[k.id], k.einheit) : '🔒'}
                      </div>
                    </div>
                    {editId === k.id && form && (
                      <div style={{ marginTop: 8, padding: 12, background: 'var(--bg)', border: '1px solid var(--line)', borderRadius: 'var(--radius-sm)', display: 'flex', flexWrap: 'wrap', gap: 10, alignItems: 'flex-end' }}>
                        <label style={lbl}>Name<br /><input style={fInp} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></label>
                        <label style={lbl}>Ziel<br /><input style={{ ...fInp, width: 90 }} value={form.ziel} onChange={(e) => setForm({ ...form, ziel: e.target.value })} placeholder="—" /></label>
                        <label style={lbl}>Einheit<br /><select style={fInp} value={form.einheit} onChange={(e) => setForm({ ...form, einheit: e.target.value })}>{EINHEITEN.map((u) => <option key={u.id} value={u.id}>{u.name}</option>)}</select></label>
                        <label style={lbl}>Richtung<br /><select style={fInp} value={form.richtung} onChange={(e) => setForm({ ...form, richtung: e.target.value })}>{RICHTUNGEN.map((rr) => <option key={rr.id} value={rr.id}>{rr.name}</option>)}</select></label>
                        <label style={lbl}>Horizont<br /><select style={fInp} value={form.horizont} onChange={(e) => setForm({ ...form, horizont: e.target.value })}>{HORIZONTE.map((h) => <option key={h.id} value={h.id}>{h.name}</option>)}</select></label>
                        <label style={lbl}>Art<br /><select style={fInp} value={form.monetaer} onChange={(e) => setForm({ ...form, monetaer: e.target.value })}><option value="ja">Monetär</option><option value="nein">Nicht-monetär</option></select></label>
                        <label style={{ ...lbl, flex: 1, minWidth: 220 }}>Beschreibung<br /><input style={{ ...fInp, width: '100%' }} value={form.beschreibung} onChange={(e) => setForm({ ...form, beschreibung: e.target.value })} /></label>
                        <button onClick={speichereEdit} style={{ ...fInp, cursor: 'pointer', background: 'var(--accent)', color: '#fff', border: 'none', fontWeight: 600 }}>Speichern</button>
                        {ueb && <button onClick={() => zuruecksetzen(k.id)} style={{ ...fInp, cursor: 'pointer', color: 'var(--amp-r)', borderColor: 'var(--amp-r)' }}>Zurücksetzen</button>}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
