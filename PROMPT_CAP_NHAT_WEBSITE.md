# Prompt tích hợp bản nháp bộ 3 đề mới

Tôi có bộ ZIP với ba JSON theo schema 1.0.0 và ảnh nguồn WebP. Hãy cập nhật dự án Next.js JLPT N3 Practice Hub hiện tại, KHÔNG tạo lại ứng dụng:

1. Giải nén và nhập nguyên vẹn `public/data/exams/`.
2. Chỉ cho phép quản trị viên truy cập ba đề khi `status="draft"`.
3. Khi `questionText` không rỗng, hiển thị tiếng Nhật. Nếu rỗng, hiển thị `questionImagePath` là ảnh trang PDF để quản trị viên soát. Không chỉ hiển thị câu chữ trống.
4. Khi `passageId` có giá trị, tìm `exam.passages`. Nếu `text` không rỗng, hiển thị văn bản; ngược lại dùng `imagePath` và `additionalImagePaths`. Đừng chỉ hiển thị câu hỏi mà bỏ bài đọc.
5. Khi `correctOptionId == null`, **KHÔNG cho chấm điểm hoặc công bố đáp án đúng**. Hiển thị cảnh báo "Chưa xác minh đáp án" trong giao diện admin.
6. Cho admin chỉnh sửa: questionText, mỗi option.text, passage.text, correctOptionId, explanation, review.status. Có nút xem ảnh nguồn bên cạnh form soát.
7. Đối với bài đọc dùng nhiều trang ảnh, hiển thị TẤT CẢ ảnh từ `imagePath` + `additionalImagePaths` theo đúng thứ tự.
8. Không tự sinh câu tiếng Nhật, không tự điền đáp án khi chưa có nguồn; đánh dấu `needs_review`.
9. Thêm chỉ báo tiến độ: số câu đã có chữ/73, số câu được duyệt/73, bài đọc có chữ/9.
10. Chỉ cho phép `published` khi 73 câu đều có questionText, 4 lựa chọn gốc, đáp án được duyệt, lời giải chi tiết và bài đọc đã được kiểm chứng.
11. Giữ nguyên mọi module khác của website (dashboard, từ vựng, conjugation, keigo).
12. Kiểm thử các đường dẫn ảnh nguồn và thông báo danh sách tệp sửa cùng lỗi còn tồn tại.
