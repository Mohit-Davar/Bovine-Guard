import React, { useState } from 'react'

import { useHerd } from '../context/HerdContext'
import { RiskBadge } from './RiskBadge'
import { EmptyState } from './ui/EmptyState'
import { ErrorState } from './ui/ErrorState'
import { LoadingState } from './ui/LoadingState'
import { motion } from 'framer-motion'
import { Check, CheckCircle2, Radio, RotateCcw, Stethoscope } from 'lucide-react'

export const TodaysActions: React.FC = () => {
  const {
    animals,
    tabLoading,
    tabError,
    isRetryingTab,
    retryTab,
    openOutcomeModal,
    setRfidModalOpen,
    resetToSampleData,
    addToast,
    t,
  } = useHerd()

  const [filter, setFilter] = useState<'all' | 'critical' | 'high' | 'watch'>('all')

  const [completedIds, setCompletedIds] = useState<string[]>([])

  const isLoading = tabLoading.actions
  const error = tabError.actions
  const isRetrying = isRetryingTab.actions

  if (isLoading) {
    return (
      <div className="space-y-6">
        <LoadingState
          title="Loading Today's Actions..."
          message="Prioritizing cows needing inspection or separation..."
          variant="card"
        />
      </div>
    )
  }

  if (error) {
    return (
      <div className="space-y-6">
        <ErrorState
          title="Unable to load action list"
          message={error}
          onRetry={() => retryTab('actions')}
          retryLabel={t('actionRetry')}
          isRetrying={isRetrying}
          secondaryAction={{
            label: t('actionRestoreData'),
            onClick: resetToSampleData,
          }}
        />
      </div>
    )
  }

  // Only cows requiring action are shown.
  // Normal/Low risk cows are excluded.
  const actionAnimals = animals.filter((cow) => {
    if (completedIds.includes(cow.id)) return false

    if (
      cow.currentRisk !== 'critical' &&
      cow.currentRisk !== 'high' &&
      cow.currentRisk !== 'watch' &&
      cow.currentRisk !== 'suspected' &&
      cow.currentRisk !== 'risked'
    ) {
      return false
    }

    if (filter === 'all') return true

    return cow.currentRisk === filter
  })

  const handleMarkResolved = (id: string, name: string) => {
    setCompletedIds((prev) => [...prev, id])

    addToast({
      title: 'Action Completed',
      message: `${name} marked resolved for this milking shift.`,
      type: 'success',
    })
  }

  if (animals.length === 0 || (actionAnimals.length === 0 && completedIds.length === 0)) {
    return (
      <div className="space-y-6">
        <EmptyState
          icon="shield"
          title={t('allClear')}
          description={t('allClearDesc')}
          badgeText="Healthy Milking Shift"
          primaryAction={{
            label: t('scanRfid'),
            onClick: () => setRfidModalOpen(true),
            icon: <Radio className="w-4 h-4" />,
          }}
          secondaryAction={{
            label: t('actionRestoreData'),
            onClick: () => {
              setCompletedIds([])
              resetToSampleData()
            },
            icon: <RotateCcw className="w-4 h-4" />,
          }}
        />
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Header and Quick Filters */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-base sm:text-lg font-black text-slate-900 tracking-tight">
              {t('tabActions')}
            </h2>

            <span className="text-xs font-bold bg-red-100 text-red-800 px-2 py-0.5 rounded-full">
              {actionAnimals.length} {t('needAction')}
            </span>
          </div>

          <p className="text-xs text-slate-500 mt-0.5 font-medium">{t('actionListDesc')}</p>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 flex-wrap">
          {(['all', 'critical', 'high', 'watch'] as const).map((lvl) => (
            <button
              key={lvl}
              onClick={() => setFilter(lvl)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold capitalize transition-colors ${
                filter === lvl
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {lvl === 'all'
                ? t('allFilter')
                : t(`risk${lvl.charAt(0).toUpperCase() + lvl.slice(1)}`)}
            </button>
          ))}
        </div>
      </div>

      {/* Action Cards */}
      {actionAnimals.length === 0 ? (
        <div className="bg-white rounded-xl border border-slate-200 p-8 text-center">
          <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto mb-2" />

          <h3 className="font-bold text-slate-900 text-sm">{t('allResolvedTitle')}</h3>

          <p className="text-xs text-slate-500 mt-1">{t('allResolvedDesc')}</p>

          {completedIds.length > 0 && (
            <button
              onClick={() => setCompletedIds([])}
              className="mt-4 px-3 py-1.5 rounded-lg text-xs font-bold bg-slate-100 hover:bg-slate-200 text-slate-700"
            >
              {t('resetCompleted')}
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {actionAnimals.map((cow, idx) => {
            const isCritical = cow.currentRisk === 'critical'

            return (
              <motion.div
                key={cow.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  duration: 0.2,
                  delay: idx * 0.04,
                }}
                className={`bg-white rounded-xl border-2 shadow-xs overflow-hidden ${
                  isCritical ? 'border-red-300' : 'border-slate-200'
                }`}
              >
                <div className="p-4 sm:p-5">
                  <div className="flex flex-col lg:flex-row lg:items-center gap-4">
                    {/* LEFT: COW INFORMATION */}
                    <div className="flex-1 min-w-0">
                      {/* Cow Header */}
                      <div className="flex items-center gap-2.5 flex-wrap">
                        {/* Tag */}
                        <span className="font-mono text-xs sm:text-sm font-black bg-slate-900 text-white px-2.5 py-1 rounded-md">
                          {cow.tag}
                        </span>

                        {/* Name */}
                        <span className="font-black text-slate-900 text-base">{cow.name}</span>

                        {/* Risk */}
                        <RiskBadge risk={cow.currentRisk} score={cow.riskScore} size="sm" />
                      </div>

                      {/* Basic Info */}
                      <div className="flex items-center gap-x-3 gap-y-1 mt-2 text-xs text-slate-500 font-medium flex-wrap">
                        <span>
                          {t('penLabel')}{' '}
                          <strong className="text-slate-700">{cow.assignedPen}</strong>
                        </span>

                        <span className="text-slate-300">•</span>

                        <span>
                          DIM <strong className="text-slate-700">{cow.daysInMilk}</strong>
                        </span>
                      </div>

                      {/* STAGE 1 & STAGE 2 HEALTH PARAMETERS */}
                      <div className="mt-3 space-y-2.5">
                        {/* Stage 1 */}
                        <div className="bg-slate-50 rounded-lg p-2.5 border border-slate-100">
                          <span className="block text-[10px] font-black uppercase text-blue-700 tracking-wider mb-1.5">
                            Stage 1: Milk Parameters
                          </span>

                          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                            {/* Milk Temperature */}
                            <div className="bg-white rounded-md p-2 border border-slate-200">
                              <p className="text-[10px] font-bold text-slate-400 uppercase">
                                Milk Temp
                              </p>

                              <p className="text-xs font-bold text-slate-900 mt-0.5">
                                {cow.milkTemp !== undefined ? `${cow.milkTemp}°C` : 'N/A'}
                              </p>
                            </div>

                            {/* pH */}
                            <div className="bg-white rounded-md p-2 border border-slate-200">
                              <p className="text-[10px] font-bold text-slate-400 uppercase">
                                pH of Milk
                              </p>

                              <p className="text-xs font-bold text-slate-900 mt-0.5">
                                {cow.ph !== undefined ? cow.ph : 'N/A'}
                              </p>
                            </div>

                            {/* EC */}
                            <div className="bg-white rounded-md p-2 border border-slate-200">
                              <p className="text-[10px] font-bold text-slate-400 uppercase">
                                EC of Milk
                              </p>

                              <p
                                className={`text-xs font-black mt-0.5 ${
                                  cow.ec > 6.0 ? 'text-red-600' : 'text-slate-900'
                                }`}
                              >
                                {cow.ec !== undefined ? `${cow.ec} mS/cm` : 'N/A'}
                              </p>
                            </div>

                            {/* SCC */}
                            <div className="bg-white rounded-md p-2 border border-slate-200">
                              <p className="text-[10px] font-bold text-slate-400 uppercase">
                                SCC of Milk
                              </p>

                              <p
                                className={`text-xs font-black mt-0.5 ${
                                  cow.scc > 200 ? 'text-red-600' : 'text-slate-900'
                                }`}
                              >
                                {cow.scc !== undefined ? `${cow.scc}k cells/mL` : 'N/A'}
                              </p>
                            </div>
                          </div>
                        </div>

                        {/* Stage 2 */}
                        {(cow.currentRisk === 'suspected' ||
                          cow.currentRisk === 'risked' ||
                          cow.currentRisk === 'watch' ||
                          cow.currentRisk === 'high' ||
                          cow.currentRisk === 'critical') &&
                          cow.wearable && (
                            <div className="bg-purple-50/50 rounded-lg p-2.5 border border-purple-100">
                              <span className="block text-[10px] font-black uppercase text-purple-700 tracking-wider mb-1.5">
                                Stage 2: Telemetry Parameters
                              </span>

                              <div className="grid grid-cols-3 gap-2">
                                {/* Rumination */}
                                <div className="bg-white rounded-md p-2 border border-slate-200">
                                  <p className="text-[10px] font-bold text-slate-400 uppercase">
                                    Rumination
                                  </p>

                                  <p className="text-xs font-bold text-slate-900 mt-0.5">
                                    {cow.wearable.ruminationMinutes !== undefined
                                      ? `${cow.wearable.ruminationMinutes} min/day`
                                      : 'N/A'}
                                  </p>
                                </div>

                                {/* Activity */}
                                <div className="bg-white rounded-md p-2 border border-slate-200">
                                  <p className="text-[10px] font-bold text-slate-400 uppercase">
                                    Physical Activity
                                  </p>

                                  <p className="text-xs font-bold text-slate-900 mt-0.5 capitalize">
                                    {cow.wearable.activityStatus || 'normal'}
                                  </p>
                                </div>

                                {/* Body Temperature */}
                                <div className="bg-white rounded-md p-2 border border-slate-200">
                                  <p className="text-[10px] font-bold text-slate-400 uppercase">
                                    Body Temperature
                                  </p>

                                  <p className="text-xs font-bold text-slate-900 mt-0.5">
                                    {cow.wearable.bodyTemp !== undefined
                                      ? `${cow.wearable.bodyTemp}°C`
                                      : 'N/A'}
                                  </p>
                                </div>
                              </div>
                            </div>
                          )}
                      </div>
                    </div>

                    {/* RIGHT: ACTIONS */}
                    <div className="lg:w-[210px] shrink-0 lg:border-l lg:border-slate-100 lg:pl-4">
                      <div className="flex flex-col gap-2">
                        {/* Veterinary Outcome */}
                        <button
                          onClick={() => openOutcomeModal(cow.id)}
                          className="w-full px-3 py-2.5 rounded-lg text-xs font-bold bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-200 flex items-center justify-center gap-1.5 transition-colors"
                        >
                          <Stethoscope className="w-3.5 h-3.5 text-blue-600" />

                          <span>{t('actionLogOutcome')}</span>
                        </button>

                        {/* Mark Resolved */}
                        <button
                          onClick={() => handleMarkResolved(cow.id, cow.name)}
                          className="w-full px-3 py-2.5 rounded-lg text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white flex items-center justify-center gap-1.5 shadow-2xs transition-colors"
                        >
                          <Check className="w-3.5 h-3.5" />

                          <span>{t('actionDone')}</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )
          })}
        </div>
      )}
    </div>
  )
}
