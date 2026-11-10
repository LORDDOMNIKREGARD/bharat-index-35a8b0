import { useMemo } from 'react'
import { useSearchParams } from 'react-router'
import { METRICS, sortStates } from '../data'
import type { Kind, MetricKey, SortDir, SortKey, State } from '../types'

const SORT_KEYS: SortKey[] = ['name', 'cm', ...(Object.keys(METRICS) as MetricKey[])]

/** Search, kind filter, sort and view, all kept in the URL so a view can be shared. */
export function useStateFilter(states: State[]) {
  const [params, setParams] = useSearchParams()

  const q = params.get('q') ?? ''
  const kind = (['state', 'ut'].includes(params.get('type') ?? '') ? params.get('type') : 'all') as Kind
  const sort = (SORT_KEYS.includes(params.get('sort') as SortKey) ? params.get('sort') : 'name') as SortKey
  const defaultDir: SortDir = sort === 'name' || sort === 'cm' ? 'asc' : 'desc'
  const dir = (params.get('dir') === 'asc' || params.get('dir') === 'desc' ? params.get('dir') : defaultDir) as SortDir
  const view: 'table' | 'map' = params.get('view') === 'map' ? 'map' : 'table'
  const metric: MetricKey = sort === 'name' || sort === 'cm' ? 'gsdp' : sort
  const focus = params.get('focus')

  const set = (patch: Record<string, string | null>) =>
    setParams(
      (prev) => {
        const next = new URLSearchParams(prev)
        for (const [k, v] of Object.entries(patch)) {
          if (v == null || v === '') next.delete(k)
          else next.set(k, v)
        }
        return next
      },
      { replace: true },
    )

  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase()
    const list = states.filter(
      (s) =>
        (kind === 'all' || (kind === 'ut') === s.isUT) &&
        (!needle ||
          s.name.toLowerCase().includes(needle) ||
          s.iso.toLowerCase() === needle ||
          (s.cm ?? '').toLowerCase().includes(needle) ||
          s.governor.toLowerCase().includes(needle)),
    )
    return sortStates(list, sort, dir)
  }, [states, q, kind, sort, dir])

  return {
    filtered,
    q,
    kind,
    sort,
    dir,
    view,
    metric,
    focus,
    setFocus: (slug: string | null) => set({ focus: slug }),
    setQ: (v: string) => set({ q: v }),
    setKind: (v: Kind) => set({ type: v === 'all' ? null : v }),
    setView: (v: 'table' | 'map') => set({ view: v === 'table' ? null : v, focus: null }),
    /** Same key flips direction; a new key starts from its natural direction. */
    toggleSort: (key: SortKey) => {
      if (key === sort) set({ dir: dir === 'asc' ? 'desc' : 'asc' })
      else set({ sort: key === 'name' ? null : key, dir: null })
    },
    setSort: (key: SortKey) => set({ sort: key === 'name' ? null : key, dir: null }),
    flipDir: () => set({ dir: dir === 'asc' ? 'desc' : 'asc' }),
  }
}
