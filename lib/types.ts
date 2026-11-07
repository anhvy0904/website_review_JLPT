export type JLPTLevel = "N3";
export type ExamStatus = "draft" | "published";
export type ExamMode = "practice" | "exam";
export type SectionType = "vocabulary" | "grammar" | "reading";

export type Subtype =
  | "kanji_reading"       // Cách đọc Kanji (Mondai 1)
  | "kanji_writing"       // Cách viết Kanji (Mondai 2)
  | "contextual_use"     // Tìm từ phù hợp ngữ cảnh (Mondai 3)
  | "paraphrase"          // Từ đồng nghĩa / diễn đạt tương đương (Mondai 4)
  | "usage"               // Cách dùng từ đúng (Mondai 5)
  | "sentence_grammar"    // Ngữ pháp câu (Mondai 1)
  | "sentence_composition"// Dấu sao ghép câu (Mondai 2)
  | "text_grammar"        // Ngữ pháp đoạn văn (Mondai 3)
  | "reading_short"       // Đoạn văn ngắn (Mondai 4)
  | "reading_medium"      // Đoạn văn trung (Mondai 5)
  | "reading_long"        // Đoạn văn dài (Mondai 6)
  | "info_retrieval";     // Tìm kiếm thông tin (Mondai 7)

export interface ExamOption {
  id: string; // "1", "2", "3", "4"
  text: string;
}

export interface VocabularyItem {
  word: string;
  hiragana: string;
  meaningVi: string;
}

export interface GrammarPoint {
  pattern: string;
  meaningVi: string;
  usageVi?: string;
  exampleJa?: string;
  exampleVi?: string;
}

export interface QuestionExplanation {
  summaryVi: string;
  correctReasonVi: string;
  optionReasonsVi: Record<string, string>; // Bắt buộc cho TẤT CẢ các options
  translationVi: string;
  vocabulary?: VocabularyItem[];
  grammarPoints?: GrammarPoint[];
  readingEvidenceJa?: string;
  studyTipVi?: string;
}

export interface QuestionReview {
  status: "verified" | "needs_review";
  notes?: string;
}

export interface ExamQuestion {
  id: string;
  number: number;
  section: SectionType;
  subtype: Subtype | string;
  passageId?: string;
  questionText: string;
  options: ExamOption[];
  correctOptionId: string;
  difficulty: number; // 1 to 5
  tags?: string[];
  explanation: QuestionExplanation;
  review: QuestionReview;
}

export interface ExamPassage {
  id: string;
  title?: string;
  text: string;
  imagePath?: string;
}

export interface ExamSource {
  fileName: string;
  type: string;
  notes?: string;
  reviewedByHuman: boolean;
}

export interface ExamSettings {
  timeLimitMinutes: number;
  allowedModes: ExamMode[];
}

export interface ExamDetail {
  schemaVersion: "1.0.0";
  id: string;
  title: string;
  description: string;
  level: JLPTLevel;
  status: ExamStatus;
  source: ExamSource;
  settings: ExamSettings;
  passages: ExamPassage[];
  questions: ExamQuestion[];
  questionCount: number;
}

export interface ExamIndexItem {
  id: string;
  title: string;
  description: string;
  level: JLPTLevel;
  status: ExamStatus;
  questionCount: number;
  timeLimitMinutes: number;
  allowedModes: ExamMode[];
  sectionCounts: {
    vocabulary: number;
    grammar: number;
    reading: number;
  };
  subtypes: string[];
  tags: string[];
  lastUpdated: string;
}

export interface ExamAttempt {
  attemptId: string;
  examId: string;
  examTitle?: string;
  mode: ExamMode;
  startedAt: string; // ISO
  submittedAt: string | null; // ISO
  elapsedSeconds: number;
  answers: Record<string, string>; // questionId -> optionId
  checkedQuestionIds: string[]; // for practice mode
  flaggedQuestionIds: string[];
  currentQuestionId?: string;
  status: "in_progress" | "completed";
}

export interface AttemptScoringResult {
  attemptId: string;
  examId: string;
  mode: ExamMode;
  totalQuestions: number;
  answeredCount: number;
  correctCount: number;
  incorrectCount: number;
  skippedCount: number;
  scorePercent: number; // raw percent 0-100, rounded to 1 decimal
  elapsedSeconds: number;
  sectionStats: Record<
    SectionType,
    {
      total: number;
      correct: number;
      percent: number;
    }
  >;
  subtypeStats: Record<
    string,
    {
      total: number;
      correct: number;
      incorrect: number;
      skipped: number;
      percent: number;
    }
  >;
  questionResults: Array<{
    questionId: string;
    number: number;
    section: SectionType;
    subtype: string;
    selectedOptionId?: string;
    correctOptionId: string;
    isCorrect: boolean;
    isSkipped: boolean;
    isFlagged: boolean;
  }>;
}

export interface QuestionReport {
  questionId: string;
  issueType: "wrong_answer" | "unclear_explanation" | "typo" | "other";
  comment?: string;
}

export interface ExamSurvey {
  attemptId: string;
  examId: string;
  difficultyRating: number; // 1 to 5
  usefulnessRating: number; // 1 to 5
  feedbackText?: string;
  reportedQuestions?: QuestionReport[];
  submittedAt: string;
}
