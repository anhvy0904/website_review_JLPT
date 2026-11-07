"use client";

import React, { useEffect, useCallback } from "react";
import { ExamQuestion } from "@/lib/types";
import { Flag, Star, Check, ArrowRight, ArrowLeft, CheckCircle2 } from "lucide-react";
import { AnswerExplanation } from "./AnswerExplanation";

interface QuestionCardProps {
  question: ExamQuestion;
  questionIndex: number;
  totalQuestions: number;
  selectedOptionId?: string;
  isFlagged: boolean;
  isChecked?: boolean; // Practice mode
  mode: "practice" | "exam";
  examId?: string;
  examTitle?: string;
  onSelectOption: (optionId: string) => void;
  onToggleFlag: () => void;
  onCheckAnswer?: () => void; // Practice mode
  onNext: () => void;
  onPrev: () => void;
  onSubmitExam?: () => void; // Exam mode
  className?: string;
}

const sectionLabels: Record<string, { label: string; color: string }> = {
  vocabulary: { label: "Từ vựng / Chữ Hán", color: "bg-blue-50 text-blue-700 border-blue-200" },
  grammar: { label: "Ngữ pháp", color: "bg-purple-50 text-purple-700 border-purple-200" },
  reading: { label: "Đọc hiểu", color: "bg-emerald-50 text-emerald-700 border-emerald-200" },
};

const subtypeLabels: Record<string, string> = {
  kanji_reading: "Cách đọc Kanji",
  kanji_writing: "Cách viết Kanji",
  contextual_use: "Điền từ ngữ cảnh",
  paraphrase: "Từ đồng nghĩa",
  usage: "Cách dùng từ",
  sentence_grammar: "Ngữ pháp câu",
  sentence_composition: "Ghép câu dấu sao (★)",
  text_grammar: "Ngữ pháp đoạn văn",
  reading_short: "Đọc hiểu đoạn ngắn",
  reading_medium: "Đọc hiểu trung văn",
  reading_long: "Đọc hiểu trường văn",
  info_retrieval: "Tìm kiếm thông tin",
};

export function QuestionCard({
  question,
  questionIndex,
  totalQuestions,
  selectedOptionId,
  isFlagged,
  isChecked = false,
  mode,
  examId,
  examTitle,
  onSelectOption,
  onToggleFlag,
  onCheckAnswer,
  onNext,
  onPrev,
  onSubmitExam,
  className = "",
}: QuestionCardProps) {
  // Format question text with underlined text `__...__`
  const renderQuestionText = (text: string) => {
    const parts = text.split(/(__.*?__)/g);
    return parts.map((part, i) => {
      if (part.startsWith("__") && part.endsWith("__")) {
        const inner = part.slice(2, -2);
        return (
          <span
            key={i}
            className="underline decoration-indigo-600 decoration-[2.5px] underline-offset-4 font-bold text-indigo-950 px-1 bg-indigo-50/50 rounded"
          >
            {inner}
          </span>
        );
      }
      return <span key={i}>{part}</span>;
    });
  };

  // Keyboard shortcut handler
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      // Don't trigger if user is typing in an input or textarea
      if (
        document.activeElement?.tagName === "INPUT" ||
        document.activeElement?.tagName === "TEXTAREA"
      ) {
        return;
      }

      // Keys 1, 2, 3, 4, 5
      if (["1", "2", "3", "4", "5"].includes(e.key)) {
        if (mode === "practice" && isChecked) return; // locked
        const matched = question.options.find((o) => o.id === e.key);
        if (matched) {
          e.preventDefault();
          onSelectOption(e.key);
        }
      }

      // Key F to flag
      if (e.key === "f" || e.key === "F") {
        e.preventDefault();
        onToggleFlag();
      }

      // Enter key
      if (e.key === "Enter") {
        e.preventDefault();
        onNext();
      }

      // Arrow keys
      if (e.key === "ArrowLeft") {
        e.preventDefault();
        onPrev();
      }
      if (e.key === "ArrowRight") {
        e.preventDefault();
        onNext();
      }
    },
    [
      mode,
      isChecked,
      question.options,
      onSelectOption,
      onToggleFlag,
      selectedOptionId,
      onNext,
      onPrev,
    ]
  );

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  const secInfo = sectionLabels[question.section] || {
    label: question.section,
    color: "bg-slate-100 text-slate-700 border-slate-200",
  };
  const subtypeLabel = subtypeLabels[question.subtype] || question.subtype;
  const isLastQuestion = questionIndex === totalQuestions - 1;

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Main Question Card */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-sm">
        {/* Meta Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 pb-5 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-900 text-lg">
              Câu {questionIndex + 1}
              <span className="text-slate-400 font-normal text-sm"> / {totalQuestions}</span>
            </span>

            <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full border ${secInfo.color}`}>
              {secInfo.label}
            </span>

            <span className="text-xs font-medium px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 hidden sm:inline-block">
              {subtypeLabel}
            </span>
          </div>

          <div className="flex items-center gap-3">
            {/* Difficulty stars */}
            <div className="flex items-center gap-0.5 text-amber-400" title={`Độ khó: ${question.difficulty}/5`}>
              {Array.from({ length: 5 }).map((_, i) => (
                <Star
                  key={i}
                  className={`w-3.5 h-3.5 ${
                    i < question.difficulty ? "fill-amber-400 text-amber-400" : "text-slate-200 fill-slate-100"
                  }`}
                />
              ))}
            </div>

            {/* Flag button */}
            <button
              onClick={onToggleFlag}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
                isFlagged
                  ? "bg-amber-50 text-amber-800 border-amber-300"
                  : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"
              }`}
              title="Phím tắt: F"
            >
              <Flag className={`w-3.5 h-3.5 ${isFlagged ? "fill-amber-500 text-amber-500" : "text-slate-400"}`} />
              <span>{isFlagged ? "Đã ghim" : "Ghim câu"}</span>
            </button>
          </div>
        </div>

        {/* Question Text */}
        <div className="py-6">
          <p className="font-japanese text-slate-900 text-[20px] sm:text-[22px] font-normal leading-[1.8] tracking-wide">
            {renderQuestionText(question.questionText)}
          </p>
        </div>

        {/* Options List */}
        <div className="space-y-3">
          {question.options.map((opt) => {
            const isSelected = selectedOptionId === opt.id;
            const isLocked = mode === "practice" && isChecked;

            let optionStyle = "border-slate-200 hover:border-indigo-300 hover:bg-indigo-50/30 text-slate-800";
            let badgeStyle = "bg-slate-100 text-slate-700 border-slate-300";

            if (isSelected) {
              optionStyle = "border-indigo-600 bg-indigo-50/60 text-indigo-950 ring-1 ring-indigo-600";
              badgeStyle = "bg-indigo-600 text-white border-indigo-600";
            }

            // In Practice Mode after checking:
            if (isLocked) {
              const isCorrectOption = opt.id === question.correctOptionId;
              if (isCorrectOption) {
                optionStyle = "border-emerald-500 bg-emerald-50 text-emerald-950 font-medium ring-1 ring-emerald-500";
                badgeStyle = "bg-emerald-600 text-white border-emerald-600";
              } else if (isSelected && !isCorrectOption) {
                optionStyle = "border-rose-400 bg-rose-50 text-rose-950 ring-1 ring-rose-400";
                badgeStyle = "bg-rose-500 text-white border-rose-500";
              } else {
                optionStyle = "border-slate-200 opacity-60 bg-white text-slate-500";
                badgeStyle = "bg-slate-100 text-slate-400 border-slate-200";
              }
            }

            return (
              <button
                key={opt.id}
                type="button"
                disabled={isLocked}
                onClick={() => onSelectOption(opt.id)}
                className={`w-full flex items-center justify-between p-4 rounded-xl border text-left transition-all ${optionStyle} ${
                  isLocked ? "cursor-default" : "cursor-pointer"
                }`}
              >
                <div className="flex items-center gap-3.5">
                  <span
                    className={`inline-flex items-center justify-center w-7 h-7 rounded-lg text-xs font-bold border shrink-0 transition-colors ${badgeStyle}`}
                  >
                    {opt.id}
                  </span>
                  <span className="font-japanese text-[17px] tracking-wide font-normal">
                    {opt.text}
                  </span>
                </div>

                {isSelected && !isLocked && (
                  <Check className="w-5 h-5 text-indigo-600 shrink-0" />
                )}
              </button>
            );
          })}
        </div>

        {/* Bottom Actions Bar */}
        <div className="mt-8 pt-5 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3">
          <button
            onClick={onPrev}
            disabled={questionIndex === 0}
            className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-slate-200 text-slate-700 text-sm font-medium hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Câu trước</span>
          </button>

          <div className="flex items-center gap-2">
            {/* Next Button or Submit Button */}
            {mode === "exam" && isLastQuestion ? (
              <button
                onClick={onSubmitExam}
                className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-emerald-600 text-white text-sm font-bold shadow-md hover:bg-emerald-700 active:scale-95 transition-all cursor-pointer"
              >
                <span>Nộp bài thi</span>
                <CheckCircle2 className="w-4 h-4" />
              </button>
            ) : (
              <button
                onClick={onNext}
                className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-slate-900 text-white text-sm font-semibold hover:bg-slate-800 active:scale-95 transition-all cursor-pointer"
              >
                <span>{isLastQuestion ? (mode === "practice" ? "Xem kết quả & nộp bài" : "Hoàn thành") : "Câu tiếp theo"}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Practice Mode: Show Answer Explanation after checking */}
      {mode === "practice" && isChecked && (
        <AnswerExplanation
          question={question}
          selectedOptionId={selectedOptionId}
          examId={examId}
          examTitle={examTitle}
        />
      )}
    </div>
  );
}

