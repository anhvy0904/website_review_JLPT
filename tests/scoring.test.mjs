import { test, describe } from "node:test";
import assert from "node:assert/strict";

function getQuestionDefaultWeight(section, subtype) {
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

function getEffectiveQuestionWeight(q) {
  if (typeof q.weight === "number" && !isNaN(q.weight) && q.weight > 0) {
    return q.weight;
  }
  return getQuestionDefaultWeight(q.section, q.subtype);
}

function calculateJLPTScore(questions, answers) {
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

  const isFullExam = (hasVocabulary || hasGrammar) && hasReading;

  let isLanguageKnowledgePassed = true;
  let isReadingPassed = true;
  let isOverallPassed = false;

  if (isFullExam) {
    isLanguageKnowledgePassed = maxLanguageKnowledgeScore > 0 ? languageKnowledgeScore >= 19 : true;
    isReadingPassed = maxReadingScore > 0 ? readingScore >= 19 : true;
    isOverallPassed = totalScaledScore >= 67 && isLanguageKnowledgePassed && isReadingPassed;
  } else {
    const activeSkillsCount = [hasVocabulary, hasGrammar, hasReading].filter(Boolean).length;

    if (activeSkillsCount === 1) {
      if (hasVocabulary) {
        isLanguageKnowledgePassed = vocabScore >= Math.round(maxVocabularyScore * 0.6);
        isReadingPassed = true;
        isOverallPassed = isLanguageKnowledgePassed;
      } else if (hasGrammar) {
        isLanguageKnowledgePassed = grammarScore >= Math.round(maxGrammarScore * 0.6);
        isReadingPassed = true;
        isOverallPassed = isLanguageKnowledgePassed;
      } else if (hasReading) {
        isLanguageKnowledgePassed = true;
        isReadingPassed = readingScore >= Math.round(maxReadingScore * 0.6);
        isOverallPassed = isReadingPassed;
      }
    } else {
      isLanguageKnowledgePassed = languageKnowledgeScore >= 19;
      isReadingPassed = true;
      const passThreshold = Math.round(maxTotalScore * 0.6);
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

function scoreAttempt(exam, attempt) {
  const totalQuestions = exam.questions.length;
  let correctCount = 0;
  let incorrectCount = 0;
  let skippedCount = 0;

  const sectionStats = {
    vocabulary: { total: 0, correct: 0, percent: 0 },
    grammar: { total: 0, correct: 0, percent: 0 },
    reading: { total: 0, correct: 0, percent: 0 },
  };

  const subtypeStats = {};

  const questionResults = exam.questions.map((q) => {
    const selectedOptionId = attempt.answers[q.id];
    const isSkipped = !selectedOptionId || selectedOptionId.trim() === "";
    const isCorrect = !isSkipped && String(selectedOptionId) === String(q.correctOptionId);
    const isFlagged = Array.isArray(attempt.flaggedQuestionIds) && attempt.flaggedQuestionIds.includes(q.id);
    const weight = getEffectiveQuestionWeight(q);

    if (sectionStats[q.section]) {
      sectionStats[q.section].total++;
      if (isCorrect) sectionStats[q.section].correct++;
    }

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

  Object.keys(sectionStats).forEach((sec) => {
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

describe("Logic Chấm Điểm (lib/scoring.ts) & Hệ Thống Điểm Chuẩn JLPT N3", () => {
  const fullMockExam = {
    id: "test-exam-full",
    questions: [
      // Vocabulary: 2 câu trọng số 1 (kanji_reading), 1 câu trọng số 1.5 (paraphrase) -> Max weight: 3.5
      { id: "v1", number: 1, section: "vocabulary", subtype: "kanji_reading", correctOptionId: "1" },
      { id: "v2", number: 2, section: "vocabulary", subtype: "kanji_reading", correctOptionId: "2" },
      { id: "v3", number: 3, section: "vocabulary", subtype: "paraphrase", correctOptionId: "3" },

      // Grammar: 1 câu 1.5 (sentence_grammar), 1 câu 2 (text_grammar) -> Max weight: 3.5
      { id: "g1", number: 4, section: "grammar", subtype: "sentence_grammar", correctOptionId: "4" },
      { id: "g2", number: 5, section: "grammar", subtype: "text_grammar", correctOptionId: "1" },

      // Reading: 1 câu 3 (short_passage), 1 câu 4 (medium_passage), 1 câu 5 (long_passage) -> Max weight: 12
      { id: "r1", number: 6, section: "reading", subtype: "short_passage", correctOptionId: "2" },
      { id: "r2", number: 7, section: "reading", subtype: "medium_passage", correctOptionId: "3" },
      { id: "r3", number: 8, section: "reading", subtype: "long_passage", correctOptionId: "4" },
    ],
  };

  test("1. Trọng số mặc định theo subtype", () => {
    assert.equal(getQuestionDefaultWeight("vocabulary", "kanji_reading"), 1);
    assert.equal(getQuestionDefaultWeight("vocabulary", "orthography"), 1);
    assert.equal(getQuestionDefaultWeight("vocabulary", "contextual_use"), 1);
    assert.equal(getQuestionDefaultWeight("vocabulary", "paraphrase"), 1.5);
    assert.equal(getQuestionDefaultWeight("vocabulary", "usage"), 1.5);

    assert.equal(getQuestionDefaultWeight("grammar", "sentence_grammar"), 1.5);
    assert.equal(getQuestionDefaultWeight("grammar", "star_arrangement"), 1.5);
    assert.equal(getQuestionDefaultWeight("grammar", "sentence_composition"), 1.5);
    assert.equal(getQuestionDefaultWeight("grammar", "text_grammar"), 2);

    assert.equal(getQuestionDefaultWeight("reading", "short_passage"), 3);
    assert.equal(getQuestionDefaultWeight("reading", "reading_short"), 3);
    assert.equal(getQuestionDefaultWeight("reading", "medium_passage"), 4);
    assert.equal(getQuestionDefaultWeight("reading", "info_retrieval"), 4);
    assert.equal(getQuestionDefaultWeight("reading", "long_passage"), 5);
  });

  test("2. Làm đúng 100% đề thi đầy đủ -> Đạt tối đa 120/120 và ĐỖ (isOverallPassed = true)", () => {
    const attempt = {
      attemptId: "att-full-100",
      examId: "test-exam-full",
      mode: "exam",
      elapsedSeconds: 3600,
      answers: {
        v1: "1", v2: "2", v3: "3",
        g1: "4", g2: "1",
        r1: "2", r2: "3", r3: "4",
      },
      flaggedQuestionIds: [],
    };

    const res = scoreAttempt(fullMockExam, attempt);
    assert.equal(res.scorePercent, 100);
    assert.equal(res.jlptScore.vocabularyScore, 30);
    assert.equal(res.jlptScore.grammarScore, 30);
    assert.equal(res.jlptScore.languageKnowledgeScore, 60);
    assert.equal(res.jlptScore.readingScore, 60);
    assert.equal(res.jlptScore.totalScaledScore, 120);
    assert.equal(res.jlptScore.isLanguageKnowledgePassed, true);
    assert.equal(res.jlptScore.isReadingPassed, true);
    assert.equal(res.jlptScore.isOverallPassed, true);
  });

  test("3. Trường hợp ĐỖ điểm tổng >= 67 và cả hai phần không bị liệt (>= 19)", () => {
    // Vocab đúng v1 (1) + v3 (1.5) = 2.5 / 3.5 -> Math.round((2.5/3.5)*30) = 21/30
    // Grammar đúng g1 (1.5) = 1.5 / 3.5 -> Math.round((1.5/3.5)*30) = 13/30
    // Language Knowledge = 21 + 13 = 34 / 60 (>= 19 -> PASS)
    // Reading đúng r1 (3) + r2 (4) = 7 / 12 -> Math.round((7/12)*60) = 35 / 60 (>= 19 -> PASS)
    // Total = 34 + 35 = 69 / 120 (>= 67 -> OVERALL PASS)
    const attempt = {
      attemptId: "att-pass",
      examId: "test-exam-full",
      mode: "exam",
      elapsedSeconds: 2400,
      answers: {
        v1: "1", v3: "3",
        g1: "4",
        r1: "2", r2: "3",
      },
      flaggedQuestionIds: [],
    };

    const res = scoreAttempt(fullMockExam, attempt);
    assert.equal(res.jlptScore.vocabularyScore, 21);
    assert.equal(res.jlptScore.grammarScore, 13);
    assert.equal(res.jlptScore.languageKnowledgeScore, 34);
    assert.equal(res.jlptScore.readingScore, 35);
    assert.equal(res.jlptScore.totalScaledScore, 69);
    assert.equal(res.jlptScore.isLanguageKnowledgePassed, true);
    assert.equal(res.jlptScore.isReadingPassed, true);
    assert.equal(res.jlptScore.isOverallPassed, true);
  });

  test("4. Trường hợp TRƯỢT do LIỆT Đọc hiểu (< 19) dù điểm tổng cao", () => {
    // Vocab đúng hết 30/30
    // Grammar đúng hết 30/30
    // Language Knowledge = 60/60
    // Reading chỉ đúng r1 (3 / 12) -> Math.round((3/12)*60) = 15/60 (< 19 -> LIỆT)
    // Total = 60 + 15 = 75/120 (dù >= 67 nhưng LIỆT Đọc hiểu -> TRƯỢT)
    const attempt = {
      attemptId: "att-reading-fail",
      examId: "test-exam-full",
      mode: "exam",
      elapsedSeconds: 2000,
      answers: {
        v1: "1", v2: "2", v3: "3",
        g1: "4", g2: "1",
        r1: "2", // 3 weight
      },
      flaggedQuestionIds: [],
    };

    const res = scoreAttempt(fullMockExam, attempt);
    assert.equal(res.jlptScore.languageKnowledgeScore, 60);
    assert.equal(res.jlptScore.readingScore, 15);
    assert.equal(res.jlptScore.totalScaledScore, 75);
    assert.equal(res.jlptScore.isLanguageKnowledgePassed, true);
    assert.equal(res.jlptScore.isReadingPassed, false); // Liệt reading
    assert.equal(res.jlptScore.isOverallPassed, false); // Không đỗ
  });

  test("5. Trường hợp TRƯỢT do LIỆT Kiến thức ngôn ngữ (< 19) dù Đọc hiểu 60/60", () => {
    // Vocab đúng v1 (1 / 3.5) -> Math.round((1/3.5)*30) = 9/30
    // Grammar sai hết -> 0/30
    // Language Knowledge = 9/60 (< 19 -> LIỆT)
    // Reading đúng hết -> 60/60
    // Total = 9 + 60 = 69/120 (dù >= 67 nhưng LIỆT Kiến thức ngôn ngữ -> TRƯỢT)
    const attempt = {
      attemptId: "att-lang-fail",
      examId: "test-exam-full",
      mode: "exam",
      elapsedSeconds: 1800,
      answers: {
        v1: "1",
        r1: "2", r2: "3", r3: "4",
      },
      flaggedQuestionIds: [],
    };

    const res = scoreAttempt(fullMockExam, attempt);
    assert.equal(res.jlptScore.languageKnowledgeScore, 9);
    assert.equal(res.jlptScore.readingScore, 60);
    assert.equal(res.jlptScore.totalScaledScore, 69);
    assert.equal(res.jlptScore.isLanguageKnowledgePassed, false);
    assert.equal(res.jlptScore.isReadingPassed, true);
    assert.equal(res.jlptScore.isOverallPassed, false);
  });

  test("6. Đề thi lẻ chỉ có Từ vựng (Vocabulary mini-test) -> Thang 30đ, xét ngưỡng >= 60% (18đ)", () => {
    const vocabOnlyExam = {
      id: "n3-kanji-50",
      questions: [
        { id: "q1", number: 1, section: "vocabulary", subtype: "kanji_reading", correctOptionId: "1" },
        { id: "q2", number: 2, section: "vocabulary", subtype: "kanji_reading", correctOptionId: "2" },
        { id: "q3", number: 3, section: "vocabulary", subtype: "kanji_reading", correctOptionId: "3" },
        { id: "q4", number: 4, section: "vocabulary", subtype: "kanji_reading", correctOptionId: "4" },
        { id: "q5", number: 5, section: "vocabulary", subtype: "kanji_reading", correctOptionId: "1" },
      ],
    };

    // Đúng 4/5 câu = 80% -> Scaled 24/30 (>= 18đ -> ĐỖ)
    const passAttempt = {
      attemptId: "att-vocab-pass",
      examId: "n3-kanji-50",
      mode: "practice",
      elapsedSeconds: 300,
      answers: { q1: "1", q2: "2", q3: "3", q4: "4" },
      flaggedQuestionIds: [],
    };
    const passRes = scoreAttempt(vocabOnlyExam, passAttempt);
    assert.equal(passRes.jlptScore.hasVocabulary, true);
    assert.equal(passRes.jlptScore.hasGrammar, false);
    assert.equal(passRes.jlptScore.hasReading, false);
    assert.equal(passRes.jlptScore.maxTotalScore, 30);
    assert.equal(passRes.jlptScore.vocabularyScore, 24);
    assert.equal(passRes.jlptScore.totalScaledScore, 24);
    assert.equal(passRes.jlptScore.isOverallPassed, true);

    // Đúng 2/5 câu = 40% -> Scaled 12/30 (< 18đ -> CHƯA ĐẠT)
    const failAttempt = {
      attemptId: "att-vocab-fail",
      examId: "n3-kanji-50",
      mode: "practice",
      elapsedSeconds: 300,
      answers: { q1: "1", q2: "2" },
      flaggedQuestionIds: [],
    };
    const failRes = scoreAttempt(vocabOnlyExam, failAttempt);
    assert.equal(failRes.jlptScore.vocabularyScore, 12);
    assert.equal(failRes.jlptScore.totalScaledScore, 12);
    assert.equal(failRes.jlptScore.isOverallPassed, false);
  });

  test("7. Edge case: Đề thi rỗng (0 câu hỏi)", () => {
    const emptyExam = { id: "empty", questions: [] };
    const attempt = {
      attemptId: "att-empty",
      examId: "empty",
      mode: "exam",
      elapsedSeconds: 0,
      answers: {},
      flaggedQuestionIds: [],
    };

    const res = scoreAttempt(emptyExam, attempt);
    assert.equal(res.totalQuestions, 0);
    assert.equal(res.jlptScore.totalScaledScore, 0);
    assert.equal(res.jlptScore.isOverallPassed, false);
  });
});
