import { Fragment, type ReactNode } from 'react'

const KEYWORDS = new Set(['while', 'if', 'else', 'return', 'for', 'do'])
const TYPES = new Set(['int', 'bool', 'void', 'vector', 'auto', 'long'])
const FUNCS = new Set([
  'check', 'max', 'min', 'ceil', 'floor', 'lower_bound', 'upper_bound',
  'begin', 'end', 'size', 'sort', 'abs',
])
const CONSTS = new Set(['true', 'false'])

// one token at a time: comment | string | number | identifier | whitespace | punctuation
const TOKEN = /(\/\/[^\n]*)|("(?:[^"\\]|\\.)*")|(\b\d+\b)|([A-Za-z_]\w*)|(\s+)|([^\sA-Za-z0-9_])/g

function identClass(id: string): string | null {
  if (KEYWORDS.has(id)) return 'text-code-kw'
  if (TYPES.has(id)) return 'text-code-type'
  if (FUNCS.has(id)) return 'text-code-fn'
  if (CONSTS.has(id)) return 'text-code-num'
  return null
}

/** Lightweight C++-pseudocode syntax highlighter -> colored spans. */
export function highlight(line: string): ReactNode {
  if (!line) return ' '
  const out: ReactNode[] = []
  let m: RegExpExecArray | null
  let key = 0
  TOKEN.lastIndex = 0
  while ((m = TOKEN.exec(line))) {
    const [, comment, str, num, ident, ws, punc] = m
    if (comment) out.push(<span key={key++} className="italic text-code-comment">{comment}</span>)
    else if (str) out.push(<span key={key++} className="text-code-str">{str}</span>)
    else if (num) out.push(<span key={key++} className="text-code-num">{num}</span>)
    else if (ident) {
      const cls = identClass(ident)
      out.push(cls ? <span key={key++} className={cls}>{ident}</span> : <Fragment key={key++}>{ident}</Fragment>)
    } else if (ws) out.push(<Fragment key={key++}>{ws}</Fragment>)
    else out.push(<span key={key++} className="text-text-muted">{punc}</span>)
  }
  return out
}
