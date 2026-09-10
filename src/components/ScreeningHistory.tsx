import React, { useState } from 'react';
import { useHerd } from '../context/HerdContext';
import { RiskBadge } from './RiskBadge';
import { LoadingState } from './ui/LoadingState';
import { EmptyState } from './ui/EmptyState';
import { ErrorState } from './ui/ErrorState';
import { RiskLevel } from '../types';
import { 
  History, 
  Download, 
  Filter, 
  Search, 
  Radio, 
  RotateCcw,
  Clock,
  CheckCircle2,
  AlertTriangle
} from 'lucide-react';

export const ScreeningHistory: React.FC = () => {
  const { 
    screenings, 
    tabLoading, 
    tabError, 
    isRetryingTab, 
    retryTab, 
    openAnimalProfile, 
    setRfidModalOpen,
    resetToSampleData,
    addToast
  } = useHerd();

  const [selectedRisk, setSelectedRisk] = useState<RiskLevel | 'all'>('all');

  const isLoading = tabLoading.screenings;
  const error = tabError.screenings;
  const isRetrying = isRetryingTab.screenings;

  // Render Loading State
  if (isLoading) {
    return (
      <div className="space-y-6">
        <LoadingState 
          title="Loading Screening History Log..."
          message="Synchronizing milking parlor station audit trail, inline optical cell counts, and automated gate separation triggers."
          variant="table"
          rows={5}
        />
      </div>
    );
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
          retryLabel="Retry Sync"
          isRetrying={isRetrying}
          secondaryAction={{
            label: 'Restore Screening Data',
            onClick: resetToSampleData,
          }}
        />
      </div>
    );
  }

  // Render Empty State (No records in log)
  if (screenings.length === 0) {
    return (
      <div className="space-y-6">
        <EmptyState
          icon="calendar"
          title="No Screening Records Recorded"
          description="No screenings recorded for today. Records are recorded when cow RFID ear tags are scanned and tested with the Portable Milk Scanner."
          badgeText="Screening Log Ready"
          primaryAction={{
            label: 'Load Historical Screenings',
            onClick: resetToSampleData,
            icon: <RotateCcw className="w-4 h-4" />,
          }}
        />
      </div>
    );
  }

  const filteredScreenings = screenings.filter(
    (s) => selectedRisk === 'all' || s.riskLevel === selectedRisk
  );

  const handleExportCsv = () => {
    const headers = ['Timestamp', 'Tag', 'Name', 'Risk Level', 'Risk Score', 'SCC (k/ml)', 'EC (mS/cm)', 'pH', 'Station'];
    const rows = filteredScreenings.map((s) => [
      s.timestamp,
      s.animalTag,
      s.animalName,
      s.riskLevel,
      s.riskScore,
      s.scc,
      s.ec,
      s.ph,
      `"${s.parlorStation}"`,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `parlor-screening-log-${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    addToast({
      title: 'CSV Export Generated',
      message: `Exported ${filteredScreenings.length} screening records for DHI compliance records.`,
      type: 'success',
    });
  };

  return (
    <div className="space-y-6">
      
      {/* Header and Controls */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-black text-slate-900 tracking-tight">
              Parlor Screening History
            </h2>
            <span className="text-xs font-mono font-bold bg-slate-100 text-slate-700 px-2 py-0.5 rounded border border-slate-200">
              {screenings.length} Total Events
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Portable Milk Scanner screening records with early mastitis risk classification
          </p>
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
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* Screenings Table */}
      {filteredScreenings.length === 0 ? (
        <EmptyState
          icon="search"
          title={`No Screenings with "${selectedRisk.toUpperCase()}" Status`}
          description="There are no screening events recorded that match the selected risk filter."
          primaryAction={{
            label: 'Show All Records',
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
                  <th className="py-3 px-4">Risk Evaluation</th>
                  <th className="py-3 px-4">SCC Estimate</th>
                  <th className="py-3 px-4">Conductivity (EC)</th>
                  <th className="py-3 px-4">Milk pH</th>
                  <th className="py-3 px-4">Flag / Notes</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {filteredScreenings.map((rec) => (
                  <tr key={rec.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3.5 px-4 text-slate-600">
                      <div className="font-bold text-slate-900">{rec.timestamp}</div>
                      <div className="text-[11px] text-slate-400 font-mono">{rec.parlorStation}</div>
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="font-bold text-slate-900">{rec.animalName}</div>
                      <div className="font-mono text-slate-500 text-[11px]">{rec.animalTag}</div>
                    </td>

                    <td className="py-3.5 px-4">
                      <RiskBadge risk={rec.riskLevel} score={rec.riskScore} size="sm" />
                    </td>

                    <td className="py-3.5 px-4 font-mono font-bold">
                      <span className={rec.scc > 200 ? 'text-red-600' : 'text-slate-700'}>
                        {rec.scc}k cells/ml
                      </span>
                    </td>

                    <td className="py-3.5 px-4 font-mono font-bold">
                      <span className={rec.ec > 6.0 ? 'text-red-600' : 'text-slate-700'}>
                        {rec.ec} mS/cm
                      </span>
                    </td>

                    <td className="py-3.5 px-4 font-mono text-slate-600">
                      {rec.ph}
                    </td>

                    <td className="py-3.5 px-4 text-xs">
                      {rec.automatedFlag ? (
                        <span className="inline-flex items-center gap-1 font-bold text-red-700 bg-red-50 px-2 py-0.5 rounded border border-red-200 text-[11px]">
                          <AlertTriangle className="w-3 h-3" />
                          Gate Diverted
                        </span>
                      ) : (
                        <span className="text-slate-400 text-[11px]">Passed to Bulk Line</span>
                      )}
                      {rec.notes && (
                        <span className="block text-[10px] text-slate-500 mt-0.5 max-w-xs truncate">
                          {rec.notes}
                        </span>
                      )}
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={() => openAnimalProfile(rec.animalId)}
                        className="text-xs font-bold text-blue-600 hover:text-blue-700"
                      >
                        Profile &rarr;
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
