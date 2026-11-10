import { Command } from 'cmdk'
import { useNavigate } from 'react-router'
import { CABINET, GUIDES, STATES } from '../data'

const PAGES = [
  { to: '/', label: 'Home' },
  { to: '/states', label: 'All states and UTs' },
  { to: '/practice', label: 'Practice and Daily Yatra' },
  { to: '/news', label: 'News and bookmarks' },
  { to: '/help', label: 'How to use this site' },
  { to: '/guides', label: 'Study guides' },
  { to: '/who', label: "Who's who and Union Cabinet" },
]

export default function Search({ open, onOpenChange }: { open: boolean; onOpenChange: (v: boolean) => void }) {
  const navigate = useNavigate()
  const go = (to: string) => {
    onOpenChange(false)
    navigate(to)
  }

  return (
    <Command.Dialog open={open} onOpenChange={onOpenChange} label="Search Bharat Index">
      <Command.Input placeholder="Search states, ministers, guides" />
      <Command.List>
        <Command.Empty>No matches. Try a state, a minister or a subject.</Command.Empty>
        <Command.Group heading="States and UTs">
          {STATES.map((s) => (
            <Command.Item
              key={s.slug}
              value={s.name}
              keywords={[s.iso, s.cm ?? '', s.governor]}
              onSelect={() => go(`/states/${s.slug}`)}
            >
              <span>{s.name}</span>
              <span className="truncate text-[14px] text-ink-2">{s.cm ?? s.governor}</span>
            </Command.Item>
          ))}
        </Command.Group>
        <Command.Group heading="Union Cabinet">
          {CABINET.map((m) => (
            <Command.Item
              key={m.name}
              value={m.name}
              keywords={m.portfolios}
              onSelect={() => go(`/who?q=${encodeURIComponent(m.name)}`)}
            >
              <span>{m.name}</span>
              <span className="truncate text-[14px] text-ink-2">{m.portfolios[0]}</span>
            </Command.Item>
          ))}
        </Command.Group>
        <Command.Group heading="Study guides">
          {GUIDES.map((g) => (
            <Command.Item
              key={g.file}
              value={g.title}
              keywords={[g.subject, g.desc]}
              onSelect={() => {
                onOpenChange(false)
                location.assign(`/${g.file}`)
              }}
            >
              <span>{g.title}</span>
              <span className="text-[14px] text-ink-2">{g.subject}</span>
            </Command.Item>
          ))}
        </Command.Group>
        <Command.Group heading="Pages">
          {PAGES.map((p) => (
            <Command.Item key={p.to} value={`Page: ${p.label}`} onSelect={() => go(p.to)}>
              {p.label}
            </Command.Item>
          ))}
        </Command.Group>
      </Command.List>
    </Command.Dialog>
  )
}
