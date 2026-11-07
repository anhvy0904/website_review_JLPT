import fs from "fs";
import path from "path";

const targetDir = path.join(process.cwd(), "public", "data", "learning", "quizzes");

const VERB_QUIZZES = [
  {
    id: "q-verb-001",
    formId: "te",
    promptJa: "すみません、そのペンをちょっと＿＿＿ください。",
    promptVi: "Xin lỗi, hãy cho tôi mượn cây bút đó một chút.",
    options: [
      { id: "1", text: "貸して (かして)" },
      { id: "2", text: "貸って (かって)" },
      { id: "3", text: "貸いで (かいで)" },
      { id: "4", text: "貸ちて (かちて)" }
    ],
    correctOptionId: "1",
    explanationVi: "Động từ gốc là 貸す (かす) thuộc Nhóm I, đuôi [す] biến âm thành [して] → 貸して. Mẫu câu yêu cầu lịch sự là 〜てください.",
    distractorReasonsVi: {
      "1": "ĐÚNG: 貸す (す) → 貸して.",
      "2": "SAI: [って] chỉ dùng cho đuôi う, つ, る.",
      "3": "SAI: [いで] chỉ dùng cho đuôi ぐ.",
      "4": "SAI: Tiếng Nhật không có biến âm [ちて]."
    }
  },
  {
    id: "q-verb-002",
    formId: "te",
    promptJa: "昨日、友だちと映画館へ＿＿＿、その後カフェに行きました。",
    promptVi: "Hôm qua tôi đi đến rạp chiếu phim cùng bạn, sau đó đã đi cà phê.",
    options: [
      { id: "1", text: "行いて (いいて)" },
      { id: "2", text: "行って (いって)" },
      { id: "3", text: "行いで (いいで)" },
      { id: "4", text: "行して (いして)" }
    ],
    correctOptionId: "2",
    explanationVi: "Động từ 行く (いく) là NGOẠI LỆ ĐẶC BIỆT của Nhóm I. Dù đuôi [く] thường đổi thành [いて] (như 書いて), nhưng riêng 行く bắt buộc phải biến âm thành [行って].",
    distractorReasonsVi: {
      "1": "SAI: Bẫy chia theo quy tắc thường của đuôi く.",
      "2": "ĐÚNG: 行く là ngoại lệ biến âm thành 行って.",
      "3": "SAI: [いで] dùng cho đuôi ぐ (泳ぐ → 泳いで).",
      "4": "SAI: [して] dùng cho đuôi す."
    }
  },
  {
    id: "q-verb-003",
    formId: "potential",
    promptJa: "田中さんは刺身が＿＿＿か。",
    promptVi: "Anh Tanaka có thể ăn được món sashimi không?",
    options: [
      { id: "1", text: "食べられる (たべられる)" },
      { id: "2", text: "食べれる (たべれる)" },
      { id: "3", text: "食べれる (たべる)" },
      { id: "4", text: "食べさせる (たべさせる)" }
    ],
    correctOptionId: "1",
    explanationVi: "Động từ 食べる (たべる) thuộc Nhóm II (一段), thể khả năng chuẩn tắc theo ngữ pháp thi JLPT là bỏ [る] thêm [られる] → 食べられる.",
    distractorReasonsVi: {
      "1": "ĐÚNG: Thể khả năng chuẩn mực của Nhóm II.",
      "2": "CHÚ Ý: 食べれる là hiện tượng 'ら抜き' trong văn nói giao tiếp, nhưng đề thi JLPT N3 yêu cầu chuẩn ngữ pháp là 食べられる.",
      "3": "SAI: 食べる là thể từ điển, không biểu đạt khả năng.",
      "4": "SAI: 食べさせる là thể sai khiến ('bắt ăn / cho ăn')."
    }
  },
  {
    id: "q-verb-004",
    formId: "causative-passive",
    promptJa: "昨日の飲み会で、先輩に無理にお酒を＿＿＿。",
    promptVi: "Trong buổi nhậu hôm qua, tôi đã bị tiền bối ép uống rượu.",
    options: [
      { id: "1", text: "飲ませました (のませました)" },
      { id: "2", text: "飲まされました (のまされました)" },
      { id: "3", text: "飲まれました (のまれました)" },
      { id: "4", text: "飲まさせられました (のまさせられました)" }
    ],
    correctOptionId: "2",
    explanationVi: "Động từ 飲む (Nhóm I) khi diễn đạt ý 'bị người khác ép buộc làm điều mình không muốn' dùng thể bị động sai khiến rút gọn: 飲む → 飲まされる (quá khứ: 飲まされました).",
    distractorReasonsVi: {
      "1": "SAI: 飲ませました là thể sai khiến (chính mình cho/bắt người khác uống).",
      "2": "ĐÚNG: Bị động sai khiến thể hiện sự miễn cưỡng, bị ép buộc.",
      "3": "SAI: 飲まれました là thể bị động đơn thuần.",
      "4": "SAI: Thừa âm, dạng đầy đủ là 飲ませられました, rút gọn là 飲まされました."
    }
  },
  {
    id: "q-verb-005",
    formId: "causative-passive",
    promptJa: "先生の前で、自分の失敗について詳しく＿＿＿。",
    promptVi: "Tôi đã bị bắt phải nói chi tiết về thất bại của mình trước mặt thầy giáo.",
    options: [
      { id: "1", text: "話さされました (はなさされました)" },
      { id: "2", text: "話させられました (はなさせられました)" },
      { id: "3", text: "話されました (はなされました)" },
      { id: "4", text: "話しました (はなしました)" }
    ],
    correctOptionId: "2",
    explanationVi: "QUY TẮC ĐẶC BIỆT: Động từ kết thúc bằng đuôi [す] như 話す (はなす) tuyệt đối KHÔNG có dạng rút gọn [さされる], bắt buộc phải dùng dạng đầy đủ [させられる] → 話させられました.",
    distractorReasonsVi: {
      "1": "SAI: Lỗi sai kinh điển trong N3! Động từ đuôi す không bao giờ chia thành さされる.",
      "2": "ĐÚNG: Dạng chuẩn duy nhất cho đuôi す là させられる.",
      "3": "SAI: Đây là thể bị động thuần túy.",
      "4": "SAI: Thể quá khứ thông thường, không biểu đạt sự ép buộc."
    }
  },
  {
    id: "q-verb-006",
    formId: "ba",
    promptJa: "外国語は毎日練習＿＿＿、上手になりませんよ。",
    promptVi: "Ngoại ngữ nếu không luyện tập hàng ngày thì sẽ không giỏi được đâu nhé.",
    options: [
      { id: "1", text: "しなければ" },
      { id: "2", text: "すれば" },
      { id: "3", text: "しないば" },
      { id: "4", text: "するれば" }
    ],
    correctOptionId: "1",
    explanationVi: "Vế sau là 上手になりません (phủ định), nên vế trước cần điều kiện phủ định 'Nếu không làm...': する → ない形: しない → thể ば: しなければ.",
    distractorReasonsVi: {
      "1": "ĐÚNG: Phủ định điều kiện 'Nếu không làm thì không giỏi'.",
      "2": "SAI NGHĨA: すれば là khẳng định ('Nếu làm thì không giỏi' - vô lý).",
      "3": "SAI NGỮ PHÁP: Không có dạng ないば.",
      "4": "SAI: Sai cách chia của động từ bất quy tắc する."
    }
  }
];

const KEIGO_QUIZZES = [
  {
    id: "q-keigo-001",
    topicId: "sonkeigo",
    promptJa: "お客様、お荷物は私が＿＿＿。",
    promptVi: "Kính thưa quý khách, hành lý để tôi xin phép cầm giúp ạ.",
    options: [
      { id: "1", text: "お持ちになります" },
      { id: "2", text: "お持ちします" },
      { id: "3", text: "持たれます" },
      { id: "4", text: "お持ちなさいます" }
    ],
    correctOptionId: "2",
    explanationVi: "Chủ ngữ là 私 (tôi). Hành động xách hành lý là của bản thân hướng tới phục vụ khách hàng, do đó BẮT BUỘC dùng KHIÊM NHƯỜNG NGỮ: お + Vます (bỏ ます) + します → お持ちします.",
    distractorReasonsVi: {
      "1": "SAI: お〜になる là TÔN KÍNH NGỮ, không được dùng cho hành động của chính mình.",
      "2": "ĐÚNG: Khiêm nhường ngữ I (hạ mình để nâng khách).",
      "3": "SAI: Thể bị động tôn kính, không dùng cho hành vi của bản thân.",
      "4": "SAI: Mẫu tôn kính ngữ, chỉ dùng khi khách tự cầm."
    }
  },
  {
    id: "q-keigo-002",
    topicId: "uchisoto",
    promptJa: "(Khách hàng gọi điện hỏi gặp Trưởng phòng Yamada công ty bạn) Bạn trả lời: 'あいにく山田は今、席を＿＿＿。'",
    promptVi: "Thật không may, anh Yamada hiện tại đang rời khỏi chỗ ngồi ạ.",
    options: [
      { id: "1", text: "外していらっしゃいます" },
      { id: "2", text: "外しております" },
      { id: "3", text: "外されております" },
      { id: "4", text: "お外しになります" }
    ],
    correctOptionId: "2",
    explanationVi: "NGUYÊN TẮC TRONG - NGOÀI (内・外): Khi nói chuyện với khách hàng bên ngoài (外), thì sếp công ty mình (Trưởng phòng Yamada) thuộc phe TRONG (内). Bắt buộc gọi trống không '山田' (không thêm 部長 hay 様) và dùng KHIÊM NHƯỜNG NGỮ '外しております' (ngoài ra おる là khiêm nhường của いる).",
    distractorReasonsVi: {
      "1": "SAI: いらっしゃる là Tôn kính ngữ, không được dùng nâng hành động của người cùng công ty trước mặt khách hàng.",
      "2": "ĐÚNG: Khiêm nhường ngữ chuẩn mực trong giao dịch công sở Nhật Bản.",
      "3": "SAI: Lẫn lộn bị động tôn kính và khiêm nhường.",
      "4": "SAI: Mẫu tôn kính ngữ お〜になる."
    }
  },
  {
    id: "q-keigo-003",
    topicId: "kenjougo",
    promptJa: "先生、昨日メールでお送りくださった資料を＿＿＿。",
    promptVi: "Thưa thầy, em đã xem tài liệu thầy gửi qua email hôm qua rồi ạ.",
    options: [
      { id: "1", text: "ご覧になりました" },
      { id: "2", text: "拝見いたしました" },
      { id: "3", text: "見られました" },
      { id: "4", text: "お見せになりました" }
    ],
    correctOptionId: "2",
    explanationVi: "Hành động xem tài liệu là của học sinh (em xem tài liệu của thầy), do đó phải dùng KHIÊM NHƯỜNG NGỮ của 見る là 拝見する (hoặc 拝見いたしました).",
    distractorReasonsVi: {
      "1": "SAI: ご覧になる là Tôn kính ngữ, chỉ dùng khi thầy xem.",
      "2": "ĐÚNG: 拝見する là khiêm nhường ngữ đặc biệt của 見る.",
      "3": "SAI: Thể bị động tôn kính, không dùng cho hành vi của bản thân.",
      "4": "SAI: お見せになる có nghĩa là 'thầy cho ai xem'."
    }
  },
  {
    id: "q-keigo-004",
    topicId: "sonkeigo",
    promptJa: "社長、本日の会議の資料はもう＿＿＿か。",
    promptVi: "Thưa Giám đốc, ngài đã xem qua tài liệu cuộc họp hôm nay chưa ạ?",
    options: [
      { id: "1", text: "ご覧になりました" },
      { id: "2", text: "拝見しました" },
      { id: "3", text: "見ました" },
      { id: "4", text: "拝見なさいました" }
    ],
    correctOptionId: "1",
    explanationVi: "Hành động xem là của 社長 (Giám đốc). Với sếp, phải dùng TÔN KÍNH NGỮ đặc biệt của 見る là ご覧になる → ご覧になりましたか.",
    distractorReasonsVi: {
      "1": "ĐÚNG: Tôn kính ngữ đặc biệt của 見る.",
      "2": "SAI: 拝見する là Khiêm nhường ngữ, không được dùng cho hành động của sếp.",
      "3": "SAI: 見ました là lịch sự thường, chưa đủ mức độ tôn kính với Giám đốc.",
      "4": "SAI: Ghép sai ngữ pháp giữa khiêm nhường ngữ 拝見 và tôn kính なさる."
    }
  },
  {
    id: "q-keigo-005",
    topicId: "special-verbs",
    promptJa: "「明日、先生のお宅に＿＿＿つもりです。」",
    promptVi: "'Ngày mai, tôi dự định sẽ đến thăm nhà của thầy giáo.'",
    options: [
      { id: "1", text: "いらっしゃる" },
      { id: "2", text: "伺う (うかがう)" },
      { id: "3", text: "おいでになる" },
      { id: "4", text: "お参りする" }
    ],
    correctOptionId: "2",
    explanationVi: "Hành động đi đến nơi của đối phương được tôn kính (nhà thầy giáo) do chính người nói thực hiện, do đó dùng KHIÊM NHƯỜNG NGỮ 伺う (うかがう).",
    distractorReasonsVi: {
      "1": "SAI: いらっしゃる là Tôn kính ngữ.",
      "2": "ĐÚNG: 伺う dùng khi mình đến nơi của người trên hoặc người được tôn trọng.",
      "3": "SAI: おいでになる là Tôn kính ngữ.",
      "4": "SAI: お参りする dùng cho đi lễ đền chùa."
    }
  }
];

fs.writeFileSync(path.join(targetDir, "verb-forms-quizzes.json"), JSON.stringify(VERB_QUIZZES, null, 2), "utf8");
fs.writeFileSync(path.join(targetDir, "keigo-quizzes.json"), JSON.stringify(KEIGO_QUIZZES, null, 2), "utf8");

console.log("Đã tạo thành công 2 bộ câu hỏi trắc nghiệm tương tác tại " + targetDir);
