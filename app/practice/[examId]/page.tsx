"use client";

import React, { useEffect, useState, useMemo, useRef, useCallback, Suspense } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { ExamDetail, ExamAttempt, ExamMode } from "@/lib/types";
import { saveAttempt, getActiveAttempt } from "@/lib/storage";
import { formatTime } from "@/lib/utils";
import { QuestionCard } from "@/components/QuestionCard";
import { PassageViewer } from "@/components/PassageViewer";
import { ExamNavigator } from "@/components/ExamNavigator";
import {
  Clock,
  ArrowLeft,
  AlertTriangle,
  CheckCircle2,
  ListFilter,
  X,
  Pause,
  Play,
  RotateCcw,
} from "lucide-react";

function PracticeContent() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();

  const examId = params?.examId as string;
  const initialMode = (searchParams.get("mode") as ExamMode) || "practice";

  const [exam, setExam] = useState<ExamDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Attempt State
  const [attemptId, setAttemptId] = useState<string>("");
  const [mode, setMode] = useState<ExamMode>(initialMode);
  const [currentQuestionId, setCurrentQuestionId] = useState<string>("");
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [checkedQuestionIds, setCheckedQuestionIds] = useState<string[]>([]);
  const [flaggedQuestionIds, setFlaggedQuestionIds] = useState<string[]>([]);
  const [elapsedSeconds, setElapsedSeconds] = useState<number>(0);
  const [startedAt, setStartedAt] = useState<string>("");

  // Modals & UI
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [showMobileNavigator, setShowMobileNavigator] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Load Exam and Attempt
  useEffect(() => {
    if (!examId) return;

    fetch(`/data/exams/${examId}.json`)
      .then(async (res) => {
        if (!res.ok) throw new Error("Không thể tải dữ liệu đề thi");
        return res.json();
      })
      .then((data: ExamDetail) => {
        setExam(data);

        // Check if an in_progress attempt already exists in localStorage
        const active = getActiveAttempt(examId);
        if (active && active.mode === initialMode) {
          setAttemptId(active.attemptId);
          setMode(active.mode);
          setAnswers(active.answers || {});
          setCheckedQuestionIds(active.checkedQuestionIds || []);
          setFlaggedQuestionIds(active.flaggedQuestionIds || []);
          setElapsedSeconds(active.elapsedSeconds || 0);
          setStartedAt(active.startedAt || new Date().toISOString());

          // Find question to resume to
          if (active.currentQuestionId && data.questions.some((q) => q.id === active.currentQuestionId)) {
            setCurrentQuestionId(active.currentQuestionId);
          } else {
            setCurrentQuestionId(data.questions[0]?.id || "");
          }
        } else {
          // Initialize fresh attempt
          const newId = `att-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
          const nowIso = new Date().toISOString();
          const firstQId = data.questions[0]?.id || "";

          setAttemptId(newId);
          setMode(initialMode);
          setAnswers({});
          setCheckedQuestionIds([]);
          setFlaggedQuestionIds([]);
          setElapsedSeconds(0);
          setStartedAt(nowIso);
          setCurrentQuestionId(firstQId);

          const newAttempt: ExamAttempt = {
            attemptId: newId,
            examId: data.id,
            examTitle: data.title,
            mode: initialMode,
            startedAt: nowIso,
            submittedAt: null,
            elapsedSeconds: 0,
            answers: {},
            checkedQuestionIds: [],
            flaggedQuestionIds: [],
            currentQuestionId: firstQId,
            status: "in_progress",
          };
          saveAttempt(newAttempt);
        }
      })
      .catch((err) => {
        console.error("Lỗi:", err);
        setError("Đề thi không tồn tại hoặc có lỗi khi tải.");
      })
      .finally(() => setLoading(false));
  }, [examId, initialMode]);

  // Auto-save attempt whenever state changes
  useEffect(() => {
    if (!attemptId || !exam) return;

    const attempt: ExamAttempt = {
      attemptId,
      examId: exam.id,
      examTitle: exam.title,
      mode,
      startedAt,
      submittedAt: null,
      elapsedSeconds,
      answers,
      checkedQuestionIds,
      flaggedQuestionIds,
      currentQuestionId,
      status: "in_progress",
    };

    saveAttempt(attempt);
  }, [
    attemptId,
    exam,
    mode,
    startedAt,
    elapsedSeconds,
    answers,
    checkedQuestionIds,
    flaggedQuestionIds,
    currentQuestionId,
  ]);

  // Submit Handler
  const handleSubmitExam = useCallback(() => {
    if (!exam || !attemptId || isSubmitting) return;
    setIsSubmitting(true);

    const completedAttempt: ExamAttempt = {
      attemptId,
      examId: exam.id,
      examTitle: exam.title,
      mode,
      startedAt,
      submittedAt: new Date().toISOString(),
      elapsedSeconds,
      answers,
      checkedQuestionIds,
      flaggedQuestionIds,
      currentQuestionId,
      status: "completed",
    };

    saveAttempt(completedAttempt);
    router.push(`/results/${attemptId}`);
  }, [
    exam,
    attemptId,
    isSubmitting,
    mode,
    startedAt,
    elapsedSeconds,
    answers,
    checkedQuestionIds,
    flaggedQuestionIds,
    currentQuestionId,
    router,
  ]);

  // Timer Hook
  useEffect(() => {
    if (loading || !exam || isSubmitting) return;

    const timer = setInterval(() => {
      setElapsedSeconds((prev) => {
        const next = prev + 1;

        // Auto-submit if exam mode and time exceeded
        if (mode === "exam" && exam.settings.timeLimitMinutes > 0) {
          const maxSeconds = exam.settings.timeLimitMinutes * 60;
          if (next >= maxSeconds) {
            clearInterval(timer);
            handleSubmitExam();
            return maxSeconds;
          }
        }

        return next;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [loading, exam, mode, isSubmitting, handleSubmitExam]);

  // Current Question and Index
  const currentQuestionIndex = useMemo(() => {
    if (!exam) return 0;
    const idx = exam.questions.findIndex((q) => q.id === currentQuestionId);
    return idx >= 0 ? idx : 0;
  }, [exam, currentQuestionId]);

  const currentQuestion = exam?.questions[currentQuestionIndex];

  // Passage (if associated)
  const currentPassage = useMemo(() => {
    if (!exam || !currentQuestion?.passageId) return null;
    return exam.passages?.find((p) => p.id === currentQuestion.passageId) || null;
  }, [exam, currentQuestion]);

  // Options & Navigation Handlers
  const handleSelectOption = (optionId: string) => {
    if (!currentQuestion) return;
    setAnswers((prev) => ({
      ...prev,
      [currentQuestion.id]: optionId,
    }));
  };

  const handleToggleFlag = () => {
    if (!currentQuestion) return;
    setFlaggedQuestionIds((prev) =>
      prev.includes(currentQuestion.id)
        ? prev.filter((id) => id !== currentQuestion.id)
        : [...prev, currentQuestion.id]
    );
  };

  const handleCheckAnswer = () => {
    if (!currentQuestion || mode !== "practice") return;
    if (!checkedQuestionIds.includes(currentQuestion.id)) {
      setCheckedQuestionIds((prev) => [...prev, currentQuestion.id]);
    }
  };

  const handleNextQuestion = () => {
    if (!exam) return;
    if (currentQuestionIndex < exam.questions.length - 1) {
      setCurrentQuestionId(exam.questions[currentQuestionIndex + 1].id);
    } else if (mode === "practice") {
      setShowSubmitModal(true);
    }
  };

  const handlePrevQuestion = () => {
    if (!exam) return;
    if (currentQuestionIndex > 0) {
      setCurrentQuestionId(exam.questions[currentQuestionIndex - 1].id);
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-24 text-center text-slate-400">
        Đang chuẩn bị đề thi...
      </div>
    );
  }

  if (error || !exam || !currentQuestion) {
    return (
      <div className="max-w-xl mx-auto px-4 py-20 text-center space-y-4">
        <h2 className="text-xl font-bold text-slate-800">Không thể tải đề thi</h2>
        <p className="text-sm text-slate-500">{error || "Dữ liệu câu hỏi bị lỗi."}</p>
        <Link
          href="/exams"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 text-white text-sm font-semibold hover:bg-indigo-700"
        >
          <ArrowLeft className="w-4 h-4" />
          Quay lại danh sách đề
        </Link>
      </div>
    );
  }

  // Calculate timer display
  const totalSecondsAllowed = exam.settings.timeLimitMinutes * 60;
  const remainingSeconds = Math.max(0, totalSecondsAllowed - elapsedSeconds);
  const isTimeCritical = mode === "exam" && remainingSeconds < 300; // < 5 mins

  // Unanswered count for submission modal
  const answeredCount = Object.keys(answers).filter((k) => answers[k] && answers[k] !== "").length;
  const unansweredCount = exam.questions.length - answeredCount;

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Sticky Test Header Bar */}
      <div className="sticky top-0 z-30 bg-white/95 backdrop-blur border-b border-slate-200 px-4 sm:px-6 py-3 shadow-xs">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-3">
          {/* Left: Back & Title */}
          <div className="flex items-center gap-3">
            <Link
              href={`/exams/${exam.id}`}
              className="p-2 rounded-xl text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors"
              title="Quay lại chi tiết đề"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>

            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-bold text-slate-900 text-sm sm:text-base line-clamp-1 max-w-xs sm:max-w-md">
                  {exam.title}
                </h1>
                <span className="text-[11px] font-semibold px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-700 hidden sm:inline-block">
                  {mode === "practice" ? "Luyện tập" : "Thi thử"}
                </span>
              </div>
              <p className="text-[11px] text-slate-500">
                Câu {currentQuestionIndex + 1} / {exam.questions.length} • Đã trả lời {answeredCount} câu
              </p>
            </div>
          </div>

          {/* Right: Timer & Submit Button */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Timer Badge */}
            <div
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-mono text-xs font-bold border transition-colors ${
                mode === "exam"
                  ? isTimeCritical
                    ? "bg-rose-50 text-rose-700 border-rose-300 animate-pulse"
                    : "bg-slate-100 text-slate-800 border-slate-200"
                  : "bg-indigo-50 text-indigo-700 border-indigo-200"
              }`}
            >
              <Clock className="w-4 h-4 text-slate-500" />
              <span>
                {mode === "exam" ? formatTime(remainingSeconds) : formatTime(elapsedSeconds)}
              </span>
            </div>

            {/* Mobile navigator button */}
            <button
              onClick={() => setShowMobileNavigator(!showMobileNavigator)}
              className="lg:hidden p-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-100"
              title="Danh sách câu hỏi"
            >
              <ListFilter className="w-5 h-5" />
            </button>

            {/* Submit Button */}
            <button
              onClick={() => setShowSubmitModal(true)}
              className="px-4 py-2 rounded-xl bg-indigo-600 text-white text-xs sm:text-sm font-bold shadow-sm hover:bg-indigo-700 active:scale-95 transition-all"
            >
              Nộp bài
            </button>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Main Question + Passage Column */}
          <div
            className={`space-y-6 ${
              currentPassage ? "lg:col-span-8" : "lg:col-span-9"
            }`}
          >
            {/* If reading question with passage, display side-by-side or stacked */}
            {currentPassage && (
              <div className="mb-6">
                <PassageViewer passage={currentPassage} />
              </div>
            )}

            <QuestionCard
              question={currentQuestion}
              questionIndex={currentQuestionIndex}
              totalQuestions={exam.questions.length}
              selectedOptionId={answers[currentQuestion.id]}
              isFlagged={flaggedQuestionIds.includes(currentQuestion.id)}
              isChecked={checkedQuestionIds.includes(currentQuestion.id)}
              mode={mode}
              examId={exam.id}
              examTitle={exam.title}
              onSelectOption={handleSelectOption}
              onToggleFlag={handleToggleFlag}
              onCheckAnswer={handleCheckAnswer}
              onNext={handleNextQuestion}
              onPrev={handlePrevQuestion}
              onSubmitExam={() => setShowSubmitModal(true)}
            />
          </div>

          {/* Desktop Sidebar Navigator */}
          <div
            className={`hidden lg:block sticky top-24 ${
              currentPassage ? "lg:col-span-4" : "lg:col-span-3"
            }`}
          >
            <ExamNavigator
              questions={exam.questions}
              currentQuestionId={currentQuestion.id}
              answers={answers}
              flaggedQuestionIds={flaggedQuestionIds}
              checkedQuestionIds={checkedQuestionIds}
              mode={mode}
              onSelectQuestion={(id) => setCurrentQuestionId(id)}
            />
          </div>
        </div>
      </div>

      {/* Mobile Drawer Navigator Modal */}
      {showMobileNavigator && (
        <div className="lg:hidden fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
          <div className="w-full max-w-md bg-white rounded-2xl shadow-xl border border-slate-200 p-5 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h3 className="font-bold text-slate-900 text-sm">Danh sách câu hỏi</h3>
              <button
                onClick={() => setShowMobileNavigator(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <ExamNavigator
              questions={exam.questions}
              currentQuestionId={currentQuestion.id}
              answers={answers}
              flaggedQuestionIds={flaggedQuestionIds}
              checkedQuestionIds={checkedQuestionIds}
              mode={mode}
              onSelectQuestion={(id) => {
                setCurrentQuestionId(id);
                setShowMobileNavigator(false);
              }}
            />
          </div>
        </div>
      )}

      {/* Confirm Submit Modal */}
      {showSubmitModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-md bg-white rounded-3xl p-6 sm:p-7 shadow-2xl border border-slate-100 space-y-5">
            <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-6 h-6" />
            </div>

            <div className="text-center space-y-2">
              <h3 className="text-lg font-bold text-slate-900">
                Xác nhận nộp bài thi?
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Sau khi nộp bài, hệ thống sẽ chấm điểm và mở toàn bộ lời giải chi tiết bằng tiếng Việt.
              </p>
            </div>

            {/* Warning if questions are unanswered */}
            {unansweredCount > 0 && (
              <div className="flex items-center gap-3 p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs">
                <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0" />
                <span>
                  Bạn vẫn còn <strong className="font-bold text-amber-800">{unansweredCount} câu</strong> chưa trả lời. Bạn có chắc muốn nộp ngay?
                </span>
              </div>
            )}

            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowSubmitModal(false)}
                className="flex-1 py-3 rounded-xl border border-slate-200 text-slate-700 text-sm font-semibold hover:bg-slate-50 transition-colors"
              >
                Làm tiếp
              </button>

              <button
                type="button"
                disabled={isSubmitting}
                onClick={handleSubmitExam}
                className="flex-1 py-3 rounded-xl bg-indigo-600 text-white text-sm font-bold shadow-md hover:bg-indigo-700 active:scale-95 transition-all disabled:opacity-50"
              >
                {isSubmitting ? "Đang chấm điểm..." : "Nộp bài ngay"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function PracticePage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-slate-50 text-slate-500 text-sm">
          Đang tải phòng thi...
        </div>
      }
    >
      <PracticeContent />
    </Suspense>
  );
}

