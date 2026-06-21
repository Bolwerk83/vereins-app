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
  bereicheNachCluster, KONTEXTE, bereichZusammenfassung, GRUPPEN_QUELLE
} from '../../core/gruppen.js'

const card = { background: 'var(--panel)', border: '1px solid var(--line)', borderRadius: 'var(--radius)', boxShadow: 'var(--shadow)' }
const inp = { padding: '7px 9px', border: '1px solid var(--line)', borderRadius: 'var(--radius-sm)', font: 'inherit' }

export default function RollenRechte({ onChange }) {
  const [gruppen, setGruppen] = useState(ladeGruppen())
  const [aktivId, setAktivId] = useState(gruppen[0]?.id || null)
  const [name, setName] = useState('')

  const aktiv = gruppen.find((g) => g.id === aktivId) || null

  // Nach jeder Änderung: lokalen State + App-State aktualisieren.
  const refresh = (list) => { setGruppen(list); onChange && onChange(list) }

  function set(fn) { refresh(fn()) }

  const clusterBlocks = bereicheNachCluster()

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

      <div style={{ display: 'grid', gridTemplateColumns: '300px 1fr', gap: 16, alignItems: 'start' }}>
        {/* ---- Gruppenliste ---- */}
        <div style={{ ...card, padding: 12 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
            <div className="mono" style={{ fontSize: 11, color: 'var(--muted)', textTransform: 'uppercase' }}>Gruppen ({gruppen.length})</div>
            <button onClick={() => { const l = neueGruppe(); refresh(l); setAktivId(l[l.length - 1].id) }}
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
          <button onClick={() => { if (confirm('Alle Gruppen auf die Vorlagen zurücksetzen? Eigene Gruppen und Mitglieder gehen verloren.')) { const l = setzeZurueck(); refresh(l); setAktivId(l[0].id) } }}
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
                <button onClick={() => { if (confirm(`Gruppe „${aktiv.name}" löschen?`)) { const l = loescheGruppe(aktiv.id); refresh(l); setAktivId(l[0]?.id || null) } }}
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
                  onKeyDown={(e) => { if (e.key === 'Enter' && name.trim()) { set(() => mitgliedHinzu(aktiv.id, name)); setName('') } }}
                  placeholder="Name oder Login (z. B. m.mustermann)" />
                <button onClick={() => { if (name.trim()) { set(() => mitgliedHinzu(aktiv.id, name)); setName('') } }}
                  style={{ ...inp, cursor: 'pointer', background: 'var(--accent)', color: '#fff', border: 'none', fontWeight: 600 }}>Hinzufügen</button>
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 7, marginTop: 10 }}>
                {aktiv.mitglieder.length === 0 && <span style={{ fontSize: 12, color: 'var(--muted)' }}>Noch keine Namen — später ergänzen.</span>}
                {aktiv.mitglieder.map((m) => (
                  <span key={m} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '4px 6px 4px 11px', borderRadius: 999, background: 'var(--bg)', border: '1px solid var(--line)', fontSize: 13 }}>
                    {m}
                    <button onClick={() => set(() => mitgliedWeg(aktiv.id, m))} title="Entfernen"
                      style={{ border: 'none', background: 'none', cursor: 'pointer', color: 'var(--muted)', fontSize: 15, lineHeight: 1 }}>×</button>
                  </span>
                ))}
              </div>
            </div>

            {/* Bereichsrechte */}
            <div style={{ ...card, padding: 16 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                <div className="mono" style={{ fontSize: 11, color: 'var(--muted)', textTransform: 'uppercase' }}>Sichtbare Fachbereiche</div>
                <label style={{ fontSize: 13, display: 'flex', gap: 6, alignItems: 'center', fontWeight: 600 }}>
                  <input type="checkbox" checked={aktiv.bereiche === '*'} onChange={(e) => set(() => setzeAlleBereiche(aktiv.id, e.target.checked))} />
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
                              <input type="checkbox" checked={an} onChange={() => set(() => toggleBereich(aktiv.id, b.code))} style={{ display: 'none' }} />
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
                      <input type="checkbox" checked={an} onChange={() => set(() => toggleKontext(aktiv.id, k.id))} style={{ marginTop: 2 }} />
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
    </div>
  )
}
