import React from "react";
import Link from "next/link";
import {
  BookOpen,
  Compass,
  CheckCircle2,
  Clock,
  Sparkles,
  HelpCircle,
  AlertCircle,
  FileText,
  ArrowRight,
  ShieldCheck,
  Target,
} from "lucide-react";

export default function GuidePage() {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12">
      {/* Header */}
      <div className="space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#E8F5E9] border border-[#A5D6A7] text-[#1B5E20] text-xs font-semibold">
          <BookOpen className="w-3.5 h-3.5 text-[#2E7D32]" />
          <span>Sổ tay học viên & Hướng dẫn sử dụng • Cùng VuyAnh 🌸</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-[#1B5E20] tracking-tight">
          Hướng Dẫn Ôn Thi & Sử Dụng Nền Tảng
        </h1>
        <p className="text-sm sm:text-base text-slate-600 max-w-2xl leading-relaxed">
          Tìm hiểu cấu trúc đề thi JLPT N3, cách phân bổ thời gian hợp lý và tận dụng tối đa các công cụ phân tích của Học tiếng Nhật cùng VuyAnh 🌸.
        </p>
      </div>

      {/* Phần 1: Cấu trúc bài thi N3 */}
      <section className="bg-white p-7 sm:p-9 rounded-3xl border border-slate-200 shadow-sm space-y-6">
        <div className="flex items-center gap-2.5 pb-4 border-b border-slate-100">
          <div className="w-9 h-9 rounded-xl bg-indigo-100 text-indigo-600 flex items-center justify-center">
            <Target className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-900">1. Cấu trúc bài thi JLPT N3</h2>
            <p className="text-xs text-slate-500">Các phần kiến thức được mô phỏng trong hệ thống</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <div className="p-5 rounded-2xl bg-blue-50/60 border border-blue-100 space-y-2.5 text-xs">
            <span className="font-bold text-blue-900 text-sm block">Chữ Hán & Từ vựng (Gengo Chishiki)</span>
            <ul className="space-y-1.5 text-blue-800 list-disc list-inside">
              <li><strong>Mondai 1:</strong> Cách đọc Kanji (Kanji Reading)</li>
              <li><strong>Mondai 2:</strong> Cách viết Kanji (Kanji Writing)</li>
              <li><strong>Mondai 3:</strong> Điền từ theo ngữ cảnh (Contextual Use)</li>
              <li><strong>Mondai 4:</strong> Từ đồng nghĩa / gần nghĩa (Paraphrase)</li>
              <li><strong>Mondai 5:</strong> Cách dùng từ chuẩn xác (Usage)</li>
            </ul>
          </div>

          <div className="p-5 rounded-2xl bg-purple-50/60 border border-purple-100 space-y-2.5 text-xs">
            <span className="font-bold text-purple-900 text-sm block">Ngữ pháp (Bunpou)</span>
            <ul className="space-y-1.5 text-purple-800 list-disc list-inside">
              <li><strong>Mondai 1:</strong> Phán đoán dạng ngữ pháp câu</li>
              <li><strong>Mondai 2:</strong> Ghép câu có vị trí dấu sao (★)</li>
              <li><strong>Mondai 3:</strong> Ngữ pháp trong đoạn văn</li>
            </ul>
          </div>

          <div className="p-5 rounded-2xl bg-emerald-50/60 border border-emerald-100 space-y-2.5 text-xs">
            <span className="font-bold text-emerald-900 text-sm block">Đọc hiểu (Dokkai)</span>
            <ul className="space-y-1.5 text-emerald-800 list-disc list-inside">
              <li><strong>Đoạn ngắn:</strong> Đoạn văn 150-200 chữ (1 câu hỏi)</li>
              <li><strong>Đoạn trung:</strong> Bài văn 350-450 chữ (3-4 câu hỏi)</li>
              <li><strong>Đoạn dài:</strong> Bài văn 600 chữ (4 câu hỏi)</li>
              <li><strong>Tìm kiếm thông tin:</strong> Tờ rơi, biểu mẫu (2 câu hỏi)</li>
            </ul>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <div className="leading-relaxed">
            <strong>Lưu ý về phạm vi của website:</strong> Học tiếng Nhật cùng VuyAnh 🌸 tập trung chuyên sâu vào các kỹ năng trắc nghiệm Từ vựng, Ngữ pháp và Đọc hiểu. Hệ thống <strong>không tích hợp phần thi Nghe hiểu</strong>. Điểm số bài làm được tính là <strong>Tỷ lệ % câu đúng thô (raw percent)</strong>, không quy đổi thành điểm scaled score 0–180 của kỳ thi chính thức.
          </div>
        </div>
      </section>

      {/* Phần 2: Hai chế độ làm bài */}
      <section className="bg-white p-7 sm:p-9 rounded-3xl border border-slate-200 shadow-sm space-y-6">
        <div className="flex items-center gap-2.5 pb-4 border-b border-slate-100">
          <div className="w-9 h-9 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-900">2. Lựa chọn chế độ làm bài phù hợp</h2>
            <p className="text-xs text-slate-500">Tùy biến phương pháp học theo mục tiêu của bạn</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div className="p-6 rounded-2xl bg-indigo-50/50 border border-indigo-200 space-y-3">
            <div className="flex items-center gap-2 text-indigo-900 font-bold text-base">
              <BookOpen className="w-5 h-5 text-indigo-600" />
              <span>Chế độ Luyện tập (Practice)</span>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              Dành cho giai đoạn tích lũy kiến thức. Sau khi chọn đáp án, nhấn <strong>Kiểm tra</strong> để xem ngay:
            </p>
            <ul className="text-xs text-slate-700 space-y-1.5 list-disc list-inside">
              <li>Lý do vì sao đáp án đó là đúng</li>
              <li>Phân tích chi tiết bẫy của tất cả các phương án sai</li>
              <li>Bản dịch nghĩa tiếng Việt câu hỏi và câu bằng chứng đọc hiểu</li>
              <li>Bảng từ vựng hiển thị cách đọc Furigana (Ruby)</li>
              <li>Mẹo nhận diện nhanh dạng bài</li>
            </ul>
          </div>

          <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
            <div className="flex items-center gap-2 text-slate-900 font-bold text-base">
              <Clock className="w-5 h-5 text-blue-600" />
              <span>Chế độ Thi thử (Exam)</span>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              Dành cho giai đoạn luyện đề thực chiến trước kỳ thi:
            </p>
            <ul className="text-xs text-slate-700 space-y-1.5 list-disc list-inside">
              <li>Có đồng hồ đếm ngược theo thời lượng quy định</li>
              <li>Không hiển thị đúng/sai trong quá trình làm bài</li>
              <li>Hỗ trợ tính năng <strong>Ghim câu (Flag)</strong> để xem lại trước khi nộp</li>
              <li>Cảnh báo số câu chưa làm trước khi xác nhận nộp bài</li>
              <li>Tự động nộp bài khi hết thời gian làm bài</li>
            </ul>
          </div>
        </div>
      </section>

      {/* Phần 3: Phím tắt & Trải nghiệm tiện lợi */}
      <section className="bg-white p-7 sm:p-9 rounded-3xl border border-[#A5D6A7]/60 shadow-sm space-y-6">
        <div className="flex items-center gap-2.5 pb-4 border-b border-slate-100">
          <div className="w-9 h-9 rounded-xl bg-[#E8F5E9] text-[#1B5E20] flex items-center justify-center font-bold">
            <Sparkles className="w-5 h-5 text-[#2E7D32]" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-[#1B5E20]">3. Bảng phím tắt khi làm bài (Keyboard Shortcuts)</h2>
            <p className="text-xs text-slate-500">Giúp thao tác nhanh chóng như thi trên máy tính</p>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
          <div className="p-3.5 rounded-xl bg-[#E8F5E9]/50 border border-[#A5D6A7] text-center space-y-1">
            <kbd className="px-2.5 py-1 rounded bg-white border border-[#A5D6A7] font-mono font-bold text-[#1B5E20] shadow-xs">
              1, 2, 3, 4
            </kbd>
            <p className="text-slate-600 pt-1">Chọn nhanh đáp án</p>
          </div>

          <div className="p-3.5 rounded-xl bg-[#E8F5E9]/50 border border-[#A5D6A7] text-center space-y-1">
            <kbd className="px-2.5 py-1 rounded bg-white border border-[#A5D6A7] font-mono font-bold text-[#1B5E20] shadow-xs">
              F
            </kbd>
            <p className="text-slate-600 pt-1">Bật / Tắt ghim câu</p>
          </div>

          <div className="p-3.5 rounded-xl bg-[#E8F5E9]/50 border border-[#A5D6A7] text-center space-y-1">
            <kbd className="px-2.5 py-1 rounded bg-white border border-[#A5D6A7] font-mono font-bold text-[#1B5E20] shadow-xs">
              Enter
            </kbd>
            <p className="text-slate-600 pt-1">Kiểm tra / Câu tiếp</p>
          </div>

          <div className="p-3.5 rounded-xl bg-[#E8F5E9]/50 border border-[#A5D6A7] text-center space-y-1">
            <kbd className="px-2.5 py-1 rounded bg-white border border-[#A5D6A7] font-mono font-bold text-[#1B5E20] shadow-xs">
              ← / →
            </kbd>
            <p className="text-slate-600 pt-1">Chuyển câu Trước / Sau</p>
          </div>
        </div>
      </section>

      {/* Góc Chia Sẻ: Bí quyết nhớ Chữ Hán (Trích sách Thực Chiến Kosei) */}
      <section className="bg-gradient-to-br from-[#E8F5E9] via-emerald-50/50 to-white p-7 sm:p-9 rounded-3xl border-2 border-[#A5D6A7] shadow-sm space-y-6">
        <div className="flex items-center gap-3 pb-4 border-b border-[#A5D6A7]/40">
          <div className="w-10 h-10 rounded-2xl bg-[#1B5E20] text-white flex items-center justify-center font-bold text-lg shadow">
            漢
          </div>
          <div>
            <div className="inline-flex items-center gap-1.5 text-xs font-bold text-[#2E7D32] uppercase tracking-wider">
              <span>Góc chia sẻ bí quyết • Column 1</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-extrabold text-[#1B5E20]">
              Làm Sao Để Nhớ Chữ Hán N3? (漢字が覚えられない！)
            </h2>
          </div>
        </div>

        <p className="text-xs sm:text-sm text-slate-700 leading-relaxed italic bg-white/70 p-3.5 rounded-xl border border-[#A5D6A7]/50">
          &quot;Ban đầu thấy chữ Hán cũng thú vị, nhưng nhiều chữ quá làm sao nhớ hết? Nếu tiếng Nhật không có chữ Hán thì có phải dễ hơn không?...&quot;
          <span className="block not-italic font-bold text-[#1B5E20] pt-1">
            Thực tế: Không có chữ Hán thì tiếng Nhật cực kỳ khó đọc vì sẽ không biết ngắt câu ở đâu! Dưới đây là 5 mẹo ghi nhớ vàng từ các Sensei:
          </span>
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <div className="p-4 rounded-2xl bg-white border border-[#A5D6A7] shadow-xs space-y-1.5">
            <div className="flex items-center gap-2 text-[#1B5E20] font-bold text-sm">
              <span className="w-5 h-5 rounded-full bg-[#66BB6A] text-white flex items-center justify-center text-xs">1</span>
              <span>Dán thẻ chữ Hán nơi dễ thấy</span>
            </div>
            <p className="text-slate-600 leading-relaxed">
              Dán flashcard hoặc tờ giấy note chữ Hán lên tường bàn học, gương hoặc cửa phòng, mỗi ngày lướt qua đều nhìn thấy một lần để tạo ấn tượng thị giác.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-white border border-[#A5D6A7] shadow-xs space-y-1.5">
            <div className="flex items-center gap-2 text-[#1B5E20] font-bold text-sm">
              <span className="w-5 h-5 rounded-full bg-[#66BB6A] text-white flex items-center justify-center text-xs">2</span>
              <span>Học âm Kun-yomi qua câu ngắn</span>
            </div>
            <p className="text-slate-600 leading-relaxed">
              Âm thuần Nhật (Kun-yomi) nên học bằng cách đặt câu văn ngắn hoặc ngữ cảnh cụ thể (ví dụ: <span className="font-japanese font-medium text-slate-800">坂をのぼる</span>, <span className="font-japanese font-medium text-slate-800">お茶を冷ます</span>) sẽ nhớ lâu hơn học vẹt.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-white border border-[#A5D6A7] shadow-xs space-y-1.5">
            <div className="flex items-center gap-2 text-[#1B5E20] font-bold text-sm">
              <span className="w-5 h-5 rounded-full bg-[#66BB6A] text-white flex items-center justify-center text-xs">3</span>
              <span>Học kèm từ ghép (熟語 - Jukugo)</span>
            </div>
            <p className="text-slate-600 leading-relaxed">
              Mỗi khi gặp một chữ Hán mới, hãy học ngay 2-3 từ ghép phổ biến đi cùng chữ đó (ví dụ: chữ <span className="font-japanese font-bold text-[#1B5E20]">役</span> ➔ <span className="font-japanese">役所</span>, <span className="font-japanese">役に立つ</span>).
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-white border border-[#A5D6A7] shadow-xs space-y-1.5">
            <div className="flex items-center gap-2 text-[#1B5E20] font-bold text-sm">
              <span className="w-5 h-5 rounded-full bg-[#66BB6A] text-white flex items-center justify-center text-xs">4</span>
              <span>Gom nhóm theo bộ thủ hoặc cách đọc</span>
            </div>
            <p className="text-slate-600 leading-relaxed">
              Tự nhóm các chữ có chung bộ thủ (ví dụ bộ Mộc <span className="font-japanese font-bold text-emerald-700">木</span>: 枯, 枝, 柱) hoặc có cách đọc âm On giống nhau để phân biệt điểm dị biệt rõ ràng.
            </p>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-[#1B5E20] text-white text-xs flex items-center gap-3">
          <CheckCircle2 className="w-5 h-5 text-[#66BB6A] shrink-0" />
          <div className="leading-relaxed">
            <strong>Mẹo số 5 quan trọng nhất:</strong> Đừng chỉ nhìn bằng mắt! Hãy vừa nhẩm đọc vừa đặt bút viết lại nhiều lần để ngón tay và não bộ cùng ghi nhớ đường nét nét chữ.
          </div>
        </div>
      </section>

      {/* Phần 4: Dành cho Quản trị viên & Giáo viên */}
      <section className="bg-gradient-to-r from-slate-900 to-indigo-950 text-white p-7 sm:p-9 rounded-3xl shadow-lg space-y-5">
        <div className="space-y-1">
          <span className="text-xs uppercase font-bold tracking-wider text-indigo-300">
            Dành cho người biên soạn & Quản trị viên
          </span>
          <h2 className="text-xl sm:text-2xl font-bold">Quy trình nhập đề Data-Driven</h2>
          <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
            Hệ thống hỗ trợ chuyển đổi đề thi từ file PDF, Word hoặc ảnh scan sang file JSON chuẩn chỉ trong vài phút thông qua các mẫu Prompt AI được tối ưu sẵn.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 pt-2">
          <Link
            href="/admin/import"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-500 hover:bg-indigo-600 text-white text-xs font-bold transition-all shadow"
          >
            <FileText className="w-4 h-4" />
            <span>Thẩm định đề thi & Xem mẫu Prompt AI</span>
            <ArrowRight className="w-4 h-4" />
          </Link>

          <Link
            href="/exams"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold transition-all"
          >
            <Compass className="w-4 h-4" />
            <span>Bắt đầu luyện thi ngay</span>
          </Link>
        </div>
      </section>
    </div>
  );
}

