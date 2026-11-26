import { NextRequest, NextResponse } from "next/server";
import { examDetailSchema } from "@/lib/validation";
import { verifyAdminRequest } from "@/lib/auth";
import fs from "fs";
import path from "path";
import { exec } from "child_process";
import { promisify } from "util";

const execAsync = promisify(exec);

export async function POST(req: NextRequest) {
  try {
    const authResult = verifyAdminRequest(req);
    if (!authResult.authorized) {
      return NextResponse.json(
        { success: false, error: authResult.error || "Không có quyền Quản trị viên" },
        { status: 401 }
      );
    }

    const body = await req.json();
    const { exam } = body;

    if (!exam) {
      return NextResponse.json(
        { success: false, error: "Thiếu dữ liệu đề thi" },
        { status: 400 }
      );
    }

    // Validate structure (draft allowed)
    const validated = examDetailSchema.parse(exam);

    const examsDir = path.join(process.cwd(), "public", "data", "exams");
    if (!fs.existsSync(examsDir)) {
      fs.mkdirSync(examsDir, { recursive: true });
    }

    const filePath = path.join(examsDir, `${validated.id}.json`);
    fs.writeFileSync(filePath, JSON.stringify(validated, null, 2), "utf8");

    // Re-sync index.json
    try {
      await execAsync("node scripts/sync-exams.mjs");
    } catch (syncErr: any) {
      console.warn("Cảnh báo khi chạy sync-exams:", syncErr.message);
    }

    return NextResponse.json({
      success: true,
      message: `Đã lưu thành công bản nháp bộ đề ${validated.id}!`,
      examId: validated.id,
    });
  } catch (err: any) {
    console.error("Lỗi lưu đề:", err);
    return NextResponse.json(
      {
        success: false,
        error: err.issues?.[0]?.message || err.message || "Lỗi lưu đề",
        issues: err.issues,
      },
      { status: 400 }
    );
  }
}

