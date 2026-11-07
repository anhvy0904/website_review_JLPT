import { NextRequest, NextResponse } from "next/server";
import { generateExplanationsWithGemini } from "@/lib/gemini";
import { ZodError } from "zod";

export const maxDuration = 60; // 60s timeout for AI processing

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { exam, customApiKey } = body;

    if (!exam || !Array.isArray(exam.questions)) {
      return NextResponse.json(
        { success: false, error: "Dữ liệu đề thi không hợp lệ" },
        { status: 400 }
      );
    }

    const enhancedExam = await generateExplanationsWithGemini(exam, customApiKey);

    return NextResponse.json({
      success: true,
      exam: enhancedExam,
    });
  } catch (err: any) {
    console.error("Lỗi AI Generator:", err);

    if (err instanceof ZodError) {
      return NextResponse.json(
        {
          success: false,
          error: "Dữ liệu lời giải sinh ra có lỗi Schema",
          validationIssues: err.issues,
        },
        { status: 422 }
      );
    }

    return NextResponse.json(
      { success: false, error: err.message || "Lỗi tạo lời giải qua AI" },
      { status: 500 }
    );
  }
}
