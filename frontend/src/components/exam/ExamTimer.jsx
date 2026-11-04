import React from 'react';
import { Clock, AlertCircle } from 'lucide-react';

export const ExamTimer = ({ secondsRemaining, totalSeconds = 2700 }) => {
  const hours = Math.floor(secondsRemaining / 3600);
  const minutes = Math.floor((secondsRemaining % 3600) / 60);
  const seconds = secondsRemaining % 60;

  const isWarning = secondsRemaining < 600 && secondsRemaining >= 180; // <10 min
  const isCritical = secondsRemaining < 180; // <3 min

  const formattedTime = [
    hours > 0 ? String(hours).padStart(2, '0') : null,
    String(minutes).padStart(2, '0'),
    String(seconds).padStart(2, '0'),
  ]
    .filter(Boolean)
    .join(':');

  const percentage = Math.max(0, Math.min(100, (secondsRemaining / totalSeconds) * 100));

  return (
    <div
      className={`flex items-center gap-3 px-4 py-2 rounded-xl border backdrop-blur-md transition-all duration-300 ${
        isCritical
          ? 'bg-rose-950/60 border-rose-500/50 text-rose-300 animate-pulse'
          : isWarning
          ? 'bg-amber-950/60 border-amber-500/50 text-amber-300'
          : 'bg-navy-900/90 border-navy-700 text-slate-200'
      }`}
    >
      <div className="relative w-8 h-8 flex items-center justify-center">
        <svg className="w-8 h-8 -rotate-90 transform" viewBox="0 0 36 36">
          <circle
            cx="18"
            cy="18"
            r="15.5"
            fill="none"
            className="stroke-navy-800"
            strokeWidth="3"
          />
          <circle
            cx="18"
            cy="18"
            r="15.5"
            fill="none"
            stroke="currentColor"
            strokeWidth="3"
            strokeDasharray="97.4"
            strokeDashoffset={97.4 - (percentage / 100) * 97.4}
            strokeLinecap="round"
            className="transition-all duration-1000"
          />
        </svg>
        <Clock className="w-3.5 h-3.5 absolute text-current" />
      </div>

      <div>
        <div className="flex items-center gap-1.5">
          <span className="text-xs uppercase font-semibold text-slate-400">Time Left</span>
          {isCritical && <AlertCircle className="w-3 h-3 text-rose-400" />}
        </div>
        <p className="text-base font-mono font-bold tracking-wider leading-none">
          {formattedTime}
        </p>
      </div>
    </div>
  );
};
