// Run: npm test
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { BY_SLUG, STATES, TILE, cleanRivers, sortStates } from './index.ts'
import { fmtGsdp, ordinal } from '../utils/index.ts'

test('36 entries, unique slugs, ISO codes and tiles', () => {
  assert.equal(STATES.length, 36)
  assert.equal(new Set(STATES.map((s) => s.slug)).size, 36)
  assert.equal(new Set(STATES.map((s) => s.iso)).size, 36)
  for (const s of STATES) assert.ok(TILE[s.iso], `no tile for ${s.name} (${s.iso})`)
  assert.equal(new Set(Object.values(TILE).map(String)).size, 36, 'two tiles share a cell')
  assert.equal(STATES.filter((s) => s.isUT).length, 8)
})

test('ranks: biggest GSDP is 1st, missing GSDP has no rank', () => {
  const top = STATES.reduce((a, b) => ((b.gsdp ?? 0) > (a.gsdp ?? 0) ? b : a))
  assert.equal(top.rank.gsdp, 1)
  const dnh = BY_SLUG.get('dadra-and-nagar-haveli-and-daman-and-diu')!
  assert.equal(dnh.gsdp, null)
  assert.equal(dnh.rank.gsdp, null)
  assert.equal(fmtGsdp(dnh.gsdp), '—')
  const up = BY_SLUG.get('uttar-pradesh')!
  assert.equal(up.rank.ls, 1) // 80 seats, the most
})

test('missing values sort last in both directions', () => {
  assert.equal(sortStates(STATES, 'gsdp', 'desc').at(-1)!.gsdp, null)
  assert.equal(sortStates(STATES, 'gsdp', 'asc').at(-1)!.gsdp, null)
  assert.equal(sortStates(STATES, 'name', 'asc')[0].name, 'Andaman and Nicobar Islands')
})

test('river cleaning drops junk and duplicates', () => {
  assert.deepEqual(
    cleanRivers('Andhra Pradesh', ['Krishna River', 'Godavari River', 'River delta', 'List of rivers in Andhra Pradesh']),
    ['Krishna', 'Godavari'],
  )
  assert.deepEqual(cleanRivers('Bihar', ['Ganges', 'Ganga River', 'South Asian river dolphin', 'Koshi River']), ['Ganges', 'Koshi'])
  assert.deepEqual(cleanRivers('Delhi', ['Narmada River', 'Yamuna River']), ['Yamuna'])
  assert.deepEqual(cleanRivers('Tripura', ['Manu River, Tripura', 'Gumti River (transboundary river)']), ['Manu', 'Gumti'])
})

test('formatting', () => {
  assert.equal(fmtGsdp(1641000), '₹16.41 lakh Cr')
  assert.equal(fmtGsdp(45000), '₹45,000 Cr')
  assert.deepEqual([1, 2, 3, 4, 11, 12, 13, 21, 22, 36].map(ordinal), ['1st', '2nd', '3rd', '4th', '11th', '12th', '13th', '21st', '22nd', '36th'])
})
