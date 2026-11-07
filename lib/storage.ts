import { ExamAttempt, ExamSurvey } from "./types";

const ATTEMPTS_KEY = "jlptn3:v1:attempts";
const SURVEYS_KEY = "jlptn3:v1:surveys";
const BOOKMARKS_KEY = "jlptn3:v1:bookmarks";

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

// BACKUP & RESTORE
export interface BackupData {
  version: "1.0.0";
  exportedAt: string;
  attempts: ExamAttempt[];
  surveys: ExamSurvey[];
  bookmarks: string[];
}

export function exportUserData(): string {
  const backup: BackupData = {
    version: "1.0.0",
    exportedAt: new Date().toISOString(),
    attempts: getAllAttempts(),
    surveys: getAllSurveys(),
    bookmarks: getBookmarkedQuestions(),
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

    return {
      success: true,
      message: `Đã khôi phục thành công ${parsed.attempts.length} lượt làm bài, ${parsed.surveys?.length || 0} khảo sát và ${parsed.bookmarks?.length || 0} câu đã ghim!`,
      count: parsed.attempts.length,
    };
  } catch (err: any) {
    return { success: false, message: `Lỗi đọc dữ liệu: ${err.message}` };
  }
}
