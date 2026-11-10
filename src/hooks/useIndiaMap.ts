import { useEffect, useState } from 'react'

export interface Seat {
  /** ISO code of the state the constituency lies in */
  s: string
  /** Constituency name */
  n: string
  /** GEN, SC or ST (reservation) */
  c: 'GEN' | 'SC' | 'ST'
  x: number
  y: number
}

export interface IndiaMap {
  width: number
  height: number
  attribution: string
  states: Record<string, { d: string; box: [number, number, number, number] }>
  seats: Seat[]
}

// One fetch per page load, shared by every map on the page.
let cache: Promise<IndiaMap> | null = null
const load = () => (cache ??= fetch('/data/india-map.json').then((r) => {
  if (!r.ok) throw new Error(`Map data: HTTP ${r.status}`)
  return r.json()
}))

/** Projected outlines of the 36 states/UTs and the 543 Lok Sabha seats (scripts/build-map.mjs). */
export function useIndiaMap() {
  const [map, setMap] = useState<IndiaMap | null>(null)
  const [error, setError] = useState(false)
  useEffect(() => {
    let live = true
    load().then(
      (m) => live && setMap(m),
      () => {
        cache = null
        if (live) setError(true)
      },
    )
    return () => {
      live = false
    }
  }, [])
  return { map, error }
}
