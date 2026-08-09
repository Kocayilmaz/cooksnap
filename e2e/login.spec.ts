import { test, expect, type Page } from "@playwright/test";

// Kayan giris/kayit karti icin her iki form da DOM'da birlikte var (animasyon
// yuzunden), aktif olmayani aria-hidden + inert ile isaretleniyor (bkz.
// app/login/page.tsx) — testler bu yuzden her zaman aktif forma scope olur.
function activeForm(page: Page) {
  return page.locator('form:not([aria-hidden="true"])');
}

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

test("NavBar giris yapilmamisken Giris yap linkini gosterir", async ({ page }) => {
  await page.goto("/");

  const loginLink = page.getByRole("link", { name: "Giriş yap" });
  await expect(loginLink).toBeVisible();

  await loginLink.click();
  await expect(page).toHaveURL(/\/login$/);
});
