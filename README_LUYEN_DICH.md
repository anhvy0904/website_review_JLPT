# Luyện dịch Việt ↔ Nhật theo từng câu

Mở `/learn/translation` hoặc chọn **Luyện dịch** trên menu. Có 5 bài N3, mỗi bài 10 câu, thuộc bốn chủ đề. Mặc định chọn **Việt → Nhật**; có thể đổi sang **Nhật → Việt** bất cứ lúc nào.

## Cách luyện

1. Chọn chiều dịch, chủ đề và bài đọc.
2. Đọc câu nguồn rồi gõ bản dịch vào ô ngay bên dưới. Các câu được xếp lần lượt từ trên xuống, không cần viết cả đoạn văn vào một ô.
3. Bấm **Chấm câu này** để nhận điểm và nhận xét riêng cho câu vừa làm.
4. Xem lỗi cần sửa, câu sửa gợi ý và đáp án tham khảo; có nút đưa con trỏ xuống câu tiếp theo.
5. Sửa bản dịch nếu muốn rồi chấm lại. Khi sửa, điểm và nhận xét cũ của câu đó được xóa để tránh hiển thị kết quả không còn đúng với nội dung.

**So sánh với đáp án** mở/ẩn mẫu dịch mà không gọi AI. Đáp án mẫu không phải cách dịch đúng duy nhất. Furigana áp dụng cho câu tiếng Nhật ở đề hoặc trong đáp án, tùy chiều dịch. Từ vựng và ngữ pháp có thể ẩn độc lập.

## Chấm điểm từng câu

- Đúng ý: 0–6 điểm.
- Ngữ pháp: 0–2 điểm.
- Độ tự nhiên: 0–2 điểm.
- Tổng: 0–10 điểm; phần đầu bài hiển thị số câu đã chấm và điểm trung bình của các câu đó.

API `POST /api/ai/translation` nhận `lessonId`, `sentenceIndex` (bắt đầu từ 0), `direction` (`vi-ja` hoặc `ja-vi`) và `answer` (1–1.500 ký tự). Server tự lấy câu nguồn, đáp án và ngữ cảnh từ dữ liệu bài học; không tin đáp án tham khảo do client gửi.

Chấm AI sử dụng cấu hình server hiện có: `ANTHROPIC_API_KEY` hoặc `CLAUDE_API_KEY`, hoặc `GEMINI_API_KEY`; chọn model bằng `CLAUDE_MODEL`/`GEMINI_MODEL`. Không cần thêm thư viện hoặc nhập khóa trong trang học. Nội dung câu trả lời và ngữ cảnh bài học được gửi tới nhà cung cấp khi bấm chấm.

AI được hướng dẫn chấp nhận từ đồng nghĩa, cấu trúc đúng khác mẫu, kana thay Kanji hợp lệ và lược chủ ngữ tự nhiên. Điểm AI chỉ mang tính tham khảo. Nếu thiếu cấu hình, lỗi mạng, hết thời gian chờ hoặc kết quả không hợp lệ, trang báo lỗi và không tự tạo điểm; người học vẫn mở được đáp án để tự so sánh.

## Thời gian và lưu tiến độ

- Đồng hồ bắt đầu khi bấm **Bắt đầu** hoặc gõ bản dịch; có tạm dừng và đặt lại.
- Bấm chấm hoặc mở đối chiếu sẽ tạm dừng; gõ tiếp hoặc bấm bắt đầu sẽ chạy lại. Rời tab cũng tạm dừng.
- Mỗi bài và mỗi chiều dịch có bản nháp, điểm, trạng thái mở đáp án và thời gian riêng, lưu trong `vuyanh-translation-v2:<lessonId>:<direction>`.
- Tải lại trang khôi phục dữ liệu nhưng đồng hồ không tự chạy lại. Không đồng bộ giữa thiết bị; xóa dữ liệu trình duyệt sẽ xóa tiến độ.
- Bản nháp cả đoạn của phiên bản trước vẫn giữ ở khóa `vuyanh-translation-v1:<lessonId>` và được hiển thị trong mục mở rộng để sao chép, không tự chia câu vì có thể làm sai nội dung người học.
- **Bài tiếp theo** chuyển trong danh sách đã lọc và quay về đầu khi hết bài; nút tắt nếu danh sách chỉ có một bài.

## Thêm bài trực tiếp trên website bằng JSON

Mở mục **Thêm bài bằng JSON** trên trang luyện dịch, ngay dưới phần chọn bài. Bên trái có mẫu JSON hoàn chỉnh với 3 câu và nút **Sao chép JSON mẫu**; bên phải là ô dán và nút **Kiểm tra & thêm bài**. Mục **Giải thích các trường JSON** hướng dẫn cấu trúc từng trường.

- Dán một object bài học hoặc mảng gồm tối đa 20 bài mỗi lần; tổng kho cá nhân tối đa 100 bài.
- Bài tự thêm có 1–50 cặp câu; chọn cấp độ N5–N1. Bài N3 đầy đủ vẫn nên có 10–15 câu.
- Giữ các trường như mẫu; `vocabulary`, `grammar`, `explanations` được phép là mảng rỗng `[]`.
- Dùng JSON thuần với dấu nháy kép, không thêm chú thích, dấu phẩy thừa hoặc dấu markdown bao ngoài.
- Hệ thống kiểm tra cấu trúc, số câu tương ứng, cú pháp furigana và ID trùng trước khi lưu toàn bộ lô. Không tự ghi đè bài cũ.
- Bài nhập thành công được mở ngay, xuất hiện trong danh sách và chủ đề tương ứng, dùng được cho cả hai chiều và chấm AI.
- Bài tự thêm lưu tại `vuyanh-custom-translation-lessons-v1` trong localStorage, chỉ trên trình duyệt/origin này; không tự xuất bản cho người khác hoặc push GitHub.
- Bấm **Tải JSON các bài đã thêm** để sao lưu hoặc nhập sang trình duyệt khác. Nếu xuất hơn 20 bài, chia mảng thành các lô tối đa 20 bài để nhập lại.

Khi chấm bài tự thêm, client gửi thêm `customLesson`; server kiểm tra cùng schema, ID và chỉ số câu. Với bài có sẵn, server luôn dùng dữ liệu chính thức trong mã nguồn. Cấu trúc hợp lệ không bảo đảm bản dịch mẫu đúng về ngôn ngữ, nên hãy tự kiểm tra nội dung trước khi luyện.

## Thêm bài bằng JavaScript

Sửa `lib/translation-lessons.js`. Mảng `translationLessons` chứa toàn bộ dữ liệu; cuối mảng có vị trí **THÊM OBJECT BÀI MỚI TẠI ĐÂY**, cuối file có mẫu để sao chép. Một cặp câu được dùng cho cả hai chiều, không cần khai báo hai lần.

1. Dùng `id` duy nhất và giữ ổn định để không mất liên kết với bản nháp đã lưu.
2. Điền `topic`, `level`, `title`, `japaneseTitle`. Chủ đề mới tự xuất hiện trong giao diện.
3. Thêm 10–15 phần tử vào `sentences`, mỗi phần tử một câu. Viết `[漢字|かんじ]` để thêm cách đọc, ví dụ `[明日|あした]、[京都|きょうと]へ[行|い]きます。`. Không chèn HTML.
4. Thêm đúng số phần tử tương ứng vào `translation`, theo cùng thứ tự. Đây cũng là đề bài khi chọn Việt → Nhật, nên mỗi câu cần rõ nghĩa và phù hợp ngữ cảnh.
5. Điền `vocabulary`: `["Kanji", "hiragana", "nghĩa tiếng Việt"]`; `grammar`: `["cấu trúc", "cách dùng"]`; `explanations`: ghi chú ngắt câu, chọn từ và sắc thái.
6. Nếu thay đổi nội dung hoặc thứ tự câu của bài đã phát hành, nên tạo ID bài mới để tránh gắn bản dịch/điểm cũ vào câu khác.

## Kiểm tra

```bash
node --test tests/translation-lessons.test.mjs tests/translation-grading.test.mjs
npx tsc --noEmit
npm run build
```

Kiểm thử API dùng nhà cung cấp giả lập, không gọi dịch vụ có tính phí. Cần kiểm tra bằng cấu hình AI thực tế để đánh giá chất lượng nhận xét. Trên trình duyệt, thử hai chiều dịch, đổi bài, sửa câu đã chấm, tải lại trang, chấm khi mất kết nối và nhập tiếng Nhật bằng IME.
