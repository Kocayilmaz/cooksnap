import { test, expect } from "@playwright/test";
import { setGuestMode } from "./helpers/guestMode";

test.beforeEach(async ({ page }) => {
  await setGuestMode(page);
});

test("24 saatten eski kullanim sayaci sayfa yuklendiginde sifirlanir", async ({ page }) => {
  const twoDaysAgo = Date.now() - 2 * 24 * 60 * 60 * 1000;
  await page.addInitScript((lastResetAt) => {
    window.localStorage.setItem(
      "cooksnap:usageCount",
      JSON.stringify({ count: 5, lastResetAt }),
    );
  }, twoDaysAgo);

  await page.goto("/");

  await expect(page.getByText("Ücretsiz modda kullanılan istek: 0")).toBeVisible();
});

test("24 saat dolmadan kullanim sayaci korunur", async ({ page }) => {
  const oneHourAgo = Date.now() - 60 * 60 * 1000;
  await page.addInitScript((lastResetAt) => {
    window.localStorage.setItem(
      "cooksnap:usageCount",
      JSON.stringify({ count: 3, lastResetAt }),
    );
  }, oneHourAgo);

  await page.goto("/");

  await expect(page.getByText("Ücretsiz modda kullanılan istek: 3")).toBeVisible();
});
