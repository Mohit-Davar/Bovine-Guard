import React, { useState } from 'react'

import { useHerd } from '../context/HerdContext'
import { EmptyState } from './ui/EmptyState'
import { ErrorState } from './ui/ErrorState'
import { LoadingState } from './ui/LoadingState'
import { AlertTriangle, ArrowRight, Check, Info, RotateCcw, X } from 'lucide-react'

export const AlertsView: React.FC = () => {
  const {
    alerts,
    tabLoading,
    tabError,
    isRetryingTab,
    retryTab,
    openAnimalProfile,
    acknowledgeAlert,
    dismissAlert,
    resetToSampleData,
  } = useHerd()

  const [stageFilter, setStageFilter] = useState<'all' | 'stage1' | 'stage2'>('all')

  const isLoading = tabLoading.alerts
  const error = tabError.alerts
  const isRetrying = isRetryingTab.alerts

  // Function to determine Stage 1 vs Stage 2 alert
  const getAlertStage = (alertTitle: string, alertMsg: string): 'Stage 1' | 'Stage 2' => {
    const text = (alertTitle + ' ' + alertMsg).toLowerCase()
    if (
      text.includes('rumination') ||
      text.includes('wearable') ||
      text.includes('collar') ||
      text.includes('thi') ||
      text.includes('microclimate') ||
      text.includes('heat stress') ||
      text.includes('activity') ||
      text.includes('fever') ||
      text.includes('body temp')
    ) {
      return 'Stage 2'
    }
    return 'Stage 1'
  }

  // Render Loading State
  if (isLoading) {
    return (
      <div className="space-y-6">
        <LoadingState
          title="Connecting to Real-Time Alert Bus..."
          message="Subscribing to Stage 1 parlor optical analyzers, quarter conductivity meters, and Stage 2 wearable collar telemetry."
          variant="screen"
        />
      </div>
    )
  }

  // Render Error State
  if (error) {
    return (
      <div className="space-y-6">
        <ErrorState
          title="Alert Streaming Disconnected"
          message={error}
          errorCode="ERR_ALERT_STREAM_TIMEOUT"
          onRetry={() => retryTab('alerts')}
          retryLabel="Retry Sync"
          isRetrying={isRetrying}
          secondaryAction={{
            label: 'Restore Alert Feed',
            onClick: resetToSampleData,
          }}
        />
      </div>
    )
  }

  // Render Empty State (Zero alerts)
  if (alerts.length === 0) {
    return (
      <div className="space-y-6">
        <EmptyState
          icon="shield"
          title="No Active Alerts"
          description="The 2-Stage monitoring network reports all Stage 1 parlor milk scanners and Stage 2 wearable gateways within normal operating parameters."
          badgeText="Alert Feed Clear"
          primaryAction={{
            label: 'Restore Sample Alerts',
            onClick: resetToSampleData,
            icon: <RotateCcw className="w-4 h-4" />,
          }}
        />
      </div>
    )
  }

  const filteredAlerts = alerts.filter((alert) => {
    if (stageFilter === 'all') return true
    const stage = getAlertStage(alert.title, alert.message)
    return stageFilter === 'stage1' ? stage === 'Stage 1' : stage === 'Stage 2'
  })

  const unacknowledgedAlerts = alerts.filter((a) => !a.acknowledged)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-black text-slate-900 tracking-tight">
              Real-Time Alert Feed
            </h2>
            {unacknowledgedAlerts.length > 0 && (
              <span className="text-xs font-black bg-amber-500 text-slate-950 px-2 py-0.5 rounded-full">
                {unacknowledgedAlerts.length} Unacknowledged
              </span>
            )}
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Stage 1 Milk Screening anomalies & Stage 2 Wearable / Microclimate telemetry alerts
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {/* Stage Filters */}
          <div className="flex items-center bg-slate-100 p-1 rounded-lg border border-slate-200">
            {(['all', 'stage1', 'stage2'] as const).map((stg) => (
              <button
                key={stg}
                onClick={() => setStageFilter(stg)}
                className={`px-3 py-1 rounded text-xs font-bold capitalize transition-colors ${
                  stageFilter === stg
                    ? 'bg-white text-slate-900 shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {stg === 'all'
                  ? 'All Stages'
                  : stg === 'stage1'
                    ? 'Stage 1 Milk'
                    : 'Stage 2 Telemetry'}
              </button>
            ))}
          </div>

          <button
            onClick={() => alerts.forEach((a) => acknowledgeAlert(a.id))}
            disabled={unacknowledgedAlerts.length === 0}
            className="px-3.5 py-1.5 rounded-lg text-xs font-bold bg-slate-100 text-slate-700 hover:bg-slate-200 disabled:opacity-50 transition-colors border border-slate-200"
          >
            Acknowledge All ({unacknowledgedAlerts.length})
          </button>
        </div>
      </div>

      {/* Alerts Feed List */}
      <div className="space-y-3">
        {filteredAlerts.length === 0 ? (
          <EmptyState
            icon="search"
            title={`No Alerts for ${stageFilter === 'stage1' ? 'Stage 1 Milk Screening' : 'Stage 2 Telemetry'}`}
            description="There are currently no active alerts matching this stage filter."
            primaryAction={{
              label: 'View All Alerts',
              onClick: () => setStageFilter('all'),
            }}
          />
        ) : (
          filteredAlerts.map((alert) => {
            const stage = getAlertStage(alert.title, alert.message)

            return (
              <div
                key={alert.id}
                className={`p-4 sm:p-5 rounded-xl border-2 transition-all flex flex-col sm:flex-row sm:items-start justify-between gap-4 ${
                  alert.acknowledged
                    ? 'bg-white border-slate-200 opacity-75'
                    : alert.severity === 'critical'
                      ? 'bg-white border-red-300 shadow-xs'
                      : alert.severity === 'warning'
                        ? 'bg-white border-amber-300 shadow-xs'
                        : 'bg-white border-blue-200'
                }`}
              >
                <div className="flex items-start gap-3.5">
                  <div
                    className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 mt-0.5 ${
                      alert.severity === 'critical'
                        ? 'bg-red-100 text-red-600'
                        : alert.severity === 'warning'
                          ? 'bg-amber-100 text-amber-700'
                          : 'bg-blue-100 text-blue-600'
                    }`}
                  >
                    {alert.severity === 'critical' || alert.severity === 'warning' ? (
                      <AlertTriangle className="w-5 h-5" />
                    ) : (
                      <Info className="w-5 h-5" />
                    )}
                  </div>

                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      {/* Stage Badge */}
                      <span
                        className={`text-[10px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded border ${
                          stage === 'Stage 1'
                            ? 'bg-blue-50 text-blue-800 border-blue-200'
                            : 'bg-purple-50 text-purple-800 border-purple-200'
                        }`}
                      >
                        {stage === 'Stage 1' ? 'Stage 1: Milk' : 'Stage 2: Telemetry'}
                      </span>

                      <span className="text-xs font-mono font-bold text-slate-400">
                        {alert.timestamp}
                      </span>
                      <span
                        className={`text-[10px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded ${
                          alert.severity === 'critical'
                            ? 'bg-red-600 text-white'
                            : alert.severity === 'warning'
                              ? 'bg-amber-500 text-slate-950'
                              : 'bg-blue-600 text-white'
                        }`}
                      >
                        {alert.severity}
                      </span>
                      <h3 className="text-sm font-bold text-slate-900">{alert.title}</h3>
                    </div>

                    <p className="text-xs text-slate-600 mt-1 leading-relaxed">{alert.message}</p>

                    <div className="mt-2 text-xs font-bold text-slate-800 bg-slate-50 px-2.5 py-1.5 rounded border border-slate-200 inline-block">
                      <strong>Recommended Protocol:</strong> {alert.recommendedAction}
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                  {alert.animalId && (
                    <button
                      onClick={() => openAnimalProfile(alert.animalId!)}
                      className="px-3 py-1.5 rounded-lg text-xs font-bold bg-blue-50 text-blue-700 hover:bg-blue-100 transition-colors flex items-center gap-1 border border-blue-200"
                    >
                      <span>Cow Profile</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  )}

                  {!alert.acknowledged && (
                    <button
                      onClick={() => acknowledgeAlert(alert.id)}
                      className="px-3 py-1.5 rounded-lg text-xs font-bold bg-emerald-600 text-white hover:bg-emerald-700 transition-colors flex items-center gap-1"
                      title="Acknowledge alert"
                    >
                      <Check className="w-3.5 h-3.5" />
                      <span>Acknowledge</span>
                    </button>
                  )}

                  <button
                    onClick={() => dismissAlert(alert.id)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
                    title="Dismiss alert"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}
