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
    <ruby className={`font-japanese tracking-wide ${className}`}>
      {word}
      <rt className="text-[10px] text-indigo-600 font-normal select-none px-0.5">
        {hiragana}
      </rt>
    </ruby>
  );
}

