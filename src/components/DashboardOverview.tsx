import React from 'react';
import { useHerd } from '../context/HerdContext';
import { RiskBadge } from './RiskBadge';
import { LoadingState } from './ui/LoadingState';
import { EmptyState } from './ui/EmptyState';
import { ErrorState } from './ui/ErrorState';
import { motion } from 'motion/react';
import { 
  Users, 
  CheckCircle2, 
  AlertTriangle, 
  Thermometer, 
  ArrowRight, 
  Activity, 
  Stethoscope, 
  Clock, 
  ChevronRight,
  ShieldCheck,
  RotateCcw
} from 'lucide-react';

export const DashboardOverview: React.FC = () => {
  const { 
    animals, 
    barnZones, 
    tabLoading, 
    tabError, 
    isRetryingTab, 
    retryTab, 
    setActiveTab, 
    openAnimalProfile, 
    openOutcomeModal,
    setRfidModalOpen,
    resetToSampleData,
    t
  } = useHerd();

  const isLoading = tabLoading.dashboard;
  const error = tabError.dashboard;
  const isRetrying = isRetryingTab.dashboard;

  if (isLoading) {
    return (
      <div className="space-y-6">
        <LoadingState 
          title="Loading Herd Overview..."
          message="Updating herd telemetry and screening status..."
          variant="screen"
        />
      </div>
    );
  }

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
    );
  }

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
    );
  }

  // Key Counts
  const totalAnimals = animals.length;
  const criticalCows = animals.filter(a => a.currentRisk === 'critical');
  const highCows = animals.filter(a => a.currentRisk === 'high');
  const watchCows = animals.filter(a => a.currentRisk === 'watch');
  const lowCows = animals.filter(a => a.currentRisk === 'low');

  const actionRequiredCows = [...criticalCows, ...highCows, ...watchCows];
  const screenedTodayCount = animals.filter(a => a.scc > 0).length;

  const maxThi = barnZones.reduce((max, z) => Math.max(max, z.thi), 0) || 72;

  return (
    <div className="space-y-5">
      
      {/* Primary Decision Banner: Answers "What do I need to do today?" */}
      <div className={`p-4 sm:p-5 rounded-2xl border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-xs ${
        actionRequiredCows.length > 0
          ? 'bg-red-50/80 border-red-200'
          : 'bg-emerald-50 border-emerald-200'
      }`}>
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
            actionRequiredCows.length > 0 ? 'bg-red-600 text-white' : 'bg-emerald-600 text-white'
          }`}>
            {actionRequiredCows.length > 0 ? (
              <AlertTriangle className="w-5 h-5" />
            ) : (
              <ShieldCheck className="w-5 h-5" />
            )}
          </div>
          <div>
            <div className="text-base sm:text-lg font-black text-slate-900 leading-tight">
              {actionRequiredCows.length > 0
                ? `${actionRequiredCows.length} ${t('needAction')}`
                : t('allClear')}
            </div>
            <p className="text-xs text-slate-600 mt-0.5 font-medium">
              {actionRequiredCows.length > 0
                ? `${criticalCows.length + highCows.length} ${t('highRiskDetected')} · ${watchCows.length} ${t('watchListWarning')}`
                : t('allClearDesc')}
            </p>
          </div>
        </div>

        {actionRequiredCows.length > 0 && (
          <button
            onClick={() => setActiveTab('actions')}
            className="px-4 py-2 rounded-xl text-xs font-black bg-red-600 text-white hover:bg-red-700 transition-colors shrink-0 shadow-xs flex items-center gap-1.5"
          >
            <span>{t('tabActions')}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* 4 Core Glanceable Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        
        {/* Total Herd */}
        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
            {t('totalCows')}
          </span>
          <div className="text-2xl sm:text-3xl font-black text-slate-900 mt-1">
            {totalAnimals}
          </div>
          <span className="text-[11px] text-slate-400 mt-0.5 block font-medium">
            Active Herd Roster
          </span>
        </div>

        {/* Tested Today */}
        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
            {t('testedToday')}
          </span>
          <div className="text-2xl sm:text-3xl font-black text-blue-600 mt-1">
            {screenedTodayCount} <span className="text-sm font-bold text-slate-400">/ {totalAnimals}</span>
          </div>
          <span className="text-[11px] text-emerald-600 mt-0.5 block font-bold">
            {Math.round((screenedTodayCount / totalAnimals) * 100)}% coverage
          </span>
        </div>

        {/* Attention Needed */}
        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
            {t('needAction')}
          </span>
          <div className={`text-2xl sm:text-3xl font-black mt-1 ${actionRequiredCows.length > 0 ? 'text-red-600' : 'text-emerald-600'}`}>
            {actionRequiredCows.length}
          </div>
          <span className="text-[11px] text-slate-500 mt-0.5 block font-medium">
            {criticalCows.length} critical · {highCows.length} high
          </span>
        </div>

        {/* Heat Stress Index */}
        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
            {t('heatStress')}
          </span>
          <div className="text-2xl sm:text-3xl font-black text-amber-600 mt-1">
            {maxThi.toFixed(1)}
          </div>
          <span className="text-[11px] text-amber-700 mt-0.5 block font-bold">
            {maxThi >= 75 ? `${t('fans')}: ${t('active')}` : t('normalStatus')}
          </span>
        </div>

      </div>

      {/* Immediate Priority List */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 sm:p-5 shadow-xs">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <h2 className="text-base font-black text-slate-900 tracking-tight">
              {t('tabActions')}
            </h2>
            <span className="text-xs font-bold bg-slate-100 text-slate-700 px-2 py-0.5 rounded">
              {actionRequiredCows.length}
            </span>
          </div>

          <button
            onClick={() => setActiveTab('actions')}
            className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1"
          >
            <span>{t('allFilter')}</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {actionRequiredCows.length === 0 ? (
          <div className="text-center py-8 text-slate-500 text-xs">
            <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-1.5" />
            <p className="font-bold text-slate-800">{t('allClear')}</p>
            <p className="mt-0.5">{t('allClearDesc')}</p>
          </div>
        ) : (
          <div className="space-y-2.5">
            {actionRequiredCows.slice(0, 4).map((cow) => {
              const infectedQuarter = cow.quarters.find(q => q.status === 'infected' || q.status === 'suspect');
              const quarterName = infectedQuarter ? `${infectedQuarter.quarter} (${infectedQuarter.ec} mS/cm)` : 'All normal';

              return (
                <div
                  key={cow.id}
                  onClick={() => openAnimalProfile(cow.id)}
                  className="p-3 sm:p-3.5 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-blue-50/50 hover:border-blue-300 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 transition-all cursor-pointer group"
                >
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-xs font-black bg-slate-900 text-white px-2 py-1 rounded shrink-0 group-hover:bg-blue-600 transition-colors">
                      {cow.tag}
                    </span>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-900 text-sm group-hover:text-blue-700 transition-colors">
                          {cow.name}
                        </span>
                        <RiskBadge risk={cow.currentRisk} score={cow.riskScore} size="sm" />
                      </div>
                      <div className="text-[11px] text-slate-500 mt-0.5">
                        {t('quarterLabel')}: <strong className="text-slate-800">{quarterName}</strong> · SCC: <strong className="text-slate-800">{cow.scc}k</strong> · {t('penLabel')}: {cow.assignedPen}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-end sm:self-center" onClick={(e) => e.stopPropagation()}>
                    <button
                      onClick={() => openOutcomeModal(cow.id)}
                      className="px-2.5 py-1.5 rounded-lg text-xs font-bold bg-white text-slate-700 hover:bg-slate-100 border border-slate-200 flex items-center gap-1 transition-colors"
                    >
                      <Stethoscope className="w-3.5 h-3.5 text-blue-600" />
                      <span className="hidden xs:inline">{t('actionLogOutcome')}</span>
                      <span className="xs:hidden">Outcome</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Visual Risk Distribution Bar */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs">
        <div className="flex items-center justify-between text-xs font-bold text-slate-700 mb-2">
          <span>Herd Risk Distribution</span>
          <span className="text-slate-500 font-mono">{totalAnimals} Cows</span>
        </div>

        <div className="h-3 w-full bg-slate-100 rounded-full overflow-hidden flex">
          <div style={{ width: `${(criticalCows.length / totalAnimals) * 100}%` }} className="bg-red-600" title={`Critical: ${criticalCows.length}`} />
          <div style={{ width: `${(highCows.length / totalAnimals) * 100}%` }} className="bg-orange-500" title={`High: ${highCows.length}`} />
          <div style={{ width: `${(watchCows.length / totalAnimals) * 100}%` }} className="bg-amber-400" title={`Watch: ${watchCows.length}`} />
          <div style={{ width: `${(lowCows.length / totalAnimals) * 100}%` }} className="bg-emerald-500" title={`Normal: ${lowCows.length}`} />
        </div>

        <div className="flex items-center justify-between text-[11px] font-bold mt-2.5 text-slate-600 flex-wrap gap-2">
          <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-red-600" /> {criticalCows.length} {t('riskCritical')}</span>
          <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-orange-500" /> {highCows.length} {t('riskHigh')}</span>
          <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-amber-400" /> {watchCows.length} {t('riskWatch')}</span>
          <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-emerald-500" /> {lowCows.length} {t('riskLow')}</span>
        </div>
      </div>

    </div>
  );
};
