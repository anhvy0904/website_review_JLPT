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
  Folder,
  FolderOpen,
  Trash2,
  Layers,
  List,
  Check,
  Plus,
  ArrowRight,
  ExternalLink,
} from "lucide-react";
import {
  getAllFlashcards,
  removeFlashcard,
  clearAllFlashcards,
  clearFlashcardsByExam,
  getFlashcardsProgress,
  saveFlashcardsProgress,
  FlashcardItem,
} from "@/lib/storage";

export default function FlashcardsPage() {
  const [allCards, setAllCards] = useState<FlashcardItem[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState<"all" | "learning" | "mastered" | "starred">("all");
  const [selectedFolder, setSelectedFolder] = useState<string>("all");
  const [viewMode, setViewMode] = useState<"deck" | "list">("deck");
  const [autoSpeech, setAutoSpeech] = useState(true);

  // User persistent progress: { starred: string[], mastered: string[] }
  const [starredWords, setStarredWords] = useState<string[]>([]);
  const [masteredWords, setMasteredWords] = useState<string[]>([]);

  // Load flashcards from localStorage
  const reloadCards = useCallback(() => {
    const cards = getAllFlashcards();
    setAllCards(cards);
    const progress = getFlashcardsProgress();
    setStarredWords(progress.starred);
    setMasteredWords(progress.mastered);
  }, []);

  useEffect(() => {
    reloadCards();
  }, [reloadCards]);

  // Dynamic folders grouped by examTitle
  const folders = useMemo(() => {
    const map = new Map<string, { examId: string; examTitle: string; count: number }>();
    for (const card of allCards) {
      const key = card.examId || card.examTitle || "general";
      const existing = map.get(key);
      if (existing) {
        existing.count += 1;
      } else {
        map.set(key, {
          examId: key,
          examTitle: card.examTitle || "Từ vựng chung",
          count: 1,
        });
      }
    }
    return Array.from(map.values());
  }, [allCards]);

  // Save progress
  const updateProgress = (newStarred: string[], newMastered: string[]) => {
    setStarredWords(newStarred);
    setMasteredWords(newMastered);
    saveFlashcardsProgress({ starred: newStarred, mastered: newMastered });
  };

  // Filter cards by folder, status, and search query
  const folderCards = useMemo(() => {
    if (selectedFolder === "all") return allCards;
    return allCards.filter(
      (c) => (c.examId || c.examTitle || "general") === selectedFolder
    );
  }, [allCards, selectedFolder]);

  const filteredCards = useMemo(() => {
    return folderCards.filter((card) => {
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
  }, [folderCards, searchQuery, activeFilter, starredWords, masteredWords]);

  // Current Card
  const currentCard = filteredCards[currentIndex] || null;

  // Reset index when folder/filter changes
  useEffect(() => {
    setCurrentIndex(0);
    setIsFlipped(false);
  }, [selectedFolder, activeFilter]);

  // Web Speech API
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
    const next = starredWords.includes(currentCard.word)
      ? starredWords.filter((w) => w !== currentCard.word)
      : [...starredWords, currentCard.word];
    updateProgress(next, masteredWords);
  }, [currentCard, starredWords, masteredWords]);

  // Toggle Mastered
  const toggleMastered = useCallback(() => {
    if (!currentCard) return;
    const next = masteredWords.includes(currentCard.word)
      ? masteredWords.filter((w) => w !== currentCard.word)
      : [...masteredWords, currentCard.word];
    updateProgress(starredWords, next);
  }, [currentCard, starredWords, masteredWords]);

  // Delete single card
  const handleDeleteCard = (card: FlashcardItem) => {
    if (confirm(`Bạn có chắc muốn xóa từ "${card.word}" khỏi Flashcard?`)) {
      removeFlashcard(card.word, card.examId);
      reloadCards();
      if (currentIndex >= filteredCards.length - 1) {
        setCurrentIndex(Math.max(0, filteredCards.length - 2));
      }
    }
  };

  // Delete current folder
  const handleDeleteCurrentFolder = () => {
    if (selectedFolder === "all") return;
    const folderInfo = folders.find((f) => f.examId === selectedFolder);
    const title = folderInfo?.examTitle || selectedFolder;
    if (confirm(`Bạn có chắc muốn xóa toàn bộ từ vựng trong thư mục "${title}"?`)) {
      clearFlashcardsByExam(selectedFolder);
      setSelectedFolder("all");
      reloadCards();
    }
  };

  // Delete all flashcards
  const handleClearAll = () => {
    if (confirm("Bạn có chắc muốn xóa TOÀN BỘ dữ liệu Flashcard? Hành động này sẽ làm trống kho thẻ.")) {
      clearAllFlashcards();
      reloadCards();
    }
  };

  // Shuffle Cards
  const handleShuffle = () => {
    setAllCards((prev) => [...prev].sort(() => Math.random() - 0.5));
    setCurrentIndex(0);
    setIsFlipped(false);
  };

  // Keyboard Shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
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
  const currentFolderInfo = folders.find((f) => f.examId === selectedFolder);

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#E8F5E9] border border-[#A5D6A7] text-[#1B5E20] text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5 text-[#2E7D32]" />
            <span>Sổ Tay Flashcard JLPT N3 • Cùng VuyAnh 🌸</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#1B5E20] tracking-tight">
            Flashcard Từ Vựng Theo Đề Thi
          </h1>
          <p className="text-xs sm:text-sm text-slate-600">
            Từ vựng do bạn lưu trực tiếp từ các đề làm, phân loại theo từng đề thi để ôn luyện sâu.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {allCards.length > 0 && (
            <>
              <button
                type="button"
                onClick={handleShuffle}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition-all active:scale-95 cursor-pointer"
                title="Xáo trộn thứ tự thẻ"
              >
                <Shuffle className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Xáo trộn</span>
              </button>

              <button
                type="button"
                onClick={handleClearAll}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-semibold border border-rose-200 transition-all active:scale-95 cursor-pointer"
                title="Xóa toàn bộ từ vựng trong Flashcard"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Xóa hết</span>
              </button>
            </>
          )}

          <Link
            href="/exams"
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#1B5E20] text-white text-xs font-bold hover:bg-[#2E7D32] border border-[#66BB6A]/40 shadow-sm transition-all"
          >
            <BookOpen className="w-3.5 h-3.5 text-[#A5D6A7]" />
            <span>Luyện đề thi</span>
          </Link>
        </div>
      </div>

      {/* FOLDERS SELECTOR (Phân chia Folder theo từng file đề) */}
      <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FolderOpen className="w-4 h-4 text-[#1B5E20]" />
            <span className="text-xs font-bold uppercase tracking-wider text-slate-700">
              Thư mục đề thi ({folders.length})
            </span>
          </div>

          {selectedFolder !== "all" && (
            <button
              type="button"
              onClick={handleDeleteCurrentFolder}
              className="text-xs text-rose-600 hover:text-rose-800 flex items-center gap-1 font-semibold transition-colors cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Xóa thư mục này</span>
            </button>
          )}
        </div>

        {/* Folder Badges / Tabs */}
        <div className="flex flex-wrap items-center gap-2 pt-1">
          <button
            type="button"
            onClick={() => setSelectedFolder("all")}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              selectedFolder === "all"
                ? "bg-[#1B5E20] text-white shadow-sm"
                : "bg-slate-100 text-slate-700 hover:bg-slate-200"
            }`}
          >
            <Folder className="w-3.5 h-3.5" />
            <span>Tất cả thư mục</span>
            <span
              className={`px-1.5 py-0.2 rounded-md text-[10px] font-mono ${
                selectedFolder === "all" ? "bg-white/20 text-white" : "bg-slate-200 text-slate-700"
              }`}
            >
              {allCards.length}
            </span>
          </button>

          {folders.map((f) => {
            const isSelected = selectedFolder === f.examId;
            return (
              <button
                key={f.examId}
                type="button"
                onClick={() => setSelectedFolder(f.examId)}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer max-w-xs truncate ${
                  isSelected
                    ? "bg-[#1B5E20] text-white shadow-sm"
                    : "bg-[#E8F5E9]/60 text-[#1B5E20] hover:bg-[#A5D6A7]/40 border border-[#A5D6A7]/70"
                }`}
                title={f.examTitle}
              >
                <Folder className="w-3.5 h-3.5 shrink-0" />
                <span className="truncate">{f.examTitle}</span>
                <span
                  className={`px-1.5 py-0.2 rounded-md text-[10px] font-mono shrink-0 ${
                    isSelected ? "bg-white/20 text-white" : "bg-[#A5D6A7]/50 text-[#1B5E20]"
                  }`}
                >
                  {f.count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {allCards.length === 0 ? (
        /* EMPTY STATE KHI CHƯA CÓ FLASHCARD */
        <div className="bg-white p-8 sm:p-12 rounded-3xl border border-slate-200 shadow-sm text-center space-y-6">
          <div className="w-20 h-20 rounded-full bg-[#E8F5E9] text-[#1B5E20] flex items-center justify-center mx-auto text-4xl shadow-inner">
            🌸
          </div>

          <div className="space-y-2 max-w-md mx-auto">
            <h3 className="text-xl font-bold text-slate-800">
              Kho Flashcard hiện đang trống!
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              Bạn chưa thêm từ vựng nào vào Flashcard. Khi luyện đề thi, mỗi câu hỏi đều có bảng{" "}
              <strong className="text-[#1B5E20]">Từ vựng trọng tâm N3</strong> kèm nút{" "}
              <strong className="text-[#1B5E20]">+ Flashcard</strong> để bạn gom từ cần nhớ vào đây.
            </p>
          </div>

          {/* Quick Guide Card */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 max-w-xl mx-auto text-left text-xs">
            <div className="p-3.5 rounded-2xl bg-[#E8F5E9]/50 border border-[#A5D6A7] space-y-1">
              <span className="font-bold text-[#1B5E20] block">1. Làm bài thi</span>
              <p className="text-slate-600 text-[11px]">Vào mục Kho Đề Thi và chọn đề để luyện tập.</p>
            </div>
            <div className="p-3.5 rounded-2xl bg-[#E8F5E9]/50 border border-[#A5D6A7] space-y-1">
              <span className="font-bold text-[#1B5E20] block">2. Bấm "+ Flashcard"</span>
              <p className="text-slate-600 text-[11px]">Lưu từ vựng khó hoặc lưu cả bộ từ của câu hỏi.</p>
            </div>
            <div className="p-3.5 rounded-2xl bg-[#E8F5E9]/50 border border-[#A5D6A7] space-y-1">
              <span className="font-bold text-[#1B5E20] block">3. Ôn theo Folder</span>
              <p className="text-slate-600 text-[11px]">Từ vựng tự động chia theo từng đề để ôn tập.</p>
            </div>
          </div>

          <div className="pt-2">
            <Link
              href="/exams"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-[#1B5E20] hover:bg-[#2E7D32] text-white text-sm font-bold shadow-md transition-all active:scale-95"
            >
              <span>Đi đến Kho Đề Thi ngay</span>
              <ArrowRight className="w-4 h-4 text-[#A5D6A7]" />
            </Link>
          </div>
        </div>
      ) : (
        <>
          {/* Progress Counters & Filters */}
          <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs space-y-4">
            {/* Progress Bar */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs font-semibold text-slate-600">
                <span>
                  Đang xem:{" "}
                  <b className="text-[#1B5E20]">
                    {filteredCards.length > 0 ? currentIndex + 1 : 0}
                  </b>{" "}
                  / {filteredCards.length} thẻ
                  {currentFolderInfo && (
                    <span className="text-slate-400 font-normal ml-1">
                      (Thư mục: {currentFolderInfo.examTitle})
                    </span>
                  )}
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
                  className="h-full bg-gradient-to-r from-[#66BB6A] to-[#1B5E20] rounded-full transition-all duration-300"
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

            {/* View Mode & Search & Status Filter */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
              {/* Status Filter Tabs */}
              <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-2xl w-full sm:w-auto overflow-x-auto">
                <button
                  type="button"
                  onClick={() => setActiveFilter("all")}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                    activeFilter === "all"
                      ? "bg-white text-slate-900 shadow-xs"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  Tất cả ({folderCards.length})
                </button>
                <button
                  type="button"
                  onClick={() => setActiveFilter("learning")}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                    activeFilter === "learning"
                      ? "bg-white text-[#1B5E20] shadow-xs"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  Đang học ({folderCards.filter((c) => !masteredWords.includes(c.word)).length})
                </button>
                <button
                  type="button"
                  onClick={() => setActiveFilter("mastered")}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                    activeFilter === "mastered"
                      ? "bg-white text-emerald-600 shadow-xs"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  Đã thuộc ({folderCards.filter((c) => masteredWords.includes(c.word)).length})
                </button>
                <button
                  type="button"
                  onClick={() => setActiveFilter("starred")}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                    activeFilter === "starred"
                      ? "bg-white text-amber-600 shadow-xs"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  Đã ghim ({folderCards.filter((c) => starredWords.includes(c.word)).length})
                </button>
              </div>

              {/* View Mode Toggle & Search */}
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <div className="flex items-center bg-slate-100 p-1 rounded-xl">
                  <button
                    type="button"
                    onClick={() => setViewMode("deck")}
                    className={`p-1.5 rounded-lg text-xs font-semibold cursor-pointer ${
                      viewMode === "deck" ? "bg-white text-[#1B5E20] shadow-xs" : "text-slate-500"
                    }`}
                    title="Chế độ lật thẻ"
                  >
                    <Layers className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setViewMode("list")}
                    className={`p-1.5 rounded-lg text-xs font-semibold cursor-pointer ${
                      viewMode === "list" ? "bg-white text-[#1B5E20] shadow-xs" : "text-slate-500"
                    }`}
                    title="Chế độ danh sách"
                  >
                    <List className="w-4 h-4" />
                  </button>
                </div>

                <div className="relative flex-1 sm:w-56">
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Tìm Kanji, Hán Việt, nghĩa..."
                    className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-[#1B5E20] bg-slate-50/50"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* CHẾ ĐỘ 1: DECK VIEW (LẬT THẺ) */}
          {viewMode === "deck" && (
            <>
              {currentCard ? (
                <div className="space-y-5">
                  {/* Card Frame with Flip Perspective */}
                  <div
                    onClick={handleFlip}
                    className="group relative w-full h-[350px] sm:h-[390px] cursor-pointer [perspective:1000px] select-none"
                  >
                    <div
                      className={`w-full h-full duration-500 [transform-style:preserve-3d] transition-transform rounded-3xl shadow-md border border-slate-200/90 bg-white ${
                        isFlipped ? "[transform:rotateY(180deg)]" : ""
                      }`}
                    >
                      {/* ================= FRONT SIDE ================= */}
                      <div className="absolute inset-0 w-full h-full [backface-visibility:hidden] p-8 flex flex-col justify-between items-center text-center bg-gradient-to-b from-white to-[#E8F5E9]/30 rounded-3xl">
                        {/* Top bar on front */}
                        <div className="w-full flex items-center justify-between text-xs text-slate-400">
                          <span className="font-mono font-semibold">
                            #{currentIndex + 1} / {filteredCards.length}
                          </span>

                          <div className="flex items-center gap-2">
                            <span className="px-2.5 py-0.5 rounded-full bg-[#E8F5E9] text-[#1B5E20] font-semibold text-[11px] border border-[#A5D6A7]/60 truncate max-w-[180px]">
                              📁 {currentCard.examTitle}
                            </span>
                            {currentCard.sinoVietnamese && (
                              <span className="px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 font-bold text-[11px]">
                                Hán: {currentCard.sinoVietnamese}
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
                            className="p-3 rounded-2xl bg-[#E8F5E9] hover:bg-[#A5D6A7]/50 text-[#1B5E20] transition-colors shadow-2xs"
                            title="Nghe phát âm từ vựng (phím V)"
                          >
                            <Volume2 className="w-5 h-5" />
                          </button>
                        </div>
                      </div>

                      {/* ================= BACK SIDE ================= */}
                      <div className="absolute inset-0 w-full h-full [transform:rotateY(180deg)] [backface-visibility:hidden] p-8 flex flex-col justify-between items-center text-center bg-gradient-to-b from-[#E8F5E9]/40 via-white to-emerald-50/30 rounded-3xl">
                        {/* Top bar on back */}
                        <div className="w-full flex items-center justify-between text-xs text-slate-400">
                          <span className="font-mono font-semibold">
                            #{currentIndex + 1} / {filteredCards.length}
                          </span>
                          <span className="text-[11px] font-bold text-[#1B5E20] bg-[#E8F5E9] px-2.5 py-0.5 rounded-full border border-[#A5D6A7]">
                            📁 {currentCard.examTitle}
                          </span>
                        </div>

                        {/* Middle Content */}
                        <div className="space-y-4 my-auto max-w-lg">
                          <div>
                            <span className="text-xl font-bold text-[#1B5E20] font-japanese block">
                              {currentCard.reading}
                            </span>
                            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 font-japanese mt-0.5">
                              {currentCard.word}
                            </h2>
                            {currentCard.sinoVietnamese && (
                              <span className="inline-block mt-1 text-xs font-black text-[#1B5E20] uppercase tracking-widest bg-[#E8F5E9] border border-[#A5D6A7] px-3 py-0.5 rounded-full shadow-2xs">
                                ÂM HÁN VIỆT: {currentCard.sinoVietnamese}
                              </span>
                            )}
                          </div>

                          {/* Meaning */}
                          <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-2xs">
                            <span className="text-[11px] font-bold text-slate-400 block uppercase tracking-wider mb-1">
                              Nghĩa tiếng Việt
                            </span>
                            <div className="text-lg sm:text-xl font-bold text-slate-900">
                              {currentCard.meaning}
                            </div>
                          </div>
                        </div>

                        {/* Bottom sound button */}
                        <div className="flex items-center gap-3">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              speakText(currentCard.reading || currentCard.word);
                            }}
                            className="p-3 rounded-2xl bg-[#1B5E20] text-white hover:bg-[#2E7D32] transition-colors shadow-sm"
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
                      className="p-3.5 rounded-2xl bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 shadow-xs active:scale-95 transition-all flex items-center gap-1.5 text-xs font-bold cursor-pointer"
                    >
                      <ChevronLeft className="w-4 h-4" />
                      <span className="hidden sm:inline">Từ trước (←)</span>
                    </button>

                    <div className="flex items-center gap-2">
                      {/* Star Button */}
                      <button
                        type="button"
                        onClick={toggleStar}
                        className={`p-3 sm:px-4 sm:py-3 rounded-2xl border text-xs font-bold flex items-center gap-2 transition-all active:scale-95 cursor-pointer ${
                          isCurrentStarred
                            ? "bg-amber-50 border-amber-300 text-amber-700 shadow-xs"
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
                        className={`p-3 sm:px-4 sm:py-3 rounded-2xl border text-xs font-bold flex items-center gap-2 transition-all active:scale-95 cursor-pointer ${
                          isCurrentMastered
                            ? "bg-emerald-50 border-emerald-300 text-emerald-700 shadow-xs"
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
                        className="px-5 py-3 rounded-2xl bg-[#1B5E20] hover:bg-[#2E7D32] text-white text-xs font-bold shadow-sm active:scale-95 transition-all flex items-center gap-1.5 cursor-pointer"
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                        <span>Lật thẻ (Space)</span>
                      </button>

                      {/* Delete Current Card Button */}
                      <button
                        type="button"
                        onClick={() => handleDeleteCard(currentCard)}
                        className="p-3 rounded-2xl bg-white border border-slate-200 hover:bg-rose-50 hover:border-rose-200 text-slate-400 hover:text-rose-600 transition-all cursor-pointer"
                        title="Xóa từ này khỏi Flashcard"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    <button
                      type="button"
                      onClick={handleNext}
                      className="p-3.5 rounded-2xl bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 shadow-xs active:scale-95 transition-all flex items-center gap-1.5 text-xs font-bold cursor-pointer"
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
            </>
          )}

          {/* CHẾ ĐỘ 2: LIST VIEW (BẢNG DANH SÁCH TỪ THEO FOLDER) */}
          {viewMode === "list" && (
            <div className="space-y-3">
              <div className="text-xs font-semibold text-slate-500">
                Hiển thị {filteredCards.length} từ trong thư mục đã chọn:
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {filteredCards.map((card, idx) => {
                  const isMastered = masteredWords.includes(card.word);
                  const isStarred = starredWords.includes(card.word);

                  return (
                    <div
                      key={card.id || idx}
                      className="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs hover:border-[#A5D6A7] transition-all space-y-2"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="space-y-0.5">
                          <span className="text-xs font-bold text-[#1B5E20] font-japanese block">
                            {card.reading}
                          </span>
                          <span className="text-2xl font-extrabold text-slate-900 font-japanese">
                            {card.word}
                          </span>
                          {card.sinoVietnamese && (
                            <span className="inline-block text-[11px] font-bold text-[#1B5E20] bg-[#E8F5E9] px-2 py-0.2 rounded border border-[#A5D6A7]/60 ml-2">
                              {card.sinoVietnamese}
                            </span>
                          )}
                        </div>

                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() => speakText(card.reading || card.word)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-[#1B5E20] hover:bg-[#E8F5E9] transition-colors"
                            title="Phát âm"
                          >
                            <Volume2 className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteCard(card)}
                            className="p-1.5 rounded-lg text-slate-300 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                            title="Xóa khỏi Flashcard"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                      <div className="text-sm font-semibold text-slate-800 pt-1 border-t border-slate-100">
                        {card.meaning}
                      </div>

                      <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1">
                        <span className="truncate max-w-[200px]">📁 {card.examTitle}</span>
                        <div className="flex items-center gap-2">
                          {isMastered && (
                            <span className="text-emerald-600 font-bold flex items-center gap-0.5">
                              <Check className="w-3 h-3" /> Thuộc
                            </span>
                          )}
                          {isStarred && (
                            <span className="text-amber-500 font-bold flex items-center gap-0.5">
                              <Star className="w-3 h-3 fill-amber-400" /> Ghim
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
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
        </>
      )}
    </div>
  );
}
