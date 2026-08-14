import { chromium } from 'playwright-core'

const browser = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' })
const fail = (m) => { console.log('FAIL: ' + m); process.exitCode = 1 }
const ok = (m) => console.log('OK: ' + m)

// Nachgebauter Server: exakt das Verhalten von supabase/sync.sql
const server = { row: null }
const handle = async (route) => {
  const url = route.request().url()
  const body = JSON.parse(route.request().postData() || '{}')
  const reply = (obj) => route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(obj) })
  if (url.endsWith('/rpc/es_create_family')) {
    if (server.row) return reply({ ok: false, error: 'code_exists' })
    server.row = { code: body.p_code, data: body.p_data, version: 1 }
    return reply({ ok: true, version: 1 })
  }
  if (url.endsWith('/rpc/es_pull')) {
    if (!server.row || server.row.code !== body.p_code) return reply({ ok: false, error: 'not_found' })
    return reply({ ok: true, data: server.row.data, version: server.row.version })
  }
  if (url.endsWith('/rpc/es_push')) {
    if (!server.row || server.row.code !== body.p_code) return reply({ ok: false, error: 'not_found' })
    if (server.row.version !== body.p_version) return reply({ ok: false, error: 'conflict', data: server.row.data, version: server.row.version })
    server.row = { ...server.row, data: body.p_data, version: body.p_version + 1 }
    return reply({ ok: true, version: server.row.version })
  }
  return route.continue()
}

const mkPage = async () => {
  const ctx = await browser.newContext({ viewport: { width: 1200, height: 1000 } })
  await ctx.route('**/rest/v1/rpc/**', handle)
  return ctx.newPage()
}

/* ---------- Gerät A: Familie anlegen, Sync einschalten, Termin pushen ---------- */
const a = await mkPage()
await a.goto('http://localhost:4173')
await a.evaluate(() => localStorage.clear())
await a.reload(); await a.waitForTimeout(300)
await a.fill('#famname', 'Familie Test')
await a.fill('#myname', 'Markus')
await a.locator('button', { hasText: 'Familie anlegen' }).click()
await a.waitForTimeout(300)
await a.locator('.navbtn', { hasText: 'Familie' }).click()
await a.locator('button', { hasText: 'Familien-Sync einschalten' }).click()
await a.waitForTimeout(500)
server.row ? ok('Familie in der Cloud angelegt') : fail('es_create_family kam nicht an')
const codeShown = await a.locator('.row-title[style*="monospace"]').textContent()
codeShown?.startsWith('ESEL-') ? ok('Familien-Code angezeigt: ' + codeShown) : fail('Kein Code sichtbar')
server.row?.data?.active === undefined ? ok('Gerätespezifisches (active) wird nicht gesynct') : fail('active im Sync-Payload')

// Termin anlegen → Push (debounced)
await a.locator('.navbtn', { hasText: 'Heute' }).click()
await a.locator('button', { hasText: '+ Termin' }).first().click()
await a.fill('#f-title', 'Zahnarzt')
await a.locator('.sheet button[type="submit"], .sheet .btn').filter({ hasText: /Speichern|anlegen|Eintragen/ }).first().click().catch(() => a.locator('.sheet form button.btn').last().click())
await a.waitForTimeout(2500)
server.row.version >= 2 && JSON.stringify(server.row.data).includes('Zahnarzt')
  ? ok('Änderung automatisch gepusht (v' + server.row.version + ')') : fail('Push fehlt: v' + server.row.version)

/* ---------- Gerät B: mit Code beitreten, Stand sehen, zurücksyncen ---------- */
const b = await mkPage()
await b.goto('http://localhost:4173')
await b.evaluate(() => localStorage.clear())
await b.reload(); await b.waitForTimeout(300)
await b.locator('button', { hasText: 'Familie beitreten (mit Sync-Code)' }).click()
await b.fill('#joincode', codeShown)
await b.locator('button', { hasText: 'Familie beitreten' }).last().click()
await b.waitForTimeout(800)
const bBody = await b.textContent('body')
bBody.includes('Wer bist du?') ? ok('Gerät B: Beitritt → Profilwahl') : fail('Beitritt scheitert: ' + bBody.slice(0, 120))
await b.locator('.profile', { hasText: 'Markus' }).click()
await b.waitForTimeout(400)
;(await b.textContent('body')).includes('Zahnarzt') ? ok('Gerät B sieht den Zahnarzt-Termin') : fail('Termin fehlt auf Gerät B')

// Gerät B ändert → Gerät A bekommt es beim nächsten Pull
await b.locator('.navbtn', { hasText: 'Listen' }).click()
await b.fill('input[placeholder="Was fehlt? (Enter)"]', 'Windeln')
await b.press('input[placeholder="Was fehlt? (Enter)"]', 'Enter')
await b.waitForTimeout(2500)
JSON.stringify(server.row.data).includes('Windeln') ? ok('Gerät B pusht (v' + server.row.version + ')') : fail('B-Push fehlt')
await a.evaluate(() => document.dispatchEvent(new Event('visibilitychange')))
await a.waitForTimeout(1000)
await a.locator('.navbtn', { hasText: 'Listen' }).click()
await a.waitForTimeout(300)
;(await a.textContent('body')).includes('Windeln') ? ok('Gerät A zieht die Änderung (Pull + Merge)') : fail('Pull/Merge fehlt auf A')

/* ---------- Papierkorb: löschen → wiederherstellen ---------- */
await a.locator('.navbtn', { hasText: 'Heute' }).click()
await a.locator('.row', { hasText: 'Zahnarzt' }).first().click()
await a.waitForTimeout(200)
await a.locator('.sheet button', { hasText: 'Löschen' }).click()
await a.waitForTimeout(400)
let aDb = await a.evaluate(() => JSON.parse(localStorage.getItem('eselsohr-v1')))
aDb.trash?.length === 1 && aDb.trash[0].row.title === 'Zahnarzt' ? ok('Gelöschtes landet im Papierkorb') : fail('Papierkorb leer')
await a.locator('.navbtn', { hasText: 'Familie' }).click()
await a.waitForTimeout(200)
;(await a.textContent('body')).includes('Papierkorb') ? ok('Papierkorb-Karte sichtbar') : fail('Papierkorb-Karte fehlt')
await a.locator('button', { hasText: 'Wiederherstellen' }).click()
await a.waitForTimeout(2500)
aDb = await a.evaluate(() => JSON.parse(localStorage.getItem('eselsohr-v1')))
aDb.events.some((e) => e.title === 'Zahnarzt') && aDb.trash.length === 0 ? ok('Wiederherstellen funktioniert') : fail('Restore kaputt')

/* ---------- Serien-Wächter & Backup-Erinnerung (lokal, ohne Sync) ---------- */
const c = await (await browser.newContext({ viewport: { width: 1200, height: 1000 } })).newPage()
await c.goto('http://localhost:4173')
const seed = await c.evaluate(() => {
  const iso = (d) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
  const ad = (n) => { const d = new Date(); d.setDate(d.getDate() + n); return iso(d) }
  const ev = (n, t) => ({ id: 'e' + n, member_id: 'm1', on_date: ad(n), at_time: '17:00', title: t, meta: '', serie: t === 'Schwimmkurs', status: 'fix', created_by: 'm1' })
  const db = {
    family: { name: 'Fam' },
    members: [{ id: 'm1', name: 'Markus', color: '#3D7BFF', kind: 'adult', is_admin: true, can_direct: true }],
    events: [ev(3, 'Schwimmkurs'), ev(10, 'Schwimmkurs'), ev(1, 'A'), ev(2, 'B'), ev(4, 'C'), ev(5, 'D'), ev(6, 'E'), ev(8, 'F'), ev(9, 'G')],
    items: [], memories: {}, active: 'm1',
  }
  localStorage.setItem('eselsohr-v1', JSON.stringify(db))
  return ad(10)
})
await c.reload(); await c.waitForTimeout(400)
let cBody = await c.textContent('body')
cBody.includes('Serie „Schwimmkurs“ endet am') ? ok('Serien-Wächter warnt vor stillem Auslaufen') : fail('Serien-Wächter fehlt')
cBody.includes('Noch nie gesichert') ? ok('Backup-Erinnerung erscheint') : fail('Backup-Erinnerung fehlt')
await c.locator('.row', { hasText: 'Schwimmkurs' }).locator('button', { hasText: '+ 8 Wochen' }).click()
await c.waitForTimeout(400)
const cDb = await c.evaluate(() => JSON.parse(localStorage.getItem('eselsohr-v1')))
cDb.events.filter((e) => e.title === 'Schwimmkurs').length === 10 ? ok('Serie um 8 Wochen verlängert') : fail('Verlängerung: ' + cDb.events.filter((e) => e.title === 'Schwimmkurs').length)
const maxDate = cDb.events.filter((e) => e.title === 'Schwimmkurs').map((e) => e.on_date).sort().pop()
maxDate > seed ? ok('Neue Termine liegen hinter dem alten Serienende') : fail('Daten falsch: ' + maxDate)

await browser.close()
console.log(process.exitCode ? 'TESTS FAILED' : 'ALL TESTS PASSED')
