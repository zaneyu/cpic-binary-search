import type { CSSProperties } from 'react'

interface Blob {
  bg: string
  style: CSSProperties
  anim: string
}

const BLOBS: Blob[] = [
  {
    bg: 'radial-gradient(circle at center, rgba(95,184,212,0.55), transparent 68%)',
    style: { width: '52vw', height: '52vw', top: '-12vw', left: '-8vw' },
    anim: 'aurora-drift-a 19s ease-in-out infinite',
  },
  {
    bg: 'radial-gradient(circle at center, rgba(184,137,232,0.6), transparent 68%)',
    style: { width: '58vw', height: '58vw', top: '-16vw', right: '-12vw' },
    anim: 'aurora-drift-b 23s ease-in-out infinite',
  },
  {
    bg: 'radial-gradient(circle at center, rgba(240,138,168,0.5), transparent 68%)',
    style: { width: '60vw', height: '60vw', bottom: '-24vw', left: '50%', marginLeft: '-30vw' },
    anim: 'aurora-drift-c 27s ease-in-out infinite',
  },
  {
    bg: 'radial-gradient(circle at center, rgba(240,198,116,0.28), transparent 70%)',
    style: { width: '40vw', height: '40vw', top: '34%', left: '18%' },
    anim: 'aurora-drift-a 31s ease-in-out infinite',
  },
]

/** Living aurora backdrop. Drift is GPU-only and freezes under reduced motion. */
export function AmbientBackground() {
  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 -z-10 overflow-hidden bg-bg">
      {BLOBS.map((b, i) => (
        <div
          key={i}
          className="absolute rounded-full opacity-70 blur-[64px] will-change-transform dark:opacity-90"
          style={{ background: b.bg, animation: b.anim, ...b.style }}
        />
      ))}
      {/* faint vignette to settle the center */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_40%,var(--bg)_92%)] opacity-80" />
    </div>
  )
}
