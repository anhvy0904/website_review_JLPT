import fs from "fs";
import path from "path";

const files = ["n3-2021-12.json", "n3-2025-07.json", "n3-2025-12.json"];
let totalMissing = 0;
let totalChecked = 0;

for (const file of files) {
  const filePath = path.join(process.cwd(), "public/data/exams", file);
  if (!fs.existsSync(filePath)) {
    console.error(`File ${filePath} does not exist!`);
    continue;
  }
  const exam = JSON.parse(fs.readFileSync(filePath, "utf8"));
  console.log(`\n================ ${file} (${exam.id}) ================`);
  console.log(`Title: ${exam.title}`);
  console.log(`Status: ${exam.status}, Questions: ${exam.questions.length}, Passages: ${exam.passages?.length || 0}`);

  // 1. Progress stats
  const questionsWithText = exam.questions.filter((q) => q.questionText && q.questionText.trim().length > 0).length;
  const verifiedQuestions = exam.questions.filter((q) => q.review?.status === "verified").length;
  const passagesWithText = (exam.passages || []).filter((p) => p.text && p.text.trim().length > 0).length;
  console.log(`Progress:
  - Questions with text: ${questionsWithText}/${exam.questions.length}
  - Verified questions: ${verifiedQuestions}/${exam.questions.length}
  - Passages with text: ${passagesWithText}/${exam.passages?.length || 0}`);

  // 2. Check question images
  for (const q of exam.questions) {
    if (q.questionImagePath) {
      totalChecked++;
      const fullPath = path.join(process.cwd(), "public", q.questionImagePath.replace(/^\//, ""));
      if (!fs.existsSync(fullPath)) {
        console.error(`  [MISSING] Question ${q.id} image: ${q.questionImagePath}`);
        totalMissing++;
      }
    }
  }

  // 3. Check passage images
  for (const p of exam.passages || []) {
    if (p.imagePath) {
      totalChecked++;
      const fullPath = path.join(process.cwd(), "public", p.imagePath.replace(/^\//, ""));
      if (!fs.existsSync(fullPath)) {
        console.error(`  [MISSING] Passage ${p.id} image: ${p.imagePath}`);
        totalMissing++;
      }
    }
    for (const addPath of p.additionalImagePaths || []) {
      totalChecked++;
      const fullPath = path.join(process.cwd(), "public", addPath.replace(/^\//, ""));
      if (!fs.existsSync(fullPath)) {
        console.error(`  [MISSING] Passage ${p.id} additional image: ${addPath}`);
        totalMissing++;
      }
    }
  }
}

console.log(`\n--------------------------------------------`);
console.log(`Total images checked: ${totalChecked}. Total missing: ${totalMissing}`);

