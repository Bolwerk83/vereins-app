// =========================================================================
//  ROLLEN & RECHTE — Gruppenverwaltung im Tool.
//  Vordefinierte Gruppen (von uns angelegt). Der Admin pflegt später die
//  Namen (Mitglieder) und passt die Bereichs-/Datenrechte an.
//  Wirkt unmittelbar auf Baum, Reports, BI, Maßnahmen, Alerts (RBAC + OLS).
// =========================================================================
import React, { useState } from 'react'
import {
  ladeGruppen, neueGruppe, aktualisiereGruppe, loescheGruppe, toggleBereich,
  setzeAlleBereiche, toggleKontext, mitgliedHinzu, mitgliedWeg, setzeZurueck,
  bereicheNachCluster, KONTEXTE, bereichZusammenfassung, GRUPPEN_QUELLE, kopiereRechte
} from '../../core/gruppen.js'
import { ladeAnfragen, loescheAnfrage } from '../../core/zugriff.js'
import { infoVon } from '../../core/berichtInfo.js'
import { protokolliere, ladeLog, leereLog } from '../../core/rollenLog.js'

const card = { background: 'var(--panel)', border: '1px solid var(--line)', borderRadius: 'var(--radius)', boxShadow: 'var(--shadow)' }
const inp = { padding: '7px 9px', border: '1px solid var(--line)', borderRadius: 'var(--radius-sm)', font: 'inherit' }

export default function RollenRechte({ onChange, benutzer }) {
  const [gruppen, setGruppen] = useState(ladeGruppen())
  const [aktivId, setAktivId] = useState(gruppen[0]?.id || null)
  const [name, setName] = useState('')
  const akteur = benutzer || 'Admin'

  const aktiv = gruppen.find((g) => g.id === aktivId) || null

  // Nach jeder Änderung: lokalen State + App-State aktualisieren.
  const refresh = (list) => { setGruppen(list); onChange && onChange(list) }

  function set(fn) { refresh(fn()) }
  // Wie set(), aber mit Audit-Log-Eintrag.
  function setLog(fn, eintrag) { const l = fn(); refresh(l); protokolliere({ ...eintrag, akteur }); setLogTick((t) => t + 1); return l }
  const log = (aktion, ziel, detail) => { protokolliere({ aktion, ziel, detail, akteur }); setLogTick((t) => t + 1) }

  const clusterBlocks = bereicheNachCluster()
  const [anfTick, setAnfTick] = useState(0)
  const [logTick, setLogTick] = useState(0)
  const [logAuf, setLogAuf] = useState(false)
  const anfragen = ladeAnfragen()
  const logEintraege = ladeLog()

  // Eine Anfrage gewähren: Bereich in der Gruppe freigeben + Antragsteller als
  // Mitglied aufnehmen (so erbt er die Rechte) + Anfrage abschließen.
  function gewaehren(req, groupId) {
    const g = gruppen.find((x) => x.id === groupId)
    if (!g) return
    let list = gruppen
    if (req.bereich && g.bereiche !== '*' && !g.bereiche.includes(req.bereich)) {
      list = toggleBereich(groupId, req.bereich)
      protokolliere({ aktion: 'bereich.add', ziel: g.name, detail: `Bereich ${req.bereich} freigegeben`, akteur })
    }
    if (req.name && !g.mitglieder.includes(req.name)) {
      list = mitgliedHinzu(groupId, req.name)
      protokolliere({ aktion: 'mitglied.add', ziel: g.name, detail: `${req.name} aufgenommen`, akteur })
    }
    loescheAnfrage(req.view, req.uid)
    protokolliere({ aktion: 'anfrage.gewaehrt', ziel: req.view, detail: `für ${req.name || req.uid} über Gruppe ${g.name}`, akteur })
    refresh(list); setAnfTick((t) => t + 1); setLogTick((t) => t + 1)
  }
  function ablehnen(req) {
    loescheAnfrage(req.view, req.uid)
    protokolliere({ aktion: 'anfrage.erledigt', ziel: req.view, detail: `Anfrage von ${req.name || req.uid} abgeschlossen`, akteur })
    setAnfTick((t) => t + 1); setLogTick((t) => t + 1)
  }
  // Rechte 1:1 von der Bezugsperson kopieren (Antragsteller in deren Gruppen aufnehmen).
  function kopiere(req) {
    const res = kopiereRechte(req.bezugsperson, req.name)
    if (!res.quelleGefunden) { alert(`„${req.bezugsperson}" ist in keiner Gruppe gefunden — bitte manuell zuordnen.`); return }
    res.gruppen.forEach((gn) => protokolliere({ aktion: 'mitglied.add', ziel: gn, detail: `${req.name} (Rechte kopiert von ${req.bezugsperson})`, akteur }))
    loescheAnfrage(req.view, req.uid)
    protokolliere({ aktion: 'anfrage.gewaehrt', ziel: req.view, detail: `Rechte von ${req.bezugsperson} kopiert für ${req.name || req.uid} (${res.gruppen.join(', ') || 'bereits identisch'})`, akteur })
    refresh(res.list); setAnfTick((t) => t + 1); setLogTick((t) => t + 1)
  }

  return (
    <div>
      <div style={{ marginBottom: 14 }}>
        <h2 style={{ margin: '0 0 4px' }}>Rollen &amp; Rechte</h2>
        <div style={{ color: 'var(--muted)', fontSize: 13 }}>
          Gruppen steuern, <b>wer welche Bereiche und vertraulichen Kennzahlen sieht</b>.
          Vordefinierte Gruppen sind angelegt — Namen (Mitglieder) und Feinrechte pflegst du hier.
          Änderungen wirken sofort im ganzen Tool.
        </div>
        {GRUPPEN_QUELLE === 'mssql' && (
          <div style={{ marginTop: 10, padding: '9px 12px', borderRadius: 'var(--radius-sm)', fontSize: 12,
            background: 'var(--amp-amber-soft, #fff7ed)', border: '1px solid var(--amp-a, #d97706)', color: 'var(--amp-a, #b45309)' }}>
            Quelle <b>MSSQL</b>: Gruppen und Mitglieder werden aus der Datenbank gelesen (<span className="mono">sec.*</span>).
            Änderungen hier wirken nur lokal in dieser Sitzung — pflege sie dauerhaft in der DB
            (<span className="mono">sec.GruppeMitglied</span>) bzw. über das Setup-Skript.
          </div>
        )}
      </div>

      {anfragen.length > 0 && (
        <div style={{ ...card, padding: 14, marginBottom: 14, borderLeft: '3px solid var(--amp-a)' }} key={anfTick}>
          <div className="mono" style={{ fontSize: 11, color: 'var(--amp-a)', textTransform: 'uppercase', fontWeight: 700, marginBottom: 8 }}>
            🔔 Offene Zugriffsanfragen ({anfragen.length}) · To-do
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {anfragen.map((a) => (
              <AnfrageRow key={a.view + a.uid} a={a} gruppen={gruppen} onGewaehren={gewaehren} onAblehnen={ablehnen} onKopieren={kopiere} />
            ))}
          </div>
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '300px 1fr', gap: 16, alignItems: 'start' }}>
        {/* ---- Gruppenliste ---- */}
        <div style={{ ...card, padding: 12 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
            <div className="mono" style={{ fontSize: 11, color: 'var(--muted)', textTransform: 'uppercase' }}>Gruppen ({gruppen.length})</div>
            <button onClick={() => { const l = neueGruppe(); refresh(l); const ng = l[l.length - 1]; setAktivId(ng.id); log('gruppe.neu', ng.name, 'Gruppe angelegt') }}
              style={{ ...inp, padding: '4px 9px', cursor: 'pointer' }}>+ Neu</button>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {gruppen.map((g) => (
              <button key={g.id} onClick={() => setAktivId(g.id)} style={{ textAlign: 'left', padding: '9px 11px', borderRadius: 'var(--radius-sm)',
                border: `1px solid ${aktivId === g.id ? 'var(--accent)' : 'var(--line)'}`,
                background: aktivId === g.id ? 'var(--accent-soft)' : 'var(--panel)', cursor: 'pointer' }}>
                <div style={{ fontWeight: 600, fontSize: 14, display: 'flex', justifyContent: 'space-between', gap: 6 }}>
                  <span>{g.name}</span>
                  {g.system && <span className="mono" style={{ fontSize: 9, color: 'var(--muted)', border: '1px solid var(--line)', borderRadius: 999, padding: '1px 6px' }}>Vorlage</span>}
                </div>
                <div style={{ fontSize: 11, color: 'var(--muted)', marginTop: 2 }}>
                  {bereichZusammenfassung(g)} · {g.mitglieder.length} Mitglied(er)
                </div>
              </button>
            ))}
          </div>
          <button onClick={() => { if (confirm('Alle Gruppen auf die Vorlagen zurücksetzen? Eigene Gruppen und Mitglieder gehen verloren.')) { const l = setzeZurueck(); refresh(l); setAktivId(l[0].id); log('gruppe.reset', null, 'Auf Vorlagen zurückgesetzt') } }}
            style={{ ...inp, width: '100%', marginTop: 10, cursor: 'pointer', color: 'var(--muted)', fontSize: 12 }}>↺ Auf Vorlagen zurücksetzen</button>
        </div>

        {/* ---- Editor ---- */}
        {!aktiv ? (
          <div style={{ ...card, padding: 20, color: 'var(--muted)' }}>Wähle links eine Gruppe.</div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {/* Stammdaten */}
            <div style={{ ...card, padding: 16 }}>
              <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'flex-end' }}>
                <label style={{ fontSize: 11, color: 'var(--muted)', flex: 1, minWidth: 180 }}>Gruppenname<br />
                  <input style={{ ...inp, marginTop: 3, width: '100%' }} value={aktiv.name}
                    onChange={(e) => set(() => aktualisiereGruppe(aktiv.id, { name: e.target.value }))} /></label>
                <button onClick={() => { if (confirm(`Gruppe „${aktiv.name}" löschen?`)) { const nm = aktiv.name; const l = loescheGruppe(aktiv.id); refresh(l); setAktivId(l[0]?.id || null); log('gruppe.loeschen', nm, 'Gruppe gelöscht') } }}
                  style={{ ...inp, cursor: 'pointer', color: 'var(--amp-r)', borderColor: 'var(--amp-r)' }}>Gruppe löschen</button>
              </div>
              <label style={{ fontSize: 11, color: 'var(--muted)', display: 'block', marginTop: 10 }}>Beschreibung<br />
                <input style={{ ...inp, marginTop: 3, width: '100%' }} value={aktiv.beschreibung || ''}
                  onChange={(e) => set(() => aktualisiereGruppe(aktiv.id, { beschreibung: e.target.value }))} placeholder="Wofür ist diese Gruppe?" /></label>
            </div>

            {/* Mitglieder */}
            <div style={{ ...card, padding: 16 }}>
              <div className="mono" style={{ fontSize: 11, color: 'var(--muted)', textTransform: 'uppercase', marginBottom: 8 }}>Mitglieder — Namen pflegen</div>
              <div style={{ display: 'flex', gap: 8 }}>
                <input style={{ ...inp, flex: 1 }} value={name} onChange={(e) => setName(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter' && name.trim()) { setLog(() => mitgliedHinzu(aktiv.id, name), { aktion: 'mitglied.add', ziel: aktiv.name, detail: name.trim() }); setName('') } }}
                  placeholder="Name oder Login (z. B. m.mustermann)" />
                <button onClick={() => { if (name.trim()) { setLog(() => mitgliedHinzu(aktiv.id, name), { aktion: 'mitglied.add', ziel: aktiv.name, detail: name.trim() }); setName('') } }}
                  style={{ ...inp, cursor: 'pointer', background: 'var(--accent)', color: '#fff', border: 'none', fontWeight: 600 }}>Hinzufügen</button>
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 7, marginTop: 10 }}>
                {aktiv.mitglieder.length === 0 && <span style={{ fontSize: 12, color: 'var(--muted)' }}>Noch keine Namen — später ergänzen.</span>}
                {aktiv.mitglieder.map((m) => (
                  <span key={m} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '4px 6px 4px 11px', borderRadius: 999, background: 'var(--bg)', border: '1px solid var(--line)', fontSize: 13 }}>
                    {m}
                    <button onClick={() => setLog(() => mitgliedWeg(aktiv.id, m), { aktion: 'mitglied.remove', ziel: aktiv.name, detail: m })} title="Entfernen"
                      style={{ border: 'none', background: 'none', cursor: 'pointer', color: 'var(--muted)', fontSize: 15, lineHeight: 1 }}>×</button>
                  </span>
                ))}
              </div>
            </div>

            {/* Bereichsrechte */}
            <div style={{ ...card, padding: 16 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                <div className="mono" style={{ fontSize: 11, color: 'var(--muted)', textTransform: 'uppercase' }}>Sichtbare Fachbereiche</div>
                <div style={{ flex: 1 }} />
                <span title="Diese Bereiche steuern Berichtsbaum UND Menü-Filter „Nur meine Bereiche“." style={{ fontSize: 10.5, color: 'var(--muted)', marginRight: 8 }}>steuert Baum + Menü</span>
                <label style={{ fontSize: 13, display: 'flex', gap: 6, alignItems: 'center', fontWeight: 600 }}>
                  <input type="checkbox" checked={aktiv.bereiche === '*'} onChange={(e) => setLog(() => setzeAlleBereiche(aktiv.id, e.target.checked), { aktion: 'bereich.alle', ziel: aktiv.name, detail: e.target.checked ? 'alle Bereiche freigegeben' : 'Einzelauswahl aktiviert' })} />
                  Alle Bereiche
                </label>
              </div>
              {aktiv.bereiche === '*' ? (
                <div style={{ fontSize: 13, color: 'var(--muted)' }}>Diese Gruppe sieht <b>alle Fachbereiche</b>. Häkchen entfernen, um einzeln zu wählen.</div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {clusterBlocks.map(({ cluster, bereiche }) => (
                    <div key={cluster.id}>
                      <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--muted)', marginBottom: 5 }}>{cluster.name}</div>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                        {bereiche.map((b) => {
                          const an = aktiv.bereiche.includes(b.code)
                          return (
                            <label key={b.code} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, padding: '5px 10px', borderRadius: 999, cursor: 'pointer',
                              border: `1px solid ${an ? 'var(--accent)' : 'var(--line)'}`, background: an ? 'var(--accent-soft)' : 'var(--panel)', color: an ? 'var(--accent)' : 'var(--ink)' }}>
                              <input type="checkbox" checked={an} onChange={() => setLog(() => toggleBereich(aktiv.id, b.code), { aktion: an ? 'bereich.remove' : 'bereich.add', ziel: aktiv.name, detail: `${b.name} (${b.code})` })} style={{ display: 'none' }} />
                              {an ? '✓' : '＋'} {b.name}
                            </label>
                          )
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Vertrauliche Daten (Object-Level-Security) */}
            <div style={{ ...card, padding: 16 }}>
              <div className="mono" style={{ fontSize: 11, color: 'var(--muted)', textTransform: 'uppercase', marginBottom: 4 }}>Vertrauliche Kennzahlen (Datenfreigabe)</div>
              <div style={{ fontSize: 12, color: 'var(--muted)', marginBottom: 10 }}>Zusätzliche Sperre: geschützte KPIs (z. B. Personalkosten) sind nur mit passender Freigabe sichtbar — auch innerhalb erlaubter Bereiche.</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {KONTEXTE.map((k) => {
                  const an = aktiv.kontext.includes(k.id)
                  return (
                    <label key={k.id} style={{ display: 'flex', gap: 10, alignItems: 'flex-start', padding: '8px 11px', borderRadius: 'var(--radius-sm)', cursor: 'pointer',
                      border: `1px solid ${an ? 'var(--accent)' : 'var(--line)'}`, background: an ? 'var(--accent-soft)' : 'var(--panel)' }}>
                      <input type="checkbox" checked={an} onChange={() => setLog(() => toggleKontext(aktiv.id, k.id), { aktion: an ? 'kontext.remove' : 'kontext.add', ziel: aktiv.name, detail: `Datenfreigabe ${k.name}` })} style={{ marginTop: 2 }} />
                      <div>
                        <div style={{ fontWeight: 600, fontSize: 13 }}>{k.name}</div>
                        <div style={{ fontSize: 11, color: 'var(--muted)' }}>{k.hinweis}</div>
                      </div>
                    </label>
                  )
                })}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Protokoll / Audit-Log */}
      <div style={{ ...card, padding: 14, marginTop: 16 }} key={logTick}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8, cursor: 'pointer' }} onClick={() => setLogAuf((v) => !v)}>
          <div className="mono" style={{ fontSize: 11, color: 'var(--muted)', textTransform: 'uppercase', fontWeight: 700 }}>
            📜 Rollen-/Rechte-Protokoll ({logEintraege.length})
          </div>
          <span style={{ color: 'var(--muted)', transform: logAuf ? 'rotate(90deg)' : 'none', transition: 'transform .15s' }}>›</span>
        </div>
        {logAuf && (
          <div style={{ marginTop: 10 }}>
            {logEintraege.length === 0 && <div style={{ fontSize: 13, color: 'var(--muted)' }}>Noch keine Änderungen protokolliert.</div>}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 2, maxHeight: 320, overflowY: 'auto' }}>
              {logEintraege.map((e, i) => (
                <div key={i} style={{ display: 'flex', gap: 10, alignItems: 'baseline', fontSize: 12.5, padding: '5px 8px', borderBottom: '1px solid var(--line)' }}>
                  <span className="mono" style={{ color: 'var(--muted)', whiteSpace: 'nowrap', fontSize: 11 }}>{new Date(e.zeit).toLocaleString('de-DE', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })}</span>
                  <span style={{ fontWeight: 600, whiteSpace: 'nowrap' }}>{e.akteur}</span>
                  <span className="mono" style={{ fontSize: 10.5, color: 'var(--accent)', background: 'var(--accent-soft)', borderRadius: 5, padding: '1px 6px', whiteSpace: 'nowrap' }}>{e.aktion}</span>
                  <span style={{ flex: 1 }}>{e.ziel ? <b>{e.ziel}</b> : null}{e.ziel && e.detail ? ' · ' : ''}{e.detail}</span>
                </div>
              ))}
            </div>
            {logEintraege.length > 0 && (
              <button onClick={() => { if (confirm('Protokoll wirklich leeren?')) { leereLog(); setLogTick((t) => t + 1) } }}
                style={{ ...inp, marginTop: 10, cursor: 'pointer', color: 'var(--muted)', fontSize: 12 }}>Protokoll leeren</button>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

// --- Eine Zugriffsanfrage als To-do-Karte mit Freigabe-Aktion ------------
function AnfrageRow({ a, gruppen, onGewaehren, onAblehnen, onKopieren }) {
  const card2 = { padding: '10px 12px', border: '1px solid var(--line)', borderRadius: 'var(--radius-sm)' }
  const inpS = { padding: '6px 9px', border: '1px solid var(--line)', borderRadius: 'var(--radius-sm)', font: 'inherit', fontSize: 13 }
  // Vorauswahl: Gruppe, die den Bereich schon hat (oder „alle"), sonst erste.
  const passt = gruppen.find((g) => g.bereiche === '*' || (Array.isArray(g.bereiche) && a.bereich && g.bereiche.includes(a.bereich)))
  const [groupId, setGroupId] = React.useState((passt || gruppen[0])?.id || '')
  return (
    <div style={card2}>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, flexWrap: 'wrap' }}>
        <b>{a.name || a.uid || 'Gast'}</b>
        <span style={{ fontSize: 13 }}>möchte Zugriff auf <b className="mono">{a.view}</b></span>
        {a.bereich && <span style={{ fontSize: 11, color: 'var(--muted)', border: '1px solid var(--line)', borderRadius: 999, padding: '1px 8px' }}>Bereich {a.bereich}</span>}
        <span style={{ fontSize: 11, color: 'var(--muted)', marginLeft: 'auto' }}>{new Date(a.zeit).toLocaleString('de-DE', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })}</span>
      </div>
      {infoVon(a.view) && <div style={{ fontSize: 12, color: 'var(--muted)', marginTop: 2 }}>{infoVon(a.view).zweck}</div>}
      {a.begruendung && <div style={{ fontSize: 13, marginTop: 6 }}><b style={{ fontSize: 11, color: 'var(--muted)' }}>BEGRÜNDUNG:</b> {a.begruendung}</div>}
      {a.bezugsperson && <div style={{ fontSize: 13, marginTop: 3 }}><b style={{ fontSize: 11, color: 'var(--muted)' }}>RECHTE KOPIEREN VON:</b> {a.bezugsperson}</div>}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 10, flexWrap: 'wrap' }}>
        <span style={{ fontSize: 12, color: 'var(--muted)' }}>Freigeben in Gruppe:</span>
        <select value={groupId} onChange={(e) => setGroupId(e.target.value)} style={inpS}>
          {gruppen.map((g) => <option key={g.id} value={g.id}>{g.name}</option>)}
        </select>
        <button onClick={() => onGewaehren(a, groupId)} disabled={!groupId}
          style={{ ...inpS, cursor: 'pointer', background: 'var(--accent)', color: '#fff', border: 'none', fontWeight: 600 }}>✓ Freigeben</button>
        {a.bezugsperson && (
          <button onClick={() => onKopieren(a)} title={`${a.name} in alle Gruppen von ${a.bezugsperson} aufnehmen`}
            style={{ ...inpS, cursor: 'pointer', border: '1px solid var(--accent)', color: 'var(--accent)', fontWeight: 600 }}>⧉ Rechte von {a.bezugsperson} kopieren</button>
        )}
        <button onClick={() => onAblehnen(a)} style={{ ...inpS, cursor: 'pointer', color: 'var(--muted)' }}>Erledigt / Ablehnen</button>
      </div>
    </div>
  )
}
