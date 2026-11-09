# PROMPT DÙNG LẶP LẠI: CHUYỂN PDF/DOCX/ẢNH ĐỀ JLPT N3 THÀNH JSON

## Cách dùng
1. Tải lên file đề gốc (PDF, Word hoặc ảnh rõ) và file đáp án nếu có.
2. Đính kèm thêm `exam-template.json` trong bộ tài liệu này.
3. Dán prompt bên dưới vào ChatGPT / Claude.
4. Sau khi nhận JSON, kiểm tra các câu được gắn `needs_review`. Chỉ sửa thành `verified` khi đã đối chiếu nguồn/đáp án.
5. Đặt tên file dạng `n3-YYYY-set-XXX.json` hoặc `n3-chude-XXX.json` và lưu vào `public/data/exams/`.
6. Chạy `npm run exams:sync` để kiểm tra và tự động cập nhật danh mục đề.

---

## 1. Prompt hoàn chỉnh — copy và gửi ChatGPT / Claude

```text
Bạn đóng vai biên tập viên học liệu JLPT N3 và kỹ sư chuẩn hóa dữ liệu. Tôi gửi kèm:
- (A) File nguồn: PDF / DOCX / ảnh của một hoặc nhiều đề trắc nghiệm.
- (B) File đáp án gốc, nếu có.
- (C) File chuẩn exam-template.json chứa cấu trúc JSON website hỗ trợ.

Mục tiêu: Trích xuất trung thực câu hỏi từ A, đối chiếu đáp án từ B và xuất một hoặc nhiều file .json hợp lệ tuân thủ đúng cấu trúc của C. Website không có phần nghe hiểu.

Nguyên tắc KHÔNG ĐƯỢC VI PHẠM:
1. KHÔNG tự thêm câu hỏi mới, KHÔNG tự sửa bản gốc để câu trông hay hơn, KHÔNG thay đổi thứ tự câu hoặc lựa chọn.
2. Giữ nguyên ký tự tiếng Nhật, Kanji, kana, dấu câu, ký hiệu ＿＿ và bố cục ngữ cảnh. Nếu câu thuộc đoạn đọc hiểu, tạo passages[] và liên kết passageId, không lặp lại passage trong mỗi câu.
3. Chỉ xử lý vocabulary / grammar / reading; loại bỏ listening hoặc ghi báo cáo số câu đã loại.
4. Nếu nguồn có hình ảnh/bảng quan trọng mà không thể biểu diễn chính xác bằng text, báo rõ ảnh nào phải giữ làm asset; không phỏng đoán dữ liệu.
5. Đáp án chính xác lấy từ đáp án gốc nếu có. Nếu thiếu đáp án gốc hoặc câu khó xác minh, bạn có thể đề xuất đáp án để tôi rà soát nhưng phải đánh dấu câu review.status = "needs_review", ghi vấn đề vào review.notes; không bao giờ coi đáp án suy đoán là đã xác minh. Với câu không thể xác định, đặt correctOptionId = null và giữ trạng thái draft.
6. Mỗi câu cần explanation tiếng Việt: summaryVi, correctReasonVi, optionReasonsVi cho từng lựa chọn, translationVi, vocabulary[] gồm word, reading, meaningVi, grammarPoints[] nếu có, readingEvidenceJa nếu là đọc hiểu, studyTipVi.
7. Giải thích vì sao đáp án đúng và vì sao từng phương án còn lại sai. ĐẶC BIỆT cho phần Từ vựng / Chữ Hán (Mondai 1 & Mondai 2): Trong optionReasonsVi, ghi rõ chữ Hán và nghĩa tiếng Việt tương ứng của TỪNG phương án lựa chọn (Ví dụ: nếu phương án là Hiragana thì ghi rõ chữ Hán tương ứng của phương án đó và nghĩa; tuyệt đối KHÔNG lặp lại giải thích của câu hỏi cho các phương án khác). Nếu chưa có đủ thông tin để giải thích chắc chắn, ghi rõ trong review.notes, không bịa lập luận.
8. Ở từ vựng lời giải, ghi cách đọc hiragana; KHÔNG chèn furigana khiến phần đề kiểm tra cách đọc Kanji bị lộ đáp án.
9. Gán id đề và câu duy nhất và ổn định: n3-<bo-de>-q001, q002, ...; Chuẩn hóa phân loại `section`, `mondai`, `subtype` và trọng số `weight` chuẩn JLPT N3:
   - `vocabulary` (Thang 30đ):
     + Mondai 1 (Cách đọc Kanji - `kanji_reading`): weight = 1
     + Mondai 2 (Cách viết Kanji - `orthography`): weight = 1
     + Mondai 3 (Hoàn thành câu/Ngữ cảnh - `context_meaning`): weight = 1
     + Mondai 4 (Từ đồng nghĩa/Gần nghĩa - `paraphrase`): weight = 1.5
     + Mondai 5 (Cách dùng từ - `usage`): weight = 1.5
   - `grammar` (Thang 30đ):
     + Mondai 1 (Ngữ pháp câu - `sentence_grammar`): weight = 1.5
     + Mondai 2 (Sắp xếp dấu sao ★ - `star_arrangement`): weight = 1.5
     + Mondai 3 (Ngữ pháp đoạn văn - `text_grammar`): weight = 2
   - `reading` (Thang 60đ):
     + Mondai 4 (Đoạn văn ngắn ~200 chữ - `short_passage`): weight = 3
     + Mondai 5 (Đoạn văn trung bình ~400 chữ - `medium_passage`): weight = 4
     + Mondai 6 (Đoạn văn dài ~550 chữ - `long_passage`): weight = 5
     + Mondai 7 (Tìm kiếm thông tin/Tờ rơi - `information_retrieval`): weight = 4
10. Mặc định xuất status = "draft", source.reviewedByHuman = false và review.status = "needs_review" cho đến khi tôi duyệt. Không tự đổi sang published.
11. Đảm bảo questionCount khớp questions.length; mọi option.id là duy nhất trong câu; correctOptionId (nếu không null) phải trùng một option.
12. Không chèn Markdown code fence vào nội dung file JSON. Giữ schema giống exam-template.json; giữ null thực sự (không phải chuỗi "null").

Phương pháp xử lý:
Bước 1 — Trích xuất: Đọc toàn bộ file nguồn, liệt kê số đề, trang, phần, số câu, số lựa chọn, tình trạng file đáp án. Đánh dấu phần không đọc chắc chắn.
Bước 2 — Chuẩn hóa: Chuyển câu hỏi thành JSON theo file mẫu; dùng passages[] với bài đọc; giữ tất cả câu, không bỏ lặng lẽ.
Bước 3 — Phân tích: Với mỗi câu đủ dữ liệu, giải thích đáp án bằng tiếng Việt dễ hiểu mức dưới/N3; giải thích cả lựa chọn sai; thêm từ vựng có furigana và ví dụ ngữ pháp nếu phù hợp.
Bước 4 — Kiểm tra: Kiểm tra JSON parse được; ID trùng; câu thiếu option; đáp án nằm ngoài options; section; count; liên kết passage; câu thiếu lời giải. Tạo danh sách needs_review có số câu và lý do cụ thể.
Bước 5 — Xuất file:
- Tạo file .json có thể tải về; nếu có nhiều đề, mỗi đề là một file riêng. Với nguồn dài, chia theo đề/nhóm đủ nhỏ để tránh mất dữ liệu.
- Kèm báo cáo biên tập ngắn: số câu được nhập, số câu được loại vì nghe, số câu thiếu đáp án, số câu cần xem lại, ảnh cần đính kèm.
- Nếu không thể tạo file tải về trong phiên này, cung cấp JSON thuần ở từng phần, không xen giải thích vào nội dung JSON.

Yêu cầu cuối: Chỉ được kết luận "đã chuyển đủ câu" khi kiểm đếm giữa file gốc và JSON khớp thực tế.
```

---

## 2. Prompt kiểm duyệt lần hai (rất nên dùng)

```text
Tôi gửi file đề gốc, đáp án gốc (nếu có) và file JSON do AI tạo. Hãy đóng vai kiểm duyệt độc lập:
1. So sánh từng câu tiếng Nhật, từng option, đáp án và đoạn đọc hiểu với file nguồn.
2. Tạo bảng lỗi theo ID câu: loại lỗi, dữ liệu gốc, dữ liệu JSON, mức độ nghiêm trọng, sửa đề xuất.
3. Phân biệt lỗi trích xuất, lỗi đáp án, lỗi giải thích và lỗi dịch nghĩa.
4. Không tự sửa nội dung nghi ngờ khi không đủ căn cứ; đánh dấu needs_review.
5. Xuất file JSON đã sửa; KHÔNG tự đặt source.reviewedByHuman=true hoặc công bố đề.
```

---

## 3. Prompt xuất bản sau khi tôi tự duyệt

```text
Tôi đã đối chiếu và xác nhận các câu sau với nguồn và đáp án: [DANH SÁCH ID]. Hãy đổi review.status của đúng những câu đó thành verified. Chỉ đổi status của cả đề thành published và source.reviewedByHuman=true khi TẤT CẢ các câu đã được tôi xác nhận, không còn needs_review, đủ đáp án và lời giải. Giữ nguyên ID đề và ID câu.
```
