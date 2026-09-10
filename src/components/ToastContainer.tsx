import React from 'react';
import { useHerd } from '../context/HerdContext';
import { X, AlertTriangle, CheckCircle2, Info } from 'lucide-react';

export const ToastContainer: React.FC = () => {
  const { toasts, dismissToast, openAnimalProfile } = useHerd();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`pointer-events-auto p-4 rounded-xl border-2 transition-all duration-200 flex items-start justify-between gap-3 shadow-md ${
            toast.type === 'alert'
              ? 'bg-red-600 text-white border-red-700'
              : toast.type === 'warning'
              ? 'bg-amber-500 text-slate-950 border-amber-600 font-medium'
              : toast.type === 'success'
              ? 'bg-slate-900 text-white border-slate-950'
              : 'bg-white text-slate-900 border-slate-300'
          }`}
        >
          <div
            className={`flex-1 cursor-pointer ${toast.animalId ? 'hover:opacity-90' : ''}`}
            onClick={() => {
              if (toast.animalId) {
                openAnimalProfile(toast.animalId);
                dismissToast(toast.id);
              }
            }}
          >
            <div className="font-black text-xs uppercase tracking-wider flex items-center gap-1.5">
              {toast.type === 'alert' && <AlertTriangle className="w-3.5 h-3.5" />}
              {toast.type === 'success' && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />}
              <span>{toast.title}</span>
            </div>
            <p className="text-xs mt-0.5 leading-snug opacity-95">
              {toast.message}
            </p>
            {toast.animalId && (
              <span className="text-[10px] underline font-bold mt-1 inline-block">
                Click to inspect cow profile &rarr;
              </span>
            )}
          </div>

          <button
            onClick={() => dismissToast(toast.id)}
            className="p-1 hover:opacity-75 transition-opacity shrink-0"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      ))}
    </div>
  );
};
