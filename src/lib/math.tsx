import { useLayoutEffect, useMemo, useRef } from 'react'
import katex from 'katex'
import renderMathInElement from 'katex/contrib/auto-render'

/** Delimiters matching the legacy site's auto-render config. */
export const KATEX_OPTS = {
  delimiters: [
    { left: '$$', right: '$$', display: true },
    { left: '$', right: '$', display: false },
    { left: '\\(', right: '\\)', display: false },
    { left: '\\[', right: '\\]', display: true },
  ],
  throwOnError: false,
}

/**
 * Renders an HTML string that interleaves tags with inline `$...$` math.
 * Sets innerHTML, then runs KaTeX auto-render over the DOM (never string-splits),
 * exactly mirroring the legacy `renderMathInElement` behavior.
 */
export function RichText({ html, className }: { html: string; className?: string }) {
  const ref = useRef<HTMLDivElement>(null)
  useLayoutEffect(() => {
    if (ref.current) {
      try {
        renderMathInElement(ref.current, KATEX_OPTS)
      } catch {
        /* throwOnError:false already guards; ignore any auto-render hiccup */
      }
    }
  }, [html])
  return <div ref={ref} className={className} dangerouslySetInnerHTML={{ __html: html }} />
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
