import { useState } from 'react'
import { useNavigate } from 'react-router'
import { MAX_GSDP, METRICS, RANKED, STATES, TILE, rankText } from '../data'
import type { MetricKey, State } from '../types'

// Fill and label colour per level. 0 = no value.
const FILL = ['var(--bi-paper)', 'var(--bi-data-1)', 'var(--bi-data-2)', 'var(--bi-data-3)', 'var(--bi-data-4)', 'var(--bi-data-5)']
const INK = ['var(--bi-ink-2)', 'var(--bi-data-ink-light)', 'var(--bi-data-ink-light)', 'var(--bi-data-ink-light)', 'var(--bi-data-ink-dark)', 'var(--bi-data-ink-dark)']

/** Top fifth by rank = 5 (darkest), bottom fifth = 1, no value = 0. */
function level(s: State, metric: MetricKey): number {
  const r = s.rank[metric]
  return r == null ? 0 : 5 - Math.floor(((r - 1) * 5) / RANKED[metric])
}

// Pointy-top hexes; even rows shift half a hex right so the grid interlocks.
const R = 26
const W = Math.sqrt(3) * R
const hexPoints = (r: number) =>
  Array.from({ length: 6 }, (_, i) => {
    const a = (Math.PI / 180) * (60 * i - 30)
    return `${(r * Math.cos(a)).toFixed(2)},${(r * Math.sin(a)).toFixed(2)}`
  }).join(' ')
const HEX = hexPoints(R)

const CELLS = STATES.map((s) => {
  const [col, row] = TILE[s.iso]
  return { s, row, col, x: (col + (row % 2 === 0 ? 0.5 : 0)) * W, y: row * 1.5 * R }
})
const PAD = 4
const minX = Math.min(...CELLS.map((c) => c.x)) - W / 2 - PAD
const maxX = Math.max(...CELLS.map((c) => c.x)) + W / 2 + PAD
const minY = Math.min(...CELLS.map((c) => c.y)) - R - PAD
const maxY = Math.max(...CELLS.map((c) => c.y)) + R + PAD

interface Props {
  metric: MetricKey
  /** Hexes not in this set are faded (search and the states/UTs filter). */
  highlight?: Set<string>
  /** If given, hexes are buttons that call this; otherwise they open the state page. */
  onPick?: (s: State) => void
  label: string
}

/**
 * A hex map: each state or UT is one hexagon in roughly its place, shaded by rank.
 * Not a boundary map, on purpose: it needs no map data, small UTs get the same
 * tap target as large states, and it stays legible on a phone.
 */
export function TileMap({ metric, highlight, onPick, label }: Props) {
  const [hover, setHover] = useState<State | null>(null)
  const navigate = useNavigate()
  const m = METRICS[metric]
  const act = (s: State) => (onPick ? onPick(s) : navigate(`/states/${s.slug}`))

  return (
    <figure className="m-0 max-w-[460px]">
      <svg
        viewBox={`${minX} ${minY} ${maxX - minX} ${maxY - minY}`}
        role="group"
        aria-label={label}
        className="block w-full select-none font-ui"
      >
        {CELLS.map(({ s, row, col, x, y }) => {
          const lv = level(s, metric)
          const value = m.fmt(m.get(s))
          const rank = rankText(s, metric)
          // Colour sweeps north to south when the metric changes, like a weather front.
          const sweep = { transition: 'fill 450ms ease', transitionDelay: `${row * 45 + col * 12}ms` }
          return (
            <g
              key={s.slug}
              transform={`translate(${x} ${y})`}
              role={onPick ? 'button' : 'link'}
              tabIndex={0}
              aria-label={`${s.name}: ${m.short} ${value}${rank ? `, ${rank}` : ''}`}
              className="cursor-pointer outline-none"
              style={{ opacity: highlight && !highlight.has(s.slug) ? 0.22 : 1, transition: 'opacity 200ms' }}
              onClick={() => act(s)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault()
                  act(s)
                }
              }}
              onMouseEnter={() => setHover(s)}
              onMouseLeave={() => setHover(null)}
              onFocus={() => setHover(s)}
              onBlur={() => setHover(null)}
            >
              <polygon
                points={HEX}
                fill={FILL[lv]}
                stroke={lv === 0 ? 'var(--bi-ink-3)' : 'var(--bi-paper)'}
                strokeWidth={lv === 0 ? 1 : 2.5}
                strokeDasharray={lv === 0 ? '3 2' : undefined}
                style={sweep}
              />
              <text textAnchor="middle" dominantBaseline="central" fontSize="12" fontWeight="600" fill={INK[lv]} style={sweep}>
                {s.iso}
              </text>
            </g>
          )
        })}
        {/* Drawn last so the outline sits above neighbouring hexes. */}
        {hover && (() => {
          const c = CELLS.find((c) => c.s === hover)!
          return (
            <polygon
              points={HEX}
              transform={`translate(${c.x} ${c.y})`}
              fill="none"
              stroke="var(--bi-ink)"
              strokeWidth={3}
              pointerEvents="none"
            />
          )
        })()}
      </svg>

      <figcaption className="mt-2 min-h-[56px] text-[14px] text-ink-2" aria-hidden>
        {hover ? (
          <div>
            <span className="font-semibold text-ink">{hover.name}</span>
            <span className="ml-2">{hover.isUT ? 'UT' : 'State'}</span>
            <div className="num">
              {m.label} <span className="text-ink">{m.fmt(m.get(hover))}</span>
              {rankText(hover, metric) && ` · ${rankText(hover, metric)}`}
            </div>
            {metric === 'gsdp' && hover.gsdp != null && (
              <span className="mt-1 block h-[3px] w-40 bg-rule">
                <span className="block h-full bg-data-4" style={{ width: `${Math.max((hover.gsdp / MAX_GSDP) * 100, 1.5)}%` }} />
              </span>
            )}
          </div>
        ) : (
          <span className="flex flex-wrap items-center gap-1.5">
            Lower
            {[1, 2, 3, 4, 5].map((l) => (
              <svg key={l} viewBox="-8 -9 16 18" className="h-[18px] w-4" aria-hidden>
                <polygon points={hexPoints(8)} fill={FILL[l]} />
              </svg>
            ))}
            Higher {m.short} · by rank, in fifths
          </span>
        )}
      </figcaption>
    </figure>
  )
}
