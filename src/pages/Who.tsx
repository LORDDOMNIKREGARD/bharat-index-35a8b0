import { useEffect } from 'react'
import { useSearchParams } from 'react-router'
import { CABINET, DATA_DATE, WHO } from '../data'
import { Fact, Facts } from '../components/Facts'
import { fmtDate } from '../utils'

export default function Who() {
  const [params, setParams] = useSearchParams()
  const q = params.get('q') ?? ''
  const needle = q.trim().toLowerCase()
  const list = CABINET.filter(
    (m) => !needle || m.name.toLowerCase().includes(needle) || m.portfolios.some((p) => p.toLowerCase().includes(needle)),
  )

  useEffect(() => {
    document.title = "Who's who — Bharat Index"
  }, [])

  return (
    <div className="max-w-[760px]">
      <div className="pt-8">
        <h1 className="m-0 text-[32px] leading-9">Who's who</h1>
        <p className="mb-0 mt-1 text-ink-2">Each entry shows when it was last checked.</p>
      </div>

      <div className="mt-6">
        <Facts>
          {WHO.map((w) => (
            <Fact key={w.label} label={w.label} note={`${w.note ? `${w.note}. ` : ''}As of ${w.asOf}.`}>
              {w.value}
            </Fact>
          ))}
        </Facts>
      </div>

      <section aria-labelledby="cabinet" className="mt-12">
        <h2 id="cabinet" className="m-0 text-[22px] leading-7">
          Union Cabinet
        </h2>
        <p className="mb-4 mt-1 text-[15px] text-ink-2">
          {CABINET.length} Cabinet ministers including the Prime Minister. Ministers of State are not listed. Collected{' '}
          {fmtDate(DATA_DATE)}.
        </p>
        <label className="block max-w-80">
          <span className="sr-only">Search ministers or portfolios</span>
          <input
            type="search"
            value={q}
            onChange={(e) => setParams(e.target.value ? { q: e.target.value } : {}, { replace: true })}
            placeholder="Search minister or ministry"
            className="w-full rounded-ctl border border-rule bg-surface px-3 py-2"
          />
        </label>
        <p className="mb-2 mt-2 text-[14px] text-ink-2" aria-live="polite">
          {needle ? `${list.length} of ${CABINET.length}` : ''}
        </p>
        <ul className="m-0 list-none divide-y divide-rule border-y border-rule p-0">
          {list.map((m) => (
            <li key={m.name} className="grid gap-x-4 py-2.5 sm:grid-cols-[240px_1fr]">
              <span className="font-semibold">{m.name}</span>
              <span className="text-ink-2">{m.portfolios.join('; ')}</span>
            </li>
          ))}
          {list.length === 0 && <li className="py-3 text-ink-2">No minister or ministry matches “{q}”.</li>}
        </ul>
      </section>
    </div>
  )
}
