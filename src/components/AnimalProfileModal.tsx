import React, { useState } from 'react'

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
  } = useHerd()

  const cow = animals.find((a) => a.id === selectedAnimalId)

  // Local AI question state in modal
  const [askAiQuery, setAskAiQuery] = useState('')
  const [aiAnswer, setAiAnswer] = useState<string | null>(null)
  const [isAiLoading, setIsAiLoading] = useState(false)

  if (!selectedAnimalId || !cow) return null

  const isSuspicious =
    cow.currentRisk === 'suspected' || cow.currentRisk === 'critical' || cow.riskScore >= 70
  const isAtRisk = cow.currentRisk === 'watch' || cow.currentRisk === 'high' || cow.ec > 5.8
  const statusLabel = isSuspicious ? 'Suspicious' : isAtRisk ? 'At Risk' : 'Healthy'

  // Observed changes calculations based on cow measurements
  const ecDeltaPct = cow.ec > 5.5 ? Math.round(((cow.ec - 5.0) / 5.0) * 100) : 0
  const phDelta = cow.ph > 6.6 ? parseFloat((cow.ph - 6.5).toFixed(1)) : 0.0
  const yieldDeltaPct = cow.dailyMilkYieldKg < 8.0 ? Math.round(((8.5 - cow.dailyMilkYieldKg) / 8.5) * 100) : 0
  const activityDeltaPct = isSuspicious ? 15 : isAtRisk ? 8 : 0

  // Natural language explanation
  const getFlaggedExplanation = () => {
    if (isSuspicious) {
      return `This cow's milk EC is above its usual level (${cow.ec} mS/cm, +${ecDeltaPct}%) and physical activity has decreased (${activityDeltaPct}%) compared with its recent pattern. Increased lying time was recorded by wearable tracking.`
    }
    if (isAtRisk) {
      return `This cow's milk EC is mildly elevated (${cow.ec} mS/cm) and milk yield is slightly down (${cow.dailyMilkYieldKg} L). Physical monitoring should be started for the next milking shift.`
    }
    return `All measured milk parameters and physical activity levels are within normal healthy thresholds.`
  }

  // History timeline
  const historyTimeline = [
    {
      period: 'Today',
      status: statusLabel,
      ec: cow.ec,
      note: isSuspicious ? 'Conductivity spike detected' : 'Routine milking',
    },
    {
      period: 'Yesterday',
      status: isSuspicious ? 'At Risk' : 'Healthy',
      ec: isSuspicious ? 6.8 : 5.1,
      note: isSuspicious ? 'Slight conductivity rise' : 'Normal',
    },
    {
      period: '2 days ago',
      status: 'Healthy',
      ec: 5.2,
      note: 'Parameters normal',
    },
    {
      period: '3 days ago',
      status: 'Healthy',
      ec: 5.0,
      note: 'Normal baseline',
    },
  ]

  const handleAskCowAi = (e: React.FormEvent) => {
    e.preventDefault()
    if (!askAiQuery.trim()) return

    setIsAiLoading(true)
    setTimeout(() => {
      let reply = ''
      const q = askAiQuery.toLowerCase()
      if (q.includes('doctor') || q.includes('vet') || q.includes('appointment')) {
        reply = `For ${cow.name}, milk conductivity is ${cow.ec} mS/cm. It is strongly recommended to schedule a doctor visit. You can click "Schedule Doctor Visit" above to book directly into Google Calendar.`
      } else if (q.includes('milk') || q.includes('ec') || q.includes('yield')) {
        reply = `${cow.name}'s milk conductivity is ${cow.ec} mS/cm (normal is below 5.5). Yield is currently ${cow.dailyMilkYieldKg} L (down ${yieldDeltaPct}% from normal baseline). Keep this milk separate from the main bulk tank.`
      } else if (q.includes('wearable') || q.includes('activity')) {
        reply = cow.wearable
          ? `Wearable is active on ${cow.name}. Rumination is ${cow.wearable.ruminationMinutes} min/day (baseline: ${cow.wearable.ruminationBaseline}), with increased lying hours observed.`
          : `No wearable is active yet for ${cow.name}. You can activate physical tracking from Today's Action page.`
      } else {
        reply = `${cow.name} (${cow.breed}, ${cow.assignedPen}) is currently flagged as ${statusLabel}. Follow standard farm protocol: inspect the udder during next milking and consult your veterinary doctor if conductivity remains elevated.`
      }
      setAiAnswer(reply)
      setIsAiLoading(false)
      setAskAiQuery('')
    }, 500)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/35 backdrop-blur-md overflow-y-auto">
      <div className="bg-white rounded-3xl border border-black/[0.08] shadow-[0_20px_60px_rgba(0,0,0,0.12)] max-w-2xl w-full my-6 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Modal Top Header */}
        <div className="p-5 sm:p-6 border-b border-black/[0.06] flex items-start justify-between bg-[#FBFBFD]">
          <div>
            <div className="flex items-center gap-2.5">
              <h2 className="text-xl sm:text-2xl font-semibold text-slate-900 tracking-tight">
                {cow.name || `Cow ${cow.tag}`}
              </h2>
              <span className="text-xs font-medium px-2.5 py-0.5 rounded-full bg-black/[0.04] text-slate-700">
                {cow.assignedPen || 'Pen 1'}
              </span>
              <span className="text-xs font-normal text-slate-500">· {cow.breed}</span>
            </div>
            <p className="text-xs text-slate-500 mt-1 font-normal">
              Age: {cow.ageYears} yrs · Lactation: #{cow.parity} · {cow.daysInMilk} Days in milk
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span
              className={`px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1.5 ${
                statusLabel === 'Suspicious'
                  ? 'bg-rose-50 text-rose-700 border border-rose-200'
                  : statusLabel === 'At Risk'
                    ? 'bg-amber-50 text-amber-800 border border-amber-200'
                    : 'bg-emerald-50 text-emerald-800 border border-emerald-200'
              }`}
            >
              <span
                className={`w-2 h-2 rounded-full ${
                  statusLabel === 'Suspicious'
                    ? 'bg-rose-600'
                    : statusLabel === 'At Risk'
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
            className={`p-4 sm:p-5 rounded-2xl border ${
              isSuspicious
                ? 'bg-red-50/60 border-red-200'
                : isAtRisk
                  ? 'bg-amber-50/60 border-amber-200'
                  : 'bg-emerald-50/60 border-emerald-200'
            }`}
          >
            <div className="flex items-center gap-2 mb-2">
              <Sparkles
                className={`w-4 h-4 ${
                  isSuspicious
                    ? 'text-red-600'
                    : isAtRisk
                      ? 'text-amber-600'
                      : 'text-emerald-600'
                }`}
              />
              <h3 className="text-sm font-bold text-slate-900">Why is this cow flagged?</h3>
            </div>

            <p className="text-xs sm:text-sm text-slate-700 leading-relaxed font-medium">
              {getFlaggedExplanation()}
            </p>

            {/* Observed Changes Section */}
            {(isSuspicious || isAtRisk) && (
              <div className="mt-4 pt-3.5 border-t border-slate-200/80">
                <div className="text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-2">
                  Observed changes:
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                  <div className="p-2.5 bg-white rounded-xl border border-slate-200 shadow-2xs">
                    <div className="text-[11px] text-slate-500">EC</div>
                    <div className="text-base font-black text-red-600 mt-0.5">
                      ↑ {ecDeltaPct > 0 ? `${ecDeltaPct}%` : 'Normal'}
                    </div>
                  </div>
                  <div className="p-2.5 bg-white rounded-xl border border-slate-200 shadow-2xs">
                    <div className="text-[11px] text-slate-500">pH</div>
                    <div className="text-base font-black text-slate-800 mt-0.5">
                      {phDelta > 0 ? `↑ ${phDelta}` : 'Normal'}
                    </div>
                  </div>
                  <div className="p-2.5 bg-white rounded-xl border border-slate-200 shadow-2xs">
                    <div className="text-[11px] text-slate-500">Milk yield</div>
                    <div className="text-base font-black text-amber-600 mt-0.5">
                      {yieldDeltaPct > 0 ? `↓ ${yieldDeltaPct}%` : 'Normal'}
                    </div>
                  </div>
                  <div className="p-2.5 bg-white rounded-xl border border-slate-200 shadow-2xs">
                    <div className="text-[11px] text-slate-500">Activity</div>
                    <div className="text-base font-black text-slate-800 mt-0.5">
                      {activityDeltaPct > 0 ? `↓ ${activityDeltaPct}%` : 'Normal'}
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
                Milk parameters
              </div>
              <div className="space-y-2 text-xs">
                <div className="flex justify-between py-1 border-b border-slate-100">
                  <span className="text-slate-500">Electrical Conductivity (EC):</span>
                  <span className="font-bold text-slate-900">
                    {cow.ec} mS/cm {cow.ec >= 6.5 ? '(↑ Above normal)' : '(Normal)'}
                  </span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-100">
                  <span className="text-slate-500">Milk pH:</span>
                  <span className="font-bold text-slate-900">
                    {cow.ph} {cow.ph > 6.7 ? '(↑ Slightly high)' : '(Normal)'}
                  </span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-100">
                  <span className="text-slate-500">Milk temperature:</span>
                  <span className="font-bold text-slate-900">{cow.milkTemp}°C (Normal)</span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-slate-500">Daily Milk yield:</span>
                  <span className="font-bold text-slate-900">
                    {cow.dailyMilkYieldKg} L {cow.dailyMilkYieldKg < 6.5 ? '(↓ Below normal)' : ''}
                  </span>
                </div>
              </div>
            </div>

            {/* Physical parameters */}
            <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs flex flex-col justify-between">
              <div>
                <div className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-3 flex items-center justify-between">
                  <span>Physical parameters</span>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                      cow.wearable
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-slate-100 text-slate-600'
                    }`}
                  >
                    {cow.wearable ? 'Wearable: Active' : 'Wearable: Pending'}
                  </span>
                </div>
                {cow.wearable ? (
                  <div className="space-y-2 text-xs">
                    <div className="flex justify-between py-1 border-b border-slate-100">
                      <span className="text-slate-500">Activity:</span>
                      <span className="font-bold text-slate-900">
                        {isSuspicious ? '↓ Reduced' : 'Normal'}
                      </span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-slate-100">
                      <span className="text-slate-500">Movement:</span>
                      <span className="font-bold text-slate-900">
                        {isSuspicious ? '↓ Reduced' : 'Normal'}
                      </span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-slate-100">
                      <span className="text-slate-500">Lying time:</span>
                      <span className="font-bold text-slate-900">
                        {isSuspicious ? '↑ Increased (14.1 hrs)' : 'Normal (10.5 hrs)'}
                      </span>
                    </div>
                    <div className="flex justify-between py-1">
                      <span className="text-slate-500">Standing:</span>
                      <span className="font-bold text-slate-900">Normal</span>
                    </div>
                  </div>
                ) : (
                  <div className="py-6 text-center text-slate-500 text-xs">
                    <Clock className="w-6 h-6 text-slate-400 mx-auto mb-1.5" />
                    <span>No active collar activity records yet.</span>
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
              Cow Health History
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
                      className={`inline-block px-2 py-0.5 rounded-md text-[11px] font-black uppercase ${
                        item.status === 'Suspicious'
                          ? 'bg-red-100 text-red-700'
                          : item.status === 'At Risk'
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
          <div className="p-4 rounded-2xl bg-slate-900 text-white shadow-xs">
            <div className="flex items-center gap-2 mb-2">
              <Bot className="w-4 h-4 text-blue-400" />
              <span className="text-xs font-bold">GauSaathi Cow Advisor</span>
            </div>

            {aiAnswer && (
              <div className="mb-3 p-3 rounded-xl bg-slate-800 text-xs text-slate-200 leading-relaxed border border-slate-700">
                {aiAnswer}
              </div>
            )}

            <form onSubmit={handleAskCowAi} className="flex items-center gap-2">
              <input
                type="text"
                value={askAiQuery}
                onChange={(e) => setAskAiQuery(e.target.value)}
                placeholder={`Ask about ${cow.name}'s milk, activity, or health...`}
                className="flex-1 bg-slate-800 text-xs rounded-xl px-3 py-2 text-white border border-slate-700 focus:outline-hidden focus:border-blue-500"
              />
              <button
                type="submit"
                disabled={isAiLoading || !askAiQuery.trim()}
                className="px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-colors disabled:opacity-50"
              >
                {isAiLoading ? 'Thinking...' : 'Ask'}
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
            Close
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
            <span>Book Doctor Visit</span>
          </button>
        </div>
      </div>
    </div>
  )
}
