"use client";

import { useEffect, useRef, useState } from "react";
import { BookOpen, Clock3, Languages, Pause, Play } from "lucide-react";
import { translationLessons } from "@/lib/translation-lessons";

type Lesson = (typeof translationLessons)[number];
const topics = ["Tất cả", ...Array.from(new Set(translationLessons.map((lesson) => lesson.topic)))];
const button = "inline-flex items-center justify-center gap-2 rounded-xl border border-emerald-200 bg-white px-4 py-2.5 text-sm font-semibold text-emerald-900 hover:bg-emerald-50 disabled:opacity-50 disabled:cursor-not-allowed focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-700";
const primaryButton = `${button} !bg-emerald-800 !text-white hover:!bg-emerald-900`;

function JapaneseSentence({ text, furigana }: { text: string; furigana: boolean }) {
  return <>{text.split(/(\[[^\[\]|]+\|[^\[\]|]+\])/g).map((part, index) => {
    const match = part.match(/^\[([^|]+)\|([^\]]+)\]$/);
    if (!match) return <span key={index}>{part}</span>;
    return furigana ? <ruby key={index}>{match[1]}<rp>（</rp><rt className="text-[0.55em] font-normal text-emerald-700">{match[2]}</rt><rp>）</rp></ruby> : <span key={index}>{match[1]}</span>;
  })}</>;
}

function LessonWorksheet({ lesson, furigana, hints, next, hasNext }: {
  lesson: Lesson; furigana: boolean; hints: boolean; next: () => void; hasNext: boolean;
}) {
  const [draft, setDraft] = useState("");
  const [elapsed, setElapsed] = useState(0);
  const [running, setRunning] = useState(false);
  const [answer, setAnswer] = useState(false);
  const [ready, setReady] = useState(false);
  const [storageError, setStorageError] = useState(false);
  const timerStart = useRef<number | null>(null);
  const timeBeforeStart = useRef(0);
  const storageKey = `vuyanh-translation-v1:${lesson.id}`;

  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(storageKey) || "null");
      if (saved && typeof saved.draft === "string") setDraft(saved.draft);
      if (saved && typeof saved.elapsed === "number" && Number.isFinite(saved.elapsed) && saved.elapsed >= 0) setElapsed(saved.elapsed);
    } catch { setStorageError(true); }
    setReady(true);
  }, [storageKey]);

  useEffect(() => {
    if (!ready) return;
    try {
      localStorage.setItem(storageKey, JSON.stringify({ draft, elapsed }));
      setStorageError(false);
    } catch { setStorageError(true); }
  }, [draft, elapsed, ready, storageKey]);

  function pause() {
    if (timerStart.current !== null) {
      setElapsed(timeBeforeStart.current + Date.now() - timerStart.current);
      timerStart.current = null;
    }
    setRunning(false);
  }

  function start() {
    if (timerStart.current !== null || !ready || answer) return;
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
          <button className={button} disabled={!ready || answer} onClick={running ? pause : start}>{running ? <Pause size={16} /> : <Play size={16} />}{running ? "Tạm dừng" : "Bắt đầu"}</button>
        </div>
        <button className="mt-2 text-sm text-slate-600 underline underline-offset-4" disabled={!ready} onClick={() => { pause(); setElapsed(0); }}>Đặt lại thời gian</button>
      </div>
    </section>

    <div className="grid items-start gap-6 lg:grid-cols-2">
      <section aria-labelledby="reading-title" className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7">
        <div className="mb-5 flex items-center justify-between gap-3 border-b border-slate-100 pb-4"><h3 id="reading-title" className="flex items-center gap-2 text-lg font-bold text-emerald-950"><BookOpen size={20} />Đoạn văn tiếng Nhật</h3><span className="text-sm text-slate-500">日本語</span></div>
        <div lang="ja" className="font-japanese text-xl leading-[2.8] text-slate-800 break-words">
          {lesson.sentences.map((sentence, index) => <span key={index}><JapaneseSentence text={sentence} furigana={furigana} />{" "}</span>)}
        </div>
      </section>

      <section aria-labelledby="draft-title" className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7">
        <div className="mb-3 flex items-center justify-between gap-3"><h3 id="draft-title" className="text-lg font-bold text-emerald-950"><label htmlFor="translation-draft">Bài dịch của bạn</label></h3><span className="text-sm text-slate-500">Tiếng Việt</span></div>
        <p id="draft-help" className="mb-4 text-sm leading-relaxed text-slate-600">Đọc trọn câu, xác định ý chính rồi diễn đạt bằng tiếng Việt tự nhiên. Đồng hồ tự bắt đầu khi bạn gõ và tạm dừng khi rời tab.</p>
        <textarea id="translation-draft" aria-describedby="draft-help save-status" disabled={!ready} value={draft} onChange={(event) => { setDraft(event.target.value); start(); }} placeholder="Viết bản dịch tiếng Việt của bạn tại đây…" className="min-h-[360px] w-full resize-y rounded-xl border border-slate-300 bg-slate-50/50 p-4 text-base leading-8 text-slate-800 outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100" />
        <div className="mt-2 flex flex-wrap justify-between gap-2 text-sm text-slate-500"><span id="save-status" role="status">{!ready ? "Đang tải bản nháp…" : storageError ? "Không thể lưu trên trình duyệt này. Hãy sao chép bài dịch trước khi rời trang." : "Bản nháp tự lưu trên trình duyệt này"}</span><span>{draft.trim() ? draft.trim().split(/\s+/).length : 0} từ</span></div>
        <button className={`${primaryButton} mt-6 w-full`} aria-expanded={answer} aria-controls="sample-answer" onClick={() => { pause(); setAnswer(!answer); }}>{answer ? "Ẩn đáp án mẫu & Giải thích" : "Xem đáp án mẫu & Giải thích"}</button>
        <p className="mt-3 text-sm leading-relaxed text-slate-500">Không cần dịch giống từng chữ với đáp án. Hãy đối chiếu ý nghĩa, quan hệ giữa các vế và sắc thái câu.</p>
      </section>
    </div>

    <section id="translation-hints" hidden={!hints} className={`${hints ? "grid" : "hidden"} gap-6 md:grid-cols-2`}>
      <div className="rounded-2xl border border-emerald-100 bg-white p-5 sm:p-6"><h3 className="mb-4 text-lg font-bold text-emerald-950">Từ vựng gợi ý</h3><div className="grid gap-3 sm:grid-cols-2">{lesson.vocabulary.map(([word, reading, meaning]) => <div key={word} className="rounded-xl bg-emerald-50/70 p-4"><p lang="ja" className="font-japanese text-xl font-semibold text-emerald-950">{word}</p><p lang="ja" className="mt-1 text-sm text-emerald-700">{reading}</p><p className="mt-2 text-sm leading-relaxed text-slate-700">{meaning}</p></div>)}</div></div>
      <div className="rounded-2xl border border-emerald-100 bg-white p-5 sm:p-6"><h3 className="mb-4 text-lg font-bold text-emerald-950">Ngữ pháp trọng tâm</h3><div className="space-y-3">{lesson.grammar.map(([pattern, usage]) => <div key={pattern} className="rounded-xl border border-slate-200 p-4"><p lang="ja" className="font-japanese text-lg font-semibold text-emerald-900">{pattern}</p><p className="mt-1 text-sm leading-relaxed text-slate-600">{usage}</p></div>)}</div></div>
    </section>

    <section id="sample-answer" hidden={!answer} className="rounded-2xl border border-emerald-200 bg-white p-5 sm:p-7">
      <h3 className="text-xl font-bold text-emerald-950">Đáp án mẫu & Giải thích</h3>
      <p className="mt-2 text-sm text-slate-500">Một cách diễn đạt tham khảo · Đồng hồ đang tạm dừng</p>
      <p className="mt-5 text-base leading-8 text-slate-700">{lesson.translation.join(" ")}</p>
      <h4 className="mb-3 mt-6 font-semibold text-emerald-900">Cách ngắt câu & chọn từ</h4>
      <ul className="list-disc space-y-3 pl-5 text-base leading-7 text-slate-700">{lesson.explanations.map((explanation) => <li key={explanation}>{explanation}</li>)}</ul>
    </section>
    <div className="flex flex-wrap items-center justify-between gap-4"><p className="text-sm text-slate-500">{hasNext ? "Đổi bài vẫn giữ bản nháp và thời gian của bài hiện tại." : "Chủ đề này có một bài. Chọn “Tất cả” để luyện thêm."}</p><button className={primaryButton} disabled={!hasNext} onClick={() => { pause(); next(); }}>Bài tiếp theo</button></div>
  </>;
}

export default function TranslationPractice() {
  const [topic, setTopic] = useState("Tất cả");
  const [lessonId, setLessonId] = useState(translationLessons[0].id);
  const [furigana, setFurigana] = useState(false);
  const [hints, setHints] = useState(true);
  const filtered = translationLessons.filter((lesson) => topic === "Tất cả" || lesson.topic === topic);
  const lesson = filtered.find((item) => item.id === lessonId) || filtered[0];

  return <main className="mx-auto max-w-7xl space-y-6 px-4 py-8 sm:px-6 lg:px-8">
    <header className="max-w-3xl space-y-3"><p className="flex items-center gap-2 text-sm font-semibold text-emerald-700"><Languages size={18} /> GÓC LUYỆN DỊCH · JLPT N3</p><h1 className="text-3xl font-extrabold tracking-tight text-emerald-950 sm:text-4xl">Đọc tiếng Nhật. Viết bằng lời của bạn.</h1><p className="text-base leading-7 text-slate-600">Luyện dịch Nhật → Việt qua những câu chuyện gần gũi. Tự đọc trước, mở gợi ý khi cần và đối chiếu để hiểu sâu hơn.</p></header>
    <section aria-label="Chọn bài học" className="space-y-4 rounded-2xl border border-slate-200 bg-white p-4 sm:p-5">
      <div aria-label="Chủ đề" className="flex flex-wrap gap-2">{topics.map((item) => <button key={item} aria-pressed={topic === item} className={topic === item ? primaryButton : button} onClick={() => { setTopic(item); const first = translationLessons.find((entry) => item === "Tất cả" || entry.topic === item); if (first) setLessonId(first.id); }}>{item}</button>)}</div>
      <div className="flex flex-col gap-4 border-t border-slate-100 pt-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="min-w-0 sm:max-w-md sm:flex-1"><label htmlFor="lesson-select" className="mb-2 block text-sm font-semibold text-slate-600">Danh sách bài đọc · {filtered.length} bài</label><select id="lesson-select" value={lesson.id} onChange={(event) => setLessonId(event.target.value)} className="w-full rounded-xl border border-slate-300 bg-white p-3 text-base text-slate-800 focus:outline-emerald-700">{filtered.map((item, index) => <option key={item.id} value={item.id}>{index + 1}. {item.title}</option>)}</select></div>
        <div className="flex flex-wrap gap-2"><button className={button} aria-pressed={furigana} onClick={() => setFurigana(!furigana)}>{furigana ? "Tắt Furigana" : "Bật Furigana"}</button><button className={button} aria-expanded={hints} aria-controls="translation-hints" onClick={() => setHints(!hints)}>{hints ? "Ẩn gợi ý" : "Hiện gợi ý"}</button></div>
      </div>
    </section>
    <LessonWorksheet key={lesson.id} lesson={lesson} furigana={furigana} hints={hints} hasNext={filtered.length > 1} next={() => setLessonId(filtered[(filtered.findIndex((item) => item.id === lesson.id) + 1) % filtered.length].id)} />
  </main>;
}
