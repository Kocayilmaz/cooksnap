import { test, expect } from "@playwright/test";
import { setGuestMode } from "./helpers/guestMode";

test.beforeEach(async ({ page }) => {
  await setGuestMode(page);
});

const tinyPngBase64 =
  "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=";

async function mockRecipeResponse(page: import("@playwright/test").Page) {
  await page.route("**/api/recipe", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        recipes: [
          {
            equipment: "oven",
            title: "Fırında Sebzeli Tavuk",
            steps: ["Fırını ısıt", "Malzemeleri hazırla", "Pişir"],
            videoId: null,
          },
        ],
      }),
    });
  });
}

test("anasayfa karsilama mesaji ve Sohbete Basla CTA'sini gosterir", async ({ page }) => {
  await page.goto("/");

  await expect(page.getByRole("heading", { name: "CookSnap" })).toBeVisible();
  await expect(page.getByText("Merhaba!")).toBeVisible();
  await expect(page.getByRole("link", { name: "Sohbete Başla" })).toBeVisible();
  await expect(page.getByText("Son aramaların")).toBeHidden();
  await expect(page.getByText("Favori tariflerin")).toBeHidden();
});

test("Sohbete Basla tiklaninca chat sayfasina gider", async ({ page }) => {
  await page.goto("/");

  await page.getByRole("link", { name: "Sohbete Başla" }).click();

  await expect(page).toHaveURL(/\/chat$/);
});

test("gecmis ve favori tarifler anasayfada kisa onizleme olarak gosterilir", async ({ page }) => {
  await mockRecipeResponse(page);
  await page.goto("/chat");

  await page.locator('input[type="file"]').setInputFiles({
    name: "test.png",
    mimeType: "image/png",
    buffer: Buffer.from(tinyPngBase64, "base64"),
  });
  await page.getByRole("button", { name: "Tarifi getir" }).click();
  await page.getByRole("button", { name: "Favorilere ekle" }).click();

  await page.goto("/");

  await expect(page.getByText("Son aramaların")).toBeVisible();
  await expect(page.getByText("Favori tariflerin")).toBeVisible();
  await expect(page.getByText("Fırında Sebzeli Tavuk", { exact: false }).first()).toBeVisible();
});
