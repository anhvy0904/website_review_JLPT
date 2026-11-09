// Script cập nhật lời giải chi tiết cho 14 câu từ vựng/chữ Hán của n3-best-moshi-02 và n3-best-moshi-03
import fs from "fs";
import path from "path";

const EXAM_UPDATES_03 = {
  1: {
    summaryVi: "Đáp án chính xác: 4.",
    correctReasonVi: "「角」（かど - GIÁC）nghĩa là góc đường, góc phố. Câu văn hỏi: Cửa hàng chúng ta sắp đến nằm ở góc kia.",
    optionReasonsVi: {
      "1": "SAI: 「となり」 là chữ Hán「隣」[LÂN] (nghĩa là bên cạnh/hàng xóm), không phải chữ「角」.",
      "2": "SAI: 「そば」 là chữ Hán「側」hoặc「傍」[TRẮC / BÀNG] (nghĩa là bên cạnh/gần bên), không phải chữ「角」.",
      "3": "SAI: 「さか」 là chữ Hán「坂」[PHẢN] (nghĩa là con dốc), không phải chữ「角」.",
      "4": "ĐÚNG: 「かど」 là âm Kun-yomi chuẩn của chữ「角」[GIÁC] (nghĩa là góc đường/góc phố; cửa hàng nằm ở góc phố kia)."
    },
    vocabulary: [
      { word: "角", hiragana: "かど", meaningVi: "góc đường, góc phố" },
      { word: "隣", hiragana: "となり", meaningVi: "bên cạnh, hàng xóm" },
      { word: "側", hiragana: "そば", meaningVi: "bên cạnh, gần bên" },
      { word: "坂", hiragana: "さか", meaningVi: "con dốc" }
    ]
  },
  2: {
    summaryVi: "Đáp án chính xác: 2.",
    correctReasonVi: "「後半」（こうはん - HẬU BÁN）nghĩa là nửa sau, nửa cuối tháng.",
    optionReasonsVi: {
      "1": "SAI: 「ごはん」 là chữ Hán「ご飯」[PHẠN] (nghĩa là cơm, bữa ăn).",
      "2": "ĐÚNG: 「後半」 đọc là「こうはん」[HẬU BÁN], nghĩa là nửa sau, nửa cuối tháng.",
      "3": "SAI: 「ごばん」 là chữ Hán「碁盤」[KỲ BÀN] (bàn cờ vây).",
      "4": "SAI: 「こうばん」 là chữ Hán「交番」[GIAO PHIÊN] (đồn cảnh sát góc phố)."
    },
    vocabulary: [
      { word: "後半", hiragana: "こうはん", meaningVi: "nửa sau, hiệp hai" },
      { word: "前半", hiragana: "ぜんはん", meaningVi: "nửa đầu, hiệp một" },
      { word: "交番", hiragana: "こうばん", meaningVi: "đồn cảnh sát" },
      { word: "ご飯", hiragana: "ごはん", meaningVi: "bữa cơm" }
    ]
  },
  3: {
    summaryVi: "Đáp án chính xác: 1.",
    correctReasonVi: "「非常口」（ひじょうぐち - PHI THƯỜNG KHẨU）nghĩa là cửa thoát hiểm.",
    optionReasonsVi: {
      "1": "ĐÚNG: 「非常口」 đọc là「ひじょうぐち」[PHI THƯỜNG KHẨU] (chữ 常 có trường âm じょう, 口 đọc biến âm thành ぐち).",
      "2": "SAI: 「ひじょぐち」 thiếu trường âm của chữ 常 (じょう).",
      "3": "SAI: 「びしょうぐち」 bẫy âm đọc, 微笑 [びしょう - VI TIẾU] nghĩa là mỉm cười.",
      "4": "SAI: 「びじょうぐち」 bẫy chữ 非 đọc là ひ, không biến âm đục thành び."
    },
    vocabulary: [
      { word: "非常口", hiragana: "ひじょうぐち", meaningVi: "cửa thoát hiểm" },
      { word: "非常", hiragana: "ひじょう", meaningVi: "khẩn cấp, phi thường" },
      { word: "微笑", hiragana: "びしょう", meaningVi: "nụ cười mỉm" }
    ]
  },
  4: {
    summaryVi: "Đáp án chính xác: 3.",
    correctReasonVi: "「参り」（まいり - THAM）là thể khiêm nhường ngữ của 行く/来る (đi/đến).",
    optionReasonsVi: {
      "1": "SAI: 「とまり」 là chữ Hán「泊まり」[BẠC] (trọ lại) hoặc「止まり」[CHỈ] (dừng lại).",
      "2": "SAI: 「かえり」 là chữ Hán「帰り」[QUY] (trở về).",
      "3": "ĐÚNG: 「参り」 là thể ます của động từ「参る」[THAM] (khiêm nhường ngữ của 行く/来る: ngày kia tôi sẽ đến).",
      "4": "SAI: 「あがり」 là chữ Hán「上がり」[THƯỢNG] (đi lên, tăng lên)."
    },
    vocabulary: [
      { word: "参る", hiragana: "まいる", meaningVi: "đi, đến (khiêm nhường ngữ)" },
      { word: "泊まる", hiragana: "とまる", meaningVi: "trọ lại khách sạn" },
      { word: "帰る", hiragana: "かえる", meaningVi: "về nhà" },
      { word: "上がる", hiragana: "あがる", meaningVi: "đi lên, tăng lên" }
    ]
  },
  5: {
    summaryVi: "Đáp án chính xác: 1.",
    correctReasonVi: "「共通」（きょうつう - CỘNG THÔNG）nghĩa là điểm chung, chung cho cả hai phía.",
    optionReasonsVi: {
      "1": "ĐÚNG: 「共通」 đọc là「きょうつう」[CỘNG THÔNG] (nghĩa là điểm chung, vấn đề chung của hai nước).",
      "2": "SAI: 「きょうつ」 thiếu trường âm của chữ 通 (つう).",
      "3": "SAI: 「こうつう」 là chữ Hán「交通」[GIAO THÔNG] (nghĩa là giao thông đi lại).",
      "4": "SAI: 「こうつ」 sai âm đọc của cả hai chữ Hán."
    },
    vocabulary: [
      { word: "共通", hiragana: "きょうつう", meaningVi: "điểm chung, thông dụng" },
      { word: "交通", hiragana: "こうつう", meaningVi: "giao thông đi lại" }
    ]
  },
  6: {
    summaryVi: "Đáp án chính xác: 3.",
    correctReasonVi: "「取引」（とりひき - THỦ DẪN）nghĩa là giao dịch, quan hệ làm ăn buôn bán.",
    optionReasonsVi: {
      "1": "SAI: 「しゅいん」 là chữ Hán「朱印」[CHU ẤN] (con dấu đỏ ở đền chùa).",
      "2": "SAI: 「しゅういん」 là chữ Hán「衆院」[CHÚNG VIỆN] (Hạ nghị viện Nhật Bản).",
      "3": "ĐÚNG: 「取引」 đọc là「とりひき」[THỦ DẪN] (nghĩa là giao dịch buôn bán, quan hệ làm ăn).",
      "4": "SAI: 「とりびき」 bẫy biến âm đục, 引 đọc âm kun là ひき, không đục thành びき."
    },
    vocabulary: [
      { word: "取引", hiragana: "とりひき", meaningVi: "giao dịch làm ăn" },
      { word: "引く", hiragana: "ひく", meaningVi: "kéo, tra từ điển" }
    ]
  },
  7: {
    summaryVi: "Đáp án chính xác: 2.",
    correctReasonVi: "「予報」（よほう - DỰ BÁO）nghĩa là dự báo thời tiết.",
    optionReasonsVi: {
      "1": "SAI: 「ようほう」 bẫy thừa trường âm; chữ 予 chỉ đọc là よ (ngắn), ようほう là 養蜂 [DƯỠNG PHONG - nuôi ong].",
      "2": "ĐÚNG: 「予報」 đọc là「よほう」[DỰ BÁO] (天気予報: dự báo thời tiết).",
      "3": "SAI: 「ようぼう」 là chữ Hán「要望」[YẾU VỌNG] (yêu cầu, nguyện vọng).",
      "4": "SAI: 「よぼう」 là chữ Hán「予防」[DỰ PHÒNG] (phòng chống, ngăn ngừa dịch bệnh)."
    },
    vocabulary: [
      { word: "予報", hiragana: "よほう", meaningVi: "dự báo" },
      { word: "天気予報", hiragana: "てんきよほう", meaningVi: "dự báo thời tiết" },
      { word: "予防", hiragana: "よぼう", meaningVi: "phòng ngừa bệnh tật" },
      { word: "要望", hiragana: "ようぼう", meaningVi: "nguyện vọng, yêu cầu" }
    ]
  },
  8: {
    summaryVi: "Đáp án chính xác: 4.",
    correctReasonVi: "「広告」（こうこく - QUẢNG CÁO）nghĩa là quảng cáo.",
    optionReasonsVi: {
      "1": "SAI: 「ここっく」 sai hoàn toàn âm on của cả hai chữ.",
      "2": "SAI: 「こうこっく」 bẫy biến âm ngắt sai.",
      "3": "SAI: 「こうこ」 thiếu âm く (chữ 告 đọc là こく); こうこ có thể là 考古 [KHẢO CỔ].",
      "4": "ĐÚNG: 「広告」 đọc là「こうこく」[QUẢNG CÁO] (nghĩa là quảng cáo sản phẩm mới trên tạp chí)."
    },
    vocabulary: [
      { word: "広告", hiragana: "こうこく", meaningVi: "quảng cáo" },
      { word: "新商品", hiragana: "しんしょうひん", meaningVi: "sản phẩm mới" }
    ]
  },
  9: {
    summaryVi: "Đáp án chính xác: 2.",
    correctReasonVi: "「やいて」 là thể て của động từ 焼く [THIÊU] (nướng thịt).",
    optionReasonsVi: {
      "1": "SAI: 「燃いて」 sai cấu tạo động từ; chữ 燃 [NHIÊN] nằm trong tự động từ 燃える [もえる - bốc cháy].",
      "2": "ĐÚNG: 「焼いて」 là thể て của động từ「焼く」[THIÊU] (nghĩa là nướng thịt, nướng bánh).",
      "3": "SAI: 「炒いて」 là thể て của động từ「炒る」[SAO] (nghĩa là rang đậu, sao trà).",
      "4": "SAI: 「炊いて」 là thể て của động từ「炊く」[XUY] (nghĩa là nấu cơm - ご飯を炊く)."
    },
    vocabulary: [
      { word: "焼く", hiragana: "やく", meaningVi: "nướng thịt, nướng cá" },
      { word: "炊く", hiragana: "たく", meaningVi: "nấu cơm" },
      { word: "燃える", hiragana: "もえる", meaningVi: "cháy bùng" }
    ]
  },
  10: {
    summaryVi: "Đáp án chính xác: 3.",
    correctReasonVi: "「おれて」 là thể て của 折れる [CHIẾT] (gãy cành cây).",
    optionReasonsVi: {
      "1": "SAI: 「押れて」 sai chữ Hán; chữ 押 [ÁP] nằm trong 押す [おす - ấn, đẩy].",
      "2": "SAI: 「打れて」 sai chữ Hán; chữ 打 [ĐẢ] nằm trong 打つ [うつ - đánh, gõ].",
      "3": "ĐÚNG: 「折れて」 là thể て của tự động từ「折れる」[CHIẾT] (cành cây gãy - 木の枝が折れる).",
      "4": "SAI: 「投れて」 sai chữ Hán; chữ 投 [ĐẦU] nằm trong 投げる [なげる - ném]."
    },
    vocabulary: [
      { word: "折れる", hiragana: "おれる", meaningVi: "bị gãy (cành cây)" },
      { word: "枝", hiragana: "えだ", meaningVi: "cành cây" },
      { word: "押す", hiragana: "おす", meaningVi: "ấn, đẩy" }
    ]
  },
  11: {
    summaryVi: "Đáp án chính xác: 4.",
    correctReasonVi: "「いそがしく」 là dạng phó từ của tính từ 忙しい [MANG] (bận rộn).",
    optionReasonsVi: {
      "1": "SAI: 「盲しく」 sai chữ Hán; chữ 盲 [MANH] nghĩa là mù lòa.",
      "2": "SAI: 「亡しく」 sai chữ Hán; chữ 亡 [VONG] nghĩa là mất mát, chết.",
      "3": "SAI: 「忘しく」 sai chữ Hán; chữ 忘 [VONG] nằm trong động từ 忘れる [わすれる - quên].",
      "4": "ĐÚNG: 「忙しく」 là dạng biến đổi của tính từ「忙しい」[MANG] (công việc dần trở nên bận rộn)."
    },
    vocabulary: [
      { word: "忙しい", hiragana: "いそがしい", meaningVi: "bận rộn" },
      { word: "忘れる", hiragana: "わすれる", meaningVi: "quên lãng" }
    ]
  },
  12: {
    summaryVi: "Đáp án chính xác: 1.",
    correctReasonVi: "「しゅうしょく」 chữ Hán là 就職 [TỰU CHỨC] (tìm việc làm, đi làm).",
    optionReasonsVi: {
      "1": "ĐÚNG: 「就職」[TỰU CHỨC] nghĩa là tìm việc làm, xin vào làm việc ở công ty (就職活動: hoạt động tìm việc).",
      "2": "SAI: 「修職」 sai chữ 修 [TU] (trong 修理 - sửa chữa, 研修 - tu nghiệp).",
      "3": "SAI: 「集職」 sai chữ 集 [TẬP] (trong 集まる - tập hợp).",
      "4": "SAI: 「収職」 sai chữ 収 [THU] (trong 収入 - thu nhập)."
    },
    vocabulary: [
      { word: "就職", hiragana: "しゅうしょく", meaningVi: "tìm việc làm, đi làm" },
      { word: "就職活動", hiragana: "しゅうしょくかつどう", meaningVi: "hoạt động tìm việc làm" }
    ]
  },
  13: {
    summaryVi: "Đáp án chính xác: 3.",
    correctReasonVi: "「ちきゅう」 chữ Hán là 地球 [ĐỊA CẦU] (Trái Đất).",
    optionReasonsVi: {
      "1": "SAI: 「他球」 sai chữ 他 [THA] (nghĩa là người khác, vật khác).",
      "2": "SAI: 「他救」 sai cả hai chữ Hán; 救 [CỨU] là cứu giúp.",
      "3": "ĐÚNG: 「地球」[ĐỊA CẦU] nghĩa là Trái Đất (bề mặt Trái Đất có 70% là biển).",
      "4": "SAI: 「地求」 sai chữ 求 [CẦU] (trong 要求 - yêu cầu)."
    },
    vocabulary: [
      { word: "地球", hiragana: "ちきゅう", meaningVi: "Trái Đất" },
      { word: "表面", hiragana: "ひょうめん", meaningVi: "bề mặt" }
    ]
  },
  14: {
    summaryVi: "Đáp án chính xác: 1.",
    correctReasonVi: "「せき」 chữ Hán là 席 [TỊCH] (chỗ ngồi, ghế ngồi).",
    optionReasonsVi: {
      "1": "ĐÚNG: 「席」[TỊCH] nghĩa là chỗ ngồi (đến trễ nên không còn chỗ ngồi).",
      "2": "SAI: 「度」[ĐỘ] là số lần, nhiệt độ (trong 今度 - lần này, 温度 - nhiệt độ).",
      "3": "SAI: 「渡」[ĐỘ] nằm trong động từ 渡る [わたる - băng qua đường/qua sông].",
      "4": "SAI: 「座」[TỌA] nằm trong động từ 座る [すわる - ngồi]; danh từ chỉ chỗ ngồi phải ghép thành 座席 [ざせき]."
    },
    vocabulary: [
      { word: "席", hiragana: "せき", meaningVi: "chỗ ngồi" },
      { word: "座る", hiragana: "すわる", meaningVi: "ngồi xuống" },
      { word: "座席", hiragana: "ざせき", meaningVi: "ghế ngồi, chỗ ngồi" }
    ]
  }
};

const EXAM_UPDATES_02 = {
  1: {
    summaryVi: "Đáp án chính xác: 4.",
    correctReasonVi: "「統一」（とういつ - THỐNG NHẤT）nghĩa là thống nhất đất nước.",
    optionReasonsVi: {
      "1": "SAI: 「といち」 sai âm on của 統 (phải đọc trường âm とう).",
      "2": "SAI: 「といつ」 thiếu trường âm とう.",
      "3": "SAI: 「とういち」 sai âm đọc của chữ 一 (trong 統一 đọc là いつ).",
      "4": "ĐÚNG: 「統一」 đọc là「とういつ」[THỐNG NHẤT] (đất nước được thống nhất đã được 30 năm)."
    },
    vocabulary: [
      { word: "統一", hiragana: "とういつ", meaningVi: "thống nhất quốc gia" }
    ]
  },
  2: {
    summaryVi: "Đáp án chính xác: 2.",
    correctReasonVi: "「重ねて」（かさねて - TRỌNG）là thể て của 重ねる (xếp chồng, chồng lên).",
    optionReasonsVi: {
      "1": "SAI: 「おもねて」 là chữ Hán「阿ねて」[A] (nghĩa là nịnh hót, a dua).",
      "2": "ĐÚNG: 「重ねて」 là thể て của động từ「重ねる」[TRỌNG] (nghĩa là xếp chồng tài liệu lên nhau).",
      "3": "SAI: 「たばねて」 là chữ Hán「束ねて」[THÚC] (nghĩa là bó lại, buộc thành bó).",
      "4": "SAI: 「たずねて」 là chữ Hán「尋ねて」[TẦM] (hỏi han) hoặc「訪ねて」[PHÓNG] (ghé thăm)."
    },
    vocabulary: [
      { word: "重ねる", hiragana: "かさねる", meaningVi: "xếp chồng lên, lặp lại" },
      { word: "束ねる", hiragana: "たばねる", meaningVi: "bó lại, buộc lại" },
      { word: "訪ねる", hiragana: "たずねる", meaningVi: "ghé thăm" }
    ]
  },
  3: {
    summaryVi: "Đáp án chính xác: 1.",
    correctReasonVi: "「世代」（せだい - THẾ ĐẠI）nghĩa là thế hệ.",
    optionReasonsVi: {
      "1": "ĐÚNG: 「世代」 đọc là「せだい」[THẾ ĐẠI] (thế hệ khác nhau thì cách suy nghĩ cũng khác nhau).",
      "2": "SAI: 「せいだい」 là chữ Hán「盛大」[THỊNH ĐẠI] (nghĩa là linh đình, hoành tráng; bẫy thừa trường âm せい).",
      "3": "SAI: 「せたい」 là chữ Hán「世帯」[THẾ ĐỚI] (nghĩa là hộ gia đình).",
      "4": "SAI: 「せいたい」 là chữ Hán「生態」[SINH THÁI] (hệ sinh thái) hoặc「正体」[CHÍNH THỂ] (chân tướng)."
    },
    vocabulary: [
      { word: "世代", hiragana: "せだい", meaningVi: "thế hệ" },
      { word: "世帯", hiragana: "せたい", meaningVi: "hộ gia đình" }
    ]
  },
  4: {
    summaryVi: "Đáp án chính xác: 3.",
    correctReasonVi: "「片道」（かたみち - PHIẾN ĐẠO）nghĩa là đường một chiều, lượt đi.",
    optionReasonsVi: {
      "1": "SAI: 「へんみち」 bẫy âm on của 片 là へん (như trong 破片 - mảnh vỡ).",
      "2": "SAI: 「へんどう」 là chữ Hán「変動」[BIẾN ĐỘNG] (biến động).",
      "3": "ĐÚNG: 「片道」 đọc là「かたみち」[PHIẾN ĐẠO] (nghĩa là một chiều; đi đến công ty một chiều mất 1 tiếng).",
      "4": "SAI: 「かたどう」 sai âm đọc của chữ 道 (trong từ này đọc âm kun là みち)."
    },
    vocabulary: [
      { word: "片道", hiragana: "かたみち", meaningVi: "một chiều (lượt đi)" },
      { word: "往復", hiragana: "おうふく", meaningVi: "khứ hồi (hai chiều)" }
    ]
  },
  5: {
    summaryVi: "Đáp án chính xác: 2.",
    correctReasonVi: "「無事」（ぶじ - VÔ SỰ）nghĩa là bình an vô sự, an toàn.",
    optionReasonsVi: {
      "1": "SAI: 「むじ」 là chữ Hán「無地」[VÔ ĐỊA] (nghĩa là vải trơn, không có họa tiết).",
      "2": "ĐÚNG: 「無事」 đọc là「ぶじ」[VÔ SỰ] (chuyến du lịch đã trở về bình an vô sự).",
      "3": "SAI: 「むうじ」 sai trường âm.",
      "4": "SAI: 「ぶうじ」 sai trường âm."
    },
    vocabulary: [
      { word: "無事", hiragana: "ぶじ", meaningVi: "bình an vô sự" },
      { word: "無地", hiragana: "むじ", meaningVi: "trơn, không họa tiết" }
    ]
  },
  6: {
    summaryVi: "Đáp án chính xác: 4.",
    correctReasonVi: "「底」（そこ - ĐỂ）nghĩa là phần đáy.",
    optionReasonsVi: {
      "1": "SAI: 「ふた」 là chữ Hán「蓋」[CÁI] (nghĩa là cái nắp đậy).",
      "2": "SAI: 「よこ」 là chữ Hán「横」[HOÀNH] (nghĩa là bên cạnh, bề ngang).",
      "3": "SAI: 「わき」 là chữ Hán「脇」[HIỆP] (nghĩa là bên hông, nách).",
      "4": "ĐÚNG: 「底」 đọc là「そこ」[ĐỂ] (nghĩa là phần đáy của chiếc hộp bị thủng một lỗ nhỏ)."
    },
    vocabulary: [
      { word: "底", hiragana: "そこ", meaningVi: "phần đáy" },
      { word: "蓋", hiragana: "ふた", meaningVi: "cái nắp đậy" },
      { word: "横", hiragana: "よこ", meaningVi: "bên cạnh, bề ngang" }
    ]
  },
  7: {
    summaryVi: "Đáp án chính xác: 3.",
    correctReasonVi: "「指示」（しじ - CHỈ THỊ）nghĩa là chỉ thị, hướng dẫn chỉ đạo.",
    optionReasonsVi: {
      "1": "SAI: 「ゆびじ」 bẫy âm kun của 指 là ゆび (ngón tay).",
      "2": "SAI: 「ゆびし」 sai âm đọc.",
      "3": "ĐÚNG: 「指示」 đọc là「しじ」[CHỈ THỊ] (việc quan trọng sẽ có chỉ thị trực tiếp từ giám đốc).",
      "4": "SAI: 「じじ」 là chữ Hán「時事」[THỜI SỰ] (việc đương thời) hoặc「祖父」[TỔ PHỤ - ông lão]."
    },
    vocabulary: [
      { word: "指示", hiragana: "しじ", meaningVi: "chỉ thị, hướng dẫn" },
      { word: "直接", hiragana: "ちょくせつ", meaningVi: "trực tiếp" }
    ]
  },
  8: {
    summaryVi: "Đáp án chính xác: 1.",
    correctReasonVi: "「過去」（かこ - QUÁ KHỨ）nghĩa là quá khứ.",
    optionReasonsVi: {
      "1": "ĐÚNG: 「過去」 đọc là「かこ」[QUÁ KHỨ] (nghĩa là không quên những chuyện trong quá khứ).",
      "2": "SAI: 「かこう」 là chữ Hán「加工」[GIA CÔNG] hoặc「下降」[HẠ GIÁNG] (đi xuống).",
      "3": "SAI: 「かきょ」 là chữ Hán「科挙」[KHOA CỬ] (thi khoa cử).",
      "4": "SAI: 「かきょう」 là chữ Hán「佳境」[GIA CẢNH] (giai đoạn cao trào)."
    },
    vocabulary: [
      { word: "過去", hiragana: "かこ", meaningVi: "quá khứ" },
      { word: "現在", hiragana: "げんざい", meaningVi: "hiện tại" },
      { word: "未来", hiragana: "みらい", meaningVi: "tương lai" }
    ]
  },
  9: {
    summaryVi: "Đáp án chính xác: 4.",
    correctReasonVi: "「はしら」 chữ Hán là 柱 [TRỤ] (cột nhà, trụ cột).",
    optionReasonsVi: {
      "1": "SAI: 「株」[CHU] nghĩa là gốc cây, cổ phiếu (trong 株式会社 - công ty cổ phần).",
      "2": "SAI: 「札」[TRÁT] nghĩa là tấm thẻ, tờ tiền giấy (như trong お札, 改札口).",
      "3": "SAI: 「橋」[KIỀU] nghĩa là cây cầu bắc qua sông.",
      "4": "ĐÚNG: 「柱」[TRỤ] nghĩa là cây cột, trụ nhà (nhìn thấy chiếc cột lớn ở đằng xa)."
    },
    vocabulary: [
      { word: "柱", hiragana: "はしら", meaningVi: "cột nhà, trụ" },
      { word: "橋", hiragana: "はし", meaningVi: "cây cầu" },
      { word: "株", hiragana: "かぶ", meaningVi: "cổ phiếu, gốc cây" }
    ]
  },
  10: {
    summaryVi: "Đáp án chính xác: 3.",
    correctReasonVi: "「やさしい」 trong ngữ cảnh bài kiểm tra là 易しい [DỊ] (dễ dàng).",
    optionReasonsVi: {
      "1": "SAI: 「低い」[ĐÊ] nghĩa là thấp (về chiều cao, nhiệt độ, âm thanh).",
      "2": "SAI: 「安い」[AN] nghĩa là giá rẻ, an tâm.",
      "3": "ĐÚNG: 「易しい」[DỊ] nghĩa là dễ dàng (bài kiểm tra này rất dễ). Lưu ý: 優しい [ƯU] là hiền lành, tốt bụng.",
      "4": "SAI: 「単い」 sai cấu tạo ngữ pháp, từ chỉ tính chất đơn giản là 簡単 [かんたん - ĐƠN GIẢN]."
    },
    vocabulary: [
      { word: "易しい", hiragana: "やさしい", meaningVi: "dễ dàng (đề thi, bài toán)" },
      { word: "優しい", hiragana: "やさしい", meaningVi: "hiền lành, dịu dàng" },
      { word: "簡単", hiragana: "かんたん", meaningVi: "đơn giản" }
    ]
  },
  11: {
    summaryVi: "Đáp án chính xác: 3.",
    correctReasonVi: "「かいけつ」 chữ Hán là 解決 [GIẢI QUYẾT] (giải quyết vấn đề).",
    optionReasonsVi: {
      "1": "SAI: 「改決」 sai chữ 改 [CẢI] (trong 改革 - cải cách, 改める - sửa đổi).",
      "2": "SAI: 「改結」 sai cả hai chữ Hán.",
      "3": "ĐÚNG: 「解決」[GIẢI QUYẾT] nghĩa là giải quyết vấn đề càng sớm càng tốt.",
      "4": "SAI: 「解結」 sai chữ 結 [KẾT] (trong 結果 - kết quả, 結論 - kết luận)."
    },
    vocabulary: [
      { word: "解決", hiragana: "かいけつ", meaningVi: "giải quyết vấn đề" },
      { word: "改革", hiragana: "かいかく", meaningVi: "cải cách" }
    ]
  },
  12: {
    summaryVi: "Đáp án chính xác: 2.",
    correctReasonVi: "「つもって」 là thể て của 積もる [TÍCH] (tuyết phủ dày, chất đống).",
    optionReasonsVi: {
      "1": "SAI: 「責もって」 sai chữ 責 [TRÁCH] (trong 責任 - trách nhiệm).",
      "2": "ĐÚNG: 「積もって」 là thể て của động từ「積もる」[TÍCH] (tuyết rơi chất đống, tích tụ dày).",
      "3": "SAI: 「績もって」 sai chữ 績 [TÍCH] (trong 成績 - thành tích).",
      "4": "SAI: 「債もって」 sai chữ 債 [TRÁI] (trong 負債 - nợ nần, 債券 - trái phiếu)."
    },
    vocabulary: [
      { word: "積もる", hiragana: "つもる", meaningVi: "chất đống, tuyết tích tụ" },
      { word: "責任", hiragana: "せきにん", meaningVi: "trách nhiệm" },
      { word: "成績", hiragana: "せいせき", meaningVi: "thành tích học tập" }
    ]
  },
  13: {
    summaryVi: "Đáp án chính xác: 1.",
    correctReasonVi: "「せいけつ」 chữ Hán là 清潔 [THANH KHIẾT] (sạch sẽ, tinh tươm).",
    optionReasonsVi: {
      "1": "ĐÚNG: 「清潔」[THANH KHIẾT] nghĩa là sạch sẽ, vệ sinh (luôn giữ nhà bếp sạch sẽ tinh tươm).",
      "2": "SAI: 「精潔」 sai chữ 精 [TINH] (trong 精神 - tinh thần, 精密 - tinh vi).",
      "3": "SAI: 「静潔」 sai chữ 静 [TĨNH] (trong 静か - yên tĩnh).",
      "4": "SAI: 「晴潔」 sai chữ 晴 [TÌNH] (trong 晴れ - trời nắng ráo)."
    },
    vocabulary: [
      { word: "清潔", hiragana: "せいけつ", meaningVi: "sạch sẽ, hợp vệ sinh" },
      { word: "台所", hiragana: "だいどころ", meaningVi: "nhà bếp" }
    ]
  },
  14: {
    summaryVi: "Đáp án chính xác: 4.",
    correctReasonVi: "「いわった」 là thể quá khứ của 祝う [CHÚC] (chúc mừng).",
    optionReasonsVi: {
      "1": "SAI: 「税った」 sai chữ 税 [THUẾ] (trong 税金 - tiền thuế).",
      "2": "SAI: 「礼った」 sai chữ 礼 [LỄ] (trong お礼 - lời cảm ơn, 礼儀 - lễ nghi phép tắc).",
      "3": "SAI: 「祈った」 là thể quá khứ của 祈る [いのる - KỲ] (nghĩa là cầu nguyện).",
      "4": "ĐÚNG: 「祝った」 là thể quá khứ của động từ「祝う」[CHÚC] (mọi người cùng chúc mừng bạn đỗ đại học)."
    },
    vocabulary: [
      { word: "祝う", hiragana: "いわう", meaningVi: "chúc mừng" },
      { word: "合格", hiragana: "ごうかく", meaningVi: "đỗ, trúng tuyển" },
      { word: "祈る", hiragana: "いのる", meaningVi: "cầu nguyện" }
    ]
  }
};

function applyUpdates(filePath, updates) {
  const content = JSON.parse(fs.readFileSync(filePath, "utf8"));
  let updatedCount = 0;
  
  content.questions.forEach(q => {
    if (updates[q.number]) {
      const u = updates[q.number];
      q.explanation.summaryVi = u.summaryVi;
      q.explanation.correctReasonVi = u.correctReasonVi;
      q.explanation.optionReasonsVi = u.optionReasonsVi;
      if (u.vocabulary) {
        q.explanation.vocabulary = u.vocabulary;
      }
      updatedCount++;
    }
  });

  fs.writeFileSync(filePath, JSON.stringify(content, null, 2), "utf8");
  console.log(`Đã cập nhật ${updatedCount} câu hỏi trong ${filePath}`);
}

applyUpdates("public/data/exams/n3-best-moshi-03.json", EXAM_UPDATES_03);
applyUpdates("public/data/exams/n3-best-moshi-02.json", EXAM_UPDATES_02);
console.log("Hoàn tất cập nhật!");

