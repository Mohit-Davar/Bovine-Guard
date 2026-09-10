import React, { useEffect, useRef, useState } from 'react'

import { useHerd } from '../context/HerdContext'
import { SupportedLanguage } from '../i18n/translations'
import { ChatGenerativeCard, ChatMessage } from '../types'
import { AnimatePresence, motion } from 'framer-motion'
import {
  Activity,
  AlertTriangle,
  Bot,
  Loader2,
  Send,
  Stethoscope,
  Thermometer,
  TrendingUp,
  User,
  X,
  Zap,
} from 'lucide-react'
import ReactMarkdown from 'react-markdown'

const LANGUAGE_NAMES: Record<string, string> = {
  en: 'English',
  hi: 'Hindi (हिंदी)',
  pa: 'Punjabi (ਪੰਜਾਬੀ)',
  gu: 'Gujarati (ગુજરાતી)',
  mr: 'Marathi (मराठी)',
  te: 'Telugu (తెలుగు)',
  ta: 'Tamil (தமிழ்)',
}

const CHAT_STRINGS: Record<
  SupportedLanguage,
  {
    greeting: string
    placeholder: string
    onlineLabel: string
    suggestions: string[]
    fallback: string
    cardRisked: string
    cardSuspected: string
    cardNormal: string
    cardHerdTitle: string
    cardWorkflowTitle: string
    stage1Label: string
    stage2Label: string
    vetLabel: string
    stage1Desc: string
    stage2Desc: string
    vetDesc: string
    cowCardTitle: string
    cowCardScc: string
    cowCardEc: string
    cowCardTemp: string
    topRiskedTitle: string
  }
> = {
  en: {
    greeting:
      'Hello! I am **BovineGuard AI** powered by ChatGPT. Ask me anything about herd risks, screening, or individual cows!',
    placeholder: 'Ask about herd risks, mastitis screening, or cows...',
    onlineLabel: 'ChatGPT AI - Online',
    suggestions: ['Herd risk summary', 'Explain Stage 1 & 2', 'Top risked cows', 'Bella details'],
    fallback: 'I could not generate a response. Please try again.',
    cardRisked: 'Risked (Stage 2)',
    cardSuspected: 'Suspected (Stage 1)',
    cardNormal: 'Normal',
    cardHerdTitle: 'Herd Risk Distribution',
    cardWorkflowTitle: 'Mastitis Screening Workflow',
    stage1Label: 'Stage 1 - Milk Scanner',
    stage2Label: 'Stage 2 - Wearable Confirmation',
    vetLabel: 'Veterinary Examination',
    stage1Desc:
      'Portable milk scanner measures SCC, EC, pH and milk temperature. Animals exceeding thresholds are flagged as **Suspected**.',
    stage2Desc:
      'Wearable sensors check physiological changes such as rumination and body temperature. Animals can be escalated to **Risked**.',
    vetDesc:
      'Veterinarian performs physical examination and treatment where required. Outcome is logged.',
    cowCardTitle: 'Animal Profile',
    cowCardScc: 'SCC',
    cowCardEc: 'EC',
    cowCardTemp: 'Milk Temp',
    topRiskedTitle: 'Animals Needing Immediate Attention',
  },

  hi: {
    greeting:
      'नमस्ते! मैं **BovineGuard AI** (ChatGPT) हूं। झुंड स्वास्थ्य, जांच और पशुओं के बारे में पूछें!',
    placeholder: 'झुंड जोखिम, जांच, या गायों के बारे में पूछें...',
    onlineLabel: 'ChatGPT AI - ऑनलाइन',
    suggestions: ['जोखिम सारांश', 'चरण 1 और 2', 'उच्च जोखिम गायें', 'बेला विवरण'],
    fallback: 'उत्तर प्राप्त नहीं हो सका। कृपया दोबारा प्रयास करें।',
    cardRisked: 'जोखिमग्रस्त (चरण 2)',
    cardSuspected: 'संदिग्ध (चरण 1)',
    cardNormal: 'सामान्य',
    cardHerdTitle: 'झुंड जोखिम वितरण',
    cardWorkflowTitle: 'थनैला जांच प्रक्रिया',
    stage1Label: 'चरण 1 - दूध स्कैनर',
    stage2Label: 'चरण 2 - वेयरेबल जांच',
    vetLabel: 'पशु चिकित्सा परीक्षण',
    stage1Desc:
      'दूध स्कैनर SCC, EC, pH और दूध तापमान मापता है। सीमा पार करने वाले पशु संदिग्ध किए जाते हैं।',
    stage2Desc: 'वेयरेबल सेंसर जुगाली और शरीर के तापमान जैसे बदलावों को देखते हैं।',
    vetDesc: 'पशु चिकित्सक जांच और आवश्यक उपचार करता है।',
    cowCardTitle: 'पशु प्रोफाइल',
    cowCardScc: 'SCC',
    cowCardEc: 'EC',
    cowCardTemp: 'दूध तापमान',
    topRiskedTitle: 'तुरंत ध्यान देने योग्य पशु',
  },

  pa: {
    greeting: 'ਸਤ ਸ੍ਰੀ ਅਕਾਲ! ਮੈਂ **BovineGuard AI** (ChatGPT) ਹਾਂ। ਝੁੰਡ ਸਿਹਤ ਅਤੇ ਗਾਵਾਂ ਬਾਰੇ ਪੁੱਛੋ!',
    placeholder: 'ਝੁੰਡ ਖਤਰਾ, ਜਾਂਚ, ਜਾਂ ਗਾਂ ਬਾਰੇ ਪੁੱਛੋ...',
    onlineLabel: 'ChatGPT AI - ਔਨਲਾਈਨ',
    suggestions: ['ਖਤਰਾ ਸਾਰ', 'ਪੜਾਅ 1 ਅਤੇ 2', 'ਉੱਚ ਖਤਰੇ ਵਾਲੀਆਂ ਗਾਵਾਂ', 'ਗਾਂ ਦੇ ਵੇਰਵੇ'],
    fallback: 'ਜਵਾਬ ਪ੍ਰਾਪਤ ਨਹੀਂ ਹੋ ਸਕਿਆ। ਦੁਬਾਰਾ ਕੋਸ਼ਿਸ਼ ਕਰੋ।',
    cardRisked: 'ਖਤਰੇ ਵਿੱਚ (ਪੜਾਅ 2)',
    cardSuspected: 'ਸ਼ੱਕੀ (ਪੜਾਅ 1)',
    cardNormal: 'ਆਮ',
    cardHerdTitle: 'ਝੁੰਡ ਖਤਰਾ ਵੰਡ',
    cardWorkflowTitle: 'ਮਸਟਾਇਟਿਸ ਜਾਂਚ ਪ੍ਰਕਿਰਿਆ',
    stage1Label: 'ਪੜਾਅ 1 - ਦੁੱਧ ਸਕੈਨਰ',
    stage2Label: 'ਪੜਾਅ 2 - ਵੇਅਰੇਬਲ ਪੁਸ਼ਟੀ',
    vetLabel: 'ਪਸ਼ੂ ਡਾਕਟਰੀ ਜਾਂਚ',
    stage1Desc: 'ਸਕੈਨਰ SCC, EC, pH ਅਤੇ ਦੁੱਧ ਤਾਪਮਾਨ ਮਾਪਦਾ ਹੈ।',
    stage2Desc: 'ਵੇਅਰੇਬਲ ਸੈਂਸਰ ਸਰੀਰਕ ਬਦਲਾਅ ਦੇਖਦਾ ਹੈ।',
    vetDesc: 'ਪਸ਼ੂ ਡਾਕਟਰ ਜਾਂਚ ਅਤੇ ਲੋੜੀਂਦਾ ਇਲਾਜ ਕਰਦਾ ਹੈ।',
    cowCardTitle: 'ਪਸ਼ੂ ਪ੍ਰੋਫਾਈਲ',
    cowCardScc: 'SCC',
    cowCardEc: 'EC',
    cowCardTemp: 'ਦੁੱਧ ਤਾਪਮਾਨ',
    topRiskedTitle: 'ਤੁਰੰਤ ਧਿਆਨ ਦੇਣ ਵਾਲੇ ਪਸ਼ੂ',
  },

  gu: {
    greeting: 'નમસ્કાર! હું **BovineGuard AI** (ChatGPT) છું. ટોળાં સ્વાસ્થ્ય અને ગાયો વિશે પૂછો!',
    placeholder: 'ટોળા જોખમ, તપાસ, અથવા ગાય વિશે પૂછો...',
    onlineLabel: 'ChatGPT AI - ઑનલાઇન',
    suggestions: ['જોખમ સારાંશ', 'તબક્કો 1 અને 2', 'ઉચ્ચ જોખમ ગાયો'],
    fallback: 'જવાબ મળી શક્યો નથી. ફરી પ્રયાસ કરો.',
    cardRisked: 'જોખમ (તબક્કો 2)',
    cardSuspected: 'શંકાસ્પદ (તબક્કો 1)',
    cardNormal: 'સામાન્ય',
    cardHerdTitle: 'ટોળા જોખમ વિભાજન',
    cardWorkflowTitle: 'મસ્ટાઇટિસ તપાસ પ્રક્રિયા',
    stage1Label: 'તબક્કો 1 - દૂધ સ્કૅનર',
    stage2Label: 'તબક્કો 2 - વેઅરેબલ',
    vetLabel: 'પશુ ચિકિત્સા',
    stage1Desc: 'સ્કૅનર SCC, EC, pH અને દૂધનું તાપમાન માપે છે.',
    stage2Desc: 'વેઅરેબલ શારીરિક ફેરફારો ચકાસે છે.',
    vetDesc: 'પશુ ચિકિત્સક તપાસ અને જરૂરી સારવાર કરે છે.',
    cowCardTitle: 'પશુ પ્રોફાઇલ',
    cowCardScc: 'SCC',
    cowCardEc: 'EC',
    cowCardTemp: 'દૂધ તાપ',
    topRiskedTitle: 'તાત્કાલિક ધ્યાન જરૂરી',
  },

  mr: {
    greeting: 'नमस्कार! मी **BovineGuard AI** (ChatGPT) आहे. कळप आरोग्य व गाईंबद्दल विचारा!',
    placeholder: 'कळप धोका, तपासणी, किंवा गाईबद्दल विचारा...',
    onlineLabel: 'ChatGPT AI - ऑनलाइन',
    suggestions: ['धोका सारांश', 'टप्पा 1 आणि 2', 'उच्च धोक्याच्या गाई'],
    fallback: 'उत्तर मिळाले नाही. पुन्हा प्रयत्न करा.',
    cardRisked: 'धोकादायक (टप्पा 2)',
    cardSuspected: 'संशयित (टप्पा 1)',
    cardNormal: 'सामान्य',
    cardHerdTitle: 'कळप धोका वितरण',
    cardWorkflowTitle: 'मस्टाईटिस तपासणी प्रक्रिया',
    stage1Label: 'टप्पा 1 - दूध स्कॅनर',
    stage2Label: 'टप्पा 2 - वेअरेबल',
    vetLabel: 'पशुवैद्यकीय तपासणी',
    stage1Desc: 'स्कॅनर SCC, EC, pH आणि तापमान मोजतो.',
    stage2Desc: 'वेअरेबल शारीरिक बदल तपासतो.',
    vetDesc: 'पशुवैद्य तपासणी आणि आवश्यक उपचार करतो.',
    cowCardTitle: 'पशू प्रोफाइल',
    cowCardScc: 'SCC',
    cowCardEc: 'EC',
    cowCardTemp: 'दूध तापमान',
    topRiskedTitle: 'तातडीने लक्ष देणे आवश्यक',
  },

  te: {
    greeting: 'నమస్కారం! నేను **BovineGuard AI** (ChatGPT). మంద ఆరోగ్యం మరియు ఆవుల గురించి అడగండి!',
    placeholder: 'మంద ప్రమాదం, పరీక్ష, లేదా ఆవుల గురించి అడగండి...',
    onlineLabel: 'ChatGPT AI - ఆన్లైన్',
    suggestions: ['ప్రమాద సారాంశం', 'దశ 1 మరియు 2', 'అధిక ప్రమాద ఆవులు'],
    fallback: 'సమాధానం పొందలేకపోయాము. మళ్లీ ప్రయత్నించండి.',
    cardRisked: 'ప్రమాదంలో (దశ 2)',
    cardSuspected: 'అనుమానిత (దశ 1)',
    cardNormal: 'సాధారణ',
    cardHerdTitle: 'మంద ప్రమాద పంపిణీ',
    cardWorkflowTitle: 'మాస్టైటిస్ స్క్రీనింగ్ వర్క్‌ఫ్లో',
    stage1Label: 'దశ 1 - పాల స్కానర్',
    stage2Label: 'దశ 2 - వేరబుల్',
    vetLabel: 'పశువైద్య పరీక్ష',
    stage1Desc: 'స్కానర్ SCC, EC, pH మరియు పాల ఉష్ణోగ్రత కొలుస్తుంది.',
    stage2Desc: 'వేరబుల్ సెన్సర్ శారీరక మార్పులను పరిశీలిస్తుంది.',
    vetDesc: 'పశువైద్యుడు అవసరమైన పరీక్ష మరియు చికిత్స చేస్తారు.',
    cowCardTitle: 'జంతువు ప్రొఫైల్',
    cowCardScc: 'SCC',
    cowCardEc: 'EC',
    cowCardTemp: 'పాల ఉష్ణోగ్రత',
    topRiskedTitle: 'వెంటనే శ్రద్ధ అవసరమైనవి',
  },

  ta: {
    greeting:
      'வணக்கம்! நான் **BovineGuard AI** (ChatGPT). மந்தை ஆரோக்கியம் மற்றும் மாடுகள் பற்றி கேளுங்கள்!',
    placeholder: 'மந்தை ஆபத்து, பரிசோதனை, அல்லது மாடுகள் பற்றி கேளுங்கள்...',
    onlineLabel: 'ChatGPT AI - ஆன்லைன்',
    suggestions: ['ஆபத்து சுருக்கம்', 'நிலை 1 மற்றும் 2', 'அதிக ஆபத்து மாடுகள்'],
    fallback: 'பதிலைப் பெற முடியவில்லை. மீண்டும் முயற்சிக்கவும்.',
    cardRisked: 'ஆபத்தில் (நிலை 2)',
    cardSuspected: 'சந்தேகப்படுகிறது (நிலை 1)',
    cardNormal: 'இயல்பு',
    cardHerdTitle: 'மந்தை ஆபத்து விநியோகம்',
    cardWorkflowTitle: 'மடிநோய் பரிசோதனை செயல்முறை',
    stage1Label: 'நிலை 1 - பால் ஸ்கேனர்',
    stage2Label: 'நிலை 2 - அணியக்கூடிய சென்சார்',
    vetLabel: 'கால்நடை மருத்துவ பரிசோதனை',
    stage1Desc: 'ஸ்கேனர் SCC, EC, pH மற்றும் பால் வெப்பநிலையை அளவிடுகிறது.',
    stage2Desc: 'அணியக்கூடிய சென்சார் உடல் மாற்றங்களை கண்காணிக்கிறது.',
    vetDesc: 'தேவையான பரிசோதனை மற்றும் சிகிச்சையை மருத்துவர் செய்கிறார்.',
    cowCardTitle: 'விலங்கு சுயவிவரம்',
    cowCardScc: 'SCC',
    cowCardEc: 'EC',
    cowCardTemp: 'பால் வெப்ப.',
    topRiskedTitle: 'உடனடி கவனம் தேவை',
  },
}

const MarkdownBubble: React.FC<{
  text: string
  isUser: boolean
}> = ({ text, isUser }) => {
  if (isUser) {
    return <span className="text-[13px] leading-relaxed">{text}</span>
  }

  return (
    <ReactMarkdown
      components={{
        p: ({ children }) => (
          <p className="text-[13px] leading-relaxed mb-1 last:mb-0">{children}</p>
        ),
        strong: ({ children }) => <strong className="font-bold text-slate-900">{children}</strong>,
        em: ({ children }) => <em className="italic text-blue-700">{children}</em>,
        ul: ({ children }) => (
          <ul className="list-disc list-inside space-y-0.5 mt-1 text-[13px]">{children}</ul>
        ),
        li: ({ children }) => <li className="text-slate-700">{children}</li>,
      }}
    >
      {text}
    </ReactMarkdown>
  )
}

const GenerativeCard: React.FC<{
  card: ChatGenerativeCard
  lang: SupportedLanguage
}> = ({ card, lang }) => {
  const s = CHAT_STRINGS[lang] ?? CHAT_STRINGS.en

  switch (card.type) {
    case 'herd_summary':
      return (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-2 bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm"
        >
          <div className="px-3 py-2 bg-gradient-to-r from-slate-800 to-slate-700">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-300">
              {s.cardHerdTitle}
            </span>
          </div>

          <div className="p-3 grid grid-cols-3 gap-2">
            {[
              {
                label: s.cardRisked,
                val: card.data?.risked ?? 0,
                bg: 'bg-red-50',
                border: 'border-red-200',
                text: 'text-red-700',
              },
              {
                label: s.cardSuspected,
                val: card.data?.suspected ?? 0,
                bg: 'bg-amber-50',
                border: 'border-amber-200',
                text: 'text-amber-700',
              },
              {
                label: s.cardNormal,
                val: card.data?.normal ?? 0,
                bg: 'bg-emerald-50',
                border: 'border-emerald-200',
                text: 'text-emerald-700',
              },
            ].map((item) => (
              <div
                key={item.label}
                className={`${item.bg} ${item.border} border rounded-xl p-2.5 flex flex-col items-center`}
              >
                <span className={`text-2xl font-black ${item.text}`}>{item.val}</span>

                <span className="text-[9px] font-bold text-center text-slate-500 mt-0.5 leading-tight">
                  {item.label}
                </span>
              </div>
            ))}
          </div>

          {card.data?.total != null && (
            <div className="px-3 pb-2.5 flex items-center gap-2">
              <div className="flex-1 h-2 rounded-full bg-slate-100 overflow-hidden flex">
                {card.data.risked > 0 && (
                  <div
                    className="h-full bg-red-500"
                    style={{
                      width: `${(card.data.risked / card.data.total) * 100}%`,
                    }}
                  />
                )}

                {card.data.suspected > 0 && (
                  <div
                    className="h-full bg-amber-400"
                    style={{
                      width: `${(card.data.suspected / card.data.total) * 100}%`,
                    }}
                  />
                )}

                {card.data.normal > 0 && (
                  <div
                    className="h-full bg-emerald-400"
                    style={{
                      width: `${(card.data.normal / card.data.total) * 100}%`,
                    }}
                  />
                )}
              </div>

              <span className="text-[10px] text-slate-500 font-semibold shrink-0">
                {card.data.total} total
              </span>
            </div>
          )}
        </motion.div>
      )

    case 'stage_workflow':
      return (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-2 bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm"
        >
          <div className="px-3 py-2 bg-gradient-to-r from-blue-800 to-indigo-700">
            <span className="text-[10px] font-bold uppercase tracking-wider text-blue-200">
              {s.cardWorkflowTitle}
            </span>
          </div>

          <div className="p-3 space-y-2">
            {[
              {
                icon: <Activity className="w-4 h-4 text-amber-500" />,
                label: s.stage1Label,
                desc: s.stage1Desc,
                color: 'border-amber-200 bg-amber-50',
              },
              {
                icon: <AlertTriangle className="w-4 h-4 text-red-500" />,
                label: s.stage2Label,
                desc: s.stage2Desc,
                color: 'border-red-200 bg-red-50',
              },
              {
                icon: <Stethoscope className="w-4 h-4 text-emerald-500" />,
                label: s.vetLabel,
                desc: s.vetDesc,
                color: 'border-emerald-200 bg-emerald-50',
              },
            ].map((step, i) => (
              <div key={i}>
                <div className={`border rounded-lg p-2.5 ${step.color}`}>
                  <div className="flex items-center gap-2 mb-1">
                    {step.icon}
                    <span className="text-[11px] font-bold text-slate-800">{step.label}</span>
                  </div>

                  <p className="text-[11px] text-slate-600 leading-snug">{step.desc}</p>
                </div>

                {i < 2 && <div className="w-0.5 h-2 bg-slate-300 mx-auto" />}
              </div>
            ))}
          </div>
        </motion.div>
      )

    case 'cow_card':
      return (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-2 bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm"
        >
          <div className="px-3 py-2 bg-gradient-to-r from-slate-700 to-slate-600 flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-300">
              {s.cowCardTitle}
            </span>

            <span
              className={`text-[10px] font-black px-2 py-0.5 rounded-full ${
                ['risked', 'critical', 'high'].includes(card.data?.risk)
                  ? 'bg-red-500 text-white'
                  : ['suspected', 'watch'].includes(card.data?.risk)
                    ? 'bg-amber-400 text-slate-900'
                    : 'bg-emerald-500 text-white'
              }`}
            >
              {card.data?.risk?.toUpperCase()}
            </span>
          </div>

          <div className="p-3">
            <div className="mb-2">
              <p className="font-black text-slate-900 text-base leading-tight">{card.data?.name}</p>

              <p className="text-[11px] text-slate-400 font-mono">
                {card.data?.tag} - {card.data?.pen}
              </p>
            </div>

            <div className="grid grid-cols-3 gap-1.5">
              {[
                {
                  icon: <TrendingUp className="w-3 h-3" />,
                  label: s.cowCardScc,
                  val: `${card.data?.scc}k`,
                  hot: card.data?.scc > 250,
                },
                {
                  icon: <Zap className="w-3 h-3" />,
                  label: s.cowCardEc,
                  val: `${card.data?.ec} mS`,
                  hot: card.data?.ec > 5.5,
                },
                {
                  icon: <Thermometer className="w-3 h-3" />,
                  label: s.cowCardTemp,
                  val: `${card.data?.milkTemp}C`,
                  hot: card.data?.milkTemp > 39.3,
                },
              ].map((m) => (
                <div
                  key={m.label}
                  className="bg-slate-50 rounded-lg p-2 border border-slate-100 text-center"
                >
                  <div className="flex justify-center text-slate-400 mb-1">{m.icon}</div>

                  <p className={`text-xs font-black ${m.hot ? 'text-red-600' : 'text-slate-700'}`}>
                    {m.val}
                  </p>

                  <p className="text-[9px] text-slate-400 font-semibold">{m.label}</p>
                </div>
              ))}
            </div>

            {card.data?.action && (
              <p className="mt-2 text-[11px] text-slate-600 bg-blue-50 border border-blue-100 rounded-lg px-2.5 py-1.5 font-medium">
                {card.data.action}
              </p>
            )}
          </div>
        </motion.div>
      )

    case 'action_prompt':
      return (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-2 bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm"
        >
          <div className="px-3 py-2 bg-gradient-to-r from-red-700 to-rose-600">
            <span className="text-[10px] font-bold uppercase tracking-wider text-red-200">
              {s.topRiskedTitle}
            </span>
          </div>

          <div className="p-2 space-y-1.5">
            {(card.data?.animals ?? []).slice(0, 5).map((a: any) => (
              <div
                key={a.id}
                className="flex items-center justify-between p-2 bg-slate-50 rounded-lg border border-slate-100"
              >
                <div>
                  <span className="text-xs font-bold text-slate-800">{a.name}</span>

                  <span className="text-[10px] text-slate-400 font-mono ml-1.5">{a.tag}</span>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-mono text-slate-600">{a.scc}k SCC</span>

                  <span
                    className={`text-[10px] font-black px-1.5 py-0.5 rounded ${
                      a.currentRisk === 'risked'
                        ? 'bg-red-100 text-red-700'
                        : 'bg-amber-100 text-amber-800'
                    }`}
                  >
                    {a.currentRisk?.toUpperCase()}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      )

    default:
      return null
  }
}

const TypingIndicator: React.FC = () => (
  <div className="flex justify-start">
    <div className="flex gap-2 items-end">
      <div className="w-6 h-6 rounded-full bg-blue-600 flex items-center justify-center shrink-0">
        <Bot className="w-3.5 h-3.5 text-white" />
      </div>

      <div className="bg-white border border-slate-200 rounded-2xl rounded-tl-sm px-4 py-3 shadow-sm">
        <div className="flex gap-1 items-center">
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              className="w-1.5 h-1.5 rounded-full bg-slate-400"
              animate={{
                opacity: [0.3, 1, 0.3],
                y: [0, -3, 0],
              }}
              transition={{
                duration: 0.9,
                repeat: Infinity,
                delay: i * 0.2,
              }}
            />
          ))}
        </div>
      </div>
    </div>
  </div>
)

export const Chatbot: React.FC = () => {
  const { animals, language } = useHerd()
  const s = CHAT_STRINGS[language] ?? CHAT_STRINGS.en

  // ONLY source for the OpenAI API key.
  const apiKey = import.meta.env.VITE_OPENAI_API_KEY || ''

  const makeGreeting = (): ChatMessage => ({
    id: 'msg-1',
    sender: 'assistant',
    timestamp: new Date().toLocaleTimeString(),
    text: s.greeting,
  })

  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState<ChatMessage[]>([makeGreeting()])
  const [input, setInput] = useState('')
  const [isTyping, setIsTyping] = useState(false)

  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    setMessages([makeGreeting()])
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [language])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({
      behavior: 'smooth',
    })
  }, [messages, isOpen, isTyping])

  const callChatGPT = async (userQuery: string, currentHistory: ChatMessage[]) => {
    if (!apiKey) {
      return {
        text: '⚠️ **OpenAI API key is not configured.**',
      }
    }

    const risked = animals.filter((a) => ['risked', 'critical', 'high'].includes(a.currentRisk))

    const suspected = animals.filter((a) => ['suspected', 'watch'].includes(a.currentRisk))

    const normal = animals.filter((a) => ['normal', 'low'].includes(a.currentRisk))

    const herdSummaryContext = `
Herd Overview:
- Total animals: ${animals.length}
- Risked: ${risked.length}
- Suspected: ${suspected.length}
- Normal: ${normal.length}

Animals:
${animals
  .map(
    (a) =>
      `- Name: ${a.name}, Tag: ${a.tag}, Pen: ${a.assignedPen}, Risk: ${a.currentRisk}, SCC: ${a.scc}k, EC: ${a.ec} mS/cm, Milk Temp: ${a.milkTemp}°C, Recommended Action: ${a.recommendedAction || 'None'}`,
  )
  .join('\n')}
`

    const targetLang = LANGUAGE_NAMES[language] || 'Hindi (हिंदी)'

    const systemPrompt = `
You are BovineGuard AI, an AI assistant for dairy herd health monitoring.

Answer using only the live herd data supplied below.

Target Output Language:
${targetLang}

Workflow:
- Stage 1: Milk screening using SCC, EC, pH and milk temperature.
- Stage 1 abnormal results can mark an animal as Suspected.
- Stage 2: Wearable monitoring is used for animals that are not Normal.
- Stage 2 includes rumination, activity and body temperature.
- Veterinary examination is the final clinical step.

Live herd data:
${herdSummaryContext}

Rules:
- Be concise and practical.
- Do not invent animal data.
- Do not invent symptoms.
- Do not claim a confirmed diagnosis from sensor data alone.
- Do not identify pathogens without laboratory evidence.
- If a value is unavailable, say it is unavailable.
- When discussing a cow, use the actual values provided.
- CRITICAL: You MUST write your entire response strictly in ${targetLang}. Do NOT write in English or any other language unless the selected language is English ('en'). Use simple, plain, everyday words in ${targetLang} that rural farmers can easily understand. Avoid complex technical jargon or heavy medical terms. Give short, direct, practical advice.
`

    const inputMessages = [
      ...currentHistory
        .filter((m) => m.id !== 'msg-1')
        .slice(-6)
        .map((m) => ({
          role: m.sender === 'user' ? ('user' as const) : ('assistant' as const),
          content: m.text,
        })),
      {
        role: 'user' as const,
        content: userQuery,
      },
    ]

    try {
      const res = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${apiKey.trim()}`,
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          messages: [
            {
              role: 'system',
              content: systemPrompt,
            },
            ...inputMessages,
          ],
          max_tokens: 600,
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data?.error?.message || `OpenAI API error ${res.status}`)
      }

      const replyText = data.choices?.[0]?.message?.content || ''

      if (!replyText.trim()) {
        throw new Error('No response returned by OpenAI.')
      }

      let card: ChatGenerativeCard | undefined

      const combinedText = `${userQuery} ${replyText}`.toLowerCase()

      if (
        /risk|summary|distribut|herd|जोखिम|समरी|वितरण|झुंड|ਖਤਰਾ|ਵੰਡ|ટોળ|કુલ|कळप|वितरण|ஆபத்து|விநியோகம்|ప్రమాద|పంపిణీ/.test(
          combinedText,
        )
      ) {
        card = {
          type: 'herd_summary',
          title: s.cardHerdTitle,
          data: {
            risked: risked.length,
            suspected: suspected.length,
            normal: normal.length,
            total: animals.length,
          },
        }
      } else if (
        /stage|workflow|चरण|स्टेप|वर्कफ्लो|टप्पा|ਪੜਾਅ|ਪ੍ਰਕਿਰਿਆ|તબક્કો|நிலை|செயல்முறை|దశ|వర్క్‌ఫ్లో/.test(
          combinedText,
        )
      ) {
        card = {
          type: 'stage_workflow',
          title: s.cardWorkflowTitle,
        }
      } else if (
        /top|urgent|attention|critical|risked|उच्च|तुरंत|ध्यान|सबसे|ਖਤਰੇ|ਧਿਆਨ|ખરાબ|તાત્કાલિક|तातडीने|உடனடி|கவனம்|అత్యవసర|వెంటనే/.test(
          combinedText,
        )
      ) {
        const topAnimals = [...animals]
          .filter((a) => ['risked', 'critical', 'high', 'suspected'].includes(a.currentRisk))
          .sort((a, b) => b.riskScore - a.riskScore)
          .slice(0, 5)

        card = {
          type: 'action_prompt',
          title: s.topRiskedTitle,
          data: {
            animals: topAnimals,
          },
        }
      } else {
        const matched = animals.find(
          (a) =>
            combinedText.includes(a.name.toLowerCase()) ||
            combinedText.includes(a.tag.toLowerCase()),
        )

        if (matched) {
          card = {
            type: 'cow_card',
            cowId: matched.id,
            data: {
              name: matched.name,
              tag: matched.tag,
              pen: matched.assignedPen,
              scc: matched.scc,
              ec: matched.ec,
              milkTemp: matched.milkTemp,
              risk: matched.currentRisk,
              action: matched.recommendedAction,
            },
          }
        }
      }

      return {
        text: replyText.trim(),
        card,
      }
    } catch (err: any) {
      console.error('OpenAI API Error:', err)

      return {
        text: `❌ **OpenAI Error:** ${err?.message || 'Failed to get a response.'}`,
      }
    }
  }

  const handleSend = async (textToSend?: string) => {
    const value = textToSend ?? input

    if (!value.trim() || isTyping) return

    const userMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      sender: 'user',
      timestamp: new Date().toLocaleTimeString(),
      text: value,
    }

    setMessages((prev) => [...prev, userMsg])
    setInput('')
    setIsTyping(true)

    const response = await callChatGPT(value, [...messages, userMsg])

    setIsTyping(false)

    setMessages((prev) => [
      ...prev,
      {
        id: `msg-${Date.now() + 1}`,
        sender: 'assistant',
        timestamp: new Date().toLocaleTimeString(),
        text: response.text,
        card: response.card,
      },
    ])
  }

  const hasCritical = animals.some((a) => ['risked', 'critical'].includes(a.currentRisk))

  return (
    <>
      <motion.button
        whileHover={{ scale: 1.07 }}
        whileTap={{ scale: 0.93 }}
        onClick={() => setIsOpen(true)}
        style={{ display: isOpen ? 'none' : 'flex' }}
        className="fixed bottom-6 right-6 z-50 w-14 h-14 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-full items-center justify-center shadow-2xl text-white border border-white/20"
      >
        <Bot className="w-6 h-6" />

        {hasCritical && (
          <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-red-500 rounded-full border-2 border-white flex items-center justify-center">
            <span className="text-[8px] font-black text-white">!</span>
          </span>
        )}
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{
              opacity: 0,
              y: 24,
              scale: 0.94,
            }}
            animate={{
              opacity: 1,
              y: 0,
              scale: 1,
            }}
            exit={{
              opacity: 0,
              y: 24,
              scale: 0.94,
            }}
            transition={{
              duration: 0.22,
              ease: 'easeOut',
            }}
            className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-50 w-[calc(100vw-2rem)] sm:w-[26rem] max-w-[26rem] bg-slate-50 border border-slate-200 rounded-2xl shadow-2xl flex flex-col overflow-hidden"
            style={{
              height: '560px',
              maxHeight: 'calc(100vh - 2rem)',
            }}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 bg-white border-b border-slate-200 shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center shadow-sm">
                  <Bot className="w-5 h-5 text-white" />
                </div>

                <div>
                  <h3 className="font-black text-sm text-slate-900 leading-tight">
                    BovineGuard AI
                  </h3>

                  <p className="text-[10px] text-emerald-600 font-bold flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    {s.onlineLabel}
                  </p>
                </div>
              </div>

              <button
                onClick={() => setIsOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.map((msg) => (
                <motion.div
                  key={msg.id}
                  initial={{
                    opacity: 0,
                    y: 6,
                  }}
                  animate={{
                    opacity: 1,
                    y: 0,
                  }}
                  className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`flex max-w-[87%] gap-2 ${
                      msg.sender === 'user' ? 'flex-row-reverse' : 'flex-row'
                    }`}
                  >
                    <div
                      className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 mt-1 ${
                        msg.sender === 'user' ? 'bg-slate-200' : 'bg-blue-600 text-white'
                      }`}
                    >
                      {msg.sender === 'user' ? (
                        <User className="w-3.5 h-3.5 text-slate-600" />
                      ) : (
                        <Bot className="w-3.5 h-3.5" />
                      )}
                    </div>

                    <div className="min-w-0">
                      <div
                        className={`px-3.5 py-2.5 rounded-2xl shadow-sm ${
                          msg.sender === 'user'
                            ? 'bg-blue-600 text-white rounded-tr-sm'
                            : 'bg-white text-slate-700 border border-slate-200 rounded-tl-sm'
                        }`}
                      >
                        <MarkdownBubble text={msg.text} isUser={msg.sender === 'user'} />
                      </div>

                      {msg.card && <GenerativeCard card={msg.card} lang={language} />}
                    </div>
                  </div>
                </motion.div>
              ))}

              {isTyping && <TypingIndicator />}

              <div ref={messagesEndRef} />
            </div>

            {/* Suggestions */}
            <div className="px-3 py-2 bg-white border-t border-slate-100 flex gap-1.5 overflow-x-auto shrink-0">
              {s.suggestions.map((sug) => (
                <button
                  key={sug}
                  onClick={() => handleSend(sug)}
                  className="shrink-0 text-[11px] font-semibold text-blue-700 bg-blue-50 border border-blue-200 px-2.5 py-1 rounded-full hover:bg-blue-100 transition-colors whitespace-nowrap"
                >
                  {sug}
                </button>
              ))}
            </div>

            {/* Input */}
            <div className="p-3 bg-white border-t border-slate-200 shrink-0">
              <div className="relative flex items-center">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                  placeholder={s.placeholder}
                  className="w-full bg-slate-100 text-slate-900 text-sm rounded-full pl-4 pr-12 py-2.5 outline-none focus:ring-2 focus:ring-blue-500/50 transition-all placeholder-slate-400 font-medium"
                />

                <button
                  onClick={() => handleSend()}
                  disabled={!input.trim() || isTyping}
                  className="absolute right-1.5 p-1.5 bg-blue-600 text-white rounded-full hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                  {isTyping ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Send className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
