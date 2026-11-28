"use client";
import { useState } from 'react';
import { RotateCcw } from 'lucide-react';
import type { StudyEntry } from '@/lib/onomatopoeia';

export default function OnomatopoeiaFlashcards({ entries, onComplete }: { entries: StudyEntry[]; onComplete: () => void }) {
  const [index, setIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [finished, setFinished] = useState(false);
  const [review, setReview] = useState<StudyEntry[]>([]);
  const [queue, setQueue] = useState(entries);
  const card = queue[index];
  function rate(remembered: boolean) {
    if (!flipped) return;
    if (!remembered) setReview(previous => [...previous, card]);
    if (index + 1 === queue.length) { setFinished(true); onComplete(); }
    else { setIndex(index + 1); setFlipped(false); }
  }
  function restart(items: StudyEntry[]) { setQueue(items); setIndex(0); setFlipped(false); setFinished(false); setReview([]); }
  if (!entries.length) return <p className="rounded-2xl bg-white p-8">Bài này chưa có từ vựng.</p>;
  if (finished) return <section className="rounded-3xl bg-white border p-8 text-center space-y-4"><h2 className="text-2xl font-bold text-emerald-900">Đã ôn hết flashcard!</h2><p>Bài học đã hoàn thành. Bạn có thể tiếp tục bài sau hoặc ôn lại các thẻ chưa nhớ.</p><div className="flex flex-wrap justify-center gap-3"><button onClick={() => restart(entries)} className="rounded-xl bg-emerald-700 px-5 py-3 text-white font-semibold">Ôn tất cả</button>{review.length > 0 && <button onClick={() => restart(review)} className="rounded-xl border px-5 py-3 font-semibold text-emerald-800">Ôn {review.length} thẻ chưa nhớ</button>}</div></section>;
  return <section className="rounded-3xl border bg-white p-5 sm:p-8 space-y-5">
    <div className="flex justify-between text-sm text-slate-600"><span>Thẻ {index + 1} / {queue.length}</span><button onClick={() => restart(entries)} className="flex items-center gap-2"><RotateCcw className="h-4 w-4" />Ôn lại từ đầu</button></div>
    <progress aria-label="Tiến độ flashcard" value={index} max={queue.length} className="w-full h-2 accent-emerald-600" />
    <button onClick={() => setFlipped(!flipped)} aria-label={flipped ? 'Lật về mặt từ tiếng Nhật' : 'Lật thẻ xem nghĩa'} className={`min-h-72 w-full rounded-3xl border-2 p-8 text-center transition-colors ${flipped ? 'border-emerald-300 bg-emerald-50' : 'border-sky-200 bg-sky-50'}`}>
      <span className="block text-sm text-slate-500 mb-5">{flipped ? 'NGHĨA & CÁCH ĐỌC' : 'BẠN CÓ NHỚ TỪ NÀY?'}</span>
      <span className="block text-3xl font-bold text-emerald-950" lang={flipped ? 'vi' : 'ja'}>{flipped ? card.meaning : card.word}</span>
      {flipped && <span lang="ja" className="mt-4 block text-lg text-emerald-800">{card.reading}</span>}
      <span className="block mt-7 text-sm text-slate-500">Bấm thẻ hoặc nhấn Enter để lật</span>
    </button>
    <div className="grid grid-cols-2 gap-3"><button disabled={!flipped} onClick={() => rate(false)} className="rounded-xl border border-amber-300 bg-amber-50 py-3 font-semibold text-amber-900 disabled:opacity-40">Chưa nhớ</button><button disabled={!flipped} onClick={() => rate(true)} className="rounded-xl bg-emerald-700 py-3 font-semibold text-white disabled:opacity-40">Đã nhớ</button></div>
    <p className="text-sm text-slate-500 text-center">Lật thẻ trước khi tự đánh giá. Ôn hết thẻ để hoàn thành bài học.</p>
  </section>;
}
