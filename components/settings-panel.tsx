'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { GlassCard } from './glass-card'
import { Button } from './ui/button'
import { 
  X, 
  Settings,
  Volume2,
  Bell,
  Moon,
  Sun,
  Languages,
  Sliders,
  Zap,
  Shield,
  HelpCircle,
  ExternalLink
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface SettingsPanelProps {
  isOpen: boolean
  onClose: () => void
}

interface SettingToggleProps {
  label: string
  description: string
  icon: React.ReactNode
  enabled: boolean
  onChange: (enabled: boolean) => void
}

function SettingToggle({ label, description, icon, enabled, onChange }: SettingToggleProps) {
  return (
    <div className="flex items-center justify-between p-4 rounded-lg bg-muted/30 border border-border/50">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
          {icon}
        </div>
        <div>
          <p className="text-sm font-medium text-foreground">{label}</p>
          <p className="text-xs text-muted-foreground">{description}</p>
        </div>
      </div>
      <button
        onClick={() => onChange(!enabled)}
        className={cn(
          'relative w-12 h-6 rounded-full transition-colors',
          enabled ? 'bg-primary' : 'bg-muted'
        )}
      >
        <motion.div
          className="absolute top-1 w-4 h-4 rounded-full bg-white shadow-sm"
          animate={{ left: enabled ? 28 : 4 }}
          transition={{ type: 'spring', stiffness: 500, damping: 30 }}
        />
      </button>
    </div>
  )
}

interface SettingSliderProps {
  label: string
  description: string
  icon: React.ReactNode
  value: number
  onChange: (value: number) => void
  min?: number
  max?: number
}

function SettingSlider({ label, description, icon, value, onChange, min = 0, max = 100 }: SettingSliderProps) {
  return (
    <div className="p-4 rounded-lg bg-muted/30 border border-border/50 space-y-3">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
          {icon}
        </div>
        <div className="flex-1">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-foreground">{label}</p>
            <span className="text-xs text-primary font-medium">{value}%</span>
          </div>
          <p className="text-xs text-muted-foreground">{description}</p>
        </div>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full h-2 rounded-full bg-muted appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-primary [&::-webkit-slider-thumb]:cursor-pointer"
      />
    </div>
  )
}

export function SettingsPanel({ isOpen, onClose }: SettingsPanelProps) {
  const [settings, setSettings] = useState({
    soundEnabled: true,
    notificationsEnabled: true,
    darkMode: true,
    autoAnalysis: false,
    enhancedPrivacy: true,
    speechVolume: 75,
    analysisSpeed: 50,
    language: 'en'
  })

  const updateSetting = <K extends keyof typeof settings>(key: K, value: typeof settings[K]) => {
    setSettings(prev => ({ ...prev, [key]: value }))
  }

  const languages = [
    { code: 'en', label: 'English' },
    { code: 'es', label: 'Spanish' },
    { code: 'fr', label: 'French' },
    { code: 'de', label: 'German' },
    { code: 'zh', label: 'Chinese' },
    { code: 'ja', label: 'Japanese' }
  ]

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
            onClick={onClose}
          />

          {/* Panel */}
          <motion.div
            initial={{ opacity: 0, x: 300 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 300 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed right-0 top-0 h-full w-full max-w-md z-50 overflow-hidden"
          >
            <GlassCard className="h-full rounded-none rounded-l-2xl p-0 overflow-hidden" animate={false}>
              {/* Header */}
              <div className="flex items-center justify-between p-6 border-b border-border/50">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center">
                    <Settings className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold text-foreground">Settings</h2>
                    <p className="text-xs text-muted-foreground">Customize your experience</p>
                  </div>
                </div>
                <Button variant="ghost" size="icon" onClick={onClose}>
                  <X className="w-5 h-5" />
                </Button>
              </div>

              {/* Content */}
              <div className="p-6 space-y-6 overflow-y-auto h-[calc(100%-200px)]">
                {/* Interface Section */}
                <div>
                  <h3 className="text-sm font-medium text-foreground mb-3 flex items-center gap-2">
                    <Sliders className="w-4 h-4 text-primary" />
                    Interface
                  </h3>
                  <div className="space-y-3">
                    <SettingToggle
                      label="Dark Mode"
                      description="Use dark theme for better viewing"
                      icon={settings.darkMode ? <Moon className="w-4 h-4 text-primary" /> : <Sun className="w-4 h-4 text-primary" />}
                      enabled={settings.darkMode}
                      onChange={(v) => updateSetting('darkMode', v)}
                    />
                    <SettingToggle
                      label="Sound Effects"
                      description="Play sounds for interactions"
                      icon={<Volume2 className="w-4 h-4 text-primary" />}
                      enabled={settings.soundEnabled}
                      onChange={(v) => updateSetting('soundEnabled', v)}
                    />
                    <SettingToggle
                      label="Notifications"
                      description="Show analysis notifications"
                      icon={<Bell className="w-4 h-4 text-primary" />}
                      enabled={settings.notificationsEnabled}
                      onChange={(v) => updateSetting('notificationsEnabled', v)}
                    />
                  </div>
                </div>

                {/* Analysis Section */}
                <div>
                  <h3 className="text-sm font-medium text-foreground mb-3 flex items-center gap-2">
                    <Zap className="w-4 h-4 text-primary" />
                    Analysis
                  </h3>
                  <div className="space-y-3">
                    <SettingToggle
                      label="Auto Analysis"
                      description="Automatically analyze input while typing"
                      icon={<Zap className="w-4 h-4 text-primary" />}
                      enabled={settings.autoAnalysis}
                      onChange={(v) => updateSetting('autoAnalysis', v)}
                    />
                    <SettingSlider
                      label="Speech Volume"
                      description="Volume for text-to-speech responses"
                      icon={<Volume2 className="w-4 h-4 text-primary" />}
                      value={settings.speechVolume}
                      onChange={(v) => updateSetting('speechVolume', v)}
                    />
                    <SettingSlider
                      label="Analysis Detail"
                      description="Balance between speed and depth"
                      icon={<Sliders className="w-4 h-4 text-primary" />}
                      value={settings.analysisSpeed}
                      onChange={(v) => updateSetting('analysisSpeed', v)}
                    />
                  </div>
                </div>

                {/* Language Section */}
                <div>
                  <h3 className="text-sm font-medium text-foreground mb-3 flex items-center gap-2">
                    <Languages className="w-4 h-4 text-primary" />
                    Language
                  </h3>
                  <div className="grid grid-cols-3 gap-2">
                    {languages.map((lang) => (
                      <button
                        key={lang.code}
                        onClick={() => updateSetting('language', lang.code)}
                        className={cn(
                          'px-3 py-2 rounded-lg text-sm transition-colors',
                          settings.language === lang.code
                            ? 'bg-primary text-primary-foreground'
                            : 'bg-muted/50 text-muted-foreground hover:bg-muted hover:text-foreground'
                        )}
                      >
                        {lang.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Privacy Section */}
                <div>
                  <h3 className="text-sm font-medium text-foreground mb-3 flex items-center gap-2">
                    <Shield className="w-4 h-4 text-primary" />
                    Privacy
                  </h3>
                  <div className="space-y-3">
                    <SettingToggle
                      label="Enhanced Privacy"
                      description="Don't store analysis history"
                      icon={<Shield className="w-4 h-4 text-primary" />}
                      enabled={settings.enhancedPrivacy}
                      onChange={(v) => updateSetting('enhancedPrivacy', v)}
                    />
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="absolute bottom-0 left-0 right-0 p-6 border-t border-border/50 bg-card">
                <div className="flex items-center justify-between">
                  <button className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
                    <HelpCircle className="w-4 h-4" />
                    Help & FAQ
                  </button>
                  <button className="flex items-center gap-2 text-sm text-primary hover:text-primary/80 transition-colors">
                    Documentation
                    <ExternalLink className="w-3 h-3" />
                  </button>
                </div>
              </div>
            </GlassCard>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
