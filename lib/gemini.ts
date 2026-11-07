import { GoogleGenAI } from "@google/genai";
import mammoth from "mammoth";
import { examDetailSchema, ValidatedExamDetail } from "./validation";
import { ExamDetail, ExamQuestion } from "./types";

const DEFAULT_MODEL = process.env.GEMINI_MODEL || "gemini-2.5-flash";

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
