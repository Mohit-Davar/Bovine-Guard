import React, { useEffect, useRef, useState } from 'react'

import { useHerd } from '../context/HerdContext'
import { getTranslation } from '../i18n/translations'
import { ChatMessage } from '../types'
import { AnimatePresence, motion } from 'framer-motion'
import {
  Bot,
  Loader2,
  Send,
  X,
} from 'lucide-react'
import ReactMarkdown from 'react-markdown'

export const Chatbot: React.FC = () => {
  const { animals, language, openAnimalProfile, openAppointmentModal, t } = useHerd()

  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [inputText, setInputText] = useState('')
  const [isTyping, setIsTyping] = useState(false)

  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }
  }, [messages, isOpen])

  useEffect(() => {
    setMessages((current) => {
      if (current.length > 1 || (current.length === 1 && current[0].id !== 'msg-welcome')) {
        return current
      }
      return [
        {
          id: 'msg-welcome',
          sender: 'assistant',
          timestamp: new Date().toISOString(),
          text: getTranslation('chatWelcome', language),
        },
      ]
    })
  }, [language])

  const suggestions = [
    t('suggestionOverview'),
    t('suggestionCowAlert'),
    t('suggestionVeterinary'),
    t('suggestionPen'),
  ]

  const handleSendMessage = async (textToSend?: string) => {
    const text = (textToSend ?? inputText).trim()
    if (!text || isTyping) return

    const userMessage: ChatMessage = {
      id: `msg-${Date.now()}`,
      sender: 'user',
      timestamp: new Date().toISOString(),
      text,
    }

    const history = messages.map((message) => ({
      role: message.sender,
      content: message.text,
    }))
    setMessages((previous) => [...previous, userMessage])
    if (!textToSend) setInputText('')
    setIsTyping(true)

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: text,
          language,
          history: history.slice(-12),
          animals: animals.map((animal) => ({
            name: animal.name,
            tag: animal.tag,
            breed: animal.breed,
            pen: animal.assignedPen,
            risk: animal.currentRisk,
            riskScore: animal.riskScore,
            ec: animal.ec,
            ph: animal.ph,
            milkTemp: animal.milkTemp,
            dailyMilkYieldKg: animal.dailyMilkYieldKg,
            wearableActivity: animal.wearable?.activityStatus ?? 'not monitored',
          })),
        }),
      })
      const result = (await response.json()) as { reply?: unknown; error?: unknown }
      if (!response.ok || typeof result.reply !== 'string' || !result.reply.trim()) {
        throw new Error(typeof result.error === 'string' ? result.error : 'Chat request failed')
      }
      const reply = result.reply.trim()

      setMessages((previous) => [
        ...previous,
        {
          id: `msg-reply-${Date.now()}`,
          sender: 'assistant',
          timestamp: new Date().toISOString(),
          text: reply,
        },
      ])
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : t('chatError')
      setMessages((previous) => [
        ...previous,
        {
          id: `msg-error-${Date.now()}`,
          sender: 'assistant',
          timestamp: new Date().toISOString(),
          text: errorMessage,
        },
      ])
    } finally {
      setIsTyping(false)
    }
  }

  return (
    <>
      {/* Floating Chat Bubble Button */}
      <div className="fixed bottom-6 right-6 z-40">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="w-12 h-12 rounded-full bg-[#1D1D1F] hover:bg-black text-white shadow-[0_4px_16px_rgba(0,0,0,0.15)] transition-all flex items-center justify-center relative active:scale-95"
          title={t('askAdvisor')}
        >
          <Bot className="w-5 h-5 text-blue-400" />
          <span className="absolute top-0 right-0 w-3 h-3 bg-emerald-500 rounded-full border-2 border-white" />
        </button>
      </div>

      {/* Chat Window Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 15, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 15, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className="fixed bottom-20 right-4 sm:right-6 z-50 w-[92vw] sm:w-96 bg-white/95 backdrop-blur-2xl rounded-3xl border border-black/[0.08] shadow-[0_20px_50px_rgba(0,0,0,0.12)] overflow-hidden flex flex-col h-[520px]"
          >
            {/* Chat Header */}
            <div className="p-4 bg-[#FBFBFD] border-b border-black/[0.06] flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full bg-[#1D1D1F] text-white flex items-center justify-center font-bold">
                  <Bot className="w-4 h-4 text-blue-400" />
                </div>
                <div>
                  <div className="font-semibold text-sm text-slate-900 leading-none flex items-center gap-1.5">
                    <span>GauSaathi AI</span>
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                  </div>
                  <div className="text-[10px] text-slate-500 mt-1">{t('chatSubtitle')}</div>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="w-7 h-7 rounded-full bg-black/[0.04] hover:bg-black/[0.08] text-slate-500 hover:text-slate-800 flex items-center justify-center transition-colors"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Messages Body */}
            <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-[#FBFBFD]">
              {messages.map((m) => (
                <div
                  key={m.id}
                  className={`flex ${m.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[85%] rounded-2xl p-3 text-xs leading-relaxed ${m.sender === 'user'
                      ? 'bg-[#0071E3] text-white font-normal'
                      : 'bg-white border border-black/[0.06] text-slate-800 shadow-[0_1px_4px_rgba(0,0,0,0.02)]'
                      }`}
                  >
                    <ReactMarkdown>{m.text}</ReactMarkdown>
                  </div>
                </div>
              ))}

              {isTyping && (
                <div className="flex justify-start">
                  <div className="bg-white border border-black/[0.06] rounded-2xl p-2.5 px-3 shadow-[0_1px_4px_rgba(0,0,0,0.02)] flex items-center gap-1.5 text-xs text-slate-500">
                    <Loader2 className="w-3.5 h-3.5 animate-spin text-blue-600" />
                    <span>{t('thinking')}</span>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Quick Suggestions */}
            <div className="p-2 border-t border-black/[0.04] bg-white flex items-center gap-1.5 overflow-x-auto no-scrollbar">
              {suggestions.map((s, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSendMessage(s)}
                  className="px-2.5 py-1 rounded-full bg-black/[0.04] hover:bg-black/[0.08] text-slate-700 text-[11px] font-medium whitespace-nowrap transition-colors"
                >
                  {s}
                </button>
              ))}
            </div>

            {/* Input Form */}
            <form
              onSubmit={(e) => {
                e.preventDefault()
                handleSendMessage()
              }}
              className="p-3 border-t border-black/[0.06] bg-white flex items-center gap-2"
            >
              <input
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder={t('askPlaceholder')}
                className="flex-1 text-xs rounded-full border border-black/[0.08] px-3.5 py-2 bg-black/[0.02] focus:bg-white focus:outline-hidden"
              />
              <button
                type="submit"
                disabled={!inputText.trim()}
                aria-label={t('send')}
                className="p-2 rounded-full bg-[#1D1D1F] hover:bg-black text-white transition-colors disabled:opacity-30"
              >
                <Send className="w-3.5 h-3.5" />
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
