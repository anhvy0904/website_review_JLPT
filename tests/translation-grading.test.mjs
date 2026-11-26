import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import vm from "node:vm";
import { createRequire } from "node:module";
import ts from "typescript";

const require = createRequire(import.meta.url);
function load(path, mocks = {}) {
  const code = ts.transpileModule(fs.readFileSync(new URL(path, import.meta.url), "utf8"), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020, esModuleInterop: true },
  }).outputText;
  const module = { exports: {} };
  vm.runInNewContext(code, { module, exports: module.exports, require: (id) => mocks[id] ?? require(id) });
  return module.exports;
}
const imports = load("../lib/translation-import.ts");
const grading = load("../lib/translation-grading.ts", { "./translation-import": imports });
const { translationLessons } = load("../lib/translation-lessons.js");
const valid = { meaning: 5, grammar: 2, naturalness: 1, feedback: "Đúng ý chính, cần diễn đạt tự nhiên hơn.", correction: "先週、友達と京都へ旅行に行きました。" };

test("Grade accepts valid JSON and code fences; total is derived from criteria", () => {
  assert.equal(grading.gradeTotal(grading.parseGrade(JSON.stringify(valid))), 8);
  assert.equal(grading.parseGrade('```json\n' + JSON.stringify(valid) + '\n```').meaning, 5);
  for (const invalid of [{ ...valid, meaning: 7 }, { ...valid, grammar: -1 }, { ...valid, naturalness: 1.5 }, { ...valid, feedback: "" }]) {
    assert.throws(() => grading.parseGrade(JSON.stringify(invalid)));
  }
  assert.throws(() => grading.parseGrade("not JSON"));
});

test("Reject empty, overlong, invalid direction and invalid index requests", () => {
  const request = { lessonId: "kyoto-bus", sentenceIndex: 0, direction: "vi-ja", answer: "日本語" };
  assert.ok(grading.gradeRequestSchema.safeParse(request).success);
  for (const patch of [{ answer: "  " }, { answer: "a".repeat(1501) }, { direction: "invalid" }, { sentenceIndex: -1 }, { sentenceIndex: 0.5 }]) {
    assert.equal(grading.gradeRequestSchema.safeParse({ ...request, ...patch }).success, false);
  }
  assert.equal(grading.plainJapanese("[京都|きょうと]へ[行|い]きました。"), "京都へ行きました。");
});

function route({ key = "test-key", provider = "claude", allowed = true, output = JSON.stringify(valid), fail = false } = {}) {
  const calls = [];
  const respond = (params) => {
    calls.push(params);
    if (fail) throw new Error("secret-provider-error");
    return provider === "claude" ? { content: [{ type: "text", text: output }] } : { text: output };
  };
  const api = load("../app/api/ai/translation/route.ts", {
    "next/server": { NextResponse: { json: (body, init = {}) => ({ body, status: init.status ?? 200 }) } },
    "@/lib/auth": { checkRateLimit: () => ({ allowed }) },
    "@/lib/gemini": { resolveApiKey: () => ({ key, provider, model: "test-model" }) },
    "@/lib/translation-lessons": { translationLessons },
    "@/lib/translation-grading": grading,
    "@anthropic-ai/sdk": class { messages = { create: async (params) => respond(params) }; },
    "@google/genai": { GoogleGenAI: class { models = { generateContent: async (params) => respond(params) }; } },
  });
  return { api, calls };
}
const request = (patch = {}) => ({ json: async () => ({ lessonId: "kyoto-bus", sentenceIndex: 0, direction: "vi-ja", answer: "先週、友達と京都に行きました。", ...patch }) });

for (const provider of ["claude", "gemini"]) {
  for (const direction of ["vi-ja", "ja-vi"]) {
    test(`${provider} grades ${direction} using canonical server source and reference`, async () => {
      const { api, calls } = route({ provider });
      const response = await api.POST(request({ direction, source: "forged source", reference: "forged reference" }));
      assert.equal(response.status, 200);
      assert.equal(grading.gradeTotal(response.body.grade), 8);
      const payload = JSON.parse(provider === "claude" ? calls[0].messages[0].content : calls[0].contents);
      assert.equal(payload.source, direction === "vi-ja" ? translationLessons[0].translation[0] : grading.plainJapanese(translationLessons[0].sentences[0]));
      assert.equal(payload.reference, direction === "vi-ja" ? grading.plainJapanese(translationLessons[0].sentences[0]) : translationLessons[0].translation[0]);
    });
  }
}

test("Missing config, unknown lesson, malformed request and rate limit never call providers", async () => {
  for (const [config, req, status] of [
    [{ key: "" }, request(), 503], [{ allowed: false }, request(), 429],
    [{}, request({ lessonId: "missing" }), 404], [{}, request({ sentenceIndex: 100 }), 404],
    [{}, request({ answer: " " }), 400], [{}, { json: async () => { throw new Error("bad json"); } }, 400],
  ]) {
    const { api, calls } = route(config);
    const response = await api.POST(req);
    assert.equal(response.status, status);
    assert.equal(calls.length, 0);
    assert.equal(response.body.grade, undefined);
  }
});

test("Provider errors and invalid scores return no invented grade or private error", async () => {
  for (const config of [{ fail: true }, { output: "{}" }, { output: JSON.stringify({ ...valid, meaning: 20 }) }]) {
    const { api } = route(config);
    const response = await api.POST(request());
    assert.equal(response.status, 502);
    assert.equal(response.body.grade, undefined);
    assert.ok(!JSON.stringify(response.body).includes("secret-provider-error"));
  }
});

test("JSON sample, single-object and multiple-lesson imports are usable", () => {
  const sample = imports.exampleTranslationLesson;
  assert.equal(imports.parseLessonImport(JSON.stringify(sample))[0].id, sample.id);
  const multiple = [sample, { ...sample, id: "bai-thu-hai" }];
  assert.equal(imports.parseLessonImport(JSON.stringify(multiple)).length, 2);
  assert.equal(imports.readCustomLessons(JSON.stringify(multiple), []).length, 2);
  assert.equal(imports.readCustomLessons(null, []).length, 0);
  const short = { ...sample, sentences: ["テストです。"], translation: ["Đây là bài kiểm tra."], grammar: [], vocabulary: [], explanations: [] };
  assert.equal(imports.parseLessonImport(JSON.stringify(short)).length, 1);
});

test("Import rejects malformed JSON, mismatched translations, broken furigana and invalid fields", () => {
  const sample = imports.exampleTranslationLesson;
  for (const patch of [
    { translation: ["Một câu"] }, { sentences: [] }, { sentences: Array(51).fill("日本語") },
    { sentences: ["[漢字|]", ...sample.sentences.slice(1)] }, { id: "không có khoảng trắng" },
    { title: " " }, { topic: "Tất cả" }, { level: "N9" }, { vocabulary: [["chỉ một trường"]] }, { extra: "typo" },
  ]) assert.throws(() => imports.parseLessonImport(JSON.stringify({ ...sample, ...patch })));
  for (const raw of ["{}", "null", "[]", '{"id":"abc",}', "```json\n{}\n```", "x".repeat(150001)]) {
    assert.throws(() => imports.parseLessonImport(raw));
  }
});

test("Duplicate IDs cannot overwrite built-in or saved lessons, including within a batch", () => {
  const sample = imports.exampleTranslationLesson;
  assert.throws(() => imports.parseLessonImport(JSON.stringify(sample), [sample.id]));
  assert.throws(() => imports.parseLessonImport(JSON.stringify([sample, sample])));
  assert.throws(() => imports.readCustomLessons(JSON.stringify([sample, sample]), []));
  assert.throws(() => imports.readCustomLessons(JSON.stringify([sample]), [sample.id]));
  assert.throws(() => imports.readCustomLessons("invalid", []));
});

for (const direction of ["vi-ja", "ja-vi"]) {
  test(`Custom JSON lesson can be graded in ${direction}`, async () => {
    const { api, calls } = route();
    const sample = imports.exampleTranslationLesson;
    const response = await api.POST(request({ lessonId: sample.id, customLesson: sample, direction }));
    assert.equal(response.status, 200);
    const payload = JSON.parse(calls[0].messages[0].content);
    assert.equal(payload.source, direction === "vi-ja" ? sample.translation[0] : grading.plainJapanese(sample.sentences[0]));
  });
}

test("Custom payload is validated and cannot override built-in server references", async () => {
  const sample = imports.exampleTranslationLesson;
  for (const patch of [
    { lessonId: "wrong-id", customLesson: sample },
    { lessonId: sample.id, customLesson: { ...sample, translation: [] } },
  ]) {
    const { api, calls } = route();
    assert.equal((await api.POST(request(patch))).status, 400);
    assert.equal(calls.length, 0);
  }
  const { api, calls } = route();
  assert.equal((await api.POST(request({ customLesson: { ...sample, id: "kyoto-bus" } }))).status, 200);
  assert.equal(JSON.parse(calls[0].messages[0].content).source, translationLessons[0].translation[0]);
});
