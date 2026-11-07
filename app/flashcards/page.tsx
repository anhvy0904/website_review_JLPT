"use client";

import React, { useState, useEffect, useMemo, useCallback } from "react";
import Link from "next/link";
import {
  Volume2,
  Star,
  CheckCircle2,
  RotateCcw,
  Shuffle,
  ChevronLeft,
  ChevronRight,
  BookOpen,
  Search,
  Sparkles,
  HelpCircle,
  Maximize2,
  Check,
} from "lucide-react";

interface VocabCard {
  word: string;
  meaning: string;
  reading: string;
  sinoVietnamese?: string;
  example?: string;
}

const STORAGE_KEY = "jlptn3:v1:flashcards_progress";

export default function FlashcardsPage() {
  const [allCards, setAllCards] = useState<VocabCard[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState<"all" | "learning" | "mastered" | "starred">("all");
  const [autoSpeech, setAutoSpeech] = useState(true);

  // User persistent progress: { starred: string[], mastered: string[] }
  const [starredWords, setStarredWords] = useState<string[]>([]);
  const [masteredWords, setMasteredWords] = useState<string[]>([]);

  // Load vocabulary data & saved progress
  useEffect(() => {
    fetch("/data/vocabulary/n3-vocab-200.json")
      .then((res) => res.json())
      .then((data: VocabCard[]) => {
        if (Array.isArray(data)) {
          setAllCards(data);
        }
      })
      .catch((err) => console.error("Lỗi tải từ vựng flashcard:", err));

    if (typeof window !== "undefined") {
      try {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed.starred)) setStarredWords(parsed.starred);
          if (Array.isArray(parsed.mastered)) setMasteredWords(parsed.mastered);
        }
      } catch (e) {
        console.error(e);
      }
    }
  }, []);

  // Save progress
  const saveProgress = (newStarred: string[], newMastered: string[]) => {
    if (typeof window !== "undefined") {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({ starred: newStarred, mastered: newMastered })
      );
    }
  };

  // Filtered Cards
  const filteredCards = useMemo(() => {
    return allCards.filter((card) => {
      // Query filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchWord = card.word.toLowerCase().includes(q);
        const matchReading = card.reading.toLowerCase().includes(q);
        const matchMeaning = card.meaning.toLowerCase().includes(q);
        const matchSino = card.sinoVietnamese?.toLowerCase().includes(q);
        if (!matchWord && !matchReading && !matchMeaning && !matchSino) {
          return false;
        }
      }

      // Status filter
      if (activeFilter === "mastered") return masteredWords.includes(card.word);
      if (activeFilter === "learning") return !masteredWords.includes(card.word);
      if (activeFilter === "starred") return starredWords.includes(card.word);
      return true;
    });
  }, [allCards, searchQuery, activeFilter, starredWords, masteredWords]);

  // Current Card
  const currentCard = filteredCards[currentIndex] || null;

  // Pronounce Japanese word using Web Speech API
  const speakText = useCallback((text: string) => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "ja-JP";
    utterance.rate = 0.9;
    window.speechSynthesis.speak(utterance);
  }, []);

  // Navigation handlers
  const handleNext = useCallback(() => {
    if (filteredCards.length === 0) return;
    setIsFlipped(false);
    setCurrentIndex((prev) => (prev + 1) % filteredCards.length);
  }, [filteredCards.length]);

  const handlePrev = useCallback(() => {
    if (filteredCards.length === 0) return;
    setIsFlipped(false);
    setCurrentIndex((prev) => (prev - 1 + filteredCards.length) % filteredCards.length);
  }, [filteredCards.length]);

  const handleFlip = useCallback(() => {
    setIsFlipped((prev) => {
      const next = !prev;
      if (next && autoSpeech && currentCard) {
        speakText(currentCard.reading || currentCard.word);
      }
      return next;
    });
  }, [autoSpeech, currentCard, speakText]);

  // Toggle Starred
  const toggleStar = useCallback(() => {
    if (!currentCard) return;
    setStarredWords((prev) => {
      const next = prev.includes(currentCard.word)
        ? prev.filter((w) => w !== currentCard.word)
        : [...prev, currentCard.word];
      saveProgress(next, masteredWords);
      return next;
    });
  }, [currentCard, masteredWords]);

  // Toggle Mastered
  const toggleMastered = useCallback(() => {
    if (!currentCard) return;
    setMasteredWords((prev) => {
      const next = prev.includes(currentCard.word)
        ? prev.filter((w) => w !== currentCard.word)
        : [...prev, currentCard.word];
      saveProgress(starredWords, next);
      return next;
    });
  }, [currentCard, starredWords]);

  // Shuffle Cards
  const handleShuffle = () => {
    setAllCards((prev) => [...prev].sort(() => Math.random() - 0.5));
    setCurrentIndex(0);
    setIsFlipped(false);
  };

  // Keyboard Shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger when typing in search input
      if ((e.target as HTMLElement).tagName === "INPUT") return;

      if (e.code === "Space" || e.code === "Enter") {
        e.preventDefault();
        handleFlip();
      } else if (e.code === "ArrowRight") {
        e.preventDefault();
        handleNext();
      } else if (e.code === "ArrowLeft") {
        e.preventDefault();
        handlePrev();
      } else if (e.key.toLowerCase() === "s") {
        e.preventDefault();
        toggleStar();
      } else if (e.key.toLowerCase() === "m") {
        e.preventDefault();
        toggleMastered();
      } else if (e.key.toLowerCase() === "v") {
        e.preventDefault();
        if (currentCard) speakText(currentCard.reading || currentCard.word);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleFlip, handleNext, handlePrev, toggleStar, toggleMastered, currentCard, speakText]);

  const isCurrentStarred = currentCard ? starredWords.includes(currentCard.word) : false;
  const isCurrentMastered = currentCard ? masteredWords.includes(currentCard.word) : false;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-200/70 text-indigo-700 text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5" />
            <span>200 Từ Vựng Cốt Lõi JLPT N3</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Flashcard Từ Vựng N3
          </h1>
          <p className="text-xs sm:text-sm text-slate-600">
            Ghi nhớ phản xạ Kanji, âm Hán Việt và phát âm tự nhiên qua thẻ ghi nhớ tương tác.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleShuffle}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition-all active:scale-95"
            title="Xáo trộn thứ tự thẻ"
          >
            <Shuffle className="w-3.5 h-3.5" />
            <span>Xáo trộn</span>
          </button>
          <Link
            href="/exams"
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 text-white text-xs font-bold hover:bg-indigo-700 shadow-sm transition-all"
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>Luyện đề thi</span>
          </Link>
        </div>
      </div>

      {/* Progress Counters & Filters */}
      <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm space-y-4">
        {/* Progress Bar */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-600">
            <span>
              Tiến độ thẻ:{" "}
              <b className="text-indigo-600">
                {filteredCards.length > 0 ? currentIndex + 1 : 0}
              </b>{" "}
              / {filteredCards.length}
            </span>
            <span className="text-slate-500">
              Đã thuộc: <b className="text-emerald-600">{masteredWords.length}</b> / {allCards.length} (
              {allCards.length > 0
                ? Math.round((masteredWords.length / allCards.length) * 100)
                : 0}
              %)
            </span>
          </div>
          <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full transition-all duration-300"
              style={{
                width: `${
                  filteredCards.length > 0
                    ? ((currentIndex + 1) / filteredCards.length) * 100
                    : 0
                }%`,
              }}
            />
          </div>
        </div>

        {/* Search & Tabs */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
          {/* Tabs */}
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-2xl w-full sm:w-auto">
            <button
              type="button"
              onClick={() => {
                setActiveFilter("all");
                setCurrentIndex(0);
                setIsFlipped(false);
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                activeFilter === "all"
                  ? "bg-white text-slate-900 shadow-sm"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Tất cả ({allCards.length})
            </button>
            <button
              type="button"
              onClick={() => {
                setActiveFilter("learning");
                setCurrentIndex(0);
                setIsFlipped(false);
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                activeFilter === "learning"
                  ? "bg-white text-indigo-600 shadow-sm"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Đang học ({allCards.length - masteredWords.length})
            </button>
            <button
              type="button"
              onClick={() => {
                setActiveFilter("mastered");
                setCurrentIndex(0);
                setIsFlipped(false);
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                activeFilter === "mastered"
                  ? "bg-white text-emerald-600 shadow-sm"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Đã thuộc ({masteredWords.length})
            </button>
            <button
              type="button"
              onClick={() => {
                setActiveFilter("starred");
                setCurrentIndex(0);
                setIsFlipped(false);
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                activeFilter === "starred"
                  ? "bg-white text-amber-600 shadow-sm"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Đã ghim ({starredWords.length})
            </button>
          </div>

          {/* Search */}
          <div className="relative w-full sm:w-64">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentIndex(0);
                setIsFlipped(false);
              }}
              placeholder="Tìm Kanji, Hiragana, nghĩa..."
              className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-indigo-500 bg-slate-50/50"
            />
          </div>
        </div>
      </div>

      {/* FLASHCARD CONTAINER */}
      {currentCard ? (
        <div className="space-y-5">
          {/* Card Frame with Flip Perspective */}
          <div
            onClick={handleFlip}
            className="group relative w-full h-[340px] sm:h-[380px] cursor-pointer [perspective:1000px] select-none"
          >
            <div
              className={`w-full h-full duration-500 [transform-style:preserve-3d] transition-transform rounded-3xl shadow-lg border border-slate-200/80 bg-white ${
                isFlipped ? "[transform:rotateY(180deg)]" : ""
              }`}
            >
              {/* ================= FRONT SIDE ================= */}
              <div className="absolute inset-0 w-full h-full [backface-visibility:hidden] p-8 flex flex-col justify-between items-center text-center bg-gradient-to-b from-white to-slate-50/50 rounded-3xl">
                {/* Top bar on front */}
                <div className="w-full flex items-center justify-between text-xs text-slate-400">
                  <span className="font-mono font-semibold">
                    #{currentIndex + 1} / {filteredCards.length}
                  </span>
                  <div className="flex items-center gap-2">
                    {currentCard.sinoVietnamese && (
                      <span className="px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-600 font-semibold text-[11px]">
                        Âm Hán: {currentCard.sinoVietnamese}
                      </span>
                    )}
                  </div>
                </div>

                {/* Main Word */}
                <div className="space-y-3 my-auto">
                  <div className="text-5xl sm:text-6xl font-extrabold text-slate-900 tracking-wider font-japanese hover:scale-105 transition-transform">
                    {currentCard.word}
                  </div>
                  <p className="text-xs text-slate-400">
                    Nhấp vào thẻ hoặc bấm phím <b>Space</b> để xem cách đọc & nghĩa
                  </p>
                </div>

                {/* Bottom Sound hint */}
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      speakText(currentCard.reading || currentCard.word);
                    }}
                    className="p-3 rounded-2xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 transition-colors shadow-sm"
                    title="Nghe phát âm từ vựng (phím V)"
                  >
                    <Volume2 className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* ================= BACK SIDE ================= */}
              <div className="absolute inset-0 w-full h-full [transform:rotateY(180deg)] [backface-visibility:hidden] p-8 flex flex-col justify-between items-center text-center bg-gradient-to-b from-indigo-50/40 via-white to-purple-50/30 rounded-3xl">
                {/* Top bar on back */}
                <div className="w-full flex items-center justify-between text-xs text-slate-400">
                  <span className="font-mono font-semibold">
                    #{currentIndex + 1} / {filteredCards.length}
                  </span>
                  <span className="text-[11px] font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full">
                    Mặt Lời Giải
                  </span>
                </div>

                {/* Middle Content */}
                <div className="space-y-4 my-auto max-w-lg">
                  <div>
                    <span className="text-lg font-bold text-indigo-600 font-japanese block">
                      {currentCard.reading}
                    </span>
                    <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 font-japanese mt-0.5">
                      {currentCard.word}
                    </h2>
                    {currentCard.sinoVietnamese && (
                      <span className="inline-block mt-1 text-xs font-bold text-slate-500 uppercase tracking-widest bg-slate-100 px-2.5 py-0.5 rounded-full">
                        {currentCard.sinoVietnamese}
                      </span>
                    )}
                  </div>

                  {/* Meaning */}
                  <div className="p-3.5 rounded-2xl bg-white border border-slate-200/80 shadow-sm">
                    <span className="text-[11px] font-bold text-slate-400 block uppercase tracking-wider mb-1">
                      Nghĩa tiếng Việt
                    </span>
                    <div className="text-lg sm:text-xl font-bold text-slate-900">
                      {currentCard.meaning}
                    </div>
                  </div>

                  {/* Example Sentence if available */}
                  {currentCard.example && (
                    <div className="p-3 rounded-2xl bg-indigo-50/60 border border-indigo-100/80 text-xs text-left space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold text-indigo-700 uppercase tracking-wider">
                          Ví dụ ngữ cảnh
                        </span>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            speakText(currentCard.example || "");
                          }}
                          className="text-indigo-600 hover:text-indigo-800"
                          title="Nghe câu ví dụ"
                        >
                          <Volume2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                      <p className="font-japanese text-slate-800 text-xs sm:text-sm leading-relaxed">
                        {currentCard.example}
                      </p>
                    </div>
                  )}
                </div>

                {/* Bottom sound button */}
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      speakText(currentCard.reading || currentCard.word);
                    }}
                    className="p-3 rounded-2xl bg-indigo-600 text-white hover:bg-indigo-700 transition-colors shadow-md shadow-indigo-100"
                    title="Nghe lại phát âm"
                  >
                    <Volume2 className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Action Controls */}
          <div className="flex items-center justify-between gap-3 pt-1">
            <button
              type="button"
              onClick={handlePrev}
              className="p-3.5 rounded-2xl bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 shadow-sm active:scale-95 transition-all flex items-center gap-1.5 text-xs font-bold"
            >
              <ChevronLeft className="w-4 h-4" />
              <span className="hidden sm:inline">Từ trước (←)</span>
            </button>

            <div className="flex items-center gap-2">
              {/* Star Button */}
              <button
                type="button"
                onClick={toggleStar}
                className={`p-3 sm:px-4 sm:py-3 rounded-2xl border text-xs font-bold flex items-center gap-2 transition-all active:scale-95 ${
                  isCurrentStarred
                    ? "bg-amber-50 border-amber-300 text-amber-700 shadow-sm"
                    : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"
                }`}
                title="Ghim từ khó (phím S)"
              >
                <Star className={`w-4 h-4 ${isCurrentStarred ? "fill-amber-400 text-amber-500" : ""}`} />
                <span className="hidden sm:inline">
                  {isCurrentStarred ? "Đã ghim" : "Ghim từ"}
                </span>
              </button>

              {/* Mastered Button */}
              <button
                type="button"
                onClick={toggleMastered}
                className={`p-3 sm:px-4 sm:py-3 rounded-2xl border text-xs font-bold flex items-center gap-2 transition-all active:scale-95 ${
                  isCurrentMastered
                    ? "bg-emerald-50 border-emerald-300 text-emerald-700 shadow-sm"
                    : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"
                }`}
                title="Đánh dấu đã thuộc (phím M)"
              >
                <CheckCircle2
                  className={`w-4 h-4 ${isCurrentMastered ? "fill-emerald-500 text-white" : ""}`}
                />
                <span className="hidden sm:inline">
                  {isCurrentMastered ? "Đã thuộc" : "Đánh dấu thuộc"}
                </span>
              </button>

              {/* Flip Button */}
              <button
                type="button"
                onClick={handleFlip}
                className="px-5 py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-md shadow-indigo-100 active:scale-95 transition-all flex items-center gap-1.5"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Lật thẻ (Space)</span>
              </button>
            </div>

            <button
              type="button"
              onClick={handleNext}
              className="p-3.5 rounded-2xl bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 shadow-sm active:scale-95 transition-all flex items-center gap-1.5 text-xs font-bold"
            >
              <span className="hidden sm:inline">Từ tiếp (→)</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      ) : (
        <div className="bg-white p-12 rounded-3xl border border-slate-200 text-center space-y-3">
          <BookOpen className="w-12 h-12 text-slate-300 mx-auto" />
          <h3 className="text-base font-bold text-slate-700">
            Không tìm thấy từ vựng phù hợp
          </h3>
          <p className="text-xs text-slate-400">
            Hãy thử tìm kiếm từ khóa khác hoặc chuyển sang tab "Tất cả".
          </p>
        </div>
      )}

      {/* Keyboard shortcuts guide footer */}
      <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/80 flex flex-wrap items-center justify-between gap-3 text-[11px] text-slate-500">
        <div className="flex items-center gap-1.5">
          <HelpCircle className="w-3.5 h-3.5 text-slate-400 shrink-0" />
          <span>Phím tắt:</span>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <span>
            <kbd className="px-1.5 py-0.5 rounded bg-white border border-slate-300 font-mono text-[10px]">
              Space
            </kbd>{" "}
            Lật thẻ
          </span>
          <span>
            <kbd className="px-1.5 py-0.5 rounded bg-white border border-slate-300 font-mono text-[10px]">
              ←
            </kbd>{" "}
            /{" "}
            <kbd className="px-1.5 py-0.5 rounded bg-white border border-slate-300 font-mono text-[10px]">
              →
            </kbd>{" "}
            Chuyển từ
          </span>
          <span>
            <kbd className="px-1.5 py-0.5 rounded bg-white border border-slate-300 font-mono text-[10px]">
              V
            </kbd>{" "}
            Nghe phát âm
          </span>
          <span>
            <kbd className="px-1.5 py-0.5 rounded bg-white border border-slate-300 font-mono text-[10px]">
              S
            </kbd>{" "}
            Ghim từ
          </span>
          <span>
            <kbd className="px-1.5 py-0.5 rounded bg-white border border-slate-300 font-mono text-[10px]">
              M
            </kbd>{" "}
            Đã thuộc
          </span>
        </div>
      </div>
    </div>
  );
}
