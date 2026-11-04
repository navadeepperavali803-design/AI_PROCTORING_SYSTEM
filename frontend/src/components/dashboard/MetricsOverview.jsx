import React from 'react';
import { useAdmin } from '../../context/AdminContext';
import { StatCard } from '../common/StatCard';
import { Users, Video, AlertTriangle, CheckSquare, ShieldCheck } from 'lucide-react';

export const MetricsOverview = () => {
  const {
    sessions,
    activeSessions,
    events,
    pendingEvents,
    confirmedEvents,
    avgIntegrity,
  } = useAdmin();

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
      <StatCard
        title="Total Sessions"
        value={sessions.length}
        subtext="All exam attempts"
        icon={Users}
        variant="blue"
      />
      <StatCard
        title="Active Live Exams"
        value={activeSessions.length}
        subtext="Live webcam streaming"
        icon={Video}
        variant="emerald"
        trend={activeSessions.length > 0 ? 12 : 0}
      />
      <StatCard
        title="Flagged Incidents"
        value={events.length}
        subtext={`${confirmedEvents.length} confirmed misconduct`}
        icon={AlertTriangle}
        variant="rose"
      />
      <StatCard
        title="Pending Reviews"
        value={pendingEvents.length}
        subtext="Awaiting proctor action"
        icon={CheckSquare}
        variant="amber"
      />
      <StatCard
        title="Avg Integrity Score"
        value={`${avgIntegrity}%`}
        subtext="Weighted compliance index"
        icon={ShieldCheck}
        variant="purple"
      />
    </div>
  );
};
