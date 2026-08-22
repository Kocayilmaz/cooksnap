import { test, expect } from "@playwright/test";
import { setGuestMode } from "./helpers/guestMode";

// NOT: /profile artik AuthGate ile korunuyor (bkz. components/AuthGate.tsx) —
// sadece gercekten giris yapmis kullanicilar erisebiliyor, misafir modu
// (setGuestMode) bile yetmiyor. Bu ortamda gercek bir Firebase projesi henuz
// yapilandirilmadigi icin (.env.local yok) gercek girisi e2e'de simule etmek
// mumkun degil — bu yuzden asagidaki testler profil sayfasinin ICERIGINI
// degil, erisim kapisinin dogru calistigini dogruluyor. Gercek Firebase
// baglaninca profil formunun kendisini test eden eski senaryolar geri gelmeli.

test("giris yapilmamisken /profile ziyaret edilince /login'e yonlendirilir", async ({ page }) => {
  await page.goto("/profile");

  await expect(page).toHaveURL(/\/login$/);
});

test("misafir modunda bile /profile ziyaret edilince /login'e yonlendirilir", async ({ page }) => {
  await setGuestMode(page);
  await page.goto("/profile");

  await expect(page).toHaveURL(/\/login$/);
});

test("misafir modunda NavBar'da Profil ve Favoriler linkleri gosterilmez", async ({ page }) => {
  await setGuestMode(page);
  await page.goto("/");

  await expect(page.getByRole("link", { name: "Chat" })).toBeVisible();
  await expect(page.getByRole("link", { name: "Giriş yap" })).toBeVisible();
  await expect(page.getByRole("link", { name: "Profil" })).toHaveCount(0);
  await expect(page.getByRole("link", { name: "Favoriler" })).toHaveCount(0);
});
