import { GoogleGenAI } from "@google/genai";
import mammoth from "mammoth";
import { examDetailSchema, ValidatedExamDetail } from "./validation";
import { ExamDetail, ExamQuestion } from "./types";
import { redactSecrets } from "./auth";

export const DEFAULT_MODEL = process.env.GEMINI_MODEL || "gemini-2.5-flash";

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

  if (errMsg.includes("Chưa cấu hình GEMINI_API_KEY") || !errMsg) {
    return {
      code: "MISSING_API_KEY",
      message: "Chưa cấu hình GEMINI_API_KEY trong file .env.local hoặc giao diện Quản trị viên.",
      status: 400,
    };
  }

  if (
    status === 401 ||
    errMsg.includes("API key not valid") ||
    errMsg.includes("API_KEY_INVALID") ||
    errMsg.includes("invalid api key") ||
    errMsg.includes("API key expired")
  ) {
    return {
      code: "INVALID_API_KEY",
      message: "Google Gemini API Key không hợp lệ hoặc đã hết hạn. Vui lòng kiểm tra lại khóa API tại Google AI Studio.",
      status: 401,
    };
  }

  if (
    status === 429 ||
    errMsg.includes("RESOURCE_EXHAUSTED") ||
    errMsg.includes("quota") ||
    errMsg.includes("Rate limit exceeded")
  ) {
    return {
      code: "QUOTA_EXCEEDED",
      message: "Tài khoản đã vượt quá hạn mức sử dụng (Quota / Rate Limit) của Google Gemini API. Vui lòng nâng cấp gói hoặc thử lại sau vài phút.",
      status: 429,
    };
  }

  if (
    status === 404 ||
    errMsg.includes("NOT_FOUND") ||
    errMsg.includes("is not found for API version") ||
    errMsg.includes("is not supported")
  ) {
    return {
      code: "MODEL_NOT_FOUND",
      message: `Mô hình Gemini không tồn tại hoặc không được hỗ trợ trong phiên bản API này. Vui lòng kiểm tra biến GEMINI_MODEL (khuyến nghị: gemini-2.5-flash hoặc gemini-2.0-flash).`,
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
      message: "Tài khoản Google AI Studio chưa được cấp quyền truy cập mô hình này hoặc vị trí địa lý bị hạn chế.",
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
      message: "Không thể kết nối tới máy chủ Google Gemini. Vui lòng kiểm tra kết nối mạng Internet hoặc thiết lập tường lửa/proxy.",
      status: 503,
    };
  }

  return {
    code: "UNKNOWN_ERROR",
    message: `Lỗi kết nối Gemini: ${redactSecrets(errMsg)}`,
    status: status >= 400 && status < 600 ? status : 500,
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

export function isGeminiConfigured(customApiKey?: string): boolean {
  const key = customApiKey || process.env.GEMINI_API_KEY;
  return Boolean(key && key.trim() !== "" && key !== "your_gemini_api_key_here");
}

export interface TestConnectionResult {
  success: boolean;
  model: string;
  latencyMs: number;
  message: string;
  keySource: "env" | "custom";
  errorInfo?: GeminiErrorInfo;
}

/**
 * Kiểm tra kết nối tới Google Gemini API (Admin only).
 * Thực hiện gọi nhẹ nhàng để đo độ trễ và kiểm tra quyền hạn của model.
 */
export async function testGeminiConnection(options?: {
  customApiKey?: string;
  model?: string;
}): Promise<TestConnectionResult> {
  const customKey = options?.customApiKey?.trim();
  const envKey = process.env.GEMINI_API_KEY?.trim();
  const apiKey = customKey || envKey;
  const keySource: "env" | "custom" = customKey ? "custom" : "env";
  const targetModel = options?.model || process.env.GEMINI_MODEL || "gemini-2.5-flash";

  if (!apiKey || apiKey === "your_gemini_api_key_here") {
    return {
      success: false,
      model: targetModel,
      latencyMs: 0,
      keySource,
      message: "Chưa cấu hình GEMINI_API_KEY trong file .env.local hoặc giao diện Admin.",
      errorInfo: {
        code: "MISSING_API_KEY",
        message: "Chưa cấu hình GEMINI_API_KEY trong file .env.local hoặc giao diện Admin.",
        status: 400,
      },
    };
  }

  const startTime = Date.now();
  try {
    const ai = new GoogleGenAI({ apiKey });
    const response = await ai.models.generateContent({
      model: targetModel,
      contents: "Phản hồi chính xác một từ duy nhất: PONG",
      config: {
        maxOutputTokens: 10,
        temperature: 0,
      },
    });

    const latencyMs = Date.now() - startTime;
    const responseText = response.text?.trim() || "";

    return {
      success: true,
      model: targetModel,
      latencyMs,
      keySource,
      message: `Kết nối thành công tới mô hình ${targetModel}! Độ trễ: ${latencyMs}ms. (Phản hồi: ${responseText || "OK"})`,
    };
  } catch (err: any) {
    const latencyMs = Date.now() - startTime;
    const errorInfo = parseGeminiError(err);
    return {
      success: false,
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
  // Strip markdown code fences if present
  if (cleaned.startsWith("```json")) {
    cleaned = cleaned.slice(7);
  } else if (cleaned.startsWith("```")) {
    cleaned = cleaned.slice(3);
  }
  if (cleaned.endsWith("```")) {
    cleaned = cleaned.slice(0, -3);
  }
  cleaned = cleaned.trim();

  // Find first { and last }
  const firstBrace = cleaned.indexOf("{");
  const lastBrace = cleaned.lastIndexOf("}");
  if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
    cleaned = cleaned.substring(firstBrace, lastBrace + 1);
  }

  return JSON.parse(cleaned);
}

// ==============================================================================
// MODULE 1: AI EXAM IMPORTER
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
  const ai = getGeminiClient(customApiKey);

  let contents: any[] = [];
  let extractedTextPreview = "";

  // 1. Process DOCX files with mammoth
  if (
    mimeType === "application/vnd.openxmlformats-officedocument.wordprocessingml.document" ||
    fileName.toLowerCase().endsWith(".docx")
  ) {
    const docxResult = await mammoth.extractRawText({ buffer: fileBuffer });
    extractedTextPreview = docxResult.value;

    contents = [
      {
        text: `Dưới đây là văn bản trích xuất từ tài liệu DOCX đề thi JLPT N3:\n\n${extractedTextPreview}`,
      },
    ];
  } else {
    // 2. Process PDF, JPG, PNG as base64 inline media
    const base64Data = fileBuffer.toString("base64");
    extractedTextPreview = `[Tài liệu nhị phân ${fileName} (${mimeType}, dung lượng: ${Math.round(fileBuffer.length / 1024)} KB)]`;

    contents = [
      {
        inlineData: {
          mimeType,
          data: base64Data,
        },
      },
    ];
  }

  // Add answer key if provided
  if (answerKeyText && answerKeyText.trim()) {
    contents.push({
      text: `Dưới đây là ĐÁP ÁN GỐC do người quản trị cung cấp:\n${answerKeyText.trim()}`,
    });
  }

  const systemPrompt = `Bạn là chuyên gia sư phạm tiếng Nhật JLPT N3 và kỹ sư chuẩn hóa dữ liệu giáo dục.
Nhiệm vụ: Phân tích tài liệu đề thi được cung cấp (PDF, DOCX, ảnh) và trích xuất thành định dạng JSON chuẩn Schema 1.0.0.

NGUYÊN TẮC BẮT BUỘC KHÔNG ĐƯỢC VI PHẠM:
1. KHÔNG tự thêm câu hỏi mới, KHÔNG sửa đổi bản gốc tiếng Nhật, KHÔNG đảo thứ tự câu hoặc lựa chọn.
2. Giữ nguyên 100% ký tự Kanji, Kana, dấu câu, gạch chân ＿＿.
3. CHỈ xử lý trắc nghiệm vocabulary / grammar / reading. KHÔNG xử lý listening.
4. Với bài đọc hiểu: tạo mục trong "passages" (id: "p001", "p002"...) và gắn "passageId" tương ứng cho câu hỏi. KHÔNG lặp lại bài đọc trong từng câu hỏi.
5. ĐÁP ÁN GỐC & NGUYÊN TẮC TRUNG THỰC:
   - Nếu trong tài liệu hoặc trong phần ĐÁP ÁN GỐC có ghi rõ đáp án: đối chiếu và điền "correctOptionId" (vd: "1", "2", "3", "4") và "review": { "status": "verified" }.
   - TUYỆT ĐỐI KHÔNG TỰ SUY ĐOÁN ĐÁP ÁN KHI KHÔNG CÓ ĐÁP ÁN GỐC. Nếu nguồn không có đáp án, hãy đặt "correctOptionId": null và "review": { "status": "needs_review", "notes": "Cần đối chiếu đáp án gốc" }.
6. LỜI GIẢI BAN ĐẦU:
   - Với mỗi câu, tạo cấu trúc "explanation": { "summaryVi": "...", "correctReasonVi": "...", "optionReasonsVi": { "1": "...", "2": "...", "3": "...", "4": "..." }, "translationVi": "..." }.
7. Ghi nhận "sourcePage" (số trang trong tài liệu gốc) cho từng câu nếu phát hiện được.
8. Đặt "status": "draft" cho đến khi quản trị viên duyệt.
9. Đảm bảo "questionCount" khớp chính xác số phần tử trong "questions".
10. CHỈ XUẤT RA DUY NHẤT ĐỊNH DẠNG JSON HỢP LỆ, không kèm văn bản mở đầu hay kết thúc.

CẤU TRÚC JSON MẪU:
{
  "schemaVersion": "1.0.0",
  "id": "n3-${Date.now().toString().slice(-6)}",
  "title": "Tiêu đề đề thi được trích xuất từ tài liệu",
  "description": "Mô tả về đề thi JLPT N3",
  "level": "N3",
  "status": "draft",
  "source": {
    "fileName": "${fileName}",
    "type": "official_mock",
    "notes": "Trích xuất tự động qua Google Gemini AI",
    "reviewedByHuman": false
  },
  "settings": {
    "timeLimitMinutes": 30,
    "allowedModes": ["practice", "exam"]
  },
  "passages": [],
  "questions": [
    {
      "id": "n3-q001",
      "number": 1,
      "section": "vocabulary",
      "subtype": "kanji_reading",
      "questionText": "この書類を__提出__してください。",
      "options": [
        { "id": "1", "text": "ていしゅつ" },
        { "id": "2", "text": "たいしゅつ" },
        { "id": "3", "text": "ていしゅっ" },
        { "id": "4", "text": "だいしゅつ" }
      ],
      "correctOptionId": "1",
      "difficulty": 2,
      "tags": ["Từ vựng N3"],
      "sourcePage": 1,
      "explanation": {
        "summaryVi": "Tóm tắt...",
        "correctReasonVi": "Lý do đúng...",
        "optionReasonsVi": {
          "1": "Giải thích lựa chọn 1...",
          "2": "Giải thích lựa chọn 2...",
          "3": "Giải thích lựa chọn 3...",
          "4": "Giải thích lựa chọn 4..."
        },
        "translationVi": "Bản dịch câu...",
        "vocabulary": [],
        "grammarPoints": [],
        "studyTipVi": "Mẹo..."
      },
      "review": {
        "status": "needs_review",
        "notes": "Kiểm tra ban đầu"
      }
    }
  ],
  "questionCount": 1
}`;

  contents.push({ text: systemPrompt });

  const response = await ai.models.generateContent({
    model: DEFAULT_MODEL,
    contents,
    config: {
      responseMimeType: "application/json",
      temperature: 0.1,
    },
  });

  const responseText = response.text || "";
  const parsed = cleanJsonResponse(responseText);

  // Validate with Zod
  const validated = examDetailSchema.parse(parsed);

  return {
    exam: validated,
    rawTextPreview: extractedTextPreview,
  };
}

// ==============================================================================
// MODULE 2: AI EXPLANATION GENERATOR
// ==============================================================================
export async function generateExplanationsWithGemini(
  examData: ExamDetail,
  customApiKey?: string
): Promise<ValidatedExamDetail> {
  const ai = getGeminiClient(customApiKey);

  const prompt = `Bạn là chuyên gia sư phạm tiếng Nhật JLPT N3.
Tôi cung cấp dữ liệu JSON đề thi JLPT N3 sau đây. Một số câu đã có đáp án đúng "correctOptionId".

NHIỆM VỤ CỦA BẠN:
1. Giữ nguyên 100% các trường: id, number, section, subtype, passageId, questionText, options, correctOptionId của TẤT CẢ các câu hỏi. TUYỆT ĐỐI KHÔNG THAY ĐỔI ĐÁP ÁN GỐC.
2. Với mỗi câu hỏi:
   - "summaryVi": Tóm tắt ngắn gọn đáp án đúng bằng tiếng Việt.
   - "correctReasonVi": Giải thích cặn kẽ tại sao đáp án đó là đúng (căn cứ ngữ pháp, âm On/Kun chữ Hán, ngữ cảnh).
   - "optionReasonsVi": BẮT BUỘC giải thích chi tiết cho TẤT CẢ các phương án (cả đáp án đúng và tất cả các distractors sai, chỉ rõ lỗi sai hoặc bẫy).
   - "translationVi": Bản dịch trọn vẹn câu hỏi và câu chứa chỗ trống sang tiếng Việt chuẩn, tự nhiên.
   - "vocabulary": Mảng các từ vựng trọng tâm N3 trong câu gồm { "word": "漢字", "hiragana": "かんじ", "meaningVi": "nghĩa" }.
   - "grammarPoints": Mảng các mẫu ngữ pháp N3 xuất hiện gồm { "pattern": "〜うちに", "meaningVi": "trong lúc...", "usageVi": "cách dùng...", "exampleJa": "...", "exampleVi": "..." }.
   - "readingEvidenceJa": Nếu là câu đọc hiểu, trích dẫn chính xác câu văn trong bài đọc làm chứng cứ.
   - "studyTipVi": Mẹo nhận diện, mẹo nhớ âm Hán Việt hoặc bẫy thường gặp.
3. TUYỆT ĐỐI KHÔNG CHÈN FURIGANA LÊN TỪ CẦN KIỂM TRA ĐỌC TRONG CÂU HỎI KANJI để tránh lộ đáp án. Chỉ đặt furigana trong mục giải thích từ vựng.
4. Xuất lại toàn bộ file JSON theo đúng cấu trúc ban đầu.

DỮ LIỆU ĐẦU VÀO:
${JSON.stringify(examData, null, 2)}`;

  const response = await ai.models.generateContent({
    model: DEFAULT_MODEL,
    contents: [{ text: prompt }],
    config: {
      responseMimeType: "application/json",
      temperature: 0.2,
    },
  });

  const responseText = response.text || "";
  const parsed = cleanJsonResponse(responseText);

  // Validate with Zod
  const validated = examDetailSchema.parse(parsed);
  return validated;
}

// ==============================================================================
// MODULE 4: AI TUTOR (HỎI AI GIA SƯ N3)
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
  const ai = getGeminiClient(customApiKey);

  const correctOpt = question.options.find((o) => o.id === question.correctOptionId);
  const selectedOpt = question.options.find((o) => o.id === selectedOptionId);

  const contextPrompt = `Bạn là "Sensei AI" - Gia sư tiếng Nhật chuyên biệt cho trình độ JLPT N3 của nền tảng JLPT N3 Practice Hub.
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

  const contents: any[] = [];
  contents.push({ text: contextPrompt });

  // Add conversation history if any
  for (const msg of history) {
    contents.push({
      role: msg.role === "user" ? "user" : "model",
      text: msg.text,
    });
  }

  // Add user query
  contents.push({
    role: "user",
    text: userQuery,
  });

  const response = await ai.models.generateContent({
    model: DEFAULT_MODEL,
    contents,
    config: {
      temperature: 0.3,
    },
  });

  return response.text || "Sensei chưa thể trả lời lúc này, vui lòng thử lại câu hỏi khác nhé!";
}

