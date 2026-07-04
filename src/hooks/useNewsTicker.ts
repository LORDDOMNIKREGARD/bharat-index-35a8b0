import { useCallback, useEffect, useState } from 'react'
import type { TickerItem } from '../types'

const RSS2JSON = 'https://api.rss2json.com/v1/api.json?rss_url='

const RSS_SOURCES = [
  {
    url: 'https://news.google.com/rss/search?q=%22Supreme+Court%22+OR+%22CJI%22+OR+%22Chief+Justice%22+site:thehindu.com+OR+site:indianexpress.com+when:3d&hl=en-IN&gl=IN&ceid=IN:en',
    tag: 'SC/CJI',
    cls: 'cji',
  },
  {
    url: 'https://news.google.com/rss/search?q=%22RBI%22+OR+%22Reserve+Bank%22+OR+%22repo+rate%22+OR+%22monetary+policy%22+site:thehindu.com+OR+site:indianexpress.com+OR+site:livemint.com+when:3d&hl=en-IN&gl=IN&ceid=IN:en',
    tag: 'RBI/ECO',
    cls: 'rbi',
  },
  {
    url: 'https://news.google.com/rss/search?q=%22Parliament%22+OR+%22Lok+Sabha%22+OR+%22Modi%22+OR+%22Union+Cabinet%22+site:thehindu.com+OR+site:indianexpress.com+when:3d&hl=en-IN&gl=IN&ceid=IN:en',
    tag: 'POLITICS',
    cls: '',
  },
  {
    url: 'https://news.google.com/rss/search?q=%22Iran%22+OR+%22Gaza%22+OR+%22Ukraine%22+OR+%22G7%22+OR+%22United+Nations%22+site:thehindu.com+OR+site:bbc.com+OR+site:reuters.com+when:3d&hl=en-IN&gl=IN&ceid=IN:en',
    tag: 'WORLD',
    cls: 'world',
  },
  {
    url: 'https://news.google.com/rss/search?q=India+%22Test%22+OR+%22ODI%22+OR+%22FIFA%22+OR+%22Olympics%22+site:espncricinfo.com+OR+site:thehindu.com+OR+site:indianexpress.com+when:3d&hl=en-IN&gl=IN&ceid=IN:en',
    tag: 'SPORT',
    cls: 'sport',
  },
  {
    url: 'https://news.google.com/rss/search?q=India+%22GDP%22+OR+%22inflation%22+OR+%22budget%22+OR+%22Sensex%22+OR+%22Nifty%22+site:livemint.com+OR+site:thehindu.com+when:3d&hl=en-IN&gl=IN&ceid=IN:en',
    tag: 'MARKETS',
    cls: 'rbi',
  },
]

const QUALITY_SOURCES = new Set([
  'the hindu',
  'indian express',
  'hindustan times',
  'livemint',
  'mint',
  'bbc',
  'reuters',
  'ndtv',
  'the wire',
  'scroll',
  'economic times',
  'espncricinfo',
  'pti',
  'press trust',
])

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
  'supreme court',
  'cji',
  'rbi',
  'parliament',
  'lok sabha',
  'rajya sabha',
  'prime minister',
  'president',
  'cabinet',
  'minister',
  'policy',
  'verdict',
  'treaty',
  'agreement',
  'ceasefire',
  'election',
  'constitution',
  'act',
  'war',
  'attack',
  'crisis',
  'sanctions',
  'nuclear',
  'diplomatic',
  'gdp',
  'inflation',
  'repo rate',
  'budget',
  'fiscal',
  'deficit',
  'india-china',
  'india-pakistan',
  'india-us',
  'bilateral',
  'test match',
  'world cup',
  'olympic',
  'championship',
]

const FALLBACK_NEWS: TickerItem[] = [
  {
    tag: 'SC/CJI',
    cls: 'cji',
    text: 'CJI Surya Kant — 53rd Chief Justice · Tenure until Feb 2027 · 5 new SC judges sworn Jun 2026',
  },
  {
    tag: 'RBI/ECO',
    cls: 'rbi',
    text: 'RBI repo rate 5.25% · Neutral stance · Governor Sanjay Malhotra · MPC Jun 5, 2026',
  },
  {
    tag: 'WORLD',
    cls: 'world',
    text: 'US-Iran conflict ongoing · Strait of Hormuz tensions · IAEA nuclear framework talks',
  },
  {
    tag: 'POLITICS',
    cls: '',
    text: 'Modi Cabinet 3.0 · 72 ministers · NDA coalition · BJP-led government',
  },
  {
    tag: 'SPORT',
    cls: 'sport',
    text: 'Afghanistan cricket tour India · 1 Test + 3 ODIs · Jun 6–20, 2026',
  },
  {
    tag: 'MARKETS',
    cls: 'rbi',
    text: 'India GDP outlook stable · Rupee watch amid West Asia geopolitical risk',
  },
]

function parseItem(
  item: { title?: string },
  defaultTag: string,
  defaultCls: string,
): TickerItem {
  const raw = item.title || ''
  const dashIdx = raw.lastIndexOf(' - ')
  const headline = dashIdx > 0 ? raw.slice(0, dashIdx).trim() : raw.trim()
  const publisher = dashIdx > 0 ? raw.slice(dashIdx + 3).trim() : ''

  const t = headline.toLowerCase()
  let tag = defaultTag
  let cls = defaultCls
  if (/supreme court|cji|chief justice|high court/.test(t)) {
    tag = 'SC/CJI'
    cls = 'cji'
  } else if (/\brbi\b|reserve bank|repo rate|monetary policy/.test(t)) {
    tag = 'RBI/ECO'
    cls = 'rbi'
  } else if (
    /iran|ukraine|russia|gaza|israel|g7|nato|un |united nations|china|pakistan/.test(t)
  ) {
    tag = 'WORLD'
    cls = 'world'
  } else if (
    /cricket|ipl|test match|odi|t20|fifa|olympic|football|tennis|chess/.test(t)
  ) {
    tag = 'SPORT'
    cls = 'sport'
  } else if (
    /parliament|lok sabha|rajya sabha|modi|cabinet|minister|bjp|congress|election/.test(t)
  ) {
    tag = 'POLITICS'
    cls = ''
  } else if (/gdp|sensex|nifty|inflation|budget|fiscal|deficit|rupee|stock market/.test(t)) {
    tag = 'MARKETS'
    cls = 'rbi'
  }

  let score = 0
  const tl = `${headline} ${publisher}`.toLowerCase()
  HIGH_SIGNAL.forEach((kw) => {
    if (tl.includes(kw)) score += 2
  })
  const pubLower = publisher.toLowerCase()
  QUALITY_SOURCES.forEach((src) => {
    if (pubLower.includes(src)) score += 3
  })
  const namedEntities = (headline.match(/\b[A-Z][a-z]+\s[A-Z][a-z]+/g) || []).length
  score += Math.min(namedEntities, 3)
  if (headline.split(' ').length < 5) score -= 3

  const isNoise = NOISE_PATTERNS.some((p) => p.test(headline))
  const short = headline.length > 105 ? `${headline.slice(0, 103)}…` : headline
  const text = publisher ? `${short} — ${publisher}` : short

  return { tag, cls, text, score, isNoise }
}

function deduplicate(items: TickerItem[]): TickerItem[] {
  const seen: string[] = []
  return items.filter((item) => {
    const fp = item.text.toLowerCase().split(/\s+/).slice(0, 6).join(' ')
    if (seen.some((s) => s.includes(fp) || fp.includes(s))) return false
    seen.push(fp)
    return true
  })
}

async function fetchOneFeed({
  url,
  tag,
  cls,
}: {
  url: string
  tag: string
  cls: string
}): Promise<TickerItem[]> {
  const apiUrl = `${RSS2JSON}${encodeURIComponent(url)}&count=10`
  const res = await fetch(apiUrl, { signal: AbortSignal.timeout(7000) })
  if (!res.ok) throw new Error(`HTTP ${res.status}`)
  const data = await res.json()
  if (data.status !== 'ok' || !data.items?.length) throw new Error('No items')
  return data.items.map((item: { title?: string }) => parseItem(item, tag, cls))
}

export function useNewsTicker() {
  const [items, setItems] = useState<TickerItem[]>(FALLBACK_NEWS)
  const [loading, setLoading] = useState(false)
  const [status, setStatus] = useState('LIVE · Loading news…')

  const fetchNews = useCallback(async () => {
    setLoading(true)
    setStatus('LIVE · Fetching headlines…')

    try {
      const results = await Promise.allSettled(RSS_SOURCES.map((s) => fetchOneFeed(s)))
      let all: TickerItem[] = []
      results.forEach((r) => {
        if (r.status === 'fulfilled') all.push(...r.value)
      })

      const curated = deduplicate(
        all.filter((i) => !i.isNoise && (i.score ?? 0) >= 0).sort((a, b) => (b.score ?? 0) - (a.score ?? 0)),
      ).slice(0, 18)

      if (curated.length > 0) {
        const t = new Date().toLocaleTimeString('en-IN', {
          hour: '2-digit',
          minute: '2-digit',
        })
        setStatus(`LIVE · Google News · ${curated.length} headlines · ${t}`)
        setItems(curated)
      } else {
        setStatus(`Feed unavailable · ${new Date().toLocaleDateString('en-IN')}`)
        setItems(FALLBACK_NEWS)
      }
    } catch {
      setStatus(`Feed unavailable · ${new Date().toLocaleDateString('en-IN')}`)
      setItems(FALLBACK_NEWS)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchNews()
    const timer = setInterval(() => {
      fetchNews()
    }, 60000) // auto-refresh news every 60 seconds
    return () => clearInterval(timer)
  }, [fetchNews])

  return { items, loading, status, refresh: fetchNews }
}
