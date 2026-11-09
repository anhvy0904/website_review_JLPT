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
  Flame,
  Calendar,
  Clock,
  Award,
  Zap,
} from "lucide-react";
import {
  getAllFlashcards,
  removeFlashcard,
  clearAllFlashcards,
  clearFlashcardsByExam,
  getFlashcardsProgress,
  saveFlashcardsProgress,
  FlashcardItem,
  FlashcardRating,
  reviewFlashcard,
  getReviewIntervalPreview,
  getFlashcardSRSStats,
  isCardDueToday,
  getTodayDateString,
} from "@/lib/storage";

export default function FlashcardsPage() {
  const [allCards, setAllCards] = useState<FlashcardItem[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState<"all" | "due" | "new" | "learning" | "mastered" | "starred">("due");
  const [selectedFolder, setSelectedFolder] = useState<string>("all");
  const [viewMode, setViewMode] = useState<"deck" | "list">("deck");
  const [autoSpeech, setAutoSpeech] = useState(true);
  const [reviewToast, setReviewToast] = useState<{ message: string; rating: FlashcardRating } | null>(null);

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

  // Filter cards by folder
  const folderCards = useMemo(() => {
    if (selectedFolder === "all") return allCards;
    return allCards.filter(
      (c) => (c.examId || c.examTitle || "general") === selectedFolder
    );
  }, [allCards, selectedFolder]);

  // SRS statistics for the current folder
  const srsStats = useMemo(() => {
    return getFlashcardSRSStats(folderCards);
  }, [folderCards]);

  // Set default filter: if there are no cards due today, fallback to "all"
  useEffect(() => {
    if (folderCards.length > 0 && srsStats.dueToday === 0 && activeFilter === "due") {
      setActiveFilter("all");
    }
  }, [folderCards.length, srsStats.dueToday, activeFilter]);

  // Filter cards by folder, status, and search query
  const filteredCards = useMemo(() => {
    const today = getTodayDateString();
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
      if (activeFilter === "due") return isCardDueToday(card, today);
      if (activeFilter === "new") return card.state === "new" || card.repetitions === 0;
      if (activeFilter === "learning") return card.repetitions > 0 && card.state !== "mastered";
      if (activeFilter === "mastered") return card.state === "mastered" || card.interval >= 21;
      if (activeFilter === "starred") return starredWords.includes(card.word);
      return true;
    });
  }, [folderCards, searchQuery, activeFilter, starredWords]);

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

  // Review flashcard according to Anki SM-2 rating
  const handleRateCard = useCallback(
    (rating: FlashcardRating) => {
      if (!currentCard) return;
      const updated = reviewFlashcard(currentCard.id, rating, currentCard.examId);
      if (updated) {
        let label = "";
        if (rating === "again") label = `Đã xếp lịch: Ôn lại ngày mai (1 ngày)`;
        else if (rating === "hard") label = `Đã xếp lịch: Ôn sau ${updated.interval} ngày`;
        else if (rating === "good") label = `Đã xếp lịch: Ôn sau ${updated.interval} ngày`;
        else if (rating === "easy") label = `Xuất sắc! Ôn sau ${updated.interval} ngày`;

        setReviewToast({ message: label, rating });
        setTimeout(() => {
          setReviewToast(null);
        }, 2200);

        reloadCards();
        setIsFlipped(false);

        // Advance to next card if more cards remain
        if (filteredCards.length > 1) {
          if (currentIndex >= filteredCards.length - 1) {
            setCurrentIndex(0);
          }
        }
      }
    },
    [currentCard, reloadCards, filteredCards.length, currentIndex]
  );

  // Toggle Starred
  const toggleStar = useCallback(() => {
    if (!currentCard) return;
    const next = starredWords.includes(currentCard.word)
      ? starredWords.filter((w) => w !== currentCard.word)
      : [...starredWords, currentCard.word];
    updateProgress(next, masteredWords);
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

  // Keyboard Shortcuts: Space (Flip), 1/2/3/4 (Anki Ratings), Left/Right, S, V
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.target as HTMLElement).tagName === "INPUT") return;

      if (e.code === "Space") {
        e.preventDefault();
        handleFlip();
        return;
      }

      if (isFlipped) {
        if (e.key === "1") {
          e.preventDefault();
          handleRateCard("again");
          return;
        }
        if (e.key === "2") {
          e.preventDefault();
          handleRateCard("hard");
          return;
        }
        if (e.key === "3") {
          e.preventDefault();
          handleRateCard("good");
          return;
        }
        if (e.key === "4") {
          e.preventDefault();
          handleRateCard("easy");
          return;
        }
      }

      if (e.code === "ArrowRight") {
        e.preventDefault();
        handleNext();
      } else if (e.code === "ArrowLeft") {
        e.preventDefault();
        handlePrev();
      } else if (e.key.toLowerCase() === "s") {
        e.preventDefault();
        toggleStar();
      } else if (e.key.toLowerCase() === "v") {
        e.preventDefault();
        if (currentCard) speakText(currentCard.reading || currentCard.word);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleFlip, handleNext, handlePrev, toggleStar, handleRateCard, currentCard, speakText, isFlipped]);

  const isCurrentStarred = currentCard ? starredWords.includes(currentCard.word) : false;
  const currentFolderInfo = folders.find((f) => f.examId === selectedFolder);

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 space-y-6">
      {/* Toast notification khi chọn đánh giá SRS */}
      {reviewToast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-slate-900/95 text-white text-xs font-semibold shadow-xl backdrop-blur-xs border border-white/10 animate-in fade-in slide-in-from-bottom-2 duration-200">
          <Check className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{reviewToast.message}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#E8F5E9] border border-[#A5D6A7] text-[#1B5E20] text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5 text-[#2E7D32]" />
            <span>Sổ Tay Flashcard JLPT N3 • Lặp Lại Ngắt Quãng Anki (SRS) 🌸</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#1B5E20] tracking-tight">
            Flashcard Từ Vựng & Chu Kỳ Ôn Tập Anki
          </h1>
          <p className="text-xs sm:text-sm text-slate-600">
            Tính toán ngày ôn lặp lại chuẩn thuật toán SM-2 của Anki, tự động nhắc nhở từ vựng đến hạn mỗi ngày.
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

      {/* ANKI SRS STATS DASHBOARD BANNER */}
      {allCards.length > 0 && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-3">
          {/* Cần ôn hôm nay */}
          <div
            onClick={() => setActiveFilter("due")}
            className={`p-3 sm:p-3.5 rounded-2xl border transition-all cursor-pointer flex items-center gap-2.5 sm:gap-3 ${
              activeFilter === "due"
                ? "bg-orange-50 border-orange-400 ring-2 ring-orange-200 shadow-sm"
                : "bg-white border-orange-200/80 hover:bg-orange-50/50"
            }`}
          >
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-orange-500 text-white flex items-center justify-center shadow-xs shrink-0">
              <Flame className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            <div className="min-w-0">
              <span className="text-[10px] sm:text-[11px] font-bold text-orange-800 uppercase block truncate">Cần ôn hôm nay</span>
              <div className="flex items-baseline gap-1">
                <span className="text-lg sm:text-xl font-extrabold text-orange-950 font-mono">{srsStats.dueToday}</span>
                <span className="text-[10px] text-orange-600 font-medium">từ</span>
              </div>
            </div>
          </div>

          {/* Thẻ mới */}
          <div
            onClick={() => setActiveFilter("new")}
            className={`p-3 sm:p-3.5 rounded-2xl border transition-all cursor-pointer flex items-center gap-2.5 sm:gap-3 ${
              activeFilter === "new"
                ? "bg-blue-50 border-blue-400 ring-2 ring-blue-200 shadow-sm"
                : "bg-white border-blue-200/80 hover:bg-blue-50/50"
            }`}
          >
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-blue-500 text-white flex items-center justify-center shadow-xs shrink-0">
              <Sparkles className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            <div className="min-w-0">
              <span className="text-[10px] sm:text-[11px] font-bold text-blue-800 uppercase block truncate">Thẻ mới</span>
              <div className="flex items-baseline gap-1">
                <span className="text-lg sm:text-xl font-extrabold text-blue-950 font-mono">{srsStats.newCards}</span>
                <span className="text-[10px] text-blue-600 font-medium">chưa học</span>
              </div>
            </div>
          </div>

          {/* Đang ghi nhớ */}
          <div
            onClick={() => setActiveFilter("learning")}
            className={`p-3 sm:p-3.5 rounded-2xl border transition-all cursor-pointer flex items-center gap-2.5 sm:gap-3 ${
              activeFilter === "learning"
                ? "bg-purple-50 border-purple-400 ring-2 ring-purple-200 shadow-sm"
                : "bg-white border-purple-200/80 hover:bg-purple-50/50"
            }`}
          >
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-purple-500 text-white flex items-center justify-center shadow-xs shrink-0">
              <BookOpen className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            <div className="min-w-0">
              <span className="text-[10px] sm:text-[11px] font-bold text-purple-800 uppercase block truncate">Đang ghi nhớ</span>
              <div className="flex items-baseline gap-1">
                <span className="text-lg sm:text-xl font-extrabold text-purple-950 font-mono">{srsStats.learning}</span>
                <span className="text-[10px] text-purple-600 font-medium">từ</span>
              </div>
            </div>
          </div>

          {/* Đã nhớ vững */}
          <div
            onClick={() => setActiveFilter("mastered")}
            className={`p-3 sm:p-3.5 rounded-2xl border transition-all cursor-pointer flex items-center gap-2.5 sm:gap-3 ${
              activeFilter === "mastered"
                ? "bg-emerald-50 border-[#66BB6A] ring-2 ring-[#A5D6A7] shadow-sm"
                : "bg-white border-[#A5D6A7]/80 hover:bg-[#E8F5E9]/50"
            }`}
          >
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-[#1B5E20] text-white flex items-center justify-center shadow-xs shrink-0">
              <Award className="w-4 h-4 sm:w-5 sm:h-5 text-[#A5D6A7]" />
            </div>
            <div className="min-w-0">
              <span className="text-[10px] sm:text-[11px] font-bold text-[#1B5E20] uppercase block truncate">Đã nhớ vững</span>
              <div className="flex items-baseline gap-1">
                <span className="text-lg sm:text-xl font-extrabold text-[#1B5E20] font-mono">{srsStats.mastered}</span>
                <span className="text-[10px] text-emerald-600 font-medium">≥21 ngày</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* FOLDERS SELECTOR (Phân chia Folder theo từng file đề) */}
      <div className="bg-white p-4 sm:p-5 rounded-3xl border border-slate-200 shadow-xs space-y-3">
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
        <div className="flex items-center gap-2 pt-1 overflow-x-auto pb-1 sm:flex-wrap no-scrollbar">
          <button
            type="button"
            onClick={() => setSelectedFolder("all")}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer shrink-0 ${
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
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer max-w-xs truncate shrink-0 ${
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
              <strong className="text-[#1B5E20]">+ Flashcard</strong> để bạn gom từ cần nhớ vào đây và ôn tập theo chu kỳ Anki.
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
              <p className="text-slate-600 text-[11px]">Lưu từ vựng khó kèm âm Hán Việt chuẩn xác.</p>
            </div>
            <div className="p-3.5 rounded-2xl bg-[#E8F5E9]/50 border border-[#A5D6A7] space-y-1">
              <span className="font-bold text-[#1B5E20] block">3. Ôn Anki hàng ngày</span>
              <p className="text-slate-600 text-[11px]">Hệ thống tính ngày lặp lại ngắt quãng SM-2.</p>
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
                  Đã nhớ vững: <b className="text-emerald-600">{srsStats.mastered}</b> / {folderCards.length} (
                  {folderCards.length > 0
                    ? Math.round((srsStats.mastered / folderCards.length) * 100)
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
              {/* Status Filter Tabs (SRS Anki Filters) */}
              <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-2xl w-full sm:w-auto overflow-x-auto">
                <button
                  type="button"
                  onClick={() => setActiveFilter("due")}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                    activeFilter === "due"
                      ? "bg-orange-500 text-white shadow-xs"
                      : "text-orange-700 hover:text-orange-900"
                  }`}
                >
                  <Flame className="w-3.5 h-3.5" />
                  <span>Hôm nay ({srsStats.dueToday})</span>
                </button>
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
                  onClick={() => setActiveFilter("new")}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                    activeFilter === "new"
                      ? "bg-blue-600 text-white shadow-xs"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  Thẻ mới ({srsStats.newCards})
                </button>
                <button
                  type="button"
                  onClick={() => setActiveFilter("learning")}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                    activeFilter === "learning"
                      ? "bg-purple-600 text-white shadow-xs"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  Đang học ({srsStats.learning})
                </button>
                <button
                  type="button"
                  onClick={() => setActiveFilter("mastered")}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                    activeFilter === "mastered"
                      ? "bg-emerald-600 text-white shadow-xs"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  Đã nhớ vững ({srsStats.mastered})
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
                    title="Chế độ lật thẻ 3D Anki"
                  >
                    <Layers className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setViewMode("list")}
                    className={`p-1.5 rounded-lg text-xs font-semibold cursor-pointer ${
                      viewMode === "list" ? "bg-white text-[#1B5E20] shadow-xs" : "text-slate-500"
                    }`}
                    title="Chế độ danh sách & chu kỳ"
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

          {/* CHẾ ĐỘ 1: DECK VIEW (LẬT THẺ CHUẨN ANKI) */}
          {viewMode === "deck" && (
            <>
              {currentCard ? (
                <div className="space-y-4 sm:space-y-5">
                  {/* Card Frame with Flip Perspective */}
                  <div
                    onClick={handleFlip}
                    className="group relative w-full h-[380px] sm:h-[420px] md:h-[460px] cursor-pointer [perspective:1000px] select-none"
                  >
                    <div
                      className={`relative w-full h-full duration-500 [transform-style:preserve-3d] transition-transform rounded-3xl shadow-md border border-slate-200/90 bg-white ${
                        isFlipped ? "[transform:rotateY(180deg)]" : ""
                      }`}
                    >
                      {/* ================= FRONT SIDE ================= */}
                      <div className={`absolute inset-0 w-full h-full [backface-visibility:hidden] [-webkit-backface-visibility:hidden] p-5 sm:p-7 md:p-8 flex flex-col justify-between items-center text-center bg-gradient-to-b from-white via-white to-[#E8F5E9]/30 rounded-3xl overflow-y-auto ${!isFlipped ? "z-10" : "z-0 pointer-events-none"}`}>
                        {/* Top bar on front */}
                        <div className="w-full flex items-center justify-between text-xs text-slate-400 gap-1.5">
                          <span className="font-mono font-semibold">
                            #{currentIndex + 1} / {filteredCards.length}
                          </span>

                          <div className="flex items-center gap-1.5 sm:gap-2">
                            {/* SRS Badge */}
                            {isCardDueToday(currentCard) ? (
                              <span className="px-2 py-0.5 rounded-full bg-orange-100 text-orange-800 font-bold text-[10px] border border-orange-200 flex items-center gap-1">
                                <Flame className="w-3 h-3 text-orange-600" /> Cần ôn
                              </span>
                            ) : currentCard.state === "mastered" ? (
                              <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold text-[10px] border border-emerald-200 flex items-center gap-1">
                                <Award className="w-3 h-3 text-emerald-600" /> Nhớ vững
                              </span>
                            ) : currentCard.state === "learning" ? (
                              <span className="px-2 py-0.5 rounded-full bg-purple-100 text-purple-800 font-bold text-[10px] border border-purple-200">
                                Đang học ({currentCard.interval}d)
                              </span>
                            ) : (
                              <span className="px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 font-bold text-[10px] border border-blue-200">
                                Thẻ mới
                              </span>
                            )}

                            <span className="px-2 py-0.5 rounded-full bg-[#E8F5E9] text-[#1B5E20] font-semibold text-[10px] sm:text-[11px] border border-[#A5D6A7]/60 truncate max-w-[120px] sm:max-w-[160px]">
                              📁 {currentCard.examTitle}
                            </span>
                          </div>
                        </div>

                        {/* Main Word */}
                        <div className="space-y-2 sm:space-y-3 my-auto max-w-full px-2">
                          <div className="text-4xl sm:text-5xl md:text-6xl font-extrabold text-slate-900 tracking-wider font-japanese hover:scale-105 transition-transform break-words">
                            {currentCard.word}
                          </div>

                          {currentCard.sinoVietnamese && (
                            <div className="pt-1">
                              <span className="inline-block px-3 py-0.5 sm:py-1 rounded-full bg-[#E8F5E9] text-[#1B5E20] border border-[#A5D6A7] font-sans font-bold text-[11px] sm:text-xs tracking-wider uppercase shadow-2xs">
                                ÂM HÁN VIỆT: {currentCard.sinoVietnamese}
                              </span>
                            </div>
                          )}

                          <p className="text-[11px] sm:text-xs text-slate-400 pt-1 sm:pt-2">
                            Chạm vào thẻ hoặc bấm phím <b>Space</b> để lật mặt sau
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
                            className="p-2.5 sm:p-3 rounded-2xl bg-[#E8F5E9] hover:bg-[#A5D6A7]/50 text-[#1B5E20] transition-colors shadow-2xs cursor-pointer"
                            title="Nghe phát âm từ vựng (phím V)"
                          >
                            <Volume2 className="w-4 h-4 sm:w-5 sm:h-5" />
                          </button>
                        </div>
                      </div>

                      {/* ================= BACK SIDE ================= */}
                      <div className={`absolute inset-0 w-full h-full [transform:rotateY(180deg)] [backface-visibility:hidden] [-webkit-backface-visibility:hidden] p-5 sm:p-7 md:p-8 flex flex-col justify-between items-center text-center bg-gradient-to-b from-[#E8F5E9]/40 via-white to-emerald-50/30 rounded-3xl overflow-y-auto ${isFlipped ? "z-10" : "z-0 pointer-events-none"}`}>
                        {/* Top bar on back */}
                        <div className="w-full flex items-center justify-between text-xs text-slate-400 gap-1.5">
                          <span className="font-mono font-semibold">
                            #{currentIndex + 1} / {filteredCards.length}
                          </span>

                          <div className="flex items-center gap-1.5 sm:gap-2">
                            <span className="text-[10px] font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md">
                              Hạn ôn: {currentCard.dueDate || "Hôm nay"}
                            </span>
                            <span className="text-[10px] sm:text-[11px] font-bold text-[#1B5E20] bg-[#E8F5E9] px-2 py-0.5 rounded-full border border-[#A5D6A7] truncate max-w-[120px] sm:max-w-[160px]">
                              📁 {currentCard.examTitle}
                            </span>
                          </div>
                        </div>

                        {/* Middle Content */}
                        <div className="space-y-3 sm:space-y-4 my-auto max-w-lg w-full px-2">
                          <div>
                            <span className="text-lg sm:text-xl md:text-2xl font-bold text-[#1B5E20] font-japanese block">
                              {currentCard.reading}
                            </span>
                            <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-slate-900 font-japanese mt-0.5 break-words">
                              {currentCard.word}
                            </h2>
                            {currentCard.sinoVietnamese && (
                              <span className="inline-block mt-1 sm:mt-2 text-[11px] sm:text-xs font-black text-[#1B5E20] uppercase tracking-widest bg-[#E8F5E9] border border-[#A5D6A7] px-3 py-0.5 sm:py-1 rounded-full shadow-2xs">
                                ÂM HÁN VIỆT: {currentCard.sinoVietnamese}
                              </span>
                            )}
                          </div>

                          {/* Meaning */}
                          <div className="p-3 sm:p-4 rounded-2xl bg-white border border-slate-200/80 shadow-2xs">
                            <span className="text-[10px] sm:text-[11px] font-bold text-slate-400 block uppercase tracking-wider mb-0.5 sm:mb-1">
                              Nghĩa tiếng Việt
                            </span>
                            <div className="text-base sm:text-lg md:text-xl font-bold text-slate-900">
                              {currentCard.meaning}
                            </div>
                          </div>

                          {/* SRS State summary line */}
                          <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-4 text-[10px] sm:text-[11px] text-slate-500 font-medium pt-1">
                            <span>Chu kỳ: <b className="text-slate-800">{currentCard.interval} ngày</b></span>
                            <span>•</span>
                            <span>Số lần ôn: <b className="text-slate-800">{currentCard.repetitions}</b></span>
                            <span>•</span>
                            <span>Hệ số (EF): <b className="text-slate-800">{currentCard.easeFactor}</b></span>
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
                            className="p-2.5 sm:p-3 rounded-2xl bg-[#1B5E20] text-white hover:bg-[#2E7D32] transition-colors shadow-sm cursor-pointer"
                            title="Nghe lại phát âm (phím V)"
                          >
                            <Volume2 className="w-4 h-4 sm:w-5 sm:h-5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* ANKI 4 RATING BUTTONS (Hiện rõ khi thẻ được lật) */}
                  {isFlipped ? (
                    <div className="space-y-2 pt-1 animate-in fade-in duration-200">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between text-[11px] sm:text-xs text-slate-500 px-1 gap-1 font-medium">
                        <span>Đánh giá mức độ nhớ (Phím 1, 2, 3, 4):</span>
                        <span className="text-slate-400 text-[10px] sm:text-xs">Chu kỳ ôn tập tiếp theo:</span>
                      </div>

                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-2.5">
                        {/* 1. Lại (Again) */}
                        <button
                          type="button"
                          onClick={() => handleRateCard("again")}
                          className="flex flex-col items-center justify-center py-2.5 sm:py-3 px-2 sm:px-3 rounded-2xl bg-rose-50 hover:bg-rose-100 text-rose-800 border-2 border-rose-200 hover:border-rose-300 transition-all active:scale-95 cursor-pointer shadow-xs touch-manipulation"
                        >
                          <div className="flex items-center gap-1 sm:gap-1.5 font-bold text-xs sm:text-sm">
                            <RotateCcw className="w-3.5 h-3.5 text-rose-600 shrink-0" />
                            <span>Lại (Again)</span>
                            <kbd className="hidden sm:inline-block px-1 rounded bg-rose-200/70 text-[10px] text-rose-800">1</kbd>
                          </div>
                          <span className="text-[10px] sm:text-[11px] font-semibold text-rose-600 mt-0.5">
                            1 ngày
                          </span>
                        </button>

                        {/* 2. Khó (Hard) */}
                        <button
                          type="button"
                          onClick={() => handleRateCard("hard")}
                          className="flex flex-col items-center justify-center py-2.5 sm:py-3 px-2 sm:px-3 rounded-2xl bg-amber-50 hover:bg-amber-100 text-amber-900 border-2 border-amber-200 hover:border-amber-300 transition-all active:scale-95 cursor-pointer shadow-xs touch-manipulation"
                        >
                          <div className="flex items-center gap-1 sm:gap-1.5 font-bold text-xs sm:text-sm">
                            <HelpCircle className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                            <span>Khó (Hard)</span>
                            <kbd className="hidden sm:inline-block px-1 rounded bg-amber-200/70 text-[10px] text-amber-800">2</kbd>
                          </div>
                          <span className="text-[10px] sm:text-[11px] font-semibold text-amber-700 mt-0.5">
                            +{getReviewIntervalPreview(currentCard, "hard")} ngày
                          </span>
                        </button>

                        {/* 3. Tốt (Good) */}
                        <button
                          type="button"
                          onClick={() => handleRateCard("good")}
                          className="flex flex-col items-center justify-center py-2.5 sm:py-3 px-2 sm:px-3 rounded-2xl bg-emerald-50 hover:bg-emerald-100 text-emerald-900 border-2 border-emerald-300 hover:border-emerald-400 transition-all active:scale-95 cursor-pointer shadow-xs touch-manipulation"
                        >
                          <div className="flex items-center gap-1 sm:gap-1.5 font-bold text-xs sm:text-sm">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                            <span>Tốt (Good)</span>
                            <kbd className="hidden sm:inline-block px-1 rounded bg-emerald-200/70 text-[10px] text-emerald-800">3</kbd>
                          </div>
                          <span className="text-[10px] sm:text-[11px] font-semibold text-emerald-700 mt-0.5">
                            +{getReviewIntervalPreview(currentCard, "good")} ngày
                          </span>
                        </button>

                        {/* 4. Dễ (Easy) */}
                        <button
                          type="button"
                          onClick={() => handleRateCard("easy")}
                          className="flex flex-col items-center justify-center py-2.5 sm:py-3 px-2 sm:px-3 rounded-2xl bg-blue-50 hover:bg-blue-100 text-blue-900 border-2 border-blue-300 hover:border-blue-400 transition-all active:scale-95 cursor-pointer shadow-xs touch-manipulation"
                        >
                          <div className="flex items-center gap-1 sm:gap-1.5 font-bold text-xs sm:text-sm">
                            <Sparkles className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                            <span>Dễ (Easy)</span>
                            <kbd className="hidden sm:inline-block px-1 rounded bg-blue-200/70 text-[10px] text-blue-800">4</kbd>
                          </div>
                          <span className="text-[10px] sm:text-[11px] font-semibold text-blue-700 mt-0.5">
                            +{getReviewIntervalPreview(currentCard, "easy")} ngày
                          </span>
                        </button>
                      </div>
                    </div>
                  ) : null}

                  {/* Bottom Navigation & Star Controls */}
                  <div className="flex items-center justify-between gap-1.5 sm:gap-3 pt-1">
                    <button
                      type="button"
                      onClick={handlePrev}
                      className="p-2.5 sm:p-3.5 rounded-2xl bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 shadow-xs active:scale-95 transition-all flex items-center gap-1 text-xs font-bold cursor-pointer shrink-0"
                    >
                      <ChevronLeft className="w-4 h-4 shrink-0" />
                      <span className="hidden sm:inline">Từ trước (←)</span>
                      <span className="inline sm:hidden">Trước</span>
                    </button>

                    <div className="flex items-center gap-1 sm:gap-2">
                      {/* Star Button */}
                      <button
                        type="button"
                        onClick={toggleStar}
                        className={`p-2.5 sm:px-4 sm:py-3 rounded-2xl border text-xs font-bold flex items-center gap-1.5 transition-all active:scale-95 cursor-pointer ${
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

                      {/* Flip Button */}
                      <button
                        type="button"
                        onClick={handleFlip}
                        className="px-3 sm:px-5 py-2.5 sm:py-3 rounded-2xl bg-[#1B5E20] hover:bg-[#2E7D32] text-white text-xs font-bold shadow-sm active:scale-95 transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap"
                      >
                        <RotateCcw className="w-3.5 h-3.5 shrink-0" />
                        <span className="hidden sm:inline">{isFlipped ? "Mặt trước (Space)" : "Lật thẻ (Space)"}</span>
                        <span className="inline sm:hidden">{isFlipped ? "Mặt trước" : "Lật thẻ"}</span>
                      </button>

                      {/* Delete Current Card Button */}
                      <button
                        type="button"
                        onClick={() => handleDeleteCard(currentCard)}
                        className="p-2.5 sm:p-3 rounded-2xl bg-white border border-slate-200 hover:bg-rose-50 hover:border-rose-200 text-slate-400 hover:text-rose-600 transition-all cursor-pointer shrink-0"
                        title="Xóa từ này khỏi Flashcard"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    <button
                      type="button"
                      onClick={handleNext}
                      className="p-2.5 sm:p-3.5 rounded-2xl bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 shadow-xs active:scale-95 transition-all flex items-center gap-1 text-xs font-bold cursor-pointer shrink-0"
                    >
                      <span className="hidden sm:inline">Từ tiếp (→)</span>
                      <span className="inline sm:hidden">Tiếp</span>
                      <ChevronRight className="w-4 h-4 shrink-0" />
                    </button>
                  </div>
                </div>
              ) : (
                /* Finished Due Cards or Empty Filter */
                <div className="bg-white p-10 sm:p-14 rounded-3xl border border-slate-200 text-center space-y-4">
                  {activeFilter === "due" ? (
                    <div className="space-y-3 max-w-md mx-auto">
                      <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto text-3xl shadow-xs">
                        🎉
                      </div>
                      <h3 className="text-xl font-extrabold text-slate-800">
                        Đã hoàn thành mục tiêu ôn tập hôm nay!
                      </h3>
                      <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                        Tuyệt vời! Toàn bộ từ vựng đến hạn của ngày hôm nay đã được ôn luyện và lên lịch lặp lại ngắt quãng chuẩn thuật toán Anki.
                      </p>
                      <div className="pt-2 flex flex-wrap items-center justify-center gap-2">
                        <button
                          type="button"
                          onClick={() => setActiveFilter("all")}
                          className="px-4 py-2.5 rounded-xl bg-[#1B5E20] hover:bg-[#2E7D32] text-white text-xs font-bold transition-all shadow-xs"
                        >
                          Xem tất cả từ vựng ({folderCards.length})
                        </button>
                        <Link
                          href="/exams"
                          className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-all"
                        >
                          Luyện thêm đề thi mới
                        </Link>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <BookOpen className="w-12 h-12 text-slate-300 mx-auto" />
                      <h3 className="text-base font-bold text-slate-700">
                        Không tìm thấy từ vựng trong bộ lọc này
                      </h3>
                      <p className="text-xs text-slate-400">
                        Hãy thử chuyển sang tab &quot;Tất cả&quot; hoặc tìm kiếm từ khóa khác.
                      </p>
                      <button
                        type="button"
                        onClick={() => {
                          setActiveFilter("all");
                          setSearchQuery("");
                        }}
                        className="mt-2 inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-100 text-slate-700 text-xs font-bold hover:bg-slate-200 transition-all"
                      >
                        Về danh sách tất cả
                      </button>
                    </div>
                  )}
                </div>
              )}
            </>
          )}

          {/* CHẾ ĐỘ 2: LIST VIEW (BẢNG DANH SÁCH TỪ KÈM CHU KỲ ANKI) */}
          {viewMode === "list" && (
            <div className="space-y-3">
              <div className="text-xs font-semibold text-slate-500">
                Hiển thị {filteredCards.length} từ trong thư mục đã chọn:
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {filteredCards.map((card, idx) => {
                  const isStarred = starredWords.includes(card.word);
                  const isDue = isCardDueToday(card);
                  const isMastered = card.state === "mastered" || card.interval >= 21;

                  return (
                    <div
                      key={card.id || idx}
                      className="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs hover:border-[#A5D6A7] transition-all space-y-2.5"
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

                      {/* SRS Info Badges */}
                      <div className="flex flex-wrap items-center justify-between gap-2 pt-1 border-t border-slate-100/80 text-[11px]">
                        <div className="flex items-center gap-1.5">
                          {isDue ? (
                            <span className="px-2 py-0.5 rounded-md bg-orange-100 text-orange-800 font-bold text-[10px] flex items-center gap-0.5">
                              <Flame className="w-3 h-3 text-orange-600" /> Đến hạn hôm nay
                            </span>
                          ) : isMastered ? (
                            <span className="px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 font-bold text-[10px] flex items-center gap-0.5">
                              <Award className="w-3 h-3 text-emerald-600" /> Đã nhớ vững
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 font-medium text-[10px] flex items-center gap-0.5">
                              <Calendar className="w-3 h-3 text-slate-400" /> Hạn: {card.dueDate}
                            </span>
                          )}

                          <span className="text-slate-400 text-[10px]">
                            • Chu kỳ: {card.interval} ngày
                          </span>
                        </div>

                        <div className="flex items-center gap-2">
                          {isStarred && (
                            <span className="text-amber-500 font-bold flex items-center gap-0.5">
                              <Star className="w-3 h-3 fill-amber-400" /> Ghim
                            </span>
                          )}
                          <span className="text-slate-400 text-[10px] font-mono">
                            {card.repetitions} reps
                          </span>
                        </div>
                      </div>

                      <div className="text-[10px] text-slate-400 truncate">
                        📁 {card.examTitle}
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
              <span>Phím tắt ôn tập Anki:</span>
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
                  1
                </kbd>
                {" - "}
                <kbd className="px-1.5 py-0.5 rounded bg-white border border-slate-300 font-mono text-[10px]">
                  4
                </kbd>{" "}
                Đánh giá Anki (Lại, Khó, Tốt, Dễ)
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
                Phát âm
              </span>
              <span>
                <kbd className="px-1.5 py-0.5 rounded bg-white border border-slate-300 font-mono text-[10px]">
                  S
                </kbd>{" "}
                Ghim từ
              </span>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
