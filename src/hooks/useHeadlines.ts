import { useCallback, useEffect, useState } from 'react'
import type { Headline } from '../types'

const RSS2JSON = 'https://api.rss2json.com/v1/api.json?rss_url='

const RSS_SOURCES = [
  {
    url: 'https://news.google.com/rss/search?q=%22Supreme+Court%22+OR+%22CJI%22+OR+%22Chief+Justice%22+site:thehindu.com+OR+site:indianexpress.com+when:3d&hl=en-IN&gl=IN&ceid=IN:en',
    topic: 'Courts',
  },
  {
    url: 'https://news.google.com/rss/search?q=%22RBI%22+OR+%22Reserve+Bank%22+OR+%22repo+rate%22+OR+%22monetary+policy%22+site:thehindu.com+OR+site:indianexpress.com+OR+site:livemint.com+when:3d&hl=en-IN&gl=IN&ceid=IN:en',
    topic: 'Economy',
  },
  {
    url: 'https://news.google.com/rss/search?q=%22Parliament%22+OR+%22Lok+Sabha%22+OR+%22Modi%22+OR+%22Union+Cabinet%22+site:thehindu.com+OR+site:indianexpress.com+when:3d&hl=en-IN&gl=IN&ceid=IN:en',
    topic: 'Politics',
  },
  {
    url: 'https://news.google.com/rss/search?q=%22Iran%22+OR+%22Gaza%22+OR+%22Ukraine%22+OR+%22G7%22+OR+%22United+Nations%22+site:thehindu.com+OR+site:bbc.com+OR+site:reuters.com+when:3d&hl=en-IN&gl=IN&ceid=IN:en',
    topic: 'World',
  },
  {
    url: 'https://news.google.com/rss/search?q=India+%22Test%22+OR+%22ODI%22+OR+%22FIFA%22+OR+%22Olympics%22+site:espncricinfo.com+OR+site:thehindu.com+OR+site:indianexpress.com+when:3d&hl=en-IN&gl=IN&ceid=IN:en',
    topic: 'Sport',
  },
  {
    url: 'https://news.google.com/rss/search?q=India+%22GDP%22+OR+%22inflation%22+OR+%22budget%22+OR+%22Sensex%22+OR+%22Nifty%22+site:livemint.com+OR+site:thehindu.com+when:3d&hl=en-IN&gl=IN&ceid=IN:en',
    topic: 'Economy',
  },
]

export const TOPICS = ['Politics', 'Economy', 'Courts', 'World', 'Sport']

const QUALITY_SOURCES = [
  'the hindu', 'indian express', 'hindustan times', 'livemint', 'mint', 'bbc', 'reuters', 'ndtv',
  'the wire', 'scroll', 'economic times', 'espncricinfo', 'pti', 'press trust',
]

const NOISE_PATTERNS = [
  /horoscope|astrology|zodiac/i,
  /\bads?\b|sponsored|promoted/i,
  /recipe|cooking|kitchen/i,
  /\bviral\b.{0,20}video/i,
  /click here|read more|watch now/i,
  /\d+ things you (didn't|should|must)/i,
  /whatsapp|instagram|tiktok|twitter trend/i,
  /weather forecast|temperature today/i,
  /lottery|lucky draw|prize/i,
  /\bsale\b|\bdeal\b|\bdiscount\b/i,
]

const HIGH_SIGNAL = [
  'supreme court', 'cji', 'rbi', 'parliament', 'lok sabha', 'rajya sabha', 'prime minister', 'president',
  'cabinet', 'minister', 'policy', 'verdict', 'treaty', 'agreement', 'ceasefire', 'election', 'constitution',
  'act', 'war', 'attack', 'crisis', 'sanctions', 'nuclear', 'diplomatic', 'gdp', 'inflation', 'repo rate',
  'budget', 'fiscal', 'deficit', 'india-china', 'india-pakistan', 'india-us', 'bilateral', 'test match',
  'world cup', 'olympic', 'championship',
]

interface FeedItem {
  title?: string
  link?: string
  pubDate?: string
}

function parseItem(item: FeedItem, defaultTopic: string): Headline {
  const raw = item.title || ''
  const dashIdx = raw.lastIndexOf(' - ')
  const title = dashIdx > 0 ? raw.slice(0, dashIdx).trim() : raw.trim()
  const source = dashIdx > 0 ? raw.slice(dashIdx + 3).trim() : ''

  const t = title.toLowerCase()
  let topic = defaultTopic
  if (/supreme court|cji|chief justice|high court/.test(t)) topic = 'Courts'
  else if (/\brbi\b|reserve bank|repo rate|monetary policy|gdp|sensex|nifty|inflation|budget|fiscal|deficit|rupee|stock market/.test(t)) topic = 'Economy'
  else if (/iran|ukraine|russia|gaza|israel|g7|nato|un |united nations|china|pakistan/.test(t)) topic = 'World'
  else if (/cricket|ipl|test match|odi|t20|fifa|olympic|football|tennis|chess/.test(t)) topic = 'Sport'
  else if (/parliament|lok sabha|rajya sabha|modi|cabinet|minister|bjp|congress|election/.test(t)) topic = 'Politics'

  let score = 0
  const tl = `${title} ${source}`.toLowerCase()
  HIGH_SIGNAL.forEach((kw) => {
    if (tl.includes(kw)) score += 2
  })
  const src = source.toLowerCase()
  QUALITY_SOURCES.forEach((q) => {
    if (src.includes(q)) score += 3
  })
  score += Math.min((title.match(/\b[A-Z][a-z]+\s[A-Z][a-z]+/g) || []).length, 3)
  if (title.split(' ').length < 5) score -= 3

  // rss2json returns UTC as "YYYY-MM-DD HH:MM:SS".
  const date = item.pubDate ? new Date(`${item.pubDate.replace(' ', 'T')}Z`) : null

  return {
    topic,
    title,
    source,
    link: item.link || '',
    date: date && !Number.isNaN(date.getTime()) ? date : null,
    score,
    isNoise: NOISE_PATTERNS.some((p) => p.test(title)),
  }
}

function deduplicate(items: Headline[]): Headline[] {
  const seen: string[] = []
  return items.filter((item) => {
    const fp = item.title.toLowerCase().split(/\s+/).slice(0, 6).join(' ')
    if (seen.some((s) => s.includes(fp) || fp.includes(s))) return false
    seen.push(fp)
    return true
  })
}

async function fetchOneFeed({ url, topic }: { url: string; topic: string }): Promise<Headline[]> {
  const res = await fetch(`${RSS2JSON}${encodeURIComponent(url)}&count=10`, { signal: AbortSignal.timeout(8000) })
  if (!res.ok) throw new Error(`HTTP ${res.status}`)
  const data = await res.json()
  if (data.status !== 'ok' || !data.items?.length) throw new Error('No items')
  return (data.items as FeedItem[]).map((item) => parseItem(item, topic))
}

export type HeadlineStatus = 'loading' | 'ok' | 'error'

/** Headlines grouped by topic, at most `perTopic` each. Fetched on mount and on refresh(). */
export function useHeadlines(perTopic = 5) {
  const [groups, setGroups] = useState<Record<string, Headline[]>>({})
  const [status, setStatus] = useState<HeadlineStatus>('loading')
  const [updatedAt, setUpdatedAt] = useState<Date | null>(null)

  const refresh = useCallback(async () => {
    setStatus('loading')
    const results = await Promise.allSettled(RSS_SOURCES.map(fetchOneFeed))
    const all = results.flatMap((r) => (r.status === 'fulfilled' ? r.value : []))
    const curated = deduplicate(
      all.filter((i) => !i.isNoise && i.score >= 0 && i.link).sort((a, b) => b.score - a.score),
    )
    if (!curated.length) {
      setStatus('error')
      return
    }
    const next: Record<string, Headline[]> = {}
    for (const h of curated) {
      const list = (next[h.topic] ??= [])
      if (list.length < perTopic) list.push(h)
    }
    setGroups(next)
    setUpdatedAt(new Date())
    setStatus('ok')
  }, [perTopic])

  useEffect(() => {
    refresh()
  }, [refresh])

  return { groups, status, updatedAt, refresh }
}
