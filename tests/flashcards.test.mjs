import { test, describe, beforeEach } from "node:test";
import assert from "node:assert/strict";

const store = new Map();
const localStorage = {
  getItem: (key) => store.get(key) || null,
  setItem: (key, val) => store.set(key, String(val)),
  removeItem: (key) => store.delete(key),
  clear: () => store.clear(),
};

const FLASHCARDS_LIST_KEY = "jlptn3:v1:flashcards_list";
const FLASHCARDS_PROGRESS_KEY = "jlptn3:v1:flashcards_progress";

function getTodayDateString(d = new Date()) {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function addDaysToDate(dateStr, days) {
  const parts = dateStr.split("-").map(Number);
  const target = new Date(parts[0], parts[1] - 1, parts[2]);
  target.setDate(target.getDate() + Math.max(1, days));
  return getTodayDateString(target);
}

function isCardDueToday(card, todayStr = getTodayDateString()) {
  if (!card.dueDate) return true;
  return card.dueDate <= todayStr || card.state === "new";
}

function normalizeFlashcardItem(card) {
  const today = getTodayDateString();
  const repetitions = typeof card.repetitions === "number" ? card.repetitions : 0;
  const interval = typeof card.interval === "number" ? card.interval : 0;
  const easeFactor = typeof card.easeFactor === "number" ? Math.max(1.3, card.easeFactor) : 2.5;

  let state = card.state || "new";
  if (!card.state) {
    if (interval >= 21) {
      state = "mastered";
    } else if (repetitions > 0) {
      state = "review";
    } else {
      state = "new";
    }
  }

  return {
    id: card.id || `${card.examId || "general"}_${card.word || "item"}_${Date.now()}`,
    word: card.word || "",
    reading: card.reading || "",
    meaning: card.meaning || "",
    sinoVietnamese: card.sinoVietnamese,
    example: card.example,
    examId: card.examId,
    examTitle: card.examTitle || "Từ vựng chung",
    questionId: card.questionId,
    addedAt: card.addedAt || new Date().toISOString(),
    interval,
    repetitions,
    easeFactor,
    dueDate: card.dueDate || today,
    lastReviewed: card.lastReviewed || null,
    state,
  };
}

function calculateNextReview(card, rating, baseDateStr = getTodayDateString()) {
  const currentRepetitions = card.repetitions ?? 0;
  const currentInterval = card.interval ?? 0;
  const currentEF = Math.max(1.3, card.easeFactor ?? 2.5);

  let nextInterval = 1;
  let nextRepetitions = currentRepetitions;
  let nextEF = currentEF;
  let nextState = "review";

  switch (rating) {
    case "again": {
      nextRepetitions = 0;
      nextInterval = 1;
      nextEF = Math.max(1.3, Number((currentEF - 0.2).toFixed(2)));
      nextState = "learning";
      break;
    }
    case "hard": {
      nextRepetitions = currentRepetitions + 1;
      if (currentInterval <= 1) {
        nextInterval = 1;
      } else {
        nextInterval = Math.max(2, Math.round(currentInterval * 1.2));
      }
      nextEF = Math.max(1.3, Number((currentEF - 0.15).toFixed(2)));
      nextState = nextInterval >= 21 ? "mastered" : "review";
      break;
    }
    case "good": {
      nextRepetitions = currentRepetitions + 1;
      if (nextRepetitions === 1) {
        nextInterval = 1;
      } else if (nextRepetitions === 2) {
        nextInterval = 3;
      } else {
        nextInterval = Math.max(4, Math.round(currentInterval * currentEF));
      }
      nextState = nextInterval >= 21 ? "mastered" : "review";
      break;
    }
    case "easy": {
      nextRepetitions = currentRepetitions + 1;
      if (nextRepetitions === 1) {
        nextInterval = 3;
      } else if (nextRepetitions === 2) {
        nextInterval = 6;
      } else {
        nextInterval = Math.max(6, Math.round(currentInterval * currentEF * 1.3));
      }
      nextEF = Number((currentEF + 0.15).toFixed(2));
      nextState = nextInterval >= 21 ? "mastered" : "review";
      break;
    }
  }

  const nextDueDate = addDaysToDate(baseDateStr, nextInterval);

  return {
    interval: nextInterval,
    repetitions: nextRepetitions,
    easeFactor: nextEF,
    dueDate: nextDueDate,
    lastReviewed: new Date().toISOString(),
    state: nextState,
  };
}

function getFlashcardSRSStats(cards) {
  const today = getTodayDateString();
  let dueToday = 0;
  let newCards = 0;
  let learning = 0;
  let mastered = 0;

  for (const c of cards) {
    if (c.state === "mastered" || c.interval >= 21) {
      mastered++;
    } else if (c.state === "new" || c.repetitions === 0) {
      newCards++;
    } else {
      learning++;
    }

    if (isCardDueToday(c, today)) {
      dueToday++;
    }
  }

  return {
    total: cards.length,
    dueToday,
    newCards,
    learning,
    mastered,
  };
}

function getAllFlashcards() {
  const raw = localStorage.getItem(FLASHCARDS_LIST_KEY);
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.map((item) => normalizeFlashcardItem(item));
  } catch {
    return [];
  }
}

function isFlashcardSaved(word, examId) {
  const cards = getAllFlashcards();
  if (examId) {
    return cards.some((c) => c.word === word && c.examId === examId);
  }
  return cards.some((c) => c.word === word);
}

function saveFlashcard(card) {
  const cards = getAllFlashcards();
  const existingIndex = cards.findIndex(
    (c) => c.word === card.word && (card.examId ? c.examId === card.examId : true)
  );

  const today = getTodayDateString();
  const newCard = normalizeFlashcardItem({
    ...card,
    id: card.id || `${card.examId || "general"}_${card.word}_${Date.now()}`,
    addedAt: card.addedAt || new Date().toISOString(),
    interval: card.interval ?? 0,
    repetitions: card.repetitions ?? 0,
    easeFactor: card.easeFactor ?? 2.5,
    dueDate: card.dueDate || today,
    lastReviewed: card.lastReviewed || null,
    state: card.state || "new",
  });

  if (existingIndex >= 0) {
    cards[existingIndex] = { ...cards[existingIndex], ...newCard };
  } else {
    cards.unshift(newCard);
  }

  localStorage.setItem(FLASHCARDS_LIST_KEY, JSON.stringify(cards));
  return newCard;
}

function reviewFlashcard(wordOrId, rating, examId) {
  const cards = getAllFlashcards();
  const index = cards.findIndex(
    (c) => (c.id === wordOrId || c.word === wordOrId) && (examId ? c.examId === examId : true)
  );

  if (index === -1) return null;

  const card = cards[index];
  const srsResult = calculateNextReview(card, rating);
  const updatedCard = {
    ...card,
    ...srsResult,
  };

  cards[index] = updatedCard;
  localStorage.setItem(FLASHCARDS_LIST_KEY, JSON.stringify(cards));
  return updatedCard;
}

function removeFlashcard(word, examId) {
  const cards = getAllFlashcards().filter(
    (c) => !(c.word === word && (examId ? c.examId === examId : true))
  );
  localStorage.setItem(FLASHCARDS_LIST_KEY, JSON.stringify(cards));
}

function toggleFlashcard(card) {
  if (isFlashcardSaved(card.word, card.examId)) {
    removeFlashcard(card.word, card.examId);
    return false;
  } else {
    saveFlashcard(card);
    return true;
  }
}

function clearAllFlashcards() {
  localStorage.removeItem(FLASHCARDS_LIST_KEY);
  localStorage.removeItem(FLASHCARDS_PROGRESS_KEY);
}

function clearFlashcardsByExam(examId) {
  const cards = getAllFlashcards().filter((c) => c.examId !== examId);
  localStorage.setItem(FLASHCARDS_LIST_KEY, JSON.stringify(cards));
}

function getFlashcardFolders() {
  const cards = getAllFlashcards();
  const folderMap = new Map();

  for (const card of cards) {
    const key = card.examId || "general";
    const existing = folderMap.get(key);
    if (existing) {
      existing.count += 1;
    } else {
      folderMap.set(key, {
        examId: key,
        examTitle: card.examTitle || "Từ vựng chung",
        count: 1,
      });
    }
  }

  return Array.from(folderMap.values());
}

describe("Hệ Thống Flashcard Theo Thư Mục Đề Thi (lib/storage.ts)", () => {
  beforeEach(() => {
    store.clear();
  });

  test("1. Khởi tạo Flashcard ban đầu là rỗng (đã xóa dữ liệu cũ)", () => {
    const cards = getAllFlashcards();
    assert.deepStrictEqual(cards, []);
  });

  test("2. Thêm từ vựng vào Flashcard kèm thông tin đề thi", () => {
    const saved = saveFlashcard({
      word: "消費",
      reading: "しょうひ",
      meaning: "tiêu thụ",
      sinoVietnamese: "TIÊU PHÍ",
      examId: "n3-best-moshi-01",
      examTitle: "ベスト模試 N3 — Đề 1",
      questionId: "voc-002",
    });

    assert.strictEqual(saved.word, "消費");
    assert.strictEqual(saved.examTitle, "ベスト模試 N3 — Đề 1");

    const cards = getAllFlashcards();
    assert.strictEqual(cards.length, 1);
    assert.strictEqual(isFlashcardSaved("消費", "n3-best-moshi-01"), true);
  });

  test("3. Phân chia Folder theo từng file đề làm bài", () => {
    // Thêm từ vào Đề 1
    saveFlashcard({
      word: "消費",
      reading: "しょうひ",
      meaning: "tiêu thụ",
      examId: "n3-best-moshi-01",
      examTitle: "ベスト模試 N3 — Đề 1",
    });
    saveFlashcard({
      word: "緑",
      reading: "みどり",
      meaning: "màu xanh lá",
      examId: "n3-best-moshi-01",
      examTitle: "ベスト模試 N3 — Đề 1",
    });

    // Thêm từ vào Đề Đọc Kanji 50
    saveFlashcard({
      word: "坂",
      reading: "さか",
      meaning: "dốc",
      examId: "n3-kanji-reading-50",
      examTitle: "Đề Thi Thực Chiến Chữ Hán - 50 Câu Đọc Kanji",
    });

    const folders = getFlashcardFolders();
    assert.strictEqual(folders.length, 2);

    const folder1 = folders.find((f) => f.examId === "n3-best-moshi-01");
    assert.ok(folder1);
    assert.strictEqual(folder1.count, 2);
    assert.strictEqual(folder1.examTitle, "ベスト模試 N3 — Đề 1");

    const folder2 = folders.find((f) => f.examId === "n3-kanji-reading-50");
    assert.ok(folder2);
    assert.strictEqual(folder2.count, 1);
  });

  test("4. Toggle Flashcard: Bấm thêm lần 1 lưu, bấm lần 2 gỡ bỏ", () => {
    const cardData = {
      word: "完成",
      reading: "かんせい",
      meaning: "hoàn thành",
      examId: "n3-best-moshi-01",
      examTitle: "ベスト模試 N3 — Đề 1",
    };

    const added = toggleFlashcard(cardData);
    assert.strictEqual(added, true);
    assert.strictEqual(isFlashcardSaved("完成", "n3-best-moshi-01"), true);

    const removed = toggleFlashcard(cardData);
    assert.strictEqual(removed, false);
    assert.strictEqual(isFlashcardSaved("完成", "n3-best-moshi-01"), false);
  });

  test("5. Xóa từ vựng theo Folder đề thi (clearFlashcardsByExam)", () => {
    saveFlashcard({
      word: "消費",
      reading: "しょうひ",
      meaning: "tiêu thụ",
      examId: "n3-best-moshi-01",
      examTitle: "ベスト模試 N3 — Đề 1",
    });
    saveFlashcard({
      word: "坂",
      reading: "さか",
      meaning: "dốc",
      examId: "n3-kanji-reading-50",
      examTitle: "Đề Thi Thực Chiến Chữ Hán - 50 Câu Đọc Kanji",
    });

    clearFlashcardsByExam("n3-best-moshi-01");

    const remaining = getAllFlashcards();
    assert.strictEqual(remaining.length, 1);
    assert.strictEqual(remaining[0].word, "坂");
  });

  test("6. Xóa toàn bộ dữ liệu Flashcard (clearAllFlashcards)", () => {
    saveFlashcard({
      word: "消費",
      reading: "しょうひ",
      meaning: "tiêu thụ",
      examId: "n3-best-moshi-01",
      examTitle: "ベスト模試 N3 — Đề 1",
    });

    clearAllFlashcards();
    assert.deepStrictEqual(getAllFlashcards(), []);
  });

  test("7. Thẻ mới tạo có đầy đủ siêu dữ liệu SRS Anki mặc định", () => {
    const card = saveFlashcard({
      word: "消費期限",
      reading: "しょうひきげん",
      meaning: "hạn sử dụng",
      examId: "n3-best-moshi-01",
      examTitle: "ベスト模試 N3 — Đề 1",
    });

    assert.strictEqual(card.interval, 0);
    assert.strictEqual(card.repetitions, 0);
    assert.strictEqual(card.easeFactor, 2.5);
    assert.strictEqual(card.state, "new");
    assert.strictEqual(typeof card.dueDate, "string");
    assert.strictEqual(isCardDueToday(card), true);
  });

  test("8. SM-2 'again' (Lại): Quên từ -> reset rep về 0, interval = 1 ngày, giảm EF", () => {
    const card = saveFlashcard({
      word: "近づく",
      reading: "ちかづく",
      meaning: "đến gần",
      interval: 10,
      repetitions: 3,
      easeFactor: 2.5,
      state: "review",
    });

    const result = calculateNextReview(card, "again", "2026-11-07");
    assert.strictEqual(result.repetitions, 0);
    assert.strictEqual(result.interval, 1);
    assert.strictEqual(result.easeFactor, 2.3);
    assert.strictEqual(result.state, "learning");
    assert.strictEqual(result.dueDate, "2026-11-08");
  });

  test("9. SM-2 'good' (Tốt): Chu kỳ tăng dần (1 -> 3 -> interval * EF)", () => {
    const baseDate = "2026-11-07";

    // Lần 1: rep 0 -> rep 1: interval = 1 ngày
    const card0 = { word: "A", repetitions: 0, interval: 0, easeFactor: 2.5 };
    const r1 = calculateNextReview(card0, "good", baseDate);
    assert.strictEqual(r1.repetitions, 1);
    assert.strictEqual(r1.interval, 1);
    assert.strictEqual(r1.dueDate, "2026-11-08");

    // Lần 2: rep 1 -> rep 2: interval = 3 ngày
    const card1 = { ...card0, ...r1 };
    const r2 = calculateNextReview(card1, "good", "2026-11-08");
    assert.strictEqual(r2.repetitions, 2);
    assert.strictEqual(r2.interval, 3);
    assert.strictEqual(r2.dueDate, "2026-11-11");

    // Lần 3: rep 2 -> rep 3: interval = Math.round(3 * 2.5) = 8 ngày
    const card2 = { ...card1, ...r2 };
    const r3 = calculateNextReview(card2, "good", "2026-11-11");
    assert.strictEqual(r3.repetitions, 3);
    assert.strictEqual(r3.interval, 8);
    assert.strictEqual(r3.dueDate, "2026-11-19");
  });

  test("10. SM-2 'easy' (Dễ) và chuyển sang trạng thái Mastered khi interval >= 21 ngày", () => {
    const baseDate = "2026-11-07";
    const card = { word: "B", repetitions: 3, interval: 12, easeFactor: 2.5, state: "review" };

    const r = calculateNextReview(card, "easy", baseDate);
    assert.strictEqual(r.repetitions, 4);
    // 12 * 2.5 * 1.3 = 39 ngày >= 21 ngày -> state mastered
    assert.strictEqual(r.interval, 39);
    assert.strictEqual(r.easeFactor, 2.65);
    assert.strictEqual(r.state, "mastered");
    assert.strictEqual(r.dueDate, "2026-12-16");
  });

  test("11. reviewFlashcard cập nhật storage và thống kê getFlashcardSRSStats", () => {
    const card = saveFlashcard({
      word: "坂",
      reading: "さか",
      meaning: "con dốc",
      examId: "n3-best-moshi-01",
      examTitle: "ベスト模試 N3 — Đề 1",
    });

    // Ban đầu thẻ mới
    let cards = getAllFlashcards();
    let stats = getFlashcardSRSStats(cards);
    assert.strictEqual(stats.total, 1);
    assert.strictEqual(stats.newCards, 1);
    assert.strictEqual(stats.dueToday, 1);
    assert.strictEqual(stats.mastered, 0);

    // Người dùng chọn đánh giá "good"
    const updated = reviewFlashcard(card.id, "good");
    assert.ok(updated);
    assert.strictEqual(updated.repetitions, 1);
    assert.strictEqual(updated.interval, 1);

    cards = getAllFlashcards();
    stats = getFlashcardSRSStats(cards);
    assert.strictEqual(stats.newCards, 0);
    assert.strictEqual(stats.learning, 1);
    // Vì dueDate là ngày mai nên không còn due hôm nay
    assert.strictEqual(stats.dueToday, 0);
  });
});
