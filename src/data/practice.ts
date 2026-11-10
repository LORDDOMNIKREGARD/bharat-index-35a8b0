// Map practice: question types, per-state mastery (after Khan Academy's levels) and
// weighted picking (after Anki: what you miss comes back sooner).
import type { State } from '../types/index.ts'

export const LEVELS = ['Not started', 'Attempted', 'Familiar', 'Proficient', 'Mastered'] as const
export type Level = 0 | 1 | 2 | 3 | 4
export type Mastery = Record<string, Level>

/** Right answer: one level up. Wrong: Proficient or Mastered drop to Familiar, anything else to Attempted. */
export function nextLevel(level: Level, correct: boolean): Level {
  if (correct) return Math.min(level + 1, 4) as Level
  return level >= 3 ? 2 : 1
}

export type Kind = 'find' | 'cm' | 'seats'
export interface Question {
  kind: Kind
  answer: State
  prompt: string
  hint: string
}

export function questionsFor(s: State, all: State[]): Question[] {
  const qs: Question[] = [{ kind: 'find', answer: s, prompt: `Find ${s.name}`, hint: 'Tap it on the map' }]
  if (s.cm) qs.push({ kind: 'cm', answer: s, prompt: s.cm, hint: `Tap the ${s.isUT ? 'UT' : 'state'} this person is Chief Minister of` })
  if (all.filter((x) => x.ls === s.ls).length === 1) {
    qs.push({ kind: 'seats', answer: s, prompt: `${s.ls} Lok Sabha seats`, hint: 'Tap the only state or UT with this many MPs' })
  }
  return qs
}

/**
 * n distinct states, each drawn with weight 5 - level, so a new state is five times as
 * likely as a mastered one. `rand` is injectable for tests.
 */
export function pickStates(all: State[], mastery: Mastery, n: number, rand = Math.random): State[] {
  const pool = [...all]
  const out: State[] = []
  while (out.length < n && pool.length) {
    const weights = pool.map((s) => 5 - (mastery[s.iso] ?? 0))
    let r = rand() * weights.reduce((a, b) => a + b, 0)
    let i = 0
    while (r >= weights[i] && i < pool.length - 1) r -= weights[i++]
    out.push(pool.splice(i, 1)[0])
  }
  return out
}

export function buildRound(all: State[], mastery: Mastery, n = 10, rand = Math.random): Question[] {
  return pickStates(all, mastery, n, rand).map((s) => {
    const qs = questionsFor(s, all)
    return qs[Math.floor(rand() * qs.length)]
  })
}
