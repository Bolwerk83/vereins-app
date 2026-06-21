import React, { useState, useEffect } from 'react'
import { ladeGruppen, ladeGruppenAsync, istAdmin, effektiveRolleAsync } from './core/gruppen.js'
import RollenRechte from './modules/rollen-rechte/RollenRechte.jsx'
import BenutzerLeiste from './modules/benutzer/BenutzerLeiste.jsx'
import HilfePanel from './modules/hilfe/HilfePanel.jsx'
import { KpiDefProvider } from './modules/kennzahlen/KpiDefContext.jsx'
import Kennzahlen from './modules/kennzahlen/Kennzahlen.jsx'
import BurgerMenu from './components/BurgerMenu.jsx'
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
const BENUTZER_KEY = 'er_benutzer'
const HILFE_KEY = 'er_hilfe_gesehen'

export default function App() {
  // Erststart -> Wizard, sonst Baum.
  const [ansicht, setAnsicht] = useState(localStorage.getItem(SETUP_KEY) ? 'baum' : 'wizard')
  const [gruppen, setGruppen] = useState(ladeGruppen())
  const [rolleId, setRolleId] = useState(gruppen[0]?.id || null)
  const [benutzer, setBenutzer] = useState(localStorage.getItem(BENUTZER_KEY) || null)
  const [periode, setPeriode] = useState(AKTUELLE_PERIODE)
  const [werte, setWerte] = useState({})
  const [verbindung, setVerbindung] = useState(null)
  const [mnKontext, setMnKontext] = useState(null)
  const [baumStart, setBaumStart] = useState(null)
  const [designerStart, setDesignerStart] = useState(null)
  const [benutzerRolle, setBenutzerRolle] = useState(null)
  const [hilfeAuf, setHilfeAuf] = useState(false)
  const [hilfeErstmalig, setHilfeErstmalig] = useState(false)
  // Aktive "Rolle": angemeldeter Benutzer -> Vereinigung seiner Gruppen.
  // Ohne Anmeldung -> manuell gewählte Gruppe (Demo-/Admin-Modus).
  const rolle = benutzer
    // Angemeldet, aber (noch) in keiner Gruppe -> least privilege: nichts sichtbar.
    ? (benutzerRolle || { id: 'user:' + benutzer, name: benutzer, bereiche: [], kontext: [], gruppen: [] })
    : (gruppen.find((g) => g.id === rolleId) || gruppen[0])
  const { t, lang, setLang } = useT()

  function anmelden(name) { localStorage.setItem(BENUTZER_KEY, name); setBenutzer(name) }
  function abmelden() { localStorage.removeItem(BENUTZER_KEY); setBenutzer(null) }
  function hilfeSchliessen() { localStorage.setItem(HILFE_KEY, '1'); setHilfeAuf(false); setHilfeErstmalig(false) }

  // Ersthilfe beim ersten Betreten der Anwendung (nicht im Wizard) zeigen.
  useEffect(() => {
    if (ansicht !== 'wizard' && !localStorage.getItem(HILFE_KEY)) { setHilfeErstmalig(true); setHilfeAuf(true) }
  }, [ansicht])

  useEffect(() => { ladeKpiWerte(periode).then(setWerte) }, [periode])
  useEffect(() => { pruefeVerbindung().then(setVerbindung) }, [])
  // Gruppen aus der Quelle laden (mssql -> DB, sonst localStorage).
  useEffect(() => { ladeGruppenAsync().then(setGruppen) }, [])
  // Effektive Rechte des angemeldeten Benutzers auflösen (async-fähig für DB).
  useEffect(() => {
    if (!benutzer) { setBenutzerRolle(null); return }
    let aktiv = true
    effektiveRolleAsync(benutzer).then((r) => { if (aktiv) setBenutzerRolle(r) })
    return () => { aktiv = false }
  }, [benutzer, gruppen])

  const topBtn = (aktiv) => ({ padding: '6px 10px', borderRadius: 'var(--radius-sm)', fontSize: 12,
    border: '1px solid var(--line)', background: aktiv ? 'var(--accent)' : 'var(--panel)', color: aktiv ? '#fff' : 'var(--ink)' })

  // Navigation fürs Burger-Menü (gruppiert) — von jeder Seite aus steuerbar.
  const geh = (a) => setAnsicht(a)
  const qcFehler = validierungsZusammenfassung(werte).fehler
  const alertN = alertAnzahl(werte, rolle)
  const menuGruppen = [
    { titel: 'Berichte', eintraege: [
      { label: t('nav.tree'), icon: '🌳', aktiv: ansicht === 'baum' || ansicht === 'report', onClick: () => geh('baum') },
      { label: t('nav.kennzahlen'), icon: '📖', aktiv: ansicht === 'kennzahlen', onClick: () => geh('kennzahlen') },
      { label: t('nav.katalog'), icon: '🗂', aktiv: ansicht === 'katalog', onClick: () => geh('katalog') },
      { label: t('nav.designer'), icon: '🧩', aktiv: ansicht === 'designer', onClick: () => geh('designer') }
    ] },
    { titel: 'Analyse', eintraege: [
      { label: t('nav.bi'), icon: '💬', aktiv: ansicht === 'bi', onClick: () => geh('bi') },
      { label: t('nav.qc'), icon: '✅', aktiv: ansicht === 'qc', onClick: () => geh('qc'), badge: qcFehler || null },
      { label: t('nav.instrumente'), icon: '📐', aktiv: ansicht === 'instrumente', onClick: () => geh('instrumente') },
      { label: t('nav.alerts'), icon: '⚠', aktiv: ansicht === 'alerts', onClick: () => geh('alerts'), badge: alertN || null }
    ] },
    { titel: 'Steuerung', eintraege: [
      { label: t('nav.massnahmen'), icon: '🎯', aktiv: ansicht === 'massnahmen', onClick: () => geh('massnahmen') },
      ...(istAdmin(rolle) ? [{ label: t('nav.rechte'), icon: '👥', aktiv: ansicht === 'rechte', onClick: () => geh('rechte') }] : []),
      { label: t('nav.wizard'), icon: '⚙', aktiv: ansicht === 'wizard', onClick: () => geh('wizard') },
      { label: t('nav.hilfe'), icon: '❓', aktiv: false, onClick: () => { setHilfeErstmalig(false); setHilfeAuf(true) } }
    ] }
  ]

  return (
    <div>
      {/* Topbar */}
      <header className="no-print" style={{ position: 'sticky', top: 0, zIndex: 10, background: 'var(--panel)', borderBottom: '1px solid var(--line)',
        padding: '10px 20px', display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
        {ansicht !== 'wizard' && <BurgerMenu gruppen={menuGruppen} />}
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
            <button style={topBtn(ansicht === 'kennzahlen')} onClick={() => setAnsicht('kennzahlen')}>{t('nav.kennzahlen')}</button>
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
            {istAdmin(rolle) && (
              <button style={topBtn(ansicht === 'rechte')} onClick={() => setAnsicht('rechte')}>{t('nav.rechte')}</button>
            )}
            <BenutzerLeiste benutzer={benutzer} rolle={rolle} gruppen={gruppen} onLogin={anmelden} onLogout={abmelden} />
            {!benutzer && (
              <label style={{ fontSize: 12, color: 'var(--muted)' }}>{t('lbl.role')}&nbsp;
                <select value={rolle?.id || ''} onChange={(e) => setRolleId(e.target.value)} style={{ font: 'inherit', padding: '5px 8px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--line)' }}>
                  {gruppen.map((g) => <option key={g.id} value={g.id}>{g.name}</option>)}
                </select>
              </label>
            )}
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
            <button title={t('nav.hilfe')} onClick={() => { setHilfeErstmalig(false); setHilfeAuf(true) }}
              style={{ width: 30, height: 30, borderRadius: '50%', border: '1px solid var(--line)', background: 'var(--panel)',
                color: 'var(--accent)', fontWeight: 700, cursor: 'pointer', fontSize: 14 }}>?</button>
          </>
        )}
      </header>

      <HilfePanel offen={hilfeAuf} erstmalig={hilfeErstmalig} onSchliessen={hilfeSchliessen} />

      <KpiDefProvider rolle={rolle} werte={werte} onSpringe={(id) => { setBaumStart(id); setAnsicht('baum') }}>
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
          <Berichtskatalog onOpen={(id, typ) => {
            if (typ === 'designer') { setDesignerStart(id); setAnsicht('designer') }
            else { setBaumStart(id); setAnsicht('baum') }
          }} />
        )}
        {ansicht === 'designer' && (
          <ReportDesigner rolle={rolle} werte={werte} startId={designerStart} />
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
        {ansicht === 'kennzahlen' && (
          <Kennzahlen rolle={rolle} werte={werte} />
        )}
        {ansicht === 'rechte' && (
          <RollenRechte onChange={(list) => {
            setGruppen(list)
            if (!list.find((g) => g.id === rolleId)) setRolleId(list[0]?.id || null)
          }} />
        )}
      </main>
      </KpiDefProvider>
    </div>
  )
}
