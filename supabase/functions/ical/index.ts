// Supabase Edge Function: ical
// Kalender-Abo (iCal/ICS) fuer die Termine eines Teams – Eltern abonnieren die
// URL einmal im Handy-Kalender, danach erscheinen alle Termine (inkl.
// Aenderungen) automatisch.
//
//   1. Deploy:  supabase functions deploy ical --no-verify-jwt
//   2. Abo-URL (erzeugt die App im Eltern-Profil):
//        https://<projekt>.supabase.co/functions/v1/ical?club=<cid>&team=<tid>&token=<team.icalToken>
//      Der Token wird von der App je Team generiert und in den Vereinsdaten
//      gespeichert – ohne gueltigen Token gibt es keine Daten.
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_KEY  = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const SK           = Deno.env.get("APP_DATA_KEY") || "vereinsapp_v14";
const admin = createClient(SUPABASE_URL, SERVICE_KEY, { auth: { persistSession: false } });

const TYPE_LABEL: Record<string,string> = {
  training:"Training", heimspiel:"Heimspiel", auswarts:"Auswärtsspiel",
  freundschaft:"Freundschaftsspiel", turnier:"Turnier", event:"Sondertermin",
};
const esc = (s:string)=>String(s||"").replace(/\\/g,"\\\\").replace(/;/g,"\\;").replace(/,/g,"\\,").replace(/\n/g,"\\n");
const dt = (date:string, time?:string)=>{
  const [y,m,d]=date.split("-"); const [hh,mm]=(time||"09:00").split(":");
  return `${y}${m}${d}T${hh.padStart(2,"0")}${mm.padStart(2,"0")}00`;
};

Deno.serve(async (req) => {
  const url = new URL(req.url);
  const club = (url.searchParams.get("club")||"").trim();
  const team = (url.searchParams.get("team")||"").trim();
  const token = (url.searchParams.get("token")||"").trim();
  if(!club||!team||!token) return new Response("missing club/team/token", { status: 400 });

  const { data: rows, error } = await admin.from("app_data").select("value").eq("key", `${SK}__club_${club}`).limit(1);
  if(error) return new Response("db error", { status: 500 });
  const value: any = rows?.[0]?.value || {};
  const tm = (value.teams||[]).find((t:any)=>t.id===team);
  if(!tm || !tm.icalToken || tm.icalToken!==token) return new Response("forbidden", { status: 403 });

  const events = (value.events||[]).filter((e:any)=>e.tid===team && e.date);
  const lines = [
    "BEGIN:VCALENDAR","VERSION:2.0","PRODID:-//Vereins-App//DE","CALSCALE:GREGORIAN",
    `X-WR-CALNAME:${esc(tm.name||"Team")} – Termine`,
    "X-WR-TIMEZONE:Europe/Berlin",
  ];
  for(const e of events){
    const label = TYPE_LABEL[e.type] || "Termin";
    const title = (e.title && e.title.trim()) || label;
    const loc = [e.loc, e.venueAddr].filter(Boolean).join(", ");
    lines.push("BEGIN:VEVENT");
    lines.push(`UID:${e.id}@vereins-app`);
    lines.push(`DTSTAMP:${dt(e.date, e.time)}`);
    if(e.time){
      lines.push(`DTSTART;TZID=Europe/Berlin:${dt(e.date, e.time)}`);
      lines.push(`DTEND;TZID=Europe/Berlin:${dt(e.date, e.endTime || (Number(e.time.split(":")[0])+2).toString().padStart(2,"0")+":"+e.time.split(":")[1])}`);
    } else {
      lines.push(`DTSTART;VALUE=DATE:${e.date.replace(/-/g,"")}`);
    }
    lines.push(`SUMMARY:${esc(title)}${title===label?"":` (${label})`}`);
    if(loc) lines.push(`LOCATION:${esc(loc)}`);
    if(e.note) lines.push(`DESCRIPTION:${esc(e.note)}`);
    lines.push("END:VEVENT");
  }
  lines.push("END:VCALENDAR");
  return new Response(lines.join("\r\n"), { headers: {
    "content-type": "text/calendar; charset=utf-8",
    "content-disposition": `attachment; filename="termine.ics"`,
    "cache-control": "max-age=300",
  }});
});
