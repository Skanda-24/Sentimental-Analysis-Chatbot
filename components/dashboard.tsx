'use client'

import { useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Header } from './header'
import { InputPanel } from './input-panel'
import { EmotionMeter } from './emotion-meter'
import { IntentDisplay } from './intent-display'
import { ConfidenceGauge } from './confidence-gauge'
import { PsychologicalState } from './psychological-state'
import { AIResponsePanel } from './ai-response-panel'
import { MoodTimeline } from './mood-timeline'
import { ThinkingAnimation } from './thinking-animation'
import { HistoryPanel } from './history-panel'
import { SettingsPanel } from './settings-panel'
import { GlassCard } from './glass-card'
import { useAnalysisStore } from '@/lib/store'
import type { AnalysisResult } from '@/lib/types'
import { Brain, Sparkles, Activity, MessageSquare } from 'lucide-react'

export function Dashboard() {
  const [isHistoryOpen, setIsHistoryOpen] = useState(false)
  const [isSettingsOpen, setIsSettingsOpen] = useState(false)
  const {
    isAnalyzing,
    currentAnalysis,
    history,
    setIsAnalyzing,
    setCurrentAnalysis,
    addToHistory,
    clearHistory,
  } = useAnalysisStore()

  const handleSubmit = useCallback(async (input: string, mode: 'text' | 'voice' | 'video') => {
    setIsAnalyzing(true)
    setCurrentAnalysis(null)

    try {
      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ input, inputType: mode }),
      })

      if (!response.ok) throw new Error('Analysis failed')

      const result: AnalysisResult = await response.json()
      setCurrentAnalysis(result)
      addToHistory(result)
    } catch (error) {
      console.error('[v0] Analysis error:', error)
    } finally {
      setIsAnalyzing(false)
    }
  }, [setIsAnalyzing, setCurrentAnalysis, addToHistory])

  const handleDownloadReport = useCallback(async () => {
    try {
      const response = await fetch('/api/report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ history, currentAnalysis }),
      })

      if (!response.ok) throw new Error('Report generation failed')

      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `cognitive-ai-report-${Date.now()}.txt`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      a.remove()
    } catch (error) {
      console.error('[v0] Report download error:', error)
    }
  }, [history, currentAnalysis])

  return (
    <div className="min-h-screen bg-background">
      <Header
        onDownloadReport={handleDownloadReport}
        onToggleHistory={() => setIsHistoryOpen(true)}
        onToggleSettings={() => setIsSettingsOpen(true)}
        historyCount={history.interactions.length}
      />

      <main className="container mx-auto px-4 py-8">
        {/* Welcome Section - shown when no analysis */}
        {!currentAnalysis && !isAnalyzing && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-8"
          >
            <h2 className="text-3xl font-bold text-foreground mb-3">
              Welcome to <span className="text-primary">Cognitive AI Engine</span>
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Advanced multi-modal AI system that analyzes your emotions, detects hidden intent, 
              and provides intelligent responses. Start by entering text, recording your voice, 
              or using your webcam.
            </p>

            {/* Feature cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-8 max-w-4xl mx-auto">
              {[
                { icon: Brain, label: 'Emotion Detection', desc: 'Analyze emotions from text, voice, and video' },
                { icon: Sparkles, label: 'Intent Inference', desc: 'Understand hidden intent beyond surface meaning' },
                { icon: Activity, label: 'Psychological State', desc: 'Monitor stress, engagement, and clarity' },
                { icon: MessageSquare, label: 'AI Response', desc: 'Get intelligent, contextual responses' },
              ].map((feature, index) => (
                <motion.div
                  key={feature.label}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <GlassCard className="p-4 h-full" animate={false}>
                    <feature.icon className="w-8 h-8 text-primary mx-auto mb-2" />
                    <h3 className="font-medium text-foreground text-sm">{feature.label}</h3>
                    <p className="text-xs text-muted-foreground mt-1">{feature.desc}</p>
                  </GlassCard>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column - Input */}
          <div className="lg:col-span-4 space-y-6">
            <InputPanel onSubmit={handleSubmit} isAnalyzing={isAnalyzing} />
            
            {/* Mood Timeline */}
            <MoodTimeline history={history.interactions} />
          </div>

          {/* Right Column - Results */}
          <div className="lg:col-span-8">
            <AnimatePresence mode="wait">
              {isAnalyzing ? (
                <motion.div
                  key="thinking"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  <ThinkingAnimation />
                </motion.div>
              ) : currentAnalysis ? (
                <motion.div
                  key="results"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="space-y-6"
                >
                  {/* Top Row - Emotion & Intent */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <EmotionMeter
                      emotions={currentAnalysis.emotions}
                      dominantEmotion={currentAnalysis.dominantEmotion}
                    />
                    <IntentDisplay intent={currentAnalysis.intent} />
                  </div>

                  {/* Middle Row - Gauges & Psychological State */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <ConfidenceGauge
                      confidence={currentAnalysis.intent.confidence}
                      label="Analysis Confidence"
                      description="Overall confidence in the analysis results"
                    />
                    <ConfidenceGauge
                      confidence={currentAnalysis.sentiment.score * 0.5 + 0.5}
                      label="Sentiment Score"
                      description={`Overall sentiment: ${currentAnalysis.sentiment.label}`}
                    />
                    <PsychologicalState state={currentAnalysis.psychologicalState} />
                  </div>

                  {/* AI Response */}
                  <AIResponsePanel analysis={currentAnalysis} />
                </motion.div>
              ) : (
                <motion.div
                  key="empty"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  <GlassCard className="p-12 text-center">
                    <Brain className="w-16 h-16 text-muted-foreground mx-auto mb-4 opacity-50" />
                    <h3 className="text-lg font-medium text-foreground mb-2">Ready for Analysis</h3>
                    <p className="text-muted-foreground max-w-md mx-auto">
                      Enter your thoughts, record your voice, or enable your webcam to begin 
                      emotion and intent analysis.
                    </p>
                  </GlassCard>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </main>

      {/* History Panel */}
      <HistoryPanel
        isOpen={isHistoryOpen}
        onClose={() => setIsHistoryOpen(false)}
        history={history}
        onClear={clearHistory}
      />

      {/* Settings Panel */}
      <SettingsPanel
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
      />
    </div>
  )
}
