import React, { useState } from 'react';
import { useHerd } from '../context/HerdContext';
import { RiskBadge } from './RiskBadge';
import { LoadingState } from './ui/LoadingState';
import { EmptyState } from './ui/EmptyState';
import { ErrorState } from './ui/ErrorState';
import { RiskLevel } from '../types';
import { motion } from 'motion/react';
import { 
  CheckCircle2, 
  AlertTriangle, 
  Stethoscope, 
  ArrowRight, 
  Radio, 
  Sparkles, 
  RotateCcw,
  Check
} from 'lucide-react';

export const TodaysActions: React.FC = () => {
  const { 
    animals, 
    tabLoading, 
    tabError, 
    isRetryingTab, 
    retryTab, 
    openAnimalProfile, 
    openOutcomeModal,
    setRfidModalOpen,
    resetToSampleData,
    addToast,
    t
  } = useHerd();

  const [filter, setFilter] = useState<'all' | 'critical' | 'high' | 'watch'>('all');
  const [completedIds, setCompletedIds] = useState<string[]>([]);

  const isLoading = tabLoading.actions;
  const error = tabError.actions;
  const isRetrying = isRetryingTab.actions;

  if (isLoading) {
    return (
      <div className="space-y-6">
        <LoadingState 
          title="Loading Today's Actions..."
          message="Prioritizing cows needing inspection or separation..."
          variant="card"
        />
      </div>
    );
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
    );
  }

  // Filter animals that need action
  const actionAnimals = animals.filter((cow) => {
    if (completedIds.includes(cow.id)) return false;
    if (cow.currentRisk === 'low') return false;
    if (filter === 'all') return true;
    return cow.currentRisk === filter;
  });

  const handleMarkResolved = (id: string, name: string) => {
    setCompletedIds((prev) => [...prev, id]);
    addToast({
      title: 'Action Completed',
      message: `${name} marked resolved for this milking shift.`,
      type: 'success',
    });
  };

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
              setCompletedIds([]);
              resetToSampleData();
            },
            icon: <RotateCcw className="w-4 h-4" />,
          }}
        />
      </div>
    );
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
          <p className="text-xs text-slate-500 mt-0.5 font-medium">
            Prioritized cow checklist for current milking shift
          </p>
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
              {lvl === 'all' ? t('allFilter') : t(`risk${lvl.charAt(0).toUpperCase() + lvl.slice(1)}`)}
            </button>
          ))}
        </div>
      </div>

      {/* Action Cards */}
      {actionAnimals.length === 0 ? (
        <div className="bg-white rounded-xl border border-slate-200 p-8 text-center">
          <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto mb-2" />
          <h3 className="font-bold text-slate-900 text-sm">All Action Items Resolved</h3>
          <p className="text-xs text-slate-500 mt-1">
            Great work! All flagged cows for this milking shift have been handled.
          </p>
          {completedIds.length > 0 && (
            <button
              onClick={() => setCompletedIds([])}
              className="mt-4 px-3 py-1.5 rounded-lg text-xs font-bold bg-slate-100 hover:bg-slate-200 text-slate-700"
            >
              Reset Completed List
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {actionAnimals.map((cow, idx) => {
            const infectedQuarter = cow.quarters.find(q => q.status === 'infected' || q.status === 'suspect');
            const isCritical = cow.currentRisk === 'critical';

            return (
              <motion.div
                key={cow.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2, delay: idx * 0.04 }}
                className={`bg-white rounded-xl border-2 p-4 sm:p-5 shadow-xs transition-all ${
                  isCritical ? 'border-red-300' : 'border-slate-200'
                }`}
              >
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  
                  {/* Cow Identifiers & Risk */}
                  <div className="flex items-start gap-3.5">
                    <span className="font-mono text-sm font-black bg-slate-900 text-white px-2.5 py-1 rounded shrink-0">
                      {cow.tag}
                    </span>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-black text-slate-900 text-base">{cow.name}</span>
                        <RiskBadge risk={cow.currentRisk} score={cow.riskScore} size="sm" />
                        <span className="text-xs text-slate-500 font-medium">
                          {t('penLabel')} {cow.assignedPen} · DIM {cow.daysInMilk}
                        </span>
                      </div>

                      {/* Required Protocol - Highlighted */}
                      <div className="mt-2 text-xs font-bold text-slate-900 flex items-center gap-2">
                        <span className={`w-2 h-2 rounded-full ${isCritical ? 'bg-red-600 animate-ping' : 'bg-amber-500'}`} />
                        <span>{cow.recommendedAction}</span>
                      </div>

                      {/* Key Indicators */}
                      <div className="flex items-center gap-3 mt-2 text-xs text-slate-600 flex-wrap">
                        <span>
                          {t('quarterLabel')}: <strong className="text-slate-900">{infectedQuarter ? `${infectedQuarter.quarter} (${infectedQuarter.ec} mS/cm)` : 'Clear'}</strong>
                        </span>
                        <span>·</span>
                        <span>
                          {t('sccLabel')}: <strong className={cow.scc > 200 ? 'text-red-600 font-bold' : 'text-slate-900'}>{cow.scc}k</strong>
                        </span>
                        <span>·</span>
                        <span>
                          {t('ecLabel')}: <strong className={cow.ec > 6.0 ? 'text-red-600 font-bold' : 'text-slate-900'}>{cow.ec} mS/cm</strong>
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 self-end md:self-center shrink-0">
                    <button
                      onClick={() => openOutcomeModal(cow.id)}
                      className="px-3 py-2 rounded-lg text-xs font-bold bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-200 flex items-center gap-1.5"
                    >
                      <Stethoscope className="w-3.5 h-3.5 text-blue-600" />
                      <span>{t('actionLogOutcome')}</span>
                    </button>

                    <button
                      onClick={() => handleMarkResolved(cow.id, cow.name)}
                      className="px-3 py-2 rounded-lg text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white flex items-center gap-1.5 shadow-2xs"
                      title="Mark action completed"
                    >
                      <Check className="w-3.5 h-3.5" />
                      <span>{t('actionDone')}</span>
                    </button>

                    <button
                      onClick={() => openAnimalProfile(cow.id)}
                      className="p-2 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100"
                      title="View Profile"
                    >
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>

                </div>
              </motion.div>
            );
          })}
        </div>
      )}

    </div>
  );
};
