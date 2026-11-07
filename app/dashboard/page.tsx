"use client";

import React, { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import { ExamAttempt, ExamDetail, ExamSurvey } from "@/lib/types";
import { getAllAttempts, getAllSurveys, deleteAttempt } from "@/lib/storage";
import { formatTime, formatDate } from "@/lib/utils";
import { StatsCharts } from "@/components/StatsCharts";
import {
  Trophy,
  Target,
  Clock,
  BookCheck,
  RotateCcw,
  Compass,
  ArrowRight,
  TrendingUp,
  AlertTriangle,
  Star,
  MessageSquare,
  Trash2,
  Layers,
  Crown,
  CheckCircle2,
} from "lucide-react";
import {
  getVerbFormsStats,
  getKeigoStats,
  getLearningProgress,
} from "@/lib/learningStorage";

export default function DashboardPage() {
  const [activeTab, setActiveTab] = useState<"overview" | "exams" | "verbs" | "keigo">("overview");
  const [attempts, setAttempts] = useState<ExamAttempt[]>([]);
  const [surveys, setSurveys] = useState<ExamSurvey[]>([]);
  const [examMap, setExamMap] = useState<Record<string, ExamDetail>>({});
  const [loading, setLoading] = useState(true);
  const [learningProgress, setLearningProgress] = useState(getLearningProgress());

  useEffect(() => {
    const loadedAttempts = getAllAttempts();
    setAttempts(loadedAttempts);
    setSurveys(getAllSurveys());

    // Fetch exam details for all attempts to compute detailed section and subtype stats
    const uniqueExamIds = Array.from(new Set(loadedAttempts.map((a) => a.examId)));
    Promise.all(
      uniqueExamIds.map((id) =>
        fetch(`/data/exams/${id}.json`)
          .then((res) => (res.ok ? res.json() : null))
          .catch(() => null)
      )
    )
      .then((examsList) => {
        const map: Record<string, ExamDetail> = {};
        examsList.forEach((e) => {
          if (e && e.id) map[e.id] = e;
        });
        setExamMap(map);
      })
      .finally(() => setLoading(false));
  }, []);

  const completedAttempts = attempts.filter((a) => a.status === "completed");

  // Compute Overall KPIs
  const stats = useMemo(() => {
    let totalQuestionsPracticed = 0;
    let totalCorrectAnswers = 0;
    let totalSeconds = 0;

    const sectionCounts = {
      vocabulary: { correct: 0, total: 0 },
      grammar: { correct: 0, total: 0 },
      reading: { correct: 0, total: 0 },
    };

    const subtypeErrors: Record<string, number> = {};

    completedAttempts.forEach((attempt) => {
      totalSeconds += attempt.elapsedSeconds || 0;
      const exam = examMap[attempt.examId];
      if (!exam) return;

      exam.questions.forEach((q) => {
        const userAns = attempt.answers[q.id];
        if (userAns) {
          totalQuestionsPracticed++;
          const isCorrect = userAns === q.correctOptionId;

          if (isCorrect) {
            totalCorrectAnswers++;
            if (sectionCounts[q.section]) sectionCounts[q.section].correct++;
          } else {
            const sub = q.subtype || "general";
            subtypeErrors[sub] = (subtypeErrors[sub] || 0) + 1;
          }

          if (sectionCounts[q.section]) sectionCounts[q.section].total++;
        }
      });
    });

    const averagePercent =
      totalQuestionsPracticed > 0
        ? Math.round((totalCorrectAnswers / totalQuestionsPracticed) * 1000) / 10
        : 0;

    // Weakest subtypes sorted by error count
    const weakSubtypes = Object.entries(subtypeErrors)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([subtype, errorCount]) => ({ subtype, errorCount }));

    return {
      totalCompleted: completedAttempts.length,
      totalQuestionsPracticed,
      totalCorrectAnswers,
      averagePercent,
      totalSeconds,
      sectionCounts,
      weakSubtypes,
    };
  }, [completedAttempts, examMap]);

  // Prepare chart data
  const historyChartData = useMemo(() => {
    return completedAttempts
      .slice()
      .reverse()
      .map((att, idx) => {
        const exam = examMap[att.examId];
        let correct = 0;
        let total = exam ? exam.questions.length : 1;
        if (exam) {
          exam.questions.forEach((q) => {
            if (att.answers[q.id] === q.correctOptionId) correct++;
          });
        }
        const percent = Math.round((correct / total) * 1000) / 10;
        return {
          attemptNumber: idx + 1,
          title: att.examTitle || att.examId,
          percent,
          date: att.submittedAt ? att.submittedAt.split("T")[0] : "",
        };
      });
  }, [completedAttempts, examMap]);

  const sectionChartData = useMemo(() => {
    const sec = stats.sectionCounts;
    return [
      {
        name: "Từ vựng",
        percent: sec.vocabulary.total > 0 ? Math.round((sec.vocabulary.correct / sec.vocabulary.total) * 100) : 0,
        correct: sec.vocabulary.correct,
        total: sec.vocabulary.total,
      },
      {
        name: "Ngữ pháp",
        percent: sec.grammar.total > 0 ? Math.round((sec.grammar.correct / sec.grammar.total) * 100) : 0,
        correct: sec.grammar.correct,
        total: sec.grammar.total,
      },
      {
        name: "Đọc hiểu",
        percent: sec.reading.total > 0 ? Math.round((sec.reading.correct / sec.reading.total) * 100) : 0,
        correct: sec.reading.correct,
        total: sec.reading.total,
      },
    ];
  }, [stats]);

  // Survey averages
  const surveyAverages = useMemo(() => {
    if (surveys.length === 0) return null;
    const avgDiff = surveys.reduce((acc, s) => acc + s.difficultyRating, 0) / surveys.length;
    const avgUseful = surveys.reduce((acc, s) => acc + s.usefulnessRating, 0) / surveys.length;
    return {
      count: surveys.length,
      avgDifficulty: Math.round(avgDiff * 10) / 10,
      avgUsefulness: Math.round(avgUseful * 10) / 10,
    };
  }, [surveys]);

  const handleDeleteAttempt = (attemptId: string) => {
    if (confirm("Bạn có chắc muốn xóa lịch sử lượt làm này?")) {
      deleteAttempt(attemptId);
      setAttempts(getAllAttempts());
    }
  };

  const verbStats = useMemo(() => getVerbFormsStats(), [learningProgress]);
  const keigoStats = useMemo(() => getKeigoStats(), [learningProgress]);

  const verbCards = [
    { id: "te", nameJa: "て形", nameVi: "Thể て" },
    { id: "ta", nameJa: "た形", nameVi: "Thể た" },
    { id: "nai", nameJa: "ない形", nameVi: "Thể phủ định ない" },
    { id: "dictionary", nameJa: "辞書形", nameVi: "Thể từ điển" },
    { id: "ba", nameJa: "ば形", nameVi: "Thể điều kiện ば" },
    { id: "volitional", nameJa: "意向形", nameVi: "Thể ý chí" },
    { id: "imperative", nameJa: "命令形", nameVi: "Thể mệnh lệnh" },
    { id: "prohibitive", nameJa: "禁止形", nameVi: "Thể cấm đoán" },
    { id: "potential", nameJa: "可能形", nameVi: "Thể khả năng" },
    { id: "passive", nameJa: "受身形", nameVi: "Thể bị động" },
    { id: "causative", nameJa: "使役形", nameVi: "Thể sai khiến" },
    { id: "causative-passive", nameJa: "使役受身形", nameVi: "Thể bị động sai khiến" },
  ];

  const keigoTopics = [
    { id: "sonkeigo", nameJa: "尊敬語", nameVi: "Tôn kính ngữ" },
    { id: "kenjougo", nameJa: "謙譲語", nameVi: "Khiêm nhường ngữ" },
    { id: "teineigo", nameJa: "丁寧語", nameVi: "Lịch sự ngữ" },
    { id: "uchisoto", nameJa: "内・外の法則", nameVi: "Nguyên tắc Trong - Ngoài" },
    { id: "special-verbs", nameJa: "特別敬語動詞", nameVi: "Động từ đặc biệt" },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Page Title & Navigation Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-200 text-indigo-700 text-xs font-semibold">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>Báo cáo tiến độ học tập N3</span>
          </div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
            Thống Kê Tiến Độ Cá Nhân
          </h1>
        </div>

        {/* 4 Tabs Selector per PRD Addendum F1 */}
        <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-2xl self-start sm:self-auto text-xs font-bold">
          <button
            type="button"
            onClick={() => setActiveTab("overview")}
            className={`px-3.5 py-2 rounded-xl transition-all ${
              activeTab === "overview"
                ? "bg-white text-slate-900 shadow-sm"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            Tổng quan
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("exams")}
            className={`px-3.5 py-2 rounded-xl transition-all ${
              activeTab === "exams"
                ? "bg-white text-indigo-700 shadow-sm"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            Đề thi
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("verbs")}
            className={`px-3.5 py-2 rounded-xl transition-all ${
              activeTab === "verbs"
                ? "bg-white text-blue-700 shadow-sm"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            Chia động từ
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("keigo")}
            className={`px-3.5 py-2 rounded-xl transition-all ${
              activeTab === "keigo"
                ? "bg-white text-emerald-700 shadow-sm"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            Kính ngữ
          </button>
        </div>
      </div>

      {/* ============================================================== */}
      {/* TAB 1: TỔNG QUAN (OVERVIEW) */}
      {/* ============================================================== */}
      {activeTab === "overview" && (
        <div className="space-y-8">
          {/* Top Overall KPIs */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-1">
              <span className="text-xs font-semibold text-slate-500">Đề thi hoàn thành</span>
              <div className="text-3xl font-extrabold text-slate-900">{stats.totalCompleted}</div>
              <p className="text-xs text-slate-400">bài làm đã nộp</p>
            </div>
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-1">
              <span className="text-xs font-semibold text-slate-500">Độ chính xác đề</span>
              <div className="text-3xl font-extrabold text-indigo-600">{stats.averagePercent}%</div>
              <p className="text-xs text-slate-400">tỉ lệ đúng thô (raw %)</p>
            </div>
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-1">
              <span className="text-xs font-semibold text-slate-500">Thể động từ đã học</span>
              <div className="text-3xl font-extrabold text-blue-600">
                {verbStats.completedCount} / 12
              </div>
              <p className="text-xs text-slate-400">{verbStats.percentCompleted}% hoàn thành</p>
            </div>
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-1">
              <span className="text-xs font-semibold text-slate-500">Kính ngữ đã học</span>
              <div className="text-3xl font-extrabold text-emerald-600">
                {keigoStats.completedCount} / 5
              </div>
              <p className="text-xs text-slate-400">{keigoStats.percentCompleted}% hoàn thành</p>
            </div>
          </div>

          {/* Module Summary Banner Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-6 rounded-3xl bg-gradient-to-r from-blue-50 to-indigo-50/40 border border-blue-200/80 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-blue-800 uppercase tracking-wider">
                  Chuyên Đề A: Chia Động Từ
                </span>
                <span className="text-xs font-bold text-blue-700 bg-white px-2.5 py-0.5 rounded-full shadow-sm">
                  {verbStats.percentCompleted}%
                </span>
              </div>
              <h3 className="text-lg font-bold text-slate-900 font-japanese">
                12 Thể Động Từ Tiếng Nhật
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Đã học: <b>{verbStats.completedCount}/12 thể</b>. Trắc nghiệm: <b>{verbStats.totalQuizzesTaken} câu</b> (Độ chính xác: <b>{verbStats.accuracy}%</b>).
              </p>
              <Link
                href="/learn/verb-forms"
                className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-700 hover:text-blue-900 pt-1"
              >
                <span>Mở trang 12 Thể Động Từ</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="p-6 rounded-3xl bg-gradient-to-r from-emerald-50 to-teal-50/40 border border-emerald-200/80 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-emerald-800 uppercase tracking-wider">
                  Chuyên Đề B: Kính Ngữ Công Sở
                </span>
                <span className="text-xs font-bold text-emerald-700 bg-white px-2.5 py-0.5 rounded-full shadow-sm">
                  {keigoStats.percentCompleted}%
                </span>
              </div>
              <h3 className="text-lg font-bold text-slate-900 font-japanese">
                Kính Ngữ & Khiêm Nhường Ngữ
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Đã học: <b>{keigoStats.completedCount}/5 chủ đề</b>. Trắc nghiệm: <b>{keigoStats.totalQuizzesTaken} câu</b> (Độ chính xác: <b>{keigoStats.accuracy}%</b>).
              </p>
              <Link
                href="/learn/keigo"
                className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-700 hover:text-emerald-900 pt-1"
              >
                <span>Mở trang Kính Ngữ Công Sở</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>

          {/* Charts if completed attempts exist */}
          {completedAttempts.length > 0 && (
            <StatsCharts historyData={historyChartData} sectionData={sectionChartData} />
          )}
        </div>
      )}

      {/* ============================================================== */}
      {/* TAB 2: ĐỀ THI (EXAMS) */}
      {/* ============================================================== */}
      {activeTab === "exams" && (
        <div className="space-y-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-1">
              <span className="text-xs font-semibold text-slate-500">Đề hoàn thành</span>
              <div className="text-3xl font-extrabold text-slate-900">{stats.totalCompleted}</div>
              <p className="text-xs text-slate-400">bài làm đã nộp</p>
            </div>
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-1">
              <span className="text-xs font-semibold text-slate-500">Câu đã luyện</span>
              <div className="text-3xl font-extrabold text-slate-900">{stats.totalQuestionsPracticed}</div>
              <p className="text-xs text-slate-400">câu hỏi trắc nghiệm</p>
            </div>
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-1">
              <span className="text-xs font-semibold text-slate-500">Độ chính xác TB</span>
              <div className="text-3xl font-extrabold text-indigo-600">{stats.averagePercent}%</div>
              <p className="text-xs text-slate-400">tỉ lệ đúng thô (raw %)</p>
            </div>
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-1">
              <span className="text-xs font-semibold text-slate-500">Thời gian học</span>
              <div className="text-3xl font-extrabold text-slate-900">{formatTime(stats.totalSeconds)}</div>
              <p className="text-xs text-slate-400">phút:giây tích lũy</p>
            </div>
          </div>

          {completedAttempts.length > 0 && (
            <StatsCharts historyData={historyChartData} sectionData={sectionChartData} />
          )}

          {/* Weak Subtypes & Survey */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-7 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-amber-500" />
                  <h3 className="font-bold text-slate-900 text-base">Phân tích điểm yếu</h3>
                </div>
                <Link
                  href="/review"
                  className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 flex items-center gap-1"
                >
                  <span>Ôn lại câu sai</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>

              {stats.weakSubtypes.length === 0 ? (
                <p className="text-xs text-slate-400 py-6 text-center">
                  Chưa ghi nhận câu sai nào. Hãy tiếp tục duy trì phong độ tốt!
                </p>
              ) : (
                <div className="space-y-3">
                  <p className="text-xs text-slate-500">
                    Các dạng bài bạn có số lần chọn nhầm nhiều nhất:
                  </p>
                  <div className="space-y-2">
                    {stats.weakSubtypes.map((w, idx) => (
                      <div
                        key={idx}
                        className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200/80 text-xs"
                      >
                        <span className="font-semibold text-slate-800 font-japanese">
                          {w.subtype}
                        </span>
                        <span className="font-bold text-rose-600 bg-rose-50 px-2.5 py-1 rounded-md border border-rose-200">
                          Sai {w.errorCount} lần
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="lg:col-span-5 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
              <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
                <MessageSquare className="w-5 h-5 text-indigo-600" />
                <h3 className="font-bold text-slate-900 text-base">Khảo sát cảm nhận đã gửi</h3>
              </div>

              {!surveyAverages ? (
                <p className="text-xs text-slate-400 py-6 text-center">
                  Bạn chưa gửi đánh giá nào sau khi làm đề thi.
                </p>
              ) : (
                <div className="space-y-4 pt-1">
                  <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-600">Số lượt phản hồi:</span>
                      <strong className="text-slate-900">{surveyAverages.count} lượt</strong>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-600">Độ khó đề thi trung bình:</span>
                      <div className="flex items-center gap-1 font-bold text-amber-600">
                        <Star className="w-3.5 h-3.5 fill-amber-500" />
                        <span>{surveyAverages.avgDifficulty} / 5</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-600">Mức hữu ích của lời giải:</span>
                      <div className="flex items-center gap-1 font-bold text-emerald-600">
                        <Star className="w-3.5 h-3.5 fill-emerald-500" />
                        <span>{surveyAverages.avgUsefulness} / 5</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* TAB 3: CHIA ĐỘNG TỪ (VERBS) */}
      {/* ============================================================== */}
      {activeTab === "verbs" && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-1">
              <span className="text-xs font-semibold text-slate-500">Thể đã xem & học</span>
              <div className="text-3xl font-extrabold text-blue-600">
                {verbStats.completedCount} / 12
              </div>
              <p className="text-xs text-slate-400">{verbStats.percentCompleted}% hoàn thành</p>
            </div>
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-1">
              <span className="text-xs font-semibold text-slate-500">Số câu trắc nghiệm đã làm</span>
              <div className="text-3xl font-extrabold text-slate-900">
                {verbStats.totalQuizzesTaken}
              </div>
              <p className="text-xs text-slate-400">câu hỏi thực hành chia thể</p>
            </div>
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-1">
              <span className="text-xs font-semibold text-slate-500">Độ chính xác chia thể</span>
              <div className="text-3xl font-extrabold text-emerald-600">
                {verbStats.accuracy}%
              </div>
              <p className="text-xs text-slate-400">tỉ lệ câu trả lời đúng</p>
            </div>
          </div>

          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-5">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold text-slate-900 text-lg">Tiến Độ 12 Thể Động Từ</h3>
                <p className="text-xs text-slate-500">Bấm vào bất kỳ thể nào để ôn tập lại</p>
              </div>
              <Link
                href="/learn/verb-forms"
                className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-sm transition-all"
              >
                Mở trung tâm 12 Thể →
              </Link>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
              {verbCards.map((c) => {
                const isDone = learningProgress.completedVerbLessons.includes(c.id);
                return (
                  <Link
                    key={c.id}
                    href={`/learn/verb-forms/${c.id}`}
                    className="p-4 rounded-2xl border border-slate-200/90 hover:border-blue-300 hover:bg-blue-50/20 transition-all space-y-1 group"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-lg font-bold text-slate-900 font-japanese group-hover:text-blue-700 transition-colors">
                        {c.nameJa}
                      </span>
                      {isDone ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      ) : (
                        <span className="w-2 h-2 rounded-full bg-slate-300" />
                      )}
                    </div>
                    <span className="text-xs text-slate-500 block">{c.nameVi}</span>
                  </Link>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* TAB 4: KÍNH NGỮ (KEIGO) */}
      {/* ============================================================== */}
      {activeTab === "keigo" && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-1">
              <span className="text-xs font-semibold text-slate-500">Chủ đề kính ngữ đã học</span>
              <div className="text-3xl font-extrabold text-emerald-600">
                {keigoStats.completedCount} / 5
              </div>
              <p className="text-xs text-slate-400">{keigoStats.percentCompleted}% hoàn thành</p>
            </div>
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-1">
              <span className="text-xs font-semibold text-slate-500">Số câu trắc nghiệm đã làm</span>
              <div className="text-3xl font-extrabold text-slate-900">
                {keigoStats.totalQuizzesTaken}
              </div>
              <p className="text-xs text-slate-400">câu tình huống công sở</p>
            </div>
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-1">
              <span className="text-xs font-semibold text-slate-500">Độ chính xác kính ngữ</span>
              <div className="text-3xl font-extrabold text-emerald-600">
                {keigoStats.accuracy}%
              </div>
              <p className="text-xs text-slate-400">tỉ lệ câu trả lời đúng</p>
            </div>
          </div>

          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-5">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold text-slate-900 text-lg">5 Chủ Đề Kính Ngữ Cốt Lõi</h3>
                <p className="text-xs text-slate-500">Tôn kính ngữ, Khiêm nhường ngữ, Lịch sự ngữ, Trong-Ngoài</p>
              </div>
              <Link
                href="/learn/keigo"
                className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-sm transition-all"
              >
                Mở trung tâm Kính Ngữ →
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {keigoTopics.map((t) => {
                const isDone = learningProgress.completedKeigoLessons.includes(t.id);
                return (
                  <Link
                    key={t.id}
                    href={`/learn/keigo/${t.id}`}
                    className="p-4 rounded-2xl border border-slate-200/90 hover:border-emerald-300 hover:bg-emerald-50/20 transition-all space-y-1 group"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-lg font-bold text-slate-900 font-japanese group-hover:text-emerald-700 transition-colors">
                        {t.nameJa}
                      </span>
                      {isDone ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      ) : (
                        <span className="w-2 h-2 rounded-full bg-slate-300" />
                      )}
                    </div>
                    <span className="text-xs text-slate-500 block">{t.nameVi}</span>
                  </Link>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* History Table (shows for overview & exams) */}
      {(activeTab === "overview" || activeTab === "exams") && (
        <section className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div>
            <h3 className="font-bold text-slate-900 text-lg">Lịch sử các lượt làm đề</h3>
            <p className="text-xs text-slate-500 mt-0.5">Danh sách các bài làm được lưu tại trình duyệt</p>
          </div>
        </div>

        {attempts.length === 0 ? (
          <div className="py-12 text-center text-slate-400 text-sm space-y-3">
            <Compass className="w-10 h-10 text-slate-300 mx-auto" />
            <p>Bạn chưa làm bài nào. Hãy chọn một đề để bắt đầu luyện tập!</p>
            <Link
              href="/exams"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 text-white text-xs font-semibold hover:bg-indigo-700"
            >
              Xem kho đề thi
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-600">
              <thead className="bg-slate-50 text-slate-700 font-semibold border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4">Thời điểm</th>
                  <th className="py-3 px-4">Bộ đề</th>
                  <th className="py-3 px-4">Chế độ</th>
                  <th className="py-3 px-4">Đã làm</th>
                  <th className="py-3 px-4">Thời gian</th>
                  <th className="py-3 px-4">Trạng thái</th>
                  <th className="py-3 px-4 text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {attempts.map((att) => {
                  const answeredCount = Object.keys(att.answers || {}).length;
                  return (
                    <tr key={att.attemptId} className="hover:bg-slate-50/60 transition-colors">
                      <td className="py-3 px-4 whitespace-nowrap text-slate-500">
                        {formatDate(att.startedAt)}
                      </td>
                      <td className="py-3 px-4 font-medium text-slate-900">
                        {att.examTitle || att.examId}
                      </td>
                      <td className="py-3 px-4">
                        <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                          {att.mode === "practice" ? "Luyện tập" : "Thi thử"}
                        </span>
                      </td>
                      <td className="py-3 px-4 font-semibold text-indigo-600">
                        {answeredCount} câu
                      </td>
                      <td className="py-3 px-4 font-mono">{formatTime(att.elapsedSeconds)}</td>
                      <td className="py-3 px-4">
                        {att.status === "completed" ? (
                          <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-100 text-emerald-800">
                            Đã nộp
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-blue-100 text-blue-800">
                            Đang làm dở
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-right space-x-2">
                        {att.status === "completed" ? (
                          <Link
                            href={`/results/${att.attemptId}`}
                            className="inline-flex items-center gap-1 font-semibold text-indigo-600 hover:text-indigo-800"
                          >
                            <span>Xem kết quả</span>
                            <ArrowRight className="w-3.5 h-3.5" />
                          </Link>
                        ) : (
                          <Link
                            href={`/practice/${att.examId}?mode=${att.mode}`}
                            className="inline-flex items-center gap-1 font-semibold text-blue-600 hover:text-blue-800"
                          >
                            <span>Tiếp tục</span>
                            <ArrowRight className="w-3.5 h-3.5" />
                          </Link>
                        )}

                        <button
                          onClick={() => handleDeleteAttempt(att.attemptId)}
                          className="p-1 text-slate-300 hover:text-rose-600 transition-colors"
                          title="Xóa lượt này"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>
      )}
    </div>
  );
}

