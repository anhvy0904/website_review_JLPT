"use client";

import { useState } from "react";
import { exampleTranslationLesson, MAX_IMPORT_CHARACTERS, parseLessonImport, type CustomTranslationLesson } from "@/lib/translation-import";

const button = "rounded-xl border border-emerald-200 bg-white px-4 py-2.5 text-sm font-semibold text-emerald-900 hover:bg-emerald-50 disabled:opacity-50 focus-visible:outline-emerald-700";
const sample = JSON.stringify(exampleTranslationLesson, null, 2);

export default function TranslationLessonImporter({ existingIds, customLessons, ready, storageWarning, onImport }: {
  existingIds: string[]; customLessons: CustomTranslationLesson[]; ready: boolean; storageWarning: string;
  onImport: (lessons: CustomTranslationLesson[]) => void;
}) {
  const [input, setInput] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  function importLessons() {
    setMessage(""); setError("");
    try {
      const lessons = parseLessonImport(input, existingIds);
      onImport(lessons);
      setMessage(`Đã lưu ${lessons.length} bài và mở “${lessons[0].title}”. Bài có trong danh sách phía trên.`);
      setInput("");
    } catch (err) { setError(err instanceof Error ? err.message : "Không thể thêm bài."); }
  }
  function download() {
    const url = URL.createObjectURL(new Blob([JSON.stringify(customLessons, null, 2)], { type: "application/json;charset=utf-8" }));
    const link = document.createElement("a");
    link.href = url; link.download = "bai-dich-tu-them.json"; link.click();
    window.setTimeout(() => URL.revokeObjectURL(url), 1000);
  }

  return <details className="rounded-2xl border border-emerald-200 bg-white p-5 sm:p-6">
    <summary className="cursor-pointer text-lg font-bold text-emerald-950">Thêm bài bằng JSON <span className="text-sm font-normal text-slate-500">· {customLessons.length} bài tự thêm</span></summary>
    <p className="mt-3 text-sm leading-6 text-slate-600">Dán một bài hoặc một mảng nhiều bài. Sau khi thêm, bạn luyện được cả Việt → Nhật và Nhật → Việt, so sánh và chấm từng câu như bài có sẵn.</p>
    <p className="mt-2 text-sm leading-6 text-amber-800">Bài tự thêm chỉ lưu trên trình duyệt này, không tự đăng cho mọi người hoặc lên GitHub. Tải JSON để sao lưu hoặc mang sang máy khác.</p>
    {storageWarning && <p role="alert" className="mt-3 text-sm text-rose-700">{storageWarning}</p>}
    <div className="mt-5 grid gap-5 lg:grid-cols-2">
      <div>
        <h3 className="font-semibold text-emerald-900">JSON mẫu có thể dùng ngay</h3>
        <p className="mb-3 mt-2 text-sm leading-6 text-slate-600">Mẫu rút gọn có 3 câu. Bài tự thêm được phép có 1–50 câu; bài luyện N3 đầy đủ nên có 10–15 câu. Đổi ID khi tạo bài mới.</p>
        <pre className="max-h-80 overflow-auto rounded-xl bg-slate-900 p-4 text-sm leading-6 text-slate-100" tabIndex={0} aria-label="Mẫu JSON bài dịch"><code>{sample}</code></pre>
        <button className={`${button} mt-3`} onClick={async () => {
          try { await navigator.clipboard.writeText(sample); setMessage("Đã sao chép JSON mẫu."); }
          catch { setMessage("Trình duyệt chưa cho sao chép tự động. Hãy chọn nội dung trong khung mẫu và sao chép thủ công."); }
        }}>Sao chép JSON mẫu</button>
      </div>
      <div>
        <label htmlFor="lesson-json" className="font-semibold text-emerald-900">Dán JSON bài của bạn</label>
        <p id="lesson-json-help" className="mb-3 mt-2 text-sm leading-6 text-slate-600">Dùng dấu nháy kép, không có chú thích hoặc dấu phẩy thừa. Số câu trong sentences và translation phải bằng nhau, theo cùng thứ tự.</p>
        <textarea id="lesson-json" value={input} onChange={(event) => { setInput(event.target.value); setError(""); setMessage(""); }} aria-describedby="lesson-json-help" aria-invalid={!!error} spellCheck={false} maxLength={MAX_IMPORT_CHARACTERS} placeholder={'{\n  "id": "bai-moi",\n  ...\n}'} className="min-h-80 w-full resize-y rounded-xl border border-slate-300 p-4 font-mono text-sm leading-6 focus:outline-emerald-700" />
        <div className="mt-3 flex flex-wrap gap-2">
          <button className={`${button} !bg-emerald-800 !text-white`} disabled={!ready || !input.trim()} onClick={importLessons}>Kiểm tra & thêm bài</button>
          <button className={button} disabled={!ready || !customLessons.length} onClick={download}>Tải JSON các bài đã thêm</button>
        </div>
        {error && <p role="alert" className="mt-3 whitespace-pre-wrap text-sm leading-6 text-rose-700">{error}</p>}
        {message && <p role="status" className="mt-3 text-sm leading-6 text-emerald-800">{message}</p>}
      </div>
    </div>
    <details className="mt-5 rounded-xl bg-slate-50 p-4">
      <summary className="cursor-pointer font-semibold text-slate-700">Giải thích các trường JSON</summary>
      <ul className="mt-3 list-disc space-y-2 pl-5 text-sm leading-6 text-slate-600">
        <li><code>id</code>: duy nhất, chữ thường không dấu, số và dấu gạch ngang. Trùng ID sẽ báo lỗi, không ghi đè.</li>
        <li><code>topic</code>: chủ đề tự chọn; <code>level</code>: N5, N4, N3, N2 hoặc N1.</li>
        <li><code>title</code> / <code>japaneseTitle</code>: tiêu đề tiếng Việt / tiếng Nhật.</li>
        <li><code>sentences</code>: mảng câu Nhật. Furigana viết <code>[漢字|かんじ]</code>, hoặc viết câu thường.</li>
        <li><code>translation</code>: mảng câu Việt tương ứng, cũng là đề khi luyện Việt → Nhật.</li>
        <li><code>vocabulary</code>: mỗi mục là [từ, cách đọc, nghĩa]; <code>grammar</code>: mỗi mục là [cấu trúc, cách dùng].</li>
        <li><code>explanations</code>: mảng ghi chú. Ba trường gợi ý này có thể dùng mảng rỗng <code>[]</code> nếu chưa có nội dung.</li>
      </ul>
    </details>
  </details>;
}
