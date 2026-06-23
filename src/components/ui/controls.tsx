import type { ButtonHTMLAttributes, InputHTMLAttributes, ReactNode, Ref } from 'react'
import { motion } from 'motion/react'
import { cn } from '../../lib/cn'
import { springs, useCalmMotion } from '../../lib/motion'

/* ---------------- Button ---------------- */
type Variant = 'primary' | 'ghost' | 'subtle'
export function Button({
  variant = 'ghost',
  className,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant }) {
  const base =
    'inline-flex h-9 items-center justify-center gap-1.5 rounded-md px-3.5 text-sm font-medium ' +
    'transition-[transform,background,border-color,box-shadow,filter] duration-150 ' +
    'active:scale-[0.98] disabled:pointer-events-none disabled:opacity-35 ' +
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/60'
  const styles: Record<Variant, string> = {
    primary:
      'text-white border border-transparent shadow-[0_1px_10px_rgba(95,184,212,0.3)] hover:brightness-110 hover:shadow-[0_3px_18px_rgba(184,137,232,0.4)]',
    ghost: 'bg-surface text-text border border-line hover:bg-surface-elevated hover:border-line-strong',
    subtle: 'text-text-muted hover:text-text',
  }
  return (
    <button
      className={cn(base, styles[variant], className)}
      style={variant === 'primary' ? { backgroundImage: 'var(--grad-accent)' } : undefined}
      {...props}
    />
  )
}

/* ---------------- Segmented toggle ---------------- */
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
}: {
  options: SegOption<T>[]
  value: T
  onChange: (v: T) => void
  ariaLabel?: string
  groupId: string
  className?: string
}) {
  const calm = useCalmMotion()
  return (
    <div
      role="tablist"
      aria-label={ariaLabel}
      className={cn(
        'inline-flex flex-wrap rounded-md border border-accent-2/15 p-[3px]',
        'bg-[linear-gradient(90deg,rgba(95,184,212,0.08),rgba(184,137,232,0.1),rgba(240,138,168,0.08))]',
        className,
      )}
    >
      {options.map((o) => {
        const active = o.value === value
        return (
          <button
            key={o.value}
            role="tab"
            aria-selected={active}
            onClick={() => onChange(o.value)}
            className={cn(
              'relative h-7 rounded px-3.5 text-[13px] font-medium transition-colors',
              active ? 'text-accent-2' : 'text-text-muted hover:text-text',
            )}
          >
            {active && (
              <motion.span
                layoutId={`seg-${groupId}`}
                transition={calm ? { duration: 0 } : springs.snappy}
                className="absolute inset-0 -z-0 rounded bg-surface-elevated shadow-[inset_0_0_0_1px_rgba(184,137,232,0.28)]"
              />
            )}
            <span className="relative z-10">{o.label}</span>
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
        'h-9 rounded-md border border-line bg-surface px-2.5 text-sm text-text outline-none',
        'transition-[border-color,box-shadow] focus:border-accent focus:ring-2 focus:ring-accent/25',
        className,
      )}
      {...props}
    />
  )
}

/* ---------------- Speed slider ---------------- */
export function SpeedSlider({
  value,
  onChange,
}: {
  value: number
  onChange: (v: number) => void
}) {
  return (
    <label className="ml-auto flex items-center gap-2 text-[13px] text-text-muted">
      Speed
      <input
        type="range"
        min={500}
        max={3500}
        step={100}
        value={value}
        // faster slider value => shorter delay; invert for intuitive left=slow
        onChange={(e) => onChange(4000 - Number(e.target.value))}
        aria-label="Animation speed"
        className="cpic-range"
      />
    </label>
  )
}

/* ---------------- Switch ---------------- */
export function Switch({
  checked,
  onChange,
  label,
}: {
  checked: boolean
  onChange: (v: boolean) => void
  label: string
}) {
  const calm = useCalmMotion()
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className="inline-flex items-center gap-2 text-[11px] text-text-muted hover:text-text"
    >
      <span
        className={cn(
          'relative h-[18px] w-8 rounded-full border transition-colors',
          checked ? 'border-accent/60 bg-accent/25' : 'border-line bg-surface-muted',
        )}
      >
        <motion.span
          className="absolute top-[2px] h-3 w-3 rounded-full bg-accent"
          animate={{ left: checked ? 16 : 2 }}
          transition={calm ? { duration: 0 } : springs.snappy}
        />
      </span>
      {label}
    </button>
  )
}
