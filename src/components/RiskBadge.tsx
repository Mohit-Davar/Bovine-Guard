import React from 'react';
import { RiskLevel } from '../types';
import { ShieldCheck, Activity, AlertTriangle, Stethoscope } from 'lucide-react';

interface RiskBadgeProps {
  risk: RiskLevel;
  score?: number;
  size?: 'sm' | 'md' | 'lg';
  showScore?: boolean;
}

export const RiskBadge: React.FC<RiskBadgeProps> = ({
  risk,
  score,
  size = 'md',
  showScore = true,
}) => {
  const getBadgeConfig = () => {
    switch (risk) {
      case 'risked':
      case 'critical':
      case 'high':
        return {
          bg: 'bg-red-600 text-white border-red-700',
          label: 'Risked',
          title: 'Stage 2 Confirmed · Veterinary Examination Required',
          icon: <AlertTriangle className={size === 'sm' ? 'w-3 h-3' : 'w-3.5 h-3.5'} />,
        };
      case 'suspected':
      case 'watch':
        return {
          bg: 'bg-amber-500 text-slate-950 border-amber-600 font-black',
          label: 'Suspected',
          title: 'Stage 1 Flagged · Stage 2 Wearable Monitoring Active',
          icon: <Activity className={size === 'sm' ? 'w-3 h-3' : 'w-3.5 h-3.5'} />,
        };
      case 'normal':
      case 'low':
      default:
        return {
          bg: 'bg-emerald-600 text-white border-emerald-700',
          label: 'Normal',
          title: 'Stage 1 Normal · Routine Milking',
          icon: <ShieldCheck className={size === 'sm' ? 'w-3 h-3' : 'w-3.5 h-3.5'} />,
        };
    }
  };

  const config = getBadgeConfig();

  const sizeClasses = {
    sm: 'text-[10px] px-2 py-0.5 rounded gap-1 font-bold',
    md: 'text-xs px-2.5 py-1 rounded-md gap-1.5 font-bold',
    lg: 'text-sm px-3.5 py-1.5 rounded-lg gap-2 font-black',
  };

  return (
    <span
      title={config.title}
      className={`inline-flex items-center uppercase tracking-wider border shadow-2xs ${config.bg} ${sizeClasses[size]}`}
    >
      {config.icon}
      <span>{config.label}</span>
      {showScore && score !== undefined && (
        <span className="opacity-90 font-mono font-black ml-0.5">
          ({score}%)
        </span>
      )}
    </span>
  );
};
