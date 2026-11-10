import { useEffect } from 'react'
import { GUIDES, guideProgress } from '../data'

export default function Guides() {
  useEffect(() => {
    document.title = 'Study guides — Bharat Index'
  }, [])

  return (
    <>
      <div className="pt-8">
        <h1 className="m-0 text-[32px] leading-9">Study guides</h1>
        <p className="mb-0 mt-1 max-w-[60ch] text-ink-2">
          Ten long-form references for the IPM personal interview. Each one remembers where you stopped reading.
        </p>
      </div>
      <ol className="m-0 mt-6 max-w-[760px] list-none divide-y divide-rule border-y border-rule p-0">
        {GUIDES.map((g) => {
          const pct = guideProgress(g.file)
          return (
            <li key={g.file} className="py-4">
              <div className="flex items-baseline justify-between gap-4">
                <a href={`/${g.file}`} className="text-[19px] font-semibold no-underline hover:underline">
                  {g.title}
                </a>
                <span className="shrink-0 text-[14px] text-ink-2">{g.subject}</span>
              </div>
              <p className="m-0 mt-0.5 font-read text-[16px] text-ink-2">{g.desc}</p>
              {pct > 2 && (
                <div className="mt-2 flex items-center gap-2 text-[14px] text-accent">
                  <span className="block h-[3px] w-24 bg-rule" aria-hidden>
                    <span className="block h-full bg-accent" style={{ width: `${pct}%` }} />
                  </span>
                  {pct >= 98 ? 'Finished' : `Continue · ${pct}% read`}
                </div>
              )}
            </li>
          )
        })}
      </ol>
    </>
  )
}
