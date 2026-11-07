"use client";

import React, { useState } from "react";
import { ExamPassage } from "@/lib/types";
import { BookOpen, AlertCircle } from "lucide-react";

interface PassageViewerProps {
  passage: ExamPassage;
  className?: string;
}

export function PassageViewer({ passage, className = "" }: PassageViewerProps) {
  // Font size state: 16px, 18px (default), 20px, 22px
  const [fontSize, setFontSize] = useState<number>(18);
  const [imageError, setImageError] = useState<boolean>(false);

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
          <div className="p-2 rounded-xl bg-[#E8F5E9] text-[#1B5E20]">
            <BookOpen className="w-5 h-5 text-[#2E7D32]" />
          </div>
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#2E7D32]">
              Bài đọc hiểu (Passage)
            </span>
            <h3 className="font-bold text-slate-900 text-base">
              {passage.title || "Văn bản bài đọc"}
            </h3>
          </div>
        </div>

        {/* Font size controller (A- / A / A+) */}
        {paragraphs.length > 0 && (
          <div className="flex items-center gap-1 bg-slate-50 border border-slate-200/80 p-1 rounded-xl text-xs">
            <span className="text-[10px] text-slate-400 font-semibold px-1.5 hidden sm:inline">Cỡ chữ:</span>
            {[16, 18, 20, 22].map((size) => (
              <button
                key={size}
                type="button"
                onClick={() => setFontSize(size)}
                className={`px-1.5 sm:px-2 py-0.5 rounded-lg text-xs font-bold transition-all ${
                  fontSize === size
                    ? "bg-[#1B5E20] text-white shadow-xs"
                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-200/60"
                }`}
              >
                <span className="hidden sm:inline">
                  {size === 16 ? "Nhỏ" : size === 18 ? "Vừa" : size === 20 ? "Lớn" : "Rất lớn"}
                </span>
                <span className="inline sm:hidden">
                  {size === 16 ? "A-" : size === 18 ? "A" : size === 20 ? "A+" : "A++"}
                </span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Passage Image & Graceful Fallback */}
      {passage.imagePath && !imageError && (
        <div className="mb-5 overflow-hidden rounded-2xl border border-[#A5D6A7]/60 bg-slate-50">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={passage.imagePath}
            alt={passage.title || "Hình ảnh minh họa bài đọc"}
            className="w-full h-auto object-contain max-h-96"
            onError={() => setImageError(true)}
          />
        </div>
      )}

      {passage.imagePath && imageError && (
        <div className="mb-5 p-4 rounded-2xl bg-amber-50/80 border border-amber-200 text-amber-900 text-xs flex items-start gap-2.5">
          <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
          <div className="leading-relaxed">
            <span className="font-bold text-amber-950">Ảnh quét bài đọc gốc:</span>{" "}
            <code className="bg-amber-100/90 px-1.5 py-0.5 rounded text-[11px] font-mono text-amber-900">
              {passage.imagePath}
            </code>
            <p className="mt-1 text-slate-600">
              Tệp ảnh trang quét chưa được tải lên thư mục tài nguyên. Người học có thể đối chiếu qua bản PDF gốc trang tương ứng hoặc đọc trích dẫn bằng chứng trong phần Giải thích chi tiết của từng câu hỏi.
            </p>
          </div>
        </div>
      )}

      {/* Passage Text Body */}
      {paragraphs.length > 0 ? (
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
      ) : (
        !passage.imagePath && (
          <p className="text-xs text-slate-400 italic py-4 text-center">
            Bài đọc này chưa có nội dung văn bản.
          </p>
        )
      )}
    </div>
  );
}
