'use client'
// app/(dashboard)/assistant/page.jsx
import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui'
import { Send, Sparkles, Bot, User, Loader2, RotateCcw } from 'lucide-react'
import { cn } from '@/lib/utils'
import toast from 'react-hot-toast'

const QUICK_PROMPTS = [
  'Create a study plan for my exams',
  'Which subject should I focus on first?',
  'Give me tips for studying hard topics',
  'How should I manage my time today?',
]

// Render bold (**text**) and line breaks safely — no eval, no dangerouslySet
function MessageText({ text }) {
  const parts = text.split(/(\*\*[^*]+\*\*|\n)/g)
  return (
    <span>
      {parts.map((part, i) => {
        if (part.startsWith('**') && part.endsWith('**')) {
          return <strong key={i}>{part.slice(2, -2)}</strong>
        }
        if (part === '\n') return <br key={i} />
        return <span key={i}>{part}</span>
      })}
    </span>
  )
}

export default function AssistantPage() {
  const [messages, setMessages]   = useState([])
  const [input, setInput]         = useState('')
  const [loading, setLoading]     = useState(false)
  const bottomRef                 = useRef(null)
  const inputRef                  = useRef(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const sendMessage = async (overrideText) => {
    const text = (overrideText || input).trim()
    if (!text || loading) return

    const userMsg = { role: 'user', content: text }
    setMessages(prev => [...prev, userMsg])
    setInput('')
    setLoading(true)

    try {
      // Build the full history to send (including the new user message)
      const history = [...messages, userMsg].map(m => ({
        role:    m.role,
        content: m.content,
      }))

      const res  = await fetch('/api/assistant', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ messages: history }),
      })

      const data = await res.json()

      if (!res.ok) {
        // Show the actual server error — not a hardcoded OpenAI message
        throw new Error(data.error || `Server error ${res.status}`)
      }

      if (!data.message) {
        throw new Error('No response received from AI.')
      }

      setMessages(prev => [...prev, { role: 'assistant', content: data.message }])
    } catch (err) {
      console.error('[Assistant page] Error:', err.message)
      // Show the real error in the chat bubble AND as a toast
      toast.error(err.message)
      setMessages(prev => [
        ...prev,
        { role: 'assistant', content: `⚠️ ${err.message}`, isError: true },
      ])
    } finally {
      setLoading(false)
      setTimeout(() => inputRef.current?.focus(), 100)
    }
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  return (
    <div className="max-w-3xl mx-auto h-[calc(100vh-8rem)] flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between mb-4 shrink-0">
        <div>
          <h2 className="text-xl font-bold font-display text-text-primary flex items-center gap-2">
            <Bot className="w-5 h-5 text-accent" /> AI Study Assistant
          </h2>
          <p className="text-text-muted text-sm">Ask anything about your studies or schedule</p>
        </div>
        {messages.length > 0 && (
          <Button variant="ghost" size="sm" onClick={() => setMessages([])}>
            <RotateCcw className="w-3.5 h-3.5" /> Clear
          </Button>
        )}
      </div>

      {/* Chat area */}
      <div className="flex-1 overflow-y-auto space-y-4 pr-1">
        {messages.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center justify-center h-full text-center"
          >
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary/20 to-accent/20 border border-primary/20 flex items-center justify-center mb-4">
              <Sparkles className="w-8 h-8 text-accent" />
            </div>
            <h3 className="font-semibold font-display text-text-primary text-lg mb-2">
              StudyFlow AI
            </h3>
            <p className="text-text-muted text-sm max-w-xs mb-8">
              Your AI study coach. Ask me to plan your schedule, give study tips, or help prioritise your tasks.
            </p>
            <div className="grid grid-cols-2 gap-2 w-full max-w-sm">
              {QUICK_PROMPTS.map(prompt => (
                <button
                  key={prompt}
                  onClick={() => sendMessage(prompt)}
                  className="text-left p-3 bg-surface border border-border rounded-xl text-xs text-text-secondary hover:text-text-primary hover:border-border-bright hover:bg-surface-2 transition-all duration-150"
                >
                  {prompt}
                </button>
              ))}
            </div>
          </motion.div>
        ) : (
          <AnimatePresence initial={false}>
            {messages.map((msg, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className={cn('flex gap-3', msg.role === 'user' ? 'flex-row-reverse' : 'flex-row')}
              >
                {/* Avatar */}
                <div className={cn(
                  'w-8 h-8 rounded-lg flex items-center justify-center shrink-0 mt-0.5',
                  msg.role === 'user'
                    ? 'bg-primary/20 border border-primary/30'
                    : 'bg-accent/10 border border-accent/20'
                )}>
                  {msg.role === 'user'
                    ? <User className="w-4 h-4 text-primary" />
                    : <Bot  className="w-4 h-4 text-accent"  />
                  }
                </div>

                {/* Bubble */}
                <div className={cn(
                  'max-w-[80%] rounded-2xl px-4 py-3 text-sm leading-relaxed',
                  msg.role === 'user'
                    ? 'chat-user rounded-tr-sm'
                    : 'chat-ai rounded-tl-sm',
                  msg.isError && 'border-danger/40 text-danger/90'
                )}>
                  <MessageText text={msg.content} />
                </div>
              </motion.div>
            ))}

            {loading && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex gap-3"
              >
                <div className="w-8 h-8 rounded-lg bg-accent/10 border border-accent/20 flex items-center justify-center shrink-0">
                  <Bot className="w-4 h-4 text-accent" />
                </div>
                <div className="chat-ai rounded-2xl rounded-tl-sm px-4 py-3 flex items-center gap-2">
                  <Loader2 className="w-4 h-4 text-accent animate-spin" />
                  <span className="text-xs text-text-muted">Thinking...</span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="shrink-0 mt-4 bg-surface border border-border rounded-2xl flex items-end gap-3 p-3 focus-within:border-primary transition-colors duration-200">
        <textarea
          ref={inputRef}
          rows={1}
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Ask me anything about your studies..."
          className="flex-1 bg-transparent text-sm text-text-primary placeholder:text-text-muted resize-none focus:outline-none max-h-32 py-1"
          style={{ minHeight: '24px' }}
        />
        <Button
          onClick={() => sendMessage()}
          disabled={!input.trim() || loading}
          className="shrink-0"
          size="sm"
        >
          <Send className="w-4 h-4" />
        </Button>
      </div>
      <p className="text-center text-xs text-text-muted mt-2">
        Press Enter to send · Shift+Enter for new line · Powered by Gemini
      </p>
    </div>
  )
}