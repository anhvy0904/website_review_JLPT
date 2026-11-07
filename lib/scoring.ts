import { AttemptScoringResult, ExamAttempt, ExamDetail, ExamQuestion, JLPTScoreResult, SectionType } from "./types";

/**
 * Lấy trọng số mặc định cho câu hỏi theo phân môn (section) và dạng bài (subtype)
 * theo chuẩn cấu trúc đề thi JLPT N3:
 * - Vocabulary: Thang 30đ (Mondai 1,2,3 trọng số 1; Mondai 4,5 trọng số 1.5)
 * - Grammar: Thang 30đ (Mondai 1,2 trọng số 1.5; Mondai 3 trọng số 2)
 * - Reading: Thang 60đ (Đoạn ngắn trọng số 3; Đoạn trung/tìm tin trọng số 4; Đoạn dài trọng số 5)
 */
export function getQuestionDefaultWeight(section: SectionType, subtype?: string): number {
  const normSubtype = (subtype || "").trim().toLowerCase();

  if (section === "vocabulary") {
    switch (normSubtype) {
      case "kanji_reading":
      case "orthography":
      case "kanji_writing":
      case "kanji_spelling":
      case "context_meaning":
      case "contextual_use":
      case "context_word":
      case "context_fill":
        return 1;
      case "paraphrase":
      case "synonym":
      case "usage":
      case "word_usage":
        return 1.5;
      default:
        return 1;
    }
  }

  if (section === "grammar") {
    switch (normSubtype) {
      case "sentence_grammar":
      case "grammar_fill":
      case "star_arrangement":
      case "sentence_composition":
      case "sentence_order":
        return 1.5;
      case "text_grammar":
      case "passage_cloze":
        return 2;
      default:
        return 1.5;
    }
  }

  if (section === "reading") {
    switch (normSubtype) {
      case "short_passage":
      case "reading_short":
      case "short_reading":
        return 3;
      case "medium_passage":
      case "reading_medium":
      case "medium_reading":
      case "information_retrieval":
      case "info_retrieval":
      case "reading_condition":
      case "information_lookup":
        return 4;
      case "long_passage":
      case "reading_long":
      case "long_reading":
        return 5;
      default:
        return 3;
    }
  }

  return 1;
}

/**
 * Trọng số thực tế của một câu hỏi (ưu tiên q.weight nếu có sẵn trong JSON)
 */
export function getEffectiveQuestionWeight(q: ExamQuestion): number {
  if (typeof q.weight === "number" && !isNaN(q.weight) && q.weight > 0) {
    return q.weight;
  }
  return getQuestionDefaultWeight(q.section, q.subtype);
}

/**
 * Tính điểm quy đổi chuẩn JLPT N3 (Estimated Scaled Score)
 * - Từ vựng (Vocabulary): 0 - 30 điểm
 * - Ngữ pháp (Grammar): 0 - 30 điểm
 * - Kiến thức ngôn ngữ (Language Knowledge = Vocab + Grammar): 0 - 60 điểm (Điểm liệt < 19)
 * - Đọc hiểu (Reading): 0 - 60 điểm (Điểm liệt < 19)
 * - Tổng điểm: 0 - 120 điểm (Điểm đỗ >= 67/120 và không bị điểm liệt phần nào)
 * - Đề lẻ/mini-test: Tự động điều chỉnh thang điểm và xét ngưỡng >= 60%
 */
export function calculateJLPTScore(
  questions: ExamQuestion[],
  answers: Record<string, string>
): JLPTScoreResult {
  if (!questions || questions.length === 0) {
    return {
      vocabularyScore: 0,
      grammarScore: 0,
      languageKnowledgeScore: 0,
      readingScore: 0,
      totalScaledScore: 0,
      maxVocabularyScore: 0,
      maxGrammarScore: 0,
      maxLanguageKnowledgeScore: 0,
      maxReadingScore: 0,
      maxTotalScore: 0,
      hasVocabulary: false,
      hasGrammar: false,
      hasReading: false,
      isLanguageKnowledgePassed: false,
      isReadingPassed: false,
      isOverallPassed: false,
    };
  }

  const vocabQuestions = questions.filter((q) => q.section === "vocabulary");
  const grammarQuestions = questions.filter((q) => q.section === "grammar");
  const readingQuestions = questions.filter((q) => q.section === "reading");

  const hasVocabulary = vocabQuestions.length > 0;
  const hasGrammar = grammarQuestions.length > 0;
  const hasReading = readingQuestions.length > 0;

  // Tính điểm Từ vựng (thang 30)
  let vocabScore = 0;
  if (hasVocabulary) {
    const vocabMaxWeight = vocabQuestions.reduce((sum, q) => sum + getEffectiveQuestionWeight(q), 0);
    const vocabEarnedWeight = vocabQuestions.reduce((sum, q) => {
      const userAns = answers[q.id];
      const isCorrect = !!userAns && !!q.correctOptionId && String(userAns) === String(q.correctOptionId);
      return isCorrect ? sum + getEffectiveQuestionWeight(q) : sum;
    }, 0);
    vocabScore = vocabMaxWeight > 0 ? Math.round((vocabEarnedWeight / vocabMaxWeight) * 30) : 0;
  }

  // Tính điểm Ngữ pháp (thang 30)
  let grammarScore = 0;
  if (hasGrammar) {
    const grammarMaxWeight = grammarQuestions.reduce((sum, q) => sum + getEffectiveQuestionWeight(q), 0);
    const grammarEarnedWeight = grammarQuestions.reduce((sum, q) => {
      const userAns = answers[q.id];
      const isCorrect = !!userAns && !!q.correctOptionId && String(userAns) === String(q.correctOptionId);
      return isCorrect ? sum + getEffectiveQuestionWeight(q) : sum;
    }, 0);
    grammarScore = grammarMaxWeight > 0 ? Math.round((grammarEarnedWeight / grammarMaxWeight) * 30) : 0;
  }

  // Tính điểm Đọc hiểu (thang 60)
  let readingScore = 0;
  if (hasReading) {
    const readingMaxWeight = readingQuestions.reduce((sum, q) => sum + getEffectiveQuestionWeight(q), 0);
    const readingEarnedWeight = readingQuestions.reduce((sum, q) => {
      const userAns = answers[q.id];
      const isCorrect = !!userAns && !!q.correctOptionId && String(userAns) === String(q.correctOptionId);
      return isCorrect ? sum + getEffectiveQuestionWeight(q) : sum;
    }, 0);
    readingScore = readingMaxWeight > 0 ? Math.round((readingEarnedWeight / readingMaxWeight) * 60) : 0;
  }

  const languageKnowledgeScore = vocabScore + grammarScore;
  const totalScaledScore = languageKnowledgeScore + readingScore;

  const maxVocabularyScore = hasVocabulary ? 30 : 0;
  const maxGrammarScore = hasGrammar ? 30 : 0;
  const maxLanguageKnowledgeScore = maxVocabularyScore + maxGrammarScore;
  const maxReadingScore = hasReading ? 60 : 0;
  const maxTotalScore = maxLanguageKnowledgeScore + maxReadingScore;

  // Đánh giá đỗ/trượt theo từng phần và tổng thể
  const isFullExam = (hasVocabulary || hasGrammar) && hasReading;

  let isLanguageKnowledgePassed = true;
  let isReadingPassed = true;
  let isOverallPassed = false;

  if (isFullExam) {
    // Đề thi chuẩn: Kiến thức ngôn ngữ >= 19, Đọc hiểu >= 19, Tổng >= 67
    isLanguageKnowledgePassed = maxLanguageKnowledgeScore > 0 ? languageKnowledgeScore >= 19 : true;
    isReadingPassed = maxReadingScore > 0 ? readingScore >= 19 : true;
    isOverallPassed = totalScaledScore >= 67 && isLanguageKnowledgePassed && isReadingPassed;
  } else {
    // Đề thi từng phần lẻ (ví dụ: chỉ Từ vựng, chỉ Ngữ pháp, hoặc chỉ Đọc hiểu)
    const activeSkillsCount = [hasVocabulary, hasGrammar, hasReading].filter(Boolean).length;

    if (activeSkillsCount === 1) {
      // Đề chỉ có 1 kỹ năng: Đạt nếu >= 60% điểm của kỹ năng đó
      if (hasVocabulary) {
        isLanguageKnowledgePassed = vocabScore >= Math.round(maxVocabularyScore * 0.6); // >= 18/30
        isReadingPassed = true;
        isOverallPassed = isLanguageKnowledgePassed;
      } else if (hasGrammar) {
        isLanguageKnowledgePassed = grammarScore >= Math.round(maxGrammarScore * 0.6); // >= 18/30
        isReadingPassed = true;
        isOverallPassed = isLanguageKnowledgePassed;
      } else if (hasReading) {
        isLanguageKnowledgePassed = true;
        isReadingPassed = readingScore >= Math.round(maxReadingScore * 0.6); // >= 36/60
        isOverallPassed = isReadingPassed;
      }
    } else {
      // Đề có 2 kỹ năng (ví dụ Kiến thức ngôn ngữ gồm Vocab + Grammar nhưng không có Reading):
      // Xét ngưỡng Kiến thức ngôn ngữ >= 19 và tổng >= 60% thang tối đa
      isLanguageKnowledgePassed = languageKnowledgeScore >= 19;
      isReadingPassed = true;
      const passThreshold = Math.round(maxTotalScore * 0.6); // >= 36/60
      isOverallPassed = totalScaledScore >= passThreshold && isLanguageKnowledgePassed;
    }
  }

  return {
    vocabularyScore: vocabScore,
    grammarScore,
    languageKnowledgeScore,
    readingScore,
    totalScaledScore,
    maxVocabularyScore,
    maxGrammarScore,
    maxLanguageKnowledgeScore,
    maxReadingScore,
    maxTotalScore,
    hasVocabulary,
    hasGrammar,
    hasReading,
    isLanguageKnowledgePassed,
    isReadingPassed,
    isOverallPassed,
  };
}

export function scoreAttempt(exam: ExamDetail, attempt: ExamAttempt): AttemptScoringResult {
  const totalQuestions = exam.questions.length;
  let correctCount = 0;
  let incorrectCount = 0;
  let skippedCount = 0;

  const sectionStats: Record<SectionType, { total: number; correct: number; percent: number }> = {
    vocabulary: { total: 0, correct: 0, percent: 0 },
    grammar: { total: 0, correct: 0, percent: 0 },
    reading: { total: 0, correct: 0, percent: 0 },
  };

  const subtypeStats: Record<
    string,
    { total: number; correct: number; incorrect: number; skipped: number; percent: number }
  > = {};

  const questionResults = exam.questions.map((q) => {
    const selectedOptionId = attempt.answers[q.id];
    const isSkipped = !selectedOptionId || selectedOptionId.trim() === "";
    const isCorrect = !isSkipped && !!q.correctOptionId && String(selectedOptionId) === String(q.correctOptionId);
    const isFlagged = Array.isArray(attempt.flaggedQuestionIds) && attempt.flaggedQuestionIds.includes(q.id);
    const weight = getEffectiveQuestionWeight(q);

    // Section counting
    if (sectionStats[q.section]) {
      sectionStats[q.section].total++;
      if (isCorrect) sectionStats[q.section].correct++;
    }

    // Subtype counting
    const subtype = q.subtype || "general";
    if (!subtypeStats[subtype]) {
      subtypeStats[subtype] = { total: 0, correct: 0, incorrect: 0, skipped: 0, percent: 0 };
    }
    subtypeStats[subtype].total++;

    if (isSkipped) {
      skippedCount++;
      subtypeStats[subtype].skipped++;
    } else if (isCorrect) {
      correctCount++;
      subtypeStats[subtype].correct++;
    } else {
      incorrectCount++;
      subtypeStats[subtype].incorrect++;
    }

    return {
      questionId: q.id,
      number: q.number,
      section: q.section,
      subtype: q.subtype,
      selectedOptionId,
      correctOptionId: q.correctOptionId,
      isCorrect,
      isSkipped,
      isFlagged,
      weight,
    };
  });

  const answeredCount = totalQuestions - skippedCount;
  const scorePercent = totalQuestions > 0 ? Math.round((correctCount / totalQuestions) * 1000) / 10 : 0;

  // Calculate percentages
  (Object.keys(sectionStats) as SectionType[]).forEach((sec) => {
    const st = sectionStats[sec];
    st.percent = st.total > 0 ? Math.round((st.correct / st.total) * 1000) / 10 : 0;
  });

  Object.keys(subtypeStats).forEach((sub) => {
    const subStat = subtypeStats[sub];
    subStat.percent = subStat.total > 0 ? Math.round((subStat.correct / subStat.total) * 1000) / 10 : 0;
  });

  const jlptScore = calculateJLPTScore(exam.questions, attempt.answers);

  return {
    attemptId: attempt.attemptId,
    examId: exam.id,
    mode: attempt.mode,
    totalQuestions,
    answeredCount,
    correctCount,
    incorrectCount,
    skippedCount,
    scorePercent,
    elapsedSeconds: attempt.elapsedSeconds,
    sectionStats,
    subtypeStats,
    questionResults,
    jlptScore,
  };
}
