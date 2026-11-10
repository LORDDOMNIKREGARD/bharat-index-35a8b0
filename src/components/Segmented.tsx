import { useId } from 'react'
import { motion } from 'motion/react'

/** Segmented control; the selected pill slides between options. */
export function Segmented<T extends string>({
  value,
  options,
  onChange,
  label,
}: {
  value: T
  options: { v: T; label: string }[]
  onChange: (v: T) => void
  label: string
}) {
  const id = useId()
  return (
    <div role="group" aria-label={label} className="flex rounded-md border border-rule bg-surface p-0.5">
      {options.map((o) => {
        const on = value === o.v
        return (
          <button
            key={o.v}
            type="button"
            aria-pressed={on}
            onClick={() => onChange(o.v)}
            className={`relative rounded-[3px] px-3 py-1.5 text-[15px] transition-colors ${on ? 'text-paper' : 'text-ink-2 hover:text-ink'}`}
          >
            {on && (
              <motion.span
                layoutId={`seg-${id}`}
                className="absolute inset-0 rounded-[3px] bg-ink"
                transition={{ type: 'spring', stiffness: 500, damping: 38 }}
              />
            )}
            <span className="relative">{o.label}</span>
          </button>
        )
      })}
    </div>
  )
}
