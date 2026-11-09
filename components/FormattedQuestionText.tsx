"use client";

import React, { useMemo } from "react";

export interface FormattedQuestionTextProps {
  text: string;
  className?: string;
  showSlotNumbers?: boolean;
}

export interface QuestionToken {
  type: "text" | "target_underlined" | "slot_blank" | "slot_star";
  content: string;
  slotNumber?: number;
}

/**
 * Phân tích chuỗi câu hỏi thành các token:
 * 1. Từ gạch chân trọng tâm: __từ__
 * 2. Ô trống điền từ: ____ hoặc ＿＿
 * 3. Ô trống dấu sao: ★ hoặc ☆
 * 4. Văn bản thông thường
 */
export function parseQuestionTokens(text: string): {
  tokens: QuestionToken[];
  totalSlots: number;
  starSlot: number;
} {
  if (!text) return { tokens: [], totalSlots: 0, starSlot: -1 };

  // Regex khớp:
  // - Từ gạch chân __từ__ (chứa ít nhất 1 ký tự không phải gạch dưới)
  // - Vạch trống ____ (3 gạch dưới trở lên) hoặc ＿＿ (gạch dưới toàn giác Nhật Bản)
  // - Ký tự dấu sao ★ hoặc ☆
  const regex = /(__[^_]+__|_{3,}|＿＿+|[★☆])/g;
  const tokens: QuestionToken[] = [];
  let lastIndex = 0;
  let match: RegExpExecArray | null;
  let slotCount = 0;
  let starSlot = -1;

  while ((match = regex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      tokens.push({ type: "text", content: text.slice(lastIndex, match.index) });
    }

    const raw = match[0];
    if (raw === "★" || raw === "☆") {
      slotCount++;
      starSlot = slotCount;
      tokens.push({ type: "slot_star", slotNumber: slotCount, content: raw });
    } else if (raw.startsWith("__") && raw.endsWith("__") && raw.length > 4 && !/^_+$/.test(raw)) {
      tokens.push({ type: "target_underlined", content: raw.slice(2, -2) });
    } else if (/^(_{3,}|＿＿+)$/.test(raw)) {
      slotCount++;
      tokens.push({ type: "slot_blank", slotNumber: slotCount, content: raw });
    } else {
      tokens.push({ type: "text", content: raw });
    }

    lastIndex = regex.lastIndex;
  }

  if (lastIndex < text.length) {
    tokens.push({ type: "text", content: text.slice(lastIndex) });
  }

  return { tokens, totalSlots: slotCount, starSlot };
}

/**
 * Trợ thủ kiểm tra xem câu hỏi có chứa câu hỏi ghép dấu sao (star arrangement) hay không
 */
export function getStarSlotInfo(text: string): { starPosition: number; totalSlots: number } | null {
  const { totalSlots, starSlot } = parseQuestionTokens(text);
  if (starSlot > 0 && totalSlots >= 2) {
    return { starPosition: starSlot, totalSlots };
  }
  return null;
}

const slotCircleNumbers = ["①", "②", "③", "④", "⑤", "⑥", "⑦", "⑧"];

export function FormattedQuestionText({
  text,
  className = "",
  showSlotNumbers = true,
}: FormattedQuestionTextProps) {
  const { tokens, starSlot } = useMemo(() => parseQuestionTokens(text), [text]);
  const isStarArrangement = starSlot > 0;

  return (
    <span className={`inline leading-loose tracking-wide ${className}`}>
      {tokens.map((token, index) => {
        if (token.type === "target_underlined") {
          return (
            <span
              key={index}
              className="underline decoration-indigo-600 decoration-[2.5px] underline-offset-4 font-bold text-indigo-950 px-1.5 py-0.5 bg-indigo-50/70 rounded mx-0.5 shadow-2xs"
            >
              {token.content}
            </span>
          );
        }

        if (token.type === "slot_star") {
          const numLabel =
            showSlotNumbers && token.slotNumber && token.slotNumber <= slotCircleNumbers.length
              ? slotCircleNumbers[token.slotNumber - 1]
              : `${token.slotNumber}.`;

          return (
            <span
              key={index}
              className="inline-flex items-center justify-center align-middle mx-1.5 my-1 px-2 py-0.5 min-w-[56px] sm:min-w-[68px] h-8 rounded-t-lg bg-amber-100/90 border-b-4 border-amber-500 text-amber-700 font-black text-base shadow-xs ring-2 ring-amber-400/60 select-none transition-transform hover:scale-105"
              title={`Vị trí dấu sao ★ (Ô số ${token.slotNumber} cần chọn)`}
            >
              {showSlotNumbers && isStarArrangement && (
                <span className="text-xs font-bold text-amber-800 mr-1 opacity-90">
                  {numLabel}
                </span>
              )}
              <span className="text-amber-600 text-lg drop-shadow-2xs">★</span>
            </span>
          );
        }

        if (token.type === "slot_blank") {
          const numLabel =
            showSlotNumbers && token.slotNumber && token.slotNumber <= slotCircleNumbers.length
              ? slotCircleNumbers[token.slotNumber - 1]
              : `${token.slotNumber}.`;

          return (
            <span
              key={index}
              className="inline-flex items-center justify-center align-middle mx-1.5 my-1 px-2 py-0.5 min-w-[54px] sm:min-w-[64px] h-8 rounded-t-lg bg-slate-100 border-b-4 border-slate-700 text-slate-600 font-bold text-xs shadow-2xs select-none hover:bg-slate-200/80 transition-colors"
              title={`Vị trí trống số ${token.slotNumber}`}
            >
              {showSlotNumbers && isStarArrangement && (
                <span className="text-xs font-semibold text-slate-500 mr-1">
                  {numLabel}
                </span>
              )}
              <span className="tracking-widest text-slate-400 font-normal">____</span>
            </span>
          );
        }

        return <React.Fragment key={index}>{token.content}</React.Fragment>;
      })}
    </span>
  );
}

