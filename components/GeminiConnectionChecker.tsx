"use client";

import React, { useState } from "react";
import {
  Sparkles,
  ShieldCheck,
  AlertCircle,
  CheckCircle2,
  XCircle,
  Loader2,
  Clock,
  Cpu,
  KeyRound,
  RefreshCw,
  Lock,
} from "lucide-react";

interface ConnectionResult {
  success: boolean;
  message: string;
  model?: string;
  latencyMs?: number;
  keySource?: "env" | "custom";
  errorInfo?: {
    code: string;
    message: string;
    status: number;
  };
}

interface Props {
  customApiKey?: string;
  onApiKeyChange?: (key: string) => void;
  onConnectionSuccess?: (model: string) => void;
}

export function GeminiConnectionChecker({
  customApiKey = "",
  onApiKeyChange,
  onConnectionSuccess,
}: Props) {
  const [adminSecret, setAdminSecret] = useState(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("jlpt_admin_secret") || "admin123";
    }
    return "admin123";
  });

  const [isChecking, setIsChecking] = useState(false);
  const [testResult, setTestResult] = useState<ConnectionResult | null>(null);
  const [showAdminKeyInput, setShowAdminKeyInput] = useState(false);

  const handleSaveAdminSecret = (secret: string) => {
    setAdminSecret(secret);
    if (typeof window !== "undefined") {
      localStorage.setItem("jlpt_admin_secret", secret);
    }
  };

  const handleTestConnection = async () => {
    setIsChecking(true);
    setTestResult(null);

    try {
      const res = await fetch("/api/admin/ai/test-connection", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-admin-secret": adminSecret,
        },
        body: JSON.stringify({
          customApiKey: customApiKey.trim() || undefined,
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        setTestResult({
          success: false,
          message: data.message || data.error || "Không thể kết nối Google Gemini API",
          model: data.model,
          latencyMs: data.latencyMs,
          keySource: data.keySource,
          errorInfo: data.errorInfo || {
            code: data.code || "UNKNOWN_ERROR",
            message: data.error || "Lỗi không xác định",
            status: res.status,
          },
        });
      } else {
        setTestResult({
          success: true,
          message: data.message,
          model: data.model,
          latencyMs: data.latencyMs,
          keySource: data.keySource,
        });
        if (onConnectionSuccess && data.model) {
          onConnectionSuccess(data.model);
        }
      }
    } catch (err: any) {
      setTestResult({
        success: false,
        message: err.message || "Lỗi mạng hoặc không thể gọi tới API backend",
        errorInfo: {
          code: "NETWORK_ERROR",
          message: "Không thể gửi yêu cầu kiểm tra đến máy chủ Next.js",
          status: 503,
        },
      });
    } finally {
      setIsChecking(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded-3xl border border-slate-200/90 shadow-sm space-y-5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-2xl bg-purple-100 text-purple-700 flex items-center justify-center shrink-0">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900">
              Kiểm Tra Kết Nối Google Gemini API
            </h3>
            <p className="text-[11px] text-slate-500">
              Xác thực API Key, Model & Quyền Admin an toàn qua Backend
            </p>
          </div>
        </div>

        {/* Status indicator badge */}
        <div>
          {testResult === null && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-600">
              <span className="w-2 h-2 rounded-full bg-slate-400" />
              Chưa kiểm tra
            </span>
          )}
          {testResult?.success && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              Sẵn sàng kết nối
            </span>
          )}
          {testResult?.success === false && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-rose-50 text-rose-700 border border-rose-200">
              <span className="w-2 h-2 rounded-full bg-rose-500" />
              Lỗi kết nối
            </span>
          )}
        </div>
      </div>

      {/* Admin Secret & Custom Key settings accordion */}
      <div className="space-y-3 pt-1 text-xs">
        {onApiKeyChange && (
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <label className="font-semibold text-slate-700 flex items-center gap-1.5">
                <KeyRound className="w-3.5 h-3.5 text-slate-400" />
                <span>Gemini API Key (Tùy chọn ghi đè .env.local)</span>
              </label>
              {customApiKey && (
                <span className="text-[10px] text-emerald-600 font-bold bg-emerald-50 px-2 py-0.5 rounded-md">
                  Đang dùng Custom Key
                </span>
              )}
            </div>
            <input
              type="password"
              value={customApiKey}
              onChange={(e) => onApiKeyChange(e.target.value)}
              placeholder="Để trống nếu đã khai báo GEMINI_API_KEY trong .env.local"
              className="w-full p-2.5 rounded-xl border border-slate-200 text-xs font-mono focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-200 transition-all bg-slate-50/50"
            />
          </div>
        )}

        <div className="flex items-center justify-between pt-1">
          <button
            type="button"
            onClick={() => setShowAdminKeyInput(!showAdminKeyInput)}
            className="text-[11px] font-semibold text-slate-500 hover:text-slate-800 flex items-center gap-1 transition-colors"
          >
            <Lock className="w-3 h-3 text-slate-400" />
            <span>Mã bí mật Admin (x-admin-secret)</span>
            <span className="text-slate-400">({showAdminKeyInput ? "Ẩn" : "Hiện"})</span>
          </button>
        </div>

        {showAdminKeyInput && (
          <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200 space-y-1.5">
            <label className="text-[11px] font-bold text-slate-700 block">
              Mã bảo vệ API Quản trị viên:
            </label>
            <input
              type="password"
              value={adminSecret}
              onChange={(e) => handleSaveAdminSecret(e.target.value)}
              placeholder="admin123"
              className="w-full p-2 rounded-xl border border-slate-200 text-xs font-mono focus:outline-none focus:border-indigo-500"
            />
            <p className="text-[10px] text-slate-400">
              * Khớp với giá trị <code>ADMIN_SECRET</code> trong file <code>.env.local</code>.
            </p>
          </div>
        )}
      </div>

      {/* Test Connection Button */}
      <div className="pt-1">
        <button
          type="button"
          disabled={isChecking}
          onClick={handleTestConnection}
          className="w-full py-3 rounded-2xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 active:scale-[0.99] text-white font-bold text-xs shadow-sm flex items-center justify-center gap-2 disabled:opacity-60 transition-all"
        >
          {isChecking ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Đang gửi tín hiệu kiểm tra tới Google Gemini...</span>
            </>
          ) : (
            <>
              <RefreshCw className="w-4 h-4" />
              <span>Chạy Kiểm Tra Kết Nối Gemini (Admin Health Check)</span>
            </>
          )}
        </button>
      </div>

      {/* Result Card */}
      {testResult && (
        <div
          className={`p-4 rounded-2xl border text-xs space-y-2.5 transition-all ${
            testResult.success
              ? "bg-emerald-50/70 border-emerald-200 text-emerald-900"
              : "bg-rose-50/80 border-rose-200 text-rose-900"
          }`}
        >
          <div className="flex items-start gap-2.5">
            {testResult.success ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
            ) : (
              <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
            )}
            <div className="space-y-1 flex-1">
              <span className="font-bold block text-xs">
                {testResult.success
                  ? "Xác thực API thành công!"
                  : testResult.errorInfo?.code === "UNAUTHORIZED"
                  ? "Từ chối truy cập: Sai mã bí mật Admin"
                  : testResult.errorInfo?.code === "INVALID_API_KEY"
                  ? "API Key không hợp lệ hoặc đã hết hạn"
                  : testResult.errorInfo?.code === "QUOTA_EXCEEDED"
                  ? "Hết hạn mức gọi API (Quota Exceeded)"
                  : testResult.errorInfo?.code === "MODEL_NOT_FOUND"
                  ? "Mô hình Gemini không khả dụng"
                  : "Kiểm tra kết nối thất bại"}
              </span>
              <p className="leading-relaxed text-[11px] opacity-90">
                {testResult.message}
              </p>
            </div>
          </div>

          {/* Technical Specs on Success */}
          {testResult.success && (
            <div className="grid grid-cols-3 gap-2 pt-2 border-t border-emerald-200/60 text-[11px]">
              <div className="flex items-center gap-1.5 text-emerald-800">
                <Cpu className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span className="truncate">Model: {testResult.model}</span>
              </div>
              <div className="flex items-center gap-1.5 text-emerald-800">
                <Clock className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span>Độ trễ: {testResult.latencyMs}ms</span>
              </div>
              <div className="flex items-center gap-1.5 text-emerald-800">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span>
                  Nguồn: {testResult.keySource === "env" ? ".env.local" : "Custom Key"}
                </span>
              </div>
            </div>
          )}

          {/* Helpful Tips on Failure */}
          {!testResult.success && (
            <div className="pt-2 border-t border-rose-200/60 text-[11px] text-rose-800 space-y-1">
              <span className="font-semibold block">Gợi ý khắc phục:</span>
              <ul className="list-disc list-inside space-y-0.5 opacity-90">
                {testResult.errorInfo?.code === "MISSING_API_KEY" && (
                  <li>
                    Tạo file <code>.env.local</code> ở thư mục gốc dự án và thêm dòng:{" "}
                    <code>GEMINI_API_KEY=AIzaSy...</code>
                  </li>
                )}
                {testResult.errorInfo?.code === "INVALID_API_KEY" && (
                  <li>
                    Truy cập{" "}
                    <a
                      href="https://aistudio.google.com/app/apikey"
                      target="_blank"
                      rel="noreferrer"
                      className="underline font-bold text-rose-900"
                    >
                      Google AI Studio
                    </a>{" "}
                    để tạo API Key mới và kiểm tra lại trạng thái kích hoạt.
                  </li>
                )}
                {testResult.errorInfo?.code === "QUOTA_EXCEEDED" && (
                  <li>
                    Bạn đã chạm ngưỡng miễn phí (Free Tier Rate Limit). Hãy chờ 1-2 phút hoặc kích hoạt gói Pay-as-you-go trên Google Cloud console.
                  </li>
                )}
                {testResult.errorInfo?.code === "UNAUTHORIZED" && (
                  <li>
                    Kiểm tra lại mục <b>Mã bí mật Admin</b> ở trên, phải khớp với biến <code>ADMIN_SECRET</code> (mặc định là <code>admin123</code>).
                  </li>
                )}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
