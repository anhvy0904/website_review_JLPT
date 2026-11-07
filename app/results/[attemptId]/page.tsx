"use client";

import React, { useEffect, useState, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ExamDetail, ExamAttempt, AttemptScoringResult } from "@/lib/types";
import { getAttempt, getSurvey } from "@/lib/storage";
import { scoreAttempt } from "@/lib/scoring";
import { formatTime } from "@/lib/utils";
import { AnswerExplanation } from "@/components/AnswerExplanation";
import { PassageViewer } from "@/components/PassageViewer";
import { SurveyModal } from "@/components/SurveyModal";
import confetti from "canvas-confetti";
import {
  Trophy,
  RotateCcw,
  BookOpen,
  ArrowRight,
  Clock,
  CheckCircle2,
  XCircle,
  HelpCircle,
  Flag,
  Share2,
  MessageSquare,
  AlertCircle,
  ChevronDown,
  ChevronUp,
} from "lucide-react";

export default function ResultsPage() {
  const params = useParams();
  const router = useRouter();
  const attemptId = params?.attemptId as string;

  const [attempt, setAttempt] = useState<ExamAttempt | null>(null);
  const [exam, setExam] = useState<ExamDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Review Filter
  const [filter, setFilter] = useState<"all" | "correct" | "incorrect" | "skipped" | "flagged">("all");
  const [showSurveyModal, setShowSurveyModal] = useState(false);
  const [hasSurveyed, setHasSurveyed] = useState(false);

  useEffect(() => {
    if (!attemptId) return;

    const loadedAttempt = getAttempt(attemptId);
    if (!loadedAttempt) {
      setError("Không tìm thấy kết quả của lượt làm bài này.");
      setLoading(false);
      return;
    }
    setAttempt(loadedAttempt);

    // Fetch exam data
    fetch(`/data/exams/${loadedAttempt.examId}.json`)
      .then(async (res) => {
        if (!res.ok) throw new Error("Không thể tải thông tin đề");
        return res.json();
      })
      .then((data: ExamDetail) => {
        setExam(data);

        // Check if survey already submitted
        const existingSurvey = getSurvey(attemptId);
        if (existingSurvey) {
          setHasSurveyed(true);
        } else {
          // Open survey modal after 1.5s
          setTimeout(() => setShowSurveyModal(true), 1500);
        }
      })
      .catch((err) => {
        console.error("Lỗi:", err);
        setError("Không thể nạp thông tin đề thi.");
      })
      .finally(() => setLoading(false));
  }, [attemptId]);

  // Scoring
  const scoring: AttemptScoringResult | null = useMemo(() => {
    if (!exam || !attempt) return null;
    return scoreAttempt(exam, attempt);
  }, [exam, attempt]);

  // Fire confetti on high score
  useEffect(() => {
    if (scoring && scoring.scorePercent >= 70) {
      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
        });
      } catch {}
    }
  }, [scoring]);

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-24 text-center text-slate-400">
        Đang tổng hợp kết quả bài thi...
      </div>
    );
  }

  if (error || !exam || !attempt || !scoring) {
    return (
      <div className="max-w-xl mx-auto px-4 py-20 text-center space-y-4">
        <h2 className="text-xl font-bold text-slate-800">Không tìm thấy kết quả</h2>
        <p className="text-sm text-slate-500">{error || "Dữ liệu kết quả không tồn tại."}</p>
        <Link
          href="/exams"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 text-white text-sm font-semibold hover:bg-indigo-700"
        >
          <BookOpen className="w-4 h-4" />
          Về Kho đề thi
        </Link>
      </div>
    );
  }

  // Filter questions for review
  const filteredQuestionResults = scoring.questionResults.filter((qr) => {
    if (filter === "correct") return qr.isCorrect;
    if (filter === "incorrect") return !qr.isCorrect && !qr.isSkipped;
    if (filter === "skipped") return qr.isSkipped;
    if (filter === "flagged") return qr.isFlagged;
    return true;
  });

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      {/* Top Banner & Title */}
      <div className="space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <Link
            href="/exams"
            className="text-xs font-semibold text-slate-500 hover:text-slate-800 transition-colors flex items-center gap-1"
          >
            <span>← Quay lại Kho đề</span>
          </Link>

          <div className="flex items-center gap-2">
            {!hasSurveyed && (
              <button
                onClick={() => setShowSurveyModal(true)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200 hover:bg-indigo-100 transition-colors"
              >
                <MessageSquare className="w-3.5 h-3.5" />
                <span>Đánh giá đề</span>
              </button>
            )}

            <Link
              href={`/practice/${exam.id}?mode=${attempt.mode}`}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-slate-900 text-white hover:bg-slate-800 transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Làm lại đề</span>
            </Link>
          </div>
        </div>

        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          Kết quả: {exam.title}
        </h1>
        <p className="text-xs sm:text-sm text-slate-500">
          Chế độ: <strong className="text-slate-700">{attempt.mode === "practice" ? "Luyện tập" : "Thi thử"}</strong> • Thời gian đã làm: <strong className="text-slate-700">{formatTime(scoring.elapsedSeconds)}</strong>
        </p>
      </div>

      {/* Score Summary Card */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
          {/* Main Percentage Circle / Badge */}
          <div className="md:col-span-5 flex flex-col items-center justify-center p-6 rounded-2xl bg-gradient-to-b from-indigo-50/60 to-slate-50 border border-indigo-100/60 text-center space-y-2">
            <span className="text-xs font-bold uppercase tracking-wider text-indigo-700">
              Tỷ lệ chính xác (Raw Score)
            </span>
            <div className="text-5xl sm:text-6xl font-extrabold text-indigo-600 tracking-tight">
              {scoring.scorePercent}%
            </div>
            <p className="text-xs text-slate-500 font-medium">
              Đúng {scoring.correctCount} / {scoring.totalQuestions} câu hỏi
            </p>
          </div>

          {/* Detailed Metric Counters */}
          <div className="md:col-span-7 grid grid-cols-3 gap-3">
            <div className="p-4 rounded-xl bg-emerald-50/60 border border-emerald-100 text-center space-y-1">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 mx-auto" />
              <div className="text-2xl font-bold text-emerald-800">{scoring.correctCount}</div>
              <p className="text-[11px] text-emerald-600 font-semibold">Câu đúng</p>
            </div>

            <div className="p-4 rounded-xl bg-rose-50/60 border border-rose-100 text-center space-y-1">
              <XCircle className="w-5 h-5 text-rose-600 mx-auto" />
              <div className="text-2xl font-bold text-rose-800">{scoring.incorrectCount}</div>
              <p className="text-[11px] text-rose-600 font-semibold">Câu sai</p>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-center space-y-1">
              <HelpCircle className="w-5 h-5 text-slate-400 mx-auto" />
              <div className="text-2xl font-bold text-slate-700">{scoring.skippedCount}</div>
              <p className="text-[11px] text-slate-500 font-semibold">Bỏ trống</p>
            </div>

            <div className="col-span-3 p-3 rounded-xl bg-amber-50/70 border border-amber-200 text-amber-900 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
              <span>
                <strong>Lưu ý:</strong> Điểm số ở đây là tỷ lệ đúng thô (% raw score) nhằm mục đích tự đánh giá ôn tập, không tương đương điểm scaled score 0–180 của kỳ thi chính thức JLPT.
              </span>
            </div>
          </div>
        </div>

        {/* Section Stats Breakdown */}
        <div className="pt-4 border-t border-slate-100 space-y-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
            Thống kê theo kỹ năng
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {[
              { key: "vocabulary", label: "Chữ Hán & Từ vựng", stats: scoring.sectionStats.vocabulary },
              { key: "grammar", label: "Ngữ pháp", stats: scoring.sectionStats.grammar },
              { key: "reading", label: "Đọc hiểu", stats: scoring.sectionStats.reading },
            ].map((sec) => (
              <div key={sec.key} className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 space-y-2">
                <div className="flex items-center justify-between text-xs font-semibold text-slate-700">
                  <span>{sec.label}</span>
                  <span className="text-indigo-600 font-bold">{sec.stats.percent}%</span>
                </div>
                <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                  <div
                    className="bg-indigo-600 h-full rounded-full transition-all"
                    style={{ width: `${sec.stats.percent}%` }}
                  />
                </div>
                <div className="text-[11px] text-slate-500">
                  Đúng {sec.stats.correct} / {sec.stats.total} câu
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Review Section */}
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-slate-900">Xem lại lời giải chi tiết</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Phân tích cặn kẽ từng câu hỏi, dịch nghĩa và giải thích cả các lựa chọn sai
            </p>
          </div>

          {/* Review Filter Tabs */}
          <div className="flex flex-wrap items-center gap-1.5 p-1 bg-slate-100 rounded-xl">
            {[
              { id: "all", label: `Tất cả (${scoring.totalQuestions})` },
              { id: "correct", label: `Đúng (${scoring.correctCount})` },
              { id: "incorrect", label: `Sai (${scoring.incorrectCount})` },
              { id: "skipped", label: `Bỏ trống (${scoring.skippedCount})` },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setFilter(tab.id as any)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  filter === tab.id
                    ? "bg-white text-slate-900 shadow-xs"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* List of Questions with Explanation */}
        <div className="space-y-6">
          {filteredQuestionResults.length === 0 ? (
            <div className="py-12 text-center bg-white rounded-2xl border border-slate-200 p-6 text-slate-400 text-sm">
              Không có câu hỏi nào thuộc bộ lọc này
            </div>
          ) : (
            filteredQuestionResults.map((qr) => {
              const q = exam.questions.find((item) => item.id === qr.questionId);
              if (!q) return null;

              // Check if reading passage exists
              const passage = q.passageId ? exam.passages?.find((p) => p.id === q.passageId) : null;

              return (
                <div
                  key={q.id}
                  className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-6"
                >
                  {/* Question header */}
                  <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-900 text-base">
                        Câu {q.number || qr.number}
                      </span>
                      <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-600">
                        {q.section}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      {qr.isCorrect ? (
                        <span className="flex items-center gap-1 text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          Đúng
                        </span>
                      ) : qr.isSkipped ? (
                        <span className="flex items-center gap-1 text-xs font-bold text-slate-600 bg-slate-100 px-2.5 py-1 rounded-full border border-slate-200">
                          <HelpCircle className="w-3.5 h-3.5" />
                          Bỏ trống
                        </span>
                      ) : (
                        <span className="flex items-center gap-1 text-xs font-bold text-rose-700 bg-rose-50 px-2.5 py-1 rounded-full border border-rose-200">
                          <XCircle className="w-3.5 h-3.5" />
                          Sai
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Passage if any */}
                  {passage && (
                    <div className="mb-4">
                      <PassageViewer passage={passage} />
                    </div>
                  )}

                  {/* Question text */}
                  <div>
                    <p className="font-japanese text-slate-900 text-lg sm:text-xl font-medium leading-[1.8]">
                      {q.questionText}
                    </p>
                  </div>

                  {/* Explanation Component */}
                  <AnswerExplanation
                    question={q}
                    selectedOptionId={qr.selectedOptionId}
                  />
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Survey Modal */}
      <SurveyModal
        attemptId={attempt.attemptId}
        examId={exam.id}
        isOpen={showSurveyModal}
        onClose={() => setShowSurveyModal(false)}
        onSubmitted={() => setHasSurveyed(true)}
      />
    </div>
  );
}

