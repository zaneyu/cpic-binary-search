import type { ButtonHTMLAttributes, InputHTMLAttributes, ReactNode, Ref } from 'react'
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
    'transition-[background,border-color,color,opacity] duration-150 ' +
    'active:translate-y-px disabled:pointer-events-none disabled:opacity-35 ' +
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
      className={cn('flex flex-wrap border-b border-line-strong', className)}
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
              'relative px-3.5 py-2 font-mono text-[13px] transition-colors',
              active ? 'text-accent' : 'text-text-muted hover:text-text',
            )}
          >
            {o.label}
            {active && (
              <motion.span
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
      className="inline-flex items-center gap-1.5 font-mono text-[12px] text-text-muted hover:text-text"
    >
      <span className={cn('select-none', checked ? 'text-accent' : 'text-text-hint')}>
        [{checked ? 'x' : ' '}]
      </span>
      {label}
    </button>
  )
}
