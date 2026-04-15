'use client'

import { motion } from 'framer-motion'
import { GlassCard } from './glass-card'
import type { EmotionScore, Emotion } from '@/lib/types'

const emotionConfig: Record<Emotion, { color: string; icon: string; label: string }> = {
  happy: { color: 'bg-yellow-400', icon: '😊', label: 'Happy' },
  sad: { color: 'bg-blue-400', icon: '😢', label: 'Sad' },
  angry: { color: 'bg-red-400', icon: '😠', label: 'Angry' },
  fear: { color: 'bg-purple-400', icon: '😨', label: 'Fear' },
  neutral: { color: 'bg-gray-400', icon: '😐', label: 'Neutral' },
}

interface EmotionMeterProps {
  emotions: EmotionScore[]
  dominantEmotion: Emotion
}

export function EmotionMeter({ emotions, dominantEmotion }: EmotionMeterProps) {
  const sortedEmotions = [...emotions].sort((a, b) => b.score - a.score)

  return (
    <GlassCard className="p-6" delay={0.1}>
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-foreground">Emotion Analysis</h3>
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20">
          <span className="text-xl">{emotionConfig[dominantEmotion].icon}</span>
          <span className="text-sm font-medium text-primary">
            {emotionConfig[dominantEmotion].label}
          </span>
        </div>
      </div>

      <div className="space-y-4">
        {sortedEmotions.map((emotion, index) => {
          const config = emotionConfig[emotion.emotion]
          return (
            <div key={emotion.emotion} className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="flex items-center gap-2 text-muted-foreground">
                  <span>{config.icon}</span>
                  {config.label}
                </span>
                <span className="text-foreground font-medium">
                  {Math.round(emotion.score * 100)}%
                </span>
              </div>
              <div className="h-2 rounded-full bg-muted overflow-hidden">
                <motion.div
                  className={`h-full rounded-full ${config.color}`}
                  initial={{ width: 0 }}
                  animate={{ width: `${emotion.score * 100}%` }}
                  transition={{ duration: 0.8, delay: index * 0.1 }}
                />
              </div>
            </div>
          )
        })}
      </div>
    </GlassCard>
  )
}
