import type { TickerItem } from '../types'

interface NewsTickerProps {
  items: TickerItem[]
  loading: boolean
  onRefresh: () => void
}

export function NewsTicker({ items, loading, onRefresh }: NewsTickerProps) {
  const doubled = [...items, ...items]

  return (
    <div className="flex h-[36px] items-stretch border-b border-iron bg-carbon font-inconsolata select-none">
      <div className="flex shrink-0 items-center border-r border-iron px-4 text-[12px] font-bold uppercase tracking-wider text-electric-lime">
        <span className="mr-2 inline-block h-2 w-2 rounded-full animate-pulse-dot bg-electric-lime" />
        SYSTEM_FEED
      </div>
      <div className="flex-1 overflow-hidden whitespace-nowrap py-2">
        <div className="animate-ticker inline-block">
          {doubled.map((item, i) => (
            <span key={`${item.text}-${i}`} className="inline-block px-10 text-[13px] text-paper font-medium">
              <span className="mr-2 text-smoke">[{item.tag}]</span>
              {item.text}
            </span>
          ))}
        </div>
      </div>
      <button
        type="button"
        onClick={onRefresh}
        disabled={loading}
        className="flex shrink-0 items-center gap-1.5 border-l border-iron px-4 text-[12px] font-bold text-smoke hover:text-electric-lime transition-colors disabled:opacity-50"
      >
        <span className={loading ? 'inline-block animate-spin' : 'inline-block'}>↻</span>
        {loading ? 'SYNCING' : 'RELOAD'}
      </button>
    </div>
  )
}
