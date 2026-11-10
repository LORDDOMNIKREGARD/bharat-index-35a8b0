import type { ReactNode } from 'react'

/** Label–value rows, the way a yearbook sets them. */
export function Facts({ children }: { children: ReactNode }) {
  return <dl className="m-0 divide-y divide-rule border-y border-rule">{children}</dl>
}

export function Fact({
  label,
  children,
  rank,
  note,
  fn,
  bar,
}: {
  label: string
  children: ReactNode
  rank?: string
  note?: ReactNode
  /** Footnote number pointing at #src-N. */
  fn?: number
  /** Drawn under the value line, e.g. <Bar />. */
  bar?: ReactNode
}) {
  return (
    <div className="grid grid-cols-[minmax(0,5fr)_minmax(0,7fr)] gap-x-4 py-2.5 sm:grid-cols-[240px_1fr]">
      <dt className="text-ink-2">
        {label}
        {fn != null && (
          <sup className="ml-0.5">
            <a href={`#src-${fn}`} className="text-[11px] text-accent no-underline" aria-label={`Source ${fn}`}>
              {fn}
            </a>
          </sup>
        )}
      </dt>
      <dd className="m-0">
        <span className="num">{children}</span>
        {rank && <span className="num ml-2 text-[14px] text-ink-2">{rank}</span>}
        {bar}
        {note && <div className="text-[14px] text-ink-2">{note}</div>}
      </dd>
    </div>
  )
}

/** Thin share-of-maximum bar, drawn under a value. */
export function Bar({ value, max }: { value: number | null; max: number }) {
  if (value == null || !max) return null
  return (
    <span className="mt-1 block h-[3px] w-full max-w-40 bg-rule" aria-hidden>
      <span className="block h-full bg-data-4" style={{ width: `${Math.max((value / max) * 100, 1.5)}%` }} />
    </span>
  )
}
