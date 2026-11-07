# JLPT N3 Practice Hub (Version 1.0)

Website luyện thi trắc nghiệm JLPT N3 chuyên sâu dành cho người Việt, thiết kế theo kiến trúc **Data-Driven**: thêm đề mới chỉ bằng việc thêm file JSON mà không cần viết lại mã nguồn giao diện.

---

## ✨ Điểm Nổi Bật

1. **Kiến Trúc Hoàn Toàn Data-Driven**:
   - Dữ liệu đề thi lưu dưới dạng JSON chuẩn Schema Version 1.0.0 tại `public/data/exams/`.
   - Script tự động `npm run exams:sync` rà soát, kiểm tra chất lượng đề (đáp án đúng, giải thích distractors, liên kết bài đọc) và tự tạo `index.json`.

2. **Hai Chế Độ Luyện Thi Chuyên Nghiệp**:
   - **Chế độ Luyện tập (Practice)**: Kiểm tra ngay sau mỗi câu, hiển thị đầy đủ lời giải, dịch nghĩa tiếng Việt, bảng từ vựng (kèm Ruby furigana), mẫu ngữ pháp và mẹo thi. Khóa đáp án sau khi kiểm tra để bảo toàn tính nhất quán.
   - **Chế độ Thi thử (Exam)**: Đồng hồ bấm giờ đếm ngược, tự động nộp bài khi hết giờ, ẩn hoàn toàn đáp án trong lúc làm, hỗ trợ gắn cờ câu hỏi và cảnh báo trước khi nộp.

3. **Chống Lộ Đáp Án Kanji**:
   - Nghiêm ngặt tuân thủ quy tắc không tự sinh furigana trên câu hỏi cách đọc Kanji (`kanji_reading`). Furigana chỉ xuất hiện ở khu vực lời giải.

4. **Bảng Thống Kê & Phân Tích Điểm Yếu**:
   - Tính toán tỷ lệ phần trăm chính xác thô (raw score) theo tổng thể, theo từng kỹ năng (Từ vựng, Ngữ pháp, Đọc hiểu) và theo từng `subtype`.
   - Biểu đồ tiến độ và kỹ năng trực quan bằng Recharts.
   - Ghi nhận các dạng câu hỏi hay làm sai nhất.

5. **Sổ Tay Ôn Tập Câu Sai & Câu Đã Ghim (Review)**:
   - Tự động lưu trữ các câu hỏi từng làm sai hoặc được gắn cờ.
   - Chế độ Quick Drill giúp làm lại trực tiếp và mở lời giải chi tiết.

6. **Khảo Sát Cảm Nhận Sau Mỗi Đề**:
   - Thu thập đánh giá độ khó (1–5), mức hữu ích giải thích (1–5) và góp ý tự do.
   - Lưu trữ an toàn trong `localStorage` (phiên bản `jlptn3:v1:surveys`).

---

## 🚀 Khởi Chạy Nhanh

```bash
# Cài đặt thư viện
npm install

# Kiểm tra & đồng bộ đề thi
npm run exams:sync

# Chạy môi trường dev
npm run dev

# Mở trình duyệt tại http://localhost:3000
```

---

## 🛠️ Công Nghệ Sử Dụng

- **Framework**: Next.js 14 (App Router) + TypeScript
- **Styling**: Tailwind CSS
- **Biểu đồ**: Recharts
- **Icon**: Lucide React
- **Hiệu ứng**: Canvas Confetti
- **Phông chữ**: Inter & Noto Sans JP
