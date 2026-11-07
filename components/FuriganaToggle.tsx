"use client";

import React from "react";
import { Eye, EyeOff } from "lucide-react";

interface Props {
  visible: boolean;
  onToggle: (next: boolean) => void;
  className?: string;
}

export function FuriganaToggle({ visible, onToggle, className = "" }: Props) {
  return (
    <button
      type="button"
      onClick={() => onToggle(!visible)}
      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all active:scale-95 ${
        visible
          ? "bg-indigo-50 border-indigo-200 text-indigo-700 hover:bg-indigo-100"
          : "bg-slate-100 border-slate-200 text-slate-600 hover:bg-slate-200"
      } ${className}`}
      title={visible ? "Nhấn để ẩn Furigana" : "Nhấn để hiện Furigana"}
    >
      {visible ? (
        <>
          <Eye className="w-3.5 h-3.5 text-indigo-600" />
          <span>Furigana: <b>BẬT</b></span>
        </>
      ) : (
        <>
          <EyeOff className="w-3.5 h-3.5 text-slate-400" />
          <span>Furigana: <b>TẮT</b></span>
        </>
      )}
    </button>
  );
}
