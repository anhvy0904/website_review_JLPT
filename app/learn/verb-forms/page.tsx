"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { VerbConjugatorTool } from "@/components/VerbConjugatorTool";
import { LearningQuizPlayer, LearningQuizItem } from "@/components/LearningQuizPlayer";
import { getLearningProgress } from "@/lib/learningStorage";
import {
  Sparkles,
  BookOpen,
  ArrowRight,
  CheckCircle2,
  Table,
  HelpCircle,
  Layers,
} from "lucide-react";

interface VerbCardItem {
  id: string;
  titleJa: string;
  reading: string;
  titleVi: string;
  subtitle: string;
  groupIllustration: string;
  order: number;
}

export default function VerbFormsHubPage() {
  const [cards, setCards] = useState<VerbCardItem[]>([]);
  const [quizzes, setQuizzes] = useState<LearningQuizItem[]>([]);
  const [completedLessons, setCompletedLessons] = useState<string[]>([]);

  useEffect(() => {
    // Load 12 cards metadata
    fetch("/data/learning/verb-forms/index.json")
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) setCards(data);
      })
      .catch((err) => console.error(err));

    // Load quizzes
    fetch("/data/learning/quizzes/verb-forms-quizzes.json")
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) setQuizzes(data);
      })
      .catch((err) => console.error(err));

    // Load progress
    const p = getLearningProgress();
    setCompletedLessons(p.completedVerbLessons);
  }, []);

  return (
    <div className="min-h-screen bg-[#f3f8fd] py-10 px-4 sm:px-6 lg:px-8 space-y-12">
      <div className="max-w-7xl mx-auto space-y-10">
        {/* Header Breadcrumb & Title */}
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-100/70 border border-blue-200 text-blue-800 text-xs font-semibold">
            <Layers className="w-3.5 h-3.5" />
            <span>Chuyên Đề Ngữ Pháp N3 — Module A</span>
          </div>

          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            12 Thể Động Từ Tiếng Nhật (動詞の活用)
          </h1>

          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
            Học kỹ bản chất, khi nào dùng, quy tắc biến đổi từng nhóm I/II/III và các ngoại lệ biến âm thường gặp trong đề thi JLPT N3.
          </p>
        </div>

        {/* 12 CARDS GRID (4 COLUMNS DESKTOP, 2 TABLET, 1-2 MOBILE) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {cards.map((card) => {
            const isCompleted = completedLessons.includes(card.id);

            return (
              <Link
                key={card.id}
                href={`/learn/verb-forms/${card.id}`}
                className="group relative bg-white p-6 rounded-3xl border border-slate-200/90 hover:border-blue-300 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all flex flex-col justify-between space-y-4"
              >
                {/* Badge top */}
                <div className="flex items-center justify-between">
                  <span className="w-6 h-6 rounded-lg bg-blue-50 text-blue-700 font-bold text-xs flex items-center justify-center">
                    {card.order}
                  </span>

                  {isCompleted && (
                    <span className="flex items-center gap-1 text-[11px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                      <CheckCircle2 className="w-3 h-3" />
                      <span>Đã học</span>
                    </span>
                  )}
                </div>

                {/* Main Name in Soft Blue Japanese & Bold Vietnamese */}
                <div className="space-y-1 text-center py-2">
                  <div className="text-3xl font-extrabold text-[#3a86ff] font-japanese tracking-wide group-hover:scale-105 transition-transform">
                    {card.titleJa}
                  </div>
                  <div className="text-xs font-semibold text-slate-400 font-japanese">
                    {card.reading}
                  </div>
                  <h3 className="text-base font-extrabold text-slate-900 pt-1">
                    {card.titleVi}
                  </h3>
                </div>

                {/* Subtitle & Formula hint */}
                <div className="space-y-2 border-t border-slate-100 pt-3 text-center">
                  <p className="text-xs text-slate-500 leading-snug line-clamp-2">
                    {card.subtitle}
                  </p>
                  <span className="inline-block text-[11px] font-bold text-blue-600 bg-blue-50/80 px-2.5 py-0.5 rounded-full">
                    Dấu hiệu: {card.groupIllustration}
                  </span>
                </div>

                {/* Hover CTA */}
                <div className="pt-2 flex items-center justify-center text-xs font-bold text-blue-600 group-hover:text-blue-800 transition-colors gap-1">
                  <span>Học chi tiết thể này</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                </div>
              </Link>
            );
          })}
        </div>

        {/* INTERACTIVE CONJUGATOR TOOL */}
        <VerbConjugatorTool />

        {/* PRACTICE QUIZZES SECTION */}
        {quizzes.length > 0 && (
          <div className="space-y-4">
            <div className="space-y-1">
              <h2 className="text-2xl font-extrabold text-slate-900">
                Thực Hành Trắc Nghiệm Chia Động Từ
              </h2>
              <p className="text-xs text-slate-500">
                Luyện tập phân biệt các thể, ngoại lệ và bẫy chia động từ thường gặp trong đề thi JLPT N3.
              </p>
            </div>

            <LearningQuizPlayer module="verb-forms" quizzes={quizzes} />
          </div>
        )}
      </div>
    </div>
  );
}
