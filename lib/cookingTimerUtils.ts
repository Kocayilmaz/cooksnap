/** Saniyeyi "dk:ss" olarak biçimlendirir — CookingTimer ve SidebarCookingTimer
 * arasında aynı fonksiyon tekrar ediyordu, burada tek yerden paylaşılıyor. */
export function formatTimerDuration(totalSeconds: number): string {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
}
