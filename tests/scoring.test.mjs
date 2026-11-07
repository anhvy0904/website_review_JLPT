import { test, describe } from "node:test";
import assert from "node:assert/strict";

// We test scoring logic independently
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
  };
}

describe("Logic Chấm Điểm (lib/scoring.ts)", () => {
  const mockExam = {
    id: "test-exam-01",
    questions: [
      { id: "q1", number: 1, section: "vocabulary", subtype: "kanji_reading", correctOptionId: "1" },
      { id: "q2", number: 2, section: "grammar", subtype: "sentence_grammar", correctOptionId: "3" },
      { id: "q3", number: 3, section: "reading", subtype: "reading_short", correctOptionId: "2" },
      { id: "q4", number: 4, section: "reading", subtype: "reading_short", correctOptionId: "4" },
    ],
  };

  test("1. Trường hợp 100% đúng", () => {
    const attempt = {
      attemptId: "att-1",
      examId: "test-exam-01",
      mode: "exam",
      elapsedSeconds: 120,
      answers: { q1: "1", q2: "3", q3: "2", q4: "4" },
      flaggedQuestionIds: [],
    };

    const res = scoreAttempt(mockExam, attempt);
    assert.equal(res.totalQuestions, 4);
    assert.equal(res.correctCount, 4);
    assert.equal(res.incorrectCount, 0);
    assert.equal(res.skippedCount, 0);
    assert.equal(res.scorePercent, 100);
    assert.equal(res.sectionStats.vocabulary.percent, 100);
    assert.equal(res.sectionStats.grammar.percent, 100);
    assert.equal(res.sectionStats.reading.percent, 100);
  });

  test("2. Trường hợp trả lời sai một phần và bỏ trống", () => {
    const attempt = {
      attemptId: "att-2",
      examId: "test-exam-01",
      mode: "practice",
      elapsedSeconds: 200,
      answers: {
        q1: "1", // đúng
        q2: "2", // sai (đáp án đúng là 3)
        // q3 bỏ trống
        q4: "4", // đúng
      },
      flaggedQuestionIds: ["q2"],
    };

    const res = scoreAttempt(mockExam, attempt);
    assert.equal(res.totalQuestions, 4);
    assert.equal(res.correctCount, 2);
    assert.equal(res.incorrectCount, 1);
    assert.equal(res.skippedCount, 1);
    assert.equal(res.answeredCount, 3);
    assert.equal(res.scorePercent, 50); // 2/4 = 50%
    assert.equal(res.sectionStats.reading.total, 2);
    assert.equal(res.sectionStats.reading.correct, 1);
    assert.equal(res.sectionStats.reading.percent, 50);

    // Kiểm tra câu hỏi được flag
    const q2Res = res.questionResults.find((qr) => qr.questionId === "q2");
    assert.equal(q2Res.isFlagged, true);
    assert.equal(q2Res.isCorrect, false);
    assert.equal(q2Res.isSkipped, false);
  });

  test("3. Trường hợp bỏ trống toàn bộ bài thi (0 câu trả lời)", () => {
    const attempt = {
      attemptId: "att-3",
      examId: "test-exam-01",
      mode: "exam",
      elapsedSeconds: 300,
      answers: {},
      flaggedQuestionIds: [],
    };

    const res = scoreAttempt(mockExam, attempt);
    assert.equal(res.totalQuestions, 4);
    assert.equal(res.correctCount, 0);
    assert.equal(res.incorrectCount, 0);
    assert.equal(res.skippedCount, 4);
    assert.equal(res.answeredCount, 0);
    assert.equal(res.scorePercent, 0);
  });

  test("4. Trường hợp đề thi rỗng (0 câu hỏi - Edge case an toàn chia cho 0)", () => {
    const emptyExam = { id: "empty", questions: [] };
    const attempt = {
      attemptId: "att-4",
      examId: "empty",
      mode: "exam",
      elapsedSeconds: 0,
      answers: {},
      flaggedQuestionIds: [],
    };

    const res = scoreAttempt(emptyExam, attempt);
    assert.equal(res.totalQuestions, 0);
    assert.equal(res.correctCount, 0);
    assert.equal(res.scorePercent, 0);
    assert.equal(res.answeredCount, 0);
  });

  test("5. Kiểm tra subtype thống kê chính xác", () => {
    const attempt = {
      attemptId: "att-5",
      examId: "test-exam-01",
      mode: "exam",
      elapsedSeconds: 60,
      answers: { q1: "1", q2: "1", q3: "2", q4: "1" },
    };

    const res = scoreAttempt(mockExam, attempt);
    // reading_short có 2 câu: q3 đúng, q4 sai
    assert.equal(res.subtypeStats.reading_short.total, 2);
    assert.equal(res.subtypeStats.reading_short.correct, 1);
    assert.equal(res.subtypeStats.reading_short.incorrect, 1);
    assert.equal(res.subtypeStats.reading_short.percent, 50);
  });
});
