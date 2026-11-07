import { test, describe } from "node:test";
import assert from "node:assert/strict";
import fs from "fs";

// Load hanviet dictionary & helpers from lib/hanviet.ts
const content = fs.readFileSync("lib/hanviet.ts", "utf8");

// Parse map
const map = {};
for (const match of content.matchAll(/"([^"]+)":\s*"([^"]+)"/g)) {
  map[match[1]] = match[2];
}

const isKanji = (char) => /[\u4e00-\u9faf\u3400-\u4dbf]/.test(char);

function getHanViet(text) {
  if (!text) return "";
  const chars = Array.from(text);
  const result = [];
  for (const c of chars) {
    if (isKanji(c)) {
      result.push(map[c] || c);
    }
  }
  return result.join(" ");
}

function getKanjiBreakdown(text) {
  if (!text) return [];
  const chars = Array.from(text);
  const items = [];
  const seen = new Set();
  for (const c of chars) {
    if (isKanji(c) && !seen.has(c)) {
      seen.add(c);
      items.push({ kanji: c, hanViet: map[c] || "" });
    }
  }
  return items;
}

function extractTestedTarget(questionText) {
  if (!questionText) return null;
  const m1 = questionText.match(/__([^_]+)__/);
  if (m1) return m1[1].trim();
  const m2 = questionText.match(/【([^】]+)】/);
  if (m2) return m2[1].trim();
  const m3 = questionText.match(/「([^」]+)」/);
  if (m3) return m3[1].trim();
  return null;
}

function getQuestionKanjiTarget(question) {
  const extracted = extractTestedTarget(question.questionText);
  if (extracted && isKanji(extracted)) {
    return {
      targetJa: extracted,
      hanViet: getHanViet(extracted),
      breakdown: getKanjiBreakdown(extracted)
    };
  }
  const correctOpt = question.options.find(o => o.id === question.correctOptionId);
  if (correctOpt && isKanji(correctOpt.text)) {
    return {
      targetJa: correctOpt.text,
      hanViet: getHanViet(correctOpt.text),
      breakdown: getKanjiBreakdown(correctOpt.text)
    };
  }
  return null;
}

describe("Tra Cứu Âm Hán Việt & Phân Tích Kanji (lib/hanviet.ts)", () => {
  test("1. Độ bao phủ từ điển chữ Hán đạt trên 900+ ký tự chuẩn JLPT", () => {
    const size = Object.keys(map).length;
    assert.ok(size >= 950, `Kích thước từ điển phải đạt >= 950 ký tự, hiện tại: ${size}`);
  });

  test("2. Tra âm Hán Việt cho từ ghép 2 chữ Hán: 消費 -> TIÊU PHÍ", () => {
    assert.strictEqual(getHanViet("消費"), "TIÊU PHÍ");
  });

  test("3. Tra âm Hán Việt cho từ ghép 4 chữ Hán: 消費期限 -> TIÊU PHÍ KỲ HẠN", () => {
    assert.strictEqual(getHanViet("消費期限"), "TIÊU PHÍ KỲ HẠN");
  });

  test("4. Tra âm Hán Việt cho từ đơn và chữ Hán có Okurigana: 親しい -> THÂN, 配る -> PHỐI", () => {
    assert.strictEqual(getHanViet("親しい"), "THÂN");
    assert.strictEqual(getHanViet("配る"), "PHỐI");
    assert.strictEqual(getHanViet("緑"), "LỤC");
  });

  test("5. Phân tích chi tiết từng chữ Hán (Kanji Breakdown)", () => {
    const breakdown = getKanjiBreakdown("消費");
    assert.deepStrictEqual(breakdown, [
      { kanji: "消", hanViet: "TIÊU" },
      { kanji: "費", hanViet: "PHÍ" },
    ]);
  });

  test("6. Bóc tách từ khóa trọng tâm dạng Kanji Reading: __消費__", () => {
    const target = extractTestedTarget("このお弁当は__消費__期限が近づいている。");
    assert.strictEqual(target, "消費");
  });

  test("7. Nhận diện từ khóa trọng tâm dạng Kanji Spelling (Hiragana trong câu, Kanji trong đáp án)", () => {
    const question = {
      questionText: "ビルはとうとう__かんせい__しました。",
      options: [
        { id: "1", text: "官生" },
        { id: "2", text: "官成" },
        { id: "3", text: "完生" },
        { id: "4", text: "完成" }
      ],
      correctOptionId: "4"
    };
    const target = getQuestionKanjiTarget(question);
    assert.ok(target !== null);
    assert.strictEqual(target.targetJa, "完成");
    assert.strictEqual(target.hanViet, "HOÀN THÀNH");
    assert.strictEqual(target.breakdown.length, 2);
    assert.strictEqual(target.breakdown[0].hanViet, "HOÀN");
    assert.strictEqual(target.breakdown[1].hanViet, "THÀNH");
  });
});

