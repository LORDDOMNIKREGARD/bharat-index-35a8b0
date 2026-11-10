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

// ---------------------------------------------------------------------------
// Daily Yatra: the same seven questions for everyone on a given date.

export const DAILY_LENGTH = 7
export const DAILY_SECONDS = 30
/** Day 1 of the daily game. */
const EPOCH = Date.UTC(2026, 10, 11)

/** "2026-11-11" in India time, so the puzzle flips at midnight IST for everyone. */
export function dayKey(now = new Date()): string {
  return new Date(now.getTime() + 5.5 * 3600_000).toISOString().slice(0, 10)
}

export function dayNumber(key: string): number {
  return Math.floor((Date.parse(`${key}T00:00:00Z`) - EPOCH) / 86_400_000) + 1
}

/** Small seeded generator (mulberry32) so a date always gives the same round. */
export function seeded(seed: string): () => number {
  let h = 1779033703 ^ seed.length
  for (let i = 0; i < seed.length; i++) h = Math.imul(h ^ seed.charCodeAt(i), 3432918353)
  let a = (h << 13) | (h >>> 19)
  return () => {
    a |= 0
    a = (a + 0x6d2b79f5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

export function dailyRound(all: State[], key: string): Question[] {
  return buildRound(all, {}, DAILY_LENGTH, seeded(`bharat-index:${key}`))
}

/** 0 for a miss; 50 for a right answer plus up to 50 more for speed. */
export function points(correct: boolean, secondsLeft: number): number {
  if (!correct) return 0
  return 50 + Math.round((50 * Math.max(0, Math.min(secondsLeft, DAILY_SECONDS))) / DAILY_SECONDS)
}

export type Mark = 'fast' | 'slow' | 'miss' | 'timeout'
export function markFor(correct: boolean, timedOut: boolean, pts: number): Mark {
  if (timedOut) return 'timeout'
  if (!correct) return 'miss'
  return pts >= 75 ? 'fast' : 'slow'
}

const EMOJI: Record<Mark, string> = { fast: '🟩', slow: '🟨', miss: '🟥', timeout: '⬛' }

export function shareText(key: string, marks: Mark[], score: number, streak: number): string {
  return [
    `Bharat Index · Daily Yatra #${dayNumber(key)}`,
    `${marks.map((m) => EMOJI[m]).join('')}  ${score}/${DAILY_LENGTH * 100}`,
    streak > 1 ? `🔥 ${streak}-day streak` : '',
  ]
    .filter(Boolean)
    .join('\n')
}

/** Consecutive days played, ending today or yesterday. `played` is a set of day keys. */
export function streak(played: Set<string>, today: string): number {
  const day = (k: string, back: number) => new Date(Date.parse(`${k}T00:00:00Z`) - back * 86_400_000).toISOString().slice(0, 10)
  let start = played.has(today) ? 0 : 1
  let n = 0
  while (played.has(day(today, start + n))) n++
  return n
}
