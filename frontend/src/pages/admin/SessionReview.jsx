import React, { useState } from 'react';
import { useAdmin } from '../../context/AdminContext';
import { StatusBadge } from '../../components/common/Badge';
import { ReportViewModal } from '../../components/dashboard/ReportViewModal';
import { FileText, Search, Filter, ShieldCheck, Download, ChevronRight } from 'lucide-react';

export const SessionReview = () => {
  const { sessions, events } = useAdmin();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [selectedSession, setSelectedSession] = useState(null);

  const filteredSessions = sessions.filter((s) => {
    if (statusFilter !== 'ALL' && s.status !== statusFilter) return false;
    if (
      searchQuery &&
      !s.studentName.toLowerCase().includes(searchQuery.toLowerCase()) &&
      !s.examTitle.toLowerCase().includes(searchQuery.toLowerCase())
    ) {
      return false;
    }
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight">
            Examination Session Records
          </h1>
          <p className="text-xs text-slate-400">
            Inspect individual student proctoring transcripts, score distributions, and formal reports
          </p>
        </div>

        <span className="text-xs font-semibold px-3 py-1 rounded-lg bg-navy-800 text-blue-400 border border-navy-750">
          {sessions.length} Archived Sessions
        </span>
      </div>

      {/* Search & Filter Controls */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search candidate name or exam title..."
            className="w-full bg-navy-900 border border-navy-800 rounded-xl pl-10 pr-4 py-2.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-blue-500"
          />
        </div>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="bg-navy-900 border border-navy-800 rounded-xl px-4 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-blue-500"
        >
          <option value="ALL">All Session Statuses</option>
          <option value="IN_PROGRESS">Active / In Progress</option>
          <option value="SUBMITTED">Completed / Submitted</option>
          <option value="TERMINATED">Terminated</option>
        </select>
      </div>

      {/* Sessions Table */}
      <div className="bg-navy-900 border border-navy-800 rounded-2xl shadow-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-navy-850/80 text-slate-400 font-semibold uppercase tracking-wider text-[11px] border-b border-navy-800">
              <tr>
                <th className="py-3.5 px-6">Candidate</th>
                <th className="py-3.5 px-4">Examination</th>
                <th className="py-3.5 px-4">Start Time</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4">Flagged Incidents</th>
                <th className="py-3.5 px-4">Integrity Index</th>
                <th className="py-3.5 px-6 text-right">Audit Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-navy-800/60">
              {filteredSessions.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-500">
                    No examination sessions matched your query.
                  </td>
                </tr>
              ) : (
                filteredSessions.map((s) => {
                  const studentEvents = events.filter((e) => e.sessionId === s.id);
                  const isHighRisk = s.integrityScore < 70;

                  return (
                    <tr
                      key={s.id}
                      className="hover:bg-navy-800/40 transition-colors cursor-pointer group"
                      onClick={() => setSelectedSession(s)}
                    >
                      <td className="py-3.5 px-6 flex items-center gap-3">
                        <img
                          src={s.studentAvatar}
                          alt={s.studentName}
                          className="w-8 h-8 rounded-full border border-navy-700 object-cover"
                        />
                        <div>
                          <p className="font-semibold text-white group-hover:text-blue-400 transition-colors">
                            {s.studentName}
                          </p>
                          <p className="text-[10px] text-slate-400 font-mono">{s.studentEmail}</p>
                        </div>
                      </td>

                      <td className="py-3.5 px-4 font-medium text-slate-200">
                        {s.examTitle}
                      </td>

                      <td className="py-3.5 px-4 text-slate-400 font-mono">
                        {new Date(s.startTime).toLocaleTimeString()}
                      </td>

                      <td className="py-3.5 px-4">
                        <StatusBadge status={s.status} />
                      </td>

                      <td className="py-3.5 px-4">
                        <span
                          className={`font-mono font-bold ${
                            s.totalEvents > 0 ? 'text-amber-400' : 'text-slate-400'
                          }`}
                        >
                          {s.totalEvents} Logged
                        </span>
                      </td>

                      <td className="py-3.5 px-4">
                        <span
                          className={`font-mono font-bold ${
                            isHighRisk ? 'text-rose-400' : 'text-emerald-400'
                          }`}
                        >
                          {s.integrityScore}%
                        </span>
                      </td>

                      <td className="py-3.5 px-6 text-right">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedSession(s);
                          }}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-navy-800 hover:bg-blue-600 text-slate-300 hover:text-white border border-navy-700 hover:border-blue-500 transition-all"
                        >
                          <FileText className="w-3.5 h-3.5" />
                          <span>View Official Report</span>
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

      {/* Official Report Modal */}
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
