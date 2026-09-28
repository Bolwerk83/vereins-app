import { chromium } from "playwright-core";
import http from "http"; import fs from "fs"; import path from "path";
const dist = path.resolve("dist");
const srv = http.createServer((req,res)=>{ let p=path.join(dist,req.url.split("?")[0]); if(!fs.existsSync(p)||fs.statSync(p).isDirectory()) p=path.join(dist,"index.html"); res.setHeader("content-type",{".html":"text/html",".js":"text/javascript",".css":"text/css"}[path.extname(p)]||"text/plain"); res.end(fs.readFileSync(p)); }).listen(4326);
const exe=process.env.PLAYWRIGHT_CHROMIUM||"/opt/pw-browsers/chromium-1194/chrome-linux/chrome";
const browser = await chromium.launch({ executablePath:exe, args:["--no-sandbox"] });
const page = await browser.newPage({ viewport:{ width:390, height:900 } });
const dismiss=async()=>{ for(let k=0;k<12;k++){ const done=await page.evaluate(()=>{
  const fx=[...document.querySelectorAll("div")].filter(d=>getComputedStyle(d).position==="fixed"&&d.querySelector("button")&&d.innerText.length>30);
  for(const f of fx){ const b=[...f.querySelectorAll("button")].find(x=>/geht|Los|Verstanden|Alles klar|Fertig|Jetzt nicht|Weiter →|Überspringen|Start/i.test(x.innerText)); if(b){ b.click(); return false; } }
  return true; }); await page.waitForTimeout(400); if(done) break; } };
await page.addInitScript(()=>{ localStorage.setItem("vereinsapp_config", JSON.stringify({url:"https://127.0.0.1:1/x", key:"test"})); localStorage.setItem("va_simple","0"); localStorage.setItem("va_tsimple","0"); });
await page.goto("http://127.0.0.1:4326/", { waitUntil:"networkidle" }); await page.waitForTimeout(2500);
await page.evaluate(()=>{ sessionStorage.setItem("vereinsapp_v12_session", JSON.stringify({role:"trainer",cid:"demo",tids:["demo_f1"],name:"Demo Trainer",id:"demo_tr1"})); });
await page.reload({waitUntil:"networkidle"}); await page.waitForTimeout(2600); await dismiss();
await page.evaluate(()=>{ const b=[...document.querySelectorAll("button")].find(x=>/Bin dabei/.test(x.innerText)); b&&b.click(); });
await page.waitForTimeout(1400);
await page.evaluate(()=>{ const d=JSON.parse(localStorage.getItem("vereinsapp_v14")||"null");
  const p=v=>String(v).padStart(2,"0"); const x=new Date(Date.now()+2*86400000);
  const ev=(d.events||[]).filter(e=>e.cid==="demo"&&e.tid==="demo_f1")[0];
  const kader=(d.playerProfiles||[]).filter(q=>q.mainTid==="demo_f1"&&!q.archived).map(q=>q.name);
  kader.slice(0,3).forEach((n,i)=>{ const pr=d.playerProfiles.find(z=>z.name===n); pr.intGrp=i<2?"g1":"g3"; });
  const ts=new Date().toISOString();
  Object.assign(ev,{ type:"training", date:`${x.getFullYear()}-${p(x.getMonth()+1)}-${p(x.getDate())}`, time:"17:30", endTime:"19:00",
    title:"Training", deadline:null, spielFest:null, present:{},
    votes:Object.fromEntries(kader.map(n=>[n,{val:"yes",ts,role:"player"}])) });
  localStorage.setItem("vereinsapp_v14", JSON.stringify(d)); });
await page.reload({waitUntil:"networkidle"}); await page.waitForTimeout(2800); await dismiss();
await page.evaluate(()=>{ const b=[...document.querySelectorAll("button")].find(x=>/^(Ansehen|✅ Anwesenheit)$/.test((x.innerText||"").trim())); b&&b.click(); });
await page.waitForTimeout(1800);
const out=await page.evaluate(()=>{
  const t=document.body.innerText; const i=t.indexOf("Anwesenheit abhaken");
  const liste=[...document.querySelectorAll("div")].filter(d=>(d.innerText||"").includes("Anwesenheit abhaken"));
  return { gefunden:liste.length, text:i<0?"(kein Abhaken)":t.slice(i,i+800) };
});
console.log("Container gefunden:", out.gefunden);
console.log(out.text);
await browser.close(); srv.close();
