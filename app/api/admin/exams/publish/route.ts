import { NextRequest, NextResponse } from "next/server";
import { examDetailSchema } from "@/lib/validation";
import fs from "fs";
import path from "path";
import { exec } from "child_process";
import { promisify } from "util";

const execAsync = promisify(exec);

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { exam } = body;

    if (!exam) {
      return NextResponse.json(
        { success: false, error: "Thiếu dữ liệu đề thi" },
        { status: 400 }
      );
    }

    // Force verified and published checks via Zod
    const validated = examDetailSchema.parse({
      ...exam,
      status: "published",
      source: {
        ...exam.source,
        reviewedByHuman: true,
      },
    });

    const examsDir = path.join(process.cwd(), "public", "data", "exams");
    if (!fs.existsSync(examsDir)) {
      fs.mkdirSync(examsDir, { recursive: true });
    }

    const filePath = path.join(examsDir, `${validated.id}.json`);
    fs.writeFileSync(filePath, JSON.stringify(validated, null, 2), "utf8");

    // Run sync script to rebuild index.json
    try {
      await execAsync("node scripts/sync-exams.mjs");
    } catch (syncErr: any) {
      console.warn("Cảnh báo khi chạy sync-exams:", syncErr.message);
    }

    return NextResponse.json({
      success: true,
      message: `Đã xuất bản thành công bộ đề ${validated.id}!`,
      examId: validated.id,
    });
  } catch (err: any) {
    console.error("Lỗi xuất bản đề:", err);
    return NextResponse.json(
      {
        success: false,
        error: err.issues?.[0]?.message || err.message || "Lỗi kiểm duyệt hoặc lưu đề",
        issues: err.issues,
      },
      { status: 400 }
    );
  }
}
