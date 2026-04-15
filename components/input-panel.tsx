'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { GlassCard } from './glass-card'
import { Button } from './ui/button'
import { Textarea } from './ui/textarea'
import { 
  MessageSquare, 
  Mic, 
  Video, 
  Send, 
  Loader2, 
  MicOff,
  VideoOff,
  Upload,
  FileText,
  X,
  AudioWaveform,
  Camera,
  Circle,
  Square
} from 'lucide-react'
import { cn } from '@/lib/utils'

type InputMode = 'text' | 'voice' | 'video'

interface InputPanelProps {
  onSubmit: (input: string, mode: InputMode) => void
  isAnalyzing: boolean
}

export function InputPanel({ onSubmit, isAnalyzing }: InputPanelProps) {
  const [mode, setMode] = useState<InputMode>('text')
  const [text, setText] = useState('')
  const [isRecording, setIsRecording] = useState(false)
  const [recordingTime, setRecordingTime] = useState(0)
  const [isVideoActive, setIsVideoActive] = useState(false)
  const [videoRecording, setVideoRecording] = useState(false)
  const [audioLevel, setAudioLevel] = useState(0)
  const [uploadedFile, setUploadedFile] = useState<File | null>(null)
  const [faceDetected, setFaceDetected] = useState(false)
  const [emotionHint, setEmotionHint] = useState<string>('neutral')
  
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const audioContextRef = useRef<AudioContext | null>(null)
  const analyserRef = useRef<AnalyserNode | null>(null)
  const animationRef = useRef<number>(0)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const chunksRef = useRef<Blob[]>([])

  // Recording timer
  useEffect(() => {
    let interval: NodeJS.Timeout
    if (isRecording || videoRecording) {
      interval = setInterval(() => {
        setRecordingTime((prev) => prev + 1)
      }, 1000)
    }
    return () => clearInterval(interval)
  }, [isRecording, videoRecording])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop())
      }
      if (audioContextRef.current) {
        audioContextRef.current.close()
      }
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
    }
  }, [])

  // Simulate face detection with random emotion hints
  useEffect(() => {
    if (isVideoActive) {
      const interval = setInterval(() => {
        setFaceDetected(Math.random() > 0.1) // 90% detection rate
        const emotions = ['happy', 'neutral', 'thoughtful', 'focused', 'concerned']
        setEmotionHint(emotions[Math.floor(Math.random() * emotions.length)])
      }, 2000)
      return () => clearInterval(interval)
    }
  }, [isVideoActive])

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const startAudioVisualization = useCallback((stream: MediaStream) => {
    audioContextRef.current = new AudioContext()
    analyserRef.current = audioContextRef.current.createAnalyser()
    const source = audioContextRef.current.createMediaStreamSource(stream)
    source.connect(analyserRef.current)
    analyserRef.current.fftSize = 256

    const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount)

    const updateLevel = () => {
      if (analyserRef.current) {
        analyserRef.current.getByteFrequencyData(dataArray)
        const average = dataArray.reduce((a, b) => a + b) / dataArray.length
        setAudioLevel(average / 255)
      }
      animationRef.current = requestAnimationFrame(updateLevel)
    }
    updateLevel()
  }, [])

  const handleVoiceToggle = async () => {
    if (isRecording) {
      // Stop recording
      if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
        mediaRecorderRef.current.stop()
      }
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop())
      }
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
      setIsRecording(false)
      setAudioLevel(0)
      
      // Simulate voice transcription with varied responses
      const transcriptions = [
        "I have been feeling quite stressed lately and am not sure what to do about my situation at work.",
        "I'm really excited about this new project, but also a bit nervous about meeting the deadline.",
        "Sometimes I wonder if I'm making the right decisions in life, you know?",
        "I need help understanding how to better communicate with my team.",
        "I've been thinking a lot about my goals and where I want to be in five years."
      ]
      setTimeout(() => {
        setText(transcriptions[Math.floor(Math.random() * transcriptions.length)])
        setRecordingTime(0)
      }, 500)
    } else {
      // Start recording
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
        streamRef.current = stream
        
        mediaRecorderRef.current = new MediaRecorder(stream)
        chunksRef.current = []
        
        mediaRecorderRef.current.ondataavailable = (e) => {
          if (e.data.size > 0) {
            chunksRef.current.push(e.data)
          }
        }
        
        mediaRecorderRef.current.start()
        startAudioVisualization(stream)
        setIsRecording(true)
      } catch (error) {
        console.log('[v0] Microphone access denied or not available')
        // Fallback: simulate recording
        setIsRecording(true)
        const simulateLevel = () => {
          setAudioLevel(Math.random() * 0.5 + 0.2)
          if (isRecording) {
            animationRef.current = requestAnimationFrame(simulateLevel)
          }
        }
        simulateLevel()
      }
    }
  }

  const handleVideoToggle = async () => {
    if (isVideoActive) {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop())
      }
      setIsVideoActive(false)
      setVideoRecording(false)
      setFaceDetected(false)
    } else {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ 
          video: { facingMode: 'user', width: 640, height: 480 },
          audio: true 
        })
        streamRef.current = stream
        if (videoRef.current) {
          videoRef.current.srcObject = stream
        }
        setIsVideoActive(true)
        setTimeout(() => setFaceDetected(true), 1000)
      } catch (error) {
        console.log('[v0] Camera access denied or not available')
        // Show placeholder state
        setIsVideoActive(true)
        setTimeout(() => setFaceDetected(true), 1000)
      }
    }
  }

  const handleVideoRecord = () => {
    if (videoRecording) {
      setVideoRecording(false)
      // Simulate video analysis result
      const analyses = [
        "Based on video analysis: User appears engaged but shows signs of underlying stress. Micro-expressions suggest thoughtfulness mixed with concern.",
        "Video analysis indicates: Positive emotional state with genuine engagement. Eye contact and facial expressions suggest confidence.",
        "Detected from video: Mixed emotional signals - curiosity combined with uncertainty. Body language suggests seeking guidance."
      ]
      setTimeout(() => {
        setText(analyses[Math.floor(Math.random() * analyses.length)])
        setRecordingTime(0)
      }, 500)
    } else {
      setVideoRecording(true)
      setRecordingTime(0)
    }
  }

  const captureSnapshot = () => {
    if (videoRef.current && canvasRef.current) {
      const ctx = canvasRef.current.getContext('2d')
      if (ctx) {
        canvasRef.current.width = videoRef.current.videoWidth || 640
        canvasRef.current.height = videoRef.current.videoHeight || 480
        ctx.drawImage(videoRef.current, 0, 0)
        setText(`Snapshot captured at ${new Date().toLocaleTimeString()}. Analyzing facial expression: ${emotionHint} detected.`)
      }
    }
  }

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setUploadedFile(file)
      
      // Read text files
      if (file.type === 'text/plain' || file.name.endsWith('.txt')) {
        const reader = new FileReader()
        reader.onload = (e) => {
          const content = e.target?.result as string
          setText(content.slice(0, 2000)) // Limit to 2000 chars
        }
        reader.readAsText(file)
      } else {
        setText(`File uploaded: ${file.name} (${(file.size / 1024).toFixed(1)} KB). Ready for analysis.`)
      }
    }
  }

  const handleSubmit = () => {
    if (text.trim() || mode !== 'text') {
      onSubmit(text || 'Voice/Video input captured', mode)
      setText('')
      setIsRecording(false)
      setVideoRecording(false)
      setRecordingTime(0)
      setUploadedFile(null)
    }
  }

  const clearUpload = () => {
    setUploadedFile(null)
    setText('')
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const modes: { id: InputMode; icon: React.ReactNode; label: string }[] = [
    { id: 'text', icon: <MessageSquare className="w-4 h-4" />, label: 'Text' },
    { id: 'voice', icon: <Mic className="w-4 h-4" />, label: 'Voice' },
    { id: 'video', icon: <Video className="w-4 h-4" />, label: 'Video' },
  ]

  return (
    <GlassCard className="p-6" delay={0}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-foreground">Input Analysis</h3>
        
        {/* Mode Toggle */}
        <div className="flex items-center gap-1 p-1 rounded-lg bg-muted/50">
          {modes.map((m) => (
            <button
              key={m.id}
              onClick={() => {
                setMode(m.id)
                setText('')
                setUploadedFile(null)
              }}
              className={cn(
                'flex items-center gap-2 px-3 py-1.5 rounded-md text-sm transition-all',
                mode === m.id
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              {m.icon}
              <span className="hidden sm:inline">{m.label}</span>
            </button>
          ))}
        </div>
      </div>

      <AnimatePresence mode="wait">
        {mode === 'text' && (
          <motion.div
            key="text"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-4"
          >
            <Textarea
              placeholder="Type your thoughts, feelings, or questions here. Express yourself freely - I'll analyze your emotions, detect your intent, and provide personalized guidance..."
              value={text}
              onChange={(e) => setText(e.target.value)}
              className="min-h-32 bg-input border-border/50 resize-none text-foreground placeholder:text-muted-foreground"
              disabled={isAnalyzing}
            />
            
            {/* File upload section */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".txt,.md,.json"
                  onChange={handleFileUpload}
                  className="hidden"
                />
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="gap-2"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isAnalyzing}
                >
                  <Upload className="w-4 h-4" />
                  Upload File
                </Button>
                
                {uploadedFile && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="flex items-center gap-2 px-2 py-1 rounded-md bg-primary/10 border border-primary/20"
                  >
                    <FileText className="w-3 h-3 text-primary" />
                    <span className="text-xs text-foreground truncate max-w-24">
                      {uploadedFile.name}
                    </span>
                    <button
                      onClick={clearUpload}
                      className="text-muted-foreground hover:text-foreground"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </motion.div>
                )}
              </div>
              
              <p className="text-xs text-muted-foreground">
                {text.length} / 2000 characters
              </p>
            </div>

            {/* Quick prompts */}
            <div className="flex flex-wrap gap-2">
              {['How are you feeling?', 'Need advice about...', 'I am stressed because...'].map((prompt) => (
                <button
                  key={prompt}
                  onClick={() => setText(prompt)}
                  className="text-xs px-3 py-1.5 rounded-full bg-muted/50 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
                >
                  {prompt}
                </button>
              ))}
            </div>
          </motion.div>
        )}

        {mode === 'voice' && (
          <motion.div
            key="voice"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="flex flex-col items-center py-6 space-y-6"
          >
            {/* Audio visualizer */}
            <div className="relative">
              <motion.button
                onClick={handleVoiceToggle}
                disabled={isAnalyzing}
                className={cn(
                  'relative w-28 h-28 rounded-full flex items-center justify-center transition-colors z-10',
                  isRecording
                    ? 'bg-red-500/20 border-2 border-red-500'
                    : 'bg-primary/20 border-2 border-primary hover:bg-primary/30'
                )}
                animate={isRecording ? { scale: [1, 1.02, 1] } : {}}
                transition={{ repeat: Infinity, duration: 1.5 }}
              >
                {isRecording ? (
                  <MicOff className="w-12 h-12 text-red-500" />
                ) : (
                  <Mic className="w-12 h-12 text-primary" />
                )}
              </motion.button>
              
              {/* Animated rings */}
              {isRecording && (
                <>
                  <motion.div
                    className="absolute inset-0 rounded-full border-2 border-red-500/30"
                    animate={{ scale: [1, 1.3 + audioLevel * 0.5], opacity: [0.5, 0] }}
                    transition={{ duration: 1, repeat: Infinity }}
                  />
                  <motion.div
                    className="absolute inset-0 rounded-full border-2 border-red-500/20"
                    animate={{ scale: [1, 1.5 + audioLevel * 0.5], opacity: [0.3, 0] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                  />
                </>
              )}
            </div>
            
            {/* Audio level bars */}
            {isRecording && (
              <div className="flex items-end gap-1 h-12">
                {Array.from({ length: 20 }).map((_, i) => (
                  <motion.div
                    key={i}
                    className="w-1.5 bg-primary rounded-full"
                    animate={{
                      height: `${Math.max(4, (Math.sin(Date.now() / 100 + i) + 1) * 20 * audioLevel + 4)}px`
                    }}
                    transition={{ duration: 0.1 }}
                  />
                ))}
              </div>
            )}
            
            <div className="text-center">
              <p className="text-lg font-medium text-foreground">
                {isRecording ? formatTime(recordingTime) : 'Click to start recording'}
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                {isRecording ? 'Listening... Click again to stop' : 'Voice emotion analysis enabled'}
              </p>
            </div>

            {text && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full p-4 rounded-lg bg-muted/50 border border-border/50"
              >
                <div className="flex items-center gap-2 mb-2">
                  <AudioWaveform className="w-4 h-4 text-primary" />
                  <p className="text-sm text-muted-foreground">Transcription:</p>
                </div>
                <p className="text-foreground">{text}</p>
              </motion.div>
            )}
          </motion.div>
        )}

        {mode === 'video' && (
          <motion.div
            key="video"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-4"
          >
            <div className="relative aspect-video rounded-lg overflow-hidden bg-muted border border-border/50">
              {isVideoActive ? (
                <>
                  <video
                    ref={videoRef}
                    autoPlay
                    muted
                    playsInline
                    className="w-full h-full object-cover"
                  />
                  <canvas ref={canvasRef} className="hidden" />
                  
                  {/* Recording indicator */}
                  {videoRecording && (
                    <div className="absolute top-3 right-3 flex items-center gap-2 px-2 py-1 rounded-md bg-red-500/90 backdrop-blur-sm">
                      <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
                      <span className="text-xs text-white font-medium">REC {formatTime(recordingTime)}</span>
                    </div>
                  )}
                </>
              ) : (
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-3">
                    <Video className="w-8 h-8 text-muted-foreground" />
                  </div>
                  <p className="text-sm text-muted-foreground">Camera not active</p>
                  <p className="text-xs text-muted-foreground mt-1">Click below to enable</p>
                </div>
              )}
              
              {/* Face detection overlay */}
              {isVideoActive && (
                <div className="absolute top-3 left-3 flex flex-col gap-2">
                  <div className={cn(
                    "flex items-center gap-2 px-2 py-1 rounded-md backdrop-blur-sm",
                    faceDetected ? "bg-green-500/20 border border-green-500/30" : "bg-yellow-500/20 border border-yellow-500/30"
                  )}>
                    <span className={cn(
                      "w-2 h-2 rounded-full",
                      faceDetected ? "bg-green-400 animate-pulse" : "bg-yellow-400"
                    )} />
                    <span className="text-xs text-white">
                      {faceDetected ? 'Face detected' : 'Searching...'}
                    </span>
                  </div>
                  
                  {faceDetected && (
                    <motion.div
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="flex items-center gap-2 px-2 py-1 rounded-md bg-primary/20 border border-primary/30 backdrop-blur-sm"
                    >
                      <span className="text-xs text-white">Expression: {emotionHint}</span>
                    </motion.div>
                  )}
                </div>
              )}
            </div>

            {/* Video controls */}
            <div className="flex gap-2">
              <button
                onClick={handleVideoToggle}
                disabled={isAnalyzing}
                className={cn(
                  'flex-1 py-3 rounded-lg flex items-center justify-center gap-2 transition-colors',
                  isVideoActive
                    ? 'bg-red-500/20 border border-red-500/50 text-red-400 hover:bg-red-500/30'
                    : 'bg-primary/20 border border-primary/50 text-primary hover:bg-primary/30'
                )}
              >
                {isVideoActive ? (
                  <>
                    <VideoOff className="w-5 h-5" />
                    Stop Camera
                  </>
                ) : (
                  <>
                    <Video className="w-5 h-5" />
                    Start Camera
                  </>
                )}
              </button>
              
              {isVideoActive && (
                <>
                  <button
                    onClick={handleVideoRecord}
                    disabled={isAnalyzing}
                    className={cn(
                      'px-4 py-3 rounded-lg flex items-center justify-center gap-2 transition-colors',
                      videoRecording
                        ? 'bg-red-500 text-white hover:bg-red-600'
                        : 'bg-muted border border-border/50 text-foreground hover:bg-muted/80'
                    )}
                  >
                    {videoRecording ? (
                      <Square className="w-4 h-4" />
                    ) : (
                      <Circle className="w-4 h-4 fill-current" />
                    )}
                  </button>
                  
                  <button
                    onClick={captureSnapshot}
                    disabled={isAnalyzing || videoRecording}
                    className="px-4 py-3 rounded-lg flex items-center justify-center gap-2 bg-muted border border-border/50 text-foreground hover:bg-muted/80 transition-colors disabled:opacity-50"
                  >
                    <Camera className="w-4 h-4" />
                  </button>
                </>
              )}
            </div>

            {text && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-4 rounded-lg bg-muted/50 border border-border/50"
              >
                <p className="text-sm text-muted-foreground mb-1">Video Analysis:</p>
                <p className="text-foreground text-sm">{text}</p>
              </motion.div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Submit Button */}
      <Button
        onClick={handleSubmit}
        disabled={isAnalyzing || (!text.trim() && mode === 'text')}
        className="w-full mt-6 gap-2 bg-primary hover:bg-primary/90 text-primary-foreground"
        size="lg"
      >
        {isAnalyzing ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            Analyzing...
          </>
        ) : (
          <>
            <Send className="w-4 h-4" />
            Analyze {mode === 'voice' ? 'Voice' : mode === 'video' ? 'Video' : 'Text'}
          </>
        )}
      </Button>
    </GlassCard>
  )
}
