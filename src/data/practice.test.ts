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
