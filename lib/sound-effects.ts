"use client";

/**
 * Thư viện hiệu ứng âm thanh tương tác (Sound Effects) bằng Web Audio API
 * Tự động tổng hợp âm thanh dạng sóng (Synthesizer) trực tiếp trên trình duyệt,
 * độ trễ bằng 0, không cần tải tệp MP3 bên ngoài và tương thích 100% mọi thiết bị.
 */

let sharedAudioCtx: AudioContext | null = null;

function getAudioContext(): AudioContext | null {
  if (typeof window === "undefined") return null;
  const AudioContextClass =
    window.AudioContext ||
    (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
  if (!AudioContextClass) return null;

  try {
    if (!sharedAudioCtx || sharedAudioCtx.state === "closed") {
      sharedAudioCtx = new AudioContextClass();
    }
    if (sharedAudioCtx.state === "suspended") {
      void sharedAudioCtx.resume();
    }
    return sharedAudioCtx;
  } catch {
    return null;
  }
}

/**
 * Phát âm thanh "Ting Ting! ✨" tươi vui, ngân vang khi trả lời đúng
 * (Chuỗi âm 2 nốt Sol 5 -> Đô 6 kèm âm bội tạo tiếng chuông pha lê vui nhộn)
 */
export function playCorrectSound(volume = 0.25) {
  try {
    const ctx = getAudioContext();
    if (!ctx) return;

    const now = ctx.currentTime;

    // --- NỐT 1: "Ting" thứ nhất (G5 ~ 784 Hz) ---
    const osc1 = ctx.createOscillator();
    const gain1 = ctx.createGain();
    osc1.type = "sine";
    osc1.frequency.setValueAtTime(783.99, now);

    // Âm lượng nốt 1: Tăng nhanh 15ms rồi tắt dần
    gain1.gain.setValueAtTime(0.0001, now);
    gain1.gain.linearRampToValueAtTime(volume * 0.85, now + 0.015);
    gain1.gain.exponentialRampToValueAtTime(0.0001, now + 0.25);

    osc1.connect(gain1);
    gain1.connect(ctx.destination);
    osc1.start(now);
    osc1.stop(now + 0.26);

    // --- NỐT 2: "Ting!" thứ hai cao và ngân vang hơn (C6 ~ 1046.5 Hz) ---
    const note2Time = now + 0.11;
    const osc2 = ctx.createOscillator();
    const gain2 = ctx.createGain();
    osc2.type = "sine";
    osc2.frequency.setValueAtTime(1046.5, note2Time);

    // Âm lượng nốt 2: Ngân vang 0.5s tạo cảm giác phần thưởng chiến thắng
    gain2.gain.setValueAtTime(0.0001, note2Time);
    gain2.gain.linearRampToValueAtTime(volume, note2Time + 0.02);
    gain2.gain.exponentialRampToValueAtTime(0.0001, note2Time + 0.55);

    osc2.connect(gain2);
    gain2.connect(ctx.destination);
    osc2.start(note2Time);
    osc2.stop(note2Time + 0.56);

    // --- Âm bội lấp lánh (Harmonic shimmer C7 ~ 2093 Hz) ---
    const oscHarmonic = ctx.createOscillator();
    const gainHarmonic = ctx.createGain();
    oscHarmonic.type = "triangle";
    oscHarmonic.frequency.setValueAtTime(2093, note2Time);

    gainHarmonic.gain.setValueAtTime(0.0001, note2Time);
    gainHarmonic.gain.linearRampToValueAtTime(volume * 0.2, note2Time + 0.02);
    gainHarmonic.gain.exponentialRampToValueAtTime(0.0001, note2Time + 0.35);

    oscHarmonic.connect(gainHarmonic);
    gainHarmonic.connect(ctx.destination);
    oscHarmonic.start(note2Time);
    oscHarmonic.stop(note2Time + 0.36);
  } catch (err) {
    console.debug("playCorrectSound notice:", err);
  }
}

/**
 * Phát âm thanh "Boop-boop / Tịt-tịt ❌" nhẹ nhàng, trầm ấm khi trả lời chưa đúng
 * (Sử dụng sóng triangle ấm áp, trượt tần số nhẹ nhàng để không gây khó chịu)
 */
export function playWrongSound(volume = 0.2) {
  try {
    const ctx = getAudioContext();
    if (!ctx) return;

    const now = ctx.currentTime;

    // --- ÂM 1: Trầm nhẹ (220 Hz trượt xuống 180 Hz) ---
    const osc1 = ctx.createOscillator();
    const gain1 = ctx.createGain();
    osc1.type = "triangle";
    osc1.frequency.setValueAtTime(220, now);
    osc1.frequency.linearRampToValueAtTime(180, now + 0.14);

    gain1.gain.setValueAtTime(0.0001, now);
    gain1.gain.linearRampToValueAtTime(volume, now + 0.015);
    gain1.gain.exponentialRampToValueAtTime(0.0001, now + 0.16);

    osc1.connect(gain1);
    gain1.connect(ctx.destination);
    osc1.start(now);
    osc1.stop(now + 0.17);

    // --- ÂM 2: Trầm tiếp theo (170 Hz trượt xuống 130 Hz) ---
    const note2Time = now + 0.13;
    const osc2 = ctx.createOscillator();
    const gain2 = ctx.createGain();
    osc2.type = "triangle";
    osc2.frequency.setValueAtTime(170, note2Time);
    osc2.frequency.linearRampToValueAtTime(125, note2Time + 0.18);

    gain2.gain.setValueAtTime(0.0001, note2Time);
    gain2.gain.linearRampToValueAtTime(volume * 0.9, note2Time + 0.015);
    gain2.gain.exponentialRampToValueAtTime(0.0001, note2Time + 0.25);

    osc2.connect(gain2);
    gain2.connect(ctx.destination);
    osc2.start(note2Time);
    osc2.stop(note2Time + 0.26);
  } catch (err) {
    console.debug("playWrongSound notice:", err);
  }
}
