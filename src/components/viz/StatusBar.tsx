import { RichText } from '../../lib/math'

/** Narration as a terminal log line with a prompt glyph. Renders inline math. */
export function StatusBar({ html }: { html: string }) {
  return (
    <div
      role="status"
      aria-live="polite"
      aria-atomic="true"
      className="flex items-start gap-2.5 rounded-[3px] border border-line-strong bg-surface-muted px-3.5 py-3"
    >
      <span aria-hidden className="select-none pt-px font-mono text-sm text-accent">
        ›
      </span>
      <RichText
        html={html}
        className="min-h-5 flex-1 font-mono text-[13px] leading-relaxed text-text [&_code]:rounded-[2px] [&_code]:bg-surface [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:text-xs [&_code]:text-accent"
      />
    </div>
  )
}
