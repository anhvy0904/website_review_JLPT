import React from "react";
import { ExamPassage } from "@/lib/types";
import { BookOpen } from "lucide-react";

interface PassageViewerProps {
  passage: ExamPassage;
  className?: string;
}

export function PassageViewer({ passage, className = "" }: PassageViewerProps) {
  // Format paragraphs nicely
  const paragraphs = passage.text.split("\n\n").filter(Boolean);

  return (
    <div className={`rounded-2xl border border-slate-200 bg-white p-6 shadow-sm ${className}`}>
      <div className="flex items-center gap-2.5 pb-4 mb-4 border-b border-slate-100">
        <div className="p-2 rounded-lg bg-indigo-50 text-indigo-600">
          <BookOpen className="w-5 h-5" />
        </div>
        <div>
          <span className="text-xs font-semibold uppercase tracking-wider text-indigo-600">
            Bài đọc hiểu (Passage)
          </span>
          <h3 className="font-semibold text-slate-900 text-base">
            {passage.title || "Văn bản bài đọc"}
          </h3>
        </div>
      </div>

      {passage.imagePath && (
        <div className="mb-4 overflow-hidden rounded-xl border border-slate-200">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={passage.imagePath}
            alt="Hình ảnh minh họa bài đọc"
            className="w-full h-auto object-contain max-h-96"
          />
        </div>
      )}

      <div className="space-y-4 font-japanese text-slate-800 text-[18px] leading-[1.9] tracking-normal">
        {paragraphs.map((p, idx) => (
          <p key={idx} className="whitespace-pre-line text-justify">
            {p}
          </p>
        ))}
      </div>
    </div>
  );
}

