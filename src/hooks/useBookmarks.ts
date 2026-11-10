import { useCallback, useState } from 'react'
import { store } from '@/utils'
import type { Headline } from '@/types'

export interface Saved {
  title: string
  link: string
  source: string
  topic: string
  date: string | null
  savedAt: string
}

const KEY = 'bookmarks'

function read(): Saved[] {
  try {
    return JSON.parse(store.get(KEY) || '[]')
  } catch {
    return []
  }
}

/** Saved headlines, kept in this browser so they outlive the three-day feed. */
export function useBookmarks() {
  const [saved, setSaved] = useState<Saved[]>(read)

  const write = (next: Saved[]) => {
    store.set(KEY, JSON.stringify(next))
    setSaved(next)
  }

  const isSaved = useCallback((link: string) => saved.some((s) => s.link === link), [saved])

  const toggle = (h: Headline | Saved) => {
    const current = read()
    if (current.some((s) => s.link === h.link)) return write(current.filter((s) => s.link !== h.link))
    const date = h.date instanceof Date ? h.date.toISOString() : h.date
    write([{ title: h.title, link: h.link, source: h.source, topic: h.topic, date, savedAt: new Date().toISOString() }, ...current])
  }

  return { saved, isSaved, toggle }
}
