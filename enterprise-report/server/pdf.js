// =========================================================================
//  PDF — HTML-Schnappschuss zu echtem PDF rendern (Puppeteer, optional).
//  Ist puppeteer nicht installiert oder schlägt der Start fehl, wird null
//  zurückgegeben; der Verteiler hängt dann das HTML an (Fallback).
// =========================================================================
let gewarnt = false

export async function htmlZuPdf(html) {
  let puppeteer
  try { puppeteer = (await import('puppeteer')).default } catch {
    if (!gewarnt) { console.log('puppeteer nicht installiert — PDF-Anhang fällt auf HTML zurück. Im Ordner server: npm install puppeteer'); gewarnt = true }
    return null
  }
  let browser
  try {
    browser = await puppeteer.launch({ headless: 'new', args: ['--no-sandbox', '--disable-setuid-sandbox'] })
    const page = await browser.newPage()
    await page.setContent(html, { waitUntil: 'networkidle0' })
    const pdf = await page.pdf({
      format: 'A4', printBackground: true,
      margin: { top: '14mm', bottom: '14mm', left: '12mm', right: '12mm' }
    })
    return Buffer.from(pdf)
  } catch (e) {
    console.error('PDF-Erzeugung fehlgeschlagen:', e.message)
    return null
  } finally { if (browser) { try { await browser.close() } catch { /* egal */ } } }
}

export function pdfVerfuegbar() {
  return import('puppeteer').then(() => true).catch(() => false)
}
