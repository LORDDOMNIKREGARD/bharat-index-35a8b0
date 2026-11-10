import { useEffect, type CSSProperties } from 'react'
import { ArrowRight } from '@phosphor-icons/react'
import { GUIDES, guideProgress } from '@/data'
import SpotlightCard from '@/components/SpotlightCard'
import { Reveal } from '@/components/Reveal'
import { Badge } from '@/components/ui/badge'

// SpotlightCard ships its own light/dark palette; point it at the site tokens instead.
const CARD_VARS = {
  '--spotlight-card-surface': 'var(--bi-surface)',
  '--spotlight-card-border': 'var(--bi-rule)',
  '--spotlight-card-shadow': 'none',
} as CSSProperties

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
      <ul className="m-0 mt-8 grid list-none gap-4 p-0 sm:grid-cols-2">
        {GUIDES.map((g, i) => {
          const pct = guideProgress(g.file)
          return (
            <li key={g.file}>
              <Reveal delay={(i % 2) * 0.06} className="h-full">
                <SpotlightCard
                  theme="light"
                  spotlightColor="var(--bi-accent)"
                  intensity={0.35}
                  spotlightSize={260}
                  borderGlow={0.9}
                  className="h-full rounded-lg"
                  style={CARD_VARS}
                >
                  <a href={`/${g.file}`} className="group relative z-[2] flex h-full flex-col p-6 no-underline">
                    <div className="flex items-center justify-between gap-3">
                      <Badge variant="secondary">{g.subject}</Badge>
                      {pct > 2 && <span className="text-[13px] text-accent">{pct >= 98 ? 'Finished' : `${pct}% read`}</span>}
                    </div>
                    <h2 className="m-0 mt-4 text-[22px] leading-7">{g.title}</h2>
                    <p className="m-0 mt-1 flex-1 font-read text-[16px] leading-6 text-ink-2">{g.desc}</p>
                    {pct > 2 && (
                      <span className="mt-4 block h-[3px] w-full bg-rule" aria-hidden>
                        <span className="block h-full bg-accent" style={{ width: `${pct}%` }} />
                      </span>
                    )}
                    <span className="mt-4 inline-flex items-center gap-1 text-[15px] text-accent">
                      {pct > 2 && pct < 98 ? 'Continue reading' : 'Open guide'}
                      <ArrowRight aria-hidden className="transition-transform group-hover:translate-x-1" />
                    </span>
                  </a>
                </SpotlightCard>
              </Reveal>
            </li>
          )
        })}
      </ul>
    </>
  )
}
