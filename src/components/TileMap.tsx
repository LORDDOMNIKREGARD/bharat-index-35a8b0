import { useState } from 'react'
import { Link } from 'react-router'
import { METRICS, RANKED, STATES, TILE, rankText } from '../data'
import type { MetricKey, State } from '../types'

const LEVEL = [
  'bg-paper border border-dashed border-rule text-ink-2',
  'bg-data-1 text-data-ink-light',
  'bg-data-2 text-data-ink-light',
  'bg-data-3 text-data-ink-light',
  'bg-data-4 text-data-ink-dark',
  'bg-data-5 text-data-ink-dark',
]

/** Top fifth by rank = 5 (darkest), bottom fifth = 1, no value = 0. */
function level(s: State, metric: MetricKey): number {
  const r = s.rank[metric]
  return r == null ? 0 : 5 - Math.floor(((r - 1) * 5) / RANKED[metric])
}

interface Props {
  metric: MetricKey
  /** Tiles not in this set are faded (used by search and the states/UTs filter). */
  highlight?: Set<string>
  /** If given, tiles are buttons that call this; otherwise they link to the state page. */
  onPick?: (s: State) => void
  label: string
}

/**
 * Each state or UT is one square in roughly its geographic place, shaded by rank.
 * Not a boundary map, on purpose: it needs no map data and is easier to tap.
 */
export function TileMap({ metric, highlight, onPick, label }: Props) {
  const [hover, setHover] = useState<State | null>(null)
  const m = METRICS[metric]

  return (
    <figure className="m-0">
      <div role="list" aria-label={label} className="grid max-w-[420px] grid-cols-8 gap-[3px]">
        {STATES.map((s) => {
          const [col, row] = TILE[s.iso]
          const lv = level(s, metric)
          const value = m.fmt(m.get(s))
          const rank = rankText(s, metric)
          const cls = `flex aspect-square items-center justify-center text-[13px] font-semibold no-underline transition-opacity hover:outline-2 hover:outline-ink ${LEVEL[lv]} ${
            highlight && !highlight.has(s.slug) ? 'opacity-25' : ''
          }`
          const aria = `${s.name}: ${m.short} ${value}${rank ? `, ${rank}` : ''}`
          const events = {
            onMouseEnter: () => setHover(s),
            onFocus: () => setHover(s),
            onMouseLeave: () => setHover(null),
            onBlur: () => setHover(null),
          }
          return (
            <div key={s.slug} role="listitem" style={{ gridColumn: col, gridRow: row }}>
              {onPick ? (
                <button type="button" aria-label={aria} className={`${cls} w-full`} onClick={() => onPick(s)} {...events}>
                  {s.iso}
                </button>
              ) : (
                <Link to={`/states/${s.slug}`} aria-label={aria} className={cls} {...events}>
                  {s.iso}
                </Link>
              )}
            </div>
          )
        })}
      </div>
      <figcaption className="mt-3 min-h-12 text-[14px] text-ink-2" aria-hidden>
        {hover ? (
          <>
            <span className="font-semibold text-ink">{hover.name}</span> · {m.short} {m.fmt(m.get(hover))}
            {rankText(hover, metric) && ` · ${rankText(hover, metric)}`}
          </>
        ) : (
          <span className="flex items-center gap-2">
            Lower
            {[1, 2, 3, 4, 5].map((l) => (
              <span key={l} className={`inline-block size-3.5 ${LEVEL[l]}`} />
            ))}
            Higher {m.short} (by rank, in fifths)
          </span>
        )}
      </figcaption>
    </figure>
  )
}
