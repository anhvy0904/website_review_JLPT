import Link from "next/link";
import { BookOpen, ShieldCheck, Heart, Sparkles } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t border-[#A5D6A7]/50 bg-[#E8F5E9]/40 text-slate-600 mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Col 1 */}
          <div className="md:col-span-2 space-y-3">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg overflow-hidden border border-[#A5D6A7] bg-white">
                <img
                  src="/images/mascot-frog.jpg"
                  alt="Mascot Ếch VuyAnh"
                  className="w-full h-full object-cover"
                />
              </div>
              <span className="font-extrabold text-[#1B5E20] text-base">
                Luyện đề tiếng Nhật cùng VuyAnh 🌸
              </span>
            </div>
            <p className="text-sm text-slate-600 max-w-md leading-relaxed">
              Góc nhỏ luyện thi trắc nghiệm JLPT N3 do VuyAnh tự tay chuẩn bị riêng cho ngừi iu: giải thích cặn kẽ 100% tiếng Việt cho từng lựa chọn, phân tích ngữ pháp, từ vựng và bài đọc với giao diện trực quan, nhẹ nhàng và thanh bình.
            </p>
            <div className="flex items-center gap-2 text-xs text-emerald-800 pt-1 font-medium">
              <ShieldCheck className="w-4 h-4 text-[#2E7D32]" />
              <span>Dữ liệu đề được chuẩn hóa theo Schema 1.0.0 • Không có phần nghe</span>
            </div>
          </div>

          {/* Col 2 */}
          <div className="space-y-2.5">
            <h4 className="text-sm font-bold text-[#1B5E20] tracking-wide">Điều hướng</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/" className="hover:text-[#1B5E20] transition-colors">
                  Trang chủ
                </Link>
              </li>
              <li>
                <Link href="/exams" className="hover:text-[#1B5E20] transition-colors">
                  Kho đề thi N3
                </Link>
              </li>
              <li>
                <Link href="/learn" className="hover:text-[#1B5E20] transition-colors">
                  Học 2 chuyên đề
                </Link>
              </li>
              <li>
                <Link href="/flashcards" className="hover:text-[#1B5E20] transition-colors">
                  Flashcard Từ Vựng N3
                </Link>
              </li>
              <li>
                <Link href="/review" className="hover:text-[#1B5E20] transition-colors">
                  Sổ tay câu sai
                </Link>
              </li>
              <li>
                <Link href="/dashboard" className="hover:text-[#1B5E20] transition-colors">
                  Thống kê học tập
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 3 */}
          <div className="space-y-2.5">
            <h4 className="text-sm font-bold text-[#1B5E20] tracking-wide">Chuyên đề học tập</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/learn/verb-forms" className="hover:text-[#1B5E20] transition-colors">
                  12 Thể động từ N3
                </Link>
              </li>
              <li>
                <Link href="/learn/keigo" className="hover:text-[#1B5E20] transition-colors">
                  Kính ngữ & Khiêm nhường ngữ
                </Link>
              </li>
              <li>
                <Link href="/guide" className="hover:text-[#1B5E20] transition-colors">
                  Cẩm nang cấu trúc đề N3
                </Link>
              </li>
              <li>
                <Link href="/admin" className="hover:text-[#1B5E20] transition-colors text-slate-400">
                  Khu vực Admin (Nhập đề AI)
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-10 pt-6 border-t border-[#A5D6A7]/40 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-3">
          <p>© {new Date().getFullYear()} Luyện đề tiếng Nhật cùng VuyAnh 🌸 • Đồng hành cùng ngừi iu chinh phục JLPT N3</p>
          <p className="flex items-center gap-1.5 text-emerald-800 font-medium">
            <span>Thiết kế riêng cho ngừi iu với tất cả yêu thương</span>
            <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500" />
            <span>và tĩnh tâm</span>
            <span className="text-base">🐸💚</span>
          </p>
        </div>
      </div>
    </footer>
  );
}
