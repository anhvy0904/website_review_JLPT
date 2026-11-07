"use client";

import React, { useState } from "react";
import { ExamQuestion } from "@/lib/types";
import {
  Sparkles,
  Send,
  Loader2,
  X,
  MessageSquare,
  Bot,
  User,
  ShieldAlert,
} from "lucide-react";

interface AITutorChatProps {
  question: ExamQuestion;
  selectedOptionId?: string;
  passageText?: string;
}

interface ChatMessage {
  role: "user" | "model";
  text: string;
}

const MAX_QUESTIONS_PER_SESSION = 5;

export function AITutorChat({
  question,
  selectedOptionId,
  passageText,
}: AITutorChatProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputQuery, setInputQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [quotaRemaining, setQuotaRemaining] = useState<number>(MAX_QUESTIONS_PER_SESSION);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const quickPrompts = [
    "Tại sao phương án tôi chọn lại sai?",
    "Giải thích sâu hơn về mẫu ngữ pháp trong câu",
    "Cho tôi thêm 2 câu ví dụ dễ nhớ với từ này",
    "Mẹo nhận diện bẫy dạng câu hỏi này trong đề N3",
  ];

  const handleSendMessage = async (queryToSend?: string) => {
    const text = queryToSend || inputQuery;
    if (!text.trim() || loading) return;

    if (quotaRemaining <= 0) {
      setErrorMessage("Bạn đã dùng hết 5 lượt hỏi Sensei cho bài này để tối ưu chi phí.");
      return;
    }

    const newMessages: ChatMessage[] = [...messages, { role: "user", text: text.trim() }];
    setMessages(newMessages);
    setInputQuery("");
    setLoading(true);
    setErrorMessage(null);

    try {
      const res = await fetch("/api/ai/tutor", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          question,
          selectedOptionId,
          passageText,
          userQuery: text.trim(),
          history: messages,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Sensei AI đang bận");
      }

      setMessages([...newMessages, { role: "model", text: data.reply }]);
      setQuotaRemaining((prev) => Math.max(0, prev - 1));
    } catch (err: any) {
      setErrorMessage(err.message || "Lỗi kết nối tới Sensei AI");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="pt-2">
      {/* Trigger Button */}
      {!isOpen ? (
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-[#1B5E20] hover:bg-[#2E7D32] border border-[#66BB6A]/40 active:scale-95 text-white text-xs font-bold shadow-sm transition-all"
        >
          <Sparkles className="w-4 h-4 text-[#A5D6A7]" />
          <span>Hỏi Sensei Ếch AI về câu này</span>
          <span className="text-[10px] bg-white/20 px-1.5 py-0.5 rounded-full font-mono">
            {quotaRemaining} lượt
          </span>
        </button>
      ) : (
        <div className="rounded-3xl border-2 border-[#A5D6A7] bg-white p-5 shadow-lg space-y-4 animate-fade-in">
          {/* Header */}
          <div className="flex items-center justify-between pb-3 border-b border-[#A5D6A7]/40">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl overflow-hidden border border-[#A5D6A7] bg-[#E8F5E9] shadow-sm">
                <img
                  src="/images/mascot-frog.jpg"
                  alt="Sensei Ếch VuyAnh"
                  className="w-full h-full object-cover"
                />
              </div>
              <div>
                <h4 className="font-bold text-[#1B5E20] text-sm flex items-center gap-1.5">
                  <span>Sensei Ếch AI Gia Sư JLPT N3</span>
                  <span className="text-[10px] text-[#1B5E20] font-semibold bg-[#E8F5E9] px-2 py-0.5 rounded-full border border-[#A5D6A7]">
                    VuyAnh AI 🌸
                  </span>
                </h4>
                <p className="text-[11px] text-slate-500">
                  Giải thích cặn kẽ ngữ pháp, từ vựng và chỉ rõ bẫy sai cho ngừi iu
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-[11px] font-mono text-slate-500">
                Còn <strong className="text-[#2E7D32]">{quotaRemaining}</strong>/{MAX_QUESTIONS_PER_SESSION} lượt
              </span>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-[#E8F5E9]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Quick Prompts */}
          {messages.length === 0 && (
            <div className="space-y-1.5">
              <span className="text-[11px] font-semibold text-slate-500">Gợi ý câu hỏi nhanh:</span>
              <div className="flex flex-wrap gap-1.5">
                {quickPrompts.map((prompt, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => handleSendMessage(prompt)}
                    className="text-[11px] px-2.5 py-1.5 rounded-xl bg-purple-50 hover:bg-purple-100 text-purple-800 border border-purple-200/60 text-left transition-colors"
                  >
                    💡 {prompt}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Messages Container */}
          {messages.length > 0 && (
            <div className="max-h-72 overflow-y-auto space-y-3 p-1 pr-2">
              {messages.map((m, idx) => (
                <div
                  key={idx}
                  className={`flex items-start gap-2.5 ${
                    m.role === "user" ? "flex-row-reverse" : ""
                  }`}
                >
                  <div
                    className={`w-7 h-7 rounded-lg overflow-hidden flex items-center justify-center shrink-0 text-xs font-bold ${
                      m.role === "user"
                        ? "bg-[#1B5E20] text-white"
                        : "border border-[#A5D6A7] bg-[#E8F5E9]"
                    }`}
                  >
                    {m.role === "user" ? (
                      <User className="w-3.5 h-3.5" />
                    ) : (
                      <img
                        src="/images/mascot-frog.jpg"
                        alt="Sensei Ếch"
                        className="w-full h-full object-cover"
                      />
                    )}
                  </div>

                  <div
                    className={`p-3 rounded-2xl text-xs max-w-[85%] leading-relaxed ${
                      m.role === "user"
                        ? "bg-slate-900 text-white rounded-tr-xs"
                        : "bg-purple-50/70 border border-purple-100 text-slate-800 rounded-tl-xs whitespace-pre-wrap font-japanese"
                    }`}
                  >
                    {m.text}
                  </div>
                </div>
              ))}

              {loading && (
                <div className="flex items-center gap-2 text-xs text-purple-600 p-2">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Sensei đang phân tích câu hỏi...</span>
                </div>
              )}
            </div>
          )}

          {/* Error Message */}
          {errorMessage && (
            <div className="p-2.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-rose-500 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Input Form */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="flex items-center gap-2 pt-1"
          >
            <input
              type="text"
              value={inputQuery}
              onChange={(e) => setInputQuery(e.target.value)}
              placeholder="Đặt câu hỏi thắc mắc cho Sensei..."
              disabled={loading || quotaRemaining <= 0}
              className="flex-1 p-2.5 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 disabled:bg-slate-100"
            />
            <button
              type="submit"
              disabled={!inputQuery.trim() || loading || quotaRemaining <= 0}
              className="p-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 disabled:opacity-40 text-white transition-colors"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      )}
    </div>
  );
}

