"use client";

import { useEffect, useRef, useState } from "react";
import { Pause, Play, RotateCcw, Timer as TimerIcon } from "lucide-react";
import { clampMinutes, formatTimerDuration, playTimerBeep } from "@/lib/cookingTimerUtils";

const PRESET_MINUTES = [5, 10, 20];
const DEFAULT_MINUTES = PRESET_MINUTES[0];
const MIN_MINUTES = 1;
const MAX_MINUTES = 180;

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
          playTimerBeep();
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
    const clamped = clampMinutes(minutes, MIN_MINUTES, MAX_MINUTES);
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
          className={`flex h-9 w-9 items-center justify-center rounded-lg ${
            isRunning ? "bg-brand-orange text-white" : "bg-surface-warm text-brand-orange-dark"
          }`}
          title={`Zamanlayıcı: ${formatTimerDuration(remainingSeconds)}`}
        >
          <TimerIcon size={16} aria-hidden="true" />
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-1.5 border-t border-surface-border pt-3">
      <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wide text-surface-text-muted">
        <TimerIcon size={12} aria-hidden="true" />
        Mutfak zamanlayıcısı
      </div>

      <p className="text-center font-mono text-lg font-bold tabular-nums text-brand-orange-dark">
        {formatTimerDuration(remainingSeconds)}
      </p>

      {remainingSeconds === 0 && !isRunning && (
        <p role="alert" className="text-center text-[11px] font-medium text-state-error">
          Süre doldu!
        </p>
      )}

      <div className="flex gap-1">
        {PRESET_MINUTES.map((minutes) => (
          <button
            key={minutes}
            type="button"
            onClick={() => handleSelectPreset(minutes)}
            disabled={isRunning}
            aria-pressed={totalSeconds === minutes * 60}
            className={`flex-1 rounded-md border px-0 py-1 text-[11px] font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-60 ${
              totalSeconds === minutes * 60
                ? "border-brand-orange bg-brand-orange text-white"
                : "border-surface-border bg-surface-warm text-foreground hover:border-brand-orange hover:text-brand-orange-dark"
            }`}
          >
            {minutes} dk
          </button>
        ))}
      </div>

      <div className="flex items-center gap-1">
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
          className="w-full min-w-0 rounded-md border border-surface-border bg-surface-warm px-1.5 py-1 text-center text-[11px] font-semibold text-foreground outline-none focus:border-brand-orange disabled:cursor-not-allowed disabled:opacity-60"
        />
        <span className="shrink-0 text-[11px] text-surface-text-muted">dk</span>
      </div>

      <div className="flex gap-1">
        <button
          type="button"
          onClick={handleToggle}
          className="flex h-7 flex-1 items-center justify-center gap-1 rounded-md bg-brand-orange text-xs font-semibold text-white transition-colors hover:bg-brand-orange-dark"
        >
          {isRunning ? <Pause size={12} aria-hidden="true" /> : <Play size={12} aria-hidden="true" />}
          {isRunning ? "Duraklat" : "Başlat"}
        </button>
        <button
          type="button"
          onClick={handleReset}
          aria-label="Zamanlayıcıyı sıfırla"
          className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md border border-surface-border text-foreground hover:border-brand-orange hover:text-brand-orange-dark"
        >
          <RotateCcw size={12} aria-hidden="true" />
        </button>
      </div>
    </div>
  );
}
