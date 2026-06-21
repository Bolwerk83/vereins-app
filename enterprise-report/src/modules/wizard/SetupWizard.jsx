// =========================================================================
//  MODUL: Setup-Wizard (Erststart)
//  Fragt ab, WIE die Berichte aufgebaut werden, und erzeugt daraus
//  (a) eine Reporting-Konfiguration und (b) die Liste der zu füllenden
//  SQL-Dateien. So entsteht der Berichtsbaum aus Antworten, nicht aus Code.
// =========================================================================
import React, { useState } from 'react'
import { KPI } from '../../core/kpiRegistry.js'
import { Badge } from '../../components/ui.jsx'

const BEREICHE = [
  { code: 'VK', name: 'Verkauf' }, { code: 'EK', name: 'Einkauf' },
  { code: 'PR', name: 'Produktion' }, { code: 'LOG', name: 'Logistik & Lager' },
  { code: 'HR', name: 'Human Resources' }, { code: 'IT', name: 'IT' },
  { code: 'FIN', name: 'Finanzen' }
]

const SCHRITTE = ['Unternehmen', 'Fachbereiche', 'Datenquelle', 'Rollen', 'Zusammenfassung']

export default function SetupWizard({ onFertig, onAbbruch }) {
  const [schritt, setSchritt] = useState(0)
  const [cfg, setCfg] = useState({
    firma: 'VeloWerk Gruppe', waehrung: 'EUR', geschaeftsjahr: '2025',
    konsolidierung: 'Stichtagskurs',
    bereiche: ['VK', 'EK', 'PR', 'LOG', 'FIN'],
    db: { typ: 'mssql', server: '', datenbank: '', schema: 'dbo', auth: 'windows' },
    rollen: { gf: true, controlling: true, bereichsleiter: true, mitarbeiter: false }
  })
  const set = (patch) => setCfg((c) => ({ ...c, ...patch }))
  const toggleBereich = (code) => set({ bereiche: cfg.bereiche.includes(code)
    ? cfg.bereiche.filter((b) => b !== code) : [...cfg.bereiche, code] })

  const aktiveKpis = Object.values(KPI).filter((k) => k.bereich === 'GF' || cfg.bereiche.includes(k.bereich))
  const sqlDateien = aktiveKpis.filter((k) => k.sqlRef).map((k) => `sql/${k.sqlRef}.kpi.sql`)

  const card = { background: 'var(--panel)', border: '1px solid var(--line)', borderRadius: 'var(--radius)', padding: 24, boxShadow: 'var(--shadow)' }
  const inp = { width: '100%', padding: '8px 10px', border: '1px solid var(--line)', borderRadius: 'var(--radius-sm)', font: 'inherit', marginTop: 4 }
  const lbl = { fontSize: 12, color: 'var(--muted)', fontWeight: 600 }

  return (
    <div style={{ maxWidth: 720, margin: '0 auto' }}>
      {/* Stepper */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 16, flexWrap: 'wrap' }}>
        {SCHRITTE.map((s, i) => (
          <div key={s} className="mono" style={{ fontSize: 11, padding: '4px 10px', borderRadius: 999,
            background: i === schritt ? 'var(--accent)' : 'var(--panel)', color: i === schritt ? '#fff' : 'var(--muted)',
            border: '1px solid var(--line)' }}>{i + 1}. {s}</div>
        ))}
      </div>

      <div style={card}>
        {schritt === 0 && (
          <div style={{ display: 'grid', gap: 14 }}>
            <h2>Unternehmen</h2>
            <div><span style={lbl}>Firma / Gruppe</span><input style={inp} value={cfg.firma} onChange={(e) => set({ firma: e.target.value })} /></div>
            <div style={{ display: 'flex', gap: 12 }}>
              <div style={{ flex: 1 }}><span style={lbl}>Währung (Konsolidierung)</span>
                <select style={inp} value={cfg.waehrung} onChange={(e) => set({ waehrung: e.target.value })}>
                  <option>EUR</option><option>CHF</option><option>USD</option></select></div>
              <div style={{ flex: 1 }}><span style={lbl}>Geschäftsjahr</span><input style={inp} value={cfg.geschaeftsjahr} onChange={(e) => set({ geschaeftsjahr: e.target.value })} /></div>
            </div>
            <div><span style={lbl}>Umrechnung Fremdwährung</span>
              <select style={inp} value={cfg.konsolidierung} onChange={(e) => set({ konsolidierung: e.target.value })}>
                <option>Stichtagskurs</option><option>Durchschnittskurs</option></select></div>
          </div>
        )}

        {schritt === 1 && (
          <div style={{ display: 'grid', gap: 12 }}>
            <h2>Welche Fachbereiche (Ebene 2) sollen in den Baum?</h2>
            <p style={{ color: 'var(--muted)', margin: 0, fontSize: 13 }}>Die GF-Ebene (Konzern) ist immer aktiv. Jede Auswahl erzeugt Themenbereiche, Details und SQL-Stubs.</p>
            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
              {BEREICHE.map((b) => (
                <button key={b.code} onClick={() => toggleBereich(b.code)} style={{ padding: '10px 14px', borderRadius: 'var(--radius-sm)',
                  border: `1px solid ${cfg.bereiche.includes(b.code) ? 'var(--accent)' : 'var(--line)'}`,
                  background: cfg.bereiche.includes(b.code) ? 'var(--accent-soft)' : 'var(--panel)',
                  color: cfg.bereiche.includes(b.code) ? 'var(--accent)' : 'var(--ink)', fontWeight: 500 }}>
                  {cfg.bereiche.includes(b.code) ? '✓ ' : ''}{b.name}</button>
              ))}
            </div>
          </div>
        )}

        {schritt === 2 && (
          <div style={{ display: 'grid', gap: 14 }}>
            <h2>Datenquelle (MSSQL)</h2>
            <p style={{ color: 'var(--muted)', margin: 0, fontSize: 13 }}>Diese Verbindung nutzt das Backend (server/) später, um die SQL-Dateien gegen den Microsoft-SQL-Server auszuführen.</p>
            <div style={{ display: 'flex', gap: 12 }}>
              <div style={{ flex: 2 }}><span style={lbl}>Server / Instanz</span><input style={inp} placeholder="SQLPROD01\\REPORTING" value={cfg.db.server} onChange={(e) => set({ db: { ...cfg.db, server: e.target.value } })} /></div>
              <div style={{ flex: 1 }}><span style={lbl}>Datenbank</span><input style={inp} placeholder="ERP_DWH" value={cfg.db.datenbank} onChange={(e) => set({ db: { ...cfg.db, datenbank: e.target.value } })} /></div>
            </div>
            <div style={{ display: 'flex', gap: 12 }}>
              <div style={{ flex: 1 }}><span style={lbl}>Schema</span><input style={inp} value={cfg.db.schema} onChange={(e) => set({ db: { ...cfg.db, schema: e.target.value } })} /></div>
              <div style={{ flex: 1 }}><span style={lbl}>Authentifizierung</span>
                <select style={inp} value={cfg.db.auth} onChange={(e) => set({ db: { ...cfg.db, auth: e.target.value } })}>
                  <option value="windows">Windows / Integrated</option><option value="sql">SQL-Login</option></select></div>
            </div>
          </div>
        )}

        {schritt === 3 && (
          <div style={{ display: 'grid', gap: 12 }}>
            <h2>Rollen & Rechte</h2>
            <p style={{ color: 'var(--muted)', margin: 0, fontSize: 13 }}>Object-Level-Security (z. B. Personalkosten) bleibt unabhängig davon aktiv. Vordefinierte Gruppen sind bereits angelegt — Mitglieder (Namen) und Feinrechte pflegst du später unter <b>„Rollen &amp; Rechte"</b> in der Kopfzeile.</p>
            {Object.entries({ gf: 'Geschäftsführung (alles)', controlling: 'Controlling (alles, Finanzkontext)', bereichsleiter: 'Bereichsleiter (eigener Bereich + GF)', mitarbeiter: 'Mitarbeiter (eingeschränkte Lesesicht)' }).map(([k, label]) => (
              <label key={k} style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 14 }}>
                <input type="checkbox" checked={cfg.rollen[k]} onChange={(e) => set({ rollen: { ...cfg.rollen, [k]: e.target.checked } })} />
                {label}</label>
            ))}
          </div>
        )}

        {schritt === 4 && (
          <div style={{ display: 'grid', gap: 14 }}>
            <h2>Zusammenfassung</h2>
            <div style={{ fontSize: 13, color: 'var(--slate)' }}>
              <b>{cfg.firma}</b> · {cfg.waehrung} · GJ {cfg.geschaeftsjahr}<br />
              Fachbereiche: {cfg.bereiche.map((b) => <Badge key={b} status="g">{b}</Badge>).reduce((a, c) => [a, ' ', c])}<br />
              Datenquelle: MSSQL {cfg.db.server || '—'} / {cfg.db.datenbank || '—'} ({cfg.db.auth})
            </div>
            <div>
              <div style={lbl}>Diese SQL-Dateien musst du danach füllen ({sqlDateien.length}):</div>
              <pre className="mono" style={{ background: '#0f172a', color: '#e2e8f0', padding: 12, borderRadius: 'var(--radius-sm)',
                fontSize: 11.5, overflow: 'auto', marginTop: 6 }}>{sqlDateien.join('\n')}</pre>
            </div>
            <div style={lbl}>Erzeugte Konfiguration (config.json):</div>
            <pre className="mono" style={{ background: 'var(--bg)', padding: 12, borderRadius: 'var(--radius-sm)', fontSize: 11.5, overflow: 'auto' }}>{JSON.stringify(cfg, null, 2)}</pre>
          </div>
        )}
      </div>

      {/* Navigation */}
      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 16 }}>
        <button onClick={schritt === 0 ? onAbbruch : () => setSchritt(schritt - 1)}
          style={{ padding: '9px 16px', border: '1px solid var(--line)', borderRadius: 'var(--radius-sm)', background: 'var(--panel)' }}>
          {schritt === 0 ? 'Abbrechen' : '← Zurück'}</button>
        {schritt < SCHRITTE.length - 1
          ? <button onClick={() => setSchritt(schritt + 1)} style={{ padding: '9px 16px', border: 'none', borderRadius: 'var(--radius-sm)', background: 'var(--accent)', color: '#fff', fontWeight: 600 }}>Weiter →</button>
          : <button onClick={() => onFertig(cfg)} style={{ padding: '9px 16px', border: 'none', borderRadius: 'var(--radius-sm)', background: 'var(--amp-g)', color: '#fff', fontWeight: 600 }}>Fertig & Baum öffnen ✓</button>}
      </div>
    </div>
  )
}
