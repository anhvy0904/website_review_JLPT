import { NextRequest, NextResponse } from "next/server";
import { extractExamFromDocument, parseGeminiError } from "@/lib/gemini";
import { verifyAdminRequest, checkRateLimit, redactSecrets } from "@/lib/auth";
import { ZodError } from "zod";

export const maxDuration = 60; // 60s timeout for AI processing

const MAX_FILE_SIZE = 25 * 1024 * 1024; // 25MB

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

    // 2. Giới hạn tốc độ tải file & gọi AI (10 lần/phút)
    const rateCheck = checkRateLimit(req, "ai-import", 10, 60000);
    if (!rateCheck.allowed) {
      return NextResponse.json(
        {
          success: false,
          error: `Tần suất gửi file quá cao. Vui lòng thử lại sau ${rateCheck.resetInSeconds} giây để bảo vệ ngân sách API.`,
        },
        { status: 429 }
      );
    }

    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    const answerKeyText = (formData.get("answerKeyText") as string) || "";
    const customApiKey = (formData.get("customApiKey") as string) || "";

    if (!file) {
      return NextResponse.json(
        { success: false, error: "Vui lòng đính kèm file đề thi (PDF, DOCX, JPG, PNG)" },
        { status: 400 }
      );
    }

    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        {
          success: false,
          error: `Dung lượng file vượt quá giới hạn cho phép (Tối đa 25MB). Dung lượng hiện tại: ${(file.size / (1024 * 1024)).toFixed(1)}MB.`,
        },
        { status: 413 }
      );
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const fileName = file.name;
    const mimeType = file.type || "application/octet-stream";

    // 3. Gọi Gemini API qua SDK chính thức @google/genai
    const result = await extractExamFromDocument({
      fileBuffer: buffer,
      fileName,
      mimeType,
      answerKeyText,
      customApiKey,
    });

    return NextResponse.json({
      success: true,
      exam: result.exam,
      rawTextPreview: result.rawTextPreview,
    });
  } catch (err: any) {
    const rawError = String(err?.message || err);
    console.error("Lỗi AI Import:", redactSecrets(rawError));

    if (err instanceof ZodError) {
      return NextResponse.json(
        {
          success: false,
          error: "Dữ liệu AI trích xuất chưa khớp hoàn toàn với Schema 1.0.0",
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
