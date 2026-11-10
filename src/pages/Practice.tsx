import { useEffect, useMemo, useRef, useState } from 'react'
import { Link } from 'react-router'
import { AnimatePresence, motion } from 'motion/react'
import { ArrowClockwise, ArrowRight, CheckCircle, XCircle } from '@phosphor-icons/react'
import { STATES, rankText } from '@/data'
import { LEVELS, buildRound, type Level, type Question } from '@/data/practice'
import { useMastery } from '@/hooks/useMastery'
import { IndiaMap } from '@/components/IndiaMap'
import { Segmented } from '@/components/Segmented'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import CountUp from '@/components/CountUp'
import type { State } from '@/types'

const ROUND = 10
// Mastery shading: none, then the data ramp from light to dark.
const MASTERY_FILL = ['var(--bi-paper)', 'var(--bi-data-1)', 'var(--bi-data-2)', 'var(--bi-data-4)', 'var(--bi-data-5)']

interface Answer {
  q: Question
  picked: State
  correct: boolean
  from: Level
  to: Level
}

function Quiz({ record, mastery }: ReturnType<typeof useMastery>) {
  const [round, setRound] = useState(() => buildRound(STATES, mastery, ROUND))
  const [answers, setAnswers] = useState<Answer[]>([])
  const [current, setCurrent] = useState<Answer | null>(null)
  const nextRef = useRef<HTMLButtonElement>(null)

  const i = answers.length
  const q = round[i] as Question | undefined
  const done = !q
  const score = answers.filter((a) => a.correct).length

  useEffect(() => {
    if (current) nextRef.current?.focus()
  }, [current])

  const answer = (s: State) => {
    if (!q || current) return
    const correct = s.slug === q.answer.slug
    const { from, to } = record(q.answer.iso, correct)
    setCurrent({ q, picked: s, correct, from, to })
  }
  const next = () => {
    if (current) setAnswers((a) => [...a, current])
    setCurrent(null)
  }
  const again = () => {
    setRound(buildRound(STATES, mastery, ROUND))
    setAnswers([])
    setCurrent(null)
  }

  const fill = (s: State) => {
    if (current) {
      if (s.slug === current.q.answer.slug) return 'var(--bi-good)'
      if (s.slug === current.picked.slug) return 'var(--bi-accent)'
    }
    return 'var(--bi-data-2)'
  }

  if (done) {
    const ups = answers.filter((a) => a.to > a.from)
    const misses = answers.filter((a) => !a.correct)
    return (
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="max-w-[640px]">
        <p className="m-0 text-ink-2">Round complete</p>
        <p className="num m-0 mt-1 text-[56px] font-semibold leading-none [font-stretch:85%]">
          <CountUp to={score} duration={0.9} />
          <span className="text-ink-3"> / {ROUND}</span>
        </p>
        <p className="mt-3 text-ink-2">
          {score === ROUND ? 'A clean round.' : score >= 7 ? 'Solid. The misses below will come back sooner.' : 'The misses below will come back more often until they stick.'}
        </p>
        {misses.length > 0 && (
          <>
            <h2 className="mb-2 mt-6 text-[18px]">Missed</h2>
            <ul className="m-0 list-none divide-y divide-rule border-y border-rule p-0">
              {misses.map((a) => (
                <li key={a.q.answer.slug} className="flex justify-between gap-4 py-2 text-[15px]">
                  <span>
                    <Link to={`/states/${a.q.answer.slug}`} className="link">
                      {a.q.answer.name}
                    </Link>
                    <span className="text-ink-2"> · you tapped {a.picked.name}</span>
                  </span>
                  <span className="shrink-0 text-ink-2">{LEVELS[a.to]}</span>
                </li>
              ))}
            </ul>
          </>
        )}
        {ups.length > 0 && <p className="mt-4 text-[15px] text-ink-2">Moved up: {ups.map((a) => `${a.q.answer.name} (${LEVELS[a.to]})`).join(', ')}.</p>}
        <Button onClick={again} className="mt-6">
          <ArrowClockwise aria-hidden /> Another round
        </Button>
      </motion.div>
    )
  }

  return (
    <div className="grid gap-8 md:grid-cols-[minmax(0,580px)_minmax(0,360px)] md:justify-between">
      <IndiaMap fill={fill} onSelect={answer} label="Quiz map. Select the state that answers the question." className="m-0 md:order-1" />
      <div className="sticky top-14 z-10 order-first -mx-4 border-b border-rule bg-paper/95 px-4 pb-3 pt-2 backdrop-blur-sm md:static md:top-20 md:order-2 md:mx-0 md:self-start md:border-0 md:bg-transparent md:p-0 md:backdrop-blur-none md:sticky">
        <div className="flex items-center justify-between text-[14px] text-ink-2">
          <span className="num">
            Question {i + 1} of {ROUND}
          </span>
          <span className="num">{score} right</span>
        </div>
        <Progress value={(i / ROUND) * 100} className="mt-2 h-1.5" />

        <AnimatePresence mode="wait">
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.22 }}
            className="mt-3 md:mt-6"
            aria-live="polite"
          >
            <p className="m-0 text-[14px] text-ink-2">{q.hint}</p>
            <p className="m-0 mt-0.5 text-[24px] font-semibold leading-7 [font-stretch:85%] md:text-[28px] md:leading-8">{q.prompt}</p>
          </motion.div>
        </AnimatePresence>

        <AnimatePresence>
          {current && (
            <motion.div
              initial={{ opacity: 0, scale: 0.97 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              className={`mt-3 rounded-md border p-3 md:mt-5 md:p-4 ${current.correct ? 'border-good bg-surface' : 'border-accent bg-surface'}`}
              role="status"
            >
              <p className={`m-0 flex items-center gap-2 font-semibold ${current.correct ? 'text-good' : 'text-accent'}`}>
                {current.correct ? <CheckCircle size={20} weight="fill" aria-hidden /> : <XCircle size={20} weight="fill" aria-hidden />}
                {current.correct ? 'Correct' : `That was ${current.picked.name}`}
              </p>
              <p className="m-0 mt-2 text-[15px]">
                <span className="font-semibold">{current.q.answer.name}</span>
                <span className="text-ink-2">
                  {' '}
                  · {current.q.answer.cm ? `CM ${current.q.answer.cm}` : 'no elected CM'} · {current.q.answer.ls} Lok Sabha {current.q.answer.ls === 1 ? 'seat' : 'seats'}
                  {rankText(current.q.answer, 'gsdp') && ` · ${rankText(current.q.answer, 'gsdp')} by GSDP`}
                </span>
              </p>
              <p className="m-0 mt-1 text-[13px] text-ink-2">
                {LEVELS[current.from]} → <span className="text-ink">{LEVELS[current.to]}</span>
              </p>
              <Button ref={nextRef} onClick={next} className="mt-4 w-full sm:w-auto">
                {i + 1 === ROUND ? 'See results' : 'Next question'} <ArrowRight aria-hidden />
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}

function ProgressView({ mastery, reset }: ReturnType<typeof useMastery>) {
  const [confirm, setConfirm] = useState(false)
  const counts = useMemo(() => {
    const c = [0, 0, 0, 0, 0]
    for (const s of STATES) c[mastery[s.iso] ?? 0]++
    return c
  }, [mastery])
  const strong = counts[3] + counts[4]

  return (
    <div className="grid gap-8 md:grid-cols-[minmax(0,580px)_minmax(0,360px)] md:justify-between">
      <IndiaMap
        fill={(s) => MASTERY_FILL[mastery[s.iso] ?? 0]}
        label="Your progress by state"
        caption={(h) => (h ? <><span className="font-semibold text-ink">{h.name}</span> · {LEVELS[mastery[h.iso] ?? 0]}</> : 'Hover a state to see its level.')}
      />
      <div className="md:sticky md:top-20 md:self-start">
        <p className="num m-0 text-[40px] font-semibold leading-none [font-stretch:85%]">
          <CountUp to={strong} duration={0.8} />
          <span className="text-ink-3"> / 36</span>
        </p>
        <p className="m-0 mt-1 text-ink-2">states at Proficient or Mastered</p>
        <Progress value={(strong / 36) * 100} className="mt-3 h-1.5" />
        <ul className="m-0 mt-5 list-none space-y-1.5 p-0 text-[15px]">
          {LEVELS.map((l, k) => (
            <li key={l} className="flex items-center gap-2">
              <span className="inline-block size-3.5 rounded-[2px] border border-rule" style={{ background: MASTERY_FILL[k] }} />
              <span className="flex-1">{l}</span>
              <span className="num text-ink-2">{counts[k]}</span>
            </li>
          ))}
        </ul>
        <p className="mt-5 text-[13px] text-ink-2">
          A right answer moves a state up one level. A miss drops Proficient and Mastered back to Familiar. Saved in this browser only.
        </p>
        <Button variant="outline" size="sm" className="mt-2" onClick={() => (confirm ? (reset(), setConfirm(false)) : setConfirm(true))}>
          {confirm ? 'Tap again to clear progress' : 'Reset progress'}
        </Button>
      </div>
    </div>
  )
}

export default function Practice() {
  const m = useMastery()
  const [tab, setTab] = useState<'quiz' | 'progress'>('quiz')

  useEffect(() => {
    document.title = 'Practice the map — Bharat Index'
  }, [])

  return (
    <>
      <div className="flex flex-wrap items-end justify-between gap-4 pt-8">
        <div>
          <h1 className="m-0 text-[32px] leading-9">Practice the map</h1>
          <p className="mb-0 mt-1 max-w-[56ch] text-ink-2">
            Ten questions a round. Tap the right state on the map. States you miss come back more often.
          </p>
        </div>
        <Segmented
          label="View"
          value={tab}
          onChange={setTab}
          options={[
            { v: 'quiz', label: 'Quiz' },
            { v: 'progress', label: 'Your progress' },
          ]}
        />
      </div>
      <div className="mt-6">{tab === 'quiz' ? <Quiz {...m} /> : <ProgressView {...m} />}</div>
    </>
  )
}
