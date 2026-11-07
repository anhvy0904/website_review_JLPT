import fs from "fs";
import path from "path";

const uploads = {
  moshi01: "C:/Users/ANHVY/.gemini/antigravity/brain/66264ed7-6bd1-4b37-8558-7870d163f53c/.user_uploaded/media_1794035427465_226e9b96.json",
  moshi02: "C:/Users/ANHVY/.gemini/antigravity/brain/66264ed7-6bd1-4b37-8558-7870d163f53c/.user_uploaded/media_1794035427476_7697b415.json",
  moshi03: "C:/Users/ANHVY/.gemini/antigravity/brain/66264ed7-6bd1-4b37-8558-7870d163f53c/.user_uploaded/media_1794035427479_8558b2e2.json",
};

const examsDir = path.resolve("public/data/exams");

// 1. Process Moshi 01
const data01 = JSON.parse(fs.readFileSync(uploads.moshi01, "utf8"));
fs.writeFileSync(path.join(examsDir, "n3-best-moshi-01.json"), JSON.stringify(data01, null, 2), "utf8");
console.log("Updated n3-best-moshi-01.json:", data01.questions.length, "questions");

// 2. Process Moshi 02
const data02 = JSON.parse(fs.readFileSync(uploads.moshi02, "utf8"));
// Fix Q35 where correctOptionId was null due to Excel typo "5"
const q35 = data02.questions.find((q) => q.number === 35 && q.section === "vocabulary");
if (q35 && q35.correctOptionId === null) {
  q35.correctOptionId = "3";
  q35.explanation.summaryVi = "Đáp án chuẩn xác: 3 (ấn/đè để cầm máu). Bảng Excel gốc ghi nhầm số 5.";
  q35.explanation.correctReasonVi = "おさえる (押さえる) có nghĩa là ấn/đè để cầm máu: 「ハンカチでしっかりおさえておいてください」(Hãy dùng khăn tay ấn chặt giữ lại để máu không chảy ra). Bảng đáp án Excel gốc ghi nhầm phím 5 (ngoài khoảng 1–4).";
  q35.explanation.optionReasonsVi = {
    "1": "SAI: Cần dùng 体から離さない (không rời người), không dùng おさえる.",
    "2": "SAI: Cõng trẻ trên lưng cần dùng おぶって / 背負って, không dùng おさえる.",
    "3": "ĐÚNG: おさえる (押さえる) nghĩa là ấn/đè chặt (dùng khăn tay ấn vết thương cầm máu). Bảng Excel ghi nhầm số 5.",
    "4": "SAI: Đi đón em ở sân bay cần dùng 迎えに行く, không dùng おさえる."
  };
  q35.review = {
    status: "verified",
    notes: "Nguồn PDF trang 7. Đáp án chuẩn ngữ nghĩa và ngữ cảnh: 3. Đã đính chính lỗi gõ phím số 5 trong file Excel."
  };
}
fs.writeFileSync(path.join(examsDir, "n3-best-moshi-02.json"), JSON.stringify(data02, null, 2), "utf8");
console.log("Created n3-best-moshi-02.json:", data02.questions.length, "questions");

// 3. Process Moshi 03
const data03 = JSON.parse(fs.readFileSync(uploads.moshi03, "utf8"));
fs.writeFileSync(path.join(examsDir, "n3-best-moshi-03.json"), JSON.stringify(data03, null, 2), "utf8");
console.log("Created n3-best-moshi-03.json:", data03.questions.length, "questions");

// 4. Ensure asset folders exist
for (const id of ["n3-best-moshi-01", "n3-best-moshi-02", "n3-best-moshi-03"]) {
  const assetDir = path.join(examsDir, "assets", id);
  if (!fs.existsSync(assetDir)) {
    fs.mkdirSync(assetDir, { recursive: true });
    fs.writeFileSync(path.join(assetDir, "README.md"), `# Assets cho bộ đề ${id}\n\nThư mục lưu trữ hình ảnh bài đọc WebP / PNG.\n`, "utf8");
  }
}

// 5. Update index.json
const indexPath = path.join(examsDir, "index.json");
const currentIndex = JSON.parse(fs.readFileSync(indexPath, "utf8"));

function buildIndexEntry(examData) {
  const sectionCounts = { vocabulary: 0, grammar: 0, reading: 0 };
  const subtypesSet = new Set();
  const tagsSet = new Set();

  examData.questions.forEach((q) => {
    if (sectionCounts[q.section] !== undefined) {
      sectionCounts[q.section]++;
    }
    if (q.subtype) subtypesSet.add(q.subtype);
    if (Array.isArray(q.tags)) {
      q.tags.forEach((t) => tagsSet.add(t));
    }
  });

  return {
    id: examData.id,
    title: examData.title,
    description: examData.description,
    level: examData.level || "N3",
    status: examData.status || "draft",
    questionCount: examData.questions.length,
    timeLimitMinutes: examData.settings?.timeLimitMinutes || 100,
    allowedModes: examData.settings?.allowedModes || ["practice", "exam"],
    sectionCounts,
    subtypes: Array.from(subtypesSet),
    tags: Array.from(tagsSet),
    lastUpdated: "2026-11-07"
  };
}

// Build entries for the 3 moshi exams
const moshi01Entry = buildIndexEntry(data01);
const moshi02Entry = buildIndexEntry(data02);
const moshi03Entry = buildIndexEntry(data03);

// Keep existing kanji exams
const kanjiReading = currentIndex.find((e) => e.id === "n3-kanji-reading-50");
const kanjiWriting = currentIndex.find((e) => e.id === "n3-kanji-writing-46");

const newIndex = [
  moshi01Entry,
  moshi02Entry,
  moshi03Entry,
];

if (kanjiReading) newIndex.push(kanjiReading);
if (kanjiWriting) newIndex.push(kanjiWriting);

fs.writeFileSync(indexPath, JSON.stringify(newIndex, null, 2), "utf8");
console.log("Updated index.json with", newIndex.length, "exams total!");

