import React from 'react';
import { useHerd } from '../context/HerdContext';
import { RiskBadge } from './RiskBadge';
import { CowChartWidget } from './CowChartWidget';
import { 
  X, 
  Stethoscope, 
  Thermometer, 
  Activity, 
  AlertTriangle, 
  CheckCircle2, 
  Battery, 
  Calendar,
  Sparkles,
  ShieldAlert
} from 'lucide-react';

export const AnimalProfileModal: React.FC = () => {
  const { 
    selectedAnimalId, 
    closeAnimalProfile, 
    animals, 
    openOutcomeModal 
  } = useHerd();

  if (!selectedAnimalId) return null;

  const cow = animals.find((a) => a.id === selectedAnimalId);

  if (!cow) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
        <div className="bg-white rounded-2xl p-6 max-w-md w-full text-center">
          <AlertTriangle className="w-10 h-10 text-amber-500 mx-auto mb-2" />
          <h3 className="text-base font-bold text-slate-900">Cow Record Not Found</h3>
          <p className="text-xs text-slate-500 mt-1">
            The selected animal ID could not be retrieved from the active parlor registry cache.
          </p>
          <button
            onClick={closeAnimalProfile}
            className="mt-4 px-4 py-2 bg-slate-900 text-white rounded-lg text-xs font-bold"
          >
            Close
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xl max-w-3xl w-full my-8 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        
        {/* Modal Header */}
        <div className="p-5 sm:p-6 border-b border-slate-200 flex items-start justify-between bg-slate-50/70">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-slate-900 text-white font-black flex flex-col items-center justify-center shrink-0">
              <span className="text-[10px] text-slate-400 uppercase">TAG</span>
              <span className="text-xs font-mono">{cow.tag.replace('US-', '')}</span>
            </div>

            <div>
              <div className="flex items-center gap-3 flex-wrap">
                <h2 className="text-xl font-black text-slate-900 tracking-tight">{cow.name}</h2>
                <RiskBadge risk={cow.currentRisk} score={cow.riskScore} size="md" />
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                {cow.breed} · Age {cow.ageYears} yrs · Parity {cow.parity} · DIM {cow.daysInMilk} · Pen: {cow.assignedPen}
              </p>
            </div>
          </div>

          <button
            onClick={closeAnimalProfile}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-200/60 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 sm:p-6 space-y-6 max-h-[75vh] overflow-y-auto">
          
          {/* Action Callout */}
          <div className="p-4 rounded-xl bg-blue-50 border border-blue-200">
            <div className="flex items-center justify-between gap-3">
              <div>
                <span className="text-[10px] font-black uppercase tracking-wider text-blue-700 block">
                  Recommended Farmer Protocol
                </span>
                <p className="text-xs font-bold text-slate-900 mt-0.5">{cow.recommendedAction}</p>
              </div>
              <button
                onClick={() => {
                  closeAnimalProfile();
                  openOutcomeModal(cow.id);
                }}
                className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center gap-1.5 shrink-0 shadow-xs"
              >
                <Stethoscope className="w-3.5 h-3.5" />
                <span>Log Clinical Outcome</span>
              </button>
            </div>
          </div>

          {/* Individual Analytics & Sensor Charts Widget */}
          <div>
            <CowChartWidget animal={cow} />
          </div>

          {/* Current Milk Chemistry Grid */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
              Latest Milk Sample Analysis
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Somatic Cells (SCC)</span>
                <span className={`text-base font-black ${cow.scc > 200 ? 'text-red-600' : 'text-slate-800'}`}>
                  {cow.scc}k / mL
                </span>
              </div>
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Electrical Cond.</span>
                <span className={`text-base font-black ${cow.ec > 6.0 ? 'text-red-600' : 'text-slate-800'}`}>
                  {cow.ec} mS/cm
                </span>
              </div>
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Milk pH</span>
                <span className="text-base font-black text-slate-800">{cow.ph}</span>
              </div>
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Milk Temperature</span>
                <span className="text-base font-black text-slate-800">{cow.milkTemp}°C</span>
              </div>
            </div>
          </div>

          {/* Collar Wearable Telemetry */}
          {cow.wearable && (
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
                Wearable Collar Activity & Rumination
              </h3>
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <Activity className="w-4 h-4 text-blue-600" />
                    <span className="text-xs font-bold text-slate-800">
                      Daily Rumination: {cow.wearable.ruminationMinutes} min
                    </span>
                    <span className="text-xs text-slate-500 font-medium">
                      (Normal: {cow.wearable.ruminationBaseline} min)
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Thermometer className="w-4 h-4 text-amber-600" />
                    <span className="text-xs font-bold text-slate-800">
                      Reticular Body Temp: {cow.wearable.bodyTemp}°C
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-3 self-end sm:self-center">
                  <div className="flex items-center gap-1.5 text-xs text-slate-600 font-medium">
                    <Battery className="w-4 h-4 text-emerald-600" />
                    <span>Battery: {cow.wearable.batteryPercent}%</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* AI Contributing Risk Factors */}
          <div>
            <div className="flex items-center gap-1.5 mb-2">
              <Sparkles className="w-3.5 h-3.5 text-blue-600" />
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                AI Diagnostic Contributing Factors
              </h3>
            </div>
            <ul className="space-y-1.5">
              {cow.contributingFactors.map((factor, idx) => (
                <li
                  key={idx}
                  className="text-xs text-slate-700 flex items-start gap-2 bg-slate-50 p-2 rounded-lg border border-slate-200/70"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-600 mt-1.5 shrink-0" />
                  <span>{factor}</span>
                </li>
              ))}
            </ul>
          </div>

        </div>

        {/* Modal Footer */}
        <div className="p-4 sm:p-5 border-t border-slate-200 bg-slate-50 flex items-center justify-between">
          <span className="text-xs text-slate-500 font-mono">
            Last Screened: {cow.lastScreeningDate}
          </span>
          <button
            onClick={closeAnimalProfile}
            className="px-4 py-2 rounded-lg text-xs font-bold bg-slate-200 text-slate-800 hover:bg-slate-300 transition-colors"
          >
            Close Profile
          </button>
        </div>

      </div>
    </div>
  );
};
