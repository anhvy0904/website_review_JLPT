# Luyện dịch Nhật → Việt

Mở `/learn/translation` hoặc chọn **Luyện dịch** trong menu. Có 5 bài N3, mỗi bài 10 câu, thuộc bốn chủ đề. Chọn chủ đề để lọc danh sách; **Bài tiếp theo** chuyển trong danh sách đã lọc và quay về đầu khi hết bài. Nút này tắt khi bộ lọc chỉ có một bài.

- Furigana mặc định tắt. Gợi ý từ vựng và ngữ pháp có thể ẩn độc lập.
- Đồng hồ bắt đầu khi bấm **Bắt đầu** hoặc gõ bản dịch; có tạm dừng và đặt lại. Khi rời tab hoặc xem đáp án, đồng hồ tạm dừng. Khi quay lại, bấm bắt đầu hoặc gõ tiếp (sau khi ẩn đáp án).
- Bản nháp và thời gian tự lưu riêng theo ID bài trong localStorage của trình duyệt. Đổi bài hoặc tải lại trang vẫn giữ dữ liệu; đồng hồ không tự chạy lại. Không đồng bộ giữa thiết bị. Xóa dữ liệu trình duyệt sẽ xóa bản nháp.
- Đáp án là bản dịch tham khảo, không chấm điểm tự động.

## Thêm bài bằng JavaScript

Sửa `lib/translation-lessons.js`. Mảng `translationLessons` chứa toàn bộ dữ liệu; cuối mảng có vị trí **THÊM OBJECT BÀI MỚI TẠI ĐÂY**, cuối file có mẫu JavaScript để sao chép.

1. Dùng `id` duy nhất và giữ ổn định để không mất liên kết với bản nháp đã lưu.
2. Điền `topic`, `level`, `title`, `japaneseTitle`. Chủ đề mới tự xuất hiện trong giao diện.
3. Thêm 10–15 phần tử vào `sentences`, mỗi phần tử một câu. Viết `[漢字|かんじ]` để thêm cách đọc. Ví dụ: `[明日|あした]、[京都|きょうと]へ[行|い]きます。`. Không chèn thẻ HTML.
4. Thêm đúng số phần tử tương ứng vào `translation`, theo cùng thứ tự.
5. Điền `vocabulary`: `["Kanji", "hiragana", "nghĩa tiếng Việt"]`; `grammar`: `["cấu trúc", "cách dùng"]`; `explanations`: các ghi chú ngắt câu, chọn từ và sắc thái.
6. Chạy `node --test tests/translation-lessons.test.mjs` và `npx tsc --noEmit`, rồi build/deploy như dự án hiện tại. Không cần API hoặc cơ sở dữ liệu cho chức năng này.
