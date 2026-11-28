"use client";

import Link from 'next/link';
import { useEffect, useState } from 'react';
import {
  ArrowLeft,
  CheckCircle2,
  ChevronRight,
  Headphones,
  Layers,
  List,
  LockKeyhole,
  PencilLine,
  Sparkles,
} from 'lucide-react';
import OnomatopoeiaList from './OnomatopoeiaList';
import OnomatopoeiaPractice from './OnomatopoeiaPractice';
import OnomatopoeiaFlashcards from './OnomatopoeiaFlashcards';
import {
  makeActivities,
  readCompletedLessons,
  unlockedLesson,
  type OnomatopoeiaBook,
  type PracticeMode,
} from '@/lib/onomatopoeia';

const modes = [
  {
    id: 'list',
    title: 'Danh sách',
    subtitle: 'Từ vựng & Ngữ cảnh',
    description: 'Xem toàn bộ từ vựng, giải nghĩa chi tiết, phân tích cách dùng và hội thoại giao tiếp có furigana.',
    badge: 'Tra cứu & Học từ',
    icon: List,
  },
  {
    id: 'quiz',
    title: 'Trắc nghiệm',
    subtitle: 'Phản xạ nhanh 4 lựa chọn',
    description: 'Chọn đáp án chính xác trong 4 phương án, rèn luyện phản xạ nhớ nghĩa nhanh. Hoàn thành 1 lượt để mở bài mới.',
    badge: 'Trắc nghiệm • Mở bài',
    icon: Sparkles,
  },
  {
    id: 'flashcards',
    title: 'Flashcard',
    subtitle: 'Lật thẻ ghi nhớ chủ động',
    description: 'Lật thẻ 2 mặt (từ vựng ↔ nghĩa & cách đọc), tự đánh giá trí nhớ và lọc ôn lại các thẻ chưa thuộc.',
    badge: 'Lật thẻ SRS • Mở bài',
    icon: Layers,
  },
  {
    id: 'dictation',
    title: 'Chép chính tả',
    subtitle: 'Luyện nghe & Gõ từ',
    description: 'Lắng nghe phát âm tiếng Nhật chuẩn và gõ lại chính xác từ tượng thanh, tượng hình tương ứng.',
    badge: 'Nghe & Gõ từ',
    icon: Headphones,
  },
  {
    id: 'exercise',
    title: 'Bài tập',
    subtitle: 'Ứng dụng câu ví dụ',
    description: 'Đọc hiểu ngữ cảnh câu văn và điền từ thích hợp vào chỗ trống để hiểu sâu sắc thái biểu cảm.',
    badge: 'Điền từ vào câu',
    icon: PencilLine,
  },
] as const;

const progressKey = 'jlptn3:v1:onomatopoeia-completed-lessons';
type Data = OnomatopoeiaBook & { sourceTotal?: number; lockedCount?: number };

export default function OnomatopoeiaStudy({ data }: { data: Data }) {
  const [mode, setMode] = useState<'list' | 'flashcards' | PracticeMode | null>(null);
  const [section, setSection] = useState<string | null>(null);
  const [completed, setCompleted] = useState<string[]>([]);
  const [ready, setReady] = useState(false);
  const [notice, setNotice] = useState('');

  useEffect(() => {
    try {
      setCompleted(readCompletedLessons(JSON.parse(localStorage.getItem(progressKey) || '[]'), data.sections));
    } catch {
      setNotice('Không đọc được tiến độ. Bạn vẫn có thể học trong phiên này.');
    }
    setReady(true);
  }, [data.sections]);

  function openLesson(id: string) {
    if (!ready || !unlockedLesson(data.sections, completed, id)) return;
    setSection(id);
    setMode(null); // Ban đầu khi bấm vào bài học thì chỉ hiện danh sách 5 phần
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function completeLesson() {
    if (!section || completed.includes(section) || !unlockedLesson(data.sections, completed, section)) return;
    const next = [...completed, section];
    setCompleted(next);
    try {
      localStorage.setItem(progressKey, JSON.stringify(next));
    } catch {
      setNotice('Tiến độ chỉ được giữ trong phiên này vì trình duyệt không cho phép lưu.');
    }
  }

  const currentIndex = data.sections.findIndex((item) => item.id === section);
  const current = data.sections[currentIndex];
  const nextLesson = data.sections[currentIndex + 1];
  const entries = data.entries.filter((entry) => entry.sectionId === section);
  const isCompleted = section !== null && completed.includes(section);
  const activeModeInfo = modes.find((item) => item.id === mode);

  return (
    <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6 space-y-6">
      {/* Top back navigation */}
      {!current ? (
        <Link
          href="/learn"
          className="inline-flex items-center gap-1.5 text-sm font-semibold text-emerald-800 hover:text-emerald-950 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Về trang Học Chuyên Đề</span>
        </Link>
      ) : !mode ? (
        <button
          type="button"
          onClick={() => {
            setSection(null);
            setMode(null);
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          className="inline-flex items-center gap-1.5 text-sm font-semibold text-emerald-800 hover:text-emerald-950 transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Về lộ trình bài học</span>
        </button>
      ) : null}

      {/* Main Hero Header */}
      <header className="relative overflow-hidden rounded-3xl bg-emerald-950 p-6 sm:p-9 text-white shadow-sm">
        <div
          aria-hidden="true"
          className="absolute -right-8 -top-12 h-52 w-52 rounded-full border-[30px] border-emerald-800/50"
        />
        <div className="relative max-w-2xl space-y-3">
          <p className="text-sm font-semibold tracking-widest text-emerald-200">
            {current ? `オノマトペ · BÀI ${currentIndex + 1}` : 'オノマトペ · HỌC TỪNG BƯỚC'}
          </p>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
            {current ? `Bài ${currentIndex + 1}: ${current.title}` : 'Tượng hình – Tượng thanh'}
          </h1>
          <p className="text-emerald-100 leading-relaxed text-sm sm:text-base">
            {current
              ? `Khám phá ${entries.length} từ vựng tượng hình & tượng thanh thuộc chủ đề "${current.title}". Chọn một phần học bên dưới để bắt đầu luyện tập chuyên sâu.`
              : 'Khám phá những từ diễn tả âm thanh, chuyển động và cảm xúc trong tiếng Nhật. Bắt đầu từ Bài 1, học xong từng bài để mở chặng tiếp theo.'}
          </p>
          <div className="flex flex-wrap gap-2.5 pt-2 text-xs sm:text-sm">
            <span className="rounded-full bg-white/10 px-3 py-1.5 backdrop-blur-sm">
              {current ? `${entries.length} từ vựng` : `${data.entries.length} từ vựng`}
            </span>
            <span className="rounded-full bg-white/10 px-3 py-1.5 backdrop-blur-sm">
              {current ? '5 phần học trong bài' : `${data.sections.length} bài học`}
            </span>
            <span className="rounded-full bg-white/10 px-3 py-1.5 backdrop-blur-sm font-medium">
              {current
                ? isCompleted
                  ? '✓ Đã hoàn thành'
                  : 'Đang học'
                : `${completed.length}/${data.sections.length} bài hoàn thành`}
            </span>
          </div>
        </div>
      </header>

      {notice && (
        <p role="status" className="rounded-xl bg-amber-50 p-4 text-sm text-amber-900 border border-amber-200">
          {notice}
        </p>
      )}

      {/* VIEW 1: LỘ TRÌNH BÀI HỌC (Khi chưa chọn bài) */}
      {!current ? (
        <section aria-label="Lộ trình bài học" className="max-w-3xl mx-auto py-3 space-y-3">
          <div className="space-y-1">
            <h2 className="text-2xl font-extrabold text-slate-900">Lộ trình bài học</h2>
            <p className="text-sm text-slate-600">
              Hoàn thành một lượt trắc nghiệm hoặc ôn hết flashcard để mở khóa bài kế tiếp. Tiến độ được lưu trên trình duyệt này.
            </p>
          </div>

          <ol className="pt-3">
            {data.sections.map((lesson, index) => {
              const unlocked = ready && unlockedLesson(data.sections, completed, lesson.id);
              const done = completed.includes(lesson.id);
              const count = data.entries.filter((entry) => entry.sectionId === lesson.id).length;
              return (
                <li key={lesson.id}>
                  {index > 0 && (
                    <div
                      aria-hidden="true"
                      className={`ml-8 h-8 border-l-4 ${
                        unlocked ? 'border-emerald-400' : 'border-dashed border-slate-200'
                      }`}
                    />
                  )}
                  <button
                    disabled={!unlocked}
                    onClick={() => openLesson(lesson.id)}
                    className={`w-full flex items-center gap-4 sm:gap-6 rounded-2xl border-2 p-5 sm:p-6 text-left transition-all ${
                      done
                        ? 'border-emerald-200 bg-emerald-50/70 hover:bg-emerald-100/70'
                        : unlocked
                        ? 'border-emerald-600 bg-white shadow-sm hover:bg-emerald-50/60 hover:shadow-md'
                        : 'border-slate-200 bg-slate-50 text-slate-400 cursor-not-allowed'
                    }`}
                  >
                    <span
                      className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl text-xl font-bold shadow-sm ${
                        unlocked ? 'bg-emerald-700 text-white' : 'bg-slate-200 text-slate-500'
                      }`}
                    >
                      {done ? <CheckCircle2 className="w-7 h-7" aria-hidden="true" /> : unlocked ? index + 1 : <LockKeyhole className="w-6 h-6" aria-hidden="true" />}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block text-xl font-bold text-slate-900">Bài {index + 1}</span>
                      <span className="mt-1 block text-sm text-slate-600 font-medium">
                        {lesson.title} · {count} từ vựng
                      </span>
                      <span
                        className={`mt-2.5 block text-xs sm:text-sm font-semibold ${
                          unlocked ? 'text-emerald-800' : 'text-slate-400'
                        }`}
                      >
                        {!ready
                          ? 'Đang tải tiến độ…'
                          : done
                          ? 'Đã hoàn thành · Bấm để học lại'
                          : unlocked
                          ? 'Vào học bài này →'
                          : `Hoàn thành Bài ${index} để mở khóa`}
                      </span>
                    </span>
                  </button>
                </li>
              );
            })}
          </ol>
        </section>
      ) : !mode ? (
        /* VIEW 2: MENU CHỌN PHẦN HỌC BAN ĐẦU CỦA BÀI (Chỉ hiện các phần học, chưa vào chi tiết) */
        <section aria-label="Menu chọn phần học" className="space-y-6">
          {/* Status banner */}
          <div
            className="rounded-2xl border border-emerald-200 bg-emerald-50/90 p-4 text-sm text-emerald-950 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-sm"
            role="status"
          >
            <div className="flex items-start sm:items-center gap-3">
              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-emerald-700 text-white font-bold text-xs mt-0.5 sm:mt-0">
                {isCompleted ? '✓' : 'i'}
              </span>
              <div>
                <p className="font-bold text-emerald-950">
                  {isCompleted ? 'Bài này đã hoàn thành!' : 'Chọn một phần học bên dưới để bắt đầu:'}
                </p>
                <p className="text-xs sm:text-sm text-emerald-800/90 mt-0.5">
                  {isCompleted
                    ? 'Bạn có thể chọn bất kỳ phần nào bên dưới để ôn luyện củng cố kiến thức.'
                    : 'Hoàn thành 1 lượt trắc nghiệm hoặc ôn hết flashcard để tính hoàn thành bài và mở khóa bài tiếp theo.'}
                </p>
              </div>
            </div>

            {isCompleted && nextLesson && (
              <button
                type="button"
                onClick={() => openLesson(nextLesson.id)}
                className="self-start sm:self-auto inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-800 hover:bg-emerald-900 text-white text-xs sm:text-sm font-bold shadow-sm transition-all active:scale-95 shrink-0"
              >
                <span>Vào Bài {currentIndex + 2}</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Grid 5 phần học */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-lg sm:text-xl font-bold text-slate-900 flex items-center gap-2">
                <span>Chọn nội dung học của Bài {currentIndex + 1}</span>
                <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
                  5 phần
                </span>
              </h2>
              <span className="text-xs text-slate-500 hidden sm:inline">
                Bấm vào một phần để mở trang luyện tập riêng
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
              {modes.map((item) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => {
                      setMode(item.id);
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    className="group relative flex flex-col justify-between text-left rounded-3xl border-2 border-slate-200 bg-white p-5 sm:p-6 shadow-sm hover:border-emerald-600 hover:bg-emerald-50/40 hover:shadow-md transition-all active:scale-[0.99] cursor-pointer"
                  >
                    <div className="space-y-3">
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-800 group-hover:bg-emerald-700 group-hover:text-white transition-colors shadow-sm">
                          <Icon className="h-6 w-6" />
                        </div>
                        <span className="rounded-full bg-slate-100 px-3 py-1 text-[11px] font-bold text-slate-600 border border-slate-200 group-hover:border-emerald-300 group-hover:bg-emerald-100 group-hover:text-emerald-900 transition-colors">
                          {item.badge}
                        </span>
                      </div>

                      <div>
                        <h3 className="text-xl font-extrabold text-slate-900 group-hover:text-[#1B5E20] transition-colors">
                          {item.title}
                        </h3>
                        <p className="text-xs font-semibold text-emerald-700 mt-0.5">{item.subtitle}</p>
                      </div>

                      <p className="text-sm text-slate-600 leading-relaxed">
                        {item.description}
                      </p>
                    </div>

                    <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between text-sm font-bold text-emerald-800 group-hover:text-emerald-950">
                      <span>Vào học phần này</span>
                      <span className="flex h-7 w-7 items-center justify-center rounded-full bg-emerald-100 text-emerald-800 group-hover:bg-emerald-700 group-hover:text-white transition-all transform group-hover:translate-x-1">
                        <ChevronRight className="w-4 h-4" />
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Completion banner */}
          {isCompleted && (
            <section className="rounded-3xl border-2 border-emerald-300 bg-gradient-to-r from-emerald-50 to-teal-50 p-6 sm:p-7 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm">
              <div className="space-y-1">
                <h2 className="text-xl font-extrabold text-emerald-950 flex items-center gap-2">
                  <CheckCircle2 className="w-6 h-6 text-emerald-700 shrink-0" />
                  <span>{nextLesson ? `Bài ${currentIndex + 2} đã mở khóa!` : 'Chúc mừng! Bạn đã hoàn thành toàn bộ lộ trình!'}</span>
                </h2>
                <p className="text-sm text-slate-600">
                  {nextLesson
                    ? 'Bạn có thể tiếp tục khám phá bài tiếp theo hoặc ôn luyện thêm các phần của bài hiện tại.'
                    : 'Quay lại các bài học bất cứ lúc nào để tiếp tục củng cố kiến thức từ vựng.'}
                </p>
              </div>
              <button
                type="button"
                onClick={() => (nextLesson ? openLesson(nextLesson.id) : setSection(null))}
                className="rounded-2xl bg-[#1B5E20] hover:bg-[#2E7D32] text-white px-6 py-3.5 font-bold shadow-sm transition-all active:scale-95 shrink-0"
              >
                {nextLesson ? `Vào Bài ${currentIndex + 2} →` : 'Xem lại toàn bộ lộ trình'}
              </button>
            </section>
          )}
        </section>
      ) : (
        /* VIEW 3: TRANG RIÊNG TỪNG PHẦN HỌC (Khi đã bấm vào Danh sách, Trắc nghiệm, Flashcard, v.v.) */
        <section aria-label={`Trang luyện tập: ${activeModeInfo?.title}`} className="space-y-6">
          {/* Breadcrumb & Navigation Bar */}
          <div className="space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-200">
              <nav aria-label="Đường dẫn bài học" className="flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm text-slate-600">
                <button
                  type="button"
                  onClick={() => {
                    setSection(null);
                    setMode(null);
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className="hover:text-emerald-800 transition-colors font-medium cursor-pointer"
                >
                  Lộ trình
                </button>
                <ChevronRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <button
                  type="button"
                  onClick={() => {
                    setMode(null);
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className="hover:text-emerald-800 transition-colors font-semibold text-slate-800 cursor-pointer"
                >
                  Bài {currentIndex + 1}
                </button>
                <ChevronRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <span className="font-extrabold text-[#1B5E20]">{activeModeInfo?.title}</span>
              </nav>

              <button
                type="button"
                onClick={() => {
                  setMode(null);
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-2xl bg-white border-2 border-emerald-600/40 hover:border-emerald-700 hover:bg-emerald-50 text-xs sm:text-sm font-bold text-emerald-900 shadow-sm transition-all active:scale-95 cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Quay lại menu Bài {currentIndex + 1}</span>
              </button>
            </div>

            {/* Quick Switcher Tabs */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  Chuyển nhanh phần học:
                </span>
                <button
                  type="button"
                  onClick={() => {
                    setMode(null);
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className="text-xs font-semibold text-emerald-800 hover:underline cursor-pointer"
                >
                  Xem lại 5 phần dạng thẻ
                </button>
              </div>

              <nav aria-label="Chuyển chế độ học" className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2">
                {modes.map((item) => {
                  const Icon = item.icon;
                  const isActive = mode === item.id;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      aria-pressed={isActive}
                      onClick={() => {
                        setMode(item.id);
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                      }}
                      className={`flex items-center gap-2 rounded-2xl border px-3 py-2.5 text-left text-xs sm:text-sm transition-all cursor-pointer ${
                        isActive
                          ? 'border-emerald-700 bg-emerald-700 text-white font-bold shadow-sm'
                          : 'border-slate-200 bg-white text-slate-700 hover:border-emerald-400 hover:bg-emerald-50/60'
                      }`}
                    >
                      <Icon className={`h-4 w-4 shrink-0 ${isActive ? 'text-white' : 'text-emerald-700'}`} />
                      <span className="truncate">{item.title}</span>
                    </button>
                  );
                })}
              </nav>
            </div>
          </div>

          {/* Subtle reminder */}
          <div className="rounded-2xl border border-emerald-200 bg-emerald-50/70 p-3.5 text-xs sm:text-sm text-emerald-900 flex items-center justify-between gap-3">
            <span>
              {isCompleted
                ? '✓ Bài học này đã hoàn thành. Bạn có thể luyện tập các phần bất cứ lúc nào.'
                : 'Làm hết 1 lượt trắc nghiệm hoặc ôn hết flashcard để hoàn thành bài và mở khóa bài tiếp theo.'}
            </span>
            <button
              type="button"
              onClick={() => {
                setMode(null);
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="text-xs font-bold text-emerald-800 underline shrink-0 hover:text-emerald-950 cursor-pointer"
            >
              Chọn phần khác
            </button>
          </div>

          {/* DEDICATED COMPONENT FOR SELECTED MODE */}
          {mode === 'list' ? (
            <OnomatopoeiaList
              key={section}
              data={{
                ...data,
                entries,
                sourceTotal: data.sourceTotal ?? data.entries.length,
                lockedCount: data.lockedCount ?? 0,
              }}
            />
          ) : mode === 'flashcards' ? (
            <OnomatopoeiaFlashcards
              key={section}
              entries={entries}
              onComplete={completeLesson}
            />
          ) : (
            <OnomatopoeiaPractice
              key={`${mode}:${section}`}
              mode={mode}
              activities={makeActivities(data, entries, mode)}
              onComplete={mode === 'quiz' ? completeLesson : undefined}
            />
          )}

          {/* Bottom navigation */}
          <div className="pt-4 flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-slate-200">
            <button
              type="button"
              onClick={() => {
                setMode(null);
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="inline-flex items-center gap-2 text-sm font-bold text-emerald-800 hover:text-emerald-950 hover:underline cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Quay lại menu các phần học của Bài {currentIndex + 1}</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setSection(null);
                setMode(null);
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="text-xs sm:text-sm text-slate-500 hover:text-slate-800 cursor-pointer"
            >
              Về lộ trình bài học chính
            </button>
          </div>

          {/* Completion banner */}
          {isCompleted && (
            <section className="rounded-3xl border-2 border-emerald-300 bg-emerald-50/80 p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-bold text-emerald-950">
                  {nextLesson ? `Bài ${currentIndex + 2} đã mở khóa!` : 'Bạn đã hoàn thành toàn bộ lộ trình!'}
                </h2>
                <p className="mt-1 text-slate-600 text-sm">
                  {nextLesson
                    ? 'Tiếp tục khám phá những từ mới ở chặng tiếp theo.'
                    : 'Quay lại các bài để tiếp tục củng cố kiến thức.'}
                </p>
              </div>
              <button
                type="button"
                onClick={() => (nextLesson ? openLesson(nextLesson.id) : setSection(null))}
                className="rounded-xl bg-emerald-800 hover:bg-emerald-900 text-white px-5 py-3 font-semibold shrink-0 cursor-pointer transition-all"
              >
                {nextLesson ? `Vào Bài ${currentIndex + 2}` : 'Xem lộ trình'}
              </button>
            </section>
          )}
        </section>
      )}

      {/* Footer info */}
      <footer className="rounded-2xl bg-slate-50 p-5 text-sm text-slate-600 space-y-2 border border-slate-200">
        <p>
          Nguồn:{' '}
          {data.sourceUrl ? (
            <a className="underline text-emerald-800 font-medium" href={data.sourceUrl} target="_blank" rel="noreferrer">
              {data.sourceName}
            </a>
          ) : (
            data.sourceName
          )}
          .{!!data.lockedCount && ` Đã nhập ${data.entries.length} mục công khai; ${data.lockedCount} mục khóa chưa được nhập.`}
        </p>
        <a
          href="/data/learning/onomatopoeia/book-template.json"
          download
          className="inline-block font-semibold text-emerald-800 underline hover:text-emerald-950"
        >
          Tải JSON mẫu để trích xuất sách
        </a>
      </footer>
    </main>
  );
}
