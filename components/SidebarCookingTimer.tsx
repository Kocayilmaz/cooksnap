"use client";

import { useEffect, useRef, useState } from "react";
import { Pause, Play, RotateCcw, Timer as TimerIcon } from "lucide-react";

const PRESET_MINUTES = [5, 10, 20];
const DEFAULT_MINUTES = PRESET_MINUTES[0];
const MIN_MINUTES = 1;
const MAX_MINUTES = 180;

function formatTime(totalSeconds: number): string {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
}

/** Zil sesi için harici dosya eklemek yerine Web Audio API ile kısa bir bip
 * üretilir (bkz. components/CookingTimer.tsx — aynı desen). */
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

interface SidebarCookingTimerProps {
  /** ChatSidebar daraltılmışken (ikon şeridi) true — panel yerine sadece
   * saat ikonu + kalan süre rozeti gösterilir. */
  collapsed?: boolean;
}

/** ChatSidebar'ın altına gömülü mutfak zamanlayıcısı — tarif okurken kolayca
 * süre ayarlamak için (bkz. components/ChatSidebar.tsx). Mobilde sidebar zaten
 * gizli olduğundan, mobil kullanıcılar için ayrı bir kayan buton
 * (components/CookingTimer.tsx) hâlâ mevcut. Redux'a bağlı değil — sayfa
 * yenilenince sıfırlanması sorun değil, kullanım anlık/mutfak amaçlı. */
export default function SidebarCookingTimer({ collapsed }: SidebarCookingTimerProps) {
  const [totalSeconds, setTotalSeconds] = useState(DEFAULT_MINUTES * 60);
  const [remainingSeconds, setRemainingSeconds] = useState(DEFAULT_MINUTES * 60);
  const [isRunning, setIsRunning] = useState(false);
  // Hazır süre butonlarından bağımsız, kullanıcının elle yazdığı dakika
  // değeri — serbestçe yazabilsin diye metin olarak tutulur, sadece
  // commit edilince (blur/Enter) sayıya çevrilip uygulanır.
  const [manualMinutes, setManualMinutes] = useState(String(DEFAULT_MINUTES));
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (!isRunning) return;

    intervalRef.current = setInterval(() => {
      setRemainingSeconds((prev) => {
        if (prev <= 1) {
          setIsRunning(false);
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

  function applyMinutes(minutes: number) {
    const clamped = Math.min(MAX_MINUTES, Math.max(MIN_MINUTES, minutes));
    setTotalSeconds(clamped * 60);
    setRemainingSeconds(clamped * 60);
    setManualMinutes(String(clamped));
  }

  function handleSelectPreset(minutes: number) {
    if (isRunning) return;
    applyMinutes(minutes);
  }

  function handleManualMinutesCommit() {
    if (isRunning) return;
    const parsed = Number(manualMinutes);
    if (!Number.isFinite(parsed) || parsed <= 0) {
      setManualMinutes(String(totalSeconds / 60));
      return;
    }
    applyMinutes(Math.round(parsed));
  }

  function handleToggle() {
    setIsRunning((prev) => !prev);
  }

  function handleReset() {
    setIsRunning(false);
    setRemainingSeconds(totalSeconds);
  }

  if (collapsed) {
    return (
      <div className="relative flex justify-center border-t border-surface-border pt-4">
        <div
          className={`flex h-8 w-8 items-center justify-center rounded-lg ${
            isRunning ? "bg-brand-orange text-white" : "bg-surface-warm text-brand-orange-dark"
          }`}
          title={`Zamanlayıcı: ${formatTime(remainingSeconds)}`}
        >
          <TimerIcon size={16} aria-hidden="true" />
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2 border-t border-surface-border pt-4">
      <div className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wide text-surface-text-muted">
        <TimerIcon size={13} aria-hidden="true" />
        Mutfak zamanlayıcısı
      </div>

      <p className="text-center font-mono text-2xl font-bold tabular-nums text-brand-orange-dark">
        {formatTime(remainingSeconds)}
      </p>

      {remainingSeconds === 0 && !isRunning && (
        <p role="alert" className="text-center text-xs font-medium text-state-error">
          Süre doldu!
        </p>
      )}

      <div className="flex gap-1.5">
        {PRESET_MINUTES.map((minutes) => (
          <button
            key={minutes}
            type="button"
            onClick={() => handleSelectPreset(minutes)}
            disabled={isRunning}
            aria-pressed={totalSeconds === minutes * 60}
            className={`flex-1 rounded-lg border px-0 py-1.5 text-xs font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-60 ${
              totalSeconds === minutes * 60
                ? "border-brand-orange bg-brand-orange text-white"
                : "border-surface-border bg-surface-warm text-foreground hover:border-brand-orange hover:text-brand-orange-dark"
            }`}
          >
            {minutes} dk
          </button>
        ))}
      </div>

      <div className="flex items-center gap-1.5">
        <input
          type="number"
          inputMode="numeric"
          min={MIN_MINUTES}
          max={MAX_MINUTES}
          value={manualMinutes}
          disabled={isRunning}
          onChange={(event) => setManualMinutes(event.target.value)}
          onBlur={handleManualMinutesCommit}
          onKeyDown={(event) => {
            if (event.key !== "Enter") return;
            event.preventDefault();
            handleManualMinutesCommit();
          }}
          aria-label="Zamanlayıcı süresini dakika olarak gir"
          className="w-full min-w-0 rounded-lg border border-surface-border bg-surface-warm px-2 py-1.5 text-center text-xs font-semibold text-foreground outline-none focus:border-brand-orange disabled:cursor-not-allowed disabled:opacity-60"
        />
        <span className="shrink-0 text-xs text-surface-text-muted">dk</span>
      </div>

      <div className="flex gap-1.5">
        <button
          type="button"
          onClick={handleToggle}
          className="flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-brand-orange px-3 py-2 text-sm font-semibold text-white transition-colors hover:bg-brand-orange-dark"
        >
          {isRunning ? <Pause size={14} aria-hidden="true" /> : <Play size={14} aria-hidden="true" />}
          {isRunning ? "Duraklat" : "Başlat"}
        </button>
        <button
          type="button"
          onClick={handleReset}
          aria-label="Zamanlayıcıyı sıfırla"
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-surface-border text-foreground hover:border-brand-orange hover:text-brand-orange-dark"
        >
          <RotateCcw size={14} aria-hidden="true" />
        </button>
      </div>
    </div>
  );
}
