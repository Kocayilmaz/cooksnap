import { test, expect } from "@playwright/test";
import { setGuestMode } from "./helpers/guestMode";

// NOT: /favorites artik AuthGate ile korunuyor, misafir modu da yetmiyor —
// bkz. profile.spec.ts basindaki ayni notu. Gercek Firebase baglaninca
// favoriler listesinin icerigini test eden eski senaryolar geri gelmeli.
// Favori EKLEME/CIKARMA akisinin kendisi (ana sayfadaki yildiz butonu,
// /favorites sayfasina gitmeden) hala misafir modunda calisiyor ve
// favorites.spec.ts icinde ayrica test ediliyor.

test("giris yapilmamisken /favorites ziyaret edilince /login'e yonlendirilir", async ({ page }) => {
  await page.goto("/favorites");

  await expect(page).toHaveURL(/\/login$/);
});

test("misafir modunda bile /favorites ziyaret edilince /login'e yonlendirilir", async ({ page }) => {
  await setGuestMode(page);
  await page.goto("/favorites");

  await expect(page).toHaveURL(/\/login$/);
});
