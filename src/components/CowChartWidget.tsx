import React, { useState } from 'react'

import { Animal } from '../types'
import { Activity, TrendingUp, Zap } from 'lucide-react'
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'

interface Props {
  animal: Animal
  compact?: boolean
}

export const CowChartWidget: React.FC<Props> = ({ animal, compact = false }) => {
  const [activeMetricTab, setActiveMetricTab] = useState<'quarters' | 'trajectory' | 'wearable'>(
    'quarters',
  )

  // Prepare 4-Quarter EC Data
  const quarterChartData = animal.quarters.map((q) => {
    const isElevated = q.ec >= 5.8
    const isSuspect = q.ec >= 5.4 && q.ec < 5.8
    return {
      name: q.quarter,
      fullName:
        q.quarter === 'FL'
          ? 'Front-Left'
          : q.quarter === 'FR'
            ? 'Front-Right'
            : q.quarter === 'RL'
              ? 'Rear-Left'
              : 'Rear-Right',
      ec: q.ec,
      status: q.status,
      fill: isElevated ? '#dc2626' : isSuspect ? '#d97706' : '#10b981',
    }
  })

  // Prepare 7-Day SCC / EC screening trajectory data
  const trajectoryData =
    animal.screeningHistory && animal.screeningHistory.length > 0
      ? animal.screeningHistory.map((item) => ({
          date: item.date,
          scc: item.scc,
          ec: item.ec,
        }))
      : [
          {
            date: 'D-6',
            scc: Math.max(60, Math.round(animal.scc * 0.35)),
            ec: 4.8,
          },
          {
            date: 'D-5',
            scc: Math.max(65, Math.round(animal.scc * 0.4)),
            ec: 4.8,
          },
          {
            date: 'D-4',
            scc: Math.max(75, Math.round(animal.scc * 0.45)),
            ec: 4.9,
          },
          {
            date: 'D-3',
            scc: Math.max(90, Math.round(animal.scc * 0.55)),
            ec: 5.1,
          },
          {
            date: 'D-2',
            scc: Math.max(120, Math.round(animal.scc * 0.7)),
            ec: 5.3,
          },
          {
            date: 'Yday',
            scc: Math.max(160, Math.round(animal.scc * 0.85)),
            ec: 5.6,
          },
          { date: 'Today', scc: animal.scc, ec: animal.ec },
        ]

  const infectedQuarter = animal.quarters.find((q) => q.ec >= 5.8 || q.status === 'infected')
  const minQuarterEc = Math.min(...animal.quarters.map((q) => q.ec))
  const maxQuarterEc = Math.max(...animal.quarters.map((q) => q.ec))
  const deltaEc = maxQuarterEc - minQuarterEc

  return (
    <div className="bg-slate-50/90 rounded-xl border border-slate-200/80 p-3 sm:p-4 text-slate-800">
      {/* Widget Header & Sub-selector */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-200/80">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse" />
          <span className="text-xs font-bold uppercase tracking-wider text-slate-700">
            Biophysical Analytics · {animal.name} ({animal.tag})
          </span>
        </div>

        <div className="flex items-center gap-1 bg-white p-0.5 rounded-lg border border-slate-200 text-[11px] self-start sm:self-center">
          <button
            type="button"
            onClick={() => setActiveMetricTab('quarters')}
            className={`px-2.5 py-1 rounded-md font-semibold transition-colors ${
              activeMetricTab === 'quarters'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            4-Quarter EC (mS/cm)
          </button>
          <button
            type="button"
            onClick={() => setActiveMetricTab('trajectory')}
            className={`px-2.5 py-1 rounded-md font-semibold transition-colors ${
              activeMetricTab === 'trajectory'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            SCC Trajectory
          </button>
          {(animal.currentRisk === 'suspected' ||
            animal.currentRisk === 'risked' ||
            animal.currentRisk === 'watch' ||
            animal.currentRisk === 'high' ||
            animal.currentRisk === 'critical') &&
            animal.wearable && (
              <button
                type="button"
                onClick={() => setActiveMetricTab('wearable')}
                className={`px-2.5 py-1 rounded-md font-semibold transition-colors ${
                  activeMetricTab === 'wearable'
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Stage 2 Wearable
              </button>
            )}
        </div>
      </div>

      {/* VIEW 1: 4-Quarter EC Bar Chart Widget */}
      {activeMetricTab === 'quarters' && (
        <div className="pt-3 space-y-3">
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4 text-amber-600" />
              <span className="font-semibold text-slate-700">Quarter Differential:</span>
              <span
                className={`font-mono font-bold px-1.5 py-0.5 rounded ${
                  deltaEc >= 0.8
                    ? 'bg-red-100 text-red-700'
                    : deltaEc >= 0.4
                      ? 'bg-amber-100 text-amber-800'
                      : 'bg-emerald-100 text-emerald-800'
                }`}
              >
                ΔEC = +{deltaEc.toFixed(1)} mS/cm
              </span>
            </div>

            <span className="text-[11px] text-slate-500 font-medium">
              Threshold: &gt; 5.5 mS/cm
            </span>
          </div>

          {/* Recharts Bar Chart */}
          <div className="h-44 w-full pt-1">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={quarterChartData}
                margin={{ top: 15, right: 10, left: -20, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis
                  dataKey="name"
                  tick={{ fontSize: 11, fill: '#64748b', fontWeight: 600 }}
                  axisLine={{ stroke: '#cbd5e1' }}
                  tickLine={false}
                />
                <YAxis
                  domain={[3.5, 7.5]}
                  tick={{ fontSize: 10, fill: '#64748b' }}
                  axisLine={{ stroke: '#cbd5e1' }}
                  tickLine={false}
                  unit=" mS"
                />
                <Tooltip
                  formatter={(value: any, name: any, item: any) => [
                    `${value} mS/cm (${item.payload.fullName} - ${item.payload.status.toUpperCase()})`,
                    'Conductivity',
                  ]}
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    borderColor: '#1e293b',
                    borderRadius: '8px',
                    color: '#fff',
                    fontSize: '12px',
                  }}
                />
                <ReferenceLine
                  y={5.5}
                  stroke="#ef4444"
                  strokeDasharray="4 4"
                  label={{
                    value: 'Mastitis Risk (5.5 mS/cm)',
                    position: 'top',
                    fill: '#dc2626',
                    fontSize: 10,
                    fontWeight: 700,
                  }}
                />
                <Bar dataKey="ec" radius={[6, 6, 0, 0]}>
                  {quarterChartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="grid grid-cols-4 gap-2 pt-1 text-center">
            {animal.quarters.map((q) => (
              <div
                key={q.quarter}
                className={`p-1.5 rounded-lg border text-[11px] ${
                  q.ec >= 5.8
                    ? 'bg-red-50 border-red-200 text-red-700'
                    : q.ec >= 5.4
                      ? 'bg-amber-50 border-amber-200 text-amber-800'
                      : 'bg-white border-slate-200 text-slate-700'
                }`}
              >
                <span className="font-bold block">{q.quarter}</span>
                <span className="font-mono font-bold">{q.ec}</span>
                <span className="text-[9px] text-slate-400 block">mS/cm</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* VIEW 2: Historical Trajectory Area Chart */}
      {activeMetricTab === 'trajectory' && (
        <div className="pt-3 space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-600">
            <span className="font-semibold flex items-center gap-1.5">
              <TrendingUp className="w-4 h-4 text-blue-600" />
              Somatic Cell Count (SCC × 1,000 cells/mL)
            </span>
            <span className="font-mono text-slate-500">
              Current:{' '}
              <strong className={animal.scc > 200 ? 'text-red-600' : 'text-emerald-700'}>
                {animal.scc}k
              </strong>
            </span>
          </div>

          <div className="h-44 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={trajectoryData}
                margin={{ top: 10, right: 10, left: -15, bottom: 0 }}
              >
                <defs>
                  <linearGradient id="colorScc" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis
                  dataKey="date"
                  tick={{ fontSize: 10, fill: '#64748b' }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fontSize: 10, fill: '#64748b' }}
                  axisLine={false}
                  tickLine={false}
                  unit="k"
                />
                <Tooltip
                  formatter={(val: any) => [`${val},000 cells/mL`, 'Somatic Cells']}
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    borderRadius: '8px',
                    color: '#fff',
                    fontSize: '11px',
                  }}
                />
                <ReferenceLine
                  y={200}
                  stroke="#ef4444"
                  strokeDasharray="3 3"
                  label={{
                    value: '200k Subclinical Threshold',
                    position: 'insideTopLeft',
                    fill: '#ef4444',
                    fontSize: 10,
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="scc"
                  stroke="#2563eb"
                  strokeWidth={2.5}
                  fillOpacity={1}
                  fill="url(#colorScc)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* VIEW 3: Stage 2 Wearable Behavioral Timeline */}
      {activeMetricTab === 'wearable' && animal.wearable && (
        <div className="pt-3 space-y-3">
          <div className="grid grid-cols-3 gap-2">
            {/* Rumination */}
            <div className="p-2.5 bg-white rounded-xl border border-slate-200">
              <span className="text-[10px] uppercase font-bold text-slate-400 block">
                Rumination
              </span>
              <div className="flex items-baseline gap-1 mt-0.5">
                <span
                  className={`text-base font-bold font-mono ${
                    animal.wearable.ruminationMinutes < animal.wearable.ruminationBaseline * 0.8
                      ? 'text-red-600'
                      : 'text-slate-900'
                  }`}
                >
                  {animal.wearable.ruminationMinutes}
                </span>
                <span className="text-[10px] text-slate-400">min/day</span>
              </div>
              <span className="text-[10px] text-slate-500 block mt-0.5">
                Baseline: {animal.wearable.ruminationBaseline}m (
                <span className="text-red-600 font-bold">
                  {Math.round(
                    ((animal.wearable.ruminationMinutes - animal.wearable.ruminationBaseline) /
                      animal.wearable.ruminationBaseline) *
                      100,
                  )}
                  %
                </span>
                )
              </span>
            </div>

            {/* Body Temp */}
            <div className="p-2.5 bg-white rounded-xl border border-slate-200">
              <span className="text-[10px] uppercase font-bold text-slate-400 block">
                Body Temp
              </span>
              <div className="flex items-baseline gap-1 mt-0.5">
                <span
                  className={`text-base font-bold font-mono ${
                    animal.wearable.bodyTemp > 39.2 ? 'text-red-600' : 'text-slate-900'
                  }`}
                >
                  {animal.wearable.bodyTemp}°C
                </span>
              </div>
              <span className="text-[10px] text-slate-500 block mt-0.5">Normal: 38.5–39.3°C</span>
            </div>

            {/* Activity */}
            <div className="p-2.5 bg-white rounded-xl border border-slate-200">
              <span className="text-[10px] uppercase font-bold text-slate-400 block">
                Locomotion
              </span>
              <div className="mt-0.5">
                <span
                  className={`text-xs font-bold uppercase px-1.5 py-0.5 rounded ${
                    animal.wearable.activityStatus === 'lethargic'
                      ? 'bg-red-100 text-red-700'
                      : animal.wearable.activityStatus === 'restless'
                        ? 'bg-amber-100 text-amber-800'
                        : 'bg-emerald-100 text-emerald-800'
                  }`}
                >
                  {animal.wearable.activityStatus}
                </span>
              </div>
              <span className="text-[10px] text-slate-400 block mt-1">
                Battery: {animal.wearable.batteryPercent}%
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
