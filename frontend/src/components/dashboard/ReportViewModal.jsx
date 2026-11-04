import React from 'react';
import { Modal } from '../common/Modal';
import { StatusBadge, EventBadge } from '../common/Badge';
import { Printer, Download, ShieldCheck, CheckCircle2, AlertTriangle, FileText } from 'lucide-react';

export const ReportViewModal = ({ isOpen, onClose, session, events = [] }) => {
  if (!session) return null;

  const sessionEvents = events.filter((e) => e.sessionId === session.id);
  const confirmedCount = sessionEvents.filter((e) => e.reviewStatus === 'CONFIRMED').length;
  const clearedCount = sessionEvents.filter((e) => e.reviewStatus === 'CLEARED').length;
  const pendingCount = sessionEvents.filter((e) => e.reviewStatus === 'PENDING').length;

  const handlePrint = () => {
    window.print();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Examination Integrity Audit Report"
      subtitle={`Official Proctoring Transcript • Session ID: ${session.id}`}
      maxWidth="max-w-4xl"
    >
      <div className="space-y-6 text-slate-200" id="printable-report">
        {/* Report Header Card */}
        <div className="p-6 rounded-2xl bg-navy-850 border border-navy-750 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-blue-500/20 text-blue-400 border border-blue-500/30">
                Official Audit Report
              </span>
              <span className="text-xs text-slate-400">Generated: {new Date().toLocaleDateString()}</span>
            </div>
            <h2 className="text-xl font-bold text-white tracking-tight">{session.examTitle}</h2>
            <p className="text-xs text-slate-400 mt-0.5">Course Code: CS-401 • Examination Board</p>
          </div>

          <div className="text-right">
            <span className="text-3xl font-mono font-extrabold text-blue-400">
              {session.integrityScore}%
            </span>
            <p className="text-xs uppercase tracking-wider text-slate-400 font-semibold mt-0.5">
              Integrity Index
            </p>
          </div>
        </div>

        {/* Student & Session Information Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 rounded-xl bg-navy-950/70 border border-navy-800 space-y-2 text-xs">
            <h4 className="font-semibold text-slate-300 uppercase tracking-wider text-[11px] pb-1 border-b border-navy-800">
              Candidate Information
            </h4>
            <div className="flex justify-between py-1 border-b border-navy-850">
              <span className="text-slate-400">Student Name:</span>
              <strong className="text-white">{session.studentName}</strong>
            </div>
            <div className="flex justify-between py-1 border-b border-navy-850">
              <span className="text-slate-400">Candidate Email:</span>
              <span className="text-slate-300 font-mono">{session.studentEmail}</span>
            </div>
            <div className="flex justify-between py-1">
              <span className="text-slate-400">Verification ID:</span>
              <span className="text-slate-300 font-mono">{session.studentId || 'STD-2024-8921'}</span>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-navy-950/70 border border-navy-800 space-y-2 text-xs">
            <h4 className="font-semibold text-slate-300 uppercase tracking-wider text-[11px] pb-1 border-b border-navy-800">
              Session Telemetry
            </h4>
            <div className="flex justify-between py-1 border-b border-navy-850">
              <span className="text-slate-400">Session Start:</span>
              <span className="text-slate-300 font-mono">{new Date(session.startTime).toLocaleTimeString()}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-navy-850">
              <span className="text-slate-400">Session Status:</span>
              <StatusBadge status={session.status} />
            </div>
            <div className="flex justify-between py-1">
              <span className="text-slate-400">Active Camera Feed:</span>
              <span className="text-emerald-400 font-semibold">Verified Active (5.0 FPS)</span>
            </div>
          </div>
        </div>

        {/* Flagged Incidents Summary */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-bold text-white tracking-tight">Detected Behavioural Events</h4>
            <span className="text-xs text-slate-400">
              {sessionEvents.length} total event(s) logged
            </span>
          </div>

          <div className="rounded-xl border border-navy-800 overflow-hidden bg-navy-950/50">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-navy-850 text-slate-400 font-semibold uppercase tracking-wider text-[10px] border-b border-navy-800">
                <tr>
                  <th className="py-2.5 px-4">Event Type</th>
                  <th className="py-2.5 px-3">Confidence</th>
                  <th className="py-2.5 px-3">Duration</th>
                  <th className="py-2.5 px-3">Timestamp</th>
                  <th className="py-2.5 px-3">Status</th>
                  <th className="py-2.5 px-4">Audit Notes</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-navy-800/60">
                {sessionEvents.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-slate-500">
                      No infractions detected. Pristine session integrity recorded.
                    </td>
                  </tr>
                ) : (
                  sessionEvents.map((evt) => (
                    <tr key={evt.id} className="hover:bg-navy-900/50">
                      <td className="py-2.5 px-4">
                        <EventBadge type={evt.eventType} />
                      </td>
                      <td className="py-2.5 px-3 font-mono font-bold text-slate-200">
                        {Math.round(evt.confidence * 100)}%
                      </td>
                      <td className="py-2.5 px-3 font-mono">{evt.durationSeconds}s</td>
                      <td className="py-2.5 px-3 text-slate-400">
                        {new Date(evt.timestamp).toLocaleTimeString()}
                      </td>
                      <td className="py-2.5 px-3">
                        <StatusBadge status={evt.reviewStatus} />
                      </td>
                      <td className="py-2.5 px-4 text-slate-300 italic">
                        {evt.adminNotes || '—'}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Proctor Sign-off Signature Block */}
        <div className="p-4 rounded-xl bg-navy-850/50 border border-navy-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
          <div>
            <p className="font-semibold text-slate-300">Proctor Adjudication Sign-Off</p>
            <p className="text-slate-500 text-[11px] mt-0.5">
              Verified by Academic Integrity Committee pursuant to institutional examination regulations.
            </p>
          </div>
          <div className="text-center sm:text-right">
            <span className="font-serif italic text-base text-blue-300">Dr. Arthur Vance</span>
            <p className="text-[10px] text-slate-500 uppercase tracking-widest mt-0.5">Chief Academic Proctor</p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-navy-800">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-medium bg-navy-800 hover:bg-navy-700 text-slate-300 transition-colors"
          >
            Close Report
          </button>
          <button
            onClick={handlePrint}
            className="flex items-center gap-2 px-5 py-2 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-600/30 transition-all"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print / Save as PDF</span>
          </button>
        </div>
      </div>
    </Modal>
  );
};
