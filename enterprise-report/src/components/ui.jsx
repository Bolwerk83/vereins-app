// Gemeinsame UI-Bausteine — von ALLEN Modulen genutzt -> einheitliches Design.
import React, { useState, useEffect, useRef } from 'react'
import { KPI } from '../core/kpiRegistry.js'
import { ampelStatus, trendAusHistorie } from '../core/ampel.js'
import { AMPEL_FARBE, AMPEL_SOFT, AMPEL_LABEL, AMPEL_SYMBOL, formatWert, TREND_ICON, kpiSymbol } from '../design/theme.js'
import { kpiInsight } from '../core/insights.js'
import { renderText, istVeraltet, ladeText, speichereText, loescheText, aktualisiereSnapshot, VORLAGEN, kiVorschlaege } from '../core/textbausteine.js'
import { kpiAnzeige, statusVon, darfFreigeben, FREIGABE_STATUS, FREIGABE_LABEL, NICHT_VERFUEGBAR } from '../core/kpiFreigabe.js'
import { useNav } from './NavContext.jsx'
import { detailFuerBereich } from '../core/detailberichte.js'
import { glossar } from '../core/kpiLaienGlossar.js'
import { useKpiDef } from '../modules/kennzahlen/KpiDefContext.jsx'
import { useFenster } from '../core/useFenster.js'
import { ladeBookmarks, addBookmark, loescheBookmark, ladeLetzte, merkeLetzte } from '../core/bookmarks.js'

// Ampelpunkt mit Statussymbol (✓/!/✕) — auch ohne Farbe erkennbar.
// mitText=true zeigt zusätzlich den Klartext ("Im Ziel" …).
export function AmpelPunkt({ status, size = 14, mitText = false }) {
  const s = status || 'n'
  const dot = (
    <span role="img" aria-label={AMPEL_LABEL[s]} title={AMPEL_LABEL[s]}
      style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', flex: 'none',
        width: size, height: size, borderRadius: '50%', background: AMPEL_FARBE[s] || AMPEL_FARBE.n,
        color: '#fff', fontSize: Math.round(size * 0.7), fontWeight: 800, lineHeight: 1 }}>{AMPEL_SYMBOL[s]}</span>
  )
  if (!mitText) return dot
  return <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5 }}>{dot}
    <span style={{ fontSize: 11.5, fontWeight: 700, color: AMPEL_FARBE[s] }}>{AMPEL_LABEL[s]}</span></span>
}

// Status-Chip: Symbol + Klartext + Farbfläche — die unmissverständliche „ok / nicht ok"-Anzeige.
export function StatusChip({ status, size = 'm' }) {
  const s = status || 'n'
  const klein = size === 's'
  return (
    <span role="img" aria-label={AMPEL_LABEL[s]} style={{ display: 'inline-flex', alignItems: 'center', gap: 5,
      padding: klein ? '1px 7px' : '2px 9px', borderRadius: 999, fontSize: klein ? 10.5 : 11.5, fontWeight: 700,
      color: AMPEL_FARBE[s], background: AMPEL_SOFT[s], border: `1px solid ${AMPEL_FARBE[s]}` }}>
      <span aria-hidden="true" style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 14, height: 14, borderRadius: '50%', background: AMPEL_FARBE[s], color: '#fff', fontSize: 10, fontWeight: 800, lineHeight: 1 }}>{AMPEL_SYMBOL[s]}</span>
      {AMPEL_LABEL[s]}
    </span>
  )
}

export function Badge({ children, status = 'n' }) {
  return <span className="mono" style={{ fontSize: 11, padding: '2px 7px', borderRadius: 999,
    color: AMPEL_FARBE[status], background: AMPEL_SOFT[status], border: `1px solid ${AMPEL_FARBE[status]}22` }}>{children}</span>
}

/** KPI-Kachel: Wert + Ziel + Ampel + Trend. Berechnet Status zentral.
 *  Mit `alleWerte` wird ein Logik-Drill (Herkunft über Abhängigkeiten) angeboten. */
export function KpiCard({ kpiId, wert, historie, onClick, alleWerte }) {
  const k = KPI[kpiId]
  const def = useKpiDef()
  const [drill, setDrill] = useState(null)
  if (!k) return null
  // Freigabe-Governance: erst freigegebene KPIs sind für alle sichtbar.
  const rolle = def?.rolle
  const darfSteuern = darfFreigeben(rolle)
  const anzeige = kpiAnzeige(kpiId, rolle) // hängt über def.freigabeTick an Re-Render
  if (anzeige.modus === 'versteckt') return null
  if (anzeige.modus === 'nichtVerfuegbar') {
    return (
      <div style={{ background: 'var(--panel)', border: '1px dashed var(--line)', borderRadius: 'var(--radius)',
        padding: 14, minWidth: 150, flex: '1 1 0', color: 'var(--muted)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 6 }}>
          <span className="mono" style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: '.04em' }}>{k.name}</span>
          {darfSteuern && def && <FreigabeChip kpiId={kpiId} def={def} />}
        </div>
        <div style={{ fontSize: 14, marginTop: 12, fontWeight: 600 }}>{NICHT_VERFUEGBAR}</div>
      </div>
    )
  }
  const entwurf = anzeige.modus === 'entwurf'
  const status = ampelStatus({ wert, ziel: k.ziel, richtung: k.richtung, warn: k.warn })
  const t = historie ? trendAusHistorie(historie.map((h) => h.wert), k.richtung) : null
  const sym = kpiSymbol(k.einheit)
  return (
    <>
    <button onClick={onClick} style={{ textAlign: 'left', background: 'var(--panel)', border: '1px solid var(--line)',
      borderLeft: `3px solid ${entwurf ? 'var(--amp-a)' : AMPEL_FARBE[status]}`, borderRadius: 'var(--radius)', padding: 14, minWidth: 150,
      flex: '1 1 0', boxShadow: 'var(--shadow)' }}>
      {entwurf && <div style={{ fontSize: 9.5, fontWeight: 700, color: 'var(--amp-a)', textTransform: 'uppercase', letterSpacing: '.05em', marginBottom: 4 }}>✎ Entwurf · noch nicht freigegeben</div>}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 6 }}>
        <span className="mono" style={{ fontSize: 11, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '.04em' }}>{k.name}</span>
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
          {darfSteuern && def && <FreigabeChip kpiId={kpiId} def={def} />}
          {alleWerte && <span role="button" title="Logik & Herkunft (Drill durch die Ebenen)"
            onClick={(e) => { e.stopPropagation(); setDrill(kpiId) }}
            style={{ cursor: 'pointer', color: 'var(--accent)', fontSize: 13, fontWeight: 700, lineHeight: 1 }}>⛓</span>}
          {def && <span role="button" title="Kennzahlen-Definition öffnen"
            onClick={(e) => { e.stopPropagation(); def.oeffne(kpiId) }}
            style={{ cursor: 'pointer', color: 'var(--muted)', fontSize: 13, fontWeight: 700, lineHeight: 1 }}>ⓘ</span>}
          <AmpelPunkt status={status} />
        </span>
      </div>
      <div className="mono" style={{ fontSize: 24, fontWeight: 600, marginTop: 6 }}>
        {sym && <span style={{ color: 'var(--muted)', fontWeight: 500, marginRight: 5 }}>{sym}</span>}{formatWert(wert, k.einheit)}
      </div>
      {!entwurf && k.ziel != null && <div style={{ marginTop: 6 }}><StatusChip status={status} size="s" /></div>}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 4 }}>
        <span style={{ fontSize: 11, color: 'var(--muted)' }}>{k.ziel != null ? `Ziel ${sym ? sym + ' ' : ''}${formatWert(k.ziel, k.einheit)}` : '—'}</span>
        {t && t.deltaPct != null && <span className="mono" style={{ fontSize: 11, color: t.istGut ? 'var(--amp-g)' : 'var(--amp-r)' }}>
          Δ {TREND_ICON[t.trend]} {t.deltaPct >= 0 ? '+' : ''}{t.deltaPct.toFixed(1)} %</span>}
      </div>
    </button>
    {drill && <KpiDrillModal startId={drill} werte={alleWerte} onClose={() => setDrill(null)} />}
    </>
  )
}

/** Freigabe-Steuerung an der Karte (nur Controlling/Admin): Status umschalten. */
export function FreigabeChip({ kpiId, def }) {
  const [auf, setAuf] = useState(false)
  const status = statusVon(kpiId)
  const stil = { freigegeben: { i: '✓', f: 'var(--amp-g)' }, entwurf: { i: '✎', f: 'var(--amp-a)' }, deaktiviert: { i: '⊘', f: 'var(--amp-r)' } }[status]
  return (
    <span style={{ position: 'relative', display: 'inline-flex' }}>
      <span role="button" title={`Freigabe: ${FREIGABE_LABEL[status]} — ändern`}
        onClick={(e) => { e.stopPropagation(); setAuf((v) => !v) }}
        style={{ cursor: 'pointer', color: stil.f, fontSize: 12, fontWeight: 700, lineHeight: 1, border: `1px solid ${stil.f}55`, borderRadius: 999, padding: '1px 5px' }}>{stil.i}</span>
      {auf && (
        <span onClick={(e) => e.stopPropagation()} style={{ position: 'absolute', top: '120%', right: 0, zIndex: 60, background: 'var(--panel)', border: '1px solid var(--line)', borderRadius: 'var(--radius-sm)', boxShadow: 'var(--shadow)', padding: 4, minWidth: 180 }}>
          <div style={{ fontSize: 9.5, fontWeight: 700, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '.04em', padding: '4px 8px' }}>Freigabe steuern</div>
          {FREIGABE_STATUS.map((s) => (
            <button key={s} onClick={(e) => { e.stopPropagation(); def.setFreigabe(kpiId, s); setAuf(false) }}
              style={{ display: 'block', width: '100%', textAlign: 'left', border: 'none', cursor: 'pointer', fontSize: 12, padding: '6px 8px', borderRadius: 6,
                background: s === status ? 'var(--accent-soft)' : 'transparent', color: s === status ? 'var(--accent)' : 'var(--ink)', fontWeight: s === status ? 700 : 400 }}>
              {s === status ? '● ' : '○ '}{FREIGABE_LABEL[s]}
            </button>
          ))}
        </span>
      )}
    </span>
  )
}

/** Logik-Drill: eine Kennzahl auswählen, KI-Klartext lesen und über die
 *  Abhängigkeiten Ebene für Ebene tiefer gehen (volle Transparenz der Herkunft). */
export function KpiDrillModal({ startId, werte = {}, onClose }) {
  const nav = useNav()
  const [pfad, setPfad] = useState([startId])
  const id = pfad[pfad.length - 1]
  const k = KPI[id]
  if (!k) return null
  const wert = werte[id]
  const sym = kpiSymbol(k.einheit)
  const status = ampelStatus({ wert, ziel: k.ziel, richtung: k.richtung, warn: k.warn })
  const ins = kpiInsight(id, wert)
  const deps = (k.abhaengig || []).filter((d) => KPI[d])
  const tief = (i) => setPfad((p) => [...p, i])
  return (
    <div onClick={onClose} style={{ position: 'fixed', inset: 0, zIndex: 95, background: 'rgba(15,23,42,.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
      <div onClick={(e) => e.stopPropagation()} style={{ width: 560, maxWidth: '94vw', maxHeight: '88vh', overflowY: 'auto', background: 'var(--panel)', borderRadius: 'var(--radius)', boxShadow: '0 20px 60px rgba(0,0,0,.3)', border: '1px solid var(--line)' }}>
        <div style={{ padding: '14px 18px', borderBottom: '2px solid var(--accent)', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 10 }}>
          <div style={{ minWidth: 0 }}>
            <div className="mono" style={{ fontSize: 11, color: 'var(--muted)', textTransform: 'uppercase' }}>⛓ Logik & Herkunft</div>
            {/* Drill-Pfad (Ebenen) */}
            <div style={{ fontSize: 11, color: 'var(--muted)', marginTop: 4, display: 'flex', flexWrap: 'wrap', gap: 4 }}>
              {pfad.map((p, i) => (
                <span key={p + i}>
                  <a onClick={() => setPfad(pfad.slice(0, i + 1))} style={{ cursor: 'pointer', color: i === pfad.length - 1 ? 'var(--accent)' : 'var(--muted)', fontWeight: i === pfad.length - 1 ? 700 : 400 }}>{KPI[p]?.name}</a>
                  {i < pfad.length - 1 && <span> › </span>}
                </span>
              ))}
            </div>
            <h2 style={{ margin: '4px 0 0', fontSize: 19 }}>{k.name}</h2>
          </div>
          <button onClick={onClose} style={{ border: 'none', background: 'none', fontSize: 20, cursor: 'pointer', color: 'var(--muted)' }}>×</button>
        </div>
        <div style={{ padding: 18 }}>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 12, flexWrap: 'wrap' }}>
            <span className="mono" style={{ fontSize: 26, fontWeight: 700 }}>{sym && <span style={{ color: 'var(--muted)', fontWeight: 500 }}>{sym} </span>}{formatWert(wert, k.einheit)}</span>
            <Badge status={status}>{AMPEL_LABEL[status]}</Badge>
            {k.ziel != null && <span style={{ fontSize: 12, color: 'var(--muted)' }}>Budget {sym ? sym + ' ' : ''}{formatWert(k.ziel, k.einheit)}</span>}
            {ins?.abwZielPct != null && <span style={{ fontSize: 12.5, fontWeight: 700, color: status === 'r' ? 'var(--amp-r)' : status === 'a' ? 'var(--amp-a)' : 'var(--amp-g)' }}>Budget-Abw. {ins.abwZielPct >= 0 ? '+' : ''}{ins.abwZielPct.toFixed(1)} %</span>}
          </div>
          <div style={{ marginTop: 8, fontSize: 11.5, color: 'var(--muted)' }}>{k.beschreibung}</div>

          {/* Einfach erklärt — Definition + Beispiel für Nicht-Kaufleute */}
          {(() => {
            const g = glossar(id)
            if (!g) return null
            return (
              <div style={{ marginTop: 10, padding: '10px 12px', borderRadius: 'var(--radius-sm)', background: 'var(--bg)', border: '1px solid var(--line)' }}>
                <div className="mono" style={{ fontSize: 10, color: 'var(--accent)', textTransform: 'uppercase', letterSpacing: '.04em', marginBottom: 4 }}>💡 Einfach erklärt</div>
                <div style={{ fontSize: 13 }}>{g.definition}</div>
                {g.beispiel && <div style={{ fontSize: 12.5, color: 'var(--slate)', marginTop: 5 }}><b>Beispiel:</b> {g.beispiel}</div>}
              </div>
            )
          })()}

          {/* Öffnen in … (von jeder Kennzahl in Themenbericht/Details/Struktur).
              Der Detail-Button nennt die konkrete Belegliste, damit transparent
              ist, wohin der Drill führt (Herzstück: bis auf Detailebene). */}
          {nav && (() => {
            const det = detailFuerBereich(k.bereich)
            const pill = { fontSize: 12, padding: '4px 10px', borderRadius: 999, cursor: 'pointer', border: '1px solid var(--accent)', background: 'var(--panel)', color: 'var(--accent)', fontWeight: 600 }
            return (
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginTop: 12, alignItems: 'center' }}>
                <span style={{ fontSize: 11, color: 'var(--muted)' }}>Öffnen in:</span>
                <button onClick={() => { onClose(); nav.imBaum(id) }} style={pill}>📂 Themenbericht</button>
                <button onClick={() => { onClose(); nav.details(k.bereich) }} style={pill}
                  title={det ? `Auf Belegebene: ${det.name}` : 'Detailbericht-Übersicht'}>
                  🔎 {det ? `Details: ${det.name}` : 'Detailberichte'}
                </button>
                <button onClick={() => { onClose(); nav.struktur() }} style={pill}>📐 Struktur</button>
              </div>
            )
          })()}
          {ins?.aussage && (
            <div style={{ marginTop: 12, padding: '11px 13px', borderRadius: 'var(--radius-sm)', background: 'var(--accent-soft)', border: '1px solid var(--line)' }}>
              <div className="mono" style={{ fontSize: 10, color: 'var(--accent)', textTransform: 'uppercase', marginBottom: 4 }}>🤖 KI-Einschätzung</div>
              <div style={{ fontSize: 13 }}>{ins.aussage}</div>
            </div>
          )}
          {/* Warum ist der Wert so? — Treiber-Herleitung aus den Bestandteilen */}
          {(() => {
            const sp = (x) => (x == null ? '—' : (x >= 0 ? '+' : '') + x.toFixed(1) + ' %')
            const treiber = deps.map((d) => {
              const insd = kpiInsight(d, werte[d])
              return { d, name: KPI[d].name, abwPct: insd?.abwZielPct, status: ampelStatus({ wert: werte[d], ziel: KPI[d].ziel, richtung: KPI[d].richtung, warn: KPI[d].warn }) }
            }).filter((x) => x.abwPct != null).sort((a, b) => Math.abs(b.abwPct) - Math.abs(a.abwPct))
            const top = treiber[0]
            const richtungTxt = ins?.abwZielPct == null ? '' : (ins.abwZielPct >= 0 ? 'über' : 'unter') + ' Budget'
            let warum
            if (deps.length === 0) {
              warum = ins?.abwZiel != null
                ? `Direkt gemessene Kennzahl — die Abweichung (${sp(ins.abwZielPct)} ${richtungTxt}) kommt unmittelbar aus der Quelle (SQL/Mock), keine weitere Zerlegung.`
                : 'Direkt gemessene Kennzahl aus der Quelle — kein Ziel hinterlegt.'
            } else if (top) {
              warum = `${k.name} liegt ${sp(ins?.abwZielPct)} ${richtungTxt}. Stärkster Abweichungstreiber unter den Bestandteilen: ${top.name} (${sp(top.abwPct)} ggü. eigenem Budget)` + (treiber[1] ? `, gefolgt von ${treiber[1].name} (${sp(treiber[1].abwPct)}).` : '.')
            } else {
              warum = `${k.name} setzt sich aus ${deps.length} Bestandteilen zusammen — tiefer drillen für die Herleitung.`
            }
            return (
              <div style={{ marginTop: 16, padding: '11px 13px', borderRadius: 'var(--radius-sm)', background: 'var(--bg)', border: '1px solid var(--line)' }}>
                <div className="mono" style={{ fontSize: 10, color: 'var(--muted)', textTransform: 'uppercase', marginBottom: 4 }}>🔍 Warum ist der Wert so?</div>
                <div style={{ fontSize: 12.5, lineHeight: 1.5 }}>{warum}</div>
              </div>
            )
          })()}

          <div style={{ fontSize: 11, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '.03em', fontWeight: 700, margin: '16px 0 8px' }}>
            {deps.length ? 'Bestandteile — tiefer drillen (Abweichung ggü. eigenem Budget):' : 'Basiskennzahl'}
          </div>
          {deps.length === 0
            ? <div style={{ fontSize: 12.5, color: 'var(--muted)' }}>Direkt gemessene Kennzahl — kommt aus der Quelle (SQL/Mock), keine weitere Herleitung.</div>
            : (
              <div style={{ display: 'grid', gap: 8 }}>
                {deps.map((d) => {
                  const kd = KPI[d], wd = werte[d]
                  const sd = ampelStatus({ wert: wd, ziel: kd.ziel, richtung: kd.richtung, warn: kd.warn })
                  const symd = kpiSymbol(kd.einheit)
                  const insd = kpiInsight(d, wd)
                  const abw = insd?.abwZielPct
                  return (
                    <button key={d} onClick={() => tief(d)} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 10, textAlign: 'left', cursor: 'pointer', border: '1px solid var(--line)', background: 'var(--panel)', borderRadius: 'var(--radius-sm)', padding: '9px 12px' }}>
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8, minWidth: 0 }}><AmpelPunkt status={sd} /><span style={{ fontSize: 13, fontWeight: 600 }}>{kd.name}</span></span>
                      <span className="mono" style={{ fontSize: 13, whiteSpace: 'nowrap' }}>
                        {abw != null && <span style={{ fontSize: 11, color: sd === 'r' ? 'var(--amp-r)' : sd === 'a' ? 'var(--amp-a)' : 'var(--amp-g)', marginRight: 8 }}>{abw >= 0 ? '+' : ''}{abw.toFixed(1)} %</span>}
                        {symd && <span style={{ color: 'var(--muted)' }}>{symd} </span>}{formatWert(wd, kd.einheit)} <span style={{ color: 'var(--accent)' }}>→</span></span>
                    </button>
                  )
                })}
              </div>
            )}
        </div>
      </div>
    </div>
  )
}

/** Editierbarer Controller-Kommentar mit @KPI-Variablen, Bedingungen,
 *  Vorlagen, KI-Vorschlägen und Veraltet-Hinweis. */
export function Textbox({ id, werte = {}, periode = null, titel = 'Controller-Kommentar', editierbar = true }) {
  const [meta, setMeta] = useState(() => ladeText(id))
  const [edit, setEdit] = useState(false)
  const [draft, setDraft] = useState('')
  const [kiKpi, setKiKpi] = useState('')
  const [vorschl, setVorschl] = useState([])
  const ref = useRef(null)
  const kpiOpt = Object.values(KPI).map((k) => [k.id, k.name]).sort((a, b) => a[1].localeCompare(b[1]))

  const starten = () => { setDraft(meta?.text || ''); setVorschl([]); setEdit(true) }
  const speichern = () => { setMeta(speichereText(id, { text: draft, periode, werte })); setEdit(false) }
  const entfernen = () => { loescheText(id); setMeta(null); setEdit(false) }
  const snapshotAktualisieren = () => { const m = aktualisiereSnapshot(id, { werte, periode }); if (m) setMeta({ ...m }) }
  const insert = (s) => {
    const el = ref.current
    if (!el) { setDraft((d) => d + s); return }
    const a = el.selectionStart, b = el.selectionEnd
    setDraft((d) => d.slice(0, a) + s + d.slice(b))
    requestAnimationFrame(() => { el.focus(); el.selectionStart = el.selectionEnd = a + s.length })
  }
  const ver = istVeraltet(meta, werte, periode)
  const btn = { fontSize: 11.5, padding: '4px 9px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--line)', background: 'var(--panel)', cursor: 'pointer' }

  return (
    <div style={{ background: 'var(--panel)', border: '1px solid var(--line)', borderRadius: 'var(--radius)', padding: 14, boxShadow: 'var(--shadow)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 10, marginBottom: 8 }}>
        <span className="mono" style={{ fontSize: 11, color: 'var(--muted)', textTransform: 'uppercase' }}>📝 {titel}</span>
        <span style={{ display: 'inline-flex', gap: 8, alignItems: 'center' }}>
          {meta && ver.veraltet && <span title={ver.grund} style={{ fontSize: 11, fontWeight: 700, color: 'var(--amp-a)', background: 'var(--amp-a-soft)', borderRadius: 999, padding: '2px 8px' }}>⚠ prüfen</span>}
          {editierbar && !edit && <button onClick={starten} style={btn}>✎ {meta ? 'Bearbeiten' : 'Kommentieren'}</button>}
        </span>
      </div>

      {!edit ? (
        <div>
          {meta?.text ? <div style={{ fontSize: 13.5, lineHeight: 1.55, whiteSpace: 'pre-wrap' }}>{renderText(meta.text, werte)}</div>
            : <div style={{ fontSize: 12.5, color: 'var(--muted)' }}>Noch kein Kommentar.{editierbar ? ' Auf „Kommentieren" klicken.' : ''}</div>}

          {meta && ver.veraltet && (
            <div style={{ marginTop: 10, padding: '9px 11px', borderRadius: 'var(--radius-sm)', background: 'var(--amp-a-soft)', border: '1px solid var(--amp-a)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                <span style={{ fontSize: 11.5, fontWeight: 700, color: 'var(--amp-a)' }}>⚠ Zahlen haben sich seit dem Kommentar geändert</span>
                {editierbar && <button onClick={snapshotAktualisieren} title="Den Kommentar auf den aktuellen Datenstand heben (Text bleibt, Vergleichswerte werden aktualisiert)."
                  style={{ ...btn, borderColor: 'var(--amp-a)', color: 'var(--amp-a)' }}>↻ Snapshot aktualisieren</button>}
              </div>
              {ver.periode && (
                <div style={{ fontSize: 12, marginTop: 6, color: 'var(--ink)' }}>
                  Periode: <b>{ver.periode.alt}</b> <span style={{ color: 'var(--muted)' }}>→</span> <b>{ver.periode.neu}</b>
                </div>
              )}
              {ver.aenderungen?.length > 0 && (
                <div style={{ display: 'grid', gap: 4, marginTop: 6 }}>
                  {ver.aenderungen.map((a) => (
                    <div key={a.id} style={{ fontSize: 12, display: 'flex', alignItems: 'baseline', gap: 6, flexWrap: 'wrap' }}>
                      <span style={{ color: 'var(--slate)' }}>{a.name}:</span>
                      <span className="mono" style={{ color: 'var(--muted)' }}>damals {a.altFmt}</span>
                      <span style={{ color: 'var(--muted)' }}>→</span>
                      <span className="mono" style={{ fontWeight: 700 }}>heute {a.neuFmt}</span>
                      <span className="mono" style={{ color: a.deltaPct >= 0 ? 'var(--amp-g)' : 'var(--amp-r)' }}>
                        ({a.deltaPct >= 0 ? '+' : ''}{a.deltaPct} %)
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      ) : (
        <div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 8, alignItems: 'center' }}>
            <select onChange={(e) => { const v = VORLAGEN.find((x) => x.name === e.target.value); if (v) setDraft(v.text); e.target.value = '' }} defaultValue="" style={btn}>
              <option value="" disabled>Vorlage …</option>
              {VORLAGEN.map((v) => <option key={v.name} value={v.name}>{v.bereich} · {v.name}</option>)}
            </select>
            <select onChange={(e) => { if (e.target.value) { insert('@' + e.target.value + ' '); e.target.value = '' } }} defaultValue="" style={btn}>
              <option value="" disabled>＋ @Kennzahl …</option>
              {kpiOpt.map(([k, n]) => <option key={k} value={k}>{n}</option>)}
            </select>
            <select onChange={(e) => { if (e.target.value) { insert('@' + e.target.value + '[positiv …|negativ …]'); e.target.value = '' } }} defaultValue="" style={btn}>
              <option value="" disabled>＋ Bedingt (positiv/negativ) …</option>
              {kpiOpt.map(([k, n]) => <option key={k} value={k}>{n}</option>)}
            </select>
            <span style={{ display: 'inline-flex', gap: 4, alignItems: 'center' }}>
              <select value={kiKpi} onChange={(e) => { setKiKpi(e.target.value); setVorschl(e.target.value ? kiVorschlaege(e.target.value, werte) : []) }} style={btn}>
                <option value="">🤖 KI-Vorschlag zu …</option>
                {kpiOpt.map(([k, n]) => <option key={k} value={k}>{n}</option>)}
              </select>
            </span>
          </div>

          {vorschl.length > 0 && (
            <div style={{ display: 'grid', gap: 5, marginBottom: 8 }}>
              {vorschl.map((s, i) => (
                <button key={i} onClick={() => insert((draft && !draft.endsWith('\n') ? '\n' : '') + s)} style={{ textAlign: 'left', cursor: 'pointer', fontSize: 12, border: '1px solid var(--accent)', background: 'var(--accent-soft)', color: 'var(--ink)', borderRadius: 'var(--radius-sm)', padding: '7px 9px' }}>
                  🤖 {renderText(s, werte)} <span style={{ color: 'var(--accent)', fontWeight: 600 }}>· einfügen</span>
                </button>
              ))}
            </div>
          )}

          <textarea ref={ref} value={draft} onChange={(e) => setDraft(e.target.value)} rows={4}
            placeholder="Text … @nettoumsatz fügt den Wert ein; @ebit[positiv …|negativ …] schaltet die Formulierung um."
            style={{ width: '100%', boxSizing: 'border-box', padding: '9px 11px', border: '1px solid var(--line)', borderRadius: 'var(--radius-sm)', font: 'inherit', fontSize: 13, resize: 'vertical' }} />

          {draft && (
            <div style={{ marginTop: 8, padding: '9px 11px', borderRadius: 'var(--radius-sm)', background: 'var(--bg)', border: '1px solid var(--line)' }}>
              <div className="mono" style={{ fontSize: 10, color: 'var(--muted)', textTransform: 'uppercase', marginBottom: 4 }}>Vorschau (mit aktuellen Werten)</div>
              <div style={{ fontSize: 13, lineHeight: 1.5, whiteSpace: 'pre-wrap' }}>{renderText(draft, werte)}</div>
            </div>
          )}

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 10, gap: 8, flexWrap: 'wrap' }}>
            <span style={{ fontSize: 11, color: 'var(--muted)' }}>Zahlen & Bedingungen aktualisieren sich automatisch mit den Daten.</span>
            <span style={{ display: 'flex', gap: 6 }}>
              {meta && <button onClick={entfernen} style={{ ...btn, color: 'var(--amp-r)' }}>Löschen</button>}
              <button onClick={() => setEdit(false)} style={btn}>Abbrechen</button>
              <button onClick={speichern} style={{ ...btn, border: 'none', background: 'var(--accent)', color: '#fff', fontWeight: 600 }}>Speichern</button>
            </span>
          </div>
        </div>
      )}
    </div>
  )
}

/** Geschützte KPI (Object-Level-Security greift). */
export function KpiGesperrt({ kpiId }) {
  const k = KPI[kpiId]
  return (
    <div style={{ background: 'var(--panel)', border: '1px dashed var(--line)', borderRadius: 'var(--radius)',
      padding: 14, minWidth: 150, flex: '1 1 0', color: 'var(--muted)' }}>
      <div className="mono" style={{ fontSize: 11, textTransform: 'uppercase' }}>{k?.name}</div>
      <div style={{ fontSize: 13, marginTop: 10 }}>🔒 Keine Berechtigung</div>
      <div style={{ fontSize: 11, marginTop: 4 }}>nur {k?.security?.join(' / ')}</div>
    </div>
  )
}

export function DetailTabelle({ daten, onZeileKlick, spaltenWahl = false }) {
  const alle = daten?.spalten || []
  const key = 'tree:' + (daten?.titel || 'tabelle')
  const [sichtbar, setSichtbar] = useState(() => {
    const g = ladeLetzte(key), gv = g && g.filter((l) => alle.includes(l))
    return new Set(gv && gv.length ? gv : alle)
  })
  const [panelAuf, setPanelAuf] = useState(false)
  const [, setBmTick] = useState(0)
  useEffect(() => { if (spaltenWahl) merkeLetzte(key, [...sichtbar]) }, [key, sichtbar, spaltenWahl])
  const zeilen = daten?.zeilen || []
  // Virtualisierung greift erst ab vielen Zeilen; kleine Tabellen bleiben unverändert.
  const f = useFenster({ anzahl: zeilen.length })
  if (!daten) return <div style={{ color: 'var(--muted)' }}>Keine Detaildaten.</div>

  // Sichtbare Spalten als Original-Indizes (Reihenfolge/Ausrichtung bleiben erhalten).
  const aktiv = spaltenWahl ? alle.map((l, i) => i).filter((i) => sichtbar.has(alle[i])) : alle.map((l, i) => i)
  const spaltenZahl = aktiv.length

  const zeile = (z, ri) => (
    <tr key={ri} onClick={onZeileKlick ? () => onZeileKlick(ri) : undefined}
      style={onZeileKlick ? { cursor: 'pointer' } : undefined}
      onMouseEnter={onZeileKlick ? (e) => e.currentTarget.style.background = 'var(--accent-soft)' : undefined}
      onMouseLeave={onZeileKlick ? (e) => e.currentTarget.style.background = 'transparent' : undefined}>
      {aktiv.map((oi, di) => (
        <td key={di} className={oi === 0 ? '' : 'mono'} style={{ textAlign: oi === 0 ? 'left' : 'right',
          padding: '8px 14px', borderBottom: '1px solid var(--line)',
          ...(f.aktiv ? { height: f.zeilenHoehe, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: 320 } : null) }}>{z[oi]}</td>
      ))}</tr>
  )

  const kopf = (
    <thead><tr>{aktiv.map((oi, di) => (
      <th key={di} style={{ textAlign: oi === 0 ? 'left' : 'right', padding: '8px 14px', color: 'var(--muted)',
        fontWeight: 500, fontSize: 11, textTransform: 'uppercase', borderBottom: '1px solid var(--line)',
        ...(f.aktiv ? { position: 'sticky', top: 0, background: 'var(--panel)', zIndex: 1 } : null) }}>{alle[oi]}</th>))}</tr></thead>
  )

  // Spalten-/Bookmark-Steuerung (nur wenn spaltenWahl aktiv und mehr als eine Spalte).
  const wahlAn = spaltenWahl && alle.length > 1
  const bookmarks = [{ id: 'voll', name: 'Vollansicht', sichtbar: alle, system: true }, ...ladeBookmarks(key)]
  const gleich = (arr) => arr.length === sichtbar.size && arr.every((l) => sichtbar.has(l))
  const toggleSp = (l) => setSichtbar((s) => { const n = new Set(s); n.has(l) ? n.delete(l) : n.add(l); if (n.size === 0) n.add(l); return n })
  const chip = { fontSize: 12, padding: '4px 9px', borderRadius: 999, cursor: 'pointer' }
  const werkzeug = wahlAn ? (
    <button onClick={() => setPanelAuf((v) => !v)} title="Spalten ein-/ausblenden & Ansichten"
      style={{ border: `1px solid ${panelAuf ? 'var(--accent)' : 'var(--line)'}`, background: 'var(--panel)', color: panelAuf ? 'var(--accent)' : 'var(--ink)', borderRadius: 'var(--radius-sm)', padding: '4px 10px', cursor: 'pointer', fontSize: 12, fontWeight: 600 }}>
      🔖 Spalten ({spaltenZahl}/{alle.length})
    </button>
  ) : null
  const panel = wahlAn && panelAuf ? (
    <div className="no-print" style={{ padding: '10px 14px', borderBottom: '1px solid var(--line)', background: 'var(--bg)' }}>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 8 }}>
        {bookmarks.map((b) => {
          const an = gleich(b.sichtbar)
          return (
            <span key={b.id} style={{ ...chip, display: 'inline-flex', alignItems: 'center', gap: 5, paddingRight: b.system ? 9 : 5, border: `1px solid ${an ? 'var(--accent)' : 'var(--line)'}`, background: an ? 'var(--accent-soft)' : 'var(--panel)', color: an ? 'var(--accent)' : 'var(--ink)' }}>
              <span onClick={() => setSichtbar(new Set(b.sichtbar.filter((l) => alle.includes(l))))}>{b.system ? '' : '🔖 '}{b.name}</span>
              {!b.system && <button onClick={() => { loescheBookmark(key, b.id); setBmTick((t) => t + 1) }} style={{ border: 'none', background: 'none', cursor: 'pointer', color: 'var(--muted)' }}>×</button>}
            </span>
          )
        })}
        <button onClick={() => { const n = prompt('Name für diese Ansicht (Bookmark):'); if (n && n.trim()) { addBookmark(key, n, [...sichtbar]); setBmTick((t) => t + 1) } }}
          style={{ ...chip, border: '1px dashed var(--line)', background: 'var(--panel)' }}>＋ Ansicht speichern</button>
      </div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
        {alle.map((l) => { const an = sichtbar.has(l); return (
          <button key={l} onClick={() => toggleSp(l)} style={{ ...chip, border: `1px solid ${an ? 'var(--accent)' : 'var(--line)'}`, background: an ? 'var(--accent-soft)' : 'var(--panel)', color: an ? 'var(--accent)' : 'var(--muted)' }}>{an ? '✓ ' : '＋ '}{l}</button>
        ) })}
      </div>
    </div>
  ) : null

  // Kleine Tabelle: unverändertes Verhalten (volle Liste, frei wachsend).
  if (!f.aktiv) {
    return (
      <div className="tabelle-scroll" style={{ background: 'var(--panel)', border: '1px solid var(--line)', borderRadius: 'var(--radius)', overflow: 'auto' }}>
        <div style={{ padding: '10px 14px', borderBottom: panel ? 'none' : '1px solid var(--line)', fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
          <span>{daten.titel}</span>{werkzeug}
        </div>
        {panel}
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13, minWidth: 480 }}>
          {kopf}<tbody>{zeilen.map(zeile)}</tbody>
        </table>
      </div>
    )
  }

  // Große Tabelle: nur sichtbare Zeilen rendern, Höhe über Platzhalterzeilen halten.
  return (
    <div style={{ background: 'var(--panel)', border: '1px solid var(--line)', borderRadius: 'var(--radius)' }}>
      <div style={{ padding: '10px 14px', borderBottom: panel ? 'none' : '1px solid var(--line)', fontWeight: 600, display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12 }}>
        <span>{daten.titel}</span>
        <span style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          {werkzeug}
          <span className="mono" style={{ fontSize: 11, color: 'var(--muted)' }}>{zeilen.length.toLocaleString('de-DE')} Zeilen · virtualisiert</span>
        </span>
      </div>
      {panel}
      <div ref={f.refContainer} onScroll={f.onScroll} style={{ maxHeight: f.hoehe, overflow: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13, minWidth: 480 }}>
          {kopf}
          <tbody>
            {f.vorHoehe > 0 && <tr style={{ height: f.vorHoehe }}><td colSpan={spaltenZahl} style={{ padding: 0, border: 'none' }} /></tr>}
            {zeilen.slice(f.start, f.ende).map((z, i) => zeile(z, f.start + i))}
            {f.nachHoehe > 0 && <tr style={{ height: f.nachHoehe }}><td colSpan={spaltenZahl} style={{ padding: 0, border: 'none' }} /></tr>}
          </tbody>
        </table>
      </div>
    </div>
  )
}

/** Mini-Sparkline für die Historisierung (Ebene 5). */
export function Sparkline({ reihe, richtung = 'hoch_gut', w = 220, h = 56 }) {
  // Nur Punkte mit Wert: sonst rechnet (null - min) durch JS-Coercion zu (0 - min)
  // und der Punkt springt aus dem Diagramm (falsche Trendlinie bei Lücken).
  const punkte = reihe.filter((r) => r.wert != null)
  const werte = punkte.map((r) => r.wert)
  if (werte.length < 2) return <div style={{ color: 'var(--muted)' }}>Zu wenig Historie.</div>
  const min = Math.min(...werte), max = Math.max(...werte), span = max - min || 1
  const pts = punkte.map((r, i) => {
    const x = (i / (punkte.length - 1)) * (w - 8) + 4
    const y = h - 4 - ((r.wert - min) / span) * (h - 12)
    return [x, y]
  })
  const d = pts.map((p, i) => (i ? 'L' : 'M') + p[0].toFixed(1) + ' ' + p[1].toFixed(1)).join(' ')
  const t = trendAusHistorie(werte, richtung)
  const farbe = t.istGut ? 'var(--amp-g)' : 'var(--amp-r)'
  return (
    <svg width={w} height={h} style={{ overflow: 'visible' }}>
      <path d={d} fill="none" stroke={farbe} strokeWidth="2" />
      {pts.map((p, i) => <circle key={i} cx={p[0]} cy={p[1]} r="2.5" fill={farbe} />)}
    </svg>
  )
}
