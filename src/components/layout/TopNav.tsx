import { NavLink } from 'react-router-dom'
import { cn } from '../../lib/cn'

const ITEMS = [
  { to: '/', label: 'Binary search', hint: 'search a sorted list · BSTA' },
  { to: '/bob', label: "Bob's guessing game", hint: 'play it yourself' },
]

function NavTab({ to, label, hint }: { to: string; label: string; hint: string }) {
  return (
    <NavLink
      to={to}
      end
      className={({ isActive }) =>
        cn(
          'flex flex-col justify-center rounded-[3px] border px-3 py-1.5 transition-colors',
          'pointer-coarse:min-h-11',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/60 focus-visible:ring-offset-2 focus-visible:ring-offset-bg',
          isActive
            ? 'border-accent bg-accent/12 text-accent'
            : 'border-line-strong text-text-muted hover:border-accent/50 hover:text-text',
        )
      }
    >
      {({ isActive }) => (
        <>
          <span className="flex items-center gap-1.5 font-mono text-[13px] font-medium leading-tight">
            <span aria-hidden className={isActive ? 'text-accent' : 'text-text-hint'}>
              {isActive ? '●' : '○'}
            </span>
            {label}
          </span>
          <span className="pl-[18px] font-mono text-[10px] text-text-hint">{hint}</span>
        </>
      )}
    </NavLink>
  )
}

export function TopNav() {
  return (
    <header className="mx-auto mt-4 max-w-[920px] pl-[max(1rem,env(safe-area-inset-left))] pr-[max(1rem,env(safe-area-inset-right))]">
      <nav aria-label="Choose a visualization" className="flex flex-wrap items-center gap-2">
        <span className="font-mono text-[11px] text-text-hint">view:</span>
        {ITEMS.map((i) => (
          <NavTab key={i.to} {...i} />
        ))}
      </nav>
    </header>
  )
}
