import React, { useState, useRef, useEffect } from 'react'
import { Bot, Send, User, Sparkles, RefreshCw, Trash2, Cpu, CornerDownLeft } from 'lucide-react'
import { streamCopilotChat } from '../api'
import MarkdownRenderer from './MarkdownRenderer'

export default function CopilotTab({ initialPrompt = '' }) {
  const [messages, setMessages] = useState([
    {
      id: 'welcome',
      role: 'assistant',
      text: 'Hello! I am your Network Operations Center AI Copilot. I have real-time tool access to your network telemetry, latest anomalies, flow summaries, and incident records. How can I assist you?',
    },
  ])
  const [input, setInput] = useState(initialPrompt)
  const [isStreaming, setIsStreaming] = useState(false)
  const [conversationId, setConversationId] = useState('session-' + Date.now())
  const messagesEndRef = useRef(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  useEffect(() => {
    if (initialPrompt) {
      handleSend(initialPrompt)
    }
  }, [initialPrompt])

  const handleSend = (textToSend) => {
    const query = typeof textToSend === 'string' ? textToSend : input
    if (!query.trim() || isStreaming) return

    const userMsg = { id: 'u-' + Date.now(), role: 'user', text: query }
    const assistantMsgId = 'a-' + Date.now()
    const assistantMsg = { id: assistantMsgId, role: 'assistant', text: '' }

    setMessages((prev) => [...prev, userMsg, assistantMsg])
    setInput('')
    setIsStreaming(true)

    streamCopilotChat(
      query,
      conversationId,
      (chunk) => {
        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === assistantMsgId ? { ...msg, text: msg.text + chunk } : msg
          )
        )
      },
      () => {
        setIsStreaming(false)
      },
      (err) => {
        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === assistantMsgId
              ? { ...msg, text: msg.text + '\n[Error communicating with Copilot: ' + err.message + ']' }
              : msg
          )
        )
        setIsStreaming(false)
      }
    )
  }

  const promptChips = [
    'Summarize network traffic in the last 60 minutes',
    'Show all latest detected anomalies and explain them',
    'Which source IPs are triggering attacks?',
    'What do high backward packet length std values indicate?',
  ]

  const handleResetConversation = () => {
    setConversationId('session-' + Date.now())
    setMessages([
      {
        id: 'welcome',
        role: 'assistant',
        text: 'New session started. How can I help you analyze the network?',
      },
    ])
  }

  return (
    <div className="h-[calc(100vh-140px)] flex flex-col bg-[#0B0F19] rounded-2xl border border-slate-800 overflow-hidden shadow-2xl">
      <div className="px-6 py-3.5 border-b border-slate-800 flex items-center justify-between bg-[#111726]/80">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-purple-500/20 border border-purple-500/30 flex items-center justify-center text-purple-400">
            <Bot className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-white">NOC AI Copilot</h3>
              <span className="text-[10px] font-mono text-purple-400 bg-purple-500/10 px-2 py-0.5 rounded border border-purple-500/20">
                Spring AI • Groq OSS-120B
              </span>
            </div>
            <p className="text-[11px] text-slate-400">Autonomous tool-calling network intelligence assistant</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleResetConversation}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs text-slate-400 hover:text-white bg-[#161F33] border border-slate-800 hover:border-slate-700 transition-colors font-mono"
            title="Clear context & start new session"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Reset Session</span>
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-4">
        {messages.map((m) => {
          const isUser = m.role === 'user'
          return (
            <div
              key={m.id}
              className={`flex gap-3 max-w-3xl ${isUser ? 'ml-auto flex-row-reverse' : ''}`}
            >
              <div
                className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 text-xs ${
                  isUser
                    ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                    : 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                }`}
              >
                {isUser ? <User className="w-3.5 h-3.5" /> : <Bot className="w-3.5 h-3.5" />}
              </div>

              <div
                className={`p-4 rounded-2xl text-xs leading-relaxed ${
                  isUser
                    ? 'bg-cyan-500/10 border border-cyan-500/20 text-slate-100 rounded-tr-sm'
                    : 'bg-[#111726] border border-slate-800 text-slate-200 rounded-tl-sm'
                }`}
              >
                {isUser ? (
                  <div className="whitespace-pre-wrap">{m.text}</div>
                ) : (
                  <MarkdownRenderer content={m.text} />
                )}
              </div>
            </div>
          )
        })}
        {isStreaming && (
          <div className="flex items-center gap-2 text-xs text-purple-400 font-mono pl-10">
            <span className="w-2 h-2 rounded-full bg-purple-400 animate-ping" />
            <span>Copilot analyzing telemetry...</span>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="p-4 border-t border-slate-800 bg-[#111726]/60 space-y-3">
        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          {promptChips.map((chip) => (
            <button
              key={chip}
              onClick={() => handleSend(chip)}
              disabled={isStreaming}
              className="text-[11px] whitespace-nowrap bg-[#161F33] hover:bg-slate-800 text-slate-300 hover:text-cyan-300 px-3 py-1.5 rounded-xl border border-slate-800 transition-colors shrink-0 disabled:opacity-50"
            >
              {chip}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2 bg-[#0B0F19] border border-slate-800 rounded-2xl p-1.5 focus-within:border-cyan-500/50 transition-colors">
          <textarea
            rows={1}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault()
                handleSend()
              }
            }}
            placeholder="Ask AI Copilot about anomalies, routing, protocols, or flow metrics..."
            className="flex-1 bg-transparent px-3 py-1.5 text-xs text-slate-200 placeholder:text-slate-500 outline-none resize-none"
          />
          <button
            onClick={() => handleSend()}
            disabled={!input.trim() || isStreaming}
            className="p-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black font-semibold disabled:opacity-40 transition-all shrink-0"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  )
}
