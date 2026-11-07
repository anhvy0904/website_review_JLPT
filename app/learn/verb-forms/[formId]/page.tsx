"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { FuriganaToggle } from "@/components/FuriganaToggle";
import { FuriganaRuby } from "@/components/FuriganaRuby";
import { LearningQuizPlayer, LearningQuizItem } from "@/components/LearningQuizPlayer";
import { markLessonCompleted, getLearningProgress } from "@/lib/learningStorage";
import {
  ArrowLeft,
  BookOpen,
  Volume2,
  CheckCircle2,
  AlertTriangle,
  Sparkles,
  Layers,
  ChevronRight,
  Info,
} from "lucide-react";

interface VerbLessonDetail {
  id: string;
  formId: string;
  titleJa: string;
  reading: string;
  titleVi: string;
  conceptVi: string;
  whenToUseVi: string;
  nuanceVi: string;
  rulesByGroup: {
    godan: string;
    ichidan: string;
    irregular: string;
  };
  soundChanges?: Array<{ ending: string; result: string; examples: string }>;
  exceptions?: Array<{
    base: string;
    reading: string;
    result: string;
    resultReading: string;
    note: string;
  }>;
  verbExamples: Array<{
    kanji: string;
    reading: string;
    group: string;
    result: string;
    resultReading: string;
    meaningVi: string;
  }>;
  sentenceExamples: Array<{
    ja: string;
    furigana: Array<{ text: string; ruby: string }>;
    vi: string;
  }>;
  commonMistakesVi: string;
}

function renderSentenceWithRuby(
  text: string,
  items?: Array<{ text: string; ruby: string }>,
  showRuby = true
) {
  if (!items || items.length === 0 || !showRuby) return <span>{text}</span>;

  let elements: React.ReactNode[] = [text];
  for (const item of items) {
    const nextElements: React.ReactNode[] = [];
    for (const el of elements) {
      if (typeof el === "string" && el.includes(item.text)) {
        const parts = el.split(item.text);
        parts.forEach((part, idx) => {
          if (part) nextElements.push(part);
          if (idx < parts.length - 1) {
            nextElements.push(
              <FuriganaRuby key={`${item.text}-${idx}`} word={item.text} hiragana={item.ruby} />
            );
          }
        });
      } else {
        nextElements.push(el);
      }
    }
    elements = nextElements;
  }
  return <span>{elements}</span>;
}

export default function VerbFormDetailPage() {
  const params = useParams();
  const formId = params?.formId as string;

  const [lesson, setLesson] = useState<VerbLessonDetail | null>(null);
  const [quizzes, setQuizzes] = useState<LearningQuizItem[]>([]);
  const [showFurigana, setShowFurigana] = useState(true);
  const [isCompleted, setIsCompleted] = useState(false);

  useEffect(() => {
    if (!formId) return;

    // Load lesson JSON
    fetch(`/data/learning/verb-forms/${formId}.json`)
      .then((res) => {
        if (!res.ok) throw new Error("Không tìm thấy bài học thể này");
        return res.json();
      })
      .then((data: VerbLessonDetail) => {
        setLesson(data);
        markLessonCompleted("verb-forms", formId);
        setIsCompleted(true);
      })
      .catch((err) => console.error(err));

    // Load quizzes for this form
    fetch("/data/learning/quizzes/verb-forms-quizzes.json")
      .then((res) => res.json())
      .then((allQuizzes: LearningQuizItem[]) => {
        if (Array.isArray(allQuizzes)) {
          // Filter quizzes belonging to this form or general verb quizzes
          const matched = allQuizzes.filter(
            (q) => q.formId === formId || (!q.formId && formId === "te")
          );
          setQuizzes(matched.length > 0 ? matched : allQuizzes.slice(0, 3));
        }
      })
      .catch((err) => console.error(err));

    const p = getLearningProgress();
    setShowFurigana(p.furiganaVisible);
  }, [formId]);

  const speak = (text: string) => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text);
    u.lang = "ja-JP";
    u.rate = 0.9;
    window.speechSynthesis.speak(u);
  };

  if (!lesson) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center space-y-3">
          <div className="w-8 h-8 rounded-full border-2 border-blue-600 border-t-transparent animate-spin mx-auto" />
          <p className="text-xs text-slate-500">Đang tải nội dung bài học...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f3f8fd] py-10 px-4 sm:px-6 lg:px-8 space-y-8">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Navigation Breadcrumb */}
        <div className="flex items-center justify-between">
          <Link
            href="/learn/verb-forms"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-blue-600 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Quay lại danh mục 12 Thể</span>
          </Link>

          <div className="flex items-center gap-3">
            <FuriganaToggle visible={showFurigana} onToggle={setShowFurigana} />
            {isCompleted && (
              <span className="flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Đã ghi nhận hoàn thành</span>
              </span>
            )}
          </div>
        </div>

        {/* HERO TITLE CARD */}
        <div className="bg-white p-7 sm:p-9 rounded-3xl border border-slate-200/90 shadow-sm space-y-4">
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-blue-100 text-blue-800">
              Chuyên đề Động từ N3
            </span>
            <span className="text-xs font-semibold text-slate-400 font-mono">
              /learn/verb-forms/{lesson.id}
            </span>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-2 border-b border-slate-100 pb-4">
            <div>
              <div className="text-4xl sm:text-5xl font-extrabold text-[#3a86ff] font-japanese tracking-wide">
                {lesson.titleJa}
              </div>
              <span className="text-xs font-bold text-slate-400 font-japanese">
                【{lesson.reading}】
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
              {lesson.titleVi}
            </h1>
          </div>

          <p className="text-sm text-slate-700 leading-relaxed">
            {lesson.conceptVi}
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
            <div className="p-4 rounded-2xl bg-blue-50/60 border border-blue-100 space-y-1">
              <span className="text-[11px] font-bold text-blue-800 uppercase tracking-wider block">
                Khi nào sử dụng?
              </span>
              <p className="text-xs text-slate-700 leading-relaxed">
                {lesson.whenToUseVi}
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-1">
              <span className="text-[11px] font-bold text-slate-700 uppercase tracking-wider block">
                Sắc thái ngữ nghĩa & Mức độ lịch sự
              </span>
              <p className="text-xs text-slate-600 leading-relaxed">
                {lesson.nuanceVi}
              </p>
            </div>
          </div>
        </div>

        {/* SECTION 2: BẢNG CÔNG THỨC THEO NHÓM I, II, III */}
        <div className="bg-white p-7 sm:p-9 rounded-3xl border border-slate-200/90 shadow-sm space-y-5">
          <div className="flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-blue-600" />
            <h2 className="text-lg font-bold text-slate-900">
              Quy Tắc Biến Đổi Theo 3 Nhóm Động Từ
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Group 1 */}
            <div className="p-5 rounded-2xl bg-amber-50/60 border border-amber-200/80 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-amber-900 uppercase tracking-wider">
                  Nhóm I (五段)
                </span>
                <span className="text-[10px] bg-amber-200/70 text-amber-900 px-2 py-0.5 rounded-md font-semibold">
                  Ngũ đoạn
                </span>
              </div>
              <p className="text-xs text-slate-700 whitespace-pre-line leading-relaxed font-japanese">
                {lesson.rulesByGroup.godan}
              </p>
            </div>

            {/* Group 2 */}
            <div className="p-5 rounded-2xl bg-emerald-50/60 border border-emerald-200/80 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-emerald-900 uppercase tracking-wider">
                  Nhóm II (一段)
                </span>
                <span className="text-[10px] bg-emerald-200/70 text-emerald-900 px-2 py-0.5 rounded-md font-semibold">
                  Nhất đoạn
                </span>
              </div>
              <p className="text-xs text-slate-700 whitespace-pre-line leading-relaxed font-japanese">
                {lesson.rulesByGroup.ichidan}
              </p>
            </div>

            {/* Group 3 */}
            <div className="p-5 rounded-2xl bg-purple-50/60 border border-purple-200/80 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-purple-900 uppercase tracking-wider">
                  Nhóm III (不規則)
                </span>
                <span className="text-[10px] bg-purple-200/70 text-purple-900 px-2 py-0.5 rounded-md font-semibold">
                  Bất quy tắc
                </span>
              </div>
              <p className="text-xs text-slate-700 whitespace-pre-line leading-relaxed font-japanese">
                {lesson.rulesByGroup.irregular}
              </p>
            </div>
          </div>

          {/* Sound changes if available */}
          {lesson.soundChanges && lesson.soundChanges.length > 0 && (
            <div className="pt-3 space-y-2">
              <span className="text-xs font-bold text-slate-700 block">
                Bảng biến âm chi tiết theo từng hàng chữ Hán:
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                {lesson.soundChanges.map((sc, i) => (
                  <div key={i} className="p-3 rounded-xl bg-slate-50 border border-slate-200/70 flex items-center justify-between gap-2">
                    <span className="font-bold text-slate-800 font-japanese">
                      {sc.ending} → <b className="text-blue-600">{sc.result}</b>
                    </span>
                    <span className="text-[11px] text-slate-500 font-japanese truncate">
                      {sc.examples}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Exceptions if any */}
          {lesson.exceptions && lesson.exceptions.length > 0 && (
            <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-xs space-y-1 text-rose-900">
              <div className="flex items-center gap-1.5 font-bold">
                <AlertTriangle className="w-4 h-4 text-rose-600" />
                <span>Ngoại lệ bắt buộc phải ghi nhớ:</span>
              </div>
              {lesson.exceptions.map((ex, i) => (
                <div key={i} className="leading-relaxed">
                  <b className="font-japanese text-sm">{ex.base}</b> ({ex.reading}) →{" "}
                  <b className="font-japanese text-sm text-rose-700">{ex.result}</b> ({ex.resultReading}).{" "}
                  <span className="text-slate-600">{ex.note}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* SECTION 3: VÍ DỤ TỪ ÍT NHẤT 3 ĐỘNG TỪ MẪU */}
        <div className="bg-white p-7 sm:p-9 rounded-3xl border border-slate-200/90 shadow-sm space-y-5">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-slate-900">
              Bảng Động Từ Mẫu Minh Họa
            </h2>
            <span className="text-xs text-slate-400">
              Đầy đủ Nhóm I, Nhóm II và Bất quy tắc
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {lesson.verbExamples.map((ex, idx) => (
              <div
                key={idx}
                className="p-4 rounded-2xl border border-slate-200/80 bg-slate-50/50 flex items-center justify-between gap-3 hover:border-blue-300 transition-all"
              >
                <div className="space-y-0.5">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    {ex.group}
                  </span>
                  <div className="flex items-baseline gap-2">
                    <span className="text-lg font-extrabold text-slate-900 font-japanese">
                      {ex.kanji}
                    </span>
                    {showFurigana && (
                      <span className="text-xs text-slate-500 font-japanese">
                        ({ex.reading})
                      </span>
                    )}
                    <span className="text-slate-400">→</span>
                    <span className="text-lg font-extrabold text-blue-600 font-japanese">
                      {ex.result}
                    </span>
                  </div>
                  <p className="text-xs text-slate-600">{ex.meaningVi}</p>
                </div>

                <button
                  type="button"
                  onClick={() => speak(ex.resultReading || ex.result)}
                  className="p-2.5 rounded-xl bg-white text-slate-500 hover:text-blue-600 border border-slate-200 hover:border-blue-300 shadow-sm transition-all"
                  title="Nghe phát âm"
                >
                  <Volume2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* SECTION 4: VÍ DỤ CÂU VĂN NHẬT - VIỆT */}
        <div className="bg-white p-7 sm:p-9 rounded-3xl border border-slate-200/90 shadow-sm space-y-5">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-slate-900">
              Ví Dụ Câu Văn Thực Tế Có Furigana
            </h2>
            <FuriganaToggle visible={showFurigana} onToggle={setShowFurigana} />
          </div>

          <div className="space-y-3">
            {lesson.sentenceExamples.map((sent, idx) => (
              <div
                key={idx}
                className="p-4 rounded-2xl bg-indigo-50/40 border border-indigo-100/80 space-y-2"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="text-base sm:text-lg font-semibold text-slate-900 font-japanese leading-relaxed">
                    {renderSentenceWithRuby(sent.ja, sent.furigana, showFurigana)}
                  </div>

                  <button
                    type="button"
                    onClick={() => speak(sent.ja)}
                    className="p-2 rounded-xl text-indigo-600 hover:bg-indigo-100 shrink-0 transition-colors"
                    title="Nghe câu ví dụ"
                  >
                    <Volume2 className="w-4 h-4" />
                  </button>
                </div>

                <p className="text-xs sm:text-sm text-slate-600 font-medium">
                  {sent.vi}
                </p>
              </div>
            ))}
          </div>

          {/* Common Mistakes */}
          <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200 text-xs space-y-1 text-amber-950">
            <div className="flex items-center gap-1.5 font-bold">
              <Info className="w-4 h-4 text-amber-700" />
              <span>Lỗi sai & Điểm nhầm lẫn thường gặp:</span>
            </div>
            <p className="leading-relaxed text-amber-900">{lesson.commonMistakesVi}</p>
          </div>
        </div>

        {/* SECTION 5: QUIZZES FOR THIS FORM */}
        {quizzes.length > 0 && (
          <LearningQuizPlayer
            module="verb-forms"
            quizzes={quizzes}
            title={`Bài Tập Trắc Nghiệm: ${lesson.titleJa} (${lesson.titleVi})`}
          />
        )}
      </div>
    </div>
  );
}
