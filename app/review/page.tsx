"use client";

import React, { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import { ExamDetail, ExamQuestion } from "@/lib/types";
import { getAllAttempts, getBookmarkedQuestions, toggleBookmarkQuestion } from "@/lib/storage";
import { AnswerExplanation } from "@/components/AnswerExplanation";
import { PassageViewer } from "@/components/PassageViewer";
import { FormattedQuestionText } from "@/components/FormattedQuestionText";
import {
  RotateCcw,
  BookOpen,
  Filter,
  CheckCircle2,
  XCircle,
  Flag,
  Trash2,
  ArrowRight,
  Eye,
  EyeOff,
  Sparkles,
} from "lucide-react";

interface ReviewItem {
  question: ExamQuestion;
  examTitle: string;
  examId: string;
  sourceType: "wrong" | "flagged";
  userAnswer?: string;
}

export default function ReviewPage() {
  const [reviewItems, setReviewItems] = useState<ReviewItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSection, setSelectedSection] = useState<string>("all");
  const [revealedIds, setRevealedIds] = useState<Record<string, boolean>>({});
  const [drillAnswers, setDrillAnswers] = useState<Record<string, string>>({});

  useEffect(() => {
    const attempts = getAllAttempts();
    const bookmarks = new Set(getBookmarkedQuestions());

    // Gather unique exams
    const examIds = Array.from(new Set(attempts.map((a) => a.examId)));

    Promise.all(
      examIds.map((id) =>
        fetch(`/data/exams/${id}.json`)
          .then((res) => (res.ok ? res.json() : null))
          .catch(() => null)
      )
    )
      .then((examsList: (ExamDetail | null)[]) => {
        const examMap: Record<string, ExamDetail> = {};
        examsList.forEach((e) => {
          if (e && e.id) examMap[e.id] = e;
        });

        const itemsMap: Record<string, ReviewItem> = {};

        // Find wrong answers in attempts
        attempts.forEach((att) => {
          const exam = examMap[att.examId];
          if (!exam) return;

          exam.questions.forEach((q) => {
            const userAns = att.answers[q.id];
            const isFlagged = Array.isArray(att.flaggedQuestionIds) && att.flaggedQuestionIds.includes(q.id);
            const isBookmarked = bookmarks.has(q.id);

            if (userAns && userAns !== q.correctOptionId) {
              itemsMap[q.id] = {
                question: q,
                examTitle: exam.title,
                examId: exam.id,
                sourceType: "wrong",
                userAnswer: userAns,
              };
            } else if (isFlagged || isBookmarked) {
              if (!itemsMap[q.id]) {
                itemsMap[q.id] = {
                  question: q,
                  examTitle: exam.title,
                  examId: exam.id,
                  sourceType: "flagged",
                  userAnswer: userAns,
                };
              }
            }
          });
        });

        setReviewItems(Object.values(itemsMap));
      })
      .finally(() => setLoading(false));
  }, []);

  // Filter items
  const filteredItems = useMemo(() => {
    return reviewItems.filter((item) => {
      if (selectedSection !== "all" && item.question.section !== selectedSection) {
        return false;
      }
      return true;
    });
  }, [reviewItems, selectedSection]);

  const toggleReveal = (qId: string) => {
    setRevealedIds((prev) => ({
      ...prev,
      [qId]: !prev[qId],
    }));
  };

  const handleSelectDrillOption = (qId: string, optId: string) => {
    setDrillAnswers((prev) => ({
      ...prev,
      [qId]: optId,
    }));
    // Auto reveal explanation when answered
    setRevealedIds((prev) => ({
      ...prev,
      [qId]: true,
    }));
  };

  const handleRemoveBookmark = (qId: string) => {
    toggleBookmarkQuestion(qId);
    setReviewItems((prev) => prev.filter((item) => item.question.id !== qId));
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header */}
      <div className="space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#E8F5E9] border border-[#A5D6A7] text-[#1B5E20] text-xs font-semibold">
          <RotateCcw className="w-3.5 h-3.5 text-[#2E7D32]" />
          <span>Sổ tay ôn tập câu sai & câu ghim • Cùng VuyAnh 🌸</span>
        </div>
        <h1 className="text-3xl font-extrabold text-[#1B5E20] tracking-tight">
          Ôn Tập Câu Sai & Đã Ghim
        </h1>
        <p className="text-sm text-slate-600 max-w-2xl">
          Tập trung rèn luyện các câu hỏi bạn từng trả lời chưa chính xác để khắc phục triệt để lỗ hổng kiến thức trước kỳ thi.
        </p>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
        <div className="flex flex-wrap items-center gap-2">
          {[
            { id: "all", label: `Tất cả (${reviewItems.length})` },
            { id: "vocabulary", label: "Từ vựng" },
            { id: "grammar", label: "Ngữ pháp" },
            { id: "reading", label: "Đọc hiểu" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setSelectedSection(tab.id)}
              className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
                selectedSection === tab.id
                  ? "bg-indigo-600 text-white shadow-sm"
                  : "bg-slate-50 text-slate-600 hover:bg-slate-100 border border-slate-200/60"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <span className="text-xs text-slate-500">
          Đang hiển thị {filteredItems.length} câu
        </span>
      </div>

      {/* Review List */}
      {loading ? (
        <div className="py-20 text-center text-slate-400 text-sm">Đang tải danh sách câu hỏi...</div>
      ) : filteredItems.length === 0 ? (
        <div className="py-16 text-center bg-white rounded-3xl border border-slate-200 p-8 space-y-3">
          <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto" />
          <h3 className="text-lg font-bold text-slate-900">Không có câu hỏi nào cần ôn tập!</h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            Tuyệt vời! Bạn chưa có câu sai nào trong danh sách hoặc đã giải đúng toàn bộ các câu hỏi.
          </p>
          <div className="pt-2">
            <Link
              href="/exams"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 text-white text-xs font-semibold hover:bg-indigo-700"
            >
              <BookOpen className="w-4 h-4" />
              Luyện thêm đề mới
            </Link>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          {filteredItems.map((item, index) => {
            const { question, examTitle, sourceType } = item;
            const isRevealed = Boolean(revealedIds[question.id]);
            const selectedOpt = drillAnswers[question.id];

            return (
              <div
                key={question.id}
                className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-6"
              >
                {/* Meta header */}
                <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-100">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-900 text-base">
                      Câu #{index + 1}
                    </span>
                    <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700">
                      {question.section}
                    </span>
                    <span className="text-xs text-slate-400 font-normal hidden sm:inline-block">
                      • {examTitle}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    {sourceType === "wrong" ? (
                      <span className="flex items-center gap-1 text-[11px] font-bold text-rose-700 bg-rose-50 px-2.5 py-1 rounded-full border border-rose-200">
                        <XCircle className="w-3.5 h-3.5" />
                        Từng làm sai
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 text-[11px] font-bold text-amber-700 bg-amber-50 px-2.5 py-1 rounded-full border border-amber-200">
                        <Flag className="w-3.5 h-3.5 fill-amber-500" />
                        Đã ghim
                      </span>
                    )}

                    <button
                      onClick={() => handleRemoveBookmark(question.id)}
                      className="p-1.5 text-slate-300 hover:text-rose-600 rounded-lg hover:bg-slate-50 transition-colors"
                      title="Xóa khỏi danh sách ôn tập"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Question Text */}
                <div>
                  <p className="font-japanese text-slate-900 text-xl font-medium leading-[1.8]">
                    <FormattedQuestionText text={question.questionText} />
                  </p>
                </div>

                {/* Options drill */}
                <div className="space-y-2.5">
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    Làm lại câu hỏi này:
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {question.options.map((opt) => {
                      const isChosen = selectedOpt === opt.id;
                      const isCorrect = isRevealed && opt.id === question.correctOptionId;
                      const isWrongChoice = isRevealed && isChosen && !isCorrect;

                      let style = "border-slate-200 hover:border-indigo-300 bg-slate-50/50 text-slate-800";
                      if (isCorrect) {
                        style = "border-emerald-500 bg-emerald-50 text-emerald-950 font-semibold ring-1 ring-emerald-500";
                      } else if (isWrongChoice) {
                        style = "border-rose-400 bg-rose-50 text-rose-950 ring-1 ring-rose-400";
                      } else if (isChosen) {
                        style = "border-indigo-600 bg-indigo-50 text-indigo-900";
                      }

                      return (
                        <button
                          key={opt.id}
                          type="button"
                          onClick={() => handleSelectDrillOption(question.id, opt.id)}
                          className={`p-3.5 rounded-xl border text-left text-sm flex items-center gap-3 transition-all ${style}`}
                        >
                          <span className="w-6 h-6 rounded-lg bg-white border border-slate-300 text-xs font-bold flex items-center justify-center shrink-0">
                            {opt.id}
                          </span>
                          <span className="font-japanese text-base">{opt.text}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Toggle show/hide explanation */}
                <div className="pt-2">
                  <button
                    onClick={() => toggleReveal(question.id)}
                    className="inline-flex items-center gap-2 text-xs font-bold text-indigo-600 hover:text-indigo-800 transition-colors"
                  >
                    {isRevealed ? (
                      <>
                        <EyeOff className="w-4 h-4" />
                        <span>Thu gọn lời giải chi tiết</span>
                      </>
                    ) : (
                      <>
                        <Eye className="w-4 h-4" />
                        <span>Xem lời giải chi tiết & bản dịch</span>
                      </>
                    )}
                  </button>
                </div>

                {/* Render AnswerExplanation if revealed */}
                {isRevealed && (
                  <div className="pt-2">
                    <AnswerExplanation
                      question={question}
                      selectedOptionId={selectedOpt || item.userAnswer}
                      examId={item.examId}
                      examTitle={item.examTitle}
                    />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

