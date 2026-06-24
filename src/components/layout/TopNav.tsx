import type { ReactNode } from 'react'
import { NavLink } from 'react-router-dom'
import { cn } from '../../lib/cn'
import { IconSearch, IconTarget } from '../ui/icons'

const ITEMS: { to: string; label: string; hint: string; icon: ReactNode }[] = [
  { to: '/', label: 'Binary search', hint: 'search a sorted list · BSTA', icon: <IconSearch /> },
  { to: '/bob', label: "Bob's guessing game", hint: 'play it yourself', icon: <IconTarget /> },
]

function NavTab({ to, label, hint, icon, divide }: (typeof ITEMS)[number] & { divide: boolean }) {
  return (
    <NavLink
      to={to}
      end
      className={({ isActive }) =>
        cn(
          'group relative flex items-center gap-2.5 px-4 py-2.5 transition-colors',
          'pointer-coarse:min-h-12',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-primary/60',
          divide && 'border-t border-line-strong sm:border-l sm:border-t-0',
          isActive ? 'bg-primary/12 text-primary' : 'text-text-muted hover:bg-surface hover:text-text',
        )
      }
    >
      {({ isActive }) => (
        <>
          <span aria-hidden className={cn('shrink-0', isActive ? 'text-primary' : 'text-text-hint group-hover:text-text-muted')}>
            {icon}
          </span>
          <span className="flex min-w-0 flex-col leading-tight">
            <span className="font-mono text-[13px] font-medium">{label}</span>
            <span className="font-mono text-[10px] text-text-hint">{hint}</span>
          </span>
        </>
      )}
    </NavLink>
  )
}

export function TopNav() {
  return (
    <header className="mx-auto mt-4 max-w-[920px] pl-[max(1rem,env(safe-area-inset-left))] pr-[max(1rem,env(safe-area-inset-right))]">
      <nav
        aria-label="Choose a visualization"
        className="flex flex-col overflow-hidden rounded-[5px] border border-line-strong bg-surface/50 backdrop-blur-sm sm:inline-flex sm:flex-row"
      >
        {ITEMS.map((item, i) => (
          <NavTab key={item.to} {...item} divide={i > 0} />
        ))}
      </nav>
    </header>
  )
}
