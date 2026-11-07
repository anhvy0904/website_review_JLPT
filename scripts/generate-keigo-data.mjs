import fs from "fs";
import path from "path";

const targetDir = path.join(process.cwd(), "public", "data", "learning", "keigo");

// 1. index.json
const KEIGO_INDEX = {
  heroTitleJa: "敬語（けいご）を学ぼう",
  heroTitleVi: "Học Kính Ngữ & Khiêm Nhường Ngữ Tiếng Nhật",
  heroSubtitleVi: "Bí quyết làm chủ 3 hệ thống kính ngữ và nguyên tắc Trong - Ngoài (内・外) trong đề thi JLPT N3 và giao tiếp công sở Nhật Bản.",
  categories: [
    {
      id: "sonkeigo",
      titleJa: "尊敬語",
      reading: "そんけいご",
      titleVi: "Tôn kính ngữ",
      summaryVi: "Nâng hành động của đối phương hoặc người có vị thế cao (khách hàng, cấp trên, thầy cô).",
      actionSubject: "Người khác / Đối phương (khách, sếp)",
      badgeColor: "emerald",
      icon: "Crown"
    },
    {
      id: "kenjougo",
      titleJa: "謙譲語",
      reading: "けんじょうご",
      titleVi: "Khiêm nhường ngữ",
      summaryVi: "Hạ thấp hành vi của bản thân hoặc người thuộc nhóm mình (công ty mình) để gián tiếp tôn kính đối phương.",
      actionSubject: "Bản thân / Người phe mình (nhân viên, công ty tôi)",
      badgeColor: "indigo",
      icon: "UserCheck"
    },
    {
      id: "teineigo",
      titleJa: "丁寧語",
      reading: "ていねいご",
      titleVi: "Lịch sự ngữ",
      summaryVi: "Cách diễn đạt lịch sự, trang nhã hướng tới người nghe (です, ます, でございます).",
      actionSubject: "Người nói thể hiện sự tôn trọng chung",
      badgeColor: "blue",
      icon: "Sparkles"
    },
    {
      id: "uchisoto",
      titleJa: "内・外の法則",
      reading: "うち・そとのほうそく",
      titleVi: "Nguyên tắc Trong - Ngoài",
      summaryVi: "Kim chỉ nam quan hệ công sở Nhật: Nói với khách hàng thì sếp công ty mình cũng là phe Trong (hạ mình).",
      actionSubject: "Ma trận quan hệ vị thế công sở",
      badgeColor: "purple",
      icon: "Compass"
    },
    {
      id: "special-verbs",
      titleJa: "特別敬語動詞",
      reading: "とくべつけいごどうし",
      titleVi: "Bảng động từ kính ngữ đặc biệt",
      summaryVi: "Bảng tra cứu các động từ biến đổi bất quy tắc cốt lõi thường xuất hiện trong đề thi JLPT N3.",
      actionSubject: "Bảng tra cứu nhanh",
      badgeColor: "amber",
      icon: "Table"
    }
  ]
};

// 2. sonkeigo.json
const SONKEIGO = {
  id: "sonkeigo",
  titleJa: "尊敬語（そんけいご）",
  titleVi: "Tôn Kính Ngữ",
  conceptVi: "Tôn kính ngữ dùng để bày tỏ sự kính trọng đối với NGƯỜI ĐƯỢC TÔN KÍNH (người nghe hoặc nhân vật thứ ba có địa vị cao hơn). Chủ thể thực hiện hành động LUÔN LÀ NGƯỜI ĐÓ, tuyệt đối không bao giờ là bản thân.",
  formulaRules: [
    {
      nameVi: "Mẫu chuẩn 1: お + Vます (bỏ ます) + になる",
      usageVi: "Áp dụng cho động từ thuần Nhật (Nhóm I và Nhóm II).",
      formula: "お ＋ V(bỏ ます) ＋ になる",
      examples: [
        { base: "読む (よむ)", result: "お読みになる (およみになる)", meaningVi: "đọc → ngài/thầy đọc" },
        { base: "帰る (かえる)", result: "お帰りになる (おかえりになる)", meaningVi: "về → ngài/sếp về" },
        { base: "待つ (まつ)", result: "お待ちになる (おまちになる)", meaningVi: "đợi → quý khách đợi" }
      ]
    },
    {
      nameVi: "Mẫu chuẩn 2: ご + Danh động từ (gốc Hán) + になる / なさる",
      usageVi: "Áp dụng cho các danh động từ gốc Hán (Suru-verb).",
      formula: "ご ＋ Noun(Hán tự) ＋ になる / なさる",
      examples: [
        { base: "利用する", result: "ご利用になる (ごりようになる)", meaningVi: "sử dụng → quý khách sử dụng" },
        { base: "連絡する", result: "ご連絡になる / ご連絡なさる", meaningVi: "liên lạc → sếp liên lạc" },
        { base: "出席する", result: "ご出席になる (ごしゅっせきになる)", meaningVi: "tham dự → ngài tham dự" }
      ]
    },
    {
      nameVi: "Mẫu nhờ vả lịch sự: お / ご ＋ V(bỏ ます) ＋ ください",
      usageVi: "Yêu cầu hoặc mời đối phương làm gì đó một cách tôn trọng.",
      formula: "お / ご ＋ V ＋ ください",
      examples: [
        { base: "座る (すわる)", result: "お座りください (おすわりください)", meaningVi: "Mời ngài ngồi ạ" },
        { base: "確認する", result: "ご確認ください (ごかくにんください)", meaningVi: "Xin quý khách vui lòng xác nhận" }
      ]
    },
    {
      nameVi: "Mẫu chia dạng Bị động (受身形): 〜れる / 〜られる",
      usageVi: "Mức độ tôn kính nhẹ nhàng, tự nhiên trong giao tiếp thường ngày.",
      formula: "V受身形",
      examples: [
        { base: "書く (かく)", result: "書かれる (かかれる)", meaningVi: "thầy viết" },
        { base: "来る (くる)", result: "来られる (こられる)", meaningVi: "trưởng phòng đến" }
      ]
    }
  ],
  specialVerbs: [
    { base: "行く・来る・いる", sonkeigo: "いらっしゃる / おいでになる", meaningVi: "đi / đến / ở" },
    { base: "食べる・飲む", sonkeigo: "召し上がる (めしあがる)", meaningVi: "ăn / uống" },
    { base: "言う", sonkeigo: "おっしゃる", meaningVi: "nói" },
    { base: "見る", sonkeigo: "ご覧になる (ごらんになる)", meaningVi: "xem, nhìn" },
    { base: "する", sonkeigo: "なさる", meaningVi: "làm" },
    { base: "知っている", sonkeigo: "ご存じです (ごぞんじです)", meaningVi: "biết" },
    { base: "くれる", sonkeigo: "くださる", meaningVi: "cho (tôi)" }
  ],
  situationsVi: [
    {
      title: "Hỏi sếp đã đọc báo cáo chưa",
      context: "Nhân viên hỏi Trưởng phòng",
      correctJa: "部長、先ほどの企画書はお読みになりましたか。",
      explanationVi: "Chủ ngữ là 部長 (sếp), hành động đọc là của sếp nên dùng tôn kính ngữ お読みになりましたか."
    },
    {
      title: "Mời khách uống cà phê",
      context: "Tiếp đón khách hàng đối tác",
      correctJa: "どうぞ、温かいうちに召し上がってください。",
      explanationVi: "Khách là người uống, dùng 召し上がる thay cho 飲む."
    }
  ],
  commonMistakesVi: "1. Dùng tôn kính ngữ cho chính mình (Ví dụ nói: 私は召し上がりました - SAI nghiêm trọng).\n2. Kính ngữ kép (二重敬語): Đã dùng động từ đặc biệt lại thêm bị động (Ví dụ: おっしゃられた - SAI, chỉ dùng おっしゃいました)."
};

// 3. kenjougo.json
const KENJOUGO = {
  id: "kenjougo",
  titleJa: "謙譲語（けんじょうご）",
  titleVi: "Khiêm Nhường Ngữ",
  conceptVi: "Khiêm nhường ngữ dùng để hạ thấp hành động của BẢN THÂN hoặc NGƯỜI THUỘC NHÓM MÌNH (người trong gia đình, đồng nghiệp công ty mình) khi hành động đó hướng tới người có vị thế cao hơn, qua đó gián tiếp thể hiện sự tôn kính đối phương.",
  formulaRules: [
    {
      nameVi: "Mẫu Khiêm nhường I: お + Vます (bỏ ます) + する / いたす",
      usageVi: "Hành động của mình hướng tới người nghe hoặc người được kính trọng.",
      formula: "お ＋ V(bỏ ます) ＋ します / いたします",
      examples: [
        { base: "持つ (もつ)", result: "お持ちします (おもちします)", meaningVi: "Tôi xin phép xách/mang giúp ngài" },
        { base: "案内する", result: "ご案内いたします (ごあんないいたします)", meaningVi: "Tôi xin phép hướng dẫn quý khách" },
        { base: "連絡する", result: "ご連絡いたします (ごれんらくいたします)", meaningVi: "Tôi sẽ liên lạc lại với ngài sau ạ" }
      ]
    },
    {
      nameVi: "Mẫu Khiêm nhường II (Đinh trọng ngữ): Hành động của mình không trực tiếp hướng tới ai",
      usageVi: "Hạ thấp lời nói của mình để thể hiện sự khiêm nhã, khiêm tốn trước người nghe.",
      formula: "申す, 参る, おる, いたす",
      examples: [
        { base: "名前は〜と言う", result: "田中と申します (たなかともうします)", meaningVi: "Tôi tên là Tanaka" },
        { base: "行く / 来る", result: "ただいま参りました (参る)", meaningVi: "Tôi vừa mới đến nơi ạ" },
        { base: "いる", result: "事務所におります (おる)", meaningVi: "Tôi đang ở văn phòng" }
      ]
    }
  ],
  specialVerbs: [
    { base: "行く・来る", kenjougo: "伺う (うかがう: đến chỗ ngài) / 参る (まいる)", meaningVi: "đi / đến" },
    { base: "いる", kenjougo: "おる", meaningVi: "ở, có mặt" },
    { base: "言う", kenjougo: "申す (もうす) / 申し上げる (もうしあげる)", meaningVi: "nói" },
    { base: "見る", kenjougo: "拝見する (はいけんする)", meaningVi: "xem, đọc (thư/tài liệu)" },
    { base: "食べる・飲む・もらう", kenjougo: "いただく", meaningVi: "ăn / uống / nhận từ ngài" },
    { base: "する", kenjougo: "いたす", meaningVi: "làm" },
    { base: "聞く・訪問する", kenjougo: "伺う (うかがう)", meaningVi: "hỏi ngài / đến thăm ngài" },
    { base: "会う", kenjougo: "お目にかかる (おめにかかる)", meaningVi: "gặp ngài" },
    { base: "知っている", kenjougo: "存じております / 存じ上げております", meaningVi: "tôi biết" },
    { base: "あげる", kenjougo: "差し上げる (さしあげる)", meaningVi: "tặng, đưa cho ngài" }
  ],
  situationsVi: [
    {
      title: "Xem tài liệu của khách gửi",
      context: "Email gửi đối tác",
      correctJa: "送っていただいた資料を拝見いたしました。",
      explanationVi: "Hành động xem là của chính mình (tôi xem tài liệu của ngài gửi) nên dùng 拝見する."
    },
    {
      title: "Tự giới thiệu bản thân trong phỏng vấn",
      context: "Ứng viên nói với nhà tuyển dụng",
      correctJa: "グエンと申します。ベトナムから参りました。",
      explanationVi: "Hạ mình trước người nghe dùng 申す (nói tên) và 参る (đến từ)."
    }
  ],
  commonMistakesVi: "1. Dùng khiêm nhường ngữ cho khách hàng (Ví dụ: お客様が申されました - SAI, khách hàng nói phải là おっしゃいました).\n2. Nhầm 伺う (đến nơi đối phương để học hỏi/hỏi chuyện) với 参る (chỉ đi/đến đơn thuần)."
};

// 4. teineigo.json
const TEINEIGO = {
  id: "teineigo",
  titleJa: "丁寧語（ていねいご）",
  titleVi: "Lịch Sự Ngữ",
  conceptVi: "Lịch sự ngữ là cách nói lịch sự, tôn trọng người nghe bất kể vai vế, tạo nên phong thái trang nhã và chuẩn mực trong xã hội Nhật Bản.",
  formulaRules: [
    {
      nameVi: "Đuôi câu です / ます",
      usageVi: "Dùng ở cuối câu khẳng định, phủ định, câu hỏi.",
      formula: "Danh từ / Tính từ + です | Động từ + ます",
      examples: [
        { base: "行く", result: "行きます / 行きません / 行きました", meaningVi: "Đi / Không đi / Đã đi" },
        { base: "学生", result: "学生です / 学生ではありません", meaningVi: "Là học sinh" }
      ]
    },
    {
      nameVi: "Thể lịch sự cao cấp: でございます / ございます",
      usageVi: "Thay thế cho です và あります trong bối cảnh phục vụ khách hàng, thông báo lễ tân.",
      formula: "〜でございます (thay です) | 〜ございます (thay あります)",
      examples: [
        { base: "トイレはあちらです", result: "お手洗いはあちらでございます", meaningVi: "Nhà vệ sinh ở đằng kia ạ" },
        { base: "質問があります", result: "ご質問はございますか", meaningVi: "Quý khách có câu hỏi nào không ạ?" }
      ]
    },
    {
      nameVi: "Mỹ từ ngữ (美化語): Thêm お hoặc ご",
      usageVi: "Làm nhã nhặn từ ngữ:",
      formula: "お + từ thuần Nhật (和語) | ご + từ Hán (漢語)",
      examples: [
        { base: "水, 茶, 酒, 金", result: "お水, お茶, お酒, お金", meaningVi: "Nước, trà, rượu, tiền" },
        { base: "家族, 住所, 連絡", result: "ご家族, ご住所, ご連絡", meaningVi: "Gia đình, địa chỉ, liên lạc" }
      ]
    }
  ],
  situationsVi: [
    {
      title: "Lễ tân chào đón khách",
      context: "Khách sạn hoặc nhà hàng",
      correctJa: "いらっしゃいませ。本日のお席はこちらでございます。",
      explanationVi: "Dùng でございます thay cho です để tạo phong thái phục vụ cao cấp."
    }
  ],
  commonMistakesVi: "Gắn [お/ご] bừa bãi vào các từ vay mượn tiếng Anh Katakana (Không nói おビール, おトイレ; ngoại lệ hiếm hoi: おビール đôi khi dùng trong quán ăn nhưng không phải chuẩn)."
};

// 5. uchisoto.json
const UCHISOTO = {
  id: "uchisoto",
  titleJa: "内・外の法則（うち・そとのほうそく）",
  titleVi: "Nguyên Tắc 'Trong' & 'Ngoài' Trong Công Sở",
  conceptVi: "Đây là nguyên tắc then chốt nhất của kính ngữ Nhật Bản: Mối quan hệ thân sơ quyết định cách dùng từ, chứ không chỉ dựa vào tuổi tác hay chức vị đơn thuần.",
  matrix: [
    {
      group: "Phe TRONG (内 - Uchi)",
      members: "Bản thân, gia đình mình, đồng nghiệp cùng công ty, cấp dưới, và CẢ GIÁM ĐỐC CÔNG TY MÌNH khi giao tiếp với người ngoài.",
      rule: "LUÔN DÙNG KHIÊM NHƯỜNG NGỮ (hoặc cách gọi không kính ngữ) khi nói về họ trước mặt người ngoài."
    },
    {
      group: "Phe NGOÀI (外 - Soto)",
      members: "Khách hàng, đối tác công ty bạn, người ngoài xã hội, người không thuộc nhóm mình.",
      rule: "LUÔN DÙNG TÔN KÍNH NGỮ khi nói về hành động của họ."
    }
  ],
  goldenRuleVi: "KHI NÓI CHUYỆN VỚI NGƯỜI NGOÀI (KHÁCH HÀNG / ĐỐI TÁC): Mọi người trong công ty mình (kể cả Giám đốc, Trưởng phòng) đều trở thành phe TRONG (内). Vì vậy:\n1. BỎ toàn bộ chức danh và đuôi 様/さん (gọi là 'Tanaka', không gọi 'Tanaka Shachou').\n2. Dùng KHIÊM NHƯỜNG NGỮ cho hành động của sếp mình!",
  situationsVi: [
    {
      title: "Khách hàng gọi điện hỏi gặp Giám đốc công ty mình",
      context: "Nhân viên trả lời điện thoại của khách",
      wrongJa: "社長の田中様は外出していらっしゃいます。(SAI)",
      correctJa: "社長の田中は外出しております。(ĐÚNG)",
      explanationVi: "Đối với khách hàng ngoài công ty, Giám đốc Tanaka là người phe mình (内), phải bỏ đuôi kính ngữ và dùng khiêm nhường ngữ (外出しております)."
    },
    {
      title: "Báo cáo với khách hàng về tài liệu đồng nghiệp đã gửi",
      context: "Email gửi khách",
      correctJa: "弊社の担当の山田より、資料をお送りいたしました。",
      explanationVi: "Đồng nghiệp Yamada là phe Trong, dùng 弊社 (công ty chúng tôi) và お送りいたしました (khiêm nhường)."
    }
  ]
};

// 6. special-verbs.json
const SPECIAL_VERBS = {
  id: "special-verbs",
  titleJa: "特別敬語動詞一覧表",
  titleVi: "Bảng Động Từ Kính Ngữ Bất Quy Tắc Cốt Lõi",
  verbs: [
    {
      base: "行く (いく)",
      meaningVi: "đi",
      sonkeigo: "いらっしゃる ／ おいでになる",
      kenjougo: "伺う (うかがう - đến chỗ ngài) ／ 参る (まいる)",
      teineigo: "行きます"
    },
    {
      base: "来る (くる)",
      meaningVi: "đến",
      sonkeigo: "いらっしゃる ／ おいでになる",
      kenjougo: "参る (まいる)",
      teineigo: "来ます (きます)"
    },
    {
      base: "いる",
      meaningVi: "ở, có mặt",
      sonkeigo: "いらっしゃる",
      kenjougo: "おる",
      teineigo: "います"
    },
    {
      base: "言う (いう)",
      meaningVi: "nói",
      sonkeigo: "おっしゃる",
      kenjougo: "申す (もうす) ／ 申し上げる (もうしあげる)",
      teineigo: "言います"
    },
    {
      base: "見る (みる)",
      meaningVi: "xem, nhìn",
      sonkeigo: "ご覧になる (ごらんになる)",
      kenjougo: "拝見する (はいけんする)",
      teineigo: "見ます"
    },
    {
      base: "食べる・飲む",
      meaningVi: "ăn / uống",
      sonkeigo: "召し上がる (めしあがる)",
      kenjougo: "いただく",
      teineigo: "食べます ／ 飲みます"
    },
    {
      base: "する",
      meaningVi: "làm",
      sonkeigo: "なさる",
      kenjougo: "いたす",
      teineigo: "します"
    },
    {
      base: "聞く (きく)",
      meaningVi: "nghe, hỏi",
      sonkeigo: "お聞きになる (おききになる)",
      kenjougo: "伺う (うかがう) ／ 拝聴する (はいちょうする)",
      teineigo: "聞きます"
    },
    {
      base: "会う (あう)",
      meaningVi: "gặp gỡ",
      sonkeigo: "お会いになる",
      kenjougo: "お目にかかる (おめにかかる)",
      teineigo: "会います"
    },
    {
      base: "知っている",
      meaningVi: "biết",
      sonkeigo: "ご存じです (ごぞんじです)",
      kenjougo: "存じております ／ 存じ上げております",
      teineigo: "知っています"
    },
    {
      base: "もらう",
      meaningVi: "nhận được",
      sonkeigo: "— (đối phương cho mình: くださる)",
      kenjougo: "いただく",
      teineigo: "もらいます"
    },
    {
      base: "あげる",
      meaningVi: "cho, tặng",
      sonkeigo: "—",
      kenjougo: "差し上げる (さしあげる)",
      teineigo: "あげます"
    }
  ]
};

// Write files
fs.writeFileSync(path.join(targetDir, "index.json"), JSON.stringify(KEIGO_INDEX, null, 2), "utf8");
fs.writeFileSync(path.join(targetDir, "sonkeigo.json"), JSON.stringify(SONKEIGO, null, 2), "utf8");
fs.writeFileSync(path.join(targetDir, "kenjougo.json"), JSON.stringify(KENJOUGO, null, 2), "utf8");
fs.writeFileSync(path.join(targetDir, "teineigo.json"), JSON.stringify(TEINEIGO, null, 2), "utf8");
fs.writeFileSync(path.join(targetDir, "uchisoto.json"), JSON.stringify(UCHISOTO, null, 2), "utf8");
fs.writeFileSync(path.join(targetDir, "special-verbs.json"), JSON.stringify(SPECIAL_VERBS, null, 2), "utf8");

console.log("Đã tạo thành công bộ dữ liệu Kính ngữ & Khiêm nhường ngữ (6 file) tại " + targetDir);
