import { useId, type ComponentProps, type ReactNode } from 'react'
import { cn } from '../../lib/cn'
import { Button as ShButton } from './button'
import { Input } from './input'
import { Slider } from './slider'
import { Switch as ShSwitch } from './switch'
import { Tabs, TabsList, TabsTrigger } from './tabs'
import { Tooltip, TooltipContent, TooltipTrigger } from './tooltip'

/* ---------------- Button (themed shadcn Button) ---------------- */
type Variant = 'primary' | 'ghost' | 'subtle'
const VARIANT_MAP = { primary: 'default', ghost: 'outline', subtle: 'ghost' } as const

export function Button({
  variant = 'ghost',
  className,
  ...props
}: Omit<ComponentProps<typeof ShButton>, 'variant'> & { variant?: Variant }) {
  return (
    <ShButton
      variant={VARIANT_MAP[variant]}
      className={cn('rounded-[3px] font-mono text-[13px]', className)}
      {...props}
    />
  )
}

/** Button with a shadcn tooltip (replaces native title=). */
export function TipButton({ tip, ...props }: ComponentProps<typeof Button> & { tip: string }) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button {...props} />
      </TooltipTrigger>
      <TooltipContent className="font-mono text-xs">{tip}</TooltipContent>
    </Tooltip>
  )
}

/* ---------------- Input ---------------- */
export function TextInput({ className, ...props }: ComponentProps<'input'>) {
  return <Input className={cn('rounded-[3px] font-mono text-[13px]', className)} {...props} />
}

/* ---------------- Segmented (shadcn Tabs, line variant) ---------------- */
export interface SegOption<T extends string> {
  value: T
  label: ReactNode
}
export function Segmented<T extends string>({
  options,
  value,
  onChange,
  ariaLabel,
  className,
}: {
  options: SegOption<T>[]
  value: T
  onChange: (v: T) => void
  ariaLabel?: string
  className?: string
}) {
  return (
    <Tabs value={value} onValueChange={(v) => onChange(v as T)} className={className}>
      <TabsList
        variant="line"
        aria-label={ariaLabel}
        className="h-auto w-full justify-start gap-1 border-b border-line-strong"
      >
        {options.map((o) => (
          <TabsTrigger
            key={o.value}
            value={o.value}
            className="h-auto flex-none px-3.5 py-2 font-mono text-[13px] text-text-muted after:bg-primary data-[state=active]:text-primary dark:data-[state=active]:text-primary"
          >
            {o.label}
          </TabsTrigger>
        ))}
      </TabsList>
    </Tabs>
  )
}

/* ---------------- Speed slider (shadcn Slider) ---------------- */
export function SpeedSlider({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  return (
    <label className="ml-auto flex items-center gap-2 font-mono text-[12px] text-text-muted">
      speed
      <Slider
        value={[value]}
        min={500}
        max={3500}
        step={100}
        aria-label="Animation speed"
        onValueChange={(v) => onChange(4000 - v[0])}
        className="w-[108px]"
      />
    </label>
  )
}

/* ---------------- Switch (shadcn Switch + label) ---------------- */
export function Switch({
  checked,
  onChange,
  label,
}: {
  checked: boolean
  onChange: (v: boolean) => void
  label: string
}) {
  const id = useId()
  return (
    <span className="inline-flex items-center gap-2">
      <ShSwitch id={id} checked={checked} onCheckedChange={onChange} />
      <label htmlFor={id} className="cursor-pointer font-mono text-[12px] text-text-muted">
        {label}
      </label>
    </span>
  )
}
