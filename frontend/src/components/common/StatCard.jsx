import React from 'react';

export const StatCard = ({
  title,
  value,
  subtext,
  icon: Icon,
  variant = 'blue',
  trend = null,
}) => {
  const variantStyles = {
    blue: {
      border: 'border-blue-500/20 hover:border-blue-500/40',
      iconBg: 'bg-blue-500/10 text-blue-400',
      glow: 'group-hover:shadow-[0_0_25px_rgba(59,130,246,0.15)]',
    },
    emerald: {
      border: 'border-emerald-500/20 hover:border-emerald-500/40',
      iconBg: 'bg-emerald-500/10 text-emerald-400',
      glow: 'group-hover:shadow-[0_0_25px_rgba(16,185,129,0.15)]',
    },
    amber: {
      border: 'border-amber-500/20 hover:border-amber-500/40',
      iconBg: 'bg-amber-500/10 text-amber-400',
      glow: 'group-hover:shadow-[0_0_25px_rgba(245,158,11,0.15)]',
    },
    rose: {
      border: 'border-rose-500/20 hover:border-rose-500/40',
      iconBg: 'bg-rose-500/10 text-rose-400',
      glow: 'group-hover:shadow-[0_0_25px_rgba(239,68,68,0.15)]',
    },
    purple: {
      border: 'border-purple-500/20 hover:border-purple-500/40',
      iconBg: 'bg-purple-500/10 text-purple-400',
      glow: 'group-hover:shadow-[0_0_25px_rgba(168,85,247,0.15)]',
    },
  };

  const style = variantStyles[variant] || variantStyles.blue;

  return (
    <div
      className={`group relative bg-navy-900/80 backdrop-blur-sm border ${style.border} rounded-xl p-5 transition-all duration-300 ${style.glow}`}
    >
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <p className="text-xs font-medium uppercase tracking-wider text-slate-400">{title}</p>
          <h3 className="text-2xl font-bold text-white tracking-tight">{value}</h3>
        </div>
        {Icon && (
          <div className={`p-3 rounded-lg ${style.iconBg} transition-transform group-hover:scale-110`}>
            <Icon className="w-5 h-5" />
          </div>
        )}
      </div>

      {(subtext || trend) && (
        <div className="mt-4 pt-3 border-t border-navy-800 flex items-center justify-between text-xs text-slate-400">
          <span>{subtext}</span>
          {trend && (
            <span
              className={`font-semibold ${
                trend > 0 ? 'text-emerald-400' : trend < 0 ? 'text-rose-400' : 'text-slate-400'
              }`}
            >
              {trend > 0 ? `+${trend}%` : `${trend}%`}
            </span>
          )}
        </div>
      )}
    </div>
  );
};
