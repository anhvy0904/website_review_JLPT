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

function getAllFlashcards() {
  const raw = localStorage.getItem(FLASHCARDS_LIST_KEY);
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
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

  const newCard = {
    ...card,
    id: `${card.examId || "general"}_${card.word}_${Date.now()}`,
    addedAt: new Date().toISOString(),
  };

  if (existingIndex >= 0) {
    cards[existingIndex] = { ...cards[existingIndex], ...newCard };
  } else {
    cards.unshift(newCard);
  }

  localStorage.setItem(FLASHCARDS_LIST_KEY, JSON.stringify(cards));
  return newCard;
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
});
