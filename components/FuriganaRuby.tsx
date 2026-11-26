import React from "react";

interface FuriganaRubyProps {
  word: string;
  hiragana?: string;
  className?: string;
}

export function FuriganaRuby({ word, hiragana, className = "" }: FuriganaRubyProps) {
  if (!hiragana || hiragana === word) {
    return <span className={className}>{word}</span>;
  }

  return (
    <ruby className={`font-japanese tracking-wide inline-flex flex-col items-center justify-end ${className}`}>
      <rt className="text-[10px] text-[#2E7D32] font-semibold select-none px-0.5 leading-none">
        {hiragana}
      </rt>
      <span>{word}</span>
    </ruby>
  );
}

