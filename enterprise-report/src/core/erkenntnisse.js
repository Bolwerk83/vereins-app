// =========================================================================
//  AUTOMATISCHE ERKENNTNISSE — regelbasierte „KI"-Analyse je Datensatz.
//  Verdichtet Plausi-Befunde + fachliche Heuristiken zu kurzen Aussagen.
//  (Deterministisch/erklärbar; später durch ein echtes Modell ersetzbar.)
// =========================================================================
const r1 = (n) => Math.round(n * 10) / 10

export function erkenntnisse(typ, row) {
  const out = []
  const add = (art, text) => out.push({ art, text }) // art: positiv | risiko | hinweis

  // 1) Aus den Plausi-Befunden ableiten
  for (const b of (row.befunde || [])) add(b.schwere === 'fehler' ? 'risiko' : b.schwere === 'warnung' ? 'risiko' : 'hinweis', b.text)

  // 2) Fachliche Heuristiken je Listentyp
  if (typ === 'artikel') {
    if (typeof row.margePct === 'number') {
      if (row.margePct >= 40) add('positiv', `Überdurchschnittliche Marge (${r1(row.margePct)} %) — Preissetzung hält.`)
      else if (row.margePct < 10) add('risiko', `Margenschwach (${r1(row.margePct)} %) — EK/VK prüfen.`)
    }
    if (row.lbVerf < 0) add('risiko', `Verfügbarer Bestand negativ (${row.lbVerf}) — Überverkauf/Nachschub klären.`)
    if (row.gesp > 0) add('hinweis', `${row.gesp} Stk gesperrt — bindet Kapital, QS-Klärung anstoßen.`)
  }
  if (typ === 'kunde' && row.kreditlimit > 0) {
    const ausl = r1(row.offeneForderung / row.kreditlimit * 100)
    if (ausl >= 100) add('risiko', `Kreditlimit zu ${ausl} % ausgeschöpft — Liefersperre prüfen.`)
    else if (ausl >= 70) add('hinweis', `Kreditausschöpfung ${ausl} % — beobachten.`)
  }
  if (typ === 'leasing' && row.fuehrend) add('hinweis', `Führender Beleg: ${row.fuehrend} — Wert wird einfach gezählt (keine Dublette).`)
  if (typ === 'offeneposten' && row.mahnstufe >= 1 && !row.bezahltAm) add('risiko', `Mahnstufe ${row.mahnstufe} — Zahlungseingang aktiv nachhalten.`)
  if (typ === 'auftragsbestand' && row.offen > 0) add('hinweis', `${row.offen} Stk offen (Wert ${row.wert}) — Liefertermin im Blick behalten.`)
  if (typ === 'lieferant' && row.reklamationsQuote > 5) add('risiko', `Reklamationsquote ${r1(row.reklamationsQuote)} % — Lieferantengespräch empfohlen.`)
  if (typ === 'inventur' && row.differenz !== 0) add(Math.abs(row.differenz) > 1 ? 'risiko' : 'hinweis', `Inventurdifferenz ${row.differenz > 0 ? '+' : ''}${row.differenz} Stk (${row.wertDifferenz} €).`)
  if (typ === 'rechnung' && row.bezahlt === false) add('hinweis', 'Rechnung noch offen — Zahlungsziel überwachen.')

  // 3) Generisch: auffällige negative Beträge
  for (const k of ['wert', 'betrag', 'ue', 'marge', 'lbVerf']) {
    if (typeof row[k] === 'number' && row[k] < 0 && !out.some((o) => o.text.includes('negativ'))) { add('hinweis', `Negativer Wert in „${k}" (${row[k]}) — bewusst (Gutschrift/Storno)?`); break }
  }

  if (out.length === 0) add('positiv', 'Keine Auffälligkeiten erkannt — Datensatz unauffällig.')
  return out
}
