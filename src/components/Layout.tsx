import { Suspense, lazy, useEffect, useState } from 'react'
import { Link, NavLink, useLocation, useOutlet } from 'react-router'
import { AnimatePresence, MotionConfig, motion } from 'motion/react'
import { BookOpenText, House, MagnifyingGlass, MapTrifold, Target } from '@phosphor-icons/react'
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
const tabCls = 'flex flex-col items-center justify-center gap-0.5 text-[12px] no-underline text-ink-2 aria-[current=page]:text-accent'

export default function Layout() {
  const [searchOpen, setSearchOpen] = useState(false)
  const [theme, setTheme] = useTheme()
  const { pathname } = useLocation()
  const outlet = useOutlet({ openSearch: () => setSearchOpen(true) } satisfies LayoutContext)

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
          <nav aria-label="Main" className="hidden gap-6 text-[15px] sm:flex">
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
          <button
            type="button"
            onClick={openSearch}
            className="ml-auto hidden h-9 w-60 items-center gap-2 rounded-ctl border border-rule bg-surface px-3 text-[15px] text-ink-2 hover:border-ink-3 sm:flex"
          >
            <MagnifyingGlass size={16} aria-hidden />
            Search
            <kbd className="ml-auto border border-rule px-1.5 font-ui text-[12px] leading-5">/</kbd>
          </button>
        </div>
      </header>

      <main id="main" className="mx-auto max-w-[1100px] px-4 pb-16">
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={pathname}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
          >
            <Suspense fallback={<div className="min-h-[60vh]" />}>{outlet}</Suspense>
          </motion.div>
        </AnimatePresence>
      </main>

      <footer className="no-print border-t border-rule">
        <div className="mx-auto flex max-w-[1100px] flex-wrap items-center gap-x-6 gap-y-3 px-4 pb-24 pt-6 text-[14px] text-ink-2 sm:pb-8">
          <span>Data as of {fmtDate(DATA_DATE)}. Sources are listed on each state page.</span>
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
          <a className="link sm:ml-auto" href="https://github.com/LORDDOMNIKREGARD/bharat-index-35a8b0">
            Source code
          </a>
        </div>
      </footer>

      <nav
        aria-label="Main"
        className="no-print fixed inset-x-0 bottom-0 z-30 grid grid-cols-5 border-t border-rule bg-surface pb-[env(safe-area-inset-bottom)] sm:hidden"
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
        <NavLink to="/guides" className={`${tabCls} h-14`}>
          <BookOpenText size={22} aria-hidden />
          Guides
        </NavLink>
        <button type="button" onClick={openSearch} className={`${tabCls} h-14`}>
          <MagnifyingGlass size={22} aria-hidden />
          Search
        </button>
      </nav>

      {searchOpen && (
        <Suspense fallback={null}>
          <Search open={searchOpen} onOpenChange={setSearchOpen} />
        </Suspense>
      )}
    </MotionConfig>
  )
}
