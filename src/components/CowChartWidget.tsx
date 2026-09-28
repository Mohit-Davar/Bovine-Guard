import React, { useState } from 'react'

import { useHerd } from '../context/HerdContext'
import { Animal } from '../types'
import {
  Activity,
  AlertTriangle,
  CheckCircle2,
  Droplets,
  Sparkles,
  Thermometer,
  TrendingDown,
  TrendingUp,
  Zap,
} from 'lucide-react'
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ComposedChart,
  Legend,
  Line,
  LineChart,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'

interface Props {
  animal: Animal
}

export const CowChartWidget: React.FC<Props> = ({ animal }) => {
  const { t } = useHerd()
  const [activeMetric, setActiveMetric] = useState<'conductivity' | 'yield' | 'activity' | 'temperature'>('conductivity')

  const isSuspicious = animal.currentRisk === 'suspected' || animal.currentRisk === 'critical' || animal.ec > 6.8
  const isAtRisk = animal.currentRisk === 'watch' || animal.currentRisk === 'high' || (animal.ec > 5.6 && animal.ec <= 6.8)

  // 5-Day Trend Data tailored to cow's current measurements
  const trendData = [
    {
      day: t('fourDaysAgo'),
      ec: 5.0,
      yieldL: 8.8,
      activity: 100,
      ruminationMin: 480,
      milkTemp: 38.2,
      status: 'Healthy',
    },
    {
      day: t('threeDaysAgo'),
      ec: 5.1,
      yieldL: 8.6,
      activity: 98,
      ruminationMin: 470,
      milkTemp: 38.3,
      status: 'Healthy',
    },
    {
      day: t('twoDaysAgo'),
      ec: isSuspicious ? 6.2 : isAtRisk ? 5.5 : 5.1,
      yieldL: isSuspicious ? 7.6 : isAtRisk ? 8.2 : 8.7,
      activity: isSuspicious ? 90 : isAtRisk ? 95 : 100,
      ruminationMin: isSuspicious ? 420 : isAtRisk ? 450 : 485,
      milkTemp: isSuspicious ? 38.5 : 38.2,
      status: isSuspicious ? 'Watch' : 'Healthy',
    },
    {
      day: t('yesterday'),
      ec: isSuspicious ? 6.8 : isAtRisk ? 6.0 : 5.0,
      yieldL: isSuspicious ? 6.5 : isAtRisk ? 7.5 : 8.6,
      activity: isSuspicious ? 82 : isAtRisk ? 88 : 99,
      ruminationMin: isSuspicious ? 380 : isAtRisk ? 420 : 480,
      milkTemp: isSuspicious ? 38.7 : isAtRisk ? 38.4 : 38.2,
      status: isSuspicious ? 'At Risk' : isAtRisk ? 'At Risk' : 'Healthy',
    },
    {
      day: t('today'),
      ec: animal.ec,
      yieldL: animal.dailyMilkYieldKg,
      activity: isSuspicious ? 72 : isAtRisk ? 85 : 100,
      ruminationMin: animal.wearable?.ruminationMinutes ?? (isSuspicious ? 340 : isAtRisk ? 410 : 490),
      milkTemp: animal.milkTemp,
      status: isSuspicious ? 'Suspicious' : isAtRisk ? 'At Risk' : 'Healthy',
    },
  ]

  // Observed calculations
  const ecDelta = Math.round(((animal.ec - 5.0) / 5.0) * 100)
  const chartInsight = isSuspicious
    ? t('chartInsightSuspicious', {
      name: animal.name || `${t('cowLabel')} ${animal.tag}`,
      delta: ecDelta,
    })
    : isAtRisk
      ? t('chartInsightRisk', { ec: animal.ec })
      : t('chartInsightHealthy', { breed: animal.breed })

  return (
    <div className="bg-white rounded-2xl p-5 border border-black/[0.06] shadow-[0_2px_8px_rgba(0,0,0,0.02)] space-y-4">
      {/* Header and Apple-style segmented tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h3 className="text-sm font-semibold text-slate-900 tracking-tight">
            {t('chartTrendsTitle')}
          </h3>
          <p className="text-xs text-slate-500 font-normal">
            {t('chartTrendsSubtitle')}
          </p>
        </div>

        {/* Apple Segmented Metric Selector */}
        <div className="inline-flex items-center p-1 bg-black/[0.04] rounded-xl gap-0.5">
          <button
            onClick={() => setActiveMetric('conductivity')}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all ${activeMetric === 'conductivity'
              ? 'bg-white text-slate-900 shadow-[0_1px_4px_rgba(0,0,0,0.06)] font-semibold'
              : 'text-slate-600 hover:text-slate-900'
              }`}
          >
            {t('conductivityMetric')}
          </button>
          <button
            onClick={() => setActiveMetric('yield')}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all ${activeMetric === 'yield'
              ? 'bg-white text-slate-900 shadow-[0_1px_4px_rgba(0,0,0,0.06)] font-semibold'
              : 'text-slate-600 hover:text-slate-900'
              }`}
          >
            {t('yieldLabel')}
          </button>
          <button
            onClick={() => setActiveMetric('activity')}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all ${activeMetric === 'activity'
              ? 'bg-white text-slate-900 shadow-[0_1px_4px_rgba(0,0,0,0.06)] font-semibold'
              : 'text-slate-600 hover:text-slate-900'
              }`}
          >
            {t('activityRuminationMetric')}
          </button>
          <button
            onClick={() => setActiveMetric('temperature')}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all ${activeMetric === 'temperature'
              ? 'bg-white text-slate-900 shadow-[0_1px_4px_rgba(0,0,0,0.06)] font-semibold'
              : 'text-slate-600 hover:text-slate-900'
              }`}
          >
            {t('milkTempMetric')}
          </button>
        </div>
      </div>

      {/* Chart Canvas */}
      <div className="h-60 w-full pt-2">
        <ResponsiveContainer width="100%" height="100%">
          {activeMetric === 'conductivity' ? (
            <AreaChart data={trendData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
              <defs>
                <linearGradient id="cowEcGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={isSuspicious ? '#F43F5E' : '#0071E3'} stopOpacity={0.2} />
                  <stop offset="95%" stopColor={isSuspicious ? '#F43F5E' : '#0071E3'} stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F0F0F3" />
              <XAxis dataKey="day" stroke="#86868B" fontSize={11} tickLine={false} />
              <YAxis domain={[4.0, 9.0]} stroke="#86868B" fontSize={11} tickLine={false} />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'rgba(29, 29, 31, 0.95)',
                  backdropFilter: 'blur(8px)',
                  borderRadius: '12px',
                  border: 'none',
                  color: '#fff',
                  fontSize: '12px',
                }}
              />
              <ReferenceLine y={5.5} stroke="#10B981" strokeDasharray="4 4" label={{ value: `${t('normalBaseline')} (5.5)`, position: 'insideTopLeft', fill: '#10B981', fontSize: 10 }} />
              <Area
                type="monotone"
                dataKey="ec"
                name={`${t('conductivityMetric')} (mS/cm)`}
                stroke={isSuspicious ? '#F43F5E' : '#0071E3'}
                strokeWidth={2.5}
                fillOpacity={1}
                fill="url(#cowEcGrad)"
              />
            </AreaChart>
          ) : activeMetric === 'yield' ? (
            <BarChart data={trendData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F0F0F3" />
              <XAxis dataKey="day" stroke="#86868B" fontSize={11} tickLine={false} />
              <YAxis domain={[0, 12]} stroke="#86868B" fontSize={11} tickLine={false} />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'rgba(29, 29, 31, 0.95)',
                  backdropFilter: 'blur(8px)',
                  borderRadius: '12px',
                  border: 'none',
                  color: '#fff',
                  fontSize: '12px',
                }}
              />
              <ReferenceLine y={8.0} stroke="#86868B" strokeDasharray="4 4" label={{ value: `${t('targetYield')} (8.0 L)`, position: 'insideTopLeft', fill: '#86868B', fontSize: 10 }} />
              <Bar dataKey="yieldL" name={`${t('yieldLabel')} (L)`} fill="#10B981" radius={[6, 6, 0, 0]}>
                {trendData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={entry.yieldL < 6.0 ? '#F43F5E' : entry.yieldL < 7.5 ? '#F59E0B' : '#10B981'}
                  />
                ))}
              </Bar>
            </BarChart>
          ) : activeMetric === 'activity' ? (
            <ComposedChart data={trendData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F0F0F3" />
              <XAxis dataKey="day" stroke="#86868B" fontSize={11} tickLine={false} />
              <YAxis yAxisId="left" stroke="#86868B" fontSize={11} tickLine={false} domain={[50, 110]} label={{ value: `${t('activityIndex')} %`, angle: -90, position: 'insideLeft', fontSize: 10 }} />
              <YAxis yAxisId="right" orientation="right" stroke="#6366F1" fontSize={11} tickLine={false} domain={[250, 550]} label={{ value: t('ruminationMinutes'), angle: 90, position: 'insideRight', fontSize: 10 }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'rgba(29, 29, 31, 0.95)',
                  backdropFilter: 'blur(8px)',
                  borderRadius: '12px',
                  border: 'none',
                  color: '#fff',
                  fontSize: '12px',
                }}
              />
              <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }} />
              <Bar yAxisId="left" dataKey="activity" name={t('physicalActivityIndex')} fill="#0071E3" radius={[4, 4, 0, 0]} />
              <Line yAxisId="right" type="monotone" dataKey="ruminationMin" name={t('ruminationMinutes')} stroke="#6366F1" strokeWidth={2.5} dot={{ r: 4 }} />
            </ComposedChart>
          ) : (
            <LineChart data={trendData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F0F0F3" />
              <XAxis dataKey="day" stroke="#86868B" fontSize={11} tickLine={false} />
              <YAxis domain={[37.5, 40.0]} stroke="#86868B" fontSize={11} tickLine={false} />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'rgba(29, 29, 31, 0.95)',
                  backdropFilter: 'blur(8px)',
                  borderRadius: '12px',
                  border: 'none',
                  color: '#fff',
                  fontSize: '12px',
                }}
              />
              <ReferenceLine y={38.5} stroke="#10B981" strokeDasharray="4 4" label={{ value: `${t('normalValue')} ${t('tempLabel')} (38.5°C)`, position: 'insideTopLeft', fill: '#10B981', fontSize: 10 }} />
              <Line type="monotone" dataKey="milkTemp" name={`${t('milkTemperature')} (°C)`} stroke="#F59E0B" strokeWidth={2.5} dot={{ r: 4 }} />
            </LineChart>
          )}
        </ResponsiveContainer>
      </div>

      {/* GauSaathi AI Chart Insight */}
      <div className="p-3.5 rounded-xl bg-gradient-to-r from-blue-500/[0.04] via-indigo-500/[0.04] to-violet-500/[0.04] border border-indigo-500/15 flex items-start gap-2.5">
        <Sparkles className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
        <div className="text-xs">
          <span className="font-semibold text-indigo-950">{t('chartInsightTitle')} </span>
          <span className="text-slate-700 leading-relaxed">
            {chartInsight}
          </span>
        </div>
      </div>
    </div>
  )
}
