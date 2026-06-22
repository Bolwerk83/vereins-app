// =========================================================================
//  EVENTS & AKTIONEN — Werbe-/Verkaufsaktionen anlegen und ihre Wirksamkeit
//  auswerten: Mehrumsatz, zusätzlicher Deckungsbeitrag, ROI der Werbung
//  und Ladenhüter-Abbau. Beträge in €.
// =========================================================================
import React, { useState } from 'react'
import { ladeEvents, addEvent, loescheEvent, alleWirksamkeit, MECHANIKEN, mechanikName } from '../../core/events.js'

const card = { background: 'var(--panel)', border: '1px solid var(--line)', borderRadius: 'var(--radius)', boxShadow: 'var(--shadow)' }
const cap = { fontSize: 11, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '.03em', fontWeight: 700 }
const eur0 = (v) => Math.round(v).toLocaleString('de-DE') + ' €'
const eurK = (v) => (Math.abs(v) >= 10000 ? Math.round(v / 1000).toLocaleString('de-DE') + ' Tsd €' : eur0(v))
const th = (al) => ({ textAlign: al, padding: '6px 9px', borderBottom: '1px solid var(--line)', fontSize: 10, color: 'var(--muted)', textTransform: 'uppercase' })
const td = (al, bold) => ({ textAlign: al, padding: '6px 9px', borderBottom: '1px solid var(--line)', fontWeight: bold ? 700 : 400 })
const inp = { padding: '7px 9px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--line)', font: 'inherit', fontSize: 13, width: '100%' }

const LEER_PRODUKT = () => ({ name: '', baseUmsatz: '', istUmsatz: '', dbMarge: '', ladenhueter: false, bestandVorher: '', bestandNachher: '' })
const LEER_FORM = () => ({ name: '', mechanik: 'rabatt', rabatt: '', von: '', bis: '', kosten: '', produkte: [LEER_PRODUKT()] })

export default function Events({ onGeh }) {
  const [tick, setTick] = useState(0)
  const [formAuf, setFormAuf] = useState(false)
  const [form, setForm] = useState(LEER_FORM())
  const { rows, summe } = alleWirksamkeit(ladeEvents())
  const neu = () => setTick((t) => t + 1)

  function speichern() {
    if (!form.name.trim()) { alert('Bitte einen Namen für die Aktion angeben.'); return }
    const produkte = form.produkte
      .filter((p) => p.name.trim())
      .map((p) => ({
        name: p.name.trim(),
        baseUmsatz: +p.baseUmsatz || 0, istUmsatz: +p.istUmsatz || 0, dbMarge: +p.dbMarge || 0,
        ladenhueter: !!p.ladenhueter,
        ...(p.ladenhueter ? { bestandVorher: +p.bestandVorher || 0, bestandNachher: +p.bestandNachher || 0 } : {})
      }))
    addEvent({ name: form.name.trim(), mechanik: form.mechanik, rabatt: +form.rabatt || 0,
      von: form.von, bis: form.bis, kosten: +form.kosten || 0, produkte })
    setForm(LEER_FORM()); setFormAuf(false); neu()
  }

  function setProdukt(i, patch) {
    setForm((f) => ({ ...f, produkte: f.produkte.map((p, j) => (j === i ? { ...p, ...patch } : p)) }))
  }

  return (
    <div style={{ maxWidth: '100%', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 14, marginBottom: 14, flexWrap: 'wrap' }}>
        <div>
          <h2 style={{ margin: '0 0 4px' }}>Events &amp; Aktionen</h2>
          <div style={{ color: 'var(--muted)', fontSize: 13, maxWidth: 660 }}>
            Aktionen mit Zeitraum, Produkten, Mechanik und Kosten – mit Wirksamkeitsanalyse:
            Mehrumsatz, zusätzlicher Deckungsbeitrag, ROI der Werbung und Ladenhüter-Abbau.
          </div>
        </div>
        <button onClick={() => setFormAuf((v) => !v)}
          style={{ padding: '9px 14px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--line)', background: 'var(--accent)', color: '#fff', cursor: 'pointer', fontSize: 13, fontWeight: 600, whiteSpace: 'nowrap' }}>
          {formAuf ? '× Schließen' : '+ Neue Aktion'}
        </button>
      </div>

      {/* Portfolio-KPIs */}
      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 14 }}>
        <Kpi label="Mehrumsatz gesamt" wert={eurK(summe.mehrumsatz)} farbe="var(--amp-g)" />
        <Kpi label="Zusätzlicher DB" wert={eurK(summe.zusatzDB)} />
        <Kpi label="Werbekosten" wert={eurK(summe.kosten)} farbe="var(--muted)" />
        <Kpi label="Netto-Mehrergebnis" wert={eurK(summe.ergebnisEffekt)} farbe={summe.ergebnisEffekt >= 0 ? 'var(--amp-g)' : 'var(--amp-r)'} />
        <Kpi label="ROI der Aktionen" wert={summe.roi != null ? summe.roi + ' %' : '—'} farbe={summe.roi >= 0 ? 'var(--amp-g)' : 'var(--amp-r)'} />
        <Kpi label="Ladenhüter abgebaut" wert={eurK(summe.ladenhueterAbbau)} farbe="var(--accent)" />
      </div>

      {/* Anlegen-Formular */}
      {formAuf && (
        <div style={{ ...card, padding: 16, marginBottom: 14 }}>
          <div style={{ ...cap, marginBottom: 10 }}>Neue Aktion anlegen</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 10, marginBottom: 12 }}>
            <Feld label="Name"><input style={inp} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="z. B. Black Week" /></Feld>
            <Feld label="Mechanik">
              <select style={inp} value={form.mechanik} onChange={(e) => setForm({ ...form, mechanik: e.target.value })}>
                {MECHANIKEN.map((m) => <option key={m.id} value={m.id}>{m.name}</option>)}
              </select>
            </Feld>
            <Feld label="Rabatt %"><input style={inp} type="number" value={form.rabatt} onChange={(e) => setForm({ ...form, rabatt: e.target.value })} /></Feld>
            <Feld label="Von"><input style={inp} type="date" value={form.von} onChange={(e) => setForm({ ...form, von: e.target.value })} /></Feld>
            <Feld label="Bis"><input style={inp} type="date" value={form.bis} onChange={(e) => setForm({ ...form, bis: e.target.value })} /></Feld>
            <Feld label="Werbekosten €"><input style={inp} type="number" value={form.kosten} onChange={(e) => setForm({ ...form, kosten: e.target.value })} /></Feld>
          </div>

          <div style={{ ...cap, marginBottom: 6 }}>Betroffene Produkte</div>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12.5, minWidth: 720 }}>
              <thead><tr>{['Produkt', 'Normalumsatz €', 'Ist-Umsatz €', 'DB-Marge %', 'Ladenhüter?', 'Bestand vorher €', 'Bestand nachher €'].map((h) => <th key={h} style={th('left')}>{h}</th>)}</tr></thead>
              <tbody>
                {form.produkte.map((p, i) => (
                  <tr key={i}>
                    <td style={td('left')}><input style={inp} value={p.name} onChange={(e) => setProdukt(i, { name: e.target.value })} /></td>
                    <td style={td('left')}><input style={inp} type="number" value={p.baseUmsatz} onChange={(e) => setProdukt(i, { baseUmsatz: e.target.value })} /></td>
                    <td style={td('left')}><input style={inp} type="number" value={p.istUmsatz} onChange={(e) => setProdukt(i, { istUmsatz: e.target.value })} /></td>
                    <td style={td('left')}><input style={inp} type="number" value={p.dbMarge} onChange={(e) => setProdukt(i, { dbMarge: e.target.value })} /></td>
                    <td style={td('center')}><input type="checkbox" checked={p.ladenhueter} onChange={(e) => setProdukt(i, { ladenhueter: e.target.checked })} /></td>
                    <td style={td('left')}><input style={{ ...inp, opacity: p.ladenhueter ? 1 : 0.4 }} type="number" disabled={!p.ladenhueter} value={p.bestandVorher} onChange={(e) => setProdukt(i, { bestandVorher: e.target.value })} /></td>
                    <td style={td('left')}><input style={{ ...inp, opacity: p.ladenhueter ? 1 : 0.4 }} type="number" disabled={!p.ladenhueter} value={p.bestandNachher} onChange={(e) => setProdukt(i, { bestandNachher: e.target.value })} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div style={{ display: 'flex', gap: 8, marginTop: 10 }}>
            <button onClick={() => setForm((f) => ({ ...f, produkte: [...f.produkte, LEER_PRODUKT()] }))}
              style={{ padding: '7px 12px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--line)', background: 'var(--panel)', cursor: 'pointer', fontSize: 12 }}>+ Produktzeile</button>
            <div style={{ flex: 1 }} />
            <button onClick={speichern}
              style={{ padding: '8px 16px', borderRadius: 'var(--radius-sm)', border: 'none', background: 'var(--accent)', color: '#fff', cursor: 'pointer', fontSize: 13, fontWeight: 600 }}>Aktion speichern</button>
          </div>
        </div>
      )}

      {/* Aktions-Karten */}
      {rows.length === 0 && (
        <div style={{ ...card, padding: 20, textAlign: 'center', color: 'var(--muted)' }}>Noch keine Aktionen angelegt.</div>
      )}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        {rows.map((e) => (
          <div key={e.id} style={{ ...card, padding: 16, borderLeft: `4px solid ${e.erfolg ? 'var(--amp-g)' : 'var(--amp-r)'}` }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12, flexWrap: 'wrap' }}>
              <div>
                <div style={{ fontWeight: 700, fontSize: 16 }}>{e.name}
                  <span style={{ marginLeft: 8, fontSize: 11, fontWeight: 600, padding: '2px 8px', borderRadius: 999,
                    background: e.erfolg ? 'var(--amp-g)' : 'var(--amp-r)', color: '#fff' }}>{e.erfolg ? 'erfolgreich' : 'unwirtschaftlich'}</span>
                </div>
                <div style={{ fontSize: 12, color: 'var(--muted)', marginTop: 3 }}>
                  {mechanikName(e.mechanik)}{e.rabatt ? ` · −${e.rabatt} %` : ''}{e.von ? ` · ${e.von} – ${e.bis}` : ''} · Werbekosten {eur0(e.kosten)}
                </div>
              </div>
              <button onClick={() => { loescheEvent(e.id); neu() }} title="Aktion löschen"
                style={{ border: '1px solid var(--line)', background: 'var(--panel)', color: 'var(--muted)', borderRadius: 'var(--radius-sm)', cursor: 'pointer', padding: '4px 9px', fontSize: 12 }}>Löschen</button>
            </div>

            <div style={{ display: 'flex', gap: 18, flexWrap: 'wrap', margin: '12px 0', fontSize: 13 }}>
              <Stat label="Mehrumsatz" wert={eur0(e.mehrumsatz)} sub={`+${e.upliftPct} %`} farbe="var(--amp-g)" />
              <Stat label="Zusätzl. DB" wert={eur0(e.zusatzDB)} />
              <Stat label="Netto-Ergebnis" wert={eur0(e.ergebnisEffekt)} farbe={e.ergebnisEffekt >= 0 ? 'var(--amp-g)' : 'var(--amp-r)'} />
              <Stat label="ROI" wert={e.roi != null ? e.roi + ' %' : '—'} farbe={e.roi >= 0 ? 'var(--amp-g)' : 'var(--amp-r)'} />
              <Stat label="Mehrumsatz/€ Werbung" wert={e.roas != null ? e.roas + '×' : '—'} />
              {e.ladenhueterAbbau > 0 && <Stat label="Ladenhüter abgebaut" wert={eur0(e.ladenhueterAbbau)} farbe="var(--accent)" />}
            </div>

            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12.5, minWidth: 560 }}>
                <thead><tr>{['Produkt', 'Normal', 'Ist', 'Mehr', 'Uplift', 'Zusatz-DB', ''].map((h, i) => <th key={i} style={th(i === 0 ? 'left' : 'right')}>{h}</th>)}</tr></thead>
                <tbody>
                  {e.produkte.map((p, i) => (
                    <tr key={i}>
                      <td style={td('left', true)}>{p.name}{p.ladenhueter ? ' 🏷️' : ''}</td>
                      <td className="mono" style={td('right')}>{eur0(p.baseUmsatz)}</td>
                      <td className="mono" style={td('right')}>{eur0(p.istUmsatz)}</td>
                      <td className="mono" style={{ ...td('right'), color: p.mehrumsatz >= 0 ? 'var(--amp-g)' : 'var(--amp-r)' }}>{p.mehrumsatz >= 0 ? '+' : ''}{eur0(p.mehrumsatz)}</td>
                      <td className="mono" style={td('right')}>{p.upliftPct >= 0 ? '+' : ''}{p.upliftPct} %</td>
                      <td className="mono" style={td('right')}>{eur0(p.zusatzDB)}</td>
                      <td style={td('right')}>{p.ladenhueter ? `Abbau ${eur0(p.ladenhueterAbbau)}` : ''}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ))}
      </div>

      <div style={{ fontSize: 12, color: 'var(--muted)', marginTop: 14 }}>
        Hinweis: „Normalumsatz" ist der ohne Aktion erwartete Umsatz im Zeitraum (Baseline). Der zusätzliche
        Deckungsbeitrag entsteht nur aus dem Mehrumsatz; davon werden die Werbekosten abgezogen → Netto-Mehrergebnis und ROI.
        {onGeh && <> Siehe auch <a style={{ color: 'var(--accent)', cursor: 'pointer' }} onClick={() => onGeh('bestand')}>Bestands-Gängigkeit</a> für die Ladenhüter.</>}
      </div>
    </div>
  )
}

function Kpi({ label, wert, farbe }) {
  return <div style={{ ...card, padding: '10px 13px', flex: 1, minWidth: 140 }}>
    <div style={cap}>{label}</div>
    <div style={{ fontSize: 20, fontWeight: 700, color: farbe || 'var(--ink)' }}>{wert}</div>
  </div>
}
function Stat({ label, wert, sub, farbe }) {
  return <div><div style={{ fontSize: 11, color: 'var(--muted)' }}>{label}</div>
    <div style={{ fontWeight: 700, color: farbe || 'var(--ink)' }}>{wert}{sub && <span style={{ fontSize: 11, color: 'var(--amp-g)', marginLeft: 5 }}>{sub}</span>}</div></div>
}
function Feld({ label, children }) {
  return <label style={{ fontSize: 11, color: 'var(--muted)' }}><div style={{ marginBottom: 3 }}>{label}</div>{children}</label>
}
