import { NextRequest, NextResponse } from "next/server";
import { extractExamFromDocument } from "@/lib/gemini";
import { ZodError } from "zod";

export const maxDuration = 60; // 60s timeout for AI processing

export async function POST(req: NextRequest) {
  try {
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

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const fileName = file.name;
    const mimeType = file.type || "application/octet-stream";

    // Call Gemini API via @google/genai
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
    console.error("Lỗi AI Import:", err);

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

    return NextResponse.json(
      { success: false, error: err.message || "Lỗi xử lý file qua AI" },
      { status: 500 }
    );
  }
}
