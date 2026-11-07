"use client";

import React from "react";
import { ExamQuestion } from "@/lib/types";
import { Flag, CheckCircle, HelpCircle } from "lucide-react";

interface ExamNavigatorProps {
  questions: ExamQuestion[];
  currentQuestionId: string;
  answers: Record<string, string>;
  flaggedQuestionIds: string[];
  checkedQuestionIds?: string[]; // Practice mode
  mode: "practice" | "exam";
  onSelectQuestion: (questionId: string) => void;
  className?: string;
}

export function ExamNavigator({
  questions,
  currentQuestionId,
  answers,
  flaggedQuestionIds = [],
  checkedQuestionIds = [],
  mode,
  onSelectQuestion,
  className = "",
}: ExamNavigatorProps) {
  const total = questions.length;
  const answeredCount = Object.keys(answers).filter((id) => answers[id] && answers[id] !== "").length;
  const flaggedCount = flaggedQuestionIds.length;

  return (
    <div className={`bg-white rounded-2xl border border-slate-200 p-5 shadow-sm ${className}`}>
      <div className="flex items-center justify-between pb-3.5 border-b border-slate-100">
        <div>
          <h3 className="font-bold text-slate-900 text-sm">Danh sách câu hỏi</h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Đã làm: <span className="font-semibold text-indigo-600">{answeredCount}</span>/{total} câu
          </p>
        </div>

        {flaggedCount > 0 && (
          <div className="flex items-center gap-1 text-xs text-amber-700 bg-amber-50 px-2 py-1 rounded-md border border-amber-200">
            <Flag className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
            <span>{flaggedCount} đã ghim</span>
          </div>
        )}
      </div>

      {/* Grid of question buttons */}
      <div className="grid grid-cols-5 gap-2 pt-4">
        {questions.map((q, idx) => {
          const isCurrent = q.id === currentQuestionId;
          const isAnswered = Boolean(answers[q.id]);
          const isFlagged = flaggedQuestionIds.includes(q.id);
          const isChecked = checkedQuestionIds.includes(q.id);
          const isCorrect = isChecked && answers[q.id] === q.correctOptionId;

          // Color calculation
          let btnClass = "bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100";

          if (mode === "practice" && isChecked) {
            if (isCorrect) {
              btnClass = "bg-emerald-600 text-white border-emerald-600 hover:bg-emerald-700";
            } else {
              btnClass = "bg-rose-600 text-white border-rose-600 hover:bg-rose-700";
            }
          } else if (isAnswered) {
            btnClass = "bg-indigo-600 text-white border-indigo-600 hover:bg-indigo-700";
          }

          return (
            <button
              key={q.id}
              onClick={() => onSelectQuestion(q.id)}
              className={`relative h-10 rounded-xl border text-xs font-bold transition-all flex items-center justify-center ${btnClass} ${
                isCurrent ? "ring-2 ring-indigo-600 ring-offset-2 scale-105 shadow-sm" : ""
              }`}
              title={`Câu ${idx + 1}`}
            >
              <span>{idx + 1}</span>

              {/* Flag marker */}
              {isFlagged && (
                <span className="absolute -top-1 -right-1 w-3 h-3 bg-amber-400 rounded-full border-2 border-white flex items-center justify-center" />
              )}
            </button>
          );
        })}
      </div>

      {/* Legend */}
      <div className="mt-5 pt-4 border-t border-slate-100 grid grid-cols-2 gap-2 text-[11px] text-slate-500">
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-md bg-indigo-600 inline-block" />
          <span>Đã trả lời</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-md bg-slate-100 border border-slate-300 inline-block" />
          <span>Chưa trả lời</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-full bg-amber-400 inline-block" />
          <span>Đã gắn cờ</span>
        </div>
        {mode === "practice" && (
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-md bg-emerald-600 inline-block" />
            <span>Đúng / Sai</span>
          </div>
        )}
      </div>
    </div>
  );
}
