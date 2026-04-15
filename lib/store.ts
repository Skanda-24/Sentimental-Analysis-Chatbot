import { create } from 'zustand'
import type { AnalysisResult, InputMode, InteractionHistory } from './types'

interface AnalysisStore {
  // Current state
  isAnalyzing: boolean
  currentInput: string
  inputMode: InputMode
  currentAnalysis: AnalysisResult | null
  
  // History
  history: InteractionHistory
  
  // Actions
  setInput: (input: string) => void
  setInputMode: (mode: InputMode) => void
  setIsAnalyzing: (analyzing: boolean) => void
  setCurrentAnalysis: (analysis: AnalysisResult | null) => void
  addToHistory: (result: AnalysisResult) => void
  clearHistory: () => void
}

export const useAnalysisStore = create<AnalysisStore>((set) => ({
  isAnalyzing: false,
  currentInput: '',
  inputMode: { type: 'text', isActive: true },
  currentAnalysis: null,
  history: {
    interactions: [],
    patterns: {
      dominantEmotionOverTime: [],
      averageStressLevel: 0,
      trends: [],
    },
  },
  
  setInput: (input) => set({ currentInput: input }),
  setInputMode: (mode) => set({ inputMode: mode }),
  setIsAnalyzing: (analyzing) => set({ isAnalyzing: analyzing }),
  setCurrentAnalysis: (analysis) => set({ currentAnalysis: analysis }),
  
  addToHistory: (result) => set((state) => {
    const interactions = [...state.history.interactions, result]
    
    // Calculate patterns
    const emotionCounts: Record<string, number> = {}
    let totalStress = 0
    
    interactions.forEach((i) => {
      emotionCounts[i.dominantEmotion] = (emotionCounts[i.dominantEmotion] || 0) + 1
      totalStress += i.psychologicalState.stressLevel
    })
    
    const dominantEmotionOverTime = Object.entries(emotionCounts)
      .map(([emotion, count]) => ({ emotion: emotion as AnalysisResult['dominantEmotion'], count }))
      .sort((a, b) => b.count - a.count)
    
    const averageStressLevel = totalStress / interactions.length
    
    // Generate trends
    const trends: string[] = []
    if (interactions.length >= 3) {
      const recent = interactions.slice(-3)
      const recentStress = recent.reduce((sum, i) => sum + i.psychologicalState.stressLevel, 0) / 3
      if (recentStress > 0.7) {
        trends.push('High stress levels detected in recent interactions')
      }
      if (recent.every(i => i.dominantEmotion === recent[0].dominantEmotion)) {
        trends.push(`Consistent ${recent[0].dominantEmotion} emotional state`)
      }
    }
    
    return {
      history: {
        interactions,
        patterns: {
          dominantEmotionOverTime,
          averageStressLevel,
          trends,
        },
      },
    }
  }),
  
  clearHistory: () => set({
    history: {
      interactions: [],
      patterns: {
        dominantEmotionOverTime: [],
        averageStressLevel: 0,
        trends: [],
      },
    },
  }),
}))
