"use client";

import { useEffect, useState } from 'react';
import { BookOpen, Check, Volume2 } from 'lucide-react';

type Entry = {
  id: string; word: string; meaning: string; explanation: string;
  conversations: { context: string; dialogues: { speaker: string; ja: string; vi: string }[] }[];
};
type Data = { sourceName: string; sourceUrl: string; sourceTotal: number; lockedCount: number; entries: Entry[] };
const storageKey = 'jlptn3:v1:onomatopoeia-learned';
const normalize = (text: string) => text.normalize('NFKC').toLowerCase().replace(/[ァ-ヶ]/g, c => String.fromCharCode(c.charCodeAt(0) - 96)).normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/đ/g, 'd');

function Japanese({ text, furigana }: { text: string; furigana: boolean }) {
  return <span lang="ja" className="font-japanese leading-[2.4]">{text.split(/(_[^_]+_)/g).map((segment, i) => {
    const emphasized = segment.startsWith('_') && segment.endsWith('_');
    const content = (emphasized ? segment.slice(1, -1) : segment).split(/(\[[^\]]+\]\([^)]+\))/g).map((part, j) => {
      const match = /^\[([^\]]+)\]\(([^)]+)\)$/.exec(part);
      return match ? furigana ? <ruby key={j}>{match[1]}<rt className="text-xs">{match[2]}</rt></ruby> : match[1] : part;
    });
    return emphasized ? <strong key={i} className="text-emerald-800">{content}</strong> : <span key={i}>{content}</span>;
  })}</span>;
}

export default function OnomatopoeiaList({ data }: { data: Data }) {
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState('all');
  const [learned, setLearned] = useState<string[]>([]);
  const [ready, setReady] = useState(false);
  const [furigana, setFurigana] = useState(true);
  const [meaningVisible, setMeaningVisible] = useState(true);
  const [notice, setNotice] = useState('');
  useEffect(() => {
    try {
      const saved: unknown = JSON.parse(localStorage.getItem(storageKey) || '[]');
      if (Array.isArray(saved)) setLearned(saved.filter((id): id is string => typeof id === 'string'));
    } catch { setNotice('Không đọc được tiến độ đã lưu. Bạn vẫn có thể học trong phiên này.'); }
    setReady(true);
    return () => { if ('speechSynthesis' in window) window.speechSynthesis.cancel(); };
  }, []);
  function toggleLearned(id: string) {
    const next = learned.includes(id) ? learned.filter(item => item !== id) : [...learned, id];
    setLearned(next);
    try { localStorage.setItem(storageKey, JSON.stringify(next)); }
    catch { setNotice('Không lưu được tiến độ trên trình duyệt này.'); }
  }
  function speak(word: string) {
    if (!('speechSynthesis' in window) || !('SpeechSynthesisUtterance' in window)) { setNotice('Trình duyệt chưa hỗ trợ đọc tiếng Nhật.'); return; }
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(word);
    utterance.lang = 'ja-JP'; utterance.rate = 0.8;
    const voices = window.speechSynthesis.getVoices();
    const voice = voices.find(v => /^ja\b/i.test(v.lang));
    if (voices.length && !voice) { setNotice('Thiết bị chưa cài giọng tiếng Nhật. Hãy cài giọng Nhật để nghe phát âm.'); return; }
    if (voice) utterance.voice = voice;
    utterance.onerror = () => setNotice('Không phát được âm thanh. Hãy kiểm tra giọng tiếng Nhật trên thiết bị.');
    setNotice('Phát âm bằng giọng tiếng Nhật của thiết bị.');
    window.speechSynthesis.speak(utterance);
  }
  const entries = data.entries.filter(entry => normalize(`${entry.word} ${entry.meaning}`).includes(normalize(query.trim())) && (filter === 'all' || (filter === 'learned' ? learned.includes(entry.id) : !learned.includes(entry.id))));
  return <section className="space-y-5">
    <section aria-label="Tìm kiếm và tùy chọn học" className="rounded-2xl border bg-white p-5 space-y-4">
      <div className="grid sm:grid-cols-[1fr_220px] gap-4">
        <label className="text-sm font-semibold text-slate-700">Tìm từ hoặc nghĩa tiếng Việt<input type="search" value={query} onChange={e => setQuery(e.target.value)} placeholder="Ví dụ: ペラペラ, ぺらぺら, trôi chảy…" className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3 text-base font-normal" /></label>
        <label className="text-sm font-semibold text-slate-700">Trạng thái<select value={filter} onChange={e => setFilter(e.target.value)} className="mt-2 w-full rounded-xl border border-slate-300 px-3 py-3 text-base font-normal"><option value="all">Tất cả</option><option value="new">Chưa thuộc</option><option value="learned">Đã thuộc</option></select></label>
      </div>
      <div className="flex flex-wrap gap-5 text-sm text-slate-700">
        <label className="flex items-center gap-2"><input type="checkbox" checked={furigana} onChange={e => setFurigana(e.target.checked)} />Hiện furigana</label>
        <label className="flex items-center gap-2"><input type="checkbox" checked={meaningVisible} onChange={e => setMeaningVisible(e.target.checked)} />Hiện nghĩa và bản dịch</label>
        <span aria-live="polite">{entries.length} kết quả</span>
        <span>Đã thuộc {data.entries.filter(entry => learned.includes(entry.id)).length}/{data.entries.length} từ trong phần này</span>
      </div>
      <p className="text-sm text-slate-500">Tiến độ được lưu trên trình duyệt này. Mở “Cách dùng và hội thoại” để xem lời giải khi tự ôn.</p>
      {notice && <p role="status" className="text-sm text-amber-800">{notice}</p>}
    </section>
    {entries.length === 0 ? <div className="rounded-2xl border border-dashed p-10 text-center"><p>Không có từ phù hợp với bộ lọc.</p><button onClick={() => { setQuery(''); setFilter('all'); }} className="mt-4 font-semibold text-emerald-800 underline">Xem tất cả từ</button></div> : <div className="grid md:grid-cols-2 gap-5 items-start">{entries.map(entry => <article key={entry.id} className="rounded-2xl border border-emerald-100 bg-white p-5 sm:p-6 shadow-sm space-y-4">
      <div className="flex items-start justify-between gap-3"><h2 lang="ja" className="font-japanese text-2xl font-bold text-emerald-950 break-words">{entry.word}</h2><button onClick={() => speak(entry.word)} aria-label={`Nghe ${entry.word}`} className="rounded-full bg-emerald-50 p-3 text-emerald-800 hover:bg-emerald-100"><Volume2 className="h-5 w-5" /></button></div>
      {meaningVisible && <p className="text-base font-medium text-slate-700">{entry.meaning}</p>}
      <button disabled={!ready} onClick={() => toggleLearned(entry.id)} aria-pressed={learned.includes(entry.id)} className={`flex items-center gap-2 rounded-xl border px-3 py-2 text-sm font-semibold disabled:opacity-50 ${learned.includes(entry.id) ? 'bg-emerald-100 text-emerald-900 border-emerald-300' : 'text-slate-600 border-slate-200 hover:bg-slate-50'}`}><Check className="h-4 w-4" />{learned.includes(entry.id) ? 'Đã thuộc' : 'Đánh dấu đã thuộc'}</button>
      <details className="border-t pt-4"><summary className="cursor-pointer font-semibold text-emerald-800"><BookOpen className="mr-2 inline h-4 w-4" />Cách dùng và hội thoại</summary><div className="mt-4 space-y-5">
        <p className="whitespace-pre-line text-base leading-relaxed text-slate-700">{entry.explanation}</p>
        {entry.conversations.map((conversation, index) => <section key={index} className="rounded-xl bg-slate-50 p-4 space-y-3"><h3 className="text-sm font-bold text-slate-600">{conversation.context}</h3>{conversation.dialogues.map((line, i) => <div key={i} className="text-base"><p>{line.speaker && <span className="mr-2 font-semibold text-slate-500">{line.speaker}:</span>}<Japanese text={line.ja} furigana={furigana} /></p>{meaningVisible && <p className="mt-1 text-slate-600 leading-relaxed">{line.vi}</p>}</div>)}</section>)}
      </div></details>
    </article>)}</div>}
  </section>;
}
