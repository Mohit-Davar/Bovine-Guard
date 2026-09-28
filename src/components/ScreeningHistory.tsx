import React, { useState } from 'react'

import { useHerd } from '../context/HerdContext'
import { EmptyState } from './ui/EmptyState'
import { ErrorState } from './ui/ErrorState'
import { LoadingState } from './ui/LoadingState'
import {
  Activity,
  Calendar,
  CheckCircle2,
  Clock,
  Download,
  Droplets,
  Filter,
  Radio,
  RotateCcw,
  Search,
  Sparkles,
} from 'lucide-react'
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'

export const ScreeningHistory: React.FC = () => {
  const {
    animals,
    tabLoading,
    tabError,
    isRetryingTab,
    retryTab,
    resetToSampleData,
    addToast,
    t,
  } = useHerd()

  const [measurementType, setMeasurementType] = useState<'all' | 'milk' | 'physical'>('all')
  const [selectedPen, setSelectedPen] = useState<string>('all')
  const [searchTerm, setSearchTerm] = useState<string>('')

  const isLoading = tabLoading.screenings
  const error = tabError.screenings
  const isRetrying = isRetryingTab.screenings

  if (isLoading) {
    return (
      <div className="space-y-6">
        <LoadingState
          title="Loading Measurement Log..."
          message="Retrieving recent milk and physical measurement records..."
          variant="table"
          rows={6}
        />
      </div>
    )
  }

  if (error) {
    return (
      <div className="space-y-6">
        <ErrorState
          title="Failed to Load Measurement Log"
          message={error}
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

  // Realistic sample milk and physical measurement log
  const milkMeasurements = [
    {
      id: 'm-024',
      cowName: 'Cow 024',
      pen: 'Pen 2',
      breed: 'Gir',
      time: '06:42 AM',
      ec: 7.8,
      ph: 6.8,
      milkTemp: 38.1,
      yieldL: 5.4,
      status: 'Suspicious',
      statusColor: 'text-rose-700 bg-rose-50 border border-rose-200',
    },
    {
      id: 'm-037',
      cowName: 'Cow 037',
      pen: 'Pen 1',
      breed: 'HF Cross',
      time: '06:55 AM',
      ec: 6.4,
      ph: 6.7,
      milkTemp: 38.5,
      yieldL: 6.8,
      status: 'At Risk',
      statusColor: 'text-amber-800 bg-amber-50 border border-amber-200',
    },
    {
      id: 'm-042',
      cowName: 'Cow 042',
      pen: 'Pen 3',
      breed: 'HF Cross',
      time: '06:30 AM',
      ec: 7.6,
      ph: 6.9,
      milkTemp: 38.6,
      yieldL: 6.1,
      status: 'Suspicious',
      statusColor: 'text-rose-700 bg-rose-50 border border-rose-200',
    },
    {
      id: 'm-058',
      cowName: 'Cow 058',
      pen: 'Pen 3',
      breed: 'Rathi',
      time: '07:10 AM',
      ec: 6.2,
      ph: 6.7,
      milkTemp: 38.4,
      yieldL: 7.0,
      status: 'At Risk',
      statusColor: 'text-amber-800 bg-amber-50 border border-amber-200',
    },
    {
      id: 'm-071',
      cowName: 'Cow 071',
      pen: 'Pen 4',
      breed: 'Gir',
      time: '06:15 AM',
      ec: 8.0,
      ph: 7.0,
      milkTemp: 38.9,
      yieldL: 4.8,
      status: 'Suspicious',
      statusColor: 'text-rose-700 bg-rose-50 border border-rose-200',
    },
    {
      id: 'm-001',
      cowName: 'Cow 001',
      pen: 'Pen 1',
      breed: 'Gir',
      time: '06:10 AM',
      ec: 5.0,
      ph: 6.6,
      milkTemp: 38.2,
      yieldL: 9.2,
      status: 'Healthy',
      statusColor: 'text-emerald-800 bg-emerald-50 border border-emerald-200',
    },
    {
      id: 'm-002',
      cowName: 'Cow 002',
      pen: 'Pen 1',
      breed: 'Sahiwal',
      time: '06:14 AM',
      ec: 4.9,
      ph: 6.5,
      milkTemp: 38.0,
      yieldL: 8.5,
      status: 'Healthy',
      statusColor: 'text-emerald-800 bg-emerald-50 border border-emerald-200',
    },
    {
      id: 'm-015',
      cowName: 'Cow 015',
      pen: 'Pen 2',
      breed: 'Tharparkar',
      time: '06:22 AM',
      ec: 5.1,
      ph: 6.6,
      milkTemp: 38.2,
      yieldL: 7.8,
      status: 'Healthy',
      statusColor: 'text-emerald-800 bg-emerald-50 border border-emerald-200',
    },
  ]

  const physicalMeasurements = [
    {
      id: 'p-024',
      cowName: 'Cow 024',
      pen: 'Pen 2',
      breed: 'Gir',
      time: '07:05 AM',
      activity: 'Reduced',
      movement: 'Normal',
      lying: 'Increased',
      wearable: 'Active',
      status: 'Suspicious',
      statusColor: 'text-rose-700 bg-rose-50 border border-rose-200',
    },
    {
      id: 'p-042',
      cowName: 'Cow 042',
      pen: 'Pen 3',
      breed: 'HF Cross',
      time: '07:12 AM',
      activity: 'Reduced',
      movement: 'Reduced',
      lying: 'Increased',
      wearable: 'Active',
      status: 'Suspicious',
      statusColor: 'text-rose-700 bg-rose-50 border border-rose-200',
    },
    {
      id: 'p-071',
      cowName: 'Cow 071',
      pen: 'Pen 4',
      breed: 'Gir',
      time: '06:50 AM',
      activity: 'Restless',
      movement: 'Normal',
      lying: 'Altered',
      wearable: 'Active',
      status: 'Suspicious',
      statusColor: 'text-rose-700 bg-rose-50 border border-rose-200',
    },
    {
      id: 'p-096',
      cowName: 'Cow 096',
      pen: 'Pen 2',
      breed: 'Sahiwal',
      time: '07:20 AM',
      activity: 'Reduced',
      movement: 'Reduced',
      lying: 'Increased',
      wearable: 'Active',
      status: 'Suspicious',
      statusColor: 'text-rose-700 bg-rose-50 border border-rose-200',
    },
    {
      id: 'p-001',
      cowName: 'Cow 001',
      pen: 'Pen 1',
      breed: 'Gir',
      time: '06:40 AM',
      activity: 'Normal',
      movement: 'Normal',
      lying: 'Normal',
      wearable: 'Active',
      status: 'Healthy',
      statusColor: 'text-emerald-800 bg-emerald-50 border border-emerald-200',
    },
  ]

  // Hourly measurement distribution data for chart
  const hourlyVolumeData = [
    { hour: '06:00 AM', milkChecks: 4, physicalChecks: 2 },
    { hour: '06:30 AM', milkChecks: 7, physicalChecks: 3 },
    { hour: '07:00 AM', milkChecks: 5, physicalChecks: 4 },
    { hour: '07:30 AM', milkChecks: 2, physicalChecks: 2 },
  ]

  // Filter helper
  const filterRecord = (rec: { cowName: string; pen: string; breed: string }) => {
    const matchesSearch =
      rec.cowName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      rec.breed.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesPen = selectedPen === 'all' || rec.pen === selectedPen
    return matchesSearch && matchesPen
  }

  const filteredMilk = milkMeasurements.filter(filterRecord)
  const filteredPhysical = physicalMeasurements.filter(filterRecord)

  const handleExportCsv = () => {
    const csvContent =
      'data:text/csv;charset=utf-8,' +
      'Type,Cow,Pen,Breed,Time,Status,Value1,Value2,Value3\n' +
      filteredMilk
        .map(
          (m) =>
            `Milk,${m.cowName},${m.pen},${m.breed},${m.time},${m.status},EC:${m.ec},pH:${m.ph},Temp:${m.milkTemp}C`,
        )
        .join('\n') +
      '\n' +
      filteredPhysical
        .map(
          (p) =>
            `Physical,${p.cowName},${p.pen},${p.breed},${p.time},${p.status},Activity:${p.activity},Lying:${p.lying},Wearable:${p.wearable}`,
        )
        .join('\n')

    const encodedUri = encodeURI(csvContent)
    const link = document.createElement('a')
    link.setAttribute('href', encodedUri)
    link.setAttribute('download', `GauSaathi_Screening_Log_${new Date().toISOString().split('T')[0]}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)

    addToast({
      title: 'CSV Export Downloaded',
      message: 'Measurement log saved successfully.',
      type: 'success',
    })
  }

  return (
    <div className="space-y-6 sm:space-y-8 animate-in fade-in duration-300">
      {/* Header and Controls */}
      <div className="bg-white p-5 rounded-2xl border border-black/[0.06] shadow-[0_2px_8px_rgba(0,0,0,0.02)] space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h1 className="text-xl font-semibold text-slate-900 tracking-tight">
              Screening Log
            </h1>
            <p className="text-xs text-slate-500 font-normal">
              Shift measurement activity cleanly separated into milk parameters and physical movement
            </p>
          </div>

          <button
            onClick={handleExportCsv}
            className="px-3.5 py-1.5 rounded-full bg-black/[0.04] hover:bg-black/[0.08] text-slate-700 font-medium text-xs flex items-center gap-1.5 transition-colors self-start sm:self-auto"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export CSV</span>
          </button>
        </div>

        {/* Filter Bar */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {/* Apple Segmented Measurement Type Switch */}
          <div className="inline-flex items-center p-1 bg-black/[0.04] rounded-xl gap-0.5">
            <button
              onClick={() => setMeasurementType('all')}
              className={`flex-1 py-1.5 text-xs font-medium rounded-lg transition-all ${
                measurementType === 'all'
                  ? 'bg-white text-slate-900 shadow-[0_1px_4px_rgba(0,0,0,0.06)] font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              All Types
            </button>
            <button
              onClick={() => setMeasurementType('milk')}
              className={`flex-1 py-1.5 text-xs font-medium rounded-lg transition-all ${
                measurementType === 'milk'
                  ? 'bg-white text-slate-900 shadow-[0_1px_4px_rgba(0,0,0,0.06)] font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Milk
            </button>
            <button
              onClick={() => setMeasurementType('physical')}
              className={`flex-1 py-1.5 text-xs font-medium rounded-lg transition-all ${
                measurementType === 'physical'
                  ? 'bg-white text-slate-900 shadow-[0_1px_4px_rgba(0,0,0,0.06)] font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Physical
            </button>
          </div>

          {/* Pen Filter */}
          <div className="flex items-center gap-2">
            <label className="text-xs font-medium text-slate-500 shrink-0">Pen:</label>
            <select
              value={selectedPen}
              onChange={(e) => setSelectedPen(e.target.value)}
              className="w-full text-xs rounded-xl border border-black/[0.08] py-2 px-3 bg-black/[0.02] focus:bg-white focus:outline-hidden font-medium text-slate-800"
            >
              <option value="all">All Pens</option>
              <option value="Pen 1">Pen 1</option>
              <option value="Pen 2">Pen 2</option>
              <option value="Pen 3">Pen 3</option>
              <option value="Pen 4">Pen 4</option>
            </select>
          </div>

          {/* Search Box */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search cow name or breed..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full text-xs rounded-xl border border-black/[0.08] pl-9 pr-3 py-2 bg-black/[0.02] focus:bg-white focus:outline-hidden"
            />
          </div>
        </div>
      </div>

      {/* Hourly Measurement Volume Chart & AI Insight */}
      <div className="bg-white rounded-2xl p-5 border border-black/[0.06] shadow-[0_2px_8px_rgba(0,0,0,0.02)]">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h3 className="text-sm font-semibold text-slate-900 tracking-tight">
              Morning Shift Screening Pace
            </h3>
            <p className="text-xs text-slate-500 font-normal">
              Hourly volume of milk sensor tests and physical collar syncs
            </p>
          </div>
          <span className="text-xs text-slate-400">Peak: 06:30 AM</span>
        </div>

        <div className="h-44 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={hourlyVolumeData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F0F0F3" />
              <XAxis dataKey="hour" stroke="#86868B" fontSize={11} tickLine={false} />
              <YAxis stroke="#86868B" fontSize={11} tickLine={false} />
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
              <Bar dataKey="milkChecks" name="Milk Tests" fill="#0071E3" radius={[4, 4, 0, 0]} />
              <Bar dataKey="physicalChecks" name="Physical Syncs" fill="#10B981" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* AI Insight */}
        <div className="mt-3.5 p-3 rounded-xl bg-gradient-to-r from-blue-500/[0.04] via-indigo-500/[0.04] to-violet-500/[0.04] border border-indigo-500/15 flex items-center gap-2">
          <Sparkles className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
          <p className="text-xs text-slate-700 leading-snug">
            <strong>GauSaathi AI Insight:</strong> 18 milk screenings completed across the morning shift within expected ranges. Wearable activity records synchronized for all 5 monitored cows.
          </p>
        </div>
      </div>

      {/* ==================================================== */}
      {/* SECTION 1: MILK MEASUREMENTS                        */}
      {/* ==================================================== */}
      {(measurementType === 'all' || measurementType === 'milk') && (
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Droplets className="w-4 h-4 text-blue-600" />
            <h2 className="text-base font-semibold text-slate-900 tracking-tight">Milk Measurements</h2>
            <span className="text-xs font-normal text-slate-400">
              ({filteredMilk.length} records)
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
            {filteredMilk.map((record) => (
              <div
                key={record.id}
                className="bg-white rounded-2xl border border-black/[0.06] p-4 shadow-[0_2px_8px_rgba(0,0,0,0.02)] hover:border-black/[0.12] transition-colors"
              >
                <div className="flex items-start justify-between pb-2.5 border-b border-black/[0.04]">
                  <div>
                    <div className="font-semibold text-sm text-slate-900 tracking-tight">{record.cowName}</div>
                    <div className="text-xs text-slate-500 font-normal">
                      {record.pen} · {record.breed}
                    </div>
                  </div>
                  <div className="text-right">
                    <span
                      className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-medium ${record.statusColor}`}
                    >
                      {record.status}
                    </span>
                    <div className="text-[11px] text-slate-400 font-normal mt-0.5">
                      {record.time}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2 mt-3 text-center">
                  <div className="p-2 rounded-xl bg-black/[0.02] border border-black/[0.04]">
                    <div className="text-[10px] text-slate-500 font-medium">EC</div>
                    <div
                      className={`text-sm font-semibold mt-0.5 ${
                        record.ec >= 7.0 ? 'text-rose-600' : 'text-slate-900'
                      }`}
                    >
                      {record.ec}
                    </div>
                  </div>
                  <div className="p-2 rounded-xl bg-black/[0.02] border border-black/[0.04]">
                    <div className="text-[10px] text-slate-500 font-medium">pH</div>
                    <div className="text-sm font-semibold text-slate-900 mt-0.5">{record.ph}</div>
                  </div>
                  <div className="p-2 rounded-xl bg-black/[0.02] border border-black/[0.04]">
                    <div className="text-[10px] text-slate-500 font-medium">Milk Temp</div>
                    <div className="text-sm font-semibold text-slate-900 mt-0.5">
                      {record.milkTemp}°C
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ==================================================== */}
      {/* SECTION 2: PHYSICAL MEASUREMENTS                    */}
      {/* ==================================================== */}
      {(measurementType === 'all' || measurementType === 'physical') && (
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Activity className="w-4 h-4 text-emerald-600" />
            <h2 className="text-base font-semibold text-slate-900 tracking-tight">Physical Measurements</h2>
            <span className="text-xs font-normal text-slate-400">
              ({filteredPhysical.length} records)
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
            {filteredPhysical.map((record) => (
              <div
                key={record.id}
                className="bg-white rounded-2xl border border-black/[0.06] p-4 shadow-[0_2px_8px_rgba(0,0,0,0.02)] hover:border-black/[0.12] transition-colors"
              >
                <div className="flex items-start justify-between pb-2.5 border-b border-black/[0.04]">
                  <div>
                    <div className="font-semibold text-sm text-slate-900 tracking-tight">{record.cowName}</div>
                    <div className="text-xs text-slate-500 font-normal">
                      {record.pen} · {record.breed}
                    </div>
                  </div>
                  <div className="text-right">
                    <span
                      className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-medium ${record.statusColor}`}
                    >
                      {record.status}
                    </span>
                    <div className="text-[11px] text-slate-400 font-normal mt-0.5">
                      {record.time}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-4 gap-1.5 mt-3 text-center">
                  <div className="p-2 rounded-xl bg-black/[0.02] border border-black/[0.04]">
                    <div className="text-[9px] text-slate-500 font-medium">
                      Activity
                    </div>
                    <div className="text-xs font-semibold text-slate-900 mt-0.5">
                      {record.activity}
                    </div>
                  </div>
                  <div className="p-2 rounded-xl bg-black/[0.02] border border-black/[0.04]">
                    <div className="text-[9px] text-slate-500 font-medium">
                      Movement
                    </div>
                    <div className="text-xs font-semibold text-slate-900 mt-0.5">
                      {record.movement}
                    </div>
                  </div>
                  <div className="p-2 rounded-xl bg-black/[0.02] border border-black/[0.04]">
                    <div className="text-[9px] text-slate-500 font-medium">Lying</div>
                    <div className="text-xs font-semibold text-slate-900 mt-0.5">{record.lying}</div>
                  </div>
                  <div className="p-2 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800">
                    <div className="text-[9px] font-medium">Wearable</div>
                    <div className="text-xs font-semibold mt-0.5">{record.wearable}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
