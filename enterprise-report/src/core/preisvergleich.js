// =========================================================================
//  WETTBEWERBS-PREISVERGLEICH — Demo-Anbindung im Stil von „Preispiranha".
//  Liefert je Artikel (SKU) deterministische Vergleichspreise des Marktes.
//  TODO: später echte Preispiranha-API statt der hier erzeugten Demo-Daten.
// =========================================================================
const HAENDLER = ['Amazon', 'idealo Bestpreis', 'Decathlon', 'Bike24', 'eBay']
const r2 = (n) => Math.round(n * 100) / 100

function hash(s) { let h = 0; for (const c of String(s)) h = (h * 31 + c.charCodeAt(0)) >>> 0; return h }

/** Vergleichspreise inkl. eigener Position (oder null, wenn kein VK bekannt). */
export function preisvergleich({ sku, vk }) {
  if (!vk || vk <= 0) return null
  const h = hash(sku)
  const wettbewerber = HAENDLER.map((haendler, i) => {
    const faktor = 0.86 + (((h >> (i * 3)) & 0xff) / 255) * 0.30 // 0.86 .. 1.16
    const preis = r2(vk * faktor)
    return { haendler, preis, delta: r2((preis - vk) / vk * 100) }
  }).sort((a, b) => a.preis - b.preis)

  const alle = [...wettbewerber.map((w) => w.preis), vk].sort((a, b) => a - b)
  const position = alle.indexOf(vk) + 1 // 1 = günstigster
  const guenstigster = wettbewerber[0]
  return {
    quelle: 'Preispiranha (Demo-Daten)', stand: '2026-06-20', eigenerVk: vk,
    wettbewerber, guenstigster, position, anzahl: alle.length,
    unterbietetUns: wettbewerber.filter((w) => w.preis < vk).length
  }
}
