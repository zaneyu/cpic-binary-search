import { NavLink } from 'react-router-dom'
import { cn } from '../../lib/cn'

function Item({ to, children }: { to: string; children: React.ReactNode }) {
  return (
    <NavLink
      to={to}
      end
      className={({ isActive }) =>
        cn(
          'relative rounded px-3.5 py-2 text-[13px] transition-colors',
          isActive ? 'font-semibold text-accent' : 'text-text-muted hover:text-text',
        )
      }
    >
      {({ isActive }) => (
        <>
          {children}
          {isActive && (
            <span
              className="absolute inset-x-[18%] bottom-[2px] h-0.5 rounded-full"
              style={{ background: 'var(--grad-heading)' }}
            />
          )}
        </>
      )}
    </NavLink>
  )
}

export function TopNav() {
  return (
    <header className="mx-auto flex max-w-[860px] flex-wrap items-center justify-between gap-3 px-4 pb-5 pt-6">
      <span className="text-[15px] font-semibold tracking-tight text-heading">
        Binary Search · visualized
      </span>
      <nav className="flex gap-0.5 rounded-md border border-accent-2/18 bg-[linear-gradient(90deg,rgba(95,184,212,0.08),rgba(184,137,232,0.1),rgba(240,138,168,0.08))] p-[3px]">
        <Item to="/">Search</Item>
        <Item to="/bob">Bob's game</Item>
      </nav>
    </header>
  )
}
