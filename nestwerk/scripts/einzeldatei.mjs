// Baut aus dist/ eine einzige HTML-Datei (Schriften als data-URI eingebettet) – für die Demo-Seite.
// Aufruf nach `npm run build`:  node scripts/einzeldatei.mjs ../demo/nestwerk-demo.html
import { readFileSync, writeFileSync, readdirSync } from 'fs'

const out = process.argv[2] || '../demo/nestwerk-demo.html'
const dir = 'dist/assets/'
const files = readdirSync(dir)
const pick = (ext) => files.filter((f) => f.endsWith(ext)).map((f) => dir + f)
let css = pick('.css').map((f) => readFileSync(f, 'utf8')).join('\n')
const js = pick('.js').map((f) => readFileSync(f, 'utf8')).join('\n')

let fonts = 0
css = css.replace(/url\((["']?)\/?assets\/([^)"']+\.woff2)\1\)/g, (_, q, name) => {
  fonts++
  return `url(data:font/woff2;base64,${readFileSync(dir + name).toString('base64')})`
})

const html = `<title>Eselsohr</title>
<meta name="claude:viewport-fit-sides" content="cover">
<style>${css}</style>
<div id="root"></div>
<script type="module">${js.replace(/<\/script/gi, '<\\/script')}</script>`
writeFileSync(out, html)
console.log(`${out}: ${(html.length / 1024).toFixed(0)} KB, ${fonts} Schriftdateien eingebettet`)
