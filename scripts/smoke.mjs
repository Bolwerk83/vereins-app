// Smoke-Test: laedt den Build im echten Chromium und meldet Laufzeit-Fehler.
import { chromium } from "playwright-core";
import http from "http"; import fs from "fs"; import path from "path";
const dist = path.resolve("dist");
const mime = {".html":"text/html",".js":"text/javascript",".css":"text/css",".json":"application/json",".png":"image/png",".svg":"image/svg+xml"};
const srv = http.createServer((req,res)=>{
  let p = path.join(dist, req.url.split("?")[0]);
  if(!fs.existsSync(p)||fs.statSync(p).isDirectory()) p = path.join(dist,"index.html");
  res.setHeader("content-type", mime[path.extname(p)]||"application/octet-stream");
  res.end(fs.readFileSync(p));
}).listen(4173);
const browser = await chromium.launch({ executablePath:"/opt/pw-browsers/chromium-1194/chrome-linux/chrome", args:["--no-sandbox"] });
const page = await browser.newPage();
const errors = [];
page.on("pageerror", e=>errors.push("PAGEERROR: "+e.message));
page.on("console", m=>{ if(m.type()==="error" && !/net::|Failed to load resource|fetch/i.test(m.text())) errors.push("CONSOLE: "+m.text()); });
await page.goto("http://127.0.0.1:4173/", { waitUntil:"networkidle", timeout: 30000 }).catch(e=>errors.push("GOTO: "+e.message));
await page.waitForTimeout(3500);
const text = await page.evaluate(()=>document.body.innerText.slice(0,300));
const hasUI = (text||"").trim().length > 20;
console.log("RENDERED TEXT (Auszug):", JSON.stringify((text||"").slice(0,160)));
console.log("UI sichtbar:", hasUI);
if(errors.length){ console.log("FEHLER:"); errors.slice(0,10).forEach(e=>console.log(" -",e)); }
await browser.close(); srv.close();
process.exit(errors.length||!hasUI ? 1 : 0);
