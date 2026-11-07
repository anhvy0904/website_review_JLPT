import { ExamAttempt, ExamSurvey, QuestionReport } from "./types";

const ATTEMPTS_KEY = "jlptn3:v1:attempts";
const SURVEYS_KEY = "jlptn3:v1:surveys";
const BOOKMARKS_KEY = "jlptn3:v1:bookmarks";
const REPORTS_KEY = "jlptn3:v1:question_reports";
const FLASHCARDS_LIST_KEY = "jlptn3:v1:flashcards_list";
const FLASHCARDS_PROGRESS_KEY = "jlptn3:v1:flashcards_progress";

export type FlashcardRating = "again" | "hard" | "good" | "easy";
export type FlashcardState = "new" | "learning" | "review" | "mastered";

export interface FlashcardItem {
  id: string;
  word: string;
  reading: string;
  meaning: string;
  sinoVietnamese?: string;
  example?: string;
  examId?: string;
  examTitle: string;
  questionId?: string;
  addedAt: string;
  // SRS Anki (SM-2) Fields:
  interval: number; // Khoảng thời gian lặp lại tính bằng ngày (0 với thẻ mới)
  repetitions: number; // Số lần ôn liên tiếp thành công
  easeFactor: number; // Hệ số dễ SM-2 (mặc định 2.5, tối thiểu 1.3)
  dueDate: string; // Ngày đến hạn ôn tiếp theo định dạng 'YYYY-MM-DD'
  lastReviewed: string | null; // ISO string ngày giờ ôn gần nhất
  state: FlashcardState; // "new" | "learning" | "review" | "mastered"
}

function isLocalStorageAvailable(): boolean {
  if (typeof window === "undefined") return false;
  try {
    const testKey = "__jlpt_storage_test__";
    window.localStorage.setItem(testKey, "1");
    window.localStorage.removeItem(testKey);
    return true;
  } catch {
    return false;
  }
}

export function getAllAttempts(): ExamAttempt[] {
  if (!isLocalStorageAvailable()) return [];
  try {
    const raw = window.localStorage.getItem(ATTEMPTS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (err) {
    console.error("Lỗi khi đọc attempts từ localStorage:", err);
    return [];
  }
}

export function getAttempt(attemptId: string): ExamAttempt | null {
  const attempts = getAllAttempts();
  return attempts.find((a) => a.attemptId === attemptId) || null;
}

export function getActiveAttempt(examId: string): ExamAttempt | null {
  const attempts = getAllAttempts();
  return attempts.find((a) => a.examId === examId && a.status === "in_progress") || null;
}

export function saveAttempt(attempt: ExamAttempt): void {
  if (!isLocalStorageAvailable()) return;
  try {
    const attempts = getAllAttempts();
    const index = attempts.findIndex((a) => a.attemptId === attempt.attemptId);

    if (index >= 0) {
      attempts[index] = attempt;
    } else {
      attempts.unshift(attempt);
    }

    window.localStorage.setItem(ATTEMPTS_KEY, JSON.stringify(attempts));
  } catch (err) {
    console.error("Lỗi khi lưu attempt vào localStorage:", err);
  }
}

export function deleteAttempt(attemptId: string): void {
  if (!isLocalStorageAvailable()) return;
  try {
    const attempts = getAllAttempts().filter((a) => a.attemptId !== attemptId);
    window.localStorage.setItem(ATTEMPTS_KEY, JSON.stringify(attempts));
  } catch (err) {
    console.error("Lỗi khi xóa attempt:", err);
  }
}

// SURVEY STORAGE
export function getAllSurveys(): ExamSurvey[] {
  if (!isLocalStorageAvailable()) return [];
  try {
    const raw = window.localStorage.getItem(SURVEYS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function getSurvey(attemptId: string): ExamSurvey | null {
  const surveys = getAllSurveys();
  return surveys.find((s) => s.attemptId === attemptId) || null;
}

export function saveSurvey(survey: ExamSurvey): void {
  if (!isLocalStorageAvailable()) return;
  try {
    const surveys = getAllSurveys();
    const index = surveys.findIndex((s) => s.attemptId === survey.attemptId);
    if (index >= 0) {
      surveys[index] = survey;
    } else {
      surveys.unshift(survey);
    }
    window.localStorage.setItem(SURVEYS_KEY, JSON.stringify(surveys));
  } catch (err) {
    console.error("Lỗi khi lưu survey:", err);
  }
}

// BOOKMARKS STORAGE
export function getBookmarkedQuestions(): string[] {
  if (!isLocalStorageAvailable()) return [];
  try {
    const raw = window.localStorage.getItem(BOOKMARKS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function toggleBookmarkQuestion(questionId: string): boolean {
  if (!isLocalStorageAvailable()) return false;
  try {
    const bookmarks = new Set(getBookmarkedQuestions());
    let isBookmarked = false;
    if (bookmarks.has(questionId)) {
      bookmarks.delete(questionId);
      isBookmarked = false;
    } else {
      bookmarks.add(questionId);
      isBookmarked = true;
    }
    window.localStorage.setItem(BOOKMARKS_KEY, JSON.stringify(Array.from(bookmarks)));
    return isBookmarked;
  } catch {
    return false;
  }
}

// QUESTION REPORTS
export function getAllQuestionReports(): (QuestionReport & { createdAt: string })[] {
  if (!isLocalStorageAvailable()) return [];
  try {
    const raw = window.localStorage.getItem(REPORTS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function saveQuestionReport(report: QuestionReport): void {
  if (!isLocalStorageAvailable()) return;
  try {
    const reports = getAllQuestionReports();
    reports.unshift({
      ...report,
      createdAt: new Date().toISOString(),
    });
    window.localStorage.setItem(REPORTS_KEY, JSON.stringify(reports));
  } catch (err) {
    console.error("Lỗi khi lưu report:", err);
  }
}

// ==========================================
// FLASHCARDS & ANKI-STYLE SRS (SM-2) STORAGE
// ==========================================

export function getTodayDateString(d: Date = new Date()): string {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function addDaysToDate(dateStr: string, days: number): string {
  try {
    const parts = dateStr.split("-").map(Number);
    const target = new Date(parts[0], parts[1] - 1, parts[2]);
    target.setDate(target.getDate() + Math.max(1, days));
    return getTodayDateString(target);
  } catch {
    const fallback = new Date();
    fallback.setDate(fallback.getDate() + Math.max(1, days));
    return getTodayDateString(fallback);
  }
}

export function isCardDueToday(card: FlashcardItem, todayStr: string = getTodayDateString()): boolean {
  if (!card.dueDate) return true;
  return card.dueDate <= todayStr || card.state === "new";
}

export function normalizeFlashcardItem(card: Partial<FlashcardItem>): FlashcardItem {
  const today = getTodayDateString();
  const repetitions = typeof card.repetitions === "number" ? card.repetitions : 0;
  const interval = typeof card.interval === "number" ? card.interval : 0;
  const easeFactor = typeof card.easeFactor === "number" ? Math.max(1.3, card.easeFactor) : 2.5;

  let state: FlashcardState = card.state || "new";
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

export interface ReviewCalculationResult {
  interval: number;
  repetitions: number;
  easeFactor: number;
  dueDate: string;
  lastReviewed: string;
  state: FlashcardState;
}

/**
 * Thuật toán tính chu kỳ lặp lại ngắt quãng SM-2 chuẩn Anki:
 * - "again" (Lại - 1): Quên / Nhớ sai. Reset rep về 0, interval = 1 ngày, giảm EF, state = learning.
 * - "hard"  (Khó - 2): Nhớ vất vả. Rep += 1, interval tăng 1.2x (hoặc 1 ngày nếu mới), giảm nhẹ EF, state = review.
 * - "good"  (Tốt - 3): Nhớ chuẩn. Rep += 1, Rep 1 = 1 ngày, Rep 2 = 3 ngày, Rep > 2 = interval * EF.
 * - "easy"  (Dễ - 4): Nhớ ngay lập tức. Rep += 1, Rep 1 = 3 ngày, Rep 2 = 6 ngày, Rep > 2 = interval * EF * 1.3, tăng EF.
 */
export function calculateNextReview(
  card: FlashcardItem,
  rating: FlashcardRating,
  baseDateStr: string = getTodayDateString()
): ReviewCalculationResult {
  const currentRepetitions = card.repetitions ?? 0;
  const currentInterval = card.interval ?? 0;
  const currentEF = Math.max(1.3, card.easeFactor ?? 2.5);

  let nextInterval = 1;
  let nextRepetitions = currentRepetitions;
  let nextEF = currentEF;
  let nextState: FlashcardState = "review";

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

export function getReviewIntervalPreview(card: FlashcardItem, rating: FlashcardRating): number {
  return calculateNextReview(card, rating).interval;
}

export function getFlashcardSRSStats(cards: FlashcardItem[]): {
  total: number;
  dueToday: number;
  newCards: number;
  learning: number;
  mastered: number;
} {
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

export function getAllFlashcards(): FlashcardItem[] {
  if (!isLocalStorageAvailable()) return [];
  try {
    const raw = window.localStorage.getItem(FLASHCARDS_LIST_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.map((item) => normalizeFlashcardItem(item));
  } catch (err) {
    console.error("Lỗi đọc flashcards:", err);
    return [];
  }
}

export function isFlashcardSaved(word: string, examId?: string): boolean {
  const cards = getAllFlashcards();
  if (examId) {
    return cards.some((c) => c.word === word && c.examId === examId);
  }
  return cards.some((c) => c.word === word);
}

export function saveFlashcard(
  card: Omit<FlashcardItem, "id" | "addedAt" | "interval" | "repetitions" | "easeFactor" | "dueDate" | "lastReviewed" | "state"> &
    Partial<FlashcardItem>
): FlashcardItem {
  const cards = getAllFlashcards();
  const existingIndex = cards.findIndex(
    (c) => c.word === card.word && (card.examId ? c.examId === card.examId : true)
  );

  const today = getTodayDateString();
  const newCard: FlashcardItem = normalizeFlashcardItem({
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

  if (isLocalStorageAvailable()) {
    window.localStorage.setItem(FLASHCARDS_LIST_KEY, JSON.stringify(cards));
  }

  return newCard;
}

export function reviewFlashcard(
  wordOrId: string,
  rating: FlashcardRating,
  examId?: string
): FlashcardItem | null {
  if (!isLocalStorageAvailable()) return null;
  const cards = getAllFlashcards();
  const index = cards.findIndex(
    (c) => (c.id === wordOrId || c.word === wordOrId) && (examId ? c.examId === examId : true)
  );

  if (index === -1) return null;

  const card = cards[index];
  const srsResult = calculateNextReview(card, rating);
  const updatedCard: FlashcardItem = {
    ...card,
    ...srsResult,
  };

  cards[index] = updatedCard;
  window.localStorage.setItem(FLASHCARDS_LIST_KEY, JSON.stringify(cards));
  return updatedCard;
}

export function removeFlashcard(word: string, examId?: string): void {
  if (!isLocalStorageAvailable()) return;
  const cards = getAllFlashcards().filter(
    (c) => !(c.word === word && (examId ? c.examId === examId : true))
  );
  window.localStorage.setItem(FLASHCARDS_LIST_KEY, JSON.stringify(cards));
}

export function toggleFlashcard(
  card: Omit<FlashcardItem, "id" | "addedAt" | "interval" | "repetitions" | "easeFactor" | "dueDate" | "lastReviewed" | "state"> &
    Partial<FlashcardItem>
): boolean {
  if (isFlashcardSaved(card.word, card.examId)) {
    removeFlashcard(card.word, card.examId);
    return false;
  } else {
    saveFlashcard(card);
    return true;
  }
}

export function clearAllFlashcards(): void {
  if (!isLocalStorageAvailable()) return;
  window.localStorage.removeItem(FLASHCARDS_LIST_KEY);
  window.localStorage.removeItem(FLASHCARDS_PROGRESS_KEY);
}

export function clearFlashcardsByExam(examId: string): void {
  if (!isLocalStorageAvailable()) return;
  const cards = getAllFlashcards().filter((c) => c.examId !== examId);
  window.localStorage.setItem(FLASHCARDS_LIST_KEY, JSON.stringify(cards));
}

export function getFlashcardFolders(): { examId: string; examTitle: string; count: number }[] {
  const cards = getAllFlashcards();
  const folderMap = new Map<string, { examId: string; examTitle: string; count: number }>();

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

export function getFlashcardsProgress(): { starred: string[]; mastered: string[] } {
  if (!isLocalStorageAvailable()) return { starred: [], mastered: [] };
  try {
    const raw = window.localStorage.getItem(FLASHCARDS_PROGRESS_KEY);
    if (!raw) return { starred: [], mastered: [] };
    const parsed = JSON.parse(raw);
    return {
      starred: Array.isArray(parsed.starred) ? parsed.starred : [],
      mastered: Array.isArray(parsed.mastered) ? parsed.mastered : [],
    };
  } catch {
    return { starred: [], mastered: [] };
  }
}

export function saveFlashcardsProgress(progress: { starred: string[]; mastered: string[] }): void {
  if (!isLocalStorageAvailable()) return;
  window.localStorage.setItem(FLASHCARDS_PROGRESS_KEY, JSON.stringify(progress));
}

// BACKUP & RESTORE
export interface BackupData {
  version: "1.0.0";
  exportedAt: string;
  attempts: ExamAttempt[];
  surveys: ExamSurvey[];
  bookmarks: string[];
  reports?: (QuestionReport & { createdAt: string })[];
  flashcards?: FlashcardItem[];
  flashcardsProgress?: { starred: string[]; mastered: string[] };
}

export function exportUserData(): string {
  const backup: BackupData = {
    version: "1.0.0",
    exportedAt: new Date().toISOString(),
    attempts: getAllAttempts(),
    surveys: getAllSurveys(),
    bookmarks: getBookmarkedQuestions(),
    reports: getAllQuestionReports(),
    flashcards: getAllFlashcards(),
    flashcardsProgress: getFlashcardsProgress(),
  };
  return JSON.stringify(backup, null, 2);
}

export function importUserData(jsonString: string): { success: boolean; message: string; count?: number } {
  if (!isLocalStorageAvailable()) {
    return { success: false, message: "Trình duyệt không hỗ trợ localStorage" };
  }
  try {
    const parsed: BackupData = JSON.parse(jsonString);
    if (!parsed || !Array.isArray(parsed.attempts)) {
      return { success: false, message: "Định dạng file sao lưu không hợp lệ" };
    }

    window.localStorage.setItem(ATTEMPTS_KEY, JSON.stringify(parsed.attempts));
    if (Array.isArray(parsed.surveys)) {
      window.localStorage.setItem(SURVEYS_KEY, JSON.stringify(parsed.surveys));
    }
    if (Array.isArray(parsed.bookmarks)) {
      window.localStorage.setItem(BOOKMARKS_KEY, JSON.stringify(parsed.bookmarks));
    }
    if (Array.isArray(parsed.reports)) {
      window.localStorage.setItem(REPORTS_KEY, JSON.stringify(parsed.reports));
    }
    if (Array.isArray(parsed.flashcards)) {
      window.localStorage.setItem(FLASHCARDS_LIST_KEY, JSON.stringify(parsed.flashcards));
    }
    if (parsed.flashcardsProgress) {
      window.localStorage.setItem(FLASHCARDS_PROGRESS_KEY, JSON.stringify(parsed.flashcardsProgress));
    }

    return {
      success: true,
      message: `Đã khôi phục thành công ${parsed.attempts.length} lượt làm bài, ${parsed.surveys?.length || 0} khảo sát, ${parsed.bookmarks?.length || 0} câu đã ghim và ${parsed.flashcards?.length || 0} thẻ flashcard!`,
      count: parsed.attempts.length,
    };
  } catch (err: any) {
    return { success: false, message: `Lỗi đọc dữ liệu: ${err.message}` };
  }
}
