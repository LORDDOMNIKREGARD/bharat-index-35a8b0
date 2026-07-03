import type { FilterMode } from '../types'

interface ControlsProps {
  searchQ: string
  onSearchChange: (q: string) => void
  filterMode: FilterMode
  onFilterChange: (mode: FilterMode) => void
  onSortSelect: (value: string) => void
  showing: number
  total: number
}

const FILTERS: { mode: FilterMode; label: string }[] = [
  { mode: 'all', label: 'All Units' },
  { mode: 'state', label: 'States Only' },
  { mode: 'ut', label: 'Union Territories' },
]

const SORT_OPTIONS = [
  { value: 'state', label: 'Alphabetical A–Z' },
  { value: 'gsdp', label: 'GSDP Output' },
  { value: 'inflation', label: 'Inflation Index' },
  { value: 'sex_ratio', label: 'Demographics (Sex Ratio)' },
  { value: 'ls', label: 'Lok Sabha Seats' },
  { value: 'cpi', label: 'Consumer Price Index' },
]

export function Controls({
  searchQ,
  onSearchChange,
  filterMode,
  onFilterChange,
  onSortSelect,
  showing,
  total,
}: ControlsProps) {
  return (
    <div className="flex flex-wrap items-center gap-4 bg-carbon border border-iron p-6 rounded-lg font-inter">
      {/* Search Input */}
      <input
        type="search"
        value={searchQ}
        onChange={(e) => onSearchChange(e.target.value)}
        placeholder="Search registry (state, CM, governor)…"
        className="min-w-[200px] flex-1 max-w-[320px] px-3.5 py-2.5 text-[14px] bg-void-black border border-iron rounded text-paper focus:border-electric-lime outline-none placeholder:text-smoke transition-colors"
      />

      {/* Sort Select */}
      <select
        defaultValue="state"
        onChange={(e) => onSortSelect(e.target.value)}
        className="px-3.5 py-2.5 text-[14px] font-semibold bg-void-black border border-iron rounded text-paper cursor-pointer outline-none hover:border-steel transition-colors"
      >
        {SORT_OPTIONS.map((o) => (
          <option key={o.value} value={o.value} className="bg-carbon">
            Sort: {o.label}
          </option>
        ))}
      </select>

      {/* Filter Buttons */}
      <div className="flex gap-2.5">
        {FILTERS.map(({ mode, label }) => (
          <button
            key={mode}
            type="button"
            onClick={() => onFilterChange(mode)}
            className={`px-4 py-2 text-[14px] font-bold rounded-lg border transition-all duration-150 ${
              filterMode === mode
                ? 'border-electric-lime bg-electric-lime text-void-black'
                : 'border-iron text-paper hover:bg-graphite'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Stats Counter */}
      <div className="ml-auto text-[14px] text-smoke font-mono">
        LOG_ROWCOUNT: <span className="text-electric-lime font-bold">{showing}</span> / {total}
      </div>
    </div>
  )
}
