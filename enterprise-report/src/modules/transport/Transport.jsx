// =========================================================================
//  TRANSPORTWESEN — Berichte/Artefakte auswählen und in die nächste Instanz
//  heben (dev → test direkt, test → prod per Pull Request).
//  Zwei Wege: automatisch über das Backend (Git) oder Bundle herunterladen
//  und auf der Zielinstanz importieren.
// =========================================================================
import React, { useState, useEffect } from 'react'
import { STAGES, AKTUELLE_STAGE, stageInfo, naechsteStage, freigabeModus } from '../../core/stage.js'
import { ARTEFAKT_TYPEN, bundleErstellen, bundleAnwenden, bundleDownload } from '../../core/transport.js'

const card = { background: 'var(--panel)', border: '1px solid var(--line)', borderRadius: 'var(--radius)', boxShadow: 'var(--shadow)' }
const inp = { padding: '7px 9px', border: '1px solid var(--line)', borderRadius: 'var(--radius-sm)', font: 'inherit' }

function StageChip({ id, aktiv }) {
  const s = stageInfo(id)
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '4px 11px', borderRadius: 999,
      border: `1px solid ${s.farbe}`, background: aktiv ? s.farbe : 'transparent', color: aktiv ? '#fff' : s.farbe, fontWeight: 700, fontSize: 12 }}>
      <span style={{ width: 8, height: 8, borderRadius: '50%', background: aktiv ? '#fff' : s.farbe }} />{s.kurz}
    </span>
  )
}

export default function Transport({ benutzer }) {
  const [stage, setStage] = useState({ aktuell: AKTUELLE_STAGE, quelle: 'lokal' })
  const [tab, setTab] = useState('senden')
  const [auswahl, setAuswahl] = useState({})        // { typId: Set(ids) }
  const [auftraege, setAuftraege] = useState([])
  const [meldung, setMeldung] = useState(null)
  const [busy, setBusy] = useState(false)

  // Maßgebliche Stage + bisherige Transportaufträge vom Backend (best-effort).
  useEffect(() => {
    fetch('/api/stage').then((r) => r.ok ? r.json() : null).then((s) => s && setStage({ aktuell: s.aktuell, quelle: 'backend' })).catch(() => {})
    fetch('/api/transport').then((r) => r.ok ? r.json() : []).then(setAuftraege).catch(() => {})
  }, [])

  const aktuell = stage.aktuell
  const ziel = naechsteStage(aktuell)
  const modus = ziel ? freigabeModus(ziel.id) : null

  const toggle = (typId, id) => setAuswahl((a) => {
    const set = new Set(a[typId] || [])
    set.has(id) ? set.delete(id) : set.add(id)
    return { ...a, [typId]: set }
  })
  const alle = (typId, ids) => setAuswahl((a) => ({ ...a, [typId]: new Set((a[typId]?.size === ids.length) ? [] : ids) }))
  const gesamt = Object.values(auswahl).reduce((n, s) => n + s.size, 0)

  function baue() {
    const sel = Object.fromEntries(Object.entries(auswahl).map(([k, s]) => [k, [...s]]))
    return bundleErstellen(sel, { von: aktuell, nach: ziel.id, modus, autor: benutzer || 'unbekannt' })
  }

  async function transportiere() {
    if (!gesamt || !ziel) return
    setBusy(true); setMeldung(null)
    const bundle = baue()
    try {
      const r = await fetch(`/api/transport`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(bundle) })
      if (!r.ok) throw new Error('Backend nicht erreichbar')
      const gespeichert = await r.json()
      const p = await fetch(`/api/transport/${gespeichert.id}/promote`, { method: 'POST' })
      const erg = await p.json()
      setAuftraege((a) => [{ ...gespeichert, ...erg }, ...a])
      setMeldung(deutung(erg, bundle))
    } catch {
      setMeldung({ art: 'warn', text: 'Kein Backend/Git erreichbar. Bundle wird stattdessen heruntergeladen — auf der Zielinstanz unter „Empfangen" importieren.' })
      bundleDownload(bundle)
    }
    setBusy(false)
  }

  function deutung(erg, bundle) {
    if (erg.status === 'gepusht') return { art: 'ok', text: `✓ ${bundle.anzahl} Artefakt(e) nach ${stageInfo(ziel.id).kurz} gepusht (Branch ${erg.branch}).` }
    if (erg.status === 'pr') return { art: 'ok', text: `✓ Transport-Branch ${erg.branch} gepusht. Pull Request gegen ${stageInfo(ziel.id).kurz} öffnen:`, link: erg.prUrl }
    if (erg.status === 'gespeichert') return { art: 'warn', text: `Bundle gespeichert (${erg.datei}). Git nicht konfiguriert — manuell übernehmen oder Bundle herunterladen.` }
    return { art: 'warn', text: erg.grund || 'Transport ausgeführt.' }
  }

  // ---- Empfangen: Bundle-Datei importieren ----
  function importDatei(e) {
    const f = e.target.files?.[0]; if (!f) return
    const leser = new FileReader()
    leser.onload = () => {
      try {
        const bundle = JSON.parse(leser.result)
        const bericht = bundleAnwenden(bundle)
        setMeldung({ art: 'ok', text: `✓ ${bundle.id} importiert — ${bericht.join(' · ')}. Neu laden, damit alles greift.` })
      } catch { setMeldung({ art: 'warn', text: 'Datei ist kein gültiges Transport-Bundle.' }) }
    }
    leser.readAsText(f)
  }

  return (
    <div>
      <div style={{ marginBottom: 14 }}>
        <h2 style={{ margin: '0 0 4px' }}>Transportwesen — dev / test / prod</h2>
        <div style={{ color: 'var(--muted)', fontSize: 13, maxWidth: 760 }}>
          Berichte und Konfiguration zwischen den drei Instanzen bewegen. Auswahl wird als Transportauftrag gebündelt
          und über Git in die nächste Instanz gehoben — <b>dev → test direkt</b>, <b>test → prod per Pull Request</b>.
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 12 }}>
          {STAGES.map((s, i) => (
            <React.Fragment key={s.id}>
              {i > 0 && <span style={{ color: 'var(--muted)' }}>→</span>}
              <StageChip id={s.id} aktiv={s.id === aktuell} />
            </React.Fragment>
          ))}
          <span style={{ fontSize: 11, color: 'var(--muted)', marginLeft: 8 }}>
            Diese Instanz: <b>{stageInfo(aktuell).name}</b> ({stage.quelle === 'backend' ? 'Backend' : 'VITE_STAGE'})
          </span>
        </div>
      </div>

      <div style={{ display: 'flex', gap: 8, marginBottom: 14 }}>
        {[['senden', `Senden → ${ziel ? stageInfo(ziel.id).kurz : '—'}`], ['empfangen', 'Empfangen (Import)'], ['verlauf', `Verlauf (${auftraege.length})`]].map(([id, label]) => (
          <button key={id} onClick={() => { setTab(id); setMeldung(null) }} style={{ ...inp, cursor: 'pointer', fontWeight: 600,
            border: `1px solid ${tab === id ? 'var(--accent)' : 'var(--line)'}`, background: tab === id ? 'var(--accent-soft)' : 'var(--panel)', color: tab === id ? 'var(--accent)' : 'var(--ink)' }}>{label}</button>
        ))}
      </div>

      {meldung && (
        <div style={{ marginBottom: 14, padding: '10px 13px', borderRadius: 'var(--radius-sm)', fontSize: 13,
          background: meldung.art === 'ok' ? 'var(--amp-g-soft)' : 'var(--amp-a-soft)', border: `1px solid ${meldung.art === 'ok' ? 'var(--amp-g)' : 'var(--amp-a)'}` }}>
          {meldung.text} {meldung.link && <a href={meldung.link} target="_blank" rel="noreferrer" style={{ fontWeight: 700 }}>Pull Request öffnen ↗</a>}
        </div>
      )}

      {/* SENDEN */}
      {tab === 'senden' && (!ziel ? (
        <div style={{ ...card, padding: 20, color: 'var(--muted)' }}>Produktion ist die letzte Stufe — von hier wird nicht weiter transportiert.</div>
      ) : (
        <>
          <div style={{ display: 'grid', gap: 12 }}>
            {ARTEFAKT_TYPEN.map((typ) => {
              const items = typ.liste()
              const sel = auswahl[typ.id] || new Set()
              return (
                <div key={typ.id} style={{ ...card, padding: 14 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: items.length ? 10 : 0 }}>
                    <div style={{ fontWeight: 700, fontSize: 14 }}>{typ.icon} {typ.name} <span style={{ color: 'var(--muted)', fontWeight: 400 }}>({items.length})</span></div>
                    {items.length > 0 && <button onClick={() => alle(typ.id, items.map((i) => i.id))} style={{ ...inp, padding: '3px 9px', cursor: 'pointer', fontSize: 12 }}>{sel.size === items.length ? 'Keine' : 'Alle'}</button>}
                  </div>
                  {items.length === 0 ? <div style={{ fontSize: 12, color: 'var(--muted)' }}>Nichts vorhanden.</div> : (
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                      {items.map((it) => (
                        <label key={it.id} style={{ display: 'inline-flex', alignItems: 'center', gap: 7, padding: '5px 11px', borderRadius: 999, fontSize: 13, cursor: 'pointer',
                          border: `1px solid ${sel.has(it.id) ? 'var(--accent)' : 'var(--line)'}`, background: sel.has(it.id) ? 'var(--accent-soft)' : 'var(--bg)' }}>
                          <input type="checkbox" checked={sel.has(it.id)} onChange={() => toggle(typ.id, it.id)} style={{ margin: 0 }} />{it.name}</label>
                      ))}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
          <div style={{ ...card, padding: 16, marginTop: 14, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 10, position: 'sticky', bottom: 12 }}>
            <div style={{ fontSize: 13 }}>
              <b>{gesamt}</b> Artefakt(e) ausgewählt · Ziel <b>{stageInfo(ziel.id).name}</b> ·
              Modus <b style={{ color: modus === 'pr' ? 'var(--amp-a)' : 'var(--amp-g)' }}>{modus === 'pr' ? 'Pull Request' : 'direkter Push'}</b>
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <button disabled={!gesamt} onClick={() => bundleDownload(baue())} style={{ ...inp, cursor: gesamt ? 'pointer' : 'default', opacity: gesamt ? 1 : .5 }}>⤓ Bundle</button>
              <button disabled={!gesamt || busy} onClick={transportiere} style={{ ...inp, cursor: gesamt ? 'pointer' : 'default', opacity: (gesamt && !busy) ? 1 : .5,
                background: 'var(--accent)', color: '#fff', border: 'none', fontWeight: 700 }}>{busy ? 'Transportiere …' : `🚚 Nach ${stageInfo(ziel.id).kurz} transportieren`}</button>
            </div>
          </div>
        </>
      ))}

      {/* EMPFANGEN */}
      {tab === 'empfangen' && (
        <div style={{ ...card, padding: 20 }}>
          <div style={{ fontWeight: 700, marginBottom: 6 }}>Transport-Bundle importieren</div>
          <div style={{ fontSize: 13, color: 'var(--muted)', marginBottom: 12, maxWidth: 620 }}>
            Auf dieser Instanz ({stageInfo(aktuell).name}) ein empfangenes Bundle (<span className="mono">TR-….json</span>) einspielen.
            Gleiche IDs werden ersetzt; danach Seite neu laden.
          </div>
          <input type="file" accept="application/json,.json" onChange={importDatei} />
        </div>
      )}

      {/* VERLAUF */}
      {tab === 'verlauf' && (
        <div style={{ ...card, padding: 16 }}>
          {auftraege.length === 0 ? <div style={{ fontSize: 13, color: 'var(--muted)' }}>Noch keine Transportaufträge.</div> : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {auftraege.map((t) => (
                <div key={t.id} style={{ padding: '10px 12px', border: '1px solid var(--line)', borderRadius: 'var(--radius-sm)', display: 'flex', justifyContent: 'space-between', gap: 10, flexWrap: 'wrap' }}>
                  <div>
                    <span className="mono" style={{ fontWeight: 700 }}>{t.id}</span>
                    <span style={{ margin: '0 8px', fontSize: 12 }}><StageChip id={t.von} /> → <StageChip id={t.nach} /></span>
                    <span style={{ fontSize: 12, color: 'var(--muted)' }}>{t.anzahl} Artefakt(e) · {t.autor}</span>
                  </div>
                  <span style={{ fontSize: 12, fontWeight: 600, color: (t.status === 'gepusht' || t.status === 'pr') ? 'var(--amp-g)' : 'var(--amp-a)' }}>{t.status || 'erstellt'}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
