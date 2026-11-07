import Link from "next/link";
import { BookOpen, ShieldCheck, Heart } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t border-slate-200 bg-slate-50 text-slate-600 mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Col 1 */}
          <div className="md:col-span-2 space-y-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white">
                <BookOpen className="w-4 h-4" />
              </div>
              <span className="font-bold text-slate-900 text-base">JLPT N3 Practice Hub</span>
            </div>
            <p className="text-sm text-slate-500 max-w-md leading-relaxed">
              Nền tảng luyện thi trắc nghiệm JLPT N3 tối ưu hóa cho người Việt: giải thích cặn kẽ từng lựa chọn, phân tích ngữ pháp, từ vựng và bài đọc với giao diện trực quan, không quảng cáo gây phân tâm.
            </p>
            <div className="flex items-center gap-2 text-xs text-slate-500 pt-1">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>Dữ liệu đề được thẩm định và đồng bộ tự động theo Schema 1.0.0</span>
            </div>
          </div>

          {/* Col 2 */}
          <div className="space-y-2.5">
            <h4 className="text-sm font-semibold text-slate-900 tracking-wide">Điều hướng</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/" className="hover:text-indigo-600 transition-colors">
                  Trang chủ
                </Link>
              </li>
              <li>
                <Link href="/exams" className="hover:text-indigo-600 transition-colors">
                  Kho đề thi N3
                </Link>
              </li>
              <li>
                <Link href="/dashboard" className="hover:text-indigo-600 transition-colors">
                  Thống kê học tập
                </Link>
              </li>
              <li>
                <Link href="/review" className="hover:text-indigo-600 transition-colors">
                  Ôn tập câu sai
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 3 */}
          <div className="space-y-2.5">
            <h4 className="text-sm font-semibold text-slate-900 tracking-wide">Ghi chú phạm vi</h4>
            <p className="text-xs text-slate-500 leading-relaxed">
              Hệ thống tập trung chuyên sâu vào Từ vựng/Chữ Hán, Ngữ pháp và Đọc hiểu (không bao gồm bài nghe). Điểm số là tỷ lệ đúng thô (% raw score), không quy đổi điểm scaled score 0–180 của kỳ thi chính thức.
            </p>
          </div>
        </div>

        <div className="border-t border-slate-200 mt-10 pt-6 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-400 gap-4">
          <p>© {new Date().getFullYear()} JLPT N3 Practice Hub. Dành riêng cho cộng đồng học tiếng Nhật tại Việt Nam.</p>
          <p className="flex items-center gap-1">
            Được xây dựng với <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500" /> cho người tự học JLPT
          </p>
        </div>
      </div>
    </footer>
  );
}
