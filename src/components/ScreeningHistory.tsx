import React, { useState } from 'react'

import { useHerd } from '../context/HerdContext'
import { RiskLevel } from '../types'
import { RiskBadge } from './RiskBadge'
import { EmptyState } from './ui/EmptyState'
import { ErrorState } from './ui/ErrorState'
import { LoadingState } from './ui/LoadingState'
import { Download, RotateCcw } from 'lucide-react'

export const ScreeningHistory: React.FC = () => {
  const {
    screenings,
    animals,
    tabLoading,
    tabError,
    isRetryingTab,
    retryTab,
    openAnimalProfile,
    resetToSampleData,
    addToast,
    t,
  } = useHerd()

  const [selectedRisk, setSelectedRisk] = useState<RiskLevel | 'all'>('all')

  const isLoading = tabLoading.screenings
  const error = tabError.screenings
  const isRetrying = isRetryingTab.screenings

  // Render Loading State
  if (isLoading) {
    return (
      <div className="space-y-6">
        <LoadingState
          title="Loading 2-Stage Health Audit Log..."
          message="Synchronizing Stage 1 milk screening parameters and Stage 2 wearable telemetry..."
          variant="table"
          rows={5}
        />
      </div>
    )
  }

  // Render Error State
  if (error) {
    return (
      <div className="space-y-6">
        <ErrorState
          title="Failed to Load Screening Records"
          message={error}
          errorCode="ERR_SCREENING_STORAGE_500"
          onRetry={() => retryTab('screenings')}
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

  // Render Empty State (No records in log)
  if (screenings.length === 0) {
    return (
      <div className="space-y-6">
        <EmptyState
          icon="calendar"
          title="No Screening Records Recorded"
          description="No screenings recorded for today. Records are generated when cow RFID tags are scanned at milking parlor stations."
          badgeText="Screening Log Ready"
          primaryAction={{
            label: t('actionRestoreData'),
            onClick: resetToSampleData,
            icon: <RotateCcw className="w-4 h-4" />,
          }}
        />
      </div>
    )
  }

  const filteredScreenings = screenings.filter(
    (s) => selectedRisk === 'all' || s.riskLevel === selectedRisk,
  )

  const handleExportCsv = () => {
    const headers = [
      'Timestamp',
      'Tag',
      'Name',
      'Risk Level',
      'Risk Score',
      'SCC (k/ml)',
      'EC (mS/cm)',
      'pH',
      'Milk Temp',
      'Station',
    ]
    const rows = filteredScreenings.map((s) => [
      s.timestamp,
      s.animalTag,
      s.animalName,
      s.riskLevel,
      s.riskScore,
      s.scc,
      s.ec,
      s.ph,
      s.milkTemp || 38.6,
      `"${s.parlorStation}"`,
    ])

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((e) => e.join(','))].join('\n')
    const encodedUri = encodeURI(csvContent)
    const link = document.createElement('a')
    link.setAttribute('href', encodedUri)
    link.setAttribute('download', `screening-log-${new Date().toISOString().slice(0, 10)}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)

    addToast({
      title: t('csvExportTitle'),
      message: `Exported ${filteredScreenings.length} screening audit records.`,
      type: 'success',
    })
  }

  return (
    <div className="space-y-6">
      {/* Header and Controls */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <h2 className="text-base sm:text-lg font-black text-slate-900 tracking-tight">
              {t('screeningLog')}
            </h2>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {/* Risk Filters */}
          <div className="flex items-center bg-slate-100 p-1 rounded-lg border border-slate-200">
            {(['all', 'critical', 'high', 'watch', 'low'] as const).map((lvl) => (
              <button
                key={lvl}
                onClick={() => setSelectedRisk(lvl)}
                className={`px-2.5 py-1 rounded text-xs font-bold capitalize transition-colors ${
                  selectedRisk === lvl
                    ? 'bg-white text-slate-900 shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {lvl}
              </button>
            ))}
          </div>

          <button
            onClick={handleExportCsv}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-slate-900 text-white hover:bg-slate-800 transition-colors shadow-xs"
          >
            <Download className="w-3.5 h-3.5" />
            <span>{t('exportCsv')}</span>
          </button>
        </div>
      </div>

      {/* Screenings Table */}
      {filteredScreenings.length === 0 ? (
        <EmptyState
          icon="search"
          title={`No Records Matching "${selectedRisk.toUpperCase()}"`}
          description="There are no screening audit events matching the selected filter."
          primaryAction={{
            label: t('showAllRecords'),
            onClick: () => setSelectedRisk('all'),
          }}
        />
      ) : (
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="py-3 px-4">Time & Station</th>
                  <th className="py-3 px-4">Cow / RFID</th>
                  <th className="py-3 px-4">Risk Level</th>
                  <th className="py-3 px-4 bg-blue-50/50 border-x border-blue-100 text-blue-900">
                    Milk Parameters
                  </th>
                  <th className="py-3 px-4 bg-purple-50/50 text-purple-900">Physical Parameters</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {filteredScreenings.map((rec) => {
                  const cow = animals.find((a) => a.id === rec.animalId || a.tag === rec.animalTag)
                  const isStage2 =
                    (rec.riskLevel === 'suspected' ||
                      rec.riskLevel === 'risked' ||
                      rec.riskLevel === 'watch' ||
                      rec.riskLevel === 'high' ||
                      rec.riskLevel === 'critical') &&
                    cow?.wearable

                  return (
                    <tr key={rec.id} className="hover:bg-slate-50/80 transition-colors">
                      {/* Timestamp & Parlor Station */}
                      <td className="py-3.5 px-4 text-slate-600">
                        <div className="font-bold text-slate-900">{rec.timestamp}</div>
                        <div className="text-[11px] text-slate-400 font-mono">
                          {rec.parlorStation}
                        </div>
                      </td>

                      {/* Cow Name & Tag */}
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-slate-900">{rec.animalName}</div>
                        <div className="font-mono text-slate-500 text-[11px]">{rec.animalTag}</div>
                      </td>

                      {/* Risk Badge */}
                      <td className="py-3.5 px-4">
                        <RiskBadge risk={rec.riskLevel} score={rec.riskScore} size="sm" />
                      </td>

                      {/* Stage 1 Milk Parameters Group */}
                      <td className="py-3.5 px-4 bg-blue-50/20 border-x border-blue-100/60 font-mono text-[11px]">
                        <div className="grid grid-cols-2 gap-x-3 gap-y-0.5">
                          <div>
                            <span className="text-slate-400 font-sans">Temp: </span>
                            <strong className="text-slate-800">
                              {rec.milkTemp ? `${rec.milkTemp}°C` : '38.6°C'}
                            </strong>
                          </div>
                          <div>
                            <span className="text-slate-400 font-sans">pH: </span>
                            <strong className="text-slate-800">{rec.ph}</strong>
                          </div>
                          <div>
                            <span className="text-slate-400 font-sans">EC: </span>
                            <strong
                              className={
                                rec.ec > 6.0 ? 'text-red-600 font-black' : 'text-slate-800'
                              }
                            >
                              {rec.ec} mS
                            </strong>
                          </div>
                          <div>
                            <span className="text-slate-400 font-sans">SCC: </span>
                            <strong
                              className={
                                rec.scc > 200 ? 'text-red-600 font-black' : 'text-slate-800'
                              }
                            >
                              {rec.scc}k
                            </strong>
                          </div>
                        </div>
                      </td>

                      {/* Stage 2 Wearables & Telemetry */}
                      <td className="py-3.5 px-4 bg-purple-50/20 text-[11px]">
                        {isStage2 && cow?.wearable ? (
                          <div className="space-y-0.5 font-mono">
                            <div>
                              <span className="text-purple-700/70 font-sans font-semibold">
                                Rumination:{' '}
                              </span>
                              <strong className="text-slate-900">
                                {cow.wearable.ruminationMinutes} min/day
                              </strong>
                            </div>
                            <div>
                              <span className="text-purple-700/70 font-sans font-semibold">
                                Activity:{' '}
                              </span>
                              <strong className="text-slate-900 capitalize">
                                {cow.wearable.activityStatus}
                              </strong>{' '}
                              ·{' '}
                              <span className="text-purple-700/70 font-sans font-semibold">
                                Body Temp:{' '}
                              </span>
                              <strong className="text-slate-900">{cow.wearable.bodyTemp}°C</strong>
                            </div>
                          </div>
                        ) : (
                          <span className="text-[11px] text-slate-400 font-medium font-sans">
                            {t('noFurtherAction')}
                          </span>
                        )}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
