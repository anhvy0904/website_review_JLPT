"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { TangoMode, TangoWord } from "@/lib/tango";

export function useTangoAudio() {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
  const generation = useRef(0);
  const [status, setStatus] = useState("Bấm Bắt đầu để cho phép phát âm thanh.");
  const stop = useCallback(() => {
    generation.current++;
    if (audioRef.current) { audioRef.current.onerror = null; audioRef.current.onended = null; audioRef.current.pause(); audioRef.current = null; }
    if (utteranceRef.current) { utteranceRef.current.onend = null; utteranceRef.current.onerror = null; utteranceRef.current = null; }
    if (typeof window !== "undefined" && "speechSynthesis" in window) window.speechSynthesis.cancel();
  }, []);

  const play = useCallback((word: TangoWord, mode: TangoMode, speed: number) => {
    stop();
    const token = generation.current;
    const speak = () => {
      if (token !== generation.current) return;
      if (!("speechSynthesis" in window) || !("SpeechSynthesisUtterance" in window)) {
        setStatus("Trình duyệt chưa hỗ trợ đọc tiếng Nhật. Hãy thêm file audio hoặc dùng trình duyệt hỗ trợ giọng Nhật."); return;
      }
      const voices = window.speechSynthesis.getVoices();
      const voice = voices.find((item) => /^ja(?:-|_)/i.test(item.lang) || item.lang === "ja");
      if (voices.length && !voice) { setStatus("Chưa có giọng tiếng Nhật. Hãy cài giọng Nhật cho thiết bị hoặc bổ sung file audio rồi bấm Phát lại."); return; }
      const utterance = new SpeechSynthesisUtterance(mode === "word" ? word.hiragana : word.example.hiragana);
      utterance.lang = "ja-JP"; utterance.rate = speed;
      if (voice) utterance.voice = voice;
      utteranceRef.current = utterance;
      utterance.onend = () => { if (token === generation.current) setStatus("Đã đọc bằng giọng trình duyệt · Alt + R để nghe lại."); };
      utterance.onerror = () => { if (token === generation.current) setStatus("Chưa phát được giọng Nhật. Bấm Phát lại hoặc kiểm tra giọng đọc trên thiết bị."); };
      setStatus("Đang đọc bằng giọng Nhật của trình duyệt…");
      window.speechSynthesis.speak(utterance);
    };
    const path = mode === "word" ? word.wordAudio : word.example.audio;
    if (!path) { speak(); return; }
    const audio = new Audio(path);
    audioRef.current = audio; audio.playbackRate = speed;
    let fallback = false;
    const useFallback = () => { if (fallback || token !== generation.current) return; fallback = true; audio.pause(); speak(); };
    audio.onerror = useFallback;
    audio.onended = () => { if (token === generation.current) setStatus("Đã phát file audio · Alt + R để nghe lại."); };
    setStatus("Đang phát file audio…");
    void audio.play().catch((err: unknown) => {
      if (token !== generation.current) return;
      if (err instanceof DOMException && err.name === "NotAllowedError") setStatus("Trình duyệt chặn tự phát. Bấm Phát lại để cho phép âm thanh.");
      else useFallback();
    });
  }, [stop]);

  useEffect(() => {
    const onHide = () => { if (document.hidden) { stop(); setStatus("Âm thanh đã dừng khi rời tab. Alt + R để nghe lại."); } };
    document.addEventListener("visibilitychange", onHide);
    return () => { document.removeEventListener("visibilitychange", onHide); stop(); };
  }, [stop]);
  return { play, stop, status };
}
