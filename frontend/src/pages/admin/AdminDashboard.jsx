import React, { useState } from 'react';
import { useAdmin } from '../../context/AdminContext';
import { MetricsOverview } from '../../components/dashboard/MetricsOverview';
import { LiveProctorGrid } from '../../components/dashboard/LiveProctorGrid';
import { AnalyticsCharts } from '../../components/dashboard/AnalyticsCharts';
import { EventTimeline } from '../../components/dashboard/EventTimeline';
import { IncidentDetailModal } from '../../components/dashboard/IncidentDetailModal';
import { ReportViewModal } from '../../components/dashboard/ReportViewModal';
import { RefreshCw, Shield, AlertTriangle } from 'lucide-react';

export const AdminDashboard = () => {
  const {
    sessions,
    events,
    loading,
    refreshData,
    updateEventStatus,
  } = useAdmin();

  const [selectedEvent, setSelectedEvent] = useState(null);
  const [selectedSessionForReport, setSelectedSessionForReport] = useState(null);

  return (
    <div className="space-y-8">
      {/* Top Welcome & Actions Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs uppercase font-bold tracking-wider px-2.5 py-0.5 rounded-full bg-blue-500/20 text-blue-400 border border-blue-500/30">
              Academic Integrity Center
            </span>
            <span className="text-xs text-slate-400">Computer Vision Stream Telemetry</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Proctoring Operations Dashboard
          </h1>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={refreshData}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold bg-navy-800 hover:bg-navy-700 text-slate-300 border border-navy-700 transition-colors"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-blue-400' : ''}`} />
            <span>Refresh Telemetry</span>
          </button>
        </div>
      </div>

      {/* 1. Key Performance Metrics */}
      <MetricsOverview />

      {/* 2. Live Student Video Stream Monitor */}
      <LiveProctorGrid
        onSelectSession={(session) => setSelectedSessionForReport(session)}
      />

      {/* 3. Analytics & Distribution Charts */}
      <AnalyticsCharts />

      {/* 4. Flagged Incidents Event Timeline Feed */}
      <EventTimeline
        onSelectEvent={(evt) => setSelectedEvent(evt)}
      />

      {/* Incident Detail Review Modal */}
      {selectedEvent && (
        <IncidentDetailModal
          isOpen={Boolean(selectedEvent)}
          onClose={() => setSelectedEvent(null)}
          event={selectedEvent}
          onUpdateStatus={updateEventStatus}
        />
      )}

      {/* Examination Session Report Modal */}
      {selectedSessionForReport && (
        <ReportViewModal
          isOpen={Boolean(selectedSessionForReport)}
          onClose={() => setSelectedSessionForReport(null)}
          session={selectedSessionForReport}
          events={events}
        />
      )}
    </div>
  );
};
