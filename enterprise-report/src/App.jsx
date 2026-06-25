import React, { useState, useEffect } from 'react'
import { ladeGruppen, ladeGruppenAsync, istAdmin, effektiveRolleAsync } from './core/gruppen.js'
import RollenRechte from './modules/rollen-rechte/RollenRechte.jsx'
import LoginDialog from './modules/benutzer/LoginDialog.jsx'
import HilfePanel from './modules/hilfe/HilfePanel.jsx'
import Onboarding from './modules/onboarding/Onboarding.jsx'
import { schonGesehen, merkeGesehen } from './core/onboarding.js'
import { KpiDefProvider } from './modules/kennzahlen/KpiDefContext.jsx'
import { NavProvider } from './components/NavContext.jsx'
import { FilterProvider, GlobalFilterLeiste } from './core/filterKontext.jsx'
import { detailFuerBereich } from './core/detailberichte.js'
import Kennzahlen from './modules/kennzahlen/Kennzahlen.jsx'
import BurgerMenu from './components/BurgerMenu.jsx'
import { KiStatusBadge } from './components/KiGate.jsx'
import Assistent from './modules/assistent/Assistent.jsx'
import RoterFaden from './modules/roter-faden/RoterFaden.jsx'
import OnePager from './modules/onepager/OnePager.jsx'
import { ladeKpiWerte, pruefeVerbindung, setCacheKontext, leereCache, PERIODEN, AKTUELLE_PERIODE, QUELLE } from './core/dataProvider.js'
import { ladeModell } from './core/periodenmodell.js'
import ZeitDatenart from './modules/zeit-datenart/ZeitDatenart.jsx'
import DatenartBadge from './modules/zeit-datenart/DatenartBadge.jsx'
import ZeitFilter from './modules/zeit-datenart/ZeitFilter.jsx'
import Versionsvergleich from './modules/versionsvergleich/Versionsvergleich.jsx'
import Verteiler from './modules/verteiler/Verteiler.jsx'
import Abschluss from './modules/abschluss/Abschluss.jsx'
import Transport from './modules/transport/Transport.jsx'
import Abstimmung from './modules/abstimmung/Abstimmung.jsx'
import ControllingStruktur from './modules/controlling/ControllingStruktur.jsx'
import KLR from './modules/klr/KLR.jsx'
import KLRAblauf from './modules/klr/KLRAblauf.jsx'
import Ablaufdiagramm from './modules/ablauf/Ablaufdiagramm.jsx'
import Datenarchitektur from './modules/datenarchitektur/Datenarchitektur.jsx'
import Kostenartenrechnung from './modules/kostenarten/Kostenartenrechnung.jsx'
import Kalkulatorik from './modules/kalkulatorik/Kalkulatorik.jsx'
import Lebenszyklus from './modules/lebenszyklus/Lebenszyklus.jsx'
import PortfolioBcg from './modules/portfolio-bcg/PortfolioBcg.jsx'
import Quartalsbericht from './modules/quartalsbericht/Quartalsbericht.jsx'
import FinanzCockpit from './modules/finanzcockpit/FinanzCockpit.jsx'
import PcKostenstellen from './modules/pc-kostenstellen/PcKostenstellen.jsx'
import Kontenstrukturen from './modules/kontenstrukturen/Kontenstrukturen.jsx'
import Leasing from './modules/leasing/Leasing.jsx'
import Versand from './modules/versand/Versand.jsx'
import EinzelGemein from './modules/einzelgemein/EinzelGemein.jsx'
import AuftragsLebenszyklus from './modules/auftrag/AuftragsLebenszyklus.jsx'
import Kostenstellenrechnung from './modules/kostenstellen/Kostenstellenrechnung.jsx'
import BAB from './modules/bab/BAB.jsx'
import Profitcenter from './modules/profitcenter/Profitcenter.jsx'
import Abweichungsanalyse from './modules/abweichung/Abweichungsanalyse.jsx'
import Anlagen from './modules/anlagen/Anlagen.jsx'
import LieferantenLebenszyklus from './modules/lieferant/LieferantenLebenszyklus.jsx'
import Marketing from './modules/marketing/Marketing.jsx'
import Bestand from './modules/bestand/Bestand.jsx'
import Lagerverwaltung from './modules/lager/Lagerverwaltung.jsx'
import Produktionscontrolling from './modules/produktion/Produktionscontrolling.jsx'
import Planung from './modules/planung/Planung.jsx'
import Gutschriften from './modules/gutschriften/Gutschriften.jsx'
import AbgleichAbsatz from './modules/abgleich/AbgleichAbsatz.jsx'
import VertriebKennzahlen from './modules/vertrieb-kennzahlen/VertriebKennzahlen.jsx'
import Prozesskette from './modules/prozesskette/Prozesskette.jsx'
import Startseite from './modules/startseite/Startseite.jsx'
import Tagesreporting from './modules/tagesreporting/Tagesreporting.jsx'
import MarketingKarte from './modules/marketing-karte/MarketingKarte.jsx'
import Szenario from './modules/szenario/Szenario.jsx'
import WMS from './modules/wms/WMS.jsx'
import Detailberichte from './modules/detailberichte/Detailberichte.jsx'
import Forderungen from './modules/forderungen/Forderungen.jsx'
import Mitarbeiter from './modules/mitarbeiter/Mitarbeiter.jsx'
import Segmentbericht from './modules/segment/Segmentbericht.jsx'
import Kalkulation from './modules/kalkulation/Kalkulation.jsx'
import Ergebnisrechnung from './modules/ergebnis/Ergebnisrechnung.jsx'
import Deckungsbeitrag from './modules/deckungsbeitrag/Deckungsbeitrag.jsx'
import Lernpfad from './modules/lernpfad/Lernpfad.jsx'
import GlobalSuche from './modules/suche/GlobalSuche.jsx'
import CommandPalette from './modules/suche/CommandPalette.jsx'
import Admin from './modules/admin/Admin.jsx'
import Events from './modules/events/Events.jsx'
import Doku from './modules/doku/Doku.jsx'
import Technologie from './modules/technologie/Technologie.jsx'
import Abgrenzungsrechnung from './modules/abgrenzung/Abgrenzungsrechnung.jsx'
import LebenszyklusEmpfehlungen from './modules/lebenszyklus/Empfehlungen.jsx'
import KpiEditor from './modules/kpi-editor/KpiEditor.jsx'
import Nutzung from './modules/nutzung/Nutzung.jsx'
import Artikelkarte from './modules/artikelkarte/Artikelkarte.jsx'
import DetailAnalyse from './modules/detail-analyse/DetailAnalyse.jsx'
import { trackOeffnung } from './core/nutzung.js'
import { nutzerId } from './core/identitaet.js'
import { heartbeat } from './core/praesenz.js'
import { darfBereich } from './core/rbac.js'
import { hatFreigabeFuerName } from './core/berichtRechte.js'
import { istSichtbar as berichtSichtbar, statusVon as berichtStatusVon } from './core/berichtStatus.js'
import Berichtfreigabe from './modules/berichtfreigabe/Berichtfreigabe.jsx'
import DatenmodellAdmin from './modules/datenmodell/DatenmodellAdmin.jsx'
import DatenschutzAdmin from './modules/datenschutz/DatenschutzAdmin.jsx'
import KiSteuerung from './modules/ki-steuerung/KiSteuerung.jsx'
import KiBuilder from './modules/ki-builder/KiBuilder.jsx'
import BerichtLogAdmin from './modules/berichtlog/BerichtLogAdmin.jsx'
import GoogleReporting from './modules/google/GoogleReporting.jsx'
import Datenquellen from './modules/datenquellen/Datenquellen.jsx'
import Bestandsentwicklung from './modules/bestandsentwicklung/Bestandsentwicklung.jsx'
import Marktpotenzial from './modules/marktpotenzial/Marktpotenzial.jsx'
import Verkaufsstatistik from './modules/statistik/Verkaufsstatistik.jsx'
import Fahrradstatistik from './modules/statistik/Fahrradstatistik.jsx'
import Einkaufsstatistik from './modules/statistik/Einkaufsstatistik.jsx'
import Produktionsstatistik from './modules/statistik/Produktionsstatistik.jsx'
import { gesamtStand } from './core/datenstand.js'
import { bereichVon, istAdminView } from './core/navMeta.js'
import BerichtInfoModal from './modules/berichtinfo/BerichtInfoModal.jsx'
import BerichtInfoBanner from './modules/berichtinfo/BerichtInfoBanner.jsx'
import { anzahlAnfragen } from './core/zugriff.js'
import { ladeBranding, applyBranding, themeById } from './core/admin.js'
import { AKTUELLE_STAGE, stageInfo } from './core/stage.js'
import { autoSeed } from './core/designerSeed.js'
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
  // Demo-Startlink (?demo) überspringt den Wizard und startet direkt mit Mock-Daten.
  const demoStart = typeof window !== 'undefined' && new URLSearchParams(window.location.search).has('demo')
  if (demoStart && typeof localStorage !== 'undefined') localStorage.setItem(SETUP_KEY, '1')
  // Optionale Demo-Startansicht (z. B. Standalone-Build landet in den Detailberichten).
  const demoView = typeof localStorage !== 'undefined' ? localStorage.getItem('er_demo_view') : null
  // Erststart -> Wizard, sonst Baum (bzw. Demo-Startansicht).
  const [ansicht, setAnsicht] = useState(localStorage.getItem(SETUP_KEY) || demoStart ? (demoView || 'baum') : 'wizard')
  const [gruppen, setGruppen] = useState(ladeGruppen())
  const [rolleId, setRolleId] = useState(gruppen[0]?.id || null)
  const [benutzer, setBenutzer] = useState(localStorage.getItem(BENUTZER_KEY) || null)
  // Demo-Anmeldung (Rolle + Name): Standard-Rolle ohne Anmeldung, mehr Berichte nach Login.
  const [anmeldung, setAnmeldung] = useState(() => { try { return JSON.parse(localStorage.getItem('er_anmeldung') || 'null') } catch { return null } })
  const [loginAuf, setLoginAuf] = useState(false)
  const [periode, setPeriode] = useState(AKTUELLE_PERIODE)
  const [werte, setWerte] = useState({})
  const [verbindung, setVerbindung] = useState(null)
  const [mnKontext, setMnKontext] = useState(null)
  const [baumStart, setBaumStart] = useState(null)
  const [designerStart, setDesignerStart] = useState(null)
  const [benutzerRolle, setBenutzerRolle] = useState(null)
  const [zeitModell, setZeitModell] = useState(ladeModell())
  const [hilfeAuf, setHilfeAuf] = useState(false)
  const [hilfeErstmalig, setHilfeErstmalig] = useState(false)
  const [onbAuf, setOnbAuf] = useState(false)
  const [onbBanner, setOnbBanner] = useState(false)
  const [menuAuf, setMenuAuf] = useState(false)   // ⚙ Einstellungen-Menü (Topbar)
  const [theme, setTheme] = useState(() => { try { return localStorage.getItem('er_theme') || 'light' } catch { return 'light' } })
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme === 'dark' ? 'dark' : 'light')
    try { localStorage.setItem('er_theme', theme) } catch {}
  }, [theme])
  const [praesentation, setPraesentation] = useState(false) // ablenkungsfreier Vollbild-/Präsentationsmodus
  useEffect(() => {
    document.documentElement.setAttribute('data-praesentation', praesentation ? '1' : '0')
    if (praesentation) { try { document.documentElement.requestFullscreen?.() } catch {} }
    else if (document.fullscreenElement) { try { document.exitFullscreen?.() } catch {} }
    if (!praesentation) return
    const onKey = (e) => { if (e.key === 'Escape') setPraesentation(false) }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [praesentation])
  const [branding, setBranding] = useState(ladeBranding())
  const [infoView, setInfoView] = useState(null)   // Bericht-Info-Panel (Schaufenster)
  const [detailStart, setDetailStart] = useState(null) // Drill E3→E4: vorgewählte Detailliste
  const [detailSuche, setDetailSuche] = useState('')   // optionaler Vorfilter (z. B. aus BCG-Drill)
  // Aktive "Rolle": ohne Anmeldung die Standard-Rolle (Lesezugriff), nach der
  // Demo-Anmeldung die gewählte Rolle (mehr Berichte). Die Standard-Gruppe
  // 'g-leser' ist die least-privilege-Sicht.
  const standardGruppe = gruppen.find((g) => g.id === 'g-leser') || gruppen[gruppen.length - 1] || gruppen[0]
  const rolle = (anmeldung && gruppen.find((g) => g.id === anmeldung.rolleId)) || standardGruppe
  const { t, lang, setLang } = useT()

  function anmelden(name) { localStorage.setItem(BENUTZER_KEY, name); setBenutzer(name) }
  function abmelden() { localStorage.removeItem(BENUTZER_KEY); setBenutzer(null) }
  function hilfeSchliessen() { localStorage.setItem(HILFE_KEY, '1'); setHilfeAuf(false); setHilfeErstmalig(false) }

  // Ersthilfe beim ersten Betreten der Anwendung (nicht im Wizard) zeigen.
  useEffect(() => {
    if (ansicht !== 'wizard' && !localStorage.getItem(HILFE_KEY)) { setHilfeErstmalig(true); setHilfeAuf(true) }
  }, [ansicht])

  // Rollen-Onboarding NICHT mehr als blockierendes Modal aufpoppen, sondern als
  // dezentes, schließbares Banner über dem Inhalt (einmal je Rolle). Den Rundgang
  // startet der Nutzer selbst per CTA — oder jederzeit über 🚀.
  useEffect(() => {
    if (ansicht === 'wizard' || !localStorage.getItem(HILFE_KEY) || !rolle) return
    if (!schonGesehen(rolle.id)) { merkeGesehen(rolle.id); setOnbBanner(true) }
  }, [rolle?.id, ansicht]) // eslint-disable-line

  // Cache-Kontext aus dem Periodenmodell (Datumssicht + Granularität). Ändert
  // er sich, wird der Cache geleert und die Werte werden neu geladen.
  useEffect(() => {
    setCacheKontext(`${zeitModell.datumssicht}|${zeitModell.granularitaet}`)
    ladeKpiWerte(periode).then(setWerte)
  }, [zeitModell, periode])
  useEffect(() => { pruefeVerbindung().then(setVerbindung) }, [])
  // Erster Start: 20 Beispiel-Berichte einmalig anlegen (s. core/designerSeed).
  useEffect(() => { autoSeed() }, [])
  // Branding (Logo/Theme) beim Start anwenden (Akzentfarbe, Tab-Titel).
  useEffect(() => { applyBranding(branding) }, [branding])
  // Klick-/Nutzungs-Tracking + Präsenz: Ansicht zählen (mit Nutzer-Kennung),
  // Lebenszeichen senden (nur Admin wertet aus).
  const uid = nutzerId(benutzer)
  useEffect(() => {
    if (ansicht && ansicht !== 'wizard') trackOeffnung(ansicht, uid)
    heartbeat(uid)
  }, [ansicht, uid])
  // Heartbeat alle 60 s, solange die App offen ist (hält „aktiv in letzter Stunde").
  useEffect(() => {
    const id = setInterval(() => heartbeat(uid), 60000)
    return () => clearInterval(id)
  }, [uid])
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

  // Navigation — von jeder Seite aus steuerbar. Fehlt die Berechtigung für den
  // Fachbereich des Ziels, wird statt des Berichts sein Info-Panel geöffnet
  // (Schaufenster: sehen, was es gibt — aber nicht aufrufen).
  const adminAktiv = istAdmin(rolle)
  const geh = (a) => {
    if (a && !adminAktiv && istAdminView(a)) { setInfoView(a); return } // Admin-Sichten nur für Admins (auch nicht über die Suche)
    if (a && !adminAktiv && !berichtSichtbar(a, { admin: false, uid })) { setInfoView(a); return }
    if (a && !darfBereich(rolle, bereichVon(a))) { setInfoView(a); return }
    if (a === 'detailberichte') { setDetailStart(null); setDetailSuche('') } setAnsicht(a)
  }
  // Drill E3 → E4: gezielt eine Detailliste öffnen.
  const gehDetail = (listId, suche = '') => { setDetailStart(listId); setDetailSuche(suche); setAnsicht('detailberichte') }
  const zeigeInfo = (a) => setInfoView(a)
  const qcFehler = validierungsZusammenfassung(werte).fehler
  const alertN = alertAnzahl(werte, rolle)
  const anfragenN = istAdmin(rolle) ? anzahlAnfragen() : 0
  // Eintrags-Helfer: label/icon/aktiv/onClick + Bereich/Relevanz (für Rollenfilter).
  const E = (view, key, icon, extra = {}) => {
    const bereich = bereichVon(view)
    const status = berichtStatusVon(view)
    // Status-Sichtbarkeit (Admin sieht alles, mit Kennzeichnung).
    const versteckt = !adminAktiv && !berichtSichtbar(view, { admin: false, uid })
    const marker = adminAktiv && status === 'test' ? '  🧪' : adminAktiv && status === 'deaktiviert' ? '  ⏸' : ''
    // Sichtbar, wenn die Rolle den Bereich darf ODER der Bericht/Ordner für die
    // Rolle bzw. den angemeldeten Kollegen zusätzlich freigegeben ist.
    const relevant = darfBereich(rolle, bereich) || hatFreigabeFuerName(rolle?.id, anmeldung?.name, view)
    return { label: t(key) + marker, icon, view, bereich, relevant, versteckt, aktiv: ansicht === view, onClick: () => geh(view), ...extra }
  }
  // Mehrstufige Navigation: Gruppe → Untergruppe (Bereich) → Eintrag.
  const menuGruppen = [
    { titel: 'Cockpit & Berichte', icon: '📊', untergruppen: [
      { titel: 'Überblick', eintraege: [
        E('startseite', 'nav.startseite', '🏠'),
        E('baum', 'nav.tree', '🌳', { aktiv: ansicht === 'baum' || ansicht === 'report' }),
        E('tagesreporting', 'nav.tagesreporting', '📅'),
        E('quartalsbericht', 'nav.quartalsbericht', '📑'),
        E('kennzahlen', 'nav.kennzahlen', '📖'),
        E('katalog', 'nav.katalog', '🗂'),
        E('detailberichte', 'nav.detailberichte', '🔬'),
        E('detailanalyse', 'nav.detailanalyse', '🔍', { label: 'Detail-Analyse' }),
        E('kpieditor', 'nav.kpieditor', '🧪')
      ] },
      { titel: 'Werkzeuge', eintraege: [
        E('onepager',   'nav.onepager',   '📄', { label: 'OnePager' }),
        E('roterfaden', 'nav.roterfaden', '🧵', { label: 'Roter Faden' }),
        E('assistent',  'nav.assistent',  '💬', { label: 'Assistent' }),
        E('kibuilder', 'nav.kibuilder', '✨'),
        E('designer', 'nav.designer', '🧩')
      ] }
    ] },
    { titel: 'Kosten & Ergebnis', icon: '🧮', untergruppen: [
      { titel: 'Kostenrechnung', eintraege: [
        E('klr', 'nav.klr', '🧮', { aktiv: ansicht === 'klr' || ansicht === 'kostenarten' || ansicht === 'kalkulatorik' }),
        E('einzelgemein', 'nav.einzelgemein', '➗'),
        E('abgrenzung', 'nav.abgrenzung', '🔀'),
        E('kostenstellen', 'nav.kostenstellen', '🏢'),
        E('bab', 'nav.bab', '🧾')
      ] },
      { titel: 'Kalkulation & Ergebnis', eintraege: [
        E('kalkulation', 'nav.kalkulation', '🎯'),
        E('ergebnis', 'nav.ergebnis', '📕'),
        E('deckungsbeitrag', 'nav.db', '📐'),
        E('profitcenter', 'nav.profitcenter', '🏦'),
        E('pckostenstellen', 'nav.pckostenstellen', '🗂'),
        E('kontenstrukturen', 'nav.kontenstrukturen', '🌲'),
        E('finanzcockpit', 'nav.finanzcockpit', '🛡'),
        E('leasing', 'nav.leasing', '🚗')
      ] },
      { titel: 'Konzern', eintraege: [ E('segment', 'nav.segment', '🏛') ] }
    ] },
    { titel: 'Operativ', icon: '📈', untergruppen: [
      { titel: 'Vertrieb & Markt', eintraege: [
        E('verkaufsstatistik', 'nav.verkaufsstatistik', '🧾'),
        E('fahrradstatistik', 'nav.fahrradstatistik', '🚲'),
        E('marketing', 'nav.marketing', '📣'),
        E('marketingkarte', 'nav.marketingkarte', '🗺'),
        E('marktpotenzial', 'nav.marktpotenzial', '🎯'),
        E('google', 'nav.google', '🔎'),
        E('gutschriften', 'nav.gutschriften', '🧾'),
        E('vertriebkpi', 'nav.vertriebkpi', '📈'),
        E('prozesskette', 'nav.prozesskette', '🔻'),
        E('events', 'nav.events', '🎉')
      ] },
      { titel: 'Bestand & Beschaffung', eintraege: [
        E('einkaufsstatistik', 'nav.einkaufsstatistik', '🛒'),
        E('lager', 'nav.lager', '🏬'),
        E('bestandsentwicklung', 'nav.bestandsentwicklung', '📉'),
        E('produktion', 'nav.produktion', '🏭'),
        E('produktionsstatistik', 'nav.produktionsstatistik', '📐'),
        E('wms', 'nav.wms', '🗄'),
        E('bestand', 'nav.bestand', '📦'),
        E('lieferant', 'nav.lieferant', '🚚'),
        E('auftrag', 'nav.auftrag', '📦'),
        E('versand', 'nav.versand', '📮')
      ] },
      { titel: 'Finanzen & Risiko', eintraege: [
        E('forderungen', 'nav.forderungen', '💶')
      ] }
    ] },
    { titel: 'Analyse & Steuerung', icon: '🔭', untergruppen: [
      { titel: 'Analyse', eintraege: [
        E('bi', 'nav.bi', '💬'),
        E('planung', 'nav.planung', '🎯'),
        E('szenario', 'nav.szenario', '🔮'),
        E('abweichung', 'nav.abweichung', '📊'),
        E('vergleich', 'nav.vergleich', '⚖'),
        E('portfoliobcg', 'nav.portfoliobcg', '🧩'),
        E('qc', 'nav.qc', '✅', { badge: qcFehler || null }),
        E('abstimmung', 'nav.abstimmung', '🔗'),
        E('abgleichabsatz', 'nav.abgleichabsatz', '🔀')
      ] },
      { titel: 'Lebenszyklen', eintraege: [
        E('lebenszyklus', 'nav.lebenszyklus', '🔄'),
        E('lzempfehlung', 'nav.lzempfehlung', '🧭'),
        E('artikelkarte', 'nav.artikelkarte', '📋'),
        E('anlagen', 'nav.anlagen', '🏗'),
        E('technologie', 'nav.technologie', '🔬'),
        E('mitarbeiter', 'nav.mitarbeiter', '🧑‍🤝‍🧑')
      ] },
      { titel: 'Steuerung', eintraege: [
        E('massnahmen', 'nav.massnahmen', '🎯'),
        E('instrumente', 'nav.instrumente', '📐'),
        E('alerts', 'nav.alerts', '⚠', { badge: alertN || null }),
        E('zeit', 'nav.zeit', '🗓')
      ] }
    ] },
    { titel: 'Lernen & Wissen', icon: '📚', untergruppen: [
      { titel: 'Lernen', eintraege: [
        E('lernpfad', 'nav.lernpfad', '🎓'),
        E('doku', 'nav.doku', '📚'),
        E('datenquellen', 'nav.datenquellen', '🔗')
      ] },
      { titel: 'Konzepte', eintraege: [
        E('controlling', 'nav.controlling', '🧭'),
        E('klrablauf', 'nav.klrablauf', '🧵'),
        E('ablaufdiagramm', 'nav.ablauf', '🗺'),
        E('datenarchitektur', 'nav.datenarchitektur', '✳️')
      ] },
      { titel: 'Hilfe', eintraege: [
        { label: t('nav.onboarding'), icon: '🚀', aktiv: false, onClick: () => setOnbAuf(true) },
        { label: t('nav.hilfe'), icon: '❓', aktiv: false, onClick: () => { setHilfeErstmalig(false); setHilfeAuf(true) } }
      ] }
    ] },
    { titel: 'Verwaltung', icon: '🛠', untergruppen: [
      { titel: 'Prozesse', eintraege: [
        E('abschluss', 'nav.abschluss', '🔒'),
        E('verteiler', 'nav.verteiler', '📤'),
        E('transport', 'nav.transport', '🚚')
      ] },
      { titel: 'Einrichtung', eintraege: [ E('wizard', 'nav.wizard', '⚙') ] },
      ...(istAdmin(rolle) ? [{ titel: 'Administration', eintraege: [
        E('admin', 'nav.admin', '🛠'),
        E('datenmodell', 'nav.datenmodell', '🧷'),
        E('datenschutz', 'nav.datenschutz', '🔐'),
        E('kisteuerung', 'nav.kisteuerung', '🤖'),
        E('berichtfreigabe', 'nav.berichtfreigabe', '🚦'),
        E('berichtlog', 'nav.berichtlog', '📊'),
        E('nutzung', 'nav.nutzung', '📈'),
        E('rechte', 'nav.rechte', '👥', { badge: anfragenN || null })
      ] }] : [])
    ] }
  ]
  // Status-Sichtbarkeit anwenden: deaktivierte/Test-Berichte für normale Nutzer
  // ausblenden (leere Untergruppen/Gruppen entfernen). Admin sieht alles.
  const menuSichtbar = menuGruppen
    .map((g) => ({ ...g, untergruppen: (g.untergruppen || [])
      // Rollenfilter (relevant) UND Status-/Freigabe-Filter (versteckt) anwenden,
      // damit ein Rollenwechsel die sichtbaren Berichte tatsächlich einschränkt.
      .map((u) => ({ ...u, eintraege: u.eintraege.filter((e) => !e.versteckt && e.relevant) }))
      .filter((u) => u.eintraege.length) }))
    .filter((g) => g.untergruppen.length)
  // Flacher Index view → { label, icon, bereich, relevant, pfad } für das Info-Panel.
  const eintragIndex = {}
  for (const g of menuGruppen) for (const u of (g.untergruppen || [])) for (const e of u.eintraege)
    if (e.view) eintragIndex[e.view] = { ...e, pfad: `${g.titel} › ${u.titel}` }
  const infoMeta = infoView ? (eintragIndex[infoView] || { label: infoView, bereich: bereichVon(infoView), relevant: darfBereich(rolle, bereichVon(infoView)), pfad: null }) : null

  return (
    <FilterProvider>
    <div>
      {/* Topbar */}
      <header className="no-print" style={{ position: 'sticky', top: 0, zIndex: 10, background: 'var(--panel)', borderBottom: '1px solid var(--line)',
        padding: '10px 20px', display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
        {ansicht !== 'wizard' && <BurgerMenu gruppen={menuSichtbar} onInfo={zeigeInfo} />}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          {branding.logoDataUrl
            ? <img src={branding.logoDataUrl} alt="Logo" style={{ width: 26, height: 26, borderRadius: 7, objectFit: 'contain' }} />
            : <div style={{ width: 26, height: 26, borderRadius: 7, background: 'var(--accent)' }} />}
          <div>
            <div style={{ fontWeight: 700, display: 'flex', alignItems: 'center', gap: 7 }}>{branding.appName || 'Enterprise Report'}
              <span title={`Instanz: ${stageInfo(AKTUELLE_STAGE).name}`} style={{ fontSize: 10, fontWeight: 700, padding: '1px 7px', borderRadius: 999,
                color: '#fff', background: stageInfo(AKTUELLE_STAGE).farbe }}>{stageInfo(AKTUELLE_STAGE).kurz}</span>
            </div>
            <div className="mono" style={{ fontSize: 10, color: 'var(--muted)' }}>
              {t('lbl.source')}: {QUELLE.toUpperCase()}
              {verbindung && (
                <span style={{ marginLeft: 6,
                  color: verbindung.status === 'ok' ? 'var(--amp-g)' : verbindung.status === 'fehler' ? 'var(--amp-r)' : 'var(--muted)' }}>
                  ● {verbindung.status === 'ok' ? `${t('conn.ok')} (${verbindung.server?.db || 'MSSQL'})`
                    : verbindung.status === 'fehler' ? t('conn.none') : t('conn.mock')}
                </span>
              )}
              <span title="Stand der Daten (ältester relevanter Import)" style={{ marginLeft: 6, color: 'var(--muted)' }}>· 📅 {gesamtStand()}</span>
            </div>
          </div>
        </div>

        <div style={{ flex: 1 }} />

        {ansicht !== 'wizard' && (
          <>
            <GlobalSuche onGeh={geh} onKpi={(id) => { setBaumStart(id); setAnsicht('baum') }} onInfo={zeigeInfo} rolle={rolle} istAdmin={adminAktiv} />
            {/* Status-Badges: QC und Alerts — immer sichtbar, weil global relevant.
                Alle weiteren Berichte/Werkzeuge erreichbar über das ☰-Menü. */}
            <button style={topBtn(ansicht === 'qc')} onClick={() => geh('qc')}>
              {t('nav.qc')}{(() => { const f = validierungsZusammenfassung(werte).fehler; return f ? ` (${f})` : '' })()}
            </button>
            {(() => { const n = alertAnzahl(werte, rolle); return (
              <button style={{ ...topBtn(ansicht === 'alerts'), ...(n ? { borderColor: 'var(--amp-r)', color: ansicht === 'alerts' ? '#fff' : 'var(--amp-r)' } : {}) }} onClick={() => geh('alerts')}>
                ⚠ {t('nav.alerts')}{n ? ` (${n})` : ''}</button>) })()}
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '4px 6px 4px 10px', borderRadius: 999, background: anmeldung ? 'var(--accent-soft)' : 'var(--panel)', border: `1px solid ${anmeldung ? 'var(--accent)' : 'var(--line)'}` }}>
              <span style={{ fontSize: 12, color: anmeldung ? 'var(--accent)' : 'var(--muted)', fontWeight: 600 }}>👤 {anmeldung?.name || 'Gast'}</span>
              <span style={{ fontSize: 11, color: 'var(--muted)' }}>· {rolle?.name || '—'}</span>
              {anmeldung
                ? <button onClick={() => { setAnmeldung(null); try { localStorage.removeItem('er_anmeldung') } catch {} }} title="Abmelden — zurück zur Standard-Rolle" style={{ padding: '3px 9px', border: '1px solid var(--line)', borderRadius: 'var(--radius-sm)', background: 'var(--panel)', cursor: 'pointer', fontSize: 12 }}>Abmelden</button>
                : <button onClick={() => setLoginAuf(true)} title="Mit Rolle anmelden — mehr Berichte sehen" style={{ padding: '3px 11px', border: 'none', borderRadius: 'var(--radius-sm)', background: 'var(--accent)', color: '#fff', cursor: 'pointer', fontSize: 12, fontWeight: 600 }}>Anmelden</button>}
            </div>
            <ZeitFilter modell={zeitModell} onChange={() => setZeitModell(ladeModell())} />
            <DatenartBadge modell={zeitModell} onClick={() => setAnsicht('zeit')} />
            {/* ⚙ Einstellungen — bündelt Periode, Sprache, Wizard, Onboarding, Hilfe */}
            <div style={{ position: 'relative' }}>
              <button title="Einstellungen & Hilfe" aria-haspopup="true" aria-expanded={menuAuf} onClick={() => setMenuAuf((v) => !v)}
                style={{ width: 32, height: 32, borderRadius: '50%', border: `1px solid ${menuAuf ? 'var(--accent)' : 'var(--line)'}`, background: menuAuf ? 'var(--accent-soft)' : 'var(--panel)', cursor: 'pointer', fontSize: 15 }}>⚙</button>
              {menuAuf && (
                <>
                  <div onClick={() => setMenuAuf(false)} style={{ position: 'fixed', inset: 0, zIndex: 40 }} />
                  <div style={{ position: 'absolute', right: 0, top: 38, zIndex: 41, width: 230, background: 'var(--panel)', border: '1px solid var(--line)', borderRadius: 'var(--radius)', boxShadow: '0 14px 40px rgba(0,0,0,.18)', padding: 10, display: 'grid', gap: 10 }}>
                    <label style={{ fontSize: 11, color: 'var(--muted)', display: 'block' }}>{t('lbl.period')}
                      <select value={periode} onChange={(e) => setPeriode(e.target.value)} style={{ font: 'inherit', fontSize: 13, padding: '6px 8px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--line)', width: '100%', marginTop: 3, background: 'var(--panel)', color: 'var(--ink)' }}>
                        {PERIODEN.map((p) => <option key={p} value={p}>{p}</option>)}
                      </select>
                    </label>
                    <div>
                      <div style={{ fontSize: 11, color: 'var(--muted)', marginBottom: 3 }}>Sprache</div>
                      <div style={{ display: 'flex', border: '1px solid var(--line)', borderRadius: 'var(--radius-sm)', overflow: 'hidden' }}>
                        {SPRACHEN.map((s) => (
                          <button key={s.id} onClick={() => setLang(s.id)} style={{ flex: 1, padding: '6px 8px', border: 'none', fontSize: 12, fontWeight: 600, cursor: 'pointer',
                            background: lang === s.id ? 'var(--accent)' : 'var(--panel)', color: lang === s.id ? '#fff' : 'var(--muted)' }}>{s.label}</button>
                        ))}
                      </div>
                    </div>
                    <div>
                      <div style={{ fontSize: 11, color: 'var(--muted)', marginBottom: 3 }}>Darstellung</div>
                      <div style={{ display: 'flex', border: '1px solid var(--line)', borderRadius: 'var(--radius-sm)', overflow: 'hidden' }}>
                        {[['light', '☀ Hell'], ['dark', '🌙 Dunkel']].map(([id, label]) => (
                          <button key={id} onClick={() => setTheme(id)} style={{ flex: 1, padding: '6px 8px', border: 'none', fontSize: 12, fontWeight: 600, cursor: 'pointer',
                            background: theme === id ? 'var(--accent)' : 'var(--panel)', color: theme === id ? '#fff' : 'var(--muted)' }}>{label}</button>
                        ))}
                      </div>
                      <button onClick={() => { setMenuAuf(false); setPraesentation(true) }} title="Vollbild, ablenkungsfrei, große Schrift — ideal zum Vorstellen"
                        style={{ width: '100%', marginTop: 6, padding: '7px 8px', border: '1px solid var(--accent)', borderRadius: 'var(--radius-sm)', background: 'var(--accent-soft)', color: 'var(--accent)', fontSize: 12.5, fontWeight: 600, cursor: 'pointer' }}>🖥 Präsentationsmodus</button>
                    </div>
                    <div style={{ borderTop: '1px solid var(--line)', paddingTop: 8, display: 'grid', gap: 4 }}>
                      {[['⚙ ' + t('nav.wizard'), () => setAnsicht('wizard')], ['🚀 ' + t('nav.onboarding'), () => setOnbAuf(true)], ['❓ ' + t('nav.hilfe'), () => { setHilfeErstmalig(false); setHilfeAuf(true) }]].map(([label, fn]) => (
                        <button key={label} onClick={() => { setMenuAuf(false); fn() }} style={{ textAlign: 'left', padding: '7px 8px', border: 'none', background: 'none', cursor: 'pointer', fontSize: 13, borderRadius: 'var(--radius-sm)', color: 'var(--ink)' }}
                          onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--bg)' }} onMouseLeave={(e) => { e.currentTarget.style.background = 'none' }}>{label}</button>
                      ))}
                    </div>
                  </div>
                </>
              )}
            </div>
          </>
        )}
      </header>

      {ansicht !== 'wizard' && themeById(branding.themeId).banner && (
        <div className="no-print" style={{ background: themeById(branding.themeId).accent, color: '#fff', textAlign: 'center',
          padding: '5px 16px', fontSize: 12, fontWeight: 600, letterSpacing: '.02em' }}>
          {themeById(branding.themeId).emoji} {themeById(branding.themeId).banner}
        </div>
      )}

      <HilfePanel offen={hilfeAuf} erstmalig={hilfeErstmalig} onSchliessen={hilfeSchliessen} />
      <CommandPalette onGeh={geh} onKpi={(id) => { setBaumStart(id); setAnsicht('baum') }} rolle={rolle} istAdmin={adminAktiv} />
      {loginAuf && <LoginDialog gruppen={gruppen}
        onAnmelden={({ name, rolleId }) => { const a = { name, rolleId }; setAnmeldung(a); try { localStorage.setItem('er_anmeldung', JSON.stringify(a)) } catch {} ; setLoginAuf(false) }}
        onClose={() => setLoginAuf(false)} />}
      {onbAuf && <Onboarding rolle={rolle} istAdmin={istAdmin(rolle)} onGeh={geh} onClose={() => setOnbAuf(false)} />}
      {infoView && infoMeta && (
        <BerichtInfoModal view={infoView} label={infoMeta.label} icon={infoMeta.icon} pfad={infoMeta.pfad}
          bereich={infoMeta.bereich} darf={infoMeta.relevant !== false} uid={uid} name={benutzer || 'Gast'}
          onClose={() => setInfoView(null)} onOpen={(v) => setAnsicht(v)} />
      )}

      <KpiDefProvider rolle={rolle} werte={werte} onSpringe={(id) => { setBaumStart(id); setAnsicht('baum') }}>
      <NavProvider value={{
        ansicht,
        imBaum: (kpiId) => { setBaumStart(kpiId); geh('baum') },
        details: (bereich, suche = '') => { const d = detailFuerBereich(bereich); if (d) gehDetail(d.id, suche); else geh('detailberichte') },
        struktur: () => gehDetail('hierarchie')
      }}>
      <main style={{ padding: '22px 24px', maxWidth: 1800, margin: '0 auto' }}>
        {onbBanner && ansicht !== 'wizard' && (
          <div className="no-print" style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap', marginBottom: 14, padding: '10px 14px',
            background: 'var(--accent-soft)', border: '1px solid var(--accent)', borderRadius: 'var(--radius)' }}>
            <span style={{ fontSize: 20 }}>🚀</span>
            <span style={{ flex: 1, minWidth: 200, fontSize: 13.5, color: 'var(--ink)' }}>
              <b>Neu hier{rolle?.name ? ` als ${rolle.name}` : ''}?</b> Kurzer Rundgang durch die wichtigsten Berichte deiner Rolle — oder jederzeit über 🚀 oben.
            </span>
            <button onClick={() => { setOnbBanner(false); setOnbAuf(true) }} style={{ padding: '7px 14px', border: 'none', borderRadius: 'var(--radius-sm)', background: 'var(--accent)', color: '#fff', fontWeight: 600, cursor: 'pointer', fontSize: 13 }}>Rundgang starten</button>
            <button onClick={() => setOnbBanner(false)} aria-label="Banner schließen" style={{ border: 'none', background: 'transparent', cursor: 'pointer', color: 'var(--muted)', fontSize: 18, lineHeight: 1 }}>×</button>
          </div>
        )}
        {ansicht !== 'wizard' && eintragIndex[ansicht] && (
          <BerichtInfoBanner view={ansicht} label={eintragIndex[ansicht].label} icon={eintragIndex[ansicht].icon} pfad={eintragIndex[ansicht].pfad} />
        )}
        {ansicht === 'wizard' && (
          <SetupWizard
            onFertig={() => { localStorage.setItem(SETUP_KEY, '1'); setAnsicht('baum') }}
            onAbbruch={() => setAnsicht(localStorage.getItem(SETUP_KEY) ? 'baum' : 'wizard')} />
        )}
        {ansicht === 'startseite' && (
          <Startseite verbindung={verbindung} onGeh={geh} />
        )}
        {ansicht === 'baum' && (
          <TreeNavigator rolle={rolle} werte={werte} periode={periode} startId={baumStart} onOpenReport={() => setAnsicht('report')} onDetail={gehDetail} />
        )}
        {ansicht === 'katalog' && (
          <Berichtskatalog rolle={rolle} onOpen={(id, typ) => {
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
        {ansicht === 'onepager' && (
          <OnePager rolle={rolle} werte={werte} onGeh={geh} onKpi={(id) => { setBaumStart(id); setAnsicht('baum') }} />
        )}
        {ansicht === 'roterfaden' && (
          <RoterFaden rolle={rolle} werte={werte} onGeh={geh} onKpi={(id) => { setBaumStart(id); setAnsicht('baum') }} />
        )}
        {ansicht === 'assistent' && (
          <Assistent rolle={rolle} werte={werte} onGeh={geh} onKpi={(id) => { setBaumStart(id); setAnsicht('baum') }} />
        )}
        {ansicht === 'kennzahlen' && (
          <Kennzahlen rolle={rolle} werte={werte} />
        )}
        {ansicht === 'kpieditor' && (
          <KpiEditor werte={werte} onChange={() => { leereCache(); ladeKpiWerte(periode).then(setWerte) }} />
        )}
        {ansicht === 'detailberichte' && (
          <Detailberichte startListe={detailStart} startSuche={detailSuche} werte={werte} />
        )}
        {ansicht === 'zeit' && (
          <ZeitDatenart onChange={setZeitModell} />
        )}
        {ansicht === 'segment' && (
          <Segmentbericht />
        )}
        {ansicht === 'vergleich' && (
          <Versionsvergleich />
        )}
        {ansicht === 'verteiler' && (
          <Verteiler werte={werte} periode={periode} />
        )}
        {ansicht === 'abschluss' && (
          <Abschluss werte={werte} />
        )}
        {ansicht === 'abstimmung' && (
          <Abstimmung werte={werte} periode={periode} />
        )}
        {ansicht === 'controlling' && (
          <ControllingStruktur werte={werte} rolle={rolle} />
        )}
        {ansicht === 'klrablauf' && (
          <KLRAblauf onGeh={geh} />
        )}
        {ansicht === 'ablaufdiagramm' && (
          <Ablaufdiagramm onGeh={geh} />
        )}
        {ansicht === 'datenarchitektur' && (
          <Datenarchitektur />
        )}
        {ansicht === 'klr' && (
          <KLR werte={werte} rolle={rolle} periode={periode} onGeh={geh} />
        )}
        {ansicht === 'kostenarten' && (
          <Kostenartenrechnung onGeh={geh} rolle={rolle} />
        )}
        {ansicht === 'kalkulatorik' && (
          <Kalkulatorik werte={werte} onGeh={geh} />
        )}
        {ansicht === 'abgrenzung' && (
          <Abgrenzungsrechnung onGeh={geh} />
        )}
        {ansicht === 'lebenszyklus' && (
          <Lebenszyklus onDrill={(o) => gehDetail('artikel', o.gruppe || o.name)} />
        )}
        {ansicht === 'portfoliobcg' && (
          <PortfolioBcg />
        )}
        {ansicht === 'artikelkarte' && (
          <Artikelkarte rolle={rolle} werte={werte} periode={periode} />
        )}
        {ansicht === 'detailanalyse' && (
          <DetailAnalyse />
        )}
        {ansicht === 'quartalsbericht' && (
          <Quartalsbericht />
        )}
        {ansicht === 'finanzcockpit' && (
          <FinanzCockpit />
        )}
        {ansicht === 'pckostenstellen' && (
          <PcKostenstellen />
        )}
        {ansicht === 'kontenstrukturen' && (
          <Kontenstrukturen />
        )}
        {ansicht === 'leasing' && (
          <Leasing />
        )}
        {ansicht === 'versand' && (
          <Versand />
        )}
        {ansicht === 'berichtfreigabe' && (
          <Berichtfreigabe istAdmin={istAdmin(rolle)} />
        )}
        {ansicht === 'datenmodell' && (
          <DatenmodellAdmin istAdmin={istAdmin(rolle)} />
        )}
        {ansicht === 'datenschutz' && (
          <DatenschutzAdmin istAdmin={istAdmin(rolle)} />
        )}
        {ansicht === 'kisteuerung' && (
          <KiSteuerung istAdmin={istAdmin(rolle)} />
        )}
        {ansicht === 'kibuilder' && (
          <KiBuilder benutzer={benutzer} istAdmin={istAdmin(rolle)} />
        )}
        {ansicht === 'berichtlog' && (
          <BerichtLogAdmin istAdmin={istAdmin(rolle)} />
        )}
        {ansicht === 'google' && (
          <GoogleReporting />
        )}
        {ansicht === 'datenquellen' && (
          <Datenquellen />
        )}
        {ansicht === 'bestandsentwicklung' && (
          <Bestandsentwicklung />
        )}
        {ansicht === 'marktpotenzial' && (
          <Marktpotenzial />
        )}
        {['verkaufsstatistik', 'fahrradstatistik', 'einkaufsstatistik', 'produktionsstatistik'].includes(ansicht) && (
          <GlobalFilterLeiste />
        )}
        {ansicht === 'verkaufsstatistik' && (
          <Verkaufsstatistik />
        )}
        {ansicht === 'fahrradstatistik' && (
          <Fahrradstatistik />
        )}
        {ansicht === 'einkaufsstatistik' && (
          <Einkaufsstatistik />
        )}
        {ansicht === 'produktionsstatistik' && (
          <Produktionsstatistik />
        )}
        {ansicht === 'lzempfehlung' && (
          <LebenszyklusEmpfehlungen onGeh={geh} />
        )}
        {ansicht === 'einzelgemein' && (
          <EinzelGemein onGeh={geh} />
        )}
        {ansicht === 'auftrag' && (
          <AuftragsLebenszyklus />
        )}
        {ansicht === 'anlagen' && (
          <Anlagen onGeh={geh} />
        )}
        {ansicht === 'lieferant' && (
          <LieferantenLebenszyklus />
        )}
        {ansicht === 'marketing' && (
          <Marketing />
        )}
        {ansicht === 'events' && (
          <Events onGeh={geh} />
        )}
        {ansicht === 'bestand' && (
          <Bestand />
        )}
        {ansicht === 'lager' && (
          <Lagerverwaltung onGeh={geh} rolle={rolle} onDetail={gehDetail} />
        )}
        {ansicht === 'produktion' && (
          <Produktionscontrolling onGeh={geh} onDetail={gehDetail} />
        )}
        {ansicht === 'planung' && (
          <Planung onGeh={geh} />
        )}
        {ansicht === 'gutschriften' && (
          <Gutschriften />
        )}
        {ansicht === 'abgleichabsatz' && (
          <AbgleichAbsatz />
        )}
        {ansicht === 'vertriebkpi' && (
          <VertriebKennzahlen />
        )}
        {ansicht === 'prozesskette' && (
          <Prozesskette onGeh={geh} />
        )}
        {ansicht === 'tagesreporting' && (
          <Tagesreporting onGeh={geh} />
        )}
        {ansicht === 'marketingkarte' && (
          <MarketingKarte />
        )}
        {ansicht === 'szenario' && (
          <Szenario periode={periode} />
        )}
        {ansicht === 'wms' && (
          <WMS />
        )}
        {ansicht === 'forderungen' && (
          <Forderungen />
        )}
        {ansicht === 'mitarbeiter' && (
          <Mitarbeiter />
        )}
        {ansicht === 'technologie' && (
          <Technologie onGeh={geh} />
        )}
        {ansicht === 'kostenstellen' && (
          <Kostenstellenrechnung onGeh={geh} />
        )}
        {ansicht === 'bab' && (
          <BAB onGeh={geh} />
        )}
        {ansicht === 'profitcenter' && (
          <Profitcenter onGeh={geh} />
        )}
        {ansicht === 'abweichung' && (
          <Abweichungsanalyse onGeh={geh} />
        )}
        {ansicht === 'kalkulation' && (
          <Kalkulation onGeh={geh} />
        )}
        {ansicht === 'ergebnis' && (
          <Ergebnisrechnung onGeh={geh} />
        )}
        {ansicht === 'deckungsbeitrag' && (
          <Deckungsbeitrag onGeh={geh} />
        )}
        {ansicht === 'lernpfad' && (
          <Lernpfad onGeh={geh} />
        )}
        {ansicht === 'doku' && (
          <Doku onGeh={geh} />
        )}
        {ansicht === 'transport' && (
          <Transport benutzer={benutzer} />
        )}
        {ansicht === 'admin' && (
          <Admin istAdmin={istAdmin(rolle)} onChange={setBranding} />
        )}
        {ansicht === 'nutzung' && (
          <Nutzung istAdmin={istAdmin(rolle)} />
        )}
        {ansicht === 'rechte' && (
          <RollenRechte benutzer={benutzer} onChange={(list) => {
            setGruppen(list)
            if (!list.find((g) => g.id === rolleId)) setRolleId(list[0]?.id || null)
          }} />
        )}
      </main>
      </NavProvider>
      </KpiDefProvider>

      {/* Dezenter, aber unmissverständlicher Urheberhinweis. */}
      <footer className="no-print" style={{ textAlign: 'center', padding: '14px 20px 22px', color: 'var(--muted)', fontSize: 11.5 }}>
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 8 }}><KiStatusBadge /></div>
        Bei Rückfragen wende dich ans <b style={{ color: 'var(--ink)' }}>Business Controlling</b> ·{' '}
        <a href="https://servicedesk.example.com/controlling" target="_blank" rel="noreferrer"
          style={{ color: 'var(--accent)', fontWeight: 600, textDecoration: 'none' }}>🎫 Ticket erstellen</a>
      </footer>

      {praesentation && (
        <button onClick={() => setPraesentation(false)} title="Präsentationsmodus verlassen (Esc)"
          style={{ position: 'fixed', top: 14, right: 16, zIndex: 200, padding: '8px 14px', borderRadius: 999, border: '1px solid var(--line)',
            background: 'var(--panel)', color: 'var(--ink)', fontSize: 13, fontWeight: 600, cursor: 'pointer', boxShadow: 'var(--shadow)' }}>✕ Präsentation verlassen</button>
      )}
    </div>
    </FilterProvider>
  )
}
