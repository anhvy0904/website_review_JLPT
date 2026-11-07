"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { LearningQuizPlayer, LearningQuizItem } from "@/components/LearningQuizPlayer";
import { markLessonCompleted } from "@/lib/learningStorage";
import {
  ArrowLeft,
  Crown,
  UserCheck,
  Sparkles,
  Compass,
  Table,
  CheckCircle2,
  AlertTriangle,
  BookOpen,
  Volume2,
} from "lucide-react";

export default function KeigoTopicDetailPage() {
  const params = useParams();
  const topicId = params?.topicId as string;

  const [topicData, setTopicData] = useState<any>(null);
  const [quizzes, setQuizzes] = useState<LearningQuizItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!topicId) return;

    fetch(`/data/learning/keigo/${topicId}.json`)
      .then((res) => {
        if (!res.ok) throw new Error("Không tìm thấy chủ đề kính ngữ này");
        return res.json();
      })
      .then((data) => {
        setTopicData(data);
        markLessonCompleted("keigo", topicId);
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));

    // Load quizzes
    fetch("/data/learning/quizzes/keigo-quizzes.json")
      .then((res) => res.json())
      .then((allQuizzes: LearningQuizItem[]) => {
        if (Array.isArray(allQuizzes)) {
          const matched = allQuizzes.filter((q) => q.topicId === topicId);
          setQuizzes(matched.length > 0 ? matched : allQuizzes);
        }
      })
      .catch((err) => console.error(err));
  }, [topicId]);

  const speak = (text: string) => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text);
    u.lang = "ja-JP";
    u.rate = 0.9;
    window.speechSynthesis.speak(u);
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center space-y-3">
          <div className="w-8 h-8 rounded-full border-2 border-emerald-600 border-t-transparent animate-spin mx-auto" />
          <p className="text-xs text-slate-500">Đang tải kiến thức kính ngữ...</p>
        </div>
      </div>
    );
  }

  if (!topicData) {
    return (
      <div className="max-w-4xl mx-auto py-12 px-4 text-center space-y-4">
        <h2 className="text-xl font-bold text-slate-800">Không tìm thấy nội dung</h2>
        <Link href="/learn/keigo" className="text-xs text-emerald-600 font-bold underline">
          Quay lại danh mục Kính ngữ
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f3fbf7] py-10 px-4 sm:px-6 lg:px-8 space-y-8">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Navigation Breadcrumb */}
        <div className="flex items-center justify-between">
          <Link
            href="/learn/keigo"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-emerald-700 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Quay lại trang Kính ngữ tổng quan</span>
          </Link>

          <span className="flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Đã ghi nhận hoàn thành</span>
          </span>
        </div>

        {/* HERO TITLE CARD */}
        <div className="bg-white p-7 sm:p-9 rounded-3xl border border-slate-200/90 shadow-sm space-y-4">
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800">
              Kính Ngữ & Khiêm Nhường Ngữ N3
            </span>
            <span className="text-xs font-semibold text-slate-400 font-mono">
              /learn/keigo/{topicId}
            </span>
          </div>

          <div className="border-b border-slate-100 pb-4">
            <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 font-japanese">
              {topicData.titleJa}
            </h1>
            <h2 className="text-xl font-bold text-emerald-700 mt-1">
              {topicData.titleVi}
            </h2>
          </div>

          {topicData.conceptVi && (
            <p className="text-sm text-slate-700 leading-relaxed">
              {topicData.conceptVi}
            </p>
          )}

          {/* Golden Rule for Uchi-Soto if present */}
          {topicData.goldenRuleVi && (
            <div className="p-5 rounded-2xl bg-amber-50/80 border border-amber-200 text-xs text-amber-950 space-y-1.5">
              <span className="font-bold block text-sm text-amber-900">
                ⭐ Quy tắc vàng giao tiếp công sở:
              </span>
              <p className="whitespace-pre-line leading-relaxed">
                {topicData.goldenRuleVi}
              </p>
            </div>
          )}
        </div>

        {/* FORMULA RULES SECTION */}
        {topicData.formulaRules && topicData.formulaRules.length > 0 && (
          <div className="bg-white p-7 sm:p-9 rounded-3xl border border-slate-200/90 shadow-sm space-y-5">
            <div className="flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-emerald-600" />
              <h2 className="text-lg font-bold text-slate-900">
                Các Mẫu Công Thức Tạo Kính Ngữ Chuẩn
              </h2>
            </div>

            <div className="space-y-4">
              {topicData.formulaRules.map((r: any, idx: number) => (
                <div
                  key={idx}
                  className="p-5 rounded-2xl bg-slate-50/70 border border-slate-200/80 space-y-3"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                    <h3 className="font-bold text-slate-900 text-sm">{r.nameVi}</h3>
                    <span className="inline-block px-3 py-1 rounded-xl bg-emerald-100/80 text-emerald-900 font-mono font-bold text-xs self-start sm:self-auto">
                      {r.formula}
                    </span>
                  </div>

                  <p className="text-xs text-slate-600">{r.usageVi}</p>

                  {r.examples && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1 text-xs">
                      {r.examples.map((ex: any, i: number) => (
                        <div
                          key={i}
                          className="p-3 rounded-xl bg-white border border-slate-200 flex items-center justify-between gap-2"
                        >
                          <div>
                            <span className="font-japanese font-bold text-slate-900">
                              {ex.result}
                            </span>
                            <span className="block text-[11px] text-slate-500">
                              {ex.meaningVi}
                            </span>
                          </div>
                          <button
                            type="button"
                            onClick={() => speak(ex.result)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-emerald-600 transition-colors"
                          >
                            <Volume2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* SPECIAL VERBS TABLE IF AVAILABLE */}
        {(topicData.specialVerbs || topicData.verbs) && (
          <div className="bg-white p-7 sm:p-9 rounded-3xl border border-slate-200/90 shadow-sm space-y-5">
            <div className="flex items-center gap-2">
              <Table className="w-5 h-5 text-amber-600" />
              <h2 className="text-lg font-bold text-slate-900">
                Bảng Động Từ Đặc Biệt Cần Thuộc Lòng
              </h2>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50 text-slate-700 font-bold">
                    <th className="py-3 px-4">Động từ thường</th>
                    <th className="py-3 px-4">Nghĩa tiếng Việt</th>
                    {topicData.verbs ? (
                      <>
                        <th className="py-3 px-4 text-emerald-800 bg-emerald-50/40">尊敬語</th>
                        <th className="py-3 px-4 text-indigo-800 bg-indigo-50/40">謙譲語</th>
                      </>
                    ) : topicId === "sonkeigo" ? (
                      <th className="py-3 px-4 text-emerald-800 bg-emerald-50/40">尊敬語 (Tôn kính ngữ)</th>
                    ) : (
                      <th className="py-3 px-4 text-indigo-800 bg-indigo-50/40">謙譲語 (Khiêm nhường ngữ)</th>
                    )}
                    <th className="py-3 px-4">Nghe</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-japanese">
                  {(topicData.verbs || topicData.specialVerbs).map((v: any, i: number) => (
                    <tr key={i} className="hover:bg-slate-50/60">
                      <td className="py-3 px-4 font-bold text-slate-900 text-sm">
                        {v.base}
                      </td>
                      <td className="py-3 px-4 font-sans text-slate-600 font-medium">
                        {v.meaningVi}
                      </td>
                      {topicData.verbs ? (
                        <>
                          <td className="py-3 px-4 font-semibold text-emerald-700 bg-emerald-50/20">
                            {v.sonkeigo}
                          </td>
                          <td className="py-3 px-4 font-semibold text-indigo-700 bg-indigo-50/20">
                            {v.kenjougo}
                          </td>
                        </>
                      ) : topicId === "sonkeigo" ? (
                        <td className="py-3 px-4 font-semibold text-emerald-700 bg-emerald-50/20">
                          {v.sonkeigo}
                        </td>
                      ) : (
                        <td className="py-3 px-4 font-semibold text-indigo-700 bg-indigo-50/20">
                          {v.kenjougo}
                        </td>
                      )}
                      <td className="py-3 px-4 font-sans">
                        <button
                          type="button"
                          onClick={() => speak(v.sonkeigo || v.kenjougo || v.base)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-emerald-600 transition-colors"
                        >
                          <Volume2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* SITUATIONS IN BUSINESS */}
        {topicData.situationsVi && topicData.situationsVi.length > 0 && (
          <div className="bg-white p-7 sm:p-9 rounded-3xl border border-slate-200/90 shadow-sm space-y-5">
            <h2 className="text-lg font-bold text-slate-900">
              Tình Huống Hội Thoại & Công Sở Thực Tế
            </h2>

            <div className="space-y-4">
              {topicData.situationsVi.map((sit: any, idx: number) => (
                <div
                  key={idx}
                  className="p-5 rounded-2xl bg-indigo-50/40 border border-indigo-100 space-y-2 text-xs"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-indigo-900 text-sm">{sit.title}</span>
                    <span className="text-[11px] text-slate-500 font-medium">
                      Bối cảnh: {sit.context}
                    </span>
                  </div>

                  {sit.wrongJa && (
                    <div className="p-2.5 rounded-xl bg-rose-50 text-rose-800 font-japanese font-semibold">
                      ❌ {sit.wrongJa}
                    </div>
                  )}

                  <div className="p-3 rounded-xl bg-emerald-50/80 text-emerald-950 font-japanese text-sm font-bold flex items-center justify-between">
                    <span>⭕ {sit.correctJa}</span>
                    <button
                      type="button"
                      onClick={() => speak(sit.correctJa)}
                      className="p-1 rounded-lg text-emerald-700 hover:text-emerald-900"
                    >
                      <Volume2 className="w-4 h-4" />
                    </button>
                  </div>

                  <p className="text-slate-600 leading-relaxed font-sans pt-1">
                    <b>Lý giải:</b> {sit.explanationVi}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* COMMON MISTAKES */}
        {topicData.commonMistakesVi && (
          <div className="p-5 rounded-3xl bg-amber-50/80 border border-amber-200 text-xs space-y-1.5 text-amber-950">
            <div className="flex items-center gap-1.5 font-bold text-sm text-amber-900">
              <AlertTriangle className="w-4 h-4 text-amber-700" />
              <span>Lỗi sai thường gặp cần tránh:</span>
            </div>
            <p className="whitespace-pre-line leading-relaxed text-amber-900">
              {topicData.commonMistakesVi}
            </p>
          </div>
        )}

        {/* QUIZZES FOR THIS TOPIC */}
        {quizzes.length > 0 && (
          <LearningQuizPlayer
            module="keigo"
            quizzes={quizzes}
            title={`Luyện Tập: ${topicData.titleJa} (${topicData.titleVi})`}
          />
        )}
      </div>
    </div>
  );
}

