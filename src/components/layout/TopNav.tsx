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
          'flex flex-col rounded-[3px] border px-3 py-1.5 transition-colors',
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
    <header className="mx-auto mt-4 max-w-[920px] px-4">
      <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2.5 border border-line-strong bg-surface/70 px-3.5 py-2.5 backdrop-blur-sm">
        <div className="flex items-center gap-2.5">
          <span className="flex gap-1.5" aria-hidden>
            <span className="h-2.5 w-2.5 rounded-full bg-danger/70" />
            <span className="h-2.5 w-2.5 rounded-full bg-warning/70" />
            <span className="h-2.5 w-2.5 rounded-full bg-success/70" />
          </span>
          <span className="font-mono text-[12px] text-text-muted">~/binary-search</span>
        </div>
        <nav aria-label="Choose a visualization" className="flex items-center gap-2">
          <span className="hidden font-mono text-[11px] text-text-hint sm:inline">view:</span>
          {ITEMS.map((i) => (
            <NavTab key={i.to} {...i} />
          ))}
        </nav>
      </div>
    </header>
  )
}
