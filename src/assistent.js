// ----------------------------------------------------------------
// Wissensbasis von "Co", dem Co-Trainer. Reine Daten + Erkennung, keine
// Oberfläche. Bewusst offline: die Antworten kommen aus dieser Datei und
// aus der Übungssammlung (drills.js) - kein fremder Dienst, keine Kosten.
// Später lässt sich hier eine echte KI dazuschalten, ohne dass die
// Oberfläche etwas davon merkt (antwortAuf bleibt die eine Schnittstelle).
// ----------------------------------------------------------------

// Ein Thema bündelt: woran man es erkennt, was der Trainer wissen sollte,
// welcher Trainings-Schwerpunkt dazugehört und welche Aufgabe sich lohnt.
// "spruch" ist der emotionale Einstieg - erst anpacken, dann Substanz.
// Bewusst kurz: Wer bei jedem Satz brüllt, dem hört nach zwei Wochen
// niemand mehr zu.
export const THEMEN = [
  {
    id:"zusammenspiel", titel:"Zusammenspiel & Passspiel", icon:"🤝", focus:"spielform",
    worte:["zusammenspiel","zusammen spielen","zusammenspielen","passspiel","pässe","paesse","pass","passen","kombination","kombinieren","miteinander","abspiel","anspiel","mannschaftsspiel","teamplay","abstimmung","füreinander","einzelkämpfer","alleine","eigensinnig"],
    spruch:"Ah, das Thema! Und ich sag dir gleich was: Deine Jungs und Mädels sind keine Egoisten.",
    kern:"Sie spielen nicht ab, weil sie den Mitspieler nicht sehen – nicht, weil sie nicht wollen. Das Ziel ist also nicht „spiel ab!“, sondern „schau vor dem Ball hin“. Das ist ein Riesenunterschied.",
    tipps:[
      "Vor dem Zuspiel schauen: Lass sie vor der Ballannahme über die Schulter blicken. Ruf im Training nur ein Wort: „Schulter!“ – das genügt.",
      "Spielt kleine Felder (4 gegen 4) mit der Regel „Tor zählt doppelt nach drei Pässen“. Das erzwingt Zusammenspiel, ohne dass ihr es fordern müsst.",
      "Anbieten üben, nicht nur Passen: Wer keinen Ball hat, bewegt sich aus dem Deckungsschatten. Das ist die eigentliche Ursache, wenn niemand anspielbar ist.",
      "Lobt den Pass, nicht das Tor. Kinder machen das, wofür sie Anerkennung bekommen – drei Wochen konsequent, dann kippt es.",
      "Verbietet nichts. „Nicht dribbeln“ nimmt den Mut. Baut stattdessen Situationen, in denen Abspielen leichter zum Erfolg führt.",
    ],
    aufgabe:{ titel:"Zusammenspiel: kleine Spielformen", takt:"woche", anzahl:2, wochen:6,
      text:"2× pro Woche eine Spielform mit Pass-Regel (4 gegen 4, Tor zählt doppelt nach drei Pässen) – sechs Wochen am Stück." },
  },
  {
    id:"abschluss", titel:"Torabschluss", icon:"🥅", focus:"torschuss",
    worte:["abschluss","tore","torschuss","schuss","schiessen","schießen","treffer","chancenverwertung","vergeben","abschlussschwäche","vor dem tor","kaltschnäuzig"],
    spruch:"Tore! Darum geht\u2019s doch. Aber pass auf, das Problem liegt selten da, wo alle gucken.",
    kern:"Vor dem Tor entscheidet nicht die Schusstechnik, sondern die Ruhe. Wer im Training nie unter Druck abschließt, hat sie im Spiel auch nicht.",
    tipps:[
      "Immer mit Torwart abschließen lassen. Schüsse ins leere Tor trainieren ein Gefühl, das es im Spiel nicht gibt.",
      "Kurze Wege: Abschluss nach 2–3 Sekunden Handlung, nicht nach langem Aufbau. So sieht es im Spiel auch aus.",
      "Zweiter Ball: Nach jedem Schuss sofort nachsetzen lassen. Die Hälfte der Kindertore fällt aus Abprallern.",
      "Nicht auf Technik korrigieren, solange das Kind trifft. Erst Selbstvertrauen, dann Feinschliff.",
      "Jedes Kind im Training mindestens 15 Abschlüsse – zählt es einmal mit, meist sind es viel weniger.",
    ],
    aufgabe:{ titel:"Abschluss-Serie", takt:"woche", anzahl:1, wochen:8,
      text:"1× pro Woche ein Abschlussblock mit Torwart, mindestens 15 Abschlüsse je Kind – acht Wochen." },
  },
  {
    id:"technik", titel:"Technik & Dribbling", icon:"⚡", focus:"technik",
    worte:["technik","dribbling","dribbeln","ballführung","ballkontrolle","ball halten","eins gegen eins","1 gegen 1","zweikampf offensiv","finten","trick","tricks","beweglichkeit am ball"],
    spruch:"Technik ist keine Begabung, Technik sind Wiederholungen. Tausende davon.",
    kern:"Ballgefühl entsteht mit eigenem Ball am Fuß – nicht in der Warteschlange. Faustregel: jedes Kind einen Ball, niemand steht länger als zehn Sekunden.",
    tipps:[
      "Jedes Kind einen Ball. Übungen mit einem Ball für acht Kinder sind vergeudete Trainingszeit.",
      "Dribbel-Aufgaben mit Kopfarbeit verbinden: auf Zuruf Richtung wechseln, Farbe nennen, Hütchen umkurven. Das fordert Blick heben und Ballführung zugleich.",
      "Tricks kurz und oft: 3 Minuten am Anfang jeder Einheit, immer derselbe Trick für zwei Wochen. Dann sitzt er.",
      "Im 1 gegen 1 Tempo belohnen, nicht Schönheit. Ein einfacher Ausfallschritt mit Tempo schlägt jeden perfekten Übersteiger im Stand.",
      "Lasst sie scheitern. Wer den Trick nur im Training ohne Gegner zeigt, hat ihn nicht gelernt.",
    ],
    aufgabe:{ titel:"Trick der Woche", takt:"woche", anzahl:1, wochen:10,
      text:"Jede Woche ein Trick, 3 Minuten zu Beginn jeder Einheit – zehn Wochen, also zehn Tricks." },
  },
  {
    id:"verteidigen", titel:"Verteidigen & Zweikampf", icon:"🛡", focus:"taktik",
    worte:["verteidigen","abwehr","defensive","zweikampf","gegentore","hinten","tore bekommen","kassiert","pressing","stören","zweikämpfe"],
    spruch:"Verteidigen ist Kopfsache, nicht Kampfsache. Ehrlich.",
    kern:"Kinder verteidigen mit dem Fuß statt mit dem Körper. Zuerst Stellung und Abstand, dann erst die Grätsche – die meistens gar nicht nötig ist.",
    tipps:[
      "Abstand statt Attacke: eine Armlänge, seitlich stehen, den Gegner zur Außenlinie lenken. Das ist die halbe Miete.",
      "Nicht hinterherlaufen lassen: Wer einmal überlaufen wurde, soll den Weg abkürzen statt den Rücken zu zeigen.",
      "Gegentore gemeinsam anschauen, nie einzeln aufarbeiten. Ein Gegentor hat immer drei Ursachen, nicht eine.",
      "Im Training Überzahl-Unterzahl spielen (3 gegen 2). Unterzahl zwingt zum Verschieben – Verteidigen ohne Vortrag.",
      "Torwart mitverteidigen lassen: mitgehen, laut sein. Das nimmt der Abwehr enorm viel ab.",
    ],
    aufgabe:{ titel:"Unterzahl-Formen", takt:"woche", anzahl:1, wochen:6,
      text:"1× pro Woche eine Über-/Unterzahlform (3 gegen 2, 4 gegen 3) – sechs Wochen." },
  },
  {
    id:"kondition", titel:"Kondition & Athletik", icon:"🏃", focus:"kondition",
    worte:["kondition","ausdauer","kraft","athletik","schnelligkeit","fitness","müde","puste","laufen","koordination"],
    spruch:"Runden um den Platz? Bitte nicht. Das hat noch keinem Kind Spaß gemacht.",
    kern:"Im Kinderfußball wird Ausdauer nicht gelaufen, sondern gespielt. Kondition kommt aus vielen kleinen Spielen, nicht aus Dauerläufen.",
    tipps:[
      "Kondition kommt aus kleinen Spielformen mit vielen Wiederholungen – nicht aus Dauerläufen.",
      "Koordination vor Kraft: Hüpfen, Landen, Richtungswechsel. Das schützt Knie und Sprunggelenk mehr als jedes Krafttraining.",
      "Belastung dosieren: kurze intensive Blöcke (30–60 Sekunden), dazwischen echte Pausen. Kinder erholen sich schnell.",
      "Nie als Strafe laufen lassen. Wer Laufen mit Strafe verbindet, bewegt sich später weniger.",
      "Auf Wachstumsschübe achten: Wer plötzlich unkoordiniert wirkt, ist meist gewachsen – dann Technik vor Tempo.",
    ],
    aufgabe:{ titel:"Koordination im Aufwärmen", takt:"woche", anzahl:2, wochen:8,
      text:"Jedes Aufwärmen 5 Minuten Koordination (Hüpfen, Landen, Richtungswechsel) – acht Wochen." },
  },
  {
    id:"torwart", titel:"Torwartspiel", icon:"🧤", focus:"technik",
    worte:["torwart","keeper","tw","torhüter","torfrau","im tor","abschlag","fangen"],
    spruch:"In dem Alter gibt es keine Torhüter. Es gibt Kinder, die auch mal im Tor stehen.",
    kern:"Deshalb sollte reihum jede und jeder ran. Wer früh festgelegt wird, verliert die Feldspieler-Ausbildung – und das holt keiner mehr auf.",
    tipps:[
      "Reihum ins Tor – jede Einheit ein anderes Kind. Wer festgelegt wird, verliert die Feldspieler-Ausbildung.",
      "Fangen vor Abwehren: erst sicher fangen, dann abklatschen, dann hechten.",
      "Nicht auf die Linie stellen: einen Schritt heraus, Gewicht auf den Fußballen.",
      "Torwart ist Mitspieler: mit dem Fuß anspielbar sein, laut coachen.",
      "Nach Gegentoren zuerst loben, was gut war. Kinder im Tor nehmen jedes Tor persönlich.",
    ],
    aufgabe:{ titel:"Torwart-Rotation", takt:"training", anzahl:1, wochen:12,
      text:"Jede Einheit 10 Minuten Torwartspiel mit wechselndem Kind – so kommen alle durch." },
  },
  {
    id:"teamgeist", titel:"Teamgeist nach Niederlagen", icon:"💛", focus:"spielform",
    worte:["verlieren","niederlage","verloren","stimmung","motivation","teamgeist","frust","streit","köpfe hängen","aufgeben","lustlos","kein bock","spaß"],
    spruch:"Okay. Das ist der Moment, wo sich entscheidet, was für ein Trainer du bist. Kein Vortrag jetzt – ein Plan.",
    kern:"Eine Serie von Niederlagen frisst zuerst die Stärksten, dann alle anderen. Dagegen hilft ein zweites Erfolgsmaß neben dem Ergebnis – eines, das ihr auch bei 0:6 erreichen könnt.",
    tipps:[
      "Setzt ein eigenes Ziel pro Spiel, das nichts mit dem Ergebnis zu tun hat: „drei Kombinationen über drei Stationen“. Das ist erreichbar, auch bei 0:6.",
      "Nach dem Spiel zuerst drei Dinge, die gut waren – erst danach das andere. Und nie am Spieltag selbst analysieren.",
      "Gegner auf Augenhöhe suchen: Freundschaftsspiele bewusst gegen Mannschaften, gegen die ihr bestehen könnt. Ein Erfolgserlebnis wiegt fünf Trainings auf.",
      "Bei großem Kader lieber zwei Mannschaften melden als eine gemischte. Ständige Niederlagen vergraulen die Stärkeren, Dauer-Bankdrücken die Schwächeren.",
      "Redet mit den Eltern über das Ziel der Saison. Der Druck kommt selten von den Kindern.",
    ],
    aufgabe:{ titel:"Spielziel statt Ergebnis", takt:"spiel", anzahl:1, wochen:8,
      text:"Vor jedem Spiel ein Mannschaftsziel setzen, das nicht das Ergebnis ist – und danach gemeinsam auswerten." },
  },
  {
    id:"eltern", titel:"Eltern & Kommunikation", icon:"👪", focus:null,
    worte:["eltern","kommunikation","whatsapp","elterngespräch","väter","mütter","meckern","coachen von außen","zuschauer","beschwerde"],
    spruch:"Die Eltern sind nicht dein Gegner. Wirklich nicht, auch wenn es sich manchmal so anfühlt.",
    kern:"Die meisten Konflikte kommen aus fehlender Information, nicht aus Böswilligkeit. Wer früh und regelmäßig erklärt, muss später selten diskutieren.",
    tipps:[
      "Einmal pro Saison Elternabend mit einer klaren Aussage zur Spielzeit. Danach bezieht ihr euch nur noch darauf.",
      "Vom Spielfeldrand coacht nur das Trainerteam. Das lässt sich freundlich, aber verbindlich vereinbaren.",
      "Kritik nie in der Gruppe beantworten – ein Anruf klärt in fünf Minuten, was im Chat eine Woche kocht.",
      "Gute Nachrichten aktiv streuen: Wer nur schreibt, wenn etwas fehlt, wird als Mahner gelesen.",
      "Absagen ohne Vorwurf annehmen. Wer sich für eine Absage rechtfertigen muss, sagt beim nächsten Mal gar nichts.",
    ],
    aufgabe:{ titel:"Kurzer Wochenrückblick an die Eltern", takt:"woche", anzahl:1, wochen:12,
      text:"1× pro Woche zwei Sätze in die Elterngruppe: was diese Woche gut lief und was ansteht." },
  },
];

// ----------------------------------------------------------------
// Tricks: Schritt für Schritt erklärt, dazu ein kleines Bewegungsbild.
// "pfad" ist ein SVG-Pfad im Koordinatenraum 0..100 x 0..60, auf dem der
// Ball entlangläuft - so sieht man die Bewegung statt sie nur zu lesen.
// ----------------------------------------------------------------
export const TRICKS = [
  { id:"sohlenrolle", name:"Sohlenrolle", ab:"ab G-Jugend", stufe:1,
    zweck:"Ball verstecken und die Richtung wechseln, ohne ihn herzugeben.",
    schritte:[
      "Ball mit der Sohle des rechten Fußes leicht berühren.",
      "Ball mit der Sohle quer nach links ziehen – der Körper bleibt zwischen Ball und Gegner.",
      "Mit dem linken Fuß sofort mitnehmen und andrehen.",
      "Erster Schritt nach dem Trick ist ein Tempo-Schritt, kein Bremsschritt.",
    ],
    fehler:"Zu langsam weiter. Der Trick gewinnt nichts, wenn danach nicht beschleunigt wird.",
    pfad:"M20,30 L45,30 L45,14 L80,14", gegner:{x:52,y:30} },
  { id:"ausfallschritt", name:"Ausfallschritt (Körpertäuschung)", ab:"ab G-Jugend", stufe:1,
    zweck:"Den Gegner auf das falsche Bein schicken – der wirksamste Trick im Kinderfußball.",
    schritte:[
      "Im Dribbling einen deutlichen Schritt nach rechts setzen, Oberkörper mitnehmen.",
      "Blick und Schulter gehen mit – das glaubt der Gegner, nicht der Fuß.",
      "Ball mit der Außenseite links am Gegner vorbeischieben.",
      "Zwei schnelle Schritte, dann erst wieder hinschauen.",
    ],
    fehler:"Nur der Fuß täuscht, der Körper bleibt gerade. Dann fällt niemand darauf herein.",
    pfad:"M20,30 L42,30 L46,42 L52,18 L80,18", gegner:{x:55,y:30} },
  { id:"uebersteiger", name:"Übersteiger", ab:"ab F-Jugend", stufe:2,
    zweck:"Klassiker: Fuß um den Ball herum, dann in die andere Richtung weg.",
    schritte:[
      "Ball leicht vorlegen, Tempo herausnehmen.",
      "Rechten Fuß von innen nach außen um den Ball führen – ohne ihn zu berühren.",
      "Auf dem rechten Fuß landen, Gewicht sofort nach links verlagern.",
      "Mit der Außenseite links wegziehen und beschleunigen.",
    ],
    fehler:"Zu weit weg vom Gegner. Der Übersteiger wirkt erst ab etwa zwei Metern Abstand.",
    pfad:"M20,30 L40,30 L44,20 L44,40 L50,30 L80,40", gegner:{x:54,y:30} },
  { id:"cruyff", name:"Cruyff-Trick", ab:"ab F-Jugend", stufe:2,
    zweck:"Aus vollem Lauf die Richtung um 180 Grad drehen – ideal an der Außenlinie.",
    schritte:[
      "Den Schuss andeuten: Standbein neben den Ball, Schussbein ausholen.",
      "Statt zu schießen den Ball mit der Innenseite hinter dem Standbein zurückziehen.",
      "Auf dem Standbein drehen und sofort losgehen.",
      "Der Blick geht vor dem Trick schon dorthin, wohin es danach gehen soll.",
    ],
    fehler:"Ball wird zu weit hinter das Standbein gezogen – dann steht man sich selbst im Weg.",
    pfad:"M20,30 L50,30 L38,42 L18,46", gegner:{x:58,y:30} },
  { id:"zidane", name:"Zidane-Drehung (Roulette)", ab:"ab E-Jugend", stufe:3,
    zweck:"Im Gedränge mit dem Rücken zum Gegner herausdrehen.",
    schritte:[
      "Ball mit der Sohle des rechten Fußes stoppen.",
      "Um den Ball herumdrehen, dabei den Körper zwischen Ball und Gegner halten.",
      "Mit der Sohle des linken Fußes den Ball in die neue Richtung ziehen.",
      "Aus der Drehung heraus sofort zwei schnelle Schritte.",
    ],
    fehler:"Die Drehung wird eingeleitet, bevor der Ball wirklich gestoppt ist.",
    pfad:"M20,30 L48,30 C56,30 56,46 44,46 C34,46 30,38 40,34 L78,44", gegner:{x:56,y:26} },
  { id:"mitnahme", name:"Ballmitnahme in den Rücken", ab:"ab F-Jugend", stufe:2,
    zweck:"Kein Trick im engeren Sinn, aber der wichtigste Handgriff im Zusammenspiel.",
    schritte:[
      "Vor dem Zuspiel über die Schulter schauen – wo steht der Gegner?",
      "Den Ball nicht stoppen, sondern mit der vom Gegner abgewandten Seite mitnehmen.",
      "Die erste Berührung geht in den freien Raum, nicht zum eigenen Fuß.",
      "Kopf hoch, bevor der Ball ankommt – nicht danach.",
    ],
    fehler:"Ball wird angenommen und erst dann geschaut. Dann ist der Gegner schon da.",
    pfad:"M85,14 L52,26 L34,40 L14,44", gegner:{x:60,y:34} },
];

// ----------------------------------------------------------------
// Geführter Teil: Statt frei zu formulieren, beantwortet der Trainer ein
// paar Fragen per Knopfdruck - daraus wird gerechnet. Gleiche Antworten
// ergeben immer dasselbe Ergebnis, und der Rechenweg steht dabei.
// Drei Fragen stellt die App immer (Anzahl, Dauer, Ort), davor kommt die
// Frage, die zum Thema gehört.
// ----------------------------------------------------------------
const FRAGE_ANZAHL = { id:"anzahl", text:"Wie viele Kinder sind im Training?", opt:[
  { id:"klein",  label:"Bis 10" },
  { id:"mittel", label:"11 bis 16" },
  { id:"gross",  label:"Mehr als 16" },
]};
const FRAGE_DAUER = { id:"dauer", text:"Wie lange dauert die Einheit?", opt:[
  { id:"45", label:"45 Minuten" },
  { id:"60", label:"60 Minuten" },
  { id:"75", label:"75 Minuten" },
  { id:"90", label:"90 Minuten" },
]};
const FRAGE_ORT = { id:"ort", text:"Wo trainiert ihr?", opt:[
  { id:"platz",   label:"Ganzer Platz" },
  { id:"halb",    label:"Halbes Feld" },
  { id:"halle",   label:"Halle" },
]};

// Themen-Frage: die eine Frage, die das Ergebnis wirklich dreht.
export const THEMA_FRAGE = {
  zusammenspiel:{ id:"wo", text:"Wo geht der Ball meistens verloren?", opt:[
    { id:"annahme", label:"Schon bei der Ballannahme", focus:"technik",
      folge:"Dann ist es kein Passproblem – die erste Berührung muss sitzen.",
      massnahmen:["Ballannahme mit der zweiten Berührung in den freien Raum – 10 Minuten in jeder Einheit.",
                  "Zuspiele immer aus der Bewegung, nie aus dem Stand.",
                  "Vor der Annahme über die Schulter schauen lassen – ein Wort genügt: „Schulter!“"] },
    { id:"abspiel", label:"Beim Abspiel – Pässe kommen nicht an", focus:"technik",
      folge:"Passtechnik und Passhärte sind das Thema, nicht die Spielidee.",
      massnahmen:["Passen auf kurze Distanz mit fester Innenseite – lieber zu fest als zu lasch.",
                  "Immer auf den richtigen Fuß passen: den, der vom Gegner weg zeigt.",
                  "Pässe nur flach – hohe Bälle in der Jugend sind verlorene Bälle."] },
    { id:"nie", label:"Sie spielen gar nicht erst ab", focus:"spielform",
      folge:"Ein Wahrnehmungsproblem: Sie sehen den Mitspieler nicht, sie wollen ihn nicht übersehen.",
      massnahmen:["Kleine Felder, viele Ballkontakte: 4 gegen 4, Tor zählt doppelt nach drei Pässen.",
                  "Anbieten trainieren – wer keinen Ball hat, bewegt sich aus dem Deckungsschatten.",
                  "Den Pass loben, nicht das Tor. Drei Wochen konsequent, dann kippt es."] },
  ]},
  abschluss:{ id:"wann", text:"Woran scheitert der Abschluss?", opt:[
    { id:"technik", label:"Sie treffen den Ball nicht sauber", focus:"torschuss",
      folge:"Schusstechnik ohne Druck aufbauen, dann erst Tempo dazu.",
      massnahmen:["Ruhige Abschlüsse aus 8–10 Metern, Standbein neben den Ball.",
                  "Innenseite vor Spann – Genauigkeit schlägt Härte in der Jugend.",
                  "Jedes Kind mindestens 15 Abschlüsse je Einheit."] },
    { id:"hektik", label:"Sie hetzen und schließen zu früh ab", focus:"torschuss",
      folge:"Nicht die Technik ist das Problem, sondern die Ruhe vor dem Tor.",
      massnahmen:["Abschluss immer mit Torwart – nie ins leere Tor.",
                  "Eine Vorgabe: erst hinschauen, dann schießen. Blick zum Tor vor dem Schuss.",
                  "Nach jedem Schuss nachsetzen – die Hälfte der Tore fällt aus Abprallern."] },
    { id:"chancen", label:"Wir kommen kaum zu Chancen", focus:"spielform",
      folge:"Das ist kein Abschluss-, sondern ein Spielaufbau-Thema.",
      massnahmen:["Spielformen mit Überzahl im Angriff (4 gegen 3) – so entstehen Abschlüsse.",
                  "Flügel bespielen statt durch die Mitte drängen.",
                  "Nach Balleroberung sofort nach vorn – drei Sekunden Umschaltfenster."] },
  ]},
  verteidigen:{ id:"wie", text:"Wie fallen die Gegentore?", opt:[
    { id:"konter", label:"Nach eigenem Ballverlust – Konter", focus:"taktik",
      folge:"Das Umschalten nach hinten ist die Baustelle, nicht das Verteidigen selbst.",
      massnahmen:["Nach Ballverlust sofort einer zum Ball, die anderen zurück – als feste Regel.",
                  "Im Training Spielformen mit Umschalt-Pfiff: auf Zuruf wechselt der Ballbesitz.",
                  "Nicht alle nach vorn: einer bleibt immer hinten, auch beim eigenen Angriff."] },
    { id:"zweikampf", label:"Wir verlieren die Zweikämpfe", focus:"taktik",
      folge:"Stellung und Abstand sind wichtiger als Tempo oder Kraft.",
      massnahmen:["Eine Armlänge Abstand, seitlich stehen, zur Außenlinie lenken.",
                  "1 gegen 1 defensiv üben – ohne Grätsche, nur Stellungsspiel.",
                  "Geduld belohnen: wer abwartet und den Ball erobert, wird gelobt."] },
    { id:"standard", label:"Bei Ecken und Freistößen", focus:"taktik",
      folge:"Standards sind reine Absprache – das lässt sich in zwei Einheiten lösen.",
      massnahmen:["Feste Zuordnung: jedes Kind kennt seinen Gegenspieler.",
                  "Einer am kurzen Pfosten, einer am langen – immer dieselben.",
                  "Nach dem Klären sofort herausrücken, geschlossen."] },
  ]},
  technik:{ id:"stand", text:"Wie sicher sind sie am Ball?", opt:[
    { id:"anfang", label:"Noch sehr wacklig", focus:"technik",
      folge:"Erst Ballgefühl, noch keine Finten – sonst frustriert es nur.",
      massnahmen:["Jedes Kind ein Ball, freies Dribbeln mit Richtungswechsel auf Zuruf.",
                  "Ballführung mit beiden Füßen, langsam und sauber statt schnell und wild.",
                  "Keine Warteschlangen – niemand steht länger als zehn Sekunden."] },
    { id:"solide", label:"Solide, aber wenig Mut", focus:"technik",
      folge:"Sie können mehr, als sie sich trauen. Das löst man über Erfolgserlebnisse.",
      massnahmen:["Trick der Woche: 3 Minuten zu Beginn, zwei Wochen derselbe Trick.",
                  "1 gegen 1 mit kleinen Toren – dort darf jeder alles probieren.",
                  "Fehlversuche ausdrücklich loben, sonst probiert es beim nächsten Mal keiner."] },
    { id:"gut", label:"Technisch schon stark", focus:"spielform",
      folge:"Technik unter Druck ist der nächste Schritt – im freien Spiel bringt sie sonst nichts.",
      massnahmen:["Enge Felder mit Gegnerdruck – Technik nur mit Zeitdruck trainieren.",
                  "Zwei-Kontakt-Regel in Spielformen.",
                  "Finten gezielt gegen echte Gegner, nicht gegen Hütchen."] },
  ]},
  kondition:{ id:"was", text:"Was fehlt konkret?", opt:[
    { id:"puste", label:"Nach 20 Minuten ist die Luft raus", focus:"kondition",
      folge:"Grundlagen fehlen – im Kinderfußball baut man die über Spielformen auf, nicht über Läufe.",
      massnahmen:["Viele kleine Spiele mit kurzen Pausen statt Dauerlauf.",
                  "Feldgröße vergrößern – längere Wege bringen die Ausdauer von selbst.",
                  "Nie als Strafe laufen lassen."] },
    { id:"antritt", label:"Sie kommen nicht in die Zweikämpfe", focus:"kondition",
      folge:"Antritt und Richtungswechsel, nicht Ausdauer.",
      massnahmen:["Kurze Sprints über 5–10 Meter mit Richtungswechsel, immer mit Ball.",
                  "Reaktionsstarts auf Zuruf oder Signal.",
                  "Volle Pausen dazwischen – sonst wird daraus Ausdauertraining."] },
    { id:"koord", label:"Sie wirken unkoordiniert", focus:"kondition",
      folge:"Oft Wachstum. Dann hilft Koordination, nicht mehr Belastung.",
      massnahmen:["Jedes Aufwärmen 5 Minuten Hüpfen, Landen, Richtungswechsel.",
                  "Technik vor Tempo, solange es hakt.",
                  "Geduld – das gibt sich meist nach wenigen Wochen von selbst."] },
  ]},
  torwart:{ id:"tw", text:"Was ist die Situation im Tor?", opt:[
    { id:"keiner", label:"Niemand will ins Tor", focus:"technik",
      folge:"Normal in diesem Alter. Reihum lösen statt überreden.",
      massnahmen:["Feste Rotation: jede Einheit ein anderes Kind, jeder kommt dran.",
                  "Torwartspiel als Spiel verpacken – Fangen, Werfen, Reaktion.",
                  "Nach Gegentoren zuerst loben, was gut war."] },
    { id:"einer", label:"Einer macht es immer", focus:"technik",
      folge:"Riskant: Er verliert die Feldspieler-Ausbildung, und bei Ausfall steht ihr ohne da.",
      massnahmen:["Auch der Stamm-Torwart spielt jede Einheit die Hälfte im Feld.",
                  "Zwei weitere Kinder aufbauen – eines reicht nicht als Reserve.",
                  "Torwart als Mitspieler trainieren: mit dem Fuß anspielbar sein."] },
    { id:"technik", label:"Technisch unsicher", focus:"technik",
      folge:"Fangen vor Abwehren – in dieser Reihenfolge.",
      massnahmen:["Sicher fangen üben, erst danach abklatschen und hechten.",
                  "Grundstellung: einen Schritt aus dem Tor, Gewicht auf den Fußballen.",
                  "Bälle flach und mittelhoch – hohe Bälle erst viel später."] },
  ]},
  teamgeist:{ id:"lage", text:"Woran merkst du es am stärksten?", opt:[
    { id:"koepfe", label:"Bei Rückstand hängen die Köpfe", focus:"spielform",
      folge:"Es fehlt ein Erfolgsmaß, das unabhängig vom Ergebnis ist.",
      massnahmen:["Ein Mannschaftsziel pro Spiel, das nichts mit dem Ergebnis zu tun hat.",
                  "Nach dem Spiel zuerst drei gute Dinge – nie am Spieltag analysieren.",
                  "Bei 0:4 das Ziel wechseln: „Wir wollen noch ein Tor machen.“"] },
    { id:"starke", label:"Die Stärkeren verlieren die Lust", focus:"spielform",
      folge:"Das ist der Punkt, an dem Mannschaften auseinanderbrechen. Hier hilft die Einteilung in Leistungsgruppen.",
      massnahmen:["Zwei Mannschaften melden statt einer gemischten – stark gegen stark.",
                  "Im Training Aufgaben mit unterschiedlichem Anspruch an denselben Stationen.",
                  "Den Stärkeren Verantwortung geben: Übungen vormachen, Gruppen anleiten."] },
    { id:"streit", label:"Es gibt Streit untereinander", focus:"spielform",
      folge:"Meist wenige Kinder und ein wiederkehrendes Muster – nicht die ganze Mannschaft.",
      massnahmen:["Mannschaften im Training regelmäßig neu mischen – feste Lager auflösen.",
                  "Streit sofort und kurz klären, nie vor der Gruppe ausbreiten.",
                  "Gemeinsame Aufgaben außerhalb des Spielfelds – Aufbau, Material, Kiosk."] },
  ]},
  eltern:{ id:"was", text:"Worum geht es gerade?", opt:[
    { id:"spielzeit", label:"Unzufriedenheit mit der Spielzeit", focus:null,
      folge:"Fast immer fehlende Information, nicht fehlendes Verständnis.",
      massnahmen:["Die Regel einmal klar sagen und danach nur noch darauf verweisen.",
                  "Spielzeit grob mitschreiben – mit Zahlen endet jede Diskussion schnell.",
                  "Einzelgespräch statt Gruppenchat."] },
    { id:"rand", label:"Coaching vom Spielfeldrand", focus:null,
      folge:"Die Kinder hören dann zwei Stimmen und keine davon richtig.",
      massnahmen:["Freundlich, aber verbindlich vereinbaren: Coaching nur vom Trainerteam.",
                  "Eltern eine Aufgabe geben – wer hilft, ruft weniger.",
                  "Einmal pro Saison ansprechen, nicht bei jedem Spiel."] },
    { id:"info", label:"Zu wenig Information", focus:null,
      folge:"Einfach zu lösen und mit der größten Wirkung.",
      massnahmen:["1× pro Woche zwei Sätze in die Gruppe: was lief, was kommt.",
                  "Auch Gutes melden, nicht nur Absagen und Mängel.",
                  "Termine früh einstellen – Planbarkeit nimmt den meisten Druck."] },
  ]},
};

// Die Fragen zu einem Thema: Themen-Frage zuerst, dann die drei festen.
export const fragenZu = (themaId) => {
  const tf = THEMA_FRAGE[themaId];
  return [ ...(tf?[tf]:[]), FRAGE_ANZAHL, FRAGE_DAUER, FRAGE_ORT ];
};

// Der "Taschenrechner": aus den Antworten wird ein Ergebnis - immer
// dasselbe bei denselben Antworten, mit offenem Rechenweg.
export const rechneErgebnis = (themaId, antworten={}) => {
  const thema = THEMEN.find(t=>t.id===themaId);
  const tf = THEMA_FRAGE[themaId];
  const wahl = tf ? (tf.opt.find(o=>o.id===antworten[tf.id]) || null) : null;
  const anzahl = antworten.anzahl || "mittel";
  const dauer  = Number(antworten.dauer||60);
  const ort    = antworten.ort || "platz";

  const focus = (wahl && wahl.focus) || thema?.focus || "auto";
  // Gruppen: bei vielen Kindern Stationsbetrieb, sonst eine Gruppe.
  const gruppen = anzahl==="gross" ? 3 : anzahl==="mittel" ? 2 : 1;
  // In der Halle und auf dem halben Feld bleibt weniger Platz - kürzere
  // Wege, kleinere Felder, dafür mehr Wiederholungen.
  const feld = ort==="halle" ? "20 × 12 m" : ort==="halb" ? "30 × 20 m" : "40 × 25 m";
  const spielform = anzahl==="gross" ? "3 gegen 3 auf zwei Feldern"
                  : anzahl==="mittel" ? "4 gegen 4" : "3 gegen 3";
  // Netto-Zeit: Ankommen und Abschluss kosten immer etwas.
  const netto = Math.max(30, dauer - (dauer>=75?15:10));

  const rechenweg = [
    wahl && `„${wahl.label}“ → ${wahl.folge}`,
    `${anzahl==="gross"?"Mehr als 16 Kinder":anzahl==="mittel"?"11 bis 16 Kinder":"Bis 10 Kinder"} → ${gruppen===1?"eine Gruppe, jeder viele Ballkontakte":`${gruppen} Stationen im Wechsel`}`,
    `${dauer} Minuten → ${netto} Minuten echte Übungszeit (Ankommen und Abschlussspiel abgezogen)`,
    `${ort==="halle"?"Halle":ort==="halb"?"Halbes Feld":"Ganzer Platz"} → Felder ${feld}, Abschlussspiel ${spielform}`,
  ].filter(Boolean);

  return {
    themaId, thema, wahl, focus, gruppen, feld, spielform, dauer, netto,
    diagnose: wahl ? wahl.folge : (thema?.kern||""),
    massnahmen: (wahl && wahl.massnahmen) || (thema?.tipps||[]).slice(0,3),
    rechenweg,
    trainingsParam: { focus, targetMin:dauer },
  };
};

// ----------------------------------------------------------------
// Einteilung in Leistungsgruppen besprechen. Der Assistent rechnet einen
// nachvollziehbaren Vorschlag - entschieden wird er vom Trainer. Deshalb
// steht bei jedem Kind, WORAUS sich der Wert ergibt, und jede Zuordnung
// lässt sich vor dem Übernehmen noch ändern.
// ----------------------------------------------------------------
export const EINTEILUNG_FRAGEN = [
  { id:"worauf", text:"Worauf soll ich vor allem schauen?", opt:[
    { id:"staerke",     label:"Aktuelle Stärke",            gew:{staerke:.60, entwicklung:.20, dabei:.20} },
    { id:"entwicklung", label:"Entwicklung der letzten Monate", gew:{staerke:.30, entwicklung:.50, dabei:.20} },
    { id:"dabei",       label:"Zuverlässigkeit im Training", gew:{staerke:.35, entwicklung:.15, dabei:.50} },
  ]},
  { id:"schnitt", text:"Wie groß soll die stärkste Gruppe sein?", opt:[
    { id:"drittel", label:"Etwa gleich große Gruppen" },
    { id:"haelfte", label:"Die stärkste Hälfte zusammen" },
    { id:"abstand", label:"Dort trennen, wo der Abstand am größten ist" },
  ]},
];

const runde1 = x => Math.round(x*10)/10;

// kinder: [{id,name,schnitt(0-5|null),trend(-1..1|null),quote(0..1|null)}]
export const rechneEinteilung = ({ kinder=[], gruppen=[], worauf="staerke", schnitt="drittel" }) => {
  const gew = (EINTEILUNG_FRAGEN[0].opt.find(o=>o.id===worauf)||EINTEILUNG_FRAGEN[0].opt[0]).gew;
  const mitSkill = kinder.filter(k=>typeof k.schnitt==="number");
  const basisDuenn = mitSkill.length < Math.ceil(kinder.length/2);

  const bewertet = kinder.map(k=>{
    // Jede Zutat auf 0..1, fehlende Angaben zählen neutral (0,5) - so
    // rutscht niemand nach unten, nur weil nichts gepflegt ist.
    const sStaerke     = typeof k.schnitt==="number" ? Math.min(1,Math.max(0,k.schnitt/5)) : .5;
    const sEntwicklung = typeof k.trend==="number"   ? Math.min(1,Math.max(0,(k.trend+1)/2)) : .5;
    const sDabei       = typeof k.quote==="number"   ? Math.min(1,Math.max(0,k.quote)) : .5;
    const wert = sStaerke*gew.staerke + sEntwicklung*gew.entwicklung + sDabei*gew.dabei;
    const teile = [
      typeof k.schnitt==="number" ? `Stärke ${runde1(k.schnitt)}/5` : "Stärke nicht gepflegt",
      typeof k.trend==="number"   ? `Entwicklung ${k.trend>0?"+":""}${runde1(k.trend)}` : null,
      typeof k.quote==="number"   ? `${Math.round(k.quote*100)} % dabei` : null,
    ].filter(Boolean);
    return { ...k, wert, teile };
  }).sort((a,b)=>b.wert-a.wert || String(a.name).localeCompare(String(b.name),"de"));

  // Schnittpunkte bestimmen: gleich große Gruppen, obere Hälfte, oder dort
  // trennen, wo zwischen zwei Kindern der größte Abstand liegt.
  const n = bewertet.length, g = Math.max(1, gruppen.length);
  let grenzen;
  if(schnitt==="haelfte" && g>=2){
    const erste = Math.round(n/2);
    const restG = g-1, restN = n-erste;
    grenzen = [erste, ...Array.from({length:restG-1},(_,i)=>erste+Math.round(restN*(i+1)/restG))];
  } else if(schnitt==="abstand" && g>=2 && n>g){
    const luecken = bewertet.slice(0,-1).map((k,i)=>({ i:i+1, d:k.wert-bewertet[i+1].wert }))
      .sort((a,b)=>b.d-a.d).slice(0,g-1).map(x=>x.i).sort((a,b)=>a-b);
    grenzen = luecken;
  } else {
    grenzen = Array.from({length:g-1},(_,i)=>Math.round(n*(i+1)/g));
  }
  const gruppeVon = (ix) => {
    let gi=0; for(const gr of grenzen){ if(ix>=gr) gi++; }
    return gruppen[Math.min(gi,g-1)] || null;
  };
  const vorschlag = bewertet.map((k,ix)=>({ ...k, gruppe: gruppeVon(ix) }));

  const verteilung = gruppen.map(gr=>({ gruppe:gr, n:vorschlag.filter(v=>v.gruppe&&v.gruppe.id===gr.id).length }));
  const rechenweg = [
    `Gewichtung: Stärke ${Math.round(gew.staerke*100)} %, Entwicklung ${Math.round(gew.entwicklung*100)} %, Beteiligung ${Math.round(gew.dabei*100)} %`,
    schnitt==="haelfte" ? "Schnitt: die stärkste Hälfte bildet die erste Gruppe"
      : schnitt==="abstand" ? "Schnitt: getrennt wird dort, wo zwischen zwei Kindern der größte Abstand liegt"
      : "Schnitt: etwa gleich große Gruppen",
    verteilung.map(v=>`${v.gruppe.name}: ${v.n}`).join(" · "),
  ];
  return { vorschlag, verteilung, rechenweg, basisDuenn, mitSkill:mitSkill.length, gesamt:kinder.length };
};

// ----------------------------------------------------------------
// Erkennung: Welches Thema meint der Trainer? Bewusst schlicht und
// nachvollziehbar - Treffer je Stichwort, das beste Thema gewinnt.
// ----------------------------------------------------------------
const nrm = s => String(s||"").toLowerCase().replace(/[.,!?;:]/g," ").replace(/\s+/g," ").trim();

export const findeThema = (frage) => {
  const f = nrm(frage);
  if(!f) return null;
  let best=null, bestScore=0;
  for(const th of THEMEN){
    let score=0;
    for(const w of th.worte){ if(f.includes(w)) score += w.length>6?3:2; }
    if(score>bestScore){ best=th; bestScore=score; }
  }
  return bestScore>=2 ? best : null;
};

export const findeTricks = (frage) => {
  const f = nrm(frage);
  if(!/trick|finte|move|übersteiger|uebersteiger|cruyff|zidane|sohle|täuschung|taeuschung|dribbel|dribbling/.test(f)) return [];
  const treffer = TRICKS.filter(t=>f.includes(nrm(t.name).split(" ")[0]));
  return treffer.length ? treffer : TRICKS;
};

// Vorschlag für einen Zeitraum: "2× pro Woche, sechs Wochen" in Klartext.
export const taktText = (a) => {
  if(!a) return "";
  if(a.takt==="training") return `jede Einheit · ${a.wochen} Wochen`;
  if(a.takt==="spiel")    return `vor jedem Spiel · ${a.wochen} Wochen`;
  return `${a.anzahl}× pro Woche · ${a.wochen} Wochen`;
};

// Nächste Fälligkeit einer wiederkehrenden Aufgabe.
export const naechsteFaelligkeit = (takt, vonISO) => {
  const d = new Date((vonISO||new Date().toISOString()).slice(0,10)+"T12:00:00");
  d.setDate(d.getDate() + (takt==="woche" ? 7 : takt==="training" ? 3 : 7));
  return d.toISOString().slice(0,10);
};

// Ein kurzer Rausschmeißer zum Schluss. Rotierend, damit es nicht nach
// Textbaustein klingt.
export const RAUS = [
  "Und jetzt raus und machen. Reden kann man hinterher.",
  "Nicht perfekt machen – anfangen. Der Rest kommt beim Tun.",
  "Wenn du nur eine Sache davon umsetzt, nimm die erste. Die reicht schon.",
  "Vier Wochen dranbleiben, dann reden wir wieder. Vorher passiert nichts, das ist normal.",
  "Und denk dran: Die Kinder merken, ob du daran glaubst. Alles andere ist zweitrangig.",
];
export const rausSpruch = (n=0) => RAUS[Math.abs(n)%RAUS.length];

// Die EINE Schnittstelle der Oberfläche. Später kann hier eine echte KI
// antworten, ohne dass sich sonst etwas ändert.
export const antwortAuf = (frage, ctx={}) => {
  const tricks = findeTricks(frage);
  if(tricks.length) return { art:"tricks", tricks, text:tricks.length===1
    ? `Der ${tricks[0].name}! Gute Wahl. So geht er:`
    : "Tricks, ja! Die hier lohnen sich im Kinderfußball – vom einfachsten zum schwersten:" };
  const th = findeThema(frage);
  if(!th) return { art:"unklar", text:"Da komme ich nicht mit, ehrlich gesagt. Sag’s mir nochmal anders – Zusammenspiel, Torabschluss, Verteidigen, Kondition, Technik und Tricks, Torwartspiel, Stimmung nach Niederlagen oder Eltern. Eins davon passt bestimmt." };
  return { art:"thema", thema:th, text:th.kern };
};
