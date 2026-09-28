import React, { useState, useEffect } from 'react'

import { useHerd } from '../context/HerdContext'
import { Animal } from '../types'
import { CowChartWidget } from './CowChartWidget'
import {
  Activity,
  AlertTriangle,
  Bot,
  Calendar,
  CheckCircle2,
  Clock,
  Droplets,
  Flame,
  Radio,
  Send,
  Sparkles,
  Loader2,
  Stethoscope,
  TrendingDown,
  TrendingUp,
  X,
  Zap,
} from 'lucide-react'

export const AnimalProfileModal: React.FC = () => {
  const {
    selectedAnimalId,
    closeAnimalProfile,
    animals,
    openAppointmentModal,
    t,
    language,
  } = useHerd()

  const cow = animals.find((a) => a.id === selectedAnimalId)

  // Local AI question state in modal
  const [askAiQuery, setAskAiQuery] = useState('')
  const [aiAnswer, setAiAnswer] = useState<string | null>(null)
  const [isAiLoading, setIsAiLoading] = useState(false)

  const [aiObservation, setAiObservation] = useState<string | null>(null)
  const [isObservationLoading, setIsObservationLoading] = useState(false)

  useEffect(() => {
    if (!cow) return
    let isMounted = true

    const fetchObservation = async () => {
      setIsObservationLoading(true)
      try {
        const response = await fetch('/api/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            message: `Provide a very brief 1-2 sentence GauSaathi observation for cow ${cow.name || cow.tag} based on their current sensor values. Speak like a helpful vet assistant to a farmer. Tell them exactly what to do. Example: "GauSaathi observation: Conductivity is mildly above baseline. Keep this cow under observation during the next milking shift."\n\nIMPORTANT: You must respond in the following language: ${language}.`,
            language,
            history: [],
            animals: [{
              name: cow.name,
              tag: cow.tag,
              breed: cow.breed,
              pen: cow.assignedPen,
              risk: cow.currentRisk,
              riskScore: cow.riskScore,
              ec: cow.ec,
              ph: cow.ph,
              milkTemp: cow.milkTemp,
              dailyMilkYieldKg: cow.dailyMilkYieldKg,
              wearableActivity: cow.wearable?.activityStatus ?? 'not monitored',
            }],
          }),
        })
        const result = (await response.json()) as { reply?: unknown }
        if (response.ok && typeof result.reply === 'string' && isMounted) {
          setAiObservation(result.reply.trim())
        }
      } catch (e) {
        // Fallback or ignore
      } finally {
        if (isMounted) setIsObservationLoading(false)
      }
    }
    
    fetchObservation()

    return () => {
      isMounted = false
    }
  }, [selectedAnimalId, language])

  if (!selectedAnimalId || !cow) return null

  const cowName = cow.name || `${t('cowLabel')} ${cow.tag}`

  const isSuspicious =
    cow.currentRisk === 'suspected' || cow.currentRisk === 'critical' || cow.riskScore >= 70
  const isAtRisk = cow.currentRisk === 'watch' || cow.currentRisk === 'high' || cow.ec > 5.8
  const statusLabel = isSuspicious
    ? t('statusSuspicious')
    : isAtRisk
      ? t('statusAtRisk')
      : t('statusHealthy')

  // Observed changes calculations based on cow measurements
  const ecDeltaPct = cow.ec > 5.5 ? Math.round(((cow.ec - 5.0) / 5.0) * 100) : 0
  const phDelta = cow.ph > 6.6 ? parseFloat((cow.ph - 6.5).toFixed(1)) : 0.0
  const yieldDeltaPct = cow.dailyMilkYieldKg < 8.0 ? Math.round(((8.5 - cow.dailyMilkYieldKg) / 8.5) * 100) : 0
  const activityDeltaPct = isSuspicious ? 15 : isAtRisk ? 8 : 0

  // Natural language explanation
  const getFlaggedExplanation = () => {
    if (isSuspicious) {
      return t('flaggedExplanationSuspicious', {
        ec: cow.ec,
        delta: ecDeltaPct,
        activity: activityDeltaPct,
      })
    }
    if (isAtRisk) {
      return t('flaggedExplanationAtRisk', { ec: cow.ec, yield: cow.dailyMilkYieldKg })
    }
    return t('flaggedExplanationHealthy')
  }

  // History timeline
  const historyTimeline = [
    {
      period: t('today'),
      category: 'suspicious' as const,
      status: statusLabel,
      ec: cow.ec,
      note: isSuspicious ? t('conductivitySpikeDetected') : t('routineMilking'),
    },
    {
      period: t('yesterday'),
      category: isSuspicious ? 'risk' as const : 'healthy' as const,
      status: isSuspicious ? t('statusAtRisk') : t('statusHealthy'),
      ec: isSuspicious ? 6.8 : 5.1,
      note: isSuspicious ? t('slightConductivityRise') : t('normalValue'),
    },
    {
      period: t('twoDaysAgo'),
      category: 'healthy' as const,
      status: t('statusHealthy'),
      ec: 5.2,
      note: t('parametersNormal'),
    },
    {
      period: t('threeDaysAgo'),
      category: 'healthy' as const,
      status: t('statusHealthy'),
      ec: 5.0,
      note: t('normalBaseline'),
    },
  ]

  const handleAskCowAi = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!askAiQuery.trim() || isAiLoading) return

    setIsAiLoading(true)
    const currentQuery = askAiQuery

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: `You are an AI assistant for a bovine mastitis detection system. Explain the situation clearly in simple, everyday farming language. DO NOT confuse the farmer with raw sensor numbers like EC or pH. Instead, translate these into practical insights (e.g., "milk seems abnormal" or "showing signs of infection"). Tell them what they need to know and what actions to take. \n\nIMPORTANT: You must respond in the following language: ${language}.\n\nUser's question about cow ${cowName}: ${currentQuery}`,
          language,
          history: [],
          animals: [cow].map((animal) => ({
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
      
      setAiAnswer(result.reply.trim())
      setAskAiQuery('')
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : t('chatError')
      setAiAnswer(typeof errorMessage === 'string' ? errorMessage : 'Error occurred.')
    } finally {
      setIsAiLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/35 backdrop-blur-md overflow-y-auto">
      <div className="bg-white rounded-3xl border border-black/[0.08] shadow-[0_20px_60px_rgba(0,0,0,0.12)] max-w-2xl w-full my-6 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Modal Top Header */}
        <div className="p-5 sm:p-6 border-b border-black/[0.06] flex items-start justify-between bg-[#FBFBFD]">
          <div>
            <div className="flex items-center gap-2.5">
              <h2 className="text-xl sm:text-2xl font-semibold text-slate-900 tracking-tight">
                {cowName}
              </h2>
              <span className="text-xs font-medium px-2.5 py-0.5 rounded-full bg-black/[0.04] text-slate-700">
                {cow.assignedPen || 'Pen 1'}
              </span>
              <span className="text-xs font-normal text-slate-500">· {cow.breed}</span>
            </div>
            <p className="text-xs text-slate-500 mt-1 font-normal">
              {t('ageLabel')}: {cow.ageYears} · {t('lactationLabel')}: #{cow.parity} · {cow.daysInMilk} {t('daysInMilkLabel')}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span
              className={`px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1.5 ${isSuspicious
                ? 'bg-rose-50 text-rose-700 border border-rose-200'
                : isAtRisk
                  ? 'bg-amber-50 text-amber-800 border border-amber-200'
                  : 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                }`}
            >
              <span
                className={`w-2 h-2 rounded-full ${isSuspicious
                  ? 'bg-rose-600'
                  : isAtRisk
                    ? 'bg-amber-500'
                    : 'bg-emerald-500'
                  }`}
              />
              <span>{statusLabel}</span>
            </span>

            <button
              onClick={closeAnimalProfile}
              className="w-8 h-8 rounded-full bg-black/[0.04] hover:bg-black/[0.08] text-slate-500 hover:text-slate-800 flex items-center justify-center transition-colors ml-1"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-5 sm:p-6 space-y-6 max-h-[75vh] overflow-y-auto">
          {/* ==================================================== */}
          {/* WHY IS THIS COW FLAGGED?                             */}
          {/* ==================================================== */}
          <div
            className={`p-4 sm:p-5 rounded-2xl border ${isSuspicious
              ? 'bg-red-50/60 border-red-200'
              : isAtRisk
                ? 'bg-amber-50/60 border-amber-200'
                : 'bg-emerald-50/60 border-emerald-200'
              }`}
          >
            <div className="flex items-center gap-2 mb-2">
              <Sparkles
                className={`w-4 h-4 ${isSuspicious
                  ? 'text-red-600'
                  : isAtRisk
                    ? 'text-amber-600'
                    : 'text-emerald-600'
                  }`}
              />
              <h3 className="text-sm font-bold text-slate-900">GauSaathi AI Observation</h3>
            </div>

            <p className="text-xs sm:text-sm text-slate-700 leading-relaxed font-medium min-h-[40px]">
              {isObservationLoading ? (
                 <span className="flex items-center gap-2"><Loader2 className="w-4 h-4 animate-spin text-blue-600" /> Analyzing cow data...</span>
              ) : (
                 aiObservation || getFlaggedExplanation()
              )}
            </p>

            {/* Observed Changes Section */}
            {(isSuspicious || isAtRisk) && (
              <div className="mt-4 pt-3.5 border-t border-slate-200/80">
                <div className="text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-2">
                  {t('observedChanges')}
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                  <div className="p-2.5 bg-white rounded-xl border border-slate-200 shadow-2xs">
                    <div className="text-[11px] text-slate-500">EC</div>
                    <div className="text-base font-black text-red-600 mt-0.5">
                      ↑ {ecDeltaPct > 0 ? `${ecDeltaPct}%` : t('normalValue')}
                    </div>
                  </div>
                  <div className="p-2.5 bg-white rounded-xl border border-slate-200 shadow-2xs">
                    <div className="text-[11px] text-slate-500">pH</div>
                    <div className="text-base font-black text-slate-800 mt-0.5">
                      {phDelta > 0 ? `↑ ${phDelta}` : t('normalValue')}
                    </div>
                  </div>
                  <div className="p-2.5 bg-white rounded-xl border border-slate-200 shadow-2xs">
                    <div className="text-[11px] text-slate-500">Milk yield</div>
                    <div className="text-base font-black text-amber-600 mt-0.5">
                      {yieldDeltaPct > 0 ? `↓ ${yieldDeltaPct}%` : t('normalValue')}
                    </div>
                  </div>
                  <div className="p-2.5 bg-white rounded-xl border border-slate-200 shadow-2xs">
                    <div className="text-[11px] text-slate-500">Activity</div>
                    <div className="text-base font-black text-slate-800 mt-0.5">
                      {activityDeltaPct > 0 ? `↓ ${activityDeltaPct}%` : t('normalValue')}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* ==================================================== */}
          {/* CURRENT MEASUREMENT PARAMETERS                      */}
          {/* ==================================================== */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Milk parameters */}
            <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs">
              <div className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-3">
                {t('milkParameters')}
              </div>
              <div className="space-y-2 text-xs">
                <div className="flex justify-between py-1 border-b border-slate-100">
                  <span className="text-slate-500">{t('electricalConductivity')}:</span>
                  <span className="font-bold text-slate-900">
                    {cow.ec} mS/cm {cow.ec >= 6.5 ? `(↑ ${t('aboveNormal')})` : `(${t('normalValue')})`}
                  </span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-100">
                  <span className="text-slate-500">{t('phLabel')}:</span>
                  <span className="font-bold text-slate-900">
                    {cow.ph} {cow.ph > 6.7 ? `(↑ ${t('slightlyHigh')})` : `(${t('normalValue')})`}
                  </span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-100">
                  <span className="text-slate-500">{t('tempLabel')}:</span>
                  <span className="font-bold text-slate-900">{cow.milkTemp}°C ({t('normalValue')})</span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-slate-500">{t('yieldLabel')}:</span>
                  <span className="font-bold text-slate-900">
                    {cow.dailyMilkYieldKg} L {cow.dailyMilkYieldKg < 6.5 ? `(↓ ${t('belowNormal')})` : ''}
                  </span>
                </div>
              </div>
            </div>

            {/* Physical parameters */}
            <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs flex flex-col justify-between">
              <div>
                <div className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-3 flex items-center justify-between">
                  <span>{t('physicalParameters')}</span>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${cow.wearable
                      ? 'bg-emerald-100 text-emerald-800'
                      : 'bg-slate-100 text-slate-600'
                      }`}
                  >
                    {cow.wearable ? `${t('wearableActive')}: ${t('activeWearable')}` : `${t('wearableActive')}: ${t('pendingStart')}`}
                  </span>
                </div>
                {cow.wearable ? (
                  <div className="space-y-2 text-xs">
                    <div className="flex justify-between py-1 border-b border-slate-100">
                      <span className="text-slate-500">{t('activityLabel')}:</span>
                      <span className="font-bold text-slate-900">
                        {isSuspicious ? `↓ ${t('reduced')}` : t('normalValue')}
                      </span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-slate-100">
                      <span className="text-slate-500">{t('movementLabel')}:</span>
                      <span className="font-bold text-slate-900">
                        {isSuspicious ? `↓ ${t('reduced')}` : t('normalValue')}
                      </span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-slate-100">
                      <span className="text-slate-500">{t('lyingLabel')}:</span>
                      <span className="font-bold text-slate-900">
                        {isSuspicious ? `↑ ${t('increased')} (14.1 hrs)` : `${t('normalValue')} (10.5 hrs)`}
                      </span>
                    </div>
                    <div className="flex justify-between py-1">
                      <span className="text-slate-500">{t('standingLabel')}:</span>
                      <span className="font-bold text-slate-900">{t('normalValue')}</span>
                    </div>
                  </div>
                ) : (
                  <div className="py-6 text-center text-slate-500 text-xs">
                    <Clock className="w-6 h-6 text-slate-400 mx-auto mb-1.5" />
                    <span>{t('noWearableRecords')}</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* ==================================================== */}
          {/* 5-DAY MEASUREMENT CHART WIDGET                      */}
          {/* ==================================================== */}
          <CowChartWidget animal={cow} />

          {/* ==================================================== */}
          {/* COW HISTORY TIMELINE                                */}
          {/* ==================================================== */}
          <div className="p-4 sm:p-5 rounded-2xl bg-white border border-slate-200 shadow-xs">
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-3">
              {t('cowHealthHistory')}
            </h3>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              {historyTimeline.map((item, idx) => (
                <div
                  key={idx}
                  className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 flex flex-col justify-between"
                >
                  <div className="text-[11px] font-bold text-slate-500">{item.period}</div>
                  <div className="my-1.5">
                    <span
                      className={`inline-block px-2 py-0.5 rounded-md text-[11px] font-black uppercase ${item.status === t('statusSuspicious')
                        ? 'bg-red-100 text-red-700'
                        : item.status === t('statusAtRisk')
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-emerald-100 text-emerald-800'
                        }`}
                    >
                      {item.status}
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-500 font-mono">EC: {item.ec}</div>
                </div>
              ))}
            </div>
          </div>

          {/* ==================================================== */}
          {/* AI ASSISTANT PANEL INSIDE COW DETAIL                */}
          {/* ==================================================== */}
          <div className="p-4 rounded-2xl bg-blue-50/50 border border-blue-100 text-slate-800 shadow-xs">
            <div className="flex items-center gap-2 mb-2">
              <Bot className="w-4 h-4 text-blue-600" />
              <span className="text-xs font-bold text-blue-900">{t('aiAdvisorTitle')}</span>
            </div>

            {aiAnswer && (
              <div className="mb-3 p-3 rounded-xl bg-white text-xs text-slate-700 leading-relaxed border border-blue-100 shadow-sm">
                {aiAnswer}
              </div>
            )}

            <form onSubmit={handleAskCowAi} className="flex items-center gap-2">
              <input
                type="text"
                value={askAiQuery}
                onChange={(e) => setAskAiQuery(e.target.value)}
                placeholder={t('askCowPlaceholder', { name: cowName })}
                className="flex-1 bg-white text-xs rounded-xl px-3 py-2 text-slate-800 border border-blue-200 focus:outline-hidden focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />
              <button
                type="submit"
                disabled={isAiLoading || !askAiQuery.trim()}
                className="px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-colors disabled:opacity-50"
              >
                {isAiLoading ? t('thinking') : t('askButton')}
              </button>
            </form>
          </div>
        </div>

        {/* Modal Bottom Footer / Actions */}
        <div className="p-4 sm:p-5 border-t border-black/[0.06] bg-[#FBFBFD] flex flex-wrap items-center justify-between gap-3">
          <button
            type="button"
            onClick={closeAnimalProfile}
            className="px-4 py-2 text-xs font-medium text-slate-600 hover:text-slate-900 hover:bg-black/[0.04] rounded-full transition-colors"
          >
            {t('close')}
          </button>

          <button
            type="button"
            onClick={() => {
              closeAnimalProfile()
              openAppointmentModal(cow)
            }}
            className="px-4 py-2 rounded-full bg-[#1D1D1F] hover:bg-black text-white font-medium text-xs flex items-center gap-2 shadow-sm transition-all"
          >
            <Calendar className="w-3.5 h-3.5 text-blue-400" />
            <span>{t('scheduleVet')}</span>
          </button>
        </div>
      </div>
    </div>
  )
}
