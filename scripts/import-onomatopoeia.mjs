import { readFile, writeFile, mkdir } from 'node:fs/promises';

// Import the public guest export only. Never infer content for locked lessons.
const sourceUrl = 'https://phadaotiengnhat.com/tuvung/tuongthanhtuonghinh/';
const dataUrl = 'https://phadaotiengnhat.com/data/khach/sachkaiwa/sachkaiwatuongthanhtuonghinh.json';
const input = process.argv[2];
const raw = input ? await readFile(input, 'utf8') : await (async () => {
  const response = await fetch(dataUrl);
  if (!response.ok) throw new Error(`Source returned ${response.status}`);
  return response.text();
})();
const lessons = JSON.parse(raw);
if (!Array.isArray(lessons) || !lessons.length) throw new Error('Invalid source data');
const entries = lessons.filter(item => !item.locked).map(item => {
  if (!item.id || !item.title || !item.translation || !item.explanation) throw new Error('Incomplete public lesson');
  return {
    id: String(item.id), word: item.title.replace(/^\d+\.\s*/, '').trim(),
    meaning: item.translation, explanation: item.explanation,
    conversations: (item.conversations || []).map(conversation => ({
      context: conversation.context,
      dialogues: conversation.dialogues.map(line => ({ speaker: line.speaker || '', ja: line.ja, vi: line.vi })),
    })),
  };
});
if (!entries.length || new Set(entries.map(entry => entry.id)).size !== entries.length) throw new Error('Empty or duplicate lessons');
const result = {
  schemaVersion: '1.0', title: 'Tượng hình – Tượng thanh',
  sourceName: 'Phá Đảo Tiếng Nhật', sourceUrl, dataUrl, importedAt: new Date().toISOString(), sourceTotal: lessons.length, lockedCount: lessons.filter(item => item.locked).length,
  sections: Array.from({ length: Math.ceil(entries.length / 8) }, (_, i) => ({ id: `part-${i + 1}`, title: `Phần ${i + 1} · Từ ${i * 8 + 1}–${Math.min((i + 1) * 8, entries.length)}` })),
  entries: entries.map((entry, i) => ({ ...entry, sectionId: `part-${Math.floor(i / 8) + 1}`, reading: entry.word.replace(/[ァ-ヶ]/g, c => String.fromCharCode(c.charCodeAt(0) - 96)), sourcePage: null })),
  quizzes: [], dictations: [], exercises: [],
};
await mkdir(new URL('../public/data/learning/onomatopoeia/', import.meta.url), { recursive: true });
await writeFile(new URL('../public/data/learning/onomatopoeia/index.json', import.meta.url), JSON.stringify(result, null, 2) + '\n');
console.log(`Imported ${entries.length} public lessons; skipped ${result.lockedCount} locked lessons.`);
