import React, { useState, useEffect } from 'react'
import { ROLLEN } from './core/rbac.js'
import { ladeKpiWerte, pruefeVerbindung, PERIODEN, AKTUELLE_PERIODE, QUELLE } from './core/dataProvider.js'
import TreeNavigator from './modules/tree-navigator/TreeNavigator.jsx'
import ManagementReport from './modules/management-report/ManagementReport.jsx'
import SetupWizard from './modules/wizard/SetupWizard.jsx'
import SelfServiceBI from './modules/self-service-bi/SelfServiceBI.jsx'
import Datenqualitaet from './modules/datenqualitaet/Datenqualitaet.jsx'
import Massnahmen from './modules/massnahmen/Massnahmen.jsx'
import ControllingInstrumente from './modules/controlling-instrumente/ControllingInstrumente.jsx'
import Alerts from './modules/alerts/Alerts.jsx'
import Berichtskatalog from './modules/katalog/Berichtskatalog.jsx'
import ReportDesigner from './modules/designer/ReportDesigner.jsx'
import { validierungsZusammenfassung } from './core/validierung.js'
import { alertAnzahl } from './core/alerts.js'
import { useT, SPRACHEN } from './core/i18n.jsx'

const SETUP_KEY = 'er_setup_done'

export default function App() {
  // Erststart -> Wizard, sonst Baum.
  const [ansicht, setAnsicht] = useState(localStorage.getItem(SETUP_KEY) ? 'baum' : 'wizard')
  const [rolleId, setRolleId] = useState('gf')
  const [periode, setPeriode] = useState(AKTUELLE_PERIODE)
  const [werte, setWerte] = useState({})
  const [verbindung, setVerbindung] = useState(null)
  const [mnKontext, setMnKontext] = useState(null)
  const [baumStart, setBaumStart] = useState(null)
  const rolle = ROLLEN[rolleId]
  const { t, lang, setLang } = useT()

  useEffect(() => { ladeKpiWerte(periode).then(setWerte) }, [periode])
  useEffect(() => { pruefeVerbindung().then(setVerbindung) }, [])

  const topBtn = (aktiv) => ({ padding: '6px 10px', borderRadius: 'var(--radius-sm)', fontSize: 12,
    border: '1px solid var(--line)', background: aktiv ? 'var(--accent)' : 'var(--panel)', color: aktiv ? '#fff' : 'var(--ink)' })

  return (
    <div>
      {/* Topbar */}
      <header className="no-print" style={{ position: 'sticky', top: 0, zIndex: 10, background: 'var(--panel)', borderBottom: '1px solid var(--line)',
        padding: '10px 20px', display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 26, height: 26, borderRadius: 7, background: 'var(--accent)' }} />
          <div>
            <div style={{ fontWeight: 700 }}>Enterprise Report</div>
            <div className="mono" style={{ fontSize: 10, color: 'var(--muted)' }}>
              {t('lbl.source')}: {QUELLE.toUpperCase()}
              {verbindung && (
                <span style={{ marginLeft: 6,
                  color: verbindung.status === 'ok' ? 'var(--amp-g)' : verbindung.status === 'fehler' ? 'var(--amp-r)' : 'var(--muted)' }}>
                  ● {verbindung.status === 'ok' ? `${t('conn.ok')} (${verbindung.server?.db || 'MSSQL'})`
                    : verbindung.status === 'fehler' ? t('conn.none') : t('conn.mock')}
                </span>
              )}
            </div>
          </div>
        </div>

        <div style={{ flex: 1 }} />

        {ansicht !== 'wizard' && (
          <>
            <button style={topBtn(ansicht === 'baum' || ansicht === 'report')} onClick={() => setAnsicht('baum')}>{t('nav.tree')}</button>
            <button style={topBtn(ansicht === 'katalog')} onClick={() => setAnsicht('katalog')}>{t('nav.katalog')}</button>
            <button style={topBtn(ansicht === 'bi')} onClick={() => setAnsicht('bi')}>{t('nav.bi')}</button>
            <button style={topBtn(ansicht === 'qc')} onClick={() => setAnsicht('qc')}>
              {t('nav.qc')}{(() => { const f = validierungsZusammenfassung(werte).fehler; return f ? ` (${f})` : '' })()}
            </button>
            <button style={topBtn(ansicht === 'massnahmen')} onClick={() => setAnsicht('massnahmen')}>{t('nav.massnahmen')}</button>
            <button style={topBtn(ansicht === 'designer')} onClick={() => setAnsicht('designer')}>{t('nav.designer')}</button>
            <button style={topBtn(ansicht === 'instrumente')} onClick={() => setAnsicht('instrumente')}>{t('nav.instrumente')}</button>
            {(() => { const n = alertAnzahl(werte, rolle); return (
              <button style={{ ...topBtn(ansicht === 'alerts'), ...(n ? { borderColor: 'var(--amp-r)', color: ansicht === 'alerts' ? '#fff' : 'var(--amp-r)' } : {}) }} onClick={() => setAnsicht('alerts')}>
                ⚠ {t('nav.alerts')}{n ? ` (${n})` : ''}</button>) })()}
            <label style={{ fontSize: 12, color: 'var(--muted)' }}>{t('lbl.role')}&nbsp;
              <select value={rolleId} onChange={(e) => setRolleId(e.target.value)} style={{ font: 'inherit', padding: '5px 8px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--line)' }}>
                {Object.values(ROLLEN).map((r) => <option key={r.id} value={r.id}>{r.name}</option>)}
              </select>
            </label>
            <label style={{ fontSize: 12, color: 'var(--muted)' }}>{t('lbl.period')}&nbsp;
              <select value={periode} onChange={(e) => setPeriode(e.target.value)} style={{ font: 'inherit', padding: '5px 8px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--line)' }}>
                {PERIODEN.map((p) => <option key={p} value={p}>{p}</option>)}
              </select>
            </label>
            <button style={topBtn(false)} onClick={() => setAnsicht('wizard')}>⚙ {t('nav.wizard')}</button>
            <div style={{ display: 'flex', border: '1px solid var(--line)', borderRadius: 'var(--radius-sm)', overflow: 'hidden' }}>
              {SPRACHEN.map((s) => (
                <button key={s.id} onClick={() => setLang(s.id)} style={{ padding: '5px 8px', border: 'none', fontSize: 11, fontWeight: 600,
                  background: lang === s.id ? 'var(--accent)' : 'var(--panel)', color: lang === s.id ? '#fff' : 'var(--muted)' }}>{s.label}</button>
              ))}
            </div>
          </>
        )}
      </header>

      <main style={{ padding: '22px 20px', maxWidth: 1240, margin: '0 auto' }}>
        {ansicht === 'wizard' && (
          <SetupWizard
            onFertig={() => { localStorage.setItem(SETUP_KEY, '1'); setAnsicht('baum') }}
            onAbbruch={() => setAnsicht(localStorage.getItem(SETUP_KEY) ? 'baum' : 'wizard')} />
        )}
        {ansicht === 'baum' && (
          <TreeNavigator rolle={rolle} werte={werte} periode={periode} startId={baumStart} onOpenReport={() => setAnsicht('report')} />
        )}
        {ansicht === 'katalog' && (
          <Berichtskatalog onOpen={(id) => { setBaumStart(id); setAnsicht('baum') }} />
        )}
        {ansicht === 'designer' && (
          <ReportDesigner rolle={rolle} werte={werte} />
        )}
        {ansicht === 'report' && (
          <ManagementReport rolle={rolle} werte={werte} periode={periode}
            onClose={() => setAnsicht('baum')}
            onEmpfehlung={(k) => { setMnKontext(k); setAnsicht('massnahmen') }} />
        )}
        {ansicht === 'bi' && (
          <SelfServiceBI rolle={rolle} werte={werte} />
        )}
        {ansicht === 'qc' && (
          <Datenqualitaet werte={werte} periode={periode} />
        )}
        {ansicht === 'massnahmen' && (
          <Massnahmen werte={werte} rolle={rolle} autoKontext={mnKontext} onVerbraucht={() => setMnKontext(null)} />
        )}
        {ansicht === 'instrumente' && (
          <ControllingInstrumente werte={werte} />
        )}
        {ansicht === 'alerts' && (
          <Alerts werte={werte} rolle={rolle} periode={periode} />
        )}
      </main>
    </div>
  )
}
