import fs from "fs";
import path from "path";

const VERB_LESSONS = [
  {
    id: "te",
    formId: "te",
    titleJa: "て形",
    reading: "てけい",
    titleVi: "Thể て",
    conceptVi: "Thể て là một trong những thể căn bản và quan trọng nhất trong tiếng Nhật, đóng vai trò như liên từ nối các vế câu hoặc làm nền tảng kết hợp với các trợ động từ.",
    whenToUseVi: "Dùng để: (1) Nối các hành động xảy ra theo trình tự thời gian; (2) Kết hợp 〜ている (đang diễn ra hoặc duy trì trạng thái); (3) Yêu cầu lịch sự 〜てください; (4) Xin phép 〜てもいいですか; (5) Cấm đoán 〜てはいけません.",
    nuanceVi: "Khi dùng đứng một mình ở cuối câu giao tiếp thân mật, thể て biểu thị lời yêu cầu nhẹ nhàng hoặc hỏi lý do.",
    rulesByGroup: {
      godan: "Chia theo đuôi chữ Hán:\n• う, つ, る → って\n• む, ぶ, ぬ → んで\n• く → いて (Ngoại lệ: 行く → 行って)\n• ぐ → いで\n• す → して",
      ichidan: "Bỏ đuôi る, thêm て (Ví dụ: 食べる → 食べて, 見る → 見て)",
      irregular: "• する → して\n• 来る (くる) → 来て (きて)"
    },
    soundChanges: [
      { ending: "う / つ / る", result: "って", examples: "買う→買って, 待つ→待って, 取る→取って" },
      { ending: "む / ぶ / ぬ", result: "んで", examples: "読む→読んで, 遊ぶ→遊んで, 死ぬ→死んで" },
      { ending: "く", result: "いて", examples: "書く→書いて, 聞く→聞いて" },
      { ending: "ぐ", result: "いで", examples: "泳ぐ→泳いで, 急ぐ→急いで" },
      { ending: "す", result: "して", examples: "話す→話して, 出す→出して" }
    ],
    exceptions: [
      { base: "行く", reading: "いく", result: "行って", resultReading: "いって", note: "Đuôi [く] thông thường đổi thành [いて], nhưng riêng 行く phải biến âm thành [行って]." }
    ],
    verbExamples: [
      { kanji: "書く", reading: "かく", group: "Nhóm I", result: "書いて", resultReading: "かいて", meaningVi: "viết → viết và..." },
      { kanji: "食べる", reading: "たべる", group: "Nhóm II", result: "食べて", resultReading: "たべて", meaningVi: "ăn → ăn rồi..." },
      { kanji: "する", reading: "する", group: "Nhóm III", result: "して", resultReading: "して", meaningVi: "làm → làm rồi..." },
      { kanji: "来る", reading: "くる", group: "Nhóm III", result: "来て", resultReading: "きて", meaningVi: "đến → đến và..." }
    ],
    sentenceExamples: [
      { ja: "朝起きて、顔を洗って、朝ご飯を食べました。", furigana: [{ text: "朝", ruby: "あさ" }, { text: "起", ruby: "お" }, { text: "顔", ruby: "かお" }, { text: "洗", ruby: "あら" }, { text: "朝", ruby: "あさ" }, { text: "飯", ruby: "はん" }, { text: "食", ruby: "た" }], vi: "Sáng nay tôi thức dậy, rửa mặt rồi ăn bữa sáng." },
      { ja: "今、日本語の文法を勉強しています。", furigana: [{ text: "今", ruby: "いま" }, { text: "日本", ruby: "にほん" }, { text: "語", ruby: "ご" }, { text: "文法", ruby: "ぶんぽう" }, { text: "勉強", ruby: "べんきょう" }], vi: "Bây giờ tôi đang học ngữ pháp tiếng Nhật." }
    ],
    commonMistakesVi: "Nhầm lẫn giữa đuôi [ぐ → いで] và [く → いて]. Quên ngoại lệ 行く (nhiều người viết sai thành 行いて). Nhầm các động từ Nhóm I kết thúc bằng [る] như 帰る (phải là 帰って, không phải 帰て)."
  },
  {
    id: "ta",
    formId: "ta",
    titleJa: "た形",
    reading: "たけい",
    titleVi: "Thể た",
    conceptVi: "Thể た là thể quá khứ dạng ngắn (thông thường) của động từ, có quy tắc biến âm hoàn toàn tương ứng với thể て.",
    whenToUseVi: "Dùng để: (1) Nói về hành động đã hoàn tất trong quá khứ ở văn phong thân mật; (2) Biểu đạt kinh nghiệm 〜たことがある; (3) Liệt kê hành động tiêu biểu 〜たり〜たりする; (4) Sau khi làm việc gì 〜た後で; (5) Đưa ra lời khuyên 〜たほうがいい.",
    nuanceVi: "Trong văn thân mật, thể た thay thế cho 〜ました. Khi nói với chính mình (tự nhủ), thể た thể hiện sự nhận ra hoặc nhớ ra điều gì đó (あった！ - Có đây rồi!).",
    rulesByGroup: {
      godan: "Quy tắc tương tự thể て nhưng thay [て/で] bằng [た/だ]:\n• う, つ, る → った\n• む, ぶ, ぬ → んだ\n• く → いた (Ngoại lệ: 行く → 行った)\n• ぐ → いだ\n• す → した",
      ichidan: "Bỏ đuôi る, thêm た (Ví dụ: 食べる → 食べた, 見る → 見た)",
      irregular: "• する → した\n• 来る (くる) → 来た (きた)"
    },
    soundChanges: [
      { ending: "う / つ / る", result: "った", examples: "買った, 待った, 取った" },
      { ending: "む / ぶ / ぬ", result: "んだ", examples: "読んだ, 遊んだ, 死んだ" },
      { ending: "く", result: "いた", examples: "書いた, 聞いた" },
      { ending: "ぐ", result: "いだ", examples: "泳いだ, 急いだ" },
      { ending: "す", result: "した", examples: "話した, 出した" }
    ],
    exceptions: [
      { base: "行く", reading: "いく", result: "行った", resultReading: "いった", note: "Ngoại lệ: 行く biến âm thành 行った." }
    ],
    verbExamples: [
      { kanji: "書く", reading: "かく", group: "Nhóm I", result: "書いた", resultReading: "かいた", meaningVi: "viết → đã viết" },
      { kanji: "食べる", reading: "たべる", group: "Nhóm II", result: "食べた", resultReading: "たべた", meaningVi: "ăn → đã ăn" },
      { kanji: "する", reading: "する", group: "Nhóm III", result: "した", resultReading: "した", meaningVi: "làm → đã làm" },
      { kanji: "来る", reading: "くる", group: "Nhóm III", result: "来た", resultReading: "きた", meaningVi: "đến → đã đến" }
    ],
    sentenceExamples: [
      { ja: "日本へ行ったことがありますか。", furigana: [{ text: "日本", ruby: "にほん" }, { text: "行", ruby: "い" }], vi: "Bạn đã từng đi Nhật Bản lần nào chưa?" },
      { ja: "薬を飲んだほうがいいですよ。", furigana: [{ text: "薬", ruby: "くすり" }, { text: "飲", ruby: "の" }], vi: "Bạn nên uống thuốc đi nhé." }
    ],
    commonMistakesVi: "Nhầm đuôi đục [んだ, いだ] với đuôi thanh [った, いた]. Viết sai dạng kinh nghiệm thành thể từ điển (phải là 〜たことがある, không phải 〜ることがある)."
  },
  {
    id: "nai",
    formId: "nai",
    titleJa: "ない形",
    reading: "ないけい",
    titleVi: "Thể phủ định ない",
    conceptVi: "Thể ない là dạng phủ định ngắn (thông thường) của động từ trong hiện tại và tương lai.",
    whenToUseVi: "Dùng để: (1) Phủ định thân mật thay cho 〜ません; (2) Yêu cầu đừng làm gì 〜ないでください; (3) Bắt buộc phải làm 〜なければならない; (4) Không cần phải làm 〜なくてもいい; (5) Giữ nguyên trạng thái 〜ないで.",
    nuanceVi: "Thể hiện sự phủ định trực tiếp trong giao tiếp hàng ngày; là nền tảng cho nhiều cấu trúc ngữ pháp điều kiện và nghĩa vụ trong N3.",
    rulesByGroup: {
      godan: "Chuyển âm cuối hàng [u] sang hàng [a] tương ứng rồi thêm ない.\nĐặc biệt: Đuôi [う] chuyển thành [わ] (Ví dụ: 買う → 買わない).",
      ichidan: "Bỏ đuôi る, thêm ない (Ví dụ: 食べる → 食べない, 見る → 見ない)",
      irregular: "• する → しない\n• 来る (くる) → 来ない (こない - lưu ý đổi cách đọc Kanji thành 'ko')\n• Ngoại lệ từ vựng: ある → ない (không phải あらない)"
    },
    soundChanges: [
      { ending: "う", result: "わない", examples: "買う → 買わない, 会う → 会わない" },
      { ending: "く / ぐ", result: "かない / がない", examples: "書く → 書かない, 泳ぐ → 泳がない" },
      { ending: "す", result: "さない", examples: "話す → 話さない, 出す → 出さない" },
      { ending: "つ", result: "たない", examples: "待つ → 待たない" },
      { ending: "ぬ / ぶ / む", result: "なない / ばない / まない", examples: "死ぬ → 死なない, 呼ぶ → 呼ばない, 読む → 読まない" },
      { ending: "る", result: "らない", examples: "取る → 取らない, 帰る → 帰らない" }
    ],
    exceptions: [
      { base: "ある", reading: "ある", result: "ない", resultReading: "ない", note: "Động từ ある có dạng phủ định là ない, không bao giờ dùng あらない." },
      { base: "来る", reading: "くる", result: "来ない", resultReading: "こない", note: "Cách đọc chữ Hán đổi từ [く] sang [こ]." }
    ],
    verbExamples: [
      { kanji: "買う", reading: "かう", group: "Nhóm I", result: "買わない", resultReading: "かわない", meaningVi: "mua → không mua" },
      { kanji: "食べる", reading: "たべる", group: "Nhóm II", result: "食べない", resultReading: "たべない", meaningVi: "ăn → không ăn" },
      { kanji: "する", reading: "する", group: "Nhóm III", result: "しない", resultReading: "しない", meaningVi: "làm → không làm" },
      { kanji: "来る", reading: "くる", group: "Nhóm III", result: "来ない", resultReading: "こない", meaningVi: "đến → không đến" }
    ],
    sentenceExamples: [
      { ja: "ここで写真を撮らないでください。", furigana: [{ text: "写真", ruby: "しゃしん" }, { text: "撮", ruby: "と" }], vi: "Xin vui lòng không chụp ảnh ở đây." },
      { ja: "明日は早く起きなければなりません。", furigana: [{ text: "明日", ruby: "あした" }, { text: "早", ruby: "はや" }, { text: "起", ruby: "お" }], vi: "Ngày mai tôi phải dậy sớm." }
    ],
    commonMistakesVi: "Đổi đuôi [う] thành [あない] thay vì [わない] (sai: かあない, đúng: かわない). Đọc sai chữ 来 trong 来ない thành くない thay vì こない."
  },
  {
    id: "dictionary",
    formId: "dictionary",
    titleJa: "辞書形",
    reading: "じしょけい",
    titleVi: "Thể từ điển",
    conceptVi: "Thể từ điển (nguyên mẫu) là hình thức cơ bản nhất của động từ, xuất hiện trong từ điển, tất cả động từ tiếng Nhật đều kết thúc bằng nguyên âm hàng [u].",
    whenToUseVi: "Dùng để: (1) Nói khẳng định hiện tại/tương lai ở văn phong thông thường; (2) Khả năng 〜ことができる; (3) Sở thích 〜ことです; (4) Trước khi làm gì 〜前に; (5) Bổ nghĩa cho danh từ đứng sau.",
    nuanceVi: "Văn phong thân mật, tự nhiên. Lưu ý: Không dùng ký hiệu 'Vる' làm công thức chung vì động từ Nhóm I có thể kết thúc bằng く, す, つ, む, v.v.",
    rulesByGroup: {
      godan: "Kết thúc bằng một trong 9 âm hàng [u]: う, く, ぐ, す, つ, ぬ, ぶ, む, る.",
      ichidan: "Luôn kết thúc bằng [る], trước [る] là nguyên âm hàng [i] hoặc [e].",
      irregular: "• する\n• 来る (くる)"
    },
    soundChanges: [],
    exceptions: [],
    verbExamples: [
      { kanji: "書く", reading: "かく", group: "Nhóm I", result: "書く", resultReading: "かく", meaningVi: "viết" },
      { kanji: "食べる", reading: "たべる", group: "Nhóm II", result: "食べる", resultReading: "たべる", meaningVi: "ăn" },
      { kanji: "する", reading: "する", group: "Nhóm III", result: "する", resultReading: "する", meaningVi: "làm" },
      { kanji: "来る", reading: "くる", group: "Nhóm III", result: "来る", resultReading: "くる", meaningVi: "đến" }
    ],
    sentenceExamples: [
      { ja: "私の趣味は本を読むことです。", furigana: [{ text: "私", ruby: "わたし" }, { text: "趣味", ruby: "しゅみ" }, { text: "本", ruby: "ほん" }, { text: "読", ruby: "よ" }], vi: "Sở thích của tôi là đọc sách." },
      { ja: "寝る前に、日記を書きます。", furigana: [{ text: "寝", ruby: "ね" }, { text: "前", ruby: "まえ" }, { text: "日記", ruby: "にっき" }, { text: "書", ruby: "か" }], vi: "Trước khi đi ngủ, tôi viết nhật ký." }
    ],
    commonMistakesVi: "Nhầm tưởng mọi động từ kết thúc bằng [る] đều thuộc Nhóm II (ví dụ 帰る, 走る, 知る, 切る là Nhóm I)."
  },
  {
    id: "ba",
    formId: "ba",
    titleJa: "ば形",
    reading: "ばけい",
    titleVi: "Thể điều kiện ば",
    conceptVi: "Thể điều kiện ば diễn đạt giả định 'Nếu điều kiện A xảy ra thì kết quả B sẽ xảy ra'.",
    whenToUseVi: "Dùng để: (1) Đưa ra giả định thuận lợi hoặc điều kiện tất yếu; (2) Mẫu so sánh tiến triển 'Càng... càng...' 〜ば〜ほど; (3) Đưa ra lời khuyên hoặc gợi ý 〜ばいいですか.",
    nuanceVi: "Mang sắc thái khách quan, giả thuyết logic hơn so với たら (たら thiên về hành động cụ thể trong quá khứ/tương lai).",
    rulesByGroup: {
      godan: "Chuyển đuôi hàng [u] sang hàng [e] tương ứng + ば (Ví dụ: 書く → 書けば, 買う → 買えば, 話す → 話せば).",
      ichidan: "Bỏ る + れば (Ví dụ: 食べる → 食べれば, 見る → 見れば).",
      irregular: "• する → すれば\n• 来る (くる) → 来れば (くれば - phát âm là kureba)"
    },
    soundChanges: [
      { ending: "う → えば", result: "えば", examples: "買う → 買えば" },
      { ending: "く → けば", result: "けば", examples: "書く → 書けば, 行く → 行けば" },
      { ending: "す → せば", result: "せば", examples: "話す → 話せば" },
      { ending: "つ → てば", result: "てば", examples: "待つ → 待てば" },
      { ending: "む → めば", result: "めば", examples: "読む → 読めば" }
    ],
    exceptions: [],
    verbExamples: [
      { kanji: "書く", reading: "かく", group: "Nhóm I", result: "書けば", resultReading: "かけば", meaningVi: "viết → nếu viết" },
      { kanji: "食べる", reading: "たべる", group: "Nhóm II", result: "食べれば", resultReading: "たべれば", meaningVi: "ăn → nếu ăn" },
      { kanji: "する", reading: "する", group: "Nhóm III", result: "すれば", resultReading: "すれば", meaningVi: "làm → nếu làm" },
      { kanji: "来る", reading: "くる", group: "Nhóm III", result: "来れば", resultReading: "くれば", meaningVi: "đến → nếu đến" }
    ],
    sentenceExamples: [
      { ja: "安ければ、たくさん買います。", furigana: [{ text: "安", ruby: "やす" }, { text: "買", ruby: "か" }], vi: "Nếu rẻ thì tôi sẽ mua nhiều." },
      { ja: "日本語は練習すればするほど上手になります。", furigana: [{ text: "日本語", ruby: "にほんご" }, { text: "練習", ruby: "れんしゅう" }, { text: "上手", ruby: "じょうず" }], vi: "Tiếng Nhật càng luyện tập thì sẽ càng giỏi." }
    ],
    commonMistakesVi: "Dùng thể ば cho vế sau thể hiện mệnh lệnh, ý chí khi cả hai vế cùng một chủ ngữ (khi đó nên dùng たら)."
  },
  {
    id: "volitional",
    formId: "volitional",
    titleJa: "意向形",
    reading: "いこうけい",
    titleVi: "Thể ý chí",
    conceptVi: "Thể ý chí là dạng ngắn thân mật của 〜ましょう, biểu đạt ý chí, quyết tâm của người nói hoặc lời rủ rê bạn bè cùng làm gì đó.",
    whenToUseVi: "Dùng để: (1) Rủ rê bạn bè thân thiết 'Cùng làm... nhé!'; (2) Biểu đạt dự định ấp ủ 〜ようと思っている; (3) Tự nhủ quyết tâm làm điều gì.",
    nuanceVi: "Văn phong thân mật giữa bạn bè, người dưới hoặc tự nhủ. Trong giao tiếp trang trọng với cấp trên phải dùng 〜ましょう.",
    rulesByGroup: {
      godan: "Chuyển đuôi hàng [u] sang hàng [o] tương ứng và kéo dài âm bằng う (Ví dụ: 書く → 書こう, 話す → 話そう, 買う → 買おう).",
      ichidan: "Bỏ る + よう (Ví dụ: 食べる → 食べよう, 見る → 見よう).",
      irregular: "• する → しよう\n• 来る (くる) → 来よう (こよう - phát âm là koyou)"
    },
    soundChanges: [
      { ending: "う → おう", result: "おう", examples: "買う → 買おう" },
      { ending: "く → こう", result: "こう", examples: "書く → 書こう, 行く → 行こう" },
      { ending: "す → そう", result: "そう", examples: "話す → 話そう" },
      { ending: "む → もう", result: "もう", examples: "読む → 読もう" },
      { ending: "る → ろう", result: "ろう", examples: "取る → 取ろう" }
    ],
    exceptions: [],
    verbExamples: [
      { kanji: "書く", reading: "かく", group: "Nhóm I", result: "書こう", resultReading: "かこう", meaningVi: "viết → cùng viết nào / định viết" },
      { kanji: "食べる", reading: "たべる", group: "Nhóm II", result: "食べよう", resultReading: "たべよう", meaningVi: "ăn → cùng ăn nhé" },
      { kanji: "する", reading: "する", group: "Nhóm III", result: "しよう", resultReading: "しよう", meaningVi: "làm → cùng làm nhé" },
      { kanji: "来る", reading: "くる", group: "Nhóm III", result: "来よう", resultReading: "こよう", meaningVi: "đến → định đến" }
    ],
    sentenceExamples: [
      { ja: "週末、一緒に映画を見に行こう！", furigana: [{ text: "週末", ruby: "しゅうまつ" }, { text: "一緒", ruby: "いっしょ" }, { text: "映画", ruby: "えいが" }, { text: "見", ruby: "み" }, { text: "行", ruby: "い" }], vi: "Cuối tuần cùng đi xem phim nhé!" },
      { ja: "来年、JLPT N2を受験しようと思っています。", furigana: [{ text: "来年", ruby: "らいねん" }, { text: "受験", ruby: "じゅけん" }, { text: "思", ruby: "おも" }], vi: "Tôi đang định năm sau sẽ thi JLPT N2." }
    ],
    commonMistakesVi: "Quên thêm [う] kéo dài âm ở Nhóm I (ví dụ viết nhầm thành かこ thay vì かこう). Dùng thể ý chí trực tiếp rủ cấp trên/khách hàng."
  },
  {
    id: "imperative",
    formId: "imperative",
    titleJa: "命令形",
    reading: "めいれいけい",
    titleVi: "Thể mệnh lệnh",
    conceptVi: "Thể mệnh lệnh là hình thức ra lệnh dứt khoát, mang tính ép buộc cao nhất trong hệ thống động từ tiếng Nhật.",
    whenToUseVi: "Dùng trong: (1) Tình huống khẩn cấp (Chạy đi! Tránh ra!); (2) Nam giới nói với người thân thiết; (3) Huấn luyện viên thể thao hoặc cổ vũ (Cố lên!); (4) Biển báo giao thông; (5) Tường thuật gián tiếp câu ra lệnh.",
    nuanceVi: "Mang sắc thái rất mạnh, thô lỗ nếu dùng bừa bãi trong giao tiếp thường nhật. Không bao giờ dùng với người lạ hoặc người trên.",
    rulesByGroup: {
      godan: "Chuyển đuôi hàng [u] sang hàng [e] tương ứng (Ví dụ: 書く → 書け, 話す → 話せ, 買う → 買え, 待つ → 待て).",
      ichidan: "Bỏ る + ろ (hoặc よ trong văn viết) (Ví dụ: 食べる → 食べろ, 見る → 見ろ).",
      irregular: "• する → しろ (hoặc せよ)\n• 来る (くる) → 来い (こい - phát âm là koi)"
    },
    soundChanges: [],
    exceptions: [],
    verbExamples: [
      { kanji: "書く", reading: "かく", group: "Nhóm I", result: "書け", resultReading: "かけ", meaningVi: "viết → Viết mau!" },
      { kanji: "食べる", reading: "たべる", group: "Nhóm II", result: "食べろ", resultReading: "たべろ", meaningVi: "ăn → Ăn đi!" },
      { kanji: "する", reading: "する", group: "Nhóm III", result: "しろ", resultReading: "しろ", meaningVi: "làm → Làm ngay!" },
      { kanji: "来る", reading: "くる", group: "Nhóm III", result: "来い", resultReading: "こい", meaningVi: "đến → Lại đây mau!" }
    ],
    sentenceExamples: [
      { ja: "危ない！早く逃げろ！", furigana: [{ text: "危", ruby: "あぶ" }, { text: "早", ruby: "はや" }, { text: "逃", ruby: "に" }], vi: "Nguy hiểm! Mau chạy đi!" },
      { ja: "部長は彼に『明日までに報告書を出せ』と言いました。", furigana: [{ text: "部長", ruby: "ぶちょう" }, { text: "彼", ruby: "かれ" }, { text: "明日", ruby: "あした" }, { text: "報告書", ruby: "ほうこくしょ" }, { text: "出", ruby: "だ" }, { text: "言", ruby: "い" }], vi: "Trưởng phòng nói với anh ấy rằng: 'Trước ngày mai hãy nộp báo cáo!'." }
    ],
    commonMistakesVi: "Gán nhãn chung là 'Vろ' cho tất cả động từ (sai, vì Nhóm I đổi sang hàng [e] như 書け, không phải 書くろ)."
  },
  {
    id: "prohibitive",
    formId: "prohibitive",
    titleJa: "禁止形",
    reading: "きんしけい",
    titleVi: "Thể cấm đoán",
    conceptVi: "Thể cấm đoán dùng để nghiêm cấm hành vi một cách nghiêm khắc và mạnh mẽ nhất.",
    whenToUseVi: "Dùng để: (1) Biển báo cấm (Không được vào, Không được chụp ảnh); (2) Tình huống nguy cấp; (3) Tường thuật lời cấm đoán trong trích dẫn gián tiếp.",
    nuanceVi: "Cực kỳ nghiêm khắc. Lời cấm lịch sự trong đời sống phải dùng 〜ないでください hoặc 〜てはいけません.",
    rulesByGroup: {
      godan: "Thể từ điển (辞書形) + な (Ví dụ: 書くな, 話すな, 買うな, 行くな).",
      ichidan: "Thể từ điển (辞書形) + な (Ví dụ: 食べるな, 見るな).",
      irregular: "• する → するな\n• 来る (くる) → 来るな (くるな)"
    },
    soundChanges: [],
    exceptions: [],
    verbExamples: [
      { kanji: "書く", reading: "かく", group: "Nhóm I", result: "書くな", resultReading: "かくな", meaningVi: "viết → Cấm viết!" },
      { kanji: "食べる", reading: "たべる", group: "Nhóm II", result: "食べるな", resultReading: "たべるな", meaningVi: "ăn → Cấm ăn!" },
      { kanji: "する", reading: "する", group: "Nhóm III", result: "するな", resultReading: "するな", meaningVi: "làm → Cấm làm!" },
      { kanji: "来る", reading: "くる", group: "Nhóm III", result: "来るな", resultReading: "くるな", meaningVi: "đến → Cấm lại gần!" }
    ],
    sentenceExamples: [
      { ja: "ここに車を止めるな。", furigana: [{ text: "車", ruby: "くるま" }, { text: "止", ruby: "と" }], vi: "Cấm đỗ xe ở đây." },
      { ja: "諦めるな！最後まで頑張れ！", furigana: [{ text: "諦", ruby: "あきら" }, { text: "最後", ruby: "さいご" }, { text: "頑", ruby: "がん" }, { text: "張", ruby: "ば" }], vi: "Đừng bỏ cuộc! Hãy cố gắng tới cùng!" }
    ],
    commonMistakesVi: "Nhầm thể cấm đoán (Từ điển + な) với thể rủ rê/khuyên nhủ nhẹ nhàng của nữ giới (Vます bỏ ます + な)."
  },
  {
    id: "potential",
    formId: "potential",
    titleJa: "可能形",
    reading: "かのうけい",
    titleVi: "Thể khả năng",
    conceptVi: "Thể khả năng biểu thị người hoặc vật có năng lực, khả năng hoặc hoàn cảnh cho phép thực hiện một hành động nào đó ('có thể làm...').",
    whenToUseVi: "Dùng để: (1) Thay thế cho cấu trúc 〜ことができる; (2) Trợ từ tân ngữ [を] thường chuyển thành [が] (Ví dụ: 漢字が書ける); (3) Miêu tả năng lực cá nhân hoặc điều kiện môi trường.",
    nuanceVi: "Gọn gàng, tự nhiên và được dùng phổ biến hơn 〜ことができる trong giao tiếp hàng ngày.",
    rulesByGroup: {
      godan: "Chuyển đuôi hàng [u] sang hàng [e] tương ứng + る (Ví dụ: 書く → 書ける, 話す → 話せる, 買う → 買える, 泳ぐ → 泳げる).",
      ichidan: "Bỏ る + られる (Hiện tượng nói rút gọn 'ら抜き': 食べれる, 見れる nhưng trong thi cử N3 phải dùng chuẩn: 食べられる, 見られる).",
      irregular: "• する → できる\n• 来る (くる) → 来られる (こられる)"
    },
    soundChanges: [
      { ending: "く → ける", result: "ける", examples: "書く → 書ける, 行く → 行ける" },
      { ending: "す → せる", result: "せる", examples: "話す → 話せる" },
      { ending: "つ → てる", result: "てる", examples: "待つ → 待てる" },
      { ending: "む → める", result: "める", examples: "読む → 読める" },
      { ending: "る → れる", result: "れる", examples: "取る → 取れる" }
    ],
    exceptions: [
      { base: "する", reading: "する", result: "できる", resultReading: "できる", note: "Động từ する chuyển thành từ vựng hoàn toàn mới là できる." }
    ],
    verbExamples: [
      { kanji: "書く", reading: "かく", group: "Nhóm I", result: "書ける", resultReading: "かける", meaningVi: "viết → có thể viết" },
      { kanji: "食べる", reading: "たべる", group: "Nhóm II", result: "食べられる", resultReading: "たべられる", meaningVi: "ăn → có thể ăn" },
      { kanji: "する", reading: "する", group: "Nhóm III", result: "できる", resultReading: "できる", meaningVi: "làm → có thể làm" },
      { kanji: "来る", reading: "くる", group: "Nhóm III", result: "来られる", resultReading: "こられる", meaningVi: "đến → có thể đến" }
    ],
    sentenceExamples: [
      { ja: "一人で刺身が食べられますか。", furigana: [{ text: "一人", ruby: "ひとり" }, { text: "刺身", ruby: "さしみ" }, { text: "食", ruby: "た" }], vi: "Bạn có thể ăn được món sashimi một mình không?" },
      { ja: "日本語で自分の意見が言えるようになりたいです。", furigana: [{ text: "日本語", ruby: "にほんご" }, { text: "自分", ruby: "じぶん" }, { text: "意見", ruby: "いけん" }, { text: "言", ruby: "い" }], vi: "Tôi muốn có thể nói ý kiến của mình bằng tiếng Nhật." }
    ],
    commonMistakesVi: "Gán nhãn chung là 'Vれる/Vられる' (Nhóm I là hàng e + る như 書ける, không phải 書くられる). Nhầm trợ từ tân ngữ: Thường dùng が thay cho を (日本語が話せる)."
  },
  {
    id: "passive",
    formId: "passive",
    titleJa: "受身形",
    reading: "うけみけい",
    titleVi: "Thể bị động",
    conceptVi: "Thể bị động diễn đạt việc chủ ngữ chịu tác động từ một hành động của đối tượng khác (bị/được). Trong tiếng Nhật còn có 'bị động gián tiếp / bị động phiền toái' (迷惑受身).",
    whenToUseVi: "Dùng để: (1) Bị động trực tiếp (Tôi được khen, Tôi bị mắng); (2) Bị động phiền toái (Tôi bị trời mưa làm ướt, Tôi bị em khóc quấy); (3) Khi sự vật/hiện tượng được công chúng biết đến rộng rãi mà không cần nêu chủ thể.",
    nuanceVi: "Bị động phiền toái thường mang sắc thái tiêu cực, phiền toái cho người nói dù động từ gốc là tự động từ (ví dụ: 雨に降られた).",
    rulesByGroup: {
      godan: "Chuyển đuôi hàng [u] sang hàng [a] tương ứng + れる.\nĐặc biệt: Đuôi [う] đổi thành [わ] (Ví dụ: 買う → 買われる, 叱る → 叱られる).",
      ichidan: "Bỏ る + られる (Trùng dạng với thể khả năng, phân biệt qua ngữ cảnh và trợ từ).",
      irregular: "• する → される\n• 来る (くる) → 来られる (こられる)"
    },
    soundChanges: [
      { ending: "う → われる", result: "われる", examples: "買う → 買われる, 笑う → 笑われる" },
      { ending: "く → かれる", result: "かれる", examples: "書く → 書かれる, 叱る → 叱られる" },
      { ending: "す → される", result: "される", examples: "話す → 話される, 頼む → 頼まれる" }
    ],
    exceptions: [],
    verbExamples: [
      { kanji: "書く", reading: "かく", group: "Nhóm I", result: "書かれる", resultReading: "かかれる", meaningVi: "viết → được/bị viết" },
      { kanji: "食べる", reading: "たべる", group: "Nhóm II", result: "食べられる", resultReading: "たべられる", meaningVi: "ăn → bị ăn mất" },
      { kanji: "する", reading: "する", group: "Nhóm III", result: "される", resultReading: "される", meaningVi: "làm → bị/được làm" },
      { kanji: "来る", reading: "くる", group: "Nhóm III", result: "来られる", resultReading: "こられる", meaningVi: "đến → bị (ai đó) đến làm phiền" }
    ],
    sentenceExamples: [
      { ja: "先生に褒められて、とても嬉しかったです。", furigana: [{ text: "先生", ruby: "せんせい" }, { text: "褒", ruby: "ほ" }, { text: "嬉", ruby: "うれ" }], vi: "Được thầy giáo khen, tôi đã rất vui." },
      { ja: "雨に降られて、服が濡れてしまいました。", furigana: [{ text: "雨", ruby: "あめ" }, { text: "降", ruby: "ふ" }, { text: "服", ruby: "ふく" }, { text: "濡", ruby: "ぬ" }], vi: "Bị dính mưa nên quần áo tôi ướt sũng mất rồi." }
    ],
    commonMistakesVi: "Nhầm lẫn giữa thể Khả năng và Bị động ở Nhóm II vì cùng có đuôi られる. Nhầm trợ từ tác nhân (người thực hiện hành động thường đi với trợ từ に: 先生に褒められる)."
  },
  {
    id: "causative",
    formId: "causative",
    titleJa: "使役形",
    reading: "しえきけい",
    titleVi: "Thể sai khiến",
    conceptVi: "Thể sai khiến diễn đạt ý bắt buộc ai làm gì (bắt làm) hoặc cho phép/để cho ai làm gì (cho phép).",
    whenToUseVi: "Dùng để: (1) Bắt người dưới/con cái làm việc (mẹ bắt con học); (2) Cho phép làm việc (cho con đi chơi); (3) Gây ra cảm xúc cho người khác (làm mẹ lo lắng); (4) Xin phép một cách lịch sự 〜させてください.",
    nuanceVi: "Khi dùng với người trên hoặc muốn xin phép nhã nhặn, cấu trúc '使役 + ていただけませんか' là mẫu câu N3 kinh điển.",
    rulesByGroup: {
      godan: "Chuyển đuôi hàng [u] sang hàng [a] tương ứng + せる (Ví dụ: 書く → 書かせる, 読む → 読ませる, 買う → 買わせる).",
      ichidan: "Bỏ る + させる (Ví dụ: 食べる → 食べさせる, 見る → 見させる).",
      irregular: "• する → させる\n• 来る (くる) → 来させる (こさせる)"
    },
    soundChanges: [
      { ending: "う → わせる", result: "わせる", examples: "買う → 買わせる" },
      { ending: "く → かせる", result: "かける", examples: "書く → 書かせる, 行く → 行かせる" },
      { ending: "す → させる", result: "させる", examples: "話す → 話させる" }
    ],
    exceptions: [],
    verbExamples: [
      { kanji: "書く", reading: "かく", group: "Nhóm I", result: "書かせる", resultReading: "かかせる", meaningVi: "viết → bắt/cho viết" },
      { kanji: "食べる", reading: "たべる", group: "Nhóm II", result: "食べさせる", resultReading: "たべさせる", meaningVi: "ăn → bắt/cho ăn" },
      { kanji: "する", reading: "する", group: "Nhóm III", result: "させる", resultReading: "させる", meaningVi: "làm → bắt/cho làm" },
      { kanji: "来る", reading: "くる", group: "Nhóm III", result: "来させる", resultReading: "こさせる", meaningVi: "đến → bắt/bảo đến" }
    ],
    sentenceExamples: [
      { ja: "母は弟に野菜を食べさせました。", furigana: [{ text: "母", ruby: "はは" }, { text: "弟", ruby: "おとうと" }, { text: "野菜", ruby: "やさい" }, { text: "食", ruby: "た" }], vi: "Mẹ bắt em trai tôi ăn rau." },
      { ja: "すみません、体調が悪いので少し休ませてください。", furigana: [{ text: "体調", ruby: "たいちょう" }, { text: "悪", ruby: "わる" }, { text: "少", ruby: "すこ" }, { text: "休", ruby: "やす" }], vi: "Xin lỗi, vì sức khỏe không tốt nên xin phép cho tôi được nghỉ một lát ạ." }
    ],
    commonMistakesVi: "Nhầm lẫn giữa trợ từ に và を cho đối tượng bị sai khiến: Nội động từ thường dùng を (子どもを走らせる), Ngoại động từ dùng に (子どもに本を読ませる)."
  },
  {
    id: "causative-passive",
    formId: "causative-passive",
    titleJa: "使役受身形",
    reading: "しえきうけみけい",
    titleVi: "Thể bị động sai khiến",
    conceptVi: "Thể bị động sai khiến kết hợp cả sai khiến và bị động, diễn đạt ý 'bị người khác ép buộc, bắt phải làm điều gì đó mà bản thân không hề muốn'.",
    whenToUseVi: "Dùng để: Thể hiện sự miễn cưỡng, khổ sở hoặc áp lực từ người khác (Bị ép uống rượu, Bị bắt dọn dẹp phòng, Bị ép làm thêm giờ).",
    nuanceVi: "Luôn mang sắc thái tâm lý tiêu cực, bất đắc dĩ, cảm giác khó chịu của người bị bắt làm.",
    rulesByGroup: {
      godan: "• Dạng đầy đủ: Đổi sang hàng [a] + せられる\n• Dạng rút gọn (phổ biến hơn): Đổi sang hàng [a] + される.\nLƯU Ý CỰC KỲ QUAN TRỌNG: Động từ đuôi [す] KHÔNG ĐƯỢC rút gọn (Chỉ dùng 話させられる, KHÔNG dùng 話さされる).",
      ichidan: "Bỏ る + させられる (Ví dụ: 食べる → 食べさせられる, 見る → 見させられる). Không có dạng rút gọn.",
      irregular: "• する → させられる\n• 来る (くる) → 来させられる (こさせられる)"
    },
    soundChanges: [
      { ending: "く → かされる", result: "かされる", examples: "書く → 書かされる (viết tắt của 書かせられる)" },
      { ending: "む → まされる", result: "まされる", examples: "飲む → 飲まされる (viết tắt của 飲ませられる)" },
      { ending: "す → させられる", result: "させられる", examples: "話す → 話させられる (BẮT BUỘC dạng đầy đủ)" }
    ],
    exceptions: [
      { base: "話す", reading: "はなす", result: "話させられる", resultReading: "はなさせられる", note: "Các động từ kết thúc bằng đuôi [す] tuyệt đối không rút gọn thành さされる để tránh trùng âm." }
    ],
    verbExamples: [
      { kanji: "書く", reading: "かく", group: "Nhóm I", result: "書かされる", resultReading: "かかされる", meaningVi: "viết → bị bắt phải viết" },
      { kanji: "食べる", reading: "たべる", group: "Nhóm II", result: "食べさせられる", resultReading: "たべさせられる", meaningVi: "ăn → bị ép phải ăn" },
      { kanji: "する", reading: "する", group: "Nhóm III", result: "させられる", resultReading: "させられる", meaningVi: "làm → bị bắt phải làm" },
      { kanji: "来る", reading: "くる", group: "Nhóm III", result: "来させられる", resultReading: "こさせられる", meaningVi: "đến → bị bắt phải đến" }
    ],
    sentenceExamples: [
      { ja: "昨日の飲み会で、無理にお酒を飲まされました。", furigana: [{ text: "昨日", ruby: "きのう" }, { text: "飲", ruby: "の" }, { text: "会", ruby: "かい" }, { text: "無理", ruby: "むり" }, { text: "酒", ruby: "さけ" }], vi: "Trong buổi liên hoan hôm qua, tôi đã bị ép uống rượu." },
      { ja: "子どもの頃、嫌いなピーマンを食べさせられました。", furigana: [{ text: "子", ruby: "こ" }, { text: "頃", ruby: "ころ" }, { text: "嫌", ruby: "きら" }, { text: "食", ruby: "た" }], vi: "Hồi còn nhỏ, tôi từng bị bắt phải ăn ớt chuông mà tôi ghét cay ghét đắng." }
    ],
    commonMistakesVi: "Rút gọn sai với động từ đuôi す (nói 話さされる là sai ngữ pháp). Nhầm với thể sai khiến thuần túy (sai khiến là 'cho/bắt người khác', bị động sai khiến là 'chính mình bị người khác ép')."
  }
];

const targetDir = path.join(process.cwd(), "public", "data", "learning", "verb-forms");

for (const lesson of VERB_LESSONS) {
  const filePath = path.join(targetDir, `${lesson.id}.json`);
  fs.writeFileSync(filePath, JSON.stringify(lesson, null, 2), "utf8");
}

console.log(`Đã tạo thành công ${VERB_LESSONS.length} bài học thể động từ chi tiết tại ${targetDir}`);

