import { useEffect } from 'react'
import { Link } from 'react-router'
import { AnimatePresence, motion } from 'motion/react'
import { ArrowLeft, ArrowRight } from '@phosphor-icons/react'
import { BY_SLUG, METRICS, STATES, cmText, rankText, sortStates } from '@/data'
import { useIndiaMap } from '@/hooks/useIndiaMap'
import { IndiaMap, MetricLegend, SeatLegend } from '@/components/IndiaMap'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { fmtGsdp } from '@/utils'
import type { MetricKey, State } from '@/types'

const panel = {
  initial: { opacity: 0, x: 16 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: -16 },
  transition: { duration: 0.25 },
}

function StatePanel({ s, onBack }: { s: State; onBack: () => void }) {
  const { map } = useIndiaMap()
  const seats = map?.seats.filter((x) => x.s === s.iso) ?? []
  const sc = seats.filter((x) => x.c === 'SC').length
  const st = seats.filter((x) => x.c === 'ST').length

  return (
    <motion.div key={s.slug} {...panel}>
      <Button variant="ghost" size="sm" onClick={onBack} className="-ml-2 text-ink-2">
        <ArrowLeft aria-hidden /> All of India
      </Button>
      <div className="mt-2 flex items-baseline gap-2">
        <h2 className="m-0 text-[28px] leading-8">{s.name}</h2>
        <Badge variant="secondary">{s.isUT ? 'UT' : 'State'}</Badge>
      </div>
      <dl className="mt-4 grid grid-cols-[auto_1fr] gap-x-4 gap-y-1.5 text-[15px]">
        <dt className="text-ink-2">Chief Minister</dt>
        <dd className="m-0">{cmText(s)}</dd>
        <dt className="text-ink-2">GSDP</dt>
        <dd className="num m-0">
          {fmtGsdp(s.gsdp)} <span className="text-[13px] text-ink-2">{rankText(s, 'gsdp')}</span>
        </dd>
        <dt className="text-ink-2">Lok Sabha</dt>
        <dd className="num m-0">
          {s.ls} {s.ls === 1 ? 'seat' : 'seats'}
          {(sc > 0 || st > 0) && (
            <span className="text-[13px] text-ink-2">
              {' '}
              · {[sc && `${sc} SC`, st && `${st} ST`].filter(Boolean).join(', ')} reserved
            </span>
          )}
        </dd>
        <dt className="text-ink-2">Rajya Sabha</dt>
        <dd className="num m-0">{s.rs}</dd>
      </dl>

      <div className="mt-5 text-[13px] text-ink-2">
        <SeatLegend />
      </div>
      {seats.length > 0 && (
        <details className="group mt-3" open={seats.length <= 14}>
          <summary className="cursor-pointer text-[15px] font-semibold marker:text-ink-3">
            {seats.length === 1 ? 'Constituency' : `All ${seats.length} constituencies`}
          </summary>
          <ul className="m-0 mt-2 columns-2 gap-4 p-0 text-[14px] leading-6">
            {seats.map((x) => (
              <li key={x.n} className="list-none break-inside-avoid">
                {x.n}
                {x.c !== 'GEN' && <span className={x.c === 'SC' ? 'ml-1 text-accent' : 'ml-1 text-good'}>{x.c}</span>}
              </li>
            ))}
          </ul>
        </details>
      )}

      <Button asChild className="mt-5">
        <Link to={`/states/${s.slug}`}>
          Full sheet with sources <ArrowRight aria-hidden />
        </Link>
      </Button>
    </motion.div>
  )
}

function IndiaPanel({ metric, onPick }: { metric: MetricKey; onPick: (s: State) => void }) {
  const m = METRICS[metric]
  const top = sortStates(STATES, metric, 'desc').slice(0, 5)
  return (
    <motion.div key="india" {...panel}>
      <h2 className="m-0 text-[22px] leading-7">All of India</h2>
      <p className="mb-4 mt-1 text-[15px] text-ink-2">
        Shaded by {m.label}. Tap any state to zoom in and see its Lok Sabha seats.
      </p>
      <div className="text-[13px] text-ink-2">
        <MetricLegend metric={metric} />
      </div>
      <h3 className="mb-1 mt-5 text-[15px] text-ink-2">Top five</h3>
      <ol className="m-0 list-none divide-y divide-rule border-y border-rule p-0">
        {top.map((s, i) => (
          <li key={s.slug}>
            <button
              type="button"
              onClick={() => onPick(s)}
              className="flex w-full items-baseline gap-3 py-2 text-left hover:bg-tint"
            >
              <span className="num w-4 text-ink-3">{i + 1}</span>
              <span className="flex-1">{s.name}</span>
              <span className="num text-ink-2">{m.fmt(m.get(s))}</span>
            </button>
          </li>
        ))}
      </ol>
    </motion.div>
  )
}

/** India map with a side panel: India overview, or one state zoomed in with its seats. */
export function MapExplorer({
  metric,
  focus,
  setFocus,
  highlight,
}: {
  metric: MetricKey
  focus: string | null
  setFocus: (slug: string | null) => void
  highlight?: Set<string>
}) {
  const s = focus ? BY_SLUG.get(focus) ?? null : null

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setFocus(null)
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [setFocus])

  return (
    <div className="grid gap-8 md:grid-cols-[minmax(0,580px)_minmax(0,360px)] md:justify-between">
      <IndiaMap
        fill={metric}
        focus={focus}
        seats
        highlight={s ? undefined : highlight}
        onSelect={(st) => setFocus(st.slug === focus ? null : st.slug)}
        label={`Map of India shaded by ${METRICS[metric].label}. Select a state to zoom in.`}
        caption={(hover, seat) =>
          seat ? (
            <>
              <span className="font-semibold text-ink">{seat.n}</span> constituency
              {seat.c !== 'GEN' && ` · reserved for ${seat.c}`}
            </>
          ) : hover ? (
            <>
              <span className="font-semibold text-ink">{hover.name}</span> · {METRICS[metric].short}{' '}
              {METRICS[metric].fmt(METRICS[metric].get(hover))}
              {rankText(hover, metric) && ` · ${rankText(hover, metric)}`}
            </>
          ) : s ? (
            'Hover or tap a dot to see the constituency.'
          ) : (
            'Hover a state for its figure; tap to zoom in.'
          )
        }
      />
      <div className="md:sticky md:top-20 md:self-start">
        <AnimatePresence mode="wait" initial={false}>
          {s ? <StatePanel s={s} onBack={() => setFocus(null)} /> : <IndiaPanel metric={metric} onPick={(st) => setFocus(st.slug)} />}
        </AnimatePresence>
      </div>
    </div>
  )
}
