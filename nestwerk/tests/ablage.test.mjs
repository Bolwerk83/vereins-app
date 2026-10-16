// Papierlose Ablage im Gedächtnispalast:  node tests/ablage.test.mjs  (Testserver auf :4173)
// Ablegen mit Steuer-Angabe, große Dateien, Filter, Steuerordner als ZIP, Teilen,
// Papierkorb, Reload, Backup mit Dokumenten, Umzug alter Dokumente.
import { chromium } from 'playwright-core'
import { readFileSync } from 'fs'

const URL = 'http://localhost:4173'
// UTF-8-Umgebung, sonst ersetzt Chromium Dateinamen mit Umlauten durch „download“
const browser = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium', env: { ...process.env, LANG: 'C.UTF-8', LC_ALL: 'C.UTF-8' } })
let fails = 0
const ok = (c, m, x) => { console.log((c ? 'OK: ' : 'FAIL: ') + m + (c || x === undefined ? '' : '  → ' + JSON.stringify(x))); if (!c) fails++ }

// Mini-Entpacker für die Prüfung (gespeicherte Einträge, wie Eselsohr sie schreibt)
function unzip(buf) {
  const out = {}
  let p = 0
  while (p + 30 <= buf.length && buf.readUInt32LE(p) === 0x04034b50) {
    const size = buf.readUInt32LE(p + 18)
    const nlen = buf.readUInt16LE(p + 26)
    const xlen = buf.readUInt16LE(p + 28)
    const name = buf.subarray(p + 30, p + 30 + nlen).toString('utf8')
    const start = p + 30 + nlen + xlen
    out[name] = buf.subarray(start, start + size)
    p = start + size
  }
  return out
}

const pdf = Buffer.alloc(2_500_000)
for (let i = 0; i < pdf.length; i++) pdf[i] = (i * 7 + (i >> 9)) & 255
pdf.write('%PDF-1.4\n', 0)
const png = (n) => { const b = Buffer.alloc(3000 + n); b.write('\x89PNG\r\n\x1a\n', 0, 'latin1'); return b }

async function fresh(page) {
  await page.goto(URL)
  await page.evaluate(() => new Promise((res) => { localStorage.clear(); const r = indexedDB.deleteDatabase('eselsohr-dokumente'); r.onsuccess = r.onerror = r.onblocked = () => res() }))
  await page.reload(); await page.waitForTimeout(300)
}
async function unlock(page, pw) {
  await page.locator('.navbtn', { hasText: 'Gedächtnispalast' }).click()
  await page.fill('input[aria-label="Gedächtnis-Passwort"]', pw)
  await page.locator('.lockbox button').click()
  await page.locator('.lockbox').waitFor({ state: 'detached', timeout: 20000 })
}
const choose = (page, files) => page.setInputFiles('input[aria-label="Dokumente auswählen"]', files)
const download = async (page, click) => {
  const [dl] = await Promise.all([page.waitForEvent('download', { timeout: 15000 }), click()])
  return { name: dl.suggestedFilename(), buf: readFileSync(await dl.path()) }
}

const ctx = await browser.newContext({ viewport: { width: 1280, height: 950 }, acceptDownloads: true })
const page = await ctx.newPage()
const errs = []
page.on('pageerror', (e) => errs.push(e.message))
await fresh(page)
await page.fill('#famname', 'Familie Test')
await page.fill('#myname', 'Markus')
await page.locator('button', { hasText: 'Familie anlegen' }).click()
await page.waitForTimeout(300)
await unlock(page, 'geheim-123')
await page.locator('.osec', { hasText: 'Dokumente' }).click()
ok(await page.locator('.dk-empty', { hasText: 'Papierlos ab heute' }).isVisible(), 'Leere Ablage lädt zum ersten Dokument ein')

console.log('— Ablegen mit Steuer-Angabe')
await choose(page, { name: 'Rechnung_Heizungswartung_2026-03-12.pdf', mimeType: 'application/pdf', buffer: pdf })
await page.locator('.dk-sheet h3', { hasText: 'Dokument ablegen' }).waitFor()
ok((await page.inputValue('#dk-title')) === 'Rechnung Heizungswartung', 'Titel kommt sauber aus dem Dateinamen', await page.inputValue('#dk-title'))
ok((await page.inputValue('#dk-date')) === '2026-03-12', 'Datum wird aus dem Dateinamen erkannt')
ok((await page.textContent('.dk-pick[aria-label="Ordner"] [aria-checked="true"]')).includes('Wohnen'), 'Ordner-Vorschlag: Wohnen & Energie')
ok((await page.textContent('.dk-tax .themeseg [aria-pressed="true"]')) === 'Ja' && (await page.textContent('.dk-tax-t small')).includes('„Wartung“'), 'Steuerrelevant ist vorgeschlagen – mit Begründung')
ok((await page.textContent('.dk-pick[aria-label="Steuerjahr"] [aria-checked="true"]')) === '2026' && (await page.textContent('.dk-pick[aria-label="Steuer-Art"] [aria-checked="true"]')) === 'Handwerker & Haushalt', 'Steuerjahr 2026 und Art „Handwerker & Haushalt“ vorbelegt')
await page.fill('#dk-betrag', '189,00')
await page.locator('.dk-sheet button', { hasText: 'Verschlüsselt ablegen' }).click()
const pdfRow = page.locator('.dk-row', { hasText: 'Rechnung Heizungswartung' })
await pdfRow.waitFor({ timeout: 15000 })
ok((await pdfRow.textContent()).includes('189,00') && (await pdfRow.locator('.dk-badge').textContent()) === '2026', 'Liste zeigt Betrag und Steuer-Plakette 2026')

const store = await page.evaluate(() => new Promise((res) => {
  const r = indexedDB.open('eselsohr-dokumente')
  r.onsuccess = () => {
    const all = r.result.transaction('dateien').objectStore('dateien').getAll()
    all.onsuccess = () => res(all.result.map((x) => ({ len: x.data.byteLength, klartext: new TextDecoder().decode(new Uint8Array(x.data).slice(0, 8)) })))
  }
}))
ok(store.length === 1 && store[0].len > 2_500_000 && !store[0].klartext.startsWith('%PDF'), '2,5-MB-Datei liegt verschlüsselt in der Browser-Datenbank', store)
ok(!(await page.evaluate(() => localStorage.getItem('eselsohr-v1'))).includes('Heizungswartung'), 'Titel und Angaben stehen nirgends im Klartext')

await choose(page, [
  { name: 'Kita_Beitrag_Januar.png', mimeType: 'image/png', buffer: png(1) },
  { name: 'Kita_Beitrag_Februar.png', mimeType: 'image/png', buffer: png(2) },
])
await page.locator('.dk-sheet h3', { hasText: '2 Dokumente ablegen' }).waitFor()
ok((await page.textContent('.dk-pick[aria-label="Steuer-Art"] [aria-checked="true"]')) === 'Kinderbetreuung' && (await page.textContent('.dk-pick[aria-label="Ordner"] [aria-checked="true"]')).includes('Kinder'), 'Mehrere Dateien: gemeinsame Angaben, „Kita“ → Kinderbetreuung')
await page.locator('.dk-sheet button', { hasText: '2 Dokumente verschlüsselt ablegen' }).click()
await page.locator('.dk-row', { hasText: 'Kita Beitrag Februar' }).waitFor({ timeout: 15000 })

await choose(page, { name: 'Mietvertrag Wohnung.pdf', mimeType: 'application/pdf', buffer: Buffer.from('%PDF-1.4 Mietvertrag') })
await page.locator('.dk-sheet h3', { hasText: 'Dokument ablegen' }).waitFor()
ok((await page.textContent('.dk-tax .themeseg [aria-pressed="true"]')) === 'Nein', 'Ohne Hinweis bleibt „Steuerrelevant“ auf Nein')
await page.locator('.dk-sheet button', { hasText: 'Verschlüsselt ablegen' }).click()
await page.locator('.dk-row', { hasText: 'Mietvertrag Wohnung' }).waitFor({ timeout: 15000 })
ok((await page.locator('.dk-row').count()) === 4 && (await page.locator('.dk-group').count()) >= 2, 'Vier Dokumente, nach Monaten gruppiert')

console.log('— Steuerordner')
await page.locator('.dk-filter .themeseg button', { hasText: 'Steuer' }).click()
await page.waitForTimeout(150)
const sum = await page.textContent('.dk-sum')
ok(sum.includes('Steuerordner 2026') && sum.includes('3 Belege') && sum.includes('189,00'), 'Steuerordner 2026: drei Belege mit Summe', sum)
ok((await page.locator('.dk-group').allTextContents()).map((t) => t.replace(/\d+$/, '')).join('|') === 'Handwerker & Haushalt|Kinderbetreuung', 'Belege nach Art sortiert – wie in der Erklärung')
const zip = await download(page, () => page.locator('.dk-sum button', { hasText: 'Steuerordner als ZIP' }).click())
const z = unzip(zip.buf)
const names = Object.keys(z)
ok(zip.name === 'Steuer 2026 – Markus.zip', 'ZIP heißt „Steuer 2026 – Markus.zip“', zip.name)
ok(names.includes('Übersicht.csv') && names.includes('Handwerker & Haushalt/2026-03-12 Rechnung Heizungswartung.pdf') && names.filter((n) => n.startsWith('Kinderbetreuung/')).length === 2, 'ZIP enthält Ordner je Art und die Übersicht', names)
ok(Buffer.compare(z['Handwerker & Haushalt/2026-03-12 Rechnung Heizungswartung.pdf'], pdf) === 0, 'Die PDF im ZIP ist Byte für Byte das Original')
const csv = z['Übersicht.csv'].toString('utf8')
ok(csv.startsWith('﻿Datum;Titel') && csv.includes('12.3.2026;Rechnung Heizungswartung;Wohnen & Energie;ja;2026;Handwerker & Haushalt;189,00') && /Summe;+189,00/.test(csv), 'Übersicht.csv mit Betrag und Summe (für Excel)', csv.slice(0, 300))

console.log('— Teilen und Laden')
await page.locator('.dk-filter .themeseg button', { hasText: 'Alle' }).click()
await page.evaluate(() => {
  window.__geteilt = null
  navigator.canShare = () => true
  navigator.share = async (d) => { window.__geteilt = d.files.map((f) => ({ name: f.name, size: f.size, type: f.type })) }
})
await page.locator('.dk-row', { hasText: 'Rechnung Heizungswartung' }).click()
await page.locator('.dk-card', { hasText: 'bereit zum Teilen' }).waitFor({ timeout: 10000 })
await page.locator('.dk-sheet button', { hasText: 'Teilen' }).click()
await page.waitForTimeout(300)
const geteilt = await page.evaluate(() => window.__geteilt)
ok(geteilt?.[0]?.name === '2026-03-12 Rechnung Heizungswartung.pdf' && geteilt[0].size === pdf.length && geteilt[0].type === 'application/pdf', 'Teilen gibt die entschlüsselte Datei mit sprechendem Namen ans Teilen-Menü', geteilt)
const one = await download(page, () => page.locator('.dk-sheet button', { hasText: 'Herunterladen' }).click())
ok(one.name === '2026-03-12 Rechnung Heizungswartung.pdf' && Buffer.compare(one.buf, pdf) === 0, 'Herunterladen liefert das Original zurück')

await page.locator('.dk-sheet button', { hasText: 'Bearbeiten' }).click()
await page.fill('#dk-title', 'Heizung – Wartung 2026')
await page.locator('.dk-sheet button', { hasText: 'Speichern' }).click()
await page.locator('.dk-row', { hasText: 'Heizung – Wartung 2026' }).waitFor()
ok(true, 'Bearbeiten ändert den Titel')

await page.locator('.dk-row', { hasText: 'Mietvertrag Wohnung' }).click()
await page.locator('.dk-mark').click()
await page.waitForTimeout(200)
await page.locator('.dk-sheet .x').click()
ok((await page.textContent('.dk-filter .themeseg button:has-text("Steuer") .dk-n')) === '4', 'Nachträglich als steuerrelevant markiert (4 im Steuerordner)')

await page.locator('.dk-row', { hasText: 'Kita Beitrag Januar' }).click()
await page.locator('.dk-sheet button', { hasText: 'In den Papierkorb' }).click()
await page.waitForTimeout(200)
ok((await page.locator('.dk-row').count()) === 3 && (await page.textContent('.dk-filter .themeseg button >> nth=2')) === '1', 'Löschen legt in den Papierkorb (1)')
await page.locator('.dk-filter .themeseg button').nth(2).click()
await page.locator('.dk-trash-acts button', { hasText: 'Wiederherstellen' }).click()
await page.waitForTimeout(200)
ok((await page.locator('.dk-row').count()) === 4, 'Aus dem Papierkorb wiederhergestellt')

console.log('— Nach dem Neuladen')
await page.waitForTimeout(800)
await page.reload(); await page.waitForTimeout(400)
await unlock(page, 'geheim-123')
await page.locator('.osec', { hasText: 'Dokumente' }).click()
ok((await page.locator('.dk-row').count()) === 4, 'Alle vier Dokumente sind nach dem Neuladen da')
await page.locator('.dk-row', { hasText: 'Heizung – Wartung 2026' }).click()
await page.locator('.dk-card', { hasText: 'bereit zum Teilen' }).waitFor({ timeout: 10000 })
const again = await download(page, () => page.locator('.dk-sheet button', { hasText: 'Herunterladen' }).click())
ok(Buffer.compare(again.buf, pdf) === 0, 'Mit neu abgeleitetem Schlüssel wieder lesbar')
await page.locator('.dk-sheet .x').click()

console.log('— Backup mit Dokumenten')
await page.locator('.navbtn', { hasText: 'Familie' }).click()
const backup = await download(page, () => page.locator('.row', { hasText: 'Backup exportieren' }).first().click())
const bj = JSON.parse(backup.buf.toString('utf8'))
ok(Object.keys(bj.docFiles || {}).length === 4 && !backup.buf.toString('utf8').includes('Heizung'), 'Backup enthält die vier Dateien – weiterhin verschlüsselt')

const ctx2 = await browser.newContext({ viewport: { width: 1280, height: 950 }, acceptDownloads: true })
const p2 = await ctx2.newPage()
p2.on('pageerror', (e) => errs.push(e.message))
await fresh(p2)
await p2.fill('#famname', 'Leer')
await p2.fill('#myname', 'Neu')
await p2.locator('button', { hasText: 'Familie anlegen' }).click()
await p2.waitForTimeout(300)
await p2.locator('.navbtn', { hasText: 'Familie' }).click()
await p2.locator('.row', { hasText: 'Backup einspielen' }).click()
await p2.setInputFiles('input[aria-label="Backup-Datei"]', { name: 'eselsohr-backup.json', mimeType: 'application/json', buffer: backup.buf })
await p2.locator('.toast', { hasText: 'Backup eingespielt' }).waitFor({ timeout: 10000 })
ok((await p2.textContent('.toast')).includes('4 Dokumente zurück'), 'Backup auf neuem Gerät: Dateien kommen mit zurück')
await unlock(p2, 'geheim-123')
await p2.locator('.osec', { hasText: 'Dokumente' }).click()
await p2.locator('.dk-row', { hasText: 'Heizung – Wartung 2026' }).click()
await p2.locator('.dk-card', { hasText: 'bereit zum Teilen' }).waitFor({ timeout: 10000 })
const restored = await download(p2, () => p2.locator('.dk-sheet button', { hasText: 'Herunterladen' }).click())
ok(Buffer.compare(restored.buf, pdf) === 0, 'Wiederhergestellte Datei ist das Original')
await p2.locator('.dk-sheet .x').click()

console.log('— Alte Dokumente ziehen um')
// Ein Dokument im alten Format (direkt im Palast eingebettet, 400 KB) – genau das scheiterte früher beim Speichern
await p2.evaluate(async () => {
  const db = JSON.parse(localStorage.getItem('eselsohr-v1'))
  const blob = db.memories[db.active]
  const unb = (s) => Uint8Array.from(atob(s), (c) => c.charCodeAt(0))
  const b64 = (u) => { let s = ''; for (let i = 0; i < u.length; i += 0x8000) s += String.fromCharCode.apply(null, u.subarray(i, i + 0x8000)); return btoa(s) }
  const base = await crypto.subtle.importKey('raw', new TextEncoder().encode('geheim-123'), 'PBKDF2', false, ['deriveKey'])
  const key = await crypto.subtle.deriveKey({ name: 'PBKDF2', salt: unb(blob.salt), iterations: 310000, hash: 'SHA-256' }, base, { name: 'AES-GCM', length: 256 }, false, ['encrypt', 'decrypt'])
  const mem = JSON.parse(new TextDecoder().decode(await crypto.subtle.decrypt({ name: 'AES-GCM', iv: unb(blob.iv) }, key, unb(blob.cipher))))
  const bytes = new Uint8Array(400000); for (let i = 0; i < bytes.length; i++) bytes[i] = (i * 13) & 255
  mem.docs.push({ id: 'alt-1', name: 'Alter_Beleg.pdf', mime: 'application/pdf', size: bytes.length, b64: b64(bytes), added: '2025-01-02' })
  const iv = crypto.getRandomValues(new Uint8Array(12))
  const ct = await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, key, new TextEncoder().encode(JSON.stringify(mem)))
  db.memories[db.active] = { salt: blob.salt, iv: b64(iv), cipher: b64(new Uint8Array(ct)) }
  localStorage.setItem('eselsohr-v1', JSON.stringify(db))
})
await p2.reload(); await p2.waitForTimeout(400)
await unlock(p2, 'geheim-123')
await p2.locator('.osec', { hasText: 'Dokumente' }).click()
await p2.locator('.dk-row', { hasText: 'Alter Beleg' }).click()
await p2.locator('.dk-card', { hasText: 'bereit zum Teilen' }).waitFor({ timeout: 10000 })
const alt = await download(p2, () => p2.locator('.dk-sheet button', { hasText: 'Herunterladen' }).click())
ok(alt.buf.length === 400000 && alt.buf[13] === ((13 * 13) & 255), 'Altes Dokument ist lesbar')
await p2.waitForTimeout(800)
const moved = await p2.evaluate(() => new Promise((res) => {
  const r = indexedDB.open('eselsohr-dokumente')
  r.onsuccess = () => { const g = r.result.transaction('dateien').objectStore('dateien').get('alt-1'); g.onsuccess = () => res(!!g.result) }
}))
ok(moved && (await p2.evaluate(() => localStorage.getItem('eselsohr-v1').length)) < 300000, 'Beim Entsperren in die Browser-Datenbank umgezogen – der Palast ist wieder schlank')

ok(!errs.length, 'Keine Fehler in der Konsole', errs)
await browser.close()
console.log(fails ? `\n${fails} FEHLER` : '\nALLE ABLAGE-TESTS BESTANDEN')
process.exitCode = fails ? 1 : 0
