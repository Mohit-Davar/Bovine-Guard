import React, { useEffect, useState } from 'react'

import { useHerd } from '../context/HerdContext'
import { Animal } from '../types'
import { CowChartWidget } from './CowChartWidget'
import { RiskBadge } from './RiskBadge'
import {
  Activity,
  AlertTriangle,
  Battery,
  Bot,
  Droplets,
  RefreshCw,
  Stethoscope,
  X,
} from 'lucide-react'

const LANGUAGE_NAMES: Record<string, string> = {
  en: 'English',
  hi: 'Hindi (हिंदी)',
  pa: 'Punjabi (ਪੰਜਾਬੀ)',
  gu: 'Gujarati (ગુજરાતી)',
  mr: 'Marathi (मराठी)',
  te: 'Telugu (తెలుగు)',
  ta: 'Tamil (தமிழ்)',
}

export const AnimalProfileModal: React.FC = () => {
  const { selectedAnimalId, closeAnimalProfile, animals, openOutcomeModal, language, t } = useHerd()

  const cow = animals.find((a) => a.id === selectedAnimalId)

  const [aiAnalysis, setAiAnalysis] = useState('')
  const [loadingAi, setLoadingAi] = useState(false)
  const [showAiAnalysis, setShowAiAnalysis] = useState(false)
  const [aiError, setAiError] = useState('')

  const getApiKey = () => import.meta.env.VITE_OPENAI_API_KEY || ''

  const fetchAiAnalysis = async (cowData: Animal) => {
    const key = getApiKey()

    if (!key) {
      setAiError('OpenAI API key is not configured.')
      setAiAnalysis('')
      return
    }

    setLoadingAi(true)
    setAiError('')

    const targetLang = LANGUAGE_NAMES[language] || 'Hindi (हिंदी)'

    try {
      const prompt = `
Analyse the following dairy cow health screening data.

Cow:
- Name: ${cowData.name}
- Tag: ${cowData.tag}
- Risk status: ${cowData.currentRisk}
- Days in milk: ${cowData.daysInMilk}
- Pen: ${cowData.assignedPen}

Stage 1 - Milk screening:
- Milk temperature: ${cowData.milkTemp ?? 'Not available'} °C
- Milk pH: ${cowData.ph ?? 'Not available'}
- Milk electrical conductivity: ${cowData.ec ?? 'Not available'} mS/cm
- Somatic cell count: ${cowData.scc ?? 'Not available'}k cells/mL

${
  cowData.currentRisk !== 'normal' && cowData.wearable
    ? `
Stage 2 - Wearable screening:
- Rumination: ${cowData.wearable.ruminationMinutes ?? 'Not available'} min/day
- Rumination baseline: ${cowData.wearable.ruminationBaseline ?? 'Not available'} min/day
- Physical activity: ${cowData.wearable.activityStatus ?? 'Not available'}
- Body temperature: ${cowData.wearable.bodyTemp ?? 'Not available'} °C
`
    : ''
}

Give a short AI screening summary in 2-3 sentences.

Rules:
- Use only the data provided above.
- Do not invent missing values.
- Do not identify pathogens.
- Do not claim a confirmed veterinary diagnosis.
- Do not add information about the cow that is not provided.
- Clearly mention the abnormal measurements if present.
- Give one simple recommended next step.
`

      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${key.trim()}`,
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          messages: [
            {
              role: 'system',
              content: `You are an AI health screening assistant for dairy farmers. Keep responses short, factual, and extremely simple. CRITICAL: You MUST write your entire response strictly in ${targetLang}. Do NOT write in English or any other language unless selected language is English ('en'). Use simple, plain, everyday words in ${targetLang} that rural farmers can easily understand. Avoid complex technical jargon or heavy medical terms.`,
            },
            {
              role: 'user',
              content: prompt,
            },
          ],
          max_tokens: 150,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data?.error?.message || `OpenAI API error: ${response.status}`)
      }

      const outputText = data.choices?.[0]?.message?.content || ''

      if (!outputText.trim()) {
        throw new Error('No AI analysis was returned.')
      }

      setAiAnalysis(outputText.trim())
    } catch (error: any) {
      setAiAnalysis('')
      setAiError(error?.message || 'Unable to generate AI analysis.')
    } finally {
      setLoadingAi(false)
    }
  }

  const handleAiAnalysis = () => {
    setShowAiAnalysis(true)

    if (cow) {
      fetchAiAnalysis(cow)
    }
  }

  useEffect(() => {
    setShowAiAnalysis(false)
    setAiAnalysis('')
    setAiError('')
    setLoadingAi(false)
  }, [selectedAnimalId])

  if (!selectedAnimalId) return null

  if (!cow) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60">
        <div className="bg-white rounded-2xl p-6 max-w-md w-full text-center">
          <AlertTriangle className="w-10 h-10 text-amber-500 mx-auto mb-2" />

          <h3 className="text-base font-bold text-slate-900">Cow Record Not Found</h3>

          <p className="text-xs text-slate-500 mt-1">The selected animal could not be found.</p>

          <button
            onClick={closeAnimalProfile}
            className="mt-4 px-4 py-2 bg-slate-900 text-white rounded-lg text-xs font-bold"
          >
            Close
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-900/60 overflow-y-auto">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xl max-w-3xl w-full my-8 overflow-hidden">
        {/* Header */}
        <div className="p-5 sm:p-6 border-b border-slate-200 flex items-start justify-between bg-slate-50">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-slate-900 text-white font-black flex flex-col items-center justify-center shrink-0">
              <span className="text-[10px] text-slate-400 uppercase">TAG</span>

              <span className="text-xs font-mono">{cow.tag.replace('US-', '')}</span>
            </div>

            <div>
              <div className="flex items-center gap-3 flex-wrap">
                <h2 className="text-xl font-black text-slate-900">{cow.name}</h2>

                <RiskBadge risk={cow.currentRisk} score={cow.riskScore} size="md" />
              </div>

              <p className="text-xs text-slate-500 mt-0.5 font-medium">
                {cow.breed} · Age {cow.ageYears} yrs · Parity {cow.parity} · DIM {cow.daysInMilk} ·
                Pen: {cow.assignedPen}
              </p>
            </div>
          </div>

          <button
            onClick={closeAnimalProfile}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 sm:p-6 space-y-6 max-h-[75vh] overflow-y-auto">
          {/* Stage 1 */}
          <div>
            <div className="flex items-center gap-1.5 mb-2.5">
              <Droplets className="w-4 h-4 text-blue-600" />

              <h3 className="text-xs font-black uppercase tracking-wider text-slate-900">
                Stage 1: Milk Parameters
              </h3>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
                <span className="text-[10px] font-bold text-slate-600 uppercase block">
                  Milk Temp
                </span>

                <span className="text-base font-black text-slate-900 mt-0.5 block">
                  {cow.milkTemp !== undefined ? `${cow.milkTemp}°C` : 'N/A'}
                </span>
              </div>

              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
                <span className="text-[10px] font-bold text-slate-600 uppercase block">
                  pH of Milk
                </span>

                <span className="text-base font-black text-slate-900 mt-0.5 block">
                  {cow.ph !== undefined ? cow.ph : 'N/A'}
                </span>
              </div>

              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
                <span className="text-[10px] font-bold text-slate-600 uppercase block">
                  EC of Milk
                </span>

                <span
                  className={`text-base font-black mt-0.5 block ${
                    cow.ec > 6.0 ? 'text-red-600' : 'text-slate-900'
                  }`}
                >
                  {cow.ec !== undefined ? `${cow.ec} mS/cm` : 'N/A'}
                </span>
              </div>

              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
                <span className="text-[10px] font-bold text-slate-600 uppercase block">
                  SCC of Milk
                </span>

                <span
                  className={`text-base font-black mt-0.5 block ${
                    cow.scc > 200 ? 'text-red-600' : 'text-slate-900'
                  }`}
                >
                  {cow.scc !== undefined ? `${cow.scc}k cells/mL` : 'N/A'}
                </span>
              </div>
            </div>
          </div>

          {/* Stage 2 - ONLY IF NOT NORMAL */}
          {cow.currentRisk !== 'normal' && cow.wearable && (
            <div>
              <div className="flex items-center justify-between mb-2.5">
                <div className="flex items-center gap-1.5">
                  <Activity className="w-4 h-4 text-purple-600" />

                  <h3 className="text-xs font-black uppercase tracking-wider text-slate-900">
                    Stage 2: Wearable Parameters
                  </h3>
                </div>

                {cow.wearable.batteryPercent !== undefined && (
                  <span className="text-[11px] font-semibold text-slate-600 flex items-center gap-1">
                    <Battery className="w-3.5 h-3.5 text-emerald-600" />
                    {cow.wearable.batteryPercent}%
                  </span>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
                  <span className="text-[10px] font-bold text-slate-600 uppercase block">
                    Rumination
                  </span>

                  <span className="text-base font-black text-slate-900 mt-0.5 block">
                    {cow.wearable.ruminationMinutes !== undefined
                      ? `${cow.wearable.ruminationMinutes} min/day`
                      : 'N/A'}
                  </span>

                  {cow.wearable.ruminationBaseline !== undefined && (
                    <span className="text-[10px] text-slate-500 font-medium mt-0.5 block">
                      Baseline: {cow.wearable.ruminationBaseline} min/day
                    </span>
                  )}
                </div>

                <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
                  <span className="text-[10px] font-bold text-slate-600 uppercase block">
                    Physical Activity
                  </span>

                  <span className="text-base font-black text-slate-900 mt-0.5 block capitalize">
                    {cow.wearable.activityStatus || 'normal'}
                  </span>
                </div>

                <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
                  <span className="text-[10px] font-bold text-slate-600 uppercase block">
                    Body Temperature
                  </span>

                  <span className="text-base font-black text-slate-900 mt-0.5 block">
                    {cow.wearable.bodyTemp !== undefined ? `${cow.wearable.bodyTemp}°C` : 'N/A'}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* AI Analysis Button */}
          <button
            onClick={handleAiAnalysis}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-sm font-bold transition-colors"
          >
            <Bot className="w-4 h-4" />
            AI Analysis
          </button>

          {/* AI Analysis */}
          {showAiAnalysis && (
            <div className="border border-slate-200 rounded-xl bg-slate-50 p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Bot className="w-4 h-4 text-slate-700" />

                  <h3 className="text-sm font-bold text-slate-900">AI Analysis</h3>
                </div>

                <button
                  onClick={() => fetchAiAnalysis(cow)}
                  disabled={loadingAi}
                  className="p-1.5 rounded-lg hover:bg-slate-200 text-slate-500 disabled:opacity-50"
                  title="Re-analyse"
                >
                  <RefreshCw className={`w-4 h-4 ${loadingAi ? 'animate-spin' : ''}`} />
                </button>
              </div>

              {loadingAi ? (
                <div className="flex items-center gap-2 text-xs text-slate-500">
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  Analysing screening data...
                </div>
              ) : aiError ? (
                <p className="text-xs text-red-600">{aiError}</p>
              ) : (
                <p className="text-sm text-slate-700 leading-relaxed">{aiAnalysis}</p>
              )}
            </div>
          )}

          {/* Historical Telemetry */}
          <div>
            <h3 className="text-xs font-black uppercase tracking-wider text-slate-900 mb-2">
              Historical Sensor Telemetry
            </h3>

            <CowChartWidget animal={cow} />
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 sm:p-5 border-t border-slate-200 bg-slate-50 flex items-center justify-between gap-3">
          <span className="text-xs text-slate-500 font-mono">
            Last Screened: {cow.lastScreeningDate}
          </span>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                closeAnimalProfile()
                openOutcomeModal(cow.id)
              }}
              className="px-3.5 py-2 rounded-lg text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-1.5 transition-colors"
            >
              <Stethoscope className="w-4 h-4" />
              Log Outcome
            </button>

            <button
              onClick={closeAnimalProfile}
              className="px-4 py-2 rounded-lg text-xs font-bold bg-slate-200 text-slate-800 hover:bg-slate-300 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
