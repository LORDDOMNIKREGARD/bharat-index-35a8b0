import raw from '../../state_data.json' with { type: 'json' }
import { UT_NAMES, fmtGsdp, ordinal, slugify, store } from '../utils/index.ts'
import type { CabinetMember, MetricKey, SortDir, SortKey, State, StateRecord } from '../types/index.ts'

export const DATA_DATE = new Date(raw.last_updated)
export const SOURCES = raw.source as Record<string, string>

// ISO 3166-2:IN subdivision codes (2023 revision: CG, TG, UK, OD, DH).
const ISO: Record<string, string> = {
  'Andaman and Nicobar Islands': 'AN', 'Andhra Pradesh': 'AP', 'Arunachal Pradesh': 'AR', Assam: 'AS',
  Bihar: 'BR', Chandigarh: 'CH', Chhattisgarh: 'CG', 'Dadra and Nagar Haveli and Daman and Diu': 'DH',
  Delhi: 'DL', Goa: 'GA', Gujarat: 'GJ', Haryana: 'HR', 'Himachal Pradesh': 'HP', 'Jammu and Kashmir': 'JK',
  Jharkhand: 'JH', Karnataka: 'KA', Kerala: 'KL', Ladakh: 'LA', Lakshadweep: 'LD', 'Madhya Pradesh': 'MP',
  Maharashtra: 'MH', Manipur: 'MN', Meghalaya: 'ML', Mizoram: 'MZ', Nagaland: 'NL', Odisha: 'OD',
  Puducherry: 'PY', Punjab: 'PB', Rajasthan: 'RJ', Sikkim: 'SK', 'Tamil Nadu': 'TN', Telangana: 'TG',
  Tripura: 'TR', 'Uttar Pradesh': 'UP', Uttarakhand: 'UK', 'West Bengal': 'WB',
}

// Tile-map position [column, row], roughly geographic. 8 x 8 grid.
export const TILE: Record<string, [number, number]> = {
  JK: [3, 1], LA: [4, 1],
  PB: [2, 2], CH: [3, 2], HP: [4, 2],
  HR: [3, 3], DL: [4, 3], UK: [5, 3], SK: [6, 3], AR: [8, 3],
  RJ: [3, 4], UP: [4, 4], BR: [5, 4], WB: [6, 4], AS: [7, 4], NL: [8, 4],
  GJ: [2, 5], MP: [3, 5], CG: [4, 5], JH: [5, 5], ML: [7, 5], MN: [8, 5],
  DH: [2, 6], MH: [3, 6], TG: [4, 6], OD: [5, 6], TR: [7, 6], MZ: [8, 6],
  GA: [2, 7], KA: [3, 7], AP: [4, 7],
  LD: [1, 8], KL: [3, 8], TN: [4, 8], PY: [5, 8], AN: [7, 8],
}

// The scraped river lists pick up article links that are not rivers, and a few rivers
// that do not flow through that state. Drop both; never add names here.
const NOT_A_RIVER = /^list of|rivers? (of|in)\b|river delta|river systems|dolphin|turtle|museum|reservoir|riverfront|river fork|dispute|valley|sa?raswati|sarasvati|drishadvati/i
const WRONG_STATE = new Set([
  'Delhi|Narmada', 'Uttar Pradesh|Narmada', 'Andaman and Nicobar Islands|Hooghly', 'Punjab|Indus', 'Punjab|Kabul',
  'Mizoram|Chindwin', 'Mizoram|Irrawaddy', 'Meghalaya|Brahmaputra', 'Chhattisgarh|Ganges', 'Chandigarh|Markanda',
  'Chandigarh|Sahibi', 'Punjab|Jhelum', 'Punjab|Chenab', 'Chhattisgarh|Narmada', 'West Bengal|Padma', 'Assam|Karatoya',
])

export function cleanRivers(state: string, list: string[]): string[] {
  const seen = new Set<string>()
  const out: string[] = []
  for (const item of list) {
    if (NOT_A_RIVER.test(item)) continue
    let n = item.replace(/\s*\(.*?\)\s*/g, '').replace(/,.*$/, '').replace(/\s+river$/i, '').trim()
    if (n === 'Ganga') n = 'Ganges'
    if (!n || WRONG_STATE.has(`${state}|${n}`) || seen.has(n.toLowerCase())) continue
    seen.add(n.toLowerCase())
    out.push(n)
  }
  return out
}

export const METRICS: Record<
  MetricKey,
  { label: string; short: string; get: (s: State) => number | null; fmt: (v: number | null) => string }
> = {
  gsdp: { label: 'GSDP', short: 'GSDP', get: (s) => s.gsdp, fmt: fmtGsdp },
  inflation: { label: 'Inflation, year on year', short: 'Inflation', get: (s) => s.inflation, fmt: (v) => (v == null ? '—' : `${v.toFixed(2)}%`) },
  cpi: { label: 'Consumer price index', short: 'CPI', get: (s) => s.cpi, fmt: (v) => (v == null ? '—' : v.toFixed(1)) },
  ls: { label: 'Lok Sabha seats', short: 'Lok Sabha', get: (s) => s.ls, fmt: (v) => (v == null ? '—' : String(v)) },
  rs: { label: 'Rajya Sabha seats', short: 'Rajya Sabha', get: (s) => s.rs, fmt: (v) => (v == null ? '—' : String(v)) },
  sexRatio: { label: 'Sex ratio at birth', short: 'Sex ratio', get: (s) => s.sexRatio, fmt: (v) => (v == null ? '—' : String(v)) },
}

/** Highest value = 1. Ties share a rank (1, 2, 2, 4). Missing values get null. */
export function rankBy(states: State[], get: (s: State) => number | null): Map<string, number | null> {
  const vals = states.map((s) => get(s)).filter((v): v is number => v != null)
  return new Map(states.map((s) => {
    const v = get(s)
    return [s.slug, v == null ? null : vals.filter((x) => x > v).length + 1]
  }))
}

function build(records: StateRecord[]): State[] {
  const list: State[] = records.map((r) => ({
    name: r.state,
    slug: slugify(r.state),
    iso: ISO[r.state] ?? '??',
    isUT: UT_NAMES.has(r.state),
    cm: r.chief_minister,
    governor: r.governor,
    ls: r.parliamentary_metrics.lok_sabha_seats,
    rs: r.parliamentary_metrics.rajya_sabha_seats,
    gsdp: r.economic_metrics.gsdp_crore_inr,
    gsdpFy: r.economic_metrics.gsdp_fiscal_year ?? null,
    cpi: r.economic_metrics.consumer_price_index,
    cpiMonth: r.economic_metrics.cpi_reference_month ?? null,
    cpiSector: r.economic_metrics.cpi_sector ?? null,
    inflation: r.economic_metrics.inflation_yoy_percent,
    sexRatio: r.demographics.sex_ratio_females_per_1000_males,
    sexRatioSource: r.demographics.sex_ratio_source ?? null,
    sexRatioPeriod: r.demographics.reference_period ?? null,
    rivers: cleanRivers(r.state, r.rivers),
    rank: { gsdp: null, inflation: null, cpi: null, ls: null, rs: null, sexRatio: null },
  }))
  for (const key of Object.keys(METRICS) as MetricKey[]) {
    const ranks = rankBy(list, METRICS[key].get)
    for (const s of list) s.rank[key] = ranks.get(s.slug) ?? null
  }
  return list.sort((a, b) => a.name.localeCompare(b.name))
}

export const STATES = build(raw.states as StateRecord[])
export const BY_SLUG = new Map(STATES.map((s) => [s.slug, s]))
export const MAX_GSDP = Math.max(...STATES.map((s) => s.gsdp ?? 0))

/** How many entries have a value for this metric (GSDP is missing for one UT). */
export const RANKED = Object.fromEntries(
  (Object.keys(METRICS) as MetricKey[]).map((k) => [k, STATES.filter((s) => s.rank[k] != null).length]),
) as Record<MetricKey, number>

/** "8th of 35", or "" when there is no value. */
export function rankText(s: State, key: MetricKey): string {
  const r = s.rank[key]
  return r == null ? '' : `${ordinal(r)} of ${RANKED[key]}`
}

/** Missing values always sort last, whichever direction. */
export function sortStates(list: State[], key: SortKey, dir: SortDir): State[] {
  const sign = dir === 'asc' ? 1 : -1
  const get = (s: State): string | number | null =>
    key === 'name' ? s.name : key === 'cm' ? s.cm : METRICS[key].get(s)
  return [...list].sort((a, b) => {
    const av = get(a)
    const bv = get(b)
    if (av == null || bv == null) return av == null && bv == null ? 0 : av == null ? 1 : -1
    if (typeof av === 'string') return av.localeCompare(bv as string) * sign
    return ((av as number) - (bv as number)) * sign
  })
}

export function governorTitle(s: State): string {
  return s.isUT ? 'Lt Governor / Administrator' : 'Governor'
}

export function cmText(s: State): string {
  if (s.cm) return s.cm
  return s.isUT ? 'None (no legislature)' : "President's rule"
}

// Union Cabinet. Portfolios arrive as one run-on string; split at each new title.
export const CABINET = (raw.cabinet as CabinetMember[]).map((m) => ({
  name: m.name,
  portfolios: m.portfolio.split(/\s+(?=(?:Minister of|Department of|All (?:important|other))\s)/),
}))

// Hand-maintained. Update `asOf` whenever a value is checked.
export const WHO = [
  { label: 'Prime Minister', value: 'Narendra Modi', note: 'Third term; sworn in 9 June 2024', asOf: 'June 2026' },
  { label: 'Chief Justice of India', value: 'Justice Surya Kant', note: '53rd CJI, since 24 November 2025; term ends 9 February 2027', asOf: 'June 2026' },
  { label: 'RBI Governor', value: 'Sanjay Malhotra', note: '', asOf: 'June 2026' },
  { label: 'Repo rate', value: '5.25%', note: 'Held at the 3–5 June 2026 MPC meeting; neutral stance', asOf: '5 June 2026' },
]

export const GUIDES = [
  { file: 'India_GK_IPM_Interview_Prep.html', title: 'India GK reference', subject: 'General knowledge', desc: 'History, polity, symbols and the questions panels ask most' },
  { file: 'mocktopus_current_affairs.html', title: 'Current affairs', subject: 'Current affairs', desc: 'Recent national and world events, with interview angles' },
  { file: 'india_govt_schemes_statewise.html', title: 'Government schemes, state by state', subject: 'Polity', desc: 'Central and state welfare schemes, 2025–26' },
  { file: 'geography_questions_ipm.html', title: 'Geography and geopolitics', subject: 'Geography', desc: 'Physiography, rivers, map points and neighbours' },
  { file: 'finance_bible_ipm.html', title: 'Finance bible', subject: 'Finance', desc: 'Markets, valuation and banking basics' },
  { file: 'ledger-room.html', title: 'The ledger room', subject: 'Commerce', desc: '200 commerce and business questions with answers' },
  { file: 'stats_ipm_guide.html', title: 'Statistics guide', subject: 'Statistics', desc: 'Core statistics and probability, from the start' },
  { file: 'Statistics_Master_Reference.html', title: 'Statistics master reference', subject: 'Statistics', desc: 'Formulas, distributions and deeper probability' },
  { file: 'ipm_math_graphs.html', title: 'Math graphs', subject: 'Mathematics', desc: 'The function graphs worth knowing by shape' },
  { file: 'pcm_interview_questions.html', title: 'Physics, chemistry and maths questions', subject: 'Science', desc: 'Concept questions for PCM students' },
]

/** Percent read, saved by /guide.js. */
export function guideProgress(file: string): number {
  try {
    return JSON.parse(store.get(`guide:/${file}`) || 'null')?.pct ?? 0
  } catch {
    return 0
  }
}
