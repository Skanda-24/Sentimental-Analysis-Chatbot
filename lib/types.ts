export type Emotion = 'happy' | 'sad' | 'angry' | 'fear' | 'neutral'

export type Intent = 
  | 'needs_help'
  | 'low_confidence'
  | 'seeking_validation'
  | 'frustrated'
  | 'curious'
  | 'decisive'
  | 'uncertain'
  | 'sharing_joy'

export interface EmotionScore {
  emotion: Emotion
  score: number
  confidence: number
}

export interface IntentAnalysis {
  primary: Intent
  secondary?: Intent
  confidence: number
  reasoning: string
}

export interface AnalysisResult {
  id: string
  timestamp: Date
  input: {
    type: 'text' | 'voice' | 'video'
    content: string
    duration?: number
  }
  emotions: EmotionScore[]
  dominantEmotion: Emotion
  intent: IntentAnalysis
  sentiment: {
    score: number // -1 to 1
    label: 'negative' | 'neutral' | 'positive'
  }
  psychologicalState: {
    stressLevel: number
    engagementLevel: number
    mentalClarity: number
  }
  aiResponse: {
    message: string
    advice: string[]
    emotionalExplanation: string
  }
}

export interface InteractionHistory {
  interactions: AnalysisResult[]
  patterns: {
    dominantEmotionOverTime: { emotion: Emotion; count: number }[]
    averageStressLevel: number
    trends: string[]
  }
}

export interface InputMode {
  type: 'text' | 'voice' | 'video'
  isActive: boolean
}
