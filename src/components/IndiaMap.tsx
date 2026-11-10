import { useEffect, useMemo, useState, type ReactNode } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { METRICS, RANKED, STATES, rankText } from '@/data'
import { useIndiaMap, type Seat } from '@/hooks/useIndiaMap'
import type { MetricKey, State } from '@/types'

// Fill and label colour per rank level. 0 = no value.
export const LEVEL_FILL = ['var(--bi-paper)', 'var(--bi-data-1)', 'var(--bi-data-2)', 'var(--bi-data-3)', 'var(--bi-data-4)', 'var(--bi-data-5)']

/** Top fifth by rank = 5 (darkest), bottom fifth = 1, no value = 0. */
export function level(s: State, metric: MetricKey): number {
  const r = s.rank[metric]
  return r == null ? 0 : 5 - Math.floor(((r - 1) * 5) / RANKED[metric])
}

// Areas too small to tap at India scale get a dot marker.
const TINY = new Set(['CH', 'LD', 'PY', 'DH'])
const SEAT_FILL: Record<Seat['c'], string> = { GEN: 'var(--bi-surface)', SC: 'var(--bi-accent)', ST: 'var(--bi-good)' }

interface Props {
  /** Metric used for shading, or a function giving each state's fill (quiz, progress). */
  fill: MetricKey | ((s: State) => string)
  /** Zoomed-in state (slug), or null for all of India. */
  focus?: string | null
  /** Show one dot per Lok Sabha seat inside the focused state. */
  seats?: boolean
  /** Faded states (not in this set). */
  highlight?: Set<string>
  onSelect?: (s: State) => void
  /** Accessible name of the map. */
  label: string
  /** Shown under the map; receives the hovered state and seat. */
  caption?: (hover: State | null, seat: Seat | null) => ReactNode
  className?: string
}

export function IndiaMap({ fill, focus = null, seats = false, highlight, onSelect, label, caption, className }: Props) {
  const { map, error } = useIndiaMap()
  const [hover, setHover] = useState<State | null>(null)
  const [seat, setSeat] = useState<Seat | null>(null)
  const focused = focus ? STATES.find((s) => s.slug === focus) ?? null : null

  useEffect(() => setSeat(null), [focus])

  const fillOf = (s: State) => (typeof fill === 'function' ? fill(s) : LEVEL_FILL[level(s, fill)])

  const view = useMemo(() => {
    if (!map) return '0 0 1000 1144'
    if (!focused) return `0 0 ${map.width} ${map.height}`
    const [x, y, w, h] = map.states[focused.iso].box
    // Pad the state and keep a minimum size so tiny UTs don't zoom to a blur.
    const size = Math.max(w, h, 70) * 1.25
    return `${(x + w / 2 - size / 2).toFixed(1)} ${(y + h / 2 - size / 2).toFixed(1)} ${size.toFixed(1)} ${size.toFixed(1)}`
  }, [map, focused])

  const scale = useMemo(() => {
    const w = Number(view.split(' ')[2])
    return w / 1000 // 1 at India view, smaller when zoomed
  }, [view])

  if (error) {
    return <p className="rounded-md border border-rule bg-surface p-6 text-ink-2">The map could not load. Check your connection and reload the page.</p>
  }

  const stateSeats = map && focused && seats ? map.seats.filter((x) => x.s === focused.iso) : []

  return (
    <figure className={className ?? 'm-0'}>
      <div className="relative max-w-[580px]">
        {!map && <div className="aspect-[1000/1144] w-full animate-pulse rounded-md bg-tint" aria-label="Loading map" />}
        {map && (
          <motion.svg
            initial={false}
            animate={{ viewBox: view }}
            transition={{ type: 'spring', stiffness: 90, damping: 20, mass: 0.9 }}
            preserveAspectRatio="xMidYMid meet"
            role="group"
            aria-label={label}
            className="block aspect-[1000/1144] w-full touch-manipulation select-none"
            onMouseLeave={() => setHover(null)}
          >
            {STATES.map((s) => {
              const shape = map.states[s.iso]
              const isFocus = focused?.slug === s.slug
              const dim = (focused && !isFocus) || (highlight && !highlight.has(s.slug))
              return (
                <g
                  key={s.slug}
                  role="button"
                  tabIndex={0}
                  aria-label={`${s.name}${typeof fill === 'string' ? `: ${METRICS[fill].short} ${METRICS[fill].fmt(METRICS[fill].get(s))}${rankText(s, fill) ? `, ${rankText(s, fill)}` : ''}` : ''}`}
                  aria-pressed={isFocus}
                  className="cursor-pointer outline-none [&:focus-visible>path]:stroke-accent"
                  onClick={() => onSelect?.(s)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault()
                      onSelect?.(s)
                    }
                  }}
                  onMouseEnter={() => setHover(s)}
                  onFocus={() => setHover(s)}
                >
                  <motion.path
                    d={shape.d}
                    initial={false}
                    animate={{ fill: fillOf(s), opacity: dim ? (focused ? 0.35 : 0.25) : 1 }}
                    transition={{ duration: 0.45 }}
                    stroke="var(--bi-paper)"
                    strokeWidth={1.2 * scale}
                    strokeLinejoin="round"
                    fillRule="evenodd"
                  />
                  {TINY.has(s.iso) && !focused && (
                    <circle
                      cx={shape.box[0] + shape.box[2] / 2}
                      cy={shape.box[1] + shape.box[3] / 2}
                      r={7}
                      fill={fillOf(s)}
                      stroke="var(--bi-ink-2)"
                      strokeWidth={1.2}
                    />
                  )}
                </g>
              )
            })}

            {/* Outline of the hovered and focused state, drawn above its neighbours. */}
            {[focused, hover && hover !== focused ? hover : null].map((s, i) =>
              s ? (
                <path
                  key={i}
                  d={map.states[s.iso].d}
                  fill="none"
                  stroke={i === 0 ? 'var(--bi-ink)' : 'var(--bi-ink-2)'}
                  strokeWidth={(i === 0 ? 2.2 : 1.6) * scale}
                  strokeLinejoin="round"
                  pointerEvents="none"
                />
              ) : null,
            )}

            <AnimatePresence>
              {stateSeats.map((x, i) => (
                <motion.circle
                  key={`${x.s}-${x.n}`}
                  cx={x.x}
                  cy={x.y}
                  r={5.5 * scale}
                  fill={SEAT_FILL[x.c]}
                  stroke="var(--bi-ink)"
                  strokeWidth={1.2 * scale}
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: seat === x ? 1.5 : 1, opacity: 1 }}
                  exit={{ scale: 0, opacity: 0, transition: { duration: 0.15 } }}
                  transition={{ delay: 0.35 + Math.min(i * 0.012, 0.6), type: 'spring', stiffness: 300, damping: 18 }}
                  style={{ transformBox: 'fill-box', transformOrigin: 'center' }}
                  className="cursor-default"
                  onMouseEnter={() => setSeat(x)}
                  onMouseLeave={() => setSeat(null)}
                  onClick={(e) => {
                    e.stopPropagation()
                    setSeat(x)
                  }}
                >
                  <title>{`${x.n}${x.c !== 'GEN' ? ` (reserved for ${x.c})` : ''}`}</title>
                </motion.circle>
              ))}
            </AnimatePresence>
          </motion.svg>
        )}
      </div>
      {caption && <figcaption className="mt-2 min-h-[44px] text-[14px] text-ink-2">{caption(hover, seat)}</figcaption>}
      {map && <p className="m-0 mt-1 text-[12px] text-ink-3">{map.attribution}. Not to scale.</p>}
    </figure>
  )
}

export function MetricLegend({ metric }: { metric: MetricKey }) {
  return (
    <span className="flex flex-wrap items-center gap-1.5">
      Lower
      {[1, 2, 3, 4, 5].map((l) => (
        <span key={l} className="inline-block size-3.5 rounded-[2px]" style={{ background: LEVEL_FILL[l] }} />
      ))}
      Higher {METRICS[metric].short} · by rank, in fifths
    </span>
  )
}

export function SeatLegend() {
  return (
    <span className="flex flex-wrap items-center gap-x-4 gap-y-1">
      {(['GEN', 'SC', 'ST'] as const).map((c) => (
        <span key={c} className="flex items-center gap-1.5">
          <span className="inline-block size-3 rounded-full border border-ink" style={{ background: SEAT_FILL[c] }} />
          {c === 'GEN' ? 'General seat' : `Reserved for ${c}`}
        </span>
      ))}
    </span>
  )
}

