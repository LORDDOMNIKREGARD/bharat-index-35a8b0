import { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { ArrowClockwise, ArrowUpRight, BookmarkSimple } from '@phosphor-icons/react'
import { TOPICS, useHeadlines } from '@/hooks/useHeadlines'
import { useBookmarks, type Saved } from '@/hooks/useBookmarks'
import { Segmented } from '@/components/Segmented'
import { Reveal } from '@/components/Reveal'
import { Button } from '@/components/ui/button'
import type { Headline } from '@/types'

const fmt = (d: Date | string | null) =>
  d ? new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }) : ''

function Item({ h, saved, onToggle }: { h: Headline | Saved; saved: boolean; onToggle: () => void }) {
  return (
    <div className="flex items-start gap-3 py-3">
      <div className="min-w-0 flex-1">
        <a href={h.link} target="_blank" rel="noopener noreferrer" className="group no-underline">
          <span className="font-read text-[17px] leading-6 group-hover:underline">{h.title}</span>
          <ArrowUpRight size={13} className="ml-1 inline text-ink-3" aria-label="(opens in a new tab)" />
        </a>
        <div className="mt-0.5 text-[13px] text-ink-2">{[h.source, fmt(h.date)].filter(Boolean).join(' · ')}</div>
      </div>
      <motion.button
        type="button"
        whileTap={{ scale: 0.85 }}
        onClick={onToggle}
        aria-pressed={saved}
        aria-label={saved ? 'Remove bookmark' : 'Bookmark this headline'}
        className={`mt-0.5 rounded-md p-1.5 transition-colors hover:bg-tint ${saved ? 'text-accent' : 'text-ink-3'}`}
      >
        <BookmarkSimple size={20} weight={saved ? 'fill' : 'regular'} aria-hidden />
      </motion.button>
    </div>
  )
}

export default function News() {
  const { groups, status, updatedAt, refresh } = useHeadlines(6)
  const { saved, isSaved, toggle } = useBookmarks()
  const [tab, setTab] = useState<'latest' | 'saved'>('latest')
  const topics = TOPICS.filter((t) => groups[t]?.length)

  useEffect(() => {
    document.title = 'News — Bharat Index'
  }, [])

  return (
    <div className="max-w-[860px]">
      <div className="flex flex-wrap items-end justify-between gap-4 pt-8">
        <div>
          <h1 className="m-0 text-[32px] leading-9">News</h1>
          <p className="mb-0 mt-1 text-ink-2">Headlines worth knowing for the panel, from the last three days. Bookmark the ones to revise.</p>
        </div>
        <Segmented
          label="Show"
          value={tab}
          onChange={setTab}
          options={[
            { v: 'latest', label: 'Latest' },
            { v: 'saved', label: `Saved${saved.length ? ` (${saved.length})` : ''}` },
          ]}
        />
      </div>

      {tab === 'latest' ? (
        <>
          <div className="mt-5 flex items-center justify-between gap-4 text-[14px] text-ink-2">
            <span aria-live="polite">
              {status === 'error'
                ? 'Headlines could not be loaded. Check your connection and try again.'
                : updatedAt
                  ? `From Google News. Updated ${updatedAt.toLocaleTimeString('en-IN', { hour: 'numeric', minute: '2-digit' })}.`
                  : 'Loading headlines…'}
            </span>
            <Button variant="ghost" size="sm" onClick={refresh} disabled={status === 'loading'} className="text-accent">
              <ArrowClockwise aria-hidden className={status === 'loading' ? 'animate-spin' : ''} />
              Refresh
            </Button>
          </div>

          {status === 'loading' && !topics.length && (
            <div className="mt-6 space-y-4" aria-hidden>
              {[0, 1, 2, 3].map((i) => (
                <div key={i} className="h-5 animate-pulse rounded bg-tint" style={{ width: `${90 - i * 12}%` }} />
              ))}
            </div>
          )}

          {topics.map((t, k) => (
            <Reveal key={t} delay={k * 0.05}>
              <section aria-labelledby={`topic-${t}`} className="mt-8">
                <h2 id={`topic-${t}`} className="m-0 border-b border-rule pb-1 text-[18px] text-ink-2">
                  {t}
                </h2>
                <ul className="m-0 list-none divide-y divide-rule p-0">
                  {groups[t].map((h) => (
                    <li key={h.link}>
                      <Item h={h} saved={isSaved(h.link)} onToggle={() => toggle(h)} />
                    </li>
                  ))}
                </ul>
              </section>
            </Reveal>
          ))}
        </>
      ) : saved.length === 0 ? (
        <div className="mt-10 rounded-lg border border-dashed border-rule p-8 text-center text-ink-2">
          <BookmarkSimple size={28} className="mx-auto text-ink-3" aria-hidden />
          <p className="mb-0 mt-2">Nothing saved yet. Tap the bookmark beside a headline to keep it here.</p>
        </div>
      ) : (
        <ul className="m-0 mt-6 list-none divide-y divide-rule border-y border-rule p-0">
          <AnimatePresence initial={false}>
            {saved.map((h) => (
              <motion.li key={h.link} layout exit={{ opacity: 0, x: 24 }} transition={{ duration: 0.2 }}>
                <Item h={h} saved onToggle={() => toggle(h)} />
              </motion.li>
            ))}
          </AnimatePresence>
        </ul>
      )}
      <p className="mt-8 text-[13px] text-ink-3">Bookmarks are saved in this browser only.</p>
    </div>
  )
}
