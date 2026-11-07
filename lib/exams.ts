import { ExamDetail, ExamIndexItem } from "./types";

export async function getExamIndex(): Promise<ExamIndexItem[]> {
  if (typeof window === "undefined") {
    try {
      const fs = await import("fs");
      const path = await import("path");
      const filePath = path.join(process.cwd(), "public", "data", "exams", "index.json");
      if (fs.existsSync(filePath)) {
        const raw = fs.readFileSync(filePath, "utf8");
        return JSON.parse(raw);
      }
    } catch (err) {
      console.error("Lỗi khi đọc index.json trên server:", err);
    }
    return [];
  }

  try {
    const res = await fetch("/data/exams/index.json", { cache: "no-store" });
    if (!res.ok) throw new Error("Không tải được danh sách đề");
    return await res.json();
  } catch (err) {
    console.error("Lỗi khi fetch index.json trên client:", err);
    return [];
  }
}

export async function getExamById(examId: string): Promise<ExamDetail | null> {
  if (typeof window === "undefined") {
    try {
      const fs = await import("fs");
      const path = await import("path");
      const filePath = path.join(process.cwd(), "public", "data", "exams", `${examId}.json`);
      if (fs.existsSync(filePath)) {
        const raw = fs.readFileSync(filePath, "utf8");
        return JSON.parse(raw);
      }
    } catch (err) {
      console.error(`Lỗi khi đọc file đề ${examId}.json trên server:`, err);
    }
    return null;
  }

  try {
    const res = await fetch(`/data/exams/${examId}.json`, { cache: "no-store" });
    if (!res.ok) throw new Error(`Không tìm thấy đề ${examId}`);
    return await res.json();
  } catch (err) {
    console.error(`Lỗi khi fetch đề ${examId}:`, err);
    return null;
  }
}
