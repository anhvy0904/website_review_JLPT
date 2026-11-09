"use client";

import React, { useState, useEffect } from "react";
import { ExamPassage } from "@/lib/types";
import { BookOpen, FileText, Image as ImageIcon, ChevronDown, ChevronUp, AlertCircle, ZoomIn } from "lucide-react";

export interface PassageViewerProps {
  passage: ExamPassage;
  className?: string;
  isMobileCollapsible?: boolean;
}

export function PassageViewer({
  passage,
  className = "",
  isMobileCollapsible = true,
}: PassageViewerProps) {
  const hasText = Boolean(passage.text && passage.text.trim().length > 0);
  const hasImage = Boolean(passage.imagePath && passage.imagePath.trim().length > 0);

  // Default mode: text if available, otherwise image
  const [mode, setMode] = useState<"text" | "image">(hasText ? "text" : "image");
  const [imageFailed, setImageFailed] = useState<boolean>(false);
  // Font size: 16px, 18px (default), 20px, 22px
  const [fontSize, setFontSize] = useState<number>(18);
  // Mobile collapse state
  const [isMobileCollapsed, setIsMobileCollapsed] = useState<boolean>(false);
  const [isImageModalOpen, setIsImageModalOpen] = useState<boolean>(false);

  // Synchronize mode when passage changes
  useEffect(() => {
    setMode(passage.text && passage.text.trim().length > 0 ? "text" : "image");
    setImageFailed(false);
  }, [passage.id, passage.text, passage.imagePath]);

  const fontSizeClasses: Record<number, string> = {
    16: "text-[16px] leading-[1.95]",
    18: "text-[18px] leading-[2.1]",
    20: "text-[20px] leading-[2.15]",
    22: "text-[22px] leading-[2.2]",
  };

  return (
    <section
      className={`rounded-2xl border border-emerald-200/80 bg-white shadow-xs transition-all ${className}`}
      aria-label="Nội dung bài đọc tiếng Nhật"
    >
      {/* Passage Header & Controls */}
      <div className="p-4 sm:p-5 border-b border-slate-100 bg-gradient-to-r from-emerald-50/50 via-white to-slate-50/50 rounded-t-2xl">
        <div className="flex flex-wrap items-center justify-between gap-3">
          {/* Title & Badge */}
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="p-2 rounded-xl bg-emerald-100/80 text-emerald-800 shrink-0 shadow-2xs">
              <BookOpen className="w-5 h-5 text-emerald-700" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-700">
                  文章（ぶんしょう）・読解（どっかい）
                </span>
              </div>
              <h2 className="font-bold text-slate-900 text-base sm:text-lg truncate max-w-[280px] xs:max-w-sm sm:max-w-md">
                {passage.title || "Văn bản bài đọc"}
              </h2>
            </div>
          </div>

          {/* Action Toolbar */}
          <div className="flex items-center gap-2 flex-wrap">
            {/* Tab Switcher: Văn bản vs Ảnh đề gốc */}
            {hasText && hasImage && (
              <div className="inline-flex items-center p-0.5 rounded-xl border border-slate-200 bg-slate-100/90 text-xs font-semibold shadow-2xs">
                <button
                  type="button"
                  onClick={() => setMode("text")}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    mode === "text"
                      ? "bg-white text-emerald-800 shadow-xs"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                  title="Đọc văn bản tiếng Nhật"
                >
                  <FileText className="w-3.5 h-3.5" />
                  <span>Văn bản</span>
                </button>
                <button
                  type="button"
                  onClick={() => setMode("image")}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    mode === "image"
                      ? "bg-white text-emerald-800 shadow-xs"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                  title="Xem ảnh quét trang đề gốc"
                >
                  <ImageIcon className="w-3.5 h-3.5" />
                  <span>Ảnh đề gốc</span>
                </button>
              </div>
            )}

            {/* Font size controller (A- / A / A+) - Only in text mode */}
            {mode === "text" && hasText && (
              <div className="hidden sm:flex items-center gap-1 bg-slate-50 border border-slate-200 p-1 rounded-xl text-xs shadow-2xs">
                <span className="text-[10px] text-slate-400 font-semibold px-1">Cỡ chữ:</span>
                {[16, 18, 20, 22].map((size) => (
                  <button
                    key={size}
                    type="button"
                    onClick={() => setFontSize(size)}
                    className={`px-1.5 py-0.5 rounded-lg text-xs font-bold transition-all ${
                      fontSize === size
                        ? "bg-emerald-700 text-white shadow-2xs"
                        : "text-slate-600 hover:text-slate-900 hover:bg-slate-200/60"
                    }`}
                  >
                    {size === 16 ? "A-" : size === 18 ? "A" : size === 20 ? "A+" : "A++"}
                  </button>
                ))}
              </div>
            )}

            {/* Mobile Expand / Collapse toggle */}
            {isMobileCollapsible && (
              <button
                type="button"
                onClick={() => setIsMobileCollapsed(!isMobileCollapsed)}
                className="lg:hidden inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-700 hover:bg-slate-50 shadow-2xs"
                title={isMobileCollapsed ? "Mở rộng bài đọc" : "Thu gọn bài đọc"}
              >
                {isMobileCollapsed ? (
                  <>
                    <span>Mở bài đọc</span>
                    <ChevronDown className="w-4 h-4 text-emerald-700" />
                  </>
                ) : (
                  <>
                    <span>Thu gọn</span>
                    <ChevronUp className="w-4 h-4 text-slate-500" />
                  </>
                )}
              </button>
            )}
          </div>
        </div>

        {/* Mobile Collapsed Hint */}
        {isMobileCollapsed && (
          <div
            onClick={() => setIsMobileCollapsed(false)}
            className="mt-3 p-2.5 rounded-xl bg-emerald-50/80 border border-emerald-200/80 text-emerald-900 text-xs flex items-center justify-between cursor-pointer hover:bg-emerald-100/70 transition-colors lg:hidden"
          >
            <div className="truncate pr-2">
              <span className="font-bold text-emerald-800">Đang thu gọn: </span>
              <span className="text-slate-700">{passage.text?.slice(0, 70)}...</span>
            </div>
            <span className="text-[11px] font-bold text-emerald-700 shrink-0 underline">
              Chạm để mở
            </span>
          </div>
        )}
      </div>

      {/* Passage Body Content (Hidden on mobile if collapsed) */}
      <div className={`p-4 sm:p-6 ${isMobileCollapsed ? "hidden lg:block" : "block"}`}>
        {/* MODE 1: JAPANESE TEXT */}
        {mode === "text" && hasText ? (
          <article
            lang="ja"
            className={`font-japanese text-slate-900 whitespace-pre-wrap break-words text-justify select-text tracking-wide transition-all ${
              fontSizeClasses[fontSize] || fontSizeClasses[18]
            }`}
          >
            {passage.text}
          </article>
        ) : null}

        {/* MODE 2: ORIGINAL EXAM SCANNED IMAGE */}
        {(mode === "image" || (!hasText && hasImage)) && hasImage && !imageFailed ? (
          <div className="space-y-3">
            <div className="relative group overflow-hidden rounded-2xl border border-slate-200 bg-slate-50 p-2 shadow-2xs">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={passage.imagePath}
                alt={passage.title || "Ảnh trang đề gốc"}
                className="mx-auto h-auto max-w-full rounded-xl object-contain transition-transform"
                onError={() => setImageFailed(true)}
              />
              <button
                type="button"
                onClick={() => setIsImageModalOpen(true)}
                className="absolute top-4 right-4 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900/80 hover:bg-slate-900 text-white text-xs font-semibold backdrop-blur-xs shadow-md transition-opacity"
                title="Phóng to ảnh đề gốc"
              >
                <ZoomIn className="w-3.5 h-3.5" />
                <span>Phóng to</span>
              </button>
            </div>
            <p className="text-center text-xs text-slate-400">
              * Ảnh quét nguyên bản từ bộ đề thi JLPT N3 Best Moshi.
            </p>
          </div>
        ) : null}

        {/* FALLBACK: Image load error but text exists */}
        {mode === "image" && imageFailed && hasText && (
          <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs space-y-2">
            <div className="flex items-center gap-2 font-bold text-amber-950">
              <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
              <span>Không thể tải ảnh quét bài đọc gốc. Bạn vẫn có thể đọc toàn bộ văn bản tiếng Nhật.</span>
            </div>
            <button
              type="button"
              onClick={() => setMode("text")}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-700 text-white font-bold text-xs hover:bg-emerald-800 transition-colors"
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Chuyển về xem văn bản tiếng Nhật</span>
            </button>
          </div>
        )}

        {/* FALLBACK: Neither text nor valid image exists */}
        {!hasText && (!hasImage || imageFailed) && (
          <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-start gap-2.5">
            <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <div className="font-bold text-amber-950">Chưa có nội dung bài đọc</div>
              <p className="text-slate-600">
                Vui lòng kiểm tra trường <code className="bg-white px-1 py-0.5 rounded font-mono text-amber-950">passages[].text</code> hoặc đường dẫn tệp ảnh quét trong thư mục tài nguyên.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Fullscreen Image Modal if requested */}
      {isImageModalOpen && passage.imagePath && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/80 backdrop-blur-sm"
          onClick={() => setIsImageModalOpen(false)}
        >
          <div
            className="relative max-w-5xl max-h-[92vh] bg-white rounded-3xl p-3 sm:p-5 shadow-2xl overflow-auto border border-slate-700"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 mb-2 border-b border-slate-100">
              <h3 className="font-bold text-slate-900 text-sm">{passage.title || "Ảnh đề gốc"}</h3>
              <button
                type="button"
                onClick={() => setIsImageModalOpen(false)}
                className="px-3 py-1 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold"
              >
                Đóng (ESC)
              </button>
            </div>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={passage.imagePath}
              alt={passage.title || "Ảnh đề gốc phóng to"}
              className="w-full h-auto max-h-[80vh] object-contain mx-auto rounded-xl"
            />
          </div>
        </div>
      )}
    </section>
  );
}
