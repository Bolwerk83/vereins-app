import { chromium } from 'playwright'
const base='http://localhost:8099/'
const b=await chromium.launch({executablePath:'/opt/pw-browsers/chromium'})
const c=await b.newContext({viewport:{width:1280,height:1500},deviceScaleFactor:1})
const p=await c.newPage()
await p.addInitScript(()=>{localStorage.setItem('er_setup_done','1');localStorage.setItem('er_hilfe_gesehen','1');localStorage.setItem('er_anmeldung',JSON.stringify({name:'Bolwerk',rolleId:'g-controlling'}))})
// Planung-Bericht
await p.addInitScript(()=>localStorage.setItem('er_demo_view','planung'))
await p.goto(base,{waitUntil:'networkidle'}); await p.waitForTimeout(900)
await p.screenshot({path:'/tmp/claude-0/-home-user-vereins-app/06740ba9-f1a4-550a-8eff-e1ccbf2c2bae/scratchpad/planung_node.png',fullPage:true})
// Burger-Menü öffnen
const burger = await p.$('header button[aria-label="Menü öffnen"]') || await p.$('header button')
if (burger) { await burger.click(); await p.waitForTimeout(500); await p.screenshot({path:'/tmp/claude-0/-home-user-vereins-app/06740ba9-f1a4-550a-8eff-e1ccbf2c2bae/scratchpad/burger.png'}) }
await b.close(); console.log('done')
