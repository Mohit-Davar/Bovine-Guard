import React from 'react';
import { useHerd } from '../context/HerdContext';
import { LoadingState } from './ui/LoadingState';
import { EmptyState } from './ui/EmptyState';
import { ErrorState } from './ui/ErrorState';
import { 
  X, 
  RefreshCw, 
  Wifi, 
  WifiOff, 
  CheckCircle2, 
  AlertTriangle, 
  Server, 
  Database,
  Radio,
  Clock
} from 'lucide-react';

export const SyncModal: React.FC = () => {
  const { 
    isSyncModalOpen, 
    setSyncModalOpen, 
    syncStatus, 
    retrySync, 
    toggleOfflineMode 
  } = useHerd();

  if (!isSyncModalOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xl max-w-lg w-full my-8 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        
        {/* Header */}
        <div className="p-5 border-b border-slate-200 flex items-center justify-between bg-slate-50/70">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold ${
              syncStatus.isOnline ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
            }`}>
              {syncStatus.isOnline ? <Wifi className="w-5 h-5" /> : <WifiOff className="w-5 h-5" />}
            </div>
            <div>
              <h2 className="text-base font-black text-slate-900">
                Parlor Hub Synchronization
              </h2>
              <p className="text-xs text-slate-500">
                Barn Node #4 · Local SQLite Cache & Cloud Telemetry Gateway
              </p>
            </div>
          </div>

          <button
            onClick={() => setSyncModalOpen(false)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-200/60 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 space-y-4">
          
          {/* Active Error State (if any) */}
          {syncStatus.syncError ? (
            <ErrorState
              compact
              title="Cloud Synchronization Failure"
              message={syncStatus.syncError}
              errorCode="ERR_CLOUD_SYNC_TIMEOUT"
              onRetry={retrySync}
              retryLabel="Retry Sync"
              isRetrying={syncStatus.syncInProgress}
            />
          ) : null}

          {/* Sync Progress Loading State */}
          {syncStatus.syncInProgress ? (
            <LoadingState
              title="Synchronizing Records to Cloud..."
              message="Synchronizing screening records and veterinary outcomes to cloud storage."
              variant="card"
            />
          ) : (
            /* Queue Status Card */
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase text-slate-500 tracking-wider">
                  Pending Sync Queue
                </span>
                <span className="text-xs font-mono font-black text-slate-800">
                  {syncStatus.pendingRecordsCount} records queued
                </span>
              </div>

              {syncStatus.pendingRecordsCount === 0 ? (
                <div className="flex items-center gap-2 text-xs font-bold text-emerald-700 bg-emerald-50 p-2.5 rounded-lg border border-emerald-200">
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  <span>All records synchronized with cloud storage.</span>
                </div>
              ) : (
                <div className="flex items-center gap-2 text-xs font-bold text-amber-800 bg-amber-50 p-2.5 rounded-lg border border-amber-200">
                  <AlertTriangle className="w-4 h-4 shrink-0" />
                  <span>{syncStatus.pendingRecordsCount} offline records saved locally on device memory.</span>
                </div>
              )}

              <div className="text-[11px] text-slate-500 font-mono pt-1">
                Last Successful Sync: <strong>{syncStatus.lastSyncTime}</strong>
              </div>
            </div>
          )}

          {/* Connected Hardware Nodes */}
          <div className="space-y-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
              Hardware Components
            </span>

            <div className="space-y-1.5 text-xs">
              <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Server className="w-4 h-4 text-blue-600" />
                  <span className="font-bold text-slate-800">Portable Milk Scanner Dock</span>
                </div>
                <span className="text-emerald-700 font-bold text-[11px]">Docked & Ready</span>
              </div>

              <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Radio className="w-4 h-4 text-blue-600" />
                  <span className="font-bold text-slate-800">Wearable Telemetry Receiver</span>
                </div>
                <span className="text-emerald-700 font-bold text-[11px]">Active (Flagged Cows)</span>
              </div>

              <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Database className="w-4 h-4 text-blue-600" />
                  <span className="font-bold text-slate-800">Central Hub AI Engine</span>
                </div>
                <span className="text-emerald-700 font-bold text-[11px]">Online</span>
              </div>
            </div>
          </div>

          {/* Network Simulation Toggle */}
          <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
            <div>
              <span className="text-xs font-bold text-slate-900 block">
                Simulate Field Disconnection
              </span>
              <span className="text-[11px] text-slate-500">
                Test offline buffering when cellular/Wi-Fi drops in the barn pit
              </span>
            </div>

            <button
              type="button"
              onClick={toggleOfflineMode}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-colors ${
                !syncStatus.isOnline
                  ? 'bg-amber-500 text-slate-950 border-amber-600'
                  : 'bg-slate-100 text-slate-700 border-slate-300 hover:bg-slate-200'
              }`}
            >
              {!syncStatus.isOnline ? 'Restore Online' : 'Go Offline'}
            </button>
          </div>

        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between">
          <button
            type="button"
            onClick={() => setSyncModalOpen(false)}
            className="px-4 py-2 rounded-lg text-xs font-bold bg-slate-200 text-slate-800 hover:bg-slate-300"
          >
            Close
          </button>

          <button
            type="button"
            onClick={retrySync}
            disabled={syncStatus.syncInProgress}
            className="px-4 py-2 rounded-lg text-xs font-bold bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2 shadow-xs"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${syncStatus.syncInProgress ? 'animate-spin' : ''}`} />
            <span>{syncStatus.syncInProgress ? 'Synchronizing...' : 'Sync Now'}</span>
          </button>
        </div>

      </div>
    </div>
  );
};
