import React, { useState } from 'react';
import { useHerd } from '../context/HerdContext';
import { RiskBadge } from './RiskBadge';
import { LoadingState } from './ui/LoadingState';
import { EmptyState } from './ui/EmptyState';
import { ErrorState } from './ui/ErrorState';
import { RiskLevel } from '../types';
import { 
  Search, 
  LayoutGrid, 
  List, 
  Stethoscope, 
  Users, 
  Radio
} from 'lucide-react';

export const AnimalList: React.FC = () => {
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
    hmiMode,
    t
  } = useHerd();

  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedRiskFilter, setSelectedRiskFilter] = useState<RiskLevel | 'all'>('all');
  const [viewMode, setViewMode] = useState<'table' | 'cards'>(hmiMode ? 'cards' : 'table');

  const isLoading = tabLoading.animals;
  const error = tabError.animals;
  const isRetrying = isRetryingTab.animals;

  if (isLoading) {
    return (
      <div className="space-y-6">
        <LoadingState 
          title="Loading Cows..."
          message="Retrieving RFID records and health telemetry..."
          variant="table"
          rows={6}
        />
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <ErrorState
          title="Unable to load animal registry"
          message={error}
          onRetry={() => retryTab('animals')}
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
          description="Register cows or import sample herd profiles."
          primaryAction={{
            label: t('actionRestoreData'),
            onClick: resetToSampleData,
            icon: <Users className="w-4 h-4" />,
          }}
          secondaryAction={{
            label: t('scanRfid'),
            onClick: () => setRfidModalOpen(true),
            icon: <Radio className="w-4 h-4" />,
          }}
        />
      </div>
    );
  }

  const filteredAnimals = animals.filter((cow) => {
    const matchesSearch =
      cow.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      cow.tag.toLowerCase().includes(searchTerm.toLowerCase()) ||
      cow.breed.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesRisk = selectedRiskFilter === 'all' || cow.currentRisk === selectedRiskFilter;

    return matchesSearch && matchesRisk;
  });

  return (
    <div className="space-y-4">
      
      {/* Search & Filter Bar */}
      <div className="bg-white rounded-xl border border-slate-200 p-3 sm:p-4 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-3">
        
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder={t('searchPlaceholder')}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold focus:bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all"
          />
        </div>

        {/* Filters & View Toggle */}
        <div className="flex items-center gap-1.5 flex-wrap">
          {(['all', 'critical', 'high', 'watch', 'low'] as const).map((risk) => (
            <button
              key={risk}
              onClick={() => setSelectedRiskFilter(risk)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold capitalize transition-colors ${
                selectedRiskFilter === risk
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {risk === 'all' ? t('allFilter') : t(`risk${risk.charAt(0).toUpperCase() + risk.slice(1)}`)}
              <span className="ml-1 text-[10px] opacity-75">
                ({risk === 'all' ? animals.length : animals.filter((a) => a.currentRisk === risk).length})
              </span>
            </button>
          ))}

          <div className="h-4 w-px bg-slate-200 mx-1 hidden sm:block" />

          <div className="flex items-center bg-slate-100 p-0.5 rounded-lg border border-slate-200">
            <button
              onClick={() => setViewMode('table')}
              className={`p-1.5 rounded-md transition-colors ${viewMode === 'table' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-500 hover:text-slate-900'}`}
              title="Table View"
            >
              <List className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('cards')}
              className={`p-1.5 rounded-md transition-colors ${viewMode === 'cards' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-500 hover:text-slate-900'}`}
              title="Card View"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
          </div>
        </div>

      </div>

      {filteredAnimals.length === 0 ? (
        <EmptyState
          icon="search"
          title="No Cows Match Filter"
          description="Try adjusting your search tag or risk level filter."
          primaryAction={{
            label: t('allFilter'),
            onClick: () => {
              setSearchTerm('');
              setSelectedRiskFilter('all');
            },
          }}
        />
      ) : viewMode === 'cards' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {filteredAnimals.map((cow) => (
            <div
              key={cow.id}
              onClick={() => openAnimalProfile(cow.id)}
              className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs hover:shadow-md hover:border-blue-400 transition-all cursor-pointer flex flex-col justify-between group"
            >
              <div>
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono font-black bg-slate-900 text-white px-2 py-0.5 rounded group-hover:bg-blue-600 transition-colors">
                      {cow.tag}
                    </span>
                    <h3 className="font-bold text-slate-900 text-sm group-hover:text-blue-600 transition-colors">
                      {cow.name}
                    </h3>
                  </div>
                  <RiskBadge risk={cow.currentRisk} score={cow.riskScore} size="sm" />
                </div>

                <p className="text-[11px] text-slate-500 mt-1">
                  {cow.breed} · {t('penLabel')} {cow.assignedPen} · DIM {cow.daysInMilk}
                </p>

                <div className="grid grid-cols-2 gap-2 mt-3 bg-slate-50 p-2.5 rounded-lg text-xs">
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 block">{t('sccLabel')}</span>
                    <span className={`font-black ${cow.scc > 200 ? 'text-red-600' : 'text-slate-800'}`}>
                      {cow.scc}k / mL
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 block">{t('ecLabel')}</span>
                    <span className={`font-black ${cow.ec > 6.0 ? 'text-red-600' : 'text-slate-800'}`}>
                      {cow.ec} mS/cm
                    </span>
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                <span className="text-[11px] text-slate-400 font-medium group-hover:text-blue-600 transition-colors">
                  Click to view profile & charts &rarr;
                </span>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    openOutcomeModal(cow.id);
                  }}
                  className="py-1 px-2.5 rounded-lg text-xs font-bold bg-slate-100 text-slate-800 hover:bg-slate-200 border border-slate-200 flex items-center gap-1 transition-colors"
                >
                  <Stethoscope className="w-3 h-3 text-blue-600" />
                  <span>{t('actionLogOutcome')}</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="py-3 px-4">Tag # / Cow</th>
                  <th className="py-3 px-4">{t('penLabel')} & Breed</th>
                  <th className="py-3 px-4">Risk Level</th>
                  <th className="py-3 px-4">{t('sccLabel')}</th>
                  <th className="py-3 px-4">{t('ecLabel')}</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {filteredAnimals.map((cow) => (
                  <tr 
                    key={cow.id}
                    onClick={() => openAnimalProfile(cow.id)}
                    className="hover:bg-blue-50/50 cursor-pointer transition-colors group"
                  >
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold bg-slate-100 px-1.5 py-0.5 rounded text-slate-800 text-[11px] group-hover:bg-blue-100 group-hover:text-blue-800 transition-colors">
                          {cow.tag}
                        </span>
                        <span className="font-bold text-slate-900 group-hover:text-blue-700 transition-colors">
                          {cow.name}
                        </span>
                      </div>
                    </td>

                    <td className="py-3 px-4 text-slate-600 text-[11px]">
                      {t('penLabel')} {cow.assignedPen} · {cow.breed}
                    </td>

                    <td className="py-3 px-4">
                      <RiskBadge risk={cow.currentRisk} score={cow.riskScore} size="sm" />
                    </td>

                    <td className="py-3 px-4 font-mono font-bold">
                      <span className={cow.scc > 200 ? 'text-red-600' : 'text-slate-700'}>
                        {cow.scc}k
                      </span>
                    </td>

                    <td className="py-3 px-4 font-mono font-bold">
                      <span className={cow.ec > 6.0 ? 'text-red-600' : 'text-slate-700'}>
                        {cow.ec} mS/cm
                      </span>
                    </td>

                    <td className="py-3 px-4 text-right" onClick={(e) => e.stopPropagation()}>
                      <button
                        onClick={() => openOutcomeModal(cow.id)}
                        className="px-2.5 py-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-[11px] border border-slate-200 inline-flex items-center gap-1 transition-colors"
                      >
                        <Stethoscope className="w-3 h-3 text-blue-600" />
                        <span>Outcome</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

    </div>
  );
};
