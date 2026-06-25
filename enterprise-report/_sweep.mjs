import { chromium } from 'playwright'
const VIEWS = `baum tagesreporting quartalsbericht kennzahlen katalog kpieditor designer kibuilder detailberichte klr kostenarten kalkulatorik einzelgemein abgrenzung kostenstellen bab kalkulation deckungsbeitrag ergebnis profitcenter pckostenstellen kontenstrukturen finanzcockpit leasing segment marketing marketingkarte marktpotenzial verkaufsstatistik fahrradstatistik einkaufsstatistik produktionsstatistik google gutschriften vertriebkpi prozesskette events bestand bestandsentwicklung lager wms produktion lieferant auftrag versand forderungen bi planung szenario abgleichabsatz abweichung vergleich portfoliobcg qc abstimmung lebenszyklus lzempfehlung anlagen technologie mitarbeiter massnahmen instrumente alerts zeit lernpfad doku datenquellen controlling klrablauf ablaufdiagramm datenarchitektur abschluss verteiler transport admin datenmodell datenschutz kisteuerung berichtfreigabe berichtlog nutzung rechte`.split(/\s+/)
const b = await chromium.launch()
const p = await b.newPage({ viewport: { width: 1440, height: 900 } })
const errors = []
p.on('console', (m) => { if (m.type() === 'error') errors.push('[c] ' + m.text().slice(0,160)) })
p.on('pageerror', (e) => errors.push('[p] ' + String(e).slice(0,160)))
await p.goto('http://localhost:4322')
await p.evaluate(() => {
  localStorage.setItem('er_setup_done','1'); localStorage.setItem('er_hilfe_gesehen','1')
  localStorage.setItem('er_onboarding_gesehen', JSON.stringify(['controller','gf','admin','mitarbeiter','bl_vk','bl_log','bl_hr','standard']))
})
const bad = []
for (const v of VIEWS) {
  errors.length = 0
  await p.evaluate((view) => localStorage.setItem('er_demo_view', view), v)
  await p.goto('http://localhost:4322', { waitUntil: 'domcontentloaded' })
  await p.waitForTimeout(120)
  const txtLen = await p.evaluate(() => document.querySelector('main')?.innerText?.length || 0)
  if (errors.length) bad.push(`${v}: ${errors[0]}`)
  if (txtLen < 40) bad.push(`${v}: LEER(${txtLen})`)
}
console.log('VIEWS:', VIEWS.length, 'PROBLEME:', bad.length)
bad.forEach((x) => console.log(' -', x))
await b.close()
