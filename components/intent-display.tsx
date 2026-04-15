'use client'

import { motion } from 'framer-motion'
import { GlassCard } from './glass-card'
import { Target, Brain, HelpCircle, Frown, Lightbulb, CheckCircle, AlertCircle, Heart, PartyPopper } from 'lucide-react'
import type { IntentAnalysis, Intent } from '@/lib/types'

const intentConfig: Record<Intent, { icon: React.ReactNode; label: string; color: string }> = {
  needs_help: { 
    icon: <HelpCircle className="w-5 h-5" />, 
    label: 'Needs Help',
    color: 'text-blue-400 bg-blue-400/10 border-blue-400/30'
  },
  low_confidence: { 
    icon: <AlertCircle className="w-5 h-5" />, 
    label: 'Low Confidence',
    color: 'text-orange-400 bg-orange-400/10 border-orange-400/30'
  },
  seeking_validation: { 
    icon: <CheckCircle className="w-5 h-5" />, 
    label: 'Seeking Validation',
    color: 'text-green-400 bg-green-400/10 border-green-400/30'
  },
  frustrated: { 
    icon: <Frown className="w-5 h-5" />, 
    label: 'Frustrated',
    color: 'text-red-400 bg-red-400/10 border-red-400/30'
  },
  curious: { 
    icon: <Lightbulb className="w-5 h-5" />, 
    label: 'Curious',
    color: 'text-yellow-400 bg-yellow-400/10 border-yellow-400/30'
  },
  decisive: { 
    icon: <Target className="w-5 h-5" />, 
    label: 'Decisive',
    color: 'text-primary bg-primary/10 border-primary/30'
  },
  uncertain: { 
    icon: <Brain className="w-5 h-5" />, 
    label: 'Uncertain',
    color: 'text-purple-400 bg-purple-400/10 border-purple-400/30'
  },
  sharing_joy: { 
    icon: <PartyPopper className="w-5 h-5" />, 
    label: 'Sharing Joy',
    color: 'text-pink-400 bg-pink-400/10 border-pink-400/30'
  },
}

interface IntentDisplayProps {
  intent: IntentAnalysis
}

export function IntentDisplay({ intent }: IntentDisplayProps) {
  const primaryConfig = intentConfig[intent.primary]
  const secondaryConfig = intent.secondary ? intentConfig[intent.secondary] : null

  return (
    <GlassCard className="p-6" delay={0.2}>
      <div className="flex items-center gap-2 mb-6">
        <Brain className="w-5 h-5 text-primary" />
        <h3 className="text-lg font-semibold text-foreground">Intent Inference</h3>
      </div>

      <div className="space-y-4">
        {/* Primary Intent */}
        <div className="space-y-2">
          <span className="text-xs uppercase tracking-wider text-muted-foreground">Primary Intent</span>
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className={`flex items-center gap-3 p-4 rounded-lg border ${primaryConfig.color}`}
          >
            {primaryConfig.icon}
            <div className="flex-1">
              <p className="font-medium">{primaryConfig.label}</p>
              <p className="text-xs text-muted-foreground mt-0.5">
                Confidence: {Math.round(intent.confidence * 100)}%
              </p>
            </div>
          </motion.div>
        </div>

        {/* Secondary Intent */}
        {secondaryConfig && (
          <div className="space-y-2">
            <span className="text-xs uppercase tracking-wider text-muted-foreground">Secondary Intent</span>
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.1 }}
              className={`flex items-center gap-3 p-3 rounded-lg border opacity-70 ${secondaryConfig.color}`}
            >
              {secondaryConfig.icon}
              <span className="font-medium text-sm">{secondaryConfig.label}</span>
            </motion.div>
          </div>
        )}

        {/* Reasoning */}
        <div className="mt-4 p-3 rounded-lg bg-muted/50 border border-border/50">
          <p className="text-xs uppercase tracking-wider text-muted-foreground mb-2">AI Reasoning</p>
          <p className="text-sm text-foreground/80 leading-relaxed">{intent.reasoning}</p>
        </div>
      </div>
    </GlassCard>
  )
}
