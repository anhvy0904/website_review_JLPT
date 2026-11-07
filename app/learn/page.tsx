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
  title: "Học Chuyên Đề JLPT N3 - Chia Động Từ & Kính Ngữ",
  description: "Hai chuyên đề ngữ pháp then chốt JLPT N3: 12 Thể động từ và Kính ngữ / Khiêm nhường ngữ công sở.",
};

export default function LearningHubPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      {/* Hero */}
      <div className="text-center max-w-3xl mx-auto space-y-3">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-50 border border-blue-200/80 text-blue-700 text-xs font-semibold">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Chuyên Đề Trọng Tâm JLPT N3</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
          Học Ngữ Pháp Theo Chuyên Đề
        </h1>
        <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
          Nắm vững quy tắc chia 12 thể động từ và làm chủ hệ thống Kính ngữ – Khiêm nhường ngữ trong đời sống và môi trường làm việc Nhật Bản.
        </p>
      </div>

      {/* 2 Big Module Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-stretch">
        {/* Module A: Verb Forms */}
        <div className="bg-gradient-to-br from-sky-50/80 via-white to-blue-50/40 p-8 sm:p-10 rounded-3xl border border-sky-200/80 shadow-sm flex flex-col justify-between space-y-6 hover:shadow-md transition-all group">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-blue-100 text-blue-800">
                12 Thể Động Từ
              </span>
              <span className="text-xs font-mono font-semibold text-slate-400">
                Module A
              </span>
            </div>

            <div className="space-y-1">
              <span className="text-sm font-bold text-blue-600 font-japanese block">
                動詞の活用（どうしのかつよう）
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight group-hover:text-blue-900 transition-colors">
                Học Chia Các Thể Động Từ
              </h2>
            </div>

            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              Làm chủ 12 thể động từ quan trọng nhất của tiếng Nhật: <b>て, た, ない, từ điển, điều kiện ば, ý chí, mệnh lệnh, cấm đoán, khả năng, bị động, sai khiến, bị động sai khiến</b>. Tích hợp công cụ tra chia thể động từ kiểm thử chính xác.
            </p>

            {/* Feature Pills */}
            <div className="grid grid-cols-2 gap-2.5 pt-2 text-xs text-slate-700">
              <div className="flex items-center gap-2 p-2.5 rounded-xl bg-white/90 border border-slate-200/70">
                <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0" />
                <span>Quy tắc Nhóm I, II, III</span>
              </div>
              <div className="flex items-center gap-2 p-2.5 rounded-xl bg-white/90 border border-slate-200/70">
                <Table className="w-4 h-4 text-blue-600 shrink-0" />
                <span>Bảng tra chia 12 thể</span>
              </div>
              <div className="flex items-center gap-2 p-2.5 rounded-xl bg-white/90 border border-slate-200/70">
                <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0" />
                <span>Ngoại lệ & Biến âm</span>
              </div>
              <div className="flex items-center gap-2 p-2.5 rounded-xl bg-white/90 border border-slate-200/70">
                <Sparkles className="w-4 h-4 text-blue-600 shrink-0" />
                <span>Trắc nghiệm 4 lựa chọn</span>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-sky-100">
            <Link
              href="/learn/verb-forms"
              className="w-full py-4 rounded-2xl bg-blue-600 hover:bg-blue-700 active:scale-[0.99] text-white font-bold text-sm shadow-md shadow-blue-100 flex items-center justify-center gap-2 transition-all"
            >
              <span>Vào học 12 Thể Động Từ</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>

        {/* Module B: Keigo */}
        <div className="bg-gradient-to-br from-emerald-50/70 via-white to-teal-50/40 p-8 sm:p-10 rounded-3xl border border-emerald-200/80 shadow-sm flex flex-col justify-between space-y-6 hover:shadow-md transition-all group">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800">
                Giao Tiếp Công Sở N3
              </span>
              <span className="text-xs font-mono font-semibold text-slate-400">
                Module B
              </span>
            </div>

            <div className="space-y-1">
              <span className="text-sm font-bold text-emerald-600 font-japanese block">
                敬語・謙譲語（けいご・けんじょうご）
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight group-hover:text-emerald-900 transition-colors">
                Kính Ngữ & Khiêm Nhường Ngữ
              </h2>
            </div>

            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              Phân biệt rõ ràng <b>尊敬語 (Tôn kính ngữ)</b>, <b>謙譲語 (Khiêm nhường ngữ)</b> và <b>丁寧語 (Lịch sự ngữ)</b>. Nắm chắc nguyên tắc <b>Trong – Ngoài (内・外)</b> khi trao đổi với cấp trên, đồng nghiệp và đối tác khách hàng.
            </p>

            {/* Feature Pills */}
            <div className="grid grid-cols-2 gap-2.5 pt-2 text-xs text-slate-700">
              <div className="flex items-center gap-2 p-2.5 rounded-xl bg-white/90 border border-slate-200/70">
                <Crown className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>3 Nhóm Kính ngữ cốt lõi</span>
              </div>
              <div className="flex items-center gap-2 p-2.5 rounded-xl bg-white/90 border border-slate-200/70">
                <Compass className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Nguyên tắc Trong - Ngoài (内・外)</span>
              </div>
              <div className="flex items-center gap-2 p-2.5 rounded-xl bg-white/90 border border-slate-200/70">
                <Table className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Động từ đặc biệt bất quy tắc</span>
              </div>
              <div className="flex items-center gap-2 p-2.5 rounded-xl bg-white/90 border border-slate-200/70">
                <Sparkles className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Tình huống email & hội thoại</span>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-emerald-100">
            <Link
              href="/learn/keigo"
              className="w-full py-4 rounded-2xl bg-emerald-600 hover:bg-emerald-700 active:scale-[0.99] text-white font-bold text-sm shadow-md shadow-emerald-100 flex items-center justify-center gap-2 transition-all"
            >
              <span>Vào học Kính Ngữ Công Sở</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
