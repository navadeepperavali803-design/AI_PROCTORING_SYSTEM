import React from 'react';
import { useAdmin } from '../../context/AdminContext';
import { Video, AlertTriangle, Eye, ShieldCheck, ChevronRight } from 'lucide-react';

export const LiveProctorGrid = ({ onSelectSession }) => {
  const { activeSessions } = useAdmin();

  if (activeSessions.length === 0) {
    return (
      <div className="bg-navy-900 border border-navy-800 rounded-2xl p-12 text-center space-y-3">
        <div className="w-12 h-12 rounded-full bg-navy-800 border border-navy-700 flex items-center justify-center mx-auto text-slate-400">
          <Video className="w-6 h-6" />
        </div>
        <h4 className="text-base font-semibold text-white">No Active Examination Sessions</h4>
        <p className="text-xs text-slate-400 max-w-sm mx-auto">
          When students initiate an exam, their live telemetry streams will appear here in real time.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
          <h3 className="text-base font-bold text-white tracking-tight">Live Student Camera Feeds</h3>
          <span className="text-xs px-2 py-0.5 rounded-full bg-navy-800 text-slate-300 border border-navy-700">
            {activeSessions.length} Online
          </span>
        </div>
        <p className="text-xs text-slate-400">FPS: 5.0 • Sub-50ms Telemetry</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {activeSessions.map((session) => {
          const isSuspicious = session.currentStatus === 'SUSPICIOUS' || session.integrityScore < 70;
          const isWarning = session.pendingEvents > 0 && !isSuspicious;

          const borderClass = isSuspicious
            ? 'border-rose-500/60 shadow-lg shadow-rose-500/10'
            : isWarning
            ? 'border-amber-500/60 shadow-lg shadow-amber-500/10'
            : 'border-navy-750 hover:border-blue-500/40';

          return (
            <div
              key={session.id}
              onClick={() => onSelectSession?.(session)}
              className={`group bg-navy-900/90 border ${borderClass} rounded-2xl overflow-hidden transition-all duration-300 cursor-pointer hover:-translate-y-0.5`}
            >
              {/* Webcam Preview Frame */}
              <div className="relative aspect-video bg-navy-950 overflow-hidden">
                <img
                  src={session.studentAvatar}
                  alt={session.studentName}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-90"
                />

                {/* Simulated Face Tracking Mesh overlay */}
                <div className="absolute inset-0 border border-dashed border-emerald-400/30 m-6 rounded-lg pointer-events-none">
                  <div className="absolute top-1 left-1 text-[9px] font-mono text-emerald-400 bg-navy-950/80 px-1 rounded">
                    Y: {session.headPose?.yaw || 0}° | P: {session.headPose?.pitch || 0}°
                  </div>
                </div>

                {/* Top Status Tags */}
                <div className="absolute top-2.5 inset-x-2.5 flex items-center justify-between">
                  <span className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-navy-950/80 backdrop-blur-md border border-navy-700 text-[10px] font-bold text-slate-200">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                    LIVE {session.fps} FPS
                  </span>

                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full border backdrop-blur-md ${
                      isSuspicious
                        ? 'bg-rose-950/80 text-rose-300 border-rose-500/50'
                        : isWarning
                        ? 'bg-amber-950/80 text-amber-300 border-amber-500/50'
                        : 'bg-emerald-950/80 text-emerald-300 border-emerald-500/50'
                    }`}
                  >
                    {isSuspicious ? 'Suspicious' : isWarning ? 'Warning' : 'Compliant'}
                  </span>
                </div>

                {/* Bottom Student Info Bar */}
                <div className="absolute bottom-0 inset-x-0 p-3 bg-gradient-to-t from-navy-950 via-navy-950/80 to-transparent">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs font-bold text-white leading-tight">{session.studentName}</p>
                      <p className="text-[10px] text-slate-400">{session.examTitle}</p>
                    </div>
                    <div className="text-right">
                      <span className="text-xs font-mono font-bold text-emerald-400">
                        {session.integrityScore}%
                      </span>
                      <p className="text-[9px] text-slate-400 uppercase">Integrity</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Bottom Quick Action Strip */}
              <div className="px-4 py-2.5 bg-navy-850/60 border-t border-navy-800 flex items-center justify-between text-xs text-slate-400">
                <div className="flex items-center gap-3">
                  <span>
                    Events: <strong className="text-slate-200">{session.totalEvents}</strong>
                  </span>
                  <span>
                    Pending: <strong className="text-amber-400">{session.pendingEvents}</strong>
                  </span>
                </div>
                <div className="flex items-center gap-1 text-blue-400 group-hover:text-blue-300 font-medium">
                  <span>Inspect</span>
                  <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
