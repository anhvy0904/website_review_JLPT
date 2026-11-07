# PROMPTS & QUY TRÌNH XÂY DỰNG HỆ THỐNG JLPT N3 PRACTICE HUB

Tài liệu này tổng hợp kiến trúc kỹ thuật và hướng dẫn vận hành cho dự án **JLPT N3 Practice Hub** (Version 1.0).

---

## 1. Cấu Trúc Dự Án Đã Xây Dựng

```text
jlpt-n3-practice/
├── app/
│   ├── layout.tsx                  # Layout chính (Navbar, Footer, Font Noto Sans JP)
│   ├── globals.css                 # Tailwind CSS & Typography Nhật - Việt
│   ├── page.tsx                    # Trang chủ (Hero, KPI cá nhân, đề nổi bật, tiếp tục bài dang dở)
│   ├── exams/
│   │   ├── page.tsx                # Kho đề thi (Bộ lọc theo kỹ năng, tìm kiếm, sắp xếp)
│   │   └── [examId]/page.tsx       # Chi tiết đề & chọn chế độ (Luyện tập / Thi thử)
│   ├── practice/[examId]/page.tsx  # Giao diện làm bài thi (Timer, Auto-save, Passage viewer, Navigator)
│   ├── results/[attemptId]/page.tsx# Kết quả bài thi (Raw percent score, Section stats, Xem lại lời giải)
│   ├── dashboard/page.tsx          # Bảng thống kê cá nhân (Recharts biểu đồ tiến độ, điểm yếu, lịch sử)
│   └── review/page.tsx             # Sổ tay ôn câu sai & câu đã ghim (Quick Drill)
├── components/
│   ├── Navbar.tsx                  # Thanh điều hướng responsive
│   ├── Footer.tsx                  # Chân trang & ghi chú bản quyền/phạm vi
│   ├── FuriganaRuby.tsx            # Component hiển thị Ruby annotation an toàn
│   ├── PassageViewer.tsx           # Khu vực hiển thị bài đọc hiểu chuẩn typography Nhật
│   ├── ExamNavigator.tsx           # Bảng số câu hỏi (đã làm, ghim, đúng/sai)
│   ├── QuestionCard.tsx            # Thẻ câu hỏi (4 options, phím tắt 1-4/F/Enter, lock đáp án sau khi check)
│   ├── AnswerExplanation.tsx       # Giải thích chi tiết tiếng Việt (lý do đúng, phân tích từng distractor, từ vựng, ngữ pháp)
│   ├── SurveyModal.tsx             # Form khảo sát sau bài thi (độ khó 1-5, hữu ích 1-5, góp ý)
│   └── StatsCharts.tsx             # Biểu đồ Recharts (% theo lần làm & theo kỹ năng)
├── lib/
│   ├── types.ts                    # TypeScript Data Contracts (Schema 1.0.0)
│   ├── exams.ts                    # Loader đọc dữ liệu đề thi trên Server & Client
│   ├── scoring.ts                  # Bộ tính điểm raw percent & thống kê section/subtype
│   ├── storage.ts                  # LocalStorage Manager version jlptn3:v1:attempts (hỗ trợ auto-save, survey, bookmark)
│   └── utils.ts                    # Utility functions (cn, formatTime, formatDate)
├── public/data/exams/
│   ├── index.json                  # Index tổng hợp tự sinh bởi sync script
│   ├── n3-demo-001.json            # Đề thi mẫu số 01 (Tổng hợp 5 câu chuẩn N3)
│   └── n3-2026-set-001.json        # Đề thi thực chiến số 02 (4 câu chuyên sâu)
├── scripts/
│   └── sync-exams.mjs              # Script tự động rà soát, validate và tạo index.json
├── exam-template.json              # File mẫu JSON chuẩn 1.0.0 để sao chép
├── PROMPT_CONVERT_EXAM_TO_JSON.md   # Prompt chuyển đổi PDF/Word/ảnh thành JSON qua AI
└── package.json
```

---

## 2. Các Lệnh Vận Hành

```bash
# 1. Chạy môi trường phát triển (Development)
npm run dev

# 2. Rà soát & đồng bộ các file đề trong public/data/exams/
npm run exams:sync

# 3. Biên dịch bản sản xuất (Production Build)
npm run build

# 4. Khởi chạy bản sản xuất
npm run start
```

---

## 3. Quy Trình Thêm Đề Mới (Data-Driven Workflow)

1. **Chuẩn bị nguồn đề**: Có file PDF, Word hoặc ảnh chụp đề thi JLPT N3.
2. **Trích xuất JSON qua AI**:
   - Mở `PROMPT_CONVERT_EXAM_TO_JSON.md`.
   - Copy prompt và dán kèm nội dung đề thi vào ChatGPT / Claude.
3. **Lưu file**:
   - Lưu file JSON vào thư mục `public/data/exams/[ma-de].json` (ví dụ: `n3-2026-set-002.json`).
4. **Đồng bộ hóa**:
   - Chạy `npm run exams:sync`.
   - Script sẽ tự động kiểm tra cú pháp, xác minh xem mọi options đã có lời giải hay chưa, kiểm tra `passageId`, và cập nhật file `public/data/exams/index.json`.
5. **Triển khai**: Đề thi mới sẽ tự động xuất hiện trên giao diện website mà không cần chỉnh sửa bất kỳ dòng mã nào.

