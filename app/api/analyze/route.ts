import { NextResponse } from 'next/server'
import type { AnalysisResult, Emotion, Intent, EmotionScore } from '@/lib/types'

// Advanced NLP-inspired emotion analysis with context awareness, negation handling, and semantic understanding
function analyzeText(text: string): { emotions: EmotionScore[]; sentiment: number } {
  const lowercaseText = text.toLowerCase()
  const originalText = text
  
  // Initialize emotion scores
  const scores = {
    happy: 0,
    sad: 0,
    angry: 0,
    fear: 0,
    neutral: 0.1, // Small baseline
  }
  
  // ========== STEP 1: Detect and remove negated phrases ==========
  // These patterns NEGATE the emotion - "wasn't pissed" means NOT angry
  const negationPatterns = [
    { pattern: /(?:wasn't|wasn't|was not|isn't|is not|aren't|are not|weren't|were not|not|never|no longer|don't|doesn't|didn't|won't|wouldn't|couldn't|can't)\s+(?:even\s+)?(?:really\s+)?(?:that\s+)?(?:very\s+)?(?:so\s+)?(pissed|angry|mad|furious|upset|annoyed|frustrated|irritated)/gi, negates: 'angry' },
    { pattern: /(?:wasn't|wasn't|was not|isn't|is not|aren't|are not|weren't|were not|not|never|no longer|don't|doesn't|didn't|won't|wouldn't|couldn't|can't)\s+(?:even\s+)?(?:really\s+)?(?:that\s+)?(?:very\s+)?(?:so\s+)?(sad|depressed|down|unhappy|upset|disappointed)/gi, negates: 'sad' },
    { pattern: /(?:wasn't|wasn't|was not|isn't|is not|aren't|are not|weren't|were not|not|never|no longer|don't|doesn't|didn't|won't|wouldn't|couldn't|can't)\s+(?:even\s+)?(?:really\s+)?(?:that\s+)?(?:very\s+)?(?:so\s+)?(scared|afraid|worried|anxious|nervous|fearful)/gi, negates: 'fear' },
    { pattern: /(?:wasn't|wasn't|was not|isn't|is not|aren't|are not|weren't|were not|not|never|no longer|don't|doesn't|didn't|won't|wouldn't|couldn't|can't)\s+(?:even\s+)?(?:really\s+)?(?:that\s+)?(?:very\s+)?(?:so\s+)?(happy|excited|glad|pleased)/gi, negates: 'happy' },
  ]
  
  // Track what was negated so we don't double-count
  const negatedEmotions: Set<string> = new Set()
  let processedText = lowercaseText
  
  for (const { pattern, negates } of negationPatterns) {
    if (pattern.test(lowercaseText)) {
      negatedEmotions.add(negates)
      // When something negative is negated, it's slightly positive
      if (negates === 'angry' || negates === 'sad' || negates === 'fear') {
        scores.happy += 0.15 // "wasn't pissed" implies positive outcome
      }
      // Remove the negated phrase from further processing
      processedText = processedText.replace(pattern, ' ')
    }
    pattern.lastIndex = 0 // Reset regex
  }
  
  // ========== STEP 2: Detect positive romantic/relationship contexts ==========
  const romanticPositivePatterns = [
    { pattern: /kiss(?:ed|ing|es)?/i, score: 0.4 },
    { pattern: /hug(?:ged|ging|s)?/i, score: 0.35 },
    { pattern: /cuddl(?:ed|ing|e|es)?/i, score: 0.35 },
    { pattern: /hold(?:ing)?\s+(?:my\s+)?(?:hand|me|her|him)/i, score: 0.3 },
    { pattern: /(?:she|he)\s+(?:loves?|likes?)\s+me/i, score: 0.5 },
    { pattern: /(?:we|i)\s+(?:made\s+up|reconciled|got\s+back\s+together)/i, score: 0.5 },
    { pattern: /(?:my|the)\s+(?:girl(?:friend)?|boy(?:friend)?|wife|husband|partner|babe?|baby|love|honey|sweetheart|darling)/i, score: 0.2 },
    { pattern: /said\s+(?:yes|i\s+love\s+you)/i, score: 0.5 },
    { pattern: /(?:she|he)\s+(?:kissed|hugged)\s+(?:me|back)/i, score: 0.45 },
    { pattern: /kissed\s+(?:me\s+)?back/i, score: 0.45 },
    { pattern: /(?:finally|actually)\s+(?:kissed|hugged|talked|made\s+up)/i, score: 0.4 },
    { pattern: /(?:love|loved|loving)\s+(?:it|this|her|him|them|you)/i, score: 0.35 },
    { pattern: /(?:date|dating|dated)\s+(?:went\s+)?(?:well|great|amazing|perfect)/i, score: 0.4 },
    { pattern: /(?:got|getting|asked)\s+(?:engaged|married|together)/i, score: 0.5 },
  ]
  
  for (const { pattern, score } of romanticPositivePatterns) {
    if (pattern.test(processedText)) {
      scores.happy += score
    }
  }
  
  // ========== STEP 3: Detect achievement/success contexts ==========
  const achievementPatterns = [
    { pattern: /(?:i|we)\s+(?:got|received|won|earned|achieved|passed|made|landed|secured)/i, score: 0.35 },
    { pattern: /(?:promotion|raise|job|offer|accepted|graduated|degree|award|prize)/i, score: 0.3 },
    { pattern: /(?:finally|actually)\s+(?:did|made|finished|completed|got)/i, score: 0.3 },
    { pattern: /(?:dream|dreams?)\s+(?:came?\s+true|achieved|realized)/i, score: 0.5 },
    { pattern: /(?:best|greatest|happiest)\s+(?:day|moment|time|news)/i, score: 0.45 },
    { pattern: /can't\s+believe\s+(?:it|this)\s+(?:happened|worked|actually)/i, score: 0.3 },
  ]
  
  for (const { pattern, score } of achievementPatterns) {
    if (pattern.test(processedText)) {
      scores.happy += score
    }
  }
  
  // ========== STEP 4: Explicit emotion declarations (highest priority) ==========
  const explicitPatterns = [
    // Happy declarations
    { pattern: /i(?:'m| am)\s+(?:so\s+|very\s+|really\s+|super\s+|extremely\s+)?(?:happy|excited|thrilled|overjoyed|ecstatic|delighted|elated|joyful|grateful|blessed)/i, emotion: 'happy', score: 0.7 },
    { pattern: /(?:feeling|felt)\s+(?:so\s+|very\s+|really\s+)?(?:happy|good|great|amazing|wonderful|fantastic|blessed|grateful|joyful)/i, emotion: 'happy', score: 0.6 },
    { pattern: /(?:this|it|that)\s+(?:is|was)\s+(?:so\s+|really\s+)?(?:amazing|wonderful|great|fantastic|perfect|beautiful|awesome)/i, emotion: 'happy', score: 0.4 },
    { pattern: /(?:best|happiest|greatest)\s+(?:day|moment|feeling|time|thing)/i, emotion: 'happy', score: 0.5 },
    { pattern: /(?:omg|oh my god|yay|woohoo|yes|finally)!*/i, emotion: 'happy', score: 0.3 },
    
    // Sad declarations
    { pattern: /i(?:'m| am)\s+(?:so\s+|very\s+|really\s+)?(?:sad|depressed|devastated|heartbroken|miserable|down|upset|unhappy|hurt|broken)/i, emotion: 'sad', score: 0.7 },
    { pattern: /(?:feeling|felt)\s+(?:so\s+|very\s+|really\s+)?(?:sad|down|low|blue|empty|lonely|depressed|devastated)/i, emotion: 'sad', score: 0.6 },
    { pattern: /(?:this|it)\s+(?:breaks?|broke)\s+my\s+heart/i, emotion: 'sad', score: 0.6 },
    { pattern: /(?:crying|cried|tears|sobbing)/i, emotion: 'sad', score: 0.4 },
    
    // Angry declarations  
    { pattern: /i(?:'m| am)\s+(?:so\s+|very\s+|really\s+)?(?:angry|furious|pissed|mad|livid|enraged|outraged|frustrated|annoyed|irritated)/i, emotion: 'angry', score: 0.7 },
    { pattern: /(?:feeling|felt)\s+(?:so\s+|very\s+|really\s+)?(?:angry|mad|frustrated|annoyed|pissed|furious)/i, emotion: 'angry', score: 0.6 },
    { pattern: /(?:i|this)\s+(?:hate|hates?|despise|loathe)/i, emotion: 'angry', score: 0.5 },
    { pattern: /(?:pissed|angry|mad|furious)\s+(?:off|at|about)/i, emotion: 'angry', score: 0.55 },
    
    // Fear declarations
    { pattern: /i(?:'m| am)\s+(?:so\s+|very\s+|really\s+)?(?:scared|afraid|terrified|anxious|worried|nervous|panicking|freaking\s+out)/i, emotion: 'fear', score: 0.7 },
    { pattern: /(?:feeling|felt)\s+(?:so\s+|very\s+|really\s+)?(?:scared|anxious|worried|nervous|afraid|uneasy|terrified)/i, emotion: 'fear', score: 0.6 },
    { pattern: /(?:panic|panicking|anxiety|anxious)\s+(?:attack|about|over)/i, emotion: 'fear', score: 0.55 },
  ]
  
  for (const { pattern, emotion, score } of explicitPatterns) {
    // Only apply if this emotion wasn't negated
    if (pattern.test(processedText) && !negatedEmotions.has(emotion)) {
      scores[emotion as keyof typeof scores] += score
    }
  }
  
  // ========== STEP 5: Contextual keyword analysis (only if not already negated) ==========
  const keywordPatterns = {
    happy: {
      strong: ['love', 'amazing', 'wonderful', 'fantastic', 'perfect', 'beautiful', 'awesome', 'incredible', 'brilliant'],
      medium: ['happy', 'great', 'good', 'nice', 'excited', 'glad', 'pleased', 'joy', 'grateful', 'blessed', 'thankful'],
      mild: ['okay', 'fine', 'cool', 'fun', 'enjoy', 'like', 'smile', 'laugh', 'yay'],
    },
    sad: {
      strong: ['devastated', 'heartbroken', 'miserable', 'depressed', 'suicidal', 'hopeless'],
      medium: ['sad', 'unhappy', 'disappointed', 'lonely', 'hurt', 'crying', 'tears', 'grief'],
      mild: ['down', 'blue', 'low', 'miss', 'regret', 'sigh'],
    },
    angry: {
      strong: ['furious', 'enraged', 'livid', 'outraged', 'seething', 'infuriated', 'hate'],
      medium: ['angry', 'frustrated', 'annoyed', 'irritated', 'mad'],
      mild: ['bothered', 'aggravated', 'ugh'],
    },
    fear: {
      strong: ['terrified', 'petrified', 'horrified', 'panic'],
      medium: ['scared', 'afraid', 'worried', 'anxious', 'nervous', 'stressed', 'fearful'],
      mild: ['uncertain', 'unsure', 'concerned', 'uneasy', 'tense'],
    },
  }
  
  // Only check keywords if not already negated
  for (const [emotion, patterns] of Object.entries(keywordPatterns)) {
    if (negatedEmotions.has(emotion)) continue // Skip negated emotions
    
    for (const word of patterns.strong) {
      // Check word exists but not as part of negation context we already handled
      const wordRegex = new RegExp(`\\b${word}\\b`, 'i')
      if (wordRegex.test(processedText)) {
        scores[emotion as keyof typeof scores] += 0.35
      }
    }
    for (const word of patterns.medium) {
      const wordRegex = new RegExp(`\\b${word}\\b`, 'i')
      if (wordRegex.test(processedText)) {
        scores[emotion as keyof typeof scores] += 0.2
      }
    }
    for (const word of patterns.mild) {
      const wordRegex = new RegExp(`\\b${word}\\b`, 'i')
      if (wordRegex.test(processedText)) {
        scores[emotion as keyof typeof scores] += 0.1
      }
    }
  }
  
  // ========== STEP 6: Emoji detection ==========
  const emojiPatterns = {
    happy: ['😊', '😄', '😃', '🙂', '😁', '😍', '🥰', '❤️', '💕', '💖', '🎉', '✨', '🥳', '😆', '☺️', ':)', ':D', '<3'],
    sad: ['😢', '😭', '😞', '😔', '💔', '😿', '🥺', ':('],
    angry: ['😠', '😡', '🤬', '💢', '>:('],
    fear: ['😰', '😨', '😱', '😬', '🫣'],
  }
  
  for (const [emotion, emojis] of Object.entries(emojiPatterns)) {
    for (const emoji of emojis) {
      if (text.includes(emoji)) {
        scores[emotion as keyof typeof scores] += 0.2
      }
    }
  }
  
  // ========== STEP 7: Calculate final scores ==========
  const totalSignal = scores.happy + scores.sad + scores.angry + scores.fear
  
  // If very little emotional signal, default to neutral
  if (totalSignal < 0.2) {
    scores.neutral = 0.65
  } else {
    // Reduce neutral based on emotional signal
    scores.neutral = Math.max(0.05, 0.25 - totalSignal * 0.2)
  }
  
  // Normalize to percentages
  const total = Object.values(scores).reduce((sum, s) => sum + s, 0) || 1
  
  const emotionScores: EmotionScore[] = [
    { emotion: 'happy', score: Math.round((scores.happy / total) * 100) / 100, confidence: 0.85 + Math.min(0.1, scores.happy * 0.1) },
    { emotion: 'sad', score: Math.round((scores.sad / total) * 100) / 100, confidence: 0.85 + Math.min(0.1, scores.sad * 0.1) },
    { emotion: 'angry', score: Math.round((scores.angry / total) * 100) / 100, confidence: 0.85 + Math.min(0.1, scores.angry * 0.1) },
    { emotion: 'fear', score: Math.round((scores.fear / total) * 100) / 100, confidence: 0.85 + Math.min(0.1, scores.fear * 0.1) },
    { emotion: 'neutral', score: Math.round((scores.neutral / total) * 100) / 100, confidence: 0.85 },
  ]
  
  // Calculate sentiment (-1 to 1)
  const sentiment = (scores.happy * 2 - scores.sad * 1.5 - scores.angry - scores.fear * 0.5) / Math.max(totalSignal, 0.5)
  
  return { emotions: emotionScores, sentiment: Math.max(-1, Math.min(1, sentiment)) }
}

function inferIntent(text: string, emotions: EmotionScore[]): { primary: Intent; secondary?: Intent; reasoning: string } {
  const lowercaseText = text.toLowerCase()
  
  // Get dominant emotion first
  const dominantEmotion = emotions.reduce((max, e) => e.score > max.score ? e : max, emotions[0])
  
  // ========== HIGH PRIORITY: Detect storytelling/sharing patterns ==========
  // These indicate user is sharing an experience, not seeking help or frustrated
  const sharingStoryPatterns = [
    /(?:i|we)\s+(?:just\s+)?(?:kissed|hugged|cuddled|held\s+hands?)/i,
    /(?:she|he|they)\s+(?:kissed|hugged|cuddled|held)\s+(?:me|back)/i,
    /(?:we|i)\s+(?:went|had|got|did|made|saw|met|visited|tried)/i,
    /(?:my|the)\s+(?:girl(?:friend)?|boy(?:friend)?|wife|husband|partner|date)/i,
    /(?:yesterday|today|last\s+night|this\s+morning|earlier|just\s+now)/i,
    /(?:finally|actually)\s+(?:happened|worked|did\s+it|made\s+it)/i,
    /(?:guess\s+what|you\s+know\s+what|so\s+basically|let\s+me\s+tell)/i,
  ]
  
  let isShareingStory = sharingStoryPatterns.some(p => p.test(lowercaseText))
  
  // ========== Detect romantic/positive life events ==========
  const positiveLifeEventPatterns = [
    /(?:kissed|kiss|hugged|hug|cuddled|cuddle)/i,
    /(?:got\s+engaged|got\s+married|said\s+yes|proposed)/i,
    /(?:got\s+the\s+job|got\s+promoted|passed\s+the|graduated)/i,
    /(?:made\s+up|back\s+together|worked\s+out|forgave)/i,
    /(?:she|he)\s+(?:loves?|likes?)\s+me/i,
  ]
  
  const isPositiveLifeEvent = positiveLifeEventPatterns.some(p => p.test(lowercaseText))
  
  // Intent inference based on patterns
  const intentPatterns: { intent: Intent; patterns: string[]; weight: number }[] = [
    { intent: 'needs_help', patterns: ['help', 'how do i', 'can you', 'what should', 'advice', 'suggest', 'assist', 'guide'], weight: 0 },
    { intent: 'frustrated', patterns: ['frustrated', 'annoyed', 'tired of', 'sick of', 'terrible', 'awful', 'ugh'], weight: 0 },
    { intent: 'seeking_validation', patterns: ['right?', 'correct?', 'do you think', 'is it okay', 'am i', 'should i', 'what do you think'], weight: 0 },
    { intent: 'low_confidence', patterns: ['maybe', 'perhaps', 'not sure', 'i think', 'might be', 'could be', 'uncertain', 'possibly'], weight: 0 },
    { intent: 'curious', patterns: ['why', 'what is', 'how does', 'tell me', 'explain', 'curious', 'wonder', 'interested', 'learn'], weight: 0 },
    { intent: 'decisive', patterns: ['i will', 'i am going to', 'decided', 'definitely', 'for sure', 'certainly', 'absolutely', 'committed'], weight: 0 },
    { intent: 'uncertain', patterns: ['dont know', "don't know", 'confused', 'lost', 'unsure', 'unclear', 'mixed feelings', 'conflicted'], weight: 0 },
  ]

  // Check for explicit emotional sharing patterns (high priority)
  const sharingPatterns = [
    { pattern: /i(?:'m| am)\s+(?:feeling\s+)?(?:so\s+|very\s+|really\s+)?(?:happy|excited|thrilled|great|good|wonderful)/i, intent: 'sharing_positivity' },
    { pattern: /i(?:'m| am)\s+(?:feeling\s+)?(?:so\s+|very\s+|really\s+)?(?:sad|depressed|down|low|blue)/i, intent: 'seeking_support' },
    { pattern: /i(?:'m| am)\s+(?:feeling\s+)?(?:so\s+|very\s+|really\s+)?(?:angry|mad|furious|frustrated)/i, intent: 'venting' },
    { pattern: /i(?:'m| am)\s+(?:feeling\s+)?(?:so\s+|very\s+|really\s+)?(?:scared|anxious|worried|nervous)/i, intent: 'seeking_comfort' },
    { pattern: /just wanted to (?:say|share|tell)/i, intent: 'sharing' },
    { pattern: /good news|great news|exciting news/i, intent: 'sharing_positivity' },
  ]

  let specialIntent: string | null = null
  
  // If sharing a story with positive life event AND happy emotion, it's sharing positivity
  if (isShareingStory && isPositiveLifeEvent && dominantEmotion.emotion === 'happy') {
    specialIntent = 'sharing_positivity'
  } else if (isShareingStory && dominantEmotion.emotion === 'happy' && dominantEmotion.score > 0.4) {
    specialIntent = 'sharing_positivity'
  } else {
    for (const { pattern, intent } of sharingPatterns) {
      if (pattern.test(lowercaseText)) {
        specialIntent = intent
        break
      }
    }
  }

  // Pattern matching for standard intents (but reduce weight for frustrated if story telling positive event)
  intentPatterns.forEach(pattern => {
    pattern.patterns.forEach(p => {
      // Skip "hate" check if in positive context (e.g. "I hate that I waited so long" in positive story)
      if (lowercaseText.includes(p)) {
        // Reduce weight if this seems like a positive story
        if (isPositiveLifeEvent && pattern.intent === 'frustrated') {
          pattern.weight += 0.2 // Much lower weight
        } else {
          pattern.weight += 1
        }
      }
    })
  })

  // Emotion-based weight adjustments
  // Only add frustrated weight if emotion is actually angry AND not telling a positive story
  if (dominantEmotion.emotion === 'angry' && !isPositiveLifeEvent) {
    intentPatterns.find(p => p.intent === 'frustrated')!.weight += 2
  }
  if (dominantEmotion.emotion === 'fear') {
    intentPatterns.find(p => p.intent === 'needs_help')!.weight += 1
    intentPatterns.find(p => p.intent === 'uncertain')!.weight += 1
  }
  if (dominantEmotion.emotion === 'sad' && !isPositiveLifeEvent) {
    intentPatterns.find(p => p.intent === 'seeking_validation')!.weight += 1.5
  }
  if (dominantEmotion.emotion === 'happy' && dominantEmotion.score > 0.3) {
    intentPatterns.find(p => p.intent === 'decisive')!.weight += 2
    // Happy users often just want to share
    if (!specialIntent) specialIntent = 'sharing_positivity'
  }

  // Sort by weight
  intentPatterns.sort((a, b) => b.weight - a.weight)
  
  // If no clear intent detected but emotion is strong, use special intents
  const maxWeight = intentPatterns[0].weight
  
  // Determine primary intent
  let primary: Intent
  let reasoning: string

  // Force sharing positivity for happy dominant emotion with positive life events
  if (dominantEmotion.emotion === 'happy' && dominantEmotion.score > 0.4 && isPositiveLifeEvent) {
    primary = 'sharing_joy'
    reasoning = 'The user is excitedly sharing a wonderful personal experience! They seem to want to celebrate and share this beautiful moment with you.'
  } else if (specialIntent && maxWeight < 1.5) {
    // Use emotion-based intent when no strong pattern match
    switch (specialIntent) {
      case 'sharing_positivity':
        primary = 'sharing_joy'
        reasoning = 'The user is sharing positive emotions and appears to be in a wonderful emotional state. They want to express their joy and celebrate!'
        break
      case 'seeking_support':
        primary = 'seeking_validation'
        reasoning = 'The user is expressing difficult emotions and may be seeking emotional support or understanding.'
        break
      case 'venting':
        primary = 'frustrated'
        reasoning = 'The user appears to be venting their frustrations and may need a space to express their feelings.'
        break
      case 'seeking_comfort':
        primary = 'needs_help'
        reasoning = 'The user is expressing anxiety or fear and may be seeking comfort or reassurance.'
        break
      default:
        primary = 'curious'
        reasoning = 'The user is sharing their current state and may be open to dialogue.'
    }
  } else {
    primary = intentPatterns[0].intent
    
    // Generate reasoning based on emotion + intent combo
    const reasoningMap: Record<Intent, Record<Emotion | 'default', string>> = {
      needs_help: {
        happy: 'The user is in a positive mood but appears to be seeking guidance or information.',
        sad: 'The user seems to need support and assistance while going through a difficult time.',
        angry: 'Despite some frustration, the user is actively seeking help to resolve their situation.',
        fear: 'The user is anxious and looking for guidance to address their concerns.',
        neutral: 'The user appears to be seeking guidance or assistance with a specific issue.',
        default: 'The user appears to be seeking guidance or assistance with a specific issue.',
      },
      frustrated: {
        happy: 'The user has some minor frustrations but maintains a generally positive outlook.',
        sad: 'The user is experiencing a mix of sadness and frustration that needs acknowledgment.',
        angry: 'Strong signs of frustration are evident. The user may need to express and process these feelings.',
        fear: 'The user is frustrated and worried, possibly feeling overwhelmed by their situation.',
        neutral: 'Signs of frustration are evident in the communication style and word choice.',
        default: 'Signs of frustration are evident in the communication style and word choice.',
      },
      seeking_validation: {
        happy: 'The user is feeling good and may be looking for positive reinforcement.',
        sad: 'The user is seeking reassurance during a vulnerable emotional state.',
        angry: 'The user wants validation for their frustrations and feelings.',
        fear: 'The user is anxious and seeking confirmation that their concerns are valid.',
        neutral: 'The user seems to be looking for confirmation or reassurance about their thoughts.',
        default: 'The user seems to be looking for confirmation or reassurance about their thoughts.',
      },
      low_confidence: {
        happy: 'Despite positive emotions, the user shows some hesitation in their expression.',
        sad: 'The user is experiencing low confidence compounded by difficult emotions.',
        angry: 'The user is frustrated with their own uncertainty about the situation.',
        fear: 'Anxiety is contributing to the user\u0027s lack of confidence.',
        neutral: 'Language patterns suggest uncertainty or lack of confidence in their position.',
        default: 'Language patterns suggest uncertainty or lack of confidence in their position.',
      },
      curious: {
        happy: 'The user is enthusiastically curious and eager to learn more.',
        sad: 'The user is seeking understanding, perhaps hoping knowledge will help their situation.',
        angry: 'The user wants answers and is determined to understand the situation better.',
        fear: 'The user is seeking information to help address their concerns.',
        neutral: 'The user is showing interest and desire to learn or understand more.',
        default: 'The user is showing interest and desire to learn or understand more.',
      },
      decisive: {
        happy: 'The user is confident and positive about their direction or decision.',
        sad: 'Despite difficult emotions, the user has made a firm decision.',
        angry: 'The user has made a determined choice, possibly fueled by frustration.',
        fear: 'The user is making a decision despite their anxieties.',
        neutral: 'Clear decision-making language indicates a firm stance or conclusion.',
        default: 'Clear decision-making language indicates a firm stance or conclusion.',
      },
      uncertain: {
        happy: 'The user is in good spirits but facing a decision they\u0027re unsure about.',
        sad: 'The user is struggling with uncertainty during an emotionally difficult time.',
        angry: 'The user is frustrated by their own indecision or conflicting thoughts.',
        fear: 'Anxiety is amplifying the user\u0027s uncertainty about their situation.',
        neutral: 'Mixed signals and hesitant language suggest internal conflict or confusion.',
        default: 'Mixed signals and hesitant language suggest internal conflict or confusion.',
      },
      sharing_joy: {
        happy: 'The user is sharing wonderful news and wants to celebrate this joyful moment!',
        sad: 'Despite some challenges, the user is finding reasons to be grateful.',
        angry: 'The user is sharing good news that might help resolve their frustrations.',
        fear: 'Good news is helping ease the user\u0027s worries.',
        neutral: 'The user is sharing a positive experience or good news.',
        default: 'The user is sharing a positive experience and wants to celebrate!',
      },
    }
    
    reasoning = reasoningMap[primary][dominantEmotion.emotion] || reasoningMap[primary]['default']
  }

  const secondary = intentPatterns[1].weight > 0 ? intentPatterns[1].intent : undefined

  return {
    primary,
    secondary,
    reasoning,
  }
}

function generateAIResponse(emotions: EmotionScore[], intent: { primary: Intent; secondary?: Intent }, text: string): {
  message: string
  advice: string[]
  emotionalExplanation: string
} {
  const dominantEmotion = emotions.reduce((max, e) => e.score > max.score ? e : max, emotions[0])
  const lowercaseText = text.toLowerCase()
  
  // Check if user is simply sharing positive emotions
  const isSharingHappiness = dominantEmotion.emotion === 'happy' && dominantEmotion.score > 0.5
  const isExplicitlyHappy = /i(?:'m| am)\s+(?:so\s+|very\s+|really\s+|feeling\s+)?happy/i.test(lowercaseText)
  
  // Generate contextual response based on emotion and intent
  const responses: Record<Intent, Record<Emotion | 'default', string[]>> = {
    needs_help: {
      happy: [
        "Great to see you're in good spirits! I'm here to help you with whatever you need.",
        "Love your positive energy! Let's work together to address your question.",
      ],
      sad: [
        "I'm here for you. Let's work through this together at your own pace.",
        "I understand things feel difficult right now. Let me help you find some clarity.",
      ],
      angry: [
        "I hear your frustration. Let's channel that energy into finding a solution.",
        "I understand this is frustrating. Let's break this down together.",
      ],
      fear: [
        "It's okay to feel uncertain. I'm here to help guide you through this.",
        "I sense some worry, but together we can find a way forward.",
      ],
      neutral: [
        "I understand you're looking for guidance. Let me help you work through this step by step.",
        "It sounds like you could use some support. I'm here to help you find clarity.",
      ],
      default: [
        "I understand you're looking for guidance. Let me help you work through this step by step.",
        "It sounds like you could use some support. I'm here to help you find clarity.",
      ],
    },
    frustrated: {
      happy: [
        "I see you're keeping positive despite some challenges. That resilience is admirable!",
        "Good attitude! Even when things are frustrating, your optimism shines through.",
      ],
      sad: [
        "I can feel the weight of what you're going through. These feelings are completely valid.",
        "It's tough when frustration and sadness mix. Take your time processing this.",
      ],
      angry: [
        "I can sense your frustration, and that's completely valid. Let's address what's bothering you.",
        "Your feelings of frustration are understandable. Sometimes situations can feel overwhelming.",
      ],
      fear: [
        "Feeling frustrated and worried is exhausting. Let's find some relief together.",
        "I understand the combination of frustration and anxiety. We'll take this one step at a time.",
      ],
      neutral: [
        "I notice some frustration in your words. Let's work through this together.",
        "It seems like something is bothering you. I'm here to listen and help.",
      ],
      default: [
        "I can sense your frustration, and that's completely valid. Let's address what's bothering you.",
        "Your feelings of frustration are understandable. Sometimes situations can feel overwhelming.",
      ],
    },
    seeking_validation: {
      happy: [
        "Absolutely! Your positive outlook is wonderful and well-deserved.",
        "Yes! You have every reason to feel good about this.",
      ],
      sad: [
        "Your feelings are completely valid. It's okay to need reassurance right now.",
        "What you're feeling makes sense. You don't have to justify your emotions.",
      ],
      angry: [
        "Your frustration is valid. It's natural to want acknowledgment for what you're experiencing.",
        "I understand why you feel this way. Your perspective is valid.",
      ],
      fear: [
        "Your concerns are legitimate. It's wise to seek confirmation when uncertain.",
        "It's natural to want reassurance. Your feelings and thoughts matter.",
      ],
      neutral: [
        "Your thoughts and feelings are valid. It's natural to seek reassurance.",
        "What you're experiencing makes sense given your situation. Trust your instincts.",
      ],
      default: [
        "Your thoughts and feelings are valid. It's natural to seek reassurance when facing uncertainty.",
        "What you're experiencing makes sense given your situation. Trust your instincts.",
      ],
    },
    low_confidence: {
      happy: [
        "Your positive attitude is great! A little uncertainty is normal when trying new things.",
        "It's okay to be unsure - your optimism will carry you through!",
      ],
      sad: [
        "I hear the hesitation in your words. Be gentle with yourself during this time.",
        "Uncertainty combined with difficult emotions is hard. Take it one step at a time.",
      ],
      angry: [
        "I sense frustration with the uncertainty. That's a tough combination to navigate.",
        "It's okay to not have all the answers. Your feelings are valid.",
      ],
      fear: [
        "Uncertainty can feel overwhelming. Remember, not knowing is a starting point, not a failure.",
        "It's natural to feel unsure. Let's explore this together.",
      ],
      neutral: [
        "I notice some hesitation in your words. Remember, it's okay to not have all the answers.",
        "Uncertainty is part of growth. Let's explore this together to build your confidence.",
      ],
      default: [
        "I notice some hesitation in your words. Remember, it's okay to not have all the answers.",
        "Uncertainty is part of growth. Let's explore this together to build your confidence.",
      ],
    },
    curious: {
      happy: [
        "I love your enthusiasm for learning! Let's explore this together.",
        "Your curiosity and positive energy are wonderful! Here's what I can share.",
      ],
      sad: [
        "Seeking understanding is a positive step. Knowledge can be empowering.",
        "Your desire to learn more shows strength. Let me share what I know.",
      ],
      angry: [
        "I can see you want answers. Let's find them together.",
        "Your determination to understand is clear. Here's what I can tell you.",
      ],
      fear: [
        "Knowledge often helps reduce worry. Let me help address your questions.",
        "Seeking understanding is a great way to manage uncertainty.",
      ],
      neutral: [
        "Your curiosity is wonderful! Let me share some insights that might help.",
        "Great question! Exploring and questioning leads to better understanding.",
      ],
      default: [
        "Your curiosity is wonderful! Let me share some insights that might help.",
        "Great question! Exploring and questioning leads to better understanding.",
      ],
    },
    decisive: {
      happy: [
        "That's wonderful to hear! Your positive energy is contagious. Keep embracing this great feeling!",
        "I love that you're feeling so good! This is a beautiful state of mind to be in.",
        "Your happiness is radiating through your words! Enjoy this moment fully.",
        "Fantastic! It's great that you're in such high spirits. These positive feelings are valuable.",
      ],
      sad: [
        "Even through difficult emotions, your determination shines through.",
        "Making decisions during tough times shows real strength.",
      ],
      angry: [
        "I can see you've made up your mind. That clarity can be powerful.",
        "Your conviction is clear. Channel that energy constructively.",
      ],
      fear: [
        "Moving forward despite fears takes courage. I admire your determination.",
        "Making decisions when anxious isn't easy. Your resolve is commendable.",
      ],
      neutral: [
        "I can see you've given this careful thought. Your determination is evident.",
        "You seem clear about your direction. That's a powerful starting point.",
      ],
      default: [
        "I can see you've given this careful thought. Your determination is evident.",
        "You seem clear about your direction. That's a powerful starting point.",
      ],
    },
    uncertain: {
      happy: [
        "Even with some uncertainty, your positive outlook is a great asset!",
        "It's okay to not have all answers while still feeling good about things.",
      ],
      sad: [
        "Feeling uncertain while going through a hard time is completely natural.",
        "Mixed feelings during difficult periods are normal. Be patient with yourself.",
      ],
      angry: [
        "I understand the frustration of not being sure. That conflict is tough.",
        "Uncertainty when you're already frustrated can feel overwhelming. Take a breath.",
      ],
      fear: [
        "Uncertainty can amplify worry. Let's work through this together.",
        "It's okay to feel unsure. We can explore this at your pace.",
      ],
      neutral: [
        "It's okay to feel uncertain. Let's work through these mixed feelings together.",
        "Conflicting thoughts are normal. Taking time to process is a healthy approach.",
      ],
      default: [
        "It's okay to feel uncertain. Let's work through these mixed feelings together.",
        "Conflicting thoughts are normal. Taking time to process is a healthy approach.",
      ],
    },
    sharing_joy: {
      happy: [
        "Oh wow, that's absolutely wonderful! I'm so happy for you! This is such a beautiful moment worth celebrating!",
        "This is amazing news! Your happiness is radiating through your words. What a special experience!",
        "How beautiful! Moments like these are what life is all about. I'm genuinely thrilled for you!",
        "That's so sweet and heartwarming! Thank you for sharing this joyful moment with me!",
      ],
      sad: [
        "Even in difficult times, it's wonderful that you found this moment of joy!",
        "This positive experience is a beautiful reminder that good things happen.",
      ],
      angry: [
        "What a lovely turn of events! It's great to see something positive happening.",
        "This is wonderful news - it's nice when things work out well!",
      ],
      fear: [
        "This is wonderful! Sometimes our fears don't come true and beautiful things happen instead.",
        "What a relief and what joy! This is a lovely outcome.",
      ],
      neutral: [
        "That's really nice to hear! Thank you for sharing this positive moment.",
        "How lovely! It's great to celebrate these good moments in life.",
      ],
      default: [
        "That's absolutely wonderful! Thank you for sharing this beautiful moment with me!",
        "How amazing! These special moments in life are truly precious!",
      ],
    },
  }

  const emotionalExplanations: Record<Emotion, string> = {
    happy: "Your emotional state is radiating positivity and joy! This is wonderful - positive emotions enhance creativity, strengthen relationships, and support overall wellbeing. Savor this feeling!",
    sad: "I detect some sadness in your expression. It's important to acknowledge these feelings and give yourself space to process them. Remember, it's okay to not be okay.",
    angry: "There are signs of anger or frustration. While these emotions are valid and sometimes necessary, finding healthy outlets for them can help you regain balance and clarity.",
    fear: "I sense some anxiety or worry. Remember that fear often stems from uncertainty, and seeking information or support can help reduce these feelings.",
    neutral: "Your emotional state appears balanced and calm. This can be a good foundation for objective decision-making and clear thinking.",
  }

  const adviceByIntent: Record<Intent, Record<Emotion | 'default', string[]>> = {
    needs_help: {
      happy: [
        "Leverage your positive mindset to approach challenges creatively",
        "Your good mood can help you communicate needs more effectively",
        "Consider what specific support would be most helpful right now",
      ],
      default: [
        "Break down your problem into smaller, manageable parts",
        "Consider reaching out to trusted friends or professionals for support",
        "Write down your thoughts to gain clarity on the situation",
      ],
    },
    frustrated: {
      default: [
        "Take a short break to reset your emotional state",
        "Practice deep breathing or brief meditation",
        "Identify specific triggers and address them one at a time",
      ],
    },
    seeking_validation: {
      happy: [
        "Celebrate your wins - you deserve to feel good!",
        "Share your happiness with others who support you",
        "Reflect on what contributed to this positive state",
      ],
      default: [
        "Trust your judgment - you know your situation best",
        "Consider the evidence that supports your perspective",
        "Seek feedback from people who understand your context",
      ],
    },
    low_confidence: {
      default: [
        "Reflect on past successes to boost your confidence",
        "Start with small, achievable steps to build momentum",
        "Acknowledge that learning involves making mistakes",
      ],
    },
    curious: {
      happy: [
        "Channel your positive energy into exploring new ideas",
        "Share your discoveries with others who might benefit",
        "Keep a journal of interesting insights and questions",
      ],
      default: [
        "Explore multiple perspectives on the topic",
        "Document your findings and questions for future reference",
        "Connect with others who share similar interests",
      ],
    },
    decisive: {
      happy: [
        "Embrace and extend this positive feeling throughout your day",
        "Consider what activities or people contributed to your happiness",
        "Use this energy to tackle tasks you've been putting off",
        "Share your good mood with others - positivity is contagious!",
      ],
      default: [
        "Validate your decision with a quick pros/cons analysis",
        "Consider potential obstacles and prepare contingencies",
        "Share your plan with someone who can provide honest feedback",
      ],
    },
    uncertain: {
      default: [
        "Give yourself permission to not have all the answers right now",
        "Consider journaling to explore your conflicting thoughts",
        "Seek input from different perspectives before deciding",
      ],
    },
    sharing_joy: {
      happy: [
        "Savor this beautiful moment - you deserve all this happiness!",
        "Take a mental snapshot of how you feel right now",
        "Share this joy with the people who matter to you",
        "Let this positive experience fuel your confidence going forward",
      ],
      default: [
        "Celebrate this wonderful moment fully",
        "Remember this feeling for times when you need a boost",
        "Share your happiness - joy multiplies when shared!",
      ],
    },
  }

  // Get the appropriate response based on emotion
  const responseOptions = responses[intent.primary][dominantEmotion.emotion] || responses[intent.primary]['default']
  const adviceOptions = adviceByIntent[intent.primary][dominantEmotion.emotion] || adviceByIntent[intent.primary]['default']

  return {
    message: responseOptions[Math.floor(Math.random() * responseOptions.length)],
    advice: adviceOptions,
    emotionalExplanation: emotionalExplanations[dominantEmotion.emotion],
  }
}

export async function POST(request: Request) {
  try {
    const { input, inputType } = await request.json()

    if (!input) {
      return NextResponse.json({ error: 'Input is required' }, { status: 400 })
    }

    // Simulate processing delay
    await new Promise(resolve => setTimeout(resolve, 2000))

    // Analyze text
    const { emotions, sentiment } = analyzeText(input)
    const dominantEmotion = emotions.reduce((max, e) => e.score > max.score ? e : max, emotions[0])
    
    // Infer intent
    const intentAnalysis = inferIntent(input, emotions)
    
    // Generate AI response
    const aiResponse = generateAIResponse(emotions, intentAnalysis, input)

    // Calculate psychological state
    const stressLevel = (emotions.find(e => e.emotion === 'angry')?.score || 0) * 0.5 +
                       (emotions.find(e => e.emotion === 'fear')?.score || 0) * 0.8 +
                       (emotions.find(e => e.emotion === 'sad')?.score || 0) * 0.3
    
    const engagementLevel = Math.min(1, 0.3 + input.length / 200 + 
                           (intentAnalysis.primary === 'curious' ? 0.3 : 0) +
                           (intentAnalysis.primary === 'decisive' ? 0.2 : 0))
    
    const mentalClarity = 1 - (
      (intentAnalysis.primary === 'uncertain' ? 0.4 : 0) +
      (intentAnalysis.primary === 'low_confidence' ? 0.3 : 0) +
      stressLevel * 0.3
    )

    const result: AnalysisResult = {
      id: `analysis-${Date.now()}`,
      timestamp: new Date(),
      input: {
        type: inputType || 'text',
        content: input,
      },
      emotions,
      dominantEmotion: dominantEmotion.emotion,
      intent: {
        primary: intentAnalysis.primary,
        secondary: intentAnalysis.secondary,
        confidence: 0.75 + Math.random() * 0.2,
        reasoning: intentAnalysis.reasoning,
      },
      sentiment: {
        score: sentiment,
        label: sentiment > 0.2 ? 'positive' : sentiment < -0.2 ? 'negative' : 'neutral',
      },
      psychologicalState: {
        stressLevel: Math.max(0.1, Math.min(1, stressLevel)),
        engagementLevel: Math.max(0.2, Math.min(1, engagementLevel)),
        mentalClarity: Math.max(0.2, Math.min(1, mentalClarity)),
      },
      aiResponse,
    }

    return NextResponse.json(result)
  } catch (error) {
    console.error('Analysis error:', error)
    return NextResponse.json({ error: 'Analysis failed' }, { status: 500 })
  }
}
