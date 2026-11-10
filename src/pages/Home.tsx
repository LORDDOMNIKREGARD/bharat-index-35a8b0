import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router'
import { motion } from 'motion/react'
import { ArrowRight, BookOpenText, Fire, MapTrifold, Newspaper, Target, Users } from '@phosphor-icons/react'
import { BY_SLUG, DATA_DATE, GUIDES, MAX_GSDP, STATES, WHO, cmText, governorTitle, rankText } from '@/data'
import { DAILY_LENGTH, dayKey, dayNumber, streak } from '@/data/practice'
import { useMastery } from '@/hooks/useMastery'
import { useBookmarks } from '@/hooks/useBookmarks'
import { Bar, Fact, Facts } from '@/components/Facts'
import { IndiaMap, SeatLegend } from '@/components/IndiaMap'
import { Button } from '@/components/ui/button'
import BlurText from '@/components/BlurText'
import { fmtDate, fmtGsdp, store } from '@/utils'
import type { State } from '@/types'

function TodayStrip() {
  const key = useMemo(() => dayKey(), [])
  const info = useMemo(() => {
    try {
      const rec = JSON.parse(store.get(`daily:${key}`) || 'null')
      const played = new Set<string>(JSON.parse(store.get('dailyPlayed') || '[]'))
      const answers: { pts: number }[] = rec?.answers ?? []
      return { done: answers.length >= DAILY_LENGTH, score: answers.reduce((a, x) => a + x.pts, 0), streak: streak(played, key) }
    } catch {
      return { done: false, score: 0, streak: 0 }
    }
  }, [key])

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.35 }}
      className="mt-8 flex flex-wrap items-center gap-x-5 gap-y-3 rounded-lg border border-rule bg-surface px-5 py-4"
    >
      <Target size={26} className="text-accent" aria-hidden />
      <div className="min-w-0 flex-1">
        <p className="m-0 font-semibold">Daily Yatra #{dayNumber(key)}</p>
        <p className="m-0 text-[14px] text-ink-2">
          {info.done ? `Done today: ${info.score}/${DAILY_LENGTH * 100}` : `${DAILY_LENGTH} stops across the map, 30 seconds each. Same for everyone today.`}
          {info.streak > 0 && (
            <span className="ml-2 inline-flex items-center gap-1 text-accent">
              <Fire weight="fill" aria-hidden /> {info.streak}
            </span>
          )}
        </p>
      </div>
      <Button asChild size="sm">
        <Link to="/practice">
          {info.done ? 'See result' : 'Play'} <ArrowRight aria-hidden />
        </Link>
      </Button>
    </motion.div>
  )
}

function PickState({ onPick }: { onPick: (s: State) => void }) {
  return (
    <section aria-labelledby="pick" className="mt-12">
      <h2 id="pick" className="m-0 text-[24px] leading-8">
        Which state are you from?
      </h2>
      <p className="mb-5 mt-1 max-w-[60ch] text-ink-2">Panels often open with your home state. Tap it once and its brief stays here.</p>
      <div className="grid gap-6 md:grid-cols-[minmax(0,380px)_1fr]">
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
    <section aria-labelledby="brief" className="mt-12 grid gap-6 md:grid-cols-[minmax(0,1fr)_minmax(0,300px)]">
      <div>
        <div className="flex flex-wrap items-baseline gap-x-3">
          <span className="text-[15px] text-ink-2">Your state</span>
          <button type="button" onClick={onChange} className="link ml-auto text-[14px]">
            Change
          </button>
        </div>
        <h2 id="brief" className="m-0 mt-1 text-[34px] leading-10">
          {s.name}
        </h2>
        <div className="mt-3">
          <Facts>
            <Fact label="Chief Minister">{cmText(s)}</Fact>
            <Fact label={governorTitle(s)}>{s.governor}</Fact>
            <Fact label="GSDP" rank={rankText(s, 'gsdp')} bar={<Bar value={s.gsdp} max={MAX_GSDP} />}>
              {fmtGsdp(s.gsdp)}
            </Fact>
            <Fact label="Lok Sabha seats" rank={rankText(s, 'ls')}>
              {s.ls}
            </Fact>
          </Facts>
        </div>
        <Link to={`/states/${s.slug}`} className="link mt-3 inline-flex items-center gap-1 text-[15px]">
          Full sheet with sources <ArrowRight aria-hidden />
        </Link>
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
    </section>
  )
}

function QuickLinks() {
  const { mastery } = useMastery()
  const { saved } = useBookmarks()
  const strong = STATES.filter((s) => (mastery[s.iso] ?? 0) >= 3).length
  const repo = WHO.find((w) => w.label === 'Repo rate')
  const links = [
    { to: '/states', icon: MapTrifold, label: 'States', note: '28 states, 8 UTs' },
    { to: '/practice', icon: Target, label: 'Practice', note: `${strong}/36 proficient` },
    { to: '/news', icon: Newspaper, label: 'News', note: saved.length ? `${saved.length} saved` : 'Last 3 days' },
    { to: '/guides', icon: BookOpenText, label: 'Guides', note: `${GUIDES.length} references` },
    { to: '/who', icon: Users, label: "Who's who", note: `Repo ${repo?.value}` },
  ]
  return (
    <nav aria-label="Sections" className="mt-12">
      <ul className="m-0 grid list-none grid-cols-2 gap-px overflow-hidden rounded-lg border border-rule bg-rule p-0 sm:grid-cols-5">
        {links.map((l, k) => (
          <motion.li
            key={l.to}
            initial={{ opacity: 0, y: 8 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: k * 0.05 }}
            className={k === 4 ? 'col-span-2 sm:col-span-1' : ''}
          >
            <Link to={l.to} className="group flex h-full items-center gap-3 bg-surface px-4 py-3.5 no-underline transition-colors hover:bg-tint">
              <l.icon size={22} className="shrink-0 text-ink-2 transition-colors group-hover:text-accent" aria-hidden />
              <span className="min-w-0">
                <span className="block font-semibold">{l.label}</span>
                <span className="num block truncate text-[13px] text-ink-2">{l.note}</span>
              </span>
            </Link>
          </motion.li>
        ))}
      </ul>
    </nav>
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
          className="m-0 max-w-[20ch] text-[32px] font-semibold leading-[36px] [font-stretch:85%] sm:text-[46px] sm:leading-[50px]"
        />
        <p className="mb-0 mt-3 max-w-[60ch] text-[16px] text-ink-2">Data as of {fmtDate(DATA_DATE)}. Every figure on a state sheet links to its source.</p>
        <TodayStrip />
      </div>

      {s ? <StateBrief s={s} onChange={() => pick(null)} /> : <PickState onPick={pick} />}

      <QuickLinks />
    </>
  )
}
