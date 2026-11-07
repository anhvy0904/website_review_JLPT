import { NextRequest, NextResponse } from "next/server";
import { testGeminiConnection } from "@/lib/gemini";
import { verifyAdminRequest, checkRateLimit, redactSecrets } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    // 1. Xác thực quyền Quản trị viên
    const authResult = verifyAdminRequest(req);
    if (!authResult.authorized) {
      return NextResponse.json(
        {
          success: false,
          error: authResult.error || "Không có quyền Quản trị viên",
          code: "UNAUTHORIZED",
        },
        { status: 401 }
      );
    }

    // 2. Giới hạn tốc độ kiểm tra (Rate Limit)
    const rateCheck = checkRateLimit(req, "ai-test-connection", 30, 60000);
    if (!rateCheck.allowed) {
      return NextResponse.json(
        {
          success: false,
          error: `Bạn đang kiểm tra kết nối quá nhanh. Vui lòng thử lại sau ${rateCheck.resetInSeconds} giây.`,
          code: "RATE_LIMITED",
        },
        { status: 429 }
      );
    }

    // 3. Đọc dữ liệu tùy chọn (customApiKey, model) từ body nếu có
    let customApiKey: string | undefined;
    let model: string | undefined;

    try {
      const body = await req.json();
      if (body.customApiKey && typeof body.customApiKey === "string") {
        customApiKey = body.customApiKey.trim();
      }
      if (body.model && typeof body.model === "string") {
        model = body.model.trim();
      }
    } catch {
      // Body rỗng -> sử dụng cấu hình mặc định từ file .env.local
    }

    // 4. Thực hiện kiểm tra kết nối tới Gemini
    const result = await testGeminiConnection({ customApiKey, model });

    if (!result.success) {
      return NextResponse.json(
        {
          success: false,
          message: result.message,
          model: result.model,
          latencyMs: result.latencyMs,
          keySource: result.keySource,
          errorInfo: result.errorInfo,
        },
        { status: result.errorInfo?.status || 400 }
      );
    }

    return NextResponse.json({
      success: true,
      message: result.message,
      model: result.model,
      latencyMs: result.latencyMs,
      keySource: result.keySource,
    });
  } catch (err: any) {
    const rawError = String(err?.message || err);
    console.error("Lỗi API test-connection:", redactSecrets(rawError));

    return NextResponse.json(
      {
        success: false,
        error: "Lỗi hệ thống khi kiểm tra kết nối Gemini.",
        details: redactSecrets(rawError),
      },
      { status: 500 }
    );
  }
}
