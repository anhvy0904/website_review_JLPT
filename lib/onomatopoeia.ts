import { z } from 'zod';

const text = z.string().trim().min(1);
const id = z.string().regex(/^[a-zA-Z0-9_-]+$/);
const entrySchema = z.object({
  id, sectionId: id, word: text, reading: text, meaning: text, explanation: text,
  sourcePage: z.number().int().positive().nullable(),
  conversations: z.array(z.object({ context: text, dialogues: z.array(z.object({ speaker: z.string(), ja: text, vi: text })).min(1) })),
});
const quizSchema = z.object({ id, entryId: id, question: text, options: z.array(text).min(2).max(4), answerIndex: z.number().int().nonnegative(), explanation: text });
const dictationSchema = z.object({ id, entryId: id, text, reading: text, acceptedAnswers: z.array(text), audio: z.string().refine(v => v === '' || /^\/audio\/[a-zA-Z0-9_/-]+\.(mp3|m4a|wav|ogg)$/.test(v)), });
const exerciseSchema = z.object({ id, entryId: id, prompt: text.refine(v => v.includes('___'), 'Cần có chỗ trống ___'), answer: text, acceptedAnswers: z.array(text), explanation: text });
export const onomatopoeiaBookSchema = z.object({
  schemaVersion: z.literal('1.0'), title: text, sourceName: text,
  sourceUrl: z.union([z.literal(''), z.string().url()]).refine(v => !v || /^https?:\/\//.test(v)),
  sections: z.array(z.object({ id, title: text })).min(1), entries: z.array(entrySchema).min(1),
  quizzes: z.array(quizSchema), dictations: z.array(dictationSchema), exercises: z.array(exerciseSchema),
}).superRefine((book, ctx) => {
  const error = (message: string) => ctx.addIssue({ code: 'custom', message });
  for (const items of [book.sections, book.entries, book.quizzes, book.dictations, book.exercises]) {
    if (new Set(items.map(item => item.id)).size !== items.length) error('ID bị trùng trong cùng danh sách');
  }
  const sections = new Set(book.sections.map(section => section.id));
  const entries = new Set(book.entries.map(entry => entry.id));
  for (const entry of book.entries) if (!sections.has(entry.sectionId)) error(`Không có phần ${entry.sectionId}`);
  for (const item of [...book.quizzes, ...book.dictations, ...book.exercises]) if (!entries.has(item.entryId)) error(`Không có từ ${item.entryId}`);
  for (const quiz of book.quizzes) {
    if (quiz.answerIndex >= quiz.options.length) error(`Đáp án ngoài phạm vi: ${quiz.id}`);
    if (new Set(quiz.options.map(normalizeAnswer)).size !== quiz.options.length) error(`Lựa chọn trùng: ${quiz.id}`);
  }
});
export type OnomatopoeiaBook = z.infer<typeof onomatopoeiaBookSchema>;
export type StudyEntry = z.infer<typeof entrySchema>;
export type Activity = { id: string; entryId: string; prompt: string; answers: string[]; explanation: string; options?: string[]; reading?: string; audio?: string };
export type PracticeMode = 'quiz' | 'dictation' | 'exercise';

export function unlockedLesson(sections: { id: string }[], completed: string[], id: string) {
  const index = sections.findIndex(section => section.id === id);
  return index >= 0 && sections.slice(0, index).every(section => completed.includes(section.id));
}

export function readCompletedLessons(value: unknown, sections: { id: string }[]) {
  if (!Array.isArray(value)) return [];
  const completed: string[] = [];
  for (const section of sections) {
    if (!value.includes(section.id)) break;
    completed.push(section.id);
  }
  return completed;
}

export function plainJapanese(text: string, reading = false) {
  return text.replace(/\[([^\]]+)\]\(([^)]+)\)/g, (_, kanji: string, kana: string) => reading ? kana : kanji).replace(/_/g, '');
}
export function normalizeAnswer(text: string) {
  return text.normalize('NFKC').toLowerCase().replace(/[ァ-ヶ]/g, c => String.fromCharCode(c.charCodeAt(0) - 96)).replace(/[\s。、，,.!！?？「」『』]/g, '');
}
export function acceptsAnswer(input: string, answers: string[]) {
  const normalized = normalizeAnswer(input);
  return !!normalized && answers.some(answer => normalizeAnswer(answer) === normalized);
}
export function makeActivities(book: OnomatopoeiaBook, selected: StudyEntry[], mode: PracticeMode): Activity[] {
  const ids = new Set(selected.map(entry => entry.id));
  if (mode === 'quiz') return selected.flatMap((entry, index) => {
    const provided = book.quizzes.filter(item => item.entryId === entry.id);
    if (provided.length) return provided.map(q => ({ id: q.id, entryId: q.entryId, prompt: q.question, options: q.options, answers: [q.options[q.answerIndex]], explanation: q.explanation }));
    const distractors = Array.from(new Set(selected.filter(item => item.meaning !== entry.meaning).map(item => item.meaning))).slice(0, 3);
    if (!distractors.length) return [];
    const options = [...distractors]; options.splice(index % (options.length + 1), 0, entry.meaning);
    return [{ id: `quiz-${entry.id}`, entryId: entry.id, prompt: `「${entry.word}」 có nghĩa là gì?`, options, answers: [entry.meaning], explanation: entry.explanation }];
  });
  if (mode === 'dictation') return selected.flatMap(entry => {
    const provided = book.dictations.filter(item => item.entryId === entry.id);
    if (provided.length) return provided.map(d => ({ id: d.id, entryId: d.entryId, prompt: 'Nghe và gõ lại từ hoặc câu tiếng Nhật.', reading: d.reading, audio: d.audio, answers: [d.text, d.reading, ...d.acceptedAnswers], explanation: entry.meaning }));
    const words = entry.word.split(/[／/]/).map(word => word.trim()).filter(Boolean);
    const readings = entry.reading.split(/[／/]/).map(word => word.trim()).filter(Boolean);
    return [{ id: `dictation-${entry.id}`, entryId: entry.id, prompt: 'Nghe và gõ lại từ tiếng Nhật.', reading: readings[0], audio: '', answers: [words[0], readings[0]], explanation: entry.meaning }];
  });
  const result: Activity[] = [];
  for (const entry of selected) {
    const provided = book.exercises.filter(item => item.entryId === entry.id);
    if (provided.length) {
      result.push(...provided.map(e => ({ id: e.id, entryId: e.entryId, prompt: e.prompt, answers: [e.answer, ...e.acceptedAnswers], explanation: e.explanation })));
      continue;
    }
    const line = entry.conversations.flatMap(c => c.dialogues).find(d => /_[^_]+_/.test(d.ja));
    const answer = line && /_([^_]+)_/.exec(line.ja)?.[1];
    if (line && answer) result.push({ id: `exercise-${entry.id}`, entryId: entry.id, prompt: plainJapanese(line.ja.replace(/_([^_]+)_/g, '〔BLANK〕')).replace(/〔BLANK〕/g, '___'), answers: [plainJapanese(answer), plainJapanese(answer, true)], explanation: `${line.vi}\n\n${entry.explanation}` });
  }
  return result.filter(item => ids.has(item.entryId));
}
