export type VerbGroup = "godan" | "ichidan" | "kuru" | "suru";

export type VerbFormId =
  | "te"
  | "ta"
  | "nai"
  | "dictionary"
  | "ba"
  | "volitional"
  | "imperative"
  | "prohibitive"
  | "potential"
  | "passive"
  | "causative"
  | "causative-passive";

export interface VerbConjugationResult {
  base: string;
  reading: string;
  group: VerbGroup;
  meaningVi: string;
  forms: Record<
    VerbFormId,
    {
      formId: VerbFormId;
      nameJa: string;
      nameVi: string;
      kanji: string;
      hiragana: string;
      ruleExplanationVi: string;
    }
  >;
}

// Known verbs database with accurate grouping (covers Godan verbs ending in -iru/-eru like 帰る, 走る, 知る)
export interface VerbEntry {
  kanji: string;
  hiragana: string;
  group: VerbGroup;
  meaningVi: string;
}

export const KNOWN_VERBS: VerbEntry[] = [
  // Godan (Group 1)
  { kanji: "書く", hiragana: "かく", group: "godan", meaningVi: "viết" },
  { kanji: "話す", hiragana: "はなす", group: "godan", meaningVi: "nói chuyện" },
  { kanji: "読む", hiragana: "よむ", group: "godan", meaningVi: "đọc" },
  { kanji: "買う", hiragana: "かう", group: "godan", meaningVi: "mua" },
  { kanji: "行く", hiragana: "いく", group: "godan", meaningVi: "đi" },
  { kanji: "泳ぐ", hiragana: "およぐ", group: "godan", meaningVi: "bơi" },
  { kanji: "待つ", hiragana: "まつ", group: "godan", meaningVi: "chờ đợi" },
  { kanji: "死ぬ", hiragana: "しぬ", group: "godan", meaningVi: "chết" },
  { kanji: "遊ぶ", hiragana: "あそぶ", group: "godan", meaningVi: "chơi" },
  { kanji: "取る", hiragana: "とる", group: "godan", meaningVi: "lấy, cầm" },
  { kanji: "帰る", hiragana: "かえる", group: "godan", meaningVi: "về (nhóm 1 đặc biệt)" },
  { kanji: "走る", hiragana: "はしる", group: "godan", meaningVi: "chạy (nhóm 1 đặc biệt)" },
  { kanji: "知る", hiragana: "しる", group: "godan", meaningVi: "biết (nhóm 1 đặc biệt)" },
  { kanji: "入る", hiragana: "はいる", group: "godan", meaningVi: "vào (nhóm 1 đặc biệt)" },
  { kanji: "切る", hiragana: "きる", group: "godan", meaningVi: "cắt (nhóm 1 đặc biệt)" },

  // Ichidan (Group 2)
  { kanji: "食べる", hiragana: "たべる", group: "ichidan", meaningVi: "ăn" },
  { kanji: "見る", hiragana: "みる", group: "ichidan", meaningVi: "nhìn, xem" },
  { kanji: "起きる", hiragana: "おきる", group: "ichidan", meaningVi: "thức dậy" },
  { kanji: "寝る", hiragana: "ねる", group: "ichidan", meaningVi: "ngủ" },
  { kanji: "教える", hiragana: "おしえる", group: "ichidan", meaningVi: "dạy, chỉ dẫn" },
  { kanji: "覚える", hiragana: "おぼえる", group: "ichidan", meaningVi: "nhớ, ghi nhớ" },
  { kanji: "調べる", hiragana: "しらべる", group: "ichidan", meaningVi: "tra cứu, điều tra" },

  // Irregular (Group 3)
  { kanji: "する", hiragana: "する", group: "suru", meaningVi: "làm" },
  { kanji: "来る", hiragana: "くる", group: "kuru", meaningVi: "đến" },
];

export const FORM_METADATA: Record<VerbFormId, { nameJa: string; nameVi: string }> = {
  te: { nameJa: "て形", nameVi: "Thể て (nối câu, đang làm, yêu cầu)" },
  ta: { nameJa: "た形", nameVi: "Thể た (quá khứ, kinh nghiệm)" },
  nai: { nameJa: "ない形", nameVi: "Thể phủ định ない" },
  dictionary: { nameJa: "辞書形", nameVi: "Thể từ điển (nguyên mẫu)" },
  ba: { nameJa: "ば形", nameVi: "Thể điều kiện ば (nếu...)" },
  volitional: { nameJa: "意向形", nameVi: "Thể ý chí (rủ rê, dự định)" },
  imperative: { nameJa: "命令形", nameVi: "Thể mệnh lệnh (ra lệnh dứt khoát)" },
  prohibitive: { nameJa: "禁止形", nameVi: "Thể cấm đoán (không được làm)" },
  potential: { nameJa: "可能形", nameVi: "Thể khả năng (có thể làm)" },
  passive: { nameJa: "受身形", nameVi: "Thể bị động (bị/được làm)" },
  causative: { nameJa: "使役形", nameVi: "Thể sai khiến (bắt/cho phép làm)" },
  "causative-passive": {
    nameJa: "使役受身形",
    nameVi: "Thể bị động sai khiến (bị bắt buộc phải làm)",
  },
};

const GODAN_KANA_ROWS: Record<
  string,
  { a: string; i: string; u: string; e: string; o: string; te: string; ta: string }
> = {
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

/**
 * Chia động từ theo 12 thể chuẩn ngữ pháp tiếng Nhật JLPT N3.
 * Được kiểm thử chặt chẽ với các ngoại lệ như 行く (いく), する, 来る (くる).
 */
export function conjugateVerb(verb: VerbEntry): VerbConjugationResult {
  const { kanji, hiragana, group, meaningVi } = verb;
  const isIku = kanji === "行く" || hiragana === "いく";

  const forms: any = {};

  if (group === "suru") {
    forms.te = { kanji: "して", hiragana: "して", ruleExplanationVi: "Bất quy tắc: する → して" };
    forms.ta = { kanji: "した", hiragana: "した", ruleExplanationVi: "Bất quy tắc: する → した" };
    forms.nai = { kanji: "しない", hiragana: "しない", ruleExplanationVi: "Bất quy tắc: する → しない" };
    forms.dictionary = { kanji: "する", hiragana: "する", ruleExplanationVi: "Thể từ điển nguyên mẫu" };
    forms.ba = { kanji: "すれば", hiragana: "すれば", ruleExplanationVi: "Bất quy tắc: する → すれば" };
    forms.volitional = { kanji: "しよう", hiragana: "しよう", ruleExplanationVi: "Bất quy tắc: する → しよう" };
    forms.imperative = { kanji: "しろ", hiragana: "しろ", ruleExplanationVi: "Bất quy tắc: する → しろ (hoặc せよ)" };
    forms.prohibitive = { kanji: "するな", hiragana: "するな", ruleExplanationVi: "Quy tắc chung: Thể từ điển + な" };
    forms.potential = { kanji: "できる", hiragana: "できる", ruleExplanationVi: "Bất quy tắc: する → できる" };
    forms.passive = { kanji: "される", hiragana: "される", ruleExplanationVi: "Bất quy tắc: する → される" };
    forms.causative = { kanji: "させる", hiragana: "させる", ruleExplanationVi: "Bất quy tắc: する → させる" };
    forms["causative-passive"] = {
      kanji: "させられる",
      hiragana: "させられる",
      ruleExplanationVi: "Bất quy tắc: する → させられる",
    };
  } else if (group === "kuru") {
    forms.te = { kanji: "来て", hiragana: "きて", ruleExplanationVi: "Bất quy tắc: くる → きて" };
    forms.ta = { kanji: "来た", hiragana: "きた", ruleExplanationVi: "Bất quy tắc: くる → きた" };
    forms.nai = { kanji: "来ない", hiragana: "こない", ruleExplanationVi: "Bất quy tắc: くる → こない" };
    forms.dictionary = { kanji: "来る", hiragana: "くる", ruleExplanationVi: "Thể từ điển nguyên mẫu" };
    forms.ba = { kanji: "来れば", hiragana: "くれば", ruleExplanationVi: "Bất quy tắc: くる → くれば" };
    forms.volitional = { kanji: "来よう", hiragana: "こよう", ruleExplanationVi: "Bất quy tắc: くる → こよう" };
    forms.imperative = { kanji: "来い", hiragana: "こい", ruleExplanationVi: "Bất quy tắc: くる → こい" };
    forms.prohibitive = { kanji: "来るな", hiragana: "くるな", ruleExplanationVi: "Quy tắc chung: Thể từ điển + な" };
    forms.potential = { kanji: "来られる", hiragana: "こられる", ruleExplanationVi: "Bất quy tắc: くる → こられる" };
    forms.passive = { kanji: "来られる", hiragana: "こられる", ruleExplanationVi: "Bất quy tắc: くる → こられる (bị động phiền toái)" };
    forms.causative = { kanji: "来させる", hiragana: "こさせる", ruleExplanationVi: "Bất quy tắc: くる → こさせる" };
    forms["causative-passive"] = {
      kanji: "来させられる",
      hiragana: "こさせられる",
      ruleExplanationVi: "Bất quy tắc: くる → こさせられる",
    };
  } else if (group === "ichidan") {
    // Group 2: drop る
    const stemKanji = kanji.slice(0, -1);
    const stemHira = hiragana.slice(0, -1);

    forms.te = { kanji: `${stemKanji}て`, hiragana: `${stemHira}て`, ruleExplanationVi: "Nhóm II: Bỏ る + て" };
    forms.ta = { kanji: `${stemKanji}た`, hiragana: `${stemHira}た`, ruleExplanationVi: "Nhóm II: Bỏ る + た" };
    forms.nai = { kanji: `${stemKanji}ない`, hiragana: `${stemHira}ない`, ruleExplanationVi: "Nhóm II: Bỏ る + ない" };
    forms.dictionary = { kanji, hiragana, ruleExplanationVi: "Thể từ điển nguyên mẫu" };
    forms.ba = { kanji: `${stemKanji}れば`, hiragana: `${stemHira}れば`, ruleExplanationVi: "Nhóm II: Bỏ る + れば" };
    forms.volitional = { kanji: `${stemKanji}よう`, hiragana: `${stemHira}よう`, ruleExplanationVi: "Nhóm II: Bỏ る + よう" };
    forms.imperative = { kanji: `${stemKanji}ろ`, hiragana: `${stemHira}ろ`, ruleExplanationVi: "Nhóm II: Bỏ る + ろ" };
    forms.prohibitive = { kanji: `${kanji}な`, hiragana: `${hiragana}な`, ruleExplanationVi: "Quy tắc chung: Thể từ điển + な" };
    forms.potential = { kanji: `${stemKanji}られる`, hiragana: `${stemHira}られる`, ruleExplanationVi: "Nhóm II: Bỏ る + られる" };
    forms.passive = { kanji: `${stemKanji}られる`, hiragana: `${stemHira}られる`, ruleExplanationVi: "Nhóm II: Bỏ る + られる" };
    forms.causative = { kanji: `${stemKanji}させる`, hiragana: `${stemHira}させる`, ruleExplanationVi: "Nhóm II: Bỏ る + させる" };
    forms["causative-passive"] = {
      kanji: `${stemKanji}させられる`,
      hiragana: `${stemHira}させられる`,
      ruleExplanationVi: "Nhóm II: Bỏ る + させられる",
    };
  } else {
    // Group 1: Godan
    const lastCharHira = hiragana.slice(-1);
    const stemKanji = kanji.slice(0, -1);
    const stemHira = hiragana.slice(0, -1);
    const row = GODAN_KANA_ROWS[lastCharHira] || {
      a: "わ",
      i: "い",
      u: "う",
      e: "え",
      o: "お",
      te: "って",
      ta: "った",
    };

    // Special exception for 行く
    if (isIku) {
      forms.te = { kanji: "行って", hiragana: "いって", ruleExplanationVi: "Ngoại lệ Nhóm I: 行く đổi thành 行って (không phải 行いて)" };
      forms.ta = { kanji: "行った", hiragana: "いった", ruleExplanationVi: "Ngoại lệ Nhóm I: 行く đổi thành 行った (không phải 行いだ)" };
    } else {
      forms.te = {
        kanji: `${stemKanji}${row.te}`,
        hiragana: `${stemHira}${row.te}`,
        ruleExplanationVi: `Nhóm I đuôi [${lastCharHira}]: biến âm thành [${row.te}]`,
      };
      forms.ta = {
        kanji: `${stemKanji}${row.ta}`,
        hiragana: `${stemHira}${row.ta}`,
        ruleExplanationVi: `Nhóm I đuôi [${lastCharHira}]: biến âm thành [${row.ta}]`,
      };
    }

    // nai form: a-line + ない (Note: う -> わ)
    forms.nai = {
      kanji: `${stemKanji}${row.a}ない`,
      hiragana: `${stemHira}${row.a}ない`,
      ruleExplanationVi: `Nhóm I: chuyển đuôi [${lastCharHira}] sang cột [a] là [${row.a}] + ない`,
    };

    // dictionary
    forms.dictionary = { kanji, hiragana, ruleExplanationVi: "Thể từ điển nguyên mẫu" };

    // ba: e-line + ば
    forms.ba = {
      kanji: `${stemKanji}${row.e}ば`,
      hiragana: `${stemHira}${row.e}ば`,
      ruleExplanationVi: `Nhóm I: chuyển đuôi [${lastCharHira}] sang cột [e] là [${row.e}] + ば`,
    };

    // volitional: o-line + う
    forms.volitional = {
      kanji: `${stemKanji}${row.o}う`,
      hiragana: `${stemHira}${row.o}う`,
      ruleExplanationVi: `Nhóm I: chuyển đuôi [${lastCharHira}] sang cột [o] là [${row.o}] + う`,
    };

    // imperative: e-line
    forms.imperative = {
      kanji: `${stemKanji}${row.e}`,
      hiragana: `${stemHira}${row.e}`,
      ruleExplanationVi: `Nhóm I: chuyển đuôi [${lastCharHira}] sang cột [e] là [${row.e}]`,
    };

    // prohibitive: dictionary + な
    forms.prohibitive = {
      kanji: `${kanji}な`,
      hiragana: `${hiragana}な`,
      ruleExplanationVi: "Quy tắc chung: Thể từ điển + な",
    };

    // potential: e-line + る
    forms.potential = {
      kanji: `${stemKanji}${row.e}る`,
      hiragana: `${stemHira}${row.e}る`,
      ruleExplanationVi: `Nhóm I: chuyển đuôi [${lastCharHira}] sang cột [e] là [${row.e}] + る`,
    };

    // passive: a-line + れる
    forms.passive = {
      kanji: `${stemKanji}${row.a}れる`,
      hiragana: `${stemHira}${row.a}れる`,
      ruleExplanationVi: `Nhóm I: chuyển đuôi [${lastCharHira}] sang cột [a] là [${row.a}] + れる`,
    };

    // causative: a-line + せる
    forms.causative = {
      kanji: `${stemKanji}${row.a}せる`,
      hiragana: `${stemHira}${row.a}せる`,
      ruleExplanationVi: `Nhóm I: chuyển đuôi [${lastCharHira}] sang cột [a] là [${row.a}] + せる`,
    };

    // causative-passive:
    // With す (e.g. 話す): only 話させられる (no 話さされる!)
    // With others (e.g. 書く, 読む, 買う): 書かせられる / 書かされる
    const isSuEnding = lastCharHira === "す";
    if (isSuEnding) {
      forms["causative-passive"] = {
        kanji: `${stemKanji}${row.a}せられる`,
        hiragana: `${stemHira}${row.a}せられる`,
        ruleExplanationVi: `Động từ đuôi [す] chỉ dùng dạng đầy đủ [させられる], KHÔNG rút gọn thành [さされる]`,
      };
    } else {
      forms["causative-passive"] = {
        kanji: `${stemKanji}${row.a}される`,
        hiragana: `${stemHira}${row.a}される`,
        ruleExplanationVi: `Nhóm I: dạng rút gọn thường dùng [${row.a}される] (hoặc đầy đủ [${row.a}せられる])`,
      };
    }
  }

  // Populate names
  for (const formKey of Object.keys(FORM_METADATA) as VerbFormId[]) {
    if (forms[formKey]) {
      forms[formKey].formId = formKey;
      forms[formKey].nameJa = FORM_METADATA[formKey].nameJa;
      forms[formKey].nameVi = FORM_METADATA[formKey].nameVi;
    }
  }

  return {
    base: kanji,
    reading: hiragana,
    group,
    meaningVi,
    forms,
  };
}

