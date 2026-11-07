"use client";

import React, { useState } from "react";
import Link from "next/link";
import { ExamDetail, ExamQuestion } from "@/lib/types";
import { AnswerExplanation } from "@/components/AnswerExplanation";
import { PassageViewer } from "@/components/PassageViewer";
import {
  Upload,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  FileText,
  Download,
  Copy,
  ArrowLeft,
  Eye,
  ShieldCheck,
  RefreshCw,
} from "lucide-react";

interface ValidationError {
  type: "error" | "warning";
  message: string;
}

export default function AdminImportPage() {
  const [jsonInput, setJsonInput] = useState<string>("");
  const [parsedExam, setParsedExam] = useState<ExamDetail | null>(null);
  const [validationErrors, setValidationErrors] = useState<ValidationError[]>([]);
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<"validate" | "preview">("validate");

  const validateJson = (rawString: string) => {
    const errors: ValidationError[] = [];

    if (!rawString.trim()) {
      setValidationErrors([]);
      setParsedExam(null);
      return;
    }

    let data: any;
    try {
      data = JSON.parse(rawString);
    } catch (err: any) {
      setValidationErrors([{ type: "error", message: `Lỗi cú pháp JSON: ${err.message}` }]);
      setParsedExam(null);
      return;
    }

    // 1. Check Schema Version
    if (data.schemaVersion !== "1.0.0") {
      errors.push({ type: "error", message: `schemaVersion phải là "1.0.0" (hiện tại: ${data.schemaVersion})` });
    }

    // 2. Check metadata
    if (!data.id || typeof data.id !== "string") {
      errors.push({ type: "error", message: "Thiếu trường `id` của bộ đề hoặc không đúng định dạng chuỗi" });
    }
    if (!data.title) {
      errors.push({ type: "error", message: "Thiếu tiêu đề `title` của đề thi" });
    }
    if (data.level !== "N3") {
      errors.push({ type: "error", message: `level phải là "N3" (hiện tại: ${data.level})` });
    }
    if (!["draft", "published"].includes(data.status)) {
      errors.push({ type: "error", message: `status phải là "draft" hoặc "published" (hiện tại: ${data.status})` });
    }
    if (!data.settings || typeof data.settings.timeLimitMinutes !== "number") {
      errors.push({ type: "error", message: "Thiếu `settings.timeLimitMinutes`" });
    }

    // 3. Questions validation
    if (!Array.isArray(data.questions)) {
      errors.push({ type: "error", message: "`questions` phải là một danh sách mảng" });
    } else {
      if (data.questionCount !== data.questions.length) {
        errors.push({
          type: "warning",
          message: `questionCount (${data.questionCount}) không khớp số câu thực tế (${data.questions.length})`,
        });
      }

      const passageSet = new Set(data.passages?.map((p: any) => p.id) || []);
      const questionIdSet = new Set<string>();

      data.questions.forEach((q: ExamQuestion, idx: number) => {
        const prefix = `Câu ${q.number || idx + 1} (id: ${q.id || "trống"})`;

        if (!q.id) {
          errors.push({ type: "error", message: `${prefix}: Thiếu id câu hỏi` });
        } else if (questionIdSet.has(q.id)) {
          errors.push({ type: "error", message: `${prefix}: Trùng lặp id câu hỏi "${q.id}"` });
        } else {
          questionIdSet.add(q.id);
        }

        if (!["vocabulary", "grammar", "reading"].includes(q.section)) {
          errors.push({ type: "error", message: `${prefix}: section không hợp lệ ("${q.section}")` });
        }

        if (!q.questionText) {
          errors.push({ type: "error", message: `${prefix}: Thiếu nội dung câu hỏi (questionText)` });
        }

        if (!Array.isArray(q.options) || q.options.length < 2) {
          errors.push({ type: "error", message: `${prefix}: Phải có ít nhất 2 lựa chọn (options)` });
        } else {
          const optIds = q.options.map((o) => String(o.id));
          if (!optIds.includes(String(q.correctOptionId))) {
            errors.push({
              type: "error",
              message: `${prefix}: correctOptionId "${q.correctOptionId}" không nằm trong options [${optIds.join(", ")}]`,
            });
          }

          // Check options reasons
          if (!q.explanation || !q.explanation.optionReasonsVi) {
            errors.push({ type: "error", message: `${prefix}: Thiếu explanation.optionReasonsVi` });
          } else {
            optIds.forEach((id) => {
              if (!q.explanation.optionReasonsVi[id]) {
                errors.push({
                  type: "error",
                  message: `${prefix}: Thiếu giải thích tiếng Việt cho lựa chọn ID "${id}"`,
                });
              }
            });
          }
        }

        // Check passage reference
        if (q.passageId && !passageSet.has(q.passageId)) {
          errors.push({
            type: "error",
            message: `${prefix}: passageId "${q.passageId}" không tồn tại trong danh sách passages`,
          });
        }

        // Check verification for published
        if (data.status === "published" && (!q.review || q.review.status !== "verified")) {
          errors.push({
            type: "warning",
            message: `${prefix}: Đề ở trạng thái published nhưng câu hỏi chưa được verified`,
          });
        }
      });
    }

    setValidationErrors(errors);
    if (errors.filter((e) => e.type === "error").length === 0) {
      setParsedExam(data as ExamDetail);
    } else {
      setParsedExam(null);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      setJsonInput(content);
      validateJson(content);
    };
    reader.readAsText(file);
  };

  const handleDownload = () => {
    if (!parsedExam) return;
    const blob = new Blob([JSON.stringify(parsedExam, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${parsedExam.id || "exam"}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleCopy = () => {
    if (!jsonInput) return;
    navigator.clipboard.writeText(jsonInput);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const errorCount = validationErrors.filter((e) => e.type === "error").length;
  const warningCount = validationErrors.filter((e) => e.type === "warning").length;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <Link
            href="/admin"
            className="inline-flex items-center gap-1 text-xs font-semibold text-slate-500 hover:text-slate-800 transition-colors mb-2"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Quay lại Admin Portal</span>
          </Link>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
            Thẩm Định & Nhập Đề Thi Mới
          </h1>
          <p className="text-sm text-slate-600 mt-1">
            Kiểm tra tính hợp lệ của file JSON theo chuẩn Schema 1.0.0 trước khi đưa vào thư mục `public/data/exams/`
          </p>
        </div>

        {/* Action Buttons */}
        {parsedExam && (
          <div className="flex items-center gap-2">
            <button
              onClick={handleCopy}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
            >
              <Copy className="w-4 h-4 text-slate-500" />
              <span>{copied ? "Đã copy!" : "Copy JSON"}</span>
            </button>
            <button
              onClick={handleDownload}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 text-white text-xs font-semibold hover:bg-indigo-700 transition-colors shadow-sm"
            >
              <Download className="w-4 h-4" />
              <span>Tải file {parsedExam.id}.json</span>
            </button>
          </div>
        )}
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
        <button
          onClick={() => setActiveTab("validate")}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === "validate"
              ? "bg-indigo-600 text-white"
              : "text-slate-600 hover:bg-slate-100"
          }`}
        >
          <Upload className="w-4 h-4" />
          <span>1. Nhập & Thẩm định JSON</span>
        </button>

        <button
          disabled={!parsedExam}
          onClick={() => setActiveTab("preview")}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === "preview"
              ? "bg-indigo-600 text-white"
              : "text-slate-600 hover:bg-slate-100 disabled:opacity-40"
          }`}
        >
          <Eye className="w-4 h-4" />
          <span>2. Xem trước giao diện thực tế (Live Preview)</span>
        </button>
      </div>

      {activeTab === "validate" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* JSON Textarea & File Upload */}
          <div className="lg:col-span-7 bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <label className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <FileText className="w-4 h-4 text-indigo-600" />
                <span>Nội dung file JSON đề thi</span>
              </label>

              <label className="cursor-pointer inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition-colors">
                <Upload className="w-3.5 h-3.5 text-slate-500" />
                <span>Tải file .json từ máy</span>
                <input
                  type="file"
                  accept=".json"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </label>
            </div>

            <textarea
              value={jsonInput}
              onChange={(e) => {
                setJsonInput(e.target.value);
                validateJson(e.target.value);
              }}
              rows={22}
              placeholder="Dán mã JSON đề thi vào đây hoặc chọn file từ máy..."
              className="w-full font-mono text-xs p-4 rounded-2xl border border-slate-200 bg-slate-50/50 text-slate-800 focus:outline-none focus:border-indigo-500 focus:bg-white resize-y"
            />

            <div className="flex items-center justify-between text-xs text-slate-500">
              <span>Độ dài: {jsonInput.length} ký tự</span>
              <button
                type="button"
                onClick={() => validateJson(jsonInput)}
                className="inline-flex items-center gap-1 font-semibold text-indigo-600 hover:text-indigo-800"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Kiểm tra lại</span>
              </button>
            </div>
          </div>

          {/* Validation Report Card */}
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
              <h3 className="font-bold text-slate-900 text-base">Kết quả kiểm tra Schema</h3>

              {!jsonInput.trim() ? (
                <div className="py-12 text-center text-slate-400 text-xs">
                  Vui lòng nhập hoặc tải file JSON để bắt đầu thẩm định.
                </div>
              ) : errorCount === 0 ? (
                <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 space-y-2">
                  <div className="flex items-center gap-2 text-emerald-800 font-bold text-sm">
                    <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                    <span>File JSON hợp lệ 100%!</span>
                  </div>
                  <p className="text-xs text-emerald-700 leading-relaxed">
                    Bộ đề đáp ứng đầy đủ tiêu chuẩn Schema Version 1.0.0. Đã có thể lưu vào thư mục <code className="bg-emerald-100 px-1 rounded">public/data/exams/{parsedExam?.id}.json</code>.
                  </p>
                </div>
              ) : (
                <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 space-y-2">
                  <div className="flex items-center gap-2 text-rose-800 font-bold text-sm">
                    <XCircle className="w-5 h-5 text-rose-600" />
                    <span>Phát hiện {errorCount} lỗi bắt buộc cần sửa</span>
                  </div>
                  <p className="text-xs text-rose-700 leading-relaxed">
                    Đề thi có lỗi không thể công bố. Vui lòng xem danh sách chi tiết bên dưới để khắc phục.
                  </p>
                </div>
              )}

              {/* Error / Warning List */}
              {validationErrors.length > 0 && (
                <div className="space-y-2 pt-2">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                    Chi tiết thông báo ({validationErrors.length})
                  </h4>
                  <div className="max-h-80 overflow-y-auto space-y-2 pr-1">
                    {validationErrors.map((err, i) => (
                      <div
                        key={i}
                        className={`p-3 rounded-xl text-xs flex items-start gap-2.5 border ${
                          err.type === "error"
                            ? "bg-rose-50/60 border-rose-200 text-rose-900"
                            : "bg-amber-50/60 border-amber-200 text-amber-900"
                        }`}
                      >
                        {err.type === "error" ? (
                          <XCircle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                        ) : (
                          <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                        )}
                        <span className="leading-relaxed">{err.message}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Instructions */}
              <div className="pt-4 border-t border-slate-100 text-xs text-slate-500 space-y-2">
                <span className="font-bold text-slate-700 block">Các bước đưa đề vào website:</span>
                <ol className="list-decimal list-inside space-y-1 leading-relaxed">
                  <li>Tải file <code className="text-indigo-600">[id].json</code> về máy.</li>
                  <li>Copy file vào thư mục <code className="bg-slate-100 px-1 py-0.5 rounded">public/data/exams/</code>.</li>
                  <li>Chạy lệnh <code className="bg-slate-100 px-1 py-0.5 rounded">npm run exams:sync</code>.</li>
                </ol>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Live Preview Tab */}
      {activeTab === "preview" && parsedExam && (
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-3">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold px-3 py-1 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200">
                {parsedExam.level}
              </span>
              <span className="text-xs font-semibold px-3 py-1 rounded-full bg-slate-100 text-slate-700">
                {parsedExam.questions.length} câu hỏi
              </span>
              <span className="text-xs font-semibold px-3 py-1 rounded-full bg-slate-100 text-slate-700">
                {parsedExam.settings.timeLimitMinutes} phút
              </span>
            </div>
            <h2 className="text-2xl font-bold text-slate-900">{parsedExam.title}</h2>
            <p className="text-sm text-slate-600">{parsedExam.description}</p>
          </div>

          {/* Passages if any */}
          {parsedExam.passages?.map((p) => (
            <div key={p.id}>
              <PassageViewer passage={p} />
            </div>
          ))}

          {/* Preview Questions */}
          <div className="space-y-6">
            {parsedExam.questions.map((q, idx) => (
              <div
                key={q.id}
                className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-6"
              >
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-900 text-base">Câu {idx + 1}</span>
                    <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700">
                      {q.section}
                    </span>
                    <span className="text-xs text-slate-500 font-medium">{q.subtype}</span>
                  </div>
                  <span className="text-xs text-emerald-700 font-bold bg-emerald-50 px-2 py-1 rounded-md border border-emerald-200">
                    Đáp án đúng: [{q.correctOptionId}]
                  </span>
                </div>

                <p className="font-japanese text-xl text-slate-900 leading-[1.8]">
                  {q.questionText}
                </p>

                {/* Answer Explanation Preview */}
                <AnswerExplanation
                  question={q}
                  selectedOptionId={q.correctOptionId}
                />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
