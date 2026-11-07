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
  const [activeTab, setActiveTab] = useState<"validate" | "preview" | "prompts">("validate");
  const [copiedPromptKey, setCopiedPromptKey] = useState<string | null>(null);

  const mainPromptText = `Bạn đóng vai biên tập viên học liệu JLPT N3 và kỹ sư chuẩn hóa dữ liệu. Tôi gửi kèm:
- (A) File nguồn: PDF / DOCX / ảnh của một hoặc nhiều đề trắc nghiệm.
- (B) File đáp án gốc, nếu có.
- (C) File chuẩn exam-template.json chứa cấu trúc JSON website hỗ trợ.

Mục tiêu: Trích xuất trung thực câu hỏi từ A, đối chiếu đáp án từ B và xuất một hoặc nhiều file .json hợp lệ tuân thủ đúng cấu trúc của C. Website không có phần nghe hiểu.

Nguyên tắc KHÔNG ĐƯỢC VI PHẠM:
1. KHÔNG tự thêm câu hỏi mới, KHÔNG tự sửa bản gốc để câu trông hay hơn, KHÔNG thay đổi thứ tự câu hoặc lựa chọn.
2. Giữ nguyên ký tự tiếng Nhật, Kanji, kana, dấu câu, ký hiệu ＿＿ và bố cục ngữ cảnh. Nếu câu thuộc đoạn đọc hiểu, tạo passages[] và liên kết passageId, không lặp lại passage trong mỗi câu.
3. Chỉ xử lý vocabulary / grammar / reading; loại bỏ listening hoặc ghi báo cáo số câu đã loại.
4. Nếu nguồn có hình ảnh/bảng quan trọng mà không thể biểu diễn chính xác bằng text, báo rõ ảnh nào phải giữ làm asset; không phỏng đoán dữ liệu.
5. Đáp án chính xác lấy từ đáp án gốc nếu có. Nếu thiếu đáp án gốc hoặc câu khó xác minh, bạn có thể đề xuất đáp án để tôi rà soát nhưng phải đánh dấu câu review.status = "needs_review", ghi vấn đề vào review.notes; không bao giờ coi đáp án suy đoán là đã xác minh. Với câu không thể xác định, đặt correctOptionId = null và giữ trạng thái draft.
6. Mỗi câu cần explanation tiếng Việt: summaryVi, correctReasonVi, optionReasonsVi cho từng lựa chọn, translationVi, vocabulary[] gồm word, reading, meaningVi, grammarPoints[] nếu có, readingEvidenceJa nếu là đọc hiểu, studyTipVi.
7. Giải thích vì sao đáp án đúng và vì sao từng phương án còn lại sai. Nếu chưa có đủ thông tin để giải thích chắc chắn, ghi rõ trong review.notes, không bịa lập luận.
8. Ở từ vựng lời giải, ghi cách đọc hiragana; KHÔNG chèn furigana khiến phần đề kiểm tra cách đọc Kanji bị lộ đáp án.
9. Gán id đề và câu duy nhất và ổn định: n3-<bo-de>-q001, q002, ...; section chỉ thuộc vocabulary, grammar, reading; subtype theo dạng thực tế.
10. Mặc định xuất status = "draft", source.reviewedByHuman = false và review.status = "needs_review" cho đến khi tôi duyệt. Không tự đổi sang published.
11. Đảm bảo questionCount khớp questions.length; mọi option.id là duy nhất trong câu; correctOptionId (nếu không null) phải trùng một option.
12. Không chèn Markdown code fence vào nội dung file JSON. Giữ schema giống exam-template.json; giữ null thực sự (không phải chuỗi "null").

Phương pháp xử lý:
Bước 1 — Trích xuất: Đọc toàn bộ file nguồn, liệt kê số đề, trang, phần, số câu, số lựa chọn, tình trạng file đáp án. Đánh dấu phần không đọc chắc chắn.
Bước 2 — Chuẩn hóa: Chuyển câu hỏi thành JSON theo file mẫu; dùng passages[] với bài đọc; giữ tất cả câu, không bỏ lặng lẽ.
Bước 3 — Phân tích: Với mỗi câu đủ dữ liệu, giải thích đáp án bằng tiếng Việt dễ hiểu mức dưới/N3; giải thích cả lựa chọn sai; thêm từ vựng có furigana và ví dụ ngữ pháp nếu phù hợp.
Bước 4 — Kiểm tra: Kiểm tra JSON parse được; ID trùng; câu thiếu option; đáp án nằm ngoài options; section; count; liên kết passage; câu thiếu lời giải. Tạo danh sách needs_review có số câu và lý do cụ thể.
Bước 5 — Xuất file:
- Tạo file .json có thể tải về; nếu có nhiều đề, mỗi đề là một file riêng. Với nguồn dài, chia theo đề/nhóm đủ nhỏ để tránh mất dữ liệu.
- Kèm báo cáo biên tập ngắn: số câu được nhập, số câu được loại vì nghe, số câu thiếu đáp án, số câu cần xem lại, ảnh cần đính kèm.
- Nếu không thể tạo file tải về trong phiên này, cung cấp JSON thuần ở từng phần, không xen giải thích vào nội dung JSON.

Yêu cầu cuối: Chỉ được kết luận "đã chuyển đủ câu" khi kiểm đếm giữa file gốc và JSON khớp thực tế.`;

  const reviewPromptText = `Tôi gửi file đề gốc, đáp án gốc (nếu có) và file JSON do AI tạo. Hãy đóng vai kiểm duyệt độc lập:
1. So sánh từng câu tiếng Nhật, từng option, đáp án và đoạn đọc hiểu với file nguồn.
2. Tạo bảng lỗi theo ID câu: loại lỗi, dữ liệu gốc, dữ liệu JSON, mức độ nghiêm trọng, sửa đề xuất.
3. Phân biệt lỗi trích xuất, lỗi đáp án, lỗi giải thích và lỗi dịch nghĩa.
4. Không tự sửa nội dung nghi ngờ khi không đủ căn cứ; đánh dấu needs_review.
5. Xuất file JSON đã sửa; KHÔNG tự đặt source.reviewedByHuman=true hoặc công bố đề.`;

  const publishPromptText = `Tôi đã đối chiếu và xác nhận các câu sau với nguồn và đáp án: [DANH SÁCH ID]. Hãy đổi review.status của đúng những câu đó thành verified. Chỉ đổi status của cả đề thành published và source.reviewedByHuman=true khi TẤT CẢ các câu đã được tôi xác nhận, không còn needs_review, đủ đáp án và lời giải. Giữ nguyên ID đề và ID câu.`;

  const handleCopyPrompt = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedPromptKey(key);
    setTimeout(() => setCopiedPromptKey(null), 2000);
  };

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

        <button
          onClick={() => setActiveTab("prompts")}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === "prompts"
              ? "bg-indigo-600 text-white"
              : "text-slate-600 hover:bg-slate-100"
          }`}
        >
          <Copy className="w-4 h-4" />
          <span>3. Mẫu Prompt AI Chuyển Đề (ChatGPT)</span>
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

      {/* Prompts Tab */}
      {activeTab === "prompts" && (
        <div className="space-y-8">
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-4">
            <h2 className="text-xl font-bold text-slate-900">
              Quy Trình & Mẫu Prompt Chuẩn Hóa Đề Thi Qua AI
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              Sử dụng các prompt được thiết kế theo tiêu chuẩn sư phạm và kỹ thuật bên dưới khi gửi file PDF / Word / Ảnh đề thi cho ChatGPT hoặc Claude để nhận về file JSON chuẩn xác 100%.
            </p>

            {/* Steps Guide */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs space-y-1.5">
                <span className="font-bold text-indigo-600 block">Bước 1: Chuẩn bị</span>
                <p className="text-slate-600">
                  Tải lên file đề gốc (PDF/ảnh) và đính kèm file <code className="bg-slate-200 px-1 rounded">exam-template.json</code>.
                </p>
              </div>
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs space-y-1.5">
                <span className="font-bold text-indigo-600 block">Bước 2: Gửi Prompt</span>
                <p className="text-slate-600">
                  Copy prompt chính số 1 dán vào AI. AI sẽ xuất file JSON tuân thủ Schema 1.0.0.
                </p>
              </div>
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs space-y-1.5">
                <span className="font-bold text-indigo-600 block">Bước 3: Thẩm định & Lưu</span>
                <p className="text-slate-600">
                  Dán JSON vào tab Thẩm định trên trang này, kiểm tra lỗi rồi lưu vào <code className="bg-slate-200 px-1 rounded">public/data/exams/</code>.
                </p>
              </div>
            </div>
          </div>

          {/* Prompt 1 */}
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-100">
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  1. Prompt hoàn chỉnh — Copy và gửi ChatGPT / Claude
                </h3>
                <p className="text-xs text-slate-500">
                  Áp dụng 12 nguyên tắc không vi phạm, xuất JSON và báo cáo kiểm đếm
                </p>
              </div>
              <button
                onClick={() => handleCopyPrompt(mainPromptText, "main")}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 text-white text-xs font-semibold hover:bg-indigo-700 shadow-sm transition-colors"
              >
                <Copy className="w-3.5 h-3.5" />
                <span>{copiedPromptKey === "main" ? "Đã sao chép!" : "Copy Prompt 1"}</span>
              </button>
            </div>
            <pre className="p-4 rounded-2xl bg-slate-900 text-slate-100 font-mono text-xs whitespace-pre-wrap leading-relaxed max-h-96 overflow-y-auto">
              {mainPromptText}
            </pre>
          </div>

          {/* Prompt 2 */}
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-100">
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  2. Prompt kiểm duyệt lần hai (Independent Verification)
                </h3>
                <p className="text-xs text-slate-500">
                  Yêu cầu AI đối chiếu chéo lại với file gốc để phát hiện sai sót trích xuất
                </p>
              </div>
              <button
                onClick={() => handleCopyPrompt(reviewPromptText, "review")}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-900 text-white text-xs font-semibold hover:bg-slate-800 shadow-sm transition-colors"
              >
                <Copy className="w-3.5 h-3.5" />
                <span>{copiedPromptKey === "review" ? "Đã sao chép!" : "Copy Prompt 2"}</span>
              </button>
            </div>
            <pre className="p-4 rounded-2xl bg-slate-900 text-slate-100 font-mono text-xs whitespace-pre-wrap leading-relaxed">
              {reviewPromptText}
            </pre>
          </div>

          {/* Prompt 3 */}
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-100">
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  3. Prompt xuất bản sau khi người quản trị tự duyệt
                </h3>
                <p className="text-xs text-slate-500">
                  Chuyển trạng thái từ draft sang published và verified
                </p>
              </div>
              <button
                onClick={() => handleCopyPrompt(publishPromptText, "publish")}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 text-white text-xs font-semibold hover:bg-emerald-700 shadow-sm transition-colors"
              >
                <Copy className="w-3.5 h-3.5" />
                <span>{copiedPromptKey === "publish" ? "Đã sao chép!" : "Copy Prompt 3"}</span>
              </button>
            </div>
            <pre className="p-4 rounded-2xl bg-slate-900 text-slate-100 font-mono text-xs whitespace-pre-wrap leading-relaxed">
              {publishPromptText}
            </pre>
          </div>
        </div>
      )}
    </div>
  );
}

