import { useCallback, useState } from 'react'
import { nextLevel, type Level, type Mastery } from '@/data/practice'
import { store } from '@/utils'

const KEY = 'mastery'

function read(): Mastery {
  try {
    return JSON.parse(store.get(KEY) || '{}')
  } catch {
    return {}
  }
}

/** Per-state mastery level, saved in this browser. */
export function useMastery() {
  const [mastery, setMastery] = useState<Mastery>(read)

  const record = useCallback((iso: string, correct: boolean) => {
    const current = read()
    const from = (current[iso] ?? 0) as Level
    const to = nextLevel(from, correct)
    const next = { ...current, [iso]: to }
    store.set(KEY, JSON.stringify(next))
    setMastery(next)
    return { from, to }
  }, [])

  const reset = useCallback(() => {
    store.set(KEY, null)
    setMastery({})
  }, [])

  return { mastery, record, reset }
}
