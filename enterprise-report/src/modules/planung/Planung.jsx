// =========================================================================
//  PLANUNG — Budget / Forecast / Szenarien (eigener Bereich).
//  Pläne anlegen/kopieren · Top-Down ODER Bottom-Up · Menge ↔ Betrag ·
//  Schwund-Aufschlag · Produktion ohne Umsatz · Liquiditätsvorschau.
// =========================================================================
import React, { useState } from 'react'
import {
  PLAN_PRODUKTE, PLAN_TYPEN, AE_UMSATZ_FAKTOR, VERTEILSCHLUESSEL, verteilschluesselListe, ladePlaene, planVon, neuerPlan,
  kopierePlan, speicherePlan, loeschePlan, rechnePlan, topDownVerteilung, mengeAusBetrag, liquiditaet, monatsVerteilung, vergleiche, terminplanung,
  VORSCHLAG_MODI, vorschlagDetails, planVorschlag
} from '../../core/planung.js'
import { EBENEN, verteile as verteileArtikel, flach as flachArtikel } from '../../core/artikelHierarchie.js'
import PlanungWizard from './PlanungWizard.jsx'
import Beschaffung from './Beschaffung.jsx'

const card = { background: 'var(--panel)', border: '1px solid var(--line)', borderRadius: 'var(--radius)', boxShadow: 'var(--shadow)' }
const cap = { fontSize: 11, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '.03em', fontWeight: 700 }
const inp = { padding: '6px 8px', border: '1px solid var(--line)', borderRadius: 'var(--radius-sm)', font: 'inherit', fontSize: 13 }
const numInp = { ...inp, width: 100, textAlign: 'right' }
const eur0 = (v) => Math.round(v).toLocaleString('de-DE')
const n0 = (v) => Math.round(v).toLocaleString('de-DE')
const th = (al) => ({ textAlign: al, padding: '6px 9px', borderBottom: '2px solid var(--line)', fontSize: 10, color: 'var(--muted)', textTransform: 'uppercase' })
const td = (al, bold) => ({ textAlign: al, padding: '6px 9px', borderBottom: '1px solid var(--line)', fontWeight: bold ? 700 : 400 })
const MON = ['Jan', 'Feb', 'Mär', 'Apr', 'Mai', 'Jun', 'Jul', 'Aug', 'Sep', 'Okt', 'Nov', 'Dez']

export default function Planung({ onGeh }) {
  const [ptab, setPtab] = useState('wizard')
  const [plaene, setPlaene] = useState(() => ladePlaene())
  const [aktivId, setAktivId] = useState(() => ladePlaene()[0]?.id)
  const [zielUmsatz, setZielUmsatz] = useState('')
  const [maxTiefe, setMaxTiefe] = useState(2) // bis zu welcher Hierarchie-Ebene anzeigen
  const [vglIds, setVglIds] = useState([]) // ausgewählte Szenarien für den Vergleich
  const [puffer, setPuffer] = useState(30) // Sicherheits-Puffer (Tage) für die Termin-/Beschaffungssicht
  const [vModus, setVModus] = useState('wachstum') // Vorschlags-Modus
  const [vWachstum, setVWachstum] = useState(5)     // Wachstum % für den Vorschlag
  const [tick, setTick] = useState(0)
  const plan = planVon(aktivId) || plaene[0]
  const refresh = () => { setPlaene(ladePlaene()); setTick((t) => t + 1) }

  if (!plan) return <div style={{ padding: 20 }}>Kein Plan vorhanden.</div>
  const erg = rechnePlan(plan)
  const mv = monatsVerteilung(plan)
  const mvMax = Math.max(1, ...mv.map((m) => m.umsatz))
  const liq = liquiditaet(plan)
  const liqEnde = liq[11]?.kumuliert || 0
  const liqMin = Math.min(...liq.map((m) => m.kumuliert))

  const speichere = (p) => { speicherePlan(p); refresh() }
  const setFeld = (feld, val) => speichere({ ...plan, [feld]: val })
  const setZeile = (prodId, patch) => speichere({ ...plan, zeilen: { ...plan.zeilen, [prodId]: { ...plan.zeilen?.[prodId], ...patch } } })

  const anlegen = () => { const name = prompt('Name des neuen Plans:', 'Neuer Plan'); if (name) { const p = neuerPlan(name); setAktivId(p.id); refresh() } }
  const kopieren = () => { const name = prompt('Kopie benennen:', `${plan.name} (Kopie)`); if (name) { const p = kopierePlan(plan.id, name); setAktivId(p.id); refresh() } }
  const loeschen = () => { if (plaene.length > 1 && confirm(`Plan „${plan.name}" löschen?`)) { loeschePlan(plan.id); const rest = ladePlaene(); setAktivId(rest[0]?.id); refresh() } }
  const umbenennen = () => { const name = prompt('Plan umbenennen:', plan.name); if (name) setFeld('name', name) }
  const verteileTopDown = () => { const z = Number(zielUmsatz); if (z > 0) { speichere(topDownVerteilung(plan, z)); setZielUmsatz('') } }
  const vorschlagOpts = { modus: vModus, wachstumPct: vWachstum }
  const vorschau = vorschlagDetails(vorschlagOpts)
  const vorschauUmsatz = vorschau.reduce((n, x) => n + x.umsatz, 0)
  const uebernehmeVorschlag = () => { if (confirm('Vorschlagswerte in den aktuellen Plan übernehmen? Die bisherigen Mengen werden überschrieben.')) speichere(planVorschlag(plan, vorschlagOpts)) }

  return (
    <div style={{ maxWidth: '100%', margin: '0 auto' }}>
      <div style={{ marginBottom: 14 }}>
        <h2 style={{ margin: '0 0 4px' }}>Planung — Budget, Forecast & Szenarien</h2>
        <div style={{ color: 'var(--muted)', fontSize: 13, maxWidth: 820 }}>
          Damit alle dieselbe Vorstellung von den Werten haben: Mengen <b>bottom-up</b> je Produkt planen oder ein Ziel
          <b> top-down</b> herunterbrechen. Eingabe wahlweise als Menge oder Betrag. Schwund und Produktion ohne Umsatz
          (Sponsoren/Ausstellung) sind berücksichtigt — inklusive Liquiditätsvorschau.
        </div>
      </div>

      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 14 }}>
        {[['wizard', '🧭 Einfache Planung (Wizard)'], ['beschaffung', '📦 Beschaffung (Rückwärtsterminierung)'], ['detail', 'Detailplanung (Produkte)']].map(([id, n]) => (
          <button key={id} onClick={() => setPtab(id)} style={{ padding: '6px 12px', borderRadius: 999, fontSize: 13, cursor: 'pointer', fontWeight: 600, border: `1px solid ${ptab === id ? 'var(--accent)' : 'var(--line)'}`, background: ptab === id ? 'var(--accent)' : 'var(--panel)', color: ptab === id ? '#fff' : 'var(--ink)' }}>{n}</button>
        ))}
      </div>

      {ptab === 'wizard' && <PlanungWizard />}
      {ptab === 'beschaffung' && <Beschaffung />}
      {ptab === 'detail' && <>

      {/* Plan-Verwaltung */}
      <div style={{ ...card, padding: 12, marginBottom: 14, display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
        <span style={cap}>Plan</span>
        <select value={plan.id} onChange={(e) => setAktivId(e.target.value)} style={{ ...inp, fontWeight: 600, minWidth: 180 }}>
          {plaene.map((p) => <option key={p.id} value={p.id}>{p.name} ({PLAN_TYPEN.find((t) => t.id === p.typ)?.name || p.typ})</option>)}
        </select>
        <button onClick={anlegen} style={btnGhost}>＋ Neu</button>
        <button onClick={kopieren} style={btnGhost} title="Diesen Plan als Vorlage kopieren">⧉ Kopieren von</button>
        <button onClick={umbenennen} style={btnGhost}>✎ Umbenennen</button>
        <button onClick={loeschen} style={{ ...btnGhost, color: 'var(--amp-r)' }}>🗑 Löschen</button>
        <span style={{ width: 1, height: 22, background: 'var(--line)' }} />
        <label style={lbl}>Typ <select value={plan.typ} onChange={(e) => setFeld('typ', e.target.value)} style={{ ...inp, marginLeft: 4 }}>{PLAN_TYPEN.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}</select></label>
        <label style={lbl}>Jahr <input type="number" value={plan.jahr} onChange={(e) => setFeld('jahr', Number(e.target.value))} style={{ ...inp, width: 80, marginLeft: 4 }} /></label>
        <label style={lbl} title="Mehrbedarf, weil Teile/Räder kaputtgehen oder verschwinden">Schwund % <input type="number" step="0.5" value={plan.schwundPct} onChange={(e) => setFeld('schwundPct', Number(e.target.value))} style={{ ...inp, width: 70, marginLeft: 4 }} /></label>
        <label style={lbl} title="Verteilungsschlüssel: wie der Jahreswert auf die Monate gesplasht wird (Saisongeschäft berücksichtigen)">Verteilung
          <select value={plan.schluessel || 'gleich'} onChange={(e) => setFeld('schluessel', e.target.value)} style={{ ...inp, marginLeft: 4 }}>
            {verteilschluesselListe().map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
          </select>
        </label>
      </div>

      {/* Ergebnis-KPIs */}
      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 14 }}>
        <Kpi label="Umsatzerlöse (Plan)" wert={`${eur0(erg.umsatz)} €`} />
        <Kpi label="Wareneinsatz" wert={`${eur0(erg.wareneinsatz)} €`} sub={`inkl. ${plan.schwundPct}% Schwund`} farbe="var(--amp-a)" />
        <Kpi label="Deckungsbeitrag" wert={`${eur0(erg.db)} €`} sub={`DB-Quote ${erg.dbQuote} %`} farbe={erg.db >= 0 ? 'var(--amp-g)' : 'var(--amp-r)'} />
        <Kpi label="Nötiger Auftragseingang" wert={`${eur0(erg.ae)} €`} sub={`AE→Umsatz ${Math.round(AE_UMSATZ_FAKTOR * 100)} %`} />
        <Kpi label="Liquidität Jahresende" wert={`${eur0(liqEnde)} €`} sub={liqMin < 0 ? `Tief ${eur0(liqMin)} €` : 'durchgehend positiv'} farbe={liqMin < 0 ? 'var(--amp-r)' : 'var(--amp-g)'} />
      </div>

      {/* Top-Down */}
      <div style={{ ...card, padding: 12, marginBottom: 14, display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
        <span style={cap}>Top-Down</span>
        <span style={{ fontSize: 12.5, color: 'var(--muted)' }}>Ziel-Umsatz vorgeben → auf die Produkte herunterbrechen (über die aktuellen Anteile):</span>
        <input type="number" value={zielUmsatz} onChange={(e) => setZielUmsatz(e.target.value)} placeholder="z. B. 60000000" style={{ ...inp, width: 150 }} />
        <button onClick={verteileTopDown} style={btn}>↧ Verteilen</button>
        <span style={{ fontSize: 11.5, color: 'var(--muted)' }}>(Bottom-Up: einfach die Mengen unten direkt anpassen)</span>
      </div>

      {/* Planungsassistent — Vorschlagswerte aus dem Vorjahr */}
      <div style={{ ...card, padding: 14, marginBottom: 14, borderLeft: '4px solid var(--accent)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 10, flexWrap: 'wrap', marginBottom: 10 }}>
          <span style={{ ...cap, color: 'var(--accent)' }}>✨ Planungsassistent <span style={{ color: 'var(--muted)', fontWeight: 400, textTransform: 'none' }}>· Vorschlagswerte aus dem Vorjahr (ohne KI)</span></span>
          <span style={{ display: 'inline-flex', gap: 6, alignItems: 'center', flexWrap: 'wrap' }}>
            {VORSCHLAG_MODI.map((m) => (
              <button key={m.id} onClick={() => setVModus(m.id)} title={m.hinweis}
                style={{ padding: '4px 10px', borderRadius: 999, fontSize: 12, cursor: 'pointer', fontWeight: 600, border: `1px solid ${vModus === m.id ? 'var(--accent)' : 'var(--line)'}`, background: vModus === m.id ? 'var(--accent)' : 'var(--panel)', color: vModus === m.id ? '#fff' : 'var(--ink)' }}>{m.name}</button>
            ))}
            {vModus === 'wachstum' && (
              <label style={lbl} title="Gleichmäßiges Mengenwachstum gegenüber dem Vorjahr">Wachstum %
                <input type="number" step="1" value={vWachstum} onChange={(e) => setVWachstum(Number(e.target.value))} style={{ ...inp, width: 64, marginLeft: 4 }} />
              </label>
            )}
          </span>
        </div>
        <div style={{ fontSize: 12, color: 'var(--muted)', marginBottom: 8 }}>{VORSCHLAG_MODI.find((m) => m.id === vModus)?.hinweis} Der Verteilungsschlüssel wird auf <b>„Aus Vorjahr (echte Saison)"</b> gesetzt.</div>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12.5, minWidth: 560 }}>
            <thead><tr>
              <th style={th('left')}>Produkt</th><th style={th('right')}>Vorjahr (Menge)</th><th style={th('right')}>Trend</th>
              <th style={th('right')}>Vorschlag (Menge)</th><th style={th('right')}>Vorschlag Umsatz €</th>
            </tr></thead>
            <tbody>
              {vorschau.map((x) => (
                <tr key={x.prodId}>
                  <td style={td('left', true)}>{x.name}</td>
                  <td className="mono" style={td('right')}>{n0(x.vorjahrMenge)}</td>
                  <td className="mono" style={{ ...td('right'), color: x.wachstumPct >= 0 ? 'var(--amp-g)' : 'var(--amp-r)' }}>{x.wachstumPct >= 0 ? '+' : ''}{x.wachstumPct} %</td>
                  <td className="mono" style={td('right', true)}>{n0(x.menge)}</td>
                  <td className="mono" style={td('right')}>{eur0(x.umsatz)}</td>
                </tr>
              ))}
              <tr style={{ background: 'var(--bg)' }}>
                <td style={td('left', true)}>Gesamt</td><td /><td />
                <td /><td className="mono" style={td('right', true)}>{eur0(vorschauUmsatz)}</td>
              </tr>
            </tbody>
          </table>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 10, flexWrap: 'wrap', marginTop: 10 }}>
          <span style={{ fontSize: 11.5, color: 'var(--muted)' }}>Vorschau — wird erst beim Übernehmen in den Plan geschrieben (danach frei editierbar).</span>
          <button onClick={uebernehmeVorschlag} style={btn}>✓ Vorschlag in Plan übernehmen</button>
        </div>
      </div>

      {/* Plan-Tabelle (bidirektional Menge ↔ Betrag) */}
      <div style={{ ...card, padding: 16, overflowX: 'auto', marginBottom: 14 }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12.5, minWidth: 880 }}>
          <thead><tr>
            <th style={th('left')}>Produkt</th><th style={th('right')}>VK-Preis</th><th style={th('right')}>Menge (Absatz)</th>
            <th style={th('right')}>Umsatz €</th><th style={th('right')} title="Sponsoren/Ausstellung — Kosten ohne Umsatz">ohne Umsatz (Stk)</th>
            <th style={th('right')}>EK-Preis</th><th style={th('right')}>Wareneinsatz €</th><th style={th('right')}>DB €</th>
          </tr></thead>
          <tbody>
            {erg.zeilen.map((z) => (
              <tr key={z.prodId}>
                <td style={td('left', true)}>{z.name}</td>
                <td className="mono" style={td('right')}>{eur0(z.vkPreis)}</td>
                <td style={td('right')}>
                  <input type="number" value={z.menge} onChange={(e) => setZeile(z.prodId, { menge: Math.max(0, Number(e.target.value)) })} style={numInp} />
                </td>
                <td style={td('right')}>
                  <input type="number" value={z.umsatz} title="Betrag eingeben → Menge wird über den VK-Preis abgeleitet"
                    onChange={(e) => setZeile(z.prodId, { menge: mengeAusBetrag(z.prodId, Math.max(0, Number(e.target.value))) })} style={{ ...numInp, width: 120 }} />
                </td>
                <td style={td('right')}>
                  <input type="number" value={z.ohneUmsatz} onChange={(e) => setZeile(z.prodId, { ohneUmsatz: Math.max(0, Number(e.target.value)) })} style={{ ...numInp, width: 90 }} />
                </td>
                <td className="mono" style={td('right')}>{eur0(z.ekPreis)}</td>
                <td className="mono" style={td('right')}>{eur0(z.wareneinsatz)}</td>
                <td className="mono" style={{ ...td('right', true), color: z.db >= 0 ? 'var(--amp-g)' : 'var(--amp-r)' }}>{eur0(z.db)}</td>
              </tr>
            ))}
            <tr style={{ background: 'var(--bg)' }}>
              <td style={td('left', true)}>Gesamt</td><td /><td /><td className="mono" style={td('right', true)}>{eur0(erg.umsatz)}</td><td />
              <td /><td className="mono" style={td('right', true)}>{eur0(erg.wareneinsatz)}</td><td className="mono" style={td('right', true)}>{eur0(erg.db)}</td>
            </tr>
          </tbody>
        </table>
        <div style={{ fontSize: 12, color: 'var(--muted)', marginTop: 10 }}>
          <b>Menge ODER Umsatz</b> eingeben — das jeweils andere wird über den VK-Preis berechnet. <b>ohne Umsatz</b> = Sponsoren/
          Ausstellung/Muster (verursachen Wareneinsatz, aber keinen Umsatz). Wareneinsatz enthält den <b>Schwund-Aufschlag</b>.
        </div>
      </div>

      {/* Artikelverteilung über die Produkthierarchie */}
      {(() => {
        const baum = verteileArtikel(erg.umsatz)
        const knoten = flachArtikel(baum).filter((k) => k.tiefe <= maxTiefe)
        return (
          <div style={{ ...card, padding: 16, overflowX: 'auto', marginBottom: 14 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 8, marginBottom: 10 }}>
              <div style={cap}>Artikelverteilung — Plan-Umsatz über die Produkthierarchie</div>
              <label style={lbl}>bis Ebene
                <select value={maxTiefe} onChange={(e) => setMaxTiefe(Number(e.target.value))} style={{ ...inp, marginLeft: 4 }}>
                  {EBENEN.map((e, i) => <option key={i} value={i}>{e}</option>)}
                </select>
              </label>
            </div>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12.5, minWidth: 620 }}>
              <thead><tr><th style={th('left')}>Ebene / Knoten</th><th style={th('right')}>Anteil</th><th style={th('right')}>Plan-Umsatz €</th></tr></thead>
              <tbody>
                {knoten.map((k) => (
                  <tr key={k.id}>
                    <td style={{ ...td('left'), paddingLeft: 9 + k.tiefe * 18, fontWeight: k.tiefe === 0 ? 700 : 400 }}>
                      <span style={{ fontSize: 10, color: 'var(--muted)', marginRight: 6 }}>{EBENEN[k.tiefe]?.slice(0, 3)}</span>{k.name}
                    </td>
                    <td className="mono" style={td('right')}>{k.anteilPct} %</td>
                    <td className="mono" style={td('right', k.tiefe === 0)}>{eur0(k.wert)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div style={{ fontSize: 12, color: 'var(--muted)', marginTop: 10 }}>
              Der Plan-Umsatz wird über die <b>Anteils-Schlüssel</b> der Hierarchie verteilt:
              Warenbereich → Produktobergruppe → Produktgruppe → Modell → Produkt → Variante → Artikel (SKU).
              So lässt sich ein Top-Down-Ziel bis auf SKU-Ebene herunterbrechen (jede Ebene summiert sich auf den Gesamtwert).
            </div>
          </div>
        )
      })()}

      {/* Monatsverteilung („Splash" über den Verteilungsschlüssel) */}
      <div style={{ ...card, padding: 16, overflowX: 'auto', marginBottom: 14 }}>
        <div style={{ ...cap, marginBottom: 10 }}>Monatsverteilung (Splash) — Schlüssel „{verteilschluesselListe().find((s) => s.id === (plan.schluessel || 'gleich'))?.name}"</div>
        <div style={{ display: 'flex', alignItems: 'flex-end', gap: 8, height: 90, padding: '0 4px' }}>
          {mv.map((m) => (
            <div key={m.monat} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
              <span className="mono" style={{ fontSize: 9.5, color: 'var(--muted)' }}>{eur0(m.umsatz / 1000)}k</span>
              <div title={`${MON[m.monat - 1]}: Umsatz ${eur0(m.umsatz)} € · DB ${eur0(m.db)} €`}
                style={{ width: '100%', maxWidth: 42, height: `${Math.max(2, m.umsatz / mvMax * 60)}px`, background: 'var(--accent)', borderRadius: '3px 3px 0 0' }} />
              <span style={{ fontSize: 10, color: 'var(--muted)' }}>{MON[m.monat - 1]}</span>
            </div>
          ))}
        </div>
        <div style={{ fontSize: 12, color: 'var(--muted)', marginTop: 10 }}>
          Der Jahres-Plan wird über den Verteilungsschlüssel auf die Monate verteilt („splashen"). Für das
          <b> Saisongeschäft</b> z. B. „Saison (Bike-Frühjahr/Sommer)" wählen — die Spitzen liegen dann im Frühjahr/Sommer.
          Die Liquiditätsvorschau nutzt dieselbe Verteilung.
        </div>
      </div>

      {/* Liquiditätsvorschau */}
      <div style={{ ...card, padding: 16, overflowX: 'auto' }}>
        <div style={{ ...cap, marginBottom: 10 }}>Liquiditätsvorschau {plan.jahr} — Zahlungsziele berücksichtigt</div>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12, minWidth: 820 }}>
          <thead><tr><th style={th('left')}>Monat</th>{liq.map((m) => <th key={m.monat} style={th('right')}>{MON[m.monat - 1]}</th>)}</tr></thead>
          <tbody>
            <tr><td style={td('left')}>Einzahlungen</td>{liq.map((m) => <td key={m.monat} className="mono" style={{ ...td('right'), color: 'var(--amp-g)' }}>{eur0(m.ein / 1000)}k</td>)}</tr>
            <tr><td style={td('left')}>Auszahlungen</td>{liq.map((m) => <td key={m.monat} className="mono" style={{ ...td('right'), color: 'var(--amp-r)' }}>{eur0(m.aus / 1000)}k</td>)}</tr>
            <tr><td style={td('left', true)}>Kumuliert</td>{liq.map((m) => <td key={m.monat} className="mono" style={{ ...td('right', true), color: m.kumuliert < 0 ? 'var(--amp-r)' : 'var(--ink)' }}>{eur0(m.kumuliert / 1000)}k</td>)}</tr>
          </tbody>
        </table>
        <div style={{ fontSize: 12, color: 'var(--muted)', marginTop: 10 }}>
          Beträge in Tsd €. Einzahlungen folgen dem VK-Zahlungsziel, Auszahlungen dem EK-Zahlungsziel — so wird sichtbar,
          wann das Geld wirklich fließt. {liqMin < 0 ? <b style={{ color: 'var(--amp-r)' }}>Achtung: Liquidität wird zwischenzeitlich negativ ({eur0(liqMin)} €).</b> : 'Liquidität bleibt durchgehend positiv.'}
          {onGeh && <> Mehr unter <a style={{ color: 'var(--accent)', cursor: 'pointer' }} onClick={() => onGeh('forderungen')}>Forderungs-Aging</a>.</>}
        </div>
      </div>

      {/* Termin-/Beschaffungssicht: wann bestellen / produzieren? */}
      <div style={{ ...card, padding: 16, marginTop: 14, overflowX: 'auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 8, marginBottom: 10 }}>
          <div style={cap}>Termin- & Beschaffungssicht — wann spätestens bestellen / produzieren?</div>
          <label style={lbl}>Sicherheits-Puffer (Tage)
            <input type="number" value={puffer} onChange={(e) => setPuffer(Math.max(0, Number(e.target.value)))} style={{ ...inp, width: 80, marginLeft: 6 }} />
          </label>
        </div>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12.5, minWidth: 820 }}>
          <thead><tr>{['Produkt', 'Bedarfs-Spitze', 'Menge (Monat)', 'WBZ', 'Produktion', 'Spätester Bestelltermin', 'Spätester Produktionsstart'].map((h, i) => <th key={i} style={th(i === 0 ? 'left' : i <= 1 ? 'left' : 'right')}>{h}</th>)}</tr></thead>
          <tbody>
            {terminplanung(plan, puffer).map((t) => {
              const heute = new Date().toISOString().slice(0, 10)
              const knapp = t.bestellBis < heute
              return (
                <tr key={t.id} style={{ background: knapp ? 'var(--amp-r-soft)' : undefined }}>
                  <td style={td('left', true)}>{t.name}{!t.eigenfertigung && <span style={{ fontSize: 10, color: 'var(--muted)' }}> (Handelsware)</span>}</td>
                  <td style={td('left')}>{t.peakMonat} {plan.jahr}</td>
                  <td className="mono" style={td('right')}>{n0(t.peakMenge)}</td>
                  <td className="mono" style={td('right')}>{t.wbzTage} Tg</td>
                  <td className="mono" style={td('right')}>{t.eigenfertigung ? `${t.produktionsTage} Tg` : '—'}</td>
                  <td className="mono" style={{ ...td('right', true), color: knapp ? 'var(--amp-r)' : 'var(--ink)' }}>{t.bestellBis}{knapp ? ' ⚠' : ''}</td>
                  <td className="mono" style={td('right')}>{t.eigenfertigung ? t.produktionsStart : '—'}</td>
                </tr>
              )
            })}
          </tbody>
        </table>
        <div style={{ fontSize: 12, color: 'var(--muted)', marginTop: 10 }}>
          Rückwärtsterminierung von der saisonalen Bedarfsspitze: <b>Bestelltermin</b> = Bedarf − (Wiederbeschaffung + Produktion + Puffer),
          <b> Produktionsstart</b> = Bedarf − (Produktion + Puffer). Rot ⚠ = Termin liegt bereits in der Vergangenheit (zu knapp).
          {onGeh && <> Details unter <a style={{ color: 'var(--accent)', cursor: 'pointer' }} onClick={() => onGeh('produktion')}>Produktionscontrolling</a> und <a style={{ color: 'var(--accent)', cursor: 'pointer' }} onClick={() => onGeh('lager')}>Lagerverwaltung</a>.</>}
        </div>
      </div>

      {/* Szenarienvergleich (Basis/Best/Worst nebeneinander) */}
      <div style={{ ...card, padding: 16, marginTop: 14, overflowX: 'auto' }}>
        <div style={{ ...cap, marginBottom: 8 }}>Szenarienvergleich</div>
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 12 }}>
          {plaene.map((p) => {
            const an = vglIds.includes(p.id)
            return (
              <button key={p.id} onClick={() => setVglIds((ids) => an ? ids.filter((x) => x !== p.id) : [...ids, p.id])}
                style={{ fontSize: 12, padding: '4px 10px', borderRadius: 999, cursor: 'pointer', fontWeight: 600,
                  border: `1px solid ${an ? 'var(--accent)' : 'var(--line)'}`, background: an ? 'var(--accent-soft)' : 'var(--panel)', color: an ? 'var(--accent)' : 'var(--muted)' }}>
                {an ? '✓ ' : ''}{p.name}
              </button>
            )
          })}
        </div>
        {vglIds.length < 2
          ? <div style={{ fontSize: 12.5, color: 'var(--muted)' }}>Mindestens zwei Szenarien auswählen (z. B. Budget, Best Case, Worst Case) — der erste gilt als <b>Basis</b>, die anderen zeigen das Delta dazu.</div>
          : (() => {
              const v = vergleiche(vglIds)
              const fmt = (val, e) => e === 'pct' ? `${val} %` : `${eur0(val)} €`
              return (
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12.5, minWidth: 520 }}>
                  <thead><tr>
                    <th style={th('left')}>Kennzahl</th>
                    {v.spalten.map((s, i) => <th key={s.id} style={th('right')}>{s.name}{i === 0 ? ' (Basis)' : ''}<div style={{ fontWeight: 400, fontSize: 10, color: 'var(--muted)' }}>{PLAN_TYPEN.find((t) => t.id === s.typ)?.name}</div></th>)}
                  </tr></thead>
                  <tbody>
                    {v.kennzahlen.map((k) => (
                      <tr key={k.key}>
                        <td style={td('left', true)}>{k.name}</td>
                        {v.spalten.map((s, i) => {
                          const d = i > 0 ? s[k.key] - v.basis[k.key] : null
                          return (
                            <td key={s.id} className="mono" style={td('right')}>
                              {fmt(s[k.key], k.einheit)}
                              {d != null && Math.abs(d) > 0.0001 && <div style={{ fontSize: 10.5, color: d >= 0 ? 'var(--amp-g)' : 'var(--amp-r)' }}>{d >= 0 ? '+' : ''}{fmt(d, k.einheit)}</div>}
                            </td>
                          )
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              )
            })()}
      </div>
      </>}
    </div>
  )
}

const btn = { padding: '7px 13px', borderRadius: 'var(--radius-sm)', cursor: 'pointer', fontSize: 12.5, fontWeight: 600, border: '1px solid var(--accent)', background: 'var(--accent)', color: '#fff' }
const btnGhost = { padding: '6px 11px', borderRadius: 'var(--radius-sm)', cursor: 'pointer', fontSize: 12.5, fontWeight: 600, border: '1px solid var(--line)', background: 'var(--panel)', color: 'var(--ink)' }
const lbl = { fontSize: 12, color: 'var(--muted)', display: 'flex', alignItems: 'center' }

function Kpi({ label, wert, sub, farbe }) {
  return <div style={{ ...card, padding: '10px 13px', flex: 1, minWidth: 150 }}>
    <div style={cap}>{label}</div>
    <div style={{ fontSize: 19, fontWeight: 700, color: farbe || 'var(--ink)' }}>{wert}</div>
    {sub && <div style={{ fontSize: 11, color: 'var(--muted)' }}>{sub}</div>}
  </div>
}
