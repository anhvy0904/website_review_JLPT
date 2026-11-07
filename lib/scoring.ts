import { AttemptScoringResult, ExamAttempt, ExamDetail, SectionType } from "./types";

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

