import { test, describe } from "node:test";
import assert from "node:assert/strict";
import fs from "fs";

// Load hanviet dictionary & helpers
const hanvietContent = fs.readFileSync("lib/hanviet.ts", "utf8");
const map = {};
for (const match of hanvietContent.matchAll(/"([^"]+)":\s*"([^"]+)"/g)) {
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

// Load HIRAGANA_TO_KANJI_DICT from lib/kanji-dict.ts
const dictContent = fs.readFileSync("lib/kanji-dict.ts", "utf8");
const HIRAGANA_TO_KANJI_DICT = {};
const dictRegex = /"([^"]+)":\s*\{\s*kanji:\s*"([^"]*)",\s*hanViet:\s*"([^"]*)",\s*meaningVi:\s*"([^"]*)"\s*\}/g;
for (const m of dictContent.matchAll(dictRegex)) {
  HIRAGANA_TO_KANJI_DICT[m[1]] = { kanji: m[2], hanViet: m[3], meaningVi: m[4] };
}

function resolveOptionKanji(optionText, question, isCorrect, reasonText) {
  if (!optionText) return null;
  const trimmed = optionText.trim();

  if (isKanji(trimmed) || /[\u4e00-\u9faf]/.test(trimmed)) {
    const hanViet = getHanViet(trimmed);
    let meaningVi = undefined;
    if (question.explanation?.vocabulary) {
      const vMatch = question.explanation.vocabulary.find(v => v.word === trimmed || trimmed.includes(v.word));
      if (vMatch) meaningVi = vMatch.meaningVi;
    }
    return { kanji: trimmed, hanViet, meaningVi, isQuestionTarget: isCorrect };
  }

  if (isCorrect) {
    const testedTarget = extractTestedTarget(question.questionText);
    if (testedTarget && /[\u4e00-\u9faf]/.test(testedTarget)) {
      const hanViet = getHanViet(testedTarget);
      let meaningVi = undefined;
      if (question.explanation?.vocabulary) {
        const vMatch = question.explanation.vocabulary.find(v => v.word === testedTarget);
        if (vMatch) meaningVi = vMatch.meaningVi;
      }
      return { kanji: testedTarget, hanViet, meaningVi, isQuestionTarget: true };
    }
  }

  const dictMatch = HIRAGANA_TO_KANJI_DICT[trimmed];
  if (dictMatch) {
    return {
      kanji: dictMatch.kanji,
      hanViet: dictMatch.hanViet,
      meaningVi: dictMatch.meaningVi,
      isQuestionTarget: false
    };
  }

  if (reasonText) {
    const bracketMatch = reasonText.match(/(?:chữ Hán là|từ|chữ)\s*「([^」]+)」/);
    if (bracketMatch && bracketMatch[1] && /[\u4e00-\u9faf]/.test(bracketMatch[1])) {
      const extracted = bracketMatch[1].trim();
      return { kanji: extracted, hanViet: getHanViet(extracted), isQuestionTarget: false };
    }
  }

  return null;
}

describe("Tra Cứu Chữ Hán Tương Ứng Của Đáp Án Trắc Nghiệm (lib/kanji-dict.ts)", () => {
  const sampleQuestion = {
    questionText: "これから行く店は、あの__角__です。",
    subtype: "kanji_reading",
    section: "vocabulary",
    correctOptionId: "4",
    options: [
      { id: "1", text: "となり" },
      { id: "2", text: "そば" },
      { id: "3", text: "さか" },
      { id: "4", text: "かど" },
    ],
    explanation: {
      vocabulary: [
        { word: "角", hiragana: "かど", meaningVi: "góc đường, góc phố" },
        { word: "隣", hiragana: "となり", meaningVi: "bên cạnh, hàng xóm" },
      ],
      optionReasonsVi: {
        "1": "SAI: 「となり」 là chữ Hán「隣」[LÂN] (nghĩa là bên cạnh/hàng xóm), không phải chữ「角」.",
        "2": "SAI: 「そば」 là chữ Hán「側」hoặc「傍」[TRẮC / BÀNG] (nghĩa là bên cạnh/gần bên), không phải chữ「角」.",
        "3": "SAI: 「さか」 là chữ Hán「坂」[PHẢN] (nghĩa là con dốc), không phải chữ「角」.",
        "4": "ĐÚNG: 「かど」 là chữ Hán「角」[GIÁC] (nghĩa là góc đường/góc phố).",
      },
    },
  };

  test("1. Tra cứu chữ Hán cho phương án đúng 'かど' khớp với từ gạch chân '__角__'", () => {
    const res = resolveOptionKanji("かど", sampleQuestion, true, sampleQuestion.explanation.optionReasonsVi["4"]);
    assert.ok(res !== null);
    assert.strictEqual(res.kanji, "角");
    assert.strictEqual(res.hanViet, "GIÁC");
    assert.strictEqual(res.isQuestionTarget, true);
  });

  test("2. Tra cứu chữ Hán cho phương án sai 'となり' -> '隣' [LÂN]", () => {
    const res = resolveOptionKanji("となり", sampleQuestion, false, sampleQuestion.explanation.optionReasonsVi["1"]);
    assert.ok(res !== null);
    assert.strictEqual(res.kanji, "隣");
    assert.strictEqual(res.hanViet, "LÂN");
  });

  test("3. Tra cứu chữ Hán cho phương án sai 'そば' -> '側 / 傍' [TRẮC / BÀNG]", () => {
    const res = resolveOptionKanji("そば", sampleQuestion, false, sampleQuestion.explanation.optionReasonsVi["2"]);
    assert.ok(res !== null);
    assert.ok(res.kanji.includes("側"));
    assert.ok(res.hanViet.includes("TRẮC"));
  });

  test("4. Tra cứu chữ Hán cho phương án sai 'さか' -> '坂' [PHẢN]", () => {
    const res = resolveOptionKanji("さか", sampleQuestion, false, sampleQuestion.explanation.optionReasonsVi["3"]);
    assert.ok(res !== null);
    assert.strictEqual(res.kanji, "坂");
    assert.strictEqual(res.hanViet, "PHẢN");
  });

  test("5. Xử lý phương án đã là Kanji (Mondai 2: Cách viết Kanji): '焼いて' -> THIÊU", () => {
    const orthographyQuestion = {
      questionText: "肉を__やいて__食べました。",
      subtype: "orthography",
      section: "vocabulary",
      correctOptionId: "2",
      explanation: {
        vocabulary: [
          { word: "焼く", hiragana: "やく", meaningVi: "nướng thịt" }
        ]
      }
    };

    const res = resolveOptionKanji("焼いて", orthographyQuestion, true);
    assert.ok(res !== null);
    assert.strictEqual(res.kanji, "焼いて");
    assert.strictEqual(res.hanViet, "THIÊU");
  });

  test("6. Xử lý từ ghép Kanji 2 chữ: '就職' -> TỰU CHỨC", () => {
    const res = resolveOptionKanji("就職", { questionText: "" }, true);
    assert.ok(res !== null);
    assert.strictEqual(res.kanji, "就職");
    assert.strictEqual(res.hanViet, "TỰU CHỨC");
  });

  test("7. Từ điển HIRAGANA_TO_KANJI_DICT có độ bao phủ phong phú cho các từ vựng gây nhiễu N3", () => {
    const dictSize = Object.keys(HIRAGANA_TO_KANJI_DICT).length;
    assert.ok(dictSize >= 50, `Kích thước từ điển ánh xạ phải >= 50 từ, hiện tại: ${dictSize}`);
  });

  test("8. Tổng hợp từ vựng phong phú từ câu hỏi và các đáp án (getEnrichedQuestionVocabulary)", () => {
    const q19 = {
      questionText: "夜空には星が（　）かがやいていた。",
      options: [
        { id: "1", text: "すらすら" },
        { id: "2", text: "どきどき" },
        { id: "3", text: "ざあざあ" },
        { id: "4", text: "きらきら" },
      ],
      correctOptionId: "4",
      explanation: {
        vocabulary: [
          { word: "きらきら", hiragana: "きらきら", meaningVi: "lấp lánh" }
        ]
      }
    };

    function getEnrichedQuestionVocabulary(question) {
      const result = [];
      const seen = new Set();
      const register = (item) => {
        const raw = (item.word || "").trim();
        if (!raw) return;
        const cleanWord = raw.split("/")[0].trim();
        const cleanHira = (item.hiragana || "").split("/")[0].trim();
        if (seen.has(cleanWord) || (cleanHira && seen.has(cleanHira))) return;
        seen.add(cleanWord);
        if (cleanHira) seen.add(cleanHira);
        result.push({ ...item, word: cleanWord, hiragana: cleanHira || cleanWord });
      };

      if (question.explanation?.vocabulary) {
        question.explanation.vocabulary.forEach(v => register({ ...v, source: "target" }));
      }
      if (question.options) {
        question.options.forEach(opt => {
          const m = HIRAGANA_TO_KANJI_DICT[opt.text];
          if (m) register({ word: m.kanji || opt.text, hiragana: opt.text, meaningVi: m.meaningVi, source: "option" });
        });
      }
      const qText = question.questionText || "";
      for (const [hira, info] of Object.entries(HIRAGANA_TO_KANJI_DICT)) {
        const kanjiMain = info.kanji.split("/")[0].trim();
        if (kanjiMain && kanjiMain.length >= 1 && (isKanji(kanjiMain) || kanjiMain.length >= 2)) {
          if (qText.includes(kanjiMain)) {
            register({ word: kanjiMain, hiragana: hira, meaningVi: info.meaningVi, source: "question" });
          }
        }
      }
      return result;
    }

    const vocabList = getEnrichedQuestionVocabulary(q19);
    assert.ok(vocabList.length >= 5, `Số lượng từ vựng tổng hợp phải >= 5, thực tế: ${vocabList.length}`);
    const words = vocabList.map(v => v.word);
    assert.ok(words.includes("きらきら"));
    assert.ok(words.includes("すらすら"));
    assert.ok(words.includes("夜空"));
    assert.ok(words.includes("星"));
  });

  test("9. Xử lý câu hỏi có các phương án là danh từ Kanji (Moshi 03 - Q27: レポート / 〜書): đầy đủ Furigana, Hán Việt và Nghĩa", () => {
    const q27 = JSON.parse(fs.readFileSync("public/data/exams/n3-best-moshi-03.json", "utf8"))
      .questions.find(q => q.id === "n3-best-moshi-03-voc-027");
    
    // Parse KANJI_WORDS_DICT
    const KANJI_WORDS_DICT = {};
    for (const m of dictContent.matchAll(/"([^"]+)":\s*\{\s*reading:\s*"([^"]*)",\s*meaningVi:\s*"([^"]*)"\s*\}/g)) {
      KANJI_WORDS_DICT[m[1]] = { reading: m[2], meaningVi: m[3] };
    }

    assert.ok(KANJI_WORDS_DICT["計算書"]);
    assert.strictEqual(KANJI_WORDS_DICT["計算書"].reading, "けいさんしょ");
    assert.ok(KANJI_WORDS_DICT["請求書"]);
    assert.strictEqual(KANJI_WORDS_DICT["請求書"].reading, "せいきゅうしょ");
    assert.ok(KANJI_WORDS_DICT["申請書"]);
    assert.strictEqual(KANJI_WORDS_DICT["申請書"].reading, "しんせいしょ");
    assert.ok(KANJI_WORDS_DICT["報告書"]);
    assert.strictEqual(KANJI_WORDS_DICT["報告書"].reading, "ほうこくしょ");

    // Kiểm tra Hán Việt đầy đủ không bị khuyết chữ 請 (THỈNH)
    assert.strictEqual(getHanViet("請求書"), "THỈNH CẦU THƯ");
    assert.strictEqual(getHanViet("申請書"), "THÂN THỈNH THƯ");
    assert.strictEqual(getHanViet("計算書"), "KẾ TOÁN THƯ");
    assert.strictEqual(getHanViet("報告書"), "BÁO CÁO THƯ");

    // Kiểm tra vocabulary trong đề thi có đầy đủ 4 từ và đều có furigana + nghĩa thật
    const vocabs = q27.explanation.vocabulary;
    assert.strictEqual(vocabs.length, 4);
    for (const v of vocabs) {
      assert.ok(v.word);
      assert.ok(v.hiragana, `Furigana của ${v.word} không được rỗng`);
      assert.notStrictEqual(v.hiragana, v.word, `Furigana của ${v.word} không được trùng với chữ Hán`);
      assert.ok(v.meaningVi, `Nghĩa của ${v.word} không được rỗng`);
      assert.ok(!v.meaningVi.startsWith("Hán Việt:"), `Nghĩa của ${v.word} phải là nghĩa tiếng Việt thực thụ: ${v.meaningVi}`);
    }
  });
});
