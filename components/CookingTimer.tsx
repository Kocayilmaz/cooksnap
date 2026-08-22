"use client";

import { useEffect, useRef, useState } from "react";
import { Minus, Pause, Play, Plus, RotateCcw, Timer as TimerIcon, X } from "lucide-react";

const MIN_MINUTES = 1;
const MAX_MINUTES = 60;
const DEFAULT_MINUTES = 5;

function formatTime(totalSeconds: number): string {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
}

/** Zil sesi için harici dosya eklemek yerine Web Audio API ile kısa bir bip
 * üretilir — ağ isteği/asset gerekmez, tarayıcı desteklemiyorsa sessizce yutulur. */
function playBeep() {
  try {
    const AudioContextClass =
      window.AudioContext ?? (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    const context = new AudioContextClass();
    const oscillator = context.createOscillator();
    const gain = context.createGain();
    oscillator.frequency.value = 880;
    oscillator.connect(gain);
    gain.connect(context.destination);
    gain.gain.setValueAtTime(0.2, context.currentTime);
    oscillator.start();
    oscillator.stop(context.currentTime + 0.4);
    oscillator.onended = () => context.close();
  } catch {
    // AudioContext desteklenmiyorsa sessizce geç, görsel "Süre doldu!" uyarısı yeterli.
  }
}

/** Mutfakta kullanırken süre tutmak için sağ altta sabit duran zamanlayıcı
 * (bkz. app/chat/page.tsx). Redux'a bağlı değil — sayfa yenilenince sıfırlanması
 * sorun değil, kullanım anlık/mutfak amaçlı. */
export default function CookingTimer() {
  const [isOpen, setIsOpen] = useState(false);
  const [minutes, setMinutes] = useState(DEFAULT_MINUTES);
  const [remainingSeconds, setRemainingSeconds] = useState<number | null>(null);
  const [isRunning, setIsRunning] = useState(false);
  const [isDone, setIsDone] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (!isRunning) return;

    intervalRef.current = setInterval(() => {
      setRemainingSeconds((prev) => {
        if (prev === null) return prev;
        if (prev <= 1) {
          setIsRunning(false);
          setIsDone(true);
          playBeep();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isRunning]);

  const isConfigurable = remainingSeconds === null;

  function handleStart() {
    if (remainingSeconds === null) {
      setRemainingSeconds(minutes * 60);
    }
    setIsDone(false);
    setIsRunning(true);
  }

  function handlePause() {
    setIsRunning(false);
  }

  function handleReset() {
    setIsRunning(false);
    setIsDone(false);
    setRemainingSeconds(null);
  }

  function adjustMinutes(delta: number) {
    setMinutes((prev) => Math.min(MAX_MINUTES, Math.max(MIN_MINUTES, prev + delta)));
  }

  return (
    <div className="fixed bottom-6 right-6 z-20 flex flex-col items-end gap-3">
      {isOpen && (
        <div className="flex w-56 flex-col gap-4 rounded-2xl border border-surface-border bg-surface-card p-4 shadow-md">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-foreground">Zamanlayıcı</span>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              aria-label="Zamanlayıcıyı kapat"
              className="text-surface-text-muted hover:text-brand-orange"
            >
              <X size={16} aria-hidden="true" />
            </button>
          </div>

          <div className="flex items-center justify-center gap-4">
            <button
              type="button"
              onClick={() => adjustMinutes(-1)}
              disabled={!isConfigurable}
              aria-label="Dakikayı azalt"
              className="flex h-8 w-8 items-center justify-center rounded-full border border-surface-border text-foreground hover:border-brand-orange hover:text-brand-orange disabled:cursor-not-allowed disabled:opacity-40"
            >
              <Minus size={14} aria-hidden="true" />
            </button>
            <span className="min-w-16 text-center text-2xl font-semibold text-brand-orange">
              {remainingSeconds === null ? `${minutes}:00` : formatTime(remainingSeconds)}
            </span>
            <button
              type="button"
              onClick={() => adjustMinutes(1)}
              disabled={!isConfigurable}
              aria-label="Dakikayı artır"
              className="flex h-8 w-8 items-center justify-center rounded-full border border-surface-border text-foreground hover:border-brand-orange hover:text-brand-orange disabled:cursor-not-allowed disabled:opacity-40"
            >
              <Plus size={14} aria-hidden="true" />
            </button>
          </div>

          {isDone && (
            <p role="alert" className="text-center text-sm font-medium text-state-error">
              Süre doldu!
            </p>
          )}

          <div className="flex items-center justify-center gap-2">
            {isRunning ? (
              <button
                type="button"
                onClick={handlePause}
                className="flex items-center gap-1.5 rounded-full bg-brand-orange px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-brand-orange-dark"
              >
                <Pause size={14} aria-hidden="true" />
                Duraklat
              </button>
            ) : (
              <button
                type="button"
                onClick={handleStart}
                className="flex items-center gap-1.5 rounded-full bg-brand-orange px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-brand-orange-dark"
              >
                <Play size={14} aria-hidden="true" />
                {remainingSeconds === null ? "Başlat" : "Devam et"}
              </button>
            )}
            <button
              type="button"
              onClick={handleReset}
              aria-label="Zamanlayıcıyı sıfırla"
              className="flex h-9 w-9 items-center justify-center rounded-full border border-surface-border text-foreground hover:border-brand-orange hover:text-brand-orange"
            >
              <RotateCcw size={14} aria-hidden="true" />
            </button>
          </div>
        </div>
      )}

      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        aria-label={isOpen ? "Zamanlayıcıyı kapat" : "Zamanlayıcıyı aç"}
        className="flex h-14 w-14 items-center justify-center rounded-full bg-brand-orange text-white shadow-md transition-colors hover:bg-brand-orange-dark"
      >
        <TimerIcon size={22} aria-hidden="true" />
      </button>
    </div>
  );
}
