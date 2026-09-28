import React, { useState } from 'react'

import { useHerd } from '../context/HerdContext'
import {
  BREED_SUMMARIES,
  FARM_ENVIRONMENT,
  HERD_DAILY_TRENDS,
  HOURLY_ENVIRONMENT_TRENDS,
  PEN_SUMMARIES,
  WEARABLE_STATS,
} from '../data/indianDairyData'
import { EmptyState } from './ui/EmptyState'
import { ErrorState } from './ui/ErrorState'
import { LoadingState } from './ui/LoadingState'
import {
  Activity,
  AlertTriangle,
  ArrowRight,
  Calendar,
  CheckCircle2,
  ChevronRight,
  Clock,
  Droplets,
  Radio,
  RotateCcw,
  Sparkles,
  Thermometer,
  Wind,
} from 'lucide-react'
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  ComposedChart,
  Legend,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'

export const DashboardOverview: React.FC = () => {
  const {
    animals,
    tabLoading,
    tabError,
    isRetryingTab,
    retryTab,
    resetToSampleData,
    setActiveTab,
    openAppointmentModal,
    t,
  } = useHerd()

  const [activeChartTab, setActiveChartTab] = useState<'pens' | 'breeds' | 'climate' | 'yieldCorr'>('pens')

  const isLoading = tabLoading.dashboard
  const error = tabError.dashboard
  const isRetrying = isRetryingTab.dashboard

  if (isLoading) {
    return (
      <div className="py-12">
        <LoadingState
          title={t('appTitle')}
          message={t('thinking')}
          variant="screen"
        />
      </div>
    )
  }

  if (error) {
    return (
      <div className="py-12">
        <ErrorState
          title={t('appTitle')}
          message={error}
          onRetry={() => retryTab('dashboard')}
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

  if (animals.length === 0) {
    return (
      <div className="py-12">
        <EmptyState
          icon="inbox"
          title={t('totalCows')}
          description={t('allStock')}
          primaryAction={{
            label: t('reset'),
            onClick: resetToSampleData,
            icon: <RotateCcw className="w-4 h-4" />,
          }}
        />
      </div>
    )
  }

  // Farm figures
  const totalCows = 128
  const checkedToday = 116
  const healthyCount = 94
  const atRiskCount = 18
  const suspiciousCount = 6

  // Chart datasets
  const penChartData = PEN_SUMMARIES.map((p) => ({
    name: p.name,
    [t('healthy')]: p.healthy,
    [t('atRisk')]: p.atRisk,
    [t('suspicious')]: p.suspicious,
  }))

  const breedChartData = BREED_SUMMARIES.map((b) => ({
    name: b.breed,
    [t('healthy')]: b.healthy,
    [t('atRisk')]: b.atRisk,
    [t('suspicious')]: b.suspicious,
    total: b.total,
  }))

  const appleTooltipStyle = {
    backgroundColor: 'rgba(255, 255, 255, 0.96)',
    backdropFilter: 'blur(16px)',
    border: '1px solid rgba(0, 0, 0, 0.08)',
    borderRadius: '14px',
    color: '#1D1D1F',
    fontSize: '12px',
    boxShadow: '0 8px 30px rgba(0, 0, 0, 0.06)',
    padding: '10px 14px',
  }

  return (
    <div className="space-y-10 sm:space-y-12 animate-in fade-in duration-300">
      {/* ---------------------------------------------------- */}
      {/* 1. TOP SUMMARY CARDS (Spacious, Sleek Apple Light)   */}
      {/* ---------------------------------------------------- */}
      <section>
        <div className="flex items-baseline justify-between mb-4 px-1">
          <div>
            <h1 className="text-2xl sm:text-3xl font-semibold text-slate-900 tracking-tight">
              {t('tabDashboard')}
            </h1>
            <p className="text-xs text-slate-500 font-normal mt-0.5">
              {t('tagline')}
            </p>
          </div>
          <span className="text-xs text-slate-500 font-medium hidden sm:inline-flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            {t('morningShift')}
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 sm:gap-5">
          {/* Total Cows */}
          <div className="bg-white rounded-3xl p-5 sm:p-6 border border-black/[0.06] shadow-[0_2px_12px_rgba(0,0,0,0.02)] flex flex-col justify-between hover:border-black/[0.12] transition-all">
            <span className="text-xs font-normal text-slate-500">
              {t('totalCows')}
            </span>
            <div className="text-3xl sm:text-4xl font-semibold text-slate-900 tracking-tight mt-2">
              {totalCows}
            </div>
            <div className="text-xs text-slate-400 font-normal mt-3">
              {t('allStock')}
            </div>
          </div>

          {/* Cows Checked Today */}
          <div className="bg-white rounded-3xl p-5 sm:p-6 border border-black/[0.06] shadow-[0_2px_12px_rgba(0,0,0,0.02)] flex flex-col justify-between hover:border-black/[0.12] transition-all">
            <span className="text-xs font-normal text-slate-500">
              {t('testedToday')}
            </span>
            <div className="text-3xl sm:text-4xl font-semibold text-blue-600 tracking-tight mt-2">
              {checkedToday}
            </div>
            <div className="text-xs text-blue-600/80 font-normal mt-3">
              {t('checkedCoverage')}
            </div>
          </div>

          {/* Healthy */}
          <div className="bg-white rounded-3xl p-5 sm:p-6 border border-black/[0.06] shadow-[0_2px_12px_rgba(0,0,0,0.02)] flex flex-col justify-between hover:border-black/[0.12] transition-all">
            <div className="flex items-center justify-between">
              <span className="text-xs font-normal text-slate-500">
                {t('healthy')}
              </span>
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
            </div>
            <div className="text-3xl sm:text-4xl font-semibold text-emerald-600 tracking-tight mt-2">
              {healthyCount}
            </div>
            <div className="text-xs text-emerald-700 font-normal mt-3">
              {t('normalParams')}
            </div>
          </div>

          {/* At Risk */}
          <div className="bg-white rounded-3xl p-5 sm:p-6 border border-black/[0.06] shadow-[0_2px_12px_rgba(0,0,0,0.02)] flex flex-col justify-between hover:border-black/[0.12] transition-all">
            <div className="flex items-center justify-between">
              <span className="text-xs font-normal text-slate-500">
                {t('atRisk')}
              </span>
              <span className="w-2 h-2 rounded-full bg-amber-500" />
            </div>
            <div className="text-3xl sm:text-4xl font-semibold text-amber-600 tracking-tight mt-2">
              {atRiskCount}
            </div>
            <div className="text-xs text-amber-700 font-normal mt-3">
              {t('checkEvening')}
            </div>
          </div>

          {/* Suspicious */}
          <div
            onClick={() => setActiveTab('actions')}
            className="col-span-2 sm:col-span-1 bg-white rounded-3xl p-5 sm:p-6 border border-rose-200/90 shadow-[0_2px_12px_rgba(244,63,94,0.04)] flex flex-col justify-between cursor-pointer hover:border-rose-400 hover:shadow-[0_4px_16px_rgba(244,63,94,0.08)] transition-all"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-rose-700">
                {t('suspicious')}
              </span>
              <ArrowRight className="w-3.5 h-3.5 text-rose-500" />
            </div>
            <div className="text-3xl sm:text-4xl font-semibold text-rose-600 tracking-tight mt-2">
              {suspiciousCount}
            </div>
            <div className="text-xs text-rose-600 font-medium mt-3">
              {t('actionNeeded')}
            </div>
          </div>
        </div>
      </section>

      {/* ---------------------------------------------------- */}
      {/* 2. FARM ENVIRONMENTAL PARAMETERS                     */}
      {/* ---------------------------------------------------- */}
      <section className="bg-white rounded-3xl p-6 sm:p-8 border border-black/[0.06] shadow-[0_2px_12px_rgba(0,0,0,0.02)]">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-6">
          <div>
            <h2 className="text-lg font-semibold text-slate-900 tracking-tight">
              {t('farmEnvironment')}
            </h2>
            <p className="text-xs text-slate-500 font-normal mt-0.5">
              {t('farmEnvSubtitle')}
            </p>
          </div>
          <span className="text-xs font-normal text-slate-500 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            {t('sensorsActive')}
          </span>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {/* Temperature */}
          <div className="p-5 rounded-2xl bg-[#FBFBFD] border border-black/[0.04] flex items-center justify-between">
            <div>
              <div className="text-xs text-slate-500 font-normal">
                {t('ambientTemp')}
              </div>
              <div className="text-2xl sm:text-3xl font-semibold text-slate-900 mt-1 tracking-tight">
                {FARM_ENVIRONMENT.tempC}°C
              </div>
            </div>
            <span className="text-xs font-medium text-emerald-700">
              {FARM_ENVIRONMENT.tempStatus}
            </span>
          </div>

          {/* Humidity */}
          <div className="p-5 rounded-2xl bg-[#FBFBFD] border border-black/[0.04] flex items-center justify-between">
            <div>
              <div className="text-xs text-slate-500 font-normal">
                {t('humidity')}
              </div>
              <div className="text-2xl sm:text-3xl font-semibold text-slate-900 mt-1 tracking-tight">
                {FARM_ENVIRONMENT.humidityPct}%
              </div>
            </div>
            <span className="text-xs font-medium text-amber-700">
              {FARM_ENVIRONMENT.humidityStatus}
            </span>
          </div>

          {/* NH3 Ammonia */}
          <div className="p-5 rounded-2xl bg-[#FBFBFD] border border-black/[0.04] flex items-center justify-between">
            <div>
              <div className="text-xs text-slate-500 font-normal">
                {t('nh3')}
              </div>
              <div className="text-2xl sm:text-3xl font-semibold text-slate-900 mt-1 tracking-tight">
                {FARM_ENVIRONMENT.nh3Ppm} ppm
              </div>
            </div>
            <span className="text-xs font-medium text-emerald-700">
              {FARM_ENVIRONMENT.nh3Status}
            </span>
          </div>

          {/* THI */}
          <div className="p-5 rounded-2xl bg-[#FBFBFD] border border-black/[0.04] flex items-center justify-between">
            <div>
              <div className="text-xs text-slate-500 font-normal">
                {t('thi')}
              </div>
              <div className="text-2xl sm:text-3xl font-semibold text-slate-900 mt-1 tracking-tight">
                {FARM_ENVIRONMENT.thi}
              </div>
            </div>
            <span className="text-xs font-medium text-amber-700">
              {FARM_ENVIRONMENT.thiStatus}
            </span>
          </div>
        </div>
      </section>

      {/* ---------------------------------------------------- */}
      {/* 3. PEN-WISE OVERVIEW                                 */}
      {/* ---------------------------------------------------- */}
      <section>
        <div className="flex items-baseline justify-between mb-4 px-1">
          <div>
            <h2 className="text-lg font-semibold text-slate-900 tracking-tight">
              {t('penOverview')}
            </h2>
            <p className="text-xs text-slate-500 font-normal mt-0.5">
              {t('penOverviewSubtitle')}
            </p>
          </div>
          <button
            onClick={() => setActiveTab('actions')}
            className="text-xs font-medium text-slate-700 hover:text-black flex items-center gap-1 transition-colors"
          >
            <span>{t('viewFlagged')}</span>
            <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
          {PEN_SUMMARIES.map((pen) => {
            const hasSuspicious = pen.suspicious > 0

            return (
              <div
                key={pen.name}
                className={`bg-white rounded-3xl p-5 sm:p-6 border transition-all duration-200 ${
                  hasSuspicious
                    ? 'border-rose-200 shadow-[0_2px_14px_rgba(244,63,94,0.06)] hover:border-rose-300'
                    : 'border-black/[0.06] shadow-[0_2px_12px_rgba(0,0,0,0.02)] hover:border-black/[0.12]'
                }`}
              >
                <div className="flex items-center justify-between pb-3.5 border-b border-black/[0.04]">
                  <div className="font-semibold text-base text-slate-900 tracking-tight">
                    {pen.name}
                  </div>
                  <span className="text-xs text-slate-400 font-normal">
                    {pen.totalCows} {t('tabAnimals').toLowerCase()}
                  </span>
                </div>

                <div className="mt-4 space-y-2.5 text-xs">
                  <div className="flex items-center justify-between text-slate-600">
                    <span className="font-normal">{t('checkedToday')}</span>
                    <span className="font-medium text-slate-900">
                      {pen.checkedToday} / {pen.totalCows}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-slate-600">
                    <span className="flex items-center gap-1.5 font-normal">
                      <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                      <span>{t('suspicious')}</span>
                    </span>
                    <span
                      className={`font-semibold ${pen.suspicious > 0 ? 'text-rose-600' : 'text-slate-400'}`}
                    >
                      {pen.suspicious}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-slate-600">
                    <span className="flex items-center gap-1.5 font-normal">
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                      <span>{t('atRisk')}</span>
                    </span>
                    <span className="font-medium text-amber-700">{pen.atRisk}</span>
                  </div>

                  <div className="flex items-center justify-between text-slate-600">
                    <span className="flex items-center gap-1.5 font-normal">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                      <span>{t('healthy')}</span>
                    </span>
                    <span className="font-medium text-emerald-700">{pen.healthy}</span>
                  </div>
                </div>

                <div className="mt-5 pt-3.5 border-t border-black/[0.04] flex items-center justify-between">
                  <span
                    className={`text-xs font-medium ${
                      hasSuspicious
                        ? 'text-rose-600'
                        : pen.atRisk > 0
                          ? 'text-amber-700'
                          : 'text-emerald-700'
                    }`}
                  >
                    {hasSuspicious
                      ? `${pen.suspicious} ${t('statusSuspicious')}`
                      : pen.atRisk > 0
                        ? `${pen.atRisk} ${t('statusAtRisk')}`
                        : t('statusHealthy')}
                  </span>
                  <button
                    onClick={() => setActiveTab('animals')}
                    className="text-xs font-normal text-slate-500 hover:text-slate-900 transition-colors"
                  >
                    {t('viewCows')} &rarr;
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      </section>

      {/* ---------------------------------------------------- */}
      {/* 4. VISUAL TREND CHARTS & AI OBSERVATIONS            */}
      {/* ---------------------------------------------------- */}
      <section className="space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-1">
          <div>
            <h2 className="text-lg font-semibold text-slate-900 tracking-tight">
              {t('chartsHeading')}
            </h2>
            <p className="text-xs text-slate-500 font-normal mt-0.5">
              {t('chartsSubtitle')}
            </p>
          </div>

          {/* Apple Segmented Control */}
          <div className="inline-flex items-center p-1 bg-black/[0.04] rounded-2xl gap-1 w-fit">
            <button
              onClick={() => setActiveChartTab('pens')}
              className={`px-3.5 py-1.5 text-xs font-medium rounded-xl transition-all ${
                activeChartTab === 'pens'
                  ? 'bg-white text-slate-900 shadow-[0_1px_4px_rgba(0,0,0,0.06)] font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {t('tabPenHealth')}
            </button>
            <button
              onClick={() => setActiveChartTab('breeds')}
              className={`px-3.5 py-1.5 text-xs font-medium rounded-xl transition-all ${
                activeChartTab === 'breeds'
                  ? 'bg-white text-slate-900 shadow-[0_1px_4px_rgba(0,0,0,0.06)] font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {t('tabBreedSummary')}
            </button>
            <button
              onClick={() => setActiveChartTab('climate')}
              className={`px-3.5 py-1.5 text-xs font-medium rounded-xl transition-all ${
                activeChartTab === 'climate'
                  ? 'bg-white text-slate-900 shadow-[0_1px_4px_rgba(0,0,0,0.06)] font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {t('tabMicroclimate')}
            </button>
            <button
              onClick={() => setActiveChartTab('yieldCorr')}
              className={`px-3.5 py-1.5 text-xs font-medium rounded-xl transition-all ${
                activeChartTab === 'yieldCorr'
                  ? 'bg-white text-slate-900 shadow-[0_1px_4px_rgba(0,0,0,0.06)] font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {t('tabYieldCorr')}
            </button>
          </div>
        </div>

        {/* Clean Spacious Chart Card */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-black/[0.06] shadow-[0_2px_12px_rgba(0,0,0,0.02)]">
          {/* TAB 1: Pen Health */}
          {activeChartTab === 'pens' && (
            <div>
              <div className="mb-6">
                <h3 className="text-base font-semibold text-slate-900 tracking-tight">
                  {t('penHealthTitle')}
                </h3>
                <p className="text-xs text-slate-500 font-normal mt-0.5">
                  {t('penHealthSubtitle')}
                </p>
              </div>

              <div className="h-64 sm:h-72 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={penChartData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F5F5F7" />
                    <XAxis dataKey="name" stroke="#86868B" fontSize={12} tickLine={false} />
                    <YAxis stroke="#86868B" fontSize={12} tickLine={false} />
                    <Tooltip contentStyle={appleTooltipStyle} />
                    <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '16px' }} />
                    <Bar dataKey={t('healthy')} fill="#10B981" radius={[4, 4, 0, 0]} />
                    <Bar dataKey={t('atRisk')} fill="#F59E0B" radius={[4, 4, 0, 0]} />
                    <Bar dataKey={t('suspicious')} fill="#F43F5E" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              {/* AI Insight Box */}
              <div className="mt-8 p-5 rounded-2xl bg-[#FBFBFD] border border-black/[0.04] flex items-start gap-3.5">
                <Sparkles className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                <div>
                  <div className="text-xs font-semibold text-slate-900">
                    {t('aiInsightTitle')}
                  </div>
                  <p className="text-xs text-slate-600 mt-1 leading-relaxed font-normal">
                    {t('penAiInsight')}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: Breed Summary */}
          {activeChartTab === 'breeds' && (
            <div>
              <div className="mb-6">
                <h3 className="text-base font-semibold text-slate-900 tracking-tight">
                  {t('breedHealthTitle')}
                </h3>
                <p className="text-xs text-slate-500 font-normal mt-0.5">
                  {t('breedHealthSubtitle')}
                </p>
              </div>

              <div className="h-64 sm:h-72 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    layout="vertical"
                    data={breedChartData}
                    margin={{ top: 10, right: 20, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#F5F5F7" />
                    <XAxis type="number" stroke="#86868B" fontSize={12} tickLine={false} />
                    <YAxis dataKey="name" type="category" stroke="#1D1D1F" fontSize={12} width={85} tickLine={false} />
                    <Tooltip
                      formatter={(value: any, name: any) => [`${value}`, name]}
                      contentStyle={appleTooltipStyle}
                    />
                    <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '16px' }} />
                    <Bar dataKey={t('healthy')} stackId="a" fill="#10B981" />
                    <Bar dataKey={t('atRisk')} stackId="a" fill="#F59E0B" />
                    <Bar dataKey={t('suspicious')} stackId="a" fill="#F43F5E" radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              {/* AI Insight Box */}
              <div className="mt-8 p-5 rounded-2xl bg-[#FBFBFD] border border-black/[0.04] flex items-start gap-3.5">
                <Sparkles className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                <div>
                  <div className="text-xs font-semibold text-slate-900">
                    {t('aiInsightTitle')}
                  </div>
                  <p className="text-xs text-slate-600 mt-1 leading-relaxed font-normal">
                    {t('breedAiInsight')}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: 24h Microclimate */}
          {activeChartTab === 'climate' && (
            <div>
              <div className="mb-6">
                <h3 className="text-base font-semibold text-slate-900 tracking-tight">
                  {t('climateTitle')}
                </h3>
                <p className="text-xs text-slate-500 font-normal mt-0.5">
                  {t('climateSubtitle')}
                </p>
              </div>

              <div className="h-64 sm:h-72 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={HOURLY_ENVIRONMENT_TRENDS} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                    <defs>
                      <linearGradient id="thiGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#F59E0B" stopOpacity={0.15} />
                        <stop offset="95%" stopColor="#F59E0B" stopOpacity={0.0} />
                      </linearGradient>
                      <linearGradient id="tempGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#0071E3" stopOpacity={0.12} />
                        <stop offset="95%" stopColor="#0071E3" stopOpacity={0.0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F5F5F7" />
                    <XAxis dataKey="time" stroke="#86868B" fontSize={11} tickLine={false} />
                    <YAxis stroke="#86868B" fontSize={11} tickLine={false} />
                    <Tooltip contentStyle={appleTooltipStyle} />
                    <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '16px' }} />
                    <Area type="monotone" dataKey="thi" name={t('thi')} stroke="#F59E0B" strokeWidth={2} fillOpacity={1} fill="url(#thiGrad)" />
                    <Area type="monotone" dataKey="tempC" name={`${t('ambientTemp')} (°C)`} stroke="#0071E3" strokeWidth={2} fillOpacity={1} fill="url(#tempGrad)" />
                    <Line type="monotone" dataKey="humidityPct" name={`${t('humidity')} (%)`} stroke="#10B981" strokeWidth={1.5} dot={{ r: 3 }} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>

              {/* AI Insight Box */}
              <div className="mt-8 p-5 rounded-2xl bg-[#FBFBFD] border border-black/[0.04] flex items-start gap-3.5">
                <Sparkles className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                <div>
                  <div className="text-xs font-semibold text-slate-900">
                    {t('aiInsightTitle')}
                  </div>
                  <p className="text-xs text-slate-600 mt-1 leading-relaxed font-normal">
                    {t('climateAiInsight')}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: Yield vs Conductivity Correlation */}
          {activeChartTab === 'yieldCorr' && (
            <div>
              <div className="mb-6">
                <h3 className="text-base font-semibold text-slate-900 tracking-tight">
                  {t('yieldCorrTitle')}
                </h3>
                <p className="text-xs text-slate-500 font-normal mt-0.5">
                  {t('yieldCorrSubtitle')}
                </p>
              </div>

              <div className="h-64 sm:h-72 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <ComposedChart data={HERD_DAILY_TRENDS} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                    <defs>
                      <linearGradient id="yieldFillGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10B981" stopOpacity={0.15} />
                        <stop offset="95%" stopColor="#10B981" stopOpacity={0.0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F5F5F7" />
                    <XAxis dataKey="date" stroke="#86868B" fontSize={11} tickLine={false} />
                    <YAxis yAxisId="left" stroke="#10B981" fontSize={11} tickLine={false} label={{ value: 'Yield (L)', angle: -90, position: 'insideLeft', fontSize: 10 }} />
                    <YAxis yAxisId="right" orientation="right" stroke="#F43F5E" fontSize={11} tickLine={false} label={{ value: 'Conductivity', angle: 90, position: 'insideRight', fontSize: 10 }} />
                    <Tooltip contentStyle={appleTooltipStyle} />
                    <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '16px' }} />
                    <Area yAxisId="left" type="monotone" dataKey="avgYieldL" name={`${t('yieldLabel')} (L)`} fill="url(#yieldFillGrad)" stroke="#10B981" strokeWidth={2} />
                    <Line yAxisId="right" type="monotone" dataKey="avgEc" name={t('ecLabel')} stroke="#F43F5E" strokeWidth={2} dot={{ r: 4 }} />
                  </ComposedChart>
                </ResponsiveContainer>
              </div>

              {/* AI Insight Box */}
              <div className="mt-8 p-5 rounded-2xl bg-[#FBFBFD] border border-black/[0.04] flex items-start gap-3.5">
                <Sparkles className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                <div>
                  <div className="text-xs font-semibold text-slate-900">
                    {t('aiInsightTitle')}
                  </div>
                  <p className="text-xs text-slate-600 mt-1 leading-relaxed font-normal">
                    {t('yieldCorrAiInsight')}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* ---------------------------------------------------- */}
      {/* 5. WEARABLE COLLAR UTILISATION SECTION               */}
      {/* ---------------------------------------------------- */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
        {/* Collars in use (2 Cols) */}
        <div className="lg:col-span-2 bg-white rounded-3xl p-6 sm:p-8 border border-black/[0.06] shadow-[0_2px_12px_rgba(0,0,0,0.02)] flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-lg font-semibold text-slate-900 tracking-tight">
                  {t('wearableUtilisation')}
                </h2>
                <p className="text-xs text-slate-500 font-normal mt-0.5">
                  {t('wearableSubtitle')}
                </p>
              </div>
              <span className="text-xs font-normal text-slate-400">
                {WEARABLE_STATS.utilisationPct}% in use
              </span>
            </div>

            {/* Suspicious Cows Breakdown */}
            <div className="grid grid-cols-3 gap-3.5 p-4 rounded-2xl bg-[#FBFBFD] border border-black/[0.04]">
              <div className="p-3.5 bg-white rounded-2xl border border-black/[0.06] text-center">
                <span className="text-xs text-slate-500 font-normal">{t('statusSuspicious')}</span>
                <div className="text-2xl font-semibold text-slate-900 mt-1 tracking-tight">
                  {WEARABLE_STATS.suspiciousCows}
                </div>
                <span className="text-[11px] text-slate-400 font-normal">{t('needAction')}</span>
              </div>
              <div className="p-3.5 bg-white rounded-2xl border border-emerald-200/80 text-center">
                <span className="text-xs text-emerald-700 font-medium">{t('wearableActive')}</span>
                <div className="text-2xl font-semibold text-emerald-600 mt-1 tracking-tight">
                  {WEARABLE_STATS.suspiciousWithWearable}
                </div>
                <span className="text-[11px] text-emerald-600 font-normal">{t('activeWearable')}</span>
              </div>
              <div className="p-3.5 bg-white rounded-2xl border border-amber-200/80 text-center">
                <span className="text-xs text-amber-700 font-medium">{t('pendingWearable')}</span>
                <div className="text-2xl font-semibold text-amber-600 mt-1 tracking-tight">
                  {WEARABLE_STATS.suspiciousPendingWearable}
                </div>
                <span className="text-[11px] text-amber-600 font-normal">{t('pendingStart')}</span>
              </div>
            </div>

            {/* Progress / Utilisation Bar */}
            <div className="mt-5 p-4 rounded-2xl bg-[#FBFBFD] border border-black/[0.04]">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-normal text-slate-600">
                  {t('collarsInUse')}
                </span>
                <span className="text-xs font-semibold text-slate-900">
                  {WEARABLE_STATS.activeWearables} / {WEARABLE_STATS.totalWearables}
                </span>
              </div>
              <div className="w-full bg-black/[0.06] rounded-full h-1.5 mb-3 overflow-hidden">
                <div
                  className="bg-[#1D1D1F] h-1.5 rounded-full transition-all duration-500"
                  style={{ width: `${WEARABLE_STATS.utilisationPct}%` }}
                />
              </div>

              <div className="grid grid-cols-3 gap-2 text-xs text-slate-600 pt-1">
                <div>
                  <span className="block font-semibold text-slate-900">
                    {WEARABLE_STATS.totalWearables}
                  </span>
                  <span className="text-[11px] text-slate-500">{t('wearablesTotal')}</span>
                </div>
                <div>
                  <span className="block font-semibold text-emerald-700">
                    {WEARABLE_STATS.activeWearables}
                  </span>
                  <span className="text-[11px] text-slate-500">{t('currentlyActive')}</span>
                </div>
                <div>
                  <span className="block font-semibold text-blue-700">
                    {WEARABLE_STATS.availableWearables}
                  </span>
                  <span className="text-[11px] text-slate-500">{t('available')}</span>
                </div>
              </div>
            </div>
          </div>

          {/* AI Recommendation Box */}
          <div className="mt-5 p-4 rounded-2xl bg-[#FBFBFD] border border-black/[0.04] flex items-start gap-3">
            <Sparkles className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
            <p className="text-xs text-slate-600 leading-relaxed font-normal">
              {t('collarsRecommendation')}
            </p>
          </div>
        </div>

        {/* Doctor & Google Calendar Action (1 Col) */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-black/[0.06] shadow-[0_2px_12px_rgba(0,0,0,0.02)] flex flex-col justify-between">
          <div>
            <div className="w-10 h-10 rounded-2xl bg-black/[0.04] text-slate-900 flex items-center justify-center font-bold mb-5">
              <Calendar className="w-5 h-5 text-blue-600" />
            </div>
            <h3 className="text-lg font-semibold text-slate-900 tracking-tight">
              {t('scheduleVet')}
            </h3>
            <p className="text-xs text-slate-500 font-normal mt-1 leading-relaxed">
              {t('bookVetSubtitle')}
            </p>

            <div className="mt-5 p-4 rounded-2xl bg-[#FBFBFD] border border-black/[0.04] space-y-2">
              <div className="text-xs font-medium text-slate-800">
                {t('actionNeeded')}
              </div>
              <div className="text-xs text-slate-600 space-y-1.5 pt-1">
                <div className="flex items-center justify-between">
                  <span>Cow 024 (Gir · Pen 2)</span>
                  <span className="text-rose-600 font-medium">{t('statusSuspicious')}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Cow 042 (Sahiwal · Pen 3)</span>
                  <span className="text-rose-600 font-medium">{t('statusSuspicious')}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-6 space-y-2.5">
            <button
              onClick={() => {
                const cow24 = animals.find((a) => a.tag === '024') || animals[0]
                if (cow24) openAppointmentModal(cow24)
              }}
              className="w-full py-2.5 px-4 rounded-full bg-[#1D1D1F] hover:bg-black text-white font-medium text-xs flex items-center justify-center gap-2 shadow-sm transition-all active:scale-98"
            >
              <Calendar className="w-3.5 h-3.5 text-blue-400" />
              <span>{t('scheduleVet')}</span>
            </button>
            <button
              onClick={() => setActiveTab('actions')}
              className="w-full py-2.5 px-4 rounded-full bg-black/[0.04] hover:bg-black/[0.08] text-slate-700 font-medium text-xs transition-colors"
            >
              {t('reviewFlaggedCows')}
            </button>
          </div>
        </div>
      </section>
    </div>
  )
}
