"use client";

import React, { useState } from "react";
import { ExamDetail, ExamQuestion, ExamPassage } from "@/lib/types";
import {
  Save,
  CheckCircle2,
  AlertTriangle,
  Sparkles,
  Download,
  Trash2,
  Plus,
  ArrowRight,
  BookOpen,
  Edit3,
  FileCheck,
  Send,
  Loader2,
} from "lucide-react";

interface AdminReviewEditorProps {
  exam: ExamDetail;
  rawTextPreview?: string;
  onUpdateExam: (updated: ExamDetail) => void;
  onPublished?: (examId: string) => void;
}

export function AdminReviewEditor({
  exam,
  rawTextPreview = "",
  onUpdateExam,
  onPublished,
}: AdminReviewEditorProps) {
  const [activeQuestionIdx, setActiveQuestionIdx] = useState<number>(0);
  const [isGeneratingExplanations, setIsGeneratingExplanations] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const [publishMessage, setPublishMessage] = useState<{ success?: boolean; text: string } | null>(null);

  const currentQ = exam.questions[activeQuestionIdx] || exam.questions[0];

  // Warnings calculation
  const warnings: string[] = [];
  exam.questions.forEach((q, idx) => {
    const qNum = q.number || idx + 1;
    if (!q.correctOptionId) {
      warnings.push(`Câu ${qNum}: Chưa có đáp án đúng (correctOptionId đang trống)`);
    }
    if (q.review.status === "needs_review") {
      warnings.push(`Câu ${qNum}: Đang đánh dấu cần kiểm duyệt (needs_review)`);
    }
    if (q.options.length < 2) {
      warnings.push(`Câu ${qNum}: Có ít hơn 2 lựa chọn`);
    }
    const missingOptionReasons = q.options.filter(
      (opt) => !q.explanation?.optionReasonsVi?.[opt.id]
    );
    if (missingOptionReasons.length > 0) {
      warnings.push(
        `Câu ${qNum}: Thiếu giải thích cho lựa chọn [${missingOptionReasons.map((o) => o.id).join(", ")}]`
      );
    }
  });

  // Handler: Update current question
  const updateQuestion = (updatedQ: ExamQuestion) => {
    const newQuestions = [...exam.questions];
    newQuestions[activeQuestionIdx] = updatedQ;
    onUpdateExam({
      ...exam,
      questions: newQuestions,
    });
  };

  // Handler: AI Generate Explanations (Module 2)
  const handleAIGenerateExplanations = async () => {
    setIsGeneratingExplanations(true);
    setPublishMessage(null);
    try {
      const adminSecret = typeof window !== "undefined" ? localStorage.getItem("jlpt_admin_secret") || "admin123" : "admin123";
      const customApiKey = typeof window !== "undefined" ? localStorage.getItem("jlpt_gemini_api_key") || "" : "";

      const res = await fetch("/api/admin/ai/explain", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-admin-secret": adminSecret,
        },
        body: JSON.stringify({ exam, customApiKey: customApiKey || undefined }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Không thể tạo lời giải qua AI");
      }

      onUpdateExam(data.exam);
      setPublishMessage({
        success: true,
        text: "Đã tạo đầy đủ lời giải, dịch nghĩa, ngữ pháp & từ vựng qua AI thành công!",
      });
    } catch (err: any) {
      setPublishMessage({
        success: false,
        text: err.message || "Lỗi tạo lời giải",
      });
    } finally {
      setIsGeneratingExplanations(false);
    }
  };

  // Handler: Publish Exam
  const handlePublish = async () => {
    if (warnings.length > 0) {
      if (
        !confirm(
          `Vẫn còn ${warnings.length} cảnh báo (ví dụ: câu chưa có đáp án hoặc chưa verified). Bạn có chắc chắn muốn xuất bản không?`
        )
      ) {
        return;
      }
    }

    setIsPublishing(true);
    setPublishMessage(null);
    try {
      // Mark all questions verified if confirmed
      const verifiedExam = {
        ...exam,
        status: "published" as const,
        questions: exam.questions.map((q) => ({
          ...q,
          review: { ...q.review, status: "verified" as const },
        })),
      };

      const adminSecret = typeof window !== "undefined" ? localStorage.getItem("jlpt_admin_secret") || "admin123" : "admin123";

      const res = await fetch("/api/admin/exams/publish", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-admin-secret": adminSecret,
        },
        body: JSON.stringify({ exam: verifiedExam }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Không thể xuất bản đề thi");
      }

      setPublishMessage({
        success: true,
        text: `Đã xuất bản thành công! Đề đã hiển thị tại Kho đề thi.`,
      });
      if (onPublished) onPublished(verifiedExam.id);
    } catch (err: any) {
      setPublishMessage({
        success: false,
        text: err.message || "Lỗi xuất bản",
      });
    } finally {
      setIsPublishing(false);
    }
  };

  const handleDownloadJson = () => {
    const blob = new Blob([JSON.stringify(exam, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${exam.id || "exam"}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Top Action Bar */}
      <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold px-3 py-1 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200">
              {exam.level}
            </span>
            <h2 className="font-bold text-slate-900 text-lg">{exam.title}</h2>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Mã: <code className="font-mono text-indigo-600 font-bold">{exam.id}</code> • {exam.questions.length} câu hỏi • {warnings.length} cảnh báo
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Module 2: AI Explanation Button */}
          <button
            type="button"
            disabled={isGeneratingExplanations}
            onClick={handleAIGenerateExplanations}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 active:scale-95 text-white text-xs font-bold shadow-sm transition-all disabled:opacity-50"
          >
            {isGeneratingExplanations ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Sparkles className="w-4 h-4 text-purple-200" />
            )}
            <span>{isGeneratingExplanations ? "AI Đang tạo lời giải..." : "AI Tạo Lời Giải Chi Tiết"}</span>
          </button>

          {/* Download JSON */}
          <button
            type="button"
            onClick={handleDownloadJson}
            className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 text-xs font-semibold transition-colors"
          >
            <Download className="w-4 h-4 text-slate-400" />
            <span>Tải JSON</span>
          </button>

          {/* Publish Button */}
          <button
            type="button"
            disabled={isPublishing}
            onClick={handlePublish}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white text-xs font-bold shadow-sm transition-all disabled:opacity-50"
          >
            {isPublishing ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <CheckCircle2 className="w-4 h-4" />
            )}
            <span>{isPublishing ? "Đang xuất bản..." : "Phê Duyệt & Xuất Bản"}</span>
          </button>
        </div>
      </div>

      {/* Status banner */}
      {publishMessage && (
        <div
          className={`p-4 rounded-2xl text-xs flex items-center gap-2.5 border ${
            publishMessage.success
              ? "bg-emerald-50 text-emerald-900 border-emerald-200"
              : "bg-rose-50 text-rose-900 border-rose-200"
          }`}
        >
          {publishMessage.success ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          ) : (
            <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
          )}
          <span>{publishMessage.text}</span>
        </div>
      )}

      {/* Main Side-by-Side Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Source Text Preview & Warnings */}
        <div className="lg:col-span-5 space-y-5">
          {/* Warnings Box */}
          {warnings.length > 0 && (
            <div className="bg-amber-50/70 border border-amber-200 p-5 rounded-3xl space-y-2.5">
              <div className="flex items-center gap-2 text-amber-900 font-bold text-xs uppercase tracking-wider">
                <AlertTriangle className="w-4 h-4 text-amber-600" />
                <span>Các điểm cần kiểm duyệt ({warnings.length})</span>
              </div>
              <ul className="text-xs text-amber-900 space-y-1.5 list-disc list-inside max-h-48 overflow-y-auto pr-1">
                {warnings.map((w, idx) => (
                  <li key={idx} className="leading-relaxed">
                    {w}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Original Source Text Pane */}
          <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h3 className="font-bold text-slate-800 text-sm flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-indigo-600" />
                <span>Văn bản trích xuất nguồn</span>
              </h3>
              <span className="text-[11px] text-slate-400 font-mono">
                {exam.source?.fileName || "Tài liệu gốc"}
              </span>
            </div>

            <div className="max-h-96 overflow-y-auto font-japanese text-xs text-slate-700 p-3.5 rounded-2xl bg-slate-50 border border-slate-100 whitespace-pre-wrap leading-relaxed">
              {rawTextPreview || "Chưa có văn bản nguồn để hiển thị."}
            </div>
          </div>

          {/* Passage linked to current question if any */}
          {currentQ?.passageId && (
            <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm space-y-3">
              <span className="text-xs font-bold text-indigo-700 uppercase tracking-wider">
                Bài đọc liên kết ({currentQ.passageId})
              </span>
              <div className="text-xs font-japanese text-slate-800 leading-relaxed max-h-60 overflow-y-auto p-3 rounded-xl bg-slate-50">
                {exam.passages?.find((p) => p.id === currentQ.passageId)?.text || "Không tìm thấy bài đọc"}
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Question Navigator & Question Editor */}
        <div className="lg:col-span-7 bg-white p-6 sm:p-7 rounded-3xl border border-slate-200 shadow-sm space-y-6">
          {/* Question Selector Pills */}
          <div className="flex items-center justify-between gap-2 pb-3 border-b border-slate-100">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Chọn câu hỏi ({exam.questions.length})
            </span>
            <div className="flex flex-wrap items-center gap-1.5 max-h-24 overflow-y-auto">
              {exam.questions.map((q, idx) => {
                const isSelected = activeQuestionIdx === idx;
                const hasCorrect = Boolean(q.correctOptionId);
                const isNeedsReview = q.review.status === "needs_review";

                return (
                  <button
                    key={q.id}
                    type="button"
                    onClick={() => setActiveQuestionIdx(idx)}
                    className={`w-8 h-8 rounded-xl text-xs font-bold transition-all flex items-center justify-center ${
                      isSelected
                        ? "bg-indigo-600 text-white ring-2 ring-indigo-600 ring-offset-1"
                        : !hasCorrect || isNeedsReview
                        ? "bg-amber-100 text-amber-800 hover:bg-amber-200"
                        : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                    }`}
                  >
                    {idx + 1}
                  </button>
                );
              })}
            </div>
          </div>

          {currentQ && (
            <div className="space-y-5">
              {/* Question Metadata */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                <div>
                  <label className="font-semibold text-slate-600 block mb-1">Mã câu (ID)</label>
                  <input
                    type="text"
                    value={currentQ.id}
                    onChange={(e) => updateQuestion({ ...currentQ, id: e.target.value })}
                    className="w-full p-2 rounded-xl border border-slate-200 font-mono"
                  />
                </div>

                <div>
                  <label className="font-semibold text-slate-600 block mb-1">Kỹ năng</label>
                  <select
                    value={currentQ.section}
                    onChange={(e) => updateQuestion({ ...currentQ, section: e.target.value as any })}
                    className="w-full p-2 rounded-xl border border-slate-200"
                  >
                    <option value="vocabulary">Từ vựng (Vocabulary)</option>
                    <option value="grammar">Ngữ pháp (Grammar)</option>
                    <option value="reading">Đọc hiểu (Reading)</option>
                  </select>
                </div>

                <div>
                  <label className="font-semibold text-slate-600 block mb-1">Dạng bài (Subtype)</label>
                  <input
                    type="text"
                    value={currentQ.subtype}
                    onChange={(e) => updateQuestion({ ...currentQ, subtype: e.target.value })}
                    className="w-full p-2 rounded-xl border border-slate-200"
                  />
                </div>

                <div>
                  <label className="font-semibold text-slate-600 block mb-1">Trạng thái duyệt</label>
                  <select
                    value={currentQ.review.status}
                    onChange={(e) =>
                      updateQuestion({
                        ...currentQ,
                        review: { ...currentQ.review, status: e.target.value as any },
                      })
                    }
                    className={`w-full p-2 rounded-xl border font-bold ${
                      currentQ.review.status === "verified"
                        ? "border-emerald-300 bg-emerald-50 text-emerald-800"
                        : "border-amber-300 bg-amber-50 text-amber-800"
                    }`}
                  >
                    <option value="verified">Verified (Đã duyệt)</option>
                    <option value="needs_review">Needs Review (Cần xem lại)</option>
                  </select>
                </div>
              </div>

              {/* Question Text */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-800 block">
                  Nội dung câu hỏi tiếng Nhật
                </label>
                <textarea
                  value={currentQ.questionText}
                  onChange={(e) => updateQuestion({ ...currentQ, questionText: e.target.value })}
                  rows={3}
                  className="w-full p-3 rounded-2xl border border-slate-200 font-japanese text-base leading-relaxed focus:outline-none focus:border-indigo-500"
                />
              </div>

              {/* Options & Correct Option Selector */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-800">Các lựa chọn & Đáp án đúng</label>
                  <div className="flex items-center gap-2 text-xs">
                    <span className="text-slate-500">Đáp án đúng:</span>
                    <select
                      value={currentQ.correctOptionId || ""}
                      onChange={(e) =>
                        updateQuestion({
                          ...currentQ,
                          correctOptionId: e.target.value || null,
                          review: { ...currentQ.review, status: e.target.value ? "verified" : "needs_review" },
                        })
                      }
                      className="px-2.5 py-1 rounded-lg border border-slate-300 font-bold bg-indigo-50 text-indigo-700"
                    >
                      <option value="">-- Chưa có đáp án (Null) --</option>
                      {currentQ.options.map((opt) => (
                        <option key={opt.id} value={opt.id}>
                          Phương án [{opt.id}]
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="space-y-2.5">
                  {currentQ.options.map((opt, optIdx) => {
                    const isCorrect = currentQ.correctOptionId === opt.id;
                    const reason = currentQ.explanation?.optionReasonsVi?.[opt.id] || "";

                    return (
                      <div
                        key={opt.id}
                        className={`p-3.5 rounded-2xl border transition-colors space-y-2 text-xs ${
                          isCorrect
                            ? "border-emerald-300 bg-emerald-50/50"
                            : "border-slate-200 bg-slate-50/50"
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          <span
                            className={`w-6 h-6 rounded-lg text-xs font-bold flex items-center justify-center shrink-0 ${
                              isCorrect ? "bg-emerald-600 text-white" : "bg-slate-200 text-slate-700"
                            }`}
                          >
                            {opt.id}
                          </span>
                          <input
                            type="text"
                            value={opt.text}
                            onChange={(e) => {
                              const newOpts = [...currentQ.options];
                              newOpts[optIdx] = { ...opt, text: e.target.value };
                              updateQuestion({ ...currentQ, options: newOpts });
                            }}
                            className="flex-1 p-2 rounded-xl border border-slate-200 font-japanese text-sm bg-white"
                          />
                        </div>

                        {/* Distractor Reason */}
                        <div className="pl-8">
                          <input
                            type="text"
                            value={reason}
                            placeholder={`Giải thích vì sao lựa chọn [${opt.id}] đúng/sai...`}
                            onChange={(e) => {
                              const newReasons = {
                                ...(currentQ.explanation.optionReasonsVi || {}),
                                [opt.id]: e.target.value,
                              };
                              updateQuestion({
                                ...currentQ,
                                explanation: { ...currentQ.explanation, optionReasonsVi: newReasons },
                              });
                            }}
                            className="w-full p-2 rounded-xl border border-slate-200 text-slate-600 bg-white"
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Translation & Reason */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div className="space-y-1">
                  <label className="font-bold text-slate-700">Dịch nghĩa tiếng Việt</label>
                  <textarea
                    value={currentQ.explanation.translationVi || ""}
                    onChange={(e) =>
                      updateQuestion({
                        ...currentQ,
                        explanation: { ...currentQ.explanation, translationVi: e.target.value },
                      })
                    }
                    rows={3}
                    className="w-full p-2.5 rounded-xl border border-slate-200"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-700">Lý do chọn đáp án đúng</label>
                  <textarea
                    value={currentQ.explanation.correctReasonVi || ""}
                    onChange={(e) =>
                      updateQuestion({
                        ...currentQ,
                        explanation: { ...currentQ.explanation, correctReasonVi: e.target.value },
                      })
                    }
                    rows={3}
                    className="w-full p-2.5 rounded-xl border border-slate-200"
                  />
                </div>
              </div>

              {/* Study Tip */}
              <div className="space-y-1 text-xs">
                <label className="font-bold text-slate-700">Mẹo nhận diện & Bẫy thường gặp (Study Tip)</label>
                <input
                  type="text"
                  value={currentQ.explanation.studyTipVi || ""}
                  onChange={(e) =>
                    updateQuestion({
                      ...currentQ,
                      explanation: { ...currentQ.explanation, studyTipVi: e.target.value },
                    })
                  }
                  className="w-full p-2.5 rounded-xl border border-slate-200"
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

