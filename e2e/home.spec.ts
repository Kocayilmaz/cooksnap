import { test, expect } from "@playwright/test";

test("ana sayfa fotoğraf, kişi sayısı ve ekipman seçimini gösterir", async ({ page }) => {
  await page.goto("/");

  await expect(page.getByRole("heading", { name: "CookSnap" })).toBeVisible();
  await expect(page.getByText("Fotoğraf yüklemek için tıkla")).toBeVisible();
  await expect(page.getByRole("button", { name: "Tarifi getir" })).toBeVisible();
});

test("kişi sayısı artı/eksi butonlarıyla değişir", async ({ page }) => {
  await page.goto("/");

  const increment = page.getByRole("button", { name: "Kişi sayısını artır" });
  await increment.click();
  await increment.click();

  await expect(page.getByText("4", { exact: true })).toBeVisible();
});

test("tarif butonu fotoğraf seçilene kadar devre dışı kalır", async ({ page }) => {
  await page.goto("/");

  await expect(page.getByRole("button", { name: "Tarifi getir" })).toBeDisabled();
});
