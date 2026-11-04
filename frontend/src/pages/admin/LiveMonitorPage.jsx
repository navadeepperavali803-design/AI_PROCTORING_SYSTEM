import React, { useState } from 'react';
import { useAdmin } from '../../context/AdminContext';
import { LiveProctorGrid } from '../../components/dashboard/LiveProctorGrid';
import { ReportViewModal } from '../../components/dashboard/ReportViewModal';
import { Video, Bell, Volume2, ShieldCheck, Filter } from 'lucide-react';

export const LiveMonitorPage = () => {
  const { activeSessions, events } = useAdmin();
  const [selectedSession, setSelectedSession] = useState(null);
  const [soundEnabled, setSoundEnabled] = useState(true);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span className="text-xs font-semibold text-emerald-400 uppercase tracking-wider">
              Real-time Ingestion Stream
            </span>
          </div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight">
            Live Proctor Surveillance Grid
          </h1>
          <p className="text-xs text-slate-400">
            Multi-camera simultaneous facial landmark tracking and object anomaly detection
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setSoundEnabled(!soundEnabled)}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold border transition-all ${
              soundEnabled
                ? 'bg-blue-600/20 text-blue-300 border-blue-500/30'
                : 'bg-navy-800 text-slate-400 border-navy-700'
            }`}
          >
            <Volume2 className="w-4 h-4" />
            <span>{soundEnabled ? 'Alert Chime: On' : 'Alert Chime: Muted'}</span>
          </button>
        </div>
      </div>

      {/* Live Grid */}
      <LiveProctorGrid onSelectSession={(session) => setSelectedSession(session)} />

      {/* Report Modal on selection */}
      {selectedSession && (
        <ReportViewModal
          isOpen={Boolean(selectedSession)}
          onClose={() => setSelectedSession(null)}
          session={selectedSession}
          events={events}
        />
      )}
    </div>
  );
};
