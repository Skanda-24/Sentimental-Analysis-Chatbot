'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { GlassCard } from './glass-card'
import { Button } from './ui/button'
import { Sparkles, Volume2, VolumeX, Copy, Check, Lightbulb } from 'lucide-react'
import type { AnalysisResult } from '@/lib/types'

interface AIResponsePanelProps {
  analysis: AnalysisResult
}

export function AIResponsePanel({ analysis }: AIResponsePanelProps) {
  const [isSpeaking, setIsSpeaking] = useState(false)
  const [copied, setCopied] = useState(false)

  const handleSpeak = () => {
    if (isSpeaking) {
      window.speechSynthesis.cancel()
      setIsSpeaking(false)
    } else {
      const utterance = new SpeechSynthesisUtterance(analysis.aiResponse.message)
      utterance.onend = () => setIsSpeaking(false)
      window.speechSynthesis.speak(utterance)
      setIsSpeaking(true)
    }
  }

  const handleCopy = () => {
    navigator.clipboard.writeText(analysis.aiResponse.message)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <GlassCard className="p-6" delay={0.4}>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-primary" />
          <h3 className="text-lg font-semibold text-foreground">AI Response</h3>
        </div>
        <div className="flex items-center gap-2">
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-8 w-8"
            onClick={handleSpeak}
          >
            {isSpeaking ? (
              <VolumeX className="w-4 h-4" />
            ) : (
              <Volume2 className="w-4 h-4" />
            )}
          </Button>
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-8 w-8"
            onClick={handleCopy}
          >
            {copied ? (
              <Check className="w-4 h-4 text-green-400" />
            ) : (
              <Copy className="w-4 h-4" />
            )}
          </Button>
        </div>
      </div>

      {/* Main Response */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="p-4 rounded-lg bg-primary/5 border border-primary/20 mb-6"
      >
        <p className="text-foreground leading-relaxed">{analysis.aiResponse.message}</p>
      </motion.div>

      {/* Emotional Explanation */}
      <div className="mb-6">
        <h4 className="text-sm font-medium text-foreground mb-2 flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-accent" />
          Emotional State Analysis
        </h4>
        <p className="text-sm text-muted-foreground leading-relaxed">
          {analysis.aiResponse.emotionalExplanation}
        </p>
      </div>

      {/* Advice */}
      <div>
        <h4 className="text-sm font-medium text-foreground mb-3 flex items-center gap-2">
          <Lightbulb className="w-4 h-4 text-yellow-400" />
          Recommendations
        </h4>
        <div className="space-y-2">
          {analysis.aiResponse.advice.map((advice, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 + index * 0.1 }}
              className="flex items-start gap-3 p-3 rounded-lg bg-muted/50 border border-border/50"
            >
              <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/20 text-primary text-xs flex items-center justify-center font-medium">
                {index + 1}
              </span>
              <p className="text-sm text-foreground/90">{advice}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </GlassCard>
  )
}
