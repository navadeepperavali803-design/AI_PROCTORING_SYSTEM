import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useExam } from '../../context/ExamContext';
import { CheckCircle2, ShieldCheck, Clock, FileText, ArrowLeft } from 'lucide-react';

export const ExamResult = () => {
  const navigate = useNavigate();
  const { activeExam, activeSession, answers, currentIntegrity } = useExam();

  const answeredCount = Object.keys(answers || {}).length;
  const totalQuestions = activeExam?.questions?.length || 10;

  return (
    <div className="max-w-2xl mx-auto py-12 space-y-8 text-center">
      {/* Success Badge */}
      <div className="relative w-20 h-20 rounded-full bg-emerald-500/10 border-2 border-emerald-500/30 flex items-center justify-center mx-auto shadow-2xl shadow-emerald-500/20">
        <CheckCircle2 className="w-10 h-10 text-emerald-400" />
      </div>

      <div className="space-y-2">
        <span className="text-xs font-bold uppercase tracking-widest text-emerald-400">
          Submission Successful
        </span>
        <h1 className="text-3xl font-extrabold text-white tracking-tight">
          Examination Submitted
        </h1>
        <p className="text-sm text-slate-400 max-w-md mx-auto">
          Your answers and proctoring telemetry log have been securely transmitted to the examination board.
        </p>
      </div>

      {/* Summary Card */}
      <div className="bg-navy-900 border border-navy-800 rounded-2xl p-6 shadow-xl text-left space-y-4">
        <div className="pb-4 border-b border-navy-800 flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-white">{activeExam?.title || 'Computer Vision & Deep Learning'}</h3>
            <p className="text-xs text-slate-400">Ref: {activeSession?.id || `ses-${Date.now()}`}</p>
          </div>
          <span className="text-xs font-mono px-2.5 py-1 rounded-full bg-emerald-950/80 text-emerald-300 border border-emerald-500/30 font-bold">
            Submitted
          </span>
        </div>

        <div className="grid grid-cols-3 gap-3 text-center">
          <div className="p-3 rounded-xl bg-navy-850 border border-navy-750">
            <span className="text-xs text-slate-400">Questions Answered</span>
            <p className="text-lg font-bold text-white mt-1">
              {answeredCount} / {totalQuestions}
            </p>
          </div>

          <div className="p-3 rounded-xl bg-navy-850 border border-navy-750">
            <span className="text-xs text-slate-400">Provisional Integrity</span>
            <p className="text-lg font-mono font-bold text-blue-400 mt-1">
              {currentIntegrity}%
            </p>
          </div>

          <div className="p-3 rounded-xl bg-navy-850 border border-navy-750">
            <span className="text-xs text-slate-400">Audit Status</span>
            <p className="text-xs font-semibold text-amber-400 mt-2">
              Human Review Queued
            </p>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-navy-950/70 border border-navy-800 text-xs text-slate-400 space-y-1">
          <div className="flex items-center gap-2 text-slate-200 font-semibold">
            <ShieldCheck className="w-4 h-4 text-blue-400" />
            <span>Ethical Integrity Guarantee</span>
          </div>
          <p className="text-[11px] leading-relaxed">
            Per policy, your session record will be reviewed by an authorized human proctor. Any potential infractions are subject to contextual evaluation before marks are officially certified.
          </p>
        </div>
      </div>

      <button
        onClick={() => navigate('/student')}
        className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-bold bg-navy-800 hover:bg-navy-700 text-slate-200 border border-navy-700 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Return to Student Portal</span>
      </button>
    </div>
  );
};
