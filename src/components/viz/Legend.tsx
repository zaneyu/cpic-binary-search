import { cn } from '../../lib/cn'

export interface LegendItem {
  swatch: string
  label: string
}

/** Compact color key so the visualizations are self-explanatory. */
export function Legend({ items }: { items: LegendItem[] }) {
  return (
    <div className="flex flex-wrap gap-x-4 gap-y-1.5 font-mono text-[11px] text-text-muted">
      {items.map((it) => (
        <span key={it.label} className="inline-flex items-center gap-1.5">
          <span className={cn('inline-block h-2.5 w-2.5 rounded-[2px] border', it.swatch)} />
          {it.label}
        </span>
      ))}
    </div>
  )
}
