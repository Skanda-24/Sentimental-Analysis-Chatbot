import { NextResponse } from 'next/server'
import type { AnalysisResult, InteractionHistory } from '@/lib/types'

export async function POST(request: Request) {
  try {
    const { history, currentAnalysis }: { history: InteractionHistory; currentAnalysis: AnalysisResult | null } = await request.json()

    const analyses = currentAnalysis 
      ? [...history.interactions, currentAnalysis] 
      : history.interactions

    if (analyses.length === 0) {
      return NextResponse.json({ error: 'No data to generate report' }, { status: 400 })
    }

    // Generate report content
    const reportDate = new Date().toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })

    const emotionCounts: Record<string, number> = {}
    let totalStress = 0
    let totalEngagement = 0
    let totalClarity = 0

    analyses.forEach(a => {
      emotionCounts[a.dominantEmotion] = (emotionCounts[a.dominantEmotion] || 0) + 1
      totalStress += a.psychologicalState.stressLevel
      totalEngagement += a.psychologicalState.engagementLevel
      totalClarity += a.psychologicalState.mentalClarity
    })

    const avgStress = totalStress / analyses.length
    const avgEngagement = totalEngagement / analyses.length
    const avgClarity = totalClarity / analyses.length

    const sortedEmotions = Object.entries(emotionCounts)
      .sort((a, b) => b[1] - a[1])
      .map(([emotion, count]) => ({ emotion, count, percentage: (count / analyses.length * 100).toFixed(1) }))

    const report = `
================================================================================
                    COGNITIVE AI ENGINE - ANALYSIS REPORT
================================================================================

Generated: ${reportDate}
Total Interactions Analyzed: ${analyses.length}

================================================================================
                           EMOTIONAL PROFILE
================================================================================

Dominant Emotions Distribution:
${sortedEmotions.map(e => `  ${e.emotion.toUpperCase().padEnd(10)} : ${('█'.repeat(Math.round(Number(e.percentage) / 5))).padEnd(20)} ${e.percentage}% (${e.count} occurrences)`).join('\n')}

Primary Emotion: ${sortedEmotions[0]?.emotion || 'N/A'}
Emotional Stability: ${avgStress < 0.4 ? 'Stable' : avgStress < 0.7 ? 'Moderate' : 'Needs Attention'}

================================================================================
                         PSYCHOLOGICAL STATE SUMMARY
================================================================================

Average Stress Level:     ${(avgStress * 100).toFixed(1)}% ${avgStress < 0.4 ? '(Low)' : avgStress < 0.7 ? '(Moderate)' : '(High)'}
Average Engagement:       ${(avgEngagement * 100).toFixed(1)}% ${avgEngagement > 0.6 ? '(High)' : avgEngagement > 0.4 ? '(Moderate)' : '(Low)'}
Average Mental Clarity:   ${(avgClarity * 100).toFixed(1)}% ${avgClarity > 0.6 ? '(Clear)' : avgClarity > 0.4 ? '(Moderate)' : '(Foggy)'}

================================================================================
                            INTENT PATTERNS
================================================================================

${[...new Set(analyses.map(a => a.intent.primary))].map(intent => {
  const count = analyses.filter(a => a.intent.primary === intent).length
  return `  ${intent.replace('_', ' ').toUpperCase().padEnd(20)} : ${count} occurrences`
}).join('\n')}

================================================================================
                           RECOMMENDATIONS
================================================================================

${avgStress > 0.6 ? '• HIGH STRESS ALERT: Consider implementing stress management techniques.\n  Recommended: Deep breathing exercises, regular breaks, and mindfulness practices.\n' : ''}
${avgClarity < 0.5 ? '• MENTAL CLARITY: Low clarity scores suggest mental fatigue or confusion.\n  Recommended: Get adequate rest, break complex tasks into smaller steps.\n' : ''}
${avgEngagement < 0.4 ? '• LOW ENGAGEMENT: Engagement levels could be improved.\n  Recommended: Set clear goals, find purpose in activities, seek variety.\n' : ''}
${avgStress < 0.4 && avgClarity > 0.6 && avgEngagement > 0.6 ? '• OPTIMAL STATE: Your psychological metrics indicate a healthy balance.\n  Continue maintaining current practices and routines.\n' : ''}

General Suggestions:
1. Practice regular self-reflection to maintain emotional awareness
2. Establish consistent routines to support mental clarity
3. Seek social support when facing challenging situations
4. Engage in activities that promote positive emotional states

================================================================================
                          INTERACTION HISTORY
================================================================================

${analyses.slice(-5).map((a, i) => `
[Interaction ${analyses.length - 5 + i + 1}] - ${new Date(a.timestamp).toLocaleString()}
Input Type: ${a.input.type}
Content: "${a.input.content.substring(0, 100)}${a.input.content.length > 100 ? '...' : ''}"
Emotion: ${a.dominantEmotion} | Intent: ${a.intent.primary} | Confidence: ${(a.intent.confidence * 100).toFixed(0)}%
AI Response: ${a.aiResponse.message}
`).join('\n---')}

================================================================================
                              END OF REPORT
================================================================================

This report was generated by Cognitive AI Engine.
For support or feedback, please contact support@cognitive-ai.com

DISCLAIMER: This analysis is based on AI interpretation and should not be
considered as professional psychological or medical advice. Please consult
qualified professionals for clinical assessments.
`.trim()

    return new NextResponse(report, {
      headers: {
        'Content-Type': 'text/plain',
        'Content-Disposition': `attachment; filename="cognitive-ai-report-${Date.now()}.txt"`,
      },
    })
  } catch (error) {
    console.error('Report generation error:', error)
    return NextResponse.json({ error: 'Report generation failed' }, { status: 500 })
  }
}
