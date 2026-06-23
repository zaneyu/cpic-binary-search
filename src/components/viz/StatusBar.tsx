import { RichText } from '../../lib/math'

/** Narration line. Full-bordered card (no side-stripe), renders inline math. */
export function StatusBar({ html }: { html: string }) {
  return (
    <RichText
      html={html}
      className="min-h-5 rounded-md border border-line-strong bg-surface px-3.5 py-3 text-sm leading-relaxed text-text [&_code]:rounded [&_code]:bg-surface-muted [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:font-mono [&_code]:text-xs [&_code]:text-accent"
    />
  )
}
