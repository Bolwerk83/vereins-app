// Papierlose Ablage im Gedächtnispalast: Dokumente verschlüsselt ablegen,
// steuerrelevante Belege markieren, sortiert wiederfinden, teilen und als ZIP laden.
import React, { useEffect, useRef, useState } from 'react'
import { Icon } from './icons.jsx'
import { uid, iso, fromIso, MONTHS } from './util.js'
import { b64, unb64, encryptBytes, decryptBytes } from './crypto.js'
import { putFile, getFile, delFile, filesWork, keepFiles } from './docstore.js'
import { makeZip } from './zip.js'
import { norm } from './search.js'

/* ================= Ordner und Steuer-Arten ================= */

// Reihenfolge zählt: erst die Themen, dann „Rechnungen“ als Sammelordner
export const ORDNER = [
  { id: 'wohnen', name: 'Wohnen & Energie', icon: 'home', kw: ['miete', 'nebenkosten', 'strom', 'gas', 'wasser', 'heizung', 'grundsteuer', 'handwerker', 'schornstein', 'hausverwaltung'] },
  { id: 'kinder', name: 'Kinder & Schule', icon: 'school', kw: ['kita', 'schule', 'zeugnis', 'kindergarten', 'hort', 'kindergeld', 'elterngeld', 'tagesmutter', 'krippe'] },
  { id: 'gesundheit', name: 'Gesundheit', icon: 'heart', kw: ['arzt', 'apotheke', 'rezept', 'befund', 'krankenkasse', 'zahn', 'brille', 'impf', 'physio'] },
  { id: 'versicherung', name: 'Versicherungen', icon: 'shield', kw: ['versicherung', 'police', 'haftpflicht', 'hausrat', 'riester', 'ruerup'] },
  { id: 'auto', name: 'Auto & Mobilität', icon: 'car', kw: ['kfz', 'auto', 'tuev', 'werkstatt', 'fahrzeug', 'bahncard', 'ticket'] },
  { id: 'arbeit', name: 'Arbeit & Einkommen', icon: 'briefcase', kw: ['gehalt', 'lohn', 'arbeitsvertrag', 'arbeitgeber', 'fortbildung', 'seminar'] },
  { id: 'finanzen', name: 'Bank & Finanzen', icon: 'euro', kw: ['konto', 'bank', 'kredit', 'depot', 'zinsen', 'darlehen', 'kapitalertr'] },
  { id: 'aemter', name: 'Ämter & Steuern', icon: 'landmark', kw: ['finanzamt', 'steuerbescheid', 'bescheid', 'ausweis', 'reisepass', 'urkunde', 'elster', 'meldebescheinigung'] },
  { id: 'vertraege', name: 'Verträge', icon: 'pencil', kw: ['vertrag', 'kuendigung', 'vereinbarung'] },
  { id: 'rechnungen', name: 'Rechnungen & Belege', icon: 'receipt', kw: ['rechnung', 'beleg', 'quittung', 'kassenbon', 'invoice', 'bestellung'] },
  { id: 'sonstiges', name: 'Sonstiges', icon: 'folder', kw: [] },
]

// So, wie es auch in der Steuererklärung sortiert ist
export const STEUER_ARTEN = [
  { id: 'haushalt', name: 'Handwerker & Haushalt', hint: 'Arbeitslohn auf Rechnungen, Haushaltshilfe, Garten – § 35a', kw: ['handwerker', 'reparatur', 'wartung', 'schornstein', 'reinigung', 'garten', 'haushaltshilfe', 'umzug', 'maler', 'installateur'] },
  { id: 'kinder', name: 'Kinderbetreuung', hint: 'Kita, Tagesmutter, Hort, Ferienbetreuung', kw: ['kita', 'kindergarten', 'tagesmutter', 'hort', 'betreuung', 'krippe'] },
  { id: 'werbung', name: 'Arbeit & Werbungskosten', hint: 'Arbeitsmittel, Fortbildung, Fahrtkosten, Homeoffice', kw: ['fortbildung', 'arbeitsmittel', 'fachbuch', 'pendler', 'homeoffice', 'bewerbung', 'seminar', 'gewerkschaft'] },
  { id: 'gesundheit', name: 'Krankheitskosten', hint: 'Zuzahlungen, Brille, Zahnersatz, Medikamente', kw: ['apotheke', 'zahnersatz', 'brille', 'physio', 'zuzahlung', 'hoergeraet'] },
  { id: 'spenden', name: 'Spenden & Beiträge', hint: 'Spendenquittungen, Kirchensteuer, Mitgliedsbeiträge', kw: ['spende', 'zuwendung', 'kirchensteuer', 'mitgliedsbeitrag'] },
  { id: 'vorsorge', name: 'Vorsorge & Versicherung', hint: 'Riester, Rürup, Haftpflicht, Berufsunfähigkeit', kw: ['riester', 'ruerup', 'basisrente', 'berufsunfaehig', 'haftpflicht', 'unfallversicherung'] },
  { id: 'nachweis', name: 'Bescheinigungen & Bescheide', hint: 'Lohnsteuerbescheinigung, Zinsen, Steuerbescheid', kw: ['lohnsteuer', 'steuerbescheid', 'jahressteuer', 'zinsbescheinigung', 'rentenbezug'] },
  { id: 'sonst', name: 'Sonstiges', hint: 'Alles, was sonst noch in die Erklärung gehört', kw: [] },
]

export const ordnerName = (id) => ORDNER.find((o) => o.id === id)?.name || 'Sonstiges'
export const artName = (id) => STEUER_ARTEN.find((a) => a.id === id)?.name || 'Sonstiges'
// Unbekanntes (alte Dokumente, ältere App-Versionen) landet sicher unter „Sonstiges“
const ordOf = (d) => (ORDNER.some((o) => o.id === d.ordner) ? d.ordner : 'sonstiges')
const artOf = (d) => (STEUER_ARTEN.some((a) => a.id === d.steuerArt) ? d.steuerArt : 'sonst')

const MAX_FILE = 25 * 1024 * 1024 // pro Datei, in der Browser-Datenbank
const MAX_INLINE = 1_500_000 // Notlösung ohne Browser-Datenbank

/* ================= Helfer ================= */

const stripExt = (n) => String(n || 'Dokument').replace(/\.[a-z0-9]{2,5}$/i, '')
export const docTitle = (d) => d.title || titleFromName(d.name || 'Dokument', d.date || d.added || iso(new Date()))
export const docDate = (d) => d.date || d.added || iso(new Date())
const extOf = (d) => {
  const m = String(d.name || '').match(/\.([a-z0-9]{2,5})$/i)
  if (m) return m[1].toLowerCase()
  if (d.mime === 'application/pdf') return 'pdf'
  if (d.mime?.startsWith('image/')) return d.mime.slice(6).replace('jpeg', 'jpg')
  return 'bin'
}
export const kindOf = (d) => (d.mime === 'application/pdf' ? 'pdf' : d.mime?.startsWith('image/') ? 'bild' : 'datei')
const MIME = { pdf: 'application/pdf', jpg: 'image/jpeg', jpeg: 'image/jpeg', png: 'image/png', heic: 'image/heic', webp: 'image/webp', txt: 'text/plain', csv: 'text/csv' }
const mimeOf = (file) => file.type || MIME[(String(file.name).match(/\.([a-z0-9]+)$/i) || [])[1]?.toLowerCase()] || 'application/octet-stream'
export const fmtBytes = (n) => (n >= 1048576 ? (n / 1048576).toFixed(1).replace('.', ',') + ' MB' : Math.max(1, Math.round(n / 1024)) + ' KB')
export const euro = (cents) => (cents / 100).toLocaleString('de-DE', { style: 'currency', currency: 'EUR' })
const euroPlain = (cents) => (cents / 100).toFixed(2).replace('.', ',')
export const deDate = (s) => { const x = fromIso(s); return `${x.getDate()}.${x.getMonth() + 1}.${x.getFullYear()}` }
const safeName = (s) => String(s).replace(/[\\/:*?"<>|]+/g, '-').replace(/\s+/g, ' ').trim().slice(0, 80) || 'Dokument'
export const fileNameFor = (d) => `${docDate(d)} ${safeName(docTitle(d))}.${extOf(d)}`

// „189,00“, „1.240,50 €“, „1240.5“ → Cent
export function parseEuro(s) {
  let t = String(s || '').replace(/[€\s]/g, '')
  if (!t) return null
  if (t.includes(',')) t = t.replace(/\./g, '').replace(',', '.')
  const v = parseFloat(t)
  return Number.isFinite(v) && v >= 0 ? Math.round(v * 100) : null
}

// Datum aus dem Dateinamen: 2026-03-12, 20260312, 12.03.2026
const DATE_ISO = /(20\d\d)[-_.]?(0[1-9]|1[0-2])[-_.]?(0[1-9]|[12]\d|3[01])(?!\d)/
const DATE_DE = /(0?[1-9]|[12]\d|3[01])[._-](0?[1-9]|1[0-2])[._-](20\d\d)/
function dateFromName(name) {
  const n = String(name)
  let m = n.match(DATE_ISO)
  if (m) return `${m[1]}-${m[2]}-${m[3]}`
  m = n.match(DATE_DE)
  if (m) return `${m[3]}-${m[2].padStart(2, '0')}-${m[1].padStart(2, '0')}`
  return null
}

// Aus „IMG_20260312_1015.jpg“ wird „Foto vom 12.3.2026“, aus „Rechnung_Heizung_2026-03-12.pdf“
// „Rechnung Heizung“ – das Datum steht ja schon im Datumsfeld
function titleFromName(name, date) {
  const base = stripExt(name)
  if (/^(img|pxl|dsc|photo|foto|scan|image|bild|cam|whatsapp image)[\s_-]*[\d_\s-]*$/i.test(base) || /^\d[\d_\s-]*$/.test(base)) {
    return (/scan/i.test(base) ? 'Scan vom ' : 'Foto vom ') + deDate(date)
  }
  const t = base.replace(DATE_ISO, ' ').replace(DATE_DE, ' ')
    .replace(/[_]+/g, ' ').replace(/\s+-\s+/g, ' – ').replace(/^[\s–-]+|[\s–-]+$/g, '').replace(/\s{2,}/g, ' ').trim()
  return (t || base).replace(/^./, (c) => c.toUpperCase())
}

// Vorschläge aus dem Dateinamen – entscheiden tust du
export function guessFrom(text) {
  const n = norm(text)
  const ordner = ORDNER.find((o) => o.kw.some((k) => n.includes(k)))?.id || null
  for (const a of STEUER_ARTEN) {
    const k = a.kw.find((w) => n.includes(w))
    if (k) return { ordner, steuer: { art: a.id, word: k } }
  }
  return { ordner, steuer: null }
}
const ART_TO_ORDNER = { haushalt: 'wohnen', kinder: 'kinder', werbung: 'arbeit', gesundheit: 'gesundheit', spenden: 'rechnungen', vorsorge: 'versicherung', nachweis: 'aemter' }

// Datei-Inhalt holen und entschlüsseln (alte Dokumente liegen noch im Palast selbst)
export async function loadBytes(doc, key) {
  if (doc.b64) return unb64(doc.b64)
  const rec = await getFile(doc.id)
  if (!rec) throw new Error('fehlt')
  return decryptBytes(key, rec.iv, rec.data)
}

// Speichern: in der Claude-Vorschau über deren Download, sonst klassisch
export async function saveBytes(filename, bytes, mime) {
  if (window.claude?.downloads) {
    await window.claude.downloads.save({ filename, data: bytes })
    return
  }
  const url = URL.createObjectURL(new Blob([bytes], { type: mime }))
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  a.remove()
  setTimeout(() => URL.revokeObjectURL(url), 30000)
}

// Teilen über das Teilen-Menü des Geräts (WhatsApp, Mail, AirDrop, Drucken …)
// 'ok' | 'abgebrochen' | 'nochmal' (Gerät wollte ein frisches Antippen) | 'nicht' (kann es nicht)
async function shareFile(file, title) {
  let can = false
  try { can = !!navigator.canShare?.({ files: [file] }) } catch { can = false }
  if (!can) return 'nicht'
  try {
    await navigator.share({ files: [file], title })
    return 'ok'
  } catch (e) {
    if (e?.name === 'AbortError') return 'abgebrochen'
    return e?.name === 'NotAllowedError' ? 'nochmal' : 'nicht'
  }
}

const isTouch = () => { try { return window.matchMedia('(pointer: coarse)').matches } catch { return false } }
const csvCell = (v) => { const s = String(v ?? ''); return /[;"\n\r]/.test(s) ? '"' + s.replace(/"/g, '""') + '"' : s }

/* ================= Ablegen / Bearbeiten ================= */

function AblegeSheet({ items, existing, onSave, onClose }) {
  const multi = !existing && items.length > 1
  const firstName = existing ? existing.name : items[0].name
  const guess = existing ? null : guessFrom(items.map((i) => i.name).join(' '))
  const startDate = existing ? docDate(existing) : dateFromName(firstName) || iso(new Date(items[0].file.lastModified || Date.now()))
  const thisYear = new Date().getFullYear()
  const [title, setTitle] = useState(() => (existing ? docTitle(existing) : titleFromName(firstName, startDate)))
  const [date, setDate] = useState(startDate)
  const [ordner, setOrdner] = useState(() => existing?.ordner || guess?.ordner || ART_TO_ORDNER[guess?.steuer?.art] || 'sonstiges')
  const [steuer, setSteuer] = useState(() => (existing ? !!existing.steuer : !!guess?.steuer))
  const [jahr, setJahr] = useState(() => existing?.steuerJahr || +startDate.slice(0, 4))
  const [jahrSelbst, setJahrSelbst] = useState(!!existing?.steuerJahr)
  const [art, setArt] = useState(() => existing?.steuerArt || guess?.steuer?.art || 'sonst')
  const [betrag, setBetrag] = useState(existing?.betrag != null ? euroPlain(existing.betrag) : '')
  const [notiz, setNotiz] = useState(existing?.notiz || '')
  const years = [...new Set([thisYear - 1, thisYear, +date.slice(0, 4), jahr])].filter(Boolean).sort()
  const curArt = STEUER_ARTEN.find((a) => a.id === art)

  return (
    <div className="overlay" onClick={(e) => { if (e.target === e.currentTarget) onClose() }}>
      <form className="sheet dk-sheet" onSubmit={(e) => {
        e.preventDefault()
        onSave({
          ...(multi ? {} : { title: title.trim() || titleFromName(firstName, date), date, betrag: parseEuro(betrag) }),
          ordner,
          steuer,
          steuerJahr: steuer ? jahr : null,
          steuerArt: steuer ? art : null,
          notiz: notiz.trim(),
        })
      }}>
        <h3>{existing ? 'Dokument bearbeiten' : multi ? `${items.length} Dokumente ablegen` : 'Dokument ablegen'}
          <button type="button" className="x" onClick={onClose} aria-label="Schließen">✕</button></h3>

        {!existing && (
          <div className="dk-files">
            {items.map((it) => (
              <div className="dk-file" key={it.key}>
                {it.url ? <img src={it.url} alt="" /> : <span className={'dk-type ' + kindOf({ mime: it.mime })}>{extOf({ name: it.name, mime: it.mime }).toUpperCase()}</span>}
                <span className="dk-file-n">{it.name}</span>
                <small>{fmtBytes(it.size)}</small>
              </div>
            ))}
          </div>
        )}

        {!multi && (
          <div className="field">
            <label htmlFor="dk-title">Titel</label>
            <input id="dk-title" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="z. B. Rechnung Heizungswartung" />
          </div>
        )}
        {!multi && (
          <div className="grid2">
            <div className="field">
              <label htmlFor="dk-date">Datum des Dokuments</label>
              <input id="dk-date" type="date" value={date} onChange={(e) => {
                const v = e.target.value
                if (!v) return
                setDate(v)
                if (!jahrSelbst) setJahr(+v.slice(0, 4)) // Steuerjahr folgt dem Datum, bis du es selbst wählst
              }} />
            </div>
            <div className="field">
              <label htmlFor="dk-betrag">Betrag (optional)</label>
              <input id="dk-betrag" inputMode="decimal" value={betrag} onChange={(e) => setBetrag(e.target.value)} placeholder="0,00 €" />
            </div>
          </div>
        )}

        <div className="field">
          <label>Ordner</label>
          <div className="dk-pick" role="radiogroup" aria-label="Ordner">
            {ORDNER.map((o) => (
              <button type="button" key={o.id} role="radio" aria-checked={ordner === o.id}
                className={'chip' + (ordner === o.id ? ' brand' : '')} onClick={() => setOrdner(o.id)}>
                <Icon name={o.icon} size={14} />{o.name}
              </button>
            ))}
          </div>
        </div>

        <div className={'dk-tax' + (steuer ? ' on' : '')}>
          <div className="dk-tax-q">
            <span className="rowico warn"><Icon name="steuer" size={18} /></span>
            <div className="dk-tax-t">
              <b>Steuerrelevant?</b>
              <small>{guess?.steuer && steuer
                ? `Vorschlag, weil „${guess.steuer.word.replace(/^./, (c) => c.toUpperCase())}“ im Namen steht`
                : 'Landet dann im Steuerordner – fertig sortiert fürs Finanzamt'}</small>
            </div>
            <div className="themeseg" role="group" aria-label="Steuerrelevant">
              <button type="button" className={!steuer ? 'on' : ''} aria-pressed={!steuer} onClick={() => setSteuer(false)}>Nein</button>
              <button type="button" className={steuer ? 'on' : ''} aria-pressed={steuer} onClick={() => setSteuer(true)}>Ja</button>
            </div>
          </div>
          {steuer && (
            <div className="dk-tax-more">
              <div className="dk-sublabel">Steuerjahr</div>
              <div className="dk-pick" role="radiogroup" aria-label="Steuerjahr">
                {years.map((y) => (
                  <button type="button" key={y} role="radio" aria-checked={jahr === y}
                    className={'chip' + (jahr === y ? ' brand' : '')} onClick={() => { setJahr(y); setJahrSelbst(true) }}>{y}</button>
                ))}
              </div>
              <div className="dk-sublabel">Wofür?</div>
              <div className="dk-pick" role="radiogroup" aria-label="Steuer-Art">
                {STEUER_ARTEN.map((a) => (
                  <button type="button" key={a.id} role="radio" aria-checked={art === a.id}
                    className={'chip' + (art === a.id ? ' brand' : '')} onClick={() => setArt(a.id)}>{a.name}</button>
                ))}
              </div>
              {curArt?.hint && <p className="hint" style={{ marginTop: 8 }}>{curArt.hint}</p>}
            </div>
          )}
        </div>

        <div className="field">
          <label htmlFor="dk-notiz">Notiz (optional)</label>
          <input id="dk-notiz" value={notiz} onChange={(e) => setNotiz(e.target.value)} placeholder="z. B. bezahlt am 15.3., Garantie bis 2028" />
        </div>
        <button className="btn" style={{ width: '100%' }}>
          <Icon name={existing ? 'check' : 'lock'} size={16} />
          {existing ? 'Speichern' : multi ? `${items.length} Dokumente verschlüsselt ablegen` : 'Verschlüsselt ablegen'}
        </button>
        {!existing && <p className="hint">Wird auf diesem Gerät verschlüsselt – ohne dein Gedächtnis-Passwort ist die Datei unlesbar.</p>}
      </form>
    </div>
  )
}

/* ================= Detailansicht ================= */

function DocSheet({ doc, cryptoKey, onClose, onEdit, onDelete, onMarkSteuer, toast }) {
  const [bytes, setBytes] = useState(null)
  const [missing, setMissing] = useState(false)
  const [url, setUrl] = useState(null)
  const touch = isTouch()

  useEffect(() => {
    let alive = true
    let u = null
    loadBytes(doc, cryptoKey)
      .then((b) => {
        if (!alive) return
        setBytes(b)
        if (kindOf(doc) === 'bild') { u = URL.createObjectURL(new Blob([b], { type: doc.mime })); setUrl(u) }
      })
      .catch(() => { if (alive) setMissing(true) })
    return () => { alive = false; if (u) URL.revokeObjectURL(u) }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [doc.id])

  async function download() {
    if (!bytes) return
    try {
      await saveBytes(fileNameFor(doc), bytes, doc.mime)
      toast('Gespeichert ✓ – als „' + fileNameFor(doc) + '“')
    } catch (e) {
      toast(e?.code === 'declined' ? 'Speichern abgebrochen' : 'Speichern hier nicht möglich')
    }
  }
  async function share() {
    if (!bytes) return
    const r = await shareFile(new File([bytes], fileNameFor(doc), { type: doc.mime }), docTitle(doc))
    if (r === 'nicht' || r === 'nochmal') {
      await download()
      toast('Teilen geht in diesem Browser nicht – die Datei ist gespeichert und kann angehängt werden')
    }
  }

  const facts = [
    ['Ordner', ordnerName(doc.ordner)],
    ['Datum', deDate(docDate(doc))],
    ['Steuer', doc.steuer ? `Ja · ${doc.steuerJahr} · ${artName(doc.steuerArt)}` : null],
    ['Betrag', doc.betrag != null ? euro(doc.betrag) : null],
    ['Notiz', doc.notiz || null],
    ['Datei', `${doc.name} · ${fmtBytes(doc.size)}`],
    ['Abgelegt', doc.added ? deDate(doc.added) : null],
  ].filter(([, v]) => v)

  const shareBtn = <button type="button" className={'btn' + (touch ? '' : ' ghost')} onClick={share} disabled={!bytes}><Icon name="share" size={16} />Teilen</button>
  const loadBtn = <button type="button" className={'btn' + (touch ? ' ghost' : '')} onClick={download} disabled={!bytes}><Icon name="download" size={16} />Herunterladen</button>

  return (
    <div className="overlay" onClick={(e) => { if (e.target === e.currentTarget) onClose() }}>
      <div className="sheet dk-sheet" role="dialog" aria-label={docTitle(doc)}>
        <h3>{docTitle(doc)}<button type="button" className="x" onClick={onClose} aria-label="Schließen">✕</button></h3>
        {url
          ? <img className="dk-preview" src={url} alt={docTitle(doc)} />
          : (
            <div className="dk-card">
              <span className={'dk-type big ' + kindOf(doc)}>{extOf(doc).toUpperCase()}</span>
              <div>
                <b>{fileNameFor(doc)}</b>
                <small>{missing ? 'Die Datei liegt nicht auf diesem Gerät (nur die Angaben wurden synchronisiert).' : bytes ? 'Entschlüsselt – bereit zum Teilen und Speichern' : 'Wird entschlüsselt …'}</small>
              </div>
            </div>
          )}
        <div className="dk-acts">{touch ? <>{shareBtn}{loadBtn}</> : <>{loadBtn}{shareBtn}</>}</div>
        <div className="card dk-facts">
          {facts.map(([k, v]) => <div className="fact" key={k}><b>{k}</b><span>{v}</span></div>)}
          {!doc.steuer && (
            <button type="button" className="row dk-mark" onClick={onMarkSteuer}>
              <span className="rowico warn"><Icon name="steuer" size={16} /></span>
              <div className="row-main"><div className="row-title">Als steuerrelevant markieren</div><div className="row-meta">Kommt in den Steuerordner {+docDate(doc).slice(0, 4)}</div></div>
            </button>
          )}
        </div>
        <div className="dk-acts">
          <button type="button" className="btn ghost" onClick={onEdit}><Icon name="pencil" size={16} />Bearbeiten</button>
          <button type="button" className="btn ghost dk-del" onClick={onDelete}><Icon name="trash" size={16} />In den Papierkorb</button>
        </div>
      </div>
    </div>
  )
}

/* ================= Die Ablage ================= */

export function Ablage({ docs, cryptoKey, onDocsChange, toast, ownerName, openId, setOpenId }) {
  const [view, setView] = useState('alle') // alle | steuer | papierkorb
  const [year, setYear] = useState('alle')
  const [ordnerF, setOrdnerF] = useState(null)
  const [pending, setPending] = useState(null) // ausgewählte Dateien, die abgelegt werden sollen
  const [editId, setEditId] = useState(null)
  const [drag, setDrag] = useState(false)
  const [packed, setPacked] = useState(null) // fertig gepacktes ZIP { key, blob, name }
  const [busy, setBusy] = useState(false)
  const input = useRef()

  const live = docs.filter((d) => !d.deleted)
  const trash = docs.filter((d) => d.deleted)
  const effView = view === 'papierkorb' && !trash.length ? 'alle' : view
  const base = effView === 'papierkorb' ? trash : effView === 'steuer' ? live.filter((d) => d.steuer) : live
  const yearOf = (d) => (effView === 'steuer' ? d.steuerJahr : +docDate(d).slice(0, 4))
  const years = [...new Set(base.map(yearOf))].filter(Boolean).sort((a, b) => b - a)
  // Gibt es nur ein Jahr, ist das automatisch gemeint (Titel, ZIP-Name, Summen)
  const effYear = years.includes(year) ? year : years.length === 1 ? years[0] : 'alle'
  const inYear = base.filter((d) => effYear === 'alle' || yearOf(d) === effYear)
  const ordCounts = ORDNER.map((o) => ({ o, n: inYear.filter((d) => ordOf(d) === o.id).length })).filter((x) => x.n)
  const effOrdner = ordCounts.some((x) => x.o.id === ordnerF) ? ordnerF : null
  const list = inYear
    .filter((d) => !effOrdner || ordOf(d) === effOrdner)
    .sort((a, b) => docDate(b).localeCompare(docDate(a)) || String(b.added || '').localeCompare(String(a.added || '')))
  const listKey = [effView, effYear, effOrdner, list.map((d) => d.id).join(',')].join('|')
  const sum = list.reduce((a, d) => a + (d.betrag || 0), 0)
  const hasSum = list.some((d) => d.betrag != null)
  const totalSize = live.reduce((a, d) => a + (d.size || 0), 0)
  const steuerCount = live.filter((d) => d.steuer).length

  function choose(fileList) {
    const files = [...fileList]
    if (!files.length) return
    const tooBig = files.filter((f) => f.size > MAX_FILE)
    const ok = files.filter((f) => f.size <= MAX_FILE)
    if (tooBig.length) toast(`${tooBig.map((f) => f.name).join(', ')}: zu groß (höchstens 25 MB pro Datei)`)
    if (!ok.length) return
    setPending(ok.map((file) => ({
      key: uid(), file, name: file.name, size: file.size, mime: mimeOf(file),
      url: mimeOf(file).startsWith('image/') ? URL.createObjectURL(file) : null,
    })))
  }
  function closePending() {
    pending?.forEach((it) => it.url && URL.revokeObjectURL(it.url))
    setPending(null)
  }

  async function store(meta) {
    const items = pending
    closePending()
    setBusy(true)
    const idb = await filesWork()
    const added = []
    const skipped = []
    try {
      for (const it of items) {
        const bytes = new Uint8Array(await it.file.arrayBuffer())
        const date = items.length > 1 ? dateFromName(it.name) || iso(new Date(it.file.lastModified || Date.now())) : meta.date
        const doc = {
          id: uid(), name: it.name, mime: it.mime, size: it.size, added: iso(new Date()),
          ...meta, date, title: items.length > 1 ? titleFromName(it.name, date) : meta.title,
        }
        let saved = false
        if (idb) {
          try { await putFile(doc.id, await encryptBytes(cryptoKey, bytes)); doc.stored = 'idb'; saved = true } catch { /* Platz voll? → Notlösung unten */ }
        }
        if (!saved && it.size <= MAX_INLINE) { doc.b64 = b64(bytes); saved = true }
        if (saved) added.push(doc); else skipped.push(it.name)
      }
    } finally {
      setBusy(false)
    }
    if (added.length) {
      onDocsChange((cur) => [...added, ...cur])
      keepFiles()
      const st = added.filter((d) => d.steuer).length
      toast(`${added.length === 1 ? '„' + added[0].title + '“ abgelegt' : added.length + ' Dokumente abgelegt'} ✓ – verschlüsselt${st ? ' · im Steuerordner ' + added[0].steuerJahr : ''}`)
    }
    if (skipped.length) toast(`Nicht gespeichert (kein Platz im Browser): ${skipped.join(', ')}`)
  }

  const update = (id, patch) => onDocsChange((cur) => cur.map((d) => (d.id === id ? { ...d, ...patch } : d)))

  async function pack() {
    setBusy(true)
    try {
      const files = []
      const used = new Set()
      const rows = [['Datum', 'Titel', 'Ordner', 'Steuerrelevant', 'Steuerjahr', 'Steuer-Art', 'Betrag (EUR)', 'Datei im ZIP', 'Notiz']]
      let missing = 0
      // Im ZIP und in der Übersicht zeitlich aufsteigend – so liest man Belege
      const ordered = [...list].sort((a, b) => docDate(a).localeCompare(docDate(b)))
      for (const d of ordered) {
        let bytes
        try { bytes = await loadBytes(d, cryptoKey) } catch { missing++; continue }
        const folder = effView === 'steuer'
          ? (effYear === 'alle' ? d.steuerJahr + '/' : '') + artName(artOf(d))
          : ordnerName(ordOf(d))
        let path = `${folder}/${fileNameFor(d)}`
        for (let k = 2; used.has(path); k++) path = `${folder}/${fileNameFor(d).replace(/(\.[a-z0-9]+)$/i, ` (${k})$1`)}`
        used.add(path)
        files.push({ name: path, data: bytes, date: fromIso(docDate(d)) })
        rows.push([deDate(docDate(d)), docTitle(d), ordnerName(ordOf(d)), d.steuer ? 'ja' : 'nein', d.steuer ? d.steuerJahr : '', d.steuer ? artName(artOf(d)) : '', d.betrag != null ? euroPlain(d.betrag) : '', path, d.notiz || ''])
      }
      if (hasSum) rows.push(['', 'Summe', '', '', '', '', euroPlain(sum), '', ''])
      const csv = '﻿' + rows.map((r) => r.map(csvCell).join(';')).join('\r\n') + '\r\n'
      files.unshift({ name: 'Übersicht.csv', data: new TextEncoder().encode(csv) })
      const label = effView === 'steuer'
        ? `Steuer ${effYear === 'alle' ? 'alle Jahre' : effYear}`
        : `Dokumente${effOrdner ? ' ' + ordnerName(effOrdner).replace(/ & /g, ' und ') : ''}${effYear !== 'alle' ? ' ' + effYear : ''}`
      const name = safeName(`${label} – ${ownerName}`) + '.zip'
      const blob = makeZip(files)
      if (missing) toast(`${missing} Datei${missing > 1 ? 'en liegen' : ' liegt'} nicht auf diesem Gerät und fehlt im ZIP`)
      const result = { key: listKey, blob, name, count: files.length - 1 }
      setPacked(result)
      return result
    } finally {
      setBusy(false)
    }
  }
  async function zipDownload() {
    const p = packed?.key === listKey ? packed : await pack()
    try {
      await saveBytes(p.name, new Uint8Array(await p.blob.arrayBuffer()), 'application/zip')
      toast(`${p.count} Dokument${p.count === 1 ? '' : 'e'} als ZIP gespeichert ✓ – mit Übersicht.csv`)
    } catch (e) {
      toast(e?.code === 'declined' ? 'Speichern abgebrochen' : 'Speichern hier nicht möglich')
    }
  }
  async function zipShare() {
    const fresh = packed?.key !== listKey
    const p = fresh ? await pack() : packed
    const r = await shareFile(new File([p.blob], p.name, { type: 'application/zip' }), p.name)
    // Manche Geräte erlauben das Teilen nur direkt nach dem Antippen – nach dem Packen also nochmal
    if (r === 'nochmal' && fresh) toast('ZIP ist gepackt – tipp nochmal auf „Teilen“')
    else if (r === 'nicht' || r === 'nochmal') { await zipDownload(); toast('Teilen geht in diesem Browser nicht – das ZIP ist gespeichert') }
  }

  // Gruppen: im Steuerordner nach Art (wie in der Erklärung), sonst nach Monat
  const groups = []
  for (const d of list) {
    let key
    let label
    let order = 0
    if (effView === 'steuer') {
      const ai = STEUER_ARTEN.findIndex((a) => a.id === artOf(d))
      key = (effYear === 'alle' ? d.steuerJahr + '|' : '') + ai
      label = (effYear === 'alle' ? d.steuerJahr + ' · ' : '') + artName(artOf(d))
      order = -(d.steuerJahr || 0) * 100 + ai // neuestes Jahr zuerst, darin die Reihenfolge der Erklärung
    } else {
      key = docDate(d).slice(0, 7)
      label = `${MONTHS[+key.slice(5, 7) - 1]} ${key.slice(0, 4)}`
    }
    let g = groups.find((x) => x.key === key)
    if (!g) { g = { key, label, order, docs: [] }; groups.push(g) }
    g.docs.push(d)
  }
  if (effView === 'steuer') groups.sort((a, b) => a.order - b.order)

  const openDoc = docs.find((d) => d.id === openId)
  const editDoc = docs.find((d) => d.id === editId)

  return (
    <div className={'on-wide dk' + (drag ? ' drag' : '')}
      onDragOver={(e) => { if ([...(e.dataTransfer?.types || [])].includes('Files')) { e.preventDefault(); setDrag(true) } }}
      onDragLeave={(e) => { if (!e.currentTarget.contains(e.relatedTarget)) setDrag(false) }}
      onDrop={(e) => { e.preventDefault(); setDrag(false); choose(e.dataTransfer?.files || []) }}>

      <div className="dk-top">
        <div className="dk-head">
          <h3>Dokumente</h3>
          <p>{live.length ? `${live.length} Dokument${live.length === 1 ? '' : 'e'} · ${fmtBytes(totalSize)} · verschlüsselt auf diesem Gerät` : 'Papierlos ablegen – verschlüsselt auf diesem Gerät'}</p>
        </div>
        <button type="button" className="btn" onClick={() => input.current?.click()} disabled={busy}>
          <Icon name="upload" size={17} />{busy ? 'Moment …' : 'Ablegen'}
        </button>
        <input ref={input} type="file" multiple accept="image/*,application/pdf,.pdf,.doc,.docx,.odt,.xls,.xlsx,.ods,.txt,.csv" style={{ display: 'none' }}
          onChange={(e) => { choose(e.target.files || []); e.target.value = '' }} aria-label="Dokumente auswählen" />
      </div>

      {live.length + trash.length > 0 && (
        <div className="dk-filter">
          <div className="themeseg" role="group" aria-label="Ansicht">
            <button type="button" className={effView === 'alle' ? 'on' : ''} onClick={() => setView('alle')}>Alle <span className="dk-n">{live.length}</span></button>
            <button type="button" className={effView === 'steuer' ? 'on' : ''} onClick={() => setView('steuer')}><Icon name="steuer" size={15} />Steuer <span className="dk-n">{steuerCount}</span></button>
            {trash.length > 0 && <button type="button" className={effView === 'papierkorb' ? 'on' : ''} onClick={() => setView('papierkorb')}><Icon name="trash" size={15} /><span className="dk-n">{trash.length}</span></button>}
          </div>
          {years.length > 1 && (
            <select className="dk-year" value={effYear} onChange={(e) => setYear(e.target.value === 'alle' ? 'alle' : +e.target.value)} aria-label={effView === 'steuer' ? 'Steuerjahr' : 'Jahr'}>
              <option value="alle">{effView === 'steuer' ? 'Alle Steuerjahre' : 'Alle Jahre'}</option>
              {years.map((y) => <option key={y} value={y}>{y}</option>)}
            </select>
          )}
        </div>
      )}

      {effView !== 'papierkorb' && ordCounts.length > 1 && (
        <div className="dk-chips">
          {ordCounts.map(({ o, n }) => (
            <button type="button" key={o.id} className={'chip' + (effOrdner === o.id ? ' brand' : '')} aria-pressed={effOrdner === o.id}
              onClick={() => setOrdnerF(effOrdner === o.id ? null : o.id)}>
              <Icon name={o.icon} size={14} />{o.name}<span className="dk-n">{n}</span>
            </button>
          ))}
        </div>
      )}

      {effView === 'steuer' && list.length > 0 && (
        <div className="dk-sum">
          <div className="dk-sum-h">
            <span className="rowico warn"><Icon name="steuer" size={18} /></span>
            <div>
              <b>Steuerordner {effYear === 'alle' ? '– alle Jahre' : effYear}</b>
              <small>{list.length} Beleg{list.length === 1 ? '' : 'e'}{hasSum ? ' · ' + euro(sum) : ''}{effOrdner ? ' · ' + ordnerName(effOrdner) : ''}</small>
            </div>
          </div>
          {effYear === 'alle' && years.length > 1
            ? (
              <div className="dk-sum-rows">
                {years.map((y) => {
                  const ds = list.filter((d) => d.steuerJahr === y)
                  const s = ds.reduce((a, d) => a + (d.betrag || 0), 0)
                  return (
                    <button type="button" className="dk-sum-row" key={y} onClick={() => setYear(y)}>
                      <span>{y}</span><span className="dk-n">{ds.length}</span><b>{s ? euro(s) : '–'}</b>
                    </button>
                  )
                })}
              </div>
            )
            : (
              <div className="dk-sum-rows">
                {STEUER_ARTEN.map((a) => {
                  const ds = list.filter((d) => artOf(d) === a.id)
                  if (!ds.length) return null
                  const s = ds.reduce((x, d) => x + (d.betrag || 0), 0)
                  return (
                    <div className="dk-sum-row" key={a.id} style={{ '--w': hasSum && sum ? (s / sum) * 100 + '%' : '0%' }}>
                      <span>{a.name}</span><span className="dk-n">{ds.length}</span><b>{s ? euro(s) : '–'}</b>
                    </div>
                  )
                })}
              </div>
            )}
          <div className="dk-acts">
            <button type="button" className="btn" onClick={zipDownload} disabled={busy}><Icon name="download" size={16} />Steuerordner als ZIP</button>
            <button type="button" className="btn ghost" onClick={zipShare} disabled={busy}><Icon name="share" size={16} />Teilen</button>
          </div>
          <p className="hint" style={{ marginTop: 10 }}>Im ZIP: alle Belege sortiert nach Art, dazu eine Übersicht.csv mit Datum, Betrag und Summe – fertig für Steuerberatung oder ELSTER.</p>
        </div>
      )}

      <div className="card dk-list">
        {groups.map((g) => (
          <React.Fragment key={g.key}>
            <div className="dk-group">{g.label}<span>{g.docs.length}</span></div>
            {g.docs.map((d) => {
              const inner = (
                <>
                  <span className={'dk-type ' + kindOf(d)}>{extOf(d).toUpperCase().slice(0, 4)}</span>
                  <div className="row-main">
                    <div className="row-title">{docTitle(d)}</div>
                    <div className="row-meta">
                      {ordnerName(ordOf(d))} · {deDate(docDate(d))}<span className="dk-size"> · {fmtBytes(d.size)}</span>{d.notiz ? ' · ' + d.notiz : ''}
                    </div>
                  </div>
                  <span className="dk-right">
                    {d.betrag != null && <span className="dk-amt">{euro(d.betrag)}</span>}
                    {d.steuer && <span className="chip honey dk-badge" title={`Steuerrelevant · ${d.steuerJahr} · ${artName(artOf(d))}`}><Icon name="steuer" size={12} />{d.steuerJahr}</span>}
                  </span>
                </>
              )
              return (
              <div className="row-wrap" key={d.id}>
                {effView === 'papierkorb'
                  ? <div className="row dk-row">{inner}</div>
                  : <button type="button" className="row dk-row" onClick={() => setOpenId(d.id)}>{inner}<span className="chev">›</span></button>}
                {effView === 'papierkorb' && (
                  <div className="dk-trash-acts">
                    <button type="button" className="btn sm" onClick={() => { update(d.id, { deleted: null }); toast('Wiederhergestellt ✓') }}>Wiederherstellen</button>
                    <button type="button" className="btn sm danger" onClick={() => {
                      onDocsChange((cur) => cur.filter((x) => x.id !== d.id))
                      delFile(d.id).catch(() => {})
                      toast('Endgültig gelöscht')
                    }}>Endgültig löschen</button>
                  </div>
                )}
              </div>
              )
            })}
          </React.Fragment>
        ))}
        {!list.length && (
          <div className="dk-empty">
            <span className="rowico"><Icon name={effView === 'steuer' ? 'steuer' : 'folder'} size={20} /></span>
            <div>
              <b>{effView === 'steuer' ? 'Noch keine steuerrelevanten Belege' : effView === 'papierkorb' ? 'Papierkorb ist leer' : 'Papierlos ab heute'}</b>
              <p>{effView === 'steuer'
                ? 'Beim Ablegen einfach „Steuerrelevant: Ja“ wählen – oder ein vorhandenes Dokument öffnen und markieren.'
                : 'Rechnung fotografieren, Scan oder PDF wählen – oder hierher ziehen. Eselsohr legt alles verschlüsselt ab und merkt sich, was für die Steuer zählt.'}</p>
              {effView !== 'papierkorb' && <button type="button" className="btn sm" onClick={() => input.current?.click()}><Icon name="upload" size={15} />Erstes Dokument ablegen</button>}
            </div>
          </div>
        )}
      </div>

      {effView === 'alle' && list.length > 1 && (
        <div className="dk-bulk">
          <span>{list.length} Dokumente{effOrdner ? ' in „' + ordnerName(effOrdner) + '“' : ''}{effYear !== 'alle' ? ' aus ' + effYear : ''}</span>
          <button type="button" className="btn sm ghost" onClick={zipDownload} disabled={busy}><Icon name="download" size={15} />Als ZIP</button>
          <button type="button" className="btn sm ghost" onClick={zipShare} disabled={busy}><Icon name="share" size={15} />Teilen</button>
        </div>
      )}
      {effView === 'papierkorb' && <p className="hint">Gelöschte Dokumente bleiben 30 Tage hier – danach räumt Eselsohr sie endgültig weg.</p>}
      {drag && <div className="dk-drop" aria-hidden="true"><Icon name="upload" size={28} />Loslassen zum Ablegen</div>}

      {pending && <AblegeSheet items={pending} onSave={store} onClose={closePending} />}
      {editDoc && (
        <AblegeSheet items={[]} existing={editDoc} onClose={() => setEditId(null)}
          onSave={(meta) => { update(editDoc.id, meta); setEditId(null); toast('Gespeichert ✓') }} />
      )}
      {openDoc && !editDoc && (
        <DocSheet doc={openDoc} cryptoKey={cryptoKey} toast={toast} onClose={() => setOpenId(null)}
          onEdit={() => { setEditId(openDoc.id); setOpenId(null) }}
          onMarkSteuer={() => {
            const g = guessFrom(docTitle(openDoc) + ' ' + openDoc.name)
            update(openDoc.id, { steuer: true, steuerJahr: +docDate(openDoc).slice(0, 4), steuerArt: g.steuer?.art || 'sonst' })
            toast(`Im Steuerordner ${docDate(openDoc).slice(0, 4)} ✓ – unter „Bearbeiten“ genauer einordnen`)
          }}
          onDelete={() => {
            update(openDoc.id, { deleted: iso(new Date()) })
            setOpenId(null)
            toast('In den Papierkorb gelegt – 30 Tage wiederherstellbar')
          }} />
      )}
    </div>
  )
}
