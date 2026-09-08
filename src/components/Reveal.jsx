import { motion } from 'framer-motion'

export const ease = [0.16, 1, 0.3, 1]

/** Scroll-into-view reveal — restrained fade + rise */
export default function Reveal({ children, delay = 0, y = 28, once = true, className, as = 'div' }) {
  const M = motion[as] || motion.div
  return (
    <M
      className={className}
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once, margin: '-60px' }}
      transition={{ duration: 0.9, delay, ease }}
    >
      {children}
    </M>
  )
}

/** Page shell for route transitions */
export function Page({ children, className = '' }) {
  return (
    <motion.main
      className={className}
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.45, ease }}
    >
      {children}
    </motion.main>
  )
}
