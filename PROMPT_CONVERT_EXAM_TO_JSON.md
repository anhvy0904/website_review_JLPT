# HƯỚNG DẪN PROMPT TRÍCH XUẤT ĐỀ THI JLPT N3 SANG JSON CHUẨN

Sử dụng prompt bên dưới khi gửi đề thi JLPT N3 (dạng ảnh, PDF, hoặc text) cho ChatGPT / Claude để nhận về file JSON chuẩn xác 100% tương thích với hệ thống **JLPT N3 Practice Hub**.

---

### PROMPT COPY-PASTE CHO AI:

```markdown
Bạn là chuyên gia sư phạm tiếng Nhật JLPT N3 và lập trình viên JSON data. Hãy giúp tôi chuyển đổi nội dung đề thi JLPT N3 được cung cấp thành một file JSON duy nhất tuân thủ nghiêm ngặt Schema Version 1.0.0 dưới đây:

### QUY TẮC BẮT BUỘC:
1. KHÔNG tự động gắn furigana lên câu hỏi phần kiểm tra cách đọc Kanji (kanji_reading) để tránh làm lộ đáp án người học.
2. Với mọi câu hỏi, mục `explanation.optionReasonsVi` PHẢI giải thích rõ ràng cho TẤT CẢ các lựa chọn (cả đáp án đúng và tất cả distractors sai).
3. Đầy đủ bản dịch tiếng Việt (`translationVi`), tóm tắt (`summaryVi`), và phân tích từ vựng (`vocabulary`), ngữ pháp (`grammarPoints`), mẹo thi (`studyTipVi`).
4. Nếu là câu hỏi đọc hiểu (`reading`), tạo passage trong mảng `passages` và gán `passageId` tương ứng cho câu hỏi, đồng thời trích dẫn câu văn bằng chứng vào `readingEvidenceJa`.
5. Đảm bảo `questionCount` khớp chính xác với `questions.length`.
6. Chỉ xuất ra duy nhất khối mã JSON hợp lệ, không kèm lời bình mở đầu hay kết thúc.

### CẤU TRÚC JSON MẪU:
{
  "schemaVersion": "1.0.0",
  "id": "n3-[nam]-[ma-de]",
  "title": "Tiêu đề đề thi",
  "description": "Mô tả đề thi",
  "level": "N3",
  "status": "published",
  "source": {
    "fileName": "nguon.pdf",
    "type": "official_mock",
    "notes": "Kiểm duyệt bởi người",
    "reviewedByHuman": true
  },
  "settings": {
    "timeLimitMinutes": 30,
    "allowedModes": ["practice", "exam"]
  },
  "passages": [
    {
      "id": "p001",
      "title": "Tiêu đề bài đọc",
      "text": "Nội dung bài đọc tiếng Nhật...",
      "imagePath": ""
    }
  ],
  "questions": [
    {
      "id": "n3-xxx-q001",
      "number": 1,
      "section": "vocabulary", // vocabulary | grammar | reading
      "subtype": "kanji_reading", // kanji_reading | contextual_use | paraphrase | usage | sentence_grammar | sentence_composition | reading_short | reading_medium | reading_long | info_retrieval
      "passageId": "",
      "questionText": "この書類を__提出__してください。",
      "options": [
        { "id": "1", "text": "ていしゅつ" },
        { "id": "2", "text": "たいしゅつ" },
        { "id": "3", "text": "ていしゅっ" },
        { "id": "4", "text": "だいしゅつ" }
      ],
      "correctOptionId": "1",
      "difficulty": 2,
      "tags": ["Từ vựng N3", "Cách đọc Kanji"],
      "explanation": {
        "summaryVi": "Tóm tắt ngắn gọn",
        "correctReasonVi": "Lý do vì sao đáp án đúng",
        "optionReasonsVi": {
          "1": "ĐÚNG: Giải thích...",
          "2": "SAI: Giải thích...",
          "3": "SAI: Giải thích...",
          "4": "SAI: Giải thích..."
        },
        "translationVi": "Bản dịch câu...",
        "vocabulary": [
          { "word": "提出", "hiragana": "ていしゅつ", "meaningVi": "nộp, xuất trình" }
        ],
        "grammarPoints": [],
        "studyTipVi": "Mẹo làm bài..."
      },
      "review": {
        "status": "verified",
        "notes": "Đã kiểm duyệt"
      }
    }
  ],
  "questionCount": 1
}
```
