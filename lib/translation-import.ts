import { z } from "zod";

const text = (max: number) => z.string().trim().min(1, "Không được để trống").max(max, `Tối đa ${max} ký tự`);
export const customLessonSchema = z.object({
  id: text(100).regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Dùng chữ thường không dấu, số và dấu gạch ngang"),
  topic: text(80).refine((value) => value !== "Tất cả", "Hãy dùng tên chủ đề riêng, không dùng Tất cả"),
  level: z.enum(["N5", "N4", "N3", "N2", "N1"]),
  title: text(200),
  japaneseTitle: text(200),
  sentences: z.array(text(1000).refine((value) => {
    const plain = value.replace(/\[[^\[\]|]+\|[ぁ-ゖー]+\]/g, "");
    return !/[\[\]|]/.test(plain);
  }, "Furigana phải có dạng [漢字|かんじ], hoặc dùng câu thường không có ngoặc")).min(1, "Cần ít nhất một câu").max(50, "Tối đa 50 câu"),
  translation: z.array(text(1000)).min(1).max(50),
  vocabulary: z.array(z.tuple([text(100), text(100), text(500)])).max(50),
  grammar: z.array(z.tuple([text(200), text(1000)])).max(30),
  explanations: z.array(text(2000)).max(50),
}).strict().superRefine((lesson, ctx) => {
  if (lesson.sentences.length !== lesson.translation.length) ctx.addIssue({
    code: "custom", path: ["translation"], message: `Cần ${lesson.sentences.length} bản dịch, đúng bằng số câu tiếng Nhật và theo cùng thứ tự`,
  });
});

export type CustomTranslationLesson = z.infer<typeof customLessonSchema>;
export const CUSTOM_LESSONS_KEY = "vuyanh-custom-translation-lessons-v1";
export const MAX_IMPORT_CHARACTERS = 150000;

export function readCustomLessons(raw: string | null, builtInIds: string[]): CustomTranslationLesson[] {
  if (!raw) return [];
  const lessons = z.array(customLessonSchema).max(100).parse(JSON.parse(raw));
  const ids = new Set(builtInIds);
  for (const lesson of lessons) {
    if (ids.has(lesson.id)) throw new Error(`ID "${lesson.id}" bị trùng trong dữ liệu đã lưu.`);
    ids.add(lesson.id);
  }
  return lessons;
}

export function parseLessonImport(input: string, existingIds: string[] = []): CustomTranslationLesson[] {
  if (input.length > MAX_IMPORT_CHARACTERS) throw new Error("JSON quá dài. Mỗi lần nhập tối đa 150.000 ký tự.");
  let raw: unknown;
  try { raw = JSON.parse(input.replace(/^\uFEFF/, "")); }
  catch { throw new Error('JSON chưa đúng cú pháp. Dùng dấu nháy kép ", không có chú thích //, không có dấu phẩy sau phần tử cuối và không dán dấu ``` bao quanh.'); }
  const entries = Array.isArray(raw) ? raw : [raw];
  if (!entries.length || entries.length > 20) throw new Error("Mỗi lần thêm từ 1 đến 20 bài (một object hoặc một mảng các object).");
  const ids = new Set(existingIds);
  return entries.map((entry, index) => {
    const result = customLessonSchema.safeParse(entry);
    if (!result.success) {
      const details = result.error.issues.slice(0, 5).map((issue) => `${issue.path.join(".") || "cấu trúc bài"}: ${issue.message}`).join("\n");
      throw new Error(`Bài ${index + 1} chưa hợp lệ:\n${details}`);
    }
    if (ids.has(result.data.id)) throw new Error(`ID "${result.data.id}" đã có. Đổi sang ID mới để không ghi đè bài và tiến độ đã lưu.`);
    ids.add(result.data.id);
    return result.data;
  });
}

export const exampleTranslationLesson: CustomTranslationLesson = {
  id: "tu-them-thu-vien", topic: "Học tập", level: "N3",
  title: "Một buổi học ở thư viện", japaneseTitle: "図書館での勉強",
  sentences: [
    "[試験|しけん]が[近|ちか]いので、[図書館|としょかん]で[勉強|べんきょう]することにしました。",
    "[家|いえ]より[静|しず]かなので、[集中|しゅうちゅう]しやすいです。",
    "[忘|わす]れないように、[新|あたら]しい[言葉|ことば]をノートに[書|か]いておきます。",
  ],
  translation: [
    "Vì kỳ thi sắp đến, tôi quyết định học ở thư viện.",
    "Ở đây yên tĩnh hơn ở nhà nên tôi dễ tập trung.",
    "Để không quên, tôi ghi sẵn những từ mới vào vở.",
  ],
  vocabulary: [["図書館", "としょかん", "thư viện"], ["集中", "しゅうちゅう", "tập trung"]],
  grammar: [["～ことにする", "Quyết định làm một việc gì đó."], ["～ておく", "Làm sẵn để chuẩn bị cho sau này."]],
  explanations: ["Câu 2: ～やすい diễn tả dễ làm gì. 集中しやすい là dễ tập trung.", "Câu 3: 忘れないように diễn tả mục đích ‘để không quên’; 書いておく là ghi lại để dùng về sau."],
};
