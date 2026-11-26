# JLPT N3 – Bộ 3 đề mới, bản nhập liệu NHÁP

## Tệp và cấu trúc
- `public/data/exams/n3-2025-07.json` — kỳ 7/2025
- `public/data/exams/n3-2021-12.json` — kỳ 12/2021
- `public/data/exams/n3-2025-12.json` — kỳ 12/2025
- `public/data/exams/assets/<exam-id>/source-page-XX.webp` — ảnh nguồn để hiển thị và soát nội dung.
- `public/data/exams/index.json` — danh sách đề ở trạng thái nháp.
- `BANG_KIEM_DUYET.csv` — bảng tra 219 câu.

## TÌNH TRẠNG THỰC TẾ
- Cả 3 JSON đều có **73 vị trí câu** (35 từ vựng + 22 ngữ pháp + 16 đọc hiểu), tổng 219 vị trí.
- Đề 12/2021 có 73/73 câu với văn bản và bốn lựa chọn; một số ký tự/font và phần bài đọc vẫn **cần kiểm tra** so với PDF.
- Đề 7/2025 và 12/2025 là **bản ảnh quét**. Đề 7/2025 có **35 câu từ vựng được nhập bằng OCR chưa đối chiếu**; 38 vị trí câu còn lại hiển thị bằng ảnh nguồn và chưa có nội dung chữ. Đề 12/2025 có 73 vị trí câu và ảnh nguồn, nhưng chưa chuẩn hóa câu hỏi/văn bản từ ảnh. Các câu chưa chuẩn hóa có bốn lựa chọn chỉ là số `1`, `2`, `3`, `4`. **Hai đề này CHƯA phải bộ đề text có thể chấm điểm.**
- Tất cả các câu có `correctOptionId: null`, `review.status: needs_review`, `status: draft`. Không có file đáp án đáng tin cậy đi kèm, nên **không được** dùng dữ liệu hiện tại để chấm điểm.
- Với đề 12/2021, `passages[].text` có nội dung đọc hiểu lấy từ PDF nhưng chưa đối chiếu toàn bộ các lỗi font/OCR; phần ảnh được giữ nguyên để kiểm chứng.
- Đề 2025 chưa được điền `passages[].text`, nhưng các ảnh có trong thư mục assets để học viên có thể **xem bản gốc**.

## Cách nhập vào website
1. Giải nén vào gốc dự án Next.js và giữ đúng `public/data/exams/`.
2. Sửa giao diện câu hỏi: ưu tiên `questionText`, nếu trống thì **hiển thị `questionImagePath`** kèm lời nhắc "Cần số hóa câu hỏi"; không giả định một phương án đúng.
3. Sửa giao diện passage: ưu tiên `passages[].text`, nếu trống thì hiển thị `imagePath` và `additionalImagePaths` (nếu có).
4. Nếu `correctOptionId === null`, tắt chấm điểm và không hiển thị lời giải đúng/sai do AI chưa xác minh.
5. Trước khi đưa lên kho đề công khai: đọc ảnh trang gốc, sửa lại văn bản và phương án từng câu; nhập đáp án chính thức, viết lời giải và kiểm duyệt thủ công.
6. Nếu công khai bộ đề của bên thứ ba, kiểm tra quyền sử dụng và phân phối.

## Kiểm tra đường dẫn
Ví dụ `http://localhost:3000/data/exams/assets/n3-2025-07/source-page-14.webp`.

**Lưu ý:** Số lượng `questions.length` phản ánh số vị trí câu theo PDF, KHÔNG phải số câu đã số hóa hoàn chỉnh. Đây là bản phân loại và xem ảnh, chưa phải đầu ra hoàn tất theo toàn bộ yêu cầu của prompt chuyển đề.
