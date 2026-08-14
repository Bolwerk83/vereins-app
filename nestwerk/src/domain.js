// Fachliches: Termin-Typen, Module, Dokument-Vorlagen
const PTYPES = ['Nachsorge', 'Vorsorge', 'Beratung', 'Kursstunde', 'Wochenbettbesuch', 'Sonstiges']

// Module: werden pro Mitglied auf dem eigenen Profil hinzugefügt.
// Grundsatz: nicht mehr Infos als nötig – Details sieht nur, wem das Modul gehört.
const MODULES = [
  {
    id: 'praxis', ico: 'heart', name: 'Praxis',
    desc: 'Klientinnen, Termin-Typen mit Soll/Ist-Zeiten, Dokumente aus Vorlagen.',
    privacy: 'Die Familie sieht nur „Praxis · belegt“ – keine Namen, keine Details.',
  },
  {
    id: 'verein', ico: 'trophy', name: 'Vereins-App',
    desc: 'Trainings, Spiele und Turniere automatisch im Familienkalender – immer aktuell.',
    privacy: 'Ohne Passwort, nur lesend über den Vereinszugang.',
  },
  {
    id: 'arbeit', ico: 'briefcase', name: 'Arbeitskalender',
    desc: 'Arbeitstermine per .ics-Import aus Outlook/Office365.',
    privacy: 'Die Familie sieht nur „Arbeit“ als belegte Zeit – keine Betreffe.',
  },
  {
    id: 'sport', ico: 'activity', name: 'Sport',
    desc: 'Deine Sporteinheiten fest einplanen – Wochenziel, Serien, Wochenüberblick.',
    privacy: 'Dein Ziel und dein Stand gehören dir – die Familie sieht nur die Termine.',
  },
  {
    id: 'connect', ico: 'link', name: 'Anbindungen',
    desc: 'Andere Programme mit deinen Daten verbinden – Outlook, Excel, Kalender-Export.',
    privacy: 'Exporte enthalten nur, was du selbst sehen darfst.',
  },
]
const hasMod = (m, id) => !!(m?.modules && m.modules[id])

const VORLAGEN = [
  {
    id: 'bescheinigung',
    name: 'Bescheinigung über Termine',
    text: 'Bescheinigung\n\nHiermit bestätige ich, dass bei {name}, {adresse}, im Zeitraum vom {von} bis {bis} insgesamt {anzahl} Termine ({typen}) mit einer Gesamtdauer von {gesamt} Minuten stattgefunden haben.\n\n{heute}\n\n____________________\n{ich}',
  },
  {
    id: 'anschreiben',
    name: 'Anschreiben an Klientin',
    text: 'Liebe {vorname},\n\nvielen Dank für dein Vertrauen. Anbei die besprochenen Unterlagen.\n\nUnser nächster Termin: bitte kurz bestätigen.\n\nHerzliche Grüße\n{ich}\n{heute}',
  },
]

function fillVorlage(tpl, klient, termine, meName) {
  const done = termine.filter((t) => t.ist)
  const dates = termine.map((t) => t.on_date).sort()
  const d = new Date()
  const heute = `${d.getDate()}.${d.getMonth() + 1}.${d.getFullYear()}`
  const fmt = (s) => (s ? `${+s.slice(8, 10)}.${+s.slice(5, 7)}.${s.slice(0, 4)}` : '—')
  return tpl.text
    .replaceAll('{name}', klient.name)
    .replaceAll('{vorname}', klient.name.split(' ')[0])
    .replaceAll('{adresse}', klient.adresse || '—')
    .replaceAll('{telefon}', klient.telefon || '—')
    .replaceAll('{anzahl}', String(termine.length))
    .replaceAll('{typen}', [...new Set(termine.map((t) => t.ptype))].join(', ') || '—')
    .replaceAll('{gesamt}', String(done.reduce((a, t) => a + (+t.ist || 0), 0)))
    .replaceAll('{von}', fmt(dates[0]))
    .replaceAll('{bis}', fmt(dates[dates.length - 1]))
    .replaceAll('{heute}', heute)
    .replaceAll('{ich}', meName)
}

// Datei an den Nutzer übergeben (Artifact-Viewer, Browser-Download oder Zwischenablage)
async function saveTextFile(filename, text, toast) {
  try { await navigator.clipboard?.writeText(text) } catch { /* Zwischenablage gesperrt */ }
  if (window.claude?.downloads) {
    try {
      await window.claude.downloads.save({ filename, data: text })
      toast('Gespeichert ✓ (und in die Zwischenablage kopiert)')
      return
    } catch (e) {
      toast(e?.code === 'declined' ? 'Speichern abgebrochen – Text liegt in der Zwischenablage' : 'In die Zwischenablage kopiert ✓')
      return
    }
  }
  try {
    const a = document.createElement('a')
    a.href = URL.createObjectURL(new Blob([text], { type: 'text/plain' }))
    a.download = filename
    a.click()
    toast('Als Datei gespeichert ✓')
  } catch {
    toast('In die Zwischenablage kopiert ✓')
  }
}

export { PTYPES, MODULES, hasMod, VORLAGEN, fillVorlage }
