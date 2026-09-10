import React, { useState } from 'react';
import { useHerd } from '../context/HerdContext';
import { 
  X, 
  Radio, 
  Sparkles, 
  AlertTriangle, 
  CheckCircle2, 
  Sliders 
} from 'lucide-react';

export const RfidSimulatorModal: React.FC = () => {
  const { 
    isRfidModalOpen, 
    setRfidModalOpen, 
    animals, 
    simulateRfidScan,
    openAnimalProfile
  } = useHerd();

  const [selectedCowId, setSelectedCowId] = useState<string>(animals[0]?.id || '');
  const [simulationType, setSimulationType] = useState<'high_risk' | 'watch' | 'healthy'>('high_risk');
  const [customScc, setCustomScc] = useState<number>(450);
  const [customEc, setCustomEc] = useState<number>(6.5);

  if (!isRfidModalOpen) return null;

  const handleTypeSelect = (type: 'high_risk' | 'watch' | 'healthy') => {
    setSimulationType(type);
    if (type === 'high_risk') {
      setCustomScc(480);
      setCustomEc(6.8);
    } else if (type === 'watch') {
      setCustomScc(220);
      setCustomEc(5.7);
    } else {
      setCustomScc(85);
      setCustomEc(4.8);
    }
  };

  const handleSimulate = (e: React.FormEvent) => {
    e.preventDefault();
    simulateRfidScan(selectedCowId || animals[0]?.id, customScc, customEc);
    setRfidModalOpen(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xl max-w-lg w-full my-8 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        
        {/* Header */}
        <div className="p-5 border-b border-slate-200 flex items-center justify-between bg-slate-50/70">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-slate-900 text-white flex items-center justify-center font-bold shadow-xs">
              <Radio className="w-5 h-5 text-emerald-400 animate-pulse" />
            </div>
            <div>
              <h2 className="text-base font-black text-slate-900">
                Portable Milk Scanner
              </h2>
              <p className="text-xs text-slate-500">
                Tap cow RFID tag and test milk sample (SCC, EC, pH, Milk Temp)
              </p>
            </div>
          </div>

          <button
            onClick={() => setRfidModalOpen(false)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-200/60 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Form */}
        <form onSubmit={handleSimulate} className="p-5 space-y-4">
          
          {/* Cow Selector */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
              Select Cow (RFID Ear Tag)
            </label>
            <select
              value={selectedCowId}
              onChange={(e) => setSelectedCowId(e.target.value)}
              className="w-full px-3 py-2.5 bg-slate-50 border border-slate-300 rounded-lg text-xs font-bold text-slate-900 focus:bg-white focus:ring-2 focus:ring-blue-500"
            >
              {animals.map((cow) => (
                <option key={cow.id} value={cow.id}>
                  {cow.tag} — {cow.name} ({cow.breed}, Parity {cow.parity})
                </option>
              ))}
            </select>
          </div>

          {/* Quick Scenario Preset */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
              Screening Scenario Preset
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => handleTypeSelect('high_risk')}
                className={`p-2.5 rounded-xl border text-center transition-all text-xs font-bold ${
                  simulationType === 'high_risk'
                    ? 'border-red-600 bg-red-50 text-red-900 shadow-2xs'
                    : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                }`}
              >
                <AlertTriangle className="w-4 h-4 text-red-600 mx-auto mb-1" />
                <span>Critical Spike</span>
              </button>

              <button
                type="button"
                onClick={() => handleTypeSelect('watch')}
                className={`p-2.5 rounded-xl border text-center transition-all text-xs font-bold ${
                  simulationType === 'watch'
                    ? 'border-amber-600 bg-amber-50 text-amber-900 shadow-2xs'
                    : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                }`}
              >
                <Sliders className="w-4 h-4 text-amber-600 mx-auto mb-1" />
                <span>Watch List</span>
              </button>

              <button
                type="button"
                onClick={() => handleTypeSelect('healthy')}
                className={`p-2.5 rounded-xl border text-center transition-all text-xs font-bold ${
                  simulationType === 'healthy'
                    ? 'border-emerald-600 bg-emerald-50 text-emerald-900 shadow-2xs'
                    : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                }`}
              >
                <CheckCircle2 className="w-4 h-4 text-emerald-600 mx-auto mb-1" />
                <span>Healthy Clear</span>
              </button>
            </div>
          </div>

          {/* Sensor Parameter Sliders */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
            <div>
              <div className="flex items-center justify-between text-xs font-bold mb-1">
                <span className="text-slate-700">Simulated Somatic Cells (SCC)</span>
                <span className="font-mono text-slate-900">{customScc}k cells/ml</span>
              </div>
              <input
                type="range"
                min="50"
                max="800"
                step="10"
                value={customScc}
                onChange={(e) => setCustomScc(parseInt(e.target.value))}
                className="w-full accent-blue-600 cursor-pointer"
              />
            </div>

            <div>
              <div className="flex items-center justify-between text-xs font-bold mb-1">
                <span className="text-slate-700">Electrical Conductivity (EC)</span>
                <span className="font-mono text-slate-900">{customEc} mS/cm</span>
              </div>
              <input
                type="range"
                min="4.0"
                max="8.5"
                step="0.1"
                value={customEc}
                onChange={(e) => setCustomEc(parseFloat(e.target.value))}
                className="w-full accent-blue-600 cursor-pointer"
              />
            </div>
          </div>

          {/* Footer Buttons */}
          <div className="pt-2 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={() => setRfidModalOpen(false)}
              className="px-4 py-2 rounded-lg text-xs font-bold bg-slate-100 text-slate-700 hover:bg-slate-200"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-lg text-xs font-bold bg-slate-900 text-white hover:bg-black transition-colors shadow-xs flex items-center gap-1.5"
            >
              <Radio className="w-3.5 h-3.5 text-emerald-400" />
              <span>Record Milk Test</span>
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
