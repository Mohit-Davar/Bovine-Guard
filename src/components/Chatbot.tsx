import React, { useEffect, useRef, useState } from 'react'

import { useHerd } from '../context/HerdContext'
import { SupportedLanguage } from '../i18n/translations'
import { ChatMessage } from '../types'
import { AnimatePresence, motion } from 'framer-motion'
import {
  Activity,
  AlertTriangle,
  Bot,
  Calendar,
  CheckCircle2,
  ChevronDown,
  Loader2,
  Send,
  Sparkles,
  Stethoscope,
  User,
  X,
} from 'lucide-react'
import ReactMarkdown from 'react-markdown'

export const Chatbot: React.FC = () => {
  const { animals, language, openAnimalProfile, openAppointmentModal, t } = useHerd()

  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'msg-welcome',
      sender: 'assistant',
      timestamp: 'Just now',
      text:
        language === 'hi'
          ? 'नमस्ते! मैं **गौसाथी AI** (GauSaathi AI) सहायक हूँ। आप मुझसे गायों के स्वास्थ्य, दूध की चालकता (EC), फार्म के वातावरण, या डॉक्टर से समय लेने के बारे में पूछ सकते हैं।'
          : 'Namaste! I am **GauSaathi AI** assistant. Ask me about cow health, milk conductivity (EC), pen conditions, or booking a veterinary doctor.',
    },
  ])
  const [inputText, setInputText] = useState('')
  const [isTyping, setIsTyping] = useState(false)

  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }
  }, [messages, isOpen])

  const suggestions = [
    'Farm health overview',
    'Why is Cow 024 flagged?',
    'Book veterinary appointment',
    'Pen 2 status',
  ]

  const handleSendMessage = (textToSend?: string) => {
    const text = textToSend || inputText
    if (!text.trim()) return

    const userMessage: ChatMessage = {
      id: `msg-${Date.now()}`,
      sender: 'user',
      timestamp: 'Just now',
      text,
    }

    setMessages((prev) => [...prev, userMessage])
    if (!textToSend) setInputText('')
    setIsTyping(true)

    // GauSaathi AI response generator tailored for Indian dairy farming
    setTimeout(() => {
      const q = text.toLowerCase()
      let reply = ''

      if (q.includes('overview') || q.includes('summary') || q.includes('total')) {
        reply = `**GauSaathi Farm Overview:**
• **128 Total Cows** across 4 pens (Pen 1, 2, 3, 4).
• **116 Checked Today** (90.6% shift coverage).
• **94 Healthy**, **18 At Risk**, **6 Suspicious**.
• Farm THI is currently **78** with temperature **29.4°C** and humidity **68%**.`
      } else if (q.includes('024') || q.includes('cow 024') || q.includes('flagged')) {
        reply = `**Cow 024 (Pen 2 · Gir):**
• **Status:** Suspicious (Action required)
• **Milk EC:** 7.8 mS/cm (↑ 18% above normal)
• **Milk pH:** 6.8
• **Milk Yield:** 5.4 L (↓ Below normal)
• **Physical Tracking:** Wearable active. Activity is reduced and lying time has increased to 14.1 hours.
• **Recommended Action:** Milk separately from bulk tank and book a doctor visit.`
      } else if (q.includes('037') || q.includes('cow 037')) {
        reply = `**Cow 037 (Pen 1 · HF Cross):**
• **Status:** At Risk
• **Milk EC:** 6.4 mS/cm (mildly elevated)
• **Wearable Status:** Pending start.
• **Action:** Attach physical monitoring sensor and check during next shift.`
      } else if (
        q.includes('doctor') ||
        q.includes('vet') ||
        q.includes('appointment') ||
        q.includes('calendar')
      ) {
        reply = `You can easily book an on-farm visit with verified veterinarians (e.g. Dr. Rajesh Verma, Dr. Anita Sharma) using Google Calendar. The appointment will automatically add to your calendar and send an email reminder with clinical notes to both you and the doctor.`
      } else if (q.includes('pen') || q.includes('pens')) {
        reply = `**Pen Status:**
• **Pen 1:** 32 cows (2 suspicious, 5 at risk, 25 healthy)
• **Pen 2:** 28 cows (1 suspicious, 3 at risk, 24 healthy)
• **Pen 3:** 34 cows (2 suspicious, 4 at risk, 28 healthy)
• **Pen 4:** 34 cows (1 suspicious, 6 at risk, 29 healthy)`
      } else {
        reply = `GauSaathi monitors your herd's milk conductivity (EC), pH, and physical resting metrics. For cows showing elevated readings (such as Cow 024 in Pen 2), prompt isolation of milk and consultation with a veterinary doctor is recommended.`
      }

      setMessages((prev) => [
        ...prev,
        {
          id: `msg-reply-${Date.now()}`,
          sender: 'assistant',
          timestamp: 'Just now',
          text: reply,
        },
      ])
      setIsTyping(false)
    }, 450)
  }

  return (
    <>
      {/* Floating Chat Bubble Button */}
      <div className="fixed bottom-6 right-6 z-40">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="w-12 h-12 rounded-full bg-[#1D1D1F] hover:bg-black text-white shadow-[0_4px_16px_rgba(0,0,0,0.15)] transition-all flex items-center justify-center relative active:scale-95"
          title="Ask GauSaathi AI"
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
                  <div className="text-[10px] text-slate-500 mt-1">
                    Indian Dairy Health Advisor
                  </div>
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
                    className={`max-w-[85%] rounded-2xl p-3 text-xs leading-relaxed ${
                      m.sender === 'user'
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
