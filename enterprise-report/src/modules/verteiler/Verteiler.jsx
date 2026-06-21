// =========================================================================
//  VERTEILER — automatischen Berichtsversand definieren (Hybrid-Standard).
//  Zeitplan UND/ODER Ereignis. Vorschau zeigt das reproduzierbare
//  Versand-Paket inkl. Datenstand-Stempel. Realer Versand: Backend-Scheduler.
// =========================================================================
import React, { useState } from 'react'
import {
  MODI, FORMATE, RHYTHMEN, EREIGNISSE, BERICHT_OPTIONEN,
  ladeVerteiler, neuerVerteiler, aktualisiere, loesche, versandPaket, datenstandStempel
} from '../../core/verteiler.js'

const card = { background: 'var(--panel)', border: '1px solid var(--line)', borderRadius: 'var(--radius)', boxShadow: 'var(--shadow)' }
const inp = { padding: '7px 9px', border: '1px solid var(--line)', borderRadius: 'var(--radius-sm)', font: 'inherit' }
const istMail = (s) => /\S+@\S+\.\S+/.test(s)

export default function Verteiler() {
  const [liste, setListe] = useState(ladeVerteiler())
  const [aktivId, setAktivId] = useState(liste[0]?.id || null)
  const [mail, setMail] = useState('')
  const [vorschau, setVorschau] = useState(null)

  const v = liste.find((x) => x.id === aktivId) || null
  const refresh = (l) => setListe(l)
  const set = (patch) => refresh(aktualisiere(v.id, patch))
  const toggle = (feld, wert) => set({ [feld]: v[feld].includes(wert) ? v[feld].filter((x) => x !== wert) : [...v[feld], wert] })

  return (
    <div>
      <div style={{ marginBottom: 14 }}>
        <h2 style={{ margin: '0 0 4px' }}>Verteiler — automatischer Versand</h2>
        <div style={{ color: 'var(--muted)', fontSize: 13, maxWidth: 740 }}>
          Berichte automatisch verschicken — per <b>Zeitplan</b> und/oder <b>Ereignis</b>. Standard ist <b>Hybrid</b>:
          ein reproduzierbarer Datenstand wird als PDF/Excel angehängt und um einen Live-Link ergänzt, jeweils mit
          Datenstand-Stempel.
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '280px 1fr', gap: 16, alignItems: 'start' }} className="raster-2">
        {/* Liste */}
        <div style={{ ...card, padding: 12 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
            <div className="mono" style={{ fontSize: 11, color: 'var(--muted)', textTransform: 'uppercase' }}>Verteiler ({liste.length})</div>
            <button onClick={() => { const l = neuerVerteiler(); refresh(l); setAktivId(l[l.length - 1].id) }} style={{ ...inp, padding: '4px 9px', cursor: 'pointer' }}>+ Neu</button>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {liste.map((x) => (
              <button key={x.id} onClick={() => setAktivId(x.id)} style={{ textAlign: 'left', padding: '9px 11px', borderRadius: 'var(--radius-sm)', cursor: 'pointer',
                border: `1px solid ${aktivId === x.id ? 'var(--accent)' : 'var(--line)'}`, background: aktivId === x.id ? 'var(--accent-soft)' : 'var(--panel)' }}>
                <div style={{ fontWeight: 600, fontSize: 14, display: 'flex', justifyContent: 'space-between', gap: 6 }}>
                  <span>{x.name}</span><span style={{ fontSize: 16 }}>{x.aktiv ? '🟢' : '⚪'}</span>
                </div>
                <div style={{ fontSize: 11, color: 'var(--muted)' }}>{x.rhythmus} · {x.empfaenger.length} Empfänger</div>
              </button>
            ))}
            {liste.length === 0 && <div style={{ fontSize: 12, color: 'var(--muted)' }}>Noch kein Verteiler — „+ Neu".</div>}
          </div>
        </div>

        {/* Editor */}
        {!v ? <div style={{ ...card, padding: 20, color: 'var(--muted)' }}>Wähle links einen Verteiler.</div> : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div style={{ ...card, padding: 16 }}>
              <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'flex-end' }}>
                <label style={{ fontSize: 11, color: 'var(--muted)', flex: 1, minWidth: 180 }}>Name<br />
                  <input style={{ ...inp, marginTop: 3, width: '100%' }} value={v.name} onChange={(e) => set({ name: e.target.value })} /></label>
                <label style={{ fontSize: 11, color: 'var(--muted)' }}>Bericht<br />
                  <select style={{ ...inp, marginTop: 3 }} value={v.bericht} onChange={(e) => set({ bericht: e.target.value })}>
                    {BERICHT_OPTIONEN.map((b) => <option key={b.id} value={b.id}>{b.name}</option>)}</select></label>
                <label style={{ fontSize: 12, display: 'flex', alignItems: 'center', gap: 6, fontWeight: 600 }}>
                  <input type="checkbox" checked={v.aktiv} onChange={(e) => set({ aktiv: e.target.checked })} /> aktiv</label>
                <button onClick={() => { if (confirm(`Verteiler „${v.name}" löschen?`)) { const l = loesche(v.id); refresh(l); setAktivId(l[0]?.id || null) } }}
                  style={{ ...inp, cursor: 'pointer', color: 'var(--amp-r)', borderColor: 'var(--amp-r)' }}>Löschen</button>
              </div>
            </div>

            {/* Empfänger */}
            <div style={{ ...card, padding: 16 }}>
              <div className="mono" style={{ fontSize: 11, color: 'var(--muted)', textTransform: 'uppercase', marginBottom: 8 }}>Empfänger</div>
              <div style={{ display: 'flex', gap: 8 }}>
                <input style={{ ...inp, flex: 1 }} value={mail} onChange={(e) => setMail(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter' && istMail(mail)) { set({ empfaenger: [...v.empfaenger, mail.trim()] }); setMail('') } }}
                  placeholder="name@firma.de" />
                <button onClick={() => { if (istMail(mail)) { set({ empfaenger: [...v.empfaenger, mail.trim()] }); setMail('') } }}
                  style={{ ...inp, cursor: 'pointer', background: 'var(--accent)', color: '#fff', border: 'none', fontWeight: 600 }}>Hinzufügen</button>
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 7, marginTop: 10 }}>
                {v.empfaenger.length === 0 && <span style={{ fontSize: 12, color: 'var(--muted)' }}>Noch keine Empfänger.</span>}
                {v.empfaenger.map((m) => (
                  <span key={m} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '4px 6px 4px 11px', borderRadius: 999, background: 'var(--bg)', border: '1px solid var(--line)', fontSize: 13 }}>
                    {m}<button onClick={() => set({ empfaenger: v.empfaenger.filter((x) => x !== m) })} style={{ border: 'none', background: 'none', cursor: 'pointer', color: 'var(--muted)', fontSize: 15 }}>×</button></span>
                ))}
              </div>
            </div>

            {/* Modus & Format */}
            <div style={{ ...card, padding: 16 }}>
              <div className="mono" style={{ fontSize: 11, color: 'var(--muted)', textTransform: 'uppercase', marginBottom: 8 }}>Was wird versendet?</div>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 10 }}>
                {MODI.map((mo) => (
                  <button key={mo.id} onClick={() => set({ modus: mo.id })} title={mo.hinweis} style={{ padding: '7px 12px', borderRadius: 999, fontSize: 13, cursor: 'pointer',
                    border: `1px solid ${v.modus === mo.id ? 'var(--accent)' : 'var(--line)'}`, background: v.modus === mo.id ? 'var(--accent-soft)' : 'var(--panel)', color: v.modus === mo.id ? 'var(--accent)' : 'var(--ink)' }}>{mo.name}</button>
                ))}
              </div>
              <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap' }}>
                {FORMATE.map((f) => (
                  <label key={f.id} style={{ fontSize: 13, display: 'flex', gap: 6, alignItems: 'center' }}>
                    <input type="checkbox" checked={v.formate.includes(f.id)} onChange={() => toggle('formate', f.id)} disabled={v.modus === 'live' && f.id !== 'link'} />{f.name}</label>
                ))}
              </div>
            </div>

            {/* Auslösung: Zeitplan + Ereignis */}
            <div style={{ ...card, padding: 16 }}>
              <div className="mono" style={{ fontSize: 11, color: 'var(--muted)', textTransform: 'uppercase', marginBottom: 8 }}>Wann wird versendet? (kombinierbar)</div>
              <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'flex-end' }}>
                <label style={{ fontSize: 11, color: 'var(--muted)' }}>Rhythmus<br />
                  <select style={{ ...inp, marginTop: 3 }} value={v.rhythmus} onChange={(e) => set({ rhythmus: e.target.value })}>
                    {RHYTHMEN.map((r) => <option key={r.id} value={r.id}>{r.name}</option>)}</select></label>
                <label style={{ fontSize: 11, color: 'var(--muted)' }}>Uhrzeit<br />
                  <input type="time" style={{ ...inp, marginTop: 3 }} value={v.zeit} onChange={(e) => set({ zeit: e.target.value })} /></label>
                <label style={{ fontSize: 11, color: 'var(--muted)' }}>Tag/Regel<br />
                  <input style={{ ...inp, marginTop: 3 }} value={v.tag} onChange={(e) => set({ tag: e.target.value })} placeholder="z. B. 5. Werktag" /></label>
              </div>
              <div style={{ fontSize: 11, color: 'var(--muted)', margin: '12px 0 6px' }}>Zusätzlich bei Ereignis:</div>
              <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap' }}>
                {EREIGNISSE.map((e) => (
                  <label key={e.id} style={{ fontSize: 13, display: 'flex', gap: 6, alignItems: 'center' }}>
                    <input type="checkbox" checked={v.ereignisse.includes(e.id)} onChange={() => toggle('ereignisse', e.id)} />{e.name}</label>
                ))}
              </div>
            </div>

            {/* Vorschau */}
            <div style={{ ...card, padding: 16 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div className="mono" style={{ fontSize: 11, color: 'var(--muted)', textTransform: 'uppercase' }}>Vorschau / Testlauf</div>
                <button onClick={() => { setVorschau(versandPaket(v)); set({ letzterVersand: new Date().toLocaleString('de-DE') }) }}
                  style={{ ...inp, cursor: 'pointer', background: 'var(--accent)', color: '#fff', border: 'none', fontWeight: 600 }}>▷ Testlauf (kein realer Versand)</button>
              </div>
              <div style={{ fontSize: 12, color: 'var(--muted)', marginTop: 8 }}>Datenstand-Stempel: <span className="mono">{datenstandStempel()}</span></div>
              {v.letzterVersand && <div style={{ fontSize: 11, color: 'var(--muted)', marginTop: 2 }}>Letzter Testlauf: {v.letzterVersand}</div>}
              {vorschau && (
                <pre style={{ marginTop: 10, padding: 12, background: 'var(--bg)', border: '1px solid var(--line)', borderRadius: 'var(--radius-sm)', fontSize: 12, overflow: 'auto' }}>{JSON.stringify(vorschau, null, 2)}</pre>
              )}
              <div style={{ fontSize: 11, color: 'var(--muted)', marginTop: 8 }}>
                Realer Versand läuft über den Backend-Scheduler (Cron + Mailversand) — Einrichtung siehe <span className="mono">docs/16-verteiler.md</span>.
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
