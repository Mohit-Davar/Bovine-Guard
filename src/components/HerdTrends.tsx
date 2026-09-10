import React, { useState, useMemo } from 'react';
import { useHerd } from '../context/HerdContext';
import { LoadingState } from './ui/LoadingState';
import { EmptyState } from './ui/EmptyState';
import { ErrorState } from './ui/ErrorState';
import { 
  ResponsiveContainer,
  AreaChart,
  Area,
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
  ReferenceLine
} from 'recharts';
import { 
  TrendingUp, 
  Activity, 
  Calendar, 
  ShieldCheck, 
  AlertTriangle, 
  RotateCcw,
  BarChart2,
  MapPin,
  Flame,
  DollarSign,
  Layers,
  HelpCircle,
  Clock,
  ArrowUpRight,
  TrendingDown,
  Info,
  Building,
  Zap
} from 'lucide-react';

type TrendSubTab = 'geomap' | 'trajectory' | 'barn_comparison' | 'quarters';

export const HerdTrends: React.FC = () => {
  const { 
    animals, 
    tabLoading, 
    tabError, 
    isRetryingTab, 
    retryTab, 
    resetToSampleData,
    openAnimalProfile
  } = useHerd();

  const [activeSubTab, setActiveSubTab] = useState<TrendSubTab>('geomap');
  const [selectedBarnId, setSelectedBarnId] = useState<string>('barn-1');

  const isLoading = tabLoading.trends;
  const error = tabError.trends;
  const isRetrying = isRetryingTab.trends;

  // 14-Day Rolling Herd History (Dual Axis: SCC in x1000 cells/mL vs Average EC in mS/cm)
  const trajectory14DayData = [
    { day: 'D-13', date: 'Sep 27', avgScc: 135, avgEc: 4.82, flaggedCows: 1, bulkTankLimit: 200, thi: 70 },
    { day: 'D-12', date: 'Sep 28', avgScc: 140, avgEc: 4.85, flaggedCows: 1, bulkTankLimit: 200, thi: 71 },
    { day: 'D-11', date: 'Sep 29', avgScc: 138, avgEc: 4.84, flaggedCows: 2, bulkTankLimit: 200, thi: 71 },
    { day: 'D-10', date: 'Sep 30', avgScc: 145, avgEc: 4.89, flaggedCows: 2, bulkTankLimit: 200, thi: 72 },
    { day: 'D-9',  date: 'Oct 01', avgScc: 142, avgEc: 4.88, flaggedCows: 2, bulkTankLimit: 200, thi: 73 },
    { day: 'D-8',  date: 'Oct 02', avgScc: 155, avgEc: 4.95, flaggedCows: 3, bulkTankLimit: 200, thi: 74 },
    { day: 'D-7',  date: 'Oct 03', avgScc: 160, avgEc: 5.02, flaggedCows: 4, bulkTankLimit: 200, thi: 75 },
    { day: 'D-6',  date: 'Oct 04', avgScc: 168, avgEc: 5.10, flaggedCows: 4, bulkTankLimit: 200, thi: 76 },
    { day: 'D-5',  date: 'Oct 05', avgScc: 182, avgEc: 5.22, flaggedCows: 6, bulkTankLimit: 200, thi: 77 },
    { day: 'D-4',  date: 'Oct 06', avgScc: 178, avgEc: 5.18, flaggedCows: 5, bulkTankLimit: 200, thi: 76 },
    { day: 'D-3',  date: 'Oct 07', avgScc: 195, avgEc: 5.34, flaggedCows: 7, bulkTankLimit: 200, thi: 78 },
    { day: 'D-2',  date: 'Oct 08', avgScc: 205, avgEc: 5.42, flaggedCows: 8, bulkTankLimit: 200, thi: 78 },
    { day: 'Yday', date: 'Oct 09', avgScc: 215, avgEc: 5.48, flaggedCows: 9, bulkTankLimit: 200, thi: 79 },
    { day: 'Today', date: 'Oct 10', avgScc: 228, avgEc: 5.56, flaggedCows: 10, bulkTankLimit: 200, thi: 78 },
  ];

  // Barn Facilities Definitions with Coordinates for Geomap
  const barnFacilities = useMemo(() => {
    // Map existing animals into barns cleanly by assignedBarn or assignedPen
    const b1Cows = animals.filter(a => a.assignedBarn?.includes('1') || a.assignedPen?.includes('3') || a.assignedPen?.includes('High Yield') || a.id === 'cow-027');
    const b2Cows = animals.filter(a => a.assignedBarn?.includes('2') || a.assignedPen?.includes('1') || a.assignedPen?.includes('Fresh') || a.id === 'cow-041');
    const b3Cows = animals.filter(a => a.assignedBarn?.includes('3') || a.assignedPen?.includes('2') || a.assignedPen?.includes('General') || a.assignedBarn?.includes('Mid') || a.id === 'cow-019');
    const b4Cows = animals.filter(a => a.assignedBarn?.includes('4') || a.assignedPen?.includes('Dry') || a.assignedPen?.includes('Maternity') || a.assignedPen?.includes('Pen 4'));

    const calcStats = (cows: typeof animals) => {
      const count = Math.max(cows.length, 1);
      const avgScc = Math.round(cows.reduce((acc, c) => acc + c.scc, 0) / count);
      const avgEc = +(cows.reduce((acc, c) => acc + c.ec, 0) / count).toFixed(2);
      const highRiskCount = cows.filter(c => c.currentRisk === 'critical' || c.currentRisk === 'high').length;
      const riskPct = Math.round((highRiskCount / count) * 100);
      return { count: cows.length, avgScc, avgEc, highRiskCount, riskPct, cows };
    };

    const s1 = calcStats(b1Cows);
    const s2 = calcStats(b2Cows);
    const s3 = calcStats(b3Cows);
    const s4 = calcStats(b4Cows);

    return [
      {
        id: 'barn-1',
        name: 'Barn 1: Lactating High-Yield',
        code: 'B-1 (North Wing)',
        type: 'Free-Stall',
        coords: { x: 18, y: 15, width: 28, height: 32 },
        thi: 76.5,
        status: s1.highRiskCount > 0 ? 'warning' : 'optimal',
        ...s1,
      },
      {
        id: 'barn-2',
        name: 'Barn 2: Fresh & Early Lactation',
        code: 'B-2 (East Wing)',
        type: 'Open-Air Shed',
        coords: { x: 54, y: 15, width: 28, height: 32 },
        thi: 78.8,
        status: s2.highRiskCount > 0 ? 'critical' : 'optimal',
        ...s2,
      },
      {
        id: 'barn-3',
        name: 'Barn 3: Mid & Late Lactation',
        code: 'B-3 (South Wing)',
        type: 'Covered Pen',
        coords: { x: 18, y: 55, width: 28, height: 32 },
        thi: 74.2,
        status: 'optimal',
        ...s3,
      },
      {
        id: 'barn-4',
        name: 'Barn 4: Maternity & Isolation',
        code: 'B-4 (West Wing)',
        type: 'Hospital Pen',
        coords: { x: 54, y: 55, width: 28, height: 32 },
        thi: 73.0,
        status: 'optimal',
        ...s4,
      },
    ];
  }, [animals]);

  // Selected Barn Data
  const currentBarn = barnFacilities.find(b => b.id === selectedBarnId) || barnFacilities[0];

  // Barn Comparison Bar Chart Data
  const barnComparisonData = barnFacilities.map(b => ({
    name: b.name.split(':')[0],
    fullName: b.name,
    avgScc: b.avgScc,
    avgEc: b.avgEc,
    riskPct: b.riskPct,
    cowsCount: b.count,
  }));

  // 4-Quarter Herd Breakdown Data
  const quarterHerdData = useMemo(() => {
    let flInf = 0, frInf = 0, rlInf = 0, rrInf = 0;
    let flEcSum = 0, frEcSum = 0, rlEcSum = 0, rrEcSum = 0;

    animals.forEach(a => {
      a.quarters.forEach(q => {
        if (q.quarter === 'FL') { flEcSum += q.ec; if (q.ec >= 5.5) flInf++; }
        if (q.quarter === 'FR') { frEcSum += q.ec; if (q.ec >= 5.5) frInf++; }
        if (q.quarter === 'RL') { rlEcSum += q.ec; if (q.ec >= 5.5) rlInf++; }
        if (q.quarter === 'RR') { rrEcSum += q.ec; if (q.ec >= 5.5) rrInf++; }
      });
    });

    const total = Math.max(animals.length, 1);
    return [
      { quarter: 'FL (Front Left)', code: 'FL', avgEc: +(flEcSum / total).toFixed(2), infections: flInf, fill: '#3b82f6' },
      { quarter: 'FR (Front Right)', code: 'FR', avgEc: +(frEcSum / total).toFixed(2), infections: frInf, fill: '#ef4444' },
      { quarter: 'RL (Rear Left)', code: 'RL', avgEc: +(rlEcSum / total).toFixed(2), infections: rlInf, fill: '#f59e0b' },
      { quarter: 'RR (Rear Right)', code: 'RR', avgEc: +(rrEcSum / total).toFixed(2), infections: rrInf, fill: '#10b981' },
    ];
  }, [animals]);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <LoadingState 
          title="Aggregating Herd Epidemiology Trends..."
          message="Calculating 14-day rolling Somatic Cell Count (SCC) averages, barn-wise conductivity metrics, and spatial geomap coordinates."
          variant="screen"
        />
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <ErrorState
          title="Failed to Load Historical Trend Analytics"
          message={error}
          onRetry={() => retryTab('trends')}
          retryLabel="Retry Sync"
          isRetrying={isRetrying}
          secondaryAction={{
            label: 'Restore Sample Analytics',
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
          icon="calendar"
          title="Insufficient Data for Trend Calculations"
          description="Animals and parlor screenings are required to plot statistical curves."
          primaryAction={{
            label: 'Load Herd Records',
            onClick: resetToSampleData,
            icon: <RotateCcw className="w-4 h-4" />,
          }}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6 text-slate-800">

      {/* Header with Navigation Pills & Biophysics Trigger */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              Herd Epidemiology & Facility Trends
            </h1>
            <span className="px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 font-bold text-[10px] font-mono">
              RECHARTS ENGINE
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Spatial contagion tracking, barn-wise averages, 14-day rolling curves, and quarter conductivity
          </p>
        </div>

        {/* Sub-Tab Switcher */}
        <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs self-start sm:self-center">
          <button
            onClick={() => setActiveSubTab('geomap')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-semibold transition-colors ${
              activeSubTab === 'geomap'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Building className="w-3.5 h-3.5 text-blue-600" />
            <span>Barn Geomap</span>
          </button>

          <button
            onClick={() => setActiveSubTab('trajectory')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-semibold transition-colors ${
              activeSubTab === 'trajectory'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <TrendingUp className="w-3.5 h-3.5 text-emerald-600" />
            <span>14-Day Trajectory</span>
          </button>

          <button
            onClick={() => setActiveSubTab('barn_comparison')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-semibold transition-colors ${
              activeSubTab === 'barn_comparison'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <BarChart2 className="w-3.5 h-3.5 text-purple-600" />
            <span>Barn Comparison</span>
          </button>

          <button
            onClick={() => setActiveSubTab('quarters')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-semibold transition-colors ${
              activeSubTab === 'quarters'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Zap className="w-3.5 h-3.5 text-amber-600" />
            <span>Quarter Biophysics</span>
          </button>
        </div>
      </div>

      {/* SUBTAB 1: Interactive Facility Geomap & Barn-Wise Averages */}
      {activeSubTab === 'geomap' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
            
            {/* Interactive SVG Facility Map */}
            <div className="lg:col-span-8 bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-slate-900 flex items-center gap-2 text-sm">
                    <MapPin className="w-4 h-4 text-blue-600" />
                    Interactive Facility Geomap & Spatial Layout
                  </h3>
                  <p className="text-xs text-slate-500">
                    Click any barn or shed to view localized average SCC, conductivity, and cows
                  </p>
                </div>

                <div className="flex items-center gap-2 text-[11px] font-mono">
                  <span className="inline-flex items-center gap-1 text-emerald-700">
                    <span className="w-2 h-2 rounded-full bg-emerald-500" />
                    Normal (&lt;5.2 mS)
                  </span>
                  <span className="inline-flex items-center gap-1 text-red-600">
                    <span className="w-2 h-2 rounded-full bg-red-500" />
                    Flagged (&gt;5.5 mS)
                  </span>
                </div>
              </div>

              {/* Architectural Facility SVG Canvas */}
              <div className="relative w-full h-80 bg-slate-900 rounded-xl overflow-hidden border border-slate-800 p-4 select-none">
                {/* Background Grid Pattern */}
                <div 
                  className="absolute inset-0 opacity-15" 
                  style={{ backgroundImage: 'radial-gradient(#94a3b8 1px, transparent 1px)', backgroundSize: '16px 16px' }}
                />

                {/* Central Parlor & Gateway Hub */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-28 h-20 bg-slate-800 border-2 border-blue-500/80 rounded-xl flex flex-col items-center justify-center text-center p-2 shadow-lg z-10">
                  <div className="w-2 h-2 rounded-full bg-blue-400 animate-ping mb-1" />
                  <span className="text-[11px] font-bold text-white tracking-tight">Milking Parlor</span>
                  <span className="text-[9px] text-blue-300 font-mono">Stalls 1–12 Hub</span>
                  <span className="text-[8px] text-slate-400 font-mono">Optical + RFID</span>
                </div>

                {/* 4 Barn Zones */}
                {barnFacilities.map((barn) => {
                  const isSelected = selectedBarnId === barn.id;
                  const hasWarning = barn.highRiskCount > 0;

                  return (
                    <button
                      key={barn.id}
                      type="button"
                      onClick={() => setSelectedBarnId(barn.id)}
                      style={{
                        top: `${barn.coords.y}%`,
                        left: `${barn.coords.x}%`,
                        width: `${barn.coords.width}%`,
                        height: `${barn.coords.height}%`,
                      }}
                      className={`absolute rounded-xl transition-all p-3 text-left flex flex-col justify-between border cursor-pointer ${
                        isSelected
                          ? 'bg-slate-800/95 border-blue-400 shadow-xl ring-2 ring-blue-400/40 z-20'
                          : hasWarning
                          ? 'bg-red-950/40 border-red-500/60 hover:bg-red-950/60'
                          : 'bg-slate-800/60 border-slate-700 hover:bg-slate-800/90'
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block font-mono">
                            {barn.code}
                          </span>
                          <span className="text-xs font-bold text-white block truncate">
                            {barn.name.split(':')[0]}
                          </span>
                        </div>

                        {hasWarning ? (
                          <span className="px-1.5 py-0.5 rounded bg-red-500/20 text-red-400 text-[10px] font-bold font-mono">
                            {barn.highRiskCount} ALERT
                          </span>
                        ) : (
                          <span className="px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400 text-[10px] font-bold font-mono">
                            CLEAR
                          </span>
                        )}
                      </div>

                      <div className="grid grid-cols-2 gap-1 text-[11px] font-mono mt-1 pt-1 border-t border-slate-700/60">
                        <div>
                          <span className="text-slate-400 text-[9px] block">Avg SCC</span>
                          <span className={`font-bold ${barn.avgScc > 200 ? 'text-red-400' : 'text-slate-200'}`}>
                            {barn.avgScc}k
                          </span>
                        </div>
                        <div>
                          <span className="text-slate-400 text-[9px] block">Avg EC</span>
                          <span className={`font-bold ${barn.avgEc > 5.5 ? 'text-amber-400' : 'text-slate-200'}`}>
                            {barn.avgEc} mS
                          </span>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Selected Barn Detailed Panel */}
            <div className="lg:col-span-4 bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs space-y-4">
              <div className="border-b border-slate-200 pb-3">
                <span className="text-[10px] font-bold font-mono text-blue-600 uppercase tracking-wider">
                  BARN TELEMETRY PROFILE
                </span>
                <h3 className="text-base font-bold text-slate-900 mt-0.5">
                  {currentBarn.name}
                </h3>
                <span className="text-xs text-slate-500">
                  {currentBarn.type} · Housing {currentBarn.count} Cows
                </span>
              </div>

              {/* Quick Metrics */}
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                  <span className="text-slate-400 text-[10px] block">Barn Avg SCC</span>
                  <span className="text-lg font-black font-mono text-slate-900">{currentBarn.avgScc}k</span>
                  <span className="text-[10px] text-slate-500 block">Benchmark: &lt;200k</span>
                </div>

                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                  <span className="text-slate-400 text-[10px] block">Barn Avg EC</span>
                  <span className="text-lg font-black font-mono text-amber-700">{currentBarn.avgEc}</span>
                  <span className="text-[10px] text-slate-500 block">mS/cm</span>
                </div>

                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                  <span className="text-slate-400 text-[10px] block">High-Risk Animals</span>
                  <span className="text-lg font-black font-mono text-red-600">{currentBarn.highRiskCount}</span>
                  <span className="text-[10px] text-slate-500 block">Active watch</span>
                </div>

                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                  <span className="text-slate-400 text-[10px] block">Barn THI Stress</span>
                  <span className="text-lg font-black font-mono text-slate-900">{currentBarn.thi}</span>
                  <span className="text-[10px] text-amber-700 font-semibold block">Moderate Stress</span>
                </div>
              </div>

              {/* Animals in this Barn */}
              <div className="space-y-2 pt-1">
                <span className="text-xs font-bold text-slate-700 block">
                  Cows in {currentBarn.name.split(':')[0]}:
                </span>
                <div className="max-h-40 overflow-y-auto space-y-1.5 pr-1">
                  {currentBarn.cows.length > 0 ? (
                    currentBarn.cows.map(cow => (
                      <button
                        key={cow.id}
                        type="button"
                        onClick={() => openAnimalProfile(cow.id)}
                        className="w-full text-left p-2 bg-slate-50 hover:bg-slate-100 rounded-lg border border-slate-200 flex items-center justify-between text-xs transition-colors"
                      >
                        <div>
                          <strong className="text-slate-800">{cow.name}</strong>
                          <span className="text-slate-400 text-[11px] ml-1.5 font-mono">{cow.tag}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-slate-600 font-bold">{cow.scc}k SCC</span>
                          <span className={`px-1.5 py-0.2 text-[10px] font-bold rounded uppercase ${
                            cow.currentRisk === 'critical' ? 'bg-red-100 text-red-700' : cow.currentRisk === 'high' ? 'bg-amber-100 text-amber-800' : 'bg-emerald-100 text-emerald-800'
                          }`}>
                            {cow.currentRisk}
                          </span>
                        </div>
                      </button>
                    ))
                  ) : (
                    <span className="text-xs text-slate-400 italic">No cows currently stationed here</span>
                  )}
                </div>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* SUBTAB 2: 14-Day Trajectory Area/Line Chart (Recharts) */}
      {activeSubTab === 'trajectory' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-2xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100">
            <div>
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-emerald-600" />
                14-Day Rolling Herd Trajectory: Somatic Cell Count vs Conductivity
              </h3>
              <p className="text-xs text-slate-500">
                Tracking bulk herd elevation and correlation with Stage 1 parlor screening flags
              </p>
            </div>

            <div className="flex items-center gap-3 text-xs font-mono">
              <span className="inline-flex items-center gap-1.5 text-blue-700 font-bold">
                <span className="w-3 h-1 bg-blue-600 rounded-full" />
                Avg SCC (x1000)
              </span>
              <span className="inline-flex items-center gap-1.5 text-amber-600 font-bold">
                <span className="w-3 h-1 bg-amber-500 rounded-full" />
                Avg EC (mS/cm)
              </span>
            </div>
          </div>

          {/* Recharts AreaChart with Dual Y-Axis */}
          <div className="h-80 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trajectory14DayData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="sccGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.35} />
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.0} />
                  </linearGradient>
                  <linearGradient id="ecGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.35} />
                    <stop offset="95%" stopColor="#f59e0b" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis 
                  dataKey="date" 
                  tick={{ fontSize: 11, fill: '#64748b' }} 
                  axisLine={{ stroke: '#cbd5e1' }}
                  tickLine={false}
                />
                {/* Left Y Axis: SCC */}
                <YAxis 
                  yAxisId="left" 
                  domain={[100, 260]} 
                  tick={{ fontSize: 11, fill: '#3b82f6' }} 
                  axisLine={{ stroke: '#cbd5e1' }}
                  tickLine={false}
                  unit="k"
                />
                {/* Right Y Axis: EC */}
                <YAxis 
                  yAxisId="right" 
                  orientation="right" 
                  domain={[4.5, 6.0]} 
                  tick={{ fontSize: 11, fill: '#d97706' }} 
                  axisLine={{ stroke: '#cbd5e1' }}
                  tickLine={false}
                  unit=" mS"
                />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', borderRadius: '10px', color: '#fff', fontSize: '12px' }}
                  formatter={(val: any, name: any) => [
                    name === 'avgScc' ? `${val},000 cells/mL` : `${val} mS/cm`,
                    name === 'avgScc' ? 'Average SCC' : 'Average Conductivity'
                  ]}
                />
                <ReferenceLine 
                  yAxisId="left" 
                  y={200} 
                  stroke="#ef4444" 
                  strokeDasharray="4 4" 
                  label={{ value: '200k Penalty Limit', position: 'top', fill: '#dc2626', fontSize: 10, fontWeight: 700 }}
                />
                <Area 
                  yAxisId="left" 
                  type="monotone" 
                  dataKey="avgScc" 
                  stroke="#2563eb" 
                  strokeWidth={2.5} 
                  fillOpacity={1} 
                  fill="url(#sccGradient)" 
                />
                <Area 
                  yAxisId="right" 
                  type="monotone" 
                  dataKey="avgEc" 
                  stroke="#d97706" 
                  strokeWidth={2.5} 
                  fillOpacity={1} 
                  fill="url(#ecGradient)" 
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-600 flex items-center justify-between">
            <span>
              <strong>Key Finding:</strong> Notice how <strong>EC (mS/cm) begins rising on D-7</strong> prior to the massive SCC spike on D-3. Conductivity serves as an early biochemical leading indicator.
            </span>
            <span className="font-mono font-bold text-slate-800 shrink-0">
              Lead Time: +48 Hours
            </span>
          </div>
        </div>
      )}

      {/* SUBTAB 3: Barn-Wise Comparison Bar Charts (Recharts) */}
      {activeSubTab === 'barn_comparison' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            
            {/* Chart 1: Average SCC by Barn */}
            <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs space-y-3">
              <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                <BarChart2 className="w-4 h-4 text-blue-600" />
                Barn-Wise Average Somatic Cell Count (SCC × 10³)
              </h3>
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={barnComparisonData} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} unit="k" />
                    <Tooltip 
                      formatter={(val: any) => [`${val},000 cells/mL`, 'Avg SCC']}
                      contentStyle={{ backgroundColor: '#0f172a', borderRadius: '8px', color: '#fff', fontSize: '11px' }}
                    />
                    <ReferenceLine y={200} stroke="#ef4444" strokeDasharray="3 3" />
                    <Bar dataKey="avgScc" fill="#3b82f6" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Chart 2: Average Conductivity (mS/cm) by Barn */}
            <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs space-y-3">
              <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                <Zap className="w-4 h-4 text-amber-600" />
                Barn-Wise Electrical Conductivity (mS/cm)
              </h3>
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={barnComparisonData} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
                    <YAxis domain={[4.0, 6.5]} tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} unit=" mS" />
                    <Tooltip 
                      formatter={(val: any) => [`${val} mS/cm`, 'Avg Conductivity']}
                      contentStyle={{ backgroundColor: '#0f172a', borderRadius: '8px', color: '#fff', fontSize: '11px' }}
                    />
                    <ReferenceLine y={5.5} stroke="#ef4444" strokeDasharray="3 3" />
                    <Bar dataKey="avgEc" fill="#f59e0b" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* SUBTAB 4: Quarter Biophysics & Vulnerability Distribution */}
      {activeSubTab === 'quarters' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          
          {/* Quarter Breakdown Chart */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs space-y-3">
            <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
              <Zap className="w-4 h-4 text-red-600" />
              Herd Quarter Distribution & Average mS/cm
            </h3>
            <p className="text-xs text-slate-500">
              Comparing average conductivity across FL, FR, RL, and RR quarters
            </p>

            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={quarterHerdData} margin={{ top: 15, right: 15, left: -15, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="code" tick={{ fontSize: 12, fill: '#0f172a', fontWeight: 700 }} axisLine={false} tickLine={false} />
                  <YAxis domain={[4.0, 6.5]} tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} unit=" mS" />
                  <Tooltip 
                    formatter={(val: any, name: any, item: any) => [`${val} mS/cm (${item.payload.infections} active flags)`, 'Avg EC']}
                    contentStyle={{ backgroundColor: '#0f172a', borderRadius: '8px', color: '#fff', fontSize: '11px' }}
                  />
                  <ReferenceLine y={5.5} stroke="#ef4444" strokeDasharray="3 3" />
                  <Bar dataKey="avgEc" radius={[6, 6, 0, 0]}>
                    {quarterHerdData.map((entry, index) => (
                      <Cell key={`quarter-cell-${index}`} fill={entry.fill} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Quarter Differential Insights */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs space-y-3 flex flex-col justify-between">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                  Quarter Screening Rationale
                </span>
                <span className="text-xs text-slate-400 font-mono">Differential: &gt; 0.4 mS/cm</span>
              </div>
              <h4 className="font-bold text-slate-900 text-sm">
                Individual Quarter Screening Advantage
              </h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                A composite bulk test blends milk from all 4 quarters, which can dilute and mask a localized infection. Testing quarters individually detects electrical conductivity deviations before visual mastitis symptoms appear.
              </p>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1.5 text-xs text-slate-700">
                <div className="flex justify-between items-center">
                  <span className="text-slate-500">Normal Quarter Baseline:</span>
                  <span className="font-mono font-bold text-slate-800">4.5 – 5.5 mS/cm</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-500">Infection Alert Threshold:</span>
                  <span className="font-mono font-bold text-red-600">&gt; 5.8 mS/cm or +0.4 differential</span>
                </div>
              </div>
            </div>
          </div>

        </div>
      )}

    </div>
  );
};
