// =========================================================================
//  STANDALONE-DEMO — packt den Vite-Build (dist/) in EINE HTML-Datei.
//  JS wird base64-kodiert und per Blob-Modulimport geladen (UTF-8-sicher,
//  keine </script>-Probleme), CSS inline. Ergebnis läuft ohne Server/Install
//  direkt im Browser (file://) mit Mock-Daten im Demo-Modus.
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
const js = readFileSync(`${dist}/assets/${assets.find((f) => f.endsWith('.js'))}`)
const css = readFileSync(`${dist}/assets/${assets.find((f) => f.endsWith('.css'))}`, 'utf8')
const b64 = js.toString('base64')

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
<script>
${boot}
var bin = atob("${b64}");
var bytes = new Uint8Array(bin.length); for (var i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
var code = new TextDecoder('utf-8').decode(bytes);
var url = URL.createObjectURL(new Blob([code], { type: 'text/javascript' }));
import(url).catch(function (e) { document.getElementById('root').innerHTML = '<pre style=\\'padding:20px;color:#b00\\'>Fehler beim Laden: ' + e + '</pre>'; });
</script>
</body>
</html>`

writeFileSync('enterprise-report-demo.html', html)
console.log('✓ enterprise-report-demo.html erstellt (' + (html.length / 1024 / 1024).toFixed(2) + ' MB) — im Browser öffnen.')
