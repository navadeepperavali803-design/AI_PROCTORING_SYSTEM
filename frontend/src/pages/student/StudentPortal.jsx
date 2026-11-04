import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';
import { BookOpen, Clock, Award, ShieldCheck, CheckCircle2, ChevronRight, AlertCircle, Video } from 'lucide-react';
import { Badge, StatusBadge } from '../../components/common/Badge';

export const StudentPortal = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [exams, setExams] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const data = await api.getExams();
      setExams(data);
      setLoading(false);
    };
    load();
  }, []);

  return (
    <div className="space-y-8">
      {/* Welcome Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-blue-900/40 via-navy-900 to-indigo-950/40 border border-blue-500/20 p-8 shadow-2xl">
        <div className="relative z-10 max-w-2xl space-y-3">
          <div className="flex items-center gap-2">
            <span className="text-xs uppercase font-bold tracking-wider px-2.5 py-1 rounded-full bg-blue-500/20 text-blue-400 border border-blue-500/30">
              Candidate Workspace
            </span>
            <span className="text-xs text-slate-400">ID: {user?.studentId || 'STD-2024-8921'}</span>
          </div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">
            Welcome back, {user?.name || 'Sarah Chen'}
          </h1>
          <p className="text-sm text-slate-300 leading-relaxed">
            All active examinations are protected by ProctorAI. Your webcam stream is analyzed for head pose and presence using client/edge computer vision, with zero continuous video storage.
          </p>
        </div>
      </div>

      {/* Main Grid: Available Exams & System Checklist */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left 2 Cols: Active & Upcoming Exams */}
        <div className="lg:col-span-2 space-y-5">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-white tracking-tight">Active & Scheduled Exams</h2>
              <p className="text-xs text-slate-400">Select an assessment to initiate the hardware readiness check</p>
            </div>
            <span className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-navy-800 text-blue-400 border border-navy-750">
              {exams.length} Available
            </span>
          </div>

          <div className="space-y-4">
            {exams.map((exam) => (
              <div
                key={exam.id}
                className="bg-navy-900 border border-navy-800 hover:border-blue-500/40 rounded-2xl p-6 transition-all duration-300 hover:shadow-xl hover:shadow-blue-500/5 group"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold font-mono px-2 py-0.5 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20">
                        {exam.code}
                      </span>
                      <span className="text-xs text-slate-400">{exam.course}</span>
                    </div>
                    <h3 className="text-base font-bold text-white group-hover:text-blue-400 transition-colors">
                      {exam.title}
                    </h3>
                    <p className="text-xs text-slate-400 line-clamp-2 max-w-xl">
                      {exam.description}
                    </p>
                  </div>

                  <div className="flex sm:flex-col items-center sm:items-end justify-between gap-3 shrink-0 pt-2 sm:pt-0 border-t sm:border-0 border-navy-800">
                    <div className="flex items-center gap-3 text-xs text-slate-300">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-blue-400" />
                        {exam.durationMinutes} min
                      </span>
                      <span className="flex items-center gap-1">
                        <Award className="w-3.5 h-3.5 text-emerald-400" />
                        {exam.totalMarks} marks
                      </span>
                    </div>

                    <button
                      onClick={() => navigate(`/student/instructions/${exam.id}`)}
                      className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-600/25 transition-all group-hover:translate-x-0.5"
                    >
                      <span>Begin Verification</span>
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Col: System Readiness Checklist */}
        <div className="space-y-6">
          <div className="bg-navy-900 border border-navy-800 rounded-2xl p-6 shadow-xl space-y-4">
            <h3 className="text-sm font-bold text-white tracking-tight flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Proctoring Readiness Check</span>
            </h3>

            <div className="space-y-3 text-xs">
              <div className="flex items-start gap-3 p-3 rounded-xl bg-navy-850/80 border border-navy-800">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-slate-200">Integrated / USB Webcam</p>
                  <p className="text-[11px] text-slate-400 mt-0.5">Required for continuous face tracking.</p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 rounded-xl bg-navy-850/80 border border-navy-800">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-slate-200">Chrome / Edge / Safari</p>
                  <p className="text-[11px] text-slate-400 mt-0.5">Modern WebRTC and canvas acceleration enabled.</p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 rounded-xl bg-navy-850/80 border border-navy-800">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-slate-200">Well-Lit Room</p>
                  <p className="text-[11px] text-slate-400 mt-0.5">Avoid harsh backlighting behind your head.</p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 rounded-xl bg-navy-850/80 border border-navy-800">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-slate-200">Workspace Clear</p>
                  <p className="text-[11px] text-slate-400 mt-0.5">No secondary screens, phones, or books in view.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
