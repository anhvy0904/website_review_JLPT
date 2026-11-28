import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import vm from 'node:vm';
import { createRequire } from 'node:module';
import ts from 'typescript';

const require = createRequire(import.meta.url);
const source = await readFile(new URL('../lib/onomatopoeia.ts', import.meta.url), 'utf8');
const compiled = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 } }).outputText;
const module = { exports: {} };
vm.runInNewContext(compiled, { require, module, exports: module.exports });
const { onomatopoeiaBookSchema, makeActivities, acceptsAnswer, unlockedLesson, readCompletedLessons } = module.exports;
const template = JSON.parse(await readFile(new URL('../public/data/learning/onomatopoeia/book-template.json', import.meta.url), 'utf8'));

const data = JSON.parse(await readFile(new URL('../public/data/learning/onomatopoeia/index.json', import.meta.url), 'utf8'));
test('live book data has valid entries, IDs, and bilingual conversations', () => {
  assert.ok(data.entries.length > 0);
  assert.equal(new Set(data.entries.map(entry => entry.id)).size, data.entries.length);
  if (typeof data.lockedCount === 'number' && typeof data.sourceTotal === 'number') {
    assert.equal(data.entries.length + data.lockedCount, data.sourceTotal);
  }
  for (const entry of data.entries) {
    for (const field of ['id', 'word', 'meaning', 'explanation']) {
      assert.ok(typeof entry[field] === 'string' && entry[field].trim(), `${entry.id}: ${field}`);
    }
    for (const conversation of entry.conversations) {
      assert.ok(conversation.context);
      assert.ok(conversation.dialogues.length > 0);
      for (const line of conversation.dialogues) {
        assert.ok(line.ja && line.vi, `${entry.id}: missing bilingual text`);
        assert.ok(!/<\/?(?:script|iframe|img)\b/i.test(line.ja));
      }
    }
  }
});

test('book template and live data match the schema used by the page', () => {
  assert.ok(onomatopoeiaBookSchema.safeParse(template).success);
  assert.ok(onomatopoeiaBookSchema.safeParse(data).success);
});
test('reject invalid references, duplicate IDs, unsafe audio and invalid answers', () => {
  for (const mutate of [
    b => b.entries.push(b.entries[0]),
    b => b.sections.push(b.sections[0]),
    b => { b.entries[0].sectionId = 'missing'; },
    b => { b.quizzes[0].entryId = 'missing'; },
    b => { b.quizzes[0].answerIndex = 4; },
    b => { b.quizzes[0].options[1] = b.quizzes[0].options[0]; },
    b => { b.dictations[0].audio = '/audio/../secret.mp3'; },
    b => { b.exercises[0].prompt = 'No blank'; },
    b => { b.sourceUrl = 'javascript:alert(1)'; },
  ]) {
    const copy = structuredClone(template); mutate(copy);
    assert.equal(onomatopoeiaBookSchema.safeParse(copy).success, false);
  }
});
test('grading accepts script and punctuation variants without losing Japanese sounds', () => {
  for (const input of ['ワクワク', '  わくわく。', 'ﾜｸﾜｸ']) assert.ok(acceptsAnswer(input, ['わくわく']));
  for (const input of ['', '。', 'わく', 'わぐわぐ']) assert.equal(acceptsAnswer(input, ['わくわく']), false);
  assert.equal(acceptsAnswer('きて', ['きって']), false);
  assert.equal(acceptsAnswer('コト', ['コート']), false);
});
test('all modes work for current content and stay in selected sections', () => {
  const selected = data.entries.filter(entry => entry.sectionId === data.sections[1].id);
  for (const mode of ['quiz', 'dictation', 'exercise']) {
    const activities = makeActivities(data, selected, mode);
    assert.ok(activities.length >= selected.length);
    for (const item of activities) {
      assert.ok(selected.some(entry => entry.id === item.entryId));
      assert.ok(acceptsAnswer(item.answers[0], item.answers));
      if (mode === 'quiz' && item.options) {
        assert.equal(new Set(item.options).size, item.options.length);
        assert.equal(item.options.filter(option => acceptsAnswer(option, item.answers)).length, 1);
      }
      if (mode === 'exercise') { assert.ok(item.prompt.includes('___')); assert.ok(!item.prompt.includes(item.answers[0])); }
    }
  }
});
test('explicit activities from imported books take priority over automatic fallback', () => {
  for (const [mode, field] of [['quiz', 'quizzes'], ['dictation', 'dictations'], ['exercise', 'exercises']]) {
    const activities = makeActivities(template, template.entries, mode);
    assert.ok(activities.some(item => item.id === template[field][0].id));
  }
  assert.equal(makeActivities(template, [], 'exercise').length, 0);
});

test('dictation speaks one spelling when the source lists slash-separated variants', () => {
  const slashEntry = {
    id: 'test-slash-01',
    sectionId: data.sections[0].id,
    word: 'キラキラ／きらきら',
    reading: 'きらきら',
    meaning: 'Lấp lánh',
    explanation: 'Ví dụ minh họa',
    sourcePage: 1,
    conversations: [],
  };
  const [activity] = makeActivities({ ...data, dictations: [] }, [slashEntry], 'dictation');
  assert.ok(!activity.reading.includes('／'));
  assert.ok(acceptsAnswer('キラキラ', activity.answers));
});

test('lesson path unlocks sequentially, rejects unknown lessons and progress gaps', () => {
  const sections = [{ id: 'one' }, { id: 'two' }, { id: 'three' }];
  assert.equal(unlockedLesson(sections, [], 'one'), true);
  assert.equal(unlockedLesson(sections, [], 'two'), false);
  assert.equal(unlockedLesson(sections, ['one'], 'two'), true);
  assert.equal(unlockedLesson(sections, ['two'], 'three'), false);
  assert.equal(unlockedLesson(sections, ['one', 'two'], 'three'), true);
  assert.equal(unlockedLesson(sections, ['one', 'two'], 'missing'), false);
  assert.equal(JSON.stringify(readCompletedLessons(['one', 'one', 'three', 'missing'], sections)), '["one"]');
  assert.equal(JSON.stringify(readCompletedLessons(null, sections)), '[]');
  const restored = readCompletedLessons(JSON.parse(JSON.stringify(['one', 'two'])), sections);
  assert.equal(unlockedLesson(sections, restored, 'three'), true);
});

test('automatically generated quiz choices stay within the selected lesson', () => {
  const entries = data.entries.filter(entry => entry.sectionId === data.sections[2].id);
  const fallbackBook = { ...data, quizzes: [] };
  for (const activity of makeActivities(fallbackBook, entries, 'quiz')) {
    assert.ok(activity.options.every(option => entries.some(entry => entry.meaning === option)));
  }
});
