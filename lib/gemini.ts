import { GoogleGenAI } from "@google/genai";
import Anthropic from "@anthropic-ai/sdk";
import mammoth from "mammoth";
import { examDetailSchema, ValidatedExamDetail } from "./validation";
import { ExamDetail, ExamQuestion } from "./types";
import { redactSecrets } from "./auth";

export const DEFAULT_CLAUDE_MODEL = process.env.CLAUDE_MODEL || "claude-3-5-sonnet-20241022";
export const DEFAULT_GEMINI_MODEL = process.env.GEMINI_MODEL || "gemini-2.5-flash";
export const DEFAULT_MODEL = process.env.CLAUDE_MODEL || process.env.GEMINI_MODEL || "claude-3-5-sonnet-20241022";

export interface GeminiErrorInfo {
  code:
    | "INVALID_API_KEY"
    | "QUOTA_EXCEEDED"
    | "MODEL_NOT_FOUND"
    | "PERMISSION_DENIED"
    | "NETWORK_ERROR"
    | "MISSING_API_KEY"
    | "UNKNOWN_ERROR";
  message: string;
  status: number;
}

export function parseGeminiError(err: any): GeminiErrorInfo {
  const errMsg = String(err?.message || err || "");
  const status = Number(err?.status || err?.statusCode || 500);

  if (errMsg.includes("Chưa cấu hình") || !errMsg) {
    return {
      code: "MISSING_API_KEY",
      message: "Chưa cấu hình API Key trong file .env.local hoặc giao diện Quản trị viên.",
      status: 400,
    };
  }

  if (
    status === 401 ||
    errMsg.includes("API key not valid") ||
    errMsg.includes("API_KEY_INVALID") ||
    errMsg.includes("invalid api key") ||
    errMsg.includes("API key expired") ||
    errMsg.includes("authentication_error") ||
    errMsg.includes("invalid x-api-key")
  ) {
    return {
      code: "INVALID_API_KEY",
      message: "API Key không hợp lệ hoặc đã hết hạn. Vui lòng kiểm tra lại khóa API trong .env.local.",
      status: 401,
    };
  }

  if (
    status === 429 ||
    errMsg.includes("RESOURCE_EXHAUSTED") ||
    errMsg.includes("quota") ||
    errMsg.includes("Rate limit exceeded") ||
    errMsg.includes("rate_limit_error")
  ) {
    return {
      code: "QUOTA_EXCEEDED",
      message: "Tài khoản đã vượt quá hạn mức sử dụng (Quota / Rate Limit). Vui lòng nâng cấp gói hoặc thử lại sau.",
      status: 429,
    };
  }

  if (
    status === 404 ||
    errMsg.includes("NOT_FOUND") ||
    errMsg.includes("not_found_error") ||
    errMsg.includes("is not found for API version") ||
    errMsg.includes("is not supported")
  ) {
    return {
      code: "MODEL_NOT_FOUND",
      message: "Mô hình AI không tồn tại hoặc tài khoản chưa được cấp quyền truy cập.",
      status: 404,
    };
  }

  if (
    status === 403 ||
    errMsg.includes("PERMISSION_DENIED") ||
    errMsg.includes("Caller does not have permission")
  ) {
    return {
      code: "PERMISSION_DENIED",
      message: "Tài khoản chưa được cấp quyền truy cập mô hình này hoặc vị trí địa lý bị hạn chế.",
      status: 403,
    };
  }

  if (
    errMsg.includes("fetch failed") ||
    errMsg.includes("ENOTFOUND") ||
    errMsg.includes("ETIMEDOUT") ||
    errMsg.includes("ECONNREFUSED")
  ) {
    return {
      code: "NETWORK_ERROR",
      message: "Không thể kết nối tới máy chủ AI. Vui lòng kiểm tra kết nối mạng Internet hoặc thiết lập tường lửa/proxy.",
      status: 503,
    };
  }

  return {
    code: "UNKNOWN_ERROR",
    message: `Lỗi kết nối AI: ${redactSecrets(errMsg)}`,
    status: status >= 400 && status < 600 ? status : 500,
  };
}

export function resolveApiKey(customApiKey?: string): {
  key: string;
  provider: "claude" | "gemini";
  model: string;
} {
  const custom = customApiKey?.trim();
  const claudeEnv = process.env.ANTHROPIC_API_KEY?.trim() || process.env.CLAUDE_API_KEY?.trim();
  const geminiEnv = process.env.GEMINI_API_KEY?.trim();

  // If custom key provided in header or form
  if (custom && custom !== "your_claude_api_key_here" && custom !== "your_gemini_api_key_here") {
    if (custom.startsWith("sk-ant-")) {
      return {
        key: custom,
        provider: "claude",
        model: process.env.CLAUDE_MODEL || DEFAULT_CLAUDE_MODEL,
      };
    }
    if (custom.startsWith("AIzaSy")) {
      return {
        key: custom,
        provider: "gemini",
        model: process.env.GEMINI_MODEL || DEFAULT_GEMINI_MODEL,
      };
    }
    // Default according to available env
    if (claudeEnv && claudeEnv !== "your_claude_api_key_here") {
      return {
        key: custom,
        provider: "claude",
        model: process.env.CLAUDE_MODEL || DEFAULT_CLAUDE_MODEL,
      };
    }
    return {
      key: custom,
      provider: "gemini",
      model: process.env.GEMINI_MODEL || DEFAULT_GEMINI_MODEL,
    };
  }

  // From environment: check Claude first (User requested Claude)
  if (claudeEnv && claudeEnv !== "your_claude_api_key_here") {
    return {
      key: claudeEnv,
      provider: "claude",
      model: process.env.CLAUDE_MODEL || DEFAULT_CLAUDE_MODEL,
    };
  }

  if (geminiEnv && geminiEnv !== "your_gemini_api_key_here") {
    return {
      key: geminiEnv,
      provider: "gemini",
      model: process.env.GEMINI_MODEL || DEFAULT_GEMINI_MODEL,
    };
  }

  return {
    key: "",
    provider: "claude",
    model: DEFAULT_CLAUDE_MODEL,
  };
}

export function getGeminiClient(customApiKey?: string): GoogleGenAI {
  const apiKey = customApiKey || process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey.trim() === "" || apiKey === "your_gemini_api_key_here") {
    throw new Error(
      "Chưa cấu hình GEMINI_API_KEY. Vui lòng thêm khóa API vào file .env.local hoặc nhập trong giao diện Admin."
    );
  }
  return new GoogleGenAI({ apiKey });
}

export function getAnthropicClient(customApiKey?: string): Anthropic {
  const resolved = resolveApiKey(customApiKey);
  if (!resolved.key) {
    throw new Error(
      "Chưa cấu hình ANTHROPIC_API_KEY hoặc CLAUDE_API_KEY trong file .env.local."
    );
  }
  return new Anthropic({ apiKey: resolved.key });
}

export function isGeminiConfigured(customApiKey?: string): boolean {
  const res = resolveApiKey(customApiKey);
  return Boolean(res.key && res.key !== "your_claude_api_key_here" && res.key !== "your_gemini_api_key_here");
}

export interface TestConnectionResult {
  success: boolean;
  provider?: "claude" | "gemini";
  model: string;
  latencyMs: number;
  message: string;
  keySource: "env" | "custom";
  errorInfo?: GeminiErrorInfo;
}

/**
 * Kiểm tra kết nối tới AI (Claude hoặc Gemini API).
 */
export async function testGeminiConnection(options?: {
  customApiKey?: string;
  model?: string;
}): Promise<TestConnectionResult> {
  const customKey = options?.customApiKey?.trim();
  const resolved = resolveApiKey(customKey);
  const keySource: "env" | "custom" = customKey ? "custom" : "env";
  const targetModel = options?.model || resolved.model;

  if (!resolved.key || resolved.key === "your_claude_api_key_here" || resolved.key === "your_gemini_api_key_here") {
    return {
      success: false,
      provider: resolved.provider,
      model: targetModel,
      latencyMs: 0,
      keySource,
      message: "Chưa cấu hình ANTHROPIC_API_KEY / CLAUDE_API_KEY (hoặc GEMINI_API_KEY) trong file .env.local.",
      errorInfo: {
        code: "MISSING_API_KEY",
        message: "Chưa cấu hình API Key trong file .env.local hoặc giao diện Admin.",
        status: 400,
      },
    };
  }

  const startTime = Date.now();
  try {
    if (resolved.provider === "claude") {
      const client = new Anthropic({ apiKey: resolved.key });
      const response = await client.messages.create({
        model: targetModel,
        max_tokens: 20,
        messages: [{ role: "user", content: "Phản hồi chính xác duy nhất từ: PONG" }],
      });
      const latencyMs = Date.now() - startTime;
      const responseText = response.content[0]?.type === "text" ? response.content[0].text.trim() : "OK";
      return {
        success: true,
        provider: "claude",
        model: targetModel,
        latencyMs,
        keySource,
        message: `Kết nối thành công tới Claude (${targetModel})! Độ trễ: ${latencyMs}ms. (Phản hồi: ${responseText})`,
      };
    } else {
      const ai = new GoogleGenAI({ apiKey: resolved.key });
      const response = await ai.models.generateContent({
        model: targetModel,
        contents: "Phản hồi chính xác một từ duy nhất: PONG",
        config: { maxOutputTokens: 10, temperature: 0 },
      });
      const latencyMs = Date.now() - startTime;
      const responseText = response.text?.trim() || "OK";
      return {
        success: true,
        provider: "gemini",
        model: targetModel,
        latencyMs,
        keySource,
        message: `Kết nối thành công tới Gemini (${targetModel})! Độ trễ: ${latencyMs}ms. (Phản hồi: ${responseText})`,
      };
    }
  } catch (err: any) {
    const latencyMs = Date.now() - startTime;
    const errorInfo = parseGeminiError(err);
    return {
      success: false,
      provider: resolved.provider,
      model: targetModel,
      latencyMs,
      keySource,
      message: errorInfo.message,
      errorInfo,
    };
  }
}

function cleanJsonResponse(rawText: string): any {
  let cleaned = rawText.trim();
  if (cleaned.startsWith("```json")) {
    cleaned = cleaned.slice(7);
  } else if (cleaned.startsWith("```")) {
    cleaned = cleaned.slice(3);
  }
  if (cleaned.endsWith("```")) {
    cleaned = cleaned.slice(0, -3);
  }
  cleaned = cleaned.trim();

  const firstBrace = cleaned.indexOf("{");
  const lastBrace = cleaned.lastIndexOf("}");
  if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
    cleaned = cleaned.substring(firstBrace, lastBrace + 1);
  }

  return JSON.parse(cleaned);
}

// ==============================================================================
// MODULE 1: AI EXAM IMPORTER (Claude & Gemini Supported)
// ==============================================================================
export interface ExtractExamOptions {
  fileBuffer: Buffer;
  fileName: string;
  mimeType: string;
  answerKeyText?: string;
  customApiKey?: string;
}

export async function extractExamFromDocument(
  options: ExtractExamOptions
): Promise<{ exam: ValidatedExamDetail; rawTextPreview: string }> {
  const { fileBuffer, fileName, mimeType, answerKeyText, customApiKey } = options;
  const resolved = resolveApiKey(customApiKey);

  let docxText = "";
  let extractedTextPreview = "";

  if (
    mimeType === "application/vnd.openxmlformats-officedocument.wordprocessingml.document" ||
    fileName.toLowerCase().endsWith(".docx")
  ) {
    const docxResult = await mammoth.extractRawText({ buffer: fileBuffer });
    docxText = docxResult.value;
    extractedTextPreview = docxText;
  } else {
    extractedTextPreview = `[Tài liệu ${fileName} (${mimeType}, dung lượng: ${Math.round(fileBuffer.length / 1024)} KB)]`;
  }

  const systemPrompt = `Bạn là chuyên gia sư phạm tiếng Nhật JLPT N3 và kỹ sư chuẩn hóa dữ liệu giáo dục.
Nhiệm vụ: Phân tích tài liệu đề thi được cung cấp (PDF, DOCX, ảnh) và trích xuất thành định dạng JSON chuẩn Schema 1.0.0.

NGUYÊN TẮC BẮT BUỘC KHÔNG ĐƯỢC VI PHẠM:
1. KHÔNG tự thêm câu hỏi mới, KHÔNG sửa đổi bản gốc tiếng Nhật, KHÔNG đảo thứ tự câu hoặc lựa chọn.
2. Giữ nguyên 100% ký tự Kanji, Kana, dấu câu, gạch chân ＿＿.
3. CHỈ xử lý trắc nghiệm vocabulary / grammar / reading. KHÔNG xử lý listening.
4. Với bài đọc hiểu: tạo mục trong "passages" (id: "p001", "p002"...) và gắn "passageId" tương ứng cho câu hỏi. KHÔNG lặp lại bài đọc trong từng câu hỏi.
5. ĐÁP ÁN GỐC & NGUYÊN TẮC TRUNG THỰC:
   - Nếu trong tài liệu hoặc trong phần ĐÁP ÁN GỐC có ghi rõ đáp án: đối chiếu và điền "correctOptionId" (vd: "A", "B", "C", "D" hoặc "1", "2", "3", "4") và "review": { "status": "verified" }.
   - TUYỆT ĐỐI KHÔNG TỰ SUY ĐOÁN ĐÁP ÁN KHI KHÔNG CÓ ĐÁP ÁN GỐC. Nếu nguồn không có đáp án, hãy đặt "correctOptionId": null và "review": { "status": "needs_review", "notes": "Cần đối chiếu đáp án gốc" }.
6. LỜI GIẢI BAN ĐẦU:
   - Với mỗi câu, tạo cấu trúc "explanation": { "summaryVi": "...", "correctReasonVi": "...", "optionReasonsVi": { ... }, "translationVi": "..." }.
7. Ghi nhận "sourcePage" cho từng câu nếu phát hiện được.
8. Đặt "status": "draft" cho đến khi quản trị viên duyệt.
9. CHỈ XUẤT RA DUY NHẤT ĐỊNH DẠNG JSON HỢP LỆ, không kèm văn bản mở đầu hay kết thúc markdown.`;

  let responseText = "";

  if (resolved.provider === "claude") {
    const client = new Anthropic({ apiKey: resolved.key });
    const contentBlocks: any[] = [];

    if (docxText) {
      contentBlocks.push({
        type: "text",
        text: `Văn bản đề thi từ file DOCX:\n\n${docxText}`,
      });
    } else if (mimeType.startsWith("image/")) {
      const base64 = fileBuffer.toString("base64");
      contentBlocks.push({
        type: "image",
        source: {
          type: "base64",
          media_type: mimeType as any,
          data: base64,
        },
      });
    } else if (mimeType === "application/pdf") {
      const base64 = fileBuffer.toString("base64");
      contentBlocks.push({
        type: "document",
        source: {
          type: "base64",
          media_type: "application/pdf",
          data: base64,
        },
      });
    }

    if (answerKeyText && answerKeyText.trim()) {
      contentBlocks.push({
        type: "text",
        text: `ĐÁP ÁN GỐC TỪ QUẢN TRỊ VIÊN:\n${answerKeyText.trim()}`,
      });
    }

    contentBlocks.push({
      type: "text",
      text: "Hãy trích xuất và trả về duy nhất chuỗi JSON hợp lệ theo Schema 1.0.0.",
    });

    const msg = await client.messages.create({
      model: resolved.model,
      max_tokens: 4096,
      system: systemPrompt,
      messages: [{ role: "user", content: contentBlocks }],
    });

    responseText = msg.content[0]?.type === "text" ? msg.content[0].text : "";
  } else {
    // Gemini
    const ai = new GoogleGenAI({ apiKey: resolved.key });
    const contents: any[] = [];

    if (docxText) {
      contents.push({ text: `Văn bản đề thi:\n\n${docxText}` });
    } else {
      const base64 = fileBuffer.toString("base64");
      contents.push({ inlineData: { mimeType, data: base64 } });
    }

    if (answerKeyText && answerKeyText.trim()) {
      contents.push({ text: `ĐÁP ÁN GỐC:\n${answerKeyText.trim()}` });
    }

    contents.push({ text: systemPrompt });

    const resp = await ai.models.generateContent({
      model: resolved.model,
      contents,
      config: { responseMimeType: "application/json", temperature: 0.1 },
    });
    responseText = resp.text || "";
  }

  const parsed = cleanJsonResponse(responseText);
  const validated = examDetailSchema.parse(parsed);

  return {
    exam: validated,
    rawTextPreview: extractedTextPreview,
  };
}

// ==============================================================================
// MODULE 2: AI EXPLANATION GENERATOR (Claude & Gemini Supported)
// ==============================================================================
export async function generateExplanationsWithGemini(
  examData: ExamDetail,
  customApiKey?: string
): Promise<ValidatedExamDetail> {
  const resolved = resolveApiKey(customApiKey);

  const prompt = `Bạn là chuyên gia sư phạm tiếng Nhật N3 xuất sắc.
Dưới đây là một đề thi JLPT N3 đã được xác nhận đáp án chính thức.
Nhiệm vụ của bạn: Tạo lời giải sư phạm chi tiết 100% bằng tiếng Việt cho TẤT CẢ các câu hỏi trong đề.

YÊU CẦU ĐẶC BIỆT CHO LỜI GIẢI (explanation):
1. summaryVi: Tóm tắt 1 câu ngắn gọn vì sao đáp án đúng là phương án chuẩn nhất.
2. correctReasonVi: Phân tích cặn kẽ tại sao đáp án này đúng, dựa trên cấu trúc ngữ pháp, ngữ cảnh hoặc quy tắc Kanji N3.
3. optionReasonsVi: Giải thích chi tiết LÝ DO SAI cho từng phương án còn lại (chỉ ra bẫy đề thi).
4. translationVi: Dịch toàn bộ câu hỏi và ngữ cảnh sang tiếng Việt tự nhiên, chuẩn nghĩa.
5. vocabulary: Liệt kê từ vựng quan trọng (word, hiragana, meaningVi).
6. grammarPoints: Điểm ngữ pháp liên quan nếu có (pattern, meaningVi, usageVi).
7. studyTipVi: Mẹo nhận diện bẫy nhanh cho học viên.
8. KHÔNG THAY ĐỔI correctOptionId.
9. Trả về toàn bộ file JSON cập nhật, định dạng JSON hợp lệ duy nhất.

DỮ LIỆU ĐỀ THI:
${JSON.stringify(examData, null, 2)}`;

  let responseText = "";

  if (resolved.provider === "claude") {
    const client = new Anthropic({ apiKey: resolved.key });
    const msg = await client.messages.create({
      model: resolved.model,
      max_tokens: 4096,
      messages: [{ role: "user", content: prompt }],
    });
    responseText = msg.content[0]?.type === "text" ? msg.content[0].text : "";
  } else {
    const ai = new GoogleGenAI({ apiKey: resolved.key });
    const response = await ai.models.generateContent({
      model: resolved.model,
      contents: prompt,
      config: { responseMimeType: "application/json", temperature: 0.2 },
    });
    responseText = response.text || "";
  }

  const parsed = cleanJsonResponse(responseText);
  return examDetailSchema.parse(parsed);
}

// ==============================================================================
// MODULE 4: AI TUTOR (Claude & Gemini Supported)
// ==============================================================================
export interface AITutorRequest {
  question: ExamQuestion;
  selectedOptionId?: string;
  passageText?: string;
  userQuery: string;
  history?: Array<{ role: "user" | "model"; text: string }>;
  customApiKey?: string;
}

export async function askAITutorGemini(params: AITutorRequest): Promise<string> {
  const { question, selectedOptionId, passageText, userQuery, history = [], customApiKey } = params;
  const resolved = resolveApiKey(customApiKey);

  const correctOpt = question.options.find((o) => o.id === question.correctOptionId);
  const selectedOpt = question.options.find((o) => o.id === selectedOptionId);

  const contextPrompt = `Bạn là "Sensei Ếch AI" (Bé Ếch Sen VuyAnh 🐸🌸) - Gia sư tiếng Nhật thân thương chuyên biệt cho trình độ JLPT N3 của nền tảng "Luyện đề tiếng Nhật cùng VuyAnh 🌸".
Học viên đang làm bài và có thắc mắc về câu hỏi sau:

NGỮ CẢNH CÂU HỎI:
- Kỹ năng: ${question.section} (Dạng bài: ${question.subtype})
${passageText ? `- Bài đọc tham chiếu:\n"""\n${passageText}\n"""` : ""}
- Câu hỏi tiếng Nhật: ${question.questionText}
- Các lựa chọn:
${question.options.map((o) => `  [${o.id}] ${o.text}`).join("\n")}
- Đáp án chính thức: [${correctOpt?.id || "?"}] ${correctOpt?.text || "Chưa có"}
${selectedOpt ? `- Học viên đã chọn: [${selectedOpt.id}] ${selectedOpt.text}` : "- Học viên chưa chọn đáp án"}
- Lời giải chính thức hiện tại:
  + Tóm tắt: ${question.explanation.summaryVi}
  + Lý do đúng: ${question.explanation.correctReasonVi}
  + Bản dịch: ${question.explanation.translationVi}

NGUYÊN TẮC TRẢ LỜI CỦA SENSEI:
1. Trả lời bằng tiếng Việt thân thiện, rõ ràng, dễ hiểu, phù hợp với trình độ N3 (không dùng thuật ngữ quá hàn lâm).
2. Khi dùng từ vựng/mẫu câu tiếng Nhật để minh họa, hãy kèm theo cách đọc Hiragana và nghĩa tiếng Việt (ví dụ: 提出 (ていしゅつ: nộp)).
3. TUYỆT ĐỐI KHÔNG THAY ĐỔI ĐÁP ÁN CHÍNH THỨC của câu hỏi.
4. Giải thích sâu vào thắc mắc cụ thể của học viên (tại sao phương án họ chọn lại sai, cách phân biệt từ dễ nhầm lẫn, ví dụ thực tế).
5. Trả lời súc tích, trực diện vào câu hỏi.`;

  if (resolved.provider === "claude") {
    const client = new Anthropic({ apiKey: resolved.key });
    const messages: any[] = [];

    // Add prior history
    for (const h of history) {
      messages.push({
        role: h.role === "model" ? "assistant" : "user",
        content: h.text,
      });
    }

    // Add user question
    messages.push({
      role: "user",
      content: userQuery,
    });

    const response = await client.messages.create({
      model: resolved.model,
      max_tokens: 1024,
      system: contextPrompt,
      messages,
    });

    return response.content[0]?.type === "text" ? response.content[0].text.trim() : "Sensei đã ghi nhận câu hỏi.";
  } else {
    const ai = new GoogleGenAI({ apiKey: resolved.key });
    const contents: any[] = [];
    contents.push({ text: contextPrompt });

    for (const msg of history) {
      contents.push({
        role: msg.role === "user" ? "user" : "model",
        text: msg.text,
      });
    }

    contents.push({
      role: "user",
      text: `Câu hỏi của học viên: "${userQuery}". Hãy trả lời học viên bằng tiếng Việt thân thiện và chính xác theo kiến thức JLPT N3.`,
    });

    const response = await ai.models.generateContent({
      model: resolved.model,
      contents,
      config: { maxOutputTokens: 1024, temperature: 0.3 },
    });

    return response.text?.trim() || "Sensei đã ghi nhận câu hỏi.";
  }
}
