import { z } from "zod";

// Schema for Vocabulary Item
export const vocabularyItemSchema = z.object({
  word: z.string().min(1, "Từ vựng tiếng Nhật không được để trống"),
  hiragana: z.string().min(1, "Cách đọc Hiragana không được để trống"),
  meaningVi: z.string().min(1, "Nghĩa tiếng Việt không được để trống"),
});

// Schema for Grammar Point
export const grammarPointSchema = z.object({
  pattern: z.string().min(1, "Mẫu ngữ pháp không được để trống"),
  meaningVi: z.string().min(1, "Ý nghĩa tiếng Việt không được để trống"),
  usageVi: z.string().optional(),
  exampleJa: z.string().optional(),
  exampleVi: z.string().optional(),
});

// Schema for Question Explanation
export const questionExplanationSchema = z.object({
  summaryVi: z.string().min(1, "Tóm tắt giải thích không được để trống"),
  correctReasonVi: z.string().min(1, "Lý do đáp án đúng không được để trống"),
  optionReasonsVi: z.record(z.string(), z.string()).refine(
    (reasons) => Object.keys(reasons).length > 0,
    { message: "Phải có giải thích cho các phương án" }
  ),
  translationVi: z.string().min(1, "Bản dịch câu hỏi không được để trống"),
  vocabulary: z.array(vocabularyItemSchema).optional(),
  grammarPoints: z.array(grammarPointSchema).optional(),
  readingEvidenceJa: z.string().optional(),
  studyTipVi: z.string().optional(),
});

// Schema for Option
export const examOptionSchema = z.object({
  id: z.string().min(1, "ID lựa chọn không được để trống"),
  text: z.string().min(1, "Nội dung lựa chọn không được để trống"),
});

// Schema for Question Review
export const questionReviewSchema = z.object({
  status: z.enum(["verified", "needs_review"]),
  notes: z.string().optional(),
});

// Schema for Question
export const examQuestionSchema = z.object({
  id: z.string().min(1, "ID câu hỏi không được để trống"),
  number: z.number().int().positive("Số thứ tự câu hỏi phải là số nguyên dương"),
  section: z.enum(["vocabulary", "grammar", "reading"]),
  subtype: z.string().min(1, "Phân loại câu hỏi (subtype) không được để trống"),
  passageId: z.string().optional(),
  questionText: z.string().min(1, "Nội dung câu hỏi không được để trống"),
  options: z.array(examOptionSchema).min(2, "Mỗi câu hỏi phải có ít nhất 2 lựa chọn"),
  correctOptionId: z.string().nullable().optional(), // Allowed null in draft when source lacks answer key
  difficulty: z.number().int().min(1).max(5).default(3),
  tags: z.array(z.string()).optional(),
  sourcePage: z.number().int().positive().optional(), // Provenance tracking
  explanation: questionExplanationSchema,
  review: questionReviewSchema,
});

// Schema for Passage
export const examPassageSchema = z.object({
  id: z.string().min(1, "ID bài đọc không được để trống"),
  title: z.string().optional(),
  text: z.string().min(1, "Nội dung bài đọc không được để trống"),
  imagePath: z.string().optional(),
});

// Schema for Exam Detail (Schema 1.0.0)
export const examDetailSchema = z
  .object({
    schemaVersion: z.literal("1.0.0"),
    id: z.string().regex(/^[a-z0-9-]+$/, "ID đề thi chỉ được chứa chữ thường, số và dấu gạch nối"),
    title: z.string().min(3, "Tiêu đề đề thi phải có ít nhất 3 ký tự"),
    description: z.string().min(5, "Mô tả đề thi phải có ít nhất 5 ký tự"),
    level: z.literal("N3"),
    status: z.enum(["draft", "published"]),
    source: z.object({
      fileName: z.string().min(1),
      type: z.string().default("official_mock"),
      notes: z.string().optional(),
      reviewedByHuman: z.boolean().default(false),
    }),
    settings: z.object({
      timeLimitMinutes: z.number().positive("Thời lượng làm bài phải lớn hơn 0"),
      allowedModes: z.array(z.enum(["practice", "exam"])).min(1),
    }),
    passages: z.array(examPassageSchema).default([]),
    questions: z.array(examQuestionSchema).min(1, "Đề thi phải có ít nhất 1 câu hỏi"),
    questionCount: z.number().int().positive(),
  })
  .superRefine((data, ctx) => {
    // 1. Check question count matches questions array
    if (data.questionCount !== data.questions.length) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["questionCount"],
        message: `questionCount (${data.questionCount}) không khớp với số câu thực tế (${data.questions.length})`,
      });
    }

    // 2. Check duplicate question IDs
    const qIds = new Set<string>();
    data.questions.forEach((q, idx) => {
      if (qIds.has(q.id)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["questions", idx, "id"],
          message: `Trùng lặp ID câu hỏi "${q.id}"`,
        });
      }
      qIds.add(q.id);

      // Check option IDs
      const optIds = q.options.map((o) => o.id);
      const uniqueOptIds = new Set(optIds);
      if (uniqueOptIds.size !== optIds.length) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["questions", idx, "options"],
          message: `Câu hỏi ${q.id} có lựa chọn bị trùng lặp ID`,
        });
      }

      // If correctOptionId is provided, it must match an option
      if (q.correctOptionId && !optIds.includes(q.correctOptionId)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["questions", idx, "correctOptionId"],
          message: `correctOptionId "${q.correctOptionId}" không nằm trong danh sách lựa chọn [${optIds.join(", ")}]`,
        });
      }

      // Check option reasons
      if (q.explanation && q.explanation.optionReasonsVi) {
        optIds.forEach((optId) => {
          if (!q.explanation.optionReasonsVi[optId]) {
            ctx.addIssue({
              code: z.ZodIssueCode.custom,
              path: ["questions", idx, "explanation", "optionReasonsVi", optId],
              message: `Câu hỏi ${q.id} thiếu giải thích cho lựa chọn ID "${optId}"`,
            });
          }
        });
      }

      // Check passageId reference
      if (q.passageId) {
        const passageExists = data.passages.some((p) => p.id === q.passageId);
        if (!passageExists) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ["questions", idx, "passageId"],
            message: `passageId "${q.passageId}" không tồn tại trong danh sách passages`,
          });
        }
      }

      // If exam is published, strict verification is required
      if (data.status === "published") {
        if (!q.correctOptionId) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ["questions", idx, "correctOptionId"],
            message: `Đề xuất bản (published) nhưng câu ${q.id} chưa có đáp án đúng`,
          });
        }
        if (q.review.status !== "verified") {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ["questions", idx, "review", "status"],
            message: `Đề xuất bản (published) nhưng câu ${q.id} chưa được xác nhận verified`,
          });
        }
      }
    });

    // Check passage IDs are unique
    const pIds = new Set<string>();
    data.passages.forEach((p, idx) => {
      if (pIds.has(p.id)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["passages", idx, "id"],
          message: `Trùng lặp ID bài đọc "${p.id}"`,
        });
      }
      pIds.add(p.id);
    });
  });

export type ValidatedExamDetail = z.infer<typeof examDetailSchema>;
