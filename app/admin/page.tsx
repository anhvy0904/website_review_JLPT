"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { ExamIndexItem, ExamSurvey, QuestionReport } from "@/lib/types";
import { getAllSurveys, getAllQuestionReports, exportUserData, importUserData } from "@/lib/storage";
import { GeminiConnectionChecker } from "@/components/GeminiConnectionChecker";
import {
  ShieldCheck,
  Plus,
  BookOpen,
  Upload,
  Download,
  Star,
  MessageSquare,
  Clock,
  ArrowRight,
  Database,
  FileCheck,
  AlertCircle,
} from "lucide-react";

export default function AdminPage() {
  const [exams, setExams] = useState<ExamIndexItem[]>([]);
  const [surveys, setSurveys] = useState<ExamSurvey[]>([]);
  const [reports, setReports] = useState<(QuestionReport & { createdAt: string })[]>([]);
  const [loading, setLoading] = useState(true);
  const [importStatus, setImportStatus] = useState<{ success?: boolean; message?: string } | null>(null);

  useEffect(() => {
    fetch("/data/exams/index.json")
      .then((res) => res.json())
      .then((data) => setExams(Array.isArray(data) ? data : []))
      .catch((err) => console.error("Lỗi:", err))
      .finally(() => setLoading(false));

    setSurveys(getAllSurveys());
    setReports(getAllQuestionReports());
  }, []);

  const totalQuestions = exams.reduce((acc, e) => acc + (e.questionCount || 0), 0);

  // Survey averages
  const avgDifficulty = surveys.length > 0
    ? Math.round((surveys.reduce((acc, s) => acc + s.difficultyRating, 0) / surveys.length) * 10) / 10
    : 0;

  const avgUsefulness = surveys.length > 0
    ? Math.round((surveys.reduce((acc, s) => acc + s.usefulnessRating, 0) / surveys.length) * 10) / 10
    : 0;

  const handleExportBackup = () => {
    const dataStr = exportUserData();
    const blob = new Blob([dataStr], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `jlpt_n3_backup_${new Date().toISOString().split("T")[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImportBackup = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      const result = importUserData(content);
      setImportStatus(result);
      if (result.success) {
        setSurveys(getAllSurveys());
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#E8F5E9] border border-[#A5D6A7] text-[#1B5E20] text-xs font-semibold">
            <ShieldCheck className="w-3.5 h-3.5 text-[#2E7D32]" />
            <span>Khu vực Quản trị (Admin Portal) • VuyAnh 🌸</span>
          </div>
          <h1 className="text-3xl font-extrabold text-[#1B5E20] tracking-tight">
            Quản Lý & Kiểm Duyệt Đề Thi
          </h1>
          <p className="text-sm text-slate-600">
            Giám sát chất lượng bộ đề, xem phản hồi khảo sát của học viên và sao lưu dữ liệu hệ thống.
          </p>
        </div>

        <Link
          href="/admin/exams/import"
          className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl bg-[#1B5E20] hover:bg-[#2E7D32] border border-[#66BB6A]/40 text-white text-sm font-bold shadow-md transition-all shrink-0"
        >
          <Plus className="w-5 h-5 text-[#A5D6A7]" />
          <span>Thẩm định & Nhập đề mới AI</span>
        </Link>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-2">
          <span className="text-xs font-semibold text-slate-500">Tổng số bộ đề</span>
          <div className="text-3xl font-extrabold text-slate-900">{exams.length}</div>
          <p className="text-xs text-emerald-600 font-semibold">100% đã xuất bản (published)</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-2">
          <span className="text-xs font-semibold text-slate-500">Tổng số câu hỏi</span>
          <div className="text-3xl font-extrabold text-slate-900">{totalQuestions}</div>
          <p className="text-xs text-slate-400">câu hỏi có lời giải chi tiết</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-2">
          <span className="text-xs font-semibold text-slate-500">Độ khó đánh giá TB</span>
          <div className="text-3xl font-extrabold text-amber-600 flex items-center gap-1">
            <span>{avgDifficulty || "N/A"}</span>
            <Star className="w-5 h-5 fill-amber-500 text-amber-500" />
          </div>
          <p className="text-xs text-slate-400">theo phản hồi học viên (thang 5)</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-2">
          <span className="text-xs font-semibold text-slate-500">Độ hữu ích giải thích</span>
          <div className="text-3xl font-extrabold text-indigo-600 flex items-center gap-1">
            <span>{avgUsefulness || "N/A"}</span>
            <Star className="w-5 h-5 fill-indigo-500 text-indigo-500" />
          </div>
          <p className="text-xs text-slate-400">{surveys.length} lượt khảo sát</p>
        </div>
      </div>

      {/* Trạng thái kết nối Google Gemini API */}
      <GeminiConnectionChecker />

      {/* Danh mục đề thi hiện có */}
      <section className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-5">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div>
            <h2 className="text-lg font-bold text-slate-900">Danh mục bộ đề trong hệ thống</h2>
            <p className="text-xs text-slate-500 mt-0.5">Quản lý các file đề nằm trong thư mục public/data/exams/</p>
          </div>

          <Link
            href="/admin/exams/import"
            className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 flex items-center gap-1"
          >
            <span>Thêm đề mới</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {loading ? (
          <div className="py-12 text-center text-slate-400 text-xs">Đang tải danh mục...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-600">
              <thead className="bg-slate-50 text-slate-700 font-semibold border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4">Mã đề (ID)</th>
                  <th className="py-3 px-4">Tên đề thi</th>
                  <th className="py-3 px-4">Số câu</th>
                  <th className="py-3 px-4">Thời gian</th>
                  <th className="py-3 px-4">Trạng thái</th>
                  <th className="py-3 px-4 text-right">Xem trước</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {exams.map((exam) => (
                  <tr key={exam.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-3.5 px-4 font-mono font-semibold text-slate-900">
                      {exam.id}
                    </td>
                    <td className="py-3.5 px-4 font-medium text-slate-800">
                      {exam.title}
                    </td>
                    <td className="py-3.5 px-4 font-semibold text-indigo-600">
                      {exam.questionCount} câu
                    </td>
                    <td className="py-3.5 px-4 font-mono">
                      {exam.timeLimitMinutes} phút
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-100 text-emerald-800">
                        {exam.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <Link
                        href={`/exams/${exam.id}`}
                        className="inline-flex items-center gap-1 font-semibold text-indigo-600 hover:text-indigo-800"
                      >
                        <span>Chi tiết</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* Khảo sát & Phản hồi của học viên */}
      <section className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-5">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-indigo-600" />
            <h2 className="text-lg font-bold text-slate-900">Ý kiến đóng góp từ học viên</h2>
          </div>
          <span className="text-xs text-slate-500">{surveys.length} lượt gửi</span>
        </div>

        {surveys.length === 0 ? (
          <p className="text-xs text-slate-400 py-8 text-center">
            Chưa có phản hồi khảo sát nào được gửi từ người học.
          </p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {surveys.map((s, idx) => (
              <div key={idx} className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2 text-xs">
                <div className="flex items-center justify-between text-slate-500">
                  <span className="font-semibold text-slate-700">Đề: {s.examId}</span>
                  <span>{s.submittedAt ? s.submittedAt.split("T")[0] : ""}</span>
                </div>
                <div className="flex items-center gap-4 text-slate-700 font-medium">
                  <span>Độ khó: <strong className="text-amber-600">{s.difficultyRating}/5</strong></span>
                  <span>Hữu ích: <strong className="text-emerald-600">{s.usefulnessRating}/5</strong></span>
                </div>
                {s.feedbackText && (
                  <p className="text-slate-600 italic bg-white p-2.5 rounded-xl border border-slate-100">
                    &ldquo;{s.feedbackText}&rdquo;
                  </p>
                )}
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Báo lỗi câu hỏi từ học viên */}
      <section className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-5">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-rose-500" />
            <h2 className="text-lg font-bold text-slate-900">Câu hỏi bị học viên báo lỗi</h2>
          </div>
          <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-rose-50 text-rose-700 border border-rose-200">
            {reports.length} báo lỗi
          </span>
        </div>

        {reports.length === 0 ? (
          <p className="text-xs text-slate-400 py-8 text-center">
            Tuyệt vời! Chưa có câu hỏi nào bị báo lỗi từ phía người học.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-600">
              <thead className="bg-slate-50 text-slate-700 font-semibold border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4">Thời gian</th>
                  <th className="py-3 px-4">Mã câu hỏi (ID)</th>
                  <th className="py-3 px-4">Phân loại lỗi</th>
                  <th className="py-3 px-4">Ghi chú của học viên</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {reports.map((r, i) => {
                  const issueLabels: Record<string, string> = {
                    wrong_answer: "Đáp án không đúng",
                    unclear_explanation: "Lời giải khó hiểu",
                    typo: "Lỗi chính tả",
                    other: "Lỗi khác",
                  };
                  return (
                    <tr key={i} className="hover:bg-slate-50/60">
                      <td className="py-3 px-4 text-slate-500">
                        {r.createdAt ? r.createdAt.split("T")[0] : ""}
                      </td>
                      <td className="py-3 px-4 font-mono font-semibold text-slate-900">
                        {r.questionId}
                      </td>
                      <td className="py-3 px-4">
                        <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-rose-50 text-rose-700 border border-rose-200">
                          {issueLabels[r.issueType] || r.issueType}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-slate-600">
                        {r.comment || "(Không kèm lời nhắn)"}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* Sao lưu & Phục hồi dữ liệu */}
      <section className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-5">
        <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
          <Database className="w-5 h-5 text-indigo-600" />
          <div>
            <h2 className="text-lg font-bold text-slate-900">Sao lưu & Phục hồi dữ liệu (Backup & Restore)</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Tải về toàn bộ bài làm, câu đã ghim và khảo sát dưới dạng file .json để di chuyển giữa các thiết bị
            </p>
          </div>
        </div>

        {importStatus && (
          <div
            className={`p-4 rounded-2xl text-xs flex items-center gap-2 border ${
              importStatus.success
                ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                : "bg-rose-50 text-rose-800 border-rose-200"
            }`}
          >
            {importStatus.success ? (
              <FileCheck className="w-4 h-4 text-emerald-600 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            )}
            <span>{importStatus.message}</span>
          </div>
        )}

        <div className="flex flex-wrap items-center gap-4 pt-2">
          <button
            onClick={handleExportBackup}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-900 text-white text-xs font-bold hover:bg-slate-800 transition-colors shadow-sm"
          >
            <Download className="w-4 h-4" />
            <span>Xuất file sao lưu (.json)</span>
          </button>

          <label className="cursor-pointer inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-50 border border-indigo-200 text-indigo-700 text-xs font-bold hover:bg-indigo-100 transition-colors">
            <Upload className="w-4 h-4" />
            <span>Khôi phục từ file sao lưu</span>
            <input
              type="file"
              accept=".json"
              onChange={handleImportBackup}
              className="hidden"
            />
          </label>
        </div>
      </section>
    </div>
  );
}

