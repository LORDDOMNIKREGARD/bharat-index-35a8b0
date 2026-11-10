import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router'
import { ArrowClockwise, ArrowRight, ArrowUpRight } from '@phosphor-icons/react'
import { BY_SLUG, DATA_DATE, GUIDES, MAX_GSDP, STATES, WHO, cmText, governorTitle, guideProgress, rankText } from '@/data'
import { LEVELS } from '@/data/practice'
import { TOPICS, useHeadlines } from '@/hooks/useHeadlines'
import { useMastery } from '@/hooks/useMastery'
import { Bar, Fact, Facts } from '@/components/Facts'
import { IndiaMap, SeatLegend } from '@/components/IndiaMap'
import { Reveal } from '@/components/Reveal'
import { Timeline } from '@/components/ui/timeline'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import BlurText from '@/components/BlurText'
import CountUp from '@/components/CountUp'
import { fmtDate, fmtGsdp, store } from '@/utils'
import type { State } from '@/types'

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

const RS_FROM_STATES = STATES.reduce((a, s) => a + s.rs, 0)

function Stats() {
  const items = [
    { n: 36, label: 'states and UTs' },
    { n: 543, label: 'Lok Sabha seats' },
    { n: RS_FROM_STATES, label: 'Rajya Sabha seats from states' },
    { n: GUIDES.length, label: 'study guides' },
  ]
  return (
    <dl className="mt-8 grid grid-cols-2 gap-x-6 gap-y-5 border-y border-rule py-5 sm:grid-cols-4">
      {items.map((it, i) => (
        <div key={it.label}>
          <dd className="num m-0 text-[34px] font-semibold leading-none [font-stretch:85%]">
            <CountUp to={it.n} duration={1.1} delay={0.15 * i} trigger="view" />
          </dd>
          <dt className="mt-1 text-[14px] text-ink-2">{it.label}</dt>
        </div>
      ))}
    </dl>
  )
}

function PickState({ onPick }: { onPick: (s: State) => void }) {
  return (
    <section aria-labelledby="pick" className="mt-12">
      <h2 id="pick" className="m-0 text-[26px] leading-8">
        Which state are you from?
      </h2>
      <p className="mb-5 mt-1 max-w-[60ch] text-ink-2">
        Panels often open with your home state. Tap it on the map and its brief, with every Lok Sabha seat, stays on this page.
      </p>
      <div className="grid gap-8 md:grid-cols-[minmax(0,460px)_1fr]">
        <IndiaMap
          fill={() => 'var(--bi-data-2)'}
          onSelect={onPick}
          label="Pick your home state"
          caption={(h) => (h ? <span className="font-semibold text-ink">{h.name}</span> : 'Tap your state.')}
        />
        <label className="block self-start">
          <span className="mb-1 block text-[15px] text-ink-2">Or choose from the list</span>
          <select
            defaultValue=""
            onChange={(e) => e.target.value && onPick(BY_SLUG.get(e.target.value)!)}
            className="w-full max-w-80 rounded-md border border-rule bg-surface px-3 py-2"
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
    <section aria-labelledby="brief" className="mt-12">
      <div className="mb-4 flex flex-wrap items-baseline gap-x-4 gap-y-1">
        <span className="text-[15px] text-ink-2">Your state</span>
        <button type="button" onClick={onChange} className="link ml-auto text-[15px]">
          Change state
        </button>
      </div>
      <div className="grid gap-8 md:grid-cols-[minmax(0,1fr)_minmax(0,420px)]">
        <div>
          <h2 id="brief" className="m-0 text-[36px] leading-10 sm:text-[44px] sm:leading-[48px]">
            {s.name}
          </h2>
          <p className="mb-4 mt-1 text-ink-2">{s.isUT ? 'Union territory' : 'State'}</p>
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
          <Button asChild className="mt-5">
            <Link to={`/states/${s.slug}`}>
              Full sheet with sources <ArrowRight aria-hidden />
            </Link>
          </Button>
        </div>
        <IndiaMap
          fill="gsdp"
          focus={s.slug}
          seats
          label={`${s.name} with its ${s.ls} Lok Sabha constituencies`}
          caption={(_, seat) =>
            seat ? (
              <>
                <span className="font-semibold text-ink">{seat.n}</span>
                {seat.c !== 'GEN' && ` · reserved for ${seat.c}`}
              </>
            ) : (
              <SeatLegend />
            )
          }
        />
      </div>
    </section>
  )
}

function PracticeCard() {
  const { mastery } = useMastery()
  const strong = STATES.filter((s) => (mastery[s.iso] ?? 0) >= 3).length
  const started = Object.keys(mastery).length > 0
  return (
    <div className="rounded-lg border border-rule bg-surface p-6">
      <p className="m-0 text-[14px] text-ink-2">Map practice</p>
      <p className="num m-0 mt-1 text-[30px] font-semibold leading-9 [font-stretch:85%]">
        {strong} <span className="text-ink-3">/ 36</span>
      </p>
      <p className="m-0 text-[15px] text-ink-2">at {LEVELS[3]} or {LEVELS[4]}</p>
      <Progress value={(strong / 36) * 100} className="mt-3 h-1.5" />
      <Button asChild className="mt-5 w-full">
        <Link to="/practice">
          {started ? 'Continue practising' : 'Start a ten-question round'} <ArrowRight aria-hidden />
        </Link>
      </Button>
    </div>
  )
}

function Headlines() {
  const { groups, status, updatedAt, refresh } = useHeadlines(5)
  const topics = TOPICS.filter((t) => groups[t]?.length)

  return (
    <section aria-labelledby="news" className="mt-16">
      <div className="mb-3 flex items-baseline justify-between gap-4">
        <h2 id="news" className="m-0 text-[22px] leading-7">
          Headlines
        </h2>
        <Button variant="ghost" size="sm" onClick={refresh} disabled={status === 'loading'} className="text-accent">
          <ArrowClockwise aria-hidden className={status === 'loading' ? 'animate-spin' : ''} />
          {status === 'loading' ? 'Loading' : 'Refresh'}
        </Button>
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
              <div className="h-4 w-24 animate-pulse rounded bg-tint" />
              <div className="h-4 w-full animate-pulse rounded bg-tint" />
              <div className="h-4 w-5/6 animate-pulse rounded bg-tint" />
            </div>
          ))}
        </div>
      )}

      <div className="grid gap-x-10 gap-y-8 md:grid-cols-2">
        {topics.map((t, k) => (
          <Reveal key={t} delay={k * 0.06}>
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
          </Reveal>
        ))}
      </div>
    </section>
  )
}

function HowToPrepare({ home }: { home?: State }) {
  const step = (body: string, to: string, label: string) => (
    <div className="max-w-[52ch] pb-2">
      <p className="m-0 font-read text-[17px] leading-7">{body}</p>
      <Link to={to} className="link mt-2 inline-block text-[15px]">
        {label}
      </Link>
    </div>
  )
  const data = useMemo(
    () => [
      {
        title: 'Your state',
        content: step(
          'Know your home state cold: Chief Minister, Governor, GSDP and its rank, seats in both houses, rivers. It is the safest opening question.',
          home ? `/states/${home.slug}` : '/states',
          home ? `Open ${home.name}` : 'Find your state',
        ),
      },
      {
        title: 'The map',
        content: step('Ten-question rounds on the map. Each state climbs from Attempted to Mastered; the ones you miss come back sooner.', '/practice', 'Practise the map'),
      },
      {
        title: 'The guides',
        content: step('Work through GK, current affairs, schemes and your stream’s subject. Each guide remembers where you stopped.', '/guides', 'Open the guides'),
      },
      {
        title: 'The night before',
        content: step('Print your state’s sheet on one page, skim the Union Cabinet, and read the week’s headlines.', '/who', "Who's who and the Cabinet"),
      },
    ],
    [home],
  )
  return (
    <section aria-labelledby="prep" className="mt-16">
      <SectionHead id="prep" title="How to prepare with this site" />
      <Timeline data={data} />
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
      <div className="pt-10 sm:pt-14">
        <BlurText
          as="h1"
          text="State facts and study guides for the IPM interview"
          animateBy="words"
          direction="bottom"
          delay={60}
          className="m-0 max-w-[20ch] text-[34px] font-semibold leading-[38px] [font-stretch:85%] sm:text-[52px] sm:leading-[54px]"
        />
        <p className="mb-0 mt-3 max-w-[60ch] text-[17px] text-ink-2">
          Data as of {fmtDate(DATA_DATE)}. Every figure on a state sheet links to its source.
        </p>
        <Stats />
      </div>

      {s ? <StateBrief s={s} onChange={() => pick(null)} /> : <PickState onPick={pick} />}

      <div className="mt-16 grid gap-12 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_300px]">
        <Reveal>
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
        </Reveal>

        <Reveal delay={0.08}>
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
                    <span className="shrink-0 text-[14px] text-ink-2">{pct > 2 ? <span className="text-accent">Continue · {pct}%</span> : g.subject}</span>
                  </li>
                )
              })}
            </ul>
          </section>
        </Reveal>

        <Reveal delay={0.16}>
          <PracticeCard />
        </Reveal>
      </div>

      <HowToPrepare home={s} />
      <Headlines />
    </>
  )
}
