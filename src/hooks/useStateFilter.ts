import { useMemo, useState } from 'react'
import type { FilterMode, SortKey, StateRecord } from '../types'
import { UT_NAMES } from '../utils'

export function useStateFilter(states: StateRecord[]) {
  const [sortKey, setSortKey] = useState<SortKey>('state')
  const [sortDir, setSortDir] = useState(1)
  const [filterMode, setFilterMode] = useState<FilterMode>('all')
  const [searchQ, setSearchQ] = useState('')
  const [expanded, setExpanded] = useState<string | null>(null)

  const filtered = useMemo(() => {
    let data = [...states]

    if (filterMode === 'state') {
      data = data.filter((s) => !UT_NAMES.has(s.state))
    } else if (filterMode === 'ut') {
      data = data.filter((s) => UT_NAMES.has(s.state))
    }

    if (searchQ) {
      const q = searchQ.toLowerCase()
      data = data.filter(
        (s) =>
          s.state.toLowerCase().includes(q) ||
          (s.chief_minister || '').toLowerCase().includes(q) ||
          s.governor.toLowerCase().includes(q),
      )
    }

    data.sort((a, b) => {
      let av: string | number
      let bv: string | number

      switch (sortKey) {
        case 'state':
          av = a.state
          bv = b.state
          break
        case 'cm':
          av = a.chief_minister || ''
          bv = b.chief_minister || ''
          break
        case 'gov':
          av = a.governor
          bv = b.governor
          break
        case 'ls':
          av = a.parliamentary_metrics.lok_sabha_seats
          bv = b.parliamentary_metrics.lok_sabha_seats
          break
        case 'rs':
          av = a.parliamentary_metrics.rajya_sabha_seats
          bv = b.parliamentary_metrics.rajya_sabha_seats
          break
        case 'gsdp':
          av = a.economic_metrics.gsdp_crore_inr || 0
          bv = b.economic_metrics.gsdp_crore_inr || 0
          break
        case 'cpi':
          av = a.economic_metrics.consumer_price_index
          bv = b.economic_metrics.consumer_price_index
          break
        case 'inflation':
          av = a.economic_metrics.inflation_yoy_percent
          bv = b.economic_metrics.inflation_yoy_percent
          break
        case 'sex_ratio':
          av = a.demographics.sex_ratio_females_per_1000_males
          bv = b.demographics.sex_ratio_females_per_1000_males
          break
        default:
          av = a.state
          bv = b.state
      }

      if (typeof av === 'string') {
        return av.localeCompare(bv as string) * sortDir
      }
      return ((av as number) - (bv as number)) * sortDir
    })

    return data
  }, [states, filterMode, searchQ, sortKey, sortDir])

  const toggleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDir((d) => d * -1)
    } else {
      setSortKey(key)
      setSortDir(key === 'state' ? 1 : -1)
    }
  }

  const handleSortSelect = (value: string) => {
    const key = value as SortKey
    setSortKey(key)
    setSortDir(key === 'state' ? 1 : -1)
  }

  const toggleExpand = (stateName: string) => {
    setExpanded((prev) => (prev === stateName ? null : stateName))
  }

  return {
    filtered,
    sortKey,
    sortDir,
    filterMode,
    setFilterMode,
    searchQ,
    setSearchQ,
    expanded,
    toggleExpand,
    toggleSort,
    handleSortSelect,
  }
}
