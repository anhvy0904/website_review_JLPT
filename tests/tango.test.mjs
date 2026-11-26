import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import vm from "node:vm";
import { createRequire } from "node:module";
import ts from "typescript";

const require = createRequire(import.meta.url);
const source = fs.readFileSync(new URL("../lib/tango.ts", import.meta.url), "utf8");
const compiled = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 } }).outputText;
const module = { exports: {} };
vm.runInNewContext(compiled, { require, module, exports: module.exports });
const tango = module.exports;
const data = JSON.parse(fs.readFileSync(new URL("../public/data/tango_n3_sample.json", import.meta.url), "utf8"));
const word = data[0].units[0].words[0];

test("Sample has valid Chapter/Unit hierarchy and unique vocabulary IDs", () => {
  assert.ok(tango.tangoDataSchema.safeParse(data).success);
  assert.equal(data.length, 2);
  assert.equal(data.flatMap((chapter) => chapter.units.flatMap((unit) => unit.words)).length, 12);
});
test("Official full dataset (tango_n3.json) has 12 chapters, 60 units, and 1,392 words", () => {
  const fullData = JSON.parse(fs.readFileSync(new URL("../public/data/tango_n3.json", import.meta.url), "utf8"));
  assert.ok(tango.tangoDataSchema.safeParse(fullData).success);
  assert.equal(fullData.length, 12);
  const totalUnits = fullData.reduce((acc, c) => acc + c.units.length, 0);
  const totalWords = fullData.reduce((acc, c) => acc + c.units.reduce((uAcc, u) => uAcc + u.words.length, 0), 0);
  assert.equal(totalUnits, 60);
  assert.equal(totalWords, 1392);
});
test("Accept corresponding Kanji, Hiragana, whitespace and Unicode variants", () => {
  for (const answer of ["目覚まし時計", "めざましどけい", " メザマシドケイ ", "ﾒｻﾞﾏｼﾄﾞｹｲ"]) assert.ok(tango.checkTangoAnswer(word, "word", answer));
  for (const answer of ["目覚まし時計が鳴る。", "めざましどけいがなる", "めざましどけい が なる！"]) assert.ok(tango.checkTangoAnswer(word, "example", answer));
});
test("Reject wrong mode, missing sounds, wrong particles and blank answers", () => {
  for (const answer of ["", "　", "。！", "mezamashidokei", "めざましとけい", "目覚まし時計が鳴る"]) assert.equal(tango.checkTangoAnswer(word, "word", answer), false);
  assert.equal(tango.checkTangoAnswer(word, "example", "めざましどけいはなる"), false);
  assert.notEqual(tango.normalizeJapanese("きって"), tango.normalizeJapanese("きて"));
  assert.notEqual(tango.normalizeJapanese("コート"), tango.normalizeJapanese("コト"));
});
test("Wrong answer adds to review, correction removes wrong, two consecutive correct master", () => {
  const wrong = tango.recordTangoAnswer(undefined, false, "date");
  assert.equal(wrong.wrong, true); assert.equal(wrong.mastered, false); assert.equal(wrong.attempts, 1);
  const once = tango.recordTangoAnswer(wrong, true, "date");
  assert.equal(once.wrong, false); assert.equal(once.mastered, false);
  const twice = tango.recordTangoAnswer(once, true, "date");
  assert.equal(twice.mastered, true); assert.equal(twice.correct, 2);
  const relapse = tango.recordTangoAnswer(twice, false, "date");
  assert.equal(relapse.mastered, false); assert.equal(relapse.streak, 0); assert.equal(relapse.wrong, true);
});
test("Review queues are separated by mode and do not mutate after progress changes", () => {
  const words = data[0].units[0].words;
  const progress = { [tango.progressKey(words[0], "word")]: tango.recordTangoAnswer(undefined, false) };
  const queue = tango.selectTangoQueue(words, progress, "word", true);
  assert.equal(queue.length, 1);
  assert.equal(tango.selectTangoQueue(words, progress, "example", true).length, 0);
  progress[tango.progressKey(words[0], "word")] = tango.recordTangoAnswer(progress[tango.progressKey(words[0], "word")], true);
  assert.equal(queue.length, 1);
  assert.equal(tango.selectTangoQueue(words, progress, "word", true).length, 0);
  assert.equal(tango.selectTangoQueue(words, progress, "word", false).length, words.length);
  assert.ok(tango.tangoProgressSchema.safeParse(JSON.parse(JSON.stringify(progress))).success);
});
test("Reject duplicate chapter, unit, word, STT and unsafe audio paths", () => {
  for (const mutate of [
    (copy) => copy.push(copy[0]),
    (copy) => copy[0].units.push(copy[0].units[0]),
    (copy) => { copy[0].units[0].words[1].id = word.id; },
    (copy) => { copy[0].units[0].words[1].stt = word.stt; },
    (copy) => { copy[0].units[0].words[0].wordAudio = "javascript:alert(1)"; },
    (copy) => { copy[0].units[0].words[0].example.hiragana = ""; },
  ]) {
    const copy = structuredClone(data); mutate(copy);
    assert.equal(tango.tangoDataSchema.safeParse(copy).success, false);
  }
});
