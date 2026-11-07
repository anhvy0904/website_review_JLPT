import { NextRequest } from "next/server";

// Simple in-memory rate limiter per IP address
interface RateLimitRecord {
  count: number;
  resetAt: number;
}

const rateLimitStore = new Map<string, RateLimitRecord>();

/**
 * Kiểm tra quyền Quản trị viên dựa trên Header x-admin-secret hoặc Authorization Bearer.
 * Giá trị cấu hình trong ADMIN_SECRET (mặc định 'admin123' cho môi trường dev).
 */
export function verifyAdminRequest(req: NextRequest): { authorized: boolean; error?: string } {
  const adminSecret = process.env.ADMIN_SECRET || "admin123";
  
  const headerSecret = req.headers.get("x-admin-secret");
  const authHeader = req.headers.get("authorization");
  const bearerSecret = authHeader?.startsWith("Bearer ") ? authHeader.substring(7).trim() : null;

  const providedSecret = headerSecret || bearerSecret;

  if (!providedSecret || providedSecret !== adminSecret) {
    return {
      authorized: false,
      error: "Yêu cầu quyền Quản trị viên! Vui lòng cung cấp mã bí mật Admin hợp lệ (Header x-admin-secret hoặc Bearer token).",
    };
  }

  return { authorized: true };
}

/**
 * Kiểm tra giới hạn tốc độ (Rate Limit) để bảo vệ tài nguyên và ngân sách API.
 * Mặc định: 20 requests / phút cho các tác vụ AI nặng, 60 requests / phút cho health check.
 */
export function checkRateLimit(
  req: NextRequest,
  actionKey: string = "default",
  maxRequests: number = 20,
  windowMs: number = 60000
): { allowed: boolean; remaining: number; resetInSeconds: number } {
  const ip =
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    req.headers.get("x-real-ip") ||
    "127.0.0.1";

  const key = `${actionKey}:${ip}`;
  const now = Date.now();
  const record = rateLimitStore.get(key);

  if (!record || now > record.resetAt) {
    rateLimitStore.set(key, { count: 1, resetAt: now + windowMs });
    return { allowed: true, remaining: maxRequests - 1, resetInSeconds: Math.ceil(windowMs / 1000) };
  }

  if (record.count >= maxRequests) {
    const resetInSeconds = Math.max(1, Math.ceil((record.resetAt - now) / 1000));
    return { allowed: false, remaining: 0, resetInSeconds };
  }

  record.count += 1;
  const resetInSeconds = Math.max(1, Math.ceil((record.resetAt - now) / 1000));
  return { allowed: true, remaining: maxRequests - record.count, resetInSeconds };
}

/**
 * Xóa bỏ API Key khỏi chuỗi log/lỗi để đảm bảo an toàn bí mật.
 */
export function redactSecrets(text: string): string {
  if (!text) return text;
  // Mask Claude/Anthropic keys (thường bắt đầu bằng sk-ant-...)
  let redacted = text.replace(/sk-ant-[A-Za-z0-9_-]{20,}/g, "sk-ant-[REDACTED_API_KEY]");
  // Mask Gemini/Google API keys (thường bắt đầu bằng AIzaSy...)
  redacted = redacted.replace(/AIzaSy[A-Za-z0-9_-]{33}/g, "AIzaSy[REDACTED_API_KEY]");
  return redacted;
}

