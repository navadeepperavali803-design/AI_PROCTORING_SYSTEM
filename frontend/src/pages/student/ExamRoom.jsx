import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useExam } from '../../context/ExamContext';
import { WebcamMonitor } from '../../components/exam/WebcamMonitor';
import { ExamTimer } from '../../components/exam/ExamTimer';
import { QuestionCard, QuestionPalette } from '../../components/exam/QuestionCard';
import { PrivacyBanner } from '../../components/exam/PrivacyBanner';
import { ExamSubmitModal } from '../../components/exam/ExamSubmitModal';
import { Shield, AlertCircle, CheckCircle2, Send } from 'lucide-react';

export const ExamRoom = () => {
  const navigate = useNavigate();
  const {
    activeExam,
    activeSession,
    currentQuestionIndex,
    setCurrentQuestionIndex,
    answers,
    flaggedQuestions,
    selectAnswer,
    toggleFlagQuestion,
    timeRemaining,
    isSubmitting,
    submitExam,
    currentIntegrity,
    recentWarning,
  } = useExam();

  const [isSubmitModalOpen, setIsSubmitModalOpen] = useState(false);

  // If user lands directly on exam without starting, fallback to demo exam questions
  const questions = activeExam?.questions || [];
  const currentQuestion = questions[currentQuestionIndex] || questions[0];

  const handleNext = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
  };

  const handlePrev = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  const handleFinalSubmit = async () => {
    await submitExam();
    setIsSubmitModalOpen(false);
    navigate('/student/result');
  };

  if (!currentQuestion) {
    return (
      <div className="text-center py-24 space-y-4">
        <AlertCircle className="w-12 h-12 text-amber-400 mx-auto" />
        <h2 className="text-xl font-bold text-white">No Active Examination Initialized</h2>
        <p className="text-sm text-slate-400">Please select an exam from your student portal.</p>
        <button
          onClick={() => navigate('/student')}
          className="px-6 py-2.5 rounded-xl bg-blue-600 text-white font-semibold text-xs"
        >
          Return to Portal
        </button>
      </div>
    );
  }

  const answeredCount = Object.keys(answers).length;

  return (
    <div className="space-y-6">
      {/* Real-time Telemetry Warning Banner (if triggered) */}
      {recentWarning && (
        <div className="bg-amber-950/90 border border-amber-500/60 rounded-2xl p-4 flex items-center justify-between shadow-xl animate-pulse">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-amber-500/20 text-amber-400">
              <AlertCircle className="w-5 h-5" />
            </div>
            <div>
              <p className="text-sm font-bold text-amber-200">Proctoring Telemetry Alert</p>
              <p className="text-xs text-amber-300/80">{recentWarning.message}</p>
            </div>
          </div>
          <span className="text-xs font-mono font-bold px-2.5 py-1 rounded-lg bg-amber-900/60 text-amber-300 border border-amber-500/40">
            {recentWarning.type}
          </span>
        </div>
      )}

      {/* Top Exam Action Bar */}
      <div className="bg-navy-900 border border-navy-800 rounded-2xl p-4 sm:p-5 shadow-xl flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-600/10 border border-blue-500/30 flex items-center justify-center text-blue-400">
            <Shield className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-base font-bold text-white">{activeExam?.title}</h1>
            <p className="text-xs text-slate-400">
              {answeredCount} of {questions.length} Questions Answered
            </p>
          </div>
        </div>

        {/* Center: Countdown Timer */}
        <ExamTimer
          secondsRemaining={timeRemaining}
          totalSeconds={(activeExam?.durationMinutes || 45) * 60}
        />

        {/* Right: Submit Button */}
        <button
          onClick={() => setIsSubmitModalOpen(true)}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-600/25 transition-all cursor-pointer"
        >
          <Send className="w-3.5 h-3.5" />
          <span>Submit Exam</span>
        </button>
      </div>

      {/* Main Examination Grid: Question on Left, Camera & Palette on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Left 2 Cols: Question Card */}
        <div className="lg:col-span-2 space-y-4">
          <QuestionCard
            question={currentQuestion}
            totalQuestions={questions.length}
            currentIndex={currentQuestionIndex}
            selectedAnswer={answers[currentQuestion.id]}
            isFlagged={flaggedQuestions.has(currentQuestion.id)}
            onSelectAnswer={selectAnswer}
            onToggleFlag={toggleFlagQuestion}
            onPrev={handlePrev}
            onNext={handleNext}
            onSubmitClick={() => setIsSubmitModalOpen(true)}
          />

          <PrivacyBanner />
        </div>

        {/* Right 1 Col: Live Webcam Monitor & Question Palette */}
        <div className="space-y-6">
          {/* Live Webcam & Pose Overlay Monitor */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs text-slate-400 px-1">
              <span className="font-semibold text-slate-300">Live AI Proctor Feed</span>
              <span className="flex items-center gap-1 text-emerald-400">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                Active
              </span>
            </div>
            <WebcamMonitor isCompact={false} />
          </div>

          {/* Question Palette Navigator */}
          <QuestionPalette
            questions={questions}
            currentIndex={currentQuestionIndex}
            answers={answers}
            flaggedQuestions={flaggedQuestions}
            onSelectIndex={(idx) => setCurrentQuestionIndex(idx)}
          />
        </div>
      </div>

      {/* Confirmation Submit Modal */}
      <ExamSubmitModal
        isOpen={isSubmitModalOpen}
        onClose={() => setIsSubmitModalOpen(false)}
        totalQuestions={questions.length}
        answeredCount={answeredCount}
        flaggedCount={flaggedQuestions.size}
        onConfirmSubmit={handleFinalSubmit}
        isSubmitting={isSubmitting}
      />
    </div>
  );
};
