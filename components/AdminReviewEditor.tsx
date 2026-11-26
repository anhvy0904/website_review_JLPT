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
  Image as ImageIcon,
  ZoomIn,
  Eye,
  Check,
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
  const [isSaving, setIsSaving] = useState(false);
  const [publishMessage, setPublishMessage] = useState<{ success?: boolean; text: string } | null>(null);
  const [zoomImageSrc, setZoomImageSrc] = useState<string | null>(null);

  const currentQ = exam.questions[activeQuestionIdx] || exam.questions[0];

  // Progress metrics calculation (Requirement 9)
  const totalQuestions = exam.questions.length;
  const questionsWithText = exam.questions.filter(
    (q) => q.questionText && q.questionText.trim().length > 0
  ).length;
  const verifiedQuestions = exam.questions.filter(
    (q) => q.review.status === "verified" && q.correctOptionId != null
  ).length;
  const totalPassages = exam.passages && exam.passages.length > 0 ? exam.passages.length : 9;
  const passagesWithText = (exam.passages || []).filter(
    (p) => p.text && p.text.trim().length > 0
  ).length;

  // Warnings calculation
  const warnings: string[] = [];
  exam.questions.forEach((q, idx) => {
    const qNum = q.number || idx + 1;
    if (!q.questionText || q.questionText.trim().length === 0) {
      warnings.push(`Câu ${qNum}: Chưa có nội dung văn bản tiếng Nhật`);
    }
    if (!q.correctOptionId) {
      warnings.push(`Câu ${qNum}: Chưa có đáp án đúng (correctOptionId đang trống)`);
    }
    if (q.review.status === "needs_review") {
      warnings.push(`Câu ${qNum}: Đang đánh dấu cần kiểm duyệt (needs_review)`);
    }
    if (q.options.length < 4) {
      warnings.push(`Câu ${qNum}: Chưa đủ 4 lựa chọn (hiện có ${q.options.length})`);
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

  (exam.passages || []).forEach((p) => {
    if (!p.text || p.text.trim().length === 0) {
      warnings.push(`Bài đọc ${p.id}: Chưa có văn bản tiếng Nhật đã chuyển đổi`);
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

  // Handler: Update linked passage
  const updatePassage = (passageId: string, updatedFields: Partial<ExamPassage>) => {
    const newPassages = (exam.passages || []).map((p) => {
      if (p.id === passageId) {
        return { ...p, ...updatedFields };
      }
      return p;
    });
    onUpdateExam({
      ...exam,
      passages: newPassages,
    });
  };

  // Handler: Save draft to disk
  const handleSaveDraft = async () => {
    setIsSaving(true);
    setPublishMessage(null);
    try {
      const adminSecret =
        typeof window !== "undefined"
          ? localStorage.getItem("jlpt_admin_secret") || "admin123"
          : "admin123";

      const res = await fetch("/api/admin/exams/save", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-admin-secret": adminSecret,
        },
        body: JSON.stringify({ exam }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Không thể lưu bản nháp");
      }

      setPublishMessage({
        success: true,
        text: `Đã lưu bản nháp bộ đề ${exam.id} thành công vào hệ thống!`,
      });
    } catch (err: any) {
      setPublishMessage({
        success: false,
        text: err.message || "Lỗi lưu bản nháp",
      });
    } finally {
      setIsSaving(false);
    }
  };

  // Handler: AI Generate Explanations (Module 2)
  const handleAIGenerateExplanations = async () => {
    setIsGeneratingExplanations(true);
    setPublishMessage(null);
    try {
      const adminSecret =
        typeof window !== "undefined"
          ? localStorage.getItem("jlpt_admin_secret") || "admin123"
          : "admin123";
      const customApiKey =
        typeof window !== "undefined"
          ? localStorage.getItem("jlpt_gemini_api_key") || ""
          : "";

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

  // Handler: Strict Publish Exam (Requirement 10)
  const handlePublish = async () => {
    // 1. Strict Requirement 10 checks
    const publishBlockers: string[] = [];

    if (questionsWithText < totalQuestions) {
      publishBlockers.push(
        `Còn ${totalQuestions - questionsWithText} câu chưa có nội dung văn bản tiếng Nhật`
      );
    }
    if (verifiedQuestions < totalQuestions) {
      publishBlockers.push(
        `Còn ${totalQuestions - verifiedQuestions} câu chưa có đáp án đúng hoặc chưa duyệt verified`
      );
    }
    if (passagesWithText < totalPassages) {
      publishBlockers.push(
        `Còn ${totalPassages - passagesWithText} bài đọc chưa có nội dung văn bản`
      );
    }

    const unverifiedPassages = (exam.passages || []).filter(
      (p) => p.reviewStatus === "needs_review"
    ).length;
    if (unverifiedPassages > 0) {
      publishBlockers.push(
        `Còn ${unverifiedPassages} bài đọc đang đánh dấu cần kiểm chứng (needs_review)`
      );
    }

    const missing4Options = exam.questions.filter(
      (q) =>
        !q.options ||
        q.options.length < 4 ||
        q.options.every((o) => o.text.trim() === o.id.trim())
    ).length;
    if (missing4Options > 0) {
      publishBlockers.push(`Còn ${missing4Options} câu chưa đủ 4 lựa chọn gốc tiếng Nhật`);
    }

    const missingExplanation = exam.questions.filter(
      (q) =>
        !q.explanation?.summaryVi?.trim() ||
        !q.explanation?.correctReasonVi?.trim() ||
        q.explanation.summaryVi.includes("Chưa có đáp án gốc") ||
        q.explanation.correctReasonVi.includes("Chưa được kiểm duyệt")
    ).length;
    if (missingExplanation > 0) {
      publishBlockers.push(`Còn ${missingExplanation} câu chưa có lời giải chi tiết đã kiểm duyệt`);
    }

    if (publishBlockers.length > 0) {
      setPublishMessage({
        success: false,
        text: `KHÔNG THỂ XUẤT BẢN! Chưa thỏa mãn quy chuẩn xuất bản:\n• ${publishBlockers.join(
          "\n• "
        )}`,
      });
      return;
    }

    setIsPublishing(true);
    setPublishMessage(null);
    try {
      const verifiedExam = {
        ...exam,
        status: "published" as const,
        source: {
          ...exam.source,
          reviewedByHuman: true,
        },
        questions: exam.questions.map((q) => ({
          ...q,
          review: { ...q.review, status: "verified" as const },
        })),
        passages: (exam.passages || []).map((p) => ({
          ...p,
          reviewStatus: "verified" as const,
        })),
      };

      const adminSecret =
        typeof window !== "undefined"
          ? localStorage.getItem("jlpt_admin_secret") || "admin123"
          : "admin123";

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
        text: `Đã xuất bản thành công! Đề đã hiển thị tại Kho đề thi chính thức.`,
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
    const blob = new Blob([JSON.stringify(exam, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${exam.id || "exam"}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Find linked passage
  const currentPassage = exam.passages?.find((p) => p.id === currentQ?.passageId);
  const passageImages: string[] = currentPassage
    ? [currentPassage.imagePath, ...(currentPassage.additionalImagePaths || [])].filter(
        (img): img is string => Boolean(img && img.trim().length > 0)
      )
    : [];

  return (
    <div className="space-y-6">
      {/* Top Action Bar */}
      <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <span
              className={`text-xs font-bold px-3 py-1 rounded-full border ${
                exam.status === "published"
                  ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                  : "bg-amber-50 text-amber-800 border-amber-300"
              }`}
            >
              {exam.status === "published" ? "Đã xuất bản" : "Bản nháp (Draft)"}
            </span>
            {exam.questions.some((q) => q.correctOptionId == null) && (
              <span className="text-xs font-bold px-3 py-1 rounded-full bg-amber-100 text-amber-900 border border-amber-300 flex items-center gap-1">
                <AlertTriangle className="w-3.5 h-3.5 text-amber-700" />
                <span>Chưa xác minh đáp án</span>
              </span>
            )}
            <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200">
              {exam.level}
            </span>
            <h2 className="font-bold text-slate-900 text-lg">{exam.title}</h2>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Mã: <code className="font-mono text-indigo-600 font-bold">{exam.id}</code> •{" "}
            {exam.questions.length} câu hỏi • {warnings.length} điểm cần soát
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Save Draft */}
          <button
            type="button"
            disabled={isSaving}
            onClick={handleSaveDraft}
            className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 active:scale-95 text-slate-700 text-xs font-bold shadow-2xs transition-all disabled:opacity-50"
            title="Lưu các chỉnh sửa câu hỏi & bài đọc vào ổ đĩa"
          >
            {isSaving ? (
              <Loader2 className="w-4 h-4 animate-spin text-slate-600" />
            ) : (
              <Save className="w-4 h-4 text-slate-600" />
            )}
            <span>{isSaving ? "Đang lưu..." : "Lưu bản nháp"}</span>
          </button>

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
            <span>
              {isGeneratingExplanations ? "AI Đang tạo lời giải..." : "AI Tạo Lời Giải Chi Tiết"}
            </span>
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

      {/* Progress Indicators (Requirement 9) */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs space-y-1.5">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-600">
            <span>Câu hỏi có bản chữ</span>
            <span
              className={
                questionsWithText === totalQuestions
                  ? "text-emerald-700 font-bold"
                  : "text-amber-700 font-bold"
              }
            >
              {questionsWithText} / {totalQuestions}
            </span>
          </div>
          <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
            <div
              className={`h-full rounded-full transition-all ${
                questionsWithText === totalQuestions ? "bg-emerald-500" : "bg-amber-500"
              }`}
              style={{
                width: `${totalQuestions > 0 ? (questionsWithText / totalQuestions) * 100 : 0}%`,
              }}
            />
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs space-y-1.5">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-600">
            <span>Câu hỏi đã duyệt (Verified)</span>
            <span
              className={
                verifiedQuestions === totalQuestions
                  ? "text-emerald-700 font-bold"
                  : "text-indigo-700 font-bold"
              }
            >
              {verifiedQuestions} / {totalQuestions}
            </span>
          </div>
          <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
            <div
              className={`h-full rounded-full transition-all ${
                verifiedQuestions === totalQuestions ? "bg-emerald-500" : "bg-indigo-500"
              }`}
              style={{
                width: `${totalQuestions > 0 ? (verifiedQuestions / totalQuestions) * 100 : 0}%`,
              }}
            />
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs space-y-1.5">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-600">
            <span>Bài đọc có bản chữ</span>
            <span
              className={
                passagesWithText === totalPassages
                  ? "text-emerald-700 font-bold"
                  : "text-purple-700 font-bold"
              }
            >
              {passagesWithText} / {totalPassages}
            </span>
          </div>
          <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
            <div
              className={`h-full rounded-full transition-all ${
                passagesWithText === totalPassages ? "bg-emerald-500" : "bg-purple-500"
              }`}
              style={{
                width: `${totalPassages > 0 ? (passagesWithText / totalPassages) * 100 : 0}%`,
              }}
            />
          </div>
        </div>
      </div>

      {/* Status banner */}
      {publishMessage && (
        <div
          className={`p-4 rounded-2xl text-xs flex items-start gap-2.5 border whitespace-pre-line leading-relaxed ${
            publishMessage.success
              ? "bg-emerald-50 text-emerald-950 border-emerald-300"
              : "bg-rose-50 text-rose-950 border-rose-300"
          }`}
        >
          {publishMessage.success ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
          ) : (
            <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
          )}
          <span className="font-medium">{publishMessage.text}</span>
        </div>
      )}

      {/* Main Side-by-Side Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Source Images & Linked Passage Editor */}
        <div className="lg:col-span-5 space-y-5">
          {/* Question Source Image (PDF scan) */}
          {currentQ?.questionImagePath && (
            <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <h3 className="font-bold text-slate-800 text-xs uppercase tracking-wider flex items-center gap-2">
                  <ImageIcon className="w-4 h-4 text-indigo-600" />
                  <span>Ảnh trang đề gốc câu {currentQ.number}</span>
                </h3>
                {currentQ.sourcePage && (
                  <span className="text-[11px] text-slate-500 font-mono">
                    Trang PDF: {currentQ.sourcePage}
                  </span>
                )}
              </div>

              <div className="relative group overflow-hidden rounded-2xl border border-slate-200 bg-slate-50 p-2">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={currentQ.questionImagePath}
                  alt={`Ảnh đề gốc câu ${currentQ.number}`}
                  className="max-h-80 w-auto mx-auto rounded-xl object-contain shadow-2xs"
                />
                <button
                  type="button"
                  onClick={() => setZoomImageSrc(currentQ.questionImagePath || null)}
                  className="absolute top-4 right-4 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900/80 hover:bg-slate-900 text-white text-xs font-semibold backdrop-blur-xs shadow-md transition-opacity"
                  title="Phóng to ảnh"
                >
                  <ZoomIn className="w-3.5 h-3.5" />
                  <span>Phóng to</span>
                </button>
              </div>
            </div>
          )}

          {/* Linked Passage Editor (Requirement 6 & 7) */}
          {currentPassage && (
            <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100 gap-2">
                <div className="space-y-0.5">
                  <span className="text-xs font-bold text-emerald-800 uppercase tracking-wider flex items-center gap-1.5">
                    <BookOpen className="w-4 h-4 text-emerald-600" />
                    <span>Bài đọc ({currentPassage.id})</span>
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <select
                    value={currentPassage.reviewStatus || "needs_review"}
                    onChange={(e) =>
                      updatePassage(currentPassage.id, {
                        reviewStatus: e.target.value as "verified" | "needs_review",
                      })
                    }
                    className={`text-[11px] font-bold px-2 py-1 rounded-lg border ${
                      currentPassage.reviewStatus === "verified"
                        ? "bg-emerald-50 text-emerald-800 border-emerald-300"
                        : "bg-amber-50 text-amber-800 border-amber-300"
                    }`}
                  >
                    <option value="needs_review">Cần kiểm chứng (needs_review)</option>
                    <option value="verified">Đã kiểm chứng (verified)</option>
                  </select>
                  <span
                    className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${
                      currentPassage.text?.trim()
                        ? "bg-emerald-100 text-emerald-800"
                        : "bg-amber-100 text-amber-800"
                    }`}
                  >
                    {currentPassage.text?.trim() ? "Đã có chữ" : "Chưa có chữ"}
                  </span>
                </div>
              </div>

              {/* Passage Title */}
              <div className="space-y-1 text-xs">
                <label className="font-semibold text-slate-700">Tiêu đề bài đọc</label>
                <input
                  type="text"
                  value={currentPassage.title || ""}
                  placeholder="Ví dụ: 文章・読解 (ごはん？ ライス？)"
                  onChange={(e) => updatePassage(currentPassage.id, { title: e.target.value })}
                  className="w-full p-2 rounded-xl border border-slate-200 text-xs"
                />
              </div>

              {/* Passage Text Textarea (Editable) */}
              <div className="space-y-1 text-xs">
                <label className="font-semibold text-slate-700">Nội dung văn bản tiếng Nhật</label>
                <textarea
                  value={currentPassage.text || ""}
                  onChange={(e) => updatePassage(currentPassage.id, { text: e.target.value })}
                  rows={8}
                  placeholder="Dán hoặc chỉnh sửa toàn bộ văn bản tiếng Nhật của bài đọc tại đây..."
                  className="w-full p-3 rounded-2xl border border-slate-200 font-japanese text-sm leading-relaxed focus:outline-none focus:border-indigo-500"
                />
              </div>

              {/* Passage Multi-page Scanned Images (Requirement 7) */}
              {passageImages.length > 0 && (
                <div className="space-y-3 pt-2 border-t border-slate-100">
                  <div className="text-xs font-bold text-slate-700 flex items-center justify-between">
                    <span>Ảnh quét gốc bài đọc ({passageImages.length} trang)</span>
                  </div>
                  <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
                    {passageImages.map((imgSrc, pIdx) => (
                      <div key={imgSrc} className="relative rounded-2xl border border-slate-200 bg-slate-50 p-2">
                        <div className="text-[11px] font-semibold text-slate-500 mb-1 px-1 flex items-center justify-between">
                          <span>Trang {pIdx + 1} / {passageImages.length}</span>
                          <span className="font-mono text-[10px] text-slate-400">{imgSrc.split("/").pop()}</span>
                        </div>
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={imgSrc}
                          alt={`Ảnh bài đọc trang ${pIdx + 1}`}
                          className="max-h-64 w-auto mx-auto rounded-xl object-contain shadow-2xs"
                        />
                        <button
                          type="button"
                          onClick={() => setZoomImageSrc(imgSrc)}
                          className="absolute top-8 right-4 inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-slate-900/80 hover:bg-slate-900 text-white text-[11px] font-semibold backdrop-blur-xs shadow-md"
                          title="Phóng to"
                        >
                          <ZoomIn className="w-3 h-3" />
                          <span>Phóng to</span>
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

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

          {/* Raw Text Preview if present */}
          {rawTextPreview && (
            <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <h3 className="font-bold text-slate-800 text-sm flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-indigo-600" />
                  <span>Văn bản trích xuất nguồn</span>
                </h3>
              </div>
              <div className="max-h-60 overflow-y-auto font-japanese text-xs text-slate-700 p-3.5 rounded-2xl bg-slate-50 border border-slate-100 whitespace-pre-wrap leading-relaxed">
                {rawTextPreview}
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
                const hasText = Boolean(q.questionText && q.questionText.trim().length > 0);
                const hasCorrect = Boolean(q.correctOptionId);
                const isVerified = q.review.status === "verified";

                let pillStyle = "bg-slate-100 text-slate-700 hover:bg-slate-200";
                if (isSelected) {
                  pillStyle = "bg-indigo-600 text-white ring-2 ring-indigo-600 ring-offset-1";
                } else if (!hasText) {
                  pillStyle = "bg-rose-100 text-rose-800 hover:bg-rose-200";
                } else if (!hasCorrect || !isVerified) {
                  pillStyle = "bg-amber-100 text-amber-800 hover:bg-amber-200";
                } else {
                  pillStyle = "bg-emerald-100 text-emerald-800 hover:bg-emerald-200";
                }

                return (
                  <button
                    key={q.id}
                    type="button"
                    onClick={() => setActiveQuestionIdx(idx)}
                    className={`w-8 h-8 rounded-xl text-xs font-bold transition-all flex items-center justify-center ${pillStyle}`}
                    title={`Câu ${idx + 1}: ${hasText ? "Có chữ" : "Chưa có chữ"} • ${
                      hasCorrect ? `Đáp án [${q.correctOptionId}]` : "Chưa có đáp án"
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

              {/* Question Text (Editable) */}
              <div className="space-y-1.5">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <label className="text-xs font-bold text-slate-800 block">
                    Nội dung câu hỏi tiếng Nhật
                  </label>
                  <div className="flex items-center gap-2">
                    {!currentQ.questionText?.trim() && (
                      <span className="text-[11px] text-amber-700 font-bold bg-amber-50 px-2 py-0.5 rounded border border-amber-300">
                        Chưa có văn bản chữ
                      </span>
                    )}
                    {(currentQ.questionImagePath || passageImages.length > 0) && (
                      <button
                        type="button"
                        onClick={() =>
                          setZoomImageSrc(currentQ.questionImagePath || passageImages[0] || null)
                        }
                        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 text-xs font-bold transition-colors"
                        title="Mở xem ảnh nguồn trang PDF gốc"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>Xem ảnh nguồn</span>
                      </button>
                    )}
                  </div>
                </div>
                <textarea
                  value={currentQ.questionText}
                  onChange={(e) => updateQuestion({ ...currentQ, questionText: e.target.value })}
                  rows={3}
                  placeholder="Nhập hoặc chỉnh sửa văn bản tiếng Nhật của câu hỏi..."
                  className="w-full p-3 rounded-2xl border border-slate-200 font-japanese text-base leading-relaxed focus:outline-none focus:border-indigo-500"
                />
              </div>

              {/* Options & Correct Option Selector (Editable) */}
              <div className="space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <label className="text-xs font-bold text-slate-800">
                      Các lựa chọn & Đáp án đúng
                    </label>
                    {!currentQ.correctOptionId && (
                      <span className="text-[11px] font-bold text-amber-800 bg-amber-100 px-2 py-0.5 rounded-full border border-amber-300 flex items-center gap-1">
                        <AlertTriangle className="w-3 h-3 text-amber-700" />
                        <span>Chưa xác minh đáp án</span>
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2 text-xs">
                    <span className="text-slate-500">Đáp án đúng:</span>
                    <select
                      value={currentQ.correctOptionId || ""}
                      onChange={(e) =>
                        updateQuestion({
                          ...currentQ,
                          correctOptionId: e.target.value || null,
                          review: {
                            ...currentQ.review,
                            status: e.target.value ? "verified" : "needs_review",
                          },
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
                              isCorrect
                                ? "bg-emerald-600 text-white"
                                : "bg-slate-200 text-slate-700"
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
                                explanation: {
                                  ...currentQ.explanation,
                                  optionReasonsVi: newReasons,
                                },
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
                  <label className="font-bold text-slate-700">Tóm tắt giải thích (Summary)</label>
                  <input
                    type="text"
                    value={currentQ.explanation.summaryVi || ""}
                    onChange={(e) =>
                      updateQuestion({
                        ...currentQ,
                        explanation: { ...currentQ.explanation, summaryVi: e.target.value },
                      })
                    }
                    placeholder="Tóm tắt ngắn gọn quy tắc hoặc lý do chọn đáp án..."
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
                        explanation: {
                          ...currentQ.explanation,
                          correctReasonVi: e.target.value,
                        },
                      })
                    }
                    rows={2}
                    className="w-full p-2.5 rounded-xl border border-slate-200"
                  />
                </div>
              </div>

              {/* Translation VI & Study Tip */}
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
                    rows={2}
                    className="w-full p-2.5 rounded-xl border border-slate-200"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-700">Mẹo nhận diện (Study Tip)</label>
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
            </div>
          )}
        </div>
      </div>

      {/* Image Modal */}
      {zoomImageSrc && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/80 backdrop-blur-sm"
          onClick={() => setZoomImageSrc(null)}
        >
          <div
            className="relative max-w-5xl max-h-[92vh] bg-white rounded-3xl p-3 sm:p-5 shadow-2xl overflow-auto border border-slate-700"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 mb-2 border-b border-slate-100">
              <h3 className="font-bold text-slate-900 text-sm font-mono">
                {zoomImageSrc.split("/").pop()}
              </h3>
              <button
                type="button"
                onClick={() => setZoomImageSrc(null)}
                className="px-3 py-1 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold"
              >
                Đóng (ESC)
              </button>
            </div>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={zoomImageSrc}
              alt="Ảnh phóng to"
              className="w-full h-auto max-h-[80vh] object-contain mx-auto rounded-xl"
            />
          </div>
        </div>
      )}
    </div>
  );
}
