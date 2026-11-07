export type JLPTLevel = "N3";
export type ExamStatus = "draft" | "published";
export type ExamMode = "practice" | "exam";
export type SectionType = "vocabulary" | "grammar" | "reading";

export type Subtype =
  | "kanji_reading"          // Cách đọc Kanji (Mondai 1)
  | "orthography"            // Cách viết Kanji (Mondai 2)
  | "kanji_writing"          // Alias cho orthography
  | "context_meaning"        // Hoàn thành câu/Ngữ cảnh (Mondai 3)
  | "contextual_use"         // Alias cho context_meaning
  | "paraphrase"             // Từ đồng nghĩa / diễn đạt tương đương (Mondai 4)
  | "usage"                  // Cách dùng từ đúng (Mondai 5)
  | "sentence_grammar"       // Ngữ pháp câu (Mondai 1)
  | "star_arrangement"      // Sắp xếp dấu sao ★ (Mondai 2)
  | "sentence_composition"   // Alias cho star_arrangement
  | "text_grammar"           // Ngữ pháp đoạn văn (Mondai 3)
  | "short_passage"          // Đoạn văn ngắn ~200 chữ (Mondai 4)
  | "reading_short"          // Alias cho short_passage
  | "medium_passage"         // Đoạn văn trung bình ~400 chữ (Mondai 5)
  | "reading_medium"         // Alias cho medium_passage
  | "long_passage"           // Đoạn văn dài ~550 chữ (Mondai 6)
  | "reading_long"           // Alias cho long_passage
  | "information_retrieval"  // Tìm kiếm thông tin/Tờ rơi (Mondai 7)
  | "info_retrieval";        // Alias cho information_retrieval

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
  mondai?: string;
  weight?: number;
  passageId?: string;
  questionText: string;
  options: ExamOption[];
  correctOptionId: string | null;
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

export interface JLPTScoreResult {
  vocabularyScore: number; // Thang 0 - 30 điểm
  grammarScore: number; // Thang 0 - 30 điểm
  languageKnowledgeScore: number; // vocabularyScore + grammarScore (Thang 0 - 60 điểm, điểm liệt < 19)
  readingScore: number; // Thang 0 - 60 điểm, điểm liệt < 19
  totalScaledScore: number; // languageKnowledgeScore + readingScore (Thang 0 - 120 điểm)
  maxVocabularyScore: number; // Tối đa 30 nếu có, 0 nếu không có
  maxGrammarScore: number; // Tối đa 30 nếu có, 0 nếu không có
  maxLanguageKnowledgeScore: number; // Tối đa 60
  maxReadingScore: number; // Tối đa 60 nếu có, 0 nếu không có
  maxTotalScore: number; // Tối đa 120 (hoặc tổng max của các phần có trong đề)
  hasVocabulary: boolean;
  hasGrammar: boolean;
  hasReading: boolean;
  isLanguageKnowledgePassed: boolean; // >= 19 (hoặc >= 60% nếu đề đơn lẻ)
  isReadingPassed: boolean; // >= 19 (hoặc true nếu không có reading)
  isOverallPassed: boolean; // Tổng >= 67/120 VÀ không bị liệt môn nào; đề lẻ >= 60%
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
    correctOptionId: string | null;
    isCorrect: boolean;
    isSkipped: boolean;
    isFlagged: boolean;
    weight?: number;
  }>;
  jlptScore: JLPTScoreResult;
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

