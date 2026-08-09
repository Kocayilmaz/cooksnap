import type { Page } from "@playwright/test";

/**
 * Ana sayfa artık AuthGate ile korunuyor (bkz. components/AuthGate.tsx) —
 * gerçek Firebase kimlik doğrulaması bu ortamda henüz mümkün olmadığı için
 * (`.env.local` yok) testler "Şimdilik atla" ile aynı misafir moduna geçiyor.
 * addInitScript, ilk sayfa scripti çalışmadan önce localStorage'a yazdığı
 * için sonraki goto()'da AuthGate zaten misafir modunda başlar.
 */
export async function setGuestMode(page: Page): Promise<void> {
  await page.addInitScript(() => {
    window.localStorage.setItem("cooksnap:guestMode", "true");
  });
}
