export interface ParliamentaryMetrics {
  lok_sabha_seats: number
  rajya_sabha_seats: number
}

export interface EconomicMetrics {
  gsdp_crore_inr: number | null
  gsdp_fiscal_year?: string | null
  consumer_price_index: number
  inflation_yoy_percent: number
  cpi_reference_month?: string
  cpi_sector?: string
}

export interface Demographics {
  sex_ratio_females_per_1000_males: number
  male_to_female_ratio?: number
  sex_ratio_source?: string
  reference_period?: string
}

export interface StateRecord {
  state: string
  chief_minister: string | null
  governor: string
  parliamentary_metrics: ParliamentaryMetrics
  economic_metrics: EconomicMetrics
  demographics: Demographics
  gi_tags: string[]
  rivers: string[]
  tourist_spots: string[]
}

export interface CabinetMember {
  name: string
  portfolio: string
}

export interface StateDataFile {
  source: Record<string, string>
  last_updated: string
  total_states_and_uts: number
  states: StateRecord[]
  cabinet: CabinetMember[]
}

export interface RiverDetail {
  n: string
  d: string
}

export interface GiTag {
  n: string
  t: 'food' | 'craft'
}

export interface TourismSpot {
  icon: string
  n: string
  d: string
}

export interface StateDetail {
  rivers: RiverDetail[]
  gi: GiTag[]
  tourism: TourismSpot[]
}

export interface TickerItem {
  tag: string
  cls: string
  text: string
  score?: number
  isNoise?: boolean
}

export type SortKey =
  | 'state'
  | 'cm'
  | 'gov'
  | 'ls'
  | 'rs'
  | 'gsdp'
  | 'cpi'
  | 'inflation'
  | 'sex_ratio'

export type FilterMode = 'all' | 'state' | 'ut'
