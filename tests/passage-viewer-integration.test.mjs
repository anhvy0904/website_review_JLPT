import { describe, it } from "node:test";
import assert from "node:assert/strict";
import fs from "fs";
import path from "path";

describe("Tích hợp Hiển thị Bài đọc hiểu (Passage Integration & 27 Assets)", () => {
  const exams = [
    { file: "n3-best-moshi-01.json", expectedId: "n3-best-moshi-01" },
    { file: "n3-best-moshi-02.json", expectedId: "n3-best-moshi-02" },
    { file: "n3-best-moshi-03.json", expectedId: "n3-best-moshi-03" },
  ];

  it("1. Toàn bộ 27 tệp ảnh quét WebP trong public/data/exams/assets/ đều tồn tại trên ổ đĩa", () => {
    let verifiedCount = 0;
    for (const { file } of exams) {
      const filePath = path.join(process.cwd(), "public/data/exams", file);
      const data = JSON.parse(fs.readFileSync(filePath, "utf8"));

      assert.equal(data.passages.length, 9, `${file} phải có đúng 9 passages`);

      for (const p of data.passages) {
        assert.ok(p.imagePath, `Passage ${p.id} phải có imagePath`);
        const fullDiskPath = path.join(process.cwd(), "public", p.imagePath);
        assert.ok(fs.existsSync(fullDiskPath), `Tệp ảnh không tồn tại: ${fullDiskPath}`);
        verifiedCount++;
      }
    }
    assert.equal(verifiedCount, 27, "Phải kiểm tra đủ 27 tệp ảnh quét WebP");
  });

  it("2. Đề 1, ngữ pháp 19–23: hiển thị bài văn 「ごはん？ ライス？」", () => {
    const data = JSON.parse(
      fs.readFileSync(path.join(process.cwd(), "public/data/exams/n3-best-moshi-01.json"), "utf8")
    );
    const clozePassage = data.passages.find((p) => p.id === "g-cloze");
    assert.ok(clozePassage, "Đề 1 phải có passage g-cloze");
    assert.ok(clozePassage.title.includes("ごはん？ ライス？"));
    assert.ok(clozePassage.text.includes("ごはん？ ライス？"));
    assert.ok(clozePassage.text.includes("［19］"));
    assert.ok(clozePassage.text.includes("［23］"));

    const linkedQuestions = data.questions.filter((q) => q.passageId === "g-cloze");
    assert.equal(linkedQuestions.length, 5);
    const numbers = linkedQuestions.map((q) => q.number);
    assert.deepEqual(numbers, [19, 20, 21, 22, 23]);
  });

  it("3. Đề 2, đọc hiểu 28–30: hiển thị bài đọc về thức ăn và tế bào", () => {
    const data = JSON.parse(
      fs.readFileSync(path.join(process.cwd(), "public/data/exams/n3-best-moshi-02.json"), "utf8")
    );
    const passage = data.passages.find((p) => p.id === "p-r28");
    assert.ok(passage, "Đề 2 phải có passage p-r28");
    assert.ok(passage.text.includes("ネズミにえさを与え"));
    assert.ok(passage.text.includes("細胞と入れかわり"));

    const linkedQuestions = data.questions.filter((q) => q.passageId === "p-r28");
    assert.equal(linkedQuestions.length, 3);
    const numbers = linkedQuestions.map((q) => q.number);
    assert.deepEqual(numbers, [28, 29, 30]);
  });

  it("4. Đề 3, đọc hiểu 28–30: hiển thị bài văn nói về ngôn ngữ và văn hóa", () => {
    const data = JSON.parse(
      fs.readFileSync(path.join(process.cwd(), "public/data/exams/n3-best-moshi-03.json"), "utf8")
    );
    const passage = data.passages.find((p) => p.id === "p-r28");
    assert.ok(passage, "Đề 3 phải có passage p-r28");
    assert.ok(passage.text.includes("世界中の人が一つの共通の言語を話せば"));
    assert.ok(passage.text.includes("その民族の精神が反映されている"));

    const linkedQuestions = data.questions.filter((q) => q.passageId === "p-r28");
    assert.equal(linkedQuestions.length, 3);
    const numbers = linkedQuestions.map((q) => q.number);
    assert.deepEqual(numbers, [28, 29, 30]);
  });

  it("5. Đề 3, đọc hiểu 38–39: hiển thị bảng thông tin thủy cung và bảng giá vé", () => {
    const data = JSON.parse(
      fs.readFileSync(path.join(process.cwd(), "public/data/exams/n3-best-moshi-03.json"), "utf8")
    );
    const passage = data.passages.find((p) => p.id === "p-r38");
    assert.ok(passage, "Đề 3 phải có passage p-r38");
    assert.ok(passage.text.includes("大山水族館　ご利用案内"));
    assert.ok(passage.text.includes("大人（高校生以上）　1,300円"));
    assert.ok(passage.text.includes("シルバー（65歳以上）"));

    const linkedQuestions = data.questions.filter((q) => q.passageId === "p-r38");
    assert.equal(linkedQuestions.length, 2);
    const numbers = linkedQuestions.map((q) => q.number);
    assert.deepEqual(numbers, [38, 39]);
  });

  it("6. Mỗi đề thi có đúng 21 câu hỏi đọc/ngữ pháp đoạn văn gắn đúng passageId", () => {
    for (const { file } of exams) {
      const data = JSON.parse(
        fs.readFileSync(path.join(process.cwd(), "public/data/exams", file), "utf8")
      );
      const withPassage = data.questions.filter((q) => Boolean(q.passageId));
      assert.equal(
        withPassage.length,
        21,
        `${file} phải có chính xác 21 câu liên kết bài đọc (5 câu điền đoạn + 16 câu đọc hiểu)`
      );
    }
  });
});

