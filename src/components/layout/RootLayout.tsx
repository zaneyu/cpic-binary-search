import { AnimatePresence, motion, MotionConfig } from 'motion/react'
import { Outlet, useLocation } from 'react-router-dom'
import { AmbientBackground } from './AmbientBackground'
import { TopNav } from './TopNav'
import { easeOutExpo } from '../../lib/motion'

export function RootLayout() {
  const location = useLocation()
  return (
    <MotionConfig reducedMotion="user">
      <AmbientBackground />
      <TopNav />
      <main className="mx-auto max-w-[920px] px-4 pb-24 pt-5">
        <AnimatePresence mode="wait">
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.22, ease: easeOutExpo }}
          >
            <Outlet />
          </motion.div>
        </AnimatePresence>
      </main>
    </MotionConfig>
  )
}
