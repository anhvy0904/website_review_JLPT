"use client";

import React, { useState } from "react";
import { ExamSurvey } from "@/lib/types";
import { saveSurvey } from "@/lib/storage";
import { Star, MessageSquare, Send, CheckCircle2, X } from "lucide-react";

interface SurveyModalProps {
  attemptId: string;
  examId: string;
  isOpen: boolean;
  onClose: () => void;
  onSubmitted?: () => void;
}

export function SurveyModal({
  attemptId,
  examId,
  isOpen,
  onClose,
  onSubmitted,
}: SurveyModalProps) {
  const [difficultyRating, setDifficultyRating] = useState<number>(3);
  const [usefulnessRating, setUsefulnessRating] = useState<number>(5);
  const [feedbackText, setFeedbackText] = useState("");
  const [submitted, setSubmitted] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const survey: ExamSurvey = {
      attemptId,
      examId,
      difficultyRating,
      usefulnessRating,
      feedbackText: feedbackText.trim() || undefined,
      submittedAt: new Date().toISOString(),
    };

    saveSurvey(survey);
    setSubmitted(true);
    setTimeout(() => {
      if (onSubmitted) onSubmitted();
      onClose();
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl border border-slate-100 p-6 sm:p-7 overflow-hidden">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100"
        >
          <X className="w-5 h-5" />
        </button>

        {submitted ? (
          <div className="py-8 text-center space-y-3">
            <div className="w-14 h-14 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-bold text-slate-900">Cảm ơn đánh giá của bạn!</h3>
            <p className="text-sm text-slate-600">
              Phản hồi đã được ghi nhận vào hệ thống để cải thiện chất lượng đề thi.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <div className="flex items-center gap-2 text-indigo-600 mb-1">
                <MessageSquare className="w-5 h-5" />
                <span className="text-xs font-bold uppercase tracking-wider">Khảo sát sau bài thi</span>
              </div>
              <h3 className="text-lg font-bold text-slate-900">Cảm nhận của bạn về đề thi</h3>
              <p className="text-xs text-slate-500">Giúp đội ngũ biên soạn nâng cao chất lượng lời giải</p>
            </div>

            {/* Câu hỏi 1: Độ khó */}
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-800 block">
                1. Đề thi này khó đến mức nào?
              </label>
              <div className="flex items-center justify-between gap-1 p-2 bg-slate-50 rounded-xl border border-slate-200">
                {[1, 2, 3, 4, 5].map((val) => (
                  <button
                    key={val}
                    type="button"
                    onClick={() => setDifficultyRating(val)}
                    className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all ${
                      difficultyRating === val
                        ? "bg-indigo-600 text-white shadow-sm"
                        : "text-slate-600 hover:bg-slate-200/60"
                    }`}
                  >
                    {val}
                  </button>
                ))}
              </div>
              <div className="flex justify-between text-[11px] text-slate-400 px-1">
                <span>1: Quá dễ</span>
                <span>3: Chuẩn N3</span>
                <span>5: Rất khó</span>
              </div>
            </div>

            {/* Câu hỏi 2: Độ hữu ích */}
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-800 block">
                2. Lời giải chi tiết có hữu ích không?
              </label>
              <div className="flex items-center gap-2 justify-center py-2 bg-slate-50 rounded-xl border border-slate-200">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setUsefulnessRating(star)}
                    className="p-1 hover:scale-110 transition-transform"
                  >
                    <Star
                      className={`w-7 h-7 ${
                        star <= usefulnessRating
                          ? "fill-amber-400 text-amber-400"
                          : "text-slate-300"
                      }`}
                    />
                  </button>
                ))}
              </div>
              <div className="flex justify-between text-[11px] text-slate-400 px-1">
                <span>1: Không hữu ích</span>
                <span>5: Rất chi tiết & dễ hiểu</span>
              </div>
            </div>

            {/* Câu hỏi 3: Góp ý */}
            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-slate-800 block">
                3. Bạn muốn cải thiện điều gì thêm? (Tùy chọn)
              </label>
              <textarea
                value={feedbackText}
                onChange={(e) => setFeedbackText(e.target.value)}
                maxLength={1000}
                rows={3}
                placeholder="Góp ý về từ vựng, mẹo giải thích, hoặc câu hỏi bạn thấy chưa rõ..."
                className="w-full text-sm p-3 rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none resize-none"
              />
              <div className="text-right text-[11px] text-slate-400">
                {feedbackText.length}/1000
              </div>
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl text-sm font-medium text-slate-600 hover:bg-slate-100"
              >
                Bỏ qua
              </button>
              <button
                type="submit"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 text-white text-sm font-semibold hover:bg-indigo-700 active:scale-95 transition-all shadow-sm"
              >
                <Send className="w-4 h-4" />
                <span>Gửi đánh giá</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

