"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { ExamDetail, ExamAttempt } from "@/lib/types";
import { getActiveAttempt, getAllAttempts } from "@/lib/storage";
import {
  Clock,
  BookOpen,
  ArrowLeft,
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  Play,
  RotateCcw,
  Zap,
} from "lucide-react";

export default function ExamDetailPage() {
  const params = useParams();
  const router = useRouter();
  const examId = params?.examId as string;

  const [exam, setExam] = useState<ExamDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedMode, setSelectedMode] = useState<"practice" | "exam">("practice");
  const [activeAttempt, setActiveAttempt] = useState<ExamAttempt | null>(null);
  const [completedCount, setCompletedCount] = useState(0);

  useEffect(() => {
    if (!examId) return;

    fetch(`/data/exams/${examId}.json`)
      .then(async (res) => {
        if (!res.ok) throw new Error("Không tìm thấy đề thi này");
        return res.json();
      })
      .then((data: ExamDetail) => {
        setExam(data);
      })
      .catch((err) => {
        console.error("Lỗi:", err);
        setError("Không thể tải thông tin đề thi. Vui lòng kiểm tra lại đường dẫn.");
      })
      .finally(() => setLoading(false));

    // Check localStorage
    const active = getActiveAttempt(examId);
    if (active) setActiveAttempt(active);

    const completed = getAllAttempts().filter((a) => a.examId === examId && a.status === "completed");
    setCompletedCount(completed.length);
  }, [examId]);

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center text-slate-400 text-sm">
        Đang tải thông tin đề thi...
      </div>
    );
  }

  if (error || !exam) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20 text-center space-y-4">
        <h2 className="text-xl font-bold text-slate-800">Không tìm thấy bộ đề</h2>
        <p className="text-sm text-slate-500">{error || "Đề thi không tồn tại trong hệ thống."}</p>
        <Link
          href="/exams"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 text-white text-sm font-semibold hover:bg-indigo-700"
        >
          <ArrowLeft className="w-4 h-4" />
          Quay lại kho đề
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Back link */}
      <Link
        href="/exams"
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Quay lại Kho đề thi</span>
      </Link>

      {/* Header Info */}
      <div className="bg-white rounded-3xl border border-slate-200 p-5 sm:p-7 md:p-9 shadow-sm space-y-5 sm:space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-2.5 sm:gap-3">
          <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
            <span className="text-xs font-bold px-3 py-1 rounded-full bg-[#E8F5E9] text-[#1B5E20] border border-[#A5D6A7]">
              Cấp độ {exam.level}
            </span>
            <span className="text-xs font-semibold px-3 py-1 rounded-full bg-slate-100 text-slate-700">
              {exam.questions.length} câu hỏi
            </span>
            <span className="text-xs font-semibold px-3 py-1 rounded-full bg-slate-100 text-slate-700 flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-slate-400" />
              {exam.settings.timeLimitMinutes} phút
            </span>
          </div>

          {completedCount > 0 && (
            <span className="text-xs font-semibold px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
              Đã hoàn thành {completedCount} lần
            </span>
          )}
        </div>

        <div className="space-y-2 sm:space-y-3">
          <h1 className="text-xl sm:text-2xl md:text-3xl font-extrabold text-[#1B5E20] tracking-tight leading-snug">
            {exam.title}
          </h1>
          <p className="text-xs sm:text-sm md:text-base text-slate-600 leading-relaxed">
            {exam.description}
          </p>
        </div>

        {/* Provenance info */}
        {exam.source && (
          <div className="flex items-center gap-2 text-xs text-slate-500 bg-slate-50 p-3 sm:p-3.5 rounded-xl border border-slate-100">
            <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
            <span className="truncate">
              Nguồn: <strong className="text-slate-700">{exam.source.fileName}</strong> • Đã xác minh đáp án chuẩn
            </span>
          </div>
        )}
      </div>

      {/* Mode Selection */}
      <div className="bg-white rounded-3xl border border-slate-200 p-5 sm:p-7 md:p-9 shadow-sm space-y-5 sm:space-y-6">
        <div>
          <h2 className="text-base sm:text-lg font-bold text-slate-900">Chọn chế độ làm bài</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Tùy theo mục tiêu ôn tập, bạn có thể chọn làm tự do hoặc thi thử chuẩn thời gian
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
          {/* Option Practice */}
          <div
            onClick={() => setSelectedMode("practice")}
            className={`p-4 sm:p-5 rounded-2xl border-2 cursor-pointer transition-all ${
              selectedMode === "practice"
                ? "border-[#1B5E20] bg-[#E8F5E9]/50 shadow-sm"
                : "border-slate-200 hover:border-slate-300 bg-white"
            }`}
          >
            <div className="flex items-center justify-between mb-2.5 sm:mb-3">
              <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-[#E8F5E9] text-[#1B5E20] flex items-center justify-center font-bold">
                <BookOpen className="w-5 h-5 text-[#2E7D32]" />
              </div>
              <input
                type="radio"
                name="exam-mode"
                checked={selectedMode === "practice"}
                onChange={() => setSelectedMode("practice")}
                className="w-4 h-4 text-[#1B5E20] accent-[#1B5E20]"
              />
            </div>
            <h3 className="font-bold text-slate-900 text-sm sm:text-base">Chế độ Luyện tập</h3>
            <p className="text-xs text-slate-600 mt-1 leading-relaxed">
              Kiểm tra ngay sau mỗi câu, xem đầy đủ lời giải, dịch nghĩa và từ vựng. Không tính giờ áp lực.
            </p>
          </div>

          {/* Option Exam */}
          <div
            onClick={() => setSelectedMode("exam")}
            className={`p-4 sm:p-5 rounded-2xl border-2 cursor-pointer transition-all ${
              selectedMode === "exam"
                ? "border-[#1B5E20] bg-[#E8F5E9]/50 shadow-sm"
                : "border-slate-200 hover:border-slate-300 bg-white"
            }`}
          >
            <div className="flex items-center justify-between mb-2.5 sm:mb-3">
              <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center font-bold">
                <Clock className="w-5 h-5" />
              </div>
              <input
                type="radio"
                name="exam-mode"
                checked={selectedMode === "exam"}
                onChange={() => setSelectedMode("exam")}
                className="w-4 h-4 text-[#1B5E20] accent-[#1B5E20]"
              />
            </div>
            <h3 className="font-bold text-slate-900 text-sm sm:text-base">Chế độ Thi thử</h3>
            <p className="text-xs text-slate-600 mt-1 leading-relaxed">
              Có đồng hồ đếm ngược {exam.settings.timeLimitMinutes} phút. Không hiện đáp án trong lúc làm. Nộp bài để xem điểm và lời giải chi tiết.
            </p>
          </div>
        </div>

        {/* Start Button */}
        <div className="pt-2 sm:pt-4 flex flex-col sm:flex-row items-center gap-3">
          <button
            onClick={() => {
              router.push(`/practice/${exam.id}?mode=${selectedMode}`);
            }}
            className="w-full sm:w-auto flex-1 inline-flex items-center justify-center gap-2 px-6 sm:px-8 py-3.5 sm:py-4 rounded-2xl bg-[#1B5E20] text-white text-sm sm:text-base font-bold shadow-md hover:bg-[#2E7D32] border border-[#66BB6A]/40 active:scale-95 transition-all cursor-pointer"
          >
            <Play className="w-4 h-4 sm:w-5 sm:h-5 fill-white" />
            <span>Bắt đầu làm bài ({selectedMode === "practice" ? "Luyện tập" : "Thi thử"})</span>
          </button>

          {activeAttempt && (
            <Link
              href={`/practice/${exam.id}?mode=${activeAttempt.mode}`}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 sm:px-6 py-3.5 sm:py-4 rounded-2xl bg-slate-100 text-slate-700 text-xs sm:text-sm font-semibold hover:bg-slate-200 transition-colors"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Tiếp tục bài đang dở</span>
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}

