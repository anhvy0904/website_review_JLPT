"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { LearningQuizPlayer, LearningQuizItem } from "@/components/LearningQuizPlayer";
import {
  Crown,
  UserCheck,
  Sparkles,
  Compass,
  Table,
  ArrowRight,
  BookOpen,
  Volume2,
  CheckCircle2,
  ShieldAlert,
} from "lucide-react";

interface KeigoCategory {
  id: string;
  titleJa: string;
  reading: string;
  titleVi: string;
  summaryVi: string;
  actionSubject: string;
  badgeColor: string;
}

interface SpecialVerbRow {
  base: string;
  meaningVi: string;
  sonkeigo: string;
  kenjougo: string;
  teineigo: string;
}

export default function KeigoHubPage() {
  const [categories, setCategories] = useState<KeigoCategory[]>([]);
  const [specialVerbs, setSpecialVerbs] = useState<SpecialVerbRow[]>([]);
  const [quizzes, setQuizzes] = useState<LearningQuizItem[]>([]);

  useEffect(() => {
    // Load Keigo index
    fetch("/data/learning/keigo/index.json")
      .then((res) => res.json())
      .then((data) => {
        if (data.categories) setCategories(data.categories);
      })
      .catch((err) => console.error(err));

    // Load special verbs
    fetch("/data/learning/keigo/special-verbs.json")
      .then((res) => res.json())
      .then((data) => {
        if (data.verbs) setSpecialVerbs(data.verbs);
      })
      .catch((err) => console.error(err));

    // Load quizzes
    fetch("/data/learning/quizzes/keigo-quizzes.json")
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) setQuizzes(data);
      })
      .catch((err) => console.error(err));
  }, []);

  const speak = (text: string) => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text);
    u.lang = "ja-JP";
    u.rate = 0.9;
    window.speechSynthesis.speak(u);
  };

  return (
    <div className="min-h-screen bg-[#f3fbf7] py-10 px-4 sm:px-6 lg:px-8 space-y-12">
      <div className="max-w-7xl mx-auto space-y-10">
        {/* Header Breadcrumb & Title */}
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-100/70 border border-emerald-200 text-emerald-800 text-xs font-semibold">
            <Crown className="w-3.5 h-3.5" />
            <span>Chuyên Đề Kính Ngữ N3 — Module B</span>
          </div>

          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            敬語（けいご）を学ぼう — Học Kính Ngữ Tiếng Nhật
          </h1>

          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
            Nắm chắc ranh giới giữa <b>尊敬語</b>, <b>謙譲語</b>, <b>丁寧語</b> và quy tắc <b>Trong – Ngoài (内・外)</b> để không bao giờ mất điểm trong kỳ thi JLPT N3 và tự tin giao tiếp thương mại.
          </p>
        </div>

        {/* 3 MAIN CATEGORIES CARDS + 2 SPECIAL TOPICS */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Card 1: Sonkeigo */}
          <Link
            href="/learn/keigo/sonkeigo"
            className="group bg-white p-7 rounded-3xl border border-slate-200/90 hover:border-emerald-300 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all space-y-4 flex flex-col justify-between"
          >
            <div className="space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <Crown className="w-6 h-6" />
              </div>

              <div>
                <span className="text-xs font-bold text-emerald-600 font-japanese block">
                  そんけいご
                </span>
                <h2 className="text-2xl font-extrabold text-slate-900 font-japanese">
                  尊敬語
                </h2>
                <h3 className="text-sm font-bold text-slate-700 mt-0.5">
                  Tôn Kính Ngữ
                </h3>
              </div>

              <p className="text-xs text-slate-600 leading-relaxed">
                Nâng cao hành vi của <b>đối phương</b> (khách hàng, sếp, thầy cô). Tuyệt đối không dùng cho chính mình.
              </p>

              <div className="p-3 rounded-xl bg-emerald-50/60 border border-emerald-100 text-[11px] text-emerald-950 font-semibold">
                Chủ thể: Khách hàng / Cấp trên (Người khác)
              </div>
            </div>

            <div className="pt-2 flex items-center text-xs font-bold text-emerald-600 group-hover:text-emerald-800 gap-1">
              <span>Xem chi tiết công thức</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>

          {/* Card 2: Kenjougo */}
          <Link
            href="/learn/keigo/kenjougo"
            className="group bg-white p-7 rounded-3xl border border-slate-200/90 hover:border-indigo-300 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all space-y-4 flex flex-col justify-between"
          >
            <div className="space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                <UserCheck className="w-6 h-6" />
              </div>

              <div>
                <span className="text-xs font-bold text-indigo-600 font-japanese block">
                  けんじょうご
                </span>
                <h2 className="text-2xl font-extrabold text-slate-900 font-japanese">
                  謙譲語
                </h2>
                <h3 className="text-sm font-bold text-slate-700 mt-0.5">
                  Khiêm Nhường Ngữ
                </h3>
              </div>

              <p className="text-xs text-slate-600 leading-relaxed">
                Hạ thấp hành vi của <b>bản thân hoặc người phe mình</b> để gián tiếp bày tỏ sự tôn kính tới đối phương.
              </p>

              <div className="p-3 rounded-xl bg-indigo-50/60 border border-indigo-100 text-[11px] text-indigo-950 font-semibold">
                Chủ thể: Bản thân / Người công ty mình
              </div>
            </div>

            <div className="pt-2 flex items-center text-xs font-bold text-indigo-600 group-hover:text-indigo-800 gap-1">
              <span>Xem chi tiết công thức</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>

          {/* Card 3: Teineigo */}
          <Link
            href="/learn/keigo/teineigo"
            className="group bg-white p-7 rounded-3xl border border-slate-200/90 hover:border-blue-300 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all space-y-4 flex flex-col justify-between"
          >
            <div className="space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center">
                <Sparkles className="w-6 h-6" />
              </div>

              <div>
                <span className="text-xs font-bold text-blue-600 font-japanese block">
                  ていねいご
                </span>
                <h2 className="text-2xl font-extrabold text-slate-900 font-japanese">
                  丁寧語
                </h2>
                <h3 className="text-sm font-bold text-slate-700 mt-0.5">
                  Lịch Sự Ngữ
                </h3>
              </div>

              <p className="text-xs text-slate-600 leading-relaxed">
                Lời nói trang nhã, nhã nhặn hướng tới người nghe: đuôi <b>です</b>, <b>ます</b>, và <b>でございます</b>.
              </p>

              <div className="p-3 rounded-xl bg-blue-50/60 border border-blue-100 text-[11px] text-blue-950 font-semibold">
                Mục đích: Thái độ nhã nhặn, tôn trọng chung
              </div>
            </div>

            <div className="pt-2 flex items-center text-xs font-bold text-blue-600 group-hover:text-blue-800 gap-1">
              <span>Xem chi tiết công thức</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>
        </div>

        {/* SECTION UCHI - SOTO (QUY TẮC TRONG - NGOÀI) */}
        <div className="bg-gradient-to-r from-purple-50/90 via-white to-indigo-50/60 p-7 sm:p-9 rounded-3xl border border-purple-200 shadow-sm space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <Compass className="w-5 h-5 text-purple-600" />
                <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 font-japanese">
                  内・外の法則 — Nguyên Tắc "Trong & Ngoài" Trong Công Sở Nhật
                </h2>
              </div>
              <p className="text-xs sm:text-sm text-slate-600">
                Chìa khóa trả lời đúng 100% câu hỏi kính ngữ giao tiếp công ty trong đề thi JLPT N3.
              </p>
            </div>

            <Link
              href="/learn/keigo/uchisoto"
              className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold shadow-sm transition-all flex items-center gap-1.5 shrink-0 self-start sm:self-auto"
            >
              <span>Chi tiết Uchi-Soto</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            {/* Uchi Box */}
            <div className="p-5 rounded-2xl bg-white border border-purple-200/80 space-y-2">
              <span className="font-extrabold text-purple-900 block text-sm">
                1. Phe TRONG (内 - Uchi)
              </span>
              <p className="text-slate-600 leading-relaxed">
                Bản thân, gia đình, người cùng công ty (kể cả Giám đốc, Trưởng phòng).
              </p>
              <div className="p-3 rounded-xl bg-purple-50 text-purple-900 font-semibold leading-relaxed">
                👉 Khi nói với người ngoài (khách hàng / đối tác): BỎ chức danh sếp, gọi tên trần và <b>DÙNG KHIÊM NHƯỜNG NGỮ</b> cho sếp mình!
                <br />
                <span className="text-[11px] text-purple-700">Ví dụ: 社長の田中は席を外しております。(Đúng)</span>
              </div>
            </div>

            {/* Soto Box */}
            <div className="p-5 rounded-2xl bg-white border border-purple-200/80 space-y-2">
              <span className="font-extrabold text-purple-900 block text-sm">
                2. Phe NGOÀI (外 - Soto)
              </span>
              <p className="text-slate-600 leading-relaxed">
                Khách hàng, người công ty đối tác, người ngoài tổ chức của mình.
              </p>
              <div className="p-3 rounded-xl bg-emerald-50 text-emerald-900 font-semibold leading-relaxed">
                👉 Hành động của họ <b>LUÔN DÙNG TÔN KÍNH NGỮ</b> để tôn vinh khách hàng.
                <br />
                <span className="text-[11px] text-emerald-700">Ví dụ: お客様がいらっしゃいました。(Đúng)</span>
              </div>
            </div>
          </div>
        </div>

        {/* SECTION: BẢNG ĐỘNG TỪ KÍNH NGỮ BẤT QUY TẮC ĐẶC BIỆT */}
        <div className="bg-white p-7 sm:p-9 rounded-3xl border border-slate-200/90 shadow-sm space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <Table className="w-5 h-5 text-amber-600" />
                <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 font-japanese">
                  特別敬語動詞一覧表 — Bảng Động Từ Kính Ngữ Đặc Biệt
                </h2>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Các cặp biến đổi bất quy tắc bắt buộc phải thuộc lòng khi ôn thi JLPT N3.
              </p>
            </div>

            <Link
              href="/learn/keigo/special-verbs"
              className="text-xs font-bold text-amber-700 hover:text-amber-800 flex items-center gap-1"
            >
              <span>Xem trang tra cứu đầy đủ →</span>
            </Link>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50/80 text-slate-700 font-bold">
                  <th className="py-3 px-4">Động từ thường</th>
                  <th className="py-3 px-4">Nghĩa tiếng Việt</th>
                  <th className="py-3 px-4 text-emerald-800 bg-emerald-50/40">尊敬語 (Tôn kính ngữ)</th>
                  <th className="py-3 px-4 text-indigo-800 bg-indigo-50/40">謙譲語 (Khiêm nhường ngữ)</th>
                  <th className="py-3 px-4">Nghe</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-japanese">
                {specialVerbs.slice(0, 9).map((v, i) => (
                  <tr key={i} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-3 px-4 font-bold text-slate-900 text-sm">
                      {v.base}
                    </td>
                    <td className="py-3 px-4 font-sans text-slate-600 font-medium">
                      {v.meaningVi}
                    </td>
                    <td className="py-3 px-4 font-semibold text-emerald-700 bg-emerald-50/20">
                      {v.sonkeigo}
                    </td>
                    <td className="py-3 px-4 font-semibold text-indigo-700 bg-indigo-50/20">
                      {v.kenjougo}
                    </td>
                    <td className="py-3 px-4 font-sans">
                      <button
                        type="button"
                        onClick={() => speak(`${v.base}. ${v.sonkeigo}. ${v.kenjougo}`)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-emerald-600 transition-colors"
                        title="Nghe phát âm"
                      >
                        <Volume2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* SECTION: KEIGO BUSINESS QUIZZES */}
        {quizzes.length > 0 && (
          <div className="space-y-4">
            <div className="space-y-1">
              <h2 className="text-2xl font-extrabold text-slate-900">
                Thực Hành Kính Ngữ Công Sở & Hội Thoại
              </h2>
              <p className="text-xs text-slate-500">
                Chọn mẫu câu kính ngữ chuẩn theo đúng chủ thể hành động và đối tượng tôn kính.
              </p>
            </div>

            <LearningQuizPlayer
              module="keigo"
              quizzes={quizzes}
              title="Luyện Tập Trắc Nghiệm Kính Ngữ N3"
            />
          </div>
        )}
      </div>
    </div>
  );
}

