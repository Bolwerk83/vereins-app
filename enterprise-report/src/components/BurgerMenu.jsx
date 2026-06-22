// =========================================================================
//  BURGER-MENÜ (☰) — globale, MEHRSTUFIGE Navigation mit Rollen-/Rechte-
//  Schicht: Gruppe (aufklappbar) → Untergruppe (Bereich) → Eintrag.
//  Zusätzlich: ⭐ Favoriten oben, „Nur meine Bereiche"-Filter und
//  Relevanz-Sortierung (Einträge der eigenen Rolle zuerst).
// =========================================================================
import React, { useState } from 'react'
import { ladeFavoriten, toggleFavorit } from '../core/favoriten.js'

const ALLE_KEY = 'er_nav_alle' // false (Standard) = nur eigene Bereiche; true = alles zeigen
const untergruppenVon = (g) => g.untergruppen || (g.eintraege ? [{ titel: null, eintraege: g.eintraege }] : [])
const rel = (e) => e.relevant !== false                 // undefined = übergreifend = relevant
const sortRel = (a, b) => (rel(b) ? 1 : 0) - (rel(a) ? 1 : 0)

function Eintrag({ e, onNav, fav, onFav, onInfo, dim, locked }) {
  return (
    <div style={{ display: 'flex', alignItems: 'stretch', gap: 2, opacity: dim ? 0.55 : 1 }}>
      <button onClick={() => { e.onClick(); onNav() }} title={locked ? 'Keine Berechtigung – Info anzeigen' : undefined}
        style={{ flex: 1, textAlign: 'left', padding: '8px 10px', borderRadius: 'var(--radius-sm)', cursor: 'pointer', fontSize: 13.5,
          border: `1px solid ${e.aktiv ? 'var(--accent)' : 'transparent'}`,
          background: e.aktiv ? 'var(--accent-soft)' : 'transparent', color: e.aktiv ? 'var(--accent)' : 'var(--ink)',
          display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8, fontWeight: e.aktiv ? 600 : 400 }}>
        <span>{locked ? '🔒 ' : (e.icon ? `${e.icon} ` : '')}{e.label}</span>
        {e.badge ? <span className="mono" style={{ fontSize: 11, color: 'var(--amp-r)' }}>{e.badge}</span> : null}
      </button>
      {e.view && (
        <button onClick={(ev) => { ev.stopPropagation(); onInfo(e.view) }} title="Bericht-Info"
          style={{ width: 26, border: 'none', background: 'none', cursor: 'pointer', fontSize: 13, color: 'var(--muted)' }}>ⓘ</button>
      )}
      {e.view && !locked && (
        <button onClick={(ev) => { ev.stopPropagation(); onFav(e.view) }} title={fav ? 'Aus Favoriten entfernen' : 'Zu Favoriten'}
          style={{ width: 26, border: 'none', background: 'none', cursor: 'pointer', fontSize: 14, color: fav ? 'var(--amp-a)' : 'var(--line)' }}>
          {fav ? '★' : '☆'}
        </button>
      )}
    </div>
  )
}

export default function BurgerMenu({ gruppen = [], onInfo }) {
  const [auf, setAuf] = useState(false)
  const [tick, setTick] = useState(0)
  const info = (view) => { onInfo?.(view); setAuf(false) }
  // Standard: nur die Berichte der eigenen Rolle. Haken „Alle anzeigen" als Override.
  const [alleAnzeigen, setAlleAnzeigen] = useState(() => { try { return localStorage.getItem(ALLE_KEY) === '1' } catch { return false } })
  const [offen, setOffen] = useState(() => {
    const s = new Set(gruppen.filter((g) => untergruppenVon(g).some((u) => (u.eintraege || []).some((e) => e.aktiv))).map((g) => g.titel))
    if (s.size === 0 && gruppen[0]) s.add(gruppen[0].titel)
    return s
  })
  const toggle = (titel) => setOffen((s) => { const n = new Set(s); n.has(titel) ? n.delete(titel) : n.add(titel); return n })
  const schliessen = () => setAuf(false)
  const setAlle = (v) => { setAlleAnzeigen(v); try { localStorage.setItem(ALLE_KEY, v ? '1' : '0') } catch {} }
  const onFav = (view) => { toggleFavorit(view); setTick((t) => t + 1) }

  const favSet = new Set(ladeFavoriten())
  const alleEintraege = gruppen.flatMap((g) => untergruppenVon(g).flatMap((u) => u.eintraege || []))
  const favEintraege = ladeFavoriten().map((v) => alleEintraege.find((e) => e.view === v)).filter(Boolean)
  const sichtbar = (e) => alleAnzeigen || rel(e)

  return (
    <>
      <button onClick={() => setAuf(true)} title="Menü" aria-label="Menü öffnen"
        style={{ width: 34, height: 34, borderRadius: 'var(--radius-sm)', border: '1px solid var(--line)',
          background: 'var(--panel)', cursor: 'pointer', fontSize: 16, lineHeight: 1 }}>☰</button>

      {auf && (
        <div onClick={schliessen} className="no-print"
          style={{ position: 'fixed', inset: 0, zIndex: 70, background: 'rgba(15,23,42,.45)' }}>
          <aside onClick={(e) => e.stopPropagation()}
            style={{ position: 'absolute', top: 0, left: 0, bottom: 0, width: 330, maxWidth: '90vw', background: 'var(--panel)',
              borderRight: '1px solid var(--line)', boxShadow: '6px 0 30px rgba(0,0,0,.18)', overflowY: 'auto', padding: 14 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
              <div style={{ fontWeight: 700, fontSize: 16 }}>Navigation</div>
              <button onClick={schliessen} title="Schließen" style={{ border: 'none', background: 'none', fontSize: 22, cursor: 'pointer', color: 'var(--muted)', lineHeight: 1 }}>×</button>
            </div>

            {/* Rollenfilter: standardmäßig nur eigene Bereiche; Haken zeigt alles */}
            <label style={{ display: 'flex', alignItems: 'center', gap: 7, fontSize: 12.5, color: 'var(--muted)', marginBottom: 12, cursor: 'pointer' }}>
              <input type="checkbox" checked={alleAnzeigen} onChange={(e) => setAlle(e.target.checked)} />
              Alle Berichte anzeigen (auch fremde Bereiche)
            </label>

            {/* Favoriten */}
            {favEintraege.length > 0 && (
              <div style={{ marginBottom: 8, border: '1px solid var(--line)', borderRadius: 'var(--radius-sm)', overflow: 'hidden' }}>
                <div style={{ padding: '9px 12px', background: 'var(--bg)', fontWeight: 700, fontSize: 13.5 }}>⭐ Favoriten</div>
                <div style={{ padding: '4px 8px 8px', display: 'flex', flexDirection: 'column', gap: 3 }}>
                  {favEintraege.map((e) => <Eintrag key={'fav-' + e.view} e={e} onNav={schliessen} fav onFav={onFav} onInfo={info} locked={!rel(e)} />)}
                </div>
              </div>
            )}

            {gruppen.map((g) => {
              const istOffen = offen.has(g.titel)
              const ug = untergruppenVon(g).map((u) => ({ ...u, eintraege: (u.eintraege || []).filter(sichtbar) })).filter((u) => u.eintraege.length)
              const anzahl = ug.reduce((n, u) => n + u.eintraege.length, 0)
              if (!anzahl) return null
              return (
                <div key={g.titel} style={{ marginBottom: 6, border: '1px solid var(--line)', borderRadius: 'var(--radius-sm)', overflow: 'hidden' }}>
                  <button onClick={() => toggle(g.titel)}
                    style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8, padding: '10px 12px',
                      border: 'none', cursor: 'pointer', background: istOffen ? 'var(--bg)' : 'var(--panel)', fontWeight: 700, fontSize: 13.5, color: 'var(--ink)' }}>
                    <span>{g.icon ? `${g.icon} ` : ''}{g.titel}</span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span className="mono" style={{ fontSize: 10.5, color: 'var(--muted)' }}>{anzahl}</span>
                      <span style={{ color: 'var(--muted)', transform: istOffen ? 'rotate(90deg)' : 'none', transition: 'transform .15s' }}>›</span>
                    </span>
                  </button>
                  {istOffen && (
                    <div style={{ padding: '4px 8px 10px' }}>
                      {ug.map((u, i) => (
                        <div key={u.titel || i} style={{ marginTop: u.titel ? 8 : 2 }}>
                          {u.titel && <div className="mono" style={{ fontSize: 10, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '.05em', margin: '2px 4px 5px' }}>{u.titel}</div>}
                          <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                            {[...u.eintraege].sort(sortRel).map((e) => (
                              <Eintrag key={e.label} e={e} onNav={schliessen} fav={favSet.has(e.view)} onFav={onFav} onInfo={info} dim={alleAnzeigen && !rel(e)} locked={!rel(e)} />
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )
            })}
          </aside>
        </div>
      )}
    </>
  )
}
