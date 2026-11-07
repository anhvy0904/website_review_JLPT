"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { ExamDetail } from "@/lib/types";
import { AdminReviewEditor } from "@/components/AdminReviewEditor";
import { GeminiConnectionChecker } from "@/components/GeminiConnectionChecker";
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
  Sparkles,
  Key,
  Loader2,
  FileCode,
  FileUp,
  Edit3,
} from "lucide-react";

export default function AdminImportPage() {
  const [activeTab, setActiveTab] = useState<"ai_upload" | "review" | "manual_json" | "prompts">("ai_upload");

  // AI Upload States (Module 1)
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [answerKeyText, setAnswerKeyText] = useState("");
  const [customApiKey, setCustomApiKey] = useState("");
  const [isExtracting, setIsExtracting] = useState(false);
  const [extractError, setExtractError] = useState<string | null>(null);
  const [rawTextPreview, setRawTextPreview] = useState("");

  // Exam Data & Validation
  const [examData, setExamData] = useState<ExamDetail | null>(null);
  const [jsonInput, setJsonInput] = useState("");
  const [manualValidationErrors, setManualValidationErrors] = useState<string[]>([]);
  const [copiedPromptKey, setCopiedPromptKey] = useState<string | null>(null);

  // Load custom API key from localStorage if saved
  useEffect(() => {
    const savedKey = localStorage.getItem("jlpt_gemini_api_key");
    if (savedKey) setCustomApiKey(savedKey);
  }, []);

  const handleSaveApiKey = (key: string) => {
    setCustomApiKey(key);
    localStorage.setItem("jlpt_gemini_api_key", key);
  };

  // Handler: Run Module 1 AI Extraction
  const handleStartAIExtraction = async () => {
    if (!uploadedFile) {
      setExtractError("Vui lòng chọn một file đề thi (PDF, DOCX, JPG, PNG).");
      return;
    }

    setIsExtracting(true);
    setExtractError(null);

    try {
      const formData = new FormData();
      formData.append("file", uploadedFile);
      if (answerKeyText.trim()) {
        formData.append("answerKeyText", answerKeyText.trim());
      }
      if (customApiKey.trim()) {
        formData.append("customApiKey", customApiKey.trim());
      }

      const adminSecret =
        typeof window !== "undefined"
          ? localStorage.getItem("jlpt_admin_secret") || "admin123"
          : "admin123";

      const res = await fetch("/api/admin/ai/import", {
        method: "POST",
        headers: {
          "x-admin-secret": adminSecret,
        },
        body: formData,
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Không thể phân tích tài liệu qua AI");
      }

      setExamData(data.exam);
      setRawTextPreview(data.rawTextPreview || "");
      setJsonInput(JSON.stringify(data.exam, null, 2));
      setActiveTab("review"); // Automatically switch to Review Editor (Module 3)
    } catch (err: any) {
      setExtractError(err.message || "Lỗi xử lý file với Gemini AI");
    } finally {
      setIsExtracting(false);
    }
  };

  // Manual JSON Validation
  const handleValidateManualJson = (text: string) => {
    setJsonInput(text);
    if (!text.trim()) {
      setManualValidationErrors([]);
      setExamData(null);
      return;
    }

    try {
      const parsed = JSON.parse(text);
      setExamData(parsed);
      setManualValidationErrors([]);
    } catch (err: any) {
      setManualValidationErrors([`Lỗi cú pháp JSON: ${err.message}`]);
    }
  };

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
12. Không chèn Markdown code fence vào nội dung file JSON. Giữ schema giống exam-template.json; giữ null thực sự (không phải chuỗi "null").`;

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

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <Link
            href="/admin"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800 transition-colors mb-2"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Quay lại Admin Portal</span>
          </Link>
          <div className="flex items-center gap-2">
            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
              AI Exam Importer & Kiểm Duyệt Đề
            </h1>
            <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-purple-100 text-purple-800 border border-purple-200">
              Google Gemini Powered
            </span>
          </div>
          <p className="text-sm text-slate-600 mt-1">
            Tự động trích xuất đề từ PDF/DOCX/Ảnh, sinh lời giải chi tiết và kiểm duyệt trước khi xuất bản
          </p>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex flex-wrap items-center gap-2 border-b border-slate-200 pb-2">
        <button
          onClick={() => setActiveTab("ai_upload")}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
            activeTab === "ai_upload"
              ? "bg-purple-600 text-white shadow-sm"
              : "text-slate-600 hover:bg-slate-100"
          }`}
        >
          <Sparkles className="w-4 h-4" />
          <span>1. AI Tự Động Nhập Đề (PDF/DOCX/Ảnh)</span>
        </button>

        <button
          disabled={!examData}
          onClick={() => setActiveTab("review")}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
            activeTab === "review"
              ? "bg-indigo-600 text-white shadow-sm"
              : "text-slate-600 hover:bg-slate-100 disabled:opacity-40"
          }`}
        >
          <Edit3 className="w-4 h-4" />
          <span>2. Kiểm Duyệt & Biên Tập (Admin Review)</span>
          {examData && (
            <span className="w-2 h-2 rounded-full bg-emerald-400 inline-block animate-pulse" />
          )}
        </button>

        <button
          onClick={() => setActiveTab("manual_json")}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
            activeTab === "manual_json"
              ? "bg-slate-900 text-white shadow-sm"
              : "text-slate-600 hover:bg-slate-100"
          }`}
        >
          <FileCode className="w-4 h-4" />
          <span>3. Dán JSON Thủ Công</span>
        </button>

        <button
          onClick={() => setActiveTab("prompts")}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
            activeTab === "prompts"
              ? "bg-slate-900 text-white shadow-sm"
              : "text-slate-600 hover:bg-slate-100"
          }`}
        >
          <Copy className="w-4 h-4" />
          <span>4. Mẫu Prompt ChatGPT</span>
        </button>
      </div>

      {/* ============================================================================== */}
      {/* TAB 1: MODULE 1 - AI EXAM IMPORTER */}
      {/* ============================================================================== */}
      {activeTab === "ai_upload" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          <div className="lg:col-span-8 bg-white p-7 sm:p-9 rounded-3xl border border-slate-200 shadow-sm space-y-6">
            <div className="space-y-1">
              <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                <FileUp className="w-5 h-5 text-purple-600" />
                <span>Tải lên tài liệu đề thi nguồn</span>
              </h2>
              <p className="text-xs text-slate-500">
                Hỗ trợ định dạng PDF, Word (DOCX) hoặc hình ảnh scan đề thi (JPG, PNG)
              </p>
            </div>

            {/* File Dropzone */}
            <div className="border-2 border-dashed border-purple-200 hover:border-purple-400 bg-purple-50/20 rounded-3xl p-8 text-center space-y-3 transition-colors">
              <input
                type="file"
                id="exam-file-input"
                accept=".pdf,.docx,.jpg,.jpeg,.png"
                onChange={(e) => setUploadedFile(e.target.files?.[0] || null)}
                className="hidden"
              />
              <label
                htmlFor="exam-file-input"
                className="cursor-pointer flex flex-col items-center justify-center space-y-2"
              >
                <div className="w-14 h-14 rounded-2xl bg-purple-100 text-purple-600 flex items-center justify-center">
                  <Upload className="w-7 h-7" />
                </div>
                <div>
                  <span className="text-sm font-bold text-purple-900">
                    {uploadedFile ? uploadedFile.name : "Nhấn để chọn file đề thi hoặc kéo thả vào đây"}
                  </span>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {uploadedFile
                      ? `${Math.round(uploadedFile.size / 1024)} KB`
                      : "PDF, DOCX, JPG, PNG (Tối đa 25MB)"}
                  </p>
                </div>
              </label>
            </div>

            {/* Answer Key (Optional) */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-800 block">
                Đáp án gốc (Tùy chọn nếu đề thi có bảng đáp án kèm theo)
              </label>
              <textarea
                value={answerKeyText}
                onChange={(e) => setAnswerKeyText(e.target.value)}
                rows={3}
                placeholder="Dán danh sách đáp án gốc (ví dụ: Câu 1: 1, Câu 2: 3, Câu 3: 2... hoặc dán bảng đáp án)"
                className="w-full text-xs p-3 rounded-2xl border border-slate-200 focus:outline-none focus:border-purple-500"
              />
              <p className="text-[11px] text-slate-500">
                * Nguyên tắc bắt buộc: Nếu không cung cấp đáp án gốc, AI sẽ đánh dấu câu hỏi là <code>needs_review</code> và để bạn kiểm tra lại.
              </p>
            </div>

            {/* Error Message */}
            {extractError && (
              <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2.5">
                <XCircle className="w-4 h-4 text-rose-600 shrink-0" />
                <span>{extractError}</span>
              </div>
            )}

            {/* Submit Button */}
            <div className="pt-2">
              <button
                type="button"
                disabled={!uploadedFile || isExtracting}
                onClick={handleStartAIExtraction}
                className="w-full py-4 rounded-2xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 active:scale-95 text-white font-bold text-sm shadow-md shadow-purple-100 flex items-center justify-center gap-2.5 disabled:opacity-50 transition-all"
              >
                {isExtracting ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>Gemini AI đang phân tích tài liệu và cấu trúc hóa đề thi...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-5 h-5 text-purple-200" />
                    <span>Bắt đầu phân tích & Trích xuất bằng Gemini AI</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Right: API Key Settings & Rules */}
          <div className="lg:col-span-4 space-y-5">
            {/* Live Gemini Connection Health Checker */}
            <GeminiConnectionChecker
              customApiKey={customApiKey}
              onApiKeyChange={handleSaveApiKey}
            />

            {/* Principles Box */}
            <div className="bg-slate-50 p-6 rounded-3xl border border-slate-200/80 space-y-3 text-xs text-slate-600">
              <span className="font-bold text-slate-800 block uppercase tracking-wider text-[11px]">
                Nguyên tắc trích xuất đề thi AI
              </span>
              <ul className="space-y-2 list-disc list-inside leading-relaxed">
                <li>Bảo tồn 100% chữ Kanji, Kana và dấu câu nguyên bản.</li>
                <li>Tự động gom nhóm câu hỏi đọc hiểu vào bài đọc chung <code>passages[]</code>.</li>
                <li>Không tự bịa đặt đáp án khi không có đáp án nguồn.</li>
                <li>Bắt buộc kiểm duyệt qua giao diện Admin trước khi xuất bản.</li>
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================================== */}
      {/* TAB 2: MODULE 3 - ADMIN REVIEW & EDITOR */}
      {/* ============================================================================== */}
      {activeTab === "review" && examData && (
        <AdminReviewEditor
          exam={examData}
          rawTextPreview={rawTextPreview}
          onUpdateExam={(updated) => {
            setExamData(updated);
            setJsonInput(JSON.stringify(updated, null, 2));
          }}
          onPublished={(examId) => {
            // Success callback
          }}
        />
      )}

      {/* ============================================================================== */}
      {/* TAB 3: MANUAL JSON VALIDATOR */}
      {/* ============================================================================== */}
      {activeTab === "manual_json" && (
        <div className="bg-white p-7 sm:p-9 rounded-3xl border border-slate-200 shadow-sm space-y-5">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-slate-900">Dán mã JSON đề thi</h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Kiểm tra tính hợp lệ của JSON theo Schema 1.0.0
              </p>
            </div>
            {examData && (
              <button
                type="button"
                onClick={() => setActiveTab("review")}
                className="px-4 py-2 rounded-xl bg-indigo-600 text-white text-xs font-semibold hover:bg-indigo-700"
              >
                Mở trong Review Editor →
              </button>
            )}
          </div>

          <textarea
            value={jsonInput}
            onChange={(e) => handleValidateManualJson(e.target.value)}
            rows={18}
            placeholder="Dán nội dung JSON vào đây..."
            className="w-full p-4 rounded-2xl border border-slate-200 font-mono text-xs focus:outline-none focus:border-indigo-500 bg-slate-50/50"
          />

          {manualValidationErrors.length > 0 && (
            <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs">
              {manualValidationErrors.map((err, i) => (
                <div key={i}>{err}</div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ============================================================================== */}
      {/* TAB 4: PROMPTS GUIDE */}
      {/* ============================================================================== */}
      {activeTab === "prompts" && (
        <div className="space-y-6">
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-100">
              <div>
                <h3 className="text-base font-bold text-slate-900">1. Prompt chính chuyển đổi đề thi</h3>
                <p className="text-xs text-slate-500">Gửi kèm PDF và exam-template.json</p>
              </div>
              <button
                onClick={() => handleCopyPrompt(mainPromptText, "main")}
                className="px-4 py-2 rounded-xl bg-indigo-600 text-white text-xs font-semibold hover:bg-indigo-700"
              >
                {copiedPromptKey === "main" ? "Đã copy!" : "Copy Prompt 1"}
              </button>
            </div>
            <pre className="p-4 rounded-2xl bg-slate-900 text-slate-100 font-mono text-xs whitespace-pre-wrap leading-relaxed max-h-96 overflow-y-auto">
              {mainPromptText}
            </pre>
          </div>

          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-100">
              <div>
                <h3 className="text-base font-bold text-slate-900">2. Prompt kiểm duyệt lần hai</h3>
                <p className="text-xs text-slate-500">Đối chiếu lại các câu tiếng Nhật và đáp án</p>
              </div>
              <button
                onClick={() => handleCopyPrompt(reviewPromptText, "review")}
                className="px-4 py-2 rounded-xl bg-slate-900 text-white text-xs font-semibold hover:bg-slate-800"
              >
                {copiedPromptKey === "review" ? "Đã copy!" : "Copy Prompt 2"}
              </button>
            </div>
            <pre className="p-4 rounded-2xl bg-slate-900 text-slate-100 font-mono text-xs whitespace-pre-wrap leading-relaxed">
              {reviewPromptText}
            </pre>
          </div>

          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-100">
              <div>
                <h3 className="text-base font-bold text-slate-900">3. Prompt xuất bản sau khi tự duyệt</h3>
                <p className="text-xs text-slate-500">Đổi review status sang verified và publish</p>
              </div>
              <button
                onClick={() => handleCopyPrompt(publishPromptText, "publish")}
                className="px-4 py-2 rounded-xl bg-emerald-600 text-white text-xs font-semibold hover:bg-emerald-700"
              >
                {copiedPromptKey === "publish" ? "Đã copy!" : "Copy Prompt 3"}
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
