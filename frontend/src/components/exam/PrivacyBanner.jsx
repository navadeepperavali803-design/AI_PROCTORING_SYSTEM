import React, { useState } from 'react';
import { ShieldCheck, Info, X } from 'lucide-react';

export const PrivacyBanner = ({ className = '' }) => {
  const [isDismissed, setIsDismissed] = useState(false);

  if (isDismissed) return null;

  return (
    <div
      className={`relative bg-blue-950/40 border border-blue-500/30 rounded-xl p-3.5 flex items-start gap-3 text-xs ${className}`}
    >
      <div className="p-1.5 rounded-lg bg-blue-500/20 text-blue-400 mt-0.5">
        <ShieldCheck className="w-4 h-4" />
      </div>
      <div className="flex-1 pr-6 space-y-1">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-blue-200">Ethical AI Proctoring Active</span>
          <span className="text-[10px] bg-blue-500/30 text-blue-300 px-1.5 py-0.5 rounded">
            Privacy Protected
          </span>
        </div>
        <p className="text-slate-300 leading-relaxed text-[11px]">
          Webcam frames are analyzed client/edge side. Full continuous video is <strong>never stored</strong>.
          Only episodic verification snapshots for sustained anomalies are preserved for human proctor review.
        </p>
      </div>
      <button
        onClick={() => setIsDismissed(true)}
        className="absolute top-2.5 right-2.5 text-slate-400 hover:text-slate-200 p-1"
        title="Dismiss notice"
      >
        <X className="w-3.5 h-3.5" />
      </button>
    </div>
  );
};
