import React from 'react'

import { useHerd } from '../context/HerdContext'
import { EmptyState } from './ui/EmptyState'
import { ErrorState } from './ui/ErrorState'
import { LoadingState } from './ui/LoadingState'
import { motion } from 'framer-motion'
import {
  Activity,
  AlertTriangle,
  Droplets,
  Radio,
  RotateCcw,
  ShieldCheck,
  Thermometer,
  TrendingUp,
  Users,
} from 'lucide-react'
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Scatter,
  ScatterChart,
  Tooltip,
  XAxis,
  YAxis,
  ZAxis,
} from 'recharts'

export const DashboardOverview: React.FC = () => {
  const {
    animals,
    barnZones,
    tabLoading,
    tabError,
    isRetryingTab,
    retryTab,
    resetToSampleData,
    t,
  } = useHerd()

  const isLoading = tabLoading.dashboard
  const error = tabError.dashboard
  const isRetrying = isRetryingTab.dashboard

  /* =========================================================
     LOADING
  ========================================================= */

  if (isLoading) {
    return (
      <div className="space-y-6">
        <LoadingState
          title="Loading Herd Overview..."
          message="Updating herd telemetry and screening status..."
          variant="screen"
        />
      </div>
    )
  }

  /* =========================================================
     ERROR
  ========================================================= */

  if (error) {
    return (
      <div className="space-y-6">
        <ErrorState
          title="Unable to load dashboard data"
          message={error}
          onRetry={() => retryTab('dashboard')}
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

  /* =========================================================
     EMPTY
  ========================================================= */

  if (animals.length === 0) {
    return (
      <div className="space-y-6">
        <EmptyState
          icon="inbox"
          title="No Animals Found"
          description="Hardware sensor telemetry will register active cows, or you can load initial herd records."
          primaryAction={{
            label: t('actionRestoreData'),
            onClick: resetToSampleData,
            icon: <RotateCcw className="w-4 h-4" />,
          }}
        />
      </div>
    )
  }

  /* =========================================================
     HERD COUNTS
  ========================================================= */

  const totalAnimals = animals.length

  const riskedCows = animals.filter((a) => a.currentRisk === 'risked')

  const suspectedCows = animals.filter((a) => a.currentRisk === 'suspected')

  const normalCows = animals.filter((a) => a.currentRisk === 'normal')

  const screenedCows = animals.filter((a) => a.scc !== undefined && a.scc > 0)

  const flaggedCows = [...riskedCows, ...suspectedCows]

  const screeningCoverage =
    totalAnimals > 0 ? Math.round((screenedCows.length / totalAnimals) * 100) : 0

  /* =========================================================
     RISK DISTRIBUTION
  ========================================================= */

  const riskDistribution = [
    {
      name: 'Normal',
      value: normalCows.length,
    },
    {
      name: 'Suspected',
      value: suspectedCows.length,
    },
    {
      name: 'Risked',
      value: riskedCows.length,
    },
  ]

  /* =========================================================
     RISK BY PEN / ZONE
  ========================================================= */

  const zoneRiskData = barnZones.map((zone) => {
    const zoneAnimals = animals.filter((cow) => cow.assignedPen === zone.name)

    return {
      name: zone.name,
      Normal: zoneAnimals.filter((cow) => cow.currentRisk === 'normal').length,
      Suspected: zoneAnimals.filter((cow) => cow.currentRisk === 'suspected').length,
      Risked: zoneAnimals.filter((cow) => cow.currentRisk === 'risked').length,
    }
  })

  /*
   * Fallback to assigned pens if barnZones do not match
   * the animal data.
   */
  const assignedPens = [...new Set(animals.map((cow) => cow.assignedPen).filter(Boolean))]

  const finalZoneRiskData =
    zoneRiskData.length > 0 &&
    zoneRiskData.some((zone) => zone.Normal + zone.Suspected + zone.Risked > 0)
      ? zoneRiskData
      : assignedPens.map((pen) => {
          const penAnimals = animals.filter((cow) => cow.assignedPen === pen)

          return {
            name: pen,
            Normal: penAnimals.filter((cow) => cow.currentRisk === 'normal').length,
            Suspected: penAnimals.filter((cow) => cow.currentRisk === 'suspected').length,
            Risked: penAnimals.filter((cow) => cow.currentRisk === 'risked').length,
          }
        })

  /* =========================================================
     MILK SCREENING DATA
  ========================================================= */

  const milkScreeningData = screenedCows
    .filter((cow) => cow.scc !== undefined && cow.ec !== undefined)
    .map((cow) => ({
      scc: cow.scc,
      ec: cow.ec,
      risk: cow.currentRisk,
      tag: cow.tag,
    }))

  /* =========================================================
     SCREENING COVERAGE
  ========================================================= */

  const screeningData = [
    {
      name: 'Screened',
      value: screenedCows.length,
    },
    {
      name: 'Not Screened',
      value: Math.max(totalAnimals - screenedCows.length, 0),
    },
  ]

  /* =========================================================
     WEARABLE DATA
  ========================================================= */

  const wearableCows = flaggedCows.filter((cow) => cow.wearable)

  const telemetryData = wearableCows.map((cow) => ({
    name: cow.tag,
    rumination: cow.wearable?.ruminationMinutes ?? 0,
    bodyTemp: cow.wearable?.bodyTemp ?? 0,
    risk: cow.currentRisk,
  }))

  /* =========================================================
     HEAT STRESS BY ZONE
  ========================================================= */

  const heatStressData = barnZones.map((zone) => ({
    name: zone.name,
    THI: Number(zone.thi ?? 0),
  }))

  const maxThi = barnZones.reduce((max, zone) => Math.max(max, Number(zone.thi ?? 0)), 0) || 0

  /* =========================================================
     ANALYTICAL VALUES
  ========================================================= */

  const riskPercentage =
    totalAnimals > 0
      ? Math.round(((riskedCows.length + suspectedCows.length) / totalAnimals) * 100)
      : 0

  const averageScc =
    screenedCows.length > 0
      ? Math.round(screenedCows.reduce((sum, cow) => sum + (cow.scc || 0), 0) / screenedCows.length)
      : 0

  const highSccCows = screenedCows.filter((cow) => cow.scc > 200)

  const highEcCows = screenedCows.filter((cow) => cow.ec > 6.0)

  const averageRumination =
    wearableCows.length > 0
      ? Math.round(
          wearableCows.reduce((sum, cow) => sum + (cow.wearable?.ruminationMinutes || 0), 0) /
            wearableCows.length,
        )
      : 0

  /* =========================================================
     CHART TOOLTIP
  ========================================================= */

  const tooltipStyle = {
    backgroundColor: '#ffffff',
    border: '1px solid #e2e8f0',
    borderRadius: '10px',
    fontSize: '12px',
  }

  return (
    <div className="space-y-5">
      {/* =====================================================
          HERD STATUS
      ===================================================== */}

      <div
        className={`p-4 sm:p-5 rounded-2xl border flex items-center gap-3 shadow-xs ${
          flaggedCows.length > 0
            ? 'bg-red-50/80 border-red-200'
            : 'bg-emerald-50 border-emerald-200'
        }`}
      >
        <div
          className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
            flaggedCows.length > 0 ? 'bg-red-600 text-white' : 'bg-emerald-600 text-white'
          }`}
        >
          {flaggedCows.length > 0 ? (
            <AlertTriangle className="w-5 h-5" />
          ) : (
            <ShieldCheck className="w-5 h-5" />
          )}
        </div>

        <div>
          <div className="text-base sm:text-lg font-black text-slate-900">
            {flaggedCows.length > 0 ? `${flaggedCows.length} ${t('herdFlagged')}` : t('herdClear')}
          </div>

          <p className="text-xs text-slate-600 mt-0.5 font-medium">
            {flaggedCows.length > 0
              ? `${riskedCows.length} risked · ${suspectedCows.length} suspected · ${riskPercentage}% of herd flagged`
              : t('herdClearDesc')}
          </p>
        </div>
      </div>

      {/* =====================================================
          KPI CARDS
      ===================================================== */}

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* Total Herd */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              {t('totalCows')}
            </span>

            <Users className="w-4 h-4 text-slate-400" />
          </div>

          <div className="text-2xl sm:text-3xl font-black text-slate-900 mt-2">{totalAnimals}</div>

          <span className="text-[11px] text-slate-400 font-medium">{t('activeHerd')}</span>
        </motion.div>

        {/* Screening Coverage */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.04 }}
          className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              {t('testedToday')}
            </span>

            <Radio className="w-4 h-4 text-blue-500" />
          </div>

          <div className="text-2xl sm:text-3xl font-black text-blue-600 mt-2">
            {screenedCows.length}
            <span className="text-sm text-slate-400"> / {totalAnimals}</span>
          </div>

          <span className="text-[11px] text-blue-600 font-bold">
            {screeningCoverage}% {t('coveragePct')}
          </span>
        </motion.div>

        {/* Flagged */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.08 }}
          className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              {t('atRisk')}
            </span>

            <Activity className="w-4 h-4 text-red-500" />
          </div>

          <div
            className={`text-2xl sm:text-3xl font-black mt-2 ${
              flaggedCows.length > 0 ? 'text-red-600' : 'text-emerald-600'
            }`}
          >
            {flaggedCows.length}
          </div>

          <span className="text-[11px] text-slate-500 font-medium">
            {riskedCows.length} risked · {suspectedCows.length} suspected
          </span>
        </motion.div>

        {/* Heat Stress */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.12 }}
          className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              {t('heatStress')}
            </span>

            <Thermometer className="w-4 h-4 text-amber-500" />
          </div>

          <div className="text-2xl sm:text-3xl font-black text-amber-600 mt-2">
            {maxThi.toFixed(1)}
          </div>

          <span className="text-[11px] text-slate-500 font-medium">{t('maximumThi')}</span>
        </motion.div>
      </div>

      {/* =====================================================
          RISK + SCREENING OVERVIEW
      ===================================================== */}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Risk Distribution */}
        <div className="bg-white rounded-xl border border-slate-200 p-4 sm:p-5 shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <div>
              <h2 className="text-sm font-black text-slate-900">{t('herdRiskDistribution')}</h2>

              <p className="text-[11px] text-slate-500 mt-0.5">{t('currentClassification')}</p>
            </div>
          </div>

          <div className="h-[270px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={riskDistribution}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="48%"
                  innerRadius={65}
                  outerRadius={95}
                  paddingAngle={3}
                  strokeWidth={0}
                >
                  <Cell fill="#10b981" />
                  <Cell fill="#f59e0b" />
                  <Cell fill="#ef4444" />
                </Pie>

                <Tooltip
                  contentStyle={tooltipStyle}
                  formatter={(value) => [`${value ?? 0} cows`, 'Count']}
                />

                <Legend
                  verticalAlign="bottom"
                  height={28}
                  iconType="circle"
                  wrapperStyle={{
                    fontSize: '11px',
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Screening Coverage */}
        <div className="bg-white rounded-xl border border-slate-200 p-4 sm:p-5 shadow-xs">
          <div>
            <h2 className="text-sm font-black text-slate-900">{t('screeningCoverage')}</h2>

            <p className="text-[11px] text-slate-500 mt-0.5">{t('screeningCoverageDesc')}</p>
          </div>

          <div className="h-[270px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={screeningData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="48%"
                  innerRadius={65}
                  outerRadius={95}
                  paddingAngle={3}
                  strokeWidth={0}
                >
                  <Cell fill="#3b82f6" />
                  <Cell fill="#e2e8f0" />
                </Pie>

                <Tooltip
                  contentStyle={tooltipStyle}
                  formatter={(value) => [`${value ?? 0} cows`, 'Count']}
                />

                <Legend
                  verticalAlign="bottom"
                  height={28}
                  iconType="circle"
                  wrapperStyle={{
                    fontSize: '11px',
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="text-center -mt-2">
            <span className="text-2xl font-black text-blue-600">{screeningCoverage}%</span>

            <span className="text-xs text-slate-500 ml-1">{t('screened')}</span>
          </div>
        </div>
      </div>

      {/* =====================================================
          RISK BY PEN
      ===================================================== */}

      <div className="bg-white rounded-xl border border-slate-200 p-4 sm:p-5 shadow-xs">
        <div className="mb-3">
          <h2 className="text-sm font-black text-slate-900">{t('riskByPen')}</h2>

          <p className="text-[11px] text-slate-500 mt-0.5">{t('riskByPenDesc')}</p>
        </div>

        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={finalZoneRiskData}
              margin={{
                top: 10,
                right: 10,
                left: -10,
                bottom: 5,
              }}
            >
              <CartesianGrid strokeDasharray="3 3" vertical={false} />

              <XAxis
                dataKey="name"
                tick={{
                  fontSize: 11,
                }}
              />

              <YAxis
                allowDecimals={false}
                tick={{
                  fontSize: 11,
                }}
              />

              <Tooltip contentStyle={tooltipStyle} />

              <Legend
                wrapperStyle={{
                  fontSize: '11px',
                }}
              />

              <Bar dataKey="Normal" stackId="risk" fill="#10b981" radius={[0, 0, 0, 0]} />

              <Bar dataKey="Suspected" stackId="risk" fill="#f59e0b" />

              <Bar dataKey="Risked" stackId="risk" fill="#ef4444" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* =====================================================
          SCC VS EC
      ===================================================== */}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="bg-white rounded-xl border border-slate-200 p-4 sm:p-5 shadow-xs">
          <div className="flex items-start justify-between gap-3 mb-3">
            <div>
              <h2 className="text-sm font-black text-slate-900">{t('sccVsEc')}</h2>

              <p className="text-[11px] text-slate-500 mt-0.5">{t('sccVsEcDesc')}</p>
            </div>

            <Droplets className="w-4 h-4 text-blue-500 shrink-0" />
          </div>

          <div className="h-[300px]">
            {milkScreeningData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <ScatterChart
                  margin={{
                    top: 10,
                    right: 15,
                    bottom: 20,
                    left: 0,
                  }}
                >
                  <CartesianGrid strokeDasharray="3 3" />

                  <XAxis
                    type="number"
                    dataKey="ec"
                    name="EC"
                    unit=" mS/cm"
                    tick={{
                      fontSize: 10,
                    }}
                    label={{
                      value: 'Milk EC (mS/cm)',
                      position: 'insideBottom',
                      offset: -10,
                      fontSize: 10,
                    }}
                  />

                  <YAxis
                    type="number"
                    dataKey="scc"
                    name="SCC"
                    unit="k"
                    tick={{
                      fontSize: 10,
                    }}
                    label={{
                      value: 'SCC (k cells/mL)',
                      angle: -90,
                      position: 'insideLeft',
                      fontSize: 10,
                    }}
                  />

                  <ZAxis range={[60, 60]} />

                  <Tooltip
                    cursor={{
                      strokeDasharray: '3 3',
                    }}
                    contentStyle={tooltipStyle}
                    formatter={(value, name) => [
                      value,
                      name === 'scc' ? 'SCC (k cells/mL)' : 'EC (mS/cm)',
                    ]}
                  />

                  <Scatter name="Screened Cows" data={milkScreeningData}>
                    {milkScreeningData.map((cow, index) => (
                      <Cell
                        key={`${cow.tag} -${index} `}
                        fill={
                          cow.risk === 'risked'
                            ? '#ef4444'
                            : cow.risk === 'suspected'
                              ? '#f59e0b'
                              : '#10b981'
                        }
                      />
                    ))}
                  </Scatter>
                </ScatterChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-xs text-slate-400">
                {t('noSccData')}
              </div>
            )}
          </div>
        </div>

        {/* =====================================================
            SCREENING ANALYSIS
        ===================================================== */}

        <div className="bg-white rounded-xl border border-slate-200 p-4 sm:p-5 shadow-xs">
          <div className="mb-4">
            <h2 className="text-sm font-black text-slate-900">{t('milkScreeningAnalysis')}</h2>

            <p className="text-[11px] text-slate-500 mt-0.5">{t('milkScreeningAnalysisDesc')}</p>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 rounded-lg bg-slate-50 border border-slate-100">
              <div>
                <p className="text-xs font-bold text-slate-800">{t('avgScc')}</p>

                <p className="text-[10px] text-slate-500 mt-0.5">{t('acrossScreened')}</p>
              </div>

              <div className="text-right">
                <span className="text-lg font-black text-slate-900">{averageScc}</span>

                <span className="text-[10px] text-slate-500 ml-1">k cells/mL</span>
              </div>
            </div>

            <div className="flex items-center justify-between p-3 rounded-lg bg-slate-50 border border-slate-100">
              <div>
                <p className="text-xs font-bold text-slate-800">{t('elevatedScc')}</p>

                <p className="text-[10px] text-slate-500 mt-0.5">{t('elevatedSccThresh')}</p>
              </div>

              <div className="text-lg font-black text-red-600">{highSccCows.length}</div>
            </div>

            <div className="flex items-center justify-between p-3 rounded-lg bg-slate-50 border border-slate-100">
              <div>
                <p className="text-xs font-bold text-slate-800">{t('elevatedEc')}</p>

                <p className="text-[10px] text-slate-500 mt-0.5">{t('elevatedEcThresh')}</p>
              </div>

              <div className="text-lg font-black text-amber-600">{highEcCows.length}</div>
            </div>

            <div className="flex items-center justify-between p-3 rounded-lg bg-slate-50 border border-slate-100">
              <div>
                <p className="text-xs font-bold text-slate-800">{t('flaggedHerd')}</p>

                <p className="text-[10px] text-slate-500 mt-0.5">{t('flaggedHerdDesc')}</p>
              </div>

              <div className="text-lg font-black text-red-600">{riskPercentage}%</div>
            </div>
          </div>

          <div className="mt-4 p-3 rounded-lg bg-blue-50 border border-blue-100">
            <div className="flex items-start gap-2">
              <TrendingUp className="w-4 h-4 text-blue-600 mt-0.5 shrink-0" />

              <p className="text-[11px] text-blue-800 leading-relaxed">{t('sccEcDisclaimer')}</p>
            </div>
          </div>
        </div>
      </div>

      {/* =====================================================
          STAGE 2 TELEMETRY
      ===================================================== */}

      <div className="bg-white rounded-xl border border-slate-200 p-4 sm:p-5 shadow-xs">
        <div className="flex items-start justify-between gap-3 mb-3">
          <div>
            <h2 className="text-sm font-black text-slate-900">{t('stage2Telemetry')}</h2>

            <p className="text-[11px] text-slate-500 mt-0.5">{t('stage2TelemetryDesc')}</p>
          </div>

          <Activity className="w-4 h-4 text-purple-500 shrink-0" />
        </div>

        {telemetryData.length > 0 ? (
          <>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={telemetryData}
                  margin={{
                    top: 10,
                    right: 15,
                    left: -10,
                    bottom: 5,
                  }}
                >
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />

                  <XAxis
                    dataKey="name"
                    tick={{
                      fontSize: 10,
                    }}
                  />

                  <YAxis
                    yAxisId="left"
                    tick={{
                      fontSize: 10,
                    }}
                  />

                  <YAxis
                    yAxisId="right"
                    orientation="right"
                    tick={{
                      fontSize: 10,
                    }}
                  />

                  <Tooltip contentStyle={tooltipStyle} />

                  <Legend
                    wrapperStyle={{
                      fontSize: '11px',
                    }}
                  />

                  <Line
                    yAxisId="left"
                    type="monotone"
                    dataKey="rumination"
                    name="Rumination (min/day)"
                    stroke="#8b5cf6"
                    strokeWidth={2}
                    dot={{
                      r: 3,
                    }}
                  />

                  <Line
                    yAxisId="right"
                    type="monotone"
                    dataKey="bodyTemp"
                    name="Body Temp (°C)"
                    stroke="#ef4444"
                    strokeWidth={2}
                    dot={{
                      r: 3,
                    }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>

            <div className="mt-3 grid grid-cols-2 gap-3">
              <div className="rounded-lg bg-purple-50 border border-purple-100 p-3">
                <p className="text-[10px] font-bold uppercase text-purple-600">
                  {t('flaggedWithWearable')}
                </p>

                <p className="text-xl font-black text-slate-900 mt-1">{wearableCows.length}</p>
              </div>

              <div className="rounded-lg bg-slate-50 border border-slate-100 p-3">
                <p className="text-[10px] font-bold uppercase text-slate-500">
                  {t('avgRumination')}
                </p>

                <p className="text-xl font-black text-slate-900 mt-1">
                  {averageRumination}
                  <span className="text-xs font-bold text-slate-400 ml-1">min/day</span>
                </p>
              </div>
            </div>
          </>
        ) : (
          <div className="h-[220px] flex flex-col items-center justify-center text-center">
            <Activity className="w-8 h-8 text-slate-300 mb-2" />

            <p className="text-xs font-bold text-slate-700">{t('noWearableData')}</p>

            <p className="text-[11px] text-slate-400 mt-1">{t('noWearableDesc')}</p>
          </div>
        )}
      </div>

      {/* =====================================================
          HEAT STRESS
      ===================================================== */}

      {heatStressData.length > 0 && (
        <div className="bg-white rounded-xl border border-slate-200 p-4 sm:p-5 shadow-xs">
          <div className="flex items-start justify-between mb-3">
            <div>
              <h2 className="text-sm font-black text-slate-900">Heat Stress by Zone</h2>

              <p className="text-[11px] text-slate-500 mt-0.5">
                Temperature-humidity index across herd zones
              </p>
            </div>

            <Thermometer className="w-4 h-4 text-amber-500" />
          </div>

          <div className="h-[270px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={heatStressData}
                margin={{
                  top: 10,
                  right: 10,
                  left: -10,
                  bottom: 5,
                }}
              >
                <CartesianGrid strokeDasharray="3 3" vertical={false} />

                <XAxis
                  dataKey="name"
                  tick={{
                    fontSize: 10,
                  }}
                />

                <YAxis
                  tick={{
                    fontSize: 10,
                  }}
                />

                <Tooltip
                  contentStyle={tooltipStyle}
                  formatter={(value) => [
                    typeof value === 'number' ? value.toFixed(1) : value,
                    'THI',
                  ]}
                />

                <Bar dataKey="THI" fill="#f59e0b" radius={[5, 5, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
    </div>
  )
}
