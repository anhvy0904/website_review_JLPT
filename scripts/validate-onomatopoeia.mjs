import fs from 'node:fs';
import vm from 'node:vm';
import { createRequire } from 'node:module';
import ts from 'typescript';

// Reuse the exact schema used by the page; this command never overwrites data.
const require = createRequire(import.meta.url);
const source = fs.readFileSync(new URL('../lib/onomatopoeia.ts', import.meta.url), 'utf8');
const compiled = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 } }).outputText;
const module = { exports: {} };
vm.runInNewContext(compiled, { require, module, exports: module.exports });
const file = process.argv[2];
if (!file) throw new Error('Usage: node scripts/validate-onomatopoeia.mjs <book.json>');
const book = module.exports.onomatopoeiaBookSchema.parse(JSON.parse(fs.readFileSync(file, 'utf8').replace(/^\uFEFF/, '')));
console.log(`JSON hợp lệ: ${book.sections.length} phần, ${book.entries.length} từ, ${book.quizzes.length} câu trắc nghiệm, ${book.dictations.length} bài nghe, ${book.exercises.length} bài điền từ.`);
