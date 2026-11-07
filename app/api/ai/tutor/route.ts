import { NextRequest, NextResponse } from "next/server";
import { askAITutorGemini, parseGeminiError } from "@/lib/gemini";
import { checkRateLimit, redactSecrets } from "@/lib/auth";

export const maxDuration = 30; // 30s timeout

export async function POST(req: NextRequest) {
  try {
    // 1. Giới hạn tốc độ học viên hỏi Sensei (30 câu hỏi / phút trên 1 IP)
    const rateCheck = checkRateLimit(req, "ai-tutor", 30, 60000);
    if (!rateCheck.allowed) {
      return NextResponse.json(
        {
          success: false,
          error: `Bạn đang gửi câu hỏi quá nhanh. Vui lòng dừng lại suy nghĩ ${rateCheck.resetInSeconds} giây trước khi gửi tiếp nhé!`,
        },
        { status: 429 }
      );
    }

    const body = await req.json();
    const { question, selectedOptionId, passageText, userQuery, history, customApiKey } = body;

    if (!question || !userQuery || !userQuery.trim()) {
      return NextResponse.json(
        { success: false, error: "Thiếu dữ liệu câu hỏi hoặc câu hỏi của học viên" },
        { status: 400 }
      );
    }

    // Giới hạn độ dài câu hỏi của học viên tối đa 500 ký tự để tránh injection & tốn token
    const safeUserQuery = userQuery.trim().slice(0, 500);

    const reply = await askAITutorGemini({
      question,
      selectedOptionId,
      passageText,
      userQuery: safeUserQuery,
      history: Array.isArray(history) ? history.slice(-6) : [], // Chỉ giữ tối đa 3 vòng đối thoại gần nhất
      customApiKey,
    });

    return NextResponse.json({
      success: true,
      reply,
    });
  } catch (err: any) {
    const rawError = String(err?.message || err);
    console.error("Lỗi AI Tutor:", redactSecrets(rawError));

    const geminiError = parseGeminiError(err);
    return NextResponse.json(
      { success: false, error: geminiError.message, code: geminiError.code },
      { status: geminiError.status }
    );
  }
}
