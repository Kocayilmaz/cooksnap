import { test, expect, type Page } from "@playwright/test";

// Kayan giris/kayit karti icin her iki form da DOM'da birlikte var (animasyon
// yuzunden), aktif olmayani aria-hidden + inert ile isaretleniyor (bkz.
// app/login/page.tsx) — testler bu yuzden her zaman aktif forma scope olur.
function activeForm(page: Page) {
  return page.locator('form:not([aria-hidden="true"])');
}

test("giris yapilmamisken herhangi bir sayfa ziyaret edilince /login'e yonlendirilir", async ({ page }) => {
  await page.goto("/");

  await expect(page).toHaveURL(/\/login$/);
});

test("giris sayfasi e-posta/sifre formunu ve yapilandirma uyarisini gosterir", async ({ page }) => {
  await page.goto("/login");

  await expect(page.getByRole("heading", { name: "Giriş yap" })).toBeVisible();
  await expect(activeForm(page).getByLabel("E-posta")).toBeVisible();
  await expect(activeForm(page).getByLabel("Şifre")).toBeVisible();
  await expect(activeForm(page).getByText("Giriş sistemi henüz yapılandırılmadı.")).toBeVisible();
  await expect(activeForm(page).getByRole("button", { name: "Giriş yap" })).toBeDisabled();
});

test("hesap olustur moduna gecince aktif form ve gonder butonu degisir", async ({ page }) => {
  await page.goto("/login");

  await page.getByRole("button", { name: "Hesap oluştur" }).click();

  await expect(page.getByRole("heading", { name: "Hesap oluştur" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Giriş yap" })).toBeHidden();
  await expect(activeForm(page).getByRole("button", { name: "Hesap oluştur" })).toBeDisabled();
});

test("Google ve Facebook ile giris butonlari gosterilir, Firebase yapilandirilmadigi icin devre disi kalir", async ({
  page,
}) => {
  await page.goto("/login");

  const google = activeForm(page).getByRole("button", { name: "Google ile devam et" });
  const facebook = activeForm(page).getByRole("button", { name: "Facebook ile devam et" });

  await expect(google).toBeVisible();
  await expect(facebook).toBeVisible();
  await expect(google).toBeDisabled();
  await expect(facebook).toBeDisabled();
});

test("Simdilik atla tiklaninca misafir olarak sadece ana sayfaya erisim saglanir", async ({ page }) => {
  await page.goto("/login");

  await page.getByRole("button", { name: "Şimdilik atla" }).click();

  await expect(page).toHaveURL(/\/$/);
  await expect(page.getByRole("heading", { name: "CookSnap" })).toBeVisible();
  await expect(page.getByRole("link", { name: "Ana Sayfa" })).toBeVisible();
  await expect(page.getByRole("link", { name: "Profil" })).toHaveCount(0);
  await expect(page.getByRole("link", { name: "Favoriler" })).toHaveCount(0);
});
