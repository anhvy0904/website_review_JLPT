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
  Play,
  Layers,
  Crown,
  Heart,
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

  let totalTimeSeconds = 0;
  completedAttempts.forEach((a) => {
    totalTimeSeconds += a.elapsedSeconds || 0;
  });

  return (
    <div className="space-y-16 pb-16">
      {/* Hero Section with Cute Mascot Frog */}
      <section className="relative overflow-hidden bg-gradient-to-b from-[#E8F5E9] via-[#E8F5E9]/60 to-[#fbfdfb] pt-10 pb-16 sm:pt-14 sm:pb-20 border-b border-[#A5D6A7]/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
            {/* Left Content */}
            <div className="lg:col-span-7 space-y-6">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/90 border border-[#A5D6A7] text-[#1B5E20] text-xs font-semibold shadow-sm">
                <span className="text-sm">🌸</span>
                <span>Góc nhỏ luyện đề N3 dành riêng cho ngừi iu</span>
                <span className="text-[11px] bg-[#66BB6A] text-white px-2 py-0.5 rounded-full font-bold">
                  VuyAnh 💚
                </span>
              </div>

              <div className="space-y-3">
                <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-[#1B5E20] tracking-tight leading-[1.2]">
                  Luyện đề tiếng Nhật cùng VuyAnh <span className="text-3xl sm:text-4xl lg:text-5xl">🌸</span>
                </h1>
                <p className="text-lg sm:text-xl font-bold text-[#2E7D32]">
                  Ôn tập thông minh, hiểu sâu từng câu
                </p>
              </div>

              <div className="p-5 rounded-2xl bg-white/95 border-2 border-[#A5D6A7] shadow-sm text-slate-700 text-sm sm:text-base leading-relaxed relative">
                <p>
                  Chào các ghệ! Đây là góc nhỏ VuyAnh tự tay chuẩn bị để cùng ngừi iu chinh phục kỳ thi JLPT N3 (tập trung trọn vẹn vào Từ vựng, Chữ Hán, Ngữ pháp và Đọc hiểu). Không còn cảnh làm đề xong chỉ biết đúng - sai rồi thôi, ở đây mỗi câu hỏi đều được &ldquo;mổ xẻ&rdquo; giải thích chi tiết 100% bằng tiếng Việt, phân tích cặn kẽ từng đáp án để đôi mình cùng coi.
                </p>
              </div>

              {/* CTAs */}
              <div className="flex flex-wrap items-center gap-3 pt-2">
                <Link
                  href="/exams"
                  className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl bg-[#1B5E20] text-white font-semibold shadow-md shadow-emerald-950/20 hover:bg-[#2E7D32] border border-[#66BB6A]/40 active:scale-95 transition-all text-sm sm:text-base"
                >
                  <Compass className="w-5 h-5 text-[#A5D6A7]" />
                  <span>Cùng làm đề trắc nghiệm</span>
                </Link>

                <Link
                  href="/learn"
                  className="inline-flex items-center gap-2 px-5 py-3.5 rounded-xl bg-white border border-[#A5D6A7] text-[#1B5E20] font-semibold shadow-sm hover:bg-[#E8F5E9] active:scale-95 transition-all text-sm sm:text-base"
                >
                  <Layers className="w-5 h-5 text-[#66BB6A]" />
                  <span>12 Thể & Kính ngữ</span>
                </Link>

                <Link
                  href="/flashcards"
                  className="inline-flex items-center gap-2 px-5 py-3.5 rounded-xl bg-white border border-[#A5D6A7] text-[#1B5E20] font-semibold shadow-sm hover:bg-[#E8F5E9] active:scale-95 transition-all text-sm sm:text-base"
                >
                  <Sparkles className="w-5 h-5 text-[#66BB6A]" />
                  <span>Flashcard Từ Vựng N3</span>
                </Link>
              </div>
            </div>

            {/* Right Mascot Card (Transformed to Cute Frog) */}
            <div className="lg:col-span-5 flex justify-center">
              <div className="relative max-w-sm w-full group">
                {/* Decorative glow */}
                <div className="absolute -inset-1.5 bg-gradient-to-r from-[#66BB6A] via-[#A5D6A7] to-[#1B5E20] rounded-3xl blur opacity-35 group-hover:opacity-60 transition duration-500"></div>

                <div className="relative rounded-2xl bg-white p-4 shadow-xl border-2 border-[#A5D6A7] overflow-hidden space-y-3">
                  {/* Mascot Image */}
                  <div className="relative aspect-square w-full rounded-xl overflow-hidden bg-[#E8F5E9] border border-[#A5D6A7]/60 shadow-inner">
                    <img
                      src="/images/mascot-frog.jpg"
                      alt="Chú ếch VuyAnh đội nón lá sen thiền định làm bài"
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />

                    {/* Floating pill */}
                    <div className="absolute bottom-3 left-3 right-3 bg-white/95 backdrop-blur-md px-3.5 py-2.5 rounded-xl border border-[#A5D6A7] flex items-center justify-between shadow-md">
                      <div className="flex items-center gap-2">
                        <span className="text-2xl">🐸</span>
                        <div>
                          <p className="text-xs font-bold text-[#1B5E20]">Bé Ếch Sen VuyAnh</p>
                          <p className="text-[10px] text-emerald-800">Cùng ngừi iu luyện thi N3</p>
                        </div>
                      </div>
                      <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-[#E8F5E9] text-[#1B5E20] border border-[#A5D6A7]">
                        🌸 Thiền & Đỗ Đạt
                      </span>
                    </div>
                  </div>

                  {/* Sweet Message from VuyAnh */}
                  <div className="p-3.5 rounded-xl bg-[#E8F5E9] border border-[#A5D6A7] text-xs text-[#1B5E20] space-y-1.5">
                    <div className="flex items-center justify-between font-bold">
                      <span className="flex items-center gap-1.5">
                        <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500" />
                        Lời nhắn gửi ngừi iu:
                      </span>
                      <span className="text-[10px] text-emerald-800 bg-white px-2 py-0.5 rounded-full font-semibold border border-[#A5D6A7]">
                        Tâm an trí sáng ✨
                      </span>
                    </div>
                    <p className="text-slate-700 leading-relaxed italic">
                      &ldquo;Cố lên ngừi iu nha! Mỗi ngày làm một ít, hiểu sâu từng từ vựng và ngữ pháp. Đừng lo lắng, có tợ ở đây giải thích từng câu cho bạn rồi! 💚&rdquo;
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        {/* Banner tiếp tục bài dang dở nếu có */}
        {activeAttempt && (
          <div className="p-5 sm:p-6 rounded-2xl bg-gradient-to-r from-[#2E7D32] to-[#1B5E20] text-white shadow-lg flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border border-[#A5D6A7]/40">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-[#A5D6A7] animate-pulse" />
                <span className="text-xs uppercase font-bold tracking-wider text-[#dcedc8]">
                  Bài làm đang dang dở
                </span>
              </div>
              <h3 className="font-bold text-lg sm:text-xl">
                Bạn đang có bài làm chưa nộp ({activeAttempt.mode === "practice" ? "Luyện tập" : "Thi thử"})
              </h3>
              <p className="text-xs text-[#dcedc8]">
                Đã trả lời {Object.keys(activeAttempt.answers || {}).length} câu • Thời gian đã làm: {formatTime(activeAttempt.elapsedSeconds)}
              </p>
            </div>

            <Link
              href={`/practice/${activeAttempt.examId}?mode=${activeAttempt.mode}`}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white text-[#1B5E20] font-bold text-sm shadow hover:bg-[#E8F5E9] active:scale-95 transition-all shrink-0"
            >
              <Play className="w-4 h-4 fill-[#1B5E20]" />
              <span>Tiếp tục làm bài</span>
            </Link>
          </div>
        )}

        {/* Thẻ chỉ số cá nhân (KPI Cards) */}
        <section className="space-y-4">
          <h2 className="text-lg font-bold text-[#1B5E20] flex items-center gap-2">
            <Target className="w-5 h-5 text-[#66BB6A]" />
            <span>Thống kê học tập cá nhân</span>
          </h2>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {/* KPI 1 */}
            <div className="bg-white p-5 rounded-2xl border border-[#A5D6A7]/60 shadow-sm space-y-2 hover:border-[#66BB6A] transition-colors">
              <div className="flex items-center justify-between text-slate-500">
                <span className="text-xs font-semibold text-slate-600">Đề đã hoàn thành</span>
                <Trophy className="w-4 h-4 text-amber-500" />
              </div>
              <div className="text-2xl sm:text-3xl font-extrabold text-[#1B5E20]">
                {totalCompleted}
              </div>
              <p className="text-xs text-slate-400">bộ đề đã làm xong</p>
            </div>

            {/* KPI 2 */}
            <div className="bg-white p-5 rounded-2xl border border-[#A5D6A7]/60 shadow-sm space-y-2 hover:border-[#66BB6A] transition-colors">
              <div className="flex items-center justify-between text-slate-500">
                <span className="text-xs font-semibold text-slate-600">Tổng lượt làm</span>
                <BookCheck className="w-4 h-4 text-[#66BB6A]" />
              </div>
              <div className="text-2xl sm:text-3xl font-extrabold text-[#1B5E20]">
                {attempts.length}
              </div>
              <p className="text-xs text-slate-400">lượt thi & luyện tập</p>
            </div>

            {/* KPI 3 */}
            <div className="bg-white p-5 rounded-2xl border border-[#A5D6A7]/60 shadow-sm space-y-2 hover:border-[#66BB6A] transition-colors">
              <div className="flex items-center justify-between text-slate-500">
                <span className="text-xs font-semibold text-slate-600">Thời gian học</span>
                <Clock className="w-4 h-4 text-[#2E7D32]" />
              </div>
              <div className="text-2xl sm:text-3xl font-extrabold text-[#1B5E20]">
                {formatTime(totalTimeSeconds)}
              </div>
              <p className="text-xs text-slate-400">phút:giây tích lũy</p>
            </div>

            {/* KPI 4 */}
            <div className="bg-white p-5 rounded-2xl border border-[#A5D6A7]/60 shadow-sm space-y-2 hover:border-[#66BB6A] transition-colors">
              <div className="flex items-center justify-between text-slate-500">
                <span className="text-xs font-semibold text-slate-600">Câu đã ghim</span>
                <RotateCcw className="w-4 h-4 text-rose-500" />
              </div>
              <div className="text-2xl sm:text-3xl font-extrabold text-[#1B5E20]">
                {bookmarkedCount}
              </div>
              <p className="text-xs text-slate-400">câu cần ôn lại</p>
            </div>
          </div>
        </section>

        {/* Học theo chuyên đề trọng tâm */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#E8F5E9] text-[#1B5E20] border border-[#A5D6A7] font-semibold text-xs mb-1">
                <Sparkles className="w-3.5 h-3.5 text-[#66BB6A]" />
                <span>Chuyên Đề Trọng Tâm N3</span>
              </div>
              <h2 className="text-2xl font-extrabold text-[#1B5E20]">Học theo chuyên đề cùng VuyAnh</h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Hai chủ đề nền tảng giúp ngừi iu tự tin ăn trọn điểm Ngữ pháp và Giao tiếp
              </p>
            </div>

            <Link
              href="/learn"
              className="text-xs font-bold text-[#2E7D32] hover:text-[#1B5E20] flex items-center gap-1"
            >
              <span>Xem tất cả chuyên đề</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Card 1: 12 Thể Động Từ */}
            <div className="bg-gradient-to-br from-[#E8F5E9] via-white to-[#E8F5E9]/50 p-7 rounded-3xl border-2 border-[#A5D6A7] shadow-sm hover:shadow-md transition-all flex flex-col justify-between space-y-4 group">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="w-10 h-10 rounded-2xl bg-[#E8F5E9] text-[#1B5E20] border border-[#A5D6A7] flex items-center justify-center font-bold">
                    <Layers className="w-5 h-5 text-[#2E7D32]" />
                  </div>
                  <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-white text-[#1B5E20] border border-[#A5D6A7]">
                    12 Thể Động Từ
                  </span>
                </div>

                <div className="pt-1">
                  <span className="text-xs font-bold text-[#2E7D32] font-japanese block">
                    動詞の活用
                  </span>
                  <h3 className="text-xl font-bold text-[#1B5E20] group-hover:text-[#2E7D32] transition-colors">
                    Chia Các Thể Động Từ
                  </h3>
                </div>

                <p className="text-xs text-slate-600 leading-relaxed">
                  Làm chủ trọn vẹn 12 thể (て, た, ない, ば, ý chí, mệnh lệnh, cấm đoán, khả năng, bị động, sai khiến, bị động sai khiến...) kèm công cụ tra bảng chia tự động.
                </p>
              </div>

              <Link
                href="/learn/verb-forms"
                className="w-full py-3 rounded-2xl bg-[#1B5E20] hover:bg-[#2E7D32] text-white text-xs font-bold shadow-sm flex items-center justify-center gap-1.5 transition-all"
              >
                <span>Bắt đầu học 12 Thể</span>
                <ArrowRight className="w-3.5 h-3.5 text-[#A5D6A7]" />
              </Link>
            </div>

            {/* Card 2: Kính ngữ & Khiêm nhường ngữ */}
            <div className="bg-gradient-to-br from-[#E8F5E9] via-white to-[#E8F5E9]/50 p-7 rounded-3xl border-2 border-[#A5D6A7] shadow-sm hover:shadow-md transition-all flex flex-col justify-between space-y-4 group">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="w-10 h-10 rounded-2xl bg-[#E8F5E9] text-[#1B5E20] border border-[#A5D6A7] flex items-center justify-center font-bold">
                    <Crown className="w-5 h-5 text-[#2E7D32]" />
                  </div>
                  <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-white text-[#1B5E20] border border-[#A5D6A7]">
                    Giao Tiếp Công Sở
                  </span>
                </div>

                <div className="pt-1">
                  <span className="text-xs font-bold text-[#2E7D32] font-japanese block">
                    敬語・謙譲語
                  </span>
                  <h3 className="text-xl font-bold text-[#1B5E20] group-hover:text-[#2E7D32] transition-colors">
                    Kính Ngữ & Khiêm Nhường Ngữ
                  </h3>
                </div>

                <p className="text-xs text-slate-600 leading-relaxed">
                  Phân biệt rạch ròi 尊敬語, 謙譲語, 丁寧語 và nguyên tắc Trong - Ngoài (内・外) đối với sếp, khách hàng và đối tác trong bài thi N3.
                </p>
              </div>

              <Link
                href="/learn/keigo"
                className="w-full py-3 rounded-2xl bg-[#1B5E20] hover:bg-[#2E7D32] text-white text-xs font-bold shadow-sm flex items-center justify-center gap-1.5 transition-all"
              >
                <span>Bắt đầu học Kính Ngữ</span>
                <ArrowRight className="w-3.5 h-3.5 text-[#A5D6A7]" />
              </Link>
            </div>
          </div>
        </section>

        {/* Danh sách đề thi nổi bật */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-[#1B5E20]">Đề thi sẵn sàng cùng ngừi iu luyện tập</h2>
              <p className="text-xs text-slate-500 mt-0.5">Chọn bộ đề để bắt đầu rèn luyện ngay hôm nay</p>
            </div>

            <Link
              href="/exams"
              className="text-sm font-semibold text-[#2E7D32] hover:text-[#1B5E20] flex items-center gap-1"
            >
              <span>Xem tất cả ({exams.length})</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {loading ? (
            <div className="py-12 text-center text-slate-400 text-sm">Đang tải kho đề...</div>
          ) : exams.length === 0 ? (
            <div className="py-12 text-center text-slate-500 bg-white rounded-2xl border border-[#A5D6A7] p-8">
              Chưa có đề thi nào trong hệ thống.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {exams.map((exam) => (
                <div
                  key={exam.id}
                  className="bg-white rounded-2xl border-2 border-[#A5D6A7]/70 p-6 shadow-sm hover:border-[#66BB6A] hover:shadow-md transition-all flex flex-col justify-between"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-[#E8F5E9] text-[#1B5E20] border border-[#A5D6A7]">
                        {exam.level}
                      </span>
                      <span className="text-xs text-slate-500 flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-[#66BB6A]" />
                        {exam.timeLimitMinutes} phút
                      </span>
                    </div>

                    <h3 className="font-bold text-lg text-[#1B5E20] leading-snug">
                      {exam.title}
                    </h3>
                    <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                      {exam.description}
                    </p>

                    <div className="flex flex-wrap items-center gap-2 pt-1 text-xs text-slate-500">
                      <span className="px-2 py-0.5 rounded bg-slate-100">
                        {exam.questionCount} câu hỏi
                      </span>
                      <span className="px-2 py-0.5 rounded bg-[#E8F5E9] text-[#1B5E20] border border-[#A5D6A7]/50 font-medium">
                        Từ vựng: {exam.sectionCounts?.vocabulary || 0}
                      </span>
                      <span className="px-2 py-0.5 rounded bg-[#E8F5E9] text-[#1B5E20] border border-[#A5D6A7]/50 font-medium">
                        Ngữ pháp: {exam.sectionCounts?.grammar || 0}
                      </span>
                      <span className="px-2 py-0.5 rounded bg-[#E8F5E9] text-[#1B5E20] border border-[#A5D6A7]/50 font-medium">
                        Đọc hiểu: {exam.sectionCounts?.reading || 0}
                      </span>
                    </div>
                  </div>

                  <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Link
                        href={`/practice/${exam.id}?mode=practice`}
                        className="px-3.5 py-2 rounded-xl text-xs font-bold bg-[#E8F5E9] text-[#1B5E20] hover:bg-[#A5D6A7]/40 border border-[#A5D6A7] transition-colors"
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
                      className="text-xs font-semibold text-[#2E7D32] hover:text-[#1B5E20] flex items-center gap-1"
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
        <section className="bg-white rounded-3xl border-2 border-[#A5D6A7]/70 p-8 sm:p-10 space-y-8">
          <div className="max-w-2xl">
            <h2 className="text-2xl font-bold text-[#1B5E20]">
              Được thiết kế tỉ mỉ cho đôi mình cùng học JLPT N3
            </h2>
            <p className="text-sm text-slate-600 mt-2">
              Giao diện thanh bình, không quảng cáo gây phân tâm. Tập trung hoàn toàn vào việc hiểu cặn kẽ bản chất câu hỏi và bẫy đề thi.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="space-y-2 p-5 rounded-2xl bg-[#E8F5E9]/50 border border-[#A5D6A7]/60">
              <div className="w-10 h-10 rounded-xl bg-white border border-[#A5D6A7] text-[#1B5E20] flex items-center justify-center">
                <CheckCircle2 className="w-5 h-5 text-[#2E7D32]" />
              </div>
              <h3 className="font-bold text-[#1B5E20] text-base">Giải thích 100% tiếng Việt</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Mỗi câu hỏi đều được mổ xẻ phân tích lý do vì sao đáp án đúng, đồng thời chỉ ra cặn kẽ điểm sai của cả 3 phương án còn lại.
              </p>
            </div>

            <div className="space-y-2 p-5 rounded-2xl bg-[#E8F5E9]/50 border border-[#A5D6A7]/60">
              <div className="w-10 h-10 rounded-xl bg-white border border-[#A5D6A7] text-[#1B5E20] flex items-center justify-center">
                <Zap className="w-5 h-5 text-[#66BB6A]" />
              </div>
              <h3 className="font-bold text-[#1B5E20] text-base">Luyện tập & Thi thử</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Tự do lựa chọn chế độ Luyện tập để xem ngay lời giải, hoặc chế độ Thi thử có bấm giờ chuẩn áp lực phòng thi.
              </p>
            </div>

            <div className="space-y-2 p-5 rounded-2xl bg-[#E8F5E9]/50 border border-[#A5D6A7]/60">
              <div className="w-10 h-10 rounded-xl bg-white border border-[#A5D6A7] text-[#1B5E20] flex items-center justify-center">
                <BookCheck className="w-5 h-5 text-[#2E7D32]" />
              </div>
              <h3 className="font-bold text-[#1B5E20] text-base">Chống lộ đáp án Kanji</h3>
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
