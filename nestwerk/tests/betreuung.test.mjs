import { chromium } from 'playwright-core'

const exec = '/opt/pw-browsers/chromium'
const base = 'http://localhost:4173'

const seed = {
  family: { name: 'Testfam' },
  members: [
    { id: 'a1', name: 'Papa', color: '#3D7BFF', kind: 'adult', is_admin: true, can_direct: true },
    { id: 'k1', name: 'Emma', color: '#FF5D73', kind: 'kid' },
  ],
  events: [], items: [], memories: {}, active: 'a1',
}

const browser = await chromium.launch({ executablePath: exec })
const ctx = await browser.newContext({ viewport: { width: 1200, height: 900 } })
const page = await ctx.newPage()
await page.goto(base)
await page.evaluate((s) => localStorage.setItem('eselsohr-v1', JSON.stringify(s)), seed)
await page.reload()
await page.waitForTimeout(400)

// Profile picker may appear — click Papa
const papa = page.locator('.profiles button', { hasText: 'Papa' })
if (await papa.count()) await papa.first().click()
await page.waitForTimeout(300)

const fail = (m) => { console.log('FAIL: ' + m); process.exitCode = 1 }
const ok = (m) => console.log('OK: ' + m)

// 1. Heute card shows the question + setup hint
const body = await page.textContent('body')
body.includes('Wann sind die Kinder in der Betreuung?') ? ok('Heute-Karte da') : fail('Heute-Karte fehlt')
body.includes('noch keine Zeiten hinterlegt') ? ok('Setup-Hinweis da') : fail('Setup-Hinweis fehlt')

// 2. Open CareSheet from the Heute card
await page.locator('.row', { hasText: 'noch keine Zeiten hinterlegt' }).first().click()
await page.waitForTimeout(300)
const sheetText = await page.textContent('.sheet').catch(() => '')
sheetText.includes('Betreuung · Emma') ? ok('CareSheet öffnet') : fail('CareSheet öffnet nicht: ' + sheetText.slice(0, 80))

// 3. Add Kita Mo–Fr 08:00–14:00 and save (defaults are exactly that)
await page.locator('.sheet button', { hasText: '+ Zeit hinzufügen' }).click()
await page.waitForTimeout(150)
const afterAdd = await page.textContent('.sheet')
afterAdd.includes('Kita') && afterAdd.includes('08:00–14:00') ? ok('Block hinzugefügt') : fail('Block fehlt im Sheet')
await page.locator('.sheet button', { hasText: 'Speichern' }).click()
await page.waitForTimeout(300)

// 4. Persisted on the kid member
const stored = await page.evaluate(() => JSON.parse(localStorage.getItem('eselsohr-v1')))
const kid = stored.members.find((m) => m.id === 'k1')
kid.care?.length === 1 && kid.care[0].label === 'Kita' && kid.care[0].days.join(',') === '0,1,2,3,4'
  ? ok('care persistiert: ' + JSON.stringify(kid.care[0]))
  : fail('care nicht persistiert: ' + JSON.stringify(kid.care))

// 5. Heute card now answers the question (today is a weekday? 2026-08-13 = Do → yes)
const body2 = await page.textContent('body')
const wd = new Date().getDay() // 0 So .. 6 Sa
const isWeekday = wd >= 1 && wd <= 5
if (isWeekday) {
  body2.includes('Emma: Kita 08:00–14:00') ? ok('Antwort auf Heute-Karte') : fail('Antwort fehlt auf Heute-Karte')
  body2.includes('ab 14:00 zu Hause') ? ok('„ab … zu Hause“-Hinweis') : fail('zu-Hause-Hinweis fehlt')
} else {
  body2.includes('heute keine Betreuung') ? ok('Wochenende korrekt') : fail('Wochenend-Fall falsch')
}

// 6. Kalender day view shows the care row
await page.locator('.navbtn', { hasText: 'Kalender' }).click()
await page.waitForTimeout(300)
const calText = await page.textContent('body')
if (isWeekday) {
  calText.includes('Emma · Kita') && calText.includes('in Betreuung bis 14:00')
    ? ok('Kalender-Tagesansicht zeigt Betreuung') : fail('Kalender zeigt Betreuung nicht')
}

// 7. Familie screen shows 🏫 button with count
await page.locator('.navbtn', { hasText: 'Familie' }).click()
await page.waitForTimeout(300)
const famText = await page.textContent('body')
famText.includes('Betreuung · 1') ? ok('Familie-Button mit Zähler') : fail('Familie-Button fehlt')

await browser.close()
console.log(process.exitCode ? 'TESTS FAILED' : 'ALL TESTS PASSED')
