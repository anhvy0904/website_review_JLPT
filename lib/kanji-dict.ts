// Từ điển ánh xạ Hiragana -> Chữ Hán (Kanji), Âm Hán Việt và Nghĩa tiếng Việt
// Phục vụ việc hiển thị chữ Hán tương ứng bên cạnh các đáp án trắc nghiệm JLPT N5 - N1
import { getHanViet, isKanji, extractTestedTarget } from "./hanviet";

export interface OptionKanjiInfo {
  kanji: string;           // Chữ Hán hoặc từ chứa Kanji
  hanViet: string;          // Âm Hán Việt viết hoa
  meaningVi?: string;       // Nghĩa tiếng Việt súc tích
  hiragana?: string;        // Cách đọc Hiragana chuẩn
  isQuestionTarget?: boolean; // Khớp với từ trọng tâm của câu hỏi
}

export const HIRAGANA_TO_KANJI_DICT: Record<string, { kanji: string; hanViet: string; meaningVi: string }> = {
  // --- Từ chỉ vị trí, phương hướng & nơi chốn ---
  "となり": { kanji: "隣", hanViet: "LÂN", meaningVi: "bên cạnh, hàng xóm" },
  "そば": { kanji: "側 / 傍", hanViet: "TRẮC / BÀNG", meaningVi: "bên cạnh, gần bên" },
  "さか": { kanji: "坂", hanViet: "PHẢN", meaningVi: "con dốc" },
  "かど": { kanji: "角", hanViet: "GIÁC", meaningVi: "góc đường, góc phố" },
  "すみ": { kanji: "隅", hanViet: "NGUNG", meaningVi: "góc trong, xó nhà" },
  "おく": { kanji: "奥", hanViet: "ÁO", meaningVi: "phía trong sâu" },
  "よこ": { kanji: "横", hanViet: "HOÀNH", meaningVi: "bề ngang, bên cạnh" },
  "わき": { kanji: "脇", hanViet: "HIỆP", meaningVi: "bên hông, nách" },
  "そこ": { kanji: "底", hanViet: "ĐỂ", meaningVi: "phần đáy" },
  "ふた": { kanji: "蓋", hanViet: "CÁI", meaningVi: "cái nắp" },
  "むかい": { kanji: "向かい", hanViet: "HƯỚNG", meaningVi: "đối diện" },
  "うら": { kanji: "裏", hanViet: "LÝ", meaningVi: "mặt sau, phía sau" },
  "おもて": { kanji: "表", hanViet: "BIỂU", meaningVi: "mặt trước, bề nổi" },
  "みぎ": { kanji: "右", hanViet: "HỮU", meaningVi: "bên phải" },
  "ひだり": { kanji: "左", hanViet: "TẢ", meaningVi: "bên trái" },
  "うえ": { kanji: "上", hanViet: "THƯỢNG", meaningVi: "phía trên" },
  "した": { kanji: "下", hanViet: "HẠ", meaningVi: "phía dưới" },
  "まえ": { kanji: "前", hanViet: "TIỀN", meaningVi: "phía trước" },
  "うしろ": { kanji: "後ろ", hanViet: "HẬU", meaningVi: "phía sau" },
  "なか": { kanji: "中", hanViet: "TRUNG", meaningVi: "bên trong" },
  "そと": { kanji: "外", hanViet: "NGOẠI", meaningVi: "bên ngoài" },
  "あいだ": { kanji: "間", hanViet: "GIAN", meaningVi: "ở giữa" },
  "ちかく": { kanji: "近く", hanViet: "CẬN", meaningVi: "gần đây" },
  "とおく": { kanji: "遠く", hanViet: "VIỄN", meaningVi: "ở xa" },
  "まわり": { kanji: "周り / 回り", hanViet: "CHU / HỒI", meaningVi: "xung quanh" },

  // --- Màu sắc ---
  "あお": { kanji: "青", hanViet: "THANH", meaningVi: "màu xanh dương" },
  "むらさき": { kanji: "紫", hanViet: "TỬ", meaningVi: "màu tím" },
  "みどり": { kanji: "緑", hanViet: "LỤC", meaningVi: "màu xanh lá cây" },
  "ちゃ": { kanji: "茶", hanViet: "TRÀ", meaningVi: "trà, màu nâu" },
  "くろ": { kanji: "黒", hanViet: "HẮC", meaningVi: "màu đen" },
  "しろ": { kanji: "白", hanViet: "BẠCH", meaningVi: "màu trắng" },
  "あか": { kanji: "赤", hanViet: "XÍCH", meaningVi: "màu đỏ" },
  "きいろ": { kanji: "黄色", hanViet: "HOÀNG SẮC", meaningVi: "màu vàng" },
  "はいいろ": { kanji: "灰色", hanViet: "HÔI SẮC", meaningVi: "màu xám" },

  // --- Tính từ thường gặp ---
  "したしい": { kanji: "親しい", hanViet: "THÂN", meaningVi: "thân thiết, gần gũi" },
  "めずらしい": { kanji: "珍しい", hanViet: "TRÂN", meaningVi: "hiếm thấy, khác lạ" },
  "あたらしい": { kanji: "新しい", hanViet: "TÂN", meaningVi: "mới mẻ" },
  "ふるい": { kanji: "古い", hanViet: "CỔ", meaningVi: "cũ kỹ" },
  "やさしい": { kanji: "優しい / 易しい", hanViet: "ƯU / DỊ", meaningVi: "hiền lành / dễ hiểu" },
  "きびしい": { kanji: "厳しい", hanViet: "NGHIÊM", meaningVi: "nghiêm khắc" },
  "すずしい": { kanji: "涼しい", hanViet: "LƯƠNG", meaningVi: "mát mẻ" },
  "あたたかい": { kanji: "暖かい / 温かい", hanViet: "NOÃN / ÔN", meaningVi: "ấm áp" },
  "おもい": { kanji: "重い", hanViet: "TRỌNG", meaningVi: "nặng nề" },
  "かるい": { kanji: "軽い", hanViet: "KHINH", meaningVi: "nhẹ nhàng" },
  "ふかい": { kanji: "深い", hanViet: "THÂM", meaningVi: "sâu sắc, sâu" },
  "あさい": { kanji: "浅い", hanViet: "THIỂN", meaningVi: "nông cạn" },
  "ひろい": { kanji: "広い", hanViet: "QUẢNG", meaningVi: "rộng rãi" },
  "せまい": { kanji: "狭い", hanViet: "HIỆP", meaningVi: "chật hẹp" },
  "こまかい": { kanji: "細かい", hanViet: "TẾ", meaningVi: "chi tiết, nhỏ lẻ" },
  "あらい": { kanji: "粗い / 荒い", hanViet: "THÔ / HOANG", meaningVi: "thô ráp / dữ dội" },
  "いそがしい": { kanji: "忙しい", hanViet: "MANG", meaningVi: "bận rộn" },
  "くるしい": { kanji: "苦しい", hanViet: "KHỔ", meaningVi: "đau khổ, khó thở" },
  "かなしい": { kanji: "悲しい", hanViet: "BI", meaningVi: "đau buồn" },
  "うれしい": { kanji: "嬉しい", hanViet: "HỈ", meaningVi: "vui mừng" },
  "たのしい": { kanji: "楽しい", hanViet: "LẠC", meaningVi: "vui vẻ" },
  "ほしい": { kanji: "欲しい", hanViet: "DỤC", meaningVi: "mong muốn" },
  "おとなしい": { kanji: "大人しい", hanViet: "ĐẠI NHÂN", meaningVi: "ngoan ngoãn, điềm đạm" },

  // --- Động từ & dạng chia thể て ---
  "おくって": { kanji: "送って / 贈って", hanViet: "TỐNG / TẶNG", meaningVi: "gửi đi / tặng quà" },
  "くばって": { kanji: "配って", hanViet: "PHỐI", meaningVi: "phân phát, chia phát" },
  "あずかって": { kanji: "預かって", hanViet: "DỰ", meaningVi: "trông nom, giữ hộ" },
  "ひろって": { kanji: "拾って", hanViet: "THẬP", meaningVi: "nhặt lấy" },
  "すてて": { kanji: "捨てて", hanViet: "XÁ", meaningVi: "vứt bỏ" },
  "うって": { kanji: "打つ / 売る", hanViet: "ĐẢ / MẠI", meaningVi: "đánh, đập / bán hàng" },
  "とって": { kanji: "取って / 撮って", hanViet: "THỦ / TOÁT", meaningVi: "lấy, cầm / chụp ảnh" },
  "もって": { kanji: "持って", hanViet: "TRÌ", meaningVi: "cầm, mang theo" },
  "かって": { kanji: "買って / 飼って", hanViet: "MÃI / TỰ", meaningVi: "mua sắm / nuôi thú" },
  "かさねて": { kanji: "重ねて", hanViet: "TRỌNG", meaningVi: "chồng lên, lặp lại" },
  "たばねて": { kanji: "束ねて", hanViet: "THÚC", meaningVi: "bó lại, buộc lại" },
  "たずねて": { kanji: "尋ねて / 訪ねて", hanViet: "TẦM / PHÓNG", meaningVi: "hỏi thăm / ghé thăm" },
  "おもねて": { kanji: "阿ねて", hanViet: "A", meaningVi: "nịnh hót, a dua" },
  "けずる": { kanji: "削る", hanViet: "TƯỚC", meaningVi: "gọt, bào, cắt giảm" },
  "きる": { kanji: "切る / 着る", hanViet: "THIẾT / TRƯỚC", meaningVi: "cắt / mặc áo" },
  "しぼる": { kanji: "絞る / 搾る", hanViet: "GIẢO / TRÁ", meaningVi: "vắt khăn / ép nước" },
  "おす": { kanji: "押す / 推す", hanViet: "ÁP / THÔI", meaningVi: "ấn, đẩy / đề cử" },
  "ひく": { kanji: "引く", hanViet: "DẪN", meaningVi: "kéo, tra từ điển" },
  "やいて": { kanji: "焼いて", hanViet: "THIÊU", meaningVi: "nướng thịt, rang" },
  "もえて": { kanji: "燃えて", hanViet: "NHIÊN", meaningVi: "cháy bùng" },
  "たいて": { kanji: "炊いて", hanViet: "XUY", meaningVi: "nấu cơm" },
  "おれて": { kanji: "折れて", hanViet: "CHIẾT", meaningVi: "gãy cành, gập lại" },
  "おして": { kanji: "押して", hanViet: "ÁP", meaningVi: "ấn, xô đẩy" },
  "なげて": { kanji: "投げて", hanViet: "ĐẦU", meaningVi: "ném bóng" },
  "つもって": { kanji: "積もって", hanViet: "TÍCH", meaningVi: "tích tụ, tuyết rơi dày" },
  "いわった": { kanji: "祝った", hanViet: "CHÚC", meaningVi: "chúc mừng" },
  "いのった": { kanji: "祈った", hanViet: "KỲ", meaningVi: "cầu nguyện" },
  "とまり": { kanji: "泊まり / 止まり", hanViet: "BẠC / CHỈ", meaningVi: "trọ lại / dừng lại" },
  "かえり": { kanji: "帰り", hanViet: "QUY", meaningVi: "trở về nhà" },
  "まいり": { kanji: "参り", hanViet: "THAM", meaningVi: "đi, đến (khiêm nhường ngữ)" },
  "あがり": { kanji: "上がり", hanViet: "THƯỢNG", meaningVi: "đi lên, tăng lên" },
  "おり": { kanji: "降り / 下り", hanViet: "GIÁNG / HẠ", meaningVi: "xuống xe / đi xuống" },

  // --- Từ ghép 2 Kanji thường gặp (Mondai 1 & Mondai 2) ---
  "しょうひ": { kanji: "消費", hanViet: "TIÊU PHÍ", meaningVi: "tiêu dùng, tiêu thụ" },
  "ほぞん": { kanji: "保存", hanViet: "BẢO TỒN", meaningVi: "bảo tồn, lưu trữ" },
  "つうか": { kanji: "通過 / 通貨", hanViet: "THÔNG QUÁ / THÔNG HÓA", meaningVi: "đi qua / tiền tệ" },
  "みぶん": { kanji: "身分", hanViet: "THÂN PHÂN", meaningVi: "thân phận, địa vị xã hội" },
  "しんぶん": { kanji: "新聞", hanViet: "TÂN VĂN", meaningVi: "tờ báo" },
  "しゅるい": { kanji: "種類", hanViet: "CHỦNG LOẠI", meaningVi: "chủng loại, phân loại" },
  "とういつ": { kanji: "統一", hanViet: "THỐNG NHẤT", meaningVi: "thống nhất quốc gia" },
  "せだい": { kanji: "世代", hanViet: "THẾ ĐẠI", meaningVi: "thế hệ lứa tuổi" },
  "せいだい": { kanji: "盛大", hanViet: "THỊNH ĐẠI", meaningVi: "hoành tráng, long trọng" },
  "かたみち": { kanji: "片道", hanViet: "PHIẾN ĐẠO", meaningVi: "một chiều (vé đi)" },
  "おうふく": { kanji: "往復", hanViet: "VÃNG PHỤC", meaningVi: "khứ hồi (hai chiều)" },
  "ぶじ": { kanji: "無事", hanViet: "VÔ SỰ", meaningVi: "bình an vô sự" },
  "しじ": { kanji: "指示 / 支持", hanViet: "CHỈ THỊ / CHI TRÌ", meaningVi: "chỉ thị, hướng dẫn / ủng hộ" },
  "かこ": { kanji: "過去", hanViet: "QUÁ KHỨ", meaningVi: "quá khứ đã qua" },
  "みらい": { kanji: "未来", hanViet: "VỊ LAI", meaningVi: "tương lai xa" },
  "げんざい": { kanji: "現在", hanViet: "HIỆN TẠI", meaningVi: "thời điểm hiện tại" },
  "ごはん": { kanji: "ご飯", hanViet: "PHẠN", meaningVi: "bữa cơm, cơm" },
  "こうはん": { kanji: "後半", hanViet: "HẬU BÁN", meaningVi: "nửa sau, hiệp sau" },
  "ぜんはん": { kanji: "前半", hanViet: "TIỀN BÁN", meaningVi: "nửa đầu, hiệp đầu" },
  "ごばん": { kanji: "碁盤", hanViet: "KỲ BÀN", meaningVi: "bàn cờ vây" },
  "こうばん": { kanji: "交番", hanViet: "GIAO PHIÊN", meaningVi: "đồn cảnh sát góc phố" },
  "きょうつう": { kanji: "共通", hanViet: "CỘNG THÔNG", meaningVi: "điểm chung, thông dụng" },
  "こうつう": { kanji: "交通", hanViet: "GIAO THÔNG", meaningVi: "giao thông đi lại" },
  "とりひき": { kanji: "取引", hanViet: "THỦ DẪN", meaningVi: "giao dịch làm ăn" },
  "しゅいん": { kanji: "朱印", hanViet: "CHU ẤN", meaningVi: "con dấu đỏ đền chùa" },
  "しゅういん": { kanji: "衆院", hanViet: "CHÚNG VIỆN", meaningVi: "Hạ viện Nhật Bản" },
  "よほう": { kanji: "予報", hanViet: "DỰ BÁO", meaningVi: "dự báo thời tiết" },
  "ようぼう": { kanji: "要望", hanViet: "YẾU VỌNG", meaningVi: "yêu cầu, nguyện vọng" },
  "よぼう": { kanji: "予防", hanViet: "DỰ PHÒNG", meaningVi: "phòng ngừa bệnh tật" },
  "こうこく": { kanji: "広告", hanViet: "QUẢNG CÁO", meaningVi: "quảng cáo thông tin" },
  "ひじょうぐち": { kanji: "非常口", hanViet: "PHI THƯỜNG KHẨU", meaningVi: "cửa thoát hiểm nguy cấp" },
  "びしょう": { kanji: "微笑", hanViet: "VI TIẾU", meaningVi: "mỉm cười mỉm" },
  "しゅうしょく": { kanji: "就職", hanViet: "TỰU CHỨC", meaningVi: "tìm việc, đi làm" },
  "ちきゅう": { kanji: "地球", hanViet: "ĐỊA CẦU", meaningVi: "Trái Đất" },
  "せき": { kanji: "席", hanViet: "TỊCH", meaningVi: "chỗ ngồi, ghế ngồi" },
  "ざせき": { kanji: "座席", hanViet: "TỌA TỊCH", meaningVi: "chỗ ngồi chính thức" },
  "はしら": { kanji: "柱", hanViet: "TRỤ", meaningVi: "cột nhà, trụ cột" },
  "かいけつ": { kanji: "解決", hanViet: "GIẢI QUYẾT", meaningVi: "giải quyết vấn đề" },
  "せいけつ": { kanji: "清潔", hanViet: "THANH KHIẾT", meaningVi: "sạch sẽ, thanh khiết" },
  "かんせい": { kanji: "完成", hanViet: "HOÀN THÀNH", meaningVi: "hoàn thành xong" },
  "たいさく": { kanji: "対策", hanViet: "ĐỐI SÁCH", meaningVi: "biện pháp xử lý" },
  "しょうち": { kanji: "承知", hanViet: "THỪA TRI", meaningVi: "hiểu rõ, nhận thức" },
  "つごう": { kanji: "都合", hanViet: "ĐÔ HỢP", meaningVi: "điều kiện thuận tiện" },
  "きぼう": { kanji: "希望", hanViet: "HI VỌNG", meaningVi: "hi vọng, nguyện vọng" },
  "けいやく": { kanji: "契約", hanViet: "KHẾ ƯỚC", meaningVi: "hợp đồng giao kết" },
  "えんき": { kanji: "延期", hanViet: "DUYÊN KỲ", meaningVi: "trì hoãn, hoãn lại" },
  "やくそく": { kanji: "約束", hanViet: "ƯỚC THÚC", meaningVi: "lời hứa, cuộc hẹn" },

  // --- Từ tượng thanh, tượng hình (Onomatopoeia) ---
  "きらきら": { kanji: "きらきら", hanViet: "", meaningVi: "lấp lánh, sáng lung linh (ngôi sao, đôi mắt)" },
  "すらすら": { kanji: "すらすら", hanViet: "", meaningVi: "trôi chảy, lưu loát, trơn tru (đọc sách, giải đề)" },
  "どきどき": { kanji: "どきどき", hanViet: "", meaningVi: "hồi hộp, tim đập thình thịch (lo lắng, phấn khích)" },
  "ざあざあ": { kanji: "ざあざあ", hanViet: "", meaningVi: "mưa rào ào ào, tầm tã" },
  "ぴかぴか": { kanji: "ぴかぴか", hanViet: "", meaningVi: "sáng bóng loáng, nhấp nháy" },
  "さらさら": { kanji: "さらさら", hanViet: "", meaningVi: "mượt mà (tóc), róc rách (nước chảy)" },
  "ぺらぺら": { kanji: "ぺらぺら", hanViet: "", meaningVi: "nói lưu loát (ngoại ngữ), mỏng tanh (tờ giấy)" },
  "ばらばら": { kanji: "ばらばら", hanViet: "", meaningVi: "rời rạc, rải rác, tan tác" },
  "ぎっしり": { kanji: "ぎっしり", hanViet: "", meaningVi: "chật ních, lèn chặt, đầy ắp" },
  "ぴったり": { kanji: "ぴったり", hanViet: "", meaningVi: "vừa khít, chuẩn xác, vừa vặn" },
  "すっきり": { kanji: "すっきり", hanViet: "", meaningVi: "sảng khoái, nhẹ nhõm, gọn gàng" },
  "がっかり": { kanji: "がっかり", hanViet: "", meaningVi: "thất vọng, chán nản" },
  "ぐっすり": { kanji: "ぐっすり", hanViet: "", meaningVi: "ngủ say sưa, ngủ ngon giấc" },
  "はっきり": { kanji: "はっきり", hanViet: "", meaningVi: "rõ ràng, rành mạch" },
  "そっくり": { kanji: "そっくり", hanViet: "", meaningVi: "giống hệt nhau" },
  "のんびり": { kanji: "のんびり", hanViet: "", meaningVi: "thong thả, thảnh thơi, ung dung" },
  "うっかり": { kanji: "うっかり", hanViet: "", meaningVi: "lơ đễnh, vô ý, buột miệng" },
  "しっかり": { kanji: "しっかり", hanViet: "", meaningVi: "chắc chắn, vững vàng, nghiêm túc" },
  "いらいら": { kanji: "いらいら", hanViet: "", meaningVi: "sốt ruột, bực bội, bồn chồn" },
  "うろうろ": { kanji: "うろうろ", hanViet: "", meaningVi: "lảng vảng, đi loanh quanh không mục đích" },
  "うとうと": { kanji: "うとうと", hanViet: "", meaningVi: "ngủ gà ngủ gật, mơ màng" },
  "ぎりぎり": { kanji: "ぎりぎり", hanViet: "", meaningVi: "sát nút, suýt soát (giờ giấc, điểm số)" },
  "ごろごろ": { kanji: "ごろごろ", hanViet: "", meaningVi: "lăn lóc, sấm ầm ầm, lười biếng nằm nhà" },
  "そろそろ": { kanji: "そろそろ", hanViet: "", meaningVi: "sắp sửa, chuẩn bị đến lúc (chuẩn bị về)" },
  "どんどん": { kanji: "どんどん", hanViet: "", meaningVi: "nhanh chóng, liên tục dồn dập" },
  "だんだん": { kanji: "だんだん", hanViet: "", meaningVi: "dần dần, từng bước" },
  "ますます": { kanji: "ますます", hanViet: "", meaningVi: "ngày càng, càng ngày càng nhiều" },
  "まあまあ": { kanji: "まあまあ", hanViet: "", meaningVi: "tàm tạm, tàm tạm được" },

  // --- Phó từ & liên từ JLPT N3 ---
  "きっと": { kanji: "きっと", hanViet: "", meaningVi: "nhất định, chắc chắn (dự đoán có căn cứ)" },
  "やっぱり": { kanji: "やっぱり", hanViet: "", meaningVi: "quả nhiên, đúng như dự đoán" },
  "いきなり": { kanji: "いきなり", hanViet: "", meaningVi: "bất ngờ, đột ngột không báo trước" },
  "とうとう": { kanji: "とうとう", hanViet: "", meaningVi: "cuối cùng thì, rốt cuộc (sau một thời gian dài)" },
  "ずいぶん": { kanji: "随分", hanViet: "TÙY PHÂN", meaningVi: "khá là, tương đối nhiều" },
  "ぜったいに": { kanji: "絶対に", hanViet: "TUYỆT ĐỐI", meaningVi: "tuyệt đối không, nhất định phải" },
  "かならず": { kanji: "必ず", hanViet: "TẤT", meaningVi: "chắc chắn, nhất định" },
  "べつに": { kanji: "別に", hanViet: "BIỆT", meaningVi: "không có gì đặc biệt (đi với phủ định)" },
  "たしか": { kanji: "確か", hanViet: "XÁC", meaningVi: "chắc là, nếu nhớ không lầm" },
  "たしかに": { kanji: "確かに", hanViet: "XÁC", meaningVi: "đúng là như vậy, đích thực" },
  "なるべく": { kanji: "なるべく", hanViet: "", meaningVi: "cố gắng trong khả năng có thể" },
  "できるだけ": { kanji: "できるだけ", hanViet: "", meaningVi: "trong khả năng tối đa" },
  "たとえば": { kanji: "例えば", hanViet: "LỆ", meaningVi: "ví dụ như là" },
  "もしかしたら": { kanji: "もしかしたら", hanViet: "", meaningVi: "biết đâu chừng, có thể là" },
  "ついに": { kanji: "遂に", hanViet: "TOẠI", meaningVi: "cuối cùng thì (kết quả sau nhiều nỗ lực)" },

  // --- Từ mượn Katakana phổ biến ---
  "チェック": { kanji: "チェック", hanViet: "", meaningVi: "kiểm tra, rà soát (check)" },
  "アナウンス": { kanji: "アナウンス", hanViet: "", meaningVi: "thông báo, phát thanh trên tàu (announcement)" },
  "レコード": { kanji: "レコード", hanViet: "", meaningVi: "kỷ lục, đĩa hát (record)" },
  "アドバイス": { kanji: "アドバイス", hanViet: "", meaningVi: "lời khuyên, tư vấn (advice)" },
  "アイディア": { kanji: "アイディア", hanViet: "", meaningVi: "ý tưởng, sáng kiến (idea)" },
  "クイズ": { kanji: "クイズ", hanViet: "", meaningVi: "câu đố, trắc nghiệm (quiz)" },
  "チェンジ": { kanji: "チェンジ", hanViet: "", meaningVi: "thay đổi, hoán đổi (change)" },
  "メンバー": { kanji: "メンバー", hanViet: "", meaningVi: "thành viên (member)" },
  "ティッシュ": { kanji: "ティッシュ", hanViet: "", meaningVi: "khăn giấy, giấy ăn (tissue)" },
  "サークル": { kanji: "サークル", hanViet: "", meaningVi: "câu lạc bộ sinh viên (circle)" },

  // --- Động từ & danh từ xuất hiện trong ngữ cảnh câu hỏi ---
  "あらった": { kanji: "洗った", hanViet: "TẨY", meaningVi: "đã rửa (từ gốc 洗う)" },
  "さわった": { kanji: "触った", hanViet: "XÚC", meaningVi: "đã chạm, sờ vào (từ gốc 触る)" },
  "ふいた": { kanji: "拭いた", hanViet: "THỨC", meaningVi: "đã lau chùi (từ gốc 拭く)" },
  "はいた": { kanji: "掃いた / 履いた", hanViet: "TẢO / LÍ", meaningVi: "quét nhà / xỏ giày" },
  "むきあい": { kanji: "向き合い", hanViet: "HƯỚNG HỢP", meaningVi: "đối diện, giáp mặt nhau" },
  "つたえあい": { kanji: "伝え合い", hanViet: "TRUYỀN HỢP", meaningVi: "truyền đạt thông tin cho nhau" },
  "しりあい": { kanji: "知り合い", hanViet: "TRI HỢP", meaningVi: "người quen biết" },
  "ゆずりあい": { kanji: "ゆずり合い", hanViet: "NHƯỢNG HỢP", meaningVi: "nhường nhịn lẫn nhau" },
  "のりかえ": { kanji: "乗り換え", hanViet: "THỪA HOÁN", meaningVi: "đổi chuyến tàu, đổi xe" },
  "のりあわせ": { kanji: "乗り合わせ", hanViet: "THỪA HỢP", meaningVi: "đi chung xe, đi cùng chuyến" },
  "のりこし": { kanji: "乗り越し", hanViet: "THỪA VIỆT", meaningVi: "đi quá ga cần xuống" },
  "のりすごし": { kanji: "乗り過ごし", hanViet: "THỪA QUÁ", meaningVi: "ngủ quên/bỏ lỡ mất ga dừng" },
  "たいくつ": { kanji: "退屈", hanViet: "THOÁI KHUẤT", meaningVi: "buồn chán, rảnh rỗi không có việc làm" },
  "きんばん": { kanji: "勤勉", hanViet: "CẦN MIỄN", meaningVi: "chăm chỉ, siêng năng" },
  "たんじゅん": { kanji: "単純", hanViet: "ĐƠN THUẦN", meaningVi: "đơn giản, mộc mạc" },
  "ふべん": { kanji: "不便", hanViet: "BẤT TIỆN", meaningVi: "bất tiện, không thuận tiện" },
  "かいりょう": { kanji: "改良", hanViet: "CẢI LƯƠNG", meaningVi: "cải tiến cho tốt hơn" },
  "かいふく": { kanji: "回復", hanViet: "HỒI PHỤC", meaningVi: "hồi phục sức khỏe, khôi phục" },
  "しゅうり": { kanji: "修理", hanViet: "TU LÝ", meaningVi: "sửa chữa máy móc, đồ vật" },
  "むちゅう": { kanji: "夢中", hanViet: "MỘNG TRUNG", meaningVi: "say mê, chìm đắm (trở nên say mê)" },
  "きょうみ": { kanji: "興味", hanViet: "HƯNG VỊ", meaningVi: "hứng thú, sự thích thú" },
  "かんしん": { kanji: "関心", hanViet: "QUAN TÂM", meaningVi: "mối quan tâm, để ý" },
  "じょうねつ": { kanji: "情熱", hanViet: "TÌNH NHIỆT", meaningVi: "nhiệt huyết, niềm đam mê" },
  "よぞら": { kanji: "夜空", hanViet: "DẠ KHÔNG", meaningVi: "bầu trời đêm" },
  "ほし": { kanji: "星", hanViet: "TINH", meaningVi: "ngôi sao trên trời" },
  "かがやく": { kanji: "輝く", hanViet: "HUY", meaningVi: "tỏa sáng, lấp lánh (かがやいていた)" },
  "みせ": { kanji: "店", hanViet: "ĐIẾM", meaningVi: "cửa hàng, tiệm" },
  "ちこく": { kanji: "遅刻", hanViet: "TRÌ KHẮC", meaningVi: "đi trễ, muộn giờ" },
  "よごれる": { kanji: "汚れる", hanViet: "Ô", meaningVi: "bị bẩn, dính dơ" },
  "きれい": { kanji: "綺麗", hanViet: "KỈ LỆ", meaningVi: "sạch sẽ, xinh đẹp" },
  "しお": { kanji: "塩", hanViet: "DIÊM", meaningVi: "muối ăn" },
  "あじ": { kanji: "味", hanViet: "VỊ", meaningVi: "mùi vị, hương vị" },
  "うすい": { kanji: "薄い", hanViet: "BẠC", meaningVi: "vị nhạt, màu nhạt, mỏng" },
  "こい": { kanji: "濃い", hanViet: "NỒNG", meaningVi: "vị đậm, màu đậm, đặc" },
  "しんゆう": { kanji: "親友", hanViet: "THÂN HỮU", meaningVi: "bạn thân" },
  "しんかんせん": { kanji: "新幹線", hanViet: "TÂN CÁN TUYẾN", meaningVi: "tàu siêu tốc Shinkansen" },
  "めんせつ": { kanji: "面接", hanViet: "DIỆN TIẾP", meaningVi: "buổi phỏng vấn xin việc" },
  "むすこ": { kanji: "息子", hanViet: "TỨC TỬ", meaningVi: "con trai" },
  "むすめ": { kanji: "娘", hanViet: "NƯƠNG", meaningVi: "con gái" },
  "でんしゃ": { kanji: "電車", hanViet: "ĐIỆN XA", meaningVi: "tàu điện" },
  "しゃない": { kanji: "車内", hanViet: "XA NỘI", meaningVi: "bên trong toa tàu" },
  "たのむ": { kanji: "頼む", hanViet: "LẠI", meaningVi: "nhờ cậy, yêu cầu" }
};

// =========================================================================
// TỪ ĐIỂN TỪ VỰNG KANJI N3 (KANJI_WORDS_DICT)
// Ánh xạ trực tiếp từ chứa chữ Hán -> Cách đọc Hiragana và Nghĩa tiếng Việt
// =========================================================================
export const KANJI_WORDS_DICT: Record<string, { reading: string; meaningVi: string }> = {
  // --- Giấy tờ & Tài liệu hành chính (〜書) ---
  "計算書": { reading: "けいさんしょ", meaningVi: "bảng tính toán, bảng kê chi phí" },
  "請求書": { reading: "せいきゅうしょ", meaningVi: "hóa đơn thanh toán, phiếu yêu cầu trả tiền" },
  "報告書": { reading: "ほうこくしょ", meaningVi: "bản báo cáo công việc / học tập" },
  "申請書": { reading: "しんせいしょ", meaningVi: "đơn xin, đơn đăng ký thủ tục" },
  "領収書": { reading: "りょうしゅうしょ", meaningVi: "biên lai thu tiền, hóa đơn đỏ" },
  "証明書": { reading: "しょうめいしょ", meaningVi: "giấy chứng nhận" },
  "説明書": { reading: "せつめいしょ", meaningVi: "bản thuyết minh, hướng dẫn sử dụng" },
  "案内書": { reading: "あんないしょ", meaningVi: "tờ rơi chỉ dẫn, sách hướng dẫn" },
  "契約書": { reading: "けいやくしょ", meaningVi: "bản hợp đồng" },
  "通知書": { reading: "つうちしょ", meaningVi: "giấy thông báo" },
  "注文書": { reading: "ちゅうもんしょ", meaningVi: "đơn đặt hàng" },
  "履歴書": { reading: "りれきしょ", meaningVi: "sơ yếu lý lịch, CV" },
  "計画書": { reading: "けいかくしょ", meaningVi: "bản kế hoạch" },
  "報告": { reading: "ほうこく", meaningVi: "báo cáo công việc" },
  "計算": { reading: "けいさん", meaningVi: "tính toán chi phí" },
  "請求": { reading: "せいきゅう", meaningVi: "yêu cầu thanh toán" },
  "申請": { reading: "しんせい", meaningVi: "đăng ký, nộp đơn xin" },

  // --- Tính từ & Trạng từ chỉ mức độ / tính chất ---
  "退屈": { reading: "たいくつ", meaningVi: "buồn chán, rảnh rỗi không có việc gì làm" },
  "勤勉": { reading: "きんべん", meaningVi: "chăm chỉ, siêng năng, cần cù" },
  "単純": { reading: "たんじゅん", meaningVi: "đơn giản, mộc mạc, không phức tạp" },
  "不便": { reading: "ふべん", meaningVi: "bất tiện, không thuận tiện" },
  "便利": { reading: "べんり", meaningVi: "tiện lợi, tiện nghi" },
  "危険": { reading: "きけん", meaningVi: "nguy hiểm, rủi ro" },
  "安全": { reading: "あんぜん", meaningVi: "an toàn, chắc chắn" },
  "清潔": { reading: "せいけつ", meaningVi: "sạch sẽ, tinh khiết, hợp vệ sinh" },
  "不潔": { reading: "ふけつ", meaningVi: "dơ bẩn, mất vệ sinh" },
  "複雑": { reading: "ふくざつ", meaningVi: "phức tạp, rắc rối" },
  "簡単": { reading: "かんたん", meaningVi: "đơn giản, dễ dàng" },
  "親切": { reading: "しんせつ", meaningVi: "thân thiện, tốt bụng, chu đáo" },
  "丁寧": { reading: "ていねい", meaningVi: "lịch thiệp, cẩn thận, chu đáo" },
  "正直": { reading: "しょうじき", meaningVi: "thành thật, trung thực" },
  "新鮮": { reading: "しんせん", meaningVi: "tươi mới (thực phẩm, không khí)" },
  "完全": { reading: "かんぜん", meaningVi: "hoàn toàn, trọn vẹn" },
  "十分": { reading: "じゅうぶん", meaningVi: "đầy đủ, thỏa đáng" },
  "不十分": { reading: "ふじゅうぶん", meaningVi: "chưa đầy đủ, thiếu thốn" },
  "適当": { reading: "てきとう", meaningVi: "thích hợp, vừa phải" },
  "必ず": { reading: "かならず", meaningVi: "nhất định, chắc chắn" },
  "絶対に": { reading: "ぜったいに", meaningVi: "tuyệt đối không bao giờ" },
  "絶対": { reading: "ぜったい", meaningVi: "tuyệt đối" },
  "別に": { reading: "べつに", meaningVi: "không có gì đặc biệt (đi với phủ định)" },
  "大抵": { reading: "たいてい", meaningVi: "đại để, phần lớn, thông thường" },
  "無理に": { reading: "むりに", meaningVi: "gượng ép, cố quá sức" },
  "無理": { reading: "むり", meaningVi: "quá sức, vô lý" },
  "大事に": { reading: "だいじに", meaningVi: "trân trọng, giữ gìn cẩn thận" },
  "大事": { reading: "だいじ", meaningVi: "việc quan trọng, quý giá" },
  "意外に": { reading: "いがいに", meaningVi: "ngoài dự tính, bất ngờ thay" },
  "意外": { reading: "いがい", meaningVi: "bất ngờ, ngạc nhiên" },
  "特別に": { reading: "とくべつに", meaningVi: "một cách đặc biệt" },
  "特別": { reading: "とくべつ", meaningVi: "đặc biệt" },
  "小さく": { reading: "ちいさく", meaningVi: "nhỏ bé lại" },
  "大きく": { reading: "おおきく", meaningVi: "to lớn lên" },
  "古く": { reading: "ふるく", meaningVi: "cũ kỹ đi" },
  "新しく": { reading: "あたらしく", meaningVi: "mới mẻ hơn" },
  "低い": { reading: "ひくい", meaningVi: "thấp kém, nông" },
  "安い": { reading: "やすい", meaningVi: "rẻ tiền" },
  "易い": { reading: "やすい", meaningVi: "dễ dàng thực hiện" },
  "難しい": { reading: "むずかしい", meaningVi: "khó khăn, nan giải" },
  "忙しい": { reading: "いそがしい", meaningVi: "bận rộn" },
  "薄い": { reading: "うすい", meaningVi: "nhạt (vị), mỏng (độ dày)" },
  "濃い": { reading: "こい", meaningVi: "đậm (vị), sẫm màu" },

  // --- Thay đổi, giải quyết & Hành động ---
  "改良": { reading: "かいりょう", meaningVi: "cải tiến, sửa đổi cho tốt hơn" },
  "改善": { reading: "かいぜん", meaningVi: "cải thiện điều kiện/chất lượng" },
  "回復": { reading: "かいふく", meaningVi: "hồi phục sức khỏe, khôi phục lại" },
  "修理": { reading: "しゅうり", meaningVi: "sửa chữa máy móc, đồ đạc hỏng" },
  "解決": { reading: "かいけつ", meaningVi: "giải quyết ổn thỏa vấn đề" },
  "夢中": { reading: "むちゅう", meaningVi: "say mê, chìm đắm, miệt mài" },
  "興味": { reading: "きょうみ", meaningVi: "hứng thú, sự thích thú" },
  "関心": { reading: "かんしん", meaningVi: "mối quan tâm, để ý đến" },
  "情熱": { reading: "じょうねつ", meaningVi: "nhiệt huyết, niềm đam mê cháy bỏng" },
  "向き合い": { reading: "むきあい", meaningVi: "đối mặt, nhìn thẳng vào nhau" },
  "伝え合い": { reading: "つたえあい", meaningVi: "truyền đạt, trao đổi cho nhau" },
  "知り合い": { reading: "しりあい", meaningVi: "người quen biết" },
  "ゆずり合い": { reading: "ゆずりあい", meaningVi: "nhường nhịn lẫn nhau" },
  "譲り合い": { reading: "ゆずりあい", meaningVi: "nhường nhịn lẫn nhau" },
  "乗りかえ": { reading: "のりかえ", meaningVi: "đổi chuyến tàu / xe" },
  "乗り換え": { reading: "のりかえ", meaningVi: "đổi chuyến tàu / xe" },
  "乗り合わせ": { reading: "のりあわせ", meaningVi: "đi chung một chuyến xe" },
  "乗りこし": { reading: "のりこし", meaningVi: "đi quá ga cần xuống" },
  "乗り越し": { reading: "のりこし", meaningVi: "đi quá ga cần xuống" },
  "乗り過ごし": { reading: "のりすごし", meaningVi: "ngủ quên lỡ mất ga xuống" },
  "見直す": { reading: "みなおす", meaningVi: "xem lại, đánh giá lại, soát lại" },
  "実行": { reading: "じっこう", meaningVi: "thực hành, thực hiện kế hoạch" },
  "追加": { reading: "ついか", meaningVi: "thêm vào, bổ sung thêm" },
  "専門": { reading: "せんもん", meaningVi: "chuyên môn, ngành nghề chuyên sâu" },
  "似合う": { reading: "にあう", meaningVi: "hợp, vừa vặn, xứng với" },
  "個人的": { reading: "こじんてき", meaningVi: "mang tính cá nhân, riêng tư" },
  "個人": { reading: "こじん", meaningVi: "cá nhân, từng người" },
  "注目": { reading: "ちゅうもく", meaningVi: "chú ý, để mắt tới, quan tâm theo dõi" },
  "加える": { reading: "くわえる", meaningVi: "thêm vào, gia tăng" },
  "発展": { reading: "はってん", meaningVi: "phát triển, mở rộng quy mô" },
  "偶然": { reading: "ぐうぜん", meaningVi: "tình cờ, ngẫu nhiên gặp được" },
  "影響": { reading: "えいきょう", meaningVi: "ảnh hưởng, tác động" },
  "押さえる": { reading: "おさえる", meaningVi: "bịt giữ vết thương, kìm nén" },
  "拭く": { reading: "ふく", meaningVi: "lau chùi, lau khô" },
  "焼く": { reading: "やく", meaningVi: "nướng, rán" },
  "折れる": { reading: "おれる", meaningVi: "bị gãy cành cây, gập lại" },
  "断る": { reading: "ことわる", meaningVi: "từ chối lời mời" },
  "食べ放題": { reading: "たべほうだい", meaningVi: "ăn thỏa thích, ăn buffet" },
  "参る": { reading: "まいる", meaningVi: "đi / đến (khiêm nhường ngữ)" },

  // --- Danh từ & Trạng thái ---
  "景色": { reading: "けしき", meaningVi: "phong cảnh thiên nhiên" },
  "場合": { reading: "ばあい", meaningVi: "trường hợp, tình huống" },
  "感情": { reading: "かんじょう", meaningVi: "tình cảm, cảm xúc nội tâm" },
  "様子": { reading: "ようす", meaningVi: "tình hình, dáng vẻ bề ngoài" },
  "状態": { reading: "じょうたい", meaningVi: "trạng thái, tình trạng hiện thời" },
  "印象": { reading: "いんしょう", meaningVi: "ấn tượng đọng lại" },
  "情報": { reading: "じょうほう", meaningVi: "thông tin, tin tức" },
  "傾向": { reading: "けいこう", meaningVi: "khuynh hướng, xu hướng chung" },
  "復習": { reading: "ふくしゅう", meaningVi: "ôn tập bài học cũ" },
  "予習": { reading: "よしゅう", meaningVi: "soạn trước bài mới" },
  "信用": { reading: "しんよう", meaningVi: "tin tưởng, tín nhiệm, uy tín" },
  "確認": { reading: "かくにん", meaningVi: "xác nhận, kiểm tra lại cho chắc" },
  "証明": { reading: "しょうめい", meaningVi: "chứng minh, làm sáng tỏ" },
  "平行": { reading: "へいこう", meaningVi: "song song, cùng lúc" },
  "平均": { reading: "へいきん", meaningVi: "bình quân, trung bình cộng" },
  "等分": { reading: "とうぶん", meaningVi: "chia thành các phần đều nhau" },
  "配分": { reading: "はいぶん", meaningVi: "phân chia, phân bổ nguồn lực" },
  "手順": { reading: "てじゅん", meaningVi: "trình tự, thứ tự các bước làm" },
  "残業": { reading: "ざんぎょう", meaningVi: "làm thêm giờ, tăng ca" },
  "程度": { reading: "ていど", meaningVi: "mức độ, chừng mực" },
  "都合": { reading: "つごう", meaningVi: "điều kiện thời gian, hoàn cảnh thuận tiện" },
  "位置": { reading: "いち", meaningVi: "vị trí, chỗ đứng" },
  "主張": { reading: "しゅちょう", meaningVi: "chủ trương, khẳng định quan điểm" },
  "感動": { reading: "かんどう", meaningVi: "cảm động sâu sắc" },
  "緊張": { reading: "きんちょう", meaningVi: "căng thẳng, hồi hộp lo âu" },
  "提出": { reading: "ていしゅつ", meaningVi: "nộp bài, nộp đơn, đệ trình" },
  "命令": { reading: "めいれい", meaningVi: "mệnh lệnh, chỉ thị từ cấp trên" },
  "郵便": { reading: "ゆうびん", meaningVi: "bưu phẩm, bưu điện gửi thư" },
  "完成": { reading: "かんせい", meaningVi: "hoàn thành, làm xong trọn vẹn" },
  "就職": { reading: "しゅうしょく", meaningVi: "tìm việc làm, vào công ty làm việc" },
  "結果": { reading: "けっか", meaningVi: "kết quả thu được" },
  "原因": { reading: "げんいん", meaningVi: "nguyên nhân xảy ra" },
  "理由": { reading: "りゆう", meaningVi: "lý do, cớ" },
  "目的": { reading: "もくてき", meaningVi: "mục đích hướng tới" },
  "目標": { reading: "もくひょう", meaningVi: "mục tiêu định lượng" },
  "計画": { reading: "けいかく", meaningVi: "kế hoạch, trù tính" },
  "地球": { reading: "ちきゅう", meaningVi: "Trái Đất" },
  "表面": { reading: "ひょうめん", meaningVi: "bề mặt bên ngoài" },
  "席": { reading: "せき", meaningVi: "chỗ ngồi" },
  "座席": { reading: "ざせき", meaningVi: "chỗ ngồi (trên phương tiện, rạp)" },
  "株": { reading: "かぶ", meaningVi: "cổ phiếu / gốc cây" },
  "札": { reading: "ふだ", meaningVi: "thẻ tên, nhãn / tiền giấy (さつ)" },
  "橋": { reading: "はし", meaningVi: "cây cầu bắc qua sông" },
  "柱": { reading: "はしら", meaningVi: "cột nhà, trụ cột gia đình" },
  "空": { reading: "そら", meaningVi: "bầu trời" },
  "窓": { reading: "まど", meaningVi: "cửa sổ" },
  "室": { reading: "しつ", meaningVi: "căn phòng" },
  "宿": { reading: "やど", meaningVi: "quán trọ, nơi lưu trú" },
  "夜空": { reading: "よぞら", meaningVi: "bầu trời đêm" },
  "星": { reading: "ほし", meaningVi: "ngôi sao trên bầu trời" },
  "輝く": { reading: "かがやく", meaningVi: "tỏa sáng, lấp lánh" },
  "後半": { reading: "こうはん", meaningVi: "nửa sau, hiệp sau" },
  "前半": { reading: "ぜんはん", meaningVi: "nửa đầu, hiệp đầu" },
  "非常口": { reading: "ひじょうぐち", meaningVi: "cửa thoát hiểm khi khẩn cấp" },
  "非常": { reading: "ひじょう", meaningVi: "khẩn cấp, phi thường" },
  "共通": { reading: "きょうつう", meaningVi: "điểm chung, tương đồng" },
  "取引": { reading: "とりひき", meaningVi: "giao dịch buôn bán, làm ăn" },
  "予報": { reading: "よほう", meaningVi: "dự báo (thời tiết)" },
  "予防": { reading: "よぼう", meaningVi: "phòng ngừa dịch bệnh" },
  "要望": { reading: "ようぼう", meaningVi: "yêu cầu, nguyện vọng" },
  "広告": { reading: "こうこく", meaningVi: "quảng cáo giới thiệu sản phẩm" },
  "新商品": { reading: "しんしょうひん", meaningVi: "sản phẩm mới ra mắt" },
  "出身": { reading: "しゅっしん", meaningVi: "xuất thân, quê quán gốc gác" },
  "消費": { reading: "しょうひ", meaningVi: "tiêu dùng, tiêu thụ hàng hóa" },
  "保存": { reading: "ほぞん", meaningVi: "bảo tồn, lưu trữ dữ liệu" },
  "通過": { reading: "つうか", meaningVi: "đi qua ga, thông qua dự luật" },
  "身分": { reading: "みぶん", meaningVi: "thân phận, địa vị xã hội" },
  "種類": { reading: "しゅるい", meaningVi: "chủng loại, loại hình" },

  // --- Các động từ & dạng chia thể て ---
  "回って": { reading: "まわって", meaningVi: "quay tròn quanh trục" },
  "飛んで": { reading: "とんで", meaningVi: "bay lượn trên không trung" },
  "転んで": { reading: "ころんで", meaningVi: "bị trượt ngã, ngã nhào" },
  "散って": { reading: "ちって", meaningVi: "hoa rơi rụng, phân tán" },
  "とり返して": { reading: "とりかえして", meaningVi: "lấy lại đồ vật, cứu vãn" },
  "取り返して": { reading: "とりかえして", meaningVi: "lấy lại đồ vật, cứu vãn" },
  "引き受けて": { reading: "ひきうけて", meaningVi: "nhận lời làm việc, đảm nhận" },
  "くり返して": { reading: "くりかえして", meaningVi: "lặp đi lặp lại nhiều lần" },
  "繰り返して": { reading: "くりかえして", meaningVi: "lặp đi lặp lại nhiều lần" },
  "受け取って": { reading: "うけとって", meaningVi: "nhận lấy bưu phẩm/tiền" },
  "痛くて": { reading: "いたくて", meaningVi: "bị đau nhức" },
  "捨てて": { reading: "すてて", meaningVi: "vứt bỏ rác/đồ cũ" },
  "拾って": { reading: "ひろって", meaningVi: "nhặt lấy đồ rơi" },
  "積もって": { reading: "つもって", meaningVi: "chất đống, tuyết phủ dày" },
  "祈った": { reading: "いのった", meaningVi: "đã cầu nguyện an lành" },
  "祝った": { reading: "いわった", meaningVi: "đã chúc mừng lễ hội/tiệc" },
  "気に入って": { reading: "きにいって", meaningVi: "hài lòng, yêu thích" },
  "気にして": { reading: "きにして", meaningVi: "bận tâm, để ý lo lắng" },
  "気がついて": { reading: "きがついて", meaningVi: "nhận ra điều gì đó" },
  "気になって": { reading: "きになって", meaningVi: "sốt ruột bận lòng" },
  "焼いて": { reading: "やいて", meaningVi: "nướng bánh/thịt" },
  "炊いて": { reading: "たいて", meaningVi: "nấu cơm" },
  "燃えて": { reading: "もえて", meaningVi: "cháy bùng lửa" },
  "折れて": { reading: "おれて", meaningVi: "bị gãy cành cây" },
  "押して": { reading: "おして", meaningVi: "ấn nút, xô đẩy" },
  "投げて": { reading: "なげて", meaningVi: "ném bóng đi" },
  "忙しく": { reading: "いそがしく", meaningVi: "trở nên bận rộn" },
  "忘れて": { reading: "わすれて", meaningVi: "quên mất điều gì" },
  "座って": { reading: "すわって", meaningVi: "ngồi xuống ghế" }
};

// =========================================================================
// BẢNG ÂM ĐỌC ON'YOMI CỦA CÁC CHỮ HÁN N5 - N3
// Dùng để tự động tổng hợp Furigana cho từ ghép nếu chưa có trong KANJI_WORDS_DICT
// =========================================================================
export const KANJI_ONYOMI_MAP: Record<string, string> = {
  "計": "けい", "算": "さん", "書": "しょ", "請": "せい", "求": "きゅう",
  "申": "しん", "報": "ほう", "告": "こく", "領": "りょう", "収": "しゅう",
  "証": "しょう", "明": "めい", "説": "せつ", "案": "あん", "内": "ない",
  "契": "けい", "約": "やく", "通": "つう", "知": "ち", "注": "ちゅう",
  "文": "もん", "履": "り", "歴": "れき", "画": "かく", "退": "たい",
  "屈": "くつ", "勤": "きん", "勉": "べん", "単": "たん", "純": "じゅん",
  "不": "ふ", "便": "べん", "利": "り", "危": "き", "険": "けん",
  "安": "あん", "全": "ぜん", "必": "ひつ", "絶": "ぜつ", "対": "たい",
  "大": "だい", "事": "じ", "意": "い", "外": "がい", "特": "とく",
  "別": "べつ", "清": "せい", "潔": "けつ", "複": "ふく", "雑": "ざつ",
  "簡": "かん", "親": "しん", "切": "せつ", "丁": "てい", "寧": "ねい",
  "正": "しょう", "直": "じき", "新": "しん", "鮮": "せん", "完": "かん",
  "十": "じゅう", "分": "ぶん", "適": "てき", "当": "とう", "改": "かい",
  "良": "りょう", "善": "ぜん", "復": "ふく", "修": "しゅう", "理": "り",
  "解": "かい", "決": "けつ", "夢": "む", "中": "ちゅう", "興": "きょう",
  "味": "み", "関": "かん", "心": "しん", "情": "じょう", "熱": "ねつ",
  "実": "じっ", "行": "こう", "生": "せい", "成": "せい", "功": "こう",
  "失": "しっ", "敗": "ぱい", "結": "けっ", "果": "か", "原": "げん",
  "因": "いん", "由": "ゆう", "目": "もく", "的": "てき", "標": "ひょう",
  "予": "よ", "定": "てい", "準": "じゅん", "備": "び", "習": "しゅう",
  "信": "しん", "用": "よう", "認": "にん", "主": "しゅ", "張": "ちょう",
  "感": "かん", "動": "どう", "緊": "きん", "出": "しゅつ", "令": "れい",
  "発": "はっ", "展": "てん", "偶": "ぐう", "然": "ぜん", "影": "えい",
  "響": "きょう", "追": "つい", "加": "か", "専": "せん", "門": "もん",
  "個": "こ", "人": "じん", "景": "け", "色": "しき", "場": "ば",
  "合": "あい", "様": "よう", "子": "す", "状": "じょう", "態": "たい",
  "印": "いん", "象": "しょう", "傾": "けい", "向": "こう", "平": "へい",
  "均": "きん", "等": "とう", "配": "はい", "手": "て", "順": "じゅん",
  "残": "ざん", "業": "ぎょう", "程": "てい", "度": "ど", "都": "つ",
  "位": "い", "置": "ち", "郵": "ゆう", "地": "ち", "球": "きゅう",
  "表": "ひょう", "面": "めん", "座": "ざ", "席": "せき", "消": "しょう",
  "費": "ひ", "保": "ほ", "存": "ぞん", "過": "か", "身": "み",
  "類": "るい", "共": "きょう", "取": "とり", "引": "ひき", "防": "ぼう",
  "望": "ぼう", "広": "こう", "商": "しょう", "品": "ひん", "先": "せん",
  "後": "こう", "前": "ぜん", "半": "はん"
};

/**
 * Tự động tổng hợp cách đọc Hiragana cho một từ chữ Hán bằng On'yomi
 */
export function synthesizeKanjiReading(text: string): string {
  if (!text) return "";
  let result = "";
  for (const char of text) {
    if (KANJI_ONYOMI_MAP[char]) {
      result += KANJI_ONYOMI_MAP[char];
    } else if (!/[\u4e00-\u9faf]/.test(char)) {
      result += char;
    } else {
      return "";
    }
  }
  return result;
}

/**
 * Tạo nghĩa tiếng Việt tự nhiên dựa trên âm Hán Việt
 */
export function generateMeaningFromHanViet(word: string, hanViet: string): string {
  if (!hanViet) return "";
  const cleanHV = hanViet.trim();

  if (word.endsWith("書")) {
    const prefix = cleanHV.replace(/\s*THƯ$/, "");
    return `giấy tờ, văn bản ${prefix.toLowerCase()}`;
  }
  if (word.endsWith("性")) {
    const prefix = cleanHV.replace(/\s*TÍNH$/, "");
    return `tính chất ${prefix.toLowerCase()}`;
  }
  if (word.endsWith("化")) {
    const prefix = cleanHV.replace(/\s*HÓA$/, "");
    return `quá trình ${prefix.toLowerCase()} hóa`;
  }
  if (word.endsWith("者")) {
    const prefix = cleanHV.replace(/\s*GIẢ$/, "");
    return `người ${prefix.toLowerCase()}`;
  }

  return `thuật ngữ Hán Việt: ${cleanHV}`;
}

/**
 * Tra cứu và phân tích Chữ Hán, Âm Hán Việt và Nghĩa cho một phương án trắc nghiệm
 */
export function resolveOptionKanji(
  optionText: string,
  question: {
    questionText: string;
    subtype?: string;
    section?: string;
    correctOptionId?: string | null;
    explanation?: {
      vocabulary?: Array<{ word: string; hiragana: string; meaningVi: string }>;
      optionReasonsVi?: Record<string, string>;
    };
  },
  isCorrect: boolean,
  reasonText?: string
): OptionKanjiInfo | null {
  if (!optionText) return null;
  const trimmed = optionText.trim();

  // 1. Trường hợp phương án ĐÃ CHỨA chữ Hán (Kanji trực tiếp)
  if (isKanji(trimmed) || /[\u4e00-\u9faf]/.test(trimmed)) {
    const hanViet = getHanViet(trimmed);
    let meaningVi: string | undefined = undefined;
    let hiragana: string | undefined = undefined;

    // 1.1. Tra cứu trực tiếp trong KANJI_WORDS_DICT
    if (KANJI_WORDS_DICT[trimmed]) {
      hiragana = KANJI_WORDS_DICT[trimmed].reading;
      meaningVi = KANJI_WORDS_DICT[trimmed].meaningVi;
    }

    // 1.2. Tìm trong danh sách vocabulary của câu hỏi
    if (question.explanation?.vocabulary) {
      const vMatch = question.explanation.vocabulary.find(
        v => v.word === trimmed || trimmed.includes(v.word)
      );
      if (vMatch) {
        if (!hiragana && vMatch.hiragana) hiragana = vMatch.hiragana;
        if (!meaningVi && vMatch.meaningVi) meaningVi = vMatch.meaningVi;
      }
    }

    // 1.3. Tổng hợp hiragana từ On'yomi nếu chưa có
    if (!hiragana) {
      hiragana = synthesizeKanjiReading(trimmed);
    }

    // 1.4. Sinh nghĩa tự nhiên từ Hán Việt nếu chưa có
    if (!meaningVi && hanViet) {
      meaningVi = generateMeaningFromHanViet(trimmed, hanViet);
    }

    return {
      kanji: trimmed,
      hanViet,
      meaningVi,
      hiragana,
      isQuestionTarget: isCorrect
    };
  }

  // 2. Trường hợp phương án là Hiragana (Kana):
  // 2.1. Nếu là ĐÁP ÁN ĐÚNG của câu hỏi tìm cách đọc chữ Hán (kanji_reading):
  // Chữ Hán chính là từ trọng tâm được gạch chân / hỏi trong câu!
  if (isCorrect) {
    const testedTarget = extractTestedTarget(question.questionText);
    if (testedTarget && /[\u4e00-\u9faf]/.test(testedTarget)) {
      const hanViet = getHanViet(testedTarget);
      let meaningVi: string | undefined = undefined;

      if (KANJI_WORDS_DICT[testedTarget]) {
        meaningVi = KANJI_WORDS_DICT[testedTarget].meaningVi;
      }
      if (!meaningVi && question.explanation?.vocabulary) {
        const vMatch = question.explanation.vocabulary.find(v => v.word === testedTarget);
        if (vMatch) meaningVi = vMatch.meaningVi;
      }

      return {
        kanji: testedTarget,
        hanViet,
        meaningVi,
        hiragana: trimmed,
        isQuestionTarget: true
      };
    }
  }

  // 2.2. Tra cứu trong từ điển HIRAGANA_TO_KANJI_DICT
  const dictMatch = HIRAGANA_TO_KANJI_DICT[trimmed];
  if (dictMatch) {
    return {
      kanji: dictMatch.kanji,
      hanViet: dictMatch.hanViet,
      meaningVi: dictMatch.meaningVi,
      hiragana: trimmed,
      isQuestionTarget: false
    };
  }

  // 2.3. Bóc tách chữ Hán được nhắc tới trực tiếp trong lý do giải thích (reasonText)
  if (reasonText) {
    const bracketMatch = reasonText.match(/(?:chữ Hán là|từ|chữ)\s*「([^」]+)」/);
    if (bracketMatch && bracketMatch[1] && /[\u4e00-\u9faf]/.test(bracketMatch[1])) {
      const extracted = bracketMatch[1].trim();
      return {
        kanji: extracted,
        hanViet: getHanViet(extracted),
        hiragana: trimmed,
        isQuestionTarget: false
      };
    }
  }

  // 2.4. Tra cứu trong vocabulary đính kèm nếu có từ có cùng âm hiragana
  if (question.explanation?.vocabulary) {
    const vMatch = question.explanation.vocabulary.find(v => v.hiragana === trimmed);
    if (vMatch && /[\u4e00-\u9faf]/.test(vMatch.word)) {
      return {
        kanji: vMatch.word,
        hanViet: getHanViet(vMatch.word),
        meaningVi: vMatch.meaningVi,
        hiragana: trimmed,
        isQuestionTarget: false
      };
    }
  }

  return null;
}

export interface EnrichedVocabularyItem {
  word: string;
  hiragana: string;
  meaningVi: string;
  source?: "target" | "option" | "question";
}

/**
 * Trích xuất và tổng hợp toàn bộ từ vựng trọng tâm cho một câu hỏi:
 * 1. Từ vựng đã có trong explanation.vocabulary (source: "target")
 * 2. Tất cả các từ vựng xuất hiện trong 4 phương án đáp án (source: "option")
 * 3. Các từ vựng/chữ Hán quan trọng xuất hiện trong ngữ cảnh câu hỏi (source: "question")
 */
export function getEnrichedQuestionVocabulary(question: {
  questionText: string;
  subtype?: string;
  section?: string;
  options: Array<{ id: string; text: string }>;
  correctOptionId?: string | null;
  explanation: {
    vocabulary?: Array<{ word: string; hiragana: string; meaningVi: string }>;
    optionReasonsVi?: Record<string, string>;
  };
}): EnrichedVocabularyItem[] {
  const result: EnrichedVocabularyItem[] = [];
  const seen = new Set<string>();

  const register = (item: EnrichedVocabularyItem) => {
    const rawWord = (item.word || "").trim();
    if (!rawWord) return;

    // Chuẩn hóa để tránh trùng lặp
    const cleanWord = rawWord.split("/")[0].trim();
    let cleanHiragana = (item.hiragana || "").split("/")[0].trim();
    let cleanMeaning = (item.meaningVi || "").trim();

    // 1. Đảm bảo từ chứa Kanji LUÔN CÓ cách đọc Hiragana (không bao giờ để trống hoặc trùng với chữ Hán)
    if (/[\u4e00-\u9faf]/.test(cleanWord) && (!cleanHiragana || cleanHiragana === cleanWord)) {
      if (KANJI_WORDS_DICT[cleanWord]?.reading) {
        cleanHiragana = KANJI_WORDS_DICT[cleanWord].reading;
      } else {
        const synthesized = synthesizeKanjiReading(cleanWord);
        if (synthesized) {
          cleanHiragana = synthesized;
        } else {
          // Tra ngược trong HIRAGANA_TO_KANJI_DICT
          for (const [hira, info] of Object.entries(HIRAGANA_TO_KANJI_DICT)) {
            if (info.kanji === cleanWord || info.kanji.startsWith(cleanWord)) {
              cleanHiragana = hira;
              break;
            }
          }
        }
      }
    }

    // 2. Đảm bảo từ LUÔN CÓ nghĩa tiếng Việt chuẩn (không bao giờ để trống hoặc fallback "Hán Việt: ...")
    if (!cleanMeaning || cleanMeaning.startsWith("Hán Việt:")) {
      if (KANJI_WORDS_DICT[cleanWord]?.meaningVi) {
        cleanMeaning = KANJI_WORDS_DICT[cleanWord].meaningVi;
      } else {
        const hv = getHanViet(cleanWord);
        cleanMeaning = generateMeaningFromHanViet(cleanWord, hv);
      }
    }

    if (seen.has(cleanWord) || (cleanHiragana && cleanHiragana !== cleanWord && seen.has(cleanHiragana))) {
      return;
    }

    seen.add(cleanWord);
    if (cleanHiragana && cleanHiragana !== cleanWord) seen.add(cleanHiragana);
    result.push({
      ...item,
      word: cleanWord,
      hiragana: cleanHiragana || cleanWord,
      meaningVi: cleanMeaning
    });
  };

  // 1. Nạp từ vựng có sẵn từ dữ liệu bài thi (Trọng tâm)
  if (question.explanation?.vocabulary && Array.isArray(question.explanation.vocabulary)) {
    for (const v of question.explanation.vocabulary) {
      register({
        word: v.word,
        hiragana: v.hiragana || v.word,
        meaningVi: v.meaningVi,
        source: "target"
      });
    }
  }

  // 2. Nạp từ vựng từ các phương án lựa chọn (Options)
  if (question.options && Array.isArray(question.options)) {
    const isOrthography = question.subtype === "orthography";

    for (const opt of question.options) {
      const isCorrect = opt.id === question.correctOptionId;
      const text = (opt.text || "").trim();

      // Bỏ qua các câu quá dài (câu văn hoàn chỉnh trong bài đọc hoặc ngữ pháp)
      if (text.length > 12 || /[。、！？]/.test(text)) {
        continue;
      }

      // Đối với câu hỏi Mondai 2 (Cách viết Kanji - orthography):
      // Các phương án sai là chữ viết sai chính tả cố tình tạo ra để đánh lừa (distractor).
      // Chỉ nạp phương án đúng hoặc các từ thực tế có trong từ điển.
      if (isOrthography && !isCorrect && !KANJI_WORDS_DICT[text]) {
        continue;
      }

      const reason = question.explanation?.optionReasonsVi?.[opt.id];
      const kanjiInfo = resolveOptionKanji(text, question, isCorrect, reason);

      if (kanjiInfo) {
        register({
          word: kanjiInfo.kanji || text,
          hiragana: kanjiInfo.hiragana || (isKanji(text) ? (KANJI_WORDS_DICT[text]?.reading || synthesizeKanjiReading(text) || "") : text),
          meaningVi: kanjiInfo.meaningVi || "",
          source: "option"
        });
      } else {
        const dictMatch = HIRAGANA_TO_KANJI_DICT[text];
        if (dictMatch) {
          register({
            word: dictMatch.kanji || text,
            hiragana: text,
            meaningVi: dictMatch.meaningVi,
            source: "option"
          });
        }
      }
    }
  }

  // 3. Quét các từ vựng xuất hiện trong câu hỏi (Question Context)
  const qText = (question.questionText || "");
  for (const [hira, info] of Object.entries(HIRAGANA_TO_KANJI_DICT)) {
    const kanjiMain = info.kanji.split("/")[0].trim();
    if (kanjiMain && kanjiMain.length >= 1 && (isKanji(kanjiMain) || kanjiMain.length >= 2)) {
      if (qText.includes(kanjiMain) && !seen.has(kanjiMain) && !seen.has(hira)) {
        register({
          word: kanjiMain,
          hiragana: hira,
          meaningVi: info.meaningVi,
          source: "question"
        });
      }
    }
  }

  return result;
}
