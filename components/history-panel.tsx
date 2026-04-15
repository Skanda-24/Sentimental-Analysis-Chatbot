'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { GlassCard } from './glass-card'
import { X, TrendingUp, TrendingDown, AlertTriangle, CheckCircle } from 'lucide-react'
import { Button } from './ui/button'
import type { InteractionHistory } from '@/lib/types'

const emotionEmoji: Record<string, string> = {
  happy: '😊',
  sad: '😢',
  angry: '😠',
  fear: '😨',
  neutral: '😐',
}

interface HistoryPanelProps {
  isOpen: boolean
  onClose: () => void
  history: InteractionHistory
  onClear: () => void
}

export function HistoryPanel({ isOpen, onClose, history, onClear }: HistoryPanelProps) {
  const { interactions, patterns } = history

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
            onClick={onClose}
          />

          {/* Panel */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed right-0 top-0 bottom-0 w-full max-w-md bg-background border-l border-border z-50 overflow-hidden"
          >
            <div className="flex flex-col h-full">
              {/* Header */}
              <div className="flex items-center justify-between p-4 border-b border-border">
                <h2 className="text-lg font-semibold text-foreground">Interaction History</h2>
                <Button variant="ghost" size="icon" onClick={onClose}>
                  <X className="w-5 h-5" />
                </Button>
              </div>

              {/* Content */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {interactions.length === 0 ? (
                  <div className="text-center py-12 text-muted-foreground">
                    <p>No interactions yet.</p>
                    <p className="text-sm mt-1">Start analyzing to build history.</p>
                  </div>
                ) : (
                  <>
                    {/* Patterns Summary */}
                    {patterns.trends.length > 0 && (
                      <GlassCard className="p-4" animate={false}>
                        <h3 className="text-sm font-medium text-foreground mb-3 flex items-center gap-2">
                          <AlertTriangle className="w-4 h-4 text-yellow-400" />
                          Detected Patterns
                        </h3>
                        <div className="space-y-2">
                          {patterns.trends.map((trend, i) => (
                            <div key={i} className="flex items-start gap-2 text-sm">
                              <span className="text-yellow-400">•</span>
                              <span className="text-muted-foreground">{trend}</span>
                            </div>
                          ))}
                        </div>
                      </GlassCard>
                    )}

                    {/* Stats */}
                    <div className="grid grid-cols-2 gap-3">
                      <GlassCard className="p-3" animate={false}>
                        <p className="text-xs text-muted-foreground">Total Interactions</p>
                        <p className="text-2xl font-bold text-foreground">{interactions.length}</p>
                      </GlassCard>
                      <GlassCard className="p-3" animate={false}>
                        <p className="text-xs text-muted-foreground">Avg Stress Level</p>
                        <div className="flex items-center gap-2">
                          <p className="text-2xl font-bold text-foreground">
                            {Math.round(patterns.averageStressLevel * 100)}%
                          </p>
                          {patterns.averageStressLevel > 0.6 ? (
                            <TrendingUp className="w-4 h-4 text-red-400" />
                          ) : (
                            <TrendingDown className="w-4 h-4 text-green-400" />
                          )}
                        </div>
                      </GlassCard>
                    </div>

                    {/* Emotion Distribution */}
                    <GlassCard className="p-4" animate={false}>
                      <h3 className="text-sm font-medium text-foreground mb-3">Emotion Distribution</h3>
                      <div className="space-y-2">
                        {patterns.dominantEmotionOverTime.map(({ emotion, count }) => (
                          <div key={emotion} className="flex items-center gap-3">
                            <span className="text-lg">{emotionEmoji[emotion]}</span>
                            <div className="flex-1">
                              <div className="flex items-center justify-between mb-1">
                                <span className="text-sm capitalize text-foreground">{emotion}</span>
                                <span className="text-xs text-muted-foreground">{count}</span>
                              </div>
                              <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                                <div
                                  className="h-full bg-primary rounded-full"
                                  style={{ width: `${(count / interactions.length) * 100}%` }}
                                />
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </GlassCard>

                    {/* Interaction List */}
                    <div className="space-y-3">
                      <h3 className="text-sm font-medium text-foreground">Recent Interactions</h3>
                      {[...interactions].reverse().map((interaction) => (
                        <GlassCard key={interaction.id} className="p-3" animate={false}>
                          <div className="flex items-start gap-3">
                            <span className="text-xl">{emotionEmoji[interaction.dominantEmotion]}</span>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm text-foreground line-clamp-2">
                                {interaction.input.content}
                              </p>
                              <div className="flex items-center gap-2 mt-2">
                                <span className="text-xs px-2 py-0.5 rounded-full bg-primary/20 text-primary capitalize">
                                  {interaction.intent.primary.replace('_', ' ')}
                                </span>
                                <span className="text-xs text-muted-foreground">
                                  {new Date(interaction.timestamp).toLocaleTimeString([], { 
                                    hour: '2-digit', 
                                    minute: '2-digit' 
                                  })}
                                </span>
                              </div>
                            </div>
                          </div>
                        </GlassCard>
                      ))}
                    </div>
                  </>
                )}
              </div>

              {/* Footer */}
              {interactions.length > 0 && (
                <div className="p-4 border-t border-border">
                  <Button 
                    variant="outline" 
                    className="w-full"
                    onClick={onClear}
                  >
                    Clear History
                  </Button>
                </div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
