import { NavLink } from 'react-router-dom'
import { cn } from '../../lib/cn'

function Tab({ to, children }: { to: string; children: React.ReactNode }) {
  return (
    <NavLink
      to={to}
      end
      className={({ isActive }) =>
        cn(
          'relative px-3 py-2 text-[13px] transition-colors',
          isActive ? 'text-accent' : 'text-text-muted hover:text-text',
        )
      }
    >
      {({ isActive }) => (
        <>
          <span className="text-text-hint">{isActive ? '> ' : '  '}</span>
          {children}
          {isActive && <span className="absolute inset-x-2 -bottom-px h-0.5 bg-accent" />}
        </>
      )}
    </NavLink>
  )
}

export function TopNav() {
  return (
    <header className="mx-auto mt-4 max-w-[920px] px-4">
      <div className="flex items-center justify-between border border-line-strong bg-surface/70 backdrop-blur-sm">
        <div className="flex items-center gap-2.5 px-3.5 py-2">
          <span className="flex gap-1.5" aria-hidden>
            <span className="h-2.5 w-2.5 rounded-full bg-danger/70" />
            <span className="h-2.5 w-2.5 rounded-full bg-warning/70" />
            <span className="h-2.5 w-2.5 rounded-full bg-success/70" />
          </span>
          <span className="text-[12px] text-text-muted">
            ~/binary-search<span className="text-text-hint"> — visualized</span>
          </span>
        </div>
        <nav className="flex border-l border-line-strong">
          <Tab to="/">search</Tab>
          <span className="self-center text-text-hint">·</span>
          <Tab to="/bob">bob</Tab>
        </nav>
      </div>
    </header>
  )
}
