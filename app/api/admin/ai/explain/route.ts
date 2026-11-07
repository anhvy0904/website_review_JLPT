import { NextRequest, NextResponse } from "next/server";
import { generateExplanationsWithGemini, parseGeminiError } from "@/lib/gemini";
import { verifyAdminRequest, checkRateLimit, redactSecrets } from "@/lib/auth";
import { ZodError } from "zod";

export const maxDuration = 60; // 60s timeout for AI processing

export async function POST(req: NextRequest) {
  try {
    // 1. Xác thực quyền Quản trị viên
    const authResult = verifyAdminRequest(req);
    if (!authResult.authorized) {
      return NextResponse.json(
        { success: false, error: authResult.error || "Không có quyền Quản trị viên" },
        { status: 401 }
      );
    }

    // 2. Giới hạn tốc độ gọi tạo lời giải (15 lần/phút)
    const rateCheck = checkRateLimit(req, "ai-explain", 15, 60000);
    if (!rateCheck.allowed) {
      return NextResponse.json(
        {
          success: false,
          error: `Yêu cầu tạo lời giải quá nhanh. Vui lòng thử lại sau ${rateCheck.resetInSeconds} giây để tránh vượt quota.`,
        },
        { status: 429 }
      );
    }

    const body = await req.json();
    const { exam, customApiKey } = body;

    if (!exam || !Array.isArray(exam.questions)) {
      return NextResponse.json(
        { success: false, error: "Dữ liệu đề thi không hợp lệ hoặc thiếu danh sách câu hỏi." },
        { status: 400 }
      );
    }

    const enhancedExam = await generateExplanationsWithGemini(exam, customApiKey);

    return NextResponse.json({
      success: true,
      exam: enhancedExam,
    });
  } catch (err: any) {
    const rawError = String(err?.message || err);
    console.error("Lỗi AI Generator:", redactSecrets(rawError));

    if (err instanceof ZodError) {
      return NextResponse.json(
        {
          success: false,
          error: "Dữ liệu lời giải do AI sinh ra có điểm chưa khớp với Schema 1.0.0",
          validationIssues: err.issues,
        },
        { status: 422 }
      );
    }

    const geminiError = parseGeminiError(err);
    return NextResponse.json(
      { success: false, error: geminiError.message, code: geminiError.code },
      { status: geminiError.status }
    );
  }
}
