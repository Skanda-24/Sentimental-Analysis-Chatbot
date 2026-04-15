'use client'

import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'

interface GlassCardProps {
  children: React.ReactNode
  className?: string
  animate?: boolean
  delay?: number
}

export function GlassCard({ children, className, animate = true, delay = 0 }: GlassCardProps) {
  const content = (
    <div
      className={cn(
        'relative rounded-xl border border-border/50 bg-card/80 backdrop-blur-xl',
        'shadow-lg shadow-black/20',
        'before:absolute before:inset-0 before:rounded-xl before:bg-gradient-to-br before:from-white/5 before:to-transparent before:pointer-events-none',
        className
      )}
    >
      {children}
    </div>
  )

  if (!animate) return content

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
    >
      {content}
    </motion.div>
  )
}
