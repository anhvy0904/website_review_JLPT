import { test, describe } from "node:test";
import assert from "node:assert/strict";

// Helper functions mirroring lib/auth.ts and lib/gemini.ts logic
function redactSecrets(text) {
  if (!text) return text;
  return text.replace(/AIzaSy[A-Za-z0-9_-]{33}/g, "AIzaSy[REDACTED_API_KEY]");
}

function parseGeminiError(err) {
  const errMsg = String(err?.message || err || "");
  const status = Number(err?.status || err?.statusCode || 500);

  if (errMsg.includes("Chưa cấu hình GEMINI_API_KEY") || !errMsg) {
    return {
      code: "MISSING_API_KEY",
      message: "Chưa cấu hình GEMINI_API_KEY trong file .env.local hoặc giao diện Quản trị viên.",
      status: 400,
    };
  }

  if (
    status === 401 ||
    errMsg.includes("API key not valid") ||
    errMsg.includes("API_KEY_INVALID") ||
    errMsg.includes("invalid api key") ||
    errMsg.includes("API key expired")
  ) {
    return {
      code: "INVALID_API_KEY",
      message: "Google Gemini API Key không hợp lệ hoặc đã hết hạn. Vui lòng kiểm tra lại khóa API tại Google AI Studio.",
      status: 401,
    };
  }

  if (
    status === 429 ||
    errMsg.includes("RESOURCE_EXHAUSTED") ||
    errMsg.includes("quota") ||
    errMsg.includes("Rate limit exceeded")
  ) {
    return {
      code: "QUOTA_EXCEEDED",
      message: "Tài khoản đã vượt quá hạn mức sử dụng (Quota / Rate Limit) của Google Gemini API. Vui lòng nâng cấp gói hoặc thử lại sau vài phút.",
      status: 429,
    };
  }

  if (
    status === 404 ||
    errMsg.includes("NOT_FOUND") ||
    errMsg.includes("is not found for API version") ||
    errMsg.includes("is not supported")
  ) {
    return {
      code: "MODEL_NOT_FOUND",
      message: "Mô hình Gemini không tồn tại hoặc không được hỗ trợ trong phiên bản API này.",
      status: 404,
    };
  }

  return {
    code: "UNKNOWN_ERROR",
    message: `Lỗi kết nối Gemini: ${redactSecrets(errMsg)}`,
    status: status >= 400 && status < 600 ? status : 500,
  };
}

describe("Bảo mật & Cấu hình Gemini API (Phase 1)", () => {
  test("1. Che giấu API Key Google trong chuỗi thông báo lỗi (Redact Secrets)", () => {
    const rawError = "Lỗi xác thực với khóa: AIzaSyA1B2C3D4E5F6G7H8I9J0K1L2M3N4O5P6Q7";
    const redacted = redactSecrets(rawError);
    assert.strictEqual(redacted.includes("AIzaSyA1B2C3D4E5F6G7H8I9J0K1L2M3N4O5P6Q7"), false);
    assert.ok(redacted.includes("AIzaSy[REDACTED_API_KEY]"));
  });

  test("2. Nhận diện chính xác lỗi thiếu API Key", () => {
    const res = parseGeminiError(new Error("Chưa cấu hình GEMINI_API_KEY"));
    assert.strictEqual(res.code, "MISSING_API_KEY");
    assert.strictEqual(res.status, 400);
  });

  test("3. Phân loại lỗi API Key không hợp lệ (HTTP 401)", () => {
    const res = parseGeminiError(new Error("API key not valid. Please pass a valid API key."));
    assert.strictEqual(res.code, "INVALID_API_KEY");
    assert.strictEqual(res.status, 401);
  });

  test("4. Phân loại lỗi hết hạn mức / Rate limit (HTTP 429)", () => {
    const res = parseGeminiError({ status: 429, message: "RESOURCE_EXHAUSTED: quota exceeded" });
    assert.strictEqual(res.code, "QUOTA_EXCEEDED");
    assert.strictEqual(res.status, 429);
  });

  test("5. Phân loại lỗi Model không tồn tại hoặc không cấp quyền (HTTP 404)", () => {
    const res = parseGeminiError(new Error("models/gemini-unsupported-model is not found for API version v1beta"));
    assert.strictEqual(res.code, "MODEL_NOT_FOUND");
    assert.strictEqual(res.status, 404);
  });
});
