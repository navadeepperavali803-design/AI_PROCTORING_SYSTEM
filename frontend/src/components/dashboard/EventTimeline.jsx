import React from 'react';
import { useAdmin } from '../../context/AdminContext';
import { EventBadge, StatusBadge } from '../common/Badge';
import { EVENT_TYPES, REVIEW_STATUS } from '../../types';
import { AlertCircle, Clock, Filter, Eye, Check, X } from 'lucide-react';

export const EventTimeline = ({ onSelectEvent }) => {
  const {
    filteredEvents,
    statusFilter,
    setStatusFilter,
    eventTypeFilter,
    setEventTypeFilter,
    updateEventStatus,
  } = useAdmin();

  return (
    <div className="bg-navy-900 border border-navy-800 rounded-2xl shadow-xl overflow-hidden space-y-4">
      {/* Header and Filter Controls */}
      <div className="p-6 pb-0 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h3 className="text-base font-bold text-white tracking-tight">Suspicious Event Log</h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Real-time feed of detected behavioural anomalies requiring academic audit
          </p>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-2 text-xs">
          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-navy-800 text-slate-200 border border-navy-750 rounded-xl px-3 py-1.5 focus:outline-none focus:border-blue-500"
          >
            <option value="ALL">All Review Statuses</option>
            <option value={REVIEW_STATUS.PENDING}>Pending Review</option>
            <option value={REVIEW_STATUS.CONFIRMED}>Confirmed Misconduct</option>
            <option value={REVIEW_STATUS.CLEARED}>Cleared (Compliant)</option>
          </select>

          {/* Event Type Filter */}
          <select
            value={eventTypeFilter}
            onChange={(e) => setEventTypeFilter(e.target.value)}
            className="bg-navy-800 text-slate-200 border border-navy-750 rounded-xl px-3 py-1.5 focus:outline-none focus:border-blue-500"
          >
            <option value="ALL">All Violation Types</option>
            <option value={EVENT_TYPES.LOOKING_AWAY}>Looking Away</option>
            <option value={EVENT_TYPES.ABSENCE}>Person Absence</option>
            <option value={EVENT_TYPES.MULTIPLE_PERSONS}>Multiple Persons</option>
            <option value={EVENT_TYPES.PHONE_DETECTED}>Mobile Phone Detected</option>
          </select>
        </div>
      </div>

      {/* Events Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs text-slate-300">
          <thead className="bg-navy-850/80 text-slate-400 font-semibold uppercase tracking-wider text-[11px] border-y border-navy-800">
            <tr>
              <th className="py-3.5 px-6">Student</th>
              <th className="py-3.5 px-4">Event Category</th>
              <th className="py-3.5 px-4">Confidence</th>
              <th className="py-3.5 px-4">Duration</th>
              <th className="py-3.5 px-4">Timestamp</th>
              <th className="py-3.5 px-4">Review Status</th>
              <th className="py-3.5 px-6 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-navy-800/60">
            {filteredEvents.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-12 text-center text-slate-500">
                  No flagged incidents match the active filter criteria.
                </td>
              </tr>
            ) : (
              filteredEvents.map((evt) => {
                const confidencePct = Math.round(evt.confidence * 100);
                const isPending = evt.reviewStatus === REVIEW_STATUS.PENDING;

                return (
                  <tr
                    key={evt.id}
                    className="hover:bg-navy-800/40 transition-colors cursor-pointer group"
                    onClick={() => onSelectEvent?.(evt)}
                  >
                    {/* Student Info */}
                    <td className="py-3.5 px-6 flex items-center gap-3">
                      <img
                        src={evt.studentAvatar}
                        alt={evt.studentName}
                        className="w-8 h-8 rounded-full border border-navy-700 object-cover"
                      />
                      <div>
                        <p className="font-semibold text-white group-hover:text-blue-400 transition-colors">
                          {evt.studentName}
                        </p>
                        <p className="text-[10px] text-slate-400">{evt.examTitle}</p>
                      </div>
                    </td>

                    {/* Event Category */}
                    <td className="py-3.5 px-4">
                      <EventBadge type={evt.eventType} />
                    </td>

                    {/* Confidence Meter */}
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-2">
                        <div className="w-16 h-2 bg-navy-800 rounded-full overflow-hidden border border-navy-700">
                          <div
                            className={`h-full rounded-full ${
                              confidencePct >= 85
                                ? 'bg-rose-500'
                                : confidencePct >= 70
                                ? 'bg-amber-500'
                                : 'bg-blue-500'
                            }`}
                            style={{ width: `${confidencePct}%` }}
                          />
                        </div>
                        <span className="font-mono font-bold text-slate-200">
                          {confidencePct}%
                        </span>
                      </div>
                    </td>

                    {/* Duration */}
                    <td className="py-3.5 px-4 font-mono text-slate-300">
                      {evt.durationSeconds}s
                    </td>

                    {/* Timestamp */}
                    <td className="py-3.5 px-4 text-slate-400">
                      {new Date(evt.timestamp).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                        second: '2-digit',
                      })}
                    </td>

                    {/* Review Status */}
                    <td className="py-3.5 px-4">
                      <StatusBadge status={evt.reviewStatus} />
                    </td>

                    {/* Actions */}
                    <td className="py-3.5 px-6 text-right">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onSelectEvent?.(evt);
                        }}
                        className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-navy-800 hover:bg-blue-600 text-slate-300 hover:text-white border border-navy-700 hover:border-blue-500 transition-all"
                      >
                        {isPending ? 'Audit Incident' : 'View Evidence'}
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
