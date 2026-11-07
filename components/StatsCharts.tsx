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

interface StatsChartsProps {
  historyData: Array<{
    attemptNumber: number;
    title: string;
    percent: number;
    date: string;
  }>;
  sectionData: Array<{
    name: string;
    percent: number;
    correct: number;
    total: number;
  }>;
}

export function StatsCharts({ historyData, sectionData }: StatsChartsProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <div className="h-64 flex items-center justify-center text-slate-400">Đang tải biểu đồ...</div>;
  }

  const sectionColors = ["#3B82F6", "#8B5CF6", "#10B981"];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Biểu đồ tiến độ % theo thời gian */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <div className="mb-4">
          <h3 className="font-bold text-slate-900 text-base">Tiến độ % điểm chính xác qua các lần làm</h3>
          <p className="text-xs text-slate-500 mt-0.5">Theo dõi sự tiến bộ qua từng lượt luyện tập</p>
        </div>

        {historyData.length === 0 ? (
          <div className="h-56 flex items-center justify-center text-slate-400 text-sm">
            Chưa có đủ dữ liệu bài làm để hiển thị biểu đồ
          </div>
        ) : (
          <div className="h-60 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={historyData} margin={{ top: 10, right: 15, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="attemptNumber" tick={{ fontSize: 12 }} stroke="#94a3b8" />
                <YAxis domain={[0, 100]} tick={{ fontSize: 12 }} stroke="#94a3b8" unit="%" />
                <Tooltip
                  formatter={(val: number) => [`${val}%`, "Tỉ lệ đúng"]}
                  labelFormatter={(lbl) => `Lần làm #${lbl}`}
                  contentStyle={{ borderRadius: "12px", border: "1px solid #e2e8f0" }}
                />
                <Line
                  type="monotone"
                  dataKey="percent"
                  stroke="#4F46E5"
                  strokeWidth={3}
                  dot={{ r: 5, fill: "#4F46E5", strokeWidth: 2, stroke: "#fff" }}
                  activeDot={{ r: 7 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      {/* Biểu đồ % theo kỹ năng */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <div className="mb-4">
          <h3 className="font-bold text-slate-900 text-base">Tỷ lệ chính xác theo kỹ năng</h3>
          <p className="text-xs text-slate-500 mt-0.5">So sánh phong độ giữa Từ vựng, Ngữ pháp và Đọc hiểu</p>
        </div>

        {sectionData.every((s) => s.total === 0) ? (
          <div className="h-56 flex items-center justify-center text-slate-400 text-sm">
            Chưa có dữ liệu theo kỹ năng
          </div>
        ) : (
          <div className="h-60 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={sectionData} margin={{ top: 10, right: 15, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="name" tick={{ fontSize: 12 }} stroke="#94a3b8" />
                <YAxis domain={[0, 100]} tick={{ fontSize: 12 }} stroke="#94a3b8" unit="%" />
                <Tooltip
                  formatter={(val: number, name: string, item: any) => [
                    `${val}% (${item.payload.correct}/${item.payload.total} câu)`,
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
            </ResponsiveContainer>
          </div>
        )}
      </div>
    </div>
  );
}

