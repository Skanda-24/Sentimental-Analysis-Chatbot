'use client'

import { GlassCard } from './glass-card'
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, Area, AreaChart } from 'recharts'
import type { AnalysisResult } from '@/lib/types'
import { Clock } from 'lucide-react'

interface MoodTimelineProps {
  history: AnalysisResult[]
}

const emotionToValue: Record<string, number> = {
  happy: 5,
  neutral: 3,
  sad: 2,
  fear: 1,
  angry: 0,
}

export function MoodTimeline({ history }: MoodTimelineProps) {
  const data = history.map((item, index) => ({
    name: `#${index + 1}`,
    mood: emotionToValue[item.dominantEmotion] || 3,
    stress: Math.round(item.psychologicalState.stressLevel * 5),
    emotion: item.dominantEmotion,
    time: new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
  }))

  if (history.length === 0) {
    return (
      <GlassCard className="p-6" delay={0.5}>
        <div className="flex items-center gap-2 mb-4">
          <Clock className="w-5 h-5 text-primary" />
          <h3 className="text-lg font-semibold text-foreground">Mood Timeline</h3>
        </div>
        <div className="h-48 flex items-center justify-center text-muted-foreground">
          <p className="text-sm">No interaction history yet. Start analyzing to see trends.</p>
        </div>
      </GlassCard>
    )
  }

  return (
    <GlassCard className="p-6" delay={0.5}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Clock className="w-5 h-5 text-primary" />
          <h3 className="text-lg font-semibold text-foreground">Mood Timeline</h3>
        </div>
        <div className="flex items-center gap-4 text-xs text-muted-foreground">
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-0.5 rounded-full bg-primary" />
            Mood
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-0.5 rounded-full bg-red-400" />
            Stress
          </div>
        </div>
      </div>

      <div className="h-48">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data}>
            <defs>
              <linearGradient id="moodGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="stressGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#f87171" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#f87171" stopOpacity={0} />
              </linearGradient>
            </defs>
            <XAxis 
              dataKey="time" 
              stroke="hsl(var(--muted-foreground))" 
              fontSize={10}
              tickLine={false}
              axisLine={false}
            />
            <YAxis 
              domain={[0, 5]} 
              stroke="hsl(var(--muted-foreground))" 
              fontSize={10}
              tickLine={false}
              axisLine={false}
              ticks={[0, 1, 2, 3, 4, 5]}
              tickFormatter={(value) => {
                const labels = ['Angry', 'Fear', 'Sad', 'Neutral', '', 'Happy']
                return labels[value] || ''
              }}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: 'hsl(var(--card))',
                border: '1px solid hsl(var(--border))',
                borderRadius: '8px',
                padding: '8px 12px',
              }}
              labelStyle={{ color: 'hsl(var(--foreground))' }}
              itemStyle={{ color: 'hsl(var(--muted-foreground))' }}
            />
            <Area
              type="monotone"
              dataKey="mood"
              stroke="hsl(var(--primary))"
              strokeWidth={2}
              fill="url(#moodGradient)"
            />
            <Line
              type="monotone"
              dataKey="stress"
              stroke="#f87171"
              strokeWidth={2}
              dot={{ fill: '#f87171', strokeWidth: 0, r: 3 }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </GlassCard>
  )
}
