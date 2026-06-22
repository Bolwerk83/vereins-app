import { chromium } from 'playwright'
const b = await chromium.launch({ args: ['--no-sandbox'] })
const p = await b.newPage({ viewport: { width: 1440, height: 820 } })
const errs=[]; p.on('pageerror',e=>errs.push(e.message))
await p.goto('http://localhost:4173/?demo',{waitUntil:'networkidle'}); await p.waitForTimeout(900)
const inWizard = await p.getByText('Weiter →').count().catch(()=>0)
console.log('PAGEERRORS:', errs.length, '| Wizard sichtbar:', inWizard>0)
await p.screenshot({ path:'/tmp/shots/8-demo-start.png' })
// Burger -> Detailberichte -> Kontenliste
try {
  await p.locator('header button, button').filter({ hasText: '☰' }).first().click({ timeout: 3000 })
  await p.waitForTimeout(500)
  await p.getByText(/Detailberichte/).first().click(); await p.waitForTimeout(700)
  await p.getByRole('button',{name:/Kontenliste/}).first().click(); await p.waitForTimeout(700)
  await p.screenshot({ path:'/tmp/shots/7-konto.png' })
  console.log('Kontenliste-Screenshot ok')
} catch(e){ console.log('nav-fehler:', e.message.split('\n')[0]) }
await b.close()
