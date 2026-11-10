import { test } from 'node:test'
import assert from 'node:assert/strict'
import { STATES } from './index.ts'
import { buildRound, nextLevel, pickStates, questionsFor } from './practice.ts'

test('mastery moves like Khan Academy levels', () => {
  assert.equal(nextLevel(0, true), 1)
  assert.equal(nextLevel(3, true), 4)
  assert.equal(nextLevel(4, true), 4)
  assert.equal(nextLevel(4, false), 2)
  assert.equal(nextLevel(3, false), 2)
  assert.equal(nextLevel(2, false), 1)
  assert.equal(nextLevel(0, false), 1)
})

test('picks are distinct and favour states you have not mastered', () => {
  const mastered = Object.fromEntries(STATES.map((s) => [s.iso, 4 as const]))
  delete mastered.BR
  let bihar = 0
  for (let i = 0; i < 400; i++) if (pickStates(STATES, mastered, 1)[0].iso === 'BR') bihar++
  // Bihar has weight 5 against 35 x 1: expect about 5/40 = 12.5%, far above 1/36.
  assert.ok(bihar > 30, `Bihar picked ${bihar} times of 400`)
  const round = pickStates(STATES, {}, 10)
  assert.equal(new Set(round.map((s) => s.iso)).size, 10)
})

test('questions are answerable', () => {
  for (const s of STATES) {
    for (const q of questionsFor(s, STATES)) {
      if (q.kind === 'seats') assert.equal(STATES.filter((x) => x.ls === s.ls).length, 1)
      if (q.kind === 'cm') assert.ok(s.cm)
    }
  }
  assert.equal(buildRound(STATES, {}, 10).length, 10)
})

import { dailyRound, dayKey, dayNumber, points, shareText, streak } from './practice.ts'

test('daily round is the same for everyone on a date and differs across dates', () => {
  const a = dailyRound(STATES, '2026-11-11').map((q) => q.kind + q.answer.iso)
  const b = dailyRound(STATES, '2026-11-11').map((q) => q.kind + q.answer.iso)
  const c = dailyRound(STATES, '2026-11-12').map((q) => q.kind + q.answer.iso)
  assert.deepEqual(a, b)
  assert.notDeepEqual(a, c)
  assert.equal(a.length, 7)
  assert.equal(new Set(a.map((x) => x.slice(-2))).size, 7)
})

test('day key flips at midnight India time', () => {
  assert.equal(dayKey(new Date('2026-11-11T18:29:00Z')), '2026-11-11')
  assert.equal(dayKey(new Date('2026-11-11T18:31:00Z')), '2026-11-12')
  assert.equal(dayNumber('2026-11-11'), 1)
})

test('scoring, streaks and share text', () => {
  assert.equal(points(false, 30), 0)
  assert.equal(points(true, 30), 100)
  assert.equal(points(true, 0), 50)
  assert.equal(points(true, 15), 75)
  const today = '2026-11-14'
  assert.equal(streak(new Set(['2026-11-12', '2026-11-13', '2026-11-14']), today), 3)
  assert.equal(streak(new Set(['2026-11-12', '2026-11-13']), today), 2) // not played yet today
  assert.equal(streak(new Set(['2026-11-11', '2026-11-13']), today), 1)
  assert.equal(streak(new Set(), today), 0)
  assert.equal(shareText('2026-11-12', ['fast', 'miss'], 100, 2), 'Bharat Index · Daily Yatra #2\n🟩🟥  100/700\n🔥 2-day streak')
})
