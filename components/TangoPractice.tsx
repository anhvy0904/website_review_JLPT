"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Headphones, RotateCcw, Volume2, VolumeX, Eye, EyeOff, Copy, Check, ExternalLink, Download, Sparkles, Trash2, RefreshCw, FileText, Plus, X } from "lucide-react";
import sample from "@/public/data/tango_n3_sample.json";
import defaultChapters from "@/public/data/tango_n3.json";
import { checkTangoAnswer, emptyProgress, progressKey, recordTangoAnswer, selectTangoQueue, tangoDataSchema, tangoProgressSchema,
  TANGO_DATA_KEY, TANGO_PROGRESS_KEY, type TangoChapter, type TangoMode, type TangoProgress, type TangoWord } from "@/lib/tango";
import { useTangoAudio } from "@/components/useTangoAudio";
import { playCorrectSound, playWrongSound } from "@/lib/sound-effects";

const button = "inline-flex items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-800 hover:bg-slate-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-700 disabled:cursor-not-allowed disabled:opacity-50";
const selectedButton = `${button} !border-[#B4E4D6] !bg-[#B4E4D6]`;

export default function TangoPractice() {
  const [chapters, setChapters] = useState<TangoChapter[]>(defaultChapters as TangoChapter[]);
  const [progress, setProgress] = useState<TangoProgress>({});
  const [ready, setReady] = useState(false);
  const [canSave, setCanSave] = useState(true);
  const [storageMessage, setStorageMessage] = useState("");
  const [customData, setCustomData] = useState(false);
  const [chapterId, setChapterId] = useState(defaultChapters[0].chapterId);
  const [unitId, setUnitId] = useState(defaultChapters[0].units[0].unitId);
  const [mode, setMode] = useState<TangoMode>("word");
  const [wrongOnly, setWrongOnly] = useState(false);
  const [speed, setSpeed] = useState<0.75 | 1>(1);
  const [queue, setQueue] = useState<TangoWord[] | null>(null);
  const [index, setIndex] = useState(0);
  const [answer, setAnswer] = useState("");
  const [result, setResult] = useState<boolean | null>(null);
  const [inputMessage, setInputMessage] = useState("");
  const [sessionCorrect, setSessionCorrect] = useState(0);
  const [json, setJson] = useState("");
  const [importMessage, setImportMessage] = useState("");
  const [showMeaning, setShowMeaning] = useState(false);
  const [soundFx, setSoundFx] = useState(true);
  const [showSampleViewer, setShowSampleViewer] = useState(false);
  const [copiedSample, setCopiedSample] = useState(false);
  const [showJsonModal, setShowJsonModal] = useState(false);
  const sampleJsonString = useMemo(() => JSON.stringify(sample, null, 2), []);
  const inputRef = useRef<HTMLInputElement>(null);
  const composing = useRef(false);
  const compositionEnded = useRef(0);
  const checked = useRef(false);
  const { play, stop, status } = useTangoAudio();
  const chapter = chapters.find((item) => item.chapterId === chapterId) || chapters[0];
  const unit = chapter.units.find((item) => item.unitId === unitId) || chapter.units[0];
  const word = queue?.[index];
  const finished = queue !== null && index >= queue.length;
  const wrongCount = unit.words.filter((item) => progress[progressKey(item, mode)]?.wrong).length;
  const masteredCount = unit.words.filter((item) => progress[progressKey(item, mode)]?.mastered).length;

  useEffect(() => {
    try {
      const savedFx = localStorage.getItem("vuyanh-tango-sound-fx");
      if (savedFx !== null) setSoundFx(JSON.parse(savedFx));
    } catch {}
    try {
      const saved = localStorage.getItem(TANGO_PROGRESS_KEY);
      if (saved) setProgress(tangoProgressSchema.parse(JSON.parse(saved)));
    } catch {
      setCanSave(false); setStorageMessage("Không đọc được tiến độ đã lưu. Bạn vẫn có thể học trong phiên này; dữ liệu gốc sẽ không bị ghi đè.");
    }
    try {
      const saved = localStorage.getItem(TANGO_DATA_KEY);
      if (saved) {
        const data = tangoDataSchema.parse(JSON.parse(saved));
        const totalWords = data.reduce((acc, c) => acc + c.units.reduce((uAcc, u) => uAcc + u.words.length, 0), 0);
        // Tự động chuyển lên bộ dữ liệu thật 1.392 từ nếu localStorage còn lưu bản mẫu cũ (<= 12 từ)
        if (totalWords <= 12 && data.length <= 2) {
          localStorage.removeItem(TANGO_DATA_KEY);
          setChapters(defaultChapters as TangoChapter[]);
          setChapterId(defaultChapters[0].chapterId);
          setUnitId(defaultChapters[0].units[0].unitId);
          setCustomData(false);
        } else {
          setChapters(data);
          setChapterId(data[0].chapterId);
          setUnitId(data[0].units[0].unitId);
          setCustomData(true);
        }
      }
    } catch { setStorageMessage((old) => `${old} Kho bài riêng không đọc được; đang dùng bộ chuẩn 1.392 từ.`.trim()); }
    setReady(true);
  }, []);

  useEffect(() => {
    if (!ready || !canSave) return;
    try { localStorage.setItem(TANGO_PROGRESS_KEY, JSON.stringify(progress)); }
    catch { setStorageMessage("Trình duyệt không lưu được tiến độ. Hãy kiểm tra quyền lưu trữ hoặc dung lượng; kết quả hiện chỉ giữ trong phiên này."); }
  }, [progress, ready, canSave]);

  useEffect(() => { if (word) inputRef.current?.focus(); }, [word]);
  function endSession() { stop(); setQueue(null); setAnswer(""); setResult(null); checked.current = false; setInputMessage(""); }
  function begin() {
    const items = selectTangoQueue(unit.words, progress, mode, wrongOnly);
    stop(); setQueue(items); setIndex(0); setAnswer(""); setResult(null); checked.current = false; setSessionCorrect(0); setInputMessage("");
    if (items[0]) play(items[0], mode, speed);
  }
  function submit() {
    if (!word) return;
    if (checked.current) {
      const next = index + 1;
      setIndex(next); setAnswer(""); setResult(null); checked.current = false; setInputMessage("");
      if (queue?.[next]) play(queue[next], mode, speed); else stop();
      return;
    }
    if (!answer.trim()) { setInputMessage("Hãy nghe và nhập câu trả lời trước khi kiểm tra."); inputRef.current?.focus(); return; }
    checked.current = true;
    const correct = checkTangoAnswer(word, mode, answer);
    setResult(correct); setInputMessage(""); stop();
    if (soundFx) {
      if (correct) {
        playCorrectSound();
      } else {
        playWrongSound();
      }
    }
    if (correct) setSessionCorrect((value) => value + 1);
    setProgress((current) => ({ ...current, [progressKey(word, mode)]: recordTangoAnswer(current[progressKey(word, mode)], correct) }));
    inputRef.current?.focus();
  }
  const replay = useCallback(() => { if (word) play(word, mode, speed); }, [word, play, mode, speed]);
  useEffect(() => {
    const shortcuts = (event: KeyboardEvent) => {
      if (event.isComposing || composing.current || !event.altKey || event.ctrlKey || event.metaKey || event.repeat) return;
      if (event.code === "KeyR" && word) { event.preventDefault(); replay(); }
      if (event.code === "KeyS") {
        event.preventDefault(); const next = speed === 1 ? 0.75 : 1; setSpeed(next); if (word) play(word, mode, next);
      }
    };
    window.addEventListener("keydown", shortcuts);
    return () => window.removeEventListener("keydown", shortcuts);
  }, [replay, word, speed, mode, play]);

  useEffect(() => {
    if (!showJsonModal) return;
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setShowJsonModal(false);
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      document.body.style.overflow = originalOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [showJsonModal]);

  function importData() {
    try {
      if (json.length > 2000000) throw new Error("JSON tối đa 2 triệu ký tự; hãy chia nhỏ kho bài.");
      const parsed = tangoDataSchema.safeParse(JSON.parse(json));
      if (!parsed.success) throw new Error(parsed.error.issues.slice(0, 3).map((issue) => `${issue.path.join(".")}: ${issue.message}`).join("\n"));
      // Persist first. A failed write must not replace the current data on screen.
      localStorage.setItem(TANGO_DATA_KEY, JSON.stringify(parsed.data));
      endSession(); setChapters(parsed.data); setChapterId(parsed.data[0].chapterId); setUnitId(parsed.data[0].units[0].unitId); setCustomData(true);
      setJson(""); setImportMessage("Đã lưu và mở kho bài JSON. Tiến độ vẫn giữ theo ID từ và chế độ học.");
    } catch (err) { setImportMessage(`Chưa nhập được: ${err instanceof Error ? err.message : "JSON hoặc bộ nhớ không hợp lệ."}`); }
  }

  const handleCopySample = useCallback(() => {
    if (typeof navigator !== "undefined" && navigator.clipboard?.writeText) {
      navigator.clipboard.writeText(sampleJsonString).then(() => {
        setCopiedSample(true);
        setTimeout(() => setCopiedSample(false), 2000);
      });
    }
  }, [sampleJsonString]);

  const handleLoadSampleIntoTextarea = useCallback(() => {
    setJson(sampleJsonString);
    setImportMessage("Đã nạp toàn bộ file JSON mẫu vào ô soạn thảo. Bạn có thể chỉnh sửa các từ vựng theo ý muốn rồi bấm 'Kiểm tra & lưu kho bài'.");
  }, [sampleJsonString]);

  const handleResetToSample = useCallback(() => {
    try {
      localStorage.removeItem(TANGO_DATA_KEY);
      endSession();
      setChapters(defaultChapters as TangoChapter[]);
      setChapterId(defaultChapters[0].chapterId);
      setUnitId(defaultChapters[0].units[0].unitId);
      setCustomData(false);
      setImportMessage("Đã khôi phục về kho từ vựng chuẩn Tango N3 (12 Chapter · 60 Unit · 1.392 từ).");
    } catch (err) {
      setImportMessage(`Không thể đặt lại: ${err instanceof Error ? err.message : "Lỗi bộ nhớ."}`);
    }
  }, []);

  return <div className="mx-auto max-w-6xl space-y-6 px-4 py-8 sm:px-6">
    <header className="space-y-3">
      <p className="flex items-center gap-2 text-sm font-bold text-emerald-800">
        <Headphones size={18} /> HỌC CÙNG VUYANH
      </p>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <h1 className="text-3xl font-extrabold text-slate-900 sm:text-4xl">
          Tango N3 · Nghe, gõ, nhớ lâu
        </h1>
        <button
          type="button"
          onClick={() => setShowJsonModal(true)}
          className="inline-flex items-center justify-center gap-2 rounded-2xl bg-[#1B5E20] hover:bg-[#2E7D32] text-white px-4 py-2.5 sm:px-5 sm:py-3 text-sm font-bold shadow-sm hover:shadow transition-all active:scale-95 cursor-pointer shrink-0 self-start sm:self-auto"
        >
          <Plus size={18} />
          <span>Thêm Tango N3</span>
        </button>
      </div>
      <p className="max-w-3xl leading-7 text-slate-600">
        Nghe từ vựng hoặc câu ví dụ, gõ bằng tiếng Nhật và ôn lại những mục còn sai. Tiến độ từ và câu được lưu riêng trên trình duyệt này.
      </p>
    </header>
    <div className="flex flex-wrap items-center justify-between gap-2 rounded-xl bg-[#FEFDCA] p-4 text-sm leading-6 text-slate-700">
      <span>
        {customData
          ? "Đang dùng kho bài bạn tự nhập bằng JSON."
          : `Kho từ vựng đầy đủ Tango N3: 12 Chapter · 60 Unit · 1.392 từ vựng và câu ví dụ.`} Chưa có file audio sẽ dùng Web Speech API; thiết bị cần giọng đọc tiếng Nhật.
      </span>
      {customData && (
        <button
          type="button"
          onClick={handleResetToSample}
          className="text-xs font-bold text-amber-900 underline hover:text-amber-700 inline-flex items-center gap-1 cursor-pointer shrink-0"
        >
          <RefreshCw size={13} /> Khôi phục về kho chuẩn (1.392 từ)
        </button>
      )}
    </div>
    {storageMessage && <p role="alert" className="rounded-xl border border-[#DE7272] bg-rose-50 p-4 text-sm text-rose-900">{storageMessage}</p>}
    <section aria-label="Chọn nội dung học" className="space-y-4 rounded-2xl border border-slate-200 bg-white p-5">
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="space-y-2 text-sm font-semibold">Chapter<select value={chapter.chapterId} disabled={!ready} onChange={(event) => { endSession(); const next = chapters.find((item) => item.chapterId === Number(event.target.value))!; setChapterId(next.chapterId); setUnitId(next.units[0].unitId); }} className="block w-full rounded-xl border border-slate-300 p-3 text-base">{chapters.map((item) => <option key={item.chapterId} value={item.chapterId}>{item.chapterTitle}</option>)}</select></label>
        <label className="space-y-2 text-sm font-semibold">Unit<select value={unit.unitId} disabled={!ready} onChange={(event) => { endSession(); setUnitId(Number(event.target.value)); }} className="block w-full rounded-xl border border-slate-300 p-3 text-base">{chapter.units.map((item) => <option key={item.unitId} value={item.unitId}>{item.unitTitle}</option>)}</select></label>
      </div>
      {/* 4 Nút chức năng nằm cùng trên 1 hàng thẳng tắp */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Nhóm chế độ học: Từ vựng / Câu ví dụ */}
          {(["word", "example"] as const).map((item) => (
            <button
              key={item}
              className={mode === item ? selectedButton : button}
              aria-pressed={mode === item}
              onClick={() => {
                endSession();
                setMode(item);
              }}
            >
              {item === "word" ? "Nghe – gõ từ vựng" : "Nghe – gõ câu ví dụ"}
            </button>
          ))}

          {/* Vạch ngăn cách tinh tế giữa 2 nhóm nút */}
          <div className="hidden md:block h-6 w-px bg-slate-200 mx-1" aria-hidden="true" />

          {/* Nhóm phạm vi ôn tập: Tất cả trong Unit / Ôn mục sai */}
          <button
            className={wrongOnly ? button : selectedButton}
            aria-pressed={!wrongOnly}
            onClick={() => {
              endSession();
              setWrongOnly(false);
            }}
          >
            Tất cả trong Unit
          </button>
          <button
            className={wrongOnly ? selectedButton : button}
            aria-pressed={wrongOnly}
            onClick={() => {
              endSession();
              setWrongOnly(true);
            }}
          >
            <RotateCcw size={16} />
            <span>Ôn mục sai ({wrongCount})</span>
          </button>
        </div>

        {/* Chỉ số Đã thuộc trong Unit */}
        <span className="text-sm font-medium text-slate-600 bg-slate-50 px-3.5 py-2 rounded-xl border border-slate-200/80 shrink-0">
          Đã thuộc: <strong className="text-[#1B5E20]">{masteredCount}</strong>/{unit.words.length} từ
        </span>
      </div>
      <div className="flex flex-wrap items-center gap-4 border-t border-slate-100 pt-4">
        <label className="flex items-center gap-2 text-sm font-semibold">
          Tốc độ
          <select value={speed} onChange={(event) => { const next = Number(event.target.value) as 0.75 | 1; setSpeed(next); if (word) play(word, mode, next); }} className="rounded-lg border border-slate-300 p-2">
            <option value={0.75}>0.75x</option>
            <option value={1}>1.0x</option>
          </select>
        </label>
        <label className="flex items-center gap-2 text-sm select-none cursor-pointer">
          <input type="checkbox" checked={showMeaning} onChange={(event) => setShowMeaning(event.target.checked)} />
          <span>Gợi ý nghĩa tiếng Việt</span>
        </label>
        <label className="flex items-center gap-2 text-sm select-none cursor-pointer">
          <input
            type="checkbox"
            checked={soundFx}
            onChange={(event) => {
              setSoundFx(event.target.checked);
              try { localStorage.setItem("vuyanh-tango-sound-fx", JSON.stringify(event.target.checked)); } catch {}
            }}
          />
          <span className="flex items-center gap-1.5 font-medium text-slate-700">
            {soundFx ? <Volume2 size={16} className="text-[#1B5E20]" /> : <VolumeX size={16} className="text-slate-400" />}
            <span>Âm thanh Ting ting khi đối chiếu</span>
          </span>
        </label>
      </div>
    </section>

    <section aria-label="Bài tập nghe và gõ" className="rounded-3xl border border-[#A5DEE5] bg-white p-5 shadow-sm sm:p-8">
      {!queue && <div className="space-y-4 py-6 text-center"><Headphones className="mx-auto h-12 w-12 text-teal-700" /><h2 className="text-2xl font-bold">Sẵn sàng nghe và gõ?</h2><p className="text-slate-600">{wrongOnly ? `${wrongCount} mục cần ôn trong Unit này.` : `${unit.words.length} mục · Gõ Kanji hoặc cách đọc Hiragana.`}</p><button className={selectedButton} disabled={!ready || (wrongOnly && !wrongCount)} onClick={begin}>Bắt đầu học</button>{wrongOnly && !wrongCount && <p className="text-sm text-emerald-800">Không có mục sai. Bạn có thể chuyển sang học tất cả hoặc chọn Unit khác.</p>}</div>}
      {word && <div className="space-y-5">
        <div className="flex flex-wrap items-center justify-between gap-3"><h2 className="text-lg font-bold text-slate-800">{mode === "word" ? "Từ vựng" : "Câu ví dụ"} {index + 1}/{queue!.length} <span className="text-sm font-normal text-slate-500">· STT {word.stt}</span></h2><button className={`${button} !bg-[#A5DEE5]`} onClick={replay} aria-keyshortcuts="Alt+R"><Volume2 size={18} />Phát lại (Alt + R)</button></div>
        <p className="text-sm text-slate-600" role="status">{status}</p>
        {showMeaning && <p className="rounded-xl bg-[#FEFDCA] p-4 leading-7">{mode === "word" ? word.meaning : word.example.meaning}</p>}
        <form onSubmit={(event) => { event.preventDefault(); if (!composing.current && Date.now() - compositionEnded.current > 100) submit(); }}>
          <label htmlFor="tango-answer" className="mb-3 block font-semibold text-slate-700">{mode === "word" ? "Gõ từ bạn vừa nghe" : "Gõ toàn bộ câu bạn vừa nghe"}</label>
          <input ref={inputRef} id="tango-answer" value={answer} readOnly={result !== null} lang="ja" autoComplete="off" autoCapitalize="off" spellCheck={false} maxLength={1000}
            onChange={(event) => { setAnswer(event.target.value); setInputMessage(""); }}
            onCompositionStart={() => { composing.current = true; }} onCompositionEnd={() => { composing.current = false; compositionEnded.current = Date.now(); }}
            onKeyDown={(event) => { if (event.key === "Enter" && (event.repeat || event.nativeEvent.isComposing || event.nativeEvent.keyCode === 229 || composing.current || Date.now() - compositionEnded.current < 100)) event.preventDefault(); }}
            aria-describedby="tango-keyboard tango-input-message" className="w-full rounded-2xl border-2 border-[#A5DEE5] p-4 font-japanese text-xl leading-8 outline-none focus:border-teal-600 focus:ring-4 focus:ring-teal-50 read-only:bg-slate-50 sm:text-2xl" placeholder="日本語で入力…" />
          <p id="tango-input-message" role="alert" className="mt-2 text-sm text-rose-700">{inputMessage}</p>
          <button type="submit" className={`${selectedButton} mt-4`}>{result === null ? "Kiểm tra (Enter)" : index + 1 === queue!.length ? "Hoàn tất lượt học (Enter)" : "Tiếp theo (Enter)"}</button>
        </form>
        {result !== null && <div role="status" className={`space-y-3 rounded-2xl p-5 ${result ? "bg-[#E0F9B5]" : "bg-[#FFCFDF]"}`}>
          <h3 className="font-bold text-slate-900">{result ? "Chính xác!" : "Chưa đúng · Đã thêm vào danh sách ôn sai"}</h3>
          <p className="text-sm text-slate-700">Bạn đã gõ: <span lang="ja">{answer}</span></p>
          <p lang="ja" className="font-japanese text-2xl leading-10">{mode === "word" ? word.kanji : word.example.japanese}</p>
          <p lang="ja" className="font-japanese leading-7 text-slate-700">{mode === "word" ? word.hiragana : word.example.hiragana}</p>
          <p className="leading-7">{mode === "word" ? word.meaning : word.example.meaning}</p>
          <button className={button} onClick={() => {
            const key = progressKey(word, mode);
            setProgress((current) => { const before = current[key] || emptyProgress; const mastered = !before.mastered; return { ...current, [key]: { ...before, mastered, wrong: mastered ? false : before.wrong } }; });
            inputRef.current?.focus();
          }}>{progress[progressKey(word, mode)]?.mastered ? "Bỏ đánh dấu đã thuộc" : "Tôi đã thuộc mục này"}</button>
        </div>}
      </div>}
      {finished && <div className="space-y-4 py-6 text-center"><h2 className="text-2xl font-bold">Đã hoàn thành lượt học</h2><p className="text-lg">Đúng {sessionCorrect}/{queue!.length} mục trong lượt này.</p><p className="text-slate-600">Unit hiện còn {wrongCount} mục sai ở chế độ {mode === "word" ? "từ vựng" : "câu ví dụ"}.</p><button className={selectedButton} onClick={begin} disabled={wrongOnly && !wrongCount}>Học lại lựa chọn hiện tại</button></div>}
      <p id="tango-keyboard" className="mt-6 border-t border-slate-100 pt-4 text-sm leading-6 text-slate-600">Enter: kiểm tra, rồi chuyển mục · Alt + R: nghe lại · Alt + S: đổi tốc độ · Tab: chuyển điều khiển. Enter xác nhận chữ trong bộ gõ Nhật không chấm bài. Dấu câu và khoảng trắng được bỏ qua; vẫn phân biệt âm dài, âm ngắt và trợ từ.</p>
    </section>

    <details className="rounded-2xl border border-slate-200 bg-white p-5"><summary className="cursor-pointer font-bold text-slate-800">Tiến độ Unit · {mode === "word" ? "Từ vựng" : "Câu ví dụ"}</summary><p className="my-3 text-sm leading-6 text-slate-600">Đúng 2 lần liên tiếp sẽ tự đánh dấu đã thuộc. Trả lời sai bỏ trạng thái đã thuộc; trả lời đúng khi ôn sẽ đưa mục ra khỏi danh sách sai. Hai chế độ lưu riêng.</p><ul className="divide-y divide-slate-100">{unit.words.map((item) => { const state = progress[progressKey(item, mode)]; return <li key={item.id} className="flex flex-wrap justify-between gap-3 py-3"><span lang="ja" className="font-japanese">{item.stt}. {item.kanji}（{item.hiragana}）</span><span className="text-sm text-slate-600">{state?.wrong ? "Cần ôn lại" : state?.mastered ? "Đã thuộc" : state?.attempts ? "Đang học" : "Chưa học"} · {state?.correct || 0}/{state?.attempts || 0} lượt đúng</span></li>; })}</ul></details>

    {/* POPUP MODAL: THÊM TANGO N3 BẰNG JSON */}
    {showJsonModal && (
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="tango-modal-title"
        className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-3 sm:p-4 md:p-6 backdrop-blur-xs overflow-y-auto animate-in fade-in duration-150"
        onClick={(e) => {
          if (e.target === e.currentTarget) setShowJsonModal(false);
        }}
      >
        <div className="relative w-full max-w-3xl rounded-3xl bg-white shadow-2xl border border-slate-200 flex flex-col max-h-[90vh] overflow-hidden my-auto animate-in zoom-in-95 duration-150">
          {/* Modal Header */}
          <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4 sm:px-6 bg-slate-50/70">
            <div className="space-y-0.5 pr-2">
              <h2 id="tango-modal-title" className="text-lg sm:text-xl font-bold text-slate-900 flex items-center gap-2">
                <FileText className="text-[#1B5E20] w-5 h-5 shrink-0" />
                <span>Thêm kho Tango N3 bằng JSON</span>
              </h2>
              <p className="text-xs text-slate-500">
                Xem file JSON mẫu, nạp dữ liệu hoặc tùy biến danh sách từ vựng theo cấu trúc Chapter → Unit → Words
              </p>
            </div>
            <button
              type="button"
              onClick={() => setShowJsonModal(false)}
              className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-200/70 transition-colors cursor-pointer"
              aria-label="Đóng cửa sổ"
            >
              <X size={20} />
            </button>
          </div>

          {/* Modal Body */}
          <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-4">
            {/* Kho từ vựng đầy đủ chính thức Tango N3 (1.392 từ) */}
            <div className="rounded-2xl bg-[#E8F5E9]/60 border-2 border-[#A5D6A7] p-4 sm:p-5 space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="text-sm font-bold text-[#1B5E20] flex items-center gap-1.5 uppercase tracking-wider">
                  <Sparkles size={16} className="text-[#2E7D32]" /> Kho từ vựng chuẩn Tango N3 (Dữ liệu thật đã cào)
                </span>
                <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-[#1B5E20] text-white">
                  12 Chapter · 60 Unit · 1.392 Từ
                </span>
              </div>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                Toàn bộ dữ liệu 1.392 từ vựng và câu ví dụ cào từ sách Tango N3 kèm câu ví dụ tiếng Nhật, phiên âm Hiragana và nghĩa tiếng Việt. Đã được nạp trực tiếp làm giáo trình chính của website.
              </p>

              <div className="flex flex-wrap items-center gap-2 pt-1">
                <button
                  type="button"
                  className={`${button} !bg-[#1B5E20] !border-[#1B5E20] !text-white hover:!bg-[#2E7D32] text-xs py-2`}
                  onClick={() => {
                    handleResetToSample();
                    setShowJsonModal(false);
                  }}
                  title="Nạp và dùng ngay kho chuẩn 1.392 từ (xóa bỏ dữ liệu tùy biến nếu có)"
                >
                  <RefreshCw size={14} />
                  <span>Kích hoạt kho chuẩn 1.392 từ</span>
                </button>

                <a
                  href="/data/tango_n3.json"
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`${button} text-xs py-2`}
                  title="Mở file JSON 1.392 từ trong tab mới của trình duyệt"
                >
                  <ExternalLink size={14} />
                  <span>Xem file tango_n3.json (Tab mới)</span>
                </a>

                <a
                  href="/data/tango_n3.json"
                  download="tango_n3.json"
                  className={`${button} text-xs py-2`}
                  title="Tải toàn bộ file JSON 1.392 từ về máy tính"
                >
                  <Download size={14} />
                  <span>Tải file tango_n3.json (810KB)</span>
                </a>
              </div>
            </div>

            {/* Thanh công cụ xem và nạp JSON mẫu trực tiếp trên web */}
            <div className="rounded-2xl bg-slate-50 border border-slate-200 p-4 space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5 uppercase tracking-wider">
                  <FileText size={15} className="text-teal-700" /> File JSON mẫu tham khảo rút gọn (tango_n3_sample.json)
                </span>
                <span className="text-xs text-slate-500">12 từ vựng · 2 Chapter · 4 Unit</span>
              </div>

              <div className="flex flex-wrap items-center gap-2 pt-1">
                <button
                  type="button"
                  className={`${button} !bg-teal-50 !border-teal-300 !text-teal-900 hover:!bg-teal-100 text-xs py-2`}
                  onClick={() => setShowSampleViewer((prev) => !prev)}
                >
                  {showSampleViewer ? <EyeOff size={14} /> : <Eye size={14} />}
                  <span>{showSampleViewer ? "Ẩn file mẫu" : "Xem file JSON mẫu trên web"}</span>
                </button>

                <button
                  type="button"
                  className={`${button} !bg-emerald-50 !border-emerald-300 !text-emerald-900 hover:!bg-emerald-100 text-xs py-2`}
                  onClick={handleLoadSampleIntoTextarea}
                  title="Điền toàn bộ nội dung file mẫu vào ô soạn thảo bên dưới để xem hoặc sửa"
                >
                  <Sparkles size={14} className="text-emerald-600" />
                  <span>Điền mẫu vào ô nhập</span>
                </button>

                <button
                  type="button"
                  className={`${button} text-xs py-2`}
                  onClick={handleCopySample}
                  title="Sao chép toàn bộ JSON mẫu vào Clipboard"
                >
                  {copiedSample ? <Check size={14} className="text-emerald-600" /> : <Copy size={14} />}
                  <span>{copiedSample ? "Đã sao chép!" : "Sao chép JSON mẫu"}</span>
                </button>

                <a
                  href="/data/tango_n3_sample.json"
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`${button} text-xs py-2`}
                  title="Mở file JSON gốc trong tab mới của trình duyệt"
                >
                  <ExternalLink size={14} />
                  <span>Mở tab mới</span>
                </a>

                <a
                  href="/data/tango_n3_sample.json"
                  download="tango_n3_sample.json"
                  className="text-xs font-semibold text-slate-500 hover:text-slate-800 underline ml-auto py-2 inline-flex items-center gap-1"
                  title="Tải file về máy tính nếu muốn lưu ngoại tuyến"
                >
                  <Download size={14} />
                  <span>Tải về máy (.json)</span>
                </a>
              </div>

              {/* Khung xem trực tiếp JSON mẫu ngay trên web */}
              {showSampleViewer && (
                <div className="mt-3 space-y-3 rounded-xl border border-slate-300 bg-slate-900 p-4 text-slate-100 animate-in fade-in duration-200">
                  <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-700 pb-2 text-xs text-slate-400">
                    <span className="font-mono font-semibold text-teal-300">public/data/tango_n3_sample.json</span>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={handleCopySample}
                        className="inline-flex items-center gap-1 text-slate-300 hover:text-white px-2.5 py-1 rounded bg-slate-800 border border-slate-700 hover:bg-slate-700 transition-colors text-xs"
                      >
                        {copiedSample ? <Check size={13} className="text-emerald-400" /> : <Copy size={13} />}
                        <span>{copiedSample ? "Đã chép!" : "Sao chép"}</span>
                      </button>
                      <button
                        type="button"
                        onClick={handleLoadSampleIntoTextarea}
                        className="inline-flex items-center gap-1 text-teal-300 hover:text-white px-2.5 py-1 rounded bg-teal-950/80 border border-teal-700 hover:bg-teal-900 transition-colors text-xs"
                      >
                        <Sparkles size={13} />
                        <span>Nạp vào ô nhập</span>
                      </button>
                    </div>
                  </div>

                  {/* Hướng dẫn quy cách cấu trúc */}
                  <div className="text-[11px] leading-5 text-slate-300 bg-slate-800/80 rounded-lg p-2.5 border border-slate-700/80">
                    <span className="font-bold text-amber-300">💡 Quy cách cấu trúc JSON:</span>
                    <ul className="list-disc list-inside mt-1 space-y-0.5 text-slate-300">
                      <li><code className="text-teal-300 font-mono">chapterId</code> (số nguyên), <code className="text-teal-300 font-mono">chapterTitle</code> (tên chương)</li>
                      <li><code className="text-teal-300 font-mono">unitId</code> (số nguyên duy nhất trong chương), <code className="text-teal-300 font-mono">unitTitle</code> (tên bài)</li>
                      <li><code className="text-teal-300 font-mono">words[]</code>: Mỗi từ gồm <code className="text-teal-300 font-mono">id</code> (duy nhất toàn kho), <code className="text-teal-300 font-mono">stt</code>, <code className="text-teal-300 font-mono">kanji</code>, <code className="text-teal-300 font-mono">hiragana</code>, <code className="text-teal-300 font-mono">meaning</code>, <code className="text-teal-300 font-mono">wordAudio</code>, và <code className="text-teal-300 font-mono">example</code> (câu ví dụ).</li>
                    </ul>
                  </div>

                  {/* Khung mã nguồn JSON có thể cuộn và bôi đen chọn */}
                  <pre tabIndex={0} aria-label="Nội dung file JSON mẫu" className="max-h-60 overflow-y-auto rounded-lg bg-black/60 p-3 font-mono text-xs leading-5 text-emerald-300 select-all focus:outline-none focus:ring-1 focus:ring-teal-400">
                    <code>{sampleJsonString}</code>
                  </pre>
                </div>
              )}
            </div>

            {/* Vùng nhập JSON của người dùng */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label htmlFor="tango-json" className="block text-sm font-semibold text-slate-800">
                  Dán hoặc chỉnh sửa JSON kho từ vựng tại đây:
                </label>
                {json.trim() && (
                  <button
                    type="button"
                    onClick={() => { setJson(""); setImportMessage(""); }}
                    className="text-xs font-semibold text-slate-400 hover:text-rose-600 inline-flex items-center gap-1 cursor-pointer"
                  >
                    <Trash2 size={13} /> Xóa ô nhập
                  </button>
                )}
              </div>

              <textarea
                id="tango-json"
                value={json}
                onChange={(event) => setJson(event.target.value)}
                maxLength={2000000}
                spellCheck={false}
                placeholder="Dán JSON vào đây hoặc bấm 'Điền mẫu vào ô nhập' ở phía trên để bắt đầu chỉnh sửa..."
                className="min-h-52 w-full rounded-2xl border border-slate-300 p-3.5 font-mono text-xs leading-5 focus:border-[#1B5E20] focus:ring-2 focus:ring-emerald-100 outline-none"
              />

              <div className="flex items-center justify-between text-xs text-slate-400 px-1">
                <span>Audio có thể để rỗng để dùng Web Speech API</span>
                <span>{json.length > 0 ? `${json.length.toLocaleString()} / 2,000,000 ký tự` : ""}</span>
              </div>

              {importMessage && (
                <p
                  role="status"
                  className={`mt-2 whitespace-pre-wrap rounded-xl p-3 text-sm ${
                    importMessage.startsWith("Chưa nhập được")
                      ? "bg-rose-50 border border-rose-200 text-rose-800"
                      : "bg-emerald-50 border border-emerald-200 text-emerald-800 font-semibold"
                  }`}
                >
                  {importMessage}
                </p>
              )}
            </div>
          </div>

          {/* Modal Footer */}
          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-200 px-5 py-4 sm:px-6 bg-slate-50/70">
            <div>
              {customData && (
                <button
                  type="button"
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-800 hover:text-amber-900 bg-amber-50 hover:bg-amber-100 px-3 py-2 rounded-xl border border-amber-300 transition-colors cursor-pointer"
                  onClick={handleResetToSample}
                  title="Khôi phục về bộ 12 từ mẫu ban đầu và xóa kho bài tùy chỉnh"
                >
                  <RefreshCw size={14} /> Khôi phục dữ liệu mẫu ban đầu
                </button>
              )}
            </div>

            <div className="flex items-center gap-2 ml-auto">
              <button
                type="button"
                className={button}
                onClick={() => setShowJsonModal(false)}
              >
                Đóng
              </button>
              <button
                type="button"
                className={`${button} !bg-[#1B5E20] !border-[#1B5E20] !text-white hover:!bg-[#2E7D32]`}
                disabled={!ready || !json.trim()}
                onClick={() => {
                  importData();
                }}
              >
                Kiểm tra & lưu kho bài
              </button>
            </div>
          </div>
        </div>
      </div>
    )}
  </div>;
}
