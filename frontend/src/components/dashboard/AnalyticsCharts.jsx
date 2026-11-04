import React from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  Legend,
} from 'recharts';
import {
  MOCK_CHART_TIMELINE,
  MOCK_CHART_DISTRIBUTION,
  MOCK_CHART_INTEGRITY,
} from '../../services/mockData';

// Custom dark tooltip component
const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-navy-950/95 border border-navy-700 rounded-xl p-3 shadow-2xl backdrop-blur-md text-xs">
        <p className="font-semibold text-slate-200 mb-1.5">{label}</p>
        <div className="space-y-1">
          {payload.map((entry, idx) => (
            <div key={idx} className="flex items-center justify-between gap-4">
              <span className="flex items-center gap-1.5 text-slate-400">
                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }} />
                {entry.name}:
              </span>
              <span className="font-mono font-bold text-slate-100">{entry.value}</span>
            </div>
          ))}
        </div>
      </div>
    );
  }
  return null;
};

export const AnalyticsCharts = () => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* 1. Incident Timeline Chart (2 cols on large) */}
      <div className="lg:col-span-2 bg-navy-900 border border-navy-800 rounded-2xl p-6 shadow-xl space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-white tracking-tight">Temporal Incident Flow</h3>
            <p className="text-xs text-slate-400">Anomalies tracked per 5-minute sampling interval</p>
          </div>
          <span className="text-xs px-2.5 py-1 rounded-lg bg-navy-800 text-blue-400 font-semibold border border-navy-750">
            Real-time Ingestion
          </span>
        </div>

        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={MOCK_CHART_TIMELINE} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="colorLookAway" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#F59E0B" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#F59E0B" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="colorAbsence" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#EF4444" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#EF4444" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="colorPhones" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#DC2626" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#DC2626" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" vertical={false} />
              <XAxis dataKey="time" stroke="#64748B" fontSize={11} tickLine={false} />
              <YAxis stroke="#64748B" fontSize={11} tickLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Area
                type="monotone"
                dataKey="totalLookAway"
                name="Looking Away"
                stroke="#F59E0B"
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#colorLookAway)"
              />
              <Area
                type="monotone"
                dataKey="totalAbsence"
                name="Absence"
                stroke="#EF4444"
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#colorAbsence)"
              />
              <Area
                type="monotone"
                dataKey="totalPhones"
                name="Mobile Phone"
                stroke="#DC2626"
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#colorPhones)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* 2. Violation Category Breakdown (Donut) */}
      <div className="bg-navy-900 border border-navy-800 rounded-2xl p-6 shadow-xl space-y-4">
        <div>
          <h3 className="text-sm font-bold text-white tracking-tight">Category Distribution</h3>
          <p className="text-xs text-slate-400">Total verified incident proportions</p>
        </div>

        <div className="h-64 w-full flex items-center justify-center">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={MOCK_CHART_DISTRIBUTION}
                cx="50%"
                cy="50%"
                innerRadius={55}
                outerRadius={80}
                paddingAngle={4}
                dataKey="value"
              >
                {MOCK_CHART_DISTRIBUTION.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} stroke="#0B0F19" strokeWidth={2} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="grid grid-cols-2 gap-2 pt-2 border-t border-navy-800 text-[11px] text-slate-400">
          {MOCK_CHART_DISTRIBUTION.map((item) => (
            <div key={item.name} className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: item.color }} />
              <span className="truncate">{item.name}</span>
              <span className="font-bold text-slate-200 ml-auto">{item.value}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
