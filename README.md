# Học cùng VuyAnh — JLPT N3

Website học và luyện thi tiếng Nhật dành cho người Việt, xây dựng bằng Next.js, React và TypeScript. Nội dung gồm từ vựng, Kanji, ngữ pháp, đọc hiểu, học chuyên đề và luyện dịch Việt ↔ Nhật theo từng câu.

Đề thi và bài học được lưu trong mã nguồn dưới dạng JSON hoặc mảng JavaScript. Các chức năng học cơ bản chạy không cần khóa API; AI là phần mở rộng tùy chọn. Tiến độ cá nhân được lưu trên trình duyệt, không tự đồng bộ giữa thiết bị.

## Mục lục

- [Chức năng](#chức-năng)
- [Các trang chính](#các-trang-chính)
- [Công nghệ và cấu trúc mã nguồn](#công-nghệ-và-cấu-trúc-mã-nguồn)
- [Cài đặt và chạy dự án](#cài-đặt-và-chạy-dự-án)
- [Cấu hình môi trường và AI](#cấu-hình-môi-trường-và-ai)
- [Luyện dịch Việt ↔ Nhật](#luyện-dịch-việt--nhật)
- [Thêm và cập nhật đề thi](#thêm-và-cập-nhật-đề-thi)
- [Dữ liệu và tiến độ học](#dữ-liệu-và-tiến-độ-học)
- [Lệnh phát triển và kiểm tra](#lệnh-phát-triển-và-kiểm-tra)
- [Triển khai](#triển-khai)
- [Xử lý lỗi thường gặp](#xử-lý-lỗi-thường-gặp)
- [Quy trình đóng góp](#quy-trình-đóng-góp)

## Chức năng

### Luyện tập và thi thử

- Kho đề N3 với các phần từ vựng, ngữ pháp và đọc hiểu.
- **Luyện tập:** kiểm tra đáp án và xem lời giải trong quá trình làm bài.
- **Thi thử:** làm bài có giới hạn thời gian, nộp bài và xem kết quả sau khi hoàn thành.
- Gắn cờ câu hỏi, xem lại câu sai và thống kê kết quả theo kỹ năng.
- Lời giải tiếng Việt gồm lý do chọn đáp án, phân tích các lựa chọn, từ vựng, ngữ pháp và bản dịch tùy dữ liệu từng câu.
- Bài đọc có thể đi kèm hình ảnh, từ vựng có furigana và thông tin Hán Việt. Các câu kiểm tra cách đọc Kanji không hiển thị furigana làm lộ đáp án trong phần câu hỏi.

Điểm và tỷ lệ đúng trong ứng dụng dùng để tự đánh giá việc học; không phải điểm quy đổi chính thức của kỳ thi JLPT.

### Học chuyên đề và flashcard

- 12 thể động từ, quy tắc chia và công cụ tra chia động từ.
- Kính ngữ, khiêm nhường ngữ, lịch sự ngữ và nguyên tắc trong–ngoài khi giao tiếp.
- Câu hỏi luyện tập theo chuyên đề và lưu tiến độ học.
- Flashcard từ vựng với lịch ôn lặp lại ngắt quãng; người học tự đánh giá mức độ nhớ sau mỗi thẻ.
- Trang ôn câu sai và biểu đồ thống kê để theo dõi quá trình học.

### Luyện dịch Việt ↔ Nhật

Có 5 bài đọc N3, mỗi bài 10 câu, thuộc bốn chủ đề: **Du lịch**, **Công việc IT**, **Đời sống hằng ngày**, **Văn hóa Nhật**.

- Chọn bài từ danh sách hoặc chuyển bằng nút **Bài tiếp theo**.
- Bật/tắt furigana; ẩn/hiện gợi ý từ vựng và ngữ pháp.
- Nhập bản dịch trong từng ô câu theo thứ tự từ trên xuống; lưu riêng theo bài và chiều dịch.
- Đo thời gian luyện dịch, tạm dừng hoặc đặt lại đồng hồ.
- So sánh đáp án và chấm từng câu bằng AI: đúng ý 6 điểm, ngữ pháp 2 điểm, độ tự nhiên 2 điểm; kèm nhận xét và gợi ý sửa.

So sánh đáp án không cần AI. Chấm từng câu cần khóa AI ở server; nếu chưa cấu hình hoặc gặp lỗi, trang báo rõ chưa chấm được. Điểm AI mang tính tham khảo, không yêu cầu câu trả lời giống từng chữ với đáp án mẫu.

### Tango N3: nghe – gõ – ôn mục sai

Trang `/learn/tango` hỗ trợ chọn Chapter/Unit, nghe và gõ từ vựng hoặc câu ví dụ. Enter kiểm tra rồi chuyển mục; Alt + R nghe lại, Alt + S đổi tốc độ 0.75x/1.0x. Chấp nhận Kanji hoặc cách đọc Hiragana, lưu tiến độ và trạng thái đang sai/đã thuộc riêng cho hai chế độ bằng localStorage.

Bản mẫu gồm 12 từ tự biên soạn, chưa phải toàn bộ sách Tango N3. Có file `public/data/tango_n3_sample.json` và vùng nhập kho JSON trên trang. Audio ưu tiên file trong `/audio/`, dự phòng bằng Web Speech API trên thiết bị có giọng Nhật. Xem [hướng dẫn Tango N3](README_TANGO_N3.md).

### Công cụ AI và quản trị

- Hỏi gia sư AI về câu hỏi đang học khi đã cấu hình nhà cung cấp AI.
- Nhập tài liệu đề thi từ giao diện quản trị; ô chọn tệp hỗ trợ PDF, DOCX, JPG, JPEG và PNG. Khả năng xử lý thực tế phụ thuộc nội dung và nhà cung cấp AI được chọn.
- Hỗ trợ tạo lời giải và kiểm duyệt trước khi xuất bản đề.
- Endpoint quản trị xác thực bằng mã quản trị qua `x-admin-secret` hoặc Bearer token.

Nội dung do AI tạo cần được người biết tiếng Nhật kiểm tra lại, nhất là cách đọc Kanji, đáp án, cấu trúc ngữ pháp và bản dịch.

## Các trang chính

Các đường dẫn bên dưới là đường dẫn trong ứng dụng, ví dụ `http://localhost:3000/learn/translation` khi chạy local.

| Đường dẫn | Nội dung |
| --- | --- |
| `/` | Trang chủ |
| `/exams` | Kho đề thi |
| `/exams/[examId]` | Thông tin một đề |
| `/practice/[examId]` | Giao diện làm bài |
| `/results/[attemptId]` | Kết quả một lượt làm bài |
| `/learn` | Danh sách chuyên đề |
| `/learn/verb-forms` | Học chia động từ |
| `/learn/keigo` | Học kính ngữ và khiêm nhường ngữ |
| `/learn/translation` | Luyện dịch Việt ↔ Nhật |
| `/learn/tango` | Nghe–gõ từ vựng, câu ví dụ và ôn mục sai Tango N3 |
| `/flashcards` | Ôn từ vựng |
| `/review` | Ôn câu sai và câu đã ghim |
| `/dashboard` | Thống kê học tập |
| `/guide` | Hướng dẫn sử dụng |
| `/admin` | Khu vực quản trị |
| `/admin/import` | Nhập đề bằng AI |

Thay `[examId]` và `[attemptId]` bằng ID thật. Kết quả một lượt làm bài phụ thuộc dữ liệu lưu trong trình duyệt đang sử dụng.

## Công nghệ và cấu trúc mã nguồn

| Thành phần | Công nghệ |
| --- | --- |
| Ứng dụng | Next.js 14, App Router, React 18, TypeScript |
| Giao diện | Tailwind CSS, Lucide React |
| Biểu đồ | Recharts |
| Kiểm tra dữ liệu | Zod và script kiểm tra đề |
| AI tùy chọn | Anthropic SDK, Google Gen AI SDK |
| Đọc DOCX | Mammoth |
| Kiểm thử | Node.js test runner |

Phiên bản phụ thuộc cụ thể được ghi trong `package.json` và khóa trong `package-lock.json`.

```text
app/
  api/                      # API gia sư AI, nhập đề, lời giải, xuất bản đề
  admin/                    # Giao diện quản trị
  exams/                    # Kho đề và thông tin đề
  practice/                 # Làm bài
  results/                  # Xem kết quả
  learn/
    verb-forms/             # Chuyên đề chia động từ
    keigo/                  # Chuyên đề kính ngữ
    translation/            # Trang luyện dịch
  flashcards/               # Ôn từ vựng
  review/                   # Ôn câu sai
  dashboard/                # Thống kê
components/                 # Thành phần giao diện dùng lại
  TranslationPractice.tsx   # Giao diện, đồng hồ và bản nháp luyện dịch
lib/
  translation-lessons.js    # Dữ liệu bài dịch và mẫu thêm bài
  exams.ts                  # Đọc dữ liệu đề
  types.ts                  # Kiểu dữ liệu dùng chung
  validation.ts             # Schema kiểm tra dữ liệu
  scoring.ts                # Tính điểm
  storage.ts                # Lưu lượt làm bài, flashcard, đánh dấu...
  learningStorage.ts        # Lưu tiến độ học chuyên đề
  auth.ts                   # Xác thực quản trị và giới hạn tần suất
  gemini.ts                 # Tích hợp AI, gồm cả Claude và Gemini
public/
  data/exams/               # File đề JSON và index.json
  data/exams/assets/        # Hình ảnh, tài liệu đi kèm đề
  data/learning/            # Bài học và câu hỏi theo chuyên đề
  images/                   # Hình ảnh giao diện
scripts/                    # Đồng bộ, tạo và kiểm tra nội dung
tests/                      # Các kiểm tra tự động
exam-template.json          # Mẫu cấu trúc đề
.env.example                # Mẫu cấu hình môi trường
README_LUYEN_DICH.md         # Hướng dẫn riêng cho luyện dịch
```

## Cài đặt và chạy dự án

Chuẩn bị Node.js và npm tương thích với các gói trong `package-lock.json`, cùng Git. Repository chưa khai báo một phiên bản Node cố định trong trường `engines`; khi triển khai nên thống nhất phiên bản giữa máy phát triển và môi trường build.

```bash
git clone https://github.com/anhvy0904/website_review_JLPT.git
cd website_review_JLPT
npm ci
npm run exams:sync
npm run dev
```

Mở `http://localhost:3000`. Nếu Next.js chọn cổng khác vì cổng mặc định đang được sử dụng, mở địa chỉ được in trong terminal.

`npm ci` cài theo lockfile và thay thế thư mục `node_modules` hiện có. Dùng `npm install` khi chủ động thay đổi phụ thuộc, sau đó kiểm tra và commit cả `package.json` lẫn `package-lock.json`.

Để chạy bản production trên máy:

```bash
npm run build
npm run start
```

`npm run build` chạy đồng bộ đề trước rồi mới build Next.js. Vì vậy dữ liệu đề không hợp lệ có thể làm build dừng trước bước biên dịch ứng dụng.

## Cấu hình môi trường và AI

Không cần khóa AI để xem bài học, luyện đề có sẵn, ôn flashcard hoặc luyện dịch. Khi dùng quản trị hoặc AI, tạo `.env.local` từ `.env.example` rồi điều chỉnh.

PowerShell:

```powershell
Copy-Item .env.example .env.local
```

macOS/Linux:

```bash
cp .env.example .env.local
```

Nếu `.env.local` đã tồn tại, chỉnh file hiện có thay vì chép đè.

| Biến | Cách dùng trong mã nguồn |
| --- | --- |
| `ADMIN_SECRET` | Mã dùng cho các API quản trị |
| `ANTHROPIC_API_KEY` | Khóa Anthropic; ưu tiên khi cấu hình AI từ môi trường |
| `CLAUDE_API_KEY` | Tên thay thế khi không đặt `ANTHROPIC_API_KEY` |
| `CLAUDE_MODEL` | Model Claude gửi trong yêu cầu API |
| `GEMINI_API_KEY` | Khóa Gemini khi không có khóa Claude từ môi trường |
| `GEMINI_MODEL` | Model Gemini gửi trong yêu cầu API |

`.env.example` chưa liệt kê đầy đủ các tên khóa mà mã nguồn hỗ trợ; có thể thêm `ANTHROPIC_API_KEY` hoặc `CLAUDE_API_KEY` vào `.env.local` nếu dùng Claude. Chỉ cần cấu hình nhà cung cấp bạn sử dụng.

Mã nguồn có model mặc định trong `lib/gemini.ts`. Đây là giá trị mặc định của dự án, không bảo đảm model đó còn được nhà cung cấp cung cấp hoặc tài khoản có quyền sử dụng. Khi gặp lỗi model, đặt biến tương ứng thành model mà tài khoản của bạn truy cập được. Khởi động lại server sau khi sửa biến môi trường.

Một số màn hình cho phép nhập khóa riêng; khóa này được ưu tiên hơn khóa môi trường trong luồng xử lý tương ứng. Giao diện nhập đề hiện lưu khóa nhập tay và mã quản trị trong localStorage; tránh nhập chúng trên máy dùng chung.

`lib/auth.ts` hiện có mã quản trị dự phòng dành cho phát triển. Trước khi mở chức năng quản trị trên môi trường công khai, đặt `ADMIN_SECRET` riêng và đủ khó đoán. Không dùng tiền tố `NEXT_PUBLIC_` cho bí mật, không commit `.env.local` hoặc khóa thật. File `.env.local` đã được bỏ qua trong `.gitignore`.

## Luyện dịch Việt ↔ Nhật

### Cách học

1. Mở **Luyện dịch** trên menu hoặc `/learn/translation`.
2. Chọn chiều **Việt → Nhật** (mặc định) hoặc **Nhật → Việt**, rồi chọn chủ đề và bài đọc.
3. Nhập bản dịch vào từng ô câu, lần lượt từ trên xuống. Đồng hồ tự bắt đầu khi gõ; có thể bấm **Bắt đầu** trước khi đọc.
4. Bấm **Chấm câu này** để nhận điểm, nhận xét và gợi ý sửa ngay dưới câu đó. Bấm **So sánh với đáp án** nếu chỉ muốn tự đối chiếu.
5. Sửa bản dịch sẽ xóa điểm cũ để chấm lại; bấm **Tiếp tục câu…** để đưa con trỏ xuống câu sau.
6. Dùng **Bài tiếp theo** để chuyển trong danh sách đã lọc; hết danh sách sẽ quay lại bài đầu. Nếu chỉ có một bài, nút sẽ tắt.

Bản nháp, điểm và thời gian lưu riêng theo bài và chiều dịch. Khi rời tab, chấm câu hoặc mở đối chiếu, đồng hồ tạm dừng. Tải lại trang không tự chạy lại đồng hồ; **Đặt lại thời gian** không xóa bản dịch. Bản nháp cả đoạn của phiên bản cũ được giữ trong mục mở rộng để sao chép lại từng câu.

API `/api/ai/translation` sử dụng khóa và model cấu hình ở server như mục AI bên trên. Câu trả lời và ngữ cảnh bài học được gửi đến nhà cung cấp khi bấm chấm. Xem [hướng dẫn luyện dịch](README_LUYEN_DICH.md) để biết chi tiết lưu dữ liệu và cách chấm.

### Thêm bài bằng JavaScript

Bạn cũng có thể thêm bài ngay trên website: mở **Thêm bài bằng JSON** bên dưới phần chọn bài, sao chép mẫu có sẵn, sửa nội dung rồi dán vào ô nhập và bấm **Kiểm tra & thêm bài**. Mỗi bài có 1–50 cặp câu, một lần nhập tối đa 20 bài. Bài được lưu trên trình duyệt, dùng được cho cả hai chiều và chấm AI; không tự đăng cho mọi người. Nút **Tải JSON các bài đã thêm** giúp sao lưu. Xem chi tiết trong [hướng dẫn luyện dịch](README_LUYEN_DICH.md).

Sửa [lib/translation-lessons.js](lib/translation-lessons.js). Thêm object vào mảng `translationLessons`, tại dòng ghi **THÊM OBJECT BÀI MỚI TẠI ĐÂY**. Cuối file đã có mẫu để sao chép.

| Trường | Yêu cầu |
| --- | --- |
| `id` | Duy nhất, giữ ổn định vì được dùng làm khóa lưu bản nháp |
| `topic` | Chủ đề; chủ đề mới tự xuất hiện trong bộ lọc |
| `level` | `N3` cho bộ bài hiện tại |
| `title`, `japaneseTitle` | Tiêu đề tiếng Việt và tiếng Nhật |
| `sentences` | 10–15 câu; mỗi phần tử là một câu |
| `vocabulary` | Các bộ ba `[Kanji, hiragana, nghĩa tiếng Việt]` |
| `grammar` | Các bộ đôi `[cấu trúc, cách dùng]` |
| `translation` | Một bản dịch cho mỗi câu, cùng số lượng và thứ tự với `sentences` |
| `explanations` | Ghi chú cách ngắt câu, chọn từ và sắc thái |

Ví dụ một câu có furigana:

```javascript
"[明日|あした]、[京都|きょうと]へ[行|い]きます。"
```

Cú pháp `[Kanji|hiragana]` được giao diện chuyển thành ruby; không chèn HTML vào nội dung. Sau khi thêm bài, chạy:

```bash
node --test tests/translation-lessons.test.mjs
npx tsc --noEmit
```

Xem thêm [README_LUYEN_DICH.md](README_LUYEN_DICH.md).

## Thêm và cập nhật đề thi

1. Sao chép [exam-template.json](exam-template.json) thành `public/data/exams/<examId>.json`.
2. Đặt `id` trùng tên file không có đuôi `.json`; dùng ID câu hỏi duy nhất trong đề.
3. Điền nội dung, lựa chọn, đáp án đúng và giải thích tiếng Việt cho từng lựa chọn.
4. Với câu đọc hiểu, tạo phần tử trong `passages` và dùng đúng `passageId` ở câu hỏi.
5. Đặt hình minh họa trong `public/data/exams/assets/<examId>/`; đường dẫn dùng trong web bắt đầu bằng `/data/exams/assets/`, không có tiền tố `public`.
6. Kiểm tra thủ công nội dung. Chỉ đặt trạng thái `published` và đánh dấu câu hỏi `verified` sau khi đã duyệt; bản mẫu không phải đề hoàn chỉnh để xuất bản ngay.
7. Chạy `npm run exams:sync` và sửa các lỗi được báo.
8. Kiểm tra đề trên giao diện, sau đó đưa file đề, hình ảnh và `index.json` được tạo lại vào cùng thay đổi Git.

Các trường cần chú ý gồm `schemaVersion: "1.0.0"`, `level: "N3"`, `status`, `settings.timeLimitMinutes`, `questions`, `questionCount` và `passages`. Số lượng `questionCount` phải khớp dữ liệu; `correctOptionId` phải tham chiếu một lựa chọn tồn tại.

Dùng `lib/types.ts`, `lib/validation.ts` và `scripts/sync-exams.mjs` làm nguồn đối chiếu khi mở rộng cấu trúc. Không chỉ sửa `index.json`: script đồng bộ tạo lại danh mục từ các file đề.

Giao diện quản trị hỗ trợ nhập và xuất bản đề qua API. Endpoint xuất bản hiện ghi file vào thư mục dự án và gọi script đồng bộ; thao tác này cần môi trường Node có quyền ghi vào filesystem. Nó không tự commit hoặc push thay đổi lên GitHub.

## Dữ liệu và tiến độ học

| Loại dữ liệu | Nơi lưu |
| --- | --- |
| Đề và lời giải | `public/data/exams/*.json` |
| Nội dung chuyên đề | `public/data/learning/` |
| Bài dịch mẫu | `lib/translation-lessons.js` |
| Lượt làm bài, khảo sát, đánh dấu, báo lỗi câu hỏi | localStorage qua `lib/storage.ts` |
| Flashcard và lịch ôn | localStorage qua `lib/storage.ts` |
| Tiến độ chuyên đề | `jlptn3:v1:learning_progress` |
| Bản nháp, điểm và thời gian dịch | `vuyanh-translation-v2:<lessonId>:<direction>`; bản nháp cũ giữ ở khóa v1 |

Dữ liệu cá nhân gắn với trình duyệt và origin của website. Đổi thiết bị, trình duyệt, tên miền hoặc cổng local có thể khiến dữ liệu không xuất hiện. Xóa dữ liệu website sẽ xóa tiến độ đã lưu; chế độ riêng tư có thể chỉ giữ dữ liệu trong phiên.

Dữ liệu đề trong `public/` có thể được truy cập trực tiếp, bao gồm lời giải. Chế độ thi thử dùng cho tự luyện, không phải hệ thống thi có cơ chế bảo mật đáp án. Giới hạn tần suất API hiện lưu trong bộ nhớ tiến trình, không phải bộ đếm dùng chung giữa nhiều máy chủ.

## Lệnh phát triển và kiểm tra

| Lệnh | Mục đích |
| --- | --- |
| `npm run dev` | Chạy server phát triển |
| `npm run exams:sync` | Kiểm tra đề và ghi lại danh mục `index.json` |
| `npm run build` | Đồng bộ đề rồi build production |
| `npm run start` | Chạy bản production đã build |
| `npm test` | Chạy các file `tests/*.test.mjs` |
| `npx tsc --noEmit` | Kiểm tra kiểu TypeScript |
| `node --test tests/translation-lessons.test.mjs tests/translation-grading.test.mjs` | Kiểm tra dữ liệu bài dịch và API chấm với nhà cung cấp giả lập |
| `npm run lint` | Gọi `next lint`; cần cấu hình ESLint phù hợp nếu dự án yêu cầu thiết lập ban đầu |

Thư mục `tests/` có các kiểm tra về chia động từ, Kanji, Hán Việt, flashcard, tính điểm, bài đọc và dữ liệu luyện dịch. Chúng không thay thế việc thử trực tiếp các luồng người dùng trên trình duyệt.

Khi sửa giao diện luyện dịch, kiểm tra thêm: đổi chủ đề, chuyển bài, bật/tắt furigana, ẩn gợi ý, chạy/dừng đồng hồ, mở đáp án, tải lại trang để khôi phục bản nháp và bố cục trên màn hình nhỏ.

## Triển khai

Dự án có `vercel.json` khai báo framework Next.js. Có thể triển khai từ repository GitHub hoặc chạy trên máy chủ Node với bản production.

Với quy trình build của dự án, dùng:

```bash
npm ci
npm run build
npm run start
```

Trên nền tảng quản lý Next.js, cấu hình lệnh build là `npm run build` để bước kiểm tra và đồng bộ đề được thực hiện. Đặt biến môi trường trong cấu hình của môi trường triển khai, không đưa `.env.local` lên GitHub.

Các trang học đọc dữ liệu đã đi kèm bản build. Khi thêm đề hoặc bài dịch vào mã nguồn, cần build và triển khai lại để bản đang phục vụ có dữ liệu mới.

API xuất bản đề phụ thuộc ghi file vào thư mục dự án; không thiết kế như một kho lưu trữ bền vững cho môi trường serverless. Với quy trình triển khai từ Git, cách cập nhật nội dung có thể tái lập là duyệt dữ liệu tại local, commit các file liên quan rồi triển khai lại. Muốn biên tập trực tuyến bền vững cần bổ sung một cơ chế lưu trữ phù hợp.

## Xử lý lỗi thường gặp

| Hiện tượng | Cách kiểm tra |
| --- | --- |
| Build dừng ở bước đồng bộ | Đọc tên file và câu hỏi bị báo lỗi; kiểm tra số câu, lựa chọn, đáp án, giải thích, trạng thái duyệt và `passageId` |
| Đề mới chưa xuất hiện | Kiểm tra ID/tên file, chạy lại đồng bộ, xem trạng thái đề và triển khai lại |
| Không gọi được AI | Kiểm tra khóa, tên biến, model, quyền tài khoản, hạn mức và kết nối mạng; khởi động lại sau khi sửa `.env.local` |
| API quản trị trả `401` | Kiểm tra mã nhập trong giao diện có trùng `ADMIN_SECRET` của server không |
| API trả `429` | Giảm tần suất yêu cầu; kiểm tra thông báo để phân biệt giới hạn của ứng dụng và nhà cung cấp AI |
| Bản nháp hoặc tiến độ không xuất hiện | Kiểm tra đúng trình duyệt/origin, chế độ riêng tư và việc localStorage có bị chặn hoặc bị xóa không |
| Furigana hiển thị nguyên dấu ngoặc | Sửa dữ liệu về đúng cú pháp `[Kanji|hiragana]`, chạy kiểm tra bài dịch |
| Không chuyển được bài tiếp theo | Chủ đề đang lọc chỉ có một bài; chọn **Tất cả** hoặc chủ đề khác |
| Cảnh báo tải Google Fonts | Kiểm tra kết nối mạng; giao diện có phông dự phòng trong CSS |
| Không lưu được đề trên môi trường triển khai | Kiểm tra quyền ghi filesystem và mô hình hosting; dùng quy trình cập nhật dữ liệu qua Git nếu không có kho lưu bền vững |

## Quy trình đóng góp

1. Tạo nhánh riêng từ phiên bản cần chỉnh sửa.
2. Giữ thay đổi tập trung: giao diện, dữ liệu học hoặc tài liệu.
3. Kiểm tra nội dung tiếng Nhật và bản dịch nếu sửa bài học; không đánh dấu đã duyệt khi chưa kiểm chứng đáp án.
4. Chạy các kiểm tra phù hợp và xem diff để tránh đưa nhầm dữ liệu cá nhân hoặc bí mật vào commit.
5. Commit các file liên quan; sau khi được duyệt, push nhánh và mở pull request để xem xét trước khi nhập vào `main`.

Ví dụ tạo nhánh cho công việc mới:

```bash
git switch -c codex/ten-thay-doi
```

Tài liệu liên quan: [hướng dẫn luyện dịch](README_LUYEN_DICH.md), [mẫu đề](exam-template.json), [hướng dẫn chuyển đổi đề sang JSON](PROMPT_CONVERT_EXAM_TO_JSON.md).
