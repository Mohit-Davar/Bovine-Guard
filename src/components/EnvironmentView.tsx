import React from 'react';
import { useHerd } from '../context/HerdContext';
import { LoadingState } from './ui/LoadingState';
import { EmptyState } from './ui/EmptyState';
import { ErrorState } from './ui/ErrorState';
import { 
  CloudSun, 
  Wind, 
  Droplets, 
  Thermometer, 
  AlertTriangle, 
  CheckCircle2, 
  RotateCcw,
  Zap
} from 'lucide-react';

export const EnvironmentView: React.FC = () => {
  const { 
    barnZones, 
    tabLoading, 
    tabError, 
    isRetryingTab, 
    retryTab, 
    resetToSampleData 
  } = useHerd();

  const isLoading = tabLoading.environment;
  const error = tabError.environment;
  const isRetrying = isRetryingTab.environment;

  // Render Loading State
  if (isLoading) {
    return (
      <div className="space-y-6">
        <LoadingState 
          title="Polling Barn Climate & LoRaWAN Weather Stations..."
          message="Retrieving ambient temperature, relative humidity, and calculating Temperature-Humidity Index (THI) across all 4 dairy zones."
          variant="screen"
        />
      </div>
    );
  }

  // Render Error State
  if (error) {
    return (
      <div className="space-y-6">
        <ErrorState
          title="Barn Weather Station Offline"
          message={error}
          errorCode="ERR_SENSOR_NODE_UNRESPONSIVE"
          onRetry={() => retryTab('environment')}
          retryLabel="Retry Sensor Polling"
          isRetrying={isRetrying}
          secondaryAction={{
            label: 'Restore Sensor Telemetry',
            onClick: resetToSampleData,
          }}
        />
      </div>
    );
  }

  // Render Empty State (No environmental sensors detected)
  if (barnZones.length === 0) {
    return (
      <div className="space-y-6">
        <EmptyState
          icon="weather"
          title="No Environmental Telemetry Stations Detected"
          description="The local hub has not connected to any wireless temperature/humidity sensor beacons in Barn 4. Check gateway power or restore demo zones."
          badgeText="Zero Environmental Nodes"
          primaryAction={{
            label: 'Initialize Default Barn Stations',
            onClick: resetToSampleData,
            icon: <CloudSun className="w-4 h-4" />,
          }}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-black text-slate-900 tracking-tight">
              Barn Microclimate & THI Heat Stress Index
            </h2>
            <span className="text-xs font-bold uppercase bg-amber-100 text-amber-800 px-2 py-0.5 rounded border border-amber-200">
              Live Environmental Mesh
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Real-time thermal indices directly impacting dairy cow rumination and environmental mastitis risk
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-slate-600">THI Heat Thresholds:</span>
          <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800">&lt;68 Normal</span>
          <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-amber-100 text-amber-800">68-78 Mild/Mod</span>
          <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-red-100 text-red-800">&gt;78 Severe</span>
        </div>
      </div>

      {/* Zone Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {barnZones.map((zone) => {
          const isStress = zone.thi >= 75;

          return (
            <div
              key={zone.id}
              className={`bg-white rounded-xl border-2 p-5 shadow-xs flex flex-col justify-between ${
                isStress ? 'border-amber-300' : 'border-slate-200'
              }`}
            >
              <div>
                <div className="flex items-center justify-between">
                  <h3 className="font-black text-slate-900 text-base">{zone.name}</h3>
                  <span
                    className={`text-xs font-black uppercase px-2 py-0.5 rounded ${
                      zone.status === 'moderate_stress'
                        ? 'bg-amber-500 text-slate-950'
                        : zone.status === 'mild_stress'
                        ? 'bg-amber-100 text-amber-800'
                        : 'bg-emerald-100 text-emerald-800'
                    }`}
                  >
                    {zone.status.replace('_', ' ')}
                  </span>
                </div>

                {/* Big Metric Display */}
                <div className="grid grid-cols-3 gap-3 mt-4 text-center">
                  <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">Temperature</span>
                    <span className="text-lg font-black text-slate-900">{zone.tempC}°C</span>
                  </div>
                  <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">Humidity</span>
                    <span className="text-lg font-black text-slate-900">{zone.humidityPct}%</span>
                  </div>
                  <div className={`p-3 rounded-lg border ${isStress ? 'bg-amber-50 border-amber-200' : 'bg-slate-50 border-slate-100'}`}>
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">THI Index</span>
                    <span className={`text-lg font-black ${isStress ? 'text-amber-700' : 'text-slate-900'}`}>
                      {zone.thi}
                    </span>
                  </div>
                </div>

                {/* Mitigation Controls */}
                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-1.5 font-bold text-slate-700">
                    <Wind className={`w-4 h-4 ${zone.fansActive ? 'text-blue-600 animate-spin' : 'text-slate-400'}`} />
                    <span>HVLS Fans: {zone.fansActive ? 'Active (100%)' : 'Standby'}</span>
                  </div>
                  <div className="flex items-center gap-1.5 font-bold text-slate-700">
                    <Droplets className={`w-4 h-4 ${zone.mistingActive ? 'text-blue-500' : 'text-slate-400'}`} />
                    <span>Misting: {zone.mistingActive ? 'Active' : 'Off'}</span>
                  </div>
                </div>
              </div>

              {isStress && (
                <div className="mt-4 p-2.5 rounded bg-amber-50 border border-amber-200 text-xs text-amber-900 font-medium leading-snug">
                  <strong>Mastitis Alert:</strong> Heat stress causes cows to lie down less frequently and spend more time standing in slurry, increasing teat-end bacterial exposure. Keep bedding sanitized.
                </div>
              )}
            </div>
          );
        })}
      </div>

    </div>
  );
};
