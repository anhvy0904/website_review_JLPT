"use client";

import { useEffect, useRef, useState } from "react";
import { Clock3, Languages, Pause, Play } from "lucide-react";
import { translationLessons } from "@/lib/translation-lessons";
import TranslationLessonImporter from "@/components/TranslationLessonImporter";
import { CUSTOM_LESSONS_KEY, parseLessonImport, readCustomLessons, type CustomTranslationLesson } from "@/lib/translation-import";

import { gradeSchema, gradeTotal, type TranslationDirection, type TranslationGrade } from "@/lib/translation-grading";

type SentenceWork = { answer: string; grade?: TranslationGrade; revealed?: boolean };
type Lesson = (typeof translationLessons)[number];
const button = "inline-flex items-center justify-center gap-2 rounded-xl border border-emerald-200 bg-white px-4 py-2.5 text-sm font-semibold text-emerald-900 hover:bg-emerald-50 disabled:opacity-50 disabled:cursor-not-allowed focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-700";
const primaryButton = `${button} !bg-emerald-800 !text-white hover:!bg-emerald-900`;

function JapaneseSentence({ text, furigana }: { text: string; furigana: boolean }) {
  return <>{text.split(/(\[[^\[\]|]+\|[^\[\]|]+\])/g).map((part, index) => {
    const match = part.match(/^\[([^|]+)\|([^\]]+)\]$/);
    if (!match) return <span key={index}>{part}</span>;
    return furigana ? <ruby key={index}>{match[1]}<rp>（</rp><rt className="text-[0.55em] font-normal text-emerald-700">{match[2]}</rt><rp>）</rp></ruby> : <span key={index}>{match[1]}</span>;
  })}</>;
}

function SentenceCard({ index, lesson, direction, furigana, work, update, onStart, onPause, ready }: {
  index: number; lesson: Lesson; direction: TranslationDirection; furigana: boolean;
  work: SentenceWork; update: (work: SentenceWork) => void; onStart: () => void; onPause: () => void; ready: boolean;
}) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const request = useRef<AbortController | null>(null);
  useEffect(() => () => request.current?.abort(), []);
  const toJapanese = direction === "vi-ja";
  async function grade() {
    if (!work.answer.trim() || busy) return;
    onPause();
    setBusy(true);
    setError("");
    const controller = new AbortController();
    request.current = controller;
    const timeout = window.setTimeout(() => controller.abort(), 28000);
    try {
      const response = await fetch("/api/ai/translation", {
        method: "POST", headers: { "Content-Type": "application/json" }, signal: controller.signal,
        body: JSON.stringify({ lessonId: lesson.id, sentenceIndex: index, direction, answer: work.answer,
          ...(!translationLessons.some((item) => item.id === lesson.id) ? { customLesson: lesson } : {}),
        }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(typeof data.error === "string" ? data.error : "Không thể chấm câu này.");
      const result = gradeSchema.safeParse(data.grade);
      if (!result.success) throw new Error("Kết quả chấm chưa hợp lệ. Hãy thử lại.");
      if (!controller.signal.aborted) update({ ...work, grade: result.data, revealed: true });
    } catch (err) {
      setError(controller.signal.aborted ? "Yêu cầu đã hết thời gian chờ. Bạn có thể thử chấm lại." : err instanceof Error ? err.message : "Không thể kết nối AI.");
    } finally {
      window.clearTimeout(timeout);
      setBusy(false);
    }
  }
  return <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7" aria-labelledby={`sentence-title-${index}`}>
    <div className="flex items-center justify-between gap-4"><h3 id={`sentence-title-${index}`} className="font-bold text-emerald-900">Câu {index + 1} <span className="font-normal text-slate-500">/ {lesson.sentences.length}</span></h3><span className="text-sm font-semibold text-emerald-800">{work.grade ? `${gradeTotal(work.grade)}/10 điểm` : work.revealed ? "Đã xem mẫu · Chưa chấm" : "Chưa chấm"}</span></div>
    <div lang={toJapanese ? "vi" : "ja"} className={`mt-4 rounded-xl bg-emerald-50 p-4 text-lg leading-[2.4] text-slate-800 ${toJapanese ? "" : "font-japanese"}`}>
      {toJapanese ? lesson.translation[index] : <JapaneseSentence text={lesson.sentences[index]} furigana={furigana} />}
    </div>
    <label htmlFor={`sentence-input-${index}`} className="mb-2 mt-4 block text-sm font-semibold text-slate-700">Bản dịch {toJapanese ? "tiếng Nhật" : "tiếng Việt"} của bạn</label>
    <textarea id={`sentence-input-${index}`} lang={toJapanese ? "ja" : "vi"} maxLength={1500} disabled={!ready || busy} value={work.answer}
      onChange={(event) => { update({ answer: event.target.value }); setError(""); onStart(); }}
      placeholder={toJapanese ? "Nhập câu tiếng Nhật tại đây…" : "Nhập câu tiếng Việt tại đây…"}
      className={`min-h-28 w-full resize-y rounded-xl border border-slate-300 p-4 text-lg leading-8 focus:outline-emerald-700 disabled:bg-slate-50 ${toJapanese ? "font-japanese" : ""}`} />
    <div className="mt-3 flex flex-wrap items-center gap-3">
      <button className={primaryButton} disabled={!ready || busy || !work.answer.trim()} onClick={grade}>{busy ? "Đang chấm…" : work.grade ? "Chấm lại câu này" : "Chấm câu này"}</button>
      <button className={button} disabled={!ready || busy} aria-expanded={!!work.revealed} aria-controls={`sentence-result-${index}`} onClick={() => { onPause(); update({ ...work, revealed: !work.revealed }); }}>{work.revealed ? "Ẩn đối chiếu" : "So sánh với đáp án"}</button>
      <span className="text-sm text-slate-500">{work.answer.length}/1.500 ký tự</span>
    </div>
    {error && <p role="alert" className="mt-3 text-sm text-rose-700">{error}</p>}
    <div id={`sentence-result-${index}`} hidden={!work.revealed} className="mt-5 space-y-4 border-t border-slate-200 pt-5">
      {work.grade && <div className="rounded-xl bg-emerald-50 p-4" role="status">
        <h4 className="font-bold text-emerald-950">Đánh giá câu {index + 1}: {gradeTotal(work.grade)}/10</h4>
        <p className="mt-2 text-sm text-emerald-800">Đúng ý: {work.grade.meaning}/6 · Ngữ pháp: {work.grade.grammar}/2 · Tự nhiên: {work.grade.naturalness}/2</p>
        <p className="mt-3 whitespace-pre-wrap leading-7 text-slate-700">{work.grade.feedback}</p>
        <p className="mt-3 text-sm font-semibold text-emerald-900">Gợi ý sửa câu của bạn</p>
        <p lang={toJapanese ? "ja" : "vi"} className="mt-1 whitespace-pre-wrap text-lg leading-8">{work.grade.correction}</p>
      </div>}
      <div><h4 className="text-sm font-semibold text-slate-600">Đáp án tham khảo · Có thể có cách dịch đúng khác</h4><p lang={toJapanese ? "ja" : "vi"} className="mt-2 text-lg leading-[2.4]">{toJapanese ? <JapaneseSentence text={lesson.sentences[index]} furigana={furigana} /> : lesson.translation[index]}</p></div>
      {index < lesson.sentences.length - 1 && <button className={button} onClick={() => document.getElementById(`sentence-input-${index + 1}`)?.focus()}>Tiếp tục câu {index + 2}</button>}
    </div>
  </article>;
}

function LessonWorksheet({ lesson, direction, furigana, hints, next, hasNext }: {
  lesson: Lesson; direction: TranslationDirection; furigana: boolean; hints: boolean; next: () => void; hasNext: boolean;
}) {
  const [rows, setRows] = useState<SentenceWork[]>(() => lesson.sentences.map(() => ({ answer: "" })));
  const [legacyDraft, setLegacyDraft] = useState("");
  const [elapsed, setElapsed] = useState(0);
  const [running, setRunning] = useState(false);
  const [ready, setReady] = useState(false);
  const [storageError, setStorageError] = useState(false);
  const timerStart = useRef<number | null>(null);
  const timeBeforeStart = useRef(0);
  const storageKey = `vuyanh-translation-v2:${lesson.id}:${direction}`;

  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(storageKey) || "null");
      if (saved && Array.isArray(saved.rows)) {
        setRows(lesson.sentences.map((_, index) => {
          const row = saved.rows[index];
          if (!row || typeof row.answer !== "string") return { answer: "" };
          const grade = gradeSchema.safeParse(row.grade);
          return { answer: row.answer.slice(0, 1500), revealed: row.revealed === true, ...(grade.success ? { grade: grade.data } : {}) };
        }));
      }
      const legacy = JSON.parse(localStorage.getItem(`vuyanh-translation-v1:${lesson.id}`) || "null");
      if (legacy && typeof legacy.draft === "string") setLegacyDraft(legacy.draft);
      if (saved && typeof saved.elapsed === "number" && Number.isFinite(saved.elapsed) && saved.elapsed >= 0) setElapsed(saved.elapsed);
    } catch { setStorageError(true); }
    setReady(true);
  }, [storageKey, lesson]);

  useEffect(() => {
    if (!ready) return;
    try {
      localStorage.setItem(storageKey, JSON.stringify({ rows, elapsed }));
      setStorageError(false);
    } catch { setStorageError(true); }
  }, [rows, elapsed, ready, storageKey]);

  function pause() {
    if (timerStart.current !== null) {
      setElapsed(timeBeforeStart.current + Date.now() - timerStart.current);
      timerStart.current = null;
    }
    setRunning(false);
  }

  function start() {
    if (timerStart.current !== null || !ready) return;
    timeBeforeStart.current = elapsed;
    timerStart.current = Date.now();
    setRunning(true);
  }

  useEffect(() => {
    if (!running) return;
    const interval = window.setInterval(() => {
      if (timerStart.current !== null) setElapsed(timeBeforeStart.current + Date.now() - timerStart.current);
    }, 250);
    const onHide = () => { if (document.hidden) pause(); };
    document.addEventListener("visibilitychange", onHide);
    return () => {
      window.clearInterval(interval);
      document.removeEventListener("visibilitychange", onHide);
    };
  }, [running]);

  const seconds = Math.floor(elapsed / 1000);
  const time = `${String(Math.floor(seconds / 60)).padStart(2, "0")}:${String(seconds % 60).padStart(2, "0")}`;

  return <>
    <section className="flex flex-col justify-between gap-5 rounded-2xl border border-emerald-200 bg-emerald-50/70 p-5 sm:flex-row sm:items-center sm:p-6">
      <div>
        <p className="mb-2 text-sm font-semibold text-emerald-800">JLPT {lesson.level} · {lesson.topic} · {lesson.sentences.length} câu</p>
        <h2 className="text-2xl font-bold tracking-tight text-emerald-950">{lesson.title}</h2>
        <p lang="ja" className="mt-2 font-japanese text-slate-600">{lesson.japaneseTitle}</p>
      </div>
      <div className="shrink-0 rounded-xl border border-emerald-200 bg-white p-4">
        <div className="flex items-center justify-between gap-6 text-sm text-slate-600"><span className="flex items-center gap-2"><Clock3 size={16} aria-hidden="true" /> Thời gian dịch</span><span>{running ? "Đang chạy" : "Tạm dừng"}</span></div>
        <div className="mt-2 flex items-center justify-between gap-4">
          <span role="timer" aria-label={`Thời gian dịch ${Math.floor(seconds / 60)} phút ${seconds % 60} giây`} className="font-mono text-3xl font-semibold tabular-nums text-emerald-950">{time}</span>
          <button className={button} disabled={!ready} onClick={running ? pause : start}>{running ? <Pause size={16} /> : <Play size={16} />}{running ? "Tạm dừng" : "Bắt đầu"}</button>
        </div>
        <button className="mt-2 text-sm text-slate-600 underline underline-offset-4" disabled={!ready} onClick={() => { pause(); setElapsed(0); }}>Đặt lại thời gian</button>
      </div>
    </section>

    <section id="translation-hints" hidden={!hints} className={`${hints ? "grid" : "hidden"} gap-6 md:grid-cols-2`}>
      <div className="rounded-2xl border border-emerald-100 bg-white p-5 sm:p-6"><h3 className="mb-4 text-lg font-bold text-emerald-950">Từ vựng gợi ý</h3><div className="grid gap-3 sm:grid-cols-2">{lesson.vocabulary.map(([word, reading, meaning]) => <div key={word} className="rounded-xl bg-emerald-50/70 p-4"><p lang="ja" className="font-japanese text-xl font-semibold text-emerald-950">{word}</p><p lang="ja" className="mt-1 text-sm text-emerald-700">{reading}</p><p className="mt-2 text-sm leading-relaxed text-slate-700">{meaning}</p></div>)}</div></div>
      <div className="rounded-2xl border border-emerald-100 bg-white p-5 sm:p-6"><h3 className="mb-4 text-lg font-bold text-emerald-950">Ngữ pháp trọng tâm</h3><div className="space-y-3">{lesson.grammar.map(([pattern, usage]) => <div key={pattern} className="rounded-xl border border-slate-200 p-4"><p lang="ja" className="font-japanese text-lg font-semibold text-emerald-900">{pattern}</p><p className="mt-1 text-sm leading-relaxed text-slate-600">{usage}</p></div>)}</div></div>
    </section>

    <section className="space-y-4" aria-label="Dịch từng câu">
      <div className="rounded-xl border border-emerald-200 bg-white p-4">
        <p className="font-semibold text-emerald-950">{rows.filter((row) => row.grade).length}/{rows.length} câu đã chấm{rows.some((row) => row.grade) && ` · Điểm trung bình: ${(rows.reduce((sum, row) => sum + (row.grade ? gradeTotal(row.grade) : 0), 0) / rows.filter((row) => row.grade).length).toFixed(1)}/10`}</p>
        <p className="mt-2 text-sm leading-6 text-slate-600">Nhập và chấm từng câu từ trên xuống. AI đánh giá đúng ý (6 điểm), ngữ pháp (2 điểm), độ tự nhiên (2 điểm); chấp nhận cách dịch khác đáp án. Điểm AI mang tính tham khảo.</p>
        <p role="status" className="mt-2 text-sm text-slate-500">{!ready ? "Đang tải bản nháp…" : storageError ? "Không lưu được trên trình duyệt này. Hãy sao chép bản dịch trước khi rời trang." : "Tự lưu câu trả lời, điểm và thời gian riêng cho mỗi chiều dịch."}</p>
      </div>
      {legacyDraft && <details className="rounded-xl border border-amber-200 bg-amber-50 p-4"><summary className="cursor-pointer font-semibold text-amber-900">Bản nháp cả bài từ phiên bản trước (Nhật → Việt)</summary><p className="mt-3 whitespace-pre-wrap leading-7">{legacyDraft}</p><p className="mt-2 text-sm text-slate-600">Bạn có thể sao chép từng câu sang các ô bên dưới. Bản gốc vẫn được giữ nguyên.</p></details>}
      {lesson.sentences.map((_, index) => <SentenceCard key={index} index={index} lesson={lesson} direction={direction} furigana={furigana} work={rows[index]} ready={ready}
        onStart={start} onPause={pause} update={(work) => setRows((current) => current.map((row, position) => position === index ? work : row))} />)}
    </section>

    <details className="rounded-2xl border border-emerald-200 bg-white p-5 sm:p-7">
      <summary className="cursor-pointer text-lg font-bold text-emerald-950">Ghi chú cách ngắt câu & chọn từ của bài</summary>
      <ul className="mt-4 list-disc space-y-3 pl-5 text-base leading-7 text-slate-700">{lesson.explanations.map((explanation) => <li key={explanation}>{explanation}</li>)}</ul>
    </details>
    <div className="flex flex-wrap items-center justify-between gap-4"><p className="text-sm text-slate-500">{hasNext ? "Đổi bài vẫn giữ bản nháp và thời gian của bài hiện tại." : "Chủ đề này có một bài. Chọn “Tất cả” để luyện thêm."}</p><button className={primaryButton} disabled={!hasNext} onClick={() => { pause(); next(); }}>Bài tiếp theo</button></div>
  </>;
}

export default function TranslationPractice() {
  const [customLessons, setCustomLessons] = useState<CustomTranslationLesson[]>([]);
  const [importsReady, setImportsReady] = useState(false);
  const [storageWarning, setStorageWarning] = useState("");
  useEffect(() => {
    try {
      setCustomLessons(readCustomLessons(localStorage.getItem(CUSTOM_LESSONS_KEY), translationLessons.map((item) => item.id)));
      setImportsReady(true);
    } catch {
      setStorageWarning("Không đọc được kho bài tự thêm. Dữ liệu gốc được giữ nguyên. Hãy kiểm tra quyền lưu dữ liệu của trình duyệt hoặc dùng trình duyệt khác để nhập bản JSON đã sao lưu.");
    }
  }, []);
  const lessons: Lesson[] = [...translationLessons, ...customLessons];
  const topics = ["Tất cả", ...Array.from(new Set(lessons.map((item) => item.topic)))];
  const [direction, setDirection] = useState<TranslationDirection>("vi-ja");
  const [topic, setTopic] = useState("Tất cả");
  const [lessonId, setLessonId] = useState(translationLessons[0].id);
  const [furigana, setFurigana] = useState(false);
  const [hints, setHints] = useState(true);
  const filtered = lessons.filter((lesson) => topic === "Tất cả" || lesson.topic === topic);
  const lesson = filtered.find((item) => item.id === lessonId) || filtered[0];

  function importLessons(incoming: CustomTranslationLesson[]) {
    if (!importsReady) throw new Error("Chưa đọc xong kho bài tự thêm.");
    // Re-read before saving so importing in another tab cannot silently lose lessons.
    const existing = readCustomLessons(localStorage.getItem(CUSTOM_LESSONS_KEY), translationLessons.map((item) => item.id));
    const validated = parseLessonImport(JSON.stringify(incoming), [...translationLessons, ...existing].map((item) => item.id));
    if (existing.length + validated.length > 100) throw new Error("Kho cá nhân tối đa 100 bài. Hãy giữ bản JSON sao lưu để sử dụng ở trình duyệt khác.");
    const updated = [...existing, ...validated];
    try { localStorage.setItem(CUSTOM_LESSONS_KEY, JSON.stringify(updated)); }
    catch { throw new Error("Chưa lưu được bài: trình duyệt chặn lưu trữ hoặc đã đầy. Hãy giữ lại JSON, kiểm tra bộ nhớ rồi thử lại."); }
    setCustomLessons(updated);
    setTopic("Tất cả");
    setLessonId(validated[0].id);
  }

  return <main className="mx-auto max-w-7xl space-y-6 px-4 py-8 sm:px-6 lg:px-8">
    <header className="max-w-3xl space-y-3"><p className="flex items-center gap-2 text-sm font-semibold text-emerald-700"><Languages size={18} /> GÓC LUYỆN DỊCH · JLPT N3</p><h1 className="text-3xl font-extrabold tracking-tight text-emerald-950 sm:text-4xl">Luyện dịch hai chiều, tiến bộ từng câu.</h1><p className="text-base leading-7 text-slate-600">Chọn Việt → Nhật hoặc Nhật → Việt. Viết từng câu, so sánh với mẫu và nhận điểm cùng nhận xét ngay bên dưới.</p></header>
    <div className="flex flex-wrap gap-2" aria-label="Chiều dịch">
      <button className={direction === "vi-ja" ? primaryButton : button} aria-pressed={direction === "vi-ja"} onClick={() => setDirection("vi-ja")}>Việt → Nhật</button>
      <button className={direction === "ja-vi" ? primaryButton : button} aria-pressed={direction === "ja-vi"} onClick={() => setDirection("ja-vi")}>Nhật → Việt</button>
    </div>
    <section aria-label="Chọn bài học" className="space-y-4 rounded-2xl border border-slate-200 bg-white p-4 sm:p-5">
      <div aria-label="Chủ đề" className="flex flex-wrap gap-2">{topics.map((item) => <button key={item} aria-pressed={topic === item} className={topic === item ? primaryButton : button} onClick={() => { setTopic(item); const first = lessons.find((entry) => item === "Tất cả" || entry.topic === item); if (first) setLessonId(first.id); }}>{item}</button>)}</div>
      <div className="flex flex-col gap-4 border-t border-slate-100 pt-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="min-w-0 sm:max-w-md sm:flex-1"><label htmlFor="lesson-select" className="mb-2 block text-sm font-semibold text-slate-600">Danh sách bài đọc · {filtered.length} bài</label><select id="lesson-select" value={lesson.id} onChange={(event) => setLessonId(event.target.value)} className="w-full rounded-xl border border-slate-300 bg-white p-3 text-base text-slate-800 focus:outline-emerald-700">{filtered.map((item, index) => <option key={item.id} value={item.id}>{index + 1}. {item.title}</option>)}</select></div>
        <div className="flex flex-wrap gap-2"><button className={button} aria-pressed={furigana} onClick={() => setFurigana(!furigana)}>{furigana ? "Tắt Furigana" : "Bật Furigana"}</button><button className={button} aria-expanded={hints} aria-controls="translation-hints" onClick={() => setHints(!hints)}>{hints ? "Ẩn gợi ý" : "Hiện gợi ý"}</button></div>
      </div>
    </section>
    <TranslationLessonImporter existingIds={lessons.map((item) => item.id)} customLessons={customLessons} ready={importsReady} storageWarning={storageWarning} onImport={importLessons} />
    <LessonWorksheet key={`${lesson.id}:${direction}`} lesson={lesson} direction={direction} furigana={furigana} hints={hints} hasNext={filtered.length > 1} next={() => setLessonId(filtered[(filtered.findIndex((item) => item.id === lesson.id) + 1) % filtered.length].id)} />
  </main>;
}
