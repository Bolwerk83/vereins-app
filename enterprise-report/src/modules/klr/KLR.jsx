// =========================================================================
//  KOSTEN- UND LEISTUNGSRECHNUNG (KLR) — modellgetreu (Abb. 2.3) und für
//  Nicht-Kaufleute erklärt. Stufen-Fluss Kostenarten → Kostenstellen →
//  Kostenträger → Leistung → Ergebnis, je mit Klartext, Kennzahlen und
//  Datentabelle. Plus „Was sind Kosten?", Aufgaben und Zwecke.
// =========================================================================
import React, { useState, useEffect } from 'react'
import { KOSTEN_BEGRIFF, KOSTENARTEN, AUFGABEN, ZWECKE, STUFEN, stufe, ABGRENZUNG } from '../../core/klr.js'
import { ladeDatensatz } from '../../core/datensaetze.js'
import { KPI } from '../../core/kpiRegistry.js'
import { ampelStatus } from '../../core/ampel.js'
import { darfKpi } from '../../core/rbac.js'
import { formatWert, AMPEL_FARBE } from '../../design/theme.js'
import { DetailTabelle } from '../../components/ui.jsx'
import { useKpiDef } from '../kennzahlen/KpiDefContext.jsx'

const card = { background: 'var(--panel)', border: '1px solid var(--line)', borderRadius: 'var(--radius)', boxShadow: 'var(--shadow)' }
const cap = { fontSize: 11, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '.03em', fontWeight: 700 }

function StufenTabelle({ datensatz }) {
  const [daten, setDaten] = useState(null)
  const [fehler, setFehler] = useState(false)
  useEffect(() => { let on = true; setDaten(null); setFehler(false)
    ladeDatensatz(datensatz.kind, datensatz.key).then((d) => on && setDaten(d)).catch(() => on && setFehler(true))
    return () => { on = false }
  }, [datensatz.kind, datensatz.key])
  if (fehler) return <div style={{ color: 'var(--muted)', fontSize: 13 }}>Datensatz nicht verfügbar.</div>
  if (!daten) return <div style={{ color: 'var(--muted)', fontSize: 13 }}>Lädt …</div>
  return <DetailTabelle daten={daten} />
}

function KpiChip({ id, werte, rolle, onOpen }) {
  const k = KPI[id]; if (!k) return null
  const darf = darfKpi(rolle, k)
  const st = darf ? ampelStatus({ wert: werte[id], ziel: k.ziel, richtung: k.richtung, warn: k.warn }) : 'n'
  return (
    <button onClick={() => onOpen?.(id)} title="Definition öffnen"
      style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '5px 11px', borderRadius: 999, cursor: 'pointer',
        border: '1px solid var(--line)', background: 'var(--bg)', fontSize: 13 }}>
      <span style={{ width: 8, height: 8, borderRadius: '50%', background: AMPEL_FARBE[st] }} />
      {k.name} <span className="mono" style={{ color: 'var(--muted)' }}>{darf ? formatWert(werte[id], k.einheit) : '🔒'}</span>
    </button>
  )
}

export default function KLR({ werte = {}, rolle, periode, onGeh }) {
  const def = useKpiDef()
  const [aktiv, setAktiv] = useState('kostenarten')
  const s = stufe(aktiv)
  const tag = (farbe) => ({ fontSize: 11.5, color: farbe, border: `1px solid ${farbe}`, borderRadius: 6, padding: '2px 7px', background: 'var(--panel)' })

  return (
    <div style={{ maxWidth: '100%', margin: '0 auto' }}>
      <div style={{ marginBottom: 14 }}>
        <h2 style={{ margin: '0 0 4px' }}>Kosten- und Leistungsrechnung <span className="mono" style={{ fontSize: 12, color: 'var(--muted)' }}>· {periode}</span></h2>
        <div style={{ color: 'var(--muted)', fontSize: 13, maxWidth: 780 }}>
          Wie verdient das Unternehmen operativ? Die KLR sammelt die <b>Kosten</b>, erfasst die <b>Leistungen</b> und
          rechnet beides bis zum <b>Betriebsergebnis</b> zusammen — Schritt für Schritt, auch ohne kaufmännisches Vorwissen.
        </div>
      </div>

      {/* Was sind Kosten? — Grundverständnis */}
      <div style={{ ...card, padding: 16, marginBottom: 14 }}>
        <div style={{ ...cap, marginBottom: 10 }}>Was sind „Kosten"? — in drei Schritten</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 10 }}>
          {KOSTEN_BEGRIFF.map((k, i) => (
            <div key={k.titel} style={{ border: '1px solid var(--line)', borderRadius: 'var(--radius-sm)', padding: 12 }}>
              <div style={{ fontWeight: 700 }}><span style={{ color: 'var(--accent)' }}>{i + 1}.</span> {k.titel}</div>
              <div style={{ fontSize: 13, color: 'var(--slate)', marginTop: 4 }}>{k.laie}</div>
            </div>
          ))}
        </div>
        <div style={{ fontSize: 13, marginTop: 10, padding: '8px 11px', background: 'var(--accent-soft)', borderRadius: 'var(--radius-sm)' }}>
          <b>Merksatz:</b> Kosten = bewerteter, leistungsbedingter Güterverbrauch. <b>Leistung</b> = bewertetes Ergebnis der Tätigkeit. <b>Ergebnis</b> = Leistung − Kosten.
        </div>
      </div>

      {/* Abgrenzung Aufwand ↔ Kosten */}
      <div style={{ ...card, padding: 16, marginBottom: 14 }}>
        <div style={{ ...cap, marginBottom: 6 }}>Aufwand ↔ Kosten: die Abgrenzung</div>
        <div style={{ fontSize: 13, color: 'var(--slate)', marginBottom: 12 }}>{ABGRENZUNG.einleitung}</div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }} className="raster-2">
          {/* Aufwandsseite */}
          <div style={{ border: '1px solid var(--line)', borderRadius: 'var(--radius-sm)', padding: 12 }}>
            <div style={{ fontWeight: 700, marginBottom: 8 }}>Aufwand (Buchhaltung / GuV)</div>
            {ABGRENZUNG.aufwand.map((a) => (
              <div key={a.id} style={{ marginBottom: 8 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span style={tag(a.kosten ? 'var(--amp-g)' : 'var(--amp-a)')}>{a.kosten ? 'ist Kosten' : 'kein Kosten'}</span>
                  <span style={{ fontWeight: 600, fontSize: 13.5 }}>{a.name}</span>
                </div>
                <div style={{ fontSize: 12.5, color: 'var(--muted)', marginTop: 2 }}>{a.laie}</div>
                {a.arten.map((x) => (
                  <div key={x.name} style={{ fontSize: 12, marginLeft: 10, marginTop: 3 }}>• <b>{x.name}</b> — {x.laie}</div>
                ))}
              </div>
            ))}
          </div>
          {/* Kostenseite */}
          <div style={{ border: '1px solid var(--line)', borderRadius: 'var(--radius-sm)', padding: 12 }}>
            <div style={{ fontWeight: 700, marginBottom: 8 }}>Kosten (KLR)</div>
            <div style={{ marginBottom: 8 }}>
              <span style={tag('var(--amp-g)')}>Grundkosten</span>
              <span style={{ fontSize: 12.5, color: 'var(--muted)', marginLeft: 6 }}>= der aufwandsgleiche Normalfall.</span>
            </div>
            {ABGRENZUNG.kalkulatorisch.map((k) => (
              <div key={k.id} style={{ marginBottom: 8 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span style={tag('var(--accent)')}>kalkulatorisch</span>
                  <span style={{ fontWeight: 600, fontSize: 13.5 }}>{k.name}</span>
                </div>
                <div style={{ fontSize: 12.5, color: 'var(--muted)', marginTop: 2 }}>{k.laie}</div>
                {k.beispiele.map((b) => <div key={b} style={{ fontSize: 12, marginLeft: 10, marginTop: 3 }}>• {b}</div>)}
              </div>
            ))}
            {onGeh && <button onClick={() => onGeh('kalkulatorik')} style={{ marginTop: 4, fontSize: 12.5, cursor: 'pointer',
              border: 'none', background: 'var(--accent)', color: '#fff', borderRadius: 'var(--radius-sm)', padding: '7px 12px', fontWeight: 600 }}>
              → Kalkulatorische Kosten aufbauen (mit Vorschlägen)</button>}
          </div>
        </div>
        <div style={{ fontSize: 12, color: 'var(--muted)', margin: '10px 0 8px' }}>
          <b>Formel:</b> Aufwand = neutraler Aufwand + Grundkosten · Kosten = Grundkosten + kalkulatorische Kosten. {ABGRENZUNG.leistung}
        </div>
        <StufenTabelle datensatz={ABGRENZUNG.datensatz} />
      </div>

      {/* Stufen-Fluss (Abb. 2.3) */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap', marginBottom: 14 }}>
        {STUFEN.map((x, i) => (
          <React.Fragment key={x.id}>
            {i > 0 && <span style={{ color: 'var(--muted)' }}>→</span>}
            <button onClick={() => setAktiv(x.id)} style={{ padding: '8px 13px', borderRadius: 'var(--radius-sm)', cursor: 'pointer', fontSize: 13, fontWeight: 600,
              border: `1px solid ${aktiv === x.id ? 'var(--accent)' : 'var(--line)'}`, background: aktiv === x.id ? 'var(--accent)' : 'var(--panel)', color: aktiv === x.id ? '#fff' : 'var(--ink)' }}>
              {x.nr}. {x.name}
            </button>
          </React.Fragment>
        ))}
      </div>

      {/* Aktive Stufe */}
      <div style={{ ...card, padding: 16, marginBottom: 14 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', flexWrap: 'wrap', gap: 8 }}>
          <h3 style={{ margin: 0, fontSize: 17 }}>{s.name}</h3>
          <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--accent)' }}>{s.frage}</span>
        </div>
        <div style={{ fontSize: 13.5, color: 'var(--slate)', marginTop: 6 }}>{s.laie}</div>

        {s.untermodule && (
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginTop: 10 }}>
            {s.untermodule.map((u) => (
              <div key={u.name} style={{ flex: 1, minWidth: 220, border: '1px dashed var(--line)', borderRadius: 'var(--radius-sm)', padding: 10 }}>
                <div style={{ fontWeight: 600, fontSize: 13 }}>{u.name}</div>
                <div style={{ fontSize: 12.5, color: 'var(--muted)', marginTop: 2 }}>{u.laie}</div>
              </div>
            ))}
          </div>
        )}

        <div style={{ ...cap, margin: '14px 0 6px' }}>Kennzahlen</div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
          {s.kpis.map((id) => <KpiChip key={id} id={id} werte={werte} rolle={rolle} onOpen={def?.oeffne} />)}
        </div>

        <div style={{ ...cap, margin: '14px 0 6px' }}>Datengrundlage</div>
        <StufenTabelle datensatz={s.datensatz} />
        {aktiv === 'kostenarten' && onGeh && (
          <button onClick={() => onGeh('kostenarten')} style={{ marginTop: 10, fontSize: 12.5, cursor: 'pointer', border: 'none', background: 'var(--accent)', color: '#fff', borderRadius: 'var(--radius-sm)', padding: '7px 12px', fontWeight: 600 }}>
            → Kostenartenrechnung im Detail (mehrdimensional)
          </button>
        )}
        {aktiv === 'kostenstellen' && onGeh && (
          <button onClick={() => onGeh('kostenstellen')} style={{ marginTop: 10, fontSize: 12.5, cursor: 'pointer', border: 'none', background: 'var(--accent)', color: '#fff', borderRadius: 'var(--radius-sm)', padding: '7px 12px', fontWeight: 600 }}>
            → Kostenstellenrechnung (BAB) im Detail
          </button>
        )}
        {aktiv === 'ergebnis' && onGeh && (
          <button onClick={() => onGeh('ergebnis')} style={{ marginTop: 10, fontSize: 12.5, cursor: 'pointer', border: 'none', background: 'var(--accent)', color: '#fff', borderRadius: 'var(--radius-sm)', padding: '7px 12px', fontWeight: 600 }}>
            → Ergebnisrechnung (GuV / T-Konto)
          </button>
        )}
        {aktiv === 'kostentraeger' && onGeh && (
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 10 }}>
            <button onClick={() => onGeh('kalkulation')} style={{ fontSize: 12.5, cursor: 'pointer', border: 'none', background: 'var(--accent)', color: '#fff', borderRadius: 'var(--radius-sm)', padding: '7px 12px', fontWeight: 600 }}>
              → Kostenträgerrechnung &amp; Kalkulation
            </button>
            <button onClick={() => onGeh('einzelgemein')} style={{ fontSize: 12.5, cursor: 'pointer', border: '1px solid var(--accent)', background: 'var(--panel)', color: 'var(--accent)', borderRadius: 'var(--radius-sm)', padding: '7px 12px', fontWeight: 600 }}>
              Einzel-/Gemeinkosten
            </button>
          </div>
        )}
      </div>

      {/* Aufgaben & Zwecke + Kostenarten */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 14 }} className="raster-2">
        <div style={{ ...card, padding: 16 }}>
          <div style={{ ...cap, marginBottom: 8 }}>Aufgaben der KLR — und wo im Reporting</div>
          {AUFGABEN.map((a) => {
            const ziel = stufe(a.modul)
            return (
              <div key={a.aufgabe} style={{ display: 'flex', justifyContent: 'space-between', gap: 8, padding: '7px 0', borderBottom: '1px solid var(--line)' }}>
                <div>
                  <div style={{ fontWeight: 600, fontSize: 13.5 }}>{a.aufgabe}</div>
                  <div style={{ fontSize: 12, color: 'var(--muted)' }}>{a.erklaerung}</div>
                </div>
                <button onClick={() => ziel && setAktiv(ziel.id)} style={{ alignSelf: 'center', whiteSpace: 'nowrap', fontSize: 12, cursor: 'pointer',
                  border: '1px solid var(--accent)', color: 'var(--accent)', background: 'var(--panel)', borderRadius: 999, padding: '3px 10px' }}>
                  → {ziel?.name}
                </button>
              </div>
            )
          })}
        </div>
        <div style={{ ...card, padding: 16 }}>
          <div style={{ ...cap, marginBottom: 8 }}>Wozu dient die Kostenrechnung?</div>
          {ZWECKE.map((z) => (
            <div key={z.titel} style={{ padding: '7px 0', borderBottom: '1px solid var(--line)' }}>
              <div style={{ fontWeight: 600, fontSize: 13.5 }}>{z.titel}</div>
              <div style={{ fontSize: 12.5, color: 'var(--muted)' }}>{z.laie}</div>
            </div>
          ))}
        </div>
      </div>

      <div style={{ ...card, padding: 16 }}>
        <div style={{ ...cap, marginBottom: 8 }}>Kostenarten — welche Art von Verbrauch?</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 8 }}>
          {KOSTENARTEN.map((k) => (
            <div key={k.id} style={{ border: '1px solid var(--line)', borderRadius: 'var(--radius-sm)', padding: '8px 11px' }}>
              <div style={{ fontWeight: 600, fontSize: 13 }}>{k.name}</div>
              <div style={{ fontSize: 12, color: 'var(--muted)' }}>{k.laie}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
