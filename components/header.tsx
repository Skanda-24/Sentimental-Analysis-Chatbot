'use client'

import { motion } from 'framer-motion'
import { Brain, Settings, Download, History, Sparkles } from 'lucide-react'
import { Button } from './ui/button'

interface HeaderProps {
  onDownloadReport: () => void
  onToggleHistory: () => void
  onToggleSettings: () => void
  historyCount: number
}

export function Header({ onDownloadReport, onToggleHistory, onToggleSettings, historyCount }: HeaderProps) {
  return (
    <header className="sticky top-0 z-50 border-b border-border/50 bg-background/80 backdrop-blur-xl">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-3"
          >
            <div className="relative">
              <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center border border-primary/30">
                <Brain className="w-5 h-5 text-primary" />
              </div>
              <motion.div
                className="absolute -top-0.5 -right-0.5 w-3 h-3 rounded-full bg-accent"
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
              />
            </div>
            <div>
              <h1 className="text-lg font-semibold text-foreground flex items-center gap-1.5">
                Cognitive AI Engine
                <Sparkles className="w-4 h-4 text-primary" />
              </h1>
              <p className="text-xs text-muted-foreground">Human Intent & Emotion Analyzer</p>
            </div>
          </motion.div>

          {/* Actions */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-2"
          >
            <Button
              variant="ghost"
              size="sm"
              className="gap-2 hidden sm:flex"
              onClick={onToggleHistory}
            >
              <History className="w-4 h-4" />
              History
              {historyCount > 0 && (
                <span className="px-1.5 py-0.5 text-xs rounded-full bg-primary/20 text-primary">
                  {historyCount}
                </span>
              )}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="gap-2"
              onClick={onDownloadReport}
            >
              <Download className="w-4 h-4" />
              <span className="hidden sm:inline">Report</span>
            </Button>
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={onToggleSettings}>
              <Settings className="w-4 h-4" />
            </Button>
          </motion.div>
        </div>
      </div>
    </header>
  )
}
