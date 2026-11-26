"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ExamDetail } from "@/lib/types";
import { AdminReviewEditor } from "@/components/AdminReviewEditor";
import {
  ShieldCheck,
  ArrowLeft,
  KeyRound,
  ExternalLink,
  BookOpen,
  Loader2,
  AlertTriangle,
} from "lucide-react";

export default function AdminReviewPage() {
  const params = useParams();
  const router = useRouter();
  const examId = params?.examId as string;

  const [exam, setExam] = useState<ExamDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!examId) return;

    fetch(`/data/exams/${examId}.json`)
      .then(async (res) => {
        if (!res.ok) throw new Error("Không thể tải thông tin đề thi");
        return res.json();
      })
      .then((data: ExamDetail) => {
        setExam(data);
      })
      .catch((err) => {
        console.error("Lỗi:", err);
        setError("Không tìm thấy bộ đề thi này trên hệ thống.");
      })
      .finally(() => setLoading(false));
  }, [examId]);

  if (loading) {
    return (
      <div className="py-24 text-center text-slate-400 text-sm flex items-center justify-center gap-2">
        <Loader2 className="w-5 h-5 animate-spin text-indigo-600" />
        <span>Đang tải đề thi và ảnh nguồn...</span>
      </div>
    );
  }

  if (error || !exam) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20 text-center space-y-4">
        <AlertTriangle className="w-10 h-10 text-amber-500 mx-auto" />
        <h2 className="text-xl font-bold text-slate-800">Không tìm thấy bộ đề</h2>
        <p className="text-sm text-slate-500">{error || "Đề thi không tồn tại trong hệ thống."}</p>
        <Link
          href="/admin"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 text-white text-sm font-semibold hover:bg-indigo-700"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Quay lại Quản lý đề thi</span>
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Top Breadcrumb */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <Link
          href="/admin"
          className="inline-flex items-center gap-2 text-xs font-semibold text-slate-600 hover:text-slate-900 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Quay lại Danh mục Quản trị</span>
        </Link>

        <div className="flex items-center gap-2">
          <Link
            href={`/practice/${exam.id}?mode=practice`}
            target="_blank"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold shadow-2xs transition-colors"
          >
            <span>Thử nghiệm giao diện luyện thi</span>
            <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
          </Link>
        </div>
      </div>

      {/* Admin Review Editor Component */}
      <AdminReviewEditor
        exam={exam}
        rawTextPreview={exam.description}
        onUpdateExam={(updated) => setExam(updated)}
        onPublished={(publishedId) => {
          setTimeout(() => {
            router.push("/admin");
          }, 1500);
        }}
      />
    </div>
  );
}

