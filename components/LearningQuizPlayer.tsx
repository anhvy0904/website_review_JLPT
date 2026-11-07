"use client";

import React, { useState } from "react";
import {
  CheckCircle2,
  XCircle,
  HelpCircle,
  Star,
  RotateCcw,
  ChevronRight,
  Sparkles,
  Award,
} from "lucide-react";
import {
  recordQuizAttempt,
  toggleWrongQuizSaved,
  getLearningProgress,
} from "@/lib/learningStorage";

export interface LearningQuizItem {
  id: string;
  formId?: string;
  topicId?: string;
  promptJa: string;
  promptVi: string;
  options: Array<{ id: string; text: string }>;
  correctOptionId: string;
  explanationVi: string;
  distractorReasonsVi?: Record<string, string>;
}

interface Props {
  module: "verb-forms" | "keigo";
  quizzes: LearningQuizItem[];
  title?: string;
  onFinish?: () => void;
  className?: string;
}

export function LearningQuizPlayer({
  module,
  quizzes,
  title = "Bài Luyện Tập Tương Tác",
  onFinish,
  className = "",
}: Props) {
  const [currentIdx, setCurrentIdx] = useState(0);
  const [selectedOptionId, setSelectedOptionId] = useState<string | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [score, setScore] = useState(0);
  const [isFinished, setIsFinished] = useState(false);
  const [isSaved, setIsSaved] = useState(false);

  const currentQ = quizzes[currentIdx] || null;

  if (!currentQ || quizzes.length === 0) {
    return (
      <div className="bg-white p-8 rounded-3xl border border-slate-200 text-center text-slate-500 text-xs">
        Chưa có câu hỏi luyện tập cho chủ đề này.
      </div>
    );
  }

  const handleSelectOption = (optionId: string) => {
    if (isAnswered) return;

    setSelectedOptionId(optionId);
    setIsAnswered(true);

    const isCorrect = String(optionId) === String(currentQ.correctOptionId);
    if (isCorrect) {
      setScore((prev) => prev + 1);
    }

    recordQuizAttempt({
      quizId: currentQ.id,
      module,
      formId: currentQ.formId,
      topicId: currentQ.topicId,
      selectedOptionId: optionId,
      isCorrect,
      timestamp: new Date().toISOString(),
    });

    const progress = getLearningProgress();
    setIsSaved(progress.savedWrongQuizIds.includes(currentQ.id));
  };

  const handleToggleSave = () => {
    const saved = toggleWrongQuizSaved(currentQ.id);
    setIsSaved(saved);
  };

  const handleNext = () => {
    if (currentIdx + 1 < quizzes.length) {
      setCurrentIdx((prev) => prev + 1);
      setSelectedOptionId(null);
      setIsAnswered(false);
      setIsSaved(false);
    } else {
      setIsFinished(true);
      if (onFinish) onFinish();
    }
  };

  const handleRestart = () => {
    setCurrentIdx(0);
    setSelectedOptionId(null);
    setIsAnswered(false);
    setScore(0);
    setIsFinished(false);
    setIsSaved(false);
  };

  // Result Summary Screen
  if (isFinished) {
    const percent = Math.round((score / quizzes.length) * 100);

    return (
      <div className={`bg-white rounded-3xl border border-slate-200/90 p-8 text-center space-y-6 ${className}`}>
        <div className="w-16 h-16 rounded-3xl bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto shadow-sm">
          <Award className="w-8 h-8" />
        </div>

        <div className="space-y-2">
          <h3 className="text-2xl font-extrabold text-slate-900">
            Hoàn Thành Bài Luyện Tập!
          </h3>
          <p className="text-xs text-slate-500">
            Bạn đã hoàn thành toàn bộ {quizzes.length} câu hỏi thực hành.
          </p>
        </div>

        <div className="max-w-xs mx-auto p-5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2">
          <div className="text-3xl font-extrabold text-indigo-600">
            {score} / {quizzes.length}
          </div>
          <span className="text-xs font-semibold text-slate-600 block">
            Độ chính xác: <b>{percent}%</b>
          </span>
          <div className="w-full h-2 rounded-full bg-slate-200 overflow-hidden mt-2">
            <div
              className={`h-full rounded-full transition-all ${
                percent >= 80 ? "bg-emerald-500" : percent >= 50 ? "bg-amber-500" : "bg-rose-500"
              }`}
              style={{ width: `${percent}%` }}
            />
          </div>
        </div>

        <div className="flex items-center justify-center gap-3 pt-2">
          <button
            type="button"
            onClick={handleRestart}
            className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-md shadow-indigo-100 flex items-center gap-2 active:scale-95 transition-all"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Luyện tập lại</span>
          </button>
        </div>
      </div>
    );
  }

  const isCurrentCorrect = selectedOptionId === currentQ.correctOptionId;

  return (
    <div className={`bg-white rounded-3xl border border-slate-200/90 shadow-sm p-6 sm:p-8 space-y-6 ${className}`}>
      {/* Top Header */}
      <div className="flex items-center justify-between pb-4 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-indigo-600" />
          <h3 className="text-sm font-bold text-slate-900">{title}</h3>
        </div>

        <div className="flex items-center gap-2 text-xs font-semibold text-slate-500">
          <span>
            Câu <b>{currentIdx + 1}</b> / {quizzes.length}
          </span>
          <button
            type="button"
            onClick={handleToggleSave}
            className={`p-1.5 rounded-lg border transition-all ${
              isSaved
                ? "bg-amber-50 border-amber-300 text-amber-600"
                : "border-slate-200 text-slate-400 hover:text-slate-600"
            }`}
            title="Lưu vào sổ tay câu cần ôn lại"
          >
            <Star className={`w-3.5 h-3.5 ${isSaved ? "fill-amber-400" : ""}`} />
          </button>
        </div>
      </div>

      {/* Question Prompt */}
      <div className="space-y-2">
        <div className="text-lg sm:text-xl font-bold text-slate-900 font-japanese leading-relaxed">
          {currentQ.promptJa}
        </div>
        <p className="text-xs sm:text-sm text-slate-600 leading-normal">
          Dịch nghĩa: <i>{currentQ.promptVi}</i>
        </p>
      </div>

      {/* 4 Multiple Choice Options */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {currentQ.options.map((opt) => {
          const isSelected = selectedOptionId === opt.id;
          const isCorrectChoice = opt.id === currentQ.correctOptionId;

          let btnClass = "bg-white border-slate-200 text-slate-800 hover:border-indigo-300 hover:bg-indigo-50/20";

          if (isAnswered) {
            if (isCorrectChoice) {
              btnClass = "bg-emerald-50 border-emerald-400 text-emerald-900 font-bold shadow-sm";
            } else if (isSelected) {
              btnClass = "bg-rose-50 border-rose-300 text-rose-900";
            } else {
              btnClass = "bg-slate-50 border-slate-200 text-slate-400 opacity-60";
            }
          }

          return (
            <button
              key={opt.id}
              type="button"
              disabled={isAnswered}
              onClick={() => handleSelectOption(opt.id)}
              className={`p-4 rounded-2xl border text-left transition-all flex items-center justify-between gap-3 text-xs sm:text-sm ${btnClass}`}
            >
              <div className="flex items-center gap-3">
                <span className="w-6 h-6 rounded-xl bg-slate-100 text-slate-600 flex items-center justify-center font-bold text-xs shrink-0">
                  {opt.id}
                </span>
                <span className="font-japanese font-semibold">{opt.text}</span>
              </div>

              {isAnswered && (
                <div>
                  {isCorrectChoice && <CheckCircle2 className="w-4 h-4 text-emerald-600" />}
                  {isSelected && !isCorrectChoice && <XCircle className="w-4 h-4 text-rose-600" />}
                </div>
              )}
            </button>
          );
        })}
      </div>

      {/* Explanation Card (shows after answer) */}
      {isAnswered && (
        <div
          className={`p-5 rounded-2xl border text-xs space-y-3.5 transition-all animate-fadeIn ${
            isCurrentCorrect
              ? "bg-emerald-50/60 border-emerald-200 text-emerald-950"
              : "bg-rose-50/60 border-rose-200 text-rose-950"
          }`}
        >
          <div className="flex items-center gap-2 font-bold text-sm">
            {isCurrentCorrect ? (
              <>
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span className="text-emerald-700">Chính xác!</span>
              </>
            ) : (
              <>
                <XCircle className="w-4 h-4 text-rose-600" />
                <span className="text-rose-700">Chưa chính xác!</span>
              </>
            )}
          </div>

          <div className="space-y-1">
            <span className="font-bold text-slate-900 block">Giải thích chi tiết:</span>
            <p className="leading-relaxed text-slate-700">{currentQ.explanationVi}</p>
          </div>

          {/* Distractor Reasons for all options */}
          {currentQ.distractorReasonsVi && (
            <div className="space-y-1.5 pt-2 border-t border-slate-200/60 text-[11px]">
              <span className="font-bold text-slate-800 block">Phân tích từng lựa chọn:</span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {Object.entries(currentQ.distractorReasonsVi).map(([optId, reason]) => (
                  <div key={optId} className="p-2 rounded-xl bg-white/80 border border-slate-200/60">
                    <b className="text-slate-900">[{optId}]:</b> {reason}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Next Button */}
          <div className="pt-2 flex justify-end">
            <button
              type="button"
              onClick={handleNext}
              className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md shadow-indigo-100 flex items-center gap-1.5 transition-all"
            >
              <span>{currentIdx + 1 < quizzes.length ? "Câu tiếp theo" : "Xem kết quả"}</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
