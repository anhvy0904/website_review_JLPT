import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const EXAMS_DIR = path.resolve(__dirname, "../public/data/exams");
const INDEX_FILE = path.join(EXAMS_DIR, "index.json");

console.log("🔍 [sync-exams] Đang rà soát thư mục đề thi:", EXAMS_DIR);

if (!fs.existsSync(EXAMS_DIR)) {
  fs.mkdirSync(EXAMS_DIR, { recursive: true });
}

const files = fs.readdirSync(EXAMS_DIR).filter((f) => f.endsWith(".json") && f !== "index.json");

if (files.length === 0) {
  console.log("ℹ️ [sync-exams] Chưa có file đề nào. Tạo index.json rỗng.");
  fs.writeFileSync(INDEX_FILE, JSON.stringify([], null, 2), "utf8");
  process.exit(0);
}

let hasError = false;
const indexList = [];

for (const file of files) {
  const filePath = path.join(EXAMS_DIR, file);
  console.log(`\n📄 Đang kiểm tra: ${file}`);

  let examData;
  try {
    const raw = fs.readFileSync(filePath, "utf8");
    examData = JSON.parse(raw);
  } catch (err) {
    console.error(`❌ [${file}] Lỗi cú pháp JSON: ${err.message}`);
    hasError = true;
    continue;
  }

  // Schema validations
  const errors = [];

  if (examData.schemaVersion !== "1.0.0") {
    errors.push(`schemaVersion không hợp lệ (phải là "1.0.0", hiện tại: ${examData.schemaVersion})`);
  }
  if (!examData.id || typeof examData.id !== "string") {
    errors.push("Thiếu id hợp lệ");
  }
  if (examData.level !== "N3") {
    errors.push(`level phải là "N3", hiện tại: ${examData.level}`);
  }
  if (!["draft", "published"].includes(examData.status)) {
    errors.push(`status phải là "draft" hoặc "published", hiện tại: ${examData.status}`);
  }
  if (!examData.settings || typeof examData.settings.timeLimitMinutes !== "number") {
    errors.push("Thiếu settings.timeLimitMinutes");
  }
  if (!Array.isArray(examData.questions)) {
    errors.push("questions phải là một mảng");
  } else {
    if (examData.questionCount !== examData.questions.length) {
      errors.push(`questionCount (${examData.questionCount}) không khớp số câu thực tế (${examData.questions.length})`);
    }

    const passageMap = new Set();
    if (Array.isArray(examData.passages)) {
      for (const p of examData.passages) {
        if (!p.id) errors.push("Có passage thiếu id");
        passageMap.add(p.id);
      }
    }

    const questionIds = new Set();
    examData.questions.forEach((q, idx) => {
      const qPrefix = `Câu ${q.number || idx + 1} (id: ${q.id || "không có"})`;

      if (!q.id) {
        errors.push(`${qPrefix}: Thiếu id câu hỏi`);
      } else if (questionIds.has(q.id)) {
        errors.push(`${qPrefix}: Trùng lặp id câu hỏi "${q.id}"`);
      } else {
        questionIds.add(q.id);
      }

      if (!["vocabulary", "grammar", "reading"].includes(q.section)) {
        errors.push(`${qPrefix}: section không hợp lệ ("${q.section}")`);
      }

      if (!q.questionText || typeof q.questionText !== "string") {
        errors.push(`${qPrefix}: Thiếu nội dung câu hỏi questionText`);
      }

      if (!Array.isArray(q.options) || q.options.length < 2) {
        errors.push(`${qPrefix}: options phải có ít nhất 2 lựa chọn`);
      } else {
        const optionIds = q.options.map((o) => String(o.id));
        if (!optionIds.includes(String(q.correctOptionId))) {
          errors.push(`${qPrefix}: correctOptionId "${q.correctOptionId}" không nằm trong danh sách options [${optionIds.join(", ")}]`);
        }

        // Kiểm tra giải thích cho từng lựa chọn
        if (!q.explanation || !q.explanation.optionReasonsVi) {
          errors.push(`${qPrefix}: Thiếu explanation.optionReasonsVi`);
        } else {
          for (const optId of optionIds) {
            if (!q.explanation.optionReasonsVi[optId]) {
              errors.push(`${qPrefix}: Thiếu giải thích optionReasonsVi cho lựa chọn ID "${optId}"`);
            }
          }
        }
      }

      // Kiểm tra passageId
      if (q.passageId && !passageMap.has(q.passageId)) {
        errors.push(`${qPrefix}: passageId "${q.passageId}" không tồn tại trong danh sách passages`);
      }

      // Với đề published, cấm câu có review.status !== "verified"
      if (examData.status === "published") {
        if (!q.review || q.review.status !== "verified") {
          errors.push(`${qPrefix}: Đề published nhưng câu hỏi chưa được verified (status: ${q.review?.status || "chưa có"})`);
        }
      }
    });
  }

  if (errors.length > 0) {
    console.error(`❌ [${file}] Phát hiện ${errors.length} lỗi kiểm tra:`);
    errors.forEach((e) => console.error(`   - ${e}`));
    hasError = true;
    continue;
  }

  console.log(`✅ [${file}] Hợp lệ! Số câu: ${examData.questions.length}, Trạng thái: ${examData.status}`);

  // Tính thống kê cho index
  const sectionCounts = { vocabulary: 0, grammar: 0, reading: 0 };
  const subtypesSet = new Set();
  const tagsSet = new Set();

  for (const q of examData.questions) {
    if (sectionCounts[q.section] !== undefined) {
      sectionCounts[q.section]++;
    }
    if (q.subtype) subtypesSet.add(q.subtype);
    if (Array.isArray(q.tags)) {
      q.tags.forEach((t) => tagsSet.add(t));
    }
  }

  indexList.push({
    id: examData.id,
    title: examData.title,
    description: examData.description,
    level: examData.level,
    status: examData.status,
    questionCount: examData.questions.length,
    timeLimitMinutes: examData.settings.timeLimitMinutes,
    allowedModes: examData.settings.allowedModes || ["practice", "exam"],
    sectionCounts,
    subtypes: Array.from(subtypesSet),
    tags: Array.from(tagsSet),
    lastUpdated: new Date().toISOString().split("T")[0],
  });
}

if (hasError) {
  console.error("\n❌ Đồng bộ thất bại do có dữ liệu đề không hợp lệ! Vui lòng sửa các lỗi trên.");
  process.exit(1);
}

// Lưu index.json
fs.writeFileSync(INDEX_FILE, JSON.stringify(indexList, null, 2), "utf8");
console.log(`\n🎉 [sync-exams] Thành công! Đã tạo index.json với ${indexList.length} bộ đề.`);
