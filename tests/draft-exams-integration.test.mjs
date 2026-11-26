import { describe, it } from "node:test";
import assert from "node:assert/strict";
import fs from "fs";
import path from "path";

describe("Tích hợp Bộ 3 đề nháp mới (n3-2021-12, n3-2025-07, n3-2025-12)", () => {
  const draftExams = [
    {
      file: "n3-2021-12.json",
      id: "n3-2021-12",
      expectedPassagesCount: 10,
      expectedQuestionsWithText: 73,
      expectedPassagesWithText: 10,
      expectedVerified: 0,
    },
    {
      file: "n3-2025-07.json",
      id: "n3-2025-07",
      expectedPassagesCount: 9,
      expectedQuestionsWithText: 73,
      expectedPassagesWithText: 9,
      expectedVerified: 0,
    },
    {
      file: "n3-2025-12.json",
      id: "n3-2025-12",
      expectedPassagesCount: 9,
      expectedQuestionsWithText: 73,
      expectedPassagesWithText: 9,
      expectedVerified: 0,
    },
  ];

  it("1. Ba tệp đề JSON tồn tại nguyên vẹn trong public/data/exams/ với status='draft', 73 câu hỏi và đầy đủ bài đọc", () => {
    for (const item of draftExams) {
      const filePath = path.join(process.cwd(), "public/data/exams", item.file);
      assert.ok(fs.existsSync(filePath), `Thiếu tệp ${item.file}`);

      const exam = JSON.parse(fs.readFileSync(filePath, "utf8"));
      assert.equal(exam.schemaVersion, "1.0.0");
      assert.equal(exam.id, item.id);
      assert.equal(exam.status, "draft");
      assert.equal(exam.questions.length, 73);
      assert.equal(exam.questionCount, 73);
      assert.equal(exam.passages.length, item.expectedPassagesCount);
    }
  });

  it("2. Chỉ số tiến độ (câu có chữ/73, câu được duyệt/73, bài đọc có chữ/9) khớp chính xác thực tế", () => {
    const indexPath = path.join(process.cwd(), "public/data/exams/index.json");
    const indexData = JSON.parse(fs.readFileSync(indexPath, "utf8"));

    for (const item of draftExams) {
      const filePath = path.join(process.cwd(), "public/data/exams", item.file);
      const exam = JSON.parse(fs.readFileSync(filePath, "utf8"));

      const questionsWithText = exam.questions.filter(
        (q) => q.questionText && q.questionText.trim().length > 0
      ).length;
      const verifiedQuestions = exam.questions.filter(
        (q) => q.review?.status === "verified" && q.correctOptionId != null
      ).length;
      const passagesWithText = exam.passages.filter(
        (p) => p.text && p.text.trim().length > 0
      ).length;

      assert.equal(questionsWithText, item.expectedQuestionsWithText, `${item.id} questionsWithText`);
      assert.equal(verifiedQuestions, item.expectedVerified, `${item.id} verifiedQuestions`);
      assert.equal(passagesWithText, item.expectedPassagesWithText, `${item.id} passagesWithText`);

      const idxEntry = indexData.find((e) => e.id === item.id);
      assert.ok(idxEntry, `${item.id} phải có trong index.json`);
      assert.equal(idxEntry.status, "draft");
      assert.equal(idxEntry.hasUnverifiedAnswers, true);
      assert.equal(idxEntry.stats.questionsWithText, item.expectedQuestionsWithText);
      assert.equal(idxEntry.stats.verifiedQuestions, item.expectedVerified);
      assert.equal(idxEntry.stats.passagesWithText, item.expectedPassagesWithText);
    }
  });

  it("3. Toàn bộ 263 đường dẫn ảnh nguồn (questionImagePath, imagePath, additionalImagePaths) đều tồn tại hợp lệ trên ổ đĩa", () => {
    let checkedImages = 0;

    for (const item of draftExams) {
      const filePath = path.join(process.cwd(), "public/data/exams", item.file);
      const exam = JSON.parse(fs.readFileSync(filePath, "utf8"));

      for (const q of exam.questions) {
        assert.ok(
          (q.questionText && q.questionText.trim().length > 0) ||
            (q.questionImagePath && q.questionImagePath.trim().length > 0),
          `Câu ${q.id} phải có questionText hoặc questionImagePath`
        );
        if (q.questionImagePath) {
          const diskPath = path.join(process.cwd(), "public", q.questionImagePath.replace(/^\//, ""));
          assert.ok(fs.existsSync(diskPath), `Thiếu ảnh câu hỏi: ${q.questionImagePath}`);
          checkedImages++;
        }
      }

      for (const p of exam.passages) {
        assert.ok(p.imagePath, `Bài đọc ${p.id} phải có imagePath`);
        const allPaths = [p.imagePath, ...(p.additionalImagePaths || [])];
        for (const imgPath of allPaths) {
          const diskPath = path.join(process.cwd(), "public", imgPath.replace(/^\//, ""));
          assert.ok(fs.existsSync(diskPath), `Thiếu ảnh bài đọc: ${imgPath}`);
          checkedImages++;
        }
      }
    }

    assert.equal(checkedImages, 263, "Tổng số tham chiếu ảnh được kiểm tra phải là 263");
  });

  it("4. Mọi câu có passageId đều trỏ tới đúng đối tượng trong exam.passages và giữ nguyên trạng thái needs_review (bản nháp chưa duyệt)", () => {
    for (const item of draftExams) {
      const filePath = path.join(process.cwd(), "public/data/exams", item.file);
      const exam = JSON.parse(fs.readFileSync(filePath, "utf8"));
      const passageIds = new Set(exam.passages.map((p) => p.id));

      for (const q of exam.questions) {
        assert.equal(q.review.status, "needs_review", `${q.id} phải giữ review.status = needs_review`);
        if (q.passageId) {
          assert.ok(passageIds.has(q.passageId), `${q.id} có passageId=${q.passageId} hợp lệ`);
        }
      }
    }
  });
});
