import { useReducedMotion, type Transition, type Variants } from 'motion/react'

/** Shared spring presets — one rhythm across all three surfaces. */
export const springs = {
  gentle: { type: 'spring', stiffness: 210, damping: 26, mass: 0.9 },
  snappy: { type: 'spring', stiffness: 420, damping: 32 },
  bounceless: { type: 'spring', stiffness: 300, damping: 40 },
} satisfies Record<string, Transition>

/** Ease-out curves (no bounce on UI chrome). */
export const easeOutQuart = [0.25, 1, 0.5, 1] as const
export const easeOutExpo = [0.16, 1, 0.3, 1] as const

/** True when the user prefers reduced motion (calm fallbacks everywhere). */
export function useCalmMotion(): boolean {
  return useReducedMotion() ?? false
}

export const fadeUp: Variants = {
  hidden: { opacity: 0, y: 10 },
  show: { opacity: 1, y: 0, transition: { duration: 0.35, ease: easeOutExpo } },
  exit: { opacity: 0, y: -8, transition: { duration: 0.2, ease: easeOutQuart } },
}

export const pop: Variants = {
  hidden: { opacity: 0, scale: 0.9 },
  show: { opacity: 1, scale: 1, transition: springs.gentle },
}
