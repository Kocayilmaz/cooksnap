import { test, expect } from "@playwright/test";

test("profil sayfasi ad, dil ve ulke alanlarini gosterir", async ({ page }) => {
  await page.goto("/profile");

  await expect(page.getByRole("heading", { name: "Profil" })).toBeVisible();
  await expect(page.getByPlaceholder("Adın soyadın")).toBeVisible();
  await expect(page.getByRole("button", { name: "Türkçe" })).toBeVisible();
  await expect(page.getByRole("button", { name: "English" })).toBeVisible();
  await expect(page.getByPlaceholder("Örn: Türkiye")).toBeVisible();
});

test("profil bilgileri girilip sayfa yenilenince kalici kalir", async ({ page }) => {
  await page.goto("/profile");

  await page.getByPlaceholder("Adın soyadın").fill("Ayşe Yılmaz");
  await page.getByPlaceholder("Örn: Türkiye").fill("İtalya");
  await page.getByRole("button", { name: "English" }).click();

  await page.reload();

  await expect(page.getByPlaceholder("Adın soyadın")).toHaveValue("Ayşe Yılmaz");
  await expect(page.getByPlaceholder("Örn: Türkiye")).toHaveValue("İtalya");
  await expect(page.getByRole("button", { name: "English" })).toHaveAttribute("aria-pressed", "true");
});

test("Need help bolumu acilip SSS icerigini gosterir", async ({ page }) => {
  await page.goto("/profile");

  await expect(page.getByText("Fotoğraf çekmek zorunda mıyım?")).toBeHidden();

  await page.getByRole("button", { name: /Need help\?/ }).click();

  await expect(page.getByText("Fotoğraf çekmek zorunda mıyım?")).toBeVisible();
  await expect(page.getByText("Verilerim nerede saklanıyor?")).toBeVisible();
});

test("NavBar ile ana sayfa ve profil arasinda gecis yapilabilir", async ({ page }) => {
  await page.goto("/");

  await page.getByRole("link", { name: "Profil" }).click();
  await expect(page).toHaveURL(/\/profile$/);
  await expect(page.getByRole("heading", { name: "Profil" })).toBeVisible();

  await page.getByRole("link", { name: "Ana Sayfa" }).click();
  await expect(page).toHaveURL(/\/$/);
  await expect(page.getByRole("heading", { name: "CookSnap" })).toBeVisible();
});
