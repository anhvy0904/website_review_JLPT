"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { ExamQuestion } from "@/lib/types";
import { FuriganaRuby } from "./FuriganaRuby";
import { AITutorChat } from "./AITutorChat";
import { AnnotatedTextWithHanViet } from "./AnnotatedTextWithHanViet";
import { getHanViet, getQuestionKanjiTarget } from "@/lib/hanviet";
import {
  saveQuestionReport,
  isFlashcardSaved,
  saveFlashcard,
  removeFlashcard,
} from "@/lib/storage";
import {
  CheckCircle2,
  XCircle,
  Lightbulb,
  BookA,
  Sparkles,
  Quote,
  HelpCircle,
  AlertTriangle,
  Send,
  Check,
  ArrowRight,
  Plus,
  Trash2,
} from "lucide-react";

interface AnswerExplanationProps {
  question: ExamQuestion;
  selectedOptionId?: string;
  examId?: string;
  examTitle?: string;
  className?: string;
}

export function AnswerExplanation({
  question,
  selectedOptionId,
  examId,
  examTitle,
  className = "",
}: AnswerExplanationProps) {
  const isCorrect = selectedOptionId === question.correctOptionId;
  const isSkipped = !selectedOptionId;
  const { explanation } = question;

  const [showReportForm, setShowReportForm] = useState(false);
  const [issueType, setIssueType] = useState<"wrong_answer" | "unclear_explanation" | "typo" | "other">("wrong_answer");
  const [reportComment, setReportComment] = useState("");
  const [reportSuccess, setReportSuccess] = useState(false);

  const handleSendReport = (e: React.FormEvent) => {
    e.preventDefault();
    saveQuestionReport({
      questionId: question.id,
      issueType,
      comment: reportComment.trim() || undefined,
    });
    setReportSuccess(true);
    setTimeout(() => {
      setShowReportForm(false);
      setReportSuccess(false);
      setReportComment("");
    }, 1500);
  };

  const selectedOption = question.options.find((o) => o.id === selectedOptionId);
  const correctOption = question.options.find((o) => o.id === question.correctOptionId);
  const kanjiTarget = getQuestionKanjiTarget(question);

  // Determine examId & examTitle (explicit or inferred from questionId)
  const inferExamMeta = (qid: string) => {
    if (qid.startsWith("n3-best-moshi-01")) {
      return { id: "n3-best-moshi-01", title: "ベスト模試 N3 — Đề 1" };
    }
    if (qid.startsWith("n3-kanji-reading-50")) {
      return { id: "n3-kanji-reading-50", title: "Đề Thi Thực Chiến Chữ Hán - 50 Câu Đọc Kanji" };
    }
    if (qid.startsWith("n3-kanji-writing-46")) {
      return { id: "n3-kanji-writing-46", title: "Đề Thi Thực Chiến Chữ Hán - 46 Câu Viết Kanji" };
    }
    return { id: "general", title: "Kho Đề Thi JLPT N3" };
  };

  const inferred = inferExamMeta(question.id);
  const resolvedExamId = examId || inferred.id;
  const resolvedExamTitle = examTitle || inferred.title;

  const [savedVocab, setSavedVocab] = useState<Record<string, boolean>>({});

  useEffect(() => {
    if (explanation.vocabulary && explanation.vocabulary.length > 0) {
      const map: Record<string, boolean> = {};
      for (const v of explanation.vocabulary) {
        map[v.word] = isFlashcardSaved(v.word, resolvedExamId);
      }
      setSavedVocab(map);
    }
  }, [explanation.vocabulary, resolvedExamId]);

  const handleToggleFlashcard = (v: { word: string; hiragana: string; meaningVi: string }) => {
    const isSaved = !!savedVocab[v.word];
    if (isSaved) {
      removeFlashcard(v.word, resolvedExamId);
      setSavedVocab((prev) => ({ ...prev, [v.word]: false }));
    } else {
      saveFlashcard({
        word: v.word,
        reading: v.hiragana,
        meaning: v.meaningVi,
        sinoVietnamese: getHanViet(v.word),
        examId: resolvedExamId,
        examTitle: resolvedExamTitle,
        questionId: question.id,
      });
      setSavedVocab((prev) => ({ ...prev, [v.word]: true }));
    }
  };

  const handleAddAllVocabToFlashcard = () => {
    if (!explanation.vocabulary) return;
    const newMap = { ...savedVocab };
    for (const v of explanation.vocabulary) {
      saveFlashcard({
        word: v.word,
        reading: v.hiragana,
        meaning: v.meaningVi,
        sinoVietnamese: getHanViet(v.word),
        examId: resolvedExamId,
        examTitle: resolvedExamTitle,
        questionId: question.id,
      });
      newMap[v.word] = true;
    }
    setSavedVocab(newMap);
  };

  // Detect related learning module per PRD Addendum Section A3
  const getRelatedTopicLink = () => {
    const textToScan = `${question.subtype} ${(question.tags || []).join(" ")} ${question.questionText}`.toLowerCase();
    
    if (textToScan.includes("causative_passive") || textToScan.includes("使役受身") || textToScan.includes("bị động sai khiến")) {
      return { href: "/learn/verb-forms/causative-passive", label: "Thể bị động sai khiến (使役受身形)" };
    }
    if (textToScan.includes("causative") || textToScan.includes("使役") || textToScan.includes("sai khiến")) {
      return { href: "/learn/verb-forms/causative", label: "Thể sai khiến (使役形)" };
    }
    if (textToScan.includes("passive") || textToScan.includes("受身") || textToScan.includes("bị động")) {
      return { href: "/learn/verb-forms/passive", label: "Thể bị động (受身形)" };
    }
    if (textToScan.includes("potential") || textToScan.includes("可能") || textToScan.includes("khả năng")) {
      return { href: "/learn/verb-forms/potential", label: "Thể khả năng (可能形)" };
    }
    if (
      textToScan.includes("keigo") ||
      textToScan.includes("kính ngữ") ||
      textToScan.includes("khiêm nhường") ||
      textToScan.includes("敬語") ||
      textToScan.includes("謙譲語") ||
      textToScan.includes("尊敬語")
    ) {
      return { href: "/learn/keigo", label: "Kính ngữ & Khiêm nhường ngữ (敬語・謙譲語)" };
    }
    if (textToScan.includes("verb") || textToScan.includes("động từ") || textToScan.includes("thể")) {
      return { href: "/learn/verb-forms", label: "12 Thể Động Từ JLPT N3" };
    }
    return null;
  };

  const relatedTopic = getRelatedTopicLink();

  return (
    <div
      className={`rounded-2xl border transition-all ${
        isCorrect
          ? "border-emerald-200 bg-emerald-50/40"
          : isSkipped
          ? "border-amber-200 bg-amber-50/30"
          : "border-rose-200 bg-rose-50/30"
      } p-6 sm:p-7 shadow-sm ${className}`}
    >
      {/* Header Status */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-5 border-b border-slate-200/80">
        <div className="flex items-center gap-3">
          {isCorrect ? (
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-100 text-emerald-800 text-sm font-bold">
              <CheckCircle2 className="w-5 h-5 text-emerald-600" />
              CHÍNH XÁC!
            </div>
          ) : isSkipped ? (
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-amber-100 text-amber-800 text-sm font-bold">
              <HelpCircle className="w-5 h-5 text-amber-600" />
              CHƯA CHỌN ĐÁP ÁN
            </div>
          ) : (
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-rose-100 text-rose-800 text-sm font-bold">
              <XCircle className="w-5 h-5 text-rose-600" />
              CHƯA CHÍNH XÁC
            </div>
          )}

          <div className="text-sm text-slate-700">
            <span>Đáp án đúng: </span>
            <span className="font-bold text-emerald-700 px-2 py-0.5 rounded bg-emerald-100/80">
              [{correctOption?.id}] {correctOption?.text}
            </span>
          </div>
        </div>

        {!isCorrect && !isSkipped && selectedOption && (
          <div className="text-sm text-slate-600">
            <span>Bạn đã chọn: </span>
            <span className="font-semibold text-rose-700 px-2 py-0.5 rounded bg-rose-100/80">
              [{selectedOption.id}] {selectedOption.text}
            </span>
          </div>
        )}
      </div>

      <div className="space-y-6 pt-5">
        {/* Tóm tắt & Lý do đúng */}
        <div className="space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2 text-indigo-900 font-bold text-base">
              <Lightbulb className="w-5 h-5 text-amber-500" />
              <span>Phân tích đáp án</span>
            </div>
            {(question.mondai || question.weight) && (
              <div className="flex items-center gap-1.5 text-xs">
                {question.mondai && (
                  <span className="font-bold text-[#1B5E20] bg-[#E8F5E9] px-2 py-0.5 rounded border border-[#A5D6A7]">
                    {question.mondai}
                  </span>
                )}
                {question.weight && (
                  <span className="font-semibold text-amber-800 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                    Trọng số: {question.weight}đ
                  </span>
                )}
              </div>
            )}
          </div>

          {/* Khối Âm Hán Việt nổi bật của câu hỏi */}
          {kanjiTarget && (
            <div className="p-3.5 rounded-2xl bg-gradient-to-r from-[#E8F5E9] via-emerald-50/60 to-white border-2 border-[#A5D6A7] text-xs space-y-2.5 shadow-xs">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-lg bg-[#1B5E20] text-white text-xs flex items-center justify-center font-bold shadow-sm">
                    漢
                  </span>
                  <span className="text-xs font-bold uppercase tracking-wider text-[#1B5E20]">
                    Chữ Hán & Âm Hán Việt trọng tâm
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-japanese font-black text-slate-900 text-lg">
                    {kanjiTarget.targetJa}
                  </span>
                  <span className="px-2.5 py-1 rounded-lg bg-[#1B5E20] text-white font-black text-xs tracking-wider uppercase shadow-xs">
                    {kanjiTarget.hanViet}
                  </span>
                </div>
              </div>

              {kanjiTarget.breakdown && kanjiTarget.breakdown.length > 1 && (
                <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-[#A5D6A7]/50 text-[11px]">
                  <span className="text-slate-500 font-medium">Chi tiết từng chữ:</span>
                  {kanjiTarget.breakdown.map((item) => (
                    <span
                      key={item.kanji}
                      className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-lg bg-white border border-[#A5D6A7] text-slate-700 shadow-2xs"
                    >
                      <strong className="font-japanese text-[#1B5E20] text-xs font-bold">{item.kanji}</strong>
                      <span className="text-slate-300">•</span>
                      <span className="font-bold text-[#1B5E20]">{item.hanViet}</span>
                    </span>
                  ))}
                </div>
              )}
            </div>
          )}

          <div className="text-slate-800 font-medium text-sm leading-relaxed">
            <AnnotatedTextWithHanViet text={explanation.summaryVi} />
          </div>
          <div className="text-slate-700 text-sm leading-relaxed bg-white/70 p-3.5 rounded-xl border border-slate-200/70">
            <AnnotatedTextWithHanViet text={explanation.correctReasonVi} />
          </div>
        </div>

        {/* Giải thích chi tiết từng lựa chọn (Distractors) */}
        {explanation.optionReasonsVi && Object.keys(explanation.optionReasonsVi).length > 0 && (
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Giải thích chi tiết từng phương án
            </h4>
            <div className="grid grid-cols-1 gap-2.5">
              {question.options.map((opt) => {
                const isThisCorrect = opt.id === question.correctOptionId;
                const isThisSelected = opt.id === selectedOptionId;
                const reason = explanation.optionReasonsVi[opt.id] || "Chưa có lời giải";
                const optHanViet = getHanViet(opt.text);

                return (
                  <div
                    key={opt.id}
                    className={`p-3.5 rounded-xl border text-sm transition-all ${
                      isThisCorrect
                        ? "border-emerald-300 bg-emerald-50 text-emerald-950 font-medium"
                        : isThisSelected
                        ? "border-rose-300 bg-rose-50 text-rose-950"
                        : "border-slate-200 bg-white text-slate-700"
                    }`}
                  >
                    <div className="flex items-start gap-2.5">
                      <span
                        className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold shrink-0 ${
                          isThisCorrect
                            ? "bg-emerald-600 text-white"
                            : isThisSelected
                            ? "bg-rose-500 text-white"
                            : "bg-slate-200 text-slate-700"
                        }`}
                      >
                        {opt.id}
                      </span>
                      <div className="space-y-1 flex-1">
                        <div className="font-japanese font-semibold flex flex-wrap items-center gap-1.5">
                          <span>{opt.text}</span>
                          {optHanViet && (
                            <span className="font-sans text-[11px] font-bold text-[#1B5E20] bg-[#E8F5E9] px-2 py-0.5 rounded border border-[#A5D6A7]">
                              Hán Việt: {optHanViet}
                            </span>
                          )}
                          {isThisCorrect && (
                            <span className="ml-1 text-xs font-normal text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full font-sans">
                              (Đáp án đúng)
                            </span>
                          )}
                          {isThisSelected && !isThisCorrect && (
                            <span className="ml-1 text-xs font-normal text-rose-700 bg-rose-100 px-2 py-0.5 rounded-full font-sans">
                              (Lựa chọn của bạn)
                            </span>
                          )}
                        </div>
                        <div className="text-xs leading-relaxed text-slate-600">
                          <AnnotatedTextWithHanViet text={reason} />
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Dịch nghĩa tiếng Việt */}
        {explanation.translationVi && (
          <div className="space-y-1.5">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Dịch nghĩa tiếng Việt
            </span>
            <div className="p-3.5 rounded-xl bg-slate-100/90 border border-slate-200 text-slate-800 text-sm italic leading-relaxed">
              &ldquo;{explanation.translationVi}&rdquo;
            </div>
          </div>
        )}

        {/* Bằng chứng trong bài đọc (nếu có) */}
        {explanation.readingEvidenceJa && (
          <div className="space-y-1.5">
            <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-indigo-700">
              <Quote className="w-4 h-4" />
              <span>Câu văn bằng chứng trong bài đọc (Evidence)</span>
            </div>
            <div className="p-3.5 rounded-xl bg-indigo-50/70 border border-indigo-100 font-japanese text-indigo-950 text-sm leading-relaxed">
              {explanation.readingEvidenceJa}
            </div>
          </div>
        )}

        {/* Từ vựng quan trọng (với Furigana, Âm Hán Việt & Nút Flashcard) */}
        {explanation.vocabulary && explanation.vocabulary.length > 0 && (
          <div className="space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2 text-slate-900 font-semibold text-sm">
                <BookA className="w-4 h-4 text-[#1B5E20]" />
                <span>Từ vựng trọng tâm N3 ({explanation.vocabulary.length} từ)</span>
              </div>
              <button
                type="button"
                onClick={handleAddAllVocabToFlashcard}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#E8F5E9] hover:bg-[#A5D6A7]/40 text-[#1B5E20] border border-[#A5D6A7] text-xs font-bold transition-all shadow-2xs active:scale-95 cursor-pointer"
                title="Lưu tất cả từ vựng này vào Flashcard"
              >
                <Sparkles className="w-3.5 h-3.5 text-[#2E7D32]" />
                <span>+ Lưu cả bộ vào Flashcard</span>
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {explanation.vocabulary.map((v, i) => {
                const vHanViet = getHanViet(v.word);
                const isSaved = !!savedVocab[v.word];

                return (
                  <div
                    key={i}
                    className={`flex flex-col justify-between p-3.5 rounded-2xl border transition-all text-sm gap-2 ${
                      isSaved
                        ? "bg-[#E8F5E9]/50 border-[#A5D6A7] shadow-xs"
                        : "bg-white border-slate-200 hover:border-[#A5D6A7]"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="space-y-1">
                        <FuriganaRuby
                          word={v.word}
                          hiragana={v.hiragana}
                          className="text-base font-bold text-slate-900"
                        />
                        {vHanViet && (
                          <div className="text-[11px] font-bold text-[#1B5E20] flex items-center gap-1">
                            <span className="text-slate-400 font-normal">Hán Việt:</span>
                            <span className="px-1.5 py-0.2 rounded bg-white border border-[#A5D6A7]/70">
                              {vHanViet}
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Nút bấm Thêm vào Flashcard */}
                      <button
                        type="button"
                        onClick={() => handleToggleFlashcard(v)}
                        className={`inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 shadow-2xs active:scale-95 cursor-pointer ${
                          isSaved
                            ? "bg-[#1B5E20] text-white hover:bg-rose-600 border border-[#1B5E20]"
                            : "bg-[#E8F5E9] text-[#1B5E20] hover:bg-[#A5D6A7]/60 border border-[#A5D6A7]"
                        }`}
                        title={isSaved ? "Nhấn để xóa khỏi Flashcard" : "Lưu vào Flashcard để học"}
                      >
                        {isSaved ? (
                          <>
                            <Check className="w-3.5 h-3.5" />
                            <span>Đã lưu</span>
                          </>
                        ) : (
                          <>
                            <Plus className="w-3.5 h-3.5" />
                            <span>+ Flashcard</span>
                          </>
                        )}
                      </button>
                    </div>

                    <div className="pt-2 border-t border-slate-100/80 flex items-center justify-between text-xs gap-2">
                      <span className="text-slate-600 font-medium">{v.meaningVi}</span>
                      <span className="text-[10px] text-slate-400 truncate max-w-[130px]" title={resolvedExamTitle}>
                        📁 {resolvedExamTitle}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Điểm ngữ pháp (nếu có) */}
        {explanation.grammarPoints && explanation.grammarPoints.length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-slate-900 font-semibold text-sm">
              <Sparkles className="w-4 h-4 text-indigo-600" />
              <span>Cấu trúc ngữ pháp liên quan</span>
            </div>
            <div className="space-y-2.5">
              {explanation.grammarPoints.map((gp, i) => (
                <div
                  key={i}
                  className="p-3.5 rounded-xl bg-white border border-slate-200 text-sm space-y-2"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-bold text-indigo-600 font-japanese">
                      {gp.pattern}
                    </span>
                    <span className="text-xs font-semibold px-2 py-0.5 rounded bg-indigo-50 text-indigo-700">
                      {gp.meaningVi}
                    </span>
                  </div>
                  {gp.usageVi && (
                    <p className="text-xs text-slate-600 leading-relaxed">{gp.usageVi}</p>
                  )}
                  {gp.exampleJa && (
                    <div className="pt-1.5 border-t border-slate-100 text-xs">
                      <p className="font-japanese text-slate-800">{gp.exampleJa}</p>
                      {gp.exampleVi && <p className="text-slate-500 italic">{gp.exampleVi}</p>}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Mẹo làm bài (Study Tip) */}
        {explanation.studyTipVi && (
          <div className="flex items-start gap-3 p-3.5 rounded-xl bg-amber-50/80 border border-amber-200 text-xs text-amber-900">
            <Sparkles className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold">Mẹo nhận diện & Bẫy thường gặp: </span>
              <span className="leading-relaxed">
                <AnnotatedTextWithHanViet text={explanation.studyTipVi} />
              </span>
            </div>
          </div>
        )}

        {/* Chuyên đề liên quan (Cross-link to Learning Modules) */}
        {relatedTopic && (
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 rounded-2xl bg-[#E8F5E9] border-2 border-[#A5D6A7] text-xs">
            <div className="flex items-center gap-2.5 text-[#1B5E20]">
              <span className="text-base">📚</span>
              <div>
                <span className="font-semibold block sm:inline">Ôn lại chuyên đề ngữ pháp liên quan: </span>
                <strong className="text-[#2E7D32]">{relatedTopic.label}</strong>
              </div>
            </div>
            <Link
              href={relatedTopic.href}
              className="inline-flex items-center justify-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-[#1B5E20] hover:bg-[#2E7D32] text-white font-bold transition-all shrink-0 shadow-sm"
            >
              <span>Xem bài học</span>
              <ArrowRight className="w-3.5 h-3.5 text-[#A5D6A7]" />
            </Link>
          </div>
        )}

        {/* Module 4: Hỏi Sensei AI (AI Tutor) */}
        <AITutorChat
          question={question}
          selectedOptionId={selectedOptionId}
        />

        {/* Báo lỗi câu hỏi (Report Question) */}
        <div className="pt-3 border-t border-slate-200/60">
          {!showReportForm ? (
            <button
              type="button"
              onClick={() => setShowReportForm(true)}
              className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-slate-600 transition-colors"
            >
              <AlertTriangle className="w-3.5 h-3.5" />
              <span>Báo lỗi câu hỏi này</span>
            </button>
          ) : (
            <form onSubmit={handleSendReport} className="p-4 rounded-xl bg-white border border-slate-200 space-y-3 text-xs">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-800 flex items-center gap-1.5">
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />
                  Báo lỗi câu hỏi (ID: {question.id})
                </span>
                <button
                  type="button"
                  onClick={() => setShowReportForm(false)}
                  className="text-slate-400 hover:text-slate-600"
                >
                  Đóng
                </button>
              </div>

              {reportSuccess ? (
                <div className="py-2 text-emerald-600 font-semibold flex items-center gap-1.5">
                  <Check className="w-4 h-4" />
                  Đã ghi nhận báo lỗi! Cảm ơn bạn.
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { id: "wrong_answer", label: "Đáp án không đúng" },
                      { id: "unclear_explanation", label: "Lời giải khó hiểu" },
                      { id: "typo", label: "Lỗi chính tả" },
                      { id: "other", label: "Lỗi khác" },
                    ].map((item) => (
                      <label
                        key={item.id}
                        className={`p-2 rounded-lg border cursor-pointer flex items-center gap-2 transition-colors ${
                          issueType === item.id
                            ? "border-indigo-600 bg-indigo-50 text-indigo-900 font-semibold"
                            : "border-slate-200 text-slate-600 hover:bg-slate-50"
                        }`}
                      >
                        <input
                          type="radio"
                          name="issueType"
                          checked={issueType === item.id}
                          onChange={() => setIssueType(item.id as any)}
                          className="w-3 h-3 text-indigo-600"
                        />
                        <span>{item.label}</span>
                      </label>
                    ))}
                  </div>

                  <textarea
                    value={reportComment}
                    onChange={(e) => setReportComment(e.target.value)}
                    rows={2}
                    placeholder="Mô tả cụ thể vấn đề (tùy chọn)..."
                    className="w-full p-2.5 rounded-lg border border-slate-200 text-xs text-slate-800 focus:outline-none focus:border-indigo-500"
                  />

                  <div className="flex justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => setShowReportForm(false)}
                      className="px-3 py-1.5 rounded-lg text-slate-600 hover:bg-slate-100"
                    >
                      Hủy
                    </button>
                    <button
                      type="submit"
                      className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-indigo-600 text-white font-semibold hover:bg-indigo-700"
                    >
                      <Send className="w-3 h-3" />
                      Gửi báo lỗi
                    </button>
                  </div>
                </>
              )}
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

