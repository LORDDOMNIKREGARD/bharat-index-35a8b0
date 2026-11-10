import { useEffect, type ReactNode } from 'react'
import { Link } from 'react-router'
import { Timeline } from '@/components/ui/timeline'
import { store } from '@/utils'

function Step({ children, to, label }: { children: ReactNode; to?: string; label?: string }) {
  return (
    <div className="max-w-[56ch] pb-2">
      <p className="m-0 font-read text-[17px] leading-7">{children}</p>
      {to && (
        <Link to={to} className="link mt-2 inline-block text-[15px]">
          {label}
        </Link>
      )}
    </div>
  )
}

const kbd = 'rounded border border-rule bg-surface px-1.5 text-[13px] not-italic'

export default function Help() {
  useEffect(() => {
    document.title = 'How to use this site — Bharat Index'
    store.set('seenHelpTip', '1')
  }, [])

  const steps = [
    {
      title: 'Your state',
      content: (
        <Step to="/" label="Pick your state on the home page">
          Panels often start with “tell me about your home state”. Pick yours once on the home page and its brief stays
          there: Chief Minister, Governor, GSDP with its rank, and every Lok Sabha seat on the map.
        </Step>
      ),
    },
    {
      title: 'The map',
      content: (
        <Step to="/states?view=map" label="Open the map">
          On States, switch to Map. Tap any state to zoom in and see each constituency where it actually is; red dots are
          reserved for SC, green for ST. The table view sorts every state by GSDP, inflation or seats.
        </Step>
      ),
    },
    {
      title: 'Daily Yatra',
      content: (
        <Step to="/practice" label="Play today’s yatra">
          Seven map questions a day, the same for everyone, thirty seconds each. Faster answers score more. Come back
          daily to keep your streak, then share your result. Unlimited mode is there for extra rounds.
        </Step>
      ),
    },
    {
      title: 'Progress',
      content: (
        <Step to="/practice" label="See your progress">
          Every state moves from Attempted to Familiar, Proficient and Mastered as you answer. Misses drop it back and
          bring it up more often until it sticks.
        </Step>
      ),
    },
    {
      title: 'Guides and news',
      content: (
        <Step to="/guides" label="Open the guides">
          Ten long-form guides cover GK, current affairs, schemes and your stream’s subject; each remembers where you
          stopped. On News, bookmark headlines to revise before the interview.
        </Step>
      ),
    },
    {
      title: 'Find anything',
      content: (
        <Step>
          Press <kbd className={kbd}>/</kbd> or <kbd className={kbd}>Ctrl</kbd> + <kbd className={kbd}>K</kbd>, or tap
          Search, to jump to any state, minister or guide.
        </Step>
      ),
    },
    {
      title: 'Your data',
      content: (
        <Step>
          Your state, progress, streak, bookmarks and reading positions are saved in this browser on this device. Nobody
          else sees them, and there is nothing to sign up for. Clearing your browser data clears them too.
        </Step>
      ),
    },
  ]

  return (
    <>
      <div className="pt-8">
        <h1 className="m-0 text-[32px] leading-9">How to use this site</h1>
        <p className="mb-0 mt-1 max-w-[60ch] text-ink-2">A ten-minute routine that works: your state, the map, today’s yatra, then a guide.</p>
      </div>
      <div className="mt-6">
        <Timeline data={steps} />
      </div>
    </>
  )
}
