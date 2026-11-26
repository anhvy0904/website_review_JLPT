import { z } from "zod";

const text = z.string().trim().min(1).max(1000);
const audio = z.string().max(500).refine((value) => value === "" || /^\/audio\/[a-zA-Z0-9_./-]+\.(mp3|wav|ogg|m4a)$/i.test(value), "Audio phải là đường dẫn /audio/... hoặc chuỗi rỗng để dùng giọng trình duyệt");
export const tangoWordSchema = z.object({
  id: z.string().regex(/^[a-zA-Z0-9_-]{1,100}$/), stt: z.number().int().positive(),
  kanji: text, hiragana: text, meaning: text, wordAudio: audio,
  example: z.object({ japanese: text, hiragana: text, meaning: text, audio }),
});
export const tangoDataSchema = z.array(z.object({
  chapterId: z.number().int().positive(), chapterTitle: text,
  units: z.array(z.object({ unitId: z.number().int().positive(), unitTitle: text, words: z.array(tangoWordSchema).min(1).max(500) })).min(1).max(100),
})).min(1).max(100).superRefine((chapters, ctx) => {
  const chapterIds = new Set<number>();
  const wordIds = new Set<string>();
  for (const chapter of chapters) {
    if (chapterIds.has(chapter.chapterId)) ctx.addIssue({ code: "custom", message: `Chapter ${chapter.chapterId} bị trùng ID` });
    chapterIds.add(chapter.chapterId);
    const units = new Set<number>();
    for (const unit of chapter.units) {
      if (units.has(unit.unitId)) ctx.addIssue({ code: "custom", message: `Unit ${unit.unitId} bị trùng trong Chapter ${chapter.chapterId}` });
      units.add(unit.unitId);
      const numbers = new Set<number>();
      for (const word of unit.words) {
        if (wordIds.has(word.id)) ctx.addIssue({ code: "custom", message: `ID từ ${word.id} bị trùng` });
        if (numbers.has(word.stt)) ctx.addIssue({ code: "custom", message: `STT ${word.stt} bị trùng trong Unit ${unit.unitId}` });
        wordIds.add(word.id); numbers.add(word.stt);
      }
    }
  }
});
export type TangoChapter = z.infer<typeof tangoDataSchema>[number];
export type TangoWord = z.infer<typeof tangoWordSchema>;
export type TangoMode = "word" | "example";
const itemProgressSchema = z.object({
  attempts: z.number().int().nonnegative(), correct: z.number().int().nonnegative(),
  streak: z.number().int().nonnegative(), wrong: z.boolean(), mastered: z.boolean(), lastStudied: z.string(),
});
export const tangoProgressSchema = z.record(z.string(), itemProgressSchema);
export type TangoItemProgress = z.infer<typeof itemProgressSchema>;
export type TangoProgress = z.infer<typeof tangoProgressSchema>;
export const TANGO_PROGRESS_KEY = "vuyanh-tango-n3-progress-v1";
export const TANGO_DATA_KEY = "vuyanh-tango-n3-custom-data-v1";
export const emptyProgress: TangoItemProgress = { attempts: 0, correct: 0, streak: 0, wrong: false, mastered: false, lastStudied: "" };

export function progressKey(word: TangoWord, mode: TangoMode) { return `${word.id}:${mode}`; }
export function normalizeJapanese(value: string) {
  return value.normalize("NFKC").replace(/[\u30a1-\u30f6]/g, (char) => String.fromCharCode(char.charCodeAt(0) - 0x60)).replace(new RegExp("[\\s\\p{P}]", "gu"), "");
}
export function checkTangoAnswer(word: TangoWord, mode: TangoMode, input: string) {
  const value = normalizeJapanese(input);
  if (!value) return false;
  const accepted = mode === "word" ? [word.kanji, word.hiragana] : [word.example.japanese, word.example.hiragana];
  return accepted.some((answer) => normalizeJapanese(answer) === value);
}
export function recordTangoAnswer(previous: TangoItemProgress | undefined, correct: boolean, date = new Date().toISOString()): TangoItemProgress {
  const before = previous || emptyProgress;
  const streak = correct ? before.streak + 1 : 0;
  return { attempts: before.attempts + 1, correct: before.correct + Number(correct), streak, wrong: !correct,
    mastered: correct && (before.mastered || streak >= 2), lastStudied: date };
}
export function selectTangoQueue(words: TangoWord[], progress: TangoProgress, mode: TangoMode, wrongOnly: boolean) {
  return words.filter((word) => !wrongOnly || progress[progressKey(word, mode)]?.wrong).sort((a, b) => a.stt - b.stt);
}
