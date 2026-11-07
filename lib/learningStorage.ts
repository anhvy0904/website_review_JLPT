export interface LearningQuizResult {
  quizId: string;
  module: "verb-forms" | "keigo";
  formId?: string;
  topicId?: string;
  selectedOptionId: string;
  isCorrect: boolean;
  timestamp: string;
}

export interface LearningProgress {
  completedVerbLessons: string[]; // e.g. ["te", "ta"]
  completedKeigoLessons: string[]; // e.g. ["sonkeigo", "kenjougo"]
  savedWrongQuizIds: string[];
  quizHistory: LearningQuizResult[];
  furiganaVisible: boolean;
}

const LEARNING_STORAGE_KEY = "jlptn3:v1:learning_progress";

const DEFAULT_PROGRESS: LearningProgress = {
  completedVerbLessons: [],
  completedKeigoLessons: [],
  savedWrongQuizIds: [],
  quizHistory: [],
  furiganaVisible: true,
};

export function getLearningProgress(): LearningProgress {
  if (typeof window === "undefined") return DEFAULT_PROGRESS;
  try {
    const raw = localStorage.getItem(LEARNING_STORAGE_KEY);
    if (!raw) return DEFAULT_PROGRESS;
    const parsed = JSON.parse(raw);
    return {
      completedVerbLessons: Array.isArray(parsed.completedVerbLessons)
        ? parsed.completedVerbLessons
        : [],
      completedKeigoLessons: Array.isArray(parsed.completedKeigoLessons)
        ? parsed.completedKeigoLessons
        : [],
      savedWrongQuizIds: Array.isArray(parsed.savedWrongQuizIds)
        ? parsed.savedWrongQuizIds
        : [],
      quizHistory: Array.isArray(parsed.quizHistory) ? parsed.quizHistory : [],
      furiganaVisible:
        typeof parsed.furiganaVisible === "boolean" ? parsed.furiganaVisible : true,
    };
  } catch {
    return DEFAULT_PROGRESS;
  }
}

export function saveLearningProgress(progress: LearningProgress): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(LEARNING_STORAGE_KEY, JSON.stringify(progress));
  } catch (err) {
    console.error("Lỗi lưu tiến độ học chuyên đề:", err);
  }
}

export function markLessonCompleted(
  module: "verb-forms" | "keigo",
  lessonId: string
): void {
  const p = getLearningProgress();
  if (module === "verb-forms") {
    if (!p.completedVerbLessons.includes(lessonId)) {
      p.completedVerbLessons.push(lessonId);
      saveLearningProgress(p);
    }
  } else {
    if (!p.completedKeigoLessons.includes(lessonId)) {
      p.completedKeigoLessons.push(lessonId);
      saveLearningProgress(p);
    }
  }
}

export function recordQuizAttempt(result: LearningQuizResult): void {
  const p = getLearningProgress();
  p.quizHistory.push(result);

  if (!result.isCorrect && !p.savedWrongQuizIds.includes(result.quizId)) {
    p.savedWrongQuizIds.push(result.quizId);
  } else if (result.isCorrect && p.savedWrongQuizIds.includes(result.quizId)) {
    // If answered correctly later, can keep or remove, let's keep or allow user to toggle
  }

  saveLearningProgress(p);
}

export function toggleWrongQuizSaved(quizId: string): boolean {
  const p = getLearningProgress();
  let isSaved = false;
  if (p.savedWrongQuizIds.includes(quizId)) {
    p.savedWrongQuizIds = p.savedWrongQuizIds.filter((id) => id !== quizId);
    isSaved = false;
  } else {
    p.savedWrongQuizIds.push(quizId);
    isSaved = true;
  }
  saveLearningProgress(p);
  return isSaved;
}

export function setFuriganaPreference(visible: boolean): void {
  const p = getLearningProgress();
  p.furiganaVisible = visible;
  saveLearningProgress(p);
}

export function getVerbFormsStats() {
  const p = getLearningProgress();
  const totalLessons = 12;
  const completedCount = p.completedVerbLessons.length;
  const verbQuizzes = p.quizHistory.filter((q) => q.module === "verb-forms");
  const correctCount = verbQuizzes.filter((q) => q.isCorrect).length;
  const accuracy =
    verbQuizzes.length > 0 ? Math.round((correctCount / verbQuizzes.length) * 100) : 0;

  return {
    totalLessons,
    completedCount,
    percentCompleted: Math.round((completedCount / totalLessons) * 100),
    totalQuizzesTaken: verbQuizzes.length,
    accuracy,
  };
}

export function getKeigoStats() {
  const p = getLearningProgress();
  const totalLessons = 5;
  const completedCount = p.completedKeigoLessons.length;
  const keigoQuizzes = p.quizHistory.filter((q) => q.module === "keigo");
  const correctCount = keigoQuizzes.filter((q) => q.isCorrect).length;
  const accuracy =
    keigoQuizzes.length > 0 ? Math.round((correctCount / keigoQuizzes.length) * 100) : 0;

  return {
    totalLessons,
    completedCount,
    percentCompleted: Math.round((completedCount / totalLessons) * 100),
    totalQuizzesTaken: keigoQuizzes.length,
    accuracy,
  };
}
