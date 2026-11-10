import { useEffect } from 'react'
import { Link, useOutletContext } from 'react-router'
import type { LayoutContext } from '../components/Layout'

export default function NotFound() {
  const { openSearch } = useOutletContext<LayoutContext>()

  useEffect(() => {
    document.title = 'Page not found — Bharat Index'
  }, [])

  return (
    <div className="max-w-[60ch] pt-12">
      <h1 className="m-0 text-[32px] leading-9">Page not found</h1>
      <p className="text-ink-2">The link may be old, or the state name may be spelt differently.</p>
      <div className="flex flex-wrap gap-4">
        <button type="button" onClick={openSearch} className="link">
          Search the site
        </button>
        <Link to="/states" className="link">
          All states and UTs
        </Link>
        <Link to="/" className="link">
          Home
        </Link>
      </div>
    </div>
  )
}
