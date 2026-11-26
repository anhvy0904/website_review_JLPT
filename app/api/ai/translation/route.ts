import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { GoogleGenAI } from "@google/genai";
import { checkRateLimit } from "@/lib/auth";
import { resolveApiKey } from "@/lib/gemini";
import { translationLessons } from "@/lib/translation-lessons";
import { gradeRequestSchema, gradingInstructions, parseGrade, plainJapanese } from "@/lib/translation-grading";

export const maxDuration = 30;

export async function POST(req: NextRequest) {
  const limit = checkRateLimit(req, "translation-grade", 20, 60000);
  if (!limit.allowed) return NextResponse.json({ error: "Bạn chấm quá nhanh. Hãy chờ một phút rồi thử lại." }, { status: 429 });
  let input;
  try {
    input = gradeRequestSchema.safeParse(await req.json());
  } catch {
    return NextResponse.json({ error: "Dữ liệu gửi lên không hợp lệ." }, { status: 400 });
  }
  if (!input.success) return NextResponse.json({ error: "Hãy kiểm tra cấu trúc bài học, câu được chọn và bản dịch từ 1 đến 1.500 ký tự." }, { status: 400 });
  const { lessonId, sentenceIndex, direction, answer, customLesson } = input.data;
  if (customLesson && customLesson.id !== lessonId) return NextResponse.json({ error: "ID bài tự thêm không khớp bài cần chấm." }, { status: 400 });
  // Built-in lessons always use canonical server data. Custom lessons are validated above.
  const lesson = translationLessons.find((item) => item.id === lessonId) || customLesson;
  if (!lesson || sentenceIndex >= lesson.sentences.length) return NextResponse.json({ error: "Không tìm thấy câu cần chấm." }, { status: 404 });
  const resolved = resolveApiKey();
  if (!resolved.key) return NextResponse.json({ error: "Chưa cấu hình AI chấm dịch trên máy chủ. Bạn vẫn có thể xem đáp án để tự đối chiếu." }, { status: 503 });
  const japanese = lesson.sentences.map(plainJapanese);
  const payload = JSON.stringify({
    direction, level: lesson.level, targetLanguage: direction === "vi-ja" ? "Tiếng Nhật" : "Tiếng Việt",
    context: direction === "vi-ja" ? lesson.translation : japanese,
    source: direction === "vi-ja" ? lesson.translation[sentenceIndex] : japanese[sentenceIndex],
    reference: direction === "vi-ja" ? japanese[sentenceIndex] : lesson.translation[sentenceIndex],
    studentAnswer: answer,
  });
  try {
    let responseText: string;
    if (resolved.provider === "claude") {
      const client = new Anthropic({ apiKey: resolved.key, timeout: 22000, maxRetries: 0 });
      const response = await client.messages.create({
        model: resolved.model, max_tokens: 1200,
        system: gradingInstructions, messages: [{ role: "user", content: payload }],
      });
      responseText = response.content.filter((block) => block.type === "text").map((block) => block.text).join("");
    } else {
      const client = new GoogleGenAI({ apiKey: resolved.key, httpOptions: { timeout: 22000 } });
      const response = await client.models.generateContent({
        model: resolved.model, contents: payload,
        config: { systemInstruction: gradingInstructions, responseMimeType: "application/json", temperature: 0, maxOutputTokens: 1600 },
      });
      responseText = response.text || "";
    }
    return NextResponse.json({ grade: parseGrade(responseText) });
  } catch {
    // Never return raw provider errors or credentials to the browser.
    return NextResponse.json({ error: "AI chưa chấm được câu này. Hãy thử lại hoặc xem đáp án mẫu để tự đối chiếu." }, { status: 502 });
  }
}
