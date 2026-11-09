import { test, describe } from "node:test";
import assert from "node:assert/strict";
import fs from "fs";

function parseQuestionTokens(text) {
  if (!text) return { tokens: [], totalSlots: 0, starSlot: -1 };

  const regex = /(__[^_]+__|_{3,}|＿＿+|[★☆])/g;
  const tokens = [];
  let lastIndex = 0;
  let match;
  let slotCount = 0;
  let starSlot = -1;

  while ((match = regex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      tokens.push({ type: "text", content: text.slice(lastIndex, match.index) });
    }

    const raw = match[0];
    if (raw === "★" || raw === "☆") {
      slotCount++;
      starSlot = slotCount;
      tokens.push({ type: "slot_star", slotNumber: slotCount, content: raw });
    } else if (raw.startsWith("__") && raw.endsWith("__") && raw.length > 4 && !/^_+$/.test(raw)) {
      tokens.push({ type: "target_underlined", content: raw.slice(2, -2) });
    } else if (/^(_{3,}|＿＿+)$/.test(raw)) {
      slotCount++;
      tokens.push({ type: "slot_blank", slotNumber: slotCount, content: raw });
    } else {
      tokens.push({ type: "text", content: raw });
    }

    lastIndex = regex.lastIndex;
  }

  if (lastIndex < text.length) {
    tokens.push({ type: "text", content: text.slice(lastIndex) });
  }

  return { tokens, totalSlots: slotCount, starSlot };
}

function getStarSlotInfo(text) {
  const { totalSlots, starSlot } = parseQuestionTokens(text);
  if (starSlot > 0 && totalSlots >= 2) {
    return { starPosition: starSlot, totalSlots };
  }
  return null;
}

describe("Xử Lý & Hiển Thị Câu Hỏi Ghép Câu Dấu Sao ★ (Mondai 2)", () => {
  test("1. Phân tích chính xác câu ghép dấu sao ở vị trí số 3 (Moshi 03 - Q14)", () => {
    const text = "インスタントコーヒーが一般に飲まれるようになった ____ ____ ★ ____ 人が増えたということだ。";
    const res = parseQuestionTokens(text);

    assert.strictEqual(res.totalSlots, 4);
    assert.strictEqual(res.starSlot, 3);

    const info = getStarSlotInfo(text);
    assert.deepStrictEqual(info, { starPosition: 3, totalSlots: 4 });

    const blanks = res.tokens.filter(t => t.type === "slot_blank");
    const stars = res.tokens.filter(t => t.type === "slot_star");

    assert.strictEqual(blanks.length, 3);
    assert.strictEqual(stars.length, 1);
    assert.strictEqual(stars[0].slotNumber, 3);
  });

  test("2. Phân tích chính xác câu ghép dấu sao ở vị trí số 1 (Moshi 01 - Q14 dùng gạch toàn giác ＿＿)", () => {
    const text = "自分が人に ★ ＿＿ ＿＿ ＿＿ よく母に注意された。";
    const res = parseQuestionTokens(text);

    assert.strictEqual(res.totalSlots, 4);
    assert.strictEqual(res.starSlot, 1);

    const info = getStarSlotInfo(text);
    assert.deepStrictEqual(info, { starPosition: 1, totalSlots: 4 });
  });

  test("3. Phân tích chính xác câu ghép dấu sao ở vị trí số 4 (Moshi 01 - Q15)", () => {
    const text = "外国語はその言葉が ＿＿ ＿＿ ＿＿ ★ というと、いつもそうとは言えないのではないでしょうか。";
    const res = parseQuestionTokens(text);

    assert.strictEqual(res.totalSlots, 4);
    assert.strictEqual(res.starSlot, 4);
  });

  test("4. Phân tích chính xác câu ghép dấu sao ở vị trí số 2 (Moshi 02 - Q14)", () => {
    const text = "「私にはできない」ではなくて、____ ★ ____ ____ 。";
    const res = parseQuestionTokens(text);

    assert.strictEqual(res.totalSlots, 4);
    assert.strictEqual(res.starSlot, 2);
  });

  test("5. Không làm hỏng câu hỏi thông thường có từ gạch chân __từ__", () => {
    const text = "__レポート__を書かなければなりません。";
    const res = parseQuestionTokens(text);

    assert.strictEqual(res.totalSlots, 0);
    assert.strictEqual(res.starSlot, -1);
    assert.strictEqual(getStarSlotInfo(text), null);

    const targets = res.tokens.filter(t => t.type === "target_underlined");
    assert.strictEqual(targets.length, 1);
    assert.strictEqual(targets[0].content, "レポート");
  });

  test("6. Toàn bộ 15 câu hỏi dấu sao trong 3 bộ đề Moshi đều có đúng 4 vị trí và vị trí sao chuẩn xác", () => {
    const files = ["n3-best-moshi-01.json", "n3-best-moshi-02.json", "n3-best-moshi-03.json"];
    let starCount = 0;

    for (const f of files) {
      const d = JSON.parse(fs.readFileSync("public/data/exams/" + f, "utf8"));
      const starQs = d.questions.filter(q => q.subtype === "star_arrangement" || q.questionText.includes("★"));
      assert.strictEqual(starQs.length, 5, `File ${f} phải có đúng 5 câu hỏi ghép câu dấu sao Mondai 2`);

      for (const q of starQs) {
        starCount++;
        const info = getStarSlotInfo(q.questionText);
        assert.ok(info, `Câu ${q.id} trong ${f} phải nhận diện được thông tin slot dấu sao`);
        assert.strictEqual(info.totalSlots, 4, `Câu ${q.id} phải có đúng 4 vị trí ô`);
        assert.ok(info.starPosition >= 1 && info.starPosition <= 4, `Vị trí sao phải từ 1 đến 4, thực tế: ${info.starPosition}`);
        assert.ok(
          !q.explanation?.summaryVi?.includes("Đáp án chuẩn: ."),
          `Câu ${q.id} không được để placeholder summaryVi: ${q.explanation?.summaryVi}`
        );
      }
    }

    assert.strictEqual(starCount, 15);
  });
});

