import React from 'react';
import { Flag, ChevronLeft, ChevronRight, Check } from 'lucide-react';

export const QuestionCard = ({
  question,
  totalQuestions,
  currentIndex,
  selectedAnswer,
  isFlagged,
  onSelectAnswer,
  onToggleFlag,
  onPrev,
  onNext,
  onSubmitClick,
}) => {
  if (!question) return null;

  const optionLabels = ['A', 'B', 'C', 'D'];

  return (
    <div className="bg-navy-900 border border-navy-800 rounded-2xl p-6 sm:p-8 shadow-xl flex flex-col justify-between min-h-[500px]">
      {/* Top Header */}
      <div>
        <div className="flex items-center justify-between pb-4 border-b border-navy-800">
          <div className="flex items-center gap-3">
            <span className="px-3 py-1 rounded-lg bg-blue-600/20 text-blue-400 font-bold text-sm border border-blue-500/30">
              Question {currentIndex + 1} of {totalQuestions}
            </span>
            <span className="text-xs text-slate-400 font-medium">
              Worth {question.points} Points
            </span>
          </div>

          <button
            onClick={() => onToggleFlag(question.id)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              isFlagged
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-sm'
                : 'bg-navy-800 text-slate-400 hover:text-slate-200 border border-navy-700'
            }`}
          >
            <Flag className={`w-3.5 h-3.5 ${isFlagged ? 'fill-amber-400 text-amber-400' : ''}`} />
            <span>{isFlagged ? 'Marked for Review' : 'Mark for Review'}</span>
          </button>
        </div>

        {/* Question Statement */}
        <div className="py-6">
          <h2 className="text-lg sm:text-xl font-medium text-slate-100 leading-relaxed">
            {question.question}
          </h2>
        </div>

        {/* Options List */}
        <div className="space-y-3 pt-2">
          {question.options.map((option, idx) => {
            const isSelected = selectedAnswer === idx;
            return (
              <button
                key={idx}
                onClick={() => onSelectAnswer(question.id, idx)}
                className={`w-full text-left p-4 rounded-xl border transition-all duration-200 flex items-start gap-4 group ${
                  isSelected
                    ? 'bg-blue-600/15 border-blue-500 text-white shadow-md shadow-blue-500/10'
                    : 'bg-navy-850/60 hover:bg-navy-800/80 border-navy-750 text-slate-300 hover:border-slate-600'
                }`}
              >
                <div
                  className={`w-7 h-7 rounded-lg flex items-center justify-center font-bold text-xs shrink-0 transition-colors ${
                    isSelected
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'bg-navy-800 text-slate-400 group-hover:bg-navy-700 group-hover:text-slate-200 border border-navy-700'
                  }`}
                >
                  {isSelected ? <Check className="w-4 h-4" /> : optionLabels[idx]}
                </div>
                <span className="text-sm pt-0.5 leading-snug">{option}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Footer Navigation Controls */}
      <div className="pt-8 border-t border-navy-800 mt-8 flex items-center justify-between">
        <button
          onClick={onPrev}
          disabled={currentIndex === 0}
          className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium bg-navy-800 hover:bg-navy-700 disabled:opacity-40 disabled:hover:bg-navy-800 text-slate-300 transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
          <span>Previous</span>
        </button>

        <div className="flex items-center gap-3">
          {currentIndex < totalQuestions - 1 ? (
            <button
              onClick={onNext}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-600/25 transition-all"
            >
              <span>Next Question</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              onClick={onSubmitClick}
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-600/25 transition-all"
            >
              <Check className="w-4 h-4" />
              <span>Review & Submit Exam</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export const QuestionPalette = ({
  questions,
  currentIndex,
  answers,
  flaggedQuestions,
  onSelectIndex,
}) => {
  return (
    <div className="bg-navy-900 border border-navy-800 rounded-2xl p-5 shadow-xl space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-white">Question Navigator</h3>
        <span className="text-xs text-slate-400">
          {Object.keys(answers).length} / {questions.length} Answered
        </span>
      </div>

      {/* Grid of numbers */}
      <div className="grid grid-cols-5 gap-2">
        {questions.map((q, idx) => {
          const isCurrent = idx === currentIndex;
          const isAnswered = answers[q.id] !== undefined;
          const isFlagged = flaggedQuestions.has(q.id);

          return (
            <button
              key={q.id}
              onClick={() => onSelectIndex(idx)}
              className={`relative h-10 rounded-xl font-bold text-xs flex items-center justify-center transition-all ${
                isCurrent
                  ? 'ring-2 ring-blue-400 bg-blue-600 text-white'
                  : isFlagged
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                  : isAnswered
                  ? 'bg-emerald-950/80 text-emerald-300 border border-emerald-500/40'
                  : 'bg-navy-850 text-slate-400 hover:bg-navy-800 border border-navy-750'
              }`}
            >
              {idx + 1}
              {isFlagged && (
                <span className="absolute top-1 right-1 w-1.5 h-1.5 rounded-full bg-amber-400"></span>
              )}
            </button>
          );
        })}
      </div>

      {/* Legend */}
      <div className="pt-3 border-t border-navy-800 space-y-1.5 text-[11px] text-slate-400">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded bg-emerald-500/80"></span>
          <span>Answered</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded bg-amber-500/80"></span>
          <span>Marked for Review</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded bg-navy-800 border border-navy-700"></span>
          <span>Unanswered</span>
        </div>
      </div>
    </div>
  );
};
