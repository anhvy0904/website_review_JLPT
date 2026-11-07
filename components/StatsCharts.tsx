"use client";

import React, { useEffect, useState } from "react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  BarChart,
  Bar,
  Cell,
} from "recharts";

export interface SectionStatItem {
  name: string;
  percent: number;
  correct: number;
  total: number;
  scaledScore?: number;
  maxScaledScore?: number;
}

interface StatsChartsProps {
  historyData: Array<{
    attemptNumber: number;
    title: string;
    percent: number;
    date: string;
    scaledScore?: number;
    maxScaledScore?: number;
  }>;
  sectionData: SectionStatItem[];
}

export function StatsCharts({ historyData, sectionData }: StatsChartsProps) {
  const [mounted, setMounted] = useState(false);
  const [skillChartMode, setSkillChartMode] = useState<"percent" | "jlpt">("percent");

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <div className="h-64 flex items-center justify-center text-slate-400">Đang tải biểu đồ...</div>;
  }

  const sectionColors = ["#1B5E20", "#4F46E5", "#7C3AED"];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Biểu đồ tiến độ % theo thời gian */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between">
        <div className="mb-4">
          <div className="flex items-center justify-between gap-2">
            <h3 className="font-bold text-slate-900 text-base">Tiến độ điểm chính xác qua các lần làm</h3>
            <span className="text-[11px] font-semibold text-slate-400 bg-slate-100 px-2.5 py-0.5 rounded-full">
              Lịch sử bài thi
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">Theo dõi sự tiến bộ qua từng lượt luyện tập</p>
        </div>

        {historyData.length === 0 ? (
          <div className="h-56 flex items-center justify-center text-slate-400 text-sm">
            Chưa có đủ dữ liệu bài làm để hiển thị biểu đồ
          </div>
        ) : (
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={historyData} margin={{ top: 10, right: 15, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="attemptNumber" tick={{ fontSize: 12 }} stroke="#94a3b8" />
                <YAxis domain={[0, 100]} tick={{ fontSize: 12 }} stroke="#94a3b8" unit="%" />
                <Tooltip
                  formatter={(val: number, name: string, item: any) => {
                    const extra = item?.payload?.scaledScore !== undefined
                      ? ` • Quy đổi: ${item.payload.scaledScore}/${item.payload.maxScaledScore}đ`
                      : "";
                    return [`${val}%${extra}`, "Tỉ lệ đúng"];
                  }}
                  labelFormatter={(lbl, items) => {
                    const first = items?.[0]?.payload;
                    return first?.title ? `${first.title} (Lần #${lbl})` : `Lần làm #${lbl}`;
                  }}
                  contentStyle={{ borderRadius: "12px", border: "1px solid #e2e8f0" }}
                />
                <Line
                  type="monotone"
                  dataKey="percent"
                  stroke="#1B5E20"
                  strokeWidth={3}
                  dot={{ r: 5, fill: "#1B5E20", strokeWidth: 2, stroke: "#fff" }}
                  activeDot={{ r: 7 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      {/* Biểu đồ theo kỹ năng (Hỗ trợ 2 chế độ: % chính xác & Điểm quy đổi JLPT) */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h3 className="font-bold text-slate-900 text-base">Năng lực theo từng kỹ năng</h3>
            <p className="text-xs text-slate-500 mt-0.5">
              {skillChartMode === "percent"
                ? "Tỷ lệ % chính xác (Từ vựng, Ngữ pháp, Đọc hiểu)"
                : "Điểm trung bình ước tính theo thang JLPT (Từ vựng /30, Ngữ pháp /30, Đọc hiểu /60)"}
            </p>
          </div>

          {/* Toggle Button between Percent & JLPT Scaled Score */}
          <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-xl text-xs font-bold">
            <button
              type="button"
              onClick={() => setSkillChartMode("percent")}
              className={`px-3 py-1 rounded-lg transition-all ${
                skillChartMode === "percent"
                  ? "bg-white text-slate-900 shadow-xs"
                  : "text-slate-500 hover:text-slate-800"
              }`}
            >
              Tỷ lệ %
            </button>
            <button
              type="button"
              onClick={() => setSkillChartMode("jlpt")}
              className={`px-3 py-1 rounded-lg transition-all ${
                skillChartMode === "jlpt"
                  ? "bg-[#1B5E20] text-white shadow-xs"
                  : "text-slate-500 hover:text-slate-800"
              }`}
            >
              Thang điểm JLPT
            </button>
          </div>
        </div>

        {sectionData.every((s) => s.total === 0) ? (
          <div className="h-56 flex items-center justify-center text-slate-400 text-sm">
            Chưa có dữ liệu theo kỹ năng
          </div>
        ) : (
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              {skillChartMode === "percent" ? (
                <BarChart data={sectionData} margin={{ top: 10, right: 15, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="name" tick={{ fontSize: 12 }} stroke="#94a3b8" />
                  <YAxis domain={[0, 100]} tick={{ fontSize: 12 }} stroke="#94a3b8" unit="%" />
                  <Tooltip
                    formatter={(val: number, name: string, item: any) => [
                      `${val}% (${item.payload.correct}/${item.payload.total} câu) • Thang JLPT: ${item.payload.scaledScore}/${item.payload.maxScaledScore}đ`,
                      "Tỉ lệ đúng",
                    ]}
                    contentStyle={{ borderRadius: "12px", border: "1px solid #e2e8f0" }}
                  />
                  <Bar dataKey="percent" radius={[6, 6, 0, 0]}>
                    {sectionData.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={sectionColors[index % sectionColors.length]} />
                    ))}
                  </Bar>
                </BarChart>
              ) : (
                <BarChart data={sectionData} margin={{ top: 10, right: 15, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="name" tick={{ fontSize: 12 }} stroke="#94a3b8" />
                  <YAxis domain={[0, 60]} tick={{ fontSize: 12 }} stroke="#94a3b8" unit="đ" />
                  <Tooltip
                    formatter={(val: number, name: string, item: any) => [
                      `${val} / ${item.payload.maxScaledScore} điểm (Đúng ${item.payload.percent}% • ${item.payload.correct}/${item.payload.total} câu)`,
                      "Điểm quy đổi JLPT",
                    ]}
                    contentStyle={{ borderRadius: "12px", border: "1px solid #e2e8f0" }}
                  />
                  <Bar dataKey="scaledScore" radius={[6, 6, 0, 0]}>
                    {sectionData.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={sectionColors[index % sectionColors.length]} />
                    ))}
                  </Bar>
                </BarChart>
              )}
            </ResponsiveContainer>
          </div>
        )}
      </div>
    </div>
  );
}
