import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const source = await readFile(new URL("../lib/translation-lessons.js", import.meta.url), "utf8");
const { translationLessons: lessons } = await import(`data:text/javascript;base64,${Buffer.from(source).toString("base64")}`);

test("Translation curriculum has five unique N3 lessons and all requested topics", () => {
  assert.ok(lessons.length >= 5);
  assert.equal(new Set(lessons.map((lesson) => lesson.id)).size, lessons.length);
  for (const topic of ["Du lịch", "Công việc IT", "Đời sống hằng ngày", "Văn hóa Nhật"]) {
    assert.ok(lessons.some((lesson) => lesson.topic === topic));
  }
});

for (const lesson of lessons) {
  test(`${lesson.id}: complete reading, aligned translations and valid ruby annotations`, () => {
    assert.equal(lesson.level, "N3");
    assert.ok(lesson.sentences.length >= 10 && lesson.sentences.length <= 15);
    assert.equal(lesson.sentences.length, lesson.translation.length);
    for (const sentence of lesson.sentences) {
      const plain = sentence.replace(/\[([^\[\]|]+)\|([ぁ-ゖー]+)\]/g, "$1");
      assert.ok(!/[\[\]|]/.test(plain), `Malformed furigana: ${sentence}`);
      assert.equal((plain.match(/。/g) || []).length, 1);
      // Every kanji in the passage should have a reading when furigana is on.
      assert.ok(!/[\p{Script=Han}]/u.test(sentence.replace(/\[[^\[\]|]+\|[ぁ-ゖー]+\]/g, "")), sentence);
    }
    assert.ok(lesson.translation.every((text) => text.trim().length > 0));
    assert.ok(lesson.vocabulary.length > 0 && lesson.vocabulary.every((entry) => entry.length === 3));
    assert.ok(lesson.grammar.length > 0 && lesson.grammar.every((entry) => entry.length === 2));
    assert.ok(lesson.explanations.length > 0);
  });
}
