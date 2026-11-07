import React from "react";
import Link from "next/link";
import {
  Layers,
  Sparkles,
  ArrowRight,
  BookOpen,
  Crown,
  CheckCircle2,
  Table,
  Compass,
} from "lucide-react";

export const metadata = {
  title: "Học Chuyên Đề N3 — Luyện đề tiếng Nhật cùng VuyAnh 🌸",
  description: "Hai chuyên đề ngữ pháp then chốt JLPT N3: 12 Thể động từ và Kính ngữ / Khiêm nhường ngữ công sở cùng VuyAnh.",
};

export default function LearningHubPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      {/* Hero */}
      <div className="text-center max-w-3xl mx-auto space-y-3">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#E8F5E9] border border-[#A5D6A7] text-[#1B5E20] text-xs font-semibold shadow-sm">
          <Sparkles className="w-3.5 h-3.5 text-[#66BB6A]" />
          <span>Chuyên Đề Trọng Tâm • Học cùng VuyAnh 🌸</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-[#1B5E20] tracking-tight">
          Học Ngữ Pháp Theo Chuyên Đề
        </h1>
        <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
          Nắm vững quy tắc chia 12 thể động từ và làm chủ hệ thống Kính ngữ – Khiêm nhường ngữ trong đời sống và môi trường làm việc Nhật Bản.
        </p>
      </div>

      {/* 2 Big Module Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-stretch">
        {/* Module A: Verb Forms */}
        <div className="bg-gradient-to-br from-[#E8F5E9] via-white to-[#E8F5E9]/40 p-8 sm:p-10 rounded-3xl border-2 border-[#A5D6A7] shadow-sm flex flex-col justify-between space-y-6 hover:shadow-md transition-all group">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-[#E8F5E9] text-[#1B5E20] border border-[#A5D6A7]">
                12 Thể Động Từ
              </span>
              <span className="text-xs font-mono font-semibold text-emerald-800">
                Chuyên Đề A
              </span>
            </div>

            <div className="space-y-1">
              <span className="text-sm font-bold text-[#2E7D32] font-japanese block">
                動詞の活用（どうしのかつよう）
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-[#1B5E20] tracking-tight group-hover:text-[#2E7D32] transition-colors">
                Học Chia Các Thể Động Từ
              </h2>
            </div>

            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              Làm chủ 12 thể động từ quan trọng nhất của tiếng Nhật: <b>て, た, ない, từ điển, điều kiện ば, ý chí, mệnh lệnh, cấm đoán, khả năng, bị động, sai khiến, bị động sai khiến</b>. Tích hợp công cụ tra chia thể động từ kiểm thử chính xác.
            </p>

            {/* Feature Pills */}
            <div className="grid grid-cols-2 gap-2.5 pt-2 text-xs text-slate-700">
              <div className="flex items-center gap-2 p-2.5 rounded-xl bg-white border border-[#A5D6A7]/60">
                <CheckCircle2 className="w-4 h-4 text-[#2E7D32] shrink-0" />
                <span>Quy tắc Nhóm I, II, III</span>
              </div>
              <div className="flex items-center gap-2 p-2.5 rounded-xl bg-white border border-[#A5D6A7]/60">
                <Table className="w-4 h-4 text-[#2E7D32] shrink-0" />
                <span>Bảng tra chia 12 thể</span>
              </div>
              <div className="flex items-center gap-2 p-2.5 rounded-xl bg-white border border-[#A5D6A7]/60">
                <CheckCircle2 className="w-4 h-4 text-[#2E7D32] shrink-0" />
                <span>Ngoại lệ & Biến âm</span>
              </div>
              <div className="flex items-center gap-2 p-2.5 rounded-xl bg-white border border-[#A5D6A7]/60">
                <Sparkles className="w-4 h-4 text-[#2E7D32] shrink-0" />
                <span>Trắc nghiệm 4 lựa chọn</span>
              </div>
            </div>
          </div>

          <Link
            href="/learn/verb-forms"
            className="w-full py-3.5 rounded-2xl bg-[#1B5E20] hover:bg-[#2E7D32] text-white text-sm font-bold shadow-md shadow-emerald-950/20 flex items-center justify-center gap-2 transition-all active:scale-98"
          >
            <span>Vào học 12 Thể Động Từ</span>
            <ArrowRight className="w-4 h-4 text-[#A5D6A7]" />
          </Link>
        </div>

        {/* Module B: Keigo */}
        <div className="bg-gradient-to-br from-[#E8F5E9] via-white to-[#E8F5E9]/40 p-8 sm:p-10 rounded-3xl border-2 border-[#A5D6A7] shadow-sm flex flex-col justify-between space-y-6 hover:shadow-md transition-all group">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-[#E8F5E9] text-[#1B5E20] border border-[#A5D6A7]">
                Giao Tiếp Chuẩn Mực
              </span>
              <span className="text-xs font-mono font-semibold text-emerald-800">
                Chuyên Đề B
              </span>
            </div>

            <div className="space-y-1">
              <span className="text-sm font-bold text-[#2E7D32] font-japanese block">
                敬語・謙譲語（けいご・けんじょうご）
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-[#1B5E20] tracking-tight group-hover:text-[#2E7D32] transition-colors">
                Kính Ngữ & Khiêm Nhường Ngữ
              </h2>
            </div>

            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              Hiểu sâu bản chất <b>Kính ngữ (Tôn kính ngữ, Khiêm nhường ngữ, Lịch sự ngữ)</b> và nguyên tắc <b>Trong - Ngoài (内・外)</b> khi giao tiếp với sếp, đồng nghiệp và khách hàng trong bài thi JLPT N3.
            </p>

            {/* Feature Pills */}
            <div className="grid grid-cols-2 gap-2.5 pt-2 text-xs text-slate-700">
              <div className="flex items-center gap-2 p-2.5 rounded-xl bg-white border border-[#A5D6A7]/60">
                <CheckCircle2 className="w-4 h-4 text-[#2E7D32] shrink-0" />
                <span>3 Nhánh Kính Ngữ</span>
              </div>
              <div className="flex items-center gap-2 p-2.5 rounded-xl bg-white border border-[#A5D6A7]/60">
                <Crown className="w-4 h-4 text-[#2E7D32] shrink-0" />
                <span>Bảng Động Từ Đặc Biệt</span>
              </div>
              <div className="flex items-center gap-2 p-2.5 rounded-xl bg-white border border-[#A5D6A7]/60">
                <CheckCircle2 className="w-4 h-4 text-[#2E7D32] shrink-0" />
                <span>Quy tắc Trong - Ngoài</span>
              </div>
              <div className="flex items-center gap-2 p-2.5 rounded-xl bg-white border border-[#A5D6A7]/60">
                <Sparkles className="w-4 h-4 text-[#2E7D32] shrink-0" />
                <span>Tình huống thực tế</span>
              </div>
            </div>
          </div>

          <Link
            href="/learn/keigo"
            className="w-full py-3.5 rounded-2xl bg-[#1B5E20] hover:bg-[#2E7D32] text-white text-sm font-bold shadow-md shadow-emerald-950/20 flex items-center justify-center gap-2 transition-all active:scale-98"
          >
            <span>Vào học Kính Ngữ</span>
            <ArrowRight className="w-4 h-4 text-[#A5D6A7]" />
          </Link>
        </div>
      </div>

      {/* Integration Callout */}
      <div className="p-6 rounded-2xl bg-[#E8F5E9] border-2 border-[#A5D6A7] flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="space-y-1 text-center sm:text-left">
          <div className="flex items-center justify-center sm:justify-start gap-2 text-xs font-bold text-[#1B5E20]">
            <BookOpen className="w-4 h-4 text-[#2E7D32]" />
            <span>Đồng bộ cùng kho đề thi</span>
          </div>
          <p className="text-sm font-bold text-[#1B5E20]">
            Vừa học lý thuyết, vừa thực chiến ngay trên các đề thi chuẩn cấu trúc N3
          </p>
        </div>

        <Link
          href="/exams"
          className="px-5 py-2.5 rounded-xl bg-[#1B5E20] hover:bg-[#2E7D32] text-white font-semibold text-xs shadow-sm flex items-center gap-1.5 shrink-0 transition-all"
        >
          <Compass className="w-4 h-4 text-[#A5D6A7]" />
          <span>Vào kho đề thi</span>
        </Link>
      </div>
    </div>
  );
}
