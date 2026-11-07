"use client";

import React from "react";
import { getHanViet } from "@/lib/hanviet";

interface AnnotatedTextWithHanVietProps {
  text?: string | null;
  className?: string;
  badgeClassName?: string;
}

/**
 * Regex bắt từ tiếng Nhật bắt đầu bằng chữ Hán (Kanji),
 * có thể kèm theo các ký tự Hiragana okurigana (như 親しい, 配る, 捨てて...)
 */
const JAPANESE_KANJI_WORD_REGEX = /([\u4e00-\u9faf\u3400-\u4dbf]+[\u3040-\u309f]*)/g;

/**
 * Component hiển thị văn bản giải thích tự động bổ sung âm Hán Việt
 * ngay bên cạnh các chữ Hán xuất hiện trong câu.
 */
export function AnnotatedTextWithHanViet({
  text,
  className = "",
  badgeClassName = "",
}: AnnotatedTextWithHanVietProps) {
  if (!text) return null;

  const elements: React.ReactNode[] = [];
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  // Reset regex state
  JAPANESE_KANJI_WORD_REGEX.lastIndex = 0;

  while ((match = JAPANESE_KANJI_WORD_REGEX.exec(text)) !== null) {
    const word = match[1];
    const matchIndex = match.index;

    // Đoạn text bình thường nằm trước chữ Hán
    if (matchIndex > lastIndex) {
      elements.push(text.substring(lastIndex, matchIndex));
    }

    const hanViet = getHanViet(word);

    // Kiểm tra xem phía sau đã có sẵn [Hán Việt] hay chưa để tránh trùng lặp
    const restAfter = text.substring(matchIndex + word.length);
    const alreadyAnnotated = hanViet && (
      restAfter.startsWith(` [${hanViet}]`) || 
      restAfter.startsWith(`[${hanViet}]`) ||
      restAfter.startsWith(` (${hanViet})`) ||
      restAfter.startsWith(`【${hanViet}】`)
    );

    elements.push(
      <React.Fragment key={`${matchIndex}-${word}`}>
        <span className="font-japanese font-semibold text-slate-900">{word}</span>
        {hanViet && !alreadyAnnotated && (
          <span
            className={`inline-flex items-center px-1.5 py-0.5 mx-1 rounded bg-[#E8F5E9] text-[#1B5E20] border border-[#A5D6A7] font-sans font-bold text-[11px] leading-tight select-none shadow-2xs align-baseline ${badgeClassName}`}
            title={`Âm Hán Việt: ${hanViet}`}
          >
            {hanViet}
          </span>
        )}
      </React.Fragment>
    );

    lastIndex = matchIndex + word.length;
  }

  // Đoạn text còn lại sau từ cuối cùng
  if (lastIndex < text.length) {
    elements.push(text.substring(lastIndex));
  }

  return <span className={className}>{elements}</span>;
}
