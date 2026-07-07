// ----------------------------------------------------------------
// DFB-Fachlogik: Altersklassen je Saison (dynamisch berechnet, Stichtag
// 1. Juli; Maedchen +2 Jahre ueber eligibleCats/playerFitType) sowie die
// offiziellen Spielformen/Feldgroessen je Jugend.
// ----------------------------------------------------------------
// DFB-Spielformen & Platzgroessen je Altersklasse (Orientierungswerte nach der
// Kinderfussball-Reform; Landes-/Kreisverbaende koennen abweichen).
export const DFB_FORMATS=[
  {age:"Bambini / G-Jugend (U6–U7)", form:"2:2 und 3:3", players:"2–3 + viele Wechsel", field:"ca. 15×20 bis 20×25 m", goals:"Minitore (ca. 1–2 m)", ball:"Größe 3", time:"kurze Spiele, häufig wechseln",
    focus:"Ballgewöhnung, Dribbeln, zum Tor laufen",
    rules:"Kein Abseits · keine Tabelle/kein Ergebnisdienst · oft ohne feste Torhüter · Einkicken/Eindribbeln statt Einwurf",
    fair:"Schiedsrichterloses Spiel – Kinder klären Strittiges selbst, Trainer/Eltern begleiten nur. Jedes Kind spielt etwa gleich viel. Festival-Format: mehrere Mini-Felder parallel, Funino mit Auf-/Abstieg."},
  {age:"F-Jugend (U8–U9)", form:"3:3 (Funino) & 5:5", players:"3 bzw. 5", field:"Funino ca. 25×35 m · 5:5 ca. 30×40 m", goals:"Minitore bzw. kleine Jugendtore", ball:"Größe 3/4", time:"mehrere kurze Spielzeiten",
    focus:"Dribbeln & 1-gegen-1, Anbieten/Freilaufen, viele Ballkontakte",
    rules:"Kein Abseits · keine Tabelle · Einkicken/Eindribbeln · Abstoß flach",
    fair:"Möglichst ohne Schiri; faire Einsatzzeiten für alle. Funino-Festivals fördern Entscheidungen & viele Torabschlüsse."},
  {age:"E-Jugend (U10–U11)", form:"7:7", players:"7", field:"ca. 35×55 m", goals:"5-m-Jugendtore", ball:"Größe 4", time:"2×25–30 min",
    focus:"Passspiel, Raum erkennen, Umschalten, erste Mannschaftstaktik",
    rules:"Abseits abgeschwächt/keins (verbandsabhängig) · Einwurf · Rückpass zum Torwart aufnehmbar · fortlaufendes Wechseln",
    fair:"Jedes Kind sollte mind. die Hälfte spielen. Erste Spielbegleiter/Schiris."},
  {age:"D-Jugend (U12–U13)", form:"9:9", players:"9", field:"ca. 50×70 m", goals:"2×5 m", ball:"Größe 4", time:"2×30 min",
    focus:"Spielaufbau, Breite/Tiefe, Verschieben, Standards",
    rules:"Abseits (verbandsabhängig) · normale Regeln, Rückpassregel greift zunehmend",
    fair:"Faire Einsatzzeiten weiterhin wichtig; Leistungsgedanke langsam steigend."},
  {age:"C-Jugend (U14–U15)", form:"11:11", players:"11", field:"Großfeld (bis ca. 68×105 m)", goals:"7,32×2,44 m", ball:"Größe 5", time:"2×35 min",
    focus:"Mannschaftstaktik, Positionsspiel, Pressing/Umschalten",
    rules:"Volle Wettkampfregeln (Abseits, Rückpass, Einwurf), Tabelle/Wettbewerb",
    fair:"Leistungsorientierter – aber Ausbildung vor Ergebnis."},
  {age:"B-/A-Jugend (U16–U19)", form:"11:11", players:"11", field:"Großfeld", goals:"7,32×2,44 m", ball:"Größe 5", time:"2×40 / 2×45 min",
    focus:"komplexe Spielsysteme, Athletik, Spielintelligenz",
    rules:"Volle Regeln; A-Jugend teils nach Erwachsenenregeln",
    fair:"Wettkampf & individuelle Förderung Richtung Aktiven-Bereich."},
];
// Passende DFB-Spielform zur Mannschafts-Kategorie ("F-Jugend", "Bambini", …) finden.
// Liefert null, wenn keine (Jugend-)Zuordnung moeglich ist -> dann werden alle Formate gezeigt.
export const dfbFormatForCat = (cat) => {
  if(!cat) return null;
  const c=String(cat).toLowerCase();
  if(c.includes("bambini")) return DFB_FORMATS[0];
  const m=c.match(/\b([a-g])[-\s]?jugend\b/);
  if(!m) return null;
  const idx={g:0,f:1,e:2,d:3,c:4,b:5,a:5}[m[1]];
  return idx!=null ? DFB_FORMATS[idx] : null;
};

// Fußball-Saison beginnt am 1. Juli. Jahrgänge je Altersklasse werden aus der
// laufenden Saison berechnet (2 Jahrgänge je Jugend, DFB-Schema) – so stimmen sie
// jede Saison automatisch. Anker: F-Jugend (U8/U9) = Saisonstart-8 / -7.
// Beispiel Saison 2026/27: F = 2018/2019, E = 2016/2017, … (Mädchen zusätzlich +2 Jahre
// über die eligibleCats/playerFitType-Logik).
export const _fbSeasonStart = (()=>{ try{ const d=new Date(); return d.getMonth()>=6 ? d.getFullYear() : d.getFullYear()-1; }catch{ return 2026; } })();
export const _ySpan = off => [ _fbSeasonStart-off, _fbSeasonStart-off+1 ];
export const CAT_YEARS = {
  "Bambinis": [_fbSeasonStart-4,_fbSeasonStart-3,_fbSeasonStart-2],  // U6 und jünger
  "G-Jugend": _ySpan(6),   // U6/U7
  "F-Jugend": _ySpan(8),   // U8/U9
  "E-Jugend": _ySpan(10),  // U10/U11
  "D-Jugend": _ySpan(12),  // U12/U13
  "C-Jugend": _ySpan(14),  // U14/U15
  "B-Jugend": _ySpan(16),  // U16/U17
  "A-Jugend": _ySpan(18),  // U18/U19
  // Erwachsene / weitere Mannschaften: keine festen Jahrgänge (manuelle Zuordnung).
  "Senioren": [],"Alt-Herren": [],"Damen": [],"Mädchen": [],};
// Anzeige-String der aktuellen Jahrgänge einer Kategorie (z. B. "2018/2019").
export const catYearsStr = (cat) => { const y=CAT_YEARS[cat]; return (y&&y.length)? (y.length<=2? y.join("/") : `${Math.min(...y)}–${Math.max(...y)}`) : ""; };
export const CAT_ORDER = ["Bambinis","G-Jugend","F-Jugend","E-Jugend","D-Jugend","C-Jugend","B-Jugend","A-Jugend","Senioren","Alt-Herren","Damen","Mädchen"];

export function eligibleCats(by,gender) {
  const boost = gender === "w" ? 2 : 0;
  return Object.entries(CAT_YEARS)
    .filter(([,years]) => years.includes(by) || years.includes(by + boost))
    .map(([cat]) => cat);
}
export function playerFitType(player,team) {
  const cat = team.cat || team.name;
  const years = CAT_YEARS[cat];
  if (!years) return false;
  const by = player.by || 2014;
  const gender = player.gender || "m";
  if (years.includes(by)) return "normal";
  if (gender === "w" && years.includes(by + 2)) return "normal";
  const naturalCat = Object.entries(CAT_YEARS).find(([,yrs])=>yrs.includes(by))?.[0];
  const naturalIdx = CAT_ORDER.indexOf(naturalCat);
  const teamIdx    = CAT_ORDER.indexOf(cat);
  if (naturalIdx < 0 || teamIdx < 0) return false;
  const jump = teamIdx - naturalIdx;
  if (jump <= 0) return false; // can't play down (that's opt-in)

  if (gender === "m" && jump <= 2) return "pullup";   // boys: max 2 categories up
  if (gender === "w" && jump <= 4) return "girlpullup"; // girls: max 4 categories up (incl. Maedchen-Regel)
  return false;
}
export function playerFitsTeam(player,team) {
  return !!playerFitType(player,team);
}
export function fitLabel(fitType) {
  if (fitType === "normal")     return null; // no label needed
  if (fitType === "pullup")     return {text:"* Hochgeholt",col:"#d97706",bg:"#fef3c7"};
  if (fitType === "girlpullup") return {text:"* Hochgeholt (W)",col:"#7c3aed",bg:"#ede9fe"};
  return null;
}
