/** Saniyeyi "dk:ss" olarak biçimlendirir — CookingTimer ve SidebarCookingTimer
 * arasında aynı fonksiyon tekrar ediyordu, burada tek yerden paylaşılıyor. */
export function formatTimerDuration(totalSeconds: number): string {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
}

/** Zil sesi için harici dosya eklemek yerine Web Audio API ile kısa bir bip
 * üretilir — ağ isteği/asset gerekmez, tarayıcı desteklemiyorsa sessizce yutulur.
 * CookingTimer ve SidebarCookingTimer'da aynen tekrar ediyordu. */
export function playTimerBeep(): void {
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
