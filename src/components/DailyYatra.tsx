import { useEffect, useMemo, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { ArrowRight, Check, Copy, Fire, Timer } from '@phosphor-icons/react'
import { STATES } from '@/data'
import {
  DAILY_LENGTH,
  DAILY_SECONDS,
  dailyRound,
  dayKey,
  dayNumber,
  markFor,
  points,
  shareText,
  streak as countStreak,
  type Mark,
} from '@/data/practice'
import { useMastery } from '@/hooks/useMastery'
import { IndiaMap, centre } from '@/components/IndiaMap'
import type { IndiaMap as MapData } from '@/hooks/useIndiaMap'
import { Button } from '@/components/ui/button'
import CountUp from '@/components/CountUp'
import { store } from '@/utils'
import type { State } from '@/types'

interface DayRecord {
  answers: { iso: string; picked: string | null; pts: number; mark: Mark }[]
}

const MARK_CLS: { [m in Mark]: string } = {
  fast: 'bg-good',
  slow: 'bg-[color-mix(in_srgb,var(--bi-good)_45%,var(--bi-paper))]',
  miss: 'bg-accent',
  timeout: 'bg-ink-3',
}

const readRecord = (key: string): DayRecord => {
  try {
    return JSON.parse(store.get(`daily:${key}`) || 'null') ?? { answers: [] }
  } catch {
    return { answers: [] }
  }
}
const readPlayed = (): Set<string> => {
  try {
    return new Set(JSON.parse(store.get('dailyPlayed') || '[]'))
  } catch {
    return new Set()
  }
}

/** Time until the next puzzle (midnight India time). */
function untilNext(): string {
  const ist = new Date(Date.now() + 5.5 * 3600_000)
  const left = 86_400_000 - ((ist.getTime() % 86_400_000) + 86_400_000) % 86_400_000
  const h = Math.floor(left / 3600_000)
  const m = Math.floor((left % 3600_000) / 60_000)
  return `${h}h ${m}m`
}

/** Overlay drawing the route through the given states, in order. */
function routeOverlay(isos: string[]) {
  return (map: MapData) => {
    const pts = isos.map((iso) => centre(map, iso))
    return (
      <g pointerEvents="none">
        {pts.slice(1).map((p, i) => (
          <motion.path
            key={`seg-${i}`}
            d={`M${pts[i][0]} ${pts[i][1]} L${p[0]} ${p[1]}`}
            stroke="var(--bi-accent)"
            strokeWidth={3}
            strokeDasharray="2 7"
            strokeLinecap="round"
            fill="none"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 0.7, ease: 'easeInOut' }}
          />
        ))}
        {pts.map((p, i) => (
          <motion.g key={`stop-${i}`} initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 400, damping: 18 }} style={{ transformBox: 'fill-box', transformOrigin: 'center' }}>
            <circle cx={p[0]} cy={p[1]} r={11} fill="var(--bi-accent)" stroke="var(--bi-paper)" strokeWidth={2.5} />
            <text x={p[0]} y={p[1]} textAnchor="middle" dominantBaseline="central" fontSize={11} fontWeight={700} fill="var(--bi-paper)">
              {i + 1}
            </text>
          </motion.g>
        ))}
      </g>
    )
  }
}

export function DailyYatra({ onUnlimited }: { onUnlimited: () => void }) {
  const key = useMemo(() => dayKey(), [])
  const round = useMemo(() => dailyRound(STATES, key), [key])
  const { record: recordMastery } = useMastery()
  const [rec, setRec] = useState<DayRecord>(() => readRecord(key))
  const [phase, setPhase] = useState<'intro' | 'play' | 'done'>(() => (readRecord(key).answers.length >= DAILY_LENGTH ? 'done' : 'intro'))
  const [left, setLeft] = useState(DAILY_SECONDS)
  const [feedback, setFeedback] = useState<{ picked: State | null; pts: number; correct: boolean } | null>(null)
  const [copied, setCopied] = useState(false)
  const deadline = useRef(0)
  const nextRef = useRef<HTMLButtonElement>(null)

  const i = rec.answers.length
  // While feedback shows, the question on screen is the one just answered.
  const shown = feedback ? i - 1 : i
  const q = round[Math.min(shown, DAILY_LENGTH - 1)]
  const score = rec.answers.reduce((a, x) => a + x.pts, 0)
  const played = readPlayed()
  const streak = countStreak(played, key)

  // Timer for the current question.
  useEffect(() => {
    if (phase !== 'play' || feedback) return
    deadline.current = performance.now() + DAILY_SECONDS * 1000
    setLeft(DAILY_SECONDS)
    const id = window.setInterval(() => {
      const s = Math.max(0, (deadline.current - performance.now()) / 1000)
      setLeft(s)
      if (s <= 0) {
        window.clearInterval(id)
        answer(null)
      }
    }, 100)
    return () => window.clearInterval(id)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase, i, feedback])

  useEffect(() => {
    if (feedback) nextRef.current?.focus()
  }, [feedback])

  function answer(picked: State | null) {
    if (feedback || phase !== 'play') return
    const secondsLeft = Math.max(0, (deadline.current - performance.now()) / 1000)
    const correct = picked?.slug === q.answer.slug
    const pts = points(correct, secondsLeft)
    recordMastery(q.answer.iso, correct)
    setFeedback({ picked, pts, correct })
    const next: DayRecord = { answers: [...rec.answers, { iso: q.answer.iso, picked: picked?.iso ?? null, pts, mark: markFor(correct, picked == null, pts) }] }
    store.set(`daily:${key}`, JSON.stringify(next))
    if (next.answers.length >= DAILY_LENGTH) store.set('dailyPlayed', JSON.stringify([...played, key]))
    setRec(next)
  }

  function next() {
    setFeedback(null)
    if (rec.answers.length >= DAILY_LENGTH) setPhase('done')
  }

  const route = rec.answers.filter((a) => a.mark === 'fast' || a.mark === 'slow').map((a) => a.iso)
  const fill = (s: State) => {
    if (feedback && phase === 'play') {
      if (s.iso === q.answer.iso) return 'var(--bi-good)'
      if (feedback.picked && s.slug === feedback.picked.slug) return 'var(--bi-accent)'
    }
    if (route.includes(s.iso)) return 'var(--bi-data-3)'
    return 'var(--bi-data-1)'
  }

  if (phase === 'intro') {
    return (
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="grid items-center gap-8 md:grid-cols-[minmax(0,1fr)_minmax(0,420px)]">
        <div>
          <p className="m-0 text-[15px] text-ink-2">Daily Yatra #{dayNumber(key)}</p>
          <h2 className="m-0 mt-1 text-[40px] leading-[44px] sm:text-[52px] sm:leading-[54px]">Seven stops across India</h2>
          <ul className="m-0 mt-5 list-none space-y-2 p-0 text-[16px]">
            <li className="flex items-center gap-2">
              <span className="num inline-flex size-7 items-center justify-center rounded-full bg-tint text-[14px]">7</span> places, the same for everyone today
            </li>
            <li className="flex items-center gap-2">
              <span className="inline-flex size-7 items-center justify-center rounded-full bg-tint">
                <Timer size={16} aria-hidden />
              </span>
              {DAILY_SECONDS} seconds each; faster answers score more
            </li>
            <li className="flex items-center gap-2">
              <span className="num inline-flex size-7 items-center justify-center rounded-full bg-tint text-[12px]">100</span> points a stop, up to {DAILY_LENGTH * 100}
            </li>
          </ul>
          <div className="mt-7 flex flex-wrap items-center gap-4">
            <Button size="lg" onClick={() => setPhase('play')}>
              {i > 0 ? `Resume at stop ${i + 1}` : 'Start today’s yatra'} <ArrowRight aria-hidden />
            </Button>
            {streak > 0 && (
              <span className="flex items-center gap-1.5 text-[15px] text-accent">
                <Fire weight="fill" aria-hidden /> {streak}-day streak
              </span>
            )}
          </div>
        </div>
        <IndiaMap fill={() => 'var(--bi-data-1)'} still label="Map of India" />
      </motion.div>
    )
  }

  if (phase === 'done') {
    const marks = rec.answers.map((a) => a.mark)
    const text = shareText(key, marks, score, streak)
    return (
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="grid gap-8 md:grid-cols-[minmax(0,1fr)_minmax(0,420px)]">
        <div>
          <p className="m-0 text-[15px] text-ink-2">Daily Yatra #{dayNumber(key)} · complete</p>
          <p className="num m-0 mt-2 text-[64px] font-semibold leading-none [font-stretch:85%]">
            <CountUp to={score} duration={1.2} />
            <span className="text-[28px] text-ink-3"> / {DAILY_LENGTH * 100}</span>
          </p>
          <div className="mt-4 flex gap-1.5" aria-label={`Results: ${marks.join(', ')}`}>
            {marks.map((m, k) => (
              <motion.span
                key={k}
                initial={{ scale: 0, rotate: -20 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ delay: 0.3 + k * 0.08, type: 'spring', stiffness: 400, damping: 16 }}
                className={`inline-block size-8 rounded-md ${MARK_CLS[m]}`}
              />
            ))}
          </div>
          <p className="mt-3 text-[14px] text-ink-2">Green: fast · pale green: right but slow · red: wrong · grey: out of time</p>
          {streak > 0 && (
            <p className="mt-4 flex items-center gap-1.5 text-[17px] text-accent">
              <Fire weight="fill" aria-hidden /> {streak}-day streak
            </p>
          )}
          <div className="mt-6 flex flex-wrap gap-3">
            <Button
              onClick={async () => {
                try {
                  await navigator.clipboard.writeText(text)
                  setCopied(true)
                } catch {
                  setCopied(false)
                }
              }}
            >
              {copied ? <Check aria-hidden /> : <Copy aria-hidden />}
              {copied ? 'Copied' : 'Copy result to share'}
            </Button>
            <Button variant="outline" onClick={onUnlimited}>
              Keep practising
            </Button>
          </div>
          <p className="mt-6 text-[15px] text-ink-2">Next yatra in {untilNext()}.</p>
        </div>
        <IndiaMap fill={fill} still label="Your route today" overlay={routeOverlay(route)} />
      </motion.div>
    )
  }

  return (
    <div className="grid gap-6 md:grid-cols-[minmax(0,580px)_minmax(0,360px)] md:justify-between">
      <IndiaMap fill={fill} onSelect={(s) => answer(s)} label="Daily Yatra map. Select the state that answers the question." className="m-0 md:order-1" overlay={routeOverlay(route)} />
      <div className="sticky top-14 z-10 order-first -mx-4 border-b border-rule bg-paper/95 px-4 pb-3 pt-2 backdrop-blur-sm md:static md:order-2 md:mx-0 md:self-start md:border-0 md:bg-transparent md:p-0 md:backdrop-blur-none">
        <div className="flex items-center justify-between text-[14px]">
          <div className="flex gap-1" aria-label={`Stop ${Math.min(i + 1, DAILY_LENGTH)} of ${DAILY_LENGTH}`}>
            {Array.from({ length: DAILY_LENGTH }, (_, k) => (
              <span key={k} className={`h-2 w-6 rounded-full ${k < rec.answers.length ? MARK_CLS[rec.answers[k].mark] : k === i ? 'bg-ink' : 'bg-rule'}`} />
            ))}
          </div>
          <span className="num relative font-semibold">
            <AnimatePresence>
              {feedback && feedback.pts > 0 && (
                <motion.span
                  key={i}
                  initial={{ opacity: 0, y: 0 }}
                  animate={{ opacity: 1, y: -22 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.6 }}
                  className="absolute right-0 text-good"
                >
                  +{feedback.pts}
                </motion.span>
              )}
            </AnimatePresence>
            {score} pts
          </span>
        </div>

        {/* Timer */}
        <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-rule" aria-hidden>
          <div
            className={`h-full rounded-full ${left < 8 ? 'bg-accent' : 'bg-ink'}`}
            style={{ width: `${(left / DAILY_SECONDS) * 100}%`, transition: 'width 100ms linear' }}
          />
        </div>
        <p className="num m-0 mt-1 text-right text-[12px] text-ink-2">{feedback ? '' : `${Math.ceil(left)}s`}</p>

        <AnimatePresence mode="wait">
          <motion.div key={shown} initial={{ opacity: 0, x: 24 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -24 }} transition={{ duration: 0.25 }} aria-live="polite">
            <p className="m-0 text-[14px] text-ink-2">{q.hint}</p>
            <p className="m-0 mt-0.5 text-[26px] font-semibold leading-8 [font-stretch:85%] md:text-[30px] md:leading-9">{q.prompt}</p>
          </motion.div>
        </AnimatePresence>

        <AnimatePresence>
          {feedback && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className={`mt-3 rounded-md border bg-surface p-3 md:mt-5 md:p-4 ${feedback.correct ? 'border-good' : 'border-accent'}`}
              role="status"
            >
              <p className={`m-0 font-semibold ${feedback.correct ? 'text-good' : 'text-accent'}`}>
                {feedback.correct ? `Right, +${feedback.pts}` : feedback.picked ? `That was ${feedback.picked.name}` : 'Out of time'}
              </p>
              <p className="m-0 mt-1 text-[15px]">
                It’s <span className="font-semibold">{q.answer.name}</span>
                <span className="text-ink-2">
                  {' '}
                  · {q.answer.cm ? `CM ${q.answer.cm}` : 'no elected CM'} · {q.answer.ls} Lok Sabha {q.answer.ls === 1 ? 'seat' : 'seats'}
                </span>
              </p>
              <Button ref={nextRef} onClick={next} className="mt-3 w-full sm:w-auto">
                {rec.answers.length >= DAILY_LENGTH ? 'See your yatra' : 'Next stop'} <ArrowRight aria-hidden />
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
