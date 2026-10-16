// Such-Engine ohne Browser prüfen:  node tests/suche.test.mjs
import { search, parseQuery, buildIndex, buildVocab, complete, explain, norm, editDistance } from '../src/search.js'
import { iso, addDays, wdIdx, fromIso } from '../src/util.js'

let fails = 0
const ok = (cond, msg, extra) => { console.log((cond ? 'OK   ' : 'FAIL ') + msg + (cond || extra === undefined ? '' : '  → ' + JSON.stringify(extra))); if (!cond) fails++ }

const today = iso(new Date())
const nextWd = (wd, strict) => { let d = (wd - wdIdx(fromIso(today)) + 7) % 7; if (strict && !d) d = 7; return addDays(today, d) }
const dm = (d) => { const x = fromIso(d); return String(x.getDate()).padStart(2, '0') + '.' + String(x.getMonth() + 1).padStart(2, '0') + '.' }

const jan = { id: 'jan', name: 'Jan', color: '#3D7BFF', kind: 'adult', is_admin: true, can_direct: true }
const anne = { id: 'anne', name: 'Anne', color: '#FF5D73', kind: 'adult', can_direct: true, modules: { praxis: true } }
const emma = { id: 'emma', name: 'Emma', color: '#8B5CF6', kind: 'kid', care: [{ id: 'c1', label: 'Schule', days: [0, 1, 2, 3, 4, 5, 6], from: '07:45', to: '13:15' }] }
const ben = { id: 'ben', name: 'Ben', color: '#2FBF71', kind: 'kid' }
const ev = (o) => ({ status: 'fix', meta: '', created_by: 'jan', ...o })
const db = {
  family: { name: 'Familie Muster' },
  members: [jan, anne, emma, ben],
  events: [
    ev({ id: 'k1', member_id: 'emma', on_date: addDays(today, -14), at_time: '15:30', title: 'Klavierstunde' }),
    ev({ id: 'k2', member_id: 'emma', on_date: addDays(today, -7), at_time: '15:30', title: 'Klavierstunde' }),
    ev({ id: 'k3', member_id: 'emma', on_date: addDays(today, 7), at_time: '15:30', title: 'Klavierstunde', zust: 'anne' }),
    ev({ id: 'sp', member_id: 'emma', on_date: today, at_time: '17:30', title: 'Spielen bei Lotta' }),
    ev({ id: 'n1', member_id: 'anne', created_by: 'anne', on_date: addDays(today, 1), at_time: '10:00', title: '🩺 Nachsorge Julia M.', klid: 'julia', ptype: 'Nachsorge', soll: 60 }),
    ev({ id: 'ka', member_id: 'ben', on_date: addDays(today, 2), at_time: '16:00', title: 'Kinderarzt Vorsorge', meta: 'U-Heft mitnehmen' }),
    ev({ id: 'fb', member_id: 'ben', on_date: addDays(today, 3), at_time: '17:00', title: 'Fußballtraining', serie: true }),
    ev({ id: 'ea', member_id: 'jan', created_by: 'anne', on_date: addDays(today, 4), at_time: '19:30', title: 'Elternabend Emma', status: 'pending' }),
  ],
  items: [
    { id: 'i1', list: 'einkauf', text: 'Milch & Brot', done: false, created_by: 'anne' },
    { id: 'i2', list: 'todo', text: 'Fahrrad zur Werkstatt', done: false, created_by: 'jan' },
  ],
  geburtstage: [
    { id: 'g1', name: 'Oma Helga', date: dm(addDays(today, 2)) + '1949', tel: '0171 2223344' },
    { id: 'g2', name: 'Tante Anna', date: '03.11.1985' },
  ],
  inbox: [{ id: 'z1', member_id: 'jan', text: 'Geschenk für Oma: Fotobuch', ts: 1, date: 'gestern' }],
}
const byId = Object.fromEntries(db.members.map((m) => [m.id, m]))
const viewEvent = (e) => {
  if (e.klid && e.created_by !== jan.id) return { ...e, title: '🩺 Praxis · belegt', meta: byId[e.member_id].name + ' · Details privat', masked: true }
  return e
}
const ctx = {
  today, nowMin: 10 * 60, me: jan, meId: 'jan', byId, members: db.members, kids: [emma, ben], events: db.events, viewEvent,
  isFree: (mid, d, t) => !db.events.some((e) => e.member_id === mid && e.on_date === d && Math.abs(+e.at_time.slice(0, 2) * 60 + +e.at_time.slice(3) - (+t.slice(0, 2) * 60 + +t.slice(3))) < 60),
  navs: [
    { id: 'kalender', title: 'Kalender', sub: 'Monat mit Kalenderwochen und Feiertagen', kw: 'monat woche kw feiertage' },
    { id: 'theme-dark', title: 'Dunkles Erscheinungsbild', sub: 'Für abends', kw: 'dunkel nacht nachtmodus dark' },
    { id: 'backup', title: 'Backup exportieren', sub: 'Alle Daten sichern', kw: 'sicherung export datensicherung' },
  ],
}
const index = buildIndex(db, ctx)
const S = (q) => search(q, index, ctx)
const P = (q) => parseQuery(q, { ...ctx, vocabSet: index.vocabSet })
const titles = (r, kind) => (r.groups.find((g) => g.kind === kind)?.items || []).map((i) => i.title)

console.log('— Grundlagen')
ok(norm('Fußball Müller Café') === 'fussball mueller cafe', 'Umlaute, ß und Akzente werden vereinheitlicht')
ok(editDistance('kinderartz', 'kinderarzt', 2) === 1, 'Vertauschte Buchstaben zählen als ein Fehler')

console.log('— Verstehen')
let p = P('Emma Freitag 15 Uhr Klavier')
ok(p.persons[0] === 'emma' && p.date.from === nextWd(4) && p.time === '15:00' && p.intent === 'create' && p.title === 'Klavier', 'Emma Freitag 15 Uhr Klavier → Termin für Emma', p)
p = P('jeden Dienstag 17 Uhr Fußball Ben')
ok(p.serie?.wd === 1 && p.persons[0] === 'ben' && p.time === '17:00' && p.title === 'Fußball' && p.intent === 'create', 'jeden Dienstag … → wöchentliche Serie für Ben', p)
p = P('freitags 15:30 Klavier')
ok(p.serie?.wd === 4 && p.time === '15:30', '„freitags“ heißt jede Woche')
ok(P('halb 4 Zahnarzt').time === '15:30', '„halb 4“ → 15:30')
ok(P('viertel nach 3 Friseur').time === '15:15', '„viertel nach 3“ → 15:15')
ok(P('um 8 Elternabend').time === '08:00', '„um 8“ → 08:00')
ok(P('um 3 Kaffee').time === '15:00', '„um 3“ → 15:00 (nachmittags)')
ok(P('Zahnarzt 24.12.').date.from === `${today.slice(0, 4)}-12-24`, '„24.12.“ → Heiligabend dieses Jahres')
ok(P('was ist in 3 Tagen').date.from === addDays(today, 3), '„in 3 Tagen“')
p = P('nächste Woche')
ok(p.date.from === addDays(today, 7 - wdIdx(fromIso(today))) && p.date.to === addDays(p.date.from, 6), '„nächste Woche“ → Montag bis Sonntag', p.date)
ok(P('am Wochenende').date.label === 'Wochenende', '„am Wochenende“')
ok(P('morgen abend Kino').part === 'abend' && P('morgen abend Kino').date.from === addDays(today, 1), '„morgen abend“ → morgen, abends')
ok(P('Emmas Termine').persons[0] === 'emma', 'Besitz-s: „Emmas“ → Emma')
ok(P('Anna').persons.length === 0, '„Anna“ (Tante Anna) wird nicht mit Anne verwechselt')
ok(P('Emmma').persons[0] === 'emma', 'Tippfehler im Namen: „Emmma“ → Emma')

console.log('— Absichten')
ok(P('Wo ist Emma gerade?').intent === 'where', 'Wo ist Emma gerade? → wo')
ok(P('Wer holt Emma heute?').intent === 'who', 'Wer holt Emma heute? → wer übernimmt')
p = P('Wer hat Samstag um 15 Uhr Zeit?')
ok(p.intent === 'free' && p.time === '15:00' && p.date.from === nextWd(5), 'Wer hat Samstag um 15 Uhr Zeit? → frei/belegt', p)
ok(P('Was ist morgen?').intent === 'agenda', 'Was ist morgen? → Tagesübersicht')
ok(P('Wann hat Oma Helga Geburtstag?').intent === 'birthday', 'Geburtstagsfrage')
ok(P('Wann ist Emma in der Schule?').intent === 'care', 'Betreuungsfrage')
p = P('Milch auf die Liste')
ok(p.intent === 'list' && p.list === 'einkauf' && p.listText === 'Milch', 'Milch auf die Liste → Einkaufsliste', p)
p = P('Brot kaufen')
ok(p.intent === 'list' && p.listText === 'Brot', 'Brot kaufen → Einkaufsliste')
p = P('Todo: Steuererklärung abgeben')
ok(p.intent === 'list' && p.list === 'todo' && p.listText === 'Steuererklärung abgeben', 'Todo: … → To-do-Liste', p)
p = P('Notiz: Reifen wechseln')
ok(p.intent === 'blitz' && p.blitz === 'Reifen wechseln', 'Notiz: … → Blitzzettel')
ok(P('Emma').intent === 'person', 'Nur ein Name → Personen-Überblick')

console.log('— Finden')
ok(titles(S('Kinderartz'), 'event').includes('Kinderarzt Vorsorge'), 'Tippfehler: „Kinderartz“ findet den Kinderarzt')
ok(titles(S('Fussball'), 'event').includes('Fußballtraining'), 'ss/ß egal: „Fussball“ findet „Fußballtraining“')
ok(titles(S('Doktor'), 'event').includes('Kinderarzt Vorsorge'), 'Synonym: „Doktor“ findet den Kinderarzt')
ok(titles(S('U-Heft'), 'event').includes('Kinderarzt Vorsorge'), 'Notizen werden mitdurchsucht (U-Heft)')
ok(titles(S('Helga'), 'geb').includes('Oma Helga'), 'Geburtstage sind auffindbar')
ok(titles(S('Werkstatt'), 'item').includes('Fahrrad zur Werkstatt'), 'Listenpunkte sind auffindbar')
ok(titles(S('Fotobuch'), 'zettel').length === 1, 'Eigene Blitzzettel sind auffindbar')
ok(titles(S('dunkel'), 'nav').includes('Dunkles Erscheinungsbild'), 'Befehle über Stichworte (dunkel)')
let r = S('Kla')
const first = r.groups.find((g) => g.kind === 'event').items[0]
ok(first.title === 'Klavierstunde' && JSON.stringify(first.hl.title) === '[[0,3]]', 'Beim Tippen: „Kla“ markiert genau die getippten Buchstaben', first.hl)
ok(first.doc.date >= today, 'Kommende Termine stehen vor vergangenen')
ok(titles(S('Julia'), 'event').length === 0 && titles(S('Nachsorge'), 'event').length === 0, 'Privatsphäre: fremde Praxis-Details sind nicht durchsuchbar')
ok(titles(S('Praxis'), 'event').length === 1, 'Der belegte Block selbst ist auffindbar („Praxis · belegt“)')
r = S('Emma morgen')
ok(r.groups.every((g) => g.kind !== 'event' || g.items.every((i) => i.doc.date === addDays(today, 1))), 'Filter „morgen“ zeigt nur Termine von morgen')

console.log('— Antworten')
r = S('Wann hat Oma Helga Geburtstag?')
ok(r.answer && r.answer.text === 'Oma Helga hat übermorgen Geburtstag.' && /wird 77/.test(r.answer.sub), 'Geburtstag: „Oma Helga hat übermorgen Geburtstag.“', r.answer)
ok(r.answer.actions[0].act.type === 'openWa', 'mit WhatsApp-Glückwunsch als Aktion')
r = S('Wo ist Emma gerade?')
ok(r.answer && r.answer.text === 'Emma ist gerade in der Schule – bis 13:15.', 'Wo ist Emma? → „in der Schule – bis 13:15“', r.answer)
r = S('Wer holt Emma heute?')
ok(r.answer && /noch niemand eingeteilt/.test(r.answer.text) && r.answer.actions[0].act.type === 'claim', 'Wer holt Emma? → offen + „Ich übernehme“', r.answer)
r = S('Wer hat Samstag um 15 Uhr Zeit?')
ok(r.answer && /haben alle Zeit|hat nur|haben .* Zeit/.test(r.answer.text), 'Wer hat Zeit? → beantwortet', r.answer?.text)
r = S('Was ist übermorgen?')
ok(r.answer && /Kinderarzt Vorsorge um 16:00/.test(r.answer.text), 'Was ist übermorgen? → nennt den Kinderarzt', r.answer?.text)
r = S('Wann hat Emma Klavier?')
ok(r.answer && r.answer.kind === 'when' && /Klavierstunde/.test(r.answer.text), 'Wann hat Emma Klavier? → nächster Termin', r.answer?.text)
r = S('Wann ist Emma in der Schule?')
ok(r.answer && /07:45–13:15 in der Schule/.test(r.answer.text), 'Betreuung: Zeiten genannt', r.answer?.text)

console.log('— Handeln')
r = S('Emma Freitag 15 Uhr Schwimmen')
const a = r.actions.find((x) => x.act.type === 'create')
ok(a && a.act.data.member_id === 'emma' && a.act.data.on_date === nextWd(4) && a.act.data.at_time === '15:00' && a.act.data.title === 'Schwimmen', 'Termin direkt eintragbar', a)
r = S('Anne Freitag 15 Uhr Zahnarzt')
ok(/direkt eingetragen|als Anfrage/.test(r.actions[0].sub), 'Outlook-Regel wird vorab angezeigt', r.actions[0]?.sub)
r = S('Milch auf die Liste')
ok(r.actions[0]?.act.type === 'list' && r.actions[0].act.text === 'Milch', 'Liste per Satz')
const ex = explain(P('Emma Freitag 15 Uhr Klavier'), ctx)
ok(ex.some((c) => c.type === 'person' && c.label === 'Emma') && ex.some((c) => c.type === 'time' && c.label === '15:00 Uhr') && ex.some((c) => c.type === 'title'), '„Verstanden“-Zeile nennt Person, Zeit und Titel', ex)

console.log('— Ergänzen')
const vocab = buildVocab(index)
ok(complete('Kla', vocab) === 'vierstunde', 'Tab ergänzt „Kla“ → „Klavierstunde“')
ok(complete('Fuss', vocab) === 'balltraining', 'Ergänzung trotz ß: „Fuss“ → „Fußballtraining“')
ok(complete('Em', vocab) === 'ma', 'Namen werden ergänzt: „Em“ → „Emma“')
ok(complete('Emma ', vocab) === '', 'Nach Leerzeichen keine Ergänzung')

console.log(fails ? `\n${fails} FEHLER` : '\nALLE SUCH-TESTS BESTANDEN')
process.exitCode = fails ? 1 : 0
