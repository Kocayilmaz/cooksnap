import { test, expect } from "@playwright/test";

test("giris sayfasi e-posta/sifre formunu ve yapilandirma uyarisini gosterir", async ({ page }) => {
  await page.goto("/login");

  await expect(page.getByRole("heading", { name: "Giriş yap" })).toBeVisible();
  await expect(page.getByPlaceholder("ornek@eposta.com")).toBeVisible();
  await expect(page.getByPlaceholder("En az 6 karakter")).toBeVisible();
  await expect(page.getByText("Giriş sistemi henüz yapılandırılmadı.")).toBeVisible();
  await expect(page.getByRole("button", { name: "Giriş yap", exact: true }).last()).toBeDisabled();
});

test("hesap olustur moduna gecince baslik ve gonder butonu degisir", async ({ page }) => {
  await page.goto("/login");

  await page.getByRole("button", { name: "Hesap oluştur" }).first().click();

  await expect(page.getByRole("heading", { name: "Hesap oluştur" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Hesap oluştur" }).last()).toBeDisabled();
});

test("NavBar giris yapilmamisken Giris yap linkini gosterir", async ({ page }) => {
  await page.goto("/");

  const loginLink = page.getByRole("link", { name: "Giriş yap" });
  await expect(loginLink).toBeVisible();

  await loginLink.click();
  await expect(page).toHaveURL(/\/login$/);
});
