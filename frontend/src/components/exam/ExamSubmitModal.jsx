import React from 'react';
import { Modal } from '../common/Modal';
import { CheckCircle2, AlertTriangle, Send } from 'lucide-react';

export const ExamSubmitModal = ({
  isOpen,
  onClose,
  totalQuestions,
  answeredCount,
  flaggedCount,
  onConfirmSubmit,
  isSubmitting,
}) => {
  const unansweredCount = totalQuestions - answeredCount;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Submit Examination Session"
      subtitle="Please review your completion status before finalizing"
    >
      <div className="space-y-6">
        {/* Summary grid */}
        <div className="grid grid-cols-3 gap-3">
          <div className="p-4 rounded-xl bg-navy-850 border border-navy-750 text-center">
            <span className="text-2xl font-bold text-white">{totalQuestions}</span>
            <p className="text-xs text-slate-400 mt-1">Total</p>
          </div>
          <div className="p-4 rounded-xl bg-emerald-950/40 border border-emerald-500/30 text-center">
            <span className="text-2xl font-bold text-emerald-400">{answeredCount}</span>
            <p className="text-xs text-emerald-300 mt-1">Answered</p>
          </div>
          <div className="p-4 rounded-xl bg-amber-950/40 border border-amber-500/30 text-center">
            <span className="text-2xl font-bold text-amber-400">{unansweredCount}</span>
            <p className="text-xs text-amber-300 mt-1">Unanswered</p>
          </div>
        </div>

        {/* Warning if unanswered */}
        {unansweredCount > 0 && (
          <div className="p-4 rounded-xl bg-amber-950/50 border border-amber-500/40 flex items-start gap-3 text-xs text-amber-200">
            <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold">You have {unansweredCount} unanswered questions.</p>
              <p className="text-amber-300/80 mt-1">
                Submitting now will leave these questions without scored answers. You cannot change answers after submission.
              </p>
            </div>
          </div>
        )}

        {unansweredCount === 0 && (
          <div className="p-4 rounded-xl bg-emerald-950/40 border border-emerald-500/30 flex items-center gap-3 text-xs text-emerald-300">
            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
            <span>All {totalQuestions} questions have been answered. You are ready to submit!</span>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-navy-800">
          <button
            onClick={onClose}
            disabled={isSubmitting}
            className="px-4 py-2 rounded-xl text-sm font-medium bg-navy-800 hover:bg-navy-700 text-slate-300 transition-colors"
          >
            Return to Questions
          </button>
          <button
            onClick={onConfirmSubmit}
            disabled={isSubmitting}
            className="flex items-center gap-2 px-6 py-2 rounded-xl text-sm font-bold bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-600/30 transition-all disabled:opacity-50"
          >
            <Send className="w-4 h-4" />
            <span>{isSubmitting ? 'Finalizing Submission...' : 'Confirm Final Submission'}</span>
          </button>
        </div>
      </div>
    </Modal>
  );
};
