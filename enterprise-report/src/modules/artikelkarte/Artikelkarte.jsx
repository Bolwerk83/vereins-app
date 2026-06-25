import { useState } from 'react'
import { katalog, artikelKarte } from '../../core/artikelkarte.js'
import ExecKopf, { ampelVon } from '../../components/ExecKopf.jsx'

const TABS = [
  { id: 'journey',     label: 'Journey'      },
  { id: 'verkauf',     label: 'Verkauf'       },
  { id: 'preis',       label: 'Preise'        },
  { id: 'lager',       label: 'Lager'         },
  { id: 'produktion',  label: 'Produktion'    },
  { id: 'marketing',   label: 'Marketing'     },
  { id: 'bewertungen', label: 'Bewertungen'   },
  { id: 'folgeartikel',label: 'Folgeartikel'  },
]

const TYP_ICON = { start: '🚀', marketing: '📣', preis: '💶', warnung: '⚠️', nachfolger: '🔗' }

function fmt(n, dez = 0, suffix = '') {
  if (n == null || isNaN(n)) return '—'
  return n.toLocaleString('de-DE', { maximumFractionDigits: dez }) + suffix
}

function fmtEur(n) {
  if (n == null || isNaN(n)) return '—'
  return (n / 1000).toLocaleString('de-DE', { maximumFractionDigits: 0 }) + ' T€'
}

function SparkLine({ reihe, w = 260, h = 52, farbe = 'var(--accent)' }) {
  const vals = (reihe || []).filter(v => v != null && !isNaN(v))
  if (vals.length < 2) return null
  const mn = Math.min(...vals)
  const mx = Math.max(...vals)
  const span = mx - mn || 1
  const xs = vals.map((_, i) => (i / (vals.length - 1)) * w)
  const ys = vals.map(v => h - ((v - mn) / span) * (h - 8) - 4)
  const d = xs.map((x, i) => `${i === 0 ? 'M' : 'L'}${x.toFixed(1)},${ys[i].toFixed(1)}`).join(' ')
  return (
    <svg width={w} height={h} style={{ display: 'block', overflow: 'visible' }}>
      <path d={d} fill="none" stroke={farbe} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx={xs[xs.length - 1]} cy={ys[ys.length - 1]} r="3.5" fill={farbe} />
    </svg>
  )
}

function Kachel({ label, wert, sub, ampel }) {
  const farbe = ampel === 'g' ? 'var(--amp-g)' : ampel === 'r' ? 'var(--amp-r)' : ampel === 'a' ? 'var(--amp-a)' : 'var(--text-1)'
  return (
    <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 10, padding: '12px 16px', minWidth: 110, flex: '1 1 110px' }}>
      <div style={{ fontSize: 11, color: 'var(--text-3)', marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.04em' }}>{label}</div>
      <div style={{ fontSize: 20, fontWeight: 700, color: farbe, lineHeight: 1.2 }}>{wert}</div>
      {sub && <div style={{ fontSize: 11, color: 'var(--text-3)', marginTop: 3 }}>{sub}</div>}
    </div>
  )
}

function TabBar({ tabs, aktiv, onChange }) {
  return (
    <div style={{ display: 'flex', gap: 0, borderBottom: '2px solid var(--border)', marginBottom: 22, overflowX: 'auto' }}>
      {tabs.map(t => (
        <button
          key={t.id}
          onClick={() => onChange(t.id)}
          style={{
            padding: '8px 16px',
            border: 'none',
            background: 'none',
            color: aktiv === t.id ? 'var(--accent)' : 'var(--text-2)',
            borderBottom: aktiv === t.id ? '2.5px solid var(--accent)' : '2.5px solid transparent',
            marginBottom: -2,
            cursor: 'pointer',
            fontWeight: aktiv === t.id ? 600 : 400,
            fontSize: 13.5,
            whiteSpace: 'nowrap',
          }}
        >
          {t.label}
        </button>
      ))}
    </div>
  )
}

function Datentabelle({ kopf, zeilen, zellStil }) {
  return (
    <div style={{ overflowX: 'auto' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
        <thead>
          <tr style={{ background: 'var(--bg-subtle)' }}>
            {kopf.map(h => (
              <th key={h} style={{ padding: '6px 10px', textAlign: 'left', fontWeight: 600, borderBottom: '1px solid var(--border)', whiteSpace: 'nowrap' }}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {zeilen.map((z, i) => (
            <tr key={i} style={{ borderBottom: '1px solid var(--border)', background: i % 2 === 1 ? 'var(--bg-subtle)' : undefined }}>
              {z.map((z2, j) => (
                <td key={j} style={{ padding: '5px 10px', ...(zellStil?.[j] || {}) }}>{z2}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export default function Artikelkarte({ rolle }) {
  const artikel = katalog()
  const [nr, setNr] = useState(artikel[0]?.nr ?? '')
  const [tab, setTab] = useState('journey')

  const karte = artikelKarte(nr)
  if (!karte) {
    return (
      <div style={{ padding: 32, color: 'var(--text-3)' }}>
        Kein Artikel ausgewählt oder Artikel nicht gefunden.
      </div>
    )
  }

  const {
    stamm, kpis, preisentwicklung, absatz, lagerentwicklung,
    produktion, marketing, bewertungen, kunden, verkaufsorte,
    geschaeftsarten, folgeartikel, journey,
  } = karte

  const statusAmpel = ampelVon(kpis.planErfuellung, { gut: 95, schlecht: 80 })
  const kernaussage =
    `${stamm.name} (${stamm.gruppe}): Planziel ${fmt(kpis.planErfuellung, 0)} % erfüllt, ` +
    `DB ${fmt(kpis.dbProzent, 1)} %, ∅-Bewertung ${fmt(kpis.bewertung, 1)} ⭐.`
  const empfehlung =
    (kpis.planErfuellung ?? 100) < 80
      ? 'Absatz unter Plan — Ursache analysieren, Preispositionierung und Aktionskalender prüfen.'
      : (kpis.dbProzent ?? 30) < 20
      ? 'Marge unter Zielkorridor — Einstandskosten und Listenpreis auf Optimierungspotenzial prüfen.'
      : 'Artikel auf Kurs. Lagerreichweite und Nachfolger-Verknüpfung im Blick behalten.'

  return (
    <div style={{ maxWidth: 1100, margin: '0 auto', padding: '16px 14px' }}>

      {/* Artikelauswahl */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 18, flexWrap: 'wrap' }}>
        <span style={{ fontWeight: 600, fontSize: 14, color: 'var(--text-2)', flexShrink: 0 }}>Artikel:</span>
        {artikel.map(a => (
          <button
            key={a.nr}
            onClick={() => { setNr(a.nr); setTab('journey') }}
            title={`${a.nr} · ${a.name}`}
            style={{
              padding: '5px 14px',
              borderRadius: 20,
              border: a.nr === nr ? '2px solid var(--accent)' : '1px solid var(--border)',
              background: a.nr === nr ? 'var(--accent)' : 'var(--bg-card)',
              color: a.nr === nr ? '#fff' : 'var(--text-1)',
              fontWeight: a.nr === nr ? 600 : 400,
              cursor: 'pointer',
              fontSize: 13,
              lineHeight: 1.4,
            }}
          >
            {a.nr} · {a.name}
          </button>
        ))}
      </div>

      {/* Exec-Kopf */}
      <ExecKopf
        status={statusAmpel}
        kernaussage={kernaussage}
        kennzahl={fmtEur(kpis.umsatz)}
        kennzahlLabel="Umsatz (Ist)"
        empfehlung={empfehlung}
        kommentar="artikelkarte"
      />

      {/* KPI-Kacheln */}
      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', margin: '16px 0' }}>
        <Kachel label="Umsatz" wert={fmtEur(kpis.umsatz)} />
        <Kachel label="Menge" wert={fmt(kpis.menge)} sub="Stück" />
        <Kachel label="DB-Quote" wert={fmt(kpis.dbProzent, 1) + ' %'} ampel={ampelVon(kpis.dbProzent, { gut: 25, schlecht: 15 })} />
        <Kachel label="DB Stück" wert={fmt(kpis.margeStueck, 0) + ' €'} />
        <Kachel label="Bestand" wert={fmt(kpis.bestand)} sub={`Reichweite ${fmt(kpis.reichweiteTage, 0)} Tage`} />
        <Kachel label="Ausschuss" wert={fmt(kpis.ausschuss, 1) + ' %'} ampel={ampelVon(kpis.ausschuss, { gut: 1, schlecht: 3, invert: true })} />
        <Kachel label="Planerfüllung" wert={fmt(kpis.planErfuellung, 0) + ' %'} ampel={statusAmpel} />
        <Kachel label="Bewertung" wert={'★ ' + fmt(kpis.bewertung, 1)} sub={fmt(bewertungen?.anzahl, 0) + ' Stimmen'} />
      </div>

      {/* Tabs */}
      <TabBar tabs={TABS} aktiv={tab} onChange={setTab} />

      {/* ── Journey ── */}
      {tab === 'journey' && (
        <div>
          <h3 style={{ margin: '0 0 16px', fontSize: 15, fontWeight: 600 }}>
            Artikel-Timeline — {stamm.name}
          </h3>
          {stamm.bild && (
            <div style={{ marginBottom: 16 }}>
              <img src={stamm.bild} alt={stamm.name}
                style={{ maxHeight: 120, borderRadius: 8, objectFit: 'cover', border: '1px solid var(--border)' }}
                onError={e => { e.currentTarget.style.display = 'none' }}
              />
            </div>
          )}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14, maxWidth: 680 }}>
            {(journey || []).map((evt, i) => (
              <div key={i} style={{ display: 'flex', gap: 14, alignItems: 'flex-start' }}>
                <div style={{ minWidth: 68, fontSize: 12, color: 'var(--text-3)', paddingTop: 3, fontVariantNumeric: 'tabular-nums' }}>
                  {evt.datum}
                </div>
                <div style={{ fontSize: 20, lineHeight: 1 }}>{TYP_ICON[evt.typ] ?? '•'}</div>
                <div>
                  <div style={{ fontWeight: 600, fontSize: 13.5 }}>{evt.titel}</div>
                  <div style={{ fontSize: 13, color: 'var(--text-2)', marginTop: 3, lineHeight: 1.5 }}>{evt.text}</div>
                </div>
              </div>
            ))}
          </div>
          {folgeartikel?.nachfolger && (
            <div style={{ marginTop: 20, padding: '10px 16px', background: 'var(--bg-subtle)', borderRadius: 8, fontSize: 13, display: 'inline-flex', gap: 16, alignItems: 'center', flexWrap: 'wrap' }}>
              <span>🔗 <strong>Nachfolger:</strong> {folgeartikel.nachfolger}</span>
              {folgeartikel.ersatz && <span>↔ <strong>Ersatz:</strong> {folgeartikel.ersatz}</span>}
            </div>
          )}
        </div>
      )}

      {/* ── Verkauf ── */}
      {tab === 'verkauf' && (
        <div>
          <h3 style={{ margin: '0 0 14px', fontSize: 15, fontWeight: 600 }}>Absatz Ist vs. Plan (Monat)</h3>
          <SparkLine reihe={(absatz || []).map(z => z.menge)} w={460} h={60} />
          <p style={{ fontSize: 12, color: 'var(--text-3)', margin: '4px 0 16px' }}>
            Monatsverlauf Absatzmenge — blau = tatsächlicher Wert
          </p>
          <Datentabelle
            kopf={['Monat', 'Menge Ist', 'Menge Plan', 'Abw. Stk.', 'Abw. %', 'Umsatz']}
            zeilen={(absatz || []).map(z => {
              const abw = (z.menge ?? 0) - (z.plan ?? 0)
              const abwPct = z.plan ? (abw / z.plan) * 100 : null
              return [
                z.monat,
                fmt(z.menge),
                <span style={{ color: 'var(--text-3)' }}>{fmt(z.plan)}</span>,
                <span style={{ color: abw >= 0 ? 'var(--amp-g)' : 'var(--amp-r)', fontWeight: 600 }}>
                  {abw >= 0 ? '+' : ''}{fmt(abw)}
                </span>,
                <span style={{ color: abwPct == null ? 'var(--text-3)' : abwPct >= 0 ? 'var(--amp-g)' : 'var(--amp-r)' }}>
                  {abwPct != null ? (abwPct >= 0 ? '+' : '') + fmt(abwPct, 1) + ' %' : '—'}
                </span>,
                fmtEur(z.umsatz),
              ]
            })}
          />
        </div>
      )}

      {/* ── Preis ── */}
      {tab === 'preis' && (
        <div>
          <h3 style={{ margin: '0 0 14px', fontSize: 15, fontWeight: 600 }}>Preisentwicklung</h3>
          <SparkLine reihe={(preisentwicklung || []).map(p => p.preis)} w={460} h={70} farbe="var(--amp-g)" />
          <p style={{ fontSize: 12, color: 'var(--text-3)', margin: '4px 0 16px' }}>Monatlicher Listenpreis (€)</p>
          <Datentabelle
            kopf={['Monat', 'Listenpreis', 'Δ Vormonat']}
            zeilen={(preisentwicklung || []).map((p, i) => {
              const delta = i > 0 ? p.preis - preisentwicklung[i - 1].preis : null
              return [
                p.monat,
                <strong>{fmt(p.preis, 2)} €</strong>,
                <span style={{ color: delta == null ? 'var(--text-3)' : delta > 0 ? 'var(--amp-r)' : delta < 0 ? 'var(--amp-g)' : 'var(--text-3)' }}>
                  {delta == null ? '—' : (delta > 0 ? '+' : '') + fmt(delta, 2) + ' €'}
                </span>,
              ]
            })}
          />
        </div>
      )}

      {/* ── Lager ── */}
      {tab === 'lager' && (
        <div>
          <h3 style={{ margin: '0 0 14px', fontSize: 15, fontWeight: 600 }}>Lagerentwicklung</h3>
          <SparkLine reihe={(lagerentwicklung || []).map(l => l.bestand)} w={460} h={70} farbe="var(--amp-a)" />
          <p style={{ fontSize: 12, color: 'var(--text-3)', margin: '4px 0 16px' }}>Monatsendbestand (Stück)</p>
          <Datentabelle
            kopf={['Monat', 'Bestand (Stk.)', 'Δ Vormonat']}
            zeilen={(lagerentwicklung || []).map((l, i) => {
              const delta = i > 0 ? l.bestand - lagerentwicklung[i - 1].bestand : null
              return [
                l.monat,
                <strong>{fmt(l.bestand)}</strong>,
                <span style={{ color: delta == null ? 'var(--text-3)' : delta > 0 ? 'var(--amp-g)' : delta < 0 ? 'var(--amp-r)' : 'var(--text-3)' }}>
                  {delta == null ? '—' : (delta > 0 ? '+' : '') + fmt(delta)}
                </span>,
              ]
            })}
          />
        </div>
      )}

      {/* ── Produktion ── */}
      {tab === 'produktion' && (
        <div>
          <h3 style={{ margin: '0 0 16px', fontSize: 15, fontWeight: 600 }}>Produktionskennzahlen</h3>
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginBottom: 20 }}>
            <Kachel label="Produktionsmenge" wert={fmt(produktion?.menge)} sub="Stück gesamt" />
            <Kachel label="Gutmenge" wert={fmt(produktion?.gutmenge)} sub="Stück einwandfrei" />
            <Kachel label="Ausschussquote" wert={fmt(produktion?.ausschuss, 1) + ' %'}
              ampel={ampelVon(produktion?.ausschuss, { gut: 1, schlecht: 3, invert: true })} />
            <Kachel label="Linie" wert={produktion?.linie ?? '—'} />
          </div>
          {produktion?.menge > 0 && (
            <div style={{ background: 'var(--bg-subtle)', borderRadius: 8, padding: '12px 16px', fontSize: 13, maxWidth: 420 }}>
              <div style={{ fontWeight: 600, marginBottom: 8 }}>Gut / Ausschuss</div>
              <div style={{ display: 'flex', gap: 0, height: 18, borderRadius: 4, overflow: 'hidden' }}>
                <div style={{ flex: (produktion.gutmenge ?? 0), background: 'var(--amp-g)' }} />
                <div style={{ flex: (produktion.menge - (produktion.gutmenge ?? 0)), background: 'var(--amp-r)' }} />
              </div>
              <div style={{ display: 'flex', gap: 20, marginTop: 6 }}>
                <span>🟢 Gut {fmt((produktion.gutmenge / produktion.menge) * 100, 1)} %</span>
                <span>🔴 Ausschuss {fmt(produktion.ausschuss, 1)} %</span>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── Marketing ── */}
      {tab === 'marketing' && (
        <div>
          <h3 style={{ margin: '0 0 14px', fontSize: 15, fontWeight: 600 }}>Marketing-Aktionen & Conversion</h3>
          {(!marketing || marketing.length === 0) ? (
            <p style={{ color: 'var(--text-3)', fontSize: 13 }}>Keine Aktionen erfasst.</p>
          ) : (
            <Datentabelle
              kopf={['Aktion', 'Monat', 'Kanal', 'Spend', 'ROAS', 'Mehrumsatz']}
              zeilen={marketing.map(m => [
                <strong>{m.name}</strong>,
                m.monat,
                m.kanal,
                fmt(m.spend, 0) + ' €',
                <span style={{ color: (m.roas ?? 0) >= 3 ? 'var(--amp-g)' : 'var(--amp-r)', fontWeight: 600 }}>
                  {fmt(m.roas, 1)}×
                </span>,
                fmtEur(m.mehrumsatz),
              ])}
            />
          )}
          {kunden && (
            <div style={{ marginTop: 22 }}>
              <h4 style={{ fontSize: 13.5, margin: '0 0 12px', color: 'var(--text-1)' }}>Probefahrten & Online-Conversion</h4>
              <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                <Kachel label="Probefahrten" wert={fmt(kunden.probefahrten)} sub="im Store" />
                <Kachel label="Kaufquote Probe" wert={fmt(kunden.kaufquoteProbefahrt, 1) + ' %'}
                  ampel={ampelVon(kunden.kaufquoteProbefahrt, { gut: 30, schlecht: 15 })} />
                <Kachel label="Shop-Aufrufe" wert={fmt(kunden.shopAufrufe)} sub="Seitenaufrufe" />
                <Kachel label="Kaufquote Shop" wert={fmt(kunden.kaufquoteShop, 2) + ' %'}
                  ampel={ampelVon(kunden.kaufquoteShop, { gut: 3, schlecht: 1 })} />
              </div>
            </div>
          )}
          {verkaufsorte && verkaufsorte.length > 0 && (
            <div style={{ marginTop: 22 }}>
              <h4 style={{ fontSize: 13.5, margin: '0 0 10px', color: 'var(--text-1)' }}>Verkaufskanäle</h4>
              <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                {verkaufsorte.map((vo, i) => (
                  <div key={i} style={{ background: 'var(--bg-subtle)', borderRadius: 8, padding: '8px 14px', fontSize: 13 }}>
                    <strong>{vo.ort}</strong>
                    <span style={{ color: 'var(--text-3)', marginLeft: 10 }}>
                      {fmt(vo.anteil, 0)} % · {fmtEur(vo.umsatz)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── Bewertungen ── */}
      {tab === 'bewertungen' && (
        <div>
          <h3 style={{ margin: '0 0 16px', fontSize: 15, fontWeight: 600 }}>Kundenbewertungen</h3>
          <div style={{ display: 'flex', gap: 28, alignItems: 'flex-start', flexWrap: 'wrap' }}>
            <div style={{ textAlign: 'center', minWidth: 120 }}>
              <div style={{ fontSize: 52, fontWeight: 800, color: 'var(--accent)', lineHeight: 1 }}>
                {fmt(bewertungen?.schnitt, 1)}
              </div>
              <div style={{ fontSize: 22, color: '#f59e0b', marginTop: 4 }}>
                {'★'.repeat(Math.round(bewertungen?.schnitt ?? 0))}{'☆'.repeat(5 - Math.round(bewertungen?.schnitt ?? 0))}
              </div>
              <div style={{ fontSize: 12, color: 'var(--text-3)', marginTop: 6 }}>
                {fmt(bewertungen?.anzahl, 0)} Bewertungen
              </div>
            </div>
            <div style={{ flex: 1, minWidth: 220 }}>
              {[5, 4, 3, 2, 1].map(s => {
                const cnt = bewertungen?.sterne?.[s] ?? 0
                const pct = (bewertungen?.anzahl ?? 0) > 0 ? (cnt / bewertungen.anzahl) * 100 : 0
                return (
                  <div key={s} style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                    <span style={{ width: 24, fontSize: 12, color: 'var(--text-3)', textAlign: 'right' }}>{s} ★</span>
                    <div style={{ flex: 1, background: 'var(--bg-subtle)', borderRadius: 4, height: 10, overflow: 'hidden' }}>
                      <div style={{
                        width: `${pct}%`, height: '100%',
                        background: s >= 4 ? 'var(--amp-g)' : s === 3 ? 'var(--amp-a)' : 'var(--amp-r)',
                        transition: 'width 0.4s ease',
                      }} />
                    </div>
                    <span style={{ width: 40, fontSize: 12, color: 'var(--text-3)' }}>{fmt(pct, 0)} %</span>
                    <span style={{ width: 28, fontSize: 12, color: 'var(--text-3)' }}>{cnt}</span>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      )}

      {/* ── Folgeartikel ── */}
      {tab === 'folgeartikel' && (
        <div>
          <h3 style={{ margin: '0 0 16px', fontSize: 15, fontWeight: 600 }}>Folgeartikel & Geschäftsarten</h3>
          <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap', marginBottom: 24 }}>
            {folgeartikel?.nachfolger ? (
              <div style={{ background: 'var(--bg-subtle)', border: '1px solid var(--border)', borderRadius: 10, padding: '14px 20px', minWidth: 200 }}>
                <div style={{ fontSize: 11, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 6 }}>Nachfolger</div>
                <div style={{ fontSize: 16, fontWeight: 700 }}>🔗 {folgeartikel.nachfolger}</div>
              </div>
            ) : (
              <div style={{ background: 'var(--bg-subtle)', borderRadius: 10, padding: '14px 20px', color: 'var(--text-3)', fontSize: 13 }}>
                Kein Nachfolger erfasst.
              </div>
            )}
            {folgeartikel?.ersatz && (
              <div style={{ background: 'var(--bg-subtle)', border: '1px solid var(--border)', borderRadius: 10, padding: '14px 20px', minWidth: 200 }}>
                <div style={{ fontSize: 11, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 6 }}>Ersatzartikel</div>
                <div style={{ fontSize: 16, fontWeight: 700 }}>↔ {folgeartikel.ersatz}</div>
              </div>
            )}
          </div>
          {geschaeftsarten && (
            <div>
              <h4 style={{ fontSize: 13.5, margin: '0 0 12px', color: 'var(--text-1)' }}>Geschäftsarten (Umsatzanteil)</h4>
              <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                {Object.entries(geschaeftsarten).map(([art, wert]) => (
                  <div key={art} style={{ background: 'var(--bg-subtle)', borderRadius: 8, padding: '8px 16px', fontSize: 13 }}>
                    <span style={{ textTransform: 'capitalize', fontWeight: 600 }}>{art}</span>
                    <span style={{ color: 'var(--text-3)', marginLeft: 10 }}>{fmt(wert, 0)} %</span>
                  </div>
                ))}
              </div>
              {/* Proportional bar */}
              <div style={{ display: 'flex', height: 14, borderRadius: 6, overflow: 'hidden', marginTop: 14, maxWidth: 400 }}>
                {Object.entries(geschaeftsarten).map(([art, wert], i) => {
                  const farben = ['var(--accent)', 'var(--amp-g)', 'var(--amp-a)']
                  return <div key={art} style={{ flex: wert, background: farben[i] ?? 'var(--border)', title: art }} />
                })}
              </div>
              <div style={{ display: 'flex', gap: 16, marginTop: 8, fontSize: 12, color: 'var(--text-3)' }}>
                {Object.entries(geschaeftsarten).map(([art], i) => {
                  const farben = ['var(--accent)', 'var(--amp-g)', 'var(--amp-a)']
                  return (
                    <span key={art} style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                      <span style={{ width: 10, height: 10, borderRadius: 2, background: farben[i] ?? 'var(--border)', display: 'inline-block' }} />
                      {art}
                    </span>
                  )
                })}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
