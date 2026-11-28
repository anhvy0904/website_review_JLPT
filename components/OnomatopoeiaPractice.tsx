"use client";
import { useEffect, useRef, useState } from 'react';
import { Headphones, RotateCcw, Volume2 } from 'lucide-react';
import { acceptsAnswer, type Activity, type PracticeMode } from '@/lib/onomatopoeia';

export default function OnomatopoeiaPractice({ mode, activities, onComplete }: { mode: PracticeMode; activities: Activity[]; onComplete?: () => void }) {
  const [queue, setQueue] = useState(activities);
  const [index, setIndex] = useState(0);
  const [input, setInput] = useState('');
  const [results, setResults] = useState<{ item: Activity; correct: boolean }[]>([]);
  const [checked, setChecked] = useState(false);
  const [finished, setFinished] = useState(false);
  const [speed, setSpeed] = useState(0.8);
  const [notice, setNotice] = useState('');
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const voiceRef = useRef<SpeechSynthesisUtterance | null>(null);
  const generation = useRef(0);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const current = queue[index];
  function stop() {
    generation.current++;
    if (audioRef.current) { audioRef.current.pause(); audioRef.current.onerror = null; audioRef.current = null; }
    if (voiceRef.current) { voiceRef.current.onerror = null; voiceRef.current = null; }
    if ('speechSynthesis' in window) window.speechSynthesis.cancel();
  }
  useEffect(() => { const hidden = () => { if (document.hidden) stop(); }; document.addEventListener('visibilitychange', hidden); return () => { stop(); document.removeEventListener('visibilitychange', hidden); }; }, []);
  function play() {
    stop(); const token = generation.current;
    const speak = () => {
      if (token !== generation.current) return;
      if (!('speechSynthesis' in window)) { setNotice('Trình duyệt chưa hỗ trợ giọng đọc. Hãy dùng thiết bị có giọng tiếng Nhật.'); return; }
      const voices = window.speechSynthesis.getVoices();
      const voice = voices.find(v => /^ja\b/i.test(v.lang));
      if (voices.length && !voice) { setNotice('Thiết bị chưa có giọng tiếng Nhật. Hãy cài giọng Nhật rồi nghe lại.'); return; }
      const utterance = new SpeechSynthesisUtterance(current.reading || current.answers[0]);
      utterance.lang = 'ja-JP'; utterance.rate = speed; if (voice) utterance.voice = voice;
      utterance.onerror = () => { if (token === generation.current) setNotice('Chưa phát được âm thanh. Hãy kiểm tra giọng Nhật trên thiết bị.'); };
      voiceRef.current = utterance; window.speechSynthesis.speak(utterance); setNotice('Đang đọc bằng giọng tiếng Nhật của thiết bị.');
    };
    if (!current.audio) { speak(); return; }
    const audio = new Audio(current.audio); audioRef.current = audio; audio.playbackRate = speed;
    let fallback = false;
    const recover = () => { if (fallback || token !== generation.current) return; fallback = true; audio.pause(); speak(); };
    audio.onerror = recover; void audio.play().catch(recover); setNotice('Đang phát tệp âm thanh.');
  }
  function check(answer = input) {
    if (checked || !answer.trim()) return;
    setInput(answer); setChecked(true); stop();
    setResults(previous => [...previous, { item: current, correct: acceptsAnswer(answer, current.answers) }]);
  }
  function next() {
    stop(); setNotice('');
    if (index + 1 === queue.length) { setFinished(true); if (queue.length === activities.length) onComplete?.(); return; }
    setIndex(index + 1); setInput(''); setChecked(false); inputRef.current?.focus();
  }
  function restart(items: Activity[]) {
    stop(); setQueue(items); setIndex(0); setInput(''); setResults([]); setChecked(false); setFinished(false); setNotice('');
  }
  if (!queue.length) return <section className="rounded-3xl border border-dashed p-10 text-center bg-white"><h2 className="font-bold text-xl">Chưa có bài cho phần này</h2><p className="mt-2 text-slate-600">Chọn phần khác hoặc bổ sung dữ liệu bài tập trong JSON.</p></section>;
  const score = results.filter(result => result.correct).length;
  const wrong = results.filter(result => !result.correct).map(result => result.item);
  if (finished) return <section className="rounded-3xl border bg-white p-6 sm:p-10 text-center space-y-5">
    <p className="font-semibold text-emerald-700">HOÀN THÀNH LƯỢT HỌC</p><h2 className="text-4xl font-extrabold text-emerald-950">{score} / {queue.length}</h2><p className="text-slate-600">{wrong.length ? `Còn ${wrong.length} câu cần luyện lại. Thử thêm một lượt nhé!` : 'Bạn đã trả lời đúng tất cả câu trong lượt này.'}</p>
    <div className="flex flex-wrap justify-center gap-3"><button onClick={() => restart(activities)} className="rounded-xl bg-emerald-700 px-5 py-3 font-semibold text-white">Làm lại toàn bộ</button>{wrong.length > 0 && <button onClick={() => restart(wrong)} className="rounded-xl border border-emerald-300 px-5 py-3 font-semibold text-emerald-800">Ôn {wrong.length} câu sai</button>}</div>
    {wrong.length > 0 && <details className="text-left border-t pt-4"><summary className="cursor-pointer font-semibold">Xem lại câu sai</summary>{wrong.map(item => <div key={item.id} className="border-b py-3"><p>{item.prompt}</p><p className="mt-1 font-semibold text-emerald-800">{item.answers[0]}</p></div>)}</details>}
  </section>;
  const correct = checked && results[results.length - 1]?.correct;
  return <section className="rounded-3xl border border-emerald-100 bg-white p-5 sm:p-8 space-y-6 shadow-sm">
    <div className="flex justify-between items-center gap-3 text-sm"><span className="font-bold text-emerald-800">Câu {index + 1} / {queue.length}</span><span className="text-slate-500">{score} câu đúng</span><button onClick={() => restart(activities)} className="flex items-center gap-2 text-slate-600"><RotateCcw className="w-4 h-4" />Bắt đầu lại</button></div>
    <progress aria-label="Tiến độ lượt luyện" value={results.length} max={queue.length} className="w-full h-2 accent-emerald-600" />
    {mode === 'dictation' && <div className="rounded-2xl bg-sky-50 py-7 text-center space-y-4"><Headphones className="h-9 w-9 mx-auto text-sky-700" /><button onClick={play} className="inline-flex items-center gap-2 rounded-full bg-sky-700 px-6 py-3 font-bold text-white"><Volume2 className="h-5 w-5" />Nghe / Phát lại</button><div><label className="text-sm text-slate-600">Tốc độ <select value={speed} onChange={e => { stop(); setSpeed(Number(e.target.value)); }} className="ml-2 rounded-lg border px-3 py-2"><option value={0.65}>Chậm · 0.65×</option><option value={0.8}>Vừa · 0.8×</option><option value={1}>Tự nhiên · 1×</option></select></label></div><p className="text-sm text-slate-500">Đáp án chỉ hiện sau khi bạn kiểm tra.</p></div>}
    <h2 className="text-xl sm:text-2xl font-bold text-slate-900 leading-relaxed whitespace-pre-line">{current.prompt}</h2>
    {mode === 'quiz' ? <div className="grid sm:grid-cols-2 gap-3">{current.options?.map((option, i) => <button key={i} disabled={checked} onClick={() => check(option)} className={`rounded-2xl border-2 p-4 text-left leading-relaxed disabled:cursor-default ${checked && acceptsAnswer(option, current.answers) ? 'border-emerald-500 bg-emerald-50 text-emerald-900' : checked && input === option ? 'border-rose-400 bg-rose-50' : 'border-slate-200 hover:border-emerald-400'}`}><span className="mr-3 font-bold text-slate-500">{String.fromCharCode(65 + i)}.</span>{option}</button>)}</div> : <form onSubmit={e => { e.preventDefault(); if (checked) next(); else check(); }} className="space-y-4">
      <label className="block text-sm font-semibold text-slate-600" htmlFor="onomatopoeia-answer">Câu trả lời của bạn</label><input id="onomatopoeia-answer" ref={inputRef} value={input} readOnly={checked} autoComplete="off" spellCheck={false} onChange={e => setInput(e.target.value)} onKeyDown={e => { if (e.key === 'Enter' && e.nativeEvent.isComposing) e.preventDefault(); }} placeholder="Nhập tiếng Nhật…" className="w-full rounded-xl border-2 border-slate-200 px-4 py-4 text-xl focus:border-emerald-500 focus:outline-none" />
      <p className="text-sm text-slate-500">Chấp nhận Hiragana/Katakana tương đương; bỏ qua khoảng trắng và dấu câu. Enter để kiểm tra hoặc chuyển câu.</p>
      {!checked && <button disabled={!input.trim()} className="rounded-xl bg-emerald-700 px-6 py-3 font-semibold text-white disabled:opacity-40">Kiểm tra</button>}
    </form>}
    {notice && <p role="status" className="text-sm text-sky-800">{notice}</p>}
    {checked && <div role="status" className={`rounded-2xl p-5 space-y-3 ${correct ? 'bg-emerald-50' : 'bg-amber-50'}`}><h3 className="font-bold text-lg">{correct ? 'Chính xác!' : 'Chưa đúng, cùng ghi nhớ lại nhé.'}</h3><p className="text-lg font-semibold text-emerald-900">Đáp án: {current.answers[0]}</p><details><summary className="cursor-pointer text-sm font-semibold">Xem giải thích</summary><p className="mt-3 whitespace-pre-line leading-relaxed text-slate-700">{current.explanation}</p></details><button onClick={next} className="rounded-xl bg-emerald-800 px-5 py-3 font-semibold text-white">{index + 1 === queue.length ? 'Xem kết quả' : 'Câu tiếp theo'}</button></div>}
  </section>;
}
