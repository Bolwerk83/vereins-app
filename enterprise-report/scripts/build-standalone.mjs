// =========================================================================
//  STANDALONE-DEMO — packt den Vite-Build (dist/) in EINE HTML-Datei.
//  JS wird direkt als klassisches <script> inline eingebettet, CSS inline.
//  Ergebnis läuft ohne Server/Install direkt im Browser (file://, auch auf
//  dem Handy) mit Mock-Daten im Demo-Modus.
//
//  Wichtig (Handy-Fix): KEIN Blob-URL + dynamisches import() mehr. Mobile
//  Safari blockiert/unterstützt dynamic import() von blob:-URLs (opaque
//  origin) nicht zuverlässig → weiße Seite. Der Vite-Bundle ist ein reines
//  IIFE (kein export/import.meta/dynamic import), also lässt es sich gefahrlos
//  als normales Script direkt einbetten. UTF-8 sichert <meta charset>, und
//  evtl. "</script>" im Code wird defensiv escaped.
//
//  Aufruf:  npm run build:standalone   (baut zuerst dist/ mit --base ./)
//  Ausgabe: enterprise-report-demo.html  (gitignored)
// =========================================================================
import { readFileSync, writeFileSync, readdirSync, existsSync } from 'fs'

const dist = 'dist'
if (!existsSync(dist + '/index.html')) {
  console.error('dist/ fehlt — zuerst "vite build --base ./" ausführen (npm run build:standalone macht das automatisch).')
  process.exit(1)
}
const assets = readdirSync(dist + '/assets')
const js = readFileSync(`${dist}/assets/${assets.find((f) => f.endsWith('.js'))}`, 'utf8')
const css = readFileSync(`${dist}/assets/${assets.find((f) => f.endsWith('.css'))}`, 'utf8')
// Nur das schließende Script-Tag im JS-Text neutralisieren, damit das Inline-
// Script nicht vorzeitig endet. (</script> als <\/script>; auch <!-- absichern.)
const jsSafe = js.replace(/<\/script>/gi, '<\\/script>').replace(/<!--/g, '<\\!--')

// Demo-Modus: Wizard/Overlays überspringen, direkt in die Detailberichte starten.
const boot = `try{
  localStorage.setItem('er_setup_done','1');
  localStorage.setItem('er_hilfe_gesehen','1');
  localStorage.setItem('er_demo_view','detailberichte');
  localStorage.setItem('er_onboarding_gesehen',JSON.stringify(['gf','controlling','bereichsleiter','mitarbeiter','admin','vertrieb','einkauf','finanzen']));
}catch(e){}`

const html = `<!doctype html>
<html lang="de">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<title>Enterprise Report · Demo (Standalone)</title>
<link rel="preconnect" href="https://fonts.googleapis.com" />
<link href="https://fonts.googleapis.com/css2?family=Archivo:wght@400;500;600;700&family=IBM+Plex+Mono:wght@400;500;600&display=swap" rel="stylesheet" />
<style>${css}</style>
</head>
<body>
<div id="root"></div>
<script>${boot}
window.addEventListener('error', function (e) {
  var r = document.getElementById('root');
  if (r && !r.firstChild) r.innerHTML = '<pre style="padding:20px;color:#b00;white-space:pre-wrap">Fehler beim Laden: ' + (e.message || e.error || e) + '</pre>';
});</script>
<script>
${jsSafe}
</script>
</body>
</html>`

writeFileSync('enterprise-report-demo.html', html)
console.log('✓ enterprise-report-demo.html erstellt (' + (html.length / 1024 / 1024).toFixed(2) + ' MB) — im Browser öffnen (Desktop & Handy).')
