'use client'

import { motion } from 'framer-motion'
import { GlassCard } from './glass-card'
import { Brain, Activity, Zap } from 'lucide-react'
import type { AnalysisResult } from '@/lib/types'

interface PsychologicalStateProps {
  state: AnalysisResult['psychologicalState']
}

const metrics = [
  { 
    key: 'stressLevel',
    label: 'Stress Level',
    icon: Activity,
    lowColor: 'text-green-400',
    highColor: 'text-red-400',
    bgLow: 'bg-green-400',
    bgHigh: 'bg-red-400',
  },
  { 
    key: 'engagementLevel',
    label: 'Engagement',
    icon: Zap,
    lowColor: 'text-red-400',
    highColor: 'text-primary',
    bgLow: 'bg-red-400',
    bgHigh: 'bg-primary',
  },
  { 
    key: 'mentalClarity',
    label: 'Mental Clarity',
    icon: Brain,
    lowColor: 'text-orange-400',
    highColor: 'text-green-400',
    bgLow: 'bg-orange-400',
    bgHigh: 'bg-green-400',
  },
]

export function PsychologicalState({ state }: PsychologicalStateProps) {
  const getColor = (value: number, low: string, high: string) => {
    return value >= 0.5 ? high : low
  }

  const getDescription = (key: string, value: number) => {
    if (key === 'stressLevel') {
      if (value < 0.3) return 'Relaxed'
      if (value < 0.6) return 'Moderate'
      return 'Elevated'
    }
    if (key === 'engagementLevel') {
      if (value < 0.3) return 'Low'
      if (value < 0.6) return 'Moderate'
      return 'High'
    }
    if (key === 'mentalClarity') {
      if (value < 0.3) return 'Foggy'
      if (value < 0.6) return 'Moderate'
      return 'Clear'
    }
    return ''
  }

  return (
    <GlassCard className="p-6" delay={0.35}>
      <div className="flex items-center gap-2 mb-6">
        <Brain className="w-5 h-5 text-primary" />
        <h3 className="text-lg font-semibold text-foreground">Psychological State</h3>
      </div>

      <div className="space-y-5">
        {metrics.map((metric, index) => {
          const value = state[metric.key as keyof typeof state]
          const Icon = metric.icon
          const colorClass = getColor(value, metric.lowColor, metric.highColor)
          const bgClass = getColor(value, metric.bgLow, metric.bgHigh)

          return (
            <div key={metric.key} className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Icon className={`w-4 h-4 ${colorClass}`} />
                  <span className="text-sm text-muted-foreground">{metric.label}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`text-sm font-medium ${colorClass}`}>
                    {getDescription(metric.key, value)}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {Math.round(value * 100)}%
                  </span>
                </div>
              </div>
              <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                <motion.div
                  className={`h-full rounded-full ${bgClass}`}
                  initial={{ width: 0 }}
                  animate={{ width: `${value * 100}%` }}
                  transition={{ duration: 0.8, delay: index * 0.1 }}
                />
              </div>
            </div>
          )
        })}
      </div>

      {/* Summary */}
      <div className="mt-6 p-3 rounded-lg bg-muted/50 border border-border/50">
        <p className="text-xs text-muted-foreground leading-relaxed">
          {state.stressLevel > 0.6 
            ? 'Elevated stress detected. Consider taking breaks and practicing relaxation techniques.'
            : state.mentalClarity > 0.7 && state.engagementLevel > 0.6
            ? 'Optimal cognitive state. Good focus and engagement levels.'
            : 'Moderate psychological state. Maintaining balance is key.'}
        </p>
      </div>
    </GlassCard>
  )
}
