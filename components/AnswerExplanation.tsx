"use client";

import React, { useState } from "react";
import { ExamQuestion } from "@/lib/types";
import { FuriganaRuby } from "./FuriganaRuby";
import { AITutorChat } from "./AITutorChat";
import { saveQuestionReport } from "@/lib/storage";
import {
  CheckCircle2,
  XCircle,
  Lightbulb,
  BookA,
  Sparkles,
  Quote,
  HelpCircle,
  AlertTriangle,
  Send,
  Check,
} from "lucide-react";

interface AnswerExplanationProps {
  question: ExamQuestion;
  selectedOptionId?: string;
  className?: string;
}

export function AnswerExplanation({
  question,
  selectedOptionId,
  className = "",
}: AnswerExplanationProps) {
  const isCorrect = selectedOptionId === question.correctOptionId;
  const isSkipped = !selectedOptionId;
  const { explanation } = question;

  const [showReportForm, setShowReportForm] = useState(false);
  const [issueType, setIssueType] = useState<"wrong_answer" | "unclear_explanation" | "typo" | "other">("wrong_answer");
  const [reportComment, setReportComment] = useState("");
  const [reportSuccess, setReportSuccess] = useState(false);

  const handleSendReport = (e: React.FormEvent) => {
    e.preventDefault();
    saveQuestionReport({
      questionId: question.id,
      issueType,
      comment: reportComment.trim() || undefined,
    });
    setReportSuccess(true);
    setTimeout(() => {
      setShowReportForm(false);
      setReportSuccess(false);
      setReportComment("");
    }, 1500);
  };

  const selectedOption = question.options.find((o) => o.id === selectedOptionId);
  const correctOption = question.options.find((o) => o.id === question.correctOptionId);

  return (
    <div
      className={`rounded-2xl border transition-all ${
        isCorrect
          ? "border-emerald-200 bg-emerald-50/40"
          : isSkipped
          ? "border-amber-200 bg-amber-50/30"
          : "border-rose-200 bg-rose-50/30"
      } p-6 sm:p-7 shadow-sm ${className}`}
    >
      {/* Header Status */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-5 border-b border-slate-200/80">
        <div className="flex items-center gap-3">
          {isCorrect ? (
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-100 text-emerald-800 text-sm font-bold">
              <CheckCircle2 className="w-5 h-5 text-emerald-600" />
              CHÍNH XÁC!
            </div>
          ) : isSkipped ? (
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-amber-100 text-amber-800 text-sm font-bold">
              <HelpCircle className="w-5 h-5 text-amber-600" />
              CHƯA CHỌN ĐÁP ÁN
            </div>
          ) : (
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-rose-100 text-rose-800 text-sm font-bold">
              <XCircle className="w-5 h-5 text-rose-600" />
              CHƯA CHÍNH XÁC
            </div>
          )}

          <div className="text-sm text-slate-700">
            <span>Đáp án đúng: </span>
            <span className="font-bold text-emerald-700 px-2 py-0.5 rounded bg-emerald-100/80">
              [{correctOption?.id}] {correctOption?.text}
            </span>
          </div>
        </div>

        {!isCorrect && !isSkipped && selectedOption && (
          <div className="text-sm text-slate-600">
            <span>Bạn đã chọn: </span>
            <span className="font-semibold text-rose-700 px-2 py-0.5 rounded bg-rose-100/80">
              [{selectedOption.id}] {selectedOption.text}
            </span>
          </div>
        )}
      </div>

      <div className="space-y-6 pt-5">
        {/* Tóm tắt & Lý do đúng */}
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-indigo-900 font-bold text-base">
            <Lightbulb className="w-5 h-5 text-amber-500" />
            <span>Phân tích đáp án</span>
          </div>
          <p className="text-slate-800 font-medium text-sm leading-relaxed">
            {explanation.summaryVi}
          </p>
          <p className="text-slate-700 text-sm leading-relaxed bg-white/70 p-3.5 rounded-xl border border-slate-200/70">
            {explanation.correctReasonVi}
          </p>
        </div>

        {/* Giải thích chi tiết từng lựa chọn (Distractors) */}
        {explanation.optionReasonsVi && Object.keys(explanation.optionReasonsVi).length > 0 && (
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Giải thích chi tiết từng phương án
            </h4>
            <div className="grid grid-cols-1 gap-2.5">
              {question.options.map((opt) => {
                const isThisCorrect = opt.id === question.correctOptionId;
                const isThisSelected = opt.id === selectedOptionId;
                const reason = explanation.optionReasonsVi[opt.id] || "Chưa có lời giải";

                return (
                  <div
                    key={opt.id}
                    className={`p-3.5 rounded-xl border text-sm transition-all ${
                      isThisCorrect
                        ? "border-emerald-300 bg-emerald-50 text-emerald-950 font-medium"
                        : isThisSelected
                        ? "border-rose-300 bg-rose-50 text-rose-950"
                        : "border-slate-200 bg-white text-slate-700"
                    }`}
                  >
                    <div className="flex items-start gap-2.5">
                      <span
                        className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold shrink-0 ${
                          isThisCorrect
                            ? "bg-emerald-600 text-white"
                            : isThisSelected
                            ? "bg-rose-500 text-white"
                            : "bg-slate-200 text-slate-700"
                        }`}
                      >
                        {opt.id}
                      </span>
                      <div className="space-y-1">
                        <div className="font-japanese font-semibold">
                          {opt.text}
                          {isThisCorrect && (
                            <span className="ml-2 text-xs font-normal text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
                              (Đáp án đúng)
                            </span>
                          )}
                          {isThisSelected && !isThisCorrect && (
                            <span className="ml-2 text-xs font-normal text-rose-700 bg-rose-100 px-2 py-0.5 rounded-full">
                              (Lựa chọn của bạn)
                            </span>
                          )}
                        </div>
                        <p className="text-xs leading-relaxed text-slate-600">{reason}</p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Dịch nghĩa tiếng Việt */}
        {explanation.translationVi && (
          <div className="space-y-1.5">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Dịch nghĩa tiếng Việt
            </span>
            <div className="p-3.5 rounded-xl bg-slate-100/90 border border-slate-200 text-slate-800 text-sm italic leading-relaxed">
              &ldquo;{explanation.translationVi}&rdquo;
            </div>
          </div>
        )}

        {/* Bằng chứng trong bài đọc (nếu có) */}
        {explanation.readingEvidenceJa && (
          <div className="space-y-1.5">
            <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-indigo-700">
              <Quote className="w-4 h-4" />
              <span>Câu văn bằng chứng trong bài đọc (Evidence)</span>
            </div>
            <div className="p-3.5 rounded-xl bg-indigo-50/70 border border-indigo-100 font-japanese text-indigo-950 text-sm leading-relaxed">
              {explanation.readingEvidenceJa}
            </div>
          </div>
        )}

        {/* Từ vựng quan trọng (với Furigana) */}
        {explanation.vocabulary && explanation.vocabulary.length > 0 && (
          <div className="space-y-2.5">
            <div className="flex items-center gap-2 text-slate-900 font-semibold text-sm">
              <BookA className="w-4 h-4 text-indigo-600" />
              <span>Từ vựng trọng tâm N3</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {explanation.vocabulary.map((v, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between p-3 rounded-xl bg-white border border-slate-200 text-sm"
                >
                  <div className="space-y-0.5">
                    <FuriganaRuby
                      word={v.word}
                      hiragana={v.hiragana}
                      className="text-base font-bold text-slate-900"
                    />
                  </div>
                  <span className="text-xs text-slate-600 font-medium text-right ml-2">
                    {v.meaningVi}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Điểm ngữ pháp (nếu có) */}
        {explanation.grammarPoints && explanation.grammarPoints.length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-slate-900 font-semibold text-sm">
              <Sparkles className="w-4 h-4 text-indigo-600" />
              <span>Cấu trúc ngữ pháp liên quan</span>
            </div>
            <div className="space-y-2.5">
              {explanation.grammarPoints.map((gp, i) => (
                <div
                  key={i}
                  className="p-3.5 rounded-xl bg-white border border-slate-200 text-sm space-y-2"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-bold text-indigo-600 font-japanese">
                      {gp.pattern}
                    </span>
                    <span className="text-xs font-semibold px-2 py-0.5 rounded bg-indigo-50 text-indigo-700">
                      {gp.meaningVi}
                    </span>
                  </div>
                  {gp.usageVi && (
                    <p className="text-xs text-slate-600 leading-relaxed">{gp.usageVi}</p>
                  )}
                  {gp.exampleJa && (
                    <div className="pt-1.5 border-t border-slate-100 text-xs">
                      <p className="font-japanese text-slate-800">{gp.exampleJa}</p>
                      {gp.exampleVi && <p className="text-slate-500 italic">{gp.exampleVi}</p>}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Mẹo làm bài (Study Tip) */}
        {explanation.studyTipVi && (
          <div className="flex items-start gap-3 p-3.5 rounded-xl bg-amber-50/80 border border-amber-200 text-xs text-amber-900">
            <Sparkles className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold">Mẹo nhận diện & Bẫy thường gặp: </span>
              <span className="leading-relaxed">{explanation.studyTipVi}</span>
            </div>
          </div>
        )}

        {/* Module 4: Hỏi Sensei AI (AI Tutor) */}
        <AITutorChat
          question={question}
          selectedOptionId={selectedOptionId}
        />

        {/* Báo lỗi câu hỏi (Report Question) */}
        <div className="pt-3 border-t border-slate-200/60">
          {!showReportForm ? (
            <button
              type="button"
              onClick={() => setShowReportForm(true)}
              className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-slate-600 transition-colors"
            >
              <AlertTriangle className="w-3.5 h-3.5" />
              <span>Báo lỗi câu hỏi này</span>
            </button>
          ) : (
            <form onSubmit={handleSendReport} className="p-4 rounded-xl bg-white border border-slate-200 space-y-3 text-xs">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-800 flex items-center gap-1.5">
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />
                  Báo lỗi câu hỏi (ID: {question.id})
                </span>
                <button
                  type="button"
                  onClick={() => setShowReportForm(false)}
                  className="text-slate-400 hover:text-slate-600"
                >
                  Đóng
                </button>
              </div>

              {reportSuccess ? (
                <div className="py-2 text-emerald-600 font-semibold flex items-center gap-1.5">
                  <Check className="w-4 h-4" />
                  Đã ghi nhận báo lỗi! Cảm ơn bạn.
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { id: "wrong_answer", label: "Đáp án không đúng" },
                      { id: "unclear_explanation", label: "Lời giải khó hiểu" },
                      { id: "typo", label: "Lỗi chính tả" },
                      { id: "other", label: "Lỗi khác" },
                    ].map((item) => (
                      <label
                        key={item.id}
                        className={`p-2 rounded-lg border cursor-pointer flex items-center gap-2 transition-colors ${
                          issueType === item.id
                            ? "border-indigo-600 bg-indigo-50 text-indigo-900 font-semibold"
                            : "border-slate-200 text-slate-600 hover:bg-slate-50"
                        }`}
                      >
                        <input
                          type="radio"
                          name="issueType"
                          checked={issueType === item.id}
                          onChange={() => setIssueType(item.id as any)}
                          className="w-3 h-3 text-indigo-600"
                        />
                        <span>{item.label}</span>
                      </label>
                    ))}
                  </div>

                  <textarea
                    value={reportComment}
                    onChange={(e) => setReportComment(e.target.value)}
                    rows={2}
                    placeholder="Mô tả cụ thể vấn đề (tùy chọn)..."
                    className="w-full p-2.5 rounded-lg border border-slate-200 text-xs text-slate-800 focus:outline-none focus:border-indigo-500"
                  />

                  <div className="flex justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => setShowReportForm(false)}
                      className="px-3 py-1.5 rounded-lg text-slate-600 hover:bg-slate-100"
                    >
                      Hủy
                    </button>
                    <button
                      type="submit"
                      className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-indigo-600 text-white font-semibold hover:bg-indigo-700"
                    >
                      <Send className="w-3 h-3" />
                      Gửi báo lỗi
                    </button>
                  </div>
                </>
              )}
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

