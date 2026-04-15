'use client'

import { motion } from 'framer-motion'
import { GlassCard } from './glass-card'
import { Brain, Sparkles, Cpu, Network } from 'lucide-react'

const steps = [
  { icon: Cpu, label: 'Processing input...', delay: 0 },
  { icon: Brain, label: 'Analyzing emotions...', delay: 0.5 },
  { icon: Network, label: 'Inferring intent...', delay: 1 },
  { icon: Sparkles, label: 'Generating response...', delay: 1.5 },
]

export function ThinkingAnimation() {
  return (
    <GlassCard className="p-8" animate={false}>
      <div className="flex flex-col items-center justify-center space-y-8">
        {/* Pulsing brain animation */}
        <div className="relative">
          <motion.div
            className="w-24 h-24 rounded-full bg-primary/20 flex items-center justify-center"
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <motion.div
              className="w-16 h-16 rounded-full bg-primary/30 flex items-center justify-center"
              animate={{ scale: [1, 1.15, 1] }}
              transition={{ duration: 2, repeat: Infinity, delay: 0.2 }}
            >
              <Brain className="w-8 h-8 text-primary" />
            </motion.div>
          </motion.div>

          {/* Orbiting particles */}
          {[0, 1, 2, 3].map((i) => (
            <motion.div
              key={i}
              className="absolute w-2 h-2 rounded-full bg-primary"
              style={{
                top: '50%',
                left: '50%',
              }}
              animate={{
                x: [0, Math.cos((i * Math.PI) / 2) * 50, 0],
                y: [0, Math.sin((i * Math.PI) / 2) * 50, 0],
                opacity: [0.5, 1, 0.5],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                delay: i * 0.25,
              }}
            />
          ))}
        </div>

        {/* Processing steps */}
        <div className="space-y-3 w-full max-w-xs">
          {steps.map((step, index) => {
            const Icon = step.icon
            return (
              <motion.div
                key={step.label}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: step.delay }}
                className="flex items-center gap-3 text-sm"
              >
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 2, repeat: Infinity, ease: 'linear', delay: step.delay }}
                >
                  <Icon className="w-4 h-4 text-primary" />
                </motion.div>
                <span className="text-muted-foreground">{step.label}</span>
                <motion.div
                  className="ml-auto flex gap-1"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: step.delay + 0.3 }}
                >
                  {[0, 1, 2].map((dot) => (
                    <motion.span
                      key={dot}
                      className="w-1.5 h-1.5 rounded-full bg-primary"
                      animate={{ opacity: [0.3, 1, 0.3] }}
                      transition={{
                        duration: 1,
                        repeat: Infinity,
                        delay: dot * 0.2,
                      }}
                    />
                  ))}
                </motion.div>
              </motion.div>
            )
          })}
        </div>

        <p className="text-sm text-muted-foreground animate-pulse">
          AI Engine is thinking...
        </p>
      </div>
    </GlassCard>
  )
}
