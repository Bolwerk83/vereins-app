import React, { useState, useEffect } from "react";
import { useT } from "./i18n.jsx";
import { feat } from "./features.js";
import { trackEventGeo } from "./superadmin.jsx";
// Affiliate-Partner, IDs und Banner-Definitionen (reine Daten + Laufzeit-Override).
/* =============================================================
   AFFILIATE + WERBUNG
   -------------------------------------------------------------
   HIER deine Affiliate-IDs eintragen, sobald du dich bei den
   jeweiligen Programmen angemeldet hast. Solange ein Feld leer
   ist, läuft der Link auf den fallback-Wert ("vereinsapp") -
   damit verdienst du NICHTS, der Klick zählt aber als Test-Klick.
   ============================================================= */
export const AFFILIATE_IDS = {
  amazon: "",          // Amazon Partnernet: Tag wie "deinname-21"
  owayo:  "",          // Owayo Vereins-Partner-ID
  awin:   "",          // AWIN Publisher-ID (für 11teamsports, Decathlon, ...)
  hrs:    "",          // HRS Sports / Hotel-Affiliate-ID
  jako:   "",          // JAKO Direktpartner-Code (langfristig)
  trainerakademie: "", // Deutsche Trainerakademie etc.
  adsense: "",         // Google AdSense Publisher-ID, z. B. "ca-pub-1234567890123456"
};
// Affiliate-IDs zur Laufzeit aus den (global gespeicherten) Vereinsdaten
// übernehmen – im SuperAdmin pflegbar, ohne Code-Änderung.
export function applyAffiliateIds(o){ if(o&&typeof o==="object"){ for(const k of Object.keys(AFFILIATE_IDS)){ if(typeof o[k]==="string") AFFILIATE_IDS[k]=o[k]; } } }

/* AdSense-Konfiguration (Display-Werbung). Solange `client` leer
   ist, wird KEIN AdSense-Code geladen. Damit personalisierte Ads in
   der EU laufen können, braucht es zusätzlich einen Consent-Manager
   (Google Funding Choices oder externes CMP). Solange nicht
   konfiguriert: nur nicht-personalisierte Anzeigen. */
export const ADSENSE_CONFIG = {
  client: "",          // z. B. "ca-pub-1234567890123456"
  slots: {
    directoryTop: "",  // Slot-ID für oben auf der Vereins-Liste
    feedInline:   "",  // Slot-ID für Inline-Position
  },
};

/* Affiliate-Slots. weight = Reihenfolge wenn mehrere für einen
   Trigger konfiguriert wären; idKey verweist auf AFFILIATE_IDS. */
/* Affiliate-Slots, ausgerichtet auf die App-Trigger (Trikots, Spieler,
   Termine, Platz, Ergebnisse, Training) und brand-safe fuer den Jugend-/
   Familienkontext. Empfohlene, passende AWIN-Advertiser-Kategorien:
     - Retail: Sportartikel · Sportbekleidung · Schuhe · Kinderbekleidung
               · Foto- & Druckdienste (Trikot-/Bannerdruck, Mannschaftsfotos)
               · Gesundheit & Pflege
     - Reisen: Hotels & Uebernachtungen · Busse (Turniere/Auswaerts)
   BEWUSST MEIDEN (neben Kinderdaten): Erotik, Dating, Gluecksspiele/
   Gewinnspiele, Alkohol/Tabak, Finanzprodukte.
   AWIN-Deeplink-Muster: awin1.com/cread.php?awinmid=<ADVERTISER-mid>&
   awinaffid=<DEINE-AWIN-PUBLISHER-ID>&clickref=<trigger>. Wo noch keine
   verifizierte mid vorliegt, zeigt der Link direkt auf den Shop (funktioniert,
   aber ohne Provision) - spaeter durch awinDeep(<mid>,<trigger>) ersetzen.
   weight = Reihenfolge; idKey -> AFFILIATE_IDS (idKey:null = immer verfuegbar). */
const awinDeep = (mid, ref) => `https://www.awin1.com/cread.php?awinmid=${mid}&awinaffid=${AFFILIATE_IDS.awin||"0"}&clickref=${ref}`;
export const AFFILIATES = [
  // === TRIKOTS (Sportbekleidung + Druck) ===
  { id:"owayo-jerseys", trigger:"jerseys", weight:3, idKey:"owayo", icon:"O",
    text:"Trikots & Vereinskleidung drucken",
    sub:"Owayo · Vereinspreise ab 5 Trikots",
    network:"Owayo",
    url:(id)=>`https://www.owayo.de/?partner=${id||"vereinsapp"}` },
  { id:"11teamsports-jerseys", trigger:"jerseys", weight:2, idKey:"awin", icon:"11",
    text:"Vereins- & Bundesliga-Trikots",
    sub:"11teamsports · Vereinskonditionen",
    network:"AWIN · 11teamsports",
    url:()=>awinDeep(14589,"jerseys") },
  { id:"amazon-jerseys", trigger:"jerseys", weight:1, idKey:"amazon", icon:"A",
    text:"Trikots & Sportbekleidung",
    sub:"Amazon · große Auswahl",
    network:"Amazon Partnernet",
    url:(id)=>`https://www.amazon.de/s?k=fu%C3%9Fball+trikot+kinder&tag=${id||"vereinsapp-21"}` },

  // === SPIELER (Sportartikel / Kinder / Schuhe) ===
  { id:"11teamsports-players", trigger:"players", weight:3, idKey:"awin", icon:"11",
    text:"Fußballschuhe & Schienbeinschoner",
    sub:"11teamsports · schnelle Lieferung",
    network:"AWIN · 11teamsports",
    url:()=>awinDeep(14589,"players") },
  { id:"decathlon-players", trigger:"players", weight:2, idKey:null, icon:"D",
    text:"Ausrüstung & Schuhe für Kinder",
    sub:"Decathlon · günstig für die Jugend",
    network:"Decathlon", // AWIN-Advertiser (Sportartikel) - mid eintragen: awinDeep(<mid>,"players")
    url:()=>`https://www.decathlon.de/sport/fussball` },
  { id:"amazon-players", trigger:"players", weight:1, idKey:"amazon", icon:"A",
    text:"Sportausrüstung für Kinder",
    sub:"Amazon · alles fürs Training",
    network:"Amazon Partnernet",
    url:(id)=>`https://www.amazon.de/s?k=fu%C3%9Fball+kinder+ausr%C3%BCstung&tag=${id||"vereinsapp-21"}` },

  // === TERMINE (Reisen: Hotels & Busse für Turniere/Auswärts) ===
  { id:"hrs-events", trigger:"events", weight:3, idKey:"hrs", icon:"H",
    text:"Hotel fürs Turnierwochenende",
    sub:"HRS · Gruppen-/Vereinsraten",
    network:"HRS",
    url:(id)=>`https://www.hrs.de/?partnerid=${id||"vereinsapp"}` },
  { id:"flixbus-events", trigger:"events", weight:2, idKey:null, icon:"Bus",
    text:"Mannschaftsfahrt zum Turnier",
    sub:"FlixBus · günstige Gruppenfahrten",
    network:"FlixBus", // AWIN-Advertiser (Reisen/Busse) - mid eintragen: awinDeep(<mid>,"events")
    url:()=>`https://www.flixbus.de/` },
  { id:"amazon-events", trigger:"events", weight:1, idKey:"amazon", icon:"A",
    text:"Reisetaschen & Trinkflaschen",
    sub:"Amazon · für Auswärtsfahrten",
    network:"Amazon Partnernet",
    url:(id)=>`https://www.amazon.de/s?k=sporttasche+trinkflasche&tag=${id||"vereinsapp-21"}` },

  // === PLATZ (Trainings-Equipment / Sportartikel) ===
  { id:"decathlon-fields", trigger:"fields", weight:2, idKey:null, icon:"D",
    text:"Tore, Hütchen & Markierung",
    sub:"Decathlon · Trainingsmaterial",
    network:"Decathlon", // AWIN-Advertiser (Sportartikel) - mid eintragen
    url:()=>`https://www.decathlon.de/sport/fussball` },
  { id:"amazon-fields", trigger:"fields", weight:1, idKey:"amazon", icon:"A",
    text:"Trainings-Equipment",
    sub:"Hütchen, Mini-Tore, Markierungen",
    network:"Amazon Partnernet",
    url:(id)=>`https://www.amazon.de/s?k=fu%C3%9Fballtor+kinder+training&tag=${id||"vereinsapp-21"}` },

  // === ERGEBNISSE (Sportkamera/Analyse) ===
  { id:"amazon-cam", trigger:"results", weight:1, idKey:"amazon", icon:"A",
    text:"Sportkamera fürs Spiel",
    sub:"Automatisches Aufzeichnen · ab 200 €",
    network:"Amazon Partnernet",
    url:(id)=>`https://www.amazon.de/s?k=sportkamera+fu%C3%9Fball&tag=${id||"vereinsapp-21"}` },

  // === TRAINING (Trainer-Weiterbildung + Fachliteratur) ===
  { id:"trainerakademie", trigger:"training", weight:2, idKey:"trainerakademie", icon:"T",
    text:"Trainer-Lizenz online",
    sub:"DFB-konforme Weiterbildung",
    network:"Trainerakademie",
    url:(id)=>`https://www.deutsche-trainerakademie.de/?ref=${id||"vereinsapp"}` },
  { id:"amazon-training", trigger:"training", weight:1, idKey:"amazon", icon:"A",
    text:"Trainingsbücher & Übungssammlungen",
    sub:"Amazon · Jugendfußball",
    network:"Amazon Partnernet",
    url:(id)=>`https://www.amazon.de/s?k=jugendfu%C3%9Fball+training+buch&tag=${id||"vereinsapp-21"}` },

  // settings (Operatives)
  // === ELTERN (Kinder-Ausruestung - groesster Traffic in der Eltern-Ansicht) ===
  { id:"11teamsports-parents", trigger:"parents", weight:3, idKey:"awin", icon:"11",
    text:"Kinder-Fußballschuhe & Schienbeinschoner",
    sub:"11teamsports · Größen für jede Jugend · schnelle Lieferung",
    network:"AWIN",
    url:(id)=>`https://www.awin1.com/cread.php?awinmid=15286&awinaffid=${id||"vereinsapp"}&ued=${encodeURIComponent("https://www.11teamsports.com/de-de/kinder")}` },
  { id:"decathlon-parents", trigger:"parents", weight:2, idKey:"awin", icon:"D",
    text:"Fußball-Ausrüstung für Kinder",
    sub:"Decathlon · Bälle, Schoner, Trainingskleidung",
    network:"AWIN",
    url:(id)=>`https://www.awin1.com/cread.php?awinmid=14636&awinaffid=${id||"vereinsapp"}&ued=${encodeURIComponent("https://www.decathlon.de/browse/c0-alle-sportarten/c1-fussball/c3-kinder/_/N-175dnf5")}` },
  { id:"amazon-parents", trigger:"parents", weight:1, idKey:"amazon", icon:"A",
    text:"Trinkflaschen, Taschen & Kleinkram",
    sub:"Amazon · alles für die Sporttasche",
    network:"Amazon",
    url:(id)=>`https://www.amazon.de/s?k=kinder+fussball+ausruestung&tag=${id||"vereinsapp-21"}` },

  { id:"supabase", trigger:"settings", weight:1, idKey:null, icon:"S",
    text:"Eigene Cloud-Datenbank",
    sub:"Supabase · kostenloser Vereins-Start",
    network:"Direkt",
    url:()=>`https://supabase.com/?ref=vereinsapp` },
];

export function pickAffiliate(trigger) {
  const list = AFFILIATES.filter(a=>a.trigger===trigger);
  if (!list.length) return null;
  // Sortierung: konfigurierte IDs zuerst, dann nach weight
  list.sort((a,b)=>{
    const aOk = a.idKey ? !!AFFILIATE_IDS[a.idKey] : 1;
    const bOk = b.idKey ? !!AFFILIATE_IDS[b.idKey] : 1;
    if (aOk !== bOk) return bOk - aOk;
    return (b.weight||0) - (a.weight||0);
  });
  return list[0];
}
export function affiliateUrl(aff) {
  if (!aff) return "#";
  const id = aff.idKey ? AFFILIATE_IDS[aff.idKey] : "";
  try { return aff.url(id); } catch { return "#"; }
}
export function AffiliateBanner({ trigger, style={}, slim=false }) {
  const { tr } = useT();
  const [dismissed, setDismissed] = useState(false);
  const aff = pickAffiliate(trigger);
  if (!aff || dismissed) return null;
  const onClick = () => {
    try { trackEventGeo&&trackEventGeo("affiliate_click", aff.id); } catch {}
    window.open(affiliateUrl(aff), "_blank", "noopener,noreferrer");
  };
  if (slim) return (
    <div style={{display:"flex",alignItems:"center",gap:8,background:"#f8fafc",border:"1px solid #eef2f7",borderRadius:10,padding:"7px 11px",...style}}>
      <span style={{fontSize:8.5,fontWeight:800,color:"#64748b",letterSpacing:.5,flexShrink:0}}>{tr("adLabel")}</span>
      <span onClick={onClick} style={{flex:1,minWidth:0,fontSize:12,fontWeight:600,color:"#475569",cursor:"pointer",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{aff.text} <span style={{color:"#64748b"}}>· {tr("adMark")}</span></span>
      <button onClick={()=>setDismissed(true)} aria-label="Werbung ausblenden" style={{width:20,height:20,borderRadius:5,background:"none",border:"none",color:"#64748b",cursor:"pointer",fontSize:13,fontWeight:800,flexShrink:0}}>×</button>
    </div>
  );
  return (
    <div style={{background:"#f8fafc",borderRadius:13,padding:"12px 14px",border:"1px solid #e2e8f0",
      display:"flex",alignItems:"center",gap:12,marginBottom:14,...style}}>
      <div style={{width:38,height:38,borderRadius:10,background:"#e2e8f0",display:"flex",
        alignItems:"center",justifyContent:"center",fontWeight:900,fontSize:14,color:"#64748b",flexShrink:0}}>
        {aff.icon}
      </div>
      <div style={{flex:1,cursor:"pointer"}} onClick={onClick}>
        <div style={{fontSize:9,fontWeight:800,color:"#64748b",letterSpacing:.5,marginBottom:2}}>
          {tr("adLabel")}{aff.network?" · "+aff.network:""}
        </div>
        <div style={{fontWeight:700,fontSize:13,color:"#334155"}}>{aff.text}</div>
        <div style={{fontSize:11,color:"#64748b",marginTop:2}}>
          {aff.sub} · <span title="Provisions-Link">Affiliate-Link*</span>
        </div>
      </div>
      <button onClick={()=>setDismissed(true)} aria-label="Werbung ausblenden"
        style={{width:24,height:24,borderRadius:6,background:"none",border:"none",color:"#64748b",
          cursor:"pointer",fontSize:14,fontWeight:800,flexShrink:0}}>×</button>
    </div>
  );
}
export function AdSenseSlot({ slot, format="auto", style={} }) {
  const { tr } = useT();
  const client = ADSENSE_CONFIG.client;
  const slotId = ADSENSE_CONFIG.slots?.[slot];
  useEffect(() => {
    if (!client || !slotId) return;
    if (!window.__vaAdsenseLoaded) {
      try {
        window.adsbygoogle = window.adsbygoogle || [];
        // Nicht-personalisierte Ads bis ein Consent-Manager da ist
        window.adsbygoogle.requestNonPersonalizedAds = 1;
        const s = document.createElement("script");
        s.src = `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${client}`;
        s.crossOrigin = "anonymous";
        s.async = true;
        document.head.appendChild(s);
        window.__vaAdsenseLoaded = true;
      } catch {}
    }
    try { (window.adsbygoogle = window.adsbygoogle || []).push({}); } catch {}
  }, [client, slotId]);
  if (!client || !slotId) return null;
  return (
    <div style={{margin:"12px 0",textAlign:"center",...style}}>
      <div style={{fontSize:9,fontWeight:800,color:"#64748b",letterSpacing:.5,marginBottom:4}}>{tr("adLabel")}</div>
      <ins className="adsbygoogle"
        style={{display:"block",minHeight:90}}
        data-ad-client={client}
        data-ad-slot={slotId}
        data-ad-format={format}
        data-full-width-responsive="true"/>
    </div>
  );
}
