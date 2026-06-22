// =========================================================================
//  KI-REPORT-BUILDER (Mockup) — vorhandene Kennzahlen auswählen, die KI
//  schlägt Darstellungen vor, per Knopfdruck entsteht ein Berichtsentwurf.
//  Prüft vorher, ob ähnliche Berichte schon existieren (Duplikat-Vermeidung).
//  Jeder Nutzer hat einen eigenen Ordner; Berichte/Ordner sind teilbar.
// =========================================================================
import React, { useState } from 'react'
import { KATALOG, vorschlag, generiereBericht } from '../../core/kiBuilder.js'
import { kiAktiv, ladeKi, modusInfo } from '../../core/kiEinstellungen.js'
import { nutzerId, nutzerLabel } from '../../core/identitaet.js'
import {
  eigeneBerichte, sichtbareBerichte, speichereBericht, loescheBericht, teileBericht, teileOrdner, aehnlicheBerichte,
  ladeGlobale, alsGlobalSpeichern, loescheGlobal, togglePrivat, entdeckbareBerichte
} from '../../core/berichtOrdner.js'

const card = { background: 'var(--panel)', border: '1px solid var(--line)', borderRadius: 'var(--radius)', boxShadow: 'var(--shadow)' }
const cap = { fontSize: 11, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '.04em', fontWeight: 700 }

export default function KiBuilder({ benutzer, istAdmin }) {
  const uid = nutzerId(benutzer || 'Gast')
  const [sel, setSel] = useState([])
  const [entwurf, setEntwurf] = useState(null)
  const [privat, setPrivat] = useState(false)
  const [, setTick] = useState(0)
  const refresh = () => setTick((t) => t + 1)
  const ki = ladeKi(); const an = kiAktiv()
  const toggle = (id) => setSel((s) => s.includes(id) ? s.filter((x) => x !== id) : [...s, id])
  const aehnlich = sel.length ? aehnlicheBerichte(sel, uid) : []
  const sichtbar = sichtbareBerichte(uid)
  const entdecken = entdeckbareBerichte(uid)

  const erstellen = () => setEntwurf(generiereBericht(sel))
  const speichern = () => { if (entwurf && sel.length) { speichereBericht(uid, { titel: entwurf.titel, items: sel, summary: entwurf.summary, privat }); setEntwurf(null); setSel([]); refresh() } }
  const teilenMit = (id) => { const n = prompt('Bericht teilen mit (Benutzername):'); if (n) { teileBericht(uid, id, nutzerId(n)); refresh() } }
  const ordnerTeilen = () => { const n = prompt('Ganzen Ordner teilen mit (Benutzername):'); if (n) { teileOrdner(uid, nutzerId(n)); refresh() } }
  const oeffnen = (b) => { setSel(b.items || []); setEntwurf(generiereBericht(b.items || [])) }
  const globalSpeichern = (b) => { alsGlobalSpeichern({ titel: b.titel, items: b.items, summary: b.summary, vonUid: b.besitzer || uid }); refresh() }
  const globale = ladeGlobale()

  return (
    <div style={{ maxWidth: 1080, margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', gap: 12, flexWrap: 'wrap', marginBottom: 12 }}>
        <div>
          <div style={cap}>Berichte · KI-gestützt erstellen</div>
          <h2 style={{ margin: '4px 0 0' }}>KI-Report-Builder</h2>
        </div>
        <span style={{ fontSize: 12, fontWeight: 700, color: an ? 'var(--amp-g)' : 'var(--muted)' }}>
          {an ? `✨ KI aktiv · ${modusInfo(ki.modus).kurz}` : '○ KI deaktiviert (Admin)'}
        </span>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1fr) minmax(0,1.4fr)', gap: 16, alignItems: 'start' }}>
        {/* Auswahl */}
        <div style={{ ...card, padding: 14 }}>
          <div style={{ ...cap, marginBottom: 8 }}>Vorhandene Kennzahlen wählen ({sel.length})</div>
          <div style={{ display: 'grid', gap: 5 }}>
            {KATALOG.map((it) => (
              <label key={it.id} style={{ display: 'flex', gap: 8, alignItems: 'center', padding: '5px 7px', borderRadius: 'var(--radius-sm)', cursor: 'pointer', background: sel.includes(it.id) ? 'var(--bg)' : 'transparent' }}>
                <input type="checkbox" checked={sel.includes(it.id)} onChange={() => toggle(it.id)} />
                <span style={{ flex: 1, fontSize: 13 }}>{it.name}</span>
                <span style={{ fontSize: 10.5, color: 'var(--muted)' }}>{it.einheit}</span>
              </label>
            ))}
          </div>
          <button onClick={erstellen} disabled={!sel.length} style={{ width: '100%', marginTop: 10, padding: '9px', borderRadius: 'var(--radius-sm)', border: 'none', cursor: sel.length ? 'pointer' : 'not-allowed',
            background: sel.length ? 'var(--accent)' : 'var(--line)', color: '#fff', fontWeight: 700, fontSize: 13.5 }}>
            {an ? '✨ KI-Bericht erstellen' : '＋ Bericht erstellen'}
          </button>
        </div>

        {/* Vorschau: ähnliche Berichte + KI-Vorschläge + Entwurf */}
        <div style={{ display: 'grid', gap: 14 }}>
          {/* Duplikat-Check */}
          {aehnlich.length > 0 && !entwurf && (
            <div style={{ ...card, padding: 14, borderLeft: '3px solid var(--amp-a)' }}>
              <div style={{ ...cap, marginBottom: 6 }}>⚠ Ähnliche Berichte gibt es bereits</div>
              <div style={{ fontSize: 12.5, color: 'var(--slate)', marginBottom: 8 }}>Bevor du neu baust — passt einer davon?</div>
              {aehnlich.map((b) => (
                <div key={b.id} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '5px 0', borderBottom: '1px solid var(--line)' }}>
                  <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--amp-a)' }}>{Math.round(b.score * 100)} %</span>
                  <span style={{ flex: 1, fontSize: 13, fontWeight: 600 }}>{b.titel} <span style={{ fontSize: 11, color: 'var(--muted)', fontWeight: 400 }}>· {b.eigen ? 'eigen' : 'geteilt von ' + nutzerLabel(b.besitzer)}</span></span>
                  <button onClick={() => oeffnen(b)} style={{ fontSize: 11.5, cursor: 'pointer', border: '1px solid var(--accent)', color: 'var(--accent)', background: 'var(--panel)', borderRadius: 999, padding: '2px 10px', fontWeight: 600 }}>öffnen</button>
                </div>
              ))}
            </div>
          )}

          {/* KI-Vorschläge je Auswahl */}
          {an && sel.length > 0 && (
            <div style={{ ...card, padding: 14 }}>
              <div style={{ ...cap, marginBottom: 8 }}>✨ KI bereitet Darstellungen vor</div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 8 }}>
                {sel.map(vorschlag).filter(Boolean).map((v) => (
                  <div key={v.id} style={{ border: '1px solid var(--line)', borderRadius: 'var(--radius-sm)', padding: 9 }}>
                    <div style={{ fontSize: 13, fontWeight: 600 }}>{v.icon} {v.name}</div>
                    <div style={{ fontSize: 11.5, color: 'var(--accent)', fontWeight: 600 }}>{v.viz}</div>
                    <div style={{ fontSize: 11, color: 'var(--muted)' }}>{v.warum}</div>
                    {v.insight && <div style={{ fontSize: 11.5, color: 'var(--slate)', marginTop: 4, lineHeight: 1.35 }}>{v.insight}</div>}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Entwurf */}
          {entwurf && (
            <div style={{ ...card, padding: 16, borderLeft: '3px solid var(--amp-g)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 8 }}>
                <h3 style={{ margin: 0, fontSize: 16 }}>{entwurf.titel}</h3>
                <div style={{ display: 'flex', gap: 8 }}>
                  <label style={{ fontSize: 12, display: 'inline-flex', alignItems: 'center', gap: 4, cursor: 'pointer' }} title="Privat = nicht im Entdecken-Bereich sichtbar"><input type="checkbox" checked={privat} onChange={(e) => setPrivat(e.target.checked)} />🔒 privat</label>
                  <button onClick={speichern} style={{ fontSize: 12.5, cursor: 'pointer', border: 'none', background: 'var(--amp-g)', color: '#fff', borderRadius: 999, padding: '4px 12px', fontWeight: 600 }}>💾 In meinem Ordner speichern</button>
                  {istAdmin && <button onClick={() => globalSpeichern(entwurf)} title="Als globalen Bericht für alle ablegen" style={{ fontSize: 12.5, cursor: 'pointer', border: '1px solid var(--accent)', color: 'var(--accent)', background: 'var(--panel)', borderRadius: 999, padding: '4px 12px', fontWeight: 600 }}>🌐 Als global speichern</button>}
                  <button onClick={() => setEntwurf(null)} style={{ fontSize: 12.5, cursor: 'pointer', border: '1px solid var(--line)', background: 'var(--panel)', borderRadius: 999, padding: '4px 12px' }}>verwerfen</button>
                </div>
              </div>
              <div style={{ fontSize: 12.5, color: 'var(--slate)', margin: '6px 0 10px', lineHeight: 1.45 }}>{entwurf.summary}</div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 8 }}>
                {entwurf.bloecke.map((b) => (
                  <div key={b.id} style={{ border: '1px solid var(--line)', borderRadius: 'var(--radius-sm)', padding: 10, background: 'var(--bg)' }}>
                    <div style={{ fontSize: 22 }}>{b.icon}</div>
                    <div style={{ fontSize: 13, fontWeight: 600 }}>{b.name}</div>
                    <div style={{ fontSize: 11, color: 'var(--accent)' }}>{b.viz}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Mein Ordner */}
      <div style={{ ...card, padding: 16, marginTop: 16 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 8, marginBottom: 8 }}>
          <div style={cap}>📁 Mein Berichtsordner — {nutzerLabel(uid)} ({eigeneBerichte(uid).length} eigen, {sichtbar.length} sichtbar)</div>
          <button onClick={ordnerTeilen} style={{ fontSize: 12, cursor: 'pointer', border: '1px solid var(--accent)', color: 'var(--accent)', background: 'var(--panel)', borderRadius: 999, padding: '3px 11px', fontWeight: 600 }}>👥 Ganzen Ordner teilen</button>
        </div>
        {sichtbar.length === 0 && <div style={{ fontSize: 13, color: 'var(--muted)' }}>Noch keine Berichte. Wähle Kennzahlen und erstelle deinen ersten Bericht.</div>}
        {sichtbar.map((b) => (
          <div key={b.id + b.besitzer} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '7px 0', borderBottom: '1px solid var(--line)' }}>
            <span>{b.eigen ? '📄' : '🔗'}</span>
            <span style={{ flex: 1, fontSize: 13, fontWeight: 600 }}>{b.titel}{b.eigen && b.privat && <span title="privat" style={{ marginLeft: 5 }}>🔒</span>}
              <span style={{ fontSize: 11, color: 'var(--muted)', fontWeight: 400 }}> · {(b.items || []).length} Kennzahlen · {b.erstellt}{b.eigen ? '' : ' · geteilt von ' + nutzerLabel(b.besitzer)}</span>
            </span>
            <button onClick={() => oeffnen(b)} style={{ fontSize: 11.5, cursor: 'pointer', border: '1px solid var(--line)', background: 'var(--panel)', borderRadius: 999, padding: '2px 10px' }}>öffnen</button>
            {b.eigen && <button onClick={() => { togglePrivat(uid, b.id); refresh() }} title={b.privat ? 'auf entdeckbar stellen' : 'auf privat stellen'} style={{ fontSize: 11.5, cursor: 'pointer', border: '1px solid var(--line)', background: 'var(--panel)', borderRadius: 999, padding: '2px 10px' }}>{b.privat ? '🔒' : '🌍'}</button>}
            {b.eigen && <button onClick={() => teilenMit(b.id)} style={{ fontSize: 11.5, cursor: 'pointer', border: '1px solid var(--accent)', color: 'var(--accent)', background: 'var(--panel)', borderRadius: 999, padding: '2px 10px' }}>teilen</button>}
            {istAdmin && <button onClick={() => globalSpeichern(b)} title="Als globalen Bericht freigeben" style={{ fontSize: 11.5, cursor: 'pointer', border: '1px solid var(--accent)', color: 'var(--accent)', background: 'var(--panel)', borderRadius: 999, padding: '2px 10px' }}>🌐 global</button>}
            {b.eigen && <button onClick={() => { loescheBericht(uid, b.id); refresh() }} title="löschen" style={{ border: 'none', background: 'none', cursor: 'pointer', color: 'var(--muted)' }}>🗑</button>}
          </div>
        ))}
      </div>

      {/* Entdecken — Berichte anderer (nicht privat) */}
      <div style={{ ...card, padding: 16, marginTop: 14 }}>
        <div style={{ ...cap, marginBottom: 8 }}>🔭 Berichte entdecken — von anderen angelegt ({entdecken.length})</div>
        <div style={{ fontSize: 11.5, color: 'var(--muted)', marginBottom: 8 }}>Nur nicht-private Berichte. Das Öffnen unterliegt zusätzlich deinen Berechtigungen (RBAC/Datenfreigabe).</div>
        {entdecken.length === 0 && <div style={{ fontSize: 13, color: 'var(--muted)' }}>Keine entdeckbaren Berichte anderer Nutzer.</div>}
        {entdecken.map((b) => (
          <div key={b.id} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '7px 0', borderBottom: '1px solid var(--line)' }}>
            <span>🔭</span>
            <span style={{ flex: 1, fontSize: 13, fontWeight: 600 }}>{b.titel}
              <span style={{ fontSize: 11, color: 'var(--muted)', fontWeight: 400 }}> · von {nutzerLabel(b.besitzer)} · {(b.items || []).length} Kennzahlen</span>
            </span>
            <button onClick={() => oeffnen(b)} style={{ fontSize: 11.5, cursor: 'pointer', border: '1px solid var(--line)', background: 'var(--panel)', borderRadius: 999, padding: '2px 10px' }}>öffnen</button>
            {istAdmin && <button onClick={() => globalSpeichern(b)} title="Als globalen Bericht freigeben" style={{ fontSize: 11.5, cursor: 'pointer', border: '1px solid var(--accent)', color: 'var(--accent)', background: 'var(--panel)', borderRadius: 999, padding: '2px 10px' }}>🌐 global</button>}
          </div>
        ))}
      </div>

      {/* Globale Berichte (vom Admin freigegeben) */}
      <div style={{ ...card, padding: 16, marginTop: 14 }}>
        <div style={{ ...cap, marginBottom: 8 }}>🌐 Globale Berichte ({globale.length}){istAdmin ? ' · vom Admin freigegeben' : ''}</div>
        {globale.length === 0 && <div style={{ fontSize: 13, color: 'var(--muted)' }}>Noch keine globalen Berichte. Ein Admin kann gute Berichte hier ablegen.</div>}
        {globale.map((b) => (
          <div key={b.id} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '7px 0', borderBottom: '1px solid var(--line)' }}>
            <span>🌐</span>
            <span style={{ flex: 1, fontSize: 13, fontWeight: 600 }}>{b.titel}
              <span style={{ fontSize: 11, color: 'var(--muted)', fontWeight: 400 }}> · {(b.items || []).length} Kennzahlen · {b.erstellt}</span>
            </span>
            <button onClick={() => oeffnen(b)} style={{ fontSize: 11.5, cursor: 'pointer', border: '1px solid var(--line)', background: 'var(--panel)', borderRadius: 999, padding: '2px 10px' }}>öffnen</button>
            {istAdmin && <button onClick={() => { loescheGlobal(b.id); refresh() }} title="aus global entfernen" style={{ border: 'none', background: 'none', cursor: 'pointer', color: 'var(--muted)' }}>🗑</button>}
          </div>
        ))}
      </div>
    </div>
  )
}
