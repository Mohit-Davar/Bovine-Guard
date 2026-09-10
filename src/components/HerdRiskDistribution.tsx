import React, { useMemo } from 'react'

import { useHerd } from '../context/HerdContext'
import { Activity, AlertTriangle, ShieldCheck } from 'lucide-react'
import { Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts'

export const HerdRiskDistribution: React.FC = () => {
  const { animals, t } = useHerd()

  const data = useMemo(() => {
    const risked = animals.filter((a) => a.currentRisk === 'risked').length
    const suspected = animals.filter((a) => a.currentRisk === 'suspected').length
    const normal = animals.filter((a) => a.currentRisk === 'normal').length

    return [
      {
        name: 'Risked (Stage 2)',
        value: risked,
        color: '#dc2626',
        icon: AlertTriangle,
        desc: 'Requires vet attention',
      },
      {
        name: 'Suspected (Stage 1)',
        value: suspected,
        color: '#f59e0b',
        icon: Activity,
        desc: 'Wearable monitoring',
      },
      {
        name: 'Normal',
        value: normal,
        color: '#10b981',
        icon: ShieldCheck,
        desc: 'Routine milking',
      },
    ]
  }, [animals])

  return (
    <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm flex flex-col h-full">
      <div className="mb-4">
        <h2 className="text-lg font-black text-slate-900 leading-tight">Herd Risk Distribution</h2>
        <p className="text-xs text-slate-500 font-medium">Real-time Stage 1 & Stage 2 funnel</p>
      </div>

      <div className="flex-1 flex flex-col md:flex-row items-center gap-6">
        {/* Chart Area */}
        <div className="w-full md:w-1/2 h-56 relative">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={80}
                paddingAngle={4}
                dataKey="value"
                stroke="none"
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                formatter={(val: any) => [`${val} animals`, 'Count']}
                contentStyle={{
                  borderRadius: '12px',
                  border: 'none',
                  boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                }}
              />
            </PieChart>
          </ResponsiveContainer>

          {/* Center Label */}
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
            <span className="text-3xl font-black text-slate-900">{animals.length}</span>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
              Total
            </span>
          </div>
        </div>

        {/* Legend & Details Area */}
        <div className="w-full md:w-1/2 flex flex-col gap-3 justify-center">
          {data.map((item) => {
            const Icon = item.icon
            const percentage =
              animals.length > 0 ? Math.round((item.value / animals.length) * 100) : 0
            return (
              <div
                key={item.name}
                className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-100 hover:border-slate-200 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div
                    className="w-8 h-8 rounded-full flex items-center justify-center text-white shadow-sm"
                    style={{ backgroundColor: item.color }}
                  >
                    <Icon className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-800">{item.name}</h4>
                    <p className="text-[10px] text-slate-500 font-medium">{item.desc}</p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-black text-slate-900">{item.value}</div>
                  <div className="text-[10px] font-bold text-slate-400">{percentage}%</div>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
