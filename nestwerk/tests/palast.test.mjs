import { chromium } from 'playwright-core'

const browser = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' })
const page = await (await browser.newContext({ viewport: { width: 1200, height: 950 } })).newPage()
const fail = (m) => { console.log('FAIL: ' + m); process.exitCode = 1 }
const ok = (m) => console.log('OK: ' + m)

// PBKDF2 (310 000 Runden) braucht je nach Rechner spürbar Zeit → großzügig warten
const unlock = async (pw) => {
  await page.fill('input[aria-label="Gedächtnis-Passwort"]', pw)
  await page.locator('.lockbox button').click()
}

await page.goto('http://localhost:4173')
await page.evaluate(() => localStorage.clear())
await page.reload(); await page.waitForTimeout(300)

// Familie anlegen, in den Palast
await page.fill('#famname', 'Familie Test')
await page.fill('#myname', 'Markus')
await page.locator('button', { hasText: 'Familie anlegen' }).click()
await page.waitForTimeout(300)
await page.locator('.navbtn', { hasText: 'Gedächtnispalast' }).click()

// Passwort setzen (erstes Entsperren legt den Schlüssel an)
await unlock('geheim-123')
await page.locator('.lockbox').waitFor({ state: 'detached', timeout: 20000 })
ok('Palast entsperrt')

// Ordnung-Starterseiten anlegen
await page.locator('button', { hasText: 'Ordnung anlegen' }).click()
await page.waitForTimeout(500)
let body = await page.textContent('body')
body.includes('4 Säulen der Empathie') ? ok('Ordnung-Seiten da (4 Säulen)') : fail('Ordnung fehlt')

// Verschlüsselung: nichts davon liegt im Klartext im Speicher
await page.waitForTimeout(2500) // debounced persist + Krypto
const raw = await page.evaluate(() => localStorage.getItem('eselsohr-v1'))
!raw.includes('Säulen') && !raw.includes('Prioritäten') ? ok('Inhalte nur verschlüsselt gespeichert') : fail('Klartext im Speicher!')
raw.includes('cipher') ? ok('Chiffretext vorhanden') : fail('Kein cipher-Blob')

// Reload → wieder verschlossen, mit Passwort wieder da
await page.reload(); await page.waitForTimeout(400)
await page.locator('.navbtn', { hasText: 'Gedächtnispalast' }).click()
await page.locator('.lockbox').waitFor({ timeout: 5000 })
ok('Nach Reload verschlossen')
await unlock('geheim-123')
await page.locator('.lockbox').waitFor({ state: 'detached', timeout: 20000 })
await page.locator('.osec', { hasText: 'Ordnung' }).first().click().catch(() => {})
await page.waitForTimeout(400)
;(await page.textContent('body')).includes('4 Säulen der Empathie') ? ok('Inhalte nach Entsperren wieder da') : fail('Inhalte weg')

// Falsches Passwort bleibt draußen
await page.reload(); await page.waitForTimeout(400)
await page.locator('.navbtn', { hasText: 'Gedächtnispalast' }).click()
await unlock('falsch-456')
await page.waitForTimeout(6000)
await page.locator('.lockbox').isVisible() ? ok('Falsches Passwort bleibt draußen') : fail('Falsches Passwort kam durch!')

await browser.close()
console.log(process.exitCode ? 'TESTS FAILED' : 'ALL TESTS PASSED')
