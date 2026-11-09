"use client";

import React, { useEffect, useCallback } from "react";
import { ExamQuestion } from "@/lib/types";
import { Flag, Star, Check, ArrowRight, ArrowLeft, CheckCircle2 } from "lucide-react";
import { AnswerExplanation } from "./AnswerExplanation";
import { FormattedQuestionText, getStarSlotInfo } from "./FormattedQuestionText";

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
  kanji_reading: "Cách đọc Kanji (Mondai 1)",
  orthography: "Cách viết Kanji (Mondai 2)",
  kanji_writing: "Cách viết Kanji (Mondai 2)",
  kanji_spelling: "Cách viết Kanji (Mondai 2)",
  context_meaning: "Hoàn thành câu/Ngữ cảnh (Mondai 3)",
  contextual_use: "Điền từ ngữ cảnh (Mondai 3)",
  context_word: "Điền từ ngữ cảnh (Mondai 3)",
  context_fill: "Điền từ ngữ cảnh (Mondai 3)",
  paraphrase: "Từ đồng nghĩa (Mondai 4)",
  synonym: "Từ đồng nghĩa (Mondai 4)",
  usage: "Cách dùng từ (Mondai 5)",
  word_usage: "Cách dùng từ (Mondai 5)",
  sentence_grammar: "Ngữ pháp câu (Mondai 1)",
  grammar_fill: "Ngữ pháp câu (Mondai 1)",
  star_arrangement: "Ghép câu dấu sao ★ (Mondai 2)",
  sentence_composition: "Ghép câu dấu sao ★ (Mondai 2)",
  sentence_order: "Ghép câu dấu sao ★ (Mondai 2)",
  text_grammar: "Ngữ pháp đoạn văn (Mondai 3)",
  passage_cloze: "Ngữ pháp đoạn văn (Mondai 3)",
  short_passage: "Đoạn văn ngắn (Mondai 4)",
  reading_short: "Đoạn văn ngắn (Mondai 4)",
  short_reading: "Đoạn văn ngắn (Mondai 4)",
  medium_passage: "Đoạn văn trung (Mondai 5)",
  reading_medium: "Đoạn văn trung (Mondai 5)",
  medium_reading: "Đoạn văn trung (Mondai 5)",
  long_passage: "Đoạn văn dài (Mondai 6)",
  reading_long: "Đoạn văn dài (Mondai 6)",
  long_reading: "Đoạn văn dài (Mondai 6)",
  information_retrieval: "Tìm kiếm thông tin (Mondai 7)",
  info_retrieval: "Tìm kiếm thông tin (Mondai 7)",
  information_lookup: "Tìm kiếm thông tin (Mondai 7)",
  reading_detail: "Đọc hiểu chi tiết",
  reading_inference: "Đọc hiểu suy luận",
  reading_comparison: "Đọc hiểu so sánh",
  reading_condition: "Tìm kiếm thông tin",
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
  const starInfo = getStarSlotInfo(question.questionText);

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

            {question.mondai && (
              <span className="text-xs font-bold px-2 py-0.5 rounded-md bg-[#E8F5E9] text-[#1B5E20] border border-[#A5D6A7]">
                {question.mondai}
              </span>
            )}

            <span className="text-xs font-medium px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 hidden sm:inline-block">
              {subtypeLabel}
            </span>

            {question.weight && (
              <span className="text-[11px] font-semibold px-2 py-0.5 rounded-md bg-amber-50 text-amber-700 border border-amber-200 hidden md:inline-block">
                Trọng số: {question.weight}đ
              </span>
            )}
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
        <div className="py-5 sm:py-6 space-y-4">
          <p className="font-japanese text-slate-900 text-[20px] sm:text-[22px] font-normal leading-[1.8] tracking-wide">
            <FormattedQuestionText text={question.questionText} />
          </p>

          {/* Banner hướng dẫn vị trí dấu sao cho câu ghép dấu sao ★ */}
          {starInfo && (
            <div className="flex items-center gap-3 p-3.5 rounded-2xl bg-gradient-to-r from-amber-50/90 to-amber-100/60 border-2 border-amber-300/90 text-amber-950 text-xs sm:text-sm font-medium shadow-xs">
              <div className="w-8 h-8 rounded-xl bg-amber-500 text-white flex items-center justify-center font-black text-sm shrink-0 shadow-xs ring-2 ring-white">
                ★
              </div>
              <div className="space-y-0.5">
                <div className="font-bold text-amber-900 flex items-center gap-2 flex-wrap">
                  <span>Câu hỏi ghép câu dấu sao:</span>
                  <span className="px-2.5 py-0.5 rounded-lg bg-white text-amber-900 font-black text-xs border border-amber-400 shadow-2xs">
                    Vị trí cần chọn: Ô số {starInfo.starPosition} [ ★ ]
                  </span>
                </div>
                <div className="text-[11px] sm:text-xs text-amber-800 font-normal">
                  Sắp xếp 4 phương án bên dưới thành câu hoàn chỉnh, sau đó chọn phương án nằm ở vị trí ô số {starInfo.starPosition} (có đánh dấu ★).
                </div>
              </div>
            </div>
          )}
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
                className={`w-full flex items-center justify-between p-3.5 sm:p-4 rounded-xl border text-left transition-all ${optionStyle} ${
                  isLocked ? "cursor-default" : "cursor-pointer"
                }`}
              >
                <div className="flex items-center gap-3 sm:gap-3.5 min-w-0">
                  <span
                    className={`inline-flex items-center justify-center w-7 h-7 rounded-lg text-xs font-bold border shrink-0 transition-colors ${badgeStyle}`}
                  >
                    {opt.id}
                  </span>
                  <span className="font-japanese text-[16px] sm:text-[17px] tracking-wide font-normal break-words">
                    {opt.text}
                  </span>
                </div>

                {isSelected && !isLocked && (
                  <Check className="w-5 h-5 text-indigo-600 shrink-0 ml-2" />
                )}
              </button>
            );
          })}
        </div>

        {/* Bottom Actions Bar */}
        <div className="mt-6 sm:mt-8 pt-4 sm:pt-5 border-t border-slate-100 flex items-center justify-between gap-2 sm:gap-3">
          <button
            onClick={onPrev}
            disabled={questionIndex === 0}
            className="inline-flex items-center gap-1 sm:gap-1.5 px-3 sm:px-4 py-2.5 rounded-xl border border-slate-200 text-slate-700 text-xs sm:text-sm font-medium hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors shrink-0"
          >
            <ArrowLeft className="w-4 h-4 shrink-0" />
            <span className="hidden sm:inline">Câu trước</span>
            <span className="inline sm:hidden">Trước</span>
          </button>

          <div className="flex items-center gap-2">
            {/* Next Button or Submit Button */}
            {mode === "exam" && isLastQuestion ? (
              <button
                onClick={onSubmitExam}
                className="inline-flex items-center gap-1.5 sm:gap-2 px-4 sm:px-6 py-2.5 rounded-xl bg-emerald-600 text-white text-xs sm:text-sm font-bold shadow-md hover:bg-emerald-700 active:scale-95 transition-all cursor-pointer"
              >
                <span>Nộp bài thi</span>
                <CheckCircle2 className="w-4 h-4 shrink-0" />
              </button>
            ) : (
              <button
                onClick={onNext}
                className="inline-flex items-center gap-1.5 px-4 sm:px-5 py-2.5 rounded-xl bg-slate-900 text-white text-xs sm:text-sm font-semibold hover:bg-slate-800 active:scale-95 transition-all cursor-pointer"
              >
                <span>{isLastQuestion ? (mode === "practice" ? "Xem kết quả & nộp bài" : "Hoàn thành") : "Câu tiếp"}</span>
                <ArrowRight className="w-4 h-4 shrink-0" />
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

