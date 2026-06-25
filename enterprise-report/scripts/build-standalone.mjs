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

// localStorage-Schutz: in sandboxed Vorschauen (z. B. In-App-Viewer) kann der
// Zugriff eine SecurityException werfen → die App würde beim Start crashen.
// Wirft er, ersetzen wir localStorage durch einen In-Memory-Ersatz.
const lsShim = `try{var __t='__ls_test__';window.localStorage.setItem(__t,'1');window.localStorage.removeItem(__t);}catch(e){
  var __m={};var __ls={getItem:function(k){return Object.prototype.hasOwnProperty.call(__m,k)?__m[k]:null},setItem:function(k,v){__m[k]=String(v)},removeItem:function(k){delete __m[k]},clear:function(){__m={}},key:function(i){return Object.keys(__m)[i]||null}};
  Object.defineProperty(__ls,'length',{get:function(){return Object.keys(__m).length}});
  try{Object.defineProperty(window,'localStorage',{configurable:true,value:__ls});}catch(_){}
}`

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
<div id="root">
  <div id="er-fallback" style="max-width:560px;margin:14vh auto 0;padding:0 24px;font-family:system-ui,-apple-system,sans-serif;color:#334155;line-height:1.55;text-align:center">
    <div style="font-size:42px">📊</div>
    <h2 style="margin:8px 0 4px;color:#0f172a">Enterprise Report — Demo</h2>
    <p style="margin:4px 0">Anwendung wird geladen …</p>
    <p style="margin:14px 0 0;font-size:14px;color:#64748b">Bleibt diese Seite weiß, führt die aktuelle <b>Vorschau kein JavaScript</b> aus.
    Bitte die Datei <b>herunterladen</b> (Symbol ↓ oben) und in <b>Safari</b> oder <b>Chrome</b> öffnen.</p>
  </div>
</div>
<script>${lsShim}
${boot}
window.addEventListener('error', function (e) {
  var r = document.getElementById('root'); var f = document.getElementById('er-fallback');
  if (r && (!r.firstChild || f)) r.innerHTML = '<pre style="padding:20px;color:#b00;white-space:pre-wrap;font:13px/1.5 monospace">Fehler beim Laden:\\n' + (e.message || e.error || e) + '</pre>';
});</script>
<script>
${jsSafe}
</script>
</body>
</html>`

writeFileSync('enterprise-report-demo.html', html)
console.log('✓ enterprise-report-demo.html erstellt (' + (html.length / 1024 / 1024).toFixed(2) + ' MB) — im Browser öffnen (Desktop & Handy).')
