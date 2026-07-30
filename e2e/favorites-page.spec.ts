import { test, expect } from "@playwright/test";

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

test("favori yokken bos durum mesaji gosterilir", async ({ page }) => {
  await page.goto("/favorites");

  await expect(page.getByRole("heading", { name: "Favoriler" })).toBeVisible();
  await expect(page.getByText("Henüz favori tarifin yok.")).toBeVisible();
});

test("favorilenen tarif /favorites sayfasinda listelenir ve kaldirilabilir", async ({ page }) => {
  await mockRecipeResponse(page);
  await page.goto("/");
  await page.locator('input[type="file"]').setInputFiles({
    name: "test.png",
    mimeType: "image/png",
    buffer: Buffer.from(tinyPngBase64, "base64"),
  });
  await page.getByRole("button", { name: "Tarifi getir" }).click();
  await page.getByRole("button", { name: "Favorilere ekle" }).click();

  await page.getByRole("link", { name: "Favoriler" }).click();
  await expect(page).toHaveURL(/\/favorites$/);
  await expect(page.getByText("Fırında Sebzeli Tavuk")).toBeVisible();
  await expect(page.getByText("Fırın", { exact: true })).toBeVisible();

  await page.getByRole("button", { name: "Favorilerden çıkar" }).click();
  await expect(page.getByText("Henüz favori tarifin yok.")).toBeVisible();
});
