// =========================================================================
//  BESCHAFFUNG — Rückwärtsterminierung: vom Bedarfstermin zur Bestellung.
//  Einzelartikel ODER über die Stückliste (kritischer Pfad). Mit fehlenden-
//  Werte-Erfassung, Ersatzartikel und Lieferanten-Anfragevorlage.
// =========================================================================
import React, { useState, useEffect } from 'react'
import { ARTIKEL_BASIS, artikelListe, artikelVon, lieferantVon, rueckwaerts, stuecklisteTerminierung, hatStueckliste, speichereArtikelWert, ladeArtikelVersion, anfrageVorlage, fmtDatum, REAKTION_STD, HEUTE } from '../../core/beschaffung.js'
import KonfliktDialog from '../../components/KonfliktDialog.jsx'

const card = { background: 'var(--panel)', border: '1px solid var(--line)', borderRadius: 'var(--radius)', boxShadow: 'var(--shadow)' }
const cap = { fontSize: 11, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '.04em', fontWeight: 700 }
const STATUS = { ueberfaellig: { f: 'var(--amp-r)', t: 'Überfällig — sofort bestellen' }, jetzt: { f: 'var(--amp-a)', t: 'Jetzt im optimalen Fenster — bestellen' }, plan: { f: 'var(--amp-g)', t: 'Im Plan — Termin im Blick behalten' } }
const feld = { padding: '6px 8px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--line)', font: 'inherit', fontSize: 13, background: 'var(--panel)', color: 'var(--ink)' }

function DatumKachel({ label, datum, tage, farbe, sub }) {
  return (
    <div style={{ ...card, padding: '11px 13px', flex: 1, minWidth: 150, borderTop: `3px solid ${farbe}` }}>
      <div style={{ ...cap, marginBottom: 3 }}>{label}</div>
      <div className="mono" style={{ fontSize: 16, fontWeight: 800, color: farbe }}>{fmtDatum(datum)}</div>
      <div style={{ fontSize: 11.5, color: 'var(--muted)' }}>{tage != null ? `${tage >= 0 ? 'in ' + tage + ' Tagen' : Math.abs(tage) + ' Tage überfällig'}` : ''}{sub ? ` · ${sub}` : ''}</div>
    </div>
  )
}

export default function Beschaffung() {
  const raeder = ARTIKEL_BASIS.filter((a) => a.typ !== 'komponente')
  const [artId, setArtId] = useState('ebike-city')
  const [bedarf, setBedarf] = useState('2027-04-01')
  const [menge, setMenge] = useState(50)
  const [reaktion, setReaktion] = useState(REAKTION_STD)
  const [, setTick] = useState(0); const refresh = () => setTick((n) => n + 1)
  const opts = { reaktion: Number(reaktion) || 0 }
  const t = rueckwaerts(artId, bedarf, opts)
  const bom = hatStueckliste(artId) ? stuecklisteTerminierung(artId, bedarf, opts) : null
  const [vorlageAuf, setVorlageAuf] = useState(false)
  // Optimistisches Sperren: die beim Öffnen gesehene Version festhalten.
  const [basisV, setBasisV] = useState(0)
  const [konflikt, setKonflikt] = useState(null) // { id, patch, autor, konflikt }
  const [meldung, setMeldung] = useState(null)
  useEffect(() => { setBasisV(ladeArtikelVersion(artId).version); setKonflikt(null); setMeldung(null) }, [artId])
  const aktVers = ladeArtikelVersion(artId)
  if (!t) return null
  const st = STATUS[t.status]
  const AUTOR = 'Du'

  const speichern = (id, patch, strategie) => {
    const r = speichereArtikelWert(id, patch, { basisVersion: basisV, autor: AUTOR, strategie })
    if (r.status === 'konflikt') { setKonflikt({ id, patch, konflikt: r.konflikt }); return }
    if (r.status === 'gespeichert') { setBasisV(r.datensatz.version); setMeldung(`Gespeichert (Version ${r.datensatz.version}).`) }
    setKonflikt(null); refresh()
  }
  const setWert = (id, key, val) => speichern(id, { [key]: val === '' ? null : Number(val) })
  // Demo: ein Kollege ändert denselben Artikel — danach kollidiert das eigene Speichern.
  const simuliereKollege = () => {
    const v = ladeArtikelVersion(artId).version
    const aktuell = artikelVon(artId)?.lieferzeitTage ?? 60
    speichereArtikelWert(artId, { lieferzeitTage: Number(aktuell) + 5 }, { basisVersion: v, autor: 'Kollegin Müller' })
    setMeldung('Kollegin Müller hat den Artikel gerade geändert (im Hintergrund). Dein nächstes Speichern erkennt das.')
    refresh() // basisV bewusst NICHT aktualisieren → eigener Stand ist nun veraltet
  }

  return (
    <div style={{ display: 'grid', gap: 14 }}>
      {/* Eingabe */}
      <div style={{ ...card, padding: 14, display: 'flex', gap: 14, flexWrap: 'wrap', alignItems: 'flex-end' }}>
        <label style={{ fontSize: 12, color: 'var(--muted)' }}>Rad / Artikel<br />
          <select value={artId} onChange={(e) => setArtId(e.target.value)} style={{ ...feld, marginTop: 3, minWidth: 200 }}>{raeder.map((a) => <option key={a.id} value={a.id}>{a.name}</option>)}</select></label>
        <label style={{ fontSize: 12, color: 'var(--muted)' }}>Bedarfstermin<br /><input type="date" value={bedarf} onChange={(e) => setBedarf(e.target.value)} style={{ ...feld, marginTop: 3 }} /></label>
        <label style={{ fontSize: 12, color: 'var(--muted)' }}>Menge<br /><input type="number" value={menge} onChange={(e) => setMenge(e.target.value)} style={{ ...feld, marginTop: 3, width: 90 }} /></label>
        <label style={{ fontSize: 12, color: 'var(--muted)' }}>Reaktionszeit Kollegen (Tg)<br /><input type="number" value={reaktion} onChange={(e) => setReaktion(e.target.value)} style={{ ...feld, marginTop: 3, width: 90 }} /></label>
        <div style={{ fontSize: 11.5, color: 'var(--muted)', flex: 1, minWidth: 160 }}>Hauptlieferant: <b>{t.lieferant?.name || '—'}</b>{t.lieferant?.verzugTage ? ` (Ø Verzug ${t.lieferant.verzugTage} Tg)` : ''} · heute {fmtDatum(HEUTE)}</div>
      </div>

      {/* Bearbeitungsstand (optimistisches Sperren) */}
      <div style={{ ...card, padding: '8px 12px', display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap', fontSize: 12 }}>
        <span style={cap}>Bearbeitungsstand</span>
        <span style={{ color: 'var(--muted)' }}>
          {aktVers.version === 0 ? 'Noch nicht bearbeitet' : <>Version <b>{aktVers.version}</b>{aktVers.geaendertVon ? <> · zuletzt von <b>{aktVers.geaendertVon}</b></> : ''}{aktVers.geaendertAm ? ` · ${new Date(aktVers.geaendertAm).toLocaleString('de-DE', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })}` : ''}</>}
          {basisV < aktVers.version && <span style={{ color: 'var(--amp-a)', fontWeight: 700 }}> · ⚠ neuer Stand als beim Öffnen</span>}
        </span>
        <button onClick={simuliereKollege} title="Demo: simuliert eine parallele Änderung durch einen Kollegen" style={{ marginLeft: 'auto', padding: '5px 10px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--line)', background: 'var(--panel)', cursor: 'pointer', fontSize: 12 }}>👥 Kollege ändert (Demo)</button>
        {meldung && <span style={{ flexBasis: '100%', fontSize: 11.5, color: 'var(--muted)' }}>{meldung}</span>}
      </div>

      {/* Status + Termine */}
      <div style={{ ...card, padding: '10px 14px', borderLeft: `5px solid ${st.f}`, display: 'flex', alignItems: 'center', gap: 10 }}>
        <span style={{ width: 11, height: 11, borderRadius: '50%', background: st.f }} /><b>{st.t}</b>
        <span style={{ color: 'var(--muted)', fontSize: 12.5 }}>· WBZ = Lieferzeit {t.lieferzeit.n} Tg (Spanne {t.lieferzeit.min}–{t.lieferzeit.max}) + Reaktion {t.reaktion} Tg + Puffer {t.puffer} Tg</span>
      </div>
      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
        <DatumKachel label="Optimaler Bestellzeitpunkt" datum={t.optimal} tage={t.tageBisOptimal} farbe="var(--amp-g)" sub="mit Puffer" />
        <DatumKachel label="Spätester Bestelltermin (sicher)" datum={t.spaetester} tage={t.tageBisSpaetester} farbe="var(--amp-a)" sub="Worst-Case-Lieferzeit" />
        <DatumKachel label="Spätestens möglich (Best-Case)" datum={t.bestCase} tage={null} farbe="var(--accent)" sub="nur bei min. Lieferzeit" />
        <DatumKachel label="Bedarfstermin" datum={t.bedarf} tage={null} farbe="var(--ink)" />
      </div>

      {/* Fehlende Werte */}
      {t.fehlendeWerte.length > 0 && (
        <div style={{ background: '#fef3c7', border: '1px solid #fbbf24', borderRadius: 'var(--radius)', padding: 12 }}>
          <div style={{ fontWeight: 700, color: '#92400e', marginBottom: 6 }}>⚠ Fehlende Werte am Artikel „{t.artikel.name}" — bitte am Artikel/Lieferanten erfassen:</div>
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
            {['lieferzeitTage', 'lieferzeitMin', 'lieferzeitMax'].map((key) => (
              // key artikelspezifisch: sonst behält das wiederverwendete DOM-Element
              // beim Artikelwechsel den alten defaultValue und onBlur speichert ihn falsch.
              <label key={t.artikel.id + ':' + key} style={{ fontSize: 12, color: '#92400e' }}>{key}<br />
                <input type="number" defaultValue={t.artikel[key] ?? ''} onBlur={(e) => setWert(t.artikel.id, key, e.target.value)} placeholder="Tage" style={{ ...feld, marginTop: 2, width: 100 }} /></label>
            ))}
          </div>
        </div>
      )}

      {/* Stücklisten-Terminierung */}
      {bom && (
        <div style={{ ...card, overflow: 'auto' }}>
          <div style={{ padding: '10px 12px 0' }}>
            <span style={cap}>Stückliste — kritischer Pfad</span>
            <span style={{ fontSize: 12, color: 'var(--muted)' }}> · Montagezeit {bom.montage} Tg → Komponenten-Bedarf {fmtDatum(bom.komponentenBedarf)}{bom.kritisch ? ` · Beschaffung starten bis ${fmtDatum(bom.montagestart)}` : ''}</span>
          </div>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12.5, marginTop: 8 }}>
            <thead><tr>{['Komponente', 'Lieferant', 'Menge/Rad', 'Lieferzeit', 'Spätester Bestelltermin', 'Status'].map((h, i) => <th key={i} style={{ textAlign: i < 2 ? 'left' : i === 2 ? 'right' : 'left', padding: '6px 9px', borderBottom: '2px solid var(--line)', fontSize: 10, color: 'var(--muted)', textTransform: 'uppercase' }}>{h}</th>)}</tr></thead>
            <tbody>
              {bom.positionen.map((p, i) => {
                const kritisch = bom.kritisch && p.id === bom.kritisch.id
                const s = STATUS[p.term.status]
                return (
                  <tr key={p.id} style={{ background: kritisch ? 'var(--accent-soft)' : 'transparent' }}>
                    <td style={{ padding: '6px 9px', borderBottom: '1px solid var(--line)', fontWeight: kritisch ? 700 : 500 }}>{kritisch ? '🔴 ' : ''}{p.komponente?.name || p.id}{p.term.fehlendeWerte.length ? ' ⚠' : ''}</td>
                    <td style={{ padding: '6px 9px', borderBottom: '1px solid var(--line)' }}>{p.term.lieferant?.name || '—'}</td>
                    <td style={{ padding: '6px 9px', borderBottom: '1px solid var(--line)', textAlign: 'right' }} className="mono">{p.menge}</td>
                    <td style={{ padding: '6px 9px', borderBottom: '1px solid var(--line)' }} className="mono">{p.term.lieferzeit.n} Tg ({p.term.lieferzeit.min}–{p.term.lieferzeit.max})</td>
                    <td style={{ padding: '6px 9px', borderBottom: '1px solid var(--line)', fontWeight: 700 }} className="mono">{fmtDatum(p.term.spaetester)}</td>
                    <td style={{ padding: '6px 9px', borderBottom: '1px solid var(--line)', color: s.f }}>● {p.term.status === 'ueberfaellig' ? 'überfällig' : p.term.status === 'jetzt' ? 'jetzt' : 'im Plan'}</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
          <div style={{ fontSize: 11.5, color: 'var(--muted)', padding: '6px 12px 10px' }}>Der <b>kritische Pfad</b> (🔴, längste Wiederbeschaffungszeit) bestimmt, wann die Beschaffung fürs Rad spätestens starten muss.</div>
        </div>
      )}

      {/* Ersatzartikel */}
      {t.ersatz && (
        <div style={{ ...card, padding: 12, borderLeft: '3px solid var(--accent)' }}>
          <span style={cap}>Ersatzartikel bei Engpass</span>
          <div style={{ fontSize: 13, marginTop: 4 }}><b>{t.ersatz.name}</b> — Lieferzeit {t.ersatz.lieferzeitTage} Tg (statt {t.lieferzeit.n} Tg). Bei Nichtverfügbarkeit des Hauptartikels als Alternative prüfen.</div>
        </div>
      )}

      {/* Lieferanten-Anfragevorlage */}
      <div style={{ ...card, padding: 12 }}>
        <button onClick={() => setVorlageAuf((v) => !v)} style={{ border: 'none', background: 'none', cursor: 'pointer', fontSize: 12.5, fontWeight: 700, color: 'var(--accent)', padding: 0 }}>✉ Anfragevorlage an Lieferanten {vorlageAuf ? '▾' : '▸'} <span style={{ color: 'var(--muted)', fontWeight: 400 }}>(Vorschlag, keine Pflicht)</span></button>
        {vorlageAuf && (() => { const text = anfrageVorlage(t, menge); return (
          <div style={{ marginTop: 8 }}>
            <textarea readOnly value={text} rows={11} style={{ width: '100%', ...feld, fontSize: 12, lineHeight: 1.5, resize: 'vertical' }} />
            <button onClick={() => { try { navigator.clipboard?.writeText(text) } catch {} }} style={{ marginTop: 6, padding: '6px 12px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--line)', background: 'var(--panel)', cursor: 'pointer', fontSize: 12.5 }}>⧉ Kopieren</button>
          </div>
        ) })()}
      </div>

      <KonfliktDialog
        titel={t.artikel.name}
        konflikt={konflikt?.konflikt}
        onUeberschreiben={() => speichern(konflikt.id, konflikt.patch, 'ueberschreiben')}
        onMergen={() => speichern(konflikt.id, konflikt.patch, 'mergen')}
        onAbbrechen={() => { setKonflikt(null); setBasisV(ladeArtikelVersion(artId).version); setMeldung('Abgebrochen — aktueller Stand übernommen.'); refresh() }}
      />
    </div>
  )
}
