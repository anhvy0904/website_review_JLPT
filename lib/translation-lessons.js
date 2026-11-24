// THÊM BÀI MỚI: sao chép mẫu ở cuối file và thêm vào mảng này.
// Furigana: viết [Kanji|hiragana], ví dụ [旅行|りょこう]. Không dùng HTML.
// Mỗi bài gồm 10–15 câu; translation có đúng một bản dịch cho mỗi câu.
export const translationLessons = [
  {
    id: "kyoto-bus", topic: "Du lịch", level: "N3", title: "Một chuyến đi không như kế hoạch", japaneseTitle: "京都での小さな冒険",
    sentences: [
      "[先週|せんしゅう]、[友達|ともだち]と[京都|きょうと]へ[旅行|りょこう]に[行|い]きました。",
      "[朝|あさ][早|はや]く[出発|しゅっぱつ]したのに、[駅|えき]はもう[混|こ]んでいました。",
      "[有名|ゆうめい]なお[寺|てら]へ[行|い]くために、バスに[乗|の]ることにしました。",
      "ところが、[間違|まちが]えて[反対|はんたい][方向|ほうこう]のバスに[乗|の]ってしまいました。",
      "[地図|ちず]を[見|み]ても、どこで[降|お]りればいいか[分|わ]かりませんでした。",
      "すると、[隣|となり]に[座|すわ]っていた[女性|じょせい]が[声|こえ]をかけてくれました。",
      "その[人|ひと]に[教|おし]えてもらったおかげで、[無事|ぶじ]にお[寺|てら]に[着|つ]きました。",
      "[予定|よてい]より[遅|おそ]くなりましたが、[庭|にわ]の[景色|けしき]はとてもきれいでした。",
      "[帰|かえ]る[前|まえ]に、[家族|かぞく]へのお[土産|みやげ]を[買|か]いました。",
      "[次|つぎ]に[旅行|りょこう]するときは、バスの[行|い]き[先|さき]をよく[確認|かくにん]するつもりです。",
    ],
    vocabulary: [["反対方向", "はんたいほうこう", "hướng ngược lại"], ["無事に", "ぶじに", "suôn sẻ, bình an"], ["景色", "けしき", "phong cảnh"], ["行き先", "いきさき", "điểm đến"]],
    grammar: [["～のに", "Mặc dù… nhưng…; kết quả trái với điều mong đợi."], ["～てしまう", "Diễn tả việc đã lỡ làm, thường kèm tiếc nuối."], ["～おかげで", "Nhờ…; nêu nguyên nhân dẫn đến kết quả tốt."]],
    translation: ["Tuần trước, tôi đi du lịch Kyoto cùng một người bạn.", "Mặc dù khởi hành từ sáng sớm, nhà ga đã đông nghịt.", "Chúng tôi quyết định đi xe buýt để đến một ngôi chùa nổi tiếng.", "Thế nhưng, chúng tôi lại lên nhầm xe buýt đi hướng ngược lại.", "Dù xem bản đồ, chúng tôi vẫn không biết nên xuống ở đâu.", "Đúng lúc đó, người phụ nữ ngồi bên cạnh đã chủ động bắt chuyện với chúng tôi.", "Nhờ được cô ấy chỉ đường, chúng tôi đã đến chùa suôn sẻ.", "Tuy muộn hơn dự định, cảnh khu vườn vẫn rất đẹp.", "Trước khi về, tôi mua quà cho gia đình.", "Lần sau đi du lịch, tôi định sẽ kiểm tra kỹ điểm đến của xe buýt."],
    explanations: ["Câu 5: tách 地図を見ても (dù xem bản đồ) / どこで降りればいいか (nên xuống ở đâu) / 分かりませんでした (đã không biết). か đánh dấu câu hỏi gián tiếp.", "Câu 6–7: くれました và もらった thể hiện sự giúp đỡ mà người kể nhận được. Dịch tự nhiên thành ‘chủ động bắt chuyện’, ‘được chỉ đường’, không dịch từng chữ là ‘cho/nhận’."]
  },
  {
    id: "it-release", topic: "Công việc IT", level: "N3", title: "Cùng nhau xử lý một lỗi phần mềm", japaneseTitle: "チームで問題を解決する",
    sentences: [
      "[私|わたし]は[日本|にほん]のIT[会社|がいしゃ]で[働|はたら]いています。",
      "[今|いま]、チームで[新|あたら]しいアプリを[作|つく]っています。",
      "[昨日|きのう]、テストをしているときに、[画面|がめん]が[動|うご]かなくなりました。",
      "[原因|げんいん]を[調|しら]べるために、[先輩|せんぱい]とログを[確認|かくにん]しました。",
      "[一人|ひとり]では[分|わ]からなかったことも、[二人|ふたり]で[話|はな]すと[少|すこ]しずつ[分|わ]かってきました。",
      "[先輩|せんぱい]は、[変更|へんこう]する[前|まえ]にバックアップを[取|と]るように[言|い]いました。",
      "[問題|もんだい]のある[部分|ぶぶん]を[直|なお]したあとで、もう[一度|いちど]テストしました。",
      "[今度|こんど]は[正|ただ]しく[動|うご]いたので、みんな[安心|あんしん]しました。",
      "[同|おな]じミスを[繰|く]り[返|かえ]さないように、[手順|てじゅん]を[資料|しりょう]にまとめました。",
      "この[経験|けいけん]を[通|とお]して、[早|はや]めに[相談|そうだん]することの[大切|たいせつ]さを[学|まな]びました。",
    ],
    vocabulary: [["原因", "げんいん", "nguyên nhân"], ["変更", "へんこう", "thay đổi"], ["手順", "てじゅん", "trình tự thao tác"], ["資料", "しりょう", "tài liệu"]],
    grammar: [["～ように言う", "Dặn, yêu cầu ai làm gì; thuật lại một lời chỉ dẫn."], ["～ように", "Để…; nêu mục đích, thường đi với dạng khả năng hoặc phủ định."], ["～を通して", "Thông qua…; nêu trải nghiệm hoặc phương tiện."]],
    translation: ["Tôi làm việc tại một công ty IT của Nhật.", "Hiện tại, nhóm tôi đang phát triển một ứng dụng mới.", "Hôm qua, khi đang kiểm thử, màn hình bỗng không phản hồi nữa.", "Để tìm nguyên nhân, tôi cùng một anh chị đi trước kiểm tra nhật ký hệ thống.", "Có những điều tôi không hiểu khi làm một mình, nhưng khi hai người trao đổi, tôi dần hiểu ra.", "Anh chị ấy dặn tôi sao lưu trước khi thực hiện thay đổi.", "Sau khi sửa phần có vấn đề, chúng tôi kiểm thử lại một lần nữa.", "Lần này ứng dụng hoạt động đúng nên mọi người đều yên tâm.", "Để tránh lặp lại lỗi tương tự, tôi tổng hợp các bước thao tác thành tài liệu.", "Qua trải nghiệm này, tôi học được tầm quan trọng của việc trao đổi, xin ý kiến từ sớm."],
    explanations: ["Câu 3: 動かなくなりました là ‘trở nên không hoạt động’. Với ngữ cảnh phần mềm, ‘màn hình không phản hồi nữa’ tự nhiên hơn ‘màn hình không di chuyển’.", "Câu 6: [変更する前にバックアップを取る] là toàn bộ nội dung lời dặn. 先輩 không xác định giới tính, có thể dịch là ‘anh/chị đi trước’ hoặc ‘đồng nghiệp có kinh nghiệm’.", "Câu 10: 相談すること biến hành động trao đổi thành danh từ; 大切さ là ‘tầm quan trọng’."]
  },
  {
    id: "daily-cooking", topic: "Đời sống hằng ngày", level: "N3", title: "Tập nấu ăn để sống khỏe hơn", japaneseTitle: "自分で料理する生活",
    sentences: [
      "[一人暮|ひとりぐ]らしを[始|はじ]めたころ、[毎日|まいにち]コンビニでお[弁当|べんとう]を[買|か]っていました。",
      "[便利|べんり]でしたが、[野菜|やさい]をあまり[食|た]べていないことに[気|き]づきました。",
      "そこで、[健康|けんこう]のために[自分|じぶん]で[料理|りょうり]することにしました。",
      "[最初|さいしょ]は[簡単|かんたん]なスープさえうまく[作|つく]れませんでした。",
      "でも、[母|はは]に[教|おし]えてもらいながら、[何度|なんど]も[練習|れんしゅう]しました。",
      "[最近|さいきん]は、[冷蔵庫|れいぞうこ]にあるもので[料理|りょうり]できるようになりました。",
      "[買|か]い[物|もの]に[行|い]く[前|まえ]に、[必要|ひつよう]なものをメモしておきます。",
      "そうすれば、[食|た]べ[物|もの]を[買|か]いすぎずに[済|す]みます。",
      "[忙|いそが]しい[日|ひ]のために、[週末|しゅうまつ]におかずを[作|つく]って[冷凍|れいとう]しています。",
      "[料理|りょうり]は[面倒|めんどう]なこともありますが、[今|いま]では[毎日|まいにち]の[楽|たの]しみの[一|ひと]つです。",
    ],
    vocabulary: [["一人暮らし", "ひとりぐらし", "sống một mình"], ["冷蔵庫", "れいぞうこ", "tủ lạnh"], ["冷凍", "れいとう", "đông lạnh"], ["面倒", "めんどう", "phiền, mất công"]],
    grammar: [["～さえ", "Ngay cả…; đưa ra ví dụ tối thiểu để nhấn mạnh."], ["～ようになる", "Dần trở nên, đã có thể…; sự thay đổi khả năng hoặc thói quen."], ["～ておく", "Làm sẵn việc gì để chuẩn bị cho sau này."]],
    translation: ["Hồi mới bắt đầu sống một mình, ngày nào tôi cũng mua cơm hộp ở cửa hàng tiện lợi.", "Tuy tiện nhưng tôi nhận ra mình ăn rất ít rau.", "Vì vậy, tôi quyết định tự nấu ăn để giữ gìn sức khỏe.", "Ban đầu, ngay cả món súp đơn giản tôi cũng không nấu được cho ngon.", "Nhưng tôi đã luyện tập nhiều lần với sự hướng dẫn của mẹ.", "Gần đây, tôi đã có thể nấu ăn bằng những thứ có sẵn trong tủ lạnh.", "Trước khi đi mua sắm, tôi ghi sẵn những thứ cần mua.", "Làm như vậy thì tôi tránh được việc mua quá nhiều thực phẩm.", "Để dành cho những ngày bận rộn, tôi nấu sẵn thức ăn vào cuối tuần rồi cấp đông.", "Đôi khi nấu ăn cũng mất công, nhưng giờ đây nó là một trong những niềm vui hằng ngày của tôi."],
    explanations: ["Câu 2: [野菜をあまり食べていないこと] / に気づきました: ‘nhận ra [việc mình ăn ít rau]’. あまり đi với phủ định mang nghĩa ‘không… mấy’.", "Câu 8: 買いすぎずに済む nghĩa là tránh được việc mua quá nhiều. ずに là dạng phủ định có nghĩa tương đương ないで."]
  },
  {
    id: "summer-festival", topic: "Văn hóa Nhật", level: "N3", title: "Lần đầu tham gia lễ hội mùa hè", japaneseTitle: "初めての夏祭り",
    sentences: [
      "[日本|にほん]に[来|き]てから、[初|はじ]めて[町|まち]の[夏祭|なつまつ]りに[参加|さんか]しました。",
      "[友達|ともだち]が[浴衣|ゆかた]を[貸|か]してくれたので、それを[着|き]て[出|で]かけました。",
      "[会場|かいじょう]に[近|ちか]づくにつれて、[太鼓|たいこ]の[音|おと]が[大|おお]きくなりました。",
      "[道|みち]の[両側|りょうがわ]には、[食|た]べ[物|もの]を[売|う]る[店|みせ]がたくさん[並|なら]んでいました。",
      "[焼|や]きそばを[食|た]べていると、[広場|ひろば]で[踊|おど]りが[始|はじ]まりました。",
      "[踊|おど]り[方|かた]が[分|わ]からなかったので、[最初|さいしょ]は[見|み]ているだけでした。",
      "しかし、[近|ちか]くにいた[人|ひと]に[誘|さそ]われて、[輪|わ]の[中|なか]に[入|はい]りました。",
      "[周|まわ]りの[人|ひと]のまねをしているうちに、だんだん[踊|おど]れるようになりました。",
      "[年齢|ねんれい]に[関係|かんけい]なく、みんなが[一緒|いっしょ]に[楽|たの]しんでいました。",
      "[祭|まつ]りは、[地域|ちいき]の[人|ひと]たちと[交流|こうりゅう]できる[大切|たいせつ]な[機会|きかい]だと[思|おも]いました。",
    ],
    vocabulary: [["浴衣", "ゆかた", "yukata, áo truyền thống mỏng thường mặc mùa hè"], ["太鼓", "たいこ", "trống Nhật"], ["輪", "わ", "vòng tròn"], ["交流", "こうりゅう", "giao lưu"]],
    grammar: [["～につれて", "Càng… càng…; hai sự thay đổi đi cùng nhau."], ["～ているうちに", "Trong lúc đang… thì dần xảy ra một thay đổi."], ["～に関係なく", "Không phụ thuộc vào…, bất kể…"]],
    translation: ["Kể từ khi đến Nhật, đây là lần đầu tôi tham gia lễ hội mùa hè của thị trấn.", "Một người bạn cho tôi mượn yukata nên tôi mặc bộ đó đi lễ hội.", "Càng đến gần địa điểm tổ chức, tiếng trống càng lớn.", "Hai bên đường có rất nhiều hàng bán đồ ăn.", "Khi tôi đang ăn mì xào, hoạt động nhảy múa ở quảng trường bắt đầu.", "Vì không biết cách nhảy nên lúc đầu tôi chỉ đứng xem.", "Tuy nhiên, được một người gần đó rủ, tôi đã bước vào vòng tròn.", "Trong lúc bắt chước những người xung quanh, tôi dần nhảy được.", "Mọi người cùng nhau vui chơi, bất kể tuổi tác.", "Tôi cảm thấy lễ hội là dịp quý báu để giao lưu với người dân địa phương."],
    explanations: ["Câu 7: 人に誘われて là bị động nhưng sắc thái tích cực, nên dịch ‘được rủ’. 輪 ở đây là vòng người đang nhảy, không phải đồ vật hình tròn.", "Câu 10: [地域の人たちと交流できる] bổ nghĩa cho 機会. Đưa danh từ ‘dịp’ lên trước khi dịch: ‘dịp để giao lưu với người dân địa phương’."]
  },
  {
    id: "remote-work", topic: "Công việc IT", level: "N3", title: "Một ngày làm việc tại nhà", japaneseTitle: "家で働く日の工夫",
    sentences: [
      "[私|わたし]の[会社|かいしゃ]では、[週|しゅう]に[二日|ふつか]、[家|いえ]で[働|はたら]いてもいいことになっています。",
      "[通勤|つうきん]しなくてもいいので、[朝|あさ]の[時間|じかん]に[余裕|よゆう]ができました。",
      "その[代|か]わり、[仕事|しごと]と[生活|せいかつ]の[時間|じかん]を[分|わ]けるのが[難|むずか]しいです。",
      "[集中|しゅうちゅう]するために、[机|つくえ]の[上|うえ]には[必要|ひつよう]なものしか[置|お]かないようにしています。",
      "[毎朝|まいあさ]、オンライン[会議|かいぎ]でその[日|ひ]の[予定|よてい]を[伝|つた]えます。",
      "[昨日|きのう]は[会議|かいぎ]の[途中|とちゅう]で、インターネットが[使|つか]えなくなりました。",
      "すぐに[同僚|どうりょう]に[電話|でんわ]して、[状況|じょうきょう]を[説明|せつめい]しました。",
      "[接続|せつぞく]が[戻|もど]るまで、[手元|てもと]の[資料|しりょう]を[整理|せいり]することにしました。",
      "[何|なに]か[困|こま]ったことがあったら、[一人|ひとり]で[悩|なや]まずに[連絡|れんらく]することが[大切|たいせつ]です。",
      "これからも、チームと[協力|きょうりょく]しながら、[自分|じぶん]に[合|あ]った[働|はたら]き[方|かた]を[探|さが]していきたいです。",
    ],
    vocabulary: [["通勤", "つうきん", "đi làm, di chuyển đến nơi làm việc"], ["余裕", "よゆう", "sự dư dả, thong thả"], ["同僚", "どうりょう", "đồng nghiệp"], ["接続", "せつぞく", "kết nối"]],
    grammar: [["～ことになっている", "Một quy định hoặc sắp xếp đã được đặt ra."], ["～しか～ない", "Chỉ…; しか luôn đi cùng phủ định."], ["～ようにしている", "Cố gắng duy trì một thói quen có chủ ý."]],
    translation: ["Công ty tôi có quy định cho phép làm việc tại nhà hai ngày mỗi tuần.", "Vì không phải đi đến công ty nên buổi sáng tôi có thời gian thong thả hơn.", "Bù lại, việc tách biệt thời gian làm việc và sinh hoạt khá khó.", "Để tập trung, tôi cố gắng chỉ để những thứ cần thiết trên bàn.", "Mỗi sáng, tôi thông báo kế hoạch trong ngày qua cuộc họp trực tuyến.", "Hôm qua, giữa buổi họp, mạng Internet đột nhiên không dùng được nữa.", "Tôi lập tức gọi cho đồng nghiệp để giải thích tình hình.", "Tôi quyết định sắp xếp tài liệu có sẵn trong lúc chờ kết nối được khôi phục.", "Khi gặp khó khăn, điều quan trọng là liên lạc với mọi người thay vì loay hoay một mình.", "Từ nay, tôi muốn tiếp tục tìm cách làm việc phù hợp với mình, đồng thời phối hợp cùng cả nhóm."],
    explanations: ["Câu 1: tách [家で働いてもいい] (được phép làm ở nhà) / ことになっています (đã có quy định). Đây là quy định của công ty, không phải quyết định cá nhân.", "Câu 4: 必要なものしか置かない dịch khẳng định là ‘chỉ để những thứ cần thiết’. Không dịch thành ‘không để những thứ cần thiết’.", "Câu 10: 自分に合った bổ nghĩa cho 働き方: ‘cách làm việc phù hợp với bản thân’. ～ていきたい diễn đạt mong muốn tiếp tục từ hiện tại về sau."]
  },
  // THÊM OBJECT BÀI MỚI TẠI ĐÂY (trước dấu ]).
];

/* MẪU JAVASCRIPT — sao chép vào mảng bên trên, thay nội dung và dùng id duy nhất:
{
  id: "bai-moi", topic: "Du lịch", level: "N3",
  title: "Tên bài tiếng Việt", japaneseTitle: "日本語のタイトル",
  sentences: [
    "[今日|きょう]は[電車|でんしゃ]で[旅行|りょこう]します。",
    // Bổ sung để đủ 10–15 câu, mỗi phần tử là một câu.
  ],
  vocabulary: [["電車", "でんしゃ", "tàu điện"]],
  grammar: [["～ために", "Để…; diễn đạt mục đích."]],
  translation: ["Hôm nay tôi đi du lịch bằng tàu điện."], // Khớp số câu, đúng thứ tự.
  explanations: ["Câu 1: で chỉ phương tiện di chuyển, dịch là ‘bằng’."]
},
*/
