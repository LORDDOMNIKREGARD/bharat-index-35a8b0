import { Suspense, lazy, useEffect, useRef, useState } from 'react'
import { Link, NavLink, useLocation, useOutlet } from 'react-router'
import { AnimatePresence, MotionConfig, motion } from 'motion/react'
import { BookOpenText, House, MagnifyingGlass, MapTrifold, Newspaper, Question, Target, X } from '@phosphor-icons/react'
import { DATA_DATE } from '../data'
import { fmtDate, store } from '../utils'
// Loaded on first open; cmdk is not needed for the first paint.
const Search = lazy(() => import('./Search'))

export interface LayoutContext {
  openSearch: () => void
}

const NAV = [
  { to: '/states', label: 'States' },
  { to: '/practice', label: 'Practice' },
  { to: '/news', label: 'News' },
  { to: '/guides', label: 'Guides' },
  { to: '/who', label: "Who's who" },
]

type Theme = 'system' | 'light' | 'dark'

function useTheme() {
  const [theme, setTheme] = useState<Theme>(() => (store.get('theme') as Theme) || 'system')
  useEffect(() => {
    store.set('theme', theme === 'system' ? null : theme)
    const mq = matchMedia('(prefers-color-scheme: dark)')
    const apply = () => {
      document.documentElement.dataset.theme = theme === 'system' ? (mq.matches ? 'dark' : 'light') : theme
    }
    apply()
    if (theme !== 'system') return
    mq.addEventListener('change', apply)
    return () => mq.removeEventListener('change', apply)
  }, [theme])
  return [theme, setTheme] as const
}

const navCls = 'no-underline text-ink-2 transition-colors hover:text-ink aria-[current=page]:text-ink'
// Where each page sits, left to right. Moving right slides the new page in from the right.
function position(path: string): number {
  if (path === '/') return 0
  if (path.startsWith('/states/')) return 1.5
  const i = ['/states', '/practice', '/news', '/guides', '/who', '/help'].indexOf(path)
  return i === -1 ? 9 : i + 1
}

// iOS-style push: the new page covers the old one, which drifts a little and dims.
const page = {
  // zIndex does not animate: the leaving page sits under the new one going forward, over it going back.
  enter: (dir: number) => ({ x: dir >= 0 ? '100%' : '-25%', opacity: dir >= 0 ? 1 : 0.5, zIndex: 1 }),
  center: { x: 0, opacity: 1, zIndex: 1 },
  exit: (dir: number) => ({ x: dir >= 0 ? '-25%' : '100%', opacity: dir >= 0 ? 0.5 : 1, zIndex: dir >= 0 ? 0 : 3 }),
}

const tabCls = 'flex flex-col items-center justify-center gap-0.5 text-[12px] no-underline text-ink-2 aria-[current=page]:text-accent'

export default function Layout() {
  const [searchOpen, setSearchOpen] = useState(false)
  const [theme, setTheme] = useTheme()
  const { pathname } = useLocation()
  const outlet = useOutlet({ openSearch: () => setSearchOpen(true) } satisfies LayoutContext)

  // Direction of travel, worked out when the path changes.
  const prev = useRef(pathname)
  const dir = useRef(0)
  if (prev.current !== pathname) {
    dir.current = Math.sign(position(pathname) - position(prev.current))
    prev.current = pathname
  }

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [pathname])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const typing = e.target instanceof HTMLElement && e.target.closest('input, textarea, select, [contenteditable]')
      if ((e.key === 'k' && (e.ctrlKey || e.metaKey)) || (e.key === '/' && !typing)) {
        e.preventDefault()
        setSearchOpen(true)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  const openSearch = () => setSearchOpen(true)

  // One-time pointer to the help page for first-time visitors.
  const [tip, setTip] = useState(() => !store.get('seenHelpTip'))
  const dismissTip = () => {
    store.set('seenHelpTip', '1')
    setTip(false)
  }
  useEffect(() => {
    if (pathname === '/help') setTip(false)
  }, [pathname])

  return (
    <MotionConfig reducedMotion="user">
      <a
        href="#main"
        className="sr-only z-50 bg-surface px-3 py-2 focus:not-sr-only focus:fixed focus:left-2 focus:top-2"
      >
        Skip to content
      </a>

      <header className="no-print sticky top-0 z-30 border-b border-rule bg-paper">
        <div className="mx-auto flex h-14 max-w-[1100px] items-center gap-7 px-4">
          <Link to="/" className="text-[21px] font-semibold no-underline [font-stretch:85%]">
            Bharat Index
          </Link>
          <nav aria-label="Main" className="hidden gap-5 text-[15px] md:flex">
            {NAV.map((n) => (
              <NavLink key={n.to} to={n.to} className={navCls}>
                {({ isActive }) => (
                  <span className="relative inline-block py-1">
                    {n.label}
                    {isActive && (
                      <motion.span
                        layoutId="nav-underline"
                        className="absolute inset-x-0 -bottom-[3px] h-[2px] bg-accent"
                        transition={{ type: 'spring', stiffness: 500, damping: 40 }}
                      />
                    )}
                  </span>
                )}
              </NavLink>
            ))}
          </nav>
          <div className="ml-auto flex items-center gap-2">
            <button
              type="button"
              onClick={openSearch}
              className="hidden h-9 w-56 items-center gap-2 rounded-md border border-rule bg-surface px-3 text-[15px] text-ink-2 hover:border-ink-3 md:flex"
            >
              <MagnifyingGlass size={16} aria-hidden />
              Search
              <kbd className="ml-auto border border-rule px-1.5 font-ui text-[12px] leading-5">/</kbd>
            </button>
            <button type="button" onClick={openSearch} aria-label="Search" className="rounded-md p-2 text-ink-2 hover:bg-tint md:hidden">
              <MagnifyingGlass size={20} aria-hidden />
            </button>
            <div className="relative">
              <NavLink
                to="/help"
                aria-label="How to use this site"
                title="How to use this site"
                onClick={dismissTip}
                className="flex size-9 items-center justify-center rounded-full border border-rule bg-surface text-ink-2 no-underline hover:border-ink-3 hover:text-ink aria-[current=page]:border-ink aria-[current=page]:text-ink"
              >
                <Question size={18} weight="bold" aria-hidden />
              </NavLink>
              <AnimatePresence>
                {tip && (
                  <motion.div
                    role="dialog"
                    aria-label="Tip"
                    initial={{ opacity: 0, y: -6, scale: 0.96 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -6, scale: 0.96 }}
                    transition={{ delay: 1.2, type: 'spring', stiffness: 380, damping: 26 }}
                    className="absolute right-0 top-12 z-40 w-64 rounded-lg border border-rule bg-surface p-4 text-[15px] shadow-[0_12px_32px_-12px_rgb(0_0_0/0.3)]"
                  >
                    <span className="absolute -top-[7px] right-[13px] size-3 rotate-45 border-l border-t border-rule bg-surface" aria-hidden />
                    <button type="button" onClick={dismissTip} aria-label="Dismiss" className="absolute right-2 top-2 rounded p-1 text-ink-3 hover:text-ink">
                      <X size={14} aria-hidden />
                    </button>
                    <p className="m-0 pr-4 font-semibold">New here?</p>
                    <p className="m-0 mt-1 text-ink-2">This is how to use the site, in a minute. You can open it any time from here.</p>
                    <div className="mt-3 flex gap-3">
                      <Link to="/help" onClick={dismissTip} className="link">
                        Show me
                      </Link>
                      <button type="button" onClick={dismissTip} className="text-ink-2 hover:text-ink">
                        Not now
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </header>

      <main id="main" className="relative overflow-x-clip">
        <AnimatePresence mode="popLayout" initial={false} custom={dir.current}>
          <motion.div
            key={pathname}
            custom={dir.current}
            variants={page}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ type: 'tween', ease: [0.32, 0.72, 0, 1], duration: 0.5 }}
            className="min-h-[70vh] w-full bg-paper shadow-[-16px_0_32px_-24px_rgb(0_0_0/0.35)]"
          >
            <div className="mx-auto max-w-[1100px] px-4 pb-16">
              <Suspense fallback={<div className="min-h-[60vh]" />}>{outlet}</Suspense>
            </div>
          </motion.div>
        </AnimatePresence>
      </main>

      <footer className="no-print border-t border-rule">
        <div className="mx-auto flex max-w-[1100px] flex-wrap items-center gap-x-6 gap-y-3 px-4 pb-24 pt-6 text-[14px] text-ink-2 md:pb-8">
          <span>Data as of {fmtDate(DATA_DATE)}. Sources are listed on each state page.</span>
          <span>
            Map: <a className="link" href="https://github.com/datameet/maps">DataMeet India community</a> (CC BY 4.0)
          </span>
          <label className="flex items-center gap-2">
            Theme
            <select
              value={theme}
              onChange={(e) => setTheme(e.target.value as Theme)}
              className="rounded-ctl border border-rule bg-surface px-2 py-1 text-ink"
            >
              <option value="system">Match device</option>
              <option value="light">Light</option>
              <option value="dark">Dark</option>
            </select>
          </label>
        </div>
      </footer>

      <nav
        aria-label="Main"
        className="no-print fixed inset-x-0 bottom-0 z-30 grid grid-cols-5 border-t border-rule bg-surface pb-[env(safe-area-inset-bottom)] md:hidden"
      >
        <NavLink to="/" end className={`${tabCls} h-14`}>
          <House size={22} aria-hidden />
          Home
        </NavLink>
        <NavLink to="/states" className={`${tabCls} h-14`}>
          <MapTrifold size={22} aria-hidden />
          States
        </NavLink>
        <NavLink to="/practice" className={`${tabCls} h-14`}>
          <Target size={22} aria-hidden />
          Practice
        </NavLink>
        <NavLink to="/news" className={`${tabCls} h-14`}>
          <Newspaper size={22} aria-hidden />
          News
        </NavLink>
        <NavLink to="/guides" className={`${tabCls} h-14`}>
          <BookOpenText size={22} aria-hidden />
          Guides
        </NavLink>
      </nav>

      {searchOpen && (
        <Suspense fallback={null}>
          <Search open={searchOpen} onOpenChange={setSearchOpen} />
        </Suspense>
      )}
    </MotionConfig>
  )
}
