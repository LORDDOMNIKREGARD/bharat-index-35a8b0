import { useEffect, useState } from 'react'
import { Link } from 'react-router'
import { ArrowClockwise, ArrowUpRight } from '@phosphor-icons/react'
import { BY_SLUG, DATA_DATE, GUIDES, MAX_GSDP, STATES, WHO, cmText, governorTitle, guideProgress, rankText } from '../data'
import { TOPICS, useHeadlines } from '../hooks/useHeadlines'
import { Bar, Fact, Facts } from '../components/Facts'
import { TileMap } from '../components/TileMap'
import { fmtDate, fmtGsdp, store } from '../utils'
import type { State } from '../types'

export function SectionHead({ id, title, link }: { id: string; title: string; link?: { to: string; label: string } }) {
  return (
    <div className="mb-3 flex items-baseline justify-between gap-4">
      <h2 id={id} className="m-0 text-[22px] leading-7">
        {title}
      </h2>
      {link && (
        <Link to={link.to} className="link shrink-0 text-[15px]">
          {link.label}
        </Link>
      )}
    </div>
  )
}

function PickState({ onPick }: { onPick: (s: State) => void }) {
  return (
    <section aria-labelledby="pick" className="mt-8">
      <h2 id="pick" className="m-0 text-[22px] leading-7">
        Which state are you from?
      </h2>
      <p className="mb-5 mt-1 max-w-[60ch] text-ink-2">
        Interview panels often start with your home state. Pick it once and its brief stays on this page.
      </p>
      <div className="grid gap-8 md:grid-cols-[420px_1fr]">
        <TileMap metric="gsdp" onPick={onPick} label="Pick your state" />
        <label className="block self-start">
          <span className="mb-1 block text-[15px] text-ink-2">Or choose from the list</span>
          <select
            defaultValue=""
            onChange={(e) => e.target.value && onPick(BY_SLUG.get(e.target.value)!)}
            className="w-full max-w-80 rounded-ctl border border-rule bg-surface px-3 py-2"
          >
            <option value="" disabled>
              Select a state or UT
            </option>
            {STATES.map((s) => (
              <option key={s.slug} value={s.slug}>
                {s.name}
              </option>
            ))}
          </select>
        </label>
      </div>
    </section>
  )
}

function StateBrief({ s, onChange }: { s: State; onChange: () => void }) {
  return (
    <section aria-labelledby="brief" className="mt-8">
      <div className="mb-3 flex flex-wrap items-baseline gap-x-4 gap-y-1">
        <h2 id="brief" className="m-0 text-[28px] leading-8">
          {s.name}
        </h2>
        <span className="text-ink-2">{s.isUT ? 'Union territory' : 'State'}</span>
        <button type="button" onClick={onChange} className="link ml-auto text-[15px]">
          Change state
        </button>
      </div>
      <Facts>
        <Fact label="Chief Minister">{cmText(s)}</Fact>
        <Fact label={governorTitle(s)}>{s.governor}</Fact>
        <Fact label="GSDP" rank={rankText(s, 'gsdp')} note={s.gsdpFy ? `FY ${s.gsdpFy}` : undefined} bar={<Bar value={s.gsdp} max={MAX_GSDP} />}>
            {fmtGsdp(s.gsdp)}
          </Fact>
        <Fact label="Lok Sabha seats" rank={rankText(s, 'ls')}>
          {s.ls}
        </Fact>
      </Facts>
      <Link to={`/states/${s.slug}`} className="link mt-3 inline-block">
        Open the full sheet, with sources
      </Link>
    </section>
  )
}

function Headlines() {
  const { groups, status, updatedAt, refresh } = useHeadlines(5)
  const topics = TOPICS.filter((t) => groups[t]?.length)

  return (
    <section aria-labelledby="news" className="mt-14">
      <div className="mb-3 flex items-baseline justify-between gap-4">
        <h2 id="news" className="m-0 text-[22px] leading-7">
          Headlines
        </h2>
        <button
          type="button"
          onClick={refresh}
          disabled={status === 'loading'}
          className="flex items-center gap-1.5 text-[15px] text-accent disabled:text-ink-3"
        >
          <ArrowClockwise size={16} aria-hidden className={status === 'loading' ? 'animate-spin' : ''} />
          {status === 'loading' ? 'Loading' : 'Refresh'}
        </button>
      </div>
      <p className="mb-4 mt-0 text-[14px] text-ink-2" aria-live="polite">
        {status === 'error'
          ? 'Headlines could not be loaded. Check your connection and try Refresh.'
          : updatedAt
            ? `From Google News, last 3 days. Updated ${updatedAt.toLocaleTimeString('en-IN', { hour: 'numeric', minute: '2-digit' })}.`
            : 'From Google News, last 3 days.'}
      </p>

      {status === 'loading' && !topics.length && (
        <div className="grid gap-x-10 gap-y-6 md:grid-cols-2" aria-hidden>
          {[0, 1].map((i) => (
            <div key={i} className="space-y-3">
              <div className="h-4 w-24 bg-tint" />
              <div className="h-4 w-full bg-tint" />
              <div className="h-4 w-5/6 bg-tint" />
              <div className="h-4 w-4/6 bg-tint" />
            </div>
          ))}
        </div>
      )}

      <div className="grid gap-x-10 gap-y-8 md:grid-cols-2">
        {topics.map((t) => (
          <div key={t}>
            <h3 className="m-0 mb-2 border-b border-rule pb-1 text-[16px] text-ink-2">{t}</h3>
            <ul className="m-0 list-none space-y-3 p-0">
              {groups[t].map((h) => (
                <li key={h.link}>
                  <a href={h.link} target="_blank" rel="noopener noreferrer" className="group no-underline">
                    <span className="font-read text-[16px] leading-6 group-hover:underline">{h.title}</span>
                    <ArrowUpRight size={13} className="ml-1 inline text-ink-3" aria-label="(opens in a new tab)" />
                  </a>
                  <div className="text-[13px] text-ink-2">
                    {[h.source, h.date?.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })].filter(Boolean).join(' · ')}
                  </div>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </section>
  )
}

export default function Home() {
  const [home, setHome] = useState(() => store.get('homeState'))
  const s = home ? BY_SLUG.get(home) : undefined

  useEffect(() => {
    document.title = 'Bharat Index — state facts and study guides for IPM interviews'
  }, [])

  const pick = (st: State | null) => {
    store.set('homeState', st?.slug ?? null)
    setHome(st?.slug ?? null)
  }

  return (
    <>
      <div className="pt-8 sm:pt-10">
        <h1 className="m-0 max-w-[22ch] text-[32px] leading-9 sm:text-[44px] sm:leading-[48px]">
          State facts and study guides for the IPM interview
        </h1>
        <p className="mb-0 mt-2 max-w-[60ch] text-[17px] text-ink-2">
          Data as of {fmtDate(DATA_DATE)}. Every figure on a state sheet links to its source.
        </p>
      </div>

      {s ? <StateBrief s={s} onChange={() => pick(null)} /> : <PickState onPick={pick} />}

      <div className="mt-14 grid gap-14 lg:grid-cols-2">
        <section aria-labelledby="who">
          <SectionHead id="who" title="Who's who" link={{ to: '/who', label: 'Union Cabinet' }} />
          <Facts>
            {WHO.map((w) => (
              <Fact key={w.label} label={w.label} note={`${w.note ? `${w.note}. ` : ''}As of ${w.asOf}.`}>
                {w.value}
              </Fact>
            ))}
          </Facts>
        </section>

        <section aria-labelledby="guides">
          <SectionHead id="guides" title="Study guides" link={{ to: '/guides', label: 'All guides' }} />
          <ul className="m-0 list-none divide-y divide-rule border-y border-rule p-0">
            {GUIDES.map((g) => {
              const pct = guideProgress(g.file)
              return (
                <li key={g.file} className="flex items-baseline justify-between gap-4 py-2.5">
                  <a href={`/${g.file}`} className="no-underline hover:underline">
                    {g.title}
                  </a>
                  <span className="shrink-0 text-[14px] text-ink-2">
                    {pct > 2 ? <span className="text-accent">Continue · {pct}%</span> : g.subject}
                  </span>
                </li>
              )
            })}
          </ul>
        </section>
      </div>

      <Headlines />
    </>
  )
}
