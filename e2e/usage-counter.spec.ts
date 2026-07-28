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

async function submitWithPhoto(page: import("@playwright/test").Page) {
  await page.locator('input[type="file"]').setInputFiles({
    name: "test.png",
    mimeType: "image/png",
    buffer: Buffer.from(tinyPngBase64, "base64"),
  });
  await page.getByRole("button", { name: "Tarifi getir" }).click();
}

test("ücretsiz modda başarılı tarif isteği sayacı artırır", async ({ page }) => {
  await mockRecipeResponse(page);
  await page.goto("/");

  await expect(page.getByText("Ücretsiz modda kullanılan istek: 0")).toBeVisible();

  await submitWithPhoto(page);

  await expect(page.getByText("Ücretsiz modda kullanılan istek: 1")).toBeVisible();
});

test("kullanım sayacı sayfa yenilenince kalıcı kalır", async ({ page }) => {
  await mockRecipeResponse(page);
  await page.goto("/");
  await submitWithPhoto(page);
  await expect(page.getByText("Ücretsiz modda kullanılan istek: 1")).toBeVisible();

  await page.reload();

  await expect(page.getByText("Ücretsiz modda kullanılan istek: 1")).toBeVisible();
});

test("ücretsiz mod limitine ulaşılınca tarif butonu devre dışı kalır", async ({ page }) => {
  await mockRecipeResponse(page);
  await page.addInitScript(() => {
    window.localStorage.setItem("cooksnap:usageCount", "5");
  });
  await page.goto("/");

  await expect(page.getByText("Ücretsiz mod limitine ulaştın (5/5)")).toBeVisible();
  await page.locator('input[type="file"]').setInputFiles({
    name: "test.png",
    mimeType: "image/png",
    buffer: Buffer.from(tinyPngBase64, "base64"),
  });
  await expect(page.getByRole("button", { name: "Tarifi getir" })).toBeDisabled();
});
