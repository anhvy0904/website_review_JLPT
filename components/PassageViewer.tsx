"use client";

import React, { useState } from "react";
import { ExamPassage } from "@/lib/types";
import { BookOpen } from "lucide-react";

interface PassageViewerProps {
  passage: ExamPassage;
  className?: string;
}

export function PassageViewer({ passage, className = "" }: PassageViewerProps) {
  // Font size state: 16px, 18px (default), 20px, 22px
  const [fontSize, setFontSize] = useState<number>(18);

  const paragraphs = (passage.text || "").split("\n\n").filter(Boolean);

  const fontSizeClasses: Record<number, string> = {
    16: "text-[16px] leading-[1.85]",
    18: "text-[18px] leading-[1.9]",
    20: "text-[20px] leading-[2.0]",
    22: "text-[22px] leading-[2.05]",
  };

  return (
    <div className={`rounded-3xl border border-slate-200 bg-white p-6 sm:p-7 shadow-sm ${className}`}>
      {/* Passage Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-4 mb-4 border-b border-slate-100">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-indigo-50 text-indigo-600">
            <BookOpen className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-600">
              Bài đọc hiểu (Passage)
            </span>
            <h3 className="font-bold text-slate-900 text-base">
              {passage.title || "Văn bản bài đọc"}
            </h3>
          </div>
        </div>

        {/* Font size controller (A- / A / A+) */}
        <div className="flex items-center gap-1 bg-slate-50 border border-slate-200/80 p-1 rounded-xl text-xs">
          <span className="text-[10px] text-slate-400 font-semibold px-1.5 hidden sm:inline">Cỡ chữ:</span>
          {[16, 18, 20, 22].map((size) => (
            <button
              key={size}
              type="button"
              onClick={() => setFontSize(size)}
              className={`px-2 py-0.5 rounded-lg text-xs font-bold transition-all ${
                fontSize === size
                  ? "bg-indigo-600 text-white shadow-xs"
                  : "text-slate-600 hover:text-slate-900 hover:bg-slate-200/60"
              }`}
            >
              {size === 16 ? "Nhỏ" : size === 18 ? "Vừa" : size === 20 ? "Lớn" : "Rất lớn"}
            </button>
          ))}
        </div>
      </div>

      {passage.imagePath && (
        <div className="mb-5 overflow-hidden rounded-2xl border border-slate-200">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={passage.imagePath}
            alt="Hình ảnh minh họa bài đọc"
            className="w-full h-auto object-contain max-h-96"
          />
        </div>
      )}

      {/* Passage Text Body */}
      <div
        className={`space-y-5 font-japanese text-slate-800 tracking-normal transition-all ${
          fontSizeClasses[fontSize] || fontSizeClasses[18]
        }`}
      >
        {paragraphs.map((p, idx) => (
          <p key={idx} className="whitespace-pre-line text-justify">
            {p}
          </p>
        ))}
      </div>
    </div>
  );
}
