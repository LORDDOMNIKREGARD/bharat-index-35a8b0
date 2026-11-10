import { useEffect, useMemo } from 'react'
import { Link, useNavigate } from 'react-router'
import { ArrowDown, ArrowUp, CaretDown, CaretUp } from '@phosphor-icons/react'
import { MAX_GSDP, METRICS, STATES, cmText, rankText } from '../data'
import { useStateFilter } from '../hooks/useStateFilter'
import { Bar } from '../components/Facts'
import { TileMap } from '../components/TileMap'
import { fmtGsdp } from '../utils'
import type { Kind, MetricKey, SortKey } from '../types'

const KINDS: { v: Kind; label: string }[] = [
  { v: 'all', label: 'All' },
  { v: 'state', label: 'States' },
  { v: 'ut', label: 'UTs' },
]

const COLS: { key: SortKey; label: string; num?: boolean }[] = [
  { key: 'name', label: 'State or UT' },
  { key: 'cm', label: 'Chief Minister' },
  { key: 'gsdp', label: 'GSDP', num: true },
  { key: 'inflation', label: 'Inflation', num: true },
  { key: 'ls', label: 'Lok Sabha', num: true },
  { key: 'rs', label: 'Rajya Sabha', num: true },
  { key: 'sexRatio', label: 'Sex ratio at birth', num: true },
]

function Segmented<T extends string>({ value, options, onChange, label }: {
  value: T
  options: { v: T; label: string }[]
  onChange: (v: T) => void
  label: string
}) {
  return (
    <div role="group" aria-label={label} className="flex rounded-ctl border border-rule bg-surface p-0.5">
      {options.map((o) => (
        <button
          key={o.v}
          type="button"
          aria-pressed={value === o.v}
          onClick={() => onChange(o.v)}
          className="rounded-ctl px-3 py-1.5 text-[15px] text-ink-2 aria-pressed:bg-ink aria-pressed:text-paper"
        >
          {o.label}
        </button>
      ))}
    </div>
  )
}

export default function States() {
  const f = useStateFilter(STATES)
  const navigate = useNavigate()
  const shown = useMemo(() => new Set(f.filtered.map((s) => s.slug)), [f.filtered])

  useEffect(() => {
    document.title = 'All states and union territories — Bharat Index'
  }, [])

  const count =
    f.filtered.length === STATES.length
      ? '36 states and union territories'
      : f.filtered.length === 0
        ? 'No matches'
        : `Showing ${f.filtered.length} of 36`

  const sortedMetric = f.sort === 'name' || f.sort === 'cm' ? null : f.sort

  return (
    <>
      <div className="pt-8">
        <h1 className="m-0 text-[32px] leading-9">States and union territories</h1>
        <p className="mb-0 mt-1 text-ink-2">28 states and 8 union territories. Tap a row for the full sheet and its sources.</p>
      </div>

      <div className="mt-6 flex flex-wrap items-center gap-3">
        <label className="w-full sm:w-72">
          <span className="sr-only">Search by state, Chief Minister or Governor</span>
          <input
            type="search"
            value={f.q}
            onChange={(e) => f.setQ(e.target.value)}
            placeholder="Search state, CM or Governor"
            className="w-full rounded-ctl border border-rule bg-surface px-3 py-2"
          />
        </label>
        <Segmented label="Show" value={f.kind} options={KINDS} onChange={f.setKind} />
        <Segmented
          label="View"
          value={f.view}
          options={[
            { v: 'table', label: 'Table' },
            { v: 'map', label: 'Map' },
          ]}
          onChange={f.setView}
        />
        <span className="num text-[15px] text-ink-2 sm:ml-auto" aria-live="polite">
          {count}
        </span>
      </div>

      {f.view === 'map' ? (
        <div className="mt-6">
          <label className="mb-4 flex items-center gap-2 text-[15px]">
            Shade by
            <select
              value={sortedMetric ?? 'gsdp'}
              onChange={(e) => f.setSort(e.target.value as MetricKey)}
              className="rounded-ctl border border-rule bg-surface px-2 py-1"
            >
              {(Object.keys(METRICS) as MetricKey[]).map((k) => (
                <option key={k} value={k}>
                  {METRICS[k].label}
                </option>
              ))}
            </select>
          </label>
          <TileMap metric={f.metric} highlight={shown} label={`Tile map of India shaded by ${METRICS[f.metric].label}`} />
          <p className="mt-2 max-w-[60ch] text-[14px] text-ink-2">
            Each square is one state or UT, placed roughly where it sits on the map. Not to scale.
          </p>
        </div>
      ) : (
        <>
          {/* Phones: a list showing the metric you sorted by. */}
          <div className="mt-5 sm:hidden">
            <div className="mb-2 flex items-center gap-2 text-[15px]">
              <label className="flex items-center gap-2">
                Sort by
                <select
                  value={f.sort}
                  onChange={(e) => f.setSort(e.target.value as SortKey)}
                  className="rounded-ctl border border-rule bg-surface px-2 py-1"
                >
                  {COLS.map((c) => (
                    <option key={c.key} value={c.key}>
                      {c.label}
                    </option>
                  ))}
                </select>
              </label>
              <button
                type="button"
                onClick={f.flipDir}
                className="flex items-center gap-1 rounded-ctl border border-rule bg-surface px-2 py-1"
              >
                {f.dir === 'asc' ? <ArrowUp size={14} aria-hidden /> : <ArrowDown size={14} aria-hidden />}
                {f.dir === 'asc' ? 'Ascending' : 'Descending'}
              </button>
            </div>
            <ul className="m-0 list-none divide-y divide-rule border-y border-rule p-0">
              {f.filtered.map((s) => (
                <li key={s.slug}>
                  <Link to={`/states/${s.slug}`} className="flex items-baseline justify-between gap-3 py-3 no-underline">
                    <span className="min-w-0">
                      <span className="block font-semibold">{s.name}</span>
                      <span className="block truncate text-[14px] text-ink-2">{cmText(s)}</span>
                    </span>
                    <span className="num shrink-0 text-right">
                      {sortedMetric ? METRICS[sortedMetric].fmt(METRICS[sortedMetric].get(s)) : fmtGsdp(s.gsdp)}
                      <span className="block text-[13px] text-ink-2">
                        {rankText(s, sortedMetric ?? 'gsdp') || (s.isUT ? 'UT' : 'State')}
                      </span>
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Tablet and up: a sortable table. */}
          <div className="mt-5 hidden overflow-x-auto sm:block lg:overflow-visible">
            <table className="w-full border-collapse text-[15px]">
              <caption className="sr-only">States and union territories. Column headers sort the table.</caption>
              <thead>
                <tr>
                  {COLS.map((c, i) => {
                    const active = f.sort === c.key
                    return (
                      <th
                        key={c.key}
                        scope="col"
                        aria-sort={active ? (f.dir === 'asc' ? 'ascending' : 'descending') : 'none'}
                        className={`z-10 border-b-2 border-ink bg-paper p-0 font-semibold lg:top-14 ${i === 0 ? 'sticky left-0 z-20' : 'lg:sticky'} ${c.num ? 'text-right' : 'text-left'}`}
                      >
                        <button
                          type="button"
                          onClick={() => f.toggleSort(c.key)}
                          className={`flex w-full items-center gap-1 px-3 py-2.5 ${c.num ? 'justify-end' : ''} ${active ? 'text-ink' : 'text-ink-2'}`}
                        >
                          {c.label}
                          {active ? (
                            f.dir === 'asc' ? <CaretUp size={12} aria-hidden /> : <CaretDown size={12} aria-hidden />
                          ) : (
                            <span className="w-3" />
                          )}
                        </button>
                      </th>
                    )
                  })}
                </tr>
              </thead>
              <tbody>
                {f.filtered.map((s) => (
                  <tr
                    key={s.slug}
                    onClick={(e) => {
                      if (!(e.target as HTMLElement).closest('a')) navigate(`/states/${s.slug}`)
                    }}
                    className="group cursor-pointer border-b border-rule hover:bg-tint"
                  >
                    <th scope="row" className="sticky left-0 bg-paper px-3 py-2.5 text-left font-semibold group-hover:bg-tint">
                      <Link to={`/states/${s.slug}`} className="no-underline hover:underline">
                        {s.name}
                      </Link>
                      {s.isUT && <span className="ml-2 text-[13px] font-normal text-ink-2">UT</span>}
                    </th>
                    <td className="px-3 py-2.5 text-ink-2">{cmText(s)}</td>
                    <td className="num px-3 py-2.5 text-right">
                      <span className="whitespace-nowrap">{fmtGsdp(s.gsdp)}</span>
                      <span className="flex justify-end">
                        <Bar value={s.gsdp} max={MAX_GSDP} />
                      </span>
                    </td>
                    <td className="num px-3 py-2.5 text-right">{METRICS.inflation.fmt(s.inflation)}</td>
                    <td className="num px-3 py-2.5 text-right">{s.ls}</td>
                    <td className="num px-3 py-2.5 text-right">{s.rs}</td>
                    <td className="num px-3 py-2.5 text-right">{s.sexRatio}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="mt-3 max-w-[70ch] text-[14px] text-ink-2">
            GSDP is for the latest fiscal year in the source (mostly 2024–25); the source has no figure for Dadra
            and Nagar Haveli and Daman and Diu. Inflation is CPI year on year for January 2026. Sex ratio is females per
            1,000 males from NFHS-5 (2019–21), at birth unless a state's sheet says otherwise.
          </p>
        </>
      )}
    </>
  )
}
