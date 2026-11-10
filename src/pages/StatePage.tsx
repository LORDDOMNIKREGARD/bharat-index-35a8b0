import { useEffect, useState, type ReactNode } from 'react'
import { Link, useParams } from 'react-router'
import { ArrowLeft, ArrowRight, Copy, Printer } from '@phosphor-icons/react'
import { BY_SLUG, DATA_DATE, MAX_GSDP, METRICS, SOURCES, STATES, cmText, governorTitle, rankText } from '../data'
import { Bar, Fact, Facts } from '../components/Facts'
import { fmtDate, fmtGsdp, fmtMonth, ordinal } from '../utils'
import type { State } from '../types'
import NotFound from './NotFound'

// Footnote numbers used on the sheet.
const SRC = [
  { n: 1, key: 'chief_ministers', label: 'Chief Ministers: Wikipedia, list of current Indian chief ministers' },
  { n: 2, key: 'governors', label: 'Governors and administrators: Wikipedia, list of current Indian governors' },
  { n: 3, key: 'lok_sabha', label: 'Lok Sabha seats: Wikipedia, list of Lok Sabha constituencies' },
  { n: 4, key: 'rajya_sabha', label: 'Rajya Sabha seats: Wikipedia, Rajya Sabha' },
  { n: 5, key: 'gsdp', label: 'GSDP: Wikipedia, Indian states and UTs by GDP' },
  { n: 6, key: 'cpi', label: 'CPI and inflation: MoSPI press release, CPI for January 2026' },
  { n: 7, key: 'sex_ratio', label: 'Sex ratio: Wikipedia, states and UTs by sex ratio (NFHS-5)' },
]

function sheetText(s: State): string {
  const lines = [
    `${s.name} (${s.isUT ? 'Union territory' : 'State'}) — Bharat Index, data as of ${fmtDate(DATA_DATE)}`,
    `Chief Minister: ${cmText(s)}`,
    `${governorTitle(s)}: ${s.governor}`,
    `Lok Sabha seats: ${s.ls}${s.rank.ls ? ` (${rankText(s, 'ls')})` : ''} · Rajya Sabha seats: ${s.rs}`,
    `GSDP${s.gsdpFy ? ` (FY ${s.gsdpFy})` : ''}: ${fmtGsdp(s.gsdp)}${s.rank.gsdp ? ` (${rankText(s, 'gsdp')})` : ''}`,
    `CPI (${fmtMonth(s.cpiMonth)}, ${s.cpiSector}): ${METRICS.cpi.fmt(s.cpi)} · Inflation: ${METRICS.inflation.fmt(s.inflation)} (${rankText(s, 'inflation')})`,
    `Sex ratio (${s.sexRatioSource}, ${s.sexRatioPeriod}): ${s.sexRatio} females per 1,000 males`,
  ]
  if (s.rivers.length) lines.push(`Rivers: ${s.rivers.join(', ')}`)
  return lines.join('\n')
}

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="mt-8 break-inside-avoid">
      <h2 className="m-0 mb-2 text-[20px] leading-7">{title}</h2>
      {children}
    </section>
  )
}

export default function StatePage() {
  const { slug = '' } = useParams()
  const s = BY_SLUG.get(slug)
  const [copied, setCopied] = useState('')

  useEffect(() => {
    if (s) document.title = `${s.name} — Bharat Index`
    setCopied('')
  }, [s])

  if (!s) return <NotFound />

  const i = STATES.indexOf(s)
  const prev = STATES[(i - 1 + STATES.length) % STATES.length]
  const next = STATES[(i + 1) % STATES.length]

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(sheetText(s))
      setCopied('Copied the sheet as text.')
    } catch {
      setCopied('Could not copy. Select the text and copy it instead.')
    }
  }

  const summary = [
    s.rank.gsdp && `${ordinal(s.rank.gsdp)} largest economy`,
    `${s.ls} Lok Sabha ${s.ls === 1 ? 'seat' : 'seats'}`,
    `${s.rs} Rajya Sabha ${s.rs === 1 ? 'seat' : 'seats'}`,
  ].filter(Boolean)

  return (
    <article className="max-w-[760px]">
      <Link to="/states" className="no-print link mt-6 inline-flex items-center gap-1 text-[15px]">
        <ArrowLeft size={14} aria-hidden /> All states and UTs
      </Link>

      <header className="mt-5">
        <div className="text-[15px] text-ink-2">
          {s.isUT ? 'Union territory' : 'State'} · <abbr title="ISO 3166-2 code" className="no-underline">IN-{s.iso}</abbr>
        </div>
        <h1 className="m-0 mt-1 text-[36px] leading-10 sm:text-[44px] sm:leading-[48px]">{s.name}</h1>
        <p className="num mb-0 mt-2 text-[17px] text-ink-2">{summary.join(' · ')}</p>
      </header>

      <div className="no-print mt-5 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => window.print()}
          className="flex items-center gap-1.5 rounded-ctl border border-rule bg-surface px-3 py-1.5 text-[15px] hover:border-ink-3"
        >
          <Printer size={16} aria-hidden /> Print
        </button>
        <button
          type="button"
          onClick={copy}
          className="flex items-center gap-1.5 rounded-ctl border border-rule bg-surface px-3 py-1.5 text-[15px] hover:border-ink-3"
        >
          <Copy size={16} aria-hidden /> Copy as text
        </button>
        <span className="self-center text-[14px] text-ink-2" aria-live="polite">
          {copied}
        </span>
      </div>

      <Section title="Government">
        <Facts>
          <Fact label="Chief Minister" fn={1}>
            {cmText(s)}
          </Fact>
          <Fact label={governorTitle(s)} fn={2}>
            {s.governor}
          </Fact>
          <Fact label="Lok Sabha seats" fn={3} rank={rankText(s, 'ls')}>
            {s.ls}
          </Fact>
          <Fact label="Rajya Sabha seats" fn={4} rank={rankText(s, 'rs')}>
            {s.rs}
          </Fact>
        </Facts>
      </Section>

      <Section title="Economy">
        <Facts>
          <Fact
            label="GSDP"
            fn={5}
            rank={rankText(s, 'gsdp')}
            note={s.gsdp == null ? 'No figure in the source for this UT.' : s.gsdpFy ? `Fiscal year ${s.gsdpFy}` : undefined}
           bar={<Bar value={s.gsdp} max={MAX_GSDP} />}>
            {fmtGsdp(s.gsdp)}
          </Fact>
          <Fact label="Consumer price index" fn={6} note={`${fmtMonth(s.cpiMonth)}, ${s.cpiSector}`}>
            {METRICS.cpi.fmt(s.cpi)}
          </Fact>
          <Fact label="Inflation, year on year" fn={6} rank={rankText(s, 'inflation') && `${rankText(s, 'inflation')}, highest first`}>
            {METRICS.inflation.fmt(s.inflation)}
          </Fact>
        </Facts>
      </Section>

      <Section title="People">
        <Facts>
          <Fact label="Sex ratio" fn={7} rank={rankText(s, 'sexRatio')} note={`Females per 1,000 males. ${s.sexRatioSource}, ${s.sexRatioPeriod}.`}>
            {s.sexRatio}
          </Fact>
        </Facts>
      </Section>

      {s.rivers.length > 0 && (
        <Section title="Rivers">
          <p className="m-0 font-read text-[17px] leading-7">{s.rivers.join(', ')}</p>
          <p className="mb-0 mt-1 text-[14px] text-ink-2">
            From Wikipedia's river lists, cleaned by hand. Not a complete list; check before quoting.
          </p>
        </Section>
      )}

      <section className="mt-10 border-t border-rule pt-4 text-[14px] text-ink-2">
        <h2 className="m-0 mb-2 text-[16px] text-ink">Sources</h2>
        <ol className="m-0 space-y-1 pl-5">
          {SRC.map((src) => (
            <li key={src.n} id={`src-${src.n}`} className="target:bg-tint">
              {SOURCES[src.key] ? (
                <a href={SOURCES[src.key]} className="link" target="_blank" rel="noopener noreferrer">
                  {src.label}
                </a>
              ) : (
                src.label
              )}
            </li>
          ))}
        </ol>
        <p className="mb-0 mt-3">Collected {fmtDate(DATA_DATE)}. Office holders may have changed since.</p>
      </section>

      <nav aria-label="Other states" className="no-print mt-10 flex justify-between gap-4 border-t border-rule pt-4 text-[15px]">
        <Link to={`/states/${prev.slug}`} className="link inline-flex items-center gap-1">
          <ArrowLeft size={14} aria-hidden /> {prev.name}
        </Link>
        <Link to={`/states/${next.slug}`} className="link inline-flex items-center gap-1 text-right">
          {next.name} <ArrowRight size={14} aria-hidden />
        </Link>
      </nav>
    </article>
  )
}
