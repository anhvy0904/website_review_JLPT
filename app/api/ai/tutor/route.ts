import { NextRequest, NextResponse } from "next/server";
import { askAITutorGemini } from "@/lib/gemini";

export const maxDuration = 30; // 30s timeout

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { question, selectedOptionId, passageText, userQuery, history, customApiKey } = body;

    if (!question || !userQuery || !userQuery.trim()) {
      return NextResponse.json(
        { success: false, error: "Thiếu dữ liệu câu hỏi hoặc câu hỏi của học viên" },
        { status: 400 }
      );
    }

    const reply = await askAITutorGemini({
      question,
      selectedOptionId,
      passageText,
      userQuery: userQuery.trim(),
      history: Array.isArray(history) ? history : [],
      customApiKey,
    });

    return NextResponse.json({
      success: true,
      reply,
    });
  } catch (err: any) {
    console.error("Lỗi AI Tutor:", err);
    return NextResponse.json(
      { success: false, error: err.message || "Sensei AI đang bận, bạn thử lại lát sau nhé!" },
      { status: 500 }
    );
  }
}
