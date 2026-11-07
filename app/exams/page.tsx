"use client";

import React, { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import { ExamIndexItem, ExamAttempt } from "@/lib/types";
import { getAllAttempts } from "@/lib/storage";
import {
  Search,
  Filter,
  Clock,
  BookOpen,
  ArrowRight,
  CheckCircle2,
  Play,
  RotateCcw,
  Sparkles,
} from "lucide-react";

export default function ExamsPage() {
  const [exams, setExams] = useState<ExamIndexItem[]>([]);
  const [attempts, setAttempts] = useState<ExamAttempt[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSection, setSelectedSection] = useState<string>("all");
  const [selectedSort, setSelectedSort] = useState<string>("default");

  useEffect(() => {
    fetch("/data/exams/index.json")
      .then((res) => res.json())
      .then((data) => setExams(Array.isArray(data) ? data : []))
      .catch((err) => console.error("Lỗi fetch kho đề:", err))
      .finally(() => setLoading(false));

    setAttempts(getAllAttempts());
  }, []);

  // Filtered and sorted exams
  const filteredExams = useMemo(() => {
    return exams.filter((exam) => {
      // Must be published
      if (exam.status !== "published") return false;

      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchTitle = exam.title.toLowerCase().includes(q);
        const matchDesc = exam.description.toLowerCase().includes(q);
        const matchTags = exam.tags?.some((t) => t.toLowerCase().includes(q));
        if (!matchTitle && !matchDesc && !matchTags) return false;
      }

      // Section filter
      if (selectedSection !== "all") {
        const count = exam.sectionCounts?.[selectedSection as keyof typeof exam.sectionCounts] || 0;
        if (count === 0) return false;
      }

      return true;
    }).sort((a, b) => {
      if (selectedSort === "questions-desc") return b.questionCount - a.questionCount;
      if (selectedSort === "time-asc") return a.timeLimitMinutes - b.timeLimitMinutes;
      if (selectedSort === "time-desc") return b.timeLimitMinutes - a.timeLimitMinutes;
      return 0;
    });
  }, [exams, searchQuery, selectedSection, selectedSort]);

  // Determine user status for an exam
  const getExamUserStatus = (examId: string) => {
    const examAttempts = attempts.filter((a) => a.examId === examId);
    if (examAttempts.some((a) => a.status === "in_progress")) {
      return { status: "in_progress", label: "Đang làm dở", color: "bg-blue-100 text-blue-800 border-blue-200" };
    }
    const completed = examAttempts.filter((a) => a.status === "completed");
    if (completed.length > 0) {
      return { status: "completed", label: `Đã làm (${completed.length} lần)`, color: "bg-emerald-100 text-emerald-800 border-emerald-200" };
    }
    return { status: "new", label: "Mới", color: "bg-slate-100 text-slate-700 border-slate-200" };
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header */}
      <div className="space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#E8F5E9] border border-[#A5D6A7] text-[#1B5E20] text-xs font-semibold">
          <BookOpen className="w-3.5 h-3.5 text-[#2E7D32]" />
          <span>Thư viện đề thi chuẩn JLPT N3 • Cùng VuyAnh 🌸</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-[#1B5E20] tracking-tight">
          Kho Đề Luyện Thi N3
        </h1>
        <p className="text-sm sm:text-base text-slate-600 max-w-2xl">
          Luyện tập theo từng kỹ năng hoặc làm bài thi thử tổng hợp với đầy đủ đồng hồ bấm giờ và lời giải chi tiết 100% tiếng Việt cho từng lựa chọn.
        </p>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
          {/* Search box */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Tìm kiếm theo tên đề, ngữ pháp, chủ đề..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
            />
          </div>

          {/* Sort dropdown */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500 whitespace-nowrap">Sắp xếp:</span>
            <select
              value={selectedSort}
              onChange={(e) => setSelectedSort(e.target.value)}
              className="text-xs font-semibold px-3 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-700 focus:outline-none focus:border-indigo-500"
            >
              <option value="default">Mặc định</option>
              <option value="questions-desc">Số câu nhiều nhất</option>
              <option value="time-asc">Thời gian ngắn nhất</option>
              <option value="time-desc">Thời gian dài nhất</option>
            </select>
          </div>
        </div>

        {/* Section tabs */}
        <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-100">
          {[
            { id: "all", label: "Tất cả đề thi" },
            { id: "vocabulary", label: "Chữ Hán & Từ vựng" },
            { id: "grammar", label: "Ngữ pháp" },
            { id: "reading", label: "Đọc hiểu" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setSelectedSection(tab.id)}
              className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                selectedSection === tab.id
                  ? "bg-indigo-600 text-white shadow-sm"
                  : "bg-slate-50 text-slate-600 hover:bg-slate-100 border border-slate-200/60"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Exam Grid */}
      {loading ? (
        <div className="py-20 text-center text-slate-400 text-sm">Đang tải danh sách đề thi...</div>
      ) : filteredExams.length === 0 ? (
        <div className="py-16 text-center bg-white rounded-2xl border border-slate-200 p-8 space-y-3">
          <BookOpen className="w-10 h-10 text-slate-300 mx-auto" />
          <h3 className="text-base font-bold text-slate-800">Không tìm thấy đề thi phù hợp</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Thử thay đổi từ khóa tìm kiếm hoặc chọn bộ lọc kỹ năng khác.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredExams.map((exam) => {
            const userStatus = getExamUserStatus(exam.id);

            return (
              <div
                key={exam.id}
                className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm hover:border-indigo-300 hover:shadow-md transition-all flex flex-col justify-between"
              >
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200">
                      {exam.level}
                    </span>
                    <span className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-full border ${userStatus.color}`}>
                      {userStatus.label}
                    </span>
                  </div>

                  <div>
                    <h3 className="font-bold text-base text-slate-900 leading-snug line-clamp-2">
                      {exam.title}
                    </h3>
                    <p className="text-xs text-slate-600 mt-2 line-clamp-2 leading-relaxed">
                      {exam.description}
                    </p>
                  </div>

                  {/* Badges breakdown */}
                  <div className="flex flex-wrap items-center gap-1.5 pt-1 text-[11px] text-slate-600">
                    <span className="px-2 py-0.5 rounded bg-slate-100 font-medium">
                      {exam.questionCount} câu
                    </span>
                    <span className="px-2 py-0.5 rounded bg-slate-100 font-medium flex items-center gap-1">
                      <Clock className="w-3 h-3 text-slate-400" />
                      {exam.timeLimitMinutes} phút
                    </span>
                    {exam.sectionCounts?.vocabulary > 0 && (
                      <span className="px-2 py-0.5 rounded bg-blue-50 text-blue-700">
                        Từ vựng: {exam.sectionCounts.vocabulary}
                      </span>
                    )}
                    {exam.sectionCounts?.grammar > 0 && (
                      <span className="px-2 py-0.5 rounded bg-purple-50 text-purple-700">
                        Ngữ pháp: {exam.sectionCounts.grammar}
                      </span>
                    )}
                    {exam.sectionCounts?.reading > 0 && (
                      <span className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-700">
                        Đọc hiểu: {exam.sectionCounts.reading}
                      </span>
                    )}
                  </div>

                  {/* Tags */}
                  {exam.tags && exam.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {exam.tags.slice(0, 3).map((tag, i) => (
                        <span
                          key={i}
                          className="text-[10px] text-slate-500 bg-slate-50 border border-slate-200/60 px-2 py-0.5 rounded-md"
                        >
                          #{tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {/* Card actions */}
                <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between gap-2">
                  <Link
                    href={`/practice/${exam.id}?mode=practice`}
                    className="flex-1 text-center py-2 px-3 rounded-xl bg-indigo-50 text-indigo-700 hover:bg-indigo-100 text-xs font-semibold transition-colors"
                  >
                    Luyện tập
                  </Link>

                  <Link
                    href={`/practice/${exam.id}?mode=exam`}
                    className="flex-1 text-center py-2 px-3 rounded-xl bg-slate-900 text-white hover:bg-slate-800 text-xs font-semibold transition-colors"
                  >
                    Thi thử
                  </Link>

                  <Link
                    href={`/exams/${exam.id}`}
                    className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-50 transition-colors"
                    title="Xem chi tiết đề"
                  >
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

