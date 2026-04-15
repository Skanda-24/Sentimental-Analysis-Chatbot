'use client'

import { motion } from 'framer-motion'
import { GlassCard } from './glass-card'

interface ConfidenceGaugeProps {
  confidence: number
  label: string
  description?: string
}

export function ConfidenceGauge({ confidence, label, description }: ConfidenceGaugeProps) {
  const circumference = 2 * Math.PI * 45
  const strokeDashoffset = circumference - (confidence * circumference)

  const getColor = (value: number) => {
    if (value >= 0.8) return 'text-green-400'
    if (value >= 0.6) return 'text-yellow-400'
    if (value >= 0.4) return 'text-orange-400'
    return 'text-red-400'
  }

  return (
    <GlassCard className="p-6" delay={0.3}>
      <h3 className="text-lg font-semibold text-foreground mb-4">{label}</h3>
      
      <div className="flex flex-col items-center">
        <div className="relative w-28 h-28">
          {/* Background circle */}
          <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
            <circle
              cx="50"
              cy="50"
              r="45"
              fill="none"
              stroke="currentColor"
              strokeWidth="8"
              className="text-muted"
            />
            <motion.circle
              cx="50"
              cy="50"
              r="45"
              fill="none"
              stroke="currentColor"
              strokeWidth="8"
              strokeLinecap="round"
              className={getColor(confidence)}
              strokeDasharray={circumference}
              initial={{ strokeDashoffset: circumference }}
              animate={{ strokeDashoffset }}
              transition={{ duration: 1, ease: 'easeOut' }}
            />
          </svg>
          
          {/* Center text */}
          <div className="absolute inset-0 flex items-center justify-center">
            <motion.span
              className={`text-2xl font-bold ${getColor(confidence)}`}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
            >
              {Math.round(confidence * 100)}%
            </motion.span>
          </div>
        </div>

        {description && (
          <p className="text-sm text-muted-foreground text-center mt-4">{description}</p>
        )}
      </div>
    </GlassCard>
  )
}
