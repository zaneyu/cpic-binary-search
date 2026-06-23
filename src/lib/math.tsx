import { useMemo } from 'react'
import katex from 'katex'

/** Render a plain-text segment, replacing $$...$$ and $...$ with KaTeX HTML. */
function renderSegment(text: string): string {
  if (text.indexOf('$') === -1) return text
  let out = ''
  let i = 0
  while (i < text.length) {
    if (text[i] === '$') {
      const display = text[i + 1] === '$'
      const close = display ? '$$' : '$'
      const start = i + close.length
      const end = text.indexOf(close, start)
      if (end !== -1) {
        const expr = text.slice(start, end)
        try {
          out += katex.renderToString(expr, { displayMode: display, throwOnError: false })
        } catch {
          out += text.slice(i, end + close.length)
        }
        i = end + close.length
        continue
      }
    }
    out += text[i]
    i++
  }
  return out
}

/**
 * Render inline math inside an HTML string. Splits into tag vs text tokens and
 * only processes text, so interleaved tags (<span>, <code>, <br>, <strong>, <em>)
 * are never corrupted. Synchronous (no effect timing) — always renders.
 */
export function renderMathInString(html: string): string {
  return html
    .split(/(<[^>]+>)/)
    .map((tok) => (tok.startsWith('<') ? tok : renderSegment(tok)))
    .join('')
}

/** Renders an HTML string that interleaves tags with inline $...$ math. */
export function RichText({ html, className }: { html: string; className?: string }) {
  const rendered = useMemo(() => renderMathInString(html), [html])
  return <div className={className} dangerouslySetInnerHTML={{ __html: rendered }} />
}

/** A single standalone math expression. */
export function Math({
  expr,
  display = false,
  className,
}: {
  expr: string
  display?: boolean
  className?: string
}) {
  const html = useMemo(
    () => katex.renderToString(expr, { displayMode: display, throwOnError: false }),
    [expr, display],
  )
  return <span className={className} dangerouslySetInnerHTML={{ __html: html }} />
}
