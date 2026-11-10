// Shape of state_data.json (written by scraper.py).
export interface StateRecord {
  state: string
  chief_minister: string | null
  governor: string
  parliamentary_metrics: { lok_sabha_seats: number; rajya_sabha_seats: number }
  economic_metrics: {
    gsdp_crore_inr: number | null
    gsdp_fiscal_year?: string | null
    consumer_price_index: number
    inflation_yoy_percent: number
    cpi_reference_month?: string
    cpi_sector?: string
  }
  demographics: {
    sex_ratio_females_per_1000_males: number
    sex_ratio_source?: string
    reference_period?: string
  }
  gi_tags: string[]
  rivers: string[]
  tourist_spots: string[]
}

export interface CabinetMember {
  name: string
  portfolio: string
}

export type MetricKey = 'gsdp' | 'inflation' | 'cpi' | 'ls' | 'rs' | 'sexRatio'
export type SortKey = 'name' | 'cm' | MetricKey
export type SortDir = 'asc' | 'desc'
export type Kind = 'all' | 'state' | 'ut'

export interface State {
  name: string
  slug: string
  iso: string
  isUT: boolean
  cm: string | null
  governor: string
  ls: number
  rs: number
  gsdp: number | null
  gsdpFy: string | null
  cpi: number
  cpiMonth: string | null
  cpiSector: string | null
  inflation: number
  sexRatio: number
  sexRatioSource: string | null
  sexRatioPeriod: string | null
  rivers: string[]
  rank: Record<MetricKey, number | null>
}

export interface Headline {
  topic: string
  title: string
  source: string
  link: string
  date: Date | null
  score: number
  isNoise: boolean
}
