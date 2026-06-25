import { chromium } from 'playwright'
import fs from 'fs'
const VIEWS = 'verkaufsstatistik fahrradstatistik einkaufsstatistik produktionsstatistik quartalsbericht baum kennzahlen katalog deckungsbeitrag ergebnis profitcenter finanzcockpit leasing versand forderungen marktpotenzial bi qc lebenszyklus portfoliobcg datenarchitektur detailberichte abweichung planung admin datenschutz rechte'.split(' ')
const OUT = '/tmp/claude-0/-home-user-vereins-app/06740ba9-f1a4-550a-8eff-e1ccbf2c2bae/scratchpad/sweep3.txt'
fs.writeFileSync(OUT, 'START\n')
const log = (s) => { fs.appendFileSync(OUT, s + '\n'); console.log(s) }
const b = await chromium.launch()
const p = await b.newPage({ viewport: { width: 1440, height: 900 } })
const errors = []
p.on('console', (m) => { if (m.type() === 'error') errors.push('[c] ' + m.text().slice(0,140)) })
p.on('pageerror', (e) => errors.push('[p] ' + String(e).slice(0,140)))
await p.goto('http://localhost:4322')
await p.evaluate(() => { localStorage.setItem('er_setup_done','1'); localStorage.setItem('er_hilfe_gesehen','1'); localStorage.setItem('er_onboarding_gesehen', JSON.stringify(['controller','gf','admin','mitarbeiter','bl_vk','bl_log','bl_hr','standard'])) })
let probleme = 0
for (const v of VIEWS) {
  errors.length = 0
  await p.evaluate((view) => localStorage.setItem('er_demo_view', view), v)
  await p.goto('http://localhost:4322')
  let txtLen = 0
  try { await p.waitForFunction(() => (document.querySelector('main')?.innerText?.length || 0) > 40, { timeout: 4000 }); txtLen = await p.evaluate(() => document.querySelector('main').innerText.length) } catch { txtLen = await p.evaluate(() => document.querySelector('main')?.innerText?.length || 0).catch(()=>0) }
  const status = errors.length ? `ERR ${errors[0]}` : (txtLen < 40 ? `LEER(${txtLen})` : `ok(${txtLen})`)
  if (errors.length || txtLen < 40) probleme++
  log(`${v}: ${status}`)
}
log(`FERTIG: ${VIEWS.length} Views, ${probleme} Probleme`)
await b.close()
