"use client";

import React, { useState, useMemo } from "react";
import {
  KNOWN_VERBS,
  conjugateVerb,
  VerbEntry,
  VerbFormId,
  FORM_METADATA,
} from "@/lib/conjugator";
import { Search, Volume2, Sparkles, BookOpen, Layers, Info } from "lucide-react";
import { FuriganaToggle } from "./FuriganaToggle";

interface Props {
  initialVerb?: string;
  className?: string;
}

export function VerbConjugatorTool({ initialVerb = "書く", className = "" }: Props) {
  const [selectedKanji, setSelectedKanji] = useState<string>(initialVerb);
  const [searchQuery, setSearchQuery] = useState("");
  const [showFurigana, setShowFurigana] = useState(true);

  // Find currently selected verb
  const currentVerb = useMemo(() => {
    return (
      KNOWN_VERBS.find((v) => v.kanji === selectedKanji || v.hiragana === selectedKanji) ||
      KNOWN_VERBS[0]
    );
  }, [selectedKanji]);

  // Conjugation results
  const conjugationResult = useMemo(() => {
    return conjugateVerb(currentVerb);
  }, [currentVerb]);

  // Filter verbs for selector
  const filteredVerbs = useMemo(() => {
    if (!searchQuery.trim()) return KNOWN_VERBS;
    const q = searchQuery.toLowerCase().trim();
    return KNOWN_VERBS.filter(
      (v) =>
        v.kanji.toLowerCase().includes(q) ||
        v.hiragana.toLowerCase().includes(q) ||
        v.meaningVi.toLowerCase().includes(q)
    );
  }, [searchQuery]);

  // Audio speech
  const speak = (text: string) => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text);
    u.lang = "ja-JP";
    u.rate = 0.9;
    window.speechSynthesis.speak(u);
  };

  const formKeys = Object.keys(FORM_METADATA) as VerbFormId[];

  return (
    <div className={`bg-white rounded-3xl border border-slate-200/90 shadow-sm p-6 sm:p-8 space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Động Cơ Tra Bảng Chia 12 Thể Động Từ Chuẩn</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
            Tra Cứu & Chia 12 Thể Động Từ
          </h2>
          <p className="text-xs text-slate-500">
            Xem chính xác cách biến âm và quy tắc chia của động từ Nhóm I, II, III theo chuẩn ngữ pháp N3.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <FuriganaToggle visible={showFurigana} onToggle={setShowFurigana} />
        </div>
      </div>

      {/* Selector & Search Pills */}
      <div className="space-y-3">
        <div className="flex items-center justify-between gap-2">
          <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
            <BookOpen className="w-3.5 h-3.5 text-blue-600" />
            <span>Chọn động từ mẫu để tra cứu:</span>
          </span>
          <div className="relative w-44 sm:w-56">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Tìm động từ..."
              className="w-full pl-8 pr-3 py-1.5 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-blue-500 bg-slate-50/50"
            />
          </div>
        </div>

        {/* Verb Pills */}
        <div className="flex flex-wrap gap-1.5 max-h-28 overflow-y-auto p-1 bg-slate-50 rounded-2xl border border-slate-100">
          {filteredVerbs.map((v) => {
            const isSelected = v.kanji === currentVerb.kanji;
            return (
              <button
                key={v.kanji}
                type="button"
                onClick={() => setSelectedKanji(v.kanji)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 ${
                  isSelected
                    ? "bg-blue-600 text-white shadow-sm scale-105"
                    : "bg-white text-slate-700 border border-slate-200 hover:border-blue-300"
                }`}
              >
                <span className="font-japanese font-bold">{v.kanji}</span>
                <span className={`text-[10px] ${isSelected ? "text-blue-100" : "text-slate-400"}`}>
                  ({v.meaningVi})
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Selected Verb Hero Card */}
      <div className="bg-gradient-to-r from-blue-50/80 via-indigo-50/50 to-slate-50 p-5 sm:p-6 rounded-2xl border border-blue-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span
              className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                currentVerb.group === "godan"
                  ? "bg-amber-100 text-amber-800"
                  : currentVerb.group === "ichidan"
                  ? "bg-emerald-100 text-emerald-800"
                  : "bg-purple-100 text-purple-800"
              }`}
            >
              {currentVerb.group === "godan"
                ? "Nhóm I (五段 - Ngũ đoạn)"
                : currentVerb.group === "ichidan"
                ? "Nhóm II (一段 - Nhất đoạn)"
                : "Nhóm III (不規則 - Bất quy tắc)"}
            </span>
          </div>

          <div className="flex items-baseline gap-3 pt-1">
            <h3 className="text-3xl sm:text-4xl font-extrabold text-slate-900 font-japanese">
              {currentVerb.kanji}
            </h3>
            {showFurigana && (
              <span className="text-lg font-bold text-blue-700 font-japanese">
                【{currentVerb.hiragana}】
              </span>
            )}
            <span className="text-sm font-semibold text-slate-600">
              — Nghĩa: <b>{currentVerb.meaningVi}</b>
            </span>
          </div>
        </div>

        <button
          type="button"
          onClick={() => speak(currentVerb.hiragana)}
          className="self-start sm:self-auto p-3 rounded-2xl bg-white text-blue-600 hover:bg-blue-600 hover:text-white border border-blue-200 transition-all shadow-sm"
          title="Nghe phát âm từ nguyên mẫu"
        >
          <Volume2 className="w-5 h-5" />
        </button>
      </div>

      {/* 12 Forms Grid */}
      <div className="space-y-2">
        <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
          Bảng 12 Thể Đã Chia Chuẩn:
        </h4>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {formKeys.map((formId) => {
            const form = conjugationResult.forms[formId];
            if (!form) return null;

            return (
              <div
                key={formId}
                className="p-4 rounded-2xl border border-slate-200 hover:border-blue-300 bg-white hover:bg-blue-50/20 transition-all space-y-2 group"
              >
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-blue-700 font-japanese">
                    {form.nameJa}
                  </span>
                  <button
                    type="button"
                    onClick={() => speak(form.hiragana)}
                    className="p-1 rounded-lg text-slate-400 hover:text-blue-600 transition-colors"
                    title="Nghe phát âm dạng chia"
                  >
                    <Volume2 className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="space-y-0.5">
                  <div className="text-xl font-bold text-slate-900 font-japanese group-hover:text-blue-900 transition-colors">
                    {form.kanji}
                  </div>
                  {showFurigana && (
                    <div className="text-xs font-semibold text-slate-500 font-japanese">
                      {form.hiragana}
                    </div>
                  )}
                </div>

                <p className="text-[11px] text-slate-600 border-t border-slate-100 pt-1.5 leading-snug">
                  {form.ruleExplanationVi}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

