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
  summaryVi: z.string().default(""),
  correctReasonVi: z.string().default(""),
  optionReasonsVi: z.record(z.string(), z.string()).default({}),
  translationVi: z.string().default(""),
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
  mondai: z.union([z.string(), z.number()]).optional(),
  weight: z.number().optional(),
  passageId: z.string().nullable().optional(),
  questionText: z.string().default(""),
  questionImagePath: z.string().optional(),
  options: z.array(examOptionSchema).min(2, "Mỗi câu hỏi phải có ít nhất 2 lựa chọn"),
  correctOptionId: z.string().nullable().optional(), // Allowed null in draft when source lacks answer key
  difficulty: z.number().int().min(1).max(5).default(3),
  tags: z.array(z.string()).optional(),
  sourcePage: z.number().int().positive().optional(), // Provenance tracking
  contentAvailableAsText: z.boolean().optional(),
  ocrUnverified: z.boolean().optional(),
  explanation: questionExplanationSchema,
  review: questionReviewSchema,
});

// Schema for Passage
export const examPassageSchema = z.object({
  id: z.string().min(1, "ID bài đọc không được để trống"),
  title: z.string().optional(),
  text: z.string().default(""),
  imagePath: z.string().optional(),
  additionalImagePaths: z.array(z.string()).optional(),
  reviewStatus: z.enum(["verified", "needs_review"]).optional(),
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

      // Question must have either questionText or questionImagePath
      if ((!q.questionText || q.questionText.trim().length === 0) && (!q.questionImagePath || q.questionImagePath.trim().length === 0)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["questions", idx, "questionText"],
          message: `Câu hỏi ${q.id} phải có ít nhất questionText hoặc questionImagePath`,
        });
      }

      // If exam is published, strict verification is required (Requirement 10)
      if (data.status === "published") {
        if (!q.questionText || q.questionText.trim().length === 0) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ["questions", idx, "questionText"],
            message: `Đề xuất bản (published) nhưng câu ${q.id} chưa có nội dung văn bản tiếng Nhật`,
          });
        }
        const hasPlaceholderOptions =
          !q.options ||
          q.options.length < 4 ||
          q.options.every((o) => o.text.trim() === o.id.trim());
        if (hasPlaceholderOptions) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ["questions", idx, "options"],
            message: `Đề xuất bản (published) nhưng câu ${q.id} chưa đủ 4 lựa chọn gốc tiếng Nhật`,
          });
        }
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
        const isPlaceholderExplanation =
          !q.explanation ||
          !q.explanation.summaryVi?.trim() ||
          !q.explanation.correctReasonVi?.trim() ||
          q.explanation.summaryVi.includes("Chưa có đáp án gốc") ||
          q.explanation.correctReasonVi.includes("Chưa được kiểm duyệt");
        if (isPlaceholderExplanation) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ["questions", idx, "explanation"],
            message: `Đề xuất bản (published) nhưng câu ${q.id} thiếu lời giải chi tiết đã kiểm duyệt`,
          });
        }
      }
    });

    // Check passage IDs are unique and published passages have verified text
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

      if (data.status === "published") {
        if (!p.text || p.text.trim().length === 0) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ["passages", idx, "text"],
            message: `Đề xuất bản (published) nhưng bài đọc ${p.id} chưa có văn bản tiếng Nhật`,
          });
        }
        if (p.reviewStatus === "needs_review") {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ["passages", idx, "reviewStatus"],
            message: `Đề xuất bản (published) nhưng bài đọc ${p.id} chưa được kiểm chứng (needs_review)`,
          });
        }
      }
    });
  });

export type ValidatedExamDetail = z.infer<typeof examDetailSchema>;

