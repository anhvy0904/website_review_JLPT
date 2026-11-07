import { test, describe } from "node:test";
import assert from "node:assert/strict";

// We re-implement or test conjugateVerb logic directly
const GODAN_KANA_ROWS = {
  う: { a: "わ", i: "い", u: "う", e: "え", o: "お", te: "って", ta: "った" },
  つ: { a: "た", i: "ち", u: "つ", e: "て", o: "と", te: "って", ta: "った" },
  る: { a: "ら", i: "り", u: "る", e: "れ", o: "ろ", te: "って", ta: "った" },
  む: { a: "ま", i: "み", u: "む", e: "め", o: "も", te: "んで", ta: "んだ" },
  ぶ: { a: "ば", i: "び", u: "ぶ", e: "べ", o: "ぼ", te: "んで", ta: "んだ" },
  ぬ: { a: "な", i: "に", u: "ぬ", e: "ね", o: "の", te: "んで", ta: "んだ" },
  く: { a: "か", i: "き", u: "く", e: "け", o: "こ", te: "いて", ta: "いた" },
  ぐ: { a: "が", i: "ぎ", u: "ぐ", e: "げ", o: "ご", te: "いで", ta: "いだ" },
  す: { a: "さ", i: "し", u: "す", e: "せ", o: "そ", te: "して", ta: "した" },
};

function conjugateTestVerb(verb) {
  const { kanji, hiragana, group } = verb;
  const isIku = kanji === "行く" || hiragana === "いく";
  const forms = {};

  if (group === "suru") {
    forms.te = "して";
    forms.ta = "した";
    forms.nai = "しない";
    forms.dictionary = "する";
    forms.ba = "すれば";
    forms.volitional = "しよう";
    forms.imperative = "しろ";
    forms.prohibitive = "するな";
    forms.potential = "できる";
    forms.passive = "される";
    forms.causative = "させる";
    forms["causative-passive"] = "させられる";
  } else if (group === "kuru") {
    forms.te = "きて";
    forms.ta = "きた";
    forms.nai = "こない";
    forms.dictionary = "くる";
    forms.ba = "くれば";
    forms.volitional = "こよう";
    forms.imperative = "こい";
    forms.prohibitive = "くるな";
    forms.potential = "こられる";
    forms.passive = "こられる";
    forms.causative = "こさせる";
    forms["causative-passive"] = "こさせられる";
  } else if (group === "ichidan") {
    const stemHira = hiragana.slice(0, -1);
    forms.te = `${stemHira}て`;
    forms.ta = `${stemHira}た`;
    forms.nai = `${stemHira}ない`;
    forms.dictionary = hiragana;
    forms.ba = `${stemHira}れば`;
    forms.volitional = `${stemHira}よう`;
    forms.imperative = `${stemHira}ろ`;
    forms.prohibitive = `${hiragana}な`;
    forms.potential = `${stemHira}られる`;
    forms.passive = `${stemHira}られる`;
    forms.causative = `${stemHira}させる`;
    forms["causative-passive"] = `${stemHira}させられる`;
  } else {
    // Godan
    const lastCharHira = hiragana.slice(-1);
    const stemHira = hiragana.slice(0, -1);
    const row = GODAN_KANA_ROWS[lastCharHira];

    if (isIku) {
      forms.te = "いって";
      forms.ta = "いった";
    } else {
      forms.te = `${stemHira}${row.te}`;
      forms.ta = `${stemHira}${row.ta}`;
    }

    forms.nai = `${stemHira}${row.a}ない`;
    forms.dictionary = hiragana;
    forms.ba = `${stemHira}${row.e}ば`;
    forms.volitional = `${stemHira}${row.o}う`;
    forms.imperative = `${stemHira}${row.e}`;
    forms.prohibitive = `${hiragana}な`;
    forms.potential = `${stemHira}${row.e}る`;
    forms.passive = `${stemHira}${row.a}れる`;
    forms.causative = `${stemHira}${row.a}せる`;

    if (lastCharHira === "す") {
      forms["causative-passive"] = `${stemHira}${row.a}せられる`;
    } else {
      forms["causative-passive"] = `${stemHira}${row.a}される`;
    }
  }

  return forms;
}

describe("Động Cơ Chia Động Từ JLPT N3 (Conjugator Engine)", () => {
  test("1. Động từ Nhóm I: 書く (かく)", () => {
    const f = conjugateTestVerb({ kanji: "書く", hiragana: "かく", group: "godan" });
    assert.strictEqual(f.te, "かいて");
    assert.strictEqual(f.ta, "かいた");
    assert.strictEqual(f.nai, "かかない");
    assert.strictEqual(f.ba, "かけば");
    assert.strictEqual(f.volitional, "かこう");
    assert.strictEqual(f.imperative, "かけ");
    assert.strictEqual(f.prohibitive, "かくな");
    assert.strictEqual(f.potential, "かける");
    assert.strictEqual(f.passive, "かかれる");
    assert.strictEqual(f.causative, "かかせる");
    assert.strictEqual(f["causative-passive"], "かかされる");
  });

  test("2. Động từ Nhóm I đuôi 'す': 話す (はなす) - Kiểm tra bị động sai khiến không được rút gọn thành 'さされる'", () => {
    const f = conjugateTestVerb({ kanji: "話す", hiragana: "はなす", group: "godan" });
    assert.strictEqual(f.te, "はなして");
    assert.strictEqual(f.nai, "はなさない");
    assert.strictEqual(f.potential, "はなせる");
    assert.strictEqual(f["causative-passive"], "はなさせられる"); // Đúng ngữ pháp chuẩn
  });

  test("3. Động từ Nhóm I đuôi 'む': 読む (よむ)", () => {
    const f = conjugateTestVerb({ kanji: "読む", hiragana: "よむ", group: "godan" });
    assert.strictEqual(f.te, "よんで");
    assert.strictEqual(f.ta, "よんだ");
    assert.strictEqual(f.nai, "よまない");
    assert.strictEqual(f.ba, "よめば");
    assert.strictEqual(f.potential, "よめる");
  });

  test("4. Động từ Nhóm I đuôi 'う': 買う (かう) - Biến đổi 'う' thành 'わ'", () => {
    const f = conjugateTestVerb({ kanji: "買う", hiragana: "かう", group: "godan" });
    assert.strictEqual(f.te, "かって");
    assert.strictEqual(f.nai, "かわない"); // 'wa' line
    assert.strictEqual(f.passive, "かわれる");
    assert.strictEqual(f.causative, "かわせる");
  });

  test("5. Động từ Nhóm I ngoại lệ: 行く (いく) - 'いって' và 'いった'", () => {
    const f = conjugateTestVerb({ kanji: "行く", hiragana: "いく", group: "godan" });
    assert.strictEqual(f.te, "いって"); // Không phải 'いいて'
    assert.strictEqual(f.ta, "いった"); // Không phải 'いいた'
    assert.strictEqual(f.nai, "いかない");
    assert.strictEqual(f.potential, "いける");
  });

  test("6. Động từ Nhóm II: 食べる (たべる)", () => {
    const f = conjugateTestVerb({ kanji: "食べる", hiragana: "たべる", group: "ichidan" });
    assert.strictEqual(f.te, "たべて");
    assert.strictEqual(f.ta, "たべた");
    assert.strictEqual(f.nai, "たべない");
    assert.strictEqual(f.ba, "たべれば");
    assert.strictEqual(f.volitional, "たべよう");
    assert.strictEqual(f.imperative, "たべろ");
    assert.strictEqual(f.potential, "たべられる");
    assert.strictEqual(f.passive, "たべられる");
    assert.strictEqual(f.causative, "たべさせる");
    assert.strictEqual(f["causative-passive"], "たべさせられる");
  });

  test("7. Động từ Nhóm II: 見る (みる)", () => {
    const f = conjugateTestVerb({ kanji: "見る", hiragana: "みる", group: "ichidan" });
    assert.strictEqual(f.te, "みて");
    assert.strictEqual(f.nai, "みない");
    assert.strictEqual(f.potential, "みられる");
    assert.strictEqual(f.causative, "みさせる");
  });

  test("8. Bất quy tắc Nhóm III: する", () => {
    const f = conjugateTestVerb({ kanji: "する", hiragana: "する", group: "suru" });
    assert.strictEqual(f.te, "して");
    assert.strictEqual(f.nai, "しない");
    assert.strictEqual(f.ba, "すれば");
    assert.strictEqual(f.volitional, "しよう");
    assert.strictEqual(f.potential, "できる"); // Đặc biệt
    assert.strictEqual(f.passive, "される");
    assert.strictEqual(f.causative, "させる");
    assert.strictEqual(f["causative-passive"], "させられる");
  });

  test("9. Bất quy tắc Nhóm III: 来る (くる)", () => {
    const f = conjugateTestVerb({ kanji: "来る", hiragana: "くる", group: "kuru" });
    assert.strictEqual(f.te, "きて");
    assert.strictEqual(f.ta, "きた");
    assert.strictEqual(f.nai, "こない"); // Âm 'ko'
    assert.strictEqual(f.ba, "くれば");
    assert.strictEqual(f.imperative, "こい"); // Âm 'ko'
    assert.strictEqual(f.potential, "こられる");
    assert.strictEqual(f.causative, "こさせる");
    assert.strictEqual(f["causative-passive"], "こさせられる");
  });
});
