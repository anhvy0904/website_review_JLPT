# Tango N3 — Nghe, gõ và ôn mục sai

Mở `/learn/tango` hoặc chọn **Tango N3** trên menu. Chức năng không dùng database hoặc API chấm điểm; dữ liệu học và tiến độ lưu trên trình duyệt.

## Nội dung đi kèm

`public/data/tango_n3_sample.json` chứa 12 từ, 2 Chapter, 4 Unit. Đây là bộ mẫu minh họa tự biên soạn, gồm câu đầu theo mẫu được yêu cầu; không phải bản sao đầy đủ 2.000 từ hay thứ tự chương chính thức của sách. Các trường audio đang để rỗng để dùng giọng Nhật trên thiết bị.

Hai nguồn tham khảo cấu trúc: [JTest](https://jtest.net/tu-vung-n3), [VNJPCLUB](https://www.vnjpclub.com/tango-n3-2000/). Không có dữ liệu hoặc audio được cào tự động từ hai trang trong bản này.

## Cách học và phím tắt

1. Chọn Chapter và Unit bằng chuột hoặc Tab/phím mũi tên.
2. Chọn **Nghe – gõ từ vựng** hoặc **Nghe – gõ câu ví dụ**.
3. Chọn **Tất cả trong Unit** hoặc **Ôn mục sai** rồi bấm **Bắt đầu học** để cho phép âm thanh.
4. Ô nhập tự nhận focus. Gõ bằng Kanji hoặc toàn bộ cách đọc Hiragana tương ứng.
5. Enter lần đầu kiểm tra và hiện đáp án, cách đọc, nghĩa; Enter lần tiếp theo chuyển mục và phát audio. Mỗi lần chỉ ghi nhận một kết quả.
6. Alt + R nghe lại; Alt + S chuyển 0.75x/1.0x và phát lại mục hiện tại. Tất cả điều khiển vẫn dùng được bằng Tab, Space và Enter nếu hệ điều hành giữ một phím tắt.

Enter dùng để xác nhận ký tự khi IME đang ghép chữ không chấm bài. Đáp án bỏ qua khoảng trắng, dấu câu và chuẩn hóa ký tự Unicode/kana; vẫn phân biệt âm dài, âm ngắt và trợ từ. Đáp án câu phải khớp câu Nhật hoặc toàn bộ cách đọc trong JSON, không dùng AI để đánh giá cách diễn đạt khác.

Nghĩa tiếng Việt mặc định ẩn khi nghe; có tùy chọn gợi ý. Đáp án chỉ xuất hiện sau khi kiểm tra hoặc khi mở bảng tiến độ Unit.

## Ôn sai và đã thuộc

- Trả lời sai: thêm mục vào danh sách sai, đặt chuỗi đúng về 0 và bỏ trạng thái đã thuộc.
- Trả lời đúng: đưa mục khỏi danh sách sai; đúng 2 lần liên tiếp tự đánh dấu đã thuộc.
- Nút **Tôi đã thuộc mục này** cho phép đánh dấu thủ công; khi đánh dấu sẽ đưa mục khỏi danh sách sai. Có thể bỏ đánh dấu lại.
- Từ vựng và câu ví dụ của cùng một từ có tiến độ riêng.
- Danh sách ôn của một lượt học được giữ cố định. Một mục vừa sửa đúng không làm các mục còn lại bị nhảy hoặc mất khỏi lượt đang học.
- Đổi Chapter, Unit, chế độ hoặc bộ lọc sẽ kết thúc lượt đang mở; kết quả đã chấm vẫn được giữ.

Các khóa localStorage:

| Khóa | Nội dung |
| --- | --- |
| `vuyanh-tango-n3-progress-v1` | Số lượt làm/đúng, chuỗi đúng, cờ đang sai, đã thuộc và thời điểm học, theo `<wordId>:word` hoặc `<wordId>:example` |
| `vuyanh-tango-n3-custom-data-v1` | Kho Chapter/Unit nhập từ JSON |

Không đồng bộ giữa trình duyệt, thiết bị hay tên miền. Nếu bộ nhớ bị chặn hoặc đầy, trang báo rõ không lưu được. Nếu tiến độ cũ không đọc được, phiên học không ghi đè dữ liệu gốc. Câu chưa bấm kiểm tra và lượt học đang mở không được khôi phục sau tải lại trang.

## JSON và cách thêm nội dung

Tải file mẫu ngay trong mục **Thêm kho Tango N3 bằng JSON**, hoặc mở `public/data/tango_n3_sample.json`. Cấu trúc giữ nguyên:

```json
[
  {
    "chapterId": 1,
    "chapterTitle": "Chapter 1: 日常生活 (Cuộc sống hằng ngày)",
    "units": [
      {
        "unitId": 1,
        "unitTitle": "Unit 1: 朝起きてから (Từ lúc thức dậy)",
        "words": [
          {
            "id": "c1_u1_1",
            "stt": 1,
            "kanji": "目覚まし時計",
            "hiragana": "めざましどけい",
            "meaning": "Đồng hồ báo thức",
            "wordAudio": "",
            "example": {
              "japanese": "目覚まし時計が鳴る。",
              "hiragana": "めざましどけいがなる。",
              "meaning": "Đồng hồ báo thức reo.",
              "audio": ""
            }
          }
        ]
      }
    ]
  }
]
```

ID Chapter không được trùng trong kho, ID Unit không trùng trong Chapter, ID từ phải duy nhất toàn kho và STT duy nhất trong Unit. Từ được học theo STT tăng dần. Giữ ID ổn định để giữ tiến độ; dùng ID mới khi thay nghĩa/nội dung của từ cũ.

Dán JSON đầy đủ vào vùng nhập rồi bấm **Kiểm tra & lưu kho bài**. Kho mới thay danh sách đang dùng nhưng không xóa tiến độ. Chỉ đổi giao diện sau khi lưu thành công. Giữ file JSON gốc làm bản sao; có thể nhập lại file mẫu để quay về dữ liệu minh họa.

Muốn phát hành nội dung chung cho mọi người, cập nhật file JSON trong mã nguồn rồi build/deploy lại. Nhập trên giao diện chỉ thay đổi kho cá nhân trong trình duyệt.

## File audio và Web Speech API

- Đặt file thật tại `public/audio/tango_n3/c1_u1_1_word.mp3`, rồi khai báo `wordAudio` là `/audio/tango_n3/c1_u1_1_word.mp3`.
- Tương tự, file ví dụ dùng `example.audio`, chẳng hạn `/audio/tango_n3/c1_u1_1_ex.mp3`.
- Schema chấp nhận đường dẫn bắt đầu `/audio/` với đuôi mp3, wav, ogg hoặc m4a. Không nhập đường dẫn ổ đĩa Windows vào JSON.
- Chuỗi rỗng hoặc file lỗi sẽ chuyển sang Web Speech API. Giọng này không phải bản thu gốc của sách; thiết bị cần giọng tiếng Nhật. Nếu không hỗ trợ, trang hướng dẫn thêm audio/cài giọng Nhật.
- Trình duyệt có thể chặn tự phát trước thao tác đầu tiên. Bấm **Bắt đầu học** hoặc **Phát lại** để cho phép.
- Phát lại, đổi mục, đổi chế độ, rời trang hoặc ẩn tab sẽ dừng âm thanh cũ, tránh phát chồng.
- Nếu bổ sung audio Unit dài, cần cắt và nghe kiểm tra vị trí từng từ/câu trước khi gắn vào ID; khoảng lặng không luôn tương ứng một mục. Bản này chưa tự cắt audio hoặc cào PDF/web.

## Kiểm tra

```bash
node --test tests/tango.test.mjs
npx tsc --noEmit
npm run build
```

Test kiểm tra schema, đáp án hai kiểu chữ, Unicode, âm dài/âm ngắt, cập nhật tiến độ và hàng đợi ôn sai. Cần thử trực tiếp trên thiết bị có IME Nhật và giọng Nhật để xác nhận âm thanh, phím Enter khi đang ghép chữ, focus và tốc độ phát.
