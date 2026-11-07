"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import {
  Compass,
  RotateCcw,
  Sparkles,
  Trophy,
  Target,
  Clock,
  ArrowRight,
  BookCheck,
  CheckCircle2,
  Zap,
  HelpCircle,
  Play,
  Layers,
  Crown,
} from "lucide-react";
import { getAllAttempts, getBookmarkedQuestions } from "@/lib/storage";
import { ExamAttempt, ExamIndexItem } from "@/lib/types";
import { formatTime } from "@/lib/utils";

export default function HomePage() {
  const [exams, setExams] = useState<ExamIndexItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [attempts, setAttempts] = useState<ExamAttempt[]>([]);
  const [bookmarkedCount, setBookmarkedCount] = useState(0);
  const [activeAttempt, setActiveAttempt] = useState<ExamAttempt | null>(null);

  useEffect(() => {
    // Load exam index
    fetch("/data/exams/index.json")
      .then((res) => res.json())
      .then((data) => setExams(Array.isArray(data) ? data : []))
      .catch((err) => console.error("Lỗi tải đề:", err))
      .finally(() => setLoading(false));

    // Load local storage data
    const allAttempts = getAllAttempts();
    setAttempts(allAttempts);
    setBookmarkedCount(getBookmarkedQuestions().length);

    // Check for in-progress attempt
    const inProgress = allAttempts.find((a) => a.status === "in_progress");
    if (inProgress) setActiveAttempt(inProgress);
  }, []);

  const completedAttempts = attempts.filter((a) => a.status === "completed");
  const totalCompleted = completedAttempts.length;

  // Calculate average score & total study time
  let totalScore = 0;
  let totalTimeSeconds = 0;
  completedAttempts.forEach((a) => {
    totalTimeSeconds += a.elapsedSeconds || 0;
    // Calculate raw score if available
    const answeredCount = Object.keys(a.answers || {}).length;
    if (answeredCount > 0) {
      // rough average
    }
  });

  return (
    <div className="space-y-16 pb-16">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-indigo-50/70 via-white to-slate-50 pt-12 pb-16 sm:pt-16 sm:pb-24 border-b border-slate-200/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="max-w-3xl space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-indigo-100/80 border border-indigo-200/80 text-indigo-800 text-xs font-semibold">
              <Sparkles className="w-4 h-4 text-indigo-600" />
              <span>Chuyên biệt luyện đề JLPT N3 Data-Driven</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-slate-900 tracking-tight leading-[1.15]">
              JLPT N3 Practice Hub
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 via-blue-600 to-indigo-800 mt-2">
                Ôn tập thông minh, hiểu sâu từng câu
              </span>
            </h1>

            <p className="text-base sm:text-lg text-slate-600 leading-relaxed max-w-2xl">
              Nền tảng luyện đề trắc nghiệm chuẩn N3: Từ vựng, Chữ Hán, Ngữ pháp và Đọc hiểu. Giải thích cặn kẽ 100% tiếng Việt cho từng lựa chọn, kèm phân tích ngữ pháp, từ vựng và tự động lưu tiến trình làm bài.
            </p>

            {/* CTAs */}
            <div className="flex flex-wrap items-center gap-3 pt-2">
              <Link
                href="/exams"
                className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl bg-indigo-600 text-white font-semibold shadow-md shadow-indigo-100 hover:bg-indigo-700 active:scale-95 transition-all text-sm sm:text-base"
              >
                <Compass className="w-5 h-5" />
                <span>Khám phá kho đề thi</span>
              </Link>

              <Link
                href="/dashboard"
                className="inline-flex items-center gap-2 px-5 py-3.5 rounded-xl bg-white border border-slate-200 text-slate-700 font-semibold shadow-sm hover:bg-slate-50 active:scale-95 transition-all text-sm sm:text-base"
              >
                <Target className="w-5 h-5 text-indigo-600" />
                <span>Tiến độ cá nhân</span>
              </Link>

              <Link
                href="/review"
                className="inline-flex items-center gap-2 px-5 py-3.5 rounded-xl bg-white border border-slate-200 text-slate-700 font-semibold shadow-sm hover:bg-slate-50 active:scale-95 transition-all text-sm sm:text-base"
              >
                <RotateCcw className="w-5 h-5 text-amber-500" />
                <span>Ôn câu sai</span>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Main Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        {/* Banner tiếp tục bài dang dở nếu có */}
        {activeAttempt && (
          <div className="p-5 sm:p-6 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-700 text-white shadow-lg flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-xs uppercase font-bold tracking-wider text-blue-100">
                  Bài làm đang dang dở
                </span>
              </div>
              <h3 className="font-bold text-lg sm:text-xl">
                Bạn đang có bài làm chưa nộp ({activeAttempt.mode === "practice" ? "Luyện tập" : "Thi thử"})
              </h3>
              <p className="text-xs text-blue-100">
                Đã trả lời {Object.keys(activeAttempt.answers || {}).length} câu • Thời gian đã làm: {formatTime(activeAttempt.elapsedSeconds)}
              </p>
            </div>

            <Link
              href={`/practice/${activeAttempt.examId}?mode=${activeAttempt.mode}`}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white text-indigo-700 font-bold text-sm shadow hover:bg-blue-50 active:scale-95 transition-all shrink-0"
            >
              <Play className="w-4 h-4 fill-indigo-700" />
              <span>Tiếp tục làm bài</span>
            </Link>
          </div>
        )}

        {/* Thẻ chỉ số cá nhân (KPI Cards) */}
        <section className="space-y-4">
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <Target className="w-5 h-5 text-indigo-600" />
            <span>Thống kê học tập cá nhân</span>
          </h2>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {/* KPI 1 */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-2">
              <div className="flex items-center justify-between text-slate-500">
                <span className="text-xs font-semibold">Đề đã hoàn thành</span>
                <Trophy className="w-4 h-4 text-amber-500" />
              </div>
              <div className="text-2xl sm:text-3xl font-extrabold text-slate-900">
                {totalCompleted}
              </div>
              <p className="text-xs text-slate-400">bộ đề đã làm xong</p>
            </div>

            {/* KPI 2 */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-2">
              <div className="flex items-center justify-between text-slate-500">
                <span className="text-xs font-semibold">Tổng lượt làm</span>
                <BookCheck className="w-4 h-4 text-indigo-500" />
              </div>
              <div className="text-2xl sm:text-3xl font-extrabold text-slate-900">
                {attempts.length}
              </div>
              <p className="text-xs text-slate-400">lượt thi & luyện tập</p>
            </div>

            {/* KPI 3 */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-2">
              <div className="flex items-center justify-between text-slate-500">
                <span className="text-xs font-semibold">Thời gian học</span>
                <Clock className="w-4 h-4 text-blue-500" />
              </div>
              <div className="text-2xl sm:text-3xl font-extrabold text-slate-900">
                {formatTime(totalTimeSeconds)}
              </div>
              <p className="text-xs text-slate-400">phút:giây tích lũy</p>
            </div>

            {/* KPI 4 */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-2">
              <div className="flex items-center justify-between text-slate-500">
                <span className="text-xs font-semibold">Câu đã ghim</span>
                <RotateCcw className="w-4 h-4 text-rose-500" />
              </div>
              <div className="text-2xl sm:text-3xl font-extrabold text-slate-900">
                {bookmarkedCount}
              </div>
              <p className="text-xs text-slate-400">câu cần ôn lại</p>
            </div>
          </div>
        </section>

        {/* Học theo chuyên đề trọng tâm (PRD Addendum M1 & M2) */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 font-semibold text-xs mb-1">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Chuyên Đề Ngữ Pháp N3</span>
              </div>
              <h2 className="text-2xl font-extrabold text-slate-900">Học theo chuyên đề</h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Hai chủ đề nền tảng bắt buộc để đạt điểm cao trong phần Kiến thức ngôn ngữ & Đọc hiểu
              </p>
            </div>

            <Link
              href="/learn"
              className="text-xs font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1"
            >
              <span>Xem tất cả chuyên đề</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Card 1: 12 Thể Động Từ */}
            <div className="bg-gradient-to-br from-sky-50/70 via-white to-blue-50/30 p-7 rounded-3xl border border-sky-200 shadow-sm hover:shadow-md transition-all flex flex-col justify-between space-y-4 group">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="w-10 h-10 rounded-2xl bg-blue-100 text-blue-700 flex items-center justify-center">
                    <Layers className="w-5 h-5" />
                  </div>
                  <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-800">
                    12 Thể Động Từ
                  </span>
                </div>

                <div className="pt-1">
                  <span className="text-xs font-bold text-blue-600 font-japanese block">
                    動詞の活用
                  </span>
                  <h3 className="text-xl font-bold text-slate-900 group-hover:text-blue-900 transition-colors">
                    Chia Các Thể Động Từ
                  </h3>
                </div>

                <p className="text-xs text-slate-600 leading-relaxed">
                  Làm chủ 12 thể (て, た, ない, ば, ý chí, mệnh lệnh, cấm đoán, khả năng, bị động, sai khiến, bị động sai khiến...) kèm công cụ tra bảng chia tự động.
                </p>
              </div>

              <Link
                href="/learn/verb-forms"
                className="w-full py-3 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-sm flex items-center justify-center gap-1.5 transition-all"
              >
                <span>Bắt đầu học 12 Thể</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {/* Card 2: Kính ngữ & Khiêm nhường ngữ */}
            <div className="bg-gradient-to-br from-emerald-50/70 via-white to-teal-50/30 p-7 rounded-3xl border border-emerald-200 shadow-sm hover:shadow-md transition-all flex flex-col justify-between space-y-4 group">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="w-10 h-10 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
                    <Crown className="w-5 h-5" />
                  </div>
                  <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                    Giao Tiếp Công Sở
                  </span>
                </div>

                <div className="pt-1">
                  <span className="text-xs font-bold text-emerald-600 font-japanese block">
                    敬語・謙譲語
                  </span>
                  <h3 className="text-xl font-bold text-slate-900 group-hover:text-emerald-900 transition-colors">
                    Kính Ngữ & Khiêm Nhường Ngữ
                  </h3>
                </div>

                <p className="text-xs text-slate-600 leading-relaxed">
                  Phân biệt rạch ròi 尊敬語, 謙譲語, 丁寧語 và nguyên tắc Trong - Ngoài (内・外) đối với sếp, khách hàng và đối tác trong bài thi N3.
                </p>
              </div>

              <Link
                href="/learn/keigo"
                className="w-full py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-sm flex items-center justify-center gap-1.5 transition-all"
              >
                <span>Bắt đầu học Kính Ngữ</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </section>

        {/* Danh sách đề thi nổi bật */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-slate-900">Đề thi sẵn sàng luyện tập</h2>
              <p className="text-xs text-slate-500 mt-0.5">Chọn bộ đề để bắt đầu rèn luyện ngay</p>
            </div>

            <Link
              href="/exams"
              className="text-sm font-semibold text-indigo-600 hover:text-indigo-800 flex items-center gap-1"
            >
              <span>Xem tất cả ({exams.length})</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {loading ? (
            <div className="py-12 text-center text-slate-400 text-sm">Đang tải kho đề...</div>
          ) : exams.length === 0 ? (
            <div className="py-12 text-center text-slate-500 bg-white rounded-2xl border border-slate-200 p-8">
              Chưa có đề thi nào trong hệ thống.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {exams.map((exam) => (
                <div
                  key={exam.id}
                  className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm hover:border-indigo-300 hover:shadow-md transition-all flex flex-col justify-between"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200">
                        {exam.level}
                      </span>
                      <span className="text-xs text-slate-500 flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" />
                        {exam.timeLimitMinutes} phút
                      </span>
                    </div>

                    <h3 className="font-bold text-lg text-slate-900 leading-snug">
                      {exam.title}
                    </h3>
                    <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                      {exam.description}
                    </p>

                    <div className="flex flex-wrap items-center gap-2 pt-1 text-xs text-slate-500">
                      <span className="px-2 py-0.5 rounded bg-slate-100">
                        {exam.questionCount} câu hỏi
                      </span>
                      <span className="px-2 py-0.5 rounded bg-blue-50 text-blue-700">
                        Từ vựng: {exam.sectionCounts?.vocabulary || 0}
                      </span>
                      <span className="px-2 py-0.5 rounded bg-purple-50 text-purple-700">
                        Ngữ pháp: {exam.sectionCounts?.grammar || 0}
                      </span>
                      <span className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-700">
                        Đọc hiểu: {exam.sectionCounts?.reading || 0}
                      </span>
                    </div>
                  </div>

                  <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Link
                        href={`/practice/${exam.id}?mode=practice`}
                        className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-indigo-50 text-indigo-700 hover:bg-indigo-100 transition-colors"
                      >
                        Luyện tập
                      </Link>
                      <Link
                        href={`/practice/${exam.id}?mode=exam`}
                        className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-slate-100 text-slate-700 hover:bg-slate-200 transition-colors"
                      >
                        Thi thử
                      </Link>
                    </div>

                    <Link
                      href={`/exams/${exam.id}`}
                      className="text-xs font-semibold text-slate-600 hover:text-indigo-600 flex items-center gap-1"
                    >
                      <span>Chi tiết đề</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Tính năng nổi bật của hệ thống */}
        <section className="bg-white rounded-3xl border border-slate-200 p-8 sm:p-10 space-y-8">
          <div className="max-w-2xl">
            <h2 className="text-2xl font-bold text-slate-900">
              Được thiết kế tối ưu cho trải nghiệm ôn thi JLPT
            </h2>
            <p className="text-sm text-slate-600 mt-2">
              Không quảng cáo, không phân tâm. Tập trung hoàn toàn vào việc hiểu cặn kẽ bản chất câu hỏi và bẫy đề thi.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="space-y-2 p-5 rounded-2xl bg-slate-50 border border-slate-100">
              <div className="w-10 h-10 rounded-xl bg-indigo-100 text-indigo-600 flex items-center justify-center">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-slate-900 text-base">Giải thích 100% tiếng Việt</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Mỗi câu hỏi đều có phân tích lý do vì sao đáp án đúng, đồng thời chỉ ra bẫy của tất cả các phương án sai (distractors).
              </p>
            </div>

            <div className="space-y-2 p-5 rounded-2xl bg-slate-50 border border-slate-100">
              <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center">
                <Zap className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-slate-900 text-base">Luyện tập & Thi thử</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Tự do lựa chọn chế độ Luyện tập để xem ngay lời giải, hoặc chế độ Thi thử có bấm giờ chuẩn áp lực phòng thi.
              </p>
            </div>

            <div className="space-y-2 p-5 rounded-2xl bg-slate-50 border border-slate-100">
              <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center">
                <BookCheck className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-slate-900 text-base">Chống lộ đáp án Kanji</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Quy chuẩn nghiêm ngặt: không tự gắn furigana lên câu hỏi đọc Kanji, chỉ hiển thị furigana ruby ở phần giải thích.
              </p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

