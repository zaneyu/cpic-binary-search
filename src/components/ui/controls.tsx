import type { ButtonHTMLAttributes, InputHTMLAttributes, KeyboardEvent, ReactNode, Ref } from 'react'
import { useRef } from 'react'
import { motion } from 'motion/react'
import { cn } from '../../lib/cn'
import { useCalmMotion } from '../../lib/motion'

/* ---------------- Button ---------------- */
type Variant = 'primary' | 'ghost' | 'subtle'
export function Button({
  variant = 'ghost',
  className,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant }) {
  const base =
    'inline-flex h-9 items-center justify-center gap-1.5 rounded-[3px] px-3.5 font-mono text-[13px] ' +
    'cursor-pointer touch-manipulation ' +
    'pointer-coarse:min-h-11 pointer-coarse:px-4 ' +
    'transition-[background,border-color,color,opacity] duration-150 ' +
    'active:translate-y-px disabled:cursor-not-allowed disabled:pointer-events-none disabled:opacity-35 ' +
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/60 focus-visible:ring-offset-2 focus-visible:ring-offset-bg'
  const styles: Record<Variant, string> = {
    primary: 'bg-accent text-bg font-medium hover:opacity-90',
    ghost: 'border border-line-strong bg-surface text-text hover:border-accent/50 hover:text-accent',
    subtle: 'text-text-muted hover:text-text',
  }
  return <button className={cn(base, styles[variant], className)} {...props} />
}

/* ---------------- Segmented (underline tabs) ---------------- */
export interface SegOption<T extends string> {
  value: T
  label: ReactNode
}
export function Segmented<T extends string>({
  options,
  value,
  onChange,
  ariaLabel,
  groupId,
  className,
  panelId,
}: {
  options: SegOption<T>[]
  value: T
  onChange: (v: T) => void
  ariaLabel?: string
  groupId: string
  className?: string
  /** When the tabs control a separate panel, return its id so tabs can be wired with `aria-controls`. */
  panelId?: (v: T) => string
}) {
  const calm = useCalmMotion()
  const refs = useRef<(HTMLButtonElement | null)[]>([])
  const idx = options.findIndex((o) => o.value === value)

  // Roving focus: arrow / Home / End move selection between tabs (ARIA tabs pattern).
  function onKeyDown(e: KeyboardEvent<HTMLDivElement>) {
    const last = options.length - 1
    let next = -1
    if (e.key === 'ArrowRight' || e.key === 'ArrowDown') next = idx >= last ? 0 : idx + 1
    else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') next = idx <= 0 ? last : idx - 1
    else if (e.key === 'Home') next = 0
    else if (e.key === 'End') next = last
    else return
    e.preventDefault()
    onChange(options[next].value)
    refs.current[next]?.focus()
  }

  return (
    <div
      role="tablist"
      aria-label={ariaLabel}
      onKeyDown={onKeyDown}
      className={cn('flex flex-wrap border-b border-line-strong', className)}
    >
      {options.map((o, i) => {
        const active = o.value === value
        return (
          <button
            key={o.value}
            ref={(el) => {
              refs.current[i] = el
            }}
            id={`tab-${groupId}-${o.value}`}
            type="button"
            role="tab"
            aria-selected={active}
            aria-controls={panelId?.(o.value)}
            tabIndex={active ? 0 : -1}
            onClick={() => onChange(o.value)}
            className={cn(
              'relative inline-flex cursor-pointer touch-manipulation items-center justify-center rounded-t-[3px] px-3.5 py-2 font-mono text-[13px] transition-colors',
              'pointer-coarse:min-h-11',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-accent/60',
              active ? 'text-accent' : 'text-text-muted hover:text-text',
            )}
          >
            {o.label}
            {active && (
              <motion.span
                aria-hidden
                layoutId={`seg-${groupId}`}
                transition={calm ? { duration: 0 } : { type: 'spring', stiffness: 500, damping: 40 }}
                className="absolute inset-x-0 -bottom-px h-0.5 bg-accent"
              />
            )}
          </button>
        )
      })}
    </div>
  )
}

/* ---------------- Inputs ---------------- */
export function TextInput({
  className,
  ref,
  ...props
}: InputHTMLAttributes<HTMLInputElement> & { ref?: Ref<HTMLInputElement> }) {
  return (
    <input
      ref={ref}
      className={cn(
        'h-9 rounded-[3px] border border-line-strong bg-surface-muted px-2.5 font-mono text-[13px] text-text outline-none',
        'touch-manipulation pointer-coarse:min-h-11 pointer-coarse:text-base',
        'transition-colors focus:border-accent focus:ring-1 focus:ring-accent/40',
        className,
      )}
      {...props}
    />
  )
}

/* ---------------- Speed slider ---------------- */
export function SpeedSlider({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  return (
    <label className="ml-auto flex items-center gap-2 font-mono text-[12px] text-text-muted">
      speed
      <input
        type="range"
        min={500}
        max={3500}
        step={100}
        value={value}
        onChange={(e) => onChange(4000 - Number(e.target.value))}
        aria-label="Animation speed"
        className="cpic-range"
      />
    </label>
  )
}

/* ---------------- Switch (terminal [x] checkbox) ---------------- */
export function Switch({
  checked,
  onChange,
  label,
}: {
  checked: boolean
  onChange: (v: boolean) => void
  label: string
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className="inline-flex cursor-pointer touch-manipulation items-center gap-1.5 rounded-[2px] py-1 font-mono text-[12px] text-text-muted hover:text-text pointer-coarse:min-h-11 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/60 focus-visible:ring-offset-2 focus-visible:ring-offset-bg"
    >
      <span className={cn('select-none', checked ? 'text-accent' : 'text-text-hint')}>
        [{checked ? 'x' : ' '}]
      </span>
      {label}
    </button>
  )
}
