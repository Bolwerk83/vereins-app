// =========================================================================
//  LAGERVERWALTUNG (Controlling-Sicht) — Kapitalbindung, Lagerhaltungskosten,
//  Standortkosten und Bestandsoptimierung (EOQ, Melde-/Sicherheitsbestand).
//  Plus: anklickbare Artikel mit KI-Empfehlungen, schleichende Lieferanten-
//  Signale und Eskalation an die Abteilungsleitung Einkauf (Rückfrage-Workflow).
// =========================================================================
import React, { useState } from 'react'
import { kennzahlen, standorteAuswertung, optimierung, KOSTENSATZ, lagerhaltungskostensatz, KALK_ZINS,
  artikelEmpfehlungen, lieferantenSignale, LIEFERANT_HISTORIE, PERIODEN } from '../../core/lager.js'
import { signaleMitStatus, offeneEskalationen, kommentiere, istEinkaufsleitung } from '../../core/lagerSignale.js'
import ExecKopf, { ampelVon } from '../../components/ExecKopf.jsx'

const card = { background: 'var(--panel)', border: '1px solid var(--line)', borderRadius: 'var(--radius)', boxShadow: 'var(--shadow)' }
const cap = { fontSize: 11, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '.03em', fontWeight: 700 }
const m1 = (v) => v.toLocaleString('de-DE', { minimumFractionDigits: 1, maximumFractionDigits: 1 })
const eur0 = (v) => Math.round(v).toLocaleString('de-DE')
const n0 = (v) => Math.round(v).toLocaleString('de-DE')
const th = (al) => ({ textAlign: al, padding: '6px 9px', borderBottom: '2px solid var(--line)', fontSize: 10, color: 'var(--muted)', textTransform: 'uppercase' })
const td = (al, bold) => ({ textAlign: al, padding: '7px 9px', borderBottom: '1px solid var(--line)', fontWeight: bold ? 700 : 400 })

const SCHWERE = {
  kritisch: { farbe: 'var(--amp-r)', soft: 'var(--amp-r-soft)', icon: '🔴', label: 'Kritisch' },
  wichtig:  { farbe: 'var(--amp-a)', soft: 'var(--amp-a-soft)', icon: '🟠', label: 'Wichtig' },
  hinweis:  { farbe: 'var(--accent)', soft: 'var(--accent-soft)', icon: '🔵', label: 'Hinweis' }
}
const STATUS = {
  unterdeckung: { farbe: 'var(--amp-r)', label: 'Unterdeckung' },
  korridor:     { farbe: 'var(--amp-g)', label: 'im Korridor' },
  ueberbestand: { farbe: 'var(--amp-a)', label: 'Überbestand' }
}

export default function Lagerverwaltung({ onGeh, rolle, onDetail }) {
  const [tab, setTab] = useState('uebersicht')
  const [offen, setOffen] = useState(null)   // ausgeklappter Artikel
  const [tick, setTick] = useState(0)        // Re-Render nach Kommentar
  const [eskaliereAuf, setEskaliereAuf] = useState(true)
  const k = kennzahlen()
  const standorte = standorteAuswertung()
  const opt = optimierung()
  const satz = lagerhaltungskostensatz()
  const lfSig = lieferantenSignale()
  const lfMap = Object.fromEntries(lfSig.map((s) => [s.lieferantId, s]))
  const signale = signaleMitStatus()
  const eskalationen = offeneEskalationen()
  const darfEskalation = istEinkaufsleitung(rolle)

  const kommentar = (id, text) => { kommentiere(id, text); setTick((t) => t + 1) }

  // Exec-Kopf: Lage aus Anzahl kritischer Artikel (Unterdeckung/Überbestand), Empfehlung aus Engpass/Überbestand.
  const kritischeArtikel = (opt.rows || []).filter((r) => r.status === 'unterdeckung' || r.status === 'ueberbestand')
  const unterdeckung = kritischeArtikel.filter((r) => r.status === 'unterdeckung')
  const ueberbestand = kritischeArtikel.filter((r) => r.status === 'ueberbestand')
  const execStatus = ampelVon(kritischeArtikel.length, { gut: 0, schlecht: 2, invert: true })
  const execAussage = `Lagerbestandswert ${m1(k.bestandswert)} Mio € · Umschlag ${m1(k.umschlag)}× (Reichweite ${k.reichweite} Tage) · ${kritischeArtikel.length} kritische${kritischeArtikel.length === 1 ? 'r' : ''} Artikel.`
  const execEmpf = unterdeckung.length > 0
    ? `${unterdeckung.length} Artikel in Unterdeckung (${unterdeckung.map((r) => r.name).join(', ')}) — Nachbestellung auslösen, um Lieferfähigkeit zu sichern.`
    : ueberbestand.length > 0
      ? `Überbestand bindet rund ${eur0(opt.ueberbestandWert)} € (${ueberbestand.map((r) => r.name).join(', ')}) — Bestellpause/Abverkauf; zusätzlich ${eur0(opt.einsparpotenzial)} € Losgrößen-Potenzial heben.`
      : `Bestände im Korridor — ${eur0(opt.einsparpotenzial)} € Einsparpotenzial aus optimierten Losgrößen realisieren.`

  return (
    <div style={{ maxWidth: '100%', margin: '0 auto' }}>
      <div style={{ marginBottom: 14 }}>
        <h2 style={{ margin: '0 0 4px' }}>Lagerverwaltung — Controlling-Sicht</h2>
        <div style={{ color: 'var(--muted)', fontSize: 13, maxWidth: 760 }}>
          Wirtschaftliche Steuerung des Lagers: gebundenes Kapital, Lagerhaltungskosten, Standortkosten und die
          Bestandsoptimierung. Nicht die operative Lagerplatzverwaltung, sondern die Frage „<i>was kostet uns das Lager?</i>".
        </div>
      </div>

      <ExecKopf status={execStatus} kennzahl={`${m1(k.bestandswert)} Mio €`} kennzahlLabel="Lagerbestandswert" kernaussage={execAussage} empfehlung={execEmpf} />

      {/* Eskalation: wichtige, unkommentierte Signale für die Einkaufsleitung */}
      {darfEskalation && eskalationen.length > 0 && eskaliereAuf && (
        <div style={{ ...card, borderLeft: '4px solid var(--amp-r)', padding: 14, marginBottom: 14, background: 'var(--amp-r-soft)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 10 }}>
            <div>
              <div style={{ fontWeight: 700, fontSize: 14, color: 'var(--amp-r)' }}>🔔 {eskalationen.length} wichtige Meldung(en) brauchen deine Rückfrage</div>
              <div style={{ fontSize: 12.5, color: 'var(--ink)', marginTop: 2 }}>Diese Signale sind noch <b>nicht kommentiert</b>. Als Abteilungsleitung Einkauf: kurz klären oder kommentieren, damit nichts untergeht.</div>
            </div>
            <button onClick={() => setEskaliereAuf(false)} title="ausblenden" style={{ border: 'none', background: 'none', cursor: 'pointer', color: 'var(--muted)', fontSize: 16 }}>×</button>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginTop: 10 }}>
            {eskalationen.slice(0, 4).map((s) => (
              <div key={s.id} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13 }}>
                <span>{SCHWERE[s.schwere].icon}</span>
                <span style={{ flex: 1 }}><b>{s.titel}</b> — {s.text}</span>
                <button onClick={() => { setTab('signale'); setEskaliereAuf(false) }} style={{ ...btn, padding: '4px 10px', fontSize: 12 }}>Klären →</button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* KPIs */}
      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 14 }}>
        <Kpi label="Lagerbestandswert" wert={`${m1(k.bestandswert)} Mio €`} />
        <Kpi label="Kapitalbindung (Zins)" wert={`${m1(k.kapitalbindung)} Mio €`} sub={`${KALK_ZINS} % kalk.`} farbe="var(--amp-a)" />
        <Kpi label="Lagerhaltungskosten/J" wert={`${m1(k.lagerhaltungskosten)} Mio €`} sub={`Satz ${satz} %`} farbe="var(--amp-r)" />
        <Kpi label="Umschlag" wert={`${m1(k.umschlag)}×`} sub={`Reichweite ${k.reichweite} Tage`} />
        <Kpi label="Platz-Auslastung" wert={`${k.auslastung} %`} farbe={k.auslastung > 90 ? 'var(--amp-r)' : 'var(--amp-g)'} />
        <Kpi label="Servicegrad" wert={`${k.servicegrad} %`} farbe="var(--amp-g)" />
      </div>

      {/* Optimierungs-Potenzial-Leiste */}
      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 14 }}>
        <Kpi label="Gebundenes Kapital (Ist)" wert={`${eur0(opt.kapitalGebunden)} €`} />
        <Kpi label="Überbestand (freisetzbar)" wert={`${eur0(opt.ueberbestandWert)} €`} farbe={opt.ueberbestandWert > 0 ? 'var(--amp-a)' : 'var(--amp-g)'} />
        <Kpi label="Einsparpotenzial Losgrößen/J" wert={`${eur0(opt.einsparpotenzial)} €`} farbe={opt.einsparpotenzial > 0 ? 'var(--accent)' : 'var(--amp-g)'} />
        <Kpi label="Offene KI-Signale" wert={`${signale.length}`} sub={`${eskalationen.length} ohne Kommentar`} farbe={eskalationen.length ? 'var(--amp-r)' : 'var(--amp-g)'} />
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 6, marginBottom: 12, flexWrap: 'wrap' }}>
        {[['uebersicht', 'Kostenstruktur'], ['standorte', 'Standorte'], ['optimierung', 'Bestandsoptimierung'], ['signale', `Signale & KI${signale.length ? ` (${signale.length})` : ''}`]].map(([id, n]) => (
          <button key={id} onClick={() => setTab(id)} style={{ padding: '7px 13px', borderRadius: 'var(--radius-sm)', cursor: 'pointer', fontSize: 13, fontWeight: 600,
            border: `1px solid ${tab === id ? 'var(--accent)' : 'var(--line)'}`, background: tab === id ? 'var(--accent)' : 'var(--panel)', color: tab === id ? '#fff' : 'var(--ink)' }}>{n}</button>
        ))}
      </div>

      {tab === 'uebersicht' && (
        <div style={{ ...card, padding: 16 }}>
          <div style={{ ...cap, marginBottom: 10 }}>Lagerhaltungskostensatz — Zusammensetzung ({satz} % vom Bestandswert)</div>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
            <thead><tr>{['Kostenblock', 'Satz', 'Kosten/Jahr', ''].map((h, i) => <th key={i} style={th(i === 0 ? 'left' : i === 3 ? 'left' : 'right')}>{h}</th>)}</tr></thead>
            <tbody>
              {KOSTENSATZ.map((c) => (
                <tr key={c.id}>
                  <td style={td('left', true)}>{c.name}<div style={{ fontWeight: 400, fontSize: 11.5, color: 'var(--muted)' }}>{c.laie}</div></td>
                  <td className="mono" style={td('right')}>{c.satz} %</td>
                  <td className="mono" style={td('right')}>{m1(k.bestandswert * c.satz / 100)} Mio €</td>
                  <td style={{ padding: '7px 9px', borderBottom: '1px solid var(--line)', width: 120 }}>
                    <div style={{ height: 8, background: 'var(--bg)', borderRadius: 4, overflow: 'hidden' }}><div style={{ width: `${c.satz / satz * 100}%`, height: '100%', background: 'var(--accent)' }} /></div>
                  </td>
                </tr>
              ))}
              <tr style={{ background: 'var(--accent-soft)' }}>
                <td style={td('left', true)}>= Lagerhaltungskostensatz</td>
                <td className="mono" style={td('right', true)}>{satz} %</td>
                <td className="mono" style={td('right', true)}>{m1(k.lagerhaltungskosten)} Mio €</td><td />
              </tr>
            </tbody>
          </table>
          <div style={{ fontSize: 12, color: 'var(--muted)', marginTop: 10 }}>
            Jeder Euro Bestand kostet rund <b>{satz} % pro Jahr</b>. Bestände senken wirkt also doppelt: weniger Kapitalbindung <i>und</i> weniger Lagerkosten.
            {onGeh && <> Siehe <a style={{ color: 'var(--accent)', cursor: 'pointer' }} onClick={() => onGeh('bestand')}>Bestands-Gängigkeit</a> für Ladenhüter-Abbau.</>}
          </div>
        </div>
      )}

      {tab === 'standorte' && (
        <div style={{ ...card, padding: 16, overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13, minWidth: 720 }}>
            <thead><tr>{['Standort', 'Fläche', 'Bestand', 'Auslastung', 'Kosten/J', 'Kosten/m²', '% vom Bestand'].map((h, i) => <th key={i} style={th(i === 0 ? 'left' : 'right')}>{h}</th>)}</tr></thead>
            <tbody>
              {standorte.map((s) => (
                <tr key={s.id}>
                  <td style={td('left', true)}>{s.name}</td>
                  <td className="mono" style={td('right')}>{s.flaeche.toLocaleString('de-DE')} m²</td>
                  <td className="mono" style={td('right')}>{m1(s.bestandswert)} Mio</td>
                  <td className="mono" style={{ ...td('right'), color: s.auslastung > 90 ? 'var(--amp-r)' : s.auslastung < 60 ? 'var(--amp-a)' : 'var(--amp-g)' }}>{s.auslastung} %</td>
                  <td className="mono" style={td('right')}>{eur0(s.kostenTsd)} Tsd €</td>
                  <td className="mono" style={td('right')}>{eur0(s.kostenJeM2)} €</td>
                  <td className="mono" style={td('right')}>{s.kostenQuote} %</td>
                </tr>
              ))}
            </tbody>
          </table>
          <div style={{ fontSize: 12, color: 'var(--muted)', marginTop: 10 }}>
            Das externe 3PL-Läger ist nur zu {standorte.find((s) => s.id === 'extern')?.auslastung} % ausgelastet — Konsolidierung prüfen.
            Hohe „Kosten je m²" und „% vom Bestand" zeigen die teuersten Standorte.
          </div>
        </div>
      )}

      {tab === 'optimierung' && (
        <div style={{ ...card, padding: 16, overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12.5, minWidth: 920 }}>
            <thead><tr>{['', 'Artikel', 'Lieferant', 'Bedarf/J', 'EOQ', 'Ist-Bestand', 'Reichw.', 'Meldebest.', 'Status', 'Einsparpot./J'].map((h, i) => <th key={i} style={th(i <= 2 ? 'left' : 'right')}>{h}</th>)}</tr></thead>
            <tbody>
              {opt.rows.map((r) => {
                const auf = offen === r.id
                const sig = lfMap[r.lieferantId]
                return (
                  <React.Fragment key={r.id}>
                    <tr onClick={() => setOffen(auf ? null : r.id)} style={{ cursor: 'pointer', background: auf ? 'var(--accent-soft)' : undefined }}
                      onMouseEnter={(e) => { if (!auf) e.currentTarget.style.background = 'var(--bg)' }}
                      onMouseLeave={(e) => { if (!auf) e.currentTarget.style.background = 'transparent' }}>
                      <td style={{ ...td('center'), color: 'var(--muted)' }}><span style={{ display: 'inline-block', transform: auf ? 'rotate(90deg)' : 'none', transition: 'transform .12s' }}>▶</span></td>
                      <td style={td('left', true)}>{r.name}{sig && <span title="Lieferrisiko" style={{ marginLeft: 6 }}>⚠️</span>}</td>
                      <td style={{ ...td('left'), color: 'var(--muted)', fontSize: 12 }}>{r.lieferant?.name}</td>
                      <td className="mono" style={td('right')}>{n0(r.jahresbedarf)}</td>
                      <td className="mono" style={td('right', true)}>{n0(r.eoqMenge)}</td>
                      <td className="mono" style={td('right')}>{n0(r.istBestand)}</td>
                      <td className="mono" style={td('right')}>{r.reichweiteTage} Tg</td>
                      <td className="mono" style={{ ...td('right'), color: 'var(--accent)' }}>{n0(r.meldebestand)}</td>
                      <td style={td('right')}><span style={{ fontSize: 11, fontWeight: 700, color: STATUS[r.status].farbe, border: `1px solid ${STATUS[r.status].farbe}`, borderRadius: 999, padding: '1px 8px', whiteSpace: 'nowrap' }}>{STATUS[r.status].label}</span></td>
                      <td className="mono" style={{ ...td('right'), color: r.einsparpotenzial > 0 ? 'var(--accent)' : 'var(--muted)' }}>{r.einsparpotenzial > 0 ? `${eur0(r.einsparpotenzial)} €` : '—'}</td>
                    </tr>
                    {auf && (
                      <tr><td colSpan={10} style={{ padding: 0, background: 'var(--bg)', borderBottom: '1px solid var(--line)' }}>
                        <ArtikelDetail row={r} sig={sig} satz={satz} onDetail={onDetail} />
                      </td></tr>
                    )}
                  </React.Fragment>
                )
              })}
              <tr style={{ background: 'var(--bg)' }}>
                <td />
                <td style={td('left', true)}>Summe</td>
                <td colSpan={7} style={{ ...td('right'), color: 'var(--muted)', fontSize: 12 }}>Ø gebundenes Kapital {eur0(opt.gebundenWert)} € · Ist {eur0(opt.kapitalGebunden)} €</td>
                <td className="mono" style={td('right', true)}>{eur0(opt.einsparpotenzial)} €</td>
              </tr>
            </tbody>
          </table>
          <div style={{ fontSize: 12, color: 'var(--muted)', marginTop: 10 }}>
            <b>Klick auf einen Artikel</b> öffnet Details, KI-Empfehlungen und den Lieferanten-Trend. <b>EOQ</b> (Andler) = wirtschaftlichste Losgröße.
            <b> Meldebestand</b> = ab hier neu bestellen. <b>Status</b>: Unterdeckung &lt; Meldebestand &lt; Korridor &lt; Höchstbestand &lt; Überbestand.
          </div>
        </div>
      )}

      {tab === 'signale' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <div style={{ fontSize: 12.5, color: 'var(--muted)' }}>
            KI-Empfehlungen und über längere Zeit <b>schleichende</b> Muster (z. B. ein Lieferant, der allgemein unzuverlässiger wird) — gebündelt, damit nichts untergeht.
            Wichtige Signale ohne Kommentar werden der <b>Abteilungsleitung Einkauf</b> zur Rückfrage angezeigt. Kommentieren = geklärt.
          </div>
          {signale.length === 0 && <div style={{ ...card, padding: 16, color: 'var(--muted)' }}>Aktuell keine offenen Signale.</div>}
          {signale.map((s) => (
            <div key={s.id} style={{ ...card, borderLeft: `4px solid ${SCHWERE[s.schwere].farbe}`, padding: 14 }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
                <span style={{ fontSize: 16 }}>{SCHWERE[s.schwere].icon}</span>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 700, fontSize: 14, display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                    {s.titel}
                    <span style={{ fontSize: 10, fontWeight: 700, color: SCHWERE[s.schwere].farbe, background: SCHWERE[s.schwere].soft, padding: '1px 7px', borderRadius: 999 }}>{SCHWERE[s.schwere].label}</span>
                    {s.nutzen > 0 && <span style={{ fontSize: 11, color: 'var(--accent)' }}>Nutzen ~{eur0(s.nutzen)} €</span>}
                  </div>
                  <div style={{ fontSize: 13, color: 'var(--ink)', marginTop: 4 }}>{s.text}</div>
                  {s.typ === 'lieferant' && LIEFERANT_HISTORIE[s.lieferantId] && (
                    <div style={{ display: 'flex', gap: 16, alignItems: 'center', marginTop: 8 }}>
                      <TrendMini titel="Liefertreue %" reihe={LIEFERANT_HISTORIE[s.lieferantId].treue} gutHoch />
                      <TrendMini titel="Wiederbeschaffung Tg" reihe={LIEFERANT_HISTORIE[s.lieferantId].wbz} />
                      {s.artikel?.length > 0 && <div style={{ fontSize: 11.5, color: 'var(--muted)' }}>Betrifft: {s.artikel.map((a) => a.name).join(', ')}</div>}
                    </div>
                  )}
                  <KommentarBox signal={s} onKommentar={kommentar} />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

// Artikel-Detailpanel (aufgeklappt): Kennzahlen + KI-Empfehlungen + Drill.
function ArtikelDetail({ row, sig, satz, onDetail }) {
  const emp = artikelEmpfehlungen(row, sig)
  const fakt = [
    ['Ist-Bestand', `${n0(row.istBestand)} Stk`], ['Reichweite', `${row.reichweiteTage} Tage`],
    ['Sicherheitsbestand', `${n0(row.sicherheitsbestand)} Stk`], ['Meldebestand', `${n0(row.meldebestand)} Stk`],
    ['Höchstbestand', `${n0(row.hoechstbestand)} Stk`], ['Gebundenes Kapital', `${eur0(row.kapitalGebunden)} €`],
    ['Aktuelle Losgröße', `${n0(row.aktBestellmenge)} Stk`], ['Optimale Losgröße (EOQ)', `${n0(row.eoqMenge)} Stk`],
    ['Bestellungen/J', `${row.bestellungenProJahr}×`], ['Lieferant', `${row.lieferant?.name} (${row.lieferant?.land})`]
  ]
  return (
    <div style={{ padding: '14px 18px', display: 'grid', gridTemplateColumns: 'minmax(260px, 1fr) minmax(280px, 1.2fr)', gap: 20 }}>
      <div>
        <div style={{ ...cap, marginBottom: 8 }}>Kennzahlen</div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4px 14px' }}>
          {fakt.map(([l, v]) => (
            <div key={l} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12.5, borderBottom: '1px solid var(--line)', padding: '3px 0' }}>
              <span style={{ color: 'var(--muted)' }}>{l}</span><span className="mono" style={{ fontWeight: 600 }}>{v}</span>
            </div>
          ))}
        </div>
        {onDetail && (
          <button onClick={() => onDetail('artikel', row.name)} style={{ ...btn, marginTop: 12 }}>In Artikelliste öffnen →</button>
        )}
      </div>
      <div>
        <div style={{ ...cap, marginBottom: 8 }}>🤖 KI-Empfehlungen</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {emp.map((e, i) => (
            <div key={i} style={{ background: 'var(--panel)', border: `1px solid var(--line)`, borderLeft: `3px solid ${SCHWERE[e.schwere].farbe}`, borderRadius: 'var(--radius-sm)', padding: '8px 11px' }}>
              <div style={{ fontWeight: 700, fontSize: 12.5, color: SCHWERE[e.schwere].farbe }}>{SCHWERE[e.schwere].icon} {e.titel}{e.nutzen > 0 ? ` · ~${eur0(e.nutzen)} €` : ''}</div>
              <div style={{ fontSize: 12.5, marginTop: 2 }}>{e.text}</div>
            </div>
          ))}
        </div>
        {sig && (
          <div style={{ display: 'flex', gap: 16, marginTop: 10 }}>
            <TrendMini titel="Liefertreue %" reihe={LIEFERANT_HISTORIE[row.lieferantId].treue} gutHoch />
            <TrendMini titel="Wiederbeschaffung Tg" reihe={LIEFERANT_HISTORIE[row.lieferantId].wbz} />
          </div>
        )}
      </div>
    </div>
  )
}

// Kleiner Trend-Sparkline mit Start→End-Delta.
function TrendMini({ titel, reihe, gutHoch = false }) {
  const min = Math.min(...reihe), max = Math.max(...reihe), spanne = max - min || 1
  const w = 92, h = 26
  const pts = reihe.map((v, i) => `${(i / (reihe.length - 1)) * w},${h - ((v - min) / spanne) * h}`).join(' ')
  const delta = reihe[reihe.length - 1] - reihe[0]
  const gut = gutHoch ? delta >= 0 : delta <= 0
  const farbe = gut ? 'var(--amp-g)' : 'var(--amp-r)'
  return (
    <div>
      <div style={{ fontSize: 10.5, color: 'var(--muted)', textTransform: 'uppercase' }}>{titel}</div>
      <svg width={w} height={h} style={{ display: 'block' }}><polyline points={pts} fill="none" stroke={farbe} strokeWidth="1.6" /></svg>
      <div style={{ fontSize: 11, fontWeight: 700, color: farbe }}>{reihe[0]} → {reihe[reihe.length - 1]} ({delta >= 0 ? '+' : ''}{delta})</div>
    </div>
  )
}

// Kommentar-/Klärungs-Box je Signal.
function KommentarBox({ signal, onKommentar }) {
  const [text, setText] = useState(signal.kommentar?.text || '')
  const [editier, setEditier] = useState(false)
  if (signal.kommentar && !editier) {
    return (
      <div style={{ marginTop: 10, fontSize: 12.5, background: 'var(--amp-g-soft)', border: '1px solid var(--line)', borderRadius: 'var(--radius-sm)', padding: '8px 11px' }}>
        <b style={{ color: 'var(--amp-g)' }}>✓ Geklärt</b> · {signal.kommentar.von} am {signal.kommentar.am}: „{signal.kommentar.text}"
        <button onClick={() => setEditier(true)} style={{ ...btnGhost, marginLeft: 8 }}>ändern</button>
      </div>
    )
  }
  return (
    <div style={{ marginTop: 10, display: 'flex', gap: 8, alignItems: 'center' }}>
      <input value={text} onChange={(e) => setText(e.target.value)} placeholder="Rückfrage / Kommentar zur Klärung …"
        style={{ flex: 1, padding: '7px 10px', border: '1px solid var(--line)', borderRadius: 'var(--radius-sm)', font: 'inherit', fontSize: 13 }} />
      <button onClick={() => { onKommentar(signal.id, text); setEditier(false) }} style={btn}>Kommentieren</button>
    </div>
  )
}

const btn = { padding: '7px 13px', borderRadius: 'var(--radius-sm)', cursor: 'pointer', fontSize: 12.5, fontWeight: 600, border: '1px solid var(--accent)', background: 'var(--accent)', color: '#fff' }
const btnGhost = { padding: '2px 8px', borderRadius: 999, cursor: 'pointer', fontSize: 11, fontWeight: 600, border: '1px solid var(--line)', background: 'var(--panel)', color: 'var(--muted)' }

function Kpi({ label, wert, sub, farbe }) {
  return <div style={{ ...card, padding: '10px 13px', flex: 1, minWidth: 150 }}>
    <div style={cap}>{label}</div>
    <div style={{ fontSize: 20, fontWeight: 700, color: farbe || 'var(--ink)' }}>{wert}</div>
    {sub && <div style={{ fontSize: 11, color: 'var(--muted)' }}>{sub}</div>}
  </div>
}
