import React, { useState } from 'react'

import { useHerd } from '../context/HerdContext'
import { Animal } from '../types'
import { EmptyState } from './ui/EmptyState'
import { ErrorState } from './ui/ErrorState'
import { LoadingState } from './ui/LoadingState'
import { motion } from 'framer-motion'
import {
  Calendar,
  Check,
  Clock,
  Eye,
  Play,
  RotateCcw,
} from 'lucide-react'

export const TodaysActions: React.FC = () => {
  const {
    animals,
    tabLoading,
    tabError,
    isRetryingTab,
    retryTab,
    openAnimalProfile,
    openAppointmentModal,
    resetToSampleData,
    addToast,
    t,
  } = useHerd()

  const [resolvedIds, setResolvedIds] = useState<string[]>([])
  const [monitoringStartedIds, setMonitoringStartedIds] = useState<string[]>([])

  const isLoading = tabLoading.actions
  const error = tabError.actions
  const isRetrying = isRetryingTab.actions

  if (isLoading) {
    return (
      <div className="py-12">
        <LoadingState
          title={t('tabActions')}
          message={t('thinking')}
          variant="card"
        />
      </div>
    )
  }

  if (error) {
    return (
      <div className="py-12">
        <ErrorState
          title={t('tabActions')}
          message={error}
          onRetry={() => retryTab('actions')}
          retryLabel={t('reset')}
          isRetrying={isRetrying}
          secondaryAction={{
            label: t('reset'),
            onClick: resetToSampleData,
          }}
        />
      </div>
    )
  }

  // Flagged cows needing attention: Suspicious or At Risk
  const flaggedCows = animals.filter(
    (cow) =>
      (cow.currentRisk === 'suspected' ||
        cow.currentRisk === 'watch' ||
        cow.currentRisk === 'critical' ||
        cow.currentRisk === 'high' ||
        cow.ec > 5.8) &&
      !resolvedIds.includes(cow.id),
  )

  const handleStartMonitoring = (cow: Animal) => {
    setMonitoringStartedIds((prev) => [...prev, cow.id])
    addToast({
      title: t('startMonitoring'),
      message: `${cow.name || `Cow ${cow.tag}`} - ${t('wearableActive')}`,
      type: 'success',
      animalId: cow.id,
    })
  }

  const handleResolve = (cow: Animal) => {
    setResolvedIds((prev) => [...prev, cow.id])
    addToast({
      title: t('markResolved'),
      message: `${cow.name || `Cow ${cow.tag}`} ${t('markResolved').toLowerCase()}.`,
      type: 'info',
      animalId: cow.id,
    })
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-3 bg-white p-6 sm:p-8 rounded-3xl border border-black/[0.06] shadow-[0_2px_12px_rgba(0,0,0,0.02)]">
        <div>
          <h1 className="text-2xl sm:text-3xl font-semibold text-slate-900 tracking-tight">
            {t('tabActions')}
          </h1>
          <p className="text-xs text-slate-500 font-normal mt-1">
            {flaggedCows.length > 0
              ? `${flaggedCows.length} ${t('tabAnimals').toLowerCase()} ${t('actionNeeded').toLowerCase()}`
              : t('resolvedCount')}
          </p>
        </div>

        {resolvedIds.length > 0 && (
          <div className="flex items-center gap-3">
            <span className="text-xs font-normal text-emerald-700 bg-emerald-50 border border-emerald-200/80 px-3.5 py-1.5 rounded-full">
              ✓ {resolvedIds.length} {t('resolvedCount')}
            </span>
            <button
              onClick={() => setResolvedIds([])}
              className="text-xs font-normal text-slate-500 hover:text-slate-900 underline transition-colors"
            >
              {t('reset')}
            </button>
          </div>
        )}
      </div>

      {/* When All Clear */}
      {flaggedCows.length === 0 ? (
        <EmptyState
          icon="shield"
          title={t('resolvedCount')}
          description={t('normalParams')}
          primaryAction={{
            label: t('reset'),
            onClick: resetToSampleData,
            icon: <RotateCcw className="w-4 h-4" />,
          }}
        />
      ) : (
        /* Action Cards Grid */
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 sm:gap-6">
          {flaggedCows.map((cow) => {
            const isSuspicious =
              cow.currentRisk === 'suspected' ||
              cow.currentRisk === 'critical' ||
              cow.riskScore >= 70
            const statusLabel = isSuspicious ? t('statusSuspicious') : t('statusAtRisk')

            const hasActiveWearable =
              Boolean(cow.wearable) || monitoringStartedIds.includes(cow.id)

            // Dynamic parameter formatting
            const ecState =
              cow.ec >= 7.0
                ? 'High'
                : cow.ec >= 6.0
                  ? 'Elevated'
                  : cow.ec >= 5.5
                    ? 'Above normal'
                    : 'Normal'
            const phState = cow.ph > 6.7 ? 'Above normal' : 'Normal'
            const milkTempState = cow.milkTemp > 38.8 ? 'Elevated' : 'Normal'

            return (
              <motion.div
                key={cow.id}
                layout
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.98 }}
                className={`bg-white rounded-3xl border p-6 sm:p-7 shadow-[0_2px_12px_rgba(0,0,0,0.02)] flex flex-col justify-between transition-all duration-200 ${
                  isSuspicious
                    ? 'border-rose-200/90 hover:border-rose-300'
                    : 'border-black/[0.06] hover:border-black/[0.12]'
                }`}
              >
                <div>
                  {/* Cow Title, Pen, Breed, Status */}
                  <div className="flex items-start justify-between pb-4 border-b border-black/[0.04]">
                    <div>
                      <div className="flex items-center gap-2.5">
                        <span className="text-lg font-semibold text-slate-900 tracking-tight">
                          {cow.name || `Cow ${cow.tag}`}
                        </span>
                        <span className="text-xs font-normal text-slate-500">
                          {cow.assignedPen || 'Pen 1'}
                        </span>
                      </div>
                      <div className="text-xs font-normal text-slate-500 mt-1">
                        {t('breedLabel')}: <span className="text-slate-800">{cow.breed}</span>
                      </div>
                    </div>

                    <span
                      className={`text-xs font-medium flex items-center gap-1.5 ${
                        isSuspicious ? 'text-rose-600' : 'text-amber-700'
                      }`}
                    >
                      <span
                        className={`w-2 h-2 rounded-full ${
                          isSuspicious ? 'bg-rose-500' : 'bg-amber-500'
                        }`}
                      />
                      <span>{statusLabel}</span>
                    </span>
                  </div>

                  {/* Two Parameter Sections */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 my-5">
                    {/* Milk parameters */}
                    <div className="p-4 rounded-2xl bg-[#FBFBFD] border border-black/[0.04]">
                      <div className="text-xs font-medium text-slate-800 mb-3 flex items-center justify-between">
                        <span>{t('milkChecks')}</span>
                        <span className="text-slate-400 font-normal">Shift Check</span>
                      </div>
                      <div className="space-y-2 text-xs">
                        <div className="flex items-center justify-between">
                          <span className="text-slate-500">{t('ecLabel')}:</span>
                          <span
                            className={`font-semibold ${
                              cow.ec >= 7.0
                                ? 'text-rose-600'
                                : cow.ec >= 6.0
                                  ? 'text-amber-600'
                                  : 'text-slate-800'
                            }`}
                          >
                            {cow.ec} ({ecState})
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-slate-500">{t('phLabel')}:</span>
                          <span className="font-normal text-slate-800">
                            {cow.ph} ({phState})
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-slate-500">{t('tempLabel')}:</span>
                          <span className="font-normal text-slate-800">
                            {cow.milkTemp}°C ({milkTempState})
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-slate-500">{t('yieldLabel')}:</span>
                          <span className="font-normal text-slate-800">
                            {cow.dailyMilkYieldKg} L (
                            {cow.dailyMilkYieldKg < 6.5 ? '↓ Below normal' : 'Normal'})
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Physical parameters */}
                    <div className="p-4 rounded-2xl bg-[#FBFBFD] border border-black/[0.04] flex flex-col justify-between">
                      <div>
                        <div className="text-xs font-medium text-slate-800 mb-3 flex items-center justify-between">
                          <span>{t('physicalChecks')}</span>
                          <span
                            className={`text-xs font-normal ${
                              hasActiveWearable
                                ? 'text-emerald-700'
                                : 'text-slate-500'
                            }`}
                          >
                            {hasActiveWearable ? t('activeWearable') : t('pendingStart')}
                          </span>
                        </div>

                        {hasActiveWearable ? (
                          <div className="space-y-2 text-xs">
                            <div className="flex items-center justify-between">
                              <span className="text-slate-500">{t('activityLabel')}:</span>
                              <span
                                className={`font-medium ${
                                  cow.wearable?.activityStatus === 'lethargic'
                                    ? 'text-rose-600'
                                    : 'text-slate-800'
                                }`}
                              >
                                {cow.wearable?.activityStatus === 'lethargic'
                                  ? 'Low (↓)'
                                  : cow.wearable?.activityStatus === 'restless'
                                    ? 'Restless'
                                    : 'Normal'}
                              </span>
                            </div>
                            <div className="flex items-center justify-between">
                              <span className="text-slate-500">{t('movementLabel')}:</span>
                              <span className="font-normal text-slate-800">
                                {isSuspicious ? 'Reduced' : 'Normal'}
                              </span>
                            </div>
                            <div className="flex items-center justify-between">
                              <span className="text-slate-500">{t('lyingLabel')}:</span>
                              <span className="font-normal text-slate-800">
                                {isSuspicious ? 'Increased (↑)' : 'Normal'}
                              </span>
                            </div>
                            <div className="flex items-center justify-between">
                              <span className="text-slate-500">{t('standingLabel')}:</span>
                              <span className="font-normal text-slate-800">Normal</span>
                            </div>
                          </div>
                        ) : (
                          <div className="py-4 text-center">
                            <Clock className="w-5 h-5 text-slate-400 mx-auto mb-1.5" />
                            <div className="text-xs font-medium text-slate-700">{t('pendingStart')}</div>
                            <div className="text-[11px] text-slate-400 font-normal mt-0.5">
                              {t('pendingWearable')}
                            </div>
                          </div>
                        )}
                      </div>

                      {!hasActiveWearable && (
                        <button
                          type="button"
                          onClick={() => handleStartMonitoring(cow)}
                          className="mt-3 w-full py-2 px-3 rounded-full bg-[#1D1D1F] hover:bg-black text-white font-medium text-xs flex items-center justify-center gap-1.5 transition-all shadow-sm"
                        >
                          <Play className="w-3 h-3" />
                          <span>{t('startMonitoring')}</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                {/* Card Actions Bottom Bar */}
                <div className="pt-4 border-t border-black/[0.04] flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => openAnimalProfile(cow.id)}
                      className="px-4 py-2 rounded-full bg-black/[0.04] hover:bg-black/[0.08] text-slate-800 text-xs font-medium transition-colors flex items-center gap-1.5"
                    >
                      <Eye className="w-3.5 h-3.5 text-slate-500" />
                      <span>{t('viewCow')}</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => openAppointmentModal(cow)}
                      className="px-4 py-2 rounded-full bg-[#1D1D1F] hover:bg-black text-white text-xs font-medium transition-all shadow-sm flex items-center gap-1.5 active:scale-98"
                    >
                      <Calendar className="w-3.5 h-3.5 text-blue-400" />
                      <span>{t('scheduleVet')}</span>
                    </button>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleResolve(cow)}
                    className="px-3.5 py-2 rounded-full text-slate-500 hover:text-emerald-700 hover:bg-emerald-50 text-xs font-medium transition-colors flex items-center gap-1 ml-auto"
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>{t('markResolved')}</span>
                  </button>
                </div>
              </motion.div>
            )
          })}
        </div>
      )}
    </div>
  )
}
