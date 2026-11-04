import React, { useState } from 'react';
import { Modal } from '../common/Modal';
import { EventBadge, StatusBadge } from '../common/Badge';
import { REVIEW_STATUS } from '../../types';
import { CheckCircle2, XCircle, AlertTriangle, Clock, ShieldCheck, FileText, Send } from 'lucide-react';

export const IncidentDetailModal = ({ isOpen, onClose, event, onUpdateStatus }) => {
  if (!event) return null;

  const [notes, setNotes] = useState(event.adminNotes || '');
  const [isSaving, setIsSaving] = useState(false);

  const handleStatusChange = async (newStatus) => {
    setIsSaving(true);
    try {
      await onUpdateStatus(event.id, newStatus, notes);
      onClose();
    } finally {
      setIsSaving(false);
    }
  };

  const confidencePct = Math.round(event.confidence * 100);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Incident Evidence Audit"
      subtitle={`Session ID: ${event.sessionId} • Event Ref: ${event.id}`}
      maxWidth="max-w-3xl"
    >
      <div className="space-y-6">
        {/* Top Meta Header */}
        <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-xl bg-navy-850 border border-navy-750">
          <div className="flex items-center gap-3">
            <img
              src={event.studentAvatar}
              alt={event.studentName}
              className="w-10 h-10 rounded-full border border-navy-700 object-cover"
            />
            <div>
              <h4 className="text-sm font-bold text-white">{event.studentName}</h4>
              <p className="text-xs text-slate-400">{event.examTitle}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <EventBadge type={event.eventType} />
            <StatusBadge status={event.reviewStatus} />
          </div>
        </div>

        {/* Evidence Snapshot Frame */}
        <div className="relative aspect-video rounded-xl overflow-hidden bg-navy-950 border border-navy-750">
          <img
            src={event.snapshotUrl}
            alt="Incident Evidence Snapshot"
            className="w-full h-full object-cover"
          />

          {/* Detector overlay bounding box simulation */}
          <div className="absolute inset-0 pointer-events-none p-4">
            <div className="border-2 border-rose-500 bg-rose-500/10 rounded-lg h-3/4 w-1/2 mx-auto mt-6 relative">
              <span className="absolute -top-3 left-2 px-1.5 py-0.5 rounded bg-rose-600 text-white font-mono text-[10px] font-bold">
                {event.eventType}: {confidencePct}%
              </span>
            </div>
          </div>

          {/* Timestamp overlay */}
          <div className="absolute bottom-3 left-3 px-2.5 py-1 rounded-md bg-navy-950/85 backdrop-blur-md text-xs font-mono text-slate-200 border border-navy-700">
            Recorded: {new Date(event.timestamp).toLocaleString()} ({event.durationSeconds}s duration)
          </div>
        </div>

        {/* Technical Detection Metrics */}
        <div className="grid grid-cols-3 gap-3 text-xs">
          <div className="p-3 rounded-xl bg-navy-850 border border-navy-750">
            <span className="text-slate-400">Detector Pipeline</span>
            <p className="font-semibold text-white mt-0.5">MediaPipe + YOLOv8n</p>
          </div>
          <div className="p-3 rounded-xl bg-navy-850 border border-navy-750">
            <span className="text-slate-400">Confidence Score</span>
            <p className="font-mono font-bold text-rose-400 mt-0.5">{confidencePct}% Verified</p>
          </div>
          <div className="p-3 rounded-xl bg-navy-850 border border-navy-750">
            <span className="text-slate-400">Hysteresis Persistence</span>
            <p className="font-mono font-bold text-white mt-0.5">{event.durationSeconds}s Continuous</p>
          </div>
        </div>

        {/* Admin Review Notes Input */}
        <div className="space-y-2">
          <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
            <FileText className="w-3.5 h-3.5 text-blue-400" />
            <span>Academic Proctor Audit Notes</span>
          </label>
          <textarea
            rows={3}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Document rationale, physical context observations, or decision details..."
            className="w-full bg-navy-950 border border-navy-750 rounded-xl p-3 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-blue-500 transition-colors"
          />
        </div>

        {/* Action Controls */}
        <div className="pt-4 border-t border-navy-800 flex flex-wrap items-center justify-between gap-3">
          <span className="text-[11px] text-slate-400">
            * All decisions are immutably logged with proctor credentials for academic review.
          </span>

          <div className="flex items-center gap-2">
            <button
              onClick={() => handleStatusChange(REVIEW_STATUS.CLEARED)}
              disabled={isSaving}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-emerald-950/80 hover:bg-emerald-900 text-emerald-300 border border-emerald-500/40 transition-all"
            >
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>Clear as False Alarm</span>
            </button>

            <button
              onClick={() => handleStatusChange(REVIEW_STATUS.CONFIRMED)}
              disabled={isSaving}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-rose-950/80 hover:bg-rose-900 text-rose-300 border border-rose-500/40 transition-all"
            >
              <XCircle className="w-4 h-4 text-rose-400" />
              <span>Confirm Misconduct</span>
            </button>
          </div>
        </div>
      </div>
    </Modal>
  );
};
